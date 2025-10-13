/**
 * MilestoneService - Milestone progression and validation for ScrollProjectsSpec
 * Handles milestone submissions, feedback management, and progression logic
 */

import { v4 as uuidv4 } from 'uuid';
import {
  MilestoneSpec,
  MilestoneSubmission,
  MilestoneProgressResponse,
  MentorFeedback,
  ValidationResult,
  ValidationCriteria,
  MilestoneStage,
  FeedbackType,
  ProjectDeliverable,
  SelfAssessment
} from '../types/scroll-projects.js';
import { ValidationService } from './ValidationService.js';
import { HookService } from './HookService.js';
import { GPTIntegrationService } from './GPTIntegrationService.js';

export class MilestoneService {
  private validationService: ValidationService;
  private hookService: HookService;
  private gptService: GPTIntegrationService;

  constructor(
    validationService: ValidationService,
    hookService: HookService,
    gptService: GPTIntegrationService
  ) {
    this.validationService = validationService;
    this.hookService = hookService;
    this.gptService = gptService;
  }

  /**
   * Submits a milestone for review
   */
  async submitMilestone(
    projectId: string, 
    milestoneId: string, 
    submission: MilestoneSubmission
  ): Promise<MilestoneProgressResponse> {
    try {
      // Validate the submission
      const validationResult = await this.validationService.validateMilestoneSubmission(submission);
      if (!validationResult.valid) {
        throw new Error(`Milestone submission validation failed: ${validationResult.errors.map(e => e.message).join(', ')}`);
      }

      // Get current milestone
      const milestone = await this.getMilestone(milestoneId);
      if (!milestone) {
        throw new Error('Milestone not found');
      }

      // Check if milestone can be submitted
      const canSubmit = await this.canSubmitMilestone(projectId, milestone.stage);
      if (!canSubmit.valid) {
        throw new Error(`Cannot submit milestone: ${canSubmit.errors.map(e => e.message).join(', ')}`);
      }

      // Update milestone with submission data
      const updatedMilestone = await this.updateMilestoneWithSubmission(milestone, submission);

      // Generate GPT summary of the submission
      const gptSummary = await this.gptService.generateMilestoneSummary(updatedMilestone, submission);

      // Save updated milestone
      await this.saveMilestone(updatedMilestone);

      // Trigger milestone submission hook
      await this.hookService.executeHook('onMilestoneSubmit', {
        event_id: uuidv4(),
        event_type: 'milestone_submitted',
        project_id: projectId,
        student_id: '', // Would be retrieved from project context
        timestamp: new Date(),
        payload: { 
          milestone: updatedMilestone, 
          submission,
          gpt_summary: gptSummary
        },
        source: 'MilestoneService'
      });

      // Determine next milestone
      const nextMilestone = await this.getNextMilestone(projectId, milestone.stage);

      // Calculate overall project progress
      const overallProgress = await this.calculateProjectProgress(projectId);

      return {
        milestone: updatedMilestone,
        next_milestone: nextMilestone,
        overall_progress: overallProgress,
        gpt_summary: gptSummary,
        mentor_notification_sent: true
      };

    } catch (error) {
      throw new Error(`Milestone submission failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Validates a milestone against its criteria
   */
  async validateMilestone(milestoneId: string): Promise<ValidationResult> {
    try {
      const milestone = await this.getMilestone(milestoneId);
      if (!milestone) {
        return {
          valid: false,
          errors: [{
            field: 'milestone_id',
            message: 'Milestone not found',
            error_code: 'MILESTONE_NOT_FOUND',
            severity: 'critical'
          }],
          warnings: [],
          scroll_alignment_score: 0
        };
      }

      return await this.validateMilestoneCompleteness(milestone);
    } catch (error) {
      return {
        valid: false,
        errors: [{
          field: 'milestone',
          message: `Validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
          error_code: 'VALIDATION_ERROR',
          severity: 'critical'
        }],
        warnings: [],
        scroll_alignment_score: 0
      };
    }
  }

  /**
   * Progresses to the next milestone
   */
  async progressToNextMilestone(projectId: string): Promise<void> {
    try {
      const currentMilestone = await this.getCurrentMilestone(projectId);
      if (!currentMilestone) {
        throw new Error('No current milestone found');
      }

      // Validate current milestone is complete
      const validationResult = await this.validateMilestone(currentMilestone.milestone_id);
      if (!validationResult.valid) {
        throw new Error('Current milestone must be completed before progressing');
      }

      // Get next milestone
      const nextMilestone = await this.getNextMilestone(projectId, currentMilestone.stage);
      if (!nextMilestone) {
        throw new Error('No next milestone available');
      }

      // Activate next milestone
      await this.activateMilestone(nextMilestone.milestone_id);

      // Trigger progression hook
      await this.hookService.executeHook('onMilestoneProgression', {
        event_id: uuidv4(),
        event_type: 'milestone_progressed',
        project_id: projectId,
        student_id: '', // Would be retrieved from project context
        timestamp: new Date(),
        payload: { 
          completed_milestone: currentMilestone,
          next_milestone: nextMilestone
        },
        source: 'MilestoneService'
      });

    } catch (error) {
      throw new Error(`Milestone progression failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Gets milestone status for a project
   */
  async getMilestoneStatus(projectId: string): Promise<{
    stage: MilestoneStage;
    completed: boolean;
    completion_percentage: number;
    feedback_count: number;
    last_updated: Date;
  }[]> {
    try {
      const milestones = await this.getProjectMilestones(projectId);
      
      return milestones.map(milestone => ({
        stage: milestone.stage,
        completed: milestone.completed,
        completion_percentage: milestone.completion_percentage,
        feedback_count: milestone.feedback.length,
        last_updated: milestone.submitted_at || milestone.approved_at || new Date(0)
      }));
    } catch (error) {
      console.error(`Failed to get milestone status for project ${projectId}:`, error);
      return [];
    }
  }

  /**
   * Adds mentor feedback to a milestone
   */
  async addMentorFeedback(
    milestoneId: string,
    mentorId: string,
    feedbackType: FeedbackType,
    content: string,
    actionableItems?: string[]
  ): Promise<MentorFeedback> {
    try {
      const milestone = await this.getMilestone(milestoneId);
      if (!milestone) {
        throw new Error('Milestone not found');
      }

      const feedback: MentorFeedback = {
        feedback_id: uuidv4(),
        mentor_id: mentorId,
        mentor_type: 'human', // Would be determined based on mentor type
        feedback_type: feedbackType,
        content,
        provided_at: new Date(),
        milestone_id: milestoneId,
        actionable_items: actionableItems || [],
        approval_status: feedbackType === FeedbackType.APPROVAL
      };

      // Add feedback to milestone
      milestone.feedback.push(feedback);

      // Update milestone completion status based on feedback
      if (feedbackType === FeedbackType.APPROVAL) {
        milestone.completed = true;
        milestone.approved_at = new Date();
        milestone.completion_percentage = 100;
      } else if (feedbackType === FeedbackType.REJECTION) {
        milestone.completed = false;
        milestone.completion_percentage = Math.max(0, milestone.completion_percentage - 20);
      }

      // Save updated milestone
      await this.saveMilestone(milestone);

      return feedback;
    } catch (error) {
      throw new Error(`Failed to add mentor feedback: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Updates validation criteria for a milestone
   */
  async updateValidationCriteria(
    milestoneId: string,
    criteriaId: string,
    met: boolean,
    evidence?: string
  ): Promise<void> {
    try {
      const milestone = await this.getMilestone(milestoneId);
      if (!milestone) {
        throw new Error('Milestone not found');
      }

      const criteria = milestone.validation_criteria.find(c => c.criteria_id === criteriaId);
      if (!criteria) {
        throw new Error('Validation criteria not found');
      }

      criteria.met = met;
      if (evidence) {
        criteria.evidence = evidence;
      }

      // Recalculate milestone completion percentage
      milestone.completion_percentage = this.calculateMilestoneCompletion(milestone);

      // Check if milestone is now complete
      const allRequiredMet = milestone.validation_criteria
        .filter(c => c.required)
        .every(c => c.met);

      if (allRequiredMet && !milestone.completed) {
        milestone.completed = true;
        milestone.approved_at = new Date();
      }

      await this.saveMilestone(milestone);
    } catch (error) {
      throw new Error(`Failed to update validation criteria: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Gets detailed milestone information
   */
  async getMilestoneDetails(milestoneId: string): Promise<{
    milestone: MilestoneSpec;
    deliverables_submitted: number;
    deliverables_required: number;
    criteria_met: number;
    criteria_total: number;
    recent_feedback: MentorFeedback[];
    estimated_completion_date: Date;
  } | null> {
    try {
      const milestone = await this.getMilestone(milestoneId);
      if (!milestone) {
        return null;
      }

      const recentFeedback = milestone.feedback
        .sort((a, b) => b.provided_at.getTime() - a.provided_at.getTime())
        .slice(0, 5);

      const criteriaMet = milestone.validation_criteria.filter(c => c.met).length;
      const estimatedCompletion = this.estimateCompletionDate(milestone);

      return {
        milestone,
        deliverables_submitted: 0, // Would be calculated from actual deliverables
        deliverables_required: milestone.required_deliverables.length,
        criteria_met: criteriaMet,
        criteria_total: milestone.validation_criteria.length,
        recent_feedback: recentFeedback,
        estimated_completion_date: estimatedCompletion
      };
    } catch (error) {
      console.error(`Failed to get milestone details for ${milestoneId}:`, error);
      return null;
    }
  }

  /**
   * Private helper methods
   */
  private async updateMilestoneWithSubmission(
    milestone: MilestoneSpec,
    submission: MilestoneSubmission
  ): Promise<MilestoneSpec> {
    const updatedMilestone = { ...milestone };

    // Update submission timestamp
    updatedMilestone.submitted_at = new Date();

    // Update completion percentage based on self-assessment
    updatedMilestone.completion_percentage = Math.max(
      updatedMilestone.completion_percentage,
      submission.self_assessment.completion_percentage
    );

    // Add system-generated feedback based on submission
    const systemFeedback: MentorFeedback = {
      feedback_id: uuidv4(),
      mentor_id: 'system',
      mentor_type: 'ai',
      feedback_type: FeedbackType.GUIDANCE,
      content: `Milestone submitted with ${submission.deliverables.length} deliverables. Self-assessed completion: ${submission.self_assessment.completion_percentage}%`,
      provided_at: new Date(),
      milestone_id: milestone.milestone_id,
      actionable_items: submission.self_assessment.next_steps
    };

    updatedMilestone.feedback.push(systemFeedback);

    return updatedMilestone;
  }

  private async canSubmitMilestone(projectId: string, stage: MilestoneStage): Promise<ValidationResult> {
    const errors: any[] = [];
    const warnings: any[] = [];

    // Check if previous milestones are completed (except for PROPOSAL)
    if (stage !== MilestoneStage.PROPOSAL) {
      const milestones = await this.getProjectMilestones(projectId);
      const stageOrder = [MilestoneStage.PROPOSAL, MilestoneStage.PROTOTYPE, MilestoneStage.TESTING, MilestoneStage.FINAL];
      const currentIndex = stageOrder.indexOf(stage);

      for (let i = 0; i < currentIndex; i++) {
        const previousMilestone = milestones.find(m => m.stage === stageOrder[i]);
        if (!previousMilestone || !previousMilestone.completed) {
          errors.push({
            field: 'milestone_progression',
            message: `Previous milestone ${stageOrder[i]} must be completed before submitting ${stage}`,
            error_code: 'PREREQUISITE_NOT_MET',
            severity: 'critical'
          });
        }
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
      scroll_alignment_score: 100
    };
  }

  private async validateMilestoneCompleteness(milestone: MilestoneSpec): Promise<ValidationResult> {
    const errors: any[] = [];
    const warnings: any[] = [];

    // Check required validation criteria
    const unmetRequiredCriteria = milestone.validation_criteria
      .filter(c => c.required && !c.met);

    if (unmetRequiredCriteria.length > 0) {
      errors.push({
        field: 'validation_criteria',
        message: `Required validation criteria not met: ${unmetRequiredCriteria.map(c => c.name).join(', ')}`,
        error_code: 'REQUIRED_CRITERIA_NOT_MET',
        severity: 'critical'
      });
    }

    // Check if milestone has been submitted
    if (!milestone.submitted_at) {
      errors.push({
        field: 'submitted_at',
        message: 'Milestone has not been submitted',
        error_code: 'NOT_SUBMITTED',
        severity: 'critical'
      });
    }

    // Check for mentor feedback
    if (milestone.feedback.length === 0) {
      warnings.push({
        field: 'feedback',
        message: 'No mentor feedback provided yet',
        suggestion: 'Consider requesting mentor review for guidance'
      });
    }

    // Calculate scroll alignment score based on criteria
    const alignmentCriteria = milestone.validation_criteria.filter(c => c.name.toLowerCase().includes('scroll'));
    const alignmentScore = alignmentCriteria.length > 0 
      ? (alignmentCriteria.filter(c => c.met).length / alignmentCriteria.length) * 100
      : 80; // Default score if no specific alignment criteria

    return {
      valid: errors.length === 0,
      errors,
      warnings,
      scroll_alignment_score: alignmentScore
    };
  }

  private calculateMilestoneCompletion(milestone: MilestoneSpec): number {
    const totalCriteria = milestone.validation_criteria.length;
    if (totalCriteria === 0) return 0;

    const weightedScore = milestone.validation_criteria.reduce((score, criteria) => {
      const weight = criteria.scroll_alignment_weight || 1;
      return score + (criteria.met ? weight : 0);
    }, 0);

    const totalWeight = milestone.validation_criteria.reduce((total, criteria) => {
      return total + (criteria.scroll_alignment_weight || 1);
    }, 0);

    return Math.round((weightedScore / totalWeight) * 100);
  }

  private async calculateProjectProgress(projectId: string): Promise<number> {
    const milestones = await this.getProjectMilestones(projectId);
    const completedMilestones = milestones.filter(m => m.completed).length;
    return (completedMilestones / milestones.length) * 100;
  }

  private async getNextMilestone(projectId: string, currentStage: MilestoneStage): Promise<MilestoneSpec | null> {
    const stageOrder = [MilestoneStage.PROPOSAL, MilestoneStage.PROTOTYPE, MilestoneStage.TESTING, MilestoneStage.FINAL];
    const currentIndex = stageOrder.indexOf(currentStage);
    
    if (currentIndex === -1 || currentIndex === stageOrder.length - 1) {
      return null; // No next milestone
    }

    const nextStage = stageOrder[currentIndex + 1];
    const milestones = await this.getProjectMilestones(projectId);
    return milestones.find(m => m.stage === nextStage) || null;
  }

  private async getCurrentMilestone(projectId: string): Promise<MilestoneSpec | null> {
    const milestones = await this.getProjectMilestones(projectId);
    
    // Find the first incomplete milestone in order
    const stageOrder = [MilestoneStage.PROPOSAL, MilestoneStage.PROTOTYPE, MilestoneStage.TESTING, MilestoneStage.FINAL];
    
    for (const stage of stageOrder) {
      const milestone = milestones.find(m => m.stage === stage);
      if (milestone && !milestone.completed) {
        return milestone;
      }
    }

    // If all milestones are complete, return the final one
    return milestones.find(m => m.stage === MilestoneStage.FINAL) || null;
  }

  private async activateMilestone(milestoneId: string): Promise<void> {
    // Placeholder - would update milestone status to active
    console.log(`Activating milestone ${milestoneId}`);
  }

  private estimateCompletionDate(milestone: MilestoneSpec): Date {
    // Simple estimation based on current progress and typical completion times
    const daysPerStage: Record<MilestoneStage, number> = {
      [MilestoneStage.PROPOSAL]: 7,
      [MilestoneStage.PROTOTYPE]: 21,
      [MilestoneStage.TESTING]: 14,
      [MilestoneStage.FINAL]: 10
    };

    const estimatedDays = daysPerStage[milestone.stage] || 14;
    const progressFactor = (100 - milestone.completion_percentage) / 100;
    const remainingDays = Math.ceil(estimatedDays * progressFactor);

    return new Date(Date.now() + remainingDays * 24 * 60 * 60 * 1000);
  }

  // Database integration methods (placeholders)
  private async getMilestone(milestoneId: string): Promise<MilestoneSpec | null> {
    // Placeholder - would integrate with actual database
    console.log(`Loading milestone ${milestoneId}`);
    return null;
  }

  private async saveMilestone(milestone: MilestoneSpec): Promise<void> {
    // Placeholder - would integrate with actual database
    console.log(`Saving milestone ${milestone.milestone_id}`);
  }

  private async getProjectMilestones(projectId: string): Promise<MilestoneSpec[]> {
    // Placeholder - would integrate with actual database
    console.log(`Loading milestones for project ${projectId}`);
    return [];
  }
}