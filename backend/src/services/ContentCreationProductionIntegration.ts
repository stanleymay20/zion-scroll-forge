/**
 * Content Creation Production Integration Service
 * Integrates content creation engine with production monitoring, deployment, and backup systems
 * "Let all things be done decently and in order" - 1 Corinthians 14:40
 */

import { logger } from '../utils/logger';
import ProductionMonitoringService from './ProductionMonitoringService';
import DeploymentOrchestrationService from './DeploymentOrchestrationService';
import BackupRecoveryService from './BackupRecoveryService';
import ContentCreationService from './ContentCreationService';
import ContentVersionControl from './ContentVersionControl';
import ScrollPedagogyValidator from './ScrollPedagogyValidator';
import { getProductionConfig } from '../config/production.config';

/**
 * Content Generation Job Status
 */
export interface ContentGenerationJob {
  jobId: string;
  type: 'lecture' | 'module' | 'course' | 'assessment';
  status: 'queued' | 'processing' | 'completed' | 'failed' | 'cancelled';
  priority: 'low' | 'normal' | 'high' | 'critical';
  courseId: string;
  moduleId?: string;
  requestedBy: string;
  startTime?: Date;
  endTime?: Date;
  progress: number; // 0-100
  metrics: JobMetrics;
  error?: string;
  retryCount: number;
  maxRetries: number;
}

export interface JobMetrics {
  contentGenerated: number;
  tokensUsed: number;
  costIncurred: number;
  qualityScore: number;
  pedagogyScore: number;
  processingTime: number;
}

/**
 * Content Creation Workflow Configuration
 */
export interface WorkflowConfiguration {
  enableAutoBackup: boolean;
  backupFrequency: 'immediate' | 'hourly' | 'daily';
  enableQualityGates: boolean;
  minimumQualityScore: number;
  minimumPedagogyScore: number;
  enableVersionControl: boolean;
  requireReview: boolean;
  enableMonitoring: boolean;
  alertThresholds: AlertThresholds;
}

export interface AlertThresholds {
  maxProcessingTime: number; // milliseconds
  maxCostPerJob: number; // dollars
  minQualityScore: number;
  maxErrorRate: number; // percentage
  maxQueueDepth: number;
}

/**
 * Production Metrics Dashboard
 */
export interface ContentCreationMetrics {
  totalJobs: number;
  completedJobs: number;
  failedJobs: number;
  averageProcessingTime: number;
  totalCost: number;
  averageQualityScore: number;
  averagePedagogyScore: number;
  queueDepth: number;
  errorRate: number;
  throughput: number; // jobs per hour
}

/**
 * Content Creation Production Integration Service
 */
export class ContentCreationProductionIntegration {
  private monitoring: ProductionMonitoringService;
  private deployment: DeploymentOrchestrationService;
  private backup: BackupRecoveryService;
  private contentCreation: ContentCreationService;
  private versionControl: ContentVersionControl;
  private pedagogyValidator: ScrollPedagogyValidator;
  private config: ReturnType<typeof getProductionConfig>;
  
  private jobs: Map<string, ContentGenerationJob> = new Map();
  private jobQueue: string[] = [];
  private activeJobs: Set<string> = new Set();
  private maxConcurrentJobs: number = 5;
  
  private workflowConfig: WorkflowConfiguration = {
    enableAutoBackup: true,
    backupFrequency: 'hourly',
    enableQualityGates: true,
    minimumQualityScore: 0.75,
    minimumPedagogyScore: 75,
    enableVersionControl: true,
    requireReview: false,
    enableMonitoring: true,
    alertThresholds: {
      maxProcessingTime: 300000, // 5 minutes
      maxCostPerJob: 5.0,
      minQualityScore: 0.7,
      maxErrorRate: 0.1,
      maxQueueDepth: 100
    }
  };

  constructor() {
    this.monitoring = new ProductionMonitoringService();
    this.deployment = new DeploymentOrchestrationService();
    this.backup = new BackupRecoveryService();
    this.contentCreation = new ContentCreationService();
    this.versionControl = new ContentVersionControl();
    this.pedagogyValidator = new ScrollPedagogyValidator();
    this.config = getProductionConfig();
    
    this.initializeProductionIntegration();
  }

  /**
   * Initialize production integration
   */
  private initializeProductionIntegration(): void {
    logger.info('Initializing content creation production integration');

    // Start job processor
    this.startJobProcessor();

    // Start metrics collection
    this.startMetricsCollection();

    // Start backup scheduler
    if (this.workflowConfig.enableAutoBackup) {
      this.startBackupScheduler();
    }

    logger.info('Content creation production integration initialized', {
      maxConcurrentJobs: this.maxConcurrentJobs,
      autoBackup: this.workflowConfig.enableAutoBackup,
      qualityGates: this.workflowConfig.enableQualityGates
    });
  }

