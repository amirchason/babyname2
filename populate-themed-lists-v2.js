/**
 * Populate Themed Lists v2
 *
 * Uses hybrid approach:
 * 1. Load top 10k popular names from popularNames_cache.json (ranks 1-10k)
 * 2. Load all chunks for origin/meaning data
 * 3. Merge the data: popular names get enriched with origin/meaning from chunks
 * 4. Fill themed lists with truly popular, relevant names
 */

const fs = require('fs');
const path = require('path');

// Load popular names (top 10k, ranks 1-10000)
const loadPopularNames = () => {
  console.log('📦 Loading popular names (top 10k)...');
  const popularPath = path.join(__dirname, 'public', 'data', 'popularNames_cache.json');
  const data = JSON.parse(fs.readFileSync(popularPath, 'utf8'));
  console.log(`   ✓ Loaded ${data.names.length} popular names\n`);
  return data.names;
};

// Load chunks for origin/meaning enrichment data
const loadChunks = () => {
  console.log('📦 Loading chunks for enrichment data...');
  const chunks = [];

  for (let i = 1; i <= 4; i++) {
    const chunkPath = path.join(__dirname, 'public', 'data', `names-chunk${i}.json`);
    try {
      const chunkData = JSON.parse(fs.readFileSync(chunkPath, 'utf8'));
      chunks.push(...chunkData.names);
      console.log(`   ✓ Chunk ${i}: ${chunkData.names.length} names`);
    } catch (error) {
      console.error(`   ✗ Failed to load chunk ${i}:`, error.message);
    }
  }

  console.log(`\n✅ Total enrichment names loaded: ${chunks.length}\n`);
  return chunks;
};

// Create lookup map from chunks (name -> enrichment data)
const createEnrichmentMap = (chunks) => {
  console.log('🔍 Creating enrichment lookup map...');
  const map = new Map();

  chunks.forEach(name => {
    const key = name.name.toLowerCase();
    if (!map.has(key)) {
      map.set(key, name);
    }
  });

  console.log(`   ✓ Created map with ${map.size} entries\n`);
  return map;
};

// Merge popular names with enrichment data
const mergeNameData = (popularNames, enrichmentMap) => {
  console.log('🔄 Merging popular names with enrichment data...');

  const merged = popularNames.map(popName => {
    const enriched = enrichmentMap.get(popName.name.toLowerCase());

    if (enriched) {
      return {
        ...popName,
        origin: enriched.origin,
        origins: enriched.origins,
        meaning: enriched.meaning,
        meaningShort: enriched.meaningShort,
        meaningFull: enriched.meaningFull,
        meanings: enriched.meanings,
        tags: enriched.tags
      };
    }

    return popName;
  });

  const enrichedCount = merged.filter(n => n.origin || n.origins).length;
  console.log(`   ✓ Enriched ${enrichedCount} / ${merged.length} popular names\n`);

  return merged;
};

// Helper: Check if name matches origin criteria
const matchesOrigin = (name, origins) => {
  if (!name.origin && !name.origins) return false;

  const nameOrigins = [
    name.origin,
    ...(name.origins || [])
  ].filter(o => o && typeof o === 'string').map(o => o.toLowerCase());

  if (nameOrigins.length === 0) return false;

  return origins.some(origin =>
    nameOrigins.some(no => no.includes(origin.toLowerCase()))
  );
};

// Helper: Check if name meaning contains keywords
const matchesMeaning = (name, keywords) => {
  const meaningText = [
    name.meaning,
    name.meaningShort,
    name.meaningFull,
    ...(name.meanings || [])
  ].filter(Boolean).join(' ').toLowerCase();

  if (!meaningText) return false;

  return keywords.some(keyword =>
    meaningText.includes(keyword.toLowerCase())
  );
};

// Helper: Check if name has syllable count
const matchesSyllables = (name, syllables) => {
  if (name.syllables === syllables) return true;

  // Fallback: estimate syllables from name length
  const nameLen = name.name.length;
  if (syllables === 1 && nameLen <= 4) return true;

  return false;
};

