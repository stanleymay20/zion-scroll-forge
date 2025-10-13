import {
  CareerProject,
  ProjectStatus,
  ProjectType
} from '../types/career-pathways';

export interface ScrollBuilderProgram {
  id: string;
  studentId: string;
  programPhase: BuilderProgramPhase;
  infrastructureProfile: InfrastructureProfile;
  deploymentProjects: DeploymentProject[];
  nationBuildingInitiatives: NationBuildingInitiative[];
  systemsThinking: SystemsThinking;
  sustainabilityFramework: SustainabilityFramework;
  globalPartnerships: GlobalPartnership[];
  impactMeasurement: BuilderImpactMeasurement;
  createdAt: Date;
  updatedAt: Date;
}

export enum BuilderProgramPhase {
  SYSTEMS_FOUNDATION = 'Systems Foundation',
  INFRASTRUCTURE_DESIGN = 'Infrastructure Design',
  DEPLOYMENT_PLANNING = 'Deployment Planning',
  PILOT_IMPLEMENTATION = 'Pilot Implementation',
  SCALING_OPERATIONS = 'Scaling Operations',
  NATION_BUILDING = 'Nation Building',
  GLOBAL_IMPACT = 'Global Impact'
}

export interface InfrastructureProfile {
  id: string;
  specializations: InfrastructureSpecialization[];
  technicalCapabilities: TechnicalCapability[];
  deploymentExperience: DeploymentExperience[];
  systemsExpertise: SystemsExpertise;
  leadershipStyle: InfrastructureLeadership;
  visionaryCapacity: VisionaryCapacity;
}

export enum InfrastructureSpecialization {
  DIGITAL_INFRASTRUCTURE = 'Digital Infrastructure',
  PHYSICAL_INFRASTRUCTURE = 'Physical Infrastructure',
  SOCIAL_INFRASTRUCTURE = 'Social Infrastructure',
  ECONOMIC_INFRASTRUCTURE = 'Economic Infrastructure',
  EDUCATIONAL_INFRASTRUCTURE = 'Educational Infrastructure',
  HEALTHCARE_INFRASTRUCTURE = 'Healthcare Infrastructure',
  GOVERNANCE_INFRASTRUCTURE = 'Governance Infrastructure',
  SPIRITUAL_INFRASTRUCTURE = 'Spiritual Infrastructure'
}

export interface TechnicalCapability {
  capability: string;
  specialization: InfrastructureSpecialization;
  proficiency: number; // 1-10 scale
  experience: number; // years
  certifications: string[];
  projects: string[];
  impact: string;
}

export interface DeploymentExperience {
  project: string;
  location: string;
  scale: DeploymentScale;
  duration: number; // months
  role: string;
  challenges: string[];
  solutions: string[];
  outcomes: string[];
  impact: string;
}

export enum DeploymentScale {
  LOCAL = 'Local',
  REGIONAL = 'Regional',
  NATIONAL = 'National',
  INTERNATIONAL = 'International',
  GLOBAL = 'Global'
}

export interface SystemsExpertise {
  systemsThinking: number; // 1-10 scale
  complexityManagement: number;
  interdependencyAnalysis: number;
  emergentProperties: number;
  feedbackLoops: number;
  systemsDesign: number;
  systemsIntegration: number;
}

export interface InfrastructureLeadership {
  style: LeadershipStyle;
  competencies: LeadershipCompetency[];
  experience: LeadershipExperience[];
  influence: InfluenceMetrics;
  development: LeadershipDevelopment;
}

export enum LeadershipStyle {
  TRANSFORMATIONAL = 'Transformational',
  SERVANT = 'Servant',
  VISIONARY = 'Visionary',
  COLLABORATIVE = 'Collaborative',
  ADAPTIVE = 'Adaptive',
  SYSTEMS = 'Systems'
}

export interface LeadershipCompetency {
  competency: string;
  level: number; // 1-10 scale
  evidence: string[];
  development: string[];
}

export interface LeadershipExperience {
  role: string;
  organization: string;
  duration: number; // months
  teamSize: number;
  budget: number;
  achievements: string[];
  challenges: string[];
  learnings: string[];
}

export interface InfluenceMetrics {
  networkSize: number;
  reachScope: string[];
  decisionInfluence: number; // 1-10 scale
  thoughtLeadership: number;
  platformFollowing: number;
  speakingEngagements: number;
}

export interface LeadershipDevelopment {
  currentLevel: number; // 1-10 scale
  targetLevel: number;
  developmentPlan: string[];
  mentors: string[];
  timeline: string;
}

