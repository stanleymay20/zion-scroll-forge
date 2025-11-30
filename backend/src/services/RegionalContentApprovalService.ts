// Regional Content Approval Service
// "Let all things be done decently and in order" - 1 Corinthians 14:40
// Manages approval workflows for regional content variants

import { logger } from '../utils/logger';
import ReviewWorkflowService from './ReviewWorkflowService';
import type { CulturalVariant } from './CulturalVariantManager';

/**
 * Regional Approval Workflow
 */
export interface RegionalApprovalWorkflow {
  workflowId: string;
  variantId: string;
  regionCode: string;
  languageCode: string;
  status: ApprovalWorkflowStatus;
  stages: ApprovalStage[];
  currentStage: number;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  metadata: WorkflowMetadata;
}

export type ApprovalWorkflowStatus =
  | 'initiated'
  | 'in_progress'
  | 'pending_review'
  | 'approved'
  | 'rejected'
  | 'needs_revision'
  | 'escalated';

export interface ApprovalStage {
  stageId: string;
  stageName: string;
  stageType: ApprovalStageType;
  status: 'pending' | 'in_progress' | 'completed' | 'skipped';
  assignedTo: string[];
  requiredApprovers: number;
  currentApprovers: string[];
  startedAt?: Date;
  completedAt?: Date;
  reviews: StageReview[];
  canSkip: boolean;
}

export type ApprovalStageType =
  | 'cultural_expert_review'
  | 'theological_review'
  | 'elder_review'
  | 'content_manager_review'
  | 'final_approval';

export interface StageReview {
  reviewId: string;
  reviewerId: string;
  reviewerName: string;
  reviewerRole: string;
  decision: 'approved' | 'rejected' | 'needs_revision';
  comments: string;
  reviewedAt: Date;
  adaptationsReviewed: string[];
  concerns: ReviewConcern[];
}

export interface ReviewConcern {
  concernId: string;
  type: 'theological' | 'cultural' | 'linguistic' | 'quality' | 'spiritual';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  affectedSection: string;
  suggestedResolution: string;
  resolved: boolean;
}

export interface WorkflowMetadata {
  createdAt: Date;
  createdBy: string;
  lastModified: Date;
  modifiedBy: string;
  baseContentId: string;
  targetPublishDate?: Date;
  urgencyReason?: string;
  tags: string[];
}

/**
 * Approval Request
 */
export interface ApprovalRequest {
  variantId: string;
  regionCode: string;
  languageCode: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  requestedBy: string;
  targetPublishDate?: Date;
  urgencyReason?: string;
  skipOptionalStages?: boolean;
}

/**
 * Stage Completion Request
 */
export interface StageCompletionRequest {
  workflowId: string;
  stageId: string;
  reviewerId: string;
  reviewerName: string;
  reviewerRole: string;
  decision: 'approved' | 'rejected' | 'needs_revision';
  comments: string;
  adaptationsReviewed: string[];
  concerns?: ReviewConcern[];
}

/**
 * Workflow Summary
 */
export interface WorkflowSummary {
  totalWorkflows: number;
  byStatus: Record<ApprovalWorkflowStatus, number>;
  byRegion: Record<string, number>;
  byPriority: Record<string, number>;
  averageApprovalTime: number;
  pendingReviews: number;
  overdueWorkflows: number;
}

/**
 * Regional Content Approval Service
 * Manages approval workflows for regional content variants
 */
export class RegionalContentApprovalService {
  private reviewWorkflowService: ReviewWorkflowService;
  private workflows: Map<string, RegionalApprovalWorkflow> = new Map();
  private workflowsByVariant: Map<string, string> = new Map();
  private workflowsByRegion: Map<string, Set<string>> = new Map();

  constructor() {
    this.reviewWorkflowService = new ReviewWorkflowService();
  }

