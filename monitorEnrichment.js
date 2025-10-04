#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

// Configuration
const REPORT_INTERVAL = 300000; // 5 minutes
const MASTER_STATE_PATH = 'enrichment_logs/master_state.json';

let previousState = null;
let startTime = Date.now();

function loadMasterState() {
  try {
    if (fs.existsSync(MASTER_STATE_PATH)) {
      return JSON.parse(fs.readFileSync(MASTER_STATE_PATH, 'utf8'));
    }
  } catch (error) {
    console.error('Error loading master state:', error.message);
  }
  return null;
}

function generateReport() {
  const currentState = loadMasterState();
  if (!currentState) {
    console.log('⚠️ Unable to load master state');
    return;
  }

  const now = new Date();
  console.log('\n============================================================');
  console.log(`📊 ENRICHMENT PROGRESS REPORT - ${now.toLocaleString()}`);
  console.log('============================================================');

  // Calculate progress since last report
  let intervalProcessed = 0;
  let intervalErrors = 0;

  if (previousState) {
    intervalProcessed = currentState.totalNamesProcessed - previousState.totalNamesProcessed;
    intervalErrors = currentState.totalErrors - previousState.totalErrors;
  }

  // Overall stats
  console.log('\n📈 Overall Progress:');
  console.log(`   Total processed: ${currentState.totalNamesProcessed} names`);
  console.log(`   Total errors: ${currentState.totalErrors}`);
  console.log(`   Status: ${currentState.status}`);
  console.log(`   Current chunk: ${currentState.currentChunk}`);
  console.log(`   Total cost: $${currentState.estimatedCost?.toFixed(3) || '0.000'}`);

  // Interval stats
  if (previousState) {
    console.log('\n📊 Last 5 Minutes:');
    console.log(`   Names processed: ${intervalProcessed}`);
    console.log(`   Errors: ${intervalErrors}`);
    console.log(`   Processing rate: ${(intervalProcessed / 5).toFixed(1)} names/minute`);
    console.log(`   Cost added: $${(intervalProcessed * 0.00005).toFixed(3)}`);
  }

  // Chunk details
  console.log('\n📦 Chunk Status:');
  for (let i = 1; i <= 4; i++) {
    if (currentState.chunks[i]) {
      const chunk = currentState.chunks[i];
      const total = chunk.total || 'Unknown';
      const processed = chunk.processed || 0;
      const errors = chunk.errors || 0;
      const percentage = total !== 'Unknown' && total !== null && total > 0
        ? ((processed / total) * 100).toFixed(1)
        : '?';

      const status = i < currentState.currentChunk ? '✅' :
                    i === currentState.currentChunk ? '⏳' : '⏸️';

      console.log(`   ${status} Chunk ${i}: ${processed}/${total} (${percentage}%) - ${errors} errors`);
    }
  }

  // Estimate remaining time
  if (intervalProcessed > 0) {
    const rate = intervalProcessed / 5; // per minute
    let totalRemaining = 0;

    // Calculate remaining
    for (let i = 1; i <= 4; i++) {
      if (currentState.chunks[i]) {
        const chunk = currentState.chunks[i];
        if (chunk.total && chunk.total !== 'Unknown') {
          const remaining = Math.max(0, chunk.total - (chunk.processed || 0));
          totalRemaining += remaining;
        }
      }
    }

    // Add error retries if not done
    if (!currentState.errorsRetried) {
      totalRemaining += currentState.totalErrors;
    }

    if (totalRemaining > 0) {
      const minutesRemaining = totalRemaining / rate;
      const hoursRemaining = (minutesRemaining / 60).toFixed(1);
      console.log(`\n⏰ Estimated Time Remaining: ${hoursRemaining} hours (${totalRemaining} names)`);
    }
  }

  // Check if completed
  if (currentState.status === 'completed') {
    console.log('\n✅ ENRICHMENT COMPLETED!');
    console.log(`   Final count: ${currentState.totalNamesProcessed} names`);
    console.log(`   Final cost: $${currentState.estimatedCost?.toFixed(2)}`);
    console.log('\n🎉 All done! Exiting monitor.');
    process.exit(0);
  }

  // Save report to file
  const reportDir = 'enrichment_logs/progress_reports';
  if (!fs.existsSync(reportDir)) {
    fs.mkdirSync(reportDir, { recursive: true });
  }

  const reportPath = path.join(reportDir, `report_${Date.now()}.txt`);
  const reportContent = `
Progress Report - ${now.toISOString()}
=====================================
Total Processed: ${currentState.totalNamesProcessed}
Total Errors: ${currentState.totalErrors}
Interval Processed: ${intervalProcessed}
Current Chunk: ${currentState.currentChunk}
Status: ${currentState.status}
Cost: $${currentState.estimatedCost?.toFixed(3)}
`;
  fs.writeFileSync(reportPath, reportContent);

  console.log(`\n📁 Report saved to: ${reportPath}`);
  console.log('============================================================\n');

  // Update previous state for next interval
  previousState = JSON.parse(JSON.stringify(currentState));
}

// Check if enrichment is running
function checkIfRunning() {
  try {
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

// Main monitoring loop
console.log('🔍 Starting enrichment monitor...');
console.log('   Reports every 5 minutes');
console.log('   Press Ctrl+C to stop\n');

// Generate initial report
generateReport();

// Set up interval
const interval = setInterval(() => {
  // Check if enrichment is still running
  if (!checkIfRunning()) {
    console.log('⚠️ Enrichment process not running!');
    console.log('   Run "node resumeEnrichment.js" to restart');

    // Check if completed
    const state = loadMasterState();
    if (state && state.status === 'completed') {
      console.log('✅ Enrichment completed successfully!');
      clearInterval(interval);
      process.exit(0);
    }
  }

  generateReport();
}, REPORT_INTERVAL);

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n👋 Stopping monitor...');
  clearInterval(interval);
  process.exit(0);
});