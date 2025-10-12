#!/usr/bin/env node
/**
 * Re-enrich Modern Origin Names
 * Extracts all "Modern" or "Modern Invented" origin names and re-processes them
 * with improved prompts that dig deeper to find actual cultural origins
 */

const fs = require('fs');
const path = require('path');

// OpenAI API configuration
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';
const MODEL = 'gpt-4o-mini';

// Standard origins (excluding Modern)
const STANDARD_ORIGINS = [
  'Hebrew', 'Greek', 'Latin', 'Arabic', 'Germanic', 'Celtic', 'English',
  'French', 'Spanish', 'Italian', 'Irish', 'Scottish', 'Welsh', 'Norse',
  'Russian', 'Polish', 'Dutch', 'Portuguese', 'Indian', 'Japanese',
  'Chinese', 'Korean', 'Filipino', 'African', 'Persian', 'Turkish', 'Hawaiian',
  'Native-American', 'Biblical', 'Slavic'
];

// Country code to likely origin mapping
const COUNTRY_TO_ORIGIN = {
  'ES': 'Spanish',
  'MX': 'Spanish',
  'CO': 'Spanish',
  'AR': 'Spanish',
  'CL': 'Spanish',
  'PE': 'Spanish',
  'VE': 'Spanish',
  'EC': 'Spanish',
  'GT': 'Spanish',
  'CU': 'Spanish',
  'BO': 'Spanish',
  'DO': 'Spanish',
  'HN': 'Spanish',
  'PY': 'Spanish',
  'SV': 'Spanish',
  'NI': 'Spanish',
  'CR': 'Spanish',
  'PA': 'Spanish',
  'UY': 'Spanish',
  'PR': 'Spanish',
  'BR': 'Portuguese',
  'PT': 'Portuguese',
  'FR': 'French',
  'IT': 'Italian',
  'DE': 'Germanic',
  'GB': 'English',
  'US': 'English',
  'IE': 'Irish',
  'PH': 'Spanish', // Filipino names often Spanish-influenced
  'IN': 'Indian',
  'CN': 'Chinese',
  'JP': 'Japanese',
  'KR': 'Korean',
  'RU': 'Russian',
  'PL': 'Polish',
  'TR': 'Turkish',
  'IR': 'Persian',
  'SA': 'Arabic',
  'EG': 'Arabic',
  'AE': 'Arabic',
  'IL': 'Hebrew',
  'GR': 'Greek',
  'NG': 'African',
  'KE': 'African',
  'ZA': 'African',
  'GH': 'African',
  'ET': 'African'
};

// Batch processing settings
const BATCH_SIZE = 10;
const DELAY_BETWEEN_BATCHES = 1500; // 1.5 seconds

console.log('🔍 Re-enriching Modern Origin Names');
console.log('=' .repeat(70));

if (!OPENAI_API_KEY) {
  console.error('❌ OPENAI_API_KEY not found in environment');
  console.error('Please set: export OPENAI_API_KEY=your_key_here');
  process.exit(1);
}

/**
 * Load Modern origin names and unenriched names from chunk files
 */
function loadNamesToEnrich() {
  const chunkFiles = [
    'public/data/names-chunk1.json',
    'public/data/names-chunk-2.json',
    'public/data/names-chunk-3.json',
    'public/data/names-chunk-4.json'
  ];

  const modernNames = [];
  const unenrichedNames = [];

  chunkFiles.forEach((file, index) => {
    if (!fs.existsSync(file)) {
      console.log(`⚠️  Chunk ${index + 1} not found: ${file}`);
      return;
    }

    try {
      const content = fs.readFileSync(file, 'utf8');
      const data = JSON.parse(content);
      const names = data.names || data;

      if (!Array.isArray(names)) {
        console.log(`⚠️  Invalid format in ${file}`);
        return;
      }

      let modernCount = 0;
      let unenrichedCount = 0;

      names.forEach(name => {
        const nameObj = {
          ...name,
          sourceFile: file,
          sourceIndex: index
        };

        // Check if Modern origin
        const isModern = name.origin === 'Modern' ||
                        name.origin === 'Modern Invented' ||
                        (name.origin && name.origin.includes('Modern'));

        // Check if unenriched (no meaning or origin)
        const isUnenriched = !name.meaning ||
                            !name.origin ||
                            name.origin === 'Unknown' ||
                            name.meaning === 'Unknown';

        if (isModern) {
          modernNames.push(nameObj);
          modernCount++;
        } else if (isUnenriched) {
          unenrichedNames.push(nameObj);
          unenrichedCount++;
        }
      });

      console.log(`✓ Chunk ${index + 1}: Found ${modernCount} Modern, ${unenrichedCount} unenriched (of ${names.length} total)`);

    } catch (error) {
      console.error(`❌ Error loading ${file}:`, error.message);
    }
  });

  return { modernNames, unenrichedNames };
}

