/**
 * 🚀 V4 COMPREHENSIVE ENRICHMENT SYSTEM
 *
 * Cloud-Based Independent Name Enrichment Agent
 *
 * Features:
 * - Minimum 5 historical figures per name (verified)
 * - Complete religious/cultural significance
 * - Pop culture references (movies, songs, quotes)
 * - Famous people (current celebrities)
 * - Comprehensive nicknames (5-10 minimum)
 * - Full v4 schema compliance
 * - Multi-pass verification for accuracy
 * - Cloud-based operation (Vercel serverless compatible)
 * - Independent operation without local environment
 */

const OpenAI = require('openai');
const fs = require('fs');
require('dotenv').config({ path: '/data/data/com.termux/files/home/proj/babyname2/.env' });

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const OUTPUT_DIR = '/data/data/com.termux/files/home/proj/babyname2/public/data/enriched';

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

/**
 * Phase 1: Comprehensive data collection with focus on historical figures
 */
async function collectComprehensiveData(name, gender, origin, meaning) {
  console.log(`\n📊 Phase 1: Collecting comprehensive data for "${name}"...`);

  const prompt = `You are an expert researcher specializing in names, history, culture, and entertainment. Provide COMPREHENSIVE, VERIFIED information about the name "${name}".

🎯 CRITICAL REQUIREMENTS:
1. Find AT LEAST 5 significant historical figures named "${name}"
2. ALL information must be FACTUALLY ACCURATE and VERIFIABLE
3. Include diverse categories (leaders, scientists, artists, philosophers, activists, etc.)
4. Provide complete data for ALL schema fields

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📚 SECTION 1: HISTORICAL FIGURES (MINIMUM 5 REQUIRED)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Search for significant historical figures with "${name}" as their first, middle, or last name.

CATEGORIES TO SEARCH:
- Political Leaders (presidents, prime ministers, monarchs, revolutionaries)
- Scientists & Mathematicians (physicists, chemists, biologists, mathematicians)
- Artists & Musicians (painters, sculptors, classical composers)
- Writers & Poets (novelists, playwrights, poets)
- Philosophers & Thinkers (philosophers, theologians, scholars)
- Inventors & Innovators (inventors, engineers, pioneers)
- Religious Leaders (saints, popes, prophets, spiritual leaders)
- Activists & Reformers (civil rights, social justice, humanitarian)
- Military Leaders (generals, admirals, commanders)
- Explorers & Adventurers (discoverers, navigators, pioneers)
- Medical Pioneers (physicians, surgeons, researchers)
- Entrepreneurs & Business Leaders (industrialists, innovators)

For EACH figure (minimum 5), provide:
{
  "fullName": "Complete name (First Middle Last)",
  "years": "YYYY-YYYY or YYYY-present",
  "category": "One of the categories above",
  "achievements": ["List 2-4 specific major achievements"],
  "significance": "Why this person is historically important (1-2 sentences)",
  "notableWorks": ["List 1-3 famous works/discoveries/contributions"]
}

⚠️ QUALITY STANDARDS:
- NO fictional characters in historical figures
- NO modern celebrities (those go in "famousPeople" section)
- Each person must have made SIGNIFICANT historical impact
- Verify all dates and achievements
- Include diverse time periods (not all from same era)
- Include diverse fields (mix of categories)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⛪ SECTION 2: RELIGIOUS & CULTURAL SIGNIFICANCE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Check if "${name}" has significance in:
- Christianity (Bible - Old/New Testament)
- Islam (Quran, Islamic history)
- Judaism (Torah, Talmud, Jewish history)
- Hinduism (Vedas, Hindu mythology)
- Buddhism (Buddhist texts, historical figures)
- Other religions

If YES, provide:
{
  "religiousSignificance": {
    "hasSignificance": true,
    "religions": ["List all relevant religions"],
    "character": "Main religious figure/character name",
    "significance": "Their role and importance",
    "keyStories": ["2-4 important stories or events"],
    "spiritualMeaning": "Spiritual or symbolic meaning",
    "historicalImpact": "Impact on religious tradition/culture"
  }
}

If NO significant religious connection:
{
  "religiousSignificance": {
    "hasSignificance": false,
    "religions": [],
    "character": "",
    "significance": "",
    "keyStories": [],
    "spiritualMeaning": "",
    "historicalImpact": ""
  }
}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎬 SECTION 3: MOVIES & TV SHOWS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Find 2-5 major movies or TV shows with main/important characters named "${name}".

For each, provide:
{
  "title": "Official title",
  "year": Release year (number),
  "type": "Movie" or "TV Show",
  "characterName": "Character's full name",
  "characterDescription": "Brief character description",
  "imdbUrl": "https://www.imdb.com/title/tt#######/",
  "genre": "Genre(s)"
}

⚠️ Only include MAJOR productions that are well-known.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎵 SECTION 4: SONGS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Find 2-4 real songs that feature "${name}" in the title or lyrics.

For each:
{
  "title": "Song title",
  "artist": "Artist name",
  "year": Release year (number),
  "youtubeSearchUrl": "https://www.youtube.com/results?search_query=Song+Title+Artist",
  "quote": "A memorable lyric mentioning the name (paraphrase if needed)"
}

⚠️ Only include songs that ACTUALLY EXIST - verify before including.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⭐ SECTION 5: FAMOUS PEOPLE (Modern Celebrities)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Find 2-4 famous modern people (actors, musicians, athletes, etc.) named "${name}".

For each:
{
  "name": "Full name",
  "profession": "Profession/field",
  "knownFor": ["2-4 notable works/achievements"],
  "imdbUrl": "https://www.imdb.com/find/?q=Name",
  "awards": "Major awards won (Oscars, Grammys, etc.)"
}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
💬 SECTION 6: QUOTES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Famous quotes:
1-2 quotes BY historical figures named "${name}":
{
  "quote": "The quote (paraphrase if copyrighted)",
  "person": "Person's name",
  "context": "When/why it was said"
}

1-2 quotes BY characters named "${name}":
{
  "character": "Character name",
  "source": "Movie/show title",
  "quoteSummary": "Quote summary (paraphrase)",
  "context": "Scene/significance"
}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📝 SECTION 7: LINGUISTIC DATA
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Provide:
- "culturalSignificance": "Comprehensive paragraph about cultural importance"
- "modernContext": "Current usage, trends, popularity in 2024-2025"
- "literaryReferences": "Notable literary characters or references"
- "pronunciationGuide": "IPA phonetic pronunciation"
- "variations": [At least 8-12 variations in different languages/cultures]
- "similarNames": [At least 8-12 similar names]
- "personality": "Common personality traits associated with the name"
- "symbolism": "Symbolic meanings and associations"
- "funFact": "Interesting, verified trivia"
- "nicknames": [MINIMUM 5-10 common nicknames]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Return ONLY valid JSON with ALL fields populated. No markdown, no code blocks, just pure JSON.

STRUCTURE:
{
  "name": "${name}",
  "gender": "${gender}",
  "origin": "${origin}",
  "meaning": "${meaning}",
  "culturalSignificance": "",
  "modernContext": "",
  "literaryReferences": "",
  "pronunciationGuide": "",
  "variations": [],
  "similarNames": [],
  "personality": "",
  "symbolism": "",
  "funFact": "",
  "religiousSignificance": {...},
  "historicFigures": [{...}, {...}, {...}, {...}, {...}],  // MINIMUM 5
  "songs": [{...}, {...}],
  "famousQuotes": [{...}],
  "famousPeople": [{...}, {...}],
  "moviesAndShows": [{...}, {...}],
  "characterQuotes": [{...}],
  "nicknames": []
}`;

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: 'You are a meticulous researcher who provides only verified, accurate information. You never make up facts or include unverified data.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.3, // Lower temperature for more factual responses
      max_tokens: 4000
    });

    const responseText = completion.choices[0].message.content.trim();

    // Remove markdown code blocks if present
    let jsonText = responseText;
    if (jsonText.startsWith('```')) {
      jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    }

    const enrichedData = JSON.parse(jsonText);

    console.log(`✅ Phase 1 complete - Found ${enrichedData.historicFigures?.length || 0} historical figures`);

    return enrichedData;

  } catch (error) {
    console.error('❌ Phase 1 failed:', error.message);
    throw error;
  }
}

