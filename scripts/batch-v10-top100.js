#!/usr/bin/env node

/**
 * BATCH V10 ENRICHMENT - TOP 100 NAMES
 *
 * Process:
 * 1. Get top 100 names from popularNames_cache.json
 * 2. Filter out names that already have V10 data
 * 3. For each name, get origin/meaning from OpenAI
 * 4. Run V10 enrichment script
 * 5. Track progress and save state for resumption
 */

import OpenAI from 'openai';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const TOP_N = 100;
const DELAY_BETWEEN_NAMES_MS = 2000; // 2 seconds between names to avoid rate limits
const SAVE_STATE_INTERVAL = 5; // Save state every 5 names

// Paths
const ENRICHED_DIR = path.join(__dirname, '..', 'public', 'data', 'enriched');
const STATE_FILE = path.join(__dirname, 'batch-v10-state.json');
const LOG_FILE = path.join(__dirname, 'batch-v10-top100.log');

// OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Tracking
let stats = {
  total: 0,
  completed: 0,
  skipped: 0,
  errors: 0,
  apiCalls: 0,
  startTime: new Date(),
};

let state = {
  processedNames: [],
  currentIndex: 0
};

// Logger
function log(message) {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${message}`;
  console.log(logMessage);
  fs.appendFileSync(LOG_FILE, logMessage + '\n');
}

// Load state from previous run
function loadState() {
  if (fs.existsSync(STATE_FILE)) {
    try {
      state = JSON.parse(fs.readFileSync(STATE_FILE, 'utf-8'));
      log(`📋 Loaded state: ${state.processedNames.length} names already processed`);
    } catch (error) {
      log(`⚠️  Failed to load state: ${error.message}`);
    }
  }
}

// Save state for resumption
function saveState() {
  fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
}

// Get top 100 names
function getTop100Names() {
  const cachePath = path.join(__dirname, '..', 'public', 'data', 'popularNames_cache.json');
  const data = JSON.parse(fs.readFileSync(cachePath, 'utf-8'));
  const namesArray = data.names || data;
  return namesArray.slice(0, TOP_N).map(n => ({
    name: n.name.toLowerCase(),
    gender: n.gender.Male > 0.5 ? 'male' : 'female'
  }));
}

// Check if name has V10 data
function hasV10Data(name) {
  const v10Path = path.join(ENRICHED_DIR, `${name}-v10.json`);
  return fs.existsSync(v10Path);
}

// Get origin and meaning from OpenAI
async function getOriginAndMeaning(name, gender) {
  log(`  🔍 Getting origin/meaning for ${name}...`);

  const prompt = `What is the origin and meaning of the name "${name}" (${gender})?
Respond in JSON format: {"origin": "origin", "meaning": "brief meaning"}

Example: {"origin": "Greek", "meaning": "Farmer"}

Keep the meaning to 1-3 words maximum.`;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'You are a baby name expert. Provide accurate origins and meanings.' },
        { role: 'user', content: prompt }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.3,
    });

    stats.apiCalls++;

    const result = JSON.parse(response.choices[0].message.content);
    log(`  ✅ Origin: ${result.origin}, Meaning: ${result.meaning}`);

    return result;
  } catch (error) {
    log(`  ❌ API Error getting origin/meaning: ${error.message}`);
    throw error;
  }
}

// Run V10 enrichment for a name
function runV10Enrichment(name, gender, origin, meaning) {
  log(`  ⚙️  Running V10 enrichment...`);

  try {
    const cmd = `node scripts/enrich-v10-complete.js ${name} ${gender} "${origin}" "${meaning}"`;
    execSync(cmd, {
      stdio: 'pipe',
      encoding: 'utf-8',
      cwd: path.join(__dirname, '..')
    });

    log(`  ✅ V10 enrichment complete`);
    return true;
  } catch (error) {
    log(`  ❌ V10 enrichment failed: ${error.message}`);
    return false;
  }
}

// Sleep helper
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Process single name
async function processName(nameData, index, total) {
  const { name, gender } = nameData;

  log(`\n${'='.repeat(60)}`);
  log(`📝 Processing [${index + 1}/${total}]: ${name.toUpperCase()} (${gender})`);
  log(`${'='.repeat(60)}`);

  // Skip if already processed in this run
  if (state.processedNames.includes(name)) {
    log(`  ⏭️  Already processed in this session - SKIPPING`);
    stats.skipped++;
    return;
  }

  // Check if V10 data exists
  if (hasV10Data(name)) {
    log(`  ✅ V10 data already exists - SKIPPING`);
    state.processedNames.push(name);
    stats.skipped++;
    return;
  }

  try {
    // Step 1: Get origin and meaning
    const { origin, meaning } = await getOriginAndMeaning(name, gender);
    await sleep(1000); // Rate limit protection

    // Step 2: Run V10 enrichment
    const success = runV10Enrichment(name, gender, origin, meaning);

    if (success) {
      stats.completed++;
      state.processedNames.push(name);
    } else {
      stats.errors++;
    }

    // Save state periodically
    if ((index + 1) % SAVE_STATE_INTERVAL === 0) {
      saveState();
      log(`  💾 State saved (${state.processedNames.length} names processed)`);
    }

    // Progress update
    const elapsed = ((new Date() - stats.startTime) / 1000).toFixed(1);
    const remaining = total - (index + 1);
    const avgTimePerName = elapsed / (index + 1);
    const estimatedRemaining = (avgTimePerName * remaining / 60).toFixed(1);

    log(`  ⏱️  Progress: ${index + 1}/${total} | Elapsed: ${elapsed}s | Est. remaining: ${estimatedRemaining}min`);
    log(`  📊 Stats: ${stats.completed} completed, ${stats.errors} errors, ${stats.apiCalls} API calls`);

  } catch (error) {
    log(`  ❌ Error processing ${name}: ${error.message}`);
    stats.errors++;
  }

  // Delay between names
  if (index < total - 1) {
    await sleep(DELAY_BETWEEN_NAMES_MS);
  }
}

// Main function
async function main() {
  log('\n' + '🚀'.repeat(30));
  log('BATCH V10 ENRICHMENT - TOP 100 MOST POPULAR NAMES');
  log('🚀'.repeat(30) + '\n');

  // Load previous state
  loadState();

  // Get top 100 names
  log('📋 Loading top 100 names...');
  const allNames = getTop100Names();

  // Filter out names that already have V10 data
  const namesToProcess = allNames.filter(n => !hasV10Data(n.name));

  stats.total = namesToProcess.length;
  const existingCount = allNames.length - namesToProcess.length;

  log(`✅ Found ${allNames.length} total names`);
  log(`✅ ${existingCount} already have V10 data`);
  log(`📝 ${namesToProcess.length} names need V10 enrichment\n`);

  if (namesToProcess.length === 0) {
    log('🎉 All top 100 names already have V10 data!');
    return;
  }

  log(`Names to process: ${namesToProcess.slice(0, 10).map(n => n.name).join(', ')}${namesToProcess.length > 10 ? ` ... (+${namesToProcess.length - 10} more)` : ''}\n`);

  // Estimate cost
  const estimatedApiCalls = namesToProcess.length * 30; // ~30 API calls per name
  const estimatedCost = (estimatedApiCalls * 0.00015).toFixed(2); // ~$0.00015 per call
  const estimatedTime = (namesToProcess.length * 45 / 60).toFixed(1); // ~45s per name

  log(`💰 Estimated API cost: ~$${estimatedCost}`);
  log(`⏱️  Estimated time: ~${estimatedTime} minutes\n`);

  // Process each name
  for (let i = 0; i < namesToProcess.length; i++) {
    state.currentIndex = i;
    await processName(namesToProcess[i], i, namesToProcess.length);
  }

  // Save final state
  saveState();

  // Final report
  const totalTime = ((new Date() - stats.startTime) / 1000 / 60).toFixed(2);

  log('\n' + '✅'.repeat(30));
  log('BATCH V10 ENRICHMENT COMPLETE!');
  log('✅'.repeat(30) + '\n');

  log('📊 FINAL STATISTICS:');
  log(`   Total names to process: ${stats.total}`);
  log(`   Successfully completed: ${stats.completed}`);
  log(`   Skipped (already exist): ${stats.skipped}`);
  log(`   Errors: ${stats.errors}`);
  log(`   Total API calls: ${stats.apiCalls}`);
  log(`   Total time: ${totalTime} minutes`);
  log(`   Average time per name: ${(stats.total > 0 ? totalTime / stats.total * 60 : 0).toFixed(1)} seconds\n`);

  const successRate = stats.total > 0 ? ((stats.completed / stats.total) * 100).toFixed(1) : 0;
  log(`🎯 Success rate: ${successRate}%\n`);

  log('📁 Output locations:');
  log(`   V10 JSON files: ${ENRICHED_DIR}`);
  log(`   Log file: ${LOG_FILE}`);
  log(`   State file: ${STATE_FILE}\n`);

  if (stats.errors > 0) {
    log(`⚠️  ${stats.errors} errors occurred. Check log file for details.`);
    log(`   You can resume by running this script again.\n`);
  }

  // Next steps
  log('📋 NEXT STEPS:');
  log('   1. Review the generated V10 files');
  log('   2. Run: node scripts/batch-v13-top100.js');
  log('   3. This will generate V13 JSON + SEO HTML for all 100 names\n');

  log('🎉 V10 batch enrichment complete!');
}

// Error handling
process.on('unhandledRejection', (error) => {
  log(`❌ Unhandled error: ${error.message}`);
  log(error.stack);
  saveState();
  process.exit(1);
});

process.on('SIGINT', () => {
  log('\n⚠️  Process interrupted by user');
  log('💾 Saving state...');
  saveState();
  log('✅ State saved. You can resume by running this script again.');
  process.exit(0);
});

// Run
main().catch(error => {
  log(`❌ Fatal error: ${error.message}`);
  log(error.stack);
  saveState();
  process.exit(1);
});
