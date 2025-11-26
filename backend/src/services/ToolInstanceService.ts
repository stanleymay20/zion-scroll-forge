/**
 * Tool Instance Service
 * 
 * Manages tool instances, providing state persistence, lifecycle management,
 * and inter-tool communication for the ScrollOS academic platform.
 */

import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger';

interface CreateInstanceOptions {
  manifestId: string;
  userId: string;
  projectId?: string;
  initialState?: any;
  manifest: any;
}

interface ToolInstance {
  id: string;
  manifestId: string;
  userId: string;
  projectId?: string;
  state: any;
  isActive: boolean;
  lastAccessed: Date;
  permissions: any[];
  customSettings: any;
  aiAgents: any[];
  contextData: any;
  collaborators: string[];
  sharedWith: any[];
  createdAt: Date;
  updatedAt: Date;
}

export class ToolInstanceService {
  private prisma: PrismaClient;
  private instanceCache: Map<string, ToolInstance> = new Map();
  private readonly CACHE_TTL = 2 * 60 * 1000; // 2 minutes

  constructor() {
    this.prisma = new PrismaClient();
  }

  /**
   * Create a new tool instance
   */
  async createInstance(options: CreateInstanceOptions): Promise<ToolInstance> {
    const { manifestId, userId, projectId, initialState, manifest } = options;

    try {
      const instanceId = this.generateInstanceId(manifestId);
      
      const defaultState = {
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

      const contextData = {
        currentTool: manifestId,
        currentProject: projectId,
        currentCourse: await this.getCurrentCourse(userId),
        recentActions: []
      };

      const instance = await this.prisma.toolInstance.create({
        data: {
          id: instanceId,
          manifestId,
          userId,
          projectId,
          state: initialState || defaultState,
          isActive: true,
          lastAccessed: new Date(),
          permissions: manifest.permissions || [],
          customSettings: {},
          aiAgents: [],
          contextData,
          collaborators: [],
          sharedWith: [],
          createdAt: new Date(),
          updatedAt: new Date()
        }
      });

      const result = this.convertToInstance(instance);
      
      // Cache the instance
      this.instanceCache.set(instanceId, result);

      logger.info(`Created tool instance: ${instanceId} for user ${userId}`);
      return result;

    } catch (error) {
      logger.error(`Failed to create tool instance for ${manifestId}:`, error);
      throw error;
    }
  }

  /**
   * Get a tool instance
   */
  async getInstance(instanceId: string): Promise<ToolInstance> {
    try {
      // Check cache first
      const cached = this.instanceCache.get(instanceId);
      if (cached) {
        return cached;
      }

      const instance = await this.prisma.toolInstance.findUnique({
        where: { id: instanceId }
      });

      if (!instance) {
        throw new Error(`Tool instance not found: ${instanceId}`);
      }

      const result = this.convertToInstance(instance);
      
      // Cache the instance
      this.instanceCache.set(instanceId, result);

      return result;

    } catch (error) {
      logger.error(`Failed to get tool instance ${instanceId}:`, error);
      throw error;
    }
  }

  /**
   * Save tool instance state
   */
  async saveState(instanceId: string, state: any): Promise<void> {
    try {
      await this.prisma.toolInstance.update({
        where: { id: instanceId },
        data: {
          state,
          lastAccessed: new Date(),
          updatedAt: new Date()
        }
      });

      // Update cache
      const cached = this.instanceCache.get(instanceId);
      if (cached) {
        cached.state = state;
        cached.lastAccessed = new Date();
      }

      logger.debug(`Saved state for tool instance: ${instanceId}`);

    } catch (error) {
      logger.error(`Failed to save state for tool instance ${instanceId}:`, error);
      throw error;
    }
  }

  /**
   * Get tool instance state
   */
  async getState(instanceId: string): Promise<any> {
    try {
      const instance = await this.getInstance(instanceId);
      return instance.state;

    } catch (error) {
      logger.error(`Failed to get state for tool instance ${instanceId}:`, error);
      throw error;
    }
  }

  /**
   * Close a tool instance
   */
  async closeInstance(instanceId: string): Promise<void> {
    try {
      await this.prisma.toolInstance.update({
        where: { id: instanceId },
        data: {
          isActive: false,
          updatedAt: new Date()
        }
      });

      // Remove from cache
      this.instanceCache.delete(instanceId);

      // Log closure event
      const instance = await this.prisma.toolInstance.findUnique({
        where: { id: instanceId },
        select: { manifestId: true, userId: true, projectId: true, createdAt: true }
      });

      if (instance) {
        const sessionDuration = Date.now() - instance.createdAt.getTime();
        
        await this.prisma.toolEvent.create({
          data: {
            type: 'tool-closed',
            toolId: instance.manifestId,
            userId: instance.userId,
            projectId: instance.projectId,
            data: JSON.stringify({ 
              instanceId, 
              sessionDuration: Math.round(sessionDuration / 1000) // seconds
            }),
            timestamp: new Date()
          }
        });
      }

      logger.info(`Closed tool instance: ${instanceId}`);

    } catch (error) {
      logger.error(`Failed to close tool instance ${instanceId}:`, error);
      throw error;
    }
  }

  /**
   * Send message to tool instance
   */
  async sendMessage(instanceId: string, message: any): Promise<any> {
    try {
      const instance = await this.getInstance(instanceId);
      
      // Update last accessed time
      await this.prisma.toolInstance.update({
        where: { id: instanceId },
        data: { lastAccessed: new Date() }
      });

      // Log message event
      await this.prisma.toolEvent.create({
        data: {
          type: 'message-sent',
          toolId: instance.manifestId,
          userId: instance.userId,
          projectId: instance.projectId,
          data: JSON.stringify({ 
            instanceId, 
            messageType: message.type,
            messageId: message.id
          }),
          timestamp: new Date()
        }
      });

      // For now, return a simple acknowledgment
      // In a real implementation, this would route the message to the appropriate tool
      return {
        id: this.generateMessageId(),
        messageId: message.id,
        success: true,
        timestamp: new Date(),
        data: { acknowledged: true }
      };

    } catch (error) {
      logger.error(`Failed to send message to tool instance ${instanceId}:`, error);
      throw error;
    }
  }

  /**
   * Get active instances for a user
   */
  async getActiveInstances(userId: string): Promise<ToolInstance[]> {
    try {
      const instances = await this.prisma.toolInstance.findMany({
        where: {
          userId,
          isActive: true
        },
        orderBy: { lastAccessed: 'desc' }
      });

      return instances.map(instance => this.convertToInstance(instance));

    } catch (error) {
      logger.error(`Failed to get active instances for user ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Get active instance count for a user
   */
  async getActiveInstanceCount(userId: string): Promise<number> {
    try {
      return await this.prisma.toolInstance.count({
        where: {
          userId,
          isActive: true
        }
      });

    } catch (error) {
      logger.error(`Failed to get active instance count for user ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Get active instance count for a specific tool
   */
  async getActiveInstanceCountForTool(toolId: string): Promise<number> {
    try {
      return await this.prisma.toolInstance.count({
        where: {
          manifestId: toolId,
          isActive: true
        }
      });

    } catch (error) {
      logger.error(`Failed to get active instance count for tool ${toolId}:`, error);
      throw error;
    }
  }

  /**
   * Add collaborator to tool instance
   */
  async addCollaborator(instanceId: string, collaboratorId: string, permissions: string[] = ['read']): Promise<void> {
    try {
      const instance = await this.getInstance(instanceId);
      
      if (!instance.collaborators.includes(collaboratorId)) {
        const updatedCollaborators = [...instance.collaborators, collaboratorId];
        const updatedSharedWith = [
          ...instance.sharedWith,
          {
            userId: collaboratorId,
            permission: permissions[0] || 'read',
            grantedBy: instance.userId,
            grantedAt: new Date()
          }
        ];

        await this.prisma.toolInstance.update({
          where: { id: instanceId },
          data: {
            collaborators: updatedCollaborators,
            sharedWith: updatedSharedWith,
            updatedAt: new Date()
          }
        });

        // Update cache
        if (this.instanceCache.has(instanceId)) {
          const cached = this.instanceCache.get(instanceId)!;
          cached.collaborators = updatedCollaborators;
          cached.sharedWith = updatedSharedWith;
        }

        logger.info(`Added collaborator ${collaboratorId} to tool instance ${instanceId}`);
      }

    } catch (error) {
      logger.error(`Failed to add collaborator to tool instance ${instanceId}:`, error);
      throw error;
    }
  }

  /**
   * Remove collaborator from tool instance
   */
  async removeCollaborator(instanceId: string, collaboratorId: string): Promise<void> {
    try {
      const instance = await this.getInstance(instanceId);
      
      const updatedCollaborators = instance.collaborators.filter(id => id !== collaboratorId);
      const updatedSharedWith = instance.sharedWith.filter(share => share.userId !== collaboratorId);

      await this.prisma.toolInstance.update({
        where: { id: instanceId },
        data: {
          collaborators: updatedCollaborators,
          sharedWith: updatedSharedWith,
          updatedAt: new Date()
        }
      });

      // Update cache
      if (this.instanceCache.has(instanceId)) {
        const cached = this.instanceCache.get(instanceId)!;
        cached.collaborators = updatedCollaborators;
        cached.sharedWith = updatedSharedWith;
      }

      logger.info(`Removed collaborator ${collaboratorId} from tool instance ${instanceId}`);

    } catch (error) {
      logger.error(`Failed to remove collaborator from tool instance ${instanceId}:`, error);
      throw error;
    }
  }

  /**
   * Update instance context data
   */
  async updateContextData(instanceId: string, contextData: any): Promise<void> {
    try {
      await this.prisma.toolInstance.update({
        where: { id: instanceId },
        data: {
          contextData,
          updatedAt: new Date()
        }
      });

      // Update cache
      if (this.instanceCache.has(instanceId)) {
        const cached = this.instanceCache.get(instanceId)!;
        cached.contextData = contextData;
      }

      logger.debug(`Updated context data for tool instance: ${instanceId}`);

    } catch (error) {
      logger.error(`Failed to update context data for tool instance ${instanceId}:`, error);
      throw error;
    }
  }

  // Private helper methods

  private generateInstanceId(manifestId: string): string {
    return `${manifestId}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateMessageId(): string {
    return `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private convertToInstance(dbInstance: any): ToolInstance {
    return {
      id: dbInstance.id,
      manifestId: dbInstance.manifestId,
      userId: dbInstance.userId,
      projectId: dbInstance.projectId,
      state: dbInstance.state,
      isActive: dbInstance.isActive,
      lastAccessed: dbInstance.lastAccessed,
      permissions: dbInstance.permissions,
      customSettings: dbInstance.customSettings,
      aiAgents: dbInstance.aiAgents,
      contextData: dbInstance.contextData,
      collaborators: dbInstance.collaborators,
      sharedWith: dbInstance.sharedWith,
      createdAt: dbInstance.createdAt,
      updatedAt: dbInstance.updatedAt
    };
  }

  private async getCurrentCourse(userId: string): Promise<string | undefined> {
    try {
      const enrollment = await this.prisma.enrollment.findFirst({
        where: { 
          userId,
          status: 'active'
        },
        include: { course: true },
        orderBy: { enrolledAt: 'desc' }
      });

      return enrollment?.course?.id;

    } catch (error) {
      logger.warn(`Failed to get current course for user ${userId}:`, error);
      return undefined;
    }
  }
}