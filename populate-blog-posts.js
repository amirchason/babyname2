#!/usr/bin/env node

/**
 * Populate Firestore with Sample Blog Posts
 * This script adds the sample blog posts to your Firebase Firestore database
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

async function populateBlogPosts() {
  try {
    console.log('🚀 Starting blog post population...\n');

    // Read sample blog posts
    const blogPostsPath = path.join(__dirname, 'sample-blog-posts.json');
    const blogPostsData = fs.readFileSync(blogPostsPath, 'utf8');
    const blogPosts = JSON.parse(blogPostsData);

    console.log(`📚 Found ${blogPosts.length} blog posts to add\n`);

    // Add each blog post to Firestore
    for (const post of blogPosts) {
      console.log(`📝 Adding: "${post.title}"`);
      console.log(`   Slug: ${post.slug}`);
      console.log(`   Category: ${post.category}`);
      console.log(`   Tags: ${post.tags.join(', ')}`);
      console.log(`   Reading time: ${post.stats.readingTime} min`);

      // Add to Firestore using the post ID as document ID
      const docRef = doc(db, 'blogs', post.id);
      await setDoc(docRef, post);

      console.log(`   ✅ Added successfully!\n`);
    }

    console.log('🎉 All blog posts added successfully!');
    console.log('\n📊 Summary:');
    console.log(`   Total posts: ${blogPosts.length}`);
    console.log(`   Featured posts: ${blogPosts.filter(p => p.featured).length}`);
    console.log(`   Categories: ${[...new Set(blogPosts.map(p => p.category))].join(', ')}`);
    console.log(`   Total tags: ${[...new Set(blogPosts.flatMap(p => p.tags))].length}`);

    console.log('\n🌐 View your blog at: http://localhost:3000/babyname2/blog');
    console.log('   (Start the dev server with: npm start)\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error populating blog posts:', error);
    console.error('\nMake sure:');
    console.error('1. Your .env file has the correct Firebase configuration');
    console.error('2. Firestore is enabled in your Firebase project');
    console.error('3. You have write permissions to the Firestore database\n');
    process.exit(1);
  }
}

// Run the script
populateBlogPosts();
