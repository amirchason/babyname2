/**
 * OPTIMIZED Batch Enrichment for 532 Missing Blog Names
 * - Uses GPT-4o-mini (10x cheaper than GPT-4)
 * - Batches 30 names per call (95% fewer API calls)
 * - Parallel processing (5 batches at once)
 * - Cost: ~$10-15 | Time: ~5-10 minutes
 */

const OpenAI = require('openai');
const fs = require('fs');
const path = require('path');

// Initialize OpenAI with API key from .env
require('dotenv').config();
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Configuration
const BATCH_SIZE = 30; // Names per API call
const PARALLEL_BATCHES = 5; // How many batches to process simultaneously
const DELAY_BETWEEN_BATCHES = 1000; // 1 second delay
const MAX_RETRIES = 3;

// Load missing names
const missingNamesPath = path.join(__dirname, 'blog-posts-seo', 'missing-names-to-create.json');
const missingData = JSON.parse(fs.readFileSync(missingNamesPath, 'utf-8'));
const missingNames = missingData.names; // Fixed: property is 'names' not 'missing_names'

console.log(`🚀 Starting optimized batch enrichment for ${missingNames.length} names`);
console.log(`📊 Configuration: ${BATCH_SIZE} names/batch, ${PARALLEL_BATCHES} parallel batches`);
console.log(`💰 Estimated cost: $10-15 | ⏱️  Estimated time: 5-10 minutes\n`);

// Progress tracking
let processedCount = 0;
let successCount = 0;
let errorCount = 0;
const enrichedNames = [];
const errors = [];

// Create enrichment prompt
function createBatchPrompt(namesList) {
  return `You are a baby name expert. Enrich these ${namesList.length} baby names with accurate data.

NAMES TO ENRICH:
${namesList.join(', ')}

REQUIREMENTS:
1. Return a JSON array with one object per name
2. Each object must have: name, gender, origin, meaning, popularity
3. Gender: "male", "female", or "unisex" (lowercase)
4. Origin: Be specific (e.g., "Hebrew", "Greek", "Irish", "Latin", "English", etc.)
5. Meaning: EXACTLY 4 words maximum (concise and poetic)
6. Popularity: "common", "moderate", or "rare"

EXAMPLE OUTPUT FORMAT:
[
  {
    "name": "Lucia",
    "gender": "female",
    "origin": "Latin",
    "meaning": "light bringer radiant one",
    "popularity": "common"
  },
  {
    "name": "Orion",
    "gender": "male",
    "origin": "Greek",
    "meaning": "mighty hunter constellation star",
    "popularity": "moderate"
  }
]

Return ONLY the JSON array, no additional text.`;
}

// Enrich a batch of names with GPT-4o-mini (with GPT-4 fallback for poor results)
async function enrichBatch(namesBatch, batchIndex, retryCount = 0) {
  try {
    console.log(`⚡ Batch ${batchIndex + 1}: Processing ${namesBatch.length} names...`);

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are a baby name expert who provides accurate, concise name data in JSON format.'
        },
        {
          role: 'user',
          content: createBatchPrompt(namesBatch)
        }
      ],
      temperature: 0.3, // Lower temperature for consistency
      max_tokens: 4000
    });

    const content = response.choices[0].message.content.trim();

    // Parse JSON (handle markdown code blocks if present)
    const jsonMatch = content.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      throw new Error('No JSON array found in response');
    }

    const enrichedBatch = JSON.parse(jsonMatch[0]);

    // Validate results
    if (enrichedBatch.length !== namesBatch.length) {
      console.warn(`⚠️  Batch ${batchIndex + 1}: Expected ${namesBatch.length} names, got ${enrichedBatch.length}`);
    }

    // Transform to database format
    const transformed = enrichedBatch.map(item => ({
      name: item.name,
      gender: item.gender.toLowerCase(),
      origin: item.origin,
      meaning: item.meaning,
      popularity: item.popularity || 'moderate',
      count: item.popularity === 'common' ? 5000 : item.popularity === 'rare' ? 100 : 1000,
      enriched: true,
      processingStatus: 'completed',
      source: 'blog-enrichment'
    }));

    // Validate enrichment quality - check for missing/poor data
    const poorQualityNames = transformed.filter(item =>
      !item.origin ||
      !item.meaning ||
      item.origin === 'Unknown' ||
      item.meaning.split(' ').length < 2 || // Less than 2 words is poor
      item.meaning === 'N/A' ||
      item.meaning.toLowerCase().includes('unknown')
    );

    // If any names have poor quality, re-enrich with GPT-4
    if (poorQualityNames.length > 0) {
      console.log(`🔄 Batch ${batchIndex + 1}: ${poorQualityNames.length} names need GPT-4 fallback`);
      const poorNames = poorQualityNames.map(item => item.name);
      const gpt4Enriched = await enrichWithGPT4(poorNames, batchIndex);

      // Replace poor quality entries with GPT-4 results
      gpt4Enriched.forEach(gpt4Item => {
        const index = transformed.findIndex(item => item.name === gpt4Item.name);
        if (index !== -1) {
          transformed[index] = { ...gpt4Item, source: 'blog-enrichment-gpt4' };
        }
      });

      console.log(`✨ Batch ${batchIndex + 1}: Improved ${gpt4Enriched.length} names with GPT-4`);
    }

    console.log(`✅ Batch ${batchIndex + 1}: Successfully enriched ${transformed.length} names`);
    return transformed;

  } catch (error) {
    if (retryCount < MAX_RETRIES) {
      console.log(`🔄 Batch ${batchIndex + 1}: Retry ${retryCount + 1}/${MAX_RETRIES} after error: ${error.message}`);
      await sleep(2000 * (retryCount + 1)); // Exponential backoff
      return enrichBatch(namesBatch, batchIndex, retryCount + 1);
    } else {
      console.error(`❌ Batch ${batchIndex + 1}: Failed after ${MAX_RETRIES} retries`);
      errors.push({ batch: batchIndex, names: namesBatch, error: error.message });
      return [];
    }
  }
}

