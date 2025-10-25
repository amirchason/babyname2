/**
 * Build Robinson V7 Profile
 * Generates HTML profile with V7 enhancements:
 * - Category tags in hero
 * - Syllables in pronunciation
 * - Translations section
 */

import fs from 'fs';
import pkg from './profile-templates/profiletemp5.js';
const { generateNameProfile } = pkg;

/**
 * Enhance V6 HTML with V7 features
 */
function enhanceProfileWithV7Features(htmlContent, v7Data) {
  let enhanced = htmlContent;

  // 1. Add Category Tags after gender badge in hero section
  if (v7Data.categories && v7Data.categories.length > 0) {
    const categoryTagsHTML = `
    <!-- V7: Category Tags -->
    <div class="category-tags" style="margin-top: 12px; display: flex; flex-wrap: wrap; gap: 8px; justify-content: center;">
      ${v7Data.categories.map(cat => `
        <span class="category-tag category-${cat.tag.toLowerCase()}"
              style="display: inline-block; padding: 6px 12px; border-radius: 16px; font-size: 13px; font-weight: 600; cursor: help; transition: transform 0.2s;"
              title="${cat.reason} (Confidence: ${Math.round(cat.confidence * 100)}%)"
              onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 4px 8px rgba(0,0,0,0.15)'"
              onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='none'">
          ${cat.tag}
        </span>
      `).join('')}
    </div>
    `;

    // Insert after v4-badge in hero section
    enhanced = enhanced.replace(
      /(<div class="v4-badge">.*?<\/div>)/s,
      `$1\n${categoryTagsHTML}`
    );
  }

  // 2. Add Syllables to pronunciation line in hero
  if (v7Data.syllables) {
    const syllableHTML = `
      <p class="syllable-info" style="color: #64748b; font-size: 15px; margin: 8px 0 0 0; text-align: center;">
        ${v7Data.syllables.count} Syllable${v7Data.syllables.count > 1 ? 's' : ''}: <span style="color: #94a3b8;">${v7Data.syllables.breakdown}</span>
      </p>
    `;

    // Find pronunciation <p> tag in hero and add syllables after it
    enhanced = enhanced.replace(
      /(<p class="pronunciation">.*?<\/p>)/,
      `$1\n${syllableHTML}`
    );
  }

  // 3. Add Translations Section (Section 4.5) before Historical Figures
  if (v7Data.translations && v7Data.translations.length > 0) {
    const translationsHTML = generateTranslationsSection(v7Data);

    // Insert before Section 5 (Historical Figures)
    enhanced = enhanced.replace(
      /(<!-- Section 5: Historical Figures -->)/,
      `${translationsHTML}\n\n    $1`
    );
  }

  // 4. Add V7 CSS for categories and translations
  const v7CSS = `
    <style>
    /* V7: Category Tags */
    .category-biblical { background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%); color: #1e40af; }
    .category-mythological { background: linear-gradient(135deg, #fae8ff 0%, #f5d0fe 100%); color: #86198f; }
    .category-royal { background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); color: #92400e; }
    .category-literary { background: linear-gradient(135deg, #ccfbf1 0%, #99f6e4 100%); color: #115e59; }
    .category-classic { background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); color: #92400e; }
    .category-modern { background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%); color: #065f46; }
    .category-vintage { background: linear-gradient(135deg, #fce7f3 0%, #fbcfe8 100%); color: #9f1239; }
    .category-timeless { background: linear-gradient(135deg, #fce7f3 0%, #fbcfe8 100%); color: #9f1239; }
    .category-nature { background: linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%); color: #166534; }
    .category-celestial { background: linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 100%); color: #4338ca; }
    .category-animal { background: linear-gradient(135deg, #fed7aa 0%, #fdba74 100%); color: #9a3412; }
    .category-strong { background: linear-gradient(135deg, #dfe4ea 0%, #c8d5e2 100%); color: #1e293b; }
    .category-soft { background: linear-gradient(135deg, #f3e8ff 0%, #e9d5ff 100%); color: #6b21a8; }
    .category-unique { background: linear-gradient(135deg, #ddd6fe 0%, #c4b5fd 100%); color: #5b21b6; }
    .category-international { background: linear-gradient(135deg, #cffafe 0%, #a5f3fc 100%); color: #155e75; }

    /* V7: Translations Grid */
    .translations-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
      gap: 16px;
      padding: 16px;
    }

    .translation-card {
      background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
      border: 2px solid #e2e8f0;
      border-radius: 12px;
      padding: 20px;
      text-align: center;
      transition: transform 0.2s, box-shadow 0.2s;
    }

    .translation-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 16px rgba(0,0,0,0.1);
    }

    .translation-flag {
      font-size: 48px;
      margin-bottom: 12px;
    }

    .translation-script {
      font-size: 28px;
      font-weight: 700;
      color: #1e293b;
      margin-bottom: 8px;
      font-family: system-ui, -apple-system, sans-serif;
    }

    .translation-language {
      font-size: 14px;
      font-weight: 600;
      color: #64748b;
      margin-bottom: 4px;
    }

    .translation-pronunciation {
      font-size: 13px;
      color: #94a3b8;
      font-style: italic;
    }
    </style>
  `;

  // Insert V7 CSS before </head>
  enhanced = enhanced.replace('</head>', `${v7CSS}\n</head>`);

  return enhanced;
}

