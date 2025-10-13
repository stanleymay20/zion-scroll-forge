import { Request, Response, NextFunction } from 'express';
import { logger } from '../../backend/src/utils/logger';

export interface APIVersion {
  version: string;
  releaseDate: Date;
  deprecationDate?: Date;
  sunsetDate?: Date;
  status: 'active' | 'deprecated' | 'sunset';
  changes: string[];
  breakingChanges: string[];
  migrationGuide?: string;
}

export interface VersionedEndpoint {
  path: string;
  method: string;
  versions: {
    [version: string]: {
      handler: string;
      deprecated?: boolean;
      deprecationMessage?: string;
      migrationPath?: string;
    };
  };
}

export class APIVersioningService {
  private versions: Map<string, APIVersion> = new Map();
  private endpoints: Map<string, VersionedEndpoint> = new Map();
  private defaultVersion = 'v1';

  constructor() {
    this.initializeVersions();
    this.initializeEndpoints();
  }

  private initializeVersions() {
    const versions: APIVersion[] = [
      {
        version: 'v1',
        releaseDate: new Date('2025-01-01'),
        status: 'active',
        changes: [
          'Initial API release',
          'Basic user management',
          'Course enrollment system',
          'ScrollCoin integration'
        ],
        breakingChanges: []
      },
      {
        version: 'v2',
        releaseDate: new Date('2025-06-01'),
        status: 'active',
        changes: [
          'Enhanced spiritual formation tracking',
          'Advanced AI tutoring integration',
          'Improved prayer system',
          'Better mobile support'
        ],
        breakingChanges: [
          'User profile structure changed',
          'Authentication token format updated'
        ],
        migrationGuide: '/docs/migration/v1-to-v2'
      }
    ];

    versions.forEach(version => {
      this.versions.set(version.version, version);
    });

    logger.info(`📋 Initialized ${versions.length} API versions`);
  }

  private initializeEndpoints() {
    const endpoints: VersionedEndpoint[] = [
      {
        path: '/api/users/profile',
        method: 'GET',
        versions: {
          v1: { handler: 'getUserProfileV1' },
          v2: { handler: 'getUserProfileV2' }
        }
      },
      {
        path: '/api/users/register',
        method: 'POST',
        versions: {
          v1: { 
            handler: 'registerUserV1',
            deprecated: true,
            deprecationMessage: 'This endpoint is deprecated. Use v2 for enhanced spiritual formation tracking.',
            migrationPath: '/docs/migration/user-registration'
          },
          v2: { handler: 'registerUserV2' }
        }
      },
      {
        path: '/api/courses',
        method: 'GET',
        versions: {
          v1: { handler: 'getCoursesV1' },
          v2: { handler: 'getCoursesV2' }
        }
      }
    ];

    endpoints.forEach(endpoint => {
      const key = `${endpoint.method}:${endpoint.path}`;
      this.endpoints.set(key, endpoint);
    });

    logger.info(`🔗 Initialized ${endpoints.length} versioned endpoints`);
  }

  /**
   * Middleware to handle API versioning
   */
  versioningMiddleware = (req: Request, res: Response, next: NextFunction) => {
    // Extract version from header, query param, or URL path
    let version = this.extractVersion(req);
    
    // Validate version
    if (!this.isValidVersion(version)) {
      return res.status(400).json({
        error: 'Invalid API version',
        message: `API version '${version}' is not supported`,
        supportedVersions: Array.from(this.versions.keys()),
        scrollMessage: 'The scroll version you seek does not exist in the kingdom archives.'
      });
    }

    // Check if version is deprecated or sunset
    const versionInfo = this.versions.get(version);
    if (versionInfo) {
      if (versionInfo.status === 'sunset') {
        return res.status(410).json({
          error: 'API version sunset',
          message: `API version '${version}' has been sunset and is no longer available`,
          sunsetDate: versionInfo.sunsetDate,
          migrationGuide: versionInfo.migrationGuide,
          scrollMessage: 'This scroll version has been sealed. Please upgrade to a newer version.'
        });
      }

      if (versionInfo.status === 'deprecated') {
        res.set('X-API-Deprecated', 'true');
        res.set('X-API-Deprecation-Date', versionInfo.deprecationDate?.toISOString() || '');
        res.set('X-API-Sunset-Date', versionInfo.sunsetDate?.toISOString() || '');
        res.set('X-API-Migration-Guide', versionInfo.migrationGuide || '');
      }
    }

    // Add version info to request
    req.headers['x-api-version'] = version;
    res.set('X-API-Version', version);

    // Check endpoint-specific deprecation
    const endpointKey = `${req.method}:${req.path}`;
    const endpoint = this.endpoints.get(endpointKey);
    
    if (endpoint && endpoint.versions[version]?.deprecated) {
      const versionConfig = endpoint.versions[version];
      res.set('X-Endpoint-Deprecated', 'true');
      res.set('X-Deprecation-Message', versionConfig.deprecationMessage || '');
      res.set('X-Migration-Path', versionConfig.migrationPath || '');
      
      logger.warn(`⚠️ Deprecated endpoint accessed: ${endpointKey} (${version})`);
    }

    next();
  };

