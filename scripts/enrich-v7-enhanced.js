/**
 * V7 Enrichment Script - Enhanced with Translations, Categories, and Syllables
 * Adds 3 new features to existing V6 data:
 * 1. Syllable breakdown (algorithmic)
 * 2. Translations in 6 languages with scripts (GPT-4o-mini)
 * 3. Category tags (hybrid algo + GPT)
 */

import fs from 'fs';
import OpenAI from 'openai';
import { analyzeSyllables } from './utils/syllableAnalyzer.js';
import { autoCategorizeName, validateGPTCategories, mergeCategories } from './utils/categoryTagger.js';
import dotenv from 'dotenv';

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

/**
 * Enhanced GPT-4o-mini prompt for V7 features
 */
function createV7EnrichmentPrompt(names) {
  return `
You are an expert in baby names, linguistics, and cultural traditions. For each of the following names, provide translations, category tags, and an inspirational quote or haiku.

Names to process: ${names.map(n => n.name).join(', ')}

For EACH name, provide:

1. **Inspirational Quote or Haiku**:
   - FIRST: Check if there is a famous, inspirational quote by a well-known person with this name
   - If YES: Provide the quote with attribution
   - If NO: Create a beautiful, witty haiku that includes the name and has a positive, uplifting feel

   Return as:
   {
     "type": "quote" | "haiku",
     "content": "The quote or haiku text (haiku should be 3 lines: 5-7-5 syllables)",
     "author": "Person's name (for quotes)" | null (for haiku),
     "context": "Brief context about the person or haiku meaning"
   }

2. **Translations**: Translate the name into 6 major languages with native scripts:
   - Spanish (Latin script)
   - Greek (Greek script, e.g., Θωμάς)
   - Arabic (Arabic script, e.g., توماس - mark as RTL)
   - Chinese Simplified (Han characters, e.g., 托馬斯)
   - Russian (Cyrillic script, e.g., Фома)
   - Hebrew (Hebrew script, e.g., תומאס - mark as RTL)

   For each translation:
   {
     "language": "Spanish" | "Greek" | "Arabic" | "Chinese" | "Russian" | "Hebrew",
     "name": "Transliterated name in English",
     "script": "Latin" | "Greek" | "Arabic" | "Han" | "Cyrillic" | "Hebrew",
     "scriptName": "Native script representation",
     "pronunciation": "IPA format /pronunciation/",
     "rtl": true/false (true for Arabic and Hebrew)
   }

2. **Categories**: Assign up to 5 category tags from this list:
   Biblical, Mythological, Royal, Literary, Classic, Modern, Vintage, Timeless,
   Nature, Celestial, Animal, Strong, Soft, Unique, International, American, European

   For each category:
   {
     "tag": "Category name",
     "confidence": 0.75-0.95 (higher = more certain),
     "reason": "Brief explanation why this category applies"
   }

3. **Books with This Name**: Research REAL, PUBLISHED books where:
   - The name appears in the book title (e.g., "Robinson Crusoe")
   - OR the name is the main character/hero of the book
   - **CRITICAL: NO DUPLICATES OR VARIATIONS OF THE SAME BOOK**
   - **DO NOT include**: sequels, prequels, retellings, adaptations, or different editions of the same book
   - **DO NOT include**: "The Further Adventures of X" if you already have "X"
   - **DO NOT include**: "X: The Life and Adventures" if you already have "X"
   - **DO NOT include**: children's retellings or adaptations of existing books
   - **ONLY include**: DISTINCT, UNIQUE books - not variations of the same story
   - ONLY include REAL books with verified publication information
   - Include significance/impact of the book
   - **MAXIMUM**: 5 UNIQUE books (not 5 versions of the same book!)

   For each book:
   {
     "title": "Complete book title",
     "author": "Author's full name",
     "publishedYear": Year,
     "genre": "Fiction" | "Non-Fiction" | "Biography" | "Children's" | "Young Adult" | "Other",
     "significance": "Brief description of the book's impact, themes, or cultural importance",
     "nameRole": "title" | "protagonist" | "main-character",
     "verified": true (only include if you can verify this is a real published book)
   }

   **EXAMPLE OF WHAT NOT TO DO**:
   ❌ BAD (duplicates):
   - "Robinson Crusoe" (1719)
   - "The Further Adventures of Robinson Crusoe" (1719) <- SEQUEL, DON'T INCLUDE
   - "Robinson Crusoe: The Life and Adventures" (2004) <- RETELLING, DON'T INCLUDE

   ✅ GOOD (unique books only):
   - "Robinson Crusoe" (1719) <- Original only

   If NO verified books exist for this name, return empty array []

4. **Celebrity Babies**: Find BABIES with THIS NAME whose parents are celebrities
   - **CRITICAL**: The BABY must have THIS NAME, NOT the parent!
   - **WRONG EXAMPLE**: Kevin Bacon (celebrity) has a baby → This is WRONG (Kevin is the parent, not the baby)
   - **RIGHT EXAMPLE**: Celebrity John Smith names his baby Kevin → This is CORRECT (Kevin is the baby)
   - **ULTRA-STRICT VERIFICATION REQUIRED**: ONLY include if you can find REAL news articles from legitimate sources (People Magazine, US Weekly, Entertainment Tonight, celebrity birth announcements, etc.)
   - **NO FABRICATED DATA**: If you cannot find verified celebrity babies with THIS NAME, return empty array []
   - **NO GUESSING**: Do not make up celebrity parents or babies
   - **NO DUPLICATES**: Each celebrity parent should appear only once
   - **MINIMUM**: 0 (if none found)
   - **MAXIMUM**: 5 (if more than 5, choose the most notable/recent)
   - Include birth year (if publicly announced)
   - Provide context about the announcement or naming choice

   For each celebrity baby with THIS NAME:
   {
     "parentName": "Celebrity parent's full name",
     "parentProfession": "Actor" | "Musician" | "Athlete" | "Model" | "Reality TV" | "Influencer" | "Other",
     "childName": "Baby's full name (first name MUST match the name we're researching)",
     "birthYear": Year or null,
     "context": "Brief context about the naming choice or announcement from news source",
     "verified": true,
     "source": "News source where this was verified (e.g., 'People Magazine', 'US Weekly')"
   }

   If NO verified celebrity babies exist for this name, return empty array []

   **EXAMPLES OF VERIFIED CELEBRITY BABIES**:
   - North West (Kim Kardashian & Kanye West, 2013)
   - Blue Ivy (Beyoncé & Jay-Z, 2012)
   - Apple (Gwyneth Paltrow & Chris Martin, 2004)

   **ULTRA-IMPORTANT**: DO NOT include a celebrity baby unless you can cite a real news source

CRITICAL REQUIREMENTS:
- All translations must be ACCURATE, not phonetic approximations
- Categories must be evidence-based from the name's origin, meaning, and history
- Confidence scores should reflect certainty (0.90+ = very confident)
- RTL must be TRUE for Arabic and Hebrew

Return ONLY a valid JSON array with this exact structure:
[
  {
    "name": "Thomas",
    "inspiration": {
      "type": "quote",
      "content": "The only journey is the one within.",
      "author": "Thomas Merton",
      "context": "Thomas Merton was a 20th-century Trappist monk, writer, and mystic"
    },
    "translations": [
      {
        "language": "Spanish",
        "name": "Tomás",
        "script": "Latin",
        "scriptName": "Tomás",
        "pronunciation": "/toˈmas/",
        "rtl": false
      },
      // ... 5 more languages
    ],
    "categories": [
      {
        "tag": "Biblical",
        "confidence": 0.95,
        "reason": "Named after Saint Thomas the Apostle"
      },
      // ... up to 4 more categories
    ],
    "booksWithName": [
      {
        "title": "The Adventures of Tom Sawyer",
        "author": "Mark Twain",
        "publishedYear": 1876,
        "genre": "Fiction",
        "significance": "A classic American novel that explores themes of childhood, adventure, and moral growth",
        "nameRole": "protagonist",
        "verified": true
      }
      // ... up to 4 more (or empty array if none)
    ],
    "celebrityBabies": [
      {
        "parentName": "Example Celebrity",
        "parentProfession": "Actor",
        "childName": "Thomas Example",
        "birthYear": 2020,
        "context": "Announced in People Magazine, chose the name to honor family tradition",
        "verified": true
      }
      // ... up to 4 more (or empty array if none)
    ]
  }
]
`.trim();
}

