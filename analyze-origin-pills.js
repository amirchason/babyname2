const fs = require('fs');
const path = require('path');

// Consolidation logic from NameCacheContext.tsx
const consolidateOrigin = (origin) => {
  const lower = origin.toLowerCase().trim();

  // Scottish & Irish consolidation (shared Gaelic heritage)
  if (lower === 'scottish' || lower === 'irish' || lower === 'scots' || lower === 'gaelic' ||
      lower === 'celtic' || lower.includes('scottish') || lower.includes('irish') ||
      lower.includes('scots') || lower.includes('gaelic') || lower.includes('celtic')) {
    return 'Scottish & Irish';
  }

  // Slavic & Eastern European
  if (lower === 'slavic' || lower === 'polish' || lower === 'russian' || lower === 'bulgarian' ||
      lower === 'czech' || lower === 'ukrainian' || lower === 'croatian' || lower === 'serbian' ||
      lower === 'slovak' || lower === 'belarusian' || lower.includes('slavic') ||
      lower.includes('polish') || lower.includes('russian')) {
    return 'Slavic';
  }

  // Germanic & Nordic
  if (lower === 'germanic' || lower === 'german' || lower === 'swiss' || lower === 'norse' ||
      lower === 'old norse' || lower === 'scandinavian' || lower === 'nordic' || lower === 'swedish' ||
      lower === 'danish' || lower === 'norwegian' || lower === 'finnish' || lower === 'icelandic' ||
      lower.includes('germanic') || lower.includes('german') || lower.includes('norse') ||
      lower.includes('scandinavian') || lower.includes('nordic') || lower.includes('swedish') ||
      lower.includes('danish') || lower.includes('norwegian') || lower.includes('finnish')) {
    return 'Germanic & Nordic';
  }

  // Hebrew & Biblical
  if (lower === 'hebrew' || lower === 'biblical' || lower.includes('hebrew') || lower.includes('biblical')) {
    return 'Hebrew & Biblical';
  }

  // Greek & Mythological
  if (lower === 'greek' || lower === 'mythological' || lower === 'egyptian' || lower === 'old english' ||
      lower.includes('greek') || lower.includes('mythological') || lower.includes('egyptian')) {
    return 'Greek & Mythological';
  }

  // Contemporary & Modern
  if (lower === 'contemporary' || lower === 'latin american' || lower === 'invented' ||
      lower === 'american' || lower === 'literary' || lower === 'modern' || lower === 'modern english' ||
      lower === 'fantasy' || lower === 'fictional' || lower.includes('contemporary') ||
      lower.includes('invented') || lower.includes('literary') || lower.includes('fantasy')) {
    return 'Contemporary';
  }

  // Middle Eastern & Caucasian
  if (lower === 'middle eastern' || lower === 'caucasian' || lower === 'aramaic' || lower === 'turkic' ||
      lower.includes('middle eastern') || lower.includes('caucasian') || lower.includes('aramaic')) {
    return 'Middle Eastern';
  }

  // African origins
  if (lower.includes('african') || lower.includes('swahili') || lower.includes('yoruba') ||
      lower.includes('igbo') || lower.includes('akan') || lower.includes('hausa')) {
    return 'African';
  }

  // South Asian origins
  if (lower === 'sanskrit' || lower === 'hindi' || lower === 'bengali' || lower === 'punjabi' ||
      lower === 'tamil' || lower === 'urdu' || lower === 'telugu' || lower === 'kannada' ||
      lower === 'gujarati' || lower === 'marathi' || lower === 'malayalam' || lower === 'nepali' ||
      lower === 'pali' || lower === 'sikh' || lower === 'hindu' || lower === 'south asian' ||
      lower.includes('sanskrit') || lower.includes('hindi') || lower.includes('bengali') ||
      lower.includes('punjabi') || lower.includes('tamil') || lower.includes('urdu') ||
      lower.includes('telugu') || lower.includes('kannada') || lower.includes('gujarati') ||
      lower.includes('marathi') || lower.includes('malayalam') || lower.includes('nepali') ||
      lower.includes('sikh') || lower.includes('hindu')) {
    if (lower.includes('indian')) return 'Indian';
    return 'South Asian';
  }

  // Southeast Asian origins
  if (lower.includes('vietnamese') || lower.includes('thai') || lower.includes('indonesian') ||
      lower.includes('malay') || lower.includes('filipino') || lower.includes('burmese') ||
      lower.includes('tagalog')) {
    return 'Southeast Asian';
  }

  // Central/West Asian origins
  if (lower.includes('persian') || lower.includes('armenian') || lower.includes('georgian') ||
      lower.includes('kazakh') || lower.includes('uzbek') || lower.includes('azerbaijani')) {
    return 'Central/West Asian';
  }

  // Small European origins
  if (lower.includes('albanian') || lower.includes('basque') || lower.includes('estonian') ||
      lower.includes('latvian') || lower.includes('lithuanian') || lower.includes('maltese')) {
    return 'European (Other)';
  }

  // Indigenous & Oceanic origins
  if (lower.includes('maori') || lower.includes('aboriginal') || lower.includes('polynesian') ||
      lower.includes('hawaiian') || lower.includes('native') || lower.includes('indigenous') ||
      lower.includes('cherokee') || lower.includes('navajo')) {
    return 'Indigenous & Oceanic';
  }

  return origin;
};

// Load and process all chunks
const chunkFiles = [
  'public/data/names-core.json',
  'public/data/names-chunk1.json',
  'public/data/names-chunk2.json',
  'public/data/names-chunk3.json',
  'public/data/names-chunk4.json',
  'public/data/names-chunk5.json'
];

const originCounts = new Map();

console.log('Loading and analyzing name data...\n');

for (const file of chunkFiles) {
  const filePath = path.join(__dirname, file);
  if (!fs.existsSync(filePath)) {
    console.log(`Skipping ${file} (not found)`);
    continue;
  }

  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  const names = data.names || data;

  console.log(`Processing ${file}: ${names.length} names`);

  names.forEach(name => {
    const originField = name.originGroup || name.origin;
    if (originField) {
      const origins = Array.isArray(originField) ? originField : [originField];
      origins.forEach(origin => {
        const consolidated = consolidateOrigin(origin);
        originCounts.set(consolidated, (originCounts.get(consolidated) || 0) + 1);
      });
    }
  });
}

// Sort by count descending
const sortedOrigins = Array.from(originCounts.entries())
  .sort((a, b) => b[1] - a[1]);

console.log('\n' + '='.repeat(60));
console.log('ORIGIN FILTER PILLS (sorted by count)');
console.log('='.repeat(60) + '\n');

sortedOrigins.forEach(([origin, count], index) => {
  const mark = count < 250 ? ' ⚠️  BELOW 250!' : '';
  console.log(`${(index + 1).toString().padStart(2)}. ${origin.padEnd(30)} ${count.toLocaleString().padStart(8)} names${mark}`);
});

console.log('\n' + '='.repeat(60));
console.log(`Total unique origins: ${sortedOrigins.length}`);
console.log(`Origins < 250 names: ${sortedOrigins.filter(([_, count]) => count < 250).length}`);
console.log('='.repeat(60) + '\n');
