#!/usr/bin/env node
/**
 * VIRAL BLOG POST WRITER
 *
 * Creates 10 SEO-optimized blog posts one-by-one
 * Each post: Outline first, then full content with 50+ names
 *
 * Usage: node write-10-viral-blog-posts.js
 */

const OpenAI = require('openai');
const fs = require('fs');
require('dotenv').config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// 10 VIRAL BLOG POST TOPICS (From SEO Research)
const BLOG_POSTS = [
  {
    id: 1,
    title: "Baby Names That Mean Miracle: 60+ Divine Names for Your Blessing",
    slug: "baby-names-that-mean-miracle",
    category: "Meanings",
    keywords: ["baby names that mean miracle", "miracle baby names", "names meaning blessing"],
    targetNames: 60,
    sections: [
      "Biblical Miracle Names",
      "Names Meaning Miracle Across Cultures",
      "Divine Blessing Names",
      "Modern Miracle-Inspired Names",
      "Miracle Names for Boys",
      "Miracle Names for Girls",
      "Unisex Miracle Names"
    ]
  },
  {
    id: 2,
    title: "Anora to Zyaire: The Hottest Baby Names of 2025 You Haven't Heard Yet",
    slug: "hottest-baby-names-2025-trending",
    category: "Trends",
    keywords: ["baby names 2025", "trending baby names", "hot baby names"],
    targetNames: 55,
    sections: [
      "Oscar-Inspired Names (Anora Trend)",
      "Pop Culture Powerhouses",
      "TikTok's Favorite Names",
      "Celebrity Baby Name Predictions",
      "Hidden Gems Rising Fast",
      "International Names Breaking Through"
    ]
  },
  {
    id: 3,
    title: "90s Baby Names Making a Comeback: Your Ultimate Nostalgia Name Guide",
    slug: "90s-baby-names-comeback-nostalgia",
    category: "Trends",
    keywords: ["90s baby names", "nostalgic baby names", "retro baby names"],
    targetNames: 60,
    sections: [
      "90s TV Show Names (Friends, Seinfeld)",
      "90s Music Icon Names (Britney, Shania, Aaliyah)",
      "90s Movie Character Names",
      "90s Sitcom-Inspired Names",
      "Y2K Era Names",
      "Names That Defined the 90s"
    ]
  },
  {
    id: 4,
    title: "Bird Names for Babies: 50+ Names That Take Flight",
    slug: "bird-names-for-babies-nature",
    category: "Nature",
    keywords: ["bird names", "bird baby names", "nature names"],
    targetNames: 55,
    sections: [
      "Classic Bird Names",
      "Exotic Bird-Inspired Names",
      "Names Meaning Bird",
      "Songbird Names",
      "Powerful Bird Names (Eagles, Hawks)",
      "Gentle Bird Names (Doves, Wrens)"
    ]
  },
  {
    id: 5,
    title: "Luxury Baby Names: 55+ Names That Sound Like a Million Dollars",
    slug: "luxury-baby-names-rich-elegant",
    category: "Themes",
    keywords: ["luxury baby names", "rich baby names", "elegant names"],
    targetNames: 55,
    sections: [
      "Designer Brand Names (Tiffany, Chanel)",
      "Old Money Names",
      "New Money Names",
      "Names Meaning Wealth",
      "Regal & Royal Names",
      "Sophisticated European Names"
    ]
  },
  {
    id: 6,
    title: "Baby Names Ending in -lynn: The Ultimate 2025 Trend Guide",
    slug: "baby-names-ending-lynn-trend",
    category: "Trends",
    keywords: ["names ending in lynn", "-lynn names", "lynn suffix names"],
    targetNames: 50,
    sections: [
      "Top -lynn Names of 2025",
      "Classic -lynn Combinations",
      "Nature + lynn Names",
      "Unique -lynn Creations",
      "How to Create Your Own -lynn Name",
      "History of the -lynn Trend"
    ]
  },
  {
    id: 7,
    title: "Landscape Baby Names: 60+ Mountains, Rivers & Places for Your Explorer",
    slug: "landscape-baby-names-geography",
    category: "Nature",
    keywords: ["landscape names", "place names", "geography baby names"],
    targetNames: 60,
    sections: [
      "Mountain Names",
      "River & Lake Names",
      "City Names",
      "Country & Region Names",
      "Natural Landmark Names",
      "Coastal & Ocean Names"
    ]
  },
  {
    id: 8,
    title: "Two-Syllable Baby Names: 65+ Perfect, Punchy Names That Pop",
    slug: "two-syllable-baby-names-short",
    category: "Guides",
    keywords: ["two syllable names", "short baby names", "punchy names"],
    targetNames: 65,
    sections: [
      "Classic Two-Syllable Names",
      "Modern Two-Syllable Names",
      "Two-Syllable Boy Names",
      "Two-Syllable Girl Names",
      "Unisex Two-Syllable Names",
      "Easy-to-Pronounce Picks"
    ]
  },
  {
    id: 9,
    title: "Celebrity Baby Names 2024-2025: What the Stars Are Naming Their Kids",
    slug: "celebrity-baby-names-2024-2025",
    category: "Trends",
    keywords: ["celebrity baby names", "famous baby names", "star baby names"],
    targetNames: 55,
    sections: [
      "A-List Celebrity Babies 2024-2025",
      "Influencer Baby Name Trends",
      "Athlete Baby Names",
      "Musicians' Kids Names",
      "Royal Baby Names",
      "Most Unique Celebrity Choices"
    ]
  },
  {
    id: 10,
    title: "Baby Names That Mean Strength: 70+ Powerful Names for Warriors",
    slug: "baby-names-mean-strength-powerful",
    category: "Meanings",
    keywords: ["names that mean strong", "strength names", "warrior names"],
    targetNames: 70,
    sections: [
      "Names Meaning Strength",
      "Warrior Names Across Cultures",
      "Strong Boy Names",
      "Strong Girl Names",
      "Names Meaning Brave",
      "Power & Leadership Names"
    ]
  }
];

