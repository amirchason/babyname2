/**
 * Sitemap Generator for SoulSeed Baby Names App
 * Generates sitemap.xml for better SEO indexing
 * 
 * Run: node generate-sitemap.js
 */

const fs = require('fs');
const path = require('path');

const DOMAIN = 'https://soulseedbaby.com';
const OUTPUT_PATH = path.join(__dirname, 'public', 'sitemap.xml');

// Static pages with priority and change frequency
const staticPages = [
  { url: '/', changefreq: 'daily', priority: '1.0', lastmod: new Date().toISOString().split('T')[0] },
  { url: '/names', changefreq: 'weekly', priority: '0.9', lastmod: new Date().toISOString().split('T')[0] },
  { url: '/swipe', changefreq: 'weekly', priority: '0.8', lastmod: new Date().toISOString().split('T')[0] },
  { url: '/blog', changefreq: 'weekly', priority: '0.7', lastmod: new Date().toISOString().split('T')[0] },
  { url: '/about', changefreq: 'monthly', priority: '0.6', lastmod: new Date().toISOString().split('T')[0] },
  { url: '/contact', changefreq: 'monthly', priority: '0.5', lastmod: new Date().toISOString().split('T')[0] },
];

// Generate XML
function generateSitemap() {
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

  // Add static pages
  staticPages.forEach(page => {
    xml += '  <url>\n';
    xml += `    <loc>${DOMAIN}${page.url}</loc>\n`;
    xml += `    <lastmod>${page.lastmod}</lastmod>\n`;
    xml += `    <changefreq>${page.changefreq}</changefreq>\n`;
    xml += `    <priority>${page.priority}</priority>\n`;
    xml += '  </url>\n';
  });

  xml += '</urlset>';

  return xml;
}

// Write sitemap to file
function writeSitemap() {
  const sitemap = generateSitemap();
  
  fs.writeFileSync(OUTPUT_PATH, sitemap, 'utf8');
  console.log(`✅ Sitemap generated successfully!`);
  console.log(`📁 Location: ${OUTPUT_PATH}`);
  console.log(`📊 Total URLs: ${staticPages.length}`);
  console.log(`🌐 Domain: ${DOMAIN}`);
  console.log('\n📋 Pages included:');
  staticPages.forEach(page => {
    console.log(`  - ${DOMAIN}${page.url} (priority: ${page.priority})`);
  });
}

// Run the generator
try {
  writeSitemap();
} catch (error) {
  console.error('❌ Error generating sitemap:', error);
  process.exit(1);
}
