/**
 * Complete enrichment pipeline for Jonas: V4 → V6 → V7
 */

import { spawn } from 'child_process';
import fs from 'fs';

const NAME = 'Jonas';
const GENDER = 'male';
const ORIGIN = 'Hebrew';
const MEANING = 'Dove';

console.log('🚀 Starting complete enrichment pipeline for Jonas\n');

// Step 1: V4 Comprehensive Enrichment
console.log('📍 STEP 1: V4 Comprehensive Enrichment');
console.log('----------------------------------------');

const v4Process = spawn('node', [
  'scripts/enrich-v3-comprehensive.js',
  NAME,
  GENDER,
  ORIGIN,
  MEANING
], { stdio: 'inherit' });

v4Process.on('close', (code) => {
  if (code !== 0) {
    console.error(`❌ V4 enrichment failed with code ${code}`);
    process.exit(1);
  }

  console.log('\n✅ V4 enrichment complete!');
  console.log('\n📍 STEP 2: V6 Celestial Enhancement');
  console.log('----------------------------------------');

  // Step 2: V6 Enhancement
  const v4Path = './public/data/enriched/jonas-v3-comprehensive.json';

  if (!fs.existsSync(v4Path)) {
    console.error(`❌ V4 file not found: ${v4Path}`);
    process.exit(1);
  }

  const v6Process = spawn('node', [
    'scripts/enrich-v6-verified.js',
    v4Path
  ], { stdio: 'inherit' });

  v6Process.on('close', (code) => {
    if (code !== 0) {
      console.error(`❌ V6 enrichment failed with code ${code}`);
      process.exit(1);
    }

    console.log('\n✅ V6 enrichment complete!');
    console.log('\n📍 STEP 3: V7 Enhancement (Translations, Categories, Books, Celebs)');
    console.log('----------------------------------------');

    // Step 3: V7 Enhancement
    const v7Process = spawn('node', [
      'scripts/enrich-v7-enhanced.js',
      NAME
    ], { stdio: 'inherit' });

    v7Process.on('close', (code) => {
      if (code !== 0) {
        console.error(`❌ V7 enrichment failed with code ${code}`);
        process.exit(1);
      }

      console.log('\n✅ V7 enrichment complete!');
      console.log('\n🎉 COMPLETE ENRICHMENT PIPELINE FINISHED!');
      console.log('=========================================');
      console.log(`✅ V4 data: public/data/enriched/jonas-v3-comprehensive.json`);
      console.log(`✅ V6 data: public/data/enriched/jonas-v6.json`);
      console.log(`✅ V7 data: public/data/enriched/jonas-v7.json`);
      console.log('\n📝 Next step: Build HTML profile with:');
      console.log('   node scripts/build-jonas-v7-profile.js');
    });
  });
});