/**
 * Build enrichment prompt with country hints
 */
function buildBatchPrompt(names, countryHints) {
  const originsStr = STANDARD_ORIGINS.join(', ');

  const namesWithHints = names.map((name, i) =>
    countryHints[i] ? `${name} (${countryHints[i]})` : name
  );

  return `Analyze the following baby names. For EACH name, provide:
1. A concise, accurate meaning (1-4 words maximum, can be multiple meanings separated by semicolon)
2. The cultural origin(s) from this list: ${originsStr}
3. Optional brief cultural context (max 10 words)

CRITICAL INSTRUCTIONS:
- NEVER use "Modern" as an origin - dig deeper to find the real cultural root
- Analyze name structure, phonetics, etymology, and linguistic patterns
- If country code is provided (e.g., PR, CO, ES), use it as a strong hint
- Multiple origins are allowed if name has mixed heritage (e.g., "Spanish, Latin")
- Look for root words, suffixes, prefixes that reveal true origin
- Spanish/Portuguese variants often appear in Latin American countries (PR, CO, EC, MX, etc.)

Return a valid JSON array with EXACTLY ${names.length} objects, one for each name in the SAME ORDER.

Format as JSON array:
[
  {
    "name": "Daliangelis",
    "meaning": "angel's gift",
    "origin": "Spanish",
    "culturalContext": "Puerto Rican compound name"
  }
]

Names to analyze: ${namesWithHints.join(', ')}

IMPORTANT:
- Return EXACTLY ${names.length} objects
- Keep meanings concise (1-4 words, or multiple separated by semicolon)
- AVOID "Modern" - find the actual cultural origin
- Use country hints when provided
- Maintain the exact order of input names
- Return valid JSON only, no markdown or explanations`;
}

/**
 * Call OpenAI API for batch enrichment
 */
