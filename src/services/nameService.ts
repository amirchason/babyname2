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
  origin?: string;
  meaning?: string;
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

    // Start loading full database in background (will upgrade from 10k to full)
    this.initializeDatabase();

    // Also load all chunks progressively in the background
    this.loadAllChunksInBackground();
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
   * Get popular names (with emergency fallback)
   */
  getPopularNames(limit: number = 100): NameEntry[] {
    // If we have cached names, return them
    if (this.allNames.length > 0) {
      return this.allNames.slice(0, Math.min(limit, this.allNames.length));
    }

    // Emergency fallback: return hardcoded top names to ensure homepage always shows names
    console.log(`⚡ Using emergency fallback: returning ${Math.min(limit, this.emergencyFallbackNames.length)} hardcoded names`);
    return this.emergencyFallbackNames.slice(0, Math.min(limit, this.emergencyFallbackNames.length));
  }

  /**
   * Search names
   */
  async searchNames(searchTerm: string): Promise<NameEntry[]> {
    if (!searchTerm) return [];

    const lowerSearch = searchTerm.toLowerCase();

    // Prioritize names that START with the search term
    const startsWithResults = this.allNames.filter(name =>
      name.name.toLowerCase().startsWith(lowerSearch)
    );

    // Then include names that contain the search term
    const containsResults = this.allNames.filter(name =>
      name.name.toLowerCase().includes(lowerSearch) &&
      !name.name.toLowerCase().startsWith(lowerSearch)
    );

    return [...startsWithResults, ...containsResults].slice(0, 100);
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
   * Get names by country
   */
  getNamesByCountry(country: string): NameEntry[] {
    return this.allNames.filter(n => n.primaryCountry === country);
  }

  /**
   * Get names by gender
   */
  getNamesByGender(gender: 'male' | 'female'): NameEntry[] {
    return this.allNames.filter(n => {
      if (typeof n.gender === 'object') {
        if (gender === 'male') {
          return (n.gender.Male || 0) > (n.gender.Female || 0);
        } else {
          return (n.gender.Female || 0) > (n.gender.Male || 0);
        }
      }
      return false;
    });
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
      if (typeof name.gender === 'object' && name.gender) {
        const maleScore = name.gender.Male || 0;
        const femaleScore = name.gender.Female || 0;

        if (maleScore > femaleScore) {
          male++;
        } else if (femaleScore > maleScore) {
          female++;
        } else {
          unisex++;
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
    gender: 'all' | 'male' | 'female' = 'all',
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
        if (typeof name.gender === 'object' && name.gender) {
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
   * Get name details
   */
  async getNameDetails(name: string): Promise<NameEntry | undefined> {
    // Search in loaded names
    return this.allNames.find(n => n.name.toLowerCase() === name.toLowerCase());
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