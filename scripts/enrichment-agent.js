/**
 * 🤖 CLOUD NAME ENRICHMENT AGENT
 *
 * Runs on GitHub Actions (cloud-only, fully automated)
 * Enriches top 1000 names with comprehensive data
 * Stores in Firebase Firestore with 'enriched' flag for resume capability
 *
 * Features:
 * - Resume capability (won't re-process enriched names)
 * - Quality validation
 * - Error handling with retries
 * - Progress tracking
 * - Cloud-only operation (no local dependencies)
 */

const fs = require('fs');
const path = require('path');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const admin = require('firebase-admin');

// ==========================================
// CONFIGURATION
// ==========================================

const CONFIG = {
  BATCH_SIZE: 1,           // Process 1 name at a time for quality
  DELAY_MS: 3000,          // 3 second delay between names
  MAX_NAMES: 1000,         // Total names to process
  MAX_RETRIES: 3,          // Retry failed enrichments
  OUTPUT_DIR: 'public/data/enriched',
  SITEMAP_PATH: 'public/sitemap-names.xml'
};

// ==========================================
// FIREBASE INITIALIZATION
// ==========================================

let firestoreInitialized = false;

function initializeFirebase() {
  if (firestoreInitialized) return;

  try {
    // Initialize with service account from environment
    const serviceAccount = JSON.parse(process.env.FIREBASE_ADMIN_KEY || '{}');

    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        projectId: 'babynames-app-9fa2a'
      });
    }

    firestoreInitialized = true;
    console.log('✅ Firebase initialized successfully');
  } catch (error) {
    console.error('❌ Firebase initialization failed:', error.message);
    console.log('⚠️  Running in file-only mode (no Firestore sync)');
  }
}

// ==========================================
// HELPER FUNCTIONS
// ==========================================

function generateSlug(name) {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function chunk(array, size) {
  const chunks = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}

// ==========================================
// SITEMAP PARSING
// ==========================================

function loadNamesFromSitemap(sitemapPath) {
  console.log(`📄 Loading names from ${sitemapPath}...`);

  if (!fs.existsSync(sitemapPath)) {
    throw new Error(`Sitemap not found: ${sitemapPath}`);
  }

  const xml = fs.readFileSync(sitemapPath, 'utf8');
  const urlMatches = xml.match(/<loc>([^<]+)<\/loc>/g) || [];

  const names = urlMatches
    .map(url => url.replace(/<\/?loc>/g, ''))
    .map(url => {
      const parts = url.split('/');
      const filename = parts[parts.length - 1];
      return filename.replace('.html', '');
    })
    .filter(name => name && name !== 'index')
    .slice(0, CONFIG.MAX_NAMES);

  console.log(`✅ Found ${names.length} names in sitemap\n`);
  return names;
}

// ==========================================
// ENRICHMENT STATUS TRACKING
// ==========================================

async function getEnrichedNames() {
  const enrichedNames = new Set();

  try {
    // Check Firestore first
    if (firestoreInitialized) {
      const db = admin.firestore();
      const snapshot = await db.collection('enrichedNames')
        .where('enriched', '==', true)
        .select('slug')
        .get();

      snapshot.forEach(doc => {
        enrichedNames.add(doc.id);
      });

      console.log(`📊 Firestore: ${enrichedNames.size} names already enriched`);
    }

    // Check local files as fallback
    if (fs.existsSync(CONFIG.OUTPUT_DIR)) {
      const files = fs.readdirSync(CONFIG.OUTPUT_DIR);
      files.forEach(file => {
        if (file.endsWith('.json')) {
          const slug = file.replace('.json', '');
          const data = JSON.parse(fs.readFileSync(path.join(CONFIG.OUTPUT_DIR, file), 'utf8'));
          if (data.enriched === true) {
            enrichedNames.add(slug);
          }
        }
      });

      console.log(`📂 Local files: ${enrichedNames.size} total enriched names`);
    }
  } catch (error) {
    console.error('⚠️  Error loading enriched names:', error.message);
  }

  return enrichedNames;
}

// ==========================================
// AI ENRICHMENT
// ==========================================

async function enrichName(name, genAI) {
  console.log(`\n🔍 Enriching: ${name}`);

  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

  const prompt = `You are a baby name expert. Provide comprehensive enrichment data for the name "${name}".

CRITICAL: Return ONLY valid JSON. No markdown, no code blocks, no explanations.

Required fields:
1. origin (object):
   - primary (string): Main origin/culture
   - secondary (array): Other origins if applicable
   - fullHistory (string): 300-400 word detailed origin story including etymology, geographical spread, cultural significance, and historical period
   - etymology (string): Root words and linguistic origins
   - geographicalSpread (string): How name spread across regions
   - culturalSignificance (string): Cultural/religious importance
   - historicalPeriod (string): When name became popular

2. nicknames (array): 5-10 common nicknames/diminutives

3. historicalFigures (array, max 3):
   Each with: name, period, famousFor, significance (50-100 words), wikipediaUrl (if available)

4. modernCelebrities (array, max 5, ONLY from last 10 years, TOP famous western culture figures):
   Each with: name, profession, famousFor, notableWorks (array), activeYears, wikipediaUrl, imdbUrl

5. songs (array, max 5):
   Songs with "${name}" in the title
   Each with: title, artist, year, genre, youtubeUrl (format: https://music.youtube.com/search?q=SONG+ARTIST), searchQuery

Return this exact JSON structure:
{
  "origin": {
    "primary": "",
    "secondary": [],
    "fullHistory": "",
    "etymology": "",
    "geographicalSpread": "",
    "culturalSignificance": "",
    "historicalPeriod": ""
  },
  "nicknames": [],
  "historicalFigures": [],
  "modernCelebrities": [],
  "songs": []
}`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text();

    // Clean response
    text = text
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim();

    // Parse JSON
    const data = JSON.parse(text);

    // Validate
    const validation = validateEnrichedData(data, name);
    if (!validation.valid) {
      console.log(`⚠️  Validation warnings for ${name}:`, validation.errors);
    }

    console.log(`✅ ${name} enriched successfully (quality: ${validation.quality})`);
    return {
      ...data,
      quality: validation.quality,
      validationErrors: validation.errors
    };

  } catch (error) {
    console.error(`❌ Error enriching ${name}:`, error.message);
    throw error;
  }
}

