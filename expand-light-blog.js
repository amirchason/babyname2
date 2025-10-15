/**
 * EXPAND LIGHT/SUN/STAR BLOG TO 35+ NAMES
 *
 * This blog currently has only 24 names. We need to add 11+ more to reach the 35 target.
 */

require('dotenv').config();
const { initializeApp } = require('firebase/app');
const { getFirestore, doc, getDoc, updateDoc } = require('firebase/firestore');
const OpenAI = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const firebaseConfig = {
  apiKey: process.env.REACT_APP_GOOGLE_API_KEY,
  authDomain: "babynames-app-9fa2a.firebaseapp.com",
  projectId: "babynames-app-9fa2a",
  storageBucket: "babynames-app-9fa2a.firebasestorage.app",
  messagingSenderId: "945851717815",
  appId: "1:945851717815:web:7c4b36d71d3d3e4e2f5b8e"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Additional names to suggest (researched from web search)
const ADDITIONAL_LIGHT_NAMES = [
  { name: 'Nora', origin: 'Irish', gender: 'F', meaning: 'light, honor' },
  { name: 'Chiara', origin: 'Italian', gender: 'F', meaning: 'light, clear, bright' },
  { name: 'Kira', origin: 'Russian', gender: 'F', meaning: 'leader, light' },
  { name: 'Sterling', origin: 'English', gender: 'M', meaning: 'little star, of highest quality' },
  { name: 'Sirius', origin: 'Latin', gender: 'M', meaning: 'brightest star, burning' },
  { name: 'Lior', origin: 'Hebrew', gender: 'U', meaning: 'light for me' },
  { name: 'Lucero', origin: 'Spanish', gender: 'U', meaning: 'bright star, morning star' },
  { name: 'Dawn', origin: 'English', gender: 'F', meaning: 'first appearance of light' },
  { name: 'Zain', origin: 'Arabic', gender: 'M', meaning: 'beauty, light' },
  { name: 'Liora', origin: 'Hebrew', gender: 'F', meaning: 'my light' },
  { name: 'Orion', origin: 'Greek', gender: 'M', meaning: 'rising in the sky, dawning' },
  { name: 'Phoebe', origin: 'Greek', gender: 'F', meaning: 'bright, radiant, prophetic' },
  { name: 'Astra', origin: 'Greek', gender: 'F', meaning: 'star' },
  { name: 'Bodhi', origin: 'Sanskrit', gender: 'U', meaning: 'enlightenment, awakening' },
];

function extractNames(html) {
  const names = [];
  const strongRegex = /<strong>(?:\d+\.\s+)?([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)<\/strong>/g;
  let match;

  while ((match = strongRegex.exec(html)) !== null) {
    const name = match[1].trim();
    if (name && !names.includes(name)) {
      names.push(name);
    }
  }

  return names;
}

function updateStats(content) {
  const text = content.replace(/<[^>]+>/g, ' ');
  const wordCount = text.split(/\s+/).filter(w => w.length > 0).length;
  const readingTime = Math.max(1, Math.ceil(wordCount / 200));

  return { wordCount, readingTime };
}

async function expandLightBlog() {
  console.log('🌟 Expanding Light/Sun/Star Blog to 35+ Names\n');

  try {
    // Get blog from Firestore
    const slug = 'baby-names-mean-light-sun-star-2025';
    const blogRef = doc(db, 'blogs', slug);
    const blogSnap = await getDoc(blogRef);

    if (!blogSnap.exists()) {
      throw new Error(`Blog not found: ${slug}`);
    }

    const blogData = blogSnap.data();
    console.log(`✅ Loaded blog: ${blogData.title}`);

    const currentNames = extractNames(blogData.content);
    console.log(`   Current names: ${currentNames.length}`);
    console.log(`   Target: 35+ names`);
    console.log(`   Need to add: ${35 - currentNames.length}+ names\n`);

    // Create name list for prompt
    const additionalNameList = ADDITIONAL_LIGHT_NAMES.map(n =>
      `${n.name} (${n.origin}, ${n.gender}) - ${n.meaning}`
    ).join('\n');

    const currentContent = blogData.content.replace('<!-- BLOG_NAME_LIST_COMPONENT -->', '').trim();

    const prompt = `You are Dr. Amara Okonkwo, PhD in Linguistics and Cultural Name Studies, writing for SoulSeed baby name app. Your writing is witty, fluid, conversational, engaging, humorous, and culturally rich.

CURRENT BLOG:
Title: ${blogData.title}
Current Content:
${currentContent}

CURRENT NAMES (${currentNames.length}): ${currentNames.join(', ')}

YOUR MISSION: Add 11+ NEW NAMES to reach 35+ TOTAL NAMES while maintaining the engaging, witty tone.

ADDITIONAL NAMES TO ADD (include ALL of these):
${additionalNameList}

CRITICAL INSTRUCTIONS:
1. **KEEP ALL ${currentNames.length} EXISTING NAMES** - integrate them naturally
2. **ADD ALL ${ADDITIONAL_LIGHT_NAMES.length} NEW NAMES** from the list above
3. **MINIMUM FINAL COUNT: 35+ TOTAL NAMES**
4. **Format EVERY name** as: <strong>NameHere</strong> (Origin, Gender, means "meaning"): Engaging 2-3 sentence description with cultural context, pop culture refs, humor

WRITING STYLE:
- Witty, conversational, fun (think: smart friend giving advice)
- Use emoji ✨ ☀️ 🌟 💫 ⭐ throughout
- Pop culture references (celebrities, movies, TikTok trends)
- Historical/cultural context
- Pronunciation tips for difficult names
- Modern, fresh 2025 tone

STRUCTURE:
- **Engaging Introduction** (2-3 paragraphs)
- **Organized Sections** with creative headers:
  * "Bright Baby Girl Names"
  * "Luminous Boy Names"
  * "Gender-Neutral Star Names"
  * "Names from Around the World"
- **Each name entry**: <strong>Name</strong> (Origin, Gender, means "meaning"): Description
- **Inspiring Conclusion** with actionable takeaway
- **End with**: <!-- BLOG_NAME_LIST_COMPONENT --> on new line

FORMATTING:
- Use <h2> for main sections
- Use <h3> for subsections
- Use <p> for paragraphs
- Use <strong> for names
- NO bullet points - flowing prose only
- Include emoji throughout

Generate the complete rewritten blog post now (HTML format only):`;

    console.log('🤖 Generating expanded content with GPT-4o...\n');

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: 'You are Dr. Amara Okonkwo, a PhD in Linguistics and Cultural Name Studies. You write engaging, witty, comprehensive baby name blog posts with rich cultural context, humor, and modern references.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.8,
      max_tokens: 8000,
    });

    let expandedContent = response.choices[0].message.content.trim();

    // Clean up markdown code blocks
    if (expandedContent.startsWith('```html')) {
      expandedContent = expandedContent.replace(/```html\n?/g, '').replace(/```\n?$/g, '');
    } else if (expandedContent.startsWith('```')) {
      expandedContent = expandedContent.replace(/```\n?/g, '');
    }

    // Ensure placeholder
    if (!expandedContent.includes('<!-- BLOG_NAME_LIST_COMPONENT -->')) {
      expandedContent += '\n\n<!-- BLOG_NAME_LIST_COMPONENT -->\n';
    }

    // Verify name count
    const finalNames = extractNames(expandedContent);
    console.log(`✅ New content has ${finalNames.length} names`);

    if (finalNames.length < 35) {
      console.warn(`⚠️  WARNING: Only ${finalNames.length} names (target: 35+)`);
      console.warn(`   Consider running this again or adding more names manually.\n`);
    }

    // Update stats
    const newStats = updateStats(expandedContent);

    // Update title
    const newTitle = blogData.title.replace(/\d+\+?\s+/gi, `${finalNames.length}+ `);

    // Prepare update
    const updateData = {
      content: expandedContent,
      title: newTitle,
      stats: newStats,
      updatedAt: Date.now()
    };

    if (blogData.seo && blogData.seo.schema) {
      updateData['seo.schema.wordCount'] = newStats.wordCount;
    }

    // Backup
    const fs = require('fs').promises;
    const path = require('path');
    const backupDir = path.join(__dirname, 'blog-backups');
    await fs.mkdir(backupDir, { recursive: true });
    const backupPath = path.join(backupDir, `${slug}-backup-${Date.now()}.json`);
    await fs.writeFile(backupPath, JSON.stringify(blogData, null, 2));

    // Update Firestore
    console.log('💾 Updating Firestore...\n');
    await updateDoc(blogRef, updateData);

    console.log('✨ SUCCESS!');
    console.log(`   Slug: ${slug}`);
    console.log(`   Title: ${newTitle}`);
    console.log(`   Names: ${currentNames.length} → ${finalNames.length}`);
    console.log(`   Words: ${blogData.stats?.wordCount || 0} → ${newStats.wordCount}`);
    console.log(`   Reading time: ${blogData.stats?.readingTime || 0} → ${newStats.readingTime} min`);
    console.log(`   First 15 names: ${finalNames.slice(0, 15).join(', ')}`);
    console.log(`   Backup: ${backupPath}\n`);

    return {
      success: true,
      nameCount: finalNames.length,
      wordCount: newStats.wordCount
    };

  } catch (error) {
    console.error('❌ ERROR:', error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

expandLightBlog()
  .then(result => {
    if (result.success) {
      console.log('🎉 Blog expansion complete!');
      process.exit(0);
    } else {
      console.error('❌ Blog expansion failed');
      process.exit(1);
    }
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
