/**
 * Meaning Command - Process name meanings via slash command
 * Syntax: /meaning [number]
 * Example: /meaning 50
 */

import enrichmentService from '../services/enrichmentService';

export interface CommandResult {
  success: boolean;
  message: string;
  details?: any;
}

export class MeaningCommand {
  /**
   * Execute the meaning processing command
   * @param args - Command arguments (number of names to process)
   */
  public async execute(args: string): Promise<CommandResult> {
    // Parse the number from arguments
    const numberMatch = args.match(/\d+/);
    const count = numberMatch ? parseInt(numberMatch[0]) : 50; // Default to 50

    // Validate the count
    if (count < 1) {
      return {
        success: false,
        message: '❌ Please provide a valid number greater than 0'
      };
    }

    if (count > 1000) {
      return {
        success: false,
        message: '❌ Maximum 1000 names at once. Use multiple commands for more.'
      };
    }

    try {
      // Get current status
      const statusBefore = enrichmentService.getStatus();

      if (statusBefore.isProcessing) {
        return {
          success: false,
          message: '⏳ Already processing names. Please wait for current batch to complete.'
        };
      }

      // Start processing
      console.log(`Starting enrichment for ${count} names...`);

      // Start the enrichment process
      const processPromise = enrichmentService.startProcessing(count);

      // Get initial statistics
      const stats = enrichmentService.getStatistics();

      // Return immediate response
      const response: CommandResult = {
        success: true,
        message: `🚀 Started processing ${count} names`,
        details: {
          totalNames: stats.totalNames,
          alreadyEnriched: stats.enrichedCount,
          pending: stats.pendingCount,
          toProcess: Math.min(count, stats.pendingCount),
          progress: `${stats.completionPercentage}% complete overall`
        }
      };

      // Set up async completion handler
      processPromise.then(result => {
        const updatedStats = enrichmentService.getStatistics();
        console.log(`✅ Enrichment complete! Processed: ${result?.processed || 'unknown'}, Errors: ${result?.errors || 'unknown'}`);
        console.log(`Overall progress: ${updatedStats.completionPercentage}% (${updatedStats.enrichedCount}/${updatedStats.totalNames})`);
      }).catch(error => {
        console.error('❌ Enrichment failed:', error);
      });

      return response;

    } catch (error) {
      return {
        success: false,
        message: `❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  /**
   * Get command help text
   */
  public getHelp(): string {
    return `
📚 **Meaning Command**
Enriches names with AI-generated meanings and origins

**Syntax:** \`/meaning [number]\`

**Examples:**
• \`/meaning\` - Process 50 names (default)
• \`/meaning 100\` - Process 100 names
• \`/meaning 500\` - Process 500 names

**Features:**
• Adds 1-4 word English meanings
• Detects cultural origins (30 categories)
• Marks processed names to avoid duplicates
• Saves progress automatically
• Resume anytime with next batch

**Status Check:**
The command shows current progress and statistics.
Already processed names are skipped automatically.
    `.trim();
  }

  /**
   * Get current enrichment status
   */
  public getStatus(): any {
    const status = enrichmentService.getStatus();
    const stats = enrichmentService.getStatistics();

    return {
      isProcessing: status.isProcessing,
      currentName: status.currentName,
      progress: {
        processed: stats.enrichedCount,
        pending: stats.pendingCount,
        total: stats.totalNames,
        percentage: stats.completionPercentage
      },
      originDistribution: stats.originDistribution
    };
  }

  /**
   * Stop current processing
   */
  public stop(): CommandResult {
    enrichmentService.stopProcessing();
    return {
      success: true,
      message: '⏹️ Stopped enrichment processing'
    };
  }

  /**
   * Clear all enrichment data
   */
  public clear(): CommandResult {
    if (!globalThis.confirm?.('⚠️ Clear all enrichment data? This cannot be undone.')) {
      return {
        success: false,
        message: 'Cancelled'
      };
    }

    enrichmentService.clearEnrichmentData();
    return {
      success: true,
      message: '🗑️ Cleared all enrichment data. Start fresh with /meaning'
    };
  }
}

// Export singleton instance
export const meaningCommand = new MeaningCommand();
export default meaningCommand;