#!/usr/bin/env node

/**
 * V13 HTML GENERATOR - Display all super enriched data
 */

const fs = require('fs');
const path = require('path');

const nameLower = process.argv[2];

if (!nameLower) {
  console.error('Usage: node generate-v13-html.js <name>');
  process.exit(1);
}

const nameCapitalized = nameLower.charAt(0).toUpperCase() + nameLower.slice(1).toLowerCase();

const v13Path = path.join(__dirname, '..', 'public', 'data', 'enriched', `${nameLower}-v13.json`);

if (!fs.existsSync(v13Path)) {
  console.error(`❌ V13 data not found: ${v13Path}`);
  console.error(`   Run: node scripts/generate-v13-super-enriched.js ${nameLower}`);
  process.exit(1);
}

const data = JSON.parse(fs.readFileSync(v13Path, 'utf-8'));

const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${nameCapitalized} - V13 Super Enriched Profile | SoulSeed</title>
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
      max-width: 1200px;
      margin: 0 auto;
      background: white;
      border-radius: 20px;
      box-shadow: 0 10px 50px rgba(0,0,0,0.08);
      overflow: hidden;
    }

    /* Hero Section */
    .hero {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%);
      color: white;
      padding: 60px 40px;
      text-align: center;
      position: relative;
    }

    .hero::before {
      content: '🌟 V13 SUPER ENRICHED 🌟';
      position: absolute;
      top: 20px;
      left: 50%;
      transform: translateX(-50%);
      font-size: 0.9em;
      font-weight: 600;
      background: rgba(255,255,255,0.3);
      padding: 5px 20px;
      border-radius: 20px;
      backdrop-filter: blur(10px);
    }

    .hero h1 {
      font-size: 5em;
      font-weight: 700;
      margin-bottom: 10px;
      text-shadow: 2px 2px 10px rgba(0,0,0,0.2);
    }

    .hero .meaning {
      font-size: 1.8em;
      font-style: italic;
      margin-bottom: 20px;
      opacity: 0.95;
    }

    .hero .meta {
      display: flex;
      justify-content: center;
      gap: 20px;
      flex-wrap: wrap;
      font-size: 1.1em;
      margin-top: 20px;
    }

    .hero .meta-item {
      background: rgba(255,255,255,0.25);
      padding: 10px 25px;
      border-radius: 25px;
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255,255,255,0.3);
    }

    /* Version Info Banner */
    .version-banner {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 20px 40px;
      text-align: center;
      font-size: 1.1em;
    }

    .version-banner .versions {
      display: flex;
      justify-content: center;
      gap: 15px;
      margin-top: 10px;
      flex-wrap: wrap;
    }

    .version-badge {
      background: rgba(255,255,255,0.2);
      padding: 5px 15px;
      border-radius: 15px;
      font-weight: 600;
      border: 1px solid rgba(255,255,255,0.3);
    }

    /* Content Tabs */
    .tabs {
      display: flex;
      background: #f8f9fa;
      border-bottom: 2px solid #e0e0e0;
      overflow-x: auto;
    }

    .tab {
      flex: 1;
      padding: 20px;
      cursor: pointer;
      text-align: center;
      font-weight: 600;
      color: #666;
      border-bottom: 3px solid transparent;
      transition: all 0.3s ease;
      white-space: nowrap;
    }

    .tab:hover {
      background: white;
      color: #764ba2;
    }

    .tab.active {
      background: white;
      color: #764ba2;
      border-bottom-color: #764ba2;
    }

    .tab-content {
      display: none;
      padding: 40px;
      animation: fadeIn 0.3s ease;
    }

    .tab-content.active {
      display: block;
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }

    /* Sections */
    h2 {
      color: #764ba2;
      font-size: 2em;
      margin-bottom: 20px;
      border-bottom: 3px solid #f093fb;
      padding-bottom: 10px;
    }

    h3 {
      color: #667eea;
      font-size: 1.5em;
      margin-top: 30px;
      margin-bottom: 15px;
    }

    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 20px;
      margin: 20px 0;
    }

    .card {
      background: #f8f9fa;
      padding: 20px;
      border-radius: 15px;
      border-left: 4px solid #764ba2;
    }

    .card h4 {
      color: #764ba2;
      margin-bottom: 10px;
    }

    table {
      width: 100%;
      border-collapse: collapse;
      margin: 20px 0;
      box-shadow: 0 2px 10px rgba(0,0,0,0.05);
    }

    th {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 15px;
      text-align: left;
      font-weight: 600;
    }

    td {
      padding: 12px 15px;
      border-bottom: 1px solid #f0f0f0;
    }

    tr:hover {
      background: #FFF9FC;
    }

    .blog-section {
      background: #f8f9fa;
      padding: 30px;
      border-radius: 15px;
      margin: 20px 0;
      border-left: 5px solid #764ba2;
    }

    .badge {
      display: inline-block;
      padding: 5px 12px;
      border-radius: 15px;
      font-size: 0.85em;
      font-weight: 600;
      margin: 5px 5px 5px 0;
    }

    .badge-v8 { background: #FFB74D; color: white; }
    .badge-v10 { background: #4CAF50; color: white; }
    .badge-v11 { background: #2196F3; color: white; }

    ul {
      margin: 15px 0;
      padding-left: 30px;
    }

    li {
      margin: 8px 0;
    }
  </style>
</head>
<body>
  <div class="container">
    <!-- Hero -->
    <div class="hero">
      <h1>${nameCapitalized}</h1>
      <p class="meaning">${data.meaning}</p>
      <div class="meta">
        <span class="meta-item">🌍 ${data.origin}</span>
        <span class="meta-item">⚧ ${data.gender === 'male' ? '♂️ Male' : data.gender === 'female' ? '♀️ Female' : '⚧ Unisex'} ${data.genderDistribution ? `(${data.genderDistribution.male}% / ${data.genderDistribution.female}%)` : ''}</span>
        ${data.ranking ? `<span class="meta-item">📊 Rank #${data.ranking.current}</span>` : ''}
        <span class="meta-item">📦 ${data.versionsIncluded.length} Versions Merged</span>
      </div>
    </div>

    <!-- Version Banner -->
    <div class="version-banner">
      <strong>✨ This profile combines ALL enrichment versions ✨</strong>
      <div class="versions">
        ${data.versionsIncluded.map(v => `<span class="version-badge">${v.toUpperCase()}</span>`).join('')}
      </div>
    </div>

    <!-- Tabs -->
    <div class="tabs">
      <div class="tab active" onclick="showTab('overview')">📖 Overview</div>
      <div class="tab" onclick="showTab('people')">👥 Famous People</div>
      <div class="tab" onclick="showTab('culture')">🎬 Pop Culture</div>
      <div class="tab" onclick="showTab('spiritual')">🌙 Spiritual & Celestial</div>
      <div class="tab" onclick="showTab('blog')">📝 Blog (V11)</div>
      <div class="tab" onclick="showTab('bonus')">🎁 Bonus Data (V8)</div>
    </div>

    <!-- Tab Contents -->
    <div id="overview" class="tab-content active">
      <h2>📖 Complete Overview</h2>

      <div class="grid">
        <div class="card">
          <h4>Cultural Significance</h4>
          <p>${data.culturalSignificance}</p>
        </div>
        <div class="card">
          <h4>Modern Context</h4>
          <p>${data.modernContext}</p>
        </div>
      </div>

      <div class="grid">
        <div class="card">
          <h4>Personality Traits</h4>
          <p>${data.personality}</p>
        </div>
        <div class="card">
          <h4>Symbolism</h4>
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
            ${data.nicknames ? data.nicknames.map(n => `<li>${n}</li>`).join('') : '<li>None listed</li>'}
          </ul>
        </div>
      </div>

      <h3>🎉 Fun Fact</h3>
      <div class="card">
        <p><strong>${data.funFact}</strong></p>
      </div>
    </div>

    <!-- People Tab -->
    <div id="people" class="tab-content">
      <h2>👥 Famous People & Athletes</h2>

      ${data.famousPeople && data.famousPeople.length > 0 ? `
      <h3>🌟 Famous People</h3>
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
      ` : '<p>No famous people data available.</p>'}

      ${data.famousAthletes && data.famousAthletes.length > 0 ? `
      <h3>🏆 Famous Athletes</h3>
      <table>
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
      </table>
      ` : '<p>No athlete data available.</p>'}

      ${data.historicFigures && data.historicFigures.length > 0 ? `
      <h3>📜 Historic Figures</h3>
      ${data.historicFigures.map(h => `
      <div class="card">
        <h4>${h.fullName} (${h.years})</h4>
        <p><strong>${h.category}</strong></p>
        <p>${h.significance}</p>
        ${h.achievements ? `<ul>${h.achievements.map(a => `<li>${a}</li>`).join('')}</ul>` : ''}
      </div>
      `).join('')}
      ` : ''}
    </div>

    <!-- Culture Tab -->
    <div id="culture" class="tab-content">
      <h2>🎬 Pop Culture References</h2>

      ${data.moviesAndShows && data.moviesAndShows.length > 0 ? `
      <h3>🎬 Movies & TV Shows</h3>
      <table>
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
      </table>
      ` : '<p>No movies/shows data available.</p>'}

      ${data.songsAboutName && data.songsAboutName.length > 0 ? `
      <h3>🎵 Songs</h3>
      <table>
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
      </table>
      ` : '<p>No songs data available.</p>'}

      ${data.booksWithCharacter && data.booksWithCharacter.length > 0 ? `
      <h3>📚 Books</h3>
      ${data.booksWithCharacter.map(b => `
      <div class="card">
        <h4>${b.title} (${b.yearPublished})</h4>
        <p><strong>Author:</strong> ${b.author}</p>
        <p><strong>Character:</strong> ${b.characterName}</p>
        <p><strong>Role:</strong> ${b.characterRole || 'N/A'}</p>
      </div>
      `).join('')}
      ` : ''}
    </div>

    <!-- Spiritual Tab -->
    <div id="spiritual" class="tab-content">
      <h2>🌙 Spiritual & Celestial Data</h2>

      ${data.religiousSignificance && data.religiousSignificance.hasSignificance ? `
      <h3>✝️ Religious Significance</h3>
      <div class="card">
        <p><strong>Religions:</strong> ${data.religiousSignificance.religions.join(', ')}</p>
        <p><strong>Character:</strong> ${data.religiousSignificance.character}</p>
        <p><strong>Significance:</strong> ${data.religiousSignificance.significance}</p>
        ${data.religiousSignificance.keyStories ? `
        <p><strong>Key Stories:</strong></p>
        <ul>
          ${data.religiousSignificance.keyStories.map(s => `<li>${s}</li>`).join('')}
        </ul>
        ` : ''}
      </div>
      ` : ''}

      ${data.celestialData ? `
      <h3>✨ Celestial & Numerology</h3>
      <div class="grid">
        <div class="card">
          <h4>🔢 Lucky Number</h4>
          <p style="font-size: 2em; font-weight: bold; color: #764ba2;">${data.celestialData.luckyNumber}</p>
        </div>
        <div class="card">
          <h4>🎨 Lucky Color</h4>
          <p><span style="display: inline-block; width: 40px; height: 40px; background: ${data.celestialData.luckyColor.hex}; border-radius: 5px; vertical-align: middle;"></span> ${data.celestialData.luckyColor.name}</p>
        </div>
        <div class="card">
          <h4>💎 Lucky Gemstone</h4>
          <p style="font-size: 1.3em;">${data.celestialData.luckyGemstone}</p>
        </div>
        <div class="card">
          <h4>📅 Lucky Day</h4>
          <p style="font-size: 1.3em;">${data.celestialData.luckyDay}</p>
        </div>
        <div class="card">
          <h4>🌙 Moon Phase</h4>
          <p>${data.celestialData.moonPhase}</p>
          <p><small>${data.celestialData.moonPhaseDescription}</small></p>
        </div>
        <div class="card">
          <h4>🌟 Celestial Archetype</h4>
          <p><strong>${data.celestialData.celestialArchetype}</strong></p>
          <p><small>${data.celestialData.celestialArchetypeDescription}</small></p>
        </div>
      </div>

      <div class="card">
        <h4>♈ Compatible Signs</h4>
        <p>${data.celestialData.compatibleSigns.join(', ')}</p>
        <p><small>${data.celestialData.compatibleSignsDescription}</small></p>
      </div>

      <div class="card">
        <h4>🎯 Karmic Lessons</h4>
        <p>${data.celestialData.karmicLessons}</p>
      </div>
      ` : '<p>No celestial data available.</p>'}
    </div>

    <!-- Blog Tab -->
    <div id="blog" class="tab-content">
      <h2>📝 Blog Content (V11)</h2>
      <span class="badge badge-v11">V11 Writer-Driven Narrative</span>

      ${data.v11BlogContent ? `
      ${data.v11WriterName ? `
      <div style="text-align: center; padding: 20px; background: #f8f9fa; border-radius: 15px; margin: 20px 0;">
        <h3>Written by ${data.v11WriterName}</h3>
        <p style="color: #666;">${data.v11WriterTitle}</p>
      </div>
      ` : ''}

      ${Object.entries(data.v11BlogContent)
        .filter(([key]) => !key.includes('writer'))
        .map(([section, content]) => `
        <div class="blog-section">
          ${content}
        </div>
      `).join('')}
      ` : '<p>No V11 blog content available.</p>'}
    </div>

    <!-- Bonus Tab -->
    <div id="bonus" class="tab-content">
      <h2>🎁 Bonus Data from V8</h2>
      <span class="badge badge-v8">V8 Exclusive Fields</span>
      <p style="margin: 20px 0;">These fields were removed in V10 but are preserved here in V13!</p>

      ${data.categories ? `
      <div class="card">
        <h4>🏷️ Categories</h4>
        <div>
          ${Array.isArray(data.categories) ? data.categories.map(c => `<span class="badge badge-v8">${c}</span>`).join('') : data.categories}
        </div>
      </div>
      ` : ''}

      ${data.syllables ? `
      <div class="card">
        <h4>🔤 Syllables</h4>
        <p style="font-size: 2em; font-weight: bold;">${data.syllables}</p>
      </div>
      ` : ''}

      ${data.translations ? `
      <div class="card">
        <h4>🌍 Translations</h4>
        <ul>
          ${Object.entries(data.translations).map(([lang, trans]) => `<li><strong>${lang}:</strong> ${trans}</li>`).join('')}
        </ul>
      </div>
      ` : ''}

      ${data.celebrityBabies ? `
      <div class="card">
        <h4>👶 Celebrity Babies</h4>
        <ul>
          ${data.celebrityBabies.map(c => `<li>${c}</li>`).join('')}
        </ul>
      </div>
      ` : ''}

      ${data.inspiration ? `
      <div class="card">
        <h4>💡 Naming Inspiration</h4>
        <p>${data.inspiration}</p>
      </div>
      ` : ''}

      ${!data.categories && !data.syllables && !data.translations && !data.celebrityBabies && !data.inspiration ? `
      <p>No V8 bonus data available for this name.</p>
      ` : ''}
    </div>
  </div>

  <script>
    function showTab(tabName) {
      // Hide all tabs
      document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
      });
      document.querySelectorAll('.tab').forEach(tab => {
        tab.classList.remove('active');
      });

      // Show selected tab
      document.getElementById(tabName).classList.add('active');
      event.target.classList.add('active');
    }
  </script>
</body>
</html>`;

const outputPath = path.join(__dirname, '..', 'public', 'profiles', 'v13', `${nameLower}.html`);
const outputDir = path.dirname(outputPath);

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

fs.writeFileSync(outputPath, html);

console.log(`\n✅ V13 HTML saved: ${outputPath}\n`);
console.log(`🌐 View at: http://localhost:8888/${nameLower}.html\n`);
