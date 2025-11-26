# ScrollUniversity Course Generation - Master Execution Script
# This script cleans up old content and generates fresh, comprehensive courses

Write-Host ""
Write-Host "=" -NoNewline -ForegroundColor Cyan
Write-Host ("=" * 78) -ForegroundColor Cyan
Write-Host "  ScrollUniversity - Comprehensive Course Generation" -ForegroundColor Cyan
Write-Host ("=" * 80) -ForegroundColor Cyan
Write-Host ""

# Step 1: Cleanup old template content
Write-Host "Step 1: Cleaning up old template content..." -ForegroundColor Yellow
Write-Host ""
npx ts-node --transpile-only scripts/cleanup-old-courses.ts

if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "❌ Cleanup failed" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Press any key to continue to testing..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
Write-Host ""

# Step 2: Run quick test
Write-Host "Step 2: Running quick test..." -ForegroundColor Yellow
Write-Host ""
npx ts-node --transpile-only scripts/test-comprehensive-generation.ts

if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "❌ Test failed - fix issues before proceeding" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Press any key to start course generation..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
Write-Host ""

# Step 3: Generate THEO101
Write-Host "Step 3: Generating THEO101 - Biblical Interpretation..." -ForegroundColor Yellow
Write-Host ""
npx ts-node --transpile-only scripts/generate-real-course.ts THEO101

if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "❌ THEO101 generation failed" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "=" -NoNewline -ForegroundColor Green
Write-Host ("=" * 78) -ForegroundColor Green
Write-Host "  ✅ THEO101 Generation Complete!" -ForegroundColor Green
Write-Host ("=" * 80) -ForegroundColor Green
Write-Host ""
Write-Host "Review the output:" -ForegroundColor Cyan
Write-Host "  type ..\courses\COURSE_THEO101\course_overview.md" -ForegroundColor Gray
Write-Host ""
Write-Host "Generate more courses:" -ForegroundColor Cyan
Write-Host "  npx ts-node --transpile-only scripts/generate-real-course.ts SCROLLFOUND_101" -ForegroundColor Gray
Write-Host "  npx ts-node --transpile-only scripts/generate-real-course.ts SCROLLAI_101" -ForegroundColor Gray
Write-Host ""
