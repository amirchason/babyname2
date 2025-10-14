/**
 * Rewrite Blog Post #2 - Vintage Names
 * Reformats to match post-1 style: proper HTML, medium length, fun & witty
 */

const OpenAI = require('openai');
const fs = require('fs');
const path = require('path');

require('dotenv').config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Load current post-2
const postPath = path.join(__dirname, 'blog-posts-seo', 'post-2-vintage-names.json');
const post = JSON.parse(fs.readFileSync(postPath, 'utf-8'));

const prompt = `Rewrite this vintage baby names blog post to match the fun, witty style of a successful blog post.

CURRENT POST CONTENT:
${post.content}

TARGET STYLE (from successful post-1):
- Fun, witty, conversational tone (like talking to a friend)
- Modern pop culture references
- Spiritual depth without being preachy
- Ancient history made cool and accessible
- SHORT and engaging (1,000-1,500 words MAX)

CRITICAL FORMATTING REQUIREMENTS:

1. **Remove <article> wrapper** - Start directly with <h1>

2. **Name Format** - MUST use this exact format for InlineNameWithHeart component:
   <strong>Name</strong> (origin, means X): Brief explanation in same paragraph

   CORRECT: <strong>Beatrice</strong> (Latin, means "she who brings happiness"): Dante's muse in "The Divine Comedy" and a British royal name. This name has surged 200% in popularity since 2010.

   WRONG: <strong>1. Beatrice</strong> (BEE-uh-triss) - Latin<br>Meaning: "she who brings happiness"<br>Long explanation...

3. **Proper HTML Structure**:
   - All text in <p> tags
   - Headers: <h1>, <h2>, <h3> only
   - Lists with <ul><li>
   - No <br> tags (use new <p> instead)

4. **FAQ Structure** - Use this exact format:
   <div class="faq-item">
     <h3 class="faq-question">Question here?</h3>
     <p class="faq-answer">Answer here with <strong>name</strong> mentions.</p>
   </div>

5. **Length**: Cut to 1,000-1,500 words (currently 2,850 - WAY too long!)
   - Keep the BEST vintage names (focus on trending ones)
   - Remove redundant explanations
   - Make every sentence count

6. **Tone**:
   - Witty and fun (reference pop culture: Downton Abbey, celebrities)
   - Modern references (TikTok, Instagram, "giving main character energy")
   - Spiritual/meaningful without being preachy
   - Accessible to parents AND their 12-year-old kids

7. **Structure**:
   <h1>Main Title</h1>

   <h2>Why Vintage Names Are Having a Moment</h2>
   <p>Fun intro about trend...</p>

   <h2>Vintage Girls' Names: Grandma Chic Is Back ✨</h2>
   <p><strong>Beatrice</strong> (Latin, means "she who brings happiness"): Dante's muse and British royal name. It's giving Victorian elegance meets modern sophistication...</p>

   <p><strong>Florence</strong> (Latin, means "flourishing"): Florence Nightingale made this name legendary, and Florence Welch makes it cool. If your daughter channels both nurse and rockstar energy, this is it...</p>

   [Continue with more names in same flowing paragraph format]

   <h2>Vintage Boys' Names: Distinguished Gentleman Vibes ⚡</h2>
   <p><strong>Theodore</strong> (Greek, means "gift of God"): The ultimate vintage comeback story. Thanks to Teddy Roosevelt and countless hipster parents, Theodore jumped from #181 to the top 10...</p>

   [More names...]

   <h2>Why These Names Work in 2025</h2>
   <p>Practical advice in fun tone...</p>

   <h2>FAQ: Your Vintage Name Questions Answered</h2>

   <div class="faq-item">
     <h3 class="faq-question">Are vintage names too old for 2025?</h3>
     <p class="faq-answer">Absolutely not! <strong>Theodore</strong> and <strong>Hazel</strong> are crushing it in the top 50. Vintage is the new modern.</p>
   </div>

   [3-4 more FAQ items]

   <h2>Final Thoughts: Vintage Never Goes Out of Style</h2>
   <p>Warm conclusion with SoulSeed app mention...</p>

IMPORTANT:
- NO <article> tags
- NO numbered names (1. Beatrice)
- NO <br> tags
- Names MUST be: <strong>Name</strong> (origin, means X): explanation
- FAQ MUST use div/class structure
- Keep it SHORT (1,000-1,500 words)
- Make it FUN and WITTY

Begin rewriting now:`;

async function rewritePost2() {
  try {
    console.log('\n🎨 Rewriting Post #2: Vintage Names...\n');
    console.log('📊 Current: 2,850 words (too long!)');
    console.log('🎯 Target: 1,000-1,500 words\n');

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: 'You are a witty, fun blogger who makes baby name research entertaining for both parents and kids. You blend pop culture, history, and modern trends into accessible, engaging content. Your writing is like talking to a cool older sibling.'
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

    // Clean up any code block markers
    content = content
      .replace(/^```html\n*/gi, '')
      .replace(/\n*```$/g, '')
      .trim();

    const nameCount = (content.match(/<strong>[A-Z][a-z]+<\/strong>/g) || []).length;
    const wordCount = content.split(/\s+/).length;

    console.log(`\n✅ Rewrite complete!`);
    console.log(`   Names included: ${nameCount}`);
    console.log(`   Word count: ${wordCount} (was 2,850)`);
    console.log(`   Reading time: ${Math.ceil(wordCount / 250)} min (was 11 min)`);

    if (wordCount > 1800) {
      console.warn(`\n⚠️  Still a bit long at ${wordCount} words (target: 1,000-1,500)`);
    }

    // Update post with new content
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
    console.log(`\n✨ Post #2 reformatted successfully!`);
    console.log(`\n📱 View at: http://localhost:3000/babyname2/blog/${post.slug}`);
    console.log(`\n📝 Next: node upload-single-blog-post.js (if ready to publish)`);

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    if (error.response) {
      console.error('   API Error:', error.response.data);
    }
    process.exit(1);
  }
}

rewritePost2();
