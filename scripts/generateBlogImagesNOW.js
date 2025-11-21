/**
 * Generate Blog Images NOW - Immediate Execution Script
 *
 * This script generates pastel-themed SVG gradient images for ALL blog posts
 * and updates them in Firestore with SEO-optimized alt tags
 *
 * Usage: node scripts/generateBlogImagesNOW.js
 */

const { initializeApp } = require('firebase/app');
const { getFirestore, collection, query, where, getDocs, doc, updateDoc } = require('firebase/firestore');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

// Firebase configuration from environment
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

/**
 * Generate SEO-optimized alt tag for blog image
 */
function generateSEOAltTag(title, category, keywords = []) {
  const normalized = title.toLowerCase();

  // Extract main keyword
  const stopWords = ['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by'];
  const words = normalized.split(' ').filter(w => !stopWords.includes(w));

  // Priority keywords for baby name niche
  const priorityKeywords = [
    'baby names',
    'baby name',
    'pregnancy',
    'pregnant',
    'newborn',
    'parenting',
    'milestone',
    'postpartum',
    'baby gear',
    'nursery',
    'birth',
    'expecting',
    'maternity'
  ];

  let mainKeyword = words.slice(0, 3).join(' ');
  for (const keyword of priorityKeywords) {
    if (normalized.includes(keyword)) {
      mainKeyword = keyword;
      break;
    }
  }

  // Category context
  const categoryMap = {
    'Baby Names': 'guide',
    'Pregnancy': 'tips',
    'Milestones': 'development',
    'Baby Gear': 'essentials',
    'Postpartum': 'recovery',
    'Parenting': 'advice'
  };

  const categoryContext = categoryMap[category] || 'information';

  // Build alt tag
  let altTag = `${mainKeyword} - ${categoryContext} - pastel illustration`;
  altTag = altTag.charAt(0).toUpperCase() + altTag.slice(1);

  // Truncate if too long (max 125 chars for SEO)
  if (altTag.length > 125) {
    altTag = altTag.substring(0, 122) + '...';
  }

  return altTag;
}

/**
 * Get pastel gradient colors for category
 */
function getCategoryGradientColors(category) {
  const normalized = category.toLowerCase();

  if (normalized.includes('name')) return { from: '#D8B4FE', via: '#F0ABFC', to: '#C084FC' };
  if (normalized.includes('pregnan')) return { from: '#FBCFE8', via: '#FDA4AF', to: '#F9A8D4' };
  if (normalized.includes('milestone')) return { from: '#93C5FD', via: '#67E8F9', to: '#7DD3FC' };
  if (normalized.includes('gear')) return { from: '#86EFAC', via: '#6EE7B7', to: '#34D399' };
  if (normalized.includes('postpartum')) return { from: '#DDD6FE', via: '#C4B5FD', to: '#A78BFA' };
  return { from: '#A5B4FC', via: '#93C5FD', to: '#818CF8' };
}

/**
 * Create a beautiful SVG gradient with sparkles
 */
function createGradientSVG(colors) {
  const svg = `
<svg width="800" height="450" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:${colors.from};stop-opacity:1" />
      <stop offset="50%" style="stop-color:${colors.via};stop-opacity:1" />
      <stop offset="100%" style="stop-color:${colors.to};stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="800" height="450" fill="url(#grad)" />

  <!-- Decorative sparkles -->
  <circle cx="200" cy="150" r="4" fill="white" opacity="0.7" />
  <circle cx="600" cy="100" r="3" fill="white" opacity="0.6" />
  <circle cx="400" cy="300" r="5" fill="white" opacity="0.8" />
  <circle cx="150" cy="350" r="3" fill="white" opacity="0.5" />
  <circle cx="650" cy="250" r="4" fill="white" opacity="0.7" />
  <circle cx="300" cy="200" r="3" fill="white" opacity="0.6" />

  <!-- Additional sparkles for depth -->
  <circle cx="450" cy="120" r="2" fill="white" opacity="0.4" />
  <circle cx="550" cy="320" r="2" fill="white" opacity="0.5" />
  <circle cx="250" cy="380" r="2" fill="white" opacity="0.3" />
  <circle cx="700" cy="180" r="3" fill="white" opacity="0.6" />
</svg>
  `.trim();

  return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
}

/**
 * Process a single blog post
 */
async function processBlogPost(blog) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`📄 Processing: ${blog.title}`);
  console.log(`   Category: ${blog.category || 'General'}`);
  console.log(`   Slug: ${blog.slug}`);

  // Generate alt tag
  const imageAlt = generateSEOAltTag(
    blog.title,
    blog.category || 'General',
    blog.seo?.keywords || []
  );

  // Generate gradient image
  const gradientColors = getCategoryGradientColors(blog.category || 'General');
  const imageUrl = createGradientSVG(gradientColors);

  console.log(`   ✅ Generated alt tag: "${imageAlt}"`);
  console.log(`   ✅ Generated gradient image`);

  // Update Firestore
  try {
    const blogRef = doc(db, 'blogs', blog.id);
    await updateDoc(blogRef, {
      imageUrl: imageUrl,
      imageAlt: imageAlt,
      updatedAt: Date.now()
    });
    console.log(`   ✅ Updated in Firestore!`);
    return true;
  } catch (error) {
    console.error(`   ❌ Error updating Firestore:`, error.message);
    return false;
  }
}

/**
 * Main execution
 */
async function main() {
  console.log('\n🎨 Blog Image Generator - IMMEDIATE EXECUTION');
  console.log('='.repeat(60));
  console.log('Generating pastel-themed images for ALL blog posts...\n');

  try {
    // Fetch all published blog posts
    const q = query(collection(db, 'blogs'), where('status', '==', 'published'));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      console.log('\n❌ No blog posts found');
      process.exit(1);
    }

    const blogs = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    console.log(`📚 Found ${blogs.length} blog post(s)\n`);

    // Process each blog
    let successCount = 0;
    let failureCount = 0;

    for (const blog of blogs) {
      const success = await processBlogPost(blog);
      if (success) {
        successCount++;
      } else {
        failureCount++;
      }

      // Small delay between updates
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    console.log(`\n${'='.repeat(60)}`);
    console.log('✅ ALL DONE!');
    console.log(`\n📊 Summary:`);
    console.log(`   Total processed: ${blogs.length}`);
    console.log(`   ✅ Successful: ${successCount}`);
    console.log(`   ❌ Failed: ${failureCount}`);
    console.log(`\n🎉 Images are now live on your site!`);

  } catch (error) {
    console.error('\n❌ Fatal error:', error.message);
    process.exit(1);
  }

  process.exit(0);
}

// Run the script
main();
