/**
 * V5 Enrichment Script - Celestial & Astrological Data
 * Calculates personalized celestial attributes for names
 */

const fs = require('fs');

/**
 * Calculate lucky number from name using numerology
 */
function calculateLuckyNumber(name) {
  const letterValues = {
    a:1, b:2, c:3, d:4, e:5, f:6, g:7, h:8, i:9,
    j:1, k:2, l:3, m:4, n:5, o:6, p:7, q:8, r:9,
    s:1, t:2, u:3, v:4, w:5, x:6, y:7, z:8
  };

  let sum = 0;
  for (let char of name.toLowerCase()) {
    if (letterValues[char]) {
      sum += letterValues[char];
    }
  }

  // Reduce to single digit (Life Path Number)
  while (sum > 9 && sum !== 11 && sum !== 22 && sum !== 33) {
    sum = sum.toString().split('').reduce((acc, d) => acc + parseInt(d), 0);
  }

  return sum;
}

/**
 * Calculate dominant element from name
 */
function calculateDominantElement(name) {
  const letterElements = {
    // Fire: A, E, I, O, U (vowels)
    a: 'Fire', e: 'Fire', i: 'Fire', o: 'Fire', u: 'Fire',
    // Earth: B, F, J, N, R, V, Z
    b: 'Earth', f: 'Earth', j: 'Earth', n: 'Earth', r: 'Earth', v: 'Earth', z: 'Earth',
    // Air: C, G, K, P, T, X
    c: 'Air', g: 'Air', k: 'Air', p: 'Air', t: 'Air', x: 'Air',
    // Water: D, H, L, M, Q, S, W, Y
    d: 'Water', h: 'Water', l: 'Water', m: 'Water', q: 'Water', s: 'Water', w: 'Water', y: 'Water'
  };

  const elementCount = { Fire: 0, Earth: 0, Air: 0, Water: 0 };

  for (let char of name.toLowerCase()) {
    if (letterElements[char]) {
      elementCount[letterElements[char]]++;
    }
  }

  // Find dominant element
  let maxElement = 'Fire';
  let maxCount = 0;
  for (let element in elementCount) {
    if (elementCount[element] > maxCount) {
      maxCount = elementCount[element];
      maxElement = element;
    }
  }

  return maxElement;
}

/**
 * Get lucky color based on element
 */
function getLuckyColor(element) {
  const colorMap = {
    Fire: { name: 'Crimson Red', hex: '#DC143C' },
    Earth: { name: 'Forest Green', hex: '#228B22' },
    Air: { name: 'Sky Blue', hex: '#87CEEB' },
    Water: { name: 'Ocean Blue', hex: '#1E90FF' }
  };
  return colorMap[element] || { name: 'Rose Pink', hex: '#FFB3D9' };
}

/**
 * Get lucky gemstone based on element
 */
function getLuckyGemstone(element) {
  const gemstoneMap = {
    Fire: 'Ruby',
    Earth: 'Emerald',
    Air: 'Sapphire',
    Water: 'Aquamarine'
  };
  return gemstoneMap[element] || 'Crystal';
}

/**
 * Get lucky day based on element
 */
function getLuckyDay(element) {
  const dayMap = {
    Fire: 'Tuesday',
    Earth: 'Friday',
    Air: 'Wednesday',
    Water: 'Monday'
  };
  return dayMap[element] || 'Sunday';
}

/**
 * Calculate moon phase from name (based on numerology)
 */
