#!/usr/bin/env node
const fs = require('fs');

const UPDATE_INTERVAL = 10 * 60 * 1000; // 10 minutes
const MASTER_STATE_PATH = 'enrichment_logs/master_state.json';

let lastProcessed = 0;
let startTime = Date.now();

function formatTime(ms) {
  const hours = Math.floor(ms / 3600000);
  const mins = Math.floor((ms % 3600000) / 60000);
  return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
}

function formatNumber(num) {
  return num.toLocaleString();
}

function getProgressBar(percent, width = 40) {
  const filled = Math.round(width * percent / 100);
  return '█'.repeat(filled) + '░'.repeat(width - filled);
}

function displayUpdate() {
  console.clear();

  const now = new Date();
  console.log('╔════════════════════════════════════════════════════════════════╗');
  console.log('║       LIVE ENRICHMENT MONITOR - Updates Every 10 Minutes      ║');
  console.log('╚════════════════════════════════════════════════════════════════╝\n');
  console.log(`🕐 Current Time: ${now.toLocaleTimeString()}`);
  console.log(`⏱️  Session Duration: ${formatTime(Date.now() - startTime)}\n`);

  if (!fs.existsSync(MASTER_STATE_PATH)) {
    console.log('❌ Master state file not found!\n');
    return;
  }

  try {
    const state = JSON.parse(fs.readFileSync(MASTER_STATE_PATH, 'utf8'));

    // Overall stats
    console.log('📊 OVERALL PROGRESS');
    console.log('━'.repeat(64));

    const totalNames = 146034; // Total across all chunks
    const processed = state.totalNamesProcessed || 0;
    const percent = ((processed / totalNames) * 100).toFixed(1);

    console.log(`Status: ${state.status.toUpperCase()}`);
    console.log(`Progress: ${formatNumber(processed)} / ${formatNumber(totalNames)} (${percent}%)`);
    console.log(`[${getProgressBar(percent)}] ${percent}%\n`);

    console.log(`Errors: ${formatNumber(state.totalErrors || 0)}`);
    console.log(`Estimated Cost: $${(state.estimatedCost || 0).toFixed(2)}`);
    console.log(`Current Chunk: ${state.currentChunk}`);
    console.log(`Last Update: ${new Date(state.lastUpdate).toLocaleTimeString()}\n`);

    // Processing rate
    if (lastProcessed > 0) {
      const rate = (processed - lastProcessed) / (UPDATE_INTERVAL / 60000); // per minute
      const remaining = totalNames - processed;
      const eta = remaining / rate; // minutes

      console.log('📈 PROCESSING STATS');
      console.log('━'.repeat(64));
      console.log(`Rate (last 10min): ${rate.toFixed(1)} names/minute`);
      console.log(`Since last update: +${formatNumber(processed - lastProcessed)} names`);

      if (rate > 0) {
        const etaHours = Math.floor(eta / 60);
        const etaMins = Math.round(eta % 60);

        // Calculate finish time
        const finishTime = new Date(Date.now() + (eta * 60 * 1000));
        const finishTimeStr = finishTime.toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
          hour12: true
        });

        console.log(`Time remaining: ${etaHours}h ${etaMins}m`);
        console.log(`Estimated finish: ${finishTimeStr}\n`);
      } else {
        console.log(`Estimated completion: Unknown (enrichment may be paused)\n`);
      }
    } else {
      console.log('📈 PROCESSING STATS');
      console.log('━'.repeat(64));
      console.log('Calculating rate... (wait for next update)\n');
    }

    lastProcessed = processed;

    // Chunk breakdown
    console.log('📦 CHUNK BREAKDOWN');
    console.log('━'.repeat(64));

    for (let i = 1; i <= 4; i++) {
      if (state.chunks[i]) {
        const chunk = state.chunks[i];
        const total = chunk.total || 0;
        const chunkProcessed = chunk.processed || 0;
        const chunkPercent = total > 0 ? ((chunkProcessed / total) * 100).toFixed(1) : '0.0';

        const status = chunkPercent >= 100 ? '✅' :
                      chunkPercent >= 50 ? '🟡' :
                      chunkPercent > 0 ? '🔵' : '⚪';

        console.log(`${status} Chunk ${i}: ${formatNumber(chunkProcessed)} / ${formatNumber(total)} (${chunkPercent}%)`);
        console.log(`   [${getProgressBar(chunkPercent, 30)}]`);
        if (chunk.errors > 0) {
          console.log(`   ⚠️  Errors: ${chunk.errors}`);
        }
      }
    }

    console.log('\n' + '━'.repeat(64));
    console.log('💡 Next update in 10 minutes... Press Ctrl+C to exit');

    // Check if completed
    if (state.status === 'completed') {
      console.log('\n🎉 ENRICHMENT COMPLETED! 🎉\n');
      console.log('All names have been processed.');
      console.log(`Final count: ${formatNumber(processed)} names`);
      console.log(`Total cost: $${(state.estimatedCost || 0).toFixed(2)}`);
      process.exit(0);
    }

  } catch (error) {
    console.log('❌ Error reading state:', error.message);
  }
}

// Initial display
displayUpdate();

// Update every 10 minutes
const interval = setInterval(displayUpdate, UPDATE_INTERVAL);

// Graceful shutdown
process.on('SIGINT', () => {
  clearInterval(interval);
  console.log('\n\n👋 Monitor stopped. Enrichment continues in background.');
  console.log('\nTo resume monitoring: node liveMonitor.js');
  process.exit(0);
});

process.on('SIGTERM', () => {
  clearInterval(interval);
  process.exit(0);
});
