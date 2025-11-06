#!/usr/bin/env node

/**
 * V11 BLOG-STYLE ENRICHMENT
 *
 * Transforms V10 data into human blog-style profiles using GPT-4o
 * Based on V11_TEMPLATE.md - conversational, engaging, Nameberry-inspired
 */

const fs = require('fs');
const path = require('path');

// Get API key from .env
require('dotenv').config();
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

if (!OPENAI_API_KEY) {
  console.error('❌ OPENAI_API_KEY not found in .env file');
  process.exit(1);
}

// Get name from command line
const nameLower = process.argv[2];
if (!nameLower) {
  console.error('Usage: node enrich-v11-blog.js <name>');
  process.exit(1);
}

const nameCapitalized = nameLower.charAt(0).toUpperCase() + nameLower.slice(1).toLowerCase();

console.log(`\n🌟 V11 BLOG ENRICHMENT: ${nameCapitalized}\n`);

// Paths
const v10Path = path.join(__dirname, '..', 'public', 'data', 'enriched', `${nameLower}-v10.json`);
const v11Path = path.join(__dirname, '..', 'public', 'data', 'enriched', `${nameLower}-v11.json`);

// Read V10 data
if (!fs.existsSync(v10Path)) {
  console.error(`❌ V10 data not found: ${v10Path}`);
  process.exit(1);
}

const v10Data = JSON.parse(fs.readFileSync(v10Path, 'utf-8'));
console.log('✅ Loaded V10 data');

// Build V11 GPT-4o prompt
const prompt = `You are a passionate baby name expert writing a blog post about the name ${nameCapitalized} for parents searching for the perfect name. Your writing style is warm, knowledgeable, and conversational — like explaining to a friend why this name is special.

NAME: ${nameCapitalized}
ORIGIN: ${v10Data.origin}
MEANING: ${v10Data.meaning}
GENDER: ${v10Data.gender}

ADDITIONAL CONTEXT (from V10 data):
- Cultural Significance: ${v10Data.culturalSignificance || 'Not specified'}
- Famous People: ${v10Data.famousPeople?.map(p => p.name).join(', ') || 'None listed'}
- Athletes: ${v10Data.famousAthletes?.map(a => a.name).join(', ') || 'None listed'}
- Pop Culture: ${v10Data.moviesAndShows?.map(m => m.title).join(', ') || 'None listed'}
- Current Ranking: #${v10Data.ranking?.current || 'N/A'}

Write a comprehensive blog-style profile with these sections:

1. **opening_hook** (2-3 paragraphs): Why this name captures hearts. Make it personal and engaging. Start with "There's something undeniably..." or similar warm opening.

2. **etymology_meaning**: Explain the origin story like you're sharing a fascinating discovery. Include the literal translation, how it evolved, and what it means today.

3. **famous_bearers**: Mini-profiles of 3-5 notable people with this name (historical and modern). Make them interesting stories, not just lists. Include what made them special.

4. **pop_culture_moments**: Where has this name appeared in books, movies, TV, music? Write enthusiastically about the characters and their impact.

5. **personality_profile**: What traits do people with this name often embody? Base on cultural origin and observed patterns. Be warm but grounded.

6. **variations_nicknames**: Present options like a helpful guide, explaining the vibe of each variation and nickname.

7. **popularity_data**: Current rankings and trends, explained with context. Why is it popular/rising/falling? What does this mean for parents choosing it now?

8. **pairing_suggestions**: Best middle names and sibling names with reasoning. Be creative and taste-making.

9. **cultural_context**: The heritage story, told respectfully and interestingly. Migration patterns, how the name traveled across cultures.

10. **final_recommendation**: Honest, thoughtful guidance on whether this name might be "the one". Include pros/cons, who should choose it, who should think twice.

CRITICAL REQUIREMENTS:
- Write in a warm, conversational blog style (NOT robotic data dumps)
- Use storytelling techniques and vivid imagery
- Include transitions and narrative flow between sections
- Mix data with human stories
- Sound like a name enthusiast, not an encyclopedia
- Be authentic and honest
- NO generic "AI-speak" — write like a human who loves names
- Each section should be 2-4 paragraphs of flowing narrative text

Return ONLY valid JSON with this exact structure:
{
  "opening_hook": "2-3 paragraph text...",
  "etymology_meaning": "2-3 paragraph text...",
  "famous_bearers": "2-4 paragraph text with mini-profiles...",
  "pop_culture_moments": "2-4 paragraph text...",
  "personality_profile": "2-3 paragraph text...",
  "variations_nicknames": "2-3 paragraph text...",
  "popularity_data": "2-3 paragraph text...",
  "pairing_suggestions": "2-3 paragraph text...",
  "cultural_context": "2-4 paragraph text...",
  "final_recommendation": "2-3 paragraph text..."
}`;

// Call GPT-4o
async function enrichWithV11() {
  console.log('🤖 Calling GPT-4o for blog-style enrichment...\n');

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
          content: 'You are an expert baby name blogger who writes warm, conversational, engaging content. You ALWAYS return valid JSON.'
        }, {
          role: 'user',
          content: prompt
        }],
        temperature: 0.8, // More creative for blog writing
        max_tokens: 3000,
        response_format: { type: "json_object" }
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`OpenAI API error: ${JSON.stringify(errorData)}`);
    }

    const data = await response.json();
    const blogContent = JSON.parse(data.choices[0].message.content);

    console.log('✅ GPT-4o blog content generated');
    console.log(`📊 Tokens used: ${data.usage.total_tokens}`);
    console.log(`💰 Estimated cost: $${(data.usage.total_tokens * 0.000005).toFixed(4)}\n`);

    // Merge V10 data with V11 blog content
    const v11Data = {
      ...v10Data,
      enrichmentVersion: 'v11',
      v11BlogContent: blogContent,
      v11EnrichedAt: new Date().toISOString(),
      v11Model: 'gpt-4o',
      v11TokensUsed: data.usage.total_tokens
    };

    // Save V11 JSON
    fs.writeFileSync(v11Path, JSON.stringify(v11Data, null, 2));
    console.log(`✅ V11 JSON saved: ${v11Path}`);

    // Preview
    console.log('\n📖 PREVIEW - Opening Hook:\n');
    console.log(blogContent.opening_hook.substring(0, 300) + '...\n');

    return v11Data;
  } catch (error) {
    console.error('❌ V11 Enrichment Error:', error.message);
    throw error;
  }
}

// Run enrichment
enrichWithV11().then(() => {
  console.log('\n🎉 V11 Blog enrichment complete!\n');
}).catch(err => {
  console.error('Failed:', err);
  process.exit(1);
});
