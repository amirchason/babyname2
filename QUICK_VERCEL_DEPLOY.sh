#!/bin/bash

echo "🚀 QUICK VERCEL DEPLOYMENT (Bypasses GitHub)"
echo "============================================"
echo ""

# Check if vercel CLI exists
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI not installed"
    echo "Install with: npm install -g vercel"
    exit 1
fi

# Check authentication
if ! vercel whoami &>/dev/null; then
    echo "⚠️  Not logged into Vercel"
    echo ""
    echo "STEP 1: Login to Vercel (opens browser)"
    echo "Run this command:"
    echo ""
    echo "  vercel login"
    echo ""
    echo "Then run this script again"
    exit 1
fi

echo "✅ Authenticated with Vercel"
echo ""

# Deploy to production with environment variables from vercel.json
echo "📦 Deploying to production..."
echo ""
echo "This will:"
echo "  1. Upload your build folder"
echo "  2. Use environment variables from vercel.json"
echo "  3. Deploy to soulseedbaby.com"
echo ""

vercel --prod --yes

echo ""
echo "✅ DEPLOYMENT COMPLETE!"
echo ""
echo "Next step: Update Google OAuth (see MANUAL_STEPS_NEEDED.txt)"
