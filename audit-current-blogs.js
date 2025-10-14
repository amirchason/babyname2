/**
 * AUDIT CURRENT BLOG POSTS
 * Check all published blog posts and count names in each
 */

const admin = require('firebase-admin');
const serviceAccount = require('./babynames-app-9fa2a-firebase-adminsdk-e1lte-8c68b4586c.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

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
    const snapshot = await db.collection('blogs')
      .where('status', '==', 'published')
      .get();

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

  } catch (error) {
    console.error('❌ Error:', error);
  }

  process.exit(0);
}

auditBlogs();
