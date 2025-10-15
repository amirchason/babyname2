/**
 * Extract all names from Baby Names blog posts and add them to the database
 */

const { initializeApp } = require('firebase/app');
const { getFirestore, collection, query, where, getDocs } = require('firebase/firestore');
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

// Extract featured names from HTML content
function extractFeaturedNames(html) {
  const names = [];

  // Pattern 1: <strong>Name</strong> or <strong>1. Name</strong>
  const strongRegex = /<strong>(?:\d+\.\s+)?([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)<\/strong>/g;
  let match;
  while ((match = strongRegex.exec(html)) !== null) {
    const name = match[1].trim();
    if (name && !names.includes(name) && name.length > 1) {
      names.push(name);
    }
  }

  // Pattern 2: <h3>Name</h3> or <h3>1. Name</h3>
  const h3Regex = /<h3[^>]*>(?:\d+\.\s+)?([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)<\/h3>/g;
  while ((match = h3Regex.exec(html)) !== null) {
    const name = match[1].trim();
    if (name && !names.includes(name) && name.length > 1) {
      names.push(name);
    }
  }

  // Pattern 3: <h2>Name</h2> or <h2>1. Name</h2>
  const h2Regex = /<h2[^>]*>(?:\d+\.\s+)?([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)<\/h2>/g;
  while ((match = h2Regex.exec(html)) !== null) {
    const name = match[1].trim();
    if (name && !names.includes(name) && name.length > 1) {
      names.push(name);
    }
  }

  return names;
}

async function extractAllBlogNames() {
  try {
    console.log('🔍 Fetching all Baby Names blog posts from Firestore...\n');

    // Query all published blogs in Baby Names category
    const q = query(
      collection(db, 'blogs'),
      where('status', '==', 'published'),
      where('category', '==', 'Baby Names')
    );

    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      console.log('❌ No Baby Names blog posts found!');
      return;
    }

    console.log(`✅ Found ${snapshot.size} Baby Names blog posts\n`);

    const allNames = new Set();
    const blogData = [];

    snapshot.forEach(doc => {
      const post = doc.data();
      const names = extractFeaturedNames(post.content || '');

      blogData.push({
        title: post.title,
        slug: post.slug,
        namesCount: names.length,
        names: names
      });

      names.forEach(name => allNames.add(name));
    });

    console.log('📊 Blog Post Summary:\n');
    blogData.forEach((blog, i) => {
      console.log(`${i + 1}. ${blog.title}`);
      console.log(`   Slug: ${blog.slug}`);
      console.log(`   Names: ${blog.namesCount}`);
      console.log(`   ${blog.names.join(', ')}\n`);
    });

    console.log(`\n✅ Total unique names across all blogs: ${allNames.size}`);
    console.log(`📝 Unique names:`, Array.from(allNames).sort().join(', '));

    // Load existing database
    console.log('\n🔍 Checking which names are already in database...\n');
    const chunkPath = path.join(__dirname, 'public', 'data', 'names-chunk1.json');
    const chunk1 = JSON.parse(fs.readFileSync(chunkPath, 'utf8'));

    const existingNames = new Set(chunk1.map(n => n.name.toLowerCase()));
    const missingNames = Array.from(allNames).filter(name => !existingNames.has(name.toLowerCase()));

    console.log(`✅ ${allNames.size - missingNames.length} names already in database`);
    console.log(`❌ ${missingNames.length} names MISSING from database:\n`);

    if (missingNames.length > 0) {
      console.log(missingNames.join(', '));

      // Save to file for manual enrichment
      const outputPath = path.join(__dirname, 'blog-names-to-add.json');
      fs.writeFileSync(outputPath, JSON.stringify({
        allNames: Array.from(allNames).sort(),
        missingNames: missingNames.sort(),
        blogs: blogData,
        summary: {
          totalBlogs: snapshot.size,
          totalUniqueNames: allNames.size,
          namesInDatabase: allNames.size - missingNames.length,
          namesMissing: missingNames.length
        }
      }, null, 2));

      console.log(`\n💾 Saved analysis to: ${outputPath}`);
    } else {
      console.log('\n✅ All blog names are already in the database!');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    process.exit(0);
  }
}

// Run the extraction
extractAllBlogNames();
