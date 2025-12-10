/**
 * Learning Outcome Management System Types
 * "Let every course contribute to the complete formation of the student"
 */

// ============================================================================
// Learning Outcome Types
// ============================================================================

export enum OutcomeLevel {
  PROGRAM = 'PROGRAM',           // Program-level learning outcome
  COURSE = 'COURSE',             // Course-level learning outcome
  MODULE = 'MODULE'              // Module-level learning outcome
}

export enum BloomLevel {
  REMEMBER = 'REMEMBER',         // Knowledge recall
  UNDERSTAND = 'UNDERSTAND',     // Comprehension
  APPLY = 'APPLY',               // Application
  ANALYZE = 'ANALYZE',           // Analysis
  EVALUATE = 'EVALUATE',         // Evaluation
  CREATE = 'CREATE'              // Synthesis/Creation
}

export enum OutcomeStatus {
  ACTIVE = 'ACTIVE',
  DEPRECATED = 'DEPRECATED',
  DRAFT = 'DRAFT'
}

// ============================================================================
// Learning Outcome Definition
// ============================================================================

export interface LearningOutcome {
  id: string;
  code: string;                  // e.g., "PLO-1", "CLO-2"
  description: string;
  level: OutcomeLevel;
  bloomLevel: BloomLevel;
  programId?: string;            // For program-level outcomes
  courseId?: string;             // For course-level outcomes
  moduleId?: string;             // For module-level outcomes
  status: OutcomeStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface LearningOutcomeCreateInput {
  code: string;
  description: string;
  level: OutcomeLevel;
  bloomLevel: BloomLevel;
  programId?: string;
  courseId?: string;
  moduleId?: string;
}

export interface LearningOutcomeUpdateInput {
  code?: string;
  description?: string;
  bloomLevel?: BloomLevel;
  status?: OutcomeStatus;
}

// ============================================================================
// Outcome Mapping
// ============================================================================

export interface OutcomeMapping {
  id: string;
  programOutcomeId: string;
  courseId: string;
  courseOutcomeIds: string[];
  mappingStrength: MappingStrength;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export enum MappingStrength {
  PRIMARY = 'PRIMARY',           // Primary contribution to outcome
  SECONDARY = 'SECONDARY',       // Secondary contribution
  SUPPORTING = 'SUPPORTING'      // Supporting contribution
}

export interface OutcomeMappingCreateInput {
  programOutcomeId: string;
  courseId: string;
  courseOutcomeIds: string[];
  mappingStrength: MappingStrength;
  notes?: string;
}

// ============================================================================
// Coverage Analysis
// ============================================================================

export interface OutcomeCoverageAnalysis {
  programId: string;
  totalOutcomes: number;
  coveredOutcomes: number;
  uncoveredOutcomes: string[];
  coveragePercentage: number;
  outcomeCoverage: OutcomeCoverageDetail[];
  gaps: OutcomeGap[];
  recommendations: string[];
}

export interface OutcomeCoverageDetail {
  outcomeId: string;
  outcomeCode: string;
  outcomeDescription: string;
  coveringCourses: CourseCoverage[];
  totalCoverage: number;
  adequatelyCovered: boolean;
}

export interface CourseCoverage {
  courseId: string;
  courseCode: string;
  courseTitle: string;
  mappingStrength: MappingStrength;
  assessmentMethods: string[];
}

export interface OutcomeGap {
  outcomeId: string;
  outcomeCode: string;
  outcomeDescription: string;
  gapType: GapType;
  severity: GapSeverity;
  affectedStudents: number;
  recommendations: string[];
}

export enum GapType {
  NO_COVERAGE = 'NO_COVERAGE',           // Outcome not covered by any course
  INSUFFICIENT_COVERAGE = 'INSUFFICIENT_COVERAGE',  // Covered but inadequately
  WEAK_ASSESSMENT = 'WEAK_ASSESSMENT',   // Covered but poorly assessed
  MISSING_PROGRESSION = 'MISSING_PROGRESSION'  // Missing skill progression
}

export enum GapSeverity {
  CRITICAL = 'CRITICAL',
  HIGH = 'HIGH',
  MEDIUM = 'MEDIUM',
  LOW = 'LOW'
}

// ============================================================================
// Outcome Achievement Tracking
// ============================================================================

export interface OutcomeAchievement {
  id: string;
  studentId: string;
  outcomeId: string;
  courseId: string;
  achievementLevel: AchievementLevel;
  assessmentScore: number;
  assessmentDate: Date;
  evidence: string[];
  createdAt: Date;
}

export enum AchievementLevel {
  EXCEEDS = 'EXCEEDS',           // Exceeds expectations
  MEETS = 'MEETS',               // Meets expectations
  DEVELOPING = 'DEVELOPING',     // Developing proficiency
  NOT_MET = 'NOT_MET'            // Does not meet expectations
}

export interface OutcomeAchievementRate {
  outcomeId: string;
  outcomeCode: string;
  outcomeDescription: string;
  totalStudents: number;
  achievementDistribution: {
    exceeds: number;
    meets: number;
    developing: number;
    notMet: number;
  };
  averageScore: number;
  achievementRate: number;  // Percentage meeting or exceeding
}

// ============================================================================
// Accreditation Reporting
// ============================================================================

export interface AccreditationReport {
  programId: string;
  programName: string;
  reportingPeriod: {
    startDate: Date;
    endDate: Date;
  };
  outcomeSummary: OutcomeSummary[];
  overallAchievementRate: number;
  improvementActions: ImprovementAction[];
  generatedAt: Date;
}

export interface OutcomeSummary {
  outcomeId: string;
  outcomeCode: string;
  outcomeDescription: string;
  achievementRate: number;
  assessmentMethods: string[];
  dataPoints: number;
  trend: 'IMPROVING' | 'STABLE' | 'DECLINING';
  analysis: string;
}

export interface ImprovementAction {
  outcomeId: string;
  issue: string;
  action: string;
  responsible: string;
  targetDate: Date;
  status: 'PLANNED' | 'IN_PROGRESS' | 'COMPLETED';
}

// ============================================================================
// Program-Level Outcome Tracking
// ============================================================================

export interface ProgramOutcomeTracking {
  programId: string;
  programName: string;
  outcomes: LearningOutcome[];
  courseMapping: Map<string, string[]>;  // courseId -> outcomeIds
  coverageAnalysis: OutcomeCoverageAnalysis;
  achievementRates: OutcomeAchievementRate[];
  lastUpdated: Date;
}

// ============================================================================
// Outcome Alignment
// ============================================================================

export interface OutcomeAlignment {
  programOutcomeId: string;
  courseOutcomeId: string;
  alignmentScore: number;  // 0-100
  alignmentRationale: string;
  assessmentAlignment: boolean;
  verifiedBy?: string;
  verifiedAt?: Date;
}

export interface OutcomeAlignmentAnalysis {
  programId: string;
  totalAlignments: number;
  strongAlignments: number;
  weakAlignments: number;
  misalignments: OutcomeMisalignment[];
  recommendations: string[];
}

export interface OutcomeMisalignment {
  courseId: string;
  courseCode: string;
  programOutcomeId: string;
  issue: string;
  severity: GapSeverity;
  recommendation: string;
}
