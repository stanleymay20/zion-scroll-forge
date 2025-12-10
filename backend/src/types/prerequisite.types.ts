/**
 * Prerequisite Management System Types
 * "Let every course build upon the foundation of knowledge"
 */

// ============================================================================
// Prerequisite Types
// ============================================================================

export enum PrerequisiteType {
  AND = 'AND',           // All prerequisites must be satisfied
  OR = 'OR',             // At least one prerequisite must be satisfied
  COREQUISITE = 'COREQUISITE'  // Must be taken concurrently
}

export enum PrerequisiteStatus {
  SATISFIED = 'SATISFIED',
  NOT_SATISFIED = 'NOT_SATISFIED',
  IN_PROGRESS = 'IN_PROGRESS',
  WAIVED = 'WAIVED'
}

// ============================================================================
// Prerequisite Definition
// ============================================================================

export interface PrerequisiteDefinition {
  id: string;
  courseId: string;
  type: PrerequisiteType;
  requiredCourses: string[];
  minimumGrade?: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface PrerequisiteCreateInput {
  courseId: string;
  type: PrerequisiteType;
  requiredCourses: string[];
  minimumGrade?: string;
  description?: string;
}

export interface PrerequisiteUpdateInput {
  type?: PrerequisiteType;
  requiredCourses?: string[];
  minimumGrade?: string;
  description?: string;
}

// ============================================================================
// Prerequisite Validation
// ============================================================================

export interface PrerequisiteValidationRequest {
  userId: string;
  courseId: string;
}

export interface PrerequisiteValidationResult {
  courseId: string;
  satisfied: boolean;
  status: PrerequisiteStatus;
  missingPrerequisites: string[];
  satisfiedPrerequisites: string[];
  inProgressPrerequisites: string[];
  waivedPrerequisites: string[];
  message: string;
}

// ============================================================================
// Dependency Graph
// ============================================================================

export interface DependencyNode {
  courseId: string;
  courseCode: string;
  courseTitle: string;
  prerequisites: string[];
  dependents: string[];
  level: number;
}

export interface DependencyGraph {
  nodes: Map<string, DependencyNode>;
  edges: Map<string, string[]>;
  hasCycle: boolean;
  cycles?: string[][];
}

export interface CircularDependencyError {
  detected: boolean;
  cycles: string[][];
  affectedCourses: string[];
  message: string;
}

// ============================================================================
// Prerequisite Override
// ============================================================================

export interface PrerequisiteOverride {
  id: string;
  userId: string;
  courseId: string;
  prerequisiteId: string;
  reason: string;
  documentation: string;
  requestedBy: string;
  requestedAt: Date;
  approvedBy?: string;
  approvedAt?: Date;
  status: OverrideStatus;
  expiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export enum OverrideStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  DENIED = 'DENIED',
  EXPIRED = 'EXPIRED',
  REVOKED = 'REVOKED'
}

export interface PrerequisiteOverrideRequest {
  userId: string;
  courseId: string;
  prerequisiteId: string;
  reason: string;
  documentation: string;
  requestedBy: string;
}

export interface PrerequisiteOverrideApproval {
  overrideId: string;
  approvedBy: string;
  approved: boolean;
  comments?: string;
  expiresAt?: Date;
}

// ============================================================================
// Prerequisite Impact Analysis
// ============================================================================

export interface PrerequisiteImpactAnalysis {
  courseId: string;
  affectedStudents: number;
  affectedEnrollments: string[];
  downstreamCourses: string[];
  impactLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  recommendations: string[];
}

// ============================================================================
// Course Sequencing
// ============================================================================

export interface CourseSequence {
  userId: string;
  degreeProgramId: string;
  recommendedPath: CoursePathStep[];
  alternativePaths: CoursePathStep[][];
  estimatedCompletionSemesters: number;
}

export interface CoursePathStep {
  semester: number;
  courses: string[];
  credits: number;
  prerequisites: string[];
}

// ============================================================================
// Prerequisite Analytics
// ============================================================================

export interface PrerequisiteAnalytics {
  courseId: string;
  totalPrerequisites: number;
  prerequisiteTypes: Record<PrerequisiteType, number>;
  averagePrerequisiteChainLength: number;
  mostCommonPrerequisites: string[];
  blockingRate: number; // Percentage of students blocked by prerequisites
}
