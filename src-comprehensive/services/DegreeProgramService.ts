/**
 * ScrollUniversity Degree Program Service
 * Main orchestration service for degree program architecture
 */

import {
  DegreeProgram,
  DegreeType,
  StudentDegreeProgress,
  GraduationValidationResult,
  ScrollCertifiedDiploma,
  CurriculumMapping,
  RequirementStatus,
  GraduationStatus
} from '../types/degree';
import { DegreeTemplateService } from './DegreeTemplateService';
import { CurriculumMappingService } from './CurriculumMappingService';
import { GraduationValidationService } from './GraduationValidationService';
import { ScrollCertifiedDiplomaService } from './ScrollCertifiedDiplomaService';

export interface DegreeProgramStats {
  totalPrograms: number;
  activePrograms: number;
  totalStudents: number;
  graduatedStudents: number;
  programDistribution: Record<DegreeType, number>;
  averageCompletionTime: Record<DegreeType, number>;
  graduationRates: Record<DegreeType, number>;
}

export interface StudentEnrollmentRequest {
  studentId: string;
  degreeType: DegreeType;
  expectedGraduationDate: Date;
  transferCredits?: number;
  specialAccommodations?: string[];
}

export interface DegreeProgressUpdate {
  studentId: string;
  degreeId: string;
  requirementId: string;
  status: RequirementStatus;
  creditsEarned?: number;
  grade?: number;
  completedAt?: Date;
}

export class DegreeProgramService {
  private degreeTemplateService: DegreeTemplateService;
  private curriculumMappingService: CurriculumMappingService;
  private graduationValidationService: GraduationValidationService;
  private diplomaService: ScrollCertifiedDiplomaService;

  constructor() {
    this.degreeTemplateService = new DegreeTemplateService();
    this.curriculumMappingService = new CurriculumMappingService();
    this.graduationValidationService = new GraduationValidationService();
    this.diplomaService = new ScrollCertifiedDiplomaService();
  }

  /**
   * Get all available degree programs
   */
  public getAllDegreePrograms(): DegreeProgram[] {
    return this.degreeTemplateService.getAllDegreeTemplates();
  }

  /**
   * Get specific degree program by type
   */
  public getDegreeProgram(degreeType: DegreeType): DegreeProgram {
    return this.degreeTemplateService.getDegreeTemplate(degreeType);
  }

  /**
   * Enroll student in degree program
   */
  public async enrollStudentInDegree(request: StudentEnrollmentRequest): Promise<StudentDegreeProgress> {
    const degreeProgram = this.getDegreeProgram(request.degreeType);
    
    // Create initial student progress
    const studentProgress: StudentDegreeProgress = {
      id: `progress-${request.studentId}-${degreeProgram.id}`,
      studentId: request.studentId,
      degreeId: degreeProgram.id,
      enrollmentDate: new Date(),
      expectedGraduationDate: request.expectedGraduationDate,
      status: GraduationStatus.ENROLLED,
      overallGPA: 0.0,
      creditsCompleted: request.transferCredits || 0,
      creditsRemaining: degreeProgram.totalCredits - (request.transferCredits || 0),
      requirementProgress: this.initializeRequirementProgress(degreeProgram),
      spiritualFormationProgress: this.initializeSpiritualFormationProgress(degreeProgram),
      practicalApplicationProgress: this.initializePracticalApplicationProgress(degreeProgram),
      propheticIntegrationProgress: this.initializePropheticIntegrationProgress(degreeProgram),
      lastUpdated: new Date()
    };

    // Store in database
    await this.storeStudentProgress(studentProgress);

    return studentProgress;
  }

