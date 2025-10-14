/**
 * Blog SEO Enhancement with REAL Ahrefs MCP Data
 *
 * This script must be run BY CLAUDE CODE (not standalone Node.js)
 * because it requires access to MCP tools during execution.
 *
 * Usage: Ask Claude to run this script and it will use real Ahrefs data
 */

require('dotenv').config();
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, updateDoc, doc } = require('firebase/firestore');
const OpenAI = require('openai');

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.REACT_APP_OPENAI_API_KEY,
});

/**
 * NOTE: The Ahrefs data fetching will be done by Claude Code
 * using the MCP tools. This script handles the Firebase updates
 * and JSON-LD generation.
 */

/**
 * Generate comprehensive JSON-LD with Ahrefs insights
 */
async function generateJsonLdSchema(post, ahrefsData) {
  console.log(`   🤖 Generating JSON-LD schema with GPT-4o...`);

  const ahrefsInsight = ahrefsData ? `
Real Ahrefs SEO Data:
- Primary Keyword: "${ahrefsData.keyword}"
- Monthly Search Volume: ${ahrefsData.volume.toLocaleString()}
- Keyword Difficulty: ${ahrefsData.difficulty}/100
- Global Volume: ${ahrefsData.global_volume?.toLocaleString() || 'N/A'}
- Traffic Potential: ${ahrefsData.traffic_potential?.toLocaleString() || 'N/A'}
- Cost Per Click: $${(ahrefsData.cpc / 100).toFixed(2)}
- Search Intent: ${ahrefsData.intents ? Object.entries(ahrefsData.intents).filter(([k,v]) => v).map(([k]) => k).join(', ') : 'informational'}
- SERP Features: ${ahrefsData.serp_features?.slice(0, 5).join(', ') || 'standard'}
- Parent Topic: ${ahrefsData.parent_topic || 'None'}
` : 'No Ahrefs data available';

  const prompt = `Generate comprehensive JSON-LD structured data for this baby names blog post.

Blog Details:
- Title: ${post.title}
- Category: ${post.category}
- Tags: ${post.tags.join(', ')}
- Author: ${post.author.name}
- Published: ${new Date(post.publishedAt).toISOString()}

${ahrefsInsight}

Create these JSON-LD schemas (2025 best practices):

1. Article/BlogPosting Schema
2. BreadcrumbList Schema
3. FAQPage Schema (3-5 relevant FAQs)
4. WebPage Schema
5. Organization Schema (publisher)

Return ONLY a valid JSON array. No markdown, no explanations.`;

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: 'You are an SEO expert. Return only valid JSON arrays of schema.org objects.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.3,
      max_tokens: 2500,
    });

    let schemaText = completion.choices[0].message.content.trim();
    schemaText = schemaText.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();

    const schemas = JSON.parse(schemaText);
    console.log(`   ✅ Generated ${Array.isArray(schemas) ? schemas.length : 1} schemas`);
    return Array.isArray(schemas) ? schemas : [schemas];

  } catch (error) {
    console.error(`   ❌ Error generating JSON-LD:`, error.message);
    return [{
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      "headline": post.title,
      "author": { "@type": "Person", "name": post.author.name }
    }];
  }
}

/**
 * Generate E-E-A-T author bio
 */
async function generateAuthorBio(authorName, category) {
  console.log(`   👤 Generating author bio...`);

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: 'Generate professional 2-3 sentence author bios emphasizing E-E-A-T signals.',
        },
        {
          role: 'user',
          content: `Write a bio for ${authorName}, expert in ${category}, focusing on baby names and parenting.`,
        },
      ],
      temperature: 0.7,
      max_tokens: 150,
    });

    return completion.choices[0].message.content.trim();
  } catch (error) {
    return `${authorName} is an experienced writer specializing in baby names and parenting.`;
  }
}

/**
 * Update a blog post with Ahrefs data and complete SEO
 */
