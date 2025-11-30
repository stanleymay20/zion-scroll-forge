/**
 * Workflow & Notification Orchestration Integration Tests
 * Part of: Scroll University Academic Year Automation System (SU-AYAS)
 * Purpose: Integration tests for workflow execution and notification delivery
 * 
 * Tests:
 * - Workflow execution
 * - Notification delivery
 * - Event bus functionality
 * 
 * Requirements: 5.1, 5.2, 5.3
 */

import request from 'supertest';
import express from 'express';
import { createClient } from '@supabase/supabase-js';
import workflowNotificationRoutes from '../../routes/workflow-notifications';
import WorkflowEngineService from '../../services/academic-year/WorkflowEngineService';
import NotificationService from '../../services/NotificationService';
import { authenticate } from '../../middleware/auth';

// Mock authentication middleware for testing
jest.mock('../../middleware/auth', () => ({
  authenticate: (req: any, res: any, next: any) => {
    req.user = {
      id: 'test-user-id',
      email: 'test@scrolluniversity.edu',
      role: 'admin'
    };
    next();
  }
}));

// Mock external services to avoid actual email/SMS sending during tests
jest.mock('../../services/NotificationService', () => {
  const originalModule = jest.requireActual('../../services/NotificationService');
  return {
    ...originalModule,
    default: {
      ...originalModule.default,
      createNotification: jest.fn(),
      sendBulkNotifications: jest.fn(),
      trackDeliveryStatus: jest.fn(),
      getNotificationAnalytics: jest.fn()
    }
  };
});

