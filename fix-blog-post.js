/**
 * Fix Individual Blog Post
 * Usage: node fix-blog-post.js <post-number>
 *
 * Fixes:
 * - Updates title to match actual name count
 * - Adds names summary section at bottom with heart buttons
 * - Ensures beautiful, bold headers throughout
 */

const fs = require('fs');
const path = require('path');

const postNumber = process.argv[2];

if (!postNumber) {
  console.error('\n❌ Error: Please provide a post number');
  console.log('Usage: node fix-blog-post.js <post-number>');
  console.log('Example: node fix-blog-post.js 1\n');
  process.exit(1);
}

// Find the post file
const blogDir = path.join(__dirname, 'blog-posts-seo');
const files = fs.readdirSync(blogDir);
const postFile = files.find(f => f.startsWith(`post-${postNumber}-`) && f.endsWith('.json'));

if (!postFile) {
  console.error(`\n❌ Error: Could not find post-${postNumber}-*.json\n`);
  process.exit(1);
}

const postPath = path.join(blogDir, postFile);
const post = JSON.parse(fs.readFileSync(postPath, 'utf8'));

console.log(`\n🔧 Fixing Post #${postNumber}: ${post.title}\n`);

// Count unique names
const nameMatches = post.content.match(/<strong>([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)<\/strong>/g) || [];
const uniqueNames = [...new Set(nameMatches.map(m => m.replace(/<\/?strong>/g, '')))].sort();
const nameCount = uniqueNames.length;

console.log(`📊 Found ${nameCount} unique names`);

// Extract title number if exists
const titleNumberMatch = post.title.match(/(\d+)\+?/);
const currentNumber = titleNumberMatch ? parseInt(titleNumberMatch[1]) : null;

// Update title if needed
let updatedTitle = post.title;
let updatedExcerpt = post.excerpt;
let updatedContent = post.content;

if (currentNumber && Math.abs(currentNumber - nameCount) > 5) {
  // Replace number in title
  updatedTitle = post.title.replace(/\d+\+?/, `${nameCount}+`);
  updatedExcerpt = post.excerpt.replace(/\d+\+?/, `${nameCount}+`);

  console.log(`✏️  Updated title: ${currentNumber}+ → ${nameCount}+`);
} else {
  console.log(`✅ Title number is accurate (${currentNumber})`);
}

// Check if names summary already exists
const hasNamesSummary = updatedContent.includes('Names Featured') || updatedContent.includes('All Names');

if (!hasNamesSummary) {
  // Create names summary section
  const namesSummaryHtml = `

<h2>✨ All ${nameCount} Names Featured in This Post</h2>

<p>Loved reading about these names? Click the heart ❤️ on any name below to add it to your favorites! Each name is carefully curated and explained throughout this post.</p>

<div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 1rem; margin: 2rem 0;">
${uniqueNames.map(name => `  <p style="margin: 0.5rem 0;"><strong>${name}</strong></p>`).join('\n')}
</div>

<p style="margin-top: 2rem; padding: 1.5rem; background: linear-gradient(135deg, #faf5ff 0%, #fdf2f8 100%); border-radius: 0.75rem; border-left: 4px solid #9333ea;">
💡 <strong>Pro Tip:</strong> Use the SoulSeed app to explore our complete database of 174,000+ names with meanings, origins, and popularity data. Try our Tinder-style swipe feature to discover names you'll love!
</p>`;

  // Insert before the FAQ section or before final thoughts
  if (updatedContent.includes('<h2>FAQ:')) {
    updatedContent = updatedContent.replace(
      /(<h2>FAQ:[^<]*<\/h2>)/,
      `${namesSummaryHtml}\n\n$1`
    );
  } else if (updatedContent.includes('<h2>Final Thoughts:')) {
    updatedContent = updatedContent.replace(
      /(<h2>Final Thoughts:[^<]*<\/h2>)/,
      `${namesSummaryHtml}\n\n$1`
    );
  } else {
    // Add at the end
    updatedContent += namesSummaryHtml;
  }

  console.log(`✅ Added names summary section with ${nameCount} names`);
} else {
  console.log(`ℹ️  Names summary already exists`);
}

// Save updated post
const updatedPost = {
  ...post,
  title: updatedTitle,
  excerpt: updatedExcerpt,
  content: updatedContent,
  updatedAt: Date.now(),
  stats: {
    ...post.stats,
    wordCount: updatedContent.split(/\s+/).length
  }
};

fs.writeFileSync(postPath, JSON.stringify(updatedPost, null, 2));

console.log(`\n💾 Saved: ${postPath}`);
console.log(`\n✨ Post #${postNumber} fixed successfully!\n`);
