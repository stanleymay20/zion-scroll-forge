# Fix AIGatewayService Import Script
# Changes default imports to named imports for AIGatewayService

$servicesPath = "src"
$files = Get-ChildItem -Path $servicesPath -Filter "*.ts" -Recurse

$fixedCount = 0

foreach ($file in $files) {
    try {
        $content = Get-Content -Path $file.FullName -Raw
        
        # Check if file has incorrect import
        if ($content -match "import AIGatewayService from") {
            Write-Host "Fixing: $($file.Name)" -ForegroundColor Yellow
            
            # Replace default import with named import
            $content = $content -replace "import AIGatewayService from './AIGatewayService'", "import { AIGatewayService } from './AIGatewayService'"
            $content = $content -replace "import AIGatewayService from '../AIGatewayService'", "import { AIGatewayService } from '../AIGatewayService'"
            $content = $content -replace "import AIGatewayService from '../../AIGatewayService'", "import { AIGatewayService } from '../../AIGatewayService'"
            
            # Write back to file
            Set-Content -Path $file.FullName -Value $content -NoNewline
            
            $fixedCount++
            Write-Host "  Fixed successfully" -ForegroundColor Green
        }
        
        # Also fix logger imports
        if ($content -match "import logger from '../utils/logger'") {
            $content = Get-Content -Path $file.FullName -Raw
            $content = $content -replace "import logger from '../utils/logger'", "import { logger } from '../utils/logger'"
            $content = $content -replace "import logger from '../../utils/logger'", "import { logger } from '../../utils/logger'"
            $content = $content -replace "import logger from '../../../utils/logger'", "import { logger } from '../../../utils/logger'"
            Set-Content -Path $file.FullName -Value $content -NoNewline
        }
    }
    catch {
        Write-Host "Error processing $($file.Name): $_" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "========================================"  -ForegroundColor Cyan
Write-Host "Import Fix Complete!" -ForegroundColor Cyan
Write-Host "Files Fixed: $fixedCount" -ForegroundColor Green
Write-Host "========================================"  -ForegroundColor Cyan