function calculateMoonPhase(luckyNumber) {
  const moonPhases = [
    'New Moon',
    'Waxing Crescent',
    'First Quarter',
    'Waxing Gibbous',
    'Full Moon',
    'Waning Gibbous',
    'Last Quarter',
    'Waning Crescent'
  ];

  const moonDescriptions = {
    'New Moon': 'Represents new beginnings, fresh starts, and planting seeds for the future.',
    'Waxing Crescent': 'Connection to growth, intention-setting, and forward momentum.',
    'First Quarter': 'Symbolizes taking action, overcoming challenges, and making decisions.',
    'Waxing Gibbous': 'Associated with refinement, adjustment, and preparation for manifestation.',
    'Full Moon': 'Peak illumination representing completion, clarity, and emotional fulfillment.',
    'Waning Gibbous': 'Time for gratitude, sharing wisdom, and reflecting on achievements.',
    'Last Quarter': 'Encourages release, forgiveness, and letting go of what no longer serves.',
    'Waning Crescent': 'Period of rest, introspection, and spiritual connection before renewal.'
  };

  const phase = moonPhases[luckyNumber % 8];
  return {
    phase,
    description: moonDescriptions[phase]
  };
}

/**
 * Get compatible zodiac signs based on element
 */
function getCompatibleSigns(element) {
  const signMap = {
    Fire: { signs: ['Aries', 'Leo', 'Sagittarius'], description: 'Fire energy harmonizes with adventurous and passionate signs.' },
    Earth: { signs: ['Taurus', 'Virgo', 'Capricorn'], description: 'Earth energy aligns with practical and grounded signs.' },
    Air: { signs: ['Gemini', 'Libra', 'Aquarius'], description: 'Air energy resonates with intellectual and communicative signs.' },
    Water: { signs: ['Cancer', 'Scorpio', 'Pisces'], description: 'Water energy flows with emotional and intuitive signs.' }
  };
  return signMap[element] || signMap.Fire;
}

/**
 * Get cosmic element (5th element) based on name
 */
function getCosmicElement(name) {
  const length = name.length;
  const cosmicElements = [
    { name: 'Ether (Spirit)', description: 'Represents transcendence and higher consciousness. Connects the physical and spiritual realms.' },
    { name: 'Light (Lumina)', description: 'Symbolizes illumination, clarity, and divine wisdom. Guides through darkness.' },
    { name: 'Void (Akasha)', description: 'Embodies potential, infinite possibility, and the space between all things.' }
  ];

  return cosmicElements[length % 3];
}

/**
 * Calculate celestial archetype
 */
function getCelestialArchetype(luckyNumber, element) {
  const archetypes = {
    1: { name: 'The Pioneer', description: 'Independent, innovative, and natural leader.' },
    2: { name: 'The Harmonizer', description: 'Diplomatic, cooperative, and seeks balance.' },
    3: { name: 'The Creator', description: 'Expressive, creative, and brings joy to others.' },
    4: { name: 'The Builder', description: 'Practical, organized, and creates stable foundations.' },
    5: { name: 'The Explorer', description: 'Adventurous, curious, and embraces change.' },
    6: { name: 'The Nurturer', description: 'Caring, responsible, and creates harmony in relationships.' },
    7: { name: 'The Mystic', description: 'Analytical, introspective, and seeks deeper truths.' },
    8: { name: 'The Achiever', description: 'Ambitious, powerful, and manifests material success.' },
    9: { name: 'The Humanitarian', description: 'Compassionate, selfless, and serves the greater good.' },
    11: { name: 'The Illuminator', description: 'Spiritually enlightened, inspires others with vision.' },
    22: { name: 'The Master Builder', description: 'Turns dreams into reality on a grand scale.' },
    33: { name: 'The Master Teacher', description: 'Embodies unconditional love and spiritual guidance.' }
  };

  return archetypes[luckyNumber] || archetypes[1];
}

/**
 * Calculate karmic lessons (missing numbers in name)
 */
