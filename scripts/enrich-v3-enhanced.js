/**
 * 🚀 V3.0 ENHANCED ENRICHMENT SYSTEM
 *
 * New Features:
 * 1. Biblical/Religious significance with historical context
 * 2. Historic figures (scientists, leaders, writers, philosophers, inventors, etc.)
 * 3. Two-pass fact checking with GPT-4
 * 4. Comprehensive verification of all data
 */

const OpenAI = require('openai');
const fs = require('fs');
require('dotenv').config({ path: '/data/data/com.termux/files/home/proj/babyname2/.env' });

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Categories of significant historical figures
const HISTORIC_CATEGORIES = [
  'Scientists',
  'Political Leaders',
  'Writers & Poets',
  'Philosophers',
  'Inventors',
  'Explorers',
  'Military Leaders',
  'Religious Leaders',
  'Activists & Reformers',
  'Artists & Composers',
  'Mathematicians',
  'Physicians & Medical Pioneers'
];

async function enrichNameV3Enhanced(name, gender, origin, meaning) {
  console.log(`\n🎨 Enriching: ${name}`);
  console.log('=' .repeat(50));

  // PHASE 1: Initial enrichment with GPT-4
  const phase1Prompt = `You are an expert historian, religious scholar, and entertainment researcher. Provide comprehensive, VERIFIED information about the name "${name}".

⚠️ CRITICAL: ONLY include VERIFIED, FACTUAL information. If you're unsure, say "Unknown" or omit that section.

BIBLICAL/RELIGIOUS SIGNIFICANCE:
1. Check if "${name}" has biblical, religious, or spiritual significance (Christianity, Judaism, Islam, Hinduism, Buddhism, etc.)
2. If YES, provide:
   - Which religious texts mention this name
   - The character/person's role and significance
   - Key stories or events associated with them
   - Spiritual meaning or symbolism
   - Historical impact on faith traditions
3. If NO religious significance, state: "No significant religious or biblical association found"

HISTORIC FIGURES (NOT celebrities/entertainers):
Search for up to 5 significant historical figures with "${name}" as their FIRST, MIDDLE, or LAST name.
Categories to search: Scientists, Political Leaders, Writers/Poets, Philosophers, Inventors, Explorers, Military Leaders, Religious Leaders, Activists, Artists/Composers, Mathematicians, Medical Pioneers

For each historic figure found, include:
- Full name
- Birth-death years (if known)
- Primary field/category
- Major achievements or contributions
- Historical significance (why they're remembered)
- Notable works, discoveries, or actions

⚠️ ONLY include figures who made SIGNIFICANT historical impact. No minor figures.

ENTERTAINMENT DATA (Verified):
SONGS:
- ONLY songs that ACTUALLY EXIST in Spotify, Apple Music, or Billboard charts
- VERIFY each song exists before including
- Include real lyrics mentioning "${name}"
- Better to have 1-2 verified songs than fake ones

FAMOUS PEOPLE (Actors/Musicians):
- Top 2-3 most famous actors/musicians named ${name}
- Verify IMDB/Grammy/major awards
- List their most notable works

MOVIES/TV SHOWS:
- Top 2-3 productions with main characters named ${name}
- Include IMDB links: https://www.imdb.com/title/tt#######/
- Verify these are major productions

CHARACTER QUOTES:
- 1-2 memorable quotes by characters named ${name}
- PARAPHRASE - do NOT copy exact dialogue
- Describe context and significance

Return ONLY valid JSON (no markdown, no code blocks):
{
  "culturalSignificance": "2-3 sentences",
  "modernContext": "2-3 sentences",
  "literaryReferences": "Notable characters or famous people",
  "pronunciationGuide": "Phonetic pronunciation",
  "variations": ["Up to 9 name variations"],
  "similarNames": ["Up to 9 similar names"],
  "personality": "Personality traits",
  "symbolism": "Symbolic meanings",
  "funFact": "Interesting fact",
  "religiousSignificance": {
    "hasSignificance": true/false,
    "religions": ["Christianity", "Judaism", etc.],
    "character": "Name and role of biblical/religious figure",
    "significance": "Their role and importance",
    "keyStories": ["Story 1", "Story 2"],
    "spiritualMeaning": "Spiritual symbolism",
    "historicalImpact": "Impact on faith traditions"
  },
  "historicFigures": [
    {
      "fullName": "Full name",
      "years": "1879-1955",
      "category": "Scientist",
      "achievements": ["Achievement 1", "Achievement 2"],
      "significance": "Why they're remembered",
      "notableWorks": ["Work 1", "Work 2"]
    }
  ],
  "songs": [
    {
      "title": "Song title",
      "artist": "Artist",
      "year": 2020,
      "youtubeSearchUrl": "https://www.youtube.com/results?search_query=...",
      "quote": "Real lyric mentioning ${name}"
    }
  ],
  "famousQuotes": [
    {
      "quote": "Actual quote",
      "person": "Full name",
      "context": "Context"
    }
  ],
  "famousPeople": [
    {
      "name": "Full name",
      "profession": "Actor/Musician",
      "knownFor": ["Work 1", "Work 2", "Work 3"],
      "imdbUrl": "https://www.imdb.com/find/?q=...",
      "awards": "Awards info"
    }
  ],
  "moviesAndShows": [
    {
      "title": "Title",
      "year": 2020,
      "type": "Movie/TV Series",
      "characterName": "${name} LastName",
      "characterDescription": "Description",
      "imdbUrl": "https://www.imdb.com/title/tt#######/",
      "genre": "Genre"
    }
  ],
  "characterQuotes": [
    {
      "character": "${name} Character",
      "source": "Movie/Show",
      "quoteSummary": "Paraphrased quote essence",
      "context": "Why significant"
    }
  ],
  "nicknames": ["Up to 12 nicknames"]
}`;

  try {
    console.log('📝 Phase 1: Initial enrichment with GPT-4...');

    const phase1Response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: 'You are a JSON-only API. Return ONLY valid JSON with no explanations, no markdown, no code blocks.' },
        { role: 'user', content: phase1Prompt }
      ],
      temperature: 0.2, // Lower temperature for more factual responses
      max_tokens: 4500
    });

    let phase1Content = phase1Response.choices[0].message.content.trim();
    // Remove markdown code blocks if present
    phase1Content = phase1Content.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    let enrichment = JSON.parse(phase1Content);

    console.log('✅ Phase 1 complete');
    console.log(`   - Religious significance: ${enrichment.religiousSignificance?.hasSignificance ? 'YES' : 'NO'}`);
    console.log(`   - Historic figures found: ${enrichment.historicFigures?.length || 0}`);
    console.log(`   - Songs found: ${enrichment.songs?.length || 0}`);
    console.log(`   - Famous people found: ${enrichment.famousPeople?.length || 0}`);

    // PHASE 2: Fact checking and verification
    const phase2Prompt = `You are a fact-checker and data validator. Review this enrichment data for the name "${name}" and:

1. VERIFY all facts are correct
2. CHECK that all songs actually exist
3. VERIFY historical figures are real and achievements are accurate
4. CONFIRM religious/biblical information is correct
5. VALIDATE IMDB links and movie/show information
6. Fix any errors or inaccuracies

⚠️ If you find FALSE information, mark it and provide corrections.

DATA TO VERIFY:
${JSON.stringify(enrichment, null, 2)}

Return the CORRECTED data in the SAME JSON format. If everything is correct, return it unchanged. If you made corrections, ensure they are accurate.`;

    console.log('\n🔍 Phase 2: Fact checking and verification...');

    const phase2Response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: 'You are a JSON-only API. Return ONLY valid JSON with no explanations, no markdown, no code blocks.' },
        { role: 'user', content: phase2Prompt }
      ],
      temperature: 0.1, // Even lower for fact-checking
      max_tokens: 4500
    });

    let phase2Content = phase2Response.choices[0].message.content.trim();
    // Remove markdown code blocks if present
    phase2Content = phase2Content.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    enrichment = JSON.parse(phase2Content);

    console.log('✅ Phase 2 complete - Data verified');

    // PHASE 3: Second fact-check pass
    const phase3Prompt = `Final verification pass for the name "${name}". This is the SECOND fact-check.

Critical verification:
1. Are ALL songs real and verifiable?
2. Are ALL historical figures accurately described?
3. Is religious/biblical information correct?
4. Are all dates, years, and facts accurate?
5. Are IMDB links valid format?

DATA FOR FINAL VERIFICATION:
${JSON.stringify(enrichment, null, 2)}

Return ONLY the verified JSON. Make final corrections if needed.`;

    console.log('\n🔍 Phase 3: Second fact-check pass...');

    const phase3Response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: 'You are a JSON-only API. Return ONLY valid JSON with no explanations, no markdown, no code blocks.' },
        { role: 'user', content: phase3Prompt }
      ],
      temperature: 0.1,
      max_tokens: 4500
    });

    let phase3Content = phase3Response.choices[0].message.content.trim();
    // Remove markdown code blocks if present
    phase3Content = phase3Content.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    enrichment = JSON.parse(phase3Content);

    console.log('✅ Phase 3 complete - Final verification done');
    console.log('\n🎉 All phases complete! Data is verified and enriched.');

    return enrichment;

  } catch (error) {
    console.error('❌ Error during enrichment:', error.message);
    throw error;
  }
}

