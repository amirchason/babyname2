#!/bin/bash
# Fix Vercel Environment Variables v2
# Adds missing vars using proper interactive handling

set -e

VERCEL_TOKEN=$(grep VERCEL_TOKEN .env.local | cut -d'=' -f2)

echo "🔧 Adding Missing Vercel Environment Variables..."
echo ""

# Add Firebase vars to Development
echo "📦 Firebase to Development..."
echo "AIzaSyDbNCgZiXe4d_dFAXNMVclSD3AryoUUI70" | vercel env add REACT_APP_FIREBASE_API_KEY development --token "$VERCEL_TOKEN" 2>&1 | grep -v "Error" || true
echo "babynames-app-9fa2a.firebaseapp.com" | vercel env add REACT_APP_FIREBASE_AUTH_DOMAIN development --token "$VERCEL_TOKEN" 2>&1 | grep -v "Error" || true
echo "babynames-app-9fa2a.firebasestorage.app" | vercel env add REACT_APP_FIREBASE_STORAGE_BUCKET development --token "$VERCEL_TOKEN" 2>&1 | grep -v "Error" || true
echo "1093132372253" | vercel env add REACT_APP_FIREBASE_MESSAGING_SENDER_ID development --token "$VERCEL_TOKEN" 2>&1 | grep -v "Error" || true
echo "1:1093132372253:web:0327c13610942d60f4f9f4" | vercel env add REACT_APP_FIREBASE_APP_ID development --token "$VERCEL_TOKEN" 2>&1 | grep -v "Error" || true

# Add Firebase vars to Preview
echo "📦 Firebase to Preview..."
echo "AIzaSyDbNCgZiXe4d_dFAXNMVclSD3AryoUUI70" | vercel env add REACT_APP_FIREBASE_API_KEY preview --token "$VERCEL_TOKEN" 2>&1 | grep -v "Error" || true
echo "babynames-app-9fa2a.firebaseapp.com" | vercel env add REACT_APP_FIREBASE_AUTH_DOMAIN preview --token "$VERCEL_TOKEN" 2>&1 | grep -v "Error" || true
echo "babynames-app-9fa2a.firebasestorage.app" | vercel env add REACT_APP_FIREBASE_STORAGE_BUCKET preview --token "$VERCEL_TOKEN" 2>&1 | grep -v "Error" || true
echo "1093132372253" | vercel env add REACT_APP_FIREBASE_MESSAGING_SENDER_ID preview --token "$VERCEL_TOKEN" 2>&1 | grep -v "Error" || true
echo "1:1093132372253:web:0327c13610942d60f4f9f4" | vercel env add REACT_APP_FIREBASE_APP_ID preview --token "$VERCEL_TOKEN" 2>&1 | grep -v "Error" || true

# Add other missing vars
echo "🔑 Other Critical Variables..."
echo "true" | vercel env add REACT_APP_ENABLE_SCRAPING production --token "$VERCEL_TOKEN" 2>&1 | grep -v "Error" || true
echo "true" | vercel env add REACT_APP_ENABLE_SCRAPING preview --token "$VERCEL_TOKEN" 2>&1 | grep -v "Error" || true
echo "true" | vercel env add REACT_APP_ENABLE_SCRAPING development --token "$VERCEL_TOKEN" 2>&1 | grep -v "Error" || true

echo "https://soulseedbaby.com" | vercel env add REACT_APP_BASE_URL production --token "$VERCEL_TOKEN" 2>&1 | grep -v "Error" || true
echo "https://www.soulseedbaby.com" | vercel env add REACT_APP_OAUTH_REDIRECT_URI_PROD production --token "$VERCEL_TOKEN" 2>&1 | grep -v "Error" || true

echo ""
echo "✅ Done! Verifying..."
vercel env ls --token "$VERCEL_TOKEN" | head -70
