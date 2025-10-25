# 🎨 Profile Template System - Quick Reference

## ✅ What We Just Created

You now have a **reusable, version-controlled** template system for name profile pages!

## 📂 File Structure

```
scripts/
├── profile-templates/
│   ├── profiletemp1.js         ✅ BASELINE (locked - do not modify)
│   ├── profiletemp2.js         ✅ WORKING COPY (modify freely)
│   └── README.md               ✅ Full documentation
│
├── build-thomas-v4-profile.js  ✅ Now uses profiletemp1
├── build-giana-v4-profile.js   ✅ Now uses profiletemp1
└── test-v4-enrichment.js       (unchanged)
```

## 🚀 Quick Usage

### Build a Profile (Using Baseline Template)

```bash
# Thomas (male, blue theme)
node scripts/build-thomas-v4-profile.js

# Giana (female, pink theme)
node scripts/build-giana-v4-profile.js
```

### Modify Template for New Features

**Option 1: Edit profiletemp2.js directly**
```bash
# Edit the working copy
nano scripts/profile-templates/profiletemp2.js

# Then update build scripts to use temp2:
# const { generateNameProfile } = require('./profile-templates/profiletemp2.js');
```

**Option 2: Create a new build script using temp2**
```javascript
// scripts/build-thomas-v5-experimental.js
const { generateNameProfile } = require('./profile-templates/profiletemp2.js');
// ... rest of build logic
```

### Revert to Baseline (If Things Go Wrong)

```bash
# Restore temp2 from baseline
cp scripts/profile-templates/profiletemp1.js scripts/profile-templates/profiletemp2.js
```

## 🎯 Current Features (profiletemp1 & temp2)

### Layout Sections
1. **Hero** - Name, pronunciation, origin, meaning, V4 badge
2. **Stats Grid** - Meaning + Gender cards
3. **Nicknames** - 9 items in 3x3 grid
4. **Cultural Significance** - 3 paragraphs (significance, modern context, literary)
5. **Historical Figures** - 5+ with achievements, significance, notable works
6. **Religious Significance** - Conditional section with key stories
7. **Movies & TV** - Pop culture references with IMDb links
8. **Songs** - Music references with YouTube links
9. **Famous People** - Current celebrities with awards
10. **Famous Quotes** - Quotes by people with that name
11. **Character Quotes** - Memorable movie/TV quotes
12. **Personality & Symbolism** - Traits + fun fact
13. **Variations** - 9 international variations (3x3 grid)
14. **Similar Names** - 9 similar names (3x3 grid)

### Design Features
- ✅ **Gender-adaptive theming** (pink/purple for female, blue for male)
- ✅ **Floating particle animations** (20 animated particles)
- ✅ **Mobile-first design** (480px max-width, centered)
- ✅ **Hover effects** on all cards
- ✅ **Gradient backgrounds** and shadows
- ✅ **9-9-9 format** (nicknames, variations, similar names)
- ✅ **NO Baby Vibes section** (removed per your request)

## 💡 Next Steps

### Adding WOW Features to profiletemp2

From our brainstorm session, top candidates:

1. **Timeline Visualization**
   - Plot historical figures on a visual timeline
   - CSS-only (no APIs needed!)

2. **Sibling Name Matcher**
   - Show names that pair well as siblings
   - Use similarNames data

3. **Name Day Calendar**
   - Show celebration dates
   - Hard-coded data per name

**To add these:**
1. Edit `scripts/profile-templates/profiletemp2.js`
2. Add new HTML sections + CSS styles
3. Test with a build script
4. If successful, decide whether to replace temp1 or keep both

## 🔄 Version Control Strategy

### profiletemp1 (Baseline)
- **Never modify** - this is your safety net
- Update only when you're 100% happy with temp2 changes
- Copy temp2 → temp1 when promoting stable features

### profiletemp2 (Working Copy)
- **Modify freely** - experiment here
- Test new features, layouts, styles
- Revert to temp1 if experiments fail

### Future Templates
- **profiletemp3** - Alternative minimalist design?
- **profiletemp4** - Maximalist / detailed version?
- **profiletemp5** - Dark mode variant?

## 📝 Template API Reference

```javascript
const { generateNameProfile } = require('./profile-templates/profiletemp1.js');

const html = generateNameProfile(nameData, {
  theme: 'auto' | 'pink' | 'blue'
});
```

**Parameters:**
- `nameData`: Object with v4 enrichment schema
- `options.theme`:
  - `'auto'` (default): Gender-based (female=pink, male=blue)
  - `'pink'`: Force pink/purple theme
  - `'blue'`: Force blue theme

**Returns:** Complete HTML string

## 🎨 Theme Colors Quick Reference

### Pink Theme (Female)
- Background: `#fce7f3 → #fbcfe8 → #f9a8d4`
- Hero: `#ec4899 → #f472b6`
- Chips: `#be185d` on `#fce7f3`

### Blue Theme (Male)
- Background: `#dbeafe → #bfdbfe → #93c5fd`
- Hero: `#3b82f6 → #60a5fa`
- Chips: `#1e40af` on `#dbeafe`

## 📚 Full Documentation

See `scripts/profile-templates/README.md` for:
- Complete schema reference
- Advanced usage examples
- Troubleshooting guide
- Best practices

---

## ✨ Quick Win Ideas

**Want to make a quick change right now?**

1. **Add a new section** to profiletemp2:
   ```javascript
   // Around line 720 in profiletemp2.js, before closing </div>
   <!-- Name Numerology -->
   <div class="section">
     <h2 class="section-title">
       <div class="section-icon icon-7">
         <svg><!-- icon --></svg>
       </div>
       Name Numerology
     </h2>
     <p class="section-text">Life Path Number: ${calculateNumerology(nameData.name)}</p>
   </div>
   ```

2. **Change particle count**:
   ```javascript
   // Line 50 in profiletemp2.js
   ${Array.from({length: 50}, (_, i) => `  // Change 20 to 50 for more particles!
   ```

3. **Add a custom color theme**:
   ```javascript
   // Around line 40 in profiletemp2.js
   const isNeutral = theme === 'neutral';
   const colors = isNeutral ? {
     gradient: 'linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%)',
     // ... define neutral colors
   } : isFemale ? { /* pink */ } : { /* blue */ };
   ```

**Remember:** Modify **profiletemp2.js**, not profiletemp1.js!

---

**Created:** 2025-10-24
**System Version:** 1.0.0
**Ready for:** Adding WOW features to profiletemp2! 🚀
