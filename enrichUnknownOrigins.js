require('dotenv').config();
const fs = require('fs');
const OpenAI = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Progress tracking
const PROGRESS_FILE = 'unknown_origins_progress.json';
let progress = {
  lastBatchIndex: 0,
  totalProcessed: 0,
  totalErrors: 0,
  categorized: {
    educatedGuess: 0,
    modern: 0,
    typo: 0,
    code: 0,
    regional: 0,
    hybrid: 0
  },
  startTime: new Date().toISOString(),
  lastUpdate: new Date().toISOString()
};

// Load existing progress if available
if (fs.existsSync(PROGRESS_FILE)) {
  try {
    progress = JSON.parse(fs.readFileSync(PROGRESS_FILE, 'utf8'));
    console.log('Resuming from previous session');
  } catch (e) {
    console.log('Starting fresh');
  }
}

function saveProgress() {
  progress.lastUpdate = new Date().toISOString();
  fs.writeFileSync(PROGRESS_FILE, JSON.stringify(progress, null, 2));
}

// Load names with unknown origins
function loadUnknownOriginNames() {
  const unknownNames = [];

  const chunk1Path = 'public/data/names-chunk1.json';
  if (!fs.existsSync(chunk1Path)) {
    console.error('Cannot find names-chunk1.json');
    return [];
  }

  const data = JSON.parse(fs.readFileSync(chunk1Path, 'utf8'));
  const allNames = data.names || data;

  allNames.forEach((name, idx) => {
    if (name.origin && name.originProcessed) {
      const origins = Array.isArray(name.origin) ? name.origin : [name.origin];
      if (origins.some(o => o && o.includes('Unknown'))) {
        unknownNames.push({ ...name, index: idx });
      }
    }
  });

  return unknownNames;
}

// Categorize name before sending to AI
function preCategorize(name) {
  const nameStr = name.name;

  // Check if it's a code/abbreviation (1-3 chars, all caps or contains numbers)
  if (nameStr.length <= 3 && (nameStr === nameStr.toUpperCase() || /\d/.test(nameStr))) {
    return 'code';
  }

  // Check for obvious modern inventions (contains unusual character combinations)
  if (/[0-9]/.test(nameStr) || /^[A-Z]{2,}$/.test(nameStr)) {
    return 'code';
  }

  // Check for double letters that might indicate typos
  if (/(.)\1{2,}/.test(nameStr)) {
    return 'possible_typo';
  }

  return null;
}

async function enrichBatchWithEducatedGuess(batch) {
  const prompt = `You are an expert etymologist. For these names with unknown origins, provide your BEST educated guess based on:
1. Similar sounding established names
2. Linguistic patterns and morphology
3. Common suffixes/prefixes from various cultures
4. Regional naming conventions

For each name, analyze:
- Phonetic similarity to known names
- Morphological components (prefixes, roots, suffixes)
- Possible cultural influences based on structure

BE PRECISE and CONSERVATIVE. If genuinely uncertain, indicate that.

For each name provide:
1. Most likely meaning (based on similar names or components)
2. Probable origin(s) (based on linguistic patterns)
3. Confidence level: "high", "medium", or "low"
4. Category: "variant" (of known name), "modern" (contemporary invention), "hybrid" (combination), "regional" (rare regional name), or "uncertain"

Format as JSON array:
[{
  "name": "Name",
  "meaning": "Probable meaning based on analysis",
  "origin": ["Most likely origin"],
  "confidence": "medium",
  "category": "variant",
  "reasoning": "Brief explanation"
}]

Names to analyze: ${batch.map(n => n.name).join(', ')}

Important:
- Base guesses on REAL linguistic patterns
- If name appears to be a typo, suggest the intended name
- For modern inventions, indicate "Contemporary" origin
- Be honest about confidence level`;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{
        role: 'system',
        content: 'You are an expert etymologist and linguist specializing in name origins. Provide educated, evidence-based analysis.'
      }, {
        role: 'user',
        content: prompt
      }],
      temperature: 0.3,
      max_tokens: 1000
    });

    const content = response.choices[0].message.content;
    const jsonMatch = content.match(/\[[\s\S]*\]/);

    if (!jsonMatch) {
      throw new Error('No JSON array found in response');
    }

    return JSON.parse(jsonMatch[0]);
  } catch (error) {
    console.error('Error in batch:', error.message);
    throw error;
  }
}

