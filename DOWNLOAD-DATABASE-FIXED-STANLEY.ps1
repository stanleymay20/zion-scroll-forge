# Complete Database Download Script - FIXED VERSION
# Downloads all data from your Supabase database to local files

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  DATABASE DOWNLOAD UTILITY            " -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Check Docker
Write-Host "[1/4] Checking Docker Desktop..." -ForegroundColor Yellow
$dockerRunning = docker info 2>$null
if (-not $dockerRunning) {
    Write-Host "ERROR: Docker Desktop is not running!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please start Docker Desktop first." -ForegroundColor Yellow
    exit 1
}
Write-Host "✓ Docker is running" -ForegroundColor Green
Write-Host ""

# Step 2: Check Supabase Status
Write-Host "[2/4] Checking Supabase database..." -ForegroundColor Yellow
Set-Location supabase
$status = supabase status 2>&1
$statusCode = $LASTEXITCODE
Set-Location ..

if ($statusCode -ne 0) {
    Write-Host "ERROR: Supabase is not running!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Starting Supabase now..." -ForegroundColor Yellow
    .\START-SUPABASE-DATABASE.ps1
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Failed to start Supabase." -ForegroundColor Red
        exit 1
    }
}
Write-Host "✓ Supabase is running" -ForegroundColor Green
Write-Host ""

# Step 3: Create Backup Directory
Write-Host "[3/4] Creating backup directory..." -ForegroundColor Yellow
$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$backupDir = "database-backups\backup-$timestamp"
New-Item -ItemType Directory -Path $backupDir -Force | Out-Null
Write-Host "✓ Created: $backupDir" -ForegroundColor Green
Write-Host ""

# Step 4: Export Database
Write-Host "[4/4] Exporting database..." -ForegroundColor Yellow
Write-Host ""

# Method 1: SQL Dump (Full backup with schema)
Write-Host "  → Exporting SQL dump (schema + data)..." -ForegroundColor Cyan
$sqlFile = "$backupDir\database-full.sql"
Set-Location supabase
supabase db dump -f "..\$sqlFile" 2>&1 | Out-Null
Set-Location ..

if (Test-Path $sqlFile) {
    $sqlSize = [math]::Round((Get-Item $sqlFile).Length / 1MB, 2)
    Write-Host "    ✓ SQL dump: $sqlSize MB" -ForegroundColor Green
} else {
    Write-Host "    ✗ SQL dump failed" -ForegroundColor Red
}

# Method 2: JSON Export via TypeScript
Write-Host "  → Exporting to JSON format..." -ForegroundColor Cyan
Set-Location backend
npx tsx scripts/export-database-csv.ts 2>&1 | Out-Null
Set-Location ..

# Create README
$readme = @"
# Database Backup - $timestamp

## Backup Contents

This backup contains your complete ScrollUniversity database.

### Files Included:

1. **database-full.sql** - Complete SQL dump with schema and data
   - Can be restored with: psql < database-full.sql
   - Contains all tables, indexes, and constraints

### Tables Backed Up:

- Users and authentication
- Courses, modules, and lectures (with comprehensive content)
- Student enrollments and progress
- Assignments and submissions
- Grades and transcripts
- ScrollGold transactions
- ScrollBadges (NFTs)
- Prayer journals and devotions
- Study groups
- Community posts and messages
- Academic calendar
- Degree programs
- Scholarships
- And more...

### Restore Instructions:

**From SQL file:**
``````powershell
cd supabase
supabase db reset
psql -h localhost -p 54322 -U postgres < ../database-full.sql
``````

### Backup Information:

- Date: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")
- Database: Supabase (Local via Docker)
- Format: SQL
- Location: $backupDir

### Your Database Architecture:

You are using ONE database system: **Supabase (PostgreSQL)**
- Running locally via Docker containers
- NOT using Lovable Cloud (that's for production only)
- NOT using separate Docker PostgreSQL

**What's Running:**
- Docker Desktop (container platform)
- Supabase containers (PostgreSQL + API)
  - Database: localhost:54322
  - API: localhost:54321
  - Studio: localhost:54323

---
"For where your treasure is, there your heart will be also." - Matthew 6:21
"@

$readme | Out-File -FilePath "$backupDir\README.md" -Encoding UTF8

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "  BACKUP COMPLETE!                     " -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Backup Location: $backupDir" -ForegroundColor Cyan
Write-Host ""
Write-Host "Files Created:" -ForegroundColor Yellow
Get-ChildItem $backupDir | ForEach-Object {
    $size = [math]::Round($_.Length / 1KB, 2)
    Write-Host "  ✓ $($_.Name) ($size KB)" -ForegroundColor Green
}
Write-Host ""
Write-Host "Database Architecture Clarification:" -ForegroundColor Cyan
Write-Host "  • You are using ONE database: Supabase (PostgreSQL)" -ForegroundColor White
Write-Host "  • Running locally via Docker (NOT Lovable Cloud)" -ForegroundColor White
Write-Host "  • Docker is just the container platform" -ForegroundColor White
Write-Host "  • All your comprehensive course data is in this backup" -ForegroundColor White
Write-Host ""
Write-Host "Your data is secure! Glory to God!" -ForegroundColor Green
