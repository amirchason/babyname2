/**
 * Generate Blog Images Script
 *
 * This script generates pastel-themed images for blog posts using the Gemini API
 * and updates the Firestore database with image URLs.
 *
 * Usage:
 *   node scripts/generateBlogImages.js [--all | --slug=<blog-slug>]
 *
 * Options:
 *   --all              Generate images for all blog posts without images
 *   --slug=<slug>      Generate image for a specific blog post
 *   --force            Regenerate images even if they already exist
 *
 * Example:
 *   node scripts/generateBlogImages.js --all
 *   node scripts/generateBlogImages.js --slug=choosing-baby-name
 *   node scripts/generateBlogImages.js --all --force
 */

const admin = require('firebase-admin');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

// Initialize Firebase Admin SDK
const serviceAccount = require('../serviceAccountKey.json'); // You'll need to add this file

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

// Gemini API configuration
const GEMINI_API_KEY = process.env.REACT_APP_GEMINI_IMAGE_API_KEY;

/**
 * Create a pastel-themed prompt for blog image generation
 */
function createPastelPrompt(blog) {
  const { title, category, excerpt } = blog;
  const normalized = category.toLowerCase();

  // Category-specific pastel themes
  let themeDescription = '';
  if (normalized.includes('name')) {
    themeDescription = 'soft purple, pink, and lavender tones with baby name elements, gentle typography';
  } else if (normalized.includes('pregnan')) {
    themeDescription = 'pastel pink, rose, and peach tones with pregnancy symbols, maternal warmth';
  } else if (normalized.includes('milestone')) {
    themeDescription = 'soft blue, cyan, and sky tones with achievement symbols, growth elements';
  } else if (normalized.includes('gear')) {
    themeDescription = 'gentle green, mint, and sage tones with baby product icons, cozy items';
  } else if (normalized.includes('postpartum')) {
    themeDescription = 'light violet, lavender, and lilac tones with recovery symbols, nurturing elements';
  } else {
    themeDescription = 'soft indigo, periwinkle, and powder blue tones with general baby themes';
  }

  return `
Create a beautiful, soft pastel illustration for a baby/parenting blog post.

Title: "${title}"
Category: ${category}

Style Requirements:
- PASTEL COLOR PALETTE ONLY (light 300-400 shades, NO vibrant colors)
- ${themeDescription}
- Soft gradients and gentle transitions
- Minimalist, clean design
- Baby-friendly aesthetic
- Watercolor or soft digital art style
- No harsh lines or bright colors
- Dreamy, whimsical atmosphere
- Focus on comfort and warmth
- Age-appropriate (suitable for all audiences)
- Professional yet playful

Composition:
- Centered or balanced layout
- Generous white/negative space
- Subtle decorative elements (flowers, stars, clouds)
- No text or typography in the image
- 16:9 aspect ratio (landscape)
- High resolution, web-optimized
  `.trim();
}

/**
 * Generate image using Gemini API (placeholder for actual implementation)
 */
async function generateImage(blog) {
  if (!GEMINI_API_KEY) {
    console.error('❌ GEMINI_API_KEY not found in .env file');
    return null;
  }

  const prompt = createPastelPrompt(blog);

  console.log(`\n📝 Generated prompt for "${blog.title}":`);
  console.log(prompt);
  console.log('\n⏳ Generating image...');

  try {
    // TODO: Implement actual Gemini API call here
    // For now, return a placeholder URL

    // Example API call structure (update when you have the actual endpoint):
    // const response = await fetch('https://api.gemini.com/v1/generate-image', {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/json',
    //     'Authorization': `Bearer ${GEMINI_API_KEY}`
    //   },
    //   body: JSON.stringify({ prompt })
    // });
    //
    // const data = await response.json();
    // return data.imageUrl;

    // Placeholder: return null for now (will use gradient fallback)
    console.log('⚠️  Gemini API integration pending - using gradient fallback');
    return null;

  } catch (error) {
    console.error('❌ Error generating image:', error.message);
    return null;
  }
}

/**
 * Update blog post with generated image URL
 */
async function updateBlogImage(blogId, imageUrl) {
  try {
    await db.collection('blogs').doc(blogId).update({
      imageUrl: imageUrl,
      updatedAt: Date.now()
    });
    console.log('✅ Updated blog post in Firestore');
  } catch (error) {
    console.error('❌ Error updating Firestore:', error.message);
    throw error;
  }
}

/**
 * Process a single blog post
 */
async function processBlogPost(blog, force = false) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`📄 Processing: ${blog.title}`);
  console.log(`   Category: ${blog.category || 'General'}`);
  console.log(`   Slug: ${blog.slug}`);

  if (blog.imageUrl && !force) {
    console.log('⏭️  Image already exists (use --force to regenerate)');
    return;
  }

  const imageUrl = await generateImage(blog);

  if (imageUrl) {
    await updateBlogImage(blog.id, imageUrl);
    console.log(`✨ Image generated successfully!`);
    console.log(`   URL: ${imageUrl}`);
  } else {
    console.log('ℹ️  No image generated - will use gradient fallback in UI');
  }
}

/**
 * Main execution
 */
async function main() {
  const args = process.argv.slice(2);
  const generateAll = args.includes('--all');
  const force = args.includes('--force');
  const slugArg = args.find(arg => arg.startsWith('--slug='));
  const targetSlug = slugArg ? slugArg.split('=')[1] : null;

  console.log('\n🎨 Blog Image Generator');
  console.log('='.repeat(60));

  if (!generateAll && !targetSlug) {
    console.log('\nUsage:');
    console.log('  node scripts/generateBlogImages.js --all');
    console.log('  node scripts/generateBlogImages.js --slug=<blog-slug>');
    console.log('  node scripts/generateBlogImages.js --all --force\n');
    process.exit(1);
  }

  try {
    // Fetch blog posts
    let query = db.collection('blogs').where('status', '==', 'published');

    if (targetSlug) {
      query = query.where('slug', '==', targetSlug);
    }

    const snapshot = await query.get();

    if (snapshot.empty) {
      console.log('\n❌ No blog posts found');
      process.exit(1);
    }

    const blogs = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    console.log(`\n📚 Found ${blogs.length} blog post(s)`);

    // Process each blog
    for (const blog of blogs) {
      await processBlogPost(blog, force);

      // Add delay between requests to prevent rate limiting
      if (blogs.length > 1) {
        console.log('⏱️  Waiting 2 seconds before next request...');
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }

    console.log(`\n${'='.repeat(60)}`);
    console.log('✅ All done!');
    console.log(`\n📊 Summary:`);
    console.log(`   Total processed: ${blogs.length}`);
    console.log(`   Mode: ${force ? 'Force regenerate' : 'Generate missing'}`);

  } catch (error) {
    console.error('\n❌ Fatal error:', error.message);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

// Run the script
main();
