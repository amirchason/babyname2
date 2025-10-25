const fs = require('fs');

// Load Sophia's v3 comprehensive data
const sophiaData = JSON.parse(
  fs.readFileSync('/data/data/com.termux/files/home/proj/babyname2/public/data/enriched/sophia-v3-comprehensive.json', 'utf8')
);

// Load John's template
const johnTemplate = fs.readFileSync(
  '/data/data/com.termux/files/home/proj/babyname2/public/john-v3-profile.html',
  'utf8'
);

// Replace John data with Sophia data
let sophiaProfile = johnTemplate;

// Title and meta
sophiaProfile = sophiaProfile.replace(/<title>.*?<\/title>/, '<title>Sophia - Name Profile | SoulSeed</title>');

// Hero section
sophiaProfile = sophiaProfile.replace(/<h1 class="name-title">John<\/h1>/, '<h1 class="name-title">Sophia</h1>');
sophiaProfile = sophiaProfile.replace(/<p class="pronunciation">jɒn<\/p>/, `<p class="pronunciation">${sophiaData.pronunciationGuide}</p>`);
sophiaProfile = sophiaProfile.replace(/🌍 Hebrew/, `🌍 ${sophiaData.origin}`);

// Stats - Meaning
sophiaProfile = sophiaProfile.replace(/God is gracious/, sophiaData.meaning);
sophiaProfile = sophiaProfile.replace(/<div class="stat-value">Boy<\/div>/, '<div class="stat-value">Girl</div>');

// Colors - Change from blue to pink/purple for female
sophiaProfile = sophiaProfile.replace(/rgba\(59, 130, 246/g, 'rgba(236, 72, 153'); // pink
sophiaProfile = sophiaProfile.replace(/#3b82f6/g, '#ec4899');
sophiaProfile = sophiaProfile.replace(/#60a5fa/g, '#f472b6');
sophiaProfile = sophiaProfile.replace(/#e0f2fe/g, '#fce7f3');
sophiaProfile = sophiaProfile.replace(/#dbeafe/g, '#fbcfe8');

// Cultural Significance
const culturalSection = sophiaData.culturalSignificance;
sophiaProfile = sophiaProfile.replace(
  /The name John has been historically.*?<\/p>/s,
  `${culturalSection}</p>`
);

// Modern Context
sophiaProfile = sophiaProfile.replace(
  /In modern times, John remains.*?<\/p>/s,
  `${sophiaData.modernContext}</p>`
);

// Literary/Famous references
sophiaProfile = sophiaProfile.replace(
  /John is a common name in literature.*?<\/p>/s,
  `${sophiaData.literaryReferences}</p>`
);

// Personality traits - Use Sophia's personality
const personalityTraits = sophiaData.personality.split(/[,.]/).map(s => s.trim()).filter(s => s.length > 0).slice(0, 9);
const personalityChips = personalityTraits.map(trait => {
  const word = trait.split(' ').pop().replace(/[^a-zA-Z]/g, '');
  return `          <div class="chip">${word.charAt(0).toUpperCase() + word.slice(1)}</div>`;
}).join('\n');

sophiaProfile = sophiaProfile.replace(
  /Reliable.*?Kind/s,
  personalityChips.split('\n').map(line => line.trim()).join('\n          ')
);

// Nicknames - Use Sophia's nicknames (first 12)
const nicknames = sophiaData.nicknames.slice(0, 12);
const nicknameChips = nicknames.map(nick => `          <div class="chip">${nick}</div>`).join('\n');
sophiaProfile = sophiaProfile.replace(
  /<div class="chip-list" style="grid-template-columns: repeat\(4, 1fr\);">[\s\S]*?<\/div>[\s]*<!-- Related Names -->/,
  `<div class="chip-list" style="grid-template-columns: repeat(4, 1fr);">\n${nicknameChips}\n        </div>\n      </div>\n\n      <div class="divider"></div>\n\n      <!-- Related Names -->`
);

// Variations - Use Sophia's variations (first 9)
const variations = sophiaData.variations.filter((v, i, arr) => arr.indexOf(v) === i).slice(0, 9);
const variationChips = variations.map(v => `          <div class="chip">${v}</div>`).join('\n');
sophiaProfile = sophiaProfile.replace(
  /Jon.*?Ivan/s,
  variationChips.split('\n').map(line => line.trim()).join('\n          ')
);

// Similar Names - Use Sophia's similar names (first 9)
const similarNames = sophiaData.similarNames.slice(0, 9);
const similarChips = similarNames.map(n => `          <div class="chip">${n}</div>`).join('\n');
const similarMatch = sophiaProfile.match(/<!-- Similar Names.*?(<div class="chip-list">)([\s\S]*?)(<\/div>)/);
if (similarMatch) {
  sophiaProfile = sophiaProfile.replace(
    similarMatch[0],
    `<!-- Similar Names -->\n      <div class="section" style="padding: 16px 24px;">\n        <h2 class="section-title" style="margin-bottom: 6px;">\n          <div class="section-icon icon-7">\n            <svg viewBox="0 0 24 24"><path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/></svg>\n          </div>\n          Similar Names\n        </h2>\n        <div class="chip-list">\n${similarChips}\n        </div>`
  );
}

console.log('✅ Generated Sophia profile in John style');
console.log(`  • Name: ${sophiaData.name}`);
console.log(`  • Origin: ${sophiaData.origin}`);
console.log(`  • Meaning: ${sophiaData.meaning}`);
console.log(`  • Pronunciation: ${sophiaData.pronunciationGuide}`);
console.log(`  • Historic Figures: ${sophiaData.historicFigures.length}`);
console.log(`  • Nicknames: ${nicknames.length}`);
console.log(`  • Variations: ${variations.length}`);
console.log(`  • Similar Names: ${similarNames.length}`);

// Save the generated profile
fs.writeFileSync(
  '/data/data/com.termux/files/home/proj/babyname2/public/sophia-john-style.html',
  sophiaProfile
);

console.log('\n💾 Saved to: public/sophia-john-style.html');
