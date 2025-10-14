require('dotenv').config({ debug: true });
const fs = require('fs').promises;
const path = require('path');
const OpenAI = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * High-quality blog post rewriter using GPT-4o
 * Completely rewrites blog posts with 50+ names from database + Nameberry research
 */

async function loadDatabaseNames() {
  const allNames = [];
  for (let i = 1; i <= 4; i++) {
    try {
      const chunkPath = path.join(__dirname, 'public', 'data', `names-chunk${i}.json`);
      const chunk = JSON.parse(await fs.readFile(chunkPath, 'utf-8'));
      allNames.push(...chunk);
    } catch (err) {
      console.warn(`⚠️  Could not load chunk ${i}`);
    }
  }
  return allNames;
}

async function rewritePostWithGPT4o(postFilename, additionalNames = []) {
  console.log(`\n${'='.repeat(70)}`);
  console.log(`🎨 PREMIUM REWRITE: ${postFilename}`);
  console.log('='.repeat(70));

  // Load current post
  const postPath = path.join(__dirname, 'blog-posts-seo', postFilename);
  const post = JSON.parse(await fs.readFile(postPath, 'utf-8'));

  console.log(`\n📖 Current Post:`);
  console.log(`   Title: ${post.title}`);
  console.log(`   Current name count: ~${(post.content.match(/<strong>/g) || []).length}`);
  console.log(`   SEO Keywords: ${post.seo.keywords.slice(0, 5).join(', ')}...`);

  // Load database
  console.log(`\n📦 Loading database...`);
  const dbNames = await loadDatabaseNames();
  console.log(`   Loaded ${dbNames.length.toLocaleString()} names from database`);

  // Prepare comprehensive name list
  const combinedNames = [...dbNames, ...additionalNames].map(n => ({
    name: n.name,
    origin: n.origin || 'Unknown',
    meaning: n.meaning || 'beautiful name',
    gender: n.gender || n.sex || 'unisex'
  }));

  console.log(`   Total names available: ${combinedNames.length.toLocaleString()}`);

  // Create detailed prompt
  const prompt = `You are Dr. Amara Okonkwo, a PhD in Linguistics and Cultural Name Studies Expert. You write EXCEPTIONAL, SEO-optimized blog posts about baby names with wit, pop culture references, and engaging storytelling.

🎯 YOUR MISSION: Completely rewrite this blog post to include **EXACTLY 50+ NAMES** while maintaining peak quality and SEO optimization.

CURRENT POST DATA:
Title: ${post.title}
Excerpt: ${post.excerpt}
Target Keywords: ${post.seo.keywords.join(', ')}
Category: ${post.category}

AVAILABLE NAMES (first 200 from ${combinedNames.length} total):
${combinedNames.slice(0, 200).map(n => `${n.name} (${n.origin}, means "${n.meaning}")`).join('\n')}

CRITICAL REQUIREMENTS:

1. **MINIMUM 50 NAMES** - Include at LEAST 50 different names with <strong> tags
2. **SEO OPTIMIZATION** - Use these keywords naturally: ${post.seo.keywords.slice(0, 10).join(', ')}
3. **FORMATTING**:
   - <h1> for main title
   - <h2> for major sections
   - <h3> for subsections
   - <p> for paragraphs
   - <strong>NameHere</strong> (Origin, means "meaning"): Witty 2-3 sentence description
   - NO bullet points, flowing paragraphs only

4. **SECTION STRUCTURE** (organize 50+ names):
   - Introduction (engaging hook with trending data)
   - 5-7 main name sections with creative titles
   - Each section: 7-10 names with descriptions
   - Why These Names Work in 2025 (trends analysis)
   - Final Thoughts (CTA to SoulSeed app)
   - End with: <!-- BLOG_NAME_LIST_COMPONENT -->

5. **WRITING STYLE**:
   - Witty, conversational, Gen Z/Millennial tone
   - Pop culture references (TikTok, Netflix, celebs)
   - Emoji throughout (✨ 💫 🌟 ⚡ 💖 etc.)
   - Spiritual/mystical vibes where relevant
   - Celebrity baby name examples
   - Nickname suggestions for each name

6. **NAME SELECTION CRITERIA**:
   - Choose names that fit the blog topic PERFECTLY
   - Mix of common (Emma), moderate (Beatrice), and rare (Elowen) names
   - Gender diversity (girls, boys, unisex)
   - Cultural variety (Latin, Greek, Hebrew, etc.)
   - NO fictional character names (no Gandalf, Voldemort, etc.)

7. **LENGTH**: 2000-2500 words (comprehensive but engaging)

8. **SEO TIPS**:
   - Use primary keyword "${post.seo.keywords[0]}" in first 100 words
   - Include keyword variations naturally throughout
   - Add "2025" and "trending" references
   - Mention specific celebrities who chose these names

Generate the complete blog post content now (HTML only, no JSON wrapper):`;

  console.log(`\n🤖 Generating premium content with GPT-4o...`);
  console.log(`   Model: gpt-4o`);
  console.log(`   Max tokens: 14000`);
  console.log(`   Temperature: 0.7`);

  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      {
        role: 'system',
        content: 'You are Dr. Amara Okonkwo, an expert baby name blogger who writes comprehensive, SEO-optimized posts with 50+ names, witty descriptions, and pop culture references. You NEVER include fictional character names like Gandalf or Voldemort.'
      },
      {
        role: 'user',
        content: prompt
      }
    ],
    temperature: 0.7,
    max_tokens: 14000,
  });

  let newContent = response.choices[0].message.content.trim();

  // Clean up markdown
  if (newContent.startsWith('```html')) {
    newContent = newContent.replace(/```html\n?/g, '').replace(/```\n?$/g, '');
  } else if (newContent.startsWith('```')) {
    newContent = newContent.replace(/```\n?/g, '');
  }

  // Ensure placeholder at end
  if (!newContent.includes('<!-- BLOG_NAME_LIST_COMPONENT -->')) {
    newContent += '\n\n<!-- BLOG_NAME_LIST_COMPONENT -->\n';
  }

  // Count names
  const nameCount = (newContent.match(/<strong>[A-Z]/g) || []).length;
  console.log(`\n✅ Generated content with ${nameCount} names`);

  if (nameCount < 50) {
    console.warn(`⚠️  WARNING: Only ${nameCount} names found (target: 50+)`);
  }

  // Update post
  post.content = newContent;

  // Update stats
  const text = newContent.replace(/<[^>]+>/g, ' ');
  const wordCount = text.split(/\s+/).filter(w => w.length > 0).length;
  const readingTime = Math.max(1, Math.ceil(wordCount / 200));

  post.stats = { wordCount, readingTime };
  post.updatedAt = Date.now();

  if (post.seo && post.seo.schema) {
    post.seo.schema.wordCount = wordCount;
  }

  // Save with backup
  const backupPath = postPath.replace('.json', '_backup_premium.json');
  await fs.copyFile(postPath, backupPath);
  await fs.writeFile(postPath, JSON.stringify(post, null, 2));

  console.log(`\n💾 Saved:`);
  console.log(`   Main: ${path.basename(postPath)}`);
  console.log(`   Backup: ${path.basename(backupPath)}`);
  console.log(`   Names: ${nameCount}`);
  console.log(`   Words: ${wordCount}`);
  console.log(`   Reading time: ${readingTime} min`);

  console.log(`\n${'='.repeat(70)}`);
  console.log(`✨ PREMIUM REWRITE COMPLETE!`);
  console.log('='.repeat(70));

  return { nameCount, wordCount, readingTime };
}

async function main() {
  const postFilename = process.argv[2];

  if (!postFilename) {
    console.log(`
🎨 Premium Blog Post Rewriter (GPT-4o)

Usage: node rewrite-blog-post-premium.js <post-filename>

Example:
  node rewrite-blog-post-premium.js post-2-vintage-names.json
`);
    process.exit(1);
  }

  try {
    await rewritePostWithGPT4o(postFilename);
  } catch (error) {
    console.error(`\n❌ Error:`, error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { rewritePostWithGPT4o };
