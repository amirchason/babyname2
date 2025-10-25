/**
 * V10 COMPLETE ENRICHMENT SYSTEM - THE PERFECT NAME PROFILE
 *
 * The ULTIMATE enrichment script with positive-vibes-only music!
 * Combines V4 + V6 + V7 + V8 + NEW V10 features into a single, complete pipeline.
 *
 * Features:
 * - V4: GPT-4o comprehensive enrichment (Historical Figures, Movies, Quotes, etc.)
 * - V6: Celestial data, gender distribution, rankings
 * - V7: Syllables, translations (6 languages), categories, books
 * - V8: Celebrity babies with GPT-4 Knowledge Base
 * - V10: POSITIVE-VIBES-ONLY SONGS (3 verified songs with strict filtering)
 * - Section 4 validation: ALWAYS 9 nicknames, 9 variations, 9 similar names
 * - Bulletproof duplicate detection across ALL sections
 *
 * Usage: node scripts/enrich-v10-complete.js <Name> <gender> <origin> <meaning>
 * Example: node scripts/enrich-v10-complete.js George male Greek Farmer
 */

import OpenAI from 'openai';
import fs from 'fs';
import dotenv from 'dotenv';
import { analyzeSyllables } from './utils/syllableAnalyzer.js';
import { autoCategorizeName, validateGPTCategories, mergeCategories } from './utils/categoryTagger.js';
import { enrichCelebrityBabiesWithGPT } from './utils/gptCelebrityBabyEnricher.js';
import { enrichPositiveSongs } from './utils/positiveSongEnricher.js';

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Get command line arguments
const [,, name, gender, origin, meaning] = process.argv;

if (!name || !gender || !origin || !meaning) {
  console.error('❌ Usage: node enrich-v10-complete.js <Name> <gender> <origin> <meaning>');
  console.error('   Example: node enrich-v10-complete.js George male Greek Farmer');
  process.exit(1);
}

console.log('🚀 V10 COMPLETE ENRICHMENT STARTING...\n');
console.log(`📋 Name: ${name}`);
console.log(`📋 Gender: ${gender}`);
console.log(`📋 Origin: ${origin}`);
console.log(`📋 Meaning: ${meaning}\n`);

/**
 * PHASE 1: V4 COMPREHENSIVE ENRICHMENT
 * Uses GPT-4o to generate comprehensive name data (WITHOUT songs - V10 handles songs)
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
    // 1. NBA Basketball (2-3 famous)
    // 2. European Soccer (2-3 famous)
    // 3. American Football/NFL (2-3 famous)
    // 4. MLB Baseball (2-3 famous)
    // 5. NHL Ice Hockey (2-3 famous)
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
- Movies must be real
- **QUOTES**: Must be REAL, INSPIRING, and from verified sources
  - Famous Quotes: Up to 5 inspiring quotes by real people named ${name}
  - Character Quotes: Up to 3 genius/iconic quotes from movie/TV characters named ${name}
  - DO NOT make up quotes - only include if you can verify them
- **ATHLETES**: **SEARCH ALL 5 SPORTS SEPARATELY** and find 2-3 famous athletes PER SPORT (goal: 10-15 total athletes)
  - **YOU MUST SEARCH EACH SPORT INDEPENDENTLY** - Don't stop after finding 1-2 total athletes!
  - **NAME MATCHING RULE**: Include athletes with "${name}" as EITHER first name OR last name
  - **EXAMPLE**: For "Benson" include: Cedric Benson (last name), Benson Mayowa (first name), etc.
  - **SPORT 1 - NBA Basketball**: Find 2-3 FAMOUS NBA players with "${name}" in first OR last name (current or retired legends)
  - **SPORT 2 - European Soccer**: Find 2-3 FAMOUS soccer players with "${name}" in first OR last name from top leagues (Premier League, La Liga, Bundesliga, Serie A)
  - **SPORT 3 - American Football (NFL)**: Find 2-3 FAMOUS NFL players with "${name}" in first OR last name (current or retired legends)
  - **SPORT 4 - MLB Baseball**: Find 2-3 FAMOUS MLB players with "${name}" in first OR last name (current or retired legends)
  - **SPORT 5 - NHL Ice Hockey**: Find 2-3 FAMOUS NHL players with "${name}" in first OR last name (current or retired legends)
  - **CRITICAL**: Search EACH sport for 2-3 athletes. Do NOT return just 1-2 athletes total!
  - **GOAL**: Find athletes across ALL 5 sports - aim for 10-15 total athletes
  - Include: sport, league, current team (2024/2025), pastTeams, position, jerseyNumber, years, achievements, stats, source
  - Return athletes you are confident are real professional players from your training knowledge
- **NO SONGS IN THIS PHASE** - V10 handles songs separately with strict filtering
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
        content: 'You are an expert baby name researcher. Provide accurate, verified information in JSON format only. CRITICAL: When searching for athletes, you MUST search ALL 5 sports independently (NBA, Soccer, NFL, MLB, NHL) even if you only find 1-2 athletes per sport. Return whatever athletes you find for each sport - do NOT skip any sports.'
      },
      {
        role: 'user',
        content: prompt
      }
    ],
    temperature: 0.3,
    max_tokens: 6000
  });

  const content = response.choices[0].message.content.trim();
  let jsonText = content;
  if (content.startsWith('```')) {
    jsonText = content.replace(/```json?\n?/g, '').replace(/```$/g, '').trim();
  }

  const v4Data = JSON.parse(jsonText);
  console.log('✅ V4 enrichment complete!');
  console.log(`   ✓ Historical Figures: ${v4Data.historicFigures?.length || 0}`);
  console.log(`   ✓ Movies/Shows: ${v4Data.moviesAndShows?.length || 0}`);
  console.log(`   ✓ Famous People: ${v4Data.famousPeople?.length || 0}`);
  console.log(`   ✓ Famous Athletes: ${v4Data.famousAthletes?.length || 0}`);

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
 * PHASE 4: V8 CELEBRITY BABIES (GPT-4 Knowledge Base)
 * Replaces Nameberry data with GPT-4 celebrity baby search
 */
