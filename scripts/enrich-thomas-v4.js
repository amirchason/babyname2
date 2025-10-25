/**
 * Enrich Thomas with V4 comprehensive enrichment
 */

const { enrichNameV4 } = require('./test-v4-enrichment.js');

async function main() {
  console.log('🚀 Testing V4 Enrichment on Thomas (with pre-1920 requirement)...\n');

  await enrichNameV4('Thomas', 'male', 'Aramaic', 'Twin');

  console.log('\n✅ Thomas v4 enrichment complete!');
}

main().catch(console.error);
