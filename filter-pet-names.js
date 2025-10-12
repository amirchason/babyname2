#!/usr/bin/env node

/**
 * Filter Pet Names from Database
 *
 * Removes all names where the meaning contains terms like:
 * - "pet name"
 * - "pet form"
 * - "diminutive"
 * - "nickname"
 * - "short form"
 * etc.
 */

const fs = require('fs');
const path = require('path');

// Terms to search for in meanings (case-insensitive)
const PET_NAME_TERMS = [
  'pet name',
  'pet form',
  'diminutive',
  'nickname',
  'short form',
  'shortened form',
  'informal form',
  'affectionate form',
  'term of endearment'
];

// Check if a name should be filtered out
function isPetName(nameEntry) {
  // Fields to check for pet name indicators
  const fieldsToCheck = [
    nameEntry.meaning,
    nameEntry.meaningShort,
    nameEntry.meaningFull,
    nameEntry.meaningEtymology,
    ...(nameEntry.meanings || [])
  ];

  // Convert all fields to lowercase and join
  const allMeaningText = fieldsToCheck
    .filter(field => field && typeof field === 'string')
    .join(' ')
    .toLowerCase();

  // Check if any pet name term is present
  return PET_NAME_TERMS.some(term => allMeaningText.includes(term));
}

// Process a single chunk file
function processChunkFile(filePath) {
  console.log(`\nProcessing: ${filePath}`);

  // Read the file
  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

  if (!data.names || !Array.isArray(data.names)) {
    console.error(`Error: ${filePath} does not have a valid 'names' array`);
    return;
  }

  const originalCount = data.names.length;
  console.log(`Original count: ${originalCount}`);

  // Filter out pet names
  const filteredNames = data.names.filter(name => !isPetName(name));
  const removedCount = originalCount - filteredNames.length;

  console.log(`Filtered count: ${filteredNames.length}`);
  console.log(`Removed: ${removedCount} pet names`);

  // Update the data
  data.names = filteredNames;

  // Write back to file
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
  console.log(`✓ Updated ${filePath}`);

  return {
    file: path.basename(filePath),
    original: originalCount,
    filtered: filteredNames.length,
    removed: removedCount
  };
}

// Main execution
function main() {
  console.log('=== Pet Name Filter Script ===');
  console.log('Filtering terms:', PET_NAME_TERMS.join(', '));

  const dataDir = path.join(__dirname, 'public', 'data');
  const chunkFiles = [
    path.join(dataDir, 'names-chunk1.json'),
    path.join(dataDir, 'names-chunk2.json'),
    path.join(dataDir, 'names-chunk3.json'),
    path.join(dataDir, 'names-chunk4.json')
  ];

  const results = [];
  let totalOriginal = 0;
  let totalFiltered = 0;
  let totalRemoved = 0;

  // Process each chunk file
  chunkFiles.forEach(filePath => {
    if (fs.existsSync(filePath)) {
      const result = processChunkFile(filePath);
      results.push(result);
      totalOriginal += result.original;
      totalFiltered += result.filtered;
      totalRemoved += result.removed;
    } else {
      console.log(`⚠ File not found: ${filePath}`);
    }
  });

  // Print summary
  console.log('\n=== Summary ===');
  results.forEach(r => {
    console.log(`${r.file}: ${r.original} → ${r.filtered} (removed ${r.removed})`);
  });
  console.log(`\nTotal: ${totalOriginal} → ${totalFiltered}`);
  console.log(`Total removed: ${totalRemoved} pet names`);
  console.log(`Percentage removed: ${((totalRemoved / totalOriginal) * 100).toFixed(2)}%`);
  console.log('\n✓ Done!');
}

// Run the script
main();
