#!/usr/bin/env node

/**
 * Process Origins Script
 * Adds origins to all 224k+ names in the database
 * Run with: node processOrigins.js
 */

const fs = require('fs');
const path = require('path');
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Top 10 Origins
const TOP_10_ORIGINS = [
  'Hebrew',    // Biblical names
  'Greek',     // Classical names
  'Latin',     // Roman names
  'Germanic',  // German/English
  'Arabic',    // Islamic names
  'English',   // Anglo-Saxon
  'French',    // French names
  'Spanish',   // Hispanic names
  'Celtic',    // Irish/Scottish
  'Italian'    // Italian names
];

// Get API key from environment
const apiKey = 'AIzaSyALzy3qXMyXPtLl7pUuCDo_eE5X89u3dpA'; // Your Gemini API key
const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

// Configuration
const BATCH_SIZE = 50; // Process 50 names at a time
const DELAY_MS = 2000; // 2 second delay between API calls
const PROGRESS_FILE = 'origin_progress.json';

// Pattern-based origin detection
function detectOriginByPattern(name) {
  const nameLower = name.toLowerCase();

  // Hebrew patterns
  if (/^(david|sarah|michael|daniel|rachel|samuel|ruth|hannah|jonathan|benjamin|elizabeth|jacob|joseph|mary|martha|miriam|nathaniel|rebecca|solomon|isaac|abraham|noah|adam|eve|leah|esther|joshua|caleb|elijah|ezra)$/i.test(name)) {
    return 'Hebrew';
  }

  // Arabic patterns
  if (/^(muhammad|mohammed|ahmed|ali|omar|hassan|hussein|fatima|aisha|khalid|abdullah|ibrahim|yusuf|mustafa|hamza|zahra|zainab|layla|salma|tariq)$/i.test(name) ||
      nameLower.startsWith('abdul') || nameLower.includes('allah')) {
    return 'Arabic';
  }

  // Greek patterns
  if (/^(alexander|sophia|nicholas|helen|george|theodore|peter|andrew|philip|stephen|christina|catherine|athena|diana|demetrius|penelope|aphrodite|apollo|zeus)$/i.test(name) ||
      name.endsWith('os') || name.endsWith('eus')) {
    return 'Greek';
  }

  // Latin patterns
  if (/^(marcus|julius|claudius|victoria|julia|felix|lucia|gloria|beatrice|caesar|augustus|maximus|valentina|aurora|luna|stella|clara|adrian)$/i.test(name) ||
      (name.endsWith('us') && name.length > 4) || (name.endsWith('ia') && name.length > 4)) {
    return 'Latin';
  }

  // Spanish patterns
  if (/^(carlos|maria|jose|juan|miguel|antonio|francisco|manuel|pedro|diego|luis|javier|roberto|fernando|isabel|carmen|rosa|elena|lucia)$/i.test(name) ||
      name.endsWith('ez') || name.endsWith('ito') || name.endsWith('ita')) {
    return 'Spanish';
  }

  // Italian patterns
  if (/^(giovanni|marco|francesco|giuseppe|antonio|roberto|stefano|isabella|lucia|francesca|giulia|chiara|alessandra|valentina|lorenzo|matteo)$/i.test(name) ||
      name.endsWith('ino') || name.endsWith('ina')) {
    return 'Italian';
  }

  // French patterns
  if (/^(pierre|jean|jacques|louis|francois|henri|michel|marie|charlotte|sophie|claire|amelie|camille|julie|antoine|laurent|nicolas)$/i.test(name) ||
      name.endsWith('ette') || name.endsWith('elle')) {
    return 'French';
  }

  // Celtic patterns
  if (/^(liam|sean|patrick|brian|kevin|ryan|connor|dylan|aidan|bridget|siobhan|fiona|maeve|aisling|niamh|colin|declan|kieran)$/i.test(name) ||
      nameLower.startsWith('mac') || nameLower.startsWith('mc') || nameLower.startsWith("o'")) {
    return 'Celtic';
  }

  // Germanic patterns
  if (/^(william|robert|richard|henry|albert|frederick|wilhelm|otto|emma|alice|matilda|gertrude|hildegard|brunhilde|siegfried|ludwig)$/i.test(name) ||
      name.endsWith('bert') || name.endsWith('wald') || name.endsWith('gard')) {
    return 'Germanic';
  }

  // English patterns (check last to avoid conflicts)
  if (/^(john|james|thomas|edward|george|charles|elizabeth|margaret|susan|jennifer|ashley|brandon|tyler|madison|taylor|jordan)$/i.test(name)) {
    return 'English';
  }

  return null;
}

