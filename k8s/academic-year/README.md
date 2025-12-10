# Academic Year Automation System - Deployment Guide

This directory contains Kubernetes manifests and deployment configurations for the Academic Year Automation System (SU-AYAS).

## Table of Contents

- [Overview](#overview)
- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Configuration](#configuration)
- [Deployment](#deployment)
- [Monitoring](#monitoring)
- [Troubleshooting](#troubleshooting)
- [Rollback](#rollback)

## Overview

The Academic Year Automation System is deployed as a microservice within the ScrollUniversity platform. It manages:

- Academic Calendar Engine (ACE)
- Student Lifecycle Engine (SLE)
- Faculty & Teaching Operations Engine (FTOE)
- Course Execution Engine (CEE)
- Workflow Orchestration Layer

## Prerequisites

### Required Tools

- `kubectl` v1.25+
- `docker` v20.10+
- `helm` v3.10+ (optional, for advanced deployments)
- Access to a Kubernetes cluster (v1.25+)

### Required Secrets

Before deploying, you must create the following secrets:

```bash
# Create secrets from environment file
kubectl create secret generic academic-year-secrets \
  --from-env-file=backend/.env.academic-year.production \
  -n academic-year-system

# Or create secrets manually
kubectl create secret generic academic-year-secrets \
  --from-literal=DATABASE_URL='postgresql://...' \
  --from-literal=REDIS_URL='redis://...' \
  --from-literal=JWT_SECRET='...' \
  --from-literal=OPENAI_API_KEY='...' \
  -n academic-year-system
```

## Quick Start

### 1. Build Docker Image

```bash
# Build the Docker image
cd backend
docker build -f Dockerfile.academic-year -t scrolluniversity/academic-year-system:latest .

# Push to registry
docker push scrolluniversity/academic-year-system:latest
```

### 2. Deploy to Kubernetes

```bash
# Using deployment script (recommended)
./scripts/deploy-academic-year.sh deploy

# Or manually
kubectl apply -f k8s/academic-year/namespace.yaml
kubectl apply -f k8s/academic-year/configmap.yaml
kubectl apply -f k8s/academic-year/secrets.yaml
kubectl apply -f k8s/academic-year/deployment.yaml
kubectl apply -f k8s/academic-year/ingress.yaml
```

### 3. Verify Deployment

```bash
# Check pod status
kubectl get pods -n academic-year-system

# Check service status
kubectl get services -n academic-year-system

# Check ingress
kubectl get ingress -n academic-year-system

# View logs
kubectl logs -f deployment/academic-year-system -n academic-year-system
```

## Configuration

### ConfigMap

The `configmap.yaml` file contains non-sensitive configuration:

- Application settings
- Feature flags
- Performance tuning
- AI agent configuration
- Monitoring settings

To update configuration:

```bash
# Edit configmap
kubectl edit configmap academic-year-config -n academic-year-system

# Or apply changes
kubectl apply -f k8s/academic-year/configmap.yaml

# Restart pods to pick up changes
kubectl rollout restart deployment/academic-year-system -n academic-year-system
```

### Secrets

The `secrets.yaml` file is a template. Create actual secrets using:

```bash
# From environment file
kubectl create secret generic academic-year-secrets \
  --from-env-file=.env.production \
  -n academic-year-system

# Update existing secret
kubectl create secret generic academic-year-secrets \
  --from-env-file=.env.production \
  --dry-run=client -o yaml | kubectl apply -f -
```

### Environment Variables

Key environment variables:

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | PostgreSQL connection string | Yes |
| `REDIS_URL` | Redis connection string | Yes |
| `JWT_SECRET` | JWT signing secret | Yes |
| `OPENAI_API_KEY` | OpenAI API key | Yes |
| `SUPABASE_URL` | Supabase project URL | Yes |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key | Yes |

See `.env.academic-year.example` for complete list.

## Deployment

### Staging Deployment

```bash
# Set environment
export ENVIRONMENT=staging
export IMAGE_TAG=staging-$(git rev-parse --short HEAD)

# Deploy
./scripts/deploy-academic-year.sh deploy
```

### Production Deployment

```bash
# Set environment
export ENVIRONMENT=production
export IMAGE_TAG=v1.0.0

# Deploy
./scripts/deploy-academic-year.sh deploy

# Or use CI/CD pipeline
gh workflow run academic-year-deploy.yml \
  -f environment=production \
  -f image_tag=v1.0.0
```

### Rolling Updates

The deployment uses a `RollingUpdate` strategy:

- `maxSurge: 1` - One extra pod during update
- `maxUnavailable: 0` - No downtime during update

```bash
# Update image
kubectl set image deployment/academic-year-system \
  academic-year-system=scrolluniversity/academic-year-system:v1.1.0 \
  -n academic-year-system

# Watch rollout
kubectl rollout status deployment/academic-year-system -n academic-year-system
```

### Scaling

#### Manual Scaling

```bash
# Scale to 5 replicas
kubectl scale deployment/academic-year-system --replicas=5 -n academic-year-system
```

#### Auto-Scaling

The HorizontalPodAutoscaler (HPA) automatically scales based on:

- CPU utilization (target: 70%)
- Memory utilization (target: 80%)
- HTTP requests per second (target: 1000)

```bash
# View HPA status
kubectl get hpa -n academic-year-system

# Edit HPA
kubectl edit hpa academic-year-hpa -n academic-year-system
```

## Monitoring

### Health Checks

The deployment includes three types of health checks:

1. **Liveness Probe** - Restarts pod if unhealthy
   - Endpoint: `/api/health`
   - Interval: 10s
   - Timeout: 5s

2. **Readiness Probe** - Removes pod from service if not ready
   - Endpoint: `/api/health/ready`
   - Interval: 5s
   - Timeout: 3s

3. **Startup Probe** - Allows slow startup
   - Endpoint: `/api/health`
   - Failure threshold: 30 (150s total)

### Metrics

Prometheus metrics are exposed on port 9090:

```bash
# Port-forward to access metrics
kubectl port-forward deployment/academic-year-system 9090:9090 -n academic-year-system

# Access metrics
curl http://localhost:9090/metrics
```

### Logs

```bash
# View logs
kubectl logs -f deployment/academic-year-system -n academic-year-system

# View logs from specific pod
kubectl logs -f <pod-name> -n academic-year-system

# View logs from all pods
kubectl logs -f -l app=scrolluniversity,component=academic-year-automation -n academic-year-system

# View previous logs (after crash)
kubectl logs --previous <pod-name> -n academic-year-system
```

### Events

```bash
# View events
kubectl get events -n academic-year-system --sort-by='.lastTimestamp'

# Watch events
kubectl get events -n academic-year-system --watch
```

## Troubleshooting

### Pod Not Starting

```bash
# Describe pod
kubectl describe pod <pod-name> -n academic-year-system

# Check events
kubectl get events -n academic-year-system

# Check logs
kubectl logs <pod-name> -n academic-year-system
```

Common issues:

1. **ImagePullBackOff** - Check image name and registry credentials
2. **CrashLoopBackOff** - Check application logs and environment variables
3. **Pending** - Check resource quotas and node capacity

### Database Connection Issues

```bash
# Test database connectivity
kubectl run -it --rm debug \
  --image=postgres:15-alpine \
  --restart=Never \
  -n academic-year-system \
  -- psql $DATABASE_URL

# Check database migrations
kubectl logs -f deployment/academic-year-system -n academic-year-system | grep migration
```

### Performance Issues

```bash
# Check resource usage
kubectl top pods -n academic-year-system

# Check HPA status
kubectl get hpa -n academic-year-system

# Check node resources
kubectl top nodes
```

### Network Issues

```bash
# Test service connectivity
kubectl run -it --rm debug \
  --image=curlimages/curl:latest \
  --restart=Never \
  -n academic-year-system \
  -- curl http://academic-year-system/api/health

# Check network policies
kubectl get networkpolicies -n academic-year-system

# Check ingress
kubectl describe ingress academic-year-ingress -n academic-year-system
```

## Rollback

### Automatic Rollback

The CI/CD pipeline automatically rolls back on failure.

### Manual Rollback

```bash
# View rollout history
kubectl rollout history deployment/academic-year-system -n academic-year-system

# Rollback to previous version
kubectl rollout undo deployment/academic-year-system -n academic-year-system

# Rollback to specific revision
kubectl rollout undo deployment/academic-year-system --to-revision=2 -n academic-year-system

# Using deployment script
./scripts/deploy-academic-year.sh rollback
```

### Verify Rollback

```bash
# Check rollout status
kubectl rollout status deployment/academic-year-system -n academic-year-system

# Verify pods are running
kubectl get pods -n academic-year-system

# Run health checks
kubectl run health-check \
  --image=curlimages/curl:latest \
  --rm -i --restart=Never \
  -n academic-year-system \
  -- curl -f http://academic-year-system/api/health
```

## Backup and Disaster Recovery

### Database Backups

Automated backups run daily at 2 AM UTC:

```bash
# Manual backup
kubectl create job --from=cronjob/database-backup manual-backup-$(date +%Y%m%d) -n academic-year-system

# List backups
aws s3 ls s3://scrolluniversity-academic-year-backups/

# Restore from backup
kubectl run restore \
  --image=scrolluniversity/academic-year-system:latest \
  --rm -i --restart=Never \
  -n academic-year-system \
  -- npm run restore:backup -- --backup-id=<backup-id>
```

### Configuration Backups

```bash
# Backup all configurations
kubectl get all,configmap,secret,ingress -n academic-year-system -o yaml > backup-$(date +%Y%m%d).yaml

# Restore configurations
kubectl apply -f backup-20240101.yaml
```

## Security

### RBAC

The deployment uses a dedicated service account with minimal permissions:

```bash
# View service account
kubectl get serviceaccount academic-year-service-account -n academic-year-system

# View role bindings
kubectl get rolebindings -n academic-year-system
```

### Network Policies

Network policies restrict traffic:

- Ingress: Only from ingress controller
- Egress: Only to database, Redis, and external APIs

```bash
# View network policies
kubectl get networkpolicies -n academic-year-system

# Test network policy
kubectl run -it --rm debug \
  --image=nicolaka/netshoot \
  --restart=Never \
  -n academic-year-system \
  -- bash
```

### Pod Security

Pods run with security context:

- Non-root user (UID 1000)
- Read-only root filesystem
- No privilege escalation
- Dropped capabilities

## Maintenance

### Update Dependencies

```bash
# Update npm dependencies
cd backend
npm update
npm audit fix

# Rebuild image
docker build -f Dockerfile.academic-year -t scrolluniversity/academic-year-system:latest .

# Deploy
./scripts/deploy-academic-year.sh deploy
```

### Database Migrations

```bash
# Run migrations
kubectl run migration \
  --image=scrolluniversity/academic-year-system:latest \
  --rm -i --restart=Never \
  -n academic-year-system \
  -- npm run migrate:production

# Rollback migration
kubectl run migration-rollback \
  --image=scrolluniversity/academic-year-system:latest \
  --rm -i --restart=Never \
  -n academic-year-system \
  -- npm run migrate:rollback
```

## Support

For issues or questions:

- GitHub Issues: https://github.com/scrolluniversity/academic-year-system/issues
- Slack: #academic-year-system
- Email: devops@scrolluniversity.com

## License

Copyright © 2024 ScrollUniversity. All rights reserved.
