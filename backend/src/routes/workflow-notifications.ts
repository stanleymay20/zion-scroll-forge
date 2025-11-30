/**
 * Workflow & Notification API Routes
 * Part of: Scroll University Academic Year Automation System (SU-AYAS)
 * Purpose: RESTful API endpoints for workflow execution and notification management
 * 
 * Endpoints:
 * - POST /api/workflows/execute - Execute workflow
 * - GET /api/workflows/:id/status - Get workflow status
 * - POST /api/notifications/send - Send notification
 * - GET /api/notifications/:id/status - Get notification delivery status
 * - POST /api/notifications/bulk - Send bulk notifications
 * - GET /api/notifications/analytics - Get notification analytics
 * 
 * Requirements: 5.1, 5.2, 5.3
 */

import express, { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import WorkflowEngineService from '../services/academic-year/WorkflowEngineService';
import NotificationService from '../services/NotificationService';
import { authenticate } from '../middleware/auth';
import { logger } from '../utils/productionLogger';
import {
  WorkflowDefinition,
  WorkflowContext,
  WorkflowStatus
} from '../services/academic-year/WorkflowEngineService';
import {
  CreateNotificationRequest,
  BulkNotificationRequest,
  NotificationChannel,
  NotificationCategory,
  NotificationPriority
} from '../types/notification.types';

// Extend Express Request type to include user
interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

const router = express.Router();
const workflowEngineService = new WorkflowEngineService();

// Constants
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// =====================================================
// VALIDATION SCHEMAS
// =====================================================

const executeWorkflowSchema = Joi.object({
  workflowId: Joi.string().uuid().required()
    .messages({
      'string.guid': 'Workflow ID must be a valid UUID',
      'any.required': 'Workflow ID is required'
    }),
  context: Joi.object({
    triggeredByUserId: Joi.string().uuid().optional(),
    triggerEvent: Joi.string().optional(),
    contextData: Joi.object().required()
  }).required()
    .messages({
      'any.required': 'Workflow context is required'
    })
});

const sendNotificationSchema = Joi.object({
  userId: Joi.string().uuid().required()
    .messages({
      'string.guid': 'User ID must be a valid UUID',
      'any.required': 'User ID is required'
    }),
  templateId: Joi.string().uuid().optional(),
  category: Joi.string().valid(
    'academic', 'spiritual_formation', 'social', 'administrative', 
    'payment', 'system', 'marketing', 'emergency'
  ).required()
    .messages({
      'any.only': 'Category must be one of: academic, spiritual_formation, social, administrative, payment, system, marketing, emergency',
      'any.required': 'Category is required'
    }),
  priority: Joi.string().valid('low', 'normal', 'high', 'urgent', 'critical').optional()
    .messages({
      'any.only': 'Priority must be one of: low, normal, high, urgent, critical'
    }),
  channels: Joi.array().items(
    Joi.string().valid('email', 'push_notification', 'sms', 'websocket', 'in_app', 'webhook')
  ).optional()
    .messages({
      'array.includes': 'Channels must contain valid notification channels'
    }),
  subject: Joi.string().min(1).max(200).required()
    .messages({
      'string.empty': 'Subject is required',
      'string.max': 'Subject must not exceed 200 characters',
      'any.required': 'Subject is required'
    }),
  content: Joi.string().min(1).max(5000).required()
    .messages({
      'string.empty': 'Content is required',
      'string.max': 'Content must not exceed 5000 characters',
      'any.required': 'Content is required'
    }),
  data: Joi.object().optional(),
  scheduledFor: Joi.date().iso().optional()
    .messages({
      'date.base': 'Scheduled date must be a valid date'
    }),
  expiresAt: Joi.date().iso().optional()
    .messages({
      'date.base': 'Expiration date must be a valid date'
    })
});

const bulkNotificationSchema = Joi.object({
  userIds: Joi.array().items(Joi.string().uuid()).min(1).max(1000).required()
    .messages({
      'array.min': 'At least one user ID is required',
      'array.max': 'Cannot send to more than 1000 users at once',
      'any.required': 'User IDs are required'
    }),
  templateId: Joi.string().uuid().optional(),
  category: Joi.string().valid(
    'academic', 'spiritual_formation', 'social', 'administrative', 
    'payment', 'system', 'marketing', 'emergency'
  ).required(),
  priority: Joi.string().valid('low', 'normal', 'high', 'urgent', 'critical').optional(),
  channels: Joi.array().items(
    Joi.string().valid('email', 'push_notification', 'sms', 'websocket', 'in_app', 'webhook')
  ).optional(),
  subject: Joi.string().min(1).max(200).required(),
  content: Joi.string().min(1).max(5000).required(),
  data: Joi.object().optional(),
  scheduledFor: Joi.date().iso().optional()
});

const analyticsQuerySchema = Joi.object({
  startDate: Joi.date().iso().required()
    .messages({
      'date.base': 'Start date must be a valid date',
      'any.required': 'Start date is required'
    }),
  endDate: Joi.date().iso().min(Joi.ref('startDate')).required()
    .messages({
      'date.base': 'End date must be a valid date',
      'date.min': 'End date must be after start date',
      'any.required': 'End date is required'
    }),
  category: Joi.string().valid(
    'academic', 'spiritual_formation', 'social', 'administrative', 
    'payment', 'system', 'marketing', 'emergency'
  ).optional(),
  channel: Joi.string().valid('email', 'push_notification', 'sms', 'websocket', 'in_app', 'webhook').optional()
});

// =====================================================
// WORKFLOW API ENDPOINTS
// =====================================================

/**
 * POST /api/workflows/execute
 * Execute a workflow with provided context
 * 
 * Requirements: 5.1
 */
router.post('/workflows/execute', authenticate, async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { error, value } = executeWorkflowSchema.validate(req.body);
    if (error) {
      res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: error.details.map(d => d.message)
      });
      return;
    }

    const { workflowId, context } = value;

    // Add user context if not provided
    const workflowContext: WorkflowContext = {
      ...context,
      triggeredByUserId: context.triggeredByUserId || req.user?.id
    };

    const result = await workflowEngineService.executeWorkflow(workflowId, workflowContext);

    logger.info('Workflow executed', {
      workflowId,
      executionId: result.executionId,
      status: result.status,
      userId: req.user?.id
    });

    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    logger.error('Error executing workflow', {
      error: error instanceof Error ? error.message : 'Unknown error',
      workflowId: req.body.workflowId,
      userId: req.user?.id
    });
    next(error);
  }
});

