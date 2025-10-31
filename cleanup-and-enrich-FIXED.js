const fs = require('fs');

console.log('DATABASE CLEANUP + SSA ENRICHMENT SCRIPT (FIXED)\n');

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
    console.error('  Error: ' + error.message);
  }
});

console.log('SSA Index: ' + ssaPopularity.size + ' names\n');

function cleanOrigin(origin) {
  // CRITICAL FIX: Handle arrays (some origins are arrays!)
  if (Array.isArray(origin)) {
    origin = origin.join(',');
  }
  
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

console.log('Processing database chunks...\n');

const chunks = [1, 2, 3, 4];
let totalProcessed = 0;
let originChanges = 0;
let ssaMatches = 0;
let arrayOrigins = 0;

for (const chunkNum of chunks) {
  const inputPath = 'public/data/names-chunk' + chunkNum + '.json';
  const outputPath = 'public/data/names-chunk' + chunkNum + '-v2.json';
  
  console.log('Processing chunk ' + chunkNum + '...');
  
  try {
    const data = JSON.parse(fs.readFileSync(inputPath, 'utf8'));
    
    const enriched = data.map(name => {
      const originalOrigin = name.origin;
      
      // Count array origins
      if (Array.isArray(originalOrigin)) {
        arrayOrigins++;
      }
      
      const cleanedOrigin = cleanOrigin(originalOrigin);
      
      if (JSON.stringify(originalOrigin) !== JSON.stringify(cleanedOrigin)) {
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
    console.log('  Saved: ' + outputPath);
    
  } catch (error) {
    console.error('  Error: ' + error.message);
  }
}

console.log('\nFINAL REPORT\n');
console.log('Total names: ' + totalProcessed);
console.log('Array origins found: ' + arrayOrigins);
console.log('Origin changes: ' + originChanges);
console.log('SSA matches: ' + ssaMatches + ' (' + ((ssaMatches/totalProcessed)*100).toFixed(2) + '%)');
console.log('\nCOMPLETE!');
