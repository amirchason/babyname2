#!/bin/bash

# 🚨 Google OAuth Redirect URI Fix Script
# This script helps you fix the Google Cloud Console configuration

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔧 GOOGLE OAUTH REDIRECT URI FIX"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Opening Google Cloud Console..."
echo ""
echo "📍 Go to: Credentials page"
echo "🔍 Find: 1093132372253-a725n8gpe624usli0hnj3re1eicgi4o2"
echo "✏️  Edit: OAuth Client ID settings"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "ADD THESE TO 'Authorized redirect URIs':"
echo ""
echo "  1. https://soulseedbaby.com"
echo "  2. https://www.soulseedbaby.com"
echo "  3. http://localhost:3000"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "⚠️  IMPORTANT:"
echo "   • NO trailing slashes (no '/' at end)"
echo "   • NO /callback paths"
echo "   • Just the base URL"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Opening browser in 3 seconds..."
sleep 3

# Open Google Cloud Console credentials page
termux-open-url "https://console.cloud.google.com/apis/credentials?project=babynames-app-9fa2a"

echo ""
echo "✅ Browser opened!"
echo ""
echo "After you add the URIs and SAVE:"
echo "  1. Wait 5 minutes for Google to propagate changes"
echo "  2. Go to https://soulseedbaby.com"
echo "  3. Test Google login"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
