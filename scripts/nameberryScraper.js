/**
 * Nameberry Celebrity Baby Names Scraper
 * Scrapes https://nameberry.com/fameberry for celebrity baby data
 */

import fetch from 'node-fetch';
import * as cheerio from 'cheerio';
import fs from 'fs';

const NAMEBERRY_BASE_URL = 'https://nameberry.com/celebrity-baby-names';
const CACHE_DIR = './scripts/celebrity-cache';
const CACHE_FILE = `${CACHE_DIR}/nameberry-all-data.json`;
const DELAY_MS = 1500; // Be respectful to the server

// Ensure cache directory exists
if (!fs.existsSync(CACHE_DIR)) {
  fs.mkdirSync(CACHE_DIR, { recursive: true });
}

/**
 * Delay helper
 */
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Fetch and parse a single letter page
 * Nameberry uses Next.js with JSON data embedded in the page
 */
async function scrapeLetter(letter) {
  const url = `${NAMEBERRY_BASE_URL}/${letter.toLowerCase()}`;
  console.log(`📥 Fetching: ${url}`);

  try {
    const response = await fetch(url);
    if (!response.ok) {
      console.error(`❌ HTTP ${response.status} for letter ${letter}`);
      return [];
    }

    const html = await response.text();
    const results = [];

    // Extract JSON data from Next.js page
    // Look for JSON embedded in <script id="__NEXT_DATA__"> or similar
    const scriptMatch = html.match(/<script[^>]*id="__NEXT_DATA__"[^>]*>(.+?)<\/script>/s);

    if (scriptMatch) {
      try {
        const jsonData = JSON.parse(scriptMatch[1]);

        // Navigate to the babies array in the JSON structure
        const babies = jsonData?.props?.pageProps?.babies ||
                      jsonData?.pageProps?.babies ||
                      jsonData?.babies;

        if (babies && Array.isArray(babies)) {
          for (const entry of babies) {
            const babyName = entry.baby || entry.name;
            const parents = entry.star || entry.parents;
            const birthDate = entry.birthdate || entry.birth_date;

            // Extract year from birthdate if available
            let birthYear = null;
            if (birthDate) {
              const yearMatch = birthDate.match(/\b(20\d{2})\b/);
              if (yearMatch) birthYear = parseInt(yearMatch[1]);
            }

            if (babyName && parents) {
              results.push({
                babyName,
                parents,
                birthDate,
                birthYear,
                source: 'Nameberry',
                scrapedAt: new Date().toISOString()
              });
            }
          }
        }
      } catch (jsonError) {
        console.error(`   ⚠️  JSON parsing failed for letter ${letter}:`, jsonError.message);
      }
    }

    // Fallback: Try cheerio parsing if JSON extraction failed
    if (results.length === 0) {
      const $ = cheerio.load(html);

      // Look for list items or table rows
      $('li, tr').each((i, elem) => {
        const text = $(elem).text().trim();

        // Pattern: "Baby Name born to Parent1 & Parent2 (Date)"
        const match = text.match(/^(.+?)\s+born to\s+(.+?)\s*(?:\(([^)]+)\))?$/i);

        if (match) {
          const babyName = match[1].trim();
          const parents = match[2].trim();
          const birthDate = match[3] ? match[3].trim() : null;

          let birthYear = null;
          if (birthDate) {
            const yearMatch = birthDate.match(/\b(20\d{2})\b/);
            if (yearMatch) birthYear = parseInt(yearMatch[1]);
          }

          results.push({
            babyName,
            parents,
            birthDate,
            birthYear,
            source: 'Nameberry',
            scrapedAt: new Date().toISOString()
          });
        }
      });
    }

    console.log(`   ✅ Found ${results.length} entries for letter ${letter}`);
    return results;

  } catch (error) {
    console.error(`❌ Error scraping letter ${letter}:`, error.message);
    return [];
  }
}

/**
 * Scrape all letters A-Z
 */
async function scrapeAllLetters() {
  const allData = [];
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

  console.log('🚀 Starting Nameberry celebrity baby scraper...\n');

  for (const letter of letters) {
    const letterData = await scrapeLetter(letter);
    allData.push(...letterData);

    // Delay between requests
    if (letter !== 'Z') {
      await delay(DELAY_MS);
    }
  }

  console.log(`\n✅ Scraping complete! Total entries: ${allData.length}`);

  // Save to cache
  fs.writeFileSync(CACHE_FILE, JSON.stringify(allData, null, 2));
  console.log(`💾 Saved to: ${CACHE_FILE}`);

  return allData;
}

/**
 * Search for celebrity babies by first name
 */
export function searchCelebrityBabies(firstName, allData = null) {
  // Load from cache if not provided
  if (!allData) {
    if (!fs.existsSync(CACHE_FILE)) {
      console.warn('⚠️  Cache not found. Run scrapeAllLetters() first.');
      return [];
    }
    allData = JSON.parse(fs.readFileSync(CACHE_FILE, 'utf-8'));
  }

  const normalizedSearch = firstName.toLowerCase().trim();

  // Find all babies with matching first name
  const matches = allData.filter(entry => {
    const babyFirstName = entry.babyName.split(' ')[0].toLowerCase();
    return babyFirstName === normalizedSearch;
  });

  console.log(`🔍 Found ${matches.length} celebrity babies named "${firstName}"`);
  return matches;
}

/**
 * Format celebrity baby data for V8 enrichment
 */
export function formatForV8(celebrityBabies) {
  if (!celebrityBabies || celebrityBabies.length === 0) {
    return [];
  }

  return celebrityBabies.map(baby => {
    // Parse parent names
    const parentList = baby.parents.split('&').map(p => p.trim());
    const primaryParent = parentList[0];

    return {
      parentName: primaryParent,
      parentProfession: "Celebrity", // Nameberry doesn't specify profession
      childName: baby.babyName,
      birthYear: baby.birthYear,
      context: baby.birthDate ? `Born ${baby.birthDate}` : "Celebrity baby",
      verified: true,
      source: "Nameberry"
    };
  });
}

// CLI usage
if (import.meta.url === `file://${process.argv[1]}`) {
  const args = process.argv.slice(2);

  if (args[0] === 'scrape') {
    // Full scrape
    await scrapeAllLetters();
  } else if (args[0] === 'search' && args[1]) {
    // Search for a name
    const results = searchCelebrityBabies(args[1]);
    console.log(JSON.stringify(results, null, 2));
  } else if (args[0] === 'format' && args[1]) {
    // Search and format for V8
    const results = searchCelebrityBabies(args[1]);
    const formatted = formatForV8(results);
    console.log(JSON.stringify(formatted, null, 2));
  } else {
    console.log('Usage:');
    console.log('  node nameberryScraper.js scrape              # Scrape all A-Z');
    console.log('  node nameberryScraper.js search Kevin        # Search for a name');
    console.log('  node nameberryScraper.js format Kevin        # Format for V8');
  }
}

export { scrapeAllLetters };