/**
 * Generate Translations Section HTML
 */
function generateTranslationsSection(v7Data) {
  const flagEmojis = {
    'Spanish': '🇪🇸',
    'Greek': '🇬🇷',
    'Arabic': '🇸🇦',
    'Chinese': '🇨🇳',
    'Russian': '🇷🇺',
    'Hebrew': '🇮🇱'
  };

  return `
    <!-- Section 4.5: Name Around the World (V7 NEW) -->
    <div class="section" style="padding: 16px 24px;">
      <h2 class="section-title" onclick="toggleAccordion('section_4_5_translations')">
        <span class="section-number">4.5</span>
        <div class="section-icon" style="width: 48px; height: 48px; display: flex; align-items: center; justify-content: center; font-size: 32px;">🌍</div>
        Name Around the World
        <button class="accordion-btn" aria-label="Toggle section">
          <svg class="chevron rotated" viewBox="0 0 24 24">
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </button>
      </h2>

      <div class="section-content expanded" data-section="section_4_5_translations">
        <div class="translations-grid">
          ${v7Data.translations.map(trans => `
            <div class="translation-card">
              <div class="translation-flag">${flagEmojis[trans.language] || '🌐'}</div>
              <div class="translation-script" ${trans.rtl ? 'dir="rtl"' : ''}>
                ${trans.scriptName}
              </div>
              <div class="translation-language">${trans.language}</div>
              <div class="translation-pronunciation">${trans.pronunciation}</div>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  `;
}

/**
 * Main build function
 */
async function buildRobinsonV7() {
  console.log('🚀 Building Robinson V7 Profile...\n');

  // 1. Load V7 enriched data
  console.log('📂 Loading V7 data...');
  const v7DataPath = './public/data/enriched/robinson-v7.json';
  if (!fs.existsSync(v7DataPath)) {
    console.error(`❌ Error: ${v7DataPath} not found!`);
    console.log('   Run: node scripts/enrich-v7-enhanced.js robinson-v6.json');
    process.exit(1);
  }

  const v7Data = JSON.parse(fs.readFileSync(v7DataPath, 'utf-8'));
  console.log(`✅ Loaded V7 data for: ${v7Data.name}`);

  // 2. Generate base V6 HTML profile
  console.log('\n🎨 Generating base profile from V6 template...');
  const baseHTML = generateNameProfile(v7Data);
  console.log('✅ Base HTML generated');

  // 3. Enhance with V7 features
  console.log('\n✨ Adding V7 enhancements...');
  console.log(`   🏷️  Categories: ${v7Data.categories?.length || 0} tags`);
  console.log(`   🔢 Syllables: ${v7Data.syllables?.count} (${v7Data.syllables?.breakdown})`);
  console.log(`   🌍 Translations: ${v7Data.translations?.length || 0} languages`);

  const enhancedHTML = enhanceProfileWithV7Features(baseHTML, v7Data);
  console.log('✅ V7 features integrated');

  // 4. Save HTML profile
  const outputPath = './public/robinson-v7-profile.html';
  fs.writeFileSync(outputPath, enhancedHTML);
  console.log(`\n💾 Saved HTML to: ${outputPath}`);

  console.log('\n✨ Robinson V7 Profile Complete!');
  console.log('   🌐 Open in browser to view');

  return outputPath;
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  buildRobinsonV7().catch(console.error);
}

export { buildRobinsonV7 };
