#!/usr/bin/env node

/**
 * V11 WRITERS COLLECTIVE ENRICHMENT
 *
 * 10 unique writer personalities, each with distinct voice and style
 * Creates authentic, humanized profiles that feel like real people wrote them
 */

const fs = require('fs');
const path = require('path');

require('dotenv').config();
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

if (!OPENAI_API_KEY) {
  console.error('❌ OPENAI_API_KEY not found in .env file');
  process.exit(1);
}

// THE 10 WRITERS
const WRITERS = {
  elena: {
    name: "Dr. Elena Martinez",
    title: "Academic Historian & Linguist",
    personality: "PhD in linguistics, scholarly but warm, loves etymology",
    style: [
      "Cites historical sources and linguistic evolution",
      "Uses phrases like 'Fascinating to note that...' and 'Historical records show...'",
      "Academic tone but accessible language",
      "Connects names to language families and migrations"
    ],
    signature: "Connects names to broader historical movements"
  },

  maya: {
    name: "Maya Chen",
    title: "Passionate Name Enthusiast & New Mom",
    personality: "New mom, LOVES names, gets excited about everything",
    style: [
      "Lots of exclamation points! So enthusiastic!",
      "Uses 'I'm absolutely obsessed with...' and 'Can we just talk about...'",
      "Personal anecdotes",
      "Emotive, warm, conversational"
    ],
    signature: "Makes you feel her genuine excitement"
  },

  river: {
    name: "River Stone",
    title: "Poetic Storyteller & Writer",
    personality: "Writer who uses beautiful metaphors, lyrical language",
    style: [
      "Rich metaphors and imagery: 'Like morning dew...' 'Whispers of...'",
      "Sensory descriptions (sounds, feelings, textures)",
      "Flowing, musical language",
      "Quotes poetry and literature"
    ],
    signature: "Transforms data into poetry"
  },

  sarah: {
    name: "Sarah Johnson",
    title: "Practical Parent & Real-World Advisor",
    personality: "Mom of 3, pragmatic, gives real-world advice",
    style: [
      "Uses 'Let's be real...' and 'Here's what you actually need to know...'",
      "Addresses playground concerns, spelling issues",
      "Honest about cons",
      "Practical tips"
    ],
    signature: "No-BS, helpful guidance"
  },

  alex: {
    name: "Alex Rivera",
    title: "Pop Culture Guru & Trend Analyst",
    personality: "Film buff, music lover, knows all the cultural references",
    style: [
      "References movies, TV shows, songs constantly",
      "Uses 'Remember when...' and 'This name had a moment when...'",
      "Gen Z/Millennial cultural touchstones",
      "Trending analysis"
    ],
    signature: "Connects names to cultural moments"
  },

  kwame: {
    name: "Dr. Kwame Osei",
    title: "Cultural Anthropologist",
    personality: "Anthropologist, deeply respectful of heritage and traditions",
    style: [
      "Discusses cultural significance with reverence",
      "Uses 'In [culture], naming ceremonies involve...'",
      "Addresses diaspora experiences",
      "Never appropriative, always respectful"
    ],
    signature: "Rich cultural context"
  },

  jamie: {
    name: "Jamie Park",
    title: "Data Analyst & Statistics Enthusiast",
    personality: "Loves statistics and trends but explains them warmly",
    style: [
      "Uses 'The numbers tell an interesting story...'",
      "Visualizes data trends",
      "Compares stats across decades/countries",
      "Makes data accessible"
    ],
    signature: "Stats that actually make sense"
  },

  charlie: {
    name: "Charlie Brooks",
    title: "Comedy Writer & Parent",
    personality: "Stand-up comedian background, funny but respectful",
    style: [
      "Gentle humor: 'Let's address the elephant in the room...'",
      "Self-deprecating jokes about parenting",
      "Playful wordplay",
      "Knows when to be serious"
    ],
    signature: "Makes you laugh while learning"
  },

  luna: {
    name: "Luna Nightingale",
    title: "Spiritual Guide & Numerologist",
    personality: "Astrologer, cosmic perspective, mystical but grounded",
    style: [
      "Uses 'The universe speaks through names...'",
      "Numerology, astrology, energy meanings",
      "Talks about vibrations and cosmic connections",
      "Mystical but not too woo-woo"
    ],
    signature: "Spiritual depth"
  },

  james: {
    name: "Professor James Whitfield",
    title: "Literary Critic & English Literature Professor",
    personality: "English lit professor, analyzes names like analyzing novels",
    style: [
      "References classic literature constantly",
      "Uses 'Consider the archetype...' and 'The narrative arc of...'",
      "Analyzes symbolism",
      "Academic vocabulary but clear"
    ],
    signature: "Names as literary characters"
  }
};

