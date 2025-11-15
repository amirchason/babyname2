/**
 * V13 ENRICHMENT DETECTION & LOADING SERVICE
 *
 * Detects which names have v13 enriched data and loads it on demand
 */

export interface V13Manifest {
  version: string;
  lastUpdated: string;
  totalEnriched: number;
  names: string[];
}

export interface V13EnrichedData {
  name: string;
  enrichmentVersion: string;
  enrichedAt: string;
  gender: string;
  origin: string;
  meaning: string;
  culturalSignificance?: string;
  modernContext?: string;
  literaryReferences?: string;
  pronunciationGuide?: string;
  variations?: string[];
  similarNames?: string[];
  nicknames?: string[];
  personality?: string;
  symbolism?: string;
  funFact?: string;
  religiousSignificance?: {
    hasSignificance: boolean;
    religions: string[];
    character: string;
    significance: string;
    keyStories: string[];
    spiritualMeaning: string;
    historicalImpact: string;
  };
  historicFigures?: Array<{
    fullName: string;
    years: string;
    category: string;
    achievements: string[];
    significance: string;
    notableWorks: string[];
  }>;
  famousQuotes?: Array<{
    quote: string;
    author: string;
    context: string;
    year: number;
    category: string;
  }>;
  famousPeople?: Array<{
    name: string;
    profession: string;
    knownFor: string[];
    awards: string;
  }>;
  famousAthletes?: Array<{
    name: string;
    profession: string;
    sport: string;
    league: string;
    team: string;
    pastTeams: string[];
    position: string;
    jerseyNumber: string;
    years: string;
    achievements: string;
    knownFor: string[];
    awards: string;
    stats: string;
    verified: boolean;
    source: string;
  }>;
  moviesAndShows?: Array<{
    title: string;
    year: number;
    type: string;
    characterName: string;
    characterDescription: string;
    imdbUrl: string;
    genre: string;
    verified: boolean;
    popularity: number;
  }>;
  characterQuotes?: Array<{
    quote: string;
    character: string;
    source: string;
    year: number;
    context: string;
    genre: string;
    impact: string;
  }>;
  celestialData?: {
    luckyNumber: number;
    dominantElement: string;
    luckyColor: { name: string; hex: string };
    luckyGemstone: string;
    luckyDay: string;
    moonPhase: string;
    moonPhaseDescription: string;
    compatibleSigns: string[];
    compatibleSignsDescription: string;
    cosmicElement: string;
    cosmicElementDescription: string;
    celestialArchetype: string;
    celestialArchetypeDescription: string;
    karmicLessons: string;
    soulUrge: number;
    soulUrgeDescription: string;
  };
  genderDistribution?: {
    male: number;
    female: number;
  };
  ranking?: {
    current: number;
    peak: number;
    peakYear: number;
  };
  inspiration?: {
    type: string;
    content: string;
    author: string;
    context: string;
  };
  syllables?: {
    count: number;
    breakdown: string;
  };
  translations?: Array<{
    language: string;
    name: string;
    script: string;
    scriptName: string;
    pronunciation: string;
    rtl: boolean;
  }>;
  booksWithName?: Array<{
    title: string;
    author: string;
    publishedYear: number;
    genre: string;
    significance: string;
    nameRole: string;
    verified: boolean;
  }>;
  celebrityBabies?: Array<{
    childName: string;
    parentNames: string[];
    birthYear: number;
    context: string;
  }>;
  categories?: Array<{
    tag: string;
    confidence: number;
    reason: string;
  }>;
  songs?: Array<{
    title: string;
    artist: string;
    year: number;
    genre: string;
    nameContext: string;
    description: string;
    theme: string;
    positiveVibeScore: number;
    youtubeSearchUrl: string;
    geniusUrl: string;
    verified: boolean;
  }>;
  v11BlogContent?: {
    opening_hook: string;
    etymology_meaning: string;
    famous_bearers: string;
    pop_culture_moments: string;
    personality_profile: string;
    variations_nicknames: string;
    popularity_data: string;
    pairing_suggestions: string;
    cultural_context: string;
    final_recommendation: string;
    writer_name: string;
    writer_title: string;
  };
  v11Writer?: string;
  v11WriterName?: string;
  v11WriterTitle?: string;
  [key: string]: any; // Allow additional fields
}

class V13Service {
  private manifest: V13Manifest | null = null;
  private cache: Map<string, V13EnrichedData> = new Map();
  private loading: Set<string> = new Set();

  /**
   * Initialize service and load manifest
   */
  async initialize(): Promise<void> {
    try {
      const response = await fetch('/data/enriched/v13-manifest.json');
      if (response.ok) {
        this.manifest = await response.json();
        console.log(`✅ V13 Service initialized: ${this.manifest?.totalEnriched || 0} enriched names`);
      } else {
        console.warn('⚠️  V13 manifest not found - no enriched names available yet');
        this.manifest = { version: '1.0', lastUpdated: '', totalEnriched: 0, names: [] };
      }
    } catch (error) {
      console.warn('⚠️  Failed to load V13 manifest:', error);
      this.manifest = { version: '1.0', lastUpdated: '', totalEnriched: 0, names: [] };
    }
  }

  /**
   * Check if a name has v13 enriched data
   */
  isEnriched(name: string): boolean {
    if (!this.manifest) {
      return false;
    }
    return this.manifest.names.includes(name.toLowerCase());
  }

  /**
   * Get list of all enriched names
   */
  getEnrichedNames(): string[] {
    return this.manifest?.names || [];
  }

  /**
   * Load v13 data for a name
   */
  async load(name: string): Promise<V13EnrichedData | null> {
    const nameLower = name.toLowerCase();

    // Check if not enriched
    if (!this.isEnriched(nameLower)) {
      return null;
    }

    // Check cache
    if (this.cache.has(nameLower)) {
      return this.cache.get(nameLower)!;
    }

    // Check if already loading
    if (this.loading.has(nameLower)) {
      // Wait for existing load
      return new Promise((resolve) => {
        const check = setInterval(() => {
          if (this.cache.has(nameLower)) {
            clearInterval(check);
            resolve(this.cache.get(nameLower)!);
          }
          if (!this.loading.has(nameLower)) {
            clearInterval(check);
            resolve(null);
          }
        }, 100);
      });
    }

    // Load from file
    this.loading.add(nameLower);

    try {
      const response = await fetch(`/data/enriched/${nameLower}-v13.json`);
      if (!response.ok) {
        throw new Error(`Failed to load: ${response.statusText}`);
      }

      const data: V13EnrichedData = await response.json();
      this.cache.set(nameLower, data);
      this.loading.delete(nameLower);

      console.log(`✅ Loaded V13 data for: ${name}`);
      return data;
    } catch (error) {
      console.error(`❌ Failed to load V13 data for ${name}:`, error);
      this.loading.delete(nameLower);
      return null;
    }
  }

  /**
   * Preload data for multiple names (for performance)
   */
  async preload(names: string[]): Promise<void> {
    const promises = names
      .filter(n => this.isEnriched(n))
      .map(n => this.load(n));

    await Promise.all(promises);
  }

  /**
   * Clear cache (useful for testing/dev)
   */
  clearCache(): void {
    this.cache.clear();
    console.log('🗑️  V13 cache cleared');
  }

  /**
   * Get cache stats
   */
  getCacheStats(): { size: number; names: string[] } {
    return {
      size: this.cache.size,
      names: Array.from(this.cache.keys())
    };
  }
}

// Singleton instance
export const v13Service = new V13Service();

// Initialize on module load (fire and forget)
v13Service.initialize().catch(console.error);

export default v13Service;
