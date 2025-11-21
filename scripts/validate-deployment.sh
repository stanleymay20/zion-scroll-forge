#!/bin/bash

# ScrollUniversity Deployment Validation Script
# Validates that all components are deployed and healthy

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

NAMESPACE="${NAMESPACE:-scrolluniversity}"
TIMEOUT="${TIMEOUT:-300}"

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}ScrollUniversity Deployment Validation${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Function to print status
print_status() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✓${NC} $2"
    else
        echo -e "${RED}✗${NC} $2"
        return 1
    fi
}

# Function to check if resource exists
check_resource() {
    local resource=$1
    local name=$2
    
    if kubectl get $resource $name -n $NAMESPACE &> /dev/null; then
        return 0
    else
        return 1
    fi
}

# Function to check pod status
check_pod_status() {
    local deployment=$1
    local expected_replicas=$2
    
    local ready_replicas=$(kubectl get deployment $deployment -n $NAMESPACE -o jsonpath='{.status.readyReplicas}' 2>/dev/null || echo "0")
    
    if [ "$ready_replicas" -ge "$expected_replicas" ]; then
        return 0
    else
        return 1
    fi
}

# 1. Check Namespace
echo -e "${BLUE}Checking Namespace...${NC}"
check_resource namespace $NAMESPACE
print_status $? "Namespace '$NAMESPACE' exists"
echo ""

# 2. Check ConfigMaps
echo -e "${BLUE}Checking ConfigMaps...${NC}"
check_resource configmap scrolluniversity-config
print_status $? "ConfigMap 'scrolluniversity-config' exists"
echo ""

# 3. Check Secrets
echo -e "${BLUE}Checking Secrets...${NC}"
check_resource secret scrolluniversity-secrets
print_status $? "Secret 'scrolluniversity-secrets' exists"
echo ""

# 4. Check Backend Deployment
echo -e "${BLUE}Checking Backend Deployment...${NC}"
check_resource deployment scrolluniversity-backend
print_status $? "Backend deployment exists"

check_pod_status scrolluniversity-backend 1
print_status $? "Backend pods are ready"

# Check backend service
check_resource service scrolluniversity-backend
print_status $? "Backend service exists"
echo ""

# 5. Check Frontend Deployment
echo -e "${BLUE}Checking Frontend Deployment...${NC}"
check_resource deployment scrolluniversity-frontend
print_status $? "Frontend deployment exists"

check_pod_status scrolluniversity-frontend 1
print_status $? "Frontend pods are ready"

# Check frontend service
check_resource service scrolluniversity-frontend
print_status $? "Frontend service exists"
echo ""

# 6. Check Ingress
echo -e "${BLUE}Checking Ingress...${NC}"
check_resource ingress scrolluniversity-ingress
print_status $? "Ingress exists"

# Get ingress IP/hostname
INGRESS_IP=$(kubectl get ingress scrolluniversity-ingress -n $NAMESPACE -o jsonpath='{.status.loadBalancer.ingress[0].ip}' 2>/dev/null || echo "")
INGRESS_HOSTNAME=$(kubectl get ingress scrolluniversity-ingress -n $NAMESPACE -o jsonpath='{.status.loadBalancer.ingress[0].hostname}' 2>/dev/null || echo "")

if [ -n "$INGRESS_IP" ]; then
    echo -e "  Ingress IP: ${GREEN}$INGRESS_IP${NC}"
elif [ -n "$INGRESS_HOSTNAME" ]; then
    echo -e "  Ingress Hostname: ${GREEN}$INGRESS_HOSTNAME${NC}"
else
    echo -e "  ${YELLOW}⚠${NC} Ingress IP/Hostname not yet assigned"
fi
echo ""

# 7. Check HPA
echo -e "${BLUE}Checking HorizontalPodAutoscalers...${NC}"
check_resource hpa scrolluniversity-backend-hpa
print_status $? "Backend HPA exists"

check_resource hpa scrolluniversity-frontend-hpa
print_status $? "Frontend HPA exists"
echo ""

# 8. Check Monitoring Stack
echo -e "${BLUE}Checking Monitoring Stack...${NC}"
if check_resource deployment prometheus; then
    print_status 0 "Prometheus deployment exists"
    check_pod_status prometheus 1
    print_status $? "Prometheus pod is ready"
