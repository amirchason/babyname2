#!/bin/bash
# ========================================
# VERCEL ENVIRONMENT VARIABLES TESTER
# ========================================
# ULTRATHINK mode: Comprehensive testing
# Tests for missing, misconfigured, or problematic env vars
# ========================================

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}🔍 VERCEL ENV VARS ULTRA-TEST${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Expected variables from .env.vercel
EXPECTED_VARS=(
    "TSC_COMPILE_ON_ERROR"
    "SKIP_PREFLIGHT_CHECK"
    "DISABLE_ESLINT_PLUGIN"
    "GENERATE_SOURCEMAP"
    "REACT_APP_GOOGLE_API_KEY"
    "REACT_APP_GEMINI_API_KEY"
    "REACT_APP_YOUTUBE_API_KEY"
    "REACT_APP_GOOGLE_CLIENT_ID"
    "REACT_APP_GOOGLE_CLIENT_SECRET"
    "REACT_APP_FIREBASE_API_KEY"
    "REACT_APP_FIREBASE_AUTH_DOMAIN"
    "REACT_APP_FIREBASE_PROJECT_ID"
    "REACT_APP_FIREBASE_STORAGE_BUCKET"
    "REACT_APP_FIREBASE_MESSAGING_SENDER_ID"
    "REACT_APP_FIREBASE_APP_ID"
    "OPENAI_API_KEY"
    "REACT_APP_OPENAI_API_KEY"
    "NANOBANANA_API_KEY"
    "REACT_APP_ENABLE_AI_CHAT"
    "REACT_APP_ENABLE_FAVORITES"
    "REACT_APP_ENABLE_SCRAPING"
    "REACT_APP_ENABLE_BLOG"
    "REACT_APP_PRIMARY_COLOR"
    "REACT_APP_SECONDARY_COLOR"
    "REACT_APP_ACCENT_COLOR"
    "VERCEL_PROJECT_ID"
    "VERCEL_ORG_ID"
    "REACT_APP_ADMIN_EMAIL"
    "REACT_APP_APP_NAME"
    "REACT_APP_APP_TAGLINE"
    "REACT_APP_VERSION"
    "REACT_APP_DEBUG_MODE"
)

# Reserved variables that should NOT be manually set
RESERVED_VARS=(
    "NODE_ENV"
    "PUBLIC_URL"
    "VERCEL"
    "VERCEL_ENV"
    "VERCEL_URL"
)

# Get token
TOKEN=$(grep VERCEL_TOKEN .env.local | cut -d'=' -f2)

# Fetch current Vercel env vars
echo -e "${CYAN}📡 Fetching current Vercel environment variables...${NC}"
VERCEL_OUTPUT=$(VERCEL_TOKEN=$TOKEN vercel env ls --token=$TOKEN 2>&1)

# Save to temp file for analysis
echo "$VERCEL_OUTPUT" > ./vercel-env-test.txt

echo -e "${GREEN}✅ Retrieved variables from Vercel${NC}"
echo ""

# Test 1: Check for reserved variables
echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}TEST 1: Reserved Variables Check${NC}"
echo -e "${BLUE}========================================${NC}"

RESERVED_FOUND=0
for var in "${RESERVED_VARS[@]}"; do
    if grep -q "^[[:space:]]*$var[[:space:]]" ./vercel-env-test.txt; then
        echo -e "${RED}❌ FOUND: $var (should NOT be manually set!)${NC}"
        ((RESERVED_FOUND++))
    fi
done

if [ $RESERVED_FOUND -eq 0 ]; then
    echo -e "${GREEN}✅ No reserved variables found (good!)${NC}"
else
    echo -e "${RED}⚠️  Found $RESERVED_FOUND reserved variable(s) - REMOVE THESE!${NC}"
fi
echo ""

# Test 2: Check for missing variables
echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}TEST 2: Missing Variables Check${NC}"
echo -e "${BLUE}========================================${NC}"

MISSING_COUNT=0
MISSING_VARS=()

for var in "${EXPECTED_VARS[@]}"; do
    if ! grep -q "^[[:space:]]*$var[[:space:]]" ./vercel-env-test.txt; then
        echo -e "${RED}❌ MISSING: $var${NC}"
        MISSING_VARS+=("$var")
        ((MISSING_COUNT++))
    fi
done

