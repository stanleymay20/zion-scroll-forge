# Fix all TypeScript compilation errors

Write-Host "Fixing TypeScript compilation errors..." -ForegroundColor Cyan

# Fix LearningAnalyticsService - enrollment property
(Get-Content src/services/LearningAnalyticsService.ts) -replace 'prisma\.enrollment','prisma.courseEnrollment' | Set-Content src/services/LearningAnalyticsService.ts

# Fix TranslationService - logger import
(Get-Content src/services/TranslationService.ts) -replace 'import logger from','import { logger } from' | Set-Content src/services/TranslationService.ts

# Fix VideoProductionService - module include
$videoContent = Get-Content src/services/VideoProductionService.ts -Raw
$videoContent = $videoContent -replace "include: \{\s+module: \{","include: {`n          courseModule: {"
Set-Content src/services/VideoProductionService.ts -Value $videoContent

# Fix productionLogger - esModuleInterop
$tsconfig = Get-Content tsconfig.json | ConvertFrom-Json
if (-not $tsconfig.compilerOptions.esModuleInterop) {
    $tsconfig.compilerOptions | Add-Member -NotePropertyName esModuleInterop -NotePropertyValue $true -Force
    $tsconfig | ConvertTo-Json -Depth 10 | Set-Content tsconfig.json
}

Write-Host "Compilation errors fixed!" -ForegroundColor Green
