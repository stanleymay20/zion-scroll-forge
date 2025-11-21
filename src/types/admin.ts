/**
 * Admin Dashboard Types
 * Type definitions for admin functionality
 */

// ============================================================================
// System Health Types
// ============================================================================

export interface SystemHealth {
  status: 'healthy' | 'degraded' | 'critical';
  timestamp: Date;
  services: ServiceHealth[];
  metrics: SystemMetrics;
  alerts: SystemAlert[];
}

export interface ServiceHealth {
  name: string;
  status: 'up' | 'down' | 'degraded';
  responseTime: number;
  uptime: number;
  lastCheck: Date;
  errorRate: number;
  details?: Record<string, any>;
}

export interface SystemMetrics {
  cpu: {
    usage: number;
    cores: number;
    load: number[];
  };
  memory: {
    total: number;
    used: number;
    free: number;
    percentage: number;
  };
  database: {
    connections: number;
    maxConnections: number;
    queryTime: number;
    slowQueries: number;
  };
  storage: {
    total: number;
    used: number;
    free: number;
    percentage: number;
  };
  network: {
    requestsPerMinute: number;
    bandwidth: number;
    activeConnections: number;
  };
}

export interface SystemAlert {
  id: string;
  severity: 'info' | 'warning' | 'error' | 'critical';
  title: string;
  message: string;
  source: string;
  timestamp: Date;
  acknowledged: boolean;
  resolvedAt?: Date;
}

// ============================================================================
// User Management Types
// ============================================================================

export type UserRole = 'student' | 'faculty' | 'admin' | 'moderator' | 'support';

export interface AdminUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  status: 'active' | 'suspended' | 'inactive';
  emailVerified: boolean;
  createdAt: Date;
  lastLogin?: Date;
  enrollmentCount?: number;
  courseCount?: number;
  metadata?: Record<string, any>;
}

export interface UserManagementFilters {
  role?: UserRole;
  status?: 'active' | 'suspended' | 'inactive';
  search?: string;
  dateRange?: {
    startDate: Date;
    endDate: Date;
  };
}

export interface RoleAssignment {
  userId: string;
  role: UserRole;
  assignedBy: string;
  assignedAt: Date;
  reason?: string;
}

// ============================================================================
// Course Approval Types
// ============================================================================

export type CourseApprovalStatus = 'pending' | 'approved' | 'rejected' | 'revision_requested';

export interface CourseApproval {
  id: string;
  courseId: string;
  courseTitle: string;
  instructorId: string;
  instructorName: string;
  status: CourseApprovalStatus;
  submittedAt: Date;
  reviewedAt?: Date;
  reviewedBy?: string;
  reviewNotes?: string;
  content: {
    modules: number;
    lectures: number;
    assessments: number;
    duration: number;
  };
  compliance: {
    spiritualAlignment: boolean;
    contentQuality: boolean;
    accessibility: boolean;
    technicalRequirements: boolean;
  };
}

export interface CourseApprovalAction {
  courseId: string;
  action: 'approve' | 'reject' | 'request_revision';
  notes: string;
  reviewerId: string;
}

// ============================================================================
// Content Moderation Types
// ============================================================================

export type ContentType = 'post' | 'comment' | 'message' | 'course' | 'assignment';
export type ModerationStatus = 'pending' | 'approved' | 'rejected' | 'flagged';
export type ModerationReason = 
  | 'spam'
  | 'inappropriate'
  | 'harassment'
  | 'theological_concern'
  | 'copyright'
  | 'other';

export interface ModerationQueueItem {
  id: string;
  contentType: ContentType;
  contentId: string;
  content: string;
  authorId: string;
  authorName: string;
  status: ModerationStatus;
  flaggedAt: Date;
  flaggedBy: string[];
  flagReason: ModerationReason[];
  aiAnalysis?: {
    toxicity: number;
    spam: number;
    theological: number;
    recommendation: 'approve' | 'reject' | 'review';
  };
  reviewedAt?: Date;
  reviewedBy?: string;
  reviewNotes?: string;
}

export interface ModerationAction {
  itemId: string;
  action: 'approve' | 'reject' | 'warn_user' | 'suspend_user';
  notes: string;
  moderatorId: string;
}

