/**
 * Add comprehensive SEO meta tags to all Baby Names blog posts
 * Based on 2025 SEO best practices research
 */

const { initializeApp } = require('firebase/app');
const { getFirestore, collection, query, where, getDocs, doc, updateDoc } = require('firebase/firestore');
const fs = require('fs');

const firebaseConfig = {
  apiKey: "AIzaSyCydKy79vU999mXO60x-mmg8MRuozPCqqE",
  authDomain: "babynames-app-9fa2a.firebaseapp.com",
  projectId: "babynames-app-9fa2a",
  storageBucket: "babynames-app-9fa2a.appspot.com",
  messagingSenderId: "792099154161",
  appId: "1:792099154161:web:1a5b0d4e7f8c9d0e1f2a3b"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Base URL for the site
const BASE_URL = 'https://amirchason.github.io/babyname2';
const SITE_NAME = 'SoulSeed - Baby Name Finder';
const DEFAULT_IMAGE = `${BASE_URL}/og-image-default.jpg`; // TODO: Create default OG image

/**
 * Generate comprehensive SEO meta tags for a blog post
 */
function generateMetaTags(blog, nameCount) {
  const slug = blog.slug;
  const title = blog.title;
  const baseUrl = `${BASE_URL}/blog/${slug}`;

  // Extract first 150 chars from content as base for description
  const contentText = blog.content ? blog.content.replace(/<[^>]+>/g, ' ').trim() : '';

  // Generate optimized meta description (150-160 chars)
  const metaDescription = generateMetaDescription(title, nameCount, contentText);

  // Generate SEO-optimized title (50-60 chars)
  const seoTitle = title.length > 60 ? title.substring(0, 57) + '...' : title;

  return {
    // Core SEO Meta Tags
    metaTitle: seoTitle,
    metaDescription: metaDescription,
    metaKeywords: generateKeywords(title, slug),
    canonicalUrl: baseUrl,

    // Open Graph Tags (Facebook, LinkedIn, Pinterest)
    ogTitle: title,
    ogDescription: metaDescription,
    ogImage: DEFAULT_IMAGE,
    ogUrl: baseUrl,
    ogType: 'article',
    ogSiteName: SITE_NAME,

    // Twitter Card Tags
    twitterCard: 'summary_large_image',
    twitterTitle: title,
    twitterDescription: metaDescription,
    twitterImage: DEFAULT_IMAGE,
    twitterSite: '@soulseed', // TODO: Update with actual Twitter handle

    // Additional SEO Tags
    robots: 'index, follow',
    author: 'SoulSeed Editorial Team',
    articlePublishedTime: blog.createdAt || new Date().toISOString(),
    articleModifiedTime: blog.updatedAt || new Date().toISOString(),
    articleSection: 'Baby Names',
    articleTag: generateArticleTags(title, slug)
  };
}

/**
 * Generate optimized meta description (150-160 chars)
 * Best practices: Include primary keyword, call-to-action, value proposition
 */
function generateMetaDescription(title, nameCount, contentText) {
  // Extract topic from title
  const topic = title.split(':')[0].trim();

  // Create engaging descriptions with CTAs
  const templates = [
    `Discover ${nameCount} beautiful ${extractTopic(topic)} names for your baby in 2025. Find the perfect name with meanings, origins & popularity trends.`,
    `Explore ${nameCount} unique ${extractTopic(topic)} names for 2025. Get inspired with complete meanings, cultural origins & expert naming tips.`,
    `${nameCount} ${extractTopic(topic)} names curated for 2025 parents. Find meaningful names with origins, popularity data & pronunciation guides.`,
  ];

  // Use first template and ensure it's under 160 chars
  let description = templates[0];
  if (description.length > 160) {
    description = description.substring(0, 157) + '...';
  }

  return description;
}

/**
 * Extract clean topic from title
 */
function extractTopic(topic) {
  return topic
    .replace(/Baby Names/gi, '')
    .replace(/\d+/g, '')
    .replace(/:/g, '')
    .trim()
    .toLowerCase() || 'baby';
}

/**
 * Generate relevant keywords (5-10 keywords)
 */
function generateKeywords(title, slug) {
  const keywords = [
    'baby names 2025',
    'baby name ideas',
    'baby name meanings'
  ];

  // Add specific keywords based on title
  if (title.toLowerCase().includes('literary')) {
    keywords.push('literary baby names', 'book character names', 'literary names');
  } else if (title.toLowerCase().includes('royal')) {
    keywords.push('royal baby names', 'regal names', 'royal names');
  } else if (title.toLowerCase().includes('nature')) {
    keywords.push('nature baby names', 'nature-inspired names', 'botanical names');
  } else if (title.toLowerCase().includes('vintage')) {
    keywords.push('vintage baby names', 'classic names', 'old-fashioned names');
  } else if (title.toLowerCase().includes('unique')) {
    keywords.push('unique baby names', 'rare names', 'uncommon names');
  } else if (title.toLowerCase().includes('biblical')) {
    keywords.push('biblical baby names', 'religious names', 'christian names');
  } else if (title.toLowerCase().includes('irish')) {
    keywords.push('irish baby names', 'gaelic names', 'celtic names');
  } else if (title.toLowerCase().includes('gender-neutral')) {
    keywords.push('gender neutral names', 'unisex names', 'non-binary names');
  } else if (title.toLowerCase().includes('international')) {
    keywords.push('international baby names', 'multicultural names', 'global names');
  } else if (title.toLowerCase().includes('moon')) {
    keywords.push('lunar names', 'moon names', 'celestial names');
  } else if (title.toLowerCase().includes('mythology')) {
    keywords.push('mythological names', 'greek names', 'norse names');
  } else if (title.toLowerCase().includes('short')) {
    keywords.push('short baby names', 'short names', '3 letter names', '4 letter names');
  }

  return keywords.join(', ');
}

/**
 * Generate article tags for categorization
 */
function generateArticleTags(title, slug) {
  const tags = ['Baby Names', '2025'];

  if (title.toLowerCase().includes('literary')) tags.push('Literary Names');
  if (title.toLowerCase().includes('royal')) tags.push('Royal Names');
  if (title.toLowerCase().includes('nature')) tags.push('Nature Names');
  if (title.toLowerCase().includes('vintage')) tags.push('Vintage Names');
  if (title.toLowerCase().includes('unique')) tags.push('Unique Names');
  if (title.toLowerCase().includes('biblical')) tags.push('Biblical Names');
  if (title.toLowerCase().includes('boy')) tags.push('Boy Names');
  if (title.toLowerCase().includes('girl')) tags.push('Girl Names');
  if (title.toLowerCase().includes('unisex') || title.toLowerCase().includes('gender-neutral')) {
    tags.push('Unisex Names');
  }

  return tags.join(', ');
}

async function addMetaTagsToAllBlogs() {
  console.log('🔍 Adding Comprehensive SEO Meta Tags to All Blogs\n');
  console.log('📊 Fetching all Baby Names blogs...\n');

  try {
    const q = query(
      collection(db, 'blogs'),
      where('category', '==', 'Baby Names'),
      where('status', '==', 'published')
    );

    const snapshot = await getDocs(q);

    // Load name counts
    const nameCounts = JSON.parse(fs.readFileSync('blog-name-counts.json', 'utf8'));
    const countMap = {};
    nameCounts.forEach(blog => {
      countMap[blog.id] = blog.nameCount;
    });

    console.log(`Found ${snapshot.size} blogs to process\n`);
    console.log('='.repeat(80));

    const updates = [];

    for (const docSnap of snapshot.docs) {
      const blogData = docSnap.data();
      const nameCount = countMap[docSnap.id] || 30;

      console.log(`\n📝 ${blogData.slug}`);
      console.log(`   Title: ${blogData.title}`);
      console.log(`   Names: ${nameCount}`);

      // Generate comprehensive meta tags
      const metaTags = generateMetaTags(blogData, nameCount);

      // Show meta description preview
      console.log(`   Meta Description: ${metaTags.metaDescription}`);
      console.log(`   Meta Keywords: ${metaTags.metaKeywords.substring(0, 80)}...`);

      // Update Firebase
      try {
        const blogRef = doc(db, 'blogs', docSnap.id);
        await updateDoc(blogRef, { seo: metaTags });

        updates.push({
          id: docSnap.id,
          slug: blogData.slug,
          title: blogData.title,
          metaTags
        });

        console.log(`   ✅ Meta tags added successfully`);

      } catch (error) {
        console.error(`   ❌ Error updating: ${error.message}`);
      }

      console.log('-'.repeat(80));
    }

    // Summary
    console.log('\n\n' + '='.repeat(80));
    console.log('📊 SEO META TAGS SUMMARY');
    console.log('='.repeat(80));
    console.log(`Total blogs processed: ${snapshot.size}`);
    console.log(`Successfully updated: ${updates.length}`);

    if (updates.length > 0) {
      console.log('\n📋 Blogs with New SEO Meta Tags:');
      updates.forEach((update, i) => {
        console.log(`\n${i + 1}. ${update.slug}`);
        console.log(`   Title Tag: ${update.metaTags.metaTitle}`);
        console.log(`   Description: ${update.metaTags.metaDescription.substring(0, 80)}...`);
        console.log(`   OG Image: ${update.metaTags.ogImage}`);
        console.log(`   Twitter Card: ${update.metaTags.twitterCard}`);
      });

      // Save full report
      fs.writeFileSync('seo-meta-tags-report.json', JSON.stringify(updates, null, 2));
      console.log('\n📄 Full SEO report saved to: seo-meta-tags-report.json');
    }

    console.log('\n✅ All SEO meta tags added successfully!\n');

    console.log('\n📝 NEXT STEPS:');
    console.log('1. Create default Open Graph image (1200x630px) at: public/og-image-default.jpg');
    console.log('2. Create custom OG images for each blog post (recommended)');
    console.log('3. Update Twitter handle in meta tags if different from @soulseed');
    console.log('4. Implement meta tags in blog post HTML/React components');
    console.log('5. Test meta tags using Facebook Debugger and Twitter Card Validator\n');

    process.exit(0);

  } catch (error) {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  }
}

addMetaTagsToAllBlogs();
