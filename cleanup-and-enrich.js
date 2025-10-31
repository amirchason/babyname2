const fs = require('fs');
const path = require('path');

console.log('DATABASE CLEANUP + SSA ENRICHMENT SCRIPT');
console.log('This will:');
console.log('1. Fix origin delimiter/spacing issues (SAFE)');
console.log('2. Add single SSA popularity score (2020-2024)');
console.log('');

const ssaPopularity = new Map();

const ssaFiles = [
  'ssa-temp/yob2020.txt',
  'ssa-temp/yob2021.txt',
  'ssa-temp/yob2022.txt',
  'ssa-temp/yob2023.txt',
  'ssa-temp/yob2024.txt'
];

console.log('Building SSA popularity index...');

ssaFiles.forEach(file => {
  try {
    const data = fs.readFileSync(file, 'utf8');
    const lines = data.split('\n').filter(line => line.trim());
    
    lines.forEach(line => {
      const parts = line.split(',');
      const name = parts[0];
      const count = parseInt(parts[2], 10);
      
      if (!name || !count) return;
      
      const nameLower = name.toLowerCase();
      
      if (ssaPopularity.has(nameLower)) {
        ssaPopularity.set(nameLower, ssaPopularity.get(nameLower) + count);
      } else {
        ssaPopularity.set(nameLower, count);
      }
    });
    
    console.log('  Processed: ' + file);
  } catch (error) {
    console.error('  Error reading ' + file + ': ' + error.message);
  }
});

console.log('');
console.log('SSA Index built: ' + ssaPopularity.size + ' unique names');
console.log('');

function cleanOrigin(origin) {
  if (!origin || typeof origin !== 'string') return 'Unknown';
  if (origin.trim() === '' || origin === 'Unknown') return 'Unknown';
  
  let cleaned = origin
    .replace(/\s*;\s*/g, ',')
    .replace(/\s*,\s*/g, ',')
    .trim();
  
  let parts = cleaned.split(',')
    .map(p => p.trim())
    .filter(p => p.length > 0);
  
  parts = [...new Set(parts)];
  parts.sort();
  
  return parts.join(',');
}

console.log('Processing database chunks...');
console.log('');

const chunks = [1, 2, 3, 4];
let totalProcessed = 0;
let originChanges = 0;
let ssaMatches = 0;

for (const chunkNum of chunks) {
  const inputPath = 'public/data/names-chunk' + chunkNum + '.json';
  const outputPath = 'public/data/names-chunk' + chunkNum + '-v2.json';
  
  console.log('Processing chunk ' + chunkNum + '...');
  
  try {
    const data = JSON.parse(fs.readFileSync(inputPath, 'utf8'));
    
    const enriched = data.map(name => {
      const originalOrigin = name.origin;
      const cleanedOrigin = cleanOrigin(originalOrigin);
      
      if (originalOrigin !== cleanedOrigin) {
        originChanges++;
      }
      
      const nameLower = name.name.toLowerCase();
      const popularity = ssaPopularity.get(nameLower) || 0;
      
      if (popularity > 0) {
        ssaMatches++;
      }
      
      return {
        ...name,
        origin: cleanedOrigin,
        ssaPopularity: popularity
      };
    });
    
    fs.writeFileSync(outputPath, JSON.stringify(enriched, null, 2));
    
    totalProcessed += data.length;
    console.log('  Saved: ' + outputPath + ' (' + data.length + ' names)');
    console.log('');
    
  } catch (error) {
    console.error('  Error processing chunk ' + chunkNum + ': ' + error.message);
  }
}

console.log('FINAL REPORT');
console.log('');
console.log('Total names processed: ' + totalProcessed);
console.log('Origin format changes: ' + originChanges + ' (' + ((originChanges/totalProcessed)*100).toFixed(2) + '%)');
console.log('SSA matches found: ' + ssaMatches + ' (' + ((ssaMatches/totalProcessed)*100).toFixed(2) + '%)');
console.log('');
console.log('CLEANUP + ENRICHMENT COMPLETE!');
