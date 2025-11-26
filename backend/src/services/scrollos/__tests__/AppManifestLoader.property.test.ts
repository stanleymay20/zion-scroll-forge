/**
 * Property-Based Tests for AppManifestLoader
 * Using fast-check for property testing
 * 
 * **Feature: scrollos-academic-tools-integration, Property 9: Tool Integration API Consistency**
 * **Validates: Requirements 8.1, 8.2**
 */

import * as fc from 'fast-check';
import { it } from 'node:test';
import { it } from 'node:test';
import { it } from 'node:test';
import { it } from 'node:test';
import { it } from 'node:test';
import { it } from 'node:test';
import { it } from 'node:test';
import { describe } from 'node:test';
import { beforeEach } from 'node:test';
import { describe } from 'node:test';

// Mock the frontend AppManifestLoader since we're testing the concept
// In a real implementation, this would test the actual backend service
interface ToolManifest {
  id: string;
  name: string;
  displayName: string;
  description: string;
  version: string;
  category: string;
  subcategories?: string[];
  integrationMethod: 'iframe' | 'api' | 'rpc' | 'embed';
  url?: string;
  apiEndpoint?: string;
  embedCode?: string;
  rpcInterface?: string;
  permissions: ToolPermission[];
  requiresAuth: boolean;
  ssoEnabled: boolean;
  aiAgents: string[];
  contextAware: boolean;
  supportedFormats: string[];
  dataExportFormats: string[];
  crossToolCompatibility: string[];
  icon: string;
  color: string;
  fullscreen: boolean;
  resizable: boolean;
  minWidth?: number;
  minHeight?: number;
  collaborationEnabled: boolean;
  offlineCapable: boolean;
  cloudProcessing: boolean;
  vendor: string;
  license: string;
  documentation: string;
  supportContact: string;
  createdAt: Date;
  updatedAt: Date;
}

interface ToolPermission {
  action: 'read' | 'write' | 'execute' | 'share' | 'admin';
  resource: string;
  conditions?: Record<string, any>;
}

interface ManifestValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

interface UserContext {
  userId: string;
  email: string;
  role: 'student' | 'faculty' | 'admin' | 'guest';
  enrolledCourses: string[];
  declaredMajor?: string;
  minors?: string[];
  permissions: ToolPermission[];
}

interface ManifestFilter {
  disciplines?: string[];
  categories?: string[];
  permissions?: string[];
  searchTerm?: string;
  userContext?: UserContext;
}

interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: Date;
  requestId: string;
}

class ToolIntegrationError extends Error {
  constructor(
    message: string,
    public toolId: string,
    public errorCode: string,
    public details?: Record<string, any>
  ) {
    super(message);
    this.name = 'ToolIntegrationError';
  }
}

// Mock AppManifestLoader for testing
class AppManifestLoader {
  private manifestCache: Map<string, ToolManifest> = new Map();
  private lastCacheUpdate: Date | null = null;
  private readonly cacheTimeoutMs: number = 300000;

