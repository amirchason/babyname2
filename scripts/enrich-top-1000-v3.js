/**
 * 🚀 V3.0 ENRICHMENT FOR TOP 1000 NAMES
 *
 * Batch enrichment using GPT-4 with verified data:
 * - Songs (verified from music databases)
 * - IMDB data (famous people, movies/shows)
 * - Character quotes (paraphrased)
 * - Nicknames (12 suggestions)
 * - Cultural significance & modern context
 */

const OpenAI = require('openai');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '/data/data/com.termux/files/home/proj/babyname2/.env' });

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const TOP_1000_PATH = path.join(__dirname, 'top-1000-names.json');
const BATCH_SIZE = 5; // Process 5 names per batch
const DELAY_BETWEEN_BATCHES = 2000; // 2 seconds between batches
const MAX_RETRIES = 3;

// Progress tracking
let totalProcessed = 0;
let totalErrors = 0;
let startTime = Date.now();

async function enrichName(name, gender, origin, meaning) {
  const prompt = `You are an IMDB expert, music database researcher, and baby name specialist. Provide comprehensive, verified information about the name "${name}".

CRITICAL VERIFICATION REQUIREMENTS:

SONGS:
1. ONLY include songs that ACTUALLY EXIST in major music databases (Spotify, Apple Music, Billboard)
2. Verify each song exists - DO NOT guess or assume
3. Extract REAL lyrics from actual songs (brief snippets only, not full verses)
4. YouTube links must lead to the CORRECT song
5. Better to return 1-2 verified songs than fake ones
6. If NO songs exist with this name, return empty array []

IMDB DATA (Famous People):
1. Include top 2-3 most famous actors/actresses named ${name} (verify IMDB credits)
2. List their most notable films/shows
3. Include IMDB profile links: https://www.imdb.com/find/?q=FirstName+LastName
4. Verify they are actually well-known (awards, major roles, etc.)
5. If no famous people exist, return empty array []

MOVIES/TV SHOWS (Characters Named ${name}):
1. Include top 2-3 most famous movies/TV shows with main characters named ${name}
2. Include IMDB title links: https://www.imdb.com/title/tt#######/
3. Include year, genre, and brief character description
4. Verify these are actual major productions
5. If no characters exist, return empty array []

CHARACTER QUOTES:
1. Include 1-2 memorable quotes by characters named ${name}
2. PARAPHRASE or summarize the essence - DO NOT copy exact dialogue word-for-word
3. Describe the quote's context and significance
4. Keep it brief and transformative
5. If no memorable quotes exist, return empty array []

NICKNAMES:
1. Provide up to 12 common or creative nicknames for ${name}
2. Include traditional diminutives, modern variants, and playful alternatives
3. Consider cultural variations

Return ONLY valid JSON (no markdown, no code blocks) with this exact structure:
{
  "culturalSignificance": "2-3 sentences about historical and cultural importance",
  "modernContext": "2-3 sentences about current popularity and modern usage",
  "literaryReferences": "Notable characters or famous people named ${name} (or 'None widely known' if rare)",
  "pronunciationGuide": "Phonetic pronunciation",
  "variations": ["List", "of", "name", "variations"],
  "similarNames": ["List", "of", "similar", "names"],
  "personality": "Personality traits often associated with this name",
  "symbolism": "Symbolic meanings and associations",
  "funFact": "An interesting or surprising fact about this name",
  "songs": [
    {
      "title": "Exact song title",
      "artist": "Artist name",
      "year": 2020,
      "youtubeSearchUrl": "https://www.youtube.com/results?search_query=artist+song+title+official",
      "quote": "Memorable lyric from the song mentioning ${name} (real lyrics only)"
    }
  ],
  "famousQuotes": [
    {
      "quote": "The actual quote text",
      "person": "Full name of the famous ${name}",
      "context": "Brief context (actress, activist, etc.)"
    }
  ],
  "famousPeople": [
    {
      "name": "Full name",
      "profession": "Actress/Actor/etc",
      "knownFor": ["Movie/Show 1", "Movie/Show 2", "Movie/Show 3"],
      "imdbUrl": "https://www.imdb.com/find/?q=FirstName+LastName",
      "awards": "Brief award info (Oscar, Emmy, etc.)"
    }
  ],
  "moviesAndShows": [
    {
      "title": "Movie or TV show title",
      "year": 2020,
      "type": "Movie or TV Series",
      "characterName": "${name} [Last Name if applicable]",
      "characterDescription": "Brief description of the character",
      "imdbUrl": "https://www.imdb.com/title/tt#######/",
      "genre": "Genre"
    }
  ],
  "characterQuotes": [
    {
      "character": "${name} [Character Name]",
      "source": "Movie/Show Title",
      "quoteSummary": "Paraphrased essence of memorable quote (NOT exact dialogue)",
      "context": "Why this quote is significant or memorable"
    }
  ],
  "nicknames": ["List", "of", "up", "to", "12", "possible", "nicknames"]
}`;

  let lastError = null;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const response = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3,
        max_tokens: 3500
      });

      const content = response.choices[0].message.content.trim();
      const enrichment = JSON.parse(content);

      return enrichment;

    } catch (error) {
      lastError = error;

      if (error.code === 'rate_limit_exceeded' || error.status === 429) {
        const delay = Math.pow(2, attempt) * 1000; // Exponential backoff
        console.log(`   ⏳ Rate limit hit, waiting ${delay/1000}s...`);
        await sleep(delay);
      } else if (attempt < MAX_RETRIES) {
        console.log(`   ⚠️ Attempt ${attempt} failed, retrying...`);
        await sleep(1000);
      }
    }
  }

  throw lastError;
}

