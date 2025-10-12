#!/usr/bin/env node

/**
 * Diagnostic script to check name loading
 */

const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, 'public', 'data');

console.log('🔍 Diagnosing name loading issue...\n');
console.log('═'.repeat(60));

// Check core file
const coreFile = path.join(DATA_DIR, 'names-core.json');
if (fs.existsSync(coreFile)) {
  const coreData = JSON.parse(fs.readFileSync(coreFile, 'utf8'));
  const coreNames = coreData.names || coreData;
  console.log(`📦 Core file: ${coreNames.length} names`);
  console.log(`   Structure: ${Array.isArray(coreData) ? 'Array' : 'Object with keys: ' + Object.keys(coreData).join(', ')}`);
}

// Check chunk files
for (let i = 1; i <= 4; i++) {
  const chunkFile = path.join(DATA_DIR, `names-chunk${i}.json`);
  if (fs.existsSync(chunkFile)) {
    const chunkData = JSON.parse(fs.readFileSync(chunkFile, 'utf8'));
    const chunkNames = Array.isArray(chunkData) ? chunkData : (chunkData.names || []);
    console.log(`📦 Chunk ${i}: ${chunkNames.length} names`);
    console.log(`   Structure: ${Array.isArray(chunkData) ? 'Array' : 'Object with keys: ' + Object.keys(chunkData).join(', ')}`);
  }
}

console.log('═'.repeat(60));

// Calculate total
let total = 0;
if (fs.existsSync(coreFile)) {
  const coreData = JSON.parse(fs.readFileSync(coreFile, 'utf8'));
  total += (coreData.names || coreData).length;
}
for (let i = 1; i <= 4; i++) {
  const chunkFile = path.join(DATA_DIR, `names-chunk${i}.json`);
  if (fs.existsSync(chunkFile)) {
    const chunkData = JSON.parse(fs.readFileSync(chunkFile, 'utf8'));
    total += (Array.isArray(chunkData) ? chunkData : (chunkData.names || [])).length;
  }
}

console.log(`\n✅ TOTAL NAMES IN FILES: ${total.toLocaleString()}`);
console.log('═'.repeat(60));