async function enrichBatch(nameObjects) {
  const names = nameObjects.map(n => n.name);
  const countryHints = nameObjects.map(n => n.primaryCountry || '');

  const prompt = buildBatchPrompt(names, countryHints);

  try {
    const response = await fetch(OPENAI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          {
            role: 'system',
            content: 'You are an expert in etymology and name meanings. Provide concise, accurate analysis of baby names in valid JSON format. NEVER use "Modern" as an origin - always find the real cultural root.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 1000
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`API error ${response.status}: ${JSON.stringify(errorData)}`);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;

    if (!content) {
      throw new Error('No content in API response');
    }

    // Parse JSON response
    let jsonStr = content.trim();
    const jsonMatch = jsonStr.match(/```(?:json)?\s*(\[[\s\S]*?\])\s*```/) ||
                     jsonStr.match(/(\[[\s\S]*\])/);

    if (jsonMatch) {
      jsonStr = jsonMatch[1];
    }

    const results = JSON.parse(jsonStr);

    if (!Array.isArray(results)) {
      throw new Error('Response is not an array');
    }

    return results;

  } catch (error) {
    console.error('❌ Batch enrichment error:', error.message);
    return null;
  }
}

/**
 * Process a list of names
 */
async function processNamesList(names, label) {
  console.log(`\n📊 ${label}: ${names.length} names`);
  console.log(`📦 Batch size: ${BATCH_SIZE}, Delay: ${DELAY_BETWEEN_BATCHES}ms\n`);

  const updates = [];
  let processedCount = 0;
  let errorCount = 0;

  for (let i = 0; i < names.length; i += BATCH_SIZE) {
    const batch = names.slice(i, i + BATCH_SIZE);
    const batchNum = Math.floor(i / BATCH_SIZE) + 1;
    const totalBatches = Math.ceil(names.length / BATCH_SIZE);

    console.log(`\n📦 Batch ${batchNum}/${totalBatches} (${batch.length} names)...`);

    const results = await enrichBatch(batch);

    if (results && results.length === batch.length) {
      batch.forEach((nameObj, index) => {
        const result = results[index];

        if (result && result.origin && result.meaning) {
          updates.push({
            name: nameObj.name,
            oldOrigin: nameObj.origin,
            newOrigin: result.origin,
            oldMeaning: nameObj.meaning,
            newMeaning: result.meaning,
            culturalContext: result.culturalContext,
            sourceFile: nameObj.sourceFile,
            primaryCountry: nameObj.primaryCountry
          });

          console.log(`  ✓ ${nameObj.name}: "${result.meaning}" (${result.origin}) [was: ${nameObj.origin || 'Unknown'}]`);
          processedCount++;
        } else {
          console.log(`  ⚠️  ${nameObj.name}: Incomplete result`);
          errorCount++;
        }
      });
    } else {
      console.log(`  ❌ Batch failed, skipping ${batch.length} names`);
      errorCount += batch.length;
    }

    // Delay between batches
    if (i + BATCH_SIZE < names.length) {
      console.log(`⏱️  Waiting ${DELAY_BETWEEN_BATCHES}ms...`);
      await new Promise(resolve => setTimeout(resolve, DELAY_BETWEEN_BATCHES));
    }
  }

  console.log(`\n${'='.repeat(70)}`);
  console.log(`\n✅ ${label} complete!`);
  console.log(`   Processed: ${processedCount}`);
  console.log(`   Errors: ${errorCount}`);
  console.log(`   Total: ${names.length}\n`);

  return updates;
}

/**
 * Process all names (Modern first, then unenriched)
 */
async function processAllNames() {
  const { modernNames, unenrichedNames } = loadNamesToEnrich();

  let allUpdates = [];

  // Process Modern names first
  if (modernNames.length > 0) {
    console.log(`\n🎯 PHASE 1: Re-enriching Modern origin names`);
    const modernUpdates = await processNamesList(modernNames, 'Modern names');
    allUpdates = allUpdates.concat(modernUpdates);

    // Save intermediate results
    const modernOutputFile = 'modern-names-updates.json';
    fs.writeFileSync(modernOutputFile, JSON.stringify(modernUpdates, null, 2));
    console.log(`💾 Modern names results saved to: ${modernOutputFile}\n`);
  }

  // Process unenriched names next
  if (unenrichedNames.length > 0) {
    console.log(`\n🎯 PHASE 2: Enriching unenriched names`);
    const unenrichedUpdates = await processNamesList(unenrichedNames, 'Unenriched names');
    allUpdates = allUpdates.concat(unenrichedUpdates);

    // Save unenriched results
    const unenrichedOutputFile = 'unenriched-names-updates.json';
    fs.writeFileSync(unenrichedOutputFile, JSON.stringify(unenrichedUpdates, null, 2));
    console.log(`💾 Unenriched names results saved to: ${unenrichedOutputFile}\n`);
  }

  // Save all results combined
  const allOutputFile = 'all-enrichment-updates.json';
  fs.writeFileSync(allOutputFile, JSON.stringify(allUpdates, null, 2));
  console.log(`\n💾 ALL results saved to: ${allOutputFile}`);
  console.log(`📊 Total enriched: ${allUpdates.length} names\n`);

  return allUpdates;
}

// Run the script
processAllNames().catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});
