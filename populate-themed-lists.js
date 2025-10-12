/**
 * Populate Themed Lists
 *
 * Fills all themed lists that currently have 0 names with 200+ popular, relevant names
 * from the 174k+ name database.
 *
 * Priority:
 * 1. Origin lists (Irish, Italian, Greek, Hebrew, French, Spanish, Japanese, Arabic)
 * 2. Meaning lists (light, strength, wisdom, joy, love, brave, peace)
 * 3. Style lists (vintage-classic, modern-trendy, one-syllable, four-letter, unique-rare)
 */

const fs = require('fs');
const path = require('path');

// Load the database chunks
const loadChunks = () => {
  console.log('📦 Loading database chunks...');
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

  console.log(`\n✅ Total names loaded: ${chunks.length}\n`);
  return chunks;
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

  // Classic prefixes
  const vintagePrefixes = [
    'Ada', 'Albert', 'Alfred', 'Alice', 'Arthur', 'Beatrice', 'Charles', 'Clara',
    'Dorothy', 'Edith', 'Eleanor', 'Elizabeth', 'Florence', 'Francis', 'George',
    'Grace', 'Harold', 'Harry', 'Helen', 'Henry', 'Irene', 'James', 'John',
    'Joseph', 'Margaret', 'Mary', 'Mildred', 'Robert', 'Ruth', 'Thomas', 'Walter',
    'William'
  ];

  const hasVintagePrefix = vintagePrefixes.some(prefix =>
    name.name.toLowerCase().startsWith(prefix.toLowerCase())
  );

  return hasVintageTags || hasVintagePrefix;
};

// Helper: Check if name is modern/trendy
const isModernTrendy = (name) => {
  // Names with modern patterns
  const hasModernTags = (name.tags || []).some(tag =>
    ['modern', 'trendy', 'contemporary'].includes(tag.toLowerCase())
  );

  // Modern patterns and suffixes
  const modernPatterns = [
    'ayla', 'ayden', 'aylin', 'brayden', 'caden', 'ella', 'hayden', 'jaden',
    'kayden', 'ley', 'lia', 'lynn', 'mia', 'ria', 'xander', 'yn', 'zander'
  ];

  const nameLower = name.name.toLowerCase();
  const hasModernPattern = modernPatterns.some(pattern =>
    nameLower.includes(pattern)
  );

  return hasModernTags || hasModernPattern;
};

// Helper: Check if name is unique/rare
const isUniqueRare = (name) => {
  // Names with popularity > 1000 (less popular = more unique)
  const popularity = name.popularity || name.popularityRank || 0;
  return popularity > 1000;
};

// Fill origin list
const fillOriginList = (allNames, listId, origins, targetCount = 200) => {
  console.log(`\n🔍 Filling "${listId}" (Origins: ${origins.join(', ')})...`);

  const matches = allNames
    .filter(name => matchesOrigin(name, origins))
    .sort((a, b) => {
      // Prioritize names WITH popularity data over those without
      const hasRankA = (a.popularityRank || a.popularity) ? true : false;
      const hasRankB = (b.popularityRank || b.popularity) ? true : false;

      if (hasRankA && !hasRankB) return -1;
      if (!hasRankA && hasRankB) return 1;

      // For names with ranks, lower rank = more popular (1 is most popular)
      const rankA = a.popularityRank || a.popularity || 999999;
      const rankB = b.popularityRank || b.popularity || 999999;
      return rankA - rankB;
    })
    .slice(0, targetCount)
    .map(n => n.name);

  console.log(`   ✓ Found ${matches.length} names`);
  if (matches.length > 0) {
    console.log(`   Top 10: ${matches.slice(0, 10).join(', ')}`);
  }

  return matches;
};

// Fill meaning list
const fillMeaningList = (allNames, listId, keywords, targetCount = 200) => {
  console.log(`\n🔍 Filling "${listId}" (Keywords: ${keywords.join(', ')})...`);

  const matches = allNames
    .filter(name => matchesMeaning(name, keywords))
    .sort((a, b) => {
      // Prioritize names WITH popularity data over those without
      const hasRankA = (a.popularityRank || a.popularity) ? true : false;
      const hasRankB = (b.popularityRank || b.popularity) ? true : false;

      if (hasRankA && !hasRankB) return -1;
      if (!hasRankA && hasRankB) return 1;

      // For names with ranks, lower rank = more popular (1 is most popular)
      const rankA = a.popularityRank || a.popularity || 999999;
      const rankB = b.popularityRank || b.popularity || 999999;
      return rankA - rankB;
    })
    .slice(0, targetCount)
    .map(n => n.name);

  console.log(`   ✓ Found ${matches.length} names`);
  if (matches.length > 0) {
    console.log(`   Top 10: ${matches.slice(0, 10).join(', ')}`);
  }

  return matches;
};