export interface VisionaryCapacity {
  visionClarity: number; // 1-10 scale
  futureOrientation: number;
  innovativeThinking: number;
  strategicPlanning: number;
  inspirationalCommunication: number;
  changeManagement: number;
  visions: Vision[];
}

export interface Vision {
  title: string;
  description: string;
  scope: VisionScope;
  timeline: string;
  stakeholders: string[];
  impact: string;
  feasibility: number; // 1-10 scale
  progress: number; // 0-100%
}

export enum VisionScope {
  COMMUNITY = 'Community',
  CITY = 'City',
  REGION = 'Region',
  NATION = 'Nation',
  CONTINENT = 'Continent',
  GLOBAL = 'Global'
}

export interface DeploymentProject {
  id: string;
  title: string;
  description: string;
  targetLocation: TargetLocation;
  infrastructureType: InfrastructureType;
  scope: ProjectScope;
  stakeholders: ProjectStakeholder[];
  timeline: DeploymentTimeline;
  resources: DeploymentResource[];
  phases: DeploymentPhase[];
  risks: DeploymentRisk[];
  sustainability: DeploymentSustainability;
  impact: DeploymentImpact;
  status: ProjectStatus;
}

export interface TargetLocation {
  country: string;
  region: string;
  communities: string[];
  population: number;
  demographics: LocationDemographics;
  context: LocationContext;
  needs: LocationNeed[];
  assets: LocationAsset[];
}

export interface LocationDemographics {
  ageDistribution: AgeDistribution[];
  education: EducationDistribution[];
  income: IncomeDistribution[];
  employment: EmploymentDistribution[];
  languages: LanguageDistribution[];
}

export interface AgeDistribution {
  ageGroup: string;
  percentage: number;
  count: number;
}

export interface EducationDistribution {
  level: string;
  percentage: number;
  count: number;
}

export interface IncomeDistribution {
  bracket: string;
  percentage: number;
  count: number;
}

export interface EmploymentDistribution {
  sector: string;
  percentage: number;
  count: number;
}

export interface LanguageDistribution {
  language: string;
  percentage: number;
  fluency: string;
}

export interface LocationContext {
  political: PoliticalContext;
  economic: EconomicContext;
  social: SocialContext;
  technological: TechnologicalContext;
  environmental: EnvironmentalContext;
  legal: LegalContext;
}

export interface PoliticalContext {
  stability: number; // 1-10 scale
  governance: string;
  policies: string[];
  regulations: string[];
  support: number;
}

export interface EconomicContext {
  gdpPerCapita: number;
  growthRate: number;
  inflation: number;
  unemployment: number;
  majorIndustries: string[];
}

export interface SocialContext {
  culturalValues: string[];
  socialCohesion: number; // 1-10 scale
  trustLevel: number;
  changeReadiness: number;
  conflictLevel: number;
}

export interface TechnologicalContext {
  digitalInfrastructure: number; // 1-10 scale
  internetPenetration: number;
  mobileAdoption: number;
  technicalSkills: number;
  innovationCapacity: number;
}

export interface EnvironmentalContext {
  climateRisks: string[];
  naturalResources: string[];
  sustainability: number; // 1-10 scale
  environmentalPolicies: string[];
  greenTechnology: number;
}

export interface LegalContext {
  ruleOfLaw: number; // 1-10 scale
  regulatoryFramework: string[];
  businessEnvironment: number;
  intellectualProperty: number;
  contractEnforcement: number;
}

export interface LocationNeed {
  category: NeedCategory;
  description: string;
  urgency: number; // 1-10 scale
  impact: number;
  affectedPopulation: number;
  currentSolutions: string[];
  gaps: string[];
}

export enum NeedCategory {
  BASIC_SERVICES = 'Basic Services',
  INFRASTRUCTURE = 'Infrastructure',
  EDUCATION = 'Education',
  HEALTHCARE = 'Healthcare',
  ECONOMIC_OPPORTUNITY = 'Economic Opportunity',
  GOVERNANCE = 'Governance',
  TECHNOLOGY = 'Technology',
  ENVIRONMENT = 'Environment'
}

export interface LocationAsset {
  type: AssetType;
  description: string;
  value: number; // 1-10 scale
  accessibility: number;
  utilization: number;
  potential: number;
}

