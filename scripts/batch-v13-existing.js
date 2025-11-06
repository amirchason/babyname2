#!/usr/bin/env node

/**
 * BATCH V13 ENRICHMENT - EXISTING V10 DATA
 *
 * Process all names that already have V10 data
 * Quick win - no API calls needed!
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ENRICHED_DIR = path.join(__dirname, '..', 'public', 'data', 'enriched');
const LOG_FILE = path.join(__dirname, 'batch-v13-existing.log');

let stats = {
  total: 0,
  v13JsonGenerated: 0,
  v13HtmlGenerated: 0,
  errors: 0,
  startTime: new Date(),
};

function log(message) {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${message}`;
  console.log(logMessage);
  fs.appendFileSync(LOG_FILE, logMessage + '\n');
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function processName(name, index, total) {
  log(`\n${'='.repeat(60)}`);
  log(`[${index + 1}/${total}] Processing: ${name.toUpperCase()}`);
  log(`${'='.repeat(60)}`);

  try {
    // Generate V13 JSON
    log(`  📦 Generating V13 JSON...`);
    execSync(`node scripts/generate-v13-super-enriched.js ${name}`, {
      stdio: 'pipe',
      encoding: 'utf-8'
    });
    stats.v13JsonGenerated++;
    log(`  ✅ V13 JSON generated`);

    await sleep(200);

    // Generate SEO HTML
    log(`  🌐 Generating SEO HTML...`);
    execSync(`node scripts/generate-v13-seo-optimized.js ${name}`, {
      stdio: 'pipe',
      encoding: 'utf-8'
    });
    stats.v13HtmlGenerated++;
    log(`  ✅ SEO HTML generated`);

    const elapsed = ((new Date() - stats.startTime) / 1000).toFixed(1);
    const avgTime = elapsed / (index + 1);
    const remaining = ((total - index - 1) * avgTime).toFixed(0);
    log(`  ⏱️  Elapsed: ${elapsed}s | Est. remaining: ${remaining}s`);

  } catch (error) {
    log(`  ❌ Error processing ${name}: ${error.message}`);
    stats.errors++;
  }

  await sleep(500);
}

async function main() {
  log('\n' + '🚀'.repeat(30));
  log('V13 BATCH ENRICHMENT - EXISTING DATA');
  log('🚀'.repeat(30) + '\n');

  // Find all names with V10 data
  const v10Files = fs.readdirSync(ENRICHED_DIR)
    .filter(f => f.endsWith('-v10.json'))
    .map(f => f.replace('-v10.json', ''));

  stats.total = v10Files.length;

  log(`✅ Found ${stats.total} names with V10 data\n`);
  log(`Names: ${v10Files.join(', ')}\n`);

  // Process each name
  for (let i = 0; i < v10Files.length; i++) {
    await processName(v10Files[i], i, v10Files.length);
  }

  // Final report
  const totalTime = ((new Date() - stats.startTime) / 1000 / 60).toFixed(2);

  log('\n' + '✅'.repeat(30));
  log('BATCH ENRICHMENT COMPLETE!');
  log('✅'.repeat(30) + '\n');

  log('📊 FINAL STATISTICS:');
  log(`   Total names: ${stats.total}`);
  log(`   V13 JSON generated: ${stats.v13JsonGenerated}`);
  log(`   SEO HTML generated: ${stats.v13HtmlGenerated}`);
  log(`   Errors: ${stats.errors}`);
  log(`   Total time: ${totalTime} minutes`);
  log(`   Average: ${(stats.total > 0 ? totalTime / stats.total * 60 : 0).toFixed(1)}s per name\n`);

  const successRate = stats.total > 0 ? ((stats.v13HtmlGenerated / stats.total) * 100).toFixed(1) : 0;
  log(`🎯 Success rate: ${successRate}%\n`);
  log(`📁 Check: public/profiles/v13/`);
  log(`📄 Log: ${LOG_FILE}\n`);
}

main().catch(error => {
  log(`❌ Fatal error: ${error.message}`);
  process.exit(1);
});
