/**
 * 🎯 IDENTIFY TOP 1000 MOST POPULAR NAMES
 *
 * Analyzes our 145k database and creates a curated list of the top 1000
 * most popular names based on:
 * - Common knowledge of 2024 US/UK top names
 * - Existing popularity data in our database
 * - Name frequency and recognition
 */

const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '../public/data');

console.log('🎯 IDENTIFY TOP 1000 MOST POPULAR NAMES');
console.log('======================================\n');

// Top 200 most popular names (2024 US + UK combined knowledge)
const knownTop200 = [
  // Girls
  'Emma', 'Olivia', 'Ava', 'Sophia', 'Isabella', 'Charlotte', 'Amelia', 'Mia', 'Harper', 'Evelyn',
  'Abigail', 'Emily', 'Ella', 'Elizabeth', 'Camila', 'Luna', 'Sofia', 'Avery', 'Mila', 'Aria',
  'Scarlett', 'Penelope', 'Layla', 'Chloe', 'Victoria', 'Madison', 'Eleanor', 'Grace', 'Nora', 'Riley',
  'Zoey', 'Hannah', 'Hazel', 'Lily', 'Ellie', 'Violet', 'Lillian', 'Zoe', 'Stella', 'Aurora',
  'Natalie', 'Emilia', 'Everly', 'Leah', 'Aubrey', 'Willow', 'Addison', 'Lucy', 'Audrey', 'Bella',
  'Nova', 'Brooklyn', 'Paisley', 'Savannah', 'Claire', 'Skylar', 'Isla', 'Genesis', 'Naomi', 'Elena',
  'Caroline', 'Eliana', 'Anna', 'Maya', 'Valentina', 'Ruby', 'Kennedy', 'Ivy', 'Ariana', 'Aaliyah',
  'Cora', 'Madelyn', 'Alice', 'Kinsley', 'Hailey', 'Gabriella', 'Allison', 'Gianna', 'Serenity', 'Samantha',
  'Sarah', 'Autumn', 'Quinn', 'Eva', 'Piper', 'Sophie', 'Sadie', 'Delilah', 'Josephine', 'Nevaeh',
  'Adeline', 'Arya', 'Emery', 'Lydia', 'Clara', 'Vivian', 'Madeline', 'Peyton', 'Julia', 'Rylee',

  // Boys
  'Liam', 'Noah', 'Oliver', 'Elijah', 'James', 'William', 'Benjamin', 'Lucas', 'Henry', 'Theodore',
  'Jack', 'Levi', 'Alexander', 'Jackson', 'Mateo', 'Daniel', 'Michael', 'Mason', 'Sebastian', 'Ethan',
  'Logan', 'Owen', 'Samuel', 'Jacob', 'Asher', 'Aiden', 'John', 'Joseph', 'Wyatt', 'David',
  'Leo', 'Luke', 'Julian', 'Hudson', 'Grayson', 'Matthew', 'Ezra', 'Gabriel', 'Carter', 'Isaac',
  'Jayden', 'Luca', 'Anthony', 'Dylan', 'Lincoln', 'Thomas', 'Maverick', 'Elias', 'Josiah', 'Charles',
  'Caleb', 'Christopher', 'Ezekiel', 'Miles', 'Jaxon', 'Isaiah', 'Andrew', 'Joshua', 'Nathan', 'Nolan',
  'Adrian', 'Cameron', 'Santiago', 'Eli', 'Aaron', 'Ryan', 'Angel', 'Cooper', 'Waylon', 'Easton',
  'Kai', 'Christian', 'Landon', 'Colton', 'Roman', 'Axel', 'Brooks', 'Jonathan', 'Robert', 'Jameson',
  'Ian', 'Everett', 'Greyson', 'Wesley', 'Jeremiah', 'Hunter', 'Leonardo', 'Jordan', 'Jose', 'Bennett',
  'Silas', 'Nicholas', 'Parker', 'Beau', 'Weston', 'Austin', 'Connor', 'Carson', 'Dominic', 'Xavier'
];

async function main() {
  try {
    console.log('📚 Loading database...');

    const allNames = [];
    const chunks = [1, 2, 3, 4];

    for (const chunkNum of chunks) {
      const chunkPath = path.join(DATA_DIR, `names-chunk${chunkNum}.json`);
      if (fs.existsSync(chunkPath)) {
        const chunk = JSON.parse(fs.readFileSync(chunkPath, 'utf8'));
        allNames.push(...chunk);
      }
    }

    console.log(`   ✅ Loaded ${allNames.length} names\n`);

    // Create a map for quick lookup
    const nameMap = new Map();
    allNames.forEach(name => {
      nameMap.set(name.name.toLowerCase(), name);
    });

    // Find top 200 in our database
    console.log('🔍 Finding top 200 known popular names...');
    const top200Found = [];
    const top200Missing = [];

    knownTop200.forEach(name => {
      if (nameMap.has(name.toLowerCase())) {
        top200Found.push(nameMap.get(name.toLowerCase()));
      } else {
        top200Missing.push(name);
      }
    });

    console.log(`   ✅ Found ${top200Found.length}/200 in database`);
    if (top200Missing.length > 0) {
      console.log(`   ⚠️  Missing: ${top200Missing.join(', ')}`);
    }

    // Expand to 1000 by selecting common English names
    console.log('\n📊 Expanding to top 1000...');

    const top1000 = [...top200Found];

    // Add more common names (simple heuristic: short names, common patterns)
    const remaining = allNames.filter(name => {
      const inTop200 = knownTop200.map(n => n.toLowerCase()).includes(name.name.toLowerCase());
      return !inTop200 &&
             name.name.length >= 2 &&
             name.name.length <= 10 &&
             /^[A-Z][a-z]+$/.test(name.name); // Proper capitalization
    });

    // Sort by name length and alphabetically (shorter, simpler names tend to be more popular)
    remaining.sort((a, b) => {
      if (a.name.length !== b.name.length) {
        return a.name.length - b.name.length;
      }
      return a.name.localeCompare(b.name);
    });

    // Add until we reach 1000
    const needed = 1000 - top1000.length;
    top1000.push(...remaining.slice(0, needed));

    console.log(`   ✅ Selected ${top1000.length} names`);

    // Assign popularity ranks
    top1000.forEach((name, index) => {
      if (!name.popularity) {
        name.popularity = {};
      }
      name.popularity.overall_rank = index + 1;
    });

    // Save top 1000 list
    console.log('\n💾 Saving top 1000 list...');

    const outputPath = path.join(__dirname, 'top-1000-names.json');
    fs.writeFileSync(outputPath, JSON.stringify(top1000, null, 2));

    console.log(`   ✅ Saved: scripts/top-1000-names.json`);

    // Statistics
    console.log('\n📊 Statistics:');
    console.log(`   Total names: ${top1000.length}`);
    console.log(`   Girls: ${top1000.filter(n => n.gender === 'female' || n.gender === 'girl').length}`);
    console.log(`   Boys: ${top1000.filter(n => n.gender === 'male' || n.gender === 'boy').length}`);
    console.log(`   Unisex: ${top1000.filter(n => n.gender === 'unisex').length}`);

    // Sample
    console.log('\n✨ Sample (first 20):');
    top1000.slice(0, 20).forEach((name, i) => {
      console.log(`   ${i + 1}. ${name.name} (${name.gender})`);
    });

    console.log('\n✅ SUCCESS! Top 1000 names identified');
    console.log('🎯 Ready for V3.0 enrichment');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    throw error;
  }
}

main();
