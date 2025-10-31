const fs = require('fs');
const path = require('path');
const https = require('https');

// OpenAI API Configuration
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const API_URL = 'https://api.openai.com/v1/chat/completions';

// GPT-4 model (best quality)
const MODEL = 'gpt-4o-mini'; // Using mini for speed - still excellent quality, 15x cheaper

// Delay between batches (ms)
const BATCH_DELAY = 1500;

// Batch size (how many names per API call)
const BATCH_SIZE = 15;

async function callGPT4(prompt) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({
      model: MODEL,
      messages: [
        {
          role: 'system',
          content: 'You are an expert etymologist and name historian. Provide concise, accurate meanings for baby names (maximum 4 words). Focus on the core meaning or etymology. Examples: "Bearer of Christ", "Little dark one", "God is gracious", "Noble strength".'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.3, // Lower temperature for more accurate, consistent results
      max_tokens: 500
    });

    const options = {
      hostname: 'api.openai.com',
      path: '/v1/chat/completions',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Length': data.length
      }
    };

    const req = https.request(options, (res) => {
      let responseData = '';
      res.on('data', chunk => responseData += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(responseData);
          if (parsed.error) {
            reject(new Error(parsed.error.message));
          } else {
            resolve(parsed.choices[0].message.content.trim());
          }
        } catch (err) {
          reject(err);
        }
      });
    });

    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

async function generateMeaningsForBatch(names) {
  // Create prompt for batch processing
  const nameList = names.map((n, i) => `${i + 1}. ${n.name} (${n.gender.Male > 0.7 ? 'Male' : n.gender.Female > 0.7 ? 'Female' : 'Unisex'}, ${n.originGroup})`).join('\n');

  const prompt = `Provide accurate, concise meanings (maximum 4 words each) for these names. Format as: "Name: meaning"

${nameList}

Example format:
1. Marie: Star of the sea
2. Pierre: Rock, stone
3. Jean: God is gracious`;

  const response = await callGPT4(prompt);

  // Parse response
  const meanings = {};
  const lines = response.split('\n').filter(l => l.trim());

  for (const line of lines) {
    // Match patterns like "1. Name: meaning" or "Name: meaning"
    const match = line.match(/(?:\d+\.\s*)?([^:]+):\s*(.+)/);
    if (match) {
      const name = match[1].trim();
      const meaning = match[2].trim();
      meanings[name] = meaning;
    }
  }

  return meanings;
}

async function addMeaningsToDatabase() {
  const dataDir = path.join(__dirname, 'public', 'data');
  const indexFile = path.join(dataDir, 'names-index.json');

  if (!OPENAI_API_KEY) {
    console.error('❌ OPENAI_API_KEY not found in environment variables!');
    process.exit(1);
  }

  console.log('🤖 Using GPT-4o-mini for meaning generation\n');
  console.log('📊 Finding names without proper meanings...\n');

  const index = JSON.parse(fs.readFileSync(indexFile, 'utf8'));
  const chunks = Object.values(index.chunks);

  // Collect all names without proper meanings
  const namesToProcess = [];

  for (const chunk of chunks) {
    const chunkFile = path.join(dataDir, chunk.file);
    if (!fs.existsSync(chunkFile)) continue;

    const chunkData = JSON.parse(fs.readFileSync(chunkFile, 'utf8'));
    const names = Array.isArray(chunkData) ? chunkData : (chunkData.names || []);

    for (const name of names) {
      // Find names with generic meanings
      if (name.meaningEtymology &&
          (name.meaningEtymology === 'Italian origin' ||
           name.meaningEtymology === 'Germanic origin' ||
           name.meaningEtymology === 'French origin' ||
           name.meaningEtymology === 'INSEE-death-records-1970-2024')) {
        namesToProcess.push({
          name: name.name,
          gender: name.gender,
          originGroup: name.originGroup,
          chunk: chunk.file,
          oldMeaning: name.meaningEtymology
        });
      }
    }
  }

  console.log(`✅ Found ${namesToProcess.length} names needing meanings\n`);
  console.log(`🔄 Processing in batches of ${BATCH_SIZE}...\n`);

  // Process in batches
  const allMeanings = {};
  const batches = [];
  for (let i = 0; i < namesToProcess.length; i += BATCH_SIZE) {
    batches.push(namesToProcess.slice(i, i + BATCH_SIZE));
  }

  let processedCount = 0;

  for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
    const batch = batches[batchIndex];

    console.log(`📦 Batch ${batchIndex + 1}/${batches.length} (${batch.length} names)...`);

    try {
      const meanings = await generateMeaningsForBatch(batch);
      Object.assign(allMeanings, meanings);

      processedCount += batch.length;
      console.log(`   ✅ Generated ${Object.keys(meanings).length} meanings`);
      console.log(`   📊 Progress: ${processedCount}/${namesToProcess.length} (${((processedCount/namesToProcess.length)*100).toFixed(1)}%)\n`);

      // Delay between batches to respect rate limits
      if (batchIndex < batches.length - 1) {
        await new Promise(resolve => setTimeout(resolve, BATCH_DELAY));
      }
    } catch (err) {
      console.error(`   ❌ Error processing batch: ${err.message}`);
      console.log(`   ⏭️  Continuing with next batch...\n`);
    }
  }

  console.log(`\n✅ Generated ${Object.keys(allMeanings).length} meanings total\n`);
  console.log('💾 Updating database chunks...\n');

  // Update chunks with new meanings
  let updatedCount = 0;

  for (const chunk of chunks) {
    const chunkFile = path.join(dataDir, chunk.file);
    if (!fs.existsSync(chunkFile)) continue;

    const chunkData = JSON.parse(fs.readFileSync(chunkFile, 'utf8'));
    const names = Array.isArray(chunkData) ? chunkData : (chunkData.names || []);
    let chunkUpdates = 0;

    for (const name of names) {
      if (allMeanings[name.name]) {
        name.meaningEtymology = allMeanings[name.name];
        chunkUpdates++;
        updatedCount++;
      }
    }

    if (chunkUpdates > 0) {
      if (Array.isArray(chunkData)) {
        fs.writeFileSync(chunkFile, JSON.stringify(chunkData, null, 2), 'utf8');
      } else {
        fs.writeFileSync(chunkFile, JSON.stringify(chunkData, null, 2), 'utf8');
      }
      console.log(`   ✅ Updated ${chunkUpdates} names in ${chunk.file}`);
    }
  }

  console.log(`\n✅ Database update complete!`);
  console.log(`📊 Updated ${updatedCount} name meanings\n`);

  // Display sample
  console.log('📋 Sample of new meanings:\n');
  const sampleNames = Object.entries(allMeanings).slice(0, 15);
  sampleNames.forEach(([name, meaning], i) => {
    console.log(`   ${(i + 1).toString().padStart(2)}. ${name.padEnd(20)} → ${meaning}`);
  });

  console.log('\n✨ Meaning generation complete!\n');
}

addMeaningsToDatabase().catch(console.error);
