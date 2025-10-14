#!/usr/bin/env node

/**
 * 🔍 BLOG NAME AUDIT & ENRICHMENT
 *
 * For each blog post:
 * 1. Count names in the name list
 * 2. If < 30 names, research and add relevant names
 * 3. Add missing names to database with enrichment
 * 4. Update blog title to reflect actual name count
 * 5. Ensure all names are searchable
 */

const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, doc, setDoc } = require('firebase/firestore');
const OpenAI = require('openai');
const fs = require('fs');
const path = require('path');

require('dotenv').config();

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Initialize Firebase
const firebaseConfig = {
  apiKey: process.env.REACT_APP_GOOGLE_API_KEY,
  authDomain: "babynames-app-9fa2a.firebaseapp.com",
  projectId: "babynames-app-9fa2a",
  storageBucket: "babynames-app-9fa2a.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Load name database
const NAME_CHUNKS = [
  require('./public/data/names-chunk1.json'),
  require('./public/data/names-chunk2.json'),
  require('./public/data/names-chunk3.json'),
  require('./public/data/names-chunk4.json')
];

const allNames = NAME_CHUNKS.flat();
const nameMap = new Map(allNames.map(n => [n.name.toLowerCase(), n]));

console.log(`📊 Loaded ${allNames.length} names from database\n`);

// Extract names from blog content
function extractNamesFromContent(content) {
  const names = new Set();
  // Match <strong>Name</strong> pattern
  const strongMatches = content.matchAll(/<strong>([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)<\/strong>/g);

  for (const match of strongMatches) {
    const name = match[1].trim();
    if (name && name.length > 1) {
      names.add(name);
    }
  }

  return Array.from(names);
}

// Check if name exists in database
function nameExistsInDatabase(name) {
  return nameMap.has(name.toLowerCase());
}

// Use GPT-4o to research and suggest additional names
async function researchAdditionalNames(blogTitle, existingNames, targetCount) {
  const needed = targetCount - existingNames.length;

  console.log(`   🔍 Researching ${needed} additional names for: "${blogTitle}"`);

  const prompt = `You are a baby name expert. Based on this blog post title: "${blogTitle}"

Current names in the post: ${existingNames.join(', ')}

Suggest ${needed} MORE unique, relevant baby names that fit the theme.

REQUIREMENTS:
- Names should match the blog theme/category
- Avoid duplicates of existing names
- Include both boy and girl names (mix)
- Choose popular, real names (not made-up)
- Diverse cultural origins

Return ONLY a JSON array of names, like: ["Name1", "Name2", "Name3"]`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: "You are a baby name expert. Return only valid JSON." },
        { role: "user", content: prompt }
      ],
      temperature: 0.8,
      max_tokens: 1000
    });

    const content = response.choices[0].message.content.trim();
    // Parse JSON (remove markdown code blocks if present)
    const jsonStr = content.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    const suggestedNames = JSON.parse(jsonStr);

    return suggestedNames.slice(0, needed);
  } catch (error) {
    console.error(`   ❌ Error researching names: ${error.message}`);
    return [];
  }
}

// Enrich a single name with GPT-4o
async function enrichName(name) {
  console.log(`      📝 Enriching: ${name}`);

  const prompt = `Provide comprehensive information about the baby name "${name}":

Return ONLY valid JSON in this exact format:
{
  "name": "${name}",
  "meaning": "brief meaning (max 60 chars)",
  "origin": "primary origin",
  "gender": "boy/girl/unisex",
  "popularity": estimated rank (1-10000, lower = more popular),
  "culturalSignificance": "brief cultural note (max 100 chars)"
}`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: "You are a baby name expert. Return only valid JSON with accurate data." },
        { role: "user", content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 500
    });

    const content = response.choices[0].message.content.trim();
    const jsonStr = content.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    const enrichedData = JSON.parse(jsonStr);

    return enrichedData;
  } catch (error) {
    console.error(`      ❌ Error enriching ${name}: ${error.message}`);
    return null;
  }
}

