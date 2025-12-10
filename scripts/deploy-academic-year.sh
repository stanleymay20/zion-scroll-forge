#!/bin/bash

# Academic Year Automation System - Deployment Script
# This script deploys the Academic Year System to Kubernetes

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
NAMESPACE="academic-year-system"
DEPLOYMENT_NAME="academic-year-system"
IMAGE_TAG="${IMAGE_TAG:-latest}"
ENVIRONMENT="${ENVIRONMENT:-production}"

# Functions
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

check_prerequisites() {
    log_info "Checking prerequisites..."
    
    if ! command -v kubectl &> /dev/null; then
        log_error "kubectl is not installed"
        exit 1
    fi
    
    if ! command -v docker &> /dev/null; then
        log_error "docker is not installed"
        exit 1
    fi
    
    log_info "Prerequisites check passed"
}

create_namespace() {
    log_info "Creating namespace if not exists..."
    kubectl create namespace $NAMESPACE --dry-run=client -o yaml | kubectl apply -f -
}

apply_configurations() {
    log_info "Applying Kubernetes configurations..."
    
    kubectl apply -f k8s/academic-year/namespace.yaml
    kubectl apply -f k8s/academic-year/configmap.yaml
    
    # Check if secrets exist, if not, create from template
    if ! kubectl get secret academic-year-secrets -n $NAMESPACE &> /dev/null; then
        log_warn "Secrets not found. Please create secrets before deploying."
        log_warn "Run: kubectl create secret generic academic-year-secrets --from-env-file=backend/.env.academic-year.production -n $NAMESPACE"
        exit 1
    fi
    
    kubectl apply -f k8s/academic-year/deployment.yaml
    kubectl apply -f k8s/academic-year/ingress.yaml
}

update_image() {
    log_info "Updating deployment image to $IMAGE_TAG..."
    
    kubectl set image deployment/$DEPLOYMENT_NAME \
        academic-year-system=scrolluniversity/academic-year-system:$IMAGE_TAG \
        -n $NAMESPACE
}

wait_for_rollout() {
    log_info "Waiting for deployment rollout..."
    
    kubectl rollout status deployment/$DEPLOYMENT_NAME \
        -n $NAMESPACE \
        --timeout=10m
    
    if [ $? -eq 0 ]; then
        log_info "Deployment successful!"
    else
        log_error "Deployment failed!"
        exit 1
    fi
}

run_health_checks() {
    log_info "Running health checks..."
    
    # Wait for pods to be ready
    sleep 10
    
    # Check pod status
    READY_PODS=$(kubectl get pods -n $NAMESPACE -l app=scrolluniversity,component=academic-year-automation -o jsonpath='{.items[*].status.conditions[?(@.type=="Ready")].status}' | grep -o "True" | wc -l)
    TOTAL_PODS=$(kubectl get pods -n $NAMESPACE -l app=scrolluniversity,component=academic-year-automation --no-headers | wc -l)
    
    log_info "Ready pods: $READY_PODS/$TOTAL_PODS"
    
    if [ $READY_PODS -lt 1 ]; then
        log_error "No pods are ready!"
        kubectl get pods -n $NAMESPACE
        exit 1
    fi
    
    # Test health endpoint
    log_info "Testing health endpoint..."
    kubectl run health-check \
        --image=curlimages/curl:latest \
        --rm -i --restart=Never \
        -n $NAMESPACE \
        -- curl -f http://academic-year-system/api/health
    
    if [ $? -eq 0 ]; then
        log_info "Health check passed!"
    else
        log_error "Health check failed!"
        exit 1
    fi
}

show_deployment_info() {
    log_info "Deployment information:"
    echo ""
    echo "Namespace: $NAMESPACE"
    echo "Deployment: $DEPLOYMENT_NAME"
    echo "Image Tag: $IMAGE_TAG"
    echo "Environment: $ENVIRONMENT"
    echo ""
    
    log_info "Pods:"
    kubectl get pods -n $NAMESPACE -l app=scrolluniversity,component=academic-year-automation
    echo ""
    
    log_info "Services:"
    kubectl get services -n $NAMESPACE
    echo ""
    
    log_info "Ingress:"
    kubectl get ingress -n $NAMESPACE
}

rollback() {
    log_warn "Rolling back deployment..."
    
    kubectl rollout undo deployment/$DEPLOYMENT_NAME -n $NAMESPACE
    kubectl rollout status deployment/$DEPLOYMENT_NAME -n $NAMESPACE
    
    log_info "Rollback complete"
}

# Main execution
main() {
    log_info "Starting Academic Year System deployment..."
    log_info "Environment: $ENVIRONMENT"
    log_info "Image Tag: $IMAGE_TAG"
    
    check_prerequisites
    create_namespace
    apply_configurations
    update_image
    wait_for_rollout
    run_health_checks
    show_deployment_info
    
    log_info "Deployment completed successfully!"
}

# Handle script arguments
case "${1:-deploy}" in
    deploy)
        main
        ;;
    rollback)
        rollback
        ;;
    status)
        show_deployment_info
        ;;
    *)
        echo "Usage: $0 {deploy|rollback|status}"
        exit 1
        ;;
esac
