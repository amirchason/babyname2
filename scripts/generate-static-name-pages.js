/**
 * Generate Static HTML Pages for Top 1000 Baby Names
 *
 * This script creates SEO-optimized, WCAG-compliant static HTML pages
 * for the top 1000 baby names. These pages are crawlable by search engines
 * and provide excellent SEO value.
 *
 * Usage: node scripts/generate-static-name-pages.js
 */

const fs = require('fs');
const path = require('path');

// Configuration
const NUM_PAGES = 1000; // Generate top 1000 names
const OUTPUT_DIR = path.join(__dirname, '../public/names');
const SITEMAP_FILE = path.join(__dirname, '../public/sitemap-names.xml');

// Read name data
const namesData = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../public/data/names-chunk1.json'), 'utf8')
);

// Helper: Generate URL-friendly slug
function generateSlug(name) {
  return name
    .toLowerCase()
    .normalize('NFD') // Normalize unicode
    .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
    .replace(/[^a-z0-9]+/g, '-') // Replace non-alphanumeric with hyphens
    .replace(/^-+|-+$/g, ''); // Trim hyphens
}

// Helper: Escape HTML
function escapeHtml(text) {
  if (!text && text !== 0) return '';
  const str = String(text);
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// Helper: Get gender label
function getGenderLabel(genderObj) {
  if (!genderObj) return 'Unisex';
  const female = genderObj.Female || 0;
  const male = genderObj.Male || 0;

  if (female > 0.65) return 'Girl';
  if (male > 0.65) return 'Boy';
  return 'Unisex';
}

// Template: Generate HTML for a single name
function generateNameHTML(nameData) {
  const slug = generateSlug(nameData.name);
  const gender = getGenderLabel(nameData.gender);
  const meaning = nameData.meaningFull || nameData.meaning || 'Meaning not available';
  const origin = nameData.origin || 'Origin not specified';
  const etymology = nameData.meaningEtymology || '';

  const title = `${nameData.name} - Meaning, Origin & Popularity | SoulSeed`;
  const description = `Discover the meaning and origin of ${nameData.name}. ${meaning.substring(0, 150)}... Learn about ${nameData.name}'s popularity trends.`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="theme-color" content="#D8B2F2">

  <!-- SEO Meta Tags -->
  <title>${escapeHtml(title)}</title>
  <meta name="description" content="${escapeHtml(description)}">
  <meta name="keywords" content="${escapeHtml(nameData.name)}, baby name ${escapeHtml(nameData.name)}, ${escapeHtml(nameData.name)} meaning, ${escapeHtml(nameData.name)} origin, ${gender} names, ${origin} names">
  <link rel="canonical" href="https://soulseedbaby.com/names/${slug}.html">

  <!-- Open Graph / Social Media -->
  <meta property="og:type" content="article">
  <meta property="og:title" content="${escapeHtml(title)}">
  <meta property="og:description" content="${escapeHtml(description)}">
  <meta property="og:url" content="https://soulseedbaby.com/names/${slug}.html">
  <meta property="og:site_name" content="SoulSeed">
  <meta property="og:image" content="https://soulseedbaby.com/og-image.png">

  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${escapeHtml(title)}">
  <meta name="twitter:description" content="${escapeHtml(description)}">
  <meta name="twitter:image" content="https://soulseedbaby.com/og-image.png">

  <!-- Accessibility -->
  <meta name="robots" content="index, follow">

  <!-- Structured Data - Thing Schema for Name -->
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "Thing",
    "name": "${escapeHtml(nameData.name)}",
    "description": "${escapeHtml(meaning)}",
    "additionalProperty": [
      {
        "@type": "PropertyValue",
        "name": "Origin",
        "value": "${escapeHtml(origin)}"
      },
      {
        "@type": "PropertyValue",
        "name": "Gender",
        "value": "${escapeHtml(gender)}"
      }${etymology ? `,
      {
        "@type": "PropertyValue",
        "name": "Etymology",
        "value": "${escapeHtml(etymology)}"
      }` : ''}
    ]
  }
  </script>

  <!-- Breadcrumb Structured Data -->
  <script type="application/ld+json">
  {
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
        "name": "Names",
        "item": "https://soulseedbaby.com/names"
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": "${escapeHtml(nameData.name)}",
        "item": "https://soulseedbaby.com/names/${slug}.html"
      }
    ]
  }
  </script>

  <!-- Styles -->
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }

    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
      line-height: 1.6;
      color: #333;
      background: linear-gradient(135deg, #faf5ff 0%, #fff0f6 100%);
      min-height: 100vh;
      padding: 20px;
    }

    .container {
      max-width: 800px;
      margin: 0 auto;
      background: white;
      border-radius: 12px;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
      padding: 40px;
    }

    header {
      margin-bottom: 30px;
      border-bottom: 2px solid #D8B2F2;
      padding-bottom: 20px;
    }

    h1 {
      font-size: 2.5em;
      color: #6B21A8;
      margin-bottom: 10px;
    }

    .gender-badge {
      display: inline-block;
      padding: 5px 15px;
      border-radius: 20px;
      font-size: 0.9em;
      font-weight: 600;
      background: #FFB3D9;
      color: #831843;
    }

    .section {
      margin: 30px 0;
    }

    h2 {
      font-size: 1.5em;
      color: #6B21A8;
      margin-bottom: 15px;
    }

    .info-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 20px;
      margin: 20px 0;
    }

    .info-card {
      padding: 20px;
      background: #faf5ff;
      border-radius: 8px;
      border-left: 4px solid #D8B2F2;
    }

    .info-label {
      font-weight: 600;
      color: #6B21A8;
      font-size: 0.9em;
      text-transform: uppercase;
      margin-bottom: 5px;
    }

    .info-value {
      font-size: 1.1em;
      color: #333;
    }

    .cta-button {
      display: inline-block;
      padding: 15px 30px;
      background: #D8B2F2;
      color: #6B21A8;
      text-decoration: none;
      border-radius: 8px;
      font-weight: 600;
      transition: all 0.3s ease;
      margin-top: 20px;
    }

    .cta-button:hover {
      background: #c084f5;
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(107, 33, 168, 0.2);
    }

    .cta-button:focus {
      outline: 3px solid #6B21A8;
      outline-offset: 2px;
    }

    nav {
      margin-bottom: 20px;
    }

    nav a {
      color: #6B21A8;
      text-decoration: none;
      font-weight: 500;
    }

    nav a:hover {
      text-decoration: underline;
    }

    footer {
      margin-top: 50px;
      padding-top: 30px;
      border-top: 1px solid #e5e5e5;
      text-align: center;
      color: #666;
    }

    /* Accessibility: High contrast mode support */
    @media (prefers-contrast: high) {
      body {
        background: white;
        color: black;
      }
      .container {
        box-shadow: 0 0 0 2px black;
      }
    }

    /* Accessibility: Reduced motion */
    @media (prefers-reduced-motion: reduce) {
      *, *::before, *::after {
        animation-duration: 0.01ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.01ms !important;
      }
    }

    /* Mobile responsive */
    @media (max-width: 600px) {
      .container {
        padding: 20px;
      }
      h1 {
        font-size: 2em;
      }
      .info-grid {
        grid-template-columns: 1fr;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <!-- Breadcrumb Navigation -->
    <nav aria-label="Breadcrumb">
      <a href="/">Home</a> &gt;
      <a href="/names">Names</a> &gt;
      <span aria-current="page">${escapeHtml(nameData.name)}</span>
    </nav>

    <!-- Main Content -->
    <header>
      <h1>${escapeHtml(nameData.name)}</h1>
      <span class="gender-badge" role="text" aria-label="Gender category: ${gender}">${gender} Name</span>
    </header>

    <main>
      <section class="section">
        <h2>Meaning</h2>
        <p>${escapeHtml(meaning)}</p>
      </section>

      <div class="info-grid">
        <div class="info-card">
          <div class="info-label">Origin</div>
          <div class="info-value">${escapeHtml(origin)}</div>
        </div>

        <div class="info-card">
          <div class="info-label">Gender</div>
          <div class="info-value">${escapeHtml(gender)}</div>
        </div>

        ${nameData.popularityRank ? `
        <div class="info-card">
          <div class="info-label">Popularity Rank</div>
          <div class="info-value">#${escapeHtml(nameData.popularityRank.toLocaleString())}</div>
        </div>
        ` : ''}
      </div>

      ${etymology ? `
      <section class="section">
        <h2>Etymology</h2>
        <p>${escapeHtml(etymology)}</p>
      </section>
      ` : ''}

      <section class="section">
        <h2>Love this name?</h2>
        <p>Explore more unique baby names at SoulSeed - where your baby name blooms. Browse 150,000+ names with meanings, origins, and popularity trends.</p>
        <a href="/" class="cta-button" aria-label="Explore more names at SoulSeed">
          Explore More Names
        </a>
      </section>
    </main>

    <footer>
      <p>&copy; 2025 SoulSeed - Where Your Baby Name Blooms</p>
      <p><a href="/about" style="color: #6B21A8;">About Us</a> |
         <a href="/contact" style="color: #6B21A8;">Contact</a> |
         <a href="/sitemap.xml" style="color: #6B21A8;">Sitemap</a></p>
    </footer>
  </div>
</body>
</html>`;
}

// Main execution
console.log('🚀 Starting static name page generation...\n');

// Create output directory if it doesn't exist
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  console.log(`✅ Created directory: ${OUTPUT_DIR}`);
}

// Generate HTML pages for top 1000 names
const generatedPages = [];
const namesToProcess = namesData.slice(0, NUM_PAGES);

console.log(`📝 Generating ${namesToProcess.length} name pages...\n`);

namesToProcess.forEach((nameData, index) => {
  const slug = generateSlug(nameData.name);
  const html = generateNameHTML(nameData);
  const outputPath = path.join(OUTPUT_DIR, `${slug}.html`);

  try {
    fs.writeFileSync(outputPath, html, 'utf8');
    generatedPages.push({
      name: nameData.name,
      slug: slug,
      url: `/names/${slug}.html`
    });

    if ((index + 1) % 100 === 0) {
      console.log(`   ✓ Generated ${index + 1} pages...`);
    }
  } catch (error) {
    console.error(`   ✗ Error generating page for ${nameData.name}:`, error.message);
  }
});

console.log(`\n✅ Generated ${generatedPages.length} static HTML pages!\n`);

// Generate sitemap for these pages
console.log('📄 Generating sitemap-names.xml...\n');

const today = new Date().toISOString().split('T')[0];
const sitemapUrls = generatedPages.map(page => `
  <url>
    <loc>https://soulseedbaby.com${page.url}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>`).join('');

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemapUrls}
</urlset>`;

fs.writeFileSync(SITEMAP_FILE, sitemap, 'utf8');
console.log(`✅ Sitemap generated: ${SITEMAP_FILE}\n`);

// Generate index page for /names route
const indexHTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Baby Names Directory | SoulSeed</title>
  <meta name="description" content="Browse our complete directory of baby names with meanings, origins, and popularity rankings. Discover the perfect name for your baby.">
  <link rel="canonical" href="https://soulseedbaby.com/names/">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      line-height: 1.6;
      background: linear-gradient(135deg, #faf5ff 0%, #fff0f6 100%);
      padding: 20px;
    }
    .container {
      max-width: 1200px;
      margin: 0 auto;
      background: white;
      border-radius: 12px;
      padding: 40px;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    }
    h1 {
      font-size: 2.5em;
      color: #6B21A8;
      margin-bottom: 20px;
    }
    .name-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: 15px;
      margin-top: 30px;
    }
    .name-link {
      display: block;
      padding: 15px;
      background: #faf5ff;
      border-radius: 8px;
      text-decoration: none;
      color: #6B21A8;
      font-weight: 600;
      transition: all 0.3s ease;
      border: 2px solid transparent;
    }
    .name-link:hover, .name-link:focus {
      background: #D8B2F2;
      border-color: #6B21A8;
      transform: translateY(-2px);
    }
    @media (max-width: 600px) {
      .name-grid {
        grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>Baby Names Directory</h1>
    <p>Explore our collection of ${generatedPages.length} beautiful baby names, each with detailed meanings, origins, and cultural significance.</p>

    <div class="name-grid">
      ${generatedPages.slice(0, 100).map(page => `
        <a href="${page.url}" class="name-link">${escapeHtml(page.name)}</a>
      `).join('\n      ')}
    </div>

    <p style="margin-top: 40px; text-align: center;">
      <a href="/" style="color: #6B21A8; font-weight: 600;">← Back to Main App</a>
    </p>
  </div>
</body>
</html>`;

fs.writeFileSync(path.join(OUTPUT_DIR, 'index.html'), indexHTML, 'utf8');
console.log(`✅ Names directory index page created\n`);

// Summary
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('✨ GENERATION COMPLETE!\n');
console.log(`📊 Statistics:`);
console.log(`   • Pages generated: ${generatedPages.length}`);
console.log(`   • Output directory: ${OUTPUT_DIR}`);
console.log(`   • Sitemap: ${SITEMAP_FILE}`);
console.log(`   • Average file size: ~8KB per page`);
console.log(`   • Total size: ~${Math.round(generatedPages.length * 8 / 1024)}MB`);
console.log('\n🎯 Next steps:');
console.log('   1. Update main sitemap.xml to include sitemap-names.xml');
console.log('   2. Deploy to production (npm run deploy)');
console.log('   3. Submit sitemap to Google Search Console');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
