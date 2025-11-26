/**
 * Tool Manifest Service
 * 
 * Manages tool manifests, providing dynamic loading, validation,
 * and filtering based on user permissions and academic disciplines.
 */

import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger';

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
  permissions: any[];
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

export class ToolManifestService {
  private prisma: PrismaClient;
  private manifestCache: Map<string, ToolManifest> = new Map();
  private cacheExpiry: Map<string, number> = new Map();
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  constructor() {
    this.prisma = new PrismaClient();
  }

  /**
   * Get available tool manifests for a user
   */
  async getAvailableManifests(userId: string, discipline?: string): Promise<ToolManifest[]> {
    try {
      // Get user's enrolled courses and permissions
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        include: {
          enrollments: {
            include: {
              course: true
            }
          },
          permissions: true
        }
      });

      if (!user) {
        throw new Error(`User not found: ${userId}`);
      }

      // Build filter criteria
      const filterCriteria: any = {
        isActive: true
      };

      // Filter by discipline if specified
      if (discipline) {
        filterCriteria.OR = [
          { category: discipline },
          { subcategories: { has: discipline } }
        ];
      } else {
        // Filter by user's enrolled courses and declared major
        const userDisciplines = new Set<string>();
        
        // Add disciplines from enrolled courses
        user.enrollments.forEach(enrollment => {
          if (enrollment.course.discipline) {
            userDisciplines.add(enrollment.course.discipline);
          }
        });

        // Add user's declared major and minors
        if (user.declaredMajor) {
          userDisciplines.add(user.declaredMajor);
        }
        if (user.minors) {
          user.minors.forEach(minor => userDisciplines.add(minor));
        }

        if (userDisciplines.size > 0) {
          filterCriteria.OR = [
            { category: { in: Array.from(userDisciplines) } },
            { subcategories: { hasSome: Array.from(userDisciplines) } }
          ];
        }
      }

      // Get manifests from database
      const manifests = await this.prisma.toolManifest.findMany({
        where: filterCriteria,
        orderBy: [
          { category: 'asc' },
          { displayName: 'asc' }
        ]
      });

      // Filter by user permissions
      const filteredManifests = manifests.filter(manifest => {
        return this.hasRequiredPermissions(user.permissions, manifest.permissions);
      });

      // Convert to proper format and cache
      const result = filteredManifests.map(manifest => this.convertToManifest(manifest));
      
      // Cache results
      result.forEach(manifest => {
        this.manifestCache.set(manifest.id, manifest);
        this.cacheExpiry.set(manifest.id, Date.now() + this.CACHE_TTL);
      });

