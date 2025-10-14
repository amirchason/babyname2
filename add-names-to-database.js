require('dotenv').config({ debug: true });
const fs = require('fs').promises;
const path = require('path');
const OpenAI = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Add new names to the database with GPT-4o enrichment
 *
 * Usage: node add-names-to-database.js "Name1, Name2, Name3..." --chunk=1
 */

async function enrichNamesWithGPT4o(names) {
  console.log(`\n🔍 Enriching ${names.length} names with GPT-4o...`);

  const prompt = `You are a baby name expert. For each name in the list below, provide enrichment data in valid JSON format.

NAMES TO ENRICH:
${names.map(n => `- ${n}`).join('\n')}

For EACH name, provide:
1. **name**: The name exactly as provided
2. **gender**: "male", "female", or "unisex"
3. **origin**: Primary cultural/linguistic origin (e.g., "Greek", "Latin", "Hebrew", "English", "Sanskrit")
4. **meaning**: SHORT meaning in 4 words or less (e.g., "light bringer", "noble bright", "goddess of moon")
5. **popularity**: Estimate as "common" (top 100), "moderate" (top 1000), or "rare" (below 1000)
6. **count**: Estimated popularity number (5000 for common, 1000 for moderate, 100 for rare)

Return ONLY a valid JSON array with this exact structure:
[
  {
    "name": "NameHere",
    "gender": "female",
    "origin": "Latin",
    "meaning": "light bringer",
    "popularity": "moderate",
    "count": 1000,
    "enriched": true,
    "processingStatus": "completed",
    "source": "manual-addition"
  }
]

IMPORTANT:
- Keep meanings to 4 words maximum
- Use lowercase for gender/popularity
- NO extra text, ONLY the JSON array`;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: 'You are a baby name etymology expert. Return ONLY valid JSON, no markdown formatting, no explanatory text.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.3,
      max_tokens: 4000,
    });

    let jsonContent = response.choices[0].message.content.trim();

    // Clean up markdown code blocks if present
    if (jsonContent.startsWith('```json')) {
      jsonContent = jsonContent.replace(/```json\n?/g, '').replace(/```\n?$/g, '');
    } else if (jsonContent.startsWith('```')) {
      jsonContent = jsonContent.replace(/```\n?/g, '');
    }

    const enrichedNames = JSON.parse(jsonContent);

    console.log(`✅ Successfully enriched ${enrichedNames.length} names`);
    return enrichedNames;

  } catch (error) {
    console.error(`❌ Error enriching names:`, error.message);
    throw error;
  }
}

/**
 * Load a database chunk
 */
async function loadChunk(chunkNumber) {
  const chunkPath = path.join(__dirname, 'public', 'data', `names-chunk${chunkNumber}.json`);
  const data = JSON.parse(await fs.readFile(chunkPath, 'utf-8'));
  return data;
}

/**
 * Save a database chunk
 */
async function saveChunk(chunkNumber, data) {
  const chunkPath = path.join(__dirname, 'public', 'data', `names-chunk${chunkNumber}.json`);
  const backupPath = path.join(__dirname, 'public', 'data', `names-chunk${chunkNumber}_backup_${Date.now()}.json`);

  // Create backup
  try {
    const existing = await fs.readFile(chunkPath, 'utf-8');
    await fs.writeFile(backupPath, existing);
    console.log(`📦 Backup created: ${path.basename(backupPath)}`);
  } catch (err) {
    // Chunk doesn't exist yet, no backup needed
  }

  // Save new data
  await fs.writeFile(chunkPath, JSON.stringify(data, null, 2));
  console.log(`💾 Saved to: names-chunk${chunkNumber}.json`);
}

/**
 * Add enriched names to a database chunk
 */
async function addNamesToChunk(enrichedNames, chunkNumber = 1) {
  console.log(`\n📂 Loading chunk ${chunkNumber}...`);

  let chunk = [];
  try {
    chunk = await loadChunk(chunkNumber);
    console.log(`   Current size: ${chunk.length} names`);
  } catch (err) {
    console.log(`   Creating new chunk ${chunkNumber}`);
  }

  // Check for duplicates
  const existingNames = new Set(chunk.map(n => n.name?.toLowerCase()));
  const namesToAdd = enrichedNames.filter(n => {
    const nameLower = n.name?.toLowerCase();
    if (!nameLower || existingNames.has(nameLower)) {
      console.log(`   ⏭️  Skipping duplicate: ${n.name}`);
      return false;
    }
    return true;
  });

  if (namesToAdd.length === 0) {
    console.log(`\n⚠️  No new names to add (all are duplicates)`);
    return { added: 0, skipped: enrichedNames.length };
  }

  // Add new names
  chunk.push(...namesToAdd);

  // Save updated chunk
  await saveChunk(chunkNumber, chunk);

  console.log(`\n✅ Added ${namesToAdd.length} new names to chunk ${chunkNumber}`);
  console.log(`   New total: ${chunk.length} names`);
  console.log(`   Skipped: ${enrichedNames.length - namesToAdd.length} duplicates`);

  return {
    added: namesToAdd.length,
    skipped: enrichedNames.length - namesToAdd.length,
    total: chunk.length
  };
}

/**
 * Main function
 */
async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0 || args[0] === '--help') {
    console.log(`
📝 Add Names to Database Tool

Usage:
  node add-names-to-database.js "Name1, Name2, Name3..." [--chunk=N]

Arguments:
  names         Comma-separated list of names to add (required)
  --chunk=N     Database chunk number (1-4, default: 1)

Examples:
  node add-names-to-database.js "Alice, Henry, Beatrice"
  node add-names-to-database.js "Violet, Theodore, Hazel" --chunk=2

Notes:
  - Names will be enriched with GPT-4o (origin, meaning, gender, popularity)
  - Duplicates will be automatically skipped
  - Original chunk will be backed up before modification
`);
    process.exit(0);
  }

  // Parse arguments
  const namesArg = args.find(a => !a.startsWith('--'));
  const chunkArg = args.find(a => a.startsWith('--chunk='));

  if (!namesArg) {
    console.error(`❌ Error: No names provided`);
    console.log(`Usage: node add-names-to-database.js "Name1, Name2, Name3..."`);
    process.exit(1);
  }

  const names = namesArg.split(',').map(n => n.trim()).filter(n => n.length > 0);
  const chunkNumber = chunkArg ? parseInt(chunkArg.split('=')[1]) : 1;

  if (names.length === 0) {
    console.error(`❌ Error: No valid names found`);
    process.exit(1);
  }

  if (chunkNumber < 1 || chunkNumber > 4) {
    console.error(`❌ Error: Chunk number must be between 1 and 4`);
    process.exit(1);
  }

  console.log(`\n${'='.repeat(60)}`);
  console.log(`🚀 Adding ${names.length} names to database chunk ${chunkNumber}`);
  console.log('='.repeat(60));

  try {
    // Step 1: Enrich names with GPT-4o
    const enrichedNames = await enrichNamesWithGPT4o(names);

    // Step 2: Add to database chunk
    const result = await addNamesToChunk(enrichedNames, chunkNumber);

    console.log(`\n${'='.repeat(60)}`);
    console.log(`✨ SUCCESS!`);
    console.log(`   Added: ${result.added} names`);
    console.log(`   Skipped: ${result.skipped} duplicates`);
    console.log(`   Total in chunk: ${result.total} names`);
    console.log('='.repeat(60));

  } catch (error) {
    console.error(`\n❌ Fatal error:`, error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { enrichNamesWithGPT4o, addNamesToChunk };
