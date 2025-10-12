#!/usr/bin/env node

/**
 * Normalize African Origins
 * Consolidates all African sub-origins (West African, East African, African (Twi), etc.)
 * into a single "African" origin
 */

const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, 'public', 'data');
const CHUNK_FILES = [
  'names-chunk1.json',
  'names-chunk2.json',
  'names-chunk3.json',
  'names-chunk4.json'
];

let stats = {
  totalNames: 0,
  normalized: 0,
  alreadyAfrican: 0
};

console.log('🌍 Normalizing African Origins...\n');
console.log('═'.repeat(60));

// Process each chunk
CHUNK_FILES.forEach(chunkFile => {
  const filePath = path.join(DATA_DIR, chunkFile);

  if (!fs.existsSync(filePath)) {
    console.log(`⚠️  Skipping ${chunkFile} (not found)`);
    return;
  }

  console.log(`\n📦 Processing ${chunkFile}...`);

  // Load chunk
  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  const names = Array.isArray(data) ? data : data.names || [];

  let chunkNormalized = 0;

  // Normalize origins
  names.forEach(name => {
    stats.totalNames++;

    if (!name.origin) return;

    const originStr = name.origin.toString();
    const originLower = originStr.toLowerCase();

    // Check if it's an African variant
    if (originLower.includes('african')) {
      if (originStr === 'African') {
        stats.alreadyAfrican++;
      } else {
        // Normalize to "African"
        console.log(`  • ${name.name}: "${originStr}" → "African"`);
        name.origin = 'African';
        stats.normalized++;
        chunkNormalized++;
      }
    }
  });

  // Save updated chunk
  fs.writeFileSync(filePath, JSON.stringify(names, null, 2));
  console.log(`  ✓ Normalized ${chunkNormalized} names in ${chunkFile}`);
});

console.log('\n' + '═'.repeat(60));
console.log('✅ NORMALIZATION COMPLETE!\n');
console.log('📊 STATISTICS:');
console.log(`  Total names processed: ${stats.totalNames.toLocaleString()}`);
console.log(`  Already "African": ${stats.alreadyAfrican.toLocaleString()}`);
console.log(`  Normalized to "African": ${stats.normalized.toLocaleString()}`);
console.log('═'.repeat(60));
console.log();
