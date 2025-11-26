# ============================================
# ScrollUniversity - Remove Secrets from Git
# ============================================
# This script removes .env files from Git tracking
# while keeping them on your local filesystem

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "  ScrollUniversity - Security Cleanup Script" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# Check if we're in a git repository
if (-not (Test-Path .git)) {
    Write-Host "ERROR: Not in a Git repository!" -ForegroundColor Red
    Write-Host "Please run this script from the project root." -ForegroundColor Red
    exit 1
}

Write-Host "Step 1: Checking for tracked .env files..." -ForegroundColor Yellow
$trackedEnvFiles = git ls-files | Select-String "\.env$" | Where-Object { $_ -notmatch "\.example$" }

if ($trackedEnvFiles) {
    Write-Host "Found tracked .env files:" -ForegroundColor Red
    $trackedEnvFiles | ForEach-Object { Write-Host "  - $_" -ForegroundColor Red }
    Write-Host ""
    
    $confirm = Read-Host "Do you want to remove these from Git tracking? (yes/no)"
    
    if ($confirm -eq "yes") {
        Write-Host ""
        Write-Host "Step 2: Removing .env files from Git tracking..." -ForegroundColor Yellow
        
        # Remove each tracked .env file
        $trackedEnvFiles | ForEach-Object {
            $file = $_.ToString()
            Write-Host "  Removing: $file" -ForegroundColor Cyan
            git rm --cached $file
        }
        
        Write-Host ""
        Write-Host "Step 3: Committing changes..." -ForegroundColor Yellow
        git commit -m "security: Remove .env files from version control

- Removed all .env files from Git tracking
- Files remain on local filesystem
- Updated .gitignore to prevent future commits
- See SECURITY_SETUP_GUIDE.md for next steps"
        
        Write-Host ""
        Write-Host "✓ SUCCESS: .env files removed from Git!" -ForegroundColor Green
        Write-Host ""
        Write-Host "IMPORTANT NEXT STEPS:" -ForegroundColor Yellow
        Write-Host "1. Rotate ALL secrets (API keys, passwords, etc.)" -ForegroundColor White
        Write-Host "2. Update your .env files with new secrets" -ForegroundColor White
        Write-Host "3. Read SECURITY_SETUP_GUIDE.md for detailed instructions" -ForegroundColor White
        Write-Host "4. Push this commit: git push origin main" -ForegroundColor White
        Write-Host ""
        Write-Host "⚠️  WARNING: Old secrets may still be in Git history!" -ForegroundColor Red
        Write-Host "   Consider using BFG Repo-Cleaner to remove them completely." -ForegroundColor Red
        Write-Host "   See SECURITY_SETUP_GUIDE.md for instructions." -ForegroundColor Red
        
    } else {
        Write-Host ""
        Write-Host "Operation cancelled. No changes made." -ForegroundColor Yellow
    }
} else {
    Write-Host "✓ No tracked .env files found!" -ForegroundColor Green
    Write-Host "Your repository is already secure." -ForegroundColor Green
}

Write-Host ""
Write-Host "Step 4: Verifying .gitignore..." -ForegroundColor Yellow

# Test if .gitignore is working
$testResult = git check-ignore .env 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ .gitignore is properly configured for .env files" -ForegroundColor Green
} else {
    Write-Host "⚠️  .gitignore may not be working correctly" -ForegroundColor Yellow
    Write-Host "   Make sure .gitignore contains: .env" -ForegroundColor White
}

Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "  Cleanup Complete!" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "For more information, see:" -ForegroundColor White
Write-Host "  - SECURITY_SETUP_GUIDE.md" -ForegroundColor Cyan
Write-Host "  - .env.example (template for your .env file)" -ForegroundColor Cyan
Write-Host ""
