/**
 * Audit Gender Information in Curated Lists
 * Checks all names in themed lists against the database and reports gender issues
 */

const fs = require('fs');
const path = require('path');

// Load the main names from chunks
const chunk1 = require('../public/data/names-chunk1.json');
const chunk2 = require('../public/data/names-chunk2.json');
const chunk3 = require('../public/data/names-chunk3.json');
const chunk4 = require('../public/data/names-chunk4.json');

// Combine all chunks
const allNames = [...chunk1, ...chunk2, ...chunk3, ...chunk4];

// Create lookup map
const nameMap = new Map();
allNames.forEach(name => {
  nameMap.set(name.name.toLowerCase(), name);
});

// Common male and female name patterns for validation
const commonMaleNames = new Set([
  'alexander', 'andrew', 'anthony', 'benjamin', 'christopher', 'daniel', 'david', 'ethan',
  'james', 'john', 'joseph', 'joshua', 'liam', 'lucas', 'matthew', 'michael', 'noah',
  'oliver', 'ryan', 'samuel', 'william', 'aiden', 'connor', 'dylan', 'jacob', 'logan',
  'mason', 'nathan', 'owen', 'sebastian', 'thomas', 'zachary', 'alessandro', 'antonio',
  'bruno', 'carlo', 'dante', 'enzo', 'fabio', 'franco', 'giovanni', 'lorenzo', 'luca',
  'luigi', 'marco', 'mario', 'matteo', 'paolo', 'pietro', 'stefano', 'vincenzo'
]);

const commonFemaleNames = new Set([
  'abigail', 'alice', 'amelia', 'anna', 'ava', 'charlotte', 'chloe', 'elizabeth', 'ella',
  'emily', 'emma', 'evelyn', 'grace', 'harper', 'isabella', 'lily', 'madison', 'mia',
  'olivia', 'sarah', 'sophia', 'victoria', 'zoe', 'bridget', 'ciara', 'erin', 'fiona',
  'kate', 'maeve', 'molly', 'nora', 'riley', 'shannon', 'alessandra', 'angelina', 'arianna',
  'bella', 'bianca', 'camilla', 'chiara', 'elena', 'emilia', 'francesca', 'gabriella',
  'giulia', 'isabella', 'laura', 'lucia', 'maria', 'monica', 'paola', 'rosa', 'serena',
  'sofia', 'valentina'
]);

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

console.log(`\n📊 CURATED LISTS GENDER AUDIT`);
console.log(`${'='.repeat(80)}\n`);
console.log(`Total unique names in curated lists: ${allListNames.size}`);

// Audit results
const issues = {
  notFound: [],
  missingGender: [],
  suspectedWrongGender: [],
  correct: 0
};

// Check each name
allListNames.forEach(listName => {
  const dbName = nameMap.get(listName.toLowerCase());

  if (!dbName) {
    issues.notFound.push(listName);
    return;
  }

  if (!dbName.gender || dbName.gender === 'Unknown') {
    issues.missingGender.push({ name: listName, dbEntry: dbName });
    return;
  }

  // Check for suspected wrong gender
  const nameLower = listName.toLowerCase();
  const currentGender = dbName.gender;

  if (currentGender === 'Male' && commonFemaleNames.has(nameLower)) {
    issues.suspectedWrongGender.push({
      name: listName,
      currentGender: 'Male',
      suspectedGender: 'Female',
      reason: 'Common female name'
    });
  } else if (currentGender === 'Female' && commonMaleNames.has(nameLower)) {
    issues.suspectedWrongGender.push({
      name: listName,
      currentGender: 'Female',
      suspectedGender: 'Male',
      reason: 'Common male name'
    });
  } else {
    issues.correct++;
  }
});

// Report findings
console.log(`\n✅ Correct Gender Info: ${issues.correct} names\n`);

if (issues.notFound.length > 0) {
  console.log(`\n❌ NOT FOUND IN DATABASE: ${issues.notFound.length} names`);
  console.log(`${'─'.repeat(80)}`);
  issues.notFound.forEach(name => console.log(`  - ${name}`));
}

if (issues.missingGender.length > 0) {
  console.log(`\n⚠️  MISSING GENDER INFO: ${issues.missingGender.length} names`);
  console.log(`${'─'.repeat(80)}`);
  issues.missingGender.slice(0, 20).forEach(({ name, dbEntry }) => {
    console.log(`  - ${name} (origin: ${dbEntry.origin || 'Unknown'})`);
  });
  if (issues.missingGender.length > 20) {
    console.log(`  ... and ${issues.missingGender.length - 20} more`);
  }
}

if (issues.suspectedWrongGender.length > 0) {
  console.log(`\n🚨 SUSPECTED WRONG GENDER: ${issues.suspectedWrongGender.length} names`);
  console.log(`${'─'.repeat(80)}`);
  issues.suspectedWrongGender.forEach(({ name, currentGender, suspectedGender, reason }) => {
    console.log(`  - ${name}: Database says "${currentGender}", likely "${suspectedGender}" (${reason})`);
  });
}

// Save detailed report
const report = {
  timestamp: new Date().toISOString(),
  totalNamesAudited: allListNames.size,
  summary: {
    correct: issues.correct,
    notFound: issues.notFound.length,
    missingGender: issues.missingGender.length,
    suspectedWrong: issues.suspectedWrongGender.length
  },
  details: {
    notFound: issues.notFound,
    missingGender: issues.missingGender.map(i => ({
      name: i.name,
      origin: i.dbEntry.origin,
      meaning: i.dbEntry.meaning
    })),
    suspectedWrongGender: issues.suspectedWrongGender
  }
};

const reportPath = path.join(__dirname, 'curatedListsGenderAudit.json');
fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

console.log(`\n📝 Detailed report saved to: ${reportPath}`);
console.log(`\n${'='.repeat(80)}\n`);
