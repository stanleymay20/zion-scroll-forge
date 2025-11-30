/**
 * Academic Year Automation System Monitoring Service
 * Comprehensive monitoring and alerting for SU-AYAS
 * "Watch and pray" - Matthew 26:41
 */

import { EventEmitter } from 'events';
import { logger } from '../../utils/logger';
import { monitoringService } from '../MonitoringService';

export interface AcademicYearMetric {
  name: string;
  value: number;
  unit: string;
  component: 'calendar' | 'student' | 'faculty' | 'course' | 'workflow' | 'agent';
  tags?: Record<string, string>;
  timestamp: Date;
}

export interface WorkflowMetrics {
  workflowId: string;
  workflowName: string;
  status: 'running' | 'completed' | 'failed' | 'stalled';
  startTime: Date;
  endTime?: Date;
  duration?: number;
  stepsCompleted: number;
  totalSteps: number;
  errorCount: number;
}

export interface AgentPerformanceMetrics {
  agentName: string;
  requestCount: number;
  successCount: number;
  failureCount: number;
  averageResponseTime: number;
  p95ResponseTime: number;
  p99ResponseTime: number;
  confidenceScores: number[];
  averageConfidence: number;
}

export interface SystemHealthMetrics {
  timestamp: Date;
  components: {
    academicCalendar: ComponentHealth;
    studentLifecycle: ComponentHealth;
    facultyOperations: ComponentHealth;
    courseExecution: ComponentHealth;
    workflowEngine: ComponentHealth;
    aiAgents: ComponentHealth;
  };
  overallStatus: 'healthy' | 'degraded' | 'critical';
}

export interface ComponentHealth {
  status: 'healthy' | 'degraded' | 'critical';
  uptime: number;
  errorRate: number;
  responseTime: number;
  lastCheck: Date;
  issues: string[];
}

export class AcademicYearMonitoringService extends EventEmitter {
  private workflowMetrics: Map<string, WorkflowMetrics> = new Map();
  private agentMetrics: Map<string, AgentPerformanceMetrics> = new Map();
  private componentHealth: Map<string, ComponentHealth> = new Map();
  private monitoringInterval!: NodeJS.Timeout;

  constructor() {
    super();
    this.initializeComponentHealth();
    this.startMonitoring();
  }

  /**
   * Initialize component health tracking
   */
  private initializeComponentHealth(): void {
    const components = [
      'academicCalendar',
      'studentLifecycle',
      'facultyOperations',
      'courseExecution',
      'workflowEngine',
      'aiAgents'
    ];

    components.forEach(component => {
      this.componentHealth.set(component, {
        status: 'healthy',
        uptime: 0,
        errorRate: 0,
        responseTime: 0,
        lastCheck: new Date(),
        issues: []
      });
    });
  }

  /**
   * Start monitoring
   */
  private startMonitoring(): void {
    // Check system health every minute
    this.monitoringInterval = setInterval(() => {
      this.checkSystemHealth();
    }, 60000);

    logger.info('Academic Year monitoring started');
  }

  /**
   * Record academic year metric
   */
  recordMetric(metric: Omit<AcademicYearMetric, 'timestamp'>): void {
    const fullMetric: AcademicYearMetric = {
      ...metric,
      timestamp: new Date()
    };

    // Record to base monitoring service
    monitoringService.recordMetric({
      name: `academic_year.${metric.component}.${metric.name}`,
      value: metric.value,
      unit: metric.unit,
      tags: {
        component: metric.component,
        ...metric.tags
      }
    });

    // Emit event
    this.emit('metric', fullMetric);

    logger.debug('Academic year metric recorded', fullMetric);
  }

  /**
   * Track workflow execution
   */
  trackWorkflowStart(workflowId: string, workflowName: string, totalSteps: number): void {
    const metrics: WorkflowMetrics = {
      workflowId,
      workflowName,
      status: 'running',
      startTime: new Date(),
      stepsCompleted: 0,
      totalSteps,
      errorCount: 0
    };

    this.workflowMetrics.set(workflowId, metrics);

    this.recordMetric({
      name: 'workflow.started',
      value: 1,
      unit: 'count',
      component: 'workflow',
      tags: { workflowName }
    });

    logger.info('Workflow started', { workflowId, workflowName });
  }

  /**
   * Track workflow step completion
   */
  trackWorkflowStep(workflowId: string, stepNumber: number, success: boolean): void {
    const metrics = this.workflowMetrics.get(workflowId);
    if (!metrics) return;

    metrics.stepsCompleted = stepNumber;
    if (!success) {
      metrics.errorCount++;
    }

    this.recordMetric({
      name: 'workflow.step_completed',
      value: 1,
      unit: 'count',
      component: 'workflow',
      tags: {
        workflowName: metrics.workflowName,
        success: success.toString()
      }
    });
  }

