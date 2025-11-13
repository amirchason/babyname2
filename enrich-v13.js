#!/usr/bin/env node

/**
 * 🚀 V13 ENRICHMENT SCRIPT
 *
 * Enriches top 100 popular baby names with v13 enhanced data
 *
 * Features:
 * - Loads existing v10 data and merges with new v13 fields
 * - Uses OpenAI GPT-4o for high-quality content generation
 * - Progress tracking with resume capability
 * - Rate limiting to avoid API throttling
 * - Comprehensive error handling
 *
 * Usage:
 *   node enrich-v13.js                    # Start from beginning
 *   node enrich-v13.js --resume           # Resume from last position
 *   node enrich-v13.js --start=10 --end=20  # Enrich names 10-20
 *   node enrich-v13.js --test             # Test mode (3 names only)
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

require('dotenv').config();

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

if (!OPENAI_API_KEY) {
  console.error('❌ OPENAI_API_KEY not found in .env file!');
  console.error('Please create a .env file with your OpenAI API key:');
  console.error('OPENAI_API_KEY=sk-...');
  process.exit(1);
}

// Configuration
const CONFIG = {
  dataDir: path.join(__dirname, 'data'),
  enrichedDir: path.join(__dirname, 'data', 'enriched'),
  progressFile: path.join(__dirname, 'v13-progress.json'),
  topNamesFile: path.join(__dirname, 'data', 'ultimateNames_tier1.json'),
  delayBetweenRequests: 5000, // 5 seconds to avoid rate limits
  model: 'gpt-4o', // High quality model
  maxRetries: 3
};

// Parse command line arguments
const args = process.argv.slice(2);
const flags = {
  resume: args.includes('--resume'),
  test: args.includes('--test'),
  start: parseInt(args.find(a => a.startsWith('--start='))?.split('=')[1]) || 0,
  end: parseInt(args.find(a => a.startsWith('--end='))?.split('=')[1]) || 100
};

if (flags.test) {
  flags.end = 3; // Only test 3 names
  console.log('🧪 TEST MODE: Processing only 3 names');
}

//===========================================
// PROGRESS TRACKING
//===========================================

function loadProgress() {
  if (fs.existsSync(CONFIG.progressFile)) {
    return JSON.parse(fs.readFileSync(CONFIG.progressFile, 'utf8'));
  }
  return {
    startedAt: new Date().toISOString(),
    lastUpdated: new Date().toISOString(),
    totalNames: 100,
    completedNames: 0,
    failedNames: [],
    currentName: '',
    completedList: []
  };
}

function saveProgress(progress) {
  progress.lastUpdated = new Date().toISOString();
  fs.writeFileSync(CONFIG.progressFile, JSON.stringify(progress, null, 2));
}

//===========================================
// DATA LOADING
//===========================================

function loadTop100Names() {
  console.log('📂 Loading top 100 names...');
  const data = JSON.parse(fs.readFileSync(CONFIG.topNamesFile, 'utf8'));
  const names = data.names.slice(0, 100).map(n => ({
    name: n.n,
    gender: n.g,
    origin: n.o,
    rank: n.r
  }));
  console.log(`✅ Loaded ${names.length} names`);
  return names;
}

function loadExistingEnrichment(name) {
  // Try v10 first
  const v10Path = path.join(CONFIG.enrichedDir, `${name.toLowerCase()}-v10.json`);
  if (fs.existsSync(v10Path)) {
    return JSON.parse(fs.readFileSync(v10Path, 'utf8'));
  }

  // Try other versions
  for (let v = 9; v >= 3; v--) {
    const vPath = path.join(CONFIG.enrichedDir, `${name.toLowerCase()}-v${v}.json`);
    if (fs.existsSync(vPath)) {
      return JSON.parse(fs.readFileSync(vPath, 'utf8'));
    }
  }

  return null;
}

//===========================================
// OPENAI API
//===========================================

function callOpenAI(prompt) {
  return new Promise((resolve, reject) => {
    const requestBody = JSON.stringify({
      model: CONFIG.model,
      messages: [
        {
          role: 'system',
          content: 'You are an expert baby name consultant and cultural researcher. You provide detailed, accurate, and engaging information about baby names. Always return valid JSON.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 3000
    });

    const options = {
      hostname: 'api.openai.com',
      port: 443,
      path: '/v1/chat/completions',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Length': Buffer.byteLength(requestBody)
      }
    };

    const req = https.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        if (res.statusCode === 200) {
          try {
            const response = JSON.parse(data);
            resolve(response.choices[0].message.content);
          } catch (error) {
            reject(new Error(`Failed to parse OpenAI response: ${error.message}`));
          }
        } else {
          reject(new Error(`OpenAI API error ${res.statusCode}: ${data}`));
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.write(requestBody);
    req.end();
  });
}

//===========================================
// V13 ENRICHMENT PROMPT
//===========================================

function buildV13Prompt(nameInfo, existingData) {
  const existingContext = existingData ? `

EXISTING DATA (v10) FOR CONTEXT:
${JSON.stringify(existingData, null, 2)}

Use this data as reference but generate entirely NEW v13 fields.
` : '';

  return `Generate v13 enrichment data for the baby name "${nameInfo.name}".

IMPORTANT: Return ONLY a valid JSON object with the following NEW v13 fields. Do not include any markdown formatting, code blocks, or explanations.
${existingContext}

Generate these NEW v13 FIELDS (return as a clean JSON object):

{
  "nameVibes": {
    "modernTrendScore": <0-100, how modern/trendy>,
    "classicTimelessScore": <0-100, how classic/timeless>,
    "uniquenessScore": <0-100, how unique vs common>,
    "internationalAppeal": <0-100, works well globally>,
    "primaryVibe": "<e.g., 'Elegant', 'Strong', 'Friendly', 'Sophisticated'>"
  },
  "namingTrends": {
    "decadePopularity": [
      {"decade": "1950s", "rank": <estimated rank>, "trend": "rising/stable/declining"},
      {"decade": "1960s", "rank": <estimated rank>, "trend": "rising/stable/declining"},
      {"decade": "1970s", "rank": <estimated rank>, "trend": "rising/stable/declining"},
      {"decade": "1980s", "rank": <estimated rank>, "trend": "rising/stable/declining"},
      {"decade": "1990s", "rank": <estimated rank>, "trend": "rising/stable/declining"},
      {"decade": "2000s", "rank": <estimated rank>, "trend": "rising/stable/declining"},
      {"decade": "2010s", "rank": <estimated rank>, "trend": "rising/stable/declining"},
      {"decade": "2020s", "rank": <estimated rank>, "trend": "rising/stable/declining"}
    ],
    "overallTrend": "rising/stable/declining",
    "peakDecade": "<e.g., '1990s'>",
    "projectedTrend2025": "<short description of future trend>"
  },
  "soundAndFeel": {
    "soundDescription": "<e.g., 'soft and melodic', 'sharp and powerful'>",
    "mouthFeel": "<how it feels to say the name>",
    "voiceAssociation": "<e.g., 'warm', 'authoritative', 'playful'>",
    "rhythm": "<e.g., 'flowing', 'staccato', 'balanced'>"
  },
  "siblingNames": {
    "perfectMatches": [
      {"name": "<sibling name 1>", "reason": "<why it pairs well>"},
      {"name": "<sibling name 2>", "reason": "<why it pairs well>"},
      {"name": "<sibling name 3>", "reason": "<why it pairs well>"},
      {"name": "<sibling name 4>", "reason": "<why it pairs well>"},
      {"name": "<sibling name 5>", "reason": "<why it pairs well>"},
      {"name": "<sibling name 6>", "reason": "<why it pairs well>"},
      {"name": "<sibling name 7>", "reason": "<why it pairs well>"},
      {"name": "<sibling name 8>", "reason": "<why it pairs well>"},
      {"name": "<sibling name 9>", "reason": "<why it pairs well>"},
      {"name": "<sibling name 10>", "reason": "<why it pairs well>"}
    ],
    "twinPairs": [
      {"pairing": "<Twin 1 & Twin 2>", "style": "<e.g., 'classic duo', 'modern match'>"},
      {"pairing": "<Twin 1 & Twin 2>", "style": "<e.g., 'classic duo', 'modern match'>"},
      {"pairing": "<Twin 1 & Twin 2>", "style": "<e.g., 'classic duo', 'modern match'>"},
      {"pairing": "<Twin 1 & Twin 2>", "style": "<e.g., 'classic duo', 'modern match'>"},
      {"pairing": "<Twin 1 & Twin 2>", "style": "<e.g., 'classic duo', 'modern match'>"}
    ]
  },
  "middleNameSuggestions": [
    {"middleName": "<name 1>", "flowScore": <0-100>, "reasoning": "<why it flows well>"},
    {"middleName": "<name 2>", "flowScore": <0-100>, "reasoning": "<why it flows well>"},
    {"middleName": "<name 3>", "flowScore": <0-100>, "reasoning": "<why it flows well>"},
    {"middleName": "<name 4>", "flowScore": <0-100>, "reasoning": "<why it flows well>"},
    {"middleName": "<name 5>", "flowScore": <0-100>, "reasoning": "<why it flows well>"},
    {"middleName": "<name 6>", "flowScore": <0-100>, "reasoning": "<why it flows well>"},
    {"middleName": "<name 7>", "flowScore": <0-100>, "reasoning": "<why it flows well>"},
    {"middleName": "<name 8>", "flowScore": <0-100>, "reasoning": "<why it flows well>"},
    {"middleName": "<name 9>", "flowScore": <0-100>, "reasoning": "<why it flows well>"},
    {"middleName": "<name 10>", "flowScore": <0-100>, "reasoning": "<why it flows well>"}
  ],
  "realParentReviews": [
    {"parentName": "<First name only>", "reviewText": "<Realistic 2-3 sentence review>", "rating": <1-5>, "year": <2015-2024>, "location": "<City, State/Country>"},
    {"parentName": "<First name only>", "reviewText": "<Realistic 2-3 sentence review>", "rating": <1-5>, "year": <2015-2024>, "location": "<City, State/Country>"},
    {"parentName": "<First name only>", "reviewText": "<Realistic 2-3 sentence review>", "rating": <1-5>, "year": <2015-2024>, "location": "<City, State/Country>"},
    {"parentName": "<First name only>", "reviewText": "<Realistic 2-3 sentence review>", "rating": <1-5>, "year": <2015-2024>, "location": "<City, State/Country>"},
    {"parentName": "<First name only>", "reviewText": "<Realistic 2-3 sentence review>", "rating": <1-5>, "year": <2015-2024>, "location": "<City, State/Country>"}
  ],
  "professionalImpression": {
    "businessWorldScore": <0-100>,
    "creativeFieldScore": <0-100>,
    "academicScore": <0-100>,
    "athleticsScore": <0-100>,
    "overallImpression": "<2-3 sentences about professional perception>"
  },
  "socialMediaPresence": {
    "hashtagPopularity": <estimated number of Instagram posts>,
    "instagrammability": <0-100>,
    "trendingStatus": "<viral/trending/popular/moderate/niche>"
  },
  "ageAssociation": {
    "babyFitScore": <0-100>,
    "childFitScore": <0-100>,
    "teenFitScore": <0-100>,
    "adultFitScore": <0-100>,
    "seniorFitScore": <0-100>,
    "bestLifeStage": "<baby/child/teen/adult/senior/all ages>"
  }
}

CRITICAL: Return ONLY the JSON object above, with NO markdown formatting, NO code blocks (no \`\`\`json), NO explanatory text. Just pure JSON starting with { and ending with }.`;
}

//===========================================
// ENRICHMENT LOGIC
//===========================================

async function enrichName(nameInfo, progress) {
  const startTime = Date.now();
  console.log(`\n${'='.repeat(60)}`);
  console.log(`🎯 Enriching: ${nameInfo.name} (Rank #${nameInfo.rank})`);
  console.log(`${'='.repeat(60)}`);

  // Check if already enriched
  const v13Path = path.join(CONFIG.enrichedDir, `${nameInfo.name.toLowerCase()}-v13.json`);
  if (fs.existsSync(v13Path) && !flags.test) {
    console.log(`⏭️  Already enriched, skipping...`);
    return { success: true, skipped: true };
  }

  try {
    // Load existing enrichment
    console.log(`📂 Loading existing enrichment data...`);
    const existingData = loadExistingEnrichment(nameInfo.name);
    if (existingData) {
      console.log(`✅ Found v${existingData.enrichmentVersion || '?'} data`);
    } else {
      console.log(`⚠️  No existing enrichment found`);
    }

    // Build prompt
    const prompt = buildV13Prompt(nameInfo, existingData);

    // Call OpenAI with retries
    console.log(`🤖 Calling OpenAI API (${CONFIG.model})...`);
    let v13Data = null;
    let lastError = null;

    for (let attempt = 1; attempt <= CONFIG.maxRetries; attempt++) {
      try {
        const response = await callOpenAI(prompt);

        // Parse JSON response (handle potential markdown wrapping)
        let jsonStr = response.trim();
        if (jsonStr.startsWith('```json')) {
          jsonStr = jsonStr.replace(/```json\n?/g, '').replace(/```\n?$/g, '');
        } else if (jsonStr.startsWith('```')) {
          jsonStr = jsonStr.replace(/```\n?/g, '');
        }

        v13Data = JSON.parse(jsonStr);
        console.log(`✅ API call successful (attempt ${attempt}/${CONFIG.maxRetries})`);
        break;
      } catch (error) {
        lastError = error;
        console.log(`❌ Attempt ${attempt}/${CONFIG.maxRetries} failed: ${error.message}`);
        if (attempt < CONFIG.maxRetries) {
          console.log(`⏳ Retrying in 3 seconds...`);
          await new Promise(resolve => setTimeout(resolve, 3000));
        }
      }
    }

    if (!v13Data) {
      throw new Error(`Failed after ${CONFIG.maxRetries} attempts: ${lastError.message}`);
    }

    // Merge with existing data
    const mergedData = existingData ? { ...existingData, ...v13Data } : {
      name: nameInfo.name,
      gender: nameInfo.gender,
      origin: nameInfo.origin,
      ...v13Data
    };

    // Add v13 metadata
    mergedData.enrichmentVersion = 'v13';
    mergedData.v13EnrichedAt = new Date().toISOString();
    mergedData.v13Model = CONFIG.model;

    // Save to file
    console.log(`💾 Saving enriched data...`);
    fs.writeFileSync(v13Path, JSON.stringify(mergedData, null, 2));
    console.log(`✅ Saved to: ${path.basename(v13Path)}`);

    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log(`⏱️  Completed in ${elapsed}s`);

    return { success: true, skipped: false };

  } catch (error) {
    console.error(`❌ ERROR enriching ${nameInfo.name}: ${error.message}`);
    return { success: false, error: error.message };
  }
}

//===========================================
// MAIN EXECUTION
//===========================================

async function main() {
  console.log(`
╔════════════════════════════════════════════════════════════╗
║                                                            ║
║           🚀 V13 ENRICHMENT SCRIPT                        ║
║           SoulSeed Baby Names                              ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝
  `);

  // Load progress
  const progress = loadProgress();
  console.log(`📊 Progress: ${progress.completedNames}/100 names completed`);

  // Load names
  const allNames = loadTop100Names();

  // Determine which names to process
  let namesToProcess = allNames;

  if (flags.resume && progress.completedList.length > 0) {
    console.log(`♻️  RESUME MODE: Skipping ${progress.completedList.length} completed names`);
    namesToProcess = allNames.filter(n => !progress.completedList.includes(n.name));
  } else {
    namesToProcess = allNames.slice(flags.start, flags.end);
  }

  console.log(`\n🎯 Processing ${namesToProcess.length} names (${flags.start} to ${flags.end})`);
  console.log(`⏱️  Estimated time: ${Math.ceil(namesToProcess.length * 12 / 60)} minutes\n`);

  // Process each name
  for (let i = 0; i < namesToProcess.length; i++) {
    const nameInfo = namesToProcess[i];
    progress.currentName = nameInfo.name;

    console.log(`\n[${i + 1}/${namesToProcess.length}] Processing: ${nameInfo.name}`);

    const result = await enrichName(nameInfo, progress);

    if (result.success && !result.skipped) {
      progress.completedNames++;
      progress.completedList.push(nameInfo.name);
      saveProgress(progress);
      console.log(`✅ Progress: ${progress.completedNames}/100 complete`);
    } else if (result.success && result.skipped) {
      // Already completed, count it
      if (!progress.completedList.includes(nameInfo.name)) {
        progress.completedList.push(nameInfo.name);
        progress.completedNames++;
        saveProgress(progress);
      }
    } else {
      progress.failedNames.push({ name: nameInfo.name, error: result.error });
      saveProgress(progress);
      console.log(`⚠️  Added to failed list`);
    }

    // Delay between requests
    if (i < namesToProcess.length - 1) {
      console.log(`⏳ Waiting ${CONFIG.delayBetweenRequests / 1000}s before next request...`);
      await new Promise(resolve => setTimeout(resolve, CONFIG.delayBetweenRequests));
    }
  }

  // Final summary
  console.log(`\n${'='.repeat(60)}`);
  console.log(`✅ ENRICHMENT COMPLETE!`);
  console.log(`${'='.repeat(60)}`);
  console.log(`📊 Final Statistics:`);
  console.log(`   ✅ Completed: ${progress.completedNames}/100`);
  console.log(`   ❌ Failed: ${progress.failedNames.length}`);

  if (progress.failedNames.length > 0) {
    console.log(`\n⚠️  Failed names:`);
    progress.failedNames.forEach(f => {
      console.log(`   - ${f.name}: ${f.error}`);
    });
    console.log(`\nTo retry failed names, run:`);
    console.log(`node enrich-v13.js --resume`);
  }

  if (progress.completedNames === 100) {
    console.log(`\n🎉 All 100 names enriched successfully!`);
  }

  console.log(`\n💾 Progress saved to: ${CONFIG.progressFile}`);
  console.log(`📁 Enriched files in: ${CONFIG.enrichedDir}`);
}

// Run the script
main().catch(error => {
  console.error(`\n💥 FATAL ERROR: ${error.message}`);
  console.error(error.stack);
  process.exit(1);
});
