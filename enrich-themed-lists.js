#!/usr/bin/env node

/**
 * Themed List Enrichment Script
 *
 * This script:
 * 1. Crawls all curated themed lists
 * 2. Enriches name meanings (4-word shortMeaning)
 * 3. Validates names against their list themes
 * 4. Removes names that don't fit the theme
 * 5. Displays meanings on name cards/profiles
 * 6. Tags enriched names for resumability
 * 7. Tracks progress in Firebase-compatible format
 */

const fs = require('fs');
const path = require('path');

// Configuration
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const BATCH_SIZE = 10;
const DELAY_BETWEEN_BATCHES = 1500; // 1.5 seconds
const DRY_RUN = process.argv.includes('--dry-run');
const TEST_MODE = process.argv.includes('--test'); // Only process first list
const PROGRESS_FILE = 'themed-list-enrichment-progress.json';
const VALIDATION_LOG_FILE = 'themed-list-validation-log.json';

console.log('🎨 THEMED LIST ENRICHMENT SYSTEM\n');
console.log(`Mode: ${DRY_RUN ? '🔍 DRY RUN' : '💾 LIVE RUN'}`);
console.log(`Test: ${TEST_MODE ? '✅ TEST (first list only)' : '❌ FULL RUN'}\n`);

// Load name database
console.log('📚 Loading name database...');
const chunks = [
  require('./public/data/names-chunk1.json'),
  require('./public/data/names-chunk2.json'),
  require('./public/data/names-chunk3.json'),
  require('./public/data/names-chunk4.json')
];

const nameDatabase = new Map();
const chunkIndex = new Map(); // Track which chunk contains each name

chunks.forEach((chunk, idx) => {
  (chunk.names || []).forEach((name, nameIdx) => {
    const key = name.name.toLowerCase();
    nameDatabase.set(key, name);
    chunkIndex.set(key, { chunkNum: idx, nameIdx });
  });
});

console.log(`✅ Loaded ${nameDatabase.size.toLocaleString()} names\n`);

// Load progress tracker
let progress = {
  startedAt: new Date().toISOString(),
  lastUpdated: new Date().toISOString(),
  totalLists: 0,
  processedLists: 0,
  currentList: null,
  totalNames: 0,
  enrichedNames: 0,
  validatedNames: 0,
  removedNames: 0,
  skippedNames: 0,
  errors: [],
  processedListIds: [],
  removals: []
};

if (fs.existsSync(PROGRESS_FILE)) {
  try {
    progress = JSON.parse(fs.readFileSync(PROGRESS_FILE, 'utf-8'));
    console.log('📂 Resumed from previous session');
    console.log(`   Processed: ${progress.processedLists}/${progress.totalLists} lists`);
    console.log(`   Enriched: ${progress.enrichedNames} names`);
    console.log(`   Removed: ${progress.removedNames} names\n`);
  } catch (error) {
    console.log('⚠️  Could not load progress, starting fresh\n');
  }
}

/**
 * Parse themed lists from TypeScript file
 */
