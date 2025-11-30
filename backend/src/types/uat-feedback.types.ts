/**
 * User Acceptance Testing Feedback System Types
 * Academic Year Automation System
 */

export interface UATFeedback {
  id: string;
  sessionId: string;
  userId: string;
  userRole: UATUserRole;
  scenarioId: string;
  scenarioName: string;
  timestamp: Date;
  
  // Test Results
  testStatus: UATTestStatus;
  completionTime: number; // seconds
  stepsCompleted: number;
  totalSteps: number;
  
  // Ratings
  easeOfUse: number; // 1-5
  functionality: number; // 1-5
  performance: number; // 1-5
  spiritualAlignment: number; // 1-5
  overallSatisfaction: number; // 1-5;
  
  // Qualitative Feedback
  positiveAspects: string[];
  issuesEncountered: string[];
  suggestions: string[];
  comments: string;
  
  // Defects
  defectsReported: UATDefect[];
  
  // Context
  browser?: string;
  device?: string;
  screenResolution?: string;
  
  // Metadata
  createdAt: Date;
  updatedAt: Date;
}

export interface UATDefect {
  id: string;
  feedbackId: string;
  title: string;
  description: string;
  severity: DefectSeverity;
  category: DefectCategory;
  stepsToReproduce: string[];
  expectedBehavior: string;
  actualBehavior: string;
  screenshots?: string[];
  status: DefectStatus;
  assignedTo?: string;
  resolvedAt?: Date;
  resolution?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface UATSession {
  id: string;
  userId: string;
  userRole: UATUserRole;
  startTime: Date;
  endTime?: Date;
  scenariosCompleted: string[];
  totalDuration: number; // seconds
  feedbackSubmitted: number;
  defectsReported: number;
  status: SessionStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface UATScenario {
  id: string;
  name: string;
  description: string;
  userRole: UATUserRole;
  category: ScenarioCategory;
  steps: UATStep[];
  estimatedDuration: number; // minutes
  priority: ScenarioPriority;
  requirements: string[]; // Requirement IDs
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface UATStep {
  stepNumber: number;
  description: string;
  expectedResult: string;
  isOptional: boolean;
}

export interface UATMetrics {
  totalSessions: number;
  totalFeedback: number;
  totalDefects: number;
  
  // Pass Rates
  overallPassRate: number;
  passRateByRole: Record<UATUserRole, number>;
  passRateByScenario: Record<string, number>;
  
  // Ratings
  averageRatings: {
    easeOfUse: number;
    functionality: number;
    performance: number;
    spiritualAlignment: number;
    overallSatisfaction: number;
  };
  
  // Defects
  defectsBySeverity: Record<DefectSeverity, number>;
  defectsByCategory: Record<DefectCategory, number>;
  defectsByStatus: Record<DefectStatus, number>;
  
  // Performance
  averageCompletionTime: Record<string, number>; // by scenario
  taskCompletionRate: number;
  
  // Trends
  feedbackOverTime: Array<{ date: string; count: number }>;
  defectsOverTime: Array<{ date: string; count: number }>;
}

export interface UATReport {
  id: string;
  reportType: ReportType;
  generatedAt: Date;
  generatedBy: string;
  dateRange: {
    start: Date;
    end: Date;
  };
  metrics: UATMetrics;
  summary: string;
  recommendations: string[];
  criticalIssues: UATDefect[];
  signOffStatus: SignOffStatus;
  approvals: UATApproval[];
}

export interface UATApproval {
  approverRole: string;
  approverName: string;
  approvedAt?: Date;
  status: ApprovalStatus;
  comments?: string;
}

// Enums

export enum UATUserRole {
  ADMINISTRATOR = 'administrator',
  FACULTY = 'faculty',
  STUDENT = 'student',
  ADVISOR = 'advisor',
  IT_STAFF = 'it_staff'
}

export enum UATTestStatus {
  PASSED = 'passed',
  FAILED = 'failed',
  PARTIAL = 'partial',
  BLOCKED = 'blocked',
  SKIPPED = 'skipped'
}

export enum DefectSeverity {
  CRITICAL = 'critical', // P1
  HIGH = 'high', // P2
  MEDIUM = 'medium', // P3
  LOW = 'low' // P4
}

export enum DefectCategory {
  FUNCTIONALITY = 'functionality',
  USABILITY = 'usability',
  PERFORMANCE = 'performance',
  SECURITY = 'security',
  DATA_INTEGRITY = 'data_integrity',
  UI_UX = 'ui_ux',
  SPIRITUAL_ALIGNMENT = 'spiritual_alignment',
  ACCESSIBILITY = 'accessibility'
}

export enum DefectStatus {
  NEW = 'new',
  ASSIGNED = 'assigned',
  IN_PROGRESS = 'in_progress',
  RESOLVED = 'resolved',
  VERIFIED = 'verified',
  CLOSED = 'closed',
  REOPENED = 'reopened',
  DEFERRED = 'deferred'
}

export enum SessionStatus {
  ACTIVE = 'active',
  COMPLETED = 'completed',
  ABANDONED = 'abandoned'
}

export enum ScenarioCategory {
  CALENDAR_MANAGEMENT = 'calendar_management',
  STUDENT_LIFECYCLE = 'student_lifecycle',
  FACULTY_OPERATIONS = 'faculty_operations',
  COURSE_EXECUTION = 'course_execution',
  WORKFLOW_ORCHESTRATION = 'workflow_orchestration',
  AI_AGENT_INTEGRATION = 'ai_agent_integration',
  REPORTING_ANALYTICS = 'reporting_analytics'
}

export enum ScenarioPriority {
  CRITICAL = 'critical',
  HIGH = 'high',
  MEDIUM = 'medium',
  LOW = 'low'
}

export enum ReportType {
  DAILY = 'daily',
  WEEKLY = 'weekly',
  FINAL = 'final',
  EXECUTIVE_SUMMARY = 'executive_summary'
}

export enum SignOffStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  CONDITIONAL = 'conditional'
}

export enum ApprovalStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected'
}

// Request/Response Types

export interface CreateFeedbackRequest {
  sessionId: string;
  scenarioId: string;
  testStatus: UATTestStatus;
  completionTime: number;
  stepsCompleted: number;
  totalSteps: number;
  ratings: {
    easeOfUse: number;
    functionality: number;
    performance: number;
    spiritualAlignment: number;
    overallSatisfaction: number;
  };
  positiveAspects: string[];
  issuesEncountered: string[];
  suggestions: string[];
  comments: string;
  defects?: Omit<UATDefect, 'id' | 'feedbackId' | 'createdAt' | 'updatedAt'>[];
}

export interface CreateSessionRequest {
  userRole: UATUserRole;
}

export interface UpdateDefectRequest {
  status?: DefectStatus;
  assignedTo?: string;
  resolution?: string;
}

export interface GenerateReportRequest {
  reportType: ReportType;
  dateRange?: {
    start: Date;
    end: Date;
  };
}

export interface FeedbackQueryParams {
  sessionId?: string;
  userId?: string;
  userRole?: UATUserRole;
  scenarioId?: string;
  testStatus?: UATTestStatus;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
  offset?: number;
}
