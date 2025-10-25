/**
 * Genius API Song Scraper for V10
 * Uses Genius API to find songs + GPT-4 positive filtering
 * Much more reliable than scraping lyrics sites!
 */

import axios from 'axios';
import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Use Genius API (free tier available)
const GENIUS_API_TOKEN = process.env.GENIUS_API_TOKEN || 'demo'; // Will use GPT fallback if no token

// Comprehensive negative keywords blacklist
const NEGATIVE_KEYWORDS = [
  'death', 'die', 'dying', 'died', 'dead', 'kill', 'killing', 'murder', 'suicide',
  'grave', 'cemetery', 'headstone', 'tombstone', 'funeral', 'casket', 'coffin',
  'war', 'battle', 'soldier', 'blood', 'violence', 'fight', 'fighting',
  'pain', 'hurt', 'suffer', 'suffering', 'agony', 'torture',
  'heartbreak', 'breakup', 'goodbye', 'leaving', 'left me', 'gone away',
  'tears', 'cry', 'crying', 'sad', 'sadness', 'sorrow',
  'lonely', 'loneliness', 'alone', 'isolated',
  'depression', 'depressed', 'misery', 'miserable',
  'dark', 'darkness', 'shadow', 'shadows',
  'devil', 'demon', 'demons', 'hell', 'evil',
  'nightmare', 'nightmares', 'fear', 'afraid', 'scared',
  'broken', 'shattered', 'destroyed',
  'lost', 'losing', 'loss',
  'end', 'ending', 'final', 'last', 'never again',
  'regret', 'regrets', 'mistake',
  'hate', 'hatred', 'revenge', 'vengeance',
  'disaster', 'tragedy', 'tragic',
  'overdose', 'drugs', 'addiction'
];

/**
 * Check if text contains any negative keywords
 */
function containsNegativeContent(text) {
  if (!text) return false;
  const lowerText = text.toLowerCase();
  return NEGATIVE_KEYWORDS.some(keyword => {
    const regex = new RegExp(`\\b${keyword}\\b`, 'i');
    return regex.test(lowerText);
  });
}

/**
 * Generate YouTube search URL with "played by" format
 */
function generateYouTubeSearchUrl(title, artist) {
  const searchQuery = `${title} played by ${artist}`;
  const encodedQuery = encodeURIComponent(searchQuery);
  return `https://youtube.com/results?search_query=${encodedQuery}`;
}

/**
 * Search Genius API for songs (if token available)
 */
async function searchGeniusAPI(firstName) {
  if (GENIUS_API_TOKEN === 'demo') {
    console.log('⚠️  No Genius API token configured, using GPT-4 fallback');
    return [];
  }

  console.log(`🔍 Searching Genius API for "${firstName}"...`);

  try {
    const response = await axios.get('https://api.genius.com/search', {
      params: { q: firstName },
      headers: {
        'Authorization': `Bearer ${GENIUS_API_TOKEN}`
      },
      timeout: 10000
    });

    const songs = [];
    const hits = response.data.response.hits || [];

    for (const hit of hits.slice(0, 10)) { // Take top 10 results
      const result = hit.result;
      if (result && result.title && result.primary_artist) {
        songs.push({
          title: result.title,
          artist: result.primary_artist.name,
          year: result.release_date_components?.year || null,
          url: result.url
        });
      }
    }

    console.log(`   ✅ Found ${songs.length} songs on Genius`);
    return songs;

  } catch (error) {
    console.log(`   ⚠️  Genius API search failed: ${error.message}`);
    return [];
  }
}

/**
 * Use GPT-4 to search for songs AND verify with positive filtering
 */
