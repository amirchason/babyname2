/**
 * FIX BLOG NAMES FORMAT
 *
 * Converts blog-enriched names to match the exact database schema
 * of existing names so they show up properly in search and profiles.
 */

const fs = require('fs');
const path = require('path');

const CHUNK_FILE = './public/data/names-chunk1.json';

// Gender mapping
const GENDER_MAP = {
  'boy': 'male',
  'girl': 'female',
  'unisex': 'unisex',
  'male': 'male',
  'female': 'female'
};

function fixNameFormat(name) {
  // Convert gender format
  let gender = name.gender;
  if (GENDER_MAP[gender]) {
    gender = GENDER_MAP[gender];
  }

  // Check if unisex
  const isUnisex = gender === 'unisex';

  // Get origin (convert array to string for consistency)
  let origin = name.origin;
  if (Array.isArray(origin)) {
    origin = origin[0]; // Use first origin
  }

  // Create properly formatted entry
  return {
    name: name.name,
    gender: gender,
    isUnisex: isUnisex,
    origin: origin || 'Unknown',
    meaning: name.meaning || name.description || '',

    // Required fields that were missing
    popularity: 5000, // Default popularity
    rank: 999999, // Default rank for new names
    count: 5000,
    popularityRank: 999999, // CRITICAL: This is what search uses!

    // Enrichment data
    enriched: true,
    culturalSignificance: name.description || name.meaning || '',
    modernRelevance: '',
    pronunciationGuide: '',
    variations: name.variants || [],
    similarNames: [],
    processingStatus: 'completed',
    enrichmentDate: Date.now(),

    // Keep track of enrichment source
    enrichmentSource: name.enrichmentSource || 'blog-enrichment',
    enrichmentModel: name.enrichmentModel || 'gpt-4o-mini',

    // Additional useful fields
    meaningFull: name.meaning,
    meaningShort: name.meaning,
    originGroup: origin || 'Unknown',
    origins: Array.isArray(name.origin) ? name.origin : [origin || 'Unknown']
  };
}

function main() {
  console.log('\n🔧 Fixing Blog Names Format...\n');

  // Load chunk
  const data = JSON.parse(fs.readFileSync(CHUNK_FILE, 'utf8'));
  console.log(`📚 Loaded ${data.length} names from chunk1`);

  // Find names with blog enrichment source
  const blogNames = data.filter(n =>
    n.enrichmentSource === 'blog-post-enrichment-script' ||
    n.enrichmentSource === 'blog-name-scraper'
  );

  console.log(`\n🎯 Found ${blogNames.length} blog-enriched names to fix:`);
  blogNames.forEach(n => console.log(`   - ${n.name}`));

  // Create backup
  const backupPath = CHUNK_FILE.replace('.json', `.backup-format-fix-${Date.now()}.json`);
  fs.writeFileSync(backupPath, JSON.stringify(data, null, 2));
  console.log(`\n💾 Backup created: ${backupPath}`);

  // Fix each blog name
  let fixed = 0;
  const updatedData = data.map(name => {
    if (name.enrichmentSource === 'blog-post-enrichment-script' ||
        name.enrichmentSource === 'blog-name-scraper') {
      fixed++;
      console.log(`   ✓ Fixing ${name.name}: gender=${name.gender} → ${GENDER_MAP[name.gender] || name.gender}`);
      return fixNameFormat(name);
    }
    return name;
  });

  // Save updated chunk
  fs.writeFileSync(CHUNK_FILE, JSON.stringify(updatedData, null, 2));
  console.log(`\n✅ Fixed ${fixed} names and saved to ${CHUNK_FILE}`);

  // Verify fixes
  console.log('\n🔍 Verification:');
  const sampleFixed = updatedData.find(n => n.name === 'Audrey');
  if (sampleFixed) {
    console.log('\nSample (Audrey):');
    console.log(`   gender: ${sampleFixed.gender}`);
    console.log(`   isUnisex: ${sampleFixed.isUnisex}`);
    console.log(`   popularityRank: ${sampleFixed.popularityRank}`);
    console.log(`   rank: ${sampleFixed.rank}`);
    console.log(`   origin: ${sampleFixed.origin}`);
    console.log(`   meaning: ${sampleFixed.meaning}`);
  }

  console.log('\n✨ All blog names now match database schema!\n');
}

main();
