/**
 * Content Creation Monitoring Routes
 * API endpoints for monitoring content creation operations
 */

import { Router, Request, Response } from 'express';
import ContentCreationProductionIntegration from '../services/ContentCreationProductionIntegration';
import { logger } from '../utils/logger';

const router = Router();
const contentCreationIntegration = new ContentCreationProductionIntegration();

/**
 * Get content creation metrics
 * GET /api/content-creation-monitoring/metrics
 */
router.get('/metrics', async (req: Request, res: Response) => {
  try {
    const metrics = contentCreationIntegration.getMetrics();
    
    res.json({
      success: true,
      data: metrics,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error fetching content creation metrics', { error });
    res.status(500).json({
      success: false,
      error: 'Failed to fetch metrics'
    });
  }
});

/**
 * Get all jobs
 * GET /api/content-creation-monitoring/jobs
 */
router.get('/jobs', async (req: Request, res: Response) => {
  try {
    const { status, type, limit } = req.query;
    
    let jobs = contentCreationIntegration.getAllJobs();
    
    // Filter by status
    if (status) {
      jobs = jobs.filter(j => j.status === status);
    }
    
    // Filter by type
    if (type) {
      jobs = jobs.filter(j => j.type === type);
    }
    
    // Limit results
    if (limit) {
      jobs = jobs.slice(0, parseInt(limit as string, 10));
    }
    
    res.json({
      success: true,
      data: jobs,
      count: jobs.length
    });
  } catch (error) {
    logger.error('Error fetching jobs', { error });
    res.status(500).json({
      success: false,
      error: 'Failed to fetch jobs'
    });
  }
});

/**
 * Get specific job status
 * GET /api/content-creation-monitoring/jobs/:jobId
 */
router.get('/jobs/:jobId', async (req: Request, res: Response) => {
  try {
    const { jobId } = req.params;
    
    const job = contentCreationIntegration.getJobStatus(jobId);
    
    if (!job) {
      return res.status(404).json({
        success: false,
        error: 'Job not found'
      });
    }
    
    res.json({
      success: true,
      data: job
    });
  } catch (error) {
    logger.error('Error fetching job status', { error });
    res.status(500).json({
      success: false,
      error: 'Failed to fetch job status'
    });
  }
});

/**
 * Submit content generation job
 * POST /api/content-creation-monitoring/jobs
 */
router.post('/jobs', async (req: Request, res: Response) => {
  try {
    const { type, request, priority, requestedBy } = req.body;
    
    if (!type || !request) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: type, request'
      });
    }
    
    const job = await contentCreationIntegration.submitJob(
      type,
      request,
      priority || 'normal',
      requestedBy || 'api'
    );
    
    res.status(201).json({
      success: true,
      data: job
    });
  } catch (error) {
    logger.error('Error submitting job', { error });
    res.status(500).json({
      success: false,
      error: 'Failed to submit job'
    });
  }
});

/**
 * Cancel job
 * DELETE /api/content-creation-monitoring/jobs/:jobId
 */
router.delete('/jobs/:jobId', async (req: Request, res: Response) => {
  try {
    const { jobId } = req.params;
    
    const cancelled = await contentCreationIntegration.cancelJob(jobId);
    
    if (!cancelled) {
      return res.status(400).json({
        success: false,
        error: 'Job cannot be cancelled (not queued or already completed)'
      });
    }
    
    res.json({
      success: true,
      message: 'Job cancelled successfully'
    });
  } catch (error) {
    logger.error('Error cancelling job', { error });
    res.status(500).json({
      success: false,
      error: 'Failed to cancel job'
    });
  }
});

/**
 * Get workflow configuration
 * GET /api/content-creation-monitoring/config
 */
router.get('/config', async (req: Request, res: Response) => {
  try {
    const config = contentCreationIntegration.getWorkflowConfiguration();
    
    res.json({
      success: true,
      data: config
    });
  } catch (error) {
    logger.error('Error fetching configuration', { error });
    res.status(500).json({
      success: false,
      error: 'Failed to fetch configuration'
    });
  }
});

/**
 * Update workflow configuration
 * PUT /api/content-creation-monitoring/config
 */
router.put('/config', async (req: Request, res: Response) => {
  try {
    const config = req.body;
    
    contentCreationIntegration.updateWorkflowConfiguration(config);
    
    res.json({
      success: true,
      message: 'Configuration updated successfully',
      data: contentCreationIntegration.getWorkflowConfiguration()
    });
  } catch (error) {
    logger.error('Error updating configuration', { error });
    res.status(500).json({
      success: false,
      error: 'Failed to update configuration'
    });
  }
});

/**
 * Health check
 * GET /api/content-creation-monitoring/health
 */
router.get('/health', async (req: Request, res: Response) => {
  try {
    const metrics = contentCreationIntegration.getMetrics();
    
    const health = {
      status: 'healthy',
      queueDepth: metrics.queueDepth,
      errorRate: metrics.errorRate,
      activeJobs: metrics.totalJobs - metrics.completedJobs - metrics.failedJobs,
      timestamp: new Date().toISOString()
    };
    
    // Determine health status
    if (metrics.errorRate > 0.1) {
      health.status = 'unhealthy';
    } else if (metrics.errorRate > 0.05 || metrics.queueDepth > 50) {
      health.status = 'degraded';
    }
    
    const statusCode = health.status === 'healthy' ? 200 : 503;
    
    res.status(statusCode).json({
      success: true,
      data: health
    });
  } catch (error) {
    logger.error('Error checking health', { error });
    res.status(503).json({
      success: false,
      error: 'Health check failed'
    });
  }
});

export default router;
