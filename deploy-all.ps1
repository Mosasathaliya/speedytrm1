# Speed of Mastery - Complete Deployment Script
Write-Host "🚀 Starting Speed of Mastery deployment..." -ForegroundColor Cyan

# Step 1: Deploy Worker
Write-Host "`n📦 Deploying Cloudflare Worker..." -ForegroundColor Yellow
npx wrangler deploy

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Worker deployment failed!" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Worker deployed successfully!" -ForegroundColor Green

# Step 2: Build Frontend
Write-Host "`n🔨 Building Next.js frontend..." -ForegroundColor Yellow

# Clean build directory
if (Test-Path .next) {
    Remove-Item -Path .next -Recurse -Force
}
if (Test-Path build) {
    Remove-Item -Path build -Recurse -Force
}

# Build the app
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Frontend build failed!" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Frontend built successfully!" -ForegroundColor Green

# Step 3: Deploy to Cloudflare Pages
Write-Host "`n🌐 Deploying to Cloudflare Pages..." -ForegroundColor Yellow
npx wrangler pages deploy build --project-name speed-of-mastery-app

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Pages deployment failed!" -ForegroundColor Red
    exit 1
}

Write-Host "`n✨ Deployment complete!" -ForegroundColor Green
Write-Host "`nYour app is now live at:" -ForegroundColor Cyan
Write-Host "Worker: https://speed-of-mastery-rag.speedofmastry.workers.dev" -ForegroundColor White
Write-Host "Pages: https://speed-of-mastery-app.pages.dev" -ForegroundColor White

# Create test user
Write-Host "`n👤 Creating test user Hassan..." -ForegroundColor Yellow
npx wrangler d1 execute speed-of-mastery-db --remote --file=init_test_user.sql

Write-Host "`n📝 Test User Credentials:" -ForegroundColor Cyan
Write-Host "ID: 2124994969" -ForegroundColor White
Write-Host "Password: 123456789" -ForegroundColor White
Write-Host "Name: Hassan" -ForegroundColor White
