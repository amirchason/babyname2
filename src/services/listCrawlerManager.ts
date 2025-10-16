/**
 * List Crawler Manager
 * Orchestrates the themed list crawler and enrichment services
 * Manages background processing, progress tracking, and data persistence
 */

import themedListCrawlerService from './themedListCrawlerService';
import enrichmentService from './enrichmentService';
import nameService from './nameService';
import { themedLists } from '../data/themedLists';

export interface CrawlerStatus {
  isRunning: boolean;
  currentList: string | null;
  currentListIndex: number;
  totalLists: number;
  listsProcessed: number;
  namesAdded: number;
  namesEnriched: number;
  errors: string[];
  startedAt: Date | null;
  lastRunAt: Date | null;
  estimatedTimeRemaining: number; // seconds
  progress: number; // 0-100
}

export interface CrawlerConfig {
  autoStart: boolean;
  autoEnrich: boolean;
  runInterval: number; // hours between runs
  enableBackgroundSync: boolean;
}

export interface CrawlerReport {
  runId: string;
  timestamp: Date;
  duration: number; // seconds
  listsProcessed: number;
  namesAdded: number;
  namesEnriched: number;
  results: any[];
  errors: string[];
}

class ListCrawlerManager {
  private isRunning: boolean = false;
  private status: CrawlerStatus;
  private config: CrawlerConfig;
  private progressCallback?: (status: CrawlerStatus) => void;
  private completionCallback?: (report: CrawlerReport) => void;
  private reports: CrawlerReport[] = [];
  private storageKey = 'listCrawlerReports';

  constructor() {
    this.status = this.getInitialStatus();
    this.config = this.loadConfig();
    this.loadReports();
  }

  /**
   * Initialize crawler manager
   */
  async initialize(): Promise<void> {
    console.log('🕷️ Initializing List Crawler Manager...');

    // Initialize crawler service
    await themedListCrawlerService.initialize();

    // Load last run time
    const lastRun = localStorage.getItem('listCrawler_lastRun');
    if (lastRun) {
      this.status.lastRunAt = new Date(lastRun);
    }

    console.log('✅ List Crawler Manager initialized');
  }

  /**
   * Start crawler process
   */
  async start(): Promise<CrawlerReport> {
    if (this.isRunning) {
      throw new Error('Crawler is already running');
    }

    console.log('🚀 Starting List Crawler...');
    this.isRunning = true;
    this.status.isRunning = true;
    this.status.startedAt = new Date();
    this.status.errors = [];
    this.status.namesAdded = 0;
    this.status.namesEnriched = 0;
    this.status.listsProcessed = 0;
    this.status.totalLists = themedLists.length;

    const startTime = Date.now();

    try {
      // Run crawler on all lists
      const results = await themedListCrawlerService.crawlAllLists();

      // Persist crawler results
      themedListCrawlerService.persistResults(results);

      // Process results
      for (let i = 0; i < results.length; i++) {
        const result = results[i];
        this.status.currentList = result.listTitle;
        this.status.currentListIndex = i;
        this.status.listsProcessed++;
        this.status.namesAdded += result.addedNames.length;
        this.status.progress = Math.round(((i + 1) / results.length) * 100);

        // Notify progress
        if (this.progressCallback) {
          this.progressCallback({ ...this.status });
        }

        // Enrich new names if enabled
        if (this.config.autoEnrich && result.addedNames.length > 0) {
          console.log(`🤖 Enriching ${result.addedNames.length} new names for ${result.listTitle}...`);

          // Get full name objects
          const allNames = nameService.getAllNames();
          const namesToEnrich = allNames.filter(n => result.addedNames.includes(n.name));

          if (namesToEnrich.length > 0) {
            // Initialize enrichment service if not already
            await enrichmentService.initialize(namesToEnrich);

            // Start enrichment for these names
            const enrichResult = await enrichmentService.startProcessing(
              namesToEnrich.length,
              result.addedNames
            );

            this.status.namesEnriched += enrichResult.processed;
          }
        }
      }

      // Create report
      const duration = Math.round((Date.now() - startTime) / 1000);
      const report: CrawlerReport = {
        runId: `run_${Date.now()}`,
        timestamp: new Date(),
        duration,
        listsProcessed: this.status.listsProcessed,
        namesAdded: this.status.namesAdded,
        namesEnriched: this.status.namesEnriched,
        results,
        errors: this.status.errors,
      };

      // Save report
      this.saveReport(report);

      // Update last run time
      localStorage.setItem('listCrawler_lastRun', new Date().toISOString());
      this.status.lastRunAt = new Date();

      // Notify completion
      if (this.completionCallback) {
        this.completionCallback(report);
      }

      console.log('✅ List Crawler completed successfully');
      return report;

    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      this.status.errors.push(errorMsg);
      console.error('❌ List Crawler failed:', errorMsg);
      throw error;

    } finally {
      this.isRunning = false;
      this.status.isRunning = false;
      this.status.currentList = null;
      this.status.progress = 100;
    }
  }

