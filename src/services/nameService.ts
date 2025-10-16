/**
 * Name Service Wrapper
 * Provides backward compatibility while using the optimized service internally
 */

import { ScrapingFlags } from './scrapingFlagsService';
import { largeFallbackNames } from '../data/largeFallbackNames';
import { fullDatabase, loadDatabase, getDatabaseInfo as getFullDatabaseInfo } from '../data/fullDatabase';
import chunkedDatabaseService from './chunkedDatabaseService';

export interface NameEntry {
  name: string;
  originalName?: string;
  type?: string;
  gender?: string | {
    Male?: number;
    Female?: number;
  };
  isUnisex?: boolean;
  unisexScore?: number; // 0-1 scale, where 0.5 is perfectly unisex
  origin?: string; // Keep for backward compatibility (will be primary origin)
  origins?: string[]; // Multiple origins (up to 3, only if name has multiple)
  originsDetails?: {
    primary: string;
    secondary?: string;
    tertiary?: string;
    percentages?: number[]; // Distribution percentages if known
  };
  originProcessed?: boolean; // Track if origin has been AI-processed
  originProcessedAt?: string;
  originSource?: string; // 'gpt-4-turbo' or 'gemini' etc
  meaning?: string;
  meaningShort?: string; // Up to 4 words for name cards
  meaningFull?: string; // Up to 15 words for detail view
  meanings?: string[]; // Array of 1-3 meanings (only if multiple exist)
  meaningEtymology?: string; // Detailed etymology information
  meaningProcessed?: boolean; // Track if meaning has been AI-processed
  meaningProcessedAt?: string; // Timestamp of processing
  meaningSource?: string; // 'gpt-4-turbo' or other source
  themedListEnriched?: boolean; // Track if enriched for themed lists
  themedListEnrichedAt?: string; // Timestamp of themed enrichment
  validatedForLists?: string[]; // List IDs where name fits the theme
  popularity?: number;
  popularityRank?: number;
  isPopular?: boolean;
  countries?: Record<string, number>;
  globalCountries?: Record<string, number>;
  primaryCountry?: string;
  appearances?: number;
  globalFrequency?: number;
  popularityScore?: number;
  globalPopularityScore?: number;
  abbreviations?: string[];
  isAbbreviation?: boolean;
  isPotentialAbbreviation?: boolean;
  variants?: string[];
  variations?: string[];
  categories?: string[];
  description?: string;
  culturalSignificance?: string;
  famousPeople?: string[];
  literaryReferences?: string[];
  searchPriority?: number;
  scrapingFlags?: ScrapingFlags;
  sources?: string[];
}

// Type alias for backward compatibility
export type BabyName = NameEntry;

export interface NamesDatabase {
  metadata: {
    source: string;
    version: string;
    description: string;
    lastUpdated: string;
    totalNames: number;
    totalDuplicatesEliminated?: number;
    countries: Record<string, number>;
    workingCountries: string[];
  };
  names: NameEntry[];
}

class NameService {
  private allNames: NameEntry[] = [];
  private loading = false;
  private loaded = false;
  private cachedConversions = new Map<number, NameEntry>();
  private emergencyFallbackNames: NameEntry[] = largeFallbackNames;

  constructor() {
    // Use chunked database service for instant display and progressive loading
    this.allNames = chunkedDatabaseService.getAllNames();
    console.log(`⚡ NameService initialized with ${this.allNames.length} names from chunked service`);

    // Wait for core chunk to load, then update names
    this.waitForCoreAndUpdate();

    // Start loading full database in background (will upgrade from 10k to full)
    this.initializeDatabase();

    // Also load all chunks progressively in the background
    this.loadAllChunksInBackground();
  }

