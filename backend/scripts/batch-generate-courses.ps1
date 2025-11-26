# Batch Course Generation Script
# Generates multiple complete courses one at a time

$env:DEEPSEEK_API_KEY = "sk-cab0b71f6aac4b76a3a5f3cdf0874913"

$courses = @(
    "KINGBIZ_301",
    "SCROLLFOUND_101",
    "SPIRFORM_101",
    "BIBWORLD_201",
    "SACREDAI_201"
)

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "BATCH COURSE GENERATION" -ForegroundColor Cyan
Write-Host "Generating $($courses.Count) complete courses" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

$successCount = 0
$failCount = 0

foreach ($course in $courses) {
    Write-Host "`n`n" -NoNewline
    Write-Host ">>> STARTING: $course" -ForegroundColor Yellow
    Write-Host "========================================" -ForegroundColor Yellow
    
    try {
        npx tsx scripts/generate-full-course-standalone.ts $course
        
        if ($LASTEXITCODE -eq 0) {
            $successCount++
            Write-Host "✅ SUCCESS: $course" -ForegroundColor Green
        } else {
            $failCount++
            Write-Host "❌ FAILED: $course (Exit code: $LASTEXITCODE)" -ForegroundColor Red
        }
    } catch {
        $failCount++
        Write-Host "❌ ERROR: $course - $_" -ForegroundColor Red
    }
    
    # Brief pause between courses
    Start-Sleep -Seconds 5
}

Write-Host "`n`n========================================" -ForegroundColor Cyan
Write-Host "BATCH GENERATION COMPLETE" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "✅ Successful: $successCount" -ForegroundColor Green
Write-Host "❌ Failed: $failCount" -ForegroundColor Red
