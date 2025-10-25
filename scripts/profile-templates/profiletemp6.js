/**
 * 🎨 PROFILE TEMPLATE 5 (V5 ENRICHMENT - ENHANCED ASTROLOGY EDITION)
 *
 * Based on profiletemp3 with major enhancements:
 * - Removed sections 16 (Famous Name Constellation) and 18 (Name Strength Meter)
 * - Enhanced Section 15 (Celestial Harmony) with compact design
 * - Pastel icon backgrounds for Lucky Attributes (#F0E0FF, #FFE0EC, #E0F2FF, #E0FFF0)
 * - Added descriptive text to all Lucky Attributes
 * - NEW: Celestial Correspondences subsection (Moon Phase, Star Sign Compatibility, Cosmic Element)
 * - NEW: Astrological Profile subsection (Numerological Destiny, Celestial Archetype, Karmic Lessons, Soul Urge)
 * - Ultra-compact spacing (12px vertical gaps)
 * - 15% bigger fonts throughout
 * - Boxes design with colorful backgrounds
 * - Website color scheme: #D8B2F2, #FFB3D9, #B3D9FF (pastel lavender/pink/blue)
 *
 * ⭐ COMPLETE SECTION LIST (14 sections, ALL with accordions):
 * 1. Elaborated Meaning - Comprehensive etymology, history, cultural significance (EXPANDED by default for SEO) ✅
 * 2. Quick Stats - Meaning and gender cards ✅
 * 3. Name Variants - Nicknames, Variations, Similar Names (3 subsections in one accordion) ✅
 * 4. Cultural Significance - Cultural notes, modern context, literary references ✅
 * 5. Historical Figures - Expanded cards with achievements and significance ✅
 * 6. Religious Significance - Biblical/religious context (if applicable) ✅
 * 7. Movies & Shows - Pop culture appearances ✅
 * 8. Songs - Musical references ✅
 * 9. Famous People - Notable individuals with this name ✅
 * 10. Famous Quotes - Quotes from historical figures ✅
 * 11. Character Quotes - Quotes from fictional characters ✅
 * 12. Personality & Symbolism - Traits and symbolic meaning ✅
 * 13. Celestial Harmony - Enhanced astrology (elements, planetary ruler, lucky attributes with descriptions, celestial correspondences, astrological profile) ✅
 * 14. Historical Timeline - Interactive timeline with hover cards ✅
 *
 * ⭐ v5 Features Status (12 total):
 * 1. Historical Timeline Visualization ✅ IMPLEMENTED (Section 14)
 * 2. Name Personality DNA - Animated double helix with trait genes ❌ NOT IMPLEMENTED
 * 3. Famous Name Constellation ❌ REMOVED (redundant with Historical Timeline)
 * 4. Character Archetype Wheel - Pie chart of personality types ❌ NOT IMPLEMENTED
 * 5. Name Numerology Mandala - Sacred geometry based on calculations ❌ NOT IMPLEMENTED
 * 6. Name Strength Meter ❌ REMOVED (redundant with Personality section)
 * 7. Quote Gallery Carousel - Elegant quote slider ❌ NOT IMPLEMENTED
 * 8. Name Origins Journey - Etymology path visualization ❌ NOT IMPLEMENTED
 * 9. Name Achievement Badges - Gamified accomplishments ❌ NOT IMPLEMENTED
 * 10. Personality Word Cloud - Frequency-based word art ❌ NOT IMPLEMENTED
 * 11. Cultural Journey Map - Regional variation mapping ❌ NOT IMPLEMENTED
 * 12. Celestial Harmony (Enhanced Astrology) ✅ IMPLEMENTED (Section 13)
 *
 * Technical Features:
 * - Section numbering (1-14) for easy reference
 * - ALL sections have collapsible accordions with state memory (localStorage)
 * - Section 1 (Elaborated Meaning) EXPANDED by default for SEO
 * - Section 13 (Celestial Harmony) COLLAPSED by default (optional feature)
 * - Expanded historical figures (10-50 per name)
 * - V5 enrichment schema support
 * - Gender-adaptive theming
 * - All colors match website palette (#D8B2F2 lavender, #FFB3D9 pink, #B3D9FF blue)
 * - Compact spacing throughout for better mobile experience
 *
 * Created: 2025-10-24 (from profiletemp3)
 * Last Updated: 2025-10-24 (V5 template with enhanced astrology and celestial knowledge)
 *
 * 📋 V5 ENRICHMENT SCHEMA - ENHANCED CELESTIAL FIELDS:
 * For full functionality, the v5 enrichment should include:
 * - moonPhase: string (e.g., "Waxing Crescent", "Full Moon", "New Moon")
 * - starSignCompatibility: string[] (e.g., ["Aries", "Leo", "Sagittarius"])
 * - cosmicElement: string (e.g., "Ether (Spirit)", "Void", "Aether")
 * - numerologicalDestiny: number (1-9) with interpretation
 * - celestialArchetype: string (e.g., "The Pioneer", "The Mystic", "The Healer")
 * - karmicLessons: string (lessons to learn in this lifetime)
 * - soulUrge: string (deep inner desires and motivations)
 *
 * Note: Template has hardcoded defaults for demo purposes. Enrichment script should override these.
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

  // Helper function: Generate Elaborated Meaning (OPTIMIZED V5 - Full Width, Tight Spacing, 3 Cards)
  function generateElaboratedMeaning(nameData) {
    const historicalUsage = nameData.modernContext || `The name ${nameData.name} has been used throughout history, evolving in meaning and usage across different cultures and time periods.`;

    return `
      <div class="elaborated-meaning" style="margin: 0 -8px;">
        <div class="meaning-card" style="background: linear-gradient(135deg, #F0E0FF 0%, #E8D4FF 100%); border-left: 4px solid #D8B2F2; padding: 20px 24px; margin-bottom: 14px;">
          <h3 style="display: flex; align-items: center; gap: 10px; color: #7C3AED; margin: 0 0 12px 0; font-size: 1.25rem; font-weight: 700;">
            <span style="font-size: 1.5rem;">📖</span>
            Etymology & Origins
          </h3>
          <p style="margin: 0; color: #4C1D95; line-height: 1.7; font-size: 17px; max-width: 100%;">The name ${nameData.name} has <strong>${nameData.origin}</strong> origins. ${nameData.meaning}. This etymological foundation provides deep insight into the name's historical and linguistic roots.</p>
        </div>

        <div class="meaning-card" style="background: linear-gradient(135deg, #FFE8F5 0%, #FFD4E8 100%); border-left: 4px solid #FFB3D9; padding: 20px 24px; margin-bottom: 14px;">
          <h3 style="display: flex; align-items: center; gap: 10px; color: #DB2777; margin: 0 0 12px 0; font-size: 1.25rem; font-weight: 700;">
            <span style="font-size: 1.5rem;">📜</span>
            Historical Context
          </h3>
          <p style="margin: 0; color: #831843; line-height: 1.7; font-size: 17px; max-width: 100%;">${historicalUsage} Throughout the centuries, ${nameData.name} has maintained a presence in historical records, literature, and cultural narratives.</p>
        </div>

        <div class="meaning-card" style="background: linear-gradient(135deg, #FFF8E0 0%, #FFEFD4 100%); border-left: 4px solid #FCD34D; padding: 20px 24px; margin-bottom: 0;">
          <h3 style="display: flex; align-items: center; gap: 10px; color: #D97706; margin: 0 0 12px 0; font-size: 1.25rem; font-weight: 700;">
            <span style="font-size: 1.5rem;">🌟</span>
            Modern Usage
          </h3>
          <p style="margin: 0; color: #92400E; line-height: 1.7; font-size: 17px; max-width: 100%;">Today, ${nameData.name} remains a ${nameData.gender === 'male' ? 'masculine' : 'feminine'} name popular across many cultures. Its enduring appeal lies in its ${nameData.meaning.toLowerCase()}, resonating with parents seeking a name rich in history and meaning for their child.</p>
        </div>
      </div>
    `;
  }

  // Helper function: Generate Famous Name Constellation

  // Helper function: Generate Historical Timeline
  function generateTimeline(historicFigures = []) {
    if (!historicFigures || historicFigures.length === 0) {
      return '<p style="color: #94a3b8; text-align: center; padding: 20px;">No timeline data available for this name.</p>';
    }

    // Parse years and calculate positions
    const timeline = historicFigures.map(figure => {
      const yearMatch = figure.years.match(/(\d{4})/);
      const year = yearMatch ? parseInt(yearMatch[1]) : 0;
      return { ...figure, birthYear: year };
    }).filter(f => f.birthYear > 0).sort((a, b) => a.birthYear - b.birthYear);

    if (timeline.length === 0) {
      return '<p style="color: #94a3b8; text-align: center; padding: 20px;">No timeline data available for this name.</p>';
    }

    const minYear = timeline[0].birthYear;
    const maxYear = timeline[timeline.length - 1].birthYear;
    const yearRange = maxYear - minYear || 1;

    // Generate timeline points
    const points = timeline.map(figure => {
      const position = ((figure.birthYear - minYear) / yearRange) * 100;
      const category = figure.category.toLowerCase().split(/[\/\s]+/)[0];

      return `
        <div class="timeline-point category-${category}" style="left: ${position}%">
          <div class="timeline-card">
            <div class="timeline-card-name">${figure.fullName || figure.name}</div>
            <div class="timeline-card-years">${figure.years}</div>
            <div class="timeline-card-achievement">
              ${figure.achievements && figure.achievements[0] ? figure.achievements[0] : figure.significance}
            </div>
          </div>
        </div>
      `;
    }).join('');

    // Extract unique categories for legend
    const categories = [...new Set(timeline.map(f => f.category.toLowerCase().split(/[\/\s]+/)[0]))];
    const categoryLabels = {
      'leader': 'Leaders',
      'philosopher': 'Philosophers',
      'artist': 'Artists',
      'scientist': 'Scientists',
      'saint': 'Saints',
      'inventor': 'Inventors',
      'theologian': 'Theologians'
    };

    const legendItems = categories.map(cat => `
      <div class="timeline-legend-item">
        <div class="timeline-legend-dot ${cat}"></div>
        <span>${categoryLabels[cat] || cat.charAt(0).toUpperCase() + cat.slice(1)}</span>
      </div>
    `).join('');

    return `
      <div class="timeline-container">
        <div class="timeline-track">
          <div class="timeline-labels">
            <span class="timeline-label-start">${minYear}</span>
            <span class="timeline-label-end">${maxYear}</span>
          </div>
          <div class="timeline-line"></div>
          ${points}
        </div>
        <div class="timeline-legend">
          ${legendItems}
        </div>
      </div>
    `;
  }

  // Helper function: Generate Name Strength Meter

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">

  <!-- Primary Meta Tags -->
  <title>${nameData.name} - Meaning, Origin, Famous People & Personality Traits | SoulSeed</title>
  <meta name="title" content="${nameData.name} - Meaning, Origin, Famous People & Personality Traits | SoulSeed">
  <meta name="description" content="Discover ${nameData.name}'s meaning, origin, famous historical figures, personality traits, and cultural variations. See popularity trends and interactive timelines.">
  <meta name="keywords" content="${nameData.name}, baby name meaning, name origin, famous people named ${nameData.name}, ${nameData.name} personality, ${nameData.name} history, baby names">
  <meta name="author" content="SoulSeed">
  <meta name="robots" content="index, follow">
  <link rel="canonical" href="https://soulseedbaby.com/names/${nameData.name.toLowerCase()}">

  <!-- Open Graph / Facebook -->
  <meta property="og:type" content="article">
  <meta property="og:url" content="https://soulseedbaby.com/names/${nameData.name.toLowerCase()}">
  <meta property="og:title" content="${nameData.name} - Meaning, Origin, Famous People & Personality Traits">
  <meta property="og:description" content="Discover ${nameData.name}'s meaning, origin, famous historical figures, personality traits, and cultural variations. Interactive baby name guide with timelines and constellation view.">
  <meta property="og:image" content="https://soulseedbaby.com/og-images/${nameData.name.toLowerCase()}.jpg">
  <meta property="og:site_name" content="SoulSeed">

  <!-- Twitter -->
  <meta property="twitter:card" content="summary_large_image">
  <meta property="twitter:url" content="https://soulseedbaby.com/names/${nameData.name.toLowerCase()}">
  <meta property="twitter:title" content="${nameData.name} - Meaning, Origin, Famous People & Personality Traits">
  <meta property="twitter:description" content="Discover ${nameData.name}'s meaning, origin, famous historical figures, personality traits, and cultural variations.">
  <meta property="twitter:image" content="https://soulseedbaby.com/og-images/${nameData.name.toLowerCase()}.jpg">

  <!-- Schema.org JSON-LD -->
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": "${nameData.name} - Meaning, Origin, Famous People & Personality Traits",
    "description": "${nameData.meaning || 'Discover the meaning, origin, and history of the name ' + nameData.name}",
    "author": {
      "@type": "Organization",
      "name": "SoulSeed",
      "url": "https://soulseedbaby.com"
    },
    "publisher": {
      "@type": "Organization",
      "name": "SoulSeed",
      "logo": {
        "@type": "ImageObject",
        "url": "https://soulseedbaby.com/logo.png"
      }
    },
    "datePublished": "${new Date().toISOString()}",
    "dateModified": "${new Date().toISOString()}",
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": "https://soulseedbaby.com/names/${nameData.name.toLowerCase()}"
    },
    "about": {
      "@type": "Thing",
      "name": "${nameData.name}",
      "description": "${nameData.meaning || 'Baby name ' + nameData.name}"
    }
  }
  </script>

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
      cursor: pointer;
      user-select: none;
    }

    .section-number {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 28px;
      height: 28px;
      background: linear-gradient(135deg, #D8B2F2, #FFB3D9);
      color: white;
      border-radius: 50%;
      font-size: 14px;
      font-weight: 700;
      flex-shrink: 0;
    }

    .accordion-btn {
      margin-left: auto;
      background: none;
      border: none;
      cursor: pointer;
      padding: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.3s;
      border-radius: 50%;
    }

    .accordion-btn:hover {
      background: rgba(0,0,0,0.05);
    }

    .chevron {
      width: 20px;
      height: 20px;
      transition: transform 0.3s ease;
      stroke: #64748b;
      stroke-width: 2;
      fill: none;
    }

    .chevron.rotated {
      transform: rotate(180deg);
    }

    .section-content {
      overflow: hidden;
      transition: max-height 0.3s ease-out, opacity 0.3s ease-out;
    }

    .section-content.collapsed {
      max-height: 0 !important;
      opacity: 0;
      margin: 0;
      padding: 0;
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

    /* ========================================
       CELESTIAL HARMONY (ASTROLOGY) STYLES
       ======================================== */

    .celestial-harmony-container {
      padding: 12px;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .astrology-intro {
      text-align: center;
      padding: 8px;
      background: linear-gradient(135deg, #F0E0FF 0%, #FFE0EC 100%);
      border-radius: 12px;
    }

    .astrology-tagline {
      font-size: 14px;
      font-weight: 600;
      color: #6b21a8;
      margin: 0;
    }

    .subsection-title {
      font-size: 16px;
      font-weight: 700;
      color: #1e293b;
      margin-bottom: 12px;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    /* Zodiac Wheel */
    .zodiac-wheel-section {
      background: linear-gradient(135deg, #faf5ff 0%, #fff5f7 100%);
      border-radius: 16px;
      padding: 20px;
    }

    .zodiac-wheel-container {
      display: flex;
      justify-content: center;
      margin: 16px 0;
    }

    .zodiac-note {
      text-align: center;
      font-size: 12px;
      color: #64748b;
      margin-top: 12px;
    }

    .zodiac-sign {
      cursor: pointer;
      transition: all 0.3s;
    }

    /* Elemental Balance */
    .elemental-balance-section {
      background: white;
      border-radius: 12px;
      padding: 12px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.05);
    }

    .elements-container {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .element-row {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .element-label {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 13px;
      font-weight: 600;
      color: #1e293b;
    }

    .element-emoji {
      font-size: 16px;
    }

    .element-bar-container {
      background: #f1f5f9;
      border-radius: 8px;
      height: 32px;
      overflow: hidden;
      position: relative;
    }

    .element-bar {
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: flex-end;
      padding-right: 12px;
      transition: width 1s ease-out;
      border-radius: 8px;
    }

    .element-percentage {
      font-size: 13px;
      font-weight: 700;
      color: white;
    }

    .element-traits {
      font-size: 12px;
      color: #64748b;
      font-style: italic;
      padding-left: 26px;
    }

    /* Planetary Ruler */
    .planetary-ruler-section {
      background: white;
      border-radius: 12px;
      padding: 12px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.05);
    }

    .planet-card {
      padding: 16px;
      border-radius: 12px;
      text-align: center;
    }

    .planet-emoji {
      font-size: 48px;
      margin-bottom: 8px;
    }

    .planet-name {
      font-size: 20px;
      font-weight: 700;
      color: #1e293b;
      margin-bottom: 6px;
    }

    .planet-element {
      font-size: 13px;
      color: #64748b;
      margin-bottom: 12px;
    }

    .planet-traits {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      justify-content: center;
    }

    .trait-badge {
      background: white;
      padding: 4px 10px;
      border-radius: 16px;
      font-size: 12px;
      font-weight: 600;
      color: #8b5cf6;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    /* Lucky Attributes */
    .lucky-attributes-section {
      background: linear-gradient(135deg, #ecfdf5 0%, #f0fdf4 100%);
      border-radius: 12px;
      padding: 12px;
    }

    .lucky-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
    }

    .lucky-card {
      background: white;
      padding: 12px;
      border-radius: 12px;
      text-align: center;
      box-shadow: 0 2px 6px rgba(0,0,0,0.08);
      transition: all 0.3s;
    }

    .lucky-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0,0,0,0.12);
    }

    .lucky-icon {
      font-size: 28px;
      margin-bottom: 6px;
      width: 48px;
      height: 48px;
      margin: 0 auto 6px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 12px;
    }

    .lucky-label {
      font-size: 11px;
      color: #64748b;
      margin-bottom: 4px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .lucky-value {
      font-size: 16px;
      font-weight: 700;
      color: #1e293b;
      margin-bottom: 6px;
    }

    .lucky-description {
      font-size: 11px;
      color: #64748b;
      line-height: 1.4;
      margin: 0;
    }

    .color-swatch {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      margin: 0 auto;
      border: 3px solid white;
      box-shadow: 0 2px 8px rgba(0,0,0,0.15);
    }

    /* Astrological Traits */
    .astrological-traits-section {
      background: white;
      border-radius: 12px;
      padding: 12px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.05);
    }

    .traits-cloud {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      justify-content: center;
    }

    .astro-trait {
      background: linear-gradient(135deg, #D8B2F2 0%, #FFB3D9 100%);
      color: white;
      padding: 6px 14px;
      border-radius: 20px;
      font-size: 13px;
      font-weight: 600;
      box-shadow: 0 2px 6px rgba(216, 178, 242, 0.3);
      transition: all 0.3s;
    }

    .astro-trait:hover {
      transform: translateY(-2px) scale(1.05);
      box-shadow: 0 4px 12px rgba(216, 178, 242, 0.4);
    }

    /* Celestial Correspondences */
    .celestial-correspondences-section {
      background: linear-gradient(135deg, #faf5ff 0%, #fff5f7 100%);
      border-radius: 12px;
      padding: 12px;
    }

    .celestial-grid {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .celestial-item {
      background: white;
      padding: 10px;
      border-radius: 8px;
      box-shadow: 0 1px 4px rgba(0,0,0,0.05);
    }

    .celestial-item strong {
      display: block;
      font-size: 13px;
      color: #1e293b;
      margin-bottom: 4px;
    }

    .celestial-item p {
      font-size: 12px;
      color: #64748b;
      margin: 0;
      line-height: 1.4;
    }

    /* Astrological Profile */
    .astrological-profile-section {
      background: white;
      border-radius: 12px;
      padding: 12px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.05);
    }

    .astro-profile {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .astro-profile p {
      font-size: 13px;
      color: #1e293b;
      margin: 0;
      line-height: 1.5;
    }

    .astro-profile strong {
      color: #6b21a8;
    }

    /* Mobile Responsive */
    @media (max-width: 480px) {
      .zodiac-wheel-container svg {
        max-width: 100%;
        height: auto;
      }

      .lucky-grid {
        grid-template-columns: 1fr;
      }

      .element-bar-container {
        height: 28px;
      }

      .planet-emoji {
        font-size: 48px;
      }
    }


    /* ========================================
       HISTORICAL TIMELINE VISUALIZATION
       ======================================== */

    .timeline-container {
      overflow-x: auto;
      padding: 20px 0;
      position: relative;
    }

    .timeline-track {
      min-width: 800px;
      height: 200px;
      position: relative;
      background: linear-gradient(to right,
        rgba(216, 178, 242, 0.1) 0%,
        rgba(255, 179, 217, 0.1) 100%);
      border-radius: 12px;
      padding: 20px;
    }

    .timeline-line {
      position: absolute;
      top: 50%;
      left: 0;
      right: 0;
      height: 3px;
      background: linear-gradient(to right, #D8B2F2, #FFB3D9, #B3D9FF);
    }

    .timeline-point {
      position: absolute;
      top: 50%;
      transform: translate(-50%, -50%);
      width: 16px;
      height: 16px;
      border-radius: 50%;
      background: white;
      border: 3px solid #D8B2F2;
      cursor: pointer;
      transition: all 0.3s;
      z-index: 2;
    }

    .timeline-point:hover {
      width: 20px;
      height: 20px;
      border-width: 4px;
      box-shadow: 0 0 12px currentColor;
    }

    .timeline-point.category-philosopher {
      border-color: #D8B2F2;
    }

    .timeline-point.category-leader {
      border-color: #FFB3D9;
    }

    .timeline-point.category-artist {
      border-color: #D8B2F2;
    }

    .timeline-point.category-scientist {
      border-color: #B3D9FF;
    }

    .timeline-point.category-saint {
      border-color: #FFB3D9;
    }

    .timeline-point.category-inventor {
      border-color: #B3D9FF;
    }

    .timeline-point.category-theologian {
      border-color: #D8B2F2;
    }

    .timeline-card {
      position: absolute;
      bottom: 100%;
      left: 50%;
      transform: translateX(-50%);
      margin-bottom: 10px;
      background: white;
      padding: 12px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      min-width: 200px;
      opacity: 0;
      pointer-events: none;
      transition: opacity 0.3s;
      z-index: 3;
    }

    .timeline-point:hover .timeline-card {
      opacity: 1;
      pointer-events: auto;
    }

    .timeline-card-name {
      font-size: 14px;
      font-weight: 700;
      color: #1e293b;
      margin-bottom: 4px;
    }

    .timeline-card-years {
      font-size: 12px;
      color: #64748b;
      margin-bottom: 6px;
    }

    .timeline-card-achievement {
      font-size: 11px;
      color: #475569;
      line-height: 1.4;
    }

    .timeline-labels {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      display: flex;
      justify-content: space-between;
      padding: 0 10px;
      font-size: 12px;
      font-weight: 600;
      color: #64748b;
    }

    .timeline-legend {
      margin-top: 20px;
      padding: 16px;
      background: linear-gradient(135deg, #faf5ff 0%, #fff5f7 100%);
      border-radius: 8px;
      display: flex;
      flex-wrap: wrap;
      gap: 12px;
      justify-content: center;
    }

    .timeline-legend-item {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 13px;
      color: #64748b;
    }

    .timeline-legend-dot {
      width: 12px;
      height: 12px;
      border-radius: 50%;
      border: 2px solid;
    }

    .timeline-legend-dot.leader {
      border-color: #FFB3D9;
    }

    .timeline-legend-dot.philosopher {
      border-color: #D8B2F2;
    }

    .timeline-legend-dot.artist {
      border-color: #D8B2F2;
    }

    .timeline-legend-dot.scientist {
      border-color: #B3D9FF;
    }

    .timeline-legend-dot.saint {
      border-color: #FFB3D9;
    }

    .timeline-legend-dot.inventor {
      border-color: #B3D9FF;
    }

    @media (max-width: 480px) {
      .timeline-track {
        min-width: 600px;
      }

      .timeline-card {
        min-width: 160px;
        font-size: 11px;
      }
    }

    /* ========================================
       ELABORATED MEANING SECTION
       ======================================== */

    .elaborated-meaning {
      padding: 20px;
    }

    .elaborated-meaning h3 {
      font-size: 16px;
      font-weight: 700;
      color: #1e293b;
      margin-top: 16px;
      margin-bottom: 8px;
    }

    .elaborated-meaning h3:first-child {
      margin-top: 0;
    }

    .elaborated-meaning p {
      font-size: 14px;
      line-height: 1.6;
      color: #475569;
      margin-bottom: 12px;
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

    <!-- Section 0: Inspiration (Quote or Haiku) -->
${nameData.inspiration ? `    <div class="section" style="background: linear-gradient(135deg, #FFF8E1 0%, #FFECB3 100%); padding: 24px; margin-bottom: 20px; border-left: 4px solid #FFA726;">
      <div class="inspiration-content" style="text-align: center;">
        ${nameData.inspiration.type === 'quote' ? `
        <!-- Inspirational Quote -->
        <div class="quote-icon" style="font-size: 48px; margin-bottom: 12px;">💭</div>
        <blockquote style="font-size: 20px; font-style: italic; color: #E65100; line-height: 1.6; margin: 0 0 16px 0; font-weight: 500;">
          "${nameData.inspiration.content}"
        </blockquote>
        <div class="quote-author" style="font-size: 16px; font-weight: 600; color: #F57C00; margin-bottom: 8px;">
          — ${nameData.inspiration.author}
        </div>
        <div class="quote-context" style="font-size: 14px; color: #FF6F00; opacity: 0.8;">
          ${nameData.inspiration.context}
        </div>
        ` : `
        <!-- Haiku -->
        <div class="haiku-icon" style="font-size: 48px; margin-bottom: 12px;">🌸</div>
        <div class="haiku-content" style="font-size: 18px; line-height: 1.8; color: #E65100; font-family: 'Georgia', serif; font-style: italic; margin-bottom: 16px;">
          ${nameData.inspiration.content.split('\n').map(line => `<div>${line}</div>`).join('')}
        </div>
        <div class="haiku-context" style="font-size: 14px; color: #FF6F00; opacity: 0.8;">
          ${nameData.inspiration.context}
        </div>
        `}
      </div>
    </div>` : ''}

    <!-- Section 1: Quick Stats (ENHANCED V5 - Colorful WOW Design) -->
    <div class="section" style="background: linear-gradient(135deg, #FAFAFA 0%, #F5F5F5 100%); padding: 20px;">
      <h2 class="section-title" onclick="toggleAccordion('section_1_stats')" style="margin-bottom: 16px;">
        <span class="section-number" style="background: linear-gradient(135deg, #FF6B9D 0%, #C06C84 100%);">1</span>
        <div class="section-icon icon-2">
          <svg viewBox="0 0 24 24"><path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z"/></svg>
        </div>
        Quick Stats
        <button class="accordion-btn" aria-label="Toggle section">
          <svg class="chevron rotated" viewBox="0 0 24 24">
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </button>
      </h2>
      <div class="section-content" data-section="section_1_stats" style="padding-top: 8px;">
        <div class="stats-grid" style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px;">
          <div class="stat-card" style="background: linear-gradient(135deg, #D8B2F2 0%, #C89EE8 100%); border: none; padding: 16px; border-radius: 16px; box-shadow: 0 4px 12px rgba(216, 178, 242, 0.3); position: relative; overflow: hidden;">
            <div style="position: absolute; top: -10px; right: -10px; font-size: 60px; opacity: 0.15;">💜</div>
            <div class="stat-label" style="color: rgba(255,255,255,0.9); font-weight: 600; font-size: 12px; margin-bottom: 6px; text-transform: uppercase; letter-spacing: 0.5px;">Meaning</div>
            <div class="stat-value" style="color: white; font-weight: 700; font-size: 18px; text-shadow: 0 2px 4px rgba(0,0,0,0.1);">${nameData.meaning}</div>
          </div>

          <div class="stat-card" style="background: linear-gradient(135deg, #FFB3D9 0%, #FF99C7 100%); border: none; padding: 16px; border-radius: 16px; box-shadow: 0 4px 12px rgba(255, 179, 217, 0.3); position: relative; overflow: hidden;">
            <div style="position: absolute; top: -10px; right: -10px; font-size: 60px; opacity: 0.15;">${nameData.gender === 'male' ? '👦' : '👧'}</div>
            <div class="stat-label" style="color: rgba(255,255,255,0.9); font-weight: 600; font-size: 12px; margin-bottom: 6px; text-transform: uppercase; letter-spacing: 0.5px;">Gender</div>
            <div class="stat-value" style="color: white; font-weight: 700; font-size: 18px; text-shadow: 0 2px 4px rgba(0,0,0,0.1);">${nameData.gender === 'male' ? 'Boy' : 'Girl'}</div>
          </div>

          <div class="stat-card" style="background: linear-gradient(135deg, #B3D9FF 0%, #99CCFF 100%); border: none; padding: 16px; border-radius: 16px; box-shadow: 0 4px 12px rgba(179, 217, 255, 0.3); position: relative; overflow: hidden;">
            <div style="position: absolute; top: -10px; right: -10px; font-size: 60px; opacity: 0.15;">📊</div>
            <div class="stat-label" style="color: rgba(255,255,255,0.9); font-weight: 600; font-size: 12px; margin-bottom: 6px; text-transform: uppercase; letter-spacing: 0.5px;">Distribution</div>
            <div class="stat-value" style="color: white; font-weight: 700; font-size: 16px; text-shadow: 0 2px 4px rgba(0,0,0,0.1);">${nameData.genderDistribution?.male || 50}% M / ${nameData.genderDistribution?.female || 50}% F</div>
          </div>

          <div class="stat-card" style="background: linear-gradient(135deg, #FCD34D 0%, #FBBF24 100%); border: none; padding: 16px; border-radius: 16px; box-shadow: 0 4px 12px rgba(252, 211, 77, 0.3); position: relative; overflow: hidden;">
            <div style="position: absolute; top: -10px; right: -10px; font-size: 60px; opacity: 0.15;">🏆</div>
            <div class="stat-label" style="color: rgba(255,255,255,0.9); font-weight: 600; font-size: 12px; margin-bottom: 6px; text-transform: uppercase; letter-spacing: 0.5px;">Ranking</div>
            <div class="stat-value" style="color: white; font-weight: 700; font-size: 18px; text-shadow: 0 2px 4px rgba(0,0,0,0.1);">#${nameData.ranking?.current || 'N/A'}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Section 2: Elaborated Meaning (EXPANDED by default for SEO) -->
    <div class="section">
      <h2 class="section-title" onclick="toggleAccordion('section_2_meaning')">
        <span class="section-number">2</span>
        <div class="section-icon icon-1">
          <svg viewBox="0 0 24 24"><path d="M21 5c-1.11-.35-2.33-.5-3.5-.5-1.95 0-4.05.4-5.5 1.5-1.45-1.1-3.55-1.5-5.5-1.5S2.45 4.9 1 6v14.65c0 .25.25.5.5.5.1 0 .15-.05.25-.05C3.1 20.45 5.05 20 6.5 20c1.95 0 4.05.4 5.5 1.5 1.35-.85 3.8-1.5 5.5-1.5 1.65 0 3.35.3 4.75 1.05.1.05.15.05.25.05.25 0 .5-.25.5-.5V6c-.6-.45-1.25-.75-2-1zm0 13.5c-1.1-.35-2.3-.5-3.5-.5-1.7 0-4.15.65-5.5 1.5V8c1.35-.85 3.8-1.5 5.5-1.5 1.2 0 2.4.15 3.5.5v11.5z"/></svg>
        </div>
        What Does ${nameData.name} Mean?
        <button class="accordion-btn" aria-label="Toggle section">
          <svg class="chevron rotated" viewBox="0 0 24 24">
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </button>
      </h2>
      <div class="section-content" data-section="section_2_meaning">
        ${generateElaboratedMeaning(nameData)}
      </div>
    </div>

    <!-- Section 3: Cultural Significance -->
    <div class="section">
      <h2 class="section-title" onclick="toggleAccordion('section_3_cultural')">
        <span class="section-number">3</span>
        <div class="section-icon icon-1">
          <svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>
        </div>
        Cultural Significance
        <button class="accordion-btn" aria-label="Toggle section">
          <svg class="chevron rotated" viewBox="0 0 24 24">
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </button>
      </h2>
      <div class="section-content" data-section="section_3_cultural">
        <p class="section-text">${nameData.culturalSignificance}</p>

        <div class="divider"></div>

        <p class="section-text">${nameData.modernContext}</p>

        <div class="divider"></div>

        <p class="section-text">${nameData.literaryReferences}</p>
      </div>
    </div>

    <!-- Section 4: Name Variants (Nicknames, Variations, Similar Names) -->
    <div class="section" style="padding: 16px 24px;">
      <h2 class="section-title" style="margin-bottom: 6px;" onclick="toggleAccordion('section_4_variants')">
        <span class="section-number">4</span>
        <div class="section-icon icon-1">
          <svg viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
        </div>
        Name Variants
        <button class="accordion-btn" aria-label="Toggle section">
          <svg class="chevron rotated" viewBox="0 0 24 24">
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </button>
      </h2>
      <div class="section-content" data-section="section_4_variants">

        <!-- Subsection: Nicknames -->
        <h3 class="subsection-title" style="margin-top: 0;">👤 Nicknames</h3>
        <div class="chip-list">
${nameData.nicknames.slice(0, 9).map(nick => `          <div class="chip">${nick}</div>`).join('\n')}
        </div>

        <div class="divider" style="margin: 20px 0;"></div>

        <!-- Subsection: Variations -->
        <h3 class="subsection-title">🌍 Variations</h3>
        <div class="chip-list">
${nameData.variations.filter((v, i, arr) => arr.indexOf(v) === i).slice(0, 9).map(v => `          <div class="chip">${v}</div>`).join('\n')}
        </div>

        <div class="divider" style="margin: 20px 0;"></div>

        <!-- Subsection: Similar Names -->
        <h3 class="subsection-title">✨ Similar Names</h3>
        <div class="chip-list">
${nameData.similarNames.filter((v, i, arr) => arr.indexOf(v) === i).slice(0, 9).map(n => `          <div class="chip">${n}</div>`).join('\n')}
        </div>

      </div>
    </div>

    <!-- Section 5: Historical Figures -->
    <div class="section">
      <h2 class="section-title" onclick="toggleAccordion('section_5_historical')">
        <span class="section-number">5</span>
        <div class="section-icon icon-2">
          <svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg>
        </div>
        Historical Figures
        <button class="accordion-btn" aria-label="Toggle section">
          <svg class="chevron rotated" viewBox="0 0 24 24">
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </button>
      </h2>
      <div class="section-content" data-section="section_5_historical">
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
          <div class="hist-best-known" style="margin-top: 8px; padding: 8px; background: rgba(255,255,255,0.5); border-radius: 8px;">
            <strong>Best known for:</strong> ${figure.achievements[0] || figure.significance}
          </div>
          <div class="hist-significance">
            <strong>Significance:</strong> ${figure.significance}
          </div>
${figure.notableWorks && figure.notableWorks.length > 0 ? `          <div class="hist-works">
            <strong>Notable Works:</strong> ${figure.notableWorks.join(', ')}
          </div>` : ''}
        </div>`).join('\n')}
        </div>
      </div>
    </div>

    <!-- Section 6: Religious Significance -->
${nameData.religiousSignificance && nameData.religiousSignificance.hasSignificance ? `    <div class="section">
      <h2 class="section-title" onclick="toggleAccordion('section_6_religious')">
        <span class="section-number">6</span>
        <div class="section-icon icon-3">
          <svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/></svg>
        </div>
        Religious Significance
        <button class="accordion-btn" aria-label="Toggle section">
          <svg class="chevron rotated" viewBox="0 0 24 24">
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </button>
      </h2>
      <div class="section-content" data-section="section_6_religious">
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
    </div>
` : ''}
    <!-- Section 6.5: Books with This Name -->
${nameData.booksWithName && nameData.booksWithName.length > 0 ? `    <div class="section">
      <h2 class="section-title" onclick="toggleAccordion('section_6_5_books')">
        <span class="section-number">6.5</span>
        <div class="section-icon" style="width: 48px; height: 48px; display: flex; align-items: center; justify-content: center; font-size: 32px;">📚</div>
        Books Featuring ${nameData.name}
        <button class="accordion-btn" aria-label="Toggle section">
          <svg class="chevron rotated" viewBox="0 0 24 24">
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </button>
      </h2>
      <div class="section-content" data-section="section_6_5_books">
${nameData.booksWithName.map(book => `        <div class="pop-card" style="border-left: 4px solid #8B4513;">
          <div class="pop-title">${book.title}</div>
          <div class="pop-meta" style="color: #8B4513;">
            📖 ${book.author} • ${book.publishedYear} • ${book.genre}
          </div>
          <div style="display: inline-block; padding: 4px 10px; background: linear-gradient(135deg, #FFF8DC 0%, #FFE4B5 100%); border-radius: 12px; font-size: 12px; font-weight: 600; color: #8B4513; margin: 8px 0;">
            ${book.nameRole === 'title' ? '📕 In Title' : book.nameRole === 'protagonist' ? '⭐ Main Character' : '👤 Character'}
          </div>
          <p class="section-text" style="margin-top: 8px;"><strong>Significance:</strong> ${book.significance}</p>
        </div>`).join('\n')}
      </div>
    </div>
` : ''}
    <!-- Section 6.6: Celebrity Babies -->
    <div class="section">
      <h2 class="section-title" onclick="toggleAccordion('section_6_6_celebs')">
        <span class="section-number">6.6</span>
        <div class="section-icon" style="width: 48px; height: 48px; display: flex; align-items: center; justify-content: center; font-size: 32px;">⭐</div>
        Celebrity Babies Named ${nameData.name}
        <button class="accordion-btn" aria-label="Toggle section">
          <svg class="chevron rotated" viewBox="0 0 24 24">
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </button>
      </h2>
      <div class="section-content" data-section="section_6_6_celebs">
${nameData.celebrityBabies && nameData.celebrityBabies.length > 0 ?
  nameData.celebrityBabies.map(celeb => `        <div class="pop-card" style="border-left: 4px solid #FFD700;">
          <div class="pop-title">${celeb.parentName}</div>
          <div class="pop-meta" style="color: #B8860B;">
            ${celeb.parentProfession}${celeb.birthYear ? ` • Baby born ${celeb.birthYear}` : ''}${celeb.source ? ` • Source: ${celeb.source}` : ''}
          </div>
          ${celeb.childName ? `<p class="section-text" style="margin-top: 8px;"><strong>Child's Name:</strong> ${celeb.childName}</p>` : ''}
          <p class="section-text" style="margin-top: 6px;">${celeb.context}</p>
        </div>`).join('\n')
  :
  `        <div style="text-align: center; padding: 40px 20px; background: linear-gradient(135deg, #FFF8E1 0%, #FFECB3 100%); border-radius: 12px;">
          <div style="font-size: 48px; margin-bottom: 16px;">🔍</div>
          <p style="font-size: 18px; font-weight: 600; color: #E65100; margin: 0;">Can't find any</p>
          <p style="font-size: 14px; color: #F57C00; margin-top: 8px; opacity: 0.8;">No verified celebrity babies found with this name</p>
        </div>`
}
      </div>
    </div>

    <!-- Section 7: Movies & Shows -->
${nameData.moviesAndShows && nameData.moviesAndShows.length > 0 ? `    <div class="section">
      <h2 class="section-title" onclick="toggleAccordion('section_7_movies')">
        <span class="section-number">7</span>
        <div class="section-icon icon-4">
          <svg viewBox="0 0 24 24"><path d="M18 3v2h-2V3H8v2H6V3H4v18h2v-2h2v2h8v-2h2v2h2V3h-2zM8 17H6v-2h2v2zm0-4H6v-2h2v2zm0-4H6V7h2v2zm10 8h-2v-2h2v2zm0-4h-2v-2h2v2zm0-4h-2V7h2v2z"/></svg>
        </div>
        In Movies & TV
        <button class="accordion-btn" aria-label="Toggle section">
          <svg class="chevron rotated" viewBox="0 0 24 24">
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </button>
      </h2>
      <div class="section-content" data-section="section_7_movies">
${nameData.moviesAndShows.map(media => `      <div class="pop-card">
        <div class="pop-title">${media.title} (${media.year})</div>
        <div class="pop-meta">${media.type} • ${media.genre}</div>
        <p class="section-text" style="margin-top: 8px;"><strong>${media.characterName}:</strong> ${media.characterDescription}</p>
      </div>`).join('\n')}
      </div>
    </div>
` : ''}
    <!-- Section 8: Songs -->
${nameData.songs && nameData.songs.length > 0 ? `    <div class="section">
      <h2 class="section-title" onclick="toggleAccordion('section_8_songs')">
        <span class="section-number">8</span>
        <div class="section-icon icon-5">
          <svg viewBox="0 0 24 24"><path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/></svg>
        </div>
        In Music
        <button class="accordion-btn" aria-label="Toggle section">
          <svg class="chevron rotated" viewBox="0 0 24 24">
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </button>
      </h2>
      <div class="section-content" data-section="section_8_songs">
${nameData.songs.map(song => `      <div class="pop-card">
        <div class="pop-title">${song.title}</div>
        <div class="pop-meta">${song.artist} • ${song.year} • ${song.genre}</div>
        <p class="section-text" style="margin-top: 8px; margin-bottom: 12px;">${song.nameContext}</p>
        ${song.youtubeVideoId ? `<div style="position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; border-radius: 8px; background: linear-gradient(135deg, #1e293b 0%, #334155 100%); display: flex; align-items: center; justify-content: center;">
          <a href="https://www.youtube.com/results?search_query=${encodeURIComponent(song.artist + ' ' + song.title + ' official')}" target="_blank" style="display: flex; flex-direction: column; align-items: center; text-decoration: none; color: white; padding: 20px; text-align: center;">
            <svg style="width: 64px; height: 64px; margin-bottom: 12px; fill: #ef4444;" viewBox="0 0 24 24">
              <path d="M10 16.5l6-4.5-6-4.5v9zM12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>
            </svg>
            <span style="font-size: 16px; font-weight: 600;">Watch on YouTube</span>
            <span style="font-size: 14px; opacity: 0.8; margin-top: 4px;">${song.title}</span>
          </a>
        </div>` : ''}
      </div>`).join('\n')}
      </div>
    </div>
` : ''}
    <!-- Section 9: Famous People -->
${nameData.famousPeople && nameData.famousPeople.length > 0 ? `    <div class="section">
      <h2 class="section-title" onclick="toggleAccordion('section_9_famous')">
        <span class="section-number">9</span>
        <div class="section-icon icon-6">
          <svg viewBox="0 0 24 24"><path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/></svg>
        </div>
        ${nameData.name} in Popular Culture
        <button class="accordion-btn" aria-label="Toggle section">
          <svg class="chevron rotated" viewBox="0 0 24 24">
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </button>
      </h2>
      <div class="section-content" data-section="section_9_famous">
${nameData.famousPeople.map(person => `      <div class="pop-card">
        <div class="pop-title">${person.name}</div>
        <div class="pop-meta">${person.profession}${person.sport ? ` - ${person.sport}` : ''}</div>
        ${person.team || person.position ? `<p class="section-text" style="margin-top: 8px;"><strong>${person.position ? person.position + ' - ' : ''}${person.team || ''}</strong></p>` : ''}
        ${person.pastTeams && person.pastTeams.length > 0 ? `<p class="section-text" style="margin-top: 6px; font-size: 14px; color: #64748b;"><strong>Past Teams:</strong> ${person.pastTeams.join(', ')}</p>` : ''}
        <p class="section-text" style="margin-top: 8px;"><strong>Known for:</strong> ${person.knownFor.join(', ')}</p>
        <p class="section-text" style="margin-top: 6px;"><strong>Awards:</strong> ${person.awards}</p>
      </div>`).join('\n')}
      </div>
    </div>
` : ''}
    <!-- NEW SECTION: Famous Athletes (Section 9.5 - appears after Famous People) -->
${nameData.famousAthletes && nameData.famousAthletes.length > 0 ? `    <div class="section">
      <h2 class="section-title" onclick="toggleAccordion('section_9_5_athletes')">
        <span class="section-number">9.5</span>
        <div class="section-icon icon-6">
          <svg viewBox="0 0 24 24"><path d="M13.49 5.48c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm-3.6 13.9l1-4.4 2.1 2v6h2v-7.5l-2.1-2 .6-3c1.3 1.5 3.3 2.5 5.5 2.5v-2c-1.9 0-3.5-1-4.3-2.4l-1-1.6c-.4-.6-1-1-1.7-1-.3 0-.5.1-.8.1l-5.2 2.2v4.7h2v-3.4l1.8-.7-1.6 8.1-4.9-1-.4 2 7 1.4z"/></svg>
        </div>
        Famous Athletes Named ${nameData.name}
        <button class="accordion-btn" aria-label="Toggle section">
          <svg class="chevron rotated" viewBox="0 0 24 24">
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </button>
      </h2>
      <div class="section-content" data-section="section_9_5_athletes">
${nameData.famousAthletes.map(athlete => `      <div class="pop-card" style="border-left: 4px solid #10B981;">
        <div class="pop-title">${athlete.name}</div>
        <div class="pop-meta" style="color: #059669; font-weight: 600;">${athlete.sport}</div>
        ${athlete.position && athlete.team ? `<p class="section-text" style="margin-top: 8px;"><strong>Position:</strong> ${athlete.position} | <strong>Current Team:</strong> ${athlete.team}</p>` : ''}
        ${!athlete.position && athlete.team ? `<p class="section-text" style="margin-top: 8px;"><strong>Current Team:</strong> ${athlete.team}</p>` : ''}
        ${athlete.pastTeams && athlete.pastTeams.length > 0 ? `<p class="section-text" style="margin-top: 6px; font-size: 14px; color: #64748b;"><strong>Past Teams:</strong> ${athlete.pastTeams.join(', ')}</p>` : ''}
        <p class="section-text" style="margin-top: 8px;"><strong>Top Achievements:</strong> ${athlete.achievements || athlete.awards}</p>
        ${athlete.years ? `<p class="section-text" style="margin-top: 6px; font-size: 14px; color: #64748b;"><strong>Active:</strong> ${athlete.years}</p>` : ''}
      </div>`).join('\n')}
      </div>
    </div>
` : ''}
    <!-- Section 10: Famous Quotes -->
${nameData.famousQuotes && nameData.famousQuotes.length > 0 ? `    <div class="section">
      <h2 class="section-title" onclick="toggleAccordion('section_10_quotes')">
        <span class="section-number">10</span>
        <div class="section-icon icon-8">
          <svg viewBox="0 0 24 24"><path d="M6 17h3l2-4V7H5v6h3zm8 0h3l2-4V7h-6v6h3z"/></svg>
        </div>
        Inspiring Quotes by ${nameData.name}
        <button class="accordion-btn" aria-label="Toggle section">
          <svg class="chevron rotated" viewBox="0 0 24 24">
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </button>
      </h2>
      <div class="section-content" data-section="section_10_quotes">
${nameData.famousQuotes.map(q => `      <div style="background: linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%); padding: 24px; border-radius: 16px; border-left: 6px solid #F59E0B; margin-bottom: 20px; box-shadow: 0 4px 12px rgba(0,0,0,0.08);">
        <div style="font-size: 48px; color: #F59E0B; opacity: 0.3; line-height: 0; margin-bottom: 16px;">"</div>
        <p style="font-size: 18px; font-style: italic; line-height: 1.6; color: #78350F; margin: 0 0 16px 0; font-weight: 500;">${q.quote}</p>
        <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 16px; border-top: 2px solid rgba(245, 158, 11, 0.3); padding-top: 12px;">
          <p style="font-size: 16px; font-weight: 700; color: #92400E; margin: 0;">— ${q.author}</p>
          ${q.category ? `<span style="display: inline-block; padding: 4px 12px; background: rgba(245, 158, 11, 0.2); color: #92400E; border-radius: 12px; font-size: 12px; font-weight: 600;">${q.category}</span>` : ''}
        </div>
        ${q.context ? `<p style="font-size: 14px; color: #92400E; margin: 12px 0 0 0; opacity: 0.8; font-style: normal;">${q.context}</p>` : ''}
      </div>`).join('\n')}
      </div>
    </div>
` : ''}
    <!-- Section 11: Character Quotes -->
${nameData.characterQuotes && nameData.characterQuotes.length > 0 ? `    <div class="section">
      <h2 class="section-title" onclick="toggleAccordion('section_11_character_quotes')">
        <span class="section-number">11</span>
        <div class="section-icon icon-9">
          <svg viewBox="0 0 24 24"><path d="M21 3H3c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H3V5h18v14zM11 15h2v2h-2zm0-8h2v6h-2z"/></svg>
        </div>
        Iconic Movie Quotes
        <button class="accordion-btn" aria-label="Toggle section">
          <svg class="chevron rotated" viewBox="0 0 24 24">
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </button>
      </h2>
      <div class="section-content" data-section="section_11_character_quotes">
${nameData.characterQuotes.map(cq => `      <div style="background: linear-gradient(135deg, #EDE9FE 0%, #DDD6FE 100%); padding: 24px; border-radius: 16px; border-left: 6px solid #8B5CF6; margin-bottom: 20px; box-shadow: 0 4px 12px rgba(0,0,0,0.08); position: relative; overflow: hidden;">
        <div style="position: absolute; top: 12px; right: 12px; background: rgba(139, 92, 246, 0.15); padding: 6px 12px; border-radius: 8px; font-size: 11px; font-weight: 700; color: #5B21B6; text-transform: uppercase; letter-spacing: 0.5px;">🎬 ${cq.genre}</div>
        <div style="font-size: 64px; color: #8B5CF6; opacity: 0.2; line-height: 0; margin-bottom: 20px; font-family: Georgia, serif;">"</div>
        <p style="font-size: 19px; font-style: italic; line-height: 1.7; color: #5B21B6; margin: 0 0 20px 0; font-weight: 600; letter-spacing: 0.3px;">${cq.quote}</p>
        <div style="background: rgba(139, 92, 246, 0.1); padding: 12px 16px; border-radius: 10px; margin-bottom: 12px;">
          <p style="font-size: 15px; font-weight: 700; color: #6D28D9; margin: 0 0 4px 0;">— ${cq.character}</p>
          <p style="font-size: 14px; color: #7C3AED; margin: 0; opacity: 0.9;"><strong>${cq.source}</strong> (${cq.year})</p>
        </div>
        ${cq.context ? `<p style="font-size: 14px; color: #6D28D9; margin: 12px 0 0 0; line-height: 1.5; opacity: 0.85;"><strong>Scene:</strong> ${cq.context}</p>` : ''}
        ${cq.impact ? `<p style="font-size: 13px; color: #7C3AED; margin: 10px 0 0 0; padding: 10px; background: rgba(139, 92, 246, 0.08); border-radius: 8px; line-height: 1.4; font-style: italic;"><strong>Impact:</strong> ${cq.impact}</p>` : ''}
      </div>`).join('\n')}
      </div>
    </div>
` : ''}
    <!-- Section 12: Personality -->
    <div class="section">
      <h2 class="section-title" onclick="toggleAccordion('section_12_personality')">
        <span class="section-number">12</span>
        <div class="section-icon icon-10">
          <svg viewBox="0 0 24 24"><path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z"/></svg>
        </div>
        Personality & Symbolism
        <button class="accordion-btn" aria-label="Toggle section">
          <svg class="chevron rotated" viewBox="0 0 24 24">
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </button>
      </h2>
      <div class="section-content" data-section="section_12_personality">
      <p class="section-text"><strong>Personality:</strong> ${nameData.personality}</p>
      <div class="divider"></div>
      <p class="section-text"><strong>Symbolism:</strong> ${nameData.symbolism}</p>

      ${nameData.funFact ? `<div class="fun-fact">
        <span class="fun-fact-text">${nameData.funFact}</span>
      </div>` : ''}
      </div>
    </div>

    <!-- Section 13: Baby Name Astrology & Zodiac Numerology (SEO OPTIMIZED) -->
    <div class="section">
      <h2 class="section-title" onclick="toggleAccordion('section_13_astrology')">
        <span class="section-number">13</span>
        <div class="section-icon icon-5">
          <svg viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
        </div>
        Baby Name Astrology & Zodiac Numerology
        <button class="accordion-btn" aria-label="Toggle section">
          <svg class="chevron" viewBox="0 0 24 24">
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </button>
      </h2>
      <div class="section-content collapsed" data-section="section_13_astrology">
        <div class="celestial-harmony-container">
          <div class="astrology-intro">
            <p class="astrology-tagline">✨ Unlock the celestial meaning and cosmic destiny behind ${nameData.name} through astrology, zodiac signs, and numerology</p>
            <p style="font-size: 14px; color: #64748b; margin-top: 8px; line-height: 1.6;">Discover how this name aligns with planetary energies, birth chart compatibility, and numerological vibrations. Perfect for parents seeking astrological baby names that connect to the cosmos and stars.</p>
          </div>

          <!-- Elemental Balance -->
          <div class="elemental-balance-section">
            <h3 class="subsection-title">⚖️ Zodiac Elemental Balance & Energy</h3>
            <div class="elements-container">
              <div class="element-row">
                <div class="element-label">
                  <span class="element-emoji">🔥</span>
                  <span class="element-name">Fire</span>
                </div>
                <div class="element-bar-container">
                  <div class="element-bar" style="width: 40%; background: #FFB3D9">
                    <span class="element-percentage">40%</span>
                  </div>
                </div>
                <div class="element-traits">Passion, Energy, Action</div>
              </div>
              <div class="element-row">
                <div class="element-label">
                  <span class="element-emoji">🌿</span>
                  <span class="element-name">Earth</span>
                </div>
                <div class="element-bar-container">
                  <div class="element-bar" style="width: 25%; background: #E0FFF0">
                    <span class="element-percentage">25%</span>
                  </div>
                </div>
                <div class="element-traits">Stability, Practicality, Growth</div>
              </div>
              <div class="element-row">
                <div class="element-label">
                  <span class="element-emoji">💨</span>
                  <span class="element-name">Air</span>
                </div>
                <div class="element-bar-container">
                  <div class="element-bar" style="width: 20%; background: #B3D9FF">
                    <span class="element-percentage">20%</span>
                  </div>
                </div>
                <div class="element-traits">Intellect, Communication, Freedom</div>
              </div>
              <div class="element-row">
                <div class="element-label">
                  <span class="element-emoji">💧</span>
                  <span class="element-name">Water</span>
                </div>
                <div class="element-bar-container">
                  <div class="element-bar" style="width: 15%; background: #F0E0FF">
                    <span class="element-percentage">15%</span>
                  </div>
                </div>
                <div class="element-traits">Emotion, Intuition, Depth</div>
              </div>
            </div>
          </div>

          <!-- Planetary Ruler -->
          <div class="planetary-ruler-section">
            <h3 class="subsection-title">🪐 Birth Chart Planetary Ruler</h3>
            <div class="planet-card" style="background: linear-gradient(135deg, #FFB3D940, #FFB3D920);">
              <div class="planet-emoji">☀️</div>
              <div class="planet-name">Sun</div>
              <div class="planet-element">Element: Fire</div>
              <div class="planet-traits">
                <span class="trait-badge">Leadership</span>
                <span class="trait-badge">Vitality</span>
                <span class="trait-badge">Confidence</span>
              </div>
            </div>
          </div>

          <!-- Lucky Attributes (from celestialData) -->
          <div class="lucky-attributes-section">
            <h3 class="subsection-title">🍀 Lucky Numbers & Astrological Attributes</h3>
            <div class="lucky-grid">
              <div class="lucky-card">
                <div class="lucky-icon" style="background: #F0E0FF;">🔢</div>
                <div class="lucky-label">Lucky Number</div>
                <div class="lucky-value">${nameData.celestialData?.luckyNumber || 7}</div>
                <p class="lucky-description">Represents spirituality and inner wisdom. This number brings contemplation and mystical understanding.</p>
              </div>
              <div class="lucky-card">
                <div class="lucky-icon" style="background: #FFE0EC;">🎨</div>
                <div class="lucky-label">Lucky Color</div>
                <div class="lucky-value">
                  <div class="color-swatch" style="background: ${nameData.celestialData?.luckyColor?.hex || '#FFB3D9'}"></div>
                  <span>${nameData.celestialData?.luckyColor?.name || 'Rose Pink'}</span>
                </div>
                <p class="lucky-description">Enhances emotional connection and attracts positive energy. Wear this color for harmony.</p>
              </div>
              <div class="lucky-card">
                <div class="lucky-icon" style="background: #E0F2FF;">💎</div>
                <div class="lucky-label">Lucky Gemstone</div>
                <div class="lucky-value">${nameData.celestialData?.luckyGemstone || 'Crystal'}</div>
                <p class="lucky-description">Amplifies personal power and protects against negative energies. Carry this stone for strength.</p>
              </div>
              <div class="lucky-card">
                <div class="lucky-icon" style="background: #E0FFF0;">📅</div>
                <div class="lucky-label">Lucky Day</div>
                <div class="lucky-value">${nameData.celestialData?.luckyDay || 'Sunday'}</div>
                <p class="lucky-description">Most favorable day for important decisions and new beginnings. Plan accordingly for success.</p>
              </div>
            </div>
          </div>

          <!-- Astrological Traits -->
          <div class="astrological-traits-section">
            <h3 class="subsection-title">✨ Star Sign Personality Traits</h3>
            <div class="traits-cloud">
              <span class="astro-trait">Bold</span>
              <span class="astro-trait">Charismatic</span>
              <span class="astro-trait">Confident</span>
              <span class="astro-trait">Passionate</span>
              <span class="astro-trait">Pioneering</span>
            </div>
          </div>

          <!-- Celestial Correspondences -->
          <div class="celestial-correspondences-section">
            <h3 class="subsection-title">✨ Moon Phase & Zodiac Compatibility</h3>
            <div class="celestial-grid">
              <div class="celestial-item">
                <strong>🌙 Moon Phase: ${nameData.celestialData?.moonPhase || 'Waxing Crescent'}</strong>
                <p>${nameData.celestialData?.moonPhaseDescription || 'Connection to lunar cycles and emotional rhythms. This phase represents growth, intention-setting, and forward momentum.'}</p>
              </div>
              <div class="celestial-item">
                <strong>⭐ Star Sign Compatibility: ${nameData.celestialData?.compatibleSigns?.join(', ') || 'Aries, Leo, Sagittarius'}</strong>
                <p>${nameData.celestialData?.compatibleSignsDescription || 'Fire energy harmonizes with these celestial patterns. Strong alignment with adventurous and passionate signs.'}</p>
              </div>
              <div class="celestial-item">
                <strong>🌌 Cosmic Element: ${nameData.celestialData?.cosmicElement || 'Ether (Spirit)'}</strong>
                <p>${nameData.celestialData?.cosmicElementDescription || 'The fifth element representing transcendence and higher consciousness. Connects the physical and spiritual realms.'}</p>
              </div>
            </div>
          </div>

          <!-- Astrological Profile -->
          <div class="astrological-profile-section">
            <h3 class="subsection-title">🌟 Numerology & Life Path Destiny</h3>
            <div class="astro-profile">
              <p><strong>Numerological Destiny:</strong> Life Path ${nameData.celestialData?.luckyNumber || 7} - ${nameData.celestialData?.celestialArchetypeDescription || 'Seeker of truth and wisdom'}</p>
              <p><strong>Celestial Archetype:</strong> ${nameData.celestialData?.celestialArchetype || 'The Mystic'}</p>
              <p><strong>Karmic Lessons:</strong> ${nameData.celestialData?.karmicLessons || 'Balanced soul path'}</p>
              <p><strong>Soul Urge:</strong> ${nameData.celestialData?.soulUrge || 7} - ${nameData.celestialData?.soulUrgeDescription || 'Truth and wisdom'}</p>
            </div>
          </div>
        </div>
      </div>
    </div>

  </div>

  <script>
    // Accordion toggle functionality with localStorage persistence
    function toggleAccordion(sectionId) {
      const content = document.querySelector(\`[data-section="\${sectionId}"]\`);
      const chevron = content.previousElementSibling.querySelector('.chevron');

      if (content.classList.contains('collapsed')) {
        content.classList.remove('collapsed');
        chevron.classList.add('rotated');
        localStorage.setItem(\`accordion_\${sectionId}\`, 'expanded');
      } else {
        content.classList.add('collapsed');
        chevron.classList.remove('rotated');
        localStorage.setItem(\`accordion_\${sectionId}\`, 'collapsed');
      }
    }

    // Restore accordion states from localStorage on page load
    document.addEventListener('DOMContentLoaded', () => {
      document.querySelectorAll('[data-section]').forEach(content => {
        const sectionId = content.getAttribute('data-section');
        const state = localStorage.getItem(\`accordion_\${sectionId}\`);
        const chevron = content.previousElementSibling.querySelector('.chevron');

        // Default to expanded (rotated chevron), collapse only if explicitly set
        if (state === 'collapsed') {
          content.classList.add('collapsed');
          chevron.classList.remove('rotated');
        }
      });
    });

    // Astrology helper functions
    function calculateLuckyNumber(name) {
      const letterValues = {
        a:1, b:2, c:3, d:4, e:5, f:6, g:7, h:8, i:9,
        j:1, k:2, l:3, m:4, n:5, o:6, p:7, q:8, r:9,
        s:1, t:2, u:3, v:4, w:5, x:6, y:7, z:8
      };
      let sum = 0;
      for (let char of name.toLowerCase()) {
        if (letterValues[char]) sum += letterValues[char];
      }
      while (sum > 9) {
        sum = sum.toString().split('').reduce((acc, d) => acc + parseInt(d), 0);
      }
      return sum;
    }

    function getLuckyGemstone(element) {
      const gemstones = {
        'Fire': 'Ruby',
        'Earth': 'Emerald',
        'Air': 'Sapphire',
        'Water': 'Moonstone'
      };
      return gemstones[element] || 'Crystal';
    }

    function getLuckyDay(element) {
      const days = {
        'Fire': 'Tuesday',
        'Earth': 'Friday',
        'Air': 'Wednesday',
        'Water': 'Monday'
      };
      return days[element] || 'Sunday';
    }
  </script>
</body>
</html>`;
}

module.exports = { generateNameProfile };
