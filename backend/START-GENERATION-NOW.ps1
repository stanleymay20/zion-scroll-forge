# ScrollUniversity Master Course Generation - START NOW
# This script begins the course generation process

Write-Host "🎓 ScrollUniversity Master Course Generator" -ForegroundColor Cyan
Write-Host "=" * 80
Write-Host ""

# Check if we're in the backend directory
if (-not (Test-Path "package.json")) {
    Write-Host "❌ Error: Must run from backend directory" -ForegroundColor Red
    Write-Host "   Run: cd backend" -ForegroundColor Yellow
    exit 1
}

Write-Host "📋 GENERATION OPTIONS:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. PILOT (10 courses) - RECOMMENDED START" -ForegroundColor Green
Write-Host "   Duration: 30-60 minutes"
Write-Host "   Cost: $2-20"
Write-Host "   Purpose: Validate quality and system"
Write-Host ""
Write-Host "2. FOUNDATION (100 courses)" -ForegroundColor Yellow
Write-Host "   Duration: 5-10 hours"
Write-Host "   Cost: $200-2,000"
Write-Host "   Purpose: Build core curriculum"
Write-Host ""
Write-Host "3. EXPANSION (1,000 courses)" -ForegroundColor Yellow
Write-Host "   Duration: 2-3 days"
Write-Host "   Cost: $2,000-20,000"
Write-Host "   Purpose: Complete major faculties"
Write-Host ""
Write-Host "4. FULL CATALOG (10,000+ courses)" -ForegroundColor Red
Write-Host "   Duration: 5-7 days continuous"
Write-Host "   Cost: $20,000-200,000"
Write-Host "   Purpose: Complete university catalog"
Write-Host ""
Write-Host "=" * 80
Write-Host ""

$choice = Read-Host "Select option (1-4) or 'q' to quit"

switch ($choice) {
    "1" {
        Write-Host ""
        Write-Host "🚀 Starting PILOT generation (10 courses)..." -ForegroundColor Green
        Write-Host ""
        npx ts-node --transpile-only scripts/master-10000-course-generator.ts --limit 10 --yes
    }
    "2" {
        Write-Host ""
        Write-Host "⚠️  WARNING: This will take 5-10 hours and cost $200-2,000" -ForegroundColor Yellow
        $confirm = Read-Host "Type 'YES' to confirm"
        if ($confirm -eq "YES") {
            Write-Host ""
            Write-Host "🚀 Starting FOUNDATION generation (100 courses)..." -ForegroundColor Green
            Write-Host ""
            npx ts-node --transpile-only scripts/master-10000-course-generator.ts --limit 100 --yes
        } else {
            Write-Host "❌ Cancelled" -ForegroundColor Red
        }
    }
    "3" {
        Write-Host ""
        Write-Host "⚠️  WARNING: This will take 2-3 DAYS and cost $2,000-20,000" -ForegroundColor Yellow
        $confirm = Read-Host "Type 'YES' to confirm"
        if ($confirm -eq "YES") {
            Write-Host ""
            Write-Host "🚀 Starting EXPANSION generation (1,000 courses)..." -ForegroundColor Green
            Write-Host ""
            npx ts-node --transpile-only scripts/master-10000-course-generator.ts --limit 1000 --batch-size 20 --yes
        } else {
            Write-Host "❌ Cancelled" -ForegroundColor Red
        }
    }
    "4" {
        Write-Host ""
        Write-Host "🚨 CRITICAL WARNING: This will take 5-7 DAYS and cost $20,000-200,000" -ForegroundColor Red
        Write-Host "   This is a MASSIVE operation. Are you absolutely sure?" -ForegroundColor Red
        Write-Host ""
        $confirm = Read-Host "Type 'I UNDERSTAND THE COST AND TIME' to confirm"
        if ($confirm -eq "I UNDERSTAND THE COST AND TIME") {
            Write-Host ""
            Write-Host "🚀 Starting FULL CATALOG generation (10,000+ courses)..." -ForegroundColor Green
            Write-Host "   This will run for 5-7 days continuously..." -ForegroundColor Yellow
            Write-Host ""
            npx ts-node --transpile-only scripts/master-10000-course-generator.ts --batch-size 50 --yes
        } else {
            Write-Host "❌ Cancelled - Confirmation text did not match" -ForegroundColor Red
        }
    }
    "q" {
        Write-Host "❌ Cancelled" -ForegroundColor Red
        exit 0
    }
    default {
        Write-Host "❌ Invalid option" -ForegroundColor Red
        exit 1
    }
}

Write-Host ""
Write-Host "✅ Generation process started!" -ForegroundColor Green
Write-Host ""
Write-Host "📊 Monitor progress:" -ForegroundColor Cyan
Write-Host "   - Check logs in: backend/logs/" -ForegroundColor White
Write-Host "   - Watch console output above" -ForegroundColor White
Write-Host "   - Generation will continue until complete" -ForegroundColor White
Write-Host ""
