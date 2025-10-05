#!/usr/bin/env node

/**
 * Process Names with GPT-4 Script
 * Uses OpenAI GPT-4 API to get accurate origins and meanings for all names
 * Run with: node processNamesWithGPT4.js
 */

const fs = require('fs');
const path = require('path');
const OpenAI = require('openai');
require('dotenv').config();

// Configuration
const API_KEY = process.env.OPENAI_API_KEY;
const BATCH_SIZE = 5; // Process 5 names at a time for detailed analysis
const DELAY_MS = 2000; // 2 second delay between batches
const PROGRESS_FILE = 'gpt4_progress.json';
const ERROR_LOG_FILE = 'gpt4_errors.log';
const MAX_RETRIES = 3;

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
      model: "gpt-4-turbo",  // Latest GPT-4 model for accurate results
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
    name.origin = gptData.origins[0]; // Set primary origin for backward compatibility

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
    name.meaningFull = gptData.meanings[0]; // First meaning as full
    name.meaning = gptData.meaningShort; // For backward compatibility
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
 * Process a chunk file
 */
async function processChunk(chunkFile, progress) {
  console.log(`\nProcessing ${chunkFile}...`);

  const filePath = path.join('public', 'data', chunkFile);

  if (!fs.existsSync(filePath)) {
    console.log(`Skipping ${chunkFile} - file not found`);
    return;
  }

  // Load chunk
  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  const names = data.names || [];

  console.log(`Found ${names.length} names in ${chunkFile}`);

  // Resume from last position if applicable
  let startIndex = 0;
  if (progress.currentChunk === chunkFile && progress.lastBatchIndex) {
    startIndex = progress.lastBatchIndex;
    console.log(`Resuming from batch index ${startIndex}`);
  }

  let processedCount = 0;
  let errorCount = 0;
  let stats = {
    singleMeaning: 0,
    twoMeanings: 0,
    threeMeanings: 0,
    singleOrigin: 0,
    multipleOrigins: 0
  };

  // Process in batches
  for (let i = startIndex; i < names.length; i += BATCH_SIZE) {
    const batch = names.slice(i, Math.min(i + BATCH_SIZE, names.length));
    const batchNumber = Math.floor(i / BATCH_SIZE) + 1;
    const totalBatches = Math.ceil(names.length / BATCH_SIZE);

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
            if (name.meanings.length === 1) stats.singleMeaning++;
            else if (name.meanings.length === 2) stats.twoMeanings++;
            else if (name.meanings.length === 3) stats.threeMeanings++;
          }

          if (name.origins) {
            if (name.origins.length === 1) stats.singleOrigin++;
            else stats.multipleOrigins++;
          }

          console.log(`  ✓ ${nameStr}: "${name.meaningShort}" (${name.origins ? name.origins.join(', ') : 'no origin'})`);
        } else {
          errorCount++;
          console.log(`  ✗ ${nameStr}: Failed to get data`);
        }
      }
    }

    // Save progress
    progress.currentChunk = chunkFile;
    progress.lastBatchIndex = i + BATCH_SIZE;
    progress.totalProcessed += processedCount;
    progress.totalErrors += errorCount;
    progress.lastUpdate = new Date().toISOString();
    progress.stats = stats;

    // Save chunk after each batch (for safety)
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));

    // Save progress
    fs.writeFileSync(PROGRESS_FILE, JSON.stringify(progress, null, 2));

    console.log(`  Progress: ${processedCount} successful, ${errorCount} errors`);
    console.log(`  Meanings: ${stats.singleMeaning} single, ${stats.twoMeanings} double, ${stats.threeMeanings} triple`);
    console.log(`  Origins: ${stats.singleOrigin} single, ${stats.multipleOrigins} multiple`);

    // Rate limiting
    if (i + BATCH_SIZE < names.length) {
      console.log(`  Waiting ${DELAY_MS/1000} seconds before next batch...`);
      await new Promise(resolve => setTimeout(resolve, DELAY_MS));
    }
  }

  // Mark chunk as completed
  if (!progress.completedChunks.includes(chunkFile)) {
    progress.completedChunks.push(chunkFile);
  }
  progress.currentChunk = null;
  progress.lastBatchIndex = 0;
  fs.writeFileSync(PROGRESS_FILE, JSON.stringify(progress, null, 2));

  console.log(`\n${chunkFile} complete: ${processedCount} processed, ${errorCount} errors`);

  return { processedCount, errorCount, stats };
}

