/**
 * Student Portal Type Definitions
 * Types for registration, degree audit, and graduation planning
 */

// =====================================================
// REGISTRATION TYPES
// =====================================================

export interface CourseSearchFilters {
  searchTerm?: string;
  department?: string;
  level?: string;
  credits?: number;
  instructor?: string;
  days?: string[];
  timeRange?: {
    start: string;
    end: string;
  };
  hasAvailableSeats?: boolean;
}

export interface CourseOffering {
  id: string;
  courseId: string;
  courseCode: string;
  courseTitle: string;
  credits: number;
  instructor?: string;
  department?: string;
  description?: string;
  prerequisites?: string[];
  maxEnrollment: number;
  currentEnrollment: number;
  availableSeats: number;
  waitlistCount: number;
  meetingTimes?: MeetingTime[];
  location?: string;
  semesterId: string;
}

export interface MeetingTime {
  days: string[];
  startTime: string;
  endTime: string;
  location?: string;
}

export interface EnrollmentValidation {
  studentId: string;
  courseId: string;
  eligible: boolean;
  reason: string;
  missingPrerequisites: string[];
  conflictingSchedules: string[];
  capacityAvailable: boolean;
  hasFinancialHold: boolean;
  hasAcademicHold: boolean;
  hasDisciplinaryHold: boolean;
}

export interface RegistrationResult {
  registrationId: string;
  status: 'enrolled' | 'waitlisted' | 'rejected';
  position?: number;
  reason?: string;
  nextSteps: string[];
  enrollmentId?: string;
}

export interface WaitlistEntry {
  id: string;
  studentId: string;
  courseId: string;
  courseCode: string;
  courseTitle: string;
  semesterId: string;
  position: number;
  addedAt: Date;
  notified: boolean;
  enrollmentDeadline?: Date;
  status: string;
}

export interface StudentSchedule {
  studentId: string;
  semesterId: string;
  enrollments: ScheduledCourse[];
  totalCredits: number;
  conflicts: ScheduleConflict[];
}

export interface ScheduledCourse {
  enrollmentId: string;
  courseId: string;
  courseCode: string;
  courseTitle: string;
  credits: number;
  instructor?: string;
  meetingTimes?: MeetingTime[];
  location?: string;
  enrollmentStatus: string;
  grade?: string;
}

export interface ScheduleConflict {
  course1: string;
  course2: string;
  conflictType: 'time' | 'prerequisite' | 'capacity';
  description: string;
}

// =====================================================
// DEGREE AUDIT TYPES
// =====================================================

export interface DegreeAudit {
  studentId: string;
  degreeProgramId: string;
  degreeProgramName?: string;
  totalCreditsRequired: number;
  totalCreditsEarned: number;
  totalCreditsInProgress: number;
  totalCreditsRemaining: number;
  currentGPA: number;
  minimumGPARequired: number;
  requirementsFulfilled: RequirementFulfillment[];
  requirementsInProgress: RequirementFulfillment[];
  requirementsRemaining: RequirementFulfillment[];
  overallCompletionPercentage: number;
  estimatedGraduationDate?: Date;
  isEligibleForGraduation: boolean;
  blockingIssues: string[];
  auditDate: Date;
}

export interface RequirementFulfillment {
  requirementId: string;
  requirementType: 'core' | 'major' | 'minor' | 'elective' | 'general_education';
  requirementName: string;
  requiredCredits: number;
  earnedCredits: number;
  inProgressCredits: number;
  remainingCredits: number;
  completionPercentage: number;
  isFulfilled: boolean;
  fulfilledCourses: CourseCompletion[];
  inProgressCourses: CourseCompletion[];
  remainingCourses: string[];
}

export interface CourseCompletion {
  courseId: string;
  courseCode: string;
  courseTitle: string;
  credits: number;
  grade?: string;
  gradePoints?: number;
  completionDate?: Date;
  semesterId?: string;
}

// =====================================================
// GRADUATION PLANNING TYPES
// =====================================================

export interface GraduationEvaluation {
  studentId: string;
  isEligible: boolean;
  eligibilityDate?: Date;
  blockers: GraduationBlocker[];
  requirements: {
    creditsCompleted: boolean;
    gpaRequirementMet: boolean;
    allRequirementsFulfilled: boolean;
    noFinancialHolds: boolean;
    noAcademicHolds: boolean;
    noDisciplinaryHolds: boolean;
  };
  estimatedGraduationDate?: Date;
  recommendedActions: string[];
  evaluationDate: Date;
}

export interface GraduationBlocker {
  blockerType: 'credits' | 'gpa' | 'requirements' | 'holds' | 'other';
  description: string;
  severity: 'critical' | 'warning' | 'info';
  resolutionSteps: string[];
}

export interface GraduationTimeline {
  studentId: string;
  currentSemester: string;
  creditsPerSemester: number;
  remainingCredits: number;
  estimatedSemesters: number;
  estimatedGraduationDate: Date;
  milestones: GraduationMilestone[];
  assumptions: string[];
}

export interface GraduationMilestone {
  semesterName: string;
  semesterStartDate: Date;
  plannedCredits: number;
  cumulativeCredits: number;
  completionPercentage: number;
  keyRequirements: string[];
}

export interface GraduationApplication {
  id: string;
  studentId: string;
  applicationDate: Date;
  status: 'pending' | 'approved' | 'denied' | 'completed';
  ceremonyDate?: Date;
  ceremonyLocation?: string;
  diplomaMailingAddress?: string;
  honors?: string;
  notes?: string;
}

// =====================================================
// STUDENT PROFILE TYPES
// =====================================================

export interface StudentProfile {
  id: string;
  studentId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  admissionDate: Date;
  expectedGraduation?: Date;
  academicStanding: 'good_standing' | 'probation' | 'suspension' | 'dismissed';
  gpa: number;
  totalCreditsEarned: number;
  degreeProgramId?: string;
  degreeProgramName?: string;
  major?: string;
  minor?: string;
  advisor?: {
    id: string;
    name: string;
    email: string;
    phone?: string;
  };
  holds: {
    financial: boolean;
    academic: boolean;
    disciplinary: boolean;
  };
  isActive: boolean;
}

// =====================================================
// API RESPONSE TYPES
// =====================================================

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
