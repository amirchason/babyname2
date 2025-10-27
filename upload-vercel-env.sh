#!/bin/bash
# ========================================
# VERCEL ENVIRONMENT VARIABLES UPLOAD SCRIPT
# ========================================
# Based on official Vercel documentation
# Uses Vercel CLI to bulk upload environment variables
#
# PREREQUISITES:
# 1. Install Vercel CLI: npm install -g vercel
# 2. Login: vercel login
# 3. Set VERCEL_TOKEN in .env.local file
#
# USAGE:
# ./upload-vercel-env.sh [production|preview|development|all]
#
# EXAMPLES:
# ./upload-vercel-env.sh all              # Upload to all environments
# ./upload-vercel-env.sh production       # Production only
# ./upload-vercel-env.sh preview          # Preview only
# ========================================

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
ENV_FILE=".env.vercel"
PROJECT_ID="prj_wDbXRJMvE12QLEk3QivyEdDWH9Lo"

# Check if .env.vercel exists
if [ ! -f "$ENV_FILE" ]; then
    echo -e "${RED}❌ Error: $ENV_FILE not found${NC}"
    echo "Please create $ENV_FILE first"
    exit 1
fi

# Determine target environments
TARGET_ENV="${1:-all}"

case $TARGET_ENV in
    production)
        ENVS="production"
        ;;
    preview)
        ENVS="preview"
        ;;
    development)
        ENVS="development"
        ;;
    all)
        ENVS="production preview development"
        ;;
    *)
        echo -e "${RED}❌ Invalid environment: $TARGET_ENV${NC}"
        echo "Usage: $0 [production|preview|development|all]"
        exit 1
        ;;
esac

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}📦 Vercel Environment Variables Upload${NC}"
echo -e "${BLUE}========================================${NC}"
echo -e "${YELLOW}Target environments: $ENVS${NC}"
echo -e "${YELLOW}Source file: $ENV_FILE${NC}"
echo ""

# Check if vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo -e "${RED}❌ Vercel CLI not found${NC}"
    echo "Install with: npm install -g vercel"
    exit 1
fi

# Check if logged in
if ! vercel whoami &> /dev/null; then
    echo -e "${YELLOW}⚠️  Not logged in to Vercel${NC}"
    echo "Running: vercel login"
    vercel login
fi

# Link to project
echo -e "${BLUE}🔗 Linking to Vercel project...${NC}"
vercel link --project=$PROJECT_ID --yes 2>/dev/null || true

# Counter for uploaded variables
UPLOAD_COUNT=0
SKIP_COUNT=0

# Read and upload each variable
while IFS='=' read -r key value; do
    # Skip comments and empty lines
    [[ "$key" =~ ^#.*$ ]] && continue
    [[ -z "$key" ]] && continue

    # Trim whitespace
    key=$(echo "$key" | xargs)
    value=$(echo "$value" | xargs)

    # Skip if empty after trim
    [[ -z "$key" ]] && continue

    # Skip DO NOT ADD section variables
    if [[ "$key" == "NODE_ENV" ]] || \
       [[ "$key" == "PUBLIC_URL" ]] || \
       [[ "$key" == "VERCEL" ]] || \
       [[ "$key" == "VERCEL_ENV" ]] || \
       [[ "$key" == "VERCEL_URL" ]] || \
       [[ "$key" =~ ^VERCEL_GIT ]]; then
        echo -e "${YELLOW}⏭️  Skipping reserved variable: $key${NC}"
        ((SKIP_COUNT++))
        continue
    fi

    echo -e "${GREEN}📤 Uploading: $key${NC}"

    # Upload to each target environment
    for env in $ENVS; do
        # Use vercel env add (will prompt to overwrite if exists)
        echo "$value" | vercel env add "$key" "$env" --force 2>/dev/null || {
            echo -e "${YELLOW}⚠️  Failed to upload $key to $env (may already exist)${NC}"
        }
    done

    ((UPLOAD_COUNT++))

done < "$ENV_FILE"

echo ""
echo -e "${BLUE}========================================${NC}"
echo -e "${GREEN}✅ Upload Complete!${NC}"
echo -e "${BLUE}========================================${NC}"
echo -e "${GREEN}📊 Uploaded: $UPLOAD_COUNT variables${NC}"
echo -e "${YELLOW}⏭️  Skipped: $SKIP_COUNT reserved variables${NC}"
echo ""
echo -e "${BLUE}🚀 Next steps:${NC}"
echo "1. Verify variables at: https://vercel.com/teamawesomeyay/soulseed/settings/environment-variables"
echo "2. Mark sensitive variables as 'Sensitive' in dashboard"
echo "3. Deploy to test: npm run deploy:preview"
echo "4. Deploy to production: npm run deploy"
echo ""
