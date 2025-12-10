# Start test infrastructure script for Windows
param(
    [switch]$Clean = $false
)

Write-Host "🚀 Starting test infrastructure..." -ForegroundColor Green

# Check if Docker is running
try {
    docker info | Out-Null
} catch {
    Write-Host "❌ Docker is not running. Please start Docker first." -ForegroundColor Red
    exit 1
}

if ($Clean) {
    # Stop any existing test containers
    Write-Host "🧹 Cleaning up existing test containers..." -ForegroundColor Yellow
    docker-compose -f docker-compose.test.yml down -v
}

# Start test infrastructure
Write-Host "🐳 Starting Redis and PostgreSQL for testing..." -ForegroundColor Blue
docker-compose -f docker-compose.test.yml up -d

# Wait for services to be ready
Write-Host "⏳ Waiting for services to be ready..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

# Check Redis connection
Write-Host "🔍 Checking Redis connection..." -ForegroundColor Cyan
$redisReady = $false
$attempts = 0
while (-not $redisReady -and $attempts -lt 30) {
    try {
        docker-compose -f docker-compose.test.yml exec -T redis-test redis-cli ping | Out-Null
        $redisReady = $true
    } catch {
        Start-Sleep -Seconds 1
        $attempts++
    }
}

if (-not $redisReady) {
    Write-Host "❌ Redis failed to start" -ForegroundColor Red
    exit 1
}

# Check PostgreSQL connection
Write-Host "🔍 Checking PostgreSQL connection..." -ForegroundColor Cyan
$pgReady = $false
$attempts = 0
while (-not $pgReady -and $attempts -lt 30) {
    try {
        docker-compose -f docker-compose.test.yml exec -T postgres-test pg_isready -U test_user -d zion_scroll_test | Out-Null
        $pgReady = $true
    } catch {
        Start-Sleep -Seconds 1
        $attempts++
    }
}

if (-not $pgReady) {
    Write-Host "❌ PostgreSQL failed to start" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Test infrastructure is ready!" -ForegroundColor Green
Write-Host "📊 Redis available at: localhost:6380" -ForegroundColor Cyan
Write-Host "🐘 PostgreSQL available at: localhost:5433" -ForegroundColor Cyan
Write-Host ""
Write-Host "To run tests:" -ForegroundColor Yellow
Write-Host "  npm test"
Write-Host "  npm run test:property"
Write-Host ""
Write-Host "To stop test infrastructure:" -ForegroundColor Yellow
Write-Host "  docker-compose -f docker-compose.test.yml down -v"