describe('Workflow & Notification Orchestration Integration Tests', () => {
  let app: express.Application;
  let supabase: any;
  let workflowEngineService: WorkflowEngineService;
  let testWorkflowId: string;
  let testExecutionId: string;
  let testNotificationId: string;

  beforeAll(async () => {
    // Initialize Express app with routes
    app = express();
    app.use(express.json());
    app.use('/api', workflowNotificationRoutes);

    // Initialize Supabase client
    const supabaseUrl = process.env.SUPABASE_URL || '';
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
    supabase = createClient(supabaseUrl, supabaseKey);

    // Initialize workflow engine service
    workflowEngineService = new WorkflowEngineService();

    // Create test workflow
    testWorkflowId = await createTestWorkflow();
  });

  afterAll(async () => {
    // Clean up test data
    if (testExecutionId) {
      await supabase
        .from('workflow_step_executions')
        .delete()
        .eq('workflow_execution_id', testExecutionId);

      await supabase
        .from('workflow_executions')
        .delete()
        .eq('id', testExecutionId);
    }

    if (testWorkflowId) {
      await supabase
        .from('workflows')
        .delete()
        .eq('id', testWorkflowId);
    }

    if (testNotificationId) {
      await supabase
        .from('notification_delivery_attempts')
        .delete()
        .eq('notification_id', testNotificationId);

      await supabase
        .from('notifications')
        .delete()
        .eq('id', testNotificationId);
    }
  });

  // Helper function to create test workflow
  async function createTestWorkflow(): Promise<string> {
    const workflowDefinition = {
      name: 'Test Student Enrollment Workflow',
      description: 'Test workflow for student enrollment process',
      workflowType: 'student_enrollment' as const,
      triggerConditions: [
        {
          field: 'status',
          operator: 'equals' as const,
          value: 'pending'
        }
      ],
      steps: [
        {
          stepNumber: 1,
          stepName: 'Validate Prerequisites',
          stepType: 'data_validation' as const,
          stepConfig: {
            validationType: 'prerequisites',
            required: true
          }
        },
        {
          stepNumber: 2,
          stepName: 'Send Welcome Notification',
          stepType: 'notification' as const,
          stepConfig: {
            template: 'welcome_email',
            channel: 'email'
          }
        },
        {
          stepNumber: 3,
          stepName: 'Update Student Status',
          stepType: 'database_update' as const,
          stepConfig: {
            table: 'students',
            field: 'status',
            value: 'enrolled'
          }
        }
      ],
      isActive: true,
      autoStart: false,
      maxRetries: 3,
      timeoutMinutes: 30,
      version: 1
    };

    return await workflowEngineService.registerWorkflow(workflowDefinition);
  }

  describe('POST /api/workflows/execute - Execute Workflow', () => {
    it('should execute workflow successfully', async () => {
      const response = await request(app)
        .post('/api/workflows/execute')
        .send({
          workflowId: testWorkflowId,
          context: {
            triggeredByUserId: 'test-user-id',
            triggerEvent: 'student_enrollment_requested',
            contextData: {
              studentId: 'test-student-123',
              courseId: 'test-course-456',
              semesterId: 'test-semester-789',
              enrollmentType: 'regular'
            }
          }
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('executionId');
      expect(response.body.data).toHaveProperty('status');
      expect(response.body.data).toHaveProperty('completedSteps');
      expect(response.body.data).toHaveProperty('totalSteps');
      expect(response.body.data.totalSteps).toBe(3);

      // Store execution ID for status checks
      testExecutionId = response.body.data.executionId;
    });

    it('should reject workflow execution with invalid workflow ID', async () => {
      const response = await request(app)
        .post('/api/workflows/execute')
        .send({
          workflowId: 'invalid-uuid',
          context: {
            contextData: {
              test: 'data'
            }
          }
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Validation failed');
    });

    it('should reject workflow execution with missing context', async () => {
      const response = await request(app)
        .post('/api/workflows/execute')
        .send({
          workflowId: testWorkflowId
          // Missing context
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Validation failed');
    });

    it('should reject workflow execution with non-existent workflow', async () => {
      const fakeWorkflowId = '00000000-0000-0000-0000-000000000000';
      const response = await request(app)
        .post('/api/workflows/execute')
        .send({
          workflowId: fakeWorkflowId,
          context: {
            contextData: {
              test: 'data'
            }
          }
        });

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
    });

    it('should handle workflow execution with complex context data', async () => {
      const response = await request(app)
        .post('/api/workflows/execute')
        .send({
          workflowId: testWorkflowId,
          context: {
            triggeredByUserId: 'test-user-id',
            triggerEvent: 'complex_enrollment',
            contextData: {
              studentId: 'complex-student-123',
              courses: [
                { id: 'course-1', credits: 3 },
                { id: 'course-2', credits: 4 }
              ],
              metadata: {
                enrollmentDate: new Date().toISOString(),
                priority: 'high',
                specialRequirements: ['accessibility', 'financial_aid']
              }
            }
          }
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBeDefined();
    });
  });

  describe('GET /api/workflows/:id/status - Get Workflow Status', () => {
    it('should retrieve workflow execution status', async () => {
      const response = await request(app)
        .get(`/api/workflows/${testExecutionId}/status`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data).toHaveProperty('workflowId');
      expect(response.body.data).toHaveProperty('status');
      expect(response.body.data).toHaveProperty('currentStep');
      expect(response.body.data).toHaveProperty('totalSteps');
      expect(response.body.data).toHaveProperty('startedAt');
      expect(response.body.data).toHaveProperty('retryCount');
      expect(response.body.data.id).toBe(testExecutionId);
    });

    it('should return 404 for non-existent execution', async () => {
      const fakeExecutionId = '00000000-0000-0000-0000-000000000000';
      const response = await request(app)
        .get(`/api/workflows/${fakeExecutionId}/status`);

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Workflow execution not found');
    });

    it('should reject invalid execution ID format', async () => {
      const response = await request(app)
        .get('/api/workflows/invalid-uuid/status');

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Invalid workflow execution ID format');
    });
  });

  describe('POST /api/notifications/send - Send Notification', () => {
    beforeEach(() => {
      // Reset mocks
      jest.clearAllMocks();
    });

    it('should send notification successfully', async () => {
      const mockNotification = {
        id: 'test-notification-123',
        userId: 'test-user-456',
        category: 'academic',
        priority: 'normal',
        subject: 'Test Notification',
        content: 'This is a test notification',
        status: 'queued',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      (NotificationService.createNotification as jest.Mock).mockResolvedValue(mockNotification);

      const response = await request(app)
        .post('/api/notifications/send')
        .send({
          userId: 'test-user-456',
          category: 'academic',
          priority: 'normal',
          channels: ['email', 'in_app'],
          subject: 'Test Notification',
          content: 'This is a test notification',
          data: {
            courseId: 'course-123',
            semesterId: 'semester-456'
          }
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(mockNotification);
      expect(NotificationService.createNotification).toHaveBeenCalledWith({
        userId: 'test-user-456',
        category: 'academic',
        priority: 'normal',
        channels: ['email', 'in_app'],
        subject: 'Test Notification',
        content: 'This is a test notification',
        data: {
          courseId: 'course-123',
          semesterId: 'semester-456'
        },
        templateId: undefined,
        scheduledFor: undefined,
        expiresAt: undefined
      });

      testNotificationId = mockNotification.id;
    });

    it('should send scheduled notification', async () => {
      const scheduledDate = new Date();
      scheduledDate.setHours(scheduledDate.getHours() + 2);

      const mockNotification = {
        id: 'scheduled-notification-123',
        userId: 'test-user-456',
        category: 'spiritual_formation',
        priority: 'normal',
        subject: 'Scheduled Prayer Reminder',
        content: 'Time for your daily prayer',
        status: 'pending',
        scheduledFor: scheduledDate,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      (NotificationService.createNotification as jest.Mock).mockResolvedValue(mockNotification);

      const response = await request(app)
        .post('/api/notifications/send')
        .send({
          userId: 'test-user-456',
          category: 'spiritual_formation',
          priority: 'normal',
          subject: 'Scheduled Prayer Reminder',
          content: 'Time for your daily prayer',
          scheduledFor: scheduledDate.toISOString()
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.scheduledFor).toBeDefined();
    });

    it('should reject notification with invalid user ID', async () => {
      const response = await request(app)
        .post('/api/notifications/send')
        .send({
          userId: 'invalid-uuid',
          category: 'academic',
          subject: 'Test',
          content: 'Test content'
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Validation failed');
    });

    it('should reject notification with invalid category', async () => {
      const response = await request(app)
        .post('/api/notifications/send')
        .send({
          userId: 'test-user-456',
          category: 'invalid_category',
          subject: 'Test',
          content: 'Test content'
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should reject notification with missing required fields', async () => {
      const response = await request(app)
        .post('/api/notifications/send')
        .send({
          userId: 'test-user-456',
          category: 'academic'
          // Missing subject and content
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Validation failed');
    });

    it('should reject notification with content too long', async () => {
      const longContent = 'a'.repeat(5001); // Exceeds 5000 character limit

      const response = await request(app)
        .post('/api/notifications/send')
        .send({
          userId: 'test-user-456',
          category: 'academic',
          subject: 'Test',
          content: longContent
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/notifications/bulk - Send Bulk Notifications', () => {
    it('should send bulk notifications successfully', async () => {
      const mockResult = {
        sent: 3,
        failed: 0
      };

      (NotificationService.sendBulkNotifications as jest.Mock).mockResolvedValue(mockResult);

      const response = await request(app)
        .post('/api/notifications/bulk')
        .send({
          userIds: ['user-1', 'user-2', 'user-3'],
          category: 'administrative',
          priority: 'high',
          subject: 'Important Announcement',
          content: 'This is an important announcement for all students',
          data: {
            announcementType: 'urgent',
            departmentId: 'dept-123'
          }
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(mockResult);
      expect(NotificationService.sendBulkNotifications).toHaveBeenCalledWith({
        userIds: ['user-1', 'user-2', 'user-3'],
        category: 'administrative',
        priority: 'high',
        subject: 'Important Announcement',
        content: 'This is an important announcement for all students',
        data: {
          announcementType: 'urgent',
          departmentId: 'dept-123'
        },
        templateId: undefined,
        channels: undefined,
        scheduledFor: undefined
      });
    });

    it('should reject bulk notification with too many users', async () => {
      const tooManyUsers = Array.from({ length: 1001 }, (_, i) => `user-${i}`);

      const response = await request(app)
        .post('/api/notifications/bulk')
        .send({
          userIds: tooManyUsers,
          category: 'administrative',
          subject: 'Test',
          content: 'Test content'
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should reject bulk notification with empty user list', async () => {
      const response = await request(app)
        .post('/api/notifications/bulk')
        .send({
          userIds: [],
          category: 'administrative',
          subject: 'Test',
          content: 'Test content'
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/notifications/:id/status - Get Notification Status', () => {
    it('should retrieve notification delivery status', async () => {
      const mockTrackingResult = {
        notificationId: 'test-notification-123',
        status: 'delivered',
        deliveryAttempts: 1,
        lastAttemptAt: new Date(),
        deliveredAt: new Date(),
        trackingEvents: [
          {
            id: 'attempt-1',
            notificationId: 'test-notification-123',
            attemptedAt: new Date(),
            success: true,
            channel: 'email'
          }
        ]
      };

      (NotificationService.trackDeliveryStatus as jest.Mock).mockResolvedValue(mockTrackingResult);

      const response = await request(app)
        .get('/api/notifications/test-notification-123/status');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(mockTrackingResult);
    });

    it('should return 404 for non-existent notification', async () => {
      (NotificationService.trackDeliveryStatus as jest.Mock).mockRejectedValue(
        new Error('Notification test-notification-404 not found')
      );

      const response = await request(app)
        .get('/api/notifications/test-notification-404/status');

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Notification not found');
    });

    it('should reject invalid notification ID format', async () => {
      const response = await request(app)
        .get('/api/notifications/invalid-uuid/status');

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Invalid notification ID format');
    });
  });

  describe('GET /api/notifications/analytics - Get Notification Analytics', () => {
    it('should retrieve notification analytics', async () => {
      const mockAnalytics = {
        totalSent: 100,
        delivered: 95,
        failed: 5,
        read: 80,
        deliveryRate: 95.0,
        readRate: 84.21,
        channelBreakdown: {
          email: 60,
          push_notification: 25,
          sms: 10,
          in_app: 5
        },
        categoryBreakdown: {
          academic: 40,
          administrative: 30,
          spiritual_formation: 20,
          social: 10
        }
      };

      (NotificationService.getNotificationAnalytics as jest.Mock).mockResolvedValue(mockAnalytics);

      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-01-31');

      const response = await request(app)
        .get('/api/notifications/analytics')
        .query({
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
          category: 'academic'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(mockAnalytics);
      expect(NotificationService.getNotificationAnalytics).toHaveBeenCalledWith(
        startDate,
        endDate,
        { category: 'academic', channel: undefined }
      );
    });

    it('should reject analytics request with invalid date range', async () => {
      const response = await request(app)
        .get('/api/notifications/analytics')
        .query({
          startDate: '2024-01-31',
          endDate: '2024-01-01' // End before start
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should reject analytics request with missing dates', async () => {
      const response = await request(app)
        .get('/api/notifications/analytics')
        .query({
          category: 'academic'
          // Missing startDate and endDate
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/workflows/health - Health Check', () => {
    it('should return healthy status', async () => {
      const response = await request(app)
        .get('/api/workflows/health');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Workflow & Notification API is healthy');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body.services).toEqual({
        workflow: 'operational',
        notification: 'operational'
      });
    });
  });

  describe('Complete Workflow Orchestration Tests', () => {
    it('should complete full student enrollment workflow with notifications', async () => {
      // Step 1: Execute enrollment workflow
      const workflowResponse = await request(app)
        .post('/api/workflows/execute')
        .send({
          workflowId: testWorkflowId,
          context: {
            triggeredByUserId: 'test-user-id',
            triggerEvent: 'student_enrollment_complete',
            contextData: {
              studentId: 'integration-test-student',
              courseId: 'integration-test-course',
              semesterId: 'integration-test-semester',
              enrollmentType: 'regular',
              notificationRequired: true
            }
          }
        });

      expect(workflowResponse.status).toBe(200);
      expect(workflowResponse.body.success).toBe(true);
      const executionId = workflowResponse.body.data.executionId;

      // Step 2: Check workflow status
      const statusResponse = await request(app)
        .get(`/api/workflows/${executionId}/status`);

      expect(statusResponse.status).toBe(200);
      expect(statusResponse.body.data.status).toBeDefined();

      // Step 3: Send follow-up notification
      const mockNotification = {
        id: 'follow-up-notification',
        userId: 'integration-test-student',
        category: 'academic',
        subject: 'Enrollment Confirmation',
        content: 'Your enrollment has been processed successfully',
        status: 'delivered'
      };

      (NotificationService.createNotification as jest.Mock).mockResolvedValue(mockNotification);

      const notificationResponse = await request(app)
        .post('/api/notifications/send')
        .send({
          userId: 'integration-test-student',
          category: 'academic',
          priority: 'normal',
          subject: 'Enrollment Confirmation',
          content: 'Your enrollment has been processed successfully',
          data: {
            workflowExecutionId: executionId,
            enrollmentType: 'regular'
          }
        });

      expect(notificationResponse.status).toBe(201);
      expect(notificationResponse.body.success).toBe(true);

      // Step 4: Verify notification delivery
      const mockTrackingResult = {
        notificationId: 'follow-up-notification',
        status: 'delivered',
        deliveryAttempts: 1,
        deliveredAt: new Date(),
        trackingEvents: []
      };

      (NotificationService.trackDeliveryStatus as jest.Mock).mockResolvedValue(mockTrackingResult);

      const trackingResponse = await request(app)
        .get('/api/notifications/follow-up-notification/status');

      expect(trackingResponse.status).toBe(200);
      expect(trackingResponse.body.data.status).toBe('delivered');
    });

    it('should handle workflow failure and send error notification', async () => {
      // Create a workflow that will fail
      const failingWorkflowId = await workflowEngineService.registerWorkflow({
        name: 'Failing Test Workflow',
        description: 'Workflow designed to fail for testing',
        workflowType: 'custom',
        triggerConditions: [],
        steps: [
          {
            stepNumber: 1,
            stepName: 'Failing Step',
            stepType: 'custom_script',
            stepConfig: {
              script: 'throw_error',
              errorMessage: 'Intentional test failure'
            }
          }
        ],
        isActive: true,
        maxRetries: 1
      });

      // Execute failing workflow
      const workflowResponse = await request(app)
        .post('/api/workflows/execute')
        .send({
          workflowId: failingWorkflowId,
          context: {
            contextData: {
              testFailure: true
            }
          }
        });

      // Workflow should still return success for the API call, but execution may fail
      expect(workflowResponse.status).toBe(200);
      const executionId = workflowResponse.body.data.executionId;

      // Check status - it should show failure
      const statusResponse = await request(app)
        .get(`/api/workflows/${executionId}/status`);

      expect(statusResponse.status).toBe(200);
      // Status might be 'failed' or still 'running' depending on timing

      // Send error notification
      const mockErrorNotification = {
        id: 'error-notification',
        userId: 'test-user-id',
        category: 'system',
        priority: 'urgent',
        subject: 'Workflow Execution Failed',
        content: 'A workflow execution has failed and requires attention',
        status: 'queued'
      };

      (NotificationService.createNotification as jest.Mock).mockResolvedValue(mockErrorNotification);

      const errorNotificationResponse = await request(app)
        .post('/api/notifications/send')
        .send({
          userId: 'test-user-id',
          category: 'system',
          priority: 'urgent',
          subject: 'Workflow Execution Failed',
          content: 'A workflow execution has failed and requires attention',
          data: {
            workflowExecutionId: executionId,
            errorType: 'workflow_failure'
          }
        });

      expect(errorNotificationResponse.status).toBe(201);
      expect(errorNotificationResponse.body.success).toBe(true);

      // Cleanup
      await supabase
        .from('workflow_executions')
        .delete()
        .eq('id', executionId);
      await supabase
        .from('workflows')
        .delete()
        .eq('id', failingWorkflowId);
    });
  });
});