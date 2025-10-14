#!/usr/bin/env node

const { initializeApp } = require('firebase/app');
const { getFirestore, collection, doc, getDoc } = require('firebase/firestore');

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDbNCgZiXe4d_dFAXNMVclSD3AryoUUI70",
  authDomain: "babynames-app-9fa2a.firebaseapp.com",
  projectId: "babynames-app-9fa2a",
  storageBucket: "babynames-app-9fa2a.firebasestorage.app",
  messagingSenderId: "1093132372253",
  appId: "1:1093132372253:web:0327c13610942d60f4f9f4"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function verifyConversion() {
  console.log('🔍 VERIFYING BLOG POST CONVERSION\n');

  try {
    // Get post ID 1 (one of the converted posts)
    const docRef = doc(db, 'blogs', '1');
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      console.log('❌ Post not found!');
      return;
    }

    const data = docSnap.data();

    console.log('=== POST DETAILS ===');
    console.log('ID:', docSnap.id);
    console.log('Title:', data.title);
    console.log('Category:', data.category);
    console.log('Content Type:', data.contentType);
    console.log('Converted to HTML:', data.convertedToHTML);
    console.log('Featured Names Count:', data.featuredNamesCount);
    console.log('\n=== CONTENT PREVIEW (first 1000 chars) ===\n');
    console.log(data.content.substring(0, 1000));
    console.log('\n...\n');

    console.log('\n=== VALIDATION ===');
    const hasH2 = data.content.includes('<h2');
    const hasH3 = data.content.includes('<h3');
    const hasStrong = data.content.includes('<strong');
    const hasParagraph = data.content.includes('<p');
    const noMarkdownHeaders = !data.content.includes('\n## ') && !data.content.includes('\n### ');
    const noMarkdownBold = !data.content.includes('**');

    console.log('✅ Has <h2> tags:', hasH2);
    console.log('✅ Has <h3> tags:', hasH3);
    console.log('✅ Has <strong> tags:', hasStrong);
    console.log('✅ Has <p> tags:', hasParagraph);
    console.log('✅ No Markdown headers (##):', noMarkdownHeaders);
    console.log('✅ No Markdown bold (**):', noMarkdownBold);

    const allPassed = hasH2 && hasH3 && hasStrong && hasParagraph && noMarkdownHeaders && noMarkdownBold;

    console.log('\n=== RESULT ===');
    if (allPassed) {
      console.log('🎉 CONVERSION SUCCESSFUL! Post is properly formatted in HTML.');
    } else {
      console.log('⚠️ CONVERSION INCOMPLETE. Some formatting issues remain.');
    }

    console.log('\n=== SAMPLE FEATURED NAME ===');
    const strongMatch = data.content.match(/<strong[^>]*>([A-Z][a-z]+)<\/strong>/);
    if (strongMatch) {
      console.log(`Found featured name: ${strongMatch[1]}`);
      console.log('Heart button should work for this name ❤️');
    }

  } catch (error) {
    console.error('Error:', error);
  }

  process.exit(0);
}

verifyConversion();
