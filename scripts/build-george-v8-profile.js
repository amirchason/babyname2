/**
 * Build Alex V8 Profile HTML
 */

import fs from 'fs';
import pkg from './profile-templates/profiletemp5.js';
const { generateNameProfile } = pkg;

console.log('🚀 Building Alex V8 Profile...\n');

// Load V8 data
console.log('📂 Loading V8 data...');
const v8Data = JSON.parse(fs.readFileSync('./public/data/enriched/george-v8.json', 'utf-8'));
console.log(`✅ Loaded V8 data for: ${v8Data.name}`);

// Generate base profile
console.log('\n🎨 Generating base profile from V8 template...');
const baseHTML = generateNameProfile(v8Data);
console.log('✅ Base HTML generated');

// V8 post-processing: inject V8 features
console.log('\n✨ Adding V8 enhancements...');

function enhanceProfileWithV8Features(html, v8Data) {
  let enhanced = html;

  // 1. Add V8 badge
  const v8Badge = `
    <div style="display: inline-block; padding: 6px 12px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border-radius: 12px; font-size: 11px; font-weight: 700; letter-spacing: 0.5px; margin-left: 12px; box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);">
      V8 COMPLETE
    </div>
`;

  enhanced = enhanced.replace(
    /(<div class="v4-badge">)/,
    `$1${v8Badge}`
  );

  // 2. Inject category tags
  if (v8Data.categories && v8Data.categories.length > 0) {
    console.log(`   🏷️  Categories: ${v8Data.categories.length} tags`);
    const categoryTagsHTML = v8Data.categories.map(cat => {
      const confidence = Math.round(cat.confidence * 100);
      return `
        <span class="category-tag category-${cat.tag.toLowerCase()}"
              style="display: inline-block; padding: 6px 14px; margin: 4px; background: linear-gradient(135deg, #E3F2FD 0%, #BBDEFB 100%); border-radius: 16px; font-size: 13px; font-weight: 600; color: #1565C0; cursor: help;"
              title="${cat.reason} (Confidence: ${confidence}%)"
              onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 4px 8px rgba(0,0,0,0.15)'"
              onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='none'">
          ${cat.tag}
        </span>`;
    }).join('');

    enhanced = enhanced.replace(
      /(<div class="v4-badge">.*?<\/div>)/s,
      `$1\n${categoryTagsHTML}`
    );
  }

  // 3. Inject syllables
  if (v8Data.syllables) {
    console.log(`   🔢 Syllables: ${v8Data.syllables.count} (${v8Data.syllables.breakdown})`);
    const plural = v8Data.syllables.count > 1 ? 's' : '';
    const syllableHTML = `
  <p class="syllable-info" style="color: #64748b; font-size: 15px; margin: 8px 0 0 0; text-align: center;">
    ${v8Data.syllables.count} Syllable${plural}: <span style="color: #94a3b8;">${v8Data.syllables.breakdown}</span>
  </p>
`;

    enhanced = enhanced.replace(
      /(<p class="pronunciation">.*?<\/p>)/,
      `$1\n${syllableHTML}`
    );
  }

  // 4. Inject translations section
  if (v8Data.translations && v8Data.translations.length > 0) {
    console.log(`   🌍 Translations: ${v8Data.translations.length} languages`);

    const translationCards = v8Data.translations.map(trans => {
      const flagEmoji = {
        'Spanish': '🇪🇸',
        'Greek': '🇬🇷',
        'Arabic': '🇸🇦',
        'Chinese': '🇨🇳',
        'Russian': '🇷🇺',
        'Hebrew': '🇮🇱'
      }[trans.language] || '🌐';

      const dir = trans.rtl ? 'rtl' : 'ltr';

      return `          <div class="translation-card" style="background: linear-gradient(135deg, #F3E5F5 0%, #E1BEE7 100%); padding: 16px; border-radius: 12px; border-left: 4px solid #8E24AA;" dir="${dir}">
            <div style="font-size: 24px; margin-bottom: 8px;">${flagEmoji}</div>
            <div style="font-weight: 700; font-size: 18px; color: #4A148C; margin-bottom: 4px;">${trans.language}</div>
            <div style="font-size: 28px; font-weight: 600; color: #6A1B9A; margin: 12px 0;">${trans.scriptName}</div>
            <div style="font-size: 14px; color: #7B1FA2; margin-top: 8px;">${trans.pronunciation}</div>
            <div style="font-size: 12px; color: #8E24AA; margin-top: 6px; opacity: 0.9;">Script: ${trans.script}</div>
          </div>`;
    }).join('\n');

    const translationsSection = `
    <!-- Section 4.5: Name Around the World (V8) -->
    <div class="section">
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
      <div class="section-content" data-section="section_4_5_translations">
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 16px;">
${translationCards}
        </div>
      </div>
    </div>
`;

    enhanced = enhanced.replace(
      /(<!-- Section 5: Historical Figures -->)/,
      `${translationsSection}\n    $1`
    );
  }

  // 5. Add V8 CSS styles
  const v8CSS = `
    <style>
      /* V8 Category Tags */
      .category-tag {
        transition: all 0.2s ease;
      }

      .category-biblical { background: linear-gradient(135deg, #FFF3E0 0%, #FFE0B2 100%) !important; color: #E65100 !important; }
      .category-mythological { background: linear-gradient(135deg, #F3E5F5 0%, #E1BEE7 100%) !important; color: #6A1B9A !important; }
      .category-royal { background: linear-gradient(135deg, #FFF8E1 0%, #FFECB3 100%) !important; color: #F57F17 !important; }
      .category-literary { background: linear-gradient(135deg, #E8F5E9 0%, #C8E6C9 100%) !important; color: #2E7D32 !important; }
      .category-classic { background: linear-gradient(135deg, #E3F2FD 0%, #BBDEFB 100%) !important; color: #1565C0 !important; }
      .category-modern { background: linear-gradient(135deg, #FCE4EC 0%, #F8BBD0 100%) !important; color: #C2185B !important; }
      .category-vintage { background: linear-gradient(135deg, #FFF3E0 0%, #FFE0B2 100%) !important; color: #EF6C00 !important; }
      .category-timeless { background: linear-gradient(135deg, #F1F8E9 0%, #DCEDC8 100%) !important; color: #558B2F !important; }
      .category-nature { background: linear-gradient(135deg, #E0F2F1 0%, #B2DFDB 100%) !important; color: #00695C !important; }
      .category-celestial { background: linear-gradient(135deg, #E8EAF6 0%, #C5CAE9 100%) !important; color: #283593 !important; }
      .category-strong { background: linear-gradient(135deg, #EFEBE9 0%, #D7CCC8 100%) !important; color: #4E342E !important; }
      .category-unique { background: linear-gradient(135deg, #FFF9C4 0%, #FFF59D 100%) !important; color: #F57F17 !important; }
      .category-international { background: linear-gradient(135deg, #E1F5FE 0%, #B3E5FC 100%) !important; color: #0277BD !important; }
      .category-european { background: linear-gradient(135deg, #E8EAF6 0%, #C5CAE9 100%) !important; color: #3F51B5 !important; }

      /* V8 Translation Cards */
      .translation-card {
        transition: transform 0.2s ease, box-shadow 0.2s ease;
      }

      .translation-card:hover {
        transform: translateY(-4px);
        box-shadow: 0 8px 16px rgba(0,0,0,0.15);
      }
    </style>
`;

  enhanced = enhanced.replace(
    /(<\/head>)/,
    `${v8CSS}\n  $1`
  );

  return enhanced;
}

const finalHTML = enhanceProfileWithV8Features(baseHTML, v8Data);
console.log('✅ V8 features integrated');

// Save
const outputPath = './public/george-v8-profile.html';
fs.writeFileSync(outputPath, finalHTML);
console.log(`\n💾 Saved HTML to: ${outputPath}`);

console.log('\n✨ Alex V8 Profile Complete!');
console.log('   🌐 Open in browser to view');
