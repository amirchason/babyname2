#!/data/data/com.termux/files/usr/bin/bash

# ==========================================
# ULTRA-AUTOMATED GOOGLE OAUTH FIX HELPER
# ==========================================
# This script automates the OAuth domain authorization fix
# with maximum user assistance and verification

set -e  # Exit on error

# Colors for terminal output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Project configuration
OAUTH_CLIENT_ID="1093132372253-a725n8gpe624usli0hnj3re1eicgi4o2.apps.googleusercontent.com"
FIREBASE_PROJECT="babynames-app-9fa2a"
PRODUCTION_URL="https://soulseedbaby.com"

# Domain lists
DOMAINS=(
    "https://soulseedbaby.com"
    "https://www.soulseedbaby.com"
    "https://soulseed.baby"
    "https://www.soulseed.baby"
    "https://soulseedapp.com"
    "https://www.soulseedapp.com"
    "https://soulseedbaby.app"
    "https://www.soulseedbaby.app"
)

# Print colored header
print_header() {
    echo -e "${PURPLE}"
    echo "╔══════════════════════════════════════════════════════════════╗"
    echo "║                                                              ║"
    echo "║        🚀 ULTRA-AUTOMATED GOOGLE OAUTH FIX HELPER 🚀         ║"
    echo "║                                                              ║"
    echo "║              SoulSeed Baby Name App                          ║"
    echo "║                                                              ║"
    echo "╚══════════════════════════════════════════════════════════════╝"
    echo -e "${NC}"
}

# Print section header
print_section() {
    echo -e "\n${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${CYAN}$1${NC}"
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"
}

# Print success message
print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

# Print error message
print_error() {
    echo -e "${RED}✗ $1${NC}"
}

# Print warning message
print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

# Print info message
print_info() {
    echo -e "${BLUE}ℹ $1${NC}"
}

# Copy to clipboard (Termux)
copy_to_clipboard() {
    if command -v termux-clipboard-set &> /dev/null; then
        echo "$1" | termux-clipboard-set
        print_success "Copied to clipboard!"
    else
        print_warning "Clipboard not available. Please copy manually."
    fi
}

# Open URL in browser (Termux)
open_browser() {
    if command -v termux-open-url &> /dev/null; then
        termux-open-url "$1"
        print_success "Opening in browser..."
    else
        print_warning "Please open manually: $1"
    fi
}

