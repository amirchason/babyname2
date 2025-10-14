/**
 * Rewrite Blog Post #1 with GPT-4 (v2)
 * Uses 150 names from the full database light/sun/star collection
 */

const OpenAI = require('openai');
const fs = require('fs');
const path = require('path');

require('dotenv').config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Load blog post
const postPath = path.join(__dirname, 'blog-posts-seo', 'post-1-light-sun-star-names.json');
const post = JSON.parse(fs.readFileSync(postPath, 'utf-8'));

// Load all light/sun/star names from database
const allNamesPath = path.join(__dirname, 'blog-posts-seo', 'all-light-sun-star-names.json');
const allNamesData = JSON.parse(fs.readFileSync(allNamesPath, 'utf-8'));
const allNames = allNamesData.names;

console.log(`📊 Loaded ${allNames.length} light/sun/star names from database`);
console.log(`   Female: ${allNamesData.female}`);
console.log(`   Male: ${allNamesData.male}`);
console.log(`   Unisex: ${allNamesData.unisex}`);

// Select best 150 names (prioritize those with clear meanings)
const selectedNames = allNames
  .filter(n => n.meaning && n.meaning !== 'Unknown' && n.origin && n.origin !== 'Unknown')
  .slice(0, 150);

console.log(`\n✅ Selected ${selectedNames.length} names with complete data`);

console.log(`\n🚀 Rewriting blog post with GPT-4 to include exactly ${selectedNames.length} names...`);

const prompt = `You are a professional baby name blogger and SEO expert. Rewrite this blog post to include EXACTLY ${selectedNames.length} baby names about light, sun, and star themes.

CURRENT POST TITLE: "${post.title}"
CURRENT EXCERPT: "${post.excerpt}"

NAMES TO INCLUDE (ALL ${selectedNames.length} OF THEM):
${JSON.stringify(selectedNames, null, 2)}

CRITICAL REQUIREMENTS:
1. **Accuracy**: Include EXACTLY ${selectedNames.length} names from the provided list (no more, no less)
2. **Name Format**: Format each featured name as: <strong>Name</strong> (BlogPostPage will auto-add heart buttons on first mention)
3. **SEO Optimization**:
   - Use bold <h2> and <h3> headers with keywords: "baby names meaning light", "sun names", "star names", "celestial names 2025"
   - Max 3 sentences per paragraph for mobile readability
   - Mobile-first content structure
   - Natural keyword integration
4. **Organization**:
   - Group by theme: "Names Meaning Light", "Names Meaning Sun", "Names Meaning Star"
   - Subdivide by gender: Girls' Names, Boys' Names, Unisex Names
   - For each name, include: pronunciation guide, origin, meaning, 2-3 sentences of context
5. **Content Structure**:
   - Introduction paragraph (why choose light/sun/star names)
   - Main sections with <h2> headers
   - Subsections with <h3> headers
   - FAQ section addressing common questions
   - Conclusion with call-to-action to explore SoulSeed app
6. **Style**:
   - Engaging, parent-focused, warm yet professional
   - Include cultural context and historical significance
   - Mention celebrity names where relevant
   - Show diversity of origins (Greek, Latin, Hebrew, Sanskrit, etc.)

OUTPUT FORMAT:
Return ONLY valid HTML content (no markdown, no code blocks). The HTML should be ready to insert into the "content" field of the blog post JSON.

HTML Structure:
- <h2> for main sections
- <h3> for subsections
- <p> for paragraphs (max 3 sentences each)
- <strong>Name</strong> for name mentions
- <ul> and <li> for lists
- No <article> wrapper

Example name entry:
<p><strong>Lucia</strong> (loo-CHEE-ah) - Latin<br>Meaning: "light"<br>This classic name has been beloved for centuries and ranks consistently in the top 200. Saint Lucia is celebrated on December 13th with festivals of light across Scandinavia. Nicknames: Lucy, Lu, Lulu.</p>

IMPORTANT SEO GUIDELINES (Ahrefs Best Practices):
- H2/H3 headers MUST contain target keywords
- First paragraph should include "baby names meaning light, sun, and star"
- Include long-tail keywords: "celestial baby names 2025", "radiant baby names", "star baby names for girls"
- Internal linking opportunities: "Explore our database of 174,000+ names at SoulSeed"
- FAQ section for rich snippets
- Natural, conversational tone (not keyword-stuffed)

BEGIN REWRITING NOW:`;

async function rewritePost() {
  try {
    console.log('\n🧠 Using GPT-4 to rewrite the post...');
    console.log('   (This may take 2-3 minutes due to the length)\n');

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: 'You are an expert baby name blogger who creates SEO-optimized, accurate, and engaging content following Ahrefs best practices. You write for mobile-first audiences with clear structure and natural keyword integration.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7, // Balanced creativity and accuracy
      max_tokens: 16000 // Large content
    });

    const newContent = response.choices[0].message.content.trim();

    // Validate that content includes names
    const nameCount = (newContent.match(/<strong>[A-Z][a-z]+<\/strong>/g) || []).length;

    console.log(`\n✅ GPT-4 completed rewrite!`);
    console.log(`   Names mentioned: ${nameCount}`);
    console.log(`   Word count: ~${newContent.split(/\s+/).length} words`);

    if (nameCount < 140) {
      console.warn(`\n⚠️  WARNING: Only ${nameCount} names found, expected ~${selectedNames.length}`);
    }

    // Update post data
    const updatedPost = {
      ...post,
      content: newContent,
      updatedAt: Date.now(),
      stats: {
        wordCount: newContent.split(/\s+/).length,
        readingTime: Math.ceil(newContent.split(/\s+/).length / 250) // Average reading speed
      }
    };

    // Save updated post
    fs.writeFileSync(postPath, JSON.stringify(updatedPost, null, 2));

    console.log(`\n💾 Saved updated post to: ${postPath}`);
    console.log(`   Updated "updatedAt" timestamp`);
    console.log(`   Updated word count: ${updatedPost.stats.wordCount}`);
    console.log(`   Updated reading time: ${updatedPost.stats.readingTime} min`);

    console.log(`\n✨ Blog post rewrite complete!`);
    console.log(`\n📝 Next steps:`);
    console.log(`   1. Review the rewritten post in the JSON file`);
    console.log(`   2. Upload to Firestore: node upload-single-blog-post.js`);
    console.log(`   3. View at: http://localhost:3000/babyname2/blog/${post.slug}`);

  } catch (error) {
    console.error('\n❌ Error rewriting post:', error.message);
    if (error.response) {
      console.error('   API Error:', error.response.data);
    }
    process.exit(1);
  }
}

rewritePost();
