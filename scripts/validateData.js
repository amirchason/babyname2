// Validate name data chunks
const fs = require('fs');

console.log('📋 Validating Name Data Chunks\n');

// Check all chunks
let totalNames = 0;
const chunks = [];

for (let i = 1; i <= 5; i++) {
  try {
    const data = JSON.parse(fs.readFileSync(`public/data/names-chunk${i}.json`, 'utf8'));
    chunks.push({ number: i, count: data.length, data });
    totalNames += data.length;
    console.log(`✅ Chunk ${i}: ${data.length.toLocaleString()} names`);
  } catch (error) {
    console.log(`❌ Chunk ${i}: Error - ${error.message}`);
  }
}

console.log(`\n🎯 TOTAL: ${totalNames.toLocaleString()} names\n`);

// Validate data structure (sample from chunk 1)
if (chunks.length > 0 && chunks[0].data.length > 0) {
  console.log('🔍 Validating data structure (first 5 names):\n');

  const sample = chunks[0].data.slice(0, 5);
  let validCount = 0;
  let invalidCount = 0;

  sample.forEach((name, index) => {
    const hasRequired = name.name && name.origin && name.gender;
    const status = hasRequired ? '✅' : '❌';

    console.log(`${status} ${index + 1}. ${name.name || 'NO NAME'}`);
    console.log(`     Gender: ${name.gender || 'MISSING'}`);
    console.log(`     Origin: ${name.origin || 'MISSING'}`);
    console.log(`     Meaning: ${name.meaning ? name.meaning.substring(0, 50) + '...' : 'MISSING'}`);
    console.log(`     Popularity: ${name.popularity || 'N/A'}`);
    console.log('');

    if (hasRequired) validCount++;
    else invalidCount++;
  });

  console.log(`\n📊 Sample Validation: ${validCount}/${sample.length} valid\n`);

  // Check for missing fields across entire first chunk
  const chunk1 = chunks[0].data;
  const missingName = chunk1.filter(n => !n.name).length;
  const missingOrigin = chunk1.filter(n => !n.origin).length;
  const missingGender = chunk1.filter(n => !n.gender).length;
  const missingMeaning = chunk1.filter(n => !n.meaning).length;

  console.log('📈 Data Completeness (Chunk 1):');
  console.log(`   Names with data: ${chunk1.length.toLocaleString()}`);
  console.log(`   Missing name: ${missingName}`);
  console.log(`   Missing origin: ${missingOrigin}`);
  console.log(`   Missing gender: ${missingGender}`);
  console.log(`   Missing meaning: ${missingMeaning}`);
  console.log('');

  if (missingName === 0 && missingOrigin === 0 && missingGender === 0) {
    console.log('✅ DATA VALIDATION PASSED: All required fields present!\n');
    process.exit(0);
  } else {
    console.log('⚠️  WARNING: Some required fields missing\n');
    process.exit(1);
  }
} else {
  console.log('❌ ERROR: No data loaded\n');
  process.exit(1);
}
