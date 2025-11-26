/**
 * ScrollOS Academic Tools Integration API Routes
 * 
 * Provides REST API endpoints for managing tool instances, state persistence,
 * and cross-tool communication within the ScrollOS academic platform.
 */

import { Router, Request, Response } from 'express';
import { auth } from '../middleware/auth';
import { rbac } from '../middleware/rbac';
import { inputValidation } from '../middleware/inputValidation';
import { ScrollOSToolsService } from '../services/ScrollOSToolsService';
import { ToolManifestService } from '../services/ToolManifestService';
import { ToolInstanceService } from '../services/ToolInstanceService';
import { ToolSecurityService } from '../services/ToolSecurityService';
import { logger } from '../utils/logger';

const router = Router();

// Apply authentication to all routes
router.use(auth);

/**
 * Get available tool manifests for user
 */
router.get('/manifests', 
  rbac(['student', 'faculty', 'admin']),
  async (req: Request, res: Response) => {
    try {
      const userId = req.user?.id;
      const discipline = req.query.discipline as string;
      
      const manifestService = new ToolManifestService();
      const manifests = await manifestService.getAvailableManifests(userId, discipline);
      
      res.json({
        success: true,
        data: manifests,
        timestamp: new Date(),
        requestId: req.headers['x-request-id']
      });
      
    } catch (error) {
      logger.error('Failed to get tool manifests:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve tool manifests',
        timestamp: new Date(),
        requestId: req.headers['x-request-id']
      });
    }
  }
);

/**
 * Launch a tool instance
 */
router.post('/instances/launch',
  rbac(['student', 'faculty', 'admin']),
  inputValidation({
    manifestId: { type: 'string', required: true },
    projectId: { type: 'string', required: false },
    initialState: { type: 'object', required: false }
  }),
  async (req: Request, res: Response) => {
    try {
      const { manifestId, projectId, initialState } = req.body;
      const userId = req.user?.id;
      
      const toolsService = new ScrollOSToolsService();
      const instance = await toolsService.launchTool({
        manifestId,
        userId,
        projectId,
        initialState
      });
      
      logger.info(`Tool launched: ${manifestId} for user ${userId}`);
      
      res.json({
        success: true,
        data: instance,
        timestamp: new Date(),
        requestId: req.headers['x-request-id']
      });
      
    } catch (error) {
      logger.error('Failed to launch tool:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to launch tool',
        timestamp: new Date(),
        requestId: req.headers['x-request-id']
      });
    }
  }
);

/**
 * Save tool instance state
 */
router.post('/tool-instances/state',
  rbac(['student', 'faculty', 'admin']),
  inputValidation({
    instanceId: { type: 'string', required: true },
    state: { type: 'object', required: true }
  }),
  async (req: Request, res: Response) => {
    try {
      const { instanceId, state } = req.body;
      const userId = req.user?.id;
      
      const instanceService = new ToolInstanceService();
      
      // Verify user owns this instance
      const instance = await instanceService.getInstance(instanceId);
      if (instance.userId !== userId) {
        return res.status(403).json({
          success: false,
          error: 'Access denied to tool instance',
          timestamp: new Date(),
          requestId: req.headers['x-request-id']
        });
      }
      
      await instanceService.saveState(instanceId, state);
      
      res.json({
        success: true,
        timestamp: new Date(),
        requestId: req.headers['x-request-id']
      });
      
    } catch (error) {
      logger.error('Failed to save tool state:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to save tool state',
        timestamp: new Date(),
        requestId: req.headers['x-request-id']
      });
    }
  }
);

/**
 * Get tool instance state
 */
router.get('/tool-instances/:instanceId/state',
  rbac(['student', 'faculty', 'admin']),
  async (req: Request, res: Response) => {
    try {
      const { instanceId } = req.params;
      const userId = req.user?.id;
      
      const instanceService = new ToolInstanceService();
      
      // Verify user has access to this instance
      const instance = await instanceService.getInstance(instanceId);
      const hasAccess = instance.userId === userId || 
                       instance.collaborators.includes(userId) ||
                       req.user?.role === 'admin';
      
      if (!hasAccess) {
        return res.status(403).json({
          success: false,
          error: 'Access denied to tool instance',
          timestamp: new Date(),
          requestId: req.headers['x-request-id']
        });
      }
      
      const state = await instanceService.getState(instanceId);
      
      res.json({
        success: true,
        data: state,
        timestamp: new Date(),
        requestId: req.headers['x-request-id']
      });
      
    } catch (error) {
      logger.error('Failed to get tool state:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve tool state',
        timestamp: new Date(),
        requestId: req.headers['x-request-id']
      });
    }
  }
);

