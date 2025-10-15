/**
 * Find all blogs with self-referencing links (href="#")
 */

const https = require('https');

async function fetchBlogs() {
  return new Promise((resolve, reject) => {
    const url = 'https://firestore.googleapis.com/v1/projects/babynames-app-9fa2a/databases/(default)/documents/blogs';
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          const blogs = (parsed.documents || []).map(doc => {
            const fields = doc.fields || {};
            return {
              id: doc.name.split('/').pop(),
              title: fields.title?.stringValue || '',
              slug: fields.slug?.stringValue || '',
              content: fields.content?.stringValue || '',
              category: fields.category?.stringValue || '',
              status: fields.status?.stringValue || ''
            };
          }).filter(b => b.status === 'published');
          resolve(blogs);
        } catch (err) {
          reject(err);
        }
      });
    }).on('error', reject);
  });
}

async function findSelfReferencingLinks() {
  console.log('🔍 Scanning all blogs for self-referencing links (href="#")...\n');

  const blogs = await fetchBlogs();
  const blogsWithIssues = [];

  for (const blog of blogs) {
    const linkRegex = /<a[^>]+href=["']#["'][^>]*>([^<]+)<\/a>/gi;
    const matches = [];
    let match;

    while ((match = linkRegex.exec(blog.content)) !== null) {
      matches.push({
        text: match[1],
        fullMatch: match[0]
      });
    }

    if (matches.length > 0) {
      blogsWithIssues.push({
        id: blog.id,
        title: blog.title,
        slug: blog.slug,
        category: blog.category,
        selfRefLinks: matches
      });

      console.log(`❌ ${blog.title}`);
      console.log(`   Category: ${blog.category}`);
      console.log(`   Slug: ${blog.slug}`);
      console.log(`   Self-referencing links: ${matches.length}`);
      matches.forEach((m, i) => {
        console.log(`     ${i + 1}. "${m.text}"`);
      });
      console.log('');
    }
  }

  console.log(`\n📊 Summary:`);
  console.log(`   Total blogs scanned: ${blogs.length}`);
  console.log(`   Blogs with self-referencing links: ${blogsWithIssues.length}`);
  console.log(`   Total self-referencing links: ${blogsWithIssues.reduce((sum, b) => sum + b.selfRefLinks.length, 0)}`);

  // Save report
  const fs = require('fs');
  fs.writeFileSync('self-referencing-links-report.json', JSON.stringify(blogsWithIssues, null, 2));
  console.log('\n📄 Full report saved to: self-referencing-links-report.json\n');

  return blogsWithIssues;
}

findSelfReferencingLinks()
  .then(() => process.exit(0))
  .catch(err => {
    console.error('Error:', err);
    process.exit(1);
  });
