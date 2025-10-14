/**
 * CLOUD-BASED BLOG REWRITER SERVICE
 *
 * Firebase Cloud Function for rewriting blog posts with GPT-4o
 * Runs independently in the cloud for maximum reliability
 *
 * Features:
 * - Minimum 50 names per post
 * - 3+ cute nicknames per name
 * - Witty, sensitive, spiritual guidance
 * - Mobile-optimized formatting
 * - Auto-retry on failure
 * - Progress tracking in Firestore
 */

const functions = require('firebase-functions');
const admin = require('firebase-admin');
const OpenAI = require('openai');

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();
const openai = new OpenAI({
  apiKey: functions.config().openai.key
});

// System prompt for blog rewriting
const SYSTEM_PROMPT = `You are an expert baby name writer creating beautiful, spiritual, and witty blog posts.

CRITICAL REQUIREMENTS:
1. Include EXACTLY 50+ unique baby names (count them!)
2. Format ALL names as: <strong>Name</strong>
3. Add 3+ cute nickname suggestions after EACH name (e.g., "Luna (Lulu, Lu-Lu, Lunita)")
4. Write with warmth, sensitivity, and spiritual insight
5. Mobile-first formatting (short paragraphs, 2-3 sentences max)
6. Spread names EVENLY throughout the entire article
7. Make it engaging, witty, and heartfelt

NICKNAME REQUIREMENTS:
- At LEAST 3 nicknames per name
- Make them cute, creative, and diverse
- Include traditional, modern, and playful variations
- Examples:
  * Isabella (Bella, Izzy, Belle, Isa, Sabelita)
  * Alexander (Alex, Xander, Lex, Sasha, Alec)
  * Seraphina (Sera, Phina, Raffy, Fifi, Seffy)

STRUCTURE:
- Opening: Set the tone (2-3 short paragraphs)
- Body: Present names in themed sections (5-8 names per section)
- Each name gets:
  * Name meaning/origin (1 sentence)
  * Why it's special (1 sentence)
  * 3+ nickname options (comma-separated)
- Smooth transitions between sections
- Heartwarming conclusion (2-3 paragraphs)

STYLE GUIDELINES:
- Write like you're talking to a close friend
- Use spiritual/meaningful language when appropriate
- Short paragraphs (mobile-friendly!)
- Include h2 section headers for each theme
- Add the <!-- BLOG_NAME_LIST_COMPONENT --> placeholder at the very end

FORMATTING EXAMPLE:
<h2>✨ Luminous Choices</h2>

<p><strong>Aurora</strong> — The goddess of dawn brings light to new beginnings. Perfect for a little one who'll brighten your world every morning.</p>

<p>Sweet nicknames: Rory, Aura, Rora, Ori, Rorie</p>

<p><strong>Lucia</strong> — This Italian beauty means "light" and carries centuries of grace. A timeless choice that never goes out of style.</p>

<p>Adorable options: Lucy, Luce, Cia, Lu-Lu, Lulu</p>

REMEMBER:
- Count your names! You MUST include 50+ unique names minimum.
- EVERY name needs 3+ nickname suggestions
- Keep paragraphs SHORT for mobile reading`;

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

async function rewriteSinglePost(postId, postData, existingNames) {
  console.log(`Rewriting: ${postData.title}`);
  console.log(`Current names: ${postData.namesCount || 0}`);

  const userPrompt = `Rewrite this blog post with MINIMUM 50 unique baby names:

TITLE: ${postData.title}
CATEGORY: ${postData.category}
SLUG: ${postData.slug}

CURRENT CONTENT (${postData.namesCount || 0} names - TOO FEW!):
${postData.content}

REQUIREMENTS:
- Include 50+ unique names (count them!)
- Add 3+ CUTE NICKNAMES for EACH name
- Keep the same title and theme
- Mobile-friendly formatting (short paragraphs, 2-3 sentences)
- Witty, sensitive, spiritual tone
- Spread names evenly throughout
- Add <!-- BLOG_NAME_LIST_COMPONENT --> at the very end
- Use these database names when possible: ${existingNames.slice(0, 20).join(', ')}...

NICKNAME EXAMPLES:
- Olivia (Livvy, Liv, Ollie, Via, Livi)
- Benjamin (Ben, Benny, Benji, Benj, Jamie)
- Seraphina (Sera, Phina, Raffy, Fifi, Seffy)

Write the complete HTML content (no markdown, pure HTML with <h2>, <p>, <strong> tags).`;

  let attempt = 0;
  const maxAttempts = 3;

  while (attempt < maxAttempts) {
    try {
      console.log(`Attempt ${attempt + 1}/${maxAttempts}: Calling GPT-4o...`);

      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: userPrompt }
        ],
        temperature: 0.8,
        max_tokens: 5000 // Increased for more content
      });

      const newContent = response.choices[0].message.content.trim();
      const namesCount = countNames(newContent);
      const uniqueNames = extractUniqueNames(newContent);

      console.log(`Generated: ${namesCount} mentions (${uniqueNames.length} unique)`);

      if (uniqueNames.length < 50) {
        console.log(`⚠️ Only ${uniqueNames.length} unique names - retrying...`);
        attempt++;
        continue;
      }

      // Calculate word count and reading time
      const words = newContent.replace(/<[^>]+>/g, ' ').split(/\s+/).filter(w => w.length > 0).length;
      const readingTime = Math.ceil(words / 200);

      // Update Firestore
      await db.collection('blogs').doc(postId).update({
        content: newContent,
        stats: {
          wordCount: words,
          readingTime: readingTime,
          namesCount: uniqueNames.length
        },
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });

      console.log(`✅ Updated: ${postData.title} (${uniqueNames.length} names)`);

      return {
        success: true,
        postId,
        title: postData.title,
        before: postData.namesCount || 0,
        after: uniqueNames.length,
        words: words,
        names: uniqueNames
      };

    } catch (error) {
      console.error(`Attempt ${attempt + 1} failed:`, error.message);
      attempt++;

      if (attempt >= maxAttempts) {
        throw new Error(`Failed after ${maxAttempts} attempts: ${error.message}`);
      }

      // Wait before retry
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
  }

  throw new Error(`Failed to generate content with 50+ names after ${maxAttempts} attempts`);
}

