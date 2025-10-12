#!/bin/bash
# Watch enrichment status - shows stats every 5 minutes

echo "🔍 Starting enrichment status monitor..."
echo "Updates every 5 minutes. Press Ctrl+C to stop."
echo ""

while true; do
    node show-enrichment-status.js
    echo "⏰ Next update in 5 minutes..."
    echo ""
    sleep 300  # 5 minutes
done
