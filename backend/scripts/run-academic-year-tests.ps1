# Academic Year Test Suite
Write-Host "Academic Year Automation - Test Suite" -ForegroundColor Cyan
Write-Host "=" -NoNewline; Write-Host ("=" * 79)

$tests = 0
$passed = 0

Write-Host "`n1. Database Schema Validation..." -ForegroundColor Yellow
npx ts-node scripts/verify-academic-year-schema.ts
if ($LASTEXITCODE -eq 0) { $passed++; Write-Host "PASSED" -ForegroundColor Green } else { Write-Host "FAILED" -ForegroundColor Red }
$tests++

Write-Host "`n2. Property Tests..." -ForegroundColor Yellow
npm test -- --testPathPattern="academic-year.*property" --passWithNoTests
if ($LASTEXITCODE -eq 0) { $passed++; Write-Host "PASSED" -ForegroundColor Green } else { Write-Host "FAILED" -ForegroundColor Red }
$tests++

Write-Host "`n3. Integration Tests..." -ForegroundColor Yellow
npm test -- --testPathPattern="academic-year.*integration" --passWithNoTests
if ($LASTEXITCODE -eq 0) { $passed++; Write-Host "PASSED" -ForegroundColor Green } else { Write-Host "FAILED" -ForegroundColor Red }
$tests++

Write-Host "`nSummary: $passed/$tests tests passed" -ForegroundColor $(if ($passed -eq $tests) { "Green" } else { "Red" })
exit $(if ($passed -eq $tests) { 0 } else { 1 })
