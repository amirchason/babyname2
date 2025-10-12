#!/usr/bin/env node

/**
 * Fast Themed Lists Validation Script (No Enrichment)
 *
 * This script validates themed lists using EXISTING data only.
 * No API calls - instant validation.
 */

const fs = require('fs');
const path = require('path');

// Load all name chunks
console.log('📚 Loading name database...\n');

const chunks = [
  require('./public/data/names-chunk1.json'),
  require('./public/data/names-chunk2.json'),
  require('./public/data/names-chunk3.json'),
  require('./public/data/names-chunk4.json')
];

// Build name lookup map
const nameDatabase = new Map();
let totalNames = 0;

chunks.forEach((chunk, index) => {
  const names = chunk.names || [];
  console.log(`  Chunk ${index + 1}: ${names.length.toLocaleString()} names`);
  names.forEach(name => {
    const key = name.name.toLowerCase();
    nameDatabase.set(key, name);
  });
  totalNames += names.length;
});

console.log(`\n✅ Loaded ${totalNames.toLocaleString()} names from database\n`);

/**
 * Validation functions
 */
function validateOriginList(name, requiredOrigins) {
  if (!name.origin) return { valid: false, reason: 'No origin data' };

  const origins = Array.isArray(name.origin) ? name.origin : [name.origin];
  const originStr = origins.join(' ').toLowerCase();

  const isValid = requiredOrigins.some(required =>
    originStr.includes(required.toLowerCase())
  );

  return {
    valid: isValid,
    reason: isValid ? '' : `Origin "${name.origin}" doesn't match required: ${requiredOrigins.join(', ')}`
  };
}

function validateMeaningList(name, keywords) {
  const meaningTexts = [
    name.meaning,
    name.meaningShort,
    name.meaningFull,
    ...(name.meanings || [])
  ].filter(Boolean);

  if (meaningTexts.length === 0) {
    return { valid: false, reason: 'No meaning data' };
  }

  const meaningStr = meaningTexts.join(' ').toLowerCase();

  const isValid = keywords.some(keyword =>
    meaningStr.includes(keyword.toLowerCase())
  );

  return {
    valid: isValid,
    reason: isValid ? '' : `Meaning "${name.meaning}" doesn't contain: ${keywords.join(', ')}`
  };
}

function validateNatureTheme(name) {
  const nameText = name.name.toLowerCase();
  const meaningText = (name.meaning || '').toLowerCase();

  const natureKeywords = [
    'tree', 'forest', 'flower', 'rose', 'lily', 'violet', 'daisy', 'iris',
    'river', 'brook', 'ocean', 'sea', 'lake', 'meadow', 'mountain', 'bloom',
    'stone', 'earth', 'sky', 'rain', 'wind', 'bird', 'deer', 'plant', 'nature'
  ];

  const isValid = natureKeywords.some(kw => nameText.includes(kw) || meaningText.includes(kw));

  return {
    valid: isValid,
    reason: isValid ? '' : `Not nature-related (meaning: "${name.meaning || 'unknown'}")`
  };
}

function validateCelestialTheme(name) {
  const nameText = name.name.toLowerCase();
  const meaningText = (name.meaning || '').toLowerCase();

  const celestialKeywords = [
    'star', 'moon', 'sun', 'sky', 'heaven', 'celestial', 'aurora', 'nova'
  ];

  const isValid = celestialKeywords.some(kw => nameText.includes(kw) || meaningText.includes(kw));

  return {
    valid: isValid,
    reason: isValid ? '' : `Not celestial (meaning: "${name.meaning || 'unknown'}")`
  };
}

function validateRoyalTheme(name) {
  const nameText = name.name.toLowerCase();
  const meaningText = (name.meaning || '').toLowerCase();

  const royalKeywords = ['king', 'queen', 'prince', 'princess', 'royal', 'regal', 'noble', 'crown'];
  const royalNames = ['elizabeth', 'victoria', 'catherine', 'charles', 'william', 'henry'];

  const isValid = royalKeywords.some(kw => meaningText.includes(kw)) ||
                  royalNames.some(kw => nameText === kw);

  return {
    valid: isValid,
    reason: isValid ? '' : `Not royal/regal (meaning: "${name.meaning || 'unknown'}")`
  };
}

function validateGemstoneTheme(name) {
  const nameText = name.name.toLowerCase();
  const meaningText = (name.meaning || '').toLowerCase();

  const gemstones = ['ruby', 'pearl', 'jade', 'amber', 'opal', 'sapphire', 'emerald', 'diamond', 'jewel', 'gem'];

  const isValid = gemstones.some(gem => nameText.includes(gem) || meaningText.includes(gem));

  return {
    valid: isValid,
    reason: isValid ? '' : `Not a gemstone (meaning: "${name.meaning || 'unknown'}")`
  };
}