export enum AssetType {
  HUMAN_CAPITAL = 'Human Capital',
  NATURAL_RESOURCES = 'Natural Resources',
  INFRASTRUCTURE = 'Infrastructure',
  INSTITUTIONS = 'Institutions',
  CULTURAL_HERITAGE = 'Cultural Heritage',
  ECONOMIC_BASE = 'Economic Base',
  SOCIAL_NETWORKS = 'Social Networks'
}

export enum InfrastructureType {
  DIGITAL = 'Digital',
  TRANSPORTATION = 'Transportation',
  ENERGY = 'Energy',
  WATER = 'Water',
  TELECOMMUNICATIONS = 'Telecommunications',
  HEALTHCARE = 'Healthcare',
  EDUCATION = 'Education',
  HOUSING = 'Housing',
  WASTE_MANAGEMENT = 'Waste Management',
  FINANCIAL = 'Financial'
}

export interface ProjectScope {
  scale: ProjectScale;
  beneficiaries: number;
  coverage: CoverageArea;
  duration: number; // months
  budget: number;
  complexity: number; // 1-10 scale
}

export enum ProjectScale {
  PILOT = 'Pilot',
  LOCAL = 'Local',
  REGIONAL = 'Regional',
  NATIONAL = 'National',
  MULTI_NATIONAL = 'Multi-National'
}

export interface CoverageArea {
  geographic: string[];
  demographic: string[];
  sectoral: string[];
  institutional: string[];
}

export interface ProjectStakeholder {
  name: string;
  type: StakeholderType;
  role: string;
  influence: number; // 1-10 scale
  interest: number;
  support: number;
  engagement: EngagementStrategy;
}

export enum StakeholderType {
  GOVERNMENT = 'Government',
  COMMUNITY = 'Community',
  PRIVATE_SECTOR = 'Private Sector',
  NGO = 'NGO',
  INTERNATIONAL = 'International',
  ACADEMIC = 'Academic',
  RELIGIOUS = 'Religious',
  MEDIA = 'Media'
}

export interface EngagementStrategy {
  approach: string;
  frequency: string;
  channels: string[];
  objectives: string[];
  success: string[];
}

export interface DeploymentTimeline {
  startDate: Date;
  endDate: Date;
  phases: TimelinePhase[];
  milestones: TimelineMilestone[];
  dependencies: TimelineDependency[];
}

export interface TimelinePhase {
  phase: string;
  startDate: Date;
  endDate: Date;
  objectives: string[];
  deliverables: string[];
  resources: string[];
}

export interface TimelineMilestone {
  milestone: string;
  date: Date;
  description: string;
  criteria: string[];
  stakeholders: string[];
}

export interface TimelineDependency {
  task: string;
  dependsOn: string[];
  type: DependencyType;
  criticality: number; // 1-10 scale
}

export enum DependencyType {
  FINISH_TO_START = 'Finish to Start',
  START_TO_START = 'Start to Start',
  FINISH_TO_FINISH = 'Finish to Finish',
  START_TO_FINISH = 'Start to Finish'
}

export interface DeploymentResource {
  type: ResourceType;
  description: string;
  quantity: number;
  cost: number;
  source: string;
  availability: string;
  constraints: string[];
}

export enum ResourceType {
  HUMAN = 'Human',
  FINANCIAL = 'Financial',
  TECHNICAL = 'Technical',
  MATERIAL = 'Material',
  EQUIPMENT = 'Equipment',
  KNOWLEDGE = 'Knowledge',
  NETWORK = 'Network'
}

export interface DeploymentPhase {
  id: string;
  name: string;
  description: string;
  objectives: PhaseObjective[];
  activities: PhaseActivity[];
  deliverables: PhaseDeliverable[];
  timeline: PhaseTimeline;
  resources: PhaseResource[];
  risks: PhaseRisk[];
  success: SuccessCriteria[];
}

export interface PhaseObjective {
  objective: string;
  description: string;
  measurable: boolean;
  target: string;
  timeline: string;
}

export interface PhaseActivity {
  activity: string;
  description: string;
  responsible: string;
  duration: number; // days
  dependencies: string[];
  resources: string[];
}

export interface PhaseDeliverable {
  deliverable: string;
  description: string;
  type: DeliverableType;
  dueDate: Date;
  quality: QualityStandard[];
  acceptance: AcceptanceCriteria[];
}

export enum DeliverableType {
  DOCUMENT = 'Document',
  SYSTEM = 'System',
  INFRASTRUCTURE = 'Infrastructure',
  TRAINING = 'Training',
  PROCESS = 'Process',
  REPORT = 'Report'
}