  /**
   * Update student degree progress
   */
  public async updateStudentProgress(update: DegreeProgressUpdate): Promise<StudentDegreeProgress> {
    const studentProgress = await this.getStudentProgress(update.studentId, update.degreeId);
    
    // Update specific requirement progress
    const requirementProgress = studentProgress.requirementProgress.find(
      rp => rp.requirementId === update.requirementId
    );

    if (requirementProgress) {
      requirementProgress.status = update.status;
      if (update.creditsEarned) {
        requirementProgress.creditsEarned = update.creditsEarned;
      }
      if (update.grade) {
        requirementProgress.grade = update.grade;
      }
      if (update.completedAt) {
        requirementProgress.completedAt = update.completedAt;
      }
    }

    // Recalculate overall progress
    this.recalculateOverallProgress(studentProgress);

    // Update graduation status if eligible
    const validationResult = this.graduationValidationService.validateGraduationEligibility(studentProgress);
    if (validationResult.isEligible) {
      studentProgress.status = GraduationStatus.ELIGIBLE;
    }

    studentProgress.lastUpdated = new Date();

    // Store updated progress
    await this.storeStudentProgress(studentProgress);

    return studentProgress;
  }

  /**
   * Get student degree progress
   */
  public async getStudentProgress(studentId: string, degreeId: string): Promise<StudentDegreeProgress> {
    // This would fetch from database
    return await this.fetchStudentProgress(studentId, degreeId);
  }

  /**
   * Get curriculum mapping for degree
   */
  public getCurriculumMapping(degreeType: DegreeType): CurriculumMapping[] {
    return this.curriculumMappingService.getCurriculumMapping(degreeType);
  }

  /**
   * Validate graduation eligibility
   */
  public validateGraduation(studentProgress: StudentDegreeProgress): GraduationValidationResult {
    return this.graduationValidationService.validateGraduationEligibility(studentProgress);
  }

  /**
   * Generate diploma for graduating student
   */
  public async generateDiploma(studentId: string, degreeId: string): Promise<ScrollCertifiedDiploma> {
    const studentProgress = await this.getStudentProgress(studentId, degreeId);
    const validationResult = this.validateGraduation(studentProgress);

    if (!validationResult.isEligible) {
      throw new Error(`Student is not eligible for graduation: ${validationResult.missingRequirements.join(', ')}`);
    }

    // Create diploma generation request
    const diplomaRequest = {
      studentId,
      degreeId,
      graduationDate: new Date(),
      finalGPA: studentProgress.overallGPA,
      spiritualFormationLevel: this.calculateSpiritualFormationLevel(studentProgress),
      practicalAchievements: this.extractPracticalAchievements(studentProgress),
      propheticIntegrationScore: studentProgress.propheticIntegrationProgress.kingdomImpactScore,
      kingdomImpactLevel: this.calculateKingdomImpactLevel(studentProgress),
      propheticGiftsManifested: this.extractPropheticGifts(studentProgress),
      callingClarity: this.calculateCallingClarity(studentProgress)
    };

    const diploma = await this.diplomaService.generateDiploma(diplomaRequest);

    // Update student status to graduated
    studentProgress.status = GraduationStatus.GRADUATED;
    studentProgress.actualGraduationDate = new Date();
    await this.storeStudentProgress(studentProgress);

    return diploma;
  }

  /**
   * Get recommended courses for student
   */
  public getRecommendedCourses(studentProgress: StudentDegreeProgress): any[] {
    return this.curriculumMappingService.getNextRecommendedCourses(
      studentProgress.degreeId as DegreeType,
      studentProgress,
      5
    );
  }

  /**
   * Get degree program statistics
   */
  public async getDegreeProgramStats(): Promise<DegreeProgramStats> {
    const allPrograms = this.getAllDegreePrograms();
    const activePrograms = allPrograms.filter(p => p.isActive);

    // These would be calculated from database queries
    const stats: DegreeProgramStats = {
      totalPrograms: allPrograms.length,
      activePrograms: activePrograms.length,
      totalStudents: await this.getTotalStudentCount(),
      graduatedStudents: await this.getGraduatedStudentCount(),
      programDistribution: await this.getProgramDistribution(),
      averageCompletionTime: await this.getAverageCompletionTimes(),
      graduationRates: await this.getGraduationRates()
    };

    return stats;
  }

