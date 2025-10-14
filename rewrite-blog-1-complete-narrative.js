/**
 * Rewrite Blog Post #1 - Complete Narrative with ALL 150 names
 * Multiple passes to ensure every name is woven into flowing stories
 */

const OpenAI = require('openai');
const fs = require('fs');
const path = require('path');

require('dotenv').config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Load names
const allNamesPath = path.join(__dirname, 'blog-posts-seo', 'all-light-sun-star-names.json');
const allNamesData = JSON.parse(fs.readFileSync(allNamesPath, 'utf-8'));

const selectedNames = allNamesData.names
  .filter(n => n.meaning && n.meaning !== 'Unknown' && n.origin && n.origin !== 'Unknown')
  .slice(0, 150);

console.log(`✅ Selected ${selectedNames.length} names to weave into narrative`);

// Split into manageable chunks for GPT-4
const sections = [
  {
    title: "Introduction: The Ancient Reverence for Light",
    names: selectedNames.slice(0, 25),
    wordCount: 500
  },
  {
    title: "Dawn Bringers: Names Born from First Light",
    names: selectedNames.slice(25, 50),
    wordCount: 500
  },
  {
    title: "Solar Names: Children of the Sun God",
    names: selectedNames.slice(50, 75),
    wordCount: 500
  },
  {
    title: "Stellar Names: Written Among the Stars",
    names: selectedNames.slice(75, 100),
    wordCount: 500
  },
  {
    title: "Moonlight and Twilight: Names of Gentle Radiance",
    names: selectedNames.slice(100, 125),
    wordCount: 400
  },
  {
    title: "Modern Luminaries & Choosing Your Name",
    names: selectedNames.slice(125, 150),
    wordCount: 400
  }
];

async function writeSectionNarrative(section, isFirst = false, isLast = false) {
  const namesList = section.names.map(n => `${n.name} (${n.origin}: ${n.meaning})`).join(', ');

  const prompt = `Write a ${section.wordCount}-word narrative section for a blog post about baby names meaning light/sun/stars.

SECTION: ${section.title}

CRITICAL: You MUST weave ALL ${section.names.length} of these names into flowing stories:
${namesList}

STYLE REQUIREMENTS:
- Names interlaced into cultural stories (NOT listed as "Name - meaning")
- Each paragraph contains 3-5 names woven naturally
- Interconnected stories that flow paragraph to paragraph
- Hypnotic, poetic prose
- Examples: mythology, cultural rituals, historical figures
- Modern connections to celebrities, trends

${isFirst ? 'START with <h1>Baby Names That Shine: A Journey Through Light, Sun, and Stars</h1>\n' : ''}

FORMAT:
<h2>${section.title}</h2>
[3-5 paragraphs, each weaving 5-8 names into cultural narratives]

EXAMPLE STYLE:
"In the pre-dawn darkness of ancient Rome, priests watched for <strong>Aurora</strong>, the goddess who painted the sky. When parents today choose Aurora for their daughter, they invoke this timeless figure. The name surged after Princess Aurora of Disney brought it back into consciousness. Nearby, <strong>Lucia</strong> emerged from Latin traditions, meaning bringer of light. Saint Lucia's feast on December 13th celebrates light triumphing over darkness. Modern parents like John Legend chose <strong>Luna</strong> for his daughter, connecting to the moon's gentle radiance..."

Write the section now with ALL ${section.names.length} names integrated:`;

  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      {
        role: 'system',
        content: 'You are a master storyteller who weaves names into cultural narratives. Names emerge naturally from mythological stories, not as definitions. Your writing is hypnotic and mesmerizing.'
      },
      {
        role: 'user',
        content: prompt
      }
    ],
    temperature: 0.85,
    max_tokens: 2000
  });

  return response.choices[0].message.content.trim();
}

async function writeConclusion() {
  const prompt = `Write a conclusion section for a blog post about baby names meaning light/sun/stars.

SECTIONS TO WRITE:

<h3>Frequently Asked Questions</h3>
[5 Q&As about celestial names, with 2-3 specific name examples woven into each answer]

<h2>Conclusion: The Sacred Power of Naming</h2>
[300 words tying all cultural threads together, emphasizing spiritual power of naming, call to action for SoulSeed app with Tinder-style swipe feature, warm inspiring close]

Write both sections now:`;

  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      {
        role: 'system',
        content: 'You are a master storyteller concluding a hypnotic journey through celestial baby names.'
      },
      {
        role: 'user',
        content: prompt
      }
    ],
    temperature: 0.85,
    max_tokens: 1500
  });

  return response.choices[0].message.content.trim();
}

async function assembleFullPost() {
  try {
    console.log('\n🧠 Writing narrative blog post in sections...\n');

    const sectionContents = [];

    for (let i = 0; i < sections.length; i++) {
      const section = sections[i];
      console.log(`   [${i + 1}/${sections.length}] Writing: ${section.title} (${section.names.length} names)...`);

      const content = await writeSectionNarrative(section, i === 0, i === sections.length - 1);
      sectionContents.push(content);

      // Small delay to avoid rate limits
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    console.log(`   [7/7] Writing conclusion & FAQ...`);
    const conclusion = await writeConclusion();

    // Assemble full content
    const fullContent = sectionContents.join('\n\n') + '\n\n' + conclusion;

    // Clean up any markdown
    const cleanContent = fullContent
      .replace(/^```html\n*/gi, '')
      .replace(/\n*```$/g, '')
      .trim();

    // Count names
    const nameCount = (cleanContent.match(/<strong>[A-Z][a-z]+<\/strong>/g) || []).length;
    const wordCount = cleanContent.split(/\s+/).length;

    console.log(`\n✅ Full narrative blog post complete!`);
    console.log(`   Names woven into stories: ${nameCount}`);
    console.log(`   Word count: ~${wordCount}`);
    console.log(`   Reading time: ${Math.ceil(wordCount / 250)} min`);

    if (nameCount < 140) {
      console.warn(`\n⚠️  Only ${nameCount} names included (expected 150)`);
    }

    // Save
    const postPath = path.join(__dirname, 'blog-posts-seo', 'post-1-light-sun-star-names.json');
    const post = JSON.parse(fs.readFileSync(postPath, 'utf-8'));

    const newTitle = "Baby Names That Shine: A Journey Through Light, Sun, and Stars";
    const newExcerpt = "Discover celestial baby names woven through ancient mythology, cultural rituals, and modern storytelling. A hypnotic journey through luminous names from cultures across time.";

    const updatedPost = {
      ...post,
      title: newTitle,
      excerpt: newExcerpt,
      content: cleanContent,
      updatedAt: Date.now(),
      stats: {
        wordCount: wordCount,
        readingTime: Math.ceil(wordCount / 250)
      },
      seo: {
        ...post.seo,
        metaTitle: "Baby Names Meaning Light, Sun & Star - Cultural Journey",
        metaDescription: "Discover celestial baby names woven through ancient mythology and modern culture. From Greek goddesses to contemporary stars - find your child's radiant name.",
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

    console.log(`\n💾 Saved complete narrative version!`);
    console.log(`   Title: "${newTitle}"`);
    console.log(`   Names interlaced: ${nameCount} / 150`);

    console.log(`\n✨ Blog #1 complete with full narrative!`);
    console.log(`\n📝 Next: node upload-single-blog-post.js`);

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    if (error.response) {
      console.error('   API Error:', error.response.data);
    }
    process.exit(1);
  }
}

assembleFullPost();
