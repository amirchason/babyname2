/**
 * Complete Blog SEO Enhancement Script
 *
 * Implements 2025 SEO Best Practices:
 * - Complete JSON-LD structured data (Article, BreadcrumbList, FAQPage, WebPage, Organization)
 * - Enhanced Open Graph meta tags
 * - Twitter Card optimization
 * - Author E-E-A-T signals (Experience, Expertise, Authoritativeness, Trustworthiness)
 * - Canonical URLs
 * - Reading time and word count stats
 *
 * ⚠️ NOTE: Ahrefs MCP integration is documented but not active due to API unavailability
 * The script will enhance SEO with all available data and leave hooks for Ahrefs integration
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
 * Generate comprehensive JSON-LD structured data using GPT-4o
 * Follows 2025 SEO best practices
 */
async function generateJsonLdSchema(post) {
  console.log(`   🤖 Generating JSON-LD schema with GPT-4o...`);

  const prompt = `Generate comprehensive JSON-LD structured data for a blog post about baby names following 2025 SEO best practices.

Blog Post Details:
- Title: ${post.title}
- Excerpt: ${post.excerpt}
- Category: ${post.category}
- Tags: ${post.tags.join(', ')}
- Author: ${post.author.name}
- Published: ${new Date(post.publishedAt).toISOString()}
- Updated: ${new Date(post.updatedAt).toISOString()}
- Word Count: ${post.stats?.wordCount || Math.floor(post.content.split(' ').length)}
- Reading Time: ${post.stats?.readingTime || Math.ceil(post.content.split(' ').length / 200)} minutes
- URL: https://amirchason.github.io/babyname2/blog/${post.slug}

Create these JSON-LD schemas:

1. **Article Schema** (BlogPosting)
   - Complete author object with name and url
   - Publisher: SoulSeed with logo
   - Image (use placeholder or extract from content)
   - datePublished, dateModified (ISO 8601)
   - headline, description, articleBody (excerpt)
   - wordCount, timeRequired (ISO 8601 duration format: PT5M)
   - mainEntityOfPage

2. **BreadcrumbList Schema**
   - Home → Blog → [Category] → [Article Title]
   - Proper position indexing (1, 2, 3, 4)

3. **FAQPage Schema**
   - Create 3-5 relevant FAQ items based on blog topic
   - Each with question and acceptedAnswer

4. **WebPage Schema**
   - name, description, url
   - breadcrumb reference
   - about the blog topic

5. **Organization Schema** (for publisher)
   - Name: SoulSeed
   - Description: Baby name discovery and inspiration platform
   - URL: https://amirchason.github.io/babyname2
   - logo
   - sameAs: social media links

IMPORTANT:
- Use proper @context: "https://schema.org"
- Use ISO 8601 date formats
- Use PT notation for durations (e.g., "PT5M" for 5 minutes)
- Include proper @type for each schema
- Ensure all URLs are absolute
- Make FAQs specific and relevant to the blog topic

Return ONLY a valid JSON array of schema objects. No markdown, no explanation, just pure JSON.`;

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: 'You are an expert SEO specialist focused on JSON-LD structured data. You always return valid JSON arrays of schema.org objects following 2025 best practices. Never use markdown formatting.',
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

    // Clean up any markdown formatting
    schemaText = schemaText
      .replace(/```json\s*/g, '')
      .replace(/```\s*/g, '')
      .trim();

    const schemas = JSON.parse(schemaText);
    console.log(`   ✅ Generated ${Array.isArray(schemas) ? schemas.length : 1} JSON-LD schema(s)`);
    return Array.isArray(schemas) ? schemas : [schemas];

  } catch (error) {
    console.error(`   ❌ Error generating JSON-LD:`, error.message);

    // Return basic fallback schema
    return [{
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      "headline": post.title,
      "description": post.excerpt,
      "author": {
        "@type": "Person",
        "name": post.author.name
      },
      "datePublished": new Date(post.publishedAt).toISOString(),
      "dateModified": new Date(post.updatedAt).toISOString()
    }];
  }
}

/**
 * Generate enhanced author bio using GPT-4o
 * Emphasizes E-E-A-T signals
 */
