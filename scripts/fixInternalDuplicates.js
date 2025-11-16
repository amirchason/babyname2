/**
 * Fix Internal Duplicates in Curated Lists
 * Automatically removes duplicate entries within the same list
 */

const fs = require('fs');
const path = require('path');

console.log('\n🔧 FIXING INTERNAL DUPLICATES');
console.log(`${'='.repeat(80)}\n`);

// Load themedLists.ts file
const themedListsPath = path.join(__dirname, '../src/data/themedLists.ts');
let themedListsContent = fs.readFileSync(themedListsPath, 'utf8');

// Backup original file
const backupPath = path.join(__dirname, '../src/data/themedLists.ts.backup');
fs.writeFileSync(backupPath, themedListsContent);
console.log(`📋 Created backup: ${backupPath}\n`);

let totalDuplicatesRemoved = 0;
let listsFixed = 0;

// Process each list
const listMatches = [...themedListsContent.matchAll(/(\{[\s\S]*?id:\s*'([^']+)'[\s\S]*?title:\s*'([^']+)'[\s\S]*?specificNames:\s*\[)([\s\S]*?)(\])/g)];

console.log(`📊 Processing ${listMatches.length} lists...\n`);

listMatches.forEach((match, index) => {
  const fullMatch = match[0];
  const beforeNames = match[1];
  const listId = match[2];
  const listTitle = match[3];
  const namesBlock = match[4];
  const afterNames = match[5];

  // Extract names
  const nameMatches = [...namesBlock.matchAll(/'([^']+)'/g)];
  const names = nameMatches.map(n => n[1].trim());

  // Remove duplicates while preserving order (keeps first occurrence)
  const uniqueNames = [];
  const seen = new Set();
  const duplicatesInThisList = [];

  names.forEach(name => {
    if (!seen.has(name)) {
      seen.add(name);
      uniqueNames.push(name);
    } else {
      duplicatesInThisList.push(name);
    }
  });

  if (duplicatesInThisList.length > 0) {
    listsFixed++;
    totalDuplicatesRemoved += duplicatesInThisList.length;

    console.log(`${listsFixed}. "${listTitle}" (${listId})`);
    console.log(`   Removed ${duplicatesInThisList.length} duplicate(s): ${duplicatesInThisList.join(', ')}`);

    // Reconstruct the names array with proper formatting
    const indentMatch = namesBlock.match(/\n(\s+)'/);
    const indent = indentMatch ? indentMatch[1] : '      ';

    const newNamesBlock = uniqueNames.map(name => `'${name}'`).join(`, `);

    // Replace in content
    const newFullMatch = beforeNames + newNamesBlock + afterNames;
    themedListsContent = themedListsContent.replace(fullMatch, newFullMatch);
  }
});

if (listsFixed > 0) {
  // Save fixed file
  fs.writeFileSync(themedListsPath, themedListsContent);

  console.log(`\n${'='.repeat(80)}\n`);
  console.log(`✅ Fixed ${listsFixed} list(s)`);
  console.log(`✅ Removed ${totalDuplicatesRemoved} duplicate entries`);
  console.log(`\n💾 Saved to: ${themedListsPath}`);
  console.log(`📋 Backup saved to: ${backupPath}`);
} else {
  console.log(`\n✨ No duplicates found! All lists are clean.`);
}

console.log(`\n${'='.repeat(80)}\n`);
