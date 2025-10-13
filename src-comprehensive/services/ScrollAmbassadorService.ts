import {
  CareerProject,
  ProjectStatus,
  ProjectType,
  ImpactMeasurement
} from '../types/career-pathways';

export interface ScrollAmbassadorProgram {
  id: string;
  studentId: string;
  programPhase: AmbassadorProgramPhase;
  diplomacyProfile: DiplomacyProfile;
  culturalCompetencies: CulturalCompetency[];
  languageProficiencies: LanguageProficiency[];
  peacebuildingProjects: PeacebuildingProject[];
  diplomaticMissions: DiplomaticMission[];
  internationalNetworks: InternationalNetwork[];
  conflictResolutionSkills: ConflictResolutionSkill[];
  negotiationExperience: NegotiationExperience[];
  createdAt: Date;
  updatedAt: Date;
}

export enum AmbassadorProgramPhase {
  CALLING_ASSESSMENT = 'Calling Assessment',
  CULTURAL_IMMERSION = 'Cultural Immersion',
  LANGUAGE_MASTERY = 'Language Mastery',
  DIPLOMACY_TRAINING = 'Diplomacy Training',
  CONFLICT_RESOLUTION = 'Conflict Resolution',
  PEACEBUILDING_PRACTICE = 'Peacebuilding Practice',
  INTERNATIONAL_DEPLOYMENT = 'International Deployment',
  GLOBAL_IMPACT = 'Global Impact'
}

export interface DiplomacyProfile {
  id: string;
  propheticGifting: PropheticGifting;
  diplomaticStyle: DiplomaticStyle;
  specializations: DiplomaticSpecialization[];
  geographicFocus: GeographicFocus[];
  culturalAffinities: CulturalAffinity[];
  communicationStrengths: CommunicationStrength[];
  leadershipCapabilities: LeadershipCapability[];
  spiritualAuthority: SpiritualAuthority;
}

export interface PropheticGifting {
  discernmentLevel: number; // 1-10 scale
  propheticInsight: number;
  spiritualWarfareCapacity: number;
  intercessionStrength: number;
  wisdomApplication: number;
  kingdomPerspective: number;
  confirmedGifts: ConfirmedGift[];
  developmentAreas: DevelopmentArea[];
}

export interface ConfirmedGift {
  gift: string;
  confirmation: string;
  confirmedBy: string;
  date: Date;
  manifestations: string[];
  fruitfulness: string;
}

export interface DevelopmentArea {
  area: string;
  currentLevel: number;
  targetLevel: number;
  developmentPlan: string[];
  mentor: string;
  timeline: string;
}

export enum DiplomaticStyle {
  PROPHETIC_MEDIATOR = 'Prophetic Mediator',
  CULTURAL_BRIDGE_BUILDER = 'Cultural Bridge Builder',
  PEACE_NEGOTIATOR = 'Peace Negotiator',
  KINGDOM_AMBASSADOR = 'Kingdom Ambassador',
  RECONCILIATION_CATALYST = 'Reconciliation Catalyst',
  WISDOM_COUNSELOR = 'Wisdom Counselor'
}

export enum DiplomaticSpecialization {
  RELIGIOUS_FREEDOM = 'Religious Freedom',
  ETHNIC_RECONCILIATION = 'Ethnic Reconciliation',
  TRADE_DIPLOMACY = 'Trade Diplomacy',
  HUMANITARIAN_AFFAIRS = 'Humanitarian Affairs',
  CULTURAL_EXCHANGE = 'Cultural Exchange',
  PEACE_NEGOTIATIONS = 'Peace Negotiations',
  INTERNATIONAL_LAW = 'International Law',
  DEVELOPMENT_COOPERATION = 'Development Cooperation'
}

export interface GeographicFocus {
  region: string;
  countries: string[];
  languages: string[];
  culturalKnowledge: number; // 1-10 scale
  networkStrength: number;
  experienceLevel: number;
  callingConfirmation: string;
}

export interface CulturalAffinity {
  culture: string;
  affinityLevel: number; // 1-10 scale
  experienceType: ExperienceType[];
  languageProficiency: number;
  relationshipDepth: number;
  spiritualConnection: string;
}

