#!/usr/bin/env node

/**
 * V11 BLOG HTML GENERATOR
 *
 * Generates beautiful blog-style HTML pages from V11 enriched JSON
 * Nameberry-inspired design with warm, readable layout
 */

const fs = require('fs');
const path = require('path');

// Get name from command line
const nameLower = process.argv[2];
if (!nameLower) {
  console.error('Usage: node generate-v11-blog-html.js <name>');
  console.error('   or: node generate-v11-blog-html.js all');
  process.exit(1);
}

const enrichedDir = path.join(__dirname, '..', 'public', 'data', 'enriched');
const profilesDir = path.join(__dirname, '..', 'public', 'profiles', 'v11');

// Create v11 subdirectory
if (!fs.existsSync(profilesDir)) {
  fs.mkdirSync(profilesDir, { recursive: true });
}

// Generate HTML for a single name
function generateHTML(name) {
  const v11Path = path.join(enrichedDir, `${name}-v11.json`);

  if (!fs.existsSync(v11Path)) {
    console.log(`⏭️  Skipping ${name} - no V11 data`);
    return false;
  }

  const data = JSON.parse(fs.readFileSync(v11Path, 'utf-8'));
  const blog = data.v11BlogContent;

  if (!blog) {
    console.log(`⏭️  Skipping ${name} - no blog content`);
    return false;
  }

  const nameCapitalized = name.charAt(0).toUpperCase() + name.slice(1);

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${nameCapitalized}: The Complete Guide | SoulSeed Baby Names</title>

  <!-- SEO Meta Tags -->
  <meta name="description" content="Discover everything about the name ${nameCapitalized} - meaning, origin, famous bearers, personality traits, and more. ${data.meaning || ''}">
  <meta name="keywords" content="${nameCapitalized}, baby names, ${data.origin} names, ${data.gender} names, name meaning">
  <meta name="author" content="SoulSeed">

  <!-- Open Graph -->
  <meta property="og:title" content="${nameCapitalized}: The Complete Guide | SoulSeed">
  <meta property="og:description" content="${data.meaning} - ${data.origin} origin">
  <meta property="og:type" content="article">

  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: 'Georgia', 'Cambria', serif;
      line-height: 1.8;
      color: #2c3e50;
      background: linear-gradient(135deg, #FFF9FC 0%, #F5EBFF 100%);
      padding: 40px 20px;
    }

    .container {
      max-width: 800px;
      margin: 0 auto;
      background: white;
      padding: 60px;
      border-radius: 20px;
      box-shadow: 0 10px 50px rgba(0,0,0,0.08);
    }

    /* Hero Section */
    .hero {
      text-align: center;
      margin-bottom: 50px;
      padding-bottom: 40px;
      border-bottom: 2px solid #F5EBFF;
    }

    .hero h1 {
      font-size: 4em;
      color: #7C3E94;
      margin-bottom: 10px;
      font-weight: 700;
    }

    .hero .subtitle {
      font-size: 1.3em;
      color: #888;
      font-style: italic;
      margin-bottom: 20px;
    }

    .meta {
      display: flex;
      justify-content: center;
      gap: 30px;
      margin-top: 20px;
      font-family: 'Inter', sans-serif;
    }

    .meta-item {
      text-align: center;
    }

    .meta-label {
      font-size: 0.85em;
      color: #888;
      text-transform: uppercase;
      letter-spacing: 1px;
    }

    .meta-value {
      font-size: 1.1em;
      color: #7C3E94;
      font-weight: 600;
      margin-top: 5px;
    }

    /* Blog Sections */
    .blog-section {
      margin-bottom: 50px;
    }

    .blog-section h2 {
      font-size: 2em;
      color: #7C3E94;
      margin-bottom: 20px;
      font-weight: 600;
      position: relative;
      padding-bottom: 10px;
    }

    .blog-section h2:after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 0;
      width: 60px;
      height: 3px;
      background: #FFB3D9;
    }

    .blog-section p {
      margin-bottom: 20px;
      font-size: 1.1em;
      line-height: 1.9;
    }

    .blog-section p:first-of-type::first-letter {
      font-size: 3.5em;
      float: left;
      line-height: 0.9;
      margin: 0.05em 0.1em 0 0;
      color: #7C3E94;
      font-weight: 700;
    }

    /* Footer */
    .footer {
      margin-top: 60px;
      padding-top: 40px;
      border-top: 2px solid #F5EBFF;
      text-align: center;
      color: #888;
      font-family: 'Inter', sans-serif;
    }

    .cta {
      background: linear-gradient(135deg, #7C3E94 0%, #FFB3D9 100%);
      color: white;
      padding: 20px 40px;
      border-radius: 30px;
      text-decoration: none;
      display: inline-block;
      margin-top: 20px;
      font-weight: 600;
      transition: transform 0.3s ease;
    }

    .cta:hover {
      transform: translateY(-3px);
    }

    /* Print Styles */
    @media print {
      body {
        background: white;
        padding: 0;
      }

      .container {
        box-shadow: none;
        padding: 20px;
      }

      .cta {
        display: none;
      }
    }

    /* Mobile Responsive */
    @media (max-width: 768px) {
      .container {
        padding: 30px 20px;
      }

      .hero h1 {
        font-size: 2.5em;
      }

      .meta {
        flex-direction: column;
        gap: 15px;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <!-- Hero Section -->
    <div class="hero">
      <h1>${nameCapitalized}</h1>
      <p class="subtitle">"${data.meaning}"</p>

      <div class="meta">
        <div class="meta-item">
          <div class="meta-label">Origin</div>
          <div class="meta-value">${data.origin}</div>
        </div>
        <div class="meta-item">
          <div class="meta-label">Gender</div>
          <div class="meta-value">${data.gender.charAt(0).toUpperCase() + data.gender.slice(1)}</div>
        </div>
        ${data.ranking?.current ? `
        <div class="meta-item">
          <div class="meta-label">Popularity</div>
          <div class="meta-value">#${data.ranking.current}</div>
        </div>` : ''}
      </div>
    </div>

    <!-- Blog Content -->
    <div class="blog-section">
      <h2>Why ${nameCapitalized} Captures Hearts</h2>
      ${blog.opening_hook.split('\n\n').map(para => `<p>${para}</p>`).join('')}
    </div>

    <div class="blog-section">
      <h2>The Story Behind the Name</h2>
      ${blog.etymology_meaning.split('\n\n').map(para => `<p>${para}</p>`).join('')}
    </div>

    <div class="blog-section">
      <h2>Famous ${nameCapitalized}s Who Made History</h2>
      ${blog.famous_bearers.split('\n\n').map(para => `<p>${para}</p>`).join('')}
    </div>

    <div class="blog-section">
      <h2>${nameCapitalized} in Pop Culture</h2>
      ${blog.pop_culture_moments.split('\n\n').map(para => `<p>${para}</p>`).join('')}
    </div>

    <div class="blog-section">
      <h2>The ${nameCapitalized} Personality</h2>
      ${blog.personality_profile.split('\n\n').map(para => `<p>${para}</p>`).join('')}
    </div>

    <div class="blog-section">
      <h2>Variations & Nicknames</h2>
      ${blog.variations_nicknames.split('\n\n').map(para => `<p>${para}</p>`).join('')}
    </div>

    <div class="blog-section">
      <h2>Popularity & Trends</h2>
      ${blog.popularity_data.split('\n\n').map(para => `<p>${para}</p>`).join('')}
    </div>

    <div class="blog-section">
      <h2>Perfect Pairings</h2>
      ${blog.pairing_suggestions.split('\n\n').map(para => `<p>${para}</p>`).join('')}
    </div>

    <div class="blog-section">
      <h2>Cultural Heritage</h2>
      ${blog.cultural_context.split('\n\n').map(para => `<p>${para}</p>`).join('')}
    </div>

    <div class="blog-section">
      <h2>Is ${nameCapitalized} Right for You?</h2>
      ${blog.final_recommendation.split('\n\n').map(para => `<p>${para}</p>`).join('')}
    </div>

    <!-- Footer -->
    <div class="footer">
      <p>Enriched with GPT-4o • V11 Blog Format • ${new Date(data.v11EnrichedAt).toLocaleDateString()}</p>
      <a href="/" class="cta">Explore More Names</a>
    </div>
  </div>
</body>
</html>`;

  const htmlPath = path.join(profilesDir, `${name}.html`);
  fs.writeFileSync(htmlPath, html);
  console.log(`✅ Generated: ${name}.html`);
  return true;
}

// Main execution
if (nameLower === 'all') {
  // Generate for all V11 files
  const files = fs.readdirSync(enrichedDir);
  const v11Files = files.filter(f => f.endsWith('-v11.json'));

  console.log(`\n🌟 Generating V11 blog HTML for ${v11Files.length} names...\n`);

  let generated = 0;
  v11Files.forEach(file => {
    const name = file.replace('-v11.json', '');
    if (generateHTML(name)) {
      generated++;
    }
  });

  console.log(`\n✨ Generated ${generated} V11 blog profiles!`);
  console.log(`📂 Location: ${profilesDir}\n`);
} else {
  // Generate for single name
  console.log(`\n🌟 Generating V11 blog HTML for ${nameLower}...\n`);
  generateHTML(nameLower);
  console.log(`\n✨ Done!\n`);
}
