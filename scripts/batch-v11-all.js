#!/usr/bin/env node

/**
 * BATCH V11 BLOG ENRICHMENT
 *
 * Processes all V10-enriched names to generate V11 blog-style profiles
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const enrichedDir = path.join(__dirname, '..', 'public', 'data', 'enriched');

// Find all V10 files that don't have V11 yet
const files = fs.readdirSync(enrichedDir);
const v10Files = files.filter(f => f.endsWith('-v10.json'));

const names = v10Files.map(f => {
  const name = f.replace('-v10.json', '');
  const v11Path = path.join(enrichedDir, `${name}-v11.json`);
  return {
    name,
    hasV11: fs.existsSync(v11Path)
  };
});

const toEnrich = names.filter(n => !n.hasV11);

console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('🌟 BATCH V11 BLOG ENRICHMENT');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
console.log(`📊 Total V10 names: ${v10Files.length}`);
console.log(`✅ Already have V11: ${names.filter(n => n.hasV11).length}`);
console.log(`🚀 To enrich: ${toEnrich.length}\n`);

if (toEnrich.length === 0) {
  console.log('🎉 All names already have V11 blog content!\n');
  process.exit(0);
}

console.log('Names to enrich:');
toEnrich.forEach((n, i) => {
  console.log(`  ${i + 1}. ${n.name}`);
});
console.log('');

// Process names sequentially
const results = {
  success: [],
  failed: []
};

const startTime = Date.now();

async function enrichName(name, index) {
  return new Promise((resolve) => {
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    console.log(`🔄 [${index + 1}/${toEnrich.length}] Enriching: ${name}`);
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);

    const nameStartTime = Date.now();

    const child = spawn('node', ['scripts/enrich-v11-blog.js', name], {
      env: {
        ...process.env,
        OPENAI_API_KEY: process.env.OPENAI_API_KEY
      }
    });

    let output = '';
    let errorOutput = '';

    child.stdout.on('data', (data) => {
      const text = data.toString();
      output += text;
      process.stdout.write(text);
    });

    child.stderr.on('data', (data) => {
      const text = data.toString();
      errorOutput += text;
      process.stderr.write(text);
    });

    child.on('close', (code) => {
      const duration = ((Date.now() - nameStartTime) / 1000).toFixed(1);

      if (code === 0) {
        console.log(`\n✅ Success! (${duration}s)\n`);
        results.success.push({ name, duration });
      } else {
        console.log(`\n❌ Failed! (${duration}s)\n`);
        results.failed.push({ name, duration, error: errorOutput });
      }

      // Wait 2 seconds before next name
      setTimeout(() => resolve(), 2000);
    });
  });
}

// Process all names sequentially
async function processAll() {
  for (let i = 0; i < toEnrich.length; i++) {
    await enrichName(toEnrich[i].name, i);
  }

  // Final summary
  const totalTime = ((Date.now() - startTime) / 60000).toFixed(1);
  const avgTime = results.success.length > 0
    ? (results.success.reduce((sum, r) => sum + parseFloat(r.duration), 0) / results.success.length).toFixed(1)
    : 0;

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('✨ BATCH ENRICHMENT COMPLETE!');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  console.log('📊 Summary:');
  console.log(`   Total Names: ${toEnrich.length}`);
  console.log(`   Successful: ${results.success.length}`);
  console.log(`   Failed: ${results.failed.length}`);
  console.log(`   Total Time: ${totalTime} minutes`);
  console.log(`   Avg Time/Name: ${avgTime}s`);
  console.log(`   Estimated Cost: $${(results.success.length * 0.0135).toFixed(2)}\n`);

  if (results.success.length > 0) {
    console.log('✅ Successfully enriched:');
    results.success.forEach(r => {
      console.log(`   • ${r.name} (${r.duration}s)`);
    });
    console.log('');
  }

  if (results.failed.length > 0) {
    console.log('❌ Failed:');
    results.failed.forEach(r => {
      console.log(`   • ${r.name} (${r.duration}s)`);
    });
    console.log('');
  }

  console.log('🎯 Next steps:');
  console.log('   1. Run: node scripts/generate-v11-blog-html.js all');
  console.log('   2. Review V11 blog profiles in public/profiles/v11/');
  console.log('   3. Deploy to production\n');

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}

processAll().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
