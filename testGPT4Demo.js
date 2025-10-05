#!/usr/bin/env node

/**
 * GPT-4 Processing Demo Script
 * Demonstrates how the GPT-4 processing will work with sample data
 * This is a demo version that doesn't require an API key
 */

const fs = require('fs');
const path = require('path');

// Sample GPT-4-style responses for demonstration
const sampleGPT4Data = {
  "Liam": {
    "origins": ["Irish", "Germanic"],
    "originsDetails": {
      "primary": "Irish",
      "secondary": "Germanic",
      "tertiary": null,
      "percentages": [80, 20]
    },
    "meaningShort": "strong-willed warrior",
    "meanings": [
      "Irish name meaning resolute protector and strong-willed warrior",
      "Short form of William meaning determined guardian"
    ],
    "etymology": "From Irish name Uilliam, derived from Germanic Wilhelm"
  },
  "Olivia": {
    "origins": ["Latin"],
    "originsDetails": {
      "primary": "Latin",
      "secondary": null,
      "tertiary": null,
      "percentages": null
    },
    "meaningShort": "olive tree",
    "meanings": [
      "Latin name meaning olive tree, symbol of peace and wisdom"
    ],
    "etymology": "From Latin oliva, popularized by Shakespeare in Twelfth Night"
  },
  "Noah": {
    "origins": ["Hebrew"],
    "originsDetails": {
      "primary": "Hebrew",
      "secondary": null,
      "tertiary": null,
      "percentages": null
    },
    "meaningShort": "rest, comfort",
    "meanings": [
      "Hebrew name meaning rest, repose, or comfort"
    ],
    "etymology": "From Hebrew Noach, biblical patriarch who built the ark"
  },
  "Emma": {
    "origins": ["Germanic"],
    "originsDetails": {
      "primary": "Germanic",
      "secondary": null,
      "tertiary": null,
      "percentages": null
    },
    "meaningShort": "whole, universal",
    "meanings": [
      "Germanic name meaning whole, universal, or complete"
    ],
    "etymology": "From Germanic ermen meaning whole or universal"
  },
  "Charlotte": {
    "origins": ["French", "Germanic"],
    "originsDetails": {
      "primary": "French",
      "secondary": "Germanic",
      "tertiary": null,
      "percentages": [60, 40]
    },
    "meaningShort": "free woman",
    "meanings": [
      "French feminine form of Charles meaning free woman",
      "Petite and feminine version meaning little and womanly"
    ],
    "etymology": "French diminutive of Charles, from Germanic Karl meaning free man"
  }
};

/**
 * Update name entry with demo data
 */
function updateNameEntry(name, demoData) {
  if (!demoData) return name;

  // Update origins
  if (demoData.origins && demoData.origins.length > 0) {
    name.origins = demoData.origins;
    name.origin = demoData.origins[0];

    if (demoData.originsDetails) {
      name.originsDetails = demoData.originsDetails;
    }
  }

  // Update meanings
  if (demoData.meaningShort) {
    name.meaningShort = demoData.meaningShort;
  }

  if (demoData.meanings && demoData.meanings.length > 0) {
    name.meanings = demoData.meanings;
    name.meaningFull = demoData.meanings[0];
    name.meaning = demoData.meaningShort;
  }

  if (demoData.etymology) {
    name.meaningEtymology = demoData.etymology;
  }

  // Set processing metadata
  name.originProcessed = true;
  name.originProcessedAt = new Date().toISOString();
  name.originSource = 'gpt-4-turbo-demo';
  name.meaningProcessed = true;
  name.meaningProcessedAt = new Date().toISOString();
  name.meaningSource = 'gpt-4-turbo-demo';

  return name;
}

/**
 * Process demo batch
 */
async function processDemoBatch() {
  console.log('\n============================================================');
  console.log('GPT-4 NAME PROCESSING DEMO');
  console.log('This demonstrates how the processing will work');
  console.log('============================================================\n');

  const filePath = path.join('public', 'data', 'names-core.json');

  if (!fs.existsSync(filePath)) {
    console.error('Error: names-core.json not found');
    return;
  }

  // Load data
  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  const names = data.names || [];

  console.log(`Loaded ${names.length} names from names-core.json`);
  console.log('\nProcessing first 5 names as demonstration...\n');

  let processedCount = 0;
  const demoNames = Object.keys(sampleGPT4Data);

  // Process demo names
  for (const nameStr of demoNames) {
    const nameEntry = names.find(n => n.name === nameStr);

    if (nameEntry) {
      const demoData = sampleGPT4Data[nameStr];
      updateNameEntry(nameEntry, demoData);
      processedCount++;

      console.log(`✓ ${nameStr}:`);
      console.log(`  Meaning: "${nameEntry.meaningShort}"`);
      console.log(`  Origins: ${nameEntry.origins.join(', ')}`);
      console.log(`  Meanings count: ${nameEntry.meanings.length}`);

      if (nameEntry.meanings.length > 1) {
        console.log(`  → Multiple meanings detected (${nameEntry.meanings.length} total)`);
      }
    }
  }

  // Save updated data
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));

  console.log('\n============================================================');
  console.log('DEMO PROCESSING COMPLETE');
  console.log(`Processed ${processedCount} names with GPT-4 style data`);
  console.log('\nNote: This is demo data. To process all names:');
  console.log('1. Add your OpenAI API key to .env file:');
  console.log('   OPENAI_API_KEY=sk-your-actual-api-key');
  console.log('2. Run: node processNamesWithGPT4.js');
  console.log('============================================================\n');

  // Show example of processed data
  console.log('\nExample of processed name (Charlotte):');
  const charlotte = names.find(n => n.name === 'Charlotte');
  if (charlotte) {
    console.log(JSON.stringify({
      name: charlotte.name,
      origins: charlotte.origins,
      meaningShort: charlotte.meaningShort,
      meanings: charlotte.meanings,
      etymology: charlotte.meaningEtymology
    }, null, 2));
  }
}

// Run demo
processDemoBatch().catch(error => {
  console.error('Error:', error);
  process.exit(1);
});