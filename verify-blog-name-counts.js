/**
 * Database Name Count Verification Script
 * Verifies actual name counts for each blog post category
 *
 * Usage: node verify-blog-name-counts.js
 */

const fs = require('fs');
const path = require('path');

// Load all name data chunks
const loadAllNames = () => {
  const chunks = [];
  const dataDir = path.join(__dirname, 'public', 'data');

  // Load each chunk
  for (let i = 1; i <= 4; i++) {
    const chunkPath = path.join(dataDir, `names-chunk${i}.json`);
    if (fs.existsSync(chunkPath)) {
      console.log(`Loading ${chunkPath}...`);
      const data = JSON.parse(fs.readFileSync(chunkPath, 'utf8'));
      chunks.push(...data);
      console.log(`  ✓ Loaded ${data.length} names from chunk ${i}`);
    }
  }

  console.log(`\n📊 Total names loaded: ${chunks.length}\n`);
  return chunks;
};

// Blog post category filters
const categoryFilters = {
  'light-sun-star': (name) => {
    const meaning = (name.meaning || '').toLowerCase();
    const themes = (name.themes || []).map(t => t.toLowerCase());

    return (
      meaning.includes('light') ||
      meaning.includes('sun') ||
      meaning.includes('star') ||
      meaning.includes('bright') ||
      meaning.includes('radiant') ||
      meaning.includes('luminous') ||
      meaning.includes('shining') ||
      meaning.includes('glow') ||
      themes.includes('light') ||
      themes.includes('celestial') ||
      themes.includes('astronomy')
    );
  },

  'vintage': (name) => {
    // Names popular in 1900-1960 that are making comebacks
    const vintageIndicators = name.popularity_history || {};
    const peakYear = name.peak_year || 0;

    // Check if name was popular in vintage era (1900-1960)
    const wasVintage = peakYear >= 1900 && peakYear <= 1960;

    // Check if it's a classic that never left or is coming back
    const themes = (name.themes || []).map(t => t.toLowerCase());
    const isClassic = themes.includes('classic') || themes.includes('vintage') || themes.includes('traditional');

    return wasVintage || isClassic;
  },

  'nature': (name) => {
    const meaning = (name.meaning || '').toLowerCase();
    const themes = (name.themes || []).map(t => t.toLowerCase());
    const origin = (name.origin || '').toLowerCase();

    const natureKeywords = [
      'tree', 'flower', 'plant', 'river', 'mountain', 'sky', 'ocean',
      'forest', 'meadow', 'lily', 'rose', 'ivy', 'willow', 'sage',
      'rowan', 'ash', 'oak', 'pine', 'maple', 'cedar', 'birch',
      'storm', 'rain', 'snow', 'wind', 'earth', 'stone', 'leaf',
      'bird', 'animal', 'fauna', 'flora'
    ];

    return (
      natureKeywords.some(keyword => meaning.includes(keyword)) ||
      themes.includes('nature') ||
      themes.includes('botanical') ||
      themes.includes('flora') ||
      themes.includes('fauna')
    );
  },

  'short': (name) => {
    // 3-4 letter names only
    return name.name && name.name.length >= 3 && name.name.length <= 4;
  },

  'royal': (name) => {
    const meaning = (name.meaning || '').toLowerCase();
    const themes = (name.themes || []).map(t => t.toLowerCase());
    const notes = (name.notes || '').toLowerCase();

    const royalKeywords = [
      'king', 'queen', 'prince', 'princess', 'royal', 'regal',
      'noble', 'crown', 'throne', 'emperor', 'empress', 'duke',
      'duchess', 'lord', 'lady', 'monarch', 'sovereign'
    ];

    return (
      royalKeywords.some(keyword =>
        meaning.includes(keyword) ||
        notes.includes(keyword)
      ) ||
      themes.includes('royal') ||
      themes.includes('nobility')
    );
  },

  'mythology': (name) => {
    const origin = (name.origin || '').toLowerCase();
    const themes = (name.themes || []).map(t => t.toLowerCase());
    const notes = (name.notes || '').toLowerCase();

    const mythologyOrigins = ['greek', 'roman', 'norse', 'celtic', 'mythology'];
    const mythologyThemes = ['mythology', 'mythological', 'legend', 'god', 'goddess'];

    return (
      mythologyOrigins.some(o => origin.includes(o)) ||
      mythologyThemes.some(t => themes.includes(t)) ||
      notes.includes('mythology') ||
      notes.includes('god') ||
      notes.includes('goddess')
    );
  },

  'international': (name) => {
    const origin = (name.origin || '').toLowerCase();
    const themes = (name.themes || []).map(t => t.toLowerCase());

    // Names from non-English origins that work well in English
    const internationalOrigins = [
      'italian', 'spanish', 'french', 'german', 'scandinavian',
      'japanese', 'chinese', 'arabic', 'hebrew', 'irish',
      'scottish', 'portuguese', 'russian', 'polish', 'indian'
    ];

    return (
      internationalOrigins.some(o => origin.includes(o)) &&
      themes.includes('international')
    );
  },

  'unisex': (name) => {
    const gender = (name.gender || '').toLowerCase();

    // Explicitly marked as unisex
    if (gender === 'unisex' || gender === 'neutral') {
      return true;
    }

    // Names with 35-65% gender split (from unisex detection)
    if (name.gender_ratio) {
      const ratio = name.gender_ratio;
      return ratio >= 0.35 && ratio <= 0.65;
    }

    return false;
  },

  'color-gemstone': (name) => {
    const meaning = (name.meaning || '').toLowerCase();
    const themes = (name.themes || []).map(t => t.toLowerCase());

    const colorGemKeywords = [
      'ruby', 'jade', 'pearl', 'amber', 'coral', 'crystal',
      'diamond', 'emerald', 'sapphire', 'opal', 'topaz',
      'violet', 'rose', 'scarlett', 'ivory', 'ebony',
      'red', 'blue', 'green', 'gold', 'silver',
      'color', 'gem', 'jewel', 'stone', 'precious'
    ];

    return (
      colorGemKeywords.some(keyword => meaning.includes(keyword)) ||
      themes.includes('color') ||
      themes.includes('gemstone')
    );
  },

  'literary': (name) => {
    const themes = (name.themes || []).map(t => t.toLowerCase());
    const notes = (name.notes || '').toLowerCase();

    const literaryKeywords = [
      'literature', 'book', 'novel', 'character', 'author',
      'shakespeare', 'dickens', 'austen', 'bronte', 'tolkien',
      'literary', 'classic literature'
    ];

    return (
      literaryKeywords.some(keyword => notes.includes(keyword)) ||
      themes.includes('literary') ||
      themes.includes('literature')
    );
  }
};

