/**
 * Shared Data Models for ScrollUniversity Cross-System Integration
 * 
 * This file defines the common data structures used across all 10+ ScrollUniversity specs
 * to ensure consistent data exchange and integration between systems.
 */

// ============================================================================
// CORE IDENTITY MODELS
// ============================================================================

export interface ScrollUser {
  id: string;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  status: UserStatus;
  createdAt: Date;
  updatedAt: Date;
  lastActiveAt: Date;
  metadata: Record<string, any>;
}

export enum UserRole {
  STUDENT = 'student',
  FACULTY = 'faculty',
  ADMIN = 'admin',
  MENTOR = 'mentor',
  PROPHET = 'prophet',
  GUEST = 'guest'
}

export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
  PENDING = 'pending',
  GRADUATED = 'graduated'
}

// ============================================================================
// SPIRITUAL FORMATION MODELS
// ============================================================================

export interface SpiritualProfile {
  userId: string;
  callingClarity: CallingLevel;
  spiritualGifts: SpiritualGift[];
  formationLevel: FormationLevel;
  propheticWords: PropheticWord[];
  prayerRequests: PrayerRequest[];
  mentorshipHistory: MentorshipRecord[];
  oathStatus: OathStatus;
  lastPropheticCheckIn: Date;
  divineScorecard: DivineScorecard;
}

export interface DivineScorecard {
  purpose: number; // 0-100
  skills: number; // 0-100
  scrollAlignment: number; // 0-100
  kingdomImpact: number; // 0-100
  characterDevelopment: number; // 0-100
  lastUpdated: Date;
}

export enum CallingLevel {
  SEEKING = 'seeking',
  EMERGING = 'emerging',
  CLARIFYING = 'clarifying',
  CONFIRMED = 'confirmed',
  WALKING = 'walking',
  MATURE = 'mature'
}

export enum FormationLevel {
  SEEKER = 'seeker',
  BELIEVER = 'believer',
  DISCIPLE = 'disciple',
  LEADER = 'leader',
  ELDER = 'elder',
  APOSTOLIC = 'apostolic'
}

export interface SpiritualGift {
  name: string;
  level: GiftLevel;
  manifestations: string[];
  confirmedBy: string[];
  developmentPlan: string;
}

export enum GiftLevel {
  EMERGING = 'emerging',
  DEVELOPING = 'developing',
  OPERATING = 'operating',
  MATURE = 'mature',
  IMPARTING = 'imparting'
}

// ============================================================================
// ACADEMIC MODELS
// ============================================================================

export interface AcademicProfile {
  userId: string;
  currentProgram: DegreeProgram;
  enrollments: CourseEnrollment[];
  completedCourses: CompletedCourse[];
  gpa: number;
  credits: number;
  degreeProgress: DegreeProgress;
  transcripts: Transcript[];
  certifications: ScrollCertification[];
  assessmentHistory: AssessmentRecord[];
}

export interface DegreeProgram {
  id: string;
  name: string;
  type: DegreeType;
  requiredCredits: number;
  requiredCourses: string[];
  electiveCourses: string[];
  spiritualRequirements: SpiritualRequirement[];
  practicalRequirements: PracticalRequirement[];
  duration: string;
  description: string;
}

export enum DegreeType {
  BA_PROPHETIC_GOVERNANCE = 'ba_prophetic_governance',
  BSC_SACRED_AI_ENGINEERING = 'bsc_sacred_ai_engineering',
  MDIV_SCROLL_THEOLOGY = 'mdiv_scroll_theology',
  MBA_SCROLL_ECONOMY = 'mba_scroll_economy',
  CERTIFICATE = 'certificate',
  DIPLOMA = 'diploma'
}