function validateFlowerTheme(name) {
  const nameText = name.name.toLowerCase();
  const meaningText = (name.meaning || '').toLowerCase();

  const flowers = ['rose', 'lily', 'violet', 'daisy', 'iris', 'jasmine', 'ivy', 'poppy', 'flower', 'bloom'];

  const isValid = flowers.some(flower => nameText.includes(flower) || meaningText.includes(flower));

  return {
    valid: isValid,
    reason: isValid ? '' : `Not a flower (meaning: "${name.meaning || 'unknown'}")`
  };
}

function validateColorTheme(name) {
  const nameText = name.name.toLowerCase();
  const meaningText = (name.meaning || '').toLowerCase();

  const colors = ['white', 'black', 'red', 'blue', 'green', 'yellow', 'purple', 'pink', 'gold', 'silver'];

  const isValid = colors.some(color => nameText.includes(color) || meaningText.includes(color));

  return {
    valid: isValid,
    reason: isValid ? '' : `Not a color name (meaning: "${name.meaning || 'unknown'}")`
  };
}

/**
 * Validate a list
 */
function validateList(list) {
  console.log(`\n${'='.repeat(70)}`);
  console.log(`📋 ${list.title} (${list.category})`);
  console.log(`   Original: ${list.filterCriteria.specificNames?.length || 0} names`);

  const specificNames = list.filterCriteria.specificNames || [];
  const removals = [];
  let validCount = 0;
  let missingCount = 0;

  for (const nameStr of specificNames) {
    const key = nameStr.toLowerCase();
    const name = nameDatabase.get(key);

    if (!name) {
      missingCount++;
      removals.push({ name: nameStr, reason: 'Not in database' });
      continue;
    }

    let validation;

    if (list.category === 'origin') {
      validation = validateOriginList(name, list.filterCriteria.origins || []);
    } else if (list.category === 'meaning') {
      validation = validateMeaningList(name, list.filterCriteria.meaningKeywords || []);
    } else if (list.category === 'theme') {
      if (list.id === 'nature-inspired') {
        validation = validateNatureTheme(name);
      } else if (list.id === 'celestial') {
        validation = validateCelestialTheme(name);
      } else if (list.id === 'royal-regal') {
        validation = validateRoyalTheme(name);
      } else if (list.id === 'gemstone-names') {
        validation = validateGemstoneTheme(name);
      } else if (list.id === 'flower-botanical') {
        validation = validateFlowerTheme(name);
      } else if (list.id === 'color-names') {
        validation = validateColorTheme(name);
      } else {
        validation = { valid: true, reason: '' };
      }
    } else {
      validation = { valid: true, reason: '' };
    }

    if (validation.valid) {
      validCount++;
    } else {
      removals.push({ name: nameStr, reason: validation.reason });
    }
  }

  const accuracy = specificNames.length > 0 ? ((validCount / specificNames.length) * 100).toFixed(1) : 0;

  console.log(`   ✅ Valid: ${validCount}`);
  console.log(`   ❌ Invalid: ${removals.length}`);
  console.log(`   ⚠️  Missing: ${missingCount}`);
  console.log(`   📊 Accuracy: ${accuracy}%`);

  if (removals.length > 0 && removals.length <= 10) {
    console.log(`\n   Top issues:`);
    removals.slice(0, 10).forEach(r => {
      console.log(`   • ${r.name}: ${r.reason}`);
    });
  } else if (removals.length > 10) {
    console.log(`\n   Sample issues:`);
    removals.slice(0, 5).forEach(r => {
      console.log(`   • ${r.name}: ${r.reason}`);
    });
    console.log(`   ... and ${removals.length - 5} more`);
  }

  return {
    listId: list.id,
    listTitle: list.title,
    category: list.category,
    originalCount: specificNames.length,
    validCount,
    removedCount: removals.length,
    missingCount,
    accuracy: parseFloat(accuracy),
    removals
  };
}

/**
 * Main
 */
