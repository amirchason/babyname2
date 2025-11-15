/**
 * TOP 5000 ENRICHMENT + AUTO-DEPLOY
 *
 * Enriches top 5000 baby names in batches of 1000
 * Deploys to Vercel after each batch via git push
 *
 * Usage: node enrichTop5000.js
 */

const { spawn, execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Configuration
const CONFIG = {
  BATCH_SIZE: 1000,
  TOTAL_BATCHES: 5,
  ENRICHMENT_SCRIPT: path.join(__dirname, 'enrichV13CloudParallel.js'),
  CHECKPOINT_FILE: path.join(__dirname, 'v13Checkpoint.json'),
  PROGRESS_FILE: path.join(__dirname, 'top5000Progress.json'),
};

// Utilities
const log = (message, type = 'info') => {
  const timestamp = new Date().toISOString();
  const prefix = {
    info: '📝',
    success: '✅',
    error: '❌',
    warning: '⚠️',
    progress: '⏳',
    deploy: '🚀',
  }[type] || '📝';

  console.log(`[${timestamp}] ${prefix} ${message}`);
};

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Load/save progress
const loadProgress = () => {
  if (fs.existsSync(CONFIG.PROGRESS_FILE)) {
    try {
      return JSON.parse(fs.readFileSync(CONFIG.PROGRESS_FILE, 'utf-8'));
    } catch (error) {
      log(`Failed to load progress: ${error.message}`, 'warning');
    }
  }
  return { lastCompletedBatch: -1, startedAt: new Date().toISOString() };
};

const saveProgress = (progress) => {
  fs.writeFileSync(CONFIG.PROGRESS_FILE, JSON.stringify(progress, null, 2));
};

// Modify enrichment script config for batch processing
const setupBatchEnrichment = (batchNum) => {
  const scriptPath = CONFIG.ENRICHMENT_SCRIPT;
  let scriptContent = fs.readFileSync(scriptPath, 'utf-8');

  const startRank = (batchNum * CONFIG.BATCH_SIZE) + 1;
  const endRank = (batchNum + 1) * CONFIG.BATCH_SIZE;

  // Replace TOP_N_NAMES config
  scriptContent = scriptContent.replace(
    /TOP_N_NAMES:\s*\d+/,
    `TOP_N_NAMES: ${endRank}`
  );

  // Create temp script
  const tempScript = path.join(__dirname, `enrichBatch${batchNum}.js`);
  fs.writeFileSync(tempScript, scriptContent);

  log(`Batch ${batchNum + 1}: Will process ranks ${startRank}-${endRank}`, 'info');
  return tempScript;
};

// Run enrichment for a batch
const runEnrichment = (batchScript) => {
  return new Promise((resolve, reject) => {
    log('Starting enrichment process...', 'progress');

    const process = spawn('node', [batchScript], {
      stdio: 'inherit',
      cwd: path.dirname(batchScript)
    });

    process.on('close', (code) => {
      if (code === 0) {
        log('Enrichment completed successfully', 'success');
        resolve();
      } else {
        reject(new Error(`Enrichment failed with code ${code}`));
      }
    });

    process.on('error', (error) => {
      reject(error);
    });
  });
};

// Deploy to Vercel via git push
const deployToVercel = async (batchNum) => {
  const startRank = (batchNum * CONFIG.BATCH_SIZE) + 1;
  const endRank = (batchNum + 1) * CONFIG.BATCH_SIZE;
  const commitMessage = `feat: Enrich batch ${batchNum + 1} - names ${startRank}-${endRank} 🤖`;

  try {
    log('Adding enriched files to git...', 'progress');
    execSync('git add public/data/enriched/*.json', { stdio: 'inherit' });

    log(`Committing batch ${batchNum + 1}...`, 'progress');
    execSync(`git commit -m "${commitMessage}"`, { stdio: 'inherit' });

    log('Pushing to GitHub (triggers Vercel deployment)...', 'deploy');
    execSync('git push origin master', { stdio: 'inherit' });

    log(`✅ Batch ${batchNum + 1} deployed! (Names ${startRank}-${endRank})`, 'success');
    log('Vercel is building... (check https://soulseedbaby.com)', 'info');

    // Wait 30 seconds for Vercel to start deploying
    await sleep(30000);

  } catch (error) {
    log(`Deployment failed: ${error.message}`, 'error');
    throw error;
  }
};

// Main execution
const main = async () => {
  log('🚀 STARTING TOP 5000 ENRICHMENT + AUTO-DEPLOY', 'success');
  log(`Processing ${CONFIG.TOTAL_BATCHES} batches of ${CONFIG.BATCH_SIZE} names each`, 'info');
  log('', 'info');

  const progress = loadProgress();
  const startBatch = progress.lastCompletedBatch + 1;

  if (startBatch > 0) {
    log(`Resuming from batch ${startBatch + 1} (batches 1-${startBatch} already completed)`, 'warning');
  }

  for (let batch = startBatch; batch < CONFIG.TOTAL_BATCHES; batch++) {
    const batchNum = batch + 1;
    log('', 'info');
    log(`========================================`, 'info');
    log(`BATCH ${batchNum}/${CONFIG.TOTAL_BATCHES}`, 'success');
    log(`========================================`, 'info');

    try {
      // Setup batch enrichment
      const batchScript = setupBatchEnrichment(batch);

      // Run enrichment
      await runEnrichment(batchScript);

      // Deploy to Vercel
      await deployToVercel(batch);

      // Update progress
      progress.lastCompletedBatch = batch;
      progress.lastUpdated = new Date().toISOString();
      saveProgress(progress);

      // Cleanup temp script
      fs.unlinkSync(batchScript);

      log(`Batch ${batchNum} COMPLETE! ✅`, 'success');

      if (batch < CONFIG.TOTAL_BATCHES - 1) {
        log('Waiting 60 seconds before next batch...', 'info');
        await sleep(60000);
      }

    } catch (error) {
      log(`Batch ${batchNum} FAILED: ${error.message}`, 'error');
      log('You can resume by running this script again', 'warning');
      process.exit(1);
    }
  }

  log('', 'info');
  log('🎉 ALL 5 BATCHES COMPLETED!', 'success');
  log(`Total names enriched: ${CONFIG.TOTAL_BATCHES * CONFIG.BATCH_SIZE}`, 'success');
  log('Check https://soulseedbaby.com for the live site!', 'deploy');
};

// Run
main().catch((error) => {
  log(`Fatal error: ${error.message}`, 'error');
  process.exit(1);
});
