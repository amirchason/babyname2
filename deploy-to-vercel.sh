#!/bin/bash

# 🚀 SoulSeed - Vercel Deployment Script
# Automated deployment script for Termux/Android
# Run: ./deploy-to-vercel.sh

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Helper functions
print_header() {
    echo -e "\n${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Welcome message
clear
echo -e "${BLUE}"
cat << "EOF"
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║   🚀 SoulSeed - Vercel Deployment Script                 ║
║                                                           ║
║   This script will help you deploy your app to Vercel    ║
║   with a custom domain.                                   ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
EOF
echo -e "${NC}\n"

# Step 1: Check prerequisites
print_header "Step 1: Checking Prerequisites"

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    print_error "package.json not found. Are you in the project root?"
    exit 1
fi
print_success "Project root confirmed"

# Check if vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    print_warning "Vercel CLI not found. Installing..."
    npm install -g vercel
    print_success "Vercel CLI installed"
else
    print_success "Vercel CLI already installed ($(vercel --version))"
fi

# Check if .env exists
if [ ! -f ".env" ]; then
    print_error ".env file not found. Please create it first."
    exit 1
fi
print_success ".env file found"

# Step 2: Test local build
print_header "Step 2: Testing Local Build"
print_info "Running npm run build to verify everything works..."

if npm run build; then
    print_success "Build successful!"
else
    print_error "Build failed. Fix errors before deploying."
    exit 1
fi

# Step 3: Git commit
print_header "Step 3: Committing Changes"

# Check if there are uncommitted changes
if [ -n "$(git status --porcelain)" ]; then
    print_info "Uncommitted changes detected."
    read -p "Commit message (or press Enter for default): " commit_msg

    if [ -z "$commit_msg" ]; then
        commit_msg="🚀 Deploy: Vercel deployment $(date '+%Y-%m-%d %H:%M:%S')"
    fi

    git add .
    git commit -m "$commit_msg"
    print_success "Changes committed"

    read -p "Push to GitHub? (y/n): " push_github
    if [ "$push_github" = "y" ]; then
        git push origin master
        print_success "Pushed to GitHub"
    fi
else
    print_success "No uncommitted changes"
fi

# Step 4: Vercel login
print_header "Step 4: Vercel Authentication"

if vercel whoami &> /dev/null; then
    print_success "Already logged into Vercel as: $(vercel whoami)"
else
    print_info "Logging into Vercel..."
    print_warning "A browser window will open for authentication."
    print_warning "If it doesn't open automatically, copy the URL from below."

    vercel login
    print_success "Logged into Vercel"
fi

# Step 5: Deploy to Vercel
print_header "Step 5: Deploying to Vercel"

print_info "Choose deployment type:"
echo "1) Preview deployment (test first)"
echo "2) Production deployment"
read -p "Enter choice (1 or 2): " deploy_choice

if [ "$deploy_choice" = "2" ]; then
    print_info "Deploying to PRODUCTION..."
    vercel --prod
else
    print_info "Deploying to PREVIEW..."
    vercel
fi

print_success "Deployment complete!"

# Step 6: Environment variables
print_header "Step 6: Environment Variables Setup"

print_info "Do you want to configure environment variables now?"
echo "This includes Firebase config, Google OAuth, API keys, etc."
read -p "Configure env vars? (y/n): " config_env

if [ "$config_env" = "y" ]; then
    print_info "You can either:"
    echo "1) Add them via CLI (one by one)"
    echo "2) Add them via Vercel Dashboard (easier)"
    echo "3) Skip (do it later)"
    read -p "Enter choice (1, 2, or 3): " env_choice

    case $env_choice in
        1)
            print_info "Adding environment variables via CLI..."
            print_warning "You'll need to paste each value when prompted."

            # List of required env vars
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

            for var in "${ENV_VARS[@]}"; do
                # Get value from .env
                value=$(grep "^${var}=" .env | cut -d '=' -f2-)

                if [ -n "$value" ]; then
                    echo "Adding $var..."
                    vercel env add "$var" production <<< "$value"
                else
                    print_warning "$var not found in .env, skipping..."
                fi
            done

            print_success "Environment variables added"
            ;;
        2)
            print_info "Opening Vercel Dashboard..."
            print_info "Go to: Settings → Environment Variables"
            print_info "Copy values from your .env file"
            vercel dashboard
            read -p "Press Enter when done..."
            ;;
        3)
            print_info "Skipping environment variables setup"
            ;;
    esac
