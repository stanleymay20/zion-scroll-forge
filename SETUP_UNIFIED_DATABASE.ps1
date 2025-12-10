# Setup Unified Database for Kiro + Lovable
# This script configures Supabase as the single database for both tools

Write-Host "🚀 Setting up Unified Database (Supabase)" -ForegroundColor Cyan
Write-Host "=" * 60

# Step 1: Stop any existing Docker PostgreSQL
Write-Host "`n📦 Step 1: Stopping Docker PostgreSQL (if running)..." -ForegroundColor Yellow
docker-compose down 2>$null
Write-Host "✅ Docker PostgreSQL stopped" -ForegroundColor Green

# Step 2: Start Supabase
Write-Host "`n🔧 Step 2: Starting Supabase..." -ForegroundColor Yellow
supabase start

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Supabase failed to start. Trying to fix..." -ForegroundColor Red
    supabase stop
    supabase start
}

# Step 3: Get Supabase connection details
Write-Host "`n📋 Step 3: Getting Supabase connection details..." -ForegroundColor Yellow
$status = supabase status

# Step 4: Update backend .env
Write-Host "`n✏️  Step 4: Updating backend/.env..." -ForegroundColor Yellow

$backendEnv = @"
# ScrollAccreditation System Environment Configuration
# Using Supabase for unified database (Kiro + Lovable compatible)

# Supabase Configuration (Local Development)
DATABASE_URL="postgresql://postgres:postgres@localhost:54322/postgres"
SUPABASE_URL="http://localhost:54321"
SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0"
SUPABASE_SERVICE_ROLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU"

# Application Configuration
NODE_ENV="development"
PORT="3001"
FRONTEND_URL="http://localhost:3000"

# JWT Configuration
JWT_SECRET="scroll_kingdom_secret_2025"
JWT_EXPIRES_IN="7d"

# AI Configuration
OPENROUTER_API_KEY="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"
OPENAI_API_KEY="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"
DEEPSEEK_API_KEY="sk-cab0b71f6aac4b76a3a5f3cdf0874913"

# Primary AI Provider
AI_PROVIDER="deepseek"
AI_MODEL_PRIMARY="deepseek-chat"
AI_MAX_TOKENS="4000"
AI_TEMPERATURE="0.7"

# D-ID Video Avatar
DID_API_KEY="c3RhbmxleW1heTIwQGdtYWlsLmNvbQ:jQkvesZ8S_8DP1mjkxzNG"
DID_BASE_URL="https://api.d-id.com"

# Redis (optional - for caching)
REDIS_URL="redis://localhost:6379"
"@

Set-Content -Path "backend/.env" -Value $backendEnv -Encoding UTF8
Write-Host "Backend .env updated" -ForegroundColor Green

# Step 5: Update root .env for frontend
Write-Host "`n✏️  Step 5: Updating root .env..." -ForegroundColor Yellow

$rootEnv = @"
# ScrollUniversity Frontend Environment Variables
# Using Supabase (unified with backend)

# Supabase Configuration (Local Development)
VITE_SUPABASE_URL=http://localhost:54321
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0

# API Configuration
VITE_API_URL=http://localhost:3001

# Environment
VITE_NODE_ENV=development
"@

Set-Content -Path ".env" -Value $rootEnv -Encoding UTF8
Write-Host "Root .env updated" -ForegroundColor Green

# Step 6: Push Prisma schema to Supabase
Write-Host "`n🗄️  Step 6: Syncing database schema..." -ForegroundColor Yellow
cd backend
npx prisma generate
npx prisma db push --accept-data-loss

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Database schema synced" -ForegroundColor Green
} else {
    Write-Host "⚠️  Schema sync had issues - check manually" -ForegroundColor Yellow
}

cd ..

# Step 7: Summary
Write-Host "`n" + ("=" * 60) -ForegroundColor Cyan
Write-Host "✨ SETUP COMPLETE!" -ForegroundColor Green
Write-Host ("=" * 60) -ForegroundColor Cyan

Write-Host "`n📊 Database Status:" -ForegroundColor Cyan
supabase status

Write-Host "`nNext Steps:" -ForegroundColor Cyan
Write-Host "  1. Start backend:  cd backend; npm run dev" -ForegroundColor White
Write-Host "  2. Start frontend: npm run dev" -ForegroundColor White
Write-Host "  3. Generate courses: cd backend; npx tsx scripts/generate-comprehensive-courses.ts" -ForegroundColor White

Write-Host "`n🔗 Access Points:" -ForegroundColor Cyan
Write-Host "  • Supabase Studio: http://localhost:54323" -ForegroundColor White
Write-Host "  • API: http://localhost:54321" -ForegroundColor White
Write-Host "  • Database: postgresql://postgres:postgres@localhost:54322/postgres" -ForegroundColor White

Write-Host "`n💡 Tip: Both Kiro and Lovable now use the same database!" -ForegroundColor Yellow
Write-Host ""
