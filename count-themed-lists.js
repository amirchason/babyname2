const fs = require('fs');
const path = './src/data/themedLists.ts';
const content = fs.readFileSync(path, 'utf8');

// Extract each list's specificNames count
const lists = [];
const listRegex = /id: '([^']+)'[\s\S]*?specificNames: \[([\s\S]*?)\]/g;
let match;

while ((match = listRegex.exec(content)) !== null) {
  const id = match[1];
  const namesSection = match[2];
  // Count names by counting quotes (2 per name)
  const nameCount = (namesSection.match(/'/g) || []).length / 2;
  lists.push({ id, count: Math.floor(nameCount) });
}

console.log('\n📊 THEMED LISTS NAME COUNT:\n');
console.log('List ID'.padEnd(30) + 'Name Count');
console.log('='.repeat(50));

let total = 0;
lists.forEach(list => {
  const status = list.count >= 200 ? '✅' : list.count >= 100 ? '⚠️' : '❌';
  console.log(status + ' ' + list.id.padEnd(26) + ' ' + list.count);
  total += list.count;
});

console.log('='.repeat(50));
console.log('TOTAL NAMES ACROSS ALL LISTS: ' + total);
console.log('AVERAGE NAMES PER LIST: ' + Math.floor(total / lists.length));
console.log('\n✅ = 200+ names  ⚠️  = 100-199 names  ❌ = <100 names\n');
