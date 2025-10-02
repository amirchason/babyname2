/**
 * Unisex Service
 * Manages unisex name identification and processing
 */

import unisexIdentificationAgent from '../agents/UnisexIdentificationAgent';
import nameService, { NameEntry } from './nameService';

class UnisexService {
  private isInitialized = false;
  private processingStarted = false;

  /**
   * Initialize the unisex service with current database
   */
  public async initialize() {
    if (this.isInitialized) {
      return;
    }

    console.log('🔄 Initializing unisex service...');

    // Get all names from the database
    const allNames = nameService.getAllNames();

    // Set up callback to update names when they are processed
    unisexIdentificationAgent.setUpdateCallback((analyses) => {
      // Update the names in the service with unisex information
      analyses.forEach(analysis => {
        const name = allNames.find(n => n.name === analysis.name);
        if (name) {
          name.isUnisex = analysis.isUnisex;
          name.unisexScore = analysis.unisexScore;
        }
      });

      console.log(`✅ Updated ${analyses.length} names with unisex information`);
    });

    // Set up progress callback
    unisexIdentificationAgent.setProgressCallback((processed, total) => {
      console.log(`⏳ Unisex processing: ${processed}/${total} names (${Math.round(processed/total * 100)}%)`);
    });

    this.isInitialized = true;
  }

  /**
   * Start processing names for unisex identification
   */
  public async startProcessing() {
    if (!this.isInitialized) {
      await this.initialize();
    }

    if (this.processingStarted) {
      console.log('⚠️ Unisex processing already in progress');
      return;
    }

    this.processingStarted = true;
    console.log('🚀 Starting unisex name processing...');

    // Get all names and queue them for processing
    const allNames = nameService.getAllNames();

    // Process in background
    unisexIdentificationAgent.queueNames(allNames);

    // Get statistics
    const stats = unisexIdentificationAgent.getStatistics();
    console.log('📊 Unisex Statistics:', stats);
  }

  /**
   * Get statistics about unisex processing
   */
  public getStatistics() {
    return unisexIdentificationAgent.getStatistics();
  }

  /**
   * Check if a name is unisex
   */
  public isUnisex(name: NameEntry): boolean {
    const analysis = unisexIdentificationAgent.getAnalysis(name.name);
    if (analysis) {
      return analysis.isUnisex;
    }

    // Fallback to nameService calculation
    return nameService.isUnisexName(name);
  }

  /**
   * Get unisex score for a name
   */
  public getUnisexScore(name: NameEntry): number {
    const analysis = unisexIdentificationAgent.getAnalysis(name.name);
    if (analysis) {
      return analysis.unisexScore;
    }

    // Fallback to nameService calculation
    return nameService.getUnisexScore(name);
  }

  /**
   * Clear all cached unisex data
   */
  public clearCache() {
    unisexIdentificationAgent.clearCache();
    this.processingStarted = false;
    console.log('🗑️ Cleared unisex cache');
  }

  /**
   * Process a single name immediately
   */
  public processName(name: NameEntry) {
    const analysis = unisexIdentificationAgent.analyzeUnisexName(name);

    // Update the name object
    name.isUnisex = analysis.isUnisex;
    name.unisexScore = analysis.unisexScore;

    return analysis;
  }
}

// Create singleton instance
const unisexService = new UnisexService();

export default unisexService;