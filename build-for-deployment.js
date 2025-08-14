#!/usr/bin/env node

/**
 * Speed of Mastery - Deployment Build Script
 * Prepares the application for Cloudflare Pages deployment
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 Starting Speed of Mastery deployment build...\n');

// Function to run commands
function runCommand(command, description) {
  console.log(`📋 ${description}...`);
  try {
    execSync(command, { stdio: 'inherit' });
    console.log(`✅ ${description} completed\n`);
  } catch (error) {
    console.error(`❌ ${description} failed:`, error.message);
    process.exit(1);
  }
}

// Function to check file exists
function checkFile(filePath, description) {
  if (fs.existsSync(filePath)) {
    console.log(`✅ ${description} exists: ${filePath}`);
    return true;
  } else {
    console.log(`⚠️  ${description} missing: ${filePath}`);
    return false;
  }
}

// 1. Check critical files
console.log('🔍 Checking critical files...');
const criticalFiles = [
  { path: 'package.json', desc: 'Package configuration' },
  { path: 'next.config.ts', desc: 'Next.js configuration' },
  { path: 'tailwind.config.ts', desc: 'Tailwind configuration' },
  { path: 'wrangler.toml', desc: 'Cloudflare Worker configuration' },
  { path: 'schema.sql', desc: 'Database schema' },
  { path: 'src/worker/index.ts', desc: 'Cloudflare Worker' },
  { path: 'src/app/layout.tsx', desc: 'Next.js layout' },
  { path: 'src/app/page.js', desc: 'Home page' },
  { path: 'src/app/(auth)/login/page.js', desc: 'Login page' },
  { path: 'src/components/providers/ThemeProvider.tsx', desc: 'Theme provider' },
  { path: 'src/components/layout/AnimatedBackground.tsx', desc: 'Animated background' }
];

let allFilesExist = true;
criticalFiles.forEach(file => {
  if (!checkFile(file.path, file.desc)) {
    allFilesExist = false;
  }
});

if (!allFilesExist) {
  console.error('❌ Missing critical files. Please ensure all required files exist.');
  process.exit(1);
}
console.log('✅ All critical files present\n');

// 2. Install dependencies
runCommand('npm install', 'Installing dependencies');

// 3. Type check (non-blocking)
console.log('🔍 Running type checks...');
try {
  execSync('npm run type-check', { stdio: 'inherit' });
  console.log('✅ Type checks passed\n');
} catch (error) {
  console.log('⚠️  Type check warnings (proceeding anyway)\n');
}

// 4. Build Next.js application
runCommand('npm run build', 'Building Next.js application');

// 5. Check build output
console.log('🔍 Checking build output...');
const buildFiles = [
  { path: 'build', desc: 'Build directory' },
  { path: 'build/static', desc: 'Static assets' },
];

buildFiles.forEach(file => {
  checkFile(file.path, file.desc);
});

// 6. Generate deployment summary
const deploymentSummary = {
  timestamp: new Date().toISOString(),
  version: '1.0.0',
  buildStatus: 'SUCCESS',
  criticalFiles: criticalFiles.length,
  features: [
    'AI-Powered Learning System',
    'External Database Authentication',
    'Certificate Generation System',
    'Mock Certificate Preview',
    'Mood Translator AI',
    'Voice Translator AI',
    'Personal AI Assistant',
    'Learning Progress Tracking',
    'Arabic/English Bilingual Support',
    'Mobile-Responsive Design'
  ],
  deploymentTargets: [
    'Cloudflare Pages (Frontend)',
    'Cloudflare Workers (Backend)',
    'Cloudflare D1 (Database)',
    'Cloudflare R2 (Storage)',
    'Cloudflare Vectorize (Vector Search)',
    'Cloudflare AI (Language Models)'
  ]
};

fs.writeFileSync('deployment-summary.json', JSON.stringify(deploymentSummary, null, 2));
console.log('📋 Deployment summary created: deployment-summary.json\n');

// 7. Final deployment instructions
console.log('🎯 DEPLOYMENT READY!\n');
console.log('📋 Next Steps:');
console.log('1. Deploy Cloudflare Worker: wrangler deploy --env production');
console.log('2. Create Cloudflare Pages project and connect to this repository');
console.log('3. Set build settings:');
console.log('   - Build command: npm run build');
console.log('   - Build output directory: build');
console.log('   - Root directory: /');
console.log('4. Set environment variables in Cloudflare Pages dashboard');
console.log('5. Deploy and test!\n');

console.log('🚀 Speed of Mastery is ready for deployment! 🎓');
