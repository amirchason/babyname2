#!/usr/bin/env node

/**
 * Cloud Enrichment Service - Enriches all unenriched names
 * Runs independently without browser or Claude Code
 * Can be resumed at any time - smart deduplication built-in
 */

const fs = require('fs');
const path = require('path');
require('dotenv').config();

// OpenAI Configuration
const OPENAI_API_KEY = process.env.OPENAI_API_KEY || process.env.REACT_APP_OPENAI_API_KEY;
const BATCH_SIZE = 10; // Names per API call
const DELAY_BETWEEN_BATCHES = 1500; // 1.5 seconds
const SAVE_INTERVAL = 5; // Save progress every 5 names

// Data paths
const DATA_DIR = path.join(__dirname, 'public', 'data');
const CHUNK_FILES = [
  'names-chunk1.json',
  'names-chunk2.json',
  'names-chunk3.json',
  'names-chunk4.json'
];
const PROGRESS_FILE = path.join(__dirname, 'enrichment-progress.json');
const OUTPUT_DIR = path.join(__dirname, 'public', 'data', 'enriched');

// Create output directory
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// Statistics
let stats = {
  totalNames: 0,
  alreadyEnriched: 0,
  needsEnrichment: 0,
  processed: 0,
  errors: 0,
  startTime: Date.now()
};

/**
 * Load all names from chunks
 */
function loadAllNames() {
  console.log('📦 Loading all names from chunks...');
  let allNames = [];

  for (const chunkFile of CHUNK_FILES) {
    const filePath = path.join(DATA_DIR, chunkFile);
    if (fs.existsSync(filePath)) {
      try {
        const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        const names = Array.isArray(data) ? data : data.names || [];
        allNames = allNames.concat(names);
        console.log(`  ✓ Loaded ${names.length} names from ${chunkFile}`);
      } catch (error) {
        console.error(`  ✗ Error loading ${chunkFile}:`, error.message);
      }
    }
  }

  console.log(`✅ Total names loaded: ${allNames.length}\n`);
  return allNames;
}

/**
 * Load enrichment progress
 */
function loadProgress() {
  if (fs.existsSync(PROGRESS_FILE)) {
    try {
      const progress = JSON.parse(fs.readFileSync(PROGRESS_FILE, 'utf8'));
      console.log(`📝 Resuming from previous session: ${progress.enrichedNames.length} names already enriched\n`);
      return new Set(progress.enrichedNames);
    } catch (error) {
      console.error('Error loading progress:', error.message);
    }
  }
  return new Set();
}

/**
 * Save enrichment progress
 */
function saveProgress(enrichedNames) {
  try {
    const progress = {
      enrichedNames: Array.from(enrichedNames),
      timestamp: new Date().toISOString(),
      stats: stats
    };
    fs.writeFileSync(PROGRESS_FILE, JSON.stringify(progress, null, 2));
  } catch (error) {
    console.error('Error saving progress:', error.message);
  }
}

/**
 * Call OpenAI API to enrich names (batch)
 */
async function enrichNamesBatch(names) {
  const nameStrings = names.map(n => n.name);

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
          content: 'You are a baby name etymologist. Provide concise meanings (1-4 words MAX) and REAL origins. NEVER use "unknown" or "not available" - research and find the actual linguistic origin. Return ONLY valid JSON array.'
        },
        {
          role: 'user',
          content: `Analyze these ${nameStrings.length} baby names and return a JSON array with this exact structure for each name:
[
  {
    "name": "exact name from input",
    "meaning": "1-4 words describing meaning",
    "origin": "REAL linguistic origin (Hebrew/Greek/Latin/English/Arabic/Sanskrit/Chinese/etc - NEVER use 'unknown')",
    "culturalContext": "brief cultural note if relevant"
  }
]

Names: ${nameStrings.join(', ')}

CRITICAL RULES:
1. Keep meanings to 1-4 words maximum
2. ALWAYS provide a real origin - analyze the name's linguistic roots, phonetics, or cultural patterns
3. For unclear names, make an educated guess based on linguistic analysis (e.g., ending in -o suggests Spanish/Italian, -ski suggests Polish/Slavic, etc.)
4. NEVER return "unknown", "not available", or "N/A" as an origin
5. Return ONLY the JSON array, no other text`
        }
      ],
      temperature: 0.3,
      max_tokens: 2000
    })
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`OpenAI API error: ${response.status} - ${error}`);
  }

  const data = await response.json();
  const content = data.choices[0].message.content.trim();

  // Parse JSON response
  const jsonMatch = content.match(/\[[\s\S]*\]/);
  if (!jsonMatch) {
    throw new Error('Invalid JSON response from API');
  }

  return JSON.parse(jsonMatch[0]);
}

/**
 * Check if origin is unknown/invalid
 */
function hasUnknownOrigin(origin) {
  if (!origin) return true;
  const originStr = origin.toString().toLowerCase();
  return originStr === 'unknown' ||
         originStr === 'not available' ||
         originStr === 'unknown origin' ||
         originStr === 'n/a' ||
         originStr.trim() === '';
}

/**
 * Filter unenriched names (including those with unknown origins)
 */
function filterUnenrichedNames(allNames, enrichedSet) {
  return allNames.filter(name => {
    // Already processed in this session
    if (enrichedSet.has(name.name)) {
      stats.alreadyEnriched++;
      return false;
    }

    // Needs enrichment if:
    // 1. No meaning
    // 2. Has unknown/missing origin
    // 3. Not marked as enriched
    const needsMeaning = !name.meaning;
    const needsOrigin = hasUnknownOrigin(name.origin);

    if (needsMeaning || needsOrigin) {
      stats.needsEnrichment++;
      return true;
    }

    // Has both meaning and valid origin
    stats.alreadyEnriched++;
    return false;
  });
}

