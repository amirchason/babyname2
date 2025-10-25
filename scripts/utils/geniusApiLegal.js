/**
 * Genius API Integration (Legal - No Lyrics Scraping!)
 * Uses official Genius API to find songs with metadata only
 * Links to Genius pages for users to view lyrics there
 *
 * ⚠️ IMPORTANT: We do NOT scrape or display lyrics (copyright violation)
 * ✅ We only use: song title, artist, year, Genius URL, and our own descriptions
 */

import axios from 'axios';
import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const GENIUS_API_TOKEN = process.env.GENIUS_API_TOKEN || null;
const GENIUS_API_BASE = 'https://api.genius.com';

// Negative keywords for filtering
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

function containsNegativeContent(text) {
  if (!text) return false;
  const lowerText = text.toLowerCase();
  return NEGATIVE_KEYWORDS.some(keyword => {
    const regex = new RegExp(`\\b${keyword}\\b`, 'i');
    return regex.test(lowerText);
  });
}

function generateYouTubeSearchUrl(title, artist) {
  const searchQuery = `${title} played by ${artist}`;
  return `https://youtube.com/results?search_query=${encodeURIComponent(searchQuery)}`;
}

/**
 * Search Genius API for songs (metadata only - legal!)
 */
async function searchGeniusAPI(firstName) {
  if (!GENIUS_API_TOKEN) {
    console.log('⚠️  No Genius API token - using GPT-4 only');
    return [];
  }

  console.log(`🔍 Searching Genius API for songs with "${firstName}"...`);

  try {
    const response = await axios.get(`${GENIUS_API_BASE}/search`, {
      params: { q: firstName },
      headers: { 'Authorization': `Bearer ${GENIUS_API_TOKEN}` },
      timeout: 10000
    });

    const songs = [];
    const hits = response.data.response?.hits || [];

    for (const hit of hits.slice(0, 10)) {
      const result = hit.result;
      if (result?.title && result?.primary_artist?.name) {
        songs.push({
          title: result.title,
          artist: result.primary_artist.name,
          year: result.release_date_components?.year || null,
          geniusUrl: result.url, // Official Genius page URL (legal to link!)
          imageUrl: result.song_art_image_thumbnail_url || null
        });
      }
    }

    console.log(`   ✅ Found ${songs.length} songs on Genius`);
    return songs;

  } catch (error) {
    console.log(`   ⚠️  Genius API error: ${error.message}`);
    return [];
  }
}

/**
 * Use GPT-4 to analyze songs and create descriptions (NO lyrics!)
 */
