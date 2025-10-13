/**
 * ScrollUniversity Graduation Requirements Tracking and Validation Service
 * Tracks student progress and validates graduation eligibility
 */

import {
  StudentDegreeProgress,
  GraduationValidationResult,
  RequirementStatus,
  GraduationStatus,
  DegreeProgram,
  DegreeType,
  SpiritualFormationProgress,
  PracticalApplicationProgress,
  PropheticIntegrationProgress,
  RequirementProgress
} from '../types/degree';
import { DegreeTemplateService } from './DegreeTemplateService';
import { CurriculumMappingService } from './CurriculumMappingService';

export interface GraduationCheckpoint {
  id: string;
  studentId: string;
  degreeId: string;
  checkpointType: CheckpointType;
  status: CheckpointStatus;
  completedAt?: Date;
  validatedBy?: string;
  notes?: string;
}

export enum CheckpointType {
  ACADEMIC_REQUIREMENTS = 'ACADEMIC_REQUIREMENTS',
  GPA_REQUIREMENT = 'GPA_REQUIREMENT',
  SPIRITUAL_FORMATION = 'SPIRITUAL_FORMATION',
  PRACTICAL_APPLICATION = 'PRACTICAL_APPLICATION',
  PROPHETIC_INTEGRATION = 'PROPHETIC_INTEGRATION',
  CAPSTONE_PROJECT = 'CAPSTONE_PROJECT',
  FINAL_REVIEW = 'FINAL_REVIEW'
}

export enum CheckpointStatus {
  NOT_STARTED = 'NOT_STARTED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  NEEDS_REVIEW = 'NEEDS_REVIEW',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED'
}

export interface GraduationTimeline {
  studentId: string;
  degreeId: string;
  enrollmentDate: Date;
  expectedGraduationDate: Date;
  currentSemester: number;
  totalSemesters: number;
  milestones: GraduationMilestone[];
  isOnTrack: boolean;
  delayReasons?: string[];
}

export interface GraduationMilestone {
  id: string;
  title: string;
  description: string;
  targetDate: Date;
  actualDate?: Date;
  status: MilestoneStatus;
  requirements: string[];
}

export enum MilestoneStatus {
  UPCOMING = 'UPCOMING',
  CURRENT = 'CURRENT',
  COMPLETED = 'COMPLETED',
  OVERDUE = 'OVERDUE',
  CANCELLED = 'CANCELLED'
}

export class GraduationValidationService {
  private degreeTemplateService: DegreeTemplateService;
  private curriculumMappingService: CurriculumMappingService;

  constructor() {
    this.degreeTemplateService = new DegreeTemplateService();
    this.curriculumMappingService = new CurriculumMappingService();
  }

  /**
   * Validate if student is eligible for graduation
   */
  public validateGraduationEligibility(studentProgress: StudentDegreeProgress): GraduationValidationResult {
    const degreeProgram = this.degreeTemplateService.getDegreeTemplate(studentProgress.degreeId as DegreeType);
    
    const result: GraduationValidationResult = {
      isEligible: true,
      requirementsMet: true,
      gpaRequirementMet: true,
      spiritualFormationComplete: true,
      practicalApplicationComplete: true,
      propheticIntegrationComplete: true,
      missingRequirements: [],
      warnings: [],
      recommendedActions: []
    };

    // Check academic requirements
    const academicCheck = this.validateAcademicRequirements(degreeProgram, studentProgress);
    if (!academicCheck.isValid) {
      result.requirementsMet = false;
      result.isEligible = false;
      result.missingRequirements.push(...academicCheck.missingRequirements);
    }

    // Check GPA requirement
    const gpaCheck = this.validateGPARequirement(degreeProgram, studentProgress);
    if (!gpaCheck.isValid) {
      result.gpaRequirementMet = false;
      result.isEligible = false;
      result.missingRequirements.push(gpaCheck.message);
    }

    // Check spiritual formation
    const spiritualCheck = this.validateSpiritualFormation(degreeProgram, studentProgress);
    if (!spiritualCheck.isValid) {
      result.spiritualFormationComplete = false;
      result.isEligible = false;
      result.missingRequirements.push(...spiritualCheck.missingComponents);
    }

    // Check practical application
    const practicalCheck = this.validatePracticalApplication(degreeProgram, studentProgress);
    if (!practicalCheck.isValid) {
      result.practicalApplicationComplete = false;
      result.isEligible = false;
      result.missingRequirements.push(...practicalCheck.missingComponents);
    }

    // Check prophetic integration
    const propheticCheck = this.validatePropheticIntegration(degreeProgram, studentProgress);
    if (!propheticCheck.isValid) {
      result.propheticIntegrationComplete = false;
      result.isEligible = false;
      result.missingRequirements.push(...propheticCheck.missingComponents);
    }

    // Add warnings and recommendations
    this.addWarningsAndRecommendations(result, degreeProgram, studentProgress);

    return result;
  }

