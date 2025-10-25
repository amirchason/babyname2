/**
 * 🎨 PROFILE TEMPLATE 2 (ULTRA-COMPACT + BIGGER FONTS)
 *
 * Optimized version with:
 * - Boxes design kept (colorful backgrounds)
 * - 90% tighter spacing between sections (40% more reduction)
 * - 15% bigger fonts throughout
 *
 * Features:
 * - Hero section with floating particles
 * - Stats grid (Meaning + Gender)
 * - Nicknames (9-9-9 format)
 * - Cultural significance
 * - Historical figures (5+)
 * - Religious significance (conditional)
 * - Pop culture (movies, songs, famous people)
 * - Quotes (famous quotes + character quotes)
 * - Personality & symbolism
 * - Variations & similar names (9-9-9 format)
 * - Gender-adaptive theming
 * - V4 enrichment badge
 *
 * Last Updated: 2025-10-24
 */

/**
 * Generate a complete name profile HTML page
 *
 * @param {Object} nameData - Enriched name data from v4 enrichment
 * @param {Object} options - Configuration options
 * @param {string} options.theme - Color theme: 'auto' (gender-based), 'pink', 'blue'
 * @returns {string} Complete HTML document
 */
function generateNameProfile(nameData, options = {}) {
  const { theme = 'auto' } = options;

  // Determine color theme based on gender or override
  const isFemale = theme === 'auto'
    ? nameData.gender === 'female'
    : theme === 'pink';

  // Theme colors
  const colors = isFemale ? {
    gradient: 'linear-gradient(135deg, #fce7f3 0%, #fbcfe8 50%, #f9a8d4 100%)',
    hero: 'linear-gradient(135deg, #ec4899 0%, #f472b6 100%)',
    particle: 'rgba(236, 72, 153, 0.3)',
    chipBg: 'linear-gradient(135deg, #fce7f3 0%, #fbcfe8 100%)',
    chipColor: '#be185d',
    histBg: 'linear-gradient(135deg, #fef3f2 0%, #fee2e2 100%)',
    histBorder: '#ec4899',
    heroShadow: 'rgba(236, 72, 153, 0.3)'
  } : {
    gradient: 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 50%, #93c5fd 100%)',
    hero: 'linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%)',
    particle: 'rgba(59, 130, 246, 0.3)',
    chipBg: 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)',
    chipColor: '#1e40af',
    histBg: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
    histBorder: '#3b82f6',
    heroShadow: 'rgba(59, 130, 246, 0.3)'
  };

  return `<!DOCTYPE html>
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
      background: ${colors.gradient};
      min-height: 100vh;
      padding: 8px;
      position: relative;
      overflow-x: hidden;
    }

    /* Floating particles */
    .particle {
      position: fixed;
      width: 8px;
      height: 8px;
      background: ${colors.particle};
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
      background: ${colors.hero};
      border-radius: 24px;
      padding: 20px 16px;
      text-align: center;
      color: white;
      box-shadow: 0 20px 60px ${colors.heroShadow};
      margin-bottom: 12px;
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
      gap: 6px;
      margin-bottom: 12px;
    }

    .stat-card {
      background: white;
      border-radius: 16px;
      padding: 12px;
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
      margin-bottom: 4px;
      font-weight: 500;
    }

    .stat-value {
      font-size: 20px;
      font-weight: 700;
      color: #1e293b;
    }

    .section {
      background: white;
      border-radius: 20px;
      padding: 16px;
      margin-bottom: 12px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.08);
    }

    .section-title {
      font-size: 20px;
      font-weight: 700;
      color: #1e293b;
      margin-bottom: 8px;
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
      font-size: 17px;
      line-height: 1.7;
      color: #475569;
    }

    .chip-list {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 4px;
      margin-top: 6px;
    }

    .chip {
      background: ${colors.chipBg};
      color: ${colors.chipColor};
      padding: 6px 12px;
      border-radius: 12px;
      font-size: 14px;
      font-weight: 600;
      text-align: center;
      transition: all 0.2s;
      cursor: default;
    }

    .chip:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px ${colors.particle};
    }

    .divider {
      height: 1px;
      background: linear-gradient(90deg, transparent 0%, #e2e8f0 50%, transparent 100%);
      margin: 20px 0;
    }

    /* Historical Figures Section */
    .hist-grid {
      display: grid;
      gap: 4px;
      margin-top: 8px;
    }

    .hist-card {
      background: ${colors.histBg};
      border-radius: 16px;
      padding: 12px;
      border-left: 4px solid ${colors.histBorder};
      transition: all 0.3s;
    }

    .hist-card:hover {
      transform: translateX(4px);
      box-shadow: 0 8px 24px ${colors.particle};
    }

    .hist-name {
      font-size: 21px;
      font-weight: 700;
      color: #1e293b;
      margin-bottom: 4px;
    }

    .hist-years-cat {
      display: flex;
      gap: 6px;
      margin-bottom: 6px;
      flex-wrap: wrap;
    }

    .hist-years {
      background: ${colors.chipBg};
      color: ${colors.chipColor};
      padding: 4px 12px;
      border-radius: 8px;
      font-size: 15px;
      font-weight: 600;
    }

    .hist-category {
      background: ${colors.chipBg};
      color: ${colors.chipColor};
      padding: 4px 12px;
      border-radius: 8px;
      font-size: 15px;
      font-weight: 600;
      opacity: 0.8;
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
      font-size: 16px;
      line-height: 1.6;
    }

    .hist-achievements li::before {
      content: '✓';
      position: absolute;
      left: 0;
      color: ${colors.histBorder};
      font-weight: 700;
    }

    .hist-significance {
      margin-top: 12px;
      padding-top: 12px;
      border-top: 1px solid ${colors.chipBg};
      font-size: 16px;
      line-height: 1.6;
      color: #64748b;
      font-style: italic;
    }

    .hist-significance strong {
      color: ${colors.histBorder};
      font-style: normal;
    }

    .hist-works {
      margin-top: 10px;
      font-size: 15px;
      color: #64748b;
    }

    .hist-works strong {
      color: #475569;
    }

    /* Pop Culture Cards */
    .pop-card {
      background: linear-gradient(135deg, #faf5ff 0%, #f3e8ff 100%);
      border-radius: 12px;
      padding: 10px;
      margin-bottom: 3px;
      border-left: 3px solid #8b5cf6;
    }

    .pop-card:last-child {
      margin-bottom: 0;
    }

    .pop-title {
      font-size: 18px;
      font-weight: 700;
      color: #1e293b;
      margin-bottom: 3px;
    }

    .pop-meta {
      font-size: 15px;
      color: #64748b;
      margin-bottom: 4px;
    }

    .pop-link {
      display: inline-block;
      color: #8b5cf6;
      text-decoration: none;
      font-size: 16px;
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
      font-size: 21px;
      font-weight: 700;
      color: #92400e;
      margin-bottom: 12px;
    }

    .religious-text {
      font-size: 16px;
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
      font-size: 16px;
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
      font-size: 18px;
      line-height: 1.7;
      color: #064e3b;
      margin-bottom: 10px;
    }

    .quote-author {
      font-size: 16px;
      font-weight: 600;
      color: #065f46;
      font-style: normal;
    }

    .quote-context {
      font-size: 15px;
      color: #047857;
      margin-top: 4px;
    }

    /* Fun Fact */
    .fun-fact {
      background: ${colors.chipBg};
      border-radius: 12px;
      padding: 16px;
      margin-top: 12px;
      border-left: 4px solid ${colors.histBorder};
    }

    .fun-fact-text {
      font-size: 17px;
      line-height: 1.6;
      color: ${colors.chipColor};
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

    <!-- Cultural Significance -->
    <div class="section">
      <h2 class="section-title">
        <div class="section-icon icon-1">
          <svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>
        </div>
        Cultural Significance
      </h2>
      <p class="section-text">${nameData.culturalSignificance}</p>

      <div class="divider"></div>

      <p class="section-text">${nameData.modernContext}</p>

      <div class="divider"></div>

      <p class="section-text">${nameData.literaryReferences}</p>
    </div>

    <!-- Historical Figures -->
    <div class="section">
      <h2 class="section-title">
        <div class="section-icon icon-2">
          <svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg>
        </div>
        Historical Figures
      </h2>
      <div class="hist-grid">
${nameData.historicFigures.map(figure => `        <div class="hist-card">
          <div class="hist-name">${figure.fullName}</div>
          <div class="hist-years-cat">
            <div class="hist-years">${figure.years}</div>
            <div class="hist-category">${figure.category}</div>
          </div>
          <ul class="hist-achievements">
