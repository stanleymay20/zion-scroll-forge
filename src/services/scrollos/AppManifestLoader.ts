/**
 * AppManifestLoader Service
 * 
 * Manages the dynamic loading, validation, and caching of tool manifests
 * for the ScrollOS academic tools integration system.
 */

import { 
  ToolManifest, 
  AcademicDiscipline, 
  ScrollOSConfig, 
  APIResponse,
  ToolIntegrationError,
  UserContext
} from '../../types/scrollos-tools';

export interface ManifestValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export interface ManifestFilter {
  disciplines?: AcademicDiscipline[];
  categories?: string[];
  permissions?: string[];
  searchTerm?: string;
  userContext?: UserContext;
}

export class AppManifestLoader {
  private manifestCache: Map<string, ToolManifest> = new Map();
  private lastCacheUpdate: Date | null = null;
  private readonly cacheTimeoutMs: number;
  private readonly config: ScrollOSConfig;

  constructor(config: ScrollOSConfig) {
    this.config = config;
    this.cacheTimeoutMs = config.cacheTimeoutMs || 300000; // 5 minutes default
  }

  /**
   * Load all available tool manifests
   */
  async loadAllManifests(): Promise<ToolManifest[]> {
    try {
      // Check cache first
      if (this.isCacheValid()) {
        return Array.from(this.manifestCache.values());
      }

      // Fetch from API
      const response = await fetch(`${this.config.toolManifestUrl}/manifests`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getAuthToken()}`
        }
      });

      if (!response.ok) {
        throw new ToolIntegrationError(
          `Failed to load manifests: ${response.statusText}`,
          'system',
          'MANIFEST_LOAD_FAILED',
          { status: response.status }
        );
      }

      const apiResponse: APIResponse<ToolManifest[]> = await response.json();
      
      if (!apiResponse.success || !apiResponse.data) {
        throw new ToolIntegrationError(
          'Invalid manifest response from server',
          'system',
          'INVALID_MANIFEST_RESPONSE'
        );
      }

      // Validate and cache manifests
      const validManifests: ToolManifest[] = [];
      for (const manifest of apiResponse.data) {
        const validation = this.validateManifest(manifest);
        if (validation.isValid) {
          validManifests.push(manifest);
          this.manifestCache.set(manifest.id, manifest);
        } else {
          console.warn(`Invalid manifest for tool ${manifest.id}:`, validation.errors);
        }
      }

      this.lastCacheUpdate = new Date();
      return validManifests;

    } catch (error) {
      console.error('Failed to load tool manifests:', error);
      throw error;
    }
  }

  /**
   * Load a specific tool manifest by ID
   */
  async loadManifest(toolId: string): Promise<ToolManifest | null> {
    try {
      // Check cache first
      if (this.manifestCache.has(toolId) && this.isCacheValid()) {
        return this.manifestCache.get(toolId)!;
      }

      // Fetch from API
      const response = await fetch(`${this.config.toolManifestUrl}/manifests/${toolId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getAuthToken()}`
        }
      });

      if (response.status === 404) {
        return null;
      }

      if (!response.ok) {
        throw new ToolIntegrationError(
          `Failed to load manifest for ${toolId}: ${response.statusText}`,
          toolId,
          'MANIFEST_LOAD_FAILED',
          { status: response.status }
        );
      }

      const apiResponse: APIResponse<ToolManifest> = await response.json();
      
      if (!apiResponse.success || !apiResponse.data) {
        throw new ToolIntegrationError(
          `Invalid manifest response for tool ${toolId}`,
          toolId,
          'INVALID_MANIFEST_RESPONSE'
        );
      }

      const manifest = apiResponse.data;
      const validation = this.validateManifest(manifest);
      
      if (!validation.isValid) {
        throw new ToolIntegrationError(
          `Invalid manifest for tool ${toolId}: ${validation.errors.join(', ')}`,
          toolId,
          'INVALID_MANIFEST',
          { errors: validation.errors }
        );
      }

      // Cache the manifest
      this.manifestCache.set(toolId, manifest);
      return manifest;

    } catch (error) {
      console.error(`Failed to load manifest for tool ${toolId}:`, error);
      throw error;
    }
  }

  /**
   * Get manifests filtered by criteria
   */
  async getFilteredManifests(filter: ManifestFilter): Promise<ToolManifest[]> {
    const allManifests = await this.loadAllManifests();
    
    return allManifests.filter(manifest => {
      // Filter by disciplines
      if (filter.disciplines && filter.disciplines.length > 0) {
        const manifestDisciplines = [manifest.category, ...(manifest.subcategories || [])];
        if (!filter.disciplines.some(d => manifestDisciplines.includes(d))) {
          return false;
        }
      }

      // Filter by categories (alternative to disciplines)
      if (filter.categories && filter.categories.length > 0) {
        if (!filter.categories.includes(manifest.category)) {
          return false;
        }
      }

      // Filter by user permissions
      if (filter.userContext && filter.permissions) {
        const userPermissions = filter.userContext.permissions.map(p => p.action);
        const requiredPermissions = manifest.permissions.map(p => p.action);
        if (!requiredPermissions.every(p => userPermissions.includes(p))) {
          return false;
        }
      }

      // Filter by search term
      if (filter.searchTerm) {
        const searchLower = filter.searchTerm.toLowerCase();
        const searchableText = [
          manifest.name,
          manifest.displayName,
          manifest.description,
          manifest.category,
          ...(manifest.subcategories || [])
        ].join(' ').toLowerCase();
        
        if (!searchableText.includes(searchLower)) {
          return false;
        }
      }

      return true;
    });
  }

  /**
   * Get manifests for a specific academic discipline
   */
  async getManifestsForDiscipline(discipline: AcademicDiscipline): Promise<ToolManifest[]> {
    return this.getFilteredManifests({ disciplines: [discipline] });
  }

  /**
   * Get manifests available to a specific user
   */
  async getManifestsForUser(userContext: UserContext): Promise<ToolManifest[]> {
    const disciplines = [
      userContext.declaredMajor,
      ...(userContext.minors || [])
    ].filter(Boolean) as AcademicDiscipline[];

    return this.getFilteredManifests({
      disciplines,
      userContext
    });
  }

  /**
   * Validate a tool manifest
   */
  validateManifest(manifest: any): ManifestValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Required fields validation
    const requiredFields = [
      'id', 'name', 'displayName', 'description', 'version', 
      'category', 'integrationMethod', 'permissions'
    ];

    for (const field of requiredFields) {
      if (!manifest[field]) {
        errors.push(`Missing required field: ${field}`);
      }
    }

    // ID validation
    if (manifest.id && !/^[a-z0-9-]+$/.test(manifest.id)) {
      errors.push('Tool ID must contain only lowercase letters, numbers, and hyphens');
    }

    // Version validation
    if (manifest.version && !/^\d+\.\d+\.\d+/.test(manifest.version)) {
      warnings.push('Version should follow semantic versioning (x.y.z)');
    }

    // Integration method validation
    const validIntegrationMethods = ['iframe', 'api', 'rpc', 'embed'];
    if (manifest.integrationMethod && !validIntegrationMethods.includes(manifest.integrationMethod)) {
      errors.push(`Invalid integration method: ${manifest.integrationMethod}`);
    }

    // URL validation for iframe integration
    if (manifest.integrationMethod === 'iframe' && !manifest.url) {
      errors.push('iframe integration requires a URL');
    }

    // API endpoint validation for API integration
    if (manifest.integrationMethod === 'api' && !manifest.apiEndpoint) {
      errors.push('API integration requires an API endpoint');
    }

    // Permissions validation
    if (manifest.permissions && Array.isArray(manifest.permissions)) {
      for (const permission of manifest.permissions) {
        if (!permission.action || !permission.resource) {
          errors.push('Each permission must have action and resource fields');
        }
      }
    } else if (manifest.permissions) {
      errors.push('Permissions must be an array');
    }

    // AI agents validation
    if (manifest.aiAgents && Array.isArray(manifest.aiAgents)) {
      const validAgents = ['ScrollTutor', 'ScrollResearcher', 'ScrollBuilder', 'ScrollProfessor'];
      for (const agent of manifest.aiAgents) {
        if (!validAgents.includes(agent)) {
          warnings.push(`Unknown AI agent type: ${agent}`);
        }
      }
    }

    // File formats validation
    if (manifest.supportedFormats && !Array.isArray(manifest.supportedFormats)) {
      warnings.push('supportedFormats should be an array');
    }

    // Cross-tool compatibility validation
    if (manifest.crossToolCompatibility && !Array.isArray(manifest.crossToolCompatibility)) {
      warnings.push('crossToolCompatibility should be an array of tool IDs');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Register a new tool manifest (for dynamic tool addition)
   */
  async registerManifest(manifest: ToolManifest): Promise<boolean> {
    try {
      // Validate the manifest
      const validation = this.validateManifest(manifest);
      if (!validation.isValid) {
        throw new ToolIntegrationError(
          `Invalid manifest: ${validation.errors.join(', ')}`,
          manifest.id,
          'INVALID_MANIFEST',
          { errors: validation.errors }
        );
      }

      // Send to server
      const response = await fetch(`${this.config.toolManifestUrl}/manifests`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getAuthToken()}`
        },
        body: JSON.stringify(manifest)
      });

      if (!response.ok) {
        throw new ToolIntegrationError(
          `Failed to register manifest: ${response.statusText}`,
          manifest.id,
          'MANIFEST_REGISTRATION_FAILED',
          { status: response.status }
        );
      }

      // Update cache
      this.manifestCache.set(manifest.id, manifest);
      return true;

    } catch (error) {
      console.error(`Failed to register manifest for ${manifest.id}:`, error);
      throw error;
    }
  }

  /**
   * Update an existing tool manifest
   */
  async updateManifest(toolId: string, updates: Partial<ToolManifest>): Promise<boolean> {
    try {
      const response = await fetch(`${this.config.toolManifestUrl}/manifests/${toolId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getAuthToken()}`
        },
        body: JSON.stringify(updates)
      });

      if (!response.ok) {
        throw new ToolIntegrationError(
          `Failed to update manifest: ${response.statusText}`,
          toolId,
          'MANIFEST_UPDATE_FAILED',
          { status: response.status }
        );
      }

      // Remove from cache to force reload
      this.manifestCache.delete(toolId);
      return true;

    } catch (error) {
      console.error(`Failed to update manifest for ${toolId}:`, error);
      throw error;
    }
  }

  /**
   * Remove a tool manifest
   */
  async removeManifest(toolId: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.config.toolManifestUrl}/manifests/${toolId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${this.getAuthToken()}`
        }
      });

      if (!response.ok) {
        throw new ToolIntegrationError(
          `Failed to remove manifest: ${response.statusText}`,
          toolId,
          'MANIFEST_REMOVAL_FAILED',
          { status: response.status }
        );
      }

      // Remove from cache
      this.manifestCache.delete(toolId);
      return true;

    } catch (error) {
      console.error(`Failed to remove manifest for ${toolId}:`, error);
      throw error;
    }
  }

  /**
   * Clear the manifest cache
   */
  clearCache(): void {
    this.manifestCache.clear();
    this.lastCacheUpdate = null;
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): { size: number; lastUpdate: Date | null; isValid: boolean } {
    return {
      size: this.manifestCache.size,
      lastUpdate: this.lastCacheUpdate,
      isValid: this.isCacheValid()
    };
  }

  /**
   * Check if the cache is still valid
   */
  private isCacheValid(): boolean {
    if (!this.lastCacheUpdate) {
      return false;
    }
    
    const now = new Date();
    const cacheAge = now.getTime() - this.lastCacheUpdate.getTime();
    return cacheAge < this.cacheTimeoutMs;
  }

  /**
   * Get authentication token for API requests
   */
  private getAuthToken(): string {
    // In a real implementation, this would get the token from the auth service
    // For now, return a placeholder
    return process.env.SCROLLOS_API_TOKEN || 'placeholder-token';
  }

  /**
   * Get manifest categories for UI organization
   */
  async getManifestCategories(): Promise<{ category: AcademicDiscipline; count: number }[]> {
    const manifests = await this.loadAllManifests();
    const categoryCount = new Map<AcademicDiscipline, number>();

    for (const manifest of manifests) {
      const current = categoryCount.get(manifest.category) || 0;
      categoryCount.set(manifest.category, current + 1);
    }

    return Array.from(categoryCount.entries()).map(([category, count]) => ({
      category,
      count
    }));
  }

  /**
   * Search manifests with advanced filtering
   */
  async searchManifests(query: string, options?: {
    disciplines?: AcademicDiscipline[];
    limit?: number;
    includeDescriptions?: boolean;
  }): Promise<ToolManifest[]> {
    const manifests = await this.loadAllManifests();
    const limit = options?.limit || 50;
    const includeDescriptions = options?.includeDescriptions ?? true;

    const searchResults = manifests
      .filter(manifest => {
        // Filter by disciplines if specified
        if (options?.disciplines && options.disciplines.length > 0) {
          const manifestDisciplines = [manifest.category, ...(manifest.subcategories || [])];
          if (!options.disciplines.some(d => manifestDisciplines.includes(d))) {
            return false;
          }
        }

        // Search in name, display name, and optionally description
        const searchFields = [manifest.name, manifest.displayName];
        if (includeDescriptions) {
          searchFields.push(manifest.description);
        }

        const searchText = searchFields.join(' ').toLowerCase();
        return searchText.includes(query.toLowerCase());
      })
      .slice(0, limit);

    return searchResults;
  }
}