  /**
   * Track student progress towards graduation
   */
  public trackGraduationProgress(studentProgress: StudentDegreeProgress): GraduationTimeline {
    const degreeProgram = this.degreeTemplateService.getDegreeTemplate(studentProgress.degreeId as DegreeType);
    const totalSemesters = Math.ceil(degreeProgram.estimatedDuration / 4); // Convert months to semesters
    
    const timeline: GraduationTimeline = {
      studentId: studentProgress.studentId,
      degreeId: studentProgress.degreeId,
      enrollmentDate: studentProgress.enrollmentDate,
      expectedGraduationDate: studentProgress.expectedGraduationDate,
      currentSemester: this.calculateCurrentSemester(studentProgress),
      totalSemesters,
      milestones: this.generateGraduationMilestones(degreeProgram, studentProgress),
      isOnTrack: this.isStudentOnTrack(studentProgress),
      delayReasons: this.identifyDelayReasons(studentProgress)
    };

    return timeline;
  }

  /**
   * Get graduation checkpoints for a student
   */
  public getGraduationCheckpoints(studentProgress: StudentDegreeProgress): GraduationCheckpoint[] {
    const checkpoints: GraduationCheckpoint[] = [];
    const degreeProgram = this.degreeTemplateService.getDegreeTemplate(studentProgress.degreeId as DegreeType);

    // Academic requirements checkpoint
    checkpoints.push({
      id: `${studentProgress.studentId}-academic`,
      studentId: studentProgress.studentId,
      degreeId: studentProgress.degreeId,
      checkpointType: CheckpointType.ACADEMIC_REQUIREMENTS,
      status: this.getAcademicRequirementsStatus(degreeProgram, studentProgress)
    });

    // GPA requirement checkpoint
    checkpoints.push({
      id: `${studentProgress.studentId}-gpa`,
      studentId: studentProgress.studentId,
      degreeId: studentProgress.degreeId,
      checkpointType: CheckpointType.GPA_REQUIREMENT,
      status: this.getGPARequirementStatus(degreeProgram, studentProgress)
    });

    // Spiritual formation checkpoint
    checkpoints.push({
      id: `${studentProgress.studentId}-spiritual`,
      studentId: studentProgress.studentId,
      degreeId: studentProgress.degreeId,
      checkpointType: CheckpointType.SPIRITUAL_FORMATION,
      status: this.getSpiritualFormationStatus(degreeProgram, studentProgress)
    });

    // Practical application checkpoint
    checkpoints.push({
      id: `${studentProgress.studentId}-practical`,
      studentId: studentProgress.studentId,
      degreeId: studentProgress.degreeId,
      checkpointType: CheckpointType.PRACTICAL_APPLICATION,
      status: this.getPracticalApplicationStatus(degreeProgram, studentProgress)
    });

    // Prophetic integration checkpoint
    checkpoints.push({
      id: `${studentProgress.studentId}-prophetic`,
      studentId: studentProgress.studentId,
      degreeId: studentProgress.degreeId,
      checkpointType: CheckpointType.PROPHETIC_INTEGRATION,
      status: this.getPropheticIntegrationStatus(degreeProgram, studentProgress)
    });

    return checkpoints;
  }

