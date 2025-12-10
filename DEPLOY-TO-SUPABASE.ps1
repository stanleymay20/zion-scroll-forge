# Deploy to Supabase Production - PowerShell Script
# "Deploying the Kingdom's Educational Platform"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Supabase Production Deployment Script" -ForegroundColor Cyan
Write-Host "ScrollUniversity Platform" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if Supabase CLI is installed
Write-Host "Checking Supabase CLI installation..." -ForegroundColor Yellow
$supabaseVersion = supabase --version 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Supabase CLI not found!" -ForegroundColor Red
    Write-Host "Install it with: npm install -g supabase" -ForegroundColor Yellow
    exit 1
}
Write-Host "✅ Supabase CLI installed: $supabaseVersion" -ForegroundColor Green
Write-Host ""

# Check if user is logged in
Write-Host "Checking Supabase authentication..." -ForegroundColor Yellow
$loginStatus = supabase projects list 2>&1
if ($loginStatus -match "not logged in" -or $LASTEXITCODE -ne 0) {
    Write-Host "❌ Not logged in to Supabase" -ForegroundColor Red
    Write-Host "Please run: supabase login" -ForegroundColor Yellow
    exit 1
}
Write-Host "✅ Authenticated with Supabase" -ForegroundColor Green
Write-Host ""

# Prompt for project reference ID
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Project Configuration" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Do you have an existing Supabase project? (Y/N)" -ForegroundColor Yellow
$hasProject = Read-Host

if ($hasProject -eq "N" -or $hasProject -eq "n") {
    Write-Host ""
    Write-Host "Creating new Supabase project..." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Please provide the following information:" -ForegroundColor Cyan
    
    $projectName = Read-Host "Project Name (e.g., zion-scroll-forge)"
    $dbPassword = Read-Host "Database Password (strong password)" -AsSecureString
    $dbPasswordPlain = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($dbPassword))
    $region = Read-Host "Region (e.g., us-east-1, eu-west-1)"
    
    Write-Host ""
    Write-Host "Creating project..." -ForegroundColor Yellow
    
    # Note: This requires org-id which user needs to get from dashboard
    Write-Host "⚠️  To create a project via CLI, you need your Organization ID" -ForegroundColor Yellow
    Write-Host "Get it from: https://supabase.com/dashboard/org/_/settings" -ForegroundColor Yellow
    $orgId = Read-Host "Organization ID"
    
    $createResult = supabase projects create $projectName --org-id $orgId --db-password $dbPasswordPlain --region $region 2>&1
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Failed to create project" -ForegroundColor Red
        Write-Host $createResult -ForegroundColor Red
        Write-Host ""
        Write-Host "Please create project manually at: https://supabase.com/dashboard" -ForegroundColor Yellow
        exit 1
    }
    
    Write-Host "✅ Project created successfully!" -ForegroundColor Green
    Write-Host $createResult -ForegroundColor Gray
    Write-Host ""
    
    # Extract project ref from output
    $projectRef = ($createResult | Select-String -Pattern "Project Ref: (\w+)").Matches.Groups[1].Value
} else {
    Write-Host ""
    Write-Host "Enter your Supabase Project Reference ID:" -ForegroundColor Yellow
    Write-Host "(Find it in: Project Settings → General → Reference ID)" -ForegroundColor Gray
    $projectRef = Read-Host "Project Ref"
}

Write-Host ""
Write-Host "Using Project Ref: $projectRef" -ForegroundColor Cyan
Write-Host ""

# Link project
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Linking Local Project to Production" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Linking project..." -ForegroundColor Yellow
$linkResult = supabase link --project-ref $projectRef 2>&1

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to link project" -ForegroundColor Red
    Write-Host $linkResult -ForegroundColor Red
    exit 1
}

Write-Host "✅ Project linked successfully!" -ForegroundColor Green
Write-Host ""

# Push migrations
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Pushing Database Migrations" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "⚠️  This will apply all migrations to production database" -ForegroundColor Yellow
Write-Host "Do you want to continue? (Y/N)" -ForegroundColor Yellow
$confirmMigration = Read-Host

if ($confirmMigration -ne "Y" -and $confirmMigration -ne "y") {
    Write-Host "Migration cancelled" -ForegroundColor Yellow
    exit 0
}

Write-Host ""
Write-Host "Pushing migrations..." -ForegroundColor Yellow
$pushResult = supabase db push 2>&1

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to push migrations" -ForegroundColor Red
    Write-Host $pushResult -ForegroundColor Red
    exit 1
}

Write-Host "✅ Migrations applied successfully!" -ForegroundColor Green
Write-Host ""

# Get production credentials
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Production Credentials" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Fetching production credentials..." -ForegroundColor Yellow
$projectInfo = supabase projects list --format json | ConvertFrom-Json | Where-Object { $_.id -eq $projectRef }

if ($projectInfo) {
    $supabaseUrl = "https://$projectRef.supabase.co"
    
    Write-Host ""
    Write-Host "✅ Production Setup Complete!" -ForegroundColor Green
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host "Next Steps" -ForegroundColor Cyan
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "1. Get your API keys from Supabase Dashboard:" -ForegroundColor Yellow
    Write-Host "   https://supabase.com/dashboard/project/$projectRef/settings/api" -ForegroundColor Gray
    Write-Host ""
    Write-Host "2. Update your environment variables:" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "   Backend (.env.production):" -ForegroundColor Cyan
    Write-Host "   DATABASE_URL=postgresql://postgres:[PASSWORD]@db.$projectRef.supabase.co:5432/postgres" -ForegroundColor Gray
    Write-Host "   SUPABASE_URL=$supabaseUrl" -ForegroundColor Gray
    Write-Host "   SUPABASE_ANON_KEY=[YOUR-ANON-KEY]" -ForegroundColor Gray
    Write-Host "   SUPABASE_SERVICE_ROLE_KEY=[YOUR-SERVICE-ROLE-KEY]" -ForegroundColor Gray
    Write-Host ""
    Write-Host "   Frontend (.env.production):" -ForegroundColor Cyan
    Write-Host "   VITE_SUPABASE_URL=$supabaseUrl" -ForegroundColor Gray
    Write-Host "   VITE_SUPABASE_ANON_KEY=[YOUR-ANON-KEY]" -ForegroundColor Gray
    Write-Host ""
    Write-Host "3. Verify deployment:" -ForegroundColor Yellow
    Write-Host "   supabase db remote status" -ForegroundColor Gray
    Write-Host ""
    Write-Host "4. Test your application with production database" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host "Deployment Summary" -ForegroundColor Cyan
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Project Ref: $projectRef" -ForegroundColor Green
    Write-Host "Supabase URL: $supabaseUrl" -ForegroundColor Green
    Write-Host "Status: ✅ DEPLOYED" -ForegroundColor Green
    Write-Host ""
    Write-Host "Dashboard: https://supabase.com/dashboard/project/$projectRef" -ForegroundColor Cyan
    Write-Host ""
} else {
    Write-Host "⚠️  Could not fetch project info automatically" -ForegroundColor Yellow
    Write-Host "Please get your credentials from:" -ForegroundColor Yellow
    Write-Host "https://supabase.com/dashboard/project/$projectRef/settings/api" -ForegroundColor Cyan
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Deployment Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host '"Upon this rock I will build my church" - Matthew 16:18' -ForegroundColor Cyan
Write-Host ""
