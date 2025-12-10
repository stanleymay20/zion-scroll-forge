# Academic Year Automation System - Production Deployment Guide

## Overview

This guide provides step-by-step instructions for deploying the Academic Year Automation System (SU-AYAS) to production. This is a critical process that requires careful planning, execution, and validation.

## Prerequisites

### 1. Pre-Deployment Checklist

#### UAT Completion
- [ ] All UAT test scenarios executed
- [ ] 95%+ test pass rate achieved
- [ ] All P1 and P2 defects resolved
- [ ] User satisfaction ≥ 4.0/5.0
- [ ] Performance metrics validated
- [ ] Security audit passed
- [ ] Stakeholder sign-off obtained

#### Infrastructure Readiness
- [ ] Production Kubernetes cluster provisioned
- [ ] Database (PostgreSQL) configured and backed up
- [ ] Redis cache cluster configured
- [ ] Load balancer configured
- [ ] SSL certificates obtained and installed
- [ ] DNS records configured
- [ ] CDN configured (if applicable)
- [ ] Monitoring tools configured (Prometheus, Grafana, Sentry)

#### Security Readiness
- [ ] All secrets created in Kubernetes
- [ ] API keys rotated for production
- [ ] Firewall rules configured
- [ ] Network policies applied
- [ ] RBAC policies configured
- [ ] Backup encryption keys secured
- [ ] Disaster recovery plan documented

#### Team Readiness
- [ ] Deployment team identified and trained
- [ ] Support team trained and ready
- [ ] Escalation procedures documented
- [ ] Communication plan established
- [ ] Rollback procedures tested

### 2. Required Access

- Kubernetes cluster admin access
- Database admin credentials
- Container registry access
- DNS management access
- Monitoring system access
- Communication channels (Slack, email)

### 3. Required Tools

```bash
# Install required tools
kubectl version --client  # Kubernetes CLI
helm version             # Helm package manager
docker version           # Docker CLI
git version              # Git CLI
```

## Deployment Process

### Phase 1: Pre-Deployment (T-24 hours)

#### 1.1 Announce Deployment Window

Send notification to all stakeholders:

```
Subject: Academic Year Automation System - Production Deployment

Dear Scroll University Community,

The Academic Year Automation System (SU-AYAS) will be deployed to production on [DATE] at [TIME].

Deployment Window: [START TIME] - [END TIME]
Expected Downtime: None (zero-downtime deployment)
Affected Services: Academic calendar, registration, course management

During deployment:
- All services will remain available
- Some features may experience brief delays
- Support team will be monitoring closely

For questions or concerns, contact: it-support@scrolluniversity.edu

Thank you for your patience.

IT Department
Scroll University
```

#### 1.2 Create Production Backup

```bash
# Backup current production database
kubectl exec -it deployment/academic-year-system -n academic-year-system -- \
  npm run backup:create -- --type=full --tag=pre-deployment-$(date +%Y%m%d)

# Verify backup
kubectl exec -it deployment/academic-year-system -n academic-year-system -- \
  npm run backup:verify -- --tag=pre-deployment-$(date +%Y%m%d)

# Export backup to external storage
kubectl exec -it deployment/academic-year-system -n academic-year-system -- \
  npm run backup:export -- --destination=s3://backups/academic-year/
```

#### 1.3 Verify Staging Environment

```bash
# Run final staging tests
cd backend
npm run test:staging

# Check staging health
curl https://staging-api.scrolluniversity.edu/api/academic-year-monitoring/health

# Verify all services
npm run verify:staging
```

#### 1.4 Prepare Deployment Artifacts

```bash
# Tag release
git tag -a v1.0.0 -m "Production Release v1.0.0"
git push origin v1.0.0

# Build production image
cd backend
docker build -f Dockerfile.academic-year \
  -t scrolluniversity/academic-year-system:v1.0.0 \
  -t scrolluniversity/academic-year-system:latest .

# Push to registry
docker push scrolluniversity/academic-year-system:v1.0.0
docker push scrolluniversity/academic-year-system:latest

# Scan image for vulnerabilities
trivy image scrolluniversity/academic-year-system:v1.0.0
```

### Phase 2: Deployment (T-0)

#### 2.1 Enable Maintenance Mode (Optional)

