/**
 * Analyze all origins in database to find coverage gaps
 */

const fs = require('fs');

// Current filters in SwipeFilterBar
const CURRENT_FILTERS = {
  'English & Irish': ['English', 'American', 'Irish', 'Scottish', 'Welsh', 'Australian', 'Canadian', 'Celtic'],
  'Hebrew': ['Hebrew'],
  'Latin': ['Latin'],
  'Greek': ['Greek'],
  'French': ['French'],
  'German': ['German'],
  'Italian': ['Italian'],
  'Spanish': ['Spanish'],
  'Arabic': ['Arabic'],
  'Indian': ['Indian', 'Sanskrit']
};

// Flatten current covered origins
const coveredOrigins = new Set();
Object.values(CURRENT_FILTERS).forEach(origins => {
  origins.forEach(o => coveredOrigins.add(o.toLowerCase()));
});

console.log('Current Filters Cover:', Array.from(coveredOrigins).sort());
console.log('Total covered origins:', coveredOrigins.size);
console.log('\n============================================================\n');

// Load all chunks and analyze origins
const originCounts = {};
const uncoveredOriginCounts = {};
let totalNames = 0;
let coveredNames = 0;
let uncoveredNames = 0;

const chunkFiles = [
  'public/data/names-chunk1.json',
  'public/data/names-chunk2.json',
  'public/data/names-chunk3.json',
  'public/data/names-chunk4.json'
];

for (const file of chunkFiles) {
  if (fs.existsSync(file)) {
    const data = JSON.parse(fs.readFileSync(file, 'utf8'));
    const names = data.names || data;

    names.forEach(name => {
      totalNames++;

      if (!name.origin) return;

      // Handle compound origins
      const originString = String(name.origin);
      const origins = originString.split(',').map(o => o.trim());

      // Count each origin
      origins.forEach(origin => {
        originCounts[origin] = (originCounts[origin] || 0) + 1;
      });

      // Check if any origin is covered by current filters
      const isCovered = origins.some(origin =>
        coveredOrigins.has(origin.toLowerCase())
      );

      if (isCovered) {
        coveredNames++;
      } else {
        uncoveredNames++;
        // Count uncovered origins
        origins.forEach(origin => {
          if (!coveredOrigins.has(origin.toLowerCase())) {
            uncoveredOriginCounts[origin] = (uncoveredOriginCounts[origin] || 0) + 1;
          }
        });
      }
    });
  }
}

console.log('📊 DATABASE ANALYSIS');
console.log('============================================================');
console.log(`Total names: ${totalNames.toLocaleString()}`);
console.log(`Covered by current filters: ${coveredNames.toLocaleString()} (${(coveredNames/totalNames*100).toFixed(1)}%)`);
console.log(`NOT covered: ${uncoveredNames.toLocaleString()} (${(uncoveredNames/totalNames*100).toFixed(1)}%)`);
console.log('\n');

// Sort uncovered origins by frequency
const sortedUncovered = Object.entries(uncoveredOriginCounts)
  .sort((a, b) => b[1] - a[1]);

console.log('🔍 TOP 50 UNCOVERED ORIGINS (by frequency)');
console.log('============================================================');
sortedUncovered.slice(0, 50).forEach(([origin, count], idx) => {
  const percent = (count / totalNames * 100).toFixed(2);
  console.log(`${idx + 1}. ${origin.padEnd(25)} ${count.toLocaleString().padStart(8)} names (${percent}%)`);
});

console.log('\n');
console.log('💡 STRATEGIC GROUPING SUGGESTIONS FOR 8 NEW FILTERS');
console.log('============================================================');

// Group related origins strategically
const suggestions = [
  {
    name: 'Slavic & Russian',
    origins: ['Russian', 'Slavic', 'Polish', 'Czech', 'Ukrainian', 'Bulgarian', 'Serbian', 'Croatian'],
    reason: 'Eastern European names cluster'
  },
  {
    name: 'Japanese',
    origins: ['Japanese'],
    reason: 'Large distinct cultural group'
  },
  {
    name: 'Chinese & Korean',
    origins: ['Chinese', 'Korean', 'Mandarin', 'Cantonese'],
    reason: 'East Asian names (non-Japanese)'
  },
  {
    name: 'African',
    origins: ['African', 'Swahili', 'Egyptian', 'Ethiopian', 'Nigerian', 'Kenyan'],
    reason: 'African continent names'
  },
  {
    name: 'Scandinavian',
    origins: ['Norse', 'Norwegian', 'Swedish', 'Danish', 'Icelandic', 'Finnish'],
    reason: 'Nordic names cluster'
  },
  {
    name: 'Turkish & Persian',
    origins: ['Turkish', 'Persian', 'Kurdish'],
    reason: 'Middle Eastern non-Arabic names'
  },
  {
    name: 'Portuguese',
    origins: ['Portuguese', 'Brazilian'],
    reason: 'Portuguese-speaking world'
  },
  {
    name: 'Unknown & Modern',
    origins: ['Unknown', 'Modern', 'Contemporary', 'American Modern'],
    reason: 'Catch-all for unclassified names (27% of database!)'
  }
];

suggestions.forEach((group, idx) => {
  let totalCount = 0;
  const foundOrigins = [];

  group.origins.forEach(origin => {
    const count = uncoveredOriginCounts[origin] || 0;
    if (count > 0) {
      totalCount += count;
      foundOrigins.push(`${origin} (${count.toLocaleString()})`);
    }
  });

  console.log(`\n${idx + 1}. "${group.name}"`);
  console.log(`   Reason: ${group.reason}`);
  console.log(`   Total names: ${totalCount.toLocaleString()}`);
  console.log(`   Origins found: ${foundOrigins.join(', ')}`);
});

// Calculate new total coverage
let newCoverage = coveredNames;
suggestions.forEach(group => {
  group.origins.forEach(origin => {
    newCoverage += (uncoveredOriginCounts[origin] || 0);
  });
});

console.log('\n\n📈 PROJECTED NEW COVERAGE');
console.log('============================================================');
console.log(`Current: ${coveredNames.toLocaleString()} / ${totalNames.toLocaleString()} (${(coveredNames/totalNames*100).toFixed(1)}%)`);
console.log(`After adding 8 filters: ${newCoverage.toLocaleString()} / ${totalNames.toLocaleString()} (${(newCoverage/totalNames*100).toFixed(1)}%)`);
console.log(`Improvement: +${(newCoverage - coveredNames).toLocaleString()} names`);

console.log('\n✅ Analysis complete!\n');
