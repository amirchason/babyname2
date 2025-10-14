const fs = require('fs');
const path = require('path');

/**
 * Verify Blog Name Quality Script
 *
 * Analyzes all blog post names and checks:
 * 1. Which names are in database
 * 2. Enrichment quality (meaning, origin, completeness)
 * 3. Names with generic/incomplete data
 * 4. Missing originGroup or meaningShort fields
 */

// Extract names from blog posts
function extractBlogNames() {
  const blogDir = path.join(__dirname, 'blog-posts-seo');
  const blogFiles = fs.readdirSync(blogDir).filter(f => f.endsWith('.json'));

  const allNames = new Set();
  const namesByBlog = {};

  blogFiles.forEach(file => {
    try {
      const blogData = JSON.parse(fs.readFileSync(path.join(blogDir, file), 'utf8'));

      // Skip non-blog-post files (reports, summaries, etc.)
      if (!blogData.content || !blogData.slug || !blogData.title) {
        return;
      }

      const names = [];

      // Extract names from content (wrapped in <strong> tags)
      const strongMatches = blogData.content.match(/<strong>(.*?)<\/strong>/g) || [];
      strongMatches.forEach(match => {
        const name = match.replace(/<\/?strong>/g, '').trim();
        if (name && name.length > 1 && /^[A-Z][a-z]+$/.test(name)) {
          names.push(name);
          allNames.add(name);
        }
      });

      namesByBlog[blogData.slug] = {
        title: blogData.title,
        names: names,
        count: names.length
      };
    } catch (err) {
      console.warn(`⚠️  Skipping ${file}: ${err.message}`);
    }
  });

  console.log(`\n📊 Extracted ${allNames.size} unique names from ${blogFiles.length} blog posts\n`);
  return { allNames: Array.from(allNames).sort(), namesByBlog };
}

// Load all database chunks
function loadDatabase() {
  let allNames = [];
  let chunksLoaded = 0;

  for (let i = 1; i <= 5; i++) {
    const chunkPath = path.join(__dirname, 'public', 'data', `names-chunk${i}.json`);
    if (fs.existsSync(chunkPath)) {
      try {
        const chunkData = fs.readFileSync(chunkPath, 'utf8');
        const chunk = JSON.parse(chunkData);

        if (Array.isArray(chunk)) {
          allNames = allNames.concat(chunk);
          chunksLoaded++;
        } else {
          console.warn(`⚠️  Chunk ${i} is not an array, skipping`);
        }
      } catch (err) {
        console.warn(`⚠️  Error loading chunk ${i}: ${err.message}`);
      }
    }
  }

  // Create name lookup map
  const nameMap = new Map();
  allNames.forEach(entry => {
    if (entry && entry.name) {
      nameMap.set(entry.name, entry);
    }
  });

  console.log(`📚 Loaded ${nameMap.size} names from ${chunksLoaded} database chunks\n`);
  return nameMap;
}

// Analyze enrichment quality
function analyzeQuality(blogNames, database) {
  const results = {
    inDatabase: [],
    notInDatabase: [],
    enriched: [],
    notEnriched: [],
    genericMeanings: [],
    missingOriginGroup: [],
    missingMeaningShort: [],
    complete: []
  };

  blogNames.forEach(name => {
    const entry = database.get(name);

    if (!entry) {
      results.notInDatabase.push(name);
      return;
    }

    results.inDatabase.push(name);

    // Check enrichment status
    const hasEnrichment = entry.meaningFull || entry.meaningProcessed || entry.originProcessed;
    if (hasEnrichment) {
      results.enriched.push(name);
    } else {
      results.notEnriched.push(name);
    }

    // Check for generic meanings
    const meaning = entry.meaningFull || entry.meaning || '';
    const genericPatterns = [
      /^Modern name$/i,
      /^Unknown$/i,
      /^Variant of/i,
      /^Form of/i,
      /^No meaning available/i,
      /^Meaning unknown/i
    ];
    if (genericPatterns.some(pattern => pattern.test(meaning))) {
      results.genericMeanings.push({ name, meaning });
    }

    // Check for missing fields
    if (!entry.originGroup) {
      results.missingOriginGroup.push(name);
    }
    if (!entry.meaningShort) {
      results.missingMeaningShort.push(name);
    }

    // Check if complete
    if (entry.meaningFull && entry.originGroup && entry.meaningShort && meaning.length > 20) {
      results.complete.push(name);
    }
  });

  return results;
}

