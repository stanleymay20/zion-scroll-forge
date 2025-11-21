/**
 * Faculty Dashboard Types
 * Type definitions for faculty-specific features
 */

import type { Course, CourseModule, Assessment, Assignment } from './course';

// ============================================================================
// Faculty Course Management
// ============================================================================

export interface FacultyCourse extends Course {
  enrollmentCount: number;
  activeStudents: number;
  completionRate: number;
  averageGrade: number;
  pendingSubmissions: number;
  unreadDiscussions: number;
  lastUpdated: Date;
}

export interface CourseManagementFilters {
  search?: string;
  status?: 'active' | 'archived' | 'draft';
  semester?: string;
  sortBy?: 'title' | 'students' | 'grade' | 'updated';
  sortOrder?: 'asc' | 'desc';
}

// ============================================================================
// Gradebook
// ============================================================================

export interface GradebookEntry {
  studentId: string;
  studentName: string;
  studentEmail: string;
  enrollmentDate: Date;
  overallGrade: number;
  letterGrade: string;
  assignments: AssignmentGrade[];
  assessments: AssessmentGrade[];
  participation: number;
  attendance: number;
  spiritualGrowth: number;
  lastActivity: Date;
  status: 'active' | 'at_risk' | 'excelling' | 'inactive';
}

export interface AssignmentGrade {
  assignmentId: string;
  assignmentTitle: string;
  submissionId?: string;
  score?: number;
  maxScore: number;
  percentage?: number;
  status: 'not_submitted' | 'submitted' | 'graded' | 'late' | 'missing';
  submittedAt?: Date;
  gradedAt?: Date;
  feedback?: string;
  dueDate: Date;
}

export interface AssessmentGrade {
  assessmentId: string;
  assessmentTitle: string;
  score?: number;
  maxScore: number;
  percentage?: number;
  attempts: number;
  maxAttempts: number;
  status: 'not_started' | 'in_progress' | 'completed';
  completedAt?: Date;
}

export interface BulkGradingRequest {
  submissionIds: string[];
  action: 'approve' | 'reject' | 'request_revision';
  score?: number;
  feedback?: string;
  rubricScores?: Record<string, number>;
}

export interface GradingRubric {
  id: string;
  name: string;
  criteria: RubricCriterion[];
  totalPoints: number;
  spiritualDimensions: SpiritualDimension[];
}

export interface RubricCriterion {
  id: string;
  name: string;
  description: string;
  maxPoints: number;
  levels: RubricLevel[];
}

export interface RubricLevel {
  name: string;
  description: string;
  points: number;
}

export interface SpiritualDimension {
  aspect: string;
  description: string;
  weight: number;
}

// ============================================================================
// Student Roster
// ============================================================================

export interface StudentRosterEntry {
  id: string;
  name: string;
  email: string;
  enrollmentDate: Date;
  progress: number;
  overallGrade: number;
  letterGrade: string;
  attendance: number;
  participation: number;
  lastActive: Date;
  status: 'active' | 'at_risk' | 'excelling' | 'inactive';
  spiritualGrowth: SpiritualGrowthMetrics;
  communicationPreferences: CommunicationPreferences;
}

export interface SpiritualGrowthMetrics {
  devotionCompletion: number;
  prayerJournalEntries: number;
  scriptureMemoryProgress: number;
  propheticCheckIns: number;
  overallScore: number;
}

export interface CommunicationPreferences {
  email: boolean;
  sms: boolean;
  inApp: boolean;
  preferredTime?: string;
}

export interface CommunicationMessage {
  recipients: string[]; // student IDs
  subject: string;
  message: string;
  type: 'email' | 'sms' | 'in_app' | 'all';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  scheduledFor?: Date;
  attachments?: File[];
}

export interface StudentCommunicationHistory {
  id: string;
  studentId: string;
  type: 'email' | 'sms' | 'in_app' | 'meeting';
  subject: string;
  message: string;
  sentAt: Date;
  readAt?: Date;
  respondedAt?: Date;
}

// ============================================================================
// Assignment Management
// ============================================================================

export interface AssignmentManagement {
  id: string;
  title: string;
  description: string;
  courseId: string;
  moduleId: string;
  type: 'essay' | 'project' | 'quiz' | 'practical' | 'ministry';
  maxScore: number;
  dueDate: Date;
  allowLateSubmissions: boolean;
  latePenalty?: number;
  rubric?: GradingRubric;
  instructions: string;
  resources: AssignmentResource[];
  submissions: SubmissionSummary;
  status: 'draft' | 'published' | 'closed';
  createdAt: Date;
  updatedAt: Date;
}

export interface AssignmentResource {
  id: string;
  title: string;
  type: 'document' | 'video' | 'link' | 'scripture';
  url: string;
  description?: string;
}

export interface SubmissionSummary {
  total: number;
  submitted: number;
  graded: number;
  pending: number;
  late: number;
  missing: number;
  averageScore?: number;
}

