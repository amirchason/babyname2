/**
 * SAFE Static HTML Page Generator for ALL Baby Names (174K)
 *
 * FEATURES:
 * - Dry-run mode for validation
 * - Incremental generation (phases)
 * - Skip existing files (preserve 1000 current pages)
 * - Sort by popularity (not alphabetical)
 * - Progress logging
 * - Error handling
 * - Validation checks
 *
 * USAGE:
 * node scripts/generate-seo-pages-safe.js --dry-run         # Test without writing
 * node scripts/generate-seo-pages-safe.js --phase 1         # Generate first 10K
 * node scripts/generate-seo-pages-safe.js --phase 2         # Generate next batch
 * node scripts/generate-seo-pages-safe.js --count 100       # Generate specific count
 * node scripts/generate-seo-pages-safe.js --skip-existing   # Skip files that exist
 */

const fs = require('fs');
const path = require('path');

// ==================== CONFIGURATION ====================

const CONFIG = {
  outputDir: path.join(__dirname, '../public/names'),
  sitemapFile: path.join(__dirname, '../public/sitemap-names.xml'),
  chunksPath: path.join(__dirname, '../public/data'),
  domain: 'https://soulseedbaby.com',

  // Phase limits
  phases: {
    1: 10000,   // First 10K (includes existing 1K)
    2: 25000,   // First 25K
    3: 50000,   // First 50K
    4: 100000,  // First 100K
    5: 145644   // ALL names
  }
};

// ==================== DATA LOADING ====================

function loadAllNames() {
  console.log('📊 Loading name data from chunks...\n');

  const allNames = [];

  for (let i = 1; i <= 4; i++) {
    const chunkPath = path.join(CONFIG.chunksPath, `names-chunk${i}.json`);

    if (!fs.existsSync(chunkPath)) {
      console.warn(`⚠️  Chunk ${i} not found at ${chunkPath}`);
      continue;
    }

    try {
      const chunk = JSON.parse(fs.readFileSync(chunkPath, 'utf8'));
      allNames.push(...chunk);
      console.log(`   ✓ Loaded chunk ${i}: ${chunk.length.toLocaleString()} names`);
    } catch (error) {
      console.error(`   ✗ Error loading chunk ${i}:`, error.message);
    }
  }

  console.log(`\n✅ Total names loaded: ${allNames.length.toLocaleString()}\n`);

  // Sort by popularity (lower rank = more popular)
  allNames.sort((a, b) => {
    const rankA = a.popularityRank || a.popularity || 999999;
    const rankB = b.popularityRank || b.popularity || 999999;
    return rankA - rankB;
  });

  console.log('✅ Names sorted by popularity\n');
  console.log('Top 10 names:');
  allNames.slice(0, 10).forEach((n, i) => {
    console.log(`   ${i + 1}. ${n.name} (rank: ${n.popularityRank || n.popularity || 'N/A'})`);
  });
  console.log();

  return allNames;
}

// ==================== SLUG GENERATION ====================

