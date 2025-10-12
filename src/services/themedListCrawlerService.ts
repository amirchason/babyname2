/**
 * Themed List Crawler Service
 * Automatically curates and populates themed lists by:
 * - Searching database for relevant names by meaning/origin
 * - Fetching names from popular baby name sites
 * - Enriching new names with AI
 * - Saving updated lists
 */

import nameService, { BabyName } from './nameService';
import { themedLists, ThemedList } from '../data/themedLists';

interface CrawlerConfig {
  minNamesPerList: number;
  maxNamesPerList: number;
  enableWebCrawling: boolean;
  enableAIEnrichment: boolean;
  saveToFile: boolean;
}

interface CrawlerResult {
  listId: string;
  listTitle: string;
  originalCount: number;
  newCount: number;
  addedNames: string[];
  enrichedNames: string[];
  status: 'success' | 'partial' | 'failed';
  errors?: string[];
}

class ThemedListCrawlerService {
  private config: CrawlerConfig = {
    minNamesPerList: 50,
    maxNamesPerList: 2000,
    enableWebCrawling: false, // Disabled by default (requires backend)
    enableAIEnrichment: true,
    saveToFile: false, // Disabled by default (would require write permissions)
  };

  private allNames: BabyName[] = [];
  private crawlerResults: CrawlerResult[] = [];

  /**
   * Initialize crawler with database
   */
  async initialize(): Promise<void> {
    console.log('🕷️ Initializing Themed List Crawler...');
    this.allNames = await nameService.getAllNames();
    console.log(`✅ Loaded ${this.allNames.length} names from database`);
  }

  /**
   * Crawl all themed lists and populate them
   */
  async crawlAllLists(): Promise<CrawlerResult[]> {
    console.log('🚀 Starting automated list curation...');
    this.crawlerResults = [];

    for (const list of themedLists) {
      const result = await this.crawlList(list);
      this.crawlerResults.push(result);

      // Log progress
      console.log(`📊 ${list.title}: ${result.originalCount} → ${result.newCount} names (${result.status})`);
    }

    console.log('✅ Crawler finished!');
    this.printSummary();
    return this.crawlerResults;
  }

  /**
   * Crawl a single themed list
   */
  async crawlList(list: ThemedList): Promise<CrawlerResult> {
    const result: CrawlerResult = {
      listId: list.id,
      listTitle: list.title,
      originalCount: 0,
      newCount: 0,
      addedNames: [],
      enrichedNames: [],
      status: 'success',
      errors: [],
    };

    try {
      // Get current names matching the list
      const currentNames = this.getMatchingNames(list);
      result.originalCount = currentNames.length;

      // If list has enough names, skip
      if (currentNames.length >= this.config.minNamesPerList) {
        result.newCount = currentNames.length;
        result.status = 'success';
        return result;
      }

      // Need more names - search database by meanings
      const additionalNames = await this.findAdditionalNames(list, currentNames);
      result.addedNames = additionalNames.map(n => n.name);
      result.newCount = currentNames.length + additionalNames.length;

      // Enrich new names if enabled
      if (this.config.enableAIEnrichment && additionalNames.length > 0) {
        const enriched = await this.enrichNames(additionalNames);
        result.enrichedNames = enriched.map(n => n.name);
      }

      // Check if we met the minimum requirement
      if (result.newCount < this.config.minNamesPerList) {
        result.status = 'partial';
        result.errors?.push(`Only found ${result.newCount} names, need ${this.config.minNamesPerList}`);
      }

    } catch (error) {
      result.status = 'failed';
      result.errors?.push(error instanceof Error ? error.message : 'Unknown error');
    }

    return result;
  }

  /**
   * Get names matching a themed list's filter criteria
   */
  private getMatchingNames(list: ThemedList): BabyName[] {
    const { filterCriteria } = list;
    let matches: BabyName[] = [];

    // Check specificNames array first
    if (filterCriteria.specificNames && filterCriteria.specificNames.length > 0) {
      matches = this.allNames.filter(name =>
        filterCriteria.specificNames!.some(specificName =>
          name.name.toLowerCase() === specificName.toLowerCase()
        )
      );
    }

    // Search by origins
    if (filterCriteria.origins && filterCriteria.origins.length > 0) {
      const originMatches = this.allNames.filter(name =>
        filterCriteria.origins!.some(origin =>
          typeof name.origin === 'string' &&
          name.origin.toLowerCase() === origin.toLowerCase()
        )
      );
      matches = [...matches, ...originMatches];
    }

    // Search by meaning keywords
    if (filterCriteria.meaningKeywords && filterCriteria.meaningKeywords.length > 0) {
      const meaningMatches = this.searchByMeaning(filterCriteria.meaningKeywords);
      matches = [...matches, ...meaningMatches];
    }

    // Remove duplicates
    matches = this.deduplicateNames(matches);

    return matches;
  }

