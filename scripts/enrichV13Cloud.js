/**
 * V13 CLOUD ENRICHMENT SCRIPT
 *
 * Enriches top 1000 baby names with comprehensive v13 data using GPT-4o
 * Features:
 * - Resumable processing with checkpoints
 * - Error handling with exponential backoff
 * - Rate limiting (2 sec between requests)
 * - Progress logging
 * - Retry logic for failed names
 */

const fs = require('fs');
const path = require('path');
const OpenAI = require('openai');
require('dotenv').config();

// Configuration
const CONFIG = {
  MODEL: 'gpt-4o', // Best GPT model
  MAX_RETRIES: 3,
  DELAY_MS: 2000, // 2 seconds between requests
  TOP_N_NAMES: 1000,
  CHECKPOINT_FILE: path.join(__dirname, 'v13Checkpoint.json'),
  FAILED_FILE: path.join(__dirname, 'v13Failed.json'),
  MANIFEST_FILE: path.join(__dirname, '../public/data/enriched/v13-manifest.json'),
  OUTPUT_DIR: path.join(__dirname, '../public/data/enriched'),
};

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Utilities
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const log = (message, type = 'info') => {
  const timestamp = new Date().toISOString();
  const prefix = {
    info: '📝',
    success: '✅',
    error: '❌',
    warning: '⚠️',
    progress: '⏳',
  }[type] || '📝';

  console.log(`[${timestamp}] ${prefix} ${message}`);
};

// Load all name chunks and get top N names
const loadTopNames = () => {
  log('Loading name database...', 'progress');

  try {
    const chunks = [];
    for (let i = 1; i <= 4; i++) {
      const chunkPath = path.join(__dirname, `../public/data/names-chunk${i}.json`);
      if (fs.existsSync(chunkPath)) {
        const chunk = JSON.parse(fs.readFileSync(chunkPath, 'utf-8'));
        chunks.push(...chunk);
      }
    }

    // Sort by popularity rank and take top N
    const topNames = chunks
      .filter(n => n.popularityRank && n.name)
      .sort((a, b) => a.popularityRank - b.popularityRank)
      .slice(0, CONFIG.TOP_N_NAMES);

    log(`Loaded ${topNames.length} names from database`, 'success');
    return topNames;
  } catch (error) {
    log(`Failed to load names: ${error.message}`, 'error');
    process.exit(1);
  }
};

// Load existing manifest
const loadManifest = () => {
  if (fs.existsSync(CONFIG.MANIFEST_FILE)) {
    try {
      const manifest = JSON.parse(fs.readFileSync(CONFIG.MANIFEST_FILE, 'utf-8'));
      log(`Manifest loaded: ${manifest.totalEnriched} names already enriched`, 'info');
      return manifest;
    } catch (error) {
      log(`Failed to load manifest: ${error.message}`, 'warning');
    }
  }

  return {
    version: '1.0',
    lastUpdated: new Date().toISOString(),
    totalEnriched: 0,
    names: []
  };
};

// Save manifest
const saveManifest = (manifest) => {
  manifest.lastUpdated = new Date().toISOString();
  fs.writeFileSync(CONFIG.MANIFEST_FILE, JSON.stringify(manifest, null, 2));
};

// Load checkpoint
const loadCheckpoint = () => {
  if (fs.existsSync(CONFIG.CHECKPOINT_FILE)) {
    try {
      return JSON.parse(fs.readFileSync(CONFIG.CHECKPOINT_FILE, 'utf-8'));
    } catch (error) {
      log(`Failed to load checkpoint: ${error.message}`, 'warning');
    }
  }
  return {
    lastProcessedIndex: -1,
    lastProcessedName: null,
    totalProcessed: 0,
    totalErrors: 0,
    startedAt: new Date().toISOString(),
  };
};

// Save checkpoint
const saveCheckpoint = (checkpoint) => {
  fs.writeFileSync(CONFIG.CHECKPOINT_FILE, JSON.stringify(checkpoint, null, 2));
};

// Load failed names log
const loadFailedLog = () => {
  if (fs.existsSync(CONFIG.FAILED_FILE)) {
    try {
      return JSON.parse(fs.readFileSync(CONFIG.FAILED_FILE, 'utf-8'));
    } catch (error) {
      log(`Failed to load failed names log: ${error.message}`, 'warning');
    }
  }
  return [];
};

