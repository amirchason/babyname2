#!/usr/bin/env node

/**
 * V13 AMAZING REDESIGN - Beautiful Collapsible Accordions
 * Using modern glassmorphism, gradients, and smooth animations
 */

const fs = require('fs');
const path = require('path');

const nameLower = process.argv[2];

if (!nameLower) {
  console.error('Usage: node generate-v13-amazing.js <name>');
  process.exit(1);
}

const nameCapitalized = nameLower.charAt(0).toUpperCase() + nameLower.slice(1).toLowerCase();

const v13Path = path.join(__dirname, '..', 'public', 'data', 'enriched', `${nameLower}-v13.json`);

if (!fs.existsSync(v13Path)) {
  console.error(`❌ V13 data not found: ${v13Path}`);
  process.exit(1);
}

const data = JSON.parse(fs.readFileSync(v13Path, 'utf-8'));

// SEO Meta Data
const metaDescription = `Discover ${nameCapitalized} name meaning: ${data.meaning}. ${data.origin} origin. Explore famous people, pop culture references, spiritual significance, and comprehensive baby name insights.`;
const metaKeywords = `${nameCapitalized} name meaning, ${nameCapitalized} origin, ${data.origin} baby names, baby name ${nameCapitalized}, ${nameCapitalized} famous people`;
const canonicalUrl = `https://soulseedbaby.com/names/${nameLower}`;
const ogImage = `https://soulseedbaby.com/og-images/${nameLower}.jpg`;
const siteUrl = 'https://soulseedbaby.com';

