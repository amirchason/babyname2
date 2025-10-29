#!/usr/bin/env node

/**
 * Upload 30 Seasonal Blog Posts to Firestore
 * Converts markdown to Firebase format and uploads
 */

const { initializeApp } = require('firebase/app');
const { getFirestore, collection, doc, setDoc, getDocs } = require('firebase/firestore');
const fs = require('fs');
const path = require('path');

require('dotenv').config();

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.REACT_APP_GOOGLE_API_KEY,
  authDomain: "babynames-app-9fa2a.firebaseapp.com",
  projectId: "babynames-app-9fa2a",
  storageBucket: "babynames-app-9fa2a.appspot.com",
  messagingSenderId: "792099154161",
  appId: "1:792099154161:web:1a5b0d4e7f8c9d0e1f2a3b"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Get next available ID
async function getNextId() {
  const blogsRef = collection(db, 'blogs');
  const snapshot = await getDocs(blogsRef);

  let maxId = 109; // Current max from existing blogs
  snapshot.forEach(doc => {
    const id = parseInt(doc.id);
    if (!isNaN(id) && id > maxId) {
      maxId = id;
    }
  });

  return maxId + 1;
}

// Convert markdown to HTML-like format
function markdownToHtml(markdown) {
  return markdown
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/^# (.+)$/gm, '<h1>$1</h1>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/^\d+\.\s+(.+)$/gm, '<li>$1</li>')
    .replace(/(<li>.*<\/li>\n?)+/gs, '<ol>$&</ol>')
    .replace(/<\/ol>\s*<ol>/g, '')
    .replace(/^(?!<[ho]|<li)(.+)$/gm, '<p>$1</p>')
    .replace(/<p><\/p>/g, '');
}

// Extract metadata from markdown
function extractMetadata(content) {
  const titleMatch = content.match(/^#\s+(.+)$/m);
  const title = titleMatch ? titleMatch[1] : 'Untitled';

  // Extract slug from title
  const slug = title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/--+/g, '-');

  // Extract excerpt from first paragraph after title
  const excerptMatch = content.match(/^#.+?\n\n(.+?)\n\n/s);
  const excerpt = excerptMatch ? excerptMatch[1].substring(0, 200) + '...' : '';

  // Count names (numbered list items)
  const nameMatches = content.match(/^\d+\.\s+\*\*/gm);
  const namesCount = nameMatches ? nameMatches.length : 0;

  // Word count
  const wordCount = content.split(/\s+/).length;
  const readingTime = Math.ceil(wordCount / 200);

  // Determine category based on slug
  let category = 'seasonal';
  if (slug.includes('christmas') || slug.includes('halloween') || slug.includes('easter') ||
      slug.includes('valentine') || slug.includes('thanksgiving') || slug.includes('hanukkah') ||
      slug.includes('diwali') || slug.includes('patrick') || slug.includes('july')) {
    category = 'holiday';
  } else if (slug.includes('january') || slug.includes('february') || slug.includes('march') ||
             slug.includes('april') || slug.includes('may') || slug.includes('june') ||
             slug.includes('july-baby') || slug.includes('august') || slug.includes('september') ||
             slug.includes('october-baby') || slug.includes('november') || slug.includes('december')) {
    category = 'month';
  }

  return { title, slug, excerpt, namesCount, wordCount, readingTime, category };
}

async function uploadAllPosts() {
  console.log('🚀 UPLOADING 30 SEASONAL BLOG POSTS TO FIRESTORE\n');
  console.log('='.repeat(70) + '\n');

  const postsDir = path.join(__dirname, 'blog-posts-seasonal');
  const files = fs.readdirSync(postsDir).filter(f => f.endsWith('.md')).sort();

  if (files.length === 0) {
    console.log('❌ No blog posts found in blog-posts-seasonal/');
    process.exit(1);
  }

  console.log(`📂 Found ${files.length} blog posts to upload\n`);

  let nextId = await getNextId();
  console.log(`🔢 Starting from ID: ${nextId}\n`);

  let successCount = 0;
  let failCount = 0;

  for (let i = 0; i < files.length; i++) {
    const filename = files[i];
    const filePath = path.join(postsDir, filename);

    try {
      console.log(`📝 POST ${i + 1}/${files.length}: ${filename}`);

      // Read markdown
      const markdown = fs.readFileSync(filePath, 'utf8');

      // Extract metadata
      const meta = extractMetadata(markdown);

      // Convert to HTML
      const htmlContent = markdownToHtml(markdown);

      console.log(`   Title: "${meta.title}"`);
      console.log(`   Slug: ${meta.slug}`);
      console.log(`   Category: ${meta.category}`);
      console.log(`   Names: ${meta.namesCount}`);
      console.log(`   Words: ${meta.wordCount}`);
      console.log(`   Reading: ${meta.readingTime} min`);

      // Create blog post object
      const postData = {
        id: nextId,
        title: meta.title,
        slug: meta.slug,
        excerpt: meta.excerpt,
        content: htmlContent,
        category: meta.category,
        author: 'SoulSeed',
        status: 'published',
        publishedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        keywords: [
          meta.slug.replace(/-/g, ' '),
          'baby names',
          'baby naming',
          meta.category + ' names'
        ],
        stats: {
          namesCount: meta.namesCount,
          wordCount: meta.wordCount,
          readingTime: meta.readingTime
        }
      };

      // Upload to Firestore
      const docRef = doc(db, 'blogs', String(nextId));
      await setDoc(docRef, postData);

      console.log(`   ✅ Uploaded! (ID: ${nextId})`);
      console.log(`   🌐 URL: https://soulseedbaby.com/blog/${meta.slug}\n`);

      successCount++;
      nextId++;

    } catch (error) {
      console.error(`   ❌ Error: ${error.message}\n`);
      failCount++;
    }
  }

  // Summary
  console.log('='.repeat(70));
  console.log('📊 UPLOAD SUMMARY');
  console.log('='.repeat(70));
  console.log(`✅ Successful: ${successCount}/${files.length}`);
  console.log(`❌ Failed: ${failCount}/${files.length}`);
  console.log('\n🎉 Upload complete!\n');

  process.exit(0);
}

uploadAllPosts().catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});
