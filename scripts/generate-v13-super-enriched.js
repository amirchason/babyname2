#!/usr/bin/env node

/**
 * V13 SUPER ENRICHED - ALL VERSIONS COMBINED
 *
 * Merges ALL data from V6, V7, V8, V10, V11 into one comprehensive profile
 */

const fs = require('fs');
const path = require('path');

const nameLower = process.argv[2];

if (!nameLower) {
  console.error('Usage: node generate-v13-super-enriched.js <name>');
  process.exit(1);
}

const nameCapitalized = nameLower.charAt(0).toUpperCase() + nameLower.slice(1).toLowerCase();

console.log(`\n🌟 V13 SUPER ENRICHED GENERATOR\n`);
console.log(`📝 Name: ${nameCapitalized}`);
console.log(`🔄 Merging: V6 + V7 + V8 + V10 + V11\n`);

const enrichedDir = path.join(__dirname, '..', 'public', 'data', 'enriched');

// Load all versions
const versions = {};
['v6', 'v7', 'v8', 'v10', 'v11'].forEach(version => {
  const filePath = path.join(enrichedDir, `${nameLower}-${version}.json`);
  if (fs.existsSync(filePath)) {
    versions[version] = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    console.log(`✅ Loaded ${version}: ${Object.keys(versions[version]).length} keys`);
  } else {
    console.log(`⚠️  ${version} not found`);
  }
});

// Merge all versions into super enriched
const v13 = {
  name: nameCapitalized,
  enrichmentVersion: 'v13_super_enriched',
  enrichedAt: new Date().toISOString(),
  dataSource: 'Super enriched combining V6, V7, V8, V10, V11',
  versionsIncluded: Object.keys(versions),

  // Core data from V10 (cleanest)
  ...(versions.v10 || {}),

  // Add V8 unique fields that were removed
  ...(versions.v8 && {
    categories: versions.v8.categories,
    celebrityBabies: versions.v8.celebrityBabies,
    inspiration: versions.v8.inspiration,
    syllables: versions.v8.syllables,
    translations: versions.v8.translations,
  }),

  // V11 blog content
  ...(versions.v11 && {
    v11BlogContent: versions.v11.v11BlogContent,
    v11Writer: versions.v11.v11Writer,
    v11WriterName: versions.v11.v11WriterName,
    v11WriterTitle: versions.v11.v11WriterTitle,
  }),

  // Version snapshots for reference
  versionSnapshots: {
    v6: versions.v6 ? `${Object.keys(versions.v6).length} fields` : 'N/A',
    v7: versions.v7 ? `${Object.keys(versions.v7).length} fields` : 'N/A',
    v8: versions.v8 ? `${Object.keys(versions.v8).length} fields` : 'N/A',
    v10: versions.v10 ? `${Object.keys(versions.v10).length} fields` : 'N/A',
    v11: versions.v11 ? 'Blog content + writer' : 'N/A',
  },

  // Update metadata
  enrichmentVersion: 'v13_super_enriched',
  enrichedAt: new Date().toISOString(),
};

// Save V13
const v13Path = path.join(enrichedDir, `${nameLower}-v13.json`);
fs.writeFileSync(v13Path, JSON.stringify(v13, null, 2));

console.log(`\n✅ V13 Super Enriched saved: ${v13Path}`);
console.log(`📊 Total keys: ${Object.keys(v13).length}`);
console.log(`📦 Versions merged: ${v13.versionsIncluded.join(', ')}\n`);

// Show what's included
console.log(`🎁 WHAT'S INCLUDED:\n`);
console.log(`✨ From V10 (base): All 29 production fields`);
if (versions.v8) {
  console.log(`✨ From V8 (bonus): categories, celebrityBabies, inspiration, syllables, translations`);
}
if (versions.v11) {
  console.log(`✨ From V11 (blog): 10-section narrative by ${v13.v11WriterName}`);
}
console.log(`✨ Total: ${Object.keys(v13).length} fields + nested data\n`);
