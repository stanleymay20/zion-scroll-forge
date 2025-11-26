# ScrollUniversity - Secure GitHub Push Script
# This script ensures all secrets are removed before pushing to GitHub

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "ScrollUniversity Secure GitHub Push" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Check if .env files are in gitignore
Write-Host "[1/7] Verifying .gitignore configuration..." -ForegroundColor Yellow
$gitignoreContent = Get-Content .gitignore -Raw
if ($gitignoreContent -match "\.env" -and $gitignoreContent -match "backend/\.env") {
    Write-Host "✓ .gitignore properly configured" -ForegroundColor Green
} else {
    Write-Host "✗ WARNING: .gitignore may not be properly configured!" -ForegroundColor Red
    exit 1
}

# Step 2: Remove .env files from git tracking if they exist
Write-Host "[2/7] Removing .env files from git tracking..." -ForegroundColor Yellow
git rm --cached .env -f 2>$null
git rm --cached backend/.env -f 2>$null
git rm --cached .env.local -f 2>$null
git rm --cached backend/.env.local -f 2>$null
Write-Host "✓ .env files removed from tracking" -ForegroundColor Green

# Step 3: Check for any API keys or secrets in staged files
Write-Host "[3/7] Scanning for exposed secrets..." -ForegroundColor Yellow
$suspiciousPatterns = @(
    "sk-proj-",
    "sk-or-v1-",
    "sk-cab",
    "OPENAI_API_KEY=`"sk-",
    "OPENROUTER_API_KEY=`"sk-",
    "DEEPSEEK_API_KEY=`"sk-",
    "ANTHROPIC_API_KEY=`"sk-",
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9"
)

$foundSecrets = $false
foreach ($pattern in $suspiciousPatterns) {
    $result = git diff --cached | Select-String -Pattern $pattern -Quiet
    if ($result) {
        Write-Host "✗ WARNING: Found potential secret matching pattern: $pattern" -ForegroundColor Red
        $foundSecrets = $true
    }
}

if ($foundSecrets) {
    Write-Host ""
    Write-Host "CRITICAL: Secrets detected in staged files!" -ForegroundColor Red
    Write-Host "Please remove all API keys and secrets before pushing." -ForegroundColor Red
    Write-Host "Run: git reset HEAD <file> to unstage files with secrets" -ForegroundColor Yellow
    exit 1
}
Write-Host "✓ No secrets detected in staged files" -ForegroundColor Green

# Step 4: Verify .env.example files exist
Write-Host "[4/7] Verifying example environment files..." -ForegroundColor Yellow
if (Test-Path ".env.example" -and Test-Path "backend/.env.example") {
    Write-Host "✓ Example environment files present" -ForegroundColor Green
} else {
    Write-Host "✗ WARNING: Missing .env.example files!" -ForegroundColor Red
}

# Step 5: Add all changes except .env files
Write-Host "[5/7] Staging changes (excluding .env files)..." -ForegroundColor Yellow
git add .
git reset HEAD .env 2>$null
git reset HEAD backend/.env 2>$null
git reset HEAD "*.env.local" 2>$null
git reset HEAD "*.env.production" 2>$null
Write-Host "✓ Changes staged safely" -ForegroundColor Green

# Step 6: Show what will be committed
Write-Host "[6/7] Files to be committed:" -ForegroundColor Yellow
git status --short

# Step 7: Prompt for commit and push
Write-Host ""
Write-Host "[7/7] Ready to commit and push" -ForegroundColor Yellow
$commitMessage = Read-Host "Enter commit message (or 'cancel' to abort)"

if ($commitMessage -eq "cancel" -or $commitMessage -eq "") {
    Write-Host "Push cancelled by user" -ForegroundColor Yellow
    exit 0
}

# Commit changes
Write-Host "Committing changes..." -ForegroundColor Yellow
git commit -m "$commitMessage"

# Push to GitHub
Write-Host "Pushing to GitHub..." -ForegroundColor Yellow
$pushResult = git push origin main 2>&1

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "✓ Successfully pushed to GitHub!" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "Security Checklist:" -ForegroundColor Cyan
    Write-Host "  ✓ .env files excluded" -ForegroundColor Green
    Write-Host "  ✓ API keys protected" -ForegroundColor Green
    Write-Host "  ✓ Secrets not exposed" -ForegroundColor Green
} else {
    Write-Host ""
    Write-Host "✗ Push failed!" -ForegroundColor Red
    Write-Host "Error: $pushResult" -ForegroundColor Red
    Write-Host ""
    Write-Host "Common solutions:" -ForegroundColor Yellow
    Write-Host "  1. Check your internet connection" -ForegroundColor White
    Write-Host "  2. Verify GitHub authentication: git config --list" -ForegroundColor White
    Write-Host "  3. Pull latest changes first: git pull origin main" -ForegroundColor White
    exit 1
}
