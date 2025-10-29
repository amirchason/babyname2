/**
 * Get All URLs for Google Search Console Submission
 *
 * This script generates a list of ALL URLs from your site
 * that you can copy/paste into Google Search Console
 *
 * Run: node get-all-urls-for-google.js
 */

const admin = require('firebase-admin');
const fs = require('fs');

// Try to load service account
let serviceAccount;
try {
  serviceAccount = require('./service-account-key.json');
} catch (e) {
  try {
    serviceAccount = require('./soulseed-firebase-adminsdk.json');
  } catch (e2) {
    console.error('❌ Firebase service account key not found!');
    console.log('Looking for: service-account-key.json or soulseed-firebase-adminsdk.json');
    process.exit(1);
  }
}

// Initialize Firebase
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const db = admin.firestore();
const DOMAIN = 'https://soulseedbaby.com';

async function getAllUrls() {
  console.log('🔍 Fetching all URLs from your site...\n');

  const urls = [];

  // Static pages
  const staticPages = [
    '/',
    '/swipe',
    '/blog',
    '/about',
    '/contact',
    '/terms-of-service',
    '/privacy-policy',
  ];

  console.log('📄 Static Pages:');
  staticPages.forEach(url => {
    urls.push(`${DOMAIN}${url}`);
    console.log(`   ${DOMAIN}${url}`);
  });

  // Category pages
  const categoryPages = [
    '/blog/baby-names',
    '/blog/baby-milestones',
    '/blog/baby-gear',
    '/blog/pregnancy',
    '/blog/postpartum',
    '/blog/personal-blogs',
  ];

  console.log('\n📂 Category Pages:');
  categoryPages.forEach(url => {
    urls.push(`${DOMAIN}${url}`);
    console.log(`   ${DOMAIN}${url}`);
  });

  // Blog posts from Firestore
  console.log('\n📝 Fetching blog posts from Firestore...');
  try {
    const blogsRef = db.collection('blogs');
    const snapshot = await blogsRef.where('status', '==', 'published').get();

    console.log(`\n📰 Blog Posts (${snapshot.size} posts):`);
    snapshot.forEach(doc => {
      const data = doc.data();
      const url = `${DOMAIN}/blog/${data.slug}`;
      urls.push(url);
      console.log(`   ${url}`);
    });
  } catch (error) {
    console.error('❌ Error fetching blog posts:', error.message);
  }

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log(`📊 TOTAL URLs: ${urls.length}`);
  console.log('='.repeat(60));

  // Save to file
  const outputFile = 'google-search-console-urls.txt';
  fs.writeFileSync(outputFile, urls.join('\n'));
  console.log(`\n✅ URLs saved to: ${outputFile}`);

  // Generate CSV for bulk submission tools
  const csvFile = 'google-search-console-urls.csv';
  const csvContent = 'URL\n' + urls.join('\n');
  fs.writeFileSync(csvFile, csvContent);
  console.log(`✅ CSV saved to: ${csvFile}`);

  return urls;
}

async function generateSubmissionInstructions() {
  const urls = await getAllUrls();

  console.log('\n' + '='.repeat(60));
  console.log('📝 HOW TO SUBMIT TO GOOGLE SEARCH CONSOLE');
  console.log('='.repeat(60));

  console.log('\n🎯 METHOD 1: Sitemap Submission (RECOMMENDED)');
  console.log('   1. Go to: https://search.google.com/search-console');
  console.log('   2. Select your property: soulseedbaby.com');
  console.log('   3. Click "Sitemaps" in left sidebar');
  console.log('   4. Enter: sitemap.xml');
  console.log('   5. Click "Submit"');
  console.log('   ✅ Google will discover all URLs automatically!');

  console.log('\n🎯 METHOD 2: Manual URL Inspection (for priority pages)');
  console.log('   1. Go to: https://search.google.com/search-console');
  console.log('   2. Select your property: soulseedbaby.com');
  console.log('   3. Use "URL Inspection" tool at top');
  console.log('   4. Paste a URL and click "Request Indexing"');
  console.log('   5. Repeat for priority pages (category pages)');
  console.log('\n   🔥 Priority URLs to submit first:');
  console.log('      - https://soulseedbaby.com/blog/baby-names');
  console.log('      - https://soulseedbaby.com/blog/pregnancy');
  console.log('      - https://soulseedbaby.com/blog/baby-milestones');
  console.log('      - https://soulseedbaby.com/blog/baby-gear');
  console.log('      - https://soulseedbaby.com/blog/postpartum');
  console.log('      - https://soulseedbaby.com/blog/personal-blogs');

  console.log('\n🎯 METHOD 3: Use Bulk URL Upload Script');
  console.log('   See: submit-urls-to-google.js');
  console.log('   (Requires Google Indexing API setup)');

  console.log('\n💡 TIP: After submitting sitemap, check indexing status:');
  console.log('   Google Search Console > Coverage > Details');
  console.log('   Monitor which URLs are indexed over next 1-2 weeks');

  console.log('\n📊 Expected Timeline:');
  console.log('   - Sitemap processed: 1-2 days');
  console.log('   - Priority pages indexed: 3-7 days');
  console.log('   - All pages indexed: 1-4 weeks');

  console.log('\n✅ Files generated for reference:');
  console.log(`   - google-search-console-urls.txt (${urls.length} URLs)`);
  console.log(`   - google-search-console-urls.csv (spreadsheet format)`);
}

// Run
generateSubmissionInstructions().then(() => {
  process.exit(0);
}).catch(error => {
  console.error('❌ Error:', error);
  process.exit(1);
});
