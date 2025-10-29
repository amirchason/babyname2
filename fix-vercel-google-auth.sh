#!/bin/bash

# ========================================
# Vercel Google Auth Auto-Fix Script
# ========================================
# Automatically diagnoses and fixes Google Auth on Vercel production
#
# Usage: ./fix-vercel-google-auth.sh

set -e

echo "🔍 Vercel Google Auth Diagnostic & Auto-Fix"
echo "============================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PRODUCTION_DOMAIN="soulseedbaby.com"
PRODUCTION_DOMAIN_WWW="www.soulseedbaby.com"
CLIENT_ID="1093132372253-a725n8gpe624usli0hnj3re1eicgi4o2.apps.googleusercontent.com"
PROJECT_ID="babynames-app-9fa2a"

# Step 1: Check local configuration
echo -e "${BLUE}Step 1: Checking local configuration...${NC}"
echo ""

if [ ! -f .env ]; then
    echo -e "${RED}❌ .env file not found!${NC}"
    exit 1
fi

if [ ! -f .env.production ]; then
    echo -e "${YELLOW}⚠️  .env.production not found (creating from template)${NC}"
    cp .env .env.production
fi

LOCAL_CLIENT_ID=$(grep "REACT_APP_GOOGLE_CLIENT_ID" .env | cut -d '=' -f2)

if [ -z "$LOCAL_CLIENT_ID" ]; then
    echo -e "${RED}❌ REACT_APP_GOOGLE_CLIENT_ID not found in .env${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Local Client ID found: ${LOCAL_CLIENT_ID:0:30}...${NC}"
echo ""

# Step 2: Check Vercel CLI authentication
echo -e "${BLUE}Step 2: Checking Vercel CLI authentication...${NC}"
echo ""

if ! vercel whoami &>/dev/null; then
    echo -e "${YELLOW}⚠️  Not logged into Vercel CLI${NC}"
    echo ""
    echo "Please login to Vercel:"
    echo "  vercel login"
    echo ""
    echo "After login, run this script again."
    echo ""
    echo -e "${BLUE}Alternative: Manual Vercel Environment Variable Setup${NC}"
    echo "1. Go to: https://vercel.com/dashboard"
    echo "2. Select project: soulseed"
    echo "3. Go to: Settings > Environment Variables"
    echo "4. Add these variables for Production, Preview, Development:"
    echo ""
    echo "   REACT_APP_GOOGLE_CLIENT_ID"
    echo "   Value: $LOCAL_CLIENT_ID"
    echo ""
    echo "   REACT_APP_FIREBASE_API_KEY"
    echo "   Value: $(grep REACT_APP_FIREBASE_API_KEY .env | cut -d '=' -f2)"
    echo ""
    echo "   REACT_APP_FIREBASE_AUTH_DOMAIN"
    echo "   Value: $(grep REACT_APP_FIREBASE_AUTH_DOMAIN .env | cut -d '=' -f2)"
    echo ""
    echo "   REACT_APP_FIREBASE_PROJECT_ID"
    echo "   Value: $(grep REACT_APP_FIREBASE_PROJECT_ID .env | cut -d '=' -f2)"
    echo ""
    echo "5. Redeploy: vercel --prod"
    exit 0
fi

VERCEL_USER=$(vercel whoami 2>/dev/null)
echo -e "${GREEN}✅ Logged in as: $VERCEL_USER${NC}"
echo ""

# Step 3: Check and add Vercel environment variables
echo -e "${BLUE}Step 3: Configuring Vercel environment variables...${NC}"
echo ""

# Function to add environment variable to Vercel
add_vercel_env() {
    local key=$1
    local value=$2

    echo "Adding $key to Vercel..."

    # Check if variable already exists
    if vercel env ls | grep -q "$key"; then
        echo -e "${YELLOW}⚠️  $key already exists in Vercel${NC}"
        echo "   Removing old value..."
        vercel env rm "$key" production -y 2>/dev/null || true
        vercel env rm "$key" preview -y 2>/dev/null || true
        vercel env rm "$key" development -y 2>/dev/null || true
    fi

    # Add to all environments
    echo "$value" | vercel env add "$key" production --force 2>/dev/null || true
    echo "$value" | vercel env add "$key" preview --force 2>/dev/null || true
    echo "$value" | vercel env add "$key" development --force 2>/dev/null || true

    echo -e "${GREEN}✅ Added $key${NC}"
}