  /**
   * Calculate time to graduation
   */
  public calculateTimeToGraduation(studentProgress: StudentDegreeProgress): {
    estimatedMonths: number;
    estimatedSemesters: number;
    factors: string[];
  } {
    const degreeProgram = this.degreeTemplateService.getDegreeTemplate(studentProgress.degreeId as DegreeType);
    const completionPercentage = this.curriculumMappingService.calculateCompletionPercentage(studentProgress);
    
    let estimatedMonths = degreeProgram.estimatedDuration * (1 - completionPercentage / 100);
    const factors: string[] = [];

    // Adjust based on current progress rate
    const monthsEnrolled = this.getMonthsEnrolled(studentProgress);
    const progressRate = completionPercentage / monthsEnrolled;
    
    if (progressRate < 2) { // Less than 2% per month
      estimatedMonths *= 1.5;
      factors.push('Below average progress rate');
    } else if (progressRate > 4) { // More than 4% per month
      estimatedMonths *= 0.8;
      factors.push('Above average progress rate');
    }

    // Adjust for missing spiritual formation
    const spiritualProgress = studentProgress.spiritualFormationProgress.totalHoursCompleted / 
                             studentProgress.spiritualFormationProgress.totalHoursRequired;
    if (spiritualProgress < 0.5) {
      estimatedMonths += 3;
      factors.push('Spiritual formation requirements need attention');
    }

    // Adjust for missing practical application
    const practicalProgress = studentProgress.practicalApplicationProgress.totalHoursCompleted / 
                             studentProgress.practicalApplicationProgress.totalHoursRequired;
    if (practicalProgress < 0.5) {
      estimatedMonths += 4;
      factors.push('Practical application requirements need attention');
    }

    return {
      estimatedMonths: Math.ceil(estimatedMonths),
      estimatedSemesters: Math.ceil(estimatedMonths / 4),
      factors
    };
  }

  /**
   * Generate graduation readiness report
   */
  public generateGraduationReadinessReport(studentProgress: StudentDegreeProgress): {
    overallReadiness: number;
    academicReadiness: number;
    spiritualReadiness: number;
    practicalReadiness: number;
    propheticReadiness: number;
    recommendations: string[];
    nextSteps: string[];
  } {
    const degreeProgram = this.degreeTemplateService.getDegreeTemplate(studentProgress.degreeId as DegreeType);
    
    // Calculate readiness scores (0-100)
    const academicReadiness = this.calculateAcademicReadiness(degreeProgram, studentProgress);
    const spiritualReadiness = this.calculateSpiritualReadiness(degreeProgram, studentProgress);
    const practicalReadiness = this.calculatePracticalReadiness(degreeProgram, studentProgress);
    const propheticReadiness = this.calculatePropheticReadiness(degreeProgram, studentProgress);
    
    const overallReadiness = (academicReadiness + spiritualReadiness + practicalReadiness + propheticReadiness) / 4;

    const recommendations: string[] = [];
    const nextSteps: string[] = [];

    // Generate recommendations based on readiness scores
    if (academicReadiness < 80) {
      recommendations.push('Focus on completing remaining academic requirements');
      nextSteps.push('Enroll in missing core courses');
    }

    if (spiritualReadiness < 80) {
      recommendations.push('Increase spiritual formation activities');
      nextSteps.push('Schedule regular spiritual formation sessions');
    }

    if (practicalReadiness < 80) {
      recommendations.push('Complete practical application projects');
      nextSteps.push('Begin or continue practical application work');
    }

    if (propheticReadiness < 80) {
      recommendations.push('Deepen prophetic integration understanding');
      nextSteps.push('Work with prophetic mentor on integration assignments');
    }

    return {
      overallReadiness: Math.round(overallReadiness),
      academicReadiness: Math.round(academicReadiness),
      spiritualReadiness: Math.round(spiritualReadiness),
      practicalReadiness: Math.round(practicalReadiness),
      propheticReadiness: Math.round(propheticReadiness),
      recommendations,
      nextSteps
    };
  }

  // Private helper methods

  private validateAcademicRequirements(degreeProgram: DegreeProgram, studentProgress: StudentDegreeProgress): {
    isValid: boolean;
    missingRequirements: string[];
  } {
    const missingRequirements: string[] = [];

    for (const requirement of degreeProgram.requirements) {
      const progress = studentProgress.requirementProgress.find(rp => rp.requirementId === requirement.id);
      
      if (requirement.isRequired && (!progress || progress.status !== RequirementStatus.COMPLETED)) {
        missingRequirements.push(`${requirement.title} (${requirement.credits} credits)`);
      }
    }

    // Check total credits
    if (studentProgress.creditsCompleted < degreeProgram.totalCredits) {
      const missingCredits = degreeProgram.totalCredits - studentProgress.creditsCompleted;
      missingRequirements.push(`${missingCredits} additional credits needed`);
    }

    return {
      isValid: missingRequirements.length === 0,
      missingRequirements
    };
  }

