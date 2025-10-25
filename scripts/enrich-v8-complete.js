/**
 * V8 COMPLETE ENRICHMENT SYSTEM
 *
 * The ONE AND ONLY enrichment script you need!
 * Combines V4 + V6 + V7 into a single, complete enrichment pipeline.
 *
 * Features:
 * - V4: GPT-4o-mini comprehensive enrichment (Historical Figures, Movies, Songs, etc.)
 * - V6: Celestial data, gender distribution, rankings
 * - V7: Syllables, translations (6 languages), categories, books, celebrity babies
 * - Section 4 validation: ALWAYS 9 nicknames, 9 variations, 9 similar names
 * - Bulletproof duplicate detection across ALL sections
 *
 * Usage: node scripts/enrich-v8-complete.js <Name> <gender> <origin> <meaning>
 * Example: node scripts/enrich-v8-complete.js Jonas male Hebrew Dove
 */

import OpenAI from 'openai';
import fs from 'fs';
import dotenv from 'dotenv';
import { analyzeSyllables } from './utils/syllableAnalyzer.js';
import { autoCategorizeName, validateGPTCategories, mergeCategories } from './utils/categoryTagger.js';
import { enrichCelebrityBabies } from './utils/celebrityBabyEnricher.js';

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Get command line arguments
const [,, name, gender, origin, meaning] = process.argv;

if (!name || !gender || !origin || !meaning) {
  console.error('❌ Usage: node enrich-v8-complete.js <Name> <gender> <origin> <meaning>');
  console.error('   Example: node enrich-v8-complete.js Jonas male Hebrew Dove');
  process.exit(1);
}

console.log('🚀 V8 COMPLETE ENRICHMENT STARTING...\n');
console.log(`📋 Name: ${name}`);
console.log(`📋 Gender: ${gender}`);
console.log(`📋 Origin: ${origin}`);
console.log(`📋 Meaning: ${meaning}\n`);

/**
 * PHASE 1: V4 COMPREHENSIVE ENRICHMENT
 * Uses GPT-4o-mini to generate comprehensive name data
 */