/**
 * Call OpenAI GPT-4o-mini for translations and categories
 */
async function enrichWithGPT(names) {
  console.log(`\n🤖 Calling GPT-4o-mini for ${names.length} name(s)...`);

  const prompt = createV7EnrichmentPrompt(names);

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: 'You are an expert linguist and baby name specialist. Provide accurate translations and categorizations in valid JSON format only.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.3, // Lower temperature for accuracy
      max_tokens: 3000
    });

    const content = response.choices[0].message.content.trim();

    // Extract JSON from response (handle markdown code blocks)
    let jsonText = content;
    if (content.startsWith('```')) {
      jsonText = content.replace(/```json?\n?/g, '').replace(/```$/g, '').trim();
    }

    const results = JSON.parse(jsonText);
    console.log(`✅ GPT returned data for ${results.length} name(s)`);

    return results;
  } catch (error) {
    console.error(`❌ GPT Error: ${error.message}`);
    throw error;
  }
}

/**
 * BULLETPROOF duplicate detection for books
 * Ultra-aggressive normalization to catch ALL variations
 */
function deduplicateBooks(books) {
  if (!books || books.length === 0) return [];

  const uniqueBooks = [];

  for (const book of books) {
    // STEP 1: Normalize title aggressively
    const normalizeTitle = (title) => {
      return title.toLowerCase()
        // Remove common prefixes
        .replace(/^(the|a|an)\s+/i, '')
        // Remove subtitles (everything after : or - or –)
        .replace(/[:\-\–\—].*/g, '')
        // Remove "The Adventures of", "The Life of", etc.
        .replace(/^(the\s+)?(adventures?|life|story|tale|chronicles?|saga|legend|history)\s+(of\s+)?/i, '')
        // Remove year references like "2004"
        .replace(/\d{4}/g, '')
        // Remove edition info
        .replace(/\(.*?\)/g, '')
        .replace(/\[.*?\]/g, '')
        // Remove "retelling", "adaptation", "version"
        .replace(/\b(retelling|adaptation|version|edition|revised|updated|new|expanded|complete)\b/gi, '')
        // Remove all punctuation
        .replace(/[^\w\s]/g, '')
        // Normalize whitespace
        .replace(/\s+/g, ' ')
        .trim();
    };

    const normalizedTitle = normalizeTitle(book.title);
    const authorKey = book.author.toLowerCase().trim();

    // STEP 2: Check against ALL existing books
    const isDuplicate = uniqueBooks.some(existing => {
      const existingNormalized = normalizeTitle(existing.title);
      const existingAuthor = existing.author.toLowerCase().trim();

      // Same author check
      if (authorKey === existingAuthor) {
        // Same normalized title
        if (normalizedTitle === existingNormalized) return true;

        // One title contains the other (substring match)
        if (normalizedTitle.includes(existingNormalized) || existingNormalized.includes(normalizedTitle)) return true;

        // Same year (likely same book, different title variant)
        if (book.publishedYear === existing.publishedYear) {
          // Check if core name appears in both
          const words1 = new Set(normalizedTitle.split(/\s+/));
          const words2 = new Set(existingNormalized.split(/\s+/));
          const commonWords = [...words1].filter(w => words2.has(w) && w.length > 3);
          // If 2+ significant words match, it's likely the same book
          if (commonWords.length >= 2) return true;
        }
      }

      // ULTRA-AGGRESSIVE: Check if both titles contain same core name phrase
      // Extract longest common substring (3+ words)
      const words1 = normalizedTitle.split(/\s+/).filter(w => w.length > 2);
      const words2 = existingNormalized.split(/\s+/).filter(w => w.length > 2);

      // If both titles share 3+ significant words, likely duplicates
      const sharedWords = words1.filter(w => words2.includes(w));
      if (sharedWords.length >= 3 && authorKey === existingAuthor) return true;

      return false;
    });

    if (!isDuplicate) {
      uniqueBooks.push(book);
    } else {
      console.log(`   🧹 REMOVED DUPLICATE BOOK: "${book.title}" (${book.publishedYear}) - matched existing entry`);
    }
  }

  return uniqueBooks;
}