// System prompt for outline creation
const OUTLINE_SYSTEM_PROMPT = `You are an expert baby name content strategist and SEO specialist.

Create a detailed blog post OUTLINE that will rank #1 in Google.

OUTLINE REQUIREMENTS:
1. Compelling opening hook (2-3 paragraphs)
2. Value proposition (why read this post)
3. 6-8 main sections with H2 headers
4. Under each section:
   - 8-12 baby names
   - Brief description of section theme
   - Why these names fit the theme
5. Practical advice section
6. FAQ section (5-7 questions)
7. Heartwarming conclusion with CTA

OUTPUT FORMAT (Markdown):
# [Title]

## Opening Hook
[2-3 paragraph hook that grabs attention]

## Why This Matters
[Value proposition - why parents need this]

## Section 1: [H2 Header]
**Theme**: [Brief description]
**Names to include**: Name1, Name2, Name3... (list 8-12)
**Writing approach**: [How to present these names]

[Repeat for all sections]

## Practical Advice Section
- Tip 1
- Tip 2
- Tip 3

## FAQ Section
1. Q: [Question]
   A: [Brief answer approach]

[5-7 FAQs]

## Conclusion
[Heartwarming closing + CTA]

Be strategic, creative, and SEO-focused!`;

// System prompt for full blog writing
const BLOG_WRITING_SYSTEM_PROMPT = `You are an expert baby name writer creating viral, SEO-optimized content.

CRITICAL REQUIREMENTS:
1. Include the EXACT number of names specified (count them!)
2. Format ALL names as: <strong>Name</strong>
3. Add 3-6 CUTE NICKNAMES for EVERY name
4. Write with warmth, wit, and spiritual insight
5. Mobile-first formatting (short paragraphs, 2-3 sentences max)
6. Spread names EVENLY throughout all sections
7. Make it engaging, shareable, and heartfelt

STRUCTURE:
- Opening: Compelling hook (3-4 paragraphs)
- Body: 6-8 themed sections with H2 headers
  * Each section: 8-12 names with full treatment
  * Each name gets:
    - Name with pronunciation (if needed)
    - Meaning & origin (1-2 sentences)
    - Why it's special/trending (1-2 sentences)
    - 3-6 nicknames in separate paragraph
- Practical Advice: How to choose, pairings, sibling sets
- FAQ: 5-7 questions with detailed answers
- Conclusion: Heartwarming wrap-up with CTA
- Add: <!-- BLOG_NAME_LIST_COMPONENT --> at the very end

FORMATTING:
- Use <h2> for major sections
- Use <p> for paragraphs
- Use <strong>Name</strong> for all names
- Keep paragraphs SHORT (mobile-friendly!)
- Add personality, humor, spiritual depth

NICKNAME EXAMPLES:
- Isabella → Bella, Izzy, Belle, Isa, Sabelita, Issy
- Alexander → Alex, Xander, Lex, Sasha, Alec, Sandy
- Seraphina → Sera, Phina, Raffy, Fifi, Seffy, Seri

REMEMBER: Hit the exact name count target! Count as you write!`;

