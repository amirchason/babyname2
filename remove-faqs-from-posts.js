const fs = require('fs');
const path = require('path');

function removeFAQSection(content) {
  // Remove FAQ heading and all FAQ items
  // Match: <h2>FAQ:...</h2> followed by any number of <div class="faq-item">...</div>
  const faqPattern = /<h2>FAQ:.*?<\/h2>[\s\S]*?(?=<h2>|$)/i;

  let newContent = content.replace(faqPattern, '');

  // Also remove any standalone faq-item divs that might remain
  const faqItemPattern = /<div class="faq-item">[\s\S]*?<\/div>\s*/gi;
  newContent = newContent.replace(faqItemPattern, '');

  return newContent.trim();
}

function removeNamesSection(content) {
  // Remove the "All X Names Featured in This Post" section
  const namesSectionPattern = /<h2>✨ All \d+ Names Featured in This Post<\/h2>[\s\S]*?(?=<h2>|$)/;
  return content.replace(namesSectionPattern, '').trim();
}

function processPost(postNumber) {
  try {
    // Find the post file
    const blogDir = path.join(__dirname, 'blog-posts-seo');
    const files = fs.readdirSync(blogDir);
    const postFile = files.find(f => f.startsWith(`post-${postNumber}-`) && f.endsWith('.json'));

    if (!postFile) {
      console.log(`⏭️  Post #${postNumber} not found, skipping...`);
      return false;
    }

    const postPath = path.join(blogDir, postFile);
    const post = JSON.parse(fs.readFileSync(postPath, 'utf8'));

    console.log(`\n📝 Processing Post #${postNumber}: ${post.title}`);

    // Remove FAQ section from content
    const originalContent = post.content;
    let newContent = removeFAQSection(originalContent);
    newContent = removeNamesSection(newContent);

    // Add placeholder comment for where the BlogNameList component will be inserted
    newContent += '\n\n<!-- BLOG_NAME_LIST_COMPONENT -->\n';

    post.content = newContent;

    // Remove faqSchema from SEO
    if (post.seo && post.seo.faqSchema) {
      delete post.seo.faqSchema;
      console.log('   ✅ Removed faqSchema from SEO');
    }

    // Recalculate word count and reading time
    const textContent = newContent.replace(/<[^>]*>/g, '');
    const wordCount = textContent.split(/\s+/).filter(w => w.length > 0).length;
    const readingTime = Math.ceil(wordCount / 250);

    post.stats.wordCount = wordCount;
    post.stats.readingTime = readingTime;
    post.updatedAt = Date.now();

    // Save updated post
    fs.writeFileSync(postPath, JSON.stringify(post, null, 2));

    console.log(`   ✅ Removed FAQ section`);
    console.log(`   ✅ Removed names summary section`);
    console.log(`   ✅ Added BlogNameList placeholder`);
    console.log(`   ✅ Updated word count: ${wordCount} (${readingTime} min read)`);

    return true;
  } catch (error) {
    console.error(`   ❌ Error processing Post #${postNumber}:`, error.message);
    return false;
  }
}

async function main() {
  console.log('🚀 Removing FAQs and updating name lists format for all blog posts...\n');

  let processedCount = 0;
  let errorCount = 0;

  // Process posts 1-11
  for (let i = 1; i <= 11; i++) {
    const success = processPost(i);
    if (success) {
      processedCount++;
    } else if (i <= 10) { // Only count as error if post should exist
      errorCount++;
    }
  }

  console.log(`\n✅ Complete! Processed ${processedCount} posts`);
  if (errorCount > 0) {
    console.log(`⚠️  ${errorCount} errors encountered`);
  }

  console.log(`\n📋 Next Steps:`);
  console.log(`   1. Create BlogNameList React component`);
  console.log(`   2. Update BlogPostPage to render BlogNameList at placeholder`);
  console.log(`   3. Test interactive name list with filters`);
  console.log(`   4. Re-publish all posts to Firebase`);
}

main();