// Analyze names by category
const analyzeCategories = (names) => {
  const results = {};

  console.log('🔍 Analyzing name counts by category...\n');

  for (const [category, filter] of Object.entries(categoryFilters)) {
    const matchingNames = names.filter(filter);

    // Split by gender (gender can be string or object)
    const girls = matchingNames.filter(n => {
      if (typeof n.gender === 'string') {
        const g = n.gender.toLowerCase();
        return g === 'female' || g === 'girl' || g === 'f';
      } else if (typeof n.gender === 'object' && n.gender !== null) {
        return (n.gender.Female || 0) > (n.gender.Male || 0);
      }
      return false;
    });

    const boys = matchingNames.filter(n => {
      if (typeof n.gender === 'string') {
        const g = n.gender.toLowerCase();
        return g === 'male' || g === 'boy' || g === 'm';
      } else if (typeof n.gender === 'object' && n.gender !== null) {
        return (n.gender.Male || 0) > (n.gender.Female || 0);
      }
      return false;
    });

    const unisex = matchingNames.filter(n => {
      if (typeof n.gender === 'string') {
        const g = n.gender.toLowerCase();
        return g === 'unisex' || g === 'neutral';
      } else if (typeof n.gender === 'object' && n.gender !== null) {
        const female = n.gender.Female || 0;
        const male = n.gender.Male || 0;
        return Math.abs(female - male) < 0.3; // Within 30% is considered unisex
      }
      return false;
    });

    results[category] = {
      total: matchingNames.length,
      girls: girls.length,
      boys: boys.length,
      unisex: unisex.length,
      sampleNames: matchingNames.slice(0, 10).map(n => n.name)
    };
  }

  return results;
};

