#!/usr/bin/env pwsh
# Execute Comprehensive Course Generation
# "By wisdom a house is built" - Proverbs 24:3

Write-Host ""
Write-Host "🚀 COMPREHENSIVE COURSE GENERATOR" -ForegroundColor Cyan
Write-Host "=" * 70 -ForegroundColor Cyan
Write-Host ""

# Check if we're in the backend directory
if (-not (Test-Path "scripts/generate-comprehensive-courses.ts")) {
    Write-Host "❌ Error: Must run from backend directory" -ForegroundColor Red
    Write-Host "   Run: cd backend" -ForegroundColor Yellow
    exit 1
}

# Check if .env exists
if (-not (Test-Path ".env")) {
    Write-Host "⚠️  Warning: .env file not found" -ForegroundColor Yellow
    Write-Host "   Using .env.example as reference" -ForegroundColor Yellow
    Write-Host ""
}

# Check if node_modules exists
if (-not (Test-Path "node_modules")) {
    Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Dependency installation failed" -ForegroundColor Red
        exit 1
    }
}

Write-Host "✅ Prerequisites checked" -ForegroundColor Green
Write-Host ""
Write-Host "📚 Generating 5 Comprehensive Pilot Courses..." -ForegroundColor Cyan
Write-Host "   - Scroll Foundation 101 (10 modules, 40 lectures)" -ForegroundColor White
Write-Host "   - Sacred AI Engineering (8 modules, 32 lectures)" -ForegroundColor White
Write-Host "   - Kingdom Business Principles (8 modules, 32 lectures)" -ForegroundColor White
Write-Host "   - Spiritual Formation (8 modules, 32 lectures)" -ForegroundColor White
Write-Host "   - Biblical Worldview (8 modules, 32 lectures)" -ForegroundColor White
Write-Host ""
Write-Host "⏱️  Estimated time: 2-3 minutes" -ForegroundColor Yellow
Write-Host ""

# Execute the generator
npx ts-node scripts/generate-comprehensive-courses.ts

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "=" * 70 -ForegroundColor Green
    Write-Host "✨ GENERATION COMPLETE!" -ForegroundColor Green
    Write-Host "=" * 70 -ForegroundColor Green
    Write-Host ""
    Write-Host "📊 Next Steps:" -ForegroundColor Cyan
    Write-Host "   1. Verify courses in database" -ForegroundColor White
    Write-Host "   2. Test course access through frontend" -ForegroundColor White
    Write-Host "   3. Add video assets and assessments" -ForegroundColor White
    Write-Host "   4. Enable student enrollment" -ForegroundColor White
    Write-Host ""
} else {
    Write-Host ""
    Write-Host "❌ Generation failed with exit code: $LASTEXITCODE" -ForegroundColor Red
    Write-Host ""
    Write-Host "🔍 Troubleshooting:" -ForegroundColor Yellow
    Write-Host "   1. Check DATABASE_URL in .env" -ForegroundColor White
    Write-Host "   2. Ensure database is running" -ForegroundColor White
    Write-Host "   3. Run: npx prisma generate" -ForegroundColor White
    Write-Host "   4. Check error messages above" -ForegroundColor White
    Write-Host ""
    exit 1
}