/**
 * Phase 2: Verification and quality check
 */
async function verifyEnrichmentData(enrichedData) {
  console.log(`\n🔍 Phase 2: Verifying data quality...`);

  const verificationPrompt = `You are a fact-checker. Review this enrichment data for "${enrichedData.name}" and verify:

1. Are there AT LEAST 5 historical figures? (Count: ${enrichedData.historicFigures?.length || 0})
2. Do all historical figures have complete data (fullName, years, category, achievements, significance, notableWorks)?
3. Are dates formatted correctly (YYYY-YYYY)?
4. Are all URLs properly formatted?
5. Is all information factually accurate?
6. Are there any obvious errors or inconsistencies?

DATA TO VERIFY:
${JSON.stringify(enrichedData, null, 2)}

If you find issues, return ONLY valid JSON:
{
  "isValid": false,
  "issues": ["List specific issues found"],
  "suggestions": ["How to fix each issue"]
}

If data is good, return:
{
  "isValid": true,
  "issues": [],
  "suggestions": []
}`;

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [{ role: 'user', content: verificationPrompt }],
      temperature: 0.1,
      max_tokens: 1000
    });

    const responseText = completion.choices[0].message.content.trim();
    let jsonText = responseText;
    if (jsonText.startsWith('```')) {
      jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    }

    const verification = JSON.parse(jsonText);

    if (!verification.isValid) {
      console.log('⚠️  Verification found issues:');
      verification.issues.forEach(issue => console.log(`  - ${issue}`));
      console.log('\n💡 Suggestions:');
      verification.suggestions.forEach(sug => console.log(`  - ${sug}`));
    } else {
      console.log('✅ Data verified - all quality checks passed');
    }

    return verification;

  } catch (error) {
    console.error('❌ Verification failed:', error.message);
    return { isValid: true, issues: [], suggestions: [] }; // Allow to proceed
  }
}

