/**
 * Generic Blog Post Rewriter
 * Usage: node rewrite-blog-generic.js <post-number>
 * Example: node rewrite-blog-generic.js 3
 *
 * Reformats any blog post to match post-1 style:
 * - Proper HTML formatting
 * - Medium length (1,000-1,500 words)
 * - Fun, witty tone
 * - Heart button compatible name format
 */

const OpenAI = require('openai');
const fs = require('fs');
const path = require('path');

require('dotenv').config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Get post number from command line
const postNumber = process.argv[2];

if (!postNumber) {
  console.error('\n❌ Error: Please provide a post number');
  console.log('Usage: node rewrite-blog-generic.js <post-number>');
  console.log('Example: node rewrite-blog-generic.js 3\n');
  process.exit(1);
}

// Find the post file
const blogDir = path.join(__dirname, 'blog-posts-seo');
const files = fs.readdirSync(blogDir);
const postFile = files.find(f => f.startsWith(`post-${postNumber}-`) && f.endsWith('.json'));

if (!postFile) {
  console.error(`\n❌ Error: Could not find post-${postNumber}-*.json`);
  console.log(`\nAvailable posts in blog-posts-seo/:`);
  files.filter(f => f.startsWith('post-') && f.endsWith('.json'))
    .forEach(f => console.log(`  - ${f}`));
  console.log('');
  process.exit(1);
}

const postPath = path.join(blogDir, postFile);
const post = JSON.parse(fs.readFileSync(postPath, 'utf-8'));

console.log(`\n🎨 Rewriting Post #${postNumber}: ${post.title}\n`);
console.log(`📊 Current: ${post.stats.wordCount} words (${post.stats.readingTime} min read)`);
console.log(`🎯 Target: 1,000-1,500 words (4-6 min read)\n`);

const prompt = `Rewrite this baby names blog post to match the fun, witty style of a successful blog.

CURRENT POST:
Title: ${post.title}
Content: ${post.content}

TARGET STYLE:
- Fun, witty, conversational tone (like talking to a friend)
- Modern pop culture references (TikTok, Instagram, celebrities)
- Spiritual depth without being preachy
- Ancient history made cool and accessible
- SHORT and engaging (1,000-1,500 words MAX)

CRITICAL FORMATTING REQUIREMENTS:

1. **Remove <article> wrapper** - Start directly with <h1>

2. **Name Format** - MUST use this exact format:
   <strong>Name</strong> (origin, means X): Brief explanation in same paragraph

   ✅ CORRECT: <strong>Aurora</strong> (Latin, means dawn): Roman goddess painting the sky each morning. This name is giving serious main character energy with Disney princess vibes.

   ❌ WRONG:
   - <strong>1. Aurora</strong> (or-OR-uh) - Latin
   - Meaning: dawn
   - Long explanation on separate lines...

3. **Proper HTML Structure**:
   - All text wrapped in <p> tags
   - Headers: <h1>, <h2>, <h3> only
   - Lists: <ul><li> format
   - NO <br> tags (use new <p> instead)
   - NO <article> wrapper

4. **FAQ Structure** - Use this EXACT format:
   <h2>FAQ: [Catchy Title]</h2>

   <div class="faq-item">
     <h3 class="faq-question">Question here?</h3>
     <p class="faq-answer">Answer with <strong>Name</strong> mentions naturally integrated.</p>
   </div>

   [3-5 more FAQ items in same format]

5. **Length**: Cut to 1,000-1,500 words
   - Keep the BEST and most trending names
   - Remove redundant explanations
   - Make every sentence count
   - Focus on quality over quantity

6. **Tone Requirements**:
   - Witty and fun (like chatting with a cool friend)
   - Pop culture references (movies, TV, TikTok, celebrities)
   - Modern slang ("giving main character energy", "crushing it", etc.)
   - Spiritual/meaningful without being preachy
   - Accessible to parents AND their 12-year-old kids
   - Use emojis in headers (✨ ☀️ ⭐ 🌈 💫 🌸 etc.)

7. **Structure Template**:
   <h1>Catchy Main Title</h1>

   <h2>Why [Topic] Names Are Trending Now</h2>
   <p>Fun, engaging intro about why this name category is hot right now. Reference pop culture, celebrities, social media trends...</p>

   <h2>Section 1: [Category] ✨</h2>
   <p><strong>Name1</strong> (origin, means X): Fun explanation with pop culture reference...</p>

   <p><strong>Name2</strong> (origin, means X): Another engaging story...</p>

   [Continue with more names in flowing paragraph format]

   <h2>Section 2: [Another Category] 💫</h2>
   <p><strong>Name3</strong> (origin, means X): Witty description...</p>

   [More names...]

   <h2>Why These Names Work in 2025</h2>
   <p>Practical advice in fun, accessible tone...</p>

   <h2>FAQ: Your [Topic] Questions Answered</h2>

   <div class="faq-item">
     <h3 class="faq-question">First question?</h3>
     <p class="faq-answer">Fun, informative answer with <strong>Name</strong> examples.</p>
   </div>

   [3-5 FAQ items total]

   <h2>Final Thoughts: [Uplifting Close]</h2>
   <p>Warm, encouraging conclusion. Mention SoulSeed app and its features (174,000+ names, Tinder-style swiping, etc.). End on inspirational note.</p>

ABSOLUTE REQUIREMENTS:
✅ NO <article> tags
✅ NO numbered names (1., 2., etc.)
✅ NO <br> tags
✅ Names MUST be: <strong>Name</strong> (origin, means X): explanation
✅ FAQ MUST use <div class="faq-item"> structure
✅ Keep it SHORT (1,000-1,500 words)
✅ Make it FUN, WITTY, and ENGAGING
✅ Use emojis in section headers
✅ Pop culture references throughout

Begin rewriting now:`;

