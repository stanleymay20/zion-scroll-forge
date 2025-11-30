// Global Content Coordination Integrator
// "For God is not a God of confusion but of peace" - 1 Corinthians 14:33
// Integrates all global content coordination services with tracking

import { logger } from '../utils/logger';
import { PrismaClient } from '@prisma/client';
import ContentVersionCoordinator from './ContentVersionCoordinator';
import CulturalVariantManager from './CulturalVariantManager';
import CrossCulturalConsistencyChecker from './CrossCulturalConsistencyChecker';
import RegionalContentApprovalService from './RegionalContentApprovalService';

const prisma = new PrismaClient();

/**
 * Global Coordination Job
 */
export interface GlobalCoordinationJob {
  jobId: string;
  jobType: GlobalCoordinationJobType;
  baseContentId: string;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  progress: number;
  startedAt?: Date;
  completedAt?: Date;
  error?: string;
  metadata: JobMetadata;
  results?: JobResults;
}

export type GlobalCoordinationJobType =
  | 'create_global_version'
  | 'synchronize_regions'
  | 'create_variant'
  | 'check_consistency'
  | 'initiate_approval'
  | 'full_coordination';

export interface JobMetadata {
  createdAt: Date;
  createdBy: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  targetRegions?: string[];
  parameters: Record<string, any>;
}

export interface JobResults {
  globalVersionId?: string;
  variantIds?: string[];
  consistencyCheckId?: string;
  approvalWorkflowIds?: string[];
  syncResults?: any;
  summary: string;
}

/**
 * Full Coordination Request
 */
export interface FullCoordinationRequest {
  baseContentId: string;
  baseVersion: number;
  targetRegions: string[];
  targetLanguages: string[];
  priority: 'low' | 'medium' | 'high' | 'urgent';
  requestedBy: string;
  skipOptionalApprovals?: boolean;
  autoPublish?: boolean;
}

/**
 * Coordination Status
 */
export interface CoordinationStatus {
  baseContentId: string;
  globalVersionId?: string;
  totalRegions: number;
  completedRegions: number;
  pendingRegions: number;
  failedRegions: number;
  overallProgress: number;
  status: 'not_started' | 'in_progress' | 'completed' | 'failed';
  lastUpdated: Date;
}

/**
 * Global Content Coordination Integrator
 * Orchestrates all global content coordination services
 */
export class GlobalContentCoordinationIntegrator {
  private versionCoordinator: ContentVersionCoordinator;
  private variantManager: CulturalVariantManager;
  private consistencyChecker: CrossCulturalConsistencyChecker;
  private approvalService: RegionalContentApprovalService;
  private jobs: Map<string, GlobalCoordinationJob> = new Map();

  constructor() {
    this.versionCoordinator = new ContentVersionCoordinator();
    this.variantManager = new CulturalVariantManager();
    this.consistencyChecker = new CrossCulturalConsistencyChecker();
    this.approvalService = new RegionalContentApprovalService();
  }

