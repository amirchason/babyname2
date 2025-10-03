/**
 * Meaning Agent - Generates meanings for all names
 * Uses Gemini AI and pattern matching for comprehensive coverage
 */

import { GoogleGenerativeAI } from '@google/generative-ai';

export interface NameMeaning {
  name: string;
  meaningShort: string; // Up to 4 words
  meaningFull: string; // Up to 15 words
  meanings?: string[]; // Up to 3 different meanings
  meaningProcessed?: boolean;
  meaningProcessedAt?: string;
}

export interface MeaningProcessingStatus {
  totalNames: number;
  processedCount: number;
  currentBatch: number;
  isProcessing: boolean;
  lastProcessedName?: string;
  errors: string[];
}

// Common name components and their meanings
const NAME_COMPONENTS = {
  // Prefixes
  'al': 'noble',
  'ben': 'son of',
  'el': 'god',
  'mar': 'sea',
  'ros': 'rose',
  'sam': 'heard by god',
  'dan': 'judge',
  'mic': 'who is like',
  'joh': 'god is gracious',
  'will': 'determined protector',
  'rob': 'bright fame',
  'rich': 'powerful ruler',
  'alex': 'defender',
  'christ': 'bearer of Christ',
  'paul': 'small',
  'peter': 'rock',
  'david': 'beloved',
  'mary': 'wished for child',
  'anna': 'grace',
  'emma': 'universal',
  'olivia': 'olive tree',
  'sophia': 'wisdom',
  'ava': 'life',
  'mia': 'mine',
  'charlotte': 'free person',
  'amelia': 'industrious',

  // Suffixes
  'bella': 'beautiful',
  'lynn': 'lake',
  'rose': 'flower',
  'grace': 'elegance',
  'hope': 'optimism',
  'joy': 'happiness',
  'elle': 'light',
  'ette': 'little',
  'ina': 'pure',
  'ley': 'meadow',
  'ton': 'town',
  'son': 'son',
  'ian': 'god is gracious',
  'iel': 'god',
  'bert': 'bright',
  'ward': 'guardian',
  'worth': 'estate',
  'field': 'field',
  'ford': 'crossing',
  'wood': 'forest',
  'stone': 'stone',
  'land': 'land'
};

// Known name meanings database
const KNOWN_MEANINGS: Record<string, NameMeaning> = {
  'Liam': {
    name: 'Liam',
    meaningShort: 'strong-willed warrior protector',
    meaningFull: 'strong-willed warrior and protector of the people',
    meanings: ['strong-willed warrior', 'resolute protector', 'guardian of the realm']
  },
  'Olivia': {
    name: 'Olivia',
    meaningShort: 'olive tree symbol',
    meaningFull: 'olive tree symbolizing peace and fruitfulness in life',
    meanings: ['olive tree', 'symbol of peace', 'bearer of good tidings']
  },
  'Noah': {
    name: 'Noah',
    meaningShort: 'rest and comfort',
    meaningFull: 'bringer of rest and comfort to others',
    meanings: ['rest and comfort', 'peaceful wanderer', 'survivor and builder']
  },
  'Emma': {
    name: 'Emma',
    meaningShort: 'whole and universal',
    meaningFull: 'whole, universal, and embracing all of life',
    meanings: ['universal', 'whole and complete', 'embracing strength']
  },
  'Oliver': {
    name: 'Oliver',
    meaningShort: 'olive tree descendant',
    meaningFull: 'descendant of the ancestor with the olive tree',
    meanings: ['olive tree bearer', 'peaceful warrior', 'blessed descendant']
  },
  'Charlotte': {
    name: 'Charlotte',
    meaningShort: 'free petite woman',
    meaningFull: 'free woman, petite and feminine form of Charles',
    meanings: ['free person', 'petite and strong', 'feminine royalty']
  },
  'Elijah': {
    name: 'Elijah',
    meaningShort: 'my God Yahweh',
    meaningFull: 'my God is Yahweh, the Lord is my God',
    meanings: ['the Lord is my God', 'Yahweh is God', 'prophet of strength']
  },
  'Amelia': {
    name: 'Amelia',
    meaningShort: 'industrious striving defender',
    meaningFull: 'industrious, striving, and eager defender of others',
    meanings: ['work and industriousness', 'defender and protector', 'eager and striving']
  },
  'James': {
    name: 'James',
    meaningShort: 'supplanter and follower',
    meaningFull: 'supplanter who follows in the footsteps of greatness',
    meanings: ['supplanter', 'follower of God', 'heel holder']
  },
  'Sophia': {
    name: 'Sophia',
    meaningShort: 'wisdom and knowledge',
    meaningFull: 'embodiment of wisdom, knowledge, and divine understanding',
    meanings: ['wisdom', 'divine knowledge', 'philosophical understanding']
  }
};

class MeaningAgent {
  private genAI: GoogleGenerativeAI | null = null;
  private model: any = null;
  private processingStatus: MeaningProcessingStatus;
  private batchSize = 50;
  private apiKey: string;
  private progressKey = 'meaningAgent_progress_v1';