  /**
   * Initiate approval workflow
   */
  async initiateApproval(request: ApprovalRequest): Promise<RegionalApprovalWorkflow> {
    logger.info('Initiating regional content approval', {
      variantId: request.variantId,
      regionCode: request.regionCode,
      priority: request.priority
    });

    const workflowId = this.generateWorkflowId();

    // Define approval stages
    const stages = this.defineApprovalStages(
      request.regionCode,
      request.priority,
      request.skipOptionalStages
    );

    const workflow: RegionalApprovalWorkflow = {
      workflowId,
      variantId: request.variantId,
      regionCode: request.regionCode,
      languageCode: request.languageCode,
      status: 'initiated',
      stages,
      currentStage: 0,
      priority: request.priority,
      metadata: {
        createdAt: new Date(),
        createdBy: request.requestedBy,
        lastModified: new Date(),
        modifiedBy: request.requestedBy,
        baseContentId: '', // Would be populated from variant
        targetPublishDate: request.targetPublishDate,
        urgencyReason: request.urgencyReason,
        tags: [request.regionCode, request.languageCode]
      }
    };

    // Store workflow
    this.workflows.set(workflowId, workflow);
    this.workflowsByVariant.set(request.variantId, workflowId);

    // Index by region
    if (!this.workflowsByRegion.has(request.regionCode)) {
      this.workflowsByRegion.set(request.regionCode, new Set());
    }
    this.workflowsByRegion.get(request.regionCode)!.add(workflowId);

    // Start first stage
    await this.startStage(workflowId, 0);

    logger.info('Approval workflow initiated', {
      workflowId,
      stageCount: stages.length
    });

    return workflow;
  }

  /**
   * Submit stage review
   */
  async submitStageReview(request: StageCompletionRequest): Promise<void> {
    logger.info('Submitting stage review', {
      workflowId: request.workflowId,
      stageId: request.stageId,
      decision: request.decision
    });

    const workflow = this.workflows.get(request.workflowId);
    if (!workflow) {
      throw new Error(`Workflow ${request.workflowId} not found`);
    }

    const stage = workflow.stages.find(s => s.stageId === request.stageId);
    if (!stage) {
      throw new Error(`Stage ${request.stageId} not found`);
    }

    // Create review record
    const review: StageReview = {
      reviewId: this.generateReviewId(),
      reviewerId: request.reviewerId,
      reviewerName: request.reviewerName,
      reviewerRole: request.reviewerRole,
      decision: request.decision,
      comments: request.comments,
      reviewedAt: new Date(),
      adaptationsReviewed: request.adaptationsReviewed,
      concerns: request.concerns || []
    };

    stage.reviews.push(review);

    // Add to current approvers if approved
    if (request.decision === 'approved') {
      if (!stage.currentApprovers.includes(request.reviewerId)) {
        stage.currentApprovers.push(request.reviewerId);
      }
    }

    // Check if stage is complete
    if (stage.currentApprovers.length >= stage.requiredApprovers) {
      await this.completeStage(request.workflowId, request.stageId);
    } else if (request.decision === 'rejected') {
      // If rejected, mark workflow as rejected
      workflow.status = 'rejected';
      stage.status = 'completed';
      stage.completedAt = new Date();
    } else if (request.decision === 'needs_revision') {
      // If needs revision, mark workflow accordingly
      workflow.status = 'needs_revision';
      stage.status = 'completed';
      stage.completedAt = new Date();
    }

    workflow.metadata.lastModified = new Date();
    workflow.metadata.modifiedBy = request.reviewerId;

    logger.info('Stage review submitted', {
      workflowId: request.workflowId,
      stageId: request.stageId,
      decision: request.decision,
      stageComplete: stage.status === 'completed'
    });
  }

  /**
   * Get workflow by ID
   */
  async getWorkflow(workflowId: string): Promise<RegionalApprovalWorkflow | null> {
    return this.workflows.get(workflowId) || null;
  }

  /**
   * Get workflow by variant
   */
  async getWorkflowByVariant(variantId: string): Promise<RegionalApprovalWorkflow | null> {
    const workflowId = this.workflowsByVariant.get(variantId);
    if (!workflowId) return null;

    return this.workflows.get(workflowId) || null;
  }

  /**
   * Get workflows by region
   */
  async getWorkflowsByRegion(regionCode: string): Promise<RegionalApprovalWorkflow[]> {
    const workflowIds = this.workflowsByRegion.get(regionCode);
    if (!workflowIds) return [];

    return Array.from(workflowIds)
      .map(id => this.workflows.get(id))
      .filter((w): w is RegionalApprovalWorkflow => w !== undefined);
  }

