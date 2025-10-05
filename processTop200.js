#!/usr/bin/env node

/**
 * Process Top 200 Names with GPT-4
 * Accurate origins and meanings for the most popular names
 * Run with: node processTop200.js
 */

const fs = require('fs');
const path = require('path');
const OpenAI = require('openai');
require('dotenv').config();

// Configuration
const API_KEY = process.env.OPENAI_API_KEY;
const BATCH_SIZE = 5; // Process 5 names at a time for detailed analysis
const DELAY_MS = 2000; // 2 second delay between batches
const PROGRESS_FILE = 'top200_progress.json';
const ERROR_LOG_FILE = 'top200_errors.log';
const MAX_RETRIES = 3;
const NAMES_TO_PROCESS = 200; // Process exactly top 200 names

// Check for API key
if (!API_KEY || API_KEY === 'YOUR_OPENAI_API_KEY_HERE') {
  console.error('ERROR: Please set your OpenAI API key in the .env file');
  console.error('Add: OPENAI_API_KEY=sk-your-actual-api-key');
  process.exit(1);
}

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: API_KEY
});

// Log errors
function logError(message) {
  const timestamp = new Date().toISOString();
  fs.appendFileSync(ERROR_LOG_FILE, `[${timestamp}] ${message}\n`);
  console.error(`ERROR: ${message}`);
}

/**
 * Generate GPT-4 prompt for name analysis
 */
function generatePrompt(names) {
  return `You are a professional etymologist and name researcher with access to comprehensive databases.
For each name, provide accurate information based on actual linguistic and historical research.

IMPORTANT INSTRUCTIONS:
1. ORIGINS:
   - Research the actual etymology
   - ONLY include multiple origins if the name genuinely has different cultural origins
   - Don't force multiple origins if there's only one
   - Use standardized origin names (Hebrew, Greek, Latin, Arabic, Germanic, Celtic, English, French, Spanish, Italian, etc.)

2. MEANINGS:
   - Short: 2-4 words maximum for name card display
   - Full meanings: ONLY provide multiple meanings if they actually exist
   - If name has ONE meaning: provide just that one (10-15 words)
   - If name has variations: provide up to 3 different interpretations (10-15 words each)
   - DO NOT invent meanings - only real etymological meanings
   - DO NOT pad with rephrased versions of the same meaning

Names to analyze: ${names.join(', ')}

Return ONLY valid JSON in this exact format:
{
  "NameOne": {
    "origins": ["Hebrew"],
    "originsDetails": {
      "primary": "Hebrew",
      "secondary": null,
      "tertiary": null,
      "percentages": null
    },
    "meaningShort": "God is gracious",
    "meanings": [
      "Hebrew name meaning God has shown favor and grace"
    ],
    "etymology": "From Hebrew Yohanan meaning 'God is gracious'"
  },
  "NameTwo": {
    "origins": ["Greek", "Latin"],
    "originsDetails": {
      "primary": "Greek",
      "secondary": "Latin",
      "tertiary": null,
      "percentages": [70, 30]
    },
    "meaningShort": "defender of men",
    "meanings": [
      "Greek name meaning defender and protector of mankind",
      "Military leader who shields people from harm"
    ],
    "etymology": "From Greek Alexandros, composed of alexein 'to defend' and aner 'man'"
  }
}

Remember:
- Only provide multiple meanings if they genuinely exist
- Don't force 3 meanings if there's only 1 or 2
- Quality over quantity
- Be accurate with etymology`;
}

/**
 * Call GPT-4 API
 */
