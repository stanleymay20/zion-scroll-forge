/**
 * Outcome Assessment Service
 * "Let every achievement be measured and every growth be celebrated"
 * 
 * Tracks student achievement of learning outcomes, calculates achievement rates,
 * generates accreditation reports, and provides outcome mapping visualization.
 * 
 * Requirements: 4.4, 4.5
 */

import { PrismaClient } from '@prisma/client';
import {
  OutcomeAchievement,
  OutcomeAchievementRate,
  AchievementLevel,
  AccreditationReport,
  OutcomeSummary,
  ImprovementAction,
  LearningOutcome
} from '../types/learning-outcome.types';
import LearningOutcomeService from './LearningOutcomeService';

const prisma = new PrismaClient();

export default class OutcomeAssessmentService {
  private learningOutcomeService: LearningOutcomeService;

  constructor() {
    this.learningOutcomeService = new LearningOutcomeService();
  }

  // ============================================================================
  // Achievement Rate Calculation
  // ============================================================================

  /**
   * Calculate achievement rate for a specific outcome
   * Requirement 4.4: WHEN assessing programs THEN the system SHALL track outcome achievement rates
   */
  async calculateOutcomeAchievementRate(
    outcomeId: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<OutcomeAchievementRate> {
    const outcome = await this.learningOutcomeService.getOutcomeById(outcomeId);
    if (!outcome) {
      throw new Error(`Learning outcome not found: ${outcomeId}`);
    }

    // Get all achievement records for this outcome
    const achievements = await this.getOutcomeAchievements(outcomeId, startDate, endDate);

    // Calculate distribution
    const distribution = {
      exceeds: achievements.filter(a => a.achievementLevel === AchievementLevel.EXCEEDS).length,
      meets: achievements.filter(a => a.achievementLevel === AchievementLevel.MEETS).length,
      developing: achievements.filter(a => a.achievementLevel === AchievementLevel.DEVELOPING).length,
      notMet: achievements.filter(a => a.achievementLevel === AchievementLevel.NOT_MET).length
    };

    const totalStudents = achievements.length;
    const successfulStudents = distribution.exceeds + distribution.meets;
    const achievementRate = totalStudents > 0 ? (successfulStudents / totalStudents) * 100 : 0;

    // Calculate average score
    const totalScore = achievements.reduce((sum, a) => sum + a.assessmentScore, 0);
    const averageScore = totalStudents > 0 ? totalScore / totalStudents : 0;

    return {
      outcomeId: outcome.id,
      outcomeCode: outcome.code,
      outcomeDescription: outcome.description,
      totalStudents,
      achievementDistribution: distribution,
      averageScore,
      achievementRate
    };
  }

  /**
   * Calculate achievement rates for all outcomes in a program
   */
  async calculateProgramAchievementRates(
    programId: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<OutcomeAchievementRate[]> {
    const outcomes = await this.learningOutcomeService.getProgramOutcomes(programId);
    const achievementRates: OutcomeAchievementRate[] = [];

    for (const outcome of outcomes) {
      const rate = await this.calculateOutcomeAchievementRate(
        outcome.id,
        startDate,
        endDate
      );
      achievementRates.push(rate);
    }

    return achievementRates;
  }

  /**
   * Get achievement records for an outcome
   */
  private async getOutcomeAchievements(
    outcomeId: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<OutcomeAchievement[]> {
    // Query achievement records from database
    // This would typically join with assessment results and student enrollments
    // Placeholder implementation
    return [];
  }

  /**
   * Record a student's achievement of a learning outcome
   */
  async recordOutcomeAchievement(
    studentId: string,
    outcomeId: string,
    courseId: string,
    assessmentScore: number,
    evidence: string[]
  ): Promise<OutcomeAchievement> {
    // Validate outcome exists
    const outcome = await this.learningOutcomeService.getOutcomeById(outcomeId);
    if (!outcome) {
      throw new Error(`Learning outcome not found: ${outcomeId}`);
    }

    // Validate course exists
    const course = await prisma.course.findUnique({
      where: { id: courseId }
    });
    if (!course) {
      throw new Error(`Course not found: ${courseId}`);
    }

    // Determine achievement level based on score
    const achievementLevel = this.determineAchievementLevel(assessmentScore);

    const achievement: OutcomeAchievement = {
      id: `achievement_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      studentId,
      outcomeId,
      courseId,
      achievementLevel,
      assessmentScore,
      assessmentDate: new Date(),
      evidence,
      createdAt: new Date()
    };

    // Store achievement record
    return achievement;
  }

  /**
   * Determine achievement level based on assessment score
   */
  private determineAchievementLevel(score: number): AchievementLevel {
    if (score >= 90) return AchievementLevel.EXCEEDS;
    if (score >= 70) return AchievementLevel.MEETS;
    if (score >= 50) return AchievementLevel.DEVELOPING;
    return AchievementLevel.NOT_MET;
  }

  // ============================================================================
  // Accreditation Reporting
  // ============================================================================

  /**
   * Generate accreditation report for a program
   * Requirement 4.5: WHEN accrediting programs THEN the system SHALL generate outcome mapping reports
   */
  async generateAccreditationReport(
    programId: string,
    startDate: Date,
    endDate: Date
  ): Promise<AccreditationReport> {
    const program = await prisma.degreeProgram.findUnique({
      where: { id: programId }
    });

    if (!program) {
      throw new Error(`Degree program not found: ${programId}`);
    }

    // Get achievement rates for all outcomes
    const achievementRates = await this.calculateProgramAchievementRates(
      programId,
      startDate,
      endDate
    );

    // Generate outcome summaries
    const outcomeSummary: OutcomeSummary[] = [];
    let totalAchievementRate = 0;

    for (const rate of achievementRates) {
      const summary = await this.generateOutcomeSummary(
        rate,
        startDate,
        endDate
      );
      outcomeSummary.push(summary);
      totalAchievementRate += rate.achievementRate;
    }

    const overallAchievementRate = achievementRates.length > 0
      ? totalAchievementRate / achievementRates.length
      : 0;

    // Identify improvement actions
    const improvementActions = await this.identifyImprovementActions(
      programId,
      achievementRates
    );

    return {
      programId,
      programName: program.name,
      reportingPeriod: {
        startDate,
        endDate
      },
      outcomeSummary,
      overallAchievementRate,
      improvementActions,
      generatedAt: new Date()
    };
  }

  /**
   * Generate summary for a single outcome
   */
  private async generateOutcomeSummary(
    rate: OutcomeAchievementRate,
    startDate: Date,
    endDate: Date
  ): Promise<OutcomeSummary> {
    // Get assessment methods for this outcome
    const assessmentMethods = await this.getOutcomeAssessmentMethods(rate.outcomeId);

    // Calculate trend by comparing with previous period
    const trend = await this.calculateAchievementTrend(
      rate.outcomeId,
      startDate,
      endDate
    );

    // Generate analysis
    const analysis = this.generateOutcomeAnalysis(rate, trend);

    return {
      outcomeId: rate.outcomeId,
      outcomeCode: rate.outcomeCode,
      outcomeDescription: rate.outcomeDescription,
      achievementRate: rate.achievementRate,
      assessmentMethods,
      dataPoints: rate.totalStudents,
      trend,
      analysis
    };
  }

  /**
   * Get assessment methods used for an outcome
   */
  private async getOutcomeAssessmentMethods(outcomeId: string): Promise<string[]> {
    // Query courses that assess this outcome and their assessment methods
    // Placeholder implementation
    return ['Exams', 'Projects', 'Presentations', 'Portfolios'];
  }

  /**
   * Calculate achievement trend for an outcome
   */
  private async calculateAchievementTrend(
    outcomeId: string,
    currentStart: Date,
    currentEnd: Date
  ): Promise<'IMPROVING' | 'STABLE' | 'DECLINING'> {
    // Calculate achievement rate for current period
    const currentRate = await this.calculateOutcomeAchievementRate(
      outcomeId,
      currentStart,
      currentEnd
    );

    // Calculate achievement rate for previous period
    const periodLength = currentEnd.getTime() - currentStart.getTime();
    const previousStart = new Date(currentStart.getTime() - periodLength);
    const previousEnd = currentStart;

    const previousRate = await this.calculateOutcomeAchievementRate(
      outcomeId,
      previousStart,
      previousEnd
    );

    // Compare rates
    const difference = currentRate.achievementRate - previousRate.achievementRate;

    if (difference > 5) return 'IMPROVING';
    if (difference < -5) return 'DECLINING';
    return 'STABLE';
  }

  /**
   * Generate analysis text for an outcome
   */
  private generateOutcomeAnalysis(
    rate: OutcomeAchievementRate,
    trend: 'IMPROVING' | 'STABLE' | 'DECLINING'
  ): string {
    const analysis: string[] = [];

    // Achievement rate analysis
    if (rate.achievementRate >= 80) {
      analysis.push(`Strong achievement rate of ${rate.achievementRate.toFixed(1)}%.`);
    } else if (rate.achievementRate >= 70) {
      analysis.push(`Acceptable achievement rate of ${rate.achievementRate.toFixed(1)}%.`);
    } else {
      analysis.push(`Below target achievement rate of ${rate.achievementRate.toFixed(1)}%.`);
    }

    // Distribution analysis
    const exceedsPercentage = (rate.achievementDistribution.exceeds / rate.totalStudents) * 100;
    if (exceedsPercentage > 30) {
      analysis.push(`${exceedsPercentage.toFixed(1)}% of students exceed expectations.`);
    }

    const notMetPercentage = (rate.achievementDistribution.notMet / rate.totalStudents) * 100;
    if (notMetPercentage > 20) {
      analysis.push(`${notMetPercentage.toFixed(1)}% of students do not meet expectations - intervention needed.`);
    }

    // Trend analysis
    if (trend === 'IMPROVING') {
      analysis.push('Achievement is improving over time.');
    } else if (trend === 'DECLINING') {
      analysis.push('Achievement is declining - review instructional strategies.');
    }

    return analysis.join(' ');
  }

  /**
   * Identify improvement actions based on achievement data
   */
  private async identifyImprovementActions(
    programId: string,
    achievementRates: OutcomeAchievementRate[]
  ): Promise<ImprovementAction[]> {
    const actions: ImprovementAction[] = [];

    for (const rate of achievementRates) {
      // Low achievement rate
      if (rate.achievementRate < 70) {
        actions.push({
          outcomeId: rate.outcomeId,
          issue: `Achievement rate of ${rate.achievementRate.toFixed(1)}% is below 70% target`,
          action: 'Review and revise instructional strategies, add supplemental materials, provide additional practice opportunities',
          responsible: 'Program Director',
          targetDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days
          status: 'PLANNED'
        });
      }

      // High failure rate
      const notMetPercentage = (rate.achievementDistribution.notMet / rate.totalStudents) * 100;
      if (notMetPercentage > 20) {
        actions.push({
          outcomeId: rate.outcomeId,
          issue: `${notMetPercentage.toFixed(1)}% of students not meeting expectations`,
          action: 'Implement early intervention program, provide tutoring support, review prerequisite requirements',
          responsible: 'Department Chair',
          targetDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days
          status: 'PLANNED'
        });
      }

      // Low exceeds rate
      const exceedsPercentage = (rate.achievementDistribution.exceeds / rate.totalStudents) * 100;
      if (exceedsPercentage < 10 && rate.achievementRate > 70) {
        actions.push({
          outcomeId: rate.outcomeId,
          issue: 'Few students exceeding expectations - limited challenge',
          action: 'Add advanced learning opportunities, enrichment activities, and stretch goals',
          responsible: 'Faculty Lead',
          targetDate: new Date(Date.now() + 120 * 24 * 60 * 60 * 1000), // 120 days
          status: 'PLANNED'
        });
      }
    }

    return actions;
  }

  // ============================================================================
  // Outcome Mapping Visualization
  // ============================================================================

  /**
   * Generate outcome mapping visualization data
   * Requirement 4.5: Add outcome mapping visualization
   */
  async generateOutcomeMappingVisualization(programId: string): Promise<{
    nodes: OutcomeNode[];
    edges: OutcomeEdge[];
    statistics: MappingStatistics;
  }> {
    const program = await prisma.degreeProgram.findUnique({
      where: { id: programId }
    });

    if (!program) {
      throw new Error(`Degree program not found: ${programId}`);
    }

    // Get courses for this program through requirements
    const requirements = await prisma.degreeRequirement.findMany({
      where: { degreeProgramId: programId }
    });

    // Collect all course IDs from requirements
    const courseIds = new Set<string>();
    for (const req of requirements) {
      req.requiredCourses.forEach(id => courseIds.add(id));
      req.electiveOptions.forEach(id => courseIds.add(id));
    }

    // Get course details
    const courses = await prisma.course.findMany({
      where: { id: { in: Array.from(courseIds) } }
    });

    const programOutcomes = await this.learningOutcomeService.getProgramOutcomes(programId);
    const mappings = await this.learningOutcomeService.getProgramOutcomeMappings(programId);

    // Create nodes for program outcomes
    const nodes: OutcomeNode[] = programOutcomes.map(outcome => ({
      id: outcome.id,
      label: outcome.code,
      description: outcome.description,
      type: 'program-outcome',
      level: 0
    }));

    // Add nodes for courses
    const courseNodes: OutcomeNode[] = courses.map(course => ({
      id: course.id,
      label: course.code,
      description: course.title,
      type: 'course',
      level: 1
    }));
    nodes.push(...courseNodes);

    // Create edges for mappings
    const edges: OutcomeEdge[] = mappings.map(mapping => ({
      source: mapping.programOutcomeId,
      target: mapping.courseId,
      strength: mapping.mappingStrength,
      label: mapping.mappingStrength
    }));

    // Calculate statistics
    const statistics = this.calculateMappingStatistics(programOutcomes, mappings, courses);

    return {
      nodes,
      edges,
      statistics
    };
  }

  /**
   * Calculate mapping statistics
   */
  private calculateMappingStatistics(
    outcomes: LearningOutcome[],
    mappings: any[],
    courses: any[]
  ): MappingStatistics {
    const totalOutcomes = outcomes.length;
    const totalCourses = courses.length;
    const totalMappings = mappings.length;

    const outcomesWithMappings = new Set(mappings.map(m => m.programOutcomeId)).size;
    const coursesWithMappings = new Set(mappings.map(m => m.courseId)).size;

    const averageMappingsPerOutcome = totalOutcomes > 0 ? totalMappings / totalOutcomes : 0;
    const averageMappingsPerCourse = totalCourses > 0 ? totalMappings / totalCourses : 0;

    const coveragePercentage = totalOutcomes > 0
      ? (outcomesWithMappings / totalOutcomes) * 100
      : 0;

    return {
      totalOutcomes,
      totalCourses,
      totalMappings,
      outcomesWithMappings,
      coursesWithMappings,
      averageMappingsPerOutcome,
      averageMappingsPerCourse,
      coveragePercentage
    };
  }

  /**
   * Export accreditation report to various formats
   */
  async exportAccreditationReport(
    report: AccreditationReport,
    format: 'PDF' | 'EXCEL' | 'JSON'
  ): Promise<string> {
    // Implementation would generate the report in the specified format
    // Return URL or file path to the generated report
    return `reports/accreditation_${report.programId}_${Date.now()}.${format.toLowerCase()}`;
  }

  /**
   * Get student outcome achievement summary
   */
  async getStudentOutcomeAchievements(
    studentId: string,
    programId: string
  ): Promise<{
    studentId: string;
    programId: string;
    achievements: OutcomeAchievement[];
    completionPercentage: number;
    overallAchievementLevel: AchievementLevel;
  }> {
    const programOutcomes = await this.learningOutcomeService.getProgramOutcomes(programId);
    
    // Get all achievements for this student in this program
    const achievements: OutcomeAchievement[] = [];
    // Query from database - placeholder

    const completionPercentage = programOutcomes.length > 0
      ? (achievements.length / programOutcomes.length) * 100
      : 0;

    // Calculate overall achievement level
    const averageScore = achievements.length > 0
      ? achievements.reduce((sum, a) => sum + a.assessmentScore, 0) / achievements.length
      : 0;

    const overallAchievementLevel = this.determineAchievementLevel(averageScore);

    return {
      studentId,
      programId,
      achievements,
      completionPercentage,
      overallAchievementLevel
    };
  }
}

// ============================================================================
// Supporting Types
// ============================================================================

interface OutcomeNode {
  id: string;
  label: string;
  description: string;
  type: 'program-outcome' | 'course' | 'course-outcome';
  level: number;
}

interface OutcomeEdge {
  source: string;
  target: string;
  strength: string;
  label: string;
}

interface MappingStatistics {
  totalOutcomes: number;
  totalCourses: number;
  totalMappings: number;
  outcomesWithMappings: number;
  coursesWithMappings: number;
  averageMappingsPerOutcome: number;
  averageMappingsPerCourse: number;
  coveragePercentage: number;
}
