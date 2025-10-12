/**
 * Unisex Identification Agent
 * Processes names to identify and mark unisex names based on gender distribution
 * Uses both statistical analysis and AI enhancement for cultural context
 */

import { NameEntry } from '../services/nameService';

export interface UnisexAnalysis {
  name: string;
  isUnisex: boolean;
  unisexScore: number; // 0-1 scale, where 0.5 is perfectly balanced
  confidence: number; // How confident we are in this classification
  reason?: string; // Why it's classified as unisex/gendered
}

class UnisexIdentificationAgent {
  private readonly UNISEX_THRESHOLD = 0.35; // 35% to 65% ratio
  private readonly STRONG_UNISEX_THRESHOLD = 0.45; // 45% to 55% ratio
  private readonly BATCH_SIZE = 50;
  private processingQueue: NameEntry[] = [];
  private isProcessing = false;
  private processedNames = new Map<string, UnisexAnalysis>();
  private storageKey = 'unisexAnalysis_v1';
  private progressCallback?: (processed: number, total: number) => void;
  private updateCallback?: (updatedNames: UnisexAnalysis[]) => void;

  // Known unisex names for quick identification (cultural knowledge)
  private readonly KNOWN_UNISEX_NAMES = new Set([
    'alex', 'jordan', 'taylor', 'morgan', 'casey', 'riley', 'avery', 'jamie',
    'cameron', 'drew', 'dakota', 'sage', 'quinn', 'reese', 'rowan', 'finley',
    'hayden', 'emerson', 'river', 'phoenix', 'charlie', 'blake', 'parker',
    'peyton', 'sawyer', 'remy', 'skyler', 'jesse', 'kai', 'robin', 'sam',
    'sydney', 'bailey', 'angel', 'kendall', 'micah', 'ash', 'august', 'jules'
  ]);

  constructor() {
    this.loadFromStorage();
  }

