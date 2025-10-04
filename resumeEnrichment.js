#!/usr/bin/env node
const fs = require('fs');
const { spawn } = require('child_process');
const path = require('path');

// Paths
const MASTER_STATE_PATH = 'enrichment_logs/master_state.json';

console.log('============================================================');
console.log('NAME ENRICHMENT RESUME TOOL');
console.log('============================================================\n');

// Check if master state exists
if (!fs.existsSync(MASTER_STATE_PATH)) {
  console.log('❌ No enrichment in progress found.');
  console.log('   Master state file does not exist.\n');
  console.log('To start fresh enrichment, run: node masterEnrichment.js');
  process.exit(1);
}

// Load and display current state
try {
  const masterState = JSON.parse(fs.readFileSync(MASTER_STATE_PATH, 'utf8'));

  console.log('📊 Current Enrichment Status:');
  console.log('─────────────────────────────');
  console.log(`Status: ${masterState.status}`);
  console.log(`Total processed: ${masterState.totalNamesProcessed} names`);
  console.log(`Total errors: ${masterState.totalErrors}`);
  console.log(`Estimated cost so far: $${masterState.estimatedCost?.toFixed(2) || '0.00'}`);
  console.log(`Current chunk: ${masterState.currentChunk}`);
  console.log(`Last update: ${masterState.lastUpdate || 'Unknown'}\n`);

  // Show chunk progress
  console.log('📦 Chunk Progress:');
  for (let i = 1; i <= 4; i++) {
    if (masterState.chunks[i]) {
      const chunk = masterState.chunks[i];
      const total = chunk.total || 'Unknown';
      const processed = chunk.processed || 0;
      const percentage = total !== 'Unknown' && total > 0
        ? ((processed / total) * 100).toFixed(1)
        : '?';
      console.log(`  Chunk ${i}: ${processed}/${total} (${percentage}%)`);
    }
  }

  console.log();

  // Check if already completed
  if (masterState.status === 'completed') {
    console.log('✅ Enrichment already completed!');
    console.log('   All names have been processed.');
    process.exit(0);
  }

  // Check if already running
  const isRunning = checkIfRunning();
  if (isRunning) {
    console.log('⚠️  Enrichment is already running!');
    console.log('   Check logs at: enrichment_logs/');
    console.log('\nTo monitor progress:');
    console.log('   tail -f enrichment_logs/session_*.log');
    process.exit(0);
  }

  // Start enrichment
  console.log('🚀 Starting enrichment from last checkpoint...\n');

  const child = spawn('node', ['masterEnrichment.js'], {
    stdio: 'inherit',
    detached: true
  });

  child.on('error', (error) => {
    console.error('❌ Failed to start enrichment:', error.message);
    process.exit(1);
  });

  child.unref();

  console.log('✅ Enrichment started in background!');
  console.log('\nMonitor progress:');
  console.log('  tail -f enrichment_logs/session_*.log');
  console.log('\nView latest report:');
  console.log('  ls -lt enrichment_logs/progress_reports/ | head -2');
  console.log('\nCheck status:');
  console.log('  node resumeEnrichment.js');

  // Give child process time to start
  setTimeout(() => {
    process.exit(0);
  }, 2000);

} catch (error) {
  console.error('❌ Error reading master state:', error.message);
  process.exit(1);
}

function checkIfRunning() {
  try {
    // Check if there's a node process running masterEnrichment.js
    const { execSync } = require('child_process');
    const result = execSync('ps aux | grep -v grep | grep "node masterEnrichment.js"', {
      encoding: 'utf8',
      stdio: 'pipe'
    });
    return result.trim().length > 0;
  } catch (e) {
    return false;
  }
}