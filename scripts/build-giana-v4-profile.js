/**
 * Build Giana V4 Profile using profiletemp1
 */

const fs = require('fs');
const { generateNameProfile } = require('./profile-templates/profiletemp1.js');

// Load Giana's v4 data
const gianaData = JSON.parse(
  fs.readFileSync('/data/data/com.termux/files/home/proj/babyname2/public/data/enriched/giana-v4.json', 'utf8')
);

console.log('🔨 Building Giana V4 profile...');
console.log(`  • Historic Figures: ${gianaData.historicFigures.length}`);
console.log(`  • Songs: ${gianaData.songs?.length || 0}`);
console.log(`  • Movies/Shows: ${gianaData.moviesAndShows?.length || 0}`);
console.log(`  • Famous People: ${gianaData.famousPeople?.length || 0}`);
console.log(`  • Nicknames: ${gianaData.nicknames.length}`);
console.log(`  • Enrichment Version: ${gianaData.enrichmentVersion}`);

// Generate the HTML profile using profiletemp1
const html = generateNameProfile(gianaData, { theme: 'auto' });

// Save the generated profile
fs.writeFileSync(
  '/data/data/com.termux/files/home/proj/babyname2/public/giana-v4-profile.html',
  html
);

console.log('\n✅ Complete Giana V4 profile generated!');
console.log('💾 Saved to: public/giana-v4-profile.html');
console.log('📋 Template: profiletemp1 (baseline)');
