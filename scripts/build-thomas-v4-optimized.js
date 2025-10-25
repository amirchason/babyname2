/**
 * Build Thomas V4 Profile using profiletemp2 (OPTIMIZED TEXT VERSION)
 */

const fs = require('fs');
const { generateNameProfile } = require('./profile-templates/profiletemp2.js');

// Load Thomas's v4 data
const thomasData = JSON.parse(
  fs.readFileSync('/data/data/com.termux/files/home/proj/babyname2/public/data/enriched/thomas-v4.json', 'utf8')
);

console.log('🔨 Building Thomas V4 profile (OPTIMIZED)...');
console.log(`  • Historic Figures: ${thomasData.historicFigures.length}`);
console.log(`  • Songs: ${thomasData.songs?.length || 0}`);
console.log(`  • Movies/Shows: ${thomasData.moviesAndShows?.length || 0}`);
console.log(`  • Famous People: ${thomasData.famousPeople?.length || 0}`);
console.log(`  • Nicknames: ${thomasData.nicknames.length}`);
console.log(`  • Enrichment Version: ${thomasData.enrichmentVersion}`);

// Generate the HTML profile using profiletemp2 (optimized)
const html = generateNameProfile(thomasData, { theme: 'auto' });

// Save the generated profile
fs.writeFileSync(
  '/data/data/com.termux/files/home/proj/babyname2/public/thomas-v4-optimized.html',
  html
);

console.log('\n✅ Complete Thomas V4 profile generated!');
console.log('💾 Saved to: public/thomas-v4-optimized.html');
console.log('📋 Template: profiletemp2 (OPTIMIZED - bigger text, no boxes)');
console.log('\n🎯 Optimizations:');
console.log('  • Removed nested box-in-box design');
console.log('  • Increased font sizes (16-22px for body text)');
console.log('  • Simplified layout with border-left separators');
console.log('  • More white space for easier reading');
console.log('  • Text-first design maximizing screen usage');
