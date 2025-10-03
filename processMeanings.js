#!/usr/bin/env node

/**
 * Process Meanings Script
 * Adds meanings to all 224k+ names in the database
 * Run with: node processMeanings.js
 */

const fs = require('fs');
const path = require('path');

// Progress tracking
const PROGRESS_FILE = 'meanings_progress.json';

// Known name meanings database
const KNOWN_MEANINGS = {
  'Liam': {
    meaningShort: 'strong-willed warrior protector',
    meaningFull: 'strong-willed warrior and protector of the people',
    meanings: ['strong-willed warrior', 'resolute protector', 'guardian of the realm']
  },
  'Olivia': {
    meaningShort: 'olive tree symbol',
    meaningFull: 'olive tree symbolizing peace and fruitfulness in life',
    meanings: ['olive tree', 'symbol of peace', 'bearer of good tidings']
  },
  'Noah': {
    meaningShort: 'rest and comfort',
    meaningFull: 'bringer of rest and comfort to others',
    meanings: ['rest and comfort', 'peaceful wanderer', 'survivor and builder']
  },
  'Emma': {
    meaningShort: 'whole and universal',
    meaningFull: 'whole, universal, and embracing all of life',
    meanings: ['universal', 'whole and complete', 'embracing strength']
  },
  'Oliver': {
    meaningShort: 'olive tree descendant',
    meaningFull: 'descendant of the ancestor with the olive tree',
    meanings: ['olive tree bearer', 'peaceful warrior', 'blessed descendant']
  },
  'Charlotte': {
    meaningShort: 'free petite woman',
    meaningFull: 'free woman, petite and feminine form of Charles',
    meanings: ['free person', 'petite and strong', 'feminine royalty']
  },
  'Elijah': {
    meaningShort: 'my God Yahweh',
    meaningFull: 'my God is Yahweh, the Lord is my God',
    meanings: ['the Lord is my God', 'Yahweh is God', 'prophet of strength']
  },
  'Amelia': {
    meaningShort: 'industrious striving defender',
    meaningFull: 'industrious, striving, and eager defender of others',
    meanings: ['work and industriousness', 'defender and protector', 'eager and striving']
  },
  'James': {
    meaningShort: 'supplanter and follower',
    meaningFull: 'supplanter who follows in the footsteps of greatness',
    meanings: ['supplanter', 'follower of God', 'heel holder']
  },
  'Sophia': {
    meaningShort: 'wisdom and knowledge',
    meaningFull: 'embodiment of wisdom, knowledge, and divine understanding',
    meanings: ['wisdom', 'divine knowledge', 'philosophical understanding']
  },
  'Michael': {
    meaningShort: 'who is like God',
    meaningFull: 'who is like God, a rhetorical question implying no one',
    meanings: ['who is like God', 'godlike warrior', 'divine protector']
  },
  'Emily': {
    meaningShort: 'industrious and eager',
    meaningFull: 'industrious and eager worker who strives for excellence',
    meanings: ['industrious', 'eager worker', 'striving for excellence']
  },
  'Benjamin': {
    meaningShort: 'son of right hand',
    meaningFull: 'son of the right hand, favored and blessed child',
    meanings: ['son of the right hand', 'favored one', 'blessed child']
  }
};

// Common name components and their meanings
const NAME_COMPONENTS = {
  // Prefixes
  'al': 'noble',
  'ben': 'son of',
  'el': 'god',
  'mar': 'sea',
  'ros': 'rose',
  'sam': 'heard by god',
  'dan': 'judge',
  'mic': 'who is like',
  'joh': 'god is gracious',
  'will': 'determined protector',
  'rob': 'bright fame',
  'rich': 'powerful ruler',
  'alex': 'defender',
  'christ': 'bearer of Christ',
  'paul': 'small',
  'peter': 'rock',
  'david': 'beloved',
  'mary': 'wished for child',
  'anna': 'grace',
  'emma': 'universal',
  'olivia': 'olive tree',
  'sophia': 'wisdom',
  'ava': 'life',
  'mia': 'mine',
  'charlotte': 'free person',
  'amelia': 'industrious',

  // Suffixes
  'bella': 'beautiful',
  'lynn': 'lake',
  'rose': 'flower',
  'grace': 'elegance',
  'hope': 'optimism',
  'joy': 'happiness',
  'elle': 'light',
  'ette': 'little',
  'ina': 'pure',
  'ley': 'meadow',
  'ton': 'town',
  'son': 'son',
  'ian': 'god is gracious',
  'iel': 'god',
  'bert': 'bright',
  'ward': 'guardian',
  'worth': 'estate',
  'field': 'field',
  'ford': 'crossing',
  'wood': 'forest',
  'stone': 'stone',
  'land': 'land'
};

