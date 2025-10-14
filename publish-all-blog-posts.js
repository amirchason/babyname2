#!/usr/bin/env node

/**
 * Publish All Blog Posts from blog-posts-seo/ to Firebase
 * Uploads all post-*.json files to Firestore
 */

const { initializeApp } = require('firebase/app');
const { getFirestore, collection, doc, setDoc } = require('firebase/firestore');
const fs = require('fs');
const path = require('path');

// Load environment variables
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

async function publishAllPosts() {
  try {
    console.log('🚀 Publishing all blog posts to Firebase...\n');

    // Read all post files from blog-posts-seo directory
    const blogDir = path.join(__dirname, 'blog-posts-seo');
    const files = fs.readdirSync(blogDir);
    const postFiles = files.filter(f => f.startsWith('post-') && f.endsWith('.json'));

    console.log(`📚 Found ${postFiles.length} blog posts to publish\n`);

    let successCount = 0;
    const posts = [];

    // Upload each post
    for (const file of postFiles.sort()) {
      const postPath = path.join(blogDir, file);
      const postData = JSON.parse(fs.readFileSync(postPath, 'utf8'));

      console.log(`📝 Publishing: "${postData.title}"`);
      console.log(`   File: ${file}`);
      console.log(`   Slug: ${postData.slug}`);
      console.log(`   Category: ${postData.category}`);
      console.log(`   Word count: ${postData.stats.wordCount} (${postData.stats.readingTime} min read)`);
      console.log(`   Status: ${postData.status}`);

      // Add to Firestore using the post ID as document ID
      const docRef = doc(db, 'blogs', postData.id);
      await setDoc(docRef, postData);

      posts.push(postData);
      successCount++;
      console.log(`   ✅ Published successfully!\n`);
    }

    console.log('🎉 All blog posts published successfully!');
    console.log('\n📊 Summary:');
    console.log(`   Total posts: ${posts.length}`);
    console.log(`   Featured posts: ${posts.filter(p => p.featured).length}`);
    console.log(`   Categories: ${[...new Set(posts.map(p => p.category))].join(', ')}`);
    console.log(`   Total tags: ${[...new Set(posts.flatMap(p => p.tags))].length}`);
    console.log(`   Total words: ${posts.reduce((sum, p) => sum + p.stats.wordCount, 0).toLocaleString()}`);
    console.log(`   Avg reading time: ${Math.round(posts.reduce((sum, p) => sum + p.stats.readingTime, 0) / posts.length)} min`);

    console.log('\n🌐 View your blog at:');
    console.log('   Local: http://localhost:3000/babyname2/blog');
    console.log('   Live: https://amirchason.github.io/babyname2/blog');
    console.log('');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error publishing blog posts:', error);
    console.error('\nMake sure:');
    console.error('1. Your .env file has the correct Firebase configuration');
    console.error('2. Firestore is enabled in your Firebase project');
    console.error('3. You have write permissions to the Firestore database');
    console.error('4. Blog post JSON files are valid\n');
    process.exit(1);
  }
}

// Run the script
publishAllPosts();