export interface QualityStandard {
  standard: string;
  description: string;
  measurement: string;
  threshold: number;
}

export interface AcceptanceCriteria {
  criterion: string;
  description: string;
  test: string;
  approver: string;
}

export interface PhaseTimeline {
  startDate: Date;
  endDate: Date;
  buffer: number; // days
  critical: boolean;
}

export interface PhaseResource {
  resource: string;
  type: ResourceType;
  allocation: number;
  duration: number; // days
  cost: number;
}

export interface PhaseRisk {
  risk: string;
  probability: number; // 1-10 scale
  impact: number;
  mitigation: string[];
  contingency: string;
}

export interface SuccessCriteria {
  criterion: string;
  measurement: string;
  target: number;
  threshold: number;
  frequency: string;
}

export interface DeploymentRisk {
  id: string;
  risk: string;
  category: RiskCategory;
  probability: number; // 1-10 scale
  impact: number;
  severity: RiskSeverity;
  mitigation: RiskMitigation;
  contingency: ContingencyPlan;
  monitoring: RiskMonitoring;
}

export enum RiskCategory {
  TECHNICAL = 'Technical',
  FINANCIAL = 'Financial',
  POLITICAL = 'Political',
  SOCIAL = 'Social',
  ENVIRONMENTAL = 'Environmental',
  OPERATIONAL = 'Operational',
  REGULATORY = 'Regulatory'
}

export enum RiskSeverity {
  LOW = 'Low',
  MEDIUM = 'Medium',
  HIGH = 'High',
  CRITICAL = 'Critical'
}

export interface RiskMitigation {
  strategies: MitigationStrategy[];
  timeline: string;
  responsible: string;
  cost: number;
  effectiveness: number; // 1-10 scale
}

export interface MitigationStrategy {
  strategy: string;
  description: string;
  actions: string[];
  timeline: string;
  resources: string[];
}

export interface ContingencyPlan {
  triggers: ContingencyTrigger[];
  actions: ContingencyAction[];
  resources: ContingencyResource[];
  timeline: string;
}

export interface ContingencyTrigger {
  trigger: string;
  condition: string;
  threshold: number;
  monitoring: string;
}

export interface ContingencyAction {
  action: string;
  description: string;
  responsible: string;
  timeline: string;
  resources: string[];
}

export interface ContingencyResource {
  resource: string;
  type: ResourceType;
  availability: string;
  cost: number;
  source: string;
}

export interface RiskMonitoring {
  indicators: RiskIndicator[];
  frequency: string;
  responsible: string;
  reporting: string;
  escalation: string;
}

export interface RiskIndicator {
  indicator: string;
  measurement: string;
  threshold: number;
  frequency: string;
  source: string;
}

export interface DeploymentSustainability {
  financial: FinancialSustainability;
  technical: TechnicalSustainability;
  institutional: InstitutionalSustainability;
  environmental: EnvironmentalSustainability;
  social: SocialSustainability;
}

export interface FinancialSustainability {
  model: SustainabilityModel;
  revenue: RevenueModel[];
  costs: CostModel;
  funding: FundingModel;
  viability: ViabilityAnalysis;
}

export enum SustainabilityModel {
  SELF_FUNDING = 'Self Funding',
  USER_FEES = 'User Fees',
  GOVERNMENT_SUBSIDY = 'Government Subsidy',
  DONOR_SUPPORT = 'Donor Support',
  HYBRID = 'Hybrid',
  COMMUNITY_OWNERSHIP = 'Community Ownership'
}

export interface RevenueModel {
  source: string;
  type: RevenueType;
  amount: number;
  frequency: string;
  reliability: number; // 1-10 scale
  growth: number; // percentage
}

export enum RevenueType {
  SERVICE_FEES = 'Service Fees',
  SUBSCRIPTION = 'Subscription',
  LICENSING = 'Licensing',
  GRANTS = 'Grants',
  DONATIONS = 'Donations',
  GOVERNMENT = 'Government',
  COMMERCIAL = 'Commercial'
}

export interface CostModel {
  categories: CostCategory[];
  total: number;
  breakdown: CostBreakdown;
  optimization: CostOptimization[];
}

export interface CostCategory {
  category: string;
  amount: number;
  percentage: number;
  variability: CostVariability;
  optimization: number; // potential reduction %
}

export enum CostVariability {
  FIXED = 'Fixed',
  VARIABLE = 'Variable',
  SEMI_VARIABLE = 'Semi-Variable',
  STEP = 'Step'
}

