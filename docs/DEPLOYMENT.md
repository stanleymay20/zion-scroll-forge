# ScrollUniversity Deployment Guide

## Overview

This guide covers the complete deployment process for ScrollUniversity, including infrastructure setup, CI/CD pipeline configuration, monitoring, and backup systems.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Infrastructure Setup](#infrastructure-setup)
3. [Kubernetes Deployment](#kubernetes-deployment)
4. [CI/CD Pipeline](#cicd-pipeline)
5. [Monitoring Setup](#monitoring-setup)
6. [Backup Configuration](#backup-configuration)
7. [Troubleshooting](#troubleshooting)

## Prerequisites

### Required Tools

- **kubectl** v1.28+
- **Docker** v24+
- **Helm** v3.12+ (optional)
- **AWS CLI** v2+ (for S3 backups)
- **Node.js** v20+
- **PostgreSQL** v15+
- **Redis** v7+

### Required Accounts

- GitHub account with repository access
- Container registry (GitHub Container Registry or Docker Hub)
- Kubernetes cluster (EKS, GKE, AKS, or self-hosted)
- AWS account (for S3 backups)
- Sentry account (for error tracking)
- Slack workspace (for notifications)

### Environment Variables

Create a `.env.production` file with the following variables:

```bash
# Application
NODE_ENV=production
PORT=3000
HOST=0.0.0.0

# Database
DATABASE_URL=postgresql://user:password@postgres:5432/scrolluniversity
DATABASE_POOL_MIN=10
DATABASE_POOL_MAX=50

# Redis
REDIS_URL=redis://redis:6379
REDIS_PASSWORD=your-redis-password

# Security
JWT_SECRET=your-jwt-secret-at-least-32-characters
BCRYPT_ROUNDS=14

# AI Services
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...

# Monitoring
SENTRY_DSN=https://...@sentry.io/...
NEW_RELIC_LICENSE_KEY=...

# Backup
BACKUP_S3_BUCKET=scrolluniversity-backups
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
```

## Infrastructure Setup

### 1. Kubernetes Cluster Setup

#### AWS EKS

```bash
# Create EKS cluster
eksctl create cluster \
  --name scrolluniversity-production \
  --region us-east-1 \
  --nodegroup-name standard-workers \
  --node-type t3.xlarge \
  --nodes 3 \
  --nodes-min 3 \
  --nodes-max 10 \
  --managed
```

#### Google GKE

```bash
# Create GKE cluster
gcloud container clusters create scrolluniversity-production \
  --region us-central1 \
  --machine-type n1-standard-4 \
  --num-nodes 3 \
  --enable-autoscaling \
  --min-nodes 3 \
  --max-nodes 10
```

### 2. Install Required Add-ons

```bash
# Install NGINX Ingress Controller
kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.8.1/deploy/static/provider/cloud/deploy.yaml

# Install cert-manager for SSL certificates
kubectl apply -f https://github.com/cert-manager/cert-manager/releases/download/v1.13.0/cert-manager.yaml

# Install Metrics Server
kubectl apply -f https://github.com/kubernetes-sigs/metrics-server/releases/latest/download/components.yaml
```

## Kubernetes Deployment

### 1. Create Namespace and Secrets

```bash
# Create namespace
kubectl apply -f k8s/namespace.yaml

# Create secrets from .env.production
kubectl create secret generic scrolluniversity-secrets \
  --from-env-file=.env.production \
  -n scrolluniversity

# Verify secrets
kubectl get secrets -n scrolluniversity
```

### 2. Deploy ConfigMaps

```bash
# Apply ConfigMaps
kubectl apply -f k8s/configmap.yaml

# Verify ConfigMaps
kubectl get configmaps -n scrolluniversity
```

### 3. Deploy Application

```bash
# Deploy backend
kubectl apply -f k8s/backend-deployment.yaml

# Deploy frontend
kubectl apply -f k8s/frontend-deployment.yaml

# Deploy ingress
kubectl apply -f k8s/ingress.yaml

# Check deployment status
kubectl get pods -n scrolluniversity
kubectl get services -n scrolluniversity
kubectl get ingress -n scrolluniversity
```

### 4. Verify Deployment

```bash
# Check pod status
kubectl get pods -n scrolluniversity -w

# Check logs
kubectl logs -f deployment/scrolluniversity-backend -n scrolluniversity

# Test health endpoint
kubectl port-forward svc/scrolluniversity-backend 3000:80 -n scrolluniversity
curl http://localhost:3000/health
```

## CI/CD Pipeline

### 1. GitHub Secrets Configuration

Add the following secrets to your GitHub repository:

```
Settings → Secrets and variables → Actions → New repository secret
```

Required secrets:
- `KUBE_CONFIG`: Base64-encoded kubeconfig file
- `SNYK_TOKEN`: Snyk API token for security scanning
- `SENTRY_AUTH_TOKEN`: Sentry authentication token
- `SLACK_WEBHOOK`: Slack webhook URL for notifications

### 2. Kubeconfig Setup

```bash
# Get kubeconfig
kubectl config view --raw > kubeconfig.yaml

# Base64 encode
cat kubeconfig.yaml | base64 > kubeconfig.base64

# Add to GitHub secrets
# Copy contents of kubeconfig.base64 to KUBE_CONFIG secret
```

### 3. Trigger Deployment

```bash
# Push to main branch triggers automatic deployment
git push origin main

# Or manually trigger via GitHub Actions UI
# Actions → Production Deployment → Run workflow
```

### 4. Monitor Deployment

```bash
# Watch deployment progress
kubectl rollout status deployment/scrolluniversity-backend -n scrolluniversity

# Check deployment history
kubectl rollout history deployment/scrolluniversity-backend -n scrolluniversity

# Rollback if needed
kubectl rollout undo deployment/scrolluniversity-backend -n scrolluniversity
```

## Monitoring Setup

### 1. Deploy Prometheus

```bash
# Deploy Prometheus
kubectl apply -f k8s/monitoring/prometheus.yaml

# Verify Prometheus
kubectl get pods -n scrolluniversity -l app=prometheus

# Access Prometheus UI
kubectl port-forward svc/prometheus 9090:9090 -n scrolluniversity
# Open http://localhost:9090
```

### 2. Deploy Grafana

```bash
# Deploy Grafana
kubectl apply -f k8s/monitoring/grafana.yaml

# Get Grafana admin password
kubectl get secret grafana-secrets -n scrolluniversity -o jsonpath="{.data.admin-password}" | base64 -d

# Access Grafana UI
kubectl port-forward svc/grafana 3000:80 -n scrolluniversity
# Open http://localhost:3000
```

### 3. Deploy Alertmanager

```bash
# Update Slack webhook in alertmanager.yaml
# Then deploy
kubectl apply -f k8s/monitoring/alertmanager.yaml

# Verify Alertmanager
kubectl get pods -n scrolluniversity -l app=alertmanager
```

### 4. Configure Dashboards

Import pre-built dashboards in Grafana:
- Kubernetes Cluster Monitoring (ID: 7249)
- Node Exporter Full (ID: 1860)
- PostgreSQL Database (ID: 9628)
- Redis Dashboard (ID: 11835)

## Logging Setup (ELK Stack)

### 1. Deploy Elasticsearch

```bash
# Deploy Elasticsearch
kubectl apply -f k8s/logging/elasticsearch.yaml

# Wait for Elasticsearch to be ready
kubectl wait --for=condition=ready pod -l app=elasticsearch -n scrolluniversity --timeout=300s

# Verify Elasticsearch
kubectl get pods -n scrolluniversity -l app=elasticsearch
```

### 2. Deploy Logstash

```bash
# Deploy Logstash
kubectl apply -f k8s/logging/logstash.yaml

# Verify Logstash
kubectl get pods -n scrolluniversity -l app=logstash
```

### 3. Deploy Kibana

```bash
# Deploy Kibana
kubectl apply -f k8s/logging/kibana.yaml

# Access Kibana UI
kubectl port-forward svc/kibana 5601:80 -n scrolluniversity
# Open http://localhost:5601
```

### 4. Deploy Filebeat

```bash
# Deploy Filebeat DaemonSet
kubectl apply -f k8s/logging/filebeat.yaml

# Verify Filebeat on all nodes
kubectl get pods -n scrolluniversity -l app=filebeat
```

## Backup Configuration

### 1. Configure S3 Bucket

```bash
# Create S3 bucket
aws s3 mb s3://scrolluniversity-backups --region us-east-1

# Enable versioning
aws s3api put-bucket-versioning \
  --bucket scrolluniversity-backups \
  --versioning-configuration Status=Enabled

# Enable encryption
aws s3api put-bucket-encryption \
  --bucket scrolluniversity-backups \
  --server-side-encryption-configuration '{
    "Rules": [{
      "ApplyServerSideEncryptionByDefault": {
        "SSEAlgorithm": "AES256"
      }
    }]
  }'
```

### 2. Deploy Backup CronJobs

```bash
# Deploy backup CronJobs
kubectl apply -f k8s/backup/backup-cronjob.yaml

# Verify CronJobs
kubectl get cronjobs -n scrolluniversity

# Manually trigger backup
kubectl create job --from=cronjob/database-backup manual-backup-$(date +%s) -n scrolluniversity
```

### 3. Test Backup Restoration

```bash
# List backups
aws s3 ls s3://scrolluniversity-backups/database/

# Download backup
aws s3 cp s3://scrolluniversity-backups/database/scrolluniversity-db-20240101-120000.sql.gz /tmp/

# Restore database
gunzip < /tmp/scrolluniversity-db-20240101-120000.sql.gz | psql $DATABASE_URL
```

## Scaling

### Manual Scaling

```bash
# Scale backend
kubectl scale deployment scrolluniversity-backend --replicas=5 -n scrolluniversity

# Scale frontend
kubectl scale deployment scrolluniversity-frontend --replicas=3 -n scrolluniversity
```

### Auto-scaling

HorizontalPodAutoscaler is already configured in deployment manifests:
- Backend: 3-20 replicas based on CPU (70%) and Memory (80%)
- Frontend: 3-10 replicas based on CPU (70%) and Memory (80%)

## Troubleshooting

### Pod Not Starting

```bash
# Check pod status
kubectl describe pod <pod-name> -n scrolluniversity

# Check logs
kubectl logs <pod-name> -n scrolluniversity

# Check events
kubectl get events -n scrolluniversity --sort-by='.lastTimestamp'
```

### Database Connection Issues

```bash
# Test database connectivity
kubectl run -it --rm debug --image=postgres:15-alpine --restart=Never -n scrolluniversity -- \
  psql $DATABASE_URL -c "SELECT 1"

# Check database pod
kubectl logs -f deployment/postgres -n scrolluniversity
```

### High Memory Usage

```bash
# Check resource usage
kubectl top pods -n scrolluniversity

# Check resource limits
kubectl describe pod <pod-name> -n scrolluniversity | grep -A 5 "Limits"

# Increase limits if needed
kubectl edit deployment scrolluniversity-backend -n scrolluniversity
```

### SSL Certificate Issues

```bash
# Check certificate status
kubectl describe certificate scrolluniversity-tls -n scrolluniversity

# Check cert-manager logs
kubectl logs -n cert-manager deployment/cert-manager

# Manually trigger certificate renewal
kubectl delete certificate scrolluniversity-tls -n scrolluniversity
kubectl apply -f k8s/ingress.yaml
```

## Maintenance

### Update Application

```bash
# Update image
kubectl set image deployment/scrolluniversity-backend \
  backend=ghcr.io/scrolluniversity/backend:v2.0.0 \
  -n scrolluniversity

# Monitor rollout
kubectl rollout status deployment/scrolluniversity-backend -n scrolluniversity
```

### Database Migrations

```bash
# Run migrations
kubectl exec -it deployment/scrolluniversity-backend -n scrolluniversity -- \
  npm run migrate:production
```

### Clear Cache

```bash
# Clear Redis cache
kubectl exec -it deployment/redis -n scrolluniversity -- \
  redis-cli FLUSHALL
```

## Security Best Practices

1. **Secrets Management**: Use external secrets management (AWS Secrets Manager, HashiCorp Vault)
2. **Network Policies**: Implement Kubernetes NetworkPolicies to restrict pod communication
3. **RBAC**: Use Role-Based Access Control for Kubernetes API access
4. **Image Scanning**: Scan Docker images for vulnerabilities before deployment
5. **Pod Security**: Use Pod Security Standards (restricted profile)
6. **Audit Logging**: Enable Kubernetes audit logging
7. **Regular Updates**: Keep Kubernetes, dependencies, and base images updated

## Support

For deployment issues:
- Check logs: `kubectl logs -f deployment/scrolluniversity-backend -n scrolluniversity`
- Check events: `kubectl get events -n scrolluniversity`
- Contact DevOps team: devops@scrolluniversity.com
- Slack channel: #scrolluniversity-devops
