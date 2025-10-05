const fs = require('fs');

const REFRESH_INTERVAL = 5000; // 5 seconds

function formatNumber(num) {
  return num.toLocaleString();
}

function clearScreen() {
  console.log('\x1Bc'); // Clear console
}

function getChunkStats() {
  const stats = [];

  for (let i = 1; i <= 4; i++) {
    try {
      const chunkPath = `public/data/names-chunk${i}.json`;
      if (!fs.existsSync(chunkPath)) continue;

      const data = JSON.parse(fs.readFileSync(chunkPath, 'utf8'));
      const names = data.names || data;
      const total = names.length;
      const withMeaning = names.filter(n => n.meaning && n.meaning !== 'Unknown' && n.meaning !== '').length;
      const withOrigin = names.filter(n => n.origin && n.origin !== 'Unknown' && n.origin !== '').length;

      stats.push({
        chunk: i,
        total,
        withMeaning,
        withOrigin,
        meaningPercent: (withMeaning / total * 100).toFixed(1),
        originPercent: (withOrigin / total * 100).toFixed(1)
      });
    } catch (e) {
      // Skip
    }
  }

  return stats;
}

function getProgressFiles() {
  const files = [
    'master_enrichment_progress.json',
    'first10999_progress.json',
    'mini_enrichment_progress.json',
    'unknown_origins_progress.json'
  ];

  const progress = [];

  files.forEach(file => {
    if (fs.existsSync(file)) {
      try {
        const data = JSON.parse(fs.readFileSync(file, 'utf8'));
        const lastUpdate = new Date(data.lastUpdate);
        const timeSinceUpdate = Date.now() - lastUpdate.getTime();
        const minutesAgo = Math.floor(timeSinceUpdate / 60000);

        progress.push({
          file: file.replace('_progress.json', '').replace(/_/g, ' '),
          processed: data.totalProcessed || 0,
          errors: data.totalErrors || 0,
          cost: data.estimatedCost ? `$${data.estimatedCost.toFixed(3)}` : 'N/A',
          lastUpdate: minutesAgo < 1 ? 'Just now' : `${minutesAgo}m ago`,
          isActive: timeSinceUpdate < 60000 // Active if updated in last minute
        });
      } catch (e) {
        // Skip
      }
    }
  });

  return progress;
}

function getRecentLogs() {
  const logFiles = [
    'master_enrichment_output.log',
    'enrichment_resume.log',
    'master_enrichment.log'
  ];

  for (const file of logFiles) {
    if (fs.existsSync(file)) {
      try {
        const content = fs.readFileSync(file, 'utf8');
        const lines = content.split('\n').filter(l => l.trim());
        return lines.slice(-5);
      } catch (e) {
        // Skip
      }
    }
  }

  return ['No recent logs found'];
}

function displayDashboard() {
  clearScreen();

  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║         BABYNAMES ENRICHMENT MONITOR v1.0                  ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');

  // Chunk statistics
  console.log('📊 CHUNK ENRICHMENT STATUS:\n');
  const chunkStats = getChunkStats();
  let totalNames = 0;
  let totalEnriched = 0;

  chunkStats.forEach(stat => {
    const bar = '█'.repeat(Math.floor(stat.meaningPercent / 2)) + '░'.repeat(50 - Math.floor(stat.meaningPercent / 2));
    console.log(`Chunk ${stat.chunk}: [${bar}] ${stat.meaningPercent}%`);
    console.log(`  ${formatNumber(stat.withMeaning)} / ${formatNumber(stat.total)} names enriched\n`);

    totalNames += stat.total;
    totalEnriched += stat.withMeaning;
  });

  const overallPercent = (totalEnriched / totalNames * 100).toFixed(1);
  console.log(`🎯 OVERALL: ${formatNumber(totalEnriched)} / ${formatNumber(totalNames)} (${overallPercent}%)\n`);

  console.log('─'.repeat(60) + '\n');

  // Progress files
  console.log('🔄 ACTIVE ENRICHMENT PROCESSES:\n');
  const progressFiles = getProgressFiles();

  if (progressFiles.length === 0) {
    console.log('  No active processes found\n');
  } else {
    progressFiles.forEach(p => {
      const status = p.isActive ? '🟢 ACTIVE' : '⚪ IDLE';
      console.log(`${status} ${p.file}`);
      console.log(`  Processed: ${formatNumber(p.processed)} | Errors: ${formatNumber(p.errors)} | Cost: ${p.cost}`);
      console.log(`  Last update: ${p.lastUpdate}\n`);
    });
  }

  console.log('─'.repeat(60) + '\n');

  // Recent logs
  console.log('📝 RECENT ACTIVITY:\n');
  const recentLogs = getRecentLogs();
  recentLogs.forEach(log => {
    const shortLog = log.substring(0, 100);
    console.log(`  ${shortLog}`);
  });

  console.log('\n' + '─'.repeat(60));
  console.log(`Refreshing every ${REFRESH_INTERVAL/1000}s... Press Ctrl+C to exit`);
}

// Main loop
console.log('Starting enrichment monitor...\n');

displayDashboard();
setInterval(displayDashboard, REFRESH_INTERVAL);

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n\n👋 Monitor stopped. Enrichment continues in background.');
  process.exit(0);
});
