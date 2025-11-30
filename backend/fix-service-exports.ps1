# Fix Service Exports Script
# Adds named exports to all services that only have default exports

$servicesPath = "src/services"
$files = Get-ChildItem -Path $servicesPath -Filter "*.ts" -Recurse | Where-Object { $_.Name -notmatch "\.test\.ts$" }

$fixedCount = 0
$errorCount = 0

foreach ($file in $files) {
    try {
        $content = Get-Content -Path $file.FullName -Raw
        
        # Check if file has export default class pattern
        if ($content -match "export default class (\w+)") {
            $className = $Matches[1]
            
            # Check if it already has named export
            $hasNamedExport = $content -match "export class $className"
            
            if (-not $hasNamedExport) {
                Write-Host "Fixing: $($file.Name) - Class: $className" -ForegroundColor Yellow
                
                # Replace export default class with export class
                $content = $content -replace "export default class $className", "export class $className"
                
                # Add default export at the end if not already there
                $hasDefaultAtEnd = $content -match "export default $className;"
                
                if (-not $hasDefaultAtEnd) {
                    $content = $content.TrimEnd()
                    $content += "`n`nexport default $className;`n"
                }
                
                # Write back to file
                Set-Content -Path $file.FullName -Value $content -NoNewline
                
                $fixedCount++
                Write-Host "  Fixed successfully" -ForegroundColor Green
            }
        }
    }
    catch {
        Write-Host "Error processing $($file.Name): $_" -ForegroundColor Red
        $errorCount++
    }
}

Write-Host ""
Write-Host "========================================"  -ForegroundColor Cyan
Write-Host "Export Fix Complete!" -ForegroundColor Cyan
Write-Host "Files Fixed: $fixedCount" -ForegroundColor Green

if ($errorCount -gt 0) {
    Write-Host "Errors: $errorCount" -ForegroundColor Red
} else {
    Write-Host "Errors: $errorCount" -ForegroundColor Green
}

Write-Host "========================================"  -ForegroundColor Cyan
