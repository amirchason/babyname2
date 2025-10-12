const fs = require('fs');
const data = JSON.parse(fs.readFileSync('/data/data/com.termux/files/home/proj/babyname2/public/data/names-chunk1.json', 'utf8'));

console.log('Checking for Modern patterns in origins...\n');

// Check all Modern patterns in origin field
const modernOrigins = data.names.filter(n => n.origin && n.origin.includes('Modern'));
console.log('Total names with Modern in origin field:', modernOrigins.length);

// Group by pattern
const patterns = {};
modernOrigins.forEach(n => {
  const origin = n.origin;
  patterns[origin] = (patterns[origin] || 0) + 1;
});

console.log('\nOrigin patterns containing Modern:');
Object.entries(patterns).sort((a, b) => b[1] - a[1]).slice(0, 30).forEach(([pattern, count]) => {
  console.log(`  ${count}x "${pattern}"`);
});

// Check origins array
console.log('\n\nChecking origins array...');
const modernInArray = data.names.filter(n => {
  if (!n.origins || !Array.isArray(n.origins)) return false;
  return n.origins.some(o => o && o.includes('Modern'));
});

console.log('Names with Modern in origins array:', modernInArray.length);
modernInArray.slice(0, 10).forEach(n => {
  console.log(`  ${n.name}: ${JSON.stringify(n.origins)}`);
});
