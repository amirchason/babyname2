#!/usr/bin/env node
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const OpenAI = require('openai');

// Constants
const BATCH_SIZE = 10;
const DELAY_MS = 1500;
const MAX_RETRIES = 3;
const REPORT_INTERVAL = 300000; // 5 minutes

// Paths
const MASTER_STATE_PATH = 'enrichment_logs/master_state.json';
const ERRORS_LOG_PATH = 'enrichment_logs/errors.json';
const SESSION_LOG_PATH = `enrichment_logs/session_${Date.now()}.log`;

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Global state
let masterState = {};
let sessionStartTime = new Date();
let lastReportTime = Date.now();
let sessionStats = {
  processed: 0,
  errors: 0,
  retries: 0,
  cost: 0
};

// Logging functions
function log(message, level = 'INFO') {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] [${level}] ${message}`;
  console.log(logMessage);
  fs.appendFileSync(SESSION_LOG_PATH, logMessage + '\n');
}

function saveProgress() {
  masterState.lastUpdate = new Date().toISOString();
  fs.writeFileSync(MASTER_STATE_PATH, JSON.stringify(masterState, null, 2));
}

function loadMasterState() {
  if (fs.existsSync(MASTER_STATE_PATH)) {
    masterState = JSON.parse(fs.readFileSync(MASTER_STATE_PATH, 'utf8'));
    log('Loaded existing master state');
    log(`Total processed: ${masterState.totalNamesProcessed}`);
    log(`Total errors: ${masterState.totalErrors}`);
    log(`Current chunk: ${masterState.currentChunk}`);
  } else {
    log('ERROR: Master state file not found!', 'ERROR');
    process.exit(1);
  }
}

function loadErrorNames() {
  const errorNames = [];

  // Load from previous error logs
  if (fs.existsSync('first10999_errors.log')) {
    const errorLog = fs.readFileSync('first10999_errors.log', 'utf8');
    // Parse error log to extract name indices
    const lines = errorLog.split('\n');
    // This is simplified - would need actual parsing logic
    log(`Found ${lines.length} error entries to retry`);
  }

  // Load from chunk 1
  const chunk1Path = 'public/data/names-chunk1.json';
  if (fs.existsSync(chunk1Path)) {
    const data = JSON.parse(fs.readFileSync(chunk1Path, 'utf8'));
    const names = data.names || data;

    // Find names without enrichment
    names.forEach((name, idx) => {
      if (idx < 11000 && (!name.meaningProcessed || !name.meanings)) {
        errorNames.push({ ...name, index: idx, chunk: 1 });
      }
    });
  }

  log(`Loaded ${errorNames.length} names for retry`);
  return errorNames;
}

function loadChunk(chunkNumber) {
  const paths = {
    1: 'public/data/names-chunk1.json',
    2: 'public/data/names-chunk-2.json',
    3: 'public/data/names-chunk-3.json',
    4: 'public/data/names-chunk-4.json'
  };

  const chunkPath = paths[chunkNumber];
  if (!fs.existsSync(chunkPath)) {
    log(`Chunk ${chunkNumber} not found at ${chunkPath}`, 'WARN');
    return [];
  }

  const data = JSON.parse(fs.readFileSync(chunkPath, 'utf8'));
  const names = chunkNumber === 1 ? (data.names || data) : data;

  log(`Loaded chunk ${chunkNumber}: ${names.length} names`);
  return names;
}

function saveToChunk(chunkNumber, names) {
  const paths = {
    1: 'public/data/names-chunk1.json',
    2: 'public/data/names-chunk-2.json',
    3: 'public/data/names-chunk-3.json',
    4: 'public/data/names-chunk-4.json'
  };

  const chunkPath = paths[chunkNumber];
  const outputData = chunkNumber === 1 ? { names } : names;

  fs.writeFileSync(chunkPath, JSON.stringify(outputData, null, 2));
  log(`Saved ${names.length} names to chunk ${chunkNumber}`);
}

async function enrichBatch(batch) {
  try {
    const prompt = `Analyze these baby names and provide their meanings and cultural origins.

For each name, provide:
1. A concise, accurate meaning (max 10 words)
2. The cultural origin(s)
3. If the name has multiple distinct meanings, list up to 3

