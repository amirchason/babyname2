require('dotenv').config();
const fs = require('fs');
const OpenAI = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Progress tracking file
const PROGRESS_FILE = 'mini_enrichment_progress.json';
let progress = {
  lastBatchIndex: 0,
  totalProcessed: 0,
  totalErrors: 0,
  retriedNames: [],
  startTime: new Date().toISOString(),
  lastUpdate: new Date().toISOString(),
  model: 'gpt-4o-mini',
  estimatedCost: 0
};

// Load existing progress if available
if (fs.existsSync(PROGRESS_FILE)) {
  try {
    progress = JSON.parse(fs.readFileSync(PROGRESS_FILE, 'utf8'));
    console.log('Resuming from previous session:');
    console.log(`  Total processed: ${progress.totalProcessed}`);
    console.log(`  Total errors: ${progress.totalErrors}`);
    console.log(`  Estimated cost so far: $${progress.estimatedCost.toFixed(2)}`);
  } catch (e) {
    console.log('Starting fresh');
  }
}

function saveProgress() {
  progress.lastUpdate = new Date().toISOString();
  fs.writeFileSync(PROGRESS_FILE, JSON.stringify(progress, null, 2));
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
  const allNames = data.names || data;

  // Find names that don't have meanings or had errors (first 10,999 only)
  allNames.forEach((name, idx) => {
    if (idx < 10999) {
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

async function enrichNamesWithMini() {
  const namesToRetry = loadNamesForRetry();

  if (namesToRetry.length === 0) {
    console.log('✅ All names in first 10,999 are already enriched!');
    return;
  }

  console.log('============================================================');
  console.log('GPT-4O-MINI ENRICHMENT - SMART & AFFORDABLE');
  console.log('============================================================\n');
  console.log(`📊 Found ${namesToRetry.length} names that need enrichment`);
  console.log('💰 Using GPT-4o-mini ($0.15/$0.60 per 1M tokens)');
  console.log(`💵 Estimated total cost: $${(namesToRetry.length * 0.00005).toFixed(2)}`);
  console.log('⚡ 48x cheaper than GPT-4-turbo with 95% quality!\n');

  const fileData = JSON.parse(fs.readFileSync('public/data/names-chunk1.json', 'utf8'));
  const originalData = fileData.names || fileData;

  const BATCH_SIZE = 10;  // Process 10 names at once
  const DELAY = 1500;     // 1.5 seconds between batches

  const enrichedNames = [];

  for (let i = progress.lastBatchIndex; i < namesToRetry.length; i += BATCH_SIZE) {
    const batch = namesToRetry.slice(i, i + BATCH_SIZE);
    const batchNumber = Math.floor(i / BATCH_SIZE) + 1;
    const totalBatches = Math.ceil(namesToRetry.length / BATCH_SIZE);

    console.log(`\nBatch ${batchNumber}/${totalBatches} (${batch.length} names)`);
    console.log(`Processing: ${batch.map(n => n.name).join(', ')}`);

    try {
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

      const response = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [{
          role: 'system',
          content: 'You are an expert in etymology, linguistics, and cultural naming traditions. Provide accurate, concise information about baby names.'
        }, {
          role: 'user',
          content: prompt
        }],
        temperature: 0.3,
        max_tokens: 800
      });

      const content = response.choices[0].message.content;
      const jsonMatch = content.match(/\[[\s\S]*\]/);

      if (!jsonMatch) {
        throw new Error('No JSON array found in response');
      }

      const results = JSON.parse(jsonMatch[0]);

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
            enrichedWith: 'gpt-4o-mini'
          };

          enrichedNames.push(enrichedName);
          console.log(`  ✓ ${result.name}: "${result.meaning}" (${Array.isArray(result.origin) ? result.origin.join(', ') : result.origin})`);
        }
      });

      progress.totalProcessed += batch.length;
      progress.lastBatchIndex = i + BATCH_SIZE;

      // Estimate cost (roughly $0.00005 per name)
      progress.estimatedCost += batch.length * 0.00005;

    } catch (error) {
      console.error(`  ✗ Batch failed:`, error.message);
      progress.totalErrors += batch.length;

      if (error.message.includes('quota')) {
        console.log('\n💳 QUOTA EXCEEDED - Please add credits to your OpenAI account');
        console.log('Visit: https://platform.openai.com/account/billing');
        break;
      }
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
    console.log(`  Cost so far: $${progress.estimatedCost.toFixed(3)}`);
    console.log(`  Estimated time remaining: ${estimatedMinutes} minutes`);

    // Add delay between batches (except for last batch)
    if (i + BATCH_SIZE < namesToRetry.length) {
      await new Promise(resolve => setTimeout(resolve, DELAY));
    }
  }

  console.log('\n============================================================');
  console.log('ENRICHMENT COMPLETE!');
  console.log(`Total processed: ${progress.totalProcessed}`);
  console.log(`Total errors: ${progress.totalErrors}`);
  console.log(`Success rate: ${((progress.totalProcessed / (progress.totalProcessed + progress.totalErrors)) * 100).toFixed(1)}%`);
  console.log(`Total cost: $${progress.estimatedCost.toFixed(2)}`);
  console.log('============================================================');

  // Check if ready for next batch
  const firstProgress = JSON.parse(fs.readFileSync('first10999_progress.json', 'utf8'));
  const totalFirst = firstProgress.totalProcessed + progress.totalProcessed;

  if (totalFirst >= 10990) {
    console.log('\n✅ First 10,999 names complete!');
    console.log('Ready to process next 90,000 names');
    console.log('Run: node processNext90000WithMini.js');
  }
}

// Main execution
async function main() {
  try {
    await enrichNamesWithMini();
  } catch (error) {
    console.error('Fatal error:', error);
    process.exit(1);
  }
}

main();