If you need to enable maintenance mode:

```bash
kubectl patch configmap academic-year-config \
  -n academic-year-system \
  -p '{"data":{"MAINTENANCE_MODE":"true"}}'
```

#### 2.2 Create Production Secrets

```bash
# Create secrets from environment file
kubectl create secret generic academic-year-secrets \
  --from-env-file=backend/.env.academic-year.production \
  -n academic-year-system \
  --dry-run=client -o yaml | kubectl apply -f -

# Verify secrets
kubectl get secrets -n academic-year-system
```

#### 2.3 Apply Database Migrations

```bash
# Run migrations in a job
kubectl apply -f - <<EOF
apiVersion: batch/v1
kind: Job
metadata:
  name: academic-year-migration-$(date +%Y%m%d-%H%M%S)
  namespace: academic-year-system
spec:
  template:
    spec:
      containers:
      - name: migration
        image: scrolluniversity/academic-year-system:v1.0.0
        command: ["npm", "run", "migrate"]
        envFrom:
        - secretRef:
            name: academic-year-secrets
        - configMapRef:
            name: academic-year-config
      restartPolicy: Never
  backoffLimit: 3
EOF

# Monitor migration
kubectl logs -f job/academic-year-migration-* -n academic-year-system

# Verify migration success
kubectl get jobs -n academic-year-system
```

#### 2.4 Deploy Application

```bash
# Deploy using script
export IMAGE_TAG=v1.0.0
./scripts/deploy-academic-year.sh deploy

# Or deploy manually
kubectl apply -f k8s/academic-year/namespace.yaml
kubectl apply -f k8s/academic-year/configmap.yaml
kubectl apply -f k8s/academic-year/deployment.yaml
kubectl apply -f k8s/academic-year/ingress.yaml

# Monitor rollout
kubectl rollout status deployment/academic-year-system -n academic-year-system

# Watch pods
kubectl get pods -n academic-year-system -w
```

#### 2.5 Verify Deployment

```bash
# Check pod status
kubectl get pods -n academic-year-system

# Check service endpoints
kubectl get svc -n academic-year-system

# Check ingress
kubectl get ingress -n academic-year-system

# Test health endpoint
curl https://api.scrolluniversity.edu/api/academic-year-monitoring/health

# Run smoke tests
npm run test:smoke:production
```

#### 2.6 Disable Maintenance Mode

```bash
kubectl patch configmap academic-year-config \
  -n academic-year-system \
  -p '{"data":{"MAINTENANCE_MODE":"false"}}'

# Restart pods to pick up config change
kubectl rollout restart deployment/academic-year-system -n academic-year-system
```

### Phase 3: Post-Deployment Validation (T+1 hour)

#### 3.1 Run Integration Tests

```bash
# Run production integration tests
npm run test:integration:production

# Verify all endpoints
npm run verify:endpoints:production

# Check API responses
npm run test:api:production
```

#### 3.2 Monitor System Health

```bash
# Check system health
kubectl exec -it deployment/academic-year-system -n academic-year-system -- \
  npm run health:check

# View metrics
kubectl port-forward svc/academic-year-system 9090:9090 -n academic-year-system
# Open http://localhost:9090/metrics

# Check logs
kubectl logs -f deployment/academic-year-system -n academic-year-system --tail=100
```

#### 3.3 Verify Core Workflows

Test critical user workflows:

1. **Academic Calendar Access**
   ```bash
   curl -X GET https://api.scrolluniversity.edu/api/academic-calendar/years/current \
     -H "Authorization: Bearer $TOKEN"
   ```

2. **Student Registration**
   ```bash
   curl -X POST https://api.scrolluniversity.edu/api/registration/enroll \
     -H "Authorization: Bearer $TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"studentId":"test-student","courseId":"test-course"}'
   ```

3. **Faculty Content Generation**
   ```bash
   curl -X POST https://api.scrolluniversity.edu/api/faculty/content/generate \
     -H "Authorization: Bearer $TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"courseId":"test-course","moduleId":"test-module"}'
   ```

4. **AI Tutor Interaction**
   ```bash
   curl -X POST https://api.scrolluniversity.edu/api/courses/ai-tutor/ask \
     -H "Authorization: Bearer $TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"studentId":"test-student","lectureId":"test-lecture","question":"Test question"}'
   ```

