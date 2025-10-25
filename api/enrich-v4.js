/**
 * 🚀 V4 ENRICHMENT CLOUD AGENT
 *
 * Vercel Serverless Function - Independent Cloud-Based Name Enrichment
 *
 * Usage: POST /api/enrich-v4
 * Body: { "name": "John", "gender": "male", "origin": "Hebrew", "meaning": "God is gracious" }
 *
 * This is a cloud-based, independent enrichment system that runs on Vercel
 * without requiring local environment or phone/Claude Code.
 */

const OpenAI = require('openai');

// Vercel serverless function handler
module.exports = async (req, res) => {
  // CORS headers for cross-origin requests
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle OPTIONS preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only accept POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Use POST.' });
  }

  try {
    const { name, gender, origin, meaning } = req.body;

    if (!name || !gender || !origin || !meaning) {
      return res.status(400).json({
        error: 'Missing required fields: name, gender, origin, meaning'
      });
    }

    // Initialize OpenAI with environment variable
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });

    console.log(`🎨 V4 Enriching: ${name}...`);

    // Phase 1: Comprehensive data collection
    const enrichedData = await collectComprehensiveData(openai, name, gender, origin, meaning);

    // Phase 2: Verification
    const verification = await verifyEnrichmentData(openai, enrichedData);

    // Return enriched data with verification status
    return res.status(200).json({
      success: true,
      data: enrichedData,
      verification: verification,
      enrichmentVersion: 'v4',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ V4 Enrichment Error:', error);
    return res.status(500).json({
      error: 'Enrichment failed',
      message: error.message
    });
  }
};

/**
 * Phase 1: Comprehensive data collection with focus on historical figures
 */
