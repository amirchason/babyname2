/**
 * Enrich Giana with V4 comprehensive enrichment
 */

const { enrichNameV4 } = require('./test-v4-enrichment.js');

async function main() {
  console.log('🚀 Testing V4 Enrichment on Giana...\n');

  await enrichNameV4('Giana', 'female', 'Italian', 'God is gracious');

  console.log('\n✅ Giana v4 enrichment complete!');
}

main().catch(console.error);