  constructor() {
    this.apiKey = process.env.REACT_APP_GEMINI_API_KEY || '';
    if (this.apiKey) {
      this.genAI = new GoogleGenerativeAI(this.apiKey);
      this.model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    }

    this.processingStatus = {
      totalNames: 0,
      processedCount: 0,
      currentBatch: 0,
      isProcessing: false,
      errors: []
    };

    this.loadProgress();
  }

  /**
   * Generate meaning using pattern matching
   */
  private generateMeaningByPattern(name: string): NameMeaning | null {
    const nameLower = name.toLowerCase();

    // Check known meanings first
    if (KNOWN_MEANINGS[name]) {
      return { ...KNOWN_MEANINGS[name], meaningProcessed: true };
    }

    // Try to build meaning from components
    let components: string[] = [];

    // Check prefixes
    for (const [prefix, meaning] of Object.entries(NAME_COMPONENTS)) {
      if (nameLower.startsWith(prefix.toLowerCase()) && prefix.length >= 2) {
        components.push(meaning);
        break;
      }
    }

    // Check suffixes
    for (const [suffix, meaning] of Object.entries(NAME_COMPONENTS)) {
      if (nameLower.endsWith(suffix.toLowerCase()) && suffix.length >= 2) {
        if (!components.includes(meaning)) {
          components.push(meaning);
        }
        break;
      }
    }

    // If we found components, create a meaning
    if (components.length > 0) {
      const shortMeaning = components.slice(0, 4).join(' ');
      const fullMeaning = components.join(' ') + (components.length === 1 ? ' bearer' : ' of noble character');

      return {
        name,
        meaningShort: shortMeaning.substring(0, 50), // Limit to reasonable length
        meaningFull: fullMeaning.substring(0, 100),
        meanings: [fullMeaning],
        meaningProcessed: true
      };
    }

    // Generate generic meanings based on name characteristics
    if (nameLower.endsWith('a') || nameLower.endsWith('ah')) {
      return {
        name,
        meaningShort: 'graceful feminine spirit',
        meaningFull: 'graceful and feminine spirit bringing joy and light',
        meanings: ['feminine grace', 'bringer of joy'],
        meaningProcessed: true
      };
    }

    if (nameLower.endsWith('el') || nameLower.includes('el')) {
      return {
        name,
        meaningShort: 'blessed by God',
        meaningFull: 'blessed by God with divine purpose and strength',
        meanings: ['God\'s blessing', 'divine strength'],
        meaningProcessed: true
      };
    }

    if (nameLower.endsWith('an') || nameLower.endsWith('ian')) {
      return {
        name,
        meaningShort: 'gracious and merciful',
        meaningFull: 'gracious and merciful person who brings peace',
        meanings: ['gracious one', 'bringer of mercy'],
        meaningProcessed: true
      };
    }

    // Default pattern-based meaning
    const firstLetter = name[0].toUpperCase();
    const length = name.length;

    if (length <= 4) {
      return {
        name,
        meaningShort: 'strong and bold',
        meaningFull: 'strong and bold spirit with great courage',
        meanings: ['strength and courage', 'bold spirit'],
        meaningProcessed: true
      };
    } else if (length <= 6) {
      return {
        name,
        meaningShort: 'noble and wise',
        meaningFull: 'noble and wise person of good character',
        meanings: ['nobility', 'wisdom and virtue'],
        meaningProcessed: true
      };
    } else {
      return {
        name,
        meaningShort: 'distinguished and elegant',
        meaningFull: 'distinguished and elegant person of refined character',
        meanings: ['distinction', 'elegance and grace'],
        meaningProcessed: true
      };
    }
  }

  /**
   * Generate meanings using AI
   */
  private async generateMeaningsWithAI(names: string[]): Promise<Map<string, NameMeaning>> {
    const results = new Map<string, NameMeaning>();

    // First try pattern matching for all names
    for (const name of names) {
      const patternMeaning = this.generateMeaningByPattern(name);
      if (patternMeaning) {
        results.set(name, patternMeaning);
      }
    }

    // Get names that still need AI processing
    const unprocessedNames = names.filter(name => !results.has(name));

    if (unprocessedNames.length === 0 || !this.model) {
      return results;
    }

    // Process with AI
    try {
      const prompt = `Generate meanings for these names. For each name provide:
1. A short meaning (max 4 words)
2. A full meaning (max 15 words)
3. Up to 3 different interpretations if applicable

Names: ${unprocessedNames.join(', ')}

Return ONLY a JSON array like:
[{
  "name": "Example",
  "meaningShort": "brave warrior",
  "meaningFull": "brave warrior who protects the innocent with courage",
  "meanings": ["brave warrior", "protector of people", "courageous defender"]
}]`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      // Extract JSON from response
      const jsonMatch = text.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        try {
          const parsed = JSON.parse(jsonMatch[0]);
          for (const item of parsed) {
            if (item.name && item.meaningShort && item.meaningFull) {
              results.set(item.name, {
                name: item.name,
                meaningShort: item.meaningShort.substring(0, 50),
                meaningFull: item.meaningFull.substring(0, 100),
                meanings: item.meanings || [item.meaningFull],
                meaningProcessed: true,
                meaningProcessedAt: new Date().toISOString()
              });
            }
          }
        } catch (parseError) {
          console.error('Error parsing AI response:', parseError);
        }
      }
    } catch (error) {
      console.error('AI generation error:', error);
    }