// ============================================================================
// System Configuration Types
// ============================================================================

export interface SystemConfiguration {
  general: {
    siteName: string;
    siteUrl: string;
    supportEmail: string;
    maintenanceMode: boolean;
    registrationEnabled: boolean;
  };
  features: {
    aiTutor: boolean;
    scrollCoin: boolean;
    scrollBadge: boolean;
    spiritualFormation: boolean;
    communityFeed: boolean;
    studyGroups: boolean;
  };
  limits: {
    maxEnrollmentsPerStudent: number;
    maxCoursesPerInstructor: number;
    maxFileUploadSize: number;
    maxVideoLength: number;
  };
  security: {
    sessionTimeout: number;
    passwordMinLength: number;
    requireEmailVerification: boolean;
    require2FA: boolean;
    maxLoginAttempts: number;
  };
  notifications: {
    emailEnabled: boolean;
    smsEnabled: boolean;
    pushEnabled: boolean;
    digestFrequency: 'daily' | 'weekly' | 'never';
  };
  ai: {
    provider: 'openai' | 'anthropic';
    model: string;
    maxTokens: number;
    temperature: number;
    enableCaching: boolean;
  };
}

export interface ConfigurationUpdate {
  section: keyof SystemConfiguration;
  updates: Record<string, any>;
  updatedBy: string;
}

// ============================================================================
// Audit Log Types
// ============================================================================

export type AuditAction =
  | 'user_created'
  | 'user_updated'
  | 'user_deleted'
  | 'role_assigned'
  | 'course_approved'
  | 'course_rejected'
  | 'content_moderated'
  | 'config_updated'
  | 'backup_created'
  | 'system_restart';

export interface AuditLogEntry {
  id: string;
  action: AuditAction;
  userId: string;
  userName: string;
  targetType: string;
  targetId: string;
  details: Record<string, any>;
  ipAddress: string;
  userAgent: string;
  timestamp: Date;
}

export interface AuditLogFilters {
  action?: AuditAction;
  userId?: string;
  targetType?: string;
  dateRange?: {
    startDate: Date;
    endDate: Date;
  };
}

// ============================================================================
// Backup & Restore Types
// ============================================================================

export type BackupType = 'full' | 'incremental' | 'database' | 'files';
export type BackupStatus = 'pending' | 'in_progress' | 'completed' | 'failed';

export interface Backup {
  id: string;
  type: BackupType;
  status: BackupStatus;
  size: number;
  startedAt: Date;
  completedAt?: Date;
  fileUrl?: string;
  checksum?: string;
  error?: string;
  metadata: {
    databaseSize: number;
    fileCount: number;
    userCount: number;
    courseCount: number;
  };
}

export interface BackupSchedule {
  id: string;
  type: BackupType;
  frequency: 'hourly' | 'daily' | 'weekly' | 'monthly';
  time: string;
  retention: number; // days
  enabled: boolean;
  lastRun?: Date;
  nextRun: Date;
}

export interface RestoreRequest {
  backupId: string;
  targetEnvironment: 'production' | 'staging' | 'development';
  restoreDatabase: boolean;
  restoreFiles: boolean;
  requestedBy: string;
}

export interface RestoreStatus {
  id: string;
  request: RestoreRequest;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  progress: number;
  startedAt: Date;
  completedAt?: Date;
  error?: string;
}

// ============================================================================
// Dashboard Statistics
// ============================================================================

export interface AdminDashboardStats {
  users: {
    total: number;
    active: number;
    new: number;
    suspended: number;
  };
  courses: {
    total: number;
    active: number;
    pending: number;
    draft: number;
  };
  enrollments: {
    total: number;
    active: number;
    completed: number;
    thisMonth: number;
  };
  moderation: {
    pending: number;
    flagged: number;
    resolved: number;
    avgResponseTime: number;
  };
  system: {
    uptime: number;
    responseTime: number;
    errorRate: number;
    activeConnections: number;
  };
  revenue: {
    today: number;
    thisWeek: number;
    thisMonth: number;
    growth: number;
  };
}
