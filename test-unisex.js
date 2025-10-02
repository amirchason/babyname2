// Test unisex detection
const testNames = [
  { name: "Alex", gender: { Male: 0.6, Female: 0.4 } },     // Unisex (60/40)
  { name: "Jordan", gender: { Male: 0.55, Female: 0.45 } }, // Unisex (55/45)
  { name: "Taylor", gender: { Male: 0.45, Female: 0.55 } }, // Unisex (45/55)
  { name: "Michael", gender: { Male: 0.95, Female: 0.05 } },// Not unisex (95/5)
  { name: "Sarah", gender: { Male: 0.02, Female: 0.98 } },  // Not unisex (2/98)
  { name: "Casey", gender: { Male: 0.5, Female: 0.5 } },    // Perfect unisex (50/50)
  { name: "Riley", gender: { Male: 0.4, Female: 0.6 } },    // Unisex (40/60)
  { name: "Blake", gender: { Male: 0.35, Female: 0.65 } },  // Borderline unisex (35/65)
  { name: "James", gender: { Male: 0.99, Female: 0.01 } },  // Not unisex
];

function isUnisexName(name) {
  if (typeof name.gender === 'object' && name.gender) {
    const maleScore = name.gender.Male || 0;
    const femaleScore = name.gender.Female || 0;
    const total = maleScore + femaleScore;

    if (total === 0) return false;

    const maleRatio = maleScore / total;
    const threshold = 0.35;

    return maleRatio >= threshold && maleRatio <= (1 - threshold);
  }

  return false;
}

console.log("Testing Unisex Detection:");
console.log("=========================");

testNames.forEach(name => {
  const unisex = isUnisexName(name);
  const malePercent = Math.round((name.gender.Male || 0) * 100);
  const femalePercent = Math.round((name.gender.Female || 0) * 100);

  console.log(`${name.name.padEnd(10)} - ${malePercent}% M / ${femalePercent}% F => ${unisex ? '✅ UNISEX' : '❌ GENDERED'}`);
});

console.log("\n35% Threshold Test:");
console.log("Names are unisex if gender ratio is between 35%-65%");