// Save failed names log
const saveFailedLog = (failed) => {
  fs.writeFileSync(CONFIG.FAILED_FILE, JSON.stringify(failed, null, 2));
};

// Generate v13 enrichment prompt
const generatePrompt = (name) => {
  return `Generate comprehensive v13 super-enriched data for the baby name: "${name}"

REQUIREMENTS:
- Be factually accurate, especially for dates, historical figures, and achievements
- Include diverse perspectives across cultures, time periods, and professions
- Verify that movies, songs, and books actually exist before including them
- Include only real, notable people - no made-up names
- For religious significance, only include if the name has genuine religious importance

STRUCTURE (return as strict JSON):
{
  "name": "${name}",
  "enrichmentVersion": "v13_super_enriched",
  "enrichedAt": "${new Date().toISOString()}",
  "dataSource": "GPT-4o Cloud Enrichment",
  "versionsIncluded": ["v13"],
  "gender": "male|female|unisex",
  "origin": "Primary origin (e.g., Hebrew, Greek, Latin, Germanic, etc.)",
  "meaning": "Primary meaning (concise)",
  "culturalSignificance": "2-3 sentences about cultural and historical significance",
  "modernContext": "2-3 sentences about modern usage and popularity",
  "literaryReferences": "Notable literary references if any (1-2 sentences or omit)",
  "pronunciationGuide": "IPA pronunciation",
  "variations": ["Variation1", "Variation2", ...], // 3-5 variations
  "similarNames": ["Similar1", "Similar2", ...], // 4-6 similar names
  "nicknames": ["Nick1", "Nick2", ...], // 3-5 common nicknames
  "personality": "1-2 sentences about personality traits associated with the name",
  "symbolism": "1-2 sentences about symbolic meanings",
  "funFact": "An interesting, verifiable fact about the name",
  "religiousSignificance": {
    "hasSignificance": true|false,
    "religions": ["Christianity", "Judaism", etc.],
    "character": "Religious figure name if applicable",
    "significance": "Description of religious significance",
    "keyStories": ["Story1", "Story2"],
    "spiritualMeaning": "Spiritual interpretation",
    "historicalImpact": "Impact on religious history"
  },
  "historicFigures": [
    {
      "fullName": "Full Name",
      "years": "YYYY-YYYY",
      "category": "Royalty|Scientist|Artist|etc.",
      "achievements": ["Achievement 1", "Achievement 2"],
      "significance": "Why this person matters",
      "notableWorks": ["Work 1", "Work 2"]
    }
  ], // 2-3 historic figures if notable people exist
  "famousQuotes": [
    {
      "quote": "The quote text",
      "author": "Person with this name",
      "context": "Context of the quote",
      "year": 1900,
      "category": "Philosophy|Politics|etc."
    }
  ], // 1-2 quotes from famous people with this name
  "famousPeople": [
    {
      "name": "Full Name",
      "profession": "Actor|Musician|etc.",
      "knownFor": ["Role/Work 1", "Role/Work 2"],
      "awards": "Major awards won"
    }
  ], // 2-3 modern famous people
  "famousAthletes": [
    {
      "name": "Full Name",
      "profession": "Athlete",
      "sport": "Basketball|Football|etc.",
      "league": "NBA|NFL|etc.",
      "team": "Current team",
      "pastTeams": ["Team1", "Team2"],
      "position": "Position",
      "jerseyNumber": "Number",
      "years": "YYYY-Present",
      "achievements": "Championships, MVP, etc.",
      "knownFor": ["Skill 1", "Skill 2"],
      "awards": "Major awards",
      "stats": "Career statistics",
      "verified": true,
      "source": "Reliable source"
    }
  ], // 1-2 athletes if notable athletes exist
  "moviesAndShows": [
    {
      "title": "Movie/Show Title",
      "year": 2020,
      "type": "Movie|TV Show",
      "characterName": "Character with this name",
      "characterDescription": "Brief character description",
      "imdbUrl": "https://www.imdb.com/title/...",
      "genre": "Genre",
      "verified": true,
      "popularity": 85
    }
  ], // 2-3 movies/shows with characters of this name
  "characterQuotes": [
    {
      "quote": "Quote from character",
      "character": "Character name",
      "source": "Movie/Show name",
      "year": 2020,
      "context": "Context of quote",
      "genre": "Genre",
      "impact": "Why this quote matters"
    }
  ], // 1-2 memorable character quotes
  "celestialData": {
    "luckyNumber": 1-9,
    "dominantElement": "Earth|Fire|Water|Air",
    "luckyColor": {"name": "Color Name", "hex": "#HEXCODE"},
    "luckyGemstone": "Gemstone",
    "luckyDay": "Monday-Sunday",
    "moonPhase": "New Moon|Full Moon|etc.",
    "moonPhaseDescription": "Description",
    "compatibleSigns": ["Aries", "Leo", ...],
    "compatibleSignsDescription": "Why compatible",
    "cosmicElement": "Element",
    "cosmicElementDescription": "Element description",
    "celestialArchetype": "The Leader|The Healer|etc.",
    "celestialArchetypeDescription": "Archetype description",
    "karmicLessons": "Lessons for this name",
    "soulUrge": 1-9,
    "soulUrgeDescription": "Soul urge description"
  },
  "genderDistribution": {
    "male": 0-100,
    "female": 0-100
  },
  "ranking": {
    "current": 1-1000,
    "peak": 1-1000,
    "peakYear": 1900-2025
  },
  "inspiration": {
    "type": "quote",
    "content": "Inspirational quote or message",
    "author": "Famous person with this name or about the name",
    "context": "Context"
  },
  "syllables": {
    "count": 1-5,
    "breakdown": "Syl-la-bles"
  },
  "translations": [
    {
      "language": "Spanish|Greek|Arabic|Chinese|Russian|Hebrew",
      "name": "Translated name",
      "script": "Latin|Greek|Arabic|Han|Cyrillic|Hebrew",
      "scriptName": "Name in native script",
      "pronunciation": "IPA pronunciation",
      "rtl": false|true
    }
  ], // 6 translations (Spanish, Greek, Arabic, Chinese, Russian, Hebrew)
  "booksWithName": [
    {
      "title": "Book Title",
      "author": "Author Name",
      "publishedYear": 1900-2025,
      "genre": "Fiction|Non-fiction|etc.",
      "significance": "Why this book matters",
      "nameRole": "protagonist|title|supporting",
      "verified": true
    }
  ], // 1-2 notable books if they exist
  "celebrityBabies": [
    {
      "childName": "Child's name",
      "parentNames": ["Parent 1", "Parent 2"],
      "birthYear": 1900-2025,
      "context": "Context about the celebrity parents"
    }
  ], // Only include if notable celebrity babies exist
  "categories": [
    {
      "tag": "Classic|Modern|Timeless|Royal|Biblical|Literary|etc.",
      "confidence": 0.0-1.0,
      "reason": "Why this category applies"
    }
  ], // 3-5 category tags
  "songs": [
    {
      "title": "Song Title",
      "artist": "Artist Name",
      "year": 1900-2025,
      "genre": "Genre",
      "nameContext": "How the name appears",
      "description": "Song description (2-3 sentences)",
      "theme": "positive|negative|neutral",
      "positiveVibeScore": 1-10,
      "youtubeSearchUrl": "https://youtube.com/results?search_query=...",
      "geniusUrl": "https://genius.com/search?q=...",
      "verified": true
    }
  ], // 2-3 songs only if real songs exist
  "v11BlogContent": {
    "opening_hook": "Engaging opening paragraph (3-4 sentences)",
    "etymology_meaning": "Detailed etymology and meaning (2-3 sentences)",
    "famous_bearers": "Famous people with this name (2-3 sentences)",
    "pop_culture_moments": "Pop culture references (2-3 sentences)",
    "personality_profile": "Personality traits (2-3 sentences)",
    "variations_nicknames": "Variations and nicknames discussion (2-3 sentences)",
    "popularity_data": "Popularity trends (2-3 sentences)",
    "pairing_suggestions": "Name pairing ideas (2-3 sentences)",
    "cultural_context": "Cultural background (2-3 sentences)",
    "final_recommendation": "Closing recommendation (2-3 sentences)",
    "writer_name": "Jamie Park|Alex Rivers|Morgan Lee",
    "writer_title": "Data Analyst & Statistics Enthusiast|Cultural Historian & Name Etymology Expert|Modern Parent & Name Trend Blogger"
  },
  "v11Writer": "jamie|alex|morgan",
  "v11WriterName": "Jamie Park|Alex Rivers|Morgan Lee",
  "v11WriterTitle": "Data Analyst & Statistics Enthusiast|Cultural Historian & Name Etymology Expert|Modern Parent & Name Trend Blogger"
}

IMPORTANT:
- Return ONLY valid JSON (no markdown, no explanations)
- Use empty arrays [] if no data exists for a field (don't make up fake data)
- For religiousSignificance, set hasSignificance: false if not applicable
- Verify all facts, especially dates and achievements
- Choose one of the 3 blog writers randomly for variety`;
};