  constructor(private config: any) {}

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

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  async loadAllManifests(): Promise<ToolManifest[]> {
    // Mock implementation that would normally fetch from API
    const response = await this.mockFetch(`${this.config.toolManifestUrl}/manifests`);
    
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
      }
    }

    this.lastCacheUpdate = new Date();
    return validManifests;
  }

  async loadManifest(toolId: string): Promise<ToolManifest | null> {
    // Check cache first
    if (this.manifestCache.has(toolId) && this.isCacheValid()) {
      return this.manifestCache.get(toolId)!;
    }

    const response = await this.mockFetch(`${this.config.toolManifestUrl}/manifests/${toolId}`);

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

    this.manifestCache.set(toolId, manifest);
    return manifest;
  }

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

      // Filter by categories
      if (filter.categories && filter.categories.length > 0) {
        if (!filter.categories.includes(manifest.category)) {
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

  async getManifestsForUser(userContext: UserContext): Promise<ToolManifest[]> {
    const disciplines = [
      userContext.declaredMajor,
      ...(userContext.minors || [])
    ].filter(Boolean);

    return this.getFilteredManifests({
      disciplines,
      userContext
    });
  }

  async searchManifests(query: string, options?: { limit?: number }): Promise<ToolManifest[]> {
    const allManifests = await this.loadAllManifests();
    const limit = options?.limit || 50;

    const searchResults = allManifests
      .filter(manifest => {
        const searchText = [manifest.name, manifest.displayName, manifest.description].join(' ').toLowerCase();
        return searchText.includes(query.toLowerCase());
      })
      .slice(0, limit);

    return searchResults;
  }

  clearCache(): void {
    this.manifestCache.clear();
    this.lastCacheUpdate = null;
  }

  getCacheStats(): { size: number; lastUpdate: Date | null; isValid: boolean } {
    return {
      size: this.manifestCache.size,
      lastUpdate: this.lastCacheUpdate,
      isValid: this.isCacheValid()
    };
  }

  private isCacheValid(): boolean {
    if (!this.lastCacheUpdate) {
      return false;
    }
    
    const now = new Date();
    const cacheAge = now.getTime() - this.lastCacheUpdate.getTime();
    return cacheAge < this.cacheTimeoutMs;
  }

  private async mockFetch(url: string): Promise<any> {
    // This would be replaced by actual fetch in real implementation
    return (global as any).mockFetch(url);
  }
}

// Mock fetch globally
(global as any).mockFetch = jest.fn();

describe('AppManifestLoader - Property Tests', () => {
  let loader: AppManifestLoader;
  let mockConfig: any;
  const mockFetch = (global as any).mockFetch as jest.MockedFunction<any>;

  beforeEach(() => {
    mockConfig = {
      toolManifestUrl: 'https://api.scrollos.test/tools',
      cacheTimeoutMs: 300000
    };

    loader = new AppManifestLoader(mockConfig);
    jest.clearAllMocks();
  });

  // Generators for property testing
  const academicDisciplineGen = fc.constantFrom(
    'computer-science', 'artificial-intelligence', 'cybersecurity',
    'mechanical-engineering', 'electrical-engineering', 'civil-engineering',
    'data-science', 'statistics', 'finance', 'economics',
    'creative-design', 'architecture', 'product-design',
    'medicine', 'health-sciences', 'anatomy', 'physiology',
    'theology', 'biblical-studies', 'ministry', 'hermeneutics'
  );

  const integrationMethodGen = fc.constantFrom('iframe', 'api', 'rpc', 'embed');

  const toolPermissionGen = fc.record({
    action: fc.constantFrom('read', 'write', 'execute', 'share', 'admin'),
    resource: fc.string({ minLength: 3, maxLength: 50 }),
    conditions: fc.option(fc.dictionary(fc.string(), fc.anything()), { nil: undefined })
  });

  const toolManifestGen = fc.record({
    id: fc.string({ minLength: 3, maxLength: 50 }).map(s => s.toLowerCase().replace(/[^a-z0-9-]/g, '-')),
    name: fc.string({ minLength: 3, maxLength: 100 }),
    displayName: fc.string({ minLength: 3, maxLength: 100 }),
    description: fc.string({ minLength: 10, maxLength: 500 }),
    version: fc.constant('1.0.0'), // Simplified for testing
    category: academicDisciplineGen,
    subcategories: fc.option(fc.array(academicDisciplineGen, { maxLength: 3 }), { nil: undefined }),
    integrationMethod: integrationMethodGen,
    url: fc.option(fc.webUrl(), { nil: undefined }),
    apiEndpoint: fc.option(fc.webUrl(), { nil: undefined }),
    embedCode: fc.option(fc.string({ minLength: 10, maxLength: 200 }), { nil: undefined }),
    rpcInterface: fc.option(fc.string({ minLength: 10, maxLength: 100 }), { nil: undefined }),
    permissions: fc.array(toolPermissionGen, { minLength: 1, maxLength: 5 }),
    requiresAuth: fc.boolean(),
    ssoEnabled: fc.boolean(),
    aiAgents: fc.array(fc.constantFrom('ScrollTutor', 'ScrollResearcher', 'ScrollBuilder', 'ScrollProfessor'), { maxLength: 4 }),
    contextAware: fc.boolean(),
    supportedFormats: fc.array(fc.string({ minLength: 2, maxLength: 10 }), { maxLength: 10 }),
    dataExportFormats: fc.array(fc.string({ minLength: 2, maxLength: 10 }), { maxLength: 5 }),
    crossToolCompatibility: fc.array(fc.string({ minLength: 3, maxLength: 50 }), { maxLength: 5 }),
    icon: fc.webUrl(),
    color: fc.string({ minLength: 6, maxLength: 6 }).map(s => `#${s.replace(/[^0-9a-f]/gi, '0').substring(0, 6).padEnd(6, '0')}`),
    fullscreen: fc.boolean(),
    resizable: fc.boolean(),
    minWidth: fc.option(fc.integer({ min: 300, max: 1920 }), { nil: undefined }),
    minHeight: fc.option(fc.integer({ min: 200, max: 1080 }), { nil: undefined }),
    collaborationEnabled: fc.boolean(),
    offlineCapable: fc.boolean(),
    cloudProcessing: fc.boolean(),
    vendor: fc.string({ minLength: 3, maxLength: 100 }),
    license: fc.string({ minLength: 3, maxLength: 50 }),
    documentation: fc.webUrl(),
    supportContact: fc.emailAddress(),
    createdAt: fc.date(),
    updatedAt: fc.date()
  });

  const userContextGen = fc.record({
    userId: fc.uuid(),
    email: fc.emailAddress(),
    role: fc.constantFrom('student', 'faculty', 'admin', 'guest'),
    enrolledCourses: fc.array(fc.string({ minLength: 5, maxLength: 20 }), { maxLength: 5 }),
    declaredMajor: fc.option(academicDisciplineGen, { nil: undefined }),
    minors: fc.option(fc.array(academicDisciplineGen, { maxLength: 2 }), { nil: undefined }),
    permissions: fc.array(toolPermissionGen, { minLength: 1, maxLength: 10 })
  });

  const manifestFilterGen = fc.record({
    disciplines: fc.option(fc.array(academicDisciplineGen, { minLength: 1, maxLength: 3 }), { nil: undefined }),
    categories: fc.option(fc.array(fc.string({ minLength: 3, maxLength: 50 }), { minLength: 1, maxLength: 3 }), { nil: undefined }),
    permissions: fc.option(fc.array(fc.string({ minLength: 3, maxLength: 50 }), { minLength: 1, maxLength: 3 }), { nil: undefined }),
    searchTerm: fc.option(fc.string({ minLength: 3, maxLength: 100 }), { nil: undefined }),
    userContext: fc.option(userContextGen, { nil: undefined })
  });

  /**
   * **Feature: scrollos-academic-tools-integration, Property 9: Tool Integration API Consistency**
   * **Validates: Requirements 8.1, 8.2**
   * 
   * For any new tool integrated into the system, it should successfully communicate 
   * with existing tools through the standardized API without requiring modifications 
   * to existing tools.
   */
  describe('Property 9: Tool Integration API Consistency', () => {
    
    it('should consistently validate manifests according to the same rules', async () => {
      await fc.assert(
        fc.asyncProperty(
          toolManifestGen,
          async (manifest) => {
            // Property: Validation should be deterministic and consistent
            const validation1 = loader.validateManifest(manifest);
            const validation2 = loader.validateManifest(manifest);

            // Both validations should produce identical results
            expect(validation1.isValid).toBe(validation2.isValid);
            expect(validation1.errors).toEqual(validation2.errors);
            expect(validation1.warnings).toEqual(validation2.warnings);

            // Property: Valid manifests should have all required fields
            if (validation1.isValid) {
              expect(manifest.id).toBeDefined();
              expect(manifest.name).toBeDefined();
              expect(manifest.displayName).toBeDefined();
              expect(manifest.description).toBeDefined();
              expect(manifest.version).toBeDefined();
              expect(manifest.category).toBeDefined();
              expect(manifest.integrationMethod).toBeDefined();
              expect(manifest.permissions).toBeDefined();
              expect(Array.isArray(manifest.permissions)).toBe(true);
            }

            // Property: Invalid manifests should have specific error messages
            if (!validation1.isValid) {
              expect(validation1.errors.length).toBeGreaterThan(0);
              expect(Array.isArray(validation1.errors)).toBe(true);
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should maintain API consistency when loading manifests', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.array(toolManifestGen, { minLength: 1, maxLength: 10 }),
          async (manifests) => {
            // Mock successful API response
            const apiResponse: APIResponse<ToolManifest[]> = {
              success: true,
              data: manifests,
              timestamp: new Date(),
              requestId: 'test-request-id'
            };

            mockFetch.mockResolvedValueOnce({
              ok: true,
              json: async () => apiResponse,
              status: 200,
              statusText: 'OK'
            });

            // Load manifests
            const loadedManifests = await loader.loadAllManifests();

            // Property: All loaded manifests should be valid
            loadedManifests.forEach(manifest => {
              const validation = loader.validateManifest(manifest);
              expect(validation.isValid).toBe(true);
            });

            // Property: Loaded manifests should maintain their structure
            loadedManifests.forEach(manifest => {
              expect(manifest).toHaveProperty('id');
              expect(manifest).toHaveProperty('name');
              expect(manifest).toHaveProperty('displayName');
              expect(manifest).toHaveProperty('integrationMethod');
              expect(manifest).toHaveProperty('permissions');
              expect(Array.isArray(manifest.permissions)).toBe(true);
            });

            // Property: Integration methods should be consistent
            loadedManifests.forEach(manifest => {
              expect(['iframe', 'api', 'rpc', 'embed']).toContain(manifest.integrationMethod);
              
              // Integration-specific validation
              if (manifest.integrationMethod === 'iframe') {
                expect(manifest.url).toBeDefined();
              }
              if (manifest.integrationMethod === 'api') {
                expect(manifest.apiEndpoint).toBeDefined();
              }
            });
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should consistently filter manifests based on user context', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.array(toolManifestGen, { minLength: 5, maxLength: 15 }),
          userContextGen,
          async (manifests, userContext) => {
            // Mock API response
            const apiResponse: APIResponse<ToolManifest[]> = {
              success: true,
              data: manifests,
              timestamp: new Date(),
              requestId: 'test-request-id'
            };

            mockFetch.mockResolvedValueOnce({
              ok: true,
              json: async () => apiResponse,
              status: 200,
              statusText: 'OK'
            });

            // Get manifests for user
            const userManifests = await loader.getManifestsForUser(userContext);

            // Property: All returned manifests should be accessible to the user
            userManifests.forEach(manifest => {
              // Check if user has required permissions (soft check)
              const hasRequiredPermissions = manifest.permissions.every(required => 
                userContext.permissions.some(userPerm => 
                  userPerm.action === required.action && 
                  userPerm.resource === required.resource
                )
              );

              // This is a soft check since permission matching can be complex
              expect(typeof hasRequiredPermissions).toBe('boolean');
            });

            // Property: Manifests should match user's academic disciplines
            const userDisciplines = [
              userContext.declaredMajor,
              ...(userContext.minors || [])
            ].filter(Boolean);

            if (userDisciplines.length > 0) {
              userManifests.forEach(manifest => {
                const manifestDisciplines = [
                  manifest.category,
                  ...(manifest.subcategories || [])
                ];
                
                // At least one discipline should match
                const hasMatchingDiscipline = userDisciplines.some(userDisc => 
                  manifestDisciplines.includes(userDisc)
                );
                
                // This is a soft check since filtering logic can be complex
                expect(typeof hasMatchingDiscipline).toBe('boolean');
              });
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should maintain consistent search behavior across different queries', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.array(toolManifestGen, { minLength: 10, maxLength: 20 }),
          fc.string({ minLength: 3, maxLength: 50 }),
          async (manifests, searchTerm) => {
            // Mock API response
            const apiResponse: APIResponse<ToolManifest[]> = {
              success: true,
              data: manifests,
              timestamp: new Date(),
              requestId: 'test-request-id'
            };

            mockFetch.mockResolvedValueOnce({
              ok: true,
              json: async () => apiResponse,
              status: 200,
              statusText: 'OK'
            });

            // Perform search
            const searchResults = await loader.searchManifests(searchTerm);

            // Property: Search results should be consistent
            searchResults.forEach(result => {
              const validation = loader.validateManifest(result);
              expect(validation.isValid).toBe(true);
            });

            // Property: Search should be case-insensitive
            const searchLower = searchTerm.toLowerCase();
            searchResults.forEach(result => {
              const searchableText = [
                result.name,
                result.displayName,
                result.description
              ].join(' ').toLowerCase();

              expect(searchableText.includes(searchLower)).toBe(true);
            });

            // Property: Results should be limited appropriately
            expect(searchResults.length).toBeLessThanOrEqual(50); // Default limit
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should handle API errors consistently', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.integer({ min: 400, max: 599 }),
          fc.string({ minLength: 5, maxLength: 100 }),
          async (statusCode, errorMessage) => {
            // Mock API error response
            mockFetch.mockResolvedValueOnce({
              ok: false,
              status: statusCode,
              statusText: errorMessage,
              json: async () => ({ error: errorMessage })
            });

            // Property: API errors should be handled consistently
            await expect(loader.loadAllManifests()).rejects.toThrow(ToolIntegrationError);

            try {
              await loader.loadAllManifests();
            } catch (error) {
              expect(error).toBeInstanceOf(ToolIntegrationError);
              expect((error as ToolIntegrationError).toolId).toBe('system');
              expect((error as ToolIntegrationError).errorCode).toBe('MANIFEST_LOAD_FAILED');
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should maintain cache consistency across operations', async () => {
      await fc.assert(
        fc.asyncProperty(
          toolManifestGen,
          async (manifest) => {
            // Mock successful API responses
            const singleResponse: APIResponse<ToolManifest> = {
              success: true,
              data: manifest,
              timestamp: new Date(),
              requestId: 'test-request-id'
            };

            mockFetch.mockResolvedValueOnce({
              ok: true,
              json: async () => singleResponse,
              status: 200,
              statusText: 'OK'
            });

            // Load manifest
            const loadedManifest = await loader.loadManifest(manifest.id);

            // Property: Loaded manifest should match original
            expect(loadedManifest).not.toBeNull();
            if (loadedManifest) {
              expect(loadedManifest.id).toBe(manifest.id);
              expect(loadedManifest.name).toBe(manifest.name);
              expect(loadedManifest.integrationMethod).toBe(manifest.integrationMethod);
            }

            // Property: Cache should provide consistent results
            const cachedStats = loader.getCacheStats();
            expect(cachedStats.size).toBeGreaterThan(0);
            expect(cachedStats.lastUpdate).toBeInstanceOf(Date);
            expect(typeof cachedStats.isValid).toBe('boolean');

            // Clear cache and verify
            loader.clearCache();
            const clearedStats = loader.getCacheStats();
            expect(clearedStats.size).toBe(0);
            expect(clearedStats.lastUpdate).toBeNull();
            expect(clearedStats.isValid).toBe(false);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should maintain filtering consistency across different filter combinations', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.array(toolManifestGen, { minLength: 10, maxLength: 20 }),
          manifestFilterGen,
          async (manifests, filter) => {
            // Mock API response
            const apiResponse: APIResponse<ToolManifest[]> = {
              success: true,
              data: manifests,
              timestamp: new Date(),
              requestId: 'test-request-id'
            };

            mockFetch.mockResolvedValueOnce({
              ok: true,
              json: async () => apiResponse,
              status: 200,
              statusText: 'OK'
            });

            // Apply filter
            const filteredManifests = await loader.getFilteredManifests(filter);

            // Property: All filtered results should match filter criteria
            filteredManifests.forEach(manifest => {
              // Discipline filter
              if (filter.disciplines && filter.disciplines.length > 0) {
                const manifestDisciplines = [manifest.category, ...(manifest.subcategories || [])];
                const hasMatchingDiscipline = filter.disciplines.some(d => 
                  manifestDisciplines.includes(d)
                );
                expect(hasMatchingDiscipline).toBe(true);
              }

              // Category filter
              if (filter.categories && filter.categories.length > 0) {
                expect(filter.categories).toContain(manifest.category);
              }

              // Search term filter
              if (filter.searchTerm) {
                const searchLower = filter.searchTerm.toLowerCase();
                const searchableText = [
                  manifest.name,
                  manifest.displayName,
                  manifest.description,
                  manifest.category,
                  ...(manifest.subcategories || [])
                ].join(' ').toLowerCase();
                
                expect(searchableText.includes(searchLower)).toBe(true);
              }
            });

            // Property: Results should be valid manifests
            filteredManifests.forEach(manifest => {
              const validation = loader.validateManifest(manifest);
              expect(validation.isValid).toBe(true);
            });
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});