  private validateGPARequirement(degreeProgram: DegreeProgram, studentProgress: StudentDegreeProgress): {
    isValid: boolean;
    message: string;
  } {
    const isValid = studentProgress.overallGPA >= degreeProgram.minimumGPA;
    const message = isValid ? '' : `GPA ${studentProgress.overallGPA} is below minimum requirement of ${degreeProgram.minimumGPA}`;
    
    return { isValid, message };
  }

  private validateSpiritualFormation(degreeProgram: DegreeProgram, studentProgress: StudentDegreeProgress): {
    isValid: boolean;
    missingComponents: string[];
  } {
    const missingComponents: string[] = [];
    const spiritualProgress = studentProgress.spiritualFormationProgress;

    // Check total hours
    if (spiritualProgress.totalHoursCompleted < spiritualProgress.totalHoursRequired) {
      const missingHours = spiritualProgress.totalHoursRequired - spiritualProgress.totalHoursCompleted;
      missingComponents.push(`${missingHours} spiritual formation hours remaining`);
    }

    // Check individual components
    for (const componentProgress of spiritualProgress.componentProgress) {
      if (componentProgress.hoursCompleted < componentProgress.hoursRequired) {
        const missingHours = componentProgress.hoursRequired - componentProgress.hoursCompleted;
        missingComponents.push(`${missingHours} hours remaining in component ${componentProgress.componentId}`);
      }
    }

    return {
      isValid: missingComponents.length === 0,
      missingComponents
    };
  }

  private validatePracticalApplication(degreeProgram: DegreeProgram, studentProgress: StudentDegreeProgress): {
    isValid: boolean;
    missingComponents: string[];
  } {
    const missingComponents: string[] = [];
    const practicalProgress = studentProgress.practicalApplicationProgress;

    // Check total hours
    if (practicalProgress.totalHoursCompleted < practicalProgress.totalHoursRequired) {
      const missingHours = practicalProgress.totalHoursRequired - practicalProgress.totalHoursCompleted;
      missingComponents.push(`${missingHours} practical application hours remaining`);
    }

    // Check individual components
    for (const componentProgress of practicalProgress.componentProgress) {
      if (componentProgress.hoursCompleted < componentProgress.hoursRequired) {
        const missingHours = componentProgress.hoursRequired - componentProgress.hoursCompleted;
        missingComponents.push(`${missingHours} hours remaining in component ${componentProgress.componentId}`);
      }
    }

    return {
      isValid: missingComponents.length === 0,
      missingComponents
    };
  }

  private validatePropheticIntegration(degreeProgram: DegreeProgram, studentProgress: StudentDegreeProgress): {
    isValid: boolean;
    missingComponents: string[];
  } {
    const missingComponents: string[] = [];
    const propheticProgress = studentProgress.propheticIntegrationProgress;

    const requiredComponents = degreeProgram.propheticIntegrationTrack.requiredComponents.map(c => c.id);
    const completedComponents = propheticProgress.componentsCompleted;

    for (const requiredComponent of requiredComponents) {
      if (!completedComponents.includes(requiredComponent)) {
        missingComponents.push(`Prophetic integration component: ${requiredComponent}`);
      }
    }

    // Check kingdom impact score
    if (propheticProgress.kingdomImpactScore < 70) {
      missingComponents.push('Kingdom impact score below minimum threshold (70)');
    }

    return {
      isValid: missingComponents.length === 0,
      missingComponents
    };
  }

  private addWarningsAndRecommendations(
    result: GraduationValidationResult,
    degreeProgram: DegreeProgram,
    studentProgress: StudentDegreeProgress
  ): void {
    // Add warnings for borderline cases
    if (studentProgress.overallGPA < degreeProgram.minimumGPA + 0.2) {
      result.warnings.push('GPA is close to minimum requirement - consider improving grades');
    }

    // Add recommendations
    if (result.missingRequirements.length > 0) {
      result.recommendedActions.push('Complete all missing requirements before applying for graduation');
    }

    if (!result.spiritualFormationComplete) {
      result.recommendedActions.push('Schedule additional spiritual formation sessions');
    }

    if (!result.practicalApplicationComplete) {
      result.recommendedActions.push('Complete practical application projects');
    }

    if (!result.propheticIntegrationComplete) {
      result.recommendedActions.push('Work with prophetic mentor on integration requirements');
    }
  }

