/**
 * Zapier Webhook Type Definitions
 * "Let all things be done decently and in order" - 1 Corinthians 14:40
 */

// ============================================================================
// ENROLLMENT WEBHOOK TYPES
// ============================================================================

export interface EnrollmentAccessGrantPayload {
  userId: string;
  courseId: string;
  enrollmentId?: string;
  accessLevel?: 'full' | 'limited' | 'audit';
  grantedBy?: string;
  notes?: string;
}

export interface EnrollmentAccessRevokePayload {
  userId: string;
  courseId: string;
  enrollmentId?: string;
  reason: string;
  revokedBy?: string;
}

export interface EnrollmentStatusUpdatePayload {
  enrollmentId: string;
  status: 'active' | 'suspended' | 'completed' | 'withdrawn';
  notes?: string;
  updatedBy?: string;
}

// ============================================================================
// GRADE UPDATE WEBHOOK TYPES
// ============================================================================

export interface GradeUpdatePayload {
  studentId: string;
  courseId: string;
  assignmentId: string;
  grade: number;
  feedback?: string;
  gradedBy: string;
  gradedAt?: string;
}

export interface BatchGradeUpdatePayload {
  grades: GradeUpdatePayload[];
}

export interface GradeUpdateResult {
  successful: number;
  failed: number;
  errors: string[];
}

// ============================================================================
// DATA SYNC WEBHOOK TYPES
// ============================================================================

export interface StudentDataSyncPayload {
  studentId: string;
  updates: Record<string, any>;
  sourceSystem: 'airtable' | 'crm' | 'lms' | 'billing' | 'scrolluniversity';
  syncTimestamp?: string;
}

export interface CourseDataSyncPayload {
  courseId: string;
  updates: Record<string, any>;
  sourceSystem: 'airtable' | 'lms' | 'marketing' | 'scrolluniversity';
  syncTimestamp?: string;
}

export interface DataSyncResult {
  success: boolean;
  syncedAt: string;
  fieldsUpdated: string[];
  conflicts?: string[];
}

// ============================================================================
// NOTIFICATION WEBHOOK TYPES
// ============================================================================

export type NotificationChannel = 'email' | 'sms' | 'push' | 'slack';
export type NotificationPriority = 'low' | 'normal' | 'high' | 'urgent';

export interface NotificationPayload {
  userId: string;
  type: string;
  title?: string;
  message: string;
  channels?: NotificationChannel[];
  priority?: NotificationPriority;
  metadata?: Record<string, any>;
}

export interface NotificationResult {
  success: boolean;
  sentAt: string;
  channels: NotificationChannel[];
  deliveryStatus?: Record<NotificationChannel, 'sent' | 'failed' | 'pending'>;
}

// ============================================================================
// WEBHOOK RESPONSE TYPES
// ============================================================================

export interface WebhookSuccessResponse<T = any> {
  success: true;
  message: string;
  data: T;
  timestamp?: string;
}

export interface WebhookErrorResponse {
  success: false;
  error: string;
  details?: string;
  timestamp?: string;
}

export type WebhookResponse<T = any> = WebhookSuccessResponse<T> | WebhookErrorResponse;

// ============================================================================
// WEBHOOK SECURITY TYPES
// ============================================================================

export interface WebhookSignatureHeaders {
  'x-zapier-signature': string;
  'x-zapier-timestamp'?: string;
  'x-zapier-request-id'?: string;
}

export interface WebhookVerificationResult {
  valid: boolean;
  reason?: string;
}

// ============================================================================
// WEBHOOK LOGGING TYPES
// ============================================================================

export interface WebhookLogEntry {
  webhookId: string;
  endpoint: string;
  method: string;
  payload: any;
  response: WebhookResponse;
  statusCode: number;
  duration: number;
  timestamp: string;
  sourceIp?: string;
  error?: string;
}

// ============================================================================
// WEBHOOK CONFIGURATION TYPES
// ============================================================================

export interface WebhookEndpointConfig {
  path: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  requiresAuth: boolean;
  requiresSignature: boolean;
  rateLimit?: {
    maxRequests: number;
    windowMs: number;
  };
  timeout?: number;
}

export interface ZapierWebhookConfig {
  secret: string;
  endpoints: WebhookEndpointConfig[];
  retryPolicy?: {
    maxRetries: number;
    backoffMs: number;
  };
}
