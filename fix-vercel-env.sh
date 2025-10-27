#!/bin/bash
# Fix Vercel Environment Variables
# This script adds all missing environment variables to Vercel

set -e  # Exit on error

# Read token from .env.local
VERCEL_TOKEN=$(grep VERCEL_TOKEN .env.local | cut -d'=' -f2)

if [ -z "$VERCEL_TOKEN" ]; then
  echo "❌ VERCEL_TOKEN not found in .env.local"
  exit 1
fi

echo "🔧 Fixing Vercel Environment Variables..."
echo ""

# Function to add env var to multiple environments
add_env_var() {
  local name=$1
  local value=$2
  local env=$3

  echo "Adding $name to $env..."
  echo "$value" | vercel env add "$name" "$env" --token "$VERCEL_TOKEN" --yes 2>&1 || echo "  (may already exist or error occurred)"
}

echo "📦 Adding Firebase Variables to Development and Preview..."

# Firebase API Key
add_env_var "REACT_APP_FIREBASE_API_KEY" "AIzaSyDbNCgZiXe4d_dFAXNMVclSD3AryoUUI70" "development"
add_env_var "REACT_APP_FIREBASE_API_KEY" "AIzaSyDbNCgZiXe4d_dFAXNMVclSD3AryoUUI70" "preview"

# Firebase Auth Domain
add_env_var "REACT_APP_FIREBASE_AUTH_DOMAIN" "babynames-app-9fa2a.firebaseapp.com" "development"
add_env_var "REACT_APP_FIREBASE_AUTH_DOMAIN" "babynames-app-9fa2a.firebaseapp.com" "preview"

# Firebase Storage Bucket
add_env_var "REACT_APP_FIREBASE_STORAGE_BUCKET" "babynames-app-9fa2a.firebasestorage.app" "development"
add_env_var "REACT_APP_FIREBASE_STORAGE_BUCKET" "babynames-app-9fa2a.firebasestorage.app" "preview"

# Firebase Messaging Sender ID
add_env_var "REACT_APP_FIREBASE_MESSAGING_SENDER_ID" "1093132372253" "development"
add_env_var "REACT_APP_FIREBASE_MESSAGING_SENDER_ID" "1093132372253" "preview"

# Firebase App ID
add_env_var "REACT_APP_FIREBASE_APP_ID" "1:1093132372253:web:0327c13610942d60f4f9f4" "development"
add_env_var "REACT_APP_FIREBASE_APP_ID" "1:1093132372253:web:0327c13610942d60f4f9f4" "preview"

echo ""
echo "🔑 Adding Missing Critical Variables to All Environments..."

# Enable Scraping
add_env_var "REACT_APP_ENABLE_SCRAPING" "true" "production"
add_env_var "REACT_APP_ENABLE_SCRAPING" "true" "preview"
add_env_var "REACT_APP_ENABLE_SCRAPING" "true" "development"

# Base URL for Production
add_env_var "REACT_APP_BASE_URL" "https://soulseedbaby.com" "production"

# OAuth Redirect URI
add_env_var "REACT_APP_OAUTH_REDIRECT_URI_PROD" "https://www.soulseedbaby.com" "production"

# Nano Banana API Key (if needed for image generation)
add_env_var "NANOBANANA_API_KEY" "sk_fa238a9d2b984eda923c2011c1659dd9" "production"
add_env_var "NANOBANANA_API_KEY" "sk_fa238a9d2b984eda923c2011c1659dd9" "preview"
add_env_var "NANOBANANA_API_KEY" "sk_fa238a9d2b984eda923c2011c1659dd9" "development"

# Google AI Studio Key
add_env_var "GOOGLE_AI_STUDIO_KEY" "sk_fa238a9d2b984eda923c2011c1659dd9" "production"
add_env_var "GOOGLE_AI_STUDIO_KEY" "sk_fa238a9d2b984eda923c2011c1659dd9" "preview"
add_env_var "GOOGLE_AI_STUDIO_KEY" "sk_fa238a9d2b984eda923c2011c1659dd9" "development"

echo ""
echo "✅ Environment variables updated!"
echo ""
echo "📋 To verify, run: vercel env ls --token $VERCEL_TOKEN"
