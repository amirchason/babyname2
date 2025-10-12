/**
 * Enrichment Status Monitor
 * Shows enrichment progress every 5 minutes by checking localStorage
 */

const INTERVAL_MS = 5 * 60 * 1000; // 5 minutes

console.log('🔍 Enrichment Status Monitor Started');
console.log('Will check status every 5 minutes...\n');

function showEnrichmentStatus() {
  console.log('\n' + '='.repeat(60));
  console.log('📊 ENRICHMENT STATUS - ' + new Date().toLocaleTimeString());
  console.log('='.repeat(60));

  try {
    // Get enrichment data from localStorage
    const enrichmentData = localStorage.getItem('nameEnrichment_v2');

    if (!enrichmentData) {
      console.log('❌ No enrichment data found in localStorage');
      console.log('   Service may not have started yet.');
      return;
    }

    const data = JSON.parse(enrichmentData);
    const names = Object.values(data);

    if (names.length === 0) {
      console.log('⚠️  No names in enrichment cache');
      return;
    }

    // Calculate statistics
    const total = names.length;
    const enriched = names.filter(n => n.enriched && n.meaning && n.origin).length;
    const pending = total - enriched;
    const percentage = ((enriched / total) * 100).toFixed(1);

    // Get recent enrichments (last 5 minutes)
    const fiveMinutesAgo = new Date(Date.now() - INTERVAL_MS);
    const recent = names.filter(n => {
      if (!n.enrichedAt) return false;
      const enrichedDate = new Date(n.enrichedAt);
      return enrichedDate > fiveMinutesAgo;
    });

    // Display statistics
    console.log(`\n📈 Progress:`);
    console.log(`   Total Names:      ${total.toLocaleString()}`);
    console.log(`   Enriched:         ${enriched.toLocaleString()} (${percentage}%)`);
    console.log(`   Pending:          ${pending.toLocaleString()}`);
    console.log(`   Recent (5min):    ${recent.length}`);

    if (recent.length > 0) {
      const rate = recent.length / 5; // names per minute
      console.log(`   Processing Rate:  ~${rate.toFixed(1)} names/min`);

      if (pending > 0) {
        const eta = pending / rate;
        console.log(`   ETA (remaining):  ~${eta.toFixed(0)} minutes`);
      }
    }

    // Show some recent enrichments
    if (recent.length > 0) {
      console.log(`\n✨ Recently Enriched (last 3):`);
      recent.slice(-3).forEach(n => {
        console.log(`   ${n.name}: "${n.meaning}" (${n.origin})`);
      });
    }

    // Show origins distribution (top 5)
    const originCounts = {};
    names.forEach(n => {
      if (n.origin) {
        originCounts[n.origin] = (originCounts[n.origin] || 0) + 1;
      }
    });

    const topOrigins = Object.entries(originCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    if (topOrigins.length > 0) {
      console.log(`\n🌍 Top Origins:`);
      topOrigins.forEach(([origin, count]) => {
        const percent = ((count / enriched) * 100).toFixed(1);
        console.log(`   ${origin}: ${count} (${percent}%)`);
      });
    }

  } catch (error) {
    console.error('❌ Error reading enrichment data:', error.message);
  }

  console.log('\n' + '='.repeat(60) + '\n');
}

// Show initial status
showEnrichmentStatus();

// Set up interval to check every 5 minutes
setInterval(showEnrichmentStatus, INTERVAL_MS);

console.log('⏰ Monitoring active. Press Ctrl+C to stop.\n');
