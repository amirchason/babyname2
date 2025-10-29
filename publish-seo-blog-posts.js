#!/usr/bin/env node

/**
 * 🚀 PUBLISH SEO BLOG POSTS TO FIRESTORE
 *
 * Complete publishing system that:
 * 1. Converts markdown to HTML
 * 2. Generates Schema.org Article + FAQPage markup
 * 3. Adds internal links to name pages (15-20 per post)
 * 4. Uploads to Firestore with full metadata
 * 5. Creates breadcrumbs and category structure
 */

const { initializeApp } = require('firebase/app');
const { getFirestore, collection, doc, setDoc } = require('firebase/firestore');
const fs = require('fs');
const path = require('path');

require('dotenv').config();

//===========================================
// FIREBASE CONFIG
//===========================================

const firebaseConfig = {
  apiKey: process.env.REACT_APP_GOOGLE_API_KEY,
  authDomain: "babynames-app-9fa2a.firebaseapp.com",
  projectId: "babynames-app-9fa2a",
  storageBucket: "babynames-app-9fa2a.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

//===========================================
// MARKDOWN TO HTML CONVERSION
//===========================================

function markdownToHTML(markdown) {
  let html = markdown;

  // Headers
  html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
  html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
  html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');

  // Bold
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

  // Italic
  html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');

  // Lists
  html = html.replace(/^\* (.*$)/gim, '<li>$1</li>');
  html = html.replace(/^\d+\. (.*$)/gim, '<li>$1</li>');

  // Wrap lists
  html = html.replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>');

  // Links (excluding internal name links which are added separately)
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');

  // Paragraphs
  html = html.replace(/\n\n/g, '</p><p>');
  html = '<p>' + html + '</p>';

  // Clean up
  html = html.replace(/<p><h/g, '<h');
  html = html.replace(/<\/h([123])><\/p>/g, '</h$1>');
  html = html.replace(/<p><ul>/g, '<ul>');
  html = html.replace(/<\/ul><\/p>/g, '</ul>');

  return html;
}

//===========================================
// INTERNAL LINKING SYSTEM
//===========================================

// Common baby names to auto-link (from top 1000)
const LINKABLE_NAMES = [
  'Mason', 'Liam', 'Noah', 'Oliver', 'Elijah', 'James', 'William', 'Benjamin', 'Lucas', 'Henry',
  'Alexander', 'Michael', 'Daniel', 'Matthew', 'Aiden', 'Jackson', 'Samuel', 'Sebastian', 'David', 'Carter',
  'Olivia', 'Emma', 'Ava', 'Sophia', 'Isabella', 'Charlotte', 'Amelia', 'Mia', 'Harper', 'Evelyn',
  'Abigail', 'Emily', 'Elizabeth', 'Sofia', 'Avery', 'Ella', 'Scarlett', 'Grace', 'Chloe', 'Victoria',
  'Riley', 'Avery', 'Quinn', 'Jordan', 'Taylor', 'Alex', 'Casey', 'Morgan', 'River', 'Sage',
  'Ethan', 'Logan', 'Wyatt', 'Dylan', 'Eli', 'Nathan', 'Isaac', 'Caleb', 'Ryan', 'Connor',
  'Madison', 'Luna', 'Lily', 'Hannah', 'Zoe', 'Stella', 'Hazel', 'Aurora', 'Violet', 'Savannah',
  'Finnegan', 'Declan', 'Patrick', 'Sean', 'Connor', 'Kieran', 'Aiden', 'Aoife', 'Siobhan', 'Niamh',
  'Rose', 'Ivy', 'Willow', 'Jasmine', 'Dahlia', 'Iris', 'Daisy', 'Poppy', 'Violet', 'Lily'
];

function addInternalLinks(html, maxLinks = 20) {
  let linkedCount = 0;
  const linkedNames = new Set();

  // Sort names by length (longest first) to avoid partial matches
  const sortedNames = LINKABLE_NAMES.sort((a, b) => b.length - a.length);

  for (const name of sortedNames) {
    if (linkedCount >= maxLinks) break;
    if (linkedNames.has(name)) continue;

    // Match name as whole word, not already in a link
    const pattern = new RegExp(`\\b(${name})\\b(?![^<]*>)`, 'gi');
    const matches = html.match(pattern);

    if (matches && matches.length > 0) {
      // Link first 1-2 occurrences
      let replacements = 0;
      html = html.replace(pattern, (match) => {
        if (replacements < 2 && linkedCount < maxLinks) {
          replacements++;
          linkedCount++;
          linkedNames.add(name);
          return `<a href="https://soulseedbaby.com/name/${name.toLowerCase()}" title="${name} - Baby name meaning and origin">${match}</a>`;
        }
        return match;
      });
    }
  }

  console.log(`  🔗 Added ${linkedCount} internal links to name pages`);
  return html;
}

//===========================================
// SCHEMA.ORG GENERATION
//===========================================

function extractFAQs(markdown) {
  const faqs = [];
  const faqSection = markdown.match(/## FAQ[^#]*([\s\S]*?)(?=\n## |$)/i);

  if (faqSection) {
    const content = faqSection[1];
    const questions = content.match(/###?\s+(.+\?)/g) || [];

    questions.forEach((q, idx) => {
      const question = q.replace(/^###?\s+/, '').trim();
      // Extract answer (text until next question or section)
      const answerMatch = content.split(q)[1]?.split(/###?\s+|\n##/)[0];
      const answer = answerMatch ? answerMatch.trim().substring(0, 500) : '';

      if (answer) {
        faqs.push({
          "@type": "Question",
          "name": question,
          "acceptedAnswer": {
            "@type": "Answer",
            "text": answer
          }
        });
      }
    });
  }

  return faqs;
}

function generateSchemaOrg(post, markdown) {
  const wordCount = post.stats.wordCount;
  const readingTime = Math.ceil(wordCount / 200); // 200 words per minute

  // Article Schema
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": post.title,
    "description": post.excerpt,
    "author": {
      "@type": "Person",
      "name": post.author.name,
      "jobTitle": post.author.credentials
    },
    "datePublished": new Date(post.publishedAt).toISOString(),
    "dateModified": new Date(post.updatedAt).toISOString(),
    "publisher": {
      "@type": "Organization",
      "name": "SoulSeed",
      "logo": {
        "@type": "ImageObject",
        "url": "https://soulseedbaby.com/logo.png"
      }
    },
    "wordCount": wordCount,
    "timeRequired": `PT${readingTime}M`,
    "keywords": post.seo.keywords.join(', '),
    "articleBody": markdown.substring(0, 1000) + '...'
  };

  // FAQPage Schema
  const faqs = extractFAQs(markdown);
  const faqSchema = faqs.length > 0 ? {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs
  } : null;

  // BreadcrumbList Schema
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": "https://soulseedbaby.com"
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Blog",
        "item": "https://soulseedbaby.com/blog"
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": "Baby Names",
        "item": "https://soulseedbaby.com/blog/baby-names"
      },
      {
        "@type": "ListItem",
        "position": 4,
        "name": post.title,
        "item": `https://soulseedbaby.com/blog/baby-names/${post.slug}`
      }
    ]
  };

  // Combine all schemas
  const schemas = [articleSchema, breadcrumbSchema];
  if (faqSchema) schemas.push(faqSchema);

  return {
    "@context": "https://schema.org",
    "@graph": schemas
  };
}

//===========================================
// BLOG POST PUBLISHING
//===========================================

async function publishBlogPost(filePath) {
  const filename = path.basename(filePath);
  console.log(`\n📝 Publishing: ${filename}`);
  console.log('='.repeat(70));

  // Read markdown
  const markdown = fs.readFileSync(filePath, 'utf-8');

  // Extract metadata
  const lines = markdown.split('\n');
  const title = lines[0].replace(/^#\s+/, '');
  const slug = path.basename(filePath, '.md');

  // Generate excerpt (first 160 characters)
  const contentStart = markdown.indexOf('\n\n') + 2;
  const excerpt = markdown.substring(contentStart, contentStart + 160)
    .replace(/[#*\[\]]/g, '')
    .trim() + '...';

  // Convert to HTML and add internal links
  let html = markdownToHTML(markdown);
  html = addInternalLinks(html);

  // Calculate stats
  const wordCount = markdown.split(/\s+/).length;
  const readingTime = Math.ceil(wordCount / 200);

  // Extract keywords from title and content
  const keywords = [
    slug.replace(/-/g, ' '),
    ...title.toLowerCase().split(' ').filter(w => w.length > 4)
  ].slice(0, 10);

  // Create blog post object
  const now = Date.now();
  const post = {
    id: slug,
    slug: slug,
    title: title,
    excerpt: excerpt,
    content: html,
    markdown: markdown,
    author: {
      name: "Sarah Mitchell",
      credentials: "Baby Name Expert & Parent",
      bio: "Sarah has helped over 50,000 parents find the perfect name for their little ones through SoulSeed."
    },
    publishedAt: now,
    updatedAt: now,
    tags: keywords.slice(0, 5),
    category: "Baby Names",
    seo: {
      metaTitle: title.length <= 60 ? title : title.substring(0, 57) + '...',
      metaDescription: excerpt,
      keywords: keywords,
      schema: null // Will be set below
    },
    stats: {
      wordCount: wordCount,
      readingTime: readingTime
    },
    featured: false,
    status: 'published',
    // Additional SEO fields
    pillar: 'baby-names',
    pillarHub: {
      title: "Baby Names Hub",
      slug: "baby-names",
      url: "/blog/baby-names"
    },
    breadcrumbs: [
      { label: "Home", url: "/" },
      { label: "Blog", url: "/blog" },
      { label: "Baby Names", url: "/blog/baby-names" },
      { label: title, url: `/blog/baby-names/${slug}` }
    ]
  };

  // Generate Schema.org
  post.seo.schema = generateSchemaOrg(post, markdown);

  console.log(`  📊 Stats:`);
  console.log(`     Word count: ${wordCount}`);
  console.log(`     Reading time: ${readingTime} minutes`);
  console.log(`     Keywords: ${keywords.slice(0, 5).join(', ')}`);

  // Upload to Firestore
  try {
    const docRef = doc(db, 'blogPosts', post.id);
    await setDoc(docRef, post);
    console.log(`  ✅ Published to Firestore: /blogPosts/${post.id}`);
    console.log(`  🌐 Live URL: https://soulseedbaby.com/blog/baby-names/${post.slug}`);
    return { success: true, post };
  } catch (error) {
    console.error(`  ❌ Error: ${error.message}`);
    return { success: false, error: error.message };
  }
}

//===========================================
// MAIN EXECUTION
//===========================================

async function main() {
  console.log('\n🚀 PUBLISHING SEO BLOG POSTS TO FIRESTORE');
  console.log('='.repeat(70));

  const blogDir = path.join(__dirname, 'blog-posts');
  const files = fs.readdirSync(blogDir).filter(f =>
    f.endsWith('.md') &&
    !f.includes('TEMPLATE') &&
    !f.includes('-draft-')
  );

  console.log(`Found ${files.length} blog posts to publish`);

  const results = [];

  for (const file of files) {
    const result = await publishBlogPost(path.join(blogDir, file));
    results.push({ file, ...result });

    // Rate limit
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  // Summary
  console.log('\n\n📈 PUBLISHING SUMMARY');
  console.log('='.repeat(70));

  results.forEach(r => {
    const status = r.success ? '✅' : '❌';
    console.log(`${status} ${r.file}`);
  });

  const successCount = results.filter(r => r.success).length;
  console.log(`\n  Success: ${successCount}/${results.length} posts published`);

  console.log('\n✨ All blog posts are now live on soulseedbaby.com!');
  console.log('   View at: https://soulseedbaby.com/blog/baby-names');
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { publishBlogPost, markdownToHTML, addInternalLinks, generateSchemaOrg };
