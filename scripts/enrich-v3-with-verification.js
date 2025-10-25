/**
 * 🚀 V3.0 VERIFIED NAME ENRICHMENT
 *
 * Enhanced enrichment with features from top baby name sites:
 * - V2.0 fields: origin, nicknames, historical figures, celebrities, songs
 * - V3.0 NEW: similar names, pronunciation, pop culture, sibling names,
 *   middle names, international variations, cultural significance
 *
 * Two-pass system: Generate with GPT-4o → Verify → Auto-fix
 */

const fs = require('fs');
const path = require('path');
const OpenAI = require('openai');
const VerificationAgent = require('./verification-agent');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'process.env.OPENAI_API_KEY'
});

const OUTPUT_DIR = 'public/data/enriched';
const DATABASE_FILE = 'scripts/top-1000-names.json'; // Our curated list

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// Load database for name suggestions
let nameDatabase = [];
try {
  nameDatabase = JSON.parse(fs.readFileSync(DATABASE_FILE, 'utf8'));
  console.log(`📚 Loaded ${nameDatabase.length} names from database for suggestions\n`);
} catch (err) {
  console.warn('⚠️  Could not load name database for suggestions');
}

async function enrichNameV3(name, gender = 'unknown') {
  console.log(`\n${'='.repeat(70)}`);
  console.log(`🚀 V3.0 ENRICHING: ${name} (${gender})`);
  console.log(`${'='.repeat(70)}`);

  // PASS 1: Generate with GPT-4o
  console.log(`\n📝 PASS 1: Generating V3.0 enriched data with GPT-4o...`);
  const initialData = await generateEnrichedDataV3(name, gender);

  if (!initialData) {
    throw new Error('Failed to generate enriched data');
  }

  logGenerationStats(initialData);

  // PASS 2: Verify and Auto-fix
  console.log(`\n🔍 PASS 2: Verifying data with multi-source fact-checking...`);
  const verifier = new VerificationAgent();
  const result = await verifier.verify(initialData);

  const verifiedData = result.data;

  // Log verification summary
  const summary = verifier.getSummary();
  if (summary.totalFixes > 0) {
    console.log(`\n📊 VERIFICATION SUMMARY:`);
    console.log(`   Errors found: ${summary.totalErrors}`);
    console.log(`   Auto-fixed: ${summary.totalFixes}`);
    console.log(`\n   Fixes applied:`);
    summary.fixes.forEach(fix => console.log(`     • ${fix}`));
  }

  // Save verified data
  const filename = path.join(OUTPUT_DIR, `${verifiedData.slug}.json`);
  fs.writeFileSync(filename, JSON.stringify(verifiedData, null, 2));

  console.log(`\n✅ V3.0 VERIFIED DATA SAVED: ${filename}`);
  logFinalStats(verifiedData);

  return verifiedData;
}

function logGenerationStats(data) {
  console.log(`✅ Generated:`);
  console.log(`   ${data.origin?.fullHistory?.split(' ').length || 0} words of origin`);
  console.log(`   ${data.nicknames?.length || 0} nicknames`);
  console.log(`   ${data.historicalFigures?.length || 0} historical figures`);
  console.log(`   ${data.modernCelebrities?.length || 0} modern celebrities`);
  console.log(`   ${data.songs?.length || 0} songs`);
  console.log(`   ${data.pronunciation ? '✓' : '✗'} pronunciation guide`);
  console.log(`   ${data.similarNames ? (data.similarNames.girls?.length || 0) + (data.similarNames.boys?.length || 0) : 0} similar names`);
  console.log(`   ${data.siblingNames ? (data.siblingNames.sisters?.length || 0) + (data.siblingNames.brothers?.length || 0) : 0} sibling suggestions`);
  console.log(`   ${data.middleNames ? (data.middleNames.classic?.length || 0) + (data.middleNames.modern?.length || 0) : 0} middle name suggestions`);
  console.log(`   ${data.popCulture?.length || 0} pop culture references`);
  console.log(`   ${data.internationalVariations?.length || 0} international variations`);
  console.log(`   ${data.culturalSignificance?.summary ? '✓' : '✗'} cultural significance`);
}