/**
 * Main function
 */
async function main() {
  console.log('='.repeat(60));
  console.log('GPT-4 NAME PROCESSING SCRIPT');
  console.log('Using OpenAI GPT-4 API for accurate name analysis');
  console.log('='.repeat(60));

  // Load or create progress
  let progress = {
    completedChunks: [],
    currentChunk: null,
    lastBatchIndex: 0,
    totalProcessed: 0,
    totalErrors: 0,
    startTime: new Date().toISOString(),
    lastUpdate: null,
    stats: {}
  };

  if (fs.existsSync(PROGRESS_FILE)) {
    progress = JSON.parse(fs.readFileSync(PROGRESS_FILE, 'utf8'));
    console.log('\nResuming from previous session:');
    console.log(`  Completed chunks: ${progress.completedChunks.join(', ') || 'none'}`);
    console.log(`  Total processed: ${progress.totalProcessed}`);
    console.log(`  Total errors: ${progress.totalErrors}`);

    if (progress.currentChunk) {
      console.log(`  Resuming chunk: ${progress.currentChunk} at batch ${progress.lastBatchIndex}`);
    }
  }

  const startTime = Date.now();

  // Process each chunk
  const chunks = [
    'names-core.json',     // 945 names - start here for testing
    'names-chunk1.json',   // 29k names
    'names-chunk2.json',   // ~40k names
    'names-chunk3.json',   // ~60k names
    'names-chunk4.json'    // ~95k names
  ];

  // For testing, you might want to process only names-core.json first
  const testMode = true; // Set to true for testing
  const chunksToProcess = testMode ? ['names-core.json'] : chunks;

  for (const chunk of chunksToProcess) {
    // Skip completed chunks
    if (progress.completedChunks.includes(chunk)) {
      console.log(`\nSkipping completed chunk: ${chunk}`);
      continue;
    }

    try {
      await processChunk(chunk, progress);
    } catch (error) {
      logError(`Failed to process ${chunk}: ${error.message}`);
      console.error(`\nFATAL ERROR processing ${chunk}: ${error.message}`);

      // Save progress before exiting
      fs.writeFileSync(PROGRESS_FILE, JSON.stringify(progress, null, 2));

      console.log('\nProgress saved. You can resume by running the script again.');
      process.exit(1);
    }
  }

  const duration = Math.round((Date.now() - startTime) / 1000);
  const minutes = Math.floor(duration / 60);
  const seconds = duration % 60;

  // Final summary
  console.log('\n' + '='.repeat(60));
  console.log('PROCESSING COMPLETE');
  console.log(`Total names processed: ${progress.totalProcessed}`);
  console.log(`Total errors: ${progress.totalErrors}`);
  console.log(`Time taken: ${minutes}m ${seconds}s`);
  console.log(`Success rate: ${((progress.totalProcessed / (progress.totalProcessed + progress.totalErrors)) * 100).toFixed(1)}%`);

  if (progress.stats) {
    console.log('\nFinal Statistics:');
    console.log(`  Names with 1 meaning: ${progress.stats.singleMeaning || 0}`);
    console.log(`  Names with 2 meanings: ${progress.stats.twoMeanings || 0}`);
    console.log(`  Names with 3 meanings: ${progress.stats.threeMeanings || 0}`);
    console.log(`  Names with single origin: ${progress.stats.singleOrigin || 0}`);
    console.log(`  Names with multiple origins: ${progress.stats.multipleOrigins || 0}`);
  }

  console.log('='.repeat(60));

  // Clean up progress file on successful completion
  if (progress.completedChunks.length === chunks.length) {
    console.log('\nAll chunks processed successfully!');
  }
}

// Run the script
main().catch(error => {
  logError(`Unhandled error: ${error.message}`);
  console.error('FATAL ERROR:', error);
  process.exit(1);
});