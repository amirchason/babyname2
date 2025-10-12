#!/usr/bin/env node
/**
 * Apply Enrichment Updates to Database
 * Takes the modern-names-updates.json and applies the new origins and meanings
 * back to the chunk files
 */

const fs = require('fs');
const path = require('path');

const UPDATES_FILE = '/data/data/com.termux/files/home/proj/babyname2/modern-names-updates.json';
const CHUNK_FILES = [
  '/data/data/com.termux/files/home/proj/babyname2/public/data/names-chunk1.json',
  '/data/data/com.termux/files/home/proj/babyname2/public/data/names-chunk-2.json',
  '/data/data/com.termux/files/home/proj/babyname2/public/data/names-chunk-3.json',
  '/data/data/com.termux/files/home/proj/babyname2/public/data/names-chunk4.json'
];

console.log('🔄 Applying Enrichment Updates to Database');
console.log('=' .repeat(70));

/**
 * Load enrichment updates
 */
function loadUpdates() {
  if (!fs.existsSync(UPDATES_FILE)) {
    console.error(`❌ Updates file not found: ${UPDATES_FILE}`);
    process.exit(1);
  }

  try {
    const content = fs.readFileSync(UPDATES_FILE, 'utf8');
    const updates = JSON.parse(content);

    console.log(`✓ Loaded ${updates.length} enrichment updates\n`);
    return updates;
  } catch (error) {
    console.error(`❌ Error loading updates file:`, error.message);
    process.exit(1);
  }
}

/**
 * Create a map of name -> update for quick lookup
 */
function createUpdateMap(updates) {
  const map = new Map();
  updates.forEach(update => {
    map.set(update.name.toLowerCase(), update);
  });
  return map;
}

/**
 * Apply updates to a chunk file
 */
function applyUpdatesToChunk(filePath, updateMap) {
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
      const update = updateMap.get(name.name.toLowerCase());

      if (update) {
        const oldOrigin = name.origin;
        const oldMeaning = name.meaning;

        // Apply the enrichment
        name.origin = update.newOrigin;
        name.meaning = update.newMeaning;
        if (update.culturalContext) {
          name.culturalContext = update.culturalContext;
        }

        updatedCount++;

        if (examples.length < 10) {
          examples.push({
            name: name.name,
            oldOrigin: oldOrigin || 'Unknown',
            newOrigin: update.newOrigin,
            oldMeaning: oldMeaning || 'Unknown',
            newMeaning: update.newMeaning
          });
        }
      }
    });

    if (updatedCount > 0) {
      // Create backup
      const backupPath = filePath.replace('.json', `_backup_enrichment_${Date.now()}.json`);
      fs.copyFileSync(filePath, backupPath);
      console.log(`💾 Backup created: ${path.basename(backupPath)}`);

      // Save updated file
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
      console.log(`✅ Updated ${updatedCount} names out of ${names.length}`);

      if (examples.length > 0) {
        console.log(`\n📋 Examples:`);
        examples.forEach(ex => {
          console.log(`   ${ex.name}:`);
          console.log(`      Origin:  "${ex.oldOrigin}" → "${ex.newOrigin}"`);
          console.log(`      Meaning: "${ex.oldMeaning}" → "${ex.newMeaning}"`);
        });
      }
    } else {
      console.log(`✓ No updates to apply (${names.length} names checked)`);
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
function applyAllUpdates() {
  // Load the enrichment updates
  const updates = loadUpdates();
  const updateMap = createUpdateMap(updates);

  console.log(`📊 Created update map with ${updateMap.size} unique names\n`);

  let totalProcessed = 0;
  let totalUpdated = 0;

  // Process each chunk file
  CHUNK_FILES.forEach(file => {
    const result = applyUpdatesToChunk(file, updateMap);
    totalProcessed += result.processed;
    totalUpdated += result.updated;
  });

  console.log(`\n${'='.repeat(70)}`);
  console.log(`\n✅ Complete!`);
  console.log(`   Total names processed: ${totalProcessed.toLocaleString()}`);
  console.log(`   Total names updated: ${totalUpdated.toLocaleString()}`);
  console.log(`   Percentage updated: ${((totalUpdated / totalProcessed) * 100).toFixed(2)}%\n`);
}

// Run the script
applyAllUpdates();
