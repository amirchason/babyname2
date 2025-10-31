const fs = require('fs');
const path = require('path');

// Load all chunks and count origins
async function analyzeOrigins() {
  const dataDir = path.join(__dirname, 'public', 'data');
  const indexFile = path.join(dataDir, 'names-index.json');

  // Read index
  const index = JSON.parse(fs.readFileSync(indexFile, 'utf8'));
  console.log(`📊 Total names in database: ${index.totalNames}\n`);

  // Origin counters
  const originCounts = {};
  const originGroupCounts = {};

  // Load all chunks
  const chunks = Object.values(index.chunks);
  let totalProcessed = 0;

  for (const chunk of chunks) {
    const chunkFile = path.join(dataDir, chunk.file);
    if (!fs.existsSync(chunkFile)) {
      console.log(`⚠️  Skipping missing chunk: ${chunk.file}`);
      continue;
    }

    const chunkData = JSON.parse(fs.readFileSync(chunkFile, 'utf8'));
    // Handle both formats: object with .names property OR raw array
    const names = Array.isArray(chunkData) ? chunkData : (chunkData.names || []);

    console.log(`📦 Processing ${chunk.file}: ${names.length} names`);

    for (const name of names) {
      // Count by origin
      if (name.origin) {
        originCounts[name.origin] = (originCounts[name.origin] || 0) + 1;
      }

      // Count by originGroup
      if (name.originGroup) {
        originGroupCounts[name.originGroup] = (originGroupCounts[name.originGroup] || 0) + 1;
      }

      totalProcessed++;
    }
  }

  console.log(`\n✅ Processed ${totalProcessed} names\n`);

  // Sort by count descending
  const sortedOrigins = Object.entries(originCounts)
    .sort((a, b) => b[1] - a[1]);

  const sortedOriginGroups = Object.entries(originGroupCounts)
    .sort((a, b) => b[1] - a[1]);

  // Display results
  console.log('═══════════════════════════════════════════════════════');
  console.log('📍 ORIGINS (Primary Origin Field)');
  console.log('═══════════════════════════════════════════════════════\n');

  sortedOrigins.forEach(([origin, count], index) => {
    console.log(`${(index + 1).toString().padStart(3)}. ${origin.padEnd(30)} ${count.toLocaleString().padStart(10)} names`);
  });

  console.log('\n');
  console.log('═══════════════════════════════════════════════════════');
  console.log('🏷️  ORIGIN GROUPS (Consolidated Groups)');
  console.log('═══════════════════════════════════════════════════════\n');

  sortedOriginGroups.forEach(([group, count], index) => {
    console.log(`${(index + 1).toString().padStart(3)}. ${group.padEnd(30)} ${count.toLocaleString().padStart(10)} names`);
  });

  console.log('\n');
  console.log('═══════════════════════════════════════════════════════');
  console.log('📊 SUMMARY');
  console.log('═══════════════════════════════════════════════════════');
  console.log(`Total Origins: ${sortedOrigins.length}`);
  console.log(`Total Origin Groups: ${sortedOriginGroups.length}`);
  console.log(`Total Names Processed: ${totalProcessed.toLocaleString()}`);

  // Filter analysis - show which origins have > 250 names
  console.log('\n');
  console.log('═══════════════════════════════════════════════════════');
  console.log('🔍 FILTER CAPSULES (Origins with > 250 names)');
  console.log('═══════════════════════════════════════════════════════\n');

  const filterableOrigins = sortedOrigins.filter(([_, count]) => count > 250);
  filterableOrigins.forEach(([origin, count], index) => {
    console.log(`${(index + 1).toString().padStart(3)}. ${origin.padEnd(30)} ${count.toLocaleString().padStart(10)} names ✅`);
  });

  console.log(`\n📌 Total capsules shown in filter: ${filterableOrigins.length}`);

  // Filter analysis for ORIGIN GROUPS (>250 names)
  console.log('\n');
  console.log('═══════════════════════════════════════════════════════');
  console.log('🏷️  FILTER CAPSULES - ORIGIN GROUPS (> 250 names)');
  console.log('═══════════════════════════════════════════════════════\n');

  const filterableGroups = sortedOriginGroups.filter(([_, count]) => count > 250);
  filterableGroups.forEach(([group, count], index) => {
    console.log(`${(index + 1).toString().padStart(3)}. ${group.padEnd(35)} ${count.toLocaleString().padStart(10)} names ✅`);
  });

  console.log(`\n📌 Total ORIGIN GROUP capsules shown in filter: ${filterableGroups.length}`);
}

analyzeOrigins().catch(console.error);