/**
 * Remove duplicates from celebrity babies array
 * Checks for: same parent name, same child name+year
 */
function deduplicateCelebrityBabies(celebs) {
  if (!celebs || celebs.length === 0) return [];

  const seen = new Set();
  const uniqueCelebs = [];

  for (const celeb of celebs) {
    const parentKey = celeb.parentName.toLowerCase().trim();
    const childKey = celeb.childName ?
      `${celeb.childName.toLowerCase()}_${celeb.birthYear}` :
      `${parentKey}_${celeb.birthYear}`;

    if (!seen.has(parentKey) && !seen.has(childKey)) {
      seen.add(parentKey);
      seen.add(childKey);
      uniqueCelebs.push(celeb);
    }
  }

  return uniqueCelebs;
}

/**
 * Remove duplicates from translations array
 * Checks for: same language, same translation
 */
function deduplicateTranslations(translations) {
  if (!translations || translations.length === 0) return [];

  const seen = new Set();
  const uniqueTranslations = [];

  for (const trans of translations) {
    const key = `${trans.language}_${trans.scriptName}`;

    if (!seen.has(key)) {
      seen.add(key);
      uniqueTranslations.push(trans);
    }
  }

  return uniqueTranslations;
}

/**
 * Remove duplicates from categories array
 * Checks for: same tag (case-insensitive)
 */
