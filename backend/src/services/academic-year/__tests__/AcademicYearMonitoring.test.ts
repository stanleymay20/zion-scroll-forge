/**
 * Academic Year Monitoring Service Tests
 */

import { it } from 'node:test';
import { describe } from 'node:test';
import { it } from 'node:test';
import { it } from 'node:test';
import { describe } from 'node:test';
import { it } from 'node:test';
import { it } from 'node:test';
import { it } from 'node:test';
import { it } from 'node:test';
import { it } from 'node:test';
import { describe } from 'node:test';
import { it } from 'node:test';
import { it } from 'node:test';
import { it } from 'node:test';
import { it } from 'node:test';
import { it } from 'node:test';
import { it } from 'node:test';
import { describe } from 'node:test';
import { it } from 'node:test';
import { it } from 'node:test';
import { it } from 'node:test';
import { it } from 'node:test';
import { it } from 'node:test';
import { describe } from 'node:test';
import { it } from 'node:test';
import { it } from 'node:test';
import { describe } from 'node:test';
import { afterEach } from 'node:test';
import { beforeEach } from 'node:test';
import { describe } from 'node:test';
import { AcademicYearMonitoringService } from '../AcademicYearMonitoringService';

describe('AcademicYearMonitoringService', () => {
  let monitoringService: AcademicYearMonitoringService;

  beforeEach(() => {
    monitoringService = new AcademicYearMonitoringService();
  });

  afterEach(() => {
    monitoringService.shutdown();
  });

  describe('Metric Recording', () => {
    it('should record metrics correctly', () => {
      const metricRecorded = jest.fn();
      monitoringService.on('metric', metricRecorded);

      monitoringService.recordMetric({
        name: 'test.metric',
        value: 100,
        unit: 'count',
        component: 'calendar'
      });

      expect(metricRecorded).toHaveBeenCalled();
      const metric = metricRecorded.mock.calls[0][0];
      expect(metric.name).toBe('test.metric');
      expect(metric.value).toBe(100);
      expect(metric.component).toBe('calendar');
    });

    it('should include timestamp in metrics', () => {
      const metricRecorded = jest.fn();
      monitoringService.on('metric', metricRecorded);

      monitoringService.recordMetric({
        name: 'test.metric',
        value: 100,
        unit: 'count',
        component: 'calendar'
      });

      const metric = metricRecorded.mock.calls[0][0];
      expect(metric.timestamp).toBeInstanceOf(Date);
    });
  });

  describe('Workflow Tracking', () => {
    it('should track workflow start', () => {
      monitoringService.trackWorkflowStart('wf-1', 'Test Workflow', 5);

      const metrics = monitoringService.getWorkflowMetrics('wf-1');
      expect(metrics).toHaveLength(1);
      expect(metrics[0].workflowId).toBe('wf-1');
      expect(metrics[0].workflowName).toBe('Test Workflow');
      expect(metrics[0].status).toBe('running');
      expect(metrics[0].totalSteps).toBe(5);
    });

    it('should track workflow steps', () => {
      monitoringService.trackWorkflowStart('wf-1', 'Test Workflow', 5);
      monitoringService.trackWorkflowStep('wf-1', 1, true);
      monitoringService.trackWorkflowStep('wf-1', 2, true);

      const metrics = monitoringService.getWorkflowMetrics('wf-1');
      expect(metrics[0].stepsCompleted).toBe(2);
      expect(metrics[0].errorCount).toBe(0);
    });

    it('should track workflow step failures', () => {
      monitoringService.trackWorkflowStart('wf-1', 'Test Workflow', 5);
      monitoringService.trackWorkflowStep('wf-1', 1, true);
      monitoringService.trackWorkflowStep('wf-1', 2, false);

      const metrics = monitoringService.getWorkflowMetrics('wf-1');
      expect(metrics[0].errorCount).toBe(1);
    });

    it('should track workflow completion', () => {
      monitoringService.trackWorkflowStart('wf-1', 'Test Workflow', 5);
      monitoringService.trackWorkflowComplete('wf-1', 'completed');

      const metrics = monitoringService.getWorkflowMetrics('wf-1');
      expect(metrics[0].status).toBe('completed');
      expect(metrics[0].endTime).toBeInstanceOf(Date);
      expect(metrics[0].duration).toBeGreaterThan(0);
    });

    it('should emit event on workflow failure', () => {
      const workflowIssue = jest.fn();
      monitoringService.on('workflowIssue', workflowIssue);

      monitoringService.trackWorkflowStart('wf-1', 'Test Workflow', 5);
      monitoringService.trackWorkflowComplete('wf-1', 'failed');

      expect(workflowIssue).toHaveBeenCalled();
    });
  });

  describe('AI Agent Tracking', () => {
    it('should track agent requests', () => {
      monitoringService.trackAgentRequest('ScrollRegistrar', 150, true, 0.95);

      const metrics = monitoringService.getAgentMetrics('ScrollRegistrar');
      expect(metrics).toHaveLength(1);
      expect(metrics[0].requestCount).toBe(1);
      expect(metrics[0].successCount).toBe(1);
      expect(metrics[0].averageResponseTime).toBe(150);
      expect(metrics[0].averageConfidence).toBe(0.95);
    });

    it('should track agent failures', () => {
      monitoringService.trackAgentRequest('ScrollRegistrar', 150, false);

      const metrics = monitoringService.getAgentMetrics('ScrollRegistrar');
      expect(metrics[0].failureCount).toBe(1);
      expect(metrics[0].successCount).toBe(0);
    });

    it('should calculate average response time', () => {
      monitoringService.trackAgentRequest('ScrollRegistrar', 100, true);
      monitoringService.trackAgentRequest('ScrollRegistrar', 200, true);
      monitoringService.trackAgentRequest('ScrollRegistrar', 300, true);

      const metrics = monitoringService.getAgentMetrics('ScrollRegistrar');
      expect(metrics[0].averageResponseTime).toBe(200);
    });

    it('should calculate average confidence', () => {
      monitoringService.trackAgentRequest('ScrollRegistrar', 100, true, 0.8);
      monitoringService.trackAgentRequest('ScrollRegistrar', 100, true, 0.9);
      monitoringService.trackAgentRequest('ScrollRegistrar', 100, true, 1.0);

      const metrics = monitoringService.getAgentMetrics('ScrollRegistrar');
      expect(metrics[0].averageConfidence).toBeCloseTo(0.9, 2);
    });

    it('should emit event on low confidence', () => {
      const agentIssue = jest.fn();
      monitoringService.on('agentIssue', agentIssue);

      monitoringService.trackAgentRequest('ScrollRegistrar', 150, true, 0.5);

      expect(agentIssue).toHaveBeenCalled();
    });

    it('should emit event on agent failure', () => {
      const agentIssue = jest.fn();
      monitoringService.on('agentIssue', agentIssue);

      monitoringService.trackAgentRequest('ScrollRegistrar', 150, false);

      expect(agentIssue).toHaveBeenCalled();
    });
  });

  describe('Component Health', () => {
    it('should update component health', () => {
      monitoringService.updateComponentHealth(
        'academicCalendar',
        'healthy',
        0.001,
        150,
        []
      );

      const health = monitoringService.getSystemHealth();
      expect(health.components.academicCalendar.status).toBe('healthy');
      expect(health.components.academicCalendar.errorRate).toBe(0.001);
      expect(health.components.academicCalendar.responseTime).toBe(150);
    });

    it('should emit event on critical component', () => {
      const componentCritical = jest.fn();
      monitoringService.on('componentCritical', componentCritical);

      monitoringService.updateComponentHealth(
        'academicCalendar',
        'critical',
        0.5,
        5000,
        ['Database connection failed']
      );

      expect(componentCritical).toHaveBeenCalled();
    });

    it('should calculate overall system status', () => {
      monitoringService.updateComponentHealth('academicCalendar', 'healthy', 0, 100);
      monitoringService.updateComponentHealth('studentLifecycle', 'healthy', 0, 100);
      monitoringService.updateComponentHealth('facultyOperations', 'healthy', 0, 100);

      const health = monitoringService.getSystemHealth();
      expect(health.overallStatus).toBe('healthy');
    });

    it('should mark system as degraded with multiple degraded components', () => {
      monitoringService.updateComponentHealth('academicCalendar', 'degraded', 0.05, 1000);
      monitoringService.updateComponentHealth('studentLifecycle', 'degraded', 0.05, 1000);
      monitoringService.updateComponentHealth('facultyOperations', 'degraded', 0.05, 1000);

      const health = monitoringService.getSystemHealth();
      expect(health.overallStatus).toBe('degraded');
    });

    it('should mark system as critical with any critical component', () => {
      monitoringService.updateComponentHealth('academicCalendar', 'healthy', 0, 100);
      monitoringService.updateComponentHealth('studentLifecycle', 'critical', 0.5, 5000);

      const health = monitoringService.getSystemHealth();
      expect(health.overallStatus).toBe('critical');
    });
  });

  describe('Dashboard Data', () => {
    it('should generate workflow dashboard', () => {
      monitoringService.trackWorkflowStart('wf-1', 'Test 1', 5);
      monitoringService.trackWorkflowComplete('wf-1', 'completed');

      monitoringService.trackWorkflowStart('wf-2', 'Test 2', 5);
      monitoringService.trackWorkflowComplete('wf-2', 'failed');

      monitoringService.trackWorkflowStart('wf-3', 'Test 3', 5);

      const dashboard = monitoringService.getWorkflowDashboard();
      expect(dashboard.totalWorkflows).toBe(3);
      expect(dashboard.runningWorkflows).toBe(1);
      expect(dashboard.completedWorkflows).toBe(1);
      expect(dashboard.failedWorkflows).toBe(1);
      expect(dashboard.successRate).toBe(0.5);
    });

    it('should generate agent dashboard', () => {
      monitoringService.trackAgentRequest('Agent1', 100, true, 0.9);
      monitoringService.trackAgentRequest('Agent1', 200, true, 0.8);
      monitoringService.trackAgentRequest('Agent2', 150, true, 0.95);

      const dashboard = monitoringService.getAgentDashboard();
      expect(dashboard.totalAgents).toBe(2);
      expect(dashboard.totalRequests).toBe(3);
      expect(dashboard.averageSuccessRate).toBe(1);
      expect(dashboard.agentPerformance).toHaveLength(2);
    });
  });

  describe('System Health Monitoring', () => {
    it('should emit system health issue on degraded status', (done) => {
      // Set a timeout to prevent hanging
      const timeout = setTimeout(() => {
        done(new Error('Test timed out'));
      }, 5000);

      monitoringService.on('systemHealthIssue', (health) => {
        clearTimeout(timeout);
        expect(health.status).toBe('degraded');
        done();
      });

      // Degrade multiple components
      monitoringService.updateComponentHealth('academicCalendar', 'degraded', 0.05, 1000);
      monitoringService.updateComponentHealth('studentLifecycle', 'degraded', 0.05, 1000);
      monitoringService.updateComponentHealth('facultyOperations', 'degraded', 0.05, 1000);
      
      // Manually trigger health check since it runs on interval
      setTimeout(() => {
        // If event hasn't fired by now, the test will timeout
      }, 100);
    });
  });
});
