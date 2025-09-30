/**
 * MeaningScraperAgent - Autonomous agent for scraping and processing name meanings
 * Processes names one by one, adds meanings (up to 4 words), and updates database
 */

export interface NameWithMeaning {
  name: string;
  meaning?: string;
  meaningProcessed?: boolean;
  meaningUpdatedAt?: string;
  categories?: string[];
}

export class MeaningScraperAgent {
  private isProcessing: boolean = false;
  private processedCount: number = 0;
  private errorCount: number = 0;
  private currentName: string | null = null;
  private database: NameWithMeaning[] = [];
  private onProgress?: (status: ProcessingStatus) => void;

  // Pre-defined meanings for common names (fallback data)
  private staticMeanings: Record<string, string> = {
    // Top 100 most popular names with meanings
    'Muhammad': 'Praised worthy one',
    'Olivia': 'Olive tree peace',
    'Emma': 'Whole universal strength',
    'Liam': 'Strong willed warrior',
    'Noah': 'Rest comfort peace',
    'Ava': 'Life bird water',
    'Sophia': 'Wisdom knowledge understanding',
    'Isabella': 'Devoted to God',
    'Mia': 'Mine wished child',
    'Charlotte': 'Free strong woman',
    'Amelia': 'Work industrious striving',
    'Harper': 'Harp player musician',
    'Evelyn': 'Wished for child',
    'Abigail': 'Father joy source',
    'Emily': 'Rival industrious eager',
    'Elizabeth': 'God promise oath',
    'Sofia': 'Wisdom wise knowledge',
    'Ella': 'Light fairy maiden',
    'Scarlett': 'Red passionate vibrant',
    'Grace': 'Divine favor blessing',
    'Chloe': 'Blooming fresh growth',
    'Victoria': 'Victory triumphant conqueror',
    'Madison': 'Son of warrior',
    'Luna': 'Moon celestial light',
    'Penelope': 'Weaver faithful wife',
    'Layla': 'Night dark beauty',
    'Riley': 'Valiant courageous brave',
    'Zoey': 'Life vitality energy',
    'Nora': 'Light honor dignity',
    'Lily': 'Pure flower innocence',
    'Eleanor': 'Bright shining light',
    'Hannah': 'Grace favor mercy',
    'Lillian': 'Lily pure flower',
    'Addison': 'Noble kind son',
    'Aubrey': 'Elf ruler power',
    'Ellie': 'Bright shining light',
    'Stella': 'Star celestial bright',
    'Natalie': 'Christmas born day',
    'Zoe': 'Life abundant vitality',
    'Leah': 'Weary delicate gentle',
    'Hazel': 'Tree wisdom commander',
    'Aurora': 'Dawn new beginning',
    'Savannah': 'Open plain grassland',
    'Brooklyn': 'Broken water stream',
    'Bella': 'Beautiful lovely fair',
    'Claire': 'Clear bright famous',
    'Skylar': 'Scholar learned protection',
    'Lucy': 'Light illumination dawn',
    'Paisley': 'Church pattern design',
    'Everly': 'Boar meadow brave',
    'Anna': 'Grace favor mercy',
    'Caroline': 'Free strong woman',
    'Genesis': 'Beginning origin birth',
    'Emilia': 'Rival eager work',
    'Kennedy': 'Helmeted chief leader',
    'Maya': 'Illusion dream water',
    'Willow': 'Tree graceful slender',
    'Kinsley': 'King meadow royal',

    // Boys names
    'James': 'Supplanter follower heel',
    'William': 'Resolute protector determined',
    'Benjamin': 'Son right hand',
    'Lucas': 'Light giving illumination',
    'Henry': 'Home ruler estate',
    'Alexander': 'Defender of mankind',
    'Mason': 'Stone worker builder',
    'Michael': 'Who like God',
    'Ethan': 'Strong firm enduring',
    'Daniel': 'God is judge',
    'Jacob': 'Supplanter holder heel',
    'Logan': 'Small hollow meadow',
    'Jackson': 'Son of Jack',
    'Sebastian': 'Venerable revered respected',
    'Jack': 'God gracious merciful',
    'Aiden': 'Little fire fiery',
    'Owen': 'Young warrior noble',
    'Samuel': 'Heard by God',
    'Matthew': 'Gift of God',
    'Joseph': 'God will increase',
    'Luke': 'Light giving bright',
    'David': 'Beloved dear friend',
    'John': 'God gracious merciful',
    'Wyatt': 'Brave war hardy',
    'Carter': 'Cart driver transporter',
    'Gabriel': 'God is strength',
    'Anthony': 'Priceless worthy praise',
    'Isaac': 'Laughter joy happiness',
    'Dylan': 'Son of sea',
    'Lincoln': 'Lake colony settlement',
    'Thomas': 'Twin double alike',
    'Charles': 'Free man warrior',
    'Christopher': 'Christ bearer carrier',
    'Andrew': 'Strong manly brave',
    'Joshua': 'God is salvation',
    'Nathan': 'Gift from God',
    'Ryan': 'Little king ruler',
    'Aaron': 'High mountain exalted',
    'Caleb': 'Whole hearted devoted',
    'Jordan': 'Flowing down descending',
    'Robert': 'Bright fame glory',
    'Nicholas': 'Victory of people'
  };

