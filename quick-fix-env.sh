#!/bin/bash
# Quick and simple Vercel env fix
# Adds ALL variables to ALL environments

TOKEN=$(grep VERCEL_TOKEN .env.local | cut -d'=' -f2)

echo "🚀 Quick Vercel Env Fix Starting..."
echo ""

# List of all variable names and values from .env.vercel
declare -A VARS
VARS[TSC_COMPILE_ON_ERROR]="true"
VARS[SKIP_PREFLIGHT_CHECK]="true"
VARS[DISABLE_ESLINT_PLUGIN]="true"
VARS[GENERATE_SOURCEMAP]="false"
VARS[REACT_APP_GOOGLE_API_KEY]="AIzaSyALzy3qXMyXPtLl7pUuCDo_eE5X89u3dpA"
VARS[REACT_APP_GEMINI_API_KEY]="AIzaSyALzy3qXMyXPtLl7pUuCDo_eE5X89u3dpA"
VARS[REACT_APP_YOUTUBE_API_KEY]="AIzaSyALzy3qXMyXPtLl7pUuCDo_eE5X89u3dpA"
VARS[REACT_APP_GOOGLE_CLIENT_ID]="1093132372253-a725n8gpe624usli0hnj3re1eicgi4o2.apps.googleusercontent.com"
VARS[REACT_APP_GOOGLE_CLIENT_SECRET]="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"
VARS[REACT_APP_FIREBASE_API_KEY]="AIzaSyDbNCgZiXe4d_dFAXNMVclSD3AryoUUI70"
VARS[REACT_APP_FIREBASE_AUTH_DOMAIN]="babynames-app-9fa2a.firebaseapp.com"
VARS[REACT_APP_FIREBASE_PROJECT_ID]="babynames-app-9fa2a"
VARS[REACT_APP_FIREBASE_STORAGE_BUCKET]="babynames-app-9fa2a.firebasestorage.app"
VARS[REACT_APP_FIREBASE_MESSAGING_SENDER_ID]="1093132372253"
VARS[REACT_APP_FIREBASE_APP_ID]="1:1093132372253:web:0327c13610942d60f4f9f4"
VARS[OPENAI_API_KEY]="process.env.OPENAI_API_KEY"
VARS[REACT_APP_OPENAI_API_KEY]="process.env.OPENAI_API_KEY"
VARS[NANOBANANA_API_KEY]="sk-ant-api03-m9Z5gJ9_6MV5GBr4AZm9_P8HVPwvjKT25CxeJEI_9s6UmPiJmyLLPUKGQY7UqdWUqCEYWXO2cJ3J2Zi6XqYvLA-iHhJpgAA"
VARS[REACT_APP_ENABLE_AI_CHAT]="true"
VARS[REACT_APP_ENABLE_FAVORITES]="true"
VARS[REACT_APP_ENABLE_SCRAPING]="true"
VARS[REACT_APP_ENABLE_BLOG]="false"
VARS[REACT_APP_PRIMARY_COLOR]="#D8B2F2"
VARS[REACT_APP_SECONDARY_COLOR]="#FFB3D9"
VARS[REACT_APP_ACCENT_COLOR]="#B3D9FF"
VARS[VERCEL_PROJECT_ID]="prj_wDbXRJMvE12QLEk3QivyEdDWH9Lo"
VARS[VERCEL_ORG_ID]="team_BIeE8j8PrPGXfXfbzS0AXGEf"
VARS[REACT_APP_ADMIN_EMAIL]="888soulseed888@gmail.com"
VARS[REACT_APP_APP_NAME]="SoulSeed"
VARS[REACT_APP_APP_TAGLINE]="Where your baby name blooms"
VARS[REACT_APP_VERSION]="1.0.0"

COUNT=0
for key in "${!VARS[@]}"; do
    value="${VARS[$key]}"
    echo "[$COUNT] Adding $key..."

    for env in production preview development; do
        # Remove if exists, then add
        VERCEL_TOKEN=$TOKEN vercel env rm "$key" "$env" --yes --token=$TOKEN 2>/dev/null || true
        echo "$value" | VERCEL_TOKEN=$TOKEN vercel env add "$key" "$env" --force --token=$TOKEN 2>/dev/null || echo "  Skip $env"
    done

    ((COUNT++))
done

# Debug mode - preview and dev only
echo "[31] Adding REACT_APP_DEBUG_MODE (Preview + Dev only)..."
for env in preview development; do
    VERCEL_TOKEN=$TOKEN vercel env rm "REACT_APP_DEBUG_MODE" "$env" --yes --token=$TOKEN 2>/dev/null || true
    echo "false" | VERCEL_TOKEN=$TOKEN vercel env add "REACT_APP_DEBUG_MODE" "$env" --force --token=$TOKEN 2>/dev/null || echo "  Skip $env"
done

echo ""
echo "✅ Done! Processed $((COUNT + 1)) variables"
echo ""
echo "Next: npm run deploy"
