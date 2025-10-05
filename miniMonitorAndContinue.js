const fs = require('fs');
const { spawn } = require('child_process');

const MINI_PROGRESS_FILE = 'mini_enrichment_progress.json';
const CHECK_INTERVAL = 10000; // Check every 10 seconds

console.log('============================================================');
console.log('GPT-4O-MINI ENRICHMENT MONITOR');
console.log('Watching for completion of failed names');
console.log('Will automatically start next 90,000 when ready');
console.log('============================================================\n');

function checkProgress() {
  try {
    if (!fs.existsSync(MINI_PROGRESS_FILE)) {
      console.log('Progress file not found, waiting...');
      return false;
    }

    const progress = JSON.parse(fs.readFileSync(MINI_PROGRESS_FILE, 'utf8'));
    const total = progress.totalProcessed + progress.totalErrors;

    console.log(`[${new Date().toLocaleTimeString()}] Progress: ${total}/2416 names (${(total/2416*100).toFixed(1)}%)`);
    console.log(`  - Processed: ${progress.totalProcessed}`);
    console.log(`  - Errors: ${progress.totalErrors}`);
    console.log(`  - Cost so far: $${progress.estimatedCost.toFixed(3)}`);

    // Check if complete (allowing for a few names that might error out)
    if (total >= 2410) {
      console.log('\n✅ Failed names enrichment complete!');
      return true;
    }

    // Also check if it's stuck (no update for 5 minutes)
    const lastUpdate = new Date(progress.lastUpdate);
    const timeSinceUpdate = Date.now() - lastUpdate.getTime();
    if (timeSinceUpdate > 300000) {
      console.log('\n⚠️ Process seems stuck (no update for 5 minutes)');
      console.log('Starting next batch anyway...');
      return true;
    }

    return false;
  } catch (error) {
    console.error('Error checking progress:', error.message);
    return false;
  }
}

function startNextBatch() {
  console.log('\n🚀 Starting enrichment of next 90,000 names with GPT-4o-mini...\n');

  const child = spawn('node', ['processNext90000WithMini.js'], {
    stdio: 'inherit',
    detached: true
  });

  child.on('error', (error) => {
    console.error('Failed to start next batch:', error);
  });

  child.on('exit', (code) => {
    if (code === 0) {
      console.log('✅ Next 90,000 names processing started successfully!');
    } else {
      console.log(`⚠️ Process exited with code ${code}`);
    }
  });

  // Allow the parent process to exit while child continues
  child.unref();
}

// Main monitoring loop
let checkCount = 0;
const monitor = setInterval(() => {
  checkCount++;

  if (checkProgress()) {
    clearInterval(monitor);
    startNextBatch();

    // Exit after starting the next batch
    setTimeout(() => {
      console.log('\nMonitor exiting. Next batch is running in background.');
      console.log('Run "tail -f mini_enrichment_progress.json" to watch progress');
      process.exit(0);
    }, 5000);
  }

  // Safety check - don't run forever
  if (checkCount > 360) { // 1 hour
    console.log('\n⏰ Monitor timeout reached (1 hour). Exiting.');
    clearInterval(monitor);
    process.exit(0);
  }
}, CHECK_INTERVAL);

console.log(`Monitoring every ${CHECK_INTERVAL/1000} seconds...`);
console.log('Press Ctrl+C to stop monitoring.\n');