${figure.achievements.map(ach => `            <li>${ach}</li>`).join('\n')}
          </ul>
          <div class="hist-significance">
            <strong>Significance:</strong> ${figure.significance}
          </div>
${figure.notableWorks && figure.notableWorks.length > 0 ? `          <div class="hist-works">
            <strong>Notable Works:</strong> ${figure.notableWorks.join(', ')}
          </div>` : ''}
        </div>`).join('\n')}
      </div>
    </div>

    <!-- Religious Significance -->
${nameData.religiousSignificance && nameData.religiousSignificance.hasSignificance ? `    <div class="section">
      <h2 class="section-title">
        <div class="section-icon icon-3">
          <svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/></svg>
        </div>
        Religious Significance
      </h2>
      <div class="religious-box">
        <div class="religious-character">${nameData.religiousSignificance.character}</div>
        <p class="religious-text"><strong>Religions:</strong> ${nameData.religiousSignificance.religions.join(', ')}</p>
        <p class="religious-text">${nameData.religiousSignificance.significance}</p>
        <div class="religious-stories">
          <strong>Key Stories:</strong>
          <ul>
${nameData.religiousSignificance.keyStories.map(story => `            <li>${story}</li>`).join('\n')}
          </ul>
        </div>
        <p class="religious-text" style="margin-top: 12px;"><strong>Spiritual Meaning:</strong> ${nameData.religiousSignificance.spiritualMeaning}</p>
      </div>
    </div>
