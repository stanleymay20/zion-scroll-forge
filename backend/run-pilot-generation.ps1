#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Run Pilot Course Generation

.DESCRIPTION
    Generates 14 foundation courses to validate the course generation system.
    This is Phase 1 of the full 10,000 course catalog generation.

.NOTES
    - Generates comprehensive courses with 12-15 modules each
    - Includes lectures, notes, videos, assessments
    - Validates spiritual alignment and quality
    - Outputs to courses/ directory
#>

Write-Host "🚀 ScrollUniversity Pilot Course Generation" -ForegroundColor Cyan
Write-Host "=" * 80 -ForegroundColor Cyan
Write-Host ""

# Check if we're in the backend directory
if (-not (Test-Path "package.json")) {
    Write-Host "❌ Error: Must run from backend directory" -ForegroundColor Red
    exit 1
}

# Check for required environment variables
if (-not $env:OPENROUTER_API_KEY) {
    Write-Host "⚠️  Warning: OPENROUTER_API_KEY not set" -ForegroundColor Yellow
    Write-Host "   Set it with: `$env:OPENROUTER_API_KEY='your-key-here'" -ForegroundColor Yellow
    Write-Host ""
}

Write-Host "📋 Pilot Generation Plan:" -ForegroundColor Green
Write-Host "   - 14 foundation courses" -ForegroundColor White
Write-Host "   - ScrollAI: 5 courses (101, 201, 301, 401, 501)" -ForegroundColor White
Write-Host "   - Theology: 5 courses (101, 201, 301, 401, 501)" -ForegroundColor White
Write-Host "   - Economics: 4 courses (101, 201, 301, 401)" -ForegroundColor White
Write-Host "   - 12-15 modules per course" -ForegroundColor White
Write-Host "   - 3-4 lectures per module" -ForegroundColor White
Write-Host "   - Comprehensive assessments (formative, summative, reflective)" -ForegroundColor White
Write-Host "   - Full spiritual integration" -ForegroundColor White
Write-Host ""

$response = Read-Host "Ready to start generation? (y/n)"
if ($response -ne 'y') {
    Write-Host "Generation cancelled." -ForegroundColor Yellow
    exit 0
}

Write-Host ""
Write-Host "🔧 Compiling TypeScript..." -ForegroundColor Cyan
npx tsc --noEmit
if ($LASTEXITCODE -ne 0) {
    Write-Host "⚠️  TypeScript compilation has warnings, but continuing..." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "🎬 Starting pilot course generation..." -ForegroundColor Cyan
Write-Host "   This will take approximately 15-30 minutes" -ForegroundColor White
Write-Host "   Progress will be logged to backend/logs/" -ForegroundColor White
Write-Host ""

# Run the pilot generator
npx ts-node scripts/pilot-course-generator.ts

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "=" * 80 -ForegroundColor Green
    Write-Host "✅ PILOT GENERATION COMPLETE!" -ForegroundColor Green
    Write-Host "=" * 80 -ForegroundColor Green
    Write-Host ""
    Write-Host "📁 Generated courses are in: courses/" -ForegroundColor Cyan
    Write-Host "📊 Check the log file for detailed results" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Next Steps:" -ForegroundColor Yellow
    Write-Host "1. Review generated course content" -ForegroundColor White
    Write-Host "2. Validate quality and spiritual alignment" -ForegroundColor White
    Write-Host "3. If satisfied, proceed to full catalog generation" -ForegroundColor White
    Write-Host ""
} else {
    Write-Host ""
    Write-Host "❌ Generation failed. Check the log file for details." -ForegroundColor Red
    Write-Host ""
    exit 1
}
