# Parallel Course Generation Launcher
# Generates multiple courses simultaneously for rapid scaling

Write-Host "================================================================================================" -ForegroundColor Cyan
Write-Host "🚀 PARALLEL COURSE GENERATION SYSTEM" -ForegroundColor Cyan
Write-Host "================================================================================================" -ForegroundColor Cyan
Write-Host ""

# Check if .env exists
if (-not (Test-Path ".env")) {
    Write-Host "❌ ERROR: .env file not found!" -ForegroundColor Red
    Write-Host "Please ensure backend/.env exists with DEEPSEEK_API_KEY configured." -ForegroundColor Yellow
    exit 1
}

# Get worker count from user
$defaultWorkers = 5
Write-Host "How many parallel workers? (1-20, default: $defaultWorkers)" -ForegroundColor Yellow
$workersInput = Read-Host "Workers"

if ([string]::IsNullOrWhiteSpace($workersInput)) {
    $workers = $defaultWorkers
} else {
    $workers = [int]$workersInput
}

if ($workers -lt 1 -or $workers -gt 20) {
    Write-Host "❌ Invalid worker count. Using default: $defaultWorkers" -ForegroundColor Red
    $workers = $defaultWorkers
}

Write-Host ""
Write-Host "⚙️  Configuration:" -ForegroundColor Green
Write-Host "   Parallel Workers: $workers" -ForegroundColor White
Write-Host "   Estimated Speed: $($workers * 20-24) courses/hour" -ForegroundColor White
Write-Host ""

# Confirm start
Write-Host "Ready to start parallel generation?" -ForegroundColor Yellow
Write-Host "Press ENTER to continue or CTRL+C to cancel..." -ForegroundColor Yellow
Read-Host

Write-Host ""
Write-Host "🎬 Starting parallel generation..." -ForegroundColor Green
Write-Host ""

# Run the parallel generator
npx tsx scripts/parallel-course-generator.ts $workers

Write-Host ""
Write-Host "================================================================================================" -ForegroundColor Cyan
Write-Host "✅ PARALLEL GENERATION COMPLETE!" -ForegroundColor Green
Write-Host "================================================================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Check courses/ directory for generated content" -ForegroundColor White
Write-Host "Check courses/parallel-generation-log.json for detailed log" -ForegroundColor White
Write-Host ""
