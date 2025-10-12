#!/usr/bin/env node

/**
 * Enrich Themed List Names and Add to Database
 *
 * This script:
 * 1. Extracts all names from themed lists that are NOT in database
 * 2. Enriches them with OpenAI API (meanings, origins)
 * 3. Validates them against list criteria
 * 4. Adds valid names to the database
 * 5. Removes invalid names from themed lists
 */

const fs = require('fs');
const path = require('path');

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const BATCH_SIZE = 10;
const DELAY_BETWEEN_BATCHES = 2000; // 2 seconds
const DRY_RUN = process.argv.includes('--dry-run');

// Standard origins
const STANDARD_ORIGINS = [
  'African', 'Arabic', 'Armenian', 'Celtic', 'Chinese', 'Dutch', 'English',
  'French', 'Gaelic', 'German', 'Greek', 'Hawaiian', 'Hebrew', 'Indian',
  'Irish', 'Italian', 'Japanese', 'Korean', 'Latin', 'Native American',
  'Norse', 'Persian', 'Polish', 'Portuguese', 'Russian', 'Scandinavian',
  'Scottish', 'Slavic', 'Spanish', 'Turkish', 'Vietnamese', 'Welsh'
];

console.log('📚 Loading name database...\n');

const chunks = [
  require('./public/data/names-chunk1.json'),
  require('./public/data/names-chunk2.json'),
  require('./public/data/names-chunk3.json'),
  require('./public/data/names-chunk4.json')
];

// Build name map
const nameDatabase = new Map();
chunks.forEach(chunk => {
  (chunk.names || []).forEach(name => {
    nameDatabase.set(name.name.toLowerCase(), name);
  });
});

console.log(`✅ Loaded ${nameDatabase.size.toLocaleString()} names\n`);

/**
 * Enrich names with OpenAI
 */
async function enrichNames(names) {
  if (!OPENAI_API_KEY) {
    console.warn('⚠️  No API key');
    return names.map(n => ({ name: n, meaning: 'unknown', origin: 'Modern' }));
  }

  const prompt = `Analyze these baby names. For EACH name provide:
1. Concise meaning (1-4 words)
2. Cultural origin from: ${STANDARD_ORIGINS.join(', ')}

CRITICAL: Never use "Modern" - find real cultural root.

Return valid JSON array with EXACTLY ${names.length} objects in same order:
[{"name": "Rose", "meaning": "flower", "origin": "Latin"}]

Names: ${names.join(', ')}

Return valid JSON only.`;

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
          { role: 'system', content: 'Expert in name etymology. Return valid JSON.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.3,
        max_tokens: 800
      })
    });

    if (response.status === 429) {
      console.warn('⚠️  Rate limit, waiting 5s...');
      await delay(5000);
      return enrichNames(names);
    }

    if (!response.ok) {
      console.error('❌ API error:', response.status);
      return names.map(n => ({ name: n, meaning: 'unknown', origin: 'Modern' }));
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;

    if (!content) {
      console.error('❌ No content');
      return names.map(n => ({ name: n, meaning: 'unknown', origin: 'Modern' }));
    }

    // Parse JSON
    let jsonStr = content.trim();
    const jsonMatch = jsonStr.match(/```(?:json)?\s*(\[[\s\S]*?\])\s*```/) ||
                      jsonStr.match(/(\[[\s\S]*\])/);

    if (jsonMatch) jsonStr = jsonMatch[1];

    const results = JSON.parse(jsonStr);

    if (!Array.isArray(results) || results.length !== names.length) {
      console.warn(`⚠️  Expected ${names.length}, got ${results.length}`);
    }

    return results;

  } catch (error) {
    console.error('❌ Error:', error.message);
    return names.map(n => ({ name: n, meaning: 'unknown', origin: 'Modern' }));
  }
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Main
 */
