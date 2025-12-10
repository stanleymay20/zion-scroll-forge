/**
 * Student Success and Retention System Type Definitions
 * 
 * Comprehensive type definitions for tracking student academic, financial,
 * and spiritual progress with intervention management and predictive analytics.
 */

// ============================================================================
// Enums and Constants
// ============================================================================

export enum RiskLevel {
  LOW = 'low',
  MODERATE = 'moderate',
  HIGH = 'high',
  CRITICAL = 'critical'
}

export enum CaseStatus {
  OPEN = 'open',
  IN_PROGRESS = 'in_progress',
  MONITORING = 'monitoring',
  RESOLVED = 'resolved',
  CLOSED = 'closed'
}

export enum EscalationLevel {
  NONE = 'none',
  ADVISOR = 'advisor',
  DEPARTMENT = 'department',
  DEAN = 'dean',
  EMERGENCY = 'emergency'
}

export enum CallingStage {
  EXPLORATION = 'exploration',
  DISCERNMENT = 'discernment',
  CONFIRMATION = 'confirmation',
  PREPARATION = 'preparation',
  DEPLOYMENT = 'deployment'
}

export enum FinancialAidStatus {
  ACTIVE = 'active',
  PENDING = 'pending',
  SUSPENDED = 'suspended',
  COMPLETED = 'completed'
}

export enum InterventionType {
  ACADEMIC_SUPPORT = 'academic_support',
  FINANCIAL_AID = 'financial_aid',
  SPIRITUAL_GUIDANCE = 'spiritual_guidance',
  MENTAL_HEALTH = 'mental_health',
  CAREER_COUNSELING = 'career_counseling',
  PEER_MENTORING = 'peer_mentoring'
}

export enum StudentStatus {
  ACTIVE = 'active',
  ON_LEAVE = 'on_leave',
  PROBATION = 'probation',
  SUSPENDED = 'suspended',
  GRADUATED = 'graduated',
  WITHDRAWN = 'withdrawn'
}

// ============================================================================
// Academic Metrics
// ============================================================================

export interface GradeDistribution {
  aCount: number;
  bCount: number;
  cCount: number;
  dCount: number;
  fCount: number;
  incompleteCount: number;
  withdrawalCount: number;
}

export interface AcademicMetrics {
  gpa: number;
  creditHours: number;
  completionRate: number;
  attendanceRate: number;
  assignmentSubmissionRate: number;
  gradeDistribution: GradeDistribution;
  progressTowardDegree: number;
  lastUpdated: Date;
}

// ============================================================================
// Financial Health
// ============================================================================

export interface PaymentRecord {
  id: string;
  amount: number;
  date: Date;
  method: string;
  status: string;
}

export interface EmergencyRequest {
  id: string;
  amount: number;
  reason: string;
  status: string;
  requestedAt: Date;
  resolvedAt?: Date;
}

export interface FinancialHealth {
  tuitionBalance: number;
  financialAidStatus: FinancialAidStatus;
  scrollGoldEarnings: number;
  workStudyParticipation: boolean;
  emergencyFundRequests: EmergencyRequest[];
  paymentHistory: PaymentRecord[];
  lastUpdated: Date;
}

// ============================================================================
// Spiritual Formation
// ============================================================================

export interface PropheticAssessment {
  id: string;
  date: Date;
  assessorId: string;
  insights: string;
  recommendations: string[];
  score: number;
}

export interface SpiritualFormationMetrics {
  callingDiscernmentStage: CallingStage;
  spiritualGrowthScore: number;
  mentorshipEngagement: number;
  prayerJournalActivity: number;
  scriptureMemoryProgress: number;
  ministryInvolvementLevel: number;
  propheticCheckInResults: PropheticAssessment[];
  lastUpdated: Date;
}

// ============================================================================
// Engagement Patterns
// ============================================================================

export interface EngagementMetrics {
  loginFrequency: number;
  courseAccessRate: number;
  discussionParticipation: number;
  resourceUtilization: number;
  peerInteractionScore: number;
  lastActivityDate: Date;
}

// ============================================================================
// Risk Assessment
// ============================================================================

export interface RiskFactor {
  id: string;
  category: string;
  description: string;
  severity: RiskLevel;
  detectedAt: Date;
  indicators: string[];
}

export interface InterventionRecommendation {
  type: InterventionType;
  priority: number;
  description: string;
  estimatedImpact: number;
  resources: string[];
}