export enum ExperienceType {
  LIVED_EXPERIENCE = 'Lived Experience',
  EXTENDED_VISIT = 'Extended Visit',
  STUDY_ABROAD = 'Study Abroad',
  MISSION_WORK = 'Mission Work',
  BUSINESS_ENGAGEMENT = 'Business Engagement',
  ACADEMIC_RESEARCH = 'Academic Research',
  FAMILY_CONNECTION = 'Family Connection'
}

export interface CommunicationStrength {
  skill: string;
  proficiency: number; // 1-10 scale
  contexts: CommunicationContext[];
  culturalAdaptability: number;
  effectivenessRating: number;
  developmentNeeds: string[];
}

export enum CommunicationContext {
  FORMAL_NEGOTIATIONS = 'Formal Negotiations',
  INFORMAL_DIALOGUE = 'Informal Dialogue',
  PUBLIC_SPEAKING = 'Public Speaking',
  WRITTEN_COMMUNICATION = 'Written Communication',
  CROSS_CULTURAL = 'Cross-Cultural',
  CRISIS_COMMUNICATION = 'Crisis Communication',
  MEDIA_RELATIONS = 'Media Relations',
  COMMUNITY_ENGAGEMENT = 'Community Engagement'
}

export interface LeadershipCapability {
  capability: string;
  strength: number; // 1-10 scale
  demonstratedIn: string[];
  culturalContexts: string[];
  spiritualDimension: string;
  developmentPlan: string;
}

export interface SpiritualAuthority {
  recognitionLevel: number; // 1-10 scale
  spheresOfInfluence: SphereOfInfluence[];
  spiritualCovering: string[];
  propheticConfirmations: string[];
  fruitfulness: FruitfulnessIndicator[];
  accountabilityStructure: string[];
}

export enum SphereOfInfluence {
  GOVERNMENT = 'Government',
  EDUCATION = 'Education',
  MEDIA = 'Media',
  ARTS_ENTERTAINMENT = 'Arts & Entertainment',
  BUSINESS = 'Business',
  FAMILY = 'Family',
  RELIGION = 'Religion'
}

export interface FruitfulnessIndicator {
  area: string;
  measurement: string;
  evidence: string[];
  witnesses: string[];
  impact: string;
}

export interface CulturalCompetency {
  id: string;
  culture: string;
  competencyLevel: number; // 1-10 scale
  knowledgeAreas: KnowledgeArea[];
  practicalSkills: PracticalSkill[];
  relationshipNetwork: RelationshipNetwork;
  immersionExperience: ImmersionExperience[];
  assessmentResults: AssessmentResult[];
  developmentPlan: CompetencyDevelopmentPlan;
}

export interface KnowledgeArea {
  area: string;
  proficiency: number;
  sources: string[];
  lastUpdated: Date;
  validatedBy: string;
}

export interface PracticalSkill {
  skill: string;
  proficiency: number;
  demonstratedIn: string[];
  culturalNuances: string[];
  effectiveness: number;
}

export interface RelationshipNetwork {
  keyContacts: KeyContact[];
  networkStrength: number;
  trustLevel: number;
  influenceCapacity: number;
  reciprocityIndex: number;
}

export interface KeyContact {
  name: string;
  role: string;
  organization: string;
  relationshipType: RelationshipType;
  trustLevel: number;
  influenceLevel: number;
  lastContact: Date;
  notes: string;
}

export enum RelationshipType {
  MENTOR = 'Mentor',
  PEER = 'Peer',
  PROTEGE = 'Protégé',
  PARTNER = 'Partner',
  ALLY = 'Ally',
  CONTACT = 'Contact',
  GATEKEEPER = 'Gatekeeper'
}

export interface ImmersionExperience {
  location: string;
  duration: number; // in months
  purpose: string;
  activities: string[];
  learningOutcomes: string[];
  culturalInsights: string[];
  relationshipsDeveloped: number;
  challengesFaced: string[];
  growthAchieved: string[];
}

export interface AssessmentResult {
  assessmentType: string;
  score: number;
  assessor: string;
  date: Date;
  feedback: string;
  recommendations: string[];
}

export interface CompetencyDevelopmentPlan {
  currentLevel: number;
  targetLevel: number;
  timeline: string;
  activities: DevelopmentActivity[];
  resources: DevelopmentResource[];
  mentors: string[];
  milestones: CompetencyMilestone[];
}