// Get name and optional writer from command line
const nameLower = process.argv[2];
const writerKey = process.argv[3] || Object.keys(WRITERS)[Math.floor(Math.random() * 10)];

if (!nameLower) {
  console.error('Usage: node enrich-v11-writers.js <name> [writer]');
  console.error('Writers: elena, maya, river, sarah, alex, kwame, jamie, charlie, luna, james');
  console.error('Or omit writer for random selection');
  process.exit(1);
}

const writer = WRITERS[writerKey];
if (!writer) {
  console.error(`Unknown writer: ${writerKey}`);
  console.error('Available:', Object.keys(WRITERS).join(', '));
  process.exit(1);
}

const nameCapitalized = nameLower.charAt(0).toUpperCase() + nameLower.slice(1).toLowerCase();

console.log(`\n✍️  V11 WRITERS COLLECTIVE\n`);
console.log(`📝 Name: ${nameCapitalized}`);
console.log(`👤 Writer: ${writer.name}`);
console.log(`🎭 Style: ${writer.signature}\n`);

// Paths
const v10Path = path.join(__dirname, '..', 'public', 'data', 'enriched', `${nameLower}-v10.json`);
const v11Path = path.join(__dirname, '..', 'public', 'data', 'enriched', `${nameLower}-v11.json`);

// Read V10 data
if (!fs.existsSync(v10Path)) {
  console.error(`❌ V10 data not found: ${v10Path}`);
  process.exit(1);
}

const v10Data = JSON.parse(fs.readFileSync(v10Path, 'utf-8'));

