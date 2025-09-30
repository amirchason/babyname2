/**
 * Optimized Name Service with Progressive Loading
 * Handles 228K names efficiently with chunk loading and caching
 */

export interface OptimizedNameEntry {
  id: number;
  n: string;  // name
  g: string;  // gender: M/F/U
  r: number;  // rank
  o: string;  // origin
  l: number;  // length
  s: number;  // syllables
  p: number;  // popularity score
  t: number;  // tier
  categories?: string[];
  styles?: string[];
  lists?: string[];
  meaning_short?: string;
  unprocessed_meaning_elaborated?: string;
}

interface ChunkMetadata {
  chunk: string;
  count: number;
  generated: string;
}

interface ChunkData {
  metadata: ChunkMetadata;
  names: OptimizedNameEntry[];
}

interface SearchIndex {
  byLetter: Record<string, number[]>;
  byGender: Record<string, number[]>;
  byOrigin: Record<string, number[]>;
  lookup: Record<string, number>;
}

interface SwipeDecks {
  quick: number[];
  full: number[];
  male: number[];
  female: number[];
  unisex: number[];
  categories: Record<string, number[]>;
}

class OptimizedNameService {
  // Three-tier cache system
  private memoryCache: Map<number, OptimizedNameEntry> = new Map();
  private chunksLoaded: Set<string> = new Set();
  private searchIndex: SearchIndex | null = null;
  private swipeDecks: SwipeDecks | null = null;
  private totalCountFromChunks: number = 0;

  // Loading states
  private loadingChunks: Map<string, Promise<ChunkData>> = new Map();
  private coreLoaded: boolean = false;

  // Configuration
  // In development, CRA serves public files from root, in production from PUBLIC_URL
  private readonly BASE_URL = process.env.NODE_ENV === 'development'
    ? '/data'
    : (process.env.PUBLIC_URL || '') + '/data';
  private readonly CHUNKS = [
    { name: 'core', priority: 1 },
    { name: 'popular', priority: 2 },
    { name: 'chunk-1', priority: 3 },
    { name: 'chunk-2', priority: 4 },
    { name: 'chunk-3', priority: 5 }
  ];

  constructor() {
    // Start loading core immediately
    this.loadCore();
  }

  /**
   * Load core names (top 1000) for instant availability
   */
  private async loadCore(): Promise<void> {
    try {
      const coreData = await this.fetchChunk('core');
      this.processCoreData(coreData);
      this.coreLoaded = true;
      console.log('✓ Core names loaded (1000 names ready)');

      // Preload popular names in background
      setTimeout(() => this.loadChunk('popular'), 100);
    } catch (error) {
      console.error('Failed to load core names:', error);
    }
  }

