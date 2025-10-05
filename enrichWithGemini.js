require('dotenv').config();
const fs = require('fs');
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize Gemini with Flash model (cheaper and faster)
const genAI = new GoogleGenerativeAI(process.env.REACT_APP_GEMINI_API_KEY);
const model = genAI.getGenerativeModel({
  model: 'gemini-1.5-flash',  // Much faster and cheaper than GPT-4
  generationConfig: {
    temperature: 0.3,
    maxOutputTokens: 800,
  }
});

// Progress tracking files
const FIRST_PROGRESS_FILE = 'first10999_progress.json';
const RETRY_PROGRESS_FILE = 'gemini_retry_progress.json';

let progress = {
  lastBatchIndex: 0,
  totalProcessed: 0,
  totalErrors: 0,
  retriedNames: [],
  startTime: new Date().toISOString(),
  lastUpdate: new Date().toISOString()
};

// Load existing progress
if (fs.existsSync(RETRY_PROGRESS_FILE)) {
  try {
    progress = JSON.parse(fs.readFileSync(RETRY_PROGRESS_FILE, 'utf8'));
    console.log('Resuming from previous session');
  } catch (e) {
    console.log('Starting fresh');
  }
}

function saveProgress() {
  progress.lastUpdate = new Date().toISOString();
  fs.writeFileSync(RETRY_PROGRESS_FILE, JSON.stringify(progress, null, 2));
}

// Load names that need enrichment
function loadNamesForRetry() {
  const namesToRetry = [];

  // Load the main database
  const chunk1Path = 'public/data/names-chunk1.json';
  if (!fs.existsSync(chunk1Path)) {
    console.error('Cannot find names-chunk1.json');
    return [];
  }

  const data = JSON.parse(fs.readFileSync(chunk1Path, 'utf8'));
  const allNames = data.names || data;  // Handle both formats

  // Find names that don't have meanings or had errors
  allNames.forEach((name, idx) => {
    if (idx < 10999) {  // Only process first 10,999
      if (!name.meaningProcessed || !name.originProcessed || !name.meanings) {
        namesToRetry.push({ ...name, index: idx });
      }
    }
  });

  return namesToRetry;
}

// Save enriched data back to database
function saveToDatabase(enrichedNames, originalData) {
  // Update the original data with enriched info
  enrichedNames.forEach(enriched => {
    if (enriched.index !== undefined) {
      originalData[enriched.index] = { ...originalData[enriched.index], ...enriched };
    }
  });

  // Save back to file in the original format
  const outputPath = 'public/data/names-chunk1.json';
  const outputData = { names: originalData };
  fs.writeFileSync(outputPath, JSON.stringify(outputData, null, 2));
  console.log(`✅ Saved ${enrichedNames.length} enriched names to database`);
}

async function enrichBatch(batch) {
  const prompt = `Analyze these baby names and provide their meanings and cultural origins.

For each name, provide:
1. A concise, accurate meaning (max 10 words)
2. The cultural origin(s)
3. If the name has multiple distinct meanings, list up to 3

Format as JSON array:
[{
  "name": "Name",
  "meaning": "Primary meaning",
  "meanings": ["meaning1", "meaning2"],
  "origin": ["Origin1", "Origin2"]
}]

Names to analyze: ${batch.map(n => n.name).join(', ')}

Important:
- Be historically and culturally accurate
- For modern names, indicate "Modern" or "Contemporary"
- For unclear etymology, indicate "Unknown"
- Keep meanings concise but meaningful`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Extract JSON from response
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      throw new Error('No JSON array found in response');
    }

    return JSON.parse(jsonMatch[0]);
  } catch (error) {
    console.error('Error in batch:', error.message);
    throw error;
  }
}