// Test with a single name
async function testEnrichment() {
  const testName = {
    name: "John",
    gender: "male",
    origin: "Hebrew",
    meaning: "God is gracious"
  };

  try {
    const enriched = await enrichNameV3Enhanced(
      testName.name,
      testName.gender,
      testName.origin,
      testName.meaning
    );

    // Save result
    const outputPath = '/data/data/com.termux/files/home/proj/babyname2/public/data/enriched/john-v3-enhanced.json';
    fs.mkdirSync('/data/data/com.termux/files/home/proj/babyname2/public/data/enriched', { recursive: true });

    const fullData = {
      ...testName,
      ...enriched
    };

    fs.writeFileSync(outputPath, JSON.stringify(fullData, null, 2));

    console.log('\n📊 ENRICHMENT SUMMARY:');
    console.log('=' .repeat(50));
    console.log(`Name: ${testName.name}`);
    console.log(`Religious Significance: ${enriched.religiousSignificance?.hasSignificance ? 'YES ✅' : 'NO'}`);
    if (enriched.religiousSignificance?.hasSignificance) {
      console.log(`  - Character: ${enriched.religiousSignificance.character}`);
      console.log(`  - Religions: ${enriched.religiousSignificance.religions.join(', ')}`);
    }
    console.log(`Historic Figures: ${enriched.historicFigures?.length || 0}`);
    enriched.historicFigures?.forEach((fig, i) => {
      console.log(`  ${i+1}. ${fig.fullName} (${fig.category})`);
    });
    console.log(`Songs: ${enriched.songs?.length || 0}`);
    console.log(`Famous People: ${enriched.famousPeople?.length || 0}`);
    console.log(`Movies/Shows: ${enriched.moviesAndShows?.length || 0}`);
    console.log('\n💾 Saved to:', outputPath);

  } catch (error) {
    console.error('Test failed:', error.message);
  }
}

// Run test
testEnrichment();
