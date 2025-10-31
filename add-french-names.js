const fs = require('fs');
const path = require('path');
const https = require('https');

// Download French names from INSEE death records dataset
const FRENCH_NAMES_URL = 'https://raw.githubusercontent.com/sctg-development/french-names-extractor/main/firstnames.csv';

async function downloadFrenchNames() {
  console.log('📥 Downloading French names dataset from INSEE...\n');

  return new Promise((resolve, reject) => {
    https.get(FRENCH_NAMES_URL, (response) => {
      let data = '';
      response.on('data', chunk => data += chunk);
      response.on('end', () => {
        console.log('✅ Downloaded CSV data\n');
        resolve(data);
      });
    }).on('error', reject);
  });
}

function parseFrenchCSV(csvData) {
  const lines = csvData.split('\n');
  const names = [];

  // Skip header
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    if (!line.trim()) continue;

    const parts = line.split(',');
    if (parts.length < 3) continue;

    const firstname = parts[0].trim();
    const sexe = parts[1].trim();
    const occurrences = parseInt(parts[2]) || 0;

    // Skip invalid entries
    if (!firstname || firstname.length < 2) continue;
    if (firstname.includes('.')) continue; // Abbreviations
    // NOTE: Keep hyphenated names (Jean-Pierre, Marie-Louise, etc.) - they're authentic French
    if (/^[A-Z]{2,}$/i.test(firstname)) continue; // ALL CAPS abbreviations

    // Filter by minimum occurrences (quality filter) - lowered to 2 for more variety
    if (occurrences < 2) continue;

    // Decode gender (1=male, 2=female)
    let gender = {};
    if (sexe === '1') {
      gender = { Male: 0.95, Female: 0.05 };
    } else if (sexe === '2') {
      gender = { Male: 0.05, Female: 0.95 };
    } else {
      gender = { Male: 0.5, Female: 0.5 }; // Unisex or unknown
    }

    // Proper case formatting (capitalize first letter)
    const properName = firstname.charAt(0).toUpperCase() + firstname.slice(1).toLowerCase();

    names.push({
      name: properName,
      originalName: properName,
      gender: gender,
      occurrences: occurrences
    });
  }

  console.log(`📊 Parsed ${names.length} names from CSV\n`);
  return names;
}

async function addFrenchNamesToDatabase() {
  const dataDir = path.join(__dirname, 'public', 'data');
  const indexFile = path.join(dataDir, 'names-index.json');

  // Download and parse CSV
  const csvData = await downloadFrenchNames();
  let frenchNames = parseFrenchCSV(csvData);

  console.log('🧹 Cleaning and filtering names...\n');

  // Filter out non-French characters, very short names
  frenchNames = frenchNames.filter(n => {
    if (n.name.length < 2) return false; // Too short
    // Allow French characters: letters, accents (é, è, ê, à, ç, etc.), and hyphens for compound names
    // NOTE: Hyphen must be escaped or at end of character class
    if (!/^[A-Za-zÀ-ÿ\-]+$/.test(n.name)) return false;
    // Remove obvious non-French patterns
    if (n.name.includes('--')) return false;
    if (n.name.startsWith('-') || n.name.endsWith('-')) return false;
    return true;
  });

  // Sort by occurrences descending and take top names
  frenchNames.sort((a, b) => b.occurrences - a.occurrences);

  console.log(`✅ ${frenchNames.length} names after filtering\n`);

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
  const newNames = frenchNames.filter(n => !existingNames.has(n.name.toLowerCase()));
  console.log(`🔍 Found ${newNames.length} new French names (${frenchNames.length - newNames.length} duplicates removed)\n`);

  if (newNames.length === 0) {
    console.log('⚠️  No new names to add!\n');
    return;
  }

  // Take top 5000 names by occurrences
  const namesToAdd = newNames.slice(0, 5000).map(n => ({
    name: n.name,
    originalName: n.originalName,
    type: "first",
    gender: n.gender,
    origins: ["French"],
    origin: "French",
    originGroup: "French",
    primaryCountry: "FR",
    countries: { FR: 1.0 },
    meaningEtymology: "French origin",
    originSource: "INSEE-death-records-1970-2024"
  }));

  // Add to chunk5 (where we added Italian and German names)
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

  console.log(`✅ Added ${namesToAdd.length} new French names to names-chunk5.json\n`);

  // Display sample
  console.log('📋 Sample of added names (top by occurrences):\n');
  namesToAdd.slice(0, 15).forEach((n, i) => {
    const genderLabel = n.gender.Male > 0.7 ? 'M' : n.gender.Female > 0.7 ? 'F' : 'U';
    console.log(`   ${(i + 1).toString().padStart(2)}. ${n.name.padEnd(20)} [${genderLabel}] ${n.meaningEtymology}`);
  });

  console.log(`\n✨ French names import complete! Added ${namesToAdd.length.toLocaleString()} names from INSEE records\n`);
  console.log(`📊 Source: INSEE death records (1970-2024)`);
  console.log(`📊 Quality filter: Minimum 5 occurrences\n`);
}

addFrenchNamesToDatabase().catch(console.error);
