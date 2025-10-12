#!/usr/bin/env node
/**
 * Split Modern-Combined Origin Tags
 * Converts origins like "Spanish,Modern" into separate origin "Spanish" + tag "Modern"
 * Converts origins like "Modern Invented" into "Invented" + tag "Modern"
 */

const fs = require('fs');
const path = require('path');

const CHUNK_FILES = [
  '/data/data/com.termux/files/home/proj/babyname2/public/data/names-chunk1.json',
  '/data/data/com.termux/files/home/proj/babyname2/public/data/names-chunk-2.json',
  '/data/data/com.termux/files/home/proj/babyname2/public/data/names-chunk-3.json',
  '/data/data/com.termux/files/home/proj/babyname2/public/data/names-chunk4.json'
];

console.log('🔧 Splitting Modern-Combined Origin Tags');
console.log('=' .repeat(70));

let totalProcessed = 0;
let totalUpdated = 0;

/**
 * Split Modern from origin and create tags
 * Returns: { origin: string, tags: string[] }
 */
function splitModernOrigin(originStr) {
  if (!originStr || typeof originStr !== 'string' || !originStr.includes('Modern')) {
    return null; // No Modern to split
  }

  const tags = ['Modern'];
  let cleanOrigin = String(originStr); // Ensure it's a string

  // Remove ",Modern" or "Modern," from the origin
  cleanOrigin = cleanOrigin.replace(/,\s*Modern\s*$/i, ''); // End: "Spanish,Modern" -> "Spanish"
  cleanOrigin = cleanOrigin.replace(/^Modern\s*,\s*/i, ''); // Start: "Modern,Spanish" -> "Spanish"

  // Remove "Modern " prefix (e.g., "Modern Invented" -> "Invented")
  if (cleanOrigin.startsWith('Modern ')) {
    cleanOrigin = cleanOrigin.substring(7);
  }

  // If nothing left, use the original
  if (!cleanOrigin || cleanOrigin === 'Modern') {
    return { origin: originStr, tags: [] }; // Keep as-is
  }

  return { origin: cleanOrigin, tags: tags };
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
        // Handle array origins (e.g., ['Latin', 'Modern'])
        if (Array.isArray(name.origin)) {
          const hasModern = name.origin.includes('Modern');
          if (hasModern) {
            const oldOrigin = JSON.stringify(name.origin);
            // Remove 'Modern' from array
            name.origin = name.origin.filter(o => o !== 'Modern');

            // Add Modern to tags
            if (!name.tags) {
              name.tags = [];
            }
            if (!name.tags.includes('Modern')) {
              name.tags.push('Modern');
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
        // Handle string origins (e.g., 'Spanish,Modern' or 'Modern Invented')
        else if (typeof name.origin === 'string' && name.origin.includes('Modern')) {
          const result = splitModernOrigin(name.origin);
          if (result && result.tags.length > 0) {
            const oldOrigin = name.origin;
            name.origin = result.origin;

            // Add Modern to tags array
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
        name.origins.forEach(origin => {
          if (origin && origin.includes('Modern')) {
            const result = splitModernOrigin(origin);
            if (result) {
              newOrigins.push(result.origin);

              // Add Modern to tags
              if (!name.tags) {
                name.tags = [];
              }
              result.tags.forEach(tag => {
                if (!name.tags.includes(tag)) {
                  name.tags.push(tag);
                }
              });

              changed = true;
            } else {
              newOrigins.push(origin);
            }
          } else {
            newOrigins.push(origin);
          }
        });

        if (changed) {
          name.origins = newOrigins;
        }
      }

      if (changed) {
        updatedCount++;
      }
    });

    if (updatedCount > 0) {
      // Create backup
      const backupPath = filePath.replace('.json', `_backup_modern_split_${Date.now()}.json`);
      fs.copyFileSync(filePath, backupPath);
      console.log(`💾 Backup created: ${path.basename(backupPath)}`);

      // Save updated file
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
      console.log(`✅ Updated ${updatedCount} names out of ${names.length}`);

      if (examples.length > 0) {
        console.log(`\n📋 Examples:`);
        examples.forEach(ex => {
          console.log(`   ${ex.name}:`);
          console.log(`      Old origin: "${ex.oldOrigin}"`);
          console.log(`      New origin: "${ex.newOrigin}"`);
          console.log(`      Tags: ${JSON.stringify(ex.tags)}`);
        });
      }
    } else {
      console.log(`✓ No Modern tags to split (${names.length} names checked)`);
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
  console.log(`   Names with Modern split: ${totalUpdated.toLocaleString()}`);
  console.log(`   Percentage updated: ${((totalUpdated / totalProcessed) * 100).toFixed(2)}%\n`);
}

// Run the script
processAllFiles();