export interface DevelopmentActivity {
  activity: string;
  type: ActivityType;
  duration: number;
  startDate: Date;
  endDate: Date;
  status: ActivityStatus;
  outcomes: string[];
}

export enum ActivityType {
  LANGUAGE_STUDY = 'Language Study',
  CULTURAL_IMMERSION = 'Cultural Immersion',
  RELATIONSHIP_BUILDING = 'Relationship Building',
  SKILL_PRACTICE = 'Skill Practice',
  KNOWLEDGE_ACQUISITION = 'Knowledge Acquisition',
  MENTORSHIP = 'Mentorship',
  PROJECT_WORK = 'Project Work'
}

export enum ActivityStatus {
  PLANNED = 'Planned',
  IN_PROGRESS = 'In Progress',
  COMPLETED = 'Completed',
  DEFERRED = 'Deferred',
  CANCELLED = 'Cancelled'
}

export interface DevelopmentResource {
  title: string;
  type: ResourceType;
  provider: string;
  cost: number;
  duration: number;
  effectiveness: number;
  prerequisites: string[];
}

export enum ResourceType {
  COURSE = 'Course',
  BOOK = 'Book',
  MENTOR = 'Mentor',
  EXPERIENCE = 'Experience',
  WORKSHOP = 'Workshop',
  CONFERENCE = 'Conference',
  SIMULATION = 'Simulation'
}

export interface CompetencyMilestone {
  milestone: string;
  targetDate: Date;
  achieved: boolean;
  achievedDate?: Date;
  evidence: string[];
  validation: string;
}

export interface LanguageProficiency {
  id: string;
  language: string;
  proficiencyLevel: LanguageLevel;
  skillBreakdown: LanguageSkillBreakdown;
  certifications: LanguageCertification[];
  practiceOpportunities: PracticeOpportunity[];
  culturalContext: LanguageCulturalContext;
  developmentPlan: LanguageDevelopmentPlan;
}

export enum LanguageLevel {
  BEGINNER = 'Beginner',
  ELEMENTARY = 'Elementary',
  INTERMEDIATE = 'Intermediate',
  UPPER_INTERMEDIATE = 'Upper Intermediate',
  ADVANCED = 'Advanced',
  PROFICIENT = 'Proficient',
  NATIVE = 'Native'
}

export interface LanguageSkillBreakdown {
  speaking: number; // 1-10 scale
  listening: number;
  reading: number;
  writing: number;
  culturalFluency: number;
  professionalUsage: number;
  diplomaticUsage: number;
}

export interface LanguageCertification {
  certification: string;
  level: string;
  score: number;
  date: Date;
  validUntil: Date;
  issuingBody: string;
}

export interface PracticeOpportunity {
  type: string;
  frequency: string;
  context: string;
  effectiveness: number;
  feedback: string;
}

export interface LanguageCulturalContext {
  dialects: string[];
  regionalVariations: string[];
  formalityLevels: FormalityLevel[];
  culturalNuances: CulturalNuance[];
  businessUsage: BusinessUsage;
  diplomaticUsage: DiplomaticUsage;
}

export interface FormalityLevel {
  level: string;
  usage: string;
  proficiency: number;
  contexts: string[];
}

export interface CulturalNuance {
  nuance: string;
  importance: number;
  understanding: number;
  application: string[];
}

export interface BusinessUsage {
  proficiency: number;
  terminology: string[];
  contexts: string[];
  effectiveness: number;
}

export interface DiplomaticUsage {
  proficiency: number;
  terminology: string[];
  protocols: string[];
  effectiveness: number;
}

export interface LanguageDevelopmentPlan {
  currentLevel: LanguageLevel;
  targetLevel: LanguageLevel;
  timeline: string;
  focusAreas: string[];
  methods: LearningMethod[];
  resources: LanguageResource[];
  practiceSchedule: PracticeSchedule;
  assessmentPlan: AssessmentPlan;
}

export interface LearningMethod {
  method: string;
  effectiveness: number;
  timeAllocation: number;
  resources: string[];
}

export interface LanguageResource {
  resource: string;
  type: string;
  cost: number;
  effectiveness: number;
  timeCommitment: number;
}