// Fill style list
const fillStyleList = (allNames, listId, filterFn, targetCount = 200) => {
  console.log(`\n🔍 Filling "${listId}"...`);

  const matches = allNames
    .filter(filterFn)
    .sort((a, b) => {
      // Prioritize names WITH popularity data over those without
      const hasRankA = (a.popularityRank || a.popularity) ? true : false;
      const hasRankB = (b.popularityRank || b.popularity) ? true : false;

      if (hasRankA && !hasRankB) return -1;
      if (!hasRankA && hasRankB) return 1;

      // For names with ranks, lower rank = more popular (1 is most popular)
      const rankA = a.popularityRank || a.popularity || 999999;
      const rankB = b.popularityRank || b.popularity || 999999;
      return rankA - rankB;
    })
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
  console.log('🚀 THEMED LISTS POPULATION SCRIPT\n');
  console.log('Goal: Fill 20 themed lists with 200+ names each\n');
  console.log('=' .repeat(60) + '\n');

  // Load database
  const allNames = loadChunks();

  if (allNames.length === 0) {
    console.error('❌ No names loaded from database!');
    process.exit(1);
  }

  // Results storage
  const results = {};

  // PRIORITY 1: Origin Lists (8 lists)
  console.log('\n' + '='.repeat(60));
  console.log('PHASE 1: ORIGIN LISTS');
  console.log('='.repeat(60));

  results['irish-celtic'] = fillOriginList(allNames, 'irish-celtic',
    ['Irish', 'Celtic', 'Gaelic', 'Scottish'], 250);

  results['italian'] = fillOriginList(allNames, 'italian',
    ['Italian'], 250);

  results['greek'] = fillOriginList(allNames, 'greek',
    ['Greek'], 250);

  results['hebrew-biblical'] = fillOriginList(allNames, 'hebrew-biblical',
    ['Hebrew'], 250);

  results['french'] = fillOriginList(allNames, 'french',
    ['French'], 250);

  results['spanish-latin'] = fillOriginList(allNames, 'spanish-latin',
    ['Spanish', 'Latin'], 250);

  results['japanese'] = fillOriginList(allNames, 'japanese',
    ['Japanese'], 250);

  results['arabic'] = fillOriginList(allNames, 'arabic',
    ['Arabic'], 250);

  // PRIORITY 2: Meaning Lists (7 lists)
  console.log('\n' + '='.repeat(60));
  console.log('PHASE 2: MEANING LISTS');
  console.log('='.repeat(60));

  results['meaning-light'] = fillMeaningList(allNames, 'meaning-light',
    ['light', 'bright', 'shine', 'radiant', 'luminous', 'glow'], 250);

  results['meaning-strength'] = fillMeaningList(allNames, 'meaning-strength',
    ['strong', 'strength', 'powerful', 'mighty', 'warrior', 'power'], 250);

  results['meaning-wisdom'] = fillMeaningList(allNames, 'meaning-wisdom',
    ['wise', 'wisdom', 'intelligent', 'sage', 'knowledgeable', 'learned'], 250);

  results['meaning-joy'] = fillMeaningList(allNames, 'meaning-joy',
    ['joy', 'happy', 'cheerful', 'delight', 'bliss', 'merry'], 250);

  results['meaning-love'] = fillMeaningList(allNames, 'meaning-love',
    ['love', 'beloved', 'affection', 'dear', 'cherished', 'adored'], 250);

  results['meaning-brave'] = fillMeaningList(allNames, 'meaning-brave',
    ['brave', 'courage', 'valor', 'fearless', 'bold', 'heroic'], 250);

  results['meaning-peace'] = fillMeaningList(allNames, 'meaning-peace',
    ['peace', 'calm', 'tranquil', 'serene', 'peaceful', 'harmony'], 250);

  // PRIORITY 3: Style Lists (5 lists)
  console.log('\n' + '='.repeat(60));
  console.log('PHASE 3: STYLE LISTS');
  console.log('='.repeat(60));

  results['vintage-classic'] = fillStyleList(allNames, 'vintage-classic',
    isVintageClassic, 250);

  results['modern-trendy'] = fillStyleList(allNames, 'modern-trendy',
    isModernTrendy, 250);

  results['one-syllable'] = fillStyleList(allNames, 'one-syllable',
    name => matchesSyllables(name, 1), 250);

  results['four-letter'] = fillStyleList(allNames, 'four-letter',
    name => name.name.length === 4, 250);

  results['unique-rare'] = fillStyleList(allNames, 'unique-rare',
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
  const outputPath = path.join(__dirname, 'themed-lists-populated.json');
  fs.writeFileSync(outputPath, JSON.stringify(results, null, 2));
  console.log(`✅ Results saved to: ${outputPath}\n`);

  // Generate TypeScript code for insertion
  console.log('📝 Generating TypeScript code...\n');

  const tsOutput = Object.entries(results).map(([listId, names]) => {
    const namesArray = names.map(n => `'${n}'`).join(', ');
    return `      specificNames: [\n        ${namesArray}\n      ],`;
  }).join('\n\n');

  const tsOutputPath = path.join(__dirname, 'themed-lists-typescript.txt');
  fs.writeFileSync(tsOutputPath, tsOutput);
  console.log(`✅ TypeScript code saved to: ${tsOutputPath}\n`);

  console.log('🎉 COMPLETE! Ready to update themedLists.ts\n');
};

// Run the script
try {
  main();
} catch (error) {
  console.error('\n❌ ERROR:', error);
  process.exit(1);
}