export interface Course {
  id: string;
  title: string;
  code: string;
  description: string;
  credits: number;
  department: string;
  faculty: string[];
  prerequisites: string[];
  learningObjectives: LearningObjective[];
  spiritualObjectives: SpiritualObjective[];
  assessments: Assessment[];
  xrContent: XRContent[];
  aiTutorConfig: AITutorConfig;
  scrollBadgeConfig: ScrollBadgeConfig;
  status: CourseStatus;
}

export enum CourseStatus {
  DRAFT = 'draft',
  ACTIVE = 'active',
  ARCHIVED = 'archived',
  UNDER_REVIEW = 'under_review'
}

// ============================================================================
// SCROLLCOIN ECONOMY MODELS
// ============================================================================

export interface ScrollCoinAccount {
  userId: string;
  balance: number;
  totalEarned: number;
  totalSpent: number;
  transactions: ScrollCoinTransaction[];
  walletAddress: string;
  stakingBalance: number;
  rewardMultiplier: number;
  lastUpdated: Date;
}

export interface ScrollCoinTransaction {
  id: string;
  fromUserId: string;
  toUserId: string;
  amount: number;
  type: TransactionType;
  category: TransactionCategory;
  description: string;
  metadata: Record<string, any>;
  blockchainHash?: string;
  status: TransactionStatus;
  timestamp: Date;
}

export enum TransactionType {
  EARN = 'earn',
  SPEND = 'spend',
  TRANSFER = 'transfer',
  STAKE = 'stake',
  REWARD = 'reward',
  PENALTY = 'penalty'
}

export enum TransactionCategory {
  COURSE_COMPLETION = 'course_completion',
  ASSESSMENT_PASS = 'assessment_pass',
  PROJECT_SUBMISSION = 'project_submission',
  PEER_HELP = 'peer_help',
  MENTORSHIP = 'mentorship',
  RESEARCH = 'research',
  MINISTRY_IMPACT = 'ministry_impact',
  TUITION = 'tuition',
  MARKETPLACE = 'marketplace'
}

export enum TransactionStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  FAILED = 'failed',
  CANCELLED = 'cancelled'
}

// ============================================================================
// AI AND FACULTY MODELS
// ============================================================================

export interface AITutorConfig {
  id: string;
  name: string;
  personality: AIPersonality;
  department: string;
  specializations: string[];
  propheticTraining: PropheticTraining;
  culturalAdaptation: CulturalSettings;
  teachingStyle: TeachingStyle;
  knowledgeBase: KnowledgeSource[];
  constraints: AIConstraint[];
  driftDetection: DriftDetectionConfig;
}

export interface AIPersonality {
  name: string;
  description: string;
  traits: string[];
  communicationStyle: CommunicationStyle;
  spiritualMaturity: FormationLevel;
  culturalBackground: string[];
  languages: string[];
}

export enum CommunicationStyle {
  FORMAL = 'formal',
  CONVERSATIONAL = 'conversational',
  ENCOURAGING = 'encouraging',
  CHALLENGING = 'challenging',
  PROPHETIC = 'prophetic',
  PASTORAL = 'pastoral'
}

export interface PropheticTraining {
  scriptureKnowledge: number; // 0-100
  spiritualDiscernment: number; // 0-100
  kingdomPerspective: number; // 0-100
  propheticAccuracy: number; // 0-100
  culturalWisdom: number; // 0-100
  lastTrainingUpdate: Date;
}

// ============================================================================
// ASSESSMENT AND CERTIFICATION MODELS
// ============================================================================

export interface Assessment {
  id: string;
  courseId: string;
  title: string;
  type: AssessmentType;
  questions: AssessmentQuestion[];
  rubric: AssessmentRubric;
  timeLimit: number;
  attempts: number;
  passingScore: number;
  spiritualValidation: boolean;
  aiGrading: boolean;
  metadata: Record<string, any>;
}

export enum AssessmentType {
  QUIZ = 'quiz',
  EXAM = 'exam',
  PROJECT = 'project',
  PRESENTATION = 'presentation',
  PRACTICAL = 'practical',
  SPIRITUAL = 'spiritual',
  PEER_REVIEW = 'peer_review'
}

