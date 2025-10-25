/**
 * Build Thomas V5 Profile using profiletemp5
 * Features: Enhanced astrology with compact design, pastel icons, celestial knowledge
 */

const fs = require('fs');
const { generateNameProfile } = require('./profile-templates/profiletemp5.js');

// Load Thomas's v5 data
const thomasData = JSON.parse(
  fs.readFileSync('/data/data/com.termux/files/home/proj/babyname2/public/data/enriched/thomas-v5.json', 'utf8')
);

console.log('🔨 Building Thomas V5 profile with profiletemp5...');
console.log(`  • Historic Figures: ${thomasData.historicFigures.length}`);
console.log(`  • Songs: ${thomasData.songs?.length || 0}`);
console.log(`  • Movies/Shows: ${thomasData.moviesAndShows?.length || 0}`);
console.log(`  • Famous People: ${thomasData.famousPeople?.length || 0}`);
console.log(`  • Nicknames: ${thomasData.nicknames.length}`);
console.log(`  • Enrichment Version: ${thomasData.enrichmentVersion}`);

// Generate the HTML profile using profiletemp5
const html = generateNameProfile(thomasData, { theme: 'auto' });

// Save the generated profile
fs.writeFileSync(
  '/data/data/com.termux/files/home/proj/babyname2/public/thomas-v5-enhanced-astrology.html',
  html
);

console.log('\n✅ Complete Thomas V5 profile generated!');
console.log('💾 Saved to: public/thomas-v5-enhanced-astrology.html');
console.log('📋 Template: profiletemp5 (16 sections, enhanced astrology)');
console.log('🎨 Features: Compact spacing, pastel icons, celestial knowledge, 2 new subsections');
