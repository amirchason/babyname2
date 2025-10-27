/**
 * generate.js
 * Master script to orchestrate SEO static page generation
 *
 * Usage:
 *   node generate.js --dry-run --count=10
 *   node generate.js --count=100 --skip-existing
 *   node generate.js --resume
 */

const fs = require('fs-extra');
const path = require('path');
const { loadAllNames } = require('./loadNames');
const { generateNameHTML } = require('./generateNameHTML');
const { saveCheckpoint, loadCheckpoint, clearCheckpoint } = require('./checkpoint');

// Configuration
const CONFIG = {
  outputDir: path.join(__dirname, '../../public/names'),
  checkpointFreq: 1000, // Save every 1000 names
};

// Parse CLI arguments
function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    dryRun: args.includes('--dry-run'),
    resume: args.includes('--resume'),
    skipExisting: args.includes('--skip-existing'),
    count: null,
    validate: !args.includes('--no-validate'),
  };

  // Parse --count=N
  const countArg = args.find(arg => arg.startsWith('--count='));
  if (countArg) {
    options.count = parseInt(countArg.split('=')[1], 10);
  }

  return options;
}

// Main generation function
async function generate(options) {
  console.log('\n🚀 SoulSeed SEO Generation Starting...\n');
  console.log(`Mode: ${options.dryRun ? 'DRY-RUN' : 'LIVE'}`);
  console.log(`Skip existing: ${options.skipExisting}`);
  console.log(`Resume: ${options.resume}`);
  console.log(`Count limit: ${options.count || 'ALL'}\n`);

  // Load state if resuming
  let state = options.resume ? await loadCheckpoint() : null;
  const startIndex = state ? state.lastProcessedIndex : 0;

  console.log('📦 Loading names...\n');
  const allNames = await loadAllNames({ sortBy: 'popularity' });

  const endIndex = options.count
    ? Math.min(startIndex + options.count, allNames.length)
    : allNames.length;

  console.log(`\n📝 Generating ${endIndex - startIndex} pages...`);
  console.log(`   Range: ${startIndex} to ${endIndex}\n`);

  let generated = 0;
  let skipped = 0;
  let errors = [];

  const startTime = Date.now();

  for (let i = startIndex; i < endIndex; i++) {
    const name = allNames[i];

    try {
      // Check if should skip existing
      const filePath = path.join(CONFIG.outputDir, `${name.slug}.html`);

      if (options.skipExisting && await fs.pathExists(filePath)) {
        skipped++;
        continue;
      }

      // Generate HTML
      const html = generateNameHTML(name);

      // Write file (unless dry-run)
      if (!options.dryRun) {
        await fs.writeFile(filePath, html, 'utf8');
      }

      generated++;

      // Progress logging
      if (generated % 100 === 0) {
        const elapsed = (Date.now() - startTime) / 1000;
        const rate = generated / elapsed;
        const remaining = endIndex - i - 1;
        const eta = Math.round(remaining / rate);

        console.log(`   ✅ ${generated} / ${endIndex - startIndex} (${((i - startIndex) / (endIndex - startIndex) * 100).toFixed(1)}%) - ETA: ${eta}s`);
      }

    } catch (error) {
      errors.push({ name: name.name, error: error.message });
      if (errors.length < 10) {
        console.error(`   ❌ Error: ${name.name} - ${error.message}`);
      }
    }

    // Save checkpoint
    if (!options.dryRun && generated % CONFIG.checkpointFreq === 0) {
      await saveCheckpoint({
        lastProcessedIndex: i + 1,
        totalGenerated: generated,
        skipped,
        errors: errors.length,
        timestamp: new Date().toISOString(),
      });
      console.log(`   💾 Checkpoint saved at index ${i + 1}`);
    }
  }

  // Final checkpoint
  if (!options.dryRun) {
    await saveCheckpoint({
      lastProcessedIndex: endIndex,
      totalGenerated: generated,
      skipped,
      errors: errors.length,
      timestamp: new Date().toISOString(),
      complete: true,
    });
  }

  const elapsed = (Date.now() - startTime) / 1000;

  console.log('\n' + '='.repeat(60));
  console.log('✅ GENERATION COMPLETE!');
  console.log('='.repeat(60));
  console.log(`\n📊 Summary:`);
  console.log(`   Generated: ${generated.toLocaleString()} pages`);
  console.log(`   Skipped: ${skipped.toLocaleString()} existing`);
  console.log(`   Errors: ${errors.length}`);
  console.log(`   Time: ${elapsed.toFixed(1)}s`);
  console.log(`   Rate: ${(generated / elapsed).toFixed(1)} pages/sec\n`);

  if (errors.length > 0) {
    console.log(`⚠️  ${errors.length} errors occurred`);
    console.log('   First few errors:');
    errors.slice(0, 5).forEach(e => {
      console.log(`   - ${e.name}: ${e.error}`);
    });
  }

  if (options.dryRun) {
    console.log('\n📝 DRY-RUN: No files were written\n');
  }
}

// Run
const options = parseArgs();

generate(options)
  .then(() => {
    console.log('✅ Done!\n');
    process.exit(0);
  })
  .catch(error => {
    console.error('\n❌ Fatal error:', error);
    process.exit(1);
  });