/**
 * Process enrichment in batches
 */
async function processEnrichment() {
  console.log('🚀 Starting Cloud Enrichment Service\n');
  console.log('═'.repeat(60));

  // Validate API key
  if (!OPENAI_API_KEY) {
    console.error('❌ ERROR: REACT_APP_OPENAI_API_KEY not found in .env');
    process.exit(1);
  }

  // Load data
  const allNames = loadAllNames();
  stats.totalNames = allNames.length;

  const enrichedSet = loadProgress();
  const unenrichedNames = filterUnenrichedNames(allNames, enrichedSet);

  console.log('📊 INITIAL STATUS:');
  console.log(`  Total names: ${stats.totalNames.toLocaleString()}`);
  console.log(`  Already enriched: ${stats.alreadyEnriched.toLocaleString()}`);
  console.log(`  Needs enrichment: ${stats.needsEnrichment.toLocaleString()}`);
  console.log('═'.repeat(60));
  console.log();

  if (unenrichedNames.length === 0) {
    console.log('✅ All names already enriched! Nothing to do.\n');
    return;
  }

  // Process in batches
  console.log(`🔄 Processing ${unenrichedNames.length} names in batches of ${BATCH_SIZE}...\n`);

  for (let i = 0; i < unenrichedNames.length; i += BATCH_SIZE) {
    const batch = unenrichedNames.slice(i, i + BATCH_SIZE);
    const batchNum = Math.floor(i / BATCH_SIZE) + 1;
    const totalBatches = Math.ceil(unenrichedNames.length / BATCH_SIZE);

    try {
      console.log(`📦 Batch ${batchNum}/${totalBatches} (${batch.length} names)...`);

      // Call OpenAI API
      const enrichedData = await enrichNamesBatch(batch);

      // Update names with enriched data
      enrichedData.forEach((data, index) => {
        const name = batch[index];
        name.meaning = data.meaning;

        // Normalize African origins to just "African"
        let normalizedOrigin = data.origin;
        if (normalizedOrigin && normalizedOrigin.toLowerCase().includes('african')) {
          normalizedOrigin = 'African';
        }
        name.origin = normalizedOrigin;

        name.culturalContext = data.culturalContext;
        name.enriched = true;
        name.enrichedAt = new Date().toISOString();

        enrichedSet.add(name.name);
        stats.processed++;

        console.log(`  ✓ ${data.name}: "${data.meaning}" (${normalizedOrigin})`);
      });

      // Save progress periodically
      if (stats.processed % SAVE_INTERVAL === 0) {
        saveProgress(enrichedSet);
        saveEnrichedChunks(allNames);
      }

      // Progress update
      const percentComplete = ((stats.processed / stats.needsEnrichment) * 100).toFixed(1);
      const remaining = stats.needsEnrichment - stats.processed;
      console.log(`📊 Progress: ${stats.processed}/${stats.needsEnrichment} (${percentComplete}% complete, ${remaining} remaining)\n`);

      // Rate limiting delay
      if (i + BATCH_SIZE < unenrichedNames.length) {
        await new Promise(resolve => setTimeout(resolve, DELAY_BETWEEN_BATCHES));
      }

    } catch (error) {
      console.error(`❌ Batch ${batchNum} failed:`, error.message);
      stats.errors++;

      // Save progress even on error
      saveProgress(enrichedSet);

      // Wait longer before retrying
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
  }

  // Final save
  saveProgress(enrichedSet);
  saveEnrichedChunks(allNames);

  // Summary
  const duration = ((Date.now() - stats.startTime) / 1000 / 60).toFixed(1);
  console.log('\n' + '═'.repeat(60));
  console.log('✅ ENRICHMENT COMPLETE!\n');
  console.log('📊 FINAL STATISTICS:');
  console.log(`  Total names: ${stats.totalNames.toLocaleString()}`);
  console.log(`  Already enriched: ${stats.alreadyEnriched.toLocaleString()}`);
  console.log(`  Newly enriched: ${stats.processed.toLocaleString()}`);
  console.log(`  Errors: ${stats.errors}`);
  console.log(`  Duration: ${duration} minutes`);
  console.log(`  Rate: ${(stats.processed / parseFloat(duration)).toFixed(0)} names/minute`);
  console.log('═'.repeat(60));
  console.log();
}

/**
 * Save enriched chunks back to disk
 */
function saveEnrichedChunks(allNames) {
  try {
    // Group names back into chunks
    const chunkSize = Math.ceil(allNames.length / CHUNK_FILES.length);

    for (let i = 0; i < CHUNK_FILES.length; i++) {
      const start = i * chunkSize;
      const end = start + chunkSize;
      const chunkData = allNames.slice(start, end);

      const outputPath = path.join(OUTPUT_DIR, CHUNK_FILES[i]);
      fs.writeFileSync(outputPath, JSON.stringify(chunkData, null, 2));
    }

    console.log(`💾 Saved enriched data to ${OUTPUT_DIR}/`);
  } catch (error) {
    console.error('Error saving enriched chunks:', error.message);
  }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n⚠️  Interrupted! Saving progress...');
  process.exit(0);
});

// Run
processEnrichment().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
