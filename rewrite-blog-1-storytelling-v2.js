/**
 * Rewrite Blog Post #1 - Storytelling Style v2
 * Pre-format all names, GPT-4 writes intro/conclusion with cultural depth
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

// Select best names
const selectedNames = allNamesData.names
  .filter(n => n.meaning && n.meaning !== 'Unknown' && n.origin && n.origin !== 'Unknown')
  .slice(0, 150);

console.log(`✅ Selected ${selectedNames.length} names`);

// Categorize by gender
const femaleNames = selectedNames.filter(n => n.gender === 'female' || n.gender === 'f' || n.gender === 'F');
const maleNames = selectedNames.filter(n => n.gender === 'male' || n.gender === 'm' || n.gender === 'M');
const unisexNames = selectedNames.filter(n => n.gender === 'unisex' || (!n.gender || n.gender === ''));

console.log(`   Female: ${femaleNames.length}, Male: ${maleNames.length}, Unisex: ${unisexNames.length}`);

// Format each name with storytelling flair
function formatName(name) {
  return `<p><strong>${name.name}</strong> — ${name.origin}<br>Meaning: "${name.meaning}"<br>This name carries the ancient wisdom of ${name.origin} culture, perfect for parents seeking names with celestial radiance.</p>`;
}

// Build HTML sections with all names
const lightGirlsHTML = femaleNames.slice(0, 15).map(formatName).join('\n');
const lightBoysHTML = maleNames.slice(0, 10).map(formatName).join('\n');

const sunGirlsHTML = femaleNames.slice(15, 30).map(formatName).join('\n');
const sunBoysHTML = maleNames.slice(10, 21).map(formatName).join('\n');

const starGirlsHTML = femaleNames.slice(30).map(formatName).join('\n');
const starBoysHTML = maleNames.slice(21).map(formatName).join('\n');
const unisexHTML = unisexNames.map(formatName).join('\n');

const namesHTML = `
<h2>Names That Carry Light</h2>

<h3>Girls' Names Meaning Light</h3>
${lightGirlsHTML}

<h3>Boys' Names Meaning Light</h3>
${lightBoysHTML}

<h2>Solar Names - Children of the Sun</h2>

<h3>Girls' Names Meaning Sun</h3>
${sunGirlsHTML}

<h3>Boys' Names Meaning Sun</h3>
${sunBoysHTML}

<h2>Star Names - Written in the Cosmos</h2>

<h3>Girls' Names Meaning Star</h3>
${starGirlsHTML}

<h3>Boys' Names Meaning Star</h3>
${starBoysHTML}

<h2>Unisex Celestial Names - Beyond Boundaries</h2>
${unisexHTML}
`;

console.log(`\n📝 Formatted all ${selectedNames.length} names as HTML`);
console.log(`\n🧠 Using GPT-4 to write hypnotic intro/conclusion...`);

const prompt = `You are a master storyteller writing about baby names. Your writing is HYPNOTIC, BEAUTIFUL, and takes readers on CULTURAL and SPIRITUAL JOURNEYS.

The blog post ALREADY HAS ALL THE NAMES formatted in the middle. Your task is to write:

**1. INTRODUCTION (400-500 words)**:
- Open with a captivating story about light worship in ancient civilizations
- Weave together stories: Greek Apollo, Egyptian Ra, Norse Sol, Hindu Surya
- Connect ancient reverence for light to modern parents naming their children
- Explore the spiritual significance - why light, sun, and stars transcend cultures
- Reference modern examples: celebrity baby names, contemporary spirituality movements
- Use sensory language, metaphors, poetic imagery
- **CRITICAL**: DO NOT mention how many names are in the post
- Keywords naturally woven: "baby names meaning light", "celestial baby names 2025", "sun baby names"
- End with transition: "Let's journey through these luminous names..."

**2. CULTURAL TRANSITIONS** (Place between name sections):

After "Names That Carry Light" section:
<p>As dawn breaks across cultures, we turn to the celestial body that has inspired worship, art, and naming traditions for millennia - the sun itself.</p>

After "Solar Names" section:
<p>When darkness falls and the sun retreats, humanity has always looked upward to the stars - those eternal guides that have steered ships, inspired poetry, and given us names that shimmer with cosmic wonder.</p>

After "Star Names" section:
<p>Some names transcend gender boundaries, just as light itself knows no division - shining equally for all who seek its warmth.</p>

**3. FAQ SECTION** (Storytelling style, 5 questions):

Format each Q&A as mini cultural stories with specific examples. Questions should cover:
- Why celestial names have timeless appeal (answer with mythology examples)
- How different cultures interpret light in names (Greek vs Hebrew vs Sanskrit journey)
- Celebrity examples of radiant names (real examples: Soleil Moon Frye, Stella McCartney, Sirius XM, etc.)
- 2025 naming trends for luminous names (weave data with storytelling)
- Spiritual guidance on choosing between light/sun/star names (wisdom from multiple traditions)

**4. CONCLUSION (300-350 words)**:
- Bring together all cultural threads - how light unifies human experience across time
- The spiritual power of naming: you're giving your child an ancient blessing
- Modern parents connecting to timeless wisdom
- **Call to action**: "At SoulSeed, we've gathered thousands of names from cultures around the world, each with its own story to tell. Our Tinder-style swipe feature makes discovering your baby's perfect name as magical as the name itself."
- Inspiring final paragraph about the journey of parenthood and naming
- Warm closing: "May your child's name shine as brightly as they will."

STYLE REQUIREMENTS:
- **Hypnotic prose**: Draw readers into a trance-like reading experience
- **Cultural depth**: Specific mythology, real historical references
- **Modern bridges**: Connect ancient to contemporary naturally
- **Short paragraphs**: 2-3 sentences max (mobile-first)
- **Poetic language**: Vivid imagery, metaphors, sensory details
- **NO NUMBERS**: Never mention "150 names" or count
- **SEO natural**: Keywords woven into storytelling

OUTPUT FORMAT:
Return THREE sections separated by markers:

<INTRODUCTION>
[Introduction HTML here]
</INTRODUCTION>

<TRANSITIONS>
[The 3 transition paragraphs as labeled above]
</TRANSITIONS>

<FAQ-CONCLUSION>
[FAQ section + Conclusion HTML here]
</FAQ-CONCLUSION>

Use HTML tags: <h2>, <h3>, <p>, <strong> only. No markdown.

BEGIN YOUR HYPNOTIC STORYTELLING NOW:`;

async function generateIntroConclusion() {
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: 'You are a master storyteller and cultural anthropologist. Your writing is hypnotic and poetic, weaving ancient mythology with modern relevance. You write about baby names as sacred choices connecting parents to millennia of human culture.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.85, // High creativity
      max_tokens: 4000
    });

    const content = response.choices[0].message.content.trim();

    // Extract sections
    const introMatch = content.match(/<INTRODUCTION>([\s\S]*?)<\/INTRODUCTION>/);
    const transitionsMatch = content.match(/<TRANSITIONS>([\s\S]*?)<\/TRANSITIONS>/);
    const faqConclusionMatch = content.match(/<FAQ-CONCLUSION>([\s\S]*?)<\/FAQ-CONCLUSION>/);

    if (!introMatch || !transitionsMatch || !faqConclusionMatch) {
      throw new Error('Could not parse GPT-4 response sections');
    }

    const introHTML = introMatch[1].trim();
    const transitions = transitionsMatch[1].trim();
    const faqConclusionHTML = faqConclusionMatch[1].trim();

    // Parse transitions
    const transitionLines = transitions.split('\n').filter(l => l.trim());
    const transition1 = transitionLines[0] || '<p>The sun rises...</p>';
    const transition2 = transitionLines[1] || '<p>Stars appear...</p>';
    const transition3 = transitionLines[2] || '<p>Beyond boundaries...</p>';

    // Assemble full content with all names
    const fullContent = `
${introHTML}

<h2>Names That Carry Light</h2>

<h3>Girls' Names Meaning Light</h3>
${lightGirlsHTML}

<h3>Boys' Names Meaning Light</h3>
${lightBoysHTML}

${transition1}

<h2>Solar Names - Children of the Sun</h2>

<h3>Girls' Names Meaning Sun</h3>
${sunGirlsHTML}

<h3>Boys' Names Meaning Sun</h3>
${sunBoysHTML}

${transition2}

<h2>Star Names - Written in the Cosmos</h2>

<h3>Girls' Names Meaning Star</h3>
${starGirlsHTML}

<h3>Boys' Names Meaning Star</h3>
${starBoysHTML}

${transition3}

<h2>Unisex Celestial Names - Beyond Boundaries</h2>
${unisexHTML}

${faqConclusionHTML}
`.trim();

    console.log(`\n✅ Generated hypnotic storytelling content!`);
    console.log(`   Total word count: ~${fullContent.split(/\s+/).length} words`);

    // Update post
    const postPath = path.join(__dirname, 'blog-posts-seo', 'post-1-light-sun-star-names.json');
    const post = JSON.parse(fs.readFileSync(postPath, 'utf-8'));

    const newTitle = "Baby Names That Shine: A Journey Through Light, Sun, and Stars";
    const newExcerpt = "From ancient sun gods to modern starlight, explore celestial baby names that carry the radiance of cultures across time. A storytelling journey through luminous names for your little one.";

    const updatedPost = {
      ...post,
      title: newTitle,
      excerpt: newExcerpt,
      content: fullContent,
      updatedAt: Date.now(),
      stats: {
        wordCount: fullContent.split(/\s+/).length,
        readingTime: Math.ceil(fullContent.split(/\s+/).length / 250)
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

    fs.writeFileSync(postPath, JSON.stringify(updatedPost, null, 2));

    console.log(`\n💾 Saved storytelling version with ALL ${selectedNames.length} names!`);
    console.log(`   New title: "${newTitle}"`);
    console.log(`   Word count: ${updatedPost.stats.wordCount}`);
    console.log(`   Reading time: ${updatedPost.stats.readingTime} min`);

    console.log(`\n✨ Blog post #1 complete with hypnotic storytelling!`);
    console.log(`\n📝 Next: node upload-single-blog-post.js`);

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    if (error.response) {
      console.error('   API Error:', error.response.data);
    }
    process.exit(1);
  }
}

generateIntroConclusion();
