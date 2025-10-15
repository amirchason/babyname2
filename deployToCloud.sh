#!/bin/bash

###############################################################################
# Deploy USA 2024 Enrichment to Cloud
#
# This script packages the necessary files for cloud processing
###############################################################################

echo "============================================================"
echo "DEPLOY USA 2024 ENRICHMENT TO CLOUD"
echo "============================================================"
echo ""

# Set backup directory
BACKUP_DIR="/storage/emulated/0/Download/clouddeployment"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
PACKAGE_NAME="usa2024-enrichment-${TIMESTAMP}.tar.gz"

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

echo "📦 Creating cloud deployment package..."
echo "   Package: $PACKAGE_NAME"
echo "   Location: $BACKUP_DIR"
echo ""

# Create tarball with only necessary files
tar -czf "${BACKUP_DIR}/${PACKAGE_NAME}" \
  --exclude='node_modules' \
  --exclude='.git' \
  --exclude='build' \
  --exclude='*.log' \
  --exclude='*.backup*' \
  addTop5000USA2024.js \
  fetchSSAData2024.js \
  USA_2024_ENRICHMENT_README.md \
  package.json \
  .env \
  public/data/names-chunk1.json \
  public/data/names-chunk2.json \
  public/data/names-chunk3.json \
  public/data/names-chunk4.json \
  2>/dev/null

if [ $? -eq 0 ]; then
  echo "✅ Package created successfully!"
  echo ""
  echo "📊 Package details:"
  ls -lh "${BACKUP_DIR}/${PACKAGE_NAME}"
  echo ""
  echo "============================================================"
  echo "NEXT STEPS - DEPLOY TO CLOUD"
  echo "============================================================"
  echo ""
  echo "Option 1: Upload to VPS/Cloud Server"
  echo "   scp ${BACKUP_DIR}/${PACKAGE_NAME} user@server.com:~/"
  echo "   ssh user@server.com"
  echo "   tar -xzf ${PACKAGE_NAME}"
  echo "   npm install openai axios dotenv"
  echo "   node addTop5000USA2024.js"
  echo ""
  echo "Option 2: Use GitHub Actions"
  echo "   1. Add OPENAI_API_KEY to GitHub Secrets"
  echo "   2. Create .github/workflows/enrich-names.yml (see README)"
  echo "   3. Trigger workflow from Actions tab"
  echo ""
  echo "Option 3: Firebase Cloud Functions"
  echo "   firebase deploy --only functions"
  echo ""
  echo "📄 Full instructions: USA_2024_ENRICHMENT_README.md"
  echo "============================================================"
else
  echo "❌ Error creating package!"
  exit 1
fi
