/**
 * Type Definitions for Academic Year Automation System (SU-AYAS)
 * Comprehensive types for academic calendar, student lifecycle, and workflow management
 */

// =====================================================
// ACADEMIC CALENDAR ENGINE TYPES
// =====================================================

export type CalendarType = 'semester' | 'trimester' | 'quarter' | 'custom';
export type SemesterType = 'fall' | 'spring' | 'summer' | 'winter' | 'term1' | 'term2' | 'term3' | 'term4' | 'custom';

export interface AcademicYear {
  id: string;
  name: string;
  startDate: Date;
  endDate: Date;
  calendarType: CalendarType;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdBy?: string;
}

export interface CreateAcademicYearParams {
  name: string;
  startDate: Date;
  endDate: Date;
  calendarType: CalendarType;
  isActive?: boolean;
}

export interface Semester {
  id: string;
  academicYearId: string;
  name: string;
  semesterType: SemesterType;
  startDate: Date;
  endDate: Date;
  registrationStart: Date;
  registrationEnd: Date;
  addDropDeadline: Date;
  withdrawalDeadline: Date;
  finalExamsStart: Date;
  finalExamsEnd: Date;
  gradesDue: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateSemesterParams {
  academicYearId: string;
  name: string;
  semesterType: SemesterType;
  startDate: Date;
  endDate: Date;
  registrationStart: Date;
  registrationEnd: Date;
  addDropDeadline: Date;
  withdrawalDeadline: Date;
  finalExamsStart: Date;
  finalExamsEnd: Date;
  gradesDue: Date;
  isActive?: boolean;
}

export interface AcademicEvent {
  id: string;
  academicYearId: string;
  semesterId?: string;
  eventType: string;
  name: string;
  description?: string;
  startDate: Date;
  endDate?: Date;
  startTime?: string;
  endTime?: string;
  location?: string;
  isHoliday: boolean;
  affectsClasses: boolean;
  isRecurring: boolean;
  recurrencePattern?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
  createdBy?: string;
}

export interface CreateAcademicEventParams {
  academicYearId: string;
  semesterId?: string;
  eventType: string;
  name: string;
  description?: string;
  startDate: Date;
  endDate?: Date;
  startTime?: string;
  endTime?: string;
  location?: string;
  isHoliday?: boolean;
  affectsClasses?: boolean;
  isRecurring?: boolean;
  recurrencePattern?: Record<string, any>;
}

export interface Deadline {
  id: string;
  academicYearId?: string;
  semesterId?: string;
  entityType: string;
  entityId?: string;
  deadlineType: string;
  title: string;
  description?: string;
  deadlineDate: Date;
  deadlineTime?: string;
  notificationIntervals: number[];
  isHardDeadline: boolean;
  gracePeriodDays: number;
  createdAt: Date;
  updatedAt: Date;
  createdBy?: string;
}

export interface CreateDeadlineParams {
  academicYearId?: string;
  semesterId?: string;
  entityType: string;
  entityId?: string;
  deadlineType: string;
  title: string;
  description?: string;
  deadlineDate: Date;
  deadlineTime?: string;
  notificationIntervals?: number[];
  isHardDeadline?: boolean;
  gracePeriodDays?: number;
}

export interface CalendarConflict {
  id: string;
  conflictType: string;
  entity1Type: string;
  entity1Id: string;
  entity2Type: string;
  entity2Id: string;
  conflictDescription: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'detected' | 'acknowledged' | 'resolved' | 'ignored';
  resolvedAt?: Date;
  resolvedBy?: string;
  resolutionNotes?: string;
  createdAt: Date;
}

// =====================================================
// STUDENT LIFECYCLE ENGINE TYPES
// =====================================================

export type AcademicStanding = 'good_standing' | 'probation' | 'suspension' | 'dismissed';
export type EnrollmentStatus = 'enrolled' | 'dropped' | 'withdrawn' | 'completed';

export interface Student {
  id: string;
  studentId: string;
  firstName: string;
  lastName: string;
  email: string;
  admissionDate: Date;
  expectedGraduation?: Date;
  academicStanding: AcademicStanding;
  gpa: number;
  totalCreditsEarned: number;
  isActive: boolean;
}

export interface Enrollment {
  id: string;
  studentId: string;
  courseOfferingId: string;
  semesterId: string;
  enrollmentDate: Date;
  enrollmentStatus: EnrollmentStatus;
  grade?: string;
  credits: number;
}

export interface GraduationRecord {
  id: string;
  studentId: string;
  degreeProgramId?: string;
  graduationDate: Date;
  honors?: string;
  gpa: number;
}

// =====================================================
// FACULTY & TEACHING OPERATIONS TYPES
// =====================================================

export interface Faculty {
  id: string;
  facultyId: string;
  firstName: string;
  lastName: string;
  email: string;
  department?: string;
  maxTeachingLoad: number;
  isActive: boolean;
}

export interface TeachingAssignment {
  id: string;
  facultyId: string;
  courseOfferingId: string;
  semesterId: string;
  role: string;
  workloadPercentage: number;
}

// =====================================================
// WORKFLOW & NOTIFICATION TYPES
// =====================================================

export interface WorkflowDefinition {
  id: string;
  name: string;
  triggerEvent: string;
  workflowDefinition: Record<string, any>;
  isActive: boolean;
}

export interface WorkflowInstance {
  id: string;
  workflowId: string;
  entityType: string;
  entityId: string;
  status: 'running' | 'completed' | 'failed' | 'paused';
  currentStep: number;
  contextData?: Record<string, any>;
  startedAt: Date;
  completedAt?: Date;
}

export interface WorkflowStep {
  stepNumber: number;
  action: string;
  parameters: Record<string, any>;
  onSuccess?: string;
  onFailure?: string;
}

export interface Notification {
  id: string;
  recipientId: string;
  recipientType: string;
  notificationType: string;
  title: string;
  message: string;
  channels: string[];
  priority: 'low' | 'normal' | 'high' | 'urgent';
  scheduledFor: Date;
  sentAt?: Date;
}

// =====================================================
// SERVICE RESPONSE TYPES
// =====================================================

export interface ServiceResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export interface ConflictDetectionResult {
  hasConflicts: boolean;
  conflicts: CalendarConflict[];
}

// =====================================================
// UTILITY TYPES
// =====================================================

export interface DateRange {
  startDate: Date;
  endDate: Date;
}

export interface PaginationParams {
  page: number;
  limit: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
