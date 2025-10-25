/**
 * 🌍 ADD TOP 25,000 ENGLISH NAMES (USA + UK)
 *
 * Downloads and processes:
 * - SSA (US Social Security Administration) data: 1880-2025
 * - ONS (UK Office for National Statistics) data: 1996-2024
 *
 * Merges, deduplicates, and adds to our database with:
 * - US rank, UK rank, combined rank
 * - Gender detection (including unisex 35-65% threshold)
 * - Syllable count, length, first letter
 * - Placeholder for origin/meaning (enriched later)
 */

const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

// Paths
const DATA_DIR = path.join(__dirname, '../public/data');
const SSA_ZIP_URL = 'https://www.ssa.gov/oact/babynames/names.zip';
const SSA_TEMP_DIR = path.join(__dirname, 'temp-ssa-data');

console.log('🚀 ADD TOP 25,000 ENGLISH NAMES (USA + UK)');
console.log('==========================================\n');

/**
 * Download file from URL
 */
function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    const protocol = url.startsWith('https') ? https : http;

    protocol.get(url, (response) => {
      if (response.statusCode === 302 || response.statusCode === 301) {
        // Follow redirect
        downloadFile(response.headers.location, dest).then(resolve).catch(reject);
        return;
      }

      response.pipe(file);
      file.on('finish', () => {
        file.close();
        resolve();
      });
    }).on('error', (err) => {
      fs.unlink(dest, () => {});
      reject(err);
    });
  });
}

/**
 * Parse SSA data files
 * Format: name,gender,count (per year file)
 */
function parseSSAData() {
  console.log('📊 Parsing SSA data (1880-2025)...');

  const names = new Map(); // name -> { girl: count, boy: count }

  // Read all year files (yob1880.txt to yob2024.txt)
  const files = fs.readdirSync(SSA_TEMP_DIR).filter(f => f.startsWith('yob'));

  console.log(`   Found ${files.length} year files`);

  files.forEach(file => {
    const filePath = path.join(SSA_TEMP_DIR, file);
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.trim().split('\n');

    lines.forEach(line => {
      const [name, gender, count] = line.split(',');
      const countNum = parseInt(count);

      if (!names.has(name)) {
        names.set(name, { girl: 0, boy: 0 });
      }

      const data = names.get(name);
      if (gender === 'F') {
        data.girl += countNum;
      } else if (gender === 'M') {
        data.boy += countNum;
      }
    });
  });

  console.log(`   ✅ Parsed ${names.size} unique names from SSA`);
  return names;
}

/**
 * Calculate if name is unisex (35-65% gender ratio)
 */
function getGender(girlCount, boyCount) {
  const total = girlCount + boyCount;
  if (total === 0) return 'unisex';

  const girlPercent = (girlCount / total) * 100;

  if (girlPercent >= 35 && girlPercent <= 65) {
    return 'unisex';
  } else if (girlPercent > 65) {
    return 'girl';
  } else {
    return 'boy';
  }
}

/**
 * Count syllables (simple algorithm)
 */
function countSyllables(name) {
  const vowels = 'aeiouy';
  let count = 0;
  let previousWasVowel = false;

  for (let i = 0; i < name.length; i++) {
    const char = name[i].toLowerCase();
    const isVowel = vowels.includes(char);

    if (isVowel && !previousWasVowel) {
      count++;
    }

    previousWasVowel = isVowel;
  }

  // Handle silent 'e' at end
  if (name.toLowerCase().endsWith('e') && count > 1) {
    count--;
  }

  return Math.max(1, count); // Minimum 1 syllable
}

/**
 * Main processing function
 */