async function createOutline(post) {
  console.log(`\n${'='.repeat(80)}`);
  console.log(`📋 Creating outline for: ${post.title}`);
  console.log(`   Target: ${post.targetNames} names`);
  console.log(`   Sections: ${post.sections.length}`);

  const userPrompt = `Create a detailed SEO-optimized outline for this blog post:

TITLE: ${post.title}
SLUG: ${post.slug}
CATEGORY: ${post.category}
TARGET KEYWORDS: ${post.keywords.join(', ')}
TARGET NAME COUNT: ${post.targetNames} names minimum

SECTIONS TO COVER:
${post.sections.map((s, i) => `${i + 1}. ${s}`).join('\n')}

REQUIREMENTS:
- Must accommodate ${post.targetNames}+ unique baby names
- Each section should have 8-12 names
- SEO-optimized for target keywords
- Engaging, shareable, emotionally resonant
- Include celebrity examples, cultural context
- Add pronunciation guides for unique names
- Suggest sibling pairing ideas

Create a comprehensive outline that will help write a VIRAL blog post!`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: OUTLINE_SYSTEM_PROMPT },
        { role: "user", content: userPrompt }
      ],
      temperature: 0.7,
      max_tokens: 3000
    });

    const outline = response.choices[0].message.content.trim();
    console.log(`   ✅ Outline created (${outline.length} characters)`);

    return outline;

  } catch (error) {
    console.error(`   ❌ Error creating outline:`, error.message);
    throw error;
  }
}

async function writeBlogPost(post, outline) {
  console.log(`\n${'='.repeat(80)}`);
  console.log(`✍️  Writing full blog post: ${post.title}`);
  console.log(`   Target: ${post.targetNames} names with 3-6 nicknames each`);

  const userPrompt = `Write a complete, SEO-optimized blog post based on this outline:

${outline}

CRITICAL REQUIREMENTS:
- Include EXACTLY ${post.targetNames}+ unique baby names (count them!)
- Format EVERY name as: <strong>Name</strong>
- Add 3-6 CUTE NICKNAMES for EACH name
- Target keywords: ${post.keywords.join(', ')}
- Word count: 2,000-2,500 words
- Mobile-friendly formatting (short paragraphs)
- Witty, warm, spiritual tone
- Include celebrity examples
- Add pronunciation guides for unique names

FORMATTING:
- Pure HTML (no markdown)
- Use <h2> for sections
- Use <p> for paragraphs
- Use <strong>Name</strong> for names
- Add <!-- BLOG_NAME_LIST_COMPONENT --> at the very end

EXAMPLE FORMAT:
<h2>✨ [Section Title]</h2>

<p><strong>Aurora</strong> (aw-ROHR-ah) — The goddess of dawn brings light to new beginnings. This name has surged +45% in 2025, thanks to Disney nostalgia and celestial trend.</p>

<p>Sweet nicknames: Rory, Aura, Rora, Ori, Rorie, Roro</p>

Write the COMPLETE blog post now (pure HTML, ${post.targetNames}+ names, 3-6 nicknames each):`;

  try {
    console.log(`   🤖 Calling GPT-4o (this may take 60-90 seconds)...`);

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: BLOG_WRITING_SYSTEM_PROMPT },
        { role: "user", content: userPrompt }
      ],
      temperature: 0.8,
      max_tokens: 6000 // Large enough for full content
    });

    const content = response.choices[0].message.content.trim();

    // Count names
    const nameMatches = content.match(/<strong>(?:\d+\.\s+)?([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)<\/strong>/g);
    const nameCount = nameMatches ? nameMatches.length : 0;

    console.log(`   ✅ Blog post written!`);
    console.log(`   📊 Names found: ${nameCount}`);
    console.log(`   📝 Length: ${content.length} characters`);

    return {
      content,
      stats: {
        nameCount,
        wordCount: content.replace(/<[^>]+>/g, ' ').split(/\s+/).filter(w => w.length > 0).length,
        readingTime: Math.ceil(content.replace(/<[^>]+>/g, ' ').split(/\s+/).filter(w => w.length > 0).length / 200)
      }
    };

  } catch (error) {
    console.error(`   ❌ Error writing blog post:`, error.message);
    throw error;
  }
}