` : ''}
    <!-- Movies & Shows -->
${nameData.moviesAndShows && nameData.moviesAndShows.length > 0 ? `    <div class="section">
      <h2 class="section-title">
        <div class="section-icon icon-4">
          <svg viewBox="0 0 24 24"><path d="M18 3v2h-2V3H8v2H6V3H4v18h2v-2h2v2h8v-2h2v2h2V3h-2zM8 17H6v-2h2v2zm0-4H6v-2h2v2zm0-4H6V7h2v2zm10 8h-2v-2h2v2zm0-4h-2v-2h2v2zm0-4h-2V7h2v2z"/></svg>
        </div>
        In Movies & TV
      </h2>
${nameData.moviesAndShows.map(media => `      <div class="pop-card">
        <div class="pop-title">${media.title} (${media.year})</div>
        <div class="pop-meta">${media.type} • ${media.genre}</div>
        <p class="section-text" style="margin-top: 8px;"><strong>${media.characterName}:</strong> ${media.characterDescription}</p>
        <a href="${media.imdbUrl}" target="_blank" class="pop-link">View on IMDb →</a>
      </div>`).join('\n')}
    </div>
` : ''}
    <!-- Songs -->
${nameData.songs && nameData.songs.length > 0 ? `    <div class="section">
      <h2 class="section-title">
        <div class="section-icon icon-5">
          <svg viewBox="0 0 24 24"><path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/></svg>
        </div>
        In Music
      </h2>
${nameData.songs.map(song => `      <div class="pop-card">
        <div class="pop-title">${song.title}</div>
        <div class="pop-meta">${song.artist} • ${song.year}</div>
        <p class="section-text" style="margin-top: 8px;">${song.quote}</p>
        <a href="${song.youtubeSearchUrl}" target="_blank" class="pop-link">Listen on YouTube →</a>
      </div>`).join('\n')}
    </div>
` : ''}
    <!-- Famous People -->
${nameData.famousPeople && nameData.famousPeople.length > 0 ? `    <div class="section">
      <h2 class="section-title">
        <div class="section-icon icon-6">
          <svg viewBox="0 0 24 24"><path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/></svg>
        </div>
        ${nameData.name} in Popular Culture
      </h2>