// Call GPT-4o to enrich a name
const enrichName = async (nameEntry, retryCount = 0) => {
  try {
    log(`Enriching: ${nameEntry.name} (Rank #${nameEntry.popularityRank})`, 'progress');

    const response = await openai.chat.completions.create({
      model: CONFIG.MODEL,
      messages: [
        {
          role: 'system',
          content: 'You are an expert baby name researcher with deep knowledge of etymology, culture, history, and pop culture. Generate comprehensive, accurate enrichment data in strict JSON format. Never fabricate information - use empty arrays for missing data.'
        },
        {
          role: 'user',
          content: generatePrompt(nameEntry.name)
        }
      ],
      temperature: 0.7,
      max_tokens: 4000,
      response_format: { type: 'json_object' }
    });

    const enrichedData = JSON.parse(response.choices[0].message.content);

    // Validate required fields
    if (!enrichedData.name || !enrichedData.origin || !enrichedData.meaning) {
      throw new Error('Missing required fields in GPT response');
    }

    return enrichedData;
  } catch (error) {
    // Handle rate limiting with exponential backoff
    if (error.status === 429 && retryCount < CONFIG.MAX_RETRIES) {
      const backoffTime = CONFIG.DELAY_MS * Math.pow(2, retryCount);
      log(`Rate limited. Retrying in ${backoffTime}ms... (attempt ${retryCount + 1}/${CONFIG.MAX_RETRIES})`, 'warning');
      await sleep(backoffTime);
      return enrichName(nameEntry, retryCount + 1);
    }

    throw error;
  }
};

