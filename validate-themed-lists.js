#!/usr/bin/env node

/**
 * Themed Lists Validation Script
 *
 * This script:
 * 1. Loads all names from the database (174k names)
 * 2. For each themed list:
 *    - Enriches missing name meanings via OpenAI API
 *    - Validates each name against list criteria
 *    - Removes names that don't fit
 * 3. Saves updated themedLists.ts
 * 4. Generates detailed validation report
 */

const fs = require('fs');
const path = require('path');

// Configuration
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const BATCH_SIZE = 10; // Names per API call
const DELAY_BETWEEN_BATCHES = 1500; // 1.5 seconds
const MAX_RETRIES = 3;
const DRY_RUN = process.argv.includes('--dry-run'); // Test mode without saving

// Load all name chunks
console.log('📚 Loading name database...\n');

const chunks = [
  require('./public/data/names-chunk1.json'),
  require('./public/data/names-chunk2.json'),
  require('./public/data/names-chunk3.json'),
  require('./public/data/names-chunk4.json')
];

// Build name lookup map
const nameDatabase = new Map();
let totalNames = 0;

chunks.forEach((chunk, index) => {
  const names = chunk.names || [];
  console.log(`  Chunk ${index + 1}: ${names.length.toLocaleString()} names`);
  names.forEach(name => {
    const key = name.name.toLowerCase();
    nameDatabase.set(key, name);
  });
  totalNames += names.length;
});

console.log(`\n✅ Loaded ${totalNames.toLocaleString()} names from database\n`);

// Standard origins for validation
const STANDARD_ORIGINS = [
  'African', 'Arabic', 'Armenian', 'Celtic', 'Chinese', 'Dutch', 'English',
  'French', 'Gaelic', 'German', 'Greek', 'Hawaiian', 'Hebrew', 'Indian',
  'Irish', 'Italian', 'Japanese', 'Korean', 'Latin', 'Native American',
  'Norse', 'Persian', 'Polish', 'Portuguese', 'Russian', 'Scandinavian',
  'Scottish', 'Slavic', 'Spanish', 'Turkish', 'Vietnamese', 'Welsh',
  'Modern'
];

/**
 * OpenAI API helper - Batch analyze names
 */
async function enrichNames(names) {
  if (!OPENAI_API_KEY) {
    console.warn('⚠️  No OpenAI API key - skipping enrichment');
    return names.map(name => ({
      name,
      meaning: 'unknown',
      origin: 'Modern'
    }));
  }

  const prompt = `Analyze the following baby names. For EACH name, provide:
1. A concise, accurate meaning (1-4 words maximum)
2. The cultural origin(s) from this list: ${STANDARD_ORIGINS.filter(o => o !== 'Modern').join(', ')}

CRITICAL INSTRUCTIONS:
- NEVER use "Modern" as an origin - dig deeper to find the real cultural root
- Meanings should be specific and accurate (not generic like "beautiful name")
- Multiple origins allowed if mixed heritage (e.g., "Spanish, Latin")

Return a valid JSON array with EXACTLY ${names.length} objects in the SAME ORDER.

Format:
[
  {
    "name": "Rose",
    "meaning": "flower",
    "origin": "Latin"
  }
]

Names to analyze: ${names.join(', ')}

Return valid JSON only, no markdown or explanations.`;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are an expert in etymology and name meanings. Provide concise, accurate analysis in valid JSON format.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 800
      })
    });

    if (response.status === 429) {
      console.warn('⚠️  Rate limit hit, waiting...');
      await delay(5000);
      return enrichNames(names); // Retry
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('❌ OpenAI API error:', response.status, errorData);
      return names.map(name => ({ name, meaning: 'unknown', origin: 'Modern' }));
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;

    if (!content) {
      console.error('❌ No content in response');
      return names.map(name => ({ name, meaning: 'unknown', origin: 'Modern' }));
    }

    // Parse JSON response
    let jsonStr = content.trim();
    const jsonMatch = jsonStr.match(/```(?:json)?\s*(\[[\s\S]*?\])\s*```/) ||
                      jsonStr.match(/(\[[\s\S]*\])/);

    if (jsonMatch) {
      jsonStr = jsonMatch[1];
    }

    const results = JSON.parse(jsonStr);

    if (!Array.isArray(results) || results.length !== names.length) {
      console.warn(`⚠️  Expected ${names.length} results, got ${results.length}`);
    }

    return results;

  } catch (error) {
    console.error('❌ Error enriching names:', error.message);
    return names.map(name => ({ name, meaning: 'unknown', origin: 'Modern' }));
  }
}

