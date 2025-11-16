/**
 * Check for Internal Duplicates in Curated Lists
 * Finds names that appear MULTIPLE TIMES within the SAME list
 */

const fs = require('fs');
const path = require('path');

console.log('\n🔍 INTERNAL DUPLICATES ANALYSIS');
console.log('Checking for names that appear 2+ times within the SAME list');
console.log(`${'='.repeat(80)}\n`);

// Load themedLists.ts file
const themedListsPath = path.join(__dirname, '../src/data/themedLists.ts');
const themedListsContent = fs.readFileSync(themedListsPath, 'utf8');

// Extract all list definitions
const listMatches = themedListsContent.matchAll(/\{[\s\S]*?id:\s*'([^']+)'[\s\S]*?title:\s*'([^']+)'[\s\S]*?specificNames:\s*\[([\s\S]*?)\]/g);

const listsWithDuplicates = [];
let totalDuplicatesFound = 0;
let totalListsChecked = 0;

for (const match of listMatches) {
  const listId = match[1];
  const listTitle = match[2];
  const namesBlock = match[3];

  // Extract names from this list
  const nameMatches = namesBlock.match(/'([^']+)'/g);
  const names = nameMatches ? nameMatches.map(n => n.replace(/'/g, '').trim()) : [];

  totalListsChecked++;

  // Count occurrences of each name in this list
  const nameCounts = new Map();
  names.forEach(name => {
    nameCounts.set(name, (nameCounts.get(name) || 0) + 1);
  });

  // Find duplicates within this list
  const duplicates = [];
  nameCounts.forEach((count, name) => {
    if (count > 1) {
      duplicates.push({ name, count });
    }
  });

  if (duplicates.length > 0) {
    // Sort by count descending
    duplicates.sort((a, b) => b.count - a.count);

    listsWithDuplicates.push({
      id: listId,
      title: listTitle,
      totalNames: names.length,
      uniqueNames: nameCounts.size,
      duplicates: duplicates,
      duplicateCount: duplicates.length
    });

    totalDuplicatesFound += duplicates.reduce((sum, d) => sum + (d.count - 1), 0);
  }
}

console.log(`📋 Total lists checked: ${totalListsChecked}\n`);

if (listsWithDuplicates.length === 0) {
  console.log('✅ No internal duplicates found! All lists are clean.');
} else {
  console.log(`🔴 Lists with internal duplicates: ${listsWithDuplicates.length}`);
  console.log(`🔴 Total duplicate entries: ${totalDuplicatesFound}\n`);
  console.log(`${'='.repeat(80)}\n`);

  // Report each list with duplicates
  listsWithDuplicates.forEach((list, index) => {
    console.log(`${index + 1}. "${list.title}" (${list.id})`);
    console.log(`   Total names: ${list.totalNames} | Unique names: ${list.uniqueNames} | Duplicate entries: ${list.totalNames - list.uniqueNames}`);
    console.log(`   Duplicates found:`);

    list.duplicates.forEach(dup => {
      console.log(`     • "${dup.name}" appears ${dup.count} times`);
    });
    console.log('');
  });

  // Detailed breakdown
  console.log(`\n${'='.repeat(80)}`);
  console.log(`\n📊 DETAILED BREAKDOWN:\n`);

  listsWithDuplicates.forEach(list => {
    console.log(`\n"${list.title}" (${list.id}):`);
    console.log(`${'─'.repeat(80)}`);
    list.duplicates.forEach(dup => {
      console.log(`  "${dup.name}" - appears ${dup.count} times (${dup.count - 1} duplicate${dup.count > 2 ? 's' : ''})`);
    });
  });
}

// Save report
const report = {
  timestamp: new Date().toISOString(),
  summary: {
    totalListsChecked: totalListsChecked,
    listsWithDuplicates: listsWithDuplicates.length,
    totalDuplicateEntries: totalDuplicatesFound,
    cleanLists: totalListsChecked - listsWithDuplicates.length
  },
  listsWithDuplicates: listsWithDuplicates
};

const reportPath = path.join(__dirname, 'internalDuplicatesReport.json');
fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

console.log(`\n\n📝 Detailed report saved to: ${reportPath}`);
console.log(`\n${'='.repeat(80)}\n`);

// Summary
console.log(`✨ SUMMARY:`);
console.log(`  • Total lists checked: ${totalListsChecked}`);
console.log(`  • Lists with internal duplicates: ${listsWithDuplicates.length}`);
console.log(`  • Clean lists: ${totalListsChecked - listsWithDuplicates.length}`);
console.log(`  • Total duplicate entries to remove: ${totalDuplicatesFound}`);
console.log('');

if (listsWithDuplicates.length > 0) {
  console.log(`\n⚠️  ACTION NEEDED: Remove ${totalDuplicatesFound} duplicate entries from ${listsWithDuplicates.length} list(s)\n`);
}
