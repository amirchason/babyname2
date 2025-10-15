require('dotenv').config();
const fs = require('fs');
const OpenAI = require('openai');
const axios = require('axios');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Progress tracking file
const PROGRESS_FILE = 'usa2024_enrichment_progress.json';
let progress = {
  lastBatchIndex: 0,
  totalProcessed: 0,
  totalAdded: 0,
  totalDuplicates: 0,
  totalErrors: 0,
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
    console.log(`  Total added: ${progress.totalAdded}`);
    console.log(`  Total duplicates: ${progress.totalDuplicates}`);
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

// Load existing database to check for duplicates
function loadExistingNames() {
  const existingNames = new Set();
  const chunkFiles = [
    'public/data/names-chunk1.json',
    'public/data/names-chunk2.json',
    'public/data/names-chunk3.json',
    'public/data/names-chunk4.json'
  ];

  for (const file of chunkFiles) {
    if (fs.existsSync(file)) {
      try {
        const data = JSON.parse(fs.readFileSync(file, 'utf8'));
        const names = data.names || data;
        names.forEach(name => {
          if (name.name) {
            existingNames.add(name.name.toLowerCase());
          }
        });
      } catch (e) {
        console.error(`Error reading ${file}:`, e.message);
      }
    }
  }

  console.log(`📊 Loaded ${existingNames.size} existing names from database`);
  return existingNames;
}

// Import SSA data fetcher
const { fetchSSATop5000 } = require('./fetchSSAData2024');

// Fetch top 5000 USA names from SSA data for 2024
async function fetchTop5000USA2024() {
  return await fetchSSATop5000(2024);
}

// Enrich names with GPT-4 Mini in batches (10 names per call)
async function enrichNamesBatch(namesBatch) {
  const prompt = `You are a baby name expert. For each of the following names, provide:
1. A concise meaning (maximum 4 words)
2. Primary origin (single word or short phrase like "Hebrew", "Latin", "Greek,Latin", etc.)
3. A rating score 1-10 based on popularity and timelessness

Respond ONLY with a JSON array in this exact format:
[
  {
    "name": "Name1",
    "meaning": "brief meaning",
    "origin": "Origin",
    "rating": 8
  },
  ...
]

Names to enrich:
${namesBatch.map((n, i) => `${i + 1}. ${n.name} (${n.gender})`).join('\n')}`;

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are a baby name etymology expert. Provide accurate, concise meanings and origins.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.3,
      max_tokens: 2000
    });

    const response = completion.choices[0].message.content;

    // Extract JSON from response
    const jsonMatch = response.match(/\[\s*{[\s\S]*}\s*\]/);
    if (!jsonMatch) {
      throw new Error('No JSON array found in response');
    }

    const enrichedData = JSON.parse(jsonMatch[0]);

    // Estimate cost (GPT-4o-mini: $0.15 per 1M input tokens, $0.60 per 1M output tokens)
    const inputTokens = completion.usage.prompt_tokens;
    const outputTokens = completion.usage.completion_tokens;
    const cost = (inputTokens / 1_000_000 * 0.15) + (outputTokens / 1_000_000 * 0.60);
    progress.estimatedCost += cost;

    return enrichedData;

  } catch (error) {
    console.error('❌ Batch enrichment error:', error.message);
    return null;
  }
}

// Add enriched names to database
function addNamesToDatabase(enrichedNames) {
  // Load chunk 1 (main chunk)
  const chunk1Path = 'public/data/names-chunk1.json';
  const chunk1Data = JSON.parse(fs.readFileSync(chunk1Path, 'utf8'));
  const allNames = chunk1Data.names || chunk1Data;

  // Get current max popularity value
  const currentMaxPopularity = Math.max(...allNames.map(n => n.popularity || 0));

  // Add new names with proper structure
  enrichedNames.forEach((enriched, idx) => {
    const newName = {
      name: enriched.name,
      gender: enriched.gender,
      origin: enriched.origin || 'American',
      meaning: enriched.meaning || 'Modern name',
      popularity: currentMaxPopularity + idx + 1, // Higher popularity = more popular
      rating: enriched.rating || 7,
      year: 2024,
      source: 'USA_SSA_2024',
      addedDate: new Date().toISOString(),
      meaningProcessed: true,
      originProcessed: true
    };
    allNames.push(newName);
  });

  // Save back to chunk1
  const outputData = { names: allNames };
  fs.writeFileSync(chunk1Path, JSON.stringify(outputData, null, 2));

  console.log(`✅ Added ${enrichedNames.length} new names to database`);
}

