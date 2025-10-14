/**
 * AUDIT CURRENT BLOG POSTS (Using Web SDK)
 * Check all published blog posts and count names in each
 */

const { initializeApp } = require('firebase/app');
const { getFirestore, collection, query, where, getDocs } = require('firebase/firestore');
require('dotenv').config();

const firebaseConfig = {
  apiKey: process.env.REACT_APP_GOOGLE_API_KEY,
  authDomain: "babynames-app-9fa2a.firebaseapp.com",
  projectId: "babynames-app-9fa2a",
  storageBucket: "babynames-app-9fa2a.firebasestorage.app",
  messagingSenderId: "945851717815",
  appId: "1:945851717815:web:7c4b36d71d3d3e4e2f5b8e"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Extract names from HTML content
function extractNames(html) {
  const names = [];
  const strongRegex = /<strong>(?:\d+\.\s+)?([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)<\/strong>/g;
  let match;

  while ((match = strongRegex.exec(html)) !== null) {
    const name = match[1].trim();
    if (name && !names.includes(name)) {
      names.push(name);
    }
  }

  return names;
}

async function auditBlogs() {
  console.log('🔍 Auditing Current Blog Posts\n');

  try {
    const q = query(
      collection(db, 'blogs'),
      where('status', '==', 'published')
    );

    const snapshot = await getDocs(q);
    console.log(`📚 Found ${snapshot.size} published blog posts\n`);

    const results = [];

    snapshot.forEach(doc => {
      const data = doc.data();
      const names = extractNames(data.content);

      results.push({
        id: doc.id,
        title: data.title,
        slug: data.slug,
        category: data.category,
        namesCount: names.length,
        names: names,
        wordCount: data.stats?.wordCount || 0,
        readingTime: data.stats?.readingTime || 0
      });
    });

    // Sort by names count (ascending to see which need most work)
    results.sort((a, b) => a.namesCount - b.namesCount);

    console.log('📊 BLOG POST AUDIT RESULTS:\n');
    console.log('═'.repeat(80));

    results.forEach((post, index) => {
      console.log(`\n${index + 1}. ${post.title}`);
      console.log(`   Slug: ${post.slug}`);
      console.log(`   Category: ${post.category}`);
      console.log(`   Names: ${post.namesCount} ${post.namesCount < 50 ? '⚠️  NEEDS REWRITE' : '✅'}`);
      console.log(`   Words: ${post.wordCount}`);
      console.log(`   Reading time: ${post.readingTime} min`);
      console.log(`   First 10 names: ${post.names.slice(0, 10).join(', ')}`);
    });

    console.log('\n' + '═'.repeat(80));
    console.log('\n📈 SUMMARY:');
    console.log(`   Total posts: ${results.length}`);
    console.log(`   Posts with <50 names: ${results.filter(p => p.namesCount < 50).length}`);
    console.log(`   Posts with ≥50 names: ${results.filter(p => p.namesCount >= 50).length}`);
    console.log(`   Average names per post: ${Math.round(results.reduce((sum, p) => sum + p.namesCount, 0) / results.length)}`);

    // Save detailed report
    const fs = require('fs');
    fs.writeFileSync('blog-audit-report.json', JSON.stringify(results, null, 2));
    console.log('\n💾 Detailed report saved to: blog-audit-report.json');

    return results;

  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  }
}

auditBlogs()
  .then(() => process.exit(0))
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
