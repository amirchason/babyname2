const fs = require('fs');
const path = require('path');

// Simple but accurate syllable counter
function countSyllables(word) {
  word = word.toLowerCase().trim();

  // Known 1-syllable exceptions
  const oneSyllable = new Set([
    'are', 'our', 'hour', 'owe', 'eye', 'queue'
  ]);

  if (oneSyllable.has(word)) return 1;
  if (word.length <= 3) return 1;

  // Replace problem patterns
  word = word.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '');
  word = word.replace(/^y/, '');

  // Count vowel groups
  const vowelGroups = word.match(/[aeiouy]{1,2}/g);
  return vowelGroups ? vowelGroups.length : 1;
}

// More accurate syllable counter with extensive rules
function accurateSyllableCount(name) {
  const word = name.toLowerCase().trim();

  // Dictionary of known difficult cases
  const knownCounts = {
    // 1 syllable
    'bruce': 1, 'claire': 1, 'drake': 1, 'dwight': 1, 'faith': 1, 'grace': 1,
    'james': 1, 'keith': 1, 'leigh': 1, 'miles': 1, 'peace': 1, 'prince': 1,
    'reese': 1, 'rhys': 1, 'shawn': 1, 'trent': 1, 'blake': 1, 'brooke': 1,
    'chase': 1, 'claude': 1, 'clyde': 1, 'dean': 1, 'hugh': 1, 'joyce': 1,
    'june': 1, 'kurt': 1, 'luke': 1, 'paige': 1, 'pierce': 1, 'praise': 1,
    'quinn': 1, 'reece': 1, 'reign': 1, 'sage': 1, 'shane': 1, 'sloane': 1,
    'tate': 1, 'troy': 1, 'vaughn': 1, 'wayne': 1, 'wren': 1,
    // 2 syllables
    'aaron': 2, 'abby': 2, 'anna': 2, 'emma': 2, 'noah': 2, 'mia': 2,
    'owen': 2, 'ava': 2, 'ella': 2, 'maya': 2, 'ruby': 2, 'lucy': 2,
    // 3 syllables
    'olivia': 3, 'amelia': 3, 'sophia': 3, 'elijah': 3, 'isabella': 3,
    // 4 syllables
    'alexander': 4, 'elizabeth': 4
  };

  if (knownCounts[word]) {
    return knownCounts[word];
  }

  // If 3 letters or less, usually 1 syllable
  if (word.length <= 3) return 1;

  let syllables = 0;
  let lastWasVowel = false;
  const vowels = 'aeiouy';

  // Count vowel groups
  for (let i = 0; i < word.length; i++) {
    const isVowel = vowels.includes(word[i]);
    if (isVowel && !lastWasVowel) {
      syllables++;
    }
    lastWasVowel = isVowel;
  }

  // Subtract for silent e
  if (word.endsWith('e') && syllables > 1 && word.length > 2) {
    syllables--;
  }

  // Add for -le ending after consonant
  if (word.endsWith('le') && word.length > 2) {
    const beforeLe = word[word.length - 3];
    if (!vowels.includes(beforeLe)) {
      syllables++;
    }
  }

  return Math.max(1, syllables);
}

async function analyzeSyllables() {
  console.log('🔍 Analyzing all names for syllable counts...\n');

  const chunkDir = path.join(__dirname, 'public', 'data');
  const chunks = ['names-chunk1.json', 'names-chunk2.json', 'names-chunk3.json', 'names-chunk4.json'];

  let allNames = [];

  // Load all chunks
  for (const chunkFile of chunks) {
    const chunkPath = path.join(chunkDir, chunkFile);
    if (fs.existsSync(chunkPath)) {
      const data = JSON.parse(fs.readFileSync(chunkPath, 'utf8'));
      const names = data.names || data; // Handle both {names: []} and [] formats
      allNames = allNames.concat(names);
      console.log(`✅ Loaded ${chunkFile}: ${names.length} names`);
    }
  }

  console.log(`\n📊 Total names loaded: ${allNames.length}\n`);

  // Analyze syllables
  const syllableCounts = { 1: [], 2: [], 3: [], 4: [], '5+': [] };

  for (const nameObj of allNames) {
    if (!nameObj || !nameObj.name) continue; // Skip invalid entries

    const name = nameObj.name;
    const count = accurateSyllableCount(name);

    if (count <= 4) {
      syllableCounts[count].push(name);
    } else {
      syllableCounts['5+'].push(name);
    }
  }

  // Display results
  console.log('═══════════════════════════════════════════');
  console.log('📈 SYLLABLE COUNT DISTRIBUTION');
  console.log('═══════════════════════════════════════════\n');

  for (const [count, names] of Object.entries(syllableCounts)) {
    console.log(`${count} syllable(s): ${names.length} names`);
  }

  console.log('\n═══════════════════════════════════════════');
  console.log('📋 SAMPLE 1-SYLLABLE NAMES (First 100)');
  console.log('═══════════════════════════════════════════\n');

  const oneSyllable = syllableCounts[1].slice(0, 100);
  console.log(oneSyllable.join(', '));

  // Save to file
  const outputPath = path.join(__dirname, 'one-syllable-names.json');
  fs.writeFileSync(outputPath, JSON.stringify(syllableCounts[1], null, 2));

  console.log(`\n✅ Saved all ${syllableCounts[1].length} one-syllable names to: one-syllable-names.json`);

  // Create a Set for quick lookup (save as JS file)
  const setContent = `// Auto-generated list of 1-syllable names from database
// Generated: ${new Date().toISOString()}
// Total: ${syllableCounts[1].length} names

export const oneSyllableNames = new Set([
${syllableCounts[1].map(name => `  '${name.toLowerCase()}'`).join(',\n')}
]);
`;

  const jsOutputPath = path.join(__dirname, 'src', 'data', 'oneSyllableNames.ts');
  fs.writeFileSync(jsOutputPath, setContent);

  console.log(`✅ Saved as TypeScript module: src/data/oneSyllableNames.ts`);

  console.log('\n🎯 Summary:');
  console.log(`   - 1-syllable names: ${syllableCounts[1].length}`);
  console.log(`   - 2-syllable names: ${syllableCounts[2].length}`);
  console.log(`   - 3-syllable names: ${syllableCounts[3].length}`);
  console.log(`   - 4+ syllable names: ${syllableCounts[4].length + syllableCounts['5+'].length}`);
  console.log('\n✨ Done! Now update HomePage.tsx to import this file.');
}

analyzeSyllables().catch(err => {
  console.error('❌ Error:', err);
  process.exit(1);
});
