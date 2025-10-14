/**
 * Rewrite Blog Post #1 with GPT-4
 * Ensures accuracy (exactly 150 names), SEO optimization, and all names in database
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

// Load enriched blog names (our 532 names that are now in database)
const enrichedPath = path.join(__dirname, 'blog-posts-seo', 'enriched-blog-names.json');
const enrichedData = JSON.parse(fs.readFileSync(enrichedPath, 'utf-8'));
const enrichedNames = enrichedData.enriched_names;

// Filter names by meaning (light, sun, star themes)
const lightSunStarNames = enrichedNames.filter(name => {
  const meaning = (name.meaning || '').toLowerCase();
  const origin = (name.origin || '').toLowerCase();

  return meaning.includes('light') ||
         meaning.includes('sun') ||
         meaning.includes('star') ||
         meaning.includes('bright') ||
         meaning.includes('shine') ||
         meaning.includes('radiant') ||
         meaning.includes('glow') ||
         meaning.includes('luminous') ||
         meaning.includes('celestial');
});

console.log(`📊 Found ${lightSunStarNames.length} names related to light, sun, and star themes`);
console.log(`   Female: ${lightSunStarNames.filter(n => n.gender === 'female' || n.gender === 'f').length}`);
console.log(`   Male: ${lightSunStarNames.filter(n => n.gender === 'male' || n.gender === 'm').length}`);
console.log(`   Unisex: ${lightSunStarNames.filter(n => n.gender === 'unisex').length}`);

// Prepare name data for GPT-4
const namesList = lightSunStarNames
  .slice(0, 150) // Take first 150 names
  .map(n => ({
    name: n.name,
    gender: n.gender,
    origin: n.origin,
    meaning: n.meaning
  }));

console.log(`\n🚀 Rewriting blog post with GPT-4 to include exactly ${namesList.length} names...`);

const prompt = `You are a professional baby name blogger and SEO expert. Rewrite this blog post to be EXACTLY 150 names about light, sun, and star baby names.

CURRENT POST TITLE: "${post.title}"
CURRENT EXCERPT: "${post.excerpt}"

NAMES TO INCLUDE (EXACTLY 150):
${JSON.stringify(namesList, null, 2)}

CRITICAL REQUIREMENTS:
1. **Accuracy**: Include EXACTLY 150 names from the provided list (no more, no less)
2. **Name Format**: Format each name as: <strong>Name</strong> (the BlogPostPage component will auto-add heart buttons)
3. **SEO Optimization**:
   - Use bold <h2> and <h3> headers with keywords like "baby names that mean light", "sun names", "star names"
   - Max 3 sentences per paragraph
   - Mobile-first content structure
   - Include semantic keywords naturally
4. **Organization**:
   - Group by theme: "Names Meaning Light" (boys/girls), "Names Meaning Sun" (boys/girls), "Names Meaning Star" (boys/girls)
   - Include name pronunciation, origin, and meaning for each
   - Add 2-3 sentences of context per name
5. **Content Structure**:
   - Introduction (why choose light/sun/star names)
   - Main sections with H2 headers
   - Subsections with H3 headers
   - FAQ section with common questions
   - Conclusion with call-to-action
6. **Style**:
   - Engaging, informative, parent-focused
   - Include cultural context and celebrity examples where relevant
   - Professional yet warm tone

OUTPUT FORMAT:
Return ONLY valid HTML content (no markdown, no code blocks). The HTML should be ready to insert into the "content" field of the blog post JSON.

Use this structure:
- <h2> for main sections
- <h3> for subsections
- <p> for paragraphs (max 3 sentences each)
- <strong>Name</strong> for name mentions (first mention of each name will automatically get a heart button)
- <ul> and <li> for lists
- No <article> wrapper (just the content)

Example name format:
<p><strong>Lucia</strong> (loo-CHEE-ah) - Latin<br>Meaning: "light"<br>This classic name has been beloved for centuries and ranks consistently in the top 200. Saint Lucia is celebrated on December 13th with festivals of light across Scandinavia. Nicknames: Lucy, Lu, Lulu.</p>

BEGIN REWRITING NOW:`;

async function rewritePost() {
  try {
    console.log('\n🧠 Using GPT-4 to rewrite the post...');
    console.log('   (This may take 1-2 minutes due to the length)\n');

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: 'You are an expert baby name blogger who creates SEO-optimized, accurate, and engaging content. You follow Ahrefs SEO best practices and write for mobile-first audiences.'
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
      console.warn(`\n⚠️  WARNING: Only ${nameCount} names found, expected 150`);
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
