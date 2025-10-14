/**
 * Rewrite Blog Post #1 - Storytelling Style
 * Cultural journeys, spiritual depth, hypnotic prose
 * NO NUMBER MENTIONS in title or content
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

// Select best names (with complete data)
const selectedNames = allNamesData.names
  .filter(n => n.meaning && n.meaning !== 'Unknown' && n.origin && n.origin !== 'Unknown')
  .slice(0, 150);

console.log(`✅ Selected ${selectedNames.length} names with complete data`);

// Categorize by gender
const femaleNames = selectedNames.filter(n => n.gender === 'female' || n.gender === 'f' || n.gender === 'F');
const maleNames = selectedNames.filter(n => n.gender === 'male' || n.gender === 'm' || n.gender === 'M');
const unisexNames = selectedNames.filter(n => n.gender === 'unisex' || (!n.gender || n.gender === ''));

console.log(`   Female: ${femaleNames.length}, Male: ${maleNames.length}, Unisex: ${unisexNames.length}`);

const prompt = `You are a master storyteller and cultural anthropologist writing about baby names. Your writing is hypnotic, beautiful, and takes readers on spiritual and cultural journeys through time.

MISSION: Rewrite this blog post about baby names meaning light, sun, and star with NARRATIVE STORYTELLING style.

YOUR WRITING STYLE:
- **Hypnotic & Beautiful**: Every paragraph should draw readers deeper into the story
- **Cultural Journeys**: Connect ancient mythology, folklore, and spiritual traditions to modern culture
- **Interlacing Stories**: Weave together multiple cultural narratives seamlessly
- **Modern Relevance**: Reference contemporary celebrities, pop culture, trends naturally
- **Spiritual Depth**: Explore the energy, symbolism, and deeper meaning behind names
- **NO NUMBERS**: Never mention "150 names" or count names in the text
- **Short Paragraphs**: Max 2-3 sentences per paragraph for mobile readers
- **Poetic Flow**: Use vivid imagery, metaphors, and sensory language

NAMES TO FEATURE (All ${selectedNames.length} of them):
${JSON.stringify(selectedNames, null, 2)}

STRUCTURE (NO NUMERIC HEADERS):

**Introduction (250-300 words)**:
- Open with a captivating story about light in ancient cultures
- Connect to modern parents' desire to give children radiant names
- Explore the spiritual significance of celestial naming traditions
- NO mention of "how many names" are in the post

**Section: Names That Carry Light**
- Girls' names section: Tell stories of goddesses, saints, and modern icons who embodied light
- Boys' names section: Weave tales of warriors, scholars, and heroes associated with illumination
- For each name, format as: <strong>Name</strong> (pronunciation) - Origin
  Then write 2-3 sentences of narrative: cultural backstory, mythology, modern usage, celebrity references

**Section: Solar Names - Children of the Sun**
- Open with mythology of sun worship across cultures (Egyptian Ra, Greek Apollo, Aztec Tonatiuh)
- Girls' names: Stories of sun goddesses and dawn bringers
- Boys' names: Solar deities and daybreak heroes
- Connect to modern solar symbolism (renewable energy movement, new beginnings)

**Section: Star Names - Written in the Cosmos**
- Begin with ancient stargazers and celestial navigation stories
- Girls' names: Stories of constellations, star goddesses, night sky wonder
- Boys' names: Astronomers, stargazers, cosmic mythology
- Modern references: Space exploration, NASA missions, celebrity children with star names

**Section: Unisex Celestial Names - Beyond Boundaries**
- Explore how light transcends gender in many spiritual traditions
- Feature unisex names with cultural stories
- Connect to modern gender-neutral naming trends

**FAQ Section (Storytelling Style)**:
Q: What gives celestial names their timeless appeal?
A: [Answer as a mini-story with cultural examples]

Q: How do different cultures interpret names meaning light?
A: [Journey through Greek, Latin, Hebrew, Sanskrit traditions]

Q: Which celebrities have chosen radiant names for their children?
A: [Real celebrity examples with context]

Q: Are luminous names popular in 2025?
A: [Trend analysis as narrative]

Q: How do I choose between a light, sun, or star name?
A: [Spiritual guidance with cultural wisdom]

**Conclusion (200-250 words)**:
- Bring all the cultural threads together
- Emphasize the spiritual power of naming
- Call to action: "Explore thousands more names at SoulSeed - Where your baby name blooms"
- Mention the Tinder-style swipe feature naturally
- Warm, inspiring closing about the journey of parenthood

CRITICAL FORMATTING:
- Use HTML tags: <h2>, <h3>, <p>, <strong>Name</strong> (for first mention only)
- Name format: <strong>Name</strong> (pronunciation) - Origin<br>Cultural story and meaning (2-3 sentences)
- NO <ul> lists - keep everything as flowing narrative paragraphs
- Mobile-first: Short paragraphs, clear headers
- SEO keywords naturally woven: "baby names meaning light", "sun names", "star names", "celestial baby names 2025"

OUTPUT: Pure HTML content (no markdown, no code blocks). Ready to insert into blog post JSON.

BEGIN YOUR HYPNOTIC STORYTELLING NOW:`;

async function rewritePost() {
  try {
    console.log('\n🧠 Using GPT-4 to rewrite with storytelling style...');
    console.log('   (This will take 2-3 minutes for deep cultural narrative)');

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: 'You are a master storyteller and cultural anthropologist. Your writing is hypnotic, poetic, and weaves together ancient wisdom with modern relevance. You write about baby names as sacred choices that connect parents to thousands of years of human culture and spirituality.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.8, // Higher for more creative storytelling
      max_tokens: 16000
    });

    const newContent = response.choices[0].message.content.trim();

    // Remove any markdown code blocks if present
    const cleanContent = newContent
      .replace(/^```html\n+/i, '')
      .replace(/\n*```$/g, '')
      .trim();

    // Validate name mentions
    const nameCount = (cleanContent.match(/<strong>[A-Z][a-z]+<\/strong>/g) || []).length;

    console.log(`\n✅ GPT-4 completed storytelling rewrite!`);
    console.log(`   Names mentioned: ${nameCount}`);
    console.log(`   Word count: ~${cleanContent.split(/\s+/).length} words`);

    if (nameCount < 140) {
      console.warn(`\n⚠️  WARNING: Only ${nameCount} names found, expected ~${selectedNames.length}`);
    }

    // Update post
    const postPath = path.join(__dirname, 'blog-posts-seo', 'post-1-light-sun-star-names.json');
    const post = JSON.parse(fs.readFileSync(postPath, 'utf-8'));

    // New title (no numbers!)
    const newTitle = "Baby Names That Shine: A Journey Through Light, Sun, and Stars";
    const newExcerpt = "From ancient sun gods to modern starlight, explore celestial baby names that carry the radiance of cultures across time. A storytelling journey through luminous names for your little one.";

    const updatedPost = {
      ...post,
      title: newTitle,
      excerpt: newExcerpt,
      content: cleanContent,
      updatedAt: Date.now(),
      stats: {
        wordCount: cleanContent.split(/\s+/).length,
        readingTime: Math.ceil(cleanContent.split(/\s+/).length / 250)
      },
      seo: {
        ...post.seo,
        metaTitle: "Baby Names Meaning Light, Sun & Star - Cultural Journey 2025",
        metaDescription: "Discover celestial baby names through ancient mythology, cultural stories, and modern relevance. From Greek goddesses to modern icons - find your baby's radiant name.",
        keywords: [
          "baby names meaning light",
          "sun baby names",
          "star baby names",
          "celestial baby names 2025",
          "luminous baby names",
          "radiant baby names",
          "spiritual baby names",
          "mythological baby names"
        ]
      }
    };

    // Save
    fs.writeFileSync(postPath, JSON.stringify(updatedPost, null, 2));

    console.log(`\n💾 Saved storytelling version!`);
    console.log(`   New title: "${newTitle}"`);
    console.log(`   Word count: ${updatedPost.stats.wordCount}`);
    console.log(`   Reading time: ${updatedPost.stats.readingTime} min`);

    console.log(`\n✨ Blog post #1 rewritten with hypnotic storytelling style!`);
    console.log(`\n📝 Next step: node upload-single-blog-post.js`);

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    if (error.response) {
      console.error('   API Error:', error.response.data);
    }
    process.exit(1);
  }
}

rewritePost();