async function saveBlogPost(post, content, stats, outline) {
  const fileName = `blog-post-${post.id}-${post.slug}.json`;
  const filePath = `./blog-posts-new/${fileName}`;

  // Create directory if it doesn't exist
  if (!fs.existsSync('./blog-posts-new')) {
    fs.mkdirSync('./blog-posts-new');
  }

  const blogData = {
    id: post.id,
    title: post.title,
    slug: post.slug,
    category: post.category,
    keywords: post.keywords,
    content: content,
    outline: outline,
    stats: {
      namesCount: stats.nameCount,
      wordCount: stats.wordCount,
      readingTime: stats.readingTime
    },
    seo: {
      metaTitle: `${post.title} | SoulSeed Baby Names`,
      metaDescription: post.title.substring(0, 155) + " - Complete guide with meanings, origins, and cute nicknames.",
      keywords: post.keywords
    },
    author: {
      name: "SoulSeed Editorial Team",
      avatar: "https://via.placeholder.com/50"
    },
    publishedAt: new Date().toISOString(),
    status: "draft",
    tags: post.keywords
  };

  fs.writeFileSync(filePath, JSON.stringify(blogData, null, 2));
  console.log(`   💾 Saved to: ${filePath}`);

  return filePath;
}

async function main() {
  console.log('🚀 VIRAL BLOG POST WRITER\n');
  console.log(`Creating ${BLOG_POSTS.length} SEO-optimized blog posts...`);
  console.log(`Model: GPT-4o (strongest LLM)\n`);

  const results = [];

  for (let i = 0; i < BLOG_POSTS.length; i++) {
    const post = BLOG_POSTS[i];

    try {
      console.log(`\n📝 POST ${i + 1}/${BLOG_POSTS.length}`);

      // Step 1: Create outline
      const outline = await createOutline(post);

      // Wait a bit between API calls
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Step 2: Write full blog post
      const { content, stats } = await writeBlogPost(post, outline);

      // Step 3: Save to file
      const filePath = await saveBlogPost(post, content, stats, outline);

      results.push({
        success: true,
        post: post.title,
        names: stats.nameCount,
        words: stats.wordCount,
        file: filePath
      });

      console.log(`   ✅ POST ${i + 1} COMPLETE!`);
      console.log(`   📊 ${stats.nameCount} names | ${stats.wordCount} words | ${stats.readingTime} min read`);

      // Rate limiting: wait 3 seconds between posts
      if (i < BLOG_POSTS.length - 1) {
        console.log(`\n   ⏳ Waiting 3 seconds before next post...`);
        await new Promise(resolve => setTimeout(resolve, 3000));
      }

    } catch (error) {
      console.error(`   ❌ FAILED: ${error.message}`);
      results.push({
        success: false,
        post: post.title,
        error: error.message
      });
    }
  }

  // Final summary
  console.log(`\n${'='.repeat(80)}`);
  console.log('📊 FINAL SUMMARY\n');

  const successCount = results.filter(r => r.success).length;
  const failCount = results.filter(r => !r.success).length;

  console.log(`   ✅ Successfully created: ${successCount}`);
  console.log(`   ❌ Failed: ${failCount}`);
  console.log(`   📝 Total posts: ${BLOG_POSTS.length}\n`);

  console.log('📈 RESULTS:\n');
  results.forEach(r => {
    if (r.success) {
      console.log(`   ✅ ${r.post}`);
      console.log(`      ${r.names} names | ${r.words} words`);
      console.log(`      File: ${r.file}\n`);
    } else {
      console.log(`   ❌ ${r.post}: ERROR - ${r.error}\n`);
    }
  });

  // Save summary report
  fs.writeFileSync('blog-creation-report.json', JSON.stringify({
    completedAt: new Date().toISOString(),
    totalPosts: BLOG_POSTS.length,
    successCount,
    failCount,
    results
  }, null, 2));

  console.log(`💾 Summary report: blog-creation-report.json\n`);

  if (successCount === BLOG_POSTS.length) {
    console.log('🎉 ALL 10 BLOG POSTS CREATED SUCCESSFULLY!\n');
    console.log('Next step: Upload to Firestore with upload-blog-posts.js\n');
  }

  process.exit(0);
}

main();
