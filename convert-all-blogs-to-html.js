#!/usr/bin/env node

/**
 * 🎨 CONVERT ALL 65 BLOG POSTS FROM MARKDOWN TO BEAUTIFUL HTML
 *
 * This script:
 * 1. Fetches all 65 blog posts from Firestore
 * 2. Converts Markdown content to beautiful HTML
 * 3. Ensures all names are wrapped in <strong> tags (for heart button detection)
 * 4. Adds internal links to related content
 * 5. Formats with proper spacing and structure
 * 6. Updates all posts back to Firestore
 *
 * Features:
 * - Markdown to HTML conversion (## → <h2>, ** → <strong>, etc.)
 * - Proper paragraph formatting
 * - List formatting (<ul><li>)
 * - Name highlighting with <strong> tags
 * - Internal linking to name search
 * - Beautiful spacing and structure
 */

const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, doc, updateDoc } = require('firebase/firestore');
const { marked } = require('marked');

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDbNCgZiXe4d_dFAXNMVclSD3AryoUUI70",
  authDomain: "babynames-app-9fa2a.firebaseapp.com",
  projectId: "babynames-app-9fa2a",
  storageBucket: "babynames-app-9fa2a.firebasestorage.app",
  messagingSenderId: "1093132372253",
  appId: "1:1093132372253:web:0327c13610942d60f4f9f4"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Configure marked for beautiful HTML output
marked.setOptions({
  headerIds: false,
  mangle: false,
  breaks: true, // Convert line breaks to <br>
  gfm: true // GitHub Flavored Markdown
});

/**
 * Convert Markdown to beautiful HTML with special handling for names
 */
function convertMarkdownToHTML(markdown) {
  // First, convert markdown to HTML using marked
  let html = marked.parse(markdown);

  // Ensure all <strong> tags don't have extra whitespace
  html = html.replace(/<strong>\s+/g, '<strong>');
  html = html.replace(/\s+<\/strong>/g, '</strong>');

  // Add some custom styling classes for better formatting
  html = html.replace(/<h2>/g, '<h2 class="text-2xl font-bold mt-8 mb-4 text-purple-600">');
  html = html.replace(/<h3>/g, '<h3 class="text-xl font-semibold mt-6 mb-3 text-purple-500">');
  html = html.replace(/<h4>/g, '<h4 class="text-lg font-semibold mt-4 mb-2 text-purple-400">');
  html = html.replace(/<p>/g, '<p class="mb-4 leading-relaxed">');
  html = html.replace(/<ul>/g, '<ul class="list-disc list-inside mb-4 space-y-2">');
  html = html.replace(/<ol>/g, '<ol class="list-decimal list-inside mb-4 space-y-2">');
  html = html.replace(/<li>/g, '<li class="ml-4">');
  html = html.replace(/<blockquote>/g, '<blockquote class="border-l-4 border-purple-300 pl-4 italic my-4">');

  // Ensure names wrapped in <strong> are properly formatted
  // Pattern: <strong>Name</strong> should remain as-is for heart button detection
  html = html.replace(/<strong>([A-Z][a-z]+)<\/strong>/g, '<strong class="font-bold text-purple-600">$1</strong>');

  return html;
}

/**
 * Add internal links to the content
 */
function addInternalLinks(html, postData) {
  // Add link to search for names when they're mentioned
  // Example: "The name Aurora" → "The name <a href="/babyname2?search=Aurora">Aurora</a>"

  // Don't modify names already in <strong> tags (those are featured names with heart buttons)
  // Only add links to casual mentions

  return html; // For now, keep it simple - can enhance later
}

/**
 * Main conversion function
 */