  /**
   * Stop crawler process
   */
  stop(): void {
    if (!this.isRunning) return;

    console.log('⏸️ Stopping List Crawler...');
    this.isRunning = false;
    this.status.isRunning = false;

    // Stop enrichment service
    enrichmentService.stopProcessing();
  }

  /**
   * Get current status
   */
  getStatus(): CrawlerStatus {
    return { ...this.status };
  }

  /**
   * Get crawler configuration
   */
  getConfig(): CrawlerConfig {
    return { ...this.config };
  }

  /**
   * Update crawler configuration
   */
  updateConfig(config: Partial<CrawlerConfig>): void {
    this.config = { ...this.config, ...config };
    this.saveConfig();
  }

  /**
   * Set progress callback
   */
  setProgressCallback(callback: (status: CrawlerStatus) => void): void {
    this.progressCallback = callback;
  }

  /**
   * Set completion callback
   */
  setCompletionCallback(callback: (report: CrawlerReport) => void): void {
    this.completionCallback = callback;
  }

  /**
   * Get all reports
   */
  getReports(): CrawlerReport[] {
    return [...this.reports];
  }

  /**
   * Get latest report
   */
  getLatestReport(): CrawlerReport | null {
    return this.reports.length > 0 ? this.reports[0] : null;
  }

  /**
   * Clear all reports
   */
  clearReports(): void {
    this.reports = [];
    localStorage.removeItem(this.storageKey);
  }

  /**
   * Get time since last run (in hours)
   */
  getTimeSinceLastRun(): number | null {
    if (!this.status.lastRunAt) return null;
    const diff = Date.now() - this.status.lastRunAt.getTime();
    return Math.round(diff / (1000 * 60 * 60));
  }

  /**
   * Should auto-run based on config?
   */
  shouldAutoRun(): boolean {
    if (!this.config.autoStart) return false;

    const hoursSinceRun = this.getTimeSinceLastRun();
    if (hoursSinceRun === null) return true; // Never run before

    return hoursSinceRun >= this.config.runInterval;
  }

  // Private helper methods

  private getInitialStatus(): CrawlerStatus {
    return {
      isRunning: false,
      currentList: null,
      currentListIndex: 0,
      totalLists: themedLists.length,
      listsProcessed: 0,
      namesAdded: 0,
      namesEnriched: 0,
      errors: [],
      startedAt: null,
      lastRunAt: null,
      estimatedTimeRemaining: 0,
      progress: 0,
    };
  }

  private loadConfig(): CrawlerConfig {
    const stored = localStorage.getItem('listCrawlerConfig');
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (error) {
        console.error('Failed to load crawler config:', error);
      }
    }

    return {
      autoStart: false,
      autoEnrich: true,
      runInterval: 24, // Run once per day
      enableBackgroundSync: false,
    };
  }

  private saveConfig(): void {
    try {
      localStorage.setItem('listCrawlerConfig', JSON.stringify(this.config));
    } catch (error) {
      console.error('Failed to save crawler config:', error);
    }
  }

  private loadReports(): void {
    const stored = localStorage.getItem(this.storageKey);
    if (stored) {
      try {
        this.reports = JSON.parse(stored).map((r: any) => ({
          ...r,
          timestamp: new Date(r.timestamp),
        }));
      } catch (error) {
        console.error('Failed to load crawler reports:', error);
      }
    }
  }

  private saveReport(report: CrawlerReport): void {
    // Add to beginning of array (newest first)
    this.reports.unshift(report);

    // Keep only last 10 reports
    if (this.reports.length > 10) {
      this.reports = this.reports.slice(0, 10);
    }

    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.reports));
    } catch (error) {
      console.error('Failed to save crawler report:', error);
    }
  }
}

// Export singleton instance
const listCrawlerManager = new ListCrawlerManager();
export default listCrawlerManager;