async function generateAuthorBio(authorName, category) {
  console.log(`   👤 Generating E-E-A-T author bio for ${authorName}...`);

  const prompt = `Generate a professional author bio for ${authorName}, an expert writer in the ${category} category for a baby names website.

Requirements:
- 2-3 sentences maximum
- Emphasize E-E-A-T signals:
  * Experience: Years of work in parenting/baby naming
  * Expertise: Specific knowledge areas (etymology, cultural naming, trends)
  * Authoritativeness: Publications, research, certifications
  * Trustworthiness: Fact-checking, sources, credentials
- Written in third person
- Professional but warm tone
- Specific to baby names and parenting niche

Return only the bio text with no quotes or formatting.`;

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: 'You are a professional copywriter specializing in author biographies that emphasize E-E-A-T signals for SEO.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 150,
    });

    const bio = completion.choices[0].message.content.trim();
    console.log(`   ✅ Generated author bio`);
    return bio;

  } catch (error) {
    console.error(`   ❌ Error generating author bio:`, error.message);
    return `${authorName} is an experienced writer and researcher specializing in baby names, parenting, and family topics with expertise in cultural naming traditions and modern naming trends.`;
  }
}

/**
 * Enhance a single blog post with complete 2025 SEO best practices
 */
async function enhanceBlogPost(post) {
  console.log(`\n${'='.repeat(70)}`);
  console.log(`📝 Processing: "${post.title}"`);
  console.log(`   ID: ${post.id}`);
  console.log(`   Slug: ${post.slug}`);
  console.log(`   Category: ${post.category}`);
  console.log(`   Tags: ${post.tags.join(', ')}`);

  // Step 1: Generate comprehensive JSON-LD schemas
  const jsonLdSchemas = await generateJsonLdSchema(post);

  // Step 2: Generate enhanced author bio with E-E-A-T signals
  const authorBio = await generateAuthorBio(post.author.name, post.category);

  // Step 3: Calculate accurate stats
  const wordCount = post.content.split(/\s+/).length;
  const readingTime = Math.ceil(wordCount / 200); // 200 words per minute

  // Step 4: Build complete SEO object following 2025 best practices
  const enhancedSeo = {
    // Existing meta tags
    metaTitle: post.seo?.metaTitle || `${post.title} | SoulSeed Baby Names`,
    metaDescription: post.seo?.metaDescription || post.excerpt.substring(0, 155),
    keywords: post.seo?.keywords || [post.title, post.category, ...post.tags],

    // ✅ JSON-LD structured data (2025 best practice)
    schema: jsonLdSchemas,

    // ✅ Open Graph meta tags (complete implementation)
    openGraph: {
      type: 'article',
      title: post.title,
      description: post.excerpt,
      url: `https://amirchason.github.io/babyname2/blog/${post.slug}`,
      siteName: 'SoulSeed - Baby Name Discovery',
      locale: 'en_US',
      image: {
        url: 'https://amirchason.github.io/babyname2/og-image.jpg', // TODO: Add actual image
        width: 1200,
        height: 630,
        alt: post.title,
      },
      article: {
        publishedTime: new Date(post.publishedAt).toISOString(),
        modifiedTime: new Date(post.updatedAt).toISOString(),
        author: post.author.name,
        section: post.category,
        tags: post.tags,
      },
    },

    // ✅ Twitter Card meta tags
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.excerpt.substring(0, 200),
      image: 'https://amirchason.github.io/babyname2/og-image.jpg', // TODO: Add actual image
      site: '@SoulSeedApp',
      creator: '@SoulSeedApp',
    },

    // ✅ Canonical URL (prevent duplicate content)
    canonicalUrl: `https://amirchason.github.io/babyname2/blog/${post.slug}`,

    // ✅ Robots meta directives
    robots: {
      index: true,
      follow: true,
      maxSnippet: -1,
      maxImagePreview: 'large',
      maxVideoPreview: -1,
    },

    // 📝 Placeholder for Ahrefs data (to be added when API is available)
    ahrefs: {
      status: 'pending',
      note: 'Ahrefs keyword data will be added when API credentials are configured',
      requiredFields: [
        'volume',
        'difficulty',
        'cpc',
        'traffic_potential',
        'clicks',
        'global_volume',
        'intent',
        'serp_features'
      ],
    },
  };

  // Step 5: Build enhanced author object with E-E-A-T signals
  const enhancedAuthor = {
    name: post.author.name,
    credentials: post.author.credentials || 'Baby Names & Parenting Expert',
    bio: authorBio,
    url: `https://amirchason.github.io/babyname2/authors/${post.author.name.toLowerCase().replace(/\s+/g, '-')}`,
  };

  // Step 6: Complete and accurate stats
  const enhancedStats = {
    wordCount: wordCount,
    readingTime: readingTime,
    lastUpdated: Date.now(),
  };

  // Step 7: Update Firestore with all enhancements
  try {
    const docRef = doc(db, 'blogs', post.id);
    await updateDoc(docRef, {
      seo: enhancedSeo,
      author: enhancedAuthor,
      stats: enhancedStats,
      updatedAt: Date.now(),
    });

    console.log(`   ✅ Successfully updated in Firestore`);
    console.log(`   📊 SEO Enhancements:`);
    console.log(`      - JSON-LD schemas: ${jsonLdSchemas.length}`);
    console.log(`      - Open Graph: ✅ Complete`);
    console.log(`      - Twitter Card: ✅ Complete`);
    console.log(`      - Author E-E-A-T: ✅ Enhanced`);
    console.log(`      - Canonical URL: ✅ Set`);
    console.log(`      - Robots meta: ✅ Configured`);
    console.log(`      - Word count: ${wordCount}`);
    console.log(`      - Reading time: ${readingTime} min`);
    console.log(`      - Ahrefs data: ⏳ Pending API setup`);

    return {
      success: true,
      schemasCount: jsonLdSchemas.length,
      wordCount,
      readingTime,
    };

  } catch (error) {
    console.error(`   ❌ Error updating Firestore:`, error.message);
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Main execution function
 */
async function main() {
  console.log('\n' + '='.repeat(70));
  console.log('🚀 COMPLETE BLOG SEO ENHANCEMENT - 2025 BEST PRACTICES');
  console.log('='.repeat(70));
  console.log('\n📋 Enhancements included:');
  console.log('   ✅ Complete JSON-LD structured data (Article, BreadcrumbList, FAQPage, etc.)');
  console.log('   ✅ Full Open Graph meta tags');
  console.log('   ✅ Twitter Card optimization');
  console.log('   ✅ Author E-E-A-T signals (Experience, Expertise, Authority, Trust)');
  console.log('   ✅ Canonical URLs');
  console.log('   ✅ Robots meta directives');
  console.log('   ✅ Accurate word count and reading time');
  console.log('   ⏳ Ahrefs integration (pending API setup)\n');
  console.log('='.repeat(70));

  try {
    // Fetch all published blog posts
    console.log('\n📚 Fetching blog posts from Firestore...');
    const blogsRef = collection(db, 'blogs');
    const snapshot = await getDocs(blogsRef);
    const posts = snapshot.docs
      .map(doc => ({ id: doc.id, ...doc.data() }))
      .filter(post => post.status === 'published');

    console.log(`✅ Found ${posts.length} published blog posts\n`);

    // Process each blog post
    const results = {
      total: posts.length,
      successful: 0,
      failed: 0,
      totalSchemas: 0,
      totalWords: 0,
    };

    for (let i = 0; i < posts.length; i++) {
      const post = posts[i];
      console.log(`\n[${i + 1}/${posts.length}]`);

      const result = await enhanceBlogPost(post);

      if (result.success) {
        results.successful++;
        results.totalSchemas += result.schemasCount;
        results.totalWords += result.wordCount;
      } else {
        results.failed++;
      }

      // Rate limiting: Wait 2 seconds between posts to avoid API limits
      if (i < posts.length - 1) {
        console.log(`\n   ⏳ Waiting 2 seconds before next post...`);
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }

    // Final summary
    console.log('\n' + '='.repeat(70));
    console.log('✅ SEO ENHANCEMENT COMPLETE!\n');
    console.log('📊 Final Summary:');
    console.log(`   Total Posts Processed: ${results.total}`);
    console.log(`   ✅ Successful: ${results.successful}`);
    console.log(`   ❌ Failed: ${results.failed}`);
    console.log(`   📄 Total JSON-LD Schemas Created: ${results.totalSchemas}`);
    console.log(`   📝 Total Words Analyzed: ${results.totalWords.toLocaleString()}`);
    console.log(`   ⏳ Ahrefs Integration: Pending (API credentials needed)`);
    console.log('\n💡 Next Steps:');
    console.log('   1. ✅ Test blog posts in browser - verify meta tags in <head>');
    console.log('   2. ✅ Use Google Rich Results Test: https://search.google.com/test/rich-results');
    console.log('   3. ✅ Validate JSON-LD with Schema.org validator');
    console.log('   4. ⏳ Configure Ahrefs API credentials to add keyword data');
    console.log('   5. ✅ Monitor Google Search Console for indexing improvements');
    console.log('   6. ✅ Check Open Graph preview: https://www.opengraph.xyz/');
    console.log('   7. ✅ Test Twitter Card: https://cards-dev.twitter.com/validator');
    console.log('\n📖 To add Ahrefs data later:');
    console.log('   - Configure Ahrefs MCP server credentials');
    console.log('   - Re-run this script or use separate Ahrefs enrichment script');
    console.log('='.repeat(70));

  } catch (error) {
    console.error('\n❌ Fatal error:', error);
    console.error(error.stack);
    process.exit(1);
  }
}

// Run the script
main();
