#!/usr/bin/env node
/**
 * Fix Variant Name Origins
 * Finds all names that are variants of other names and updates their origin
 * to match the original name's origin
 */

const fs = require('fs');
const path = require('path');

const CHUNK_FILES = [
  '/data/data/com.termux/files/home/proj/babyname2/public/data/names-chunk1.json',
  '/data/data/com.termux/files/home/proj/babyname2/public/data/names-chunk-2.json',
  '/data/data/com.termux/files/home/proj/babyname2/public/data/names-chunk-3.json',
  '/data/data/com.termux/files/home/proj/babyname2/public/data/names-chunk4.json'
];

console.log('🔧 Fixing Variant Name Origins');
console.log('=' .repeat(70));

/**
 * Extract the original name from variant description
 * E.g., "Variant of Alexander" -> "Alexander"
 */
function extractOriginalName(text) {
  if (!text) return null;

  const lowerText = text.toLowerCase();

  // Pattern: "variant of [Name]"
  const variantOfMatch = text.match(/variant\s+of\s+([A-Z][a-z]+)/i);
  if (variantOfMatch) {
    return variantOfMatch[1];
  }

  // Pattern: "[Language] variant of [Name]"
  const langVariantMatch = text.match(/\w+\s+variant\s+of\s+([A-Z][a-z]+)/i);
  if (langVariantMatch) {
    return langVariantMatch[1];
  }

  // Pattern: "diminutive of [Name]"
  const diminutiveMatch = text.match(/diminutive\s+of\s+([A-Z][a-z]+)/i);
  if (diminutiveMatch) {
    return diminutiveMatch[1];
  }

  return null;
}

/**
 * Build a name index for all chunks
 */
function buildNameIndex() {
  const nameIndex = new Map();

  CHUNK_FILES.forEach(filePath => {
    if (!fs.existsSync(filePath)) {
      console.log(`⚠️  Skipping missing file: ${path.basename(filePath)}`);
      return;
    }

    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const data = JSON.parse(content);
      const names = data.names || data;

      if (Array.isArray(names)) {
        names.forEach(name => {
          if (name.name && name.origin) {
            nameIndex.set(name.name.toLowerCase(), {
              name: name.name,
              origin: name.origin,
              meaning: name.meaning
            });
          }
        });
      }
    } catch (error) {
      console.log(`⚠️  Error loading ${path.basename(filePath)}: ${error.message}`);
    }
  });

  return nameIndex;
}

/**
 * Process a chunk file
 */
function processChunkFile(filePath, nameIndex) {
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
      // Check if this name is a variant
      const meaningText = name.meaningFull || name.meaning || '';

      if (meaningText.toLowerCase().includes('variant') ||
          meaningText.toLowerCase().includes('diminutive')) {

        const originalName = extractOriginalName(meaningText);

        if (originalName) {
          const original = nameIndex.get(originalName.toLowerCase());

          if (original && original.origin && original.origin !== name.origin) {
            const oldOrigin = name.origin;
            name.origin = original.origin;
            updatedCount++;

            if (examples.length < 15) {
              examples.push({
                variant: name.name,
                original: original.name,
                oldOrigin: oldOrigin || 'Unknown',
                newOrigin: original.origin,
                description: meaningText.substring(0, 80)
              });
            }
          }
        }
      }
    });

    if (updatedCount > 0) {
      // Create backup
      const backupPath = filePath.replace('.json', `_backup_variant_fix_${Date.now()}.json`);
      fs.copyFileSync(filePath, backupPath);
      console.log(`💾 Backup created: ${path.basename(backupPath)}`);

      // Save updated file
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
      console.log(`✅ Updated ${updatedCount} variant names out of ${names.length} total`);

      if (examples.length > 0) {
        console.log(`\n📋 Examples:`);
        examples.forEach(ex => {
          console.log(`   ${ex.variant} (variant of ${ex.original}):`);
          console.log(`      Origin: "${ex.oldOrigin}" → "${ex.newOrigin}"`);
          console.log(`      Context: "${ex.description}..."`);
        });
      }
    } else {
      console.log(`✓ No variant updates needed (${names.length} names checked)`);
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
function fixAllVariants() {
  console.log(`\n🔍 Building name index across all chunks...`);
  const nameIndex = buildNameIndex();
  console.log(`✓ Indexed ${nameIndex.size.toLocaleString()} names\n`);

  let totalProcessed = 0;
  let totalUpdated = 0;

  CHUNK_FILES.forEach(file => {
    const result = processChunkFile(file, nameIndex);
    totalProcessed += result.processed;
    totalUpdated += result.updated;
  });

  console.log(`\n${'='.repeat(70)}`);
  console.log(`\n✅ Complete!`);
  console.log(`   Total names processed: ${totalProcessed.toLocaleString()}`);
  console.log(`   Variant origins updated: ${totalUpdated.toLocaleString()}`);
  console.log(`   Percentage updated: ${((totalUpdated / totalProcessed) * 100).toFixed(2)}%\n`);
}

// Run the script
fixAllVariants();