// Generate report
function generateReport(results, namesByBlog) {
  console.log('=' .repeat(80));
  console.log('📋 BLOG NAME QUALITY REPORT');
  console.log('='.repeat(80));
  console.log();

  // Overview
  console.log('📊 OVERVIEW:');
  console.log(`   Total unique names: ${results.inDatabase.length + results.notInDatabase.length}`);
  console.log(`   ✅ In database: ${results.inDatabase.length} (${((results.inDatabase.length / (results.inDatabase.length + results.notInDatabase.length)) * 100).toFixed(1)}%)`);
  console.log(`   ❌ Not in database: ${results.notInDatabase.length}`);
  console.log();

  // Enrichment status
  console.log('🔍 ENRICHMENT STATUS:');
  console.log(`   ✅ Enriched: ${results.enriched.length} (${((results.enriched.length / results.inDatabase.length) * 100).toFixed(1)}%)`);
  console.log(`   ⏳ Not enriched: ${results.notEnriched.length}`);
  console.log(`   ⭐ Complete: ${results.complete.length} (${((results.complete.length / results.inDatabase.length) * 100).toFixed(1)}%)`);
  console.log();

  // Quality issues
  console.log('⚠️  QUALITY ISSUES:');
  console.log(`   Generic meanings: ${results.genericMeanings.length}`);
  console.log(`   Missing originGroup: ${results.missingOriginGroup.length}`);
  console.log(`   Missing meaningShort: ${results.missingMeaningShort.length}`);
  console.log();

  // Details
  if (results.notInDatabase.length > 0) {
    console.log('❌ NAMES NOT IN DATABASE:');
    results.notInDatabase.forEach(name => console.log(`   - ${name}`));
    console.log();
  }

  if (results.notEnriched.length > 0) {
    console.log('⏳ NAMES NOT ENRICHED (need processing):');
    results.notEnriched.slice(0, 20).forEach(name => console.log(`   - ${name}`));
    if (results.notEnriched.length > 20) {
      console.log(`   ... and ${results.notEnriched.length - 20} more`);
    }
    console.log();
  }

  if (results.genericMeanings.length > 0) {
    console.log('⚠️  GENERIC/INCOMPLETE MEANINGS (need re-enrichment):');
    results.genericMeanings.slice(0, 10).forEach(({ name, meaning }) => {
      console.log(`   - ${name}: "${meaning}"`);
    });
    if (results.genericMeanings.length > 10) {
      console.log(`   ... and ${results.genericMeanings.length - 10} more`);
    }
    console.log();
  }

  // Blog breakdown
  console.log('📚 NAMES BY BLOG POST:');
  Object.entries(namesByBlog).forEach(([slug, data]) => {
    console.log(`   ${data.title}: ${data.count} names`);
  });
  console.log();

  // Recommendations
  console.log('💡 RECOMMENDATIONS:');
  if (results.notInDatabase.length > 0) {
    console.log(`   1. Add ${results.notInDatabase.length} missing names to database`);
  }
  if (results.notEnriched.length > 0) {
    console.log(`   2. Enrich ${results.notEnriched.length} names without enrichment data`);
  }
  if (results.genericMeanings.length > 0) {
    console.log(`   3. Re-enrich ${results.genericMeanings.length} names with generic meanings`);
  }
  if (results.missingMeaningShort.length > 0) {
    console.log(`   4. Add meaningShort to ${results.missingMeaningShort.length} names for card display`);
  }
  if (results.missingOriginGroup.length > 0) {
    console.log(`   5. Add originGroup to ${results.missingOriginGroup.length} names for consistency`);
  }
  console.log();

  console.log('='.repeat(80));

  // Save detailed report
  const reportPath = path.join(__dirname, 'blog-name-quality-report.json');
  fs.writeFileSync(reportPath, JSON.stringify({
    timestamp: new Date().toISOString(),
    summary: {
      totalNames: results.inDatabase.length + results.notInDatabase.length,
      inDatabase: results.inDatabase.length,
      notInDatabase: results.notInDatabase.length,
      enriched: results.enriched.length,
      complete: results.complete.length,
      needsWork: results.genericMeanings.length + results.notEnriched.length
    },
    details: results,
    blogBreakdown: namesByBlog
  }, null, 2));

  console.log(`\n📄 Detailed report saved to: ${reportPath}\n`);
}

// Main execution
console.log('\n🚀 Starting blog name quality validation...\n');

const { allNames, namesByBlog } = extractBlogNames();
const database = loadDatabase();
const results = analyzeQuality(allNames, database);
generateReport(results, namesByBlog);

console.log('✅ Quality validation complete!\n');