  /**
   * Wait for core chunk and update names immediately
   */
  private async waitForCoreAndUpdate(): Promise<void> {
    try {
      console.log('⏳ NameService: Waiting for core chunk...');
      await chunkedDatabaseService.waitForCore();

      // Update our names immediately after core loads
      this.allNames = chunkedDatabaseService.getAllNames();
      console.log(`✅ NameService: Core loaded! ${this.allNames.length} names now available`);
    } catch (error) {
      console.error('❌ NameService: Error waiting for core:', error);
    }
  }

  /**
   * Initialize database from fullDatabase module
   */
  private async initializeDatabase() {
    this.loading = true;

    try {
      console.log(`📊 Starting background database load...`);
      // Load database in background
      const names = await loadDatabase();

      // Only update if we got more names than fallback
      if (names && names.length > this.allNames.length) {
        this.allNames = names;
        console.log(`✅ Database upgraded: ${this.allNames.length} names now available`);
      } else {
        console.log(`⚡ Keeping fallback: ${this.allNames.length} names (fetch returned ${names?.length || 0})`);
      }

      this.loaded = true;
    } catch (error) {
      console.error('❌ Failed to load database, keeping emergency fallback:', error);
      // Keep the fallback we already set in constructor
      this.loaded = true;
    }

    this.loading = false;
  }

  /**
   * Load all chunks in background for full 224k access
   */
  private async loadAllChunksInBackground(): Promise<void> {
    try {
      console.log('🔄 Starting progressive chunk loading in background...');
      await chunkedDatabaseService.loadAllChunks();

      // Update our names array with all chunks
      this.allNames = chunkedDatabaseService.getAllNames();
      console.log(`✅ All chunks loaded! ${this.allNames.length} names now available`);
    } catch (error) {
      console.error('❌ Error loading chunks:', error);
    }
  }

  /**
   * Load full database
   */
  async loadFullDatabase(): Promise<void> {
    if (this.allNames.length >= 200000) {
      console.log(`✅ Database already loaded: ${this.allNames.length} names`);
      return;
    }

    // First try the legacy load (10k from popularNames_cache.json)
    await this.initializeDatabase();

    // Then ensure all chunks are loaded
    await this.loadAllChunksInBackground();
  }

  /**
   * Get database info
   */
  getDatabaseInfo(): { mode: string; totalNames: number } {
    return {
      mode: 'Direct Database Load',
      totalNames: this.allNames.length
    };
  }


  /**
   * Search names
   */
  searchNames(searchTerm: string): NameEntry[] {
    if (!searchTerm) return [];

    const lowerSearch = searchTerm.toLowerCase();
    const exactMatches: NameEntry[] = [];
    const startsWithResults: NameEntry[] = [];
    const containsResults: NameEntry[] = [];

    // Single pass through all names for efficiency
    for (const name of this.allNames) {
      const lowerName = name.name.toLowerCase();

      if (lowerName === lowerSearch) {
        // FIRST PRIORITY: Exact match (e.g., "Jo" as a complete name)
        exactMatches.push({ ...name, searchPriority: 1 });
      } else if (lowerName.startsWith(lowerSearch)) {
        // SECOND PRIORITY: Names that START with the search term
        startsWithResults.push({ ...name, searchPriority: 2 });
      } else if (lowerName.includes(lowerSearch)) {
        // THIRD PRIORITY: Names that contain the search term elsewhere
        containsResults.push({ ...name, searchPriority: 3 });
      }
    }

    // Sort each category alphabetically for perfect ordering
    // This ensures Jo -> Joana -> Joan -> Joanna -> John -> Jordan -> Joseph
    exactMatches.sort((a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase()));
    startsWithResults.sort((a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase()));
    containsResults.sort((a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase()));

    // Combine results in priority order - NO LIMIT (show all matching names)
    return [...exactMatches, ...startsWithResults, ...containsResults];
  }