// Add name to database
async function addNameToDatabase(enrichedName) {
  const nameEntry = {
    name: enrichedName.name,
    meaning: enrichedName.meaning,
    origin: enrichedName.origin,
    origins: [enrichedName.origin],
    originGroup: enrichedName.origin,
    sex: enrichedName.gender === 'boy' ? 'M' : enrichedName.gender === 'girl' ? 'F' : 'Unisex',
    popularity: enrichedName.popularity || 5000,
    popularityRank: enrichedName.popularity || 5000,
    meaningShort: enrichedName.meaning,
    originProcessed: true,
    meaningProcessed: true,
    enriched: true,
    culturalSignificance: enrichedName.culturalSignificance || '',
    addedAt: new Date().toISOString()
  };

  // Add to in-memory map
  nameMap.set(enrichedName.name.toLowerCase(), nameEntry);

  // Add to chunk1 (we'll save it later)
  NAME_CHUNKS[0].push(nameEntry);

  console.log(`      ✅ Added ${enrichedName.name} to database`);
  return nameEntry;
}

// Update blog title with accurate name count
function generateUpdatedTitle(originalTitle, nameCount) {
  // Remove old count from title
  const withoutCount = originalTitle.replace(/\d+\+?\s*(Names?|Baby Names?)/gi, '').trim();

  // Add new count
  return `${withoutCount}: ${nameCount}+ Names`;
}