export interface PracticeSchedule {
  dailyPractice: number; // minutes
  weeklyConversation: number; // sessions
  monthlyImmersion: number; // hours
  quarterlyAssessment: boolean;
}

export interface AssessmentPlan {
  frequency: string;
  methods: string[];
  benchmarks: string[];
  certificationGoals: string[];
}

export interface PeacebuildingProject {
  id: string;
  title: string;
  description: string;
  conflictContext: ConflictContext;
  stakeholders: Stakeholder[];
  interventionStrategy: InterventionStrategy;
  timeline: ProjectTimeline;
  resources: ProjectResource[];
  outcomes: ProjectOutcome[];
  impact: PeacebuildingImpact;
  lessons: LessonLearned[];
  status: ProjectStatus;
}

export interface ConflictContext {
  type: ConflictType;
  parties: ConflictParty[];
  rootCauses: string[];
  currentStatus: string;
  history: ConflictHistory[];
  culturalFactors: string[];
  religiousFactors: string[];
  economicFactors: string[];
  politicalFactors: string[];
}

export enum ConflictType {
  ETHNIC = 'Ethnic',
  RELIGIOUS = 'Religious',
  TERRITORIAL = 'Territorial',
  RESOURCE = 'Resource',
  POLITICAL = 'Political',
  CULTURAL = 'Cultural',
  ECONOMIC = 'Economic',
  IDENTITY = 'Identity'
}

export interface ConflictParty {
  name: string;
  type: PartyType;
  interests: string[];
  positions: string[];
  needs: string[];
  powerLevel: number;
  influenceLevel: number;
  relationshipToOthers: PartyRelationship[];
}

export enum PartyType {
  GOVERNMENT = 'Government',
  REBEL_GROUP = 'Rebel Group',
  ETHNIC_GROUP = 'Ethnic Group',
  RELIGIOUS_GROUP = 'Religious Group',
  CIVIL_SOCIETY = 'Civil Society',
  INTERNATIONAL = 'International',
  BUSINESS = 'Business',
  COMMUNITY = 'Community'
}

export interface PartyRelationship {
  party: string;
  relationshipType: string;
  intensity: number;
  history: string;
  potential: string;
}

export interface ConflictHistory {
  event: string;
  date: Date;
  impact: string;
  parties: string[];
  significance: number;
}

export interface Stakeholder {
  name: string;
  role: StakeholderRole;
  influence: number;
  interest: number;
  position: string;
  engagement: EngagementLevel;
  strategy: EngagementStrategy;
}

export enum StakeholderRole {
  PRIMARY_PARTY = 'Primary Party',
  MEDIATOR = 'Mediator',
  FACILITATOR = 'Facilitator',
  OBSERVER = 'Observer',
  SUPPORTER = 'Supporter',
  SPOILER = 'Spoiler',
  BENEFICIARY = 'Beneficiary'
}

export enum EngagementLevel {
  HIGH = 'High',
  MEDIUM = 'Medium',
  LOW = 'Low',
  RESISTANT = 'Resistant',
  HOSTILE = 'Hostile'
}

export interface EngagementStrategy {
  approach: string;
  methods: string[];
  frequency: string;
  channels: string[];
  objectives: string[];
}

export interface InterventionStrategy {
  approach: InterventionApproach;
  phases: InterventionPhase[];
  methods: InterventionMethod[];
  theory: TheoryOfChange;
  riskMitigation: RiskMitigation[];
  successFactors: string[];
}

export enum InterventionApproach {
  TRACK_ONE = 'Track One Diplomacy',
  TRACK_TWO = 'Track Two Diplomacy',
  TRACK_THREE = 'Track Three Diplomacy',
  MULTI_TRACK = 'Multi-Track Diplomacy',
  TRANSFORMATIVE = 'Transformative Approach',
  RESTORATIVE = 'Restorative Justice',
  PROPHETIC = 'Prophetic Intervention'
}

export interface InterventionPhase {
  phase: string;
  objectives: string[];
  activities: string[];
  duration: number;
  resources: string[];
  indicators: string[];
}

export interface InterventionMethod {
  method: string;
  description: string;
  applicability: string[];
  effectiveness: number;
  resources: string[];
  risks: string[];
}

export interface TheoryOfChange {
  longTermGoal: string;
  assumptions: string[];
  inputs: string[];
  activities: string[];
  outputs: string[];
  outcomes: string[];
  impact: string;
  indicators: ChangeIndicator[];
}

