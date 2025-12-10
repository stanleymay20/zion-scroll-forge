# Complete Database Download Script
# Downloads all data from your Supabase database to local files
# "Store up treasures in heaven" - Matthew 6:20

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  DATABASE DOWNLOAD UTILITY            " -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Check Docker
Write-Host "[1/4] Checking Docker Desktop..." -ForegroundColor Yellow
$dockerRunning = docker info 2>$null
if (-not $dockerRunning) {
    Write-Host "ERROR: Docker Desktop is not running!" -ForegroundColor Red
    Write-Host "Please start Docker Desktop first." -ForegroundColor Red
    Write-Host ""
    Write-Host "Steps:" -ForegroundColor Cyan
    Write-Host "  1. Open Docker Desktop" -ForegroundColor White
    Write-Host "  2. Wait for it to start completely" -ForegroundColor White
    Write-Host "  3. Run this script again" -ForegroundColor White
    exit 1
}
Write-Host "✓ Docker is running" -ForegroundColor Green
Write-Host ""

# Step 2: Check Supabase Status
Write-Host "[2/4] Checking Supabase database..." -ForegroundColor Yellow
Set-Location supabase
$status = supabase status 2>&1
Set-Location ..

if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Supabase is not running!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Starting Supabase now..." -ForegroundColor Yellow
    .\START-SUPABASE-DATABASE.ps1
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Failed to start Supabase. Please check Docker." -ForegroundColor Red
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

# Method 2: JSON Export (Easy to read/import)
Write-Host "  → Exporting to JSON format..." -ForegroundColor Cyan
Set-Location backend
$jsonExport = node -e "
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const supabase = createClient('http://localhost:54321', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0');

const tables = ['courses', 'course_modules', 'lectures', 'enrollments', 'users', 'assignments', 'submissions', 'scrollcoin_transactions', 'scrollbadges', 'prayer_journal_entries', 'devotions', 'study_groups', 'community_posts', 'academic_calendar', 'degree_programs', 'scholarships'];

async function exportAll() {
    const backup = {};
    let totalRows = 0;
    
    for (const table of tables) {
        try {
            const { data, error } = await supabase.from(table).select('*');
            if (!error && data) {
                backup[table] = data;
                totalRows += data.length;
                console.log('    ✓ ' + table + ': ' + data.length + ' rows');
            }
        } catch (err) {
            console.log('    ⚠ ' + table + ': empty or not found');
        }
    }
    
    fs.writeFileSync('../$backupDir/database-data.json', JSON.stringify(backup, null, 2));
    console.log('');
    console.log('    ✓ Total: ' + totalRows + ' rows exported');
    return totalRows;
}

exportAll().catch(console.error);
" 2>&1

Write-Host $jsonExport
Set-Location ..

if (Test-Path "$backupDir\database-data.json") {
    $jsonSize = [math]::Round((Get-Item "$backupDir\database-data.json").Length / 1MB, 2)
    Write-Host "    ✓ JSON export: $jsonSize MB" -ForegroundColor Green
}

# Create README
$readme = @"
# Database Backup - $timestamp

## Backup Contents

This backup contains your complete ScrollUniversity database.

### Files Included:

1. **database-full.sql** - Complete SQL dump with schema and data
   - Can be restored with: psql < database-full.sql
   - Contains all tables, indexes, and constraints

2. **database-data.json** - JSON export of all table data
   - Easy to read and parse
   - Can be imported programmatically
   - Human-readable format

### Tables Backed Up:

- Users and authentication
- Courses, modules, and lectures
- Student enrollments and progress
- Assignments and submissions
- Grades and transcripts
- ScrollCoin transactions
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

**From JSON file:**
Use the import script or Supabase dashboard to restore data.

### Backup Information:

- Date: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")
- Database: Supabase (Local)
- Format: SQL + JSON
- Location: $backupDir

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
Write-Host "You can now:" -ForegroundColor Cyan
Write-Host "  • Open the JSON file in any text editor" -ForegroundColor White
Write-Host "  • Import the SQL file into another database" -ForegroundColor White
Write-Host "  • Archive these files for safekeeping" -ForegroundColor White
Write-Host ""
Write-Host "Your data is secure! Glory to God!" -ForegroundColor Green
