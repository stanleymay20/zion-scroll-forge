# Fix All Merge Conflicts Script (PowerShell)
# This script automatically resolves merge conflicts by keeping HEAD version

Write-Host "Starting merge conflict resolution..." -ForegroundColor Cyan

# Find all files with conflict markers
$conflictFiles = @()
Get-ChildItem -Recurse -File | Where-Object { 
    $_.DirectoryName -notmatch 'node_modules|dist|coverage|\.git|build' -and
    $_.Extension -notmatch '\.lock$|\.lockb$'
} | ForEach-Object {
    $content = Get-Content $_.FullName -Raw -ErrorAction SilentlyContinue
    if ($content -match '<<<<<<< HEAD') {
        $conflictFiles += $_.FullName
    }
}

if ($conflictFiles.Count -eq 0) {
    Write-Host "No merge conflict markers found!" -ForegroundColor Green
    exit 0
}

Write-Host "Found $($conflictFiles.Count) files with conflict markers. Resolving..." -ForegroundColor Yellow

foreach ($file in $conflictFiles) {
    Write-Host "Processing: $file" -ForegroundColor Gray
    
    try {
        $content = Get-Content $file -Raw
        
        # Remove conflict markers - keep HEAD version (everything between <<<<<<< HEAD and =======)
        # Remove everything between ======= and >>>>>>>
        $lines = $content -split "`r?`n"
        $newLines = @()
        $inConflict = $false
        $keepSection = $false
        
        foreach ($line in $lines) {
            if ($line -match '^<<<<<<< HEAD') {
                $inConflict = $true
                $keepSection = $true
                continue
            }
            if ($line -match '^=======') {
                $keepSection = $false
                continue
            }
            if ($line -match '^>>>>>>> ') {
                $inConflict = $false
                $keepSection = $false
                continue
            }
            
            if (-not $inConflict -or $keepSection) {
                $newLines += $line
            }
        }
        
        $newContent = $newLines -join "`r`n"
        Set-Content -Path $file -Value $newContent -NoNewline
        
        Write-Host "  Resolved: $file" -ForegroundColor Green
    }
    catch {
        Write-Host "  Error processing $file : $_" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "All merge conflicts resolved!" -ForegroundColor Green