async function processRetries() {
  const namesToRetry = loadNamesForRetry();

  if (namesToRetry.length === 0) {
    console.log('No names need retry!');
    return;
  }

  console.log('============================================================');
  console.log('GEMINI FLASH ENRICHMENT - RETRY FAILED NAMES');
  console.log(`Found ${namesToRetry.length} names that need enrichment`);
  console.log('Using Gemini 1.5 Flash (faster & cheaper than GPT-4)');
  console.log('============================================================\n');

  const fileData = JSON.parse(fs.readFileSync('public/data/names-chunk1.json', 'utf8'));
  const originalData = fileData.names || fileData;
  const BATCH_SIZE = 10;  // Larger batches since Gemini Flash is faster
  const DELAY = 1000;     // Only 1 second delay needed

  const enrichedNames = [];

  for (let i = 0; i < namesToRetry.length; i += BATCH_SIZE) {
    const batch = namesToRetry.slice(i, i + BATCH_SIZE);
    const batchNumber = Math.floor(i / BATCH_SIZE) + 1;
    const totalBatches = Math.ceil(namesToRetry.length / BATCH_SIZE);

    console.log(`\nBatch ${batchNumber}/${totalBatches} (${batch.length} names)`);
    console.log(`Processing: ${batch.map(n => n.name).join(', ')}`);

    try {
      const results = await enrichBatch(batch);

      // Update names with enriched data
      results.forEach((result, idx) => {
        if (batch[idx]) {
          const enrichedName = {
            ...batch[idx],
            meanings: result.meanings || [result.meaning],
            meaningFull: result.meanings?.[0] || result.meaning,
            meaning: (result.meanings?.[0] || result.meaning || '').substring(0, 50),
            origin: Array.isArray(result.origin) ? result.origin : [result.origin],
            meaningProcessed: true,
            originProcessed: true,
            lastEnriched: new Date().toISOString(),
            enrichedWith: 'gemini-flash'
          };

          enrichedNames.push(enrichedName);
          console.log(`  ✓ ${result.name}: "${result.meaning}" (${Array.isArray(result.origin) ? result.origin.join(', ') : result.origin})`);
        }
      });

      progress.totalProcessed += batch.length;
      progress.retriedNames.push(...batch.map(n => n.name));

    } catch (error) {
      console.error(`  ✗ Batch failed:`, error.message);
      progress.totalErrors += batch.length;
    }

    // Save progress after each batch
    saveProgress();

    // Save enriched names periodically
    if (enrichedNames.length >= 50 || i + BATCH_SIZE >= namesToRetry.length) {
      saveToDatabase(enrichedNames, originalData);
      enrichedNames.length = 0;  // Clear array after saving
    }

    // Progress stats
    const completed = progress.totalProcessed + progress.totalErrors;
    const remaining = namesToRetry.length - completed;
    const estimatedMinutes = Math.ceil((remaining / BATCH_SIZE) * (DELAY / 60000));

    console.log(`  Progress: ${progress.totalProcessed} successful, ${progress.totalErrors} errors`);
    console.log(`  Estimated time remaining: ${estimatedMinutes} minutes`);

    // Add delay between batches (except for last batch)
    if (i + BATCH_SIZE < namesToRetry.length) {
      await new Promise(resolve => setTimeout(resolve, DELAY));
    }
  }

  console.log('\n============================================================');
  console.log('RETRY ENRICHMENT COMPLETE!');
  console.log(`Total processed: ${progress.totalProcessed}`);
  console.log(`Total errors: ${progress.totalErrors}`);
  console.log(`Success rate: ${((progress.totalProcessed / (progress.totalProcessed + progress.totalErrors)) * 100).toFixed(1)}%`);
  console.log('============================================================');
}

// Check if we should continue with next 90,000 after retries
async function checkAndContinue() {
  const firstProgress = JSON.parse(fs.readFileSync(FIRST_PROGRESS_FILE, 'utf8'));
  const totalFirst = firstProgress.totalProcessed + firstProgress.totalErrors + progress.totalProcessed;

  if (totalFirst >= 10990) {
    console.log('\n✅ First 10,999 names complete with retries!');
    console.log('Ready to process next 90,000 names');

    // You can uncomment this to auto-start next batch:
    // const { spawn } = require('child_process');
    // spawn('node', ['processNext90000WithGemini.js'], { stdio: 'inherit', detached: true });
  }
}

// Main execution
async function main() {
  try {
    await processRetries();
    await checkAndContinue();
  } catch (error) {
    console.error('Fatal error:', error);
    process.exit(1);
  }
}

main();