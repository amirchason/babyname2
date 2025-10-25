# 🎨 Profile Template System

This directory contains reusable profile templates for generating name profile HTML pages.

## 📂 Directory Structure

```
profile-templates/
├── profiletemp1.js     # Baseline template (DO NOT MODIFY)
├── profiletemp2.js     # Working copy for new features
└── README.md           # This file
```

## 🔧 How It Works

### Template Function

All templates export a `generateNameProfile` function:

```javascript
const { generateNameProfile } = require('./profile-templates/profiletemp1.js');

const html = generateNameProfile(nameData, options);
```

**Parameters:**
- `nameData` (Object) - Enriched name data from v4 enrichment
- `options` (Object, optional):
  - `theme` (String): Color theme
    - `'auto'` (default) - Gender-based (pink for female, blue for male)
    - `'pink'` - Force pink/purple theme
    - `'blue'` - Force blue theme

**Returns:** Complete HTML string ready to be saved to file

### Required Data Schema (v4)

```javascript
{
  name: String,
  gender: 'male' | 'female',
  origin: String,
  meaning: String,
  pronunciationGuide: String (IPA),
  culturalSignificance: String,
  modernContext: String,
  literaryReferences: String,
  personality: String,
  symbolism: String,
  funFact: String,

  nicknames: Array<String> (9 items),
  variations: Array<String> (9 unique items),
  similarNames: Array<String> (9 unique items),

  historicFigures: Array<{
    fullName: String,
    years: String (YYYY-YYYY),
    category: String,
    achievements: Array<String>,
    significance: String,
    notableWorks: Array<String> (optional)
  }>,

  religiousSignificance: {
    hasSignificance: Boolean,
    religions: Array<String>,
    character: String,
    significance: String,
    keyStories: Array<String>,
    spiritualMeaning: String
  },

  moviesAndShows: Array<{
    title: String,
    year: Number,
    type: 'Movie' | 'TV Show',
    characterName: String,
    characterDescription: String,
    imdbUrl: String,
    genre: String
  }>,

  songs: Array<{
    title: String,
    artist: String,
    year: Number,
    youtubeSearchUrl: String,
    quote: String
  }>,

  famousPeople: Array<{
    name: String,
    profession: String,
    knownFor: Array<String>,
    imdbUrl: String,
    awards: String
  }>,

  famousQuotes: Array<{
    quote: String,
    person: String,
    context: String
  }>,

  characterQuotes: Array<{
    character: String,
    source: String,
    quoteSummary: String,
    context: String
  }>
}
```

## 🚀 Usage Examples

### Basic Usage (Auto Theme)

```javascript
const fs = require('fs');
const { generateNameProfile } = require('./profile-templates/profiletemp1.js');

// Load enriched data
const nameData = JSON.parse(fs.readFileSync('public/data/enriched/thomas-v4.json', 'utf8'));

// Generate HTML
const html = generateNameProfile(nameData);

// Save to file
fs.writeFileSync('public/thomas-profile.html', html);
```

### Force Pink Theme (Female Style)

```javascript
const html = generateNameProfile(nameData, { theme: 'pink' });
```

### Force Blue Theme (Male Style)

```javascript
const html = generateNameProfile(nameData, { theme: 'blue' });
```

## 📋 Current Template Versions

### profiletemp1.js (Baseline)

**Status:** Locked baseline version
**Last Updated:** 2025-10-24

**Features:**
- Hero section with floating particles
- Stats grid (Meaning + Gender)
- Nicknames section (9 items, 3x3 grid)
- Cultural significance
- Historical figures (5+ with achievements)
- Religious significance (conditional)
- Movies & TV Shows
- Songs
- Famous People
- Famous Quotes
- Character Quotes
- Personality & Symbolism
- Variations (9 items, 3x3 grid)
- Similar Names (9 items, 3x3 grid)
- Gender-adaptive color theming
- V4 enrichment badge
- Mobile-first design (480px max-width)

**DO NOT MODIFY** - Use profiletemp2.js for new features

### profiletemp2.js (Working Copy)

**Status:** Active development
**Last Updated:** 2025-10-24

**Purpose:** Experimenting with new features while maintaining ability to revert to profiletemp1

**Features:** Same as profiletemp1 (for now)

**Planned Enhancements:**
- Timeline Visualization
- Sibling Name Matcher
- Name Day Calendar
- (Add your ideas here!)

## 🔄 Template Versioning Strategy

### When to Create a New Template Version

Create a new template (profiletemp3.js, etc.) when:
1. Major UI redesign (different layout structure)
2. New data schema requirements (v5 enrichment)
3. Alternative style variations (minimalist, maximalist, etc.)

### How to Create a New Template

```bash
# Copy baseline as starting point
cp scripts/profile-templates/profiletemp1.js scripts/profile-templates/profiletemp3.js

# Or copy working version
cp scripts/profile-templates/profiletemp2.js scripts/profile-templates/profiletemp3.js
```

Then update the header comment in the new template.

### Revert to Baseline

If profiletemp2 experiments go wrong:

```bash
# Restore from baseline
cp scripts/profile-templates/profiletemp1.js scripts/profile-templates/profiletemp2.js
```

## 🎨 Theme Customization

Themes are defined in the `colors` object inside `generateNameProfile`:

```javascript
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
  // Blue theme for males
  // ...
};
```

To add a new theme (e.g., neutral):
1. Add new theme option to function parameters
2. Create new color palette
3. Update conditional logic

## 📦 Build Script Integration

Example build script using templates:

```javascript
// scripts/build-NAME-v4-profile.js
const fs = require('fs');
const { generateNameProfile } = require('./profile-templates/profiletemp1.js');

const nameData = JSON.parse(fs.readFileSync('public/data/enriched/NAME-v4.json', 'utf8'));
const html = generateNameProfile(nameData, { theme: 'auto' });

fs.writeFileSync('public/NAME-v4-profile.html', html);
console.log('✅ Profile generated!');
console.log('📋 Template: profiletemp1 (baseline)');
```

## 🐛 Troubleshooting

**Issue:** Template not found
```
Error: Cannot find module './profile-templates/profiletemp1.js'
```
**Fix:** Ensure you're running from `scripts/` directory or adjust relative path

**Issue:** Missing data fields
```
TypeError: Cannot read property 'nicknames' of undefined
```
**Fix:** Ensure your enriched data has all required v4 schema fields

**Issue:** Wrong colors displaying
```
// Male name showing pink theme
```
**Fix:** Check `nameData.gender` value - must be exactly `'male'` or `'female'`

## 📝 Best Practices

1. **Never modify profiletemp1.js directly** - It's the baseline for reverting
2. **Test with both genders** - Ensure theme switching works correctly
3. **Validate data schema** - Check enrichment has all required fields
4. **Document changes** - Update README when adding features to temp2
5. **Use consistent naming** - Build scripts should follow `build-NAME-v4-profile.js` pattern

## 🔗 Related Files

- `scripts/test-v4-enrichment.js` - Generates v4 enriched data
- `scripts/enrich-NAME-v4.js` - Name-specific enrichment runners
- `api/enrich-v4.js` - Cloud-based Vercel enrichment function
- `V4_ENRICHMENT_SYSTEM.md` - V4 enrichment documentation

---

**Last Updated:** 2025-10-24
**Template Version:** 1.0.0