export interface ChangeIndicator {
  indicator: string;
  baseline: number;
  target: number;
  measurement: string;
  frequency: string;
}

export interface RiskMitigation {
  risk: string;
  probability: number;
  impact: number;
  mitigation: string[];
  contingency: string;
  monitoring: string;
}

export interface ProjectTimeline {
  startDate: Date;
  endDate: Date;
  phases: TimelinePhase[];
  milestones: TimelineMilestone[];
  dependencies: Dependency[];
}

export interface TimelinePhase {
  phase: string;
  startDate: Date;
  endDate: Date;
  deliverables: string[];
  resources: string[];
}

export interface TimelineMilestone {
  milestone: string;
  date: Date;
  significance: string;
  dependencies: string[];
  achieved: boolean;
}

export interface Dependency {
  task: string;
  dependsOn: string[];
  type: DependencyType;
  criticality: number;
}

export enum DependencyType {
  FINISH_TO_START = 'Finish to Start',
  START_TO_START = 'Start to Start',
  FINISH_TO_FINISH = 'Finish to Finish',
  START_TO_FINISH = 'Start to Finish'
}

export interface ProjectResource {
  type: string;
  description: string;
  quantity: number;
  cost: number;
  source: string;
  availability: string;
}

export interface ProjectOutcome {
  outcome: string;
  indicator: string;
  target: number;
  achieved: number;
  measurement: string;
  evidence: string[];
}

export interface PeacebuildingImpact {
  directBeneficiaries: number;
  indirectBeneficiaries: number;
  conflictReduction: number; // 1-10 scale
  relationshipImprovement: number;
  capacityBuilding: number;
  systemicChange: number;
  sustainability: number;
  replication: ReplicationPotential;
}

export interface ReplicationPotential {
  scalability: number;
  adaptability: number;
  transferability: number;
  contexts: string[];
  requirements: string[];
}

export interface LessonLearned {
  lesson: string;
  category: string;
  context: string;
  evidence: string;
  implications: string[];
  recommendations: string[];
}

export class ScrollAmbassadorService {
  private apiBaseUrl: string;

  constructor(apiBaseUrl: string = '/api') {
    this.apiBaseUrl = apiBaseUrl;
  }