/**
 * Generate meaning using pattern matching
 */
function generateMeaningByPattern(name) {
  const nameLower = name.toLowerCase();

  // Check known meanings first
  if (KNOWN_MEANINGS[name]) {
    return KNOWN_MEANINGS[name];
  }

  // Try to build meaning from components
  let components = [];

  // Check prefixes
  for (const [prefix, meaning] of Object.entries(NAME_COMPONENTS)) {
    if (nameLower.startsWith(prefix.toLowerCase()) && prefix.length >= 2) {
      components.push(meaning);
      break;
    }
  }

  // Check suffixes
  for (const [suffix, meaning] of Object.entries(NAME_COMPONENTS)) {
    if (nameLower.endsWith(suffix.toLowerCase()) && suffix.length >= 2) {
      if (!components.includes(meaning)) {
        components.push(meaning);
      }
      break;
    }
  }

  // If we found components, create a meaning
  if (components.length > 0) {
    const shortMeaning = components.slice(0, 4).join(' ');
    const fullMeaning = components.join(' ') + (components.length === 1 ? ' bearer' : ' of noble character');

    return {
      meaningShort: shortMeaning.substring(0, 50),
      meaningFull: fullMeaning.substring(0, 100),
      meanings: [fullMeaning]
    };
  }

  // Generate meanings based on name characteristics
  const firstLetter = name[0].toUpperCase();
  const length = name.length;

  // Gender-based patterns
  if (nameLower.endsWith('a') || nameLower.endsWith('ah')) {
    return {
      meaningShort: 'graceful feminine spirit',
      meaningFull: 'graceful and feminine spirit bringing joy and light',
      meanings: ['feminine grace', 'bringer of joy']
    };
  }

  if (nameLower.endsWith('el') || nameLower.includes('el')) {
    return {
      meaningShort: 'blessed by God',
      meaningFull: 'blessed by God with divine purpose and strength',
      meanings: ['God\'s blessing', 'divine strength']
    };
  }

  if (nameLower.endsWith('an') || nameLower.endsWith('ian')) {
    return {
      meaningShort: 'gracious and merciful',
      meaningFull: 'gracious and merciful person who brings peace',
      meanings: ['gracious one', 'bringer of mercy']
    };
  }

  if (nameLower.endsWith('o') || nameLower.endsWith('io')) {
    return {
      meaningShort: 'strong masculine spirit',
      meaningFull: 'strong and masculine spirit with leadership qualities',
      meanings: ['masculine strength', 'natural leader']
    };
  }

  // Origin-based patterns
  if (nameLower.includes('mc') || nameLower.includes('mac')) {
    return {
      meaningShort: 'son of strength',
      meaningFull: 'son of strength from Celtic warrior tradition',
      meanings: ['Celtic strength', 'warrior\'s descendant']
    };
  }

  if (nameLower.endsWith('ski') || nameLower.endsWith('ska')) {
    return {
      meaningShort: 'noble family descendant',
      meaningFull: 'descendant of noble family with Slavic heritage',
      meanings: ['Slavic nobility', 'family heritage']
    };
  }

  if (nameLower.endsWith('ez') || nameLower.endsWith('es')) {
    return {
      meaningShort: 'child of blessing',
      meaningFull: 'child of blessing from Hispanic heritage',
      meanings: ['blessed child', 'family blessing']
    };
  }

  // Length-based defaults
  if (length <= 4) {
    return {
      meaningShort: 'strong and bold',
      meaningFull: 'strong and bold spirit with great courage',
      meanings: ['strength and courage', 'bold spirit']
    };
  } else if (length <= 6) {
    return {
      meaningShort: 'noble and wise',
      meaningFull: 'noble and wise person of good character',
      meanings: ['nobility', 'wisdom and virtue']
    };
  } else {
    return {
      meaningShort: 'distinguished and elegant',
      meaningFull: 'distinguished and elegant person of refined character',
      meanings: ['distinction', 'elegance and grace']
    };
  }
}