export interface CostBreakdown {
  operational: number;
  maintenance: number;
  personnel: number;
  technology: number;
  overhead: number;
}

export interface CostOptimization {
  area: string;
  potential: number; // percentage reduction
  strategy: string[];
  timeline: string;
  investment: number;
}

export interface FundingModel {
  sources: FundingSource[];
  diversification: number; // 1-10 scale
  stability: number;
  growth: number;
  strategy: FundingStrategy;
}

export interface FundingSource {
  source: string;
  type: FundingType;
  amount: number;
  duration: string;
  conditions: string[];
  reliability: number; // 1-10 scale
}

export enum FundingType {
  GRANT = 'Grant',
  LOAN = 'Loan',
  EQUITY = 'Equity',
  DONATION = 'Donation',
  GOVERNMENT = 'Government',
  MULTILATERAL = 'Multilateral',
  PRIVATE = 'Private'
}

export interface FundingStrategy {
  approach: string;
  timeline: FundingTimeline;
  targets: FundingTarget[];
  proposals: FundingProposal[];
  relationships: FundingRelationship[];
}

export interface FundingTimeline {
  phases: FundingPhase[];
  milestones: FundingMilestone[];
  contingencies: FundingContingency[];
}

export interface FundingPhase {
  phase: string;
  amount: number;
  sources: string[];
  timeline: string;
  requirements: string[];
}

export interface FundingMilestone {
  milestone: string;
  amount: number;
  date: Date;
  conditions: string[];
  deliverables: string[];
}

export interface FundingContingency {
  scenario: string;
  probability: number;
  impact: string;
  response: string[];
  alternatives: string[];
}

export interface FundingTarget {
  target: string;
  type: FundingType;
  amount: number;
  probability: number;
  timeline: string;
  requirements: string[];
}

export interface FundingProposal {
  proposal: string;
  target: string;
  amount: number;
  status: ProposalStatus;
  timeline: string;
  requirements: string[];
}

export enum ProposalStatus {
  DRAFT = 'Draft',
  SUBMITTED = 'Submitted',
  UNDER_REVIEW = 'Under Review',
  APPROVED = 'Approved',
  REJECTED = 'Rejected',
  FUNDED = 'Funded'
}

export interface FundingRelationship {
  organization: string;
  type: RelationshipType;
  strength: number; // 1-10 scale
  history: string[];
  potential: string[];
  strategy: string[];
}

export enum RelationshipType {
  EXISTING_FUNDER = 'Existing Funder',
  POTENTIAL_FUNDER = 'Potential Funder',
  PARTNER = 'Partner',
  INTERMEDIARY = 'Intermediary',
  COMPETITOR = 'Competitor',
  ALLY = 'Ally'
}

export interface ViabilityAnalysis {
  financial: number; // 1-10 scale
  market: number;
  technical: number;
  operational: number;
  regulatory: number;
  overall: number;
  scenarios: ViabilityScenario[];
}

export interface ViabilityScenario {
  scenario: string;
  probability: number;
  impact: string;
  viability: number; // 1-10 scale
  response: string[];
}

export interface TechnicalSustainability {
  maintenance: MaintenancePlan;
  upgrades: UpgradePlan;
  support: SupportSystem;
  knowledge: KnowledgeManagement;
  capacity: CapacityBuilding;
}

export interface MaintenancePlan {
  schedule: MaintenanceSchedule[];
  resources: MaintenanceResource[];
  procedures: MaintenanceProcedure[];
  quality: MaintenanceQuality;
}

export interface MaintenanceSchedule {
  task: string;
  frequency: string;
  duration: number; // hours
  resources: string[];
  cost: number;
}

export interface MaintenanceResource {
  resource: string;
  type: ResourceType;
  availability: string;
  cost: number;
  source: string;
}

export interface MaintenanceProcedure {
  procedure: string;
  steps: string[];
  tools: string[];
  skills: string[];
  safety: string[];
}

export interface MaintenanceQuality {
  standards: string[];
  metrics: QualityMetric[];
  monitoring: QualityMonitoring;
  improvement: QualityImprovement;
}

export interface QualityMetric {
  metric: string;
  target: number;
  measurement: string;
  frequency: string;
  responsible: string;
}

export interface QualityMonitoring {
  methods: string[];
  frequency: string;
  reporting: string;
  escalation: string;
}

export interface QualityImprovement {
  process: string[];
  frequency: string;
  responsible: string;
  resources: string[];
}

