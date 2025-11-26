#!/usr/bin/env pwsh

Write-Host "🚀 COMPREHENSIVE COURSE COMPLETION SYSTEM" -ForegroundColor Cyan
Write-Host "=" * 70
Write-Host ""
Write-Host "This will generate complete learning materials for 15 incomplete courses" -ForegroundColor Yellow
Write-Host "Estimated time: 30-45 minutes" -ForegroundColor Yellow
Write-Host "Cost estimate: $2-3 total" -ForegroundColor Yellow
Write-Host ""
Write-Host "Press Ctrl+C to cancel, or Enter to continue..." -ForegroundColor Green
Read-Host

Write-Host ""
Write-Host "Starting course generation..." -ForegroundColor Cyan
Write-Host ""

# Execute the generator
npx tsx scripts/complete-all-courses.ts

Write-Host ""
Write-Host "✅ Generation complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Running verification scan..." -ForegroundColor Cyan
npx tsx scripts/comprehensive-course-verification.ts

Write-Host ""
Write-Host "🎉 ALL DONE! Check the reports for details." -ForegroundColor Green