export interface RiskAssessment {
  studentId: string;
  overallRiskScore: number; // 0-100 scale
  riskCategories: {
    academic: RiskLevel;
    financial: RiskLevel;
    social: RiskLevel;
    spiritual: RiskLevel;
    engagement: RiskLevel;
  };
  contributingFactors: RiskFactor[];
  recommendedInterventions: InterventionRecommendation[];
  confidenceLevel: number;
  lastUpdated: Date;
}

// ============================================================================
// Predictive Scores
// ============================================================================

export interface PredictiveScores {
  retentionProbability: number;
  graduationProbability: number;
  timeToGraduation: number;
  successLikelihood: number;
  modelVersion: string;
  calculatedAt: Date;
}

// ============================================================================
// Support Team
// ============================================================================

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  email: string;
  phone?: string;
  assignedAt: Date;
}

export interface SupportTeamAssignment {
  academicAdvisor: TeamMember;
  spiritualMentor: TeamMember;
  financialAidOfficer?: TeamMember;
  careerCounselor?: TeamMember;
  additionalSupport: TeamMember[];
}

// ============================================================================
// Milestones
// ============================================================================

export interface MilestoneRecord {
  id: string;
  type: string;
  name: string;
  description: string;
  targetDate: Date;
  completedDate?: Date;
  status: string;
  celebrationSent: boolean;
}

// ============================================================================
// Intervention Management
// ============================================================================

export interface InterventionRecord {
  id: string;
  type: InterventionType;
  startDate: Date;
  endDate?: Date;
  assignedTo: string[];
  status: string;
  effectiveness: number;
  notes: string;
}

export interface InterventionStrategy {
  id: string;
  name: string;
  description: string;
  type: InterventionType;
  steps: string[];
  expectedDuration: number;
  successCriteria: string[];
}

export interface InterventionGoal {
  id: string;
  description: string;
  targetValue: number;
  currentValue: number;
  deadline: Date;
  achieved: boolean;
}

export interface InterventionTimeline {
  startDate: Date;
  checkpoints: Date[];
  expectedEndDate: Date;
  actualEndDate?: Date;
}

export interface Resource {
  id: string;
  type: string;
  name: string;
  description: string;
  url?: string;
  contactInfo?: string;
}

export interface SuccessMetric {
  name: string;
  baseline: number;
  target: number;
  current: number;
  unit: string;
}

export interface InterventionPlan {
  strategies: InterventionStrategy[];
  goals: InterventionGoal[];
  timeline: InterventionTimeline;
  resources: Resource[];
  successMetrics: SuccessMetric[];
}

export interface CaseTimeline {
  id: string;
  timestamp: Date;
  event: string;
  actor: string;
  details: string;
}

export interface InterventionOutcome {
  id: string;
  metric: string;
  beforeValue: number;
  afterValue: number;
  improvement: number;
  measuredAt: Date;
}

export interface InterventionCase {
  caseId: string;
  studentId: string;
  riskFactors: RiskFactor[];
  assignedTeam: TeamMember[];
  interventionPlan: InterventionPlan;
  timeline: CaseTimeline[];
  outcomes: InterventionOutcome[];
  status: CaseStatus;
  escalationLevel: EscalationLevel;
  createdAt: Date;
  lastUpdated: Date;
}

// ============================================================================
// Student Success Profile
// ============================================================================

export interface StudentSuccessProfile {
  studentId: string;
  academicMetrics: AcademicMetrics;
  financialHealth: FinancialHealth;
  spiritualFormation: SpiritualFormationMetrics;
  engagementPatterns: EngagementMetrics;
  riskFactors: RiskFactor[];
  interventionHistory: InterventionRecord[];
  supportTeam: SupportTeamAssignment;
  milestones: MilestoneRecord[];
  predictiveScores: PredictiveScores;
  createdAt: Date;
  lastUpdated: Date;
}

// ============================================================================
// Integration Interfaces
// ============================================================================

export interface AcademicRecord {
  studentId: string;
  programId: string;
  enrollmentDate: Date;
  expectedGraduationDate: Date;
  currentSemester: string;
  academicStanding: string;
  gpa: number;
  creditsEarned: number;
  creditsRequired: number;
}

export interface EnrollmentRecord {
  id: string;
  studentId: string;
  courseId: string;
  semester: string;
  grade?: string;
  status: string;
  enrolledAt: Date;
}

export interface Requirement {
  id: string;
  programId: string;
  category: string;
  description: string;
  creditsRequired: number;
  courses: string[];
}

export interface EngagementMetricsData {
  studentId: string;
  courseId: string;
  loginCount: number;
  timeSpent: number;
  participationScore: number;
  lastAccess: Date;
}

export interface AssignmentRecord {
  id: string;
  studentId: string;
  courseId: string;
  assignmentId: string;
  submittedAt?: Date;
  grade?: number;
  status: string;
}

