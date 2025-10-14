/**
 * Verify Blog Names Against Database
 * Extracts all unique names from blog posts and checks if they exist in the 174k database
 */

const fs = require('fs');
const path = require('path');

// Load database chunks
const CHUNK_FILES = [
  path.join(__dirname, '../public/data/names-chunk1.json'),
  path.join(__dirname, '../public/data/names-chunk2.json'),
  path.join(__dirname, '../public/data/names-chunk3.json'),
  path.join(__dirname, '../public/data/names-chunk4.json')
];

// Extract all names from HTML content
function extractNamesFromHTML(html) {
  const names = new Set();

  // Pattern 1: <strong>1. Name</strong> or <strong>Name</strong>
  const strongPattern = /<strong>(?:\d+\.\s+)?([A-Z][a-z]+(?:\/[A-Z][a-z]+)?)<\/strong>/g;
  let match;
  while ((match = strongPattern.exec(html)) !== null) {
    const name = match[1].trim();
    // Split compound names like "Eleanor/Elenor"
    name.split('/').forEach(n => names.add(n.trim()));
  }

  // Pattern 2: <li><strong>Name</strong>
  const listPattern = /<li><strong>([A-Z][a-z]+(?:\/[A-Z][a-z]+)?)<\/strong>/g;
  while ((match = listPattern.exec(html)) !== null) {
    const name = match[1].trim();
    name.split('/').forEach(n => names.add(n.trim()));
  }

  return Array.from(names);
}

// Load all database names into memory (case-insensitive for matching)
function loadDatabaseNames() {
  console.log('📂 Loading database from 4 chunks...');
  const allNames = new Set();

  for (const chunkFile of CHUNK_FILES) {
    if (fs.existsSync(chunkFile)) {
      const chunk = JSON.parse(fs.readFileSync(chunkFile, 'utf8'));
      chunk.forEach(entry => {
        if (entry.name) {
          allNames.add(entry.name.toLowerCase());
        }
      });
    }
  }

  console.log(`✅ Loaded ${allNames.size.toLocaleString()} unique names from database\n`);
  return allNames;
}

// Extract all names from all blog posts
function extractAllBlogNames() {
  const blogDir = __dirname;
  const files = fs.readdirSync(blogDir)
    .filter(f => f.startsWith('post-') && f.endsWith('.json'))
    .sort();

  const allBlogNames = new Set();
  const namesByPost = {};

  files.forEach(file => {
    const filePath = path.join(blogDir, file);
    const content = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    const names = extractNamesFromHTML(content.content);

    namesByPost[file] = names;
    names.forEach(name => allBlogNames.add(name));
  });

  return { allBlogNames: Array.from(allBlogNames).sort(), namesByPost };
}

// Main verification
async function verifyNames() {
  console.log('🔍 Blog Names Database Verification\n');
  console.log('=' .repeat(60) + '\n');

  // Load database
  const dbNames = loadDatabaseNames();

  // Extract blog names
  console.log('📝 Extracting names from blog posts...');
  const { allBlogNames, namesByPost } = extractAllBlogNames();
  console.log(`✅ Found ${allBlogNames.length} unique names across all blog posts\n`);

  // Verify each name
  const missing = [];
  const found = [];

  allBlogNames.forEach(name => {
    const normalizedName = name.toLowerCase();
    if (dbNames.has(normalizedName)) {
      found.push(name);
    } else {
      missing.push(name);
    }
  });

  // Generate report
  const report = {
    timestamp: new Date().toISOString(),
    summary: {
      totalBlogNames: allBlogNames.length,
      foundInDatabase: found.length,
      missingFromDatabase: missing.length,
      databaseSize: dbNames.size,
      coveragePercent: ((found.length / allBlogNames.length) * 100).toFixed(1) + '%'
    },
    missingNames: missing.sort(),
    foundNames: found.sort(),
    namesByPost
  };

  // Display results
  console.log('=== VERIFICATION RESULTS ===\n');
  console.log(`✅ Found in Database: ${found.length} names (${report.summary.coveragePercent})`);
  console.log(`❌ Missing from Database: ${missing.length} names\n`);

  if (missing.length > 0) {
    console.log('🚨 MISSING NAMES (Need to create these):');
    missing.forEach((name, index) => {
      console.log(`   ${index + 1}. ${name}`);
    });
    console.log('');
  } else {
    console.log('🎉 SUCCESS! All blog names exist in the database!\n');
  }

  // Save report
  const reportPath = path.join(__dirname, 'database-verification-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(`📄 Full report saved to: ${reportPath}`);

  // Save missing names list for enrichment
  if (missing.length > 0) {
    const missingListPath = path.join(__dirname, 'missing-names-to-create.json');
    fs.writeFileSync(missingListPath, JSON.stringify({
      count: missing.length,
      names: missing,
      note: 'These names need to be created with GPT-4 enrichment (origin, meaning, gender)'
    }, null, 2));
    console.log(`📝 Missing names list saved to: ${missingListPath}`);
    console.log(`\n⚠️  ACTION REQUIRED: Create ${missing.length} missing names using GPT-4 enrichment\n`);
  }

  return report;
}

// Run verification
verifyNames().then(report => {
  process.exit(report.summary.missingFromDatabase > 0 ? 1 : 0);
}).catch(err => {
  console.error('❌ Error during verification:', err);
  process.exit(1);
});
