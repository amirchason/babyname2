#!/bin/bash

# 🚀 Automated Vercel Google Auth Fix
# This script opens all required pages for you

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔧 VERCEL GOOGLE AUTH FIX"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📋 Opening configuration pages..."
echo ""

# Step 1: Google Cloud Console
echo "🔹 Step 1: Google Cloud Console (OAuth Settings)"
echo "   → Add these domains to BOTH fields:"
echo "     • https://soulseedbaby.com"
echo "     • https://www.soulseedbaby.com"
echo "     • https://babyname2-votingsystem.vercel.app"
echo ""
termux-open-url "https://console.cloud.google.com/apis/credentials"
sleep 2

# Step 2: Firebase Console
echo "🔹 Step 2: Firebase Console (Authorized Domains)"
echo "   → Add these domains:"
echo "     • soulseedbaby.com"
echo "     • www.soulseedbaby.com"
echo "     • babyname2-votingsystem.vercel.app"
echo ""
termux-open-url "https://console.firebase.google.com/project/babynames-app-9fa2a/authentication/settings"
sleep 2

# Step 3: Vercel Dashboard
echo "🔹 Step 3: Vercel Dashboard (Verify Env Vars)"
echo "   → Check environment variables exist"
echo ""
termux-open-url "https://vercel.com/dashboard"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ All pages opened!"
echo ""
echo "📝 After completing the 3 steps above:"
echo "   1. Deploy: npm run deploy"
echo "   2. Test: https://soulseedbaby.com"
echo ""
echo "📚 Full guide: FIX_VERCEL_GOOGLE_AUTH.md"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
