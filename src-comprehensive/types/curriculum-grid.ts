/**
 * ScrollCurriculum Grid Type Definitions
 * Comprehensive type system for 10,000+ course catalog across 12 Supreme Scroll Faculties
 */

// Core Enums
export enum SupremeScrollFaculty {
  SCROLL_AI_INTELLIGENCE = 'ScrollAI, Intelligence & Robotics',
  SCROLL_ECONOMY_FINANCE = 'ScrollEconomy & Financial Reformation',
  PROPHETIC_LAW_GOVERNANCE = 'Prophetic Law & Global Governance',
  SCROLL_THEOLOGY_BIBLE = 'ScrollTheology & Bible Intelligence',
  EDENIC_SCIENCE_BIOTECH = 'Edenic Science & ScrollBiotech',
  GEOPROPHETIC_INTELLIGENCE = 'GeoProphetic Intelligence & Earth Mapping',
  SACRED_LABOR_ENTREPRENEURSHIP = 'Sacred Labor & Kingdom Entrepreneurship',
  GLOBAL_MISSIONS_EVANGELISM = 'Global Missions & Scroll Evangelism',
  DIVINE_PSYCHOLOGY_RESTORATION = 'Divine Psychology & Soul Restoration',
  SCROLL_ARTS_STORYTELLING = 'ScrollArts, Music & XR Storytelling',
  SCROLL_MEDICINE_HEALING = 'ScrollMedicine & Prophetic Healing',
  EDUCATION_CURRICULUM = 'Education, Language & ScrollCurriculum'
}

export enum CourseLevel {
  CERTIFICATE = 'certificate',
  UNDERGRADUATE = 'undergraduate',
  GRADUATE = 'graduate',
  DOCTORAL = 'doctoral',
  XR_SPECIALIZATION = 'xr_specialization',
  RESEARCH_TRACK = 'research_track'
}

export enum DeliveryMode {
  SCROLLU_APP = 'scrollu_app',
  ONLINE_PORTAL = 'online_portal',
  XR_MODE = 'xr_mode',
  RESEARCH_TRACK = 'research_track',
  AI_TUTOR = 'ai_tutor',
  MENTOR_SESSIONS = 'mentor_sessions'
}

export enum CourseStatus {
  DRAFT = 'draft',
  UNDER_REVIEW = 'under_review',
  PUBLISHED = 'published',
  ARCHIVED = 'archived'
}

export enum PropheticUrgency {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

export enum UrgencyLevel {
  ROUTINE = 'routine',
  URGENT = 'urgent',
  CRITICAL = 'critical',
  PROPHETIC_MANDATE = 'prophetic_mandate'
}

// Core Interfaces
export interface ScrollCourse {
  id: string;
  courseCode: string;
  title: string;
  description: string;
  level: CourseLevel;
  faculty: SupremeScrollFaculty;
  department?: string;
  
  // Learning Configuration
  learningObjectives: LearningObjective[];
  spiritualObjectives: SpiritualObjective[];
  prerequisites: string[];
  estimatedHours: number;
  xpReward: number;
  scrollCoinCost: number;
  
  // Delivery Configuration
  deliveryModes: DeliveryMode[];
  assessmentMethods: AssessmentMethod[];
  
  // Spiritual Alignment
  scrollCertification: ScrollCertification;
  propheticAlignment: PropheticAlignment;
  kingdomImpact: KingdomImpact;
  
  // Content Management
  contentFramework: ContentFramework;
  resourceRequirements: ResourceRequirement[];
  
