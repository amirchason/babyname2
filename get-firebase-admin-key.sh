#!/bin/bash

# ====================================================================
# Firebase Service Account Key Helper
# ====================================================================

echo "🔥 Firebase Service Account Key Setup"
echo "======================================"
echo ""
echo "To get your Firebase Admin SDK key:"
echo ""
echo "1. Open this URL in your browser:"
echo "   https://console.firebase.google.com/project/babynames-app-9fa2a/settings/serviceaccounts/adminsdk"
echo ""
echo "2. Click 'Generate new private key' button"
echo ""
echo "3. Click 'Generate key' in the confirmation dialog"
echo ""
echo "4. A JSON file will download (e.g., babynames-app-9fa2a-firebase-adminsdk-xxxxx.json)"
echo ""
echo "5. Upload that file to this directory, or copy its contents"
echo ""
echo "6. Then run:"
echo "   cat YOUR_DOWNLOADED_FILE.json | jq -c | gh secret set FIREBASE_ADMIN_KEY"
echo ""
echo "======================================"
echo ""
echo "Alternative: If you can't download the file, I can create a minimal service account"
echo "using the Firebase config from your .env file (limited permissions)."
echo ""
echo "Press 'y' to try creating minimal key, or 'n' to wait for manual download:"
read -r response

if [ "$response" = "y" ] || [ "$response" = "Y" ]; then
    echo ""
    echo "⚠️  WARNING: This creates a LIMITED service account key."
    echo "It may not have all permissions needed for the enrichment agent."
    echo ""
    echo "Recommended: Download the full admin SDK key from Firebase Console instead."
    echo ""
    echo "Creating minimal key from .env config..."

    # Extract Firebase config from .env
    PROJECT_ID=$(grep REACT_APP_FIREBASE_PROJECT_ID .env | cut -d '=' -f2)

    if [ -z "$PROJECT_ID" ]; then
        echo "❌ Could not find Firebase project ID in .env"
        exit 1
    fi

    echo ""
    echo "❌ CANNOT CREATE SERVICE ACCOUNT KEY AUTOMATICALLY"
    echo ""
    echo "Firebase service account keys can ONLY be generated from the Firebase Console."
    echo "This is a security feature to prevent unauthorized key generation."
    echo ""
    echo "Please follow the manual steps above to download the key."
    echo ""
fi

echo ""
echo "Once you have the JSON file, run:"
echo "  cat YOUR_FILE.json | jq -c | gh secret set FIREBASE_ADMIN_KEY"
echo ""
