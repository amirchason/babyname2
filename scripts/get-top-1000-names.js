#!/usr/bin/env node

/**
 * GET TOP 1000 NAMES BY POPULARITY
 *
 * Loads names from database and returns top 1000 sorted by ranking
 */

const fs = require('fs');
const path = require('path');

function getTop1000Names() {
  try {
    // Try popularNames_cache.json first (10k most popular)
    const cachePath = path.join(__dirname, '..', 'public', 'data', 'popularNames_cache.json');

    if (fs.existsSync(cachePath)) {
      console.log('✅ Loading from popularNames_cache.json');
      const data = JSON.parse(fs.readFileSync(cachePath, 'utf-8'));
      const namesArray = data.names || data; // Handle both {names: [...]} and [...] formats

      // Sort by ranking (lower is more popular)
      const sorted = namesArray
        .filter(n => n.name) // Must have name
        .sort((a, b) => {
          const rankA = a.ranking?.current || 999999;
          const rankB = b.ranking?.current || 999999;
          return rankA - rankB;
        })
        .slice(0, 1000);

      console.log(`✅ Found ${sorted.length} names`);
      return sorted.map(n => ({
        name: n.name.toLowerCase(),
        gender: n.gender || 'unknown',
        origin: n.origin || 'Unknown',
        meaning: n.meaning || 'Unknown',
        ranking: n.ranking?.current || 0
      }));
    }

    // Fallback to chunk files
    console.log('⚠️  popularNames_cache.json not found. Trying chunk files...');
    const chunk1Path = path.join(__dirname, '..', 'public', 'data', 'names-chunk1.json');

    if (!fs.existsSync(chunk1Path)) {
      throw new Error('No data files found');
    }

    const chunk1 = JSON.parse(fs.readFileSync(chunk1Path, 'utf-8'));
    const namesArray = Array.isArray(chunk1) ? chunk1 : chunk1.names || [];

    const sorted = namesArray
      .filter(n => n.name)
      .sort((a, b) => {
        const rankA = a.ranking?.current || 999999;
        const rankB = b.ranking?.current || 999999;
        return rankA - rankB;
      })
      .slice(0, 1000);

    console.log(`✅ Found ${sorted.length} names from chunk1`);
    return sorted.map(n => ({
      name: n.name.toLowerCase(),
      gender: n.gender || 'unknown',
      origin: n.origin || 'Unknown',
      meaning: n.meaning || 'Unknown',
      ranking: n.ranking?.current || 0
    }));

  } catch (error) {
    console.error(`❌ Error loading names: ${error.message}`);
    process.exit(1);
  }
}

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { getTop1000Names };
}

// Allow running as standalone script
if (require.main === module) {
  const names = getTop1000Names();
  console.log(`\n📊 Top 10 names:`);
  names.slice(0, 10).forEach((n, i) => {
    console.log(`${i + 1}. ${n.name} (${n.gender}) - Rank ${n.ranking}`);
  });
  console.log(`\n✅ Total: ${names.length} names ready for enrichment`);
}
