# Lovable Cloud to Supabase Migration Script
# "Trust in the Lord with all your heart" - Proverbs 3:5

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Lovable Cloud to Supabase Migration" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "This script will migrate all data from Lovable Cloud to Supabase" -ForegroundColor White
Write-Host ""

# Navigate to backend
Set-Location backend

# Run migration
npx ts-node scripts/migrate-lovable-to-supabase.ts

Set-Location ..

Write-Host ""
Write-Host "Migration complete!" -ForegroundColor Green
