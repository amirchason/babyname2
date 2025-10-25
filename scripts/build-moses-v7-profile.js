import fs from 'fs';
import pkg from './profile-templates/profiletemp5.js';
const { generateNameProfile } = pkg;

// Copy the enhancement functions from build-thomas-v7-profile.js
import { readFileSync } from 'fs';
const buildScript = readFileSync('./scripts/build-thomas-v7-profile.js', 'utf-8');

// Use Thomas builder but for Moses
const v7Data = JSON.parse(fs.readFileSync('./public/data/enriched/moses-v7.json', 'utf-8'));
const baseHTML = generateNameProfile(v7Data);

// Import enhancement function by evaluating it
const enhanceMatch = buildScript.match(/function enhanceProfileWithV7Features[\s\S]*?^}/m);
if (!enhanceMatch) {
  console.error('Could not extract enhancement function');
  process.exit(1);
}
eval(enhanceMatch[0]);

const translationsMatch = buildScript.match(/function generateTranslationsSection[\s\S]*?^}/m);
if (translationsMatch) eval(translationsMatch[0]);

const enhancedHTML = enhanceProfileWithV7Features(baseHTML, v7Data);
fs.writeFileSync('./public/moses-v7-profile.html', enhancedHTML);
console.log('✅ Moses V7 Profile Complete: public/moses-v7-profile.html');