  /**
   * Search names with meaning-first priority
   * Used when "Search meanings" checkbox is enabled
   * Priority: 1) Meanings containing term, 2) Names starting with term, 3) Names containing term
   */
  async searchNamesByMeaning(searchTerm: string): Promise<NameEntry[]> {
    if (!searchTerm) return [];

    const lowerSearch = searchTerm.toLowerCase();
    const meaningMatches: NameEntry[] = [];
    const startsWithResults: NameEntry[] = [];
    const containsResults: NameEntry[] = [];

    // Single pass through all names for efficiency
    for (const name of this.allNames) {
      const lowerName = name.name.toLowerCase();

      // Check if meaning contains search term
      const meaningText = [
        name.meaning,
        name.meaningShort,
        name.meaningFull,
        ...(name.meanings || [])
      ].filter(Boolean).join(' ').toLowerCase();

      const hasMeaningMatch = meaningText.includes(lowerSearch);

      // PRIORITY 1: Meaning contains search term
      if (hasMeaningMatch) {
        meaningMatches.push({ ...name, searchPriority: 1 });
      }
      // PRIORITY 2: Name starts with search term (only if NOT in meaning matches)
      else if (lowerName.startsWith(lowerSearch)) {
        startsWithResults.push({ ...name, searchPriority: 2 });
      }
      // PRIORITY 3: Name contains search term elsewhere (only if NOT in meaning matches)
      else if (lowerName.includes(lowerSearch)) {
        containsResults.push({ ...name, searchPriority: 3 });
      }
    }

    // Sort each category alphabetically
    meaningMatches.sort((a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase()));
    startsWithResults.sort((a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase()));
    containsResults.sort((a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase()));

    // Combine results in priority order
    return [...meaningMatches, ...startsWithResults, ...containsResults];
  }

  /**
   * Get total names count
   */
  getTotalNames(): number {
    return this.allNames.length; // Full database is always loaded
  }

  /**
   * Get all names (returns full loaded database)
   */
  getAllNames(limit: number = 250000): NameEntry[] {
    // Return ALL names we have loaded, not just emergency fallback
    const actualLimit = Math.min(limit, this.allNames.length);
    console.log(`📊 Returning ${actualLimit} names from database of ${this.allNames.length} total names`);
    return this.allNames.slice(0, actualLimit);
  }

  /**
   * Get popular names (top N) sorted by popularity rank
   */
  getPopularNames(limit = 100): NameEntry[] {
    const actualLimit = Math.min(limit, this.allNames.length);
    // Sort by popularityRank first, then slice
    const sorted = [...this.allNames].sort((a, b) => {
      const rankA = a.popularityRank || 999999;
      const rankB = b.popularityRank || 999999;
      return rankA - rankB;
    });
    return sorted.slice(0, actualLimit);
  }

  /**
   * Get names by country
   */
  getNamesByCountry(country: string): NameEntry[] {
    return this.allNames.filter(n => n.primaryCountry === country);
  }

  /**
   * Get names by gender
   */
  getNamesByGender(gender: 'male' | 'female' | 'unisex'): NameEntry[] {
    return this.allNames.filter(n => {
      if (typeof n.gender === 'object') {
        const maleScore = n.gender.Male || 0;
        const femaleScore = n.gender.Female || 0;

        if (gender === 'unisex') {
          // Calculate if name is unisex
          return this.isUnisexName(n);
        } else if (gender === 'male') {
          return maleScore > femaleScore;
        } else {
          return femaleScore > maleScore;
        }
      }
      return false;
    });
  }

  /**
   * Check if a name is unisex based on gender scores
   */
  isUnisexName(name: NameEntry): boolean {
    if (name.isUnisex !== undefined) {
      return name.isUnisex;
    }

    if (typeof name.gender === 'object' && name.gender) {
      const maleScore = name.gender.Male || 0;
      const femaleScore = name.gender.Female || 0;
      const total = maleScore + femaleScore;

      if (total === 0) return false;

      const maleRatio = maleScore / total;
      // Consider unisex if ratio is between 35% and 65%
      const threshold = 0.35;

      return maleRatio >= threshold && maleRatio <= (1 - threshold);
    }

    return false;
  }