  /**
   * Execute full coordination workflow
   */
  async executeFullCoordination(
    request: FullCoordinationRequest
  ): Promise<GlobalCoordinationJob> {
    logger.info('Executing full content coordination', {
      baseContentId: request.baseContentId,
      targetRegions: request.targetRegions.length,
      priority: request.priority
    });

    const jobId = await this.createCoordinationJob(
      'full_coordination',
      request.baseContentId,
      request.requestedBy,
      request.priority,
      {
        targetRegions: request.targetRegions,
        targetLanguages: request.targetLanguages,
        skipOptionalApprovals: request.skipOptionalApprovals,
        autoPublish: request.autoPublish
      }
    );

    const job = this.jobs.get(jobId)!;

    try {
      // Step 1: Create global version
      await this.updateJobProgress(jobId, 10, 'Creating global version');
      const globalVersion = await this.versionCoordinator.createGlobalVersion(
        request.baseContentId,
        request.baseVersion,
        request.targetRegions
      );

      // Step 2: Create cultural variants for each region
      await this.updateJobProgress(jobId, 30, 'Creating cultural variants');
      const variantIds: string[] = [];
      
      for (let i = 0; i < request.targetRegions.length; i++) {
        const regionCode = request.targetRegions[i];
        const languageCode = request.targetLanguages[i] || 'en';

        const variant = await this.variantManager.createVariant({
          baseContentId: request.baseContentId,
          regionCode,
          languageCode,
          cultureCode: regionCode,
          createdBy: request.requestedBy
        });

        variantIds.push(variant.variantId);
      }

      // Step 3: Check consistency across variants
      await this.updateJobProgress(jobId, 50, 'Checking cross-cultural consistency');
      const variants = await Promise.all(
        variantIds.map(id => this.variantManager.getVariant(id))
      );
      const consistencyCheck = await this.consistencyChecker.checkConsistency(
        request.baseContentId,
        variants.filter(v => v !== null) as any[]
      );

      // Step 4: Initiate approval workflows
      await this.updateJobProgress(jobId, 70, 'Initiating approval workflows');
      const approvalWorkflowIds: string[] = [];

      for (const variant of variants) {
        if (!variant) continue;

        const workflow = await this.approvalService.initiateApproval({
          variantId: variant.variantId,
          regionCode: variant.regionCode,
          languageCode: variant.languageCode,
          priority: request.priority,
          requestedBy: request.requestedBy,
          skipOptionalStages: request.skipOptionalApprovals
        });

        approvalWorkflowIds.push(workflow.workflowId);
      }

      // Step 5: Track in content_generation_jobs table
      await this.updateJobProgress(jobId, 90, 'Recording coordination job');
      await this.recordInContentGenerationJobs(
        request.baseContentId,
        globalVersion.globalVersionId,
        variantIds,
        approvalWorkflowIds
      );

      // Complete job
      await this.updateJobProgress(jobId, 100, 'Coordination complete');
      job.status = 'completed';
      job.completedAt = new Date();
      job.results = {
        globalVersionId: globalVersion.globalVersionId,
        variantIds,
        consistencyCheckId: consistencyCheck.checkId,
        approvalWorkflowIds,
        summary: `Successfully coordinated content for ${request.targetRegions.length} regions`
      };

      logger.info('Full coordination complete', {
        jobId,
        globalVersionId: globalVersion.globalVersionId,
        variantCount: variantIds.length
      });

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.error('Coordination failed', { jobId, error: errorMessage });
      
      job.status = 'failed';
      job.error = errorMessage;
      job.completedAt = new Date();
    }

    return job;
  }

  /**
   * Get coordination status
   */
  async getCoordinationStatus(baseContentId: string): Promise<CoordinationStatus> {
    logger.info('Getting coordination status', { baseContentId });

    // Get all variants for this content
    const variants = await this.variantManager.getVariantsByContent(baseContentId);

    // Get approval workflows
    const workflows = await Promise.all(
      variants.map(v => this.approvalService.getWorkflowByVariant(v.variantId))
    );

    const completedRegions = workflows.filter(w => w?.status === 'approved').length;
    const pendingRegions = workflows.filter(w => 
      w?.status === 'in_progress' || w?.status === 'pending_review'
    ).length;
    const failedRegions = workflows.filter(w => 
      w?.status === 'rejected' || w?.status === 'needs_revision'
    ).length;

    const overallProgress = variants.length > 0
      ? (completedRegions / variants.length) * 100
      : 0;

    let status: 'not_started' | 'in_progress' | 'completed' | 'failed' = 'not_started';
    if (completedRegions === variants.length && variants.length > 0) {
      status = 'completed';
    } else if (failedRegions > 0) {
      status = 'failed';
    } else if (completedRegions > 0 || pendingRegions > 0) {
      status = 'in_progress';
    }

    return {
      baseContentId,
      totalRegions: variants.length,
      completedRegions,
      pendingRegions,
      failedRegions,
      overallProgress,
      status,
      lastUpdated: new Date()
    };
  }

  /**
   * Get job by ID
   */
  async getJob(jobId: string): Promise<GlobalCoordinationJob | null> {
    return this.jobs.get(jobId) || null;
  }