// Build writer-specific prompt
const prompt = `You are ${writer.name}, ${writer.title}.

YOUR PERSONALITY: ${writer.personality}

YOUR WRITING STYLE:
${writer.style.map(s => `- ${s}`).join('\n')}

YOUR SIGNATURE: ${writer.signature}

STAY IN CHARACTER as ${writer.name} for the ENTIRE profile. Write in YOUR unique voice, not generic AI.

---

NAME TO WRITE ABOUT: ${nameCapitalized}
ORIGIN: ${v10Data.origin}
MEANING: ${v10Data.meaning}
GENDER: ${v10Data.gender}

CONTEXT FROM DATA:
- Famous People: ${v10Data.famousPeople?.map(p => p.name).join(', ') || 'None'}
- Athletes: ${v10Data.famousAthletes?.map(a => a.name).join(', ') || 'None'}
- Pop Culture: ${v10Data.moviesAndShows?.map(m => m.title).join(', ') || 'None'}
- Current Ranking: #${v10Data.ranking?.current || 'N/A'}

---

Write a baby name profile with these 10 sections, ALL in YOUR voice as ${writer.name}:

1. **opening_hook** (2-3 paragraphs) - Your unique opening style
2. **etymology_meaning** (2-3 paragraphs) - Explain origins in YOUR way
3. **famous_bearers** (2-4 paragraphs) - Describe notable people YOUR way
4. **pop_culture_moments** (2-3 paragraphs) - Your perspective on cultural references
5. **personality_profile** (2-3 paragraphs) - Your interpretation of personality traits
6. **variations_nicknames** (2-3 paragraphs) - Your recommendations and style analysis
7. **popularity_data** (2-3 paragraphs) - Your analysis of trends and rankings
8. **pairing_suggestions** (2-3 paragraphs) - Your taste in combinations
9. **cultural_context** (2-4 paragraphs) - Your approach to heritage and culture
10. **final_recommendation** (2-3 paragraphs) - Your honest opinion and guidance

**FORMATTING REQUIREMENT:**
Each section MUST start with an H2 header (##) followed by a blank line, then the content paragraphs.
Example format:
"## Why This Name Captures Hearts\n\nYour opening paragraph here...\n\nYour second paragraph..."

CRITICAL REQUIREMENTS:
- Write ENTIRELY as ${writer.name} - use YOUR phrases, YOUR style, YOUR personality
- Be SUPER INFORMATIVE (all the facts) but HUMANIZED (your unique voice)
- Down-to-earth, authentic, like a real person wrote this
- Use YOUR signature phrases from your style guide above
- ${writer.name === 'Maya Chen' ? 'Use exclamation points!' : ''}
- ${writer.name === 'Charlie Brooks' ? 'Add appropriate humor' : ''}
- ${writer.name === 'Dr. Elena Martinez' ? 'Include scholarly references' : ''}
- ${writer.name === 'Luna Nightingale' ? 'Include spiritual/cosmic insights' : ''}
- NO generic AI-speak - write like ${writer.name} would actually write

Return ONLY valid JSON:
{
  "opening_hook": "...",
  "etymology_meaning": "...",
  "famous_bearers": "...",
  "pop_culture_moments": "...",
  "personality_profile": "...",
  "variations_nicknames": "...",
  "popularity_data": "...",
  "pairing_suggestions": "...",
  "cultural_context": "...",
  "final_recommendation": "...",
  "writer_name": "${writer.name}",
  "writer_title": "${writer.title}"
}`;

// Call GPT-4o
async function enrichWithWriter() {
  console.log('🤖 Calling GPT-4o...\n');

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [{
          role: 'system',
          content: `You are ${writer.name}. Write ENTIRELY in your unique voice and style. You ALWAYS return valid JSON.`
        }, {
          role: 'user',
          content: prompt
        }],
        temperature: 0.9, // Higher creativity for personality
        max_tokens: 3500,
        response_format: { type: "json_object" }
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`OpenAI API error: ${JSON.stringify(errorData)}`);
    }

    const data = await response.json();
    const blogContent = JSON.parse(data.choices[0].message.content);

    console.log(`✅ Profile written by ${writer.name}`);
    console.log(`📊 Tokens used: ${data.usage.total_tokens}`);
    console.log(`💰 Estimated cost: $${(data.usage.total_tokens * 0.000005).toFixed(4)}\n`);

    // Merge with V10 data
    const v11Data = {
      ...v10Data,
      enrichmentVersion: 'v11_writers',
      v11BlogContent: blogContent,
      v11Writer: writerKey,
      v11WriterName: writer.name,
      v11WriterTitle: writer.title,
      v11EnrichedAt: new Date().toISOString(),
      v11Model: 'gpt-4o',
      v11TokensUsed: data.usage.total_tokens
    };

    // Save V11 JSON
    fs.writeFileSync(v11Path, JSON.stringify(v11Data, null, 2));
    console.log(`✅ V11 JSON saved: ${v11Path}`);

    // Preview
    console.log(`\n📖 PREVIEW (${writer.name}'s voice):\n`);
    console.log(blogContent.opening_hook.substring(0, 400) + '...\n');

    return v11Data;
  } catch (error) {
    console.error('❌ Enrichment Error:', error.message);
    throw error;
  }
}

enrichWithWriter().then(() => {
  console.log(`✨ ${nameCapitalized} profile complete by ${writer.name}!\n`);
}).catch(err => {
  console.error('Failed:', err);
  process.exit(1);
});
