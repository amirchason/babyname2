/**
 * Rewrite Blog Post #1 - Final Approach
 * Format all 150 names as HTML, then use GPT-4 for intro/conclusion/SEO
 */

const OpenAI = require('openai');
const fs = require('fs');
const path = require('path');

require('dotenv').config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Load all light/sun/star names
const allNamesPath = path.join(__dirname, 'blog-posts-seo', 'all-light-sun-star-names.json');
const allNamesData = JSON.parse(fs.readFileSync(allNamesPath, 'utf-8'));

// Select 150 best names (with complete data)
const selectedNames = allNamesData.names
  .filter(n => n.meaning && n.meaning !== 'Unknown' && n.origin && n.origin !== 'Unknown')
  .slice(0, 150);

console.log(`✅ Selected ${selectedNames.length} names for blog post`);

// Categorize names
const femaleNames = selectedNames.filter(n => n.gender === 'female' || n.gender === 'f' || n.gender === 'F');
const maleNames = selectedNames.filter(n => n.gender === 'male' || n.gender === 'm' || n.gender === 'M');
const unisexNames = selectedNames.filter(n => n.gender === 'unisex' || (!n.gender || n.gender === ''));

console.log(`   Female: ${femaleNames.length}`);
console.log(`   Male: ${maleNames.length}`);
console.log(`   Unisex: ${unisexNames.length}`);

// Format names as HTML
function formatName(name) {
  // Simple pronunciation guess (can be improved)
  const pronunciation = name.name; // Placeholder

  return `<p><strong>${name.name}</strong> - ${name.origin}<br>Meaning: "${name.meaning}"<br>A beautiful name with ${name.origin} origins, perfect for parents seeking meaningful celestial names.</p>`;
}

// Build HTML sections
const lightGirlsHTML = femaleNames.slice(0, Math.floor(femaleNames.length / 2)).map(formatName).join('\n');
const lightBoysHTML = maleNames.slice(0, Math.floor(maleNames.length / 2)).map(formatName).join('\n');

const sunGirlsHTML = femaleNames.slice(Math.floor(femaleNames.length / 2), Math.floor(femaleNames.length * 0.75)).map(formatName).join('\n');
const sunBoysHTML = maleNames.slice(Math.floor(maleNames.length / 2), Math.floor(maleNames.length * 0.75)).map(formatName).join('\n');

const starGirlsHTML = femaleNames.slice(Math.floor(femaleNames.length * 0.75)).map(formatName).join('\n');
const starBoysHTML = maleNames.slice(Math.floor(maleNames.length * 0.75)).map(formatName).join('\n');

const unisexHTML = unisexNames.map(formatName).join('\n');

// Create structured HTML with all names
const namesHTML = `
<h2>Names Meaning Light</h2>

<h3>Girls' Names Meaning Light</h3>
${lightGirlsHTML}

<h3>Boys' Names Meaning Light</h3>
${lightBoysHTML}

<h2>Names Meaning Sun</h2>

<h3>Girls' Names Meaning Sun</h3>
${sunGirlsHTML}

<h3>Boys' Names Meaning Sun</h3>
${sunBoysHTML}

<h2>Names Meaning Star</h2>

<h3>Girls' Names Meaning Star</h3>
${starGirlsHTML}

<h3>Boys' Names Meaning Star</h3>
${starBoysHTML}

<h2>Unisex Celestial Names</h2>
${unisexHTML}
`;

console.log(`\n📝 Formatted ${selectedNames.length} names as HTML`);
console.log(`\n🧠 Using GPT-4 to write SEO-optimized introduction and conclusion...`);

const prompt = `You are an SEO expert baby name blogger. Write an engaging introduction and conclusion for this blog post about baby names meaning light, sun, and star.

The blog post already has ALL ${selectedNames.length} names formatted in the middle section. Your task is to write:

1. **Introduction** (300-400 words):
   - Why choose celestial names (light/sun/star themes)
   - Benefits and symbolism
   - Cultural significance
   - Include keywords: "baby names meaning light", "sun baby names", "star baby names", "celestial baby names 2025"
   - Max 3 sentences per paragraph
   - Engaging, parent-focused tone

2. **FAQ Section** (5-7 common questions):
   - What name means "bringer of light"?
   - Are light-themed names popular in 2025?
   - Cultural considerations
   - Celebrity examples
   - Pronunciation tips
   - Sibling name pairings

3. **Conclusion** (200-300 words):
   - Summary of the importance of celestial names
   - Call-to-action: Explore SoulSeed's database of 174,000+ names
   - Mention the Tinder-style swipe feature
   - Warm, inspiring closing

STYLE REQUIREMENTS:
- Mobile-first structure (short paragraphs)
- Natural keyword integration (not keyword-stuffed)
- Warm, professional tone
- Include specific name examples from the post
- SEO-optimized headers

OUTPUT FORMAT:
Return TWO sections separated by "---NAMES-GO-HERE---":

Section 1: Introduction HTML
---NAMES-GO-HERE---
Section 2: FAQ + Conclusion HTML

Use <h2> and <h3> for headers, <p> for paragraphs, <ul>/<li> for lists.

BEGIN WRITING:`;

async function generateIntroConclusion() {
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: 'You are an expert baby name SEO blogger who creates engaging, mobile-optimized content following Ahrefs best practices.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 3000
    });

    const content = response.choices[0].message.content.trim();

    // Split content
    const [introHTML, faqConclusionHTML] = content.split('---NAMES-GO-HERE---').map(s => s.trim());

    // Combine all sections
    const fullContent = `${introHTML}\n\n${namesHTML}\n\n${faqConclusionHTML}`;

    console.log(`\n✅ Generated introduction and conclusion!`);
    console.log(`   Total HTML length: ${fullContent.length} characters`);
    console.log(`   Word count: ~${fullContent.split(/\s+/).length} words`);

    // Load and update post
    const postPath = path.join(__dirname, 'blog-posts-seo', 'post-1-light-sun-star-names.json');
    const post = JSON.parse(fs.readFileSync(postPath, 'utf-8'));

    const updatedPost = {
      ...post,
      content: fullContent,
      updatedAt: Date.now(),
      stats: {
        wordCount: fullContent.split(/\s+/).length,
        readingTime: Math.ceil(fullContent.split(/\s+/).length / 250)
      }
    };

    // Save
    fs.writeFileSync(postPath, JSON.stringify(updatedPost, null, 2));

    console.log(`\n💾 Saved updated post with ${selectedNames.length} names!`);
    console.log(`   Word count: ${updatedPost.stats.wordCount}`);
    console.log(`   Reading time: ${updatedPost.stats.readingTime} min`);

    console.log(`\n✨ Blog post complete!`);
    console.log(`\n📝 Next step: node upload-single-blog-post.js`);

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  }
}

generateIntroConclusion();