export interface ParticipationMetrics {
  studentId: string;
  discussionPosts: number;
  peerInteractions: number;
  questionAsked: number;
  resourcesShared: number;
}

export interface GradeRecord {
  id: string;
  studentId: string;
  courseId: string;
  grade: string;
  points: number;
  semester: string;
  recordedAt: Date;
}

export interface SpiritualAssessment {
  id: string;
  studentId: string;
  assessmentType: string;
  score: number;
  insights: string;
  assessedAt: Date;
  assessorId: string;
}

export interface CallingProgress {
  studentId: string;
  currentStage: CallingStage;
  identifiedGifts: string[];
  exploredMinistries: string[];
  confirmedCalling?: string;
  preparationPlan?: string;
  lastUpdated: Date;
}

export interface MentorshipRecord {
  id: string;
  studentId: string;
  mentorId: string;
  meetingCount: number;
  lastMeeting: Date;
  nextMeeting?: Date;
  engagementScore: number;
}

export interface SpiritualMetrics {
  studentId: string;
  prayerJournalEntries: number;
  scriptureMemoryVerses: number;
  devotionalCompletion: number;
  ministryHours: number;
  spiritualGrowthScore: number;
}

// ============================================================================
// Alert and Notification Types
// ============================================================================

export interface Alert {
  id: string;
  studentId: string;
  type: string;
  severity: RiskLevel;
  message: string;
  recommendations: string[];
  createdAt: Date;
  acknowledgedAt?: Date;
  acknowledgedBy?: string;
}

export interface NotificationPreferences {
  email: boolean;
  sms: boolean;
  inApp: boolean;
  frequency: string;
}

// ============================================================================
// Analytics and Reporting
// ============================================================================

export interface RetentionMetrics {
  cohort: string;
  totalStudents: number;
  retainedStudents: number;
  retentionRate: number;
  period: string;
}

export interface GraduationMetrics {
  cohort: string;
  totalStudents: number;
  graduatedStudents: number;
  graduationRate: number;
  averageTimeToGraduation: number;
}

export interface BenchmarkData {
  metric: string;
  institutionValue: number;
  nationalAverage: number;
  christianEducationAverage: number;
  percentile: number;
}

// ============================================================================
// Privacy and Permissions
// ============================================================================

export interface PrivacySettings {
  studentId: string;
  familyAccessEnabled: boolean;
  sharedMetrics: string[];
  restrictedData: string[];
  lastUpdated: Date;
}

export interface FamilyAccess {
  studentId: string;
  familyMemberId: string;
  accessLevel: string;
  grantedAt: Date;
  expiresAt?: Date;
}

// ============================================================================
// Predictive Modeling Types
// ============================================================================

export interface RiskPrediction {
  studentId: string;
  riskScore: number; // 0-100 scale
  riskLevel: RiskLevel;
  contributingFactors: RiskFactor[];
  recommendations: InterventionRecommendation[];
  confidence: number;
  predictedAt: Date;
  modelVersion: string;
}

export interface SuccessFactorAnalysis {
  cohort: string;
  period: string;
  topPredictors: SuccessFactor[];
  correlations: FactorCorrelation[];
  recommendations: string[];
  sampleSize: number;
  confidenceLevel: number;
  analyzedAt: Date;
}

export interface SuccessFactor {
  factor: string;
  importance: number;
  correlation: number;
  category: string;
}

export interface FactorCorrelation {
  factor1: string;
  factor2: string;
  correlation: number;
  significance: number;
}

export interface InterventionEffectiveness {
  interventionType: InterventionType;
  successRate: number;
  averageImprovement: number;
  sampleSize: number;
  costEffectiveness: number;
  recommendedFor: RiskLevel[];
  confidence: number;
  analyzedAt: Date;
}

export interface LongitudinalOutcome {
  studentId: string;
  cohort: string;
  enrollmentDate: Date;
  graduationDate?: Date;
  timeToGraduation?: number;
  finalGpa?: number;
  degreeCompleted: boolean;
  careerOutcome?: string;
  ministryPlacement?: string;
  predictedVsActual: {
    retentionPrediction: number;
    actualRetained: boolean;
    graduationPrediction: number;
    actualGraduated: boolean;
  };
}

export interface PredictiveModel {
  id: string;
  name: string;
  type: 'classification' | 'regression';
  version: string;
  accuracy: number;
  lastTrained: Date;
  features: string[];
  weights: Record<string, number>;
}

export interface ModelTrainingData {
  features: Record<string, number>[];
  labels: number[];
  validationSplit: number;
  testSplit: number;
}

