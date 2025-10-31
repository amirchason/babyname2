const fs = require('fs');
const path = require('path');

// Country to origin mapping
const countryOriginMap = {
  // Spanish-speaking countries
  'ES': 'Spanish', 'MX': 'Spanish', 'AR': 'Spanish', 'CL': 'Spanish', 'PE': 'Spanish',
  'CO': 'Spanish', 'UY': 'Spanish', 'VE': 'Spanish', 'EC': 'Spanish', 'GT': 'Spanish',
  'CU': 'Spanish', 'BO': 'Spanish', 'DO': 'Spanish', 'HN': 'Spanish', 'PY': 'Spanish',
  'SV': 'Spanish', 'NI': 'Spanish', 'CR': 'Spanish', 'PA': 'Spanish', 'PR': 'Spanish',
  
  // African countries
  'NG': 'African', 'GH': 'African', 'ZA': 'African', 'BW': 'African', 'ET': 'African',
  'KE': 'African', 'TZ': 'African', 'UG': 'African', 'ZW': 'African', 'MW': 'African',
  
  // Indian/Sanskrit
  'IN': 'Sanskrit,Indian',
  
  // Arabic/Middle Eastern
  'SA': 'Arabic', 'AE': 'Arabic', 'EG': 'Arabic', 'IQ': 'Arabic', 'SY': 'Arabic',
  'JO': 'Arabic', 'LB': 'Arabic', 'KW': 'Arabic', 'OM': 'Arabic', 'QA': 'Arabic',
  'BH': 'Arabic', 'YE': 'Arabic', 'DZ': 'Arabic', 'MA': 'Arabic', 'TN': 'Arabic',
  
  // French
  'FR': 'French',
  
  // Germanic
  'DE': 'Germanic', 'AT': 'Germanic', 'CH': 'Germanic',
  
  // Chinese
  'CN': 'Chinese', 'TW': 'Chinese',
  
  // Japanese
  'JP': 'Japanese',
  
  // Southeast Asian
  'TH': 'Southeast Asian', 'VN': 'Southeast Asian', 'ID': 'Southeast Asian',
  'MY': 'Southeast Asian', 'PH': 'Southeast Asian',
  
  // Italian
  'IT': 'Italian',
  
  // Greek
  'GR': 'Greek',
  
  // Portuguese/Latin American
  'BR': 'Spanish', 'PT': 'Spanish',
  
  // Irish
  'IE': 'Irish',
  
  // Polish/Slavic
  'PL': 'Slavic', 'CZ': 'Slavic', 'SK': 'Slavic', 'RU': 'Slavic', 'UA': 'Slavic',
  
  // Nordic
  'SE': 'Nordic', 'NO': 'Nordic', 'DK': 'Nordic', 'FI': 'Nordic', 'IS': 'Nordic',
  
  // Hebrew
  'IL': 'Hebrew',
  
  // Turkish
  'TR': 'Turkish',
  
  // Persian
  'IR': 'Persian',
};

