#!/usr/bin/env node
/**
 * PERFORMANCE TEST - BabyNames App
 *
 * Tests the deployed app's performance metrics:
 * - Page load time
 * - Resource loading times
 * - Bundle sizes
 * - Network performance
 */

const https = require('https');
const { performance } = require('perf_hooks');

const APP_URL = 'https://amirchason.github.io/babyname2/';
const RESOURCES = [
  '/babyname2/',
  '/babyname2/static/js/main.d4f2baa4.js',
  '/babyname2/static/css/main.d7b878ba.css'
];

// Performance metrics storage
const metrics = {
  html: {},
  js: {},
  css: {},
  total: {}
};

function fetchResource(url) {
  return new Promise((resolve, reject) => {
    const startTime = performance.now();
    let dnsLookup = 0;
    let tcpConnection = 0;
    let firstByte = 0;
    let totalBytes = 0;

    https.get(url, (res) => {
      const chunks = [];

      // First byte received
      res.once('readable', () => {
        firstByte = performance.now() - startTime;
      });

      res.on('data', (chunk) => {
        chunks.push(chunk);
        totalBytes += chunk.length;
      });

      res.on('end', () => {
        const endTime = performance.now();
        const totalTime = endTime - startTime;

        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          size: totalBytes,
          sizeKB: (totalBytes / 1024).toFixed(2),
          timing: {
            dnsLookup: dnsLookup.toFixed(3),
            tcpConnection: tcpConnection.toFixed(3),
            firstByte: firstByte.toFixed(3),
            total: totalTime.toFixed(3)
          },
          contentType: res.headers['content-type'],
          cacheControl: res.headers['cache-control'],
          etag: res.headers['etag']
        });
      });
    }).on('error', reject);
  });
}

