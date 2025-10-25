# 🚀 Profile V3 Implementation Plan - Complete Roadmap

**Target Template**: `profiletemp3.js` (copy of profiletemp2 with new features)
**Features**: 12 advanced sections (#5, #20, #19, #17, #14, #13, #11, #7, #3, #2, #1, #18)
**Date Created**: 2025-10-24
**Last Updated**: 2025-10-24 (Added Astrology Section)
**Status**: In Progress - Phase 1

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Technical Architecture](#technical-architecture)
3. [Data Requirements](#data-requirements)
4. [Feature Implementation Details](#feature-implementation-details)
5. [Accordion System Specification](#accordion-system-specification)
6. [Historical Figures Expansion](#historical-figures-expansion)
7. [Implementation Order](#implementation-order)
8. [Testing & Validation](#testing--validation)

---

## Overview

### Goals
- Add 12 WOW features to name profiles (including astrology!)
- Implement collapsible accordions with state memory
- Expand historical figures data (10-50 per name)
- Number all sections for easy reference
- Use only accurate, researched data (no invention)
- Maintain ultra-compact design + 15% bigger fonts
- **Match website color scheme**: Pastel lavender (#D8B2F2), pink (#FFB3D9), blue (#B3D9FF)

### Feature List (Priority Order)
1. **#1** - Historical Timeline Visualization
2. **#2** - Name Personality DNA
3. **#3** - Famous Name Constellation
4. **#7** - Character Archetype Wheel
5. **#11** - Name Numerology Mandala
6. **#13** - Name Strength Meter
7. **#14** - Quote Gallery Carousel
8. **#17** - Name Origins Journey
9. **#19** - Name Achievement Badges
10. **#20** - Personality Word Cloud
11. **#5** - Cultural Journey Map
12. **#18** - Celestial Harmony (Astrology) ⭐ NEW!

---

## Technical Architecture

### Template Structure
```
profiletemp3.js
├── CSS Styles (expanded)
│   ├── Accordion styles
│   ├── Timeline styles
│   ├── Constellation canvas styles
│   ├── DNA helix SVG styles
│   ├── Carousel styles
│   └── Word cloud styles
├── JavaScript Functions
│   ├── generateTimeline()
│   ├── generateDNA()
│   ├── generateConstellation()
│   ├── generateArchetypeWheel()
│   ├── generateNumerologyMandala()
│   ├── generateStrengthMeter()
│   ├── generateCarousel()
│   ├── generateOriginsJourney()
│   ├── generateBadges()
│   ├── generateWordCloud()
│   └── accordionStateManager()
└── HTML Sections (numbered)
    ├── Section 1: Hero
    ├── Section 2: Stats
    ├── Section 3: Nicknames
    ├── Section 4: Cultural Significance
    ├── Section 5: Historical Timeline ⭐ NEW
    ├── Section 6: Famous Constellation ⭐ NEW
    ├── Section 7: Religious Significance
    ├── Section 8: Pop Culture
    ├── Section 9: Quote Carousel ⭐ NEW
    ├── Section 10: Character Archetype Wheel ⭐ NEW
    ├── Section 11: Name Strength Meter ⭐ NEW
    ├── Section 12: Personality DNA ⭐ NEW
    ├── Section 13: Numerology Mandala ⭐ NEW
    ├── Section 14: Origins Journey ⭐ NEW
    ├── Section 15: Achievement Badges ⭐ NEW
    ├── Section 16: Personality Word Cloud ⭐ NEW
    ├── Section 17: Cultural Journey Map ⭐ NEW
    ├── Section 18: Celestial Harmony (Astrology) ⭐ NEW
    └── Section 19: Variations & Similar Names
```

### Accordion System Architecture
```javascript
// LocalStorage structure for accordion state
{
  "nameProfile_accordions": {
    "thomas": {
      "section_5_historical_timeline": true,  // expanded
      "section_6_constellation": false,       // collapsed
      "section_9_quotes": true,
      // ... etc
    },
    "emma": {
      "section_5_historical_timeline": false,
      // ... different state per name
    }
  }
}
```

---

## Data Requirements

### Current v4 Schema (thomas-v4.json)
```json
{
  "name": "Thomas",
  "gender": "male",
  "origin": "Aramaic",
  "meaning": "Twin",
  "enrichmentVersion": "v4",
  "historicFigures": [5 figures],      // ⚠️ NEED 10-50
  "religiousSignificance": {...},
  "culturalSignificance": {...},
  "moviesAndShows": [2 entries],
  "songs": [2 entries],
  "famousPeople": [2 entries],
  "famousQuotes": [2 quotes],
  "characterQuotes": [2 quotes],
  "personalityTraits": [...],
  "funFact": "...",
  "nicknames": [9 items],
  "variations": [9 items],
  "similarNames": [9 items]
}
```

### NEW v5 Schema Additions
```json
{
  // ... all v4 fields ...
  "enrichmentVersion": "v5",

  // ⭐ NEW: Expanded historical figures (10-50)
  "historicFigures": [
    {
      "name": "Thomas Aquinas",
      "years": "1225-1274",
      "category": "Philosopher/Theologian",
      "achievements": [...],
      "significance": "...",
      "notableWorks": [...],
      "impactScore": 95  // NEW: 0-100 scale
    },
    // ... 9-49 more
  ],

  // ⭐ NEW: Etymology chain
  "etymologyChain": [
    { "language": "Aramaic", "word": "Ta'oma", "meaning": "Twin" },
    { "language": "Greek", "word": "Didymos", "meaning": "Twin" },
    { "language": "Latin", "word": "Thomas", "meaning": "Twin" },
    { "language": "English", "word": "Thomas", "meaning": "Twin" }
  ],

  // ⭐ NEW: Phonetic data
  "phonetics": {
    "syllables": ["Thom", "as"],
    "stress": [1, 0],  // stressed-unstressed
    "ipa": "/ˈtɑː.məs/",
    "rhymesWith": ["Jonas", "Tobias"]
  },

  // ⭐ NEW: Numerology
  "numerology": {
    "lifePathNumber": 7,
    "calculation": "T(2)+H(8)+O(6)+M(4)+A(1)+S(1) = 22 → 2+2 = 4",
    "traits": ["Analytical", "Spiritual", "Seeker"]
  },

  // ⭐ NEW: Name day celebrations
  "nameDays": [
    { "date": "07-03", "tradition": "Christian", "saint": "St. Thomas the Apostle" },
    { "date": "12-21", "tradition": "Christian", "saint": "St. Thomas the Apostle (Eastern)" }
  ]
}
```

---

## Feature Implementation Details

### Feature #1: Historical Timeline Visualization

**Section Number**: 5
**Accordion ID**: `section_5_historical_timeline`
**Default State**: Expanded

**HTML Structure**:
```html
<div class="section" id="section-5">
  <div class="section-header" onclick="toggleAccordion('section_5_historical_timeline')">
    <h2 class="section-title">
      <span class="section-number">5</span>
      <div class="section-icon icon-timeline">
        <svg><!-- timeline icon --></svg>
      </div>
      Historical Timeline
      <button class="accordion-btn" aria-label="Toggle section">
        <svg class="chevron"><!-- chevron icon --></svg>
      </button>
    </h2>
  </div>

  <div class="section-content" data-section="section_5_historical_timeline">
    <div class="timeline-container">
      <div class="timeline-track">
        <!-- Generated by generateTimeline() -->
      </div>
    </div>
  </div>
</div>
```

**CSS Styles**:
```css
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
    rgba(59, 130, 246, 0.1) 0%,
    rgba(236, 72, 153, 0.1) 100%);
  border-radius: 12px;
  padding: 20px;
}

.timeline-line {
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(to right, #3b82f6, #ec4899);
}

.timeline-point {
  position: absolute;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: white;
  border: 3px solid #3b82f6;
  cursor: pointer;
  transition: all 0.3s;
  z-index: 2;
}

.timeline-point:hover {
  width: 20px;
  height: 20px;
  border-width: 4px;
}

.timeline-point.category-philosopher {
  border-color: #8b5cf6;
}

.timeline-point.category-leader {
  border-color: #ef4444;
}

.timeline-point.category-artist {
  border-color: #f59e0b;
}

.timeline-point.category-scientist {
  border-color: #10b981;
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
```

**JavaScript Function**:
```javascript
function generateTimeline(historicFigures) {
  if (!historicFigures || historicFigures.length === 0) return '';

  // Parse years and calculate positions
  const timeline = historicFigures.map(figure => {
    const yearMatch = figure.years.match(/(\d{4})/);
    const year = yearMatch ? parseInt(yearMatch[1]) : 0;
    return { ...figure, birthYear: year };
  }).filter(f => f.birthYear > 0).sort((a, b) => a.birthYear - b.birthYear);

  if (timeline.length === 0) return '<p class="section-text">No timeline data available</p>';

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
          <div class="timeline-card-name">${figure.name}</div>
          <div class="timeline-card-years">${figure.years}</div>
          <div class="timeline-card-achievement">
            ${figure.achievements[0] || figure.significance}
          </div>
        </div>
      </div>
    `;
  }).join('');

  return `
    <div class="timeline-line"></div>
    ${points}
    <div class="timeline-labels">
      <span class="timeline-label-start">${minYear}</span>
      <span class="timeline-label-end">${maxYear}</span>
    </div>
  `;
}
```

**Data Requirements**:
- Need 10-50 historicFigures with accurate birth years
- Categories: Philosopher, Leader, Artist, Scientist, Saint, Inventor, etc.
- At least 1 achievement per figure

---

### Feature #2: Name Personality DNA

**Section Number**: 12
**Accordion ID**: `section_12_personality_dna`
**Default State**: Collapsed

**Algorithm**:
```javascript
function generateDNA(nameData) {
  // Generate unique DNA pattern based on name characteristics
  const traits = {
    syllables: nameData.name.split(/[aeiou]/i).length - 1,
    origin: hashString(nameData.origin) % 5,
    meaning: hashString(nameData.meaning) % 5,
    historicCount: Math.min(nameData.historicFigures.length, 5)
  };

  // Each trait becomes a "gene" in the DNA strand
  const genes = [
    { trait: 'Leadership', value: traits.historicCount * 20, color: '#ef4444' },
    { trait: 'Creativity', value: traits.origin * 20, color: '#f59e0b' },
    { trait: 'Wisdom', value: traits.syllables * 25, color: '#8b5cf6' },
    { trait: 'Strength', value: traits.meaning * 20, color: '#10b981' }
  ];

  return generateDNAHelix(genes);
}

function generateDNAHelix(genes) {
  const width = 400;
  const height = 300;
  const centerY = height / 2;

  // SVG double helix path
  let svg = `<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">`;

  // Generate spiral strands
  for (let i = 0; i < genes.length; i++) {
    const angle = (i / genes.length) * Math.PI * 4;
    const x = (i / genes.length) * width;
    const y1 = centerY + Math.sin(angle) * 50;
    const y2 = centerY - Math.sin(angle) * 50;

    svg += `
      <circle cx="${x}" cy="${y1}" r="8" fill="${genes[i].color}" opacity="0.8">
        <animate attributeName="opacity" values="0.8;1;0.8" dur="2s" repeatCount="indefinite"/>
      </circle>
      <circle cx="${x}" cy="${y2}" r="8" fill="${genes[i].color}" opacity="0.8">
        <animate attributeName="opacity" values="0.8;1;0.8" dur="2s" repeatCount="indefinite"/>
      </circle>
      <line x1="${x}" y1="${y1}" x2="${x}" y2="${y2}"
            stroke="${genes[i].color}" stroke-width="2" opacity="0.5"/>
    `;
  }

  svg += '</svg>';

  // Legend
  const legend = genes.map(g => `
    <div class="dna-gene">
      <div class="dna-gene-color" style="background: ${g.color}"></div>
      <span class="dna-gene-label">${g.trait}</span>
      <span class="dna-gene-value">${g.value}%</span>
    </div>
  `).join('');

  return `
    <div class="dna-container">
      <div class="dna-helix">${svg}</div>
      <div class="dna-legend">${legend}</div>
    </div>
  `;
}

function hashString(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash = hash & hash;
  }
  return Math.abs(hash);
}
```

**CSS**:
```css
.dna-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 20px;
}

.dna-helix {
  background: linear-gradient(135deg, #faf5ff 0%, #f3e8ff 100%);
  border-radius: 12px;
  padding: 20px;
}

.dna-legend {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  width: 100%;
}

.dna-gene {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px;
  background: white;
  border-radius: 8px;
}

.dna-gene-color {
  width: 16px;
  height: 16px;
  border-radius: 50%;
}

.dna-gene-label {
  flex: 1;
  font-size: 14px;
  font-weight: 600;
}

.dna-gene-value {
  font-size: 14px;
  color: #64748b;
}
```

---

### Feature #3: Famous Name Constellation

**Section Number**: 6
**Accordion ID**: `section_6_constellation`
**Default State**: Expanded

**Algorithm**:
```javascript
function generateConstellation(historicFigures, famousPeople) {
  const allFigures = [...historicFigures, ...famousPeople];
  if (allFigures.length === 0) return '';

  const width = 400;
  const height = 400;

  // Position stars (figures) in constellation
  const stars = allFigures.map((figure, i) => {
    const angle = (i / allFigures.length) * Math.PI * 2;
    const radius = 120 + Math.random() * 60;
    const x = width / 2 + Math.cos(angle) * radius;
    const y = height / 2 + Math.sin(angle) * radius;
    const size = figure.impactScore ? figure.impactScore / 10 : 8;

    return { ...figure, x, y, size };
  });

  // Generate SVG
  let svg = `<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">`;

  // Background gradient
  svg += `
    <defs>
      <radialGradient id="space-gradient">
        <stop offset="0%" stop-color="#1e293b"/>
        <stop offset="100%" stop-color="#0f172a"/>
      </radialGradient>
    </defs>
    <rect width="${width}" height="${height}" fill="url(#space-gradient)"/>
  `;

  // Connection lines (connect adjacent stars)
  for (let i = 0; i < stars.length - 1; i++) {
    svg += `
      <line x1="${stars[i].x}" y1="${stars[i].y}"
            x2="${stars[i + 1].x}" y2="${stars[i + 1].y}"
            stroke="#475569" stroke-width="1" opacity="0.3"/>
    `;
  }

  // Stars
  stars.forEach(star => {
    svg += `
      <circle cx="${star.x}" cy="${star.y}" r="${star.size}"
              fill="#fbbf24" class="star" data-name="${star.name}">
        <animate attributeName="opacity" values="0.7;1;0.7"
                 dur="${2 + Math.random()}s" repeatCount="indefinite"/>
      </circle>
    `;
  });

  svg += '</svg>';

  return `
    <div class="constellation-container">
      <div class="constellation-canvas">${svg}</div>
      <p class="constellation-legend">
        ⭐ Larger stars = greater historical impact
      </p>
    </div>
  `;
}
```

**CSS**:
```css
.constellation-container {
  padding: 20px;
  background: #0f172a;
  border-radius: 12px;
}

.constellation-canvas {
  margin: 0 auto;
  max-width: 400px;
}

.constellation-legend {
  text-align: center;
  color: #94a3b8;
  font-size: 13px;
  margin-top: 12px;
}

.star {
  cursor: pointer;
  transition: transform 0.3s;
}

.star:hover {
  transform: scale(1.5);
}
```

---

### Feature #7: Character Archetype Wheel

**Section Number**: 10
**Accordion ID**: `section_10_archetype_wheel`
**Default State**: Collapsed

**Algorithm**:
```javascript
function generateArchetypeWheel(historicFigures, famousPeople) {
  const allFigures = [...historicFigures, ...famousPeople];

  // Categorize by archetype
  const archetypes = {
    'Leaders': 0,
    'Artists': 0,
    'Scientists': 0,
    'Spiritual': 0,
    'Warriors': 0,
    'Others': 0
  };

  allFigures.forEach(figure => {
    const category = figure.category.toLowerCase();
    if (category.includes('leader') || category.includes('king') || category.includes('president')) {
      archetypes.Leaders++;
    } else if (category.includes('artist') || category.includes('writer') || category.includes('musician')) {
      archetypes.Artists++;
    } else if (category.includes('scientist') || category.includes('inventor')) {
      archetypes.Scientists++;
    } else if (category.includes('saint') || category.includes('religious') || category.includes('philosopher')) {
      archetypes.Spiritual++;
    } else if (category.includes('warrior') || category.includes('general')) {
      archetypes.Warriors++;
    } else {
      archetypes.Others++;
    }
  });

  const total = allFigures.length;
  const percentages = Object.entries(archetypes).map(([key, value]) => ({
    label: key,
    percent: Math.round((value / total) * 100),
    count: value
  }));

  // Generate pie chart SVG
  const size = 300;
  const radius = 120;
  const centerX = size / 2;
  const centerY = size / 2;

  const colors = {
    'Leaders': '#ef4444',
    'Artists': '#f59e0b',
    'Scientists': '#10b981',
    'Spiritual': '#8b5cf6',
    'Warriors': '#06b6d4',
    'Others': '#64748b'
  };

  let cumulativePercent = 0;
  const slices = percentages.map(p => {
    const startAngle = (cumulativePercent / 100) * 2 * Math.PI - Math.PI / 2;
    const endAngle = ((cumulativePercent + p.percent) / 100) * 2 * Math.PI - Math.PI / 2;
    cumulativePercent += p.percent;

    const x1 = centerX + radius * Math.cos(startAngle);
    const y1 = centerY + radius * Math.sin(startAngle);
    const x2 = centerX + radius * Math.cos(endAngle);
    const y2 = centerY + radius * Math.sin(endAngle);

    const largeArc = p.percent > 50 ? 1 : 0;

    return `
      <path d="M ${centerX} ${centerY} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z"
            fill="${colors[p.label]}" opacity="0.8" class="wheel-slice">
        <animate attributeName="opacity" values="0.8;0.9;0.8" dur="3s" repeatCount="indefinite"/>
      </path>
    `;
  }).join('');

  const svg = `
    <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
      ${slices}
      <circle cx="${centerX}" cy="${centerY}" r="50" fill="white" opacity="0.9"/>
      <text x="${centerX}" y="${centerY}" text-anchor="middle"
            dy="0.3em" font-size="14" font-weight="700" fill="#1e293b">
        ${total} Total
      </text>
    </svg>
  `;

  const legend = percentages.filter(p => p.count > 0).map(p => `
    <div class="wheel-legend-item">
      <div class="wheel-legend-color" style="background: ${colors[p.label]}"></div>
      <span class="wheel-legend-label">${p.label}</span>
      <span class="wheel-legend-value">${p.percent}%</span>
    </div>
  `).join('');

  return `
    <div class="archetype-wheel-container">
      <div class="wheel-chart">${svg}</div>
      <div class="wheel-legend">${legend}</div>
    </div>
  `;
}
```

**CSS**:
```css
.archetype-wheel-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  padding: 20px;
}

.wheel-chart {
  background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
  border-radius: 50%;
  padding: 10px;
}

.wheel-slice {
  cursor: pointer;
  transition: opacity 0.3s;
}

.wheel-slice:hover {
  opacity: 1 !important;
}

.wheel-legend {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  width: 100%;
}

.wheel-legend-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px;
  background: white;
  border-radius: 6px;
}

.wheel-legend-color {
  width: 14px;
  height: 14px;
  border-radius: 3px;
}

.wheel-legend-label {
  flex: 1;
  font-size: 13px;
  font-weight: 600;
}

.wheel-legend-value {
  font-size: 13px;
  color: #64748b;
}
```

---

### Feature #11: Name Numerology Mandala

**Section Number**: 13
**Accordion ID**: `section_13_numerology`
**Default State**: Collapsed

**Algorithm**:
```javascript
function generateNumerologyMandala(nameData) {
  // Calculate numerology number
  const letterValues = {
    a:1, b:2, c:3, d:4, e:5, f:6, g:7, h:8, i:9,
    j:1, k:2, l:3, m:4, n:5, o:6, p:7, q:8, r:9,
    s:1, t:2, u:3, v:4, w:5, x:6, y:7, z:8
  };

  const name = nameData.name.toLowerCase();
  let sum = 0;
  let calculation = [];

  for (let char of name) {
    if (letterValues[char]) {
      sum += letterValues[char];
      calculation.push(`${char.toUpperCase()}(${letterValues[char]})`);
    }
  }

  // Reduce to single digit
  while (sum > 9) {
    const digits = sum.toString().split('');
    sum = digits.reduce((acc, d) => acc + parseInt(d), 0);
  }

  const lifePathNumber = sum;

  // Numerology meanings
  const meanings = {
    1: { trait: 'Leader', desc: 'Independent, ambitious, pioneering' },
    2: { trait: 'Diplomat', desc: 'Cooperative, balanced, sensitive' },
    3: { trait: 'Creative', desc: 'Expressive, optimistic, social' },
    4: { trait: 'Builder', desc: 'Practical, loyal, hardworking' },
    5: { trait: 'Explorer', desc: 'Adventurous, versatile, freedom-loving' },
    6: { trait: 'Nurturer', desc: 'Caring, responsible, harmonious' },
    7: { trait: 'Seeker', desc: 'Analytical, spiritual, introspective' },
    8: { trait: 'Achiever', desc: 'Ambitious, organized, successful' },
    9: { trait: 'Humanitarian', desc: 'Compassionate, generous, idealistic' }
  };

  const meaning = meanings[lifePathNumber];

  // Generate mandala SVG based on number
  const mandala = generateMandalaPattern(lifePathNumber);

  return `
    <div class="numerology-container">
      <div class="numerology-result">
        <div class="life-path-number">${lifePathNumber}</div>
        <div class="life-path-trait">${meaning.trait}</div>
      </div>
      <div class="numerology-mandala">${mandala}</div>
      <div class="numerology-description">
        <p><strong>Calculation:</strong> ${calculation.join(' + ')} = ${calculation.length > 1 ? calculation.reduce((acc, c) => acc + parseInt(c.match(/\d+/)[0]), 0) : letterValues[name[0]]}</p>
        <p><strong>Personality:</strong> ${meaning.desc}</p>
      </div>
    </div>
  `;
}

function generateMandalaPattern(number) {
  const size = 300;
  const center = size / 2;
  const layers = number;

  let svg = `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">`;

  // Background circle
  svg += `<circle cx="${center}" cy="${center}" r="${size/2}" fill="#faf5ff"/>`;

  // Generate concentric patterns based on number
  for (let layer = 1; layer <= layers; layer++) {
    const radius = (layer / layers) * (size / 2 - 20);
    const petals = number * layer;

    for (let i = 0; i < petals; i++) {
      const angle = (i / petals) * Math.PI * 2;
      const x = center + radius * Math.cos(angle);
      const y = center + radius * Math.sin(angle);
      const petalSize = 8 - layer;

      svg += `
        <circle cx="${x}" cy="${y}" r="${petalSize}"
                fill="#8b5cf6" opacity="${0.2 + (layer / layers) * 0.6}">
          <animate attributeName="opacity"
                   values="${0.2 + (layer / layers) * 0.6};${0.4 + (layer / layers) * 0.6};${0.2 + (layer / layers) * 0.6}"
                   dur="${3 + layer}s" repeatCount="indefinite"/>
        </circle>
      `;
    }
  }

  // Center circle with number
  svg += `
    <circle cx="${center}" cy="${center}" r="40" fill="white" opacity="0.95"/>
    <text x="${center}" y="${center}" text-anchor="middle" dy="0.35em"
          font-size="48" font-weight="700" fill="#8b5cf6">${number}</text>
  `;

  svg += '</svg>';
  return svg;
}
```

---

### Feature #13: Name Strength Meter

**Section Number**: 11
**Accordion ID**: `section_11_strength_meter`
**Default State**: Collapsed

**Algorithm**:
```javascript
function generateStrengthMeter(historicFigures, famousPeople) {
  const allFigures = [...historicFigures, ...famousPeople];

  // Calculate strength scores based on achievements
  const scores = {
    leadership: 0,
    creativity: 0,
    wisdom: 0,
    courage: 0,
    influence: 0
  };

  allFigures.forEach(figure => {
    const category = figure.category.toLowerCase();
    const achievements = figure.achievements?.length || 0;
    const significance = figure.significance?.length || 0;

    // Leadership score
    if (category.includes('leader') || category.includes('king') || category.includes('president')) {
      scores.leadership += 10 + achievements * 2;
    }

    // Creativity score
    if (category.includes('artist') || category.includes('writer') || category.includes('musician')) {
      scores.creativity += 10 + achievements * 2;
    }

    // Wisdom score
    if (category.includes('philosopher') || category.includes('scientist') || category.includes('scholar')) {
      scores.wisdom += 10 + achievements * 2;
    }

    // Courage score
    if (category.includes('warrior') || category.includes('explorer') || category.includes('revolutionary')) {
      scores.courage += 10 + achievements * 2;
    }

    // Influence score (based on impact)
    scores.influence += significance / 10;
  });

  // Normalize to 0-100 scale
  Object.keys(scores).forEach(key => {
    scores[key] = Math.min(100, Math.round(scores[key]));
  });

  // Generate meter bars
  const meters = Object.entries(scores).map(([key, value]) => `
    <div class="strength-meter-row">
      <div class="strength-label">${key.charAt(0).toUpperCase() + key.slice(1)}</div>
      <div class="strength-bar-container">
        <div class="strength-bar" style="width: ${value}%">
          <span class="strength-value">${value}</span>
        </div>
      </div>
    </div>
  `).join('');

  return `
    <div class="strength-meter-container">
      ${meters}
      <p class="strength-note">Based on ${allFigures.length} historical figures and famous people</p>
    </div>
  `;
}
```

**CSS**:
```css
.strength-meter-container {
  padding: 16px;
}

.strength-meter-row {
  margin-bottom: 16px;
}

.strength-label {
  font-size: 14px;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 6px;
}

.strength-bar-container {
  background: #e2e8f0;
  border-radius: 8px;
  height: 28px;
  position: relative;
  overflow: hidden;
}

.strength-bar {
  height: 100%;
  background: linear-gradient(90deg, #3b82f6, #8b5cf6);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding-right: 12px;
  transition: width 1s ease-out;
}

.strength-value {
  font-size: 13px;
  font-weight: 700;
  color: white;
}

.strength-note {
  font-size: 12px;
  color: #64748b;
  margin-top: 12px;
  text-align: center;
}
```

---

### Feature #14: Quote Gallery Carousel

**Section Number**: 9
**Accordion ID**: `section_9_quotes_carousel`
**Default State**: Expanded

**Algorithm**:
```javascript
function generateQuoteCarousel(famousQuotes, characterQuotes) {
  const allQuotes = [
    ...famousQuotes.map(q => ({ ...q, type: 'famous' })),
    ...characterQuotes.map(q => ({ ...q, type: 'character' }))
  ];

  if (allQuotes.length === 0) return '';

  const carouselId = 'quote-carousel-' + Math.random().toString(36).substr(2, 9);

  const slides = allQuotes.map((quote, index) => `
    <div class="carousel-slide ${index === 0 ? 'active' : ''}" data-index="${index}">
      <div class="quote-card">
        <div class="quote-icon">"</div>
        <p class="quote-text">${quote.quote || quote.text}</p>
        <div class="quote-author">
          <span class="author-name">— ${quote.author || quote.character}</span>
          ${quote.context ? `<span class="quote-context">${quote.context}</span>` : ''}
        </div>
        <div class="quote-badge ${quote.type}">${quote.type === 'famous' ? 'Real Quote' : 'Character Quote'}</div>
      </div>
    </div>
  `).join('');

  return `
    <div class="carousel-container" id="${carouselId}">
      <div class="carousel-track">
        ${slides}
      </div>
      <div class="carousel-controls">
        <button class="carousel-btn prev" onclick="carouselPrev('${carouselId}')">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="15 18 9 12 15 6"></polyline>
          </svg>
        </button>
        <div class="carousel-dots">
          ${allQuotes.map((_, i) => `
            <button class="carousel-dot ${i === 0 ? 'active' : ''}"
                    onclick="carouselGoTo('${carouselId}', ${i})"></button>
          `).join('')}
        </div>
        <button class="carousel-btn next" onclick="carouselNext('${carouselId}')">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="9 18 15 12 9 6"></polyline>
          </svg>
        </button>
      </div>
    </div>

    <script>
      let currentSlide = 0;

      function carouselNext(id) {
        const container = document.getElementById(id);
        const slides = container.querySelectorAll('.carousel-slide');
        const dots = container.querySelectorAll('.carousel-dot');

        slides[currentSlide].classList.remove('active');
        dots[currentSlide].classList.remove('active');

        currentSlide = (currentSlide + 1) % slides.length;

        slides[currentSlide].classList.add('active');
        dots[currentSlide].classList.add('active');
      }

      function carouselPrev(id) {
        const container = document.getElementById(id);
        const slides = container.querySelectorAll('.carousel-slide');
        const dots = container.querySelectorAll('.carousel-dot');

        slides[currentSlide].classList.remove('active');
        dots[currentSlide].classList.remove('active');

        currentSlide = (currentSlide - 1 + slides.length) % slides.length;

        slides[currentSlide].classList.add('active');
        dots[currentSlide].classList.add('active');
      }

      function carouselGoTo(id, index) {
        const container = document.getElementById(id);
        const slides = container.querySelectorAll('.carousel-slide');
        const dots = container.querySelectorAll('.carousel-dot');

        slides[currentSlide].classList.remove('active');
        dots[currentSlide].classList.remove('active');

        currentSlide = index;

        slides[currentSlide].classList.add('active');
        dots[currentSlide].classList.add('active');
      }
    </script>
  `;
}
```

**CSS**:
```css
.carousel-container {
  padding: 20px;
  position: relative;
}

.carousel-track {
  position: relative;
  min-height: 250px;
}

.carousel-slide {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  opacity: 0;
  transform: translateX(100%);
  transition: all 0.5s ease;
  pointer-events: none;
}

.carousel-slide.active {
  opacity: 1;
  transform: translateX(0);
  pointer-events: auto;
  position: relative;
}

.quote-card {
  background: linear-gradient(135deg, #faf5ff 0%, #f3e8ff 100%);
  border-radius: 16px;
  padding: 24px;
  border-left: 4px solid #8b5cf6;
  position: relative;
}

.quote-icon {
  font-size: 48px;
  color: #8b5cf6;
  opacity: 0.2;
  position: absolute;
  top: 10px;
  left: 20px;
  font-family: Georgia, serif;
}

.quote-text {
  font-size: 18px;
  line-height: 1.7;
  color: #1e293b;
  font-style: italic;
  margin: 30px 0 16px 0;
  position: relative;
  z-index: 1;
}

.quote-author {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.author-name {
  font-size: 15px;
  font-weight: 600;
  color: #475569;
}

.quote-context {
  font-size: 13px;
  color: #64748b;
}

.quote-badge {
  position: absolute;
  top: 16px;
  right: 16px;
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
}

.quote-badge.famous {
  background: #dbeafe;
  color: #1e40af;
}

.quote-badge.character {
  background: #fef3c7;
  color: #92400e;
}

.carousel-controls {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  margin-top: 20px;
}

.carousel-btn {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 2px solid #8b5cf6;
  background: white;
  color: #8b5cf6;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s;
}

.carousel-btn:hover {
  background: #8b5cf6;
  color: white;
}

.carousel-dots {
  display: flex;
  gap: 8px;
}

.carousel-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  border: 2px solid #cbd5e1;
  background: transparent;
  cursor: pointer;
  transition: all 0.3s;
}

.carousel-dot.active {
  background: #8b5cf6;
  border-color: #8b5cf6;
}
```

---

### Feature #17: Name Origins Journey

**Section Number**: 14
**Accordion ID**: `section_14_origins_journey`
**Default State**: Collapsed

**HTML Structure**:
```html
<div class="origins-journey-container">
  <div class="journey-path">
    <div class="journey-step" data-step="1">
      <div class="step-circle">1</div>
      <div class="step-content">
        <div class="step-language">Aramaic</div>
        <div class="step-word">Ta'oma</div>
        <div class="step-meaning">Twin</div>
        <div class="step-era">~500 BCE</div>
      </div>
    </div>
    <!-- More steps generated by JS -->
  </div>
</div>
```

**CSS**:
```css
.origins-journey-container {
  padding: 20px;
}

.journey-path {
  display: flex;
  flex-direction: column;
  gap: 20px;
  position: relative;
}

.journey-path::before {
  content: '';
  position: absolute;
  left: 20px;
  top: 30px;
  bottom: 30px;
  width: 3px;
  background: linear-gradient(to bottom, #3b82f6, #8b5cf6, #ec4899);
}

.journey-step {
  display: flex;
  gap: 16px;
  position: relative;
  z-index: 1;
}

.step-circle {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, #3b82f6, #8b5cf6);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  flex-shrink: 0;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

.step-content {
  flex: 1;
  background: white;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.step-language {
  font-size: 14px;
  font-weight: 700;
  color: #8b5cf6;
  margin-bottom: 4px;
}

.step-word {
  font-size: 20px;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 4px;
}

.step-meaning {
  font-size: 14px;
  color: #64748b;
  margin-bottom: 6px;
}

.step-era {
  font-size: 12px;
  color: #94a3b8;
  font-style: italic;
}
```

---

### Feature #19: Name Achievement Badges

**Section Number**: 15
**Accordion ID**: `section_15_badges`
**Default State**: Collapsed

**Badge Criteria**:
```javascript
function generateAchievementBadges(nameData) {
  const badges = [];

  // Historical Heavyweight (5+ historical figures)
  if (nameData.historicFigures.length >= 5) {
    badges.push({
      title: 'Historical Heavyweight',
      icon: '🏛️',
      description: `${nameData.historicFigures.length} historical figures`,
      color: '#ef4444'
    });
  }

  // Pop Culture Icon (10+ movies/TV appearances)
  const popCount = (nameData.moviesAndShows?.length || 0) + (nameData.songs?.length || 0);
  if (popCount >= 10) {
    badges.push({
      title: 'Pop Culture Icon',
      icon: '🎬',
      description: `${popCount} movie/TV/song appearances`,
      color: '#f59e0b'
    });
  }

  // International Star (15+ variations)
  if (nameData.variations.length >= 15) {
    badges.push({
      title: 'International Star',
      icon: '🌍',
      description: `${nameData.variations.length} language variations`,
      color: '#10b981'
    });
  }

  // Religious Significance
  if (nameData.religiousSignificance) {
    badges.push({
      title: 'Sacred Name',
      icon: '✨',
      description: 'Strong religious significance',
      color: '#8b5cf6'
    });
  }

  // Ancient Origin
  const ancientOrigins = ['Hebrew', 'Greek', 'Latin', 'Aramaic', 'Sanskrit'];
  if (ancientOrigins.includes(nameData.origin)) {
    badges.push({
      title: 'Ancient Roots',
      icon: '🏺',
      description: `${nameData.origin} origin`,
      color: '#06b6d4'
    });
  }

  // Timeless Classic (high rank consistency)
  if (nameData.rank && nameData.rank <= 100) {
    badges.push({
      title: 'Timeless Classic',
      icon: '💎',
      description: `Top ${nameData.rank} name`,
      color: '#ec4899'
    });
  }

  return badges.map(badge => `
    <div class="achievement-badge" style="border-color: ${badge.color}">
      <div class="badge-icon">${badge.icon}</div>
      <div class="badge-content">
        <div class="badge-title" style="color: ${badge.color}">${badge.title}</div>
        <div class="badge-description">${badge.description}</div>
      </div>
    </div>
  `).join('');
}
```

**CSS**:
```css
.badges-container {
  display: grid;
  grid-template-columns: 1fr;
  gap: 12px;
  padding: 16px;
}

.achievement-badge {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: white;
  border-radius: 12px;
  border-left: 4px solid;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  transition: all 0.3s;
}

.achievement-badge:hover {
  transform: translateX(4px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.12);
}

.badge-icon {
  font-size: 32px;
  line-height: 1;
}

.badge-content {
  flex: 1;
}

.badge-title {
  font-size: 15px;
  font-weight: 700;
  margin-bottom: 2px;
}

.badge-description {
  font-size: 13px;
  color: #64748b;
}
```

---

### Feature #20: Personality Word Cloud

**Section Number**: 16
**Accordion ID**: `section_16_wordcloud`
**Default State**: Collapsed

**Algorithm**:
```javascript
function generateWordCloud(nameData) {
  // Extract keywords from various fields
  const keywords = new Map();

  // From meaning
  const meaningWords = nameData.meaning.toLowerCase().split(/\s+/);
  meaningWords.forEach(word => {
    if (word.length > 3) {
      keywords.set(word, (keywords.get(word) || 0) + 5);
    }
  });

  // From cultural significance
  if (nameData.culturalSignificance?.significance) {
    const sigWords = extractKeywords(nameData.culturalSignificance.significance);
    sigWords.forEach(word => {
      keywords.set(word, (keywords.get(word) || 0) + 3);
    });
  }

  // From personality traits
  if (nameData.personalityTraits) {
    nameData.personalityTraits.forEach(trait => {
      keywords.set(trait.toLowerCase(), (keywords.get(trait.toLowerCase()) || 0) + 4);
    });
  }

  // From historical figures
  nameData.historicFigures.forEach(figure => {
    const category = figure.category.toLowerCase().split(/[\/\s]+/);
    category.forEach(cat => {
      if (cat.length > 4) {
        keywords.set(cat, (keywords.get(cat) || 0) + 2);
      }
    });
  });

  // Sort by frequency
  const sortedKeywords = Array.from(keywords.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20); // Top 20 keywords

  // Generate word cloud HTML
  const maxFreq = sortedKeywords[0][1];

  const words = sortedKeywords.map(([word, freq], index) => {
    const size = 12 + (freq / maxFreq) * 24; // 12-36px
    const opacity = 0.5 + (freq / maxFreq) * 0.5; // 0.5-1.0
    const rotation = (Math.random() - 0.5) * 30; // -15 to +15 degrees
    const color = getWordColor(index);

    return `
      <span class="cloud-word"
            style="font-size: ${size}px;
                   opacity: ${opacity};
                   transform: rotate(${rotation}deg);
                   color: ${color}">
        ${word}
      </span>
    `;
  }).join('');

  return `
    <div class="wordcloud-container">
      ${words}
    </div>
  `;
}

function extractKeywords(text) {
  // Simple keyword extraction
  const commonWords = ['the', 'and', 'for', 'with', 'from', 'this', 'that', 'have', 'been'];
  return text.toLowerCase()
    .replace(/[.,;:!?]/g, '')
    .split(/\s+/)
    .filter(word => word.length > 4 && !commonWords.includes(word));
}

function getWordColor(index) {
  const colors = ['#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899'];
  return colors[index % colors.length];
}
```

**CSS**:
```css
.wordcloud-container {
  min-height: 200px;
  background: linear-gradient(135deg, #f0f9ff 0%, #faf5ff 100%);
  border-radius: 16px;
  padding: 30px;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: 16px;
}

.cloud-word {
  font-weight: 700;
  cursor: default;
  transition: all 0.3s;
  line-height: 1;
  padding: 4px 8px;
}

.cloud-word:hover {
  opacity: 1 !important;
  transform: scale(1.2) rotate(0deg) !important;
}
```

---

### Feature #5: Cultural Journey Map

**Section Number**: 17
**Accordion ID**: `section_17_cultural_map`
**Default State**: Collapsed

**Algorithm**:
```javascript
function generateCulturalJourneyMap(nameData) {
  // Map variations to regions
  const regions = {
    'Europe': [],
    'Asia': [],
    'Middle East': [],
    'Americas': [],
    'Africa': []
  };

  // Language to region mapping
  const languageRegions = {
    'Spanish': 'Americas',
    'Portuguese': 'Americas',
    'French': 'Europe',
    'German': 'Europe',
    'Italian': 'Europe',
    'Russian': 'Europe',
    'Arabic': 'Middle East',
    'Hebrew': 'Middle East',
    'Chinese': 'Asia',
    'Japanese': 'Asia',
    'Korean': 'Asia',
    'Hindi': 'Asia',
    'Swahili': 'Africa'
  };

  nameData.variations.forEach(variation => {
    const lang = variation.language || 'Unknown';
    const region = languageRegions[lang] || 'Europe';
    regions[region].push(variation);
  });

  // Generate map HTML (simplified world map with pins)
  const map = `
    <div class="cultural-map">
      <div class="map-region" data-region="Europe">
        <div class="region-name">Europe</div>
        <div class="region-count">${regions.Europe.length}</div>
      </div>
      <div class="map-region" data-region="Asia">
        <div class="region-name">Asia</div>
        <div class="region-count">${regions.Asia.length}</div>
      </div>
      <div class="map-region" data-region="Middle East">
        <div class="region-name">Middle East</div>
        <div class="region-count">${regions['Middle East'].length}</div>
      </div>
      <div class="map-region" data-region="Americas">
        <div class="region-name">Americas</div>
        <div class="region-count">${regions.Americas.length}</div>
      </div>
      <div class="map-region" data-region="Africa">
        <div class="region-name">Africa</div>
        <div class="region-count">${regions.Africa.length}</div>
      </div>
    </div>
  `;

  // Generate variations list by region
  const variationsList = Object.entries(regions)
    .filter(([_, vars]) => vars.length > 0)
    .map(([region, vars]) => `
      <div class="region-variations">
        <h4 class="region-title">${region}</h4>
        <div class="variations-list">
          ${vars.map(v => `<span class="variation-chip">${v.name} (${v.language})</span>`).join('')}
        </div>
      </div>
    `).join('');

  return `
    ${map}
    <div class="regions-list">
      ${variationsList}
    </div>
  `;
}
```

**CSS**:
```css
.cultural-map {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  padding: 20px;
  background: linear-gradient(135deg, #e0f2fe 0%, #dbeafe 100%);
  border-radius: 12px;
  margin-bottom: 20px;
}

.map-region {
  background: white;
  border-radius: 8px;
  padding: 16px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s;
  border: 2px solid transparent;
}

.map-region:hover {
  border-color: #3b82f6;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.2);
}

.region-name {
  font-size: 13px;
  font-weight: 600;
  color: #475569;
  margin-bottom: 6px;
}

.region-count {
  font-size: 24px;
  font-weight: 700;
  color: #3b82f6;
}

.regions-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.region-variations {
  background: white;
  border-radius: 8px;
  padding: 12px;
}

.region-title {
  font-size: 14px;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 8px;
}

.variations-list {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.variation-chip {
  background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
  color: #1e40af;
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
}
```

---

### Feature #18: Celestial Harmony (Astrology)

**Section Number**: 18
**Accordion ID**: `section_18_celestial_harmony`
**Default State**: Collapsed

**Description**:
A beautiful astrology feature combining zodiac distribution, elemental balance, planetary influence, and lucky celestial attributes. Uses the website's pastel color palette (#D8B2F2, #FFB3D9, #B3D9FF) for a dreamy, harmonious aesthetic.

**Sub-Components**:
1. Zodiac Distribution Wheel (based on historical figures' birth months)
2. Elemental Balance Chart (Fire/Earth/Air/Water pie chart)
3. Planetary Ruler (dominant planet for this name)
4. Lucky Celestial Attributes (numbers, colors, gemstones, days)
5. Astrological Personality Traits

**Algorithm**:
```javascript
function generateCelestialHarmony(nameData) {
  // 1. Calculate zodiac distribution from historical figures
  const zodiacDistribution = calculateZodiacDistribution(nameData.historicFigures);

  // 2. Calculate elemental balance
  const elements = calculateElementalBalance(zodiacDistribution);

  // 3. Determine planetary ruler
  const planetaryRuler = determinePlanetaryRuler(elements, nameData);

  // 4. Generate lucky attributes
  const luckyAttributes = generateLuckyAttributes(nameData, planetaryRuler);

  // 5. Extract astrological traits
  const traits = extractAstrologicalTraits(zodiacDistribution);

  return `
    <div class="celestial-harmony-container">
      <div class="astrology-intro">
        <p class="astrology-tagline">✨ Discover the cosmic energy of ${nameData.name}</p>
      </div>

      <!-- Zodiac Distribution Wheel -->
      ${generateZodiacWheel(zodiacDistribution)}

      <!-- Elemental Balance -->
      ${generateElementalBalance(elements)}

      <!-- Planetary Ruler Card -->
      ${generatePlanetaryRulerCard(planetaryRuler)}

      <!-- Lucky Attributes Grid -->
      ${generateLuckyAttributesGrid(luckyAttributes)}

      <!-- Astrological Traits -->
      ${generateAstrologicalTraits(traits)}
    </div>
  `;
}

// Calculate zodiac signs from birth dates
function calculateZodiacDistribution(historicFigures) {
  const zodiacCounts = {
    'Aries': 0, 'Taurus': 0, 'Gemini': 0, 'Cancer': 0,
    'Leo': 0, 'Virgo': 0, 'Libra': 0, 'Scorpio': 0,
    'Sagittarius': 0, 'Capricorn': 0, 'Aquarius': 0, 'Pisces': 0
  };

  historicFigures.forEach(figure => {
    // Parse birth date from years (e.g., "1225-1274" → extract month if available)
    // For MVP: Use name-based distribution or assume even spread
    // In production: Parse actual birth dates when available
    const zodiac = inferZodiacFromName(figure.name); // fallback logic
    if (zodiac) zodiacCounts[zodiac]++;
  });

  return zodiacCounts;
}

// Calculate elemental balance from zodiac distribution
function calculateElementalBalance(zodiacDistribution) {
  const elements = { Fire: 0, Earth: 0, Air: 0, Water: 0 };

  const zodiacElements = {
    'Aries': 'Fire', 'Leo': 'Fire', 'Sagittarius': 'Fire',
    'Taurus': 'Earth', 'Virgo': 'Earth', 'Capricorn': 'Earth',
    'Gemini': 'Air', 'Libra': 'Air', 'Aquarius': 'Air',
    'Cancer': 'Water', 'Scorpio': 'Water', 'Pisces': 'Water'
  };

  Object.entries(zodiacDistribution).forEach(([zodiac, count]) => {
    const element = zodiacElements[zodiac];
    elements[element] += count;
  });

  return elements;
}

// Determine planetary ruler based on dominant element and name characteristics
function determinePlanetaryRuler(elements, nameData) {
  const planets = {
    'Sun': { element: 'Fire', traits: ['Leadership', 'Vitality', 'Confidence'], color: '#FFB3D9' },
    'Moon': { element: 'Water', traits: ['Intuition', 'Emotion', 'Nurturing'], color: '#F0E0FF' },
    'Mercury': { element: 'Air', traits: ['Communication', 'Intelligence', 'Adaptability'], color: '#B3D9FF' },
    'Venus': { element: 'Earth', traits: ['Love', 'Beauty', 'Harmony'], color: '#E0FFF0' },
    'Mars': { element: 'Fire', traits: ['Action', 'Courage', 'Passion'], color: '#FFB3D9' },
    'Jupiter': { element: 'Fire', traits: ['Expansion', 'Wisdom', 'Optimism'], color: '#FFB3D9' },
    'Saturn': { element: 'Earth', traits: ['Discipline', 'Structure', 'Responsibility'], color: '#E0FFF0' }
  };

  // Find dominant element
  const dominantElement = Object.entries(elements)
    .sort((a, b) => b[1] - a[1])[0][0];

  // Select planet matching dominant element
  const matchingPlanets = Object.entries(planets)
    .filter(([_, data]) => data.element === dominantElement);

  // Pick based on name characteristics
  const planetName = matchingPlanets[0][0];
  return { name: planetName, ...planets[planetName] };
}

// Generate lucky attributes
function generateLuckyAttributes(nameData, planetaryRuler) {
  const luckyNumber = calculateLuckyNumber(nameData.name);
  const luckyColor = planetaryRuler.color;
  const luckyGemstone = getLuckyGemstone(planetaryRuler.name);
  const luckyDay = getLuckyDay(planetaryRuler.name);

  return { luckyNumber, luckyColor, luckyGemstone, luckyDay };
}

function calculateLuckyNumber(name) {
  // Sum letter values and reduce to single digit
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

function getLuckyGemstone(planet) {
  const gemstones = {
    'Sun': 'Ruby',
    'Moon': 'Moonstone',
    'Mercury': 'Emerald',
    'Venus': 'Diamond',
    'Mars': 'Red Coral',
    'Jupiter': 'Yellow Sapphire',
    'Saturn': 'Blue Sapphire'
  };
  return gemstones[planet] || 'Crystal';
}

function getLuckyDay(planet) {
  const days = {
    'Sun': 'Sunday',
    'Moon': 'Monday',
    'Mercury': 'Wednesday',
    'Venus': 'Friday',
    'Mars': 'Tuesday',
    'Jupiter': 'Thursday',
    'Saturn': 'Saturday'
  };
  return days[planet] || 'Sunday';
}

// Generate zodiac wheel SVG
function generateZodiacWheel(zodiacDistribution) {
  const total = Object.values(zodiacDistribution).reduce((a, b) => a + b, 0);
  if (total === 0) return '<p class="section-text">No zodiac data available</p>';

  const zodiacSigns = [
    { name: 'Aries', symbol: '♈', color: '#FFB3D9' },
    { name: 'Taurus', symbol: '♉', color: '#E0FFF0' },
    { name: 'Gemini', symbol: '♊', color: '#B3D9FF' },
    { name: 'Cancer', symbol: '♋', color: '#F0E0FF' },
    { name: 'Leo', symbol: '♌', color: '#FFB3D9' },
    { name: 'Virgo', symbol: '♍', color: '#E0FFF0' },
    { name: 'Libra', symbol: '♎', color: '#B3D9FF' },
    { name: 'Scorpio', symbol: '♏', color: '#F0E0FF' },
    { name: 'Sagittarius', symbol: '♐', color: '#FFB3D9' },
    { name: 'Capricorn', symbol: '♑', color: '#E0FFF0' },
    { name: 'Aquarius', symbol: '♒', color: '#B3D9FF' },
    { name: 'Pisces', symbol: '♓', color: '#F0E0FF' }
  ];

  const size = 320;
  const center = size / 2;
  const radius = 120;

  let svg = `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">`;

  // Background circle
  svg += `<circle cx="${center}" cy="${center}" r="${radius + 40}"
          fill="url(#zodiac-gradient)" opacity="0.1"/>`;

  // Gradient definition
  svg += `
    <defs>
      <radialGradient id="zodiac-gradient">
        <stop offset="0%" stop-color="#D8B2F2"/>
        <stop offset="50%" stop-color="#FFB3D9"/>
        <stop offset="100%" stop-color="#B3D9FF"/>
      </radialGradient>
    </defs>
  `;

  // Draw zodiac segments
  zodiacSigns.forEach((sign, index) => {
    const angle = (index / 12) * Math.PI * 2 - Math.PI / 2;
    const x = center + radius * Math.cos(angle);
    const y = center + radius * Math.sin(angle);
    const count = zodiacDistribution[sign.name] || 0;
    const percentage = Math.round((count / total) * 100);
    const dotSize = 6 + (percentage / 10); // 6-16px based on percentage

    svg += `
      <g class="zodiac-sign" data-sign="${sign.name}">
        <circle cx="${x}" cy="${y}" r="${dotSize}"
                fill="${sign.color}" opacity="0.8">
          <animate attributeName="opacity" values="0.8;1;0.8"
                   dur="3s" repeatCount="indefinite"/>
        </circle>
        <text x="${x}" y="${y - dotSize - 8}"
              text-anchor="middle" font-size="18" fill="${sign.color}">
          ${sign.symbol}
        </text>
        ${count > 0 ? `
        <text x="${x}" y="${y + dotSize + 16}"
              text-anchor="middle" font-size="11" font-weight="600" fill="#64748b">
          ${percentage}%
        </text>` : ''}
      </g>
    `;
  });

  // Center text
  svg += `
    <circle cx="${center}" cy="${center}" r="50" fill="white" opacity="0.95"/>
    <text x="${center}" y="${center - 8}" text-anchor="middle"
          font-size="13" font-weight="700" fill="#8b5cf6">
      Zodiac
    </text>
    <text x="${center}" y="${center + 10}" text-anchor="middle"
          font-size="13" font-weight="700" fill="#8b5cf6">
      Wheel
    </text>
  `;

  svg += '</svg>';

  return `
    <div class="zodiac-wheel-section">
      <h3 class="subsection-title">🌟 Zodiac Distribution</h3>
      <div class="zodiac-wheel-container">${svg}</div>
      <p class="zodiac-note">Based on ${total} historical figures' birth dates</p>
    </div>
  `;
}

// Generate elemental balance chart
function generateElementalBalance(elements) {
  const total = Object.values(elements).reduce((a, b) => a + b, 0);
  if (total === 0) return '';

  const elementData = [
    { name: 'Fire', emoji: '🔥', color: '#FFB3D9', traits: 'Passion, Energy, Action' },
    { name: 'Earth', emoji: '🌿', color: '#E0FFF0', traits: 'Stability, Practicality, Growth' },
    { name: 'Air', emoji: '💨', color: '#B3D9FF', traits: 'Intellect, Communication, Freedom' },
    { name: 'Water', emoji: '💧', color: '#F0E0FF', traits: 'Emotion, Intuition, Depth' }
  ];

  const bars = elementData.map(elem => {
    const count = elements[elem.name];
    const percentage = Math.round((count / total) * 100);

    return `
      <div class="element-row">
        <div class="element-label">
          <span class="element-emoji">${elem.emoji}</span>
          <span class="element-name">${elem.name}</span>
        </div>
        <div class="element-bar-container">
          <div class="element-bar" style="width: ${percentage}%; background: ${elem.color}">
            <span class="element-percentage">${percentage}%</span>
          </div>
        </div>
        <div class="element-traits">${elem.traits}</div>
      </div>
    `;
  }).join('');

  return `
    <div class="elemental-balance-section">
      <h3 class="subsection-title">⚖️ Elemental Balance</h3>
      <div class="elements-container">
        ${bars}
      </div>
    </div>
  `;
}

// Generate planetary ruler card
function generatePlanetaryRulerCard(planet) {
  const planetEmojis = {
    'Sun': '☀️',
    'Moon': '🌙',
    'Mercury': '☿️',
    'Venus': '♀️',
    'Mars': '♂️',
    'Jupiter': '♃',
    'Saturn': '♄'
  };

  return `
    <div class="planetary-ruler-section">
      <h3 class="subsection-title">🪐 Planetary Ruler</h3>
      <div class="planet-card" style="background: linear-gradient(135deg, ${planet.color}40, ${planet.color}20);">
        <div class="planet-emoji">${planetEmojis[planet.name] || '🌟'}</div>
        <div class="planet-name">${planet.name}</div>
        <div class="planet-element">Element: ${planet.element}</div>
        <div class="planet-traits">
          ${planet.traits.map(t => `<span class="trait-badge">${t}</span>`).join(' ')}
        </div>
      </div>
    </div>
  `;
}

// Generate lucky attributes grid
function generateLuckyAttributesGrid(attributes) {
  return `
    <div class="lucky-attributes-section">
      <h3 class="subsection-title">🍀 Lucky Celestial Attributes</h3>
      <div class="lucky-grid">
        <div class="lucky-card">
          <div class="lucky-icon">🔢</div>
          <div class="lucky-label">Lucky Number</div>
          <div class="lucky-value">${attributes.luckyNumber}</div>
        </div>
        <div class="lucky-card">
          <div class="lucky-icon">🎨</div>
          <div class="lucky-label">Lucky Color</div>
          <div class="lucky-value">
            <div class="color-swatch" style="background: ${attributes.luckyColor}"></div>
          </div>
        </div>
        <div class="lucky-card">
          <div class="lucky-icon">💎</div>
          <div class="lucky-label">Lucky Gemstone</div>
          <div class="lucky-value">${attributes.luckyGemstone}</div>
        </div>
        <div class="lucky-card">
          <div class="lucky-icon">📅</div>
          <div class="lucky-label">Lucky Day</div>
          <div class="lucky-value">${attributes.luckyDay}</div>
        </div>
      </div>
    </div>
  `;
}

// Extract astrological traits from dominant zodiac signs
function extractAstrologicalTraits(zodiacDistribution) {
  const zodiacTraits = {
    'Aries': ['Bold', 'Pioneering', 'Competitive'],
    'Taurus': ['Reliable', 'Patient', 'Devoted'],
    'Gemini': ['Curious', 'Adaptable', 'Witty'],
    'Cancer': ['Nurturing', 'Protective', 'Intuitive'],
    'Leo': ['Confident', 'Generous', 'Charismatic'],
    'Virgo': ['Analytical', 'Practical', 'Helpful'],
    'Libra': ['Diplomatic', 'Fair', 'Social'],
    'Scorpio': ['Passionate', 'Resourceful', 'Mysterious'],
    'Sagittarius': ['Optimistic', 'Adventurous', 'Philosophical'],
    'Capricorn': ['Ambitious', 'Disciplined', 'Responsible'],
    'Aquarius': ['Independent', 'Innovative', 'Humanitarian'],
    'Pisces': ['Compassionate', 'Artistic', 'Intuitive']
  };

  // Get top 3 zodiac signs
  const topSigns = Object.entries(zodiacDistribution)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .filter(([_, count]) => count > 0);

  const traits = new Set();
  topSigns.forEach(([sign, _]) => {
    zodiacTraits[sign].forEach(trait => traits.add(trait));
  });

  return Array.from(traits);
}

function generateAstrologicalTraits(traits) {
  if (traits.length === 0) return '';

  return `
    <div class="astrological-traits-section">
      <h3 class="subsection-title">✨ Astrological Personality</h3>
      <div class="traits-cloud">
        ${traits.map(trait => `<span class="astro-trait">${trait}</span>`).join('')}
      </div>
    </div>
  `;
}
```

**CSS**:
```css
/* Main Container */
.celestial-harmony-container {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.astrology-intro {
  text-align: center;
  padding: 12px;
  background: linear-gradient(135deg, #F0E0FF 0%, #FFE0EC 100%);
  border-radius: 12px;
}

.astrology-tagline {
  font-size: 15px;
  font-weight: 600;
  color: #6b21a8;
  margin: 0;
}

.subsection-title {
  font-size: 16px;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 16px;
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

.zodiac-sign:hover circle {
  r: 18;
  opacity: 1 !important;
}

/* Elemental Balance */
.elemental-balance-section {
  background: white;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
}

.elements-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
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
  font-size: 14px;
  font-weight: 600;
  color: #1e293b;
}

.element-emoji {
  font-size: 18px;
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
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
}

.planet-card {
  padding: 24px;
  border-radius: 12px;
  text-align: center;
}

.planet-emoji {
  font-size: 64px;
  margin-bottom: 12px;
}

.planet-name {
  font-size: 24px;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 8px;
}

.planet-element {
  font-size: 14px;
  color: #64748b;
  margin-bottom: 16px;
}

.planet-traits {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  justify-content: center;
}

.trait-badge {
  background: white;
  padding: 6px 12px;
  border-radius: 16px;
  font-size: 13px;
  font-weight: 600;
  color: #8b5cf6;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

/* Lucky Attributes */
.lucky-attributes-section {
  background: linear-gradient(135deg, #ecfdf5 0%, #f0fdf4 100%);
  border-radius: 16px;
  padding: 20px;
}

.lucky-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.lucky-card {
  background: white;
  padding: 16px;
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
  font-size: 32px;
  margin-bottom: 8px;
}

.lucky-label {
  font-size: 12px;
  color: #64748b;
  margin-bottom: 6px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.lucky-value {
  font-size: 18px;
  font-weight: 700;
  color: #1e293b;
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
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
}

.traits-cloud {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  justify-content: center;
}

.astro-trait {
  background: linear-gradient(135deg, #D8B2F2 0%, #FFB3D9 100%);
  color: white;
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 600;
  box-shadow: 0 2px 6px rgba(216, 178, 242, 0.3);
  transition: all 0.3s;
}

.astro-trait:hover {
  transform: translateY(-2px) scale(1.05);
  box-shadow: 0 4px 12px rgba(216, 178, 242, 0.4);
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
```

**Data Requirements**:
- Historical figures with birth dates (month/day for zodiac calculation)
- Name characteristics for planetary ruler determination
- Existing numerology data can be reused for lucky number

---

## Accordion System Specification

### LocalStorage State Management

**Storage Key**: `nameProfile_accordions`

**Data Structure**:
```javascript
{
  "thomas": {
    "section_5_historical_timeline": true,    // expanded
    "section_6_constellation": false,          // collapsed
    "section_9_quotes_carousel": true,
    "section_10_archetype_wheel": false,
    "section_11_strength_meter": false,
    "section_12_personality_dna": false,
    "section_13_numerology": false,
    "section_14_origins_journey": false,
    "section_15_badges": false,
    "section_16_wordcloud": false,
    "section_17_cultural_map": false,
    "section_18_celestial_harmony": false      // collapsed
  },
  "emma": {
    // ... different state for Emma
  }
}
```

### Accordion Functions

**Core JavaScript**:
```javascript
// Initialize accordion states on page load
function initAccordions(nameLowercase) {
  const savedStates = JSON.parse(localStorage.getItem('nameProfile_accordions') || '{}');
  const nameStates = savedStates[nameLowercase] || {};

  // Apply saved states or defaults
  document.querySelectorAll('.section-content').forEach(content => {
    const sectionId = content.dataset.section;
    const isExpanded = nameStates[sectionId] !== undefined
      ? nameStates[sectionId]
      : getDefaultState(sectionId);

    if (isExpanded) {
      content.style.display = 'block';
      content.previousElementSibling.querySelector('.chevron').classList.add('rotated');
    } else {
      content.style.display = 'none';
    }
  });
}

// Get default state for section
function getDefaultState(sectionId) {
  const expandedByDefault = [
    'section_5_historical_timeline',
    'section_6_constellation',
    'section_9_quotes_carousel'
  ];
  return expandedByDefault.includes(sectionId);
}

// Toggle accordion
function toggleAccordion(sectionId) {
  const content = document.querySelector(`[data-section="${sectionId}"]`);
  const chevron = content.previousElementSibling.querySelector('.chevron');
  const nameLowercase = '${nameData.name.toLowerCase()}';

  // Toggle display
  const isExpanded = content.style.display !== 'none';
  content.style.display = isExpanded ? 'none' : 'block';
  chevron.classList.toggle('rotated');

  // Save state to localStorage
  const savedStates = JSON.parse(localStorage.getItem('nameProfile_accordions') || '{}');
  if (!savedStates[nameLowercase]) savedStates[nameLowercase] = {};
  savedStates[nameLowercase][sectionId] = !isExpanded;
  localStorage.setItem('nameProfile_accordions', JSON.stringify(savedStates));
}

// Initialize on load
window.addEventListener('DOMContentLoaded', () => {
  initAccordions('${nameData.name.toLowerCase()}');
});
```

### Accordion Button Styles

**CSS**:
```css
.section-header {
  cursor: pointer;
  user-select: none;
}

.section-number {
  display: inline-block;
  width: 28px;
  height: 28px;
  background: linear-gradient(135deg, #3b82f6, #8b5cf6);
  color: white;
  border-radius: 50%;
  font-size: 14px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 8px;
}

.accordion-btn {
  background: none;
  border: none;
  cursor: pointer;
  margin-left: auto;
  padding: 8px;
  transition: all 0.3s;
}

.accordion-btn:hover {
  background: rgba(0,0,0,0.05);
  border-radius: 50%;
}

.chevron {
  width: 20px;
  height: 20px;
  transition: transform 0.3s;
}

.chevron.rotated {
  transform: rotate(180deg);
}

.section-content {
  overflow: hidden;
  transition: all 0.3s ease-out;
}
```

---

## Historical Figures Expansion

### Research Requirements

**For Each Name**:
- Minimum: 10 historical figures
- Maximum: 50 historical figures
- Sources: Wikipedia, Behind the Name, Encyclopedia Britannica
- Accuracy: 100% verified data (no invention)

### Expansion Script Plan

**File**: `scripts/expand-historical-figures-v5.js`

**Process**:
1. Load current v4 enrichment data
2. For each name with < 10 figures:
   - Search Wikipedia for "List of people named [name]"
   - Extract notable individuals
   - Verify significance (achievements, impact)
   - Calculate impact score (0-100)
3. Add to v5 schema
4. Save enriched data

**Categories to Include**:
- Leaders (kings, presidents, prime ministers)
- Scientists (inventors, researchers, Nobel laureates)
- Artists (painters, musicians, writers, filmmakers)
- Philosophers (theologians, thinkers)
- Saints (religious figures)
- Athletes (sports legends)
- Explorers (adventurers, astronauts)
- Activists (civil rights, humanitarians)

---

## Implementation Order

### Phase 1: Template Setup (Day 1)
1. ✅ Copy profiletemp2.js → profiletemp3.js
2. ✅ Update header comment with v3 features list
3. ✅ Add section numbering to existing sections
4. ✅ Implement accordion system (HTML + CSS + JS)
5. ✅ Test accordion state persistence

### Phase 2: Data Expansion (Days 2-3)
1. Create v5 schema specification
2. Write expansion script for historical figures
3. Research and add 10-50 figures per name (start with Thomas)
4. Add etymology chains
5. Add phonetic data
6. Add numerology calculations
7. Add name day data

### Phase 3: Feature Implementation - Core Visuals (Days 4-6)
1. **Feature #1**: Historical Timeline Visualization
2. **Feature #3**: Famous Name Constellation
3. **Feature #7**: Character Archetype Wheel

### Phase 4: Feature Implementation - Analyses (Days 7-9)
4. **Feature #2**: Name Personality DNA
5. **Feature #11**: Name Numerology Mandala
6. **Feature #13**: Name Strength Meter
7. **Feature #20**: Personality Word Cloud

### Phase 5: Feature Implementation - Interactive (Days 10-12)
8. **Feature #14**: Quote Gallery Carousel
9. **Feature #17**: Name Origins Journey
10. **Feature #5**: Cultural Journey Map

### Phase 6: Feature Implementation - Gamification (Day 13)
11. **Feature #19**: Name Achievement Badges

### Phase 7: Testing & Refinement (Days 14-15)
1. Test all features with multiple names (Thomas, Emma, John, Olivia)
2. Verify accordion state persistence across names
3. Mobile responsiveness testing
4. Performance optimization
5. Data accuracy verification

### Phase 8: Documentation & Deployment (Day 16)
1. Update PROFILE_TEMPLATE_SYSTEM.md
2. Create V5_ENRICHMENT_SCHEMA.md
3. Update build scripts
4. Test production build
5. Deploy to Vercel

---

## Testing & Validation

### Test Cases

**Accordion Functionality**:
- [ ] Collapsing section saves state to localStorage
- [ ] State persists when switching between names
- [ ] Default states correct (Timeline, Constellation, Quotes expanded)
- [ ] Chevron animation works smoothly
- [ ] Section number displays correctly

**Data Rendering**:
- [ ] Timeline renders with accurate years
- [ ] Constellation shows all figures as stars
- [ ] Archetype wheel percentages add to 100%
- [ ] DNA helix generates unique patterns per name
- [ ] Numerology calculation is correct
- [ ] Strength meter bars animate on load
- [ ] Carousel slides transition smoothly
- [ ] Word cloud sizes correlate to frequency
- [ ] Badges appear based on criteria
- [ ] Cultural map shows correct regions

**Performance**:
- [ ] Page loads in < 2 seconds
- [ ] No layout shift (CLS)
- [ ] Smooth animations (60fps)
- [ ] localStorage doesn't exceed 5MB

**Mobile Responsiveness**:
- [ ] All sections display correctly on 375px width
- [ ] Touch interactions work (carousel, accordions)
- [ ] Text is readable (no horizontal scroll)
- [ ] SVG graphics scale properly

---

## Success Criteria

### Definition of Done

✅ All 11 features implemented and functional
✅ Accordion system with state memory working
✅ All sections numbered 1-18
✅ Historical figures expanded to 10-50 per name
✅ Data 100% accurate (no invented content)
✅ Mobile responsive design
✅ Passes all test cases
✅ Documentation updated
✅ Deployed to production

---

**Created**: 2025-10-24
**Status**: Ready for execution
**Estimated Duration**: 16 days
**Priority**: HIGH

---

## Next Steps

1. **Review this plan** - Confirm all features align with vision
2. **Compact memory** - Create summary for efficient execution
3. **Begin Phase 1** - Template setup and accordion implementation
4. **Iterate** - Build feature by feature, test incrementally

**Ready to proceed?** 🚀
