#!/usr/bin/env node

/**
 * Upload All 10 New Blog Posts to Firestore
 *
 * Processes all blog posts from blog-posts-new/ directory
 * and uploads them to Firestore with progress tracking.
 */

const { initializeApp } = require('firebase/app');
const { getFirestore, collection, doc, setDoc } = require('firebase/firestore');
const fs = require('fs');
const path = require('path');

require('dotenv').config();

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.REACT_APP_GOOGLE_API_KEY,
  authDomain: "babynames-app-9fa2a.firebaseapp.com",
  projectId: "babynames-app-9fa2a",
  storageBucket: "babynames-app-9fa2a.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function uploadAllPosts() {
  console.log('🚀 BATCH UPLOAD: 10 NEW BLOG POSTS TO FIRESTORE\n');
  console.log('================================================================================\n');

  const postsDir = path.join(__dirname, 'blog-posts-new');
  const files = fs.readdirSync(postsDir).filter(f => f.endsWith('.json')).sort();

  if (files.length === 0) {
    console.log('❌ No blog posts found in blog-posts-new/');
    process.exit(1);
  }

  console.log(`📂 Found ${files.length} blog posts to upload\n`);

  let successCount = 0;
  let failCount = 0;
  const results = [];

  for (let i = 0; i < files.length; i++) {
    const filename = files[i];
    const filePath = path.join(postsDir, filename);

    try {
      console.log(`📝 POST ${i + 1}/${files.length}: ${filename}`);

      // Read blog post
      const postData = JSON.parse(fs.readFileSync(filePath, 'utf8'));

      // Log details
      console.log(`   Title: "${postData.title}"`);
      console.log(`   Slug: ${postData.slug}`);
      console.log(`   Names: ${postData.stats.namesCount}`);
      console.log(`   Words: ${postData.stats.wordCount}`);
      console.log(`   Reading Time: ${postData.stats.readingTime} min`);
      console.log(`   Keywords: ${postData.keywords.join(', ')}`);

      // Ensure status is published (not draft)
      const uploadData = {
        ...postData,
        status: 'published',
        publishedAt: postData.publishedAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      // Upload to Firestore using ID from JSON
      const docRef = doc(db, 'blogs', String(postData.id));
      await setDoc(docRef, uploadData);

      console.log(`   ✅ Uploaded successfully! (ID: ${postData.id})`);
      console.log(`   🌐 URL: http://localhost:3000/babyname2/blog/${postData.slug}\n`);

      successCount++;
      results.push({
        id: postData.id,
        title: postData.title,
        slug: postData.slug,
        status: 'success',
        url: `http://localhost:3000/babyname2/blog/${postData.slug}`
      });

      // Small delay to avoid overwhelming Firestore
      await new Promise(resolve => setTimeout(resolve, 500));

    } catch (error) {
      console.error(`   ❌ Failed to upload: ${error.message}\n`);
      failCount++;
      results.push({
        filename,
        status: 'failed',
        error: error.message
      });
    }
  }

  // Final summary
  console.log('================================================================================');
  console.log('📊 UPLOAD SUMMARY\n');
  console.log(`   ✅ Successfully uploaded: ${successCount}`);
  console.log(`   ❌ Failed: ${failCount}`);
  console.log(`   📝 Total posts: ${files.length}\n`);

  // Save detailed report
  const report = {
    timestamp: new Date().toISOString(),
    summary: {
      total: files.length,
      success: successCount,
      failed: failCount
    },
    results
  };

  const reportPath = path.join(__dirname, 'blog-upload-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(`💾 Detailed report saved: blog-upload-report.json\n`);

  // List all uploaded posts
  if (successCount > 0) {
    console.log('🎉 SUCCESSFULLY UPLOADED POSTS:\n');
    results.filter(r => r.status === 'success').forEach((post, idx) => {
      console.log(`   ${idx + 1}. ${post.title}`);
      console.log(`      Slug: ${post.slug}`);
      console.log(`      URL: ${post.url}\n`);
    });
  }

  if (failCount > 0) {
    console.log('❌ FAILED UPLOADS:\n');
    results.filter(r => r.status === 'failed').forEach((post, idx) => {
      console.log(`   ${idx + 1}. ${post.filename}`);
      console.log(`      Error: ${post.error}\n`);
    });
  }

  console.log('================================================================================');
  console.log(`\n🎊 UPLOAD COMPLETE! ${successCount}/${files.length} posts now live on Firestore!\n`);
  console.log('Next steps:');
  console.log('1. Test blogs at: http://localhost:3000/babyname2/blog');
  console.log('2. Verify all posts render correctly');
  console.log('3. Add internal links between related posts');
  console.log('4. Create Pinterest graphics for social sharing\n');

  process.exit(failCount > 0 ? 1 : 0);
}

uploadAllPosts();