fi

# Step 7: Domain setup
print_header "Step 7: Custom Domain Setup"

print_info "Do you want to set up a custom domain now?"
echo "Note: You'll need to have purchased a domain first."
read -p "Set up custom domain? (y/n): " setup_domain

if [ "$setup_domain" = "y" ]; then
    print_info "Domain Setup Options:"
    echo "1) I already own a domain (Namecheap, Cloudflare, etc.)"
    echo "2) I want to purchase through Vercel"
    echo "3) Skip for now"
    read -p "Enter choice (1, 2, or 3): " domain_choice

    case $domain_choice in
        1)
            read -p "Enter your domain (e.g., soulseed.com): " domain_name

            print_info "Adding domain to Vercel..."
            vercel domains add "$domain_name"

            print_info "Vercel will show DNS records to add to your registrar:"
            print_info "1. Go to your domain registrar (Namecheap, etc.)"
            print_info "2. Add the DNS records shown above"
            print_info "3. Wait 5-60 minutes for propagation"
            print_info "4. Verify: vercel domains verify $domain_name"

            read -p "Press Enter when you've added DNS records..."

            print_info "Verifying domain..."
            if vercel domains verify "$domain_name"; then
                print_success "Domain verified! ✅"
                print_success "Your site is live at: https://$domain_name"
            else
                print_warning "Domain not yet verified. This is normal."
                print_info "Wait a few minutes and run: vercel domains verify $domain_name"
            fi
            ;;
        2)
            print_info "Opening Vercel Dashboard to purchase domain..."
            print_info "Go to: Domains → Register Domain"
            vercel dashboard
            read -p "Press Enter when done..."
            ;;
        3)
            print_info "Skipping domain setup"
            ;;
    esac
fi

# Step 8: Post-deployment checklist
print_header "Step 8: Post-Deployment Checklist"

print_info "Your app is deployed! Here's what to check:"
echo ""
echo "✓ Test your deployment URL"
echo "✓ Verify all features work (auth, Firebase, etc.)"
echo "✓ Update Google OAuth redirect URIs (if using custom domain)"
echo "✓ Update Firebase authorized domains (if using custom domain)"
echo "✓ Run Lighthouse audit for performance"
echo "✓ Test on mobile devices"
echo ""

# Final summary
print_header "🎉 Deployment Complete!"

echo "Your SoulSeed app is now live!"
echo ""
echo "📊 Deployment Info:"
vercel ls | head -5
echo ""
echo "🔗 Quick Links:"
echo "   • Vercel Dashboard: https://vercel.com/dashboard"
echo "   • View Logs: vercel logs"
echo "   • Domain Setup: vercel domains"
echo ""
echo "📚 Documentation:"
echo "   • Full Guide: VERCEL_DEPLOYMENT_GUIDE.md"
echo "   • Troubleshooting: See guide above"
echo ""

print_success "All done! 🚀"
echo ""

# Optional: Open deployment in browser
read -p "Open deployment in browser? (y/n): " open_browser
if [ "$open_browser" = "y" ]; then
    # Get the latest deployment URL
    DEPLOY_URL=$(vercel ls --json | grep -o '"url":"[^"]*"' | head -1 | cut -d'"' -f4)

    if [ -n "$DEPLOY_URL" ]; then
        print_info "Opening https://$DEPLOY_URL"

        # Try different methods for Termux
        if command -v termux-open-url &> /dev/null; then
            termux-open-url "https://$DEPLOY_URL"
        elif command -v xdg-open &> /dev/null; then
            xdg-open "https://$DEPLOY_URL"
        else
            print_info "Please open manually: https://$DEPLOY_URL"
        fi
    fi
fi

echo ""
print_info "Thanks for using SoulSeed deployment script!"