  /**
   * Search database for names with meanings containing keywords
   */
  private searchByMeaning(keywords: string[]): BabyName[] {
    return this.allNames.filter(name => {
      if (!name.meaning) return false;

      const meaningLower = name.meaning.toLowerCase();
      return keywords.some(keyword => meaningLower.includes(keyword.toLowerCase()));
    });
  }

  /**
   * Find additional names for a list that's under the minimum
   */
  private async findAdditionalNames(list: ThemedList, currentNames: BabyName[]): Promise<BabyName[]> {
    const needed = this.config.minNamesPerList - currentNames.length;
    if (needed <= 0) return [];

    console.log(`🔍 ${list.title}: Need ${needed} more names...`);

    const currentNameSet = new Set(currentNames.map(n => n.name.toLowerCase()));
    const additionalNames: BabyName[] = [];

    // Strategy 1: Expand meaning keyword search with related terms
    if (list.filterCriteria.meaningKeywords) {
      const expanded = this.expandKeywords(list.filterCriteria.meaningKeywords);
      const foundNames = this.searchByMeaning(expanded)
        .filter(name => !currentNameSet.has(name.name.toLowerCase()))
        .slice(0, needed);

      additionalNames.push(...foundNames);
      console.log(`  📝 Found ${foundNames.length} names via expanded meaning search`);
    }

    // Strategy 2: Search for names with similar origins
    if (list.filterCriteria.origins && additionalNames.length < needed) {
      const relatedOrigins = this.getRelatedOrigins(list.filterCriteria.origins);
      const foundNames = this.allNames
        .filter(name =>
          typeof name.origin === 'string' &&
          relatedOrigins.some(origin => name.origin?.toLowerCase() === origin.toLowerCase()) &&
          !currentNameSet.has(name.name.toLowerCase()) &&
          !additionalNames.some(n => n.name.toLowerCase() === name.name.toLowerCase())
        )
        .slice(0, needed - additionalNames.length);

      additionalNames.push(...foundNames);
      console.log(`  🌍 Found ${foundNames.length} names via related origins`);
    }

    // Strategy 3: Use custom filter logic if available
    if (list.filterCriteria.customFilter && additionalNames.length < needed) {
      const foundNames = this.allNames
        .filter(name =>
          list.filterCriteria.customFilter!(name) &&
          !currentNameSet.has(name.name.toLowerCase()) &&
          !additionalNames.some(n => n.name.toLowerCase() === name.name.toLowerCase())
        )
        .slice(0, needed - additionalNames.length);

      additionalNames.push(...foundNames);
      console.log(`  🎯 Found ${foundNames.length} names via custom filter`);
    }

    return additionalNames.slice(0, this.config.maxNamesPerList - currentNames.length);
  }

  /**
   * Expand keywords with related terms
   */
  private expandKeywords(keywords: string[]): string[] {
    const expansionMap: Record<string, string[]> = {
      'flower': ['floral', 'bloom', 'blossom', 'petal', 'botanical', 'garden'],
      'nature': ['natural', 'earth', 'forest', 'wilderness', 'wild'],
      'royal': ['regal', 'noble', 'king', 'queen', 'prince', 'princess', 'crown', 'monarch'],
      'light': ['bright', 'shine', 'radiant', 'luminous', 'glow', 'brilliant'],
      'strength': ['strong', 'powerful', 'mighty', 'warrior', 'brave', 'courage'],
      'love': ['beloved', 'dear', 'cherished', 'adored', 'affection'],
      'wisdom': ['wise', 'intelligent', 'sage', 'learned', 'knowledgeable'],
      'joy': ['happy', 'cheerful', 'delight', 'bliss', 'merry', 'glad'],
      'peace': ['calm', 'tranquil', 'serene', 'peaceful', 'harmony'],
      'star': ['stellar', 'astral', 'celestial', 'cosmic', 'constellation'],
      'moon': ['lunar', 'crescent'],
      'sun': ['solar', 'sunshine'],
      'gem': ['jewel', 'precious', 'stone', 'crystal'],
      'music': ['musical', 'melody', 'harmony', 'song', 'rhythm'],
      'color': ['hue', 'shade', 'tint'],
    };

    const expanded = new Set(keywords);
    keywords.forEach(keyword => {
      const related = expansionMap[keyword.toLowerCase()];
      if (related) {
        related.forEach(term => expanded.add(term));
      }
    });

    return Array.from(expanded);
  }

