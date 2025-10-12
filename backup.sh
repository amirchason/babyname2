#!/bin/bash
# Quick Backup Script for BabyNames App
# Usage: ./backup.sh

BACKUP_DIR="/storage/emulated/0/Download/backupapp"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="babyname2-backup-${TIMESTAMP}.tar.gz"

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

# Create backup
echo "Creating backup..."
tar -czf "${BACKUP_DIR}/${BACKUP_FILE}" \
  --exclude='node_modules' \
  --exclude='.git' \
  --exclude='build' \
  --exclude='*.log' \
  --exclude='*.tar.gz' \
  .

# Check if backup was successful
if [ $? -eq 0 ]; then
  SIZE=$(ls -lh "${BACKUP_DIR}/${BACKUP_FILE}" | awk '{print $5}')
  echo "✅ Backup successful!"
  echo "📁 Location: ${BACKUP_DIR}/${BACKUP_FILE}"
  echo "📦 Size: ${SIZE}"
else
  echo "❌ Backup failed!"
  exit 1
fi
