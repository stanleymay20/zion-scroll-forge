# ScrollUniversity Master Content Generation Launcher
# Windows PowerShell Script

param(
    [Parameter(Mandatory=$false)]
    [ValidateSet("full", "batch", "test")]
    [string]$Mode = "batch",
    
    [Parameter(Mandatory=$false)]
    [int]$BatchNumber = 1
)

Write-Host "`n" -NoNewline
Write-Host ("=" * 80) -ForegroundColor Cyan
Write-Host "🎓 SCROLLUNIVERSITY MASTER CONTENT GENERATOR" -ForegroundColor Green
Write-Host ("=" * 80) -ForegroundColor Cyan
Write-Host ""

# Check environment
Write-Host "🔍 Checking environment..." -ForegroundColor Yellow

if (-not (Test-Path ".env")) {
    Write-Host "❌ .env file not found!" -ForegroundColor Red
    Write-Host "Please create .env file with required variables" -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ Environment file found" -ForegroundColor Green

# Check Node.js
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js version: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js not found!" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host ("=" * 80) -ForegroundColor Cyan

switch ($Mode) {
    "test" {
        Write-Host "🧪 TEST MODE - Generating single course" -ForegroundColor Yellow
        Write-Host ("=" * 80) -ForegroundColor Cyan
        Write-Host ""
        
        Write-Host "Generating THEO_101..." -ForegroundColor Cyan
        npx ts-node scripts/simple-course-generator.ts THEO_101
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host ""
            Write-Host "✅ Test generation successful!" -ForegroundColor Green
            Write-Host "You can now run full generation with:" -ForegroundColor Yellow
            Write-Host "  .\start-master-generation.ps1 -Mode batch" -ForegroundColor White
        } else {
            Write-Host ""
            Write-Host "❌ Test generation failed" -ForegroundColor Red
            Write-Host "Please check errors above and fix before proceeding" -ForegroundColor Yellow
        }
    }
    
    "batch" {
        Write-Host "📦 BATCH MODE - Generating batch $BatchNumber (50 items)" -ForegroundColor Yellow
        Write-Host ("=" * 80) -ForegroundColor Cyan
        Write-Host ""
        
        Write-Host "⚠️  This will take approximately 2-3 hours" -ForegroundColor Yellow
        Write-Host "Press Ctrl+C to cancel, or wait 5 seconds to continue..." -ForegroundColor Yellow
        Start-Sleep -Seconds 5
        
        Write-Host ""
        Write-Host "🚀 Starting batch generation..." -ForegroundColor Green
        
        $env:NODE_OPTIONS = "--max-old-space-size=8192"
        npx ts-node scripts/batch-master-generator.ts $BatchNumber
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host ""
            Write-Host "✅ Batch $BatchNumber complete!" -ForegroundColor Green
            Write-Host ""
            Write-Host "To continue with next batch, run:" -ForegroundColor Yellow
            Write-Host "  .\start-master-generation.ps1 -Mode batch -BatchNumber $($BatchNumber + 1)" -ForegroundColor White
        } else {
            Write-Host ""
            Write-Host "❌ Batch generation failed" -ForegroundColor Red
        }
    }
    
    "full" {
        Write-Host "🚀 FULL MODE - Generating ALL 10,000+ courses" -ForegroundColor Yellow
        Write-Host ("=" * 80) -ForegroundColor Cyan
        Write-Host ""
        
        Write-Host "⚠️  WARNING: This will take 200-300 hours!" -ForegroundColor Red
        Write-Host "⚠️  Ensure stable power and internet connection" -ForegroundColor Red
        Write-Host "⚠️  Recommended for dedicated servers only" -ForegroundColor Red
        Write-Host ""
        Write-Host "Press Ctrl+C to cancel, or wait 10 seconds to continue..." -ForegroundColor Yellow
        Start-Sleep -Seconds 10
        
        Write-Host ""
        Write-Host "🚀 Starting full master generation..." -ForegroundColor Green
        Write-Host "📊 Progress will be displayed in real-time" -ForegroundColor Cyan
        Write-Host ""
        
        $env:NODE_OPTIONS = "--max-old-space-size=8192"
        npx ts-node scripts/master-content-generator.ts
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host ""
            Write-Host ("=" * 80) -ForegroundColor Green
            Write-Host "🎉 MASTER GENERATION COMPLETE!" -ForegroundColor Green
            Write-Host ("=" * 80) -ForegroundColor Green
            Write-Host ""
            Write-Host "Check MASTER_GENERATION_COMPLETE.json for full report" -ForegroundColor Cyan
        } else {
            Write-Host ""
            Write-Host "❌ Master generation failed" -ForegroundColor Red
            Write-Host "Check master-generation-log.txt for details" -ForegroundColor Yellow
        }
    }
}

Write-Host ""
Write-Host ("=" * 80) -ForegroundColor Cyan
Write-Host "✅ Script execution complete" -ForegroundColor Green
Write-Host ("=" * 80) -ForegroundColor Cyan
Write-Host ""
