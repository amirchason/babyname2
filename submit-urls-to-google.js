/**
 * Submit URLs to Google Indexing API in bulk
 *
 * IMPORTANT: Google Indexing API is primarily for:
 * - JobPosting structured data
 * - BroadcastEvent structured data
 * - Sites with rapidly changing content
 *
 * For regular blog content, sitemap submission is recommended.
 * This script is provided for reference.
 *
 * Setup Required:
 * 1. Enable Google Indexing API in Google Cloud Console
 * 2. Create service account and download JSON key
 * 3. Add service account email to Search Console as owner
 *
 * Run: node submit-urls-to-google.js
 */

const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');

// Configuration
const SITE_URL = 'https://soulseedbaby.com';
const SERVICE_ACCOUNT_KEY = './google-service-account-key.json'; // You need to create this

// URLs to submit
const urlsToSubmit = [
  // Category pages
  '/blog/baby-names',
  '/blog/baby-milestones',
  '/blog/baby-gear',
  '/blog/pregnancy',
  '/blog/postpartum',
  '/blog/personal-blogs',

  // Add more URLs here...
  // You can also fetch blog post URLs from Firestore dynamically
];

async function submitUrlsToGoogle() {
  try {
    // Check if service account key exists
    if (!fs.existsSync(SERVICE_ACCOUNT_KEY)) {
      console.error('❌ Service account key not found!');
      console.log('\n📝 Setup Instructions:');
      console.log('1. Go to: https://console.cloud.google.com/apis/credentials');
      console.log('2. Create a service account');
      console.log('3. Download JSON key as "google-service-account-key.json"');
      console.log('4. Add service account email to Search Console as owner');
      console.log('5. Enable Indexing API: https://console.cloud.google.com/apis/library/indexing.googleapis.com');
      return;
    }

    // Load service account credentials
    const key = require(SERVICE_ACCOUNT_KEY);

    // Create JWT client
    const jwtClient = new google.auth.JWT(
      key.client_email,
      null,
      key.private_key,
      ['https://www.googleapis.com/auth/indexing'],
      null
    );

    // Authorize
    await jwtClient.authorize();
    console.log('✅ Authenticated with Google Indexing API\n');

    const indexing = google.indexing({ version: 'v3', auth: jwtClient });

    let successCount = 0;
    let failCount = 0;

    // Submit each URL
    for (const urlPath of urlsToSubmit) {
      const fullUrl = `${SITE_URL}${urlPath}`;

      try {
        console.log(`📤 Submitting: ${fullUrl}`);

        const response = await indexing.urlNotifications.publish({
          requestBody: {
            url: fullUrl,
            type: 'URL_UPDATED' // Options: URL_UPDATED or URL_DELETED
          }
        });

        console.log(`   ✅ Success: ${response.data.urlNotificationMetadata?.latestUpdate?.notifyTime || 'Submitted'}\n`);
        successCount++;

        // Rate limiting - wait 100ms between requests
        await new Promise(resolve => setTimeout(resolve, 100));

      } catch (error) {
        console.error(`   ❌ Failed: ${error.message}\n`);
        failCount++;
      }
    }

    // Summary
    console.log('\n' + '='.repeat(50));
    console.log('📊 SUBMISSION SUMMARY');
    console.log('='.repeat(50));
    console.log(`✅ Successful: ${successCount}`);
    console.log(`❌ Failed: ${failCount}`);
    console.log(`📝 Total: ${urlsToSubmit.length}`);

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// Alternative: Batch submission method
async function submitUrlsBatch() {
  console.log('⚠️  Batch submission not directly supported by Indexing API');
  console.log('📝 Use sitemap submission instead for bulk indexing\n');

  await submitUrlsToGoogle();
}

// Check URL submission status
async function checkUrlStatus(url) {
  try {
    if (!fs.existsSync(SERVICE_ACCOUNT_KEY)) {
      console.error('❌ Service account key not found!');
      return;
    }

    const key = require(SERVICE_ACCOUNT_KEY);
    const jwtClient = new google.auth.JWT(
      key.client_email,
      null,
      key.private_key,
      ['https://www.googleapis.com/auth/indexing'],
      null
    );

    await jwtClient.authorize();
    const indexing = google.indexing({ version: 'v3', auth: jwtClient });

    const response = await indexing.urlNotifications.getMetadata({
      url: url
    });

    console.log('📊 URL Status:', response.data);
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// Run the script
if (require.main === module) {
  const args = process.argv.slice(2);

  if (args[0] === '--check' && args[1]) {
    checkUrlStatus(args[1]);
  } else if (args[0] === '--help') {
    console.log('Usage:');
    console.log('  node submit-urls-to-google.js           # Submit all URLs');
    console.log('  node submit-urls-to-google.js --check <url>  # Check URL status');
  } else {
    submitUrlsToGoogle();
  }
}

module.exports = { submitUrlsToGoogle, checkUrlStatus };