export interface ModelPerformanceMetrics {
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  auc: number;
  confusionMatrix: number[][];
}

// ============================================================================
// Error Types
// ============================================================================

export class StudentSuccessError extends Error {
  constructor(
    public code: string,
    message: string,
    public details?: Record<string, any>
  ) {
    super(message);
    this.name = 'StudentSuccessError';
    Object.setPrototypeOf(this, StudentSuccessError.prototype);
  }
}

// ============================================================================
// Additional Metrics Types
// ============================================================================

export interface PeriodMetrics {
  periodStart: Date;
  periodEnd: Date;
  comparisonMetrics?: {
    previousPeriod: number;
    changePercent: number;
  };
}

// ============================================================================
// Intervention Priority and Outcome Types
// ============================================================================

export enum InterventionPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent',
  CRITICAL = 'critical'
}

export enum OutcomeStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  SUCCESSFUL = 'successful',
  PARTIALLY_SUCCESSFUL = 'partially_successful',
  UNSUCCESSFUL = 'unsuccessful',
  CANCELLED = 'cancelled'
}

// Communication and Outreach
export interface OutreachCampaign {
  id: string;
  name: string;
  targetAudience: string;
  riskLevels: RiskLevel[];
  channels: ('email' | 'sms' | 'push' | 'in_app')[];
  message: string;
  scheduledDate: Date;
  status: 'draft' | 'scheduled' | 'active' | 'completed' | 'cancelled';
  metrics: {
    sent: number;
    delivered: number;
    opened: number;
    clicked: number;
    responded: number;
  };
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CommunicationLog {
  id: string;
  studentId: string;
  type: 'email' | 'sms' | 'call' | 'meeting' | 'chat';
  subject: string;
  content: string;
  sentBy: string;
  sentAt: Date;
  deliveryStatus: 'pending' | 'sent' | 'delivered' | 'failed' | 'bounced';
  readAt?: Date;
  respondedAt?: Date;
  metadata?: Record<string, any>;
}

// Success Coaching
export interface SuccessCoach {
  id: string;
  userId: string;
  name: string;
  email: string;
  specializations: string[];
  maxStudents: number;
  currentStudents: number;
  availabilitySchedule: Record<string, any>;
  performanceMetrics: {
    studentSuccessRate: number;
    averageResponseTime: number;
    satisfactionScore: number;
  };
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CoachingSession {
  id: string;
  studentId: string;
  coachId: string;
  type: 'one_on_one' | 'group' | 'workshop';
  topic: string;
  scheduledDate: Date;
  duration: number;
  status: 'scheduled' | 'completed' | 'cancelled' | 'no_show';
  notes?: string;
  actionItems: string[];
  followUpDate?: Date;
  studentFeedback?: {
    rating: number;
    comments: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

// Resource Recommendations
export interface ResourceRecommendation {
  id: string;
  studentId: string;
  resourceType: 'tutoring' | 'counseling' | 'financial_aid' | 'academic_support' | 'wellness';
  title: string;
  description: string;
  provider: string;
  contactInfo: string;
  priority: 'low' | 'medium' | 'high';
  status: 'recommended' | 'contacted' | 'enrolled' | 'completed' | 'declined';
  recommendedBy: string;
  recommendedAt: Date;
  expiresAt?: Date;
  metadata?: Record<string, any>;
}

// Early Warning System
export interface EarlyWarningIndicator {
  id: string;
  name: string;
  category: 'academic' | 'behavioral' | 'financial' | 'social';
  description: string;
  thresholdValue: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface WarningTrigger {
  id: string;
  studentId: string;
  indicatorId: string;
  currentValue: number;
  thresholdValue: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  triggeredAt: Date;
  acknowledgedAt?: Date;
  acknowledgedBy?: string;
  resolved: boolean;
  resolvedAt?: Date;
  notes?: string;
}

// API Request/Response Types
export interface CreateInterventionRequest {
  studentId: string;
  type: InterventionType;
  priority: InterventionPriority;
  title: string;
  description: string;
  tags?: string[];
  assignedTo?: string;
}

export interface UpdateInterventionRequest {
  status?: CaseStatus;
  priority?: InterventionPriority;
  assignedTo?: string;
  notes?: string;
  outcome?: string;
  outcomeStatus?: OutcomeStatus;
}

export interface StudentMetricsRequest {
  studentId: string;
  startDate?: Date;
  endDate?: Date;
  includeHistory?: boolean;
}

export interface RetentionReportRequest {
  cohortId?: string;
  startDate: Date;
  endDate: Date;
  groupBy?: 'major' | 'year' | 'risk_level';
  includeComparison?: boolean;
}