async function processBatch(names, startIndex) {
  console.log(`\n📦 Processing batch ${Math.floor(startIndex/BATCH_SIZE) + 1} (names ${startIndex+1}-${Math.min(startIndex+BATCH_SIZE, names.length)})...`);

  const batchResults = [];

  for (let i = startIndex; i < Math.min(startIndex + BATCH_SIZE, names.length); i++) {
    const name = names[i];

    // Skip if already enriched
    if (name.culturalSignificance || name.songs || name.famousPeople) {
      console.log(`   ⏭️  ${name.name} - Already enriched`);
      totalProcessed++;
      continue;
    }

    try {
      console.log(`   🎨 Enriching: ${name.name} (${name.gender || 'unisex'})...`);

      const enrichment = await enrichName(
        name.name,
        name.gender || 'unisex',
        name.origin || 'Unknown',
        name.meaning || 'Unknown'
      );

      // Merge enrichment with existing data
      Object.assign(name, enrichment);

      console.log(`   ✅ ${name.name} - Success`);
      totalProcessed++;

    } catch (error) {
      console.error(`   ❌ ${name.name} - Error: ${error.message}`);
      totalErrors++;
    }

    // Small delay between individual names
    await sleep(500);
  }

  return names;
}

async function enrichTop1000() {
  console.log('🚀 V3.0 TOP 1000 NAME ENRICHMENT');
  console.log('================================\n');
  console.log('Features:');
  console.log('  - GPT-4 powered enrichment');
  console.log('  - Verified songs with YouTube links');
  console.log('  - IMDB data (famous people, movies/shows)');
  console.log('  - Paraphrased character quotes');
  console.log('  - 12 nicknames per name');
  console.log('');

  try {
    // Load top 1000 names
    console.log('📚 Loading top 1000 names...');
    const names = JSON.parse(fs.readFileSync(TOP_1000_PATH, 'utf8'));

    const alreadyEnriched = names.filter(n => n.culturalSignificance || n.songs || n.famousPeople).length;
    const remaining = names.length - alreadyEnriched;

    console.log(`   ✅ Loaded ${names.length} names`);
    console.log(`   📊 Already enriched: ${alreadyEnriched} (${(alreadyEnriched/names.length*100).toFixed(1)}%)`);
    console.log(`   🎯 Remaining: ${remaining}`);
    console.log('');

    if (remaining === 0) {
      console.log('🎉 All names already enriched!');
      return;
    }

    // Process in batches
    const totalBatches = Math.ceil(names.length / BATCH_SIZE);

    for (let i = 0; i < names.length; i += BATCH_SIZE) {
      const currentBatch = Math.floor(i/BATCH_SIZE) + 1;

      // Process batch
      await processBatch(names, i);

      // Save progress after each batch
      fs.writeFileSync(TOP_1000_PATH, JSON.stringify(names, null, 2));

      // Progress stats
      const elapsed = (Date.now() - startTime) / 1000;
      const rate = totalProcessed / elapsed;
      const remainingNames = names.length - (alreadyEnriched + totalProcessed);
      const estimatedTimeRemaining = remainingNames / rate;

      console.log(`\n📊 Progress: ${totalProcessed}/${remaining} new enrichments (${(totalProcessed/remaining*100).toFixed(1)}%)`);
      console.log(`   ⏱️  Rate: ${rate.toFixed(2)} names/sec`);
      console.log(`   ⏳ Est. time remaining: ${Math.ceil(estimatedTimeRemaining/60)} minutes`);
      console.log(`   ❌ Errors: ${totalErrors}`);

      // Delay between batches
      if (i + BATCH_SIZE < names.length) {
        console.log(`\n⏸️  Waiting ${DELAY_BETWEEN_BATCHES/1000}s before next batch...`);
        await sleep(DELAY_BETWEEN_BATCHES);
      }
    }

    console.log('\n✅ ENRICHMENT COMPLETE!');
    console.log('=======================');
    console.log(`   Total processed: ${totalProcessed}`);
    console.log(`   Total errors: ${totalErrors}`);
    console.log(`   Total time: ${Math.ceil((Date.now() - startTime)/1000/60)} minutes`);
    console.log(`   Final enrichment: ${alreadyEnriched + totalProcessed}/${names.length} (${((alreadyEnriched + totalProcessed)/names.length*100).toFixed(1)}%)`);

  } catch (error) {
    console.error('\n❌ Fatal error:', error.message);
    throw error;
  }
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Run enrichment
enrichTop1000();
