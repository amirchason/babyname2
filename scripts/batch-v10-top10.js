#!/usr/bin/env node

/**
 * Batch V10 Enrichment for Top 10 Names
 *
 * Runs the complete V10 enrichment process on the top 10 names.
 * Phases: V4 (comprehensive) → V6 (celestial) → V7 (translations) → V8 (celebrity babies) → V10 (positive songs)
 */

const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

// Read top 10 names
const inputPath = path.join(__dirname, 'data/top10-test.json');
if (!fs.existsSync(inputPath)) {
  console.error('❌ Error: top10-test.json not found');
  console.error('   Run: node scripts/extract-top10-test.js first');
  process.exit(1);
}

const names = JSON.parse(fs.readFileSync(inputPath, 'utf8'));

console.log('🚀 V10 BATCH ENRICHMENT STARTED');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
console.log(`📊 Processing ${names.length} names`);
console.log(`⏱️  Estimated time: ~${Math.ceil(names.length * 40 / 60)} minutes`);
console.log(`💰 Estimated cost: $${(names.length * 0.05).toFixed(2)}\n`);
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

const startTime = Date.now();
const results = {
  success: [],
  failed: []
};

// Process names sequentially
async function processName(name, index) {
  return new Promise((resolve) => {
    const nameStart = Date.now();
    console.log(`[${index + 1}/${names.length}] Enriching "${name.name}" (${name.gender}, ${name.origin})...`);

    const args = [
      path.join(__dirname, 'enrich-v10-complete.js'),
      name.name,
      name.gender,
      name.origin,
      name.meaning
    ];

    const child = spawn('node', args);

    let output = '';
    child.stdout.on('data', (data) => {
      output += data.toString();
    });

    child.stderr.on('data', (data) => {
      process.stderr.write(data);
    });

    child.on('close', (code) => {
      const duration = ((Date.now() - nameStart) / 1000).toFixed(1);

      if (code === 0) {
        console.log(`✅ ${name.name} completed in ${duration}s\n`);
        results.success.push({ name: name.name, duration });
      } else {
        console.log(`❌ ${name.name} FAILED (exit code ${code})\n`);
        results.failed.push({ name: name.name, code });
      }

      // Small delay between names to avoid rate limits
      setTimeout(resolve, 2000);
    });
  });
}

// Process all names sequentially
(async function() {
  for (let i = 0; i < names.length; i++) {
    await processName(names[i], i);
  }

  // Print summary
  const totalTime = ((Date.now() - startTime) / 1000 / 60).toFixed(1);
  const avgTime = (results.success.reduce((sum, r) => sum + parseFloat(r.duration), 0) / results.success.length).toFixed(1);

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('✨ BATCH ENRICHMENT COMPLETE!');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  console.log(`📊 Summary:`);
  console.log(`   Total Names: ${names.length}`);
  console.log(`   Successful: ${results.success.length}`);
  console.log(`   Failed: ${results.failed.length}`);
  console.log(`   Total Time: ${totalTime} minutes`);
  console.log(`   Avg Time/Name: ${avgTime}s`);
  console.log(`   Estimated Cost: $${(results.success.length * 0.05).toFixed(2)}`);

  console.log(`\n📁 Output Directory: public/data/enriched/`);

  if (results.success.length > 0) {
    console.log(`\n✅ Successfully enriched:`);
    results.success.forEach(r => {
      console.log(`   • ${r.name} (${r.duration}s)`);
    });
  }

  if (results.failed.length > 0) {
    console.log(`\n❌ Failed:`);
    results.failed.forEach(r => {
      console.log(`   • ${r.name} (exit code ${r.code})`);
    });
  }

  console.log(`\n📝 Next step: Generate OG images`);
  console.log('   node scripts/generate-og-images.js');
})();
