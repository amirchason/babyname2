#!/usr/bin/env node
/**
 * ENRICHMENT AGENT - Automated Name Enrichment Management System
 *
 * Simple commands for managing the entire enrichment process:
 * - start: Begin enrichment from scratch
 * - resume: Continue from last checkpoint
 * - status: Show current progress
 * - stop: Stop enrichment gracefully
 * - monitor: Watch real-time progress
 * - report: Generate detailed report
 * - auto: Fully automated mode (starts/resumes as needed)
 */

require('dotenv').config();
const fs = require('fs');
const { spawn, execSync } = require('child_process');
const path = require('path');

// Configuration
const MASTER_STATE_PATH = 'enrichment_logs/master_state.json';
const ERRORS_LOG_PATH = 'enrichment_logs/errors.json';

// Command line argument
const command = process.argv[2] || 'auto';

// Color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function header() {
  console.clear();
  log('╔════════════════════════════════════════════════════════╗', 'cyan');
  log('║         🤖 ENRICHMENT AGENT - AI Name Processor        ║', 'cyan');
  log('╚════════════════════════════════════════════════════════╝', 'cyan');
  console.log();
}

// Check if OpenAI API key is configured
function checkAPIKey() {
  if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'YOUR_OPENAI_API_KEY_HERE') {
    log('❌ OpenAI API key not configured!', 'red');
    log('   Please add your API key to .env file', 'yellow');
    return false;
  }
  return true;
}

// Initialize enrichment system
function initializeEnrichment() {
  log('🔧 Initializing enrichment system...', 'yellow');

  // Create directories
  if (!fs.existsSync('enrichment_logs')) {
    fs.mkdirSync('enrichment_logs', { recursive: true });
  }
  if (!fs.existsSync('enrichment_logs/progress_reports')) {
    fs.mkdirSync('enrichment_logs/progress_reports', { recursive: true });
  }

  // Create initial master state if doesn't exist
  if (!fs.existsSync(MASTER_STATE_PATH)) {
    const initialState = {
      status: 'initialized',
      currentChunk: 1,
      totalNamesProcessed: 0,
      totalErrors: 0,
      errorNames: [],
      errorsRetried: false,
      lastCheckpoint: {
        chunk: 1,
        index: 0,
        timestamp: new Date().toISOString()
      },
      chunks: {
        1: { total: null, processed: 0, errors: 0 },
        2: { total: null, processed: 0, errors: 0 },
        3: { total: null, processed: 0, errors: 0 },
        4: { total: null, processed: 0, errors: 0 }
      },
      model: 'gpt-4o-mini',
      estimatedCost: 0,
      sessions: []
    };
    fs.writeFileSync(MASTER_STATE_PATH, JSON.stringify(initialState, null, 2));
    log('✅ Created initial master state', 'green');
  }
}

// Get current status
function getStatus() {
  if (!fs.existsSync(MASTER_STATE_PATH)) {
    return null;
  }
  return JSON.parse(fs.readFileSync(MASTER_STATE_PATH, 'utf8'));
}

// Check if enrichment is running
function isRunning() {
  try {
    const result = execSync('ps aux | grep -v grep | grep "node masterEnrichment.js"', {
      encoding: 'utf8',
      stdio: 'pipe'
    });
    return result.trim().length > 0;
  } catch (e) {
    return false;
  }
}

