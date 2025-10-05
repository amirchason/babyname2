const fs = require('fs');
const path = require('path');

const ENRICHMENT_LOG = path.join(__dirname, 'enrichment.log');
const ALERT_INTERVAL = 20 * 60 * 1000; // 20 minutes in milliseconds
const STUCK_THRESHOLD = 10 * 60 * 1000; // Consider stuck if no activity for 10 minutes

let lastAlertTime = 0;
let lastLogSize = 0;
let lastActivityTime = Date.now();

function checkEnrichmentStatus() {
  try {
    if (!fs.existsSync(ENRICHMENT_LOG)) {
      console.log('⚠️ No enrichment log found. Enrichment may not be running.');
      return;
    }

    const stats = fs.statSync(ENRICHMENT_LOG);
    const currentSize = stats.size;
    const now = Date.now();

    // Check if file is growing (indicating activity)
    if (currentSize > lastLogSize) {
      lastActivityTime = now;
      lastLogSize = currentSize;
      return; // Enrichment is active
    }

    // Check if stuck (no activity for STUCK_THRESHOLD)
    const timeSinceActivity = now - lastActivityTime;
    if (timeSinceActivity > STUCK_THRESHOLD) {
      // Check if we should send alert (every 20 minutes)
      if (now - lastAlertTime >= ALERT_INTERVAL) {
        sendStuckAlert(timeSinceActivity);
        lastAlertTime = now;
      }
    }
  } catch (error) {
    console.error('Error checking enrichment status:', error.message);
  }
}

function sendStuckAlert(stuckDuration) {
  const minutes = Math.floor(stuckDuration / 60000);
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  console.log('\n');
  console.log('═══════════════════════════════════════════════════════════');
  console.log('🚨 ENRICHMENT STUCK ALERT 🚨');
  console.log('═══════════════════════════════════════════════════════════');
  console.log(`⏰ Time stuck: ${hours}h ${remainingMinutes}m`);
  console.log(`📅 Last activity: ${new Date(lastActivityTime).toLocaleString()}`);
  console.log('');
  console.log('❌ ENRICHMENT HAS STOPPED AND NEEDS MANUAL INTERVENTION');
  console.log('');
  console.log('Possible causes:');
  console.log('  - JSON parsing error in data chunk');
  console.log('  - API rate limit exceeded');
  console.log('  - Process crashed or terminated');
  console.log('  - Network connectivity issue');
  console.log('');
  console.log('Action required: Please check enrichment.log for errors');
  console.log('═══════════════════════════════════════════════════════════');
  console.log('\n');

  // Also check the log for recent errors
  try {
    const logContent = fs.readFileSync(ENRICHMENT_LOG, 'utf8');
    const lines = logContent.split('\n');
    const errorLines = lines.filter(line => line.includes('[ERROR]')).slice(-5);

    if (errorLines.length > 0) {
      console.log('📋 Recent errors from log:');
      errorLines.forEach(line => console.log('   ' + line));
      console.log('');
    }
  } catch (err) {
    // Ignore errors reading log details
  }
}

console.log('🔍 Starting enrichment stuck monitor...');
console.log('   Alert interval: 20 minutes');
console.log('   Stuck threshold: 10 minutes of inactivity');
console.log('   Press Ctrl+C to stop');
console.log('');

// Check every minute
setInterval(checkEnrichmentStatus, 60 * 1000);

// Initial check
checkEnrichmentStatus();
