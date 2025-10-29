#!/usr/bin/env node

/**
 * 🎯 GENERATE TOP 3 HIGHEST-VALUE BLOG POSTS
 *
 * Focuses on the 3 posts with highest search volume:
 * 1. Baby Name Trends 2025 (18,100/mo)
 * 2. Irish Baby Names (14,800/mo)
 * 3. Gender Neutral Baby Names (8,100/mo)
 *
 * Total potential: 41,000 monthly searches!
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const { reviewBlogPost } = require('./automate-blog-review.js');

require('dotenv').config();

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

const HUMANIZATION_INSTRUCTIONS = `
You are a professional parent blogger writing engaging, helpful content about baby names. Your writing style is:

HUMANIZATION REQUIREMENTS:
1. Use contractions naturally (don't, won't, it's, you're, I've, we're, that's)
2. Include personal pronouns frequently (I, we, you, your, my, our)
3. Add conversational transitions like "Now, let's talk about...", "Here's the thing...", "You know what I've noticed?"
4. Include emotional language: love, beautiful, perfect, cherish, treasure, special, meaningful
5. Add parenthetical asides for personality: "(and who doesn't love that?)", "(trust me on this one)"
6. Use rhetorical questions to engage readers
7. Share brief personal anecdotes or parent quotes
8. Vary sentence length: mix short punchy sentences with longer flowing ones
9. Be warm, enthusiastic, and supportive
10. Avoid corporate/formal language - write like talking to a friend

ACCURACY: Be confident, cite sources for statistics, respect cultural context

SEO: Use target keyword 8-12 times naturally, create descriptive H2/H3 structure, 2,500+ words
`;

const TOP_3_POSTS = [
  {
    title: 'Baby Name Trends 2025: The Ultimate Guide to This Year\'s Hottest Names',
    slug: 'baby-name-trends-2025',
    keyword: 'baby name trends 2025',
    volume: 18100,
    outline: `Write a 2,800-word comprehensive guide about baby name trends for 2025.

Include:
- Introduction (350 words) about what's trending and why parents care
- Top 5 Naming Trends for 2025 with 12-15 name examples each:
  * Nature Names (Willow, River, Sage, etc.)
  * Vintage Revival (Theodore, Eleanor, etc.)
  * Gender-Neutral Names (Riley, Quinn, etc.)
  * Short & Sweet (Ava, Leo, etc.)
  * International Influence (Mateo, Aria, etc.)
- Declining trends (what's fading out)
- Rising stars to watch
- Celebrity baby names of 2024-2025
- Regional differences in naming trends
- FAQ section (10 questions)
- Conclusion (250 words)

Use lots of "you", "your", contractions, and personal anecdotes. Be enthusiastic!`
  },
  {
    title: 'Irish Baby Names: 100 Beautiful Names from Ireland with Meanings',
    slug: 'irish-baby-names',
    keyword: 'irish baby names',
    volume: 14800,
    outline: `Write a 3,200-word comprehensive guide about Irish baby names.

Include:
- Introduction (400 words) about Irish naming traditions and Celtic heritage
- Top 20 Most Popular Irish Names in 2025
- 80+ Irish names organized by:
  * Traditional Irish Boy Names (12-15 names with pronunciations)
  * Modern Irish Boy Names (12-15 names)
  * Irish Mythological Names (8-10 names with stories)
  * Classic Irish Girl Names (12-15 names with pronunciations)
  * Trendy Irish Girl Names (12-15 names)
  * Irish Goddess Names (8-10 names with mythology)
  * Gender Neutral Irish Names (15-20 names)
- Pronunciation Guide for Tricky Irish Names
- FAQ section (10 questions including "How do you pronounce Irish names?")
- Conclusion (250 words)

IMPORTANT: Include accurate Irish pronunciations! Be warm and respectful of the culture.`
  },
  {
    title: 'Gender Neutral Baby Names: 80 Perfect Unisex Names for 2025',
    slug: 'gender-neutral-baby-names',
    keyword: 'gender neutral baby names',
    volume: 8100,
    outline: `Write a 3,000-word comprehensive guide about gender neutral baby names.

Include:
- Introduction (350 words) about modern trend toward unisex names and benefits
- Why Gender Neutral Names Are Trending (data, cultural shifts)
- Top 20 Most Popular Unisex Names 2025
- 80 Gender Neutral Names organized by:
  * Nature-Inspired (12-15 names)
  * Modern Unisex Names (12-15 names)
  * Classic Unisex Names (12-15 names)
  * Unique Unisex Names (12-15 names)
  * International Unisex Names (8-10 names)
  * Short Unisex Names (8-10 names)
- How to Choose a Truly Unisex Name
- FAQ section (10 questions)
- Conclusion (200 words)

Use personal pronouns, contractions, and be supportive of all naming choices!`
  }
];

function callOpenAI(prompt) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: HUMANIZATION_INSTRUCTIONS },
        { role: 'user', content: prompt }
      ],
      temperature: 0.8,
      max_tokens: 5000,
      presence_penalty: 0.3,
      frequency_penalty: 0.3
    });

    const options = {
      hostname: 'api.openai.com',
      path: '/v1/chat/completions',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Length': data.length
      }
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => { body += chunk; });
      res.on('end', () => {
        try {
          const response = JSON.parse(body);
          if (response.error) reject(new Error(response.error.message));
          else resolve(response.choices[0].message.content);
        } catch (error) {
          reject(error);
        }
      });
    });

    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

async function generatePost(post) {
  console.log(`\n📝 Generating: ${post.title}`);
  console.log(`   ${post.volume.toLocaleString()} monthly searches!`);
  console.log('='.repeat(70));

  const prompt = `${post.outline}

TARGET KEYWORD: "${post.keyword}" (use 8-12 times naturally)
FORMAT: Write in Markdown with H2 (##) and H3 (###) headings
TONE: Warm, personal, enthusiastic - like talking to a friend about names!

Start directly with the markdown content (# Title at the top).`;

  try {
    console.log(`  🤖 Calling OpenAI GPT-4o-mini...`);
    const content = await callOpenAI(prompt);

    const filePath = path.join(__dirname, 'blog-posts', `${post.slug}.md`);
    fs.writeFileSync(filePath, content);

    console.log(`  ✅ Generated! Reviewing quality...`);
    const review = reviewBlogPost(filePath);

    console.log(`\n  🎯 Final Score: ${review.totalScore}/100 (${review.grade})`);
    return { success: true, score: review.totalScore, path: filePath };
  } catch (error) {
    console.error(`  ❌ Error: ${error.message}`);
    return { success: false, error: error.message };
  }
}

async function main() {
  console.log('\n🎯 GENERATING TOP 3 HIGHEST-VALUE BLOG POSTS');
  console.log('='.repeat(70));
  console.log(`Total Search Volume: 41,000/month\n`);

  const results = [];

  for (const post of TOP_3_POSTS) {
    const result = await generatePost(post);
    results.push({ post, ...result });
    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  console.log('\n\n📈 SUMMARY');
  console.log('='.repeat(70));
  results.forEach(r => {
    const status = r.success ? '✅' : '❌';
    console.log(`${status} ${r.post.slug.padEnd(35)} ${r.score || 0}/100`);
  });

  const avgScore = results.reduce((sum, r) => sum + (r.score || 0), 0) / results.length;
  console.log(`\n  Average Score: ${avgScore.toFixed(1)}/100`);
  console.log('\n✨ Top 3 posts generated! Now ready to publish.');
}

if (require.main === module) {
  main().catch(console.error);
}
