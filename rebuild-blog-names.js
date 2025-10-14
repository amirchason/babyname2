/**
 * REBUILD BLOG NAMES
 *
 * Step 1: Delete all blog-enriched names from database
 * Step 2: Re-add them with proper schema using enrichment
 * Step 3: Verify search functionality
 */

const fs = require('fs');
const path = require('path');

const CHUNK_FILE = './public/data/names-chunk1.json';

// Names to delete and re-add (from audit)
const BLOG_ENRICHED_NAMES = [
  'Blanca', 'Luz', 'Ray', 'Aylin', 'Kamaria', 'Jaci', 'Hala', 'Lucine',
  'Pensri', 'Badriyah', 'Celine', 'Chandra', 'Marama', 'Henrietta', 'Eliza',
  'Louise', 'Millie', 'Elsie', 'Audrey', 'Marilyn', 'Vivian', 'Harlow',
  'Ginger', 'Flora', 'North'
];

function main() {
  console.log('\n═══════════════════════════════════════════════════════════');
  console.log('           REBUILDING BLOG NAMES SYSTEM');
  console.log('═══════════════════════════════════════════════════════════\n');

  // Step 1: Load database
  console.log('📚 STEP 1: Loading database...');
  const allNames = JSON.parse(fs.readFileSync(CHUNK_FILE, 'utf8'));
  console.log(`✓ Loaded ${allNames.length} names from chunk1\n`);

  // Step 2: Create backup
  const backupPath = CHUNK_FILE.replace('.json', `.backup-rebuild-${Date.now()}.json`);
  fs.writeFileSync(backupPath, JSON.stringify(allNames, null, 2));
  console.log(`💾 Backup created: ${backupPath}\n`);

  // Step 3: Find blog-enriched names
  console.log('🔍 STEP 2: Finding blog-enriched names...');
  const blogEnrichedEntries = allNames.filter(n =>
    n.enrichmentSource === 'blog-post-enrichment-script' ||
    n.enrichmentSource === 'blog-name-scraper' ||
    n.enrichmentSource === 'blog-enrichment'
  );
  console.log(`Found ${blogEnrichedEntries.length} blog-enriched entries:\n`);
  blogEnrichedEntries.forEach((entry, i) => {
    console.log(`   ${i+1}. ${entry.name} (rank: ${entry.rank}, gender: ${entry.gender})`);
  });
  console.log();

  // Step 4: Delete blog-enriched names
  console.log('🗑️  STEP 3: Deleting blog-enriched names...');
  const cleaned = allNames.filter(n =>
    n.enrichmentSource !== 'blog-post-enrichment-script' &&
    n.enrichmentSource !== 'blog-name-scraper' &&
    n.enrichmentSource !== 'blog-enrichment'
  );
  console.log(`✓ Removed ${allNames.length - cleaned.length} blog-enriched names`);
  console.log(`✓ Database now has ${cleaned.length} names\n`);

  // Step 5: Save cleaned database
  fs.writeFileSync(CHUNK_FILE, JSON.stringify(cleaned, null, 2));
  console.log(`✓ Saved cleaned database to ${CHUNK_FILE}\n`);

  // Step 6: Verify deletion
  console.log('✅ STEP 4: Verifying deletion...');
  const reloaded = JSON.parse(fs.readFileSync(CHUNK_FILE, 'utf8'));
  const stillThere = reloaded.filter(n =>
    BLOG_ENRICHED_NAMES.includes(n.name)
  );
  if (stillThere.length > 0) {
    console.log(`⚠️ WARNING: ${stillThere.length} names still in database:`);
    stillThere.forEach(n => console.log(`   - ${n.name}`));
  } else {
    console.log(`✓ All 25 blog-enriched names successfully removed`);
  }
  console.log();

  console.log('═══════════════════════════════════════════════════════════');
  console.log('              DELETION COMPLETE ✅');
  console.log('═══════════════════════════════════════════════════════════\n');

  console.log('📋 NEXT STEPS:');
  console.log('   1. Run: node enrich-blog-names.js');
  console.log('   2. This will re-add all 25 names with proper schema');
  console.log('   3. Names will have correct popularity rankings');
  console.log('   4. All names will be searchable\n');

  return {
    deletedCount: allNames.length - cleaned.length,
    remainingCount: cleaned.length,
    deletedNames: blogEnrichedEntries.map(n => n.name)
  };
}

// Run rebuild
main();
