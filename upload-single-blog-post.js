#!/usr/bin/env node

/**
 * Upload Single Blog Post to Firestore
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

async function uploadPost() {
  try {
    console.log('🚀 Uploading blog post to Firestore...\n');

    // Read the blog post
    const postPath = path.join(__dirname, 'blog-posts-seo/post-1-light-sun-star-names.json');
    const postData = JSON.parse(fs.readFileSync(postPath, 'utf8'));

    console.log(`📝 Title: "${postData.title}"`);
    console.log(`   Slug: ${postData.slug}`);
    console.log(`   Word Count: ${postData.stats.wordCount}`);
    console.log(`   Reading Time: ${postData.stats.readingTime} min`);
    console.log(`   SEO Keywords: ${postData.seo.keywords.length}`);

    // Upload to Firestore
    const docRef = doc(db, 'blogs', postData.id);
    await setDoc(docRef, postData);

    console.log(`\n✅ Post uploaded successfully!`);
    console.log(`\n🌐 View at: http://localhost:3000/babyname2/blog/${postData.slug}`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error uploading post:', error);
    process.exit(1);
  }
}

uploadPost();
