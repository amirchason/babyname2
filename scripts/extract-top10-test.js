#!/usr/bin/env node

/**
 * Extract Top 10 Names for V10 Enrichment Test
 *
 * Extracts the top 10 most popular baby names from the database
 * and saves them to a JSON file for batch processing.
 */

const fs = require('fs');
const path = require('path');

console.log('📚 Extracting Top 10 Names from Database');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

// Top 10 names from SSA 2024 rankings (from largeFallbackNames.ts)
const top10 = [
  { name: 'Liam', gender: 'male', origin: 'Irish', meaning: 'Strong-willed warrior', popularityRank: 1 },
  { name: 'Olivia', gender: 'female', origin: 'Latin', meaning: 'Olive tree', popularityRank: 2 },
  { name: 'Noah', gender: 'male', origin: 'Hebrew', meaning: 'Rest, comfort', popularityRank: 3 },
  { name: 'Emma', gender: 'female', origin: 'Germanic', meaning: 'Universal', popularityRank: 4 },
  { name: 'Oliver', gender: 'male', origin: 'Latin', meaning: 'Olive tree', popularityRank: 5 },
  { name: 'Amelia', gender: 'female', origin: 'Germanic', meaning: 'Work', popularityRank: 6 },
  { name: 'Theodore', gender: 'male', origin: 'Greek', meaning: 'Gift of God', popularityRank: 7 },
  { name: 'Charlotte', gender: 'female', origin: 'French', meaning: 'Free woman', popularityRank: 8 },
  { name: 'James', gender: 'male', origin: 'Hebrew', meaning: 'Supplanter', popularityRank: 9 },
  { name: 'Mia', gender: 'female', origin: 'Italian', meaning: 'Mine', popularityRank: 10 }
];

console.log(`✅ Found ${top10.length} names\n`);

// Display the top 10
console.log('🏆 TOP 10 BABY NAMES:');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

top10.forEach((name, index) => {
  console.log(`${index + 1}. ${name.name} (${name.gender})`);
  console.log(`   Origin: ${name.origin}`);
  console.log(`   Meaning: ${name.meaning}`);
  console.log();
});

// Create output directory if it doesn't exist
const outputDir = path.join(__dirname, 'data');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Save to JSON file
const outputPath = path.join(outputDir, 'top10-test.json');
fs.writeFileSync(outputPath, JSON.stringify(top10, null, 2));

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log(`✅ Saved to: ${outputPath}`);
console.log('\n📝 Next step: Run batch enrichment');
console.log('   node scripts/batch-v10-top10.js');
