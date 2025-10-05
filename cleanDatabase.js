#!/usr/bin/env node

/**
 * Clean Database Script
 * Removes all old meanings and origins to prepare for GPT-4 processing
 * Run with: node cleanDatabase.js
 */

const fs = require('fs');
const path = require('path');

// Stats tracking
let totalNames = 0;
let cleanedFields = {
  origin: 0,
  origins: 0,
  meanings: 0,
  meaningShort: 0,
  meaningFull: 0,
  meaningEtymology: 0
};

/**
 * Clean a single name entry
 */
function cleanNameEntry(name) {
  // Track what we're removing
  if (name.origin) cleanedFields.origin++;
  if (name.origins) cleanedFields.origins++;
  if (name.meanings) cleanedFields.meanings++;
  if (name.meaningShort) cleanedFields.meaningShort++;
  if (name.meaningFull) cleanedFields.meaningFull++;
  if (name.meaningEtymology) cleanedFields.meaningEtymology++;

  // Remove all meaning and origin related fields
  delete name.origin;
  delete name.origins;
  delete name.originsDetails;
  delete name.originProcessed;
  delete name.originProcessedAt;
  delete name.originSource;

  delete name.meaning;
  delete name.meaningShort;
  delete name.meaningFull;
  delete name.meanings;
  delete name.meaningEtymology;
  delete name.meaningProcessed;
  delete name.meaningProcessedAt;
  delete name.meaningSource;

  // Also remove the old processing flags
  delete name.originProcessed;
  delete name.meaningProcessed;

  totalNames++;
  return name;
}

/**
 * Process a chunk file
 */
function processChunk(chunkFile) {
  console.log(`\nProcessing ${chunkFile}...`);

  const filePath = path.join('public', 'data', chunkFile);

  if (!fs.existsSync(filePath)) {
    console.log(`Skipping ${chunkFile} - file not found`);
    return 0;
  }

  // Load chunk
  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  const names = data.names || [];

  console.log(`Found ${names.length} names in ${chunkFile}`);

  // Clean each name
  for (let i = 0; i < names.length; i++) {
    if (typeof names[i] === 'object') {
      names[i] = cleanNameEntry(names[i]);
    }
  }

  // Save cleaned chunk
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  console.log(`✓ Cleaned ${names.length} names in ${chunkFile}`);

  return names.length;
}

/**
 * Clean old progress files
 */
function cleanProgressFiles() {
  const progressFiles = [
    'top10000_progress.json',
    'meanings_progress.json',
    'origin_progress.json',
    'real_meanings_progress.json',
    'real_meanings_errors.log',
    'gpt4_progress.json'  // Will be created by new script
  ];

  console.log('\nCleaning old progress files...');
  for (const file of progressFiles) {
    if (fs.existsSync(file)) {
      fs.unlinkSync(file);
      console.log(`  ✓ Deleted ${file}`);
    }
  }
}

/**
 * Main function
 */
function main() {
  console.log('='.repeat(60));
  console.log('DATABASE CLEANING SCRIPT');
  console.log('Removing all old meanings and origins');
  console.log('='.repeat(60));

  const startTime = Date.now();

  // Process each chunk
  const chunks = [
    'names-core.json',     // 945 names
    'names-chunk1.json',   // 29,012 names
    'names-chunk2.json',   // 39,011 names
    'names-chunk3.json',   // 39,011 names
    'names-chunk4.json'    // 39,011 names
  ];

  let totalProcessed = 0;

  for (const chunk of chunks) {
    const processed = processChunk(chunk);
    totalProcessed += processed;
  }

  // Clean progress files
  cleanProgressFiles();

  const duration = Math.round((Date.now() - startTime) / 1000);

  // Final summary
  console.log('\n' + '='.repeat(60));
  console.log('CLEANING COMPLETE!');
  console.log(`Total names cleaned: ${totalNames}`);
  console.log('\nFields removed:');
  console.log(`  - origin: ${cleanedFields.origin} entries`);
  console.log(`  - origins: ${cleanedFields.origins} entries`);
  console.log(`  - meanings: ${cleanedFields.meanings} entries`);
  console.log(`  - meaningShort: ${cleanedFields.meaningShort} entries`);
  console.log(`  - meaningFull: ${cleanedFields.meaningFull} entries`);
  console.log(`  - meaningEtymology: ${cleanedFields.meaningEtymology} entries`);
  console.log(`\nTime taken: ${duration} seconds`);
  console.log('\nDatabase is now ready for GPT-4 processing!');
  console.log('='.repeat(60));
}

// Run the script
main();