  // Program enrollment and management
  async enrollInScrollAmbassadorProgram(studentId: string): Promise<ScrollAmbassadorProgram> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/scroll-ambassador/enroll`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ studentId })
      });

      if (!response.ok) {
        throw new Error('Failed to enroll in ScrollAmbassador program');
      }

      return await response.json();
    } catch (error) {
      console.error('Error enrolling in ScrollAmbassador program:', error);
      throw error;
    }
  }

  async getAmbassadorProgram(studentId: string): Promise<ScrollAmbassadorProgram | null> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/scroll-ambassador/program/${studentId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.status === 404) {
        return null;
      }

      if (!response.ok) {
        throw new Error('Failed to get ambassador program');
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting ambassador program:', error);
      throw error;
    }
  }

  // Diplomacy profile development
  async createDiplomacyProfile(studentId: string, profileData: Partial<DiplomacyProfile>): Promise<DiplomacyProfile> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/scroll-ambassador/diplomacy-profile`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ studentId, ...profileData })
      });

      if (!response.ok) {
        throw new Error('Failed to create diplomacy profile');
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating diplomacy profile:', error);
      throw error;
    }
  }

  // Cultural competency development
  async assessCulturalCompetency(studentId: string, culture: string): Promise<CulturalCompetency> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/scroll-ambassador/cultural-competency/assess`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ studentId, culture })
      });

      if (!response.ok) {
        throw new Error('Failed to assess cultural competency');
      }

      return await response.json();
    } catch (error) {
      console.error('Error assessing cultural competency:', error);
      throw error;
    }
  }

  async developCulturalCompetency(studentId: string, competencyId: string, developmentPlan: CompetencyDevelopmentPlan): Promise<CulturalCompetency> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/scroll-ambassador/cultural-competency/${competencyId}/develop`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ studentId, developmentPlan })
      });

      if (!response.ok) {
        throw new Error('Failed to develop cultural competency');
      }

      return await response.json();
    } catch (error) {
      console.error('Error developing cultural competency:', error);
      throw error;
    }
  }

  // Language proficiency management
  async assessLanguageProficiency(studentId: string, language: string): Promise<LanguageProficiency> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/scroll-ambassador/language-proficiency/assess`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ studentId, language })
      });

      if (!response.ok) {
        throw new Error('Failed to assess language proficiency');
      }

      return await response.json();
    } catch (error) {
      console.error('Error assessing language proficiency:', error);
      throw error;
    }
  }

  async createLanguageDevelopmentPlan(studentId: string, language: string, targetLevel: LanguageLevel): Promise<LanguageDevelopmentPlan> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/scroll-ambassador/language-proficiency/development-plan`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ studentId, language, targetLevel })
      });

      if (!response.ok) {
        throw new Error('Failed to create language development plan');
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating language development plan:', error);
      throw error;
    }
  }

  // Peacebuilding project management
  async createPeacebuildingProject(studentId: string, projectData: Partial<PeacebuildingProject>): Promise<PeacebuildingProject> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/scroll-ambassador/peacebuilding-project`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ studentId, ...projectData })
      });

      if (!response.ok) {
        throw new Error('Failed to create peacebuilding project');
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating peacebuilding project:', error);
      throw error;
    }
  }

  async updateProjectStatus(projectId: string, status: ProjectStatus): Promise<PeacebuildingProject> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/scroll-ambassador/peacebuilding-project/${projectId}/status`, {
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

  // Conflict analysis and intervention
  async analyzeConflict(conflictData: Partial<ConflictContext>): Promise<{
    analysis: string;
    recommendations: string[];
    interventionOptions: InterventionStrategy[];
    riskAssessment: RiskMitigation[];
  }> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/scroll-ambassador/conflict-analysis`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(conflictData)
      });

      if (!response.ok) {
        throw new Error('Failed to analyze conflict');
      }

      return await response.json();
    } catch (error) {
      console.error('Error analyzing conflict:', error);
      throw error;
    }
  }

  // Diplomatic mission management
  async planDiplomaticMission(studentId: string, missionData: any): Promise<DiplomaticMission> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/scroll-ambassador/diplomatic-mission`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ studentId, ...missionData })
      });

      if (!response.ok) {
        throw new Error('Failed to plan diplomatic mission');
      }

      return await response.json();
    } catch (error) {
      console.error('Error planning diplomatic mission:', error);
      throw error;
    }
  }

  // International network building
  async buildInternationalNetwork(studentId: string, networkingGoals: string[]): Promise<InternationalNetwork> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/scroll-ambassador/international-network`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ studentId, networkingGoals })
      });

      if (!response.ok) {
        throw new Error('Failed to build international network');
      }

      return await response.json();
    } catch (error) {
      console.error('Error building international network:', error);
      throw error;
    }
  }

  // Training modules
  async getTrainingModules(phase: AmbassadorProgramPhase): Promise<TrainingModule[]> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/scroll-ambassador/training-modules/${phase}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to get training modules');
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting training modules:', error);
      throw error;
    }
  }

  async completeTrainingModule(studentId: string, moduleId: string): Promise<void> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/scroll-ambassador/training-modules/${moduleId}/complete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ studentId })
      });

      if (!response.ok) {
        throw new Error('Failed to complete training module');
      }
    } catch (error) {
      console.error('Error completing training module:', error);
      throw error;
    }
  }
}

// Additional supporting interfaces
export interface DiplomaticMission {
  id: string;
  title: string;
  objective: string;
  location: string;
  duration: number;
  stakeholders: string[];
  outcomes: string[];
  status: string;
}

export interface InternationalNetwork {
  id: string;
  studentId: string;
  contacts: KeyContact[];
  organizations: string[];
  influence: number;
  reach: string[];
}

export interface TrainingModule {
  id: string;
  title: string;
  description: string;
  phase: AmbassadorProgramPhase;
  duration: number;
  objectives: string[];
  content: ModuleContent[];
  assessment: ModuleAssessment;
}

export interface ModuleContent {
  type: string;
  title: string;
  content: string;
  resources: string[];
}

export interface ModuleAssessment {
  type: string;
  criteria: string[];
  passingScore: number;
  attempts: number;
}

export default ScrollAmbassadorService;