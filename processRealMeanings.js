#!/usr/bin/env node

/**
 * Process Real Meanings Script
 * Uses Gemini 2.0 Flash with web search to get accurate name meanings
 * Run with: node processRealMeanings.js
 */

const fs = require('fs');
const path = require('path');
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Configuration
const API_KEY = 'AIzaSyALzy3qXMyXPtLl7pUuCDo_eE5X89u3dpA';
const BATCH_SIZE = 10; // Process 10 names at a time
const DELAY_MS = 3000; // 3 second delay between batches to avoid rate limits
const PROGRESS_FILE = 'real_meanings_progress.json';
const ERROR_LOG_FILE = 'real_meanings_errors.log';

// Initialize Gemini
const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({
  model: 'gemini-2.0-flash-exp',
  generationConfig: {
    temperature: 0.3, // Lower temperature for more consistent results
    topK: 40,
    topP: 0.95,
    maxOutputTokens: 1024,
  }
});

// Log errors
function logError(message) {
  const timestamp = new Date().toISOString();
  fs.appendFileSync(ERROR_LOG_FILE, `[${timestamp}] ${message}\n`);
  console.error(`ERROR: ${message}`);
}

/**
 * Get real meanings for names using Gemini API
 */
async function getRealMeanings(names) {
  try {
    const prompt = `You are a name etymology expert. For each of these names, provide:
1. A short meaning (EXACTLY 2-4 words, no more)
2. Up to 3 different meanings/interpretations (each EXACTLY 5-10 words)

Use web search and your knowledge to find the REAL, accurate meanings of these names.
Consider etymology, cultural origins, and historical significance.

Names to analyze: ${names.join(', ')}

Return ONLY valid JSON in this exact format:
[
  {
    "name": "ExampleName",
    "meaningShort": "brave warrior",
    "meanings": [
      "brave warrior from ancient Germanic tradition",
      "protector of the people in battle",
      "strong defender with noble heart"
    ]
  }
]

IMPORTANT:
- Be precise and accurate with real etymological meanings
- meaningShort must be 2-4 words ONLY
- Each meaning in the array must be 5-10 words ONLY
- Include cultural/language origin when relevant
- If a name has multiple origins, include different interpretations`;

    console.log(`  Calling Gemini API for: ${names.join(', ')}`);

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Extract JSON from response
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      throw new Error('No valid JSON found in response');
    }

    const parsed = JSON.parse(jsonMatch[0]);

    // Validate and clean the response
    const results = {};
    for (const item of parsed) {
      if (item.name && item.meaningShort && item.meanings) {
        // Ensure meaningShort is 2-4 words
        const shortWords = item.meaningShort.split(' ').filter(w => w.length > 0);
        if (shortWords.length > 4) {
          item.meaningShort = shortWords.slice(0, 4).join(' ');
        }

        // Ensure each meaning is 5-10 words
        item.meanings = item.meanings.map(meaning => {
          const words = meaning.split(' ').filter(w => w.length > 0);
          if (words.length > 10) {
            return words.slice(0, 10).join(' ');
          } else if (words.length < 5) {
            return meaning + ' with deep significance';
          }
          return meaning;
        }).slice(0, 3); // Maximum 3 meanings

        results[item.name] = item;
      }
    }

    return results;

  } catch (error) {
    logError(`Gemini API error for names [${names.join(', ')}]: ${error.message}`);

    // Return empty results on error (will be retried later)
    const results = {};
    for (const name of names) {
      results[name] = null;
    }
    return results;
  }
}

/**
 * Process a batch of names
 */
async function processBatch(names, retryCount = 0) {
  const MAX_RETRIES = 3;

  try {
    const meanings = await getRealMeanings(names);

    // Check for any null results (failed names)
    const failedNames = names.filter(name => !meanings[name]);

    if (failedNames.length > 0 && retryCount < MAX_RETRIES) {
      console.log(`  Retrying ${failedNames.length} failed names...`);
      await new Promise(resolve => setTimeout(resolve, DELAY_MS));
      const retryMeanings = await processBatch(failedNames, retryCount + 1);

      // Merge retry results
      for (const name of failedNames) {
        if (retryMeanings[name]) {
          meanings[name] = retryMeanings[name];
        }
      }
    }

    return meanings;

  } catch (error) {
    logError(`Batch processing error: ${error.message}`);

    // Return empty results for this batch
    const results = {};
    for (const name of names) {
      results[name] = null;
    }
    return results;
  }
}

