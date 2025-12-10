# Simple Setup Script for Unified Database
Write-Host "Setting up Unified Database (Supabase)" -ForegroundColor Cyan

# Stop Docker PostgreSQL
Write-Host "Stopping Docker PostgreSQL..." -ForegroundColor Yellow
docker-compose down 2>$null

# Start Supabase
Write-Host "Starting Supabase..." -ForegroundColor Yellow
supabase start

# Show status
Write-Host "`nSupabase Status:" -ForegroundColor Cyan
supabase status

Write-Host "`nNext: Update .env files and run: cd backend; npx prisma db push" -ForegroundColor Green
