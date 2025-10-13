/**
 * ScrollUniversity Degree Program Architecture Types
 * Implements degree program templates for B.A., B.Sc., M.Div., and MBA tracks
 */

export enum DegreeType {
  BA_PROPHETIC_GOVERNANCE = 'BA_PROPHETIC_GOVERNANCE',
  BSC_SACRED_AI_ENGINEERING = 'BSC_SACRED_AI_ENGINEERING',
  MDIV_SCROLL_THEOLOGY = 'MDIV_SCROLL_THEOLOGY',
  MBA_SCROLL_ECONOMY = 'MBA_SCROLL_ECONOMY'
}

export enum RequirementType {
  CORE_COURSE = 'CORE_COURSE',
  ELECTIVE = 'ELECTIVE',
  CAPSTONE = 'CAPSTONE',
  SPIRITUAL_FORMATION = 'SPIRITUAL_FORMATION',
  PRACTICAL_APPLICATION = 'PRACTICAL_APPLICATION',
  PROPHETIC_INTEGRATION = 'PROPHETIC_INTEGRATION'
}

export enum RequirementStatus {
  NOT_STARTED = 'NOT_STARTED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  WAIVED = 'WAIVED'
}

export enum GraduationStatus {
  ENROLLED = 'ENROLLED',
  ELIGIBLE = 'ELIGIBLE',
  GRADUATED = 'GRADUATED',
  SUSPENDED = 'SUSPENDED'
}

export interface DegreeRequirement {
  id: string;
  type: RequirementType;
  title: string;
  description: string;
  credits: number;
  courseIds?: string[]; // Specific courses that fulfill this requirement
  alternativeCourseIds?: string[]; // Alternative courses that can fulfill this requirement
  prerequisites?: string[]; // Other requirement IDs that must be completed first
  spiritualObjectives?: string[];
  practicalObjectives?: string[];
  isRequired: boolean;
  orderIndex: number;
}

