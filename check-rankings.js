const d = require('./public/data/names-chunk1.json');
console.log('Total names in chunk1:', d.length);
const good = d.filter(n => n.rank !== 999999 && n.popularityRank !== 999999);
console.log('Names with real rankings:', good.length);
console.log('Names missing rankings:', d.length - good.length);

// Check Luna specifically
const luna = d.find(n => n.name === 'Luna');
if (luna) {
  console.log('\nLuna details:');
  console.log('  rank:', luna.rank);
  console.log('  popularityRank:', luna.popularityRank);
  console.log('  popularity:', luna.popularity);
}