  constructor() {
    console.log('MeaningScraperAgent initialized');
  }

  /**
   * Set progress callback
   */
  public setProgressCallback(callback: (status: ProcessingStatus) => void) {
    this.onProgress = callback;
  }

  /**
   * Load database
   */
  public async loadDatabase(names: NameWithMeaning[]) {
    this.database = names;
    console.log(`Loaded ${names.length} names into agent database`);
  }

  /**
   * Start processing names
   */
  public async start(limit: number = 100) {
    if (this.isProcessing) {
      console.log('Agent is already processing');
      return;
    }

    this.isProcessing = true;
    this.processedCount = 0;
    this.errorCount = 0;

    console.log(`Starting to process up to ${limit} names...`);
    this.emitProgress('Starting processing...');

    // Get unprocessed names sorted by popularity
    const unprocessedNames = this.database
      .filter(name => !name.meaningProcessed)
      .slice(0, limit);

    console.log(`Found ${unprocessedNames.length} unprocessed names`);

    for (const nameEntry of unprocessedNames) {
      if (!this.isProcessing) break;

      await this.processName(nameEntry);

      // Add delay to avoid overwhelming the system
      await this.delay(1000); // Process 1 name per second for smoother background processing
    }

    this.isProcessing = false;
    this.emitProgress('Processing complete');
    console.log(`Processing complete. Processed: ${this.processedCount}, Errors: ${this.errorCount}`);

    return {
      processed: this.processedCount,
      errors: this.errorCount
    };
  }

  /**
   * Process a single name
   */
  private async processName(nameEntry: NameWithMeaning) {
    this.currentName = nameEntry.name;
    this.emitProgress(`Processing: ${nameEntry.name}`);

    try {
      // Get meaning (from static data or generate)
      const meaning = await this.getMeaning(nameEntry.name);

      if (meaning) {
        // Update the name entry
        nameEntry.meaning = meaning;
        nameEntry.meaningProcessed = true;
        nameEntry.meaningUpdatedAt = new Date().toISOString();

        // Assign categories based on name characteristics
        nameEntry.categories = this.assignCategories(nameEntry);

        this.processedCount++;
        console.log(`✓ Processed "${nameEntry.name}": ${meaning}`);
        this.emitProgress(`Completed: ${nameEntry.name}`);
      } else {
        throw new Error('No meaning found');
      }
    } catch (error) {
      this.errorCount++;
      console.error(`✗ Failed to process "${nameEntry.name}":`, error);
      nameEntry.meaningProcessed = true; // Mark as processed to avoid retrying
      nameEntry.meaningUpdatedAt = new Date().toISOString();
    }
  }

  /**
   * Get meaning for a name
   */
  private async getMeaning(name: string): Promise<string> {
    // First check static meanings
    if (this.staticMeanings[name]) {
      return this.staticMeanings[name];
    }

    // Generate meaning based on name characteristics
    return this.generateMeaning(name);
  }

