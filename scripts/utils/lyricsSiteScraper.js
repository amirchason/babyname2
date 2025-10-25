/**
 * Lyrics Site Scraper for V10 (AZLyrics + MetroLyrics)
 * Scrapes song data from lyrics websites and validates with GPT-4 positive filtering
 */

import axios from 'axios';
import * as cheerio from 'cheerio';
import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Comprehensive negative keywords blacklist (same as before)
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
 * Search AZLyrics for songs containing the name
 * Note: AZLyrics has anti-scraping measures, so we'll use a search approach
 */
async function searchAZLyrics(firstName) {
  console.log(`🔍 Searching AZLyrics for "${firstName}"...`);

  try {
    // AZLyrics search URL format
    const searchUrl = `https://search.azlyrics.com/search.php?q=${encodeURIComponent(firstName)}`;

    const response = await axios.get(searchUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
      },
      timeout: 10000
    });

    const $ = cheerio.load(response.data);
    const songs = [];

    // Parse search results (AZLyrics structure may vary)
    $('.panel.song').each((i, elem) => {
      if (songs.length >= 5) return false; // Limit to 5 songs

      const $elem = $(elem);
      const title = $elem.find('.title').text().trim();
      const artist = $elem.find('.artist').text().replace('by', '').trim();

      if (title && artist) {
        songs.push({
          title,
          artist,
          source: 'AZLyrics',
          url: $elem.find('a').attr('href')
        });
      }
    });

    console.log(`   ✅ Found ${songs.length} songs on AZLyrics`);
    return songs;

  } catch (error) {
    console.log(`   ⚠️  AZLyrics search failed: ${error.message}`);
    return [];
  }
}

/**
 * Search MetroLyrics for songs containing the name
 */
async function searchMetroLyrics(firstName) {
  console.log(`🔍 Searching MetroLyrics for "${firstName}"...`);

  try {
    const searchUrl = `https://www.metrolyrics.com/search.html?search=${encodeURIComponent(firstName)}`;

    const response = await axios.get(searchUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      timeout: 10000
    });

    const $ = cheerio.load(response.data);
    const songs = [];

    // Parse search results
    $('.songs-table tbody tr').each((i, elem) => {
      if (songs.length >= 5) return false;

      const $elem = $(elem);
      const title = $elem.find('.title a').text().trim();
      const artist = $elem.find('.artist a').text().trim();

      if (title && artist) {
        songs.push({
          title,
          artist,
          source: 'MetroLyrics',
          url: $elem.find('.title a').attr('href')
        });
      }
    });

    console.log(`   ✅ Found ${songs.length} songs on MetroLyrics`);
    return songs;

  } catch (error) {
    console.log(`   ⚠️  MetroLyrics search failed: ${error.message}`);
    return [];
  }
}

/**
 * Use GPT-4 to verify and enrich song data with positive filtering
 */
