# Content Creation Engine Operations Runbook

## Overview

This runbook provides operational procedures for managing the ScrollUniversity Content Creation Engine in production. It covers monitoring, troubleshooting, maintenance, and emergency procedures.

## Table of Contents

1. [System Architecture](#system-architecture)
2. [Monitoring & Alerting](#monitoring--alerting)
3. [Common Operations](#common-operations)
4. [Troubleshooting](#troubleshooting)
5. [Emergency Procedures](#emergency-procedures)
6. [Maintenance Tasks](#maintenance-tasks)
7. [Performance Optimization](#performance-optimization)

## System Architecture

### Core Components

```
Content Creation Engine
├── ContentCreationService (Core generation)
├── ContentVersionControl (Version management)
├── ScrollPedagogyValidator (Quality validation)
├── ContentCreationProductionIntegration (Production orchestration)
├── ProductionMonitoringService (Monitoring)
├── BackupRecoveryService (Backup/restore)
└── DeploymentOrchestrationService (Deployment)
```

### Integration Points

- **AI Gateway**: OpenAI, Anthropic, OpenRouter
- **Database**: PostgreSQL (content storage)
- **Cache**: Redis (job queue, caching)
- **Storage**: S3 (backups, media)
- **Monitoring**: Sentry, New Relic, Prometheus

## Monitoring & Alerting

### Key Metrics

#### Content Generation Metrics
```typescript
{
  totalJobs: number,           // Total jobs processed
  completedJobs: number,       // Successfully completed
  failedJobs: number,          // Failed jobs
  averageProcessingTime: number, // ms
  totalCost: number,           // USD
  averageQualityScore: number, // 0-1
  averagePedagogyScore: number, // 0-100
  queueDepth: number,          // Jobs waiting
  errorRate: number,           // Percentage
  throughput: number           // Jobs/hour
}
```

#### Alert Thresholds

| Metric | Warning | Critical | Action |
|--------|---------|----------|--------|
| Queue Depth | > 50 | > 100 | Scale workers |
| Error Rate | > 5% | > 10% | Investigate failures |
| Processing Time | > 3 min | > 5 min | Check AI services |
| Cost Per Job | > $3 | > $5 | Review prompts |
| Quality Score | < 0.75 | < 0.70 | Review content |

### Monitoring Dashboard

Access metrics at: `/api/monitoring/content-creation`

```bash
# Get current metrics
curl -X GET https://api.scrolluniversity.com/api/monitoring/content-creation/metrics

# Get job status
curl -X GET https://api.scrolluniversity.com/api/monitoring/content-creation/jobs/{jobId}

# Get active alerts
curl -X GET https://api/monitoring/alerts?service=ContentCreationService
```

### Log Locations

- **Application Logs**: `/var/log/scrolluniversity/content-creation.log`
- **Error Logs**: `/var/log/scrolluniversity/content-creation-error.log`
- **Job Logs**: `/var/log/scrolluniversity/jobs/{jobId}.log`

## Common Operations

### Starting Content Generation Job

```typescript
// Submit lecture generation job
const job = await contentCreationIntegration.submitJob(
  'lecture',
  {
    courseOutline: { id: 'COURSE_001', title: 'Sacred AI Engineering' },
    moduleOutline: { id: 'MODULE_001', title: 'Introduction to AI' },
    learningObjectives: [...],
    difficulty: 'INTERMEDIATE',
    targetAudience: 'undergraduate'
  },
  'high', // priority
  'admin@scrolluniversity.com' // requestedBy
);

console.log(`Job submitted: ${job.jobId}`);
```

### Checking Job Status

```typescript
// Get job status
const status = contentCreationIntegration.getJobStatus(jobId);

console.log(`Status: ${status.status}`);
console.log(`Progress: ${status.progress}%`);
console.log(`Quality Score: ${status.metrics.qualityScore}`);
```

### Cancelling Job

```typescript
// Cancel queued job
const cancelled = await contentCreationIntegration.cancelJob(jobId);

if (cancelled) {
  console.log('Job cancelled successfully');
} else {
  console.log('Job cannot be cancelled (already processing or completed)');
}
```

### Updating Configuration

```typescript
// Update workflow configuration
contentCreationIntegration.updateWorkflowConfiguration({
  minimumQualityScore: 0.80,
  minimumPedagogyScore: 80,
  enableAutoBackup: true,
  backupFrequency: 'hourly'
});
```

## Troubleshooting

### High Queue Depth

**Symptoms**: Queue depth > 50 jobs, slow processing

**Diagnosis**:
```bash
# Check queue depth
curl -X GET /api/monitoring/content-creation/metrics | jq '.queueDepth'

# Check active jobs
curl -X GET /api/monitoring/content-creation/jobs?status=processing
```

**Resolution**:
1. Scale up workers:
   ```bash
   # Increase max concurrent jobs
   kubectl scale deployment content-creation-workers --replicas=10
   ```

2. Check for stuck jobs:
   ```typescript
   // Find jobs processing > 10 minutes
   const stuckJobs = getAllJobs().filter(j => 
     j.status === 'processing' && 
     Date.now() - j.startTime > 600000
   );
   ```

3. Cancel stuck jobs if necessary

### High Error Rate

**Symptoms**: Error rate > 5%, many failed jobs

**Diagnosis**:
```bash
# Check recent errors
tail -n 100 /var/log/scrolluniversity/content-creation-error.log

# Get failed jobs
curl -X GET /api/monitoring/content-creation/jobs?status=failed
```

**Common Causes**:
1. **AI Service Outage**
   - Check AI Gateway health
   - Verify API keys
   - Check rate limits

2. **Quality Gate Failures**
   - Review quality scores
   - Check pedagogy validation
   - Adjust thresholds if needed

3. **Database Issues**
   - Check database connectivity
   - Verify schema migrations
   - Check disk space

**Resolution**:
```typescript
// Retry failed jobs
const failedJobs = getAllJobs().filter(j => j.status === 'failed');
for (const job of failedJobs) {
  if (job.retryCount < job.maxRetries) {
    await submitJob(job.type, job.request, job.priority, job.requestedBy);
  }
}
```

### Low Quality Scores

**Symptoms**: Average quality score < 0.75

**Diagnosis**:
```bash
# Check quality trends
curl -X GET /api/monitoring/content-creation/metrics | jq '.averageQualityScore'

# Review recent content
curl -X GET /api/content-creation/recent?limit=10
```

**Resolution**:
1. Review AI prompts for clarity
2. Check if content meets minimum length requirements
3. Verify pedagogy validation is working
4. Review and update quality thresholds
5. Retrain or adjust AI models if needed

### High Costs

**Symptoms**: Total cost exceeding budget, cost per job > $5

**Diagnosis**:
```bash
# Check cost metrics
curl -X GET /api/monitoring/content-creation/metrics | jq '.totalCost'

# Review expensive jobs
curl -X GET /api/monitoring/content-creation/jobs?sort=cost&order=desc&limit=10
```

**Resolution**:
1. Review prompt efficiency
2. Reduce token usage:
   - Optimize prompt length
   - Use cheaper models for simple tasks
   - Enable caching
3. Set cost limits:
   ```typescript
   updateWorkflowConfiguration({
     alertThresholds: {
       maxCostPerJob: 3.0
     }
   });
   ```

## Emergency Procedures

### System Outage

**Immediate Actions**:
1. Check system status:
   ```bash
   kubectl get pods -n scrolluniversity
   curl -X GET /api/health
   ```

2. Check dependencies:
   - Database connectivity
   - Redis availability
   - AI service status

3. Review recent deployments:
   ```bash
   kubectl rollout history deployment/content-creation-service
   ```

4. Rollback if needed:
   ```bash
   kubectl rollout undo deployment/content-creation-service
   ```

### Data Loss

**Immediate Actions**:
1. Stop all content generation jobs
2. Assess extent of data loss
3. Restore from backup:
   ```typescript
   await backupRecovery.restoreFromBackup({
     backupId: 'backup-20240101-120000',
     targetEnvironment: 'production',
     verifyIntegrity: true,
     createSnapshot: true
   });
   ```

4. Verify restored data
5. Resume operations

### AI Service Failure

**Immediate Actions**:
1. Enable fallback models:
   ```typescript
   aiGateway.enableFallback();
   ```

2. Queue jobs for retry:
   ```typescript
   // Pause new job processing
   contentCreationIntegration.pauseJobProcessor();
   ```

3. Monitor AI service status
4. Resume when service restored

### Quality Gate Failure Cascade

**Symptoms**: All jobs failing quality gates

**Immediate Actions**:
1. Temporarily disable quality gates:
   ```typescript
   updateWorkflowConfiguration({
     enableQualityGates: false
   });
   ```

2. Investigate root cause
3. Fix quality validation logic
4. Re-enable quality gates
5. Reprocess failed content

## Maintenance Tasks

### Daily Tasks

1. **Review Metrics**
   - Check dashboard for anomalies
   - Review error logs
   - Verify backup completion

2. **Monitor Costs**
   - Review daily AI spending
   - Check for cost spikes
   - Verify budget compliance

3. **Check Queue Health**
   - Ensure queue is processing
   - No stuck jobs
   - Reasonable queue depth

### Weekly Tasks

1. **Performance Review**
   - Analyze processing times
   - Review quality scores
   - Check pedagogy compliance

2. **Backup Verification**
   - Test backup restoration
   - Verify backup integrity
   - Clean up old backups

3. **Capacity Planning**
   - Review job volume trends
   - Plan for scaling needs
   - Optimize resource allocation

### Monthly Tasks

1. **Quality Audit**
   - Sample content review
   - Pedagogy compliance check
   - Spiritual alignment verification

2. **Cost Optimization**
   - Review AI model usage
   - Optimize prompts
   - Evaluate caching effectiveness

3. **System Updates**
   - Apply security patches
   - Update dependencies
   - Review configuration

## Performance Optimization

### Scaling Guidelines

**Horizontal Scaling**:
```bash
# Scale workers based on queue depth
if queueDepth > 50:
  kubectl scale deployment content-creation-workers --replicas=10
elif queueDepth > 20:
  kubectl scale deployment content-creation-workers --replicas=5
else:
  kubectl scale deployment content-creation-workers --replicas=3
```

**Vertical Scaling**:
```yaml
# Increase resources for heavy workloads
resources:
  requests:
    memory: "4Gi"
    cpu: "2000m"
  limits:
    memory: "8Gi"
    cpu: "4000m"
```

### Caching Strategy

1. **Enable AI Response Caching**:
   ```typescript
   aiGateway.enableCache({
     ttl: 7200, // 2 hours
     semanticEnabled: true,
     semanticThreshold: 0.95
   });
   ```

2. **Cache Frequently Generated Content**:
   - Common lecture templates
   - Standard assessments
   - Biblical integration patterns

3. **Monitor Cache Hit Rate**:
   ```bash
   curl -X GET /api/monitoring/cache/stats
   ```

### Prompt Optimization

1. **Reduce Token Usage**:
   - Remove unnecessary context
   - Use concise instructions
   - Leverage few-shot examples

2. **Batch Similar Requests**:
   - Group related content generation
   - Reuse context across jobs

3. **Use Appropriate Models**:
   - GPT-3.5 for simple tasks
   - GPT-4 for complex content
   - Claude for long-form content

## Contact Information

### On-Call Rotation

- **Primary**: DevOps Team (devops@scrolluniversity.com)
- **Secondary**: AI Team (ai-team@scrolluniversity.com)
- **Escalation**: CTO (cto@scrolluniversity.com)

### Support Channels

- **Slack**: #content-creation-ops
- **PagerDuty**: Content Creation Service
- **Email**: ops@scrolluniversity.com

### Documentation

- **API Docs**: https://docs.scrolluniversity.com/api/content-creation
- **Architecture**: https://docs.scrolluniversity.com/architecture/content-creation
- **Runbooks**: https://docs.scrolluniversity.com/runbooks

## Appendix

### Configuration Reference

```typescript
interface WorkflowConfiguration {
  enableAutoBackup: boolean;
  backupFrequency: 'immediate' | 'hourly' | 'daily';
  enableQualityGates: boolean;
  minimumQualityScore: number;
  minimumPedagogyScore: number;
  enableVersionControl: boolean;
  requireReview: boolean;
  enableMonitoring: boolean;
  alertThresholds: {
    maxProcessingTime: number;
    maxCostPerJob: number;
    minQualityScore: number;
    maxErrorRate: number;
    maxQueueDepth: number;
  };
}
```

### Useful Commands

```bash
# View logs
kubectl logs -f deployment/content-creation-service

# Check pod status
kubectl get pods -l app=content-creation

# Restart service
kubectl rollout restart deployment/content-creation-service

# View metrics
kubectl top pods -l app=content-creation

# Access database
kubectl exec -it postgres-0 -- psql -U scrolluniversity

# Check Redis
kubectl exec -it redis-0 -- redis-cli INFO
```

### Emergency Contacts

| Role | Name | Phone | Email |
|------|------|-------|-------|
| DevOps Lead | [Name] | [Phone] | devops-lead@scrolluniversity.com |
| AI Team Lead | [Name] | [Phone] | ai-lead@scrolluniversity.com |
| Database Admin | [Name] | [Phone] | dba@scrolluniversity.com |
| CTO | [Name] | [Phone] | cto@scrolluniversity.com |

---

**Last Updated**: 2024-01-26
**Version**: 1.0
**Owner**: DevOps Team