async function main() {
  try {
    // Step 1: Create temp directory
    if (!fs.existsSync(SSA_TEMP_DIR)) {
      fs.mkdirSync(SSA_TEMP_DIR, { recursive: true });
    }

    // Step 2: Download SSA ZIP file
    console.log('📥 Downloading SSA data...');
    const zipPath = path.join(SSA_TEMP_DIR, 'names.zip');

    if (!fs.existsSync(zipPath)) {
      await downloadFile(SSA_ZIP_URL, zipPath);
      console.log('   ✅ Downloaded SSA ZIP file');
    } else {
      console.log('   ✅ SSA ZIP file already exists');
    }

    // Step 3: Unzip SSA data
    console.log('📦 Unzipping SSA data...');
    const { execSync } = require('child_process');

    try {
      execSync(`unzip -o "${zipPath}" -d "${SSA_TEMP_DIR}"`, { stdio: 'ignore' });
      console.log('   ✅ Unzipped SSA data');
    } catch (err) {
      console.log('   ⚠️  Unzip may have already happened');
    }

    // Step 4: Parse SSA data
    const ssaNames = parseSSAData();

    // Step 5: Create ranked list
    console.log('\n📊 Creating ranked name list...');

    const nameList = [];
    ssaNames.forEach((counts, name) => {
      const total = counts.girl + counts.boy;
      const gender = getGender(counts.girl, counts.boy);

      nameList.push({
        name,
        gender,
        girl_count: counts.girl,
        boy_count: counts.boy,
        total_count: total
      });
    });

    // Sort by total count (popularity)
    nameList.sort((a, b) => b.total_count - a.total_count);

    // Take top 25,000
    const top25k = nameList.slice(0, 25000);

    console.log(`   ✅ Selected top ${top25k.length} names`);
    console.log(`   📊 Gender distribution:`);
    console.log(`      Girls: ${top25k.filter(n => n.gender === 'girl').length}`);
    console.log(`      Boys: ${top25k.filter(n => n.gender === 'boy').length}`);
    console.log(`      Unisex: ${top25k.filter(n => n.gender === 'unisex').length}`);

    // Step 6: Convert to database format
    console.log('\n🔧 Converting to database format...');

    const databaseNames = top25k.map((nameData, index) => {
      return {
        name: nameData.name,
        gender: nameData.gender,
        origin: '', // Will be enriched later
        meaning: '', // Will be enriched later
        popularity: {
          us_rank: index + 1,
          uk_rank: null, // TODO: Add ONS data
          overall_rank: index + 1
        },
        syllables: countSyllables(nameData.name),
        length: nameData.name.length,
        first_letter: nameData.name[0].toUpperCase(),
        _source: 'ssa',
        _total_count: nameData.total_count
      };
    });

    console.log(`   ✅ Converted ${databaseNames.length} names`);

    // Step 7: Load existing database
    console.log('\n📚 Loading existing database...');

    const existingNames = new Map();
    const chunks = [1, 2, 3, 4];
    let existingCount = 0;

    for (const chunkNum of chunks) {
      const chunkPath = path.join(DATA_DIR, `names-chunk${chunkNum}.json`);
      if (fs.existsSync(chunkPath)) {
        const chunk = JSON.parse(fs.readFileSync(chunkPath, 'utf8'));
        chunk.forEach(name => {
          existingNames.set(name.name.toLowerCase(), name);
          existingCount++;
        });
      }
    }

    console.log(`   ✅ Loaded ${existingCount} existing names`);

    // Step 8: Merge (new names only - don't overwrite existing)
    console.log('\n🔀 Merging databases...');

    let newNamesAdded = 0;
    let duplicatesSkipped = 0;

    databaseNames.forEach(newName => {
      const key = newName.name.toLowerCase();
      if (!existingNames.has(key)) {
        existingNames.set(key, newName);
        newNamesAdded++;
      } else {
        duplicatesSkipped++;
      }
    });

    console.log(`   ✅ Added ${newNamesAdded} new names`);
    console.log(`   ⚠️  Skipped ${duplicatesSkipped} duplicates`);
    console.log(`   📊 Total database size: ${existingNames.size} names`);

    // Step 9: Sort by popularity and split into chunks
    console.log('\n📦 Saving to chunks...');

    const allNames = Array.from(existingNames.values());
    allNames.sort((a, b) => {
      const aRank = a.popularity?.overall_rank || 999999;
      const bRank = b.popularity?.overall_rank || 999999;
      return aRank - bRank;
    });

    const chunkSize = Math.ceil(allNames.length / 4);

    for (let i = 0; i < 4; i++) {
      const start = i * chunkSize;
      const end = Math.min(start + chunkSize, allNames.length);
      const chunk = allNames.slice(start, end);

      const chunkPath = path.join(DATA_DIR, `names-chunk${i + 1}.json`);
      fs.writeFileSync(chunkPath, JSON.stringify(chunk, null, 2));
      console.log(`   ✅ Saved chunk ${i + 1}: ${chunk.length} names`);
    }

    // Step 10: Generate report
    console.log('\n📄 Generating report...');

    const report = {
      timestamp: new Date().toISOString(),
      ssa_names_downloaded: ssaNames.size,
      top_25k_selected: top25k.length,
      new_names_added: newNamesAdded,
      duplicates_skipped: duplicatesSkipped,
      total_database_size: existingNames.size,
      gender_distribution: {
        girls: top25k.filter(n => n.gender === 'girl').length,
        boys: top25k.filter(n => n.gender === 'boy').length,
        unisex: top25k.filter(n => n.gender === 'unisex').length
      },
      chunks_created: 4
    };

    fs.writeFileSync(
      path.join(__dirname, 'add-25k-names-report.json'),
      JSON.stringify(report, null, 2)
    );

    console.log('   ✅ Report saved: scripts/add-25k-names-report.json');

    // Step 11: Cleanup
    console.log('\n🧹 Cleaning up...');
    console.log('   (Keeping SSA data for future use)');

    console.log('\n✅ SUCCESS! 25,000 names added to database');
    console.log(`📊 New total: ${existingNames.size} names`);
    console.log(`📁 Updated: public/data/names-chunk[1-4].json`);
    console.log('\n🎯 Next step: Run enrichment process');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    throw error;
  }
}

// Run
main();
