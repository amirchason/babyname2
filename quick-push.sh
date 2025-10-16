#!/bin/bash
# Quick Push & Deploy Script
# Deploys to PRODUCTION = Same URL every time!

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Quick Deploy to Production${NC}"
echo ""

# Check if there are changes
if [[ -z $(git status -s) ]]; then
    echo -e "${YELLOW}⚠️  No changes to commit${NC}"
    echo -e "${BLUE}🌐 Your site: https://soulseedbaby.com${NC}"
    exit 0
fi

# Show what's changed
echo -e "${BLUE}📝 Changed files:${NC}"
git status -s
echo ""

# Get commit message from argument or use default
if [ -z "$1" ]; then
    TIMESTAMP=$(date +"%Y-%m-%d %H:%M:%S")
    COMMIT_MSG="Quick update: $TIMESTAMP"
else
    COMMIT_MSG="$1"
fi

echo -e "${BLUE}💬 Commit message:${NC} $COMMIT_MSG"
echo ""

# Add all changes
git add .

# Commit
git commit -m "$COMMIT_MSG"

# Push to master (triggers production deployment)
echo -e "${BLUE}⬆️  Pushing to master branch...${NC}"
git push origin master

if [ $? -eq 0 ]; then
    echo ""
    echo -e "${GREEN}✅ Pushed to production!${NC}"
    echo ""
    echo -e "${BLUE}🔍 Vercel is rebuilding your site now...${NC}"
    echo ""
    echo -e "${YELLOW}⏱️  Build time: ~30-60 seconds${NC}"
    echo ""
    echo -e "${GREEN}🌐 Your SAME URL (always):${NC}"
    echo -e "${GREEN}   → https://soulseedbaby.com${NC}"
    echo -e "${GREEN}   → https://soulseed.baby${NC}"
    echo -e "${GREEN}   → https://soulseedapp.com${NC}"
    echo ""
    echo -e "${BLUE}💡 Tip: Refresh your browser in 60 seconds to see changes!${NC}"
else
    echo ""
    echo -e "${RED}❌ Push failed!${NC}"
    echo -e "${YELLOW}Check your internet connection or git status${NC}"
fi
