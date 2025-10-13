/**
 * ValidationService - Comprehensive validation for ScrollProjectsSpec
 * Handles schema validation, business rules, and scroll-alignment verification
 */

import Ajv, { JSONSchemaType, ValidateFunction } from 'ajv';
import addFormats from 'ajv-formats';
import { 
  ScrollProjectSpec, 
  MilestoneSpec, 
  CreateProjectRequest,
  MilestoneSubmission,
  ValidationResult,
  ValidationError,
  ValidationWarning,
  ProjectStatus,
  MilestoneStage,
  ScrollField,
  ScrollAlignmentMetrics
} from '../types/scroll-projects.js';
import scrollProjectsSchema from '../schema/scroll-projects-spec.schema.json' assert { type: 'json' };

export class ValidationService {
  private ajv: Ajv;
  private projectValidator: ValidateFunction<ScrollProjectSpec>;
  private createRequestValidator: ValidateFunction<CreateProjectRequest>;
  private milestoneSubmissionValidator: ValidateFunction<MilestoneSubmission>;

  constructor() {
    this.ajv = new Ajv({ 
      allErrors: true, 
      verbose: true,
      strict: false,
      removeAdditional: true
    });
    
    addFormats(this.ajv);
    this.initializeValidators();
  }

  private initializeValidators(): void {
    // Add the main schema
    this.ajv.addSchema(scrollProjectsSchema, 'scroll-projects-spec');
    
    // Create specific validators
    this.projectValidator = this.ajv.compile<ScrollProjectSpec>(scrollProjectsSchema);
    
    this.createRequestValidator = this.ajv.compile<CreateProjectRequest>({
      $ref: 'scroll-projects-spec#/definitions/CreateProjectRequest'
    });
    
    this.milestoneSubmissionValidator = this.ajv.compile<MilestoneSubmission>({
      $ref: 'scroll-projects-spec#/definitions/MilestoneSubmission'
    });
  }

  /**
   * Validates a complete ScrollProjectSpec object
   */
  async validateProject(project: ScrollProjectSpec): Promise<ValidationResult> {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    // Schema validation
    const schemaValid = this.projectValidator(project);
    if (!schemaValid && this.projectValidator.errors) {
      errors.push(...this.convertAjvErrors(this.projectValidator.errors));
    }

    // Business rule validation
    const businessRuleErrors = await this.validateBusinessRules(project);
    errors.push(...businessRuleErrors);

    // Scroll alignment validation
    const alignmentResult = await this.validateScrollAlignment(project);
    warnings.push(...alignmentResult.warnings);
    if (alignmentResult.score < 70) {
      errors.push({
        field: 'scroll_alignment',
        message: `Project scroll alignment score (${alignmentResult.score}) is below required threshold (70)`,
        error_code: 'SCROLL_ALIGNMENT_LOW',
        severity: 'major'
      });
    }

    // Milestone consistency validation
    const milestoneErrors = this.validateMilestoneConsistency(project.milestones);
    errors.push(...milestoneErrors);

    return {
      valid: errors.length === 0,
      errors,
      warnings,
      scroll_alignment_score: alignmentResult.score
    };
  }

  /**
   * Validates a project creation request
   */
  async validateCreateProjectRequest(request: CreateProjectRequest): Promise<ValidationResult> {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    // Schema validation
    const schemaValid = this.createRequestValidator(request);
    if (!schemaValid && this.createRequestValidator.errors) {
      errors.push(...this.convertAjvErrors(this.createRequestValidator.errors));
    }

    // Scroll field validation
    if (!this.isValidScrollField(request.scroll_field)) {
      errors.push({
        field: 'scroll_field',
        message: `Invalid scroll field: ${request.scroll_field}`,
        error_code: 'INVALID_SCROLL_FIELD',
        severity: 'critical'
      });
    }

    // Content quality validation
    const contentWarnings = this.validateContentQuality(request.title, request.description);
    warnings.push(...contentWarnings);

    // Duration validation
    if (request.estimated_duration_weeks && request.estimated_duration_weeks > 26) {
      warnings.push({
        field: 'estimated_duration_weeks',
        message: 'Project duration exceeds recommended maximum of 26 weeks',
        suggestion: 'Consider breaking the project into smaller phases'
      });
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
      scroll_alignment_score: await this.estimateScrollAlignment(request)
    };
  }