// ==========================================
// VALIDATION
// ==========================================

function validateEnrichedData(data, name) {
  const errors = [];
  const warnings = [];

  // Origin validation
  if (!data.origin?.fullHistory) {
    errors.push('Missing origin.fullHistory');
  } else {
    const wordCount = data.origin.fullHistory.split(/\s+/).length;
    if (wordCount < 50) {
      warnings.push(`Origin history too short (${wordCount} words, min 100)`);
    } else if (wordCount > 500) {
      warnings.push(`Origin history too long (${wordCount} words, max 400)`);
    }
  }

  if (!data.origin?.primary) {
    errors.push('Missing origin.primary');
  }

  // Nicknames validation
  if (!Array.isArray(data.nicknames) || data.nicknames.length === 0) {
    warnings.push('No nicknames provided');
  } else if (data.nicknames.length > 10) {
    warnings.push('Too many nicknames (max 10)');
  }

  // Historical figures validation
  if (Array.isArray(data.historicalFigures)) {
    if (data.historicalFigures.length > 3) {
      warnings.push('Too many historical figures (max 3)');
    }
    data.historicalFigures.forEach((fig, i) => {
      if (!fig.name || !fig.period || !fig.famousFor) {
        errors.push(`Historical figure ${i + 1} missing required fields`);
      }
    });
  }

  // Celebrities validation
  if (Array.isArray(data.modernCelebrities)) {
    if (data.modernCelebrities.length > 5) {
      warnings.push('Too many celebrities (max 5)');
    }
    const currentYear = new Date().getFullYear();
    data.modernCelebrities.forEach((celeb, i) => {
      if (!celeb.name || !celeb.famousFor) {
        errors.push(`Celebrity ${i + 1} missing required fields`);
      }
    });
  }

  // Songs validation
  if (Array.isArray(data.songs)) {
    if (data.songs.length > 5) {
      warnings.push('Too many songs (max 5)');
    }
    data.songs.forEach((song, i) => {
      if (!song.title || !song.artist) {
        errors.push(`Song ${i + 1} missing required fields`);
      }
      if (song.youtubeUrl && !song.youtubeUrl.includes('youtube.com')) {
        warnings.push(`Song ${i + 1} has invalid YouTube URL`);
      }
    });
  }

  // Calculate quality
  let quality = 'low';
  if (errors.length === 0) {
    const score = calculateQualityScore(data);
    quality = score >= 8 ? 'high' : score >= 5 ? 'medium' : 'low';
  }

  return {
    valid: errors.length === 0,
    errors: [...errors, ...warnings],
    quality
  };
}

function calculateQualityScore(data) {
  let score = 0;

  // Origin completeness
  const wordCount = data.origin?.fullHistory?.split(/\s+/).length || 0;
  if (wordCount >= 200) score += 2;
  else if (wordCount >= 100) score += 1;

  if (data.origin?.etymology) score += 1;
  if (data.origin?.culturalSignificance) score += 1;
  if (data.origin?.geographicalSpread) score += 1;

  // Data richness
  if (data.nicknames?.length >= 5) score += 1;
  if (data.historicalFigures?.length >= 2) score += 1;
  if (data.modernCelebrities?.length >= 3) score += 1;
  if (data.songs?.length >= 3) score += 1;

  // URL references
  const urlCount = [
    ...(data.historicalFigures?.map(f => f.wikipediaUrl) || []),
    ...(data.modernCelebrities?.map(c => c.wikipediaUrl) || []),
    ...(data.songs?.map(s => s.youtubeUrl) || [])
  ].filter(url => url).length;

  if (urlCount >= 5) score += 1;

  return score;
}