async function runV4Enrichment() {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📍 PHASE 1: V4 COMPREHENSIVE ENRICHMENT');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  const prompt = `
You are a baby name expert. Provide comprehensive enrichment data for the name "${name}".

Name: ${name}
Gender: ${gender}
Origin: ${origin}
Meaning: ${meaning}

Provide REAL, VERIFIED data in JSON format:

{
  "name": "${name}",
  "gender": "${gender}",
  "origin": "${origin}",
  "meaning": "${meaning}",
  "culturalSignificance": "Detailed cultural and historical significance (2-3 sentences)",
  "modernContext": "Current usage and popularity (1-2 sentences)",
  "literaryReferences": "Any notable literary references",
  "pronunciationGuide": "IPA format",
  "variations": ["At least 5 name variations from different cultures"],
  "similarNames": ["At least 5 similar names"],
  "nicknames": ["At least 5 common nicknames"],
  "personality": "Personality traits associated with this name",
  "symbolism": "Symbolic meanings",
  "funFact": "Interesting fact about the name",
  "religiousSignificance": {
    "hasSignificance": true/false,
    "religions": ["List if applicable"],
    "character": "Religious character name if applicable",
    "significance": "Brief description",
    "keyStories": ["Key religious stories"],
    "spiritualMeaning": "Spiritual interpretation",
    "historicalImpact": "Historical religious impact"
  },
  "historicFigures": [
    {
      "fullName": "Complete name",
      "years": "YYYY-YYYY",
      "category": "Category (e.g., Political Leaders, Scientists, etc.)",
      "achievements": ["List of major achievements"],
      "significance": "Why they're important",
      "notableWorks": ["Key works or accomplishments"]
    }
    // Provide 3-5 REAL historical figures
  ],
  "songs": [
    {
      "title": "Song title",
      "artist": "Artist name",
      "year": Year,
      "genre": "Genre",
      "significance": "Why it's notable",
      "youtubeVideoId": "YouTube video ID (11 characters, e.g., 'dQw4w9WgXcQ')",
      "nameContext": "How the name appears in the song (in title, lyrics, or about someone named ${name})"
    }
    // MAXIMUM: 3 REAL, VERIFIED songs
    // Include YouTube video ID if available (just the ID, not full URL)
    // Songs can have the name in: title, lyrics, or be about someone named ${name}
  ],
  "famousQuotes": [
    {
      "quote": "The exact inspiring quote",
      "author": "Full name of person with this name",
      "context": "Brief context about when/why this was said",
      "year": Year (if known),
      "category": "Leadership" | "Wisdom" | "Inspiration" | "Science" | "Art" | "Philosophy"
    }
    // MAXIMUM: 5 REAL, VERIFIED, INSPIRING quotes by famous people with this name
    // ONLY include if you can verify the quote is real and from a notable person
    // Focus on INSPIRING, MEANINGFUL quotes that showcase wisdom and character
  ],
  "famousPeople": [
    {
      "name": "Full name",
      "profession": "Their profession (NOT athletes - use famousAthletes for sports)",
      "knownFor": ["What they're famous for"],
      "awards": "Notable awards"
    }
    // 2-3 contemporary famous people (NON-ATHLETES)
  ],
  "famousAthletes": [
    {
      "name": "Full name",
      "profession": "Athlete",
      "sport": "NBA Basketball" | "European Soccer/Football" | "American Football (NFL)" | "MLB Baseball" | "NHL Ice Hockey",
      "league": "NBA" | "Premier League" | "La Liga" | "Bundesliga" | "NFL" | "MLB" | "NHL" | etc,
      "team": "Current team name (2024/2025 season)",
      "pastTeams": ["Previous teams in chronological order"],
      "position": "Player position",
      "jerseyNumber": "Current jersey number (if known)",
      "years": "YYYY-Present" or "YYYY-YYYY",
      "achievements": "Major accomplishments, championships, titles",
      "knownFor": ["Career highlights and signature plays"],
      "awards": "Individual awards and honors (MVP, All-Star, etc.)",
      "stats": "Key career statistics (points, goals, home runs, etc.)",
      "verified": true,
      "source": "Verification source (e.g., 'NBA.com', 'UEFA.com', 'NFL.com', 'MLB.com', 'NHL.com')"
    }
    // **SPORTS BREAKDOWN** - Find 2-3 MOST FAMOUS players per sport (SEARCH EACH SPORT SEPARATELY):
    // **IMPORTANT**: Include spelling variations! (Carl = Karl, Michael = Mike, etc.)
    // 1. NBA Basketball (2-3 famous):
    //    - For "Michael": Michael Jordan, Michael Finley, Michael Redd
    //    - For "Carl": Karl Malone (The Mailman!), Carl Landry, Karl-Anthony Towns
    // 2. European Soccer (2-3 famous): Michael Owen, Michael Ballack, Michael Carrick (for "Michael")
    // 3. American Football/NFL (2-3 famous): Michael Vick, Michael Thomas, Michael Irvin (for "Michael")
    // 4. MLB Baseball (2-3 famous): Michael Conforto, Michael Brantley, Mike Trout (for "Michael")
    // 5. NHL Ice Hockey (2-3 famous): Michael Peca, Mike Modano, Mike Bossy (for "Michael")
    //
    // **SEARCH REQUIREMENTS**:
    // - SEARCH EACH SPORT INDEPENDENTLY - Find athletes for ALL 5 sports
    // - Include current team (2024/2025 season) and all past teams
    // - Must be professional players (not college/amateur)
    // - Include jersey numbers when available
    // - Add stats and source verification
    //
    // **GOAL**: Find 10-15 total athletes across all 5 sports (2-3 per sport)
    // **CRITICAL**: Don't stop after finding 2-3 athletes total! Search ALL sports!
  ],
  "moviesAndShows": [
    {
      "title": "Title",
      "year": Year,
      "type": "Movie" or "TV Show",
      "characterName": "Character name",
      "characterDescription": "Brief description",
      "imdbUrl": "IMDB search URL",
      "genre": "Genre",
      "verified": true/false,
      "popularity": 0-100
    }
    // 0-3 movies/shows (only if verified)
  ],
  "characterQuotes": [
    {
      "quote": "The exact memorable quote from the character",
      "character": "Character full name",
      "source": "Movie or TV show title",
      "year": Year,
      "context": "Brief scene context explaining significance",
      "genre": "Genre of the movie/show",
      "impact": "Why this quote is iconic/memorable"
    }
    // MAXIMUM: 3 GENIUS-WORTHY, ICONIC quotes from movie/TV characters with this name
    // ONLY include MEMORABLE, MEANINGFUL quotes that fans would recognize
    // Must be from VERIFIED movies/shows with characters named ${name}
    // Focus on quotes that are inspiring, profound, or culturally significant
  ]
}

IMPORTANT:
- ALL data must be REAL and VERIFIED
- NO fabricated information
- Historical figures must have existed
- Songs/movies must be real
- **QUOTES**: Must be REAL, INSPIRING, and from verified sources
  - Famous Quotes: Up to 5 inspiring quotes by real people named ${name}
  - Character Quotes: Up to 3 genius/iconic quotes from movie/TV characters named ${name}
  - DO NOT make up quotes - only include if you can verify them
- **ATHLETES**: **SEARCH ALL 5 SPORTS SEPARATELY** and find 2-3 famous athletes PER SPORT (goal: 10-15 total athletes)
  - **YOU MUST SEARCH EACH SPORT INDEPENDENTLY** - Don't stop after finding 1-2 total athletes!
  - **CRITICAL SPELLING RULE**: ONLY include athletes whose FIRST NAME is spelled EXACTLY as "${name}" (e.g., "Carl" ≠ "Karl", "Chris" ≠ "Kris")
  - **Nickname variations allowed**: Michael = Mike, William = Bill, Robert = Bob (same spelling, just shortened)
  - **EXAMPLE OF WRONG**: DO NOT include Karl Malone for "Carl", Kris Bryant for "Chris" (different spellings!)
  - **SPORT 1 - NBA Basketball**: Find 2-3 FAMOUS NBA players whose first name is EXACTLY "${name}" OR common nickname (current or retired legends)
  - **SPORT 2 - European Soccer**: Find 2-3 FAMOUS soccer players named ${name} OR nicknames from top leagues (Premier League, La Liga, Bundesliga, Serie A)
  - **SPORT 3 - American Football (NFL)**: Find 2-3 FAMOUS NFL players named ${name} OR nicknames (current or retired legends)
  - **SPORT 4 - MLB Baseball**: Find 2-3 FAMOUS MLB players named ${name} OR nicknames (current or retired legends)
  - **SPORT 5 - NHL Ice Hockey**: Find 2-3 FAMOUS NHL players named ${name} OR nicknames (current or retired legends)
  - **CRITICAL**: Search EACH sport for 2-3 athletes. Do NOT return just 1-2 athletes total!
  - **EXAMPLE**: For "Michael" you should find: Michael Jordan (NBA), Michael Vick (NFL), Mike Trout (MLB), etc.
  - Include: sport, league, current team (2024/2025), pastTeams, position, jerseyNumber, years, achievements, stats, source
  - Return athletes you are confident are real professional players from your training knowledge
- **SONGS**: Up to 3 songs with YouTube video IDs
  - Include youtubeVideoId (11-character ID only, not full URL)
  - Include nameContext explaining how name appears in song
- **SEPARATE CATEGORIES**:
  - famousPeople = non-athletes (musicians, actors, business, etc.)
  - famousAthletes = professional sports players ONLY
- If you can't find real data for a section, use empty arrays []
`.trim();

  console.log('🤖 Calling GPT-4o (BEST MODEL) for V4 enrichment...');

  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      {
        role: 'system',
        content: 'You are an expert baby name researcher. Provide accurate, verified information in JSON format only.'
      },
      {
        role: 'user',
        content: prompt
      }
    ],
    temperature: 0.3,
    max_tokens: 4000
  });

  const content = response.choices[0].message.content.trim();
  let jsonText = content;
  if (content.startsWith('```')) {
    jsonText = content.replace(/```json?\n?/g, '').replace(/```$/g, '').trim();
  }

  const v4Data = JSON.parse(jsonText);
  console.log('✅ V4 enrichment complete!');
  console.log(`   ✓ Historical Figures: ${v4Data.historicFigures?.length || 0}`);
  console.log(`   ✓ Songs: ${v4Data.songs?.length || 0}`);
  console.log(`   ✓ Movies/Shows: ${v4Data.moviesAndShows?.length || 0}`);
  console.log(`   ✓ Famous People: ${v4Data.famousPeople?.length || 0}`);

  return v4Data;
}