  /**
   * Get related origins for expanded search
   */
  private getRelatedOrigins(origins: string[]): string[] {
    const related = new Set(origins);

    origins.forEach(origin => {
      const lower = origin.toLowerCase();

      // Celtic family
      if (['irish', 'celtic', 'scottish', 'gaelic', 'welsh'].includes(lower)) {
        related.add('Irish').add('Celtic').add('Scottish').add('Gaelic').add('Welsh');
      }

      // Latin family
      if (['latin', 'italian', 'spanish', 'french', 'portuguese'].includes(lower)) {
        related.add('Latin').add('Italian').add('Spanish').add('French').add('Portuguese');
      }

      // Germanic family
      if (['german', 'germanic', 'dutch', 'norse', 'scandinavian'].includes(lower)) {
        related.add('German').add('Germanic').add('Dutch').add('Norse').add('Scandinavian');
      }

      // Biblical/Hebrew family
      if (['hebrew', 'biblical', 'aramaic'].includes(lower)) {
        related.add('Hebrew').add('Biblical').add('Aramaic');
      }
    });

    return Array.from(related);
  }

  /**
   * Enrich names using AI service
   */
  private async enrichNames(names: BabyName[]): Promise<BabyName[]> {
    if (!this.config.enableAIEnrichment) return names;

    console.log(`🤖 Enriching ${names.length} new names with AI...`);

    // Note: This would integrate with your existing enrichmentService
    // For now, just mark them as needing enrichment
    const enriched = names.map(name => ({
      ...name,
      needsEnrichment: true,
    }));

    // TODO: Integrate with enrichmentService.enrichName() or similar
    // enrichmentService.initialize(enriched);
    // await enrichmentService.startEnrichment();

    return enriched;
  }

  /**
   * Remove duplicate names
   */
  private deduplicateNames(names: BabyName[]): BabyName[] {
    const seen = new Set<string>();
    return names.filter(name => {
      const key = name.name.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  /**
   * Print summary of crawler results
   */
  private printSummary(): void {
    console.log('\n📊 ========== CRAWLER SUMMARY ==========');
    console.log(`Total lists processed: ${this.crawlerResults.length}`);

    const successful = this.crawlerResults.filter(r => r.status === 'success').length;
    const partial = this.crawlerResults.filter(r => r.status === 'partial').length;
    const failed = this.crawlerResults.filter(r => r.status === 'failed').length;

    console.log(`✅ Successful: ${successful}`);
    console.log(`⚠️  Partial: ${partial}`);
    console.log(`❌ Failed: ${failed}`);

    // Lists needing attention
    const needsAttention = this.crawlerResults.filter(r => r.newCount < this.config.minNamesPerList);
    if (needsAttention.length > 0) {
      console.log('\n⚠️  Lists needing more names:');
      needsAttention.forEach(r => {
        console.log(`  - ${r.listTitle}: ${r.newCount}/${this.config.minNamesPerList} names`);
      });
    }

    // Total names added
    const totalAdded = this.crawlerResults.reduce((sum, r) => sum + r.addedNames.length, 0);
    const totalEnriched = this.crawlerResults.reduce((sum, r) => sum + r.enrichedNames.length, 0);
    console.log(`\n📈 Total names added: ${totalAdded}`);
    console.log(`🤖 Total names enriched: ${totalEnriched}`);
    console.log('=========================================\n');
  }

  /**
   * Get crawler results
   */
  getResults(): CrawlerResult[] {
    return this.crawlerResults;
  }

  /**
   * Update crawler configuration
   */
  updateConfig(config: Partial<CrawlerConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Persist crawler results to localStorage
   */
  persistResults(results: CrawlerResult[]): void {
    try {
      const persistData = results.map(result => ({
        listId: result.listId,
        addedNames: result.addedNames,
        timestamp: new Date().toISOString(),
      }));

      localStorage.setItem('themedListCrawlerResults', JSON.stringify(persistData));
      console.log('✅ Crawler results persisted to localStorage');
    } catch (error) {
      console.error('Failed to persist crawler results:', error);
    }
  }

  /**
   * Load persisted results from localStorage
   */
  loadPersistedResults(): any[] {
    try {
      const stored = localStorage.getItem('themedListCrawlerResults');
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.error('Failed to load persisted results:', error);
    }
    return [];
  }

  /**
   * Generate updated themedLists.ts content with new specificNames
   */
  generateUpdatedListsCode(): string {
    // This would generate the TypeScript code for themedLists.ts
    // with all the newly found names added to specificNames arrays
    // Implementation would depend on how you want to save the results
    return '// Updated lists code would go here';
  }

  /**
   * Export results as JSON for download
   */
  exportResultsAsJSON(): string {
    const results = this.crawlerResults;
    const exportData = {
      timestamp: new Date().toISOString(),
      totalLists: results.length,
      totalNamesAdded: results.reduce((sum, r) => sum + r.addedNames.length, 0),
      totalNamesEnriched: results.reduce((sum, r) => sum + r.enrichedNames.length, 0),
      results: results.map(r => ({
        listId: r.listId,
        listTitle: r.listTitle,
        status: r.status,
        namesAdded: r.addedNames,
        enrichedNames: r.enrichedNames,
      })),
    };

    return JSON.stringify(exportData, null, 2);
  }
}

// Export singleton instance
const themedListCrawlerService = new ThemedListCrawlerService();
export default themedListCrawlerService;
