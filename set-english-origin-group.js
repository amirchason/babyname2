const fs = require('fs');
const path = require('path');

async function setEnglishOriginGroup() {
  const dataDir = path.join(__dirname, 'public', 'data');
  const indexFile = path.join(dataDir, 'names-index.json');

  const index = JSON.parse(fs.readFileSync(indexFile, 'utf8'));
  console.log(`📊 Total names in database: ${index.totalNames}\n`);

  let totalProcessed = 0;
  let englishCount = 0;

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
      // Check if origin field contains English-related patterns
      if (name.origin && typeof name.origin === 'string') {
        const originLower = name.origin.toLowerCase();

        // English patterns: english, modern, contemporary, american, old english
        const isEnglish = originLower.includes('english') ||
                         originLower === 'modern' ||
                         originLower === 'contemporary' ||
                         originLower === 'american' ||
                         originLower.startsWith('modern,') ||
                         originLower.startsWith('contemporary,') ||
                         originLower.endsWith(',modern') ||
                         originLower.endsWith(',contemporary');

        if (isEnglish) {
          // Set originGroup to "English"
          const oldGroup = name.originGroup;
          name.originGroup = 'English';

          if (oldGroup !== 'English') {
            chunkChanges++;
            englishCount++;
          }
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
      console.log(`   ✅ Updated ${chunkChanges} names to originGroup="English"`);
    } else {
      console.log(`   ⏭️  No changes needed`);
    }
  }

  console.log(`\n✅ Processed ${totalProcessed} names`);
  console.log(`✅ Set ${englishCount.toLocaleString()} names to originGroup="English"\n`);
}

setEnglishOriginGroup().catch(console.error);