// Process names with AI
async function processNamesWithAI(names) {
  const results = new Map();

  // First try pattern matching
  for (const name of names) {
    const patternOrigin = detectOriginByPattern(name);
    if (patternOrigin) {
      results.set(name, patternOrigin);
    }
  }

  // Get unprocessed names
  const unprocessedNames = names.filter(name => !results.has(name));

  if (unprocessedNames.length === 0) {
    return results;
  }

  // Process with AI
  try {
    const prompt = `Classify these names by their most likely origin. Use ONLY these 10 origins: ${TOP_10_ORIGINS.join(', ')}.

Names: ${unprocessedNames.join(', ')}

Return ONLY a JSON array like: [{"name": "John", "origin": "English"}, ...]
Each name MUST have exactly one origin from the list above.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Extract JSON
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      try {
        const parsed = JSON.parse(jsonMatch[0]);
        for (const item of parsed) {
          if (item.name && TOP_10_ORIGINS.includes(item.origin)) {
            results.set(item.name, item.origin);
          }
        }
      } catch (e) {
        console.error('Parse error:', e);
      }
    }
  } catch (error) {
    console.error('AI error:', error);
  }

  // Default remaining to English
  for (const name of unprocessedNames) {
    if (!results.has(name)) {
      results.set(name, 'English');
    }
  }

  return results;
}

// Process a chunk file
async function processChunk(chunkFile, progress) {
  console.log(`\nProcessing ${chunkFile}...`);

  const filePath = path.join('public', 'data', chunkFile);

  // Check if file exists
  if (!fs.existsSync(filePath)) {
    console.log(`Skipping ${chunkFile} - file not found`);
    return;
  }

  // Load chunk
  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  const names = data.names || [];

  console.log(`Found ${names.length} names in ${chunkFile}`);

  // Check if already processed
  if (progress.processedChunks.includes(chunkFile)) {
    console.log(`Already processed ${chunkFile}, skipping...`);
    return;
  }

  let processedCount = 0;
  let updatedCount = 0;

  // Process in batches
  for (let i = 0; i < names.length; i += BATCH_SIZE) {
    const batch = names.slice(i, Math.min(i + BATCH_SIZE, names.length));
    const nameStrings = batch.map(n => n.name || n);

    console.log(`Processing batch ${Math.floor(i/BATCH_SIZE) + 1}/${Math.ceil(names.length/BATCH_SIZE)} (${nameStrings.length} names)`);

    // Get origins
    const origins = await processNamesWithAI(nameStrings);

    // Update names with origins
    for (let j = 0; j < batch.length; j++) {
      const name = batch[j];
      const origin = origins.get(name.name || name);

      if (origin && (!name.origin || name.origin === 'Unknown')) {
        name.origin = origin;
        name.originProcessed = true;
        updatedCount++;
      }
    }

    processedCount += batch.length;

    // Save progress
    progress.lastChunk = chunkFile;
    progress.lastBatch = i;
    progress.totalProcessed += batch.length;
    fs.writeFileSync(PROGRESS_FILE, JSON.stringify(progress, null, 2));

    console.log(`Progress: ${processedCount}/${names.length} in current chunk, ${progress.totalProcessed} total`);

    // Rate limiting
    if (i + BATCH_SIZE < names.length) {
      await new Promise(resolve => setTimeout(resolve, DELAY_MS));
    }
  }

  // Save updated chunk
  const backupPath = filePath.replace('.json', `_backup_${Date.now()}.json`);
  fs.copyFileSync(filePath, backupPath);
  console.log(`Backup saved to ${backupPath}`);

  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  console.log(`Updated ${chunkFile} - Added origins to ${updatedCount} names`);

  // Mark chunk as processed
  progress.processedChunks.push(chunkFile);
  fs.writeFileSync(PROGRESS_FILE, JSON.stringify(progress, null, 2));
}

// Main function
async function main() {
  console.log('='.repeat(60));
  console.log('Origin Processing Script');
  console.log('Processing all names with top 10 origins');
  console.log('='.repeat(60));

  // Load or create progress
  let progress = {
    processedChunks: [],
    lastChunk: null,
    lastBatch: 0,
    totalProcessed: 0,
    startTime: new Date().toISOString()
  };

  if (fs.existsSync(PROGRESS_FILE)) {
    progress = JSON.parse(fs.readFileSync(PROGRESS_FILE, 'utf8'));
    console.log('Resuming from previous progress...');
    console.log(`Already processed: ${progress.processedChunks.join(', ')}`);
  }

  // Process each chunk
  const chunks = [
    'names-core.json',     // 945 names
    'names-chunk1.json',   // 29k names
    'names-chunk2.json',   // ~40k names
    'names-chunk3.json',   // ~60k names
    'names-chunk4.json'    // ~95k names
  ];

  for (const chunk of chunks) {
    try {
      await processChunk(chunk, progress);
    } catch (error) {
      console.error(`Error processing ${chunk}:`, error);
      // Continue with next chunk
    }
  }

  // Final summary
  console.log('\n' + '='.repeat(60));
  console.log('PROCESSING COMPLETE');
  console.log(`Total names processed: ${progress.totalProcessed}`);
  console.log(`Chunks processed: ${progress.processedChunks.join(', ')}`);
  console.log('='.repeat(60));
}

// Run the script
main().catch(console.error);