export interface AssignmentSubmission {
  id: string;
  assignmentId: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  submittedAt: Date;
  status: 'submitted' | 'graded' | 'returned' | 'revision_requested';
  content: SubmissionContent;
  score?: number;
  maxScore: number;
  feedback?: string;
  rubricScores?: Record<string, number>;
  aiGrading?: AIGradingResult;
  gradedBy?: string;
  gradedAt?: Date;
  isLate: boolean;
  revisionCount: number;
}

export interface SubmissionContent {
  text?: string;
  files?: SubmissionFile[];
  links?: string[];
  spiritualReflection?: string;
  ministryApplication?: string;
}

export interface SubmissionFile {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
  uploadedAt: Date;
}

export interface AIGradingResult {
  score: number;
  confidence: number;
  feedback: string;
  strengths: string[];
  improvements: string[];
  spiritualInsights: string[];
  requiresHumanReview: boolean;
}

// ============================================================================
// Course Analytics for Instructors
// ============================================================================

export interface InstructorCourseAnalytics {
  courseId: string;
  courseTitle: string;
  timeRange: {
    startDate: Date;
    endDate: Date;
  };
  enrollment: {
    total: number;
    active: number;
    completed: number;
    dropped: number;
    trend: number; // percentage change
  };
  performance: {
    averageGrade: number;
    medianGrade: number;
    passRate: number;
    gradeDistribution: Record<string, number>;
    topPerformers: StudentPerformance[];
    strugglingStudents: StudentPerformance[];
  };
  engagement: {
    averageLoginFrequency: number;
    averageTimeSpent: number;
    videoCompletionRate: number;
    forumParticipation: number;
    assignmentSubmissionRate: number;
    assessmentCompletionRate: number;
  };
  content: {
    mostEngagingModules: ContentEngagement[];
    leastEngagingModules: ContentEngagement[];
    dropOffPoints: DropOffPoint[];
    popularResources: ResourceEngagement[];
  };
  spiritual: {
    devotionCompletionRate: number;
    prayerJournalActivity: number;
    scriptureMemoryProgress: number;
    propheticCheckInParticipation: number;
    overallSpiritualGrowth: number;
  };
}

export interface StudentPerformance {
  studentId: string;
  studentName: string;
  grade: number;
  progress: number;
  engagement: number;
  riskLevel: 'low' | 'medium' | 'high';
}

export interface ContentEngagement {
  moduleId: string;
  moduleTitle: string;
  engagementScore: number;
  completionRate: number;
  averageTimeSpent: number;
  studentFeedback: number;
}

export interface DropOffPoint {
  moduleId: string;
  moduleTitle: string;
  lectureId?: string;
  lectureTitle?: string;
  dropOffRate: number;
  timestamp: number; // seconds into content
}

export interface ResourceEngagement {
  resourceId: string;
  resourceTitle: string;
  type: string;
  downloads: number;
  views: number;
  averageRating: number;
}

// ============================================================================
// Office Hours
// ============================================================================

export interface OfficeHours {
  id: string;
  facultyId: string;
  dayOfWeek: number; // 0-6, Sunday-Saturday
  startTime: string; // HH:mm format
  endTime: string;
  location: 'online' | 'in_person' | 'hybrid';
  meetingLink?: string;
  physicalLocation?: string;
  maxStudents?: number;
  recurring: boolean;
  active: boolean;
  notes?: string;
}

export interface OfficeHoursAppointment {
  id: string;
  officeHoursId: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  date: Date;
  startTime: string;
  endTime: string;
  topic: string;
  notes?: string;
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'no_show';
  meetingLink?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface OfficeHoursSchedule {
  date: Date;
  slots: OfficeHoursSlot[];
}

export interface OfficeHoursSlot {
  startTime: string;
  endTime: string;
  available: boolean;
  appointment?: OfficeHoursAppointment;
}

// ============================================================================
// Faculty Resources
// ============================================================================

export interface FacultyResource {
  id: string;
  title: string;
  description: string;
  category: 'teaching' | 'grading' | 'spiritual' | 'administrative' | 'technology';
  type: 'document' | 'video' | 'template' | 'guide' | 'tool';
  url?: string;
  fileUrl?: string;
  tags: string[];
  featured: boolean;
  downloads: number;
  rating: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ResourceCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  resourceCount: number;
}

// ============================================================================
// API Response Types
// ============================================================================

export interface FacultyDashboardData {
  courses: FacultyCourse[];
  upcomingDeadlines: UpcomingDeadline[];
  pendingGrading: number;
  unreadMessages: number;
  officeHoursToday: OfficeHoursAppointment[];
  recentActivity: FacultyActivity[];
}

export interface UpcomingDeadline {
  type: 'assignment' | 'assessment' | 'grading' | 'meeting';
  title: string;
  courseTitle: string;
  dueDate: Date;
  priority: 'low' | 'medium' | 'high';
}

export interface FacultyActivity {
  id: string;
  type: 'submission' | 'question' | 'discussion' | 'appointment' | 'grade_posted';
  title: string;
  description: string;
  courseTitle?: string;
  studentName?: string;
  timestamp: Date;
  read: boolean;
}