  /**
   * Get all jobs for content
   */
  async getJobsForContent(baseContentId: string): Promise<GlobalCoordinationJob[]> {
    return Array.from(this.jobs.values()).filter(
      job => job.baseContentId === baseContentId
    );
  }

  /**
   * Private helper methods
   */
  private async createCoordinationJob(
    jobType: GlobalCoordinationJobType,
    baseContentId: string,
    createdBy: string,
    priority: 'low' | 'medium' | 'high' | 'urgent',
    parameters: Record<string, any>
  ): Promise<string> {
    const jobId = this.generateJobId();

    const job: GlobalCoordinationJob = {
      jobId,
      jobType,
      baseContentId,
      status: 'queued',
      progress: 0,
      metadata: {
        createdAt: new Date(),
        createdBy,
        priority,
        parameters
      }
    };

    this.jobs.set(jobId, job);

    logger.info('Coordination job created', { jobId, jobType, baseContentId });

    return jobId;
  }

  private async updateJobProgress(
    jobId: string,
    progress: number,
    message: string
  ): Promise<void> {
    const job = this.jobs.get(jobId);
    if (!job) return;

    job.progress = progress;
    job.status = progress === 100 ? 'completed' : 'processing';

    if (progress > 0 && !job.startedAt) {
      job.startedAt = new Date();
    }

    logger.info('Job progress updated', { jobId, progress, message });
  }

  private async recordInContentGenerationJobs(
    baseContentId: string,
    globalVersionId: string,
    variantIds: string[],
    approvalWorkflowIds: string[]
  ): Promise<void> {
    try {
      // Record the coordination job in content_generation_jobs table
      await prisma.contentGenerationJobs.create({
        data: {
          jobType: 'course', // Using 'course' as the closest match
          status: 'completed',
          inputPrompt: `Global content coordination for ${baseContentId}`,
          inputParameters: {
            baseContentId,
            globalVersionId,
            variantIds,
            approvalWorkflowIds,
            coordinationType: 'global_coordination'
          },
          outputContent: {
            globalVersionId,
            variantCount: variantIds.length,
            approvalWorkflowCount: approvalWorkflowIds.length
          },
          progressPercentage: 100,
          completedAt: new Date()
        }
      });

      logger.info('Coordination job recorded in database', {
        baseContentId,
        globalVersionId
      });
    } catch (error) {
      logger.error('Failed to record coordination job', { error });
      // Don't throw - this is non-critical
    }
  }

  private generateJobId(): string {
    return `coord_job_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get coordination summary
   */
  async getCoordinationSummary(): Promise<{
    totalJobs: number;
    activeJobs: number;
    completedJobs: number;
    failedJobs: number;
    totalRegionsCoordinated: number;
    averageCompletionTime: number;
  }> {
    const jobs = Array.from(this.jobs.values());

    const activeJobs = jobs.filter(j => j.status === 'processing' || j.status === 'queued').length;
    const completedJobs = jobs.filter(j => j.status === 'completed').length;
    const failedJobs = jobs.filter(j => j.status === 'failed').length;

    // Calculate total regions coordinated
    let totalRegionsCoordinated = 0;
    for (const job of jobs) {
      if (job.results?.variantIds) {
        totalRegionsCoordinated += job.results.variantIds.length;
      }
    }

    // Calculate average completion time
    const completedJobsWithTime = jobs.filter(
      j => j.status === 'completed' && j.startedAt && j.completedAt
    );
    const totalTime = completedJobsWithTime.reduce((sum, job) => {
      const time = job.completedAt!.getTime() - job.startedAt!.getTime();
      return sum + time;
    }, 0);
    const averageCompletionTime = completedJobsWithTime.length > 0
      ? totalTime / completedJobsWithTime.length / 1000 / 60 // Convert to minutes
      : 0;

    return {
      totalJobs: jobs.length,
      activeJobs,
      completedJobs,
      failedJobs,
      totalRegionsCoordinated,
      averageCompletionTime
    };
  }
}

export default GlobalContentCoordinationIntegrator;