  /**
   * Validates a milestone submission
   */
  async validateMilestoneSubmission(submission: MilestoneSubmission): Promise<ValidationResult> {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    // Schema validation
    const schemaValid = this.milestoneSubmissionValidator(submission);
    if (!schemaValid && this.milestoneSubmissionValidator.errors) {
      errors.push(...this.convertAjvErrors(this.milestoneSubmissionValidator.errors));
    }

    // Deliverables validation
    const deliverableErrors = this.validateDeliverables(submission.deliverables);
    errors.push(...deliverableErrors);

    // Self-assessment validation
    const assessmentWarnings = this.validateSelfAssessment(submission.self_assessment);
    warnings.push(...assessmentWarnings);

    // Evidence links validation
    const evidenceWarnings = await this.validateEvidenceLinks(submission.evidence_links);
    warnings.push(...evidenceWarnings);

    return {
      valid: errors.length === 0,
      errors,
      warnings,
      scroll_alignment_score: submission.self_assessment.scroll_alignment_confidence * 10
    };
  }

  /**
   * Validates project status transitions
   */
  validateStatusTransition(currentStatus: ProjectStatus, newStatus: ProjectStatus): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    const validTransitions: Record<ProjectStatus, ProjectStatus[]> = {
      [ProjectStatus.PROPOSAL]: [ProjectStatus.IN_PROGRESS, ProjectStatus.ARCHIVED],
      [ProjectStatus.IN_PROGRESS]: [ProjectStatus.REVIEW, ProjectStatus.PROPOSAL, ProjectStatus.ARCHIVED],
      [ProjectStatus.REVIEW]: [ProjectStatus.SUBMITTED, ProjectStatus.IN_PROGRESS, ProjectStatus.ARCHIVED],
      [ProjectStatus.SUBMITTED]: [ProjectStatus.LISTED, ProjectStatus.REVIEW, ProjectStatus.ARCHIVED],
      [ProjectStatus.LISTED]: [ProjectStatus.ARCHIVED],
      [ProjectStatus.ARCHIVED]: []
    };

    if (!validTransitions[currentStatus].includes(newStatus)) {
      errors.push({
        field: 'status',
        message: `Invalid status transition from ${currentStatus} to ${newStatus}`,
        error_code: 'INVALID_STATUS_TRANSITION',
        severity: 'critical'
      });
    }

