export enum CareerTrack {
  SCROLL_FOUNDER = 'ScrollFounder',
  SCROLL_AMBASSADOR = 'ScrollAmbassador',
  SCROLL_PRIEST_SCRIBE = 'ScrollPriest/ScrollScribe',
  SCROLL_ENGINEER = 'ScrollEngineer',
  SCROLL_SCHOLAR = 'ScrollScholar',
  SCROLL_BUILDER = 'ScrollBuilder'
}

export interface CareerPathwayProfile {
  id: string;
  studentId: string;
  selectedTrack: CareerTrack;
  callingAssessment: CallingAssessment;
  progressMetrics: TrackProgressMetrics;
  competencies: TrackCompetency[];
  projects: CareerProject[];
  mentorships: MentorshipConnection[];
  certifications: TrackCertification[];
  createdAt: Date;
  updatedAt: Date;
}

export interface CallingAssessment {
  divineCallingClarity: number; // 1-10 scale
  spiritualGifts: SpiritualGift[];
  passionAreas: string[];
  skillAssessment: SkillAssessment;
  kingdomVision: string;
  personalMission: string;
  assessmentDate: Date;
}

export interface SpiritualGift {
  name: string;
  strength: number; // 1-10 scale
  manifestation: string;
  development: GiftDevelopment;
}

export interface GiftDevelopment {
  currentLevel: number;
  targetLevel: number;
  developmentPlan: string[];
  milestones: DevelopmentMilestone[];
}

export interface DevelopmentMilestone {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  completedDate?: Date;
  evidence?: string;
}

export interface SkillAssessment {
  technicalSkills: TechnicalSkill[];
  leadershipSkills: LeadershipSkill[];
  communicationSkills: CommunicationSkill[];
  spiritualSkills: SpiritualSkill[];
}

export interface TechnicalSkill {
  name: string;
  proficiency: number; // 1-10 scale
  relevantToTrack: boolean;
  certifications: string[];
}

export interface LeadershipSkill {
  name: string;
  proficiency: number;
  experience: string[];
  impact: string;
}

export interface CommunicationSkill {
  name: string;
  proficiency: number;
  languages: string[];
  culturalCompetency: number;
}

export interface SpiritualSkill {
  name: string;
  maturity: number;
  application: string[];
  fruitfulness: string;
}

export interface TrackProgressMetrics {
  overallProgress: number; // 0-100%
  competencyCompletion: number; // 0-100%
  projectCompletion: number; // 0-100%
  spiritualFormation: number; // 0-100%
  practicalApplication: number; // 0-100%
  kingdomImpact: number; // 0-100%
  readinessScore: number; // 0-100%
}

export interface TrackCompetency {
  id: string;
  name: string;
  description: string;
  track: CareerTrack;
  category: CompetencyCategory;
  requiredLevel: number;
  currentLevel: number;
  assessmentCriteria: AssessmentCriteria[];
  developmentResources: DevelopmentResource[];
  completed: boolean;
}

export enum CompetencyCategory {
  SPIRITUAL_FORMATION = 'Spiritual Formation',
  TECHNICAL_SKILLS = 'Technical Skills',
  LEADERSHIP = 'Leadership',
  COMMUNICATION = 'Communication',
  CULTURAL_INTELLIGENCE = 'Cultural Intelligence',
  KINGDOM_PERSPECTIVE = 'Kingdom Perspective',
  PRACTICAL_APPLICATION = 'Practical Application'
}

export interface AssessmentCriteria {
  criterion: string;
  weight: number;
  evaluationMethod: EvaluationMethod;
  passingScore: number;
}

export enum EvaluationMethod {
  AI_ASSESSMENT = 'AI Assessment',
  PEER_REVIEW = 'Peer Review',
  MENTOR_EVALUATION = 'Mentor Evaluation',
  PROJECT_DEMONSTRATION = 'Project Demonstration',
  SPIRITUAL_DISCERNMENT = 'Spiritual Discernment',
  PRACTICAL_APPLICATION = 'Practical Application'
}

export interface DevelopmentResource {
  id: string;
  title: string;
  type: ResourceType;
  url?: string;
  description: string;
  estimatedTime: number; // in hours
  difficulty: number; // 1-10 scale
  prerequisites: string[];
}