  /**
   * Track workflow completion
   */
  trackWorkflowComplete(workflowId: string, status: 'completed' | 'failed' | 'stalled'): void {
    const metrics = this.workflowMetrics.get(workflowId);
    if (!metrics) return;

    metrics.status = status;
    metrics.endTime = new Date();
    metrics.duration = metrics.endTime.getTime() - metrics.startTime.getTime();

    this.recordMetric({
      name: 'workflow.completed',
      value: 1,
      unit: 'count',
      component: 'workflow',
      tags: {
        workflowName: metrics.workflowName,
        status
      }
    });

    this.recordMetric({
      name: 'workflow.duration',
      value: metrics.duration,
      unit: 'ms',
      component: 'workflow',
      tags: { workflowName: metrics.workflowName }
    });

    // Check for workflow issues
    if (status === 'failed' || status === 'stalled') {
      this.emit('workflowIssue', metrics);
    }

    logger.info('Workflow completed', {
      workflowId,
      status,
      duration: metrics.duration,
      errorCount: metrics.errorCount
    });
  }

  /**
   * Track AI agent performance
   */
  trackAgentRequest(
    agentName: string,
    responseTime: number,
    success: boolean,
    confidenceScore?: number
  ): void {
    let metrics = this.agentMetrics.get(agentName);

    if (!metrics) {
      metrics = {
        agentName,
        requestCount: 0,
        successCount: 0,
        failureCount: 0,
        averageResponseTime: 0,
        p95ResponseTime: 0,
        p99ResponseTime: 0,
        confidenceScores: [],
        averageConfidence: 0
      };
      this.agentMetrics.set(agentName, metrics);
    }

    metrics.requestCount++;
    if (success) {
      metrics.successCount++;
    } else {
      metrics.failureCount++;
    }

    // Update response time
    metrics.averageResponseTime =
      (metrics.averageResponseTime * (metrics.requestCount - 1) + responseTime) /
      metrics.requestCount;

    // Track confidence score
    if (confidenceScore !== undefined) {
      metrics.confidenceScores.push(confidenceScore);
      metrics.averageConfidence =
        metrics.confidenceScores.reduce((sum, score) => sum + score, 0) /
        metrics.confidenceScores.length;
    }

    // Record metrics
    this.recordMetric({
      name: 'agent.request',
      value: 1,
      unit: 'count',
      component: 'agent',
      tags: {
        agentName,
        success: success.toString()
      }
    });

    this.recordMetric({
      name: 'agent.response_time',
      value: responseTime,
      unit: 'ms',
      component: 'agent',
      tags: { agentName }
    });

    if (confidenceScore !== undefined) {
      this.recordMetric({
        name: 'agent.confidence',
        value: confidenceScore,
        unit: 'score',
        component: 'agent',
        tags: { agentName }
      });
    }

    // Check for agent performance issues
    if (!success || (confidenceScore !== undefined && confidenceScore < 0.7)) {
      this.emit('agentIssue', { agentName, success, confidenceScore, responseTime });
    }
  }

  /**
   * Update component health
   */
  updateComponentHealth(
    component: string,
    status: 'healthy' | 'degraded' | 'critical',
    errorRate: number,
    responseTime: number,
    issues: string[] = []
  ): void {
    const health = this.componentHealth.get(component);
    if (!health) return;

    health.status = status;
    health.errorRate = errorRate;
    health.responseTime = responseTime;
    health.lastCheck = new Date();
    health.issues = issues;

    this.recordMetric({
      name: 'component.health',
      value: status === 'healthy' ? 1 : status === 'degraded' ? 0.5 : 0,
      unit: 'score',
      component: component as any,
      tags: { status }
    });

    // Alert on critical status
    if (status === 'critical') {
      this.emit('componentCritical', { component, issues });
    }

    logger.info('Component health updated', { component, status, errorRate, responseTime });
  }

