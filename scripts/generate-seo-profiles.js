#!/usr/bin/env node

/**
 * Generate SEO-Optimized HTML Profiles with Smart Accordion Memory
 *
 * Creates beautiful, SEO-friendly HTML pages for each enriched name with:
 * - Full meta tags (title, description, keywords, OG, Twitter)
 * - JSON-LD structured data
 * - Smart accordion layout with localStorage memory
 * - Mobile-responsive design
 * - Print-friendly CSS
 */

const fs = require('fs');
const path = require('path');

const enrichedDir = path.join(__dirname, '../public/data/enriched');
const ogImageDir = path.join(__dirname, '../public/og-images');
const outputDir = path.join(__dirname, '../public/profiles');

// Create output directory
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

/**
 * Generate HTML for a single name profile
 */
function generateProfileHTML(data, nameLower) {
  const nameCapitalized = data.name || nameLower.charAt(0).toUpperCase() + nameLower.slice(1);
  const meaning = data.meaning || 'A beautiful name';
  const origin = data.origin || 'Unknown';

  // SEO Meta Tags
  const metaTitle = `${nameCapitalized}: Meaning, Origin & History | SoulSeed`;
  const metaDescription = `Discover ${nameCapitalized} - a ${origin} name meaning '${meaning}'. Explore its rich cultural significance, famous bearers, celestial connections, and more.`;
  const metaKeywords = `${nameCapitalized}, baby name, ${origin} origin, name meaning, ${meaning}, baby names, name history`;
  const canonicalUrl = `https://soulseedbaby.com/profiles/${nameLower}`;
  const ogImageUrl = `https://soulseedbaby.com/og-images/${nameLower}.svg`;

  // JSON-LD Structured Data
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": `${nameCapitalized}: Meaning, Origin & History`,
    "description": metaDescription,
    "author": {
      "@type": "Organization",
      "name": "SoulSeed"
    },
    "publisher": {
      "@type": "Organization",
      "name": "SoulSeed",
      "logo": {
        "@type": "ImageObject",
        "url": "https://soulseedbaby.com/logo.png"
      }
    },
    "datePublished": new Date().toISOString().split('T')[0],
    "dateModified": new Date().toISOString().split('T')[0],
    "keywords": metaKeywords
  };

  // Helper to generate accordion section
  let sectionCounter = 0;
  const section = (id, icon, title, content, defaultOpen = false) => {
    if (!content || (Array.isArray(content) && content.length === 0)) return '';

    sectionCounter++;

    return `
    <details data-section="${id}" ${defaultOpen ? 'open' : ''} class="accordion-section">
      <summary class="accordion-header">
        <span class="section-number">${sectionCounter}.</span>
        <span class="icon">${icon}</span>
        <span class="title">${title}</span>
        <span class="arrow">▼</span>
      </summary>
      <div class="accordion-content">
        ${content}
      </div>
    </details>`;
  };

  // Build content sections
  const sections = [];

  // 1. Meaning & Origin (default open)
  sections.push(section(
    'meaning-origin',
    '📖',
    'Meaning & Origin',
    `
      <div class="meaning-block">
        <h3>${nameCapitalized} means "${meaning}"</h3>
        <p><strong>Origin:</strong> ${origin}</p>
        ${data.gender ? `<p><strong>Gender:</strong> ${data.gender}</p>` : ''}
        ${data.pronunciation ? `<p><strong>Pronunciation:</strong> ${data.pronunciation}</p>` : ''}
      </div>
    `,
    true
  ));

  // 2. Cultural Significance (default open)
  if (data.culturalSignificance) {
    sections.push(section(
      'cultural-significance',
      '🌟',
      'Cultural Significance',
      `<p>${data.culturalSignificance}</p>`,
      true
    ));
  }

  // 3. Celestial Data (default open)
  if (data.celestialData) {
    const celestial = data.celestialData;
    sections.push(section(
      'celestial',
      '🔮',
      'Celestial & Numerology',
      `
        <div class="celestial-grid">
          ${celestial.luckyNumber ? `<div class="celestial-item"><strong>Lucky Number:</strong> ${celestial.luckyNumber}</div>` : ''}
          ${celestial.dominantElement ? `<div class="celestial-item"><strong>Element:</strong> ${celestial.dominantElement}</div>` : ''}
          ${celestial.luckyColor ? `<div class="celestial-item"><strong>Lucky Color:</strong> <span style="color: ${celestial.luckyColorHex || '#000'}">${celestial.luckyColor}</span></div>` : ''}
          ${celestial.luckyGemstone ? `<div class="celestial-item"><strong>Gemstone:</strong> ${celestial.luckyGemstone}</div>` : ''}
          ${celestial.luckyDay ? `<div class="celestial-item"><strong>Lucky Day:</strong> ${celestial.luckyDay}</div>` : ''}
          ${celestial.moonPhase ? `<div class="celestial-item"><strong>Moon Phase:</strong> ${celestial.moonPhase}</div>` : ''}
        </div>
      `,
      true
    ));
  }

  // 4. Literary References
  if (data.literaryReferences) {
    sections.push(section('literary-references', '📖', 'Literary References', `<p>${data.literaryReferences}</p>`));
  }

  // 5. Personality & Symbolism (COMBINED - no more repetition!)
  if (data.personalityAndSymbolism) {
    sections.push(section('personality-symbolism', '🧠⚡', 'Personality & Symbolism', `<p style="white-space: pre-line;">${data.personalityAndSymbolism}</p>`));
  } else if (data.personality || data.symbolism) {
    // Fallback for old data format
    const combined = [data.personality, data.symbolism].filter(Boolean).join('\n\n');
    if (combined) {
      sections.push(section('personality-symbolism', '🧠⚡', 'Personality & Symbolism', `<p style="white-space: pre-line;">${combined}</p>`));
    }
  }

  // 6. Fun Facts
  if (data.funFact) {
    sections.push(section('fun-fact', '🎉', 'Fun Fact', `<p>${data.funFact}</p>`));
  }

  // 8. Religious Significance
  if (data.religiousSignificance && data.religiousSignificance.hasSignificance) {
    const religious = `
      <div class="card">
        <h4>${data.religiousSignificance.character || 'Religious Significance'}</h4>
        ${data.religiousSignificance.religions && data.religiousSignificance.religions.length > 0 ?
          `<p class="religions"><strong>Religions:</strong> ${data.religiousSignificance.religions.join(', ')}</p>` : ''}
        ${data.religiousSignificance.significance ? `<p>${data.religiousSignificance.significance}</p>` : ''}
        ${data.religiousSignificance.spiritualMeaning ? `<p><strong>Spiritual Meaning:</strong> ${data.religiousSignificance.spiritualMeaning}</p>` : ''}
        ${data.religiousSignificance.keyStories && data.religiousSignificance.keyStories.length > 0 ?
          `<p><strong>Key Stories:</strong> ${data.religiousSignificance.keyStories.join('; ')}</p>` : ''}
      </div>
    `;
    sections.push(section('religious', '✝️', 'Religious & Spiritual Significance', religious));
  }

  // 9. Historical Figures (FIXED field name from historicalFigures to historicFigures)
  if (data.historicFigures && data.historicFigures.length > 0) {
    const figures = data.historicFigures.map(f => `
      <div class="card">
        <h4>${f.fullName || f.name}</h4>
        <p class="years">${f.years || 'Historical'}</p>
        <p class="category"><strong>${f.category || 'Historical Figure'}</strong></p>
        ${f.significance ? `<p>${f.significance}</p>` : ''}
        ${f.achievements && Array.isArray(f.achievements) ?
          `<p><strong>Achievements:</strong> ${f.achievements.join('; ')}</p>` :
          f.achievements ? `<p>${f.achievements}</p>` : ''}
        ${f.notableWorks && f.notableWorks.length > 0 ?
          `<p><strong>Notable Works:</strong> ${f.notableWorks.join(', ')}</p>` : ''}
      </div>
    `).join('');

    sections.push(section('historical-figures', '👑', 'Historical Figures', figures));
  }

  // 10. Famous People
  if (data.famousPeople && data.famousPeople.length > 0) {
    const famous = data.famousPeople.map(p => `
      <div class="card">
        <h4>${p.name}</h4>
        <p class="profession">${p.profession || p.occupation || 'Celebrity'}</p>
        ${p.knownFor && Array.isArray(p.knownFor) ? `<p><strong>Known for:</strong> ${p.knownFor.join('; ')}</p>` : ''}
        ${p.achievements ? `<p><strong>Awards:</strong> ${p.achievements}</p>` : ''}
        ${p.awards ? `<p><strong>Awards:</strong> ${p.awards}</p>` : ''}
      </div>
    `).join('');

    sections.push(section('famous-people', '⭐', 'Famous People', famous));
  }

  // 11. Famous Athletes (Enhanced with full details)
  if (data.famousAthletes && data.famousAthletes.length > 0) {
    const athletes = data.famousAthletes.map(a => `
      <div class="card">
        <h4>${a.name}</h4>
        <p class="sport"><strong>${a.sport || 'Athlete'}</strong></p>
        ${a.team ? `<p>Team: ${a.team} ${a.jerseyNumber ? `(#${a.jerseyNumber})` : ''}</p>` : ''}
        ${a.position ? `<p>Position: ${a.position}</p>` : ''}
        ${a.years ? `<p>Career: ${a.years}</p>` : ''}
        ${a.achievements ? `<p><strong>Achievements:</strong> ${a.achievements}</p>` : ''}
        ${a.knownFor && Array.isArray(a.knownFor) ? `<p>${a.knownFor.join('; ')}</p>` : ''}
        ${a.stats ? `<p><strong>Stats:</strong> ${a.stats}</p>` : ''}
      </div>
    `).join('');

    sections.push(section('athletes', '🏆', `Famous Athletes (${data.famousAthletes.length})`, athletes));
  }

  // 12. Celebrity Babies
  if (data.celebrityBabies && data.celebrityBabies.length > 0) {
    const babies = data.celebrityBabies.map(b => `
      <div class="card">
        <h4>${b.childName || b.child}</h4>
        <p class="parent">Parent: ${b.parent}</p>
        <p class="profession">${b.profession || b.parentProfession || 'Celebrity'}</p>
        ${b.birthYear ? `<p class="year">Born: ${b.birthYear}</p>` : ''}
        ${b.context ? `<p class="context">${b.context}</p>` : ''}
      </div>
    `).join('');

    sections.push(section('celebrity-babies', '👶', 'Celebrity Babies', babies));
  }

  // 8. Movies & TV Shows
  if (data.moviesAndShows && data.moviesAndShows.length > 0) {
    const movies = data.moviesAndShows.map(m => `
      <div class="card">
        <h4>${m.title}</h4>
        ${m.year ? `<p class="year">${m.year}</p>` : ''}
        ${m.character ? `<p class="character">Character: ${m.character}</p>` : ''}
        ${m.context || m.significance ? `<p>${m.context || m.significance}</p>` : ''}
      </div>
    `).join('');

    sections.push(section('movies-shows', '🎬', 'Movies & TV Shows', movies));
  }

  // 13. Positive Songs (V10) - FIXED field name from positiveSongs to songs
  if (data.songs && data.songs.length > 0) {
    const songs = data.songs.map(s => `
      <div class="card song-card">
        <h4>"${s.title}"</h4>
        <p class="artist">by ${s.artist}</p>
        ${s.year ? `<p class="year">${s.year}</p>` : ''}
        ${s.genre ? `<p class="genre">Genre: ${s.genre}</p>` : ''}
        ${s.theme ? `<p class="theme">Theme: ${s.theme}</p>` : ''}
        ${s.positiveVibeScore ? `<p class="vibe-score">✨ Positive Vibe: ${s.positiveVibeScore}/10</p>` : ''}
        ${s.lyrics ? `<p class="lyrics"><em>${s.lyrics}</em></p>` : ''}
        ${s.youtubeSearchUrl ? `<p><a href="${s.youtubeSearchUrl}" target="_blank">🎵 Listen on YouTube</a></p>` : ''}
      </div>
    `).join('');

    sections.push(section('positive-songs', '🎵', `Positive Songs (${data.songs.length})`, songs));
  }

  // 10. Translations (6 languages)
  if (data.translations && data.translations.length > 0) {
    const translations = data.translations.map(t => `
      <div class="translation-card">
        <h4>${t.language}</h4>
        <p class="script">${t.script}</p>
        ${t.pronunciation ? `<p class="pronunciation">${t.pronunciation}</p>` : ''}
      </div>
    `).join('');

    sections.push(section('translations', '🌐', `Translations (${data.translations.length} languages)`, `<div class="translation-grid">${translations}</div>`));
  }

  // 14. Books - FIXED field name from books to booksWithName
  if (data.booksWithName && data.booksWithName.length > 0) {
    const books = data.booksWithName.map(b => `
      <div class="card">
        <h4>${b.title}</h4>
        ${b.author ? `<p class="author">by ${b.author}</p>` : ''}
        ${b.year ? `<p class="year">${b.year}</p>` : ''}
        ${b.genre ? `<p class="genre">Genre: ${b.genre}</p>` : ''}
        ${b.significance ? `<p>${b.significance}</p>` : ''}
      </div>
    `).join('');

    sections.push(section('books', '📚', `Books (${data.booksWithName.length})`, books));
  }

  // 15. Famous Quotes
  if (data.famousQuotes && data.famousQuotes.length > 0) {
    const quotes = data.famousQuotes.map(q => `
      <blockquote class="quote-card">
        <p class="quote-text">"${q.quote}"</p>
        ${q.author ? `<p class="quote-author">— ${q.author}</p>` : ''}
        ${q.context ? `<p class="quote-context">${q.context}</p>` : ''}
        ${q.category ? `<p class="quote-category"><strong>${q.category}</strong></p>` : ''}
      </blockquote>
    `).join('');

    sections.push(section('quotes', '💬', `Famous Quotes (${data.famousQuotes.length})`, quotes));
  }

  // 16. Character Quotes (from Movies/TV)
  if (data.characterQuotes && data.characterQuotes.length > 0) {
    const charQuotes = data.characterQuotes.map(q => `
      <blockquote class="quote-card">
        <p class="quote-text">"${q.quote}"</p>
        <p class="quote-author">— ${q.character}, <em>${q.source}</em> (${q.year})</p>
        ${q.context ? `<p class="quote-context">${q.context}</p>` : ''}
        ${q.impact ? `<p class="quote-impact"><strong>Impact:</strong> ${q.impact}</p>` : ''}
      </blockquote>
    `).join('');

    sections.push(section('character-quotes', '🎭', `Character Quotes (${data.characterQuotes.length})`, charQuotes));
  }

  // 17. Variations
  if (data.variations && data.variations.length > 0) {
    const variations = data.variations.map(v => `<span class="tag">${v}</span>`).join('');
    sections.push(section('variations', '🔄', `Variations (${data.variations.length})`, `<div class="tag-grid">${variations}</div>`));
  }

  // 14. Similar Names
  if (data.similarNames && data.similarNames.length > 0) {
    const similar = data.similarNames.map(n => `<span class="tag">${n}</span>`).join('');
    sections.push(section('similar-names', '👥', `Similar Names (${data.similarNames.length})`, `<div class="tag-grid">${similar}</div>`));
  }

  // 15. Nicknames
  if (data.nicknames && data.nicknames.length > 0) {
    const nicknames = data.nicknames.map(n => `<span class="tag">${n}</span>`).join('');
    sections.push(section('nicknames', '🏷️', `Nicknames (${data.nicknames.length})`, `<div class="tag-grid">${nicknames}</div>`));
  }

  // Generate complete HTML
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">

  <!-- Primary Meta Tags -->
  <title>${metaTitle}</title>
  <meta name="title" content="${metaTitle}">
  <meta name="description" content="${metaDescription}">
  <meta name="keywords" content="${metaKeywords}">

  <!-- Open Graph / Facebook -->
  <meta property="og:type" content="article">
  <meta property="og:url" content="${canonicalUrl}">
  <meta property="og:title" content="${metaTitle}">
  <meta property="og:description" content="${metaDescription}">
  <meta property="og:image" content="${ogImageUrl}">

  <!-- Twitter -->
  <meta property="twitter:card" content="summary_large_image">
  <meta property="twitter:url" content="${canonicalUrl}">
  <meta property="twitter:title" content="${metaTitle}">
  <meta property="twitter:description" content="${metaDescription}">
  <meta property="twitter:image" content="${ogImageUrl}">

  <!-- Canonical -->
  <link rel="canonical" href="${canonicalUrl}">

  <!-- JSON-LD Structured Data -->
  <script type="application/ld+json">
