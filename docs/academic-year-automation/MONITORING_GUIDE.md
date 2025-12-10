# Academic Year Automation System - Monitoring Guide

## Overview

The Academic Year Automation System (SU-AYAS) includes comprehensive monitoring and alerting capabilities to ensure system health, track performance, and provide early warning of issues.

## Monitoring Components

### 1. System Health Monitoring

Tracks the health of all major system components:

- **Academic Calendar Engine**: Calendar operations, event scheduling, deadline tracking
- **Student Lifecycle Engine**: Admissions, registrations, graduations
- **Faculty Operations Engine**: Teaching assignments, content generation, grading
- **Course Execution Engine**: Module releases, AI tutor sessions
- **Workflow Engine**: Workflow execution, state management
- **AI Agents**: Agent performance, confidence scores, response times

### 2. Workflow Monitoring

Tracks workflow execution metrics:

- Total workflows executed
- Running workflows
- Completed workflows
- Failed workflows
- Average duration
- Success rate
- Step-by-step progress

### 3. AI Agent Performance Monitoring

Monitors AI agent performance:

- Request count
- Success/failure rates
- Response times (average, P95, P99)
- Confidence scores
- Agent-specific metrics

### 4. Alert System

Automated alerting for:

- Component failures
- High error rates
- Slow response times
- Workflow failures
- Low AI confidence scores
- System degradation

## API Endpoints

### Health Check

```
GET /api/academic-year-monitoring/health
```

Returns overall system health status.

**Response:**
```json
{
  "success": true,
  "data": {
    "timestamp": "2024-01-15T10:30:00Z",
    "components": {
      "academicCalendar": {
        "status": "healthy",
        "uptime": 99.9,
        "errorRate": 0.001,
        "responseTime": 150,
        "lastCheck": "2024-01-15T10:30:00Z",
        "issues": []
      },
      ...
    },
    "overallStatus": "healthy"
  }
}
```

### Workflow Metrics

```
GET /api/academic-year-monitoring/workflows
GET /api/academic-year-monitoring/workflows?workflowId=<id>
GET /api/academic-year-monitoring/workflows/dashboard
```

Returns workflow execution metrics.

### AI Agent Metrics

```
GET /api/academic-year-monitoring/agents
GET /api/academic-year-monitoring/agents?agentName=<name>
GET /api/academic-year-monitoring/agents/dashboard
```

Returns AI agent performance metrics.

### Alerts

```
GET /api/academic-year-monitoring/alerts
POST /api/academic-year-monitoring/alerts/:alertId/acknowledge
POST /api/academic-year-monitoring/alerts/:alertId/resolve
```

Manage system alerts.

### Comprehensive Dashboard

```
GET /api/academic-year-monitoring/dashboard
```

Returns all monitoring data in a single response.

## Using the Monitoring Service

### Recording Metrics

```typescript
import { academicYearMonitoring } from './services/academic-year/AcademicYearMonitoringService';

// Record a metric
academicYearMonitoring.recordMetric({
  name: 'registration.count',
  value: 1,
  unit: 'count',
  component: 'student',
  tags: { semester: 'Fall 2024' }
});
```

### Tracking Workflows

```typescript
// Start workflow tracking
academicYearMonitoring.trackWorkflowStart(
  'workflow-123',
  'Student Registration',
  5 // total steps
);

// Track step completion
academicYearMonitoring.trackWorkflowStep('workflow-123', 1, true);

// Complete workflow
academicYearMonitoring.trackWorkflowComplete('workflow-123', 'completed');
```

### Tracking AI Agent Performance

```typescript
const startTime = Date.now();

try {
  const result = await aiAgent.process(request);
  const responseTime = Date.now() - startTime;
  
  academicYearMonitoring.trackAgentRequest(
    'ScrollRegistrar',
    responseTime,
    true,
    result.confidenceScore
  );
} catch (error) {
  const responseTime = Date.now() - startTime;
  
  academicYearMonitoring.trackAgentRequest(
    'ScrollRegistrar',
    responseTime,
    false
  );
}
```

### Updating Component Health

```typescript
academicYearMonitoring.updateComponentHealth(
  'academicCalendar',
  'healthy',
  0.001, // error rate
  150,   // response time in ms
  []     // issues
);
```

## Monitoring Events

The monitoring service emits events that you can listen to:

```typescript
academicYearMonitoring.on('metric', (metric) => {
  console.log('Metric recorded:', metric);
});

academicYearMonitoring.on('workflowIssue', (workflow) => {
  console.log('Workflow issue detected:', workflow);
});

academicYearMonitoring.on('agentIssue', (agent) => {
  console.log('Agent issue detected:', agent);
});

academicYearMonitoring.on('componentCritical', ({ component, issues }) => {
  console.log(`Component ${component} is critical:`, issues);
});

academicYearMonitoring.on('systemHealthIssue', (health) => {
  console.log('System health issue:', health);
});
```