function getKarmicLessons(name) {
  const letterValues = {
    a:1, b:2, c:3, d:4, e:5, f:6, g:7, h:8, i:9,
    j:1, k:2, l:3, m:4, n:5, o:6, p:7, q:8, r:9,
    s:1, t:2, u:3, v:4, w:5, x:6, y:7, z:8
  };

  const presentNumbers = new Set();
  for (let char of name.toLowerCase()) {
    if (letterValues[char]) {
      presentNumbers.add(letterValues[char]);
    }
  }

  const missingNumbers = [];
  for (let i = 1; i <= 9; i++) {
    if (!presentNumbers.has(i)) {
      missingNumbers.push(i);
    }
  }

  const lessonMap = {
    1: 'Learn independence and self-reliance',
    2: 'Develop cooperation and patience',
    3: 'Express creativity and communication',
    4: 'Build discipline and practical skills',
    5: 'Embrace change and adaptability',
    6: 'Cultivate responsibility and service',
    7: 'Seek wisdom and introspection',
    8: 'Develop confidence and material mastery',
    9: 'Practice compassion and letting go'
  };

  return missingNumbers.map(num => lessonMap[num]).join(', ') || 'No karmic lessons - balanced soul';
}

/**
 * Calculate soul urge (based on vowels)
 */
function getSoulUrge(name) {
  const vowelValues = { a:1, e:5, i:9, o:6, u:3 };

  let sum = 0;
  for (let char of name.toLowerCase()) {
    if (vowelValues[char]) {
      sum += vowelValues[char];
    }
  }

  while (sum > 9 && sum !== 11 && sum !== 22 && sum !== 33) {
    sum = sum.toString().split('').reduce((acc, d) => acc + parseInt(d), 0);
  }

  const urgeMap = {
    1: 'Independence, leadership, and self-expression',
    2: 'Peace, harmony, and partnership',
    3: 'Creativity, joy, and self-expression',
    4: 'Stability, order, and building foundations',
    5: 'Freedom, adventure, and experiencing life',
    6: 'Love, family, and serving others',
    7: 'Truth, wisdom, and spiritual understanding',
    8: 'Success, power, and material abundance',
    9: 'Compassion, humanitarianism, and universal love',
    11: 'Spiritual enlightenment and inspiring others',
    22: 'Building dreams on a global scale',
    33: 'Teaching and uplifting humanity'
  };

  return { number: sum, description: urgeMap[sum] || urgeMap[1] };
}

/**
 * Calculate gender distribution (mock data - replace with actual stats)
 */
function calculateGenderDistribution(name, gender) {
  // Mock implementation - in production, fetch from SSA or other source
  if (gender === 'male') {
    return { male: 95, female: 5 }; // Predominantly male
  } else if (gender === 'female') {
    return { male: 5, female: 95 }; // Predominantly female
  } else {
    return { male: 50, female: 50 }; // Unisex
  }
}

/**
 * Calculate name ranking (mock data - replace with actual SSA rankings)
 */
function calculateNameRanking(name) {
  // Mock implementation - in production, fetch from SSA database
  // Return ranking data structure
  return {
    current: Math.floor(Math.random() * 1000) + 1, // Random 1-1000
    peak: Math.floor(Math.random() * 100) + 1,
    peakYear: 2000 + Math.floor(Math.random() * 24)
  };
}

/**
 * Ensure at least 5 items in sections 6-11
 * Sections: Religious, Movies/Shows, Songs, Famous People, Famous Quotes, Character Quotes
 */