// Main execution
console.log('📚 Baby Name Blog Post - Database Verification\n');
console.log('='.repeat(60) + '\n');

try {
  const allNames = loadAllNames();
  const results = analyzeCategories(allNames);

  // Display results
  console.log('📊 VERIFICATION RESULTS\n');
  console.log('='.repeat(60) + '\n');

  const blogPosts = [
    { id: 1, name: 'Light/Sun/Star Names', key: 'light-sun-star', claimed: '150+' },
    { id: 2, name: 'Vintage Names', key: 'vintage', claimed: '100+' },
    { id: 3, name: 'Nature Names', key: 'nature', claimed: '120+' },
    { id: 4, name: 'Short Names', key: 'short', claimed: '80+' },
    { id: 5, name: 'Royal Names', key: 'royal', claimed: '90+' },
    { id: 6, name: 'Mythology Names', key: 'mythology', claimed: '100+' },
    { id: 7, name: 'International Names', key: 'international', claimed: '90+' },
    { id: 8, name: 'Unisex Names', key: 'unisex', claimed: '85+' },
    { id: 9, name: 'Color/Gemstone Names', key: 'color-gemstone', claimed: '75+' },
    { id: 10, name: 'Literary Names', key: 'literary', claimed: '95+' }
  ];

  for (const post of blogPosts) {
    const data = results[post.key];
    const claimedNumber = parseInt(post.claimed.replace('+', ''));
    const meetsTarget = data.total >= claimedNumber;
    const status = meetsTarget ? '✅' : '❌';

    console.log(`${status} Post #${post.id}: ${post.name}`);
    console.log(`   Claimed: ${post.claimed} | Actual: ${data.total}`);
    console.log(`   Girls: ${data.girls} | Boys: ${data.boys} | Unisex: ${data.unisex}`);
    console.log(`   Sample: ${data.sampleNames.slice(0, 5).join(', ')}...`);

    if (!meetsTarget) {
      console.log(`   ⚠️  RECOMMENDATION: Change title to "Comprehensive Guide" (no number)`);
    }
    console.log('');
  }

  // Summary
  console.log('='.repeat(60));
  console.log('\n📝 SUMMARY & RECOMMENDATIONS\n');

  const totalPassing = blogPosts.filter(p => {
    const claimed = parseInt(p.claimed.replace('+', ''));
    return results[p.key].total >= claimed;
  }).length;

  console.log(`Posts meeting count targets: ${totalPassing}/${blogPosts.length}`);
  console.log(`Posts needing title updates: ${blogPosts.length - totalPassing}/${blogPosts.length}\n`);

  if (totalPassing < blogPosts.length) {
    console.log('⚠️  ACTION REQUIRED:');
    console.log('For posts marked with ❌, either:');
    console.log('1. Update title to remove specific number claim, OR');
    console.log('2. Broaden the category criteria to include more names\n');
  } else {
    console.log('✅ All posts have sufficient names to meet their claims!\n');
  }

  // Save detailed report
  const reportPath = path.join(__dirname, 'blog-name-count-verification-report.json');
  fs.writeFileSync(reportPath, JSON.stringify({
    timestamp: new Date().toISOString(),
    totalNamesInDatabase: allNames.length,
    categories: results,
    blogPosts: blogPosts.map(p => ({
      ...p,
      actual: results[p.key].total,
      meetsTarget: results[p.key].total >= parseInt(p.claimed.replace('+', ''))
    }))
  }, null, 2));

  console.log(`📄 Detailed report saved to: ${reportPath}\n`);

} catch (error) {
  console.error('❌ Error:', error.message);
  console.error(error.stack);
  process.exit(1);
}
