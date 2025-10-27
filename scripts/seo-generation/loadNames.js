/**
 * loadNames.js
 * Load and merge all name data from JSON chunks
 *
 * Features:
 * - Loads all 4 data chunks (names-chunk1-4.json)
 * - Deduplicates names
 * - Validates required fields
 * - Normalizes data structure
 * - Sorts by popularity
 * - Caches results for performance
 */

const fs = require('fs-extra');
const path = require('path');

// Configuration
const DATA_DIR = path.join(__dirname, '../../public/data');
const CHUNK_COUNT = 4; // Only use chunks 1-4 (chunk 5 has errors)
const CACHE_FILE = path.join(__dirname, '../../public/.generation-state/names-cache.json');

/**
 * Normalize a name object to ensure consistent structure
 */
function normalizeName(name) {
  // Handle gender field (sometimes it's an object)
  let gender = name.gender;
  if (typeof gender === 'object' && gender !== null) {
    // Extract first key or value
    gender = gender.gender || Object.values(gender)[0] || 'unknown';
  }

  // Normalize gender values
  if (typeof gender === 'string') {
    gender = gender.toLowerCase();
    if (gender === 'm' || gender === 'male') gender = 'male';
    else if (gender === 'f' || gender === 'female') gender = 'female';
    else if (gender === 'u' || gender === 'unisex' || gender === 'neutral') gender = 'unisex';
    else gender = 'unknown';
  }

  return {
    name: name.name || 'Unknown',
    slug: (name.slug || name.name || 'unknown')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, ''),
    meaning: name.meaning || 'Meaning unknown',
    origin: name.origin || 'Unknown',
    gender: gender,
    popularity: name.popularity || name.rank || 999999,
    // Additional fields (optional)
    pronunciation: name.pronunciation || null,
    syllables: name.syllables || null,
    length: name.name ? name.name.length : 0,
    firstLetter: name.name ? name.name.charAt(0).toLowerCase() : 'a',
  };
}

/**
 * Load all name chunks and merge
 */
async function loadAllNames(options = {}) {
  const {
    useCache = true,
    sortBy = 'popularity', // 'popularity', 'alphabetical', 'none'
    validate = true,
  } = options;

  console.log('📦 Loading name data...\n');

  // Check cache
  if (useCache && await fs.pathExists(CACHE_FILE)) {
    try {
      const cached = await fs.readJson(CACHE_FILE);
      console.log(`✅ Loaded ${cached.length.toLocaleString()} names from cache\n`);
      return cached;
    } catch (error) {
      console.log('⚠️  Cache read failed, loading from chunks...\n');
    }
  }

  // Load all chunks
  const allNames = [];
  const seenNames = new Set(); // For deduplication

  for (let i = 1; i <= CHUNK_COUNT; i++) {
    const chunkPath = path.join(DATA_DIR, `names-chunk${i}.json`);

    try {
      console.log(`   Loading chunk ${i}...`);
      const chunkData = await fs.readJson(chunkPath);

      let addedCount = 0;
      for (const name of chunkData) {
        // Skip if duplicate
        if (seenNames.has(name.name)) {
          continue;
        }

        // Validate required fields
        if (validate && !name.name) {
          continue;
        }

        // Normalize and add
        const normalized = normalizeName(name);
        allNames.push(normalized);
        seenNames.add(name.name);
        addedCount++;
      }

      console.log(`      Added ${addedCount.toLocaleString()} names`);

    } catch (error) {
      console.error(`   ❌ Error loading chunk ${i}: ${error.message}`);
    }
  }

  console.log(`\n✅ Total names loaded: ${allNames.length.toLocaleString()}`);

  // Sort if requested
  if (sortBy === 'popularity') {
    console.log('   Sorting by popularity...');
    allNames.sort((a, b) => {
      const popA = a.popularity || 999999;
      const popB = b.popularity || 999999;
      return popA - popB; // Lower rank = more popular
    });
  } else if (sortBy === 'alphabetical') {
    console.log('   Sorting alphabetically...');
    allNames.sort((a, b) => a.name.localeCompare(b.name));
  }

  // Cache the results
  if (useCache) {
    try {
      await fs.writeJson(CACHE_FILE, allNames, { spaces: 0 });
      console.log('   💾 Cached results for future use\n');
    } catch (error) {
      console.error(`   ⚠️  Cache write failed: ${error.message}\n`);
    }
  }

  return allNames;
}

/**
 * Load specific names by list
 */
async function loadNamesByList(nameList, options = {}) {
  const allNames = await loadAllNames(options);
  const nameSet = new Set(nameList.map(n => n.toLowerCase()));

  return allNames.filter(name => nameSet.has(name.name.toLowerCase()));
}

/**
 * Get names by category
 */
