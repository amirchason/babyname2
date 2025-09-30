/**
 * Enrichment Service - Manages name enrichment with meanings and origins
 * Uses the NameEnrichmentAgent for background processing
 */

import { nameEnrichmentAgent, EnrichedName } from '../agents/NameEnrichmentAgent';
import { StandardOrigin, STANDARD_ORIGINS } from '../services/claudeApiService';

export interface NameData {
  name: string;
  meaning?: string;
  origin?: StandardOrigin;
  culturalContext?: string;
  enriched?: boolean;
  enrichedAt?: string;
}

class EnrichmentService {
  private enrichedNames: Map<string, NameData> = new Map();
  private isInitialized: boolean = false;
  private storageKey = 'nameEnrichment_v2';
  private databaseUpdateCallback?: (updatedNames: NameData[]) => void;
  private autoProcessing: boolean = false; // Disabled - using manual commands
  private processingInterval?: NodeJS.Timeout;

  constructor() {
    this.loadFromStorage();
  }

  /**
   * Initialize the service with names
   */
  public async initialize(names: any[]) {
    console.log('Initializing enrichment service...');

    // Convert names to enriched format
    const enrichedNames: EnrichedName[] = names.map(name => {
      const existing = this.enrichedNames.get(name.name);
      return {
        name: name.name,
        meaning: existing?.meaning || name.meaning,
        origin: existing?.origin || name.origin,
        culturalContext: existing?.culturalContext,
        enriched: existing?.enriched || false,
        enrichedAt: existing?.enrichedAt,
      };
    });

    // Load into agent
    await nameEnrichmentAgent.loadDatabase(enrichedNames);

    // Store in local map
    enrichedNames.forEach(nm => {
      this.enrichedNames.set(nm.name, nm);
    });

    this.isInitialized = true;
    console.log(`Enrichment service initialized with ${enrichedNames.length} names`);

    // Start background processing
    this.startBackgroundProcessing();

    // Auto-start processing if enabled
    if (this.autoProcessing && !nameEnrichmentAgent.getStatus().isProcessing) {
      setTimeout(() => this.startProcessing(100), 2000); // Start after 2 seconds
    }
  }

  /**
   * Start automatic background processing
   */
  private startBackgroundProcessing() {
    // Check every 10 seconds if we should process more names
    this.processingInterval = setInterval(() => {
      const status = nameEnrichmentAgent.getStatus();

      // If not processing and there are unprocessed names, start processing
      if (!status.isProcessing && status.unprocessedCount > 0 && this.isInitialized && this.autoProcessing) {
        console.log('Auto-starting background enrichment...');
        this.startProcessing(20); // Process 20 names at a time
      }
    }, 10000);
  }

  /**
   * Set callback for database updates
   */
  public setDatabaseUpdateCallback(callback: (updatedNames: NameData[]) => void) {
    this.databaseUpdateCallback = callback;
  }

  /**
   * Start processing names for enrichment
   */
  public async startProcessing(limit: number = 100, priorityNames?: string[]) {
    if (!this.isInitialized) {
      console.error('Service not initialized');
      return { processed: 0, errors: 0, total: 0 };
    }

    // Set up progress callback
    nameEnrichmentAgent.setProgressCallback((status) => {
      console.log(`Enrichment: ${status.message} (${status.processedCount}/${limit}) - ${status.progressPercentage}% complete`);

      // Save progress and notify about updates every 5 names
      if (status.processedCount > 0 && status.processedCount % 5 === 0) {
        this.saveProgress();

        // Notify about database updates
        if (this.databaseUpdateCallback) {
          const updatedNames = Array.from(this.enrichedNames.values())
            .filter(n => n.enriched);
          this.databaseUpdateCallback(updatedNames);
        }
      }
    });

    // Start processing
    const result = await nameEnrichmentAgent.start(limit, priorityNames);

    // Save final results
    this.saveProgress();

    // Final notification
    if (this.databaseUpdateCallback) {
      const updatedNames = Array.from(this.enrichedNames.values())
        .filter(n => n.enriched);
      this.databaseUpdateCallback(updatedNames);
    }

    return result;
  }

  /**
   * Save processing progress
   */
  private saveProgress() {
    const enrichedData = nameEnrichmentAgent.getEnrichedNames();

    // Update local map
    enrichedData.forEach(name => {
      this.enrichedNames.set(name.name, name);
    });

    // Save to localStorage
    this.saveToStorage();
  }

  /**
   * Get enriched data for a specific name
   */
  public getNameData(name: string): NameData | undefined {
    return this.enrichedNames.get(name);
  }

  /**
   * Get all enriched names
   */
  public getAllEnrichedNames(): NameData[] {
    return Array.from(this.enrichedNames.values()).filter(n => n.enriched);
  }

  /**
   * Get processing status
   */
  public getStatus() {
    return nameEnrichmentAgent.getStatus();
  }

  /**
   * Get statistics
   */
  public getStatistics() {
    return nameEnrichmentAgent.getStatistics();
  }

  /**
   * Stop processing
   */
  public stopProcessing() {
    nameEnrichmentAgent.stop();
    this.saveProgress();
  }

  /**
   * Get available origins for filtering
   */
  public getAvailableOrigins(): StandardOrigin[] {
    return [...STANDARD_ORIGINS];
  }

  /**
   * Filter names by origin
   */
  public filterByOrigin(names: any[], origins: StandardOrigin[]): any[] {
    if (origins.length === 0) return names;

    return names.filter(name => {
      const enrichedData = this.enrichedNames.get(name.name);
      if (!enrichedData || !enrichedData.origin) return false;
      return origins.includes(enrichedData.origin);
    });
  }

  /**
   * Get origin distribution
   */
  public getOriginDistribution(): Record<StandardOrigin, number> {
    const distribution: Partial<Record<StandardOrigin, number>> = {};

    this.enrichedNames.forEach(name => {
      if (name.origin) {
        distribution[name.origin] = (distribution[name.origin] || 0) + 1;
      }
    });

    return distribution as Record<StandardOrigin, number>;
  }

  /**
   * Save to localStorage
   */
  private saveToStorage() {
    try {
      const data = Array.from(this.enrichedNames.values());
      localStorage.setItem(this.storageKey, JSON.stringify(data));
      console.log(`Saved ${data.length} enriched names to storage`);
    } catch (error) {
      console.error('Failed to save enriched names:', error);
    }
  }

  /**
   * Load from localStorage
   */
  private loadFromStorage() {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        const data: NameData[] = JSON.parse(stored);
        data.forEach(nm => {
          this.enrichedNames.set(nm.name, nm);
        });
        console.log(`Loaded ${data.length} enriched names from storage`);
      }
    } catch (error) {
      console.error('Failed to load enriched names:', error);
    }
  }

  /**
   * Clear all enrichment data (for testing)
   */
  public clearEnrichmentData() {
    this.enrichedNames.clear();
    localStorage.removeItem(this.storageKey);
    nameEnrichmentAgent.clearProgress();
    console.log('Cleared all enrichment data');
  }

  /**
   * Stop background processing
   */
  public stopBackgroundProcessing() {
    if (this.processingInterval) {
      clearInterval(this.processingInterval);
      this.processingInterval = undefined;
    }
    this.autoProcessing = false;
  }

  /**
   * Start background processing
   */
  public enableBackgroundProcessing() {
    this.autoProcessing = true;
    if (!this.processingInterval) {
      this.startBackgroundProcessing();
    }
  }
}

// Export singleton instance
export const enrichmentService = new EnrichmentService();
export default enrichmentService;