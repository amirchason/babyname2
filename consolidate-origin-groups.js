const fs = require('fs');
const path = require('path');

// Consolidation rules
const consolidationRules = {
  'English': (originGroup) => originGroup && typeof originGroup === 'string' && originGroup.toLowerCase().includes('english'),
  'Arabic': (originGroup) => originGroup && typeof originGroup === 'string' && originGroup.includes('Arabic'),
  'Spanish': (originGroup) => originGroup && typeof originGroup === 'string' && originGroup.includes('Spanish'),
  'African': (originGroup) => originGroup && typeof originGroup === 'string' && originGroup.includes('African'),
  'French': (originGroup) => originGroup && typeof originGroup === 'string' && originGroup.includes('French'),
  'Germanic': (originGroup) => {
    if (!originGroup || typeof originGroup !== 'string') return false;
    const lower = originGroup.toLowerCase();
    return lower.includes('germanic') || lower.includes('german');
  },
};

async function consolidateOriginGroups() {
  const dataDir = path.join(__dirname, 'public', 'data');
  const indexFile = path.join(dataDir, 'names-index.json');

  // Read index
  const index = JSON.parse(fs.readFileSync(indexFile, 'utf8'));
  console.log(`📊 Total names in database: ${index.totalNames}\n`);

  // Track changes
  const changeStats = {};
  Object.keys(consolidationRules).forEach(key => {
    changeStats[key] = { count: 0, from: new Set() };
  });

  // Load and process all chunks
  const chunks = Object.values(index.chunks);
  let totalProcessed = 0;

  for (const chunk of chunks) {
    const chunkFile = path.join(dataDir, chunk.file);
    if (!fs.existsSync(chunkFile)) {
      console.log(`⚠️  Skipping missing chunk: ${chunk.file}`);
      continue;
    }

    console.log(`📦 Processing ${chunk.file}...`);

    const chunkData = JSON.parse(fs.readFileSync(chunkFile, 'utf8'));
    const names = Array.isArray(chunkData) ? chunkData : (chunkData.names || []);

    let chunkChanges = 0;

    for (const name of names) {
      if (!name.originGroup) {
        totalProcessed++;
        continue;
      }

      const originalOriginGroup = name.originGroup;
      let wasConsolidated = false;

      // Check each consolidation rule
      for (const [targetOrigin, checkFn] of Object.entries(consolidationRules)) {
        if (checkFn(originalOriginGroup)) {
          changeStats[targetOrigin].from.add(originalOriginGroup);
          name.originGroup = targetOrigin;
          changeStats[targetOrigin].count++;
          chunkChanges++;
          wasConsolidated = true;
          break; // Only apply first matching rule
        }
      }

      totalProcessed++;
    }

    // Save updated chunk
    if (chunkChanges > 0) {
      if (Array.isArray(chunkData)) {
        fs.writeFileSync(chunkFile, JSON.stringify(chunkData, null, 2), 'utf8');
      } else {
        fs.writeFileSync(chunkFile, JSON.stringify(chunkData, null, 2), 'utf8');
      }
      console.log(`   ✅ Updated ${chunkChanges} names in ${chunk.file}`);
    } else {
      console.log(`   ⏭️  No changes needed in ${chunk.file}`);
    }
  }

  console.log(`\n✅ Processed ${totalProcessed} names\n`);

  // Display consolidation summary
  console.log('═══════════════════════════════════════════════════════');
  console.log('📊 CONSOLIDATION SUMMARY');
  console.log('═══════════════════════════════════════════════════════\n');

  for (const [targetOrigin, stats] of Object.entries(changeStats)) {
    console.log(`\n🏷️  ${targetOrigin}: ${stats.count.toLocaleString()} names consolidated`);
    if (stats.from.size > 0) {
      console.log(`   Merged from:`);
      Array.from(stats.from).sort().forEach(from => {
        console.log(`   - ${from}`);
      });
    }
  }

  console.log('\n\n✨ Origin group consolidation complete!\n');
}

consolidateOriginGroups().catch(console.error);
