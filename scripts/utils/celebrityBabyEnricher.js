/**
 * Celebrity Baby Enricher
 * Fetches real celebrity baby data from Nameberry for V8 enrichment
 */

import fetch from 'node-fetch';
import fs from 'fs';

const NAMEBERRY_BASE_URL = 'https://nameberry.com/celebrity-baby-names';
const CACHE_FILE = './scripts/celebrity-cache/nameberry-cache.json';

/**
 * Get first letter of a name for Nameberry lookup
 */
function getFirstLetter(name) {
  return name.charAt(0).toLowerCase();
}

/**
 * Fetch celebrity babies from Nameberry for a specific letter
 */
async function fetchCelebrityBabiesByLetter(letter) {
  const url = `${NAMEBERRY_BASE_URL}/${letter.toLowerCase()}`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      console.error(`❌ HTTP ${response.status} for letter ${letter}`);
      return [];
    }

    const html = await response.text();

    // Extract JSON data from Next.js page
    const scriptMatch = html.match(/<script[^>]*id="__NEXT_DATA__"[^>]*>(.+?)<\/script>/s);

    if (!scriptMatch) {
      console.error(`❌ No __NEXT_DATA__ found for letter ${letter}`);
      return [];
    }

    const jsonData = JSON.parse(scriptMatch[1]);

    // Navigate to babies array
    const babies = jsonData?.props?.pageProps?.babies;

    if (!babies || !Array.isArray(babies)) {
      console.error(`❌ No babies array found for letter ${letter}`);
      return [];
    }

    return babies.map(entry => ({
      babyName: entry.baby,
      parents: entry.star,
      birthDate: entry.birthdate,
      birthYear: entry.birthdate ? parseInt(entry.birthdate.match(/\b(20\d{2})\b/)?.[1]) : null
    }));

  } catch (error) {
    console.error(`❌ Error fetching letter ${letter}:`, error.message);
    return [];
  }
}

/**
 * Search for celebrity babies with a specific first name
 */
async function searchCelebrityBabies(firstName) {
  const letter = getFirstLetter(firstName);
  const normalizedName = firstName.toLowerCase().trim();

  console.log(`🔍 Searching Nameberry for babies named "${firstName}"...`);

  // Fetch data for this letter
  const allBabies = await fetchCelebrityBabiesByLetter(letter);

  // Filter to exact first name matches
  const matches = allBabies.filter(baby => {
    const babyFirstName = baby.babyName.split(' ')[0].toLowerCase();
    return babyFirstName === normalizedName;
  });

  console.log(`   ✅ Found ${matches.length} celebrity baby matches`);
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
    // Parse parent names (split by & if multiple)
    const parentList = baby.parents.split('&').map(p => p.trim());
    const primaryParent = parentList[0];

    // Format birthdate if available
    const context = baby.birthDate
      ? `Born ${baby.birthDate}`
      : "Celebrity baby";

    return {
      parentName: primaryParent,
      parentProfession: "Celebrity",
      childName: baby.babyName,
      birthYear: baby.birthYear,
      context,
      verified: true,
      source: "Nameberry"
    };
  });
}

/**
 * Main enrichment function for V8
 * Returns celebrity baby data for a given name
 */
export async function enrichCelebrityBabies(firstName) {
  try {
    const babies = await searchCelebrityBabies(firstName);
    return formatForV8(babies);
  } catch (error) {
    console.error(`❌ Celebrity baby enrichment failed for ${firstName}:`, error.message);
    return [];
  }
}

// CLI usage
if (import.meta.url === `file://${process.argv[1]}`) {
  const firstName = process.argv[2];

  if (!firstName) {
    console.log('Usage: node celebrityBabyEnricher.js <firstName>');
    console.log('Example: node celebrityBabyEnricher.js Kevin');
    process.exit(1);
  }

  const result = await enrichCelebrityBabies(firstName);
  console.log('\n📋 Celebrity Babies:');
  console.log(JSON.stringify(result, null, 2));
}
