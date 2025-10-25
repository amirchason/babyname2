/**
 * Enrich John name with v3 comprehensive data
 */

const { enrichName } = require('./enrich-v3-comprehensive.js');

async function main() {
  console.log('🚀 Enriching John with V3 Comprehensive Data...\n');

  await enrichName('John', 'male', 'Hebrew', 'God is gracious');

  console.log('\n✅ John enrichment complete!');
}

main().catch(console.error);
