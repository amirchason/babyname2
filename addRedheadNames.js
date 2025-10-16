/**
 * Add Redhead Baby Names to Database
 * Adds names from the redhead blog post to names-chunk1.json
 */

const fs = require('fs');
const path = require('path');

// Names to add with their redhead-related meanings
const redheadNames = [
  {
    name: "Scarlett",
    gender: { Female: 0.95, Male: 0.05 },
    origins: ["English"],
    origin: "English",
    meaning: "Scarlet, a vivid shade of red. Symbolizes passion, energy, and boldness.",
    blogEnrichment: {
      blogId: 11,
      blogSlug: "red-hair-redhead-baby-names",
      featured: true,
      context: "A name that exudes southern charm, Scarlett is synonymous with a bright and bold shade of red. Inspired by the classic color that signifies passion and energy."
    }
  },
  {
    name: "Ruby",
    gender: { Female: 0.98, Male: 0.02 },
    origins: ["Latin"],
    origin: "Latin",
    meaning: "Deep red precious gemstone. Symbolizes love, passion, and vitality.",
    blogEnrichment: {
      blogId: 11,
      blogSlug: "red-hair-redhead-baby-names",
      featured: true,
      context: "Like the precious gemstone that shimmers in deep red hues, Ruby is a name that radiates elegance and beauty."
    }
  },
  {
    name: "Sienna",
    gender: { Female: 0.97, Male: 0.03 },
    origins: ["Italian"],
    origin: "Italian",
    meaning: "Orange-red, named after the Italian city. Represents warmth and natural beauty.",
    blogEnrichment: {
      blogId: 11,
      blogSlug: "red-hair-redhead-baby-names",
      featured: true,
      context: "Named after the rich, earthy red-orange shade, Sienna brings to mind the warmth of a Tuscan sunset."
    }
  },
  {
    name: "Poppy",
    gender: { Female: 0.99, Male: 0.01 },
    origins: ["English"],
    origin: "English",
    meaning: "Vibrant red flower symbolizing remembrance and beauty.",
    blogEnrichment: {
      blogId: 11,
      blogSlug: "red-hair-redhead-baby-names",
      featured: true,
      context: "As vibrant as the flower it represents, Poppy is a playful and lively name perfect for a girl with a spirited personality."
    }
  },
  {
    name: "Rose",
    gender: { Female: 0.99, Male: 0.01 },
    origins: ["Latin"],
    origin: "Latin",
    meaning: "Classic red flower symbolizing love, grace, and elegance.",
    blogEnrichment: {
      blogId: 11,
      blogSlug: "red-hair-redhead-baby-names",
      featured: true,
      context: "Derived from the Latin word 'rosa,' Rose is a timeless name that symbolizes love and grace. This classic choice carries the elegance of a blooming red rose."
    }
  },
  {
    name: "Rowan",
    gender: { Female: 0.45, Male: 0.55 },
    origins: ["Irish", "Gaelic"],
    origin: "Irish",
    meaning: "Little redhead. A unisex name full of youthful energy and charm.",
    blogEnrichment: {
      blogId: 11,
      blogSlug: "red-hair-redhead-baby-names",
      featured: true,
      context: "Meaning 'little redhead,' Rowan is a name full of youthful energy and charm. It carries a sense of adventure and is versatile as a unisex name."
    }
  },
  {
    name: "Jasper",
    gender: { Female: 0.02, Male: 0.98 },
    origins: ["Persian"],
    origin: "Persian",
    meaning: "Bringer of treasure; also a reddish-brown gemstone.",
    blogEnrichment: {
      blogId: 11,
      blogSlug: "red-hair-redhead-baby-names",
      featured: true,
      context: "Often associated with a bringer of treasure, Jasper is a name that shines with richness and mystique. Its deep red associations make it a unique choice."
    }
  },
  {
    name: "Rory",
    gender: { Female: 0.30, Male: 0.70 },
    origins: ["Irish", "Gaelic"],
    origin: "Irish",
    meaning: "Red king. A regal name suggesting leadership and strength.",
    blogEnrichment: {
      blogId: 11,
      blogSlug: "red-hair-redhead-baby-names",
      featured: true,
      context: "Meaning 'red king,' Rory is a regal and noble choice. It's a name that suggests leadership and strength."
    }
  },
  {
    name: "Flynn",
    gender: { Female: 0.05, Male: 0.95 },
    origins: ["Irish"],
    origin: "Irish",
    meaning: "Descendant of the red-haired one. Spirited and dynamic.",
    blogEnrichment: {
      blogId: 11,
      blogSlug: "red-hair-redhead-baby-names",
      featured: true,
      context: "With its origins pointing to a 'descendant of the red-haired one,' Flynn is a spirited and dynamic name carrying a sense of heritage and pride."
    }
  },
  {
    name: "Aiden",
    gender: { Female: 0.02, Male: 0.98 },
    origins: ["Irish", "Gaelic"],
    origin: "Irish",
    meaning: "Little and fiery. Brimming with energy and passion.",
    blogEnrichment: {
      blogId: 11,
      blogSlug: "red-hair-redhead-baby-names",
      featured: true,
      context: "Meaning 'little and fiery,' Aiden is a name brimming with energy and passion. It's a strong choice for a boy sure to light up any room."
    }
  },
  {
    name: "Adam",
    gender: { Female: 0.01, Male: 0.99 },
    origins: ["Hebrew"],
    origin: "Hebrew",
    meaning: "Son of the red earth. Grounding and timeless with biblical roots.",
    blogEnrichment: {
      blogId: 11,
      blogSlug: "red-hair-redhead-baby-names",
      featured: true,
      context: "Often interpreted as 'son of the red earth,' Adam is a grounding and timeless name. Its biblical roots offer a sense of tradition and depth."
    }
  },
  {
    name: "Reid",
    gender: { Female: 0.10, Male: 0.90 },
    origins: ["Scottish"],
    origin: "Scottish",
    meaning: "Red-haired. Simple, striking, and sophisticated.",
    blogEnrichment: {
      blogId: 11,
      blogSlug: "red-hair-redhead-baby-names",
      featured: true,
      context: "Simple yet striking, Reid means 'red-haired.' It's a straightforward name that carries a touch of sophistication."
    }
  },
  {
    name: "Phoenix",
    gender: { Female: 0.40, Male: 0.60 },
    origins: ["Greek"],
    origin: "Greek",
    meaning: "Mythical bird reborn from fiery ashes. Symbolizes rebirth and immortality.",
    blogEnrichment: {
      blogId: 11,
      blogSlug: "red-hair-redhead-baby-names",
      featured: true,
      context: "This name symbolizes rebirth and immortality, akin to the mythical bird reborn from its ashes. It's a bold choice for a child with a vibrant future."
    }
  }
];

