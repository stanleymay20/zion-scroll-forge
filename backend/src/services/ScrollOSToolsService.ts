/**
 * ScrollOS Tools Service
 * 
 * Core service for managing academic tool integrations, providing
 * standardized tool launching, state management, and cross-tool communication.
 */

import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger';
import { ToolManifestService } from './ToolManifestService';
import { ToolInstanceService } from './ToolInstanceService';
import { ToolSecurityService } from './ToolSecurityService';

interface LaunchToolOptions {
  manifestId: string;
  userId: string;
  projectId?: string;
  initialState?: any;
}

interface ToolHealthStatus {
  toolId: string;
  status: 'healthy' | 'degraded' | 'unhealthy';
  responseTime: number;
  lastChecked: Date;
  errors: string[];
  activeInstances: number;
}

export class ScrollOSToolsService {
  private prisma: PrismaClient;
  private manifestService: ToolManifestService;
  private instanceService: ToolInstanceService;
  private securityService: ToolSecurityService;

  constructor() {
    this.prisma = new PrismaClient();
    this.manifestService = new ToolManifestService();
    this.instanceService = new ToolInstanceService();
    this.securityService = new ToolSecurityService();
  }

  /**
   * Launch a tool instance for a user
   */
  async launchTool(options: LaunchToolOptions): Promise<any> {
    const { manifestId, userId, projectId, initialState } = options;

    try {
      // Get tool manifest
      const manifest = await this.manifestService.getManifest(manifestId);
      if (!manifest) {
        throw new Error(`Tool manifest not found: ${manifestId}`);
      }

      // Validate user permissions
      const hasPermission = await this.securityService.validatePermissions(
        userId,
        manifestId,
        manifest.permissions
      );

      if (!hasPermission) {
        throw new Error(`User ${userId} lacks required permissions for tool ${manifestId}`);
      }

      // Check concurrent tool limits
      const activeInstances = await this.instanceService.getActiveInstanceCount(userId);
      const maxConcurrent = process.env.MAX_CONCURRENT_TOOLS ? 
        parseInt(process.env.MAX_CONCURRENT_TOOLS) : 10;

      if (activeInstances >= maxConcurrent) {
        throw new Error(`Maximum concurrent tools limit reached (${maxConcurrent})`);
      }

      // Create tool instance
      const instance = await this.instanceService.createInstance({
        manifestId,
        userId,
        projectId,
        initialState: initialState || this.getDefaultState(manifest),
        manifest
      });

      // Log tool launch
      await this.logToolEvent('tool-launched', {
        toolId: manifestId,
        userId,
        instanceId: instance.id,
        projectId
      });

      logger.info(`Tool launched successfully: ${manifestId} for user ${userId}`);

      return instance;

    } catch (error) {
      logger.error(`Failed to launch tool ${manifestId}:`, error);
      
      // Log failed launch attempt
      await this.logToolEvent('tool-launch-failed', {
        toolId: manifestId,
        userId,
        error: error instanceof Error ? error.message : 'Unknown error',
        projectId
      });

      throw error;
    }
  }

  /**
   * Check health status of a tool
   */
  async checkToolHealth(toolId: string): Promise<ToolHealthStatus> {
    try {
      const manifest = await this.manifestService.getManifest(toolId);
      if (!manifest) {
        throw new Error(`Tool not found: ${toolId}`);
      }

      const startTime = Date.now();
      const errors: string[] = [];
      let status: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';

      // Check tool availability based on integration method
      try {
        switch (manifest.integrationMethod) {
          case 'iframe':
            await this.checkIframeHealth(manifest.url);
            break;
          case 'api':
            await this.checkAPIHealth(manifest.apiEndpoint);
            break;
          case 'rpc':
            await this.checkRPCHealth(manifest.rpcInterface);
            break;
          default:
            // For embed tools, just check if embed code is valid
            if (!manifest.embedCode) {
              errors.push('Missing embed code');
              status = 'unhealthy';
            }
        }
      } catch (error) {
        errors.push(error instanceof Error ? error.message : 'Health check failed');
        status = 'unhealthy';
      }

      const responseTime = Date.now() - startTime;
      
      // Get active instance count
      const activeInstances = await this.instanceService.getActiveInstanceCountForTool(toolId);

      // Determine status based on response time and errors
      if (errors.length === 0) {
        status = responseTime > 5000 ? 'degraded' : 'healthy';
      }

      const healthStatus: ToolHealthStatus = {
        toolId,
        status,
        responseTime,
        lastChecked: new Date(),
        errors,
        activeInstances
      };

      // Cache health status
      await this.cacheHealthStatus(toolId, healthStatus);

      return healthStatus;

    } catch (error) {
      logger.error(`Health check failed for tool ${toolId}:`, error);
      
      return {
        toolId,
        status: 'unhealthy',
        responseTime: -1,
        lastChecked: new Date(),
        errors: [error instanceof Error ? error.message : 'Health check failed'],
        activeInstances: 0
      };
    }
  }