async function testPerformance() {
  console.log('╔════════════════════════════════════════════════════════╗');
  console.log('║     🚀 BABYNAMES APP PERFORMANCE TEST                  ║');
  console.log('╚════════════════════════════════════════════════════════╝\n');

  console.log('Testing: https://amirchason.github.io/babyname2/\n');

  // Test HTML page
  console.log('📄 Testing HTML Page...');
  try {
    const htmlResult = await fetchResource('https://amirchason.github.io/babyname2/');
    metrics.html = htmlResult;

    console.log('   ✓ Status:', htmlResult.statusCode);
    console.log('   ✓ Size:', htmlResult.sizeKB, 'KB');
    console.log('   ✓ Time to First Byte:', htmlResult.timing.firstByte, 'ms');
    console.log('   ✓ Total Load Time:', htmlResult.timing.total, 'ms');
    console.log('   ✓ Content-Type:', htmlResult.contentType);
    console.log();
  } catch (error) {
    console.error('   ✗ Error:', error.message);
  }

  // Test JavaScript bundle
  console.log('📦 Testing JavaScript Bundle...');
  try {
    const jsResult = await fetchResource('https://amirchason.github.io/babyname2/static/js/main.d4f2baa4.js');
    metrics.js = jsResult;

    console.log('   ✓ Status:', jsResult.statusCode);
    console.log('   ✓ Size:', jsResult.sizeKB, 'KB', `(${(jsResult.size / 1024 / 1024).toFixed(2)} MB)`);
    console.log('   ✓ Time to First Byte:', jsResult.timing.firstByte, 'ms');
    console.log('   ✓ Total Download Time:', jsResult.timing.total, 'ms');
    console.log('   ✓ Download Speed:', (jsResult.size / (jsResult.timing.total / 1000) / 1024).toFixed(2), 'KB/s');
    console.log('   ✓ Cache Control:', jsResult.cacheControl || 'None');
    console.log();
  } catch (error) {
    console.error('   ✗ Error:', error.message);
  }

  // Test CSS
  console.log('🎨 Testing CSS Bundle...');
  try {
    const cssResult = await fetchResource('https://amirchason.github.io/babyname2/static/css/main.d7b878ba.css');
    metrics.css = cssResult;

    console.log('   ✓ Status:', cssResult.statusCode);
    console.log('   ✓ Size:', cssResult.sizeKB, 'KB');
    console.log('   ✓ Total Download Time:', cssResult.timing.total, 'ms');
    console.log();
  } catch (error) {
    console.error('   ✗ Error:', error.message);
  }

  // Calculate total metrics
  const totalSize = (metrics.html.size || 0) + (metrics.js.size || 0) + (metrics.css.size || 0);
  const totalTime = Math.max(
    parseFloat(metrics.html.timing?.total || 0),
    parseFloat(metrics.js.timing?.total || 0),
    parseFloat(metrics.css.timing?.total || 0)
  );

  console.log('═══════════════════════════════════════════════════════');
  console.log('📊 SUMMARY');
  console.log('═══════════════════════════════════════════════════════\n');

  console.log('Total Bundle Size:');
  console.log('  HTML:       ', metrics.html.sizeKB || 'N/A', 'KB');
  console.log('  JavaScript: ', metrics.js.sizeKB || 'N/A', 'KB');
  console.log('  CSS:        ', metrics.css.sizeKB || 'N/A', 'KB');
  console.log('  ─────────────────────────────');
  console.log('  TOTAL:      ', (totalSize / 1024).toFixed(2), 'KB\n');

  console.log('Performance Metrics:');
  console.log('  HTML First Byte:     ', metrics.html.timing?.firstByte || 'N/A', 'ms');
  console.log('  JS Download Time:    ', metrics.js.timing?.total || 'N/A', 'ms');
  console.log('  CSS Download Time:   ', metrics.css.timing?.total || 'N/A', 'ms');
  console.log('  Estimated Page Load: ', totalTime.toFixed(2), 'ms\n');

  // Performance grading
  const htmlLoadTime = parseFloat(metrics.html.timing?.total || 0);
  const jsLoadTime = parseFloat(metrics.js.timing?.total || 0);

  console.log('🎯 Performance Grade:');
  console.log('  HTML Load:     ', gradePerformance(htmlLoadTime, 500, 1000));
  console.log('  JS Load:       ', gradePerformance(jsLoadTime, 1000, 2000));
  console.log('  Bundle Size:   ', gradeSize(parseFloat(metrics.js.sizeKB || 0)));
  console.log();

  // Recommendations
  console.log('💡 Recommendations:');
  if (parseFloat(metrics.js.sizeKB || 0) > 200) {
    console.log('  ⚠️  JavaScript bundle is large (>' + metrics.js.sizeKB + ' KB)');
    console.log('      → Consider code splitting');
    console.log('      → Implement lazy loading');
  }
  if (jsLoadTime > 2000) {
    console.log('  ⚠️  JS download time is slow (>' + jsLoadTime + ' ms)');
    console.log('      → Enable compression (Gzip/Brotli)');
    console.log('      → Use CDN');
  }
  if (!metrics.js.cacheControl || !metrics.js.cacheControl.includes('max-age')) {
    console.log('  ⚠️  No cache control headers');
    console.log('      → Add cache headers for better repeat visits');
  }

  console.log('\n═══════════════════════════════════════════════════════');
  console.log('✅ Test Complete!');
  console.log('═══════════════════════════════════════════════════════\n');
}

function gradePerformance(time, good, acceptable) {
  if (time < good) return '✅ EXCELLENT (' + time + 'ms)';
  if (time < acceptable) return '👍 GOOD (' + time + 'ms)';
  if (time < acceptable * 2) return '⚠️  NEEDS IMPROVEMENT (' + time + 'ms)';
  return '❌ POOR (' + time + 'ms)';
}

function gradeSize(sizeKB) {
  if (sizeKB < 100) return '✅ EXCELLENT (' + sizeKB + ' KB)';
  if (sizeKB < 200) return '👍 GOOD (' + sizeKB + ' KB)';
  if (sizeKB < 300) return '⚠️  LARGE (' + sizeKB + ' KB)';
  return '❌ TOO LARGE (' + sizeKB + ' KB)';
}

// Run the test
testPerformance().catch(console.error);