/**
 * Close tool instance
 */
router.delete('/tool-instances/:instanceId',
  rbac(['student', 'faculty', 'admin']),
  async (req: Request, res: Response) => {
    try {
      const { instanceId } = req.params;
      const userId = req.user?.id;
      
      const instanceService = new ToolInstanceService();
      
      // Verify user owns this instance
      const instance = await instanceService.getInstance(instanceId);
      if (instance.userId !== userId && req.user?.role !== 'admin') {
        return res.status(403).json({
          success: false,
          error: 'Access denied to tool instance',
          timestamp: new Date(),
          requestId: req.headers['x-request-id']
        });
      }
      
      await instanceService.closeInstance(instanceId);
      
      logger.info(`Tool instance closed: ${instanceId} by user ${userId}`);
      
      res.json({
        success: true,
        timestamp: new Date(),
        requestId: req.headers['x-request-id']
      });
      
    } catch (error) {
      logger.error('Failed to close tool instance:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to close tool instance',
        timestamp: new Date(),
        requestId: req.headers['x-request-id']
      });
    }
  }
);

/**
 * Send message to tool instance
 */
router.post('/tool-instances/:instanceId/messages',
  rbac(['student', 'faculty', 'admin']),
  inputValidation({
    message: { type: 'object', required: true }
  }),
  async (req: Request, res: Response) => {
    try {
      const { instanceId } = req.params;
      const { message } = req.body;
      const userId = req.user?.id;
      
      const instanceService = new ToolInstanceService();
      
      // Verify user has access to this instance
      const instance = await instanceService.getInstance(instanceId);
      const hasAccess = instance.userId === userId || 
                       instance.collaborators.includes(userId);
      
      if (!hasAccess) {
        return res.status(403).json({
          success: false,
          error: 'Access denied to tool instance',
          timestamp: new Date(),
          requestId: req.headers['x-request-id']
        });
      }
      
      const response = await instanceService.sendMessage(instanceId, message);
      
      res.json({
        success: true,
        data: response,
        timestamp: new Date(),
        requestId: req.headers['x-request-id']
      });
      
    } catch (error) {
      logger.error('Failed to send message to tool:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to send message to tool',
        timestamp: new Date(),
        requestId: req.headers['x-request-id']
      });
    }
  }
);

/**
 * Get user's active tool instances
 */
router.get('/instances/active',
  rbac(['student', 'faculty', 'admin']),
  async (req: Request, res: Response) => {
    try {
      const userId = req.user?.id;
      
      const instanceService = new ToolInstanceService();
      const instances = await instanceService.getActiveInstances(userId);
      
      res.json({
        success: true,
        data: instances,
        timestamp: new Date(),
        requestId: req.headers['x-request-id']
      });
      
    } catch (error) {
      logger.error('Failed to get active instances:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve active instances',
        timestamp: new Date(),
        requestId: req.headers['x-request-id']
      });
    }
  }
);

/**
 * Validate tool permissions
 */
router.post('/instances/validate-permissions',
  rbac(['student', 'faculty', 'admin']),
  inputValidation({
    manifestId: { type: 'string', required: true },
    requiredPermissions: { type: 'array', required: true }
  }),
  async (req: Request, res: Response) => {
    try {
      const { manifestId, requiredPermissions } = req.body;
      const userId = req.user?.id;
      
      const securityService = new ToolSecurityService();
      const hasPermissions = await securityService.validatePermissions(
        userId, 
        manifestId, 
        requiredPermissions
      );
      
      res.json({
        success: true,
        data: { hasPermissions },
        timestamp: new Date(),
        requestId: req.headers['x-request-id']
      });
      
    } catch (error) {
      logger.error('Failed to validate permissions:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to validate permissions',
        timestamp: new Date(),
        requestId: req.headers['x-request-id']
      });
    }
  }
);

/**
 * Get tool integration health status
 */
router.get('/health/:toolId',
  rbac(['admin', 'faculty']),
  async (req: Request, res: Response) => {
    try {
      const { toolId } = req.params;
      
      const toolsService = new ScrollOSToolsService();
      const health = await toolsService.checkToolHealth(toolId);
      
      res.json({
        success: true,
        data: health,
        timestamp: new Date(),
        requestId: req.headers['x-request-id']
      });
      
    } catch (error) {
      logger.error('Failed to check tool health:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to check tool health',
        timestamp: new Date(),
        requestId: req.headers['x-request-id']
      });
    }
  }
);

export default router;