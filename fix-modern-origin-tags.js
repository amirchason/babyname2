#!/usr/bin/env node
/**
 * Fix Modern Origin Tags
 * Converts origins like "Spanish,Modern" into just "Spanish"
 * and "Modern Invented", "Modern English" etc into their base origins
 */

const fs = require('fs');
const path = require('path');

const CHUNK_FILES = [
  '/data/data/com.termux/files/home/proj/babyname2/public/data/names-chunk1.json',
  '/data/data/com.termux/files/home/proj/babyname2/public/data/names-chunk-2.json',
  '/data/data/com.termux/files/home/proj/babyname2/public/data/names-chunk-3.json',
  '/data/data/com.termux/files/home/proj/babyname2/public/data/names-chunk4.json'
];

console.log('🔧 Fixing Modern Origin Tags');
console.log('=' .repeat(70));

let totalFixed = 0;
let totalProcessed = 0;

/**
 * Clean up origin tag by removing ",Modern" suffix
 * Keeps "Modern Invented" and "Modern English" as-is since they are meaningful
 */
function cleanOriginTag(origin) {
  if (!origin || typeof origin !== 'string') {
    return origin;
  }

  let cleaned = origin;

  // Remove ",Modern" at the end ONLY (e.g., "Spanish,Modern" → "Spanish")
  // But keep "Modern Invented" and "Modern English" unchanged
  cleaned = cleaned.replace(/,\s*Modern\s*$/i, '');

  return cleaned.trim();
}

/**
 * Process a single chunk file
 */
function processChunkFile(filePath) {
  if (!fs.existsSync(filePath)) {
    console.log(`⚠️  File not found: ${filePath}`);
    return { processed: 0, fixed: 0 };
  }

  try {
    console.log(`\n📂 Processing: ${filePath}`);

    const content = fs.readFileSync(filePath, 'utf8');
    const data = JSON.parse(content);
    const names = data.names || data;

    if (!Array.isArray(names)) {
      console.log(`⚠️  Invalid format in ${filePath}`);
      return { processed: 0, fixed: 0 };
    }

    let fixedCount = 0;
    const examples = [];

    names.forEach(name => {
      if (name.origin) {
        const originalOrigin = name.origin;
        const cleanedOrigin = cleanOriginTag(name.origin);

        if (cleanedOrigin !== originalOrigin) {
          name.origin = cleanedOrigin;
          fixedCount++;

          if (examples.length < 10) {
            examples.push({
              name: name.name,
              old: originalOrigin,
              new: cleanedOrigin
            });
          }
        }
      }
    });

    if (fixedCount > 0) {
      // Create backup
      const backupPath = filePath.replace('.json', `_backup_modern_fix_${Date.now()}.json`);
      fs.copyFileSync(filePath, backupPath);
      console.log(`💾 Backup created: ${path.basename(backupPath)}`);

      // Save updated file
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
      console.log(`✅ Fixed ${fixedCount} origins in ${names.length} names`);

      if (examples.length > 0) {
        console.log(`\n📋 Examples:`);
        examples.forEach(ex => {
          console.log(`   ${ex.name}: "${ex.old}" → "${ex.new}"`);
        });
      }
    } else {
      console.log(`✓ No changes needed (${names.length} names checked)`);
    }

    return { processed: names.length, fixed: fixedCount };

  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
    return { processed: 0, fixed: 0 };
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
    totalFixed += result.fixed;
  });

  console.log(`\n${'='.repeat(70)}`);
  console.log(`\n✅ Complete!`);
  console.log(`   Total names processed: ${totalProcessed.toLocaleString()}`);
  console.log(`   Total origins fixed: ${totalFixed.toLocaleString()}`);
  console.log(`   Percentage fixed: ${((totalFixed / totalProcessed) * 100).toFixed(2)}%\n`);
}

// Run the script
processAllFiles();