// GPT-4 Fallback for poor quality enrichments
async function enrichWithGPT4(namesList, batchIndex) {
  try {
    console.log(`🧠 GPT-4 Fallback: Processing ${namesList.length} names with better intelligence...`);

    const response = await openai.chat.completions.create({
      model: 'gpt-4o', // Full GPT-4 for better accuracy
      messages: [
        {
          role: 'system',
          content: 'You are an expert baby name etymologist with deep knowledge of name origins, meanings, and cultural significance. Provide accurate, scholarly name data in JSON format.'
        },
        {
          role: 'user',
          content: createBatchPrompt(namesList)
        }
      ],
      temperature: 0.2, // Even lower temperature for maximum accuracy
      max_tokens: 3000
    });

    const content = response.choices[0].message.content.trim();
    const jsonMatch = content.match(/\[[\s\S]*\]/);

    if (!jsonMatch) {
      console.warn(`⚠️  GPT-4: No JSON found for ${namesList.length} names`);
      return [];
    }

    const enrichedBatch = JSON.parse(jsonMatch[0]);

    // Transform to database format
    const transformed = enrichedBatch.map(item => ({
      name: item.name,
      gender: item.gender.toLowerCase(),
      origin: item.origin,
      meaning: item.meaning,
      popularity: item.popularity || 'moderate',
      count: item.popularity === 'common' ? 5000 : item.popularity === 'rare' ? 100 : 1000,
      enriched: true,
      processingStatus: 'completed',
      source: 'blog-enrichment-gpt4'
    }));

    return transformed;
  } catch (error) {
    console.error(`❌ GPT-4 Fallback failed: ${error.message}`);
    return [];
  }
}

// Sleep utility
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Process all batches with parallel execution
async function processAllBatches() {
  // Split names into batches
  const batches = [];
  for (let i = 0; i < missingNames.length; i += BATCH_SIZE) {
    batches.push(missingNames.slice(i, i + BATCH_SIZE));
  }

  console.log(`📦 Created ${batches.length} batches of ${BATCH_SIZE} names each\n`);

  // Process batches in parallel groups
  for (let i = 0; i < batches.length; i += PARALLEL_BATCHES) {
    const parallelBatches = batches.slice(i, i + PARALLEL_BATCHES);
    const batchPromises = parallelBatches.map((batch, index) =>
      enrichBatch(batch, i + index)
    );

    console.log(`🔥 Processing batches ${i + 1}-${i + parallelBatches.length} in parallel...`);
    const results = await Promise.all(batchPromises);

    // Collect results
    results.forEach(result => {
      enrichedNames.push(...result);
      successCount += result.length;
    });

    processedCount += parallelBatches.reduce((sum, batch) => sum + batch.length, 0);

    console.log(`📊 Progress: ${processedCount}/${missingNames.length} (${Math.round(processedCount / missingNames.length * 100)}%)\n`);

    // Delay before next parallel group (except for last iteration)
    if (i + PARALLEL_BATCHES < batches.length) {
      await sleep(DELAY_BETWEEN_BATCHES);
    }
  }
}

// Save results
function saveResults() {
  const outputPath = path.join(__dirname, 'blog-posts-seo', 'enriched-blog-names.json');
  const errorPath = path.join(__dirname, 'blog-posts-seo', 'enrichment-errors.json');

  fs.writeFileSync(outputPath, JSON.stringify({
    timestamp: new Date().toISOString(),
    total_processed: processedCount,
    total_success: successCount,
    total_errors: errorCount,
    enriched_names: enrichedNames
  }, null, 2));

  if (errors.length > 0) {
    fs.writeFileSync(errorPath, JSON.stringify({
      timestamp: new Date().toISOString(),
      errors: errors
    }, null, 2));
  }

  console.log(`\n💾 Saved ${successCount} enriched names to: ${outputPath}`);
  if (errors.length > 0) {
    console.log(`⚠️  Saved ${errors.length} errors to: ${errorPath}`);
  }
}

// Main execution
async function main() {
  const startTime = Date.now();

  try {
    await processAllBatches();
    saveResults();

    const duration = Math.round((Date.now() - startTime) / 1000);
    const minutes = Math.floor(duration / 60);
    const seconds = duration % 60;

    console.log(`\n✨ ENRICHMENT COMPLETE!`);
    console.log(`⏱️  Time: ${minutes}m ${seconds}s`);
    console.log(`✅ Success: ${successCount} names`);
    console.log(`❌ Errors: ${errorCount} names`);
    console.log(`📈 Success rate: ${Math.round(successCount / processedCount * 100)}%`);

    if (errors.length > 0) {
      console.log(`\n⚠️  ${errors.length} batches had errors. Check enrichment-errors.json`);
    }

  } catch (error) {
    console.error(`\n💥 Fatal error: ${error.message}`);
    console.error(error.stack);
    saveResults(); // Save whatever we got
    process.exit(1);
  }
}

// Run it!
main();
