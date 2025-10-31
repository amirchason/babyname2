/**
 * Test ALL chunks to find total English names
 */

const fs = require('fs');
const path = require('path');

// Helper function matching HomePage.tsx logic
const isEnglishRelated = (name) => {
  const checkField = (field) => {
    if (!field) return false;
    const values = Array.isArray(field) ? field : [field];

    return values.some((val) => {
      const valLower = String(val).toLowerCase();

      // Raw origin patterns
      const rawPatterns = ['english', 'modern', 'contemporary', 'american', 'old english'];

      // Processed originGroup patterns
      const groupPatterns = ['english', 'germanic', 'old english', 'modern english',
                            'american', 'native american', 'indigenous americas'];

      // Check if value matches any pattern
      return [...rawPatterns, ...groupPatterns].some(pattern => {
        // Exact match
        if (valLower === pattern) return true;

        // Comma-separated
        if (valLower.includes(pattern + ',') || valLower.includes(',' + pattern)) return true;

        // Space-separated
        if (valLower.startsWith(pattern + ' ') ||
            valLower.endsWith(' ' + pattern) ||
            valLower.includes(' ' + pattern + ' ')) return true;

        return false;
      });
    });
  };

  return checkField(name.origin) || checkField(name.originGroup);
};

console.log('🔍 ANALYZING ALL CHUNKS FOR ENGLISH NAMES\n');

const chunks = ['chunk1', 'chunk2', 'chunk3', 'chunk4', 'chunk5'];
let totalNames = 0;
let totalEnglish = 0;
const results = [];

chunks.forEach(chunkName => {
  const chunkPath = path.join(__dirname, `public/data/names-${chunkName}.json`);

  if (!fs.existsSync(chunkPath)) {
    console.log(`⚠️  ${chunkName}: File not found`);
    return;
  }

  const data = JSON.parse(fs.readFileSync(chunkPath, 'utf8'));
  const englishCount = data.filter(isEnglishRelated).length;

  totalNames += data.length;
  totalEnglish += englishCount;

  const pct = ((englishCount / data.length) * 100).toFixed(2);
  results.push({
    chunk: chunkName,
    total: data.length,
    english: englishCount,
    percentage: pct
  });

  console.log(`✅ ${chunkName}: ${data.length.toLocaleString()} names → ${englishCount.toLocaleString()} English (${pct}%)`);
});

console.log(`\n${'='.repeat(60)}`);
console.log(`📊 TOTAL RESULTS:`);
console.log(`   Total names across all chunks: ${totalNames.toLocaleString()}`);
console.log(`   Total English names: ${totalEnglish.toLocaleString()}`);
console.log(`   Percentage: ${((totalEnglish / totalNames) * 100).toFixed(2)}%`);
console.log(`${'='.repeat(60)}`);

console.log(`\n❌ CURRENT BUG:`);
console.log(`   Expected English names: ${totalEnglish.toLocaleString()}`);
console.log(`   Actually showing: 8,997`);
console.log(`   Missing: ${(totalEnglish - 8997).toLocaleString()} names!`);

console.log(`\n🎯 ROOT CAUSE:`);
if (totalEnglish > 8997) {
  console.log(`   The filter logic is CORRECT, but NOT ALL CHUNKS ARE LOADING!`);
  console.log(`   Only chunk1 appears to be loaded in the browser.`);
  console.log(`   Solution: Check chunkedDatabaseService.ts loadAllChunks() method`);
} else {
  console.log(`   The filter patterns are INCOMPLETE.`);
  console.log(`   Need to expand patterns to include more English-related origins.`);
}
