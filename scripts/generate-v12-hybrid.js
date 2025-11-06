#!/usr/bin/env node

/**
 * V12 HYBRID PROFILE GENERATOR
 *
 * Combines V10 structured data + V11 Writers blog
 * Blog content in collapsible accordion after hero section
 */

const fs = require('fs');
const path = require('path');

const nameLower = process.argv[2];
if (!nameLower) {
  console.error('Usage: node generate-v12-hybrid.js <name>');
  console.error('   or: node generate-v12-hybrid.js all');
  process.exit(1);
}

const enrichedDir = path.join(__dirname, '..', 'public', 'data', 'enriched');
const v12Dir = path.join(__dirname, '..', 'public', 'profiles', 'v12');

if (!fs.existsSync(v12Dir)) {
  fs.mkdirSync(v12Dir, { recursive: true });
}

function generateV12HTML(name) {
  const v10Path = path.join(enrichedDir, `${name}-v10.json`);
  const v11Path = path.join(enrichedDir, `${name}-v11.json`);

  if (!fs.existsSync(v10Path)) {
    console.log(`⏭️  Skipping ${name} - no V10 data`);
    return false;
  }

  if (!fs.existsSync(v11Path)) {
    console.log(`⏭️  Skipping ${name} - no V11 data`);
    return false;
  }

  const v10 = JSON.parse(fs.readFileSync(v10Path, 'utf-8'));
  const v11 = JSON.parse(fs.readFileSync(v11Path, 'utf-8'));
  const blog = v11.v11BlogContent;

  if (!blog) {
    console.log(`⏭️  Skipping ${name} - no blog content`);
    return false;
  }

  const nameCapitalized = name.charAt(0).toUpperCase() + name.slice(1);
  const writerName = v11.v11WriterName || 'SoulSeed Writer';
  const writerTitle = v11.v11WriterTitle || 'Name Expert';

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${nameCapitalized} - Complete Name Profile | SoulSeed</title>

  <meta name="description" content="${v10.meaning} - ${v10.origin} origin. Comprehensive profile with expert insights, cultural significance, famous bearers, and more.">

  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }

    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
      line-height: 1.6;
      color: #2c3e50;
      background: linear-gradient(135deg, #FFF9FC 0%, #F5EBFF 100%);
      padding: 20px;
    }

    .container {
      max-width: 900px;
      margin: 0 auto;
      background: white;
      border-radius: 20px;
      box-shadow: 0 10px 50px rgba(0,0,0,0.08);
      overflow: hidden;
    }

    /* Hero Section */
    .hero {
      background: linear-gradient(135deg, #7C3E94 0%, #FFB3D9 100%);
      color: white;
      padding: 60px 40px;
      text-align: center;
    }

    .hero h1 {
      font-size: 4em;
      font-weight: 700;
      margin-bottom: 10px;
    }

    .hero .meaning {
      font-size: 1.5em;
      font-style: italic;
      margin-bottom: 20px;
      opacity: 0.95;
    }

    .hero .meta {
      display: flex;
      justify-content: center;
      gap: 30px;
      font-size: 1.1em;
      margin-top: 20px;
    }

    .hero .meta-item {
      background: rgba(255,255,255,0.2);
      padding: 8px 20px;
      border-radius: 20px;
      backdrop-filter: blur(10px);
    }

    /* Writer's Story Accordion */
    .accordion {
      margin: 30px;
      border: 2px solid #F5EBFF;
      border-radius: 15px;
      overflow: hidden;
      transition: all 0.3s ease;
    }

    .accordion-header {
      background: linear-gradient(135deg, #F5EBFF 0%, #FFE4F3 100%);
      padding: 25px 30px;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 15px;
      transition: background 0.3s ease;
    }

    .accordion-header:hover {
      background: linear-gradient(135deg, #E8D9FF 0%, #FFD4ED 100%);
    }

    .accordion-icon {
      font-size: 1.5em;
      transition: transform 0.3s ease;
    }

    .accordion.open .accordion-icon {
      transform: rotate(90deg);
    }

    .accordion-title {
      flex: 1;
    }

    .accordion-title h2 {
      font-size: 1.5em;
      color: #7C3E94;
      margin-bottom: 5px;
    }

    .accordion-title .writer-badge {
      font-size: 0.9em;
      color: #888;
    }

    .accordion-preview {
      font-size: 0.95em;
      color: #666;
      font-style: italic;
      margin-top: 10px;
      line-height: 1.5;
    }

    .accordion-content {
      max-height: 0;
      overflow: hidden;
      transition: max-height 0.5s ease;
      background: white;
    }

    .accordion.open .accordion-content {
      max-height: 10000px;
    }

    .accordion-inner {
      padding: 40px;
      font-family: Georgia, serif;
      line-height: 1.9;
    }

    .blog-section {
      margin-bottom: 40px;
    }

    .blog-section h3 {
      font-size: 1.8em;
      color: #7C3E94;
      margin-bottom: 15px;
      font-weight: 600;
    }

    .blog-section p {
      margin-bottom: 15px;
      font-size: 1.05em;
    }

    .writer-credit {
      border-top: 2px solid #F5EBFF;
      padding-top: 20px;
      margin-top: 30px;
      text-align: center;
      color: #888;
      font-size: 0.95em;
    }

    /* V10 Structured Data */
    .content {
      padding: 40px;
    }

    .section {
      margin-bottom: 50px;
      padding-bottom: 30px;
      border-bottom: 1px solid #F5EBFF;
    }

    .section:last-child {
      border-bottom: none;
    }

    .section-title {
      font-size: 1.8em;
      color: #7C3E94;
      margin-bottom: 20px;
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .section-number {
      background: linear-gradient(135deg, #7C3E94 0%, #FFB3D9 100%);
      color: white;
      width: 35px;
      height: 35px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.8em;
      font-weight: 700;
    }

    .person-card {
      background: #F9F9F9;
      padding: 20px;
      border-radius: 10px;
      margin-bottom: 15px;
    }

    .person-card h4 {
      color: #7C3E94;
      margin-bottom: 8px;
    }

    .person-card .meta {
      color: #888;
      font-size: 0.9em;
      margin-bottom: 10px;
    }

    .person-card ul {
      margin-left: 20px;
    }

    .tags {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
      margin-top: 15px;
    }

    .tag {
      background: #F5EBFF;
      color: #7C3E94;
      padding: 5px 15px;
      border-radius: 15px;
      font-size: 0.9em;
    }

    /* Mobile */
    @media (max-width: 768px) {
      .hero h1 { font-size: 2.5em; }
      .hero .meta { flex-direction: column; gap: 10px; }
      .accordion { margin: 20px; }
      .content { padding: 20px; }
    }

    /* Print */
    @media print {
      .accordion-content { max-height: none !important; }
      body { background: white; }
    }
  </style>
</head>
<body>
  <div class="container">
    <!-- Hero Section -->
    <div class="hero">
      <h1>${nameCapitalized}</h1>
      <div class="meaning">"${v10.meaning}"</div>
      <div class="meta">
        <div class="meta-item">${v10.origin} Origin</div>
        <div class="meta-item">${v10.gender.charAt(0).toUpperCase() + v10.gender.slice(1)}</div>
        ${v10.ranking?.current ? `<div class="meta-item">Ranked #${v10.ranking.current}</div>` : ''}
      </div>
    </div>

    <!-- Writer's Story Accordion -->
    <div class="accordion" id="writerStory">
      <div class="accordion-header" onclick="toggleAccordion()">
        <div class="accordion-icon">►</div>
        <div class="accordion-title">
          <h2>📖 Writer's Story</h2>
          <div class="writer-badge">by ${writerName}, ${writerTitle}</div>
          <div class="accordion-preview" id="preview">
            ${blog.opening_hook.substring(0, 200)}...
          </div>
        </div>
      </div>

      <div class="accordion-content">
        <div class="accordion-inner">
          <div class="blog-section">
            <h3>Why ${nameCapitalized} Captures Hearts</h3>
            ${blog.opening_hook.split('\n\n').map(p => `<p>${p}</p>`).join('')}
          </div>

          <div class="blog-section">
            <h3>The Story Behind the Name</h3>
            ${blog.etymology_meaning.split('\n\n').map(p => `<p>${p}</p>`).join('')}
          </div>

          <div class="blog-section">
            <h3>Famous ${nameCapitalized}s Who Made History</h3>
            ${blog.famous_bearers.split('\n\n').map(p => `<p>${p}</p>`).join('')}
          </div>

          <div class="blog-section">
            <h3>${nameCapitalized} in Pop Culture</h3>
            ${blog.pop_culture_moments.split('\n\n').map(p => `<p>${p}</p>`).join('')}
          </div>

          <div class="blog-section">
            <h3>The ${nameCapitalized} Personality</h3>
            ${blog.personality_profile.split('\n\n').map(p => `<p>${p}</p>`).join('')}
          </div>

          <div class="blog-section">
            <h3>Variations & Nicknames</h3>
            ${blog.variations_nicknames.split('\n\n').map(p => `<p>${p}</p>`).join('')}
          </div>

          <div class="blog-section">
            <h3>Popularity & Trends</h3>
            ${blog.popularity_data.split('\n\n').map(p => `<p>${p}</p>`).join('')}
          </div>

          <div class="blog-section">
            <h3>Perfect Pairings</h3>
            ${blog.pairing_suggestions.split('\n\n').map(p => `<p>${p}</p>`).join('')}
          </div>

          <div class="blog-section">
            <h3>Cultural Heritage</h3>
            ${blog.cultural_context.split('\n\n').map(p => `<p>${p}</p>`).join('')}
          </div>

          <div class="blog-section">
            <h3>Is ${nameCapitalized} Right for You?</h3>
            ${blog.final_recommendation.split('\n\n').map(p => `<p>${p}</p>`).join('')}
          </div>

          <div class="writer-credit">
            Written by <strong>${writerName}</strong>, ${writerTitle}<br>
            Part of the SoulSeed Writers Collective
          </div>
        </div>
      </div>
    </div>

    <!-- V10 Structured Data -->
    <div class="content">
      ${v10.culturalSignificance ? `
      <div class="section">
        <h2 class="section-title"><span class="section-number">1</span>Cultural Significance</h2>
        <p>${v10.culturalSignificance}</p>
      </div>
      ` : ''}

      ${v10.historicFigures?.length ? `
      <div class="section">
        <h2 class="section-title"><span class="section-number">2</span>Historical Figures</h2>
        ${v10.historicFigures.map(person => `
          <div class="person-card">
            <h4>${person.fullName}</h4>
            <div class="meta">${person.years} • ${person.category}</div>
            <p><strong>Significance:</strong> ${person.significance}</p>
            ${person.achievements?.length ? `<ul>${person.achievements.map(a => `<li>${a}</li>`).join('')}</ul>` : ''}
          </div>
        `).join('')}
      </div>
      ` : ''}

      ${v10.famousPeople?.length ? `
      <div class="section">
        <h2 class="section-title"><span class="section-number">3</span>Famous People</h2>
        ${v10.famousPeople.map(person => `
          <div class="person-card">
            <h4>${person.name}</h4>
            <div class="meta">${person.profession}</div>
            <p><strong>Known for:</strong> ${person.knownFor?.join(', ')}</p>
            ${person.awards ? `<p><strong>Awards:</strong> ${person.awards}</p>` : ''}
          </div>
        `).join('')}
      </div>
      ` : ''}

      ${v10.famousAthletes?.length ? `
      <div class="section">
        <h2 class="section-title"><span class="section-number">4</span>Famous Athletes</h2>
        ${v10.famousAthletes.map(athlete => `
          <div class="person-card">
            <h4>${athlete.name}</h4>
            <div class="meta">${athlete.sport} • ${athlete.team || 'Professional'}</div>
            <p><strong>Position:</strong> ${athlete.position || 'N/A'}</p>
            ${athlete.achievements ? `<p><strong>Achievements:</strong> ${athlete.achievements}</p>` : ''}
          </div>
        `).join('')}
      </div>
      ` : ''}

      ${v10.variations?.length ? `
      <div class="section">
        <h2 class="section-title"><span class="section-number">5</span>Variations & Similar Names</h2>
        <div class="tags">
          ${v10.variations.map(v => `<div class="tag">${v}</div>`).join('')}
        </div>
      </div>
      ` : ''}
    </div>
  </div>

  <script>
    function toggleAccordion() {
      const accordion = document.getElementById('writerStory');
      const preview = document.getElementById('preview');
      accordion.classList.toggle('open');

      // Save state
      localStorage.setItem('accordion_${name}', accordion.classList.contains('open'));

      // Hide preview when open
      if (accordion.classList.contains('open')) {
        preview.style.display = 'none';
      } else {
        preview.style.display = 'block';
      }
    }

    // Restore state on load
    window.addEventListener('DOMContentLoaded', () => {
      const savedState = localStorage.getItem('accordion_${name}');
      if (savedState === 'true') {
        document.getElementById('writerStory').classList.add('open');
        document.getElementById('preview').style.display = 'none';
      }
    });
  </script>
</body>
</html>`;

  const htmlPath = path.join(v12Dir, `${name}.html`);
  fs.writeFileSync(htmlPath, html);
  console.log(`✅ Generated V12: ${name}.html`);
  return true;
}

// Main execution
if (nameLower === 'all') {
  const files = fs.readdirSync(enrichedDir);
  const v11Files = files.filter(f => f.endsWith('-v11.json'));

  console.log(`\n🎯 Generating V12 hybrid profiles for ${v11Files.length} names...\n`);

  let generated = 0;
  v11Files.forEach(file => {
    const name = file.replace('-v11.json', '');
    if (generateV12HTML(name)) {
      generated++;
    }
  });

  console.log(`\n✨ Generated ${generated} V12 hybrid profiles!`);
  console.log(`📂 Location: ${v12Dir}\n`);
} else {
  console.log(`\n🎯 Generating V12 hybrid for ${nameLower}...\n`);
  generateV12HTML(nameLower);
  console.log(`\n✨ Done!\n`);
}