async function processUnknownOrigins() {
  const unknownNames = loadUnknownOriginNames();

  if (unknownNames.length === 0) {
    console.log('No names with unknown origins found!');
    return;
  }

  console.log('============================================================');
  console.log('RE-ENRICHING NAMES WITH UNKNOWN ORIGINS');
  console.log('============================================================');
  console.log(`📊 Found ${unknownNames.length} names to analyze`);
  console.log('🎯 Using educated guesses based on linguistic patterns\n');

  const fileData = JSON.parse(fs.readFileSync('public/data/names-chunk1.json', 'utf8'));
  const originalData = fileData.names || fileData;

  const BATCH_SIZE = 10;
  const DELAY = 1500;

  for (let i = progress.lastBatchIndex; i < unknownNames.length; i += BATCH_SIZE) {
    const batch = unknownNames.slice(i, Math.min(i + BATCH_SIZE, unknownNames.length));
    const batchNumber = Math.floor(i / BATCH_SIZE) + 1;
    const totalBatches = Math.ceil(unknownNames.length / BATCH_SIZE);

    console.log(`\nBatch ${batchNumber}/${totalBatches} (${batch.length} names)`);
    console.log(`Processing: ${batch.map(n => n.name).join(', ')}`);

    // Pre-categorize obvious cases
    const preCategories = batch.map(name => ({
      name: name.name,
      category: preCategorize(name)
    }));

    try {
      const results = await enrichBatchWithEducatedGuess(batch);

      results.forEach((result, idx) => {
        if (batch[idx]) {
          const nameIndex = batch[idx].index;
          const preCategory = preCategories[idx].category;

          // Determine final category and origin
          let finalOrigin = result.origin || ['Unknown'];
          let finalCategory = preCategory || result.category;
          let enrichmentFlag = 'educated_guess';

          // Handle different categories
          if (preCategory === 'code') {
            finalOrigin = ['Code/Abbreviation'];
            finalCategory = 'code';
            enrichmentFlag = 'categorized_code';
          } else if (result.category === 'variant' && result.confidence === 'high') {
            enrichmentFlag = 'variant_identified';
          } else if (result.category === 'modern') {
            finalOrigin = ['Contemporary'];
            finalCategory = 'modern';
            enrichmentFlag = 'modern_invention';
          } else if (result.category === 'hybrid') {
            finalCategory = 'hybrid';
            enrichmentFlag = 'hybrid_name';
          }

          // Update the name data
          originalData[nameIndex] = {
            ...originalData[nameIndex],
            origin: finalOrigin,
            meanings: result.meaning ? [result.meaning] : originalData[nameIndex].meanings,
            meaningFull: result.meaning || originalData[nameIndex].meaningFull,
            enrichmentFlag: enrichmentFlag,
            enrichmentCategory: finalCategory,
            enrichmentConfidence: result.confidence || 'low',
            enrichmentReasoning: result.reasoning,
            lastEnriched: new Date().toISOString(),
            enrichedWith: 'gpt-4o-mini-educated-guess'
          };

          // Don't add visible flags - these are for internal use only
          // The UI won't show enrichmentFlag or enrichmentCategory

          console.log(`  ✓ ${result.name}:`);
          console.log(`    Origin: ${finalOrigin.join(', ')} (${result.confidence || 'low'} confidence)`);
          console.log(`    Category: ${finalCategory}`);
          if (result.reasoning) {
            console.log(`    Reasoning: ${result.reasoning.substring(0, 60)}...`);
          }

          // Update statistics
          progress.categorized[finalCategory] = (progress.categorized[finalCategory] || 0) + 1;
        }
      });

      progress.totalProcessed += batch.length;
      progress.lastBatchIndex = i + BATCH_SIZE;

    } catch (error) {
      console.error(`  ✗ Batch failed:`, error.message);
      progress.totalErrors += batch.length;
      progress.lastBatchIndex = i + BATCH_SIZE;

      if (error.message.includes('quota')) {
        console.log('\n💳 Quota exceeded. Saving progress...');
        break;
      }
    }

    // Save progress after each batch
    saveProgress();

    // Save to database periodically
    if ((i + BATCH_SIZE) % 50 === 0 || i + BATCH_SIZE >= unknownNames.length) {
      const outputPath = 'public/data/names-chunk1.json';
      const outputData = { names: originalData };
      fs.writeFileSync(outputPath, JSON.stringify(outputData, null, 2));
      console.log(`  💾 Saved progress to database`);
    }

    // Progress display
    const completed = progress.totalProcessed + progress.totalErrors;
    const remaining = unknownNames.length - completed;
    console.log(`  Progress: ${progress.totalProcessed} successful, ${progress.totalErrors} errors`);
    console.log(`  Categories: ${JSON.stringify(progress.categorized)}`);
    console.log(`  Remaining: ${remaining} names`);

    // Delay before next batch
    if (i + BATCH_SIZE < unknownNames.length) {
      await new Promise(resolve => setTimeout(resolve, DELAY));
    }
  }

  // Final save
  const outputPath = 'public/data/names-chunk1.json';
  const outputData = { names: originalData };
  fs.writeFileSync(outputPath, JSON.stringify(outputData, null, 2));

  console.log('\n============================================================');
  console.log('RE-ENRICHMENT COMPLETE!');
  console.log(`Total processed: ${progress.totalProcessed}`);
  console.log(`Total errors: ${progress.totalErrors}`);
  console.log('\nCategorization breakdown:');
  console.log(`  Educated guesses: ${progress.categorized.educatedGuess || 0}`);
  console.log(`  Modern inventions: ${progress.categorized.modern || 0}`);
  console.log(`  Possible typos: ${progress.categorized.typo || 0}`);
  console.log(`  Codes/Abbreviations: ${progress.categorized.code || 0}`);
  console.log(`  Regional names: ${progress.categorized.regional || 0}`);
  console.log(`  Hybrid names: ${progress.categorized.hybrid || 0}`);
  console.log('============================================================');
}

// Main execution
async function main() {
  try {
    await processUnknownOrigins();
  } catch (error) {
    console.error('Fatal error:', error);
    process.exit(1);
  }
}

main();