#!/bin/bash
# Quick Deploy Script
# Commits all changes and pushes to trigger automatic GitHub Pages deployment

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}🚀 Quick Deploy to GitHub Pages${NC}"
echo ""

# Check if there are changes to commit
if [[ -z $(git status -s) ]]; then
    echo -e "${GREEN}✓ No changes to commit${NC}"
    exit 0
fi

# Show status
echo "📋 Changes to commit:"
git status -s
echo ""

# Get commit message from user or use default
if [ -z "$1" ]; then
    # Default commit message with timestamp
    COMMIT_MSG="🚀 Auto-deploy: $(date '+%Y-%m-%d %H:%M:%S')"
else
    COMMIT_MSG="$1"
fi

echo -e "${YELLOW}📝 Commit message: ${NC}$COMMIT_MSG"
echo ""

# Add all changes
echo "📦 Staging changes..."
git add .

# Commit
echo "💾 Committing changes..."
git commit -m "$COMMIT_MSG"

# Push to trigger deployment
echo "🚀 Pushing to GitHub (this will trigger automatic deployment)..."
git push origin master

echo ""
echo -e "${GREEN}✅ Push complete!${NC}"
echo ""
echo "🔗 Your deployment will be live in ~2-3 minutes at:"
echo "   https://amirchason.github.io/babyname2"
echo ""
echo "📊 Check deployment status at:"
echo "   https://github.com/amirchason/babyname2/actions"
