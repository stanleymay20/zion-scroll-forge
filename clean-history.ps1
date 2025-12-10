# Git History Cleanup
Write-Host "Git History Cleanup Starting..." -ForegroundColor Yellow

$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
git branch "backup-$timestamp"
Write-Host "Backup created: backup-$timestamp" -ForegroundColor Green

Write-Host "Removing .env files from history..." -ForegroundColor Yellow
git filter-branch --force --index-filter "git rm --cached --ignore-unmatch .env backend/.env" --prune-empty --tag-name-filter cat -- --all

Write-Host "Cleaning up..." -ForegroundColor Yellow
git for-each-ref --format="delete %(refname)" refs/original | git update-ref --stdin
git reflog expire --expire=now --all
git gc --prune=now --aggressive

Write-Host "Done! Now rotate your API keys and force push." -ForegroundColor Green
.   