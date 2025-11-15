/**
 * REGENERATE V13 MANIFEST
 *
 * Scans public/data/enriched/ for actual *-v13.json files
 * and generates an accurate manifest file.
 *
 * Usage: node scripts/regenerateV13Manifest.js
 */

const fs = require('fs');
const path = require('path');

const enrichedDir = path.join(__dirname, '../public/data/enriched');
const manifestPath = path.join(enrichedDir, 'v13-manifest.json');

console.log('📝 Scanning enriched directory...');

// Get all v13 JSON files
const files = fs.readdirSync(enrichedDir)
  .filter(f => f.endsWith('-v13.json') && f !== 'v13-manifest.json')
  .map(f => f.replace('-v13.json', '').toLowerCase())
  .sort();

console.log(`✅ Found ${files.length} enriched v13 files`);

// Create manifest
const manifest = {
  version: "1.0",
  lastUpdated: new Date().toISOString(),
  totalEnriched: files.length,
  names: files
};

// Write manifest
fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));

console.log(`✅ Manifest regenerated: ${files.length} names`);
console.log(`📄 Saved to: ${manifestPath}`);
console.log('');
console.log('Sample names:', files.slice(0, 10).join(', '));