  /**
   * Search degree programs by criteria
   */
  public searchDegreePrograms(criteria: {
    degreeType?: DegreeType;
    minCredits?: number;
    maxCredits?: number;
    maxDuration?: number;
    spiritualFormationHours?: number;
  }): DegreeProgram[] {
    let programs = this.getAllDegreePrograms();

    if (criteria.degreeType) {
      programs = programs.filter(p => p.type === criteria.degreeType);
    }

    if (criteria.minCredits) {
      programs = programs.filter(p => p.totalCredits >= criteria.minCredits);
    }

    if (criteria.maxCredits) {
      programs = programs.filter(p => p.totalCredits <= criteria.maxCredits);
    }

    if (criteria.maxDuration) {
      programs = programs.filter(p => p.estimatedDuration <= criteria.maxDuration);
    }

    if (criteria.spiritualFormationHours) {
      programs = programs.filter(p => p.spiritualFormationHours >= criteria.spiritualFormationHours);
    }

    return programs;
  }

  /**
   * Validate degree program curriculum
   */
  public validateDegreeCurriculum(degreeType: DegreeType): any {
    return this.curriculumMappingService.validateCurriculumMapping(degreeType);
  }

  /**
   * Get graduation timeline for student
   */
  public getGraduationTimeline(studentProgress: StudentDegreeProgress): any {
    return this.graduationValidationService.trackGraduationProgress(studentProgress);
  }

  // Private helper methods

  private initializeRequirementProgress(degreeProgram: DegreeProgram): any[] {
    return degreeProgram.requirements.map(req => ({
      requirementId: req.id,
      status: RequirementStatus.NOT_STARTED,
      creditsEarned: 0,
      creditsRequired: req.credits,
      completedCourseIds: [],
      currentCourseIds: []
    }));
  }

  private initializeSpiritualFormationProgress(degreeProgram: DegreeProgram): any {
    return {
      totalHoursCompleted: 0,
      totalHoursRequired: degreeProgram.spiritualFormationHours,
      componentProgress: degreeProgram.spiritualFormationTrack.components.map(comp => ({
        componentId: comp.id,
        hoursCompleted: 0,
        hoursRequired: comp.requiredHours,
        activitiesCompleted: [],
        assessmentScores: []
      })),
      currentLevel: { level: 1, title: 'Beginning', description: 'Starting spiritual formation journey', requirements: [] },
      assessments: []
    };
  }

  private initializePracticalApplicationProgress(degreeProgram: DegreeProgram): any {
    return {
      totalHoursCompleted: 0,
      totalHoursRequired: degreeProgram.practicalApplicationHours,
      componentProgress: degreeProgram.practicalApplicationTrack.components.map(comp => ({
        componentId: comp.id,
        hoursCompleted: 0,
        hoursRequired: comp.requiredHours,
        deliverablesCompleted: [],
        assessmentScores: []
      })),
      projects: []
    };
  }

  private initializePropheticIntegrationProgress(degreeProgram: DegreeProgram): any {
    return {
      componentsCompleted: [],
      componentsRequired: degreeProgram.propheticIntegrationTrack.requiredComponents.map(c => c.id),
      integrationAssessments: [],
      kingdomImpactScore: 0
    };
  }

  private recalculateOverallProgress(studentProgress: StudentDegreeProgress): void {
    // Recalculate credits completed
    const completedCredits = studentProgress.requirementProgress
      .filter(rp => rp.status === RequirementStatus.COMPLETED)
      .reduce((sum, rp) => sum + rp.creditsEarned, 0);

    studentProgress.creditsCompleted = completedCredits;
    studentProgress.creditsRemaining = Math.max(0, 
      studentProgress.creditsCompleted + studentProgress.creditsRemaining - completedCredits
    );

    // Recalculate GPA
    const gradedRequirements = studentProgress.requirementProgress.filter(rp => rp.grade && rp.grade > 0);
    if (gradedRequirements.length > 0) {
      const totalGradePoints = gradedRequirements.reduce((sum, rp) => sum + (rp.grade! * rp.creditsEarned), 0);
      const totalCredits = gradedRequirements.reduce((sum, rp) => sum + rp.creditsEarned, 0);
      studentProgress.overallGPA = totalCredits > 0 ? totalGradePoints / totalCredits : 0;
    }
  }

