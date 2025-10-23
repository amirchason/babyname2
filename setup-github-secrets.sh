#!/bin/bash

# ====================================================================
# GitHub Secrets Setup Script for Name Enrichment Agent
# ====================================================================

echo "🔐 GitHub Secrets Setup for Name Enrichment Agent"
echo "=================================================="
echo ""

# Check if gh CLI is installed
if ! command -v gh &> /dev/null; then
    echo "❌ GitHub CLI (gh) is not installed."
    echo ""
    echo "Install with: pkg install gh"
    echo "Then authenticate: gh auth login"
    echo ""
    exit 1
fi

# Check if authenticated
if ! gh auth status &> /dev/null; then
    echo "❌ Not authenticated with GitHub CLI."
    echo ""
    echo "Run: gh auth login"
    echo ""
    exit 1
fi

echo "✅ GitHub CLI is installed and authenticated"
echo ""

# ====================================================================
# SECRET 1: GEMINI_API_KEY
# ====================================================================

echo "📝 Setting up SECRET 1: GEMINI_API_KEY"
echo "--------------------------------------"

# Extract from .env file
GEMINI_KEY=$(grep REACT_APP_GEMINI_API_KEY .env | cut -d '=' -f2)

if [ -z "$GEMINI_KEY" ]; then
    echo "❌ Could not find GEMINI_API_KEY in .env file"
    exit 1
fi

echo "Found Gemini API key: ${GEMINI_KEY:0:10}... (${#GEMINI_KEY} characters)"
echo ""
echo "Adding to GitHub secrets..."

# Add secret to GitHub
echo "$GEMINI_KEY" | gh secret set GEMINI_API_KEY

if [ $? -eq 0 ]; then
    echo "✅ GEMINI_API_KEY added successfully"
else
    echo "❌ Failed to add GEMINI_API_KEY"
    exit 1
fi

echo ""

# ====================================================================
# SECRET 2: FIREBASE_ADMIN_KEY
# ====================================================================

echo "📝 Setting up SECRET 2: FIREBASE_ADMIN_KEY"
echo "------------------------------------------"

# Check if Firebase service account file exists
FIREBASE_KEY_FILE=""

if [ -f "firebase-adminsdk.json" ]; then
    FIREBASE_KEY_FILE="firebase-adminsdk.json"
elif [ -f "babynames-app-9fa2a-firebase-adminsdk.json" ]; then
    FIREBASE_KEY_FILE="babynames-app-9fa2a-firebase-adminsdk.json"
else
    # Search for any firebase admin sdk file
    FIREBASE_KEY_FILE=$(find . -maxdepth 2 -name "*firebase-adminsdk*.json" 2>/dev/null | head -1)
fi

if [ -z "$FIREBASE_KEY_FILE" ] || [ ! -f "$FIREBASE_KEY_FILE" ]; then
    echo "❌ Firebase service account JSON file not found"
    echo ""
    echo "🔴 ACTION REQUIRED: Download Firebase service account key"
    echo ""
    echo "Steps:"
    echo "1. Go to: https://console.firebase.google.com/"
    echo "2. Select project: babynames-app-9fa2a"
    echo "3. Click ⚙️ Settings → Project Settings"
    echo "4. Click 'Service Accounts' tab"
    echo "5. Click 'Generate new private key'"
    echo "6. Download the JSON file"
    echo "7. Save it to this directory as: firebase-adminsdk.json"
    echo ""
    echo "Then run this script again."
    echo ""
    exit 1
fi

echo "Found Firebase service account file: $FIREBASE_KEY_FILE"
echo ""

# Validate JSON
if ! jq empty "$FIREBASE_KEY_FILE" 2>/dev/null; then
    echo "❌ Invalid JSON in $FIREBASE_KEY_FILE"
    exit 1
fi

echo "Adding to GitHub secrets..."

# Add secret to GitHub (as single-line JSON)
cat "$FIREBASE_KEY_FILE" | jq -c | gh secret set FIREBASE_ADMIN_KEY

if [ $? -eq 0 ]; then
    echo "✅ FIREBASE_ADMIN_KEY added successfully"
else
    echo "❌ Failed to add FIREBASE_ADMIN_KEY"
    exit 1
fi

echo ""

# ====================================================================
# VERIFICATION
# ====================================================================

echo "🔍 Verifying secrets..."
echo "----------------------"

gh secret list

echo ""
echo "======================================================================"
echo "✅ SUCCESS! GitHub secrets configured"
echo "======================================================================"
echo ""
echo "Next steps:"
echo "1. Go to: https://github.com/$(gh repo view --json nameWithOwner -q .nameWithOwner)/actions"
echo "2. Click '🤖 Name Enrichment Agent' workflow"
echo "3. Click 'Run workflow' button"
echo "4. Set max_names to 5 (test with small batch)"
echo "5. Click 'Run workflow' and monitor progress"
echo ""
echo "See ENRICHMENT_AGENT_DEPLOYMENT.md for complete instructions."
echo ""
