/**
 * Enhanced Sitemap Generator for SoulSeed Baby Names App
 * Generates sitemap.xml with ALL blog posts from Firestore
 *
 * Run: node generate-sitemap-with-blog.js
 */

const fs = require('fs');
const path = require('path');
const admin = require('firebase-admin');

// Initialize Firebase Admin (using default credentials from .env)
const serviceAccount = require('./soulseed-firebase-adminsdk.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

const DOMAIN = 'https://soulseedbaby.com';
const OUTPUT_PATH = path.join(__dirname, 'public', 'sitemap.xml');

// Static pages with priority and change frequency
const staticPages = [
  { url: '/', changefreq: 'daily', priority: '1.0' },
  { url: '/swipe', changefreq: 'weekly', priority: '0.9' },
  { url: '/votes', changefreq: 'daily', priority: '0.8' },
  { url: '/create-vote', changefreq: 'weekly', priority: '0.7' },
  { url: '/blog', changefreq: 'weekly', priority: '0.9' },
  { url: '/about', changefreq: 'monthly', priority: '0.6' },
  { url: '/contact', changefreq: 'monthly', priority: '0.5' },
];

// Blog Category/Pillar pages (SEO-optimized landing pages)
const categoryPages = [
  { url: '/blog/baby-names', changefreq: 'weekly', priority: '0.8' },
  { url: '/blog/baby-milestones', changefreq: 'weekly', priority: '0.8' },
  { url: '/blog/baby-gear', changefreq: 'weekly', priority: '0.8' },
  { url: '/blog/pregnancy', changefreq: 'weekly', priority: '0.8' },
  { url: '/blog/postpartum', changefreq: 'weekly', priority: '0.8' },
  { url: '/blog/personal-blogs', changefreq: 'weekly', priority: '0.8' },
];

// Fetch blog posts from Firestore
async function fetchBlogPosts() {
  console.log('🔄 Fetching blog posts from Firestore...');

  try {
    const blogsRef = db.collection('blogs');
    const snapshot = await blogsRef.where('status', '==', 'published').get();

    const blogPages = [];
    snapshot.forEach(doc => {
      const data = doc.data();
      blogPages.push({
        url: `/blog/${data.slug}`,
        changefreq: 'weekly',
        priority: '0.7',
        lastmod: data.updatedAt?.toDate?.()?.toISOString().split('T')[0] || new Date().toISOString().split('T')[0]
      });
    });

    console.log(`✅ Found ${blogPages.length} published blog posts`);
    return blogPages;
  } catch (error) {
    console.error('❌ Error fetching blog posts:', error);
    return [];
  }
}

// Generate XML sitemap
function generateSitemap(allPages) {
  const today = new Date().toISOString().split('T')[0];

  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"\n';
  xml += '        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"\n';
  xml += '        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9\n';
  xml += '        http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">\n';

  // Add static pages
  xml += '  <!-- Static Pages -->\n';
  staticPages.forEach(page => {
    xml += '  <url>\n';
    xml += `    <loc>${DOMAIN}${page.url}</loc>\n`;
    xml += `    <lastmod>${page.lastmod || today}</lastmod>\n`;
    xml += `    <changefreq>${page.changefreq}</changefreq>\n`;
    xml += `    <priority>${page.priority}</priority>\n`;
    xml += '  </url>\n';
  });

  // Add category landing pages
  xml += '\n  <!-- Blog Category Pages (SEO Landing Pages) -->\n';
  categoryPages.forEach(page => {
    xml += '  <url>\n';
    xml += `    <loc>${DOMAIN}${page.url}</loc>\n`;
    xml += `    <lastmod>${page.lastmod || today}</lastmod>\n`;
    xml += `    <changefreq>${page.changefreq}</changefreq>\n`;
    xml += `    <priority>${page.priority}</priority>\n`;
    xml += '  </url>\n';
  });

  // Add blog posts
  xml += '\n  <!-- Blog Posts -->\n';
  const blogPages = allPages.filter(p => p.url.startsWith('/blog/'));

  blogPages.forEach(page => {
    xml += '  <url>\n';
    xml += `    <loc>${DOMAIN}${page.url}</loc>\n`;
    xml += `    <lastmod>${page.lastmod}</lastmod>\n`;
    xml += `    <changefreq>${page.changefreq}</changefreq>\n`;
    xml += `    <priority>${page.priority}</priority>\n`;
    xml += '  </url>\n';
  });

  xml += '</urlset>\n';

  return xml;
}

// Write sitemap to file
async function writeSitemap() {
  console.log('🚀 Starting sitemap generation...\n');

  // Fetch blog posts
  const blogPages = await fetchBlogPosts();

  // Combine all pages
  const allPages = [...staticPages, ...pillarPages, ...blogPages];

  // Generate sitemap XML
  const sitemap = generateSitemap(allPages);

  // Write to file
  fs.writeFileSync(OUTPUT_PATH, sitemap, 'utf8');

  // Print summary
  console.log('\n✅ Sitemap generated successfully!');
  console.log(`📁 Location: ${OUTPUT_PATH}`);
  console.log(`📊 Total URLs: ${allPages.length}`);
  console.log(`🌐 Domain: ${DOMAIN}`);
  console.log('\n📋 Breakdown:');
  console.log(`  - Static pages: ${staticPages.length}`);
  console.log(`  - Pillar hub pages: ${pillarPages.length}`);
  console.log(`  - Blog posts: ${blogPages.length}`);
  console.log('\n🎯 Priority distribution:');
  console.log(`  - Priority 1.0: ${allPages.filter(p => p.priority === '1.0').length} (Homepage)`);
  console.log(`  - Priority 0.9: ${allPages.filter(p => p.priority === '0.9').length} (Core features)`);
  console.log(`  - Priority 0.8: ${allPages.filter(p => p.priority === '0.8').length} (Pillar hubs)`);
  console.log(`  - Priority 0.7: ${allPages.filter(p => p.priority === '0.7').length} (Blog posts)`);
  console.log('\n🔍 Next steps:');
  console.log('  1. Deploy to production: npm run deploy');
  console.log('  2. Submit to Google Search Console: https://search.google.com/search-console');
  console.log('  3. Request indexing for priority pages manually');

  // Close Firebase connection
  await admin.app().delete();
}

// Run the generator
writeSitemap().catch(error => {
  console.error('❌ Error generating sitemap:', error);
  process.exit(1);
});
