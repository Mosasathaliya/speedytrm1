@echo off
echo ========================================
echo   SPEED OF MASTERY - DEPLOYMENT SCRIPT
echo ========================================
echo.

echo 🚀 Starting deployment process...
echo.

echo 📋 Step 1: Installing dependencies...
call npm install

echo.
echo 🏗️ Step 2: Building Next.js application...
call npm run build

echo.
echo ⚡ Step 3: Deploying Cloudflare Worker...
call npx wrangler deploy --env production

echo.
echo 📊 Step 4: Creating database...
call npx wrangler d1 create speed-of-mastery-db

echo.
echo 🗄️ Step 5: Applying database schema...
call npx wrangler d1 execute speed-of-mastery-db --file=./schema.sql

echo.
echo 📦 Step 6: Creating R2 bucket...
call npx wrangler r2 bucket create speed-of-mastery-lessons

echo.
echo 🔍 Step 7: Creating Vectorize index...
call npx wrangler vectorize create speed-of-mastery-lessons --dimensions=768

echo.
echo ✅ DEPLOYMENT COMPLETED!
echo.
echo 🌐 Your application is now live!
echo 📱 Worker URL: Check Cloudflare Dashboard
echo 🖥️ Frontend: Upload to Cloudflare Pages
echo.
echo 🎉 Speed of Mastery is ready for users!
echo.
pause