async function processTop5000Names() {
  console.log('============================================================');
  console.log('ADD TOP 5000 USA 2024 NAMES TO DATABASE');
  console.log('============================================================\n');

  // Step 1: Load existing names to check duplicates
  const existingNames = loadExistingNames();

  // Step 2: Fetch top 5000 USA names
  const top5000 = await fetchTop5000USA2024();

  // Step 3: Filter out duplicates
  const newNames = top5000.filter(name => {
    const isDuplicate = existingNames.has(name.name.toLowerCase());
    if (isDuplicate) {
      progress.totalDuplicates++;
    }
    return !isDuplicate;
  });

  console.log(`\n📊 Duplicate Analysis:`);
  console.log(`  Total fetched: ${top5000.length}`);
  console.log(`  Duplicates found: ${progress.totalDuplicates}`);
  console.log(`  New names to add: ${newNames.length}`);

  if (newNames.length === 0) {
    console.log('\n✅ All names already exist in database!');
    return;
  }

  console.log(`\n💰 Estimated enrichment cost: $${(newNames.length * 0.00005).toFixed(2)}`);
  console.log('⚡ Processing in batches of 10 names...\n');

  // Step 4: Enrich new names in batches
  const BATCH_SIZE = 10;
  const enrichedResults = [];

  for (let i = progress.lastBatchIndex; i < newNames.length; i += BATCH_SIZE) {
    const batch = newNames.slice(i, i + BATCH_SIZE);
    const batchNum = Math.floor(i / BATCH_SIZE) + 1;
    const totalBatches = Math.ceil(newNames.length / BATCH_SIZE);

    console.log(`\n📦 Processing batch ${batchNum}/${totalBatches} (${batch.length} names)...`);

    const enrichedBatch = await enrichNamesBatch(batch);

    if (enrichedBatch) {
      // Merge enriched data with original data
      batch.forEach((original, idx) => {
        const enriched = enrichedBatch.find(e => e.name === original.name) || {};
        enrichedResults.push({
          ...original,
          meaning: enriched.meaning || 'Modern American name',
          origin: enriched.origin || 'American',
          rating: enriched.rating || 7
        });
      });

      progress.totalProcessed += batch.length;
      progress.lastBatchIndex = i + BATCH_SIZE;
      saveProgress();

      console.log(`✅ Batch ${batchNum} enriched successfully`);
      console.log(`   Progress: ${progress.totalProcessed}/${newNames.length} names`);
      console.log(`   Cost so far: $${progress.estimatedCost.toFixed(4)}`);
    } else {
      progress.totalErrors += batch.length;
      console.error(`❌ Batch ${batchNum} failed`);
    }

    // Delay between batches to respect rate limits
    if (i + BATCH_SIZE < newNames.length) {
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }

  // Step 5: Add enriched names to database
  if (enrichedResults.length > 0) {
    addNamesToDatabase(enrichedResults);
    progress.totalAdded = enrichedResults.length;
    saveProgress();
  }

  // Final summary
  console.log('\n============================================================');
  console.log('ENRICHMENT COMPLETE');
  console.log('============================================================');
  console.log(`✅ Total names processed: ${progress.totalProcessed}`);
  console.log(`✅ Total names added: ${progress.totalAdded}`);
  console.log(`⚠️  Duplicates skipped: ${progress.totalDuplicates}`);
  console.log(`❌ Errors: ${progress.totalErrors}`);
  console.log(`💰 Total cost: $${progress.estimatedCost.toFixed(4)}`);
  console.log(`⏱️  Start time: ${progress.startTime}`);
  console.log(`⏱️  End time: ${new Date().toISOString()}`);
}

// Run the script
processTop5000Names()
  .then(() => {
    console.log('\n✨ Script completed successfully!');
    process.exit(0);
  })
  .catch(error => {
    console.error('\n❌ Script failed:', error);
    process.exit(1);
  });
