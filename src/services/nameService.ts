import namesCache from '../data/popularNames_cache.json';

export interface NameEntry {
  name: string;
  originalName: string;
  type: string;
  gender: {
    Male?: number;
    Female?: number;
  };
  countries: Record<string, number>;
  globalCountries: Record<string, number>;
  primaryCountry: string;
  appearances: number;
  popularityRank: number;
  globalFrequency: number;
  popularityScore?: number;
  globalPopularityScore: number;
  abbreviations?: string[];
  isAbbreviation?: boolean;
  isPotentialAbbreviation?: boolean;
  variants?: string[];
  searchPriority?: number; // 1 for starts with, 2 for contains
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
  private database: NamesDatabase | null = null;
  private popularNames: NameEntry[] = [];
  private loading = false;
  private loaded = false;

  constructor() {
    // Load popular names cache immediately
    this.loadPopularNamesCache();
  }

  private loadPopularNamesCache() {
    try {
      this.popularNames = (namesCache as any).names || [];
      console.log(`Loaded ${this.popularNames.length} popular names from cache`);
    } catch (error) {
      console.error('Error loading names cache:', error);
      this.popularNames = [];
    }
  }

  async loadFullDatabase(): Promise<void> {
    if (this.loaded || this.loading) return;

    this.loading = true;
    try {
      const response = await fetch('/data/namesDatabase.json');
      if (!response.ok) {
        throw new Error(`Failed to load database: ${response.statusText}`);
      }
      this.database = await response.json();
      this.loaded = true;
      console.log(`Loaded full database with ${this.database?.metadata.totalNames} names`);
    } catch (error) {
      console.error('Error loading full database:', error);
      // Fall back to using just the cache
      this.database = {
        metadata: (namesCache as any).metadata || {},
        names: this.popularNames
      } as NamesDatabase;
    } finally {
      this.loading = false;
    }
  }

  getPopularNames(limit: number = 100): NameEntry[] {
    return this.popularNames.slice(0, limit);
  }

  searchNames(query: string, limit: number = 50): NameEntry[] {
    if (!query) return this.getPopularNames(limit);

    const searchTerm = query.toLowerCase();
    const names = this.loaded && this.database ? this.database.names : this.popularNames;

    // Separate names that start with searchTerm vs contain it
    const startsWithNames: NameEntry[] = [];
    const containsNames: NameEntry[] = [];

    names.forEach(name => {
      const nameLower = name.name.toLowerCase();
      const originalLower = name.originalName?.toLowerCase() || '';

      if (nameLower.startsWith(searchTerm) || originalLower.startsWith(searchTerm)) {
        startsWithNames.push({ ...name, searchPriority: 1 });
      } else if (nameLower.includes(searchTerm) || originalLower.includes(searchTerm)) {
        containsNames.push({ ...name, searchPriority: 2 });
      }
    });

    // Combine: first show names starting with searchTerm, then names containing it
    return [...startsWithNames, ...containsNames].slice(0, limit);
  }

  getNamesByGender(gender: 'male' | 'female', limit: number = 50): NameEntry[] {
    const names = this.loaded && this.database ? this.database.names : this.popularNames;

    return names
      .filter(name => {
        const maleProb = name.gender.Male || 0;
        const femaleProb = name.gender.Female || 0;
        return gender === 'male' ? maleProb > femaleProb : femaleProb > maleProb;
      })
      .slice(0, limit);
  }

  getNamesByCountry(countryCode: string, limit: number = 50): NameEntry[] {
    const names = this.loaded && this.database ? this.database.names : this.popularNames;

    return names
      .filter(name => countryCode in name.countries)
      .sort((a, b) => (a.countries[countryCode] || 999) - (b.countries[countryCode] || 999))
      .slice(0, limit);
  }

  getTotalNames(): number {
    if (this.database) {
      return this.database.metadata.totalNames;
    }
    return this.popularNames.length;
  }

  getCountries(): string[] {
    if (this.database) {
      return this.database.metadata.workingCountries;
    }
    // Extract from popular names
    const countries = new Set<string>();
    this.popularNames.forEach(name => {
      Object.keys(name.countries).forEach(country => countries.add(country));
    });
    return Array.from(countries);
  }

  getNameDetails(name: string): NameEntry | undefined {
    const names = this.loaded && this.database ? this.database.names : this.popularNames;
    return names.find(n => n.name.toLowerCase() === name.toLowerCase());
  }
}

const nameService = new NameService();
export default nameService;