export interface ScrollCertification {
  id: string;
  userId: string;
  type: CertificationType;
  title: string;
  issuer: string;
  issuedDate: Date;
  expiryDate?: Date;
  nftTokenId?: string;
  blockchainHash: string;
  verificationUrl: string;
  metadata: CertificationMetadata;
  status: CertificationStatus;
}

export enum CertificationType {
  COURSE_COMPLETION = 'course_completion',
  DEGREE = 'degree',
  CERTIFICATE = 'certificate',
  BADGE = 'badge',
  SKILL = 'skill',
  SPIRITUAL_MILESTONE = 'spiritual_milestone'
}

export enum CertificationStatus {
  ACTIVE = 'active',
  EXPIRED = 'expired',
  REVOKED = 'revoked',
  PENDING = 'pending'
}

// ============================================================================
// PROJECT AND PRACTICAL OUTPUT MODELS
// ============================================================================

export interface ScrollProject {
  id: string;
  title: string;
  description: string;
  type: ProjectType;
  status: ProjectStatus;
  ownerId: string;
  collaborators: string[];
  mentorId?: string;
  courseId?: string;
  milestones: ProjectMilestone[];
  deliverables: ProjectDeliverable[];
  resources: ProjectResource[];
  kingdomImpact: KingdomImpactMetrics;
  scrollCoinReward: number;
  startDate: Date;
  dueDate: Date;
  completedDate?: Date;
  metadata: Record<string, any>;
}

export enum ProjectType {
  COURSE_PROJECT = 'course_project',
  CAPSTONE = 'capstone',
  RESEARCH = 'research',
  MINISTRY = 'ministry',
  BUSINESS = 'business',
  TECHNOLOGY = 'technology',
  SOCIAL_IMPACT = 'social_impact'
}

export enum ProjectStatus {
  PLANNING = 'planning',
  IN_PROGRESS = 'in_progress',
  REVIEW = 'review',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  ON_HOLD = 'on_hold'
}

export interface KingdomImpactMetrics {
  livesImpacted: number;
  communitiesReached: number;
  resourcesGenerated: number;
  spiritualBreakthroughs: number;
  sustainabilityScore: number;
  replicationPotential: number;
  lastMeasured: Date;
}

// ============================================================================
// PRAYER AND SPIRITUAL WARFARE MODELS
// ============================================================================

export interface PrayerRequest {
  id: string;
  requesterId: string;
  title: string;
  description: string;
  category: PrayerCategory;
  urgency: PrayerUrgency;
  privacy: PrivacyLevel;
  status: PrayerStatus;
  intercessors: string[];
  updates: PrayerUpdate[];
  testimony?: string;
  createdAt: Date;
  updatedAt: Date;
  answeredAt?: Date;
}

export enum PrayerCategory {
  PERSONAL = 'personal',
  ACADEMIC = 'academic',
  SPIRITUAL_WARFARE = 'spiritual_warfare',
  HEALING = 'healing',
  PROVISION = 'provision',
  GUIDANCE = 'guidance',
  BREAKTHROUGH = 'breakthrough',
  MINISTRY = 'ministry'
}

export enum PrayerUrgency {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent',
  EMERGENCY = 'emergency'
}

export enum PrayerStatus {
  OPEN = 'open',
  BEING_PRAYED = 'being_prayed',
  ANSWERED = 'answered',
  CLOSED = 'closed',
  ONGOING = 'ongoing'
}

// ============================================================================
// MENTORSHIP AND DISCIPLESHIP MODELS
// ============================================================================

export interface MentorshipRelationship {
  id: string;
  mentorId: string;
  menteeId: string;
  type: MentorshipType;
  status: MentorshipStatus;
  focus: MentorshipFocus[];
  goals: MentorshipGoal[];
  sessions: MentorshipSession[];
  covenant: MentorshipCovenant;
  startDate: Date;
  endDate?: Date;
  metadata: Record<string, any>;
}

