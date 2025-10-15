/**
 * EXPAND 7 BABY NAME BLOG POSTS
 *
 * This script expands 7 blog posts that currently have too few names (<30).
 * It uses:
 * - Ref MCP for research (via manual guidance)
 * - GPT-4 for high-quality blog content generation
 * - Firebase Web SDK for Firestore updates
 * - Local database for name enrichment
 */

require('dotenv').config();
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, doc, getDoc, updateDoc, query, where, getDocs } = require('firebase/firestore');
const OpenAI = require('openai');
const fs = require('fs').promises;
const path = require('path');

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

// Blog configurations
const BLOGS_TO_EXPAND = [
  {
    slug: 'literary-baby-names-classic-literature-2025',
    currentCount: 7,
    targetCount: 35,
    searchQueries: [
      'literary baby names from classic literature',
      'famous book character names',
      'author names for babies',
      'classic novel character names'
    ],
    keywords: ['literary', 'book', 'author', 'character', 'novel', 'literature', 'classic', 'story', 'fiction', 'poet', 'poetry', 'writer']
  },
  {
    slug: 'royal-regal-baby-names-history-2025',
    currentCount: 9,
    targetCount: 35,
    searchQueries: [
      'royal baby names from history',
      'regal names from royalty',
      'king and queen names',
      'noble names throughout history'
    ],
    keywords: ['royal', 'king', 'queen', 'prince', 'princess', 'noble', 'regal', 'emperor', 'empress', 'monarch', 'crown', 'sovereign', 'duke', 'duchess']
  },
  {
    slug: 'color-gemstone-baby-names-2025',
    currentCount: 10,
    targetCount: 35,
    searchQueries: [
      'color names for babies',
      'gemstone baby names',
      'jewel names for babies',
      'precious stone names'
    ],
    keywords: ['color', 'gem', 'jewel', 'stone', 'ruby', 'sapphire', 'emerald', 'jade', 'amber', 'pearl', 'violet', 'scarlet', 'azure', 'gold', 'silver']
  },
  {
    slug: 'gender-neutral-unisex-baby-names-2025',
    currentCount: 10,
    targetCount: 35,
    searchQueries: [
      'gender neutral baby names',
      'unisex names for babies',
      'non-binary baby names',
      'androgynous baby names'
    ],
    keywords: ['unisex', 'neutral', 'both', 'androgynous'],
    filterUnisex: true
  },
  {
    slug: 'international-baby-names-english-2025',
    currentCount: 12,
    targetCount: 35,
    searchQueries: [
      'international baby names',
      'multicultural baby names',
      'global baby names',
      'diverse origin names'
    ],
    keywords: ['international', 'global', 'multicultural', 'diverse'],
    diverseOrigins: true
  },
  {
    slug: 'names-that-mean-moon-2025',
    currentCount: 20,
    targetCount: 35,
    searchQueries: [
      'baby names that mean moon',
      'lunar names for babies',
      'moon related baby names',
      'names meaning moonlight'
    ],
    keywords: ['moon', 'lunar', 'night', 'celestial', 'crescent', 'selene', 'artemis']
  },
  {
    slug: 'baby-names-mean-light-sun-star-2025',
    currentCount: 23,
    targetCount: 35,
    searchQueries: [
      'baby names meaning light',
      'names that mean sun',
      'star names for babies',
      'bright and shining baby names'
    ],
    keywords: ['light', 'sun', 'star', 'bright', 'shine', 'dawn', 'ray', 'aurora', 'lucia', 'lucian', 'solar', 'radiant', 'glow', 'beam']
  }
];

/**
 * Load names from database chunks
 */
async function loadDatabaseNames() {
  const allNames = [];
  for (let i = 1; i <= 4; i++) {
    try {
      const chunkPath = path.join(__dirname, 'public', 'data', `names-chunk${i}.json`);
      const chunk = JSON.parse(await fs.readFile(chunkPath, 'utf-8'));
      allNames.push(...chunk);
    } catch (err) {
      console.warn(`⚠️  Could not load chunk ${i}:`, err.message);
    }
  }
  return allNames;
}

/**
 * Filter names based on blog topic
 */