async function updateBlogWithAhrefsData(post, ahrefsData) {
  console.log(`\n${'='.repeat(70)}`);
  console.log(`📝 Processing: "${post.title}"`);

  if (ahrefsData) {
    console.log(`   ✅ Real Ahrefs Data Received:`);
    console.log(`      - Keyword: "${ahrefsData.keyword}"`);
    console.log(`      - Volume: ${ahrefsData.volume.toLocaleString()}/month`);
    console.log(`      - Difficulty: ${ahrefsData.difficulty}/100`);
    console.log(`      - CPC: $${(ahrefsData.cpc / 100).toFixed(2)}`);
  } else {
    console.log(`   ⚠️  No Ahrefs data for this post`);
  }

  // Generate JSON-LD with Ahrefs insights
  const jsonLdSchemas = await generateJsonLdSchema(post, ahrefsData);

  // Generate author bio
  const authorBio = await generateAuthorBio(post.author.name, post.category);

  // Calculate stats
  const wordCount = post.content.split(/\s+/).length;
  const readingTime = Math.ceil(wordCount / 200);

  // Build complete SEO object
  const enhancedSeo = {
    metaTitle: post.seo?.metaTitle || `${post.title} | SoulSeed`,
    metaDescription: post.seo?.metaDescription || post.excerpt.substring(0, 155),
    keywords: post.seo?.keywords || [post.title, post.category, ...post.tags],

    schema: jsonLdSchemas,

    openGraph: {
      type: 'article',
      title: post.title,
      description: post.excerpt,
      url: `https://amirchason.github.io/babyname2/blog/${post.slug}`,
      siteName: 'SoulSeed',
      locale: 'en_US',
      article: {
        publishedTime: new Date(post.publishedAt).toISOString(),
        modifiedTime: new Date(post.updatedAt).toISOString(),
        author: post.author.name,
        section: post.category,
        tags: post.tags,
      },
    },

    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.excerpt.substring(0, 200),
      site: '@SoulSeedApp',
    },

    canonicalUrl: `https://amirchason.github.io/babyname2/blog/${post.slug}`,

    robots: {
      index: true,
      follow: true,
      maxSnippet: -1,
      maxImagePreview: 'large',
    },

    // Real Ahrefs data (if available)
    ...(ahrefsData && {
      ahrefs: {
        keyword: ahrefsData.keyword,
        volume: ahrefsData.volume,
        difficulty: ahrefsData.difficulty,
        cpc: ahrefsData.cpc,
        clicks: ahrefsData.clicks,
        globalVolume: ahrefsData.global_volume,
        trafficPotential: ahrefsData.traffic_potential,
        intents: ahrefsData.intents,
        serpFeatures: ahrefsData.serp_features,
        parentTopic: ahrefsData.parent_topic,
        lastUpdated: new Date().toISOString(),
      },
    }),
  };

  const enhancedAuthor = {
    name: post.author.name,
    credentials: post.author.credentials || 'Baby Names Expert',
    bio: authorBio,
  };

  const enhancedStats = {
    wordCount,
    readingTime,
    lastUpdated: Date.now(),
  };

  // Update Firestore
  try {
    const docRef = doc(db, 'blogs', post.id);
    await updateDoc(docRef, {
      seo: enhancedSeo,
      author: enhancedAuthor,
      stats: enhancedStats,
      updatedAt: Date.now(),
    });

    console.log(`   ✅ Updated in Firestore successfully`);
    return { success: true, hasAhrefs: !!ahrefsData };
  } catch (error) {
    console.error(`   ❌ Firestore error:`, error.message);
    return { success: false };
  }
}

/**
 * Main function - expects Ahrefs data to be passed in
 */
async function main(ahrefsDataMap = {}) {
  console.log('\n' + '='.repeat(70));
  console.log('🚀 BLOG SEO ENHANCEMENT WITH REAL AHREFS DATA');
  console.log('='.repeat(70));

  try {
    console.log('\n📚 Fetching blog posts...');
    const blogsRef = collection(db, 'blogs');
    const snapshot = await getDocs(blogsRef);
    const posts = snapshot.docs
      .map(doc => ({ id: doc.id, ...doc.data() }))
      .filter(post => post.status === 'published');

    console.log(`✅ Found ${posts.length} published posts\n`);

    const results = {
      total: posts.length,
      successful: 0,
      failed: 0,
      withAhrefs: 0,
    };

    for (let i = 0; i < posts.length; i++) {
      const post = posts[i];
      console.log(`[${i + 1}/${posts.length}]`);

      // Get Ahrefs data for this post (if provided)
      const primaryKeyword = post.seo?.keywords?.[0] || post.title;
      const ahrefsData = ahrefsDataMap[post.id] || null;

      const result = await updateBlogWithAhrefsData(post, ahrefsData);

      if (result.success) {
        results.successful++;
        if (result.hasAhrefs) results.withAhrefs++;
      } else {
        results.failed++;
      }

      // Rate limit
      if (i < posts.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }

    console.log('\n' + '='.repeat(70));
    console.log('✅ ENHANCEMENT COMPLETE\n');
    console.log(`   Total: ${results.total}`);
    console.log(`   ✅ Success: ${results.successful}`);
    console.log(`   ❌ Failed: ${results.failed}`);
    console.log(`   📊 With Real Ahrefs Data: ${results.withAhrefs}`);
    console.log('='.repeat(70));

  } catch (error) {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  }
}

// Export for Claude to call with Ahrefs data
module.exports = { main, updateBlogWithAhrefsData };

// If run standalone, proceed without Ahrefs data
if (require.main === module) {
  console.log('\n⚠️  Running standalone - Ahrefs data will not be included');
  console.log('💡 For real Ahrefs data, this must be orchestrated by Claude Code\n');
  main({});
}