function generateSlug(name) {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// ==================== HTML ESCAPING ====================

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

// ==================== GENDER DETECTION ====================

function getGenderLabel(genderObj) {
  if (!genderObj) return 'Unisex';
  const female = genderObj.Female || 0;
  const male = genderObj.Male || 0;

  if (female > 0.65) return 'Girl';
  if (male > 0.65) return 'Boy';
  return 'Unisex';
}

// ==================== HTML TEMPLATE ====================

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
  <link rel="canonical" href="${CONFIG.domain}/names/${slug}.html">

  <!-- Open Graph / Social Media -->
  <meta property="og:type" content="article">
  <meta property="og:title" content="${escapeHtml(title)}">
  <meta property="og:description" content="${escapeHtml(description)}">
  <meta property="og:url" content="${CONFIG.domain}/names/${slug}.html">
  <meta property="og:site_name" content="SoulSeed">
  <meta property="og:image" content="${CONFIG.domain}/og-image.png">

  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${escapeHtml(title)}">
  <meta name="twitter:description" content="${escapeHtml(description)}">
  <meta name="twitter:image" content="${CONFIG.domain}/og-image.png">

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
        "item": "${CONFIG.domain}"
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Names",
        "item": "${CONFIG.domain}/names"
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": "${escapeHtml(nameData.name)}",
        "item": "${CONFIG.domain}/names/${slug}.html"
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

// ==================== VALIDATION ====================

function validateNameData(nameData) {
  if (!nameData.name) {
    return { valid: false, error: 'Missing name field' };
  }

  const slug = generateSlug(nameData.name);
  if (!slug) {
    return { valid: false, error: 'Invalid slug generation' };
  }

  return { valid: true, slug };
}

// ==================== GENERATION ====================

function generatePages(allNames, options = {}) {
  const {
    dryRun = false,
    count = null,
    skipExisting = true,
    startFrom = 0
  } = options;

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🚀 STARTING PAGE GENERATION\n');
  console.log(`Mode: ${dryRun ? 'DRY RUN (no files written)' : 'LIVE (writing files)'}`);
  console.log(`Skip existing: ${skipExisting}`);
  console.log(`Start from: ${startFrom}`);
  console.log(`Count: ${count || 'ALL'}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  // Create output directory
  if (!dryRun && !fs.existsSync(CONFIG.outputDir)) {
    fs.mkdirSync(CONFIG.outputDir, { recursive: true });
    console.log(`✅ Created directory: ${CONFIG.outputDir}\n`);
  }

  // Determine names to process
  const namesToProcess = count
    ? allNames.slice(startFrom, startFrom + count)
    : allNames.slice(startFrom);

  const stats = {
    total: namesToProcess.length,
    generated: 0,
    skipped: 0,
    errors: 0,
    generatedPages: []
  };

  console.log(`📝 Processing ${stats.total.toLocaleString()} names...\n`);

  // Process each name
  namesToProcess.forEach((nameData, index) => {
    const validation = validateNameData(nameData);

    if (!validation.valid) {
      console.error(`   ✗ Invalid data for "${nameData.name}": ${validation.error}`);
      stats.errors++;
      return;
    }

    const { slug } = validation;
    const outputPath = path.join(CONFIG.outputDir, `${slug}.html`);

    // Check if file exists and skip if requested
    if (skipExisting && fs.existsSync(outputPath)) {
      stats.skipped++;

      if (stats.skipped <= 10) { // Only log first 10 skips
        console.log(`   ↷ Skipped ${nameData.name} (exists)`);
      }
      return;
    }

    // Generate HTML
    try {
      const html = generateNameHTML(nameData);

      // Validate HTML size (should be 5-15KB)
      const sizeKB = Buffer.byteLength(html, 'utf8') / 1024;
      if (sizeKB < 3 || sizeKB > 30) {
        console.warn(`   ⚠️  Unusual file size for ${nameData.name}: ${sizeKB.toFixed(1)}KB`);
      }

      // Write file (unless dry run)
      if (!dryRun) {
        fs.writeFileSync(outputPath, html, 'utf8');
      }

      stats.generated++;
      stats.generatedPages.push({
        name: nameData.name,
        slug: slug,
        url: `/names/${slug}.html`,
        rank: nameData.popularityRank || nameData.popularity
      });

      // Progress logging
      if (stats.generated % 100 === 0) {
        console.log(`   ✓ Generated ${stats.generated.toLocaleString()} pages...`);
      }

    } catch (error) {
      console.error(`   ✗ Error generating ${nameData.name}:`, error.message);
      stats.errors++;
    }
  });

  return stats;
}

// ==================== SITEMAP GENERATION ====================

function generateSitemap(pages, dryRun = false) {
  console.log('\n📄 Generating sitemap-names.xml...\n');

  const today = new Date().toISOString().split('T')[0];
  const sitemapUrls = pages.map(page => `
  <url>
    <loc>${CONFIG.domain}${page.url}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>`).join('');

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemapUrls}
</urlset>`;

  if (!dryRun) {
    fs.writeFileSync(CONFIG.sitemapFile, sitemap, 'utf8');
    console.log(`✅ Sitemap written: ${CONFIG.sitemapFile}\n`);
  } else {
    console.log(`✅ Sitemap validated (${pages.length} URLs)\n`);
  }
}

// ==================== MAIN EXECUTION ====================

function main() {
  const args = process.argv.slice(2);

  // Parse arguments
  const dryRun = args.includes('--dry-run');
  const skipExisting = args.includes('--skip-existing') || !args.includes('--overwrite');

  const phaseArg = args.find(arg => arg.startsWith('--phase='));
  const phase = phaseArg ? parseInt(phaseArg.split('=')[1]) : null;

  const countArg = args.find(arg => arg.startsWith('--count='));
  const count = countArg ? parseInt(countArg.split('=')[1]) : null;

  // Load data
  const allNames = loadAllNames();

  // Determine count based on phase or explicit count
  let targetCount = count;
  if (phase && CONFIG.phases[phase]) {
    targetCount = CONFIG.phases[phase];
    console.log(`📊 Phase ${phase}: Generating first ${targetCount.toLocaleString()} names\n`);
  }

  // Generate pages
  const stats = generatePages(allNames, {
    dryRun,
    count: targetCount,
    skipExisting,
    startFrom: 0
  });

  // Generate sitemap
  if (stats.generatedPages.length > 0) {
    generateSitemap(stats.generatedPages, dryRun);
  }

  // Print summary
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('✨ GENERATION COMPLETE!\n');
  console.log('📊 Statistics:');
  console.log(`   • Total processed: ${stats.total.toLocaleString()}`);
  console.log(`   • Pages generated: ${stats.generated.toLocaleString()}`);
  console.log(`   • Pages skipped: ${stats.skipped.toLocaleString()}`);
  console.log(`   • Errors: ${stats.errors}`);
  console.log(`   • Mode: ${dryRun ? 'DRY RUN' : 'LIVE'}`);

  if (!dryRun && stats.generated > 0) {
    console.log(`\n📁 Output:`);
    console.log(`   • Directory: ${CONFIG.outputDir}`);
    console.log(`   • Sitemap: ${CONFIG.sitemapFile}`);
    console.log(`   • Avg file size: ~8KB per page`);
    console.log(`   • Total size: ~${Math.round(stats.generated * 8 / 1024)}MB`);
  }

  console.log('\n🎯 Next steps:');

  if (dryRun) {
    console.log('   1. Run without --dry-run to generate files');
    console.log('   2. Test with smaller batch first (--count=100)');
  } else if (stats.generated > 0) {
    console.log('   1. Verify sample pages look correct');
    console.log('   2. Test React app: npm start');
    console.log('   3. Build for production: npm run build');
    console.log('   4. Deploy to Vercel: npm run deploy');
    console.log('   5. Submit sitemap to Google Search Console');
  }

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  // Exit with error code if there were errors
  if (stats.errors > 0) {
    console.error(`⚠️  Generation completed with ${stats.errors} errors\n`);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { generatePages, generateSitemap, loadAllNames };
