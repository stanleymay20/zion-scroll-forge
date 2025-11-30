/**
 * Error Monitoring API Routes
 * Provides endpoints for error monitoring, statistics, and management
 */

import { Router, Request, Response } from 'express';
import ErrorHandlingService, { AcademicYearError, ErrorContext } from '../services/academic-year/ErrorHandlingService';
import { logger } from '../utils/logger';

const router = Router();
const errorHandlingService = new ErrorHandlingService();

/**
 * GET /api/error-monitoring/statistics
 * Get error statistics for a time period
 */
router.get('/statistics', async (req: Request, res: Response) => {
  try {
    const { startDate, endDate } = req.query;

    const start = startDate ? new Date(startDate as string) : undefined;
    const end = endDate ? new Date(endDate as string) : undefined;

    const statistics = await errorHandlingService.getErrorStatistics(start, end);

    res.json({
      success: true,
      data: statistics
    });
  } catch (error) {
    logger.error('Failed to get error statistics', {
      error: error instanceof Error ? error.message : 'Unknown error'
    });

    res.status(500).json({
      success: false,
      error: 'Failed to retrieve error statistics'
    });
  }
});

/**
 * GET /api/error-monitoring/unresolved
 * Get unresolved errors
 */
router.get('/unresolved', async (req: Request, res: Response) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;

    const unresolvedErrors = await errorHandlingService.getUnresolvedErrors(limit);

    res.json({
      success: true,
      data: unresolvedErrors,
      count: unresolvedErrors.length
    });
  } catch (error) {
    logger.error('Failed to get unresolved errors', {
      error: error instanceof Error ? error.message : 'Unknown error'
    });

    res.status(500).json({
      success: false,
      error: 'Failed to retrieve unresolved errors'
    });
  }
});

/**
 * POST /api/error-monitoring/resolve/:errorId
 * Manually resolve an error
 */
router.post('/resolve/:errorId', async (req: Request, res: Response) => {
  try {
    const { errorId } = req.params;

    await errorHandlingService.resolveError(errorId);

    res.json({
      success: true,
      message: 'Error resolved successfully'
    });
  } catch (error) {
    logger.error('Failed to resolve error', {
      errorId: req.params.errorId,
      error: error instanceof Error ? error.message : 'Unknown error'
    });

    res.status(500).json({
      success: false,
      error: 'Failed to resolve error'
    });
  }
});

/**
 * POST /api/error-monitoring/report
 * Report a new error (for testing or manual reporting)
 */
router.post('/report', async (req: Request, res: Response) => {
  try {
    const { message, errorType, severity, context } = req.body;

    if (!message || !errorType || !severity || !context) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: message, errorType, severity, context'
      });
    }

    const error = new AcademicYearError(
      message,
      errorType,
      severity,
      context as ErrorContext
    );

    const result = await errorHandlingService.handleError(error);

    res.json({
      success: true,
      data: result,
      message: 'Error reported and handled'
    });
  } catch (error) {
    logger.error('Failed to report error', {
      error: error instanceof Error ? error.message : 'Unknown error'
    });

    res.status(500).json({
      success: false,
      error: 'Failed to report error'
    });
  }
});

/**
 * GET /api/error-monitoring/health
 * Get error monitoring system health
 */
router.get('/health', async (req: Request, res: Response) => {
  try {
    // Get recent error statistics
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const statistics = await errorHandlingService.getErrorStatistics(oneDayAgo);

    // Determine health status
    const criticalErrors = statistics.errorsBySeverity['critical'] || 0;
    const highErrors = statistics.errorsBySeverity['high'] || 0;
    const unresolvedErrors = statistics.unresolvedErrors;

    let status = 'healthy';
    let message = 'Error monitoring system is operating normally';

    if (criticalErrors > 0) {
      status = 'critical';
      message = `${criticalErrors} critical errors detected in the last 24 hours`;
    } else if (highErrors > 5) {
      status = 'warning';
      message = `${highErrors} high-severity errors detected in the last 24 hours`;
    } else if (unresolvedErrors > 20) {
      status = 'warning';
      message = `${unresolvedErrors} unresolved errors pending`;
    }

    res.json({
      success: true,
      data: {
        status,
        message,
        statistics: {
          last24Hours: statistics,
          criticalErrors,
          highErrors,
          unresolvedErrors
        }
      }
    });
  } catch (error) {
    logger.error('Failed to get error monitoring health', {
      error: error instanceof Error ? error.message : 'Unknown error'
    });

    res.status(500).json({
      success: false,
      error: 'Failed to retrieve error monitoring health'
    });
  }
});

/**
 * GET /api/error-monitoring/dashboard
 * Get comprehensive dashboard data
 */
router.get('/dashboard', async (req: Request, res: Response) => {
  try {
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const [last24Hours, lastWeek, unresolved] = await Promise.all([
      errorHandlingService.getErrorStatistics(oneDayAgo),
      errorHandlingService.getErrorStatistics(oneWeekAgo),
      errorHandlingService.getUnresolvedErrors(10)
    ]);

    res.json({
      success: true,
      data: {
        last24Hours,
        lastWeek,
        recentUnresolved: unresolved,
        trends: {
          errorRate: last24Hours.totalErrors / 24, // Errors per hour
          resolutionRate: last24Hours.resolvedErrors / Math.max(last24Hours.totalErrors, 1),
          averageRecoveryTime: last24Hours.averageRecoveryTime
        }
      }
    });
  } catch (error) {
    logger.error('Failed to get error monitoring dashboard', {
      error: error instanceof Error ? error.message : 'Unknown error'
    });

    res.status(500).json({
      success: false,
      error: 'Failed to retrieve dashboard data'
    });
  }
});

export default router;