async function callGPT4(names) {
  try {
    const prompt = generatePrompt(names);

    console.log(`  Calling GPT-4 for: ${names.join(', ')}`);

    const completion = await openai.chat.completions.create({
      model: "gpt-4-turbo",  // Latest GPT-4 model
      messages: [
        {
          role: "system",
          content: "You are an expert etymologist with access to comprehensive name databases. Provide accurate, researched information."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.3,  // Lower temperature for more consistent results
      max_tokens: 2000,
      response_format: { type: "json_object" }
    });

    const responseText = completion.choices[0].message.content;

    try {
      const parsed = JSON.parse(responseText);
      return parsed;
    } catch (parseError) {
      logError(`JSON parse error: ${parseError.message}`);
      return null;
    }

  } catch (error) {
    logError(`GPT-4 API error: ${error.message}`);
    return null;
  }
}

/**
 * Process a batch of names
 */
async function processBatch(names, retryCount = 0) {
  try {
    const gptResponse = await callGPT4(names);

    if (!gptResponse && retryCount < MAX_RETRIES) {
      console.log(`  Retrying batch (attempt ${retryCount + 1}/${MAX_RETRIES})...`);
      await new Promise(resolve => setTimeout(resolve, DELAY_MS));
      return processBatch(names, retryCount + 1);
    }

    return gptResponse || {};

  } catch (error) {
    logError(`Batch processing error: ${error.message}`);
    return {};
  }
}

/**
 * Update name entry with GPT-4 data
 */
function updateNameEntry(name, gptData) {
  if (!gptData) return name;

  // Update origins
  if (gptData.origins && gptData.origins.length > 0) {
    name.origins = gptData.origins;
    name.origin = gptData.origins[0];

    if (gptData.originsDetails) {
      name.originsDetails = gptData.originsDetails;
    }
  }

  // Update meanings
  if (gptData.meaningShort) {
    name.meaningShort = gptData.meaningShort;
  }

  if (gptData.meanings && gptData.meanings.length > 0) {
    name.meanings = gptData.meanings;
    name.meaningFull = gptData.meanings[0];
    name.meaning = gptData.meaningShort;
  }

  if (gptData.etymology) {
    name.meaningEtymology = gptData.etymology;
  }

  // Set processing metadata
  name.originProcessed = true;
  name.originProcessedAt = new Date().toISOString();
  name.originSource = 'gpt-4-turbo';
  name.meaningProcessed = true;
  name.meaningProcessedAt = new Date().toISOString();
  name.meaningSource = 'gpt-4-turbo';

  return name;
}

/**
 * Main function to process top 200 names
 */
async function main() {
  console.log('='.repeat(60));
  console.log('GPT-4 TOP 200 NAMES PROCESSING');
  console.log('Processing the most popular baby names with accuracy');
  console.log('='.repeat(60));

  // Load or create progress
  let progress = {
    lastBatchIndex: 0,
    totalProcessed: 0,
    totalErrors: 0,
    startTime: new Date().toISOString(),
    lastUpdate: null,
    stats: {
      singleMeaning: 0,
      twoMeanings: 0,
      threeMeanings: 0,
      singleOrigin: 0,
      multipleOrigins: 0
    }
  };

  if (fs.existsSync(PROGRESS_FILE)) {
    progress = JSON.parse(fs.readFileSync(PROGRESS_FILE, 'utf8'));
    console.log('\nResuming from previous session:');
    console.log(`  Total processed: ${progress.totalProcessed}`);
    console.log(`  Total errors: ${progress.totalErrors}`);
    console.log(`  Resuming at batch ${progress.lastBatchIndex}`);
  }

  const filePath = path.join('public', 'data', 'names-core.json');

  if (!fs.existsSync(filePath)) {
    console.error('Error: names-core.json not found');
    process.exit(1);
  }

  // Load data
  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  const allNames = data.names || [];

  // Take only the top 200 names
  const namesToProcess = allNames.slice(0, NAMES_TO_PROCESS);

  console.log(`\nLoaded ${allNames.length} total names`);
  console.log(`Processing TOP ${NAMES_TO_PROCESS} names only`);
  console.log('These are the most popular baby names requiring maximum accuracy\n');

  const startTime = Date.now();

  // Resume from last position if applicable
  let startIndex = progress.lastBatchIndex || 0;

  let processedCount = 0;
  let errorCount = 0;

  // Process in batches
  for (let i = startIndex; i < namesToProcess.length; i += BATCH_SIZE) {
    const batch = namesToProcess.slice(i, Math.min(i + BATCH_SIZE, namesToProcess.length));
    const batchNumber = Math.floor(i / BATCH_SIZE) + 1;
    const totalBatches = Math.ceil(namesToProcess.length / BATCH_SIZE);

    console.log(`\nBatch ${batchNumber}/${totalBatches} (${batch.length} names)`);

    // Extract name strings
    const nameStrings = batch.map(n => n.name || n);

    // Get data from GPT-4
    const gptData = await processBatch(nameStrings);

    // Update names with GPT-4 data
    for (let j = 0; j < batch.length; j++) {
      const name = batch[j];
      const nameStr = name.name || name;
      const nameData = gptData[nameStr];

      if (typeof name === 'object') {
        if (nameData) {
          updateNameEntry(name, nameData);
          processedCount++;

          // Update statistics
          if (name.meanings) {
            if (name.meanings.length === 1) progress.stats.singleMeaning++;
            else if (name.meanings.length === 2) progress.stats.twoMeanings++;
            else if (name.meanings.length === 3) progress.stats.threeMeanings++;
          }

          if (name.origins) {
            if (name.origins.length === 1) progress.stats.singleOrigin++;
            else progress.stats.multipleOrigins++;
          }

          console.log(`  ✓ ${nameStr}: "${name.meaningShort}" (${name.origins ? name.origins.join(', ') : 'no origin'})`);

          // Show if multiple meanings detected
          if (name.meanings && name.meanings.length > 1) {
            console.log(`    → ${name.meanings.length} meanings found`);
          }
        } else {
          errorCount++;
          console.log(`  ✗ ${nameStr}: Failed to get data`);
        }
      }
    }

    // Save progress
    progress.lastBatchIndex = i + BATCH_SIZE;
    progress.totalProcessed = processedCount;
    progress.totalErrors = errorCount;
    progress.lastUpdate = new Date().toISOString();

    // Save data after each batch
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));

    // Save progress
    fs.writeFileSync(PROGRESS_FILE, JSON.stringify(progress, null, 2));

    console.log(`  Progress: ${processedCount} successful, ${errorCount} errors`);
    console.log(`  Stats: ${progress.stats.singleMeaning} single, ${progress.stats.twoMeanings} double, ${progress.stats.threeMeanings} triple meanings`);

    // Rate limiting
    if (i + BATCH_SIZE < namesToProcess.length) {
      console.log(`  Waiting ${DELAY_MS/1000} seconds before next batch...`);
      await new Promise(resolve => setTimeout(resolve, DELAY_MS));
    }
  }

  const duration = Math.round((Date.now() - startTime) / 1000);
  const minutes = Math.floor(duration / 60);
  const seconds = duration % 60;

  // Final summary
  console.log('\n' + '='.repeat(60));
  console.log('TOP 200 PROCESSING COMPLETE');
  console.log(`Total names processed: ${processedCount}`);
  console.log(`Total errors: ${errorCount}`);
  console.log(`Time taken: ${minutes}m ${seconds}s`);
  console.log(`Success rate: ${((processedCount / (processedCount + errorCount)) * 100).toFixed(1)}%`);

  console.log('\nMeaning Statistics:');
  console.log(`  Names with 1 meaning: ${progress.stats.singleMeaning}`);
  console.log(`  Names with 2 meanings: ${progress.stats.twoMeanings}`);
  console.log(`  Names with 3 meanings: ${progress.stats.threeMeanings}`);

  console.log('\nOrigin Statistics:');
  console.log(`  Names with single origin: ${progress.stats.singleOrigin}`);
  console.log(`  Names with multiple origins: ${progress.stats.multipleOrigins}`);

  console.log('\n✓ Top 200 names have been enriched with accurate GPT-4 data!');
  console.log('✓ Review the results before processing the remaining 146,790 names.');
  console.log('='.repeat(60));
}

// Run the script
main().catch(error => {
  logError(`Unhandled error: ${error.message}`);
  console.error('FATAL ERROR:', error);
  process.exit(1);
});