async function enrichSongsWithGPT(firstName, geniusSongs = []) {
  console.log(`\n🤖 Using GPT-4 to analyze and verify songs...`);

  try {
    let prompt;

    if (geniusSongs.length > 0) {
      const songList = geniusSongs.map((s, i) =>
        `${i + 1}. "${s.title}" by ${s.artist} (${s.year || 'unknown year'})`
      ).join('\n');

      prompt = `You are a music expert. I found these songs that may feature the name "${firstName}".

SONGS FOUND:
${songList}

For each song that is REAL and has POSITIVE themes, provide:

CRITICAL: DO NOT provide any actual song lyrics (copyright violation!). Only provide your own descriptions.

✅ ONLY ACCEPT POSITIVE SONGS ABOUT:
- Love (happy/romantic), joy, celebration, happiness, fun, dancing
- Friendship, togetherness, family, hope, inspiration, dreams
- Beauty, light, peace, harmony, adventure, freedom

❌ REJECT SONGS ABOUT:
- Death, pain, war, violence, heartbreak, sadness, darkness, tragedy

For each VERIFIED POSITIVE song, return:
{
  "title": "Song Title",
  "artist": "Artist Name",
  "year": Year,
  "genre": "Genre",
  "nameContext": "How the name appears (e.g., 'repeated in chorus', 'in title', 'addressing someone named ${firstName}')",
  "description": "YOUR OWN 1-2 sentence description of song's positive theme (DO NOT quote lyrics)",
  "theme": "love|joy|celebration|inspiration|friendship|adventure",
  "positiveVibeScore": 1-10,
  "verified": true
}`;
    } else {
      prompt = `Find 3 REAL songs that feature the name "${firstName}" in title or lyrics.

CRITICAL: DO NOT provide any actual song lyrics (copyright violation!). Only provide metadata and your own descriptions.

Return songs with POSITIVE themes only. Include title, artist, year, genre, and your own description (not lyrics).`;
    }

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: 'You are a music expert. Provide song metadata and your own descriptions. NEVER quote actual lyrics (copyright). Return valid JSON only.'
        },
        { role: 'user', content: prompt }
      ],
      temperature: 0.3,
      max_tokens: 2000
    });

    let content = response.choices[0].message.content.trim();
    if (content.startsWith('```')) {
      content = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    }

    let songs = JSON.parse(content);
    if (!Array.isArray(songs)) return [];

    const enrichedSongs = [];

    for (let i = 0; i < songs.length && i < 3; i++) {
      const song = songs[i];

      if (!song.title || !song.artist) continue;

      // Check for negative content
      if (containsNegativeContent(song.title) ||
          containsNegativeContent(song.description)) {
        console.log(`   ❌ FILTERED: "${song.title}" - negative content`);
        continue;
      }

      // Find matching Genius URL if available
      const geniusMatch = geniusSongs.find(g =>
        g.title.toLowerCase() === song.title.toLowerCase() &&
        g.artist.toLowerCase().includes(song.artist.toLowerCase().split(' ')[0])
      );

      enrichedSongs.push({
        title: song.title,
        artist: song.artist,
        year: song.year || geniusMatch?.year || null,
        genre: song.genre || 'Unknown',
        nameContext: song.nameContext || `Features "${firstName}" in the song`,
        description: song.description || 'A positive, uplifting song',
        theme: song.theme || 'positive',
        positiveVibeScore: song.positiveVibeScore || 8,
        youtubeSearchUrl: generateYouTubeSearchUrl(song.title, song.artist),
        geniusUrl: geniusMatch?.geniusUrl || `https://genius.com/search?q=${encodeURIComponent(song.title + ' ' + song.artist)}`,
        verified: true
      });

      console.log(`   ✅ "${song.title}" by ${song.artist} (${song.theme}) - VERIFIED`);
    }

    return enrichedSongs;

  } catch (error) {
    console.error('❌ GPT enrichment failed:', error.message);
    return [];
  }
}

/**
 * Main function: Legal song enrichment (no lyrics scraping!)
 */
export async function enrichSongsLegally(firstName) {
  console.log(`\n🎵 Finding songs with "${firstName}" (legal method - no lyrics)...`);

  try {
    // Step 1: Search Genius API for song metadata
    const geniusSongs = await searchGeniusAPI(firstName);

    // Step 2: Use GPT-4 to verify and describe (no lyrics!)
    const enrichedSongs = await enrichSongsWithGPT(firstName, geniusSongs);

    if (enrichedSongs.length > 0) {
      console.log(`\n📋 ${enrichedSongs.length} Positive Songs Found:`);
      enrichedSongs.forEach((song, i) => {
        console.log(`\n   ${i + 1}. "${song.title}" by ${song.artist}`);
        console.log(`      Theme: ${song.theme} | Vibe: ${song.positiveVibeScore}/10`);
        console.log(`      View on Genius: ${song.geniusUrl}`);
        console.log(`      YouTube: ${song.youtubeSearchUrl}`);
      });
    } else {
      console.log('⚠️  No positive songs found');
    }

    return enrichedSongs;

  } catch (error) {
    console.error('❌ Song enrichment failed:', error.message);
    return [];
  }
}

// CLI usage
if (import.meta.url === `file://${process.argv[1]}`) {
  const firstName = process.argv[2];
  if (!firstName) {
    console.log('Usage: node geniusApiLegal.js <firstName>');
    console.log('Example: node geniusApiLegal.js George');
    process.exit(1);
  }

  const result = await enrichSongsLegally(firstName);
  console.log('\n📋 Final Output:');
  console.log(JSON.stringify(result, null, 2));
}
