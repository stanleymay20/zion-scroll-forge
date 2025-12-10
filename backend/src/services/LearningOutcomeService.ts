/**
 * Learning Outcome Service
 * "Let every course contribute to the complete formation of the student"
 * 
 * Manages learning outcomes, course-to-outcome mapping, program-level tracking,
 * coverage analysis, and gap identification for academic programs.
 * 
 * Requirements: 4.1, 4.2, 4.3
 */

import { PrismaClient } from '@prisma/client';
import {
  LearningOutcome,
  LearningOutcomeCreateInput,
  LearningOutcomeUpdateInput,
  OutcomeMapping,
  OutcomeMappingCreateInput,
  OutcomeCoverageAnalysis,
  OutcomeCoverageDetail,
  CourseCoverage,
  OutcomeGap,
  GapType,
  GapSeverity,
  OutcomeLevel,
  OutcomeStatus,
  MappingStrength,
  ProgramOutcomeTracking
} from '../types/learning-outcome.types';

const prisma = new PrismaClient();

export default class LearningOutcomeService {
  // ============================================================================
  // Outcome Definition and Storage
  // ============================================================================

  /**
   * Create a new learning outcome
   * Requirement 4.1: WHEN mapping outcomes THEN the system SHALL link courses to program learning outcomes
   */
  async createOutcome(input: LearningOutcomeCreateInput): Promise<LearningOutcome> {
    // Validate that the associated entity exists
    if (input.programId) {
      const program = await prisma.degreeProgram.findUnique({
        where: { id: input.programId }
      });
      if (!program) {
        throw new Error(`Degree program not found: ${input.programId}`);
      }
    }

    if (input.courseId) {
      const course = await prisma.course.findUnique({
        where: { id: input.courseId }
      });
      if (!course) {
        throw new Error(`Course not found: ${input.courseId}`);
      }
    }

    // Check for duplicate outcome codes
    const existingOutcome = await this.getOutcomeByCode(input.code);
    if (existingOutcome) {
      throw new Error(`Outcome with code ${input.code} already exists`);
    }

    const outcome: LearningOutcome = {
      id: `outcome_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      code: input.code,
      description: input.description,
      level: input.level,
      bloomLevel: input.bloomLevel,
      programId: input.programId,
      courseId: input.courseId,
      moduleId: input.moduleId,
      status: OutcomeStatus.ACTIVE,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Store in a dedicated outcomes table (would need to be added to schema)
    // For now, we'll use a JSON storage approach
    return outcome;
  }

  /**
   * Update an existing learning outcome
   */
  async updateOutcome(
    outcomeId: string,
    input: LearningOutcomeUpdateInput
  ): Promise<LearningOutcome> {
    const outcome = await this.getOutcomeById(outcomeId);
    if (!outcome) {
      throw new Error(`Learning outcome not found: ${outcomeId}`);
    }

    const updatedOutcome: LearningOutcome = {
      ...outcome,
      ...input,
      updatedAt: new Date()
    };

    return updatedOutcome;
  }

  /**
   * Get learning outcome by ID
   */
  async getOutcomeById(outcomeId: string): Promise<LearningOutcome | null> {
    // Implementation would query from database
    // Placeholder for now
    return null;
  }

  /**
   * Get learning outcome by code
   */
  async getOutcomeByCode(code: string): Promise<LearningOutcome | null> {
    // Implementation would query from database
    return null;
  }

  /**
   * Get all outcomes for a program
   */
  async getProgramOutcomes(programId: string): Promise<LearningOutcome[]> {
    const program = await prisma.degreeProgram.findUnique({
      where: { id: programId }
    });

    if (!program) {
      throw new Error(`Degree program not found: ${programId}`);
    }

    // Query outcomes for this program
    // Placeholder implementation
    return [];
  }

  /**
   * Get all outcomes for a course
   */
  async getCourseOutcomes(courseId: string): Promise<LearningOutcome[]> {
    const course = await prisma.course.findUnique({
      where: { id: courseId }
    });

    if (!course) {
      throw new Error(`Course not found: ${courseId}`);
    }

    // Query outcomes for this course
    return [];
  }

  // ============================================================================
  // Course-to-Outcome Mapping
  // ============================================================================

  /**
   * Create a mapping between a course and program outcomes
   * Requirement 4.1: Link courses to program learning outcomes
   */
  async createOutcomeMapping(input: OutcomeMappingCreateInput): Promise<OutcomeMapping> {
    // Validate program outcome exists
    const programOutcome = await this.getOutcomeById(input.programOutcomeId);
    if (!programOutcome || programOutcome.level !== OutcomeLevel.PROGRAM) {
      throw new Error(`Invalid program outcome: ${input.programOutcomeId}`);
    }

    // Validate course exists
    const course = await prisma.course.findUnique({
      where: { id: input.courseId }
    });
    if (!course) {
      throw new Error(`Course not found: ${input.courseId}`);
    }

    // Validate all course outcomes exist
    for (const courseOutcomeId of input.courseOutcomeIds) {
      const courseOutcome = await this.getOutcomeById(courseOutcomeId);
      if (!courseOutcome || courseOutcome.level !== OutcomeLevel.COURSE) {
        throw new Error(`Invalid course outcome: ${courseOutcomeId}`);
      }
    }

    const mapping: OutcomeMapping = {
      id: `mapping_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      programOutcomeId: input.programOutcomeId,
      courseId: input.courseId,
      courseOutcomeIds: input.courseOutcomeIds,
      mappingStrength: input.mappingStrength,
      notes: input.notes,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    return mapping;
  }

  /**
   * Get all outcome mappings for a program
   */
  async getProgramOutcomeMappings(programId: string): Promise<OutcomeMapping[]> {
    const programOutcomes = await this.getProgramOutcomes(programId);
    const mappings: OutcomeMapping[] = [];

    // Query mappings for each program outcome
    // Placeholder implementation
    return mappings;
  }

  /**
   * Get outcome mappings for a specific course
   */
  async getCourseOutcomeMappings(courseId: string): Promise<OutcomeMapping[]> {
    // Query mappings for this course
    return [];
  }

  // ============================================================================
  // Program-Level Outcome Tracking
  // ============================================================================

  /**
   * Get comprehensive outcome tracking for a program
   * Requirement 4.1, 4.2: Track program-level outcomes and coverage
   */
  async getProgramOutcomeTracking(programId: string): Promise<ProgramOutcomeTracking> {
    const program = await prisma.degreeProgram.findUnique({
      where: { id: programId }
    });

    if (!program) {
      throw new Error(`Degree program not found: ${programId}`);
    }

    const outcomes = await this.getProgramOutcomes(programId);
    const mappings = await this.getProgramOutcomeMappings(programId);

    // Build course mapping
    const courseMapping = new Map<string, string[]>();
    for (const mapping of mappings) {
      if (!courseMapping.has(mapping.courseId)) {
        courseMapping.set(mapping.courseId, []);
      }
      courseMapping.get(mapping.courseId)!.push(mapping.programOutcomeId);
    }

    // Get coverage analysis
    const coverageAnalysis = await this.analyzeProgramOutcomeCoverage(programId);

    return {
      programId,
      programName: program.name,
      outcomes,
      courseMapping,
      coverageAnalysis,
      achievementRates: [],  // Would be populated from assessment data
      lastUpdated: new Date()
    };
  }

  // ============================================================================
  // Coverage Analysis
  // ============================================================================

  /**
   * Analyze outcome coverage for a program
   * Requirement 4.2: WHEN analyzing coverage THEN the system SHALL identify gaps in outcome achievement
   */
  async analyzeProgramOutcomeCoverage(programId: string): Promise<OutcomeCoverageAnalysis> {
    const program = await prisma.degreeProgram.findUnique({
      where: { id: programId }
    });

    if (!program) {
      throw new Error(`Degree program not found: ${programId}`);
    }

    const programOutcomes = await this.getProgramOutcomes(programId);
    const mappings = await this.getProgramOutcomeMappings(programId);

    // Analyze coverage for each outcome
    const outcomeCoverage: OutcomeCoverageDetail[] = [];
    const uncoveredOutcomes: string[] = [];

    for (const outcome of programOutcomes) {
      const coveringCourses = await this.getCoursesForOutcome(outcome.id, mappings);
      
      const coverageDetail: OutcomeCoverageDetail = {
        outcomeId: outcome.id,
        outcomeCode: outcome.code,
        outcomeDescription: outcome.description,
        coveringCourses,
        totalCoverage: coveringCourses.length,
        adequatelyCovered: coveringCourses.length >= 2  // At least 2 courses should cover each outcome
      };

      outcomeCoverage.push(coverageDetail);

      if (coveringCourses.length === 0) {
        uncoveredOutcomes.push(outcome.id);
      }
    }

    const coveredOutcomes = programOutcomes.length - uncoveredOutcomes.length;
    const coveragePercentage = programOutcomes.length > 0
      ? (coveredOutcomes / programOutcomes.length) * 100
      : 0;

    // Identify gaps
    const gaps = await this.identifyOutcomeGaps(programId, outcomeCoverage);

    // Generate recommendations
    const recommendations = this.generateCoverageRecommendations(gaps, outcomeCoverage);

    return {
      programId,
      totalOutcomes: programOutcomes.length,
      coveredOutcomes,
      uncoveredOutcomes,
      coveragePercentage,
      outcomeCoverage,
      gaps,
      recommendations
    };
  }

  /**
   * Get courses that cover a specific outcome
   */
  private async getCoursesForOutcome(
    outcomeId: string,
    mappings: OutcomeMapping[]
  ): Promise<CourseCoverage[]> {
    const relevantMappings = mappings.filter(m => m.programOutcomeId === outcomeId);
    const courseCoverage: CourseCoverage[] = [];

    for (const mapping of relevantMappings) {
      const course = await prisma.course.findUnique({
        where: { id: mapping.courseId }
      });

      if (course) {
        courseCoverage.push({
          courseId: course.id,
          courseCode: course.code,
          courseTitle: course.title,
          mappingStrength: mapping.mappingStrength,
          assessmentMethods: []  // Would be populated from course data
        });
      }
    }

    return courseCoverage;
  }

  // ============================================================================
  // Gap Identification
  // ============================================================================

  /**
   * Identify gaps in outcome coverage
   * Requirement 4.2: Identify gaps in outcome achievement
   * Requirement 4.3: WHEN designing programs THEN the system SHALL ensure all outcomes are addressed
   */
  async identifyOutcomeGaps(
    programId: string,
    coverageDetails: OutcomeCoverageDetail[]
  ): Promise<OutcomeGap[]> {
    const gaps: OutcomeGap[] = [];

    for (const detail of coverageDetails) {
      // Check for no coverage
      if (detail.coveringCourses.length === 0) {
        gaps.push({
          outcomeId: detail.outcomeId,
          outcomeCode: detail.outcomeCode,
          outcomeDescription: detail.outcomeDescription,
          gapType: GapType.NO_COVERAGE,
          severity: GapSeverity.CRITICAL,
          affectedStudents: 0,  // Would be calculated from enrollment data
          recommendations: [
            `Add ${detail.outcomeCode} to existing course learning objectives`,
            `Create new course module to address ${detail.outcomeCode}`,
            `Review program curriculum to ensure outcome alignment`
          ]
        });
      }
      // Check for insufficient coverage
      else if (detail.coveringCourses.length === 1) {
        gaps.push({
          outcomeId: detail.outcomeId,
          outcomeCode: detail.outcomeCode,
          outcomeDescription: detail.outcomeDescription,
          gapType: GapType.INSUFFICIENT_COVERAGE,
          severity: GapSeverity.HIGH,
          affectedStudents: 0,
          recommendations: [
            `Add ${detail.outcomeCode} to additional courses for reinforcement`,
            `Ensure progressive skill development across multiple courses`
          ]
        });
      }
      // Check for weak assessment
      else if (this.hasWeakAssessment(detail)) {
        gaps.push({
          outcomeId: detail.outcomeId,
          outcomeCode: detail.outcomeCode,
          outcomeDescription: detail.outcomeDescription,
          gapType: GapType.WEAK_ASSESSMENT,
          severity: GapSeverity.MEDIUM,
          affectedStudents: 0,
          recommendations: [
            `Strengthen assessment methods for ${detail.outcomeCode}`,
            `Add direct assessment measures`,
            `Include authentic assessment opportunities`
          ]
        });
      }
    }

    return gaps;
  }

  /**
   * Check if an outcome has weak assessment coverage
   */
  private hasWeakAssessment(detail: OutcomeCoverageDetail): boolean {
    // Check if all covering courses have only supporting strength
    const allSupporting = detail.coveringCourses.every(
      c => c.mappingStrength === MappingStrength.SUPPORTING
    );

    // Check if assessment methods are limited
    const limitedAssessment = detail.coveringCourses.every(
      c => c.assessmentMethods.length < 2
    );

    return allSupporting || limitedAssessment;
  }

  /**
   * Generate recommendations based on coverage analysis
   */
  private generateCoverageRecommendations(
    gaps: OutcomeGap[],
    coverageDetails: OutcomeCoverageDetail[]
  ): string[] {
    const recommendations: string[] = [];

    // Critical gaps
    const criticalGaps = gaps.filter(g => g.severity === GapSeverity.CRITICAL);
    if (criticalGaps.length > 0) {
      recommendations.push(
        `CRITICAL: ${criticalGaps.length} outcomes have no coverage. Immediate curriculum revision required.`
      );
    }

    // High severity gaps
    const highGaps = gaps.filter(g => g.severity === GapSeverity.HIGH);
    if (highGaps.length > 0) {
      recommendations.push(
        `HIGH PRIORITY: ${highGaps.length} outcomes have insufficient coverage. Add to additional courses.`
      );
    }

    // Overall coverage
    const adequatelyCovered = coverageDetails.filter(d => d.adequatelyCovered).length;
    const coverageRate = (adequatelyCovered / coverageDetails.length) * 100;

    if (coverageRate < 80) {
      recommendations.push(
        `Overall coverage rate is ${coverageRate.toFixed(1)}%. Target is 100%. Review curriculum mapping.`
      );
    }

    // Assessment recommendations
    const weakAssessment = gaps.filter(g => g.gapType === GapType.WEAK_ASSESSMENT);
    if (weakAssessment.length > 0) {
      recommendations.push(
        `${weakAssessment.length} outcomes need stronger assessment methods. Review assessment strategies.`
      );
    }

    return recommendations;
  }

  /**
   * Validate that all program outcomes are adequately covered
   * Requirement 4.3: Ensure all outcomes are addressed
   */
  async validateProgramOutcomeCoverage(programId: string): Promise<{
    valid: boolean;
    issues: string[];
    gaps: OutcomeGap[];
  }> {
    const coverageAnalysis = await this.analyzeProgramOutcomeCoverage(programId);
    const issues: string[] = [];

    // Check for uncovered outcomes
    if (coverageAnalysis.uncoveredOutcomes.length > 0) {
      issues.push(
        `${coverageAnalysis.uncoveredOutcomes.length} outcomes have no course coverage`
      );
    }

    // Check for critical gaps
    const criticalGaps = coverageAnalysis.gaps.filter(
      g => g.severity === GapSeverity.CRITICAL
    );
    if (criticalGaps.length > 0) {
      issues.push(`${criticalGaps.length} critical gaps identified`);
    }

    // Check coverage percentage
    if (coverageAnalysis.coveragePercentage < 100) {
      issues.push(
        `Coverage is ${coverageAnalysis.coveragePercentage.toFixed(1)}%, target is 100%`
      );
    }

    return {
      valid: issues.length === 0,
      issues,
      gaps: coverageAnalysis.gaps
    };
  }

  /**
   * Get outcome coverage summary for a course
   */
  async getCourseCoverageSummary(courseId: string): Promise<{
    courseId: string;
    programOutcomesCovered: string[];
    courseOutcomes: LearningOutcome[];
    mappingStrength: Record<string, MappingStrength>;
  }> {
    const course = await prisma.course.findUnique({
      where: { id: courseId }
    });

    if (!course) {
      throw new Error(`Course not found: ${courseId}`);
    }

    const courseOutcomes = await this.getCourseOutcomes(courseId);
    const mappings = await this.getCourseOutcomeMappings(courseId);

    const programOutcomesCovered = mappings.map(m => m.programOutcomeId);
    const mappingStrength: Record<string, MappingStrength> = {};

    for (const mapping of mappings) {
      mappingStrength[mapping.programOutcomeId] = mapping.mappingStrength;
    }

    return {
      courseId,
      programOutcomesCovered,
      courseOutcomes,
      mappingStrength
    };
  }
}
