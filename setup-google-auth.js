#!/usr/bin/env node

/**
 * 🔐 Google OAuth Setup Automation Script
 *
 * This script automates the Google OAuth setup process for SoulSeed Baby Names app
 * Run: node setup-google-auth.js
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// ANSI color codes for pretty output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m'
};

const log = {
  title: (msg) => console.log(`\n${colors.bright}${colors.cyan}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`),
  section: (msg) => console.log(`\n${colors.bright}${colors.blue}▶ ${msg}${colors.reset}`),
  success: (msg) => console.log(`${colors.green}✓${colors.reset} ${msg}`),
  warning: (msg) => console.log(`${colors.yellow}⚠${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}✗${colors.reset} ${msg}`),
  info: (msg) => console.log(`${colors.cyan}ℹ${colors.reset} ${msg}`),
  step: (num, msg) => console.log(`\n${colors.bright}${colors.magenta}[Step ${num}]${colors.reset} ${msg}`),
  command: (cmd) => console.log(`${colors.yellow}$ ${cmd}${colors.reset}`),
  link: (url) => console.log(`${colors.blue}${url}${colors.reset}`)
};

// Load environment variables
function loadEnvVars() {
  const envPath = path.join(__dirname, '.env');

  if (!fs.existsSync(envPath)) {
    log.error('.env file not found!');
    process.exit(1);
  }

  const envContent = fs.readFileSync(envPath, 'utf8');
  const envVars = {};

  envContent.split('\n').forEach(line => {
    const match = line.match(/^([^#=]+)=(.*)$/);
    if (match) {
      const key = match[1].trim();
      const value = match[2].trim();
      envVars[key] = value;
    }
  });

  return envVars;
}

// Check if command exists
function commandExists(cmd) {
  try {
    execSync(`which ${cmd}`, { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

// Main setup function
async function main() {
  log.title();
  console.log(`${colors.bright}${colors.cyan}🔐 Google OAuth Setup Automation${colors.reset}`);
  log.title();

  // Step 1: Check environment variables
  log.step(1, 'Checking Environment Variables');

  const envVars = loadEnvVars();

  const requiredVars = {
    'REACT_APP_GOOGLE_CLIENT_ID': 'Google OAuth Client ID',
    'REACT_APP_GOOGLE_CLIENT_SECRET': 'Google OAuth Client Secret',
    'REACT_APP_FIREBASE_API_KEY': 'Firebase API Key',
    'REACT_APP_FIREBASE_AUTH_DOMAIN': 'Firebase Auth Domain',
    'REACT_APP_FIREBASE_PROJECT_ID': 'Firebase Project ID',
    'REACT_APP_FIREBASE_STORAGE_BUCKET': 'Firebase Storage Bucket',
    'REACT_APP_FIREBASE_MESSAGING_SENDER_ID': 'Firebase Messaging Sender ID',
    'REACT_APP_FIREBASE_APP_ID': 'Firebase App ID'
  };

  let allConfigured = true;

  Object.entries(requiredVars).forEach(([key, description]) => {
    const value = envVars[key];
    if (!value || value === 'YOUR_GOOGLE_CLIENT_ID_HERE' || value === 'YOUR_API_KEY_HERE') {
      log.error(`${description} not configured`);
      allConfigured = false;
    } else {
      log.success(`${description} configured`);
    }
  });

  if (!allConfigured) {
    log.error('Please configure all required environment variables in .env file');
    process.exit(1);
  }

  // Step 2: Display current configuration
  log.step(2, 'Current Configuration Summary');

  console.log(`\n${colors.bright}Google OAuth:${colors.reset}`);
  console.log(`  Client ID: ${envVars.REACT_APP_GOOGLE_CLIENT_ID}`);
  console.log(`  Client Secret: ${envVars.REACT_APP_GOOGLE_CLIENT_SECRET?.substring(0, 20)}...`);

  console.log(`\n${colors.bright}Firebase Project:${colors.reset}`);
  console.log(`  Project ID: ${envVars.REACT_APP_FIREBASE_PROJECT_ID}`);
  console.log(`  Auth Domain: ${envVars.REACT_APP_FIREBASE_AUTH_DOMAIN}`);

  // Step 3: Google Cloud Console Setup
  log.step(3, 'Google Cloud Console Configuration');

  console.log(`\n${colors.bright}You need to configure the following in Google Cloud Console:${colors.reset}\n`);

  log.info('Go to Google Cloud Console:');
  log.link('https://console.cloud.google.com/apis/credentials');

  console.log(`\n${colors.bright}Add these Authorized JavaScript origins:${colors.reset}`);
  const origins = [
    'http://localhost:3000',
    'https://soulseedbaby.com',
    'https://www.soulseedbaby.com',
    'https://babyname2-votingsystem.vercel.app'
  ];
  origins.forEach(origin => console.log(`  • ${origin}`));

  console.log(`\n${colors.bright}Add these Authorized redirect URIs:${colors.reset}`);
  origins.forEach(origin => console.log(`  • ${origin}`));

  console.log(`\n${colors.yellow}📋 Copy the above URLs to your OAuth client configuration${colors.reset}`);

  // Step 4: Firebase Console Setup
  log.step(4, 'Firebase Console Configuration');

  console.log(`\n${colors.bright}Enable Google Sign-In in Firebase:${colors.reset}\n`);

  log.info('Go to Firebase Console:');
  log.link(`https://console.firebase.google.com/project/${envVars.REACT_APP_FIREBASE_PROJECT_ID}/authentication/providers`);

  console.log(`\n${colors.bright}Steps:${colors.reset}`);
  console.log('  1. Click on "Google" provider');
  console.log('  2. Toggle "Enable"');
  console.log('  3. Add your support email');
  console.log('  4. Click "Save"');

  // Step 5: Vercel Environment Variables
  log.step(5, 'Sync Environment Variables to Vercel');

  const vercelInstalled = commandExists('vercel');

  if (!vercelInstalled) {
    log.warning('Vercel CLI not installed');
    console.log('\nInstall Vercel CLI:');
    log.command('npm install -g vercel');
  } else {
    log.success('Vercel CLI installed');
  }

  console.log(`\n${colors.bright}Option A: Automatic Sync (Vercel CLI)${colors.reset}\n`);

  const vercelCommands = [
    'vercel login',
    'vercel link',
    ...Object.entries(requiredVars).map(([key]) =>
      `vercel env add ${key} production`
    )
  ];

  console.log('Run these commands:');
  vercelCommands.forEach(cmd => log.command(cmd));

  console.log(`\n${colors.bright}Option B: Manual Sync (Vercel Dashboard)${colors.reset}\n`);

  log.info('Go to Vercel Dashboard:');
  log.link('https://vercel.com/dashboard');
  console.log('\n  1. Select your project');
  console.log('  2. Go to Settings → Environment Variables');
  console.log('  3. Add each variable from .env file');

  // Step 6: Generate Vercel env script
  log.step(6, 'Creating Automated Vercel Sync Script');

  const syncScriptPath = path.join(__dirname, 'sync-vercel-env.sh');
  let syncScript = `#!/bin/bash
# Auto-generated script to sync environment variables to Vercel
# Run: bash sync-vercel-env.sh

echo "🚀 Syncing environment variables to Vercel..."
echo ""

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI not found. Installing..."
    npm install -g vercel
fi

# Login to Vercel
echo "📝 Logging into Vercel..."
vercel login

# Link project
echo "🔗 Linking project..."
vercel link

# Add environment variables
echo "⚙️  Adding environment variables..."
`;

  Object.entries(requiredVars).forEach(([key]) => {
    const value = envVars[key];
    syncScript += `\necho "${value}" | vercel env add ${key} production --force`;
  });

  syncScript += `

echo ""
echo "✅ Environment variables synced!"
echo "🚀 Deploy your app: npm run deploy"
`;

  fs.writeFileSync(syncScriptPath, syncScript);
  fs.chmodSync(syncScriptPath, '755');

  log.success('Created sync-vercel-env.sh');
  log.info('Run: bash sync-vercel-env.sh');

  // Step 7: Testing checklist
  log.step(7, 'Testing Checklist');

  console.log(`\n${colors.bright}Local Testing:${colors.reset}`);
  console.log('  1. npm start');
  console.log('  2. Open http://localhost:3000');
  console.log('  3. Click "Sign in with Google"');
  console.log('  4. Complete login flow');
  console.log('  5. Verify profile picture appears');

  console.log(`\n${colors.bright}Production Testing:${colors.reset}`);
  console.log('  1. npm run deploy');
  console.log('  2. Open https://soulseedbaby.com');
  console.log('  3. Test Google login');
  console.log('  4. Test favorites sync');

  // Step 8: Verification script
  log.step(8, 'Creating Verification Script');

  const verifyScriptPath = path.join(__dirname, 'verify-google-auth.js');
  const verifyScript = `#!/usr/bin/env node

/**
 * 🔍 Google OAuth Verification Script
 * Tests that your Google OAuth setup is working correctly
 */

