const OpenAI = require('openai');
require('dotenv').config({ path: '/data/data/com.termux/files/home/proj/babyname2/.env' });

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

async function enrichJohn() {
  console.log('🎨 Enriching John with V3.0 data...\n');

  const prompt = `You are an IMDB expert, music database researcher, and baby name specialist. Provide comprehensive, verified information about the name "John".

CRITICAL VERIFICATION REQUIREMENTS:

SONGS:
1. ONLY include songs that ACTUALLY EXIST in major music databases (Spotify, Apple Music, Billboard)
2. Verify each song exists - DO NOT guess or assume
3. Extract REAL lyrics from actual songs (brief snippets only, not full verses)
4. YouTube links must lead to the CORRECT song
5. Better to return 1-2 verified songs than fake ones

IMDB DATA (Famous People):
1. Include top 3 most famous actors/actresses named John (verify IMDB credits)
2. List their most notable films/shows
3. Include IMDB profile links: https://www.imdb.com/find/?q=FirstName+LastName
4. Verify they are actually well-known (awards, major roles, etc.)

MOVIES/TV SHOWS (Characters Named John):
1. Include top 3 most famous movies/TV shows with main characters named John
2. Include IMDB title links: https://www.imdb.com/title/tt#######/
3. Include year, genre, and brief character description
4. Verify these are actual major productions

CHARACTER QUOTES:
1. Include memorable quotes by characters named John
2. PARAPHRASE or summarize the essence - DO NOT copy exact dialogue word-for-word
3. Describe the quote's context and significance
4. Keep it brief and transformative

Return ONLY valid JSON (no markdown, no code blocks) with this exact structure:
{
  "culturalSignificance": "2-3 sentences about historical and cultural importance",
  "modernContext": "2-3 sentences about current popularity and modern usage",
  "literaryReferences": "Notable characters or famous people named John",
  "pronunciationGuide": "Phonetic pronunciation",
  "variations": ["List", "of", "name", "variations"],
  "similarNames": ["List", "of", "similar", "names"],
  "personality": "Personality traits often associated with this name",
  "symbolism": "Symbolic meanings and associations",
  "funFact": "An interesting or surprising fact about this name",
  "songs": [
    {
      "title": "Exact song title",
      "artist": "Artist name",
      "year": 2020,
      "youtubeSearchUrl": "https://www.youtube.com/results?search_query=artist+song+title+official",
      "quote": "Memorable lyric from the song mentioning John (real lyrics only)"
    }
  ],
  "famousQuotes": [
    {
      "quote": "The actual quote text",
      "person": "Full name of the famous John",
      "context": "Brief context (actor, musician, etc.)"
    }
  ],
  "famousPeople": [
    {
      "name": "Full name",
      "profession": "Actor/Musician/etc",
      "knownFor": ["Movie/Show 1", "Movie/Show 2", "Movie/Show 3"],
      "imdbUrl": "https://www.imdb.com/find/?q=FirstName+LastName",
      "awards": "Brief award info (Oscar, Grammy, etc.)"
    }
  ],
  "moviesAndShows": [
    {
      "title": "Movie or TV show title",
      "year": 2020,
      "type": "Movie or TV Series",
      "characterName": "John [Last Name if applicable]",
      "characterDescription": "Brief description of the character",
      "imdbUrl": "https://www.imdb.com/title/tt#######/",
      "genre": "Genre"
    }
  ],
  "characterQuotes": [
    {
      "character": "John [Character Name]",
      "source": "Movie/Show Title",
      "quoteSummary": "Paraphrased essence of memorable quote (NOT exact dialogue)",
      "context": "Why this quote is significant or memorable"
    }
  ],
  "nicknames": ["List", "of", "up", "to", "12", "possible", "nicknames"]
}`;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
      max_tokens: 3500
    });

    const content = response.choices[0].message.content.trim();
    const enrichment = JSON.parse(content);

    console.log('✅ Enriched John successfully!\n');
    console.log(JSON.stringify(enrichment, null, 2));

    // Save to file
    const fs = require('fs');
    const outputPath = '/data/data/com.termux/files/home/proj/babyname2/public/data/enriched/john.json';
    fs.mkdirSync('/data/data/com.termux/files/home/proj/babyname2/public/data/enriched', { recursive: true });

    const johnData = {
      name: "John",
      gender: "male",
      origin: "Hebrew",
      meaning: "God is gracious",
      ...enrichment
    };

    fs.writeFileSync(outputPath, JSON.stringify(johnData, null, 2));
    console.log('\n💾 Saved to: public/data/enriched/john.json');

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

enrichJohn();