${JSON.stringify(structuredData, null, 2)}
  </script>

  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      line-height: 1.6;
      color: #333;
      background: linear-gradient(135deg, #FFF9FC 0%, #F5EBFF 100%);
      padding: 20px;
    }

    .container {
      max-width: 900px;
      margin: 0 auto;
      background: white;
      border-radius: 20px;
      box-shadow: 0 10px 40px rgba(0,0,0,0.1);
      overflow: hidden;
    }

    .hero {
      background: linear-gradient(135deg, #D8B2F2 0%, #FFB3D9 100%);
      padding: 60px 40px;
      text-align: center;
      color: white;
    }

    .hero h1 {
      font-size: 3.5em;
      font-weight: 700;
      margin-bottom: 10px;
      text-shadow: 2px 2px 4px rgba(0,0,0,0.2);
    }

    .hero .meaning {
      font-size: 1.5em;
      font-weight: 300;
      margin-bottom: 5px;
    }

    .hero .origin {
      font-size: 1.1em;
      opacity: 0.9;
    }

    .content {
      padding: 40px;
    }

    .accordion-section {
      margin-bottom: 15px;
      border: 2px solid #f0f0f0;
      border-radius: 12px;
      overflow: hidden;
      transition: all 0.3s ease;
    }

    .accordion-section:hover {
      border-color: #D8B2F2;
      box-shadow: 0 4px 12px rgba(216, 178, 242, 0.2);
    }

    .accordion-header {
      display: flex;
      align-items: center;
      padding: 20px;
      background: linear-gradient(135deg, #F9F5FF 0%, #FFF5FA 100%);
      cursor: pointer;
      user-select: none;
      font-size: 1.2em;
      font-weight: 600;
      color: #7C3E94;
      transition: background 0.3s ease;
    }

    .accordion-header:hover {
      background: linear-gradient(135deg, #F0E6FF 0%, #FFE6F0 100%);
    }

    .accordion-header .section-number {
      font-size: 1.1em;
      font-weight: 700;
      color: #7C3E94;
      margin-right: 10px;
      min-width: 30px;
    }

    .accordion-header .icon {
      font-size: 1.5em;
      margin-right: 15px;
    }

    .accordion-header .title {
      flex: 1;
    }

    .accordion-header .arrow {
      transition: transform 0.3s ease;
      font-size: 0.8em;
    }

    details[open] .accordion-header .arrow {
      transform: rotate(180deg);
    }

    .accordion-content {
      padding: 25px;
      animation: slideDown 0.3s ease;
    }

    @keyframes slideDown {
      from {
        opacity: 0;
        transform: translateY(-10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .card {
      background: #f8f8f8;
      padding: 20px;
      border-radius: 10px;
      margin-bottom: 15px;
      border-left: 4px solid #D8B2F2;
    }

    .card h4 {
      color: #7C3E94;
      margin-bottom: 10px;
      font-size: 1.2em;
    }

    .card p {
      margin: 5px 0;
      color: #666;
    }

    .card .profession, .card .sport, .card .parent {
      color: #888;
      font-size: 0.9em;
    }

    .song-card a {
      color: #D8B2F2;
      text-decoration: none;
      font-weight: 600;
    }

    .song-card a:hover {
      color: #7C3E94;
      text-decoration: underline;
    }

    .celestial-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 15px;
    }

    .celestial-item {
      background: #f8f8f8;
      padding: 15px;
      border-radius: 8px;
      border-left: 3px solid #FFB3D9;
    }

    .translation-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: 15px;
    }

    .translation-card {
      background: #f8f8f8;
      padding: 15px;
      border-radius: 8px;
      text-align: center;
    }

    .translation-card h4 {
      color: #7C3E94;
      margin-bottom: 10px;
    }

    .translation-card .script {
      font-size: 1.5em;
      font-weight: 600;
      margin: 10px 0;
    }

    .translation-card .pronunciation {
      color: #888;
      font-size: 0.9em;
    }

    .quote-card {
      background: #f8f8f8;
      padding: 25px;
      border-radius: 10px;
      border-left: 4px solid #B3D9FF;
      margin-bottom: 20px;
      font-style: italic;
    }

    .quote-text {
      font-size: 1.1em;
      color: #555;
      margin-bottom: 10px;
    }

    .quote-author {
      text-align: right;
      color: #7C3E94;
      font-weight: 600;
    }

    .quote-context {
      font-size: 0.9em;
      color: #888;
      margin-top: 10px;
    }

    .tag-grid {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
    }

    .tag {
      background: linear-gradient(135deg, #D8B2F2 0%, #FFB3D9 50%, #B3D9FF 100%);
      color: white;
      padding: 8px 15px;
      border-radius: 20px;
      font-size: 0.9em;
      font-weight: 500;
    }

    .meaning-block h3 {
      color: #7C3E94;
      margin-bottom: 15px;
      font-size: 1.5em;
    }

    /* Mobile Responsive */
    @media (max-width: 768px) {
      .hero h1 {
        font-size: 2.5em;
      }

      .hero .meaning {
        font-size: 1.2em;
      }

      .content {
        padding: 20px;
      }

      .celestial-grid, .translation-grid {
        grid-template-columns: 1fr;
      }
    }

    /* Print Styles */
    @media print {
      body {
        background: white;
      }

      .container {
        box-shadow: none;
      }

      details {
        border: none !important;
      }

      details summary {
        display: none;
      }

      details .accordion-content {
        display: block !important;
        padding: 10px 0 !important;
      }

      .accordion-section {
        page-break-inside: avoid;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="hero">
      <h1>${nameCapitalized}</h1>
      <p class="meaning">"${meaning}"</p>
      <p class="origin">${origin} Origin</p>
    </div>

    <div class="content">
      ${sections.join('\n')}
    </div>
  </div>

  <script>
    // Smart Accordion Memory using localStorage
    (function() {
      const STORAGE_PREFIX = 'accordionState_';

      // Restore saved accordion states on page load
      window.addEventListener('DOMContentLoaded', () => {
        document.querySelectorAll('details[data-section]').forEach(detail => {
          const sectionId = detail.dataset.section;
          const savedState = localStorage.getItem(STORAGE_PREFIX + sectionId);

          if (savedState === 'closed') {
            detail.removeAttribute('open');
          } else if (savedState === 'open') {
            detail.setAttribute('open', '');
          }
          // If no saved state, keep default (open attribute in HTML)
        });
      });

      // Save accordion state when toggled
      document.addEventListener('DOMContentLoaded', () => {
        document.querySelectorAll('details[data-section]').forEach(detail => {
          detail.addEventListener('toggle', (e) => {
            const sectionId = e.target.dataset.section;
            const isOpen = e.target.hasAttribute('open');
            localStorage.setItem(STORAGE_PREFIX + sectionId, isOpen ? 'open' : 'closed');
          });
        });
      });

      // Expand all for printing
      window.addEventListener('beforeprint', () => {
        document.querySelectorAll('details').forEach(d => d.setAttribute('open', ''));
      });
    })();
  </script>
</body>
</html>`;
}

console.log('📝 GENERATING SEO PROFILES WITH SMART ACCORDIONS');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

// Get all enriched files
const files = fs.readdirSync(enrichedDir).filter(f => f.endsWith('-v10.json'));

let generated = 0;
let errors = 0;

files.forEach((file, index) => {
  try {
    const data = JSON.parse(fs.readFileSync(path.join(enrichedDir, file), 'utf8'));
    const nameLower = file.replace('-v10.json', '');

    const html = generateProfileHTML(data, nameLower);
    const outputPath = path.join(outputDir, `${nameLower}.html`);

    fs.writeFileSync(outputPath, html);

    console.log(`✅ [${index + 1}/${files.length}] Generated: ${nameLower}.html`);
    generated++;
  } catch (error) {
    console.error(`❌ [${index + 1}/${files.length}] Failed: ${file} - ${error.message}`);
    errors++;
  }
});

// Generate index page
const indexHTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Top 10 Baby Names - Enriched Profiles | SoulSeed</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
      background: linear-gradient(135deg, #FFF9FC 0%, #F5EBFF 100%);
      padding: 40px 20px;
    }
    .container {
      max-width: 1200px;
      margin: 0 auto;
    }
    h1 {
      text-align: center;
      color: #7C3E94;
      font-size: 3em;
      margin-bottom: 10px;
    }
    .subtitle {
      text-align: center;
      color: #888;
      margin-bottom: 40px;
      font-size: 1.2em;
    }
    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 25px;
    }
    .card {
      background: white;
      border-radius: 15px;
      padding: 30px;
      box-shadow: 0 8px 30px rgba(0,0,0,0.1);
      text-decoration: none;
      color: inherit;
      transition: transform 0.3s ease, box-shadow 0.3s ease;
    }
    .card:hover {
      transform: translateY(-5px);
      box-shadow: 0 12px 40px rgba(216, 178, 242, 0.3);
    }
    .rank {
      color: #FFB3D9;
      font-size: 3em;
      font-weight: 700;
      margin-bottom: 10px;
    }
    .name {
      font-size: 2em;
      font-weight: 600;
      color: #7C3E94;
      margin-bottom: 10px;
    }
    .meaning {
      color: #666;
      margin-bottom: 5px;
    }
    .origin {
      color: #888;
      font-size: 0.9em;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>🌟 Top 10 Baby Names</h1>
    <p class="subtitle">Enriched with V10 Process - SEO Optimized</p>

    <div class="grid">
      ${files.map((file, i) => {
        try {
          const data = JSON.parse(fs.readFileSync(path.join(enrichedDir, file), 'utf8'));
          const nameLower = file.replace('-v10.json', '');
          return `
      <a href="${nameLower}.html" class="card">
        <div class="rank">#${i + 1}</div>
        <div class="name">${data.name || nameLower}</div>
        <p class="meaning">"${data.meaning || 'A beautiful name'}"</p>
        <p class="origin">${data.origin || 'Unknown'} Origin</p>
      </a>`;
        } catch {
          return '';
        }
      }).join('\n')}
    </div>
  </div>
</body>
</html>`;

fs.writeFileSync(path.join(outputDir, 'index.html'), indexHTML);

console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('✨ SEO PROFILE GENERATION COMPLETE!');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
console.log(`📊 Summary:`);
console.log(`   Generated: ${generated} profiles`);
console.log(`   Errors: ${errors}`);
console.log(`   Output: ${outputDir}`);
console.log(`\n✅ Features:`);
console.log(`   • Smart accordion memory (localStorage)`);
console.log(`   • Full SEO meta tags`);
console.log(`   • Mobile responsive`);
console.log(`   • Print-friendly`);
console.log(`\n🌐 Open in browser:`);
console.log(`   termux-open-url file://${outputDir}/index.html`);
