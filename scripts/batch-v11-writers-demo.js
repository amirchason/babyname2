#!/usr/bin/env node

/**
 * BATCH V11 WRITERS - DEMO
 *
 * Processes 10 names with randomized writer assignments
 * Shows the variety of voices in the Writers Collective
 */

const { spawn } = require('child_process');

// 10 sample names to enrich
const NAMES_TO_ENRICH = [
  'liam', 'olivia', 'noah', 'emma', 'oliver',
  'charlotte', 'james', 'amelia', 'mia', 'benjamin'
];

// 10 writers (keys)
const WRITERS = [
  'elena',   // Dr. Elena Martinez - Academic Historian
  'maya',    // Maya Chen - Passionate Enthusiast
  'river',   // River Stone - Poetic Storyteller
  'sarah',   // Sarah Johnson - Practical Parent
  'alex',    // Alex Rivera - Pop Culture Guru
  'kwame',   // Dr. Kwame Osei - Cultural Anthropologist
  'jamie',   // Jamie Park - Data Nerd
  'charlie', // Charlie Brooks - Witty Comedian
  'luna',    // Luna Nightingale - Spiritual Guide
  'james'    // Professor James Whitfield - Literary Critic
];

console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('✍️  V11 WRITERS COLLECTIVE - DEMO BATCH');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
console.log('📊 Processing 10 names with 10 different writers\n');

// Shuffle writers to ensure variety
const shuffledWriters = [...WRITERS].sort(() => Math.random() - 0.5);

// Assign one writer to each name
const assignments = NAMES_TO_ENRICH.map((name, i) => ({
  name,
  writer: shuffledWriters[i]
}));

console.log('🎭 Writer Assignments:\n');
assignments.forEach((a, i) => {
  console.log(`  ${i + 1}. ${a.name} → ${a.writer}`);
});
console.log('');

const results = { success: [], failed: [] };
const startTime = Date.now();

async function enrichName(assignment, index) {
  return new Promise((resolve) => {
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    console.log(`🔄 [${index + 1}/10] ${assignment.name} (writer: ${assignment.writer})`);
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);

    const nameStartTime = Date.now();

    const child = spawn('node', [
      'scripts/enrich-v11-writers.js',
      assignment.name,
      assignment.writer
    ], {
      env: {
        ...process.env,
        OPENAI_API_KEY: process.env.OPENAI_API_KEY
      }
    });

    let output = '';

    child.stdout.on('data', (data) => {
      const text = data.toString();
      output += text;
      process.stdout.write(text);
    });

    child.stderr.on('data', (data) => {
      process.stderr.write(data.toString());
    });

    child.on('close', (code) => {
      const duration = ((Date.now() - nameStartTime) / 1000).toFixed(1);

      if (code === 0) {
        console.log(`\n✅ Success! (${duration}s)\n`);
        results.success.push({ ...assignment, duration });
      } else {
        console.log(`\n❌ Failed! (${duration}s)\n`);
        results.failed.push({ ...assignment, duration });
      }

      // 2 second delay between names
      setTimeout(() => resolve(), 2000);
    });
  });
}

async function processAll() {
  for (let i = 0; i < assignments.length; i++) {
    await enrichName(assignments[i], i);
  }

  // Final summary
  const totalTime = ((Date.now() - startTime) / 60000).toFixed(1);

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('✨ V11 WRITERS DEMO COMPLETE!');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  console.log('📊 Summary:');
  console.log(`   Names Processed: ${assignments.length}`);
  console.log(`   Successful: ${results.success.length}`);
  console.log(`   Failed: ${results.failed.length}`);
  console.log(`   Total Time: ${totalTime} minutes\n`);

  if (results.success.length > 0) {
    console.log('✅ Successfully enriched:\n');
    results.success.forEach(r => {
      console.log(`   • ${r.name} by ${r.writer} (${r.duration}s)`);
    });
    console.log('');
  }

  console.log('🎯 Next step: Generate HTML and compare the different voices!\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}

processAll().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
