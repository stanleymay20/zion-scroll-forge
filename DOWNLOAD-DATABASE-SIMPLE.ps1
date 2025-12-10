# Simple Database Download - Direct PostgreSQL Export
# Quick backup without Supabase CLI

Write-Host "Simple Database Download" -ForegroundColor Cyan
Write-Host "========================" -ForegroundColor Cyan
Write-Host ""

# Create backup folder
$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$backupFile = "database-backups\simple-backup-$timestamp.sql"
New-Item -ItemType Directory -Path "database-backups" -Force | Out-Null

Write-Host "Exporting database..." -ForegroundColor Yellow
Write-Host "Output: $backupFile" -ForegroundColor Cyan
Write-Host ""

# Direct PostgreSQL dump (if Supabase is running on port 54322)
$env:PGPASSWORD = "postgres"
pg_dump -h localhost -p 54322 -U postgres -d postgres -f $backupFile 2>&1

if (Test-Path $backupFile) {
    $size = [math]::Round((Get-Item $backupFile).Length / 1MB, 2)
    Write-Host "✓ Success! Exported $size MB" -ForegroundColor Green
    Write-Host "Location: $backupFile" -ForegroundColor Cyan
} else {
    Write-Host "✗ Export failed" -ForegroundColor Red
    Write-Host ""
    Write-Host "Make sure:" -ForegroundColor Yellow
    Write-Host "  1. Docker Desktop is running" -ForegroundColor White
    Write-Host "  2. Supabase is started (run .\START-SUPABASE-DATABASE.ps1)" -ForegroundColor White
    Write-Host "  3. PostgreSQL tools are installed" -ForegroundColor White
}
