#!/usr/bin/env node
const fs = require('fs');

console.log('Migrating existing progress to master state...\n');

// Load existing progress files
let totalProcessed = 0;
let totalErrors = 0;
let estimatedCost = 0;

// Load first10999_progress.json
if (fs.existsSync('first10999_progress.json')) {
  const first10999 = JSON.parse(fs.readFileSync('first10999_progress.json', 'utf8'));
  totalProcessed += first10999.totalProcessed || 0;
  totalErrors += first10999.totalErrors || 0;
  console.log(`First 10999: ${first10999.totalProcessed} processed, ${first10999.totalErrors} errors`);
}

// Load mini_enrichment_progress.json
if (fs.existsSync('mini_enrichment_progress.json')) {
  const mini = JSON.parse(fs.readFileSync('mini_enrichment_progress.json', 'utf8'));
  totalProcessed += mini.totalProcessed || 0;
  totalErrors += mini.totalErrors || 0;
  estimatedCost += mini.estimatedCost || 0;
  console.log(`Mini enrichment: ${mini.totalProcessed} processed, ${mini.totalErrors} errors`);
}

// Create updated master state
const masterState = {
  "status": "ready",
  "currentChunk": 1,
  "totalNamesProcessed": totalProcessed,
  "totalErrors": 1453, // From error logs
  "errorNames": [],
  "errorsRetried": false,
  "lastCheckpoint": {
    "chunk": 1,
    "index": 11000,
    "timestamp": new Date().toISOString()
  },
  "chunks": {
    "1": {
      "total": null,
      "processed": 11000,
      "errors": 1453
    },
    "2": {
      "total": null,
      "processed": 0,
      "errors": 0
    },
    "3": {
      "total": null,
      "processed": 0,
      "errors": 0
    },
    "4": {
      "total": null,
      "processed": 0,
      "errors": 0
    }
  },
  "model": "gpt-4o-mini",
  "estimatedCost": estimatedCost + (totalProcessed * 0.00005),
  "sessions": [],
  "lastUpdate": new Date().toISOString()
};

// Save master state
fs.writeFileSync('enrichment_logs/master_state.json', JSON.stringify(masterState, null, 2));

console.log('\n✅ Migration complete!');
console.log(`Total names processed: ${totalProcessed}`);
console.log(`Total errors to retry: ${1453}`);
console.log(`Estimated cost so far: $${masterState.estimatedCost.toFixed(2)}`);
console.log('\nMaster state saved to: enrichment_logs/master_state.json');