// Load names-chunk1.json
const chunk1Path = path.join(__dirname, 'public', 'data', 'names-chunk1.json');
console.log('Loading names-chunk1.json...');
let namesData = JSON.parse(fs.readFileSync(chunk1Path, 'utf8'));

console.log(`Current database has ${namesData.length} names`);

// Track added/updated names
let addedCount = 0;
let updatedCount = 0;

// Process each redhead name
redheadNames.forEach(nameData => {
  const existingIndex = namesData.findIndex(n => n.name.toLowerCase() === nameData.name.toLowerCase());

  if (existingIndex !== -1) {
    // Name exists - enrich it
    const existing = namesData[existingIndex];

    // Add blog enrichment
    if (!existing.blogEnrichment) {
      existing.blogEnrichment = nameData.blogEnrichment;
    } else if (!existing.blogEnrichment.some(b => b.blogId === 11)) {
      if (Array.isArray(existing.blogEnrichment)) {
        existing.blogEnrichment.push(nameData.blogEnrichment);
      } else {
        existing.blogEnrichment = [existing.blogEnrichment, nameData.blogEnrichment];
      }
    }

    // Update meaning if it doesn't have one or enhance it
    if (!existing.meaning || existing.meaning === 'Unknown') {
      existing.meaning = nameData.meaning;
    } else if (!existing.meaning.toLowerCase().includes('red')) {
      existing.meaning = `${existing.meaning} Also associated with: ${nameData.meaning}`;
    }

    // Update origin if needed
    if (!existing.origins || existing.origins.length === 0 || existing.origins[0] === 'Unknown') {
      existing.origins = nameData.origins;
      existing.origin = nameData.origin;
    }

    namesData[existingIndex] = existing;
    updatedCount++;
    console.log(`✓ Updated: ${nameData.name}`);
  } else {
    // Name doesn't exist - add it
    const newName = {
      name: nameData.name,
      originalName: nameData.name,
      type: "first",
      gender: nameData.gender,
      countries: {},
      globalCountries: {},
      primaryCountry: "",
      appearances: 1,
      popularityRank: 50000 + addedCount, // Assign temporary rank
      globalFrequency: 1,
      popularityScore: 900000 + addedCount,
      globalPopularityScore: 900000 + addedCount,
      rankingSource: "blog_enrichment",
      rankingUpdated: new Date().toISOString(),
      origins: nameData.origins,
      origin: nameData.origin,
      originsDetails: {
        primary: nameData.origin,
        all: nameData.origins
      },
      meaning: nameData.meaning,
      blogEnrichment: nameData.blogEnrichment
    };

    namesData.push(newName);
    addedCount++;
    console.log(`+ Added: ${nameData.name}`);
  }
});

// Save updated database
console.log('\nSaving updated database...');
fs.writeFileSync(chunk1Path, JSON.stringify(namesData, null, 2));

console.log(`\n✅ Complete!`);
console.log(`   Added: ${addedCount} new names`);
console.log(`   Updated: ${updatedCount} existing names`);
console.log(`   Total names in database: ${namesData.length}`);
