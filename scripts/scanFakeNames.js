const fs = require('fs');
const path = require('path');

// Detection patterns for non-names
const DEFINITION_KEYWORDS = [
  'substances with',
  'to be',
  'type of',
  'used for',
  'refers to',
  'a substance',
  'a collection',
  'plural of',
  'relating to',
  'consisting of',
  'made from',
  'derived from a',
  'commonly known as',
  'chemical compound',
  'scientific term',
  'in chemistry',
  'in biology'
];

const SUSPICIOUS_ORIGINS = [
  'OtherEnglish',
  'Other',
  'Unknown',
  'N/A'
];

// Common English words that are NOT names
const COMMON_WORDS = [
  'chemicals', 'shame', 'animals', 'objects', 'things', 'items',
  'people', 'places', 'events', 'actions', 'feelings', 'emotions',
  'thoughts', 'ideas', 'concepts', 'substances', 'materials',
  'elements', 'compounds', 'mixtures', 'solutions', 'reactions',
  'processes', 'systems', 'structures', 'functions', 'properties'
];

// Scan a single name entry
function isSuspiciousName(entry) {
  const suspicionReasons = [];
  let confidenceLevel = null;

  const name = entry.name?.toLowerCase() || '';
  const meaning = (entry.meaning || entry.meaningShort || entry.meaningFull || '').toLowerCase();
  const origin = entry.origin || entry.originGroup || '';
  const rank = entry.popularityRank || entry.rank || 999999;

  // HIGH CONFIDENCE - Obvious non-names

  // Check if it's a common word (plural, capitalized)
  if (COMMON_WORDS.includes(name)) {
    suspicionReasons.push('Common English word, not a name');
    confidenceLevel = 'HIGH';
  }

  // Check if meaning contains definition keywords
  const hasDefinitionKeyword = DEFINITION_KEYWORDS.some(keyword =>
    meaning.includes(keyword)
  );

  if (hasDefinitionKeyword) {
    suspicionReasons.push('Meaning is a dictionary definition');
    if (!confidenceLevel) confidenceLevel = 'HIGH';
  }

  // Check for plural form (ends with 's' and is a common word pattern)
  if (name.endsWith('s') && meaning.includes('plural')) {
    suspicionReasons.push('Plural form of common word');
    confidenceLevel = 'HIGH';
  }

  // MEDIUM CONFIDENCE - Needs review

  // Suspicious origin + very low rank
  if (SUSPICIOUS_ORIGINS.includes(origin) && rank > 80000) {
    suspicionReasons.push(`Suspicious origin "${origin}" with very low rank`);
    if (!confidenceLevel) confidenceLevel = 'MEDIUM';
  }

  // Meaning starts with verb phrases
  if (meaning.startsWith('to ') && rank > 50000) {
    suspicionReasons.push('Meaning is a verb phrase');
    if (!confidenceLevel) confidenceLevel = 'MEDIUM';
  }

  // Very generic/abstract meaning
  const genericPatterns = [
    'a feeling of',
    'the act of',
    'the state of',
    'a quality of',
    'absence of'
  ];

  const hasGenericPattern = genericPatterns.some(pattern =>
    meaning.includes(pattern)
  );

  if (hasGenericPattern && rank > 70000) {
    suspicionReasons.push('Generic/abstract meaning (not name-like)');
    if (!confidenceLevel) confidenceLevel = 'MEDIUM';
  }

  // Return result
  if (suspicionReasons.length > 0) {
    return {
      name: entry.name,
      originalEntry: entry,
      reasons: suspicionReasons,
      confidence: confidenceLevel,
      rank: rank,
      meaning: entry.meaning || entry.meaningShort || '',
      origin: origin
    };
  }

  return null;
}

// Scan a database file
function scanDatabaseFile(filePath) {
  console.log(`\nScanning: ${path.basename(filePath)}...`);

  try {
    const data = fs.readFileSync(filePath, 'utf8');
    const names = JSON.parse(data);

    const suspicious = [];

    if (Array.isArray(names)) {
      for (const entry of names) {
        const result = isSuspiciousName(entry);
        if (result) {
          suspicious.push(result);
        }
      }
    }

    console.log(`  Found ${suspicious.length} suspicious entries`);
    return suspicious;
  } catch (error) {
    console.error(`  Error scanning ${filePath}:`, error.message);
    return [];
  }
}

// Main scanning function
function scanAllDatabases() {
  const dataDir = path.join(__dirname, '../public/data');

  // Files to scan in priority order
  const filesToScan = [
    'names-chunk1.json',      // Most popular ~1000 names
    'popularNames_cache.json', // Top 10k
    'names-chunk2.json',       // Extended database
    'names-chunk3.json',       // Extended database (contains Shame, Chemicals)
    'names-chunk4.json',       // Extended database
    'top100k_names.json'       // Full top 100k
  ];

  console.log('🔍 Starting database scan for fake names...\n');
  console.log('═══════════════════════════════════════════\n');

  const allSuspicious = [];

  for (const file of filesToScan) {
    const filePath = path.join(dataDir, file);
    if (fs.existsSync(filePath)) {
      const suspicious = scanDatabaseFile(filePath);
      allSuspicious.push(...suspicious);
    } else {
      console.log(`⚠️  File not found: ${file}`);
    }
  }

  // Categorize by confidence level
  const high = allSuspicious.filter(s => s.confidence === 'HIGH');
  const medium = allSuspicious.filter(s => s.confidence === 'MEDIUM');

  // Sort by rank (most popular first)
  high.sort((a, b) => a.rank - b.rank);
  medium.sort((a, b) => a.rank - b.rank);

  // Print results
  console.log('\n\n╔══════════════════════════════════════════╗');
  console.log('║        SCAN RESULTS SUMMARY              ║');
  console.log('╚══════════════════════════════════════════╝\n');

  console.log(`Total suspicious names found: ${allSuspicious.length}`);
  console.log(`  🚨 HIGH confidence: ${high.length}`);
  console.log(`  ⚠️  MEDIUM confidence: ${medium.length}\n`);

  // Print HIGH confidence
  if (high.length > 0) {
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🚨 HIGH CONFIDENCE - Obviously NOT Real Names');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    high.forEach(entry => {
      console.log(`📛 ${entry.name}`);
      console.log(`   Rank: #${entry.rank}`);
      console.log(`   Meaning: "${entry.meaning}"`);
      console.log(`   Origin: ${entry.origin}`);
      console.log(`   🔴 Issues:`);
      entry.reasons.forEach(reason => {
        console.log(`      • ${reason}`);
      });
      console.log('');
    });
  }

  // Print MEDIUM confidence
  if (medium.length > 0) {
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('⚠️  MEDIUM CONFIDENCE - Needs Review');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    medium.forEach(entry => {
      console.log(`⚡ ${entry.name}`);
      console.log(`   Rank: #${entry.rank}`);
      console.log(`   Meaning: "${entry.meaning}"`);
      console.log(`   Origin: ${entry.origin}`);
      console.log(`   🟡 Issues:`);
      entry.reasons.forEach(reason => {
        console.log(`      • ${reason}`);
      });
      console.log('');
    });
  }

  // Save results to file
  const resultsFile = path.join(__dirname, 'fake-names-scan-results.json');
  fs.writeFileSync(resultsFile, JSON.stringify({
    scanDate: new Date().toISOString(),
    totalSuspicious: allSuspicious.length,
    highConfidence: high,
    mediumConfidence: medium
  }, null, 2));

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`📄 Results saved to: ${path.basename(resultsFile)}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  return { high, medium };
}

// Run scan
scanAllDatabases();
