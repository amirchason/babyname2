const fs = require('fs');

const isEnglishRelated = (name) => {
  const checkField = (field) => {
    if (!field) return false;
    const values = Array.isArray(field) ? field : [field];
    return values.some((val) => {
      const valLower = String(val).toLowerCase();
      const patterns = ['english', 'modern', 'contemporary', 'american', 'old english', 'germanic', 'native american', 'indigenous americas', 'modern english'];
      return patterns.some(pattern =>
        valLower === pattern ||
        valLower.includes(pattern + ',') ||
        valLower.includes(',' + pattern) ||
        valLower.startsWith(pattern + ' ') ||
        valLower.endsWith(' ' + pattern) ||
        valLower.includes(' ' + pattern + ' ')
      );
    });
  };
  return checkField(name.origin) || checkField(name.originGroup);
};

let totalNames = 0;
let totalEnglish = 0;

['chunk1', 'chunk2', 'chunk3', 'chunk4', 'chunk5'].forEach(chunk => {
  try {
    const fileData = JSON.parse(fs.readFileSync(`public/data/names-${chunk}.json`, 'utf8'));
    const data = fileData.names || fileData;
    const english = data.filter(isEnglishRelated).length;
    totalNames += data.length;
    totalEnglish += english;
    console.log(`${chunk}: ${data.length} total, ${english} English (${((english/data.length)*100).toFixed(2)}%)`);
  } catch(e) {
    console.log(`${chunk}: ERROR - ${e.message}`);
  }
});

console.log(`\nTOTAL: ${totalNames.toLocaleString()} names, ${totalEnglish.toLocaleString()} English (${((totalEnglish/totalNames)*100).toFixed(2)}%)`);
console.log(`SHOWING IN UI: 8,997 names`);
console.log(`MISSING: ${(totalEnglish - 8997).toLocaleString()} names`);