// Display status
function showStatus() {
  const state = getStatus();
  if (!state) {
    log('❌ No enrichment data found', 'red');
    return;
  }

  const running = isRunning();

  log('📊 ENRICHMENT STATUS', 'bright');
  log('═══════════════════════════════════════════', 'cyan');

  // Overall status
  const statusColor = running ? 'green' :
                     state.status === 'completed' ? 'green' :
                     'yellow';
  log(`Status: ${state.status} ${running ? '(RUNNING)' : '(STOPPED)'}`, statusColor);

  // Progress
  log(`\n📈 Progress:`, 'bright');
  log(`   Total processed: ${state.totalNamesProcessed} names`);
  log(`   Total errors: ${state.totalErrors}`);
  log(`   Current chunk: ${state.currentChunk}/4`);
  log(`   Cost so far: $${state.estimatedCost?.toFixed(3) || '0.000'}`);

  // Chunk details
  log(`\n📦 Chunks:`, 'bright');
  let totalRemaining = 0;
  for (let i = 1; i <= 4; i++) {
    if (state.chunks[i]) {
      const chunk = state.chunks[i];
      const total = chunk.total || '?';
      const processed = chunk.processed || 0;
      const percentage = chunk.total ? ((processed / chunk.total) * 100).toFixed(1) : '?';

      const icon = i < state.currentChunk ? '✅' :
                   i === state.currentChunk ? '⏳' : '⏸️';

      log(`   ${icon} Chunk ${i}: ${processed}/${total} (${percentage}%)`);

      if (chunk.total) {
        totalRemaining += Math.max(0, chunk.total - processed);
      }
    }
  }

  // Add error retries
  if (!state.errorsRetried && state.totalErrors > 0) {
    totalRemaining += state.totalErrors;
  }

  // Time estimate
  if (totalRemaining > 0) {
    const minutesEstimate = (totalRemaining * 0.15) / 60; // ~0.15s per name
    const hoursEstimate = (minutesEstimate / 60).toFixed(1);
    log(`\n⏰ Estimated time remaining: ${hoursEstimate} hours (${totalRemaining} names)`, 'yellow');
  }

  if (state.status === 'completed') {
    log(`\n✅ ENRICHMENT COMPLETED!`, 'green');
  }
}

// Start enrichment
async function startEnrichment(resume = false) {
  if (!checkAPIKey()) return;

  const running = isRunning();
  if (running) {
    log('⚠️  Enrichment is already running!', 'yellow');
    return;
  }

  initializeEnrichment();

  log(`🚀 ${resume ? 'Resuming' : 'Starting'} enrichment...`, 'green');

  const child = spawn('node', ['masterEnrichment.js'], {
    stdio: 'inherit',
    detached: true
  });

  child.on('error', (error) => {
    log(`❌ Failed to start: ${error.message}`, 'red');
  });

  child.unref();

  log('✅ Enrichment started successfully!', 'green');
  log('\n📁 Logs: enrichment_logs/session_*.log', 'cyan');
  log('📊 Monitor: node enrichmentAgent.js monitor', 'cyan');
}

// Stop enrichment
function stopEnrichment() {
  const running = isRunning();
  if (!running) {
    log('ℹ️  No enrichment process is running', 'blue');
    return;
  }

  try {
    execSync('pkill -f "node masterEnrichment.js"', { stdio: 'pipe' });
    log('✅ Enrichment stopped', 'green');
  } catch (e) {
    log('❌ Failed to stop enrichment', 'red');
  }
}

// Monitor enrichment
function monitorEnrichment() {
  if (!isRunning()) {
    log('⚠️  No enrichment running. Starting monitor anyway...', 'yellow');
  }

  log('🔍 Starting live monitor...', 'green');
  log('   Press Ctrl+C to stop\n', 'cyan');

  const monitor = spawn('node', ['monitorEnrichment.js'], {
    stdio: 'inherit'
  });

  monitor.on('exit', () => {
    log('\n👋 Monitor stopped', 'yellow');
  });
}

// Generate report
function generateReport() {
  const state = getStatus();
  if (!state) {
    log('❌ No enrichment data found', 'red');
    return;
  }

  const timestamp = new Date().toISOString();
  const report = `
ENRICHMENT REPORT
Generated: ${timestamp}
════════════════════════════════════════════

STATUS OVERVIEW
─────────────────
Status: ${state.status}
Running: ${isRunning() ? 'Yes' : 'No'}
Total Processed: ${state.totalNamesProcessed} names
Total Errors: ${state.totalErrors}
Total Cost: $${state.estimatedCost?.toFixed(2) || '0.00'}
Model: ${state.model}

CHUNK BREAKDOWN
─────────────────
${[1, 2, 3, 4].map(i => {
  const c = state.chunks[i];
  return `Chunk ${i}: ${c.processed}/${c.total || '?'} (${c.errors} errors)`;
}).join('\n')}

LAST CHECKPOINT
─────────────────
Chunk: ${state.lastCheckpoint.chunk}
Index: ${state.lastCheckpoint.index}
Time: ${state.lastCheckpoint.timestamp}

${state.status === 'completed' ? '✅ ENRICHMENT COMPLETE!' : '⏳ IN PROGRESS...'}
`;

  const reportPath = `enrichment_logs/progress_reports/report_${Date.now()}.txt`;
  fs.writeFileSync(reportPath, report);

  log('📄 ENRICHMENT REPORT', 'bright');
  console.log(report);
  log(`\n📁 Report saved to: ${reportPath}`, 'green');
}

