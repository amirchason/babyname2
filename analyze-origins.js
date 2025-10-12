const fs = require('fs');

const CHUNK_FILES = [
  '/data/data/com.termux/files/home/proj/babyname2/public/data/names-chunk1.json',
  '/data/data/com.termux/files/home/proj/babyname2/public/data/names-chunk-2.json',
  '/data/data/com.termux/files/home/proj/babyname2/public/data/names-chunk-3.json',
  '/data/data/com.termux/files/home/proj/babyname2/public/data/names-chunk4.json'
];

const originCounts = new Map();

CHUNK_FILES.forEach(filePath => {
  if (!fs.existsSync(filePath)) {
    console.log(`Skipping missing file: ${filePath}`);
    return;
  }

  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const data = JSON.parse(content);
    const names = data.names || data;

    if (Array.isArray(names)) {
      names.forEach(name => {
        if (name.origin) {
          const origins = Array.isArray(name.origin) ? name.origin : [name.origin];
          origins.forEach(origin => {
            if (origin && typeof origin === 'string') {
              const cleanOrigin = origin.trim();
              originCounts.set(cleanOrigin, (originCounts.get(cleanOrigin) || 0) + 1);
            }
          });
        }
      });
    }
  } catch (error) {
    console.log(`Error loading ${filePath}: ${error.message}`);
  }
});

// Sort by count descending
const sortedOrigins = Array.from(originCounts.entries())
  .map(([origin, count]) => ({ origin, count }))
  .sort((a, b) => b.count - a.count);

console.log('\n=== ALL ORIGINS (sorted by count) ===\n');
console.log('Total unique origins:', sortedOrigins.length);
console.log('Total names analyzed:', Array.from(originCounts.values()).reduce((a, b) => a + b, 0));

console.log('\n--- Origins with 15+ names ---');
const largeOrigins = sortedOrigins.filter(o => o.count >= 15);
console.log('Count:', largeOrigins.length);
largeOrigins.forEach(({ origin, count }) => {
  console.log(`  ${count.toString().padStart(6)} - ${origin}`);
});

console.log('\n--- Origins with fewer than 15 names ---');
const smallOrigins = sortedOrigins.filter(o => o.count < 15);
console.log('Count:', smallOrigins.length);
smallOrigins.forEach(({ origin, count }) => {
  console.log(`  ${count.toString().padStart(6)} - ${origin}`);
});
