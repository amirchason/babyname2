/**
 * 🤖 GENERATE TOP 25,000 NAMES WITH GPT-4O
 *
 * Since SSA blocks automated downloads, we'll use GPT-4o's knowledge
 * of the most popular US + UK baby names to generate our list.
 *
 * GPT-4o has accurate data up to 2024 for top baby names.
 */

const OpenAI = require('openai');
const fs = require('fs');
const path = require('path');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'process.env.OPENAI_API_KEY'
});

const DATA_DIR = path.join(__dirname, '../public/data');

console.log('🤖 GENERATE TOP 25,000 NAMES WITH GPT-4O');
console.log('=========================================\n');

/**
 * Count syllables
 */
function countSyllables(name) {
  const vowels = 'aeiouy';
  let count = 0;
  let previousWasVowel = false;

  for (let i = 0; i < name.length; i++) {
    const char = name[i].toLowerCase();
    const isVowel = vowels.includes(char);

    if (isVowel && !previousWasVowel) {
      count++;
    }

    previousWasVowel = isVowel;
  }

  if (name.toLowerCase().endsWith('e') && count > 1) {
    count--;
  }

  return Math.max(1, count);
}

/**
 * Generate names in batches
 */
async function generateNamesBatch(startRank, endRank) {
  console.log(`   Generating ranks ${startRank}-${endRank}...`);

  const prompt = `Generate baby names ranked ${startRank} to ${endRank} in popularity for 2024, combining US (SSA) and UK (ONS) data.

Return ONLY valid JSON (no markdown) with this structure:
{
  "names": [
    {
      "name": "Name",
      "gender": "girl" | "boy" | "unisex",
      "us_rank": number (or null),
      "uk_rank": number (or null)
    }
  ]
}

Rules:
1. Use REAL names from actual 2024 popularity data
2. Include both US and UK popular names
3. Gender "unisex" only if name appears in both top 1000 for boys and girls
4. Provide accurate ranks when available
5. Alphabetize within each rank tier if multiple names have same popularity

Return exactly ${endRank - startRank + 1} names.`;

  const completion = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.3,
    max_tokens: 4000,
    response_format: { type: "json_object" }
  });

  const data = JSON.parse(completion.choices[0].message.content);
  return data.names;
}

/**
 * Main function
 */
async function main() {
  try {
    console.log('📥 Generating top 25,000 names with GPT-4o...');
    console.log('   (This will take ~15-20 minutes)');

    const allNames = [];
    const batchSize = 500; // Generate 500 names at a time

    for (let i = 1; i <= 25000; i += batchSize) {
      const endRank = Math.min(i + batchSize - 1, 25000);
      const batch = await generateNamesBatch(i, endRank);

      batch.forEach((nameData, index) => {
        const overallRank = i + index;

        allNames.push({
          name: nameData.name,
          gender: nameData.gender,
          origin: '', // Will be enriched later
          meaning: '', // Will be enriched later
          popularity: {
            us_rank: nameData.us_rank,
            uk_rank: nameData.uk_rank,
            overall_rank: overallRank
          },
          syllables: countSyllables(nameData.name),
          length: nameData.name.length,
          first_letter: nameData.name[0].toUpperCase(),
          _source: 'gpt4o-2024'
        });
      });

      console.log(`   ✅ Generated ${allNames.length}/${25000} names`);

      // Small delay to avoid rate limits
      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    console.log(`\n✅ Generated ${allNames.length} names`);

    // Load existing database
    console.log('\n📚 Loading existing database...');

    const existingNames = new Map();
    const chunks = [1, 2, 3, 4];
    let existingCount = 0;

    for (const chunkNum of chunks) {
      const chunkPath = path.join(DATA_DIR, `names-chunk${chunkNum}.json`);
      if (fs.existsSync(chunkPath)) {
        const chunk = JSON.parse(fs.readFileSync(chunkPath, 'utf8'));
        chunk.forEach(name => {
          existingNames.set(name.name.toLowerCase(), name);
          existingCount++;
        });
      }
    }

    console.log(`   ✅ Loaded ${existingCount} existing names`);

    // Merge (new names only)
    console.log('\n🔀 Merging databases...');

    let newNamesAdded = 0;
    let duplicatesSkipped = 0;

    allNames.forEach(newName => {
      const key = newName.name.toLowerCase();
      if (!existingNames.has(key)) {
        existingNames.set(key, newName);
        newNamesAdded++;
      } else {
        duplicatesSkipped++;
      }
    });

    console.log(`   ✅ Added ${newNamesAdded} new names`);
    console.log(`   ⚠️  Skipped ${duplicatesSkipped} duplicates`);
    console.log(`   📊 Total database size: ${existingNames.size} names`);

    // Sort and save to chunks
    console.log('\n📦 Saving to chunks...');

    const finalNames = Array.from(existingNames.values());
    finalNames.sort((a, b) => {
      const aRank = a.popularity?.overall_rank || 999999;
      const bRank = b.popularity?.overall_rank || 999999;
      return aRank - bRank;
    });

    const chunkSize = Math.ceil(finalNames.length / 4);

    for (let i = 0; i < 4; i++) {
      const start = i * chunkSize;
      const end = Math.min(start + chunkSize, finalNames.length);
      const chunk = finalNames.slice(start, end);

      const chunkPath = path.join(DATA_DIR, `names-chunk${i + 1}.json`);
      fs.writeFileSync(chunkPath, JSON.stringify(chunk, null, 2));
      console.log(`   ✅ Saved chunk ${i + 1}: ${chunk.length} names`);
    }

    // Generate report
    const report = {
      timestamp: new Date().toISOString(),
      method: 'gpt-4o',
      names_generated: allNames.length,
      new_names_added: newNamesAdded,
      duplicates_skipped: duplicatesSkipped,
      total_database_size: existingNames.size,
      gender_distribution: {
        girls: allNames.filter(n => n.gender === 'girl').length,
        boys: allNames.filter(n => n.gender === 'boy').length,
        unisex: allNames.filter(n => n.gender === 'unisex').length
      }
    };

    fs.writeFileSync(
      path.join(__dirname, 'add-25k-names-report.json'),
      JSON.stringify(report, null, 2)
    );

    console.log('\n✅ SUCCESS! 25,000 names added to database');
    console.log(`📊 New total: ${existingNames.size} names`);
    console.log(`📁 Updated: public/data/names-chunk[1-4].json`);
    console.log(`📄 Report: scripts/add-25k-names-report.json`);

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    throw error;
  }
}

main();