/**
 * GET /api/workflows/:id/status
 * Get workflow execution status
 * 
 * Requirements: 5.1
 */
router.get('/workflows/:id/status', authenticate, async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;

    if (!UUID_REGEX.test(id)) {
      res.status(400).json({
        success: false,
        error: 'Invalid workflow execution ID format'
      });
      return;
    }

    const execution = await workflowEngineService.getExecutionStatus(id);

    res.json({
      success: true,
      data: execution
    });
  } catch (error) {
    logger.error('Error fetching workflow status', {
      error: error instanceof Error ? error.message : 'Unknown error',
      executionId: req.params.id,
      userId: req.user?.id
    });
    
    if (error instanceof Error && error.message.includes('not found')) {
      res.status(404).json({
        success: false,
        error: 'Workflow execution not found'
      });
      return;
    }
    
    next(error);
  }
});

// =====================================================
// NOTIFICATION API ENDPOINTS
// =====================================================

/**
 * POST /api/notifications/send
 * Send a single notification
 * 
 * Requirements: 5.2
 */
router.post('/notifications/send', authenticate, async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { error, value } = sendNotificationSchema.validate(req.body);
    if (error) {
      res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: error.details.map(d => d.message)
      });
      return;
    }

    const notificationRequest: CreateNotificationRequest = {
      userId: value.userId,
      templateId: value.templateId,
      category: value.category as NotificationCategory,
      priority: value.priority as NotificationPriority,
      channels: value.channels as NotificationChannel[],
      subject: value.subject,
      content: value.content,
      data: value.data,
      scheduledFor: value.scheduledFor ? new Date(value.scheduledFor) : undefined,
      expiresAt: value.expiresAt ? new Date(value.expiresAt) : undefined
    };

    const notification = await NotificationService.createNotification(notificationRequest);

    logger.info('Notification sent', {
      notificationId: notification.id,
      userId: notification.userId,
      category: notification.category,
      priority: notification.priority,
      sentBy: req.user?.id
    });

    res.status(201).json({
      success: true,
      data: notification
    });
  } catch (error) {
    logger.error('Error sending notification', {
      error: error instanceof Error ? error.message : 'Unknown error',
      userId: req.body.userId,
      sentBy: req.user?.id
    });
    next(error);
  }
});