  /**
   * Extract version from request
   */
  private extractVersion(req: Request): string {
    // Priority order: header > query param > URL path > default
    
    // 1. Check X-API-Version header
    const headerVersion = req.headers['x-api-version'] as string;
    if (headerVersion) {
      return headerVersion;
    }

    // 2. Check version query parameter
    const queryVersion = req.query.version as string;
    if (queryVersion) {
      return queryVersion;
    }

    // 3. Check URL path (e.g., /api/v2/users)
    const pathMatch = req.path.match(/^\/api\/(v\d+)\//);
    if (pathMatch) {
      return pathMatch[1];
    }

    // 4. Return default version
    return this.defaultVersion;
  }

  /**
   * Check if version is valid and supported
   */
  private isValidVersion(version: string): boolean {
    return this.versions.has(version);
  }

  /**
   * Get version information
   */
  getVersionInfo(version: string): APIVersion | null {
    return this.versions.get(version) || null;
  }

  /**
   * Get all supported versions
   */
  getAllVersions(): APIVersion[] {
    return Array.from(this.versions.values());
  }

  /**
   * Get active versions only
   */
  getActiveVersions(): APIVersion[] {
    return Array.from(this.versions.values()).filter(v => v.status === 'active');
  }

  /**
   * Add a new API version
   */
  addVersion(version: APIVersion): void {
    this.versions.set(version.version, version);
    logger.info(`➕ Added new API version: ${version.version}`);
  }

  /**
   * Deprecate a version
   */
  deprecateVersion(version: string, deprecationDate: Date, sunsetDate?: Date): boolean {
    const versionInfo = this.versions.get(version);
    if (!versionInfo) {
      return false;
    }

    versionInfo.status = 'deprecated';
    versionInfo.deprecationDate = deprecationDate;
    if (sunsetDate) {
      versionInfo.sunsetDate = sunsetDate;
    }

    this.versions.set(version, versionInfo);
    logger.info(`⚠️ API version deprecated: ${version}`);
    return true;
  }

  /**
   * Sunset a version
   */
  sunsetVersion(version: string): boolean {
    const versionInfo = this.versions.get(version);
    if (!versionInfo) {
      return false;
    }

    versionInfo.status = 'sunset';
    this.versions.set(version, versionInfo);
    logger.info(`🌅 API version sunset: ${version}`);
    return true;
  }

  /**
   * Get endpoint configuration for a specific version
   */
  getEndpointConfig(method: string, path: string, version: string): any {
    const endpointKey = `${method}:${path}`;
    const endpoint = this.endpoints.get(endpointKey);
    
    if (!endpoint || !endpoint.versions[version]) {
      return null;
    }

    return endpoint.versions[version];
  }

  /**
   * Check if endpoint is deprecated for a specific version
   */
  isEndpointDeprecated(method: string, path: string, version: string): boolean {
    const config = this.getEndpointConfig(method, path, version);
    return config?.deprecated || false;
  }

  /**
   * Get API compatibility matrix
   */
  getCompatibilityMatrix(): {
    versions: string[];
    endpoints: {
      path: string;
      method: string;
      supportedVersions: string[];
      deprecatedVersions: string[];
    }[];
  } {
    const versions = Array.from(this.versions.keys());
    const endpoints = Array.from(this.endpoints.values()).map(endpoint => {
      const supportedVersions = Object.keys(endpoint.versions);
      const deprecatedVersions = supportedVersions.filter(v => 
        endpoint.versions[v].deprecated
      );

      return {
        path: endpoint.path,
        method: endpoint.method,
        supportedVersions,
        deprecatedVersions
      };
    });

    return { versions, endpoints };
  }

  /**
   * Generate migration report
   */
  generateMigrationReport(fromVersion: string, toVersion: string): {
    compatible: boolean;
    breakingChanges: string[];
    migrationSteps: string[];
    affectedEndpoints: string[];
  } {
    const fromVersionInfo = this.versions.get(fromVersion);
    const toVersionInfo = this.versions.get(toVersion);

    if (!fromVersionInfo || !toVersionInfo) {
      return {
        compatible: false,
        breakingChanges: ['Invalid version specified'],
        migrationSteps: [],
        affectedEndpoints: []
      };
    }

    const breakingChanges = toVersionInfo.breakingChanges || [];
    const affectedEndpoints: string[] = [];

    // Find endpoints that changed between versions
    for (const [key, endpoint] of this.endpoints) {
      const hasFromVersion = endpoint.versions[fromVersion];
      const hasToVersion = endpoint.versions[toVersion];
      
      if (hasFromVersion && hasToVersion) {
        if (endpoint.versions[toVersion].handler !== endpoint.versions[fromVersion].handler) {
          affectedEndpoints.push(key);
        }
      } else if (hasFromVersion && !hasToVersion) {
        affectedEndpoints.push(`${key} (removed)`);
      }
    }

    return {
      compatible: breakingChanges.length === 0,
      breakingChanges,
      migrationSteps: toVersionInfo.changes || [],
      affectedEndpoints
    };
  }
}

export const apiVersioningService = new APIVersioningService();