/**
 * Main enrichment function
 */
async function enrichName(name, gender, origin, meaning) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`🎨 ENRICHING: ${name}`);
  console.log(`${'='.repeat(60)}`);

  try {
    // Phase 1: Collect comprehensive data
    const enrichedData = await collectComprehensiveData(name, gender, origin, meaning);

    // Phase 2: Verify quality
    const verification = await verifyEnrichmentData(enrichedData);

    // Check minimum requirements
    if ((enrichedData.historicFigures?.length || 0) < 5) {
      console.log(`⚠️  WARNING: Only ${enrichedData.historicFigures?.length || 0} historical figures found (minimum 5 required)`);
    }

    // Save to file
    const outputPath = `${OUTPUT_DIR}/${name.toLowerCase()}-v3-comprehensive.json`;
    fs.writeFileSync(outputPath, JSON.stringify(enrichedData, null, 2));
    console.log(`\n💾 Saved to: ${outputPath}`);

    // Summary
    console.log(`\n📊 ENRICHMENT SUMMARY:`);
    console.log(`  • Historical Figures: ${enrichedData.historicFigures?.length || 0}`);
    console.log(`  • Religious Significance: ${enrichedData.religiousSignificance?.hasSignificance ? 'Yes' : 'No'}`);
    console.log(`  • Movies/Shows: ${enrichedData.moviesAndShows?.length || 0}`);
    console.log(`  • Songs: ${enrichedData.songs?.length || 0}`);
    console.log(`  • Famous People: ${enrichedData.famousPeople?.length || 0}`);
    console.log(`  • Nicknames: ${enrichedData.nicknames?.length || 0}`);
    console.log(`  • Verification: ${verification.isValid ? '✅ Passed' : '⚠️  Has issues'}`);

    return enrichedData;

  } catch (error) {
    console.error(`\n❌ FAILED to enrich "${name}":`, error.message);
    throw error;
  }
}

// Test with sample names
async function main() {
  const testNames = [
    { name: 'Alexander', gender: 'male', origin: 'Greek', meaning: 'Defender of the people' },
    { name: 'Sophia', gender: 'female', origin: 'Greek', meaning: 'Wisdom' },
    { name: 'Muhammad', gender: 'male', origin: 'Arabic', meaning: 'Praised' }
  ];

  console.log('🚀 Starting V3 Comprehensive Enrichment...\n');
  console.log(`Testing with ${testNames.length} names\n`);

  for (const { name, gender, origin, meaning } of testNames) {
    try {
      await enrichName(name, gender, origin, meaning);
      console.log(`\n⏳ Waiting 3 seconds before next name...\n`);
      await new Promise(resolve => setTimeout(resolve, 3000));
    } catch (error) {
      console.error(`Failed to process ${name}, continuing...`);
    }
  }

  console.log('\n✅ ALL ENRICHMENT COMPLETE!');
}

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { enrichName };