function logFinalStats(data) {
  const totalWords =
    (data.origin?.fullHistory?.split(' ').length || 0) +
    (data.culturalSignificance?.summary?.split(' ').length || 0) +
    (data.popCulture?.reduce((sum, ref) => sum + (ref.description?.split(' ').length || 0), 0) || 0);

  console.log(`📊 FINAL V3.0 QUALITY:`);
  console.log(`   📝 Total word count: ~${totalWords} words`);
  console.log(`   ✅ ${data.nicknames?.length || 0} nicknames`);
  console.log(`   👑 ${data.historicalFigures?.length || 0} VERIFIED historical figures`);
  console.log(`   ⭐ ${data.modernCelebrities?.length || 0} VERIFIED celebrities`);
  console.log(`   🎵 ${data.songs?.length || 0} VERIFIED songs`);
  console.log(`   🗣️  ${data.pronunciation ? 'Pronunciation guide' : 'No pronunciation'}`);
  console.log(`   👥 ${data.similarNames ? (data.similarNames.girls?.length || 0) + (data.similarNames.boys?.length || 0) + (data.similarNames.unisex?.length || 0) : 0} similar names`);
  console.log(`   👨‍👩‍👧‍👦 ${data.siblingNames ? (data.siblingNames.sisters?.length || 0) + (data.siblingNames.brothers?.length || 0) : 0} sibling suggestions`);
  console.log(`   📛 ${data.middleNames ? (data.middleNames.classic?.length || 0) + (data.middleNames.modern?.length || 0) + (data.middleNames.unique?.length || 0) : 0} middle names`);
  console.log(`   🎬 ${data.popCulture?.length || 0} pop culture references`);
  console.log(`   🌍 ${data.internationalVariations?.length || 0} international variations`);
  console.log(`   🌏 ${data.culturalSignificance?.summary ? 'Cultural significance' : 'No cultural data'}`);
}

async function generateEnrichedDataV3(name, gender) {
  // Get similar names from our database for better suggestions
  const dbNames = nameDatabase.map(n => n.name).filter(n => n.toLowerCase() !== name.toLowerCase());

  const prompt = `You are a baby name expert and historian. Provide comprehensive V3.0 enriched data for "${name}" (${gender}).

CRITICAL REQUIREMENTS:
1. Historical figures MUST be deceased 100+ years ago (kings, queens, saints, historical leaders)
2. Modern celebrities MUST be living OR died in last 50 years
3. Songs MUST actually exist with real artist names
4. Pop culture characters MUST be from real movies/TV/books
5. Similar/sibling/middle names MUST be real English names
6. ALL Wikipedia/IMDB URLs must be exact and working

Return ONLY valid JSON with this structure:
{
  "name": "${name}",
  "slug": "${name.toLowerCase()}",
  "origin": {
    "fullHistory": "350-450 word detailed origin covering etymology, linguistic roots, geographical spread, cultural significance, historical evolution, and modern usage trends."
  },
  "nicknames": ["8-12 common nickname variations"],

  "historicalFigures": [
    {
      "name": "Full name (deceased 100+ years)",
      "famousFor": "Historical significance",
      "url": "https://en.wikipedia.org/wiki/EXACT_NAME"
    }
  ],

  "modernCelebrities": [
    {
      "name": "Full name",
      "famousFor": "What they're famous for (last 10 years preferred)",
      "url": "https://en.wikipedia.org/wiki/EXACT_NAME or IMDB URL"
    }
  ],

  "songs": [
    {
      "title": "Song title",
      "artist": "Artist name",
      "url": "https://music.youtube.com/search?q=SONG+ARTIST"
    }
  ],

  "pronunciation": {
    "phonetic": "Phonetic spelling (e.g., EM-uh)",
    "syllables": number,
    "syllableBreakdown": "Hyphenated (e.g., Em-ma)",
    "stressPattern": "Capitalized stress (e.g., EM-ma)"
  },

  "similarNames": {
    "girls": ["10 similar girl names - real names only"],
    "boys": ["10 similar boy names if unisex - real names only"],
    "unisex": ["5 unisex alternatives - real names only"]
  },

  "siblingNames": {
    "sisters": ["10 sister name suggestions matching style/era"],
    "brothers": ["10 brother name suggestions matching style/era"]
  },

  "middleNames": {
    "classic": ["5 classic middle names (Grace, Rose, etc.)"],
    "modern": ["5 modern middle names (Quinn, Sage, etc.)"],
    "unique": ["5 unique middle names (Celestine, etc.)"]
  },

  "popCulture": [
    {
      "character": "Character name",
      "source": "Movie/TV/Book title",
      "description": "Brief description (1-2 sentences)"
    }
  ],

  "internationalVariations": [
    {
      "language": "Language name",
      "name": "Variation"
    }
  ],

  "culturalSignificance": {
    "summary": "150-200 word paragraph on cultural importance, regional associations, and significance across different cultures"
  },

  "enriched": true,
  "enrichedAt": "${new Date().toISOString()}",
  "enrichedBy": "openai-gpt4o-v3-verified",
  "version": "3.0"
}

Be thorough, accurate, and comprehensive. This is V3.0 - make it rich with useful data!`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.3, // Lower for more accuracy
      max_tokens: 4500,
      response_format: { type: "json_object" }
    });

    const content = completion.choices[0].message.content.trim();
    const data = JSON.parse(content);
    return data;

  } catch (error) {
    console.error(`❌ Error enriching ${name}:`, error.message);
    throw error;
  }
}

async function main() {
  const args = process.argv.slice(2);
  const nameArg = args[0] || 'Emma';
  const genderArg = args[1] || 'girl';

  console.log('🚀 V3.0 NAME ENRICHMENT WITH VERIFICATION');
  console.log('========================================\n');

  try {
    await enrichNameV3(nameArg, genderArg);
    console.log('\n✅ SUCCESS! V3.0 enrichment complete');
  } catch (error) {
    console.error('\n❌ Failed:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { enrichNameV3 };
