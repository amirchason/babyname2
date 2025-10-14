#!/usr/bin/env node
/**
 * RESILIENT BLOG REWRITER
 *
 * Features:
 * - Runs locally but saves progress to cloud (Firestore)
 * - Auto-resumes from interruptions
 * - 50+ names per post with 3+ nicknames each
 * - Witty, sensitive, spiritual guidance
 * - Mobile-optimized formatting
 * - Progress tracking and reporting
 *
 * Usage:
 *   node rewrite-blogs-resilient.js          # Resume from last checkpoint
 *   node rewrite-blogs-resilient.js --reset  # Start fresh
 *   node rewrite-blogs-resilient.js --test   # Test with one post
 */

const { initializeApp } = require('firebase/app');
const { getFirestore, collection, query, where, getDocs, doc, updateDoc, setDoc, getDoc } = require('firebase/firestore');
const OpenAI = require('openai');
const fs = require('fs');
require('dotenv').config();

// Parse command line arguments
const args = process.argv.slice(2);
const RESET_PROGRESS = args.includes('--reset');
const TEST_MODE = args.includes('--test');

// Initialize Firebase
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

// Initialize OpenAI with GPT-4o
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Load name database
const namesChunk1 = require('./public/data/names-chunk1.json');

// Progress tracking document
const PROGRESS_DOC = 'blog-rewrite-progress';

// Enhanced system prompt with 3+ nicknames requirement
const SYSTEM_PROMPT = `You are an expert baby name writer creating beautiful, spiritual, and witty blog posts.

CRITICAL REQUIREMENTS:
1. Include EXACTLY 50 OR MORE unique baby names (minimum 50, ideally 55-60 to be safe!)
2. FORMAT EVERY NAME AS: <strong>Name</strong> (this is how we count - must be in <strong> tags!)
3. Add 3-6 CUTE NICKNAMES for EVERY SINGLE NAME (e.g., "Luna (Lulu, Lu-Lu, Lunita, Lunie, Lu, Moon)")
4. Write with warmth, sensitivity, and spiritual insight
5. Mobile-first formatting (short paragraphs, 2-3 sentences max)
6. Spread names EVENLY throughout the entire article
7. Make it engaging, witty, and heartfelt

**COUNT AS YOU WRITE**: Literally count the <strong>Name</strong> tags to ensure you hit 50+ before finishing!

NICKNAME REQUIREMENTS (MANDATORY):
- MINIMUM 3 nicknames per name (5-6 is better!)
- Make them cute, creative, and diverse
- Include traditional, modern, and playful variations
- Examples of GOOD nickname lists:
  * Isabella → Bella, Izzy, Belle, Isa, Sabelita, Issy
  * Alexander → Alex, Xander, Lex, Sasha, Alec, Sandy
  * Seraphina → Sera, Phina, Raffy, Fifi, Seffy, Seri
  * Benjamin → Ben, Benny, Benji, Benj, Jamie, B
  * Olivia → Livvy, Liv, Ollie, Via, Livi, Oli

STRUCTURE:
- Opening: Set the tone (2-3 short paragraphs)
- Body: Present names in 6-8 themed sub-sections (7-10 names per section to reach 50+)
- Each name gets:
  * Name with pronunciation if needed (1 line)
  * Meaning/origin (1 sentence)
  * Why it's special (1 sentence)
  * 3+ nickname options in separate paragraph
- Smooth transitions between sections
- Heartwarming conclusion (2-3 paragraphs)

IMPORTANT: Expand the theme creatively to reach 50+ names!
- "Literary Names" → Include classic lit, modern lit, poetry, author names, character names
- "Royal Names" → Historical royals, modern royal families, names meaning "royal"
- "Nature Names" → Flowers, trees, animals, weather, celestial, seasons, landscapes
- Be broad and creative to ensure 50+ unique names!

STYLE GUIDELINES:
- Write like you're talking to a close friend expecting a baby
- Use spiritual/meaningful language when appropriate
- Short paragraphs (mobile-friendly!)
- Include h2 section headers for each theme
- Add the <!-- BLOG_NAME_LIST_COMPONENT --> placeholder at the very end

FORMATTING EXAMPLE:
<h2>✨ Luminous Choices</h2>

<p><strong>Aurora</strong> (aw-ROHR-ah) — The goddess of dawn brings light to new beginnings. Perfect for a little one who'll brighten your world every morning.</p>

<p>Sweet nicknames: Rory, Aura, Rora, Ori, Rorie, Roro</p>

<p><strong>Lucia</strong> — This Italian beauty means "light" and carries centuries of grace. A timeless choice that never goes out of style.</p>

<p>Adorable options: Lucy, Luce, Cia, Lu-Lu, Lulu, Luci</p>

REMEMBER:
- Count your names! You MUST include 50+ unique names minimum.
- EVERY SINGLE NAME needs 3+ nickname suggestions (no exceptions!)
- Keep paragraphs SHORT for mobile reading
- Be witty, warm, and spiritually insightful`;

