/**
 * Meaning Service - Manages name meanings and categories
 * Integrates with MeaningScraperAgent for background processing
 */

import { meaningScraperAgent } from '../agents/MeaningScraperAgent';

export interface NameMeaning {
  name: string;
  meaning?: string;
  meaningProcessed?: boolean;
  meaningUpdatedAt?: string;
  categories?: string[];
}

class MeaningService {
  private meanings: Map<string, NameMeaning> = new Map();
  private isInitialized: boolean = false;
  private storageKey = 'nameMeanings_v1';
  private databaseUpdateCallback?: (updatedNames: NameMeaning[]) => void;
  private autoProcessing: boolean = true;
  private processingInterval?: NodeJS.Timeout;

  constructor() {
    this.loadFromStorage();
  }

  /**
   * Initialize the service with names
   */
  public async initialize(names: any[]) {
    console.log('Initializing meaning service...');

    // Convert names to NameMeaning format
    const nameMeanings: NameMeaning[] = names.map(name => {
      const existing = this.meanings.get(name.name);
      return {
        name: name.name,
        meaning: existing?.meaning || name.meaning,
        meaningProcessed: existing?.meaningProcessed || false,
        meaningUpdatedAt: existing?.meaningUpdatedAt,
        categories: existing?.categories || []
      };
    });

    // Load into agent
    await meaningScraperAgent.loadDatabase(nameMeanings);

    // Store in local map
    nameMeanings.forEach(nm => {
      this.meanings.set(nm.name, nm);
    });

    this.isInitialized = true;
    console.log(`Meaning service initialized with ${nameMeanings.length} names`);

    // Start background processing
    this.startBackgroundProcessing();

    // Auto-start processing if not already running
    if (this.autoProcessing && !meaningScraperAgent.getStatus().isProcessing) {
      setTimeout(() => this.startProcessing(100), 2000); // Start after 2 seconds
    }
  }

  /**
   * Start automatic background processing
   */
  private startBackgroundProcessing() {
    // Check every 5 seconds if we should process more names
    this.processingInterval = setInterval(() => {
      const status = meaningScraperAgent.getStatus();

      // If not processing and there are unprocessed names, start processing
      if (!status.isProcessing && status.unprocessedCount > 0 && this.isInitialized && this.autoProcessing) {
        console.log('Auto-starting background processing...');
        this.startProcessing(10); // Process 10 names at a time
      }
    }, 5000);
  }

  /**
   * Set callback for database updates
   */
  public setDatabaseUpdateCallback(callback: (updatedNames: NameMeaning[]) => void) {
    this.databaseUpdateCallback = callback;
  }

  /**
   * Start processing meanings for top names
   */
  public async startProcessing(limit: number = 100) {
    if (!this.isInitialized) {
      console.error('Service not initialized');
      return;
    }

    // Set up progress callback
    meaningScraperAgent.setProgressCallback((status) => {
      console.log(`Background processing: ${status.message} (${status.processedCount}/${limit})`);

      // Save progress and notify about updates
      if (status.processedCount > 0) {
        this.saveProgress();

        // Notify about database updates
        if (this.databaseUpdateCallback) {
          const updatedNames = Array.from(this.meanings.values())
            .filter(n => n.meaningProcessed);
          this.databaseUpdateCallback(updatedNames);
        }
      }
    });

    // Start processing
    const result = await meaningScraperAgent.start(limit);

    // Save final results
    this.saveProgress();

    return result;
  }

  /**
   * Save processing progress
   */
  private saveProgress() {
    const processedNames = meaningScraperAgent.getProcessedNames();

    // Update local map
    processedNames.forEach(name => {
      this.meanings.set(name.name, name);
    });

    // Save to localStorage
    this.saveToStorage();
  }

  /**
   * Get meaning for a specific name
   */
  public getMeaning(name: string): NameMeaning | undefined {
    return this.meanings.get(name);
  }

  /**
   * Get all meanings
   */
  public getAllMeanings(): NameMeaning[] {
    return Array.from(this.meanings.values());
  }

  /**
   * Get processing status
   */
  public getStatus() {
    return meaningScraperAgent.getStatus();
  }

  /**
   * Stop processing
   */
  public stopProcessing() {
    meaningScraperAgent.stop();
    this.saveProgress();
  }

  /**
   * Save to localStorage
   */
  private saveToStorage() {
    try {
      const data = Array.from(this.meanings.values());
      localStorage.setItem(this.storageKey, JSON.stringify(data));
      console.log(`Saved ${data.length} meanings to storage`);
    } catch (error) {
      console.error('Failed to save meanings:', error);
    }
  }

  /**
   * Load from localStorage
   */
  private loadFromStorage() {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        const data: NameMeaning[] = JSON.parse(stored);
        data.forEach(nm => {
          this.meanings.set(nm.name, nm);
        });
        console.log(`Loaded ${data.length} meanings from storage`);
      }
    } catch (error) {
      console.error('Failed to load meanings:', error);
    }
  }

  /**
   * Clear all meanings (for testing)
   */
  public clearMeanings() {
    this.meanings.clear();
    localStorage.removeItem(this.storageKey);
    console.log('Cleared all meanings');
  }

  /**
   * Get categories for filtering
   */
  public getAvailableCategories(): Record<string, string[]> {
    return {
      length: ['very-short', 'short', 'medium', 'long', 'very-long'],
      style: ['popular', 'classic', 'traditional', 'modern', 'unique'],
      features: ['vowel-start', 'melodic', 'celtic', 'feminine']
    };
  }

  /**
   * Filter names by categories
   */
  public filterByCategories(names: any[], categories: string[]): any[] {
    if (categories.length === 0) return names;

    return names.filter(name => {
      const meaning = this.meanings.get(name.name);
      if (!meaning || !meaning.categories) return false;

      // Check if name has at least one of the selected categories
      return categories.some(cat => meaning.categories?.includes(cat));
    });
  }
}

// Export singleton instance
export const meaningService = new MeaningService();
export default meaningService;