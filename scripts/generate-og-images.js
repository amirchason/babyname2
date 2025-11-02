#!/usr/bin/env node

/**
 * Generate OG Images for Top 10 Names
 *
 * Creates beautiful maximalist flowery watercolor-themed SVG images
 * for Open Graph social sharing (800×600px)
 */

const fs = require('fs');
const path = require('path');

// Read enriched data
const enrichedDir = path.join(__dirname, '../public/data/enriched');
const outputDir = path.join(__dirname, '../public/og-images');

// Create output directory
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Flower SVG paths for maximalist design
const flowerPaths = [
  // Cherry blossom
  '<path d="M50,30 Q45,25 40,30 Q35,35 40,40 Q45,45 50,40 Q55,35 50,30 Z" fill="#FFB3D9" opacity="0.7"/>',
  // Rose
  '<path d="M70,50 Q65,45 60,50 Q55,55 60,60 Q65,65 70,60 Q75,55 70,50 Z" fill="#FF9EC9" opacity="0.6"/>',
  // Daisy petals
  '<circle cx="30" cy="70" r="8" fill="#FFFFFF" opacity="0.8"/>',
  '<circle cx="90" cy="80" r="10" fill="#F5E6FF" opacity="0.7"/>'
];

/**
 * Generate SVG watercolor background with flowers
 */
function generateOGImage(name, meaning, origin) {
  const nameCapitalized = name.charAt(0).toUpperCase() + name.slice(1);

  // Generate random flower positions for maximalist look
  const flowers = [];
  for (let i = 0; i < 20; i++) {
    const x = Math.random() * 800;
    const y = Math.random() * 600;
    const size = 10 + Math.random() * 30;
    const color = ['#FFB3D9', '#D8B2F2', '#B3D9FF', '#FFD9B3', '#C9FFB3'][Math.floor(Math.random() * 5)];
    const opacity = 0.3 + Math.random() * 0.4;

    flowers.push(`<circle cx="${x}" cy="${y}" r="${size}" fill="${color}" opacity="${opacity}"/>`);
  }

  // Watercolor blobs background
  const watercolorBlobs = `
    <defs>
      <filter id="watercolor">
        <feTurbulence type="fractalNoise" baseFrequency="0.01" numOctaves="5" result="turbulence"/>
        <feDisplacementMap in="SourceGraphic" in2="turbulence" scale="30" xChannelSelector="R" yChannelSelector="G"/>
        <feGaussianBlur stdDeviation="8"/>
      </filter>
    </defs>

    <!-- Watercolor background blobs -->
    <ellipse cx="200" cy="150" rx="250" ry="200" fill="#FFE6F0" filter="url(#watercolor)" opacity="0.6"/>
    <ellipse cx="600" cy="400" rx="280" ry="220" fill="#E6DBFF" filter="url(#watercolor)" opacity="0.5"/>
    <ellipse cx="400" cy="300" rx="300" ry="250" fill="#E6F7FF" filter="url(#watercolor)" opacity="0.5"/>
    <ellipse cx="150" cy="450" rx="200" ry="180" fill="#FFF4E6" filter="url(#watercolor)" opacity="0.4"/>
  `;

  const svg = `
<svg width="800" height="600" xmlns="http://www.w3.org/2000/svg">
  <!-- Background -->
  <rect width="800" height="600" fill="#FFF9FC"/>

  ${watercolorBlobs}

  <!-- Flowers (maximalist) -->
  ${flowers.join('\n  ')}

  <!-- More decorative flowers -->
  <circle cx="100" cy="100" r="40" fill="#FFB3D9" opacity="0.3"/>
  <circle cx="110" cy="95" r="30" fill="#FF9EC9" opacity="0.4"/>
  <circle cx="90" cy="105" r="25" fill="#FFC9E3" opacity="0.5"/>

  <circle cx="700" cy="500" r="50" fill="#D8B2F2" opacity="0.3"/>
  <circle cx="710" cy="490" r="35" fill="#C9A3E8" opacity="0.4"/>
  <circle cx="690" cy="510" r="30" fill="#E6D7FA" opacity="0.5"/>

  <circle cx="650" cy="150" r="45" fill="#B3D9FF" opacity="0.3"/>
  <circle cx="660" cy="140" r="32" fill="#A3CEFF" opacity="0.4"/>

  <!-- Content container with white overlay for readability -->
  <rect x="100" y="200" width="600" height="250" rx="20" fill="white" opacity="0.85"/>

  <!-- Name (large, elegant) -->
  <text x="400" y="310" font-family="Georgia, serif" font-size="90" font-weight="bold" fill="#7C3E94" text-anchor="middle">${nameCapitalized}</text>

  <!-- Meaning -->
  <text x="400" y="370" font-family="Arial, sans-serif" font-size="32" fill="#555" text-anchor="middle">${meaning}</text>

  <!-- Origin -->
  <text x="400" y="410" font-family="Arial, sans-serif" font-size="24" fill="#888" text-anchor="middle">${origin} Origin</text>

  <!-- SoulSeed Badge -->
  <circle cx="750" cy="550" r="35" fill="#D8B2F2" opacity="0.9"/>
  <text x="750" y="558" font-family="Arial, sans-serif" font-size="14" font-weight="bold" fill="white" text-anchor="middle">Soul</text>
  <text x="750" y="572" font-family="Arial, sans-serif" font-size="10" fill="white" text-anchor="middle">Seed</text>

  <!-- Decorative corner elements -->
  <path d="M0,0 Q50,0 50,50" fill="none" stroke="#D8B2F2" stroke-width="3" opacity="0.4"/>
  <path d="M800,600 Q750,600 750,550" fill="none" stroke="#FFB3D9" stroke-width="3" opacity="0.4"/>
</svg>
  `.trim();

  return svg;
}

console.log('🎨 GENERATING OG IMAGES');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
console.log('Style: Maximalist flowery watercolor baby theme');
console.log('Size: 800×600px (optimal for social media)\n');

// Get all enriched files
const files = fs.readdirSync(enrichedDir).filter(f => f.endsWith('-v10.json'));

let generated = 0;
let errors = 0;

files.forEach((file, index) => {
  try {
    const data = JSON.parse(fs.readFileSync(path.join(enrichedDir, file), 'utf8'));
    const nameLower = file.replace('-v10.json', '');

    const svg = generateOGImage(
      data.name || nameLower,
      data.meaning || 'A beautiful name',
      data.origin || 'Unknown'
    );

    const outputPath = path.join(outputDir, `${nameLower}.svg`);
    fs.writeFileSync(outputPath, svg);

    console.log(`✅ [${index + 1}/${files.length}] Generated: ${nameLower}.svg`);
    generated++;
  } catch (error) {
    console.error(`❌ [${index + 1}/${files.length}] Failed: ${file} - ${error.message}`);
    errors++;
  }
});

console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('✨ OG IMAGE GENERATION COMPLETE!');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
console.log(`📊 Summary:`);
console.log(`   Generated: ${generated}`);
console.log(`   Errors: ${errors}`);
console.log(`   Output: ${outputDir}\n`);

console.log('📝 Next step: Generate SEO profiles');
console.log('   node scripts/generate-seo-profiles.js');