  /**
   * Check system health
   */
  private async checkSystemHealth(): Promise<void> {
    try {
      const components = Array.from(this.componentHealth.entries());
      let healthyCount = 0;
      let degradedCount = 0;
      let criticalCount = 0;

      components.forEach(([_, health]) => {
        if (health.status === 'healthy') healthyCount++;
        else if (health.status === 'degraded') degradedCount++;
        else criticalCount++;
      });

      const overallStatus: 'healthy' | 'degraded' | 'critical' =
        criticalCount > 0 ? 'critical' :
        degradedCount > 2 ? 'degraded' :
        'healthy';

      this.recordMetric({
        name: 'system.health',
        value: overallStatus === 'healthy' ? 1 : overallStatus === 'degraded' ? 0.5 : 0,
        unit: 'score',
        component: 'workflow'
      });

      // Alert on system issues
      if (overallStatus !== 'healthy') {
        this.emit('systemHealthIssue', {
          status: overallStatus,
          healthyCount,
          degradedCount,
          criticalCount
        });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Failed to check system health', { error: errorMessage });
    }
  }

  /**
   * Get system health metrics
   */
  getSystemHealth(): SystemHealthMetrics {
    const components: any = {};

    this.componentHealth.forEach((health, component) => {
      components[component] = { ...health };
    });

    const healthStatuses = Array.from(this.componentHealth.values()).map(h => h.status);
    const overallStatus: 'healthy' | 'degraded' | 'critical' =
      healthStatuses.includes('critical') ? 'critical' :
      healthStatuses.filter(s => s === 'degraded').length > 2 ? 'degraded' :
      'healthy';

    return {
      timestamp: new Date(),
      components,
      overallStatus
    };
  }

  /**
   * Get workflow metrics
   */
  getWorkflowMetrics(workflowId?: string): WorkflowMetrics[] {
    if (workflowId) {
      const metrics = this.workflowMetrics.get(workflowId);
      return metrics ? [metrics] : [];
    }

    return Array.from(this.workflowMetrics.values());
  }

  /**
   * Get agent performance metrics
   */
  getAgentMetrics(agentName?: string): AgentPerformanceMetrics[] {
    if (agentName) {
      const metrics = this.agentMetrics.get(agentName);
      return metrics ? [metrics] : [];
    }

    return Array.from(this.agentMetrics.values());
  }

  /**
   * Get workflow dashboard data
   */
  getWorkflowDashboard(): {
    totalWorkflows: number;
    runningWorkflows: number;
    completedWorkflows: number;
    failedWorkflows: number;
    averageDuration: number;
    successRate: number;
  } {
    const workflows = Array.from(this.workflowMetrics.values());
    const completed = workflows.filter(w => w.status === 'completed');
    const failed = workflows.filter(w => w.status === 'failed');
    const running = workflows.filter(w => w.status === 'running');

    const durations = workflows
      .filter(w => w.duration !== undefined)
      .map(w => w.duration!);

    const averageDuration = durations.length > 0
      ? durations.reduce((sum, d) => sum + d, 0) / durations.length
      : 0;

    const totalCompleted = completed.length + failed.length;
    const successRate = totalCompleted > 0
      ? completed.length / totalCompleted
      : 1;

    return {
      totalWorkflows: workflows.length,
      runningWorkflows: running.length,
      completedWorkflows: completed.length,
      failedWorkflows: failed.length,
      averageDuration,
      successRate
    };
  }

  /**
   * Get AI agent dashboard data
   */
  getAgentDashboard(): {
    totalAgents: number;
    totalRequests: number;
    averageSuccessRate: number;
    averageResponseTime: number;
    averageConfidence: number;
    agentPerformance: Array<{
      agentName: string;
      successRate: number;
      responseTime: number;
      confidence: number;
    }>;
  } {
    const agents = Array.from(this.agentMetrics.values());

    const totalRequests = agents.reduce((sum, a) => sum + a.requestCount, 0);
    const totalSuccess = agents.reduce((sum, a) => sum + a.successCount, 0);
    const averageSuccessRate = totalRequests > 0 ? totalSuccess / totalRequests : 1;

    const averageResponseTime = agents.length > 0
      ? agents.reduce((sum, a) => sum + a.averageResponseTime, 0) / agents.length
      : 0;

    const averageConfidence = agents.length > 0
      ? agents.reduce((sum, a) => sum + a.averageConfidence, 0) / agents.length
      : 0;

    const agentPerformance = agents.map(agent => ({
      agentName: agent.agentName,
      successRate: agent.requestCount > 0
        ? agent.successCount / agent.requestCount
        : 1,
      responseTime: agent.averageResponseTime,
      confidence: agent.averageConfidence
    }));

    return {
      totalAgents: agents.length,
      totalRequests,
      averageSuccessRate,
      averageResponseTime,
      averageConfidence,
      agentPerformance
    };
  }

  /**
   * Shutdown monitoring
   */
  shutdown(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
    }

    logger.info('Academic Year monitoring shutdown');
  }
}

export const academicYearMonitoring = new AcademicYearMonitoringService();