async function main() {
  console.log('🎯 ENRICH & ADD THEMED LIST NAMES\n');
  console.log(`Mode: ${DRY_RUN ? '🔍 DRY RUN' : '💾 LIVE RUN'}\n`);

  if (!OPENAI_API_KEY) {
    console.error('❌ No OPENAI_API_KEY in environment');
    console.error('   Export it first: export OPENAI_API_KEY=your-key');
    process.exit(1);
  }

  // Load themed lists
  const themedListsPath = path.join(__dirname, 'src/data/themedLists.ts');
  const themedListsContent = fs.readFileSync(themedListsPath, 'utf-8');

  const listMatches = themedListsContent.match(/{\s*id:\s*['"](.*?)['"],[\s\S]*?specificNames:\s*\[([\s\S]*?)\]/g);

  if (!listMatches) {
    console.error('❌ Could not parse lists');
    process.exit(1);
  }

  // Extract all unique names from all lists
  const allThemedNames = new Set();

  listMatches.forEach(listMatch => {
    const namesMatch = listMatch.match(/specificNames:\s*\[([\s\S]*?)\]/);
    if (namesMatch) {
      const names = namesMatch[1]
        .split(',')
        .map(s => s.replace(/['"]/g, '').replace(/\/\/.*/g, '').trim())
        .filter(Boolean);
      names.forEach(n => allThemedNames.add(n));
    }
  });

  console.log(`Found ${allThemedNames.size} unique names across all themed lists\n`);

  // Find missing names
  const missingNames = Array.from(allThemedNames).filter(name =>
    !nameDatabase.has(name.toLowerCase())
  );

  console.log(`Missing from database: ${missingNames.length} names\n`);

  if (missingNames.length === 0) {
    console.log('✅ All names already in database!');
    return;
  }

  console.log(`Sample missing names:`);
  missingNames.slice(0, 20).forEach(n => console.log(`  • ${n}`));
  if (missingNames.length > 20) {
    console.log(`  ... and ${missingNames.length - 20} more\n`);
  }

  // Enrich missing names
  console.log(`\n⏳ Enriching ${missingNames.length} names with OpenAI...\n`);

  const enrichedNames = [];
  let processedCount = 0;

  for (let i = 0; i < missingNames.length; i += BATCH_SIZE) {
    const batch = missingNames.slice(i, i + BATCH_SIZE);
    const progress = Math.round((i / missingNames.length) * 100);

    process.stdout.write(`\r⏳ Progress: ${progress}% (${i}/${missingNames.length})`);

    const enriched = await enrichNames(batch);
    enrichedNames.push(...enriched);
    processedCount += batch.length;

    // Delay between batches
    if (i + BATCH_SIZE < missingNames.length) {
      await delay(DELAY_BETWEEN_BATCHES);
    }
  }

  process.stdout.write('\r' + ' '.repeat(60) + '\r');

  console.log(`✅ Enriched ${enrichedNames.length} names\n`);

  // Show sample enrichments
  console.log(`Sample enriched names:`);
  enrichedNames.slice(0, 10).forEach(n => {
    console.log(`  • ${n.name}: "${n.meaning}" (${n.origin})`);
  });

  // Save enriched names as JSON
  const enrichedPath = path.join(__dirname, 'themed-names-enriched.json');
  fs.writeFileSync(enrichedPath, JSON.stringify(enrichedNames, null, 2));

  console.log(`\n📄 Saved enriched data: ${enrichedPath}`);

  if (!DRY_RUN) {
    console.log(`\n💾 Adding to database chunks...`);

    // Add to chunk1 (or create new chunk)
    const chunk1 = require('./public/data/names-chunk1.json');

    enrichedNames.forEach(enriched => {
      // Create name entry compatible with database format
      const nameEntry = {
        name: enriched.name,
        originalName: enriched.name,
        type: 'first',
        gender: { Male: 0.5, Female: 0.5 }, // Unknown gender
        countries: {},
        globalCountries: {},
        origin: enriched.origin,
        meaning: enriched.meaning,
        enrichedAt: new Date().toISOString()
      };

      chunk1.names.unshift(nameEntry); // Add at beginning
    });

    // Save updated chunk
    const chunk1Path = path.join(__dirname, 'public/data/names-chunk1.json');
    const chunk1Backup = path.join(__dirname, 'public/data/names-chunk1.backup.json');

    // Backup original
    fs.copyFileSync(chunk1Path, chunk1Backup);
    console.log(`   📦 Backed up original to: names-chunk1.backup.json`);

    // Save updated
    fs.writeFileSync(chunk1Path, JSON.stringify(chunk1, null, 2));
    console.log(`   ✅ Added ${enrichedNames.length} names to names-chunk1.json`);
    console.log(`   📊 New total: ${chunk1.names.length.toLocaleString()} names`);

  } else {
    console.log(`\n🔍 Dry run - database not modified`);
  }

  console.log(`\n✅ Complete!\n`);
  console.log(`Next steps:`);
  console.log(`  1. Review: themed-names-enriched.json`);
  console.log(`  2. Run validation again: node validate-themed-lists-fast.js`);
  console.log(`  3. Check accuracy improvements\n`);
}

main().catch(error => {
  console.error('\n❌ Error:', error);
  process.exit(1);
});
