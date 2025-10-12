/**
 * Chunked Database Service
 * Loads 224k+ names progressively:
 * - Core: 1000 names (instant)
 * - Progressive chunks: Load on demand
 */

import { NameEntry } from './nameService';
import { largeFallbackNames } from '../data/largeFallbackNames';

interface ChunkMetadata {
  file: string;
  fileGz: string;
  count: number;
  startIndex: number;
  endIndex: number;
}

interface DatabaseIndex {
  version: string;
  totalNames: number;
  chunks: Record<string, ChunkMetadata>;
}

class ChunkedDatabaseService {
  private allNames: NameEntry[] = [];
  private loadedChunks: Set<string> = new Set();
  private index: DatabaseIndex | null = null;
  private isLoadingCore = false;
  private isLoadingChunk: Record<string, boolean> = {};
  private coreLoadPromise: Promise<void> | null = null;

  constructor() {
    // Start with emergency fallback for INSTANT display
    this.allNames = [...largeFallbackNames];
    console.log(`⚡ ChunkedDatabaseService CONSTRUCTOR: Started with ${this.allNames.length} fallback names`);

    // Load core chunk immediately and store the promise
    console.log(`⚡ ChunkedDatabaseService: Calling loadCore()...`);
    this.coreLoadPromise = this.loadCore();
  }

  /**
   * Wait for core chunk to finish loading
   */
  async waitForCore(): Promise<void> {
    if (this.coreLoadPromise) {
      await this.coreLoadPromise;
    }
  }

  /**
   * Load the index file
   */
  private async loadIndex(): Promise<void> {
    if (this.index) return;

    try {
      console.log('📇 Loading database index...');
      const response = await fetch(`${process.env.PUBLIC_URL}/data/names-index.json`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const indexData = await response.json();
      this.index = indexData;
      console.log(`✅ Index loaded: ${indexData.totalNames.toLocaleString()} total names in ${Object.keys(indexData.chunks).length} chunks`);
    } catch (error) {
      console.error('❌ Failed to load index:', error);
      this.index = null;
    }
  }

  /**
   * Load core chunk (top 1000 names) for instant display
   */
  async loadCore(): Promise<void> {
    console.log(`⚡ loadCore() called. isLoadingCore=${this.isLoadingCore}, hasCore=${this.loadedChunks.has('core')}`);

    if (this.isLoadingCore || this.loadedChunks.has('core')) {
      console.log(`⚡ loadCore() SKIPPED (already loading or loaded)`);
      return;
    }

    this.isLoadingCore = true;
    console.log(`⚡ loadCore() STARTING...`);

    try {
      console.log('⚡ Loading core chunk (top 1000 names)...');

      // Load index first
      console.log('⚡ Loading index...');
      await this.loadIndex();
      console.log(`⚡ Index loaded: ${this.index ? 'SUCCESS' : 'FAILED'}`);

      // Load core chunk
      console.log(`⚡ Fetching core from: ${process.env.PUBLIC_URL}/data/names-core.json`);
      const response = await fetch(`${process.env.PUBLIC_URL}/data/names-core.json`);
      console.log(`⚡ Core fetch response: ${response.status} ${response.statusText}`);

      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const data = await response.json();
      console.log(`⚡ Core data parsed. Structure: ${Array.isArray(data) ? 'Array' : 'Object'}`);

      // Handle both array format and object with .names property
      const coreNames = Array.isArray(data) ? data : (data.names || []);
      console.log(`⚡ Core names extracted: ${coreNames.length} names`);

      // Replace fallback with core names
      this.allNames = coreNames;
      this.loadedChunks.add('core');

      console.log(`✅ Core chunk loaded: ${coreNames.length} names (this.allNames.length = ${this.allNames.length})`);
    } catch (error) {
      console.error('❌ Failed to load core chunk:', error);
      // Keep fallback names
    } finally {
      this.isLoadingCore = false;
    }
  }

  /**
   * Load a specific chunk
   */
  async loadChunk(chunkName: string): Promise<void> {
    if (this.loadedChunks.has(chunkName) || this.isLoadingChunk[chunkName]) {
      return;
    }

    this.isLoadingChunk[chunkName] = true;

    try {
      console.log(`📦 Loading ${chunkName}...`);

      if (!this.index) {
        await this.loadIndex();
      }

      if (!this.index) {
        throw new Error('Index not available');
      }

      const chunkInfo = this.index.chunks[chunkName];
      if (!chunkInfo) {
        throw new Error(`Chunk ${chunkName} not found in index`);
      }

      // Load chunk
      const response = await fetch(`${process.env.PUBLIC_URL}/data/${chunkInfo.file}`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const data = await response.json();
      // Handle both array format and object with .names property
      const chunkNames = Array.isArray(data) ? data : (data.names || []);

      // Deduplicate before appending
      const existingNameSet = new Set(this.allNames.map(n => n.name.toLowerCase()));
      const newNames = chunkNames.filter((name: NameEntry) => !existingNameSet.has(name.name.toLowerCase()));

      // Append only unique names
      this.allNames = [...this.allNames, ...newNames];
      this.loadedChunks.add(chunkName);

      console.log(`✅ ${chunkName} loaded: ${chunkNames.length} names from file, ${newNames.length} unique added (TOTAL NOW: ${this.allNames.length})`);
    } catch (error) {
      console.error(`❌ Failed to load ${chunkName}:`, error);
    } finally {
      this.isLoadingChunk[chunkName] = false;
    }
  }

  /**
   * Load all chunks progressively
   */
  async loadAllChunks(): Promise<void> {
    if (!this.index) {
      await this.loadIndex();
    }

    if (!this.index) {
      console.error('❌ Cannot load chunks: index not available');
      return;
    }

    // Load chunks in order (skip core if already loaded)
    const chunkNames = Object.keys(this.index.chunks).filter(name => name !== 'core');

    for (const chunkName of chunkNames) {
      if (!this.loadedChunks.has(chunkName)) {
        await this.loadChunk(chunkName);
      }
    }

    console.log(`✅ All chunks loaded! Total: ${this.allNames.length} names`);
  }

  /**
   * Get all currently loaded names
   */
  getAllNames(): NameEntry[] {
    return this.allNames;
  }

  /**
   * Get total names count (including unloaded chunks)
   */
  getTotalNamesCount(): number {
    return this.index?.totalNames || this.allNames.length;
  }

  /**
   * Get loading status
   */
  getStatus(): { loadedNames: number; totalNames: number; loadedChunks: number; totalChunks: number } {
    return {
      loadedNames: this.allNames.length,
      totalNames: this.index?.totalNames || this.allNames.length,
      loadedChunks: this.loadedChunks.size,
      totalChunks: this.index ? Object.keys(this.index.chunks).length : 1
    };
  }
}

// Export singleton
const chunkedDatabaseService = new ChunkedDatabaseService();
export default chunkedDatabaseService;