/**
 * Delay helper
 */
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Validation functions for different list types
 */

function validateOriginList(name, requiredOrigins) {
  if (!name.origin) return false;

  const origins = Array.isArray(name.origin) ? name.origin : [name.origin];
  const originStr = origins.join(' ').toLowerCase();

  return requiredOrigins.some(required =>
    originStr.includes(required.toLowerCase())
  );
}

function validateMeaningList(name, keywords) {
  const meaningTexts = [
    name.meaning,
    name.meaningShort,
    name.meaningFull,
    ...(name.meanings || [])
  ].filter(Boolean);

  if (meaningTexts.length === 0) return false;

  const meaningStr = meaningTexts.join(' ').toLowerCase();

  return keywords.some(keyword =>
    meaningStr.includes(keyword.toLowerCase())
  );
}

function validateNatureTheme(name) {
  const nameText = name.name.toLowerCase();
  const meaningText = (name.meaning || '').toLowerCase();

  // Nature keywords
  const natureKeywords = [
    'tree', 'forest', 'flower', 'rose', 'lily', 'violet', 'daisy', 'iris',
    'river', 'brook', 'ocean', 'sea', 'lake', 'bay', 'mountain', 'hill',
    'meadow', 'field', 'garden', 'bloom', 'blossom', 'leaf', 'branch',
    'stone', 'rock', 'earth', 'sky', 'cloud', 'rain', 'snow', 'wind',
    'bird', 'dove', 'robin', 'sparrow', 'hawk', 'eagle', 'deer', 'bear',
    'wolf', 'fox', 'plant', 'herb', 'moss', 'fern', 'vine', 'willow',
    'oak', 'pine', 'cedar', 'maple', 'birch', 'ash', 'elm', 'nature'
  ];

  // Direct name match (e.g., "Rose", "River")
  if (natureKeywords.some(kw => nameText.includes(kw))) return true;

  // Meaning match
  if (natureKeywords.some(kw => meaningText.includes(kw))) return true;

  return false;
}

function validateCelestialTheme(name) {
  const nameText = name.name.toLowerCase();
  const meaningText = (name.meaning || '').toLowerCase();

  const celestialKeywords = [
    'star', 'stellar', 'nova', 'constellation', 'galaxy', 'comet',
    'moon', 'lunar', 'celestial', 'heaven', 'sky', 'cosmos', 'astral',
    'sun', 'solar', 'aurora', 'orion', 'sirius', 'vega', 'lyra',
    'constellation', 'planet', 'mars', 'venus', 'meteor', 'nebula',
    'twilight', 'dawn', 'dusk', 'night', 'astronomy', 'space'
  ];

  if (celestialKeywords.some(kw => nameText.includes(kw))) return true;
  if (celestialKeywords.some(kw => meaningText.includes(kw))) return true;

  return false;
}

function validateRoyalTheme(name) {
  const nameText = name.name.toLowerCase();
  const meaningText = (name.meaning || '').toLowerCase();

  const royalKeywords = [
    'king', 'queen', 'prince', 'princess', 'royal', 'regal', 'noble',
    'crown', 'throne', 'ruler', 'monarch', 'sovereign', 'emperor',
    'empress', 'duke', 'duchess', 'lord', 'lady', 'majesty', 'reign'
  ];

  // Check meaning for royal references
  if (royalKeywords.some(kw => meaningText.includes(kw))) return true;

  // Historically royal names (common royal names)
  const royalNames = [
    'elizabeth', 'victoria', 'catherine', 'margaret', 'diana', 'anne',
    'charles', 'william', 'henry', 'edward', 'george', 'james',
    'alexandra', 'charlotte', 'sophia', 'isabella', 'louis', 'philip'
  ];

  if (royalNames.some(kw => nameText === kw)) return true;

  return false;
}

function validateGemstoneTheme(name) {
  const nameText = name.name.toLowerCase();
  const meaningText = (name.meaning || '').toLowerCase();

  const gemstones = [
    'ruby', 'pearl', 'jade', 'amber', 'opal', 'sapphire', 'emerald',
    'diamond', 'crystal', 'jewel', 'gem', 'topaz', 'garnet', 'beryl',
    'onyx', 'jasper', 'amethyst', 'coral', 'agate', 'quartz'
  ];

  // Direct gemstone name
  if (gemstones.some(gem => nameText.includes(gem))) return true;

  // Meaning contains gemstone reference
  if (gemstones.some(gem => meaningText.includes(gem))) return true;

  return false;
}

