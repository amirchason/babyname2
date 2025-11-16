/**
 * Audit Gender Information in Curated Lists V3
 * Checks ALL database sources with proper format handling
 */

const fs = require('fs');
const path = require('path');

console.log('Loading all database sources...\n');

// Load ALL database chunks (standard format)
const chunk1 = require('../public/data/names-chunk1.json');
const chunk2 = require('../public/data/names-chunk2.json');
const chunk3 = require('../public/data/names-chunk3.json');
const chunk4 = require('../public/data/names-chunk4.json');
const chunk5 = require('../public/data/names-chunk5.json');

// Load additional databases (different formats)
const popularNamesData = require('../public/data/popularNames_cache.json');
const ultimateNamesData = require('../public/data/ultimateNames_tier1.json');

// Normalize popularNames format
const popularNames = (popularNamesData.names || []).map(name => ({
  name: name.name,
  gender: name.gender?.Male > 0.5 ? 'Male' : name.gender?.Female > 0.5 ? 'Female' : 'Unisex',
  origin: name.origin || 'Unknown'
}));

// Normalize ultimateNames format
const ultimateNames = (ultimateNamesData.names || []).map(name => ({
  name: name.n,
  gender: name.g === 'M' ? 'Male' : name.g === 'F' ? 'Female' : 'Unisex',
  origin: name.o || 'Unknown'
}));

// Combine all sources
const allNames = [
  ...chunk1,
  ...chunk2,
  ...chunk3,
  ...chunk4,
  ...chunk5,
  ...popularNames,
  ...ultimateNames
];

console.log(`Database Sources:`);
console.log(`  chunk1: ${chunk1.length} names`);
console.log(`  chunk2: ${chunk2.length} names`);
console.log(`  chunk3: ${chunk3.length} names`);
console.log(`  chunk4: ${chunk4.length} names`);
console.log(`  chunk5: ${chunk5.length} names`);
console.log(`  popularNames: ${popularNames.length} names`);
console.log(`  ultimateNames: ${ultimateNames.length} names`);
console.log(`  Total loaded: ${allNames.length} names\n`);

// Create lookup map with source tracking
const nameMap = new Map();
const nameSources = new Map();

let chunkIndex = 0;
const chunkSizes = [chunk1.length, chunk2.length, chunk3.length, chunk4.length, chunk5.length, popularNames.length, ultimateNames.length];
const chunkNames = ['chunk1', 'chunk2', 'chunk3', 'chunk4', 'chunk5', 'popularNames', 'ultimateNames'];

allNames.forEach((name, index) => {
  const nameLower = name.name.toLowerCase();

  if (!nameMap.has(nameLower)) {
    nameMap.set(nameLower, name);

    // Determine source
    let cumulative = 0;
    let source = 'unknown';
    for (let i = 0; i < chunkSizes.length; i++) {
      cumulative += chunkSizes[i];
      if (index < cumulative) {
        source = chunkNames[i];
        break;
      }
    }

    nameSources.set(nameLower, source);
  }
});

console.log(`Unique names in database: ${nameMap.size}\n`);

// Extract all list names from themedLists.ts
const themedListsContent = fs.readFileSync(
  path.join(__dirname, '../src/data/themedLists.ts'),
  'utf8'
);

// Parse specificNames arrays from the file
const nameListMatches = themedListsContent.matchAll(/specificNames:\s*\[([\s\S]*?)\]/g);
const allListNames = new Set();

for (const match of nameListMatches) {
  const namesBlock = match[1];
  const names = namesBlock.match(/'([^']+)'/g);
  if (names) {
    names.forEach(name => {
      const cleanName = name.replace(/'/g, '').trim();
      if (cleanName) {
        allListNames.add(cleanName);
      }
    });
  }
}

console.log(`📊 CURATED LISTS GENDER AUDIT V3 (ALL SOURCES)`);
console.log(`${'='.repeat(80)}\n`);
console.log(`Total unique names in curated lists: ${allListNames.size}`);

// Audit results
const issues = {
  notFound: [],
  missingGender: [],
  correct: 0,
  sourceStats: {}
};

// Check each name
allListNames.forEach(listName => {
  const dbName = nameMap.get(listName.toLowerCase());

  if (!dbName) {
    issues.notFound.push(listName);
    return;
  }

  // Track source
  const source = nameSources.get(listName.toLowerCase());
  issues.sourceStats[source] = (issues.sourceStats[source] || 0) + 1;

  if (!dbName.gender || dbName.gender === 'Unknown' || dbName.gender === 'Unisex') {
    issues.missingGender.push({
      name: listName,
      dbEntry: dbName,
      source: source
    });
    return;
  }

  // All others are correct
  issues.correct++;
});

// Report findings
console.log(`\n✅ Correct Gender Info: ${issues.correct} names`);
console.log(`\n📂 Source Breakdown:`);
Object.entries(issues.sourceStats)
  .sort((a, b) => b[1] - a[1])
  .forEach(([source, count]) => {
    console.log(`  ${source}: ${count} names`);
  });

if (issues.notFound.length > 0) {
  console.log(`\n❌ NOT FOUND IN ANY DATABASE: ${issues.notFound.length} names`);
  console.log(`${'─'.repeat(80)}`);
  console.log(`First 100 missing names:`);
  issues.notFound.slice(0, 100).forEach(name => console.log(`  - ${name}`));
  if (issues.notFound.length > 100) {
    console.log(`  ... and ${issues.notFound.length - 100} more`);
  }
}

if (issues.missingGender.length > 0) {
  console.log(`\n⚠️  MISSING/UNKNOWN/UNISEX GENDER: ${issues.missingGender.length} names`);
  console.log(`${'─'.repeat(80)}`);

  // Group by source
  const bySource = {};
  issues.missingGender.forEach(item => {
    if (!bySource[item.source]) bySource[item.source] = [];
    bySource[item.source].push(item);
  });

  Object.entries(bySource).forEach(([source, items]) => {
    console.log(`\n  From ${source}: ${items.length} names`);
    items.slice(0, 10).forEach(({ name, dbEntry }) => {
      console.log(`    - ${name} (gender: ${dbEntry.gender || 'Unknown'}, origin: ${dbEntry.origin || 'Unknown'})`);
    });
    if (items.length > 10) {
      console.log(`    ... and ${items.length - 10} more`);
    }
  });
}

// Save detailed report
const report = {
  timestamp: new Date().toISOString(),
  totalNamesAudited: allListNames.size,
  databaseSources: {
    chunk1: chunk1.length,
    chunk2: chunk2.length,
    chunk3: chunk3.length,
    chunk4: chunk4.length,
    chunk5: chunk5.length,
    popularNames: popularNames.length,
    ultimateNames: ultimateNames.length,
    totalLoaded: allNames.length,
    uniqueNames: nameMap.size
  },
  summary: {
    correct: issues.correct,
    notFound: issues.notFound.length,
    missingGender: issues.missingGender.length,
    sourceStats: issues.sourceStats
  },
  details: {
    notFound: issues.notFound,
    missingGender: issues.missingGender.map(i => ({
      name: i.name,
      gender: i.dbEntry.gender,
      origin: i.dbEntry.origin,
      source: i.source
    }))
  }
};

const reportPath = path.join(__dirname, 'curatedListsGenderAuditV3.json');
fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

console.log(`\n📝 Detailed report saved to: ${reportPath}`);
console.log(`\n${'='.repeat(80)}\n`);