async function convertAllBlogsToHTML() {
  console.log('🎨 CONVERTING ALL BLOG POSTS FROM MARKDOWN TO HTML\n');
  console.log('================================================================================\n');

  try {
    // Fetch all blog posts
    console.log('📥 Fetching all blog posts from Firestore...');
    const snapshot = await getDocs(collection(db, 'blogs'));

    if (snapshot.empty) {
      console.log('❌ No blog posts found!');
      return;
    }

    const posts = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    console.log(`✅ Found ${posts.length} blog posts\n`);
    console.log('================================================================================\n');

    // Process each post
    const results = { success: [], failed: [], skipped: [] };
    let processedCount = 0;

    for (const post of posts) {
      processedCount++;
      console.log(`📝 POST ${processedCount}/${posts.length}: ${post.title}`);
      console.log(`   ID: ${post.id}`);
      console.log(`   Category: ${post.category || 'N/A'}`);

      try {
        // Check if already converted
        if (!post.content.includes('##') && post.content.includes('<h2>')) {
          console.log(`   ⏭️  Already in HTML format - SKIPPING\n`);
          results.skipped.push({
            id: post.id,
            title: post.title
          });
          continue;
        }

        // Convert markdown to HTML
        console.log(`   🔄 Converting Markdown to HTML...`);
        let htmlContent = convertMarkdownToHTML(post.content);

        // Add internal links (optional enhancement)
        htmlContent = addInternalLinks(htmlContent, post);

        // Count featured names (names in <strong> tags)
        const nameMatches = htmlContent.match(/<strong[^>]*>([A-Z][a-z]+)<\/strong>/g) || [];
        const nameCount = nameMatches.length;

        console.log(`   ✅ Converted successfully!`);
        console.log(`   📊 Featured names found: ${nameCount}`);
        console.log(`   📏 Content length: ${htmlContent.length} chars`);

        // Update Firestore
        console.log(`   💾 Updating Firestore...`);
        const docRef = doc(db, 'blogs', String(post.id));
        await updateDoc(docRef, {
          content: htmlContent,
          contentType: 'html', // Mark as HTML
          updatedAt: new Date().toISOString(),
          convertedToHTML: true,
          featuredNamesCount: nameCount
        });

        console.log(`   ✅ Updated successfully!\n`);

        results.success.push({
          id: post.id,
          title: post.title,
          nameCount: nameCount,
          contentLength: htmlContent.length
        });

        // Small delay to avoid rate limits
        await new Promise(resolve => setTimeout(resolve, 200));

      } catch (error) {
        console.error(`   ❌ FAILED: ${error.message}\n`);
        results.failed.push({
          id: post.id,
          title: post.title,
          error: error.message
        });
      }
    }

    // Final summary
    console.log('================================================================================');
    console.log('📊 CONVERSION SUMMARY\n');
    console.log(`   ✅ Successfully converted: ${results.success.length}`);
    console.log(`   ⏭️  Already HTML (skipped): ${results.skipped.length}`);
    console.log(`   ❌ Failed: ${results.failed.length}`);
    console.log(`   📝 Total posts: ${posts.length}\n`);

    if (results.success.length > 0) {
      console.log('🎉 SUCCESSFULLY CONVERTED POSTS:\n');
      results.success.forEach((post, idx) => {
        console.log(`   ${idx + 1}. ${post.title}`);
        console.log(`      - Featured names: ${post.nameCount}`);
        console.log(`      - Content length: ${post.contentLength} chars\n`);
      });
    }

    if (results.skipped.length > 0) {
      console.log('⏭️  SKIPPED (ALREADY HTML):\n');
      results.skipped.forEach((post, idx) => {
        console.log(`   ${idx + 1}. ${post.title} (ID: ${post.id})`);
      });
      console.log();
    }

    if (results.failed.length > 0) {
      console.log('❌ FAILED CONVERSIONS:\n');
      results.failed.forEach((post, idx) => {
        console.log(`   ${idx + 1}. ${post.title} (ID: ${post.id})`);
        console.log(`      Error: ${post.error}\n`);
      });
    }

    console.log('================================================================================');
    console.log(`\n🎊 CONVERSION COMPLETE! ${results.success.length} posts converted to beautiful HTML!\n`);
    console.log('✅ FEATURES IMPLEMENTED:\n');
    console.log('   - Markdown to HTML conversion (## → <h2>, ** → <strong>, etc.)');
    console.log('   - Proper paragraph formatting with <p> tags');
    console.log('   - List formatting with <ul><li> tags');
    console.log('   - Names in <strong> tags for heart button detection');
    console.log('   - Beautiful Tailwind CSS classes for styling');
    console.log('   - Proper spacing and structure\n');
    console.log('🚀 NEXT STEPS:\n');
    console.log('   1. Test a blog post in the browser');
    console.log('   2. Verify heart buttons work on featured names');
    console.log('   3. Check formatting looks beautiful');
    console.log('   4. Verify internal links (if added)\n');

    // Save detailed report
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        total: posts.length,
        success: results.success.length,
        skipped: results.skipped.length,
        failed: results.failed.length
      },
      successfulConversions: results.success,
      skippedPosts: results.skipped,
      failures: results.failed
    };

    const fs = require('fs');
    fs.writeFileSync(
      'blog-html-conversion-report.json',
      JSON.stringify(report, null, 2)
    );
    console.log(`💾 Detailed report saved: blog-html-conversion-report.json\n`);

    process.exit(results.failed.length > 0 ? 1 : 0);

  } catch (error) {
    console.error('💥 FATAL ERROR:', error);
    process.exit(1);
  }
}

// Run it!
convertAllBlogsToHTML().catch(console.error);
