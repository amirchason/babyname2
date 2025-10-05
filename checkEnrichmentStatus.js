const fs = require('fs');

console.log('📊 ENRICHMENT STATUS REPORT\n');

// Check each chunk
for (let i = 1; i <= 4; i++) {
  try {
    const fileContent = fs.readFileSync(`./public/data/names-chunk${i}.json`, 'utf8');
    const data = JSON.parse(fileContent);

    // Handle both array and object with names array
    const names = Array.isArray(data) ? data : data.names || [];

    const total = names.length;
    const withMeaning = names.filter(n => n.meaning && n.meaning !== 'Unknown' && n.meaning !== '').length;
    const withOrigin = names.filter(n => n.origin && n.origin !== 'Unknown' && n.origin !== '').length;

    console.log(`Chunk ${i}:`);
    console.log(`  Total names: ${total.toLocaleString()}`);
    console.log(`  With meaning: ${withMeaning.toLocaleString()} (${(withMeaning/total*100).toFixed(1)}%)`);
    console.log(`  With origin: ${withOrigin.toLocaleString()} (${(withOrigin/total*100).toFixed(1)}%)`);
    console.log('');
  } catch (e) {
    console.log(`Chunk ${i}: Error - ${e.message}`);
  }
}

// Check progress files
console.log('🔄 RECENT ENRICHMENT RUNS:\n');

const progressFiles = [
  'first10999_progress.json',
  'mini_enrichment_progress.json',
  'unknown_origins_progress.json'
];

progressFiles.forEach(file => {
  try {
    const progress = JSON.parse(fs.readFileSync(file, 'utf8'));
    console.log(`${file}:`);
    console.log(`  Processed: ${progress.totalProcessed || 0}`);
    console.log(`  Errors: ${progress.totalErrors || 0}`);
    console.log(`  Last update: ${progress.lastUpdate}`);
    console.log('');
  } catch (e) {
    // Skip missing files
  }
});