  /**
   * Get pending reviews for reviewer
   */
  async getPendingReviewsForReviewer(
    reviewerId: string,
    reviewerRole?: string
  ): Promise<Array<{
    workflow: RegionalApprovalWorkflow;
    stage: ApprovalStage;
  }>> {
    const pendingReviews: Array<{
      workflow: RegionalApprovalWorkflow;
      stage: ApprovalStage;
    }> = [];

    for (const workflow of this.workflows.values()) {
      if (workflow.status !== 'in_progress' && workflow.status !== 'pending_review') {
        continue;
      }

      const currentStage = workflow.stages[workflow.currentStage];
      if (!currentStage || currentStage.status !== 'in_progress') {
        continue;
      }

      // Check if reviewer is assigned to this stage
      if (currentStage.assignedTo.includes(reviewerId)) {
        // Check if reviewer hasn't already reviewed
        const hasReviewed = currentStage.reviews.some(r => r.reviewerId === reviewerId);
        if (!hasReviewed) {
          pendingReviews.push({ workflow, stage: currentStage });
        }
      }
    }

    return pendingReviews;
  }

  /**
   * Get workflow summary
   */
  async getWorkflowSummary(): Promise<WorkflowSummary> {
    const workflows = Array.from(this.workflows.values());

    const byStatus: Record<ApprovalWorkflowStatus, number> = {
      initiated: 0,
      in_progress: 0,
      pending_review: 0,
      approved: 0,
      rejected: 0,
      needs_revision: 0,
      escalated: 0
    };

    const byRegion: Record<string, number> = {};
    const byPriority: Record<string, number> = {};

    let totalApprovalTime = 0;
    let approvedCount = 0;
    let pendingReviews = 0;
    let overdueWorkflows = 0;

    const now = new Date();

    for (const workflow of workflows) {
      // Count by status
      byStatus[workflow.status]++;

      // Count by region
      byRegion[workflow.regionCode] = (byRegion[workflow.regionCode] || 0) + 1;

      // Count by priority
      byPriority[workflow.priority] = (byPriority[workflow.priority] || 0) + 1;

      // Calculate approval time for completed workflows
      if (workflow.status === 'approved') {
        const lastStage = workflow.stages[workflow.stages.length - 1];
        if (lastStage.completedAt) {
          const approvalTime = lastStage.completedAt.getTime() - workflow.metadata.createdAt.getTime();
          totalApprovalTime += approvalTime;
          approvedCount++;
        }
      }

      // Count pending reviews
      if (workflow.status === 'in_progress' || workflow.status === 'pending_review') {
        const currentStage = workflow.stages[workflow.currentStage];
        if (currentStage && currentStage.status === 'in_progress') {
          pendingReviews += currentStage.requiredApprovers - currentStage.currentApprovers.length;
        }
      }

      // Check for overdue workflows
      if (workflow.metadata.targetPublishDate && workflow.status !== 'approved') {
        if (now > workflow.metadata.targetPublishDate) {
          overdueWorkflows++;
        }
      }
    }

    const averageApprovalTime = approvedCount > 0
      ? totalApprovalTime / approvedCount / 1000 / 60 / 60 // Convert to hours
      : 0;

    return {
      totalWorkflows: workflows.length,
      byStatus,
      byRegion,
      byPriority,
      averageApprovalTime,
      pendingReviews,
      overdueWorkflows
    };
  }

  /**
   * Escalate workflow
   */
  async escalateWorkflow(
    workflowId: string,
    reason: string,
    escalatedBy: string
  ): Promise<void> {
    logger.info('Escalating workflow', { workflowId, reason });

    const workflow = this.workflows.get(workflowId);
    if (!workflow) {
      throw new Error(`Workflow ${workflowId} not found`);
    }

    workflow.status = 'escalated';
    workflow.priority = 'urgent';
    workflow.metadata.lastModified = new Date();
    workflow.metadata.modifiedBy = escalatedBy;

    // Add escalation to metadata
    if (!workflow.metadata.urgencyReason) {
      workflow.metadata.urgencyReason = reason;
    }

    logger.info('Workflow escalated', { workflowId });
  }