export interface UpgradePlan {
  schedule: UpgradeSchedule[];
  technology: TechnologyRoadmap;
  funding: UpgradeFunding;
  implementation: UpgradeImplementation;
}

export interface UpgradeSchedule {
  upgrade: string;
  timeline: string;
  priority: UpgradePriority;
  cost: number;
  benefits: string[];
}

export enum UpgradePriority {
  CRITICAL = 'Critical',
  HIGH = 'High',
  MEDIUM = 'Medium',
  LOW = 'Low',
  OPTIONAL = 'Optional'
}

export interface TechnologyRoadmap {
  current: TechnologyState;
  future: TechnologyState;
  transitions: TechnologyTransition[];
  risks: TechnologyRisk[];
}

export interface TechnologyState {
  technologies: string[];
  capabilities: string[];
  limitations: string[];
  lifecycle: string;
}

export interface TechnologyTransition {
  from: string;
  to: string;
  timeline: string;
  cost: number;
  risks: string[];
  benefits: string[];
}

export interface TechnologyRisk {
  risk: string;
  probability: number;
  impact: string;
  mitigation: string[];
}

export interface UpgradeFunding {
  sources: string[];
  timeline: string;
  requirements: string[];
  contingencies: string[];
}

export interface UpgradeImplementation {
  approach: string;
  phases: string[];
  resources: string[];
  timeline: string;
}

export interface SupportSystem {
  levels: SupportLevel[];
  channels: SupportChannel[];
  resources: SupportResource[];
  training: SupportTraining;
}

export interface SupportLevel {
  level: string;
  scope: string[];
  response: string;
  escalation: string;
  resources: string[];
}

export interface SupportChannel {
  channel: string;
  availability: string;
  capacity: string;
  response: string;
  cost: number;
}

export interface SupportResource {
  resource: string;
  type: ResourceType;
  availability: string;
  capacity: string;
  cost: number;
}

export interface SupportTraining {
  programs: TrainingProgram[];
  materials: TrainingMaterial[];
  delivery: TrainingDelivery;
  assessment: TrainingAssessment;
}

export interface TrainingProgram {
  program: string;
  audience: string;
  objectives: string[];
  content: string[];
  duration: string;
  cost: number;
}

export interface TrainingMaterial {
  material: string;
  type: MaterialType;
  audience: string;
  language: string;
  format: string;
}

export enum MaterialType {
  MANUAL = 'Manual',
  VIDEO = 'Video',
  INTERACTIVE = 'Interactive',
  SIMULATION = 'Simulation',
  REFERENCE = 'Reference',
  ASSESSMENT = 'Assessment'
}

export interface TrainingDelivery {
  methods: DeliveryMethod[];
  schedule: string;
  locations: string[];
  resources: string[];
}

export enum DeliveryMethod {
  IN_PERSON = 'In Person',
  ONLINE = 'Online',
  HYBRID = 'Hybrid',
  SELF_PACED = 'Self Paced',
  MENTORING = 'Mentoring',
  PEER_LEARNING = 'Peer Learning'
}

export interface TrainingAssessment {
  methods: AssessmentMethod[];
  frequency: string;
  standards: string[];
  certification: string[];
}

export enum AssessmentMethod {
  WRITTEN_TEST = 'Written Test',
  PRACTICAL_TEST = 'Practical Test',
  PROJECT = 'Project',
  OBSERVATION = 'Observation',
  PEER_REVIEW = 'Peer Review',
  SELF_ASSESSMENT = 'Self Assessment'
}

export interface KnowledgeManagement {
  documentation: DocumentationSystem;
  transfer: KnowledgeTransfer;
  retention: KnowledgeRetention;
  sharing: KnowledgeSharing;
}

export interface DocumentationSystem {
  types: DocumentationType[];
  standards: DocumentationStandard[];
  maintenance: DocumentationMaintenance;
  access: DocumentationAccess;
}

export interface DocumentationType {
  type: string;
  purpose: string;
  audience: string;
  format: string;
  frequency: string;
}

export interface DocumentationStandard {
  standard: string;
  requirements: string[];
  quality: string[];
  review: string[];
}

export interface DocumentationMaintenance {
  schedule: string;
  responsible: string;
  process: string[];
  quality: string[];
}

export interface DocumentationAccess {
  permissions: string[];
  channels: string[];
  languages: string[];
  formats: string[];
}

export interface KnowledgeTransfer {
  methods: TransferMethod[];
  timeline: string;
  participants: string[];
  outcomes: string[];
}

