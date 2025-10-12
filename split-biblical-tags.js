#!/usr/bin/env node
/**
 * Split Biblical-Combined Origin Tags
 * Converts origins like ["Hebrew","Biblical"] into ["Hebrew"] + tag "Biblical"
 * Handles both array and string origins
 */

const fs = require('fs');
const path = require('path');

const CHUNK_FILES = [
  '/data/data/com.termux/files/home/proj/babyname2/public/data/names-chunk1.json',
  '/data/data/com.termux/files/home/proj/babyname2/public/data/names-chunk-2.json',
  '/data/data/com.termux/files/home/proj/babyname2/public/data/names-chunk-3.json',
  '/data/data/com.termux/files/home/proj/babyname2/public/data/names-chunk4.json'
];

console.log('🔧 Splitting Biblical-Combined Origin Tags');
console.log('=' .repeat(70));

let totalProcessed = 0;
let totalUpdated = 0;

/**
 * Split Biblical from origin string
 */
function splitBiblicalFromString(originStr) {
  if (!originStr || typeof originStr !== 'string' || !originStr.toLowerCase().includes('biblical')) {
    return null;
  }

  let cleanOrigin = originStr;

  // Remove various separators with Biblical
  cleanOrigin = cleanOrigin.replace(/,\s*Biblical\s*$/i, ''); // End: "Spanish, Biblical"
  cleanOrigin = cleanOrigin.replace(/^Biblical\s*,\s*/i, ''); // Start: "Biblical, Hebrew"
  cleanOrigin = cleanOrigin.replace(/;\s*Biblical\s*$/i, ''); // Semicolon: "Spanish; Biblical"
  cleanOrigin = cleanOrigin.replace(/^Biblical\s*;\s*/i, ''); // Start: "Biblical; Hebrew"

  // If nothing left or just "Biblical", keep as empty or Biblical
  if (!cleanOrigin || cleanOrigin.toLowerCase() === 'biblical') {
    return { origin: 'Biblical', tags: [] }; // Keep Biblical as origin if standalone
  }

  return { origin: cleanOrigin.trim(), tags: ['Biblical'] };
}

/**
 * Process a single chunk file
 */
function processChunkFile(filePath) {
  if (!fs.existsSync(filePath)) {
    console.log(`⚠️  File not found: ${filePath}`);
    return { processed: 0, updated: 0 };
  }

  try {
    console.log(`\n📂 Processing: ${path.basename(filePath)}`);

    const content = fs.readFileSync(filePath, 'utf8');
    const data = JSON.parse(content);
    const names = data.names || data;

    if (!Array.isArray(names)) {
      console.log(`⚠️  Invalid format in ${filePath}`);
      return { processed: 0, updated: 0 };
    }

    let updatedCount = 0;
    const examples = [];

    names.forEach(name => {
      let changed = false;

      // Process origin field (can be string or array)
      if (name.origin) {
        // Handle array origins (e.g., ['Hebrew', 'Biblical'])
        if (Array.isArray(name.origin)) {
          const hasBiblical = name.origin.some(o => o && o.toLowerCase() === 'biblical');
          if (hasBiblical) {
            const oldOrigin = JSON.stringify(name.origin);
            // Remove 'Biblical' from array (case-insensitive)
            name.origin = name.origin.filter(o => o && o.toLowerCase() !== 'biblical');

            // Add Biblical to tags
            if (!name.tags) {
              name.tags = [];
            }
            if (!name.tags.includes('Biblical')) {
              name.tags.push('Biblical');
            }

            changed = true;

            if (examples.length < 15) {
              examples.push({
                name: name.name,
                oldOrigin: oldOrigin,
                newOrigin: JSON.stringify(name.origin),
                tags: name.tags
              });
            }
          }
        }
        // Handle string origins (e.g., 'Spanish, Biblical')
        else if (typeof name.origin === 'string' && name.origin.toLowerCase().includes('biblical')) {
          const result = splitBiblicalFromString(name.origin);
          if (result && result.tags.length > 0) {
            const oldOrigin = name.origin;
            name.origin = result.origin;

            // Add Biblical to tags array
            if (!name.tags) {
              name.tags = [];
            }
            result.tags.forEach(tag => {
              if (!name.tags.includes(tag)) {
                name.tags.push(tag);
              }
            });

            changed = true;

            if (examples.length < 15) {
              examples.push({
                name: name.name,
                oldOrigin: oldOrigin,
                newOrigin: name.origin,
                tags: name.tags
              });
            }
          }
        }
      }

      // Process origins array
      if (name.origins && Array.isArray(name.origins)) {
        const newOrigins = [];
        let hadBiblical = false;

        name.origins.forEach(origin => {
          if (origin && origin.toLowerCase().includes('biblical')) {
            const result = splitBiblicalFromString(origin);
            if (result) {
              if (result.origin !== 'Biblical') {
                newOrigins.push(result.origin);
              }

              // Add Biblical to tags
              if (!name.tags) {
                name.tags = [];
              }
              if (result.tags.length > 0 && !name.tags.includes('Biblical')) {
                name.tags.push('Biblical');
              }

              hadBiblical = true;
            }
          } else {
            newOrigins.push(origin);
          }
        });

        if (hadBiblical) {
          name.origins = newOrigins;
          changed = true;
        }
      }

      if (changed) {
        updatedCount++;
      }
    });

    if (updatedCount > 0) {
      // Create backup
      const backupPath = filePath.replace('.json', `_backup_biblical_split_${Date.now()}.json`);
      fs.copyFileSync(filePath, backupPath);
      console.log(`💾 Backup created: ${path.basename(backupPath)}`);

      // Save updated file
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
      console.log(`✅ Updated ${updatedCount} names out of ${names.length}`);

      if (examples.length > 0) {
        console.log(`\n📋 Examples:`);
        examples.forEach(ex => {
          console.log(`   ${ex.name}:`);
          console.log(`      Old origin: ${ex.oldOrigin}`);
          console.log(`      New origin: ${ex.newOrigin}`);
          console.log(`      Tags: ${JSON.stringify(ex.tags)}`);
        });
      }
    } else {
      console.log(`✓ No Biblical tags to split (${names.length} names checked)`);
    }

    return { processed: names.length, updated: updatedCount };

  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
    return { processed: 0, updated: 0 };
  }
}

/**
 * Process all chunk files
 */
function processAllFiles() {
  console.log(`\n🎯 Processing ${CHUNK_FILES.length} chunk files...\n`);

  CHUNK_FILES.forEach(file => {
    const result = processChunkFile(file);
    totalProcessed += result.processed;
    totalUpdated += result.updated;
  });

  console.log(`\n${'='.repeat(70)}`);
  console.log(`\n✅ Complete!`);
  console.log(`   Total names processed: ${totalProcessed.toLocaleString()}`);
  console.log(`   Names with Biblical split: ${totalUpdated.toLocaleString()}`);
  console.log(`   Percentage updated: ${((totalUpdated / totalProcessed) * 100).toFixed(2)}%\n`);
}

// Run the script
processAllFiles();
