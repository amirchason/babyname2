#!/usr/bin/env node
/**
 * Re-enrich Unknown Origin Names
 * Uses OpenAI GPT-4 Mini to deeply research origins and meanings
 * for names currently marked as Unknown
 */

const fs = require('fs');
const path = require('path');
const OpenAI = require('openai');

const CHUNK_FILES = [
  '/data/data/com.termux/files/home/proj/babyname2/public/data/names-core.json',
  '/data/data/com.termux/files/home/proj/babyname2/public/data/names-chunk1.json',
  '/data/data/com.termux/files/home/proj/babyname2/public/data/names-chunk2.json',
  '/data/data/com.termux/files/home/proj/babyname2/public/data/names-chunk3.json',
  '/data/data/com.termux/files/home/proj/babyname2/public/data/names-chunk4.json'
];

const MAPPING_FILE = '/data/data/com.termux/files/home/proj/babyname2/origin-consolidation-map.json';
const BATCH_SIZE = 10; // Process 10 names at a time
const DELAY_MS = 2000; // 2 second delay between batches

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Load consolidation mapping
const mappingData = JSON.parse(fs.readFileSync(MAPPING_FILE, 'utf8'));
const { mapping, keepOriginal } = mappingData;

// Get all valid origin groups
const validOriginGroups = new Set([
  ...keepOriginal,
  ...Object.keys(mapping)
]);

console.log('🔍 Re-enriching Unknown Origin Names');
console.log('=' .repeat(70));
console.log(`Valid origin groups: ${validOriginGroups.size}`);
console.log(`Batch size: ${BATCH_SIZE} names`);
console.log(`Delay between batches: ${DELAY_MS}ms\n`);

/**
 * Research name origin using OpenAI
 */
async function researchOrigin(name, existingMeaning = '') {
  try {
    const prompt = `Research the baby name "${name}" and provide:
1. Cultural/linguistic ORIGIN (be specific: e.g., "Hebrew", "Spanish", "Yoruba", "Sanskrit", not just "African" or "Indian")
2. Meaning

${existingMeaning ? `Current meaning: "${existingMeaning}"` : ''}

Valid origin categories include: Spanish, Arabic, Hebrew, Latin, Greek, English, French, Italian, Irish, Scottish, Welsh, German, Portuguese, Polish, Russian, Indian, Sanskrit, Chinese, Japanese, Korean, African (specify region like Yoruba, Igbo, Swahili, Zulu), Biblical, Celtic, Norse, Persian, Turkish, Vietnamese, Thai, Filipino, Hawaiian, Native American, and others.

Be as specific as possible about the cultural origin. If it's a variant of another name, provide the origin of the root name.

Return ONLY a JSON object with this exact format:
{"origin": "specific cultural origin", "meaning": "concise meaning"}

If truly unknown after research, use: {"origin": "Unknown", "meaning": "meaning if found or Unknown"}`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are an expert in name etymology and cultural origins. Research names thoroughly and provide specific cultural/linguistic origins. Be precise - not just "African" but "Yoruba" or "Swahili", not just "Indian" but "Sanskrit" or "Tamil". Return only valid JSON.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.3,
      max_tokens: 150
    });

    const content = response.choices[0].message.content.trim();

    // Extract JSON from response (handle markdown code blocks)
    let jsonStr = content;
    if (content.includes('```json')) {
      jsonStr = content.split('```json')[1].split('```')[0].trim();
    } else if (content.includes('```')) {
      jsonStr = content.split('```')[1].split('```')[0].trim();
    }

    const result = JSON.parse(jsonStr);
    return {
      origin: result.origin || 'Unknown',
      meaning: result.meaning || existingMeaning || 'Unknown'
    };
  } catch (error) {
    console.error(`   ⚠️  Error researching "${name}": ${error.message}`);
    return { origin: 'Unknown', meaning: existingMeaning || 'Unknown' };
  }
}

/**
 * Get origin group from origin using consolidation mapping
 */