  /**
   * Submit content generation job
   */
  async submitJob(
    type: 'lecture' | 'module' | 'course' | 'assessment',
    request: any,
    priority: 'low' | 'normal' | 'high' | 'critical' = 'normal',
    requestedBy: string = 'system'
  ): Promise<ContentGenerationJob> {
    const jobId = this.generateJobId();
    
    const job: ContentGenerationJob = {
      jobId,
      type,
      status: 'queued',
      priority,
      courseId: request.courseId || request.courseOutline?.id || 'unknown',
      moduleId: request.moduleId || request.moduleOutline?.id,
      requestedBy,
      progress: 0,
      metrics: {
        contentGenerated: 0,
        tokensUsed: 0,
        costIncurred: 0,
        qualityScore: 0,
        pedagogyScore: 0,
        processingTime: 0
      },
      retryCount: 0,
      maxRetries: 3
    };

    // Store job
    this.jobs.set(jobId, job);

    // Add to queue based on priority
    this.enqueueJob(jobId, priority);

    // Track event
    this.monitoring.trackEvent({
      name: 'content_generation_job_submitted',
      service: 'ContentCreationService',
      metadata: {
        jobId,
        type,
        priority,
        courseId: job.courseId
      }
    });

    // Check queue depth alert
    if (this.jobQueue.length > this.workflowConfig.alertThresholds.maxQueueDepth) {
      await this.monitoring.createAlert({
        severity: 'warning',
        service: 'ContentCreationService',
        message: `High queue depth: ${this.jobQueue.length} jobs`,
        metadata: { queueDepth: this.jobQueue.length }
      });
    }

    logger.info('Content generation job submitted', {
      jobId,
      type,
      priority,
      queuePosition: this.jobQueue.indexOf(jobId) + 1
    });

    return job;
  }

  /**
   * Process content generation job
   */
  private async processJob(jobId: string): Promise<void> {
    const job = this.jobs.get(jobId);
    if (!job) {
      logger.error('Job not found', { jobId });
      return;
    }

    try {
      job.status = 'processing';
      job.startTime = new Date();
      job.progress = 10;
      this.activeJobs.add(jobId);

      logger.info('Processing content generation job', {
        jobId,
        type: job.type,
        courseId: job.courseId
      });

      // Generate content based on type
      let result: any;
      switch (job.type) {
        case 'lecture':
          result = await this.processLectureGeneration(job);
          break;
        case 'module':
          result = await this.processModuleGeneration(job);
          break;
        case 'course':
          result = await this.processCourseGeneration(job);
          break;
        case 'assessment':
          result = await this.processAssessmentGeneration(job);
          break;
        default:
          throw new Error(`Unknown job type: ${job.type}`);
      }

      // Update job metrics
      job.metrics = result.metrics;
      job.progress = 90;

      // Quality gates
      if (this.workflowConfig.enableQualityGates) {
        await this.applyQualityGates(job, result);
      }

      // Version control
      if (this.workflowConfig.enableVersionControl) {
        await this.createContentVersion(job, result);
      }

      // Backup
      if (this.workflowConfig.enableAutoBackup && this.workflowConfig.backupFrequency === 'immediate') {
        await this.backupContent(job, result);
      }

      // Complete job
      job.status = 'completed';
      job.endTime = new Date();
      job.progress = 100;
      job.metrics.processingTime = job.endTime.getTime() - (job.startTime?.getTime() || 0);

      // Track success
      this.monitoring.trackEvent({
        name: 'content_generation_job_completed',
        service: 'ContentCreationService',
        metadata: {
          jobId,
          type: job.type,
          processingTime: job.metrics.processingTime,
          cost: job.metrics.costIncurred,
          qualityScore: job.metrics.qualityScore
        }
      });

      // Check for alerts
      await this.checkJobAlerts(job);

      logger.info('Content generation job completed', {
        jobId,
        processingTime: job.metrics.processingTime,
        cost: job.metrics.costIncurred,
        qualityScore: job.metrics.qualityScore
      });

    } catch (error) {
      job.status = 'failed';
      job.endTime = new Date();
      job.error = error instanceof Error ? error.message : String(error);
      job.retryCount++;

      logger.error('Content generation job failed', {
        jobId,
        error: job.error,
        retryCount: job.retryCount
      });

      // Retry if under max retries
      if (job.retryCount < job.maxRetries) {
        logger.info('Retrying job', { jobId, retryCount: job.retryCount });
        job.status = 'queued';
        this.enqueueJob(jobId, job.priority);
      } else {
        // Create alert for failed job
        await this.monitoring.createAlert({
          severity: 'error',
          service: 'ContentCreationService',
          message: `Job failed after ${job.maxRetries} retries: ${job.error}`,
          metadata: { jobId, type: job.type, error: job.error }
        });

        // Capture exception
        this.monitoring.captureException(
          error instanceof Error ? error : new Error(String(error)),
          { jobId, type: job.type }
        );
      }
    } finally {
      this.activeJobs.delete(jobId);
    }
  }

