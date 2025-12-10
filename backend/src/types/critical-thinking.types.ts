/**
 * ScrollCritical Thinking & Innovation Engine Type Definitions
 * Implements prophetic reasoning combined with data discernment
 */

// ============================================================================
// Core Enums
// ============================================================================

export enum ThinkingLevel {
  FOUNDATION = 'foundation',
  INTERMEDIATE = 'intermediate',
  ADVANCED = 'advanced',
  PROPHETIC = 'prophetic',
  GOVERNMENTAL = 'governmental'
}

export enum QueryType {
  CONCEPTUAL = 'conceptual',
  PRACTICAL = 'practical',
  PROPHETIC = 'prophetic',
  ETHICAL = 'ethical',
  INNOVATIVE = 'innovative'
}

export enum InteractionMode {
  TEXT_CHAT = 'text_chat',
  VOICE_CONVERSATION = 'voice_conversation',
  IMAGE_ANALYSIS = 'image_analysis',
  SCROLL_QUERY = 'scroll_query',
  XR_INTERACTION = 'xr_interaction'
}

export enum MilestoneType {
  PROBLEM_ANALYSIS = 'problem_analysis',
  PROPHETIC_INSIGHT = 'prophetic_insight',
  PROTOTYPE_DEVELOPMENT = 'prototype_development',
  TESTING_VALIDATION = 'testing_validation',
  PUBLICATION_READY = 'publication_ready'
}

export enum ProjectCategory {
  CLIMATE_SOLUTIONS = 'climate_solutions',
  AI_ETHICS = 'ai_ethics',
  HEALTH_ACCESS = 'health_access',
  BIBLICAL_LITERACY = 'biblical_literacy',
  ECONOMIC_JUSTICE = 'economic_justice',
  EDUCATIONAL_REFORM = 'educational_reform',
  GOVERNANCE_SYSTEMS = 'governance_systems',
  SPIRITUAL_FORMATION = 'spiritual_formation'
}

export enum XPCategory {
  CRITICAL_THINKING = 'critical_thinking',
  INNOVATION = 'innovation',
  COLLABORATION = 'collaboration',
  SPIRITUAL_GROWTH = 'spiritual_growth',
  LEADERSHIP = 'leadership',
  RESEARCH = 'research',
  MENTORING = 'mentoring'
}

export enum ActivityType {
  CHALLENGE_FALSE_DOCTRINE = 'challenge_false_doctrine',
  ASK_PROPHETIC_QUESTION = 'ask_prophetic_question',
  BUILD_LOCAL_SOLUTION = 'build_local_solution',
  PROPOSE_NEW_THEORY = 'propose_new_theory',
  DISCERN_AI_HALLUCINATION = 'discern_ai_hallucination',
  COMPLETE_INNOVATION_PROJECT = 'complete_innovation_project',
  PARTICIPATE_DEBATE = 'participate_debate',
  MENTOR_PEER = 'mentor_peer'
}

export enum ModeratorType {
  AI_MODERATOR = 'ai_moderator',
  HUMAN_MODERATOR = 'human_moderator',
  SCROLL_ELDER = 'scroll_elder',
  PEER_MODERATION = 'peer_moderation'
}

export enum DebatePhase {
  OPENING_STATEMENTS = 'opening_statements',
  EVIDENCE_PRESENTATION = 'evidence_presentation',
  CROSS_EXAMINATION = 'cross_examination',
  PROPHETIC_DISCERNMENT = 'prophetic_discernment',
  CLOSING_ARGUMENTS = 'closing_arguments',
  COMMUNITY_REFLECTION = 'community_reflection'
}

export enum ProjectStatus {
  PLANNING = 'planning',
  IN_PROGRESS = 'in_progress',
  TESTING = 'testing',
  REVIEW = 'review',
  PUBLISHED = 'published',
  ARCHIVED = 'archived'
}

export enum ChallengeCategory {
  THEOLOGICAL = 'theological',
  ETHICAL = 'ethical',
  SCIENTIFIC = 'scientific',
  SOCIAL = 'social',
  TECHNOLOGICAL = 'technological',
  PROPHETIC = 'prophetic'
}

