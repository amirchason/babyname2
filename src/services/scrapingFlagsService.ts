/**
 * Scraping Flags Service
 * Tracks what data has been scraped for each name to prevent redundant scraping
 */

export interface ScrapingFlags {
  // Basic information flags
  basic_info?: {
    scraped: boolean;
    timestamp: string;
    source?: string;
  };

  // Meaning and origin data
  meaning_scraped?: {
    scraped: boolean;
    timestamp: string;
    source?: string;
  };

  // Popularity and ranking data
  popularity_data?: {
    scraped: boolean;
    timestamp: string;
    source?: string;
  };

  // Pronunciation data
  pronunciation?: {
    scraped: boolean;
    timestamp: string;
    source?: string;
  };

  // Cultural significance data
  cultural_info?: {
    scraped: boolean;
    timestamp: string;
    source?: string;
  };

  // Name variations and alternatives
  variations?: {
    scraped: boolean;
    timestamp: string;
    source?: string;
  };

  // Wikipedia data
  wikipedia?: {
    scraped: boolean;
    timestamp: string;
    source?: string;
  };

  // Social media trends
  social_media?: {
    scraped: boolean;
    timestamp: string;
    source?: string;
  };

  // Celebrity associations
  celebrity_data?: {
    scraped: boolean;
    timestamp: string;
    source?: string;
  };

  // Religious/spiritual significance
  religious_data?: {
    scraped: boolean;
    timestamp: string;
    source?: string;
  };
}

export type ScrapingDataType = keyof ScrapingFlags;

interface ScrapingFlagsStorage {
  [nameLowerCase: string]: ScrapingFlags;
}

class ScrapingFlagsService {
  private readonly STORAGE_KEY = 'babynames_scraping_flags';
  private flags: ScrapingFlagsStorage = {};

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage(): void {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        this.flags = JSON.parse(stored);
      }
    } catch (error) {
      console.error('Error loading scraping flags from storage:', error);
      this.flags = {};
    }
  }

  private saveToStorage(): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.flags));
    } catch (error) {
      console.error('Error saving scraping flags to storage:', error);
    }
  }

  /**
   * Check if a specific data type has been scraped for a name
   */
  hasBeenScraped(name: string, dataType: ScrapingDataType): boolean {
    const nameLower = name.toLowerCase();
    const nameFlags = this.flags[nameLower];

    if (!nameFlags || !nameFlags[dataType]) {
      return false;
    }

    return nameFlags[dataType]?.scraped || false;
  }

  /**
   * Mark a data type as scraped for a name
   */
  markAsScraped(
    name: string,
    dataType: ScrapingDataType,
    source?: string
  ): void {
    const nameLower = name.toLowerCase();

    if (!this.flags[nameLower]) {
      this.flags[nameLower] = {};
    }

    this.flags[nameLower][dataType] = {
      scraped: true,
      timestamp: new Date().toISOString(),
      source: source
    };

    this.saveToStorage();
  }

  /**
   * Get all scraping flags for a name
   */
  getFlags(name: string): ScrapingFlags {
    const nameLower = name.toLowerCase();
    return this.flags[nameLower] || {};
  }

  /**
   * Get names that need scraping for a specific data type
   */
  getNamesNeedingScraping(
    allNames: string[],
    dataType: ScrapingDataType
  ): string[] {
    return allNames.filter(name => !this.hasBeenScraped(name, dataType));
  }

  /**
   * Reset scraping flags for a name (force re-scraping)
   */
  resetFlags(name: string, dataType?: ScrapingDataType): void {
    const nameLower = name.toLowerCase();

    if (!this.flags[nameLower]) {
      return;
    }

    if (dataType) {
      // Reset specific data type
      delete this.flags[nameLower][dataType];
    } else {
      // Reset all flags for the name
      delete this.flags[nameLower];
    }

    this.saveToStorage();
  }

  /**
   * Get scraping statistics
   */
  getScrapingStats(): {
    totalNames: number;
    scrapedCounts: Record<ScrapingDataType, number>;
    completionPercentages: Record<ScrapingDataType, number>;
  } {
    const totalNames = Object.keys(this.flags).length;
    const scrapedCounts: Partial<Record<ScrapingDataType, number>> = {};

    const dataTypes: ScrapingDataType[] = [
      'basic_info', 'meaning_scraped', 'popularity_data',
      'pronunciation', 'cultural_info', 'variations',
      'wikipedia', 'social_media', 'celebrity_data', 'religious_data'
    ];

    dataTypes.forEach(dataType => {
      scrapedCounts[dataType] = Object.values(this.flags)
        .filter(flags => flags[dataType]?.scraped).length;
    });

    const completionPercentages: Partial<Record<ScrapingDataType, number>> = {};
    dataTypes.forEach(dataType => {
      completionPercentages[dataType] = totalNames > 0
        ? Math.round(((scrapedCounts[dataType] || 0) / totalNames) * 100)
        : 0;
    });

    return {
      totalNames,
      scrapedCounts: scrapedCounts as Record<ScrapingDataType, number>,
      completionPercentages: completionPercentages as Record<ScrapingDataType, number>
    };
  }

  /**
   * Export flags to JSON for Python scrapers
   */
  exportToJSON(): string {
    return JSON.stringify(this.flags, null, 2);
  }

  /**
   * Import flags from JSON (from Python scrapers)
   */
  importFromJSON(jsonData: string): void {
    try {
      const importedFlags = JSON.parse(jsonData);

      // Merge with existing flags
      Object.keys(importedFlags).forEach(name => {
        if (!this.flags[name]) {
          this.flags[name] = {};
        }

        Object.assign(this.flags[name], importedFlags[name]);
      });

      this.saveToStorage();
    } catch (error) {
      console.error('Error importing scraping flags:', error);
    }
  }

  /**
   * Clear all flags (use with caution)
   */
  clearAllFlags(): void {
    this.flags = {};
    this.saveToStorage();
  }

  /**
   * Get names that are fully scraped (all data types)
   */
  getFullyScrapedNames(): string[] {
    const dataTypes: ScrapingDataType[] = [
      'basic_info', 'meaning_scraped', 'popularity_data', 'pronunciation'
    ];

    return Object.keys(this.flags).filter(name => {
      const nameFlags = this.flags[name];
      return dataTypes.every(dataType => nameFlags[dataType]?.scraped);
    });
  }

  /**
   * Get scraping progress for a specific name
   */
  getNameProgress(name: string): {
    totalFields: number;
    scrapedFields: number;
    percentage: number;
    missingFields: ScrapingDataType[];
  } {
    const nameFlags = this.getFlags(name);
    const allFields: ScrapingDataType[] = [
      'basic_info', 'meaning_scraped', 'popularity_data',
      'pronunciation', 'cultural_info', 'variations'
    ];

    const scrapedFields = allFields.filter(field => nameFlags[field]?.scraped);
    const missingFields = allFields.filter(field => !nameFlags[field]?.scraped);

    return {
      totalFields: allFields.length,
      scrapedFields: scrapedFields.length,
      percentage: Math.round((scrapedFields.length / allFields.length) * 100),
      missingFields
    };
  }
}

const scrapingFlagsService = new ScrapingFlagsService();
export default scrapingFlagsService;