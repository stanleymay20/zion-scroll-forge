# ScrollUniversity Course Generation Script
# Usage: .\generate-course.ps1 THEO_101

param(
    [Parameter(Mandatory=$false)]
    [string]$CourseCode = ""
)

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "🎓 SCROLLUNIVERSITY COURSE GENERATOR" -ForegroundColor Green
Write-Host "========================================`n" -ForegroundColor Cyan

if ($CourseCode -eq "") {
    Write-Host "📚 Available Courses:" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "  THEO_101 - Introduction to Biblical Theology" -ForegroundColor White
    Write-Host "    Level: Beginner, Modules: 12, Lectures: 36" -ForegroundColor Gray
    Write-Host ""
    Write-Host "  AI_301 - Sacred AI Engineering" -ForegroundColor White
    Write-Host "    Level: Advanced, Modules: 15, Lectures: 60" -ForegroundColor Gray
    Write-Host ""
    Write-Host "  LEAD_201 - Kingdom Leadership" -ForegroundColor White
    Write-Host "    Level: Intermediate, Modules: 10, Lectures: 30" -ForegroundColor Gray
    Write-Host ""
    Write-Host "Usage: .\generate-course.ps1 THEO_101" -ForegroundColor Yellow
    Write-Host ""
    exit 0
}

Write-Host "🚀 Starting generation for: $CourseCode" -ForegroundColor Green
Write-Host "⏱️  Estimated time: 2-3 hours" -ForegroundColor Yellow
Write-Host "📁 Output: ../courses/$CourseCode/" -ForegroundColor Yellow
Write-Host ""

# Execute the generation script
$env:NODE_OPTIONS = "--max-old-space-size=8192"
npx ts-node scripts/generate-complete-course.ts $CourseCode

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n========================================" -ForegroundColor Cyan
    Write-Host "✅ GENERATION COMPLETE!" -ForegroundColor Green
    Write-Host "========================================`n" -ForegroundColor Cyan
} else {
    Write-Host "`n========================================" -ForegroundColor Red
    Write-Host "❌ GENERATION FAILED" -ForegroundColor Red
    Write-Host "========================================`n" -ForegroundColor Red
    Write-Host "Check error details above" -ForegroundColor Yellow
}
