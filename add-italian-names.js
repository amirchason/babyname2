const fs = require('fs');
const path = require('path');
const https = require('https');

const GITHUB_CSV_URL = 'https://raw.githubusercontent.com/mrblasco/genderNamesITA/master/gender_firstnames_ITA.csv';

// Download CSV file
function downloadCSV(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (response) => {
      let data = '';
      response.on('data', (chunk) => data += chunk);
      response.on('end', () => resolve(data));
      response.on('error', reject);
    });
  });
}

// Parse CSV
function parseCSV(csvText) {
  const lines = csvText.trim().split('\n');
  const headers = lines[0].split(',');
  
  return lines.slice(1).map(line => {
    const values = line.split(',');
    return {
      nome: values[0]?.trim(),
      tot: parseInt(values[1]) || 0,
      male: parseInt(values[2]) || 0,
      female: parseInt(values[3]) || 0
    };
  });
}

// Clean and filter Italian names
function cleanItalianNames(names) {
  return names
    .filter(n => {
      if (!n.nome || n.nome.length < 2) return false;
      
      // Remove entries with dots (abbreviations)
      if (n.nome.includes('.')) return false;
      
      // Remove entries with multiple words/spaces
      if (n.nome.includes(' ')) return false;
      
      // Remove entries that are all uppercase duplicates starting with AA, BB, etc.
      if (/^([A-Z])\1/.test(n.nome)) return false;
      
      // Must have at least 10 total occurrences (quality filter)
      if (n.tot < 10) return false;
      
      // Remove obvious foreign names (Arabic, etc.)
      if (n.nome.startsWith('ABD') || n.nome.startsWith('ABDUL')) return false;
      
      return true;
    })
    .map(n => {
      // Proper capitalization
      const name = n.nome.charAt(0).toUpperCase() + n.nome.slice(1).toLowerCase();
      
      // Determine gender
      const maleRatio = n.male / (n.male + n.female);
      const gender = maleRatio > 0.8 ? { Male: 0.95, Female: 0.05 } :
                     maleRatio < 0.2 ? { Male: 0.05, Female: 0.95 } :
                     { Male: 0.5, Female: 0.5 };
      
      return {
        name,
        originalName: name,
        tot: n.tot,
        gender,
        popularity: n.tot // Use occurrence count as popularity
      };
    })
    // Sort by popularity (descending)
    .sort((a, b) => b.popularity - a.popularity);
}

// Load existing database names
function getExistingNames() {
  const dataDir = path.join(__dirname, 'public', 'data');
  const indexFile = path.join(dataDir, 'names-index.json');
  const index = JSON.parse(fs.readFileSync(indexFile, 'utf8'));
  
  const existingNames = new Set();
  const chunks = Object.values(index.chunks);
  
  for (const chunk of chunks) {
    const chunkFile = path.join(dataDir, chunk.file);
    if (!fs.existsSync(chunkFile)) continue;
    
    const chunkData = JSON.parse(fs.readFileSync(chunkFile, 'utf8'));
    const names = Array.isArray(chunkData) ? chunkData : (chunkData.names || []);
    
    names.forEach(n => {
      existingNames.add(n.name.toLowerCase());
    });
  }
  
  return existingNames;
}

// Create formatted name entry
function createNameEntry(name, rankOffset) {
  const popularityScore = 1000000 - rankOffset; // Higher score for higher popularity
  
  return {
    name: name.name,
    originalName: name.originalName,
    type: "first",
    gender: name.gender,
    popularity: popularityScore,
    popularityRank: rankOffset + 1,
    isPopular: name.tot > 100,
    countries: { IT: 1 },
    globalCountries: { Italy: 1.0 },
    primaryCountry: "IT",
    appearances: Math.min(name.tot, 100),
    globalFrequency: Math.min(name.tot, 100),
    popularityScore: popularityScore,
    globalPopularityScore: popularityScore + 1000,
    searchPriority: 1,
    origins: ["Italian"],
    origin: "Italian",
    originsDetails: {
      primary: "Italian",
      secondary: null,
      tertiary: null,
      percentages: null
    },
    meaningShort: "Italian name",
    meanings: [`Traditional Italian name`],
    meaningFull: "Traditional Italian name with cultural heritage",
    meaning: "Italian name",
    meaningEtymology: "Italian origin",
    originProcessed: true,
    originProcessedAt: new Date().toISOString(),
    originSource: "ISTAT-Italian-Administrative-Records",
    meaningProcessed: true,
    meaningProcessedAt: new Date().toISOString(),
    meaningSource: "manual",
    originGroup: "Italian",
    ssaPopularity: 0
  };
}

