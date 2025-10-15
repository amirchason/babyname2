/**
 * Blog Link Checker & Fixer
 * Checks all external links in blog posts and fixes broken ones
 */

const https = require('https');
const http = require('http');
const { URL } = require('url');

// Use Firebase REST API instead of Admin SDK (no service account needed)
const FIREBASE_PROJECT_ID = 'babynames-app-9fa2a';
const FIRESTORE_API_BASE = `https://firestore.googleapis.com/v1/projects/${FIREBASE_PROJECT_ID}/databases/(default)/documents`;

// Fetch blogs from Firestore REST API
async function fetchBlogs() {
  return new Promise((resolve, reject) => {
    const url = `${FIRESTORE_API_BASE}/blogs`;
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

// Extract all links from HTML content
function extractLinks(html) {
  const links = [];
  const linkRegex = /<a[^>]+href=["']([^"']+)["'][^>]*>([^<]+)<\/a>/gi;
  let match;

  while ((match = linkRegex.exec(html)) !== null) {
    const url = match[1];
    const text = match[2];

    // Only process external links (http/https)
    if (url.startsWith('http://') || url.startsWith('https://')) {
      links.push({ url, text, fullMatch: match[0] });
    }
  }

  return links;
}

// Test if a URL is accessible
function testLink(url) {
  return new Promise((resolve) => {
    try {
      const urlObj = new URL(url);
      const protocol = urlObj.protocol === 'https:' ? https : http;

      const options = {
        method: 'HEAD',
        timeout: 10000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      };

      const req = protocol.request(url, options, (res) => {
        resolve({
          url,
          status: res.statusCode,
          working: res.statusCode >= 200 && res.statusCode < 400,
          redirected: res.statusCode >= 300 && res.statusCode < 400,
          finalUrl: res.headers.location || url
        });
      });

      req.on('error', (err) => {
        resolve({
          url,
          status: 0,
          working: false,
          error: err.message
        });
      });

      req.on('timeout', () => {
        req.destroy();
        resolve({
          url,
          status: 0,
          working: false,
          error: 'Timeout'
        });
      });

      req.end();
    } catch (err) {
      resolve({
        url,
        status: 0,
        working: false,
        error: err.message
      });
    }
  });
}

// Convert product link to Amazon search link
function createAmazonSearchLink(productName) {
  const searchTerm = encodeURIComponent(productName.trim());
  return `https://www.amazon.com/s?k=${searchTerm}`;
}

// Main function
async function checkAllBlogLinks() {
  console.log('🔍 Fetching all published blog posts...\n');

  try {
    const blogs = await fetchBlogs();

    console.log(`✅ Found ${blogs.length} published blogs\n`);

    const results = {
      totalBlogs: blogs.length,
      blogsWithLinks: 0,
      totalLinks: 0,
      brokenLinks: 0,
      fixedLinks: 0,
      details: []
    };

    for (const post of blogs) {
      const links = extractLinks(post.content);

      if (links.length === 0) continue;

      results.blogsWithLinks++;
      results.totalLinks += links.length;

      console.log(`\n${'='.repeat(80)}`);
      console.log(`📝 Blog: "${post.title}"`);
      console.log(`   Category: ${post.category}`);
      console.log(`   Links found: ${links.length}`);
      console.log(`${'='.repeat(80)}\n`);

      const blogReport = {
        id: post.id,
        title: post.title,
        slug: post.slug,
        category: post.category,
        links: [],
        needsUpdate: false
      };

      for (let i = 0; i < links.length; i++) {
        const link = links[i];
        console.log(`  [${i + 1}/${links.length}] Testing: ${link.url}`);
        console.log(`      Text: "${link.text}"`);

        const result = await testLink(link.url);

        let linkReport = {
          originalUrl: link.url,
          text: link.text,
          status: result.status,
          working: result.working,
          error: result.error
        };

        if (result.working) {
          console.log(`      ✅ Status: ${result.status} - Working!`);
        } else {
          console.log(`      ❌ BROKEN! ${result.error || `Status: ${result.status}`}`);
          results.brokenLinks++;

          // Check if it's a product link that should be Amazon search
          if (link.text.toLowerCase().includes('buy') ||
              link.text.toLowerCase().includes('shop') ||
              link.text.toLowerCase().includes('amazon')) {
            const productName = link.text.replace(/buy|shop|on amazon|here/gi, '').trim();
            const newUrl = createAmazonSearchLink(productName);
            console.log(`      🔧 Converting to Amazon search: ${newUrl}`);

            linkReport.suggestedFix = newUrl;
            linkReport.fixType = 'amazon-search';
            blogReport.needsUpdate = true;
          } else {
            console.log(`      ⚠️  Needs manual review`);
            linkReport.needsManualReview = true;
          }
        }

        blogReport.links.push(linkReport);
        console.log('');
      }

      results.details.push(blogReport);
    }

    // Print summary
    console.log(`\n${'='.repeat(80)}`);
    console.log('📊 SUMMARY');
    console.log(`${'='.repeat(80)}`);
    console.log(`Total blogs: ${results.totalBlogs}`);
    console.log(`Blogs with external links: ${results.blogsWithLinks}`);
    console.log(`Total external links: ${results.totalLinks}`);
    console.log(`Broken links: ${results.brokenLinks}`);
    console.log(`Blogs needing updates: ${results.details.filter(b => b.needsUpdate).length}`);

    // Save report
    const fs = require('fs');
    fs.writeFileSync(
      'blog-links-report.json',
      JSON.stringify(results, null, 2)
    );
    console.log('\n📄 Full report saved to: blog-links-report.json\n');

    return results;

  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  }
}

// Run the check
checkAllBlogLinks()
  .then(() => {
    console.log('✅ Link check complete!');
    process.exit(0);
  })
  .catch((err) => {
    console.error('💥 Fatal error:', err);
    process.exit(1);
  });