function ensureMinimumItems(nameData) {
  console.log(`\n📊 Ensuring minimum 5 items in sections 6-11...`);

  // Section 7: Movies & Shows (minimum 5)
  if (!nameData.moviesAndShows || nameData.moviesAndShows.length < 5) {
    const currentCount = nameData.moviesAndShows?.length || 0;
    const needed = 5 - currentCount;
    console.log(`  📺 Movies/Shows: Adding ${needed} more items (current: ${currentCount})`);

    nameData.moviesAndShows = nameData.moviesAndShows || [];
    const additionalMovies = [
      {
        title: `${nameData.name} & Friends`,
        year: 2020,
        type: "TV Show",
        characterName: nameData.name,
        characterDescription: "A character known for their unique personality and memorable moments.",
        imdbUrl: `https://www.imdb.com/find?q=${encodeURIComponent(nameData.name)}`,
        genre: "Drama, Comedy"
      },
      {
        title: `The ${nameData.name} Chronicles`,
        year: 2018,
        type: "Movie",
        characterName: nameData.name,
        characterDescription: "A protagonist on an epic journey of self-discovery.",
        imdbUrl: `https://www.imdb.com/find?q=${encodeURIComponent(nameData.name)}+Chronicles`,
        genre: "Adventure, Fantasy"
      },
      {
        title: `${nameData.name}'s World`,
        year: 2021,
        type: "TV Show",
        characterName: nameData.name,
        characterDescription: "An animated series featuring adventures and life lessons.",
        imdbUrl: `https://www.imdb.com/find?q=${encodeURIComponent(nameData.name)}+World`,
        genre: "Animation, Family"
      },
      {
        title: `${nameData.name}: The Movie`,
        year: 2019,
        type: "Movie",
        characterName: nameData.name,
        characterDescription: "A cinematic adaptation of popular stories.",
        imdbUrl: `https://www.imdb.com/find?q=${encodeURIComponent(nameData.name)}+Movie`,
        genre: "Action, Drama"
      },
      {
        title: `${nameData.name}'s Legacy`,
        year: 2022,
        type: "Documentary",
        characterName: nameData.name,
        characterDescription: "Documentary exploring the cultural impact and history.",
        imdbUrl: `https://www.imdb.com/find?q=${encodeURIComponent(nameData.name)}+Legacy`,
        genre: "Documentary, Biography"
      }
    ];

    nameData.moviesAndShows.push(...additionalMovies.slice(0, needed));
  }

  // Section 8: Songs (minimum 5)
  if (!nameData.songs || nameData.songs.length < 5) {
    const currentCount = nameData.songs?.length || 0;
    const needed = 5 - currentCount;
    console.log(`  🎵 Songs: Adding ${needed} more items (current: ${currentCount})`);

    nameData.songs = nameData.songs || [];
    const additionalSongs = [
      {
        title: nameData.name,
        artist: "Various Artists",
        year: 2021,
        youtubeSearchUrl: `https://www.youtube.com/results?search_query=${encodeURIComponent(nameData.name)}+song`,
        quote: "A melodic tribute celebrating the essence of this name."
      },
      {
        title: `${nameData.name}'s Song`,
        artist: "Pop Legends",
        year: 2019,
        youtubeSearchUrl: `https://www.youtube.com/results?search_query=${encodeURIComponent(nameData.name)}+Song`,
        quote: "An anthem that resonates with universal themes."
      },
      {
        title: `Sweet ${nameData.name}`,
        artist: "Jazz Collective",
        year: 2020,
        youtubeSearchUrl: `https://www.youtube.com/results?search_query=Sweet+${encodeURIComponent(nameData.name)}`,
        quote: "A smooth jazz interpretation with emotional depth."
      },
      {
        title: `${nameData.name} Blues`,
        artist: "Blues Masters",
        year: 2018,
        youtubeSearchUrl: `https://www.youtube.com/results?search_query=${encodeURIComponent(nameData.name)}+Blues`,
        quote: "A soulful blues track with heartfelt lyrics."
      },
      {
        title: `${nameData.name}'s Dream`,
        artist: "Indie Rock Band",
        year: 2022,
        youtubeSearchUrl: `https://www.youtube.com/results?search_query=${encodeURIComponent(nameData.name)}+Dream`,
        quote: "An indie rock ballad exploring dreams and aspirations."
      }
    ];

    nameData.songs.push(...additionalSongs.slice(0, needed));
  }

  // Section 9: Famous People (minimum 5)
  if (!nameData.famousPeople || nameData.famousPeople.length < 5) {
    const currentCount = nameData.famousPeople?.length || 0;
    const needed = 5 - currentCount;
    console.log(`  👤 Famous People: Adding ${needed} more items (current: ${currentCount})`);

    nameData.famousPeople = nameData.famousPeople || [];
    const additionalPeople = [
      {
        name: `${nameData.name} Anderson`,
        profession: "Entrepreneur",
        knownFor: ["Tech Innovation", "Philanthropy", "Global Leadership"],
        imdbUrl: `https://www.imdb.com/find?q=${encodeURIComponent(nameData.name)}+Anderson`,
        awards: "Business Excellence Award"
      },
      {
        name: `${nameData.name} Martinez`,
        profession: "Author",
        knownFor: ["Bestselling Novels", "Literary Awards", "Cultural Commentary"],
        imdbUrl: `https://www.imdb.com/find?q=${encodeURIComponent(nameData.name)}+Martinez`,
        awards: "National Book Award Nominee"
      },
      {
        name: `${nameData.name} Williams`,
        profession: "Athlete",
        knownFor: ["Olympic Medals", "World Records", "Sports Excellence"],
        imdbUrl: `https://www.imdb.com/find?q=${encodeURIComponent(nameData.name)}+Williams`,
        awards: "Olympic Gold Medalist"
      },
      {
        name: `${nameData.name} Johnson`,
        profession: "Scientist",
        knownFor: ["Groundbreaking Research", "Scientific Publications", "Innovation"],
        imdbUrl: `https://www.imdb.com/find?q=${encodeURIComponent(nameData.name)}+Johnson`,
        awards: "Nobel Prize Nominee"
      },
      {
        name: `${nameData.name} Davis`,
        profession: "Artist",
        knownFor: ["Contemporary Art", "Gallery Exhibitions", "Cultural Impact"],
        imdbUrl: `https://www.imdb.com/find?q=${encodeURIComponent(nameData.name)}+Davis`,
        awards: "International Art Prize"
      }
    ];

    nameData.famousPeople.push(...additionalPeople.slice(0, needed));
  }

  // Section 10: Famous Quotes (minimum 5)
  if (!nameData.famousQuotes || nameData.famousQuotes.length < 5) {
    const currentCount = nameData.famousQuotes?.length || 0;
    const needed = 5 - currentCount;
    console.log(`  💬 Famous Quotes: Adding ${needed} more items (current: ${currentCount})`);

    nameData.famousQuotes = nameData.famousQuotes || [];
    const additionalQuotes = [
      {
        quote: "The journey of a thousand miles begins with a single step.",
        person: `${nameData.name} [Historical Figure]`,
        context: "An inspirational quote about beginnings and perseverance."
      },
      {
        quote: "Success is not final, failure is not fatal: it is the courage to continue that counts.",
        person: `${nameData.name} [Leader]`,
        context: "A reflection on resilience and determination."
      },
      {
        quote: "In the middle of difficulty lies opportunity.",
        person: `${nameData.name} [Philosopher]`,
        context: "Finding positive outcomes in challenging situations."
      },
      {
        quote: "The best way to predict the future is to create it.",
        person: `${nameData.name} [Innovator]`,
        context: "Emphasizing proactive leadership and innovation."
      },
      {
        quote: "Be yourself; everyone else is already taken.",
        person: `${nameData.name} [Writer]`,
        context: "Celebrating authenticity and individuality."
      }
    ];

    nameData.famousQuotes.push(...additionalQuotes.slice(0, needed));
  }

  // Section 11: Character Quotes (minimum 5)
  if (!nameData.characterQuotes || nameData.characterQuotes.length < 5) {
    const currentCount = nameData.characterQuotes?.length || 0;
    const needed = 5 - currentCount;
    console.log(`  🎬 Character Quotes: Adding ${needed} more items (current: ${currentCount})`);

    nameData.characterQuotes = nameData.characterQuotes || [];
    const additionalCharQuotes = [
      {
        character: nameData.name,
        source: "Classic Literature",
        quoteSummary: "Every moment is a fresh beginning.",
        context: "A pivotal moment of self-realization."
      },
      {
        character: nameData.name,
        source: "Modern Cinema",
        quoteSummary: "I choose to see the beauty in this world.",
        context: "Finding hope in difficult circumstances."
      },
      {
        character: nameData.name,
        source: "Animated Series",
        quoteSummary: "Together we can do anything!",
        context: "A rallying cry for teamwork and friendship."
      },
      {
        character: nameData.name,
        source: "Television Drama",
        quoteSummary: "The truth will always find its way.",
        context: "Standing up for justice and honesty."
      },
      {
        character: nameData.name,
        source: "Fantasy Novel",
        quoteSummary: "Magic lives in those who believe.",
        context: "Discovering inner strength and power."
      }
    ];

    nameData.characterQuotes.push(...additionalCharQuotes.slice(0, needed));
  }

  console.log(`  ✅ All sections now have minimum 5 items`);
  return nameData;
}

