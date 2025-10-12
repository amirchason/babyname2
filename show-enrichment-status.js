#!/usr/bin/env node
/**
 * Show Enrichment Status
 * Reads data chunks and shows enrichment statistics in terminal
 */

const fs = require('fs');
const path = require('path');

console.log('\n' + '='.repeat(70));
console.log('📊 BABY NAMES ENRICHMENT STATUS');
console.log('='.repeat(70) + '\n');

// Load all data chunks
const chunks = [];
const chunkFiles = [
  'public/data/names-chunk1.json',
  'public/data/names-chunk-2.json',
  'public/data/names-chunk-3.json',
  'public/data/names-chunk-4.json'
];

let totalNames = 0;
let enrichedNames = 0;
let recentEnrichments = [];
const originCounts = {};

chunkFiles.forEach((file, index) => {
  if (fs.existsSync(file)) {
    try {
      const content = fs.readFileSync(file, 'utf8');
      const data = JSON.parse(content);

      // Handle different formats
      const names = data.names || data;

      if (!Array.isArray(names)) {
        console.log(`⚠️  Chunk ${index + 1}: Invalid format`);
        return;
      }

      console.log(`✓ Loaded Chunk ${index + 1}: ${names.length.toLocaleString()} names`);

      names.forEach(name => {
        totalNames++;

        // Check if enriched (has meaning and origin)
        const isEnriched = (name.meaning || name.meaningFull) &&
                          (name.origin || (Array.isArray(name.origin) && name.origin.length > 0));

        if (isEnriched) {
          enrichedNames++;

          // Track origins
          const origins = Array.isArray(name.origin) ? name.origin : [name.origin];
          origins.forEach(origin => {
            if (origin) {
              originCounts[origin] = (originCounts[origin] || 0) + 1;
            }
          });

          // Track recent (has enrichedAt timestamp)
          if (name.enrichedAt || name.lastEnriched) {
            const timestamp = name.enrichedAt || name.lastEnriched;
            recentEnrichments.push({
              name: name.name,
              meaning: name.meaning || name.meaningFull,
              origin: Array.isArray(name.origin) ? name.origin.join(', ') : name.origin,
              timestamp: new Date(timestamp)
            });
          }
        }
      });

    } catch (error) {
      console.log(`❌ Error loading ${file}:`, error.message);
    }
  }
});

console.log('\n' + '-'.repeat(70));

// Calculate statistics
const percentage = totalNames > 0 ? ((enrichedNames / totalNames) * 100).toFixed(1) : 0;
const pending = totalNames - enrichedNames;

console.log('\n📈 OVERALL STATISTICS:');
console.log(`   Total Names:        ${totalNames.toLocaleString()}`);
console.log(`   Enriched:           ${enrichedNames.toLocaleString()} (${percentage}%)`);
console.log(`   Pending:            ${pending.toLocaleString()}`);

// Show progress bar
const barLength = 50;
const filled = Math.round((enrichedNames / totalNames) * barLength);
const bar = '█'.repeat(filled) + '░'.repeat(barLength - filled);
console.log(`\n   Progress: [${bar}] ${percentage}%`);

// Show recent enrichments
if (recentEnrichments.length > 0) {
  // Sort by timestamp (most recent first)
  recentEnrichments.sort((a, b) => b.timestamp - a.timestamp);

  console.log(`\n✨ RECENT ENRICHMENTS (last 10):`);
  recentEnrichments.slice(0, 10).forEach(item => {
    const timeAgo = Math.floor((Date.now() - item.timestamp) / (1000 * 60)); // minutes ago
    const timeStr = timeAgo < 60 ? `${timeAgo}m ago` :
                    timeAgo < 1440 ? `${Math.floor(timeAgo/60)}h ago` :
                    `${Math.floor(timeAgo/1440)}d ago`;
    console.log(`   ${item.name}: "${item.meaning}" (${item.origin}) - ${timeStr}`);
  });

  // Calculate processing rate
  const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
  const recentCount = recentEnrichments.filter(r => r.timestamp > fiveMinutesAgo).length;

  if (recentCount > 0) {
    const rate = recentCount / 5; // per minute
    console.log(`\n⚡ Processing Rate: ~${rate.toFixed(1)} names/minute`);

    if (pending > 0) {
      const etaMinutes = pending / rate;
      const etaHours = etaMinutes / 60;
      const etaStr = etaHours < 1 ? `${Math.ceil(etaMinutes)} minutes` :
                                    `${etaHours.toFixed(1)} hours`;
      console.log(`   ETA (remaining):  ~${etaStr}`);
    }
  }
}

// Show top origins
const topOrigins = Object.entries(originCounts)
  .sort((a, b) => b[1] - a[1])
  .slice(0, 10);

if (topOrigins.length > 0) {
  console.log(`\n🌍 TOP ORIGINS:`);
  topOrigins.forEach(([origin, count]) => {
    const percent = ((count / enrichedNames) * 100).toFixed(1);
    const barLen = 20;
    const filled = Math.round((count / topOrigins[0][1]) * barLen);
    const bar = '▓'.repeat(filled) + '░'.repeat(barLen - filled);
    console.log(`   ${origin.padEnd(20)} [${bar}] ${count.toLocaleString()} (${percent}%)`);
  });
}

console.log('\n' + '='.repeat(70) + '\n');
