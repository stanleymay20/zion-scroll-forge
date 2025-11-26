# ScrollUniversity - Remove Secrets from Git History
# WARNING: This script rewrites git history. Use with caution!

Write-Host "========================================" -ForegroundColor Red
Write-Host "Git History Secret Removal Tool" -ForegroundColor Red
Write-Host "========================================" -ForegroundColor Red
Write-Host ""
Write-Host "WARNING: This will rewrite git history!" -ForegroundColor Yellow
Write-Host "Only use this if secrets were accidentally committed." -ForegroundColor Yellow
Write-Host ""

$confirm = Read-Host "Type 'YES' to continue or anything else to cancel"
if ($confirm -ne "YES") {
    Write-Host "Operation cancelled" -ForegroundColor Yellow
    exit 0
}

Write-Host ""
Write-Host "Step 1: Creating backup branch..." -ForegroundColor Yellow
$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
git branch "backup-before-secret-removal-$timestamp"
Write-Host "✓ Backup created: backup-before-secret-removal-$timestamp" -ForegroundColor Green

Write-Host ""
Write-Host "Step 2: Removing .env files from all commits..." -ForegroundColor Yellow

# Remove .env files from git history
$filesToRemove = @(
    ".env",
    "backend/.env",
    ".env.local",
    "backend/.env.local",
    ".env.production",
    "backend/.env.production"
)

foreach ($file in $filesToRemove) {
    Write-Host "  Removing $file from history..." -ForegroundColor Gray
    git filter-branch --force --index-filter `
        "git rm --cached --ignore-unmatch $file" `
        --prune-empty --tag-name-filter cat -- --all 2>$null
}

Write-Host "✓ Files removed from history" -ForegroundColor Green

Write-Host ""
Write-Host "Step 3: Cleaning up..." -ForegroundColor Yellow
git for-each-ref --format='delete %(refname)' refs/original | git update-ref --stdin
git reflog expire --expire=now --all
git gc --prune=now --aggressive
Write-Host "✓ Cleanup complete" -ForegroundColor Green

Write-Host ""
Write-Host "Step 4: Verifying removal..." -ForegroundColor Yellow
$envInHistory = git log --all --full-history -- ".env" "backend/.env"
if ($envInHistory) {
    Write-Host "✗ WARNING: .env files may still be in history!" -ForegroundColor Red
} else {
    Write-Host "✓ .env files successfully removed from history" -ForegroundColor Green
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Next Steps:" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Force push to GitHub (this will overwrite remote history):" -ForegroundColor Yellow
Write-Host "   git push origin --force --all" -ForegroundColor White
Write-Host ""
Write-Host "2. If you have API keys that were exposed:" -ForegroundColor Yellow
Write-Host "   - Rotate ALL API keys immediately" -ForegroundColor Red
Write-Host "   - OpenAI: https://platform.openai.com/api-keys" -ForegroundColor White
Write-Host "   - OpenRouter: https://openrouter.ai/keys" -ForegroundColor White
Write-Host "   - DeepSeek: https://platform.deepseek.com/api_keys" -ForegroundColor White
Write-Host "   - Supabase: Project Settings > API" -ForegroundColor White
Write-Host ""
Write-Host "3. Notify team members to re-clone the repository" -ForegroundColor Yellow
Write-Host ""
Write-Host "Backup branch created: backup-before-secret-removal-$timestamp" -ForegroundColor Cyan
Write-Host "You can restore from backup if needed: git checkout backup-before-secret-removal-$timestamp" -ForegroundColor Gray
