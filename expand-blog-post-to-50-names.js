require('dotenv').config({ debug: true });
const fs = require('fs').promises;
const path = require('path');
const OpenAI = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Topic keyword mappings for filtering relevant names
const TOPIC_KEYWORDS = {
  'post-1-light-sun-star-names.json': {
    keywords: ['light', 'sun', 'star', 'bright', 'shine', 'dawn', 'ray', 'celestial', 'solar', 'lunar', 'radiant', 'glow', 'beam', 'aurora', 'illumin'],
    targetCount: 55
  },
  'post-2-vintage-names.json': {
    keywords: ['vintage', 'classic', 'old', 'traditional', 'antique', 'timeless', 'retro', 'historical', 'ancient', 'heritage'],
    targetCount: 55
  },
  'post-3-nature-names.json': {
    keywords: ['nature', 'flower', 'tree', 'plant', 'earth', 'forest', 'garden', 'bloom', 'leaf', 'river', 'mountain', 'ocean', 'sea', 'sky', 'stone', 'rock'],
    targetCount: 55
  },
  'post-4-short-names.json': {
    keywords: [], // Filter by name length instead
    targetCount: 55,
    maxLength: 4
  },
  'post-5-royal-names.json': {
    keywords: ['king', 'queen', 'royal', 'prince', 'princess', 'noble', 'crown', 'reign', 'ruler', 'sovereign', 'emperor', 'empress', 'lord', 'lady'],
    targetCount: 55
  },
  'post-6-mythology-names.json': {
    keywords: ['god', 'goddess', 'myth', 'legend', 'divine', 'deity', 'hero', 'heroic', 'immortal', 'olymp', 'titan', 'norse', 'celtic', 'roman', 'greek'],
    targetCount: 55
  },
  'post-7-international-names.json': {
    keywords: ['international', 'global', 'exotic', 'multicultural'], // Will use diverse origins
    targetCount: 55,
    diverseOrigins: true
  },
  'post-8-unisex-names.json': {
    keywords: [], // Filter by gender
    targetCount: 55,
    genderFilter: 'unisex'
  },
  'post-9-color-gemstone-names.json': {
    keywords: ['color', 'gem', 'jewel', 'stone', 'pearl', 'ruby', 'sapphire', 'emerald', 'jade', 'amber', 'crystal', 'diamond', 'silver', 'gold', 'scarlet', 'azure', 'violet'],
    targetCount: 55
  },
  'post-10-literary-names.json': {
    keywords: ['literary', 'book', 'story', 'character', 'novel', 'author', 'writer', 'literature', 'poet', 'poetry'],
    targetCount: 55
  },
  'post-11-moon-names.json': {
    keywords: ['moon', 'lunar', 'night', 'celestial', 'crescent', 'eclipse'],
    targetCount: 55
  }
};

/**
 * Load enriched names from blog enrichment
 */
async function loadEnrichedNames() {
  const enrichedPath = path.join(__dirname, 'blog-posts-seo', 'enriched-blog-names.json');
  const data = JSON.parse(await fs.readFile(enrichedPath, 'utf-8'));
  return data.enriched_names || [];
}

/**
 * Load all names from main database chunks
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
 * Filter names based on topic keywords
 */
function filterNamesByTopic(names, postFilename) {
  const config = TOPIC_KEYWORDS[postFilename];
  if (!config) return names;

  let filtered = names;

  // Filter by length if specified
  if (config.maxLength) {
    filtered = filtered.filter(n => n.name && n.name.length <= config.maxLength);
  }

  // Filter by gender if specified
  if (config.genderFilter === 'unisex') {
    filtered = filtered.filter(n =>
      n.gender === 'unisex' ||
      n.sex === 'Unisex' ||
      n.sex === 'Both'
    );
  }

  // Filter by keywords in meaning/origin (RELAXED - match any keyword)
  if (config.keywords && config.keywords.length > 0) {
    filtered = filtered.filter(n => {
      const searchText = `${n.meaning || ''} ${n.origin || ''} ${n.name || ''}`.toLowerCase();
      // Match if ANY keyword appears in the text
      return config.keywords.some(keyword => {
        const keywordLower = keyword.toLowerCase();
        return searchText.includes(keywordLower) ||
               // Also check for partial matches
               searchText.split(/\s+/).some(word => word.includes(keywordLower.slice(0, 4)));
      });
    });
  }

  // If still not enough names, be more lenient with partial keyword matches
  if (filtered.length < (config.targetCount + 20)) {
    const relaxedFiltered = names.filter(n => {
      const searchText = `${n.meaning || ''} ${n.origin || ''} ${n.name || ''}`.toLowerCase();
      // Match if meaning contains words related to luminosity, celestial themes, etc.
      return config.keywords && config.keywords.some(keyword => {
        return searchText.split(/\s+/).some(word =>
          word.startsWith(keyword.slice(0, 3)) ||
          word.includes(keyword.slice(0, 4))
        );
      });
    });
    // Merge and dedupe
    const seen = new Set(filtered.map(n => n.name));
    relaxedFiltered.forEach(n => {
      if (!seen.has(n.name)) {
        filtered.push(n);
        seen.add(n.name);
      }
    });
  }

  // For diverse origins, ensure variety
  if (config.diverseOrigins) {
    const originGroups = {};
    filtered.forEach(n => {
      const origin = n.origin || 'Unknown';
      if (!originGroups[origin]) originGroups[origin] = [];
      if (originGroups[origin].length < 5) {
        originGroups[origin].push(n);
      }
    });
    filtered = Object.values(originGroups).flat();
  }

  return filtered.slice(0, config.targetCount || 60);
}

