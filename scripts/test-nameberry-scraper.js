/**
 * Test Nameberry Scraper
 */

import fetch from 'node-fetch';

const url = 'https://nameberry.com/celebrity-baby-names/k';

console.log(`🧪 Testing Nameberry scraper with letter K...`);
console.log(`📥 Fetching: ${url}\n`);

const response = await fetch(url);
const html = await response.text();

// Extract JSON data
const scriptMatch = html.match(/<script[^>]*id="__NEXT_DATA__"[^>]*>(.+?)<\/script>/s);

if (scriptMatch) {
  console.log('✅ Found __NEXT_DATA__ script tag');

  try {
    const jsonData = JSON.parse(scriptMatch[1]);
    console.log('✅ Parsed JSON successfully\n');

    // Try to find babies array
    const babies = jsonData?.props?.pageProps?.babies ||
                  jsonData?.pageProps?.babies ||
                  jsonData?.babies;

    if (babies) {
      console.log(`✅ Found babies array with ${babies.length} entries\n`);
      console.log('📋 First 5 entries:');
      console.log(JSON.stringify(babies.slice(0, 5), null, 2));
    } else {
      console.log('❌ Could not find babies array in JSON');
      console.log('Available keys:', Object.keys(jsonData));
      if (jsonData.props) console.log('props keys:', Object.keys(jsonData.props));
      if (jsonData.props?.pageProps) console.log('pageProps keys:', Object.keys(jsonData.props.pageProps));
    }
  } catch (error) {
    console.error('❌ JSON parse error:', error.message);
  }
} else {
  console.log('❌ Could not find __NEXT_DATA__ script tag');
}