// Process a single blog post
async function processBlogPost(filePath) {
  console.log(`\n${'='.repeat(80)}`);
  const fileName = path.basename(filePath);
  console.log(`📝 Processing: ${fileName}`);
  console.log(`${'='.repeat(80)}\n`);

  try {
    // Read blog post
    const blogData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    const originalTitle = blogData.title;
    const content = blogData.content;

    // Extract existing names
    let existingNames = extractNamesFromContent(content);
    console.log(`   📊 Current name count: ${existingNames.length}`);

    // Check if we need more names
    if (existingNames.length >= 30) {
      console.log(`   ✅ Already has 30+ names, checking database coverage...`);
    } else {
      console.log(`   ⚠️  Only ${existingNames.length} names, need ${30 - existingNames.length} more`);

      // Research additional names
      const additionalNames = await researchAdditionalNames(originalTitle, existingNames, 35);
      console.log(`   ✅ Found ${additionalNames.length} additional names`);

      // Add them to content (append at end before FAQs)
      if (additionalNames.length > 0) {
        const faqIndex = content.indexOf('## FAQ') !== -1 ? content.indexOf('## FAQ') : content.length;
        const beforeFAQ = content.substring(0, faqIndex);
        const afterFAQ = content.substring(faqIndex);

        // Create new section with additional names
        let additionalSection = '\n\n## More Beautiful Names\n\n';
        additionalNames.forEach((name, idx) => {
          additionalSection += `### ${idx + existingNames.length + 1}. <strong>${name}</strong>\n\n`;
          additionalSection += `A wonderful choice with its own unique charm and character.\n\n`;
        });

        blogData.content = beforeFAQ + additionalSection + afterFAQ;
        existingNames = [...existingNames, ...additionalNames];
        console.log(`   ✅ Added ${additionalNames.length} names to blog content`);
      }
    }

    // Check database coverage
    console.log(`\n   🔍 Checking database coverage for ${existingNames.length} names...`);
    const missingNames = [];

    for (const name of existingNames) {
      if (!nameExistsInDatabase(name)) {
        missingNames.push(name);
      }
    }

    if (missingNames.length > 0) {
      console.log(`   ⚠️  ${missingNames.length} names missing from database`);
      console.log(`   📝 Enriching and adding missing names...\n`);

      for (const name of missingNames) {
        const enrichedName = await enrichName(name);
        if (enrichedName) {
          await addNameToDatabase(enrichedName);
        }
        // Small delay to avoid rate limits
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    } else {
      console.log(`   ✅ All names exist in database`);
    }

    // Update title if needed
    const finalNameCount = existingNames.length;
    let updatedTitle = originalTitle;

    // Check if title has a number
    const hasNumber = /\d+/.test(originalTitle);
    if (hasNumber) {
      const currentNumber = parseInt(originalTitle.match(/\d+/)[0]);
      if (Math.abs(currentNumber - finalNameCount) > 5) {
        updatedTitle = generateUpdatedTitle(originalTitle, finalNameCount);
        console.log(`\n   📝 Title update:`);
        console.log(`      Old: ${originalTitle}`);
        console.log(`      New: ${updatedTitle}`);
        blogData.title = updatedTitle;
      }
    } else {
      // Add count to title if it doesn't have one
      updatedTitle = `${originalTitle}: ${finalNameCount}+ Names`;
      console.log(`\n   📝 Adding count to title: ${updatedTitle}`);
      blogData.title = updatedTitle;
    }

    // Update metadata
    blogData.stats = blogData.stats || {};
    blogData.stats.nameCount = finalNameCount;
    blogData.updatedAt = new Date().toISOString();

    // Save updated blog post
    fs.writeFileSync(filePath, JSON.stringify(blogData, null, 2));
    console.log(`\n   💾 Saved updated blog post`);

    return {
      success: true,
      file: fileName,
      originalCount: existingNames.length - (missingNames.length || 0),
      finalCount: finalNameCount,
      added: missingNames.length,
      title: updatedTitle
    };

  } catch (error) {
    console.error(`   ❌ Error processing blog: ${error.message}`);
    return {
      success: false,
      file: path.basename(filePath),
      error: error.message
    };
  }
}

// Main execution
async function main() {
  console.log('🏆 BLOG NAME AUDIT & ENRICHMENT');
  console.log('================================================================================\n');
  console.log('📋 Tasks:');
  console.log('   1. Check each blog for name count');
  console.log('   2. Add names if < 30');
  console.log('   3. Enrich missing names in database');
  console.log('   4. Update blog titles');
  console.log('   5. Ensure all names are searchable\n');
  console.log('================================================================================\n');

  // Find all blog post files
  const blogDirs = ['blog-posts-new', 'blog-posts-milestones'];
  const allBlogFiles = [];

  for (const dir of blogDirs) {
    const dirPath = path.join(__dirname, dir);
    if (fs.existsSync(dirPath)) {
      const files = fs.readdirSync(dirPath)
        .filter(f => f.endsWith('.json'))
        .map(f => path.join(dirPath, f));
      allBlogFiles.push(...files);
    }
  }

  console.log(`📂 Found ${allBlogFiles.length} blog posts to process\n`);

  const results = [];

  // Process each blog post
  for (let i = 0; i < allBlogFiles.length; i++) {
    const result = await processBlogPost(allBlogFiles[i]);
    results.push(result);

    console.log(`\n📈 Progress: ${i + 1}/${allBlogFiles.length} blogs processed\n`);

    // Delay between blogs
    if (i < allBlogFiles.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  // Save updated database chunks
  console.log('\n💾 Saving updated database...');
  fs.writeFileSync(
    path.join(__dirname, 'public/data/names-chunk1.json'),
    JSON.stringify(NAME_CHUNKS[0], null, 2)
  );
  console.log('   ✅ Database saved\n');

  // Summary
  console.log('================================================================================');
  console.log('📊 AUDIT SUMMARY\n');

  const successful = results.filter(r => r.success);
  const failed = results.filter(r => !r.success);

  console.log(`   ✅ Successfully processed: ${successful.length}`);
  console.log(`   ❌ Failed: ${failed.length}`);
  console.log(`   📝 Total blogs: ${allBlogFiles.length}\n`);

  // Details
  if (successful.length > 0) {
    console.log('📋 PROCESSED BLOGS:\n');
    successful.forEach((r, idx) => {
      console.log(`   ${idx + 1}. ${r.file}`);
      console.log(`      Names: ${r.originalCount} → ${r.finalCount} (+${r.added} to database)`);
      console.log(`      Title: ${r.title}\n`);
    });
  }

  if (failed.length > 0) {
    console.log('❌ FAILED:\n');
    failed.forEach((r, idx) => {
      console.log(`   ${idx + 1}. ${r.file}: ${r.error}\n`);
    });
  }

  console.log('================================================================================');
  console.log('✅ AUDIT COMPLETE!\n');

  process.exit(failed.length > 0 ? 1 : 0);
}

// Run it!
main().catch(console.error);