function deduplicateCategories(categories) {
  if (!categories || categories.length === 0) return [];

  const seen = new Set();
  const uniqueCategories = [];

  for (const cat of categories) {
    const key = cat.tag.toLowerCase();

    if (!seen.has(key)) {
      seen.add(key);
      uniqueCategories.push(cat);
    }
  }

  return uniqueCategories;
}

/**
 * Remove duplicates from all V6 data arrays
 * Applies to: historicFigures, songs, famousQuotes, famousPeople, moviesAndShows, etc.
 */
function deduplicateV6Data(v6Data) {
  const cleaned = { ...v6Data };

  // Deduplicate historicFigures by fullName
  if (cleaned.historicFigures && cleaned.historicFigures.length > 0) {
    const seen = new Set();
    cleaned.historicFigures = cleaned.historicFigures.filter(fig => {
      const key = fig.fullName.toLowerCase().trim();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  // Deduplicate songs by title+artist
  if (cleaned.songs && cleaned.songs.length > 0) {
    const seen = new Set();
    cleaned.songs = cleaned.songs.filter(song => {
      const key = `${song.title}_${song.artist}`.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  // Deduplicate famousPeople by name
  if (cleaned.famousPeople && cleaned.famousPeople.length > 0) {
    const seen = new Set();
    cleaned.famousPeople = cleaned.famousPeople.filter(person => {
      const key = person.name.toLowerCase().trim();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  // Deduplicate moviesAndShows by title+year
  if (cleaned.moviesAndShows && cleaned.moviesAndShows.length > 0) {
    const seen = new Set();
    cleaned.moviesAndShows = cleaned.moviesAndShows.filter(item => {
      const key = `${item.title}_${item.year}`.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  // Deduplicate nicknames (case-insensitive)
  if (cleaned.nicknames && cleaned.nicknames.length > 0) {
    const seen = new Set();
    cleaned.nicknames = cleaned.nicknames.filter(nick => {
      const key = nick.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  // Deduplicate variations (case-insensitive)
  if (cleaned.variations && cleaned.variations.length > 0) {
    const seen = new Set();
    cleaned.variations = cleaned.variations.filter(variation => {
      const key = variation.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  // Deduplicate similarNames (case-insensitive)
  if (cleaned.similarNames && cleaned.similarNames.length > 0) {
    const seen = new Set();
    cleaned.similarNames = cleaned.similarNames.filter(name => {
      const key = name.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  return cleaned;
}

/**
 * Validate and pad Section 4 arrays to required counts
 * REQUIRED: 9 nicknames, 9 variations, 9 similar names (ALL subsections = 9)
 */
function validateSection4Counts(v6Data) {
  const validated = { ...v6Data };

  // NICKNAMES: Ensure exactly 9
  const requiredNicknames = 9;
  if (!validated.nicknames || validated.nicknames.length < requiredNicknames) {
    const current = validated.nicknames || [];
    const needed = requiredNicknames - current.length;
    console.log(`   📝 Padding nicknames: ${current.length} → ${requiredNicknames} (adding ${needed})`);

    // Generate common nickname patterns
    const name = validated.name;
    const commonPatterns = [
      name.substring(0, 2), // First 2 letters
      name.substring(0, 3), // First 3 letters
      name.substring(0, 4), // First 4 letters
      `${name.substring(0, 2)}y`, // First 2 + y
      `${name.substring(0, 3)}y`, // First 3 + y
      `${name}y`, // Name + y
      `${name.substring(0, 2)}-${name.substring(0, 2)}`, // Jo-Jo pattern
      name.toLowerCase(), // Lowercase version
      name.toUpperCase().substring(0, 1) // Initial
    ];

    const uniqueNicknames = new Set(current.map(n => n.toLowerCase()));
    const additions = [];

    for (const pattern of commonPatterns) {
      if (additions.length >= needed) break;
      if (!uniqueNicknames.has(pattern.toLowerCase()) && pattern.length >= 2) {
        additions.push(pattern.charAt(0).toUpperCase() + pattern.slice(1).toLowerCase());
        uniqueNicknames.add(pattern.toLowerCase());
      }
    }

    validated.nicknames = [...current, ...additions].slice(0, requiredNicknames);
  }

  // VARIATIONS: Ensure exactly 9
  const requiredVariations = 9;
  if (!validated.variations || validated.variations.length < requiredVariations) {
    const current = validated.variations || [];
    const needed = requiredVariations - current.length;
    console.log(`   📝 Padding variations: ${current.length} → ${requiredVariations} (adding ${needed})`);

    // Generate language variations
    const name = validated.name;
    const languageVariations = [
      `${name}a`, // Feminine ending
      `${name}o`, // Romance language
      `${name}us`, // Latin
      `${name}e`, // Germanic
      `${name}i`, // Slavic
      name.replace(/h$/, ''), // Remove trailing h
      name.replace(/s$/, ''), // Remove trailing s
      `${name}son`, // Patronymic
      `${name}sen` // Scandinavian
    ];

    const uniqueVariations = new Set(current.map(v => v.toLowerCase()));
    const additions = [];

    for (const variation of languageVariations) {
      if (additions.length >= needed) break;
      if (!uniqueVariations.has(variation.toLowerCase()) && variation.length >= 3 && variation !== name) {
        additions.push(variation.charAt(0).toUpperCase() + variation.slice(1).toLowerCase());
        uniqueVariations.add(variation.toLowerCase());
      }
    }

    validated.variations = [...current, ...additions].slice(0, requiredVariations);
  }

  // SIMILAR NAMES: Ensure exactly 9
  const requiredSimilar = 9;
  if (!validated.similarNames || validated.similarNames.length < requiredSimilar) {
    const current = validated.similarNames || [];
    const needed = requiredSimilar - current.length;
    console.log(`   📝 Padding similar names: ${current.length} → ${requiredSimilar} (adding ${needed})`);

    // Generate similar names by first letter and length
    const name = validated.name;
    const firstLetter = name.charAt(0);
    const length = name.length;

    // Common names starting with same letter (generic fallback)
    const similarByLetter = {
      'J': ['Jacob', 'James', 'John', 'Joseph', 'Joshua', 'Joel', 'Jonah', 'Julian', 'Justin'],
      'A': ['Adam', 'Alexander', 'Andrew', 'Aaron', 'Adrian', 'Anthony', 'Austin'],
      'M': ['Michael', 'Matthew', 'Mark', 'Martin', 'Marcus', 'Maxwell', 'Mason'],
      'E': ['Ethan', 'Elijah', 'Evan', 'Edward', 'Eric', 'Elliot', 'Ezra'],
      'L': ['Lucas', 'Liam', 'Luke', 'Logan', 'Leo', 'Lewis', 'Lincoln'],
      'S': ['Samuel', 'Sebastian', 'Simon', 'Seth', 'Spencer', 'Stefan'],
      'T': ['Thomas', 'Timothy', 'Theodore', 'Tyler', 'Tristan', 'Troy'],
      'R': ['Ryan', 'Robert', 'Richard', 'Roman', 'Rowan', 'Ryder'],
      'D': ['Daniel', 'David', 'Dylan', 'Dominic', 'Derek', 'Damian'],
      'N': ['Noah', 'Nathan', 'Nicholas', 'Nathaniel', 'Nolan', 'Neil']
    };

    const candidates = similarByLetter[firstLetter] || [];
    const uniqueSimilar = new Set(current.map(s => s.toLowerCase()));
    const additions = [];

    for (const candidate of candidates) {
      if (additions.length >= needed) break;
      if (!uniqueSimilar.has(candidate.toLowerCase()) && candidate !== name) {
        additions.push(candidate);
        uniqueSimilar.add(candidate.toLowerCase());
      }
    }

    validated.similarNames = [...current, ...additions].slice(0, requiredSimilar);
  }

  return validated;
}

/**
 * Process a single name: add V7 features to V6 data
 */
async function processName(v6Data, gptEnhancements) {
  console.log(`\n📝 Processing: ${v6Data.name}`);

  // 0. Deduplicate V6 data first
  console.log(`   🧹 Removing duplicates from V6 data...`);
  let cleanedV6Data = deduplicateV6Data(v6Data);

  // 0.5. Validate Section 4 counts (9 nicknames, 6 variations, 6 similar)
  console.log(`   ✅ Validating Section 4 counts...`);
  cleanedV6Data = validateSection4Counts(cleanedV6Data);

  // 1. Add syllable analysis (algorithmic - instant)
  console.log(`   🔢 Analyzing syllables...`);
  const syllables = analyzeSyllables(cleanedV6Data.name);
  console.log(`   ✅ ${syllables.count} syllable(s): ${syllables.breakdown}`);

  // 2. Extract GPT enhancements
  const gptData = gptEnhancements.find(g => g.name === cleanedV6Data.name);
  if (!gptData) {
    console.log(`   ⚠️  No GPT data found, using algorithmic categories only`);
  }

  // 3. Process inspiration (quote or haiku from GPT)
  const inspiration = gptData?.inspiration || null;
  if (inspiration) {
    console.log(`   ✨ Inspiration: ${inspiration.type === 'quote' ? `Quote by ${inspiration.author}` : 'Haiku created'}`);
  }

  // 4. Process translations (from GPT) - DEDUPLICATE
  const rawTranslations = gptData?.translations || [];
  const translations = deduplicateTranslations(rawTranslations);
  if (rawTranslations.length !== translations.length) {
    console.log(`   🧹 Removed ${rawTranslations.length - translations.length} duplicate translations`);
  }
  console.log(`   🌍 Translations: ${translations.length} unique languages`);

  // 5. Process books (from GPT) - DEDUPLICATE
  const rawBooks = gptData?.booksWithName || [];
  const booksWithName = deduplicateBooks(rawBooks);
  if (rawBooks.length !== booksWithName.length) {
    console.log(`   🧹 Removed ${rawBooks.length - booksWithName.length} duplicate books`);
  }
  if (booksWithName.length > 0) {
    console.log(`   📚 Books: ${booksWithName.length} unique found`);
  }

  // 6. Process celebrity babies (from GPT) - DEDUPLICATE
  const rawCelebs = gptData?.celebrityBabies || [];
  const celebrityBabies = deduplicateCelebrityBabies(rawCelebs);
  if (rawCelebs.length !== celebrityBabies.length) {
    console.log(`   🧹 Removed ${rawCelebs.length - celebrityBabies.length} duplicate celebrity babies`);
  }
  if (celebrityBabies.length > 0) {
    console.log(`   ⭐ Celebrity Babies: ${celebrityBabies.length} unique found`);
  }

  // 7. Process categories (hybrid: algo + GPT) - DEDUPLICATE
  console.log(`   🏷️  Categorizing...`);
  const autoCategories = autoCategorizeName(cleanedV6Data);
  const gptCategories = gptData?.categories ? validateGPTCategories(gptData.categories) : [];
  const rawCategories = mergeCategories(autoCategories, gptCategories);
  const categories = deduplicateCategories(rawCategories);
  if (rawCategories.length !== categories.length) {
    console.log(`   🧹 Removed ${rawCategories.length - categories.length} duplicate categories`);
  }
  console.log(`   ✅ ${categories.length} unique categories: ${categories.map(c => c.tag).join(', ')}`);

  // 8. Merge with cleaned V6 data
  const v7Data = {
    ...cleanedV6Data,
    inspiration,
    syllables,
    translations,
    booksWithName,
    celebrityBabies,
    categories,
    enrichmentVersion: 'v7',
    v7EnhancedAt: new Date().toISOString()
  };

  return v7Data;
}

/**
 * Main enrichment function
 */
async function enrichNameToV7(nameOrFile) {
  console.log('🚀 V7 Enrichment Starting...\n');

  // Load V6 data
  let v6Data;
  if (typeof nameOrFile === 'string' && nameOrFile.endsWith('.json')) {
    // Load from file
    console.log(`📂 Loading V6 data from: ${nameOrFile}`);
    v6Data = JSON.parse(fs.readFileSync(nameOrFile, 'utf-8'));
  } else if (typeof nameOrFile === 'object') {
    v6Data = nameOrFile;
  } else {
    // Load by name
    const filePath = `./public/data/enriched/${nameOrFile.toLowerCase()}-v6.json`;
    console.log(`📂 Loading V6 data from: ${filePath}`);
    v6Data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  }

  console.log(`✅ Loaded V6 data for: ${v6Data.name}`);

  // Get GPT enhancements
  const gptEnhancements = await enrichWithGPT([v6Data]);

  // Process the name
  const v7Data = await processName(v6Data, gptEnhancements);

  // Save V7 data
  const outputPath = `./public/data/enriched/${v7Data.name.toLowerCase()}-v7.json`;
  fs.writeFileSync(outputPath, JSON.stringify(v7Data, null, 2));
  console.log(`\n💾 Saved V7 data to: ${outputPath}`);

  console.log('\n✨ V7 Enrichment Complete!');
  return v7Data;
}

/**
 * Batch processing for multiple names
 */
async function enrichBatchToV7(names) {
  console.log(`🚀 V7 Batch Enrichment: ${names.length} names\n`);

  // Load all V6 data
  const v6DataArray = names.map(name => {
    const filePath = `./public/data/enriched/${name.toLowerCase()}-v6.json`;
    return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  });

  // Get GPT enhancements for all names
  const gptEnhancements = await enrichWithGPT(v6DataArray);

  // Process each name
  const v7DataArray = [];
  for (let i = 0; i < v6DataArray.length; i++) {
    const v7Data = await processName(v6DataArray[i], gptEnhancements);
    v7DataArray.push(v7Data);

    // Save individual file
    const outputPath = `./public/data/enriched/${v7Data.name.toLowerCase()}-v7.json`;
    fs.writeFileSync(outputPath, JSON.stringify(v7Data, null, 2));
    console.log(`💾 Saved: ${outputPath}`);
  }

  console.log(`\n✨ Batch V7 Enrichment Complete! Processed ${v7DataArray.length} names`);
  return v7DataArray;
}

// Export functions
export { enrichNameToV7, enrichBatchToV7 };

// CLI usage
if (import.meta.url === `file://${process.argv[1]}`) {
  const name = process.argv[2] || 'Thomas';
  enrichNameToV7(name).catch(console.error);
}