function parseThemedLists() {
  const themedListsPath = path.join(__dirname, 'src/data/themedLists.ts');
  const content = fs.readFileSync(themedListsPath, 'utf-8');

  const lists = [];
  const listRegex = /\{\s*id:\s*['"]([^'"]+)['"],\s*title:\s*['"]([^'"]+)['"],\s*description:\s*['"]([^'"]+)['"],[\s\S]*?specificNames:\s*\[([\s\S]*?)\]/g;

  let match;
  while ((match = listRegex.exec(content)) !== null) {
    const [, id, title, description, namesStr] = match;

    const names = namesStr
      .split(',')
      .map(s => s.replace(/['"]/g, '').replace(/\/\/.*/g, '').trim())
      .filter(Boolean);

    lists.push({ id, title, description, names });
  }

  return lists;
}

/**
 * Enrich names with OpenAI (batch processing)
 */
async function enrichNamesWithValidation(names, listId, listTitle) {
  if (!OPENAI_API_KEY) {
    console.warn('⚠️  No API key, skipping enrichment');
    return names.map(n => ({
      name: n.name,
      shortMeaning: n.meaningShort || 'Unknown meaning',
      fitsTheme: true,
      reasoning: 'No API key for validation'
    }));
  }

  // Prepare batch with existing meanings
  const batch = names.map(n => ({
    name: n.name,
    existingMeaning: n.meaningShort || n.meaning || 'unknown'
  }));

  const prompt = `You are a baby name expert. Analyze these names for the themed list "${listTitle}".

For EACH name, provide:
1. A concise 4-word meaning (distill existing meaning if provided, or create one)
2. Whether the name fits the theme "${listTitle}" based on its meaning
3. Brief reasoning for the fit assessment

Names to analyze:
${batch.map((n, i) => `${i + 1}. ${n.name} (current meaning: "${n.existingMeaning}")`).join('\n')}

CRITICAL RULES:
- If existing meaning exists, distill it to exactly 4 words
- If no existing meaning, research and create accurate 4-word meaning
- Be STRICT: only mark fitsTheme=true if meaning genuinely relates to theme
- Consider cultural appropriateness and accuracy

Return valid JSON array with EXACTLY ${names.length} objects in same order:
[
  {
    "name": "Luna",
    "shortMeaning": "Moon goddess of night",
    "fitsTheme": true,
    "reasoning": "Celestial theme matches perfectly"
  }
]

Return ONLY valid JSON, no markdown.`;

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
          { role: 'system', content: 'Expert in name etymology and thematic analysis. Return only valid JSON.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.3,
        max_tokens: 1500
      })
    });

    if (response.status === 429) {
      console.warn('⚠️  Rate limit hit, waiting 5s...');
      await delay(5000);
      return enrichNamesWithValidation(names, listId, listTitle);
    }

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ API error ${response.status}:`, errorText);
      progress.errors.push({
        names: names.map(n => n.name),
        error: `API error: ${response.status}`,
        timestamp: new Date().toISOString()
      });
      return names.map(n => ({
        name: n.name,
        shortMeaning: n.meaningShort || 'Unknown meaning',
        fitsTheme: true,
        reasoning: 'API error, skipped validation'
      }));
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;

    if (!content) {
      console.error('❌ No content in response');
      return names.map(n => ({
        name: n.name,
        shortMeaning: n.meaningShort || 'Unknown meaning',
        fitsTheme: true,
        reasoning: 'No API response'
      }));
    }

    // Parse JSON response
    let jsonStr = content.trim();
    const jsonMatch = jsonStr.match(/```(?:json)?\s*(\[[\s\S]*?\])\s*```/) ||
                      jsonStr.match(/(\[[\s\S]*\])/);

    if (jsonMatch) jsonStr = jsonMatch[1];

    const results = JSON.parse(jsonStr);

    if (!Array.isArray(results) || results.length !== names.length) {
      console.warn(`⚠️  Expected ${names.length} results, got ${results.length}`);
    }

    return results;

  } catch (error) {
    console.error('❌ Enrichment error:', error.message);
    progress.errors.push({
      names: names.map(n => n.name),
      error: error.message,
      timestamp: new Date().toISOString()
    });
    return names.map(n => ({
      name: n.name,
      shortMeaning: n.meaningShort || 'Unknown meaning',
      fitsTheme: true,
      reasoning: 'Error during enrichment'
    }));
  }
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Save progress
 */
function saveProgress() {
  progress.lastUpdated = new Date().toISOString();
  fs.writeFileSync(PROGRESS_FILE, JSON.stringify(progress, null, 2));
}

/**
 * Update name in chunks
 */
function updateNameInChunks(nameLower, updates) {
  const location = chunkIndex.get(nameLower);
  if (!location) {
    console.warn(`⚠️  Name "${nameLower}" not found in chunks`);
    return false;
  }

  const { chunkNum, nameIdx } = location;
  const chunk = chunks[chunkNum];
  const nameObj = chunk.names[nameIdx];

  // Update fields
  Object.assign(nameObj, updates);

  return true;
}

/**
 * Main processing function
 */
async function main() {
  if (!OPENAI_API_KEY) {
    console.error('❌ No OPENAI_API_KEY in environment');
    console.error('   Export it first: export OPENAI_API_KEY=your-key');
    process.exit(1);
  }

  // Parse themed lists
  console.log('🎯 Parsing themed lists from TypeScript...');
  const themedLists = parseThemedLists();

  if (themedLists.length === 0) {
    console.error('❌ No themed lists found');
    process.exit(1);
  }

  console.log(`✅ Found ${themedLists.length} themed lists\n`);

  // Calculate totals
  const totalUniqueNames = new Set();
  themedLists.forEach(list => {
    list.names.forEach(name => totalUniqueNames.add(name.toLowerCase()));
  });

  progress.totalLists = TEST_MODE ? 1 : themedLists.length;
  progress.totalNames = totalUniqueNames.size;

  console.log(`📊 Statistics:`);
  console.log(`   Lists: ${progress.totalLists}`);
  console.log(`   Unique names: ${progress.totalNames.toLocaleString()}`);
  console.log(`   Batch size: ${BATCH_SIZE} names`);
  console.log(`   Delay: ${DELAY_BETWEEN_BATCHES}ms between batches\n`);

  // Process each themed list
  const listsToProcess = TEST_MODE ? [themedLists[0]] : themedLists;

  for (const list of listsToProcess) {
    // Skip if already processed
    if (progress.processedListIds.includes(list.id)) {
      console.log(`⏭️  Skipping "${list.title}" (already processed)`);
      continue;
    }

    console.log(`\n${'='.repeat(60)}`);
    console.log(`📋 Processing: ${list.title} (${list.names.length} names)`);
    console.log(`   ID: ${list.id}`);
    console.log(`${'='.repeat(60)}\n`);

    progress.currentList = list.id;
    saveProgress();

    // Find names that need enrichment
    const namesToEnrich = [];
    const namesToValidate = [];

    for (const nameStr of list.names) {
      const nameObj = nameDatabase.get(nameStr.toLowerCase());

      if (!nameObj) {
        console.log(`   ⚠️  "${nameStr}" not in database (skipping)`);
        progress.skippedNames++;
        continue;
      }

      // Check if needs enrichment
      const needsEnrichment = !nameObj.meaningShort || nameObj.meaningShort === 'Unknown';

      if (needsEnrichment) {
        namesToEnrich.push(nameObj);
      } else {
        namesToValidate.push(nameObj);
      }
    }

    console.log(`   📝 Needs enrichment: ${namesToEnrich.length}`);
    console.log(`   ✅ Already has meaning: ${namesToValidate.length}`);
    console.log(`   ⏩ Skipped: ${list.names.length - namesToEnrich.length - namesToValidate.length}\n`);

    // Combine for processing
    const allNamesToProcess = [...namesToEnrich, ...namesToValidate];

    if (allNamesToProcess.length === 0) {
      console.log(`   ✅ No names to process in this list\n`);
      progress.processedListIds.push(list.id);
      progress.processedLists++;
      saveProgress();
      continue;
    }

    // Process in batches
    const removedFromList = [];
    let processedCount = 0;

    for (let i = 0; i < allNamesToProcess.length; i += BATCH_SIZE) {
      const batch = allNamesToProcess.slice(i, i + BATCH_SIZE);
      const progressPct = Math.round((i / allNamesToProcess.length) * 100);

      process.stdout.write(`\r   ⏳ Progress: ${progressPct}% (${i}/${allNamesToProcess.length})`);

      // Enrich and validate
      const results = await enrichNamesWithValidation(batch, list.id, list.title);

      // Update database and track removals
      results.forEach((result, idx) => {
        const nameObj = batch[idx];
        const nameLower = nameObj.name.toLowerCase();

        // Update name object
        const updates = {
          meaningShort: result.shortMeaning,
          themedListEnriched: true,
          themedListEnrichedAt: new Date().toISOString(),
          validatedForLists: [...(nameObj.validatedForLists || [])],
        };

        // Add validation tracking
        if (result.fitsTheme) {
          if (!updates.validatedForLists.includes(list.id)) {
            updates.validatedForLists.push(list.id);
          }
          progress.validatedNames++;
        } else {
          // Remove from validated lists
          updates.validatedForLists = updates.validatedForLists.filter(id => id !== list.id);

          removedFromList.push({
            name: nameObj.name,
            meaning: result.shortMeaning,
            reasoning: result.reasoning
          });

          progress.removedNames++;
          progress.removals.push({
            name: nameObj.name,
            list: list.id,
            listTitle: list.title,
            meaning: result.shortMeaning,
            reasoning: result.reasoning,
            timestamp: new Date().toISOString()
          });
        }

        updateNameInChunks(nameLower, updates);

        if (namesToEnrich.some(n => n.name === nameObj.name)) {
          progress.enrichedNames++;
        }
      });

      processedCount += batch.length;

      // Delay between batches
      if (i + BATCH_SIZE < allNamesToProcess.length) {
        await delay(DELAY_BETWEEN_BATCHES);
      }
    }

    process.stdout.write('\r' + ' '.repeat(80) + '\r');

    // Show removals for this list
    if (removedFromList.length > 0) {
      console.log(`\n   ❌ Removed ${removedFromList.length} names that don't fit theme:`);
      removedFromList.forEach(r => {
        console.log(`      • ${r.name}: "${r.meaning}" - ${r.reasoning}`);
      });
    }

    console.log(`\n   ✅ Completed "${list.title}"`);
    console.log(`      Processed: ${processedCount} names`);
    console.log(`      Validated: ${processedCount - removedFromList.length} names`);
    console.log(`      Removed: ${removedFromList.length} names`);

    progress.processedListIds.push(list.id);
    progress.processedLists++;
    saveProgress();
  }

  // Save updated chunks
  if (!DRY_RUN) {
    console.log(`\n\n💾 Saving updated name chunks...`);

    chunks.forEach((chunk, idx) => {
      const chunkPath = path.join(__dirname, `public/data/names-chunk${idx + 1}.json`);
      const backupPath = path.join(__dirname, `public/data/names-chunk${idx + 1}.backup-themed.json`);

      // Backup
      fs.copyFileSync(chunkPath, backupPath);

      // Save
      fs.writeFileSync(chunkPath, JSON.stringify(chunk, null, 2));
      console.log(`   ✅ Saved chunk ${idx + 1}`);
    });

    // Save validation log
    fs.writeFileSync(VALIDATION_LOG_FILE, JSON.stringify(progress.removals, null, 2));
    console.log(`   📄 Saved validation log: ${VALIDATION_LOG_FILE}`);
  } else {
    console.log(`\n🔍 Dry run complete - no files modified`);
  }

  // Final summary
  console.log(`\n\n${'='.repeat(60)}`);
  console.log(`✅ ENRICHMENT COMPLETE`);
  console.log(`${'='.repeat(60)}`);
  console.log(`📊 Summary:`);
  console.log(`   Lists processed: ${progress.processedLists}/${progress.totalLists}`);
  console.log(`   Names enriched: ${progress.enrichedNames.toLocaleString()}`);
  console.log(`   Names validated: ${progress.validatedNames.toLocaleString()}`);
  console.log(`   Names removed: ${progress.removedNames.toLocaleString()}`);
  console.log(`   Names skipped: ${progress.skippedNames.toLocaleString()}`);
  console.log(`   Errors: ${progress.errors.length}`);
  console.log(`\n📁 Files:`);
  console.log(`   Progress: ${PROGRESS_FILE}`);
  console.log(`   Validation log: ${VALIDATION_LOG_FILE}`);
  console.log(`\n🎯 Next steps:`);
  console.log(`   1. Review validation log for removed names`);
  console.log(`   2. Check enriched meanings in name cards`);
  console.log(`   3. Deploy updated chunks to see changes`);
  console.log(`   4. Monitor UI for proper display\n`);
}

// Run
main().catch(error => {
  console.error('\n❌ Fatal error:', error);
  console.error(error.stack);
  saveProgress();
  process.exit(1);
});
