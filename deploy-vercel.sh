#!/bin/bash
# Vercel deployment script for SoulSeed
# Usage: ./deploy-vercel.sh

set -e

echo "🚀 Building for Vercel..."
vercel build --prod --token=AjtiZq6gyZc9lbAXwpTx2c7b --yes

echo "📦 Deploying prebuilt to production..."
vercel deploy --prebuilt --prod --token=AjtiZq6gyZc9lbAXwpTx2c7b --yes

echo "✅ Deployment complete!"
echo "Note: If soulseedbaby.com shows 404, the domain needs to be"
echo "configured in Vercel dashboard to point to this deployment."