export enum SessionStatus {
  SCHEDULED = 'scheduled',
  ACTIVE = 'active',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

export enum ValidationType {
  AUTOMATED = 'automated',
  PEER_REVIEW = 'peer_review',
  FACULTY_REVIEW = 'faculty_review',
  ELDER_VALIDATION = 'elder_validation'
}

export enum AchievementLevel {
  BRONZE = 'bronze',
  SILVER = 'silver',
  GOLD = 'gold',
  PLATINUM = 'platinum',
  DIAMOND = 'diamond'
}

export enum CertificationType {
  FOUNDATION = 'foundation',
  INTERMEDIATE = 'intermediate',
  ADVANCED = 'advanced',
  EXPERT = 'expert',
  MASTER = 'master'
}

// ============================================================================
// Core Interfaces
// ============================================================================

export interface Evidence {
  id: string;
  type: string;
  source: string;
  content: string;
  credibility: number;
  spiritualAlignment: number;
}

export interface AITool {
  name: string;
  version: string;
  purpose: string;
  outputUsed: string;
}

export interface ReasoningSubmission {
  userId: string;
  challengeId: string;
  argument: string;
  evidence: Evidence[];
  spiritualInsights: string[];
  aiToolsUsed: AITool[];
  submittedAt: Date;
}

export interface ReasoningAssessment {
  logicalConsistency: number;
  evidenceQuality: number;
  spiritualAlignment: number;
  innovativeThinking: number;
  kingdomImpact: number;
  feedback: string;
  scrollXPAwarded: number;
}

export interface CriticalThinkingChallenge {
  id: string;
  title: string;
  description: string;
  level: ThinkingLevel;
  category: ChallengeCategory;
  scenario: string;
  questions: ChallengeQuestion[];
  resources: Resource[];
  evaluationCriteria: EvaluationCriteria[];
  scrollXPReward: number;
  scrollGoldReward: number;
  badgeUnlocked?: string;
  createdBy: string;
  difficulty: number;
  estimatedTime: number;
  prerequisites: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ChallengeQuestion {
  id: string;
  question: string;
  type: string;
  points: number;
  rubric: string[];
}

export interface Resource {
  id: string;
  title: string;
  type: string;
  url: string;
  description: string;
}

export interface EvaluationCriteria {
  criterion: string;
  weight: number;
  description: string;
}

// ============================================================================
// Innovation Project Interfaces
// ============================================================================

export interface InnovationChallenge {
  id: string;
  title: string;
  description: string;
  scrollPrompt: string;
  realWorldContext: string;
  successCriteria: string[];
  resources: Resource[];
  deadline: Date;
  scrollGoldReward: number;
}

export interface ChallengeParameters {
  difficulty: number;
  duration: number;
  teamSize: number;
  requiredSkills: string[];
}

export interface InnovationTeam {
  id: string;
  challengeId: string;
  members: TeamMember[];
  culturalDiversity: CulturalMetrics;
  collaborationTools: CollaborationTool[];
  mentorAssigned: string;
}

export interface TeamMember {
  userId: string;
  role: string;
  skills: string[];
  location: string;
  timezone: string;
}

export interface CulturalMetrics {
  countriesRepresented: number;
  languagesSpoken: number;
  diversityScore: number;
}

export interface CollaborationTool {
  name: string;
  type: string;
  accessUrl: string;
}

export interface ProjectMilestone {
  type: MilestoneType;
  description: string;
  completedAt: Date;
  evidence: string[];
  propheticInsights: string[];
  kingdomImpact: ImpactMetrics;
}

export interface ImpactMetrics {
  peopleReached: number;
  problemsSolved: number;
  kingdomAdvancement: number;
  transformationScore: number;
}

export interface InnovationProject {
  id: string;
  title: string;
  description: string;
  category: ProjectCategory;
  teamMembers: string[];
  problemAnalysis: ProblemAnalysis;
  propheticInsights: PropheticInsight[];
  prototypeDevelopment: PrototypeData;
  testingResults: TestingResult[];
  publicationData: PublicationData;
  kingdomImpact: ImpactMetrics;
  technicalQuality: number;
  innovationScore: number;
  collaborationRating: number;
  status: ProjectStatus;
  startedAt: Date;
  completedAt?: Date;
}

export interface ProblemAnalysis {
  problemStatement: string;
  stakeholders: string[];
  constraints: string[];
  currentSolutions: string[];
  gaps: string[];
}

export interface PropheticInsight {
  insight: string;
  source: string;
  timestamp: Date;
  validation: string;
}

export interface PrototypeData {
  type: string;
  description: string;
  technologies: string[];
  repositoryUrl?: string;
  demoUrl?: string;
}

export interface TestingResult {
  testType: string;
  results: string;
  feedback: string;
  timestamp: Date;
}

export interface PublicationData {
  title: string;
  abstract: string;
  publishedAt?: Date;
  journalUrl?: string;
  citations: number;
}

// ============================================================================
// Critical Thinking Profile
// ============================================================================

export interface SkillMetrics {
  currentLevel: number;
  progressRate: number;
  lastAssessment: Date;
  strengthAreas: string[];
  growthAreas: string[];
}

export interface ChallengeCompletion {
  challengeId: string;
  completedAt: Date;
  score: number;
  feedback: string;
}

export interface MentoringSession {
  sessionId: string;
  mentorId: string;
  topic: string;
  duration: number;
  notes: string;
  timestamp: Date;
}

export interface CriticalThinkingProfile {
  userId: string;
  reasoningLevel: ThinkingLevel;
  discernmentScore: number;
  innovationCapacity: number;
  collaborationSkills: number;
  propheticMaturity: number;
  logicalReasoning: SkillMetrics;
  evidenceEvaluation: SkillMetrics;
  spiritualDiscernment: SkillMetrics;
  ethicalAnalysis: SkillMetrics;
  innovativeThinking: SkillMetrics;
  challengesCompleted: ChallengeCompletion[];
  innovationProjects: InnovationProject[];
  debateParticipation: DebateRecord[];
  mentoringSessions: MentoringSession[];
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================================
// Debate and Collaboration Interfaces
// ============================================================================

export interface DebateParameters {
  duration: number;
  maxParticipants: number;
  rules: string[];
  moderationType: ModeratorType;
}

export interface Participant {
  userId: string;
  name: string;
  role: string;
  position: string;
}

export interface DebateRules {
  speakingTime: number;
  rebuttalTime: number;
  evidenceRequired: boolean;
  civility: string[];
}

export interface ModeratorInfo {
  id: string;
  type: ModeratorType;
  name: string;
}

export interface Argument {
  id: string;
  participantId: string;
  content: string;
  evidence: Evidence[];
  timestamp: Date;
  votes: number;
}

export interface DebateSession {
  id: string;
  topic: string;
  participants: DebateParticipant[];
  moderator: ModeratorInfo;
  phases: DebatePhase[];
  currentPhase: DebatePhase;
  timeRemaining: number;
  arguments: Argument[];
  evidence: Evidence[];
  propheticInsights: PropheticInsight[];
  participationScores: ParticipationScore[];
  reasoningQuality: ReasoningQuality[];
  spiritualMaturity: SpiritualMaturity[];
  status: SessionStatus;
  startedAt: Date;
  endedAt?: Date;
}

export interface DebateParticipant {
  userId: string;
  name: string;
  position: string;
  speaking: boolean;
}

export interface ParticipationScore {
  userId: string;
  engagement: number;
  clarity: number;
  respect: number;
}

export interface ReasoningQuality {
  userId: string;
  logic: number;
  evidence: number;
  coherence: number;
}

export interface SpiritualMaturity {
  userId: string;
  wisdom: number;
  discernment: number;
  loveAndTruth: number;
}

export interface DebateRecord {
  debateId: string;
  topic: string;
  position: string;
  score: number;
  timestamp: Date;
}

export interface DebateRoom {
  id: string;
  topic: string;
  participants: Participant[];
  language: string;
  moderator: ModeratorType;
  rules: DebateRules;
  currentPhase: DebatePhase;
  transcription: string[];
}

export interface DiversityRequirements {
  minCountries: number;
  minLanguages: number;
  culturalBalance: boolean;
}

export interface GlobalMember {
  userId: string;
  country: string;
  language: string;
  timezone: string;
  culturalBackground: string;
}

export interface CulturalMap {
  [country: string]: number;
}

export interface CommunicationTool {
  name: string;
  type: string;
  url: string;
}

export interface WorkspaceAccess {
  url: string;
  credentials: string;
  permissions: string[];
}

export interface CollaborationTeam {
  id: string;
  projectId: string;
  members: GlobalMember[];
  culturalRepresentation: CulturalMap;
  communicationTools: CommunicationTool[];
  sharedWorkspace: WorkspaceAccess;
}

export interface Message {
  id: string;
  userId: string;
  content: string;
  timestamp: Date;
  flagged: boolean;
}

export interface ModerationResult {
  approved: boolean;
  reason?: string;
  action?: string;
}

export interface CollaborationMetrics {
  teamCohesion: number;
  culturalIntegration: number;
  productivityScore: number;
  conflictResolution: number;
}

// ============================================================================
// ScrollXP and Rewards
// ============================================================================

export interface ScrollXPTransaction {
  id: string;
  userId: string;
  amount: number;
  category: XPCategory;
  description: string;
  activityType: ActivityType;
  relatedEntityId: string;
  achievementLevel: AchievementLevel;
  validatedBy: ValidationType;
  validatorId?: string;
  evidence: string[];
  createdAt: Date;
}

export interface XPOpportunity {
  activity: ActivityType;
  potentialXP: number;
  requirements: string[];
  deadline?: Date;
}

// ============================================================================
// Assessment Interfaces
// ============================================================================

export interface AssessmentContext {
  userId: string;
  challengeId?: string;
  projectId?: string;
  contextType: string;
}

export interface SpiritualScore {
  scripturalAlignment: number;
  propheticAccuracy: number;
  kingdomRelevance: number;
  transformationalPotential: number;
  loveAndTruthBalance: number;
  overallAlignment: number;
  feedback: PropheticFeedback;
}

export interface PropheticFeedback {
  strengths: string[];
  growthAreas: string[];
  scripturalGuidance: string[];
  nextSteps: string[];
}

export interface DefenseThesis {
  title: string;
  abstract: string;
  methodology: string;
  findings: string[];
  kingdomImplications: string;
  propheticInsights: string[];
  practicalApplications: string[];
}

export interface DefenseResult {
  panelComposition: DefensePanel;
  scores: DefenseScores;
  feedback: PanelFeedback[];
  recommendations: string[];
  certificationType: CertificationType;
  scrollGoldAwarded: number;
}

export interface DefensePanel {
  aiJudge: AIJudgeProfile;
  humanExpert: ExpertProfile;
  propheticValidator: ProphetProfile;
  peerReviewers: PeerProfile[];
}

export interface AIJudgeProfile {
  model: string;
  specialization: string[];
}

export interface ExpertProfile {
  userId: string;
  name: string;
  credentials: string[];
  expertise: string[];
}

export interface ProphetProfile {
  userId: string;
  name: string;
  ministry: string;
  giftings: string[];
}

export interface PeerProfile {
  userId: string;
  name: string;
  level: ThinkingLevel;
}

export interface DefenseScores {
  technical: number;
  spiritual: number;
  innovation: number;
  presentation: number;
  overall: number;
}

export interface PanelFeedback {
  panelMember: string;
  role: string;
  comments: string;
  score: number;
}

export interface TimeFrame {
  startDate: Date;
  endDate: Date;
}

export interface GrowthMetrics {
  overallGrowth: number;
  skillDevelopment: { [skill: string]: number };
  milestones: string[];
  recommendations: string[];
}

export interface ProjectOutcome {
  metric: string;
  value: number;
  evidence: string;
}

export interface ImpactAssessment {
  shortTermImpact: number;
  longTermPotential: number;
  kingdomAlignment: number;
  scalability: number;
  sustainability: number;
  overallImpact: number;
  recommendations: string[];
}

// ============================================================================
// ScrollMentorGPT Interfaces
// ============================================================================

export interface TutoringSession {
  id: string;
  userId: string;
  subject: string;
  mode: InteractionMode;
  startedAt: Date;
  endedAt?: Date;
  messages: ScrollQuery[];
  learningOutcomes: string[];
}

export interface Attachment {
  type: string;
  url: string;
  name: string;
}

export interface ScrollQuery {
  type: QueryType;
  content: string;
  context?: string;
  attachments?: Attachment[];
  spiritualContext?: string;
}

export interface MentorResponse {
  answer: string;
  reasoning: string;
  scripturalBasis?: string[];
  followUpQuestions: string[];
  recommendedResources: Resource[];
  scrollXPOpportunity?: XPOpportunity;
}

export interface ThinkingEvaluation {
  clarity: number;
  depth: number;
  spiritualInsight: number;
  criticalAnalysis: number;
  feedback: string;
}

export interface PropheticGuidance {
  guidance: string;
  scripturalBasis: string[];
  prayerPoints: string[];
  actionSteps: string[];
}

// ============================================================================
// Error Types
// ============================================================================

export enum CriticalThinkingErrorType {
  REASONING_VALIDATION_FAILED = 'reasoning_validation_failed',
  PROPHETIC_ALIGNMENT_LOW = 'prophetic_alignment_low',
  INNOVATION_REQUIREMENTS_NOT_MET = 'innovation_requirements_not_met',
  COLLABORATION_CONFLICT = 'collaboration_conflict',
  ASSESSMENT_CRITERIA_UNCLEAR = 'assessment_criteria_unclear',
  SPIRITUAL_DISCERNMENT_NEEDED = 'spiritual_discernment_needed'
}

export interface CriticalThinkingError {
  type: CriticalThinkingErrorType;
  message: string;
  scrollGuidance: string;
  kingdomWisdom: string;
  recommendedActions: string[];
  mentorContact?: string;
}
