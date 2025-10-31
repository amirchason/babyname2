const fs = require('fs');
const path = require('path');

async function sampleUnknownNames() {
  const dataDir = path.join(__dirname, 'public', 'data');
  const chunkFile = path.join(dataDir, 'names-chunk1.json');

  const chunkData = JSON.parse(fs.readFileSync(chunkFile, 'utf8'));
  const names = Array.isArray(chunkData) ? chunkData : (chunkData.names || []);

  const unknownNames = names.filter(n => n.originGroup === 'Unknown').slice(0, 50);

  console.log(`📊 Sample of ${unknownNames.length} Unknown origin names:\n`);

  unknownNames.forEach((name, idx) => {
    console.log(`${(idx + 1).toString().padStart(2)}. ${name.name.padEnd(20)} | origin: ${(name.origin || 'N/A').padEnd(20)} | country: ${name.primaryCountry || 'N/A'}`);
    if (name.meaningEtymology) {
      console.log(`    Etymology: ${name.meaningEtymology.substring(0, 80)}`);
    }
    if (name.countries) {
      const countries = Object.entries(name.countries).slice(0, 3).map(([c, v]) => `${c}(${v})`).join(', ');
      console.log(`    Countries: ${countries}`);
    }
    console.log('');
  });
}

sampleUnknownNames().catch(console.error);
