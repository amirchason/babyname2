/**
 * Rewrite Blog Post #1 - FUN, SHORT, WITTY Style
 * Shorter, accessible to 12-year-olds, each name gets explanation
 * Mix of story, spirituality, modern culture, ancient culture
 */

const OpenAI = require('openai');
const fs = require('fs');
const path = require('path');

require('dotenv').config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Load names
const allNamesPath = path.join(__dirname, 'blog-posts-seo', 'all-light-sun-star-names.json');
const allNamesData = JSON.parse(fs.readFileSync(allNamesPath, 'utf-8'));

const selectedNames = allNamesData.names
  .filter(n => n.meaning && n.meaning !== 'Unknown' && n.origin && n.origin !== 'Unknown')
  .slice(0, 150);

console.log(`✅ Selected ${selectedNames.length} names`);

// Create name list with details
const nameDetails = selectedNames.map(n =>
  `${n.name} (${n.origin}, means: ${n.meaning})`
).join('\n');

const prompt = `Write a FUN, WITTY, SHORT blog post about baby names meaning light, sun, and stars.

TARGET AUDIENCE: Parents AND their 12-year-old kids should both enjoy reading this!

TONE:
- Witty and playful (like talking to a friend)
- Modern pop culture references (TikTok, celebrities, Disney)
- Spiritual depth without being preachy
- Ancient mythology made cool and accessible
- Fun to read, never boring!

LENGTH: 1800-2200 words total (SHORT and snappy!)

STRUCTURE:

<h1>Baby Names That Shine: A Journey Through Light, Sun, and Stars</h1>

<h2>Why Light Names Are Having a Moment</h2>
[200 words: Fun intro about why light/sun/star names are trending. Reference celebrities, astrology TikTok, spiritual awakening movements. Make it relatable and modern.]

<h2>Names Meaning Light: Bright Vibes Only ✨</h2>
[400 words: Weave 30-35 light names into fun narratives]

For each name, use this format:
- Mention name in a story/context
- Immediately give SHORT explanation (origin + meaning)
- Add modern or spiritual relevance

EXAMPLE:
"Picture the Roman goddess Aurora literally painting the sky every morning with her rosy fingers. <strong>Aurora</strong> (Latin, means dawn) has become the go-to name for parents who love Disney princesses AND astronomy. It's sitting pretty at #44 on the charts, and honestly? It's giving main character energy.

Or take <strong>Lucia</strong> (Latin, light-bringer), celebrated every December 13th with candles and festivals across Scandinavia. Saint Lucia literally wore a crown of candles to bring food to Christians in hiding—talk about the OG flashlight! Modern parents love Lucy/Lucia for its vintage-yet-fresh vibe..."

<h3>Greek Goddess Energy</h3>
[Subgroup names with Greek origins]

<h3>Latin Classics That Never Quit</h3>
[Latin names]

<h2>Solar Names: Hot Like the Sun ☀️</h2>
[400 words: 30-35 sun-related names, fun and accessible]

<h3>Egyptian Sun God Vibes</h3>
<h3>Modern Solar Picks</h3>

<h2>Star Names: Written in the Cosmos ⭐</h2>
[400 words: 30-35 star names]

<h3>Constellation Legends</h3>
<h3>Pop Culture Star Power</h3>

<h2>Gender-Neutral Light Names: For Everyone 🌈</h2>
[300 words: Unisex names, modern gender-neutral naming trend]

<h2>Quick Spiritual Guide: Choosing Your Light</h2>
[200 words: Fun spiritual/practical advice]

<h3>FAQ (The Real Questions Parents Ask)</h3>
Q: What's the coolest light name nobody's using yet?
[Fun, short answer with 2-3 name examples]

Q: Which light names are TikTok-approved?
[Modern answer]

Q: Do light names actually affect personality?
[Spiritual + scientific balanced answer]

Q: What about nicknames?
[Practical examples]

<h2>Final Thoughts: Let Your Baby's Name Shine</h2>
[150 words: Warm conclusion, SoulSeed app mention, empowering close]

CRITICAL REQUIREMENTS:
1. Each name MUST get: origin + meaning + 1 sentence context
2. Short paragraphs (2-4 sentences max)
3. Witty tone throughout
4. Modern references (celebrities, trends, apps)
5. Ancient mythology made accessible
6. Spiritual but not preachy
7. Fun emojis in headers (✨☀️⭐🌈)
8. NO number mentions ("150 names")
9. Web-first: scannable, mobile-friendly

NAMES TO INCLUDE (ALL ${selectedNames.length}):
${nameDetails}

Begin writing the fun, witty blog post now:`;

async function rewriteFun() {
  try {
    console.log('\n🎉 Using GPT-4o to write FUN, WITTY blog post...\n');

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: 'You are a witty, fun blogger who makes baby name research entertaining for both parents and kids. You blend pop culture, spirituality, and ancient history into accessible, engaging content. Your writing is like talking to a cool older sibling who knows everything about names.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.9, // High creativity for fun tone
      max_tokens: 16000
    });

    let content = response.choices[0].message.content.trim();

    // Clean up
    content = content
      .replace(/^```html\n*/gi, '')
      .replace(/\n*```$/g, '')
      .trim();

    const nameCount = (content.match(/<strong>[A-Z][a-z]+<\/strong>/g) || []).length;
    const wordCount = content.split(/\s+/).length;

    console.log(`\n✅ Fun blog post complete!`);
    console.log(`   Names included: ${nameCount}`);
    console.log(`   Word count: ${wordCount}`);
    console.log(`   Reading time: ${Math.ceil(wordCount / 250)} min`);

    if (nameCount < 100) {
      console.warn(`\n⚠️  Only ${nameCount} names found (expected ~${selectedNames.length})`);
      console.log(`   This is OK if the post is fun and accessible!`);
    }

    // Save
    const postPath = path.join(__dirname, 'blog-posts-seo', 'post-1-light-sun-star-names.json');
    const post = JSON.parse(fs.readFileSync(postPath, 'utf-8'));

    const newTitle = "Baby Names That Shine: Light, Sun & Star Names That Sparkle ✨";
    const newExcerpt = "Discover celestial baby names with meanings you'll actually understand! From Greek goddesses to TikTok trends, we're breaking down light, sun, and star names with witty stories and spiritual vibes.";

    const updatedPost = {
      ...post,
      title: newTitle,
      excerpt: newExcerpt,
      content: content,
      updatedAt: Date.now(),
      stats: {
        wordCount: wordCount,
        readingTime: Math.ceil(wordCount / 250)
      },
      seo: {
        ...post.seo,
        metaTitle: "Baby Names Meaning Light, Sun & Star - Fun Guide 2025",
        metaDescription: "Fun, witty guide to celestial baby names! Discover light, sun & star names with meanings, origins, and pop culture connections. Perfect for modern parents.",
        keywords: [
          "baby names meaning light",
          "sun baby names",
          "star baby names",
          "celestial baby names 2025",
          "fun baby name guide",
          "modern spiritual names",
          "trendy baby names",
          "goddess baby names"
        ]
      }
    };

    fs.writeFileSync(postPath, JSON.stringify(updatedPost, null, 2));

    console.log(`\n💾 Saved fun version!`);
    console.log(`   Title: "${newTitle}"`);

    console.log(`\n✨ Blog #1 rewritten with FUN, WITTY style!`);
    console.log(`\n📝 Next: node upload-single-blog-post.js`);

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    if (error.response) {
      console.error('   API Error:', error.response.data);
    }
    process.exit(1);
  }
}

rewriteFun();