async function rewritePost() {
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: 'You are a witty, fun blogger who makes baby name research entertaining for both parents and kids. You blend pop culture, history, and modern trends into accessible, engaging content. Your writing style is conversational, like talking to a cool older sibling who knows everything about names.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.9,
      max_tokens: 16000
    });

    let content = response.choices[0].message.content.trim();

    // Clean up any code block markers
    content = content
      .replace(/^```html\n*/gi, '')
      .replace(/\n*```$/g, '')
      .trim();

    const nameCount = (content.match(/<strong>[A-Z][a-z]+<\/strong>/g) || []).length;
    const wordCount = content.split(/\s+/).length;

    console.log(`\n✅ Rewrite complete!`);
    console.log(`   Names included: ${nameCount}`);
    console.log(`   Word count: ${wordCount} (was ${post.stats.wordCount})`);
    console.log(`   Reading time: ${Math.ceil(wordCount / 250)} min (was ${post.stats.readingTime} min)`);

    if (wordCount > 1800) {
      console.warn(`\n⚠️  Still a bit long at ${wordCount} words (target: 1,000-1,500)`);
    } else if (wordCount < 900) {
      console.warn(`\n⚠️  A bit short at ${wordCount} words (target: 1,000-1,500)`);
    }

    // Update post
    const updatedPost = {
      ...post,
      content: content,
      updatedAt: Date.now(),
      stats: {
        wordCount: wordCount,
        readingTime: Math.ceil(wordCount / 250)
      }
    };

    fs.writeFileSync(postPath, JSON.stringify(updatedPost, null, 2));

    console.log(`\n💾 Saved to: ${postPath}`);
    console.log(`\n✨ Post #${postNumber} reformatted successfully!`);
    console.log(`\n📱 View at: http://localhost:3000/babyname2/blog/${post.slug}`);
    console.log(`\n📝 Next: node rewrite-blog-generic.js ${parseInt(postNumber) + 1} (for next post)`);

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    if (error.response) {
      console.error('   API Error:', error.response.data);
    }
    process.exit(1);
  }
}

rewritePost();