async function getNamesByCategory(category, categoryValue, options = {}) {
  const allNames = await loadAllNames(options);

  switch (category) {
    case 'gender':
      return allNames.filter(n => n.gender === categoryValue.toLowerCase());

    case 'origin':
      return allNames.filter(n =>
        n.origin.toLowerCase().includes(categoryValue.toLowerCase())
      );

    case 'letter':
      return allNames.filter(n =>
        n.firstLetter === categoryValue.toLowerCase()
      );

    case 'length':
      if (categoryValue === 'short') {
        return allNames.filter(n => n.length <= 4);
      } else if (categoryValue === 'medium') {
        return allNames.filter(n => n.length >= 5 && n.length <= 7);
      } else if (categoryValue === 'long') {
        return allNames.filter(n => n.length >= 8);
      }
      return [];

    case 'popularity':
      if (categoryValue === 'popular') {
        return allNames.filter(n => n.popularity <= 1000);
      } else if (categoryValue === 'rare') {
        return allNames.filter(n => n.popularity > 50000);
      } else if (categoryValue === 'trending') {
        // TODO: Implement trending logic (for now, top 5000)
        return allNames.filter(n => n.popularity <= 5000);
      }
      return [];

    default:
      return [];
  }
}

/**
 * Get statistics about the dataset
 */
async function getDatasetStats(options = {}) {
  const allNames = await loadAllNames(options);

  const stats = {
    total: allNames.length,
    byGender: {
      male: allNames.filter(n => n.gender === 'male').length,
      female: allNames.filter(n => n.gender === 'female').length,
      unisex: allNames.filter(n => n.gender === 'unisex').length,
      unknown: allNames.filter(n => n.gender === 'unknown').length,
    },
    byOrigin: {},
    byLength: {
      short: allNames.filter(n => n.length <= 4).length,
      medium: allNames.filter(n => n.length >= 5 && n.length <= 7).length,
      long: allNames.filter(n => n.length >= 8).length,
    },
    byPopularity: {
      popular: allNames.filter(n => n.popularity <= 1000).length,
      common: allNames.filter(n => n.popularity > 1000 && n.popularity <= 10000).length,
      uncommon: allNames.filter(n => n.popularity > 10000 && n.popularity <= 50000).length,
      rare: allNames.filter(n => n.popularity > 50000).length,
    },
  };

  // Count by origin
  allNames.forEach(name => {
    const origin = name.origin || 'Unknown';
    stats.byOrigin[origin] = (stats.byOrigin[origin] || 0) + 1;
  });

  return stats;
}

// CLI interface
if (require.main === module) {
  const args = process.argv.slice(2);
  const command = args[0] || 'load';

  (async () => {
    try {
      if (command === 'load') {
        const names = await loadAllNames({ sortBy: 'popularity' });
        console.log(`\n📊 Sample names (first 10):\n`);
        names.slice(0, 10).forEach((name, i) => {
          console.log(`   ${i + 1}. ${name.name} (${name.gender}, ${name.origin}, rank: ${name.popularity})`);
        });

      } else if (command === 'stats') {
        const stats = await getDatasetStats();
        console.log('\n📈 Dataset Statistics:\n');
        console.log(`Total Names: ${stats.total.toLocaleString()}\n`);
        console.log('By Gender:');
        Object.entries(stats.byGender).forEach(([gender, count]) => {
          console.log(`   ${gender}: ${count.toLocaleString()}`);
        });
        console.log('\nBy Length:');
        Object.entries(stats.byLength).forEach(([length, count]) => {
          console.log(`   ${length}: ${count.toLocaleString()}`);
        });
        console.log('\nBy Popularity:');
        Object.entries(stats.byPopularity).forEach(([pop, count]) => {
          console.log(`   ${pop}: ${count.toLocaleString()}`);
        });
        console.log('\nTop 10 Origins:');
        const sortedOrigins = Object.entries(stats.byOrigin)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 10);
        sortedOrigins.forEach(([origin, count]) => {
          console.log(`   ${origin}: ${count.toLocaleString()}`);
        });

      } else if (command === 'clear-cache') {
        if (await fs.pathExists(CACHE_FILE)) {
          await fs.remove(CACHE_FILE);
          console.log('✅ Cache cleared\n');
        } else {
          console.log('ℹ️  No cache file found\n');
        }

      } else {
        console.log('Usage:');
        console.log('  node loadNames.js load        # Load and display sample');
        console.log('  node loadNames.js stats       # Show dataset statistics');
        console.log('  node loadNames.js clear-cache # Clear cached data');
      }

    } catch (error) {
      console.error('\n❌ Error:', error.message);
      process.exit(1);
    }
  })();
}

// Export functions
module.exports = {
  loadAllNames,
  loadNamesByList,
  getNamesByCategory,
  getDatasetStats,
  normalizeName,
};