export enum TransferMethod {
  MENTORING = 'Mentoring',
  TRAINING = 'Training',
  DOCUMENTATION = 'Documentation',
  SHADOWING = 'Shadowing',
  WORKSHOPS = 'Workshops',
  COMMUNITIES = 'Communities'
}

export interface KnowledgeRetention {
  strategies: RetentionStrategy[];
  incentives: string[];
  barriers: string[];
  solutions: string[];
}

export interface RetentionStrategy {
  strategy: string;
  description: string;
  implementation: string[];
  effectiveness: number; // 1-10 scale
}

export interface KnowledgeSharing {
  platforms: SharingPlatform[];
  communities: KnowledgeCommunity[];
  events: SharingEvent[];
  incentives: SharingIncentive[];
}

export interface SharingPlatform {
  platform: string;
  purpose: string;
  users: string[];
  content: string[];
  engagement: number; // 1-10 scale
}

export interface KnowledgeCommunity {
  community: string;
  focus: string;
  members: string[];
  activities: string[];
  outcomes: string[];
}

export interface SharingEvent {
  event: string;
  type: EventType;
  frequency: string;
  participants: string[];
  outcomes: string[];
}

export enum EventType {
  CONFERENCE = 'Conference',
  WORKSHOP = 'Workshop',
  SEMINAR = 'Seminar',
  WEBINAR = 'Webinar',
  MEETUP = 'Meetup',
  HACKATHON = 'Hackathon'
}

export interface SharingIncentive {
  incentive: string;
  type: IncentiveType;
  criteria: string[];
  reward: string;
  effectiveness: number; // 1-10 scale
}

export enum IncentiveType {
  RECOGNITION = 'Recognition',
  FINANCIAL = 'Financial',
  CAREER = 'Career',
  LEARNING = 'Learning',
  SOCIAL = 'Social',
  IMPACT = 'Impact'
}

export interface CapacityBuilding {
  assessment: CapacityAssessment;
  development: CapacityDevelopment;
  monitoring: CapacityMonitoring;
  sustainability: CapacitySustainability;
}

export interface CapacityAssessment {
  areas: CapacityArea[];
  methods: AssessmentMethod[];
  frequency: string;
  stakeholders: string[];
}

export interface CapacityArea {
  area: string;
  current: number; // 1-10 scale
  required: number;
  gap: number;
  priority: CapacityPriority;
}

export enum CapacityPriority {
  CRITICAL = 'Critical',
  HIGH = 'High',
  MEDIUM = 'Medium',
  LOW = 'Low'
}

export interface CapacityDevelopment {
  interventions: CapacityIntervention[];
  timeline: string;
  resources: string[];
  partnerships: string[];
}

export interface CapacityIntervention {
  intervention: string;
  type: InterventionType;
  target: string;
  duration: string;
  cost: number;
  expected: string[];
}

export enum InterventionType {
  TRAINING = 'Training',
  COACHING = 'Coaching',
  MENTORING = 'Mentoring',
  SYSTEMS = 'Systems',
  PROCESSES = 'Processes',
  TECHNOLOGY = 'Technology'
}

export interface CapacityMonitoring {
  indicators: CapacityIndicator[];
  frequency: string;
  methods: string[];
  reporting: string;
}

export interface CapacityIndicator {
  indicator: string;
  baseline: number;
  target: number;
  current: number;
  trend: string;
}

export interface CapacitySustainability {
  factors: SustainabilityFactor[];
  risks: string[];
  strategies: string[];
  monitoring: string[];
}

export interface SustainabilityFactor {
  factor: string;
  importance: number; // 1-10 scale
  current: number;
  required: number;
  actions: string[];
}

export class ScrollBuilderService {
  private apiBaseUrl: string;

  constructor(apiBaseUrl: string = '/api') {
    this.apiBaseUrl = apiBaseUrl;
  }

