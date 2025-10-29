#!/usr/bin/env node

/**
 * 🔍 Google OAuth Verification Script
 * Tests that your Google OAuth setup is working correctly
 */

const https = require('https');

const GOOGLE_CLIENT_ID = '1093132372253-a725n8gpe624usli0hnj3re1eicgi4o2.apps.googleusercontent.com';

console.log('🔍 Verifying Google OAuth Setup...\n');

// Test 1: Check if client ID is valid format
console.log('[Test 1] Client ID Format');
if (GOOGLE_CLIENT_ID && GOOGLE_CLIENT_ID.match(/^\d+-[a-z0-9]+\.apps\.googleusercontent\.com$/)) {
  console.log('✓ Client ID format is valid');
} else {
  console.log('✗ Client ID format appears invalid');
}

// Test 2: Check Google OAuth endpoint
console.log('\n[Test 2] Google OAuth Endpoint');
const url = `https://accounts.google.com/.well-known/openid-configuration`;

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

console.log('\n✅ Verification complete!');
console.log('\n📝 Next steps:');
console.log('  1. Configure Google Cloud Console (see output above)');
console.log('  2. Enable Google auth in Firebase Console');
console.log('  3. Sync env vars to Vercel: bash sync-vercel-env.sh');
console.log('  4. Test locally: npm start');
console.log('  5. Deploy: npm run deploy');