function validateFlowerTheme(name) {
  const nameText = name.name.toLowerCase();
  const meaningText = (name.meaning || '').toLowerCase();

  const flowers = [
    'rose', 'lily', 'violet', 'daisy', 'iris', 'jasmine', 'flora',
    'ivy', 'holly', 'hazel', 'poppy', 'dahlia', 'azalea', 'camellia',
    'magnolia', 'petunia', 'primrose', 'lavender', 'amaryllis', 'blossom',
    'flower', 'bloom', 'petal', 'garden', 'botanical', 'floral'
  ];

  if (flowers.some(flower => nameText.includes(flower))) return true;
  if (flowers.some(flower => meaningText.includes(flower))) return true;

  return false;
}

function validateColorTheme(name) {
  const nameText = name.name.toLowerCase();
  const meaningText = (name.meaning || '').toLowerCase();

  const colors = [
    'white', 'black', 'red', 'blue', 'green', 'yellow', 'purple',
    'pink', 'orange', 'brown', 'gray', 'grey', 'silver', 'gold',
    'golden', 'auburn', 'scarlet', 'crimson', 'azure', 'violet',
    'indigo', 'amber', 'ruby', 'emerald', 'sapphire', 'ebony', 'ivory'
  ];

  if (colors.some(color => nameText.includes(color))) return true;
  if (colors.some(color => meaningText.includes(color))) return true;

  return false;
}

/**
 * Main validation logic
 */
async function validateList(list) {
  console.log(`\n${'='.repeat(70)}`);
  console.log(`📋 Validating: ${list.title}`);
  console.log(`   Category: ${list.category}`);
  console.log(`   Current count: ${list.filterCriteria.specificNames?.length || 0}`);
  console.log(`${'='.repeat(70)}\n`);

  const specificNames = list.filterCriteria.specificNames || [];
  const removals = [];
  const enriched = [];
  let validCount = 0;

  // Process in batches
  for (let i = 0; i < specificNames.length; i += BATCH_SIZE) {
    const batch = specificNames.slice(i, i + BATCH_SIZE);
    const progress = Math.round((i / specificNames.length) * 100);

    process.stdout.write(`\r⏳ Processing: ${progress}% (${i}/${specificNames.length})`);

    // Look up names in database
    const namesToEnrich = [];
    const nameData = [];

    for (const nameStr of batch) {
      const key = nameStr.toLowerCase();
      const dbName = nameDatabase.get(key);

      if (dbName) {
        // Check if meaning exists
        if (!dbName.meaning || dbName.meaning === 'unknown' || dbName.meaning === 'beautiful name') {
          namesToEnrich.push(nameStr);
        }
        nameData.push(dbName);
      } else {
        // Name not in database - need to enrich
        namesToEnrich.push(nameStr);
        nameData.push({ name: nameStr });
      }
    }

    // Enrich missing meanings
    if (namesToEnrich.length > 0) {
      const enrichedData = await enrichNames(namesToEnrich);
      enriched.push(...enrichedData);

      // Update database with enriched data
      enrichedData.forEach(enrichedName => {
        const key = enrichedName.name.toLowerCase();
        const existing = nameDatabase.get(key);
        if (existing) {
          existing.meaning = enrichedName.meaning;
          existing.origin = enrichedName.origin;
        } else {
          nameDatabase.set(key, enrichedName);
        }
      });

      // Delay between batches
      if (i + BATCH_SIZE < specificNames.length) {
        await delay(DELAY_BETWEEN_BATCHES);
      }
    }

    // Validate each name in batch
    for (const nameStr of batch) {
      const key = nameStr.toLowerCase();
      const name = nameDatabase.get(key);

      if (!name) {
        removals.push({
          name: nameStr,
          reason: 'Not found in database'
        });
        continue;
      }

      let isValid = false;
      let reason = '';

      // Validation based on category
      if (list.category === 'origin') {
        isValid = validateOriginList(name, list.filterCriteria.origins || []);
        if (!isValid) {
          reason = `Origin "${name.origin || 'unknown'}" doesn't match required: ${list.filterCriteria.origins?.join(', ')}`;
        }
      } else if (list.category === 'meaning') {
        isValid = validateMeaningList(name, list.filterCriteria.meaningKeywords || []);
        if (!isValid) {
          reason = `Meaning "${name.meaning || 'unknown'}" doesn't contain keywords: ${list.filterCriteria.meaningKeywords?.join(', ')}`;
        }
      } else if (list.category === 'theme') {
        // Special validation for themed lists
        if (list.id === 'nature-inspired') {
          isValid = validateNatureTheme(name);
          if (!isValid) reason = `Not nature-related (meaning: "${name.meaning || 'unknown'}")`;
        } else if (list.id === 'celestial') {
          isValid = validateCelestialTheme(name);
          if (!isValid) reason = `Not celestial-related (meaning: "${name.meaning || 'unknown'}")`;
        } else if (list.id === 'royal-regal') {
          isValid = validateRoyalTheme(name);
          if (!isValid) reason = `Not royal/regal (meaning: "${name.meaning || 'unknown'}")`;
        } else if (list.id === 'gemstone-names') {
          isValid = validateGemstoneTheme(name);
          if (!isValid) reason = `Not a gemstone name (meaning: "${name.meaning || 'unknown'}")`;
        } else if (list.id === 'flower-botanical') {
          isValid = validateFlowerTheme(name);
          if (!isValid) reason = `Not a flower/botanical name (meaning: "${name.meaning || 'unknown'}")`;
        } else if (list.id === 'color-names') {
          isValid = validateColorTheme(name);
          if (!isValid) reason = `Not a color name (meaning: "${name.meaning || 'unknown'}")`;
        } else {
          // Default: accept all for other theme lists
          isValid = true;
        }
      } else {
        // Style lists - accept all (validation is structural, not semantic)
        isValid = true;
      }

      if (isValid) {
        validCount++;
      } else {
        removals.push({
          name: nameStr,
          reason: reason || 'Does not match list criteria'
        });
      }
    }
  }

  process.stdout.write('\r' + ' '.repeat(70) + '\r');

  return {
    listId: list.id,
    listTitle: list.title,
    category: list.category,
    originalCount: specificNames.length,
    validCount,
    removedCount: removals.length,
    enrichedCount: enriched.length,
    removals,
    enriched
  };
}

