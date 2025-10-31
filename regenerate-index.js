/**
 * Regenerate names-index.json with correct chunk counts
 */

const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, 'public/data');

// Read all chunks to get actual counts
const chunks = {};
let totalNames = 0;
let currentIndex = 0;

// Core chunk
try {
  const coreFile = JSON.parse(fs.readFileSync(path.join(dataDir, 'names-core.json'), 'utf8'));
  const coreData = coreFile.names || coreFile;
  const count = Array.isArray(coreData) ? coreData.length : 0;
  chunks.core = {
    file: 'names-core.json',
    fileGz: 'names-core.json.gz',
    count: count,
    startIndex: 0,
    endIndex: count - 1
  };
  totalNames += count;
  currentIndex = count;
  console.log(`✅ core: ${count} names`);
} catch (e) {
  console.error(`❌ Error reading core:`, e.message);
}

// Regular chunks
for (let i = 1; i <= 5; i++) {
  const chunkName = `chunk${i}`;
  const chunkFile = `names-chunk${i}.json`;
  const chunkPath = path.join(dataDir, chunkFile);

  try {
    const chunkFileData = JSON.parse(fs.readFileSync(chunkPath, 'utf8'));
    const chunkData = chunkFileData.names || chunkFileData;
    const count = Array.isArray(chunkData) ? chunkData.length : 0;

    chunks[chunkName] = {
      file: chunkFile,
      fileGz: `${chunkFile}.gz`,
      count: count,
      startIndex: currentIndex,
      endIndex: currentIndex + count - 1
    };

    totalNames += count;
    currentIndex += count;
    console.log(`✅ ${chunkName}: ${count} names (index ${chunks[chunkName].startIndex}-${chunks[chunkName].endIndex})`);
  } catch (e) {
    console.error(`❌ Error reading ${chunkName}:`, e.message);
  }
}

// Create new index
const newIndex = {
  version: '2.2.0',
  totalNames: totalNames,
  chunks: chunks
};

// Write to file
fs.writeFileSync(
  path.join(dataDir, 'names-index.json'),
  JSON.stringify(newIndex, null, 2),
  'utf8'
);

console.log(`\n✅ Index regenerated!`);
console.log(`   Total names: ${totalNames.toLocaleString()}`);
console.log(`   Total chunks: ${Object.keys(chunks).length}`);
console.log(`   File: public/data/names-index.json`);
