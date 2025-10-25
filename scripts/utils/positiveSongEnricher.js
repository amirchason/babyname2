/**
 * Positive-Vibes-Only Song Enricher for V10
 * Finds 5 FAMOUS verified songs with strict positive content filtering
 * Uses GPT-4 to search and verify songs from reliable databases
 * Returns ONLY song title + artist with Genius lyrics links
 */

import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

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

// Positive themes whitelist
const POSITIVE_THEMES = [
  'love', 'joy', 'happiness', 'celebration', 'party', 'dance', 'fun',
  'smile', 'laughter', 'hope', 'dream', 'inspire', 'inspiration',
  'friend', 'friends', 'friendship', 'together', 'unity',
  'sunshine', 'beautiful', 'wonderful', 'amazing', 'perfect',
  'blessed', 'blessing', 'lucky', 'fortune',
  'victory', 'win', 'winning', 'champion', 'success',
  'star', 'shine', 'shining', 'bright', 'light',
  'heaven', 'angel', 'angels', 'peace', 'harmony',
  'freedom', 'free', 'believe', 'faith', 'trust',
  'promise', 'promises', 'adventure', 'journey',
  'home', 'family', 'baby', 'babies', 'children',
  'sweet', 'honey', 'sugar', 'candy'
];

/**
 * Check if text contains any negative keywords
 */
function containsNegativeContent(text) {
  if (!text) return false;

  const lowerText = text.toLowerCase();

  return NEGATIVE_KEYWORDS.some(keyword => {
    // Use word boundaries to avoid false positives
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
 * Search for positive-vibes-only songs using GPT-4
 * @param {string} firstName - The baby name to search for
 * @returns {Promise<Array>} - Array of 5 verified positive FAMOUS songs
 */
export async function searchPositiveSongsWithGPT(firstName) {
  console.log(`\n🎵 Searching for 5 FAMOUS positive songs with "${firstName}" using GPT-4...`);

  try {
    const prompt = `You are a music researcher specializing in positive, uplifting FAMOUS songs. Find 5 VERIFIED real FAMOUS songs that feature the name "${firstName}" in the title OR the lyrics are about someone with that name.

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

FAME REQUIREMENTS:
- Songs must be FAMOUS/WELL-KNOWN (charted, popular, recognizable)
- From major artists or bands with established careers
- Available on major music platforms (Spotify, Apple Music, YouTube)

EXAMPLES OF GOOD SONGS:
- "Barbara Ann" by The Beach Boys (fun, celebration, FAMOUS)
- "Sweet Caroline" by Neil Diamond (joy, togetherness, ICONIC)
- "Johnny B. Goode" by Chuck Berry (empowerment, success, CLASSIC)

Return EXACTLY 5 FAMOUS songs as valid JSON (no markdown):
[
  {
    "title": "Song Title",
    "artist": "Artist/Band Name",
    "year": 1985,
    "genre": "Pop/Rock/etc",
    "significance": "Why this song is popular and positive (1-2 sentences)",
    "nameContext": "How the name ${firstName} appears (in title/prominent in lyrics)",
    "theme": "One of: love/joy/celebration/inspiration/friendship/adventure",
    "positiveVibeScore": 9,
    "verificationSource": "MusicBrainz/Spotify/Billboard Charts",
    "verified": true
  }
]

CRITICAL REQUIREMENTS:
- Each song MUST be FAMOUS and well-known
- Each song MUST have positive themes only
- Provide Genius.com URL for each song (format: https://genius.com/Artist-song-title-lyrics)

IMPORTANT: If you can't find 5 fully positive FAMOUS songs, return fewer. Quality > quantity. Never compromise the positive-vibes-only filter.`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: 'You are a music researcher who ONLY returns verified, positive-themed songs. You have extensive knowledge of music databases like MusicBrainz, Spotify, and Billboard. Return ONLY valid JSON with NO markdown formatting.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.3, // Low temperature for factual accuracy
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

    // Validate response format
    if (!Array.isArray(songs)) {
      console.error('❌ GPT returned non-array response');
      return [];
    }

    // Validate and filter each song
    const validSongs = [];

    for (const song of songs) {
      // Check required fields
      if (!song.title || !song.artist || !song.year || !song.genre) {
        console.warn(`⚠️  Skipping song - missing required fields:`, song);
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

      // Generate Genius URL (clean format for links)
      const artistSlug = song.artist.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
      const titleSlug = song.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
      const geniusUrl = `https://genius.com/${artistSlug}-${titleSlug}-lyrics`;

      // Add to valid songs (MINIMAL DATA - just title, artist, link)
      validSongs.push({
        title: song.title,
        artist: song.artist,
        year: song.year || null,
        geniusUrl: geniusUrl,
        verified: true
      });

      console.log(`   ✅ "${song.title}" by ${song.artist} (${song.theme}) - PASSED`);
    }

    console.log(`\n🎵 Found ${validSongs.length} verified positive songs`);

    // Pretty print results
    if (validSongs.length > 0) {
      console.log('\n📋 Positive Songs Found:');
      validSongs.forEach((song, index) => {
        console.log(`\n   ${index + 1}. "${song.title}" by ${song.artist}`);
        console.log(`      Year: ${song.year} | Genre: ${song.genre}`);
        console.log(`      Theme: ${song.theme} | Vibe Score: ${song.positiveVibeScore}/10`);
        console.log(`      Search: ${song.youtubeSearchUrl}`);
      });
    } else {
      console.log('⚠️  No positive songs found that meet strict filtering criteria');
    }

    return validSongs;

  } catch (error) {
    console.error('❌ GPT-4 positive song search failed:', error.message);
    return [];
  }
}

/**
 * Main enrichment function for V10
 * Returns up to 3 positive-vibes-only songs
 * Now uses LEGAL Genius API method (no lyrics scraping!)
 */
export async function enrichPositiveSongs(firstName) {
  try {
    // Import the LEGAL Genius API enricher (no lyrics!)
    const { enrichSongsLegally } = await import('./geniusApiLegal.js');
    const songs = await enrichSongsLegally(firstName);

    // If Genius approach fails or returns no songs, fall back to original GPT-4 search
    if (songs.length === 0) {
      console.log('⚠️  Falling back to GPT-4 knowledge base...');
      return await searchPositiveSongsWithGPT(firstName);
    }

    return songs;
  } catch (error) {
    console.error(`❌ Positive song enrichment failed for ${firstName}:`, error.message);
    // Final fallback to original GPT-4 search
    try {
      return await searchPositiveSongsWithGPT(firstName);
    } catch (fallbackError) {
      console.error(`❌ Fallback also failed:`, fallbackError.message);
      return [];
    }
  }
}

// CLI usage
if (import.meta.url === `file://${process.argv[1]}`) {
  const firstName = process.argv[2];

  if (!firstName) {
    console.log('Usage: node positiveSongEnricher.js <firstName>');
    console.log('Example: node positiveSongEnricher.js George');
    process.exit(1);
  }

  const result = await enrichPositiveSongs(firstName);
  console.log('\n📋 Final V10 Format:');
  console.log(JSON.stringify(result, null, 2));
}