  // Program enrollment and management
  async enrollInScrollBuilderProgram(studentId: string): Promise<ScrollBuilderProgram> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/scroll-builder/enroll`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ studentId })
      });

      if (!response.ok) {
        throw new Error('Failed to enroll in ScrollBuilder program');
      }

      return await response.json();
    } catch (error) {
      console.error('Error enrolling in ScrollBuilder program:', error);
      throw error;
    }
  }

  async getBuilderProgram(studentId: string): Promise<ScrollBuilderProgram | null> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/scroll-builder/program/${studentId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.status === 404) {
        return null;
      }

      if (!response.ok) {
        throw new Error('Failed to get builder program');
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting builder program:', error);
      throw error;
    }
  }

  // Infrastructure profile development
  async createInfrastructureProfile(studentId: string, profileData: Partial<InfrastructureProfile>): Promise<InfrastructureProfile> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/scroll-builder/infrastructure-profile`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ studentId, ...profileData })
      });

      if (!response.ok) {
        throw new Error('Failed to create infrastructure profile');
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating infrastructure profile:', error);
      throw error;
    }
  }

  // Deployment project management
  async createDeploymentProject(studentId: string, projectData: Partial<DeploymentProject>): Promise<DeploymentProject> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/scroll-builder/deployment-project`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ studentId, ...projectData })
      });

      if (!response.ok) {
        throw new Error('Failed to create deployment project');
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating deployment project:', error);
      throw error;
    }
  }

  async updateProjectStatus(projectId: string, status: ProjectStatus): Promise<DeploymentProject> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/scroll-builder/deployment-project/${projectId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ status })
      });

      if (!response.ok) {
        throw new Error('Failed to update project status');
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating project status:', error);
      throw error;
    }
  }

  // Location assessment
  async assessTargetLocation(locationData: Partial<TargetLocation>): Promise<{
    assessment: string;
    opportunities: string[];
    challenges: string[];
    recommendations: string[];
    feasibility: number;
  }> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/scroll-builder/location-assessment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(locationData)
      });

      if (!response.ok) {
        throw new Error('Failed to assess target location');
      }

      return await response.json();
    } catch (error) {
      console.error('Error assessing target location:', error);
      throw error;
    }
  }

  // Sustainability planning
  async createSustainabilityPlan(projectId: string, planData: Partial<DeploymentSustainability>): Promise<DeploymentSustainability> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/scroll-builder/deployment-project/${projectId}/sustainability`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(planData)
      });

      if (!response.ok) {
        throw new Error('Failed to create sustainability plan');
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating sustainability plan:', error);
      throw error;
    }
  }

  // Impact measurement
  async measureDeploymentImpact(projectId: string): Promise<DeploymentImpact> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/scroll-builder/deployment-project/${projectId}/impact`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to measure deployment impact');
      }

      return await response.json();
    } catch (error) {
      console.error('Error measuring deployment impact:', error);
      throw error;
    }
  }

  // Nation building initiatives
  async createNationBuildingInitiative(studentId: string, initiativeData: Partial<NationBuildingInitiative>): Promise<NationBuildingInitiative> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/scroll-builder/nation-building`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ studentId, ...initiativeData })
      });

      if (!response.ok) {
        throw new Error('Failed to create nation building initiative');
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating nation building initiative:', error);
      throw error;
    }
  }

  // Global partnerships
  async establishGlobalPartnership(studentId: string, partnershipData: Partial<GlobalPartnership>): Promise<GlobalPartnership> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/scroll-builder/global-partnership`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ studentId, ...partnershipData })
      });

      if (!response.ok) {
        throw new Error('Failed to establish global partnership');
      }

      return await response.json();
    } catch (error) {
      console.error('Error establishing global partnership:', error);
      throw error;
    }
  }

  // Systems thinking development
  async assessSystemsThinking(studentId: string): Promise<SystemsThinking> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/scroll-builder/systems-thinking/${studentId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to assess systems thinking');
      }

      return await response.json();
    } catch (error) {
      console.error('Error assessing systems thinking:', error);
      throw error;
    }
  }
}

// Additional supporting interfaces
export interface DeploymentImpact {
  directBeneficiaries: number;
  indirectBeneficiaries: number;
  economicImpact: number;
  socialImpact: number;
  environmentalImpact: number;
  sustainabilityScore: number;
  scalabilityPotential: number;
}

export interface NationBuildingInitiative {
  id: string;
  title: string;
  country: string;
  scope: string;
  objectives: string[];
  timeline: string;
  partners: string[];
  impact: string;
}

export interface GlobalPartnership {
  id: string;
  partner: string;
  type: string;
  focus: string[];
  benefits: string[];
  commitments: string[];
  timeline: string;
}

export interface SystemsThinking {
  level: number;
  competencies: string[];
  applications: string[];
  development: string[];
}

export interface BuilderImpactMeasurement {
  projectsDeployed: number;
  nationsServed: number;
  beneficiariesReached: number;
  infrastructureValue: number;
  sustainabilityScore: number;
  scalabilityIndex: number;
}

export default ScrollBuilderService;