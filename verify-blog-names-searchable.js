/**
 * VERIFY BLOG NAMES ARE SEARCHABLE
 *
 * Checks that all 25 blog-enriched names:
 * - Are in the database
 * - Have correct schema (gender, popularityRank, etc.)
 * - Are searchable
 */

const fs = require('fs');

const CHUNK_FILE = './public/data/names-chunk1.json';

const BLOG_NAMES = [
  'Audrey', 'Vivian', 'Eliza', 'Millie', 'Celine', 'Flora', 'Harlow', 'Elsie',
  'Aylin', 'Louise', 'Luz', 'Blanca', 'Henrietta', 'Ray', 'Ginger', 'Hala',
  'Jaci', 'Kamaria', 'Chandra', 'Lucine', 'North', 'Badriyah', 'Marama',
  'Pensri', 'Marilyn'
];

const REQUIRED_FIELDS = [
  'name',
  'gender',
  'isUnisex',
  'origin',
  'meaning',
  'popularity',
  'rank',
  'count',
  'popularityRank', // CRITICAL for search
  'enriched',
  'meaningFull',
  'meaningShort',
  'originGroup'
];

function verifyBlogNames() {
  console.log('\n═══════════════════════════════════════════════════════════');
  console.log('        VERIFYING BLOG NAMES SEARCHABILITY');
  console.log('═══════════════════════════════════════════════════════════\n');

  // Load database
  const allNames = JSON.parse(fs.readFileSync(CHUNK_FILE, 'utf8'));
  console.log(`📚 Loaded ${allNames.length} names from database\n`);

  const results = {
    found: [],
    notFound: [],
    missingFields: [],
    incorrectGender: [],
    missingPopularityRank: [],
    allPassed: []
  };

  console.log('🔍 Checking each blog name...\n');

  for (const blogName of BLOG_NAMES) {
    const entry = allNames.find(n => n.name === blogName);

    if (!entry) {
      results.notFound.push(blogName);
      console.log(`❌ ${blogName}: NOT FOUND in database`);
      continue;
    }

    results.found.push(blogName);
    const issues = [];

    // Check gender format
    if (!['male', 'female', 'unisex'].includes(entry.gender)) {
      issues.push(`Invalid gender: ${entry.gender}`);
      results.incorrectGender.push(blogName);
    }

    // Check popularityRank (CRITICAL)
    if (!entry.popularityRank || entry.popularityRank === 999999) {
      issues.push(`Missing or default popularityRank: ${entry.popularityRank}`);
      results.missingPopularityRank.push(blogName);
    }

    // Check required fields (use === undefined to allow false values)
    const missing = REQUIRED_FIELDS.filter(field => entry[field] === undefined);
    if (missing.length > 0) {
      issues.push(`Missing fields: ${missing.join(', ')}`);
      results.missingFields.push({ name: blogName, missing });
    }

    // Display results
    if (issues.length > 0) {
      console.log(`⚠️  ${blogName}:`);
      issues.forEach(issue => console.log(`   - ${issue}`));
    } else {
      console.log(`✅ ${blogName}: All checks passed (rank: ${entry.rank}, gender: ${entry.gender})`);
      results.allPassed.push(blogName);
    }
  }

  // Summary
  console.log('\n═══════════════════════════════════════════════════════════');
  console.log('                    VERIFICATION REPORT');
  console.log('═══════════════════════════════════════════════════════════\n');

  console.log(`📊 SUMMARY:`);
  console.log(`   Total names checked: ${BLOG_NAMES.length}`);
  console.log(`   ✅ Passed all checks: ${results.allPassed.length}`);
  console.log(`   ⚠️  Found with issues: ${results.found.length - results.allPassed.length}`);
  console.log(`   ❌ Not found: ${results.notFound.length}\n`);

  if (results.notFound.length > 0) {
    console.log(`❌ NAMES NOT FOUND (${results.notFound.length}):`);
    results.notFound.forEach(name => console.log(`   - ${name}`));
    console.log();
  }

  if (results.incorrectGender.length > 0) {
    console.log(`⚠️  INCORRECT GENDER FORMAT (${results.incorrectGender.length}):`);
    results.incorrectGender.forEach(name => console.log(`   - ${name}`));
    console.log();
  }

  if (results.missingPopularityRank.length > 0) {
    console.log(`⚠️  MISSING/DEFAULT POPULARITY RANK (${results.missingPopularityRank.length}):`);
    results.missingPopularityRank.forEach(name => console.log(`   - ${name}`));
    console.log();
  }

  if (results.missingFields.length > 0) {
    console.log(`⚠️  MISSING FIELDS (${results.missingFields.length}):`);
    results.missingFields.forEach(item => {
      console.log(`   ${item.name}: ${item.missing.join(', ')}`);
    });
    console.log();
  }

  // Test search functionality
  console.log('🔎 TESTING SEARCH FUNCTIONALITY:\n');
  console.log('   Testing if names can be found by popularityRank...');

  const searchableNames = allNames
    .filter(n => BLOG_NAMES.includes(n.name))
    .filter(n => n.popularityRank && n.popularityRank !== 999999)
    .sort((a, b) => a.popularityRank - b.popularityRank);

  console.log(`   ✓ ${searchableNames.length} names have valid popularityRank`);
  console.log(`   ✓ Sorted by popularity:`);
  searchableNames.slice(0, 10).forEach(n => {
    console.log(`      ${n.name} (#${n.rank})`);
  });
  console.log();

  // Final verdict
  if (results.allPassed.length === BLOG_NAMES.length) {
    console.log('✅ SUCCESS: All 25 blog names passed verification!');
    console.log('✅ All names are properly formatted and searchable!');
  } else {
    console.log(`⚠️  WARNING: ${BLOG_NAMES.length - results.allPassed.length} names have issues`);
    console.log('   Please review the issues above and fix them.');
  }

  console.log('\n═══════════════════════════════════════════════════════════\n');

  return results;
}

// Run verification
verifyBlogNames();