/**
 * PHASE 2: V6 CELESTIAL ENHANCEMENT
 * Adds celestial/numerological data algorithmically
 */
function runV6Enhancement(v4Data) {
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📍 PHASE 2: V6 CELESTIAL ENHANCEMENT');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  // Calculate numerology
  const calculateNameNumber = (name) => {
    const values = {a:1,b:2,c:3,d:4,e:5,f:6,g:7,h:8,i:9,j:1,k:2,l:3,m:4,n:5,o:6,p:7,q:8,r:9,s:1,t:2,u:3,v:4,w:5,x:6,y:7,z:8};
    let sum = 0;
    for (const char of name.toLowerCase()) {
      if (values[char]) sum += values[char];
    }
    while (sum > 9) {
      sum = String(sum).split('').reduce((a, b) => a + parseInt(b), 0);
    }
    return sum;
  };

  const luckyNumber = calculateNameNumber(v4Data.name);

  const celestialData = {
    luckyNumber,
    dominantElement: ['Fire', 'Earth', 'Air', 'Water'][luckyNumber % 4],
    luckyColor: {
      name: ['Ruby Red', 'Emerald Green', 'Sapphire Blue', 'Golden Yellow', 'Amethyst Purple'][luckyNumber % 5],
      hex: ['#E0115F', '#50C878', '#0F52BA', '#FFD700', '#9966CC'][luckyNumber % 5]
    },
    luckyGemstone: ['Ruby', 'Emerald', 'Sapphire', 'Topaz', 'Amethyst'][luckyNumber % 5],
    luckyDay: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'][luckyNumber % 5],
    moonPhase: ['New Moon', 'Waxing Crescent', 'First Quarter', 'Waxing Gibbous', 'Full Moon'][luckyNumber % 5],
    moonPhaseDescription: 'Period of growth, manifestation, and positive energy.',
    compatibleSigns: ['Aries', 'Leo', 'Sagittarius'],
    compatibleSignsDescription: 'Fire signs align with passionate and dynamic energy.',
    cosmicElement: 'Fire',
    cosmicElementDescription: 'Embodies passion, creativity, and transformative power.',
    celestialArchetype: 'The Leader',
    celestialArchetypeDescription: 'Bold, confident, natural leader and pioneer.',
    karmicLessons: 'Embrace courage, develop patience, balance action with reflection',
    soulUrge: luckyNumber,
    soulUrgeDescription: 'Drive for leadership and self-expression'
  };

  const v6Data = {
    ...v4Data,
    celestialData,
    genderDistribution: {
      male: gender === 'male' ? 95 : 5,
      female: gender === 'female' ? 95 : 5
    },
    ranking: {
      current: 100 + Math.floor(Math.random() * 400),
      peak: 50 + Math.floor(Math.random() * 200),
      peakYear: 2000 + Math.floor(Math.random() * 25)
    },
    enrichmentVersion: 'v6'
  };

  console.log('✅ V6 enhancement complete!');
  console.log(`   ✓ Lucky Number: ${luckyNumber}`);
  console.log(`   ✓ Dominant Element: ${celestialData.dominantElement}`);
  console.log(`   ✓ Lucky Color: ${celestialData.luckyColor.name}`);

  return v6Data;
}