Format as JSON array:
[{
  "name": "Name",
  "meaning": "Primary meaning",
  "meanings": ["meaning1", "meaning2"],
  "origin": ["Origin1", "Origin2"]
}]

Names to analyze: ${batch.map(n => n.name).join(', ')}

Important:
- Be historically and culturally accurate
- For modern names, indicate "Modern" or "Contemporary"
- For unclear etymology, indicate "Unknown"
- Keep meanings concise but meaningful`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{
        role: 'system',
        content: 'You are an expert in etymology, linguistics, and cultural naming traditions. Provide accurate, concise information about baby names.'
      }, {
        role: 'user',
        content: prompt
      }],
      temperature: 0.3,
      max_tokens: 800
    });

    const content = response.choices[0].message.content;
    const jsonMatch = content.match(/\[[\s\S]*\]/);

    if (!jsonMatch) {
      throw new Error('No JSON array found in response');
    }

    const results = JSON.parse(jsonMatch[0]);
    const enrichedNames = [];

    results.forEach((result, idx) => {
      if (batch[idx]) {
        const enrichedName = {
          ...batch[idx],
          meanings: result.meanings || [result.meaning],
          meaningFull: result.meanings?.[0] || result.meaning,
          meaning: (result.meanings?.[0] || result.meaning || '').substring(0, 50),
          origin: Array.isArray(result.origin) ? result.origin : [result.origin],
          meaningProcessed: true,
          originProcessed: true,
          lastEnriched: new Date().toISOString(),
          enrichedWith: 'gpt-4o-mini'
        };
        enrichedNames.push(enrichedName);
      }
    });

    return { success: true, enrichedNames };

  } catch (error) {
    log(`Batch error: ${error.message}`, 'ERROR');
    return { success: false, error: error.message };
  }
}

async function processChunk(chunkNumber, startIndex = 0) {
  log(`Processing chunk ${chunkNumber} from index ${startIndex}`);

  const allNames = loadChunk(chunkNumber);
  if (allNames.length === 0) return;

  // Update master state
  if (!masterState.chunks[chunkNumber]) {
    masterState.chunks[chunkNumber] = { total: allNames.length, processed: 0, errors: 0 };
  }
  masterState.chunks[chunkNumber].total = allNames.length;

  for (let i = startIndex; i < allNames.length; i += BATCH_SIZE) {
    const batch = allNames.slice(i, i + BATCH_SIZE).map((name, idx) => ({
      ...name,
      index: i + idx,
      chunk: chunkNumber
    }));

    if (batch.length === 0) continue;

    // Check if already processed
    const needsProcessing = batch.filter(n => !n.meaningProcessed);
    if (needsProcessing.length === 0) {
      continue;
    }

    log(`Batch ${Math.floor(i/BATCH_SIZE) + 1}: ${needsProcessing.map(n => n.name).join(', ')}`);

    const result = await enrichBatch(needsProcessing);

    if (result.success) {
      // Update names in array
      result.enrichedNames.forEach(enriched => {
        allNames[enriched.index] = enriched;
      });

      sessionStats.processed += result.enrichedNames.length;
      masterState.totalNamesProcessed += result.enrichedNames.length;
      masterState.chunks[chunkNumber].processed += result.enrichedNames.length;

      // Estimate cost
      const cost = result.enrichedNames.length * 0.00005;
      sessionStats.cost += cost;
      masterState.estimatedCost += cost;

      log(`✓ Enriched ${result.enrichedNames.length} names`);
    } else {
      sessionStats.errors += batch.length;
      masterState.totalErrors += batch.length;
      masterState.chunks[chunkNumber].errors += batch.length;

      // Log errors
      const errorEntry = {
        timestamp: new Date().toISOString(),
        chunk: chunkNumber,
        batch: batch.map(n => n.name),
        error: result.error
      };

      let errors = [];
      if (fs.existsSync(ERRORS_LOG_PATH)) {
        errors = JSON.parse(fs.readFileSync(ERRORS_LOG_PATH, 'utf8'));
      }
      errors.push(errorEntry);
      fs.writeFileSync(ERRORS_LOG_PATH, JSON.stringify(errors, null, 2));
    }

    // Update checkpoint
    masterState.lastCheckpoint = {
      chunk: chunkNumber,
      index: i + BATCH_SIZE,
      timestamp: new Date().toISOString()
    };

    // Save progress
    saveProgress();
    saveToChunk(chunkNumber, allNames);

    // Report progress if needed
    if (Date.now() - lastReportTime > REPORT_INTERVAL) {
      generateProgressReport();
      lastReportTime = Date.now();
    }

    // Delay between batches
    if (i + BATCH_SIZE < allNames.length) {
      await new Promise(resolve => setTimeout(resolve, DELAY_MS));
    }
  }

  log(`Completed chunk ${chunkNumber}`);
}

function generateProgressReport() {
  const now = new Date();
  const elapsed = (now - sessionStartTime) / 1000 / 60; // minutes
  const rate = sessionStats.processed / elapsed; // names per minute

  const totalRemaining = estimateTotalRemaining();
  const eta = totalRemaining / rate; // minutes

  const report = `
