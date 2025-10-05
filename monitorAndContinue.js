const fs = require('fs');
const { spawn } = require('child_process');

const FIRST_PROGRESS_FILE = 'first10999_progress.json';
const CHECK_INTERVAL = 30000; // Check every 30 seconds

console.log('============================================================');
console.log('ENRICHMENT MONITOR');
console.log('Watching for completion of first 10,999 names');
console.log('Will automatically start next 90,000 when ready');
console.log('============================================================\n');

function checkProgress() {
  try {
    if (!fs.existsSync(FIRST_PROGRESS_FILE)) {
      console.log('Progress file not found, waiting...');
      return false;
    }

    const progress = JSON.parse(fs.readFileSync(FIRST_PROGRESS_FILE, 'utf8'));
    const total = progress.totalProcessed + progress.totalErrors;

    console.log(`[${new Date().toLocaleTimeString()}] Progress: ${total}/10999 names (${(total/10999*100).toFixed(1)}%)`);
    console.log(`  - Processed: ${progress.totalProcessed}`);
    console.log(`  - Errors: ${progress.totalErrors}`);

    // Check if complete (allowing for a few names that might error out)
    if (total >= 10990) {
      console.log('\n✅ First 10,999 names complete!');
      return true;
    }

    // Also check if it's stuck (no update for 10 minutes)
    const lastUpdate = new Date(progress.lastUpdate);
    const timeSinceUpdate = Date.now() - lastUpdate.getTime();
    if (timeSinceUpdate > 600000) {
      console.log('\n⚠️ Process seems stuck (no update for 10 minutes)');
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
  console.log('\n🚀 Starting enrichment of next 90,000 names...\n');

  const child = spawn('node', ['processNext90000.js'], {
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
      process.exit(0);
    }, 5000);
  }

  // Safety check - don't run forever
  if (checkCount > 720) { // 6 hours
    console.log('\n⏰ Monitor timeout reached (6 hours). Exiting.');
    clearInterval(monitor);
    process.exit(0);
  }
}, CHECK_INTERVAL);

console.log(`Monitoring every ${CHECK_INTERVAL/1000} seconds...`);
console.log('Press Ctrl+C to stop monitoring.\n');