  private calculateSpiritualFormationLevel(studentProgress: StudentDegreeProgress): number {
    const progress = studentProgress.spiritualFormationProgress;
    return (progress.totalHoursCompleted / progress.totalHoursRequired) * 100;
  }

  private extractPracticalAchievements(studentProgress: StudentDegreeProgress): string[] {
    return studentProgress.practicalApplicationProgress.projects
      .filter((project: any) => project.status === 'COMPLETED')
      .map((project: any) => project.title);
  }

  private calculateKingdomImpactLevel(studentProgress: StudentDegreeProgress): string {
    const score = studentProgress.propheticIntegrationProgress.kingdomImpactScore;
    if (score >= 90) return 'Exceptional';
    if (score >= 80) return 'High';
    if (score >= 70) return 'Good';
    if (score >= 60) return 'Satisfactory';
    return 'Developing';
  }

  private extractPropheticGifts(studentProgress: StudentDegreeProgress): string[] {
    // Extract from spiritual formation assessments
    return studentProgress.spiritualFormationProgress.assessments
      .flatMap((assessment: any) => assessment.propheticGifts || []);
  }

  private calculateCallingClarity(studentProgress: StudentDegreeProgress): string {
    const spiritualLevel = this.calculateSpiritualFormationLevel(studentProgress);
    if (spiritualLevel >= 90) return 'Crystal Clear';
    if (spiritualLevel >= 80) return 'Very Clear';
    if (spiritualLevel >= 70) return 'Clear';
    if (spiritualLevel >= 60) return 'Emerging';
    return 'Seeking';
  }

  // Mock database methods
  private async storeStudentProgress(progress: StudentDegreeProgress): Promise<void> {
    // Mock implementation - would store in database
  }

  private async fetchStudentProgress(studentId: string, degreeId: string): Promise<StudentDegreeProgress> {
    // Mock implementation - would fetch from database
    throw new Error('Student progress not found');
  }

  private async getTotalStudentCount(): Promise<number> {
    // Mock implementation
    return 1000;
  }

  private async getGraduatedStudentCount(): Promise<number> {
    // Mock implementation
    return 150;
  }

  private async getProgramDistribution(): Promise<Record<DegreeType, number>> {
    // Mock implementation
    return {
      [DegreeType.BA_PROPHETIC_GOVERNANCE]: 300,
      [DegreeType.BSC_SACRED_AI_ENGINEERING]: 400,
      [DegreeType.MDIV_SCROLL_THEOLOGY]: 200,
      [DegreeType.MBA_SCROLL_ECONOMY]: 100
    };
  }

  private async getAverageCompletionTimes(): Promise<Record<DegreeType, number>> {
    // Mock implementation - in months
    return {
      [DegreeType.BA_PROPHETIC_GOVERNANCE]: 46,
      [DegreeType.BSC_SACRED_AI_ENGINEERING]: 50,
      [DegreeType.MDIV_SCROLL_THEOLOGY]: 38,
      [DegreeType.MBA_SCROLL_ECONOMY]: 26
    };
  }

  private async getGraduationRates(): Promise<Record<DegreeType, number>> {
    // Mock implementation - percentage
    return {
      [DegreeType.BA_PROPHETIC_GOVERNANCE]: 85,
      [DegreeType.BSC_SACRED_AI_ENGINEERING]: 88,
      [DegreeType.MDIV_SCROLL_THEOLOGY]: 92,
      [DegreeType.MBA_SCROLL_ECONOMY]: 90
    };
  }
}