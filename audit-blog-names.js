/**
 * COMPREHENSIVE BLOG NAMES AUDIT
 *
 * Scans ALL blog posts and creates a complete audit of:
 * - All unique names mentioned in blogs
 * - Which names are in the database
 * - Which names have blog enrichment markers
 * - Current database state for each name
 */

const fs = require('fs');
const path = require('path');

const BLOG_POSTS_DIR = './blog-posts-seo';
const CHUNK_FILES = [
  './public/data/names-chunk1.json',
  './public/data/names-chunk2.json',
  './public/data/names-chunk3.json',
  './public/data/names-chunk4.json',
  './public/data/names-chunk5.json'
];

// Extract names from HTML content
function extractNamesFromHTML(htmlContent) {
  const strongRegex = /<strong>(.*?)<\/strong>/gi;
  const names = [];
  let match;

  while ((match = strongRegex.exec(htmlContent)) !== null) {
    const text = match[1].trim();
    // Validate: should be a name (letters, spaces, hyphens, apostrophes only)
    if (text &&
        text.length > 1 &&
        text.length < 30 &&
        /^[A-Z][A-Za-z\s\-']+$/.test(text) &&
        !text.includes(' and ') &&
        !text.includes(' or ') &&
        !text.includes(' the ')) {
      names.push(text);
    }
  }

  return names;
}

// Load all blog posts
function loadAllBlogPosts() {
  const posts = [];

  if (!fs.existsSync(BLOG_POSTS_DIR)) {
    console.error(`❌ Blog posts directory not found: ${BLOG_POSTS_DIR}`);
    return posts;
  }

  const files = fs.readdirSync(BLOG_POSTS_DIR)
    .filter(f => f.endsWith('.json') && f.startsWith('post-'));

  console.log(`📁 Found ${files.length} blog post files\n`);

  for (const file of files) {
    const filePath = path.join(BLOG_POSTS_DIR, file);
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const blogData = JSON.parse(content);

      if (blogData.content && blogData.slug && blogData.title) {
        posts.push({
          file,
          slug: blogData.slug,
          title: blogData.title,
          content: blogData.content
        });
      }
    } catch (err) {
      console.warn(`⚠️ Skipping ${file}: ${err.message}`);
    }
  }

  return posts;
}

// Load all database chunks
function loadAllDatabaseChunks() {
  const allNames = [];

  for (const chunkFile of CHUNK_FILES) {
    if (fs.existsSync(chunkFile)) {
      try {
        const chunk = JSON.parse(fs.readFileSync(chunkFile, 'utf8'));
        allNames.push(...chunk);
        console.log(`✓ Loaded ${chunk.length} names from ${path.basename(chunkFile)}`);
      } catch (err) {
        console.warn(`⚠️ Failed to load ${chunkFile}: ${err.message}`);
      }
    }
  }

  return allNames;
}