// Helper: Check if name is vintage/classic
const isVintageClassic = (name) => {
  // Names with popularity rank < 500 that feel vintage
  const hasVintageTags = (name.tags || []).some(tag =>
    ['vintage', 'classic', 'traditional'].includes(tag.toLowerCase())
  );

  // Classic names from early 1900s
  const vintageNames = [
    'Ada', 'Albert', 'Alfred', 'Alice', 'Anne', 'Arthur', 'Beatrice', 'Charles',
    'Clara', 'Dorothy', 'Edith', 'Eleanor', 'Elizabeth', 'Florence', 'Francis',
    'George', 'Grace', 'Harold', 'Harry', 'Helen', 'Henry', 'Irene', 'James',
    'John', 'Joseph', 'Margaret', 'Mary', 'Mildred', 'Robert', 'Ruth', 'Thomas',
    'Walter', 'William', 'Catherine', 'Edward', 'Richard', 'Louis', 'Frances',
    'Clarence', 'Howard', 'Carl', 'Ralph', 'Eugene', 'Roy', 'Paul', 'Ernest'
  ];

  const isVintageName = vintageNames.some(v =>
    name.name.toLowerCase() === v.toLowerCase()
  );

  return hasVintageTags || isVintageName;
};

// Helper: Check if name is modern/trendy
const isModernTrendy = (name) => {
  // Names with modern patterns
  const hasModernTags = (name.tags || []).some(tag =>
    ['modern', 'trendy', 'contemporary'].includes(tag.toLowerCase())
  );

  // Modern patterns and suffixes (post-2000)
  const modernNames = [
    'Aiden', 'Jayden', 'Kayden', 'Brayden', 'Hayden', 'Caden', 'Jaden',
    'Ella', 'Mia', 'Ava', 'Aria', 'Luna', 'Nova', 'Ivy', 'Harper', 'Evelyn',
    'Avery', 'Riley', 'Aubrey', 'Brooklyn', 'Paisley', 'Savannah', 'Skylar',
    'Liam', 'Mason', 'Logan', 'Grayson', 'Jackson', 'Bentley', 'Easton'
  ];

  const isModernName = modernNames.some(m =>
    name.name.toLowerCase() === m.toLowerCase()
  );

  const nameLower = name.name.toLowerCase();
  const modernPatterns = ['ayla', 'ayden', 'aylin', 'ella', 'ley', 'lia', 'lynn', 'mia', 'ria', 'yn'];
  const hasModernPattern = modernPatterns.some(pattern => nameLower.includes(pattern));

  return hasModernTags || isModernName || hasModernPattern;
};

// Helper: Check if name is unique/rare
const isUniqueRare = (name) => {
  // Names with popularity > 1000 (less popular = more unique)
  const popularity = name.popularityRank || name.popularity || 0;
  return popularity > 1000 && popularity < 5000; // Sweet spot: rare but not obscure
};

// Fill list with matching names
const fillList = (allNames, listId, filterFn, targetCount = 200) => {
  console.log(`\n🔍 Filling "${listId}"...`);

  const matches = allNames
    .filter(filterFn)
    .slice(0, targetCount)
    .map(n => n.name);

  console.log(`   ✓ Found ${matches.length} names`);
  if (matches.length > 0) {
    console.log(`   Top 10: ${matches.slice(0, 10).join(', ')}`);
  }

  return matches;
};

