const fs = require('fs');
const path = require('path');

async function findAllEnglishOrigins() {
  const dataDir = path.join(__dirname, 'public', 'data');
  const indexFile = path.join(dataDir, 'names-index.json');

  const index = JSON.parse(fs.readFileSync(indexFile, 'utf8'));
  console.log(`📊 Analyzing English origins in ${index.totalNames} names\n`);

  const originCounts = {};
  const originGroupCounts = {};
  
  const chunks = Object.values(index.chunks);
  let totalProcessed = 0;
  let englishOriginCount = 0;
  let englishGroupCount = 0;

  for (const chunk of chunks) {
    const chunkFile = path.join(dataDir, chunk.file);
    if (!fs.existsSync(chunkFile)) continue;

    const chunkData = JSON.parse(fs.readFileSync(chunkFile, 'utf8'));
    const names = Array.isArray(chunkData) ? chunkData : (chunkData.names || []);

    for (const name of names) {
      // Check origin field
      if (name.origin && typeof name.origin === 'string' && name.origin.toLowerCase().includes('english')) {
        originCounts[name.origin] = (originCounts[name.origin] || 0) + 1;
        englishOriginCount++;
      }

      // Check originGroup field
      if (name.originGroup && typeof name.originGroup === 'string' && name.originGroup.toLowerCase().includes('english')) {
        originGroupCounts[name.originGroup] = (originGroupCounts[name.originGroup] || 0) + 1;
        englishGroupCount++;
      }

      totalProcessed++;
    }
  }

  console.log('═══════════════════════════════════════════════════════');
  console.log('📍 ORIGIN FIELD - English-related origins');
  console.log('═══════════════════════════════════════════════════════\n');

  const sortedOrigins = Object.entries(originCounts).sort((a, b) => b[1] - a[1]);
  sortedOrigins.forEach(([origin, count], index) => {
    console.log(`${(index + 1).toString().padStart(3)}. ${origin.padEnd(40)} ${count.toLocaleString().padStart(8)} names`);
  });

  console.log(`\n📊 Total in origin field: ${englishOriginCount.toLocaleString()} names`);
  console.log(`📊 Unique origin values: ${sortedOrigins.length}`);

  console.log('\n');
  console.log('═══════════════════════════════════════════════════════');
  console.log('🏷️  ORIGINGROUP FIELD - English-related groups');
  console.log('═══════════════════════════════════════════════════════\n');

  const sortedGroups = Object.entries(originGroupCounts).sort((a, b) => b[1] - a[1]);
  sortedGroups.forEach(([group, count], index) => {
    console.log(`${(index + 1).toString().padStart(3)}. ${group.padEnd(40)} ${count.toLocaleString().padStart(8)} names`);
  });

  console.log(`\n📊 Total in originGroup field: ${englishGroupCount.toLocaleString()} names`);
  console.log(`📊 Unique originGroup values: ${sortedGroups.length}`);
}

findAllEnglishOrigins().catch(console.error);