/**
 * Extract current names from blog post content
 */
function extractCurrentNames(content) {
  const names = [];
  const strongMatches = content.matchAll(/<strong>([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)<\/strong>/g);

  for (const match of strongMatches) {
    const name = match[1].trim();
    if (name && !names.includes(name) && name.length > 1) {
      names.push(name);
    }
  }

  return names;
}

/**
 * Use GPT-4o to expand blog post with 50+ names
 */
async function expandBlogPost(currentPost, relevantNames, postConfig) {
  const currentNames = extractCurrentNames(currentPost.content);
  const currentContent = currentPost.content.replace('<!-- BLOG_NAME_LIST_COMPONENT -->', '').trim();

  console.log(`\n📝 Expanding blog post: ${currentPost.title}`);
  console.log(`   Current names: ${currentNames.length}`);
  console.log(`   Target names: ${postConfig.targetCount || 55}+`);
  console.log(`   Available relevant names: ${relevantNames.length}`);

  const minNamesToAdd = Math.max(30, (postConfig.targetCount || 55) - currentNames.length);
  const nameListForPrompt = relevantNames.slice(0, 150).map(n =>
    `${n.name} (${n.origin || 'Unknown'}, means "${n.meaning || 'beautiful name'}")`
  ).join('\n- ');

  const prompt = `You are an expert baby name blogger with a witty, engaging voice. Your task is to MASSIVELY EXPAND an existing blog post to include AT LEAST ${postConfig.targetCount || 55} TOTAL NAMES while maintaining the fun, conversational tone.

CURRENT BLOG POST:
Title: ${currentPost.title}
Current Content:
${currentContent}

CURRENT NAMES (${currentNames.length}): ${currentNames.join(', ')}

🎯 YOUR GOAL: Add ${minNamesToAdd}+ NEW names from the list below (final post should have ${postConfig.targetCount || 55}+ TOTAL names)

ADDITIONAL RELEVANT NAMES TO ADD (select ${minNamesToAdd}+ from this list):
- ${nameListForPrompt}

CRITICAL INSTRUCTIONS:
1. **KEEP ALL ${currentNames.length} EXISTING NAMES** - integrate them into the new structure
2. **ADD ${minNamesToAdd}+ NEW NAMES** from the list above - don't be shy, add as many as you can!
3. **MINIMUM FINAL COUNT: ${postConfig.targetCount || 55}+ TOTAL NAMES** (existing + new)
4. **Format EVERY name** as: <strong>NameHere</strong> (Origin, means "meaning"): Witty engaging description
5. **Create NEW SECTIONS** to organize all these names (e.g., "Vintage Classics", "Modern Picks", "Rare Gems", "Cultural Treasures", "Trending Now")
6. **Use proper HTML**: <h2> for main sections, <h3> for subsections, <p> for paragraphs, <strong> for name emphasis
7. **Maintain the fun, conversational tone** with emoji ✨💫🌟, pop culture references, humor, and spiritual vibes
8. **NO BULLET POINTS** - write in flowing paragraphs with 2-3 sentences per name
9. **Keep introduction and conclusion** sections engaging
10. **End with**: <!-- BLOG_NAME_LIST_COMPONENT --> placeholder on new line

REMEMBER: This is about EXPANDING the content dramatically. Don't just add a few names - add ${minNamesToAdd}+ new ones!

IMPORTANT FORMATTING RULES:
- Every name MUST be in <strong>NameHere</strong> tags
- After name: (Origin, means "meaning"): Description
- Use <h2> and <h3> for section headers
- Write engaging 2-3 sentence descriptions for each name
- Include emoji throughout (✨ ☀️ 🌟 💫 🌈 etc.)
- Reference pop culture, celebrities, TikTok trends
- Make it feel fresh, modern, and fun for 2025

Generate the complete expanded blog post content now (HTML format only, no JSON):`;

  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      {
        role: 'system',
        content: 'You are Dr. Amara Okonkwo, a PhD in Linguistics and Cultural Name Studies Expert who writes engaging, witty blog posts about baby names with pop culture references and spiritual vibes. You LOVE adding tons of names to your posts and making them comprehensive.'
      },
      {
        role: 'user',
        content: prompt
      }
    ],
    temperature: 0.7, // Slightly lower for more consistency
    max_tokens: 12000, // Increased to allow for 50+ names with descriptions
  });

  let expandedContent = response.choices[0].message.content.trim();

  // Clean up any markdown code blocks
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
}

