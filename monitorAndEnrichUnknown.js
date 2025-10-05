const fs = require('fs');
const { spawn } = require('child_process');

const MINI_PROGRESS_FILE = 'mini_enrichment_progress.json';
const CHECK_INTERVAL = 10000; // Check every 10 seconds

console.log('============================================================');
console.log('UNKNOWN ORIGINS ENRICHMENT MONITOR');
console.log('Waiting for current batch to complete');
console.log('Will then enrich 720 unknown origin names');
console.log('============================================================\n');

function checkProgress() {
  try {
    if (!fs.existsSync(MINI_PROGRESS_FILE)) {
      return false;
    }

    const progress = JSON.parse(fs.readFileSync(MINI_PROGRESS_FILE, 'utf8'));
    const total = progress.totalProcessed + progress.totalErrors;

    console.log(`[${new Date().toLocaleTimeString()}] Current batch: ${total}/2416 names (${(total/2416*100).toFixed(1)}%)`);

    // Check if the current batch is complete
    if (total >= 2410) {
      console.log('\n✅ Current batch complete!');
      return true;
    }

    return false;
  } catch (error) {
    console.error('Error checking progress:', error.message);
    return false;
  }
}

function startUnknownEnrichment() {
  console.log('\n🔍 Starting enrichment of unknown origin names...\n');
  console.log('This will:');
  console.log('  • Make educated guesses based on linguistic patterns');
  console.log('  • Categorize codes, typos, and modern inventions');
  console.log('  • Add internal flags (not shown in UI)');
  console.log('  • Be precise and avoid hallucination\n');

  const child = spawn('node', ['enrichUnknownOrigins.js'], {
    stdio: 'inherit'
  });

  child.on('error', (error) => {
    console.error('Failed to start enrichment:', error);
  });

  child.on('exit', (code) => {
    if (code === 0) {
      console.log('✅ Unknown origins enrichment completed successfully!');
    } else {
      console.log(`⚠️ Process exited with code ${code}`);
    }
    process.exit(0);
  });
}

// Main monitoring loop
let checkCount = 0;
const monitor = setInterval(() => {
  checkCount++;

  if (checkProgress()) {
    clearInterval(monitor);

    // Wait a moment for files to be saved
    setTimeout(() => {
      startUnknownEnrichment();
    }, 3000);
  }

  // Safety timeout
  if (checkCount > 180) { // 30 minutes
    console.log('\n⏰ Monitor timeout reached. Starting enrichment anyway...');
    clearInterval(monitor);
    startUnknownEnrichment();
  }
}, CHECK_INTERVAL);

console.log(`Monitoring every ${CHECK_INTERVAL/1000} seconds...`);
console.log('Unknown origin enrichment will start automatically when ready.\n');