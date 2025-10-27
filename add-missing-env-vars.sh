#!/bin/bash
# Add missing Vercel environment variables

TOKEN="AjtiZq6gyZc9lbAXwpTx2c7b"

echo "🔧 Adding missing environment variables to Vercel..."

# YouTube API
echo "Adding REACT_APP_YOUTUBE_API_KEY..."
echo "AIzaSyALzy3qXMyXPtLl7pUuCDo_eE5X89u3dpA" | vercel env add REACT_APP_YOUTUBE_API_KEY production --token=$TOKEN 2>&1 | grep -v "What's the value"
echo "AIzaSyALzy3qXMyXPtLl7pUuCDo_eE5X89u3dpA" | vercel env add REACT_APP_YOUTUBE_API_KEY preview --token=$TOKEN 2>&1 | grep -v "What's the value"
echo "AIzaSyALzy3qXMyXPtLl7pUuCDo_eE5X89u3dpA" | vercel env add REACT_APP_YOUTUBE_API_KEY development --token=$TOKEN 2>&1 | grep -v "What's the value"

# Feature Flags
echo "Adding feature flags..."
echo "true" | vercel env add REACT_APP_ENABLE_AI_CHAT production --token=$TOKEN 2>&1 | grep -v "What's the value"
echo "true" | vercel env add REACT_APP_ENABLE_AI_CHAT preview --token=$TOKEN 2>&1 | grep -v "What's the value"
echo "true" | vercel env add REACT_APP_ENABLE_AI_CHAT development --token=$TOKEN 2>&1 | grep -v "What's the value"

echo "true" | vercel env add REACT_APP_ENABLE_FAVORITES production --token=$TOKEN 2>&1 | grep -v "What's the value"
echo "true" | vercel env add REACT_APP_ENABLE_FAVORITES preview --token=$TOKEN 2>&1 | grep -v "What's the value"
echo "true" | vercel env add REACT_APP_ENABLE_FAVORITES development --token=$TOKEN 2>&1 | grep -v "What's the value"

echo "false" | vercel env add REACT_APP_ENABLE_BLOG production --token=$TOKEN 2>&1 | grep -v "What's the value"
echo "false" | vercel env add REACT_APP_ENABLE_BLOG preview --token=$TOKEN 2>&1 | grep -v "What's the value"
echo "false" | vercel env add REACT_APP_ENABLE_BLOG development --token=$TOKEN 2>&1 | grep -v "What's the value"

# Theme Colors
echo "Adding theme colors..."
echo "#D8B2F2" | vercel env add REACT_APP_PRIMARY_COLOR production --token=$TOKEN 2>&1 | grep -v "What's the value"
echo "#D8B2F2" | vercel env add REACT_APP_PRIMARY_COLOR preview --token=$TOKEN 2>&1 | grep -v "What's the value"
echo "#D8B2F2" | vercel env add REACT_APP_PRIMARY_COLOR development --token=$TOKEN 2>&1 | grep -v "What's the value"

echo "#FFB3D9" | vercel env add REACT_APP_SECONDARY_COLOR production --token=$TOKEN 2>&1 | grep -v "What's the value"
echo "#FFB3D9" | vercel env add REACT_APP_SECONDARY_COLOR preview --token=$TOKEN 2>&1 | grep -v "What's the value"
echo "#FFB3D9" | vercel env add REACT_APP_SECONDARY_COLOR development --token=$TOKEN 2>&1 | grep -v "What's the value"

echo "#B3D9FF" | vercel env add REACT_APP_ACCENT_COLOR production --token=$TOKEN 2>&1 | grep -v "What's the value"
echo "#B3D9FF" | vercel env add REACT_APP_ACCENT_COLOR preview --token=$TOKEN 2>&1 | grep -v "What's the value"
echo "#B3D9FF" | vercel env add REACT_APP_ACCENT_COLOR development --token=$TOKEN 2>&1 | grep -v "What's the value"

echo ""
echo "✅ All missing environment variables added!"
