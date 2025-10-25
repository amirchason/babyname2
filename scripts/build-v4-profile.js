const fs = require('fs');

/**
 * Universal V4 Profile Builder
 * Builds a profile page for any name enriched with V4 data
 */

function buildV4Profile(nameData, outputPath) {
  // Get a random baby GIF
  const babyGifs = [
    'baby-cute-1.gif',
    'baby-laugh-2.gif',
    'baby-play-3.gif',
    'baby-smile-4.gif',
    'baby-wave-5.gif'
  ];
  const randomGif = babyGifs[Math.floor(Math.random() * babyGifs.length)];

  // Determine color theme based on gender
  const isFemale = nameData.gender === 'female';
  const theme = isFemale ? {
    bgGradient: 'linear-gradient(135deg, #fce7f3 0%, #fbcfe8 50%, #f9a8d4 100%)',
    heroGradient: 'linear-gradient(135deg, #ec4899 0%, #f472b6 100%)',
    particleColor: 'rgba(236, 72, 153, 0.3)',
    chipBg: 'linear-gradient(135deg, #fce7f3 0%, #fbcfe8 100%)',
    chipColor: '#be185d',
    histBg: 'linear-gradient(135deg, #fef3f2 0%, #fee2e2 100%)',
    histBorder: '#ec4899',
    histYearsBg: '#fce7f3',
    histYearsColor: '#be185d',
    histCatBg: '#fbcfe8',
    histCatColor: '#9f1239',
    histAccent: '#ec4899'
  } : {
    bgGradient: 'linear-gradient(135deg, #e6f2ff 0%, #f0f9ff 50%, #e0f2fe 100%)',
    heroGradient: 'linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%)',
    particleColor: 'rgba(59, 130, 246, 0.3)',
    chipBg: 'linear-gradient(135deg, #dbeafe 0%, #e0f2fe 100%)',
    chipColor: '#1e40af',
    histBg: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
    histBorder: '#3b82f6',
    histYearsBg: '#dbeafe',
    histYearsColor: '#1e40af',
    histCatBg: '#e0f2fe',
    histCatColor: '#0369a1',
    histAccent: '#3b82f6'
  };

  // Create complete HTML
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${nameData.name} - Name Profile | SoulSeed</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      background: ${theme.bgGradient};
      min-height: 100vh;
      padding: 16px;
      position: relative;
      overflow-x: hidden;
    }

    /* Floating particles */
    .particle {
      position: fixed;
      width: 8px;
      height: 8px;
      background: ${theme.particleColor};
      border-radius: 50%;
      pointer-events: none;
      z-index: 0;
      animation: float 15s infinite ease-in-out;
    }

    @keyframes float {
      0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.3; }
      25% { transform: translate(30px, -30px) scale(1.2); opacity: 0.5; }
      50% { transform: translate(-20px, -60px) scale(0.8); opacity: 0.4; }
      75% { transform: translate(-40px, -30px) scale(1.1); opacity: 0.6; }
    }

    ${Array.from({length: 20}, (_, i) => `
    .particle:nth-child(${i + 1}) {
      left: ${Math.random() * 100}%;
      top: ${Math.random() * 100}%;
      animation-delay: -${Math.random() * 15}s;
      animation-duration: ${12 + Math.random() * 8}s;
    }`).join('\n    ')}

    .container {
      max-width: 480px;
      margin: 0 auto;
      position: relative;
      z-index: 1;
    }

    .hero {
      background: ${theme.heroGradient};
      border-radius: 24px;
      padding: 32px 24px;
      text-align: center;
      color: white;
      box-shadow: 0 20px 60px ${theme.particleColor.replace('0.3', '0.3')};
      margin-bottom: 16px;
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
      animation: pulse 4s ease-in-out infinite;
    }

    @keyframes pulse {
      0%, 100% { transform: scale(1); opacity: 0.5; }
      50% { transform: scale(1.1); opacity: 0.3; }
    }

    .name-title {
      font-size: 48px;
      font-weight: 800;
      margin-bottom: 8px;
      position: relative;
      z-index: 1;
      text-shadow: 0 2px 10px rgba(0,0,0,0.2);
    }

    .pronunciation {
      font-size: 18px;
      opacity: 0.95;
      margin-bottom: 16px;
      position: relative;
      z-index: 1;
      font-style: italic;
    }

    .origin-meaning {
      font-size: 16px;
      opacity: 0.9;
      line-height: 1.6;
      position: relative;
      z-index: 1;
    }

    .v4-badge {
      display: inline-block;
      background: rgba(255,255,255,0.2);
      padding: 4px 12px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 600;
      margin-top: 8px;
      position: relative;
      z-index: 1;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
      margin-bottom: 16px;
    }

    .stat-card {
      background: white;
      border-radius: 16px;
      padding: 20px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.08);
      transition: transform 0.2s, box-shadow 0.2s;
    }

    .stat-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 30px rgba(0,0,0,0.12);
    }

    .stat-label {
      font-size: 13px;
      color: #64748b;
      margin-bottom: 8px;
      font-weight: 500;
    }

    .stat-value {
      font-size: 20px;
      font-weight: 700;
      color: #1e293b;
    }

    .baby-gif-card {
      grid-column: 1 / -1;
      background: white;
      border-radius: 16px;
      padding: 16px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.08);
      text-align: center;
    }

    .baby-gif {
      width: 100%;
      max-width: 200px;
      height: auto;
      border-radius: 12px;
      margin: 8px auto;
      display: block;
    }

    .section {
      background: white;
      border-radius: 20px;
      padding: 24px;
      margin-bottom: 16px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.08);
    }

    .section-title {
      font-size: 20px;
      font-weight: 700;
      color: #1e293b;
      margin-bottom: 16px;
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .section-icon {
      width: 32px;
      height: 32px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .section-icon svg {
      width: 18px;
      height: 18px;
      fill: white;
    }

    .icon-1 { background: linear-gradient(135deg, #ec4899 0%, #f472b6 100%); }
    .icon-2 { background: linear-gradient(135deg, #8b5cf6 0%, #a78bfa 100%); }
    .icon-3 { background: linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%); }
    .icon-4 { background: linear-gradient(135deg, #10b981 0%, #34d399 100%); }
    .icon-5 { background: linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%); }
    .icon-6 { background: linear-gradient(135deg, #ef4444 0%, #f87171 100%); }
    .icon-7 { background: linear-gradient(135deg, #06b6d4 0%, #22d3ee 100%); }
    .icon-8 { background: linear-gradient(135deg, #6366f1 0%, #818cf8 100%); }
    .icon-9 { background: linear-gradient(135deg, #14b8a6 0%, #2dd4bf 100%); }
    .icon-10 { background: linear-gradient(135deg, #f43f5e 0%, #fb7185 100%); }

    .section-text {
      font-size: 15px;
      line-height: 1.7;
      color: #475569;
    }

    .chip-list {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 8px;
      margin-top: 12px;
    }

    .chip {
      background: ${theme.chipBg};
      color: ${theme.chipColor};
      padding: 10px 16px;
      border-radius: 12px;
      font-size: 14px;
      font-weight: 600;
      text-align: center;
      transition: all 0.2s;
      cursor: default;
    }

    .chip:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px ${theme.particleColor.replace('0.3', '0.2')};
    }

    .divider {
      height: 1px;
      background: linear-gradient(90deg, transparent 0%, #e2e8f0 50%, transparent 100%);
      margin: 20px 0;
    }

    /* Historical Figures Section */
    .hist-grid {
      display: grid;
      gap: 16px;
      margin-top: 16px;
    }

    .hist-card {
      background: ${theme.histBg};
      border-radius: 16px;
      padding: 20px;
      border-left: 4px solid ${theme.histBorder};
      transition: all 0.3s;
    }

    .hist-card:hover {
      transform: translateX(4px);
      box-shadow: 0 8px 24px ${theme.particleColor.replace('0.3', '0.15')};
    }

    .hist-name {
      font-size: 18px;
      font-weight: 700;
      color: #1e293b;
      margin-bottom: 8px;
    }

    .hist-years-cat {
      display: flex;
      gap: 12px;
      margin-bottom: 12px;
      flex-wrap: wrap;
    }

    .hist-years {
      background: ${theme.histYearsBg};
      color: ${theme.histYearsColor};
      padding: 4px 12px;
      border-radius: 8px;
      font-size: 13px;
      font-weight: 600;
    }

    .hist-category {
      background: ${theme.histCatBg};
      color: ${theme.histCatColor};
      padding: 4px 12px;
      border-radius: 8px;
      font-size: 13px;
      font-weight: 600;
    }

    .hist-achievements {
      list-style: none;
      margin: 12px 0;
      padding: 0;
    }

    .hist-achievements li {
      padding: 6px 0 6px 20px;
      position: relative;
      color: #475569;
      font-size: 14px;
      line-height: 1.6;
    }

    .hist-achievements li::before {
      content: '✓';
      position: absolute;
      left: 0;
      color: ${theme.histAccent};
      font-weight: 700;
    }

    .hist-significance {
      margin-top: 12px;
      padding-top: 12px;
      border-top: 1px solid #e2e8f0;
      font-size: 14px;
      line-height: 1.6;
      color: #64748b;
      font-style: italic;
    }

    .hist-significance strong {
      color: ${theme.histAccent};
      font-style: normal;
    }

    .hist-works {
      margin-top: 10px;
      font-size: 13px;
      color: #64748b;
    }

    .hist-works strong {
      color: #475569;
    }

    /* Pop Culture Cards */
    .pop-card {
      background: linear-gradient(135deg, #faf5ff 0%, #f3e8ff 100%);
      border-radius: 12px;
      padding: 16px;
      margin-bottom: 12px;
      border-left: 3px solid #8b5cf6;
    }

    .pop-card:last-child {
      margin-bottom: 0;
    }

    .pop-title {
      font-size: 16px;
      font-weight: 700;
      color: #1e293b;
      margin-bottom: 6px;
    }

    .pop-meta {
      font-size: 13px;
      color: #64748b;
      margin-bottom: 8px;
    }

    .pop-link {
      display: inline-block;
      color: #8b5cf6;
      text-decoration: none;
      font-size: 14px;
      font-weight: 600;
      margin-top: 8px;
      transition: color 0.2s;
    }

    .pop-link:hover {
      color: #6d28d9;
      text-decoration: underline;
    }

    /* Religious Section */
    .religious-box {
      background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
      border-radius: 12px;
      padding: 20px;
      margin-top: 12px;
      border-left: 4px solid #f59e0b;
    }

    .religious-character {
      font-size: 18px;
      font-weight: 700;
      color: #92400e;
      margin-bottom: 12px;
    }

    .religious-text {
      font-size: 14px;
      line-height: 1.7;
      color: #78350f;
      margin-bottom: 10px;
    }

    .religious-stories {
      margin-top: 12px;
      padding-top: 12px;
      border-top: 1px solid rgba(217, 119, 6, 0.3);
    }

    .religious-stories strong {
      display: block;
      margin-bottom: 8px;
      color: #92400e;
    }

    .religious-stories ul {
      list-style: none;
      padding: 0;
    }

    .religious-stories li {
      padding: 4px 0 4px 16px;
      position: relative;
      color: #78350f;
      font-size: 14px;
    }

    .religious-stories li::before {
      content: '◆';
      position: absolute;
      left: 0;
      color: #f59e0b;
    }

    /* Quote Box */
    .quote-box {
      background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
      border-radius: 12px;
      padding: 20px;
      margin: 12px 0;
      border-left: 4px solid #10b981;
      font-style: italic;
    }

    .quote-text {
      font-size: 16px;
      line-height: 1.7;
      color: #064e3b;
      margin-bottom: 10px;
    }

    .quote-author {
      font-size: 14px;
      font-weight: 600;
      color: #065f46;
      font-style: normal;
    }

    .quote-context {
      font-size: 13px;
      color: #047857;
      margin-top: 4px;
    }

    /* Fun Fact */
    .fun-fact {
      background: ${theme.chipBg};
      border-radius: 12px;
      padding: 16px;
      margin-top: 12px;
      border-left: 4px solid ${theme.histBorder};
    }

    .fun-fact-text {
      font-size: 15px;
      line-height: 1.6;
      color: ${theme.chipColor};
    }

    .fun-fact::before {
      content: '✨';
      margin-right: 8px;
      font-size: 18px;
    }
  </style>
</head>
<body>
  ${Array.from({length: 20}, () => '<div class="particle"></div>').join('\n  ')}

  <div class="container">
    <!-- Hero Section -->
    <div class="hero">
      <h1 class="name-title">${nameData.name}</h1>
      <p class="pronunciation">${nameData.pronunciationGuide}</p>
      <p class="origin-meaning">🌍 ${nameData.origin} • ${nameData.meaning}</p>
      <div class="v4-badge">✨ V4 Enriched</div>
    </div>

    <!-- Stats Grid -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-label">Meaning</div>
        <div class="stat-value">${nameData.meaning}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Gender</div>
        <div class="stat-value">${nameData.gender === 'male' ? 'Boy' : 'Girl'}</div>
      </div>
      <div class="baby-gif-card">
        <div class="stat-label">Baby Vibes 👶</div>
        <img src="/assets/baby-gifs/${randomGif}" alt="Baby" class="baby-gif" loading="lazy" />
      </div>
    </div>

    <!-- Nicknames (EXACTLY 9 - 3x3 grid) -->
    <div class="section" style="padding: 16px 24px;">
      <h2 class="section-title" style="margin-bottom: 6px;">
        <div class="section-icon icon-1">
          <svg viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
        </div>
        Nicknames
      </h2>
      <div class="chip-list">
${nameData.nicknames.slice(0, 9).map(nick => `        <div class="chip">${nick}</div>`).join('\n')}
      </div>
    </div>

    <!-- Rest of sections remain the same as Giana's profile -->
    ${generateRestOfSections(nameData)}
  </div>
</body>
</html>`;

  return html;
}

function generateRestOfSections(data) {
  // This function would contain all the other sections
  // For now, returning a placeholder
  return `<!-- Add remaining sections here -->`;
}

module.exports = { buildV4Profile };
