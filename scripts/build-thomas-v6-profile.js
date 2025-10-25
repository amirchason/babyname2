/**
 * Build Thomas V6 Profile using profiletemp5
 * Features: V6 verified enrichment with MusicBrainz song verification and smart IMDB/Wikipedia links
 */

const fs = require('fs');
const { generateNameProfile } = require('./profile-templates/profiletemp5.js');

// Load Thomas's v6 data
const thomasData = JSON.parse(
  fs.readFileSync('/data/data/com.termux/files/home/proj/babyname2/public/data/enriched/thomas-v6.json', 'utf8')
);

console.log('🔨 Building Thomas V6 profile with profiletemp5...');
console.log(`  • Historic Figures: ${thomasData.historicFigures.length}`);
console.log(`  • Songs: ${thomasData.songs?.length || 0} (${thomasData.songs?.filter(s => s.verified).length || 0} verified)`);
console.log(`  • Movies/Shows: ${thomasData.moviesAndShows?.length || 0}`);
console.log(`  • Famous People: ${thomasData.famousPeople?.length || 0}`);
console.log(`  • Nicknames: ${thomasData.nicknames.length}`);
console.log(`  • Enrichment Version: ${thomasData.enrichmentVersion}`);

// Generate the HTML profile using profiletemp5
const html = generateNameProfile(thomasData, { theme: 'auto' });

// Save the generated profile
fs.writeFileSync(
  '/data/data/com.termux/files/home/proj/babyname2/public/thomas-v6-verified-profile.html',
  html
);

console.log('\n✅ Complete Thomas V6 profile generated!');
console.log('💾 Saved to: public/thomas-v6-verified-profile.html');
console.log('📋 Template: profiletemp5 (16 sections, enhanced astrology)');
console.log('🎨 Features: MusicBrainz verified songs, smart IMDB/Wikipedia links');
console.log('🔍 Verification: Songs checked against music database, links profession-matched');
