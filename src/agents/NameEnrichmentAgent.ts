/**
 * Name Enrichment Agent - Autonomous background agent for enriching names
 * Processes names to add meanings, origins, and cultural context
 * Now using OpenAI GPT-4 Mini for cost-effective enrichment
 */

import openaiApiService from '../services/openaiApiService';
import { NameAnalysis, StandardOrigin } from '../services/claudeApiService';

export interface EnrichedName {
  name: string;
  meaning?: string;
  origin?: StandardOrigin;
  culturalContext?: string;
  enriched?: boolean;
  enrichedAt?: string;
  processingStatus?: 'pending' | 'processing' | 'completed' | 'failed';
  errorMessage?: string;
  primaryCountry?: string; // Country code for better origin detection
}

export interface EnrichmentStatus {
  isProcessing: boolean;
  currentName: string | null;
  processedCount: number;
  errorCount: number;
  totalCount: number;
  unprocessedCount: number;
  message?: string;
  progressPercentage: number;
}

export class NameEnrichmentAgent {
  private isProcessing: boolean = false;
  private shouldStop: boolean = false;
  private processedCount: number = 0;
  private errorCount: number = 0;
  private currentName: string | null = null;
  private database: EnrichedName[] = [];
  private onProgress?: (status: EnrichmentStatus) => void;
  private batchSize: number = 10; // Process 10 names at a time
  private processedNames: Set<string> = new Set();

  constructor() {
    console.log('Name Enrichment Agent initialized');
    this.loadProgress();
  }

  /**
   * Set progress callback
   */
  public setProgressCallback(callback: (status: EnrichmentStatus) => void) {
    this.onProgress = callback;
  }

  /**
   * Load database of names to enrich
   */
  public async loadDatabase(names: any[]) {
    // Convert to enriched name format
    this.database = names.map(name => {
      const existing = this.database.find(n => n.name === name.name);
      return {
        name: name.name,
        meaning: existing?.meaning || name.meaning,
        origin: existing?.origin || name.origin,
        culturalContext: existing?.culturalContext,
        enriched: existing?.enriched || !!name.meaning || false,
        enrichedAt: existing?.enrichedAt || name.enrichedAt,
        processingStatus: existing?.processingStatus || (name.meaning ? 'completed' : 'pending'),
        primaryCountry: name.primaryCountry // Preserve country code for better origin detection
      };
    });

    console.log(`Loaded ${this.database.length} names into enrichment agent`);
  }

  /**
   * Start processing names
   */
  public async start(limit: number = 100, priorityNames?: string[]) {
    if (this.isProcessing) {
      console.log('Agent is already processing');
      return;
    }

    this.isProcessing = true;
    this.shouldStop = false;
    this.processedCount = 0;
    this.errorCount = 0;

    console.log(`Starting enrichment for up to ${limit} names...`);
    this.emitProgress('Initializing enrichment process...');

    // Prioritize Modern origin names for re-enrichment, then unenriched names
    let modernNames = this.database.filter(n =>
      n.origin === 'Modern' ||
      (n.origin && n.origin.includes('Modern'))
    );
    let unenrichedNames = this.database.filter(n => !n.enriched || n.processingStatus === 'pending');

    // Combine: Modern names first, then unenriched
    let namesToProcess = [
      ...modernNames,
      ...unenrichedNames.filter(n => !modernNames.includes(n))
    ];

    // Prioritize specific names if provided
    if (priorityNames && priorityNames.length > 0) {
      const prioritySet = new Set(priorityNames.map(n => n.toLowerCase()));
      namesToProcess = [
        ...namesToProcess.filter(n => prioritySet.has(n.name.toLowerCase())),
        ...namesToProcess.filter(n => !prioritySet.has(n.name.toLowerCase()))
      ];
    }

    // Limit the number to process
    namesToProcess = namesToProcess.slice(0, limit);

    console.log(`Found ${namesToProcess.length} names to enrich`);
    console.log(`Using batch processing: ${this.batchSize} names per API call with 1.5s delay between batches`);

    // Process in batches for better performance
    for (let i = 0; i < namesToProcess.length; i += this.batchSize) {
      if (this.shouldStop) {
        console.log('Stopping enrichment process...');
        break;
      }

      const batch = namesToProcess.slice(i, i + this.batchSize);
      const batchNum = Math.floor(i / this.batchSize) + 1;
      const totalBatches = Math.ceil(namesToProcess.length / this.batchSize);

      console.log(`\n📦 Batch ${batchNum}/${totalBatches} (${batch.length} names)`);

      await this.processBatch(batch);

      // Add delay between batches to respect rate limits (1.5 seconds)
      // This allows ~40 batches/minute = 400 names/minute (well under any rate limit)
      if (i + this.batchSize < namesToProcess.length) {
        console.log('⏱️  Waiting 1.5s before next batch...');
        await this.delay(1500);
      }
    }

    this.isProcessing = false;
    this.emitProgress('Enrichment process complete');
    this.saveProgress();

    const result = {
      processed: this.processedCount,
      errors: this.errorCount,
      total: namesToProcess.length
    };

    console.log(`Enrichment complete. Processed: ${result.processed}, Errors: ${result.errors}`);
    return result;
  }

