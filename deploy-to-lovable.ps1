# ScrollUniversity - Lovable Deployment Script
# This script helps prepare and deploy your project to Lovable

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "ScrollUniversity - Lovable Deployment" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if we're in the right directory
if (-not (Test-Path "package.json")) {
    Write-Host "Error: package.json not found. Please run this script from the project root." -ForegroundColor Red
    exit 1
}

# Step 1: Check Git status
Write-Host "Step 1: Checking Git status..." -ForegroundColor Yellow
$gitStatus = git status --porcelain
if ($gitStatus) {
    Write-Host "You have uncommitted changes:" -ForegroundColor Yellow
    git status --short
    Write-Host ""
    $commit = Read-Host "Do you want to commit these changes? (y/n)"
    if ($commit -eq "y") {
        $message = Read-Host "Enter commit message"
        git add .
        git commit -m "$message"
        Write-Host "Changes committed!" -ForegroundColor Green
    }
}

# Step 2: Check for required files
Write-Host ""
Write-Host "Step 2: Checking required files..." -ForegroundColor Yellow
$requiredFiles = @(
    "package.json",
    "vite.config.ts",
    "index.html",
    ".env.example"
)

$missingFiles = @()
foreach ($file in $requiredFiles) {
    if (-not (Test-Path $file)) {
        $missingFiles += $file
    }
}

if ($missingFiles.Count -gt 0) {
    Write-Host "Warning: Missing required files:" -ForegroundColor Red
    $missingFiles | ForEach-Object { Write-Host "  - $_" -ForegroundColor Red }
} else {
    Write-Host "All required files present!" -ForegroundColor Green
}

# Step 3: Check environment variables
Write-Host ""
Write-Host "Step 3: Checking environment variables..." -ForegroundColor Yellow
if (Test-Path ".env.local") {
    Write-Host ".env.local found!" -ForegroundColor Green
    Write-Host "Make sure to add these variables to Lovable dashboard:" -ForegroundColor Yellow
    Get-Content .env.local | Where-Object { $_ -match "^VITE_" } | ForEach-Object {
        $key = ($_ -split "=")[0]
        Write-Host "  - $key" -ForegroundColor Cyan
    }
} else {
    Write-Host "Warning: .env.local not found. You'll need to configure environment variables in Lovable." -ForegroundColor Yellow
}

# Step 4: Test build
Write-Host ""
Write-Host "Step 4: Testing build..." -ForegroundColor Yellow
$testBuild = Read-Host "Do you want to test the build locally? (y/n)"
if ($testBuild -eq "y") {
    Write-Host "Running build..." -ForegroundColor Cyan
    npm run build
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Build successful!" -ForegroundColor Green
    } else {
        Write-Host "Build failed! Please fix errors before deploying." -ForegroundColor Red
        exit 1
    }
}

# Step 5: Push to Git
Write-Host ""
Write-Host "Step 5: Pushing to Git..." -ForegroundColor Yellow
$currentBranch = git branch --show-current
Write-Host "Current branch: $currentBranch" -ForegroundColor Cyan

$push = Read-Host "Do you want to push to remote? (y/n)"
if ($push -eq "y") {
    git push origin $currentBranch
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Pushed to remote successfully!" -ForegroundColor Green
    } else {
        Write-Host "Push failed! Please check your Git configuration." -ForegroundColor Red
        exit 1
    }
}

# Step 6: Deployment instructions
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Next Steps for Lovable Deployment" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Go to https://lovable.dev and sign in" -ForegroundColor White
Write-Host "2. Click 'Import Project' or 'New Project'" -ForegroundColor White
Write-Host "3. Select 'Import from Git'" -ForegroundColor White
Write-Host "4. Choose your repository: zion-scroll-forge" -ForegroundColor White
Write-Host "5. Select branch: $currentBranch" -ForegroundColor White
Write-Host ""
Write-Host "Build Configuration:" -ForegroundColor Yellow
Write-Host "  - Build Command: npm run build" -ForegroundColor Cyan
Write-Host "  - Output Directory: dist" -ForegroundColor Cyan
Write-Host "  - Install Command: npm install" -ForegroundColor Cyan
Write-Host "  - Node Version: 20.x" -ForegroundColor Cyan
Write-Host ""
Write-Host "Environment Variables to Add:" -ForegroundColor Yellow
if (Test-Path ".env.local") {
    Get-Content .env.local | Where-Object { $_ -match "^VITE_" } | ForEach-Object {
        Write-Host "  $_" -ForegroundColor Cyan
    }
} else {
    Write-Host "  VITE_SUPABASE_URL=your_supabase_url" -ForegroundColor Cyan
    Write-Host "  VITE_SUPABASE_ANON_KEY=your_supabase_anon_key" -ForegroundColor Cyan
    Write-Host "  VITE_API_URL=your_backend_api_url" -ForegroundColor Cyan
}
Write-Host ""
Write-Host "6. Add your custom domain in Project Settings → Domains" -ForegroundColor White
Write-Host "7. Enable auto-deploy in Project Settings → Git" -ForegroundColor White
Write-Host ""
Write-Host "For detailed instructions, see: LOVABLE_RECONNECTION_GUIDE.md" -ForegroundColor Green
Write-Host ""
Write-Host "Deployment preparation complete! 🚀" -ForegroundColor Green
Write-Host ""

# Optional: Open Lovable dashboard
$openBrowser = Read-Host "Do you want to open Lovable dashboard in browser? (y/n)"
if ($openBrowser -eq "y") {
    Start-Process "https://lovable.dev"
}
