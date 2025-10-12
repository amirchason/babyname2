#!/bin/bash

# Simple enrichment progress monitor

echo "🔍 Enrichment Progress Monitor"
echo "======================================"
echo ""

while true; do
  echo "⏰ $(date '+%H:%M:%S')"
  
  # Check if running
  if pgrep -f "node enrich-all-names.js" > /dev/null; then
    echo "✅ Status: RUNNING"
  else
    echo "⚠️  Status: STOPPED"
  fi
  
  # Show latest progress
  if [ -f enrichment.log ]; then
    echo ""
    tail -100 enrichment.log | grep "Progress:" | tail -1
    tail -50 enrichment.log | grep "Batch" | tail -1
  fi
  
  echo "======================================"
  echo ""
  sleep 300  # Wait 5 minutes
done
