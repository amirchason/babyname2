const fs = require('fs');
const path = require('path');

// Backup and fix database entries
function fixDatabaseFile(filePath) {
  console.log(`\nProcessing: ${path.basename(filePath)}...`);

  try {
    const data = fs.readFileSync(filePath, 'utf8');
    const names = JSON.parse(data);

    if (!Array.isArray(names)) {
      console.log('  Skipping - not an array');
      return { modified: false };
    }

    let modified = false;
    let chemicalsDeleted = false;
    let shameFixed = false;

    // Filter out "Chemicals" and fix "Shame"
    const updatedNames = names.filter(entry => {
      // Delete Chemicals
      if (entry.name === 'Chemicals') {
        console.log(`  ❌ Deleting: Chemicals (rank #${entry.popularityRank || entry.rank || 'unknown'})`);
        chemicalsDeleted = true;
        modified = true;
        return false; // Remove from array
      }

      // Fix Shame
      if (entry.name === 'Shame') {
        console.log(`  ✏️  Fixing: Shame (rank #${entry.popularityRank || entry.rank || 'unknown'})`);

        // Update origin
        entry.origin = 'Hebrew';
        if (entry.origins) entry.origins = ['Hebrew'];
        if (entry.originGroup) entry.originGroup = 'Hebrew';
        if (entry.originsDetails) {
          entry.originsDetails.primary = 'Hebrew';
          entry.originsDetails.secondary = null;
          entry.originsDetails.tertiary = null;
        }

        // Update meaning
        entry.meaning = 'Name (used as one of the names of God)';
        entry.meaningShort = 'Name';
        entry.meaningFull = 'Name (used as one of the names of God)';
        if (entry.meanings) {
          entry.meanings = ['Name (used as one of the names of God)'];
        }

        // Update etymology
        entry.meaningEtymology = 'From Hebrew שם (Shem) meaning "name", used as one of the sacred names';

        // Mark as corrected
        entry.originProcessed = true;
        entry.meaningProcessed = true;
        entry.lastEnriched = new Date().toISOString();
        entry.enrichedWith = 'manual-correction';

        shameFixed = true;
        modified = true;
      }

      return true; // Keep in array
    });

    // Save if modified
    if (modified) {
      // Create backup first
      const backupPath = filePath + `.backup-fix-${Date.now()}`;
      fs.writeFileSync(backupPath, data);
      console.log(`  💾 Backup created: ${path.basename(backupPath)}`);

      // Write updated data
      fs.writeFileSync(filePath, JSON.stringify(updatedNames, null, 2));
      console.log(`  ✅ File updated successfully`);

      return {
        modified: true,
        chemicalsDeleted,
        shameFixed,
        originalCount: names.length,
        newCount: updatedNames.length
      };
    }

    console.log('  No changes needed');
    return { modified: false };
  } catch (error) {
    console.error(`  ❌ Error processing ${filePath}:`, error.message);
    return { modified: false, error: error.message };
  }
}

// Main execution
function fixAllDatabases() {
  const dataDir = path.join(__dirname, '../public/data');

  // Files that might contain the entries
  const filesToFix = [
    'names-chunk1.json',
    'names-chunk2.json',
    'names-chunk3.json', // Contains both Shame and Chemicals
    'names-chunk4.json',
    'names-chunk5.json',
    'popularNames_cache.json',
    'top100k_names.json'
  ];

  console.log('🔧 Starting database cleanup and fixes...\n');
  console.log('═══════════════════════════════════════════\n');
  console.log('Tasks:');
  console.log('  1. Delete "Chemicals" (not a real name)');
  console.log('  2. Fix "Shame" - Hebrew name meaning "Name (one of the names of God)"\n');

  const results = {
    filesProcessed: 0,
    filesModified: 0,
    chemicalsDeleted: false,
    shameFixed: false,
    errors: []
  };

  for (const file of filesToFix) {
    const filePath = path.join(dataDir, file);
    if (fs.existsSync(filePath)) {
      const result = fixDatabaseFile(filePath);
      results.filesProcessed++;

      if (result.modified) {
        results.filesModified++;
      }
      if (result.chemicalsDeleted) {
        results.chemicalsDeleted = true;
      }
      if (result.shameFixed) {
        results.shameFixed = true;
      }
      if (result.error) {
        results.errors.push({ file, error: result.error });
      }
    } else {
      console.log(`⚠️  File not found: ${file}`);
    }
  }

  // Print summary
  console.log('\n\n╔══════════════════════════════════════════╗');
  console.log('║           CLEANUP SUMMARY                ║');
  console.log('╚══════════════════════════════════════════╝\n');

  console.log(`Files processed: ${results.filesProcessed}`);
  console.log(`Files modified: ${results.filesModified}\n`);

  console.log('Changes made:');
  console.log(`  ${results.chemicalsDeleted ? '✅' : '❌'} Deleted "Chemicals"`);
  console.log(`  ${results.shameFixed ? '✅' : '❌'} Fixed "Shame" (Hebrew name)\n`);

  if (results.errors.length > 0) {
    console.log('⚠️  Errors encountered:');
    results.errors.forEach(({ file, error }) => {
      console.log(`  - ${file}: ${error}`);
    });
  }

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('✅ Database cleanup complete!');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  return results;
}

// Run fixes
fixAllDatabases();