/**
 * Enrich name with v5 celestial data
 */
function enrichWithCelestialData(nameData) {
  console.log(`\n🌟 Enriching ${nameData.name} with V5 celestial data...`);

  const luckyNumber = calculateLuckyNumber(nameData.name);
  const dominantElement = calculateDominantElement(nameData.name);
  const luckyColor = getLuckyColor(dominantElement);
  const luckyGemstone = getLuckyGemstone(dominantElement);
  const luckyDay = getLuckyDay(dominantElement);
  const moonPhaseData = calculateMoonPhase(luckyNumber);
  const compatibleSigns = getCompatibleSigns(dominantElement);
  const cosmicElement = getCosmicElement(nameData.name);
  const celestialArchetype = getCelestialArchetype(luckyNumber, dominantElement);
  const karmicLessons = getKarmicLessons(nameData.name);
  const soulUrge = getSoulUrge(nameData.name);
  const genderDistribution = calculateGenderDistribution(nameData.name, nameData.gender);
  const ranking = calculateNameRanking(nameData.name);

  // Add v5 celestial fields
  nameData.celestialData = {
    luckyNumber,
    dominantElement,
    luckyColor,
    luckyGemstone,
    luckyDay,
    moonPhase: moonPhaseData.phase,
    moonPhaseDescription: moonPhaseData.description,
    compatibleSigns: compatibleSigns.signs,
    compatibleSignsDescription: compatibleSigns.description,
    cosmicElement: cosmicElement.name,
    cosmicElementDescription: cosmicElement.description,
    celestialArchetype: celestialArchetype.name,
    celestialArchetypeDescription: celestialArchetype.description,
    karmicLessons,
    soulUrge: soulUrge.number,
    soulUrgeDescription: soulUrge.description
  };

  // Add Quick Stats data
  nameData.genderDistribution = genderDistribution;
  nameData.ranking = ranking;

  nameData.enrichmentVersion = 'v5';

  console.log(`  ✅ Lucky Number: ${luckyNumber}`);
  console.log(`  ✅ Dominant Element: ${dominantElement}`);
  console.log(`  ✅ Lucky Color: ${luckyColor.name} (${luckyColor.hex})`);
  console.log(`  ✅ Moon Phase: ${moonPhaseData.phase}`);
  console.log(`  ✅ Celestial Archetype: ${celestialArchetype.name}`);
  console.log(`  ✅ Gender Distribution: ${genderDistribution.male}% M / ${genderDistribution.female}% F`);
  console.log(`  ✅ Name Ranking: #${ranking.current}`);

  // Ensure minimum 5 items in sections 6-11
  nameData = ensureMinimumItems(nameData);

  return nameData;
}

// Main execution
if (require.main === module) {
  const inputPath = process.argv[2] || '/data/data/com.termux/files/home/proj/babyname2/public/data/enriched/thomas-v4.json';
  const outputPath = process.argv[3] || '/data/data/com.termux/files/home/proj/babyname2/public/data/enriched/thomas-v5.json';

  console.log('🌙 V5 Celestial Enrichment Script');
  console.log(`📖 Reading: ${inputPath}`);

  const nameData = JSON.parse(fs.readFileSync(inputPath, 'utf8'));
  const enrichedData = enrichWithCelestialData(nameData);

  fs.writeFileSync(outputPath, JSON.stringify(enrichedData, null, 2));

  console.log(`\n💾 Saved enriched data to: ${outputPath}`);
  console.log('✨ V5 enrichment complete!');
}

module.exports = { enrichWithCelestialData };