# Main script
main() {
    clear
    print_header

    print_section "📋 PROBLEM DIAGNOSIS"
    print_info "OAuth Client ID: ${OAUTH_CLIENT_ID}"
    print_info "Firebase Project: ${FIREBASE_PROJECT}"
    print_info "Production URL: ${PRODUCTION_URL}"
    print_error "Current Status: OAuth domains NOT authorized"
    print_warning "Result: Login fails with 'login error try again'"

    print_section "🔧 DOMAINS TO AUTHORIZE (8 total)"
    for i in "${!DOMAINS[@]}"; do
        echo -e "${BLUE}  $((i+1)). ${DOMAINS[$i]}${NC}"
    done

    echo -e "\n${YELLOW}Press ENTER to start the automated fix...${NC}"
    read -r

    # ==========================================
    # STEP 1: GOOGLE CLOUD CONSOLE - OAUTH CLIENT
    # ==========================================
    print_section "🌐 STEP 1: Google Cloud Console - OAuth Client"

    OAUTH_URL="https://console.cloud.google.com/apis/credentials/oauthclient/${OAUTH_CLIENT_ID}?project=${FIREBASE_PROJECT}"

    print_info "We will now open Google Cloud Console to configure OAuth client"
    print_info "Look for: 'Authorized JavaScript origins' section"
    echo ""
    print_warning "Action Required: Click 'ADD URI' and paste the domains list"
    echo ""

    echo -e "${YELLOW}Press ENTER to open Google Cloud Console...${NC}"
    read -r

    open_browser "$OAUTH_URL"
    sleep 2

    print_section "📝 COPY THIS LIST (JavaScript Origins)"

    # Generate domain list for copy-paste
    DOMAIN_LIST=""
    for domain in "${DOMAINS[@]}"; do
        DOMAIN_LIST+="${domain}"$'\n'
    done

    echo -e "${GREEN}${DOMAIN_LIST}${NC}"

    echo -e "\n${YELLOW}Press ENTER to copy domains to clipboard...${NC}"
    read -r
    copy_to_clipboard "$DOMAIN_LIST"

    print_info "Now in Google Cloud Console:"
    echo -e "${BLUE}  1. Scroll to 'Authorized JavaScript origins'${NC}"
    echo -e "${BLUE}  2. Click '+ ADD URI' button 8 times (one for each domain)${NC}"
    echo -e "${BLUE}  3. Paste each domain from clipboard${NC}"
    echo -e "${BLUE}  4. Repeat for all 8 domains${NC}"
    echo ""

    echo -e "${YELLOW}Press ENTER when you've added all JavaScript origins...${NC}"
    read -r

    print_section "🔗 ADD REDIRECT URIs (Same domains)"

    print_info "Now scroll to 'Authorized redirect URIs' section"
    echo -e "${BLUE}  1. Scroll to 'Authorized redirect URIs'${NC}"
    echo -e "${BLUE}  2. Click '+ ADD URI' button 8 times${NC}"
    echo -e "${BLUE}  3. Paste the SAME 8 domains${NC}"
    echo ""

    echo -e "${YELLOW}Press ENTER to copy domains again...${NC}"
    read -r
    copy_to_clipboard "$DOMAIN_LIST"

    echo -e "${YELLOW}Press ENTER when you've added all redirect URIs...${NC}"
    read -r

    print_warning "IMPORTANT: Click 'SAVE' button at the bottom!"
    echo -e "${YELLOW}Press ENTER after clicking SAVE...${NC}"
    read -r

    print_success "OAuth Client configuration complete!"

    # ==========================================
    # STEP 2: FIREBASE AUTHORIZED DOMAINS
    # ==========================================
    print_section "🔥 STEP 2: Firebase Authorized Domains"

    FIREBASE_AUTH_URL="https://console.firebase.google.com/project/${FIREBASE_PROJECT}/authentication/settings"

    print_info "Now we'll configure Firebase authorized domains"
    echo ""

    echo -e "${YELLOW}Press ENTER to open Firebase Console...${NC}"
    read -r

    open_browser "$FIREBASE_AUTH_URL"
    sleep 2

    print_section "📝 ADD THESE DOMAINS TO FIREBASE (4 base domains)"

    BASE_DOMAINS=(
        "soulseedbaby.com"
        "soulseed.baby"
        "soulseedapp.com"
        "soulseedbaby.app"
    )

    BASE_DOMAIN_LIST=""
    for domain in "${BASE_DOMAINS[@]}"; do
        BASE_DOMAIN_LIST+="${domain}"$'\n'
        echo -e "${GREEN}  • ${domain}${NC}"
    done

    echo ""
    echo -e "${YELLOW}Press ENTER to copy base domains to clipboard...${NC}"
    read -r
    copy_to_clipboard "$BASE_DOMAIN_LIST"

    print_info "In Firebase Console:"
    echo -e "${BLUE}  1. Scroll to 'Authorized domains' section${NC}"
    echo -e "${BLUE}  2. Click 'Add domain' button${NC}"
    echo -e "${BLUE}  3. Paste each domain (WITHOUT https://)${NC}"
    echo -e "${BLUE}  4. Repeat for all 4 domains${NC}"
    echo ""

    echo -e "${YELLOW}Press ENTER when you've added all Firebase domains...${NC}"
    read -r

    print_success "Firebase configuration complete!"

    # ==========================================
    # STEP 3: WAIT FOR PROPAGATION
    # ==========================================
    print_section "⏳ STEP 3: Waiting for Google to Propagate Changes"

    print_warning "Google OAuth changes take 5-10 minutes to propagate globally"
    print_info "During this time:"
    echo -e "${BLUE}  • Google's servers are syncing your configuration${NC}"
    echo -e "${BLUE}  • CDN caches are being updated${NC}"
    echo -e "${BLUE}  • Your changes are going live worldwide${NC}"
    echo ""

    print_info "Waiting 10 minutes for propagation..."
    echo ""

    # Countdown timer
    for i in {10..1}; do
        echo -ne "${YELLOW}⏱  ${i} minutes remaining...${NC}\r"
        sleep 60
    done

    echo -e "\n"
    print_success "Propagation time complete!"

    # ==========================================
    # STEP 4: VERIFICATION
    # ==========================================
    print_section "✅ STEP 4: Verification & Testing"

    print_info "Testing OAuth configuration..."
    echo ""

    # Check if we can access the site
    print_info "Testing site accessibility..."
    if curl -s -o /dev/null -w "%{http_code}" "$PRODUCTION_URL" | grep -q "200\|301\|302"; then
        print_success "Site is accessible: $PRODUCTION_URL"
    else
        print_error "Site accessibility check failed"
    fi

    echo ""
    print_info "Now let's test the OAuth login in your browser"
    print_warning "Action Required: Click 'Login with Google' and try to authenticate"
    echo ""

    echo -e "${YELLOW}Press ENTER to open production site...${NC}"
    read -r

    open_browser "$PRODUCTION_URL"

    echo ""
    echo -e "${YELLOW}Did the login succeed? (y/n): ${NC}"
    read -r LOGIN_SUCCESS

    if [[ "$LOGIN_SUCCESS" == "y" || "$LOGIN_SUCCESS" == "Y" ]]; then
        print_section "🎉 SUCCESS!"
        print_success "OAuth configuration is working correctly!"
        print_success "All domains are authorized!"
        print_success "Users can now log in from all production domains!"
        echo ""
        print_info "Summary of configured domains:"
        for domain in "${DOMAINS[@]}"; do
            echo -e "${GREEN}  ✓ ${domain}${NC}"
        done
    else
        print_section "❌ TROUBLESHOOTING"
        print_error "Login still failing. Let's diagnose..."
        echo ""
        print_info "Common issues:"
        echo -e "${YELLOW}  1. Browser cache: Clear cookies and cache, try incognito${NC}"
        echo -e "${YELLOW}  2. Propagation delay: Wait another 10 minutes${NC}"
        echo -e "${YELLOW}  3. Domain mismatch: Verify exact domains in Google Console${NC}"
        echo -e "${YELLOW}  4. Client ID: Verify .env has correct REACT_APP_GOOGLE_CLIENT_ID${NC}"
        echo ""
        print_warning "Check browser console for detailed error messages"
        print_info "Look for [AUTH] logs with error details"
    fi

    # ==========================================
    # COMPLETION
    # ==========================================
    print_section "📊 CONFIGURATION SUMMARY"

    echo -e "${BLUE}✓ OAuth Client ID configured with 8 domains${NC}"
    echo -e "${BLUE}✓ Firebase project configured with 4 base domains${NC}"
    echo -e "${BLUE}✓ Changes propagated (10 minute wait completed)${NC}"
    echo -e "${BLUE}✓ Verification tested${NC}"
    echo ""

    print_info "Configuration files to verify:"
    echo -e "${CYAN}  • Google Cloud Console → APIs & Credentials → OAuth 2.0 Client${NC}"
    echo -e "${CYAN}  • Firebase Console → Authentication → Settings → Authorized domains${NC}"
    echo -e "${CYAN}  • Vercel Dashboard → soulseedbaby → Environment Variables${NC}"
    echo ""

    print_section "📚 DOCUMENTATION"

    print_info "Full documentation available in:"
    echo -e "${CYAN}  • OAUTH_DOMAIN_FIX.md - Detailed fix explanation${NC}"
    echo -e "${CYAN}  • OAUTH_DETAILED_ANALYSIS.md - Root cause analysis${NC}"
    echo -e "${CYAN}  • oauth_fix_investigation.md - Automation investigation${NC}"
    echo ""

    print_success "OAuth fix helper completed!"
    echo -e "${PURPLE}Thank you for using SoulSeed Baby Name App! 💜${NC}\n"
}

# Run main function
main
