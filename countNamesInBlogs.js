/**
 * Count names in all Baby Names category blogs
 */

const { initializeApp } = require('firebase/app');
const { getFirestore, collection, query, where, getDocs } = require('firebase/firestore');

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyCydKy79vU999mXO60x-mmg8MRuozPCqqE",
  authDomain: "babynames-app-9fa2a.firebaseapp.com",
  projectId: "babynames-app-9fa2a",
  storageBucket: "babynames-app-9fa2a.appspot.com",
  messagingSenderId: "792099154161",
  appId: "1:792099154161:web:1a5b0d4e7f8c9d0e1f2a3b"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Extract names from blog content
function extractNames(html) {
  const names = new Set();

  // Match pattern: <strong>Name</strong> or <strong>1. Name</strong>
  const strongRegex = /<strong>(?:\d+\.\s+)?([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)<\/strong>/g;

  let match;
  while ((match = strongRegex.exec(html)) !== null) {
    const name = match[1].trim();
    // Filter out common non-name words
    if (name.length > 1 && !['The', 'This', 'That', 'Here', 'There', 'When', 'Where', 'What', 'Why', 'How'].includes(name)) {
      names.add(name);
    }
  }

  return Array.from(names);
}

async function countNames() {
  console.log('🔍 Counting names in all Baby Names category blogs...\n');

  try {
    const q = query(
      collection(db, 'blogs'),
      where('category', '==', 'Baby Names'),
      where('status', '==', 'published')
    );

    const snapshot = await getDocs(q);
    const results = [];

    snapshot.forEach((doc) => {
      const data = doc.data();
      const names = extractNames(data.content || '');

      results.push({
        id: doc.id,
        slug: data.slug,
        title: data.title,
        nameCount: names.length,
        names: names,
        needsExpansion: names.length < 30
      });
    });

    // Sort by name count (ascending)
    results.sort((a, b) => a.nameCount - b.nameCount);

    console.log('📊 Baby Names Blogs - Name Count Analysis:\n');

    results.forEach((blog, i) => {
      const status = blog.needsExpansion ? '⚠️  NEEDS EXPANSION' : '✅ OK';
      console.log(`${i + 1}. ${blog.title}`);
      console.log(`   Names: ${blog.nameCount} ${status}`);
      console.log(`   Slug: ${blog.slug}`);
      console.log('');
    });

    const needsExpansion = results.filter(b => b.needsExpansion);

    console.log('\n📈 Summary:');
    console.log(`   Total Baby Names blogs: ${results.length}`);
    console.log(`   Blogs with <30 names: ${needsExpansion.length}`);
    console.log(`   Blogs with ≥30 names: ${results.length - needsExpansion.length}`);

    if (needsExpansion.length > 0) {
      console.log('\n\n⚠️  Blogs Needing Expansion:');
      needsExpansion.forEach((blog, i) => {
        console.log(`\n${i + 1}. ${blog.title}`);
        console.log(`   Current: ${blog.nameCount} names`);
        console.log(`   Need: ${30 - blog.nameCount} more names`);
        console.log(`   Slug: ${blog.slug}`);
      });
    }

    // Save detailed report
    const fs = require('fs');
    fs.writeFileSync('blog-name-counts.json', JSON.stringify(results, null, 2));
    console.log('\n\n📄 Full report saved to: blog-name-counts.json');

    process.exit(0);

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

countNames();