  /**
   * Process a batch of names using SINGLE API call (much faster and more efficient)
   */
  private async processBatch(batch: EnrichedName[]) {
    console.log(`Processing batch of ${batch.length} names with single API call...`);

    try {
      // Extract name strings and country hints
      const nameStrings = batch.map(entry => entry.name);
      const countryHints = batch.map(entry => entry.primaryCountry || '');

      // Call batch API - sends all names in ONE request with country context
      const analyses = await openaiApiService.analyzeNamesBatch(nameStrings, 0, countryHints);

      // Update all entries with results
      batch.forEach((entry, index) => {
        const analysis = analyses[index];

        if (!analysis) {
          console.error(`No analysis returned for ${entry.name}`);
          entry.processingStatus = 'failed';
          entry.errorMessage = 'No result from batch API';
          this.errorCount++;
          return;
        }

        try {
          // Update the entry with enriched data
          entry.meaning = analysis.meaning;
          entry.origin = this.mapToValidOrigin(analysis.origin);
          entry.culturalContext = analysis.culturalContext;
          entry.enriched = true;
          entry.enrichedAt = new Date().toISOString();
          entry.processingStatus = 'completed';

          this.processedCount++;
          this.processedNames.add(entry.name);

          console.log(`  ✓ ${entry.name}: "${analysis.meaning}" (${analysis.origin})`);

        } catch (error) {
          console.error(`Error updating ${entry.name}:`, error);
          entry.processingStatus = 'failed';
          entry.errorMessage = error instanceof Error ? error.message : 'Update failed';
          this.errorCount++;
        }
      });

    } catch (error) {
      console.error('Batch processing error:', error);

      // Mark all as failed on batch error
      batch.forEach(entry => {
        entry.processingStatus = 'failed';
        entry.errorMessage = 'Batch API call failed';
        this.errorCount++;
      });
    }
  }

  /**
   * Process a single name
   */
  private async processName(nameEntry: EnrichedName) {
    this.currentName = nameEntry.name;
    this.emitProgress(`Enriching: ${nameEntry.name}`);

    // Mark as processing
    nameEntry.processingStatus = 'processing';

    try {
      // Analyze name using OpenAI GPT-4 Mini
      const analysis = await openaiApiService.analyzeName(nameEntry.name);

      // Update the name entry with enriched data
      nameEntry.meaning = analysis.meaning;
      // Map origin to valid StandardOrigin type
      const validOrigin = this.mapToValidOrigin(analysis.origin);
      nameEntry.origin = validOrigin;
      nameEntry.culturalContext = analysis.culturalContext;
      nameEntry.enriched = true;
      nameEntry.enrichedAt = new Date().toISOString();
      nameEntry.processingStatus = 'completed';

      this.processedCount++;
      this.processedNames.add(nameEntry.name);

      console.log(`✓ Enriched "${nameEntry.name}": ${nameEntry.meaning} (${nameEntry.origin})`);
      this.emitProgress(`Completed: ${nameEntry.name}`);

    } catch (error) {
      this.errorCount++;
      nameEntry.processingStatus = 'failed';
      nameEntry.errorMessage = error instanceof Error ? error.message : 'Unknown error';

      console.error(`✗ Failed to enrich "${nameEntry.name}":`, error);
      this.emitProgress(`Error: Failed to process ${nameEntry.name}`);
    }
  }

  /**
   * Delay helper for rate limiting
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Stop processing
   */
  public stop() {
    this.shouldStop = true;
    this.isProcessing = false;
    console.log('Stopping enrichment agent...');
    this.saveProgress();
  }

