/**
 * Build Thomas V4 Profile using profiletemp1
 */

const fs = require('fs');
const { generateNameProfile } = require('./profile-templates/profiletemp1.js');

// Load Thomas's v4 data
const thomasData = JSON.parse(
  fs.readFileSync('/data/data/com.termux/files/home/proj/babyname2/public/data/enriched/thomas-v4.json', 'utf8')
);

console.log('🔨 Building Thomas V4 profile...');
console.log(`  • Historic Figures: ${thomasData.historicFigures.length}`);
console.log(`  • Songs: ${thomasData.songs?.length || 0}`);
console.log(`  • Movies/Shows: ${thomasData.moviesAndShows?.length || 0}`);
console.log(`  • Famous People: ${thomasData.famousPeople?.length || 0}`);
console.log(`  • Nicknames: ${thomasData.nicknames.length}`);
console.log(`  • Enrichment Version: ${thomasData.enrichmentVersion}`);

// Generate the HTML profile using profiletemp1
const html = generateNameProfile(thomasData, { theme: 'auto' });

// Save the generated profile
fs.writeFileSync(
  '/data/data/com.termux/files/home/proj/babyname2/public/thomas-v4-profile.html',
  html
);

console.log('\n✅ Complete Thomas V4 profile generated!');
console.log('💾 Saved to: public/thomas-v4-profile.html');
console.log('📋 Template: profiletemp1 (baseline)');