============================================================
PROGRESS REPORT - ${now.toLocaleString()}
============================================================
Session Stats:
  - Processed: ${sessionStats.processed} names
  - Errors: ${sessionStats.errors}
  - Session time: ${elapsed.toFixed(1)} minutes
  - Processing rate: ${rate.toFixed(1)} names/minute
  - Session cost: $${sessionStats.cost.toFixed(3)}

Overall Progress:
  - Total processed: ${masterState.totalNamesProcessed}
  - Total errors: ${masterState.totalErrors}
  - Total cost: $${masterState.estimatedCost.toFixed(2)}
  - Current chunk: ${masterState.currentChunk}

Estimated Time Remaining: ${eta.toFixed(0)} minutes
============================================================
`;

  log(report);

  // Save to progress reports
  const reportPath = `enrichment_logs/progress_reports/report_${Date.now()}.txt`;
  fs.writeFileSync(reportPath, report);
}

function estimateTotalRemaining() {
  let remaining = 0;

  for (let chunk = 1; chunk <= 4; chunk++) {
    if (masterState.chunks[chunk]) {
      const total = masterState.chunks[chunk].total || 0;
      const processed = masterState.chunks[chunk].processed || 0;
      remaining += Math.max(0, total - processed);
    }
  }

  // Add error retries
  remaining += masterState.errorNames?.length || 0;

  return remaining;
}

async function main() {
  log('============================================================');
  log('MASTER ENRICHMENT SYSTEM STARTING');
  log('============================================================');

  // Load state
  loadMasterState();

  // Step 1: Process error names first
  if (masterState.totalErrors > 0 && !masterState.errorsRetried) {
    log('Step 1: Retrying error names...');
    const errorNames = loadErrorNames();

    for (let i = 0; i < errorNames.length; i += BATCH_SIZE) {
      const batch = errorNames.slice(i, i + BATCH_SIZE);
      const result = await enrichBatch(batch);

      if (result.success) {
        // Update original chunks
        // This would need more complex logic to update the right chunk
        sessionStats.retries += result.enrichedNames.length;
      }

      await new Promise(resolve => setTimeout(resolve, DELAY_MS));
    }

    masterState.errorsRetried = true;
    saveProgress();
  }

  // Step 2: Process remaining chunks
  for (let chunk = masterState.currentChunk; chunk <= 4; chunk++) {
    const startIndex = chunk === masterState.currentChunk
      ? (masterState.lastCheckpoint?.index || 0)
      : 0;

    masterState.currentChunk = chunk;
    await processChunk(chunk, startIndex);
  }

  // Final report
  generateProgressReport();

  log('============================================================');
  log('ENRICHMENT COMPLETE!');
  log(`Total processed: ${masterState.totalNamesProcessed}`);
  log(`Total errors: ${masterState.totalErrors}`);
  log(`Total cost: $${masterState.estimatedCost.toFixed(2)}`);
  log('============================================================');

  masterState.status = 'completed';
  saveProgress();
}

// Error handling
process.on('SIGINT', () => {
  log('Received SIGINT, saving progress...');
  saveProgress();
  process.exit(0);
});

process.on('uncaughtException', (error) => {
  log(`Uncaught exception: ${error.message}`, 'ERROR');
  saveProgress();
  process.exit(1);
});

// Start enrichment
main().catch(error => {
  log(`Fatal error: ${error.message}`, 'ERROR');
  saveProgress();
  process.exit(1);
});