/**
 * Main execution
 */
async function main() {
  console.log('🎯 THEMED LISTS VALIDATION\n');
  console.log(`Mode: ${DRY_RUN ? '🔍 DRY RUN (no changes saved)' : '💾 LIVE RUN (will save changes)'}\n`);

  if (!OPENAI_API_KEY) {
    console.warn('⚠️  Warning: No OPENAI_API_KEY found in environment');
    console.warn('   Enrichment will be skipped. Set OPENAI_API_KEY to enable.\n');
  }

  // Load themed lists (we'll parse the file manually to avoid imports)
  const themedListsPath = path.join(__dirname, 'src/data/themedLists.ts');
  const themedListsContent = fs.readFileSync(themedListsPath, 'utf-8');

  // Extract list definitions (simple parsing - assumes standard format)
  const listMatches = themedListsContent.match(/{\s*id:\s*['"](.*?)['"],[\s\S]*?specificNames:\s*\[([\s\S]*?)\]/g);

  if (!listMatches) {
    console.error('❌ Could not parse themed lists file');
    process.exit(1);
  }

  console.log(`Found ${listMatches.length} lists to validate\n`);

  const allResults = [];

  // Validate each list (limit to first few for testing)
  const listsToValidate = DRY_RUN ? listMatches.slice(0, 3) : listMatches;

  for (let i = 0; i < listsToValidate.length; i++) {
    const listMatch = listsToValidate[i];

    // Extract list properties
    const idMatch = listMatch.match(/id:\s*['"](.*?)['"]/);
    const titleMatch = listMatch.match(/title:\s*['"](.*?)['"]/);
    const categoryMatch = listMatch.match(/category:\s*['"](.*?)['"]/);
    const originsMatch = listMatch.match(/origins:\s*\[(.*?)\]/);
    const keywordsMatch = listMatch.match(/meaningKeywords:\s*\[(.*?)\]/);
    const namesMatch = listMatch.match(/specificNames:\s*\[([\s\S]*?)\]/);

    if (!idMatch || !namesMatch) continue;

    const list = {
      id: idMatch[1],
      title: titleMatch?.[1] || idMatch[1],
      category: categoryMatch?.[1] || 'unknown',
      filterCriteria: {
        origins: originsMatch ? originsMatch[1].split(',').map(s => s.replace(/['"]/g, '').trim()) : [],
        meaningKeywords: keywordsMatch ? keywordsMatch[1].split(',').map(s => s.replace(/['"]/g, '').trim()) : [],
        specificNames: namesMatch[1]
          .split(',')
          .map(s => s.replace(/['"]/g, '').trim())
          .filter(Boolean)
      }
    };

    const result = await validateList(list);
    allResults.push(result);

    // Show summary
    console.log(`✅ Complete: ${result.validCount} valid, ${result.removedCount} removed, ${result.enrichedCount} enriched`);

    // Show first few removals
    if (result.removals.length > 0) {
      console.log(`\n   Top removals:`);
      result.removals.slice(0, 5).forEach(removal => {
        console.log(`   ❌ ${removal.name}: ${removal.reason}`);
      });
      if (result.removals.length > 5) {
        console.log(`   ... and ${result.removals.length - 5} more\n`);
      }
    }
  }

  // Generate report
  console.log('\n' + '='.repeat(70));
  console.log('📊 VALIDATION SUMMARY');
  console.log('='.repeat(70) + '\n');

  const totalOriginal = allResults.reduce((sum, r) => sum + r.originalCount, 0);
  const totalValid = allResults.reduce((sum, r) => sum + r.validCount, 0);
  const totalRemoved = allResults.reduce((sum, r) => sum + r.removedCount, 0);
  const totalEnriched = allResults.reduce((sum, r) => sum + r.enrichedCount, 0);

  console.log(`Total names validated: ${totalOriginal.toLocaleString()}`);
  console.log(`Valid names: ${totalValid.toLocaleString()}`);
  console.log(`Names removed: ${totalRemoved.toLocaleString()}`);
  console.log(`Names enriched: ${totalEnriched.toLocaleString()}`);
  console.log(`Accuracy: ${((totalValid / totalOriginal) * 100).toFixed(1)}%\n`);

  // Save detailed report
  const reportPath = path.join(__dirname, 'THEMED_LISTS_VALIDATION_REPORT.md');
  let report = `# Themed Lists Validation Report\n\n`;
  report += `**Date:** ${new Date().toISOString()}\n`;
  report += `**Mode:** ${DRY_RUN ? 'Dry Run' : 'Live Run'}\n`;
  report += `**Total Names:** ${totalOriginal.toLocaleString()}\n`;
  report += `**Valid Names:** ${totalValid.toLocaleString()}\n`;
  report += `**Removed Names:** ${totalRemoved.toLocaleString()}\n`;
  report += `**Enriched Names:** ${totalEnriched.toLocaleString()}\n`;
  report += `**Accuracy:** ${((totalValid / totalOriginal) * 100).toFixed(1)}%\n\n`;

  report += `## List-by-List Results\n\n`;

  allResults.forEach(result => {
    report += `### ${result.listTitle} (${result.listId})\n\n`;
    report += `- **Category:** ${result.category}\n`;
    report += `- **Original Count:** ${result.originalCount}\n`;
    report += `- **Valid Count:** ${result.validCount}\n`;
    report += `- **Removed Count:** ${result.removedCount}\n`;
    report += `- **Enriched Count:** ${result.enrichedCount}\n`;
    report += `- **Accuracy:** ${((result.validCount / result.originalCount) * 100).toFixed(1)}%\n\n`;

    if (result.removals.length > 0) {
      report += `#### Removed Names\n\n`;
      report += `| Name | Reason |\n`;
      report += `|------|--------|\n`;
      result.removals.forEach(removal => {
        report += `| ${removal.name} | ${removal.reason} |\n`;
      });
      report += `\n`;
    }

    if (result.enriched.length > 0) {
      report += `#### Enriched Names (sample)\n\n`;
      report += `| Name | Meaning | Origin |\n`;
      report += `|------|---------|--------|\n`;
      result.enriched.slice(0, 10).forEach(enriched => {
        report += `| ${enriched.name} | ${enriched.meaning} | ${enriched.origin} |\n`;
      });
      if (result.enriched.length > 10) {
        report += `\n_... and ${result.enriched.length - 10} more_\n`;
      }
      report += `\n`;
    }
  });

  fs.writeFileSync(reportPath, report);
  console.log(`📄 Detailed report saved: ${reportPath}\n`);

  if (!DRY_RUN) {
    console.log('💾 Saving updated themed lists...\n');
    console.log('⚠️  Feature not yet implemented - would update src/data/themedLists.ts\n');
  } else {
    console.log('🔍 Dry run complete - no files modified\n');
  }

  console.log('✅ Validation complete!\n');
}

// Run main
main().catch(error => {
  console.error('\n❌ Fatal error:', error);
  process.exit(1);
});