export enum ResourceType {
  COURSE = 'Course',
  BOOK = 'Book',
  VIDEO = 'Video',
  WORKSHOP = 'Workshop',
  MENTORSHIP = 'Mentorship',
  PROJECT = 'Project',
  SCRIPTURE_STUDY = 'Scripture Study',
  PRAYER_FOCUS = 'Prayer Focus'
}

export interface CareerProject {
  id: string;
  title: string;
  description: string;
  track: CareerTrack;
  type: ProjectType;
  status: ProjectStatus;
  objectives: ProjectObjective[];
  deliverables: ProjectDeliverable[];
  timeline: ProjectTimeline;
  mentorId?: string;
  collaborators: string[];
  kingdomImpact: ImpactMeasurement;
  createdAt: Date;
  updatedAt: Date;
}

export enum ProjectType {
  STARTUP_LAUNCH = 'Startup Launch',
  DIPLOMACY_INITIATIVE = 'Diplomacy Initiative',
  SACRED_TEXT_TRANSLATION = 'Sacred Text Translation',
  TECHNOLOGY_BLESSING = 'Technology Blessing',
  TEACHING_PROGRAM = 'Teaching Program',
  INFRASTRUCTURE_DEPLOYMENT = 'Infrastructure Deployment',
  RESEARCH_PROJECT = 'Research Project',
  COMMUNITY_SERVICE = 'Community Service'
}

export enum ProjectStatus {
  PLANNING = 'Planning',
  IN_PROGRESS = 'In Progress',
  REVIEW = 'Review',
  COMPLETED = 'Completed',
  DEPLOYED = 'Deployed',
  IMPACTING = 'Impacting'
}

export interface ProjectObjective {
  id: string;
  description: string;
  measurable: boolean;
  target: string;
  completed: boolean;
  completedDate?: Date;
}

export interface ProjectDeliverable {
  id: string;
  name: string;
  description: string;
  dueDate: Date;
  status: DeliverableStatus;
  submittedDate?: Date;
  feedback?: string;
  approvedBy?: string;
}

export enum DeliverableStatus {
  NOT_STARTED = 'Not Started',
  IN_PROGRESS = 'In Progress',
  SUBMITTED = 'Submitted',
  APPROVED = 'Approved',
  NEEDS_REVISION = 'Needs Revision'
}

export interface ProjectTimeline {
  startDate: Date;
  endDate: Date;
  milestones: ProjectMilestone[];
  phases: ProjectPhase[];
}

export interface ProjectMilestone {
  id: string;
  title: string;
  description: string;
  targetDate: Date;
  completed: boolean;
  completedDate?: Date;
  significance: string;
}

export interface ProjectPhase {
  id: string;
  name: string;
  description: string;
  startDate: Date;
  endDate: Date;
  status: PhaseStatus;
  deliverables: string[]; // deliverable IDs
}

export enum PhaseStatus {
  UPCOMING = 'Upcoming',
  ACTIVE = 'Active',
  COMPLETED = 'Completed',
  DELAYED = 'Delayed'
}

export interface ImpactMeasurement {
  spiritualImpact: number; // 1-10 scale
  communityImpact: number; // 1-10 scale
  globalReach: number; // 1-10 scale
  kingdomAdvancement: number; // 1-10 scale
  sustainabilityScore: number; // 1-10 scale
  testimonies: ImpactTestimony[];
  metrics: ImpactMetric[];
}

export interface ImpactTestimony {
  id: string;
  author: string;
  role: string;
  testimony: string;
  date: Date;
  verified: boolean;
}

export interface ImpactMetric {
  name: string;
  value: number;
  unit: string;
  description: string;
  measuredAt: Date;
}

export interface MentorshipConnection {
  id: string;
  mentorId: string;
  menteeId: string;
  track: CareerTrack;
  focus: MentorshipFocus[];
  status: MentorshipStatus;
  sessions: MentorshipSession[];
  goals: MentorshipGoal[];
  startDate: Date;
  endDate?: Date;
}

export enum MentorshipFocus {
  SPIRITUAL_FORMATION = 'Spiritual Formation',
  SKILL_DEVELOPMENT = 'Skill Development',
  CAREER_GUIDANCE = 'Career Guidance',
  PROJECT_SUPPORT = 'Project Support',
  KINGDOM_VISION = 'Kingdom Vision',
  PRACTICAL_WISDOM = 'Practical Wisdom'
}