else
    echo -e "${YELLOW}⚠${NC} Prometheus not deployed (optional)"
fi

if check_resource deployment grafana; then
    print_status 0 "Grafana deployment exists"
    check_pod_status grafana 1
    print_status $? "Grafana pod is ready"
else
    echo -e "${YELLOW}⚠${NC} Grafana not deployed (optional)"
fi

if check_resource deployment alertmanager; then
    print_status 0 "Alertmanager deployment exists"
    check_pod_status alertmanager 1
    print_status $? "Alertmanager pod is ready"
else
    echo -e "${YELLOW}⚠${NC} Alertmanager not deployed (optional)"
fi
echo ""

# 9. Check Logging Stack
echo -e "${BLUE}Checking Logging Stack...${NC}"
if check_resource statefulset elasticsearch; then
    print_status 0 "Elasticsearch statefulset exists"
else
    echo -e "${YELLOW}⚠${NC} Elasticsearch not deployed (optional)"
fi

if check_resource deployment logstash; then
    print_status 0 "Logstash deployment exists"
else
    echo -e "${YELLOW}⚠${NC} Logstash not deployed (optional)"
fi

if check_resource deployment kibana; then
    print_status 0 "Kibana deployment exists"
else
    echo -e "${YELLOW}⚠${NC} Kibana not deployed (optional)"
fi

if check_resource daemonset filebeat; then
    print_status 0 "Filebeat daemonset exists"
else
    echo -e "${YELLOW}⚠${NC} Filebeat not deployed (optional)"
fi
echo ""

# 10. Check Backup CronJobs
echo -e "${BLUE}Checking Backup CronJobs...${NC}"
if check_resource cronjob database-backup; then
    print_status 0 "Database backup CronJob exists"
else
    echo -e "${YELLOW}⚠${NC} Database backup not configured (optional)"
fi

if check_resource cronjob redis-backup; then
    print_status 0 "Redis backup CronJob exists"
else
    echo -e "${YELLOW}⚠${NC} Redis backup not configured (optional)"
fi

if check_resource cronjob application-backup; then
    print_status 0 "Application backup CronJob exists"
else
    echo -e "${YELLOW}⚠${NC} Application backup not configured (optional)"
fi
echo ""

# 11. Health Checks
echo -e "${BLUE}Running Health Checks...${NC}"

# Port forward to backend
kubectl port-forward svc/scrolluniversity-backend 8080:80 -n $NAMESPACE &> /dev/null &
PORT_FORWARD_PID=$!
sleep 3

# Check backend health
if curl -f -s http://localhost:8080/health &> /dev/null; then
    print_status 0 "Backend health check passed"
else
    print_status 1 "Backend health check failed"
fi

# Kill port forward
kill $PORT_FORWARD_PID 2>/dev/null || true
echo ""

# 12. Resource Usage
echo -e "${BLUE}Checking Resource Usage...${NC}"
echo "Pod Resource Usage:"
kubectl top pods -n $NAMESPACE 2>/dev/null || echo -e "${YELLOW}⚠${NC} Metrics server not available"
echo ""

# 13. Recent Events
echo -e "${BLUE}Recent Events (last 10):${NC}"
kubectl get events -n $NAMESPACE --sort-by='.lastTimestamp' | tail -10
echo ""

# 14. Summary
echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}Validation Summary${NC}"
echo -e "${BLUE}========================================${NC}"

# Count pods
TOTAL_PODS=$(kubectl get pods -n $NAMESPACE --no-headers 2>/dev/null | wc -l)
RUNNING_PODS=$(kubectl get pods -n $NAMESPACE --field-selector=status.phase=Running --no-headers 2>/dev/null | wc -l)

echo -e "Total Pods: ${GREEN}$TOTAL_PODS${NC}"
echo -e "Running Pods: ${GREEN}$RUNNING_PODS${NC}"

if [ "$TOTAL_PODS" -eq "$RUNNING_PODS" ] && [ "$TOTAL_PODS" -gt 0 ]; then
    echo -e "\n${GREEN}✓ All pods are running!${NC}"
    exit 0
else
    echo -e "\n${YELLOW}⚠ Some pods are not running${NC}"
    echo "Run 'kubectl get pods -n $NAMESPACE' for details"
    exit 1
fi