#### 3.4 Performance Validation

```bash
# Run load test
npm run test:load:production

# Check response times
kubectl exec -it deployment/academic-year-system -n academic-year-system -- \
  npm run metrics:response-times

# Verify auto-scaling
kubectl get hpa -n academic-year-system
```

### Phase 4: Monitoring Setup (T+2 hours)

#### 4.1 Configure Alerts

```bash
# Apply alert rules
kubectl apply -f k8s/academic-year/monitoring/alert-rules.yaml

# Verify alerts
kubectl get prometheusrules -n academic-year-system
```

#### 4.2 Set Up Dashboards

1. **Grafana Dashboard**
   - Import dashboard from `docs/academic-year-automation/grafana-dashboard.json`
   - Configure data sources
   - Set up alert channels

2. **Sentry Project**
   - Verify error tracking
   - Configure alert rules
   - Set up team notifications

3. **New Relic APM**
   - Verify application monitoring
   - Configure custom dashboards
   - Set up alert policies

#### 4.3 Enable Log Aggregation

```bash
# Verify log shipping
kubectl logs -f deployment/academic-year-system -n academic-year-system | grep "Log shipped"

# Check Elasticsearch
curl https://logs.scrolluniversity.edu/_cat/indices?v

# Verify Kibana dashboards
# Open https://logs.scrolluniversity.edu
```

### Phase 5: Communication (T+4 hours)

#### 5.1 Announce Successful Deployment

```
Subject: Academic Year Automation System - Successfully Deployed

Dear Scroll University Community,

We are pleased to announce that the Academic Year Automation System (SU-AYAS) has been successfully deployed to production.

Deployment completed at: [TIME]
All systems operational: ✓
Performance validated: ✓
Security verified: ✓

New Features Available:
- Automated academic calendar management
- Intelligent course registration
- AI-powered tutoring
- Faculty content generation tools
- Comprehensive degree auditing

Getting Started:
- User Guide: https://docs.scrolluniversity.edu/academic-year/user-guide
- Video Tutorials: https://tutorials.scrolluniversity.edu/academic-year
- Support: it-support@scrolluniversity.edu

Thank you for your patience during the deployment.

IT Department
Scroll University
```

#### 5.2 Update Documentation

- [ ] Update system status page
- [ ] Publish release notes
- [ ] Update user documentation
- [ ] Update API documentation
- [ ] Update training materials

## Rollback Procedures

### When to Rollback

Rollback immediately if:
- Critical functionality is broken
- Data integrity issues detected
- Security vulnerabilities discovered
- System performance degraded significantly
- Multiple P1 defects reported

### Rollback Process

#### Option 1: Kubernetes Rollback

```bash
# Rollback to previous version
kubectl rollout undo deployment/academic-year-system -n academic-year-system

# Verify rollback
kubectl rollout status deployment/academic-year-system -n academic-year-system

# Check pods
kubectl get pods -n academic-year-system
```

#### Option 2: Redeploy Previous Version

```bash
# Deploy previous version
export IMAGE_TAG=v0.9.0
./scripts/deploy-academic-year.sh deploy

# Verify deployment
kubectl get pods -n academic-year-system
```

#### Option 3: Database Rollback

```bash
# Restore database from backup
kubectl exec -it deployment/academic-year-system -n academic-year-system -- \
  npm run backup:restore -- --tag=pre-deployment-$(date +%Y%m%d)

# Verify restoration
kubectl exec -it deployment/academic-year-system -n academic-year-system -- \
  npm run backup:verify
```

### Post-Rollback Actions

1. **Investigate Root Cause**
   - Collect logs and metrics
   - Analyze error reports
   - Identify failure point

2. **Fix Issues**
   - Create hotfix branch
   - Implement fixes
   - Test thoroughly

3. **Communicate**
   - Notify stakeholders
   - Explain what happened
   - Provide timeline for resolution

4. **Plan Redeployment**
   - Schedule new deployment window
   - Conduct additional testing
   - Update deployment procedures

## Monitoring and Support

### First 24 Hours

