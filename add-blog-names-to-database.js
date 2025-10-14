/**
 * Add Enriched Blog Names to Database
 * Merges enriched blog names into the main database chunks
 */

const fs = require('fs');
const path = require('path');

console.log('🚀 Starting database merge...\n');

// Load enriched blog names
const enrichedPath = path.join(__dirname, 'blog-posts-seo', 'enriched-blog-names.json');
const enrichedData = JSON.parse(fs.readFileSync(enrichedPath, 'utf-8'));
const enrichedNames = enrichedData.enriched_names || enrichedData;

console.log(`✅ Loaded ${enrichedNames.length} enriched names from blog posts\n`);

// Load existing database from all chunks
const chunkFiles = [
  'public/data/names-chunk1.json',
  'public/data/names-chunk2.json',
  'public/data/names-chunk3.json',
  'public/data/names-chunk4.json'
];

let existingDatabase = [];
chunkFiles.forEach(file => {
  const chunkPath = path.join(__dirname, file);
  if (fs.existsSync(chunkPath)) {
    const chunk = JSON.parse(fs.readFileSync(chunkPath, 'utf-8'));
    existingDatabase = existingDatabase.concat(chunk);
    console.log(`   Loaded ${chunk.length} names from ${file}`);
  }
});

console.log(`\n✅ Total existing names in database: ${existingDatabase.length}\n`);

// Create a Set of existing names (lowercase for case-insensitive comparison)
const existingNamesSet = new Set(existingDatabase.map(n => n.name.toLowerCase()));

// Find names that don't exist in database
const newNames = enrichedNames.filter(name =>
  !existingNamesSet.has(name.name.toLowerCase())
);

console.log(`🔍 Found ${newNames.length} NEW names to add to database\n`);

if (newNames.length === 0) {
  console.log('✨ All blog names already exist in database!');
  process.exit(0);
}

// Convert enriched names to proper NameEntry format
const namesToAdd = newNames.map(enriched => {
  // Determine gender from enriched data
  let gender = 'unisex';
  let isUnisex = true;

  if (enriched.gender) {
    const g = enriched.gender.toLowerCase();
    if (g === 'male' || g === 'm' || g === 'boy') {
      gender = 'male';
      isUnisex = false;
    } else if (g === 'female' || g === 'f' || g === 'girl') {
      gender = 'female';
      isUnisex = false;
    }
  }

  // Convert popularity string to number
  let popularityScore = 0;
  if (enriched.popularity) {
    const pop = enriched.popularity.toLowerCase();
    if (pop.includes('high') || pop.includes('very popular')) popularityScore = 1000;
    else if (pop.includes('moderate') || pop.includes('medium')) popularityScore = 500;
    else if (pop.includes('low') || pop.includes('uncommon')) popularityScore = 100;
    else popularityScore = enriched.count || 0;
  }

  // Create proper NameEntry object
  return {
    name: enriched.name,
    gender: gender,
    isUnisex: isUnisex,
    origin: enriched.origin || 'Unknown',
    meaning: enriched.meaning || 'No meaning available',
    popularity: popularityScore,
    rank: enriched.rank || 999999,
    count: enriched.count || popularityScore,
    enriched: true,
    culturalSignificance: enriched.culturalSignificance || enriched.meaning || '',
    modernRelevance: enriched.modernRelevance || '',
    pronunciationGuide: enriched.pronunciationGuide || enriched.pronunciation || '',
    variations: enriched.variations || [],
    similarNames: enriched.similarNames || [],
    processingStatus: 'completed',
    enrichmentDate: Date.now()
  };
});

console.log('📝 Sample of names being added:');
namesToAdd.slice(0, 5).forEach(n => {
  console.log(`   ${n.name} (${n.origin}) - ${n.gender}`);
});
console.log('   ...\n');

// Merge with existing database
const mergedDatabase = [...existingDatabase, ...namesToAdd];

console.log(`✅ New total database size: ${mergedDatabase.length} names\n`);

// Sort by popularity (highest first)
mergedDatabase.sort((a, b) => (b.popularity || 0) - (a.popularity || 0));

// Split into chunks (keep chunk1 at ~1000, others at ~43k each)
const chunk1Size = 1000;
const otherChunkSize = Math.ceil((mergedDatabase.length - chunk1Size) / 3);

const chunks = [
  mergedDatabase.slice(0, chunk1Size),
  mergedDatabase.slice(chunk1Size, chunk1Size + otherChunkSize),
  mergedDatabase.slice(chunk1Size + otherChunkSize, chunk1Size + 2 * otherChunkSize),
  mergedDatabase.slice(chunk1Size + 2 * otherChunkSize)
];

console.log('📦 Chunk sizes:');
chunks.forEach((chunk, i) => {
  console.log(`   Chunk ${i + 1}: ${chunk.length} names`);
});
console.log('');

// Save chunks
chunks.forEach((chunk, i) => {
  const chunkPath = path.join(__dirname, `public/data/names-chunk${i + 1}.json`);
  fs.writeFileSync(chunkPath, JSON.stringify(chunk, null, 2));
  console.log(`✅ Saved chunk ${i + 1}: ${chunkPath}`);
});

// Create backup of enriched names that were added
const addedNamesPath = path.join(__dirname, 'blog-posts-seo', 'added-to-database.json');
fs.writeFileSync(addedNamesPath, JSON.stringify(namesToAdd, null, 2));
console.log(`\n💾 Backup of added names: ${addedNamesPath}`);

// Summary
console.log('\n✨ DATABASE UPDATE COMPLETE!');
console.log(`   📊 Added: ${namesToAdd.length} new names`);
console.log(`   📦 Total: ${mergedDatabase.length} names`);
console.log(`   🎯 All blog names now enriched and in database!`);
