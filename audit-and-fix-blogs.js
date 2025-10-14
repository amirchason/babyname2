/**
 * Audit and Fix All Blog Posts
 * - Count actual names in each post
 * - Fix title numbers if wrong
 * - Remove bullet points
 * - Add names summary at bottom with heart buttons
 * - Ensure beautiful headers
 * - Ensure mobile-optimized FAQs
 */

const fs = require('fs');
const path = require('path');

const blogDir = path.join(__dirname, 'blog-posts-seo');
const postFiles = fs.readdirSync(blogDir)
  .filter(f => f.startsWith('post-') && f.endsWith('.json'))
  .sort();

console.log('🔍 BLOG POST AUDIT\n');
console.log('='.repeat(80));

const auditResults = [];

postFiles.forEach((file, index) => {
  const postPath = path.join(blogDir, file);
  const post = JSON.parse(fs.readFileSync(postPath, 'utf8'));

  // Count names (unique <strong>Name</strong> occurrences)
  const nameMatches = post.content.match(/<strong>([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)<\/strong>/g) || [];
  const uniqueNames = [...new Set(nameMatches.map(m => m.replace(/<\/?strong>/g, '')))];
  const nameCount = uniqueNames.length;

  // Extract number from title if exists
  const titleNumberMatch = post.title.match(/(\d+)\+?/);
  const titleNumber = titleNumberMatch ? parseInt(titleNumberMatch[1]) : null;

  // Check for bullet points
  const hasBulletPoints = post.content.includes('<ul>') || post.content.includes('<li>');

  // Check for names summary at bottom
  const hasNamesSummary = post.content.includes('Names Featured in This Post') ||
                          post.content.includes('All Names Mentioned');

  // Check FAQ structure
  const hasFAQDivs = post.content.includes('class="faq-item"');
  const hasFAQSection = post.content.includes('FAQ');

  const result = {
    file,
    postNumber: index + 1,
    title: post.title,
    actualNames: nameCount,
    titleNumber: titleNumber,
    needsTitleFix: titleNumber && Math.abs(titleNumber - nameCount) > 5,
    hasBulletPoints,
    hasNamesSummary,
    hasFAQSection,
    hasFAQDivs: hasFAQSection && hasFAQDivs,
    uniqueNames: uniqueNames.sort()
  };

  auditResults.push(result);

  console.log(`\n📄 POST #${result.postNumber}: ${file}`);
  console.log(`   Title: ${post.title}`);
  console.log(`   Actual names: ${nameCount}`);
  console.log(`   Title claims: ${titleNumber || 'N/A'}`);
  console.log(`   Status: ${result.needsTitleFix ? '❌ NEEDS FIX' : '✅ OK'}`);
  console.log(`   Bullet points: ${hasBulletPoints ? '❌ YES (remove)' : '✅ NONE'}`);
  console.log(`   Names summary: ${hasNamesSummary ? '✅ YES' : '❌ MISSING'}`);
  console.log(`   FAQ section: ${hasFAQSection ? '✅ YES' : '❌ MISSING'}`);
  console.log(`   FAQ mobile-ready: ${hasFAQDivs ? '✅ YES' : '❌ NEEDS FIX'}`);
});

console.log('\n' + '='.repeat(80));
console.log('📊 SUMMARY\n');

const needsTitleFix = auditResults.filter(r => r.needsTitleFix).length;
const needsBulletRemoval = auditResults.filter(r => r.hasBulletPoints).length;
const needsNamesSummary = auditResults.filter(r => !r.hasNamesSummary).length;
const needsFAQFix = auditResults.filter(r => r.hasFAQSection && !r.hasFAQDivs).length;

console.log(`Total posts: ${auditResults.length}`);
console.log(`Need title fix: ${needsTitleFix}`);
console.log(`Need bullet removal: ${needsBulletRemoval}`);
console.log(`Need names summary: ${needsNamesSummary}`);
console.log(`Need FAQ fix: ${needsFAQFix}`);

// Save audit results
const auditPath = path.join(__dirname, 'blog-posts-seo', 'AUDIT_REPORT.json');
fs.writeFileSync(auditPath, JSON.stringify(auditResults, null, 2));
console.log(`\n💾 Audit report saved: ${auditPath}`);

console.log('\n🔧 NEXT STEPS:');
console.log('1. Review audit report');
console.log('2. Run fix script for each post');
console.log('3. Re-publish updated posts\n');