function getOriginGroup(origin) {
  if (!origin || typeof origin !== 'string') return 'Unknown';

  const trimmed = origin.trim();

  // Check if it should stay as-is
  if (keepOriginal.includes(trimmed)) {
    return trimmed;
  }

  // Find in mapping
  for (const [group, origins] of Object.entries(mapping)) {
    if (origins.includes(trimmed)) {
      return group;
    }
  }

  // Check partial matches for compound origins
  const parts = trimmed.split(/[,;]/).map(p => p.trim());
  for (const part of parts) {
    if (keepOriginal.includes(part)) {
      return part;
    }
    for (const [group, origins] of Object.entries(mapping)) {
      if (origins.includes(part)) {
        return group;
      }
    }
  }

  return 'Other';
}

/**
 * Process a chunk file
 */
async function processChunkFile(filePath) {
  if (!fs.existsSync(filePath)) {
    console.log(`⚠️  File not found: ${filePath}`);
    return { processed: 0, updated: 0 };
  }

  try {
    console.log(`\n📂 Processing: ${path.basename(filePath)}`);

    const content = fs.readFileSync(filePath, 'utf8');
    const data = JSON.parse(content);
    const names = data.names || data;

    if (!Array.isArray(names)) {
      console.log(`⚠️  Invalid format in ${filePath}`);
      return { processed: 0, updated: 0 };
    }

    // Find Unknown names
    const unknownNames = names.filter(name => {
      const group = name.originGroup;
      return group === 'Unknown' || (Array.isArray(group) && group.includes('Unknown'));
    });

    console.log(`   Found ${unknownNames.length} Unknown names`);

    if (unknownNames.length === 0) {
      return { processed: names.length, updated: 0 };
    }

    // Create backup
    const backupPath = filePath.replace('.json', `_backup_unknown_enrich_${Date.now()}.json`);
    fs.copyFileSync(filePath, backupPath);
    console.log(`   💾 Backup: ${path.basename(backupPath)}`);

    let updatedCount = 0;
    const examples = [];

    // Process in batches
    for (let i = 0; i < unknownNames.length; i += BATCH_SIZE) {
      const batch = unknownNames.slice(i, i + BATCH_SIZE);
      console.log(`   🔄 Processing batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(unknownNames.length / BATCH_SIZE)} (${i + 1}-${Math.min(i + BATCH_SIZE, unknownNames.length)} of ${unknownNames.length})`);

      for (const name of batch) {
        const result = await researchOrigin(name.name, name.meaning);

        if (result.origin !== 'Unknown') {
          const oldOrigin = name.origin;
          const oldGroup = name.originGroup;

          name.origin = result.origin;
          name.meaning = result.meaning;
          name.originGroup = getOriginGroup(result.origin);

          updatedCount++;

          if (examples.length < 10) {
            examples.push({
              name: name.name,
              oldOrigin: oldOrigin || 'Unknown',
              newOrigin: result.origin,
              oldGroup: oldGroup,
              newGroup: name.originGroup,
              meaning: result.meaning
            });
          }
        }
      }

      // Delay between batches to avoid rate limits
      if (i + BATCH_SIZE < unknownNames.length) {
        await new Promise(resolve => setTimeout(resolve, DELAY_MS));
      }
    }

    // Save updated file
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    console.log(`   ✅ Updated ${updatedCount} names out of ${unknownNames.length} Unknown`);

    if (examples.length > 0) {
      console.log(`\n   📋 Examples:`);
      examples.forEach(ex => {
        console.log(`      ${ex.name}:`);
        console.log(`         Origin: ${ex.oldOrigin} → ${ex.newOrigin}`);
        console.log(`         Group: ${ex.oldGroup} → ${ex.newGroup}`);
        console.log(`         Meaning: ${ex.meaning.substring(0, 60)}...`);
      });
    }

    return { processed: names.length, updated: updatedCount };
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
    return { processed: 0, updated: 0 };
  }
}

/**
 * Main function
 */
async function reEnrichUnknowns() {
  let totalProcessed = 0;
  let totalUpdated = 0;

  for (const file of CHUNK_FILES) {
    const result = await processChunkFile(file);
    totalProcessed += result.processed;
    totalUpdated += result.updated;
  }

  console.log(`\n${'='.repeat(70)}`);
  console.log(`\n✅ Complete!`);
  console.log(`   Total names processed: ${totalProcessed.toLocaleString()}`);
  console.log(`   Unknown names updated: ${totalUpdated.toLocaleString()}\n`);
}

// Run the script
reEnrichUnknowns().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
