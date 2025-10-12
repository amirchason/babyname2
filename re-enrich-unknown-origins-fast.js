#!/usr/bin/env node
/**
 * Re-enrich Unknown Origin Names (FAST & SAFE)
 * Uses OpenAI GPT-4 Mini with concurrent processing
 * Safe rate limiting + progress updates every 5 minutes
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

// Optimized settings for speed + safety
const CONCURRENT_REQUESTS = 3; // 3 concurrent API calls (safe: ~3-4 RPS = 180-240 RPM)
const DELAY_BETWEEN_CALLS = 350; // 350ms delay = max 171 calls/min (under 200 RPM limit)
const PROGRESS_INTERVAL = 5 * 60 * 1000; // Progress update every 5 minutes

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Load consolidation mapping
const mappingData = JSON.parse(fs.readFileSync(MAPPING_FILE, 'utf8'));
const { mapping, keepOriginal } = mappingData;

// Global stats
let totalProcessed = 0;
let totalUpdated = 0;
let startTime = Date.now();
let lastProgressTime = Date.now();

console.log('🚀 Re-enriching Unknown Origin Names (FAST MODE)');
console.log('=' .repeat(70));
console.log(`Concurrent requests: ${CONCURRENT_REQUESTS}`);
console.log(`Delay between calls: ${DELAY_BETWEEN_CALLS}ms`);
console.log(`Progress updates: every 5 minutes\n`);

/**
 * Sleep utility
 */
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

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
      model: 'gpt-4-turbo',
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

    // Extract JSON from response
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

  // Check partial matches
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
 * Show progress update
 */
function showProgress(currentFile, processed, total, updated) {
  const elapsed = Date.now() - startTime;
  const rate = processed / (elapsed / 1000 / 60); // names per minute
  const remaining = total - processed;
  const eta = remaining / rate;

  console.log(`\n⏱️  PROGRESS UPDATE (${new Date().toLocaleTimeString()})`);
  console.log(`   File: ${currentFile}`);
  console.log(`   Processed: ${processed.toLocaleString()} / ${total.toLocaleString()}`);
  console.log(`   Updated: ${updated.toLocaleString()}`);
  console.log(`   Rate: ${rate.toFixed(1)} names/min`);
  console.log(`   ETA: ${eta.toFixed(1)} minutes\n`);

  lastProgressTime = Date.now();
}

/**
 * Process with concurrent requests and rate limiting
 */
async function processConcurrent(names, onProgress) {
  const results = [];
  const queue = [...names];
  let activeRequests = 0;
  let processedCount = 0;

  return new Promise((resolve) => {
    const processNext = async () => {
      if (queue.length === 0 && activeRequests === 0) {
        resolve(results);
        return;
      }

      while (queue.length > 0 && activeRequests < CONCURRENT_REQUESTS) {
        const name = queue.shift();
        if (!name) continue;

        activeRequests++;

        (async () => {
          try {
            // Rate limiting delay
            await sleep(DELAY_BETWEEN_CALLS);

            const result = await researchOrigin(name.name, name.meaning);
            results.push({ name, result });

            processedCount++;
            if (onProgress) {
              onProgress(processedCount, names.length);
            }
          } catch (error) {
            console.error(`Error processing ${name.name}:`, error.message);
            results.push({ name, result: { origin: 'Unknown', meaning: name.meaning || 'Unknown' } });
          } finally {
            activeRequests--;
            processNext();
          }
        })();
      }
    };

    // Start initial batch
    processNext();
  });
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
    const backupPath = filePath.replace('.json', `_backup_unknown_fast_${Date.now()}.json`);
    fs.copyFileSync(filePath, backupPath);
    console.log(`   💾 Backup: ${path.basename(backupPath)}`);

    let fileUpdatedCount = 0;
    let fileProcessedCount = 0;
    const examples = [];

    // Progress callback
    const onProgress = (processed, total) => {
      fileProcessedCount = processed;

      // Show progress every 5 minutes
      if (Date.now() - lastProgressTime >= PROGRESS_INTERVAL) {
        showProgress(path.basename(filePath), processed, total, fileUpdatedCount);
      }
    };

    // Process all names concurrently with rate limiting
    console.log(`   🚀 Starting concurrent processing...`);
    const results = await processConcurrent(unknownNames, onProgress);

    // Apply results
    for (const { name, result } of results) {
      if (result.origin !== 'Unknown') {
        name.origin = result.origin;
        name.meaning = result.meaning;
        name.originGroup = getOriginGroup(result.origin);
        fileUpdatedCount++;

        if (examples.length < 10) {
          examples.push({
            name: name.name,
            newOrigin: result.origin,
            newGroup: name.originGroup,
            meaning: result.meaning
          });
        }
      }
    }

    // Save updated file
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    console.log(`   ✅ Updated ${fileUpdatedCount} names out of ${unknownNames.length} Unknown`);

    if (examples.length > 0) {
      console.log(`\n   📋 Examples:`);
      examples.forEach(ex => {
        console.log(`      ${ex.name}: ${ex.newOrigin} (${ex.newGroup})`);
      });
    }

    totalProcessed += unknownNames.length;
    totalUpdated += fileUpdatedCount;

    return { processed: names.length, updated: fileUpdatedCount };
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
    return { processed: 0, updated: 0 };
  }
}

/**
 * Main function
 */
async function reEnrichUnknowns() {
  for (const file of CHUNK_FILES) {
    await processChunkFile(file);
  }

  const totalTime = (Date.now() - startTime) / 1000 / 60;
  const avgRate = totalProcessed / totalTime;

  console.log(`\n${'='.repeat(70)}`);
  console.log(`\n✅ Complete!`);
  console.log(`   Total Unknown processed: ${totalProcessed.toLocaleString()}`);
  console.log(`   Successfully updated: ${totalUpdated.toLocaleString()}`);
  console.log(`   Still Unknown: ${(totalProcessed - totalUpdated).toLocaleString()}`);
  console.log(`   Total time: ${totalTime.toFixed(1)} minutes`);
  console.log(`   Average rate: ${avgRate.toFixed(1)} names/minute\n`);
}

// Run the script
reEnrichUnknowns().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