// Save enriched data to file
const saveEnrichedData = (data) => {
  const fileName = `${data.name.toLowerCase()}-v13.json`;
  const filePath = path.join(CONFIG.OUTPUT_DIR, fileName);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  log(`Saved: ${fileName}`, 'success');
};

// Main enrichment process
const main = async () => {
  log('========================================', 'info');
  log('V13 CLOUD ENRICHMENT - STARTING', 'info');
  log('========================================', 'info');
  log(`Model: ${CONFIG.MODEL}`, 'info');
  log(`Target: Top ${CONFIG.TOP_N_NAMES} names`, 'info');
  log('', 'info');

  // Ensure output directory exists
  if (!fs.existsSync(CONFIG.OUTPUT_DIR)) {
    fs.mkdirSync(CONFIG.OUTPUT_DIR, { recursive: true });
  }

  // Load data
  const allNames = loadTopNames();
  const manifest = loadManifest();
  const checkpoint = loadCheckpoint();
  const failedLog = loadFailedLog();

  // Filter out already-enriched names
  const namesToEnrich = allNames.filter(name =>
    !manifest.names.includes(name.name.toLowerCase())
  );

  log(`Already enriched: ${manifest.totalEnriched} names`, 'info');
  log(`Remaining to enrich: ${namesToEnrich.length} names`, 'info');
  log('', 'info');

  if (namesToEnrich.length === 0) {
    log('All names already enriched! 🎉', 'success');
    return;
  }

  // Resume from checkpoint if exists
  const startIndex = checkpoint.lastProcessedIndex + 1;
  if (startIndex > 0) {
    log(`Resuming from checkpoint: ${checkpoint.lastProcessedName} (index ${startIndex})`, 'info');
  }

  // Process names
  let successCount = 0;
  let errorCount = 0;

  for (let i = startIndex; i < namesToEnrich.length; i++) {
    const nameEntry = namesToEnrich[i];

    try {
      // Enrich the name
      const enrichedData = await enrichName(nameEntry);

      // Save to file
      saveEnrichedData(enrichedData);

      // Update manifest
      manifest.names.push(nameEntry.name.toLowerCase());
      manifest.totalEnriched = manifest.names.length;
      saveManifest(manifest);

      // Update checkpoint
      checkpoint.lastProcessedIndex = i;
      checkpoint.lastProcessedName = nameEntry.name;
      checkpoint.totalProcessed++;
      saveCheckpoint(checkpoint);

      successCount++;

      // Progress update
      const progress = ((i + 1) / namesToEnrich.length * 100).toFixed(1);
      log(`Progress: ${i + 1}/${namesToEnrich.length} (${progress}%) - ${successCount} success, ${errorCount} errors`, 'info');

      // Rate limiting delay
      if (i < namesToEnrich.length - 1) {
        await sleep(CONFIG.DELAY_MS);
      }

    } catch (error) {
      errorCount++;
      checkpoint.totalErrors++;

      log(`Failed to enrich ${nameEntry.name}: ${error.message}`, 'error');

      // Add to failed log
      failedLog.push({
        name: nameEntry.name,
        rank: nameEntry.popularityRank,
        error: error.message,
        timestamp: new Date().toISOString(),
        retries: 0
      });
      saveFailedLog(failedLog);

      // Update checkpoint
      checkpoint.lastProcessedIndex = i;
      checkpoint.lastProcessedName = nameEntry.name;
      saveCheckpoint(checkpoint);

      // Continue with next name (don't stop on errors)
      await sleep(CONFIG.DELAY_MS);
    }
  }

  log('', 'info');
  log('========================================', 'info');
  log('INITIAL PASS COMPLETE', 'success');
  log('========================================', 'info');
  log(`Successfully enriched: ${successCount} names`, 'success');
  log(`Errors: ${errorCount} names`, errorCount > 0 ? 'error' : 'info');
  log('', 'info');

  // Retry failed names
  if (failedLog.length > 0) {
    log('========================================', 'info');
    log('RETRYING FAILED NAMES', 'info');
    log('========================================', 'info');

    const stillFailed = [];

    for (const failed of failedLog) {
      if (failed.retries >= CONFIG.MAX_RETRIES) {
        stillFailed.push(failed);
        continue;
      }

      try {
        log(`Retrying: ${failed.name} (attempt ${failed.retries + 1}/${CONFIG.MAX_RETRIES})`, 'progress');

        const nameEntry = allNames.find(n => n.name === failed.name);
        const enrichedData = await enrichName(nameEntry);

        saveEnrichedData(enrichedData);

        manifest.names.push(failed.name.toLowerCase());
        manifest.totalEnriched = manifest.names.length;
        saveManifest(manifest);

        log(`Retry success: ${failed.name}`, 'success');
        successCount++;

        await sleep(CONFIG.DELAY_MS);

      } catch (error) {
        failed.retries++;
        failed.lastError = error.message;
        failed.lastRetry = new Date().toISOString();
        stillFailed.push(failed);

        log(`Retry failed: ${failed.name} - ${error.message}`, 'error');
        await sleep(CONFIG.DELAY_MS);
      }
    }

    saveFailedLog(stillFailed);

    log('', 'info');
    log(`Retry results: ${failedLog.length - stillFailed.length} recovered, ${stillFailed.length} still failed`, 'info');
  }

  // Final report
  log('', 'info');
  log('========================================', 'info');
  log('V13 ENRICHMENT COMPLETE! 🎉', 'success');
  log('========================================', 'info');
  log(`Total enriched in this run: ${successCount} names`, 'success');
  log(`Total in manifest: ${manifest.totalEnriched} names`, 'success');
  log(`Failed (after retries): ${failedLog.length} names`, failedLog.length > 0 ? 'warning' : 'success');
  log(`Started: ${checkpoint.startedAt}`, 'info');
  log(`Completed: ${new Date().toISOString()}`, 'info');

  if (failedLog.length > 0) {
    log('', 'info');
    log('Failed names:', 'warning');
    failedLog.forEach(f => log(`  - ${f.name} (${f.error})`, 'warning'));
  }

  log('', 'info');
  log('Next steps:', 'info');
  log('  1. Review enriched files in public/data/enriched/', 'info');
  log('  2. Test in UI by clicking on enriched names', 'info');
  log('  3. Commit to git: git add . && git commit -m "feat: v13 enrichment for top 1000 names"', 'info');
  log('  4. Deploy: npm run deploy', 'info');
  log('========================================', 'info');
};

// Run the script
main().catch(error => {
  log(`Fatal error: ${error.message}`, 'error');
  console.error(error);
  process.exit(1);
});
