/**
 * Rewrite Blog Post #1 - Narrative Storytelling Style
 * Names interlaced into flowing stories, not listed as definitions
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

// Select best names with complete data
const selectedNames = allNamesData.names
  .filter(n => n.meaning && n.meaning !== 'Unknown' && n.origin && n.origin !== 'Unknown')
  .slice(0, 150);

console.log(`✅ Selected ${selectedNames.length} names to weave into narrative`);

// Categorize by gender for reference
const femaleNames = selectedNames.filter(n => n.gender === 'female' || n.gender === 'f' || n.gender === 'F');
const maleNames = selectedNames.filter(n => n.gender === 'male' || n.gender === 'm' || n.gender === 'M');
const unisexNames = selectedNames.filter(n => n.gender === 'unisex' || (!n.gender || n.gender === ''));

console.log(`   Female: ${femaleNames.length}, Male: ${maleNames.length}, Unisex: ${unisexNames.length}`);

const prompt = `You are a master storyteller writing a blog post about baby names meaning light, sun, and stars.

CRITICAL REQUIREMENTS:
1. **INTERLACED NAMES**: Names must be woven into flowing stories from the SECOND SENTENCE onwards
2. **NO LISTS**: Never write "Name - Origin - Meaning" format or bulleted lists
3. **INTERCONNECTED STORIES**: Each paragraph flows into the next, building one cohesive narrative
4. **WELL SPREAD**: Distribute all ${selectedNames.length} names evenly throughout the ENTIRE post
5. **H1, H2, H3 HEADERS**: Use bold, SEO-optimized headers with keywords
6. **NO NUMBER MENTIONS**: Never state how many names are in the post

NAMES TO WEAVE INTO NARRATIVE:
${JSON.stringify(selectedNames.slice(0, 50), null, 2)}

[... and ${selectedNames.length - 50} more names including: ${selectedNames.slice(50, 60).map(n => n.name).join(', ')}...]

WRITING STYLE EXAMPLE:

❌ WRONG (Don't do this):
<p><strong>Aurora</strong> - Latin<br>Meaning: "dawn"</p>

✅ CORRECT (Do this):
<p>In the pre-dawn darkness of ancient Rome, priests watched for the first blush of light. They called her <strong>Aurora</strong>, the goddess who painted the sky in shades of rose and gold each morning. When modern parents choose Aurora for their daughter, they're invoking this timeless figure who transforms darkness into day. The name has surged in popularity, climbing steadily since celebrities like Princess Aurora of Disney fame brought it back into the cultural consciousness. It whispers of new beginnings, of hope emerging from shadow.</p>

STRUCTURE:

<h1>Baby Names That Shine: A Journey Through Light, Sun, and Stars</h1>

<h2>The Ancient Reverence for Light</h2>
[Introduction - 400 words weaving in 15-20 names naturally into cultural stories about Apollo, Ra, Surya, etc. Start mentioning names from SECOND SENTENCE]

<h2>Dawn Bringers: Names Born from First Light</h2>
[Cultural narrative about dawn across civilizations - 500 words with 25-30 names woven into stories about morning rituals, dawn goddesses, sunrise ceremonies]

<h2>Solar Names: Children of the Sun God</h2>
[Stories of sun worship from Egypt, Greece, Aztec, Norse cultures - 500 words with 25-30 names emerging from these traditions]

<h2>Stellar Names: Written Among the Stars</h2>
[Ancient stargazers, navigation, constellations, astrology - 500 words with 25-30 names from celestial mythology]

<h2>Moonlight and Twilight: Names of Gentle Radiance</h2>
[Stories of moon deities, night-time luminescence, soft light - 400 words with 20-25 names]

<h2>Modern Luminaries: Celebrity Names That Shine</h2>
[Contemporary examples - 300 words with 15-20 names, connect ancient to modern culture]

<h2>Choosing Your Child's Radiant Name</h2>
[Spiritual guidance section - 300 words with final 10-15 names woven in]

<h3>Frequently Asked Questions</h3>
[5 Q&As with names integrated into answers]

<h2>Conclusion: The Sacred Power of Naming</h2>
[Closing - 250 words, tie all threads together]

FORMATTING REQUIREMENTS:
- Use HTML: <h1>, <h2>, <h3>, <p>, <strong>Name</strong> (only first mention)
- Names appear as <strong>Name</strong> naturally within sentences
- Each paragraph: 3-5 sentences, flowing narrative
- Every paragraph should contain 2-4 names minimum (well spread)
- SEO keywords in headers: "baby names meaning light", "sun names", "star names"
- Mobile-optimized: short paragraphs, clear structure

TONE:
- Hypnotic, poetic, mesmerizing
- Cultural depth with specific mythology
- Modern references naturally woven in
- Spiritual and meaningful
- Never academic or clinical

Begin writing the complete blog post now. Include ALL ${selectedNames.length} names woven into the narrative.`;

async function rewriteNarrative() {
  try {
    console.log('\n🧠 Using GPT-4o to create fully narrative blog post...');
    console.log('   (This will take 3-4 minutes due to complexity)\n');

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: 'You are a master storyteller who weaves names into cultural narratives. You never list names with definitions - instead, names emerge naturally as characters in your stories. Your writing is hypnotic and each paragraph flows seamlessly into the next.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.85,
      max_tokens: 16000
    });

    let content = response.choices[0].message.content.trim();

    // Remove any markdown code blocks if present
    content = content
      .replace(/^```html\n*/i, '')
      .replace(/\n*```$/g, '')
      .trim();

    // Count name mentions
    const nameCount = (content.match(/<strong>[A-Z][a-z]+<\/strong>/g) || []).length;
    const wordCount = content.split(/\s+/).length;

    console.log(`\n✅ Narrative blog post complete!`);
    console.log(`   Names woven into narrative: ${nameCount}`);
    console.log(`   Word count: ~${wordCount} words`);
    console.log(`   Reading time: ${Math.ceil(wordCount / 250)} minutes`);

    if (nameCount < 140) {
      console.warn(`\n⚠️  Only ${nameCount} names found. May need to add more...`);
    }

    // Update post
    const postPath = path.join(__dirname, 'blog-posts-seo', 'post-1-light-sun-star-names.json');
    const post = JSON.parse(fs.readFileSync(postPath, 'utf-8'));

    const newTitle = "Baby Names That Shine: A Journey Through Light, Sun, and Stars";
    const newExcerpt = "From ancient sun gods to modern starlight, discover celestial baby names woven through stories of mythology, culture, and timeless tradition. A narrative journey through radiant names.";

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
        metaTitle: "Baby Names Meaning Light, Sun & Star - A Cultural Journey",
        metaDescription: "Discover celestial baby names woven through ancient mythology and modern culture. From Greek gods to today's rising stars - find your child's luminous name.",
        keywords: [
          "baby names meaning light",
          "sun baby names",
          "star baby names",
          "celestial baby names 2025",
          "luminous baby names",
          "mythological baby names",
          "spiritual baby names",
          "dawn names"
        ]
      }
    };

    fs.writeFileSync(postPath, JSON.stringify(updatedPost, null, 2));

    console.log(`\n💾 Saved narrative version!`);
    console.log(`   Title: "${newTitle}"`);
    console.log(`   Names interlaced: ${nameCount}`);
    console.log(`   Word count: ${updatedPost.stats.wordCount}`);

    console.log(`\n✨ Blog #1 rewritten with narrative storytelling!`);
    console.log(`\n📝 Next: node upload-single-blog-post.js`);

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    if (error.response) {
      console.error('   API Error:', error.response.data);
    }
    process.exit(1);
  }
}

rewriteNarrative();