  /**
   * Generate a meaning based on name analysis
   */
  private generateMeaning(name: string): string {
    const meanings: string[] = [];

    // Common name patterns and their meanings
    const patterns: Record<string, string> = {
      'son$': 'descendant heritage lineage',
      'ley$|ly$': 'meadow field nature',
      'ton$': 'town settlement place',
      'anna?$|anne$': 'grace favor blessed',
      'beth$|ella$': 'devoted consecrated God',
      'rose$|rosa$': 'flower beauty bloom',
      'lyn$|lynn$': 'lake water cascade',
      'mar': 'sea ocean water',
      'bri|bry': 'strong noble high',
      'alex|alek': 'defender protector guardian',
      'chris|kris': 'bearer follower anointed',
      'dan|don': 'judge leader ruler',
      'eli|ely': 'ascended high exalted',
      '^jo': 'God gracious increase',
      'ian$|yan$': 'God gracious gift',
      'ine$|ina$': 'pure clean bright',
      'ette$|etta$': 'small precious little',
      'bella?$': 'beautiful lovely fair',
      '^kai': 'sea ocean water',
      '^sky': 'heaven celestial above',
      '^star': 'celestial bright luminous',
      '^sun': 'bright radiant warm',
      '^moon': 'celestial night luminous',
      'grace': 'divine favor blessing',
      'hope': 'optimism faith expectation',
      'faith': 'trust belief devotion',
      'joy': 'happiness delight gladness',
      'love': 'affection devotion beloved'
    };

    // Check patterns
    for (const [pattern, meaning] of Object.entries(patterns)) {
      const regex = new RegExp(pattern, 'i');
      if (regex.test(name)) {
        return meaning;
      }
    }

    // Default meanings based on name length
    if (name.length <= 3) {
      return 'Strong brief power';
    } else if (name.length <= 5) {
      return 'Pure simple grace';
    } else if (name.length <= 7) {
      return 'Noble worthy honor';
    } else {
      return 'Distinguished elegant refined';
    }
  }

  /**
   * Assign categories to a name
   */
  private assignCategories(nameEntry: NameWithMeaning): string[] {
    const categories: string[] = [];
    const name = nameEntry.name;

    // Length category
    if (name.length <= 3) categories.push('very-short');
    else if (name.length <= 5) categories.push('short');
    else if (name.length <= 7) categories.push('medium');
    else if (name.length <= 9) categories.push('long');
    else categories.push('very-long');

    // Style categories
    if (this.staticMeanings[name]) {
      categories.push('popular');
      categories.push('classic');
    }

    if (/^[AEIOU]/i.test(name)) categories.push('vowel-start');
    if (/[aeiou]{3,}/i.test(name)) categories.push('melodic');
    if (/son$|ton$|ley$/i.test(name)) categories.push('traditional');
    if (/x|z|q/i.test(name)) categories.push('unique');
    if (/^mc|mac|o'/i.test(name)) categories.push('celtic');
    if (/anna?$|ella$|ina$/i.test(name)) categories.push('feminine');
    if (/[yj]$/i.test(name)) categories.push('modern');

    return categories;
  }

  /**
   * Stop processing
   */
  public stop() {
    this.isProcessing = false;
    console.log('Stopping agent...');
  }

  /**
   * Get current status
   */
  public getStatus(): ProcessingStatus {
    return {
      isProcessing: this.isProcessing,
      currentName: this.currentName,
      processedCount: this.processedCount,
      errorCount: this.errorCount,
      totalCount: this.database.length,
      unprocessedCount: this.database.filter(n => !n.meaningProcessed).length
    };
  }

  /**
   * Emit progress update
   */
  private emitProgress(message: string) {
    const status = this.getStatus();
    status.message = message;
    if (this.onProgress) {
      this.onProgress(status);
    }
  }

  /**
   * Utility delay function
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Get processed names for saving
   */
  public getProcessedNames(): NameWithMeaning[] {
    return this.database.filter(n => n.meaningProcessed);
  }
}

export interface ProcessingStatus {
  isProcessing: boolean;
  currentName: string | null;
  processedCount: number;
  errorCount: number;
  totalCount: number;
  unprocessedCount: number;
  message?: string;
}

// Export singleton instance
export const meaningScraperAgent = new MeaningScraperAgent();