function countNames(html) {
  const matches = html.match(/<strong>(?:\d+\.\s+)?([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)<\/strong>/g);
  return matches ? matches.length : 0;
}

function extractUniqueNames(html) {
  const names = [];
  const regex = /<strong>(?:\d+\.\s+)?([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)<\/strong>/g;
  let match;

  while ((match = regex.exec(html)) !== null) {
    const name = match[1].trim();
    if (!names.includes(name)) {
      names.push(name);
    }
  }

  return names;
}

async function loadProgress() {
  try {
    const progressRef = doc(db, 'system', PROGRESS_DOC);
    const progressDoc = await getDoc(progressRef);

    if (progressDoc.exists() && !RESET_PROGRESS) {
      const data = progressDoc.data();
      console.log(`📋 Resuming from checkpoint: ${data.completedCount || 0} posts completed`);
      return data;
    }
  } catch (error) {
    console.log('⚠️  No previous progress found, starting fresh');
  }

  return {
    completedPosts: [],
    completedCount: 0,
    totalPosts: 0,
    startedAt: new Date().toISOString(),
    lastUpdate: new Date().toISOString()
  };
}

async function saveProgress(progress) {
  try {
    const progressRef = doc(db, 'system', PROGRESS_DOC);
    await setDoc(progressRef, {
      ...progress,
      lastUpdate: new Date().toISOString()
    });
  } catch (error) {
    console.error('⚠️  Could not save progress to cloud:', error.message);
  }
}

async function rewriteBlogPost(post, attemptNum = 1) {
  const maxAttempts = 3;

  console.log(`\n${'='.repeat(80)}`);
  console.log(`📝 Rewriting: ${post.title}`);
  console.log(`   Current names: ${post.namesCount}`);
  console.log(`   Target: 50+ names with 3+ nicknames each`);
  console.log(`   Attempt: ${attemptNum}/${maxAttempts}`);

  const userPrompt = `Rewrite this blog post with MINIMUM 50 unique baby names, each with 3+ cute nicknames:

TITLE: ${post.title}
CATEGORY: ${post.category}
SLUG: ${post.slug}

CURRENT CONTENT (${post.namesCount} names - TOO FEW!):
${post.content}

CRITICAL REQUIREMENTS:
- Include 50+ unique names (**YOUR GOAL: Write exactly 55 names to be safe!**)
- COUNT as you write: Keep a mental tally of <strong>Name</strong> tags
- Add 3-6 CUTE NICKNAMES for EVERY SINGLE NAME (no exceptions!)
- Example format:
  <p><strong>Isabella</strong> — Italian origin meaning "devoted to God." A name that exudes grace and elegance.</p>
  <p>Cute nicknames: Bella, Izzy, Belle, Isa, Sabelita, Issy</p>

- Keep the same title and EXPAND the theme creatively to reach 50+ names
  * If theme is "Literary Names" - include names from books, poems, plays, authors' names, and character names
  * If theme is narrow - interpret it broadly (e.g., "Royal Names" = historical royals + modern royal families + names meaning "royal")
  * You CAN and SHOULD expand beyond the obvious examples to reach 50+ names
- Mobile-friendly formatting (short paragraphs, 2-3 sentences)
- Witty, sensitive, spiritual tone
- Spread names evenly throughout in themed sections
- Add <!-- BLOG_NAME_LIST_COMPONENT --> at the very end
- Use database names when possible: ${post.existingNames.slice(0, 20).join(', ')}...

STRATEGY TO REACH 50+ NAMES:
- Create 6-8 themed sub-sections (e.g., "Classic Literary Heroes", "Romantic Literature", "Modern Literature", "Poetry-Inspired", "Author Names")
- Include 7-10 names per section
- Be creative in expanding the theme!

Write the complete HTML content (no markdown, pure HTML with <h2>, <p>, <strong> tags).`;

  try {
    console.log(`   🤖 Calling GPT-4o...`);

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userPrompt }
      ],
      temperature: 0.8,
      max_tokens: 5000 // Increased for more content + nicknames
    });

    const newContent = response.choices[0].message.content.trim();
    const namesCount = countNames(newContent);
    const uniqueNames = extractUniqueNames(newContent);

    console.log(`   ✅ Generated content with ${namesCount} name mentions (${uniqueNames.length} unique)`);

    // Validate nickname count (rough estimate)
    const nicknameMatches = newContent.match(/(nicknames?|options?|call|goes by):\s*([A-Z][a-z]+(?:,\s*[A-Z][a-z]+)+)/gi);
    const avgNicknames = nicknameMatches ? nicknameMatches.length / uniqueNames.length : 0;

    console.log(`   📝 Estimated ${nicknameMatches?.length || 0} nickname sections (avg ${avgNicknames.toFixed(1)} per name)`);

    if (uniqueNames.length < 50) {
      console.log(`   ⚠️  WARNING: Only ${uniqueNames.length} unique names - need 50+`);

      if (attemptNum < maxAttempts) {
        console.log(`   🔄 Retrying with stricter requirements...`);
        await new Promise(resolve => setTimeout(resolve, 2000));
        return await rewriteBlogPost(post, attemptNum + 1);
      } else {
        throw new Error(`Could not generate 50+ names after ${maxAttempts} attempts`);
      }
    }

    if (avgNicknames < 0.8) {
      console.log(`   ⚠️  WARNING: Not enough nickname sections detected`);

      if (attemptNum < maxAttempts) {
        console.log(`   🔄 Retrying with emphasis on nicknames...`);
        await new Promise(resolve => setTimeout(resolve, 2000));
        return await rewriteBlogPost(post, attemptNum + 1);
      }
    }

    // Calculate word count and reading time
    const words = newContent.replace(/<[^>]+>/g, ' ').split(/\s+/).filter(w => w.length > 0).length;
    const readingTime = Math.ceil(words / 200);

    return {
      content: newContent,
      stats: {
        wordCount: words,
        readingTime: readingTime,
        namesCount: uniqueNames.length,
        nicknameGroups: nicknameMatches?.length || 0
      },
      uniqueNames: uniqueNames
    };

  } catch (error) {
    console.error(`   ❌ Error:`, error.message);

    if (attemptNum < maxAttempts && !error.message.includes('after')) {
      console.log(`   🔄 Retrying in 5 seconds...`);
      await new Promise(resolve => setTimeout(resolve, 5000));
      return await rewriteBlogPost(post, attemptNum + 1);
    }

    throw error;
  }
}