// Main audit function
function auditBlogNames() {
  console.log('═══════════════════════════════════════════════════════════');
  console.log('         COMPREHENSIVE BLOG NAMES AUDIT');
  console.log('═══════════════════════════════════════════════════════════\n');

  // Step 1: Load all blog posts
  console.log('📚 STEP 1: Loading all blog posts...');
  const blogPosts = loadAllBlogPosts();

  if (blogPosts.length === 0) {
    console.error('❌ No blog posts found!');
    return;
  }

  console.log(`✓ Loaded ${blogPosts.length} blog posts\n`);

  // Step 2: Extract ALL names from all blog posts
  console.log('🔍 STEP 2: Extracting names from blog posts...\n');
  const namesByBlog = {};
  const allBlogNames = new Set();

  for (const post of blogPosts) {
    const names = extractNamesFromHTML(post.content);
    const uniqueNames = [...new Set(names)];
    namesByBlog[post.slug] = uniqueNames;
    uniqueNames.forEach(name => allBlogNames.add(name));

    console.log(`📝 ${post.title}`);
    console.log(`   File: ${post.file}`);
    console.log(`   Names found: ${uniqueNames.length}`);
    console.log(`   Names: ${uniqueNames.slice(0, 10).join(', ')}${uniqueNames.length > 10 ? '...' : ''}`);
    console.log();
  }

  console.log(`✓ Total unique names across all blogs: ${allBlogNames.size}\n`);

  // Step 3: Load database
  console.log('💾 STEP 3: Loading database...\n');
  const allDatabaseNames = loadAllDatabaseChunks();
  console.log(`✓ Total names in database: ${allDatabaseNames.length}\n`);

  // Step 4: Analyze each blog name
  console.log('🔬 STEP 4: Analyzing blog names in database...\n');

  const analysis = {
    inDatabase: [],
    notInDatabase: [],
    blogEnriched: [],
    originalDatabase: []
  };

  for (const blogName of allBlogNames) {
    const dbEntry = allDatabaseNames.find(n => n.name === blogName);

    if (dbEntry) {
      analysis.inDatabase.push(blogName);

      // Check if it has blog enrichment markers
      const isBlogEnriched =
        dbEntry.enrichmentSource === 'blog-post-enrichment-script' ||
        dbEntry.enrichmentSource === 'blog-name-scraper' ||
        dbEntry.enrichmentSource === 'blog-enrichment';

      if (isBlogEnriched) {
        analysis.blogEnriched.push({
          name: blogName,
          gender: dbEntry.gender,
          rank: dbEntry.rank,
          popularityRank: dbEntry.popularityRank,
          enrichmentSource: dbEntry.enrichmentSource,
          enrichmentDate: dbEntry.enrichmentDate
        });
      } else {
        analysis.originalDatabase.push(blogName);
      }
    } else {
      analysis.notInDatabase.push(blogName);
    }
  }

  // Step 5: Generate report
  console.log('═══════════════════════════════════════════════════════════');
  console.log('                    AUDIT REPORT');
  console.log('═══════════════════════════════════════════════════════════\n');

  console.log(`📊 SUMMARY:`);
  console.log(`   Total unique blog names: ${allBlogNames.size}`);
  console.log(`   ✓ In database: ${analysis.inDatabase.length} (${(analysis.inDatabase.length/allBlogNames.size*100).toFixed(1)}%)`);
  console.log(`   ✗ Missing from database: ${analysis.notInDatabase.length}`);
  console.log(`   🔧 Blog-enriched entries: ${analysis.blogEnriched.length}`);
  console.log(`   📚 Original database names: ${analysis.originalDatabase.length}\n`);

  console.log(`🆕 BLOG-ENRICHED NAMES (${analysis.blogEnriched.length}):`);
  console.log(`   These names were added through blog enrichment scripts:\n`);
  analysis.blogEnriched.forEach((entry, i) => {
    console.log(`   ${i+1}. ${entry.name}`);
    console.log(`      Gender: ${entry.gender}`);
    console.log(`      Rank: ${entry.rank}`);
    console.log(`      PopularityRank: ${entry.popularityRank}`);
    console.log(`      Source: ${entry.enrichmentSource}`);
    console.log(`      Date: ${new Date(entry.enrichmentDate).toISOString()}`);
    console.log();
  });

  if (analysis.notInDatabase.length > 0) {
    console.log(`❌ MISSING FROM DATABASE (${analysis.notInDatabase.length}):`);
    analysis.notInDatabase.forEach((name, i) => {
      console.log(`   ${i+1}. ${name}`);
    });
    console.log();
  }

  console.log(`📚 ORIGINAL DATABASE NAMES IN BLOGS (${analysis.originalDatabase.length}):`);
  console.log(`   These names existed in database before blog enrichment:\n`);
  console.log(`   ${analysis.originalDatabase.slice(0, 20).join(', ')}`);
  if (analysis.originalDatabase.length > 20) {
    console.log(`   ... and ${analysis.originalDatabase.length - 20} more`);
  }
  console.log();

  console.log(`📋 NAMES BY BLOG POST:`);
  for (const [slug, names] of Object.entries(namesByBlog)) {
    console.log(`\n   ${slug}: ${names.length} names`);
    console.log(`   ${names.join(', ')}`);
  }

  // Save detailed report
  const report = {
    timestamp: new Date().toISOString(),
    totalBlogPosts: blogPosts.length,
    totalUniqueNames: allBlogNames.size,
    inDatabase: analysis.inDatabase.length,
    notInDatabase: analysis.notInDatabase.length,
    blogEnriched: analysis.blogEnriched.length,
    originalDatabase: analysis.originalDatabase.length,
    blogEnrichedNames: analysis.blogEnriched,
    missingNames: analysis.notInDatabase,
    originalDatabaseNames: analysis.originalDatabase,
    namesByBlog
  };

  const reportPath = './blog-names-audit-report.json';
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(`\n💾 Detailed report saved to: ${reportPath}`);

  console.log('\n═══════════════════════════════════════════════════════════');
  console.log('                 AUDIT COMPLETE ✅');
  console.log('═══════════════════════════════════════════════════════════\n');

  return report;
}

// Run audit
auditBlogNames();
