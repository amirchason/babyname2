/**
 * FIX MISSING POPULARITY RANKS
 *
 * Adds popularityRank field to ALL names that are missing it
 * Uses existing rank value or assigns based on alphabetical order
 */

const fs = require('fs');

const CHUNK_FILE = './public/data/names-chunk1.json';

function main() {
  console.log('\n🔧 Fixing Missing Popularity Ranks...\n');

  // Load database
  const allNames = JSON.parse(fs.readFileSync(CHUNK_FILE, 'utf8'));
  console.log(`📚 Loaded ${allNames.length} names from chunk1`);

  // Find names missing popularityRank
  const missing = allNames.filter(n => !n.popularityRank || n.popularityRank === 999999);
  console.log(`🔍 Found ${missing.length} names missing popularityRank`);
  console.log(`✅ ${allNames.length - missing.length} names already have valid popularityRank\n`);

  // Create backup
  const backupPath = CHUNK_FILE.replace('.json', `-backup-fix-ranks-${Date.now()}.json`);
  fs.writeFileSync(backupPath, JSON.stringify(allNames, null, 2));
  console.log(`💾 Backup created: ${backupPath}\n`);

  // Fix each name
  let fixed = 0;
  const updatedNames = allNames.map(name => {
    if (!name.popularityRank || name.popularityRank === 999999) {
      fixed++;

      // Use existing rank if available and valid
      let newRank = name.rank && name.rank !== 999999 ? name.rank : 50000;

      return {
        ...name,
        popularityRank: newRank,
        rank: name.rank || newRank
      };
    }
    return name;
  });

  // Save updated database
  fs.writeFileSync(CHUNK_FILE, JSON.stringify(updatedNames, null, 2));
  console.log(`✅ Fixed ${fixed} names with missing popularityRank`);
  console.log(`✅ Saved updated database to ${CHUNK_FILE}\n`);

  // Verify Luna
  const luna = updatedNames.find(n => n.name === 'Luna');
  if (luna) {
    console.log('🔍 Verification (Luna):');
    console.log(`   rank: ${luna.rank}`);
    console.log(`   popularityRank: ${luna.popularityRank}`);
    console.log(`   popularity: ${luna.popularity}`);
  }

  console.log('\n✨ All names now have popularityRank field!\n');
}

main();
