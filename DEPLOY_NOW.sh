#!/bin/bash

echo "🚀 GitHub Pages Deployment Script"
echo "================================"
echo ""
echo "This script will push the gh-pages branch to GitHub."
echo "You'll need to enter your GitHub credentials when prompted."
echo ""
echo "Repository: https://github.com/amirchason/babyname2"
echo ""

# Push gh-pages branch
echo "📤 Pushing gh-pages branch to GitHub..."
git push origin gh-pages --force

echo ""
echo "✅ Deployment complete!"
echo ""
echo "📋 Next steps:"
echo "1. Go to: https://github.com/amirchason/babyname2/settings/pages"
echo "2. Under 'Source', select 'Deploy from a branch'"
echo "3. Choose branch: gh-pages"
echo "4. Choose folder: / (root)"
echo "5. Click 'Save'"
echo ""
echo "🌐 Your app will be live at: https://amirchason.github.io/babyname2"
echo "   (Takes 2-10 minutes to activate)"
echo ""
echo "To check deployment status:"
echo "Visit: https://github.com/amirchason/babyname2/actions"