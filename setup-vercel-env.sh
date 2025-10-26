#!/bin/bash
# Setup Vercel Environment Variables
# This script adds all necessary environment variables to Vercel

set -e

# Load VERCEL_TOKEN from .env.local
if [ -f .env.local ]; then
  export $(grep VERCEL_TOKEN .env.local | xargs)
fi

TOKEN="$VERCEL_TOKEN"

echo "🔧 Setting up Vercel environment variables..."

# Function to add environment variable
add_env() {
  local key=$1
  local value=$2
  local env_type=${3:-"production preview development"}

  echo "Adding $key..."
  echo "$value" | vercel env add "$key" $env_type --token=$TOKEN --yes || echo "⚠️  $key already exists or failed"
}

# Google Services
add_env "REACT_APP_GOOGLE_API_KEY" "AIzaSyALzy3qXMyXPtLl7pUuCDo_eE5X89u3dpA"
add_env "REACT_APP_GEMINI_API_KEY" "AIzaSyALzy3qXMyXPtLl7pUuCDo_eE5X89u3dpA"
add_env "REACT_APP_YOUTUBE_API_KEY" "AIzaSyALzy3qXMyXPtLl7pUuCDo_eE5X89u3dpA"

# Google OAuth
add_env "REACT_APP_GOOGLE_CLIENT_ID" "1093132372253-a725n8gpe624usli0hnj3re1eicgi4o2.apps.googleusercontent.com"
add_env "REACT_APP_GOOGLE_CLIENT_SECRET" "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"

# Firebase
add_env "REACT_APP_FIREBASE_API_KEY" "AIzaSyDbNCgZiXe4d_dFAXNMVclSD3AryoUUI70"
add_env "REACT_APP_FIREBASE_AUTH_DOMAIN" "babynames-app-9fa2a.firebaseapp.com"
add_env "REACT_APP_FIREBASE_PROJECT_ID" "babynames-app-9fa2a"
add_env "REACT_APP_FIREBASE_STORAGE_BUCKET" "babynames-app-9fa2a.firebasestorage.app"
add_env "REACT_APP_FIREBASE_MESSAGING_SENDER_ID" "1093132372253"
add_env "REACT_APP_FIREBASE_APP_ID" "1:1093132372253:web:0327c13610942d60f4f9f4"

# Feature Flags
add_env "REACT_APP_ENABLE_AI_CHAT" "true"
add_env "REACT_APP_ENABLE_FAVORITES" "true"
add_env "REACT_APP_ENABLE_BLOG" "false"

# Theme
add_env "REACT_APP_PRIMARY_COLOR" "#D8B2F2"
add_env "REACT_APP_SECONDARY_COLOR" "#FFB3D9"
add_env "REACT_APP_ACCENT_COLOR" "#B3D9FF"

# Deployment
add_env "PUBLIC_URL" "/"
add_env "NODE_ENV" "production" "production"

echo "✅ Environment variables setup complete!"
echo ""
echo "Run this to rebuild and deploy:"
echo "  vercel build --prod --token=$TOKEN --yes"
echo "  vercel deploy --prebuilt --prod --token=$TOKEN --yes"