function categorizeUnknownName(name) {
  const nameLower = name.name.toLowerCase();
  
  // Priority 1: Check etymology field
  if (name.meaningEtymology) {
    const etym = name.meaningEtymology.toLowerCase();
    
    // Check for "from X" or "X origin" patterns
    if (etym.includes('from latin') || etym.includes('latin origin')) return 'Latin';
    if (etym.includes('from greek') || etym.includes('greek origin')) return 'Greek';
    if (etym.includes('from hebrew') || etym.includes('hebrew origin')) return 'Hebrew';
    if (etym.includes('from arabic') || etym.includes('arabic origin')) return 'Arabic';
    if (etym.includes('from sanskrit') || etym.includes('sanskrit origin')) return 'Sanskrit,Indian';
    if (etym.includes('from spanish') || etym.includes('spanish origin')) return 'Spanish';
    if (etym.includes('from french') || etym.includes('french origin')) return 'French';
    if (etym.includes('from germanic') || etym.includes('germanic origin')) return 'Germanic';
    if (etym.includes('from italian') || etym.includes('italian origin')) return 'Italian';
    if (etym.includes('from chinese') || etym.includes('chinese origin')) return 'Chinese';
    if (etym.includes('from japanese') || etym.includes('japanese origin')) return 'Japanese';
    if (etym.includes('from irish') || etym.includes('irish origin')) return 'Irish';
    if (etym.includes('from slavic') || etym.includes('slavic origin')) return 'Slavic';
    if (etym.includes('from persian') || etym.includes('persian origin')) return 'Persian';
    if (etym.includes('from african') || etym.includes('african origin')) return 'African';
    
    // Check for "Possibly X" hints
    if (etym.includes('possibly spanish')) return 'Spanish';
    if (etym.includes('possibly slavic')) return 'Slavic';
    if (etym.includes('possibly arabic')) return 'Arabic';
    if (etym.includes('possibly french')) return 'French';
    if (etym.includes('possibly italian')) return 'Italian';
  }
  
  // Priority 2: Country-based mapping
  if (name.primaryCountry && countryOriginMap[name.primaryCountry]) {
    return countryOriginMap[name.primaryCountry];
  }
  
  // Priority 3: Name pattern matching
  
  // Spanish patterns
  if (nameLower.endsWith('ez') || nameLower.endsWith('es') || nameLower.endsWith('az') ||
      nameLower.endsWith('ito') || nameLower.endsWith('ita')) {
    return 'Spanish';
  }
  
  // Slavic patterns
  if (nameLower.endsWith('ski') || nameLower.endsWith('sky') || nameLower.endsWith('ov') ||
      nameLower.endsWith('ova') || nameLower.endsWith('enko') || nameLower.endsWith('uk')) {
    return 'Slavic';
  }
  
  // Germanic patterns
  if (nameLower.endsWith('berg') || nameLower.endsWith('stein') || nameLower.endsWith('man') ||
      nameLower.endsWith('mann') || nameLower.endsWith('feld') || nameLower.endsWith('schmidt')) {
    return 'Germanic';
  }
  
  // Arabic patterns
  if (nameLower.startsWith('al-') || nameLower.startsWith('al') || nameLower.startsWith('abd') ||
      nameLower.startsWith('muhammad') || nameLower.startsWith('ahmed') || nameLower.endsWith('een') ||
      nameLower.endsWith('uddin') || nameLower.endsWith('allah')) {
    return 'Arabic';
  }
  
  // Italian patterns
  if (nameLower.endsWith('o') && name.gender && name.gender.Male > 0.7 && name.primaryCountry === 'IT') {
    return 'Italian';
  }
  
  // Japanese patterns (common endings)
  if (nameLower.endsWith('shi') || nameLower.endsWith('ko') || nameLower.endsWith('mi') ||
      nameLower.endsWith('ro') || nameLower.endsWith('ta')) {
    if (name.countries && (name.countries.JP || name.countries.SG || name.countries.HK)) {
      return 'Japanese';
    }
  }
  
  // Sanskrit/Indian patterns
  if (nameLower.endsWith('a') || nameLower.endsWith('an') || nameLower.endsWith('ash') ||
      nameLower.endsWith('esh') || nameLower.endsWith('ish')) {
    if (name.countries && name.countries.IN) {
      return 'Sanskrit,Indian';
    }
  }
  
  // Priority 4: Keep as Unknown if no match
  // Also filter out obvious junk (2-3 letter abbreviations, errors)
  if (name.name.length <= 3 && /^[A-Z]{2,3}$/i.test(name.name)) {
    return 'Unknown'; // Abbreviations like Bd, Lg, Sg
  }
  
  if (name.origin === 'Error' || name.origin === 'Not a recognized name') {
    return 'Unknown'; // Keep errors as unknown
  }
  
  return 'Unknown'; // Default: keep as unknown if no pattern matches
}

async function recategorizeUnknown() {
  const dataDir = path.join(__dirname, 'public', 'data');
  const indexFile = path.join(dataDir, 'names-index.json');

  const index = JSON.parse(fs.readFileSync(indexFile, 'utf8'));
  console.log(`📊 Recategorizing Unknown origins in ${index.totalNames} names\n`);

  const stats = {};
  let totalProcessed = 0;
  let unknownProcessed = 0;
  let recategorized = 0;

  const chunks = Object.values(index.chunks);

  for (const chunk of chunks) {
    const chunkFile = path.join(dataDir, chunk.file);
    if (!fs.existsSync(chunkFile)) {
      console.log(`⚠️  Skipping missing chunk: ${chunk.file}`);
      continue;
    }

    console.log(`📦 Processing ${chunk.file}...`);

    const chunkData = JSON.parse(fs.readFileSync(chunkFile, 'utf8'));
    const names = Array.isArray(chunkData) ? chunkData : (chunkData.names || []);

    let chunkChanges = 0;

    for (const name of names) {
      if (name.originGroup === 'Unknown') {
        unknownProcessed++;
        
        const newOrigin = categorizeUnknownName(name);
        
        if (newOrigin !== 'Unknown') {
          name.originGroup = newOrigin;
          stats[newOrigin] = (stats[newOrigin] || 0) + 1;
          chunkChanges++;
          recategorized++;
        }
      }

      totalProcessed++;
    }

    // Save updated chunk
    if (chunkChanges > 0) {
      if (Array.isArray(chunkData)) {
        fs.writeFileSync(chunkFile, JSON.stringify(chunkData, null, 2), 'utf8');
      } else {
        fs.writeFileSync(chunkFile, JSON.stringify(chunkData, null, 2), 'utf8');
      }
      console.log(`   ✅ Recategorized ${chunkChanges} names`);
    } else {
      console.log(`   ⏭️  No Unknown names to recategorize`);
    }
  }

  console.log(`\n✅ Processed ${totalProcessed} total names`);
  console.log(`✅ Found ${unknownProcessed} Unknown origin names`);
  console.log(`✅ Recategorized ${recategorized} names (${((recategorized/unknownProcessed)*100).toFixed(1)}%)\n`);

  // Display recategorization summary
  console.log('═══════════════════════════════════════════════════════');
  console.log('📊 RECATEGORIZATION SUMMARY');
  console.log('═══════════════════════════════════════════════════════\n');

  const sortedStats = Object.entries(stats).sort((a, b) => b[1] - a[1]);
  sortedStats.forEach(([origin, count]) => {
    console.log(`  ${origin.padEnd(25)} ${count.toLocaleString().padStart(8)} names`);
  });

  console.log(`\n✨ Recategorization complete!\n`);
}

recategorizeUnknown().catch(console.error);
