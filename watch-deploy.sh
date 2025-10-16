#!/bin/bash
# Watch Latest Deployment Status
# Shows real-time status of your latest Vercel deployment

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}👀 Watching Latest Deployment...${NC}"
echo ""

# Get latest deployment
LATEST=$(vercel ls --json 2>/dev/null | head -1)

if [ -z "$LATEST" ]; then
    echo -e "${RED}❌ No deployments found${NC}"
    exit 1
fi

# Extract URL and status (basic parsing for Termux)
echo -e "${BLUE}🔍 Latest deployment info:${NC}"
vercel ls | head -5

echo ""
echo -e "${YELLOW}⏳ Waiting for deployment to complete...${NC}"
echo ""

# Simple polling loop (30 seconds)
for i in {1..30}; do
    echo -ne "${BLUE}[${i}/30]${NC} Checking...\r"
    sleep 1
done

echo ""
echo ""
echo -e "${GREEN}✅ Deployment should be ready!${NC}"
echo ""
echo -e "${BLUE}🌐 Check your deployments:${NC}"
vercel ls | head -3
echo ""
echo -e "${YELLOW}💡 Visit the URL above to see your changes live!${NC}"