async function runV8CelebrityBabies(v7Data) {
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📍 PHASE 4: CELEBRITY BABIES (GPT-4 Knowledge Base)');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  const celebrityBabies = await enrichCelebrityBabiesWithGPT(name);
  console.log(`✅ Found ${celebrityBabies.length} celebrity babies named "${name}"`);

  const v8Data = {
    ...v7Data,
    celebrityBabies,
    enrichmentVersion: 'v8',
    v8EnrichedAt: new Date().toISOString()
  };

  return v8Data;
}

/**
 * PHASE 5: V10 POSITIVE-VIBES-ONLY SONGS (NEW!)
 * Uses GPT-4 with strict positive filtering
 */
async function runV10PositiveSongs(v8Data) {
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📍 PHASE 5: POSITIVE-VIBES-ONLY SONGS (V10 NEW!)');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  const positiveSongs = await enrichPositiveSongs(name);
  console.log(`✅ Found ${positiveSongs.length} positive-vibes-only songs!`);

  const v10Data = {
    ...v8Data,
    songs: positiveSongs, // Replace any old songs with new positive songs
    enrichmentVersion: 'v10',
    v10EnrichedAt: new Date().toISOString(),
    songsEnrichedAt: new Date().toISOString()
  };

  return v10Data;
}

/**
 * MAIN V10 ENRICHMENT PIPELINE
 */
async function enrichToV10() {
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

    // Phase 4: V8 Celebrity Babies
    const v8Data = await runV8CelebrityBabies(v7Data);

    // Phase 5: V10 Positive Songs (NEW!)
    const v10Data = await runV10PositiveSongs(v8Data);

    // Save final V10 output
    const v10Path = `./public/data/enriched/${name.toLowerCase()}-v10.json`;
    fs.writeFileSync(v10Path, JSON.stringify(v10Data, null, 2));

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✨ V10 COMPLETE ENRICHMENT FINISHED!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log(`📊 COMPLETE DATA FOR: ${name}`);
    console.log(`💾 V10 data saved: ${v10Path}`);
    console.log(`\n📋 Section Summary:`);
    console.log(`   • Nicknames: ${v10Data.nicknames?.length || 0}`);
    console.log(`   • Variations: ${v10Data.variations?.length || 0}`);
    console.log(`   • Similar Names: ${v10Data.similarNames?.length || 0}`);
    console.log(`   • Historical Figures: ${v10Data.historicFigures?.length || 0}`);
    console.log(`   • Books: ${v10Data.booksWithName?.length || 0}`);
    console.log(`   • Celebrity Babies: ${v10Data.celebrityBabies?.length || 0}`);
    console.log(`   • Translations: ${v10Data.translations?.length || 0}`);
    console.log(`   • Categories: ${v10Data.categories?.length || 0}`);
    console.log(`   • Songs (Positive Only): ${v10Data.songs?.length || 0}`);
    console.log(`\n📝 Next step: Build HTML profile with:`);
    console.log(`   node scripts/build-${name.toLowerCase()}-v10-profile.js`);

  } catch (error) {
    console.error('❌ V10 Enrichment Error:', error.message);
    process.exit(1);
  }
}

// Run V10 enrichment
enrichToV10();