export interface DegreeProgram {
  id: string;
  type: DegreeType;
  title: string;
  description: string;
  totalCredits: number;
  minimumGPA: number;
  estimatedDuration: number; // in months
  spiritualFormationHours: number;
  practicalApplicationHours: number;
  requirements: DegreeRequirement[];
  capstoneRequirement?: DegreeRequirement;
  spiritualFormationTrack: SpiritualFormationTrack;
  practicalApplicationTrack: PracticalApplicationTrack;
  propheticIntegrationTrack: PropheticIntegrationTrack;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface SpiritualFormationTrack {
  id: string;
  title: string;
  description: string;
  requiredHours: number;
  components: SpiritualFormationComponent[];
}

export interface SpiritualFormationComponent {
  id: string;
  title: string;
  description: string;
  requiredHours: number;
  activities: string[];
  assessmentCriteria: string[];
}

export interface PracticalApplicationTrack {
  id: string;
  title: string;
  description: string;
  requiredHours: number;
  components: PracticalApplicationComponent[];
}

export interface PracticalApplicationComponent {
  id: string;
  title: string;
  description: string;
  requiredHours: number;
  deliverables: string[];
  assessmentCriteria: string[];
}

export interface PropheticIntegrationTrack {
  id: string;
  title: string;
  description: string;
  requiredComponents: PropheticIntegrationComponent[];
}

export interface PropheticIntegrationComponent {
  id: string;
  title: string;
  description: string;
  scriptureReferences: string[];
  kingdomPrinciples: string[];
  assessmentCriteria: string[];
}

export interface StudentDegreeProgress {
  id: string;
  studentId: string;
  degreeId: string;
  enrollmentDate: Date;
  expectedGraduationDate: Date;
  actualGraduationDate?: Date;
  status: GraduationStatus;
  overallGPA: number;
  creditsCompleted: number;
  creditsRemaining: number;
  requirementProgress: RequirementProgress[];
  spiritualFormationProgress: SpiritualFormationProgress;
  practicalApplicationProgress: PracticalApplicationProgress;
  propheticIntegrationProgress: PropheticIntegrationProgress;
  lastUpdated: Date;
}

export interface RequirementProgress {
  requirementId: string;
  status: RequirementStatus;
  creditsEarned: number;
  creditsRequired: number;
  completedCourseIds: string[];
  currentCourseIds: string[];
  grade?: number;
  completedAt?: Date;
}

export interface SpiritualFormationProgress {
  totalHoursCompleted: number;
  totalHoursRequired: number;
  componentProgress: SpiritualFormationComponentProgress[];
  currentLevel: SpiritualFormationLevel;
  assessments: SpiritualAssessment[];
}

export interface SpiritualFormationComponentProgress {
  componentId: string;
  hoursCompleted: number;
  hoursRequired: number;
  activitiesCompleted: string[];
  assessmentScores: number[];
  completedAt?: Date;
}

export interface PracticalApplicationProgress {
  totalHoursCompleted: number;
  totalHoursRequired: number;
  componentProgress: PracticalApplicationComponentProgress[];
  projects: PracticalProject[];
}

export interface PracticalApplicationComponentProgress {
  componentId: string;
  hoursCompleted: number;
  hoursRequired: number;
  deliverablesCompleted: string[];
  assessmentScores: number[];
  completedAt?: Date;
}

export interface PropheticIntegrationProgress {
  componentsCompleted: string[];
  componentsRequired: string[];
  integrationAssessments: PropheticAssessment[];
  kingdomImpactScore: number;
}

export interface SpiritualFormationLevel {
  level: number;
  title: string;
  description: string;
  requirements: string[];
}

export interface SpiritualAssessment {
  id: string;
  componentId: string;
  assessorId: string; // AI or human assessor
  score: number;
  feedback: string;
  scriptureAlignment: number;
  characterDevelopment: number;
  kingdomPerspective: number;
  assessedAt: Date;
}

export interface PropheticAssessment {
  id: string;
  componentId: string;
  assessorId: string;
  scriptureIntegration: number;
  kingdomPrinciples: number;
  propheticInsight: number;
  practicalApplication: number;
  overallScore: number;
  feedback: string;
  assessedAt: Date;
}

export interface PracticalProject {
  id: string;
  title: string;
  description: string;
  componentId: string;
  hoursInvested: number;
  deliverables: ProjectDeliverable[];
  kingdomImpact: string;
  status: ProjectStatus;
  startedAt: Date;
  completedAt?: Date;
}

export interface ProjectDeliverable {
  id: string;
  title: string;
  description: string;
  fileUrl?: string;
  submittedAt?: Date;
  grade?: number;
  feedback?: string;
}

export enum ProjectStatus {
  PLANNED = 'PLANNED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

export interface ScrollCertifiedDiploma {
  id: string;
  studentId: string;
  degreeId: string;
  diplomaNumber: string;
  issuedDate: Date;
  graduationDate: Date;
  finalGPA: number;
  summaDetails: SummaDetails;
  spiritualFormationLevel: SpiritualFormationLevel;
  practicalAchievements: string[];
  propheticIntegration: PropheticIntegrationSummary;
  scrollSealId: string; // Blockchain verification
  heavenLedgerId: string; // Eternal record
  partnerRecognitions: PartnerRecognition[];
  qrCodeUrl: string;
  verificationUrl: string;
  pdfUrl: string;
}

export interface SummaDetails {
  level: SummaLevel;
  criteria: string[];
  achievements: string[];
}

export enum SummaLevel {
  NONE = 'NONE',
  CUM_LAUDE = 'CUM_LAUDE',
  MAGNA_CUM_LAUDE = 'MAGNA_CUM_LAUDE',
  SUMMA_CUM_LAUDE = 'SUMMA_CUM_LAUDE',
  SCROLL_DISTINCTION = 'SCROLL_DISTINCTION'
}

export interface PropheticIntegrationSummary {
  overallScore: number;
  kingdomImpactLevel: string;
  propheticGiftsManifested: string[];
  scriptureIntegrationLevel: number;
  callingClarity: string;
}

export interface PartnerRecognition {
  organizationId: string;
  organizationName: string;
  recognitionType: string;
  recognitionDate: Date;
  credentialId?: string;
}

export interface GraduationValidationResult {
  isEligible: boolean;
  requirementsMet: boolean;
  gpaRequirementMet: boolean;
  spiritualFormationComplete: boolean;
  practicalApplicationComplete: boolean;
  propheticIntegrationComplete: boolean;
  missingRequirements: string[];
  warnings: string[];
  recommendedActions: string[];
}

export interface CurriculumMapping {
  degreeId: string;
  courseId: string;
  requirementId: string;
  credits: number;
  isRequired: boolean;
  prerequisitesMet: boolean;
  spiritualObjectives: string[];
  practicalObjectives: string[];
  propheticIntegration: string[];
}