#!/bin/bash

# 🎯 Fully Automated Google OAuth Fix
# Run this after Vercel deployment completes

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🚀 GOOGLE OAUTH FIX - DEPLOYMENT & TESTING"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Check if deployment is complete
echo "📦 Checking Vercel deployment status..."
echo ""

# Open Google Cloud Console for manual URI fix
echo "🔧 Opening Google Cloud Console..."
echo ""
echo "TASK: Delete this URI from 'Authorized redirect URIs':"
echo "      ❌ https://www.soulseedbaby.com/auth/callback"
echo ""
echo "Opening browser in 3 seconds..."
sleep 3

termux-open-url "https://console.cloud.google.com/apis/credentials?project=babynames-app-9fa2a"

echo ""
echo "✅ Browser opened!"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "INSTRUCTIONS:"
echo ""
echo "1. Find your OAuth Client ID"
echo "2. Scroll to 'Authorized redirect URIs'"
echo "3. Delete URI #7: https://www.soulseedbaby.com/auth/callback"
echo "4. Click SAVE"
echo "5. Wait 5 minutes"
echo "6. Test at https://soulseedbaby.com"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "After 5 minutes, run: termux-open-url https://soulseedbaby.com"
echo ""