    // Add warnings for potentially problematic transitions
    if (currentStatus === ProjectStatus.SUBMITTED && newStatus === ProjectStatus.REVIEW) {
      warnings.push({
        field: 'status',
        message: 'Moving from submitted back to review may indicate validation issues',
        suggestion: 'Ensure all feedback has been addressed before resubmission'
      });
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
      scroll_alignment_score: 100 // Status transitions don't affect alignment
    };
  }

  /**
   * Validates milestone progression requirements
   */
  validateMilestoneProgression(milestones: MilestoneSpec[], targetStage: MilestoneStage): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    const stageOrder = [MilestoneStage.PROPOSAL, MilestoneStage.PROTOTYPE, MilestoneStage.TESTING, MilestoneStage.FINAL];
    const targetIndex = stageOrder.indexOf(targetStage);

    // Check if all previous milestones are completed
    for (let i = 0; i < targetIndex; i++) {
      const milestone = milestones.find(m => m.stage === stageOrder[i]);
      if (!milestone || !milestone.completed) {
        errors.push({
          field: 'milestones',
          message: `Cannot progress to ${targetStage} - ${stageOrder[i]} milestone must be completed first`,
          error_code: 'MILESTONE_PREREQUISITE_NOT_MET',
          severity: 'critical'
        });
      }
    }

    // Check if target milestone exists and has required deliverables
    const targetMilestone = milestones.find(m => m.stage === targetStage);
    if (!targetMilestone) {
      errors.push({
        field: 'milestones',
        message: `Target milestone ${targetStage} not found`,
        error_code: 'MILESTONE_NOT_FOUND',
        severity: 'critical'
      });
    } else if (targetMilestone.required_deliverables.length === 0) {
      warnings.push({
        field: 'milestones',
        message: `Milestone ${targetStage} has no required deliverables defined`,
        suggestion: 'Define specific deliverables to ensure quality outcomes'
      });
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
      scroll_alignment_score: 100
    };
  }

  /**
   * Validates business rules specific to ScrollUniversity
   */
  private async validateBusinessRules(project: ScrollProjectSpec): Promise<ValidationError[]> {
    const errors: ValidationError[] = [];

    // Rule: Project must have exactly 4 milestones (one for each stage)
    const requiredStages = [MilestoneStage.PROPOSAL, MilestoneStage.PROTOTYPE, MilestoneStage.TESTING, MilestoneStage.FINAL];
    const projectStages = project.milestones.map(m => m.stage);
    
    for (const stage of requiredStages) {
      if (!projectStages.includes(stage)) {
        errors.push({
          field: 'milestones',
          message: `Missing required milestone stage: ${stage}`,
          error_code: 'MISSING_MILESTONE_STAGE',
          severity: 'critical'
        });
      }
    }

    // Rule: ScrollCoin earned cannot exceed maximum based on project scope
    const maxScrollCoin = this.calculateMaxScrollCoin(project.scroll_field);
    if (project.scrollcoin_earned > maxScrollCoin) {
      errors.push({
        field: 'scrollcoin_earned',
        message: `ScrollCoin earned (${project.scrollcoin_earned}) exceeds maximum for ${project.scroll_field} (${maxScrollCoin})`,
        error_code: 'SCROLLCOIN_LIMIT_EXCEEDED',
        severity: 'major'
      });
    }

    // Rule: Published projects must have integrity seal
    if (project.published && !project.integrity_seal) {
      errors.push({
        field: 'integrity_seal',
        message: 'Published projects must have an integrity seal',
        error_code: 'MISSING_INTEGRITY_SEAL',
        severity: 'critical'
      });
    }

    // Rule: Projects in LISTED status must be published
    if (project.status === ProjectStatus.LISTED && !project.published) {
      errors.push({
        field: 'published',
        message: 'Projects with LISTED status must be published',
        error_code: 'LISTED_NOT_PUBLISHED',
        severity: 'critical'
      });
    }

    return errors;
  }

  /**
   * Validates scroll alignment using multiple criteria
   */
  private async validateScrollAlignment(project: ScrollProjectSpec): Promise<{ score: number; warnings: ValidationWarning[] }> {
    const warnings: ValidationWarning[] = [];
    const metrics = await this.calculateScrollAlignmentMetrics(project);

    // Check individual alignment components
    if (metrics.theological_alignment < 60) {
      warnings.push({
        field: 'scroll_alignment',
        message: 'Low theological alignment score',
        suggestion: 'Ensure project aligns with biblical principles and scroll teachings'
      });
    }

    if (metrics.practical_application < 70) {
      warnings.push({
        field: 'scroll_alignment',
        message: 'Low practical application score',
        suggestion: 'Demonstrate clear real-world application and measurable impact'
      });
    }

    if (metrics.kingdom_impact_potential < 65) {
      warnings.push({
        field: 'scroll_alignment',
        message: 'Low kingdom impact potential',
        suggestion: 'Expand project scope to address broader kingdom building objectives'
      });
    }

    return {
      score: metrics.overall_score,
      warnings
    };
  }

  /**
   * Validates milestone consistency and completeness
   */
  private validateMilestoneConsistency(milestones: MilestoneSpec[]): ValidationError[] {
    const errors: ValidationError[] = [];

    // Check for duplicate stages
    const stages = milestones.map(m => m.stage);
    const duplicateStages = stages.filter((stage, index) => stages.indexOf(stage) !== index);
    
    if (duplicateStages.length > 0) {
      errors.push({
        field: 'milestones',
        message: `Duplicate milestone stages found: ${duplicateStages.join(', ')}`,
        error_code: 'DUPLICATE_MILESTONE_STAGES',
        severity: 'critical'
      });
    }

    // Check milestone completion logic
    milestones.forEach((milestone, index) => {
      if (milestone.completed && !milestone.submitted_at) {
        errors.push({
          field: `milestones[${index}].submitted_at`,
          message: 'Completed milestones must have a submission timestamp',
          error_code: 'MISSING_SUBMISSION_TIMESTAMP',
          severity: 'major'
        });
      }

      if (milestone.submitted_at && milestone.approved_at && milestone.submitted_at > milestone.approved_at) {
        errors.push({
          field: `milestones[${index}].approved_at`,
          message: 'Approval timestamp cannot be before submission timestamp',
          error_code: 'INVALID_APPROVAL_TIMESTAMP',
          severity: 'major'
        });
      }
    });

    return errors;
  }

  /**
   * Helper methods
   */
  private convertAjvErrors(ajvErrors: any[]): ValidationError[] {
    return ajvErrors.map(error => ({
      field: error.instancePath.replace('/', '') || error.schemaPath.split('/').pop() || 'unknown',
      message: error.message || 'Validation error',
      error_code: 'SCHEMA_VALIDATION_ERROR',
      severity: 'major' as const
    }));
  }

  private isValidScrollField(field: string): field is ScrollField {
    return Object.values(ScrollField).includes(field as ScrollField);
  }

  private validateContentQuality(title: string, description: string): ValidationWarning[] {
    const warnings: ValidationWarning[] = [];

    // Check for meaningful title
    if (title.split(' ').length < 3) {
      warnings.push({
        field: 'title',
        message: 'Title appears too brief',
        suggestion: 'Provide a more descriptive title that clearly explains the project purpose'
      });
    }

    // Check for adequate description
    if (description.length < 200) {
      warnings.push({
        field: 'description',
        message: 'Description may be too brief for comprehensive understanding',
        suggestion: 'Expand description to include objectives, methodology, and expected outcomes'
      });
    }

    // Check for scroll-related keywords
    const scrollKeywords = ['scroll', 'kingdom', 'divine', 'prophetic', 'spiritual', 'biblical'];
    const hasScrollKeywords = scrollKeywords.some(keyword => 
      title.toLowerCase().includes(keyword) || description.toLowerCase().includes(keyword)
    );

    if (!hasScrollKeywords) {
      warnings.push({
        field: 'description',
        message: 'Content may lack scroll-specific terminology',
        suggestion: 'Consider incorporating scroll principles and kingdom terminology'
      });
    }

    return warnings;
  }

  private validateDeliverables(deliverables: any[]): ValidationError[] {
    const errors: ValidationError[] = [];

    deliverables.forEach((deliverable, index) => {
      if (!deliverable.url || !this.isValidUrl(deliverable.url)) {
        errors.push({
          field: `deliverables[${index}].url`,
          message: 'Invalid or missing deliverable URL',
          error_code: 'INVALID_DELIVERABLE_URL',
          severity: 'major'
        });
      }
    });

    return errors;
  }

  private validateSelfAssessment(assessment: any): ValidationWarning[] {
    const warnings: ValidationWarning[] = [];

    if (assessment.scroll_alignment_confidence < 7) {
      warnings.push({
        field: 'self_assessment.scroll_alignment_confidence',
        message: 'Low scroll alignment confidence may indicate need for additional guidance',
        suggestion: 'Consider consulting with a scroll mentor for alignment verification'
      });
    }

    if (assessment.challenges_faced.length === 0) {
      warnings.push({
        field: 'self_assessment.challenges_faced',
        message: 'No challenges reported may indicate insufficient depth of reflection',
        suggestion: 'Reflect on difficulties encountered and lessons learned during development'
      });
    }

    return warnings;
  }

  private async validateEvidenceLinks(links: string[]): Promise<ValidationWarning[]> {
    const warnings: ValidationWarning[] = [];

    for (const link of links) {
      if (!this.isValidUrl(link)) {
        warnings.push({
          field: 'evidence_links',
          message: `Invalid evidence link format: ${link}`,
          suggestion: 'Ensure all evidence links are properly formatted URLs'
        });
      }
    }

    return warnings;
  }

  private calculateMaxScrollCoin(scrollField: ScrollField): number {
    const maxValues: Record<ScrollField, number> = {
      [ScrollField.SCROLL_MEDICINE]: 10000,
      [ScrollField.SCROLL_AI]: 8000,
      [ScrollField.SCROLL_GOVERNANCE]: 12000,
      [ScrollField.SCROLL_ECONOMY]: 9000,
      [ScrollField.SCROLL_THEOLOGY]: 7000,
      [ScrollField.SCROLL_LAW]: 11000,
      [ScrollField.SCROLL_ENGINEERING]: 8500,
      [ScrollField.SCROLL_ARTS]: 6000,
      [ScrollField.SCROLL_HEALTH]: 9500,
      [ScrollField.SCROLL_EDUCATION]: 7500
    };

    return maxValues[scrollField] || 5000;
  }

  private async calculateScrollAlignmentMetrics(project: ScrollProjectSpec): Promise<ScrollAlignmentMetrics> {
    // This would integrate with external scroll alignment services
    // For now, providing a basic implementation
    
    const theological_alignment = this.assessTheologicalAlignment(project);
    const practical_application = this.assessPracticalApplication(project);
    const kingdom_impact_potential = this.assessKingdomImpact(project);
    const innovation_factor = this.assessInnovation(project);

    const overall_score = (
      theological_alignment * 0.3 +
      practical_application * 0.3 +
      kingdom_impact_potential * 0.25 +
      innovation_factor * 0.15
    );

    return {
      theological_alignment,
      practical_application,
      kingdom_impact_potential,
      innovation_factor,
      overall_score
    };
  }

  private async estimateScrollAlignment(request: CreateProjectRequest): Promise<number> {
    // Basic estimation based on content analysis
    const scrollKeywords = ['scroll', 'kingdom', 'divine', 'prophetic', 'spiritual', 'biblical'];
    const content = `${request.title} ${request.description}`.toLowerCase();
    
    const keywordMatches = scrollKeywords.filter(keyword => content.includes(keyword)).length;
    const baseScore = Math.min(keywordMatches * 15, 75);
    
    // Adjust based on scroll field
    const fieldBonus = this.getScrollFieldBonus(request.scroll_field);
    
    return Math.min(baseScore + fieldBonus, 100);
  }

  private assessTheologicalAlignment(project: ScrollProjectSpec): number {
    // Placeholder implementation - would integrate with theological assessment service
    return 75;
  }

  private assessPracticalApplication(project: ScrollProjectSpec): number {
    // Placeholder implementation - would assess real-world applicability
    return 80;
  }

  private assessKingdomImpact(project: ScrollProjectSpec): number {
    // Placeholder implementation - would assess kingdom building potential
    return 70;
  }

  private assessInnovation(project: ScrollProjectSpec): number {
    // Placeholder implementation - would assess innovation and creativity
    return 85;
  }

  private getScrollFieldBonus(scrollField: ScrollField): number {
    const bonuses: Record<ScrollField, number> = {
      [ScrollField.SCROLL_THEOLOGY]: 25,
      [ScrollField.SCROLL_GOVERNANCE]: 20,
      [ScrollField.SCROLL_MEDICINE]: 15,
      [ScrollField.SCROLL_AI]: 10,
      [ScrollField.SCROLL_ECONOMY]: 15,
      [ScrollField.SCROLL_LAW]: 20,
      [ScrollField.SCROLL_ENGINEERING]: 10,
      [ScrollField.SCROLL_ARTS]: 15,
      [ScrollField.SCROLL_HEALTH]: 15,
      [ScrollField.SCROLL_EDUCATION]: 20
    };

    return bonuses[scrollField] || 10;
  }

  private isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }
}