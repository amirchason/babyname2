/**
 * REWRITE ALL BLOG POSTS WITH GPT-4o
 *
 * Requirements:
 * - Minimum 50 names per post
 * - Cute nickname suggestions for each name
 * - Witty, sensitive, spiritual guidance
 * - Mobile-optimized formatting
 * - Names spread evenly throughout article
 * - Top-quality writing
 */

const { initializeApp } = require('firebase/app');
const { getFirestore, collection, query, where, getDocs, doc, updateDoc } = require('firebase/firestore');
const OpenAI = require('openai');
const fs = require('fs');
require('dotenv').config();

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

// System prompt for blog rewriting
const SYSTEM_PROMPT = `You are an expert baby name writer creating beautiful, spiritual, and witty blog posts.

CRITICAL REQUIREMENTS:
1. Include EXACTLY 50+ unique baby names (count them!)
2. Format ALL names as: <strong>Name</strong>
3. Add cute nickname suggestions after each name (e.g., "Luna (Lulu, Lu-Lu)")
4. Write with warmth, sensitivity, and spiritual insight
5. Mobile-first formatting (short paragraphs, 2-3 sentences max)
6. Spread names EVENLY throughout the entire article
7. Make it engaging, witty, and heartfelt

STRUCTURE:
- Opening: Set the tone (2-3 paragraphs)
- Body: Present names in themed sections (5-8 names per section)
- Each name gets 1-2 sentences + nickname suggestions
- Transitions between sections (smooth, natural)
- Closing: Heartwarming conclusion

STYLE GUIDELINES:
- Write like you're talking to a close friend
- Use spiritual/meaningful language when appropriate
- Short paragraphs (mobile-friendly!)
- Include h2 section headers
- Add the <!-- BLOG_NAME_LIST_COMPONENT --> placeholder at the very end

FORMATTING EXAMPLE:
<h2>✨ Luminous Choices</h2>

<p><strong>Aurora</strong> — The goddess of dawn brings light to new beginnings. Perfect for a little one who'll brighten your world every morning. Sweet nicknames: Rory, Aura, Rora.</p>

<p><strong>Lucia</strong> — This Italian beauty means "light" and carries centuries of grace. Your Lucia might go by Lucy, Luce, or Cia.</p>

REMEMBER: Count your names! You MUST include 50+ names minimum.`;

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

async function rewriteBlogPost(post) {
  console.log(`\n${'='.repeat(80)}`);
  console.log(`📝 Rewriting: ${post.title}`);
  console.log(`   Current names: ${post.namesCount}`);
  console.log(`   Target: 50+ names`);

  const userPrompt = `Rewrite this blog post with MINIMUM 50 unique baby names:

TITLE: ${post.title}
CATEGORY: ${post.category}
SLUG: ${post.slug}

CURRENT CONTENT (${post.namesCount} names - TOO FEW!):
${post.content}

REQUIREMENTS:
- Include 50+ unique names (count them!)
- Add cute nicknames for each name
- Keep the same title and theme
- Mobile-friendly formatting (short paragraphs)
- Witty, sensitive, spiritual tone
- Spread names evenly throughout
- Add <!-- BLOG_NAME_LIST_COMPONENT --> at the very end
- Use database names when possible: ${post.existingNames.slice(0, 20).join(', ')}...

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
      max_tokens: 4000
    });

    const newContent = response.choices[0].message.content.trim();
    const namesCount = countNames(newContent);
    const uniqueNames = extractUniqueNames(newContent);

    console.log(`   ✅ Generated content with ${namesCount} name mentions (${uniqueNames.length} unique)`);

    if (uniqueNames.length < 50) {
      console.log(`   ⚠️  WARNING: Only ${uniqueNames.length} unique names - retrying...`);
      return await rewriteBlogPost(post); // Retry
    }

    // Calculate word count and reading time
    const words = newContent.replace(/<[^>]+>/g, ' ').split(/\s+/).filter(w => w.length > 0).length;
    const readingTime = Math.ceil(words / 200);

    return {
      content: newContent,
      stats: {
        wordCount: words,
        readingTime: readingTime,
        namesCount: uniqueNames.length
      },
      uniqueNames: uniqueNames
    };

  } catch (error) {
    console.error(`   ❌ Error:`, error.message);
    throw error;
  }
}

async function main() {
  console.log('🚀 Blog Rewriting with GPT-4o\n');
  console.log('Target: 50+ names per post');
  console.log('Model: GPT-4o (strongest LLM)\n');

  try {
    // Fetch all published blogs
    const q = query(
      collection(db, 'blogs'),
      where('status', '==', 'published')
    );

    const snapshot = await getDocs(q);
    console.log(`📚 Found ${snapshot.size} published blogs\n`);

    const posts = [];
    snapshot.forEach(doc => {
      const data = doc.data();
      const existingNames = extractUniqueNames(data.content);

      posts.push({
        id: doc.id,
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

    console.log('📋 REWRITING ORDER:');
    posts.forEach((p, i) => {
      console.log(`   ${i + 1}. ${p.title} (${p.namesCount} → 50+)`);
    });
    console.log();

    const results = [];
    let successCount = 0;
    let failCount = 0;

    for (let i = 0; i < posts.length; i++) {
      const post = posts[i];

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

        results.push({
          title: post.title,
          slug: post.slug,
          before: post.namesCount,
          after: rewritten.stats.namesCount,
          words: rewritten.stats.wordCount,
          names: rewritten.uniqueNames
        });

        successCount++;

        // Rate limiting: Wait 3 seconds between requests
        if (i < posts.length - 1) {
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
    console.log(`   📝 Total posts: ${posts.length}\n`);

    console.log('📈 BEFORE → AFTER:\n');
    results.forEach(r => {
      if (r.error) {
        console.log(`   ❌ ${r.title}: ERROR`);
      } else {
        console.log(`   ✅ ${r.title}: ${r.before} → ${r.after} names (${r.words} words)`);
      }
    });

    // Save report
    fs.writeFileSync('rewrite-report.json', JSON.stringify(results, null, 2));
    console.log(`\n💾 Detailed report: rewrite-report.json\n`);

  } catch (error) {
    console.error('❌ Fatal error:', error);
  }

  process.exit(0);
}

main();
