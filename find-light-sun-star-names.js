/**
 * Find all light/sun/star names in full database
 * Search all chunks for names with meanings related to light, sun, and stars
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Searching all database chunks for light/sun/star names...\n');

// Load all chunks
const dataPath = path.join(__dirname, 'public', 'data');
const chunks = [
  'names-core.json',
  'names-chunk1.json',
  'names-chunk2.json',
  'names-chunk3.json',
  'names-chunk4.json',
  'names-chunk5.json'
];

let allNames = [];

// Load each chunk
chunks.forEach(chunkFile => {
  const filePath = path.join(dataPath, chunkFile);
  if (fs.existsSync(filePath)) {
    console.log(`📖 Loading ${chunkFile}...`);
    const chunkData = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    const names = chunkData.names || [];
    allNames = allNames.concat(names);
    console.log(`   Added ${names.length} names (total: ${allNames.length})`);
  }
});

console.log(`\n✅ Loaded ${allNames.length} total names\n`);

// Filter for light/sun/star themes
const lightSunStarNames = allNames.filter(name => {
  if (!name.meaning && !name.origin) return false;

  const meaning = (name.meaning || '').toLowerCase();
  const origin = (name.origin || '').toLowerCase();

  // More comprehensive keyword matching
  const lightKeywords = ['light', 'bright', 'shine', 'shining', 'radiant', 'glow', 'glowing', 'luminous', 'illuminate', 'clarity', 'clear', 'brilliant'];
  const sunKeywords = ['sun', 'sunny', 'solar', 'dawn', 'sunrise', 'daylight', 'sol', 'apollo'];
  const starKeywords = ['star', 'stellar', 'celestial', 'astral', 'constellation', 'nova', 'sirius', 'orion', 'stella'];

  const allKeywords = [...lightKeywords, ...sunKeywords, ...starKeywords];

  return allKeywords.some(keyword => meaning.includes(keyword) || origin.includes(keyword));
});

console.log(`🌟 Found ${lightSunStarNames.length} names related to light, sun, and stars!\n`);

// Categorize by gender
const female = lightSunStarNames.filter(n => n.gender === 'female' || n.gender === 'f' || n.gender === 'F');
const male = lightSunStarNames.filter(n => n.gender === 'male' || n.gender === 'm' || n.gender === 'M');
const unisex = lightSunStarNames.filter(n => n.isUnisex || n.gender === 'unisex');

console.log(`📊 Statistics:`);
console.log(`   Female: ${female.length}`);
console.log(`   Male: ${male.length}`);
console.log(`   Unisex: ${unisex.length}`);

// Save to file
const outputPath = path.join(__dirname, 'blog-posts-seo', 'all-light-sun-star-names.json');
fs.writeFileSync(outputPath, JSON.stringify({
  timestamp: new Date().toISOString(),
  total: lightSunStarNames.length,
  female: female.length,
  male: male.length,
  unisex: unisex.length,
  names: lightSunStarNames.map(n => ({
    name: n.name,
    gender: n.gender || (n.isUnisex ? 'unisex' : ''),
    origin: n.origin || 'Unknown',
    meaning: n.meaning || 'Unknown'
  }))
}, null, 2));

console.log(`\n💾 Saved to: ${outputPath}`);

// Show first 20 names as sample
console.log(`\n📝 Sample names (first 20):`);
lightSunStarNames.slice(0, 20).forEach((n, i) => {
  console.log(`   ${i + 1}. ${n.name} (${n.gender || (n.isUnisex ? 'unisex' : '?')}) - ${n.meaning || 'Unknown'}`);
});

if (lightSunStarNames.length >= 150) {
  console.log(`\n✨ SUCCESS! We have ${lightSunStarNames.length} names - more than enough for 150!`);
} else {
  console.log(`\n⚠️  Warning: Only ${lightSunStarNames.length} names found. We need 150.`);
}