// Main function
const main = () => {
  console.log('🚀 THEMED LISTS POPULATION SCRIPT v2\n');
  console.log('Strategy: Use top 10k popular names + enrich with chunk data\n');
  console.log('=' .repeat(60) + '\n');

  // Load data
  const popularNames = loadPopularNames();
  const chunks = loadChunks();
  const enrichmentMap = createEnrichmentMap(chunks);
  const allNames = mergeNameData(popularNames, enrichmentMap);

  console.log('🎯 Ready to populate lists!\n');
  console.log('='.repeat(60) + '\n');

  // Results storage
  const results = {};

  // PHASE 1: Origin Lists (8 lists)
  console.log('PHASE 1: ORIGIN LISTS');
  console.log('='.repeat(60));

  results['irish-celtic'] = fillList(allNames, 'irish-celtic',
    name => matchesOrigin(name, ['Irish', 'Celtic', 'Gaelic', 'Scottish']), 250);

  results['italian'] = fillList(allNames, 'italian',
    name => matchesOrigin(name, ['Italian']), 250);

  results['greek'] = fillList(allNames, 'greek',
    name => matchesOrigin(name, ['Greek']), 250);

  results['hebrew-biblical'] = fillList(allNames, 'hebrew-biblical',
    name => matchesOrigin(name, ['Hebrew']), 250);

  results['french'] = fillList(allNames, 'french',
    name => matchesOrigin(name, ['French']), 250);

  results['spanish-latin'] = fillList(allNames, 'spanish-latin',
    name => matchesOrigin(name, ['Spanish', 'Latin']), 250);

  results['japanese'] = fillList(allNames, 'japanese',
    name => matchesOrigin(name, ['Japanese']), 250);

  results['arabic'] = fillList(allNames, 'arabic',
    name => matchesOrigin(name, ['Arabic']), 250);

  // PHASE 2: Meaning Lists (7 lists)
  console.log('\n' + '='.repeat(60));
  console.log('PHASE 2: MEANING LISTS');
  console.log('='.repeat(60));

  results['meaning-light'] = fillList(allNames, 'meaning-light',
    name => matchesMeaning(name, ['light', 'bright', 'shine', 'radiant', 'luminous', 'glow']), 250);

  results['meaning-strength'] = fillList(allNames, 'meaning-strength',
    name => matchesMeaning(name, ['strong', 'strength', 'powerful', 'mighty', 'warrior', 'power']), 250);

  results['meaning-wisdom'] = fillList(allNames, 'meaning-wisdom',
    name => matchesMeaning(name, ['wise', 'wisdom', 'intelligent', 'sage', 'knowledgeable', 'learned']), 250);

  results['meaning-joy'] = fillList(allNames, 'meaning-joy',
    name => matchesMeaning(name, ['joy', 'happy', 'cheerful', 'delight', 'bliss', 'merry']), 250);

  results['meaning-love'] = fillList(allNames, 'meaning-love',
    name => matchesMeaning(name, ['love', 'beloved', 'affection', 'dear', 'cherished', 'adored']), 250);

  results['meaning-brave'] = fillList(allNames, 'meaning-brave',
    name => matchesMeaning(name, ['brave', 'courage', 'valor', 'fearless', 'bold', 'heroic']), 250);

  results['meaning-peace'] = fillList(allNames, 'meaning-peace',
    name => matchesMeaning(name, ['peace', 'calm', 'tranquil', 'serene', 'peaceful', 'harmony']), 250);

  // PHASE 3: Style Lists (5 lists)
  console.log('\n' + '='.repeat(60));
  console.log('PHASE 3: STYLE LISTS');
  console.log('='.repeat(60));

  results['vintage-classic'] = fillList(allNames, 'vintage-classic',
    isVintageClassic, 250);

  results['modern-trendy'] = fillList(allNames, 'modern-trendy',
    isModernTrendy, 250);

  results['one-syllable'] = fillList(allNames, 'one-syllable',
    name => matchesSyllables(name, 1), 250);

  results['four-letter'] = fillList(allNames, 'four-letter',
    name => name.name.length === 4, 250);

  results['unique-rare'] = fillList(allNames, 'unique-rare',
    isUniqueRare, 250);

  // Summary Report
  console.log('\n' + '='.repeat(60));
  console.log('SUMMARY REPORT');
  console.log('='.repeat(60) + '\n');

  let totalAdded = 0;
  Object.entries(results).forEach(([listId, names]) => {
    console.log(`${listId.padEnd(25)} ${names.length.toString().padStart(3)} names`);
    totalAdded += names.length;
  });

  console.log('\n' + '-'.repeat(60));
  console.log(`TOTAL:                    ${totalAdded} names added to 20 lists`);
  console.log('='.repeat(60) + '\n');

  // Save results to JSON file
  const outputPath = path.join(__dirname, 'themed-lists-populated-v2.json');
  fs.writeFileSync(outputPath, JSON.stringify(results, null, 2));
  console.log(`✅ Results saved to: ${outputPath}\n`);

  console.log('🎉 COMPLETE! Ready to update themedLists.ts\n');
};

// Run the script
try {
  main();
} catch (error) {
  console.error('\n❌ ERROR:', error);
  console.error(error.stack);
  process.exit(1);
}