/**
 * Process a chunk file
 */
async function processChunk(chunkFile, progress) {
  console.log(`\nProcessing ${chunkFile}...`);

  const filePath = path.join('public', 'data', chunkFile);

  // Check if file exists
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

  // Process in batches
  for (let i = startIndex; i < names.length; i += BATCH_SIZE) {
    const batch = names.slice(i, Math.min(i + BATCH_SIZE, names.length));
    const batchNumber = Math.floor(i / BATCH_SIZE) + 1;
    const totalBatches = Math.ceil(names.length / BATCH_SIZE);

    console.log(`\nBatch ${batchNumber}/${totalBatches} (${batch.length} names)`);

    // Extract name strings
    const nameStrings = batch.map(n => n.name || n);

    // Get real meanings from Gemini
    const meanings = await processBatch(nameStrings);

    // Update names with meanings
    for (let j = 0; j < batch.length; j++) {
      const name = batch[j];
      const nameStr = name.name || name;
      const meaning = meanings[nameStr];

      if (typeof name === 'object') {
        if (meaning) {
          name.meaningShort = meaning.meaningShort;
          name.meaningFull = meaning.meanings[0]; // First meaning as full
          name.meanings = meaning.meanings;
          name.meaningProcessed = true;
          name.meaningProcessedAt = new Date().toISOString();
          name.meaningSource = 'gemini-2.0-flash';
          processedCount++;
          console.log(`  ✓ ${nameStr}: "${meaning.meaningShort}"`);
        } else {
          errorCount++;
          console.log(`  ✗ ${nameStr}: Failed to get meaning`);
        }
      }
    }

    // Save progress
    progress.currentChunk = chunkFile;
    progress.lastBatchIndex = i + BATCH_SIZE;
    progress.totalProcessed += processedCount;
    progress.totalErrors += errorCount;
    progress.lastUpdate = new Date().toISOString();

    // Save chunk after each batch (for safety)
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));

    // Save progress
    fs.writeFileSync(PROGRESS_FILE, JSON.stringify(progress, null, 2));

    console.log(`  Progress: ${processedCount} successful, ${errorCount} errors`);

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

  return { processedCount, errorCount };
}

/**
 * Main function
 */
async function main() {
  console.log('='.repeat(60));
  console.log('REAL MEANINGS PROCESSING SCRIPT');
  console.log('Using Gemini 2.0 Flash with Web Search');
  console.log('='.repeat(60));

  // Load or create progress
  let progress = {
    completedChunks: [],
    currentChunk: null,
    lastBatchIndex: 0,
    totalProcessed: 0,
    totalErrors: 0,
    startTime: new Date().toISOString(),
    lastUpdate: null
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
    'names-core.json',     // 945 names
    'names-chunk1.json',   // 29k names
    'names-chunk2.json',   // ~40k names
    'names-chunk3.json',   // ~60k names
    'names-chunk4.json'    // ~95k names
  ];

  let totalProcessed = 0;
  let totalErrors = 0;

  for (const chunk of chunks) {
    // Skip completed chunks
    if (progress.completedChunks.includes(chunk)) {
      console.log(`\nSkipping completed chunk: ${chunk}`);
      continue;
    }

    try {
      const result = await processChunk(chunk, progress);
      if (result) {
        totalProcessed += result.processedCount;
        totalErrors += result.errorCount;
      }
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
  console.log('='.repeat(60));

  // Clean up progress file on successful completion
  if (progress.completedChunks.length === chunks.length) {
    fs.unlinkSync(PROGRESS_FILE);
    console.log('\nProgress file cleaned up.');
  }
}

// Run the script
main().catch(error => {
  logError(`Unhandled error: ${error.message}`);
  console.error('FATAL ERROR:', error);
  process.exit(1);
});