// Cloud Function: Rewrite all blog posts
exports.rewriteAllBlogs = functions
  .runWith({
    timeoutSeconds: 540, // 9 minutes max
    memory: '1GB'
  })
  .https.onRequest(async (req, res) => {
    try {
      console.log('🚀 Starting blog rewriting service...');

      // Fetch all published blogs
      const snapshot = await db.collection('blogs')
        .where('status', '==', 'published')
        .get();

      console.log(`📚 Found ${snapshot.size} published blogs`);

      const posts = [];
      snapshot.forEach(doc => {
        const data = doc.data();
        const existingNames = extractUniqueNames(data.content || '');

        posts.push({
          id: doc.id,
          data: {
            ...data,
            namesCount: existingNames.length
          },
          existingNames
        });
      });

      // Sort by names count (rewrite smallest first)
      posts.sort((a, b) => a.data.namesCount - b.data.namesCount);

      console.log('📋 Processing order:');
      posts.forEach((p, i) => {
        console.log(`   ${i + 1}. ${p.data.title} (${p.data.namesCount} → 50+)`);
      });

      const results = [];
      let successCount = 0;
      let failCount = 0;

      // Process each post
      for (let i = 0; i < posts.length; i++) {
        const post = posts[i];

        try {
          const result = await rewriteSinglePost(post.id, post.data, post.existingNames);
          results.push(result);
          successCount++;

          // Rate limiting: 3 seconds between posts
          if (i < posts.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 3000));
          }

        } catch (error) {
          console.error(`❌ Failed: ${post.data.title}`, error.message);
          results.push({
            success: false,
            postId: post.id,
            title: post.data.title,
            error: error.message
          });
          failCount++;
        }
      }

      // Save summary to Firestore
      await db.collection('system').doc('blog-rewrite-summary').set({
        completedAt: admin.firestore.FieldValue.serverTimestamp(),
        totalPosts: posts.length,
        successCount,
        failCount,
        results
      });

      console.log('✅ Rewriting complete!');
      console.log(`   Success: ${successCount}`);
      console.log(`   Failed: ${failCount}`);

      res.status(200).json({
        success: true,
        totalPosts: posts.length,
        successCount,
        failCount,
        results
      });

    } catch (error) {
      console.error('❌ Fatal error:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

// Cloud Function: Rewrite single blog post (for testing)
exports.rewriteSingleBlog = functions
  .runWith({
    timeoutSeconds: 120,
    memory: '512MB'
  })
  .https.onRequest(async (req, res) => {
    try {
      const { postId } = req.query;

      if (!postId) {
        res.status(400).json({ error: 'Missing postId parameter' });
        return;
      }

      console.log(`📝 Rewriting post: ${postId}`);

      const doc = await db.collection('blogs').doc(postId).get();

      if (!doc.exists) {
        res.status(404).json({ error: 'Post not found' });
        return;
      }

      const data = doc.data();
      const existingNames = extractUniqueNames(data.content || '');

      const result = await rewriteSinglePost(postId, { ...data, namesCount: existingNames.length }, existingNames);

      res.status(200).json({
        success: true,
        result
      });

    } catch (error) {
      console.error('❌ Error:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

// Cloud Scheduler: Run automatically (optional)
exports.scheduledBlogRewrite = functions.pubsub
  .schedule('0 2 * * 0') // Every Sunday at 2 AM
  .timeZone('America/New_York')
  .onRun(async (context) => {
    console.log('🔄 Scheduled blog rewrite starting...');

    // Check if rewrite is needed
    const snapshot = await db.collection('blogs')
      .where('status', '==', 'published')
      .where('stats.namesCount', '<', 50)
      .get();

    if (snapshot.empty) {
      console.log('✅ All posts have 50+ names - skipping');
      return null;
    }

    console.log(`📚 Found ${snapshot.size} posts needing rewrite`);

    // Trigger the rewrite function
    // (Implementation would call rewriteAllBlogs internally)

    return null;
  });
