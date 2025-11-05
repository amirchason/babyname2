#!/usr/bin/env node

/**
 * V13 MASTER ENRICHMENT SYSTEM
 *
 * Cloud-based, resumable enrichment for top 1000 names
 *
 * Features:
 * - Loads existing v6/v7/v8/v10/v11 data if available
 * - Generates missing enrichment data
 * - Combines all into v13 format
 * - Saves state after each name (resumable)
 * - Handles errors gracefully
 * - Works in GitHub Actions or locally
 *
 * Usage:
 *   node scripts/enrich-v13-master.js [batchSize]
 *
 * Examples:
 *   node scripts/enrich-v13-master.js 10    # Process 10 names
 *   node scripts/enrich-v13-master.js 50    # Process 50 names (default)
 *   node scripts/enrich-v13-master.js all   # Process all remaining
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const { getTop1000Names } = require('./get-top-1000-names.js');

// Configuration
const STATE_FILE = path.join(__dirname, '..', 'public', 'data', 'enrichment-state.json');
const ENRICHED_DIR = path.join(__dirname, '..', 'public', 'data', 'enriched');
const MANIFEST_FILE = path.join(ENRICHED_DIR, 'v13-manifest.json');
const LOG_FILE = path.join(__dirname, 'enrich-v13-master.log');

// Get batch size from command line (default 50)
const batchSizeArg = process.argv[2] || '50';
const BATCH_SIZE = batchSizeArg === 'all' ? 999999 : parseInt(batchSizeArg, 10);
const DELAY_MS = 2000; // 2 second delay between API calls
const MAX_RETRIES = 3;

// Logger
function log(message, error = false) {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${message}`;
  console.log(logMessage);
  fs.appendFileSync(LOG_FILE, logMessage + '\n');
  if (error) {
    console.error(logMessage);
  }
}

// Load state
function loadState() {
  if (fs.existsSync(STATE_FILE)) {
    return JSON.parse(fs.readFileSync(STATE_FILE, 'utf-8'));
  }
  return {
    version: '1.0',
    totalNames: 1000,
    targetVersion: 'v13',
    startedAt: new Date().toISOString(),
    lastUpdated: new Date().toISOString(),
    currentBatch: 0,
    batchSize: BATCH_SIZE,
    completed: [],
    inProgress: null,
    failed: {},
    skipped: [],
    stats: {
      completed: 0,
      failed: 0,
      skipped: 0,
      remaining: 1000
    }
  };
}

// Save state
function saveState(state) {
  state.lastUpdated = new Date().toISOString();
  state.stats.remaining = state.totalNames - state.completed.length;
  fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
  log(`💾 State saved: ${state.stats.completed} completed, ${state.stats.remaining} remaining`);
}

// Update manifest
function updateManifest(state) {
  const manifest = {
    version: '1.0',
    lastUpdated: new Date().toISOString(),
    totalEnriched: state.completed.length,
    names: state.completed.sort()
  };
  fs.writeFileSync(MANIFEST_FILE, JSON.stringify(manifest, null, 2));
  log(`📋 Manifest updated: ${manifest.totalEnriched} names`);
}

// Check what versions exist for a name
function checkExistingVersions(name) {
  const versions = {};
  ['v6', 'v7', 'v8', 'v10', 'v11', 'v13'].forEach(v => {
    const filePath = path.join(ENRICHED_DIR, `${name}-${v}.json`);
    versions[v] = fs.existsSync(filePath);
  });
  return versions;
}

// Run v10 enrichment (the heavy lifting)
function runV10Enrichment(name, gender, origin, meaning) {
  try {
    log(`  🔧 Running V10 enrichment for: ${name}`);
    execSync(
      `node scripts/enrich-v10-complete.js ${name} ${gender} "${origin}" "${meaning}"`,
      { stdio: 'pipe', encoding: 'utf-8', timeout: 120000 } // 2 min timeout
    );
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error.message?.substring(0, 200) || 'Unknown error'
    };
  }
}

// Run v11 enrichment (blog content)
function runV11Enrichment(name) {
  try {
    log(`  📝 Running V11 enrichment for: ${name}`);
    execSync(
      `node scripts/enrich-v11-writers.js ${name}`,
      { stdio: 'pipe', encoding: 'utf-8', timeout: 60000 } // 1 min timeout
    );
    return { success: true };
  } catch (error) {
    // V11 is optional, don't fail if it errors
    log(`  ⚠️  V11 enrichment failed (optional): ${error.message?.substring(0, 100)}`);
    return { success: true, warning: 'V11 skipped' };
  }
}

// Generate v13 by merging all versions
function generateV13(name) {
  try {
    log(`  🌟 Generating V13 for: ${name}`);
    execSync(
      `node scripts/generate-v13-super-enriched.js ${name}`,
      { stdio: 'pipe', encoding: 'utf-8', timeout: 30000 } // 30 sec timeout
    );
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error.message?.substring(0, 200) || 'Unknown error'
    };
  }
}

// Sleep function
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Process single name
async function processName(nameObj, state) {
  const name = nameObj.name;

  log(`\n${'='.repeat(70)}`);
  log(`📝 Processing: ${name.toUpperCase()}`);
  log(`   Gender: ${nameObj.gender} | Origin: ${nameObj.origin} | Ranking: ${nameObj.ranking}`);
  log(`${'='.repeat(70)}`);

  // Mark as in progress
  state.inProgress = name;
  saveState(state);

  // Check existing versions
  const versions = checkExistingVersions(name);
  log(`  📊 Existing versions: ${Object.entries(versions).filter(([k,v]) => v).map(([k]) => k).join(', ') || 'none'}`);

  // If v13 already exists, mark as completed and skip
  if (versions.v13) {
    log(`  ✅ V13 already exists for ${name} - SKIPPING`);
    if (!state.completed.includes(name)) {
      state.completed.push(name);
      state.stats.completed++;
    }
    state.inProgress = null;
    saveState(state);
    return { success: true, skipped: true };
  }

  // Generate v10 if missing
  if (!versions.v10) {
    log(`  ⚡ V10 missing - running enrichment...`);
    const result = runV10Enrichment(name, nameObj.gender, nameObj.origin, nameObj.meaning);

    if (!result.success) {
      log(`  ❌ V10 enrichment failed: ${result.error}`, true);

      // Track retry count
      const retryCount = (state.failed[name]?.retries || 0) + 1;
      state.failed[name] = {
        error: result.error,
        retries: retryCount,
        lastAttempt: new Date().toISOString()
      };

      if (retryCount >= MAX_RETRIES) {
        log(`  ⚠️  Max retries reached for ${name} - SKIPPING`, true);
        state.skipped.push(name);
        state.stats.skipped++;
      }

      state.stats.failed++;
      state.inProgress = null;
      saveState(state);
      return { success: false, error: result.error };
    }

    log(`  ✅ V10 enrichment complete`);
    await sleep(DELAY_MS); // Rate limit
  }

  // Generate v11 if missing (optional)
  if (!versions.v11) {
    log(`  📚 V11 missing - running blog enrichment...`);
    await runV11Enrichment(name); // Don't check result, it's optional
    await sleep(DELAY_MS / 2); // Half delay for optional step
  }

  // Generate v13 by combining all versions
  log(`  🎯 Combining all versions into V13...`);
  const v13Result = generateV13(name);

  if (!v13Result.success) {
    log(`  ❌ V13 generation failed: ${v13Result.error}`, true);
    state.failed[name] = {
      error: v13Result.error,
      retries: (state.failed[name]?.retries || 0) + 1,
      lastAttempt: new Date().toISOString()
    };
    state.stats.failed++;
    state.inProgress = null;
    saveState(state);
    return { success: false, error: v13Result.error };
  }

  // Success!
  log(`  ✅ V13 COMPLETE for ${name}!`);

  // Update state
  state.completed.push(name);
  state.stats.completed++;
  state.inProgress = null;

  // Remove from failed if it was there
  if (state.failed[name]) {
    delete state.failed[name];
    state.stats.failed--;
  }

  saveState(state);
  updateManifest(state);

  return { success: true };
}

// Main execution
async function main() {
  log(`\n🚀 V13 MASTER ENRICHMENT SYSTEM STARTING`);
  log(`📦 Batch size: ${BATCH_SIZE === 999999 ? 'ALL' : BATCH_SIZE}`);
  log(`⏱️  Delay between names: ${DELAY_MS}ms\n`);

  // Load state
  const state = loadState();
  log(`📊 Current state: ${state.stats.completed} completed, ${state.stats.failed} failed, ${state.stats.skipped} skipped`);

  // Reset any in-progress (from crash)
  if (state.inProgress) {
    log(`⚠️  Found crashed in-progress name: ${state.inProgress} - resetting`);
    state.inProgress = null;
    saveState(state);
  }

  // Get top 1000 names
  log(`\n📋 Loading top 1000 names...`);
  const allNames = getTop1000Names();
  log(`✅ Loaded ${allNames.length} names`);

  // Filter out completed and skipped
  const remaining = allNames.filter(n =>
    !state.completed.includes(n.name) &&
    !state.skipped.includes(n.name)
  );
  log(`\n🎯 Names remaining: ${remaining.length}`);

  // Filter out failed names that hit max retries
  const toProcess = remaining.filter(n => {
    const failInfo = state.failed[n.name];
    if (!failInfo) return true;
    if (failInfo.retries >= MAX_RETRIES) {
      log(`⚠️  Skipping ${n.name} (max retries: ${failInfo.retries})`);
      if (!state.skipped.includes(n.name)) {
        state.skipped.push(n.name);
        state.stats.skipped++;
      }
      return false;
    }
    return true; // Retry if under max
  });

  const batch = toProcess.slice(0, BATCH_SIZE);
  log(`📦 Processing batch of ${batch.length} names\n`);

  if (batch.length === 0) {
    log(`\n✅ No names to process! All done.`);
    log(`📊 Final stats:`);
    log(`   ✅ Completed: ${state.stats.completed}`);
    log(`   ❌ Failed: ${state.stats.failed}`);
    log(`   ⚠️  Skipped: ${state.stats.skipped}`);
    return;
  }

  // Process each name
  let processed = 0;
  let succeeded = 0;
  let failed = 0;

  for (const nameObj of batch) {
    processed++;

    const startTime = Date.now();
    const result = await processName(nameObj, state);
    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);

    if (result.success) {
      succeeded++;
      if (!result.skipped) {
        log(`  ⏱️  Completed in ${elapsed}s`);
      }
    } else {
      failed++;
    }

    // Progress report
    const pct = ((processed / batch.length) * 100).toFixed(1);
    log(`\n📈 Progress: ${processed}/${batch.length} (${pct}%) | ✅ ${succeeded} | ❌ ${failed}`);

    // Delay before next (except last)
    if (processed < batch.length) {
      log(`⏸️  Waiting ${DELAY_MS}ms before next name...\n`);
      await sleep(DELAY_MS);
    }
  }

  // Final summary
  log(`\n${'='.repeat(70)}`);
  log(`🎉 BATCH COMPLETE!`);
  log(`${'='.repeat(70)}`);
  log(`📊 Batch Results:`);
  log(`   ✅ Succeeded: ${succeeded}`);
  log(`   ❌ Failed: ${failed}`);
  log(`   📦 Processed: ${processed}/${batch.length}`);
  log(`\n📊 Overall Progress:`);
  log(`   ✅ Total Completed: ${state.stats.completed}/1000`);
  log(`   ❌ Total Failed: ${state.stats.failed}`);
  log(`   ⚠️  Total Skipped: ${state.stats.skipped}`);
  log(`   📈 Completion: ${((state.stats.completed / 1000) * 100).toFixed(1)}%`);
  log(`${'='.repeat(70)}\n`);

  if (state.stats.remaining > 0) {
    log(`💡 To continue, run: node scripts/enrich-v13-master.js ${BATCH_SIZE}`);
  } else {
    log(`\n🎊 ALL 1000 NAMES ENRICHED! 🎊\n`);
  }
}

// Run with error handling
main().catch(error => {
  log(`❌ FATAL ERROR: ${error.message}`, true);
  console.error(error);
  process.exit(1);
});