/**
 * POST /api/notifications/bulk
 * Send bulk notifications
 * 
 * Requirements: 5.2
 */
router.post('/notifications/bulk', authenticate, async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { error, value } = bulkNotificationSchema.validate(req.body);
    if (error) {
      res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: error.details.map(d => d.message)
      });
      return;
    }

    const bulkRequest: BulkNotificationRequest = {
      userIds: value.userIds,
      templateId: value.templateId,
      category: value.category as NotificationCategory,
      priority: value.priority as NotificationPriority,
      channels: value.channels as NotificationChannel[],
      subject: value.subject,
      content: value.content,
      data: value.data,
      scheduledFor: value.scheduledFor ? new Date(value.scheduledFor) : undefined
    };

    const result = await NotificationService.sendBulkNotifications(bulkRequest);

    logger.info('Bulk notifications sent', {
      totalUsers: value.userIds.length,
      sent: result.sent,
      failed: result.failed,
      category: value.category,
      sentBy: req.user?.id
    });

    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    logger.error('Error sending bulk notifications', {
      error: error instanceof Error ? error.message : 'Unknown error',
      userCount: req.body.userIds?.length,
      sentBy: req.user?.id
    });
    next(error);
  }
});

/**
 * GET /api/notifications/:id/status
 * Get notification delivery status
 * 
 * Requirements: 5.2
 */
router.get('/notifications/:id/status', authenticate, async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;

    if (!UUID_REGEX.test(id)) {
      res.status(400).json({
        success: false,
        error: 'Invalid notification ID format'
      });
      return;
    }

    const trackingResult = await NotificationService.trackDeliveryStatus(id);

    res.json({
      success: true,
      data: trackingResult
    });
  } catch (error) {
    logger.error('Error fetching notification status', {
      error: error instanceof Error ? error.message : 'Unknown error',
      notificationId: req.params.id,
      userId: req.user?.id
    });
    
    if (error instanceof Error && error.message.includes('not found')) {
      res.status(404).json({
        success: false,
        error: 'Notification not found'
      });
      return;
    }
    
    next(error);
  }
});

/**
 * GET /api/notifications/analytics
 * Get notification analytics
 * 
 * Requirements: 5.2
 */
router.get('/notifications/analytics', authenticate, async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { error, value } = analyticsQuerySchema.validate(req.query);
    if (error) {
      res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: error.details.map(d => d.message)
      });
      return;
    }

    const { startDate, endDate, category, channel } = value;

    const analytics = await NotificationService.getNotificationAnalytics(
      new Date(startDate),
      new Date(endDate),
      { category, channel }
    );

    res.json({
      success: true,
      data: analytics
    });
  } catch (error) {
    logger.error('Error fetching notification analytics', {
      error: error instanceof Error ? error.message : 'Unknown error',
      userId: req.user?.id
    });
    next(error);
  }
});

/**
 * GET /api/workflows/health
 * Health check endpoint for workflow system
 */
router.get('/workflows/health', (_req: Request, res: Response): void => {
  res.json({
    success: true,
    message: 'Workflow & Notification API is healthy',
    timestamp: new Date().toISOString(),
    services: {
      workflow: 'operational',
      notification: 'operational'
    }
  });
});

export default router;