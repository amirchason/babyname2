const fs = require('fs');
const path = require('path');
const https = require('https');

// Download German names from firstname-database
const GERMAN_NAMES_URL = 'https://raw.githubusercontent.com/MatthiasWinkelmann/firstname-database/master/firstnames.csv';

async function downloadGermanNames() {
  console.log('📥 Downloading German names dataset...\n');

  return new Promise((resolve, reject) => {
    https.get(GERMAN_NAMES_URL, (response) => {
      let data = '';
      response.on('data', chunk => data += chunk);
      response.on('end', () => {
        console.log('✅ Downloaded CSV data\n');
        resolve(data);
      });
    }).on('error', reject);
  });
}

function parseGermanCSV(csvData) {
  const lines = csvData.split('\n');
  const names = [];

  // First line is header - find Germany column index
  const header = lines[0].split(';');
  const germanyIndex = header.indexOf('Germany');

  console.log(`📍 Germany column found at index ${germanyIndex}\n`);

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    if (!line.trim()) continue;

    const parts = line.split(';');
    if (parts.length < 2) continue;

    const name = parts[0].trim();
    const genderCode = parts[1].trim();
    const germanyFreq = germanyIndex >= 0 ? parts[germanyIndex] : '';

    // Only include names with German frequency data
    if (!germanyFreq || germanyFreq.trim() === '') continue;

    // Skip invalid entries
    if (!name || name.length < 2) continue;
    if (name.includes('.')) continue; // Abbreviations
    if (name.includes(' ')) continue; // Multi-word names
    if (/^[A-Z]{2,}$/.test(name)) continue; // ALL CAPS abbreviations

    // Decode gender
    let gender = {};
    if (genderCode.includes('F') && !genderCode.includes('M')) {
      gender = { Male: 0.05, Female: 0.95 };
    } else if (genderCode.includes('M') && !genderCode.includes('F')) {
      gender = { Male: 0.95, Female: 0.05 };
    } else {
      gender = { Male: 0.5, Female: 0.5 }; // Unisex or unknown
    }

    // Proper case formatting
    const properName = name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();

    names.push({
      name: properName,
      originalName: properName,
      genderCode: genderCode,
      gender: gender
    });
  }

  console.log(`📊 Parsed ${names.length} names from CSV\n`);
  return names;
}

async function addGermanNamesToDatabase() {
  const dataDir = path.join(__dirname, 'public', 'data');
  const indexFile = path.join(dataDir, 'names-index.json');

  // Download and parse CSV
  const csvData = await downloadGermanNames();
  let germanNames = parseGermanCSV(csvData);

  console.log('🧹 Cleaning and filtering names...\n');

  // Filter out very short names, invalid characters
  germanNames = germanNames.filter(n => {
    if (n.name.length < 3) return false; // Too short
    if (!/^[A-Za-zÄÖÜäöüß]+$/.test(n.name)) return false; // Non-German characters
    return true;
  });

  console.log(`✅ ${germanNames.length} names after filtering\n`);

  // Load existing names to check for duplicates
  const index = JSON.parse(fs.readFileSync(indexFile, 'utf8'));
  const existingNames = new Set();

  console.log('📚 Loading existing names database...\n');

  const chunks = Object.values(index.chunks);
  for (const chunk of chunks) {
    const chunkFile = path.join(dataDir, chunk.file);
    if (!fs.existsSync(chunkFile)) continue;

    const chunkData = JSON.parse(fs.readFileSync(chunkFile, 'utf8'));
    const names = Array.isArray(chunkData) ? chunkData : (chunkData.names || []);

    names.forEach(n => existingNames.add(n.name.toLowerCase()));
  }

  console.log(`✅ Loaded ${existingNames.size.toLocaleString()} existing names\n`);

  // Filter out duplicates
  const newNames = germanNames.filter(n => !existingNames.has(n.name.toLowerCase()));
  console.log(`🔍 Found ${newNames.length} new German names (${germanNames.length - newNames.length} duplicates removed)\n`);

  if (newNames.length === 0) {
    console.log('⚠️  No new names to add!\n');
    return;
  }

  // Convert to full database format
  const namesToAdd = newNames.map(n => ({
    name: n.name,
    originalName: n.originalName,
    type: "first",
    gender: n.gender,
    origins: ["Germanic"],
    origin: "Germanic",
    originGroup: "Germanic",
    primaryCountry: "DE",
    countries: { DE: 1.0 },
    meaningEtymology: "Germanic origin",
    originSource: "firstname-database-github"
  }));

  // Add to chunk5 (where we added Italian names)
  const chunk5File = path.join(dataDir, 'names-chunk5.json');
  const chunk5Data = JSON.parse(fs.readFileSync(chunk5File, 'utf8'));

  if (Array.isArray(chunk5Data)) {
    chunk5Data.push(...namesToAdd);
    fs.writeFileSync(chunk5File, JSON.stringify(chunk5Data, null, 2), 'utf8');
  } else {
    chunk5Data.names = chunk5Data.names || [];
    chunk5Data.names.push(...namesToAdd);
    fs.writeFileSync(chunk5File, JSON.stringify(chunk5Data, null, 2), 'utf8');
  }

  console.log(`✅ Added ${namesToAdd.length} new German names to names-chunk5.json\n`);

  // Display sample
  console.log('📋 Sample of added names:\n');
  namesToAdd.slice(0, 10).forEach((n, i) => {
    const genderLabel = n.gender.Male > 0.7 ? 'M' : n.gender.Female > 0.7 ? 'F' : 'U';
    console.log(`   ${(i + 1).toString().padStart(2)}. ${n.name.padEnd(20)} [${genderLabel}] ${n.meaningEtymology}`);
  });

  console.log(`\n✨ German names import complete! Added ${namesToAdd.length.toLocaleString()} names\n`);
}

addGermanNamesToDatabase().catch(console.error);