/**
 * Count names in content
 */
function countNames(content) {
  const names = extractCurrentNames(content);
  return names.length;
}

/**
 * Update word count and reading time
 */
function updateStats(content) {
  const text = content.replace(/<[^>]+>/g, ' ');
  const wordCount = text.split(/\s+/).filter(w => w.length > 0).length;
  const readingTime = Math.max(1, Math.ceil(wordCount / 200));

  return { wordCount, readingTime };
}

/**
 * Main function to expand a blog post
 */
async function expandPost(postFilename) {
  try {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`🚀 Expanding: ${postFilename}`);
    console.log('='.repeat(60));

    // Load current post
    const postPath = path.join(__dirname, 'blog-posts-seo', postFilename);
    const currentPost = JSON.parse(await fs.readFile(postPath, 'utf-8'));

    // Load all available names
    console.log('📦 Loading name databases...');
    const enrichedNames = await loadEnrichedNames();
    const dbNames = await loadDatabaseNames();
    const allNames = [...enrichedNames, ...dbNames];
    console.log(`   Loaded ${allNames.length.toLocaleString()} total names`);

    // Filter relevant names for this topic
    const relevantNames = filterNamesByTopic(allNames, postFilename);
    console.log(`   Found ${relevantNames.length} relevant names for topic`);

    // Get config for this post
    const postConfig = TOPIC_KEYWORDS[postFilename] || { targetCount: 55 };

    // Expand the blog post
    const expandedContent = await expandBlogPost(currentPost, relevantNames, postConfig);

    // Verify name count
    const finalNameCount = countNames(expandedContent);
    console.log(`\n✅ Expanded content has ${finalNameCount} names`);

    if (finalNameCount < 50) {
      console.warn(`⚠️  WARNING: Only ${finalNameCount} names found (target: ${postConfig.targetCount}+)`);
      console.warn(`   You may want to run this again or manually add more names.`);
    }

    // Update post
    currentPost.content = expandedContent;
    const newStats = updateStats(expandedContent);
    currentPost.stats = newStats;
    currentPost.updatedAt = Date.now();

    // Update schema wordCount
    if (currentPost.seo && currentPost.seo.schema) {
      currentPost.seo.schema.wordCount = newStats.wordCount;
    }

    // Save expanded post
    const backupPath = postPath.replace('.json', '_backup_before_expansion.json');
    await fs.copyFile(postPath, backupPath);
    await fs.writeFile(postPath, JSON.stringify(currentPost, null, 2));

    console.log(`\n💾 Saved expanded post:`);
    console.log(`   Main: ${postPath}`);
    console.log(`   Backup: ${backupPath}`);
    console.log(`   Names: ${finalNameCount}`);
    console.log(`   Words: ${newStats.wordCount}`);
    console.log(`   Reading time: ${newStats.readingTime} min`);
    console.log(`\n✨ SUCCESS!\n`);

    return {
      success: true,
      postFilename,
      nameCount: finalNameCount,
      wordCount: newStats.wordCount
    };

  } catch (error) {
    console.error(`\n❌ Error expanding ${postFilename}:`, error.message);
    return {
      success: false,
      postFilename,
      error: error.message
    };
  }
}

/**
 * Main execution
 */
async function main() {
  const postToExpand = process.argv[2];

  if (!postToExpand) {
    console.log(`
📚 Blog Post Expansion Tool

Usage: node expand-blog-post-to-50-names.js <post-filename>

Available posts:
${Object.keys(TOPIC_KEYWORDS).map(p => `  - ${p}`).join('\n')}

Example:
  node expand-blog-post-to-50-names.js post-1-light-sun-star-names.json
`);
    process.exit(1);
  }

  const result = await expandPost(postToExpand);

  if (!result.success) {
    console.error(`\n❌ Failed to expand post`);
    process.exit(1);
  }

  console.log(`\n${'='.repeat(60)}`);
  console.log(`🎉 Post expansion complete!`);
  console.log(`   File: ${result.postFilename}`);
  console.log(`   Names: ${result.nameCount}`);
  console.log(`   Words: ${result.wordCount}`);
  console.log('='.repeat(60));
}

if (require.main === module) {
  main();
}

module.exports = { expandPost, TOPIC_KEYWORDS };
