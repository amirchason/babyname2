/**
 * Add "The Name Panic" blog post to Firestore
 * Author: Jake Morrison (UX Designer from Portland, OR)
 */

const { initializeApp } = require('firebase/app');
const { getFirestore, collection, doc, setDoc } = require('firebase/firestore');
const fs = require('fs');
const path = require('path');

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

// Read the markdown content
const markdownPath = path.join(__dirname, '../public/blog/posts/2025-10/the-name-panic-a-new-dads-confession.md');
const markdown = fs.readFileSync(markdownPath, 'utf-8');

// Convert markdown to HTML (simple conversion for now)
function markdownToHtml(md) {
  let html = md;

  // Headers
  html = html.replace(/^# (.+)$/gm, '<h1>$1</h1>');
  html = html.replace(/^## (.+)$/gm, '<h2>$1</h2>');
  html = html.replace(/^### (.+)$/gm, '<h3>$1</h3>');

  // Bold and italic
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');
  html = html.replace(/_(.+?)_/g, '<em>$1</em>');

  // Links
  html = html.replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2">$1</a>');

  // Paragraphs
  html = html.replace(/^(?!<h|<ul|<ol|<li)(.+)$/gm, '<p>$1</p>');

  // Line breaks
  html = html.replace(/\n\n/g, '\n');

  return html;
}

const blogPost = {
  id: 'the-name-panic-new-dad-confession-2025',
  slug: 'the-name-panic-new-dad-confession',
  title: "The Name Panic: A New Dad's Soul-Shaking Confession About Choosing His Son's Name",
  excerpt: "It's 3:47 AM. I'm holding a 7-pound human who didn't exist yesterday. And I have no idea what his name is. A brutally honest, hilarious confession about the terror of naming a human being.",
  content: markdownToHtml(markdown),
  markdown: markdown,
  author: {
    name: 'Jake Morrison',
    credentials: 'UX Designer, Portland OR',
    bio: 'Jake is a UX designer, coffee enthusiast, and first-time dad navigating the beautiful chaos of parenthood. When he\'s not designing user experiences, he\'s experiencing the user journey of diaper changes and sleep deprivation. He lives in Portland with his wife, baby Gabriel, and an unhealthy number of houseplants.'
  },
  publishedAt: Date.now(),
  updatedAt: Date.now(),
  tags: [
    'baby names',
    'parenting',
    'new dad',
    'first time parents',
    'pregnancy',
    'name anxiety',
    'baby name apps',
    'SoulSeed',
    'real parenting',
    'honest parenting',
    'dad blog',
    'personal story'
  ],
  category: 'Personal Blogs',
  seo: {
    metaTitle: "The Name Panic: A New Dad's Honest Confession About Choosing Baby Names | SoulSeed",
    metaDescription: "A brutally honest, hilarious confession from a new dad about the soul-shaking panic of choosing his newborn son's name. Real talk about the stress, fights, and eventual relief.",
    keywords: [
      'choosing baby name anxiety',
      'new dad confession',
      'baby name stress',
      'how to choose baby name',
      'baby name panic',
      'first time parent naming baby',
      'honest parenting blog',
      'real dad stories'
    ],
    schema: {
      '@context': 'https://schema.org',
      '@type': 'BlogPosting',
      'headline': "The Name Panic: A New Dad's Soul-Shaking Confession About Choosing His Son's Name",
      'author': {
        '@type': 'Person',
        'name': 'Jake Morrison',
        'jobTitle': 'UX Designer',
        'address': {
          '@type': 'PostalAddress',
          'addressLocality': 'Portland',
          'addressRegion': 'OR'
        }
      },
      'datePublished': new Date().toISOString(),
      'publisher': {
        '@type': 'Organization',
        'name': 'SoulSeed',
        'url': 'https://soulseedbaby.com'
      }
    }
  },
  stats: {
    wordCount: 2767,
    readingTime: 9
  },
  featured: true, // This is a great story, let's feature it!
  status: 'published'
};

async function addBlogPost() {
  try {
    console.log('📝 Adding blog post to Firestore...');
    console.log(`   Title: "${blogPost.title}"`);
    console.log(`   Author: ${blogPost.author.name} (${blogPost.author.credentials})`);
    console.log(`   Category: ${blogPost.category}`);
    console.log(`   Word Count: ${blogPost.stats.wordCount} words`);
    console.log(`   Reading Time: ${blogPost.stats.readingTime} min`);

    const docRef = doc(db, 'blogs', blogPost.id);
    await setDoc(docRef, blogPost);

    console.log('\n✅ Blog post added successfully!');
    console.log(`   View at: http://localhost:3000/blog/${blogPost.slug}`);
    console.log(`   Category: Personal Stories (new category!)`);
    console.log(`\n👤 Author Profile:`);
    console.log(`   Name: ${blogPost.author.name}`);
    console.log(`   Location: Portland, OR`);
    console.log(`   Profession: UX Designer`);
    console.log(`   Bio: ${blogPost.author.bio.substring(0, 100)}...`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error adding blog post:', error);
    process.exit(1);
  }
}

addBlogPost();
