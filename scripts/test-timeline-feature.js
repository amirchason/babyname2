/**
 * Test Script for Historical Timeline Visualization (Feature #1)
 *
 * Tests the timeline feature added to profiletemp3.js
 * Generates a test HTML page using Thomas's enriched data
 */

const fs = require('fs');
const path = require('path');

// Import the template
const { generateNameProfile } = require('./profile-templates/profiletemp3.js');

// Load Thomas's enriched data
const thomasDataPath = path.join(__dirname, '../public/data/enriched/thomas-v4.json');
const thomasData = JSON.parse(fs.readFileSync(thomasDataPath, 'utf-8'));

console.log('🔍 Testing Historical Timeline Visualization...');
console.log('');
console.log('📊 Name:', thomasData.name);
console.log('📊 Historical Figures Count:', thomasData.historicFigures.length);
console.log('');

// Check if figures have years
const figuresWithYears = thomasData.historicFigures.filter(f => {
  const yearMatch = f.years.match(/(\d{4})/);
  return yearMatch && parseInt(yearMatch[1]) > 0;
});

console.log('✅ Figures with parseable years:', figuresWithYears.length);
console.log('');

if (figuresWithYears.length > 0) {
  console.log('📅 Timeline range:');
  const years = figuresWithYears.map(f => {
    const yearMatch = f.years.match(/(\d{4})/);
    return parseInt(yearMatch[1]);
  }).sort((a, b) => a - b);

  console.log(`   Earliest: ${years[0]}`);
  console.log(`   Latest: ${years[years.length - 1]}`);
  console.log(`   Span: ${years[years.length - 1] - years[0]} years`);
  console.log('');

  console.log('🎨 Categories in timeline:');
  const categories = [...new Set(figuresWithYears.map(f => f.category))];
  categories.forEach(cat => {
    const count = figuresWithYears.filter(f => f.category === cat).length;
    console.log(`   - ${cat}: ${count} figure(s)`);
  });
  console.log('');
}

// Generate the profile
console.log('🔨 Generating profile with timeline...');
const html = generateNameProfile(thomasData, { theme: 'auto' });

// Save to public directory
const outputPath = path.join(__dirname, '../public/thomas-timeline-test.html');
fs.writeFileSync(outputPath, html, 'utf-8');

console.log('');
console.log('✅ SUCCESS! Timeline test page generated!');
console.log('');
console.log('📍 File location:', outputPath);
console.log('🌐 View at: http://localhost:3000/thomas-timeline-test.html');
console.log('');
console.log('🔍 What to verify:');
console.log('   1. Section 17 appears with "Historical Timeline" title');
console.log('   2. Timeline shows horizontal bar with gradient colors (#D8B2F2, #FFB3D9, #B3D9FF)');
console.log('   3. Dots appear on timeline with color coding by category:');
console.log('      - Leaders: #FFB3D9 (pink)');
console.log('      - Philosophers: #D8B2F2 (lavender)');
console.log('      - Scientists: #B3D9FF (blue)');
console.log('   4. Hover over dots shows card with name, years, achievement');
console.log('   5. Timeline labels show min/max years');
console.log('   6. Legend shows category color codes');
console.log('   7. Section is EXPANDED by default (chevron rotated)');
console.log('   8. Accordion toggle works (click title to collapse/expand)');
console.log('');