async function main() {
  console.log('🎯 FAST THEMED LISTS VALIDATION (NO ENRICHMENT)\n');

  // Load themed lists
  const themedListsPath = path.join(__dirname, 'src/data/themedLists.ts');
  const themedListsContent = fs.readFileSync(themedListsPath, 'utf-8');

  // Extract lists
  const listMatches = themedListsContent.match(/{\s*id:\s*['"](.*?)['"],[\s\S]*?specificNames:\s*\[([\s\S]*?)\]/g);

  if (!listMatches) {
    console.error('❌ Could not parse themed lists');
    process.exit(1);
  }

  const allResults = [];

  for (const listMatch of listMatches) {
    const idMatch = listMatch.match(/id:\s*['"](.*?)['"]/);
    const titleMatch = listMatch.match(/title:\s*['"](.*?)['"]/);
    const categoryMatch = listMatch.match(/category:\s*['"](.*?)['"]/);
    const originsMatch = listMatch.match(/origins:\s*\[(.*?)\]/);
    const keywordsMatch = listMatch.match(/meaningKeywords:\s*\[(.*?)\]/);
    const namesMatch = listMatch.match(/specificNames:\s*\[([\s\S]*?)\]/);

    if (!idMatch || !namesMatch) continue;

    const list = {
      id: idMatch[1],
      title: titleMatch?.[1] || idMatch[1],
      category: categoryMatch?.[1] || 'unknown',
      filterCriteria: {
        origins: originsMatch ? originsMatch[1].split(',').map(s => s.replace(/['"]/g, '').trim()).filter(Boolean) : [],
        meaningKeywords: keywordsMatch ? keywordsMatch[1].split(',').map(s => s.replace(/['"]/g, '').trim()).filter(Boolean) : [],
        specificNames: namesMatch[1]
          .split(',')
          .map(s => s.replace(/['"]/g, '').trim())
          .filter(Boolean)
      }
    };

    const result = validateList(list);
    allResults.push(result);
  }

  // Summary
  console.log('\n' + '='.repeat(70));
  console.log('📊 OVERALL SUMMARY');
  console.log('='.repeat(70));

  const totalOriginal = allResults.reduce((sum, r) => sum + r.originalCount, 0);
  const totalValid = allResults.reduce((sum, r) => sum + r.validCount, 0);
  const totalRemoved = allResults.reduce((sum, r) => sum + r.removedCount, 0);
  const totalMissing = allResults.reduce((sum, r) => sum + r.missingCount, 0);

  console.log(`\nTotal names: ${totalOriginal.toLocaleString()}`);
  console.log(`Valid: ${totalValid.toLocaleString()}`);
  console.log(`Invalid: ${totalRemoved.toLocaleString()}`);
  console.log(`Missing from DB: ${totalMissing.toLocaleString()}`);
  console.log(`Overall accuracy: ${((totalValid / totalOriginal) * 100).toFixed(1)}%\n`);

  // Breakdown by category
  const byCategory = allResults.reduce((acc, r) => {
    if (!acc[r.category]) acc[r.category] = { valid: 0, total: 0 };
    acc[r.category].valid += r.validCount;
    acc[r.category].total += r.originalCount;
    return acc;
  }, {});

  console.log('By category:');
  Object.entries(byCategory).forEach(([cat, stats]) => {
    const acc = ((stats.valid / stats.total) * 100).toFixed(1);
    console.log(`  ${cat}: ${stats.valid}/${stats.total} (${acc}%)`);
  });

  // Save report
  const reportPath = path.join(__dirname, 'THEMED_LISTS_VALIDATION_REPORT.md');
  let report = `# Themed Lists Validation Report\n\n`;
  report += `**Date:** ${new Date().toISOString()}\n`;
  report += `**Mode:** Fast validation (no enrichment)\n\n`;
  report += `## Summary\n\n`;
  report += `- **Total Names:** ${totalOriginal.toLocaleString()}\n`;
  report += `- **Valid:** ${totalValid.toLocaleString()}\n`;
  report += `- **Invalid:** ${totalRemoved.toLocaleString()}\n`;
  report += `- **Missing:** ${totalMissing.toLocaleString()}\n`;
  report += `- **Accuracy:** ${((totalValid / totalOriginal) * 100).toFixed(1)}%\n\n`;

  report += `## By Category\n\n`;
  Object.entries(byCategory).forEach(([cat, stats]) => {
    const acc = ((stats.valid / stats.total) * 100).toFixed(1);
    report += `- **${cat}:** ${stats.valid}/${stats.total} (${acc}%)\n`;
  });

  report += `\n## Detailed Results\n\n`;

  allResults.forEach(result => {
    report += `### ${result.listTitle}\n\n`;
    report += `- **ID:** ${result.listId}\n`;
    report += `- **Category:** ${result.category}\n`;
    report += `- **Original:** ${result.originalCount}\n`;
    report += `- **Valid:** ${result.validCount}\n`;
    report += `- **Invalid:** ${result.removedCount}\n`;
    report += `- **Accuracy:** ${result.accuracy}%\n\n`;

    if (result.removals.length > 0) {
      report += `#### Invalid Names\n\n`;
      report += `| Name | Reason |\n`;
      report += `|------|--------|\n`;
      result.removals.forEach(removal => {
        report += `| ${removal.name} | ${removal.reason} |\n`;
      });
      report += `\n`;
    }
  });

  fs.writeFileSync(reportPath, report);
  console.log(`\n📄 Report saved: ${reportPath}\n`);

  console.log('✅ Validation complete!\n');
}

main().catch(error => {
  console.error('\n❌ Error:', error);
  process.exit(1);
});
