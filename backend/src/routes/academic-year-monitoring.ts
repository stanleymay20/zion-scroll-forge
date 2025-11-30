/**
 * Academic Year Monitoring Routes
 * API endpoints for monitoring and alerting
 */

import express, { Request, Response } from 'express';
import { academicYearMonitoring } from '../services/academic-year/AcademicYearMonitoringService';
import { monitoringService } from '../services/MonitoringService';
import { logger } from '../utils/logger';

const router = express.Router();

/**
 * Get system health
 */
router.get('/health', (req: Request, res: Response) => {
  try {
    const health = academicYearMonitoring.getSystemHealth();

    res.json({
      success: true,
      data: health
    });
  } catch (error) {
    logger.error('Failed to get system health', { error });
    res.status(500).json({
      success: false,
      error: 'Failed to get system health'
    });
  }
});

/**
 * Get workflow metrics
 */
router.get('/workflows', (req: Request, res: Response) => {
  try {
    const { workflowId } = req.query;

    const metrics = academicYearMonitoring.getWorkflowMetrics(
      workflowId as string | undefined
    );

    res.json({
      success: true,
      data: metrics
    });
  } catch (error) {
    logger.error('Failed to get workflow metrics', { error });
    res.status(500).json({
      success: false,
      error: 'Failed to get workflow metrics'
    });
  }
});

/**
 * Get workflow dashboard
 */
router.get('/workflows/dashboard', (req: Request, res: Response) => {
  try {
    const dashboard = academicYearMonitoring.getWorkflowDashboard();

    res.json({
      success: true,
      data: dashboard
    });
  } catch (error) {
    logger.error('Failed to get workflow dashboard', { error });
    res.status(500).json({
      success: false,
      error: 'Failed to get workflow dashboard'
    });
  }
});

/**
 * Get AI agent metrics
 */
router.get('/agents', (req: Request, res: Response) => {
  try {
    const { agentName } = req.query;

    const metrics = academicYearMonitoring.getAgentMetrics(
      agentName as string | undefined
    );

    res.json({
      success: true,
      data: metrics
    });
  } catch (error) {
    logger.error('Failed to get agent metrics', { error });
    res.status(500).json({
      success: false,
      error: 'Failed to get agent metrics'
    });
  }
});

/**
 * Get AI agent dashboard
 */
router.get('/agents/dashboard', (req: Request, res: Response) => {
  try {
    const dashboard = academicYearMonitoring.getAgentDashboard();

    res.json({
      success: true,
      data: dashboard
    });
  } catch (error) {
    logger.error('Failed to get agent dashboard', { error });
    res.status(500).json({
      success: false,
      error: 'Failed to get agent dashboard'
    });
  }
});

/**
 * Get component metrics
 */
router.get('/components/:component', (req: Request, res: Response) => {
  try {
    const { component } = req.params;
    const { startTime, endTime, aggregation } = req.query;

    const start = startTime ? new Date(startTime as string) : undefined;
    const end = endTime ? new Date(endTime as string) : undefined;

    // Get metrics from base monitoring service
    const metrics = monitoringService.getMetrics(
      `academic_year.${component}`,
      start,
      end
    );

    // Aggregate if requested
    let result: any = metrics;
    if (aggregation) {
      result = monitoringService.getAggregatedMetrics(
        `academic_year.${component}`,
        aggregation as any,
        start,
        end
      );
    }

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    logger.error('Failed to get component metrics', { error });
    res.status(500).json({
      success: false,
      error: 'Failed to get component metrics'
    });
  }
});

/**
 * Get alerts
 */
router.get('/alerts', (req: Request, res: Response) => {
  try {
    const alerts = monitoringService.getActiveAlerts();

    // Filter for academic year related alerts
    const academicYearAlerts = alerts.filter(alert =>
      alert.ruleName.includes('Academic') ||
      alert.ruleName.includes('Workflow') ||
      alert.ruleName.includes('Agent')
    );

    res.json({
      success: true,
      data: academicYearAlerts
    });
  } catch (error) {
    logger.error('Failed to get alerts', { error });
    res.status(500).json({
      success: false,
      error: 'Failed to get alerts'
    });
  }
});

/**
 * Acknowledge alert
 */
router.post('/alerts/:alertId/acknowledge', (req: Request, res: Response) => {
  try {
    const { alertId } = req.params;

    monitoringService.acknowledgeAlert(alertId);

    res.json({
      success: true,
      message: 'Alert acknowledged'
    });
  } catch (error) {
    logger.error('Failed to acknowledge alert', { error });
    res.status(500).json({
      success: false,
      error: 'Failed to acknowledge alert'
    });
  }
});

/**
 * Resolve alert
 */
router.post('/alerts/:alertId/resolve', (req: Request, res: Response) => {
  try {
    const { alertId } = req.params;

    monitoringService.resolveAlert(alertId);

    res.json({
      success: true,
      message: 'Alert resolved'
    });
  } catch (error) {
    logger.error('Failed to resolve alert', { error });
    res.status(500).json({
      success: false,
      error: 'Failed to resolve alert'
    });
  }
});

/**
 * Get comprehensive dashboard
 */
router.get('/dashboard', (req: Request, res: Response) => {
  try {
    const systemHealth = academicYearMonitoring.getSystemHealth();
    const workflowDashboard = academicYearMonitoring.getWorkflowDashboard();
    const agentDashboard = academicYearMonitoring.getAgentDashboard();
    const alerts = monitoringService.getActiveAlerts();

    const dashboard = {
      systemHealth,
      workflows: workflowDashboard,
      agents: agentDashboard,
      alerts: {
        total: alerts.length,
        critical: alerts.filter(a => a.severity === 'critical').length,
        high: alerts.filter(a => a.severity === 'high').length,
        medium: alerts.filter(a => a.severity === 'medium').length,
        low: alerts.filter(a => a.severity === 'low').length
      },
      timestamp: new Date()
    };

    res.json({
      success: true,
      data: dashboard
    });
  } catch (error) {
    logger.error('Failed to get dashboard', { error });
    res.status(500).json({
      success: false,
      error: 'Failed to get dashboard'
    });
  }
});

/**
 * Record custom event
 */
router.post('/events', (req: Request, res: Response) => {
  try {
    const { event, data, userId } = req.body;

    monitoringService.recordEvent(event, data, userId);

    res.json({
      success: true,
      message: 'Event recorded'
    });
  } catch (error) {
    logger.error('Failed to record event', { error });
    res.status(500).json({
      success: false,
      error: 'Failed to record event'
    });
  }
});

/**
 * Record error
 */
router.post('/errors', (req: Request, res: Response) => {
  try {
    const { error, context } = req.body;

    const errorObj = new Error(error.message);
    errorObj.name = error.name;
    errorObj.stack = error.stack;

    monitoringService.recordError(errorObj, context);

    res.json({
      success: true,
      message: 'Error recorded'
    });
  } catch (error) {
    logger.error('Failed to record error', { error });
    res.status(500).json({
      success: false,
      error: 'Failed to record error'
    });
  }
});

export default router;