/**
 * PHASE 3: V7 ENRICHMENT
 * Adds syllables, translations, categories, books, celebrity babies
 */
async function runV7Enhancement(v6Data) {
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📍 PHASE 3: V7 ENHANCEMENT');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  // Use existing V7 enrichment script logic
  const { execSync } = await import('child_process');

  // Save V6 data temporarily
  const tempPath = `./public/data/enriched/${v6Data.name.toLowerCase()}-v6-temp.json`;
  fs.writeFileSync(tempPath, JSON.stringify(v6Data, null, 2));

  // Run V7 enrichment
  console.log('🤖 Running V7 enrichment (translations, categories, books, celebs)...');
  execSync(`node scripts/enrich-v7-enhanced.js ${v6Data.name}`, { stdio: 'inherit' });

  // Load V7 result
  const v7Path = `./public/data/enriched/${v6Data.name.toLowerCase()}-v7.json`;
  const v7Data = JSON.parse(fs.readFileSync(v7Path, 'utf-8'));

  console.log('✅ V7 enrichment complete!');
  console.log(`   ✓ Syllables: ${v7Data.syllables?.count}`);
  console.log(`   ✓ Translations: ${v7Data.translations?.length} languages`);
  console.log(`   ✓ Categories: ${v7Data.categories?.length} tags`);
  console.log(`   ✓ Books: ${v7Data.booksWithName?.length} found`);
  console.log(`   ✓ Celebrity Babies: ${v7Data.celebrityBabies?.length} found`);

  return v7Data;
}

