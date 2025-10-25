/**
 * Complete enrichment pipeline for Robinson
 * V4 → V6 → V7 → Profile HTML
 */

const { enrichName } = require('./enrich-v3-comprehensive.js');
const { enrichWithCelestialData } = require('./enrich-v6-verified.js');
const fs = require('fs');

async function enrichRobinsonComplete() {
  console.log('🚀 Starting Complete Robinson Enrichment Pipeline\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  const name = 'Robinson';
  const gender = 'male';
  const origin = 'English';
  const meaning = 'Son of Robin';

  try {
    // STEP 1: V4 Comprehensive Enrichment
    console.log('📊 STEP 1: V4 Comprehensive Enrichment\n');
    await enrichName(name, gender, origin, meaning);
    console.log('\n✅ V4 enrichment complete!\n');

    await new Promise(resolve => setTimeout(resolve, 2000));

    // STEP 2: V6 Celestial Enhancement
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('🌟 STEP 2: V6 Celestial Enhancement\n');

    const v4Path = './public/data/enriched/robinson-v3-comprehensive.json';
    const v6Path = './public/data/enriched/robinson-v6.json';

    if (!fs.existsSync(v4Path)) {
      throw new Error(`V4 file not found: ${v4Path}`);
    }

    const v4Data = JSON.parse(fs.readFileSync(v4Path, 'utf8'));
    const v6Data = await enrichWithCelestialData(v4Data);

    fs.writeFileSync(v6Path, JSON.stringify(v6Data, null, 2));
    console.log(`💾 Saved: ${v6Path}\n`);
    console.log('✅ V6 enrichment complete!\n');

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('✨ Robinson V4 + V6 enrichment complete!');
    console.log('\n📋 Next steps:');
    console.log('   1. Run: node scripts/enrich-v7-enhanced.js robinson-v6.json');
    console.log('   2. Run: node scripts/build-robinson-v7-profile.js');
    console.log('   3. Deploy: npm run deploy\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
    throw error;
  }
}

// Run
if (require.main === module) {
  enrichRobinsonComplete().catch(console.error);
}

module.exports = { enrichRobinsonComplete };