## Alert Rules

Default alert rules are configured for:

1. **High Error Rate**: Triggers when error count exceeds 10 in 5 minutes
2. **High Response Time**: Triggers when response time exceeds 5 seconds
3. **Database Unhealthy**: Triggers when database health check fails
4. **Cache Unhealthy**: Triggers when cache health check fails
5. **High Security Events**: Triggers when security events exceed 5 in 5 minutes

### Custom Alert Rules

You can add custom alert rules:

```typescript
import { monitoringService } from './services/MonitoringService';

monitoringService.addAlertRule({
  id: 'workflow-failure-rate',
  name: 'High Workflow Failure Rate',
  metric: 'academic_year.workflow.workflow.completed',
  condition: 'gt',
  threshold: 0.1, // 10% failure rate
  duration: 300,  // 5 minutes
  severity: 'high',
  enabled: true,
  channels: ['email', 'slack']
});
```

## Dashboard Access

The monitoring dashboard is available at:

```
/admin/academic-year/monitoring
```

Features:
- Real-time system health overview
- Workflow execution metrics
- AI agent performance metrics
- Active alerts with acknowledge/resolve actions
- Auto-refresh every 30 seconds
- Component-level drill-down

## Best Practices

### 1. Monitor Critical Paths

Always monitor critical workflows:
- Student registration
- Grade submission
- Graduation evaluation
- AI agent interactions

### 2. Set Appropriate Thresholds

Configure alert thresholds based on your system's normal behavior:
- Error rates: < 1% for critical operations
- Response times: < 2 seconds for user-facing operations
- Workflow success rate: > 95%
- AI confidence: > 70%

### 3. Regular Health Checks

Schedule regular health checks:
- System health: Every minute
- Component health: Every 5 minutes
- Workflow status: Every 10 minutes

### 4. Alert Fatigue Prevention

- Use appropriate severity levels
- Implement alert aggregation
- Set up escalation policies
- Acknowledge and resolve alerts promptly

### 5. Performance Baselines

Establish performance baselines:
- Track metrics over time
- Identify trends and patterns
- Set realistic thresholds
- Adjust as system evolves

## Troubleshooting

### High Error Rates

1. Check component health status
2. Review recent workflow failures
3. Examine error logs
4. Check AI agent performance
5. Verify database connectivity

### Slow Response Times

1. Check database query performance
2. Review AI agent response times
3. Examine workflow execution times
4. Check system resource usage
5. Review caching effectiveness

### Workflow Failures

1. Check workflow logs
2. Review step-by-step execution
3. Examine error messages
4. Verify prerequisite conditions
5. Check AI agent availability

### AI Agent Issues

1. Review confidence scores
2. Check response times
3. Examine error rates
4. Verify API connectivity
5. Review prompt quality

## Integration with External Tools

### Prometheus

Metrics are exposed in Prometheus format at:
```
GET /api/monitoring/metrics
```

### Grafana

Import the provided Grafana dashboard template:
```
docs/academic-year-automation/grafana-dashboard.json
```

### Sentry

Errors are automatically sent to Sentry when configured:
```
SENTRY_DSN=your-sentry-dsn
SENTRY_ENVIRONMENT=production
```

### Slack

Configure Slack webhooks for alerts:
```
SLACK_WEBHOOK_URL=your-slack-webhook-url
```

### PagerDuty

Configure PagerDuty for critical alerts:
```
PAGERDUTY_API_KEY=your-pagerduty-key
PAGERDUTY_SERVICE_ID=your-service-id
```

## Metrics Reference

### System Metrics

- `academic_year.system.health`: Overall system health (0-1)
- `academic_year.component.health`: Component health (0-1)

### Workflow Metrics

- `academic_year.workflow.workflow.started`: Workflow start count
- `academic_year.workflow.workflow.completed`: Workflow completion count
- `academic_year.workflow.workflow.step_completed`: Step completion count
- `academic_year.workflow.workflow.duration`: Workflow duration (ms)

### Agent Metrics

- `academic_year.agent.agent.request`: Agent request count
- `academic_year.agent.agent.response_time`: Agent response time (ms)
- `academic_year.agent.agent.confidence`: Agent confidence score (0-1)

### Component Metrics

- `academic_year.calendar.*`: Academic calendar metrics
- `academic_year.student.*`: Student lifecycle metrics
- `academic_year.faculty.*`: Faculty operations metrics
- `academic_year.course.*`: Course execution metrics

## Support

For monitoring issues or questions:
- Email: monitoring@scrolluniversity.edu
- Slack: #academic-year-monitoring
- Documentation: https://docs.scrolluniversity.edu/monitoring
