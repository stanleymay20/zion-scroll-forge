# Download Database Data from Supabase
# This script exports your database to a local SQL file

Write-Host "=== Supabase Database Export ===" -ForegroundColor Cyan

# Check if Supabase CLI is installed
$supabaseInstalled = Get-Command supabase -ErrorAction SilentlyContinue
if (-not $supabaseInstalled) {
    Write-Host "ERROR: Supabase CLI not found. Installing..." -ForegroundColor Red
    npm install -g supabase
}

# Create backup directory
$backupDir = "database-backups"
if (-not (Test-Path $backupDir)) {
    New-Item -ItemType Directory -Path $backupDir | Out-Null
}

# Generate timestamp for filename
$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$backupFile = "$backupDir/database-backup-$timestamp.sql"

Write-Host "`nExporting database to: $backupFile" -ForegroundColor Yellow

# Export database schema and data
cd supabase
supabase db dump -f "../$backupFile"

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n✓ Database exported successfully!" -ForegroundColor Green
    Write-Host "Location: $backupFile" -ForegroundColor Cyan
    
    # Show file size
    $fileSize = (Get-Item "../$backupFile").Length / 1MB
    Write-Host "Size: $([math]::Round($fileSize, 2)) MB" -ForegroundColor Cyan
} else {
    Write-Host "`n✗ Export failed!" -ForegroundColor Red
}

cd ..