  /**
   * Private helper methods
   */
  private defineApprovalStages(
    regionCode: string,
    priority: string,
    skipOptional?: boolean
  ): ApprovalStage[] {
    const stages: ApprovalStage[] = [];

    // Stage 1: Cultural Expert Review
    stages.push({
      stageId: this.generateStageId(),
      stageName: 'Cultural Expert Review',
      stageType: 'cultural_expert_review',
      status: 'pending',
      assignedTo: this.getCulturalExperts(regionCode),
      requiredApprovers: 1,
      currentApprovers: [],
      reviews: [],
      canSkip: false
    });

    // Stage 2: Theological Review
    stages.push({
      stageId: this.generateStageId(),
      stageName: 'Theological Review',
      stageType: 'theological_review',
      status: 'pending',
      assignedTo: this.getTheologicalReviewers(),
      requiredApprovers: 1,
      currentApprovers: [],
      reviews: [],
      canSkip: false
    });

    // Stage 3: Elder Review (optional for low priority)
    if (priority === 'high' || priority === 'urgent' || !skipOptional) {
      stages.push({
        stageId: this.generateStageId(),
        stageName: 'Elder Review',
        stageType: 'elder_review',
        status: 'pending',
        assignedTo: this.getElders(),
        requiredApprovers: 1,
        currentApprovers: [],
        reviews: [],
        canSkip: priority === 'low'
      });
    }

    // Stage 4: Content Manager Review
    stages.push({
      stageId: this.generateStageId(),
      stageName: 'Content Manager Review',
      stageType: 'content_manager_review',
      status: 'pending',
      assignedTo: this.getContentManagers(),
      requiredApprovers: 1,
      currentApprovers: [],
      reviews: [],
      canSkip: false
    });

    // Stage 5: Final Approval
    stages.push({
      stageId: this.generateStageId(),
      stageName: 'Final Approval',
      stageType: 'final_approval',
      status: 'pending',
      assignedTo: this.getFinalApprovers(),
      requiredApprovers: 1,
      currentApprovers: [],
      reviews: [],
      canSkip: false
    });

    return stages;
  }

  private async startStage(workflowId: string, stageIndex: number): Promise<void> {
    const workflow = this.workflows.get(workflowId);
    if (!workflow) return;

    if (stageIndex >= workflow.stages.length) {
      // All stages complete - approve workflow
      workflow.status = 'approved';
      logger.info('All stages complete - workflow approved', { workflowId });
      return;
    }

    const stage = workflow.stages[stageIndex];
    stage.status = 'in_progress';
    stage.startedAt = new Date();
    workflow.status = 'in_progress';
    workflow.currentStage = stageIndex;

    logger.info('Stage started', {
      workflowId,
      stageId: stage.stageId,
      stageName: stage.stageName
    });
  }

  private async completeStage(workflowId: string, stageId: string): Promise<void> {
    const workflow = this.workflows.get(workflowId);
    if (!workflow) return;

    const stageIndex = workflow.stages.findIndex(s => s.stageId === stageId);
    if (stageIndex === -1) return;

    const stage = workflow.stages[stageIndex];
    stage.status = 'completed';
    stage.completedAt = new Date();

    logger.info('Stage completed', {
      workflowId,
      stageId,
      stageName: stage.stageName
    });

    // Start next stage
    await this.startStage(workflowId, stageIndex + 1);
  }

  private getCulturalExperts(regionCode: string): string[] {
    // In production, would query database for cultural experts for this region
    return ['cultural_expert_1', 'cultural_expert_2'];
  }

  private getTheologicalReviewers(): string[] {
    // In production, would query database for theological reviewers
    return ['theological_reviewer_1', 'theological_reviewer_2'];
  }

  private getElders(): string[] {
    // In production, would query database for elders
    return ['elder_1', 'elder_2'];
  }

  private getContentManagers(): string[] {
    // In production, would query database for content managers
    return ['content_manager_1', 'content_manager_2'];
  }

  private getFinalApprovers(): string[] {
    // In production, would query database for final approvers
    return ['final_approver_1'];
  }

  private generateWorkflowId(): string {
    return `workflow_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateStageId(): string {
    return `stage_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateReviewId(): string {
    return `review_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

export default RegionalContentApprovalService;