export enum MentorshipType {
  ACADEMIC = 'academic',
  SPIRITUAL = 'spiritual',
  CAREER = 'career',
  MINISTRY = 'ministry',
  LIFE = 'life',
  PROJECT = 'project'
}

export enum MentorshipStatus {
  PENDING = 'pending',
  ACTIVE = 'active',
  PAUSED = 'paused',
  COMPLETED = 'completed',
  TERMINATED = 'terminated'
}

export interface MentorshipFocus {
  area: string;
  goals: string[];
  progress: number; // 0-100
  milestones: string[];
}

// ============================================================================
// GOVERNANCE AND COMPLIANCE MODELS
// ============================================================================

export interface ScrollOath {
  id: string;
  userId: string;
  type: OathType;
  content: string;
  takenAt: Date;
  witnessedBy: string[];
  status: OathStatus;
  violations: OathViolation[];
  renewalDate?: Date;
  metadata: Record<string, any>;
}

export enum OathType {
  STUDENT = 'student',
  FACULTY = 'faculty',
  ADMIN = 'admin',
  MENTOR = 'mentor',
  LEADERSHIP = 'leadership'
}

export enum OathStatus {
  ACTIVE = 'active',
  VIOLATED = 'violated',
  SUSPENDED = 'suspended',
  RENEWED = 'renewed',
  TERMINATED = 'terminated'
}

export interface AuditTrail {
  id: string;
  userId: string;
  action: string;
  resource: string;
  resourceId: string;
  oldValue?: any;
  newValue?: any;
  timestamp: Date;
  ipAddress: string;
  userAgent: string;
  sessionId: string;
  correlationId?: string;
  metadata: Record<string, any>;
}

// ============================================================================
// INTEGRATION EVENT MODELS
// ============================================================================

export interface SystemEvent {
  id: string;
  source: string;
  type: string;
  data: any;
  timestamp: Date;
  correlationId?: string;
  userId?: string;
  metadata?: Record<string, any>;
}

export interface IntegrationHealth {
  systemName: string;
  status: HealthStatus;
  lastCheck: Date;
  responseTime: number;
  dependencies: DependencyHealth[];
  metrics: HealthMetrics;
}

export enum HealthStatus {
  HEALTHY = 'healthy',
  DEGRADED = 'degraded',
  UNHEALTHY = 'unhealthy',
  UNKNOWN = 'unknown'
}

export interface DependencyHealth {
  name: string;
  status: HealthStatus;
  lastCheck: Date;
  responseTime: number;
}

export interface HealthMetrics {
  uptime: number;
  errorRate: number;
  throughput: number;
  latency: number;
  memoryUsage: number;
  cpuUsage: number;
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

export enum PrivacyLevel {
  PUBLIC = 'public',
  INTERNAL = 'internal',
  PRIVATE = 'private',
  CONFIDENTIAL = 'confidential'
}

export interface LearningObjective {
  id: string;
  description: string;
  level: BloomLevel;
  assessmentCriteria: string[];
}

export interface SpiritualObjective {
  id: string;
  description: string;
  formationArea: FormationArea;
  assessmentCriteria: string[];
}

export enum BloomLevel {
  REMEMBER = 'remember',
  UNDERSTAND = 'understand',
  APPLY = 'apply',
  ANALYZE = 'analyze',
  EVALUATE = 'evaluate',
  CREATE = 'create'
}

export enum FormationArea {
  CHARACTER = 'character',
  CALLING = 'calling',
  COMPETENCY = 'competency',
  COMMUNITY = 'community',
  COMMISSION = 'commission'
}

// ============================================================================
// RESPONSE WRAPPERS
// ============================================================================

export interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp: Date;
  correlationId?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

export interface ValidationError {
  field: string;
  message: string;
  code: string;
}

export interface ValidationWarning {
  field: string;
  message: string;
  code: string;
}