  private calculateCurrentSemester(studentProgress: StudentDegreeProgress): number {
    const monthsEnrolled = this.getMonthsEnrolled(studentProgress);
    return Math.ceil(monthsEnrolled / 4);
  }

  private getMonthsEnrolled(studentProgress: StudentDegreeProgress): number {
    const now = new Date();
    const enrollmentDate = new Date(studentProgress.enrollmentDate);
    const diffTime = Math.abs(now.getTime() - enrollmentDate.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 30)); // Convert to months
  }

  private generateGraduationMilestones(degreeProgram: DegreeProgram, studentProgress: StudentDegreeProgress): GraduationMilestone[] {
    const milestones: GraduationMilestone[] = [];
    const enrollmentDate = new Date(studentProgress.enrollmentDate);

    // Academic milestones
    milestones.push({
      id: 'academic-25',
      title: '25% Academic Requirements Complete',
      description: 'Complete 25% of required courses',
      targetDate: new Date(enrollmentDate.getTime() + (degreeProgram.estimatedDuration * 0.25 * 30 * 24 * 60 * 60 * 1000)),
      status: studentProgress.creditsCompleted / degreeProgram.totalCredits >= 0.25 ? MilestoneStatus.COMPLETED : MilestoneStatus.UPCOMING,
      requirements: ['Complete core foundation courses']
    });

    milestones.push({
      id: 'academic-50',
      title: '50% Academic Requirements Complete',
      description: 'Complete 50% of required courses',
      targetDate: new Date(enrollmentDate.getTime() + (degreeProgram.estimatedDuration * 0.5 * 30 * 24 * 60 * 60 * 1000)),
      status: studentProgress.creditsCompleted / degreeProgram.totalCredits >= 0.5 ? MilestoneStatus.COMPLETED : MilestoneStatus.UPCOMING,
      requirements: ['Complete intermediate level courses']
    });

    // Spiritual formation milestone
    milestones.push({
      id: 'spiritual-complete',
      title: 'Spiritual Formation Complete',
      description: 'Complete all spiritual formation requirements',
      targetDate: new Date(enrollmentDate.getTime() + (degreeProgram.estimatedDuration * 0.75 * 30 * 24 * 60 * 60 * 1000)),
      status: studentProgress.spiritualFormationProgress.totalHoursCompleted >= studentProgress.spiritualFormationProgress.totalHoursRequired ? 
              MilestoneStatus.COMPLETED : MilestoneStatus.UPCOMING,
      requirements: ['Complete all spiritual formation components']
    });

    // Practical application milestone
    milestones.push({
      id: 'practical-complete',
      title: 'Practical Application Complete',
      description: 'Complete all practical application requirements',
      targetDate: new Date(enrollmentDate.getTime() + (degreeProgram.estimatedDuration * 0.8 * 30 * 24 * 60 * 60 * 1000)),
      status: studentProgress.practicalApplicationProgress.totalHoursCompleted >= studentProgress.practicalApplicationProgress.totalHoursRequired ? 
              MilestoneStatus.COMPLETED : MilestoneStatus.UPCOMING,
      requirements: ['Complete all practical application projects']
    });

    // Graduation milestone
    milestones.push({
      id: 'graduation-ready',
      title: 'Graduation Ready',
      description: 'All requirements complete and ready for graduation',
      targetDate: studentProgress.expectedGraduationDate,
      status: studentProgress.status === GraduationStatus.ELIGIBLE ? MilestoneStatus.COMPLETED : MilestoneStatus.UPCOMING,
      requirements: ['All academic, spiritual, practical, and prophetic requirements complete']
    });

    return milestones;
  }

  private isStudentOnTrack(studentProgress: StudentDegreeProgress): boolean {
    const monthsEnrolled = this.getMonthsEnrolled(studentProgress);
    const expectedProgress = monthsEnrolled / (studentProgress.expectedGraduationDate.getTime() - studentProgress.enrollmentDate.getTime()) * (1000 * 60 * 60 * 24 * 30);
    const actualProgress = studentProgress.creditsCompleted / (studentProgress.creditsCompleted + studentProgress.creditsRemaining);
    
    return actualProgress >= expectedProgress * 0.9; // Allow 10% tolerance
  }

  private identifyDelayReasons(studentProgress: StudentDegreeProgress): string[] {
    const reasons: string[] = [];
    
    if (studentProgress.overallGPA < 3.0) {
      reasons.push('Low GPA requiring course retakes');
    }

    if (studentProgress.spiritualFormationProgress.totalHoursCompleted < studentProgress.spiritualFormationProgress.totalHoursRequired * 0.5) {
      reasons.push('Behind on spiritual formation requirements');
    }

    if (studentProgress.practicalApplicationProgress.totalHoursCompleted < studentProgress.practicalApplicationProgress.totalHoursRequired * 0.5) {
      reasons.push('Behind on practical application requirements');
    }

    return reasons;
  }

  // Status calculation methods
  private getAcademicRequirementsStatus(degreeProgram: DegreeProgram, studentProgress: StudentDegreeProgress): CheckpointStatus {
    const validation = this.validateAcademicRequirements(degreeProgram, studentProgress);
    return validation.isValid ? CheckpointStatus.COMPLETED : CheckpointStatus.IN_PROGRESS;
  }

  private getGPARequirementStatus(degreeProgram: DegreeProgram, studentProgress: StudentDegreeProgress): CheckpointStatus {
    const validation = this.validateGPARequirement(degreeProgram, studentProgress);
    return validation.isValid ? CheckpointStatus.COMPLETED : CheckpointStatus.IN_PROGRESS;
  }

  private getSpiritualFormationStatus(degreeProgram: DegreeProgram, studentProgress: StudentDegreeProgress): CheckpointStatus {
    const validation = this.validateSpiritualFormation(degreeProgram, studentProgress);
    return validation.isValid ? CheckpointStatus.COMPLETED : CheckpointStatus.IN_PROGRESS;
  }

  private getPracticalApplicationStatus(degreeProgram: DegreeProgram, studentProgress: StudentDegreeProgress): CheckpointStatus {
    const validation = this.validatePracticalApplication(degreeProgram, studentProgress);
    return validation.isValid ? CheckpointStatus.COMPLETED : CheckpointStatus.IN_PROGRESS;
  }

  private getPropheticIntegrationStatus(degreeProgram: DegreeProgram, studentProgress: StudentDegreeProgress): CheckpointStatus {
    const validation = this.validatePropheticIntegration(degreeProgram, studentProgress);
    return validation.isValid ? CheckpointStatus.COMPLETED : CheckpointStatus.IN_PROGRESS;
  }

  // Readiness calculation methods
  private calculateAcademicReadiness(degreeProgram: DegreeProgram, studentProgress: StudentDegreeProgress): number {
    return (studentProgress.creditsCompleted / degreeProgram.totalCredits) * 100;
  }

  private calculateSpiritualReadiness(degreeProgram: DegreeProgram, studentProgress: StudentDegreeProgress): number {
    const hoursProgress = studentProgress.spiritualFormationProgress.totalHoursCompleted / 
                         studentProgress.spiritualFormationProgress.totalHoursRequired;
    return Math.min(hoursProgress * 100, 100);
  }

  private calculatePracticalReadiness(degreeProgram: DegreeProgram, studentProgress: StudentDegreeProgress): number {
    const hoursProgress = studentProgress.practicalApplicationProgress.totalHoursCompleted / 
                         studentProgress.practicalApplicationProgress.totalHoursRequired;
    return Math.min(hoursProgress * 100, 100);
  }

  private calculatePropheticReadiness(degreeProgram: DegreeProgram, studentProgress: StudentDegreeProgress): number {
    const componentsProgress = studentProgress.propheticIntegrationProgress.componentsCompleted.length / 
                              studentProgress.propheticIntegrationProgress.componentsRequired.length;
    const impactScore = studentProgress.propheticIntegrationProgress.kingdomImpactScore;
    
    return (componentsProgress * 0.7 + impactScore / 100 * 0.3) * 100;
  }
}