function filterNamesForTopic(names, config) {
  let filtered = names.filter(n => n.name && n.name.length > 1);

  // Filter by unisex if needed
  if (config.filterUnisex) {
    filtered = filtered.filter(n =>
      n.gender === 'unisex' ||
      n.sex === 'Unisex' ||
      n.sex === 'Both' ||
      (n.gender_ratio && n.gender_ratio >= 35 && n.gender_ratio <= 65)
    );
  }

  // Filter by keywords in meaning/origin
  if (config.keywords && config.keywords.length > 0) {
    filtered = filtered.filter(n => {
      const searchText = `${n.meaning || ''} ${n.origin || ''} ${n.name || ''}`.toLowerCase();
      return config.keywords.some(keyword => {
        const keywordLower = keyword.toLowerCase();
        return searchText.includes(keywordLower) ||
               searchText.split(/\s+/).some(word => word.includes(keywordLower.slice(0, 4)));
      });
    });
  }

  // For diverse origins, ensure variety
  if (config.diverseOrigins) {
    const originGroups = {};
    filtered.forEach(n => {
      const origin = n.origin || 'Unknown';
      if (!originGroups[origin]) originGroups[origin] = [];
      if (originGroups[origin].length < 8) {
        originGroups[origin].push(n);
      }
    });
    filtered = Object.values(originGroups).flat();
  }

  // Sort by popularity if available
  filtered.sort((a, b) => {
    const popA = parseInt(a.popularity || 999999);
    const popB = parseInt(b.popularity || 999999);
    return popA - popB;
  });

  return filtered.slice(0, config.targetCount + 20); // Extra names for GPT-4 to choose from
}

/**
 * Extract names from HTML content
 */
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

/**
 * Use GPT-4 to rewrite blog post with expanded name list
 */
