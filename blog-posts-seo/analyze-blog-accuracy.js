/**
 * Blog Post Accuracy Analyzer
 * Counts actual names in each blog post and compares to title claims
 */

const fs = require('fs');
const path = require('path');

// Extract all names from HTML content
function extractNamesFromHTML(html) {
  const names = new Set();

  // Pattern 1: <strong>1. Name</strong> or <strong>Name</strong> (featured names)
  const strongPattern = /<strong>(?:\d+\.\s+)?([A-Z][a-z]+(?:\/[A-Z][a-z]+)?)<\/strong>/g;
  let match;
  while ((match = strongPattern.exec(html)) !== null) {
    const name = match[1].trim();
    // Split compound names like "Eleanor/Elenor"
    name.split('/').forEach(n => names.add(n.trim()));
  }

  // Pattern 2: <li><strong>Name</strong> - in bullet lists
  const listPattern = /<li><strong>([A-Z][a-z]+(?:\/[A-Z][a-z]+)?)<\/strong>/g;
  while ((match = listPattern.exec(html)) !== null) {
    const name = match[1].trim();
    name.split('/').forEach(n => names.add(n.trim()));
  }

  return Array.from(names).sort();
}

// Extract number claim from title
function extractNumberClaim(title) {
  const match = title.match(/(\d+)\+?/);
  return match ? parseInt(match[1]) : null;
}

// Analyze all blog posts
function analyzeBlogPosts(blogDirPath) {
  const files = fs.readdirSync(blogDirPath)
    .filter(f => f.startsWith('post-') && f.endsWith('.json'))
    .sort();

  const report = {
    timestamp: new Date().toISOString(),
    posts: [],
    summary: {
      totalPosts: 0,
      accuratePosts: 0,
      inaccuratePosts: 0,
      totalNamesClaimed: 0,
      totalNamesActual: 0
    }
  };

  files.forEach(file => {
    const filePath = path.join(blogDirPath, file);
    const content = JSON.parse(fs.readFileSync(filePath, 'utf8'));

    const names = extractNamesFromHTML(content.content);
    const claimedCount = extractNumberClaim(content.title);
    const actualCount = names.length;
    const isAccurate = !claimedCount || Math.abs(actualCount - claimedCount) <= 10; // 10 name tolerance

    const postReport = {
      file,
      slug: content.slug,
      title: content.title,
      claimedCount,
      actualCount,
      difference: claimedCount ? (actualCount - claimedCount) : 0,
      isAccurate,
      accuracy: claimedCount ? ((actualCount / claimedCount) * 100).toFixed(1) + '%' : 'N/A',
      names: names.slice(0, 20), // First 20 names for verification
      allNamesCount: names.length
    };

    report.posts.push(postReport);
    report.summary.totalPosts++;
    if (isAccurate) report.summary.accuratePosts++;
    else report.summary.inaccuratePosts++;
    if (claimedCount) report.summary.totalNamesClaimed += claimedCount;
    report.summary.totalNamesActual += actualCount;
  });

  return report;
}

// Main execution
console.log('🔍 Analyzing Blog Post Accuracy...\n');

const blogDir = __dirname;
const report = analyzeBlogPosts(blogDir);

// Display results
console.log('=== BLOG POST ACCURACY REPORT ===\n');

report.posts.forEach((post, index) => {
  const statusIcon = post.isAccurate ? '✅' : '❌';
  console.log(`${statusIcon} Post ${index + 1}: ${post.slug}`);
  console.log(`   Title: ${post.title}`);
  console.log(`   Claimed: ${post.claimedCount || 'No number claim'}`);
  console.log(`   Actual: ${post.actualCount} names`);
  if (post.claimedCount) {
    console.log(`   Difference: ${post.difference >= 0 ? '+' : ''}${post.difference} (${post.accuracy} accurate)`);
  }
  console.log('');
});

console.log('=== SUMMARY ===');
console.log(`Total Posts: ${report.summary.totalPosts}`);
console.log(`Accurate: ${report.summary.accuratePosts} ✅`);
console.log(`Inaccurate: ${report.summary.inaccuratePosts} ❌`);
console.log(`Total Names Claimed: ${report.summary.totalNamesClaimed}`);
console.log(`Total Names Actual: ${report.summary.totalNamesActual}`);
console.log(`Overall Accuracy: ${((report.summary.totalNamesActual / report.summary.totalNamesClaimed) * 100).toFixed(1)}%\n`);

// Save report
const reportPath = path.join(blogDir, 'accuracy-report.json');
fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
console.log(`📄 Full report saved to: ${reportPath}`);

// Identify posts needing fixes
const needsFix = report.posts.filter(p => !p.isAccurate);
if (needsFix.length > 0) {
  console.log('\n🔧 POSTS NEEDING FIXES:');
  needsFix.forEach(post => {
    console.log(`   - ${post.slug} (${post.actualCount} names, claimed ${post.claimedCount})`);
    if (post.actualCount < post.claimedCount) {
      console.log(`     → Need ${post.claimedCount - post.actualCount} MORE names OR update title`);
    } else {
      console.log(`     → Have ${post.actualCount - post.claimedCount} EXTRA names - title can stay or increase`);
    }
  });
}

process.exit(0);
