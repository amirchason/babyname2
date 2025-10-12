/**
 * Generate Updated themedLists.ts
 *
 * This script creates a complete themedLists.ts file with all the curated names
 */

const fs = require('fs');
const path = require('path');

// Load curated lists
const curatedLists = JSON.parse(fs.readFileSync('themed-lists-curated.json', 'utf8'));

// Helper to format name arrays (10 names per line)
const formatNameArray = (names) => {
  const lines = [];
  for (let i = 0; i < names.length; i += 10) {
    const chunk = names.slice(i, i + 10);
    const line = chunk.map(n => `'${n}'`).join(', ');
    lines.push(`        ${line}${i + 10 < names.length ? ',' : ''}`);
  }
  return lines.join('\n');
};

// Generate the complete TypeScript file content
const generateFile = () => {
  const content = `import { BabyName } from '../services/nameService';

export type ListCategory = 'origin' | 'meaning' | 'style' | 'theme';

export interface ThemedList {
  id: string;
  title: string;
  description: string;
  emoji: string;
  category: ListCategory;
  filterCriteria: {
    origins?: string[];
    meaningKeywords?: string[];
    tags?: string[];
    maxLength?: number;
    minLength?: number;
    syllables?: number;
    specificNames?: string[];
    customFilter?: (name: BabyName) => boolean;
  };
}

export const themedLists: ThemedList[] = [
  // ORIGIN CATEGORY (8 lists)
  {
    id: 'irish-celtic',
    title: 'Irish & Celtic Names',
    description: 'Beautiful names from Ireland and Celtic heritage with rich history',
    emoji: '🍀',
    category: 'origin',
    filterCriteria: {
      origins: ['Irish', 'Celtic', 'Gaelic', 'Scottish'],
      specificNames: [
${formatNameArray(curatedLists['irish-celtic'])}
      ],
    },
  },
  {
    id: 'italian',
    title: 'Italian Names',
    description: 'Romantic and melodic names from Italy',
    emoji: '🇮🇹',
    category: 'origin',
    filterCriteria: {
      origins: ['Italian'],
      specificNames: [
${formatNameArray(curatedLists['italian'])}
      ],
    },
  },
  {
    id: 'greek',
    title: 'Greek Names',
    description: 'Classic names from Greek mythology and history',
    emoji: '🏛️',
    category: 'origin',
    filterCriteria: {
      origins: ['Greek'],
      specificNames: [
${formatNameArray(curatedLists['greek'])}
      ],
    },
  },
  {
    id: 'hebrew-biblical',
    title: 'Hebrew & Biblical Names',
    description: 'Timeless religious names with deep spiritual meaning',
    emoji: '✡️',
    category: 'origin',
    filterCriteria: {
      origins: ['Hebrew'],
      tags: ['biblical', 'religious'],
      specificNames: [
${formatNameArray(curatedLists['hebrew-biblical'])}
      ],
    },
  },
  {
    id: 'french',
    title: 'French Names',
    description: 'Elegant and sophisticated names from France',
    emoji: '🇫🇷',
    category: 'origin',
    filterCriteria: {
      origins: ['French'],
      specificNames: [
${formatNameArray(curatedLists['french'])}
      ],
    },
  },
  {
    id: 'spanish-latin',
    title: 'Spanish & Latin Names',
    description: 'Warm and vibrant names from Spanish and Latin cultures',
    emoji: '🌶️',
    category: 'origin',
    filterCriteria: {
      origins: ['Spanish', 'Latin'],
      specificNames: [
${formatNameArray(curatedLists['spanish-latin'])}
      ],
    },
  },
  {
    id: 'japanese',
    title: 'Japanese Names',
    description: 'Unique Eastern names with beautiful meanings',
    emoji: '🌸',
    category: 'origin',
    filterCriteria: {
      origins: ['Japanese'],
      specificNames: [
${formatNameArray(curatedLists['japanese'])}
      ],
    },
  },
  {
    id: 'arabic',
    title: 'Arabic Names',
    description: 'Beautiful names with profound meanings from Arabic culture',
    emoji: '🌙',
    category: 'origin',
    filterCriteria: {
      origins: ['Arabic'],
      specificNames: [
${formatNameArray(curatedLists['arabic'])}
      ],
    },
  },

  // MEANING CATEGORY (7 lists)
  {
    id: 'meaning-light',
    title: 'Names Meaning "Light"',
    description: 'Names symbolizing hope, brightness, and illumination',
    emoji: '💡',
    category: 'meaning',
    filterCriteria: {
      meaningKeywords: ['light', 'bright', 'shine', 'radiant', 'luminous', 'glow'],
      specificNames: [
${formatNameArray(curatedLists['meaning-light'])}
      ],
    },
  },
  {
    id: 'meaning-strength',
    title: 'Names Meaning "Strength"',
    description: 'Powerful names representing courage and might',
    emoji: '💪',
    category: 'meaning',
    filterCriteria: {
      meaningKeywords: ['strong', 'strength', 'powerful', 'mighty', 'warrior', 'power'],
      specificNames: [
${formatNameArray(curatedLists['meaning-strength'])}
      ],
    },
  },
  {
    id: 'meaning-wisdom',
    title: 'Names Meaning "Wisdom"',
    description: 'Names representing intelligence and knowledge',
    emoji: '🦉',
    category: 'meaning',
    filterCriteria: {
      meaningKeywords: ['wise', 'wisdom', 'intelligent', 'sage', 'knowledgeable', 'learned'],
      specificNames: [
${formatNameArray(curatedLists['meaning-wisdom'])}
      ],
    },
  },
  {
    id: 'meaning-joy',
    title: 'Names Meaning "Joy"',
    description: 'Cheerful names radiating happiness and positivity',
    emoji: '😊',
    category: 'meaning',
    filterCriteria: {
      meaningKeywords: ['joy', 'happy', 'cheerful', 'delight', 'bliss', 'merry'],
      specificNames: [
${formatNameArray(curatedLists['meaning-joy'])}
      ],
    },
  },
  {
    id: 'meaning-love',
    title: 'Names Meaning "Love"',
    description: 'Romantic names symbolizing affection and devotion',
    emoji: '❤️',
    category: 'meaning',
    filterCriteria: {
      meaningKeywords: ['love', 'beloved', 'affection', 'dear', 'cherished', 'adored'],
      specificNames: [
${formatNameArray(curatedLists['meaning-love'])}
      ],
    },
  },
  {
    id: 'meaning-brave',
    title: 'Names Meaning "Brave"',
    description: 'Courageous names representing valor and bravery',
    emoji: '🦁',
    category: 'meaning',
    filterCriteria: {
      meaningKeywords: ['brave', 'courage', 'valor', 'fearless', 'bold', 'heroic'],
      specificNames: [
${formatNameArray(curatedLists['meaning-brave'])}
      ],
    },
  },
  {
    id: 'meaning-peace',
    title: 'Names Meaning "Peace"',
    description: 'Serene names representing calm and tranquility',
    emoji: '☮️',
    category: 'meaning',
    filterCriteria: {
      meaningKeywords: ['peace', 'calm', 'tranquil', 'serene', 'peaceful', 'harmony'],
      specificNames: [
${formatNameArray(curatedLists['meaning-peace'])}
      ],
    },
  },

  // STYLE CATEGORY (8 lists)
  {
    id: 'vintage-classic',
    title: 'Vintage Classics',
    description: 'Timeless names with old-world charm and elegance',
    emoji: '📜',
    category: 'style',
    filterCriteria: {
      tags: ['vintage', 'classic', 'traditional'],
      specificNames: [
${formatNameArray(curatedLists['vintage-classic'])}
      ],
      customFilter: (name: BabyName) => {
        // Names that feel vintage/classic (pre-1960s popularity)
        const vintagePrefixes = ['Ada', 'Bea', 'Cla', 'Del', 'Edith', 'Flor', 'Gra', 'Har', 'Ire', 'Jos'];
        return vintagePrefixes.some(prefix => name.name.startsWith(prefix));
      },
    },
  },
  {
    id: 'modern-trendy',
    title: 'Modern & Trendy',
    description: 'Contemporary favorites popular in recent years',
    emoji: '✨',
    category: 'style',
    filterCriteria: {
      tags: ['modern', 'trendy', 'contemporary'],
      specificNames: [
${formatNameArray(curatedLists['modern-trendy'])}
      ],
      customFilter: (name: BabyName) => {
        // Check for modern suffixes and patterns
        const modernPatterns = ['yn', 'ley', 'ayden', 'ella', 'lia', 'ayla'];
        return modernPatterns.some(pattern => name.name.toLowerCase().includes(pattern));
      },
    },
  },
  {
    id: 'one-syllable',
    title: 'One-Syllable Names',
    description: 'Short, sweet, and impactful single-syllable names',
    emoji: '1️⃣',
    category: 'style',
    filterCriteria: {
      syllables: 1,
      specificNames: [
${formatNameArray(curatedLists['one-syllable'])}
      ],
    },
  },
  {
    id: 'four-letter',
    title: 'Four-Letter Names',
    description: 'Perfect balance of brevity and beauty',
    emoji: '4️⃣',
    category: 'style',
    filterCriteria: {
      minLength: 4,
      maxLength: 4,
      specificNames: [
${formatNameArray(curatedLists['four-letter'])}
      ],
    },
  },
  {
    id: 'unique-rare',
    title: 'Unique & Rare Names',
    description: 'Stand-out choices that are beautifully uncommon',
    emoji: '💎',
    category: 'style',
    filterCriteria: {
      specificNames: [
${formatNameArray(curatedLists['unique-rare'])}
      ],
      customFilter: (name: BabyName) => {
        // Low popularity rank indicates rarity
        return name.popularity ? name.popularity > 1000 : true;
      },
    },
  },
  {
    id: 'royal-regal',
    title: 'Royal Names',
    description: 'Regal and sophisticated names fit for royalty',
    emoji: '👑',
    category: 'style',
    filterCriteria: {
      tags: ['royal', 'regal', 'noble'],
      meaningKeywords: ['king', 'queen', 'prince', 'princess', 'royal', 'noble', 'ruler', 'crown'],
      specificNames: [
        // British Royal Names
        'Elizabeth', 'Victoria', 'Charlotte', 'Diana', 'Anne', 'Margaret', 'Mary', 'Catherine',
        'Alexandra', 'Beatrice', 'Eugenie', 'Louise', 'Alice', 'Helena', 'Maud',
        'William', 'Henry', 'Charles', 'George', 'Edward', 'Philip', 'Louis', 'James',
        'Arthur', 'Albert', 'Frederick', 'Richard', 'John', 'David', 'Andrew', 'Alfred',
        // European Royal Names
        'Isabella', 'Sophia', 'Leonor', 'Ingrid', 'Astrid', 'Madeleine', 'Carl', 'Gustaf',
        'Christian', 'Frederik', 'Harald', 'Haakon', 'Philippe', 'Mathilde', 'Emmanuel',
        // French Royal Names
        'Louis', 'Marie', 'Antoinette', 'Adelaide', 'Josephine', 'Napoleon', 'Henri', 'Francis',
        'Claude', 'Isabelle', 'Marguerite', 'Blanche', 'Jeanne', 'Philippe', 'Charles',
        // Spanish Royal Names
        'Isabella', 'Ferdinand', 'Carlos', 'Felipe', 'Leonor', 'Sofia', 'Juan', 'Elena',
        // Victorian Era Names
        'Alfred', 'Leopold', 'Ernest', 'Augustus', 'Amelia', 'Caroline', 'Henrietta',
        // Classic Regal Names
        'Maximilian', 'Sebastian', 'Nathaniel', 'Theodore', 'Eleanor', 'Genevieve', 'Arabella',
        'Cordelia', 'Penelope', 'Rosalind', 'Benedict', 'Dominic', 'Edmund', 'Malcolm'
      ],
    },
  },
  {
    id: 'nature-inspired',
    title: 'Nature-Inspired Names',
    description: 'Names from the natural world',
    emoji: '🌿',
    category: 'style',
    filterCriteria: {
      tags: ['nature', 'botanical'],
      meaningKeywords: ['tree', 'forest', 'river', 'mountain', 'ocean', 'sky', 'earth', 'nature', 'plant', 'water', 'stone', 'wind', 'landscape'],
      specificNames: [
        // Water Names
        'River', 'Ocean', 'Lake', 'Brooks', 'Marina', 'Cove', 'Bay', 'Reef', 'Wade', 'Brooke',
        'Rain', 'Storm', 'Cloud', 'Misty', 'Delta', 'Harbor', 'Coral', 'Pearl', 'Cascade', 'Creek',
        // Mountain/Landscape Names
        'Sierra', 'Everest', 'Ridge', 'Summit', 'Canyon', 'Vale', 'Glen', 'Dell', 'Cliff', 'Peak',
        'Mesa', 'Stone', 'Rocky', 'Forrest', 'Field', 'Coast', 'Valley', 'Hill', 'Dale', 'Meadow',
        // Tree Names
        'Willow', 'Aspen', 'Rowan', 'Cedar', 'Oak', 'Ash', 'Birch', 'Pine', 'Elm', 'Linden',
        'Sequoia', 'Juniper', 'Maple', 'Acacia', 'Alder', 'Cypress', 'Hazel', 'Holly', 'Laurel',
        // Earth/Nature Names
        'Terra', 'Gaia', 'Eden', 'Sage', 'Clover', 'Fern', 'Ivy', 'Flora', 'Fauna', 'Sylvan',
        'Forest', 'Woods', 'Hunter', 'Autumn', 'Summer', 'Winter', 'Spring', 'Phoenix', 'Falcon',
        'Raven', 'Wren', 'Robin', 'Lark', 'Dove', 'Jay', 'Finch', 'Hawk', 'Wolf', 'Bear',
        'Fox', 'Leo', 'Lionel', 'Arden', 'Briar', 'Heath', 'Heather', 'Moss', 'Reed', 'Thorne'
      ],
    },
  },
  {
    id: 'celestial',
    title: 'Celestial Names',
    description: 'Names inspired by stars, moon, and sky',
    emoji: '⭐',
    category: 'style',
    filterCriteria: {
      meaningKeywords: ['star', 'moon', 'sky', 'sun', 'heaven', 'celestial', 'stellar', 'cosmic', 'constellation', 'planet', 'galaxy', 'astral'],
      specificNames: [
        // Moon Names
        'Luna', 'Selene', 'Diana', 'Artemis', 'Phoebe', 'Cynthia', 'Crescent', 'Lunar',
        // Star Names
        'Stella', 'Estelle', 'Esther', 'Star', 'Astra', 'Astrid', 'Astraea', 'Sidra', 'Starla', 'Starling',
        // Constellation & Planet Names
        'Orion', 'Leo', 'Lyra', 'Vega', 'Sirius', 'Altair', 'Rigel', 'Deneb', 'Castor', 'Pollux',
        'Andromeda', 'Cassiopeia', 'Perseus', 'Cygnus', 'Aquila', 'Draco', 'Phoenix', 'Atlas',
        // Sky & Heaven Names
        'Celeste', 'Celestia', 'Aurora', 'Nova', 'Solstice', 'Equinox', 'Zenith', 'Sky', 'Skye',
        'Heaven', 'Nevaeh', 'Cielo', 'Azure', 'Aether', 'Cosmos',
        // Sun Names
        'Sol', 'Soleil', 'Sunny', 'Helios', 'Apollo', 'Ra', 'Cyrus', 'Eliana', 'Samson',
        // Planetary Names
        'Venus', 'Mars', 'Jupiter', 'Saturn', 'Neptune', 'Mercury', 'Titan', 'Miranda', 'Rhea',
        // Other Celestial
        'Vesper', 'Bellatrix', 'Alcyone', 'Adhara', 'Alya', 'Mira', 'Celena', 'Elektra', 'Nashira',
        'Polaris', 'Lucifer', 'Comet', 'Meteor', 'Galaxy', 'Nebula', 'Eclipse', 'Solara'
      ],
    },
  },

  // THEME CATEGORY (7 lists)
  {
    id: 'virtue-names',
    title: 'Virtue Names',
    description: 'Names representing moral qualities and values',
    emoji: '🙏',
    category: 'theme',
    filterCriteria: {
      meaningKeywords: ['virtue', 'grace', 'honor', 'truth', 'goodness', 'pure', 'noble'],
      specificNames: [
        // Classic Theological Virtues
        'Faith', 'Hope', 'Charity', 'Grace',
        // Traditional Puritan Virtues
        'Patience', 'Prudence', 'Constance', 'Temperance', 'Verity', 'Mercy', 'Chastity',
        // Joy & Happiness Virtues
        'Joy', 'Felicity', 'Bliss', 'Merry', 'Glee', 'Delight',
        // Peace & Serenity Virtues
        'Serenity', 'Peace', 'Pax', 'Tranquility', 'Calm', 'Harmony',
        // Honor & Justice Virtues
        'Honor', 'Justice', 'Noble', 'True', 'Loyal', 'Valor',
        // Love & Affection Virtues
        'Amity', 'Amour', 'Caritas', 'Cordelia', 'Beloved',
        // Clarity & Wisdom Virtues
        'Clarity', 'Sage', 'Sophia', 'Prudence', 'Wisdom',
        // Modern Virtue Names
        'Trinity', 'Destiny', 'Haven', 'Journey', 'Legend', 'Blessing', 'Promise',
        'Genesis', 'Infinity', 'Liberty', 'Victory', 'Glory', 'Majesty',
        // Rising Modern Virtues
        'Irie', 'Ever', 'Hero', 'Brave', 'True', 'Noble', 'Royal', 'Regal',
        'Sincere', 'Earnest', 'Noble', 'Sterling', 'Valor', 'Honor', 'Justice',
        // Additional Traditional
        'Modesty', 'Piety', 'Providence', 'Obedience', 'Remember', 'Thankful', 'Beloved',
        'Cherish', 'Prosper', 'Rejoice', 'Truth', 'Unity', 'Welcome'
      ],
    },
  },
  {
    id: 'literary-names',
    title: 'Literary Names',
    description: 'Names from beloved books and classic literature',
    emoji: '📚',
    category: 'theme',
    filterCriteria: {
      tags: ['literary'],
      specificNames: [
        // Shakespeare
        'Juliet', 'Romeo', 'Ophelia', 'Hamlet', 'Cordelia', 'Desdemona', 'Portia', 'Miranda',
        'Rosalind', 'Viola', 'Beatrice', 'Benedict', 'Sebastian', 'Orlando', 'Puck',
        // Jane Austen
        'Darcy', 'Elizabeth', 'Emma', 'Jane', 'Elinor', 'Marianne', 'Fanny', 'Catherine',
        'Fitzwilliam', 'Bennett', 'Wickham', 'Knightley',
        // Harry Potter
        'Harry', 'Hermione', 'Luna', 'Ginny', 'Sirius', 'Remus', 'Albus', 'Severus',
        'Draco', 'Cedric', 'Neville', 'Ronald', 'James', 'Lily', 'Arthur', 'Molly',
        // Classic Literature
        'Atticus', 'Scout', 'Holden', 'Gatsby', 'Daisy', 'Scarlett', 'Rhett', 'Heathcliff',
        'Catherine', 'Jane', 'Rochester', 'Thornton', 'Margaret', 'Isabel', 'Dorothea',
        // Authors as Names
        'Austen', 'Bronte', 'Harper', 'Poe', 'Dickens', 'Wilde', 'Byron', 'Shelley',
        'Hemingway', 'Fitzgerald', 'Emerson', 'Hawthorne', 'Alcott', 'Louisa',
        // Dante & Italian Literature
        'Dante', 'Beatrice', 'Virgil', 'Paolo', 'Francesca',
        // Modern Literature
        'Katniss', 'Peeta', 'Hazel', 'Augustus', 'Eleanor', 'Park', 'Alaska', 'Miles',
        'Liesel', 'Liesl', 'Gregor', 'Bella', 'Edward', 'Anastasia',
        // Classic Characters
        'Alice', 'Dorothy', 'Wendy', 'Peter', 'Oliver', 'Pip', 'Estella', 'David',
        'Nicholas', 'Martin', 'Evangeline', 'Josephine', 'Theodore', 'Laurie', 'Amy'
      ],
    },
  },
  {
    id: 'gemstone-names',
    title: 'Gemstone Names',
    description: 'Precious and sparkling gemstone-inspired names',
    emoji: '💍',
    category: 'theme',
    filterCriteria: {
      meaningKeywords: ['gem', 'jewel', 'precious', 'stone', 'crystal'],
      specificNames: [
        // Classic Gemstone Names
        'Ruby', 'Pearl', 'Jade', 'Amber', 'Opal', 'Emerald', 'Sapphire', 'Diamond', 'Crystal',
        // Semi-Precious Stones
        'Jasper', 'Topaz', 'Beryl', 'Garnet', 'Onyx', 'Coral', 'Ivory', 'Jewel',
        // Unique Gemstone Names
        'Amethyst', 'Turquoise', 'Citrine', 'Peridot', 'Aquamarine', 'Alexandrite', 'Tanzanite',
        'Lapis', 'Agate', 'Carnelian', 'Chrysolite', 'Jacinth', 'Sardonyx', 'Chalcedony',
        // Names Meaning Pearl
        'Margaret', 'Margot', 'Margarita', 'Greta', 'Maisie', 'Meg', 'Peggy', 'Marguerite', 'Marit',
        // Names Meaning Jewel/Gem
        'Gemma', 'Jemma', 'Gem', 'Jewel', 'Bijou', 'Gema',
        // Emerald Variations
        'Esmeralda', 'Esme', 'Esmerelda',
        // Other Precious Names
        'Goldie', 'Sterling', 'Silver', 'Flint', 'Jett', 'Jet', 'Obsidian', 'Mica', 'Quartz',
        'Neel', 'Azure', 'Indigo', 'Scarlett', 'Crimson', 'Rose', 'Sienna'
      ],
    },
  },
  {
    id: 'flower-botanical',
    title: 'Flower & Botanical Names',
    description: 'Beautiful names from flowers and plants',
    emoji: '🌺',
    category: 'theme',
    filterCriteria: {
      tags: ['botanical', 'floral'],
      meaningKeywords: ['flower', 'bloom', 'blossom', 'petal', 'garden', 'botanical'],
      specificNames: [
        // Classic Flower Names
        'Lily', 'Rose', 'Iris', 'Violet', 'Daisy', 'Jasmine', 'Poppy', 'Dahlia', 'Flora', 'Magnolia', 'Azalea', 'Camellia',
        // Tree and Plant Names
        'Ivy', 'Holly', 'Hazel', 'Willow', 'Sage', 'Olive', 'Laurel', 'Juniper', 'Maple', 'Aspen', 'Rowan', 'Acacia',
        // Unique Flower Names
        'Briar', 'Posy', 'Tulip', 'Leilani', 'Cassia', 'Petal', 'Blossom', 'Marigold', 'Petunia', 'Zinnia',
        'Amaryllis', 'Anemone', 'Aster', 'Begonia', 'Calla', 'Clover', 'Daffodil', 'Delphine', 'Elowen',
        'Fern', 'Forsythia', 'Gardenia', 'Heather', 'Hyacinth', 'Indigo', 'Jonquil', 'Kalina', 'Lavender',
        'Lilac', 'Lotus', 'Marigold', 'Myrtle', 'Narcissa', 'Orchid', 'Pansy', 'Peony', 'Primrose',
        'Rosemary', 'Saffron', 'Tansy', 'Verbena', 'Wisteria', 'Yarrow', 'Zinnia',
        // Nature-Related Botanical
        'Meadow', 'Prairie', 'Birch', 'Cedar', 'Cypress', 'Linden', 'Sequoia', 'Sorrel',
        'Bryony', 'Celandine', 'Clematis', 'Clementine', 'Daphne', 'Fleur', 'Florian', 'Florina',
        'Jasper', 'Liana', 'Lotus', 'Marguerite', 'Mavis', 'Nerissa', 'Oceana', 'Petula',
        'Romy', 'Senna', 'Sienna', 'Sylvan', 'Thalia', 'Thistle', 'Vervain', 'Zinnia'
      ],
    },
  },
  {
    id: 'color-names',
    title: 'Color Names',
    description: 'Vibrant names inspired by colors',
    emoji: '🎨',
    category: 'theme',
    filterCriteria: {
      meaningKeywords: ['color', 'red', 'blue', 'green', 'white', 'black', 'gold', 'silver'],
      specificNames: [
        // Red Shades
        'Scarlett', 'Ruby', 'Rose', 'Crimson', 'Rosie', 'Roux', 'Rouge', 'Red', 'Cherry',
        'Coral', 'Russet', 'Auburn', 'Burgundy', 'Cerise', 'Garnet', 'Carmine',
        // Pink Shades
        'Pink', 'Rosalyn', 'Rosalie', 'Rosalind', 'Rosetta', 'Fuchsia', 'Magenta', 'Blush',
        // Orange Shades
        'Amber', 'Sienna', 'Siena', 'Coral', 'Ginger', 'Apricot', 'Peach', 'Tangerine',
        // Yellow/Gold Shades
        'Gold', 'Goldie', 'Golden', 'Marigold', 'Saffron', 'Aurelia', 'Amber', 'Honey',
        'Lemon', 'Sunny', 'Flax', 'Blonde', 'Xanthe', 'Orla', 'Zlata',
        // Green Shades
        'Jade', 'Olive', 'Emerald', 'Forest', 'Hunter', 'Sage', 'Mint', 'Clover',
        'Ivy', 'Fern', 'Moss', 'Viridian', 'Verdant', 'Verde', 'Kelly',
        // Blue Shades
        'Blue', 'Azure', 'Azura', 'Sky', 'Skye', 'Navy', 'Indigo', 'Cyan',
        'Cobalt', 'Sapphire', 'Cerulean', 'Ocean', 'Marina', 'Aqua', 'Teal',
        // Purple Shades
        'Violet', 'Lavender', 'Lilac', 'Plum', 'Amethyst', 'Mauve', 'Periwinkle', 'Orchid',
        'Iris', 'Viola', 'Indigo', 'Magenta', 'Fuchsia',
        // Brown Shades
        'Hazel', 'Auburn', 'Sienna', 'Umber', 'Russet', 'Chestnut', 'Sepia', 'Tawny',
        'Bruno', 'Marron', 'Mahogany',
        // White/Light Shades
        'Ivory', 'Pearl', 'Snow', 'Bianca', 'Blanche', 'Alba', 'Neve', 'Candida',
        'White', 'Frost', 'Crystal', 'Silver', 'Sterling', 'Luna',
        // Gray/Black Shades
        'Gray', 'Grey', 'Griselda', 'Ash', 'Slate', 'Charcoal', 'Onyx', 'Jet',
        'Ebony', 'Noir', 'Raven', 'Coal', 'Shadow', 'Slate', 'Steel'
      ],
    },
  },
  {
    id: 'musical-names',
    title: 'Musical Names',
    description: 'Harmonious names inspired by music',
    emoji: '🎵',
    category: 'theme',
    filterCriteria: {
      meaningKeywords: ['music', 'song', 'melody', 'harmony', 'rhythm', 'musical'],
      specificNames: [
        // Musical Terms
        'Aria', 'Harmony', 'Melody', 'Lyric', 'Cadence', 'Allegra', 'Sonata', 'Canon',
        'Chord', 'Octavia', 'Viola', 'Coda', 'Crescendo', 'Forte', 'Allegro', 'Adagio',
        // Instruments
        'Harper', 'Piper', 'Reed', 'Viola', 'Lyra', 'Harp', 'Oboe', 'Clavier', 'Cymbal',
        'Lute', 'Mandolin', 'Viol', 'Fife', 'Fiddle', 'Bell', 'Chime',
        // Musical Icons (Last Names as First Names)
        'Lennon', 'Hendrix', 'Bowie', 'Presley', 'Jagger', 'Dylan', 'Marley', 'Cobain',
        'Morrison', 'Joplin', 'Hendrix', 'Santana', 'Prince', 'Madonna', 'Cher',
        // Classical Composers
        'Mozart', 'Amadeus', 'Bach', 'Ludwig', 'Wolfgang', 'Johannes', 'Frederic', 'Franz',
        'Antonio', 'Vivaldi', 'Handel', 'Haydn', 'Liszt', 'Chopin', 'Debussy',
        // Musical First Names
        'Elvis', 'Aretha', 'Ella', 'Billie', 'Nina', 'Chet', 'Miles', 'Duke', 'Quincy',
        'Etta', 'Otis', 'Marvin', 'Stevie', 'Whitney', 'Dolly', 'Johnny', 'Patsy',
        // Music-Related Names
        'Serenade', 'Symphony', 'Rhythm', 'Tempo', 'Beat', 'Jazz', 'Blues', 'Lyrical',
        'Carol', 'Psalter', 'Cantor', 'Singer', 'Chanson', 'Ballade', 'Rondo'
      ],
    },
  },
  {
    id: 'seasonal-names',
    title: 'Seasonal Names',
    description: 'Names representing the four seasons',
    emoji: '🍂',
    category: 'theme',
    filterCriteria: {
      meaningKeywords: ['season', 'spring', 'summer', 'autumn', 'fall', 'winter', 'month'],
      specificNames: [
        // Season Names
        'Summer', 'Autumn', 'Winter', 'Spring', 'Fall', 'Season',
        // Month Names
        'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August',
        'September', 'October', 'November', 'December',
        // Spring Names
        'Primavera', 'Blossom', 'Bloom', 'Flora', 'Lily', 'Violet', 'Iris', 'Rose',
        'Robin', 'Meadow', 'Rain', 'Verde', 'Avril', 'Mae', 'Maya',
        // Summer Names
        'Sol', 'Soleil', 'Sunny', 'Ray', 'Dawn', 'Marina', 'Ocean', 'Beach',
        'Azure', 'Sky', 'Phoenix', 'Sienna', 'Coral', 'Juli', 'Augustus',
        // Autumn/Fall Names
        'Amber', 'Auburn', 'Russet', 'Hazel', 'Sienna', 'Maple', 'Harvest',
        'Leaf', 'October', 'September', 'November', 'Goldie', 'Crimson',
        // Winter Names
        'Crystal', 'Snow', 'Frost', 'Blanche', 'Holly', 'Noel', 'Neve', 'Bianca',
        'Eira', 'Yuki', 'December', 'January', 'Solstice', 'Icicle', 'Glacier',
        // Celestial Seasonal
        'Aurora', 'Nova', 'Solstice', 'Equinox', 'Vernal', 'Estival', 'Autumnal',
        // Month Variations
        'Julius', 'Augusta', 'Octavia', 'Martina', 'Jana', 'Aprilia', 'Juni'
      ],
    },
  },
];

export const getCategoryLists = (category: ListCategory): ThemedList[] => {
  return themedLists.filter(list => list.category === category);
};

export const getListById = (id: string): ThemedList | undefined => {
  return themedLists.find(list => list.id === id);
};

export const categoryDisplayNames: Record<ListCategory, string> = {
  origin: 'Origin & Heritage',
  meaning: 'By Meaning',
  style: 'Name Styles',
  theme: 'Themed Collections',
};
`;

  return content;
};

// Generate and save the file
const outputPath = path.join(__dirname, 'src', 'data', 'themedLists.ts');
const content = generateFile();

fs.writeFileSync(outputPath, content);

console.log('✅ Generated themedLists.ts successfully!');
console.log(`   Location: ${outputPath}`);
console.log(`   Total size: ${(content.length / 1024).toFixed(2)} KB\n`);

// Summary
console.log('📊 SUMMARY:');
Object.entries(curatedLists).forEach(([id, names]) => {
  console.log(`   ${id}: ${names.length} names`);
});