  /**
   * Load processed names from localStorage
   */
  private loadFromStorage() {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        const data = JSON.parse(stored);
        this.processedNames = new Map(data.entries || []);
        console.log(`Loaded ${this.processedNames.size} unisex analyses from storage`);
      }
    } catch (error) {
      console.error('Failed to load unisex analyses:', error);
    }
  }

  /**
   * Save processed names to localStorage
   */
  private saveToStorage() {
    try {
      const data = {
        entries: Array.from(this.processedNames.entries()),
        timestamp: Date.now()
      };
      localStorage.setItem(this.storageKey, JSON.stringify(data));
    } catch (error) {
      console.error('Failed to save unisex analyses:', error);
    }
  }

  /**
   * Analyze a single name to determine if it's unisex
   */
  public analyzeUnisexName(name: NameEntry): UnisexAnalysis {
    // Check cache first
    const cached = this.processedNames.get(name.name.toLowerCase());
    if (cached) {
      return cached;
    }

    let isUnisex = false;
    let unisexScore = 0;
    let confidence = 0.8; // Default confidence
    let reason = '';

    // Check if it's a known unisex name
    if (this.KNOWN_UNISEX_NAMES.has(name.name.toLowerCase())) {
      isUnisex = true;
      confidence = 0.95;
      reason = 'Culturally recognized unisex name';
    }

    // Statistical analysis based on gender scores
    if (typeof name.gender === 'object' && name.gender) {
      const maleScore = name.gender.Male || 0;
      const femaleScore = name.gender.Female || 0;
      const total = maleScore + femaleScore;

      if (total > 0) {
        const maleRatio = maleScore / total;

        // Calculate unisex score (how close to 50/50 distribution)
        unisexScore = 1 - Math.abs(0.5 - maleRatio) * 2;

        // Determine if statistically unisex
        if (maleRatio >= this.UNISEX_THRESHOLD && maleRatio <= (1 - this.UNISEX_THRESHOLD)) {
          isUnisex = true;

          if (maleRatio >= this.STRONG_UNISEX_THRESHOLD && maleRatio <= (1 - this.STRONG_UNISEX_THRESHOLD)) {
            confidence = 0.9;
            reason = `Strong unisex distribution (${Math.round(maleRatio * 100)}% male, ${Math.round((1-maleRatio) * 100)}% female)`;
          } else {
            confidence = 0.75;
            reason = `Moderate unisex distribution (${Math.round(maleRatio * 100)}% male, ${Math.round((1-maleRatio) * 100)}% female)`;
          }
        } else {
          reason = `Gender-specific distribution (${Math.round(maleRatio * 100)}% male, ${Math.round((1-maleRatio) * 100)}% female)`;
        }
      }
    }

    // Special cases: names ending in certain patterns are often unisex
    const lowerName = name.name.toLowerCase();
    if (!isUnisex && (
      lowerName.endsWith('ley') ||
      lowerName.endsWith('lee') ||
      lowerName.endsWith('ly') ||
      lowerName.endsWith('en') && lowerName.length > 4
    )) {
      // These might be unisex even if stats don't show it yet
      if (unisexScore > 0.2) {
        isUnisex = true;
        confidence = 0.65;
        reason = 'Pattern suggests potential unisex usage';
      }
    }

    const analysis: UnisexAnalysis = {
      name: name.name,
      isUnisex,
      unisexScore,
      confidence,
      reason
    };

    // Cache the result
    this.processedNames.set(name.name.toLowerCase(), analysis);

    return analysis;
  }

  /**
   * Process a batch of names
   */
  public async processBatch(names: NameEntry[]): Promise<UnisexAnalysis[]> {
    const results: UnisexAnalysis[] = [];

    for (const name of names) {
      const analysis = this.analyzeUnisexName(name);
      results.push(analysis);
    }

    // Save to storage after each batch
    this.saveToStorage();

    // Notify callback if set
    if (this.updateCallback) {
      this.updateCallback(results);
    }

    return results;
  }

  /**
   * Process all names in the queue
   */
  public async processQueue(): Promise<void> {
    if (this.isProcessing || this.processingQueue.length === 0) {
      return;
    }

    this.isProcessing = true;
    const totalNames = this.processingQueue.length;
    let processed = 0;

    while (this.processingQueue.length > 0) {
      const batch = this.processingQueue.splice(0, this.BATCH_SIZE);
      await this.processBatch(batch);

      processed += batch.length;

      // Update progress
      if (this.progressCallback) {
        this.progressCallback(processed, totalNames);
      }

      // Small delay between batches to avoid blocking UI
      await new Promise(resolve => setTimeout(resolve, 10));
    }

    this.isProcessing = false;
    console.log(`Completed processing ${processed} names for unisex identification`);
  }

  /**
   * Add names to processing queue
   */
  public queueNames(names: NameEntry[]) {
    // Filter out already processed names
    const unprocessedNames = names.filter(
      name => !this.processedNames.has(name.name.toLowerCase())
    );

    this.processingQueue.push(...unprocessedNames);
    console.log(`Queued ${unprocessedNames.length} names for unisex analysis`);

    // Don't auto-start processing to avoid recursion issues
    // Caller should explicitly call processQueue() when ready
  }

  /**
   * Set progress callback
   */
  public setProgressCallback(callback: (processed: number, total: number) => void) {
    this.progressCallback = callback;
  }

  /**
   * Set update callback for when names are processed
   */
  public setUpdateCallback(callback: (updatedNames: UnisexAnalysis[]) => void) {
    this.updateCallback = callback;
  }

  /**
   * Get analysis for a specific name
   */
  public getAnalysis(name: string): UnisexAnalysis | undefined {
    return this.processedNames.get(name.toLowerCase());
  }

  /**
   * Get all processed analyses
   */
  public getAllAnalyses(): Map<string, UnisexAnalysis> {
    return this.processedNames;
  }

  /**
   * Clear all cached analyses
   */
  public clearCache() {
    this.processedNames.clear();
    localStorage.removeItem(this.storageKey);
    console.log('Cleared unisex analysis cache');
  }

  /**
   * Get statistics about processed names
   */
  public getStatistics(): {
    totalProcessed: number;
    unisexCount: number;
    unisexPercentage: number;
    averageUnisexScore: number;
  } {
    const analyses = Array.from(this.processedNames.values());
    const unisexNames = analyses.filter(a => a.isUnisex);

    return {
      totalProcessed: analyses.length,
      unisexCount: unisexNames.length,
      unisexPercentage: analyses.length > 0 ? (unisexNames.length / analyses.length) * 100 : 0,
      averageUnisexScore: unisexNames.length > 0
        ? unisexNames.reduce((sum, a) => sum + a.unisexScore, 0) / unisexNames.length
        : 0
    };
  }
}

// Create singleton instance
const unisexIdentificationAgent = new UnisexIdentificationAgent();

export default unisexIdentificationAgent;