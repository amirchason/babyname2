/**
 * Test script to debug the English origin filter
 * Analyzes why only 8,997 names are showing instead of expected ~29,000
 */

const fs = require('fs');
const path = require('path');

// Read chunk1 data
const chunk1Path = path.join(__dirname, 'public/data/names-chunk1.json');
const chunk1Data = JSON.parse(fs.readFileSync(chunk1Path, 'utf8'));

console.log('📊 DATABASE ANALYSIS\n');
console.log(`Total names in chunk1: ${chunk1Data.length.toLocaleString()}`);

// Helper function matching HomePage.tsx logic (lines 340-378)
const isEnglishRelated = (name) => {
  // Check both origin and originGroup fields (both can be strings or arrays)
  const checkField = (field) => {
    if (!field) return false;
    const values = Array.isArray(field) ? field : [field];

    return values.some((val) => {
      const valLower = String(val).toLowerCase();

      // Raw origin patterns (from origin field)
      const rawPatterns = ['english', 'modern', 'contemporary', 'american', 'old english'];

      // Processed originGroup patterns
      const groupPatterns = ['english', 'germanic', 'old english', 'modern english',
                            'american', 'native american', 'indigenous americas'];

      // Check if value matches any pattern
      return [...rawPatterns, ...groupPatterns].some(pattern => {
        // Exact match
        if (valLower === pattern) return true;

        // Comma-separated (e.g., "English,Hebrew")
        if (valLower.includes(pattern + ',') || valLower.includes(',' + pattern)) return true;

        // Space-separated (e.g., "Modern English", "Native American")
        if (valLower.startsWith(pattern + ' ') ||
            valLower.endsWith(' ' + pattern) ||
            valLower.includes(' ' + pattern + ' ')) return true;

        return false;
      });
    });
  };

  return checkField(name.origin) || checkField(name.originGroup);
};

// Count English matches
let englishCount = 0;
const englishNames = [];
const originStats = {};
const originGroupStats = {};

chunk1Data.forEach(name => {
  if (isEnglishRelated(name)) {
    englishCount++;
    englishNames.push({
      name: name.name,
      origin: name.origin,
      originGroup: name.originGroup
    });
  }

  // Track all origins
  const origins = Array.isArray(name.origin) ? name.origin : [name.origin];
  origins.forEach(o => {
    if (o) {
      originStats[o] = (originStats[o] || 0) + 1;
    }
  });

  // Track all originGroups
  const groups = Array.isArray(name.originGroup) ? name.originGroup : [name.originGroup];
  groups.forEach(g => {
    if (g) {
      originGroupStats[g] = (originGroupStats[g] || 0) + 1;
    }
  });
});

console.log(`\n✅ CURRENT FILTER RESULTS:`);
console.log(`English-related names in chunk1: ${englishCount.toLocaleString()}`);
console.log(`Percentage of chunk1: ${((englishCount / chunk1Data.length) * 100).toFixed(2)}%`);

// Extrapolate to full database (145,644 names)
const totalDbSize = 145644;
const projectedTotal = Math.round((englishCount / chunk1Data.length) * totalDbSize);
console.log(`\n📈 PROJECTED TOTAL ACROSS ALL CHUNKS:`);
console.log(`Expected: ~${projectedTotal.toLocaleString()} English names`);
console.log(`Current showing: 8,997 names (WRONG!)`);

console.log(`\n❌ DISCREPANCY: Missing ${Math.max(0, projectedTotal - 8997).toLocaleString()} names!`);

// Show top 10 English matches
console.log(`\n📋 SAMPLE ENGLISH MATCHES (first 10):`);
englishNames.slice(0, 10).forEach((n, i) => {
  console.log(`${i + 1}. ${n.name}: origin="${n.origin}", originGroup="${n.originGroup}"`);
});

// Analyze origin distribution
console.log(`\n📊 TOP 20 RAW ORIGINS (origin field):`);
const sortedOrigins = Object.entries(originStats)
  .sort(([, a], [, b]) => b - a)
  .slice(0, 20);
sortedOrigins.forEach(([origin, count]) => {
  const pct = ((count / chunk1Data.length) * 100).toFixed(2);
  const isMatch = origin.toLowerCase().includes('english') ||
                  origin.toLowerCase().includes('american') ||
                  origin.toLowerCase().includes('modern') ||
                  origin.toLowerCase().includes('contemporary');
  console.log(`${isMatch ? '✅' : '  '} ${origin}: ${count.toLocaleString()} (${pct}%)`);
});

console.log(`\n📊 TOP 20 ORIGIN GROUPS (originGroup field):`);
const sortedGroups = Object.entries(originGroupStats)
  .sort(([, a], [, b]) => b - a)
  .slice(0, 20);
sortedGroups.forEach(([group, count]) => {
  const pct = ((count / chunk1Data.length) * 100).toFixed(2);
  const isMatch = group.toLowerCase().includes('english') ||
                  group.toLowerCase().includes('american') ||
                  group.toLowerCase().includes('germanic');
  console.log(`${isMatch ? '✅' : '  '} ${group}: ${count.toLocaleString()} (${pct}%)`);
});

// Check for potential issues
console.log(`\n🔍 DIAGNOSTIC CHECKS:`);

// Check names with English in origin but not matching
const missedEnglish = chunk1Data.filter(n => {
  const originStr = String(n.origin || '').toLowerCase();
  const groupStr = String(n.originGroup || '').toLowerCase();
  const hasEnglish = originStr.includes('english') || groupStr.includes('english');
  return hasEnglish && !isEnglishRelated(n);
});

console.log(`Names with "english" but NOT matched: ${missedEnglish.length}`);
if (missedEnglish.length > 0) {
  console.log(`Sample missed names:`);
  missedEnglish.slice(0, 5).forEach(n => {
    console.log(`  - ${n.name}: origin="${n.origin}", originGroup="${n.originGroup}"`);
  });
}

// Check if arrays are being handled correctly
const arrayOrigins = chunk1Data.filter(n => Array.isArray(n.origin) || Array.isArray(n.originGroup));
console.log(`\nNames with array origins/groups: ${arrayOrigins.length.toLocaleString()}`);

console.log(`\n🎯 ROOT CAUSE ANALYSIS NEEDED:`);
console.log(`1. Is the filter logic correct? (check pattern matching)`);
console.log(`2. Are we checking all relevant origin values?`);
console.log(`3. Should we include more patterns? (British, Anglo-Saxon, etc.)`);
console.log(`4. Is the data structure consistent across all chunks?`);
