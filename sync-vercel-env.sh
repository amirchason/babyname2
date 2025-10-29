#!/bin/bash
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

echo "1093132372253-a725n8gpe624usli0hnj3re1eicgi4o2.apps.googleusercontent.com" | vercel env add REACT_APP_GOOGLE_CLIENT_ID production --force
echo "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" | vercel env add REACT_APP_GOOGLE_CLIENT_SECRET production --force
echo "AIzaSyDbNCgZiXe4d_dFAXNMVclSD3AryoUUI70" | vercel env add REACT_APP_FIREBASE_API_KEY production --force
echo "babynames-app-9fa2a.firebaseapp.com" | vercel env add REACT_APP_FIREBASE_AUTH_DOMAIN production --force
echo "babynames-app-9fa2a" | vercel env add REACT_APP_FIREBASE_PROJECT_ID production --force
echo "babynames-app-9fa2a.firebasestorage.app" | vercel env add REACT_APP_FIREBASE_STORAGE_BUCKET production --force
echo "1093132372253" | vercel env add REACT_APP_FIREBASE_MESSAGING_SENDER_ID production --force
echo "1:1093132372253:web:0327c13610942d60f4f9f4" | vercel env add REACT_APP_FIREBASE_APP_ID production --force

echo ""
echo "✅ Environment variables synced!"
echo "🚀 Deploy your app: npm run deploy"