- **Continuous Monitoring**: DevOps team monitors all metrics
- **Support Team**: Available 24/7
- **Escalation**: Immediate escalation for any issues
- **Status Updates**: Every 4 hours to stakeholders

### First Week

- **Daily Health Checks**: Morning and evening
- **Performance Reviews**: Daily performance analysis
- **User Feedback**: Collect and triage feedback
- **Issue Resolution**: Address reported issues promptly

### First Month

- **Weekly Reviews**: System performance and user feedback
- **Optimization**: Implement performance improvements
- **Training**: Ongoing user training sessions
- **Documentation**: Update based on user feedback

## Success Criteria

### Technical Metrics
- ✓ System uptime ≥ 99.9%
- ✓ Response time < 2 seconds (95th percentile)
- ✓ Error rate < 0.1%
- ✓ Zero data loss incidents
- ✓ All security scans passed

### Business Metrics
- ✓ All critical workflows operational
- ✓ User satisfaction ≥ 4.0/5.0
- ✓ Support ticket volume within expected range
- ✓ No critical defects reported
- ✓ Adoption rate meets targets

### Operational Metrics
- ✓ Monitoring and alerting functional
- ✓ Backup and recovery tested
- ✓ Support team trained and ready
- ✓ Documentation complete and accessible
- ✓ Escalation procedures working

## Troubleshooting

### Common Issues

#### Issue: Pods Not Starting

```bash
# Check pod status
kubectl describe pod <pod-name> -n academic-year-system

# Check events
kubectl get events -n academic-year-system --sort-by='.lastTimestamp'

# Check logs
kubectl logs <pod-name> -n academic-year-system
```

**Solutions**:
- Verify secrets are created
- Check resource limits
- Verify image pull secrets
- Check init container logs

#### Issue: Database Connection Failures

```bash
# Test database connectivity
kubectl exec -it deployment/academic-year-system -n academic-year-system -- \
  npm run db:test

# Check database status
kubectl get pods -n database-namespace
```

**Solutions**:
- Verify DATABASE_URL secret
- Check database pod status
- Verify network policies
- Check connection pool settings

#### Issue: High Response Times

```bash
# Check metrics
kubectl exec -it deployment/academic-year-system -n academic-year-system -- \
  npm run metrics:response-times

# Check resource usage
kubectl top pods -n academic-year-system
```

**Solutions**:
- Scale up replicas
- Check database query performance
- Verify cache is working
- Review slow endpoints

#### Issue: AI Agent Failures

```bash
# Check AI agent metrics
curl https://api.scrolluniversity.edu/api/academic-year-monitoring/agents

# Check logs
kubectl logs -f deployment/academic-year-system -n academic-year-system | grep "AI Agent"
```

**Solutions**:
- Verify API keys
- Check rate limits
- Review confidence thresholds
- Check network connectivity

## Contact Information

### Deployment Team
- **Lead**: DevOps Manager
- **Email**: devops@scrolluniversity.edu
- **Slack**: #academic-year-deployment
- **Phone**: 1-800-SCROLL-U ext. 1001

### Support Team
- **Lead**: Support Manager
- **Email**: it-support@scrolluniversity.edu
- **Slack**: #academic-year-support
- **Phone**: 1-800-SCROLL-U ext. 2001

### Escalation
- **Level 1**: Support Team (0-30 minutes)
- **Level 2**: DevOps Team (30-60 minutes)
- **Level 3**: Engineering Lead (60+ minutes)
- **Level 4**: CTO (Critical issues)

## Appendices

### Appendix A: Environment Variables

See `backend/.env.academic-year.example` for complete list.

### Appendix B: Kubernetes Resources

See `k8s/academic-year/` directory for all manifests.

### Appendix C: Monitoring Dashboards

- Grafana: https://grafana.scrolluniversity.edu
- Prometheus: https://prometheus.scrolluniversity.edu
- Kibana: https://logs.scrolluniversity.edu

### Appendix D: API Documentation

See `docs/academic-year-automation/API_DOCUMENTATION.md`

---

**Document Version**: 1.0  
**Last Updated**: December 2024  
**Owner**: DevOps Team  
**Reviewers**: Engineering, IT, Academic Affairs

*"Commit your work to the LORD, and your plans will be established." - Proverbs 16:3*
