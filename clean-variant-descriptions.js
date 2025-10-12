#!/usr/bin/env node
/**
 * Clean Variant Descriptions from Origin Arrays
 * Removes variant/derived descriptions from origin arrays,
 * keeping only the actual cultural origins
 */

const fs = require('fs');
const path = require('path');

const CHUNK_FILES = [
  '/data/data/com.termux/files/home/proj/babyname2/public/data/names-chunk1.json',
  '/data/data/com.termux/files/home/proj/babyname2/public/data/names-chunk-2.json',
  '/data/data/com.termux/files/home/proj/babyname2/public/data/names-chunk-3.json',
  '/data/data/com.termux/files/home/proj/babyname2/public/data/names-chunk4.json'
];

console.log('🔧 Cleaning Variant Descriptions from Origins');
console.log('=' .repeat(70));

/**
 * Check if a string is a variant description (not a real origin)
 */
function isVariantDescription(str) {
  if (!str || typeof str !== 'string') return false;
  const lower = str.toLowerCase();
  return lower.includes('variant of') ||
         lower.includes('derived from') ||
         lower.includes('variation of') ||
         lower.includes('diminutive of') ||
         lower.includes('short form of') ||
         lower.includes('feminine form of') ||
         lower.includes('masculine form of') ||
         lower.includes('form of') ||
         lower.includes('possibly derived') ||
         lower.includes('modern variation');
}

/**
 * Check if string is a valid origin (cultural/linguistic origin)
 */
const VALID_ORIGINS = new Set([
  'Hebrew', 'Greek', 'Latin', 'Arabic', 'Germanic', 'Celtic', 'English',
  'French', 'Spanish', 'Italian', 'Irish', 'Scottish', 'Welsh', 'Norse',
  'Russian', 'Polish', 'Dutch', 'Portuguese', 'Indian', 'Japanese',
  'Chinese', 'Korean', 'Filipino', 'African', 'Persian', 'Turkish', 'Hawaiian',
  'Native-American', 'Biblical', 'Slavic', 'Hungarian', 'Contemporary',
  'Aramaic', 'German', 'American', 'Gaelic', 'Scandinavian', 'Lithuanian',
  'Estonian', 'Basque', 'Czech', 'Romanian', 'Bulgarian', 'Ukrainian',
  'Serbian', 'Croatian', 'Albanian', 'Armenian', 'Georgian', 'Mongolian',
  'Vietnamese', 'Thai', 'Indonesian', 'Malay', 'Swahili', 'Zulu', 'Yoruba'
]);

/**
 * Process a chunk file
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

      // Process origin field if it's an array
      if (name.origin && Array.isArray(name.origin)) {
        const oldOrigin = JSON.stringify(name.origin);

        // Filter out variant descriptions, keep only real origins
        const cleanOrigins = name.origin.filter(o => {
          if (!o || typeof o !== 'string') return false;

          // Remove if it's a variant description
          if (isVariantDescription(o)) return false;

          // Keep if it's a known valid origin or looks like one (starts with capital)
          return VALID_ORIGINS.has(o) || /^[A-Z][a-z]+$/.test(o);
        });

        if (cleanOrigins.length !== name.origin.length) {
          name.origin = cleanOrigins;
          changed = true;

          if (examples.length < 15) {
            examples.push({
              name: name.name,
              oldOrigin: oldOrigin,
              newOrigin: JSON.stringify(name.origin)
            });
          }
        }
      }

      if (changed) {
        updatedCount++;
      }
    });

    if (updatedCount > 0) {
      // Create backup
      const backupPath = filePath.replace('.json', `_backup_clean_variants_${Date.now()}.json`);
      fs.copyFileSync(filePath, backupPath);
      console.log(`💾 Backup created: ${path.basename(backupPath)}`);

      // Save updated file
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
      console.log(`✅ Cleaned ${updatedCount} origins out of ${names.length} total`);

      if (examples.length > 0) {
        console.log(`\n📋 Examples:`);
        examples.forEach(ex => {
          console.log(`   ${ex.name}:`);
          console.log(`      Old: ${ex.oldOrigin}`);
          console.log(`      New: ${ex.newOrigin}`);
        });
      }
    } else {
      console.log(`✓ No variant descriptions to clean (${names.length} names checked)`);
    }

    return { processed: names.length, updated: updatedCount };

  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
    return { processed: 0, updated: 0 };
  }
}

/**
 * Main function
 */
function cleanAllVariants() {
  let totalProcessed = 0;
  let totalUpdated = 0;

  CHUNK_FILES.forEach(file => {
    const result = processChunkFile(file);
    totalProcessed += result.processed;
    totalUpdated += result.updated;
  });

  console.log(`\n${'='.repeat(70)}`);
  console.log(`\n✅ Complete!`);
  console.log(`   Total names processed: ${totalProcessed.toLocaleString()}`);
  console.log(`   Origins cleaned: ${totalUpdated.toLocaleString()}`);
  console.log(`   Percentage updated: ${((totalUpdated / totalProcessed) * 100).toFixed(2)}%\n`);
}

// Run the script
cleanAllVariants();
