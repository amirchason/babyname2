#!/usr/bin/env node

/**
 * BATCH V13 ENRICHMENT - TOP 100 MOST POPULAR NAMES
 *
 * Process:
 * 1. Load top 100 names from database
 * 2. Generate V13 JSON (super enriched) for each
 * 3. Generate SEO-optimized HTML profile for each
 * 4. Track progress and report results
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const TOP_N = 100;
const DELAY_MS = 500; // Delay between names to avoid overwhelming system

// Paths
const ENRICHED_DIR = path.join(__dirname, '..', 'public', 'data', 'enriched');
const PROFILES_DIR = path.join(__dirname, '..', 'public', 'profiles', 'v13');
const LOG_FILE = path.join(__dirname, 'batch-v13-top100.log');

// Tracking
let stats = {
  total: 0,
  v13JsonGenerated: 0,
  v13HtmlGenerated: 0,
  skipped: 0,
  errors: 0,
  startTime: new Date(),
};

// Logger
function log(message) {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${message}`;
  console.log(logMessage);
  fs.appendFileSync(LOG_FILE, logMessage + '\n');
}

// Get top 100 names from popularNames_cache.json
function getTop100Names() {
  try {
    const cachePath = path.join(__dirname, '..', 'public', 'data', 'popularNames_cache.json');

    if (!fs.existsSync(cachePath)) {
      log('❌ popularNames_cache.json not found. Trying fullNames_cache.json...');

      const fullPath = path.join(__dirname, '..', 'public', 'data', 'fullNames_cache.json');
      if (!fs.existsSync(fullPath)) {
        throw new Error('No cache file found');
      }

      const data = JSON.parse(fs.readFileSync(fullPath, 'utf-8'));
      return data
        .sort((a, b) => (a.ranking?.current || 999999) - (b.ranking?.current || 999999))
        .slice(0, TOP_N)
        .map(n => n.name.toLowerCase());
    }

    const data = JSON.parse(fs.readFileSync(cachePath, 'utf-8'));
    const namesArray = data.names || data; // Handle both {names: [...]} and [...] formats
    return namesArray.slice(0, TOP_N).map(n => n.name.toLowerCase());
  } catch (error) {
    log(`❌ Error loading names: ${error.message}`);
    throw error;
  }
}

// Check if name has required data
function checkNameData(name) {
  const v10Path = path.join(ENRICHED_DIR, `${name}-v10.json`);
  const hasV10 = fs.existsSync(v10Path);

  // V11 is optional but preferred
  const v11Path = path.join(ENRICHED_DIR, `${name}-v11.json`);
  const hasV11 = fs.existsSync(v11Path);

  return { hasV10, hasV11 };
}

// Generate V13 JSON
function generateV13Json(name) {
  try {
    log(`  📦 Generating V13 JSON for: ${name}`);
    execSync(`node scripts/generate-v13-super-enriched.js ${name}`, {
      stdio: 'pipe',
      encoding: 'utf-8'
    });
    stats.v13JsonGenerated++;
    return true;
  } catch (error) {
    log(`  ❌ Failed to generate V13 JSON for ${name}: ${error.message}`);
    stats.errors++;
    return false;
  }
}

// Generate SEO HTML
function generateSeoHtml(name) {
  try {
    log(`  🌐 Generating SEO HTML for: ${name}`);
    execSync(`node scripts/generate-v13-seo-optimized.js ${name}`, {
      stdio: 'pipe',
      encoding: 'utf-8'
    });
    stats.v13HtmlGenerated++;
    return true;
  } catch (error) {
    log(`  ❌ Failed to generate SEO HTML for ${name}: ${error.message}`);
    stats.errors++;
    return false;
  }
}

// Sleep function
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Process single name
async function processName(name, index, total) {
  log(`\n${'='.repeat(60)}`);
  log(`📝 Processing [${index + 1}/${total}]: ${name.toUpperCase()}`);
  log(`${'='.repeat(60)}`);

  // Check existing data
  const { hasV10, hasV11 } = checkNameData(name);

  if (!hasV10) {
    log(`  ⚠️  Missing V10 data for ${name} - SKIPPING`);
    log(`     Run: node scripts/enrich-v10-complete.js ${name}`);
    stats.skipped++;
    return;
  }

  if (!hasV11) {
    log(`  ⚠️  Missing V11 data for ${name} (optional, will use V10 only)`);
  }

  // Generate V13 JSON
  const v13JsonSuccess = generateV13Json(name);
  if (!v13JsonSuccess) {
    return; // Skip HTML if JSON failed
  }

  // Small delay
  await sleep(200);

  // Generate SEO HTML
  generateSeoHtml(name);

  // Progress update
  const elapsed = ((new Date() - stats.startTime) / 1000).toFixed(1);
  const remaining = total - (index + 1);
  const avgTimePerName = elapsed / (index + 1);
  const estimatedRemaining = (avgTimePerName * remaining / 60).toFixed(1);

  log(`  ⏱️  Progress: ${index + 1}/${total} | Elapsed: ${elapsed}s | Est. remaining: ${estimatedRemaining}min`);

  // Delay between names
  if (index < total - 1) {
    await sleep(DELAY_MS);
  }
}

// Main batch process
async function main() {
  log('\n' + '🚀'.repeat(30));
  log('V13 BATCH ENRICHMENT - TOP 100 MOST POPULAR NAMES');
  log('🚀'.repeat(30) + '\n');

  // Get top 100 names
  log('📋 Loading top 100 names...');
  const names = getTop100Names();
  stats.total = names.length;

  log(`✅ Found ${names.length} names to process\n`);
  log(`Names: ${names.slice(0, 10).join(', ')}... (+${names.length - 10} more)\n`);

  // Process each name
  for (let i = 0; i < names.length; i++) {
    await processName(names[i], i, names.length);
  }

  // Final report
  const totalTime = ((new Date() - stats.startTime) / 1000 / 60).toFixed(2);

  log('\n' + '✅'.repeat(30));
  log('BATCH ENRICHMENT COMPLETE!');
  log('✅'.repeat(30) + '\n');

  log('📊 FINAL STATISTICS:');
  log(`   Total names processed: ${stats.total}`);
  log(`   V13 JSON generated: ${stats.v13JsonGenerated}`);
  log(`   SEO HTML generated: ${stats.v13HtmlGenerated}`);
  log(`   Skipped (missing V10): ${stats.skipped}`);
  log(`   Errors: ${stats.errors}`);
  log(`   Total time: ${totalTime} minutes`);
  log(`   Average time per name: ${(stats.total > 0 ? totalTime / stats.total * 60 : 0).toFixed(1)} seconds\n`);

  log('📁 Output locations:');
  log(`   V13 JSON: ${ENRICHED_DIR}`);
  log(`   SEO HTML: ${PROFILES_DIR}`);
  log(`   Log file: ${LOG_FILE}\n`);

  // Success rate
  const successRate = stats.total > 0 ? ((stats.v13HtmlGenerated / stats.total) * 100).toFixed(1) : 0;
  log(`🎯 Success rate: ${successRate}%\n`);

  if (stats.errors > 0) {
    log(`⚠️  ${stats.errors} errors occurred. Check log file for details.`);
  }

  if (stats.skipped > 0) {
    log(`⚠️  ${stats.skipped} names skipped (missing V10 data).`);
    log(`   Run V10 enrichment first for complete coverage.`);
  }

  log('\n🎉 V13 enrichment batch complete!');
}

// Error handling
process.on('unhandledRejection', (error) => {
  log(`❌ Unhandled error: ${error.message}`);
  log(error.stack);
  process.exit(1);
});

// Run
main().catch(error => {
  log(`❌ Fatal error: ${error.message}`);
  log(error.stack);
  process.exit(1);
});
