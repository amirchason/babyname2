#!/data/data/com.termux/files/usr/bin/bash

# Watch enrichment status every 5 minutes

echo "🔄 Starting enrichment monitor (updates every 5 minutes)"
echo "Press Ctrl+C to stop"
echo ""

while true; do
    clear
    echo "═══════════════════════════════════════════════════════════"
    echo "  BABYNAMES ENRICHMENT STATUS - $(date '+%Y-%m-%d %H:%M:%S')"
    echo "═══════════════════════════════════════════════════════════"
    echo ""

    # Run status check
    node checkEnrichmentStatus.js

    echo ""
    echo "═══════════════════════════════════════════════════════════"

    # Check if process is still running
    if ps aux | grep -q "[m]asterEnrichment.js"; then
        echo "✅ Enrichment process: RUNNING"

        # Show last 3 log lines
        echo ""
        echo "📝 Recent activity:"
        tail -3 master_enrichment_output.log 2>/dev/null | sed 's/^/   /'
    else
        echo "⚠️  Enrichment process: STOPPED"
        echo ""
        echo "To resume: nohup node masterEnrichment.js > master_enrichment_output.log 2>&1 &"
    fi

    echo ""
    echo "═══════════════════════════════════════════════════════════"
    echo "Next update in 5 minutes... (Ctrl+C to stop)"
    echo ""

    # Wait 5 minutes (300 seconds)
    sleep 300
done
