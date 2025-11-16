/**
 * Fix Curated Lists Gender Information
 * Uses OpenAI GPT-4 to enrich missing and incorrect gender data
 */

const fs = require('fs');
const path = require('path');
const OpenAI = require('openai');

// Load environment variables
require('dotenv').config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Load audit report
const auditReport = require('./curatedListsGenderAuditV3.json');

console.log('\n🔧 CURATED LISTS GENDER FIX SCRIPT');
console.log(`${'='.repeat(80)}\n`);

// Names to process
const namesToAdd = auditReport.details.notFound; // 524 names
const namesToFix = auditReport.details.missingGender; // 352 names

console.log(`📋 Summary:`);
console.log(`  Names to ADD (not in database): ${namesToAdd.length}`);
console.log(`  Names to FIX (unknown/unisex gender): ${namesToFix.length}`);
console.log(`  Total names to process: ${namesToAdd.length + namesToFix.length}\n`);

// Batch size for OpenAI API
const BATCH_SIZE = 20;
const DELAY_MS = 2000; // 2 seconds between batches

/**
 * Enrich names batch using OpenAI GPT-4
 */
async function enrichNamesBatch(names) {
  const prompt = `You are a name database expert. For each name below, provide the gender (Male, Female, or Unisex), origin, and a brief meaning.

Return ONLY a valid JSON array with this exact structure:
[
  {"name": "Connor", "gender": "Male", "origin": "Irish", "meaning": "Lover of hounds"},
  {"name": "Kaitlyn", "gender": "Female", "origin": "Irish", "meaning": "Pure"}
]

Names to process:
${names.map(n => `- ${n}`).join('\n')}

Return ONLY the JSON array, no other text.`;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are a name database expert. You always return valid JSON arrays with accurate name information.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.3,
      max_tokens: 2000
    });

    const content = response.choices[0].message.content.trim();

    // Extract JSON from response (in case there's extra text)
    const jsonMatch = content.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      throw new Error('No JSON array found in response');
    }

    const enrichedNames = JSON.parse(jsonMatch[0]);
    return enrichedNames;
  } catch (error) {
    console.error(`❌ Error enriching batch:`, error.message);
    return [];
  }
}

/**
 * Process all names in batches
 */
async function processAllNames() {
  const allNamestoProcess = [
    ...namesToAdd.map(name => ({ name, action: 'add' })),
    ...namesToFix.map(item => ({ name: item.name, action: 'fix', source: item.source }))
  ];

  const enrichedResults = [];
  const failedNames = [];

  console.log(`🚀 Starting batch enrichment (${BATCH_SIZE} names per batch)...\n`);

  for (let i = 0; i < allNamestoProcess.length; i += BATCH_SIZE) {
    const batch = allNamestoProcess.slice(i, i + BATCH_SIZE);
    const batchNames = batch.map(item => item.name);

    console.log(`📦 Processing batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(allNamestoProcess.length / BATCH_SIZE)} (${batchNames.length} names)...`);

    const enriched = await enrichNamesBatch(batchNames);

    if (enriched.length > 0) {
      // Match enriched data back to original items
      enriched.forEach((enrichedName, index) => {
        const originalItem = batch[index];
        enrichedResults.push({
          ...enrichedName,
          action: originalItem.action,
          source: originalItem.source || 'new'
        });
      });
      console.log(`  ✅ Enriched ${enriched.length} names`);
    } else {
      console.log(`  ❌ Failed to enrich batch`);
      batch.forEach(item => failedNames.push(item.name));
    }

    // Delay between batches
    if (i + BATCH_SIZE < allNamestoProcess.length) {
      await new Promise(resolve => setTimeout(resolve, DELAY_MS));
    }
  }

  return { enrichedResults, failedNames };
}

/**
 * Apply fixes to database chunks
 */
function applyFixes(enrichedResults) {
  console.log(`\n🔨 Applying fixes to database...\n`);

  // Load chunk5 for updates
  const chunk5Path = path.join(__dirname, '../public/data/names-chunk5.json');
  const chunk5 = require(chunk5Path);

  // Separate by action
  const toAdd = enrichedResults.filter(item => item.action === 'add');
  const toFix = enrichedResults.filter(item => item.action === 'fix');

  console.log(`  📝 Adding ${toAdd.length} new names to chunk5`);
  console.log(`  🔧 Fixing ${toFix.length} existing names\n`);

  // Apply fixes to existing names in chunk5
  let fixedCount = 0;
  chunk5.forEach(name => {
    const fix = toFix.find(f => f.name.toLowerCase() === name.name.toLowerCase());
    if (fix && (!name.gender || name.gender === 'Unknown' || name.gender === 'Unisex')) {
      name.gender = fix.gender;
      if (!name.origin || name.origin === 'Unknown' || name.origin === 'Various') {
        name.origin = fix.origin;
      }
      if (!name.meaning) {
        name.meaning = fix.meaning;
      }
      fixedCount++;
    }
  });

  console.log(`  ✅ Fixed ${fixedCount} names in chunk5`);

  // Add new names to chunk5
  const newNames = toAdd.map(item => ({
    name: item.name,
    gender: item.gender,
    origin: item.origin,
    meaning: item.meaning,
    popularity: 0,
    rank: 999999
  }));

  chunk5.push(...newNames);
  console.log(`  ✅ Added ${newNames.length} new names to chunk5`);

  // Save updated chunk5
  fs.writeFileSync(chunk5Path, JSON.stringify(chunk5, null, 2));
  console.log(`\n💾 Saved updated chunk5 to: ${chunk5Path}`);

  // Also create a separate curated-enrichment file for reference
  const enrichmentPath = path.join(__dirname, '../public/data/curated-lists-enrichment.json');
  fs.writeFileSync(enrichmentPath, JSON.stringify({
    timestamp: new Date().toISOString(),
    totalEnriched: enrichedResults.length,
    added: newNames,
    fixed: toFix
  }, null, 2));
  console.log(`📄 Created enrichment reference file: ${enrichmentPath}`);
}

/**
 * Main execution
 */
async function main() {
  console.log(`⏱️  Estimated time: ${Math.ceil((namesToAdd.length + namesToFix.length) / BATCH_SIZE) * (DELAY_MS / 1000)} seconds\n`);

  const { enrichedResults, failedNames } = await processAllNames();

  console.log(`\n📊 Enrichment Results:`);
  console.log(`  ✅ Successfully enriched: ${enrichedResults.length} names`);
  console.log(`  ❌ Failed: ${failedNames.length} names`);

  if (failedNames.length > 0) {
    console.log(`\n⚠️  Failed names:`);
    failedNames.forEach(name => console.log(`  - ${name}`));
  }

  if (enrichedResults.length > 0) {
    applyFixes(enrichedResults);
  }

  console.log(`\n✨ Done! Re-run the audit script to verify fixes.\n`);
  console.log(`${'='.repeat(80)}\n`);
}

main().catch(error => {
  console.error('\n❌ Fatal error:', error);
  process.exit(1);
});
