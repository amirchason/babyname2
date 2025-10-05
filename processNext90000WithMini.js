require('dotenv').config();
const fs = require('fs');
const OpenAI = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Progress tracking file
const PROGRESS_FILE = 'next90000_mini_progress.json';
let progress = {
  lastBatchIndex: 11000,
  totalProcessed: 0,
  totalErrors: 0,
  startTime: new Date().toISOString(),
  lastUpdate: new Date().toISOString(),
  model: 'gpt-4o-mini',
  estimatedCost: 0,
  stats: {
    singleMeaning: 0,
    twoMeanings: 0,
    threeMeanings: 0,
    singleOrigin: 0,
    multipleOrigins: 0
  }
};

// Load existing progress if available
if (fs.existsSync(PROGRESS_FILE)) {
  try {
    progress = JSON.parse(fs.readFileSync(PROGRESS_FILE, 'utf8'));
    console.log('Resuming from previous session:');
    console.log(`  Total processed: ${progress.totalProcessed}`);
    console.log(`  Total errors: ${progress.totalErrors}`);
    console.log(`  Resuming at index ${progress.lastBatchIndex}`);
    console.log(`  Estimated cost so far: $${progress.estimatedCost.toFixed(2)}`);
  } catch (e) {
    console.log('Could not load progress file, starting fresh');
  }
}

function saveProgress() {
  progress.lastUpdate = new Date().toISOString();
  fs.writeFileSync(PROGRESS_FILE, JSON.stringify(progress, null, 2));
}

// Load names from chunks
function loadAllNames() {
  const allNames = [];

  // Load from chunk 1 (already has 10,999 enriched)
  const chunk1Path = 'public/data/names-chunk1.json';
  if (fs.existsSync(chunk1Path)) {
    const data = JSON.parse(fs.readFileSync(chunk1Path, 'utf8'));
    const chunk1Names = data.names || data;
    allNames.push(...chunk1Names);
    console.log(`Loaded ${chunk1Names.length} names from names-chunk1.json`);
  }

  // Load from chunk 2
  const chunk2Path = 'public/data/names-chunk-2.json';
  if (fs.existsSync(chunk2Path)) {
    const chunk2 = JSON.parse(fs.readFileSync(chunk2Path, 'utf8'));
    allNames.push(...chunk2);
    console.log(`Loaded ${chunk2.length} names from names-chunk-2.json`);
  }

  // Load from chunk 3
  const chunk3Path = 'public/data/names-chunk-3.json';
  if (fs.existsSync(chunk3Path)) {
    const chunk3 = JSON.parse(fs.readFileSync(chunk3Path, 'utf8'));
    allNames.push(...chunk3);
    console.log(`Loaded ${chunk3.length} names from names-chunk-3.json`);
  }

  return allNames;
}

function saveToDatabase(names) {
  const outputPath = 'public/data/names-chunk2-enriched.json';
  fs.writeFileSync(outputPath, JSON.stringify(names, null, 2));
}

function countMeanings(meanings) {
  if (!meanings || !Array.isArray(meanings)) return 0;
  return meanings.length;
}

function countOrigins(origin) {
  if (!origin) return 0;
  if (Array.isArray(origin)) return origin.length;
  if (typeof origin === 'string' && origin.includes(',')) {
    return origin.split(',').length;
  }
  return 1;
}