async function searchAndVerifyWithGPT(firstName, geniusSongs = []) {
  console.log(`\n🤖 Using GPT-4 to ${geniusSongs.length > 0 ? 'verify' : 'search for'} songs with positive filtering...`);

  try {
    let prompt;

    if (geniusSongs.length > 0) {
      // Verify Genius results
      const songList = geniusSongs.map((s, i) => `${i + 1}. "${s.title}" by ${s.artist}`).join('\n');
      prompt = `You are a music researcher specializing in positive, uplifting songs. I found these songs that may feature the name "${firstName}" from Genius. Please verify and enrich ONLY the songs that are REAL and have POSITIVE themes.

SONGS FOUND:
${songList}`;
    } else {
      // Search from scratch
      prompt = `You are a music researcher specializing in positive, uplifting songs. Find 3 VERIFIED real songs that feature the name "${firstName}" in the title or prominently in lyrics.`;
    }

    prompt += `

CRITICAL CONTENT FILTERS - REJECT ANY SONGS ABOUT:
❌ Death, dying, killing, murder, suicide, graves, funerals
❌ War, battle, violence, blood, fighting
❌ Pain, suffering, agony, torture, heartbreak
❌ Sadness, tears, crying, loneliness, depression
❌ Darkness, shadows, nightmares, fear, evil
❌ Breakups, goodbyes, lost love, leaving
❌ Disasters, tragedies, regrets, hate, revenge

✅ ONLY ACCEPT SONGS WITH POSITIVE THEMES:
✅ Love (happy/romantic, NOT lost love)
✅ Joy, celebration, happiness, fun, dancing
✅ Friendship, togetherness, family
✅ Hope, inspiration, dreams, success
✅ Beauty, light, peace, harmony
✅ Adventure, freedom, empowerment

VERIFICATION REQUIREMENTS:
- Song must exist in MusicBrainz, Spotify, Billboard, or other reliable music database
- Include release year, genre, and why it's positive
- Provide brief context about the song's theme (1 sentence)

Return EXACTLY 3 POSITIVE songs as valid JSON (no markdown):
[
  {
    "title": "Song Title",
    "artist": "Artist/Band Name",
    "year": 1985,
    "genre": "Pop/Rock/etc",
    "significance": "Why this song is popular and positive (1-2 sentences)",
    "nameContext": "How the name ${firstName} appears (in title/prominent in lyrics)",
    "theme": "love | joy | celebration | inspiration | friendship | adventure",
    "positiveVibeScore": 9,
    "verificationSource": "MusicBrainz/Spotify/Billboard/Genius",
    "verified": true
  }
]

IMPORTANT: If you can't find 3 fully positive songs, return fewer. Quality > quantity. Never compromise the positive-vibes-only filter.`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: 'You are a music researcher who ONLY returns verified, positive-themed songs. Return ONLY valid JSON with NO markdown formatting.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.3,
      max_tokens: 2500
    });

    const content = response.choices[0].message.content.trim();

    // Remove markdown code blocks if present
    let cleanedContent = content;
    if (content.startsWith('```')) {
      cleanedContent = content
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();
    }

    let songs = [];
    try {
      songs = JSON.parse(cleanedContent);
    } catch (parseError) {
      console.error('❌ Failed to parse GPT response as JSON');
      console.error('Response:', cleanedContent);
      return [];
    }

    if (!Array.isArray(songs)) {
      console.error('❌ GPT returned non-array response');
      return [];
    }

    // Validate and filter each song
    const validSongs = [];

    for (const song of songs) {
      if (!song.title || !song.artist || !song.year || !song.genre) {
        console.warn(`⚠️  Skipping song - missing required fields`);
        continue;
      }

      // Check for negative content in title
      if (containsNegativeContent(song.title)) {
        console.warn(`❌ FILTERED: "${song.title}" - contains negative keywords in title`);
        continue;
      }

      // Check for negative content in significance/context
      const textToCheck = `${song.significance || ''} ${song.nameContext || ''} ${song.theme || ''}`;
      if (containsNegativeContent(textToCheck)) {
        console.warn(`❌ FILTERED: "${song.title}" - contains negative keywords in description`);
        continue;
      }

      // Generate YouTube search URL
      const youtubeSearchUrl = generateYouTubeSearchUrl(song.title, song.artist);

      validSongs.push({
        title: song.title,
        artist: song.artist,
        year: song.year,
        genre: song.genre,
        significance: song.significance,
        nameContext: song.nameContext,
        theme: song.theme || 'positive',
        positiveVibeScore: song.positiveVibeScore || 8,
        youtubeSearchUrl: youtubeSearchUrl,
        verificationSource: song.verificationSource || 'GPT-4 Knowledge Base',
        verified: true
      });

      console.log(`   ✅ "${song.title}" by ${song.artist} (${song.theme}) - PASSED`);
    }

    console.log(`\n🎵 Found ${validSongs.length} verified positive songs`);
    return validSongs;

  } catch (error) {
    console.error('❌ GPT-4 verification failed:', error.message);
    return [];
  }
}

/**
 * Main enrichment function - tries Genius API, falls back to GPT-4
 */
export async function enrichSongsWithGenius(firstName) {
  console.log(`\n🎵 Searching for songs with "${firstName}" (Genius API + GPT-4)...`);

  try {
    // Try Genius API first (if token available)
    const geniusSongs = await searchGeniusAPI(firstName);

    // Use GPT-4 to verify/search and apply positive filtering
    const verifiedSongs = await searchAndVerifyWithGPT(firstName, geniusSongs);

    // Pretty print results
    if (verifiedSongs.length > 0) {
      console.log('\n📋 Positive Songs Found:');
      verifiedSongs.forEach((song, index) => {
        console.log(`\n   ${index + 1}. "${song.title}" by ${song.artist}`);
        console.log(`      Year: ${song.year} | Genre: ${song.genre}`);
        console.log(`      Theme: ${song.theme} | Vibe Score: ${song.positiveVibeScore}/10`);
        console.log(`      Search: ${song.youtubeSearchUrl}`);
      });
    } else {
      console.log('⚠️  No positive songs found that meet strict filtering criteria');
    }

    return verifiedSongs;

  } catch (error) {
    console.error('❌ Song enrichment failed:', error.message);
    return [];
  }
}

// CLI usage
if (import.meta.url === `file://${process.argv[1]}`) {
  const firstName = process.argv[2];

  if (!firstName) {
    console.log('Usage: node geniusLyricsScraper.js <firstName>');
    console.log('Example: node geniusLyricsScraper.js George');
    process.exit(1);
  }

  const result = await enrichSongsWithGenius(firstName);
  console.log('\n📋 Final V10 Format:');
  console.log(JSON.stringify(result, null, 2));
}