  /**
   * Get current status
   */
  public getStatus(): EnrichmentStatus {
    const totalCount = this.database.length;
    const enrichedCount = this.database.filter(n => n.enriched).length;
    const unprocessedCount = this.database.filter(n => !n.enriched || n.processingStatus === 'pending').length;
    const progressPercentage = totalCount > 0 ? Math.round((enrichedCount / totalCount) * 100) : 0;

    return {
      isProcessing: this.isProcessing,
      currentName: this.currentName,
      processedCount: this.processedCount,
      errorCount: this.errorCount,
      totalCount: totalCount,
      unprocessedCount: unprocessedCount,
      progressPercentage: progressPercentage,
      message: this.isProcessing ? `Processing ${this.currentName}...` : 'Idle'
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
   * Get enriched names for saving
   */
  public getEnrichedNames(): EnrichedName[] {
    return this.database.filter(n => n.enriched);
  }

  /**
   * Get database with all names
   */
  public getDatabase(): EnrichedName[] {
    return this.database;
  }

  /**
   * Save progress to localStorage
   */
  private saveProgress() {
    try {
      const progress = {
        processedNames: Array.from(this.processedNames),
        enrichedData: this.getEnrichedNames(),
        timestamp: new Date().toISOString()
      };
      localStorage.setItem('nameEnrichmentProgress', JSON.stringify(progress));
      console.log(`Saved enrichment progress: ${this.processedNames.size} names`);
    } catch (error) {
      console.error('Failed to save progress:', error);
    }
  }

  /**
   * Load progress from localStorage
   */
  private loadProgress() {
    try {
      const saved = localStorage.getItem('nameEnrichmentProgress');
      if (saved) {
        const progress = JSON.parse(saved);
        this.processedNames = new Set(progress.processedNames);
        console.log(`Loaded enrichment progress: ${this.processedNames.size} names`);
      }
    } catch (error) {
      console.error('Failed to load progress:', error);
    }
  }

  /**
   * Clear all progress (for testing)
   */
  public clearProgress() {
    this.processedNames.clear();
    this.database.forEach(name => {
      name.enriched = false;
      name.processingStatus = 'pending';
      delete name.meaning;
      delete name.origin;
      delete name.culturalContext;
      delete name.enrichedAt;
    });
    localStorage.removeItem('nameEnrichmentProgress');
    console.log('Cleared all enrichment progress');
  }

  /**
   * Get statistics
   */
  public getStatistics() {
    const origins: Record<string, number> = {};
    const enrichedNames = this.getEnrichedNames();

    enrichedNames.forEach(name => {
      if (name.origin) {
        origins[name.origin] = (origins[name.origin] || 0) + 1;
      }
    });

    return {
      totalNames: this.database.length,
      enrichedCount: enrichedNames.length,
      pendingCount: this.database.filter(n => !n.enriched).length,
      errorCount: this.database.filter(n => n.processingStatus === 'failed').length,
      originDistribution: origins,
      completionPercentage: Math.round((enrichedNames.length / this.database.length) * 100)
    };
  }

  /**
   * Map dynamic origin string to valid StandardOrigin
   */
  private mapToValidOrigin(origin?: string): StandardOrigin {
    if (!origin) return 'Modern';

    const lowerOrigin = origin.toLowerCase();

    // Direct matches
    if (lowerOrigin === 'hebrew') return 'Hebrew';
    if (lowerOrigin === 'greek') return 'Greek';
    if (lowerOrigin === 'latin') return 'Latin';
    if (lowerOrigin === 'arabic') return 'Arabic';
    if (lowerOrigin === 'germanic') return 'Germanic';
    if (lowerOrigin === 'celtic') return 'Celtic';
    if (lowerOrigin === 'english') return 'English';
    if (lowerOrigin === 'french') return 'French';
    if (lowerOrigin === 'spanish') return 'Spanish';
    if (lowerOrigin === 'italian') return 'Italian';
    if (lowerOrigin === 'irish') return 'Irish';
    if (lowerOrigin === 'scottish') return 'Scottish';
    if (lowerOrigin === 'welsh') return 'Welsh';
    if (lowerOrigin === 'norse') return 'Norse';
    if (lowerOrigin === 'russian') return 'Russian';
    if (lowerOrigin === 'polish') return 'Polish';
    if (lowerOrigin === 'dutch') return 'Dutch';
    if (lowerOrigin === 'portuguese') return 'Portuguese';
    if (lowerOrigin === 'indian') return 'Indian';
    if (lowerOrigin === 'japanese') return 'Japanese';
    if (lowerOrigin === 'chinese') return 'Chinese';
    if (lowerOrigin === 'korean') return 'Korean';
    if (lowerOrigin === 'filipino') return 'Filipino';
    if (lowerOrigin === 'african') return 'African';
    if (lowerOrigin === 'persian') return 'Persian';
    if (lowerOrigin === 'turkish') return 'Turkish';
    if (lowerOrigin === 'hawaiian') return 'Hawaiian';
    if (lowerOrigin === 'biblical') return 'Biblical';
    if (lowerOrigin === 'slavic') return 'Slavic';

    // Fuzzy matches
    if (lowerOrigin.includes('german')) return 'Germanic';
    if (lowerOrigin.includes('celt')) return 'Celtic';
    if (lowerOrigin.includes('scot')) return 'Scottish';
    if (lowerOrigin.includes('slav')) return 'Slavic';
    if (lowerOrigin.includes('philippine') || lowerOrigin.includes('tagalog')) return 'Filipino';
    if (lowerOrigin.includes('america') || lowerOrigin.includes('native')) return 'Native-American';
    if (lowerOrigin.includes('bible') || lowerOrigin.includes('christian')) return 'Biblical';

    // Default fallback
    return 'Modern';
  }
}

// Export singleton instance
export const nameEnrichmentAgent = new NameEnrichmentAgent();