export enum MentorshipStatus {
  REQUESTED = 'Requested',
  ACTIVE = 'Active',
  PAUSED = 'Paused',
  COMPLETED = 'Completed',
  TERMINATED = 'Terminated'
}

export interface MentorshipSession {
  id: string;
  date: Date;
  duration: number; // in minutes
  type: SessionType;
  agenda: string;
  notes: string;
  actionItems: ActionItem[];
  nextSteps: string;
}

export enum SessionType {
  ONE_ON_ONE = 'One-on-One',
  GROUP_SESSION = 'Group Session',
  PROJECT_REVIEW = 'Project Review',
  SPIRITUAL_DIRECTION = 'Spiritual Direction',
  SKILL_ASSESSMENT = 'Skill Assessment'
}

export interface ActionItem {
  id: string;
  description: string;
  assignedTo: string;
  dueDate: Date;
  completed: boolean;
  completedDate?: Date;
}

export interface MentorshipGoal {
  id: string;
  description: string;
  category: MentorshipFocus;
  targetDate: Date;
  progress: number; // 0-100%
  completed: boolean;
  completedDate?: Date;
}

export interface TrackCertification {
  id: string;
  name: string;
  track: CareerTrack;
  level: CertificationLevel;
  requirements: CertificationRequirement[];
  issuedDate?: Date;
  expiryDate?: Date;
  credentialId?: string;
  verificationUrl?: string;
  status: CertificationStatus;
}

export enum CertificationLevel {
  FOUNDATION = 'Foundation',
  INTERMEDIATE = 'Intermediate',
  ADVANCED = 'Advanced',
  EXPERT = 'Expert',
  MASTER = 'Master'
}

export interface CertificationRequirement {
  id: string;
  description: string;
  type: RequirementType;
  completed: boolean;
  completedDate?: Date;
  evidence?: string;
}

export enum RequirementType {
  COURSE_COMPLETION = 'Course Completion',
  PROJECT_SUBMISSION = 'Project Submission',
  ASSESSMENT_PASS = 'Assessment Pass',
  MENTORSHIP_HOURS = 'Mentorship Hours',
  SPIRITUAL_MILESTONE = 'Spiritual Milestone',
  PRACTICAL_DEMONSTRATION = 'Practical Demonstration'
}

export enum CertificationStatus {
  NOT_STARTED = 'Not Started',
  IN_PROGRESS = 'In Progress',
  PENDING_REVIEW = 'Pending Review',
  ISSUED = 'Issued',
  EXPIRED = 'Expired',
  REVOKED = 'Revoked'
}

// Track-specific interfaces
export interface ScrollFounderTrack {
  entrepreneurshipSkills: EntrepreneurshipSkill[];
  businessPlan: BusinessPlan;
  startupProjects: StartupProject[];
  investorConnections: InvestorConnection[];
  kingdomBusinessPrinciples: KingdomBusinessPrinciple[];
}

export interface ScrollAmbassadorTrack {
  diplomacySkills: DiplomacySkill[];
  culturalCompetencies: CulturalCompetency[];
  peacebuildingProjects: PeacebuildingProject[];
  languageProficiencies: LanguageProficiency[];
  internationalConnections: InternationalConnection[];
}

export interface ScrollPriestScribeTrack {
  translationProjects: TranslationProject[];
  sacredTextKnowledge: SacredTextKnowledge[];
  teachingExperiences: TeachingExperience[];
  xrBibleContent: XRBibleContent[];
  spiritualMaturity: SpiritualMaturity;
}

export interface ScrollEngineerTrack {
  technicalProjects: TechnicalProject[];
  communityBlessings: CommunityBlessing[];
  technologySkills: TechnologySkill[];
  innovationProjects: InnovationProject[];
  ethicalTechPrinciples: EthicalTechPrinciple[];
}

export interface ScrollScholarTrack {
  researchProjects: ResearchProject[];
  publicationRecord: Publication[];
  teachingPortfolio: TeachingPortfolio;
  mentoringExperience: MentoringExperience[];
  academicNetworks: AcademicNetwork[];
}

export interface ScrollBuilderTrack {
  infrastructureProjects: InfrastructureProject[];
  deploymentExperience: DeploymentExperience[];
  systemsThinking: SystemsThinking;
  nationBuildingProjects: NationBuildingProject[];
  sustainabilityPrinciples: SustainabilityPrinciple[];
}

// Additional supporting interfaces would be defined here...
// (Keeping this concise for the implementation)