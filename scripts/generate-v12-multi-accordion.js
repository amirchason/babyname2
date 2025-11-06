#!/usr/bin/env node

/**
 * V12 HYBRID PROFILE GENERATOR - MULTI-ACCORDION VERSION
 *
 * Each section gets its own collapsible accordion with localStorage memory
 * V11 blog sections + V10 structured data sections
 */

const fs = require('fs');
const path = require('path');

const nameLower = process.argv[2];
if (!nameLower) {
  console.error('Usage: node generate-v12-multi-accordion.js <name>');
  console.error('   or: node generate-v12-multi-accordion.js all');
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

  // Generate individual accordion sections
  const sections = [];
  let sectionId = 0;

  // V11 Combined Blog Section
  const blogContent = [];

  if (blog.opening_hook) blogContent.push(blog.opening_hook);
  if (blog.etymology_meaning) blogContent.push(blog.etymology_meaning);
  if (blog.famous_bearers) blogContent.push(blog.famous_bearers);
  if (blog.pop_culture_moments) blogContent.push(blog.pop_culture_moments);
  if (blog.personality_profile) blogContent.push(blog.personality_profile);
  if (blog.variations_nicknames) blogContent.push(blog.variations_nicknames);
  if (blog.popularity_data) blogContent.push(blog.popularity_data);
  if (blog.pairing_suggestions) blogContent.push(blog.pairing_suggestions);
  if (blog.cultural_context) blogContent.push(blog.cultural_context);
  if (blog.final_recommendation) blogContent.push(blog.final_recommendation);

  if (blogContent.length > 0) {
    // Convert markdown H2 headers (##) to HTML and wrap paragraphs
    const fullBlogHTML = blogContent.join('\n\n')
      .split('\n\n')
      .map(block => {
        // Check if this is an H2 header (starts with ##)
        if (block.trim().startsWith('##')) {
          const headerText = block.trim().replace(/^##\s*/, '');
          return `<h2>${headerText}</h2>`;
        }
        // Otherwise it's a paragraph
        return `<p>${block}</p>`;
      })
      .join('');

    sections.push({
      id: `section-${sectionId++}`,
      icon: '📖',
      title: `The Story of ${nameCapitalized}`,
      subtitle: `Expert Analysis by ${writerName}`,
      content: fullBlogHTML
    });
  }

  // V10 Structured Data Sections
  if (v10.culturalSignificance) {
    sections.push({
      id: `section-${sectionId++}`,
      icon: '🏛️',
      title: 'Cultural Significance',
      subtitle: 'Historical & Social Context',
      content: `<p>${v10.culturalSignificance}</p>`
    });
  }

  if (v10.historicFigures?.length) {
    const figuresHTML = v10.historicFigures.map(person => `
      <div class="person-card">
        <h4>${person.fullName}</h4>
        <div class="meta">${person.years} • ${person.category}</div>
        <p><strong>Significance:</strong> ${person.significance}</p>
        ${person.achievements?.length ? `<ul>${person.achievements.map(a => `<li>${a}</li>`).join('')}</ul>` : ''}
      </div>
    `).join('');

    sections.push({
      id: `section-${sectionId++}`,
      icon: '👑',
      title: 'Historical Figures',
      subtitle: 'Notable Historical Bearers',
      content: figuresHTML
    });
  }

  if (v10.famousPeople?.length) {
    const peopleHTML = v10.famousPeople.map(person => `
      <div class="person-card">
        <h4>${person.name}</h4>
        <div class="meta">${person.profession}</div>
        <p><strong>Known for:</strong> ${person.knownFor?.join(', ')}</p>
        ${person.awards ? `<p><strong>Awards:</strong> ${person.awards}</p>` : ''}
      </div>
    `).join('');

    sections.push({
      id: `section-${sectionId++}`,
      icon: '🎭',
      title: 'Famous People',
      subtitle: 'Modern Celebrities & Icons',
      content: peopleHTML
    });
  }

  if (v10.famousAthletes?.length) {
    const athletesHTML = v10.famousAthletes.map(athlete => `
      <div class="person-card">
        <h4>${athlete.name}</h4>
        <div class="meta">${athlete.sport} • ${athlete.team || 'Professional'}</div>
        <p><strong>Position:</strong> ${athlete.position || 'N/A'}</p>
        ${athlete.achievements ? `<p><strong>Achievements:</strong> ${athlete.achievements}</p>` : ''}
      </div>
    `).join('');

    sections.push({
      id: `section-${sectionId++}`,
      icon: '🏆',
      title: 'Famous Athletes',
      subtitle: 'Sports Legends',
      content: athletesHTML
    });
  }

  if (v10.variations?.length) {
    const tagsHTML = v10.variations.map(v => `<div class="tag">${v}</div>`).join('');
    sections.push({
      id: `section-${sectionId++}`,
      icon: '🔠',
      title: 'Name Variations',
      subtitle: 'Similar Names',
      content: `<div class="tags">${tagsHTML}</div>`
    });
  }

  if (v10.nicknames?.length) {
    const nicknamesHTML = v10.nicknames.map(n => `<div class="tag">${n}</div>`).join('');
    sections.push({
      id: `section-${sectionId++}`,
      icon: '🏷️',
      title: 'Popular Nicknames',
      subtitle: 'Common Short Forms',
      content: `<div class="tags">${nicknamesHTML}</div>`
    });
  }

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${nameCapitalized} - Complete Name Profile | SoulSeed</title>

  <meta name="description" content="${v10.meaning} - ${v10.origin} origin. Comprehensive profile with expert insights.">

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

    .writer-credit {
      text-align: center;
      padding: 30px;
      background: #F5EBFF;
      border-bottom: 2px solid #E8D9FF;
    }

    .writer-credit h3 {
      color: #7C3E94;
      font-size: 1.2em;
      margin-bottom: 5px;
    }

    .writer-credit p {
      color: #888;
      font-size: 0.95em;
    }

    /* Accordion Sections */
    .content {
      padding: 20px;
    }

    .accordion-section {
      margin-bottom: 15px;
      border: 2px solid #F5EBFF;
      border-radius: 15px;
      overflow: hidden;
      transition: all 0.3s ease;
    }

    .accordion-section:hover {
      border-color: #E8D9FF;
    }

    .accordion-header {
      background: linear-gradient(135deg, #F5EBFF 0%, #FFE4F3 100%);
      padding: 20px 25px;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 15px;
      transition: background 0.3s ease;
      user-select: none;
    }

    .accordion-header:hover {
      background: linear-gradient(135deg, #E8D9FF 0%, #FFD4ED 100%);
    }

    .accordion-icon {
      font-size: 1.5em;
      transition: transform 0.3s ease;
      min-width: 30px;
      font-weight: bold;
    }

    .accordion-section.open .accordion-icon {
      transform: rotate(90deg);
    }

    .accordion-section .accordion-icon::before {
      content: '▶';
    }

    .accordion-section.open .accordion-icon::before {
      content: '▼';
    }

    .accordion-title {
      flex: 1;
    }

    .accordion-title h3 {
      font-size: 1.3em;
      color: #7C3E94;
      margin-bottom: 3px;
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .accordion-title .subtitle {
      font-size: 0.85em;
      color: #888;
      font-weight: normal;
    }

    .accordion-body {
      max-height: 0;
      overflow: hidden;
      transition: max-height 0.5s ease;
      background: white;
    }

    .accordion-section.open .accordion-body {
      max-height: 10000px;
    }

    .accordion-content {
      padding: 30px;
      font-family: Georgia, serif;
      line-height: 1.9;
    }

    .accordion-content p {
      margin-bottom: 15px;
      font-size: 1.05em;
    }

    .accordion-content h2 {
      color: #7C3E94;
      font-size: 1.5em;
      font-weight: 700;
      margin: 30px 0 15px 0;
      padding-bottom: 10px;
      border-bottom: 2px solid #F5EBFF;
    }

    .accordion-content h2:first-child {
      margin-top: 0;
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
      margin-top: 10px;
    }

    .tags {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 12px;
    }

    .tag {
      background: #F5EBFF;
      color: #7C3E94;
      padding: 12px 16px;
      border-radius: 20px;
      font-size: 0.95em;
      text-align: center;
      font-weight: 500;
      transition: all 0.2s ease;
    }

    .tag:hover {
      background: #E8D9FF;
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(124, 62, 148, 0.15);
    }

    @media (max-width: 768px) {
      .tags {
        grid-template-columns: repeat(2, 1fr);
      }
    }

    @media (max-width: 480px) {
      .tags {
        grid-template-columns: 1fr;
      }
    }

    /* Mobile */
    @media (max-width: 768px) {
      .hero h1 { font-size: 2.5em; }
      .hero .meta { flex-direction: column; gap: 10px; }
      .content { padding: 10px; }
      .accordion-header { padding: 15px 20px; }
      .accordion-content { padding: 20px; }
    }

    /* Print */
    @media print {
      .accordion-body { max-height: none !important; }
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

    <!-- Writer Credit -->
    <div class="writer-credit">
      <h3>📖 Written by ${writerName}</h3>
      <p>${writerTitle} • SoulSeed Writers Collective</p>
    </div>

    <!-- Accordion Sections -->
    <div class="content">
      ${sections.map((section, index) => `
      <div class="accordion-section" id="${section.id}">
        <div class="accordion-header" onclick="toggleAccordion('${section.id}')">
          <div class="accordion-icon"></div>
          <div class="accordion-title">
            <h3><span>${section.icon}</span> <span style="color: #FF6B9D; font-weight: 700;">[${index + 1}]</span> ${section.title}</h3>
            <div class="subtitle">${section.subtitle}</div>
          </div>
        </div>
        <div class="accordion-body">
          <div class="accordion-content">
            ${section.content}
          </div>
        </div>
      </div>
      `).join('\n')}
    </div>
  </div>

  <script>
    function toggleAccordion(sectionId) {
      const section = document.getElementById(sectionId);
      const isOpen = section.classList.contains('open');

      section.classList.toggle('open');

      // Save state to localStorage
      localStorage.setItem('accordion_${name}_' + sectionId, !isOpen);
    }

    // Restore states on load
    window.addEventListener('DOMContentLoaded', () => {
      ${sections.map(section => {
        const varName = section.id.replace(/-/g, '_');
        return `
      const saved_${varName} = localStorage.getItem('accordion_${name}_${section.id}');
      if (saved_${varName} === 'true') {
        document.getElementById('${section.id}').classList.add('open');
      }`;
      }).join('\n')}
    });
  </script>
</body>
</html>`;

  const htmlPath = path.join(v12Dir, `${name}.html`);
  fs.writeFileSync(htmlPath, html);
  console.log(`✅ Generated V12 Multi-Accordion: ${name}.html (${sections.length} sections)`);
  return true;
}

// Main execution
if (nameLower === 'all') {
  const files = fs.readdirSync(enrichedDir);
  const v11Files = files.filter(f => f.endsWith('-v11.json'));

  console.log(`\n🎯 Generating V12 multi-accordion profiles for ${v11Files.length} names...\n`);

  let generated = 0;
  v11Files.forEach(file => {
    const name = file.replace('-v11.json', '');
    if (generateV12HTML(name)) {
      generated++;
    }
  });

  console.log(`\n✨ Generated ${generated} V12 multi-accordion profiles!`);
  console.log(`📂 Location: ${v12Dir}\n`);
} else {
  console.log(`\n🎯 Generating V12 multi-accordion for ${nameLower}...\n`);
  generateV12HTML(nameLower);
  console.log(`\n✨ Done!\n`);
}