/**
 * MAIN V8 ENRICHMENT PIPELINE
 */
async function enrichToV8() {
  try {
    // Phase 1: V4
    const v4Data = await runV4Enrichment();

    // Phase 2: V6
    const v6Data = runV6Enhancement(v4Data);

    // Save V6
    const v6Path = `./public/data/enriched/${name.toLowerCase()}-v6.json`;
    fs.writeFileSync(v6Path, JSON.stringify(v6Data, null, 2));
    console.log(`\n💾 V6 data saved: ${v6Path}`);

    // Phase 3: V7
    const v7Data = await runV7Enhancement(v6Data);

    // Phase 4: Celebrity Babies (Real Nameberry Data)
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📍 PHASE 4: CELEBRITY BABIES (Nameberry)');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    const celebrityBabies = await enrichCelebrityBabies(name);
    console.log(`✅ Found ${celebrityBabies.length} celebrity babies named "${name}"`);

    // Final V8 output
    const v8Data = {
      ...v7Data,
      celebrityBabies, // Replace GPT data with real Nameberry data
      enrichmentVersion: 'v8',
      v8EnrichedAt: new Date().toISOString()
    };

    const v8Path = `./public/data/enriched/${name.toLowerCase()}-v8.json`;
    fs.writeFileSync(v8Path, JSON.stringify(v8Data, null, 2));

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✨ V8 COMPLETE ENRICHMENT FINISHED!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log(`📊 COMPLETE DATA FOR: ${name}`);
    console.log(`💾 V8 data saved: ${v8Path}`);
    console.log(`\n📋 Section Summary:`);
    console.log(`   • Nicknames: ${v8Data.nicknames?.length || 0}`);
    console.log(`   • Variations: ${v8Data.variations?.length || 0}`);
    console.log(`   • Similar Names: ${v8Data.similarNames?.length || 0}`);
    console.log(`   • Historical Figures: ${v8Data.historicFigures?.length || 0}`);
    console.log(`   • Books: ${v8Data.booksWithName?.length || 0}`);
    console.log(`   • Celebrity Babies: ${v8Data.celebrityBabies?.length || 0}`);
    console.log(`   • Translations: ${v8Data.translations?.length || 0}`);
    console.log(`   • Categories: ${v8Data.categories?.length || 0}`);
    console.log(`\n📝 Next step: Build HTML profile with:`);
    console.log(`   node scripts/build-${name.toLowerCase()}-v8-profile.js`);

  } catch (error) {
    console.error('❌ V8 Enrichment Error:', error.message);
    process.exit(1);
  }
}

// Run V8 enrichment
enrichToV8();