${nameData.famousPeople.map(person => `      <div class="pop-card">
        <div class="pop-title">${person.name}</div>
        <div class="pop-meta">${person.profession}</div>
        <p class="section-text" style="margin-top: 8px;"><strong>Known for:</strong> ${person.knownFor.join(', ')}</p>
        <p class="section-text" style="margin-top: 6px;"><strong>Awards:</strong> ${person.awards}</p>
        <a href="${person.imdbUrl}" target="_blank" class="pop-link">View Profile →</a>
      </div>`).join('\n')}
    </div>
` : ''}
    <!-- Famous Quotes -->
${nameData.famousQuotes && nameData.famousQuotes.length > 0 ? `    <div class="section">
      <h2 class="section-title">
        <div class="section-icon icon-8">
          <svg viewBox="0 0 24 24"><path d="M6 17h3l2-4V7H5v6h3zm8 0h3l2-4V7h-6v6h3z"/></svg>
        </div>
        Famous Quotes
      </h2>
${nameData.famousQuotes.map(q => `      <div class="quote-box">
        <p class="quote-text">"${q.quote}"</p>
        <p class="quote-author">— ${q.person}</p>
        <p class="quote-context">${q.context}</p>
      </div>`).join('\n')}
    </div>
` : ''}
    <!-- Character Quotes -->
${nameData.characterQuotes && nameData.characterQuotes.length > 0 ? `    <div class="section">
      <h2 class="section-title">
        <div class="section-icon icon-9">
          <svg viewBox="0 0 24 24"><path d="M21 3H3c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H3V5h18v14zM11 15h2v2h-2zm0-8h2v6h-2z"/></svg>
        </div>
        Character Quotes
      </h2>
${nameData.characterQuotes.map(cq => `      <div class="quote-box">
        <p class="quote-text">"${cq.quoteSummary}"</p>
        <p class="quote-author">— ${cq.character}, ${cq.source}</p>
        <p class="quote-context">${cq.context}</p>
      </div>`).join('\n')}
    </div>
` : ''}
    <!-- Personality -->
    <div class="section">
      <h2 class="section-title">
        <div class="section-icon icon-10">
          <svg viewBox="0 0 24 24"><path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z"/></svg>
        </div>
        Personality & Symbolism
      </h2>
      <p class="section-text"><strong>Personality:</strong> ${nameData.personality}</p>
      <div class="divider"></div>
      <p class="section-text"><strong>Symbolism:</strong> ${nameData.symbolism}</p>

      ${nameData.funFact ? `<div class="fun-fact">
        <span class="fun-fact-text">${nameData.funFact}</span>
      </div>` : ''}
    </div>

    <!-- Variations (EXACTLY 9 - 3x3 grid) -->
    <div class="section" style="padding: 16px 24px;">
      <h2 class="section-title" style="margin-bottom: 6px;">
        <div class="section-icon icon-3">
          <svg viewBox="0 0 24 24"><path d="M12 2l-5.5 9h11z M12 22l5.5-9h-11z"/></svg>
        </div>
        Variations
      </h2>
      <div class="chip-list">
${nameData.variations.filter((v, i, arr) => arr.indexOf(v) === i).slice(0, 9).map(v => `        <div class="chip">${v}</div>`).join('\n')}
      </div>
    </div>

    <div class="divider"></div>

    <!-- Similar Names (EXACTLY 9 - 3x3 grid) -->
    <div class="section" style="padding: 16px 24px;">
      <h2 class="section-title" style="margin-bottom: 6px;">
        <div class="section-icon icon-7">
          <svg viewBox="0 0 24 24"><path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/></svg>
        </div>
        Similar Names
      </h2>
      <div class="chip-list">
${nameData.similarNames.filter((v, i, arr) => arr.indexOf(v) === i).slice(0, 9).map(n => `        <div class="chip">${n}</div>`).join('\n')}
      </div>
    </div>

  </div>
</body>
</html>`;
}

module.exports = { generateNameProfile };
