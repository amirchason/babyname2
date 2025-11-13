#!/usr/bin/env node

/**
 * 🔍 V13 VERIFICATION SCRIPT
 *
 * Verifies that all 100 v13 enrichment files are:
 * - Present in the enriched directory
 * - Valid JSON
 * - Contain all required v13 fields
 * - Have reasonable file sizes
 */

const fs = require('fs');
const path = require('path');

const CONFIG = {
  enrichedDir: path.join(__dirname, 'data', 'enriched'),
  topNamesFile: path.join(__dirname, 'data', 'ultimateNames_tier1.json'),
  minFileSize: 5000, // 5KB minimum
  maxFileSize: 500000 // 500KB maximum
};

const REQUIRED_V13_FIELDS = [
  'nameVibes',
  'namingTrends',
  'soundAndFeel',
  'siblingNames',
  'middleNameSuggestions',
  'realParentReviews',
  'professionalImpression',
  'socialMediaPresence',
  'ageAssociation'
];

function loadTop100Names() {
  const data = JSON.parse(fs.readFileSync(CONFIG.topNamesFile, 'utf8'));
  return data.names.slice(0, 100).map(n => n.n);
}

function verifyFile(name) {
  const filename = `${name.toLowerCase()}-v13.json`;
  const filepath = path.join(CONFIG.enrichedDir, filename);

  const result = {
    name,
    exists: false,
    validJSON: false,
    hasV13Fields: false,
    sizeOK: false,
    errors: []
  };

  // Check existence
  if (!fs.existsSync(filepath)) {
    result.errors.push('File does not exist');
    return result;
  }
  result.exists = true;

  // Check file size
  const stats = fs.statSync(filepath);
  if (stats.size < CONFIG.minFileSize) {
    result.errors.push(`File too small (${stats.size} bytes)`);
  } else if (stats.size > CONFIG.maxFileSize) {
    result.errors.push(`File too large (${stats.size} bytes)`);
  } else {
    result.sizeOK = true;
  }

  // Check valid JSON
  try {
    const content = fs.readFileSync(filepath, 'utf8');
    const data = JSON.parse(content);
    result.validJSON = true;

    // Check v13 fields
    const missingFields = REQUIRED_V13_FIELDS.filter(field => !data[field]);
    if (missingFields.length === 0) {
      result.hasV13Fields = true;
    } else {
      result.errors.push(`Missing v13 fields: ${missingFields.join(', ')}`);
    }

  } catch (error) {
    result.errors.push(`Invalid JSON: ${error.message}`);
  }

  return result;
}

function main() {
  console.log(`
╔════════════════════════════════════════════════════════════╗
║                                                            ║
║           🔍 V13 VERIFICATION SCRIPT                      ║
║           SoulSeed Baby Names                              ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝
  `);

  console.log(`📂 Loading top 100 names...`);
  const names = loadTop100Names();
  console.log(`✅ Loaded ${names.length} names\n`);

  console.log(`🔍 Verifying v13 enrichment files...\n`);

  const results = names.map(verifyFile);

  // Statistics
  const stats = {
    total: results.length,
    exists: results.filter(r => r.exists).length,
    validJSON: results.filter(r => r.validJSON).length,
    hasV13Fields: results.filter(r => r.hasV13Fields).length,
    sizeOK: results.filter(r => r.sizeOK).length,
    fullyValid: results.filter(r => r.exists && r.validJSON && r.hasV13Fields && r.sizeOK).length
  };

  // Display results
  console.log(`${'='.repeat(60)}`);
  console.log(`📊 VERIFICATION RESULTS`);
  console.log(`${'='.repeat(60)}\n`);

  console.log(`✅ Files exist:        ${stats.exists}/${stats.total}`);
  console.log(`✅ Valid JSON:         ${stats.validJSON}/${stats.total}`);
  console.log(`✅ Has v13 fields:     ${stats.hasV13Fields}/${stats.total}`);
  console.log(`✅ Size OK:            ${stats.sizeOK}/${stats.total}`);
  console.log(`✅ Fully valid:        ${stats.fullyValid}/${stats.total}\n`);

  // Show failures
  const failures = results.filter(r => r.errors.length > 0);
  if (failures.length > 0) {
    console.log(`❌ FAILED FILES (${failures.length}):\n`);
    failures.forEach(f => {
      console.log(`   ${f.name}:`);
      f.errors.forEach(err => console.log(`      - ${err}`));
      console.log();
    });
  }

  // Final verdict
  console.log(`${'='.repeat(60)}`);
  if (stats.fullyValid === stats.total) {
    console.log(`🎉 SUCCESS! All ${stats.total} files are fully valid!`);
    console.log(`${'='.repeat(60)}\n`);
    process.exit(0);
  } else {
    console.log(`⚠️  WARNING: ${stats.total - stats.fullyValid} files need attention`);
    console.log(`${'='.repeat(60)}\n`);
    process.exit(1);
  }
}

main();