async function collectComprehensiveData(openai, name, gender, origin, meaning) {
  const prompt = `You are an expert researcher specializing in names, history, culture, and entertainment. Provide COMPREHENSIVE, VERIFIED information about the name "${name}".

🎯 CRITICAL REQUIREMENTS:
1. Find AT LEAST 5 significant historical figures named "${name}"
2. **PRIORITY**: Include AT LEAST ONE very old historical figure (born before 1920) if available
3. ALL information must be FACTUALLY ACCURATE and VERIFIABLE
4. Include diverse categories (leaders, scientists, artists, philosophers, activists, etc.)
5. Provide complete data for ALL schema fields

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📚 SECTION 1: HISTORICAL FIGURES (MINIMUM 5 REQUIRED)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Search for significant historical figures with "${name}" as their first, middle, or last name.

⚡ HISTORICAL DEPTH REQUIREMENT:
Try to include AT LEAST ONE figure born before 1920 (ancient, medieval, renaissance, or early modern period).
This adds historical depth and cultural significance to the name.

CATEGORIES TO SEARCH:
- Political Leaders (presidents, prime ministers, monarchs, revolutionaries)
- Scientists & Mathematicians (researchers, inventors, Nobel laureates)
- Artists & Musicians (painters, composers, performers)
- Writers & Poets (authors, playwrights, journalists)
- Philosophers & Thinkers (scholars, theologians, intellectuals)
- Religious Leaders (saints, prophets, spiritual figures)
- Military Leaders (generals, admirals, war heroes)
- Activists & Reformers (civil rights, social justice, humanitarians)

For EACH historical figure, provide:
{
  "fullName": "Full legal name",
  "years": "YYYY-YYYY" (birth-death),
  "category": "One of the categories above",
  "achievements": ["3-5 major accomplishments"],
  "significance": "Why this person matters in history (2-3 sentences)",
  "notableWorks": ["Key publications, compositions, or creations"]
}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📖 SECTION 2: RELIGIOUS & CULTURAL SIGNIFICANCE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

If the name has religious significance, provide:
{
  "hasSignificance": true/false,
  "religions": ["Christianity", "Islam", "Judaism", etc.],
  "character": "Name of religious figure(s)",
  "significance": "Their role and importance",
  "keyStories": ["3-5 important stories or events"],
  "spiritualMeaning": "Spiritual/theological significance",
  "historicalImpact": "Impact on religion and society"
}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎬 SECTION 3: POP CULTURE REFERENCES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Find 2 notable movies/TV shows with characters named "${name}":
{
  "title": "Movie/Show title",
  "year": YYYY,
  "type": "Movie" or "TV Show",
  "characterName": "Character's full name",
  "characterDescription": "Who the character is (1-2 sentences)",
  "imdbUrl": "Direct IMDb URL",
  "genre": "Genre(s)"
}

Find 2 popular songs that mention or reference "${name}":
{
  "title": "Song title",
  "artist": "Artist name",
  "year": YYYY,
  "youtubeSearchUrl": "YouTube search URL",
  "quote": "Brief description or lyric reference"
}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⭐ SECTION 4: FAMOUS PEOPLE (CURRENT CELEBRITIES)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Find 2 currently famous people named "${name}":
{
  "name": "Full name",
  "profession": "Actor, Musician, Athlete, etc.",
  "knownFor": ["2-3 major works/achievements"],
  "imdbUrl": "IMDb or Wikipedia URL",
  "awards": "Major awards won"
}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
💬 SECTION 5: QUOTES & FUN FACTS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Famous quotes by people named "${name}":
{
  "quote": "The quote text",
  "person": "Who said it",
  "context": "When/where it was said"
}

Character quotes from movies/shows:
{
  "character": "Character name",
  "source": "Movie/Show name",
  "quoteSummary": "Memorable quote or catchphrase",
  "context": "When they say this"
}

Fun fact about the name (1-2 sentences of interesting trivia)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🌐 SECTION 6: VARIATIONS & RELATED NAMES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

- Nicknames: EXACTLY 9 UNIQUE common nicknames (no duplicates allowed)
- Variations: EXACTLY 9 UNIQUE international variations (no duplicates allowed)
- Similar names: EXACTLY 9 UNIQUE names with similar sound or meaning (no duplicates allowed)

🚨 CRITICAL: ALL THREE LISTS MUST HAVE EXACTLY 9 UNIQUE ITEMS. NO DUPLICATES!

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

RETURN COMPLETE JSON matching this exact schema:
{
  "name": "${name}",
  "gender": "${gender}",
  "origin": "${origin}",
  "meaning": "${meaning}",
  "culturalSignificance": "2-3 sentences about historical/cultural impact",
  "modernContext": "Current popularity and modern usage (2024-2025)",
  "literaryReferences": "Common literary usage",
  "pronunciationGuide": "IPA pronunciation",
  "variations": ["array of variations"],
  "similarNames": ["array of similar names"],
  "personality": "Common personality traits associated with the name",
  "symbolism": "Symbolic meanings",
  "funFact": "Interesting trivia",
  "religiousSignificance": { ... },
  "historicFigures": [ ... ],
  "songs": [ ... ],
  "famousQuotes": [ ... ],
  "famousPeople": [ ... ],
  "moviesAndShows": [ ... ],
  "characterQuotes": [ ... ],
  "nicknames": [ ... ]
}`;

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: 'You are a comprehensive name research expert. Return ONLY valid JSON.' },
      { role: 'user', content: prompt }
    ],
    temperature: 0.7,
    response_format: { type: 'json_object' }
  });

  const data = JSON.parse(completion.choices[0].message.content);
  console.log(`✅ Phase 1 complete - Found ${data.historicFigures?.length || 0} historical figures`);

  return data;
}

/**
 * Phase 2: Verification and quality check
 */
async function verifyEnrichmentData(openai, enrichedData) {
  const verificationPrompt = `You are a fact-checker. Review this name enrichment data for accuracy and completeness.

DATA TO VERIFY:
${JSON.stringify(enrichedData, null, 2)}

Check for:
1. At least 5 historical figures with complete data
2. Accurate years (YYYY-YYYY format)
3. Valid URLs (direct links, not search queries)
4. EXACTLY 9 UNIQUE nicknames (no duplicates)
5. EXACTLY 9 UNIQUE variations (no duplicates)
6. EXACTLY 9 UNIQUE similar names (no duplicates)
7. No duplicate entries in ANY list
8. Factually correct information
9. Complete religious significance (if applicable)

Return JSON:
{
  "passed": true/false,
  "issues": ["list of any problems found"],
  "suggestions": ["recommendations for improvement"]
}`;

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: 'You are a meticulous fact-checker. Return ONLY valid JSON.' },
      { role: 'user', content: verificationPrompt }
    ],
    temperature: 0.3,
    response_format: { type: 'json_object' }
  });

  const verification = JSON.parse(completion.choices[0].message.content);

  if (verification.passed) {
    console.log('✅ Data verified - all quality checks passed');
  } else {
    console.log('⚠️  Verification found issues:', verification.issues);
  }

  return verification;
}