      logger.info(`Retrieved ${result.length} available manifests for user ${userId}`);
      return result;

    } catch (error) {
      logger.error(`Failed to get available manifests for user ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Get a specific tool manifest
   */
  async getManifest(manifestId: string): Promise<ToolManifest | null> {
    try {
      // Check cache first
      const cached = this.getCachedManifest(manifestId);
      if (cached) {
        return cached;
      }

      // Get from database
      const manifest = await this.prisma.toolManifest.findUnique({
        where: { id: manifestId }
      });

      if (!manifest) {
        return null;
      }

      const result = this.convertToManifest(manifest);
      
      // Cache result
      this.manifestCache.set(manifestId, result);
      this.cacheExpiry.set(manifestId, Date.now() + this.CACHE_TTL);

      return result;

    } catch (error) {
      logger.error(`Failed to get manifest ${manifestId}:`, error);
      throw error;
    }
  }

  /**
   * Create or update a tool manifest
   */
  async upsertManifest(manifest: Partial<ToolManifest>): Promise<ToolManifest> {
    try {
      if (!manifest.id) {
        throw new Error('Manifest ID is required');
      }

      const data = {
        id: manifest.id,
        name: manifest.name || manifest.id,
        displayName: manifest.displayName || manifest.name || manifest.id,
        description: manifest.description || '',
        version: manifest.version || '1.0.0',
        category: manifest.category || 'general',
        subcategories: manifest.subcategories || [],
        integrationMethod: manifest.integrationMethod || 'iframe',
        url: manifest.url,
        apiEndpoint: manifest.apiEndpoint,
        embedCode: manifest.embedCode,
        rpcInterface: manifest.rpcInterface,
        permissions: manifest.permissions || [],
        requiresAuth: manifest.requiresAuth ?? true,
        ssoEnabled: manifest.ssoEnabled ?? false,
        aiAgents: manifest.aiAgents || [],
        contextAware: manifest.contextAware ?? true,
        supportedFormats: manifest.supportedFormats || [],
        dataExportFormats: manifest.dataExportFormats || [],
        crossToolCompatibility: manifest.crossToolCompatibility || [],
        icon: manifest.icon || '/icons/default-tool.svg',
        color: manifest.color || '#6366f1',
        fullscreen: manifest.fullscreen ?? false,
        resizable: manifest.resizable ?? true,
        minWidth: manifest.minWidth,
        minHeight: manifest.minHeight,
        collaborationEnabled: manifest.collaborationEnabled ?? true,
        offlineCapable: manifest.offlineCapable ?? false,
        cloudProcessing: manifest.cloudProcessing ?? false,
        vendor: manifest.vendor || 'ScrollUniversity',
        license: manifest.license || 'MIT',
        documentation: manifest.documentation || '',
        supportContact: manifest.supportContact || 'support@scrolluniversity.com',
        isActive: true,
        updatedAt: new Date()
      };

      const upserted = await this.prisma.toolManifest.upsert({
        where: { id: manifest.id },
        update: data,
        create: {
          ...data,
          createdAt: new Date()
        }
      });

      const result = this.convertToManifest(upserted);
      
      // Update cache
      this.manifestCache.set(result.id, result);
      this.cacheExpiry.set(result.id, Date.now() + this.CACHE_TTL);

      logger.info(`Upserted tool manifest: ${manifest.id}`);
      return result;

    } catch (error) {
      logger.error(`Failed to upsert manifest ${manifest.id}:`, error);
      throw error;
    }
  }

  /**
   * Delete a tool manifest
   */
  async deleteManifest(manifestId: string): Promise<void> {
    try {
      // Check if there are active instances
      const activeInstances = await this.prisma.toolInstance.count({
        where: {
          manifestId,
          isActive: true
        }
      });

      if (activeInstances > 0) {
        throw new Error(`Cannot delete manifest ${manifestId}: ${activeInstances} active instances exist`);
      }

      // Soft delete by marking as inactive
      await this.prisma.toolManifest.update({
        where: { id: manifestId },
        data: { 
          isActive: false,
          updatedAt: new Date()
        }
      });

      // Remove from cache
      this.manifestCache.delete(manifestId);
      this.cacheExpiry.delete(manifestId);

      logger.info(`Deleted tool manifest: ${manifestId}`);

    } catch (error) {
      logger.error(`Failed to delete manifest ${manifestId}:`, error);
      throw error;
    }
  }

  /**
   * Get manifests by category
   */
  async getManifestsByCategory(category: string): Promise<ToolManifest[]> {
    try {
      const manifests = await this.prisma.toolManifest.findMany({
        where: {
          isActive: true,
          OR: [
            { category },
            { subcategories: { has: category } }
          ]
        },
        orderBy: { displayName: 'asc' }
      });

      return manifests.map(manifest => this.convertToManifest(manifest));

    } catch (error) {
      logger.error(`Failed to get manifests for category ${category}:`, error);
      throw error;
    }
  }

  /**
   * Search manifests by name or description
   */
  async searchManifests(query: string, userId?: string): Promise<ToolManifest[]> {
    try {
      const searchTerms = query.toLowerCase().split(' ');
      
      const manifests = await this.prisma.toolManifest.findMany({
        where: {
          isActive: true,
          OR: [
            {
              displayName: {
                contains: query,
                mode: 'insensitive'
              }
            },
            {
              description: {
                contains: query,
                mode: 'insensitive'
              }
            },
            {
              name: {
                contains: query,
                mode: 'insensitive'
              }
            }
          ]
        },
        orderBy: { displayName: 'asc' }
      });

      let result = manifests.map(manifest => this.convertToManifest(manifest));

      // Filter by user permissions if userId provided
      if (userId) {
        const user = await this.prisma.user.findUnique({
          where: { id: userId },
          include: { permissions: true }
        });

        if (user) {
          result = result.filter(manifest => {
            return this.hasRequiredPermissions(user.permissions, manifest.permissions);
          });
        }
      }

      return result;

    } catch (error) {
      logger.error(`Failed to search manifests with query "${query}":`, error);
      throw error;
    }
  }

  /**
   * Load manifests from external source
   */
  async loadExternalManifests(sourceUrl: string): Promise<number> {
    try {
      const response = await fetch(sourceUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch manifests: ${response.statusText}`);
      }

      const externalManifests = await response.json();
      let loadedCount = 0;

      for (const manifest of externalManifests) {
        try {
          await this.upsertManifest(manifest);
          loadedCount++;
        } catch (error) {
          logger.warn(`Failed to load external manifest ${manifest.id}:`, error);
        }
      }

      logger.info(`Loaded ${loadedCount} external manifests from ${sourceUrl}`);
      return loadedCount;

    } catch (error) {
      logger.error(`Failed to load external manifests from ${sourceUrl}:`, error);
      throw error;
    }
  }

  // Private helper methods

  private getCachedManifest(manifestId: string): ToolManifest | null {
    const expiry = this.cacheExpiry.get(manifestId);
    if (!expiry || Date.now() > expiry) {
      this.manifestCache.delete(manifestId);
      this.cacheExpiry.delete(manifestId);
      return null;
    }

    return this.manifestCache.get(manifestId) || null;
  }

  private convertToManifest(dbManifest: any): ToolManifest {
    return {
      id: dbManifest.id,
      name: dbManifest.name,
      displayName: dbManifest.displayName,
      description: dbManifest.description,
      version: dbManifest.version,
      category: dbManifest.category,
      subcategories: dbManifest.subcategories,
      integrationMethod: dbManifest.integrationMethod,
      url: dbManifest.url,
      apiEndpoint: dbManifest.apiEndpoint,
      embedCode: dbManifest.embedCode,
      rpcInterface: dbManifest.rpcInterface,
      permissions: dbManifest.permissions,
      requiresAuth: dbManifest.requiresAuth,
      ssoEnabled: dbManifest.ssoEnabled,
      aiAgents: dbManifest.aiAgents,
      contextAware: dbManifest.contextAware,
      supportedFormats: dbManifest.supportedFormats,
      dataExportFormats: dbManifest.dataExportFormats,
      crossToolCompatibility: dbManifest.crossToolCompatibility,
      icon: dbManifest.icon,
      color: dbManifest.color,
      fullscreen: dbManifest.fullscreen,
      resizable: dbManifest.resizable,
      minWidth: dbManifest.minWidth,
      minHeight: dbManifest.minHeight,
      collaborationEnabled: dbManifest.collaborationEnabled,
      offlineCapable: dbManifest.offlineCapable,
      cloudProcessing: dbManifest.cloudProcessing,
      vendor: dbManifest.vendor,
      license: dbManifest.license,
      documentation: dbManifest.documentation,
      supportContact: dbManifest.supportContact,
      createdAt: dbManifest.createdAt,
      updatedAt: dbManifest.updatedAt
    };
  }

  private hasRequiredPermissions(userPermissions: any[], requiredPermissions: any[]): boolean {
    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }

    return requiredPermissions.every(required => {
      return userPermissions.some(userPerm => 
        userPerm.action === required.action && 
        userPerm.resource === required.resource
      );
    });
  }
}