# ScrollUniversity - Clean Git History
# Removes sensitive files from git history

Write-Host "========================================" -ForegroundColor Red
Write-Host "Git History Cleanup Tool" -ForegroundColor Red
Write-Host "========================================" -ForegroundColor Red
Write-Host ""
Write-Host "WARNING: This will rewrite git history!" -ForegroundColor Yellow
Write-Host ""

$confirm = Read-Host "Type 'YES' to continue"
if ($confirm -ne "YES") {
    Write-Host "Cancelled" -ForegroundColor Yellow
    exit 0
}

Write-Host ""
Write-Host "Creating backup branch..." -ForegroundColor Yellow
$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
git branch "backup-$timestamp"
Write-Host "Backup created: backup-$timestamp" -ForegroundColor Green

Write-Host ""
Write-Host "Removing .env files from history..." -ForegroundColor Yellow

# Use git filter-repo if available, otherwise filter-branch
$hasFilterRepo = Get-Command git-filter-repo -ErrorAction SilentlyContinue

if ($hasFilterRepo) {
    Write-Host "Using git-filter-repo (recommended)..." -ForegroundColor Cyan
    git filter-repo --invert-paths --path .env --path backend/.env --force
} else {
    Write-Host "Using git filter-branch..." -ForegroundColor Cyan
    git filter-branch --force --index-filter "git rm --cached --ignore-unmatch .env backend/.env" --prune-empty --tag-name-filter cat -- --all
    
    # Cleanup
    git for-each-ref --format="delete %(refname)" refs/original | git update-ref --stdin
    git reflog expire --expire=now --all
    git gc --prune=now --aggressive
}

Write-Host ""
Write-Host "✓ History cleaned!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Rotate ALL exposed API keys immediately" -ForegroundColor Yellow
Write-Host "2. Force push to GitHub" -ForegroundColor Yellow
Write-Host ""
