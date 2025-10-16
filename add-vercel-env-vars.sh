#!/bin/bash

# 🔐 Vercel Environment Variables Setup Script
# Automatically imports environment variables from .env to Vercel
# Run: ./add-vercel-env-vars.sh

set -e

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}🔐 Vercel Environment Variables Setup${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"

# Check if .env exists
if [ ! -f ".env" ]; then
    echo -e "${RED}❌ Error: .env file not found${NC}"
    echo "Please create .env file first"
    exit 1
fi

# Check if vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo -e "${RED}❌ Error: Vercel CLI not installed${NC}"
    echo "Install with: npm install -g vercel"
    exit 1
fi

# Check if logged in
if ! vercel whoami &> /dev/null; then
    echo -e "${RED}❌ Error: Not logged into Vercel${NC}"
    echo "Login with: vercel login"
    exit 1
fi

echo -e "${GREEN}✅ Prerequisites met${NC}\n"

# List of required environment variables
ENV_VARS=(
    "REACT_APP_FIREBASE_API_KEY"
    "REACT_APP_FIREBASE_AUTH_DOMAIN"
    "REACT_APP_FIREBASE_PROJECT_ID"
    "REACT_APP_FIREBASE_STORAGE_BUCKET"
    "REACT_APP_FIREBASE_MESSAGING_SENDER_ID"
    "REACT_APP_FIREBASE_APP_ID"
    "REACT_APP_GOOGLE_CLIENT_ID"
    "REACT_APP_GOOGLE_CLIENT_SECRET"
    "REACT_APP_GOOGLE_API_KEY"
    "REACT_APP_GEMINI_API_KEY"
    "REACT_APP_YOUTUBE_API_KEY"
)

echo -e "${YELLOW}This script will add the following variables to Vercel:${NC}"
for var in "${ENV_VARS[@]}"; do
    echo "  - $var"
done
echo ""

read -p "Continue? (y/n): " confirm
if [ "$confirm" != "y" ]; then
    echo "Cancelled"
    exit 0
fi

echo ""
echo -e "${BLUE}Adding environment variables...${NC}\n"

# Counter for success/fail
SUCCESS=0
FAILED=0
SKIPPED=0

# Add each variable
for var in "${ENV_VARS[@]}"; do
    # Get value from .env (handle quotes and special chars)
    value=$(grep "^${var}=" .env | cut -d '=' -f2- | sed 's/^["'"'"']//' | sed 's/["'"'"']$//')

    if [ -z "$value" ]; then
        echo -e "${YELLOW}⚠️  $var - Not found in .env, skipping${NC}"
        ((SKIPPED++))
        continue
    fi

    # Check if variable already exists
    if vercel env ls 2>/dev/null | grep -q "^${var} "; then
        echo -e "${YELLOW}⚠️  $var - Already exists, skipping${NC}"
        ((SKIPPED++))
        continue
    fi

    # Add to Vercel (production, preview, development)
    echo -e "${BLUE}Adding: $var${NC}"

    # Try to add the variable
    if echo "$value" | vercel env add "$var" production preview development > /dev/null 2>&1; then
        echo -e "${GREEN}✅ $var - Added successfully${NC}"
        ((SUCCESS++))
    else
        echo -e "${RED}❌ $var - Failed to add${NC}"
        ((FAILED++))
    fi

    # Small delay to avoid rate limiting
    sleep 0.5
done

echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}Summary:${NC}"
echo -e "  ${GREEN}✅ Success: $SUCCESS${NC}"
echo -e "  ${YELLOW}⚠️  Skipped: $SKIPPED${NC}"
echo -e "  ${RED}❌ Failed: $FAILED${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

if [ $SUCCESS -gt 0 ]; then
    echo -e "${GREEN}Environment variables added successfully!${NC}"
    echo ""
    echo -e "${YELLOW}Next steps:${NC}"
    echo "1. Verify variables: vercel env ls"
    echo "2. Redeploy app: vercel --prod"
    echo "3. Test deployment"
    echo ""
fi

if [ $FAILED -gt 0 ]; then
    echo -e "${RED}Some variables failed to add.${NC}"
    echo "You may need to add them manually via:"
    echo "  - Vercel Dashboard: vercel dashboard"
    echo "  - Or manually: vercel env add VAR_NAME production"
    echo ""
fi

# Optional: Show current variables
read -p "Show all Vercel environment variables? (y/n): " show_vars
if [ "$show_vars" = "y" ]; then
    echo ""
    vercel env ls
fi

echo ""
echo -e "${GREEN}Done! 🎉${NC}"
