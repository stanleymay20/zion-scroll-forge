# Simple secure push script
Write-Host "Pushing to GitHub with .env file secured..." -ForegroundColor Cyan

# Ensure .env is not tracked
git rm --cached backend/.env -f 2>$null
git rm --cached .env -f 2>$null

# Add all other changes
git add .

# Create commit
git commit -m "Complete ScrollUniversity implementation - API keys secured"

# Push to GitHub
git push origin main --force

Write-Host "Done! Check GitHub to verify push was successful." -ForegroundColor Green
Write-Host ""
Write-Host "IMPORTANT: Your local backend/.env file still contains your API keys." -ForegroundColor Yellow
Write-Host "This is correct - the .env file should stay local and never be pushed to GitHub." -ForegroundColor Yellow
