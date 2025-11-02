#!/usr/bin/env node

/**
 * Create Mock V10 Enriched Data for Demo
 *
 * Generates realistic mock V10 enriched JSON files for the top 10 names
 * to demonstrate the SEO profiles and accordion memory feature.
 */

const fs = require('fs');
const path = require('path');

const outputDir = path.join(__dirname, '../public/data/enriched');

// Create output directory
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Mock V10 data template
const createMockData = (name, meaning, origin, gender) => ({
  name,
  meaning,
  origin,
  gender,
  pronunciation: `/${name.toLowerCase()}/`,
  culturalSignificance: `${name} is a timeless ${origin} name that has been cherished across generations. Its enduring popularity reflects its beautiful sound and meaningful heritage. The name carries cultural weight in many communities and continues to be a top choice for parents worldwide.`,
  modernContext: `Today, ${name} ranks among the most popular baby names globally, celebrated for its classic elegance and modern appeal.`,
  celestialData: {
    luckyNumber: Math.floor(Math.random() * 9) + 1,
    dominantElement: ['Fire', 'Earth', 'Air', 'Water'][Math.floor(Math.random() * 4)],
    luckyColor: ['Golden Yellow', 'Emerald Green', 'Royal Blue', 'Crimson Red', 'Amethyst Purple'][Math.floor(Math.random() * 5)],
    luckyColorHex: ['#FFD700', '#50C878', '#4169E1', '#DC143C', '#9966CC'][Math.floor(Math.random() * 5)],
    luckyGemstone: ['Diamond', 'Emerald', 'Sapphire', 'Ruby', 'Amethyst'][Math.floor(Math.random() * 5)],
    luckyDay: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'][Math.floor(Math.random() * 7)],
    moonPhase: ['New Moon', 'Waxing Crescent', 'First Quarter', 'Waxing Gibbous', 'Full Moon'][Math.floor(Math.random() * 5)]
  },
  historicalFigures: [
    {
      name: `${name} the Great`,
      years: '1500-1575',
      bio: `A renowned leader who shaped history through wisdom and courage. Known for groundbreaking achievements in governance and cultural advancement.`,
      achievements: 'Founded major institutions that lasted centuries'
    }
  ],
  famousPeople: [
    {
      name: `${name} Anderson`,
      profession: 'Academy Award-winning Actor',
      achievements: 'Multiple Oscar winner known for transformative performances'
    }
  ],
  famousAthletes: [
    {
      name: `${name} Johnson`,
      sport: 'Basketball (NBA)',
      achievements: '5-time NBA Champion, 2-time MVP'
    }
  ],
  celebrityBabies: [
    {
      childName: name,
      parent: 'Celebrity Parent',
      profession: 'Hollywood Actor',
      birthYear: '2020',
      context: 'Named after family heritage'
    }
  ],
  moviesAndShows: [
    {
      title: 'The Story of ' + name,
      year: '2015',
      character: name,
      context: 'Beloved character in award-winning film'
    }
  ],
  positiveSongs: [
    {
      title: name,
      artist: 'The Harmonics',
      year: '2010',
      genre: 'Pop',
      theme: 'Celebration',
      positiveVibeScore: 9,
      youtubeSearchUrl: `https://www.youtube.com/results?search_query=${encodeURIComponent(name + ' played by The Harmonics')}`
    },
    {
      title: 'Sweet ' + name,
      artist: 'Melody Makers',
      year: '2015',
      genre: 'Folk',
      theme: 'Joy',
      positiveVibeScore: 8,
      youtubeSearchUrl: `https://www.youtube.com/results?search_query=${encodeURIComponent('Sweet ' + name + ' played by Melody Makers')}`
    }
  ],
  translations: [
    { language: 'Spanish', script: name, pronunciation: name },
    { language: 'French', script: name, pronunciation: name },
    { language: 'German', script: name, pronunciation: name },
    { language: 'Italian', script: name, pronunciation: name },
    { language: 'Portuguese', script: name, pronunciation: name },
    { language: 'Russian', script: name, pronunciation: name }
  ],
  books: [
    {
      title: `${name}'s Journey`,
      author: 'Famous Author',
      year: '1995',
      genre: 'Classic Literature',
      significance: 'Beloved classic featuring a character named ' + name
    }
  ],
  famousQuotes: [
    {
      quote: 'Life is what you make of it',
      author: name + ' Roosevelt',
      context: 'Inspiring words from a historical figure'
    }
  ],
  variations: [name + 'a', name + 'o', name + 'ie'],
  similarNames: ['Alexander', 'Benjamin', 'Christopher'].filter(n => n !== name),
  nicknames: [name.slice(0, 3), name.slice(0, 4)],
  symbolism: 'Represents strength, wisdom, and grace',
  funFact: `Did you know? ${name} has been a popular name for over 100 years!`,
  personalityTraits: ['Creative', 'Compassionate', 'Strong', 'Independent']
});

const top10 = [
  { name: 'Liam', gender: 'male', origin: 'Irish', meaning: 'Strong-willed warrior' },
  { name: 'Olivia', gender: 'female', origin: 'Latin', meaning: 'Olive tree' },
  { name: 'Noah', gender: 'male', origin: 'Hebrew', meaning: 'Rest, comfort' },
  { name: 'Emma', gender: 'female', origin: 'Germanic', meaning: 'Universal' },
  { name: 'Oliver', gender: 'male', origin: 'Latin', meaning: 'Olive tree' },
  { name: 'Amelia', gender: 'female', origin: 'Germanic', meaning: 'Work' },
  { name: 'Theodore', gender: 'male', origin: 'Greek', meaning: 'Gift of God' },
  { name: 'Charlotte', gender: 'female', origin: 'French', meaning: 'Free woman' },
  { name: 'James', gender: 'male', origin: 'Hebrew', meaning: 'Supplanter' },
  { name: 'Mia', gender: 'female', origin: 'Italian', meaning: 'Mine' }
];

console.log('🎭 CREATING MOCK V10 ENRICHED DATA');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
console.log('Note: OpenAI API unavailable - using mock data for demo\n');

let created = 0;

top10.forEach((nameData, index) => {
  const mockData = createMockData(nameData.name, nameData.meaning, nameData.origin, nameData.gender);
  const filename = `${nameData.name.toLowerCase()}-v10.json`;
  const filepath = path.join(outputDir, filename);

  fs.writeFileSync(filepath, JSON.stringify(mockData, null, 2));
  console.log(`✅ [${index + 1}/10] Created: ${filename}`);
  created++;
});

console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('✨ MOCK DATA CREATION COMPLETE!');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
console.log(`📊 Summary:`);
console.log(`   Created: ${created} mock enriched files`);
console.log(`   Output: ${outputDir}\n`);
console.log('📝 Next step: Generate OG images');
console.log('   node scripts/generate-og-images.js');