  // Metadata
  status: CourseStatus;
  tags: string[];
  language: string;
  culturalContext: CulturalContext[];
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
  publishedAt?: Date;
  createdBy: string;
  lastModifiedBy: string;
}

export interface LearningObjective {
  id: string;
  description: string;
  bloomsLevel: BloomsLevel;
  assessmentCriteria: string[];
  kingdomApplication: string;
}

export interface SpiritualObjective {
  id: string;
  description: string;
  spiritualDiscipline: SpiritualDiscipline;
  characterDevelopment: string[];
  propheticActivation: string;
}

export interface AssessmentMethod {
  type: AssessmentType;
  weight: number;
  description: string;
  rubric: AssessmentRubric;
  spiritualComponent: boolean;
}

export interface ScrollCertification {
  isScrollCertified: boolean;
  certificationLevel: CertificationLevel;
  propheticValidation: PropheticValidation;
  kingdomReadiness: KingdomReadiness;
}

export interface PropheticAlignment {
  alignmentScore: number; // 0-100
  propheticThemes: string[];
  biblicalFoundation: BiblicalFoundation[];
  divineGuidanceLevel: DivineGuidanceLevel;
}

export interface KingdomImpact {
  impactScore: number; // 0-100
  transformationAreas: TransformationArea[];
  nationBuildingPotential: number;
  healingCapacity: number;
  governanceContribution: number;
}

export interface ContentFramework {
  modules: CourseModule[];
  practicalComponents: PracticalComponent[];
  xrExperiences: XRExperience[];
  researchIntegration: ResearchIntegration;
}

export interface CourseModule {
  id: string;
  title: string;
  description: string;
  orderIndex: number;
  estimatedHours: number;
  learningObjectives: string[];
  content: ModuleContent;
  assessments: ModuleAssessment[];
}

export interface ModuleContent {
  lectures: Lecture[];
  readings: Reading[];
  videos: Video[];
  interactiveElements: InteractiveElement[];
  xrComponents: XRComponent[];
}

// Faculty Management
export interface FacultyConfiguration {
  faculty: SupremeScrollFaculty;
  description: string;
  targetCourseCount: number;
  currentCourseCount: number;
  departments: FacultyDepartment[];
  specializations: FacultySpecialization[];
  facultyMembers: FacultyMember[];
  researchIntegration: ResearchIntegration;
  globalAdaptation: GlobalAdaptation;
  spiritualOversight: SpiritualOversight;
}

export interface FacultyDepartment {
  id: string;
  name: string;
  focus: string;
  courses: ScrollCourse[];
  head: FacultyMember;
  researchAreas: string[];
}

export interface FacultySpecialization {
  id: string;
  name: string;
  description: string;
  requiredCourses: string[];
  electiveCourses: string[];
  practicalRequirements: PracticalRequirement[];
}

export interface FacultyMember {
  id: string;
  name: string;
  title: string;
  specialization: string[];
  courses: string[];
  researchAreas: string[];
  spiritualGifts: string[];
  propheticInsight: boolean;
}

// Course Generation System
export interface CourseGenerationRequest {
  topic: string;
  faculty: SupremeScrollFaculty;
  level: CourseLevel;
  propheticGuidance: PropheticGuidance;
  targetAudience: TargetAudience;
  learningOutcomes: DesiredOutcome[];
  deliveryPreferences: DeliveryMode[];
  culturalContext: CulturalContext;
  urgencyLevel: UrgencyLevel;
}

export interface GeneratedCourse {
  courseOutline: CourseOutline;
  learningObjectives: LearningObjective[];
  spiritualObjectives: SpiritualObjective[];
  contentFramework: ContentFramework;
  assessmentStrategy: AssessmentStrategy;
  deliveryPlan: DeliveryPlan;
  resourceRequirements: ResourceRequirement[];
  propheticValidation: PropheticValidation;
  qualityMetrics: QualityMetrics;
}

export interface PropheticInsight {
  source: PropheticSource;
  insight: string;
  biblicalBasis: BiblicalFoundation[];
  urgency: PropheticUrgency;
  globalRelevance: GlobalRelevance;
  educationalImplication: EducationalImplication[];
  courseTopics: string[];
  targetFaculties: SupremeScrollFaculty[];
}

export interface PropheticGuidance {
  hasGuidance: boolean;
  source: PropheticSource;
  guidance: string;
  biblicalReferences: string[];
  urgencyLevel: PropheticUrgency;
  globalImpact: string;
}

// Search and Discovery
export interface CourseSearchCriteria {
  query?: string;
  faculty?: SupremeScrollFaculty[];
  level?: CourseLevel[];
  deliveryMode?: DeliveryMode[];
  language?: string[];
  culturalContext?: CulturalContext[];
  propheticThemes?: string[];
  kingdomImpact?: number; // minimum score
  prerequisites?: boolean; // filter by prerequisite completion
  tags?: string[];
  status?: CourseStatus[];
  dateRange?: DateRange;
}

export interface CourseSearchResult {
  courses: ScrollCourse[];
  totalCount: number;
  facets: SearchFacets;
  recommendations: CourseRecommendation[];
  propheticInsights: PropheticInsight[];
}

export interface SearchFacets {
  faculties: FacetCount[];
  levels: FacetCount[];
  deliveryModes: FacetCount[];
  languages: FacetCount[];
  propheticThemes: FacetCount[];
  tags: FacetCount[];
}

export interface FacetCount {
  value: string;
  count: number;
}

// AI-Powered Recommendations
export interface StudentProfile {
  id: string;
  callingAssessment: CallingAssessment;
  learningHistory: LearningHistory;
  spiritualGifts: string[];
  careerGoals: string[];
  preferredDeliveryModes: DeliveryMode[];
  culturalBackground: CulturalContext;
  languagePreferences: string[];
  currentLevel: AcademicLevel;
  completedCourses: string[];
  inProgressCourses: string[];
  skillGaps: SkillGap[];
}

export interface CourseRecommendation {
  course: ScrollCourse;
  relevanceScore: number; // 0-100
  reasoningFactors: ReasoningFactor[];
  propheticAlignment: number; // 0-100
  callingAlignment: number; // 0-100
  prerequisiteStatus: PrerequisiteStatus;
  estimatedCompletionTime: number; // in weeks
  kingdomImpactPotential: number; // 0-100
}

export interface ReasoningFactor {
  factor: RecommendationFactor;
  weight: number;
  explanation: string;
}

export interface CallingAssessment {
  primaryCalling: string;
  secondaryCallings: string[];
  spiritualGifts: string[];
  ministryAreas: string[];
  kingdomVision: string;
  propheticWords: PropheticWord[];
}

export interface LearningHistory {
  completedCourses: CourseCompletion[];
  averageGrade: number;
  preferredLearningStyle: LearningStyle;
  engagementPatterns: EngagementPattern[];
  strugglingAreas: string[];
  excellenceAreas: string[];
}

// Quality Assurance
export interface QualityMetrics {
  scrollAuthentication: ScrollAuthentication;
  spiritualAlignment: number; // 0-100
  academicRigor: number; // 0-100
  practicalApplication: number; // 0-100
  kingdomRelevance: number; // 0-100
  propheticAccuracy: number; // 0-100
  studentOutcomes: StudentOutcomes;
}

export interface ScrollAuthentication {
  isAuthenticated: boolean;
  authenticatedBy: string;
  authenticationDate: Date;
  propheticValidation: PropheticValidation;
  kingdomPowerLevel: number; // 0-100
  divineApproval: boolean;
}

export interface PropheticValidation {
  isValidated: boolean;
  validatedBy: string[];
  validationDate: Date;
  propheticAccuracy: number; // 0-100
  biblicalAlignment: number; // 0-100
  divineConfirmation: boolean;
}

// Supporting Types
export enum BloomsLevel {
  REMEMBER = 'remember',
  UNDERSTAND = 'understand',
  APPLY = 'apply',
  ANALYZE = 'analyze',
  EVALUATE = 'evaluate',
  CREATE = 'create'
}

export enum SpiritualDiscipline {
  PRAYER = 'prayer',
  FASTING = 'fasting',
  WORSHIP = 'worship',
  SCRIPTURE_STUDY = 'scripture_study',
  INTERCESSION = 'intercession',
  PROPHETIC_ACTIVATION = 'prophetic_activation',
  SPIRITUAL_WARFARE = 'spiritual_warfare',
  KINGDOM_SERVICE = 'kingdom_service'
}

export enum AssessmentType {
  QUIZ = 'quiz',
  ESSAY = 'essay',
  PROJECT = 'project',
  PRACTICAL_APPLICATION = 'practical_application',
  SCROLL_DEFENSE = 'scroll_defense',
  PROPHETIC_ACTIVATION = 'prophetic_activation',
  KINGDOM_IMPACT = 'kingdom_impact',
  PEER_EVALUATION = 'peer_evaluation'
}

export enum CertificationLevel {
  BASIC = 'basic',
  INTERMEDIATE = 'intermediate',
  ADVANCED = 'advanced',
  EXPERT = 'expert',
  MASTER = 'master',
  PROPHETIC = 'prophetic'
}

export enum DivineGuidanceLevel {
  NATURAL = 'natural',
  INSPIRED = 'inspired',
  PROPHETIC = 'prophetic',
  REVELATORY = 'revelatory'
}

export enum TransformationArea {
  PERSONAL = 'personal',
  FAMILY = 'family',
  COMMUNITY = 'community',
  NATIONAL = 'national',
  GLOBAL = 'global',
  SPIRITUAL = 'spiritual'
}

export enum PropheticSource {
  SCRIPTURE = 'scripture',
  PROPHETIC_WORD = 'prophetic_word',
  DIVINE_REVELATION = 'divine_revelation',
  SPIRITUAL_DISCERNMENT = 'spiritual_discernment',
  ANGELIC_VISITATION = 'angelic_visitation'
}

export enum CulturalContext {
  WESTERN = 'western',
  AFRICAN = 'african',
  ASIAN = 'asian',
  MIDDLE_EASTERN = 'middle_eastern',
  LATIN_AMERICAN = 'latin_american',
  INDIGENOUS = 'indigenous',
  URBAN = 'urban',
  RURAL = 'rural'
}

export enum RecommendationFactor {
  CALLING_ALIGNMENT = 'calling_alignment',
  SKILL_GAP = 'skill_gap',
  LEARNING_HISTORY = 'learning_history',
  PROPHETIC_GUIDANCE = 'prophetic_guidance',
  KINGDOM_IMPACT = 'kingdom_impact',
  PREREQUISITE_READINESS = 'prerequisite_readiness',
  CULTURAL_RELEVANCE = 'cultural_relevance'
}

export enum LearningStyle {
  VISUAL = 'visual',
  AUDITORY = 'auditory',
  KINESTHETIC = 'kinesthetic',
  READING_WRITING = 'reading_writing',
  PROPHETIC = 'prophetic',
  EXPERIENTIAL = 'experiential'
}

export enum AcademicLevel {
  SCROLL_OPEN = 'scroll_open',
  SCROLL_STARTER = 'scroll_starter',
  SCROLL_DEGREE = 'scroll_degree',
  SCROLL_DOCTORATE = 'scroll_doctorate',
  SCROLL_SCHOLARSHIP = 'scroll_scholarship'
}

// Additional Supporting Interfaces
export interface BiblicalFoundation {
  reference: string;
  text: string;
  application: string;
  propheticSignificance: string;
}

export interface ResourceRequirement {
  type: ResourceType;
  description: string;
  isRequired: boolean;
  cost?: number;
  provider?: string;
}

export interface DateRange {
  startDate: Date;
  endDate: Date;
}

export interface SkillGap {
  skill: string;
  currentLevel: number; // 0-100
  targetLevel: number; // 0-100
  priority: Priority;
}

export interface PropheticWord {
  source: string;
  word: string;
  date: Date;
  relevance: string;
}

export interface CourseCompletion {
  courseId: string;
  completionDate: Date;
  grade: number;
  feedback: string;
  kingdomImpact: number;
}

export interface EngagementPattern {
  pattern: string;
  frequency: number;
  effectiveness: number;
}

export interface StudentOutcomes {
  completionRate: number;
  averageGrade: number;
  kingdomImpactScore: number;
  spiritualGrowthMeasure: number;
  careerAdvancement: number;
}

export enum ResourceType {
  TEXTBOOK = 'textbook',
  SOFTWARE = 'software',
  HARDWARE = 'hardware',
  SUBSCRIPTION = 'subscription',
  MATERIALS = 'materials',
  FIELD_TRIP = 'field_trip'
}

export enum Priority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

// Additional interfaces for completeness
export interface AssessmentRubric {
  criteria: RubricCriterion[];
  totalPoints: number;
  passingScore: number;
}

export interface RubricCriterion {
  name: string;
  description: string;
  points: number;
  levels: RubricLevel[];
}

export interface RubricLevel {
  name: string;
  description: string;
  points: number;
}

export interface KingdomReadiness {
  readinessScore: number; // 0-100
  readinessAreas: ReadinessArea[];
  developmentNeeds: string[];
}

export interface ReadinessArea {
  area: string;
  score: number; // 0-100
  description: string;
}

export interface CourseOutline {
  overview: string;
  modules: ModuleOutline[];
  assessmentPlan: AssessmentPlan;
  resourceList: ResourceRequirement[];
}

export interface ModuleOutline {
  title: string;
  description: string;
  learningObjectives: string[];
  estimatedHours: number;
  deliveryMethod: DeliveryMode;
}

export interface AssessmentPlan {
  formativeAssessments: AssessmentMethod[];
  summativeAssessments: AssessmentMethod[];
  finalProject?: ProjectRequirement;
}

export interface ProjectRequirement {
  title: string;
  description: string;
  deliverables: string[];
  rubric: AssessmentRubric;
  kingdomImpactExpectation: string;
}

export interface AssessmentStrategy {
  overallApproach: string;
  assessmentMethods: AssessmentMethod[];
  gradingScheme: GradingScheme;
  feedbackStrategy: FeedbackStrategy;
}

export interface GradingScheme {
  scale: GradingScale;
  weights: GradeWeight[];
  passingGrade: number;
}

export interface GradingScale {
  type: 'percentage' | 'points' | 'letter';
  ranges: GradeRange[];
}

export interface GradeRange {
  min: number;
  max: number;
  grade: string;
  description: string;
}

export interface GradeWeight {
  component: string;
  weight: number; // percentage
}

export interface FeedbackStrategy {
  frequency: FeedbackFrequency;
  methods: FeedbackMethod[];
  spiritualGuidance: boolean;
}

export enum FeedbackFrequency {
  IMMEDIATE = 'immediate',
  WEEKLY = 'weekly',
  MODULE_END = 'module_end',
  MILESTONE = 'milestone'
}

export enum FeedbackMethod {
  WRITTEN = 'written',
  AUDIO = 'audio',
  VIDEO = 'video',
  PROPHETIC = 'prophetic',
  PEER = 'peer'
}

export interface DeliveryPlan {
  primaryMode: DeliveryMode;
  supportingModes: DeliveryMode[];
  schedule: DeliverySchedule;
  requirements: TechnicalRequirement[];
}

export interface DeliverySchedule {
  duration: number; // in weeks
  sessionsPerWeek: number;
  sessionDuration: number; // in minutes
  flexibility: ScheduleFlexibility;
}

export enum ScheduleFlexibility {
  FIXED = 'fixed',
  FLEXIBLE = 'flexible',
  SELF_PACED = 'self_paced',
  COHORT_BASED = 'cohort_based'
}

export interface TechnicalRequirement {
  requirement: string;
  isRequired: boolean;
  alternatives: string[];
}

export interface TargetAudience {
  primaryAudience: string;
  secondaryAudiences: string[];
  prerequisites: string[];
  recommendedBackground: string[];
}

export interface DesiredOutcome {
  outcome: string;
  measurementCriteria: string[];
  kingdomImpact: string;
}

export interface GlobalRelevance {
  regions: string[];
  culturalAdaptations: CulturalAdaptation[];
  languageRequirements: string[];
}

export interface CulturalAdaptation {
  culture: CulturalContext;
  adaptations: string[];
  considerations: string[];
}

export interface EducationalImplication {
  implication: string;
  actionRequired: string;
  priority: Priority;
}

export interface ResearchIntegration {
  hasResearchComponent: boolean;
  researchAreas: string[];
  publicationOpportunities: string[];
  collaborationPotential: string[];
}

export interface GlobalAdaptation {
  supportedLanguages: string[];
  culturalAdaptations: CulturalAdaptation[];
  regionalVariations: RegionalVariation[];
}

export interface RegionalVariation {
  region: string;
  adaptations: string[];
  localPartners: string[];
}

export interface SpiritualOversight {
  oversightLevel: OversightLevel;
  spiritualMentors: string[];
  propheticInput: boolean;
  prayerCoverage: boolean;
}

export enum OversightLevel {
  BASIC = 'basic',
  ENHANCED = 'enhanced',
  INTENSIVE = 'intensive',
  PROPHETIC = 'prophetic'
}

export interface PracticalRequirement {
  requirement: string;
  description: string;
  assessmentCriteria: string[];
  kingdomApplication: string;
}

export interface PracticalComponent {
  type: PracticalType;
  description: string;
  duration: number;
  requirements: string[];
  outcomes: string[];
}

export enum PracticalType {
  LAB_WORK = 'lab_work',
  FIELD_EXPERIENCE = 'field_experience',
  INTERNSHIP = 'internship',
  MISSION_TRIP = 'mission_trip',
  RESEARCH_PROJECT = 'research_project',
  KINGDOM_SERVICE = 'kingdom_service'
}

export interface XRExperience {
  id: string;
  title: string;
  description: string;
  type: XRType;
  duration: number;
  requirements: TechnicalRequirement[];
  learningObjectives: string[];
}

export enum XRType {
  VIRTUAL_REALITY = 'virtual_reality',
  AUGMENTED_REALITY = 'augmented_reality',
  MIXED_REALITY = 'mixed_reality',
  IMMERSIVE_SIMULATION = 'immersive_simulation'
}

export interface Lecture {
  id: string;
  title: string;
  description: string;
  duration: number;
  videoUrl?: string;
  audioUrl?: string;
  transcript: string;
  slides?: string[];
  notes?: string;
}

export interface Reading {
  id: string;
  title: string;
  author: string;
  type: ReadingType;
  url?: string;
  pages?: string;
  estimatedTime: number;
}

export enum ReadingType {
  TEXTBOOK = 'textbook',
  ARTICLE = 'article',
  RESEARCH_PAPER = 'research_paper',
  SCRIPTURE = 'scripture',
  PROPHETIC_WRITING = 'prophetic_writing'
}

export interface Video {
  id: string;
  title: string;
  description: string;
  url: string;
  duration: number;
  transcript?: string;
  captions?: string[];
}

export interface InteractiveElement {
  id: string;
  type: InteractiveType;
  title: string;
  description: string;
  configuration: any;
}

export enum InteractiveType {
  QUIZ = 'quiz',
  SIMULATION = 'simulation',
  GAME = 'game',
  DISCUSSION = 'discussion',
  POLL = 'poll',
  REFLECTION = 'reflection'
}

export interface XRComponent {
  id: string;
  type: XRType;
  title: string;
  description: string;
  assetUrl: string;
  configuration: any;
}

export interface ModuleAssessment {
  id: string;
  type: AssessmentType;
  title: string;
  description: string;
  points: number;
  dueDate?: Date;
  rubric: AssessmentRubric;
}

export interface PrerequisiteStatus {
  allMet: boolean;
  missingPrerequisites: string[];
  recommendedPreparation: string[];
}