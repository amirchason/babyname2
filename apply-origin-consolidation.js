#!/usr/bin/env node
/**
 * Apply Origin Consolidation
 * Adds originGroup field to all names based on consolidation mapping
 * Preserves original origin field for accuracy
 */

const fs = require('fs');
const path = require('path');

const MAPPING_FILE = '/data/data/com.termux/files/home/proj/babyname2/origin-consolidation-map.json';
const CHUNK_FILES = [
  '/data/data/com.termux/files/home/proj/babyname2/public/data/names-core.json',
  '/data/data/com.termux/files/home/proj/babyname2/public/data/names-chunk1.json',
  '/data/data/com.termux/files/home/proj/babyname2/public/data/names-chunk2.json',
  '/data/data/com.termux/files/home/proj/babyname2/public/data/names-chunk3.json',
  '/data/data/com.termux/files/home/proj/babyname2/public/data/names-chunk4.json'
];

console.log('🔧 Applying Origin Consolidation');
console.log('=' .repeat(70));

// Load mapping
const mappingData = JSON.parse(fs.readFileSync(MAPPING_FILE, 'utf8'));
const { mapping, keepOriginal } = mappingData;

// Create reverse lookup map: origin -> group
const originToGroup = new Map();

// First, add keepOriginal origins (they map to themselves)
keepOriginal.forEach(origin => {
  originToGroup.set(origin, origin);
});

// Then, add mapped origins
Object.entries(mapping).forEach(([group, origins]) => {
  origins.forEach(origin => {
    originToGroup.set(origin, group);
  });
});

console.log(`\nLoaded mapping with ${originToGroup.size} origin mappings`);
console.log(`Target groups: ${Object.keys(mapping).length + keepOriginal.length}\n`);

/**
 * Get origin group for a single origin string
 */
function getOriginGroup(origin) {
  if (!origin || typeof origin !== 'string') return 'Unknown';

  const trimmed = origin.trim();

  // Check exact match first
  if (originToGroup.has(trimmed)) {
    return originToGroup.get(trimmed);
  }

  // Check if it's a combination (e.g., "Spanish, Latin")
  const parts = trimmed.split(/[,;]/).map(p => p.trim());
  if (parts.length > 1) {
    // Return the first mapped part, or keep as combination
    for (const part of parts) {
      if (originToGroup.has(part)) {
        return originToGroup.get(part);
      }
    }
  }

  // Default: keep as-is if not in mapping, or mark as Unknown
  if (keepOriginal.includes(trimmed)) {
    return trimmed;
  }

  return 'Other';
}

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
    const groupCounts = new Map();

    names.forEach(name => {
      if (name.origin) {
        const origins = Array.isArray(name.origin) ? name.origin : [name.origin];

        // Get groups for all origins
        const groups = new Set();
        origins.forEach(origin => {
          const group = getOriginGroup(origin);
          if (group) groups.add(group);
        });

        // Store as originGroup (array or single string)
        if (groups.size > 0) {
          const groupArray = Array.from(groups);
          name.originGroup = groupArray.length === 1 ? groupArray[0] : groupArray;

          // Count
          groupArray.forEach(g => {
            groupCounts.set(g, (groupCounts.get(g) || 0) + 1);
          });

          updatedCount++;
        }
      } else {
        // No origin, set to Unknown
        name.originGroup = 'Unknown';
        groupCounts.set('Unknown', (groupCounts.get('Unknown') || 0) + 1);
        updatedCount++;
      }
    });

    // Create backup
    const backupPath = filePath.replace('.json', `_backup_consolidation_${Date.now()}.json`);
    fs.copyFileSync(filePath, backupPath);
    console.log(`💾 Backup created: ${path.basename(backupPath)}`);

    // Save updated file
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    console.log(`✅ Added originGroup to ${updatedCount} names out of ${names.length}`);

    // Show group distribution
    const sortedGroups = Array.from(groupCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 15);

    console.log(`\n📊 Top groups in this chunk:`);
    sortedGroups.forEach(([group, count]) => {
      console.log(`   ${count.toString().padStart(5)} - ${group}`);
    });

    return { processed: names.length, updated: updatedCount };

  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
    return { processed: 0, updated: 0 };
  }
}

/**
 * Main function
 */
function applyConsolidation() {
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
  console.log(`   Names with originGroup added: ${totalUpdated.toLocaleString()}\n`);
}

// Run the script
applyConsolidation();