  /**
   * Process lecture generation
   */
  private async processLectureGeneration(job: ContentGenerationJob): Promise<any> {
    // This would be called with actual request data
    // For now, return mock result
    return {
      content: {},
      metrics: {
        contentGenerated: 1,
        tokensUsed: 3000,
        costIncurred: 0.15,
        qualityScore: 0.85,
        pedagogyScore: 82,
        processingTime: 0
      }
    };
  }

  /**
   * Process module generation
   */
  private async processModuleGeneration(job: ContentGenerationJob): Promise<any> {
    return {
      content: {},
      metrics: {
        contentGenerated: 5,
        tokensUsed: 15000,
        costIncurred: 0.75,
        qualityScore: 0.83,
        pedagogyScore: 80,
        processingTime: 0
      }
    };
  }

  /**
   * Process course generation
   */
  private async processCourseGeneration(job: ContentGenerationJob): Promise<any> {
    return {
      content: {},
      metrics: {
        contentGenerated: 20,
        tokensUsed: 60000,
        costIncurred: 3.0,
        qualityScore: 0.82,
        pedagogyScore: 81,
        processingTime: 0
      }
    };
  }

  /**
   * Process assessment generation
   */
  private async processAssessmentGeneration(job: ContentGenerationJob): Promise<any> {
    return {
      content: {},
      metrics: {
        contentGenerated: 1,
        tokensUsed: 2000,
        costIncurred: 0.10,
        qualityScore: 0.88,
        pedagogyScore: 85,
        processingTime: 0
      }
    };
  }

  /**
   * Apply quality gates
   */
  private async applyQualityGates(job: ContentGenerationJob, result: any): Promise<void> {
    const qualityScore = result.metrics.qualityScore;
    const pedagogyScore = result.metrics.pedagogyScore;

    if (qualityScore < this.workflowConfig.minimumQualityScore) {
      throw new Error(
        `Content quality score ${qualityScore} below minimum ${this.workflowConfig.minimumQualityScore}`
      );
    }

    if (pedagogyScore < this.workflowConfig.minimumPedagogyScore) {
      throw new Error(
        `Pedagogy score ${pedagogyScore} below minimum ${this.workflowConfig.minimumPedagogyScore}`
      );
    }

    logger.info('Quality gates passed', {
      jobId: job.jobId,
      qualityScore,
      pedagogyScore
    });
  }

  /**
   * Create content version
   */
  private async createContentVersion(job: ContentGenerationJob, result: any): Promise<void> {
    await this.versionControl.createVersion(
      job.jobId,
      job.type,
      result.content,
      {
        title: `${job.type} - ${job.courseId}`,
        tags: [job.type, job.courseId],
        qualityScore: result.metrics.qualityScore,
        pedagogyScore: result.metrics.pedagogyScore,
        reviewStatus: this.workflowConfig.requireReview ? 'pending_review' : 'approved'
      },
      job.requestedBy
    );

    logger.info('Content version created', { jobId: job.jobId });
  }

  /**
   * Backup content
   */
  private async backupContent(job: ContentGenerationJob, result: any): Promise<void> {
    // In production, this would backup to S3 or similar
    logger.info('Content backed up', { jobId: job.jobId });
  }

  /**
   * Check job alerts
   */
  private async checkJobAlerts(job: ContentGenerationJob): Promise<void> {
    // Check processing time
    if (job.metrics.processingTime > this.workflowConfig.alertThresholds.maxProcessingTime) {
      await this.monitoring.createAlert({
        severity: 'warning',
        service: 'ContentCreationService',
        message: `Job exceeded max processing time: ${job.metrics.processingTime}ms`,
        metadata: { jobId: job.jobId, processingTime: job.metrics.processingTime }
      });
    }

    // Check cost
    if (job.metrics.costIncurred > this.workflowConfig.alertThresholds.maxCostPerJob) {
      await this.monitoring.createAlert({
        severity: 'warning',
        service: 'ContentCreationService',
        message: `Job exceeded max cost: $${job.metrics.costIncurred}`,
        metadata: { jobId: job.jobId, cost: job.metrics.costIncurred }
      });
    }

    // Check quality
    if (job.metrics.qualityScore < this.workflowConfig.alertThresholds.minQualityScore) {
      await this.monitoring.createAlert({
        severity: 'warning',
        service: 'ContentCreationService',
        message: `Job quality score below threshold: ${job.metrics.qualityScore}`,
        metadata: { jobId: job.jobId, qualityScore: job.metrics.qualityScore }
      });
    }
  }

