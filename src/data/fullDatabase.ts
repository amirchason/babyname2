/**
 * Full Names Database Module
 * Fast loading with 10k popular names
 */

import { NameEntry } from '../services/nameService';

// Import emergency fallback for instant display
import { largeFallbackNames } from './largeFallbackNames';

// Start with fallback names for INSTANT display, then load full database
export let fullDatabase: NameEntry[] = [...largeFallbackNames];

// Metadata
export const databaseMetadata = {
  source: 'popularNames_cache.json',
  version: '10.0.0',
  description: '10,000 most popular baby names',
  lastUpdated: new Date().toISOString(),
  totalNames: 10000,
  countries: {},
  workingCountries: []
};

// Load database from public folder
let loadPromise: Promise<void> | null = null;
let isLoading = false;

export const loadDatabase = async (): Promise<NameEntry[]> => {
  // Always return immediately with at least fallback names
  if (fullDatabase.length > 500) {
    console.log(`✅ Database already loaded: ${fullDatabase.length} names`);
    return fullDatabase;
  }

  if (loadPromise) {
    await loadPromise;
    return fullDatabase;
  }

  if (isLoading) {
    // Wait for current load
    while (isLoading) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    return fullDatabase;
  }

  isLoading = true;
  console.log('📊 Loading names database from /data/popularNames_cache.json...');
  console.log(`📊 Starting with ${fullDatabase.length} fallback names for instant display`);

  loadPromise = fetch(`${process.env.PUBLIC_URL}/data/popularNames_cache.json`)
    .then(res => {
      console.log(`📊 Fetch response status: ${res.status}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      return res.json();
    })
    .then(data => {
      console.log(`📊 Received data, checking structure...`);
      if (data && data.names && Array.isArray(data.names)) {
        fullDatabase = data.names;
        console.log(`✅ Successfully loaded ${fullDatabase.length} names from popularNames_cache.json!`);
      } else if (Array.isArray(data)) {
        fullDatabase = data;
        console.log(`✅ Successfully loaded ${fullDatabase.length} names (direct array)!`);
      } else {
        console.error('❌ Invalid database structure:', Object.keys(data || {}));
        console.log(`⚡ Keeping ${fullDatabase.length} fallback names`);
      }
      isLoading = false;
    })
    .catch(err => {
      console.error('❌ Failed to load database:', err.message);
      console.log(`⚡ Using ${fullDatabase.length} fallback names`);
      // Keep the fallback names we already have
      isLoading = false;
    });

  await loadPromise;
  return fullDatabase;
};

// Export database info
export const getDatabaseInfo = () => {
  return {
    totalNames: fullDatabase.length || 10000,
    metadata: databaseMetadata,
    source: 'popularNames_cache.json (10k curated names)'
  };
};

// Auto-load on import
loadDatabase();

console.log('📊 Loading 10,000 curated baby names...');