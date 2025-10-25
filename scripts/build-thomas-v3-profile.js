/**
 * Build Thomas V3 Profile using profiletemp3
 * Features: 12 WOW features with section numbering and accordions
 */

const fs = require('fs');
const { generateNameProfile } = require('./profile-templates/profiletemp3.js');

// Load Thomas's v4 data
const thomasData = JSON.parse(
  fs.readFileSync('/data/data/com.termux/files/home/proj/babyname2/public/data/enriched/thomas-v4.json', 'utf8')
);

console.log('🔨 Building Thomas V3 profile with profiletemp3...');
console.log(`  • Historic Figures: ${thomasData.historicFigures.length}`);
console.log(`  • Songs: ${thomasData.songs?.length || 0}`);
console.log(`  • Movies/Shows: ${thomasData.moviesAndShows?.length || 0}`);
console.log(`  • Famous People: ${thomasData.famousPeople?.length || 0}`);
console.log(`  • Nicknames: ${thomasData.nicknames.length}`);
console.log(`  • Enrichment Version: ${thomasData.enrichmentVersion}`);

// Generate the HTML profile using profiletemp3
const html = generateNameProfile(thomasData, { theme: 'auto' });

// Save the generated profile
fs.writeFileSync(
  '/data/data/com.termux/files/home/proj/babyname2/public/thomas-v3-with-accordions.html',
  html
);

console.log('\n✅ Complete Thomas V3 profile generated!');
console.log('💾 Saved to: public/thomas-v3-with-accordions.html');
console.log('📋 Template: profiletemp3 (12 features, section numbers, accordions)');
console.log('🎨 Features: Section numbering (3-14), collapsible accordions, localStorage state');