if [ $MISSING_COUNT -eq 0 ]; then
    echo -e "${GREEN}✅ All expected variables present${NC}"
else
    echo -e "${RED}⚠️  Missing $MISSING_COUNT variable(s)${NC}"
fi
echo ""

# Test 3: Check environment coverage
echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}TEST 3: Environment Coverage${NC}"
echo -e "${BLUE}========================================${NC}"

PROD_ONLY_COUNT=0
PROD_ONLY_VARS=()

# Critical variables that MUST be in all environments
CRITICAL_VARS=(
    "REACT_APP_FIREBASE_API_KEY"
    "REACT_APP_FIREBASE_AUTH_DOMAIN"
    "REACT_APP_FIREBASE_PROJECT_ID"
    "REACT_APP_GOOGLE_CLIENT_ID"
    "REACT_APP_ENABLE_AI_CHAT"
    "REACT_APP_ENABLE_FAVORITES"
)

for var in "${CRITICAL_VARS[@]}"; do
    # Check if variable exists in all 3 environments
    PROD=$(grep "^[[:space:]]*$var[[:space:]]" ./vercel-env-test.txt | grep -c "Production" || true)
    PREV=$(grep "^[[:space:]]*$var[[:space:]]" ./vercel-env-test.txt | grep -c "Preview" || true)
    DEV=$(grep "^[[:space:]]*$var[[:space:]]" ./vercel-env-test.txt | grep -c "Development" || true)

    if [ $PROD -gt 0 ] && [ $PREV -eq 0 ] && [ $DEV -eq 0 ]; then
        echo -e "${YELLOW}⚠️  $var: Production only (missing Preview + Development)${NC}"
        PROD_ONLY_VARS+=("$var")
        ((PROD_ONLY_COUNT++))
    elif [ $PROD -gt 0 ] && [ $PREV -gt 0 ] && [ $DEV -gt 0 ]; then
        echo -e "${GREEN}✅ $var: All environments${NC}"
    fi
done

if [ $PROD_ONLY_COUNT -gt 0 ]; then
    echo -e "${RED}⚠️  $PROD_ONLY_COUNT critical variable(s) missing from Preview/Development${NC}"
fi
echo ""

# Test 4: Summary and recommendations
echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}📊 TEST SUMMARY${NC}"
echo -e "${BLUE}========================================${NC}"

TOTAL_ISSUES=$((RESERVED_FOUND + MISSING_COUNT + PROD_ONLY_COUNT))

if [ $TOTAL_ISSUES -eq 0 ]; then
    echo -e "${GREEN}🎉 ALL TESTS PASSED!${NC}"
    echo -e "${GREEN}✅ No issues found${NC}"
else
    echo -e "${RED}❌ FOUND $TOTAL_ISSUES ISSUE(S):${NC}"
    echo -e "${RED}   - Reserved variables: $RESERVED_FOUND${NC}"
    echo -e "${RED}   - Missing variables: $MISSING_COUNT${NC}"
    echo -e "${RED}   - Production-only: $PROD_ONLY_COUNT${NC}"
    echo ""
    echo -e "${YELLOW}🔧 RECOMMENDED ACTIONS:${NC}"
    echo ""

    if [ $RESERVED_FOUND -gt 0 ]; then
        echo -e "${YELLOW}1. Remove PUBLIC_URL from Vercel dashboard${NC}"
        echo "   (Vercel sets this automatically)"
        echo ""
    fi

    if [ $MISSING_COUNT -gt 0 ]; then
        echo -e "${YELLOW}2. Add missing variables:${NC}"
        for var in "${MISSING_VARS[@]}"; do
            echo "   - $var"
        done
        echo ""
    fi

    if [ $PROD_ONLY_COUNT -gt 0 ]; then
        echo -e "${YELLOW}3. Add to Preview + Development:${NC}"
        for var in "${PROD_ONLY_VARS[@]}"; do
            echo "   - $var"
        done
        echo ""
    fi

    echo -e "${CYAN}💡 Quick fix:${NC}"
    echo "   ./upload-vercel-env.sh all"
    echo ""
fi

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}📄 Full report saved to: vercel-env-test-report.txt${NC}"
echo -e "${BLUE}========================================${NC}"

# Clean up
rm -f ./vercel-env-test.txt

exit $TOTAL_ISSUES