  /**
   * Calculate unisex score (0-1 scale, 0.5 is perfectly balanced)
   */
  getUnisexScore(name: NameEntry): number {
    if (name.unisexScore !== undefined) {
      return name.unisexScore;
    }

    if (typeof name.gender === 'object' && name.gender) {
      const maleScore = name.gender.Male || 0;
      const femaleScore = name.gender.Female || 0;
      const total = maleScore + femaleScore;

      if (total === 0) return 0;

      const maleRatio = maleScore / total;
      // Return how close to 0.5 (perfect balance) the ratio is
      return 1 - Math.abs(0.5 - maleRatio) * 2;
    }

    return 0;
  }

  /**
   * Get unique origins
   */
  getOrigins(): string[] {
    const origins = new Set(this.allNames.map(n => n.origin || 'unknown'));
    return Array.from(origins);
  }

  /**
   * Get countries list
   */
  getCountries(): string[] {
    const countries = new Set<string>();
    this.allNames.forEach(name => {
      if (name.primaryCountry) {
        countries.add(name.primaryCountry);
      }
    });
    return Array.from(countries);
  }

  /**
   * Get count of names by gender
   */
  getGenderCounts(): { total: number; male: number; female: number; unisex: number } {
    let male = 0;
    let female = 0;
    let unisex = 0;

    this.allNames.forEach(name => {
      if (this.isUnisexName(name)) {
        unisex++;
      } else if (typeof name.gender === 'object' && name.gender) {
        const maleScore = name.gender.Male || 0;
        const femaleScore = name.gender.Female || 0;

        if (maleScore > femaleScore) {
          male++;
        } else if (femaleScore > maleScore) {
          female++;
        }
      }
    });

    return {
      total: this.allNames.length,
      male,
      female,
      unisex
    };
  }

  /**
   * Get filtered count based on current filter state
   */
  getFilteredCount(
    searchTerm: string = '',
    gender: 'all' | 'male' | 'female' | 'unisex' = 'all',
    showFavorites: boolean = false
  ): number {
    let results = this.allNames;

    // Apply search filter
    if (searchTerm) {
      results = results.filter(name =>
        name.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply gender filter
    if (gender !== 'all') {
      results = results.filter(name => {
        if (gender === 'unisex') {
          return this.isUnisexName(name);
        } else if (typeof name.gender === 'object' && name.gender) {
          const isMale = (name.gender.Male || 0) > (name.gender.Female || 0);
          return gender === 'male' ? isMale : !isMale;
        }
        return false;
      });
    }

    // Apply favorites filter (if needed)
    if (showFavorites) {
      // This would need to be integrated with favoritesService
      // For now, just return the current count
    }

    return results.length;
  }

  /**
   * Wait for database to be fully loaded
   * Ensures all chunks are loaded before proceeding
   */
  async waitForLoad(): Promise<void> {
    // Wait for core chunk to be ready
    await chunkedDatabaseService.waitForCore();

    // Update our local names array
    this.allNames = chunkedDatabaseService.getAllNames();

    console.log(`✅ waitForLoad: Database ready with ${this.allNames.length} names`);
  }

  /**
   * Get name details by exact match (case-insensitive)
   */
  async getNameDetails(name: string): Promise<NameEntry | null> {
    // Ensure database is loaded
    if (this.allNames.length === 0) {
      await this.waitForLoad();
    }

    // Search in loaded names (case-insensitive)
    const found = this.allNames.find(n => n.name.toLowerCase() === name.toLowerCase());
    return found || null;
  }

  /**
   * Get popular count
   */
  private getPopularCount(): number {
    return this.allNames.filter(n => n.isPopular).length;
  }

  /**
   * Load more names (no-op, all names already loaded)
   */
  async loadMore(): Promise<void> {
    console.log(`📊 All ${this.allNames.length} names already loaded`);
  }
}

// Export singleton instance
const nameService = new NameService();
export default nameService;