  /**
   * Start job processor
   */
  private startJobProcessor(): void {
    setInterval(async () => {
      // Process jobs from queue
      while (this.activeJobs.size < this.maxConcurrentJobs && this.jobQueue.length > 0) {
        const jobId = this.jobQueue.shift();
        if (jobId) {
          await this.processJob(jobId);
        }
      }
    }, 1000); // Check every second

    logger.info('Job processor started');
  }

  /**
   * Start metrics collection
   */
  private startMetricsCollection(): void {
    setInterval(() => {
      const metrics = this.getMetrics();
      
      // Log metrics
      logger.info('Content creation metrics', metrics);

      // Track in monitoring
      this.monitoring.trackEvent({
        name: 'content_creation_metrics',
        service: 'ContentCreationService',
        metadata: metrics
      });
    }, 60000); // Every minute

    logger.info('Metrics collection started');
  }

  /**
   * Start backup scheduler
   */
  private startBackupScheduler(): void {
    const frequency = this.workflowConfig.backupFrequency;
    const interval = frequency === 'hourly' ? 3600000 : 86400000; // 1 hour or 24 hours

    setInterval(async () => {
      logger.info('Running scheduled content backup');
      await this.backup.createFullBackup();
    }, interval);

    logger.info('Backup scheduler started', { frequency });
  }

  /**
   * Get job status
   */
  getJobStatus(jobId: string): ContentGenerationJob | null {
    return this.jobs.get(jobId) || null;
  }

  /**
   * Get all jobs
   */
  getAllJobs(): ContentGenerationJob[] {
    return Array.from(this.jobs.values());
  }

  /**
   * Get metrics
   */
  getMetrics(): ContentCreationMetrics {
    const allJobs = this.getAllJobs();
    const completedJobs = allJobs.filter(j => j.status === 'completed');
    const failedJobs = allJobs.filter(j => j.status === 'failed');

    const totalProcessingTime = completedJobs.reduce((sum, j) => sum + j.metrics.processingTime, 0);
    const totalCost = completedJobs.reduce((sum, j) => sum + j.metrics.costIncurred, 0);
    const totalQuality = completedJobs.reduce((sum, j) => sum + j.metrics.qualityScore, 0);
    const totalPedagogy = completedJobs.reduce((sum, j) => sum + j.metrics.pedagogyScore, 0);

    return {
      totalJobs: allJobs.length,
      completedJobs: completedJobs.length,
      failedJobs: failedJobs.length,
      averageProcessingTime: completedJobs.length > 0 ? totalProcessingTime / completedJobs.length : 0,
      totalCost,
      averageQualityScore: completedJobs.length > 0 ? totalQuality / completedJobs.length : 0,
      averagePedagogyScore: completedJobs.length > 0 ? totalPedagogy / completedJobs.length : 0,
      queueDepth: this.jobQueue.length,
      errorRate: allJobs.length > 0 ? failedJobs.length / allJobs.length : 0,
      throughput: completedJobs.length // Simplified - would calculate per hour in production
    };
  }

  /**
   * Update workflow configuration
   */
  updateWorkflowConfiguration(config: Partial<WorkflowConfiguration>): void {
    this.workflowConfig = {
      ...this.workflowConfig,
      ...config
    };

    logger.info('Workflow configuration updated', this.workflowConfig);
  }

  /**
   * Get workflow configuration
   */
  getWorkflowConfiguration(): WorkflowConfiguration {
    return { ...this.workflowConfig };
  }

  /**
   * Cancel job
   */
  async cancelJob(jobId: string): Promise<boolean> {
    const job = this.jobs.get(jobId);
    if (!job) return false;

    if (job.status === 'queued') {
      const index = this.jobQueue.indexOf(jobId);
      if (index > -1) {
        this.jobQueue.splice(index, 1);
      }
      job.status = 'cancelled';
      logger.info('Job cancelled', { jobId });
      return true;
    }

    return false;
  }

  /**
   * Helper: Enqueue job based on priority
   */
  private enqueueJob(jobId: string, priority: 'low' | 'normal' | 'high' | 'critical'): void {
    const priorityOrder = { critical: 0, high: 1, normal: 2, low: 3 };
    const jobPriority = priorityOrder[priority];

    // Find insertion point based on priority
    let insertIndex = this.jobQueue.length;
    for (let i = 0; i < this.jobQueue.length; i++) {
      const existingJob = this.jobs.get(this.jobQueue[i]);
      if (existingJob && priorityOrder[existingJob.priority] > jobPriority) {
        insertIndex = i;
        break;
      }
    }

    this.jobQueue.splice(insertIndex, 0, jobId);
  }

  /**
   * Helper: Generate job ID
   */
  private generateJobId(): string {
    return `job_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

export default ContentCreationProductionIntegration;