# Extract variables from .env
FIREBASE_API_KEY=$(grep "REACT_APP_FIREBASE_API_KEY" .env | cut -d '=' -f2)
FIREBASE_AUTH_DOMAIN=$(grep "REACT_APP_FIREBASE_AUTH_DOMAIN" .env | cut -d '=' -f2)
FIREBASE_PROJECT_ID=$(grep "REACT_APP_FIREBASE_PROJECT_ID" .env | cut -d '=' -f2)
FIREBASE_STORAGE_BUCKET=$(grep "REACT_APP_FIREBASE_STORAGE_BUCKET" .env | cut -d '=' -f2)
FIREBASE_MESSAGING_SENDER_ID=$(grep "REACT_APP_FIREBASE_MESSAGING_SENDER_ID" .env | cut -d '=' -f2)
FIREBASE_APP_ID=$(grep "REACT_APP_FIREBASE_APP_ID" .env | cut -d '=' -f2)

# Add critical environment variables
add_vercel_env "REACT_APP_GOOGLE_CLIENT_ID" "$LOCAL_CLIENT_ID"
add_vercel_env "REACT_APP_FIREBASE_API_KEY" "$FIREBASE_API_KEY"
add_vercel_env "REACT_APP_FIREBASE_AUTH_DOMAIN" "$FIREBASE_AUTH_DOMAIN"
add_vercel_env "REACT_APP_FIREBASE_PROJECT_ID" "$FIREBASE_PROJECT_ID"
add_vercel_env "REACT_APP_FIREBASE_STORAGE_BUCKET" "$FIREBASE_STORAGE_BUCKET"
add_vercel_env "REACT_APP_FIREBASE_MESSAGING_SENDER_ID" "$FIREBASE_MESSAGING_SENDER_ID"
add_vercel_env "REACT_APP_FIREBASE_APP_ID" "$FIREBASE_APP_ID"

echo ""
echo -e "${GREEN}✅ All environment variables configured in Vercel${NC}"
echo ""

# Step 4: Build and deploy
echo -e "${BLUE}Step 4: Building and deploying to Vercel...${NC}"
echo ""

echo "Building production bundle..."
npm run build

echo ""
echo "Deploying to Vercel production..."
vercel --prod --yes

echo ""
echo -e "${GREEN}✅ Deployed successfully!${NC}"
echo ""

# Step 5: Provide Google OAuth configuration instructions
echo -e "${BLUE}Step 5: Google OAuth Configuration Check${NC}"
echo "=========================================="
echo ""
echo "⚠️  IMPORTANT: Verify Google Cloud Console OAuth settings"
echo ""
echo "1. Go to: https://console.cloud.google.com/apis/credentials"
echo ""
echo "2. Find and edit Client ID:"
echo "   ${CLIENT_ID}"
echo ""
echo "3. Verify 'Authorized redirect URIs' includes ALL of these:"
echo "   ✓ https://${PRODUCTION_DOMAIN}"
echo "   ✓ https://${PRODUCTION_DOMAIN_WWW}"
echo "   ✓ https://soulseed.vercel.app"
echo "   ✓ https://soulseed-*.vercel.app (for preview deployments)"
echo "   ✓ http://localhost:3000 (for local dev)"
echo "   ✓ http://localhost:3000/ (with trailing slash)"
echo ""
echo "4. Check OAuth Consent Screen:"
echo "   https://console.cloud.google.com/apis/credentials/consent"
echo "   - Must be 'Published' (not in Testing mode)"
echo "   - OR add your email to test users if in Testing mode"
echo ""
echo "5. Verify authorized domains:"
echo "   - ${PRODUCTION_DOMAIN}"
echo "   - ${PRODUCTION_DOMAIN_WWW}"
echo "   - vercel.app"
echo ""

# Step 6: Test instructions
echo ""
echo -e "${BLUE}Step 6: Testing the Fix${NC}"
echo "======================="
echo ""
echo "1. Visit your site: https://${PRODUCTION_DOMAIN}"
echo ""
echo "2. Open browser console (F12)"
echo ""
echo "3. Look for this debug output:"
echo "   ===== GOOGLE AUTH DEBUG ====="
echo "   REACT_APP_GOOGLE_CLIENT_ID: ${CLIENT_ID:0:30}..."
echo "   hasValidClientId: true"
echo ""
echo "4. Click 'Sign in' button"
echo ""
echo "5. Expected: Google OAuth popup appears ✅"
echo ""

# Generate deployment URL
DEPLOYMENT_URL=$(vercel inspect --wait 2>/dev/null | grep "https://" | head -1 || echo "https://${PRODUCTION_DOMAIN}")

echo -e "${GREEN}✅ Fix Complete!${NC}"
echo ""
echo "🌐 Production URL: $DEPLOYMENT_URL"
echo ""
echo "📝 If still not working:"
echo "   1. Wait 2-3 minutes for Vercel deployment to complete"
echo "   2. Hard refresh browser (Ctrl+Shift+R)"
echo "   3. Check Google Cloud Console OAuth settings above"
echo "   4. Check browser console for errors"
echo ""
echo "📄 Full diagnostic: VERCEL_AUTH_DIAGNOSIS.md"
echo ""
