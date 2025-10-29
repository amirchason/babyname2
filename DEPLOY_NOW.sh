#!/bin/bash

echo "🚀 Deploying to Vercel..."
echo ""

# Method 1: Try with Vercel CLI
if command -v vercel &> /dev/null; then
    if vercel whoami &>/dev/null; then
        echo "✅ Vercel CLI authenticated"
        echo "Deploying to production..."
        vercel --prod --yes
        exit 0
    else
        echo "⚠️  Vercel CLI not authenticated"
        echo "Run: vercel login"
        echo ""
    fi
fi

# Method 2: GitHub push (triggers auto-deploy)
if [ -d .git ]; then
    echo "📦 Pushing to GitHub (will trigger Vercel auto-deploy)..."
    git push origin main || git push origin master
    echo ""
    echo "✅ Pushed to GitHub"
    echo "Vercel will auto-deploy in 1-2 minutes"
    echo ""
    echo "Monitor deployment at: https://vercel.com/dashboard"
    exit 0
fi

echo ""
echo "❌ Cannot auto-deploy"
echo "Please deploy manually via Vercel Dashboard"