const https = require('https');

const GOOGLE_CLIENT_ID = '${envVars.REACT_APP_GOOGLE_CLIENT_ID}';

console.log('🔍 Verifying Google OAuth Setup...\\n');

// Test 1: Check if client ID is valid format
console.log('[Test 1] Client ID Format');
if (GOOGLE_CLIENT_ID && GOOGLE_CLIENT_ID.match(/^\\d+-[a-z0-9]+\\.apps\\.googleusercontent\\.com$/)) {
  console.log('✓ Client ID format is valid');
} else {
  console.log('✗ Client ID format appears invalid');
}

// Test 2: Check Google OAuth endpoint
console.log('\\n[Test 2] Google OAuth Endpoint');
const url = \`https://accounts.google.com/.well-known/openid-configuration\`;

https.get(url, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    if (res.statusCode === 200) {
      console.log('✓ Google OAuth endpoint is reachable');
      const config = JSON.parse(data);
      console.log('  Authorization endpoint:', config.authorization_endpoint);
      console.log('  Token endpoint:', config.token_endpoint);
    } else {
      console.log('✗ Google OAuth endpoint returned error:', res.statusCode);
    }
  });
}).on('error', (err) => {
  console.log('✗ Error reaching Google OAuth endpoint:', err.message);
});

console.log('\\n✅ Verification complete!');
console.log('\\n📝 Next steps:');
console.log('  1. Configure Google Cloud Console (see output above)');
console.log('  2. Enable Google auth in Firebase Console');
console.log('  3. Sync env vars to Vercel: bash sync-vercel-env.sh');
console.log('  4. Test locally: npm start');
console.log('  5. Deploy: npm run deploy');
`;

  fs.writeFileSync(verifyScriptPath, verifyScript);
  fs.chmodSync(verifyScriptPath, '755');

  log.success('Created verify-google-auth.js');
  log.info('Run: node verify-google-auth.js');

  // Final summary
  log.title();
  console.log(`\n${colors.bright}${colors.green}✨ Setup Scripts Created!${colors.reset}\n`);

  console.log(`${colors.bright}Quick Start:${colors.reset}`);
  console.log(`  1. ${colors.cyan}node verify-google-auth.js${colors.reset}     - Verify configuration`);
  console.log(`  2. ${colors.cyan}bash sync-vercel-env.sh${colors.reset}       - Sync to Vercel`);
  console.log(`  3. ${colors.cyan}npm start${colors.reset}                     - Test locally`);
  console.log(`  4. ${colors.cyan}npm run deploy${colors.reset}                - Deploy to production`);

  console.log(`\n${colors.bright}Manual Steps Required:${colors.reset}`);
  console.log(`  • Configure Google Cloud Console (see Step 3 above)`);
  console.log(`  • Enable Google auth in Firebase (see Step 4 above)`);

  console.log(`\n${colors.bright}Documentation:${colors.reset}`);
  console.log(`  • GOOGLE_AUTH_SETUP.md - Detailed setup guide`);
  console.log(`  • .env - Environment variables`);

  log.title();
}

// Run the script
main().catch(err => {
  log.error(`Setup failed: ${err.message}`);
  process.exit(1);
});