const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <!-- Essential Meta Tags -->
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">

  <!-- Primary Meta Tags -->
  <title>${nameCapitalized} - Complete Baby Name Profile | Meaning, Origin & Significance | SoulSeed</title>
  <meta name="description" content="${metaDescription}">
  <meta name="keywords" content="${metaKeywords}">
  <meta name="author" content="SoulSeed Baby Names">
  <meta name="robots" content="index, follow">
  <meta name="theme-color" content="#764ba2">
  <link rel="canonical" href="${canonicalUrl}">

  <!-- Open Graph / Facebook -->
  <meta property="og:type" content="article">
  <meta property="og:url" content="${canonicalUrl}">
  <meta property="og:title" content="${nameCapitalized} Name Meaning & Origin | Complete Baby Name Profile">
  <meta property="og:description" content="${metaDescription}">
  <meta property="og:image" content="${ogImage}">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:site_name" content="SoulSeed Baby Names">

  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${nameCapitalized} Name Meaning & Origin">
  <meta name="twitter:description" content="${metaDescription}">
  <meta name="twitter:image" content="${ogImage}">
  <meta name="twitter:site" content="@SoulSeedBaby">

  <!-- Preconnect -->
  <link rel="preconnect" href="https://cdnjs.cloudflare.com">
  <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" rel="stylesheet">
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%);
      min-height: 100vh;
      padding: 20px;
      color: #1a1a2e;
    }

    .container {
      max-width: 900px;
      margin: 0 auto;
    }

    /* Hero Section */
    .hero {
      text-align: center;
      padding: 60px 30px;
      background: linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05));
      backdrop-filter: blur(20px);
      border-radius: 30px;
      border: 1px solid rgba(255,255,255,0.2);
      box-shadow: 0 20px 60px rgba(0,0,0,0.3);
      margin-bottom: 30px;
      position: relative;
      overflow: hidden;
    }

    .hero::before {
      content: '';
      position: absolute;
      top: -50%;
      left: -50%;
      width: 200%;
      height: 200%;
      background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
      animation: pulse 8s ease-in-out infinite;
    }

    @keyframes pulse {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.1); }
    }

    .hero-content {
      position: relative;
      z-index: 1;
    }

    .v13-badge {
      display: inline-block;
      background: linear-gradient(135deg, #f093fb, #f5576c);
      color: white;
      padding: 8px 25px;
      border-radius: 25px;
      font-size: 0.85em;
      font-weight: 700;
      letter-spacing: 2px;
      margin-bottom: 20px;
      box-shadow: 0 5px 15px rgba(245, 87, 108, 0.4);
      animation: glow 2s ease-in-out infinite;
    }

    @keyframes glow {
      0%, 100% { box-shadow: 0 5px 15px rgba(245, 87, 108, 0.4); }
      50% { box-shadow: 0 8px 25px rgba(245, 87, 108, 0.7); }
    }

    h1 {
      font-size: 5em;
      font-weight: 900;
      color: white;
      text-shadow: 0 5px 30px rgba(0,0,0,0.3);
      margin-bottom: 15px;
      letter-spacing: -2px;
    }

    .hero-meaning {
      font-size: 1.8em;
      color: rgba(255,255,255,0.95);
      font-style: italic;
      margin-bottom: 25px;
    }

    .hero-meta {
      display: flex;
      justify-content: center;
      gap: 15px;
      flex-wrap: wrap;
      margin-top: 25px;
    }

    .meta-pill {
      background: rgba(255,255,255,0.2);
      backdrop-filter: blur(10px);
      padding: 12px 24px;
      border-radius: 25px;
      color: white;
      font-weight: 600;
      border: 1px solid rgba(255,255,255,0.3);
      transition: all 0.3s ease;
    }

    .meta-pill:hover {
      background: rgba(255,255,255,0.3);
      transform: translateY(-2px);
      box-shadow: 0 5px 20px rgba(0,0,0,0.2);
    }

    /* Accordion Container */
    .accordions {
      display: flex;
      flex-direction: column;
      gap: 15px;
    }

    /* Individual Accordion */
    .accordion {
      background: rgba(255,255,255,0.95);
      border-radius: 20px;
      overflow: hidden;
      box-shadow: 0 10px 30px rgba(0,0,0,0.15);
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      border: 2px solid transparent;
    }

    .accordion:hover {
      transform: translateY(-5px);
      box-shadow: 0 15px 40px rgba(0,0,0,0.25);
      border-color: rgba(118, 75, 162, 0.3);
    }

    .accordion.active {
      border-color: #764ba2;
    }

    /* Accordion Header */
    .accordion-header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 25px 30px;
      cursor: pointer;
      display: flex;
      justify-content: space-between;
      align-items: center;
      transition: all 0.3s ease;
      position: relative;
      overflow: hidden;
    }

    .accordion-header::before {
      content: '';
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
      transition: left 0.5s ease;
    }

    .accordion:hover .accordion-header::before {
      left: 100%;
    }

    .accordion-header:active {
      transform: scale(0.98);
    }

    .accordion-title {
      display: flex;
      align-items: center;
      gap: 15px;
      font-size: 1.3em;
      font-weight: 700;
      position: relative;
      z-index: 1;
    }

    .accordion-icon {
      font-size: 1.5em;
      width: 50px;
      height: 50px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(255,255,255,0.2);
      border-radius: 15px;
      backdrop-filter: blur(10px);
    }

    .accordion-chevron {
      font-size: 1.2em;
      transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
      position: relative;
      z-index: 1;
    }

    .accordion.active .accordion-chevron {
      transform: rotate(180deg);
    }

    /* Accordion Content */
    .accordion-content {
      max-height: 0;
      overflow: hidden;
      transition: max-height 0.5s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .accordion.active .accordion-content {
      max-height: 5000px;
    }

    .accordion-body {
      padding: 35px;
      animation: fadeIn 0.4s ease;
    }

    @keyframes fadeIn {
      from {
        opacity: 0;
        transform: translateY(-10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    /* Content Styling */
    h2 {
      color: #764ba2;
      font-size: 1.8em;
      margin-bottom: 20px;
      border-bottom: 3px solid #f093fb;
      padding-bottom: 10px;
    }

    h3 {
      color: #667eea;
      font-size: 1.4em;
      margin-top: 25px;
      margin-bottom: 15px;
    }

    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 20px;
      margin: 20px 0;
    }

    .card {
      background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
      padding: 25px;
      border-radius: 15px;
      border-left: 5px solid #764ba2;
      transition: all 0.3s ease;
      box-shadow: 0 4px 15px rgba(0,0,0,0.08);
    }

    .card:hover {
      transform: translateY(-5px);
      box-shadow: 0 8px 25px rgba(0,0,0,0.15);
      border-left-width: 8px;
    }

    .card h4 {
      color: #764ba2;
      margin-bottom: 12px;
      font-size: 1.15em;
      font-weight: 700;
    }

    /* Table wrapper for horizontal scroll on mobile */
    .table-wrapper {
      width: 100%;
      overflow-x: auto;
      margin: 20px 0;
      border-radius: 15px;
      box-shadow: 0 4px 15px rgba(0,0,0,0.1);
      -webkit-overflow-scrolling: touch; /* Smooth scrolling on iOS */
    }

    table {
      width: 100%;
      min-width: 600px; /* Prevent table from being too narrow */
      border-collapse: separate;
      border-spacing: 0;
      margin: 0;
      border-radius: 15px;
      overflow: hidden;
    }

    th {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 18px;
      text-align: left;
      font-weight: 700;
      font-size: 1.05em;
      white-space: nowrap; /* Prevent header text from wrapping */
    }

    td {
      padding: 15px 18px;
      border-bottom: 1px solid #e9ecef;
      background: white;
      word-wrap: break-word;
      word-break: break-word;
      max-width: 250px; /* Prevent cells from getting too wide */
    }

    tr:last-child td {
      border-bottom: none;
    }

    tr:hover td {
      background: #f8f9fa;
    }

    .badge {
      display: inline-block;
      padding: 6px 14px;
      border-radius: 20px;
      font-size: 0.85em;
      font-weight: 700;
      margin: 5px 5px 5px 0;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }

    .badge-v8 { background: linear-gradient(135deg, #FFB74D, #FF9800); color: white; }
    .badge-v10 { background: linear-gradient(135deg, #66BB6A, #4CAF50); color: white; }
    .badge-v11 { background: linear-gradient(135deg, #42A5F5, #2196F3); color: white; }

    ul {
      margin: 15px 0;
      padding-left: 30px;
    }

    li {
      margin: 10px 0;
      line-height: 1.6;
    }

    .celestial-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 20px;
      margin: 25px 0;
    }

    .celestial-card {
      background: linear-gradient(135deg, #f8f9fa, #ffffff);
      padding: 25px;
      border-radius: 15px;
      text-align: center;
      border: 2px solid #e9ecef;
      transition: all 0.3s ease;
    }

    .celestial-card:hover {
      transform: translateY(-5px) scale(1.02);
      box-shadow: 0 10px 30px rgba(118, 75, 162, 0.2);
      border-color: #764ba2;
    }

    .celestial-value {
      font-size: 2.5em;
      font-weight: 900;
      background: linear-gradient(135deg, #667eea, #764ba2);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      margin: 15px 0;
    }

    /* Mobile-First Responsive Design */
    @media (max-width: 768px) {
      body {
        padding: 10px;
      }

      h1 {
        font-size: 2.5em; /* Smaller for very small screens */
        letter-spacing: -1px;
      }

      .hero {
        padding: 30px 20px;
      }

      .hero-meaning {
        font-size: 1.4em;
      }

      .accordion-header {
        padding: 15px;
      }

      .accordion-title {
        font-size: 1em;
        gap: 10px;
      }

      .accordion-icon {
        width: 35px;
        height: 35px;
        font-size: 1em;
      }

      .accordion-body {
        padding: 20px 15px;
      }

      /* Table mobile optimizations */
      .table-wrapper {
        margin: 15px -15px; /* Extend to edges on mobile */
        border-radius: 0; /* Remove border radius on edges */
      }

      table {
        min-width: 500px; /* Slightly smaller min-width */
        font-size: 0.9em;
      }

      th {
        padding: 12px 10px;
        font-size: 0.95em;
      }

      td {
        padding: 10px 8px;
        font-size: 0.85em;
      }

      /* Card optimizations */
      .card {
        padding: 18px;
      }

      .grid {
        grid-template-columns: 1fr; /* Single column on mobile */
        gap: 15px;
      }

      /* Meta pills */
      .meta-pill {
        padding: 10px 18px;
        font-size: 0.9em;
      }

      /* Celestial grid */
      .celestial-grid {
        grid-template-columns: repeat(2, 1fr); /* 2 columns on mobile */
        gap: 15px;
      }

      .celestial-value {
        font-size: 2em;
      }

      h3 {
        font-size: 1.2em;
      }

      h4 {
        font-size: 1em;
      }
    }

    /* Extra small screens (phones in portrait) */
    @media (max-width: 480px) {
      h1 {
        font-size: 2em;
      }

      .hero-meaning {
        font-size: 1.2em;
      }

      .v13-badge {
        font-size: 0.75em;
        padding: 6px 18px;
      }

      table {
        min-width: 450px;
        font-size: 0.85em;
      }

      th, td {
        padding: 8px 6px;
      }

      .celestial-grid {
        grid-template-columns: 1fr; /* Single column on very small screens */
      }
    }

    /* Scroll Animation */
    .accordion {
      animation: slideUp 0.5s ease backwards;
    }

    .accordion:nth-child(1) { animation-delay: 0.1s; }
    .accordion:nth-child(2) { animation-delay: 0.2s; }
    .accordion:nth-child(3) { animation-delay: 0.3s; }
    .accordion:nth-child(4) { animation-delay: 0.4s; }
    .accordion:nth-child(5) { animation-delay: 0.5s; }
    .accordion:nth-child(6) { animation-delay: 0.6s; }

    @keyframes slideUp {
      from {
        opacity: 0;
        transform: translateY(30px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <!-- Hero Section -->
    <div class="hero">
      <div class="hero-content">
        <div class="v13-badge">✨ V13 SUPER ENRICHED ✨ <span style="opacity: 0.7; font-size: 0.8em;">[TMP-1]</span></div>
        <h1>${nameCapitalized}</h1>
        <p class="hero-meaning">${data.meaning}</p>
        <div class="hero-meta">
          <div class="meta-pill">🌍 ${data.origin}</div>
          <div class="meta-pill">⚧ ${data.gender === 'male' ? '♂️ Male' : data.gender === 'female' ? '♀️ Female' : '⚧ Unisex'}</div>
          ${data.ranking ? `<div class="meta-pill">📊 Rank #${data.ranking.current}</div>` : ''}
          <div class="meta-pill">📦 ${data.versionsIncluded.length} Versions</div>
        </div>
      </div>
    </div>

    <!-- Accordions -->
    <div class="accordions">

      <!-- Overview Accordion -->
      <div class="accordion">
        <div class="accordion-header" onclick="toggleAccordion(this)">
          <div class="accordion-title">
            <div class="accordion-icon">📖</div>
            <span><span style="opacity: 0.5; font-size: 0.7em; margin-right: 10px;">[TMP-2]</span>Complete Overview</span>
          </div>
          <i class="fas fa-chevron-down accordion-chevron"></i>
        </div>
        <div class="accordion-content">
          <div class="accordion-body">
            <div class="grid">
              <div class="card">
                <h4>🌟 Cultural Significance</h4>
                <p>${data.culturalSignificance}</p>
              </div>
              <div class="card">
                <h4>📅 Modern Context</h4>
                <p>${data.modernContext}</p>
              </div>
            </div>

            <div class="grid">
              <div class="card">
                <h4>💎 Personality Traits</h4>
                <p>${data.personality}</p>
              </div>
              <div class="card">
                <h4>🎭 Symbolism</h4>
                <p>${data.symbolism}</p>
              </div>
            </div>

            <h3>🔤 Variations & Similar Names</h3>
            <div class="grid">
              <div class="card">
                <h4>Name Variations</h4>
                <ul>
                  ${data.variations ? data.variations.slice(0, 6).map(v => `<li>${v}</li>`).join('') : '<li>None listed</li>'}
                </ul>
              </div>
              <div class="card">
                <h4>Similar Names</h4>
                <ul>
                  ${data.similarNames ? data.similarNames.slice(0, 6).map(n => `<li>${n}</li>`).join('') : '<li>None listed</li>'}
                </ul>
              </div>
              <div class="card">
                <h4>Nicknames</h4>
                <ul>
                  ${data.nicknames ? data.nicknames.slice(0, 6).map(n => `<li>${n}</li>`).join('') : '<li>None listed</li>'}
                </ul>
              </div>
            </div>

            <div class="card" style="margin-top: 25px;">
              <h4>🎉 Fun Fact</h4>
              <p style="font-size: 1.1em;"><strong>${data.funFact}</strong></p>
            </div>
          </div>
        </div>
      </div>

      <!-- Famous People Accordion -->
      <div class="accordion">
        <div class="accordion-header" onclick="toggleAccordion(this)">
          <div class="accordion-title">
            <div class="accordion-icon">👥</div>
            <span><span style="opacity: 0.5; font-size: 0.7em; margin-right: 10px;">[TMP-3]</span>Famous People & Athletes</span>
          </div>
          <i class="fas fa-chevron-down accordion-chevron"></i>
        </div>
        <div class="accordion-content">
          <div class="accordion-body">
            ${data.famousPeople && data.famousPeople.length > 0 ? `
            <h3>🌟 Famous People</h3>
            <div class="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Profession</th>
                    <th>Known For</th>
                  </tr>
                </thead>
                <tbody>
                  ${data.famousPeople.map(p => `
                  <tr>
                    <td><strong>${p.name}</strong></td>
                    <td>${p.profession}</td>
                    <td>${Array.isArray(p.knownFor) ? p.knownFor.join(', ') : p.knownFor || 'N/A'}</td>
                  </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
            ` : '<p>No famous people data available.</p>'}

            ${data.famousAthletes && data.famousAthletes.length > 0 ? `
            <h3>🏆 Famous Athletes</h3>
            <div class="table-wrapper"><table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Sport</th>
                  <th>Team</th>
                  <th>Achievements</th>
                </tr>
              </thead>
              <tbody>
                ${data.famousAthletes.map(a => `
                <tr>
                  <td><strong>${a.name}</strong></td>
                  <td>${a.sport || 'N/A'}</td>
                  <td>${a.team || 'N/A'}</td>
                  <td>${a.achievements || a.awards || 'N/A'}</td>
                </tr>
                `).join('')}
              </tbody>
            </table></div>
            ` : ''}

            ${data.historicFigures && data.historicFigures.length > 0 ? `
            <h3>📜 Historic Figures</h3>
            <div class="grid">
              ${data.historicFigures.map(h => `
              <div class="card">
                <h4>${h.fullName} (${h.years})</h4>
                <p><strong>${h.category}</strong></p>
                <p>${h.significance}</p>
                ${h.achievements ? `<ul>${h.achievements.map(a => `<li>${a}</li>`).join('')}</ul>` : ''}
              </div>
              `).join('')}
            </div>
            ` : ''}
          </div>
        </div>
      </div>

      <!-- Pop Culture Accordion -->
      <div class="accordion">
        <div class="accordion-header" onclick="toggleAccordion(this)">
          <div class="accordion-title">
            <div class="accordion-icon">🎬</div>
            <span><span style="opacity: 0.5; font-size: 0.7em; margin-right: 10px;">[TMP-4]</span>Pop Culture References</span>
          </div>
          <i class="fas fa-chevron-down accordion-chevron"></i>
        </div>
        <div class="accordion-content">
          <div class="accordion-body">
            ${data.moviesAndShows && data.moviesAndShows.length > 0 ? `
            <h3>🎬 Movies & TV Shows</h3>
            <div class="table-wrapper"><table>
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Year</th>
                  <th>Character</th>
                  <th>Description</th>
                </tr>
              </thead>
              <tbody>
                ${data.moviesAndShows.map(m => `
                <tr>
                  <td><strong>${m.title}</strong></td>
                  <td>${m.year}</td>
                  <td>${m.characterName}</td>
                  <td>${m.characterDescription || m.description || 'N/A'}</td>
                </tr>
                `).join('')}
              </tbody>
            </table></div>
            ` : '<p>No movies/shows data available.</p>'}

            ${data.songsAboutName && data.songsAboutName.length > 0 ? `
            <h3>🎵 Songs</h3>
            <div class="table-wrapper"><table>
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Artist</th>
                  <th>Year</th>
                  <th>Genre</th>
                </tr>
              </thead>
              <tbody>
                ${data.songsAboutName.map(s => `
                <tr>
                  <td><strong>${s.title}</strong></td>
                  <td>${s.artist}</td>
                  <td>${s.year}</td>
                  <td>${s.genre}</td>
                </tr>
                `).join('')}
              </tbody>
            </table></div>
            ` : ''}

            ${data.booksWithCharacter && data.booksWithCharacter.length > 0 ? `
            <h3>📚 Books</h3>
            <div class="grid">
              ${data.booksWithCharacter.map(b => `
              <div class="card">
                <h4>${b.title} (${b.yearPublished})</h4>
                <p><strong>Author:</strong> ${b.author}</p>
                <p><strong>Character:</strong> ${b.characterName}</p>
                <p><strong>Role:</strong> ${b.characterRole || 'N/A'}</p>
              </div>
              `).join('')}
            </div>
            ` : ''}
          </div>
        </div>
      </div>

      <!-- Spiritual & Celestial Accordion -->
      <div class="accordion">
        <div class="accordion-header" onclick="toggleAccordion(this)">
          <div class="accordion-title">
            <div class="accordion-icon">🌙</div>
            <span><span style="opacity: 0.5; font-size: 0.7em; margin-right: 10px;">[TMP-5]</span>Spiritual & Celestial</span>
          </div>
          <i class="fas fa-chevron-down accordion-chevron"></i>
        </div>
        <div class="accordion-content">
          <div class="accordion-body">
            ${data.religiousSignificance && data.religiousSignificance.hasSignificance ? `
            <h3>✝️ Religious Significance</h3>
            <div class="card">
              <p><strong>Religions:</strong> ${data.religiousSignificance.religions.join(', ')}</p>
              <p><strong>Character:</strong> ${data.religiousSignificance.character}</p>
              <p><strong>Significance:</strong> ${data.religiousSignificance.significance}</p>
              ${data.religiousSignificance.keyStories ? `
              <p style="margin-top: 15px;"><strong>Key Stories:</strong></p>
              <ul>
                ${data.religiousSignificance.keyStories.map(s => `<li>${s}</li>`).join('')}
              </ul>
              ` : ''}
            </div>
            ` : ''}

            ${data.celestialData ? `
            <h3>✨ Celestial & Numerology</h3>
            <div class="celestial-grid">
              <div class="celestial-card">
                <h4>🔢 Lucky Number</h4>
                <div class="celestial-value">${data.celestialData.luckyNumber}</div>
              </div>
              <div class="celestial-card">
                <h4>🎨 Lucky Color</h4>
                <div style="width: 60px; height: 60px; background: ${data.celestialData.luckyColor.hex}; border-radius: 50%; margin: 15px auto; box-shadow: 0 5px 20px ${data.celestialData.luckyColor.hex}50;"></div>
                <p style="font-weight: 700;">${data.celestialData.luckyColor.name}</p>
              </div>
              <div class="celestial-card">
                <h4>💎 Lucky Gemstone</h4>
                <div class="celestial-value" style="font-size: 1.8em;">${data.celestialData.luckyGemstone}</div>
              </div>
              <div class="celestial-card">
                <h4>📅 Lucky Day</h4>
                <div class="celestial-value" style="font-size: 1.8em;">${data.celestialData.luckyDay}</div>
              </div>
            </div>

            <div class="grid" style="margin-top: 25px;">
              <div class="card">
                <h4>🌙 Moon Phase</h4>
                <p style="font-size: 1.3em; font-weight: 700; color: #764ba2;">${data.celestialData.moonPhase}</p>
                <p style="margin-top: 10px;">${data.celestialData.moonPhaseDescription}</p>
              </div>
              <div class="card">
                <h4>🌟 Celestial Archetype</h4>
                <p style="font-size: 1.3em; font-weight: 700; color: #764ba2;">${data.celestialData.celestialArchetype}</p>
                <p style="margin-top: 10px;">${data.celestialData.celestialArchetypeDescription}</p>
              </div>
            </div>

            <div class="card" style="margin-top: 20px;">
              <h4>♈ Compatible Signs</h4>
              <p style="font-size: 1.2em; margin-bottom: 10px;">${data.celestialData.compatibleSigns.join(', ')}</p>
              <p>${data.celestialData.compatibleSignsDescription}</p>
            </div>

            <div class="card" style="margin-top: 20px;">
              <h4>🎯 Karmic Lessons</h4>
              <p style="font-size: 1.1em;">${data.celestialData.karmicLessons}</p>
            </div>
            ` : '<p>No celestial data available.</p>'}
          </div>
        </div>
      </div>

      <!-- Blog Content Accordion -->
      ${data.v11BlogContent ? `
      <div class="accordion">
        <div class="accordion-header" onclick="toggleAccordion(this)">
          <div class="accordion-title">
            <div class="accordion-icon">📝</div>
            <span><span style="opacity: 0.5; font-size: 0.7em; margin-right: 10px;">[TMP-6]</span>Blog Content (V11)</span>
          </div>
          <i class="fas fa-chevron-down accordion-chevron"></i>
        </div>
        <div class="accordion-content">
          <div class="accordion-body">
            <span class="badge badge-v11">V11 Writer-Driven Narrative</span>

            ${Object.entries(data.v11BlogContent)
              .filter(([key]) => !key.includes('writer'))
              .map(([section, content]) => `
              <div class="card" style="margin-top: 25px;">
                ${content}
              </div>
            `).join('')}
          </div>
        </div>
      </div>
      ` : ''}

      <!-- Bonus V8 Data Accordion -->
      <div class="accordion">
        <div class="accordion-header" onclick="toggleAccordion(this)">
          <div class="accordion-title">
            <div class="accordion-icon">🎁</div>
            <span><span style="opacity: 0.5; font-size: 0.7em; margin-right: 10px;">[TMP-7]</span>Bonus Data from V8</span>
          </div>
          <i class="fas fa-chevron-down accordion-chevron"></i>
        </div>
        <div class="accordion-content">
          <div class="accordion-body">
            <span class="badge badge-v8">V8 Exclusive Fields</span>
            <p style="margin: 20px 0;">These fields were removed in V10 but preserved in V13!</p>

            ${data.categories ? `
            <div class="card">
              <h4>🏷️ Categories</h4>
              <div>
                ${Array.isArray(data.categories) ? data.categories.map(c => `<span class="badge badge-v8">${c}</span>`).join('') : data.categories}
              </div>
            </div>
            ` : ''}

            ${data.syllables ? `
            <div class="card" style="margin-top: 20px;">
              <h4>🔤 Syllables</h4>
              <div class="celestial-value">${data.syllables}</div>
            </div>
            ` : ''}

            ${data.translations ? `
            <div class="card" style="margin-top: 20px;">
              <h4>🌍 Translations</h4>
              <ul>
                ${Object.entries(data.translations).map(([lang, trans]) => `<li><strong>${lang}:</strong> ${trans}</li>`).join('')}
              </ul>
            </div>
            ` : ''}

            ${!data.categories && !data.syllables && !data.translations && !data.celebrityBabies && !data.inspiration ? `
            <p>No V8 bonus data available for this name.</p>
            ` : ''}
          </div>
        </div>
      </div>

    </div>
  </div>

  <script>
    function toggleAccordion(header) {
      const accordion = header.parentElement;
      const wasActive = accordion.classList.contains('active');

      // Close all accordions
      document.querySelectorAll('.accordion').forEach(acc => {
        acc.classList.remove('active');
      });

      // Open clicked accordion if it wasn't active
      if (!wasActive) {
        accordion.classList.add('active');
      }
    }

    // Auto-open first accordion on load
    document.addEventListener('DOMContentLoaded', () => {
      const firstAccordion = document.querySelector('.accordion');
      if (firstAccordion) {
        firstAccordion.classList.add('active');
      }
    });
  </script>
</body>
</html>`;

const outputPath = path.join(__dirname, '..', 'public', 'profiles', 'v13', `${nameLower}-seo.html`);
const outputDir = path.dirname(outputPath);

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

fs.writeFileSync(outputPath, html);

console.log(`\n🚀 V13 SEO-OPTIMIZED HTML saved: ${outputPath}\n`);
console.log(`✅ SEO Features:`);
console.log(`   ✅ Meta description & keywords`);
console.log(`   ✅ Open Graph tags (Facebook/LinkedIn)`);
console.log(`   ✅ Twitter Card tags`);
console.log(`   ✅ Canonical URL & preconnect`);
console.log(`   ✅ Beautiful glassmorphism design`);
console.log(`   ✅ Smooth collapsible accordions`);
console.log(`   - Purple/pink gradient theme`);
console.log(`   - Font Awesome icons`);
console.log(`   - Animated transitions`);
console.log(`   - Mobile responsive\n`);
