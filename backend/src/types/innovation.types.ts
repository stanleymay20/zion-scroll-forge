/**
 * ScrollInnovation Model Engine Type Definitions
 * Types for problem identification, GPT toolkit, prophetic insights, and prototyping
 */

// ============================================================================
// Problem Identification Types
// ============================================================================

export enum ProblemCategory {
  CLIMATE_SOLUTIONS = 'climate_solutions',
  AI_ETHICS = 'ai_ethics',
  HEALTH_ACCESS = 'health_access',
  BIBLICAL_LITERACY = 'biblical_literacy',
  ECONOMIC_JUSTICE = 'economic_justice',
  EDUCATIONAL_REFORM = 'educational_reform',
  GOVERNANCE_SYSTEMS = 'governance_systems',
  SPIRITUAL_FORMATION = 'spiritual_formation',
  SOCIAL_JUSTICE = 'social_justice',
  TECHNOLOGY_ACCESS = 'technology_access'
}

export enum ProblemComplexity {
  BEGINNER = 'beginner',
  INTERMEDIATE = 'intermediate',
  ADVANCED = 'advanced',
  EXPERT = 'expert'
}

export interface ScrollProblem {
  id: string;
  title: string;
  description: string;
  category: ProblemCategory;
  complexity: ProblemComplexity;
  affectedPopulation: number;
  geographicScope: string;
  urgency: number; // 1-10 scale
  priority: number; // 1-10 scale
  currentSolutions: string[];
  gaps: string[];
  constraints: string[];
  stakeholders: string[];
  dataAvailable: string[];
  successMetrics: string[];
  kingdomRelevance: number; // 1-10 scale
  scripturalBasis: string[];
  transformationalPotential: number; // 1-10 scale
  requiredSkills: string[];
  estimatedDuration: number; // in days
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProblemSelectionCriteria {
  category?: ProblemCategory;
  complexity?: ProblemComplexity;
  maxDuration?: number;
  requiredSkills?: string[];
  minKingdomRelevance?: number;
  geographicPreference?: string;
}

export interface ProblemAssignment {
  id: string;
  problemId: string;
  assigneeId: string;
  assigneeType: 'student' | 'team';
  assignedAt: Date;
  deadline: Date;
  status: string;
  progress: number;
  milestones: AssignmentMilestone[];
  feedback: AssignmentFeedback[];
}

export interface AssignmentMilestone {
  id: string;
  title: string;
  description: string;
  dueDate: Date;
  completed: boolean;
  completedAt?: Date;
}

export interface AssignmentFeedback {
  id: string;
  providerId: string;
  providerType: 'mentor' | 'peer' | 'ai';
  content: string;
  timestamp: Date;
  helpful: boolean;
}

export interface ProblemAnalysisFramework {
  problemId: string;
  analysisSteps: string[];
  researchQuestions: string[];
  dataCollectionMethods: string[];
  stakeholderAnalysis: StakeholderInfo[];
  constraintMapping: { [key: string]: string };
  successCriteria: string[];
  spiritualConsiderations: string[];
}

export interface StakeholderInfo {
  name: string;
  role: string;
  interests: string[];
  influence: string;
  engagement: string;
}

// ============================================================================
// ScrollGPT Toolkit Types
// ============================================================================

export enum GPTModel {
  GPT4O = 'gpt-4o',
  SCROLL_MENTOR_GPT = 'scroll-mentor-gpt',
  LAB_GPT = 'lab-gpt',
  CLAUDE_3 = 'claude-3',
  GEMINI_PRO = 'gemini-pro'
}

export enum ToolkitFeature {
  DESIGN_THINKING = 'design_thinking',
  DATA_ANALYSIS = 'data_analysis',
  RESEARCH_ASSISTANCE = 'research_assistance',
  CODE_GENERATION = 'code_generation',
  CONTENT_CREATION = 'content_creation',
  PROBLEM_SOLVING = 'problem_solving',
  BRAINSTORMING = 'brainstorming',
  VALIDATION = 'validation'
}

export interface ScrollGPTToolkit {
  id: string;
  userId: string;
  projectId: string;
  availableModels: GPTModel[];
  activeModel: GPTModel;
  features: ToolkitFeature[];
  conversationHistory: ToolkitConversation[];
  dataAnalysisTools: DataAnalysisTool[];
  researchResources: ResearchResource[];
  collaborationMode: boolean;
  teamMembers: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ToolkitConversation {
  id: string;
  model: GPTModel;
  prompt: string;
  response: string;
  context: string;
  timestamp: Date;
  helpful: boolean;
  savedForReference: boolean;
}

export interface DataAnalysisTool {
  name: string;
  type: 'statistical' | 'visualization' | 'ml' | 'nlp';
  description: string;
  capabilities: string[];
  dataFormats: string[];
}

export interface ResearchResource {
  id: string;
  title: string;
  type: 'paper' | 'article' | 'book' | 'dataset' | 'api';
  url: string;
  summary: string;
  relevance: number;
  addedAt: Date;
}

export interface DesignThinkingSession {
  id: string;
  projectId: string;
  phase: DesignThinkingPhase;
  facilitator: GPTModel;
  participants: string[];
  insights: string[];
  ideas: string[];
  prototypes: string[];
  feedback: string[];
  startedAt: Date;
  completedAt?: Date;
}

export enum DesignThinkingPhase {
  EMPATHIZE = 'empathize',
  DEFINE = 'define',
  IDEATE = 'ideate',
  PROTOTYPE = 'prototype',
  TEST = 'test'
}

export interface CollaborativeAISession {
  id: string;
  projectId: string;
  teamId: string;
  models: GPTModel[];
  purpose: string;
  sharedContext: string;
  contributions: AIContribution[];
  synthesis: string;
  createdAt: Date;
}

export interface AIContribution {
  model: GPTModel;
  contributionType: string;
  content: string;
  timestamp: Date;
  votes: number;
}

// ============================================================================
// Prophetic Insight Recording Types
// ============================================================================

export enum InsightSource {
  PRAYER = 'prayer',
  WORSHIP = 'worship',
  SCRIPTURE = 'scripture',
  DREAM = 'dream',
  VISION = 'vision',
  PROPHECY = 'prophecy',
  MEDITATION = 'meditation',
  CONVERSATION = 'conversation'
}

export enum InsightStatus {
  RECORDED = 'recorded',
  UNDER_REVIEW = 'under_review',
  VALIDATED = 'validated',
  IMPLEMENTED = 'implemented',
  ARCHIVED = 'archived'
}

export interface PropheticInsightRecord {
  id: string;
  userId: string;
  projectId?: string;
  source: InsightSource;
  content: string;
  context: string;
  timestamp: Date;
  scripturalBasis: string[];
  interpretation: string;
  applicationNotes: string;
  status: InsightStatus;
  validatedBy?: string[];
  validationNotes?: string;
  kingdomImpact: number;
  implementationSteps: string[];
  relatedInsights: string[];
  tags: string[];
  isPrivate: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface DreamInsight {
  id: string;
  userId: string;
  dreamDate: Date;
  dreamContent: string;
  symbols: DreamSymbol[];
  emotions: string[];
  colors: string[];
  people: string[];
  locations: string[];
  interpretation: string;
  scripturalConnections: string[];
  actionItems: string[];
  prayerPoints: string[];
  followUp: string;
  recordedAt: Date;
}

export interface DreamSymbol {
  symbol: string;
  frequency: number;
  possibleMeanings: string[];
  scripturalReferences: string[];
}

export interface PrayerJournalEntry {
  id: string;
  userId: string;
  entryDate: Date;
  prayerType: 'intercession' | 'thanksgiving' | 'petition' | 'worship' | 'decree';
  content: string;
  scriptures: string[];
  insights: string[];
  answers: PrayerAnswer[];
  relatedProjects: string[];
  isShared: boolean;
  createdAt: Date;
}

export interface PrayerAnswer {
  answeredDate: Date;
  description: string;
  testimony: string;
  kingdomImpact: string;
}

export interface RevelationTracking {
  id: string;
  userId: string;
  revelationType: 'personal' | 'corporate' | 'project' | 'ministry';
  revelation: string;
  receivedDate: Date;
  context: string;
  witnesses: string[];
  elderValidation: ElderValidation[];
  confirmations: Confirmation[];
  implementation: ImplementationPlan;
  outcomes: RevelationOutcome[];
  status: InsightStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface ElderValidation {
  elderId: string;
  elderName: string;
  validationDate: Date;
  assessment: string;
  scripturalAlignment: number;
  propheticAccuracy: number;
  kingdomRelevance: number;
  recommendations: string[];
  approved: boolean;
}

export interface Confirmation {
  type: 'scriptural' | 'prophetic' | 'circumstantial' | 'witness';
  description: string;
  date: Date;
  source: string;
}

export interface ImplementationPlan {
  steps: ImplementationStep[];
  timeline: string;
  resources: string[];
  teamMembers: string[];
  milestones: string[];
}

export interface ImplementationStep {
  order: number;
  description: string;
  responsible: string;
  deadline: Date;
  completed: boolean;
  completedAt?: Date;
}

export interface RevelationOutcome {
  date: Date;
  description: string;
  impact: string;
  testimony: string;
  kingdomAdvancement: number;
}

// ============================================================================
// Prototyping and Deployment Types
// ============================================================================

export enum PrototypeType {
  WEB_APP = 'web_app',
  MOBILE_APP = 'mobile_app',
  DASHBOARD = 'dashboard',
  AI_AGENT = 'ai_agent',
  API = 'api',
  POLICY_FRAMEWORK = 'policy_framework',
  BUSINESS_MODEL = 'business_model',
  EDUCATIONAL_CURRICULUM = 'educational_curriculum',
  RESEARCH_PAPER = 'research_paper',
  SOCIAL_CAMPAIGN = 'social_campaign'
}

export enum DeploymentStatus {
  PLANNING = 'planning',
  DEVELOPMENT = 'development',
  TESTING = 'testing',
  STAGING = 'staging',
  PRODUCTION = 'production',
  MAINTENANCE = 'maintenance',
  DEPRECATED = 'deprecated'
}

export interface PrototypePlatform {
  id: string;
  userId: string;
  projectId: string;
  prototypeType: PrototypeType;
  name: string;
  description: string;
  technologies: Technology[];
  features: PrototypeFeature[];
  architecture: ArchitectureDesign;
  codeRepository: CodeRepository;
  documentation: Documentation[];
  testingEnvironment: TestingEnvironment;
  deploymentPipeline: DeploymentPipeline;
  status: DeploymentStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface Technology {
  name: string;
  version: string;
  purpose: string;
  documentation: string;
}

export interface PrototypeFeature {
  id: string;
  name: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  status: 'planned' | 'in_progress' | 'completed' | 'deferred';
  assignedTo: string[];
  estimatedHours: number;
  actualHours?: number;
}

export interface ArchitectureDesign {
  overview: string;
  components: Component[];
  dataFlow: string;
  integrations: Integration[];
  securityConsiderations: string[];
  scalabilityPlan: string;
}

export interface Component {
  name: string;
  type: string;
  responsibility: string;
  dependencies: string[];
  interfaces: string[];
}

export interface Integration {
  service: string;
  purpose: string;
  apiEndpoint: string;
  authentication: string;
  dataFormat: string;
}

export interface CodeRepository {
  platform: 'github' | 'gitlab' | 'bitbucket';
  url: string;
  branch: string;
  commits: number;
  contributors: string[];
  lastUpdated: Date;
}

export interface Documentation {
  type: 'readme' | 'api' | 'user_guide' | 'technical' | 'deployment';
  title: string;
  content: string;
  lastUpdated: Date;
}

export interface TestingEnvironment {
  type: 'local' | 'staging' | 'production';
  url?: string;
  credentials?: string;
  testCoverage: number;
  testSuites: TestSuite[];
  lastTestRun: Date;
  passRate: number;
}

export interface TestSuite {
  name: string;
  type: 'unit' | 'integration' | 'e2e' | 'performance';
  tests: number;
  passed: number;
  failed: number;
  duration: number;
}

export interface DeploymentPipeline {
  stages: DeploymentStage[];
  automationLevel: 'manual' | 'semi-automated' | 'fully-automated';
  cicdPlatform?: string;
  deploymentFrequency: string;
  rollbackPlan: string;
  monitoringTools: string[];
}

export interface DeploymentStage {
  name: string;
  order: number;
  description: string;
  automated: boolean;
  duration: number;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
}

export interface ValidationResult {
  prototypeId: string;
  validationType: 'functional' | 'usability' | 'performance' | 'security' | 'spiritual';
  validatedBy: string;
  validatedAt: Date;
  passed: boolean;
  score: number;
  findings: ValidationFinding[];
  recommendations: string[];
}

export interface ValidationFinding {
  severity: 'critical' | 'high' | 'medium' | 'low';
  category: string;
  description: string;
  location: string;
  remediation: string;
}

export interface StudentSolution {
  id: string;
  studentId: string;
  problemId: string;
  prototypeId: string;
  title: string;
  description: string;
  approach: string;
  technologies: string[];
  outcomes: SolutionOutcome[];
  impact: ImpactMeasurement;
  presentation: PresentationMaterial;
  feedback: SolutionFeedback[];
  awards: string[];
  published: boolean;
  publishedAt?: Date;
  createdAt: Date;
}

export interface SolutionOutcome {
  metric: string;
  target: string;
  achieved: string;
  evidence: string;
}

export interface ImpactMeasurement {
  peopleHelped: number;
  problemsSolved: number;
  costSavings: number;
  timesSaved: number;
  kingdomAdvancement: number;
  testimonies: string[];
}

export interface PresentationMaterial {
  slides: string;
  video: string;
  demo: string;
  documentation: string;
  codeRepository: string;
}

export interface SolutionFeedback {
  providerId: string;
  providerType: 'mentor' | 'peer' | 'stakeholder' | 'elder';
  rating: number;
  comments: string;
  strengths: string[];
  improvements: string[];
  timestamp: Date;
}
