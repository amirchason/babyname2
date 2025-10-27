#!/bin/bash
# ========================================
# AUTOMATED VERCEL ENV VARS FIX
# ========================================
# This script will:
# 1. Remove PUBLIC_URL (reserved variable)
# 2. Add all missing variables
# 3. Update production-only vars to all 3 environments
# 4. Ensure all 32 variables are in Production + Preview + Development
# ========================================

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
MAGENTA='\033[0;35m'
NC='\033[0m'

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}🔧 AUTOMATED VERCEL ENV FIX${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Get token
TOKEN=$(grep VERCEL_TOKEN .env.local | cut -d'=' -f2)

if [ -z "$TOKEN" ]; then
    echo -e "${RED}❌ Error: VERCEL_TOKEN not found in .env.local${NC}"
    exit 1
fi

echo -e "${CYAN}📡 Vercel Token: ${TOKEN:0:10}...${NC}"
echo ""

# Step 1: Remove PUBLIC_URL (reserved variable)
echo -e "${MAGENTA}========================================${NC}"
echo -e "${MAGENTA}STEP 1: Remove Reserved Variables${NC}"
echo -e "${MAGENTA}========================================${NC}"
echo ""

echo -e "${YELLOW}🗑️  Attempting to remove PUBLIC_URL...${NC}"

# Get list of env vars
VERCEL_TOKEN=$TOKEN vercel env ls --token=$TOKEN > ./vercel-env-list.txt 2>&1

# Check if PUBLIC_URL exists
if grep -q "PUBLIC_URL" ./vercel-env-list.txt; then
    echo -e "${YELLOW}⚠️  Found PUBLIC_URL - attempting removal...${NC}"

    # Try to remove from each environment
    for env in production preview development; do
        echo -e "${CYAN}   Removing from ${env}...${NC}"
        VERCEL_TOKEN=$TOKEN vercel env rm PUBLIC_URL $env --yes --token=$TOKEN 2>&1 || {
            echo -e "${YELLOW}   (May not exist in $env - continuing)${NC}"
        }
    done

    echo -e "${GREEN}✅ PUBLIC_URL removal attempted${NC}"
else
    echo -e "${GREEN}✅ PUBLIC_URL not found (already clean)${NC}"
fi

echo ""

# Step 2: Add all variables from .env.vercel
echo -e "${MAGENTA}========================================${NC}"
echo -e "${MAGENTA}STEP 2: Add/Update All Variables${NC}"
echo -e "${MAGENTA}========================================${NC}"
echo ""

if [ ! -f ".env.vercel" ]; then
    echo -e "${RED}❌ Error: .env.vercel not found${NC}"
    exit 1
fi

# Counter
ADDED_COUNT=0
UPDATED_COUNT=0
SKIPPED_COUNT=0

# Reserved variables to skip
declare -A RESERVED=(
    ["NODE_ENV"]=1
    ["PUBLIC_URL"]=1
    ["VERCEL"]=1
    ["VERCEL_ENV"]=1
    ["VERCEL_URL"]=1
)

# Read and process each variable
while IFS='=' read -r key value; do
    # Skip comments and empty lines
    [[ "$key" =~ ^#.*$ ]] && continue
    [[ -z "$key" ]] && continue

    # Trim whitespace
    key=$(echo "$key" | xargs)
    value=$(echo "$value" | xargs)

    # Skip if empty after trim
    [[ -z "$key" ]] && continue

    # Skip reserved variables
    if [[ -n "${RESERVED[$key]}" ]]; then
        echo -e "${YELLOW}⏭️  Skipping reserved: $key${NC}"
        ((SKIPPED_COUNT++))
        continue
    fi

    # Skip VERCEL_GIT_* variables
    if [[ "$key" =~ ^VERCEL_GIT ]]; then
        echo -e "${YELLOW}⏭️  Skipping reserved: $key${NC}"
        ((SKIPPED_COUNT++))
        continue
    fi

    # Special handling for REACT_APP_DEBUG_MODE (only preview + development)
    if [[ "$key" == "REACT_APP_DEBUG_MODE" ]]; then
        echo -e "${CYAN}📤 Adding: $key (Preview + Development only)${NC}"

        for env in preview development; do
            echo "$value" | VERCEL_TOKEN=$TOKEN vercel env add "$key" "$env" --force --token=$TOKEN 2>/dev/null || {
                echo -e "${YELLOW}   (Already exists in $env - updating)${NC}"
                VERCEL_TOKEN=$TOKEN vercel env rm "$key" "$env" --yes --token=$TOKEN 2>/dev/null || true
                echo "$value" | VERCEL_TOKEN=$TOKEN vercel env add "$key" "$env" --force --token=$TOKEN 2>/dev/null || true
            }
        done

        ((ADDED_COUNT++))
        continue
    fi

    # Add to all three environments
    echo -e "${CYAN}📤 Adding: $key (All environments)${NC}"

    ENV_EXISTS=0

    for env in production preview development; do
        # Try to add, if exists it will fail
        echo "$value" | VERCEL_TOKEN=$TOKEN vercel env add "$key" "$env" --force --token=$TOKEN 2>/dev/null && {
            echo -e "${GREEN}   ✅ Added to $env${NC}"
            ((ENV_EXISTS++))
        } || {
            # Variable exists, try to update by removing and re-adding
            echo -e "${YELLOW}   ⚠️  Exists in $env - updating...${NC}"
            VERCEL_TOKEN=$TOKEN vercel env rm "$key" "$env" --yes --token=$TOKEN 2>/dev/null || true
            echo "$value" | VERCEL_TOKEN=$TOKEN vercel env add "$key" "$env" --force --token=$TOKEN 2>/dev/null && {
                echo -e "${GREEN}   ✅ Updated in $env${NC}"
                ((ENV_EXISTS++))
            } || {
                echo -e "${RED}   ❌ Failed to update in $env${NC}"
            }
        }
    done

    if [ $ENV_EXISTS -gt 0 ]; then
        ((ADDED_COUNT++))
    fi

done < ".env.vercel"

echo ""

# Step 3: Summary
echo -e "${MAGENTA}========================================${NC}"
echo -e "${MAGENTA}📊 SUMMARY${NC}"
echo -e "${MAGENTA}========================================${NC}"
echo ""
echo -e "${GREEN}✅ Variables processed: $ADDED_COUNT${NC}"
echo -e "${YELLOW}⏭️  Skipped reserved: $SKIPPED_COUNT${NC}"
echo ""

# Step 4: Verification
echo -e "${MAGENTA}========================================${NC}"
echo -e "${MAGENTA}STEP 3: Verification${NC}"
echo -e "${MAGENTA}========================================${NC}"
echo ""

echo -e "${CYAN}🔍 Fetching current state...${NC}"
VERCEL_TOKEN=$TOKEN vercel env ls --token=$TOKEN > ./vercel-final-state.txt 2>&1

# Count variables per environment
PROD_COUNT=$(grep "Production" ./vercel-final-state.txt | wc -l)
PREV_COUNT=$(grep "Preview" ./vercel-final-state.txt | wc -l)
DEV_COUNT=$(grep "Development" ./vercel-final-state.txt | wc -l)

echo ""
echo -e "${BLUE}Environment Variable Counts:${NC}"
echo -e "${GREEN}   Production:  $PROD_COUNT variables${NC}"
echo -e "${GREEN}   Preview:     $PREV_COUNT variables${NC}"
echo -e "${GREEN}   Development: $DEV_COUNT variables${NC}"
echo ""

# Check if PUBLIC_URL still exists
if grep -q "PUBLIC_URL" ./vercel-final-state.txt; then
    echo -e "${RED}⚠️  WARNING: PUBLIC_URL still exists (may need manual removal)${NC}"
else
    echo -e "${GREEN}✅ PUBLIC_URL successfully removed${NC}"
fi

echo ""

# Step 5: Next steps
echo -e "${MAGENTA}========================================${NC}"
echo -e "${MAGENTA}🚀 NEXT STEPS${NC}"
echo -e "${MAGENTA}========================================${NC}"
echo ""
echo -e "${GREEN}1. Verify variables in dashboard:${NC}"
echo "   https://vercel.com/teamawesomeyay/soulseed/settings/environment-variables"
echo ""
echo -e "${GREEN}2. Test preview deployment:${NC}"
echo "   npm run deploy:preview"
echo ""
echo -e "${GREEN}3. If preview works, deploy to production:${NC}"
echo "   npm run deploy"
echo ""

# Cleanup
rm -f ./vercel-env-list.txt ./vercel-final-state.txt

echo -e "${BLUE}========================================${NC}"
echo -e "${GREEN}✅ AUTOMATED FIX COMPLETE!${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""