async function addItalianNames() {
  console.log('📥 Downloading Italian names dataset from GitHub...\n');
  
  const csvData = await downloadCSV(GITHUB_CSV_URL);
  console.log('✅ Downloaded CSV data\n');
  
  console.log('📊 Parsing CSV...');
  const rawNames = parseCSV(csvData);
  console.log(`✅ Parsed ${rawNames.length.toLocaleString()} raw entries\n`);
  
  console.log('🧹 Cleaning and filtering names...');
  const cleanedNames = cleanItalianNames(rawNames);
  console.log(`✅ Filtered to ${cleanedNames.length.toLocaleString()} high-quality names\n`);
  
  console.log('🔍 Checking for duplicates against existing database...');
  const existingNames = getExistingNames();
  console.log(`✅ Loaded ${existingNames.size.toLocaleString()} existing names\n`);
  
  const newNames = cleanedNames.filter(n => !existingNames.has(n.name.toLowerCase()));
  console.log(`✅ Found ${newNames.length.toLocaleString()} NEW Italian names (no duplicates)\n`);
  
  // Take top 5000 (or all if less)
  const namesToAdd = newNames.slice(0, 5000);
  console.log(`📝 Adding top ${namesToAdd.length.toLocaleString()} Italian names to database...\n`);
  
  // Create formatted entries
  const formattedEntries = namesToAdd.map((name, idx) => createNameEntry(name, idx));
  
  // Add to chunk5 (smallest chunk)
  const dataDir = path.join(__dirname, 'public', 'data');
  const chunk5File = path.join(dataDir, 'names-chunk5.json');
  
  const chunk5Data = JSON.parse(fs.readFileSync(chunk5File, 'utf8'));
  const chunk5Names = Array.isArray(chunk5Data) ? chunk5Data : chunk5Data.names;
  
  // Append new names
  const updatedChunk5 = [...chunk5Names, ...formattedEntries];
  
  // Save
  fs.writeFileSync(chunk5File, JSON.stringify(updatedChunk5, null, 2), 'utf8');
  
  console.log('✅ Successfully added Italian names to database!\n');
  console.log('═══════════════════════════════════════════════════════');
  console.log('📊 SUMMARY');
  console.log('═══════════════════════════════════════════════════════');
  console.log(`Total names downloaded: ${rawNames.length.toLocaleString()}`);
  console.log(`After cleaning/filtering: ${cleanedNames.length.toLocaleString()}`);
  console.log(`New names (no duplicates): ${newNames.length.toLocaleString()}`);
  console.log(`Added to database: ${formattedEntries.length.toLocaleString()}`);
  console.log(`Updated chunk: names-chunk5.json`);
  console.log(`New chunk5 size: ${updatedChunk5.length.toLocaleString()} names\n`);
  
  // Show sample of added names
  console.log('📝 Sample of added names (top 20):');
  namesToAdd.slice(0, 20).forEach((n, idx) => {
    const genderLabel = n.gender.Male > 0.8 ? 'M' : n.gender.Female > 0.8 ? 'F' : 'U';
    console.log(`  ${(idx + 1).toString().padStart(2)}. ${n.name.padEnd(20)} [${genderLabel}] (${n.tot} occurrences)`);
  });
  
  console.log('\n✨ Italian names addition complete!\n');
  console.log('🔄 Next step: Run analyze-origins.js to verify new counts\n');
}

addItalianNames().catch(console.error);
