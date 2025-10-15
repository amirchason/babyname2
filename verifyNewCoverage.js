/**
 * Verify new filter coverage after adding 8 new origin filters
 */

const fs = require('fs');

// All 18 filter groups with their expanded origins
const FILTER_GROUPS = {
  'English & Irish': ['English', 'American', 'Irish', 'Scottish', 'Welsh', 'Australian', 'Canadian', 'Celtic'],
  'Hebrew': ['Hebrew'],
  'Latin': ['Latin'],
  'Greek': ['Greek'],
  'French': ['French'],
  'German': ['German'],
  'Italian': ['Italian'],
  'Spanish': ['Spanish'],
  'Arabic': ['Arabic'],
  'Indian': ['Indian', 'Sanskrit'],
  'African': ['African', 'Yoruba', 'Nigerian', 'Igbo', 'Tswana', 'Zulu', 'Akan', 'Ghanaian', 'Xhosa', 'Swahili', 'Ethiopian', 'Egyptian', 'Edo', 'Ewe', 'Shona', 'Amharic', 'Kenyan', 'Somali', 'Hausa'],
  'Unknown & Modern': ['Unknown', 'Modern', 'Contemporary', 'Invented', ''],
  'East Asian': ['Chinese', 'Japanese', 'Korean', 'Mandarin', 'Cantonese'],
  'Southeast Asian': ['Indonesian', 'Malay', 'Filipino', 'Vietnamese', 'Thai', 'Cambodian', 'Burmese', 'Laotian'],
  'Slavic': ['Russian', 'Polish', 'Czech', 'Ukrainian', 'Bulgarian', 'Serbian', 'Croatian', 'Slavic', 'Lithuanian', 'Romanian', 'Hungarian', 'Slovak', 'Bosnian'],
  'Scandinavian': ['Norse', 'Norwegian', 'Swedish', 'Danish', 'Icelandic', 'Finnish', 'Old Norse'],
  'Middle East': ['Turkish', 'Persian', 'Kurdish', 'Armenian'],
  'Other World': ['Portuguese', 'Dutch', 'Germanic', 'Hawaiian', 'Native American', 'Basque', 'Maori', 'Aboriginal', 'Polynesian', 'Samoan']
};

// Flatten all covered origins
const allCoveredOrigins = new Set();
Object.values(FILTER_GROUPS).forEach(origins => {
  origins.forEach(o => allCoveredOrigins.add(o.toLowerCase()));
});

console.log('============================================================');
console.log('VERIFYING NEW FILTER COVERAGE (18 FILTERS TOTAL)');
console.log('============================================================\n');

console.log('📊 Filter Groups:');
Object.entries(FILTER_GROUPS).forEach(([filterName, origins], idx) => {
  console.log(`${idx + 1}. ${filterName} (${origins.length} origins)`);
});

console.log(`\n✅ Total covered origins: ${allCoveredOrigins.size}`);
console.log('\n');

// Load database and check coverage
let totalNames = 0;
let coveredNames = 0;
let uncoveredNames = 0;
const coveredPerFilter = {};
const uncoveredOriginCounts = {};

// Initialize covered per filter
Object.keys(FILTER_GROUPS).forEach(filterName => {
  coveredPerFilter[filterName] = 0;
});

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

      if (!name.origin) {
        // Names with no origin are covered by "Unknown & Modern" filter
        if (allCoveredOrigins.has('')) {
          coveredNames++;
          coveredPerFilter['Unknown & Modern']++;
        } else {
          uncoveredNames++;
        }
        return;
      }

      // Handle compound origins
      const originString = String(name.origin);
      const origins = originString.split(',').map(o => o.trim());

      // Check if any origin is covered
      const isCovered = origins.some(origin =>
        allCoveredOrigins.has(origin.toLowerCase())
      );

      if (isCovered) {
        coveredNames++;

        // Count which filter covers it
        Object.entries(FILTER_GROUPS).forEach(([filterName, filterOrigins]) => {
          const isMatchedByFilter = origins.some(origin =>
            filterOrigins.some(fo => fo.toLowerCase() === origin.toLowerCase())
          );
          if (isMatchedByFilter) {
            coveredPerFilter[filterName]++;
          }
        });
      } else {
        uncoveredNames++;
        // Count uncovered origins
        origins.forEach(origin => {
          if (!allCoveredOrigins.has(origin.toLowerCase())) {
            uncoveredOriginCounts[origin] = (uncoveredOriginCounts[origin] || 0) + 1;
          }
        });
      }
    });
  }
}

console.log('📊 OVERALL COVERAGE');
console.log('============================================================');
console.log(`Total names: ${totalNames.toLocaleString()}`);
console.log(`Covered: ${coveredNames.toLocaleString()} (${(coveredNames/totalNames*100).toFixed(1)}%)`);
console.log(`Not covered: ${uncoveredNames.toLocaleString()} (${(uncoveredNames/totalNames*100).toFixed(1)}%)`);

console.log('\n\n📊 COVERAGE BY FILTER');
console.log('============================================================');
Object.entries(coveredPerFilter)
  .sort((a, b) => b[1] - a[1])
  .forEach(([filterName, count], idx) => {
    const percent = (count / totalNames * 100).toFixed(1);
    console.log(`${idx + 1}. ${filterName.padEnd(20)} ${count.toLocaleString().padStart(8)} names (${percent}%)`);
  });

console.log('\n\n🔍 TOP 20 STILL UNCOVERED ORIGINS');
console.log('============================================================');
const sortedUncovered = Object.entries(uncoveredOriginCounts)
  .sort((a, b) => b[1] - a[1])
  .slice(0, 20);

if (sortedUncovered.length > 0) {
  sortedUncovered.forEach(([origin, count], idx) => {
    const percent = (count / totalNames * 100).toFixed(2);
    console.log(`${idx + 1}. ${origin.padEnd(25)} ${count.toLocaleString().padStart(8)} names (${percent}%)`);
  });
} else {
  console.log('🎉 ALL ORIGINS ARE COVERED!');
}

console.log('\n\n✅ VERIFICATION COMPLETE!');
console.log('============================================================');

if ((coveredNames / totalNames) >= 0.95) {
  console.log('🎉 EXCELLENT! 95%+ coverage achieved!');
} else if ((coveredNames / totalNames) >= 0.90) {
  console.log('✅ GREAT! 90%+ coverage achieved!');
} else if ((coveredNames / totalNames) >= 0.80) {
  console.log('👍 GOOD! 80%+ coverage achieved!');
} else {
  console.log('⚠️  More filters may be needed for better coverage.');
}

console.log('\n');