  /**
   * Get tool usage analytics
   */
  async getToolAnalytics(toolId: string, timeRange: 'day' | 'week' | 'month' = 'week'): Promise<any> {
    try {
      const endDate = new Date();
      const startDate = new Date();
      
      switch (timeRange) {
        case 'day':
          startDate.setDate(endDate.getDate() - 1);
          break;
        case 'week':
          startDate.setDate(endDate.getDate() - 7);
          break;
        case 'month':
          startDate.setMonth(endDate.getMonth() - 1);
          break;
      }

      // Get usage statistics from database
      const analytics = await this.prisma.toolEvent.groupBy({
        by: ['type'],
        where: {
          toolId,
          timestamp: {
            gte: startDate,
            lte: endDate
          }
        },
        _count: {
          type: true
        }
      });

      // Get unique users
      const uniqueUsers = await this.prisma.toolEvent.findMany({
        where: {
          toolId,
          timestamp: {
            gte: startDate,
            lte: endDate
          }
        },
        select: {
          userId: true
        },
        distinct: ['userId']
      });

      // Calculate average session duration
      const sessions = await this.prisma.toolInstance.findMany({
        where: {
          manifestId: toolId,
          createdAt: {
            gte: startDate,
            lte: endDate
          }
        },
        select: {
          createdAt: true,
          lastAccessed: true
        }
      });

      const avgSessionDuration = sessions.length > 0 
        ? sessions.reduce((sum, session) => {
            return sum + (session.lastAccessed.getTime() - session.createdAt.getTime());
          }, 0) / sessions.length
        : 0;

      return {
        toolId,
        timeRange,
        period: { startDate, endDate },
        totalLaunches: analytics.find(a => a.type === 'tool-launched')?._count.type || 0,
        uniqueUsers: uniqueUsers.length,
        averageSessionDuration: Math.round(avgSessionDuration / 1000 / 60), // minutes
        eventBreakdown: analytics.reduce((acc, item) => {
          acc[item.type] = item._count.type;
          return acc;
        }, {} as Record<string, number>)
      };

    } catch (error) {
      logger.error(`Failed to get analytics for tool ${toolId}:`, error);
      throw error;
    }
  }

  /**
   * Cleanup inactive tool instances
   */
  async cleanupInactiveInstances(): Promise<number> {
    try {
      const inactiveThreshold = new Date();
      inactiveThreshold.setHours(inactiveThreshold.getHours() - 24); // 24 hours

      const inactiveInstances = await this.prisma.toolInstance.findMany({
        where: {
          isActive: true,
          lastAccessed: {
            lt: inactiveThreshold
          }
        }
      });

      let cleanedCount = 0;

      for (const instance of inactiveInstances) {
        try {
          await this.instanceService.closeInstance(instance.id);
          cleanedCount++;
        } catch (error) {
          logger.warn(`Failed to cleanup instance ${instance.id}:`, error);
        }
      }

      logger.info(`Cleaned up ${cleanedCount} inactive tool instances`);
      return cleanedCount;

    } catch (error) {
      logger.error('Failed to cleanup inactive instances:', error);
      throw error;
    }
  }

  // Private helper methods

  private getDefaultState(manifest: any): any {
    return {
      windowState: {
        width: manifest.minWidth || 800,
        height: manifest.minHeight || 600,
        x: 100,
        y: 100,
        isMaximized: manifest.fullscreen || false,
        isMinimized: false,
        zIndex: 1000
      },
      applicationState: {},
      fileStates: [],
      sessionData: {}
    };
  }

  private async checkIframeHealth(url?: string): Promise<void> {
    if (!url) {
      throw new Error('No URL provided for iframe health check');
    }

    const response = await fetch(url, { 
      method: 'HEAD',
      timeout: 5000 
    });

    if (!response.ok) {
      throw new Error(`Iframe health check failed: ${response.status} ${response.statusText}`);
    }
  }

  private async checkAPIHealth(endpoint?: string): Promise<void> {
    if (!endpoint) {
      throw new Error('No API endpoint provided for health check');
    }

    const healthUrl = `${endpoint}/health`;
    const response = await fetch(healthUrl, { 
      timeout: 5000 
    });

    if (!response.ok) {
      throw new Error(`API health check failed: ${response.status} ${response.statusText}`);
    }
  }

  private async checkRPCHealth(rpcInterface?: string): Promise<void> {
    if (!rpcInterface) {
      throw new Error('No RPC interface provided for health check');
    }

    // RPC health check implementation would depend on the specific RPC protocol
    // For now, just validate that the interface is configured
    logger.info(`RPC health check for ${rpcInterface} - implementation needed`);
  }

  private async cacheHealthStatus(toolId: string, status: ToolHealthStatus): Promise<void> {
    try {
      // Cache health status in Redis or database
      // Implementation depends on caching strategy
      logger.debug(`Caching health status for tool ${toolId}:`, status);
    } catch (error) {
      logger.warn(`Failed to cache health status for tool ${toolId}:`, error);
    }
  }

  private async logToolEvent(type: string, data: any): Promise<void> {
    try {
      await this.prisma.toolEvent.create({
        data: {
          type,
          toolId: data.toolId,
          userId: data.userId,
          projectId: data.projectId,
          data: JSON.stringify(data),
          timestamp: new Date()
        }
      });
    } catch (error) {
      logger.warn('Failed to log tool event:', error);
    }
  }
}