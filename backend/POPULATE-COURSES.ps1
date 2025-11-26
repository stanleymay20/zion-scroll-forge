#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Populates all courses with comprehensive content
.DESCRIPTION
    Generates complete course content for all courses in the database:
    - Modules (4-12 per course)
    - Lectures with full transcripts
    - Comprehensive lecture notes
    - Multiple assessment types
    - Spiritual integration
    - Real-world deployment pathways
#>

Write-Host "🎓 SCROLLUNIVERSITY COURSE CONTENT POPULATION" -ForegroundColor Cyan
Write-Host "=" * 70 -ForegroundColor Cyan
Write-Host ""

# Check if we're in the backend directory
if (-not (Test-Path "package.json")) {
    Write-Host "❌ ERROR: Must run from backend directory" -ForegroundColor Red
    exit 1
}

# Check environment
if (-not (Test-Path ".env")) {
    Write-Host "❌ ERROR: .env file not found" -ForegroundColor Red
    Write-Host "   Please create .env with required variables" -ForegroundColor Yellow
    exit 1
}

Write-Host "📋 Pre-flight checks..." -ForegroundColor Yellow
Write-Host "   ✅ Backend directory confirmed" -ForegroundColor Green
Write-Host "   ✅ Environment file found" -ForegroundColor Green
Write-Host ""

# Check database connection
Write-Host "🔌 Testing database connection..." -ForegroundColor Yellow
$dbTest = npx prisma db execute --stdin <<< "SELECT 1;" 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ ERROR: Cannot connect to database" -ForegroundColor Red
    Write-Host "   Please check DATABASE_URL in .env" -ForegroundColor Yellow
    exit 1
}
Write-Host "   ✅ Database connection successful" -ForegroundColor Green
Write-Host ""

# Check AI service
Write-Host "🤖 Checking AI service configuration..." -ForegroundColor Yellow
if (-not $env:OPENROUTER_API_KEY -and -not $env:OPENAI_API_KEY) {
    Write-Host "❌ ERROR: No AI API key found" -ForegroundColor Red
    Write-Host "   Please set OPENROUTER_API_KEY or OPENAI_API_KEY in .env" -ForegroundColor Yellow
    exit 1
}
Write-Host "   ✅ AI service configured" -ForegroundColor Green
Write-Host ""

Write-Host "🚀 Starting course content population..." -ForegroundColor Cyan
Write-Host "=" * 70 -ForegroundColor Cyan
Write-Host ""
Write-Host "⚠️  This will generate COMPREHENSIVE content for ALL courses" -ForegroundColor Yellow
Write-Host "   - Each course: 8-10 modules" -ForegroundColor White
Write-Host "   - Each module: 3-5 lectures" -ForegroundColor White
Write-Host "   - Each lecture: Full notes, examples, practice problems" -ForegroundColor White
Write-Host "   - Multiple assessments per module" -ForegroundColor White
Write-Host "   - Complete spiritual integration" -ForegroundColor White
Write-Host ""
Write-Host "   This may take 10-30 minutes depending on course count" -ForegroundColor Yellow
Write-Host ""

$confirmation = Read-Host "Continue? (yes/no)"
if ($confirmation -ne "yes") {
    Write-Host "❌ Operation cancelled" -ForegroundColor Yellow
    exit 0
}

Write-Host ""
Write-Host "🔨 Executing population script..." -ForegroundColor Cyan
Write-Host ""

# Run the population script (skip type checking for faster execution)
npx ts-node --transpile-only scripts/populate-course-content.ts

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "=" * 70 -ForegroundColor Green
    Write-Host "✅ COURSE CONTENT POPULATION COMPLETE!" -ForegroundColor Green
    Write-Host "=" * 70 -ForegroundColor Green
    Write-Host ""
    Write-Host "📊 Next steps:" -ForegroundColor Cyan
    Write-Host "   1. Run validation: npx ts-node scripts/validate-generated-courses.ts" -ForegroundColor White
    Write-Host "   2. Review course content in database" -ForegroundColor White
    Write-Host "   3. Generate video content (separate process)" -ForegroundColor White
    Write-Host ""
} else {
    Write-Host ""
    Write-Host "=" * 70 -ForegroundColor Red
    Write-Host "❌ POPULATION FAILED" -ForegroundColor Red
    Write-Host "=" * 70 -ForegroundColor Red
    Write-Host ""
    Write-Host "Please check the error messages above" -ForegroundColor Yellow
    Write-Host ""
    exit 1
}