async function rewriteBlogWithGPT4(blogData, relevantNames, config) {
  const currentNames = extractNames(blogData.content);
  const currentContent = blogData.content.replace('<!-- BLOG_NAME_LIST_COMPONENT -->', '').trim();

  console.log(`\n📝 Rewriting: ${blogData.title}`);
  console.log(`   Current names: ${currentNames.length}`);
  console.log(`   Target names: ${config.targetCount}+`);
  console.log(`   Available names: ${relevantNames.length}`);

  const namesToAdd = config.targetCount - currentNames.length;
  const nameListForPrompt = relevantNames.slice(0, 100).map(n =>
    `${n.name} (${n.origin || 'Unknown'}, ${n.gender || n.sex || 'unisex'}) - ${n.meaning || 'beautiful name'}`
  ).join('\n');

  const prompt = `You are Dr. Amara Okonkwo, PhD in Linguistics and Cultural Name Studies, writing for SoulSeed baby name app. Your writing is witty, fluid, conversational, engaging, humorous, and culturally rich.

CURRENT BLOG:
Title: ${blogData.title}
Excerpt: ${blogData.excerpt}
Current Content:
${currentContent}

CURRENT NAMES (${currentNames.length}): ${currentNames.join(', ')}

YOUR MISSION: Rewrite this blog to include ${config.targetCount}+ TOTAL names while making it engaging, informative, and fun to read.

AVAILABLE NAMES TO ADD (select ${namesToAdd}+ from this list):
${nameListForPrompt}

CRITICAL INSTRUCTIONS:
1. **KEEP ALL EXISTING NAMES** - integrate them into the new structure
2. **ADD ${namesToAdd}+ NEW NAMES** from the list above
3. **MINIMUM FINAL COUNT: ${config.targetCount}+ TOTAL NAMES**
4. **Format EVERY name** as: <strong>NameHere</strong> (Origin, Gender, means "meaning"): Witty engaging description with cultural/historical context

WRITING STYLE:
- Witty, conversational, and engaging (think: smart friend giving advice)
- Use emoji throughout (✨ 💫 🌟 👑 📚 🌈 etc.)
- Pop culture references (movies, TV shows, celebrities, TikTok trends)
- Historical and cultural context for names
- Etymology and linguistic origins explained accessibly
- Personal anecdotes or relatable scenarios
- Humor where appropriate
- Modern, fresh tone for 2025

STRUCTURE:
- **Catchy Introduction** (2-3 paragraphs with hook)
- **Organized Sections** with creative H2/H3 headers:
  * Group by origin, vibe, gender, popularity, or theme
  * Example section names: "Timeless Classics", "Modern Marvels", "Cultural Treasures", "Hidden Gems", "Celebrity Favorites"
- **Name Entries** (2-3 sentences each):
  * Format: <strong>Name</strong> (Origin, Gender, means "meaning"): Description with context
  * Include pronunciation tips for difficult names
  * Share interesting facts, famous bearers, or pop culture connections
- **Engaging Conclusion** (actionable takeaway, inspirational message)
- **End with**: <!-- BLOG_NAME_LIST_COMPONENT --> on new line

FORMATTING RULES:
- Use <h2> for main section headers
- Use <h3> for subsection headers
- Use <p> for paragraphs (2-3 sentences per name)
- Use <strong> tags for every name
- NO bullet points or lists - flowing prose only
- Include emoji throughout (but not excessively)

QUALITY STANDARDS:
- Accurate etymology and meanings
- Real historical/literary/cultural references
- Balance popular and unique names
- Gender-inclusive language
- Verify each name matches the blog topic perfectly

Generate the complete rewritten blog post now (HTML format only):`;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o', // Using GPT-4o for best quality and large context window
      messages: [
        {
          role: 'system',
          content: 'You are Dr. Amara Okonkwo, a PhD in Linguistics and Cultural Name Studies. You write engaging, witty, and comprehensive baby name blog posts with rich cultural context, humor, and modern references. You love adding lots of names and making them interesting.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.8, // Higher for more creative, engaging writing
      max_tokens: 8000, // Plenty of tokens for 35+ names with descriptions
    });

    let expandedContent = response.choices[0].message.content.trim();

    // Clean up markdown code blocks if present
    if (expandedContent.startsWith('```html')) {
      expandedContent = expandedContent.replace(/```html\n?/g, '').replace(/```\n?$/g, '');
    } else if (expandedContent.startsWith('```')) {
      expandedContent = expandedContent.replace(/```\n?/g, '');
    }

    // Ensure placeholder is at the end
    if (!expandedContent.includes('<!-- BLOG_NAME_LIST_COMPONENT -->')) {
      expandedContent += '\n\n<!-- BLOG_NAME_LIST_COMPONENT -->\n';
    }

    return expandedContent;

  } catch (error) {
    console.error(`❌ GPT-4 error:`, error.message);
    throw error;
  }
}

/**
 * Update stats (word count, reading time)
 */
function updateStats(content) {
  const text = content.replace(/<[^>]+>/g, ' ');
  const wordCount = text.split(/\s+/).filter(w => w.length > 0).length;
  const readingTime = Math.max(1, Math.ceil(wordCount / 200));

  return { wordCount, readingTime };
}

/**
 * Update title if it mentions a number
 */
function updateTitle(title, newCount) {
  // Update patterns like "11 Literary Names" to "35+ Literary Names"
  return title.replace(/\d+\+?\s+(Literary|Royal|Color|Gender|International|Names|Baby)/gi, (match, word) => {
    return `${newCount}+ ${word}`;
  });
}

/**
 * Expand a single blog post
 */
async function expandBlog(config, allNames) {
  console.log(`\n${'='.repeat(70)}`);
  console.log(`🚀 EXPANDING: ${config.slug}`);
  console.log('='.repeat(70));

  try {
    // Get blog from Firestore
    const blogRef = doc(db, 'blogs', config.slug);
    const blogSnap = await getDoc(blogRef);

    if (!blogSnap.exists()) {
      throw new Error(`Blog not found: ${config.slug}`);
    }

    const blogData = blogSnap.data();
    console.log(`✅ Loaded blog: ${blogData.title}`);

    // Filter relevant names
    const relevantNames = filterNamesForTopic(allNames, config);
    console.log(`📦 Found ${relevantNames.length} relevant names`);

    if (relevantNames.length < config.targetCount) {
      console.warn(`⚠️  Only ${relevantNames.length} relevant names found (target: ${config.targetCount})`);
    }

    // Rewrite blog with GPT-4
    console.log(`🤖 Generating new content with GPT-4...`);
    const newContent = await rewriteBlogWithGPT4(blogData, relevantNames, config);

    // Verify name count
    const finalNames = extractNames(newContent);
    console.log(`✅ New content has ${finalNames.length} names`);

    if (finalNames.length < config.targetCount) {
      console.warn(`⚠️  WARNING: Only ${finalNames.length} names (target: ${config.targetCount})`);
    }

    // Update stats
    const newStats = updateStats(newContent);

    // Update title if needed
    const newTitle = updateTitle(blogData.title, finalNames.length);

    // Prepare update
    const updateData = {
      content: newContent,
      title: newTitle,
      stats: newStats,
      updatedAt: Date.now()
    };

    // Update schema if it exists
    if (blogData.seo && blogData.seo.schema) {
      updateData['seo.schema.wordCount'] = newStats.wordCount;
    }

    // Update Firestore
    console.log(`💾 Updating Firestore...`);
    await updateDoc(blogRef, updateData);

    console.log(`\n✨ SUCCESS!`);
    console.log(`   Slug: ${config.slug}`);
    console.log(`   Title: ${newTitle}`);
    console.log(`   Names: ${config.currentCount} → ${finalNames.length}`);
    console.log(`   Words: ${blogData.stats?.wordCount || 0} → ${newStats.wordCount}`);
    console.log(`   Reading time: ${blogData.stats?.readingTime || 0} → ${newStats.readingTime} min`);
    console.log(`   First 10 names: ${finalNames.slice(0, 10).join(', ')}`);

    // Save backup
    const backupDir = path.join(__dirname, 'blog-backups');
    await fs.mkdir(backupDir, { recursive: true });
    const backupPath = path.join(backupDir, `${config.slug}-backup-${Date.now()}.json`);
    await fs.writeFile(backupPath, JSON.stringify(blogData, null, 2));
    console.log(`   Backup: ${backupPath}`);

    return {
      success: true,
      slug: config.slug,
      oldCount: config.currentCount,
      newCount: finalNames.length,
      wordCount: newStats.wordCount
    };

  } catch (error) {
    console.error(`\n❌ ERROR:`, error.message);
    return {
      success: false,
      slug: config.slug,
      error: error.message
    };
  }
}

/**
 * Main function
 */
async function main() {
  console.log(`
╔════════════════════════════════════════════════════════════════╗
║           EXPAND 7 BABY NAME BLOG POSTS                        ║
║           Using GPT-4 + Firebase + Database                    ║
╚════════════════════════════════════════════════════════════════╝
`);

  try {
    // Load database names
    console.log('📦 Loading name database...');
    const allNames = await loadDatabaseNames();
    console.log(`   Loaded ${allNames.length.toLocaleString()} names\n`);

    // Expand each blog
    const results = [];
    for (let i = 0; i < BLOGS_TO_EXPAND.length; i++) {
      const config = BLOGS_TO_EXPAND[i];

      console.log(`\n[${i + 1}/${BLOGS_TO_EXPAND.length}] Processing: ${config.slug}`);
      console.log(`Ref MCP Search Queries (for your reference):`);
      config.searchQueries.forEach(q => console.log(`  - "${q}"`));

      const result = await expandBlog(config, allNames);
      results.push(result);

      // Small delay between blogs to avoid rate limits
      if (i < BLOGS_TO_EXPAND.length - 1) {
        console.log(`\n⏳ Waiting 3 seconds before next blog...\n`);
        await new Promise(resolve => setTimeout(resolve, 3000));
      }
    }

    // Summary
    console.log(`\n${'='.repeat(70)}`);
    console.log(`📊 FINAL SUMMARY`);
    console.log('='.repeat(70));

    const successful = results.filter(r => r.success);
    const failed = results.filter(r => !r.success);

    console.log(`\n✅ Successful: ${successful.length}/${results.length}`);
    successful.forEach(r => {
      console.log(`   ${r.slug}: ${r.oldCount} → ${r.newCount} names (${r.wordCount} words)`);
    });

    if (failed.length > 0) {
      console.log(`\n❌ Failed: ${failed.length}/${results.length}`);
      failed.forEach(r => {
        console.log(`   ${r.slug}: ${r.error}`);
      });
    }

    console.log(`\n${'='.repeat(70)}`);
    console.log(`🎉 EXPANSION COMPLETE!`);
    console.log('='.repeat(70));

    // Save summary report
    const reportPath = path.join(__dirname, 'blog-expansion-report.json');
    await fs.writeFile(reportPath, JSON.stringify(results, null, 2));
    console.log(`\n💾 Report saved: ${reportPath}\n`);

  } catch (error) {
    console.error(`\n❌ FATAL ERROR:`, error);
    process.exit(1);
  }
}

if (require.main === module) {
  main()
    .then(() => process.exit(0))
    .catch(err => {
      console.error(err);
      process.exit(1);
    });
}

module.exports = { expandBlog, BLOGS_TO_EXPAND };