// ==========================================
// DATA STORAGE
// ==========================================

async function saveEnrichedData(name, data) {
  const slug = generateSlug(name);

  const fullData = {
    name,
    slug,
    ...data,
    enriched: true,  // CRITICAL: Flag for resume capability
    enrichedAt: new Date().toISOString(),
    enrichedBy: 'github-actions-agent-v1',
    version: '1.0'
  };

  // Save to local file
  try {
    if (!fs.existsSync(CONFIG.OUTPUT_DIR)) {
      fs.mkdirSync(CONFIG.OUTPUT_DIR, { recursive: true });
    }

    const outputPath = path.join(CONFIG.OUTPUT_DIR, `${slug}.json`);
    fs.writeFileSync(outputPath, JSON.stringify(fullData, null, 2), 'utf8');
    console.log(`   💾 Saved to file: ${outputPath}`);
  } catch (error) {
    console.error(`   ❌ Error saving to file:`, error.message);
  }

  // Save to Firestore with 'enriched' flag
  if (firestoreInitialized) {
    try {
      const db = admin.firestore();
      await db.collection('enrichedNames').doc(slug).set({
        ...fullData,
        enrichedAt: admin.firestore.FieldValue.serverTimestamp()
      });
      console.log(`   ☁️  Saved to Firestore with 'enriched' flag`);
    } catch (error) {
      console.error(`   ❌ Error saving to Firestore:`, error.message);
    }
  }
}

// ==========================================
// MAIN EXECUTION
// ==========================================

async function main() {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🤖 NAME ENRICHMENT AGENT STARTING');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`⏰ Started at: ${new Date().toISOString()}\n`);

  // Initialize Firebase
  initializeFirebase();

  // Initialize Gemini AI
  const apiKey = process.env.GEMINI_API_KEY || process.env.REACT_APP_GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY not found in environment variables');
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  console.log('✅ Gemini AI initialized\n');

  // Load names from sitemap
  const allNames = loadNamesFromSitemap(CONFIG.SITEMAP_PATH);

  // Get already enriched names
  const enrichedSet = await getEnrichedNames();

  // Filter out already enriched names (RESUME CAPABILITY)
  const toEnrich = allNames.filter(name => {
    const slug = generateSlug(name);
    return !enrichedSet.has(slug);
  });

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📊 ENRICHMENT STATUS');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`Total names in sitemap: ${allNames.length}`);
  console.log(`Already enriched: ${enrichedSet.size}`);
  console.log(`To be enriched: ${toEnrich.length}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  if (toEnrich.length === 0) {
    console.log('✅ All names already enriched! Nothing to do.');
    return;
  }

  // Process names
  let successCount = 0;
  let failCount = 0;

  for (let i = 0; i < toEnrich.length; i++) {
    const name = toEnrich[i];
    const progress = `[${i + 1}/${toEnrich.length}]`;

    console.log(`\n${progress} Processing: ${name}`);

    let attempts = 0;
    let success = false;

    while (attempts < CONFIG.MAX_RETRIES && !success) {
      try {
        attempts++;
        if (attempts > 1) {
          console.log(`   Retry attempt ${attempts}/${CONFIG.MAX_RETRIES}...`);
        }

        // Enrich name with AI
        const enrichedData = await enrichName(name, genAI);

        // Save to file + Firestore with 'enriched' flag
        await saveEnrichedData(name, enrichedData);

        successCount++;
        success = true;

        console.log(`   ✅ ${name} complete!`);

      } catch (error) {
        console.error(`   ❌ Attempt ${attempts} failed:`, error.message);

        if (attempts >= CONFIG.MAX_RETRIES) {
          failCount++;
          console.error(`   💀 ${name} failed after ${CONFIG.MAX_RETRIES} attempts`);
        } else {
          await sleep(CONFIG.DELAY_MS * attempts); // Exponential backoff
        }
      }
    }

    // Delay between names
    if (i < toEnrich.length - 1) {
      console.log(`   ⏳ Waiting ${CONFIG.DELAY_MS}ms...`);
      await sleep(CONFIG.DELAY_MS);
    }
  }

  // Summary
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('✨ ENRICHMENT COMPLETE!');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`⏰ Finished at: ${new Date().toISOString()}`);
  console.log(`✅ Successfully enriched: ${successCount}/${toEnrich.length}`);
  console.log(`❌ Failed: ${failCount}/${toEnrich.length}`);
  console.log(`📊 Total enriched (all time): ${enrichedSet.size + successCount}/${allNames.length}`);
  console.log(`📈 Progress: ${Math.round((enrichedSet.size + successCount) / allNames.length * 100)}%`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}

// Run agent
main()
  .then(() => {
    console.log('🎉 Agent completed successfully');
    process.exit(0);
  })
  .catch(error => {
    console.error('💥 Agent failed with error:', error);
    process.exit(1);
  });