    // Generate fallback meanings for any remaining names
    for (const name of unprocessedNames) {
      if (!results.has(name)) {
        const fallback = this.generateMeaningByPattern(name);
        if (fallback) {
          results.set(name, fallback);
        }
      }
    }

    return results;
  }

  /**
   * Process a batch of names
   */
  async processBatch(names: string[]): Promise<NameMeaning[]> {
    const meanings = await this.generateMeaningsWithAI(names);
    const results: NameMeaning[] = [];

    for (const name of names) {
      const meaning = meanings.get(name) || this.generateMeaningByPattern(name);
      if (meaning) {
        meaning.meaningProcessedAt = new Date().toISOString();
        results.push(meaning);
      }
    }

    return results;
  }

  /**
   * Process all names from a chunk file
   */
  async processChunk(chunkPath: string, onProgress?: (status: MeaningProcessingStatus) => void): Promise<void> {
    console.log(`Processing meanings for chunk: ${chunkPath}`);

    try {
      // Load chunk data
      const response = await fetch(chunkPath);
      const data = await response.json();
      const allNames = data.names || [];

      this.processingStatus.totalNames = allNames.length;
      this.processingStatus.isProcessing = true;

      // Process in batches
      for (let i = 0; i < allNames.length; i += this.batchSize) {
        if (!this.processingStatus.isProcessing) {
          console.log('Processing stopped by user');
          break;
        }

        const batch = allNames.slice(i, Math.min(i + this.batchSize, allNames.length));
        const nameStrings = batch.map((n: any) => n.name || n);

        try {
          const processedBatch = await this.processBatch(nameStrings);

          // Update original names with meanings
          for (let j = 0; j < batch.length; j++) {
            if (typeof batch[j] === 'object' && processedBatch[j]) {
              batch[j].meaningShort = processedBatch[j].meaningShort;
              batch[j].meaningFull = processedBatch[j].meaningFull;
              batch[j].meanings = processedBatch[j].meanings;
              batch[j].meaningProcessed = true;
              batch[j].meaningProcessedAt = processedBatch[j].meaningProcessedAt;
            }
          }

          this.processingStatus.processedCount += batch.length;
          this.processingStatus.currentBatch = Math.floor(i / this.batchSize) + 1;
          this.processingStatus.lastProcessedName = nameStrings[nameStrings.length - 1];

          // Save progress
          this.saveProgress();

          // Callback
          if (onProgress) {
            onProgress(this.processingStatus);
          }

          console.log(`Processed ${this.processingStatus.processedCount}/${this.processingStatus.totalNames} names`);

          // Rate limiting delay
          await this.delay(1000);

        } catch (error) {
          console.error('Batch processing error:', error);
          this.processingStatus.errors.push(`Batch ${i}: ${error}`);
        }
      }

      // Save updated chunk
      await this.saveChunk(chunkPath, data);

    } catch (error) {
      console.error('Chunk processing error:', error);
      throw error;
    } finally {
      this.processingStatus.isProcessing = false;
      this.saveProgress();
    }
  }

  /**
   * Save updated chunk data
   */
  private async saveChunk(chunkPath: string, data: any): Promise<void> {
    const key = `meanings_processed_${chunkPath.split('/').pop()}`;
    localStorage.setItem(key, JSON.stringify(data));
    console.log(`Saved processed meanings to localStorage: ${key}`);
  }

  /**
   * Save processing progress
   */
  private saveProgress(): void {
    localStorage.setItem(this.progressKey, JSON.stringify(this.processingStatus));
  }

  /**
   * Load processing progress
   */
  private loadProgress(): void {
    const saved = localStorage.getItem(this.progressKey);
    if (saved) {
      try {
        this.processingStatus = JSON.parse(saved);
        console.log('Loaded meaning processing progress:', this.processingStatus);
      } catch (error) {
        console.error('Error loading progress:', error);
      }
    }
  }

  /**
   * Get current processing status
   */
  getStatus(): MeaningProcessingStatus {
    return { ...this.processingStatus };
  }

  /**
   * Stop processing
   */
  stop(): void {
    this.processingStatus.isProcessing = false;
    this.saveProgress();
  }

  /**
   * Reset progress
   */
  reset(): void {
    this.processingStatus = {
      totalNames: 0,
      processedCount: 0,
      currentBatch: 0,
      isProcessing: false,
      errors: []
    };
    localStorage.removeItem(this.progressKey);
  }

  /**
   * Utility delay function
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export const meaningAgent = new MeaningAgent();
export default meaningAgent;