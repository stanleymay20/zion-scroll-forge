# Academic Year Automation System - Deployment Script (PowerShell)
# This script deploys the Academic Year System to Kubernetes

param(
    [Parameter(Mandatory=$false)]
    [ValidateSet("deploy", "rollback", "status")]
    [string]$Action = "deploy",
    
    [Parameter(Mandatory=$false)]
    [string]$ImageTag = "latest",
    
    [Parameter(Mandatory=$false)]
    [ValidateSet("staging", "production")]
    [string]$Environment = "production"
)

# Configuration
$Namespace = "academic-year-system"
$DeploymentName = "academic-year-system"

# Functions
function Write-Info {
    param([string]$Message)
    Write-Host "[INFO] $Message" -ForegroundColor Green
}

function Write-Warn {
    param([string]$Message)
    Write-Host "[WARN] $Message" -ForegroundColor Yellow
}

function Write-Error {
    param([string]$Message)
    Write-Host "[ERROR] $Message" -ForegroundColor Red
}

function Test-Prerequisites {
    Write-Info "Checking prerequisites..."
    
    if (-not (Get-Command kubectl -ErrorAction SilentlyContinue)) {
        Write-Error "kubectl is not installed"
        exit 1
    }
    
    if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
        Write-Error "docker is not installed"
        exit 1
    }
    
    Write-Info "Prerequisites check passed"
}

function New-Namespace {
    Write-Info "Creating namespace if not exists..."
    kubectl create namespace $Namespace --dry-run=client -o yaml | kubectl apply -f -
}

function Install-Configurations {
    Write-Info "Applying Kubernetes configurations..."
    
    kubectl apply -f k8s/academic-year/namespace.yaml
    kubectl apply -f k8s/academic-year/configmap.yaml
    
    # Check if secrets exist
    $secretExists = kubectl get secret academic-year-secrets -n $Namespace 2>$null
    if (-not $secretExists) {
        Write-Warn "Secrets not found. Please create secrets before deploying."
        Write-Warn "Run: kubectl create secret generic academic-year-secrets --from-env-file=backend/.env.academic-year.production -n $Namespace"
        exit 1
    }
    
    kubectl apply -f k8s/academic-year/deployment.yaml
    kubectl apply -f k8s/academic-year/ingress.yaml
}

function Update-DeploymentImage {
    Write-Info "Updating deployment image to $ImageTag..."
    
    kubectl set image deployment/$DeploymentName `
        academic-year-system=scrolluniversity/academic-year-system:$ImageTag `
        -n $Namespace
}

function Wait-ForRollout {
    Write-Info "Waiting for deployment rollout..."
    
    kubectl rollout status deployment/$DeploymentName `
        -n $Namespace `
        --timeout=10m
    
    if ($LASTEXITCODE -eq 0) {
        Write-Info "Deployment successful!"
    } else {
        Write-Error "Deployment failed!"
        exit 1
    }
}

function Test-Health {
    Write-Info "Running health checks..."
    
    # Wait for pods to be ready
    Start-Sleep -Seconds 10
    
    # Check pod status
    $pods = kubectl get pods -n $Namespace -l app=scrolluniversity,component=academic-year-automation -o json | ConvertFrom-Json
    $readyPods = ($pods.items | Where-Object { $_.status.conditions | Where-Object { $_.type -eq "Ready" -and $_.status -eq "True" } }).Count
    $totalPods = $pods.items.Count
    
    Write-Info "Ready pods: $readyPods/$totalPods"
    
    if ($readyPods -lt 1) {
        Write-Error "No pods are ready!"
        kubectl get pods -n $Namespace
        exit 1
    }
    
    # Test health endpoint
    Write-Info "Testing health endpoint..."
    kubectl run health-check `
        --image=curlimages/curl:latest `
        --rm -i --restart=Never `
        -n $Namespace `
        -- curl -f http://academic-year-system/api/health
    
    if ($LASTEXITCODE -eq 0) {
        Write-Info "Health check passed!"
    } else {
        Write-Error "Health check failed!"
        exit 1
    }
}

function Show-DeploymentInfo {
    Write-Info "Deployment information:"
    Write-Host ""
    Write-Host "Namespace: $Namespace"
    Write-Host "Deployment: $DeploymentName"
    Write-Host "Image Tag: $ImageTag"
    Write-Host "Environment: $Environment"
    Write-Host ""
    
    Write-Info "Pods:"
    kubectl get pods -n $Namespace -l app=scrolluniversity,component=academic-year-automation
    Write-Host ""
    
    Write-Info "Services:"
    kubectl get services -n $Namespace
    Write-Host ""
    
    Write-Info "Ingress:"
    kubectl get ingress -n $Namespace
}

function Invoke-Rollback {
    Write-Warn "Rolling back deployment..."
    
    kubectl rollout undo deployment/$DeploymentName -n $Namespace
    kubectl rollout status deployment/$DeploymentName -n $Namespace
    
    Write-Info "Rollback complete"
}

function Invoke-Deploy {
    Write-Info "Starting Academic Year System deployment..."
    Write-Info "Environment: $Environment"
    Write-Info "Image Tag: $ImageTag"
    
    Test-Prerequisites
    New-Namespace
    Install-Configurations
    Update-DeploymentImage
    Wait-ForRollout
    Test-Health
    Show-DeploymentInfo
    
    Write-Info "Deployment completed successfully!"
}

# Main execution
switch ($Action) {
    "deploy" {
        Invoke-Deploy
    }
    "rollback" {
        Invoke-Rollback
    }
    "status" {
        Show-DeploymentInfo
    }
    default {
        Write-Host "Usage: .\deploy-academic-year.ps1 -Action {deploy|rollback|status} [-ImageTag <tag>] [-Environment <staging|production>]"
        exit 1
    }
}