async function main() {
  console.log('🚀 RESILIENT BLOG REWRITER WITH GPT-4o\n');
  console.log('Target: 50+ names per post');
  console.log('Requirement: 3+ nicknames per name');
  console.log('Model: GPT-4o (strongest LLM)\n');

  if (TEST_MODE) {
    console.log('⚙️  TEST MODE: Will process only 1 post\n');
  }

  if (RESET_PROGRESS) {
    console.log('🔄 RESET: Starting fresh (ignoring previous progress)\n');
  }

  try {
    // Load progress
    const progress = await loadProgress();

    // Fetch all published blogs
    const q = query(
      collection(db, 'blogs'),
      where('status', '==', 'published')
    );

    const snapshot = await getDocs(q);
    console.log(`📚 Found ${snapshot.size} published blogs\n`);

    const posts = [];
    snapshot.forEach(docSnapshot => {
      const data = docSnapshot.data();
      const existingNames = extractUniqueNames(data.content || '');

      // Skip if already completed
      if (progress.completedPosts.includes(docSnapshot.id)) {
        console.log(`✅ Skipping (already done): ${data.title}`);
        return;
      }

      posts.push({
        id: docSnapshot.id,
        title: data.title,
        slug: data.slug,
        category: data.category,
        content: data.content,
        existingNames: existingNames.filter(name =>
          namesChunk1.some(entry => entry.name === name)
        ),
        namesCount: existingNames.length,
        seo: data.seo,
        author: data.author,
        tags: data.tags,
        publishedAt: data.publishedAt
      });
    });

    // Sort by names count (rewrite smallest first)
    posts.sort((a, b) => a.namesCount - b.namesCount);

    // In test mode, only process first post
    const postsToProcess = TEST_MODE ? posts.slice(0, 1) : posts;

    console.log(`\n📋 WILL PROCESS ${postsToProcess.length} POSTS:`);
    postsToProcess.forEach((p, i) => {
      console.log(`   ${i + 1}. ${p.title} (${p.namesCount} → 50+)`);
    });
    console.log();

    progress.totalPosts = snapshot.size;
    await saveProgress(progress);

    const results = [];
    let successCount = 0;
    let failCount = 0;

    for (let i = 0; i < postsToProcess.length; i++) {
      const post = postsToProcess[i];

      try {
        const rewritten = await rewriteBlogPost(post);

        // Update Firestore
        const docRef = doc(db, 'blogs', post.id);
        await updateDoc(docRef, {
          content: rewritten.content,
          stats: rewritten.stats,
          updatedAt: new Date().toISOString()
        });

        console.log(`   💾 Updated in Firestore`);
        console.log(`   📊 ${post.namesCount} → ${rewritten.stats.namesCount} names`);
        console.log(`   📝 ${rewritten.stats.nicknameGroups} nickname groups`);

        results.push({
          title: post.title,
          slug: post.slug,
          before: post.namesCount,
          after: rewritten.stats.namesCount,
          words: rewritten.stats.wordCount,
          nicknameGroups: rewritten.stats.nicknameGroups,
          names: rewritten.uniqueNames
        });

        successCount++;

        // Update progress
        progress.completedPosts.push(post.id);
        progress.completedCount = successCount;
        await saveProgress(progress);

        // Rate limiting: Wait 3 seconds between requests
        if (i < postsToProcess.length - 1) {
          console.log(`   ⏳ Waiting 3s before next post...`);
          await new Promise(resolve => setTimeout(resolve, 3000));
        }

      } catch (error) {
        console.error(`   ❌ Failed: ${error.message}`);
        failCount++;

        results.push({
          title: post.title,
          slug: post.slug,
          error: error.message
        });
      }
    }

    // Final summary
    console.log(`\n${'='.repeat(80)}`);
    console.log('📊 FINAL SUMMARY\n');
    console.log(`   ✅ Successfully rewritten: ${successCount}`);
    console.log(`   ❌ Failed: ${failCount}`);
    console.log(`   📝 Total processed: ${postsToProcess.length}`);
    console.log(`   📚 Total posts in system: ${snapshot.size}\n`);

    console.log('📈 RESULTS:\n');
    results.forEach(r => {
      if (r.error) {
        console.log(`   ❌ ${r.title}: ERROR - ${r.error}`);
      } else {
        console.log(`   ✅ ${r.title}:`);
        console.log(`      ${r.before} → ${r.after} names | ${r.words} words | ${r.nicknameGroups} nickname groups`);
      }
    });

    // Save report
    const reportPath = `rewrite-report-${Date.now()}.json`;
    fs.writeFileSync(reportPath, JSON.stringify({
      completedAt: new Date().toISOString(),
      totalPosts: snapshot.size,
      processedCount: postsToProcess.length,
      successCount,
      failCount,
      results
    }, null, 2));

    console.log(`\n💾 Detailed report: ${reportPath}\n`);

    if (successCount === postsToProcess.length) {
      console.log('🎉 ALL POSTS SUCCESSFULLY REWRITTEN!\n');
    }

  } catch (error) {
    console.error('\n❌ Fatal error:', error);
    process.exit(1);
  }

  process.exit(0);
}

// Handle interruptions gracefully
process.on('SIGINT', async () => {
  console.log('\n⚠️  Interrupted! Progress has been saved to cloud.');
  console.log('Run the script again to resume from checkpoint.\n');
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n⚠️  Terminated! Progress has been saved to cloud.');
  console.log('Run the script again to resume from checkpoint.\n');
  process.exit(0);
});

main();
