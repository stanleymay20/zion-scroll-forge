# Full Database Setup Script for ScrollUniversity
# "The fear of the Lord is the beginning of wisdom" - Proverbs 9:10

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "ScrollUniversity Full Database Setup" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if Supabase is running
Write-Host "Checking Supabase status..." -ForegroundColor Yellow
$supabaseStatus = & supabase status 2>&1

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Supabase is not running!" -ForegroundColor Red
    Write-Host "Starting Supabase..." -ForegroundColor Yellow
    & supabase start
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Failed to start Supabase" -ForegroundColor Red
        exit 1
    }
    
    Write-Host "✅ Supabase started successfully" -ForegroundColor Green
} else {
    Write-Host "✅ Supabase is running" -ForegroundColor Green
}

Write-Host ""

# Navigate to backend directory
Set-Location backend

# Check for reset flag
$resetDatabase = $env:RESET_DATABASE
if ($resetDatabase -eq "true") {
    Write-Host "⚠️  WARNING: Database will be reset!" -ForegroundColor Red
    Write-Host "All existing data will be lost." -ForegroundColor Red
    Write-Host ""
    $confirmation = Read-Host "Type 'YES' to confirm database reset"
    
    if ($confirmation -ne "YES") {
        Write-Host "❌ Database reset cancelled" -ForegroundColor Yellow
        Set-Location ..
        exit 0
    }
}

Write-Host ""
Write-Host "Running full database setup..." -ForegroundColor Cyan
Write-Host ""

# Run the setup script
& npx ts-node scripts/setup-full-database.ts

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "✅ DATABASE SETUP COMPLETE!" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Cyan
    Write-Host "1. Start the backend server: npm run dev" -ForegroundColor White
    Write-Host "2. Start the frontend: cd .. && npm run dev" -ForegroundColor White
    Write-Host "3. Access the application at http://localhost:5173" -ForegroundColor White
    Write-Host ""
} else {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Red
    Write-Host "❌ DATABASE SETUP FAILED" -ForegroundColor Red
    Write-Host "========================================" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please check the error messages above" -ForegroundColor Yellow
    Write-Host ""
}

# Return to root directory
Set-Location ..

exit $LASTEXITCODE