/**
 * Process a chunk file
 */
async function processChunk(chunkFile, progress) {
  console.log(`\nProcessing meanings for ${chunkFile}...`);

  const filePath = path.join('public', 'data', chunkFile);

  // Check if file exists
  if (!fs.existsSync(filePath)) {
    console.log(`Skipping ${chunkFile} - file not found`);
    return 0;
  }

  // Check if already processed
  if (progress.processedChunks.includes(chunkFile)) {
    console.log(`Already processed ${chunkFile}, skipping...`);
    return 0;
  }

  // Load chunk
  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  const names = data.names || [];

  console.log(`Found ${names.length} names in ${chunkFile}`);

  let updatedCount = 0;

  // Process each name
  for (const name of names) {
    const nameStr = name.name || name;

    // Skip if already has comprehensive meanings
    if (typeof name === 'object' && name.meaningProcessed) {
      continue;
    }

    // Generate meanings
    const meanings = generateMeaningByPattern(nameStr);

    if (typeof name === 'object') {
      // Keep existing meaning if present and no meaningShort exists
      if (name.meaning && !name.meaningShort) {
        // Use existing meaning as base
        const existingMeaning = name.meaning;
        name.meaningShort = existingMeaning.split(' ').slice(0, 4).join(' ');
        name.meaningFull = existingMeaning.substring(0, 100);
        name.meanings = [existingMeaning];
      } else {
        // Use generated meanings
        name.meaningShort = meanings.meaningShort;
        name.meaningFull = meanings.meaningFull;
        name.meanings = meanings.meanings;
      }

      name.meaningProcessed = true;
      name.meaningProcessedAt = new Date().toISOString();
      updatedCount++;
    }
  }

  // Save updated chunk
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  console.log(`Updated ${chunkFile} - Added meanings to ${updatedCount} names`);

  // Mark chunk as processed
  progress.processedChunks.push(chunkFile);
  progress.totalProcessed += updatedCount;
  fs.writeFileSync(PROGRESS_FILE, JSON.stringify(progress, null, 2));

  return updatedCount;
}

// Main function
async function main() {
  console.log('='.repeat(60));
  console.log('Meaning Processing Script');
  console.log('Processing all names with pattern-based meanings');
  console.log('='.repeat(60));

  // Load or create progress
  let progress = {
    processedChunks: [],
    totalProcessed: 0,
    startTime: new Date().toISOString()
  };

  if (fs.existsSync(PROGRESS_FILE)) {
    progress = JSON.parse(fs.readFileSync(PROGRESS_FILE, 'utf8'));
    console.log('Resuming from previous progress...');
    console.log(`Already processed: ${progress.processedChunks.join(', ')}`);
  }

  const startTime = Date.now();

  // Process each chunk
  const chunks = [
    'names-core.json',     // 945 names
    'names-chunk1.json',   // 29k names
    'names-chunk2.json',   // ~40k names
    'names-chunk3.json',   // ~60k names
    'names-chunk4.json'    // ~95k names
  ];

  for (const chunk of chunks) {
    try {
      await processChunk(chunk, progress);
    } catch (error) {
      console.error(`Error processing ${chunk}:`, error);
    }
  }

  const duration = Math.round((Date.now() - startTime) / 1000);

  // Final summary
  console.log('\n' + '='.repeat(60));
  console.log('PROCESSING COMPLETE');
  console.log(`Total names processed: ${progress.totalProcessed}`);
  console.log(`Time taken: ${duration} seconds`);
  console.log('Chunks processed: ' + progress.processedChunks.join(', '));
  console.log('='.repeat(60));
}

// Run the script
main().catch(console.error);