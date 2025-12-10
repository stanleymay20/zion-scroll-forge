# ScrollCoin to ScrollGold Refactoring Script
# This script performs a comprehensive, safe refactor across the entire codebase

Write-Host "Starting ScrollCoin to ScrollGold Refactor..." -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan

# Define replacement patterns
$replacements = @(
    @{ Pattern = 'ScrollCoin'; Replacement = 'ScrollGold'; Description = 'PascalCase' },
    @{ Pattern = 'scrollCoin'; Replacement = 'scrollGold'; Description = 'camelCase' },
    @{ Pattern = 'scrollcoin'; Replacement = 'scrollgold'; Description = 'lowercase' },
    @{ Pattern = 'SCROLLCOIN'; Replacement = 'SCROLLGOLD'; Description = 'UPPERCASE' },
    @{ Pattern = 'scroll-coin'; Replacement = 'scroll-gold'; Description = 'kebab-case' },
    @{ Pattern = 'scroll_coin'; Replacement = 'scroll_gold'; Description = 'snake_case' }
)

# File extensions to process
$extensions = @('*.ts', '*.tsx', '*.js', '*.jsx', '*.json', '*.md', '*.sql', '*.prisma', '*.yaml', '*.yml', '*.env*', '*.sol')

# Directories to exclude
$excludeDirs = @('node_modules', 'dist', 'build', '.git', 'coverage', '.next')

# Counter for tracking changes
$filesModified = 0
$totalReplacements = 0

# Function to check if path should be excluded
function Should-Exclude {
    param($Path)
    foreach ($exclude in $excludeDirs) {
        if ($Path -like "*\$exclude\*" -or $Path -like "*/$exclude/*") {
            return $true
        }
    }
    return $false
}

# Function to perform replacements in a file
function Update-File {
    param($FilePath)
    
    if (Should-Exclude $FilePath) {
        return
    }
    
    try {
        $content = Get-Content $FilePath -Raw -ErrorAction Stop
        $originalContent = $content
        $fileReplacements = 0
        
        foreach ($replacement in $replacements) {
            $pattern = $replacement.Pattern
            $newValue = $replacement.Replacement
            
            # Count occurrences before replacement
            $matches = ([regex]::Matches($content, [regex]::Escape($pattern))).Count
            
            if ($matches -gt 0) {
                $content = $content -replace [regex]::Escape($pattern), $newValue
                $fileReplacements += $matches
            }
        }
        
        if ($content -ne $originalContent) {
            Set-Content -Path $FilePath -Value $content -NoNewline
            $script:filesModified++
            $script:totalReplacements += $fileReplacements
            Write-Host "  [OK] Updated: $FilePath ($fileReplacements replacements)" -ForegroundColor Green
        }
    }
    catch {
        Write-Host "  [ERROR] Error processing $FilePath : $_" -ForegroundColor Red
    }
}

# Process all files
Write-Host "`nProcessing files..." -ForegroundColor Yellow

foreach ($ext in $extensions) {
    Write-Host "`nSearching for $ext files..." -ForegroundColor Cyan
    $files = Get-ChildItem -Path "." -Filter $ext -Recurse -File -ErrorAction SilentlyContinue
    
    foreach ($file in $files) {
        Update-File -FilePath $file.FullName
    }
}

# Rename directories
Write-Host "`nRenaming directories..." -ForegroundColor Yellow

$dirsToRename = Get-ChildItem -Path "." -Directory -Recurse -ErrorAction SilentlyContinue | 
    Where-Object { $_.Name -like "*scrollcoin*" -and -not (Should-Exclude $_.FullName) }

foreach ($dir in $dirsToRename) {
    $newName = $dir.Name -replace 'scrollcoin', 'scrollgold' -replace 'ScrollCoin', 'ScrollGold'
    $newPath = Join-Path $dir.Parent.FullName $newName
    
    try {
        Rename-Item -Path $dir.FullName -NewName $newName -ErrorAction Stop
        Write-Host "  [OK] Renamed directory: $($dir.Name) -> $newName" -ForegroundColor Green
        $script:filesModified++
    }
    catch {
        Write-Host "  [ERROR] Error renaming directory $($dir.Name): $_" -ForegroundColor Red
    }
}

# Rename files
Write-Host "`nRenaming files..." -ForegroundColor Yellow

$filesToRename = Get-ChildItem -Path "." -File -Recurse -ErrorAction SilentlyContinue | 
    Where-Object { $_.Name -like "*scrollcoin*" -and -not (Should-Exclude $_.FullName) }

foreach ($file in $filesToRename) {
    $newName = $file.Name -replace 'scrollcoin', 'scrollgold' -replace 'ScrollCoin', 'ScrollGold'
    $newPath = Join-Path $file.Directory.FullName $newName
    
    try {
        Rename-Item -Path $file.FullName -NewName $newName -ErrorAction Stop
        Write-Host "  [OK] Renamed file: $($file.Name) -> $newName" -ForegroundColor Green
        $script:filesModified++
    }
    catch {
        Write-Host "  [ERROR] Error renaming file $($file.Name): $_" -ForegroundColor Red
    }
}

# Summary
Write-Host "`n================================================" -ForegroundColor Cyan
Write-Host "[SUCCESS] Refactor Complete!" -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "Files Modified: $filesModified" -ForegroundColor White
Write-Host "Total Replacements: $totalReplacements" -ForegroundColor White
Write-Host "`nNext Steps:" -ForegroundColor Yellow
Write-Host "  1. Review changes: git diff" -ForegroundColor White
Write-Host "  2. Run tests: npm test" -ForegroundColor White
Write-Host "  3. Build project: npm run build" -ForegroundColor White
Write-Host "  4. Update database: npm run prisma:migrate" -ForegroundColor White
Write-Host "  5. Commit changes: git add . ; git commit -m 'refactor: ScrollCoin to ScrollGold'" -ForegroundColor White
Write-Host "`nScrollGold is ready to shine!" -ForegroundColor Cyan