async function verifySongsWithGPT(songs, firstName) {
  if (songs.length === 0) {
    console.log('⚠️  No songs to verify');
    return [];
  }

  console.log(`\n🤖 Verifying ${songs.length} songs with GPT-4 positive filtering...`);

  try {
    const songList = songs.map((s, i) => `${i + 1}. "${s.title}" by ${s.artist}`).join('\n');

    const prompt = `You are a music researcher specializing in positive, uplifting songs. I found these songs that may feature the name "${firstName}". Please verify and enrich ONLY the songs that are REAL and have POSITIVE themes.

SONGS FOUND:
${songList}

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

For each VERIFIED POSITIVE song, return:
{
  "title": "Song Title",
  "artist": "Artist Name",
  "year": Year (estimate if unsure),
  "genre": "Genre",
  "significance": "Why this song is positive and notable (1-2 sentences)",
  "nameContext": "How the name ${firstName} appears in the song",
  "theme": "love | joy | celebration | inspiration | friendship | adventure",
  "positiveVibeScore": 1-10,
  "verified": true
}

Return ONLY songs you can verify as real and positive. Return as JSON array (max 3 songs). If a song doesn't exist or has negative themes, SKIP IT.`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: 'You are a music verification expert. Only return REAL, VERIFIED songs with POSITIVE themes. Return valid JSON only.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.3,
      max_tokens: 2000
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

    let verifiedSongs = [];
    try {
      verifiedSongs = JSON.parse(cleanedContent);
    } catch (parseError) {
      console.error('❌ Failed to parse GPT response as JSON');
      return [];
    }

    if (!Array.isArray(verifiedSongs)) {
      console.error('❌ GPT returned non-array response');
      return [];
    }

    // Final validation and filtering
    const finalSongs = [];

    for (const song of verifiedSongs) {
      if (!song.title || !song.artist || !song.year || !song.genre) {
        console.warn(`⚠️  Skipping song - missing required fields`);
        continue;
      }

      // Check for negative content
      if (containsNegativeContent(song.title)) {
        console.warn(`❌ FILTERED: "${song.title}" - negative keywords in title`);
        continue;
      }

      const textToCheck = `${song.significance || ''} ${song.nameContext || ''} ${song.theme || ''}`;
      if (containsNegativeContent(textToCheck)) {
        console.warn(`❌ FILTERED: "${song.title}" - negative keywords in description`);
        continue;
      }

      // Generate YouTube search URL
      const youtubeSearchUrl = generateYouTubeSearchUrl(song.title, song.artist);

      finalSongs.push({
        title: song.title,
        artist: song.artist,
        year: song.year,
        genre: song.genre,
        significance: song.significance,
        nameContext: song.nameContext,
        theme: song.theme || 'positive',
        positiveVibeScore: song.positiveVibeScore || 8,
        youtubeSearchUrl: youtubeSearchUrl,
        verificationSource: 'AZLyrics/MetroLyrics + GPT-4 Verified',
        verified: true
      });

      console.log(`   ✅ "${song.title}" by ${song.artist} (${song.theme}) - VERIFIED & POSITIVE`);
    }

    console.log(`\n✅ Final: ${finalSongs.length} verified positive songs`);
    return finalSongs;

  } catch (error) {
    console.error('❌ GPT verification failed:', error.message);
    return [];
  }
}

/**
 * Main enrichment function - scrapes lyrics sites and verifies with GPT
 */
export async function enrichSongsFromLyricsSites(firstName) {
  console.log(`\n🎵 Scraping lyrics sites for "${firstName}" with positive filtering...`);

  try {
    // Search both sites in parallel
    const [azLyricsSongs, metroLyricsSongs] = await Promise.all([
      searchAZLyrics(firstName),
      searchMetroLyrics(firstName)
    ]);

    // Combine results (remove duplicates)
    const allSongs = [...azLyricsSongs, ...metroLyricsSongs];
    const uniqueSongs = [];
    const seenTitles = new Set();

    for (const song of allSongs) {
      const key = `${song.title.toLowerCase()}-${song.artist.toLowerCase()}`;
      if (!seenTitles.has(key)) {
        seenTitles.add(key);
        uniqueSongs.push(song);
      }
    }

    console.log(`\n📊 Found ${uniqueSongs.length} unique songs across both sites`);

    if (uniqueSongs.length === 0) {
      console.log('⚠️  No songs found on lyrics sites, falling back to GPT-4 knowledge base');
      // Fall back to original GPT-4 search (from positiveSongEnricher.js)
      return [];
    }

    // Verify with GPT-4 and apply positive filtering
    const verifiedSongs = await verifySongsWithGPT(uniqueSongs, firstName);

    return verifiedSongs;

  } catch (error) {
    console.error('❌ Lyrics site scraping failed:', error.message);
    return [];
  }
}

// CLI usage
if (import.meta.url === `file://${process.argv[1]}`) {
  const firstName = process.argv[2];

  if (!firstName) {
    console.log('Usage: node lyricsSiteScraper.js <firstName>');
    console.log('Example: node lyricsSiteScraper.js George');
    process.exit(1);
  }

  const result = await enrichSongsFromLyricsSites(firstName);
  console.log('\n📋 Final V10 Format:');
  console.log(JSON.stringify(result, null, 2));
}
