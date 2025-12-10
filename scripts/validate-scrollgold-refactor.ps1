# Validate ScrollCoin to ScrollGold Refactoring
# This script checks if any ScrollCoin references remain in the codebase

Write-Host "Validating ScrollCoin → ScrollGold Refactoring..." -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan

$excludeDirs = @('node_modules', 'dist', 'build', '.git', 'coverage', '.next')
$patterns = @('ScrollCoin', 'scrollCoin', 'scrollcoin', 'SCROLLCOIN', 'scroll-coin', 'scroll_coin')

$foundIssues = $false
$totalMatches = 0

function Should-Exclude {
    param($Path)
    foreach ($exclude in $excludeDirs) {
        if ($Path -like "*\$exclude\*" -or $Path -like "*/$exclude/*") {
            return $true
        }
    }
    # Exclude the refactoring scripts themselves
    if ($Path -like "*refactor*scrollgold*.ps1" -or $Path -like "*validate*scrollgold*.ps1") {
        return $true
    }
    return $false
}

Write-Host "`nSearching for remaining ScrollCoin references..." -ForegroundColor Yellow

foreach ($pattern in $patterns) {
    Write-Host "`nChecking pattern: $pattern" -ForegroundColor Cyan
    
    $files = Get-ChildItem -Path "." -File -Recurse -ErrorAction SilentlyContinue | 
        Where-Object { -not (Should-Exclude $_.FullName) }
    
    foreach ($file in $files) {
        try {
            $content = Get-Content $file.FullName -Raw -ErrorAction Stop
            if ($content -match [regex]::Escape($pattern)) {
                $matches = ([regex]::Matches($content, [regex]::Escape($pattern))).Count
                Write-Host "  [FOUND] $($file.FullName): $matches occurrence(s)" -ForegroundColor Red
                $foundIssues = $true
                $totalMatches += $matches
            }
        }
        catch {
            # Skip files that can't be read
        }
    }
}

Write-Host "`n================================================" -ForegroundColor Cyan

if ($foundIssues) {
    Write-Host "[WARNING] Found $totalMatches ScrollCoin reference(s) remaining" -ForegroundColor Yellow
    Write-Host "Review the files listed above and update manually if needed." -ForegroundColor Yellow
} else {
    Write-Host "[SUCCESS] No ScrollCoin references found!" -ForegroundColor Green
    Write-Host "The refactoring is complete." -ForegroundColor Green
}

Write-Host "`nNext Steps:" -ForegroundColor Cyan
Write-Host "  1. Review git diff to verify changes" -ForegroundColor White
Write-Host "  2. Update database schema if needed" -ForegroundColor White
Write-Host "  3. Run tests: npm test" -ForegroundColor White
Write-Host "  4. Build project: npm run build" -ForegroundColor White
Write-Host "  5. Commit: git add . && git commit -m 'refactor: ScrollCoin → ScrollGold complete'" -ForegroundColor White