// Auto mode - intelligent decision making
async function autoMode() {
  header();

  log('🤖 AUTO MODE ACTIVATED', 'magenta');
  log('   Analyzing enrichment state...\n', 'cyan');

  if (!checkAPIKey()) {
    log('Please configure OpenAI API key first', 'red');
    return;
  }

  initializeEnrichment();
  const state = getStatus();
  const running = isRunning();

  if (running) {
    log('✅ Enrichment is already running', 'green');
    showStatus();
    log('\n📊 Monitoring progress...', 'cyan');
    monitorEnrichment();
  } else if (!state || state.totalNamesProcessed === 0) {
    log('🆕 Starting fresh enrichment...', 'yellow');
    await startEnrichment(false);
    setTimeout(() => {
      showStatus();
      log('\n📊 Starting monitor...', 'cyan');
      monitorEnrichment();
    }, 3000);
  } else if (state.status === 'completed') {
    log('✅ Enrichment already completed!', 'green');
    showStatus();
  } else {
    log('📂 Found previous progress, resuming...', 'yellow');
    await startEnrichment(true);
    setTimeout(() => {
      showStatus();
      log('\n📊 Starting monitor...', 'cyan');
      monitorEnrichment();
    }, 3000);
  }
}

// Show help
function showHelp() {
  header();

  log('📚 AVAILABLE COMMANDS:', 'bright');
  log('═══════════════════════════════════════════\n', 'cyan');

  const commands = [
    { cmd: 'auto', desc: 'Intelligent mode - automatically starts/resumes as needed (DEFAULT)' },
    { cmd: 'start', desc: 'Start enrichment from beginning' },
    { cmd: 'resume', desc: 'Resume from last checkpoint' },
    { cmd: 'status', desc: 'Show current progress and statistics' },
    { cmd: 'stop', desc: 'Stop enrichment gracefully' },
    { cmd: 'monitor', desc: 'Watch real-time progress (updates every 5 min)' },
    { cmd: 'report', desc: 'Generate detailed progress report' },
    { cmd: 'help', desc: 'Show this help message' }
  ];

  commands.forEach(({ cmd, desc }) => {
    log(`  ${cmd.padEnd(10)} - ${desc}`, 'yellow');
  });

  log('\n📝 USAGE EXAMPLES:', 'bright');
  log('═══════════════════════════════════════════\n', 'cyan');

  log('  node enrichmentAgent.js           # Auto mode (recommended)', 'green');
  log('  node enrichmentAgent.js status    # Check progress', 'green');
  log('  node enrichmentAgent.js resume    # Continue enrichment', 'green');
  log('  node enrichmentAgent.js monitor   # Watch live progress', 'green');

  log('\n💡 QUICK TIPS:', 'bright');
  log('═══════════════════════════════════════════\n', 'cyan');

  log('  • Use "auto" mode for hands-free operation', 'blue');
  log('  • Enrichment is fully resumable - safe to stop anytime', 'blue');
  log('  • Progress saved after each batch (10 names)', 'blue');
  log('  • Reports generated every 5 minutes', 'blue');
  log('  • Cost: ~$0.05 per 1000 names with GPT-4o-mini', 'blue');
}

// Main execution
async function main() {
  switch (command.toLowerCase()) {
    case 'start':
      header();
      await startEnrichment(false);
      break;

    case 'resume':
      header();
      await startEnrichment(true);
      break;

    case 'status':
      header();
      showStatus();
      break;

    case 'stop':
      header();
      stopEnrichment();
      break;

    case 'monitor':
      header();
      monitorEnrichment();
      break;

    case 'report':
      header();
      generateReport();
      break;

    case 'auto':
      await autoMode();
      break;

    case 'help':
    case '--help':
    case '-h':
      showHelp();
      break;

    default:
      header();
      log(`❌ Unknown command: ${command}`, 'red');
      log('   Use "help" to see available commands\n', 'yellow');
      showHelp();
  }
}

// Handle errors
process.on('uncaughtException', (error) => {
  log(`\n❌ Error: ${error.message}`, 'red');
  process.exit(1);
});

// Run the agent
main().catch(error => {
  log(`\n❌ Fatal error: ${error.message}`, 'red');
  process.exit(1);
});