async function enrichNamesWithMini(names, startIdx = 11000, endIdx = 100000) {
  const BATCH_SIZE = 10;
  const DELAY = 1500; // 1.5 seconds between batches

  console.log('============================================================');
  console.log('GPT-4O-MINI NEXT 90,000 NAMES PROCESSING');
  console.log('Processing names 11,000 to 100,000');
  console.log('💰 Using GPT-4o-mini - 48x cheaper than GPT-4-turbo!');
  console.log('============================================================\n');

  // Start from progress or specified start
  const resumeIdx = Math.max(progress.lastBatchIndex, startIdx);

  for (let i = resumeIdx; i < Math.min(endIdx, names.length); i += BATCH_SIZE) {
    const batch = [];
    const batchIndices = [];

    // Collect batch of names
    for (let j = i; j < Math.min(i + BATCH_SIZE, endIdx, names.length); j++) {
      if (names[j] && (!names[j].meaningProcessed || !names[j].originProcessed)) {
        batch.push(names[j].name);
        batchIndices.push(j);
      }
    }

    if (batch.length === 0) {
      continue;
    }

    const batchNumber = Math.floor((i - startIdx) / BATCH_SIZE) + 1;
    const totalBatches = Math.ceil((endIdx - startIdx) / BATCH_SIZE);

    console.log(`\nBatch ${batchNumber}/${totalBatches} (${batch.length} names)`);
    console.log(`Overall progress: ${i}/${endIdx} names`);
    console.log(`  Processing: ${batch.join(', ')}`);

    try {
      const prompt = `For each baby name, provide:
1. A concise, accurate meaning (max 10 words)
2. The cultural origin(s)
3. If the name has multiple distinct meanings, list up to 3

Format as JSON array with structure:
{
  "name": "Name",
  "meaning": "Primary meaning",
  "meanings": ["meaning1", "meaning2"],
  "origin": ["Origin1", "Origin2"]
}

Names to process: ${batch.join(', ')}

Important:
- Be historically and culturally accurate
- For invented/modern names, indicate "Modern invention" or "Contemporary"
- For names with unclear etymology, indicate "Unknown origin"
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
        if (batchIndices[idx] !== undefined) {
          const nameIndex = batchIndices[idx];

          // Update meanings
          if (result.meanings && result.meanings.length > 0) {
            names[nameIndex].meanings = result.meanings;
            names[nameIndex].meaningFull = result.meanings[0];
            names[nameIndex].meaning = result.meanings[0].substring(0, 50);

            // Update stats
            const meaningCount = result.meanings.length;
            if (meaningCount === 1) progress.stats.singleMeaning++;
            else if (meaningCount === 2) progress.stats.twoMeanings++;
            else if (meaningCount >= 3) progress.stats.threeMeanings++;
          } else if (result.meaning) {
            names[nameIndex].meaningFull = result.meaning;
            names[nameIndex].meaning = result.meaning.substring(0, 50);
            names[nameIndex].meanings = [result.meaning];
            progress.stats.singleMeaning++;
          }

          // Update origin
          if (result.origin) {
            names[nameIndex].origin = Array.isArray(result.origin) ? result.origin : [result.origin];
            names[nameIndex].originProcessed = true;

            // Update origin stats
            const originCount = countOrigins(result.origin);
            if (originCount === 1) progress.stats.singleOrigin++;
            else if (originCount > 1) progress.stats.multipleOrigins++;
          }

          names[nameIndex].meaningProcessed = true;
          names[nameIndex].lastEnriched = new Date().toISOString();
          names[nameIndex].enrichedWith = 'gpt-4o-mini';

          console.log(`  ✓ ${names[nameIndex].name}: "${result.meaning || result.meanings[0]}" (${Array.isArray(result.origin) ? result.origin.join(', ') : result.origin})`);
        }
      });

      progress.totalProcessed += batch.length;
      progress.lastBatchIndex = i + BATCH_SIZE;

      // Estimate cost (roughly $0.00005 per name with mini)
      progress.estimatedCost += batch.length * 0.00005;

    } catch (error) {
      console.error(`  ✗ Error processing batch:`, error.message);
      progress.totalErrors += batch.length;

      // Still update progress even on error
      progress.lastBatchIndex = i + BATCH_SIZE;

      if (error.message.includes('quota')) {
        console.log('\n💳 QUOTA EXCEEDED - Please add more credits to your OpenAI account');
        console.log('Visit: https://platform.openai.com/account/billing');
        console.log('You only need about $5 more to complete all names');
        break;
      }
    }

    // Save progress after each batch
    saveProgress();
    saveToDatabase(names);

    // Display progress
    const completed = progress.totalProcessed + progress.totalErrors;
    const remaining = endIdx - startIdx - completed;
    const estimatedMinutes = Math.ceil((remaining / BATCH_SIZE) * (DELAY / 60000));

    console.log(`  Progress: ${progress.totalProcessed} successful, ${progress.totalErrors} errors`);
    console.log(`  Stats: ${progress.stats.singleMeaning} single, ${progress.stats.twoMeanings} double, ${progress.stats.threeMeanings} triple meanings`);
    console.log(`  Cost so far: $${progress.estimatedCost.toFixed(3)}`);
    console.log(`  Estimated time remaining: ${estimatedMinutes} minutes`);

    // Delay before next batch
    if (i + BATCH_SIZE < Math.min(endIdx, names.length)) {
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

  return names;
}

// Main execution
async function main() {
  try {
    const allNames = loadAllNames();
    console.log(`\nTotal names loaded: ${allNames.length}`);
    console.log(`Processing names from index 11000 to 100000\n`);

    const enrichedNames = await enrichNamesWithMini(allNames, 11000, Math.min(100000, allNames.length));

    // Save final results
    saveToDatabase(enrichedNames);
    console.log('\nEnriched database saved to public/data/names-chunk2-enriched.json');

  } catch (error) {
    console.error('Fatal error:', error);
    process.exit(1);
  }
}

// Run the enrichment
main();