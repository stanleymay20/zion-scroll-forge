#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Enterprise ScrollLibrary Generation - BEST OPTION Implementation
    
.DESCRIPTION
    Generates 10,000+ books for all ScrollUniversity courses using:
    - 50 parallel workers (optimal balance)
    - Enrollment-based priority (most popular first)
    - Cost optimization with DeepSeek
    - Real-time monitoring
    - Automatic retry on failure
    
.PARAMETER Mode
    Generation mode: pilot (20 books), batch (1000 books), or enterprise (all courses)
    
.PARAMETER Workers
    Number of parallel workers (default: 50, max: 100)
    
.EXAMPLE
    .\START-LIBRARY-GENERATION.ps1 -Mode pilot
    .\START-LIBRARY-GENERATION.ps1 -Mode enterprise -Workers 50
#>

param(
    [Parameter(Mandatory=$false)]
    [ValidateSet('pilot', 'batch', 'enterprise')]
    [string]$Mode = 'pilot',
    
    [Parameter(Mandatory=$false)]
    [ValidateRange(1, 100)]
    [int]$Workers = 50
)

$ErrorActionPreference = "Stop"

Write-Host "=" * 80 -ForegroundColor Cyan
Write-Host "ScrollLibrary Enterprise Generation - BEST OPTION" -ForegroundColor Cyan
Write-Host "=" * 80 -ForegroundColor Cyan
Write-Host ""

# Configuration
$BackendPath = Split-Path -Parent $PSScriptRoot
$LogPath = Join-Path $BackendPath "logs"
$DataPath = Join-Path $BackendPath "data\enterprise-generation"

# Ensure directories exist
if (-not (Test-Path $LogPath)) {
    New-Item -ItemType Directory -Path $LogPath -Force | Out-Null
}
if (-not (Test-Path $DataPath)) {
    New-Item -ItemType Directory -Path $DataPath -Force | Out-Null
}

# Check environment
Write-Host "Checking environment..." -ForegroundColor Yellow

if (-not (Test-Path (Join-Path $BackendPath ".env"))) {
    Write-Host "ERROR: .env file not found!" -ForegroundColor Red
    Write-Host "Please copy .env.example to .env and configure your API keys" -ForegroundColor Red
    exit 1
}

# Check database connection
Write-Host "Verifying database connection..." -ForegroundColor Yellow
Push-Location $BackendPath
try {
    $dbCheck = npm run db:check 2>&1
    if ($LASTEXITCODE -ne 0) {
        Write-Host "ERROR: Database connection failed!" -ForegroundColor Red
        Write-Host "Please run: npm run db:setup" -ForegroundColor Red
        exit 1
    }
    Write-Host "✓ Database connected" -ForegroundColor Green
} catch {
    Write-Host "ERROR: Database check failed: $_" -ForegroundColor Red
    exit 1
} finally {
    Pop-Location
}

# Display configuration
Write-Host ""
Write-Host "Configuration:" -ForegroundColor Cyan
Write-Host "  Mode: $Mode" -ForegroundColor White
Write-Host "  Workers: $Workers" -ForegroundColor White
Write-Host "  Priority: Enrollment-based (most popular first)" -ForegroundColor White
Write-Host "  AI Model: DeepSeek (cost-optimized)" -ForegroundColor White
Write-Host ""

# Estimate time and cost
$booksToGenerate = switch ($Mode) {
    'pilot' { 20 }
    'batch' { 1000 }
    'enterprise' { 10000 }
}

$timePerBook = 20 # minutes
$totalMinutes = [math]::Ceiling($booksToGenerate * $timePerBook / $Workers)
$hours = [math]::Floor($totalMinutes / 60)
$minutes = $totalMinutes % 60

$costPerBook = 3 # dollars (DeepSeek optimized)
$totalCost = $booksToGenerate * $costPerBook

Write-Host "Estimates:" -ForegroundColor Cyan
Write-Host "  Books to generate: $booksToGenerate" -ForegroundColor White
Write-Host "  Estimated time: ${hours}h ${minutes}m" -ForegroundColor White
Write-Host "  Estimated cost: `$$totalCost" -ForegroundColor White
Write-Host ""

# Confirm execution
$confirmation = Read-Host "Start generation? (yes/no)"
if ($confirmation -ne 'yes') {
    Write-Host "Generation cancelled." -ForegroundColor Yellow
    exit 0
}

Write-Host ""
Write-Host "=" * 80 -ForegroundColor Green
Write-Host "STARTING GENERATION" -ForegroundColor Green
Write-Host "=" * 80 -ForegroundColor Green
Write-Host ""

# Start generation based on mode
Push-Location $BackendPath
try {
    $timestamp = Get-Date -Format "yyyy-MM-dd_HH-mm-ss"
    $logFile = Join-Path $LogPath "library-generation-$timestamp.log"
    
    Write-Host "Logs: $logFile" -ForegroundColor Cyan
    Write-Host "Dashboard: $DataPath\dashboard.json" -ForegroundColor Cyan
    Write-Host ""
    
    switch ($Mode) {
        'pilot' {
            Write-Host "Generating 20 pilot books..." -ForegroundColor Yellow
            npm run generate:scroll-library start 2>&1 | Tee-Object -FilePath $logFile
        }
        'batch' {
            Write-Host "Generating 1000 books in batches..." -ForegroundColor Yellow
            npm run generate:scroll-library:batch 1000 $Workers 2>&1 | Tee-Object -FilePath $logFile
        }
        'enterprise' {
            Write-Host "Generating ALL course books..." -ForegroundColor Yellow
            npm run generate:enterprise all $Workers enrollment 2>&1 | Tee-Object -FilePath $logFile
        }
    }
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "=" * 80 -ForegroundColor Green
        Write-Host "GENERATION COMPLETE!" -ForegroundColor Green
        Write-Host "=" * 80 -ForegroundColor Green
        Write-Host ""
        Write-Host "Next steps:" -ForegroundColor Cyan
        Write-Host "  1. Review generated books: npm run library:list" -ForegroundColor White
        Write-Host "  2. Check quality metrics: npm run library:quality-report" -ForegroundColor White
        Write-Host "  3. Export books: npm run library:export-all" -ForegroundColor White
        Write-Host ""
    } else {
        Write-Host ""
        Write-Host "=" * 80 -ForegroundColor Red
        Write-Host "GENERATION FAILED" -ForegroundColor Red
        Write-Host "=" * 80 -ForegroundColor Red
        Write-Host ""
        Write-Host "Check logs: $logFile" -ForegroundColor Yellow
        Write-Host "Retry failed books: npm run generate:enterprise retry" -ForegroundColor Yellow
        exit 1
    }
    
} catch {
    Write-Host ""
    Write-Host "ERROR: $_" -ForegroundColor Red
    Write-Host "Check logs: $logFile" -ForegroundColor Yellow
    exit 1
} finally {
    Pop-Location
}

Write-Host "Generation session complete." -ForegroundColor Green
