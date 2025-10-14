/**
 * TEST: Verify heart buttons work on blog post names
 *
 * This script verifies:
 * 1. Blog posts contain featured names in <strong> tags
 * 2. Names are properly extracted from blog posts
 * 3. All featured names are in the database
 */

const fs = require('fs');
const path = require('path');

const BLOG_POSTS_DIR = './blog-posts-seo';
const DATABASE_FILE = './public/data/names-chunk1.json';

// Extract featured names from HTML (same logic as BlogPostPage.tsx)
function extractFeaturedNames(html) {
  const names = [];
  const strongMatches = html.matchAll(/<strong>(?:\d+\.\s+)?([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)<\/strong>/g);

  for (const match of strongMatches) {
    const name = match[1].trim();
    if (name && !names.includes(name)) {
      names.push(name);
    }
  }

  return names;
}

async function testHeartButtons() {
  console.log('🧪 Testing Blog Heart Buttons\n');

  // Load database
  const database = JSON.parse(fs.readFileSync(DATABASE_FILE, 'utf8'));
  console.log(`📚 Loaded ${database.length} names from database\n`);

  // Get all blog posts
  const blogFiles = fs.readdirSync(BLOG_POSTS_DIR)
    .filter(f => f.endsWith('.html'));

  console.log(`📝 Found ${blogFiles.length} blog posts\n`);

  let totalFeaturedNames = 0;
  let totalMissingNames = 0;

  for (const file of blogFiles) {
    const content = fs.readFileSync(path.join(BLOG_POSTS_DIR, file), 'utf8');
    const featuredNames = extractFeaturedNames(content);

    if (featuredNames.length === 0) continue;

    totalFeaturedNames += featuredNames.length;

    // Check which names are in database
    const missingNames = [];
    for (const name of featuredNames) {
      const exists = database.some(entry => entry.name === name);
      if (!exists) {
        missingNames.push(name);
        totalMissingNames++;
      }
    }

    console.log(`📄 ${file}:`);
    console.log(`   Featured names: ${featuredNames.length}`);
    console.log(`   In database: ${featuredNames.length - missingNames.length}`);
    if (missingNames.length > 0) {
      console.log(`   ⚠️  Missing: ${missingNames.join(', ')}`);
    } else {
      console.log(`   ✅ All names in database`);
    }
    console.log();
  }

  console.log('📊 SUMMARY:');
  console.log(`   Total featured names: ${totalFeaturedNames}`);
  console.log(`   Names in database: ${totalFeaturedNames - totalMissingNames}`);
  console.log(`   Missing names: ${totalMissingNames}`);

  if (totalMissingNames === 0) {
    console.log('\n✅ SUCCESS: All blog names will have heart buttons!');
  } else {
    console.log('\n⚠️  WARNING: Some names missing from database');
  }
}

testHeartButtons();
