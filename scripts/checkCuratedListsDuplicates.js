/**
 * Check Curated Lists for Duplicate Names
 * Identifies names that appear in multiple themed lists
 */

const fs = require('fs');
const path = require('path');

console.log('\n🔍 CURATED LISTS DUPLICATE ANALYSIS');
console.log(`${'='.repeat(80)}\n`);

// Load themedLists.ts file
const themedListsPath = path.join(__dirname, '../src/data/themedLists.ts');
const themedListsContent = fs.readFileSync(themedListsPath, 'utf8');

// Extract all list definitions
const listMatches = themedListsContent.matchAll(/\{[\s\S]*?id:\s*'([^']+)'[\s\S]*?title:\s*'([^']+)'[\s\S]*?specificNames:\s*\[([\s\S]*?)\]/g);

const lists = [];
const nameToLists = new Map(); // Map of name -> list IDs where it appears

for (const match of listMatches) {
  const listId = match[1];
  const listTitle = match[2];
  const namesBlock = match[3];

  // Extract names from this list
  const nameMatches = namesBlock.match(/'([^']+)'/g);
  const names = nameMatches ? nameMatches.map(n => n.replace(/'/g, '').trim()) : [];

  lists.push({
    id: listId,
    title: listTitle,
    names: names,
    count: names.length
  });

  // Track which lists each name appears in
  names.forEach(name => {
    if (!nameToLists.has(name)) {
      nameToLists.set(name, []);
    }
    nameToLists.get(name).push({ id: listId, title: listTitle });
  });
}

console.log(`📋 Total lists analyzed: ${lists.length}`);
console.log(`📊 Total unique names across all lists: ${nameToLists.size}`);

// Find duplicates
const duplicates = [];
const duplicateNames = new Set();

nameToLists.forEach((appearsList, name) => {
  if (appearsList.length > 1) {
    duplicates.push({
      name: name,
      count: appearsList.length,
      lists: appearsList
    });
    duplicateNames.add(name);
  }
});

// Sort by most duplicated first
duplicates.sort((a, b) => b.count - a.count);

console.log(`\n🔴 Duplicate names found: ${duplicates.length}`);
console.log(`${'─'.repeat(80)}\n`);

if (duplicates.length === 0) {
  console.log('✅ No duplicates found! All names are unique across lists.');
} else {
  // Group by duplication count
  const byCount = {};
  duplicates.forEach(dup => {
    if (!byCount[dup.count]) byCount[dup.count] = [];
    byCount[dup.count].push(dup);
  });

  // Report by duplication level
  Object.keys(byCount).sort((a, b) => b - a).forEach(count => {
    const dups = byCount[count];
    console.log(`\n📌 Names appearing in ${count} lists: ${dups.length} names`);
    console.log(`${'─'.repeat(80)}`);

    dups.slice(0, 10).forEach(dup => {
      console.log(`\n  "${dup.name}" appears in ${dup.count} lists:`);
      dup.lists.forEach(list => {
        console.log(`    • ${list.title} (${list.id})`);
      });
    });

    if (dups.length > 10) {
      console.log(`\n  ... and ${dups.length - 10} more names appearing in ${count} lists`);
    }
  });
}

// Analyze overlap between specific list pairs
console.log(`\n\n📊 LIST OVERLAP ANALYSIS`);
console.log(`${'='.repeat(80)}\n`);

const overlapMatrix = [];

for (let i = 0; i < lists.length; i++) {
  for (let j = i + 1; j < lists.length; j++) {
    const list1 = lists[i];
    const list2 = lists[j];

    const overlap = list1.names.filter(name => list2.names.includes(name));

    if (overlap.length > 0) {
      overlapMatrix.push({
        list1: { id: list1.id, title: list1.title, count: list1.count },
        list2: { id: list2.id, title: list2.title, count: list2.count },
        overlapCount: overlap.length,
        overlapPercentage1: ((overlap.length / list1.count) * 100).toFixed(1),
        overlapPercentage2: ((overlap.length / list2.count) * 100).toFixed(1),
        overlapNames: overlap
      });
    }
  }
}

// Sort by overlap count
overlapMatrix.sort((a, b) => b.overlapCount - a.overlapCount);

console.log(`Top 20 list pairs with most overlap:\n`);
overlapMatrix.slice(0, 20).forEach((overlap, index) => {
  console.log(`${index + 1}. "${overlap.list1.title}" ↔ "${overlap.list2.title}"`);
  console.log(`   Overlap: ${overlap.overlapCount} names (${overlap.overlapPercentage1}% of list1, ${overlap.overlapPercentage2}% of list2)`);
  if (overlap.overlapCount <= 5) {
    console.log(`   Names: ${overlap.overlapNames.join(', ')}`);
  }
  console.log('');
});

// Statistics per list
console.log(`\n📊 DUPLICATE STATISTICS PER LIST`);
console.log(`${'='.repeat(80)}\n`);

const listStats = lists.map(list => {
  const duplicateNamesInList = list.names.filter(name => duplicateNames.has(name));
  return {
    id: list.id,
    title: list.title,
    totalNames: list.count,
    duplicateCount: duplicateNamesInList.length,
    duplicatePercentage: ((duplicateNamesInList.length / list.count) * 100).toFixed(1),
    uniqueCount: list.count - duplicateNamesInList.length
  };
});

// Sort by highest duplicate percentage
listStats.sort((a, b) => b.duplicatePercentage - a.duplicatePercentage);

console.log(`Lists with highest duplicate percentages:\n`);
listStats.slice(0, 15).forEach((stat, index) => {
  console.log(`${index + 1}. ${stat.title} (${stat.id})`);
  console.log(`   Total: ${stat.totalNames} names | Duplicates: ${stat.duplicateCount} (${stat.duplicatePercentage}%) | Unique: ${stat.uniqueCount}`);
  console.log('');
});

// Save detailed report
const report = {
  timestamp: new Date().toISOString(),
  summary: {
    totalLists: lists.length,
    totalUniqueNames: nameToLists.size,
    totalDuplicateNames: duplicates.length,
    duplicatePercentage: ((duplicates.length / nameToLists.size) * 100).toFixed(2)
  },
  duplicates: duplicates,
  overlapMatrix: overlapMatrix,
  listStats: listStats,
  allLists: lists.map(l => ({
    id: l.id,
    title: l.title,
    count: l.count
  }))
};

const reportPath = path.join(__dirname, 'curatedListsDuplicatesReport.json');
fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

console.log(`\n📝 Detailed report saved to: ${reportPath}`);
console.log(`\n${'='.repeat(80)}\n`);

// Final summary
console.log(`\n✨ SUMMARY:`);
console.log(`  • Total lists: ${lists.length}`);
console.log(`  • Total unique names: ${nameToLists.size}`);
console.log(`  • Duplicate names: ${duplicates.length} (${report.summary.duplicatePercentage}%)`);
console.log(`  • List pairs with overlap: ${overlapMatrix.length}`);
console.log('');