  /**
   * Fetch a compressed chunk from the server
   */
  private async fetchChunk(chunkName: string): Promise<ChunkData> {
    // Check if already loading
    if (this.loadingChunks.has(chunkName)) {
      return this.loadingChunks.get(chunkName)!;
    }

    // Create loading promise
    const loadPromise = fetch(`${this.BASE_URL}/names-${chunkName}.json`)
      .then(response => {
        if (!response.ok) {
          console.error(`Failed to fetch ${chunkName}: ${response.status} from ${this.BASE_URL}/names-${chunkName}.json`);
          throw new Error(`Failed to fetch ${chunkName}: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        console.log(`✓ Successfully loaded ${chunkName} chunk (${data.names?.length || 0} names)`);
        this.loadingChunks.delete(chunkName);
        this.chunksLoaded.add(chunkName);
        return data as ChunkData;
      })
      .catch(error => {
        console.error(`✗ Error loading ${chunkName} chunk:`, error);
        this.loadingChunks.delete(chunkName);
        throw error;
      });

    this.loadingChunks.set(chunkName, loadPromise);
    return loadPromise;
  }

  /**
   * Process core data into memory cache
   */
  private processCoreData(chunkData: ChunkData): void {
    // Track total count from core chunk
    this.totalCountFromChunks += chunkData.metadata.count;

    for (const name of chunkData.names) {
      this.memoryCache.set(name.id, name);
    }
  }

  /**
   * Load a specific chunk
   */
  async loadChunk(chunkName: string): Promise<void> {
    if (this.chunksLoaded.has(chunkName)) {
      return;
    }

    const chunkData = await this.fetchChunk(chunkName);

    // Track total count from chunk metadata
    this.totalCountFromChunks += chunkData.metadata.count;

    // Check if we're loading all chunks - if so, expand memory cache
    const allChunks = ['core', 'popular', 'chunk-1', 'chunk-2', 'chunk-3'];
    const shouldExpandCache = this.chunksLoaded.size >= 3; // When loading 3+ chunks, expand cache

    // Add to memory cache (with conditional size limit)
    for (const name of chunkData.names) {
      // Only apply memory limit if not loading full database
      if (!shouldExpandCache && this.memoryCache.size > 10000) {
        const firstKey = this.memoryCache.keys().next().value;
        this.memoryCache.delete(firstKey);
      }
      this.memoryCache.set(name.id, name);
    }

    console.log(`✓ Loaded ${chunkName} (${chunkData.names.length} names) - Total in cache: ${this.memoryCache.size}`);
  }

  /**
   * Load search indexes
   */
  async loadSearchIndex(): Promise<void> {
    if (this.searchIndex) return;

    try {
      const response = await fetch(`${this.BASE_URL}/names-index.json`);
      this.searchIndex = await response.json();
      console.log('✓ Search index loaded');
    } catch (error) {
      console.error('Failed to load search index:', error);
    }
  }

  /**
   * Load swipe decks
   */
  async loadSwipeDecks(): Promise<void> {
    if (this.swipeDecks) return;

    try {
      const response = await fetch(`${this.BASE_URL}/swipe-decks.json`);
      this.swipeDecks = await response.json();
      console.log('✓ Swipe decks loaded');
    } catch (error) {
      console.error('Failed to load swipe decks:', error);
    }
  }

  /**
   * Get a name by ID
   */
  async getNameById(id: number): Promise<OptimizedNameEntry | null> {
    // Check memory cache first
    if (this.memoryCache.has(id)) {
      return this.memoryCache.get(id)!;
    }

    // Determine which chunk contains this ID
    const chunkName = this.getChunkForId(id);
    if (chunkName) {
      await this.loadChunk(chunkName);
      return this.memoryCache.get(id) || null;
    }

    return null;
  }

  /**
   * Get multiple names by IDs (for swipe deck)
   */
  async getNamesByIds(ids: number[]): Promise<OptimizedNameEntry[]> {
    const names: OptimizedNameEntry[] = [];
    const missingIds: number[] = [];

    // Check cache first
    for (const id of ids) {
      if (this.memoryCache.has(id)) {
        names.push(this.memoryCache.get(id)!);
      } else {
        missingIds.push(id);
      }
    }

    // Load missing names
    if (missingIds.length > 0) {
      // Group by chunk for efficient loading
      const chunkGroups = this.groupIdsByChunk(missingIds);

      // Load required chunks
      await Promise.all(
        Array.from(chunkGroups.keys()).map(chunk => this.loadChunk(chunk))
      );

      // Get names from cache
      for (const id of missingIds) {
        const name = this.memoryCache.get(id);
        if (name) names.push(name);
      }
    }

    return names;
  }

  /**
   * Search names with prefix
   */
  async searchNames(query: string, limit: number = 50): Promise<OptimizedNameEntry[]> {
    // Ensure search index is loaded
    await this.loadSearchIndex();

    if (!this.searchIndex) {
      return [];
    }

    const normalizedQuery = query.toLowerCase();
    const results: OptimizedNameEntry[] = [];

    // Use lookup table for exact matches
    if (this.searchIndex.lookup[normalizedQuery]) {
      const id = this.searchIndex.lookup[normalizedQuery];
      const name = await this.getNameById(id);
      if (name) results.push(name);
    }

    // Search by prefix in loaded names
    for (const [id, name] of this.memoryCache) {
      if (name.n.toLowerCase().startsWith(normalizedQuery)) {
        results.push(name);
        if (results.length >= limit) break;
      }
    }

    return results.slice(0, limit);
  }

  /**
   * Get a swipe deck
   */
  async getSwipeDeck(deckType: 'quick' | 'male' | 'female' | 'unisex' | 'full'): Promise<number[]> {
    await this.loadSwipeDecks();

    if (!this.swipeDecks) {
      return [];
    }

    return this.swipeDecks[deckType] || [];
  }

  /**
   * Get names for a swipe session
   */
  async getSwipeCards(deckType: string, start: number = 0, count: number = 20): Promise<OptimizedNameEntry[]> {
    const deck = await this.getSwipeDeck(deckType as any);
    const cardIds = deck.slice(start, start + count);
    return this.getNamesByIds(cardIds);
  }

  /**
   * Determine which chunk contains a given ID
   */
  private getChunkForId(id: number): string | null {
    // Based on our splitting logic
    if (id < 1000) return 'core';
    if (id < 10000) return 'popular';
    if (id < 50000) return 'chunk-1';
    if (id < 100000) return 'chunk-2';
    if (id < 230000) return 'chunk-3';
    return null;
  }

  /**
   * Group IDs by their containing chunk
   */
  private groupIdsByChunk(ids: number[]): Map<string, number[]> {
    const groups = new Map<string, number[]>();

    for (const id of ids) {
      const chunk = this.getChunkForId(id);
      if (chunk) {
        if (!groups.has(chunk)) {
          groups.set(chunk, []);
        }
        groups.get(chunk)!.push(id);
      }
    }

    return groups;
  }

  /**
   * Get loading status
   */
  getLoadingStatus(): {
    coreLoaded: boolean;
    chunksLoaded: string[];
    totalLoaded: number;
    isLoading: boolean;
  } {
    return {
      coreLoaded: this.coreLoaded,
      chunksLoaded: Array.from(this.chunksLoaded),
      totalLoaded: this.totalCountFromChunks > 0 ? this.totalCountFromChunks : this.memoryCache.size,
      isLoading: this.loadingChunks.size > 0
    };
  }

  /**
   * Preload chunks for smooth experience
   */
  async preloadAll(): Promise<void> {
    const loadPromises = this.CHUNKS.map(chunk =>
      this.loadChunk(chunk.name).catch(err =>
        console.error(`Failed to load ${chunk.name}:`, err)
      )
    );

    await Promise.all(loadPromises);
    console.log('✓ All chunks preloaded');
  }

  /**
   * Clear memory cache to free up space
   */
  clearMemoryCache(): void {
    // Keep only core names
    const coreNames = new Map<number, OptimizedNameEntry>();

    for (const [id, name] of this.memoryCache) {
      if (id < 1000) {
        coreNames.set(id, name);
      }
    }

    this.memoryCache = coreNames;
    console.log('Memory cache cleared, kept core names');
  }
}

// Export singleton instance
const optimizedNameService = new OptimizedNameService();
export default optimizedNameService;