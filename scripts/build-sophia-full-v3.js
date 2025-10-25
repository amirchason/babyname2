const fs = require('fs');

// Load Sophia's v3 comprehensive data
const data = JSON.parse(
  fs.readFileSync('/data/data/com.termux/files/home/proj/babyname2/public/data/enriched/sophia-v3-comprehensive.json', 'utf8')
);

console.log('Building Sophia profile with ALL v3 data...');
console.log(`- Historic Figures: ${data.historicFigures.length}`);
console.log(`- Songs: ${data.songs.length}`);
console.log(`- Movies/Shows: ${data.moviesAndShows.length}`);
console.log(`- Famous People: ${data.famousPeople.length}`);
console.log(`- Nicknames: ${data.nicknames.length}`);

// Extract personality traits
const personalityWords = [
  'Intelligent', 'Wise', 'Compassionate', 'Leader', 'Just',
  'Empathetic', 'Strong', 'Noble', 'Kind'
];

// Get first 12 nicknames
const nicknames = data.nicknames.slice(0, 12);

// Get first 9 variations (unique)
const variations = data.variations.filter((v, i, arr) => arr.indexOf(v) === i).slice(0, 9);

// Get first 9 similar names
const similarNames = data.similarNames.slice(0, 9);

const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Sophia - Name Profile | SoulSeed</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
      background: linear-gradient(135deg, #fce7f3 0%, #fbcfe8 50%, #f9a8d4 100%);
      min-height: 100vh;
      padding: 0;
      overflow-x: hidden;
    }

    .container {
      max-width: 480px;
      margin: 0 auto;
      background: rgba(255, 255, 255, 0.95);
      min-height: 100vh;
      box-shadow: 0 0 60px rgba(236, 72, 153, 0.3);
      position: relative;
      overflow: hidden;
    }

    /* Floating particles background */
    .particles {
      position: absolute;
      width: 100%;
      height: 100%;
      overflow: hidden;
      pointer-events: none;
      z-index: 0;
    }

    .particle {
      position: absolute;
      background: radial-gradient(circle, rgba(236, 72, 153, 0.4), transparent);
      border-radius: 50%;
      animation: float 15s infinite ease-in-out;
    }

    @keyframes float {
      0%, 100% { transform: translateY(0) translateX(0) scale(1); opacity: 0.3; }
      50% { transform: translateY(-100px) translateX(50px) scale(1.2); opacity: 0.6; }
    }

    .content {
      position: relative;
      z-index: 1;
    }

    /* Hero section */
    .hero {
      background: linear-gradient(135deg, #ec4899 0%, #f472b6 100%);
      padding: 60px 24px 40px;
      text-align: center;
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
      background: radial-gradient(circle, rgba(255, 255, 255, 0.1) 0%, transparent 70%);
      animation: rotate 20s linear infinite;
    }

    @keyframes rotate {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }

    .name-title {
      font-size: 56px;
      font-weight: 700;
      color: white;
      margin-bottom: 8px;
      text-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
      animation: slideDown 0.6s ease-out;
      position: relative;
      z-index: 2;
    }

    @keyframes slideDown {
      from { opacity: 0; transform: translateY(-30px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .pronunciation {
      font-size: 18px;
      color: rgba(255, 255, 255, 0.9);
      margin-bottom: 16px;
      font-style: italic;
      animation: slideDown 0.6s ease-out 0.1s backwards;
    }

    .origin-badge {
      display: inline-block;
      background: rgba(255, 255, 255, 0.25);
      backdrop-filter: blur(10px);
      padding: 8px 20px;
      border-radius: 20px;
      color: white;
      font-weight: 600;
      font-size: 14px;
      animation: slideDown 0.6s ease-out 0.2s backwards;
      border: 1px solid rgba(255, 255, 255, 0.3);
    }

    /* Stats grid */
    .stats {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
      padding: 24px;
      background: white;
    }

    .stat-card {
      background: linear-gradient(135deg, #fce7f3, #fbcfe8);
      padding: 20px;
      border-radius: 16px;
      text-align: center;
      animation: popIn 0.5s ease-out backwards;
      transition: transform 0.3s ease, box-shadow 0.3s ease;
      border: 1px solid rgba(236, 72, 153, 0.2);
    }

    .stat-card:nth-child(1) { animation-delay: 0.3s; }
    .stat-card:nth-child(2) { animation-delay: 0.4s; }

    @keyframes popIn {
      from { opacity: 0; transform: scale(0.8); }
      to { opacity: 1; transform: scale(1); }
    }

    .stat-card:active {
      transform: scale(0.95);
    }

    .stat-icon {
      width: 50px;
      height: 50px;
      margin: 0 auto 12px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #ec4899, #db2777);
      box-shadow: 0 4px 12px rgba(236, 72, 153, 0.3);
    }

    .stat-icon svg {
      width: 28px;
      height: 28px;
      fill: white;
      filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
    }

    /* Baby GIF container */
    .baby-icon {
      background: transparent !important;
      box-shadow: none !important;
      padding: 0;
      overflow: hidden;
      animation: gentleBounce 3s ease-in-out infinite;
    }

    .baby-icon img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      border-radius: 12px;
    }

    @keyframes gentleBounce {
      0%, 100% { transform: translateY(0px); }
      50% { transform: translateY(-5px); }
    }

    /* Sparkle animation for meaning icon */
    .meaning-icon {
      animation: sparkle 3s ease-in-out infinite;
    }

    @keyframes sparkle {
      0%, 100% { transform: scale(1) rotate(0deg); }
      50% { transform: scale(1.1) rotate(180deg); }
    }

    .stat-label {
      font-size: 12px;
      color: #831843;
      text-transform: uppercase;
      letter-spacing: 1px;
      font-weight: 600;
      margin-bottom: 4px;
    }

    .stat-value {
      font-size: 20px;
      font-weight: 700;
      color: #db2777;
    }

    /* Section styles */
    .section {
      padding: 20px 24px;
      animation: fadeIn 0.6s ease-out backwards;
    }

    .section:nth-child(3) { animation-delay: 0.5s; }
    .section:nth-child(4) { animation-delay: 0.6s; }
    .section:nth-child(5) { animation-delay: 0.7s; }
    .section:nth-child(6) { animation-delay: 0.8s; }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .section-title {
      font-size: 20px;
      font-weight: 700;
      color: #db2777;
      margin-bottom: 12px;
      display: flex;
      align-items: center;
      gap: 12px;
    }

    /* macOS 2025 Style Flat Pastel Icons */
    .section-icon {
      width: 40px;
      height: 40px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: var(--icon-bg);
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
      animation: floaty 4s ease-in-out infinite;
      position: relative;
      flex-shrink: 0;
      transition: transform 0.2s ease;
    }

    .section-icon:active {
      transform: scale(0.95);
    }

    .section-icon svg {
      width: 22px;
      height: 22px;
      fill: white;
      filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.1));
    }

    @keyframes floaty {
      0%, 100% { transform: translateY(0px); }
      50% { transform: translateY(-2px); }
    }

    /* macOS Pastel Color Progression (Pink/Purple theme for female) */
    .icon-1 { --icon-bg: linear-gradient(135deg, #f9a8d4, #ec4899); }  /* Pink */
    .icon-2 { --icon-bg: linear-gradient(135deg, #f0abfc, #e879f9); }  /* Fuchsia */
    .icon-3 { --icon-bg: linear-gradient(135deg, #d8b4fe, #c084fc); }  /* Purple */
    .icon-4 { --icon-bg: linear-gradient(135deg, #c4b5fd, #a78bfa); }  /* Violet */
    .icon-5 { --icon-bg: linear-gradient(135deg, #a5b4fc, #818cf8); }  /* Indigo */
    .icon-6 { --icon-bg: linear-gradient(135deg, #93c5fd, #60a5fa); }  /* Blue */
    .icon-7 { --icon-bg: linear-gradient(135deg, #7dd3fc, #38bdf8); }  /* Cyan */
    .icon-8 { --icon-bg: linear-gradient(135deg, #5eead4, #2dd4bf); }  /* Teal */
    .icon-9 { --icon-bg: linear-gradient(135deg, #6ee7b7, #34d399); }  /* Emerald */
    .icon-10 { --icon-bg: linear-gradient(135deg, #fca5a5, #f87171); } /* Rose */
    .icon-11 { --icon-bg: linear-gradient(135deg, #fbbf24, #f59e0b); } /* Amber */

    .section-content {
      color: #4b5563;
      line-height: 1.7;
      font-size: 15px;
    }

    /* Chip list - FIXED 3-COLUMN GRID */
    .chip-list {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 6px;
      margin-top: 8px;
    }

    .chip {
      background: linear-gradient(135deg, #ec4899, #f472b6);
      color: white;
      padding: 10px 8px;
      border-radius: 8px;
      font-size: 12px;
      font-weight: 600;
      animation: slideIn 0.4s ease-out backwards;
      transition: transform 0.2s ease;
      border: 1px solid rgba(255, 255, 255, 0.3);
      text-align: center;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      line-height: 1.3;
    }

    .chip:nth-child(1) { animation-delay: 0.6s; }
    .chip:nth-child(2) { animation-delay: 0.65s; }
    .chip:nth-child(3) { animation-delay: 0.7s; }
    .chip:nth-child(4) { animation-delay: 0.75s; }
    .chip:nth-child(5) { animation-delay: 0.8s; }

    @keyframes slideIn {
      from { opacity: 0; transform: translateX(-20px); }
      to { opacity: 1; transform: translateX(0); }
    }

    .chip:active {
      transform: scale(0.95);
    }

    /* Historical figures card */
    .hist-card {
      background: linear-gradient(135deg, #fbcfe8, #fce7f3);
      padding: 18px;
      border-radius: 14px;
      border: 1px solid rgba(236, 72, 153, 0.2);
      margin-bottom: 14px;
      animation: slideUp 0.5s ease-out backwards;
    }

    .hist-card:nth-child(1) { animation-delay: 0.6s; }
    .hist-card:nth-child(2) { animation-delay: 0.65s; }
    .hist-card:nth-child(3) { animation-delay: 0.7s; }
    .hist-card:nth-child(4) { animation-delay: 0.75s; }
    .hist-card:nth-child(5) { animation-delay: 0.8s; }

    @keyframes slideUp {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .hist-name {
      font-size: 16px;
      font-weight: 700;
      color: #db2777;
      margin-bottom: 4px;
    }

    .hist-years-cat {
      display: flex;
      gap: 10px;
      align-items: center;
      margin-bottom: 12px;
    }

    .hist-years {
      font-size: 12px;
      color: #831843;
      font-weight: 600;
    }

    .hist-category {
      font-size: 11px;
      background: rgba(219, 39, 119, 0.15);
      color: #831843;
      padding: 3px 10px;
      border-radius: 10px;
      font-weight: 600;
    }

    .hist-achievements {
      font-size: 13px;
      color: #64748b;
      margin-bottom: 8px;
      padding-left: 16px;
    }

    .hist-achievements li {
      margin-bottom: 4px;
    }

    .hist-significance {
      font-size: 13px;
      color: #475569;
      font-style: italic;
      padding: 10px;
      background: rgba(255, 255, 255, 0.5);
      border-radius: 8px;
      border-left: 3px solid #ec4899;
    }

    /* Quote card */
    .quote-card {
      background: linear-gradient(135deg, #fbcfe8, #fce7f3);
      padding: 20px;
      border-radius: 16px;
      border-left: 4px solid #ec4899;
      margin-top: 12px;
      font-style: italic;
      color: #831843;
      animation: slideRight 0.6s ease-out backwards;
      animation-delay: 0.7s;
    }

    @keyframes slideRight {
      from { opacity: 0; transform: translateX(-30px); }
      to { opacity: 1; transform: translateX(0); }
    }

    /* Fun fact card */
    .fun-fact {
      background: linear-gradient(135deg, #f472b6, #ec4899);
      padding: 24px;
      border-radius: 20px;
      color: white;
      margin-top: 12px;
      animation: bounce 0.6s ease-out backwards;
      animation-delay: 0.8s;
      box-shadow: 0 8px 24px rgba(236, 72, 153, 0.4);
    }

    @keyframes bounce {
      0% { opacity: 0; transform: scale(0.8) translateY(20px); }
      60% { transform: scale(1.05) translateY(-5px); }
      100% { opacity: 1; transform: scale(1) translateY(0); }
    }

    .fun-fact-title {
      font-size: 16px;
      font-weight: 700;
      margin-bottom: 8px;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .fun-fact-content {
      font-size: 15px;
      line-height: 1.6;
      opacity: 0.95;
    }

    /* Action buttons */
    .actions {
      padding: 24px;
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
    }

    .action-btn {
      padding: 16px;
      border: none;
      border-radius: 16px;
      font-size: 16px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      animation: popIn 0.5s ease-out backwards;
    }

    .action-btn.primary {
      background: linear-gradient(135deg, #ec4899, #db2777);
      color: white;
      box-shadow: 0 4px 12px rgba(219, 39, 119, 0.3);
      animation-delay: 0.9s;
    }

    .action-btn.secondary {
      background: white;
      color: #db2777;
      border: 2px solid #ec4899;
      animation-delay: 1s;
    }

    .action-btn:active {
      transform: scale(0.95);
    }

    /* Divider */
    .divider {
      height: 1px;
      background: linear-gradient(90deg, transparent, #ec4899, transparent);
      margin: 0 24px;
    }

    /* Song/movie/person cards */
    .song-card, .quote-card-modern, .person-card, .movie-card, .character-quote-card {
      background: linear-gradient(135deg, #fbcfe8, #fce7f3);
      padding: 16px;
      border-radius: 14px;
      border: 1px solid rgba(236, 72, 153, 0.2);
      transition: all 0.3s ease;
      animation: slideUp 0.5s ease-out backwards;
      margin-bottom: 12px;
    }

    .song-card:nth-child(1), .quote-card-modern:nth-child(1), .person-card:nth-child(1), .movie-card:nth-child(1) { animation-delay: 0.7s; }
    .song-card:nth-child(2), .quote-card-modern:nth-child(2), .person-card:nth-child(2), .movie-card:nth-child(2) { animation-delay: 0.75s; }
    .person-card:nth-child(3), .movie-card:nth-child(3) { animation-delay: 0.8s; }

    .song-card:active, .quote-card-modern:active, .person-card:active, .movie-card:active, .character-quote-card:active {
      transform: scale(0.98);
    }

    .song-header, .movie-header, .person-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 10px;
    }

    .song-title, .movie-title, .person-name {
      font-size: 15px;
      font-weight: 700;
      color: #db2777;
    }

    .song-year, .movie-genre, .person-profession {
      font-size: 11px;
      color: #831843;
      background: rgba(219, 39, 119, 0.1);
      padding: 3px 10px;
      border-radius: 12px;
      font-weight: 600;
    }

    .song-quote, .movie-description, .person-known-for, .quote-summary {
      font-size: 14px;
      color: #831843;
      margin-bottom: 10px;
      line-height: 1.5;
    }

    .song-quote {
      font-style: italic;
      padding-left: 12px;
      border-left: 3px solid #ec4899;
    }

    .youtube-link, .imdb-link {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      font-size: 13px;
      color: #db2777;
      font-weight: 600;
      text-decoration: none;
      padding: 6px 12px;
      background: rgba(219, 39, 119, 0.1);
      border-radius: 20px;
      transition: all 0.2s ease;
    }

    .youtube-link:hover, .imdb-link:hover {
      background: rgba(219, 39, 119, 0.2);
      transform: translateX(2px);
    }

    .youtube-link:active, .imdb-link:active {
      transform: scale(0.95);
    }

    .quote-text {
      font-size: 15px;
      color: #831843;
      font-style: italic;
      line-height: 1.6;
      margin-bottom: 12px;
    }

    .author-name, .character-name-title {
      font-size: 14px;
      font-weight: 700;
      color: #db2777;
    }

    .author-context, .source-title, .quote-context {
      font-size: 12px;
      color: #831843;
      opacity: 0.8;
      font-style: italic;
    }

    .person-awards {
      font-size: 12px;
      color: #831843;
      margin-bottom: 8px;
      font-weight: 500;
    }

    .character-quote-card {
      border-left: 4px solid #ec4899;
    }

    .religious-box {
      background: linear-gradient(135deg, #fce7f3, #fbcfe8);
      padding: 16px;
      border-radius: 12px;
      border-left: 4px solid #ec4899;
      margin-top: 12px;
    }

    .religious-title {
      font-size: 15px;
      font-weight: 700;
      color: #db2777;
      margin-bottom: 8px;
    }

    .religious-text {
      font-size: 14px;
      color: #64748b;
      line-height: 1.6;
      margin-bottom: 10px;
    }

    .religious-list {
      list-style: none;
      padding-left: 0;
    }

    .religious-list li {
      padding: 6px 0 6px 24px;
      position: relative;
      font-size: 13px;
      color: #475569;
    }

    .religious-list li::before {
      content: "✓";
      position: absolute;
      left: 0;
      color: #ec4899;
      font-weight: 700;
    }
  </style>
</head>
<body>
  <div class="container">
    <!-- Floating particles -->
    <div class="particles" id="particles"></div>

    <div class="content">
      <!-- Hero Section -->
      <div class="hero">
        <h1 class="name-title">${data.name}</h1>
        <p class="pronunciation">${data.pronunciationGuide}</p>
        <span class="origin-badge">🌍 ${data.origin}</span>
      </div>

      <!-- Stats Grid -->
      <div class="stats">
        <div class="stat-card">
          <div class="stat-icon meaning-icon">
            <svg viewBox="0 0 24 24">
              <path d="M12 2L9.19 8.63 2 9.24l5.46 4.73L5.82 21 12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2z"/>
            </svg>
          </div>
          <div class="stat-label">Meaning</div>
          <div class="stat-value">${data.meaning}</div>
        </div>
        <div class="stat-card">
          <div class="stat-icon baby-icon" id="babyGifContainer">
            <!-- Random baby GIF will be loaded here -->
          </div>
          <div class="stat-label">Gender</div>
          <div class="stat-value">Girl</div>
        </div>
      </div>

      <!-- Cultural Significance -->
      <div class="section">
        <h2 class="section-title">
          <div class="section-icon icon-1">
            <svg viewBox="0 0 24 24"><path d="M12 3L2 12h3v8h6v-6h2v6h6v-8h3L12 3z"/></svg>
          </div>
          Cultural Significance
        </h2>
        <p class="section-content">
          ${data.culturalSignificance}
        </p>
      </div>

      <div class="divider"></div>

      <!-- Modern Context -->
      <div class="section">
        <h2 class="section-title">
          <div class="section-icon icon-2">
            <svg viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>
          </div>
          Modern Popularity
        </h2>
        <p class="section-content">
          ${data.modernContext}
        </p>
      </div>

      <div class="divider"></div>

      <!-- Literary References -->
      <div class="section">
        <h2 class="section-title">
          <div class="section-icon icon-3">
            <svg viewBox="0 0 24 24"><path d="M18 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 4h5v8l-2.5-1.5L6 12V4z"/></svg>
          </div>
          Literary References
        </h2>
        <p class="section-content">
          ${data.literaryReferences}
        </p>
      </div>

      <div class="divider"></div>

      ${data.religiousSignificance.hasSignificance ? `
      <!-- Religious Significance -->
      <div class="section">
        <h2 class="section-title">
          <div class="section-icon icon-4">
            <svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"/></svg>
          </div>
          Religious Significance
        </h2>
        <div class="religious-box">
          <div class="religious-title">${data.religiousSignificance.character}</div>
          <div class="religious-text">${data.religiousSignificance.significance}</div>
          <ul class="religious-list">
            ${data.religiousSignificance.keyStories.map(story => `<li>${story}</li>`).join('')}
          </ul>
          <div class="religious-text" style="margin-top: 12px;">
            <strong>Spiritual Meaning:</strong> ${data.religiousSignificance.spiritualMeaning}
          </div>
        </div>
      </div>

      <div class="divider"></div>
      ` : ''}

      <!-- Historical Figures -->
      <div class="section">
        <h2 class="section-title">
          <div class="section-icon icon-5">
            <svg viewBox="0 0 24 24"><path d="M12 6c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2m0 10c2.7 0 5.8 1.29 6 2H6c.23-.72 3.31-2 6-2m0-12C9.79 4 8 5.79 8 8s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm0 10c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
          </div>
          Historic Figures (${data.historicFigures.length})
        </h2>
        <div style="margin-top: 12px;">
          ${data.historicFigures.map(figure => `
          <div class="hist-card">
            <div class="hist-name">${figure.fullName}</div>
            <div class="hist-years-cat">
              <div class="hist-years">${figure.years}</div>
              <div class="hist-category">${figure.category}</div>
            </div>
            <ul class="hist-achievements">
              ${figure.achievements.map(ach => `<li>${ach}</li>`).join('')}
            </ul>
            <div class="hist-significance">
              <strong>Significance:</strong> ${figure.significance}
            </div>
          </div>
          `).join('')}
        </div>
      </div>

      <div class="divider"></div>

      <!-- Personality - EXACTLY 9 PILLS (3x3) -->
      <div class="section" style="padding: 16px 24px;">
        <h2 class="section-title" style="margin-bottom: 6px;">
          <div class="section-icon icon-6">
            <svg viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
          </div>
          Personality
        </h2>
        <div class="chip-list">
          ${personalityWords.map(word => `<div class="chip">${word}</div>`).join('\n          ')}
        </div>
      </div>

      <div class="divider"></div>

      <!-- Nicknames - EXACTLY 12 PILLS (4x3) -->
      <div class="section" style="padding: 16px 24px;">
        <h2 class="section-title" style="margin-bottom: 6px;">
          <div class="section-icon icon-7">
            <svg viewBox="0 0 24 24"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-7 9h-2V5h2v6zm0 4h-2v-2h2v2z"/></svg>
          </div>
          Nicknames
        </h2>
        <div class="chip-list" style="grid-template-columns: repeat(4, 1fr);">
          ${nicknames.map(nick => `<div class="chip">${nick}</div>`).join('\n          ')}
        </div>
      </div>

      <div class="divider"></div>

      <!-- Variations - EXACTLY 9 PILLS (3x3) -->
      <div class="section" style="padding: 16px 24px;">
        <h2 class="section-title" style="margin-bottom: 6px;">
          <div class="section-icon icon-8">
            <svg viewBox="0 0 24 24"><path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/></svg>
          </div>
          Related Names
        </h2>
        <div class="chip-list">
          ${variations.map(v => `<div class="chip">${v}</div>`).join('\n          ')}
        </div>
      </div>

      <div class="divider"></div>

      <!-- Similar Names - EXACTLY 9 PILLS (3x3) -->
      <div class="section" style="padding: 16px 24px;">
        <h2 class="section-title" style="margin-bottom: 6px;">
          <div class="section-icon icon-9">
            <svg viewBox="0 0 24 24"><path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/></svg>
          </div>
          Similar Names
        </h2>
        <div class="chip-list">
          ${similarNames.map(n => `<div class="chip">${n}</div>`).join('\n          ')}
        </div>
      </div>

      <div class="divider"></div>

      <!-- Songs Section -->
      <div class="section">
        <h2 class="section-title">
          <div class="section-icon icon-10">
            <svg viewBox="0 0 24 24"><path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/></svg>
          </div>
          Songs About ${data.name}
        </h2>
        <div style="margin-top: 12px;">
          ${data.songs.map(song => `
          <div class="song-card">
            <div class="song-header">
              <div class="song-title">"${song.title}" by ${song.artist}</div>
              <div class="song-year">${song.year}</div>
            </div>
            <div class="song-quote">"${song.quote}"</div>
            <a href="${song.youtubeSearchUrl}" target="_blank" class="youtube-link">
              🎧 Listen on YouTube
            </a>
          </div>
          `).join('')}
        </div>
      </div>

      <div class="divider"></div>

      <!-- Famous Quotes Section -->
      ${data.famousQuotes.length > 0 ? `
      <div class="section">
        <h2 class="section-title">
          <div class="section-icon icon-11">
            <svg viewBox="0 0 24 24"><path d="M6 17h3l2-4V7H5v6h3zm8 0h3l2-4V7h-6v6h3z"/></svg>
          </div>
          Famous Quotes
        </h2>
        <div style="margin-top: 12px;">
          ${data.famousQuotes.map(quote => `
          <div class="quote-card-modern">
            <div class="quote-text">"${quote.quote}"</div>
            <div>
              <div class="author-name">— ${quote.person}</div>
              <div class="author-context">${quote.context}</div>
            </div>
          </div>
          `).join('')}
        </div>
      </div>

      <div class="divider"></div>
      ` : ''}

      <!-- Famous People Section -->
      <div class="section">
        <h2 class="section-title">
          <div class="section-icon icon-1">
            <svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="4"/><path d="M12 14c-4.42 0-8 1.79-8 4v2h16v-2c0-2.21-3.58-4-8-4z"/></svg>
          </div>
          Famous People Named ${data.name}
        </h2>
        <div style="margin-top: 12px;">
          ${data.famousPeople.map(person => `
          <div class="person-card">
            <div class="person-header">
              <div class="person-name">${person.name}</div>
              <div class="person-profession">${person.profession}</div>
            </div>
            <div class="person-known-for">
              <span style="font-weight: 600; font-size: 12px; color: #db2777;">Known for:</span> ${person.knownFor.join(', ')}
            </div>
            <div class="person-awards">🏆 ${person.awards}</div>
            <a href="${person.imdbUrl}" target="_blank" class="imdb-link">
              🎬 View on IMDB
            </a>
          </div>
          `).join('')}
        </div>
      </div>

      <div class="divider"></div>

      <!-- Movies & Shows Section -->
      <div class="section">
        <h2 class="section-title">
          <div class="section-icon icon-2">
            <svg viewBox="0 0 24 24"><path d="M18 4l2 4h-3l-2-4h-2l2 4h-3l-2-4H8l2 4H7L5 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V4h-4z"/></svg>
          </div>
          Movies & Shows with ${data.name}
        </h2>
        <div style="margin-top: 12px;">
          ${data.moviesAndShows.map(movie => `
          <div class="movie-card">
            <div class="movie-header">
              <div class="movie-title">${movie.title} (${movie.year})</div>
              <div class="movie-genre">${movie.genre}</div>
            </div>
            <div class="movie-description">
              <strong>Character:</strong> ${movie.characterName}
            </div>
            <div class="movie-description">
              ${movie.characterDescription}
            </div>
            <a href="${movie.imdbUrl}" target="_blank" class="imdb-link">
              🎬 View on IMDB
            </a>
          </div>
          `).join('')}
        </div>
      </div>

      <div class="divider"></div>

      <!-- Character Quotes Section -->
      ${data.characterQuotes.length > 0 ? `
      <div class="section">
        <h2 class="section-title">
          <div class="section-icon icon-3">
            <svg viewBox="0 0 24 24"><path d="M21 3H3c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H3V5h18v14zm-10-7h9v6h-9z"/></svg>
          </div>
          Memorable Character Moments
        </h2>
        <div style="margin-top: 12px;">
          ${data.characterQuotes.map(cq => `
          <div class="character-quote-card">
            <div style="margin-bottom: 8px;">
              <div class="character-name-title">${cq.character}</div>
              <div class="source-title">from ${cq.source}</div>
            </div>
            <div class="quote-summary">
              "${cq.quoteSummary}"
            </div>
            <div class="quote-context">
              💡 ${cq.context}
            </div>
          </div>
          `).join('')}
        </div>
      </div>

      <div class="divider"></div>
      ` : ''}

      <!-- Fun Fact -->
      <div class="section">
        <div class="fun-fact">
          <div class="fun-fact-title">
            <span>🎉</span>
            Fun Fact
          </div>
          <div class="fun-fact-content">
            ${data.funFact}
          </div>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="actions">
        <button class="action-btn primary" onclick="addToFavorites()">
          <span>❤️</span>
          Add to Favorites
        </button>
        <button class="action-btn secondary" onclick="shareProfile()">
          <span>🔗</span>
          Share
        </button>
      </div>
    </div>
  </div>

  <script>
    // Load random baby GIF
    function loadRandomBabyGif() {
      const totalGifs = 16;
      const randomNum = Math.floor(Math.random() * totalGifs) + 1;
      const gifPath = \`file:///data/data/com.termux/files/home/proj/babyname2/public/assets/baby-gifs/baby-\${randomNum}.gif\`;

      const container = document.getElementById('babyGifContainer');
      const img = document.createElement('img');
      img.src = gifPath;
      img.alt = 'Cute baby animation';
      img.onerror = function() {
        container.innerHTML = '<span style="font-size: 32px;">👶</span>';
      };
      img.style.animation = 'fadeIn 0.5s ease-out';

      container.appendChild(img);
    }

    loadRandomBabyGif();

    // Generate floating particles
    const particlesContainer = document.getElementById('particles');
    for (let i = 0; i < 15; i++) {
      const particle = document.createElement('div');
      particle.className = 'particle';
      particle.style.width = Math.random() * 100 + 50 + 'px';
      particle.style.height = particle.style.width;
      particle.style.left = Math.random() * 100 + '%';
      particle.style.top = Math.random() * 100 + '%';
      particle.style.animationDelay = Math.random() * 5 + 's';
      particle.style.animationDuration = Math.random() * 10 + 10 + 's';
      particlesContainer.appendChild(particle);
    }

    function addToFavorites() {
      alert('❤️ ${data.name} added to your favorites!');
    }

    function shareProfile() {
      if (navigator.share) {
        navigator.share({
          title: '${data.name} - Name Profile',
          text: 'Check out this beautiful name profile for ${data.name} on SoulSeed!',
          url: window.location.href
        });
      } else {
        alert('🔗 Share link copied to clipboard!');
      }
    }
  </script>
</body>
</html>`;

fs.writeFileSync('/data/data/com.termux/files/home/proj/babyname2/public/sophia-full-v3.html', html);

console.log('\n✅ Complete Sophia profile generated!');
console.log('💾 Saved to: public/sophia-full-v3.html');
console.log('\nIncludes:');
console.log(`  • ${data.historicFigures.length} Historical Figures with full details`);
console.log(`  • ${data.songs.length} Songs with YouTube links`);
console.log(`  • ${data.moviesAndShows.length} Movies/TV Shows with IMDb links`);
console.log(`  • ${data.famousPeople.length} Famous People`);
console.log(`  • ${nicknames.length} Nicknames`);
console.log(`  • ${variations.length} Name Variations`);
console.log(`  • ${similarNames.length} Similar Names`);
console.log(`  • Religious Significance: ${data.religiousSignificance.hasSignificance ? 'Yes' : 'No'}`);
console.log(`  • Fun Fact included`);
console.log(`  • All sections styled in John's exact format!`);
