/**
 * Name Cache Context
 * Provides persistent name data across navigation
 * Prevents reloading names when returning to HomePage
 */

import React, { createContext, useContext, useState, useEffect, ReactNode, useRef } from 'react';
import nameService, { NameEntry } from '../services/nameService';
import chunkedDatabaseService from '../services/chunkedDatabaseService';

interface NameCacheContextType {
  names: NameEntry[];
  isLoading: boolean;
  isInitialized: boolean;
  allOrigins: { origin: string; count: number }[];
  genderCounts: { total: number; male: number; female: number; unisex: number };
  refreshCache: () => void;
  debugInfo: { initialLoad: number; fullLoad: number; currentCount: number; status: string; initCount: number };
}

const NameCacheContext = createContext<NameCacheContextType | undefined>(undefined);

export const NameCacheProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [names, setNames] = useState<NameEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);
  const [allOrigins, setAllOrigins] = useState<{ origin: string; count: number }[]>([]);
  const [genderCounts, setGenderCounts] = useState({ total: 0, male: 0, female: 0, unisex: 0 });
  const [debugInfo, setDebugInfo] = useState({ initialLoad: 0, fullLoad: 0, currentCount: 0, status: 'starting', initCount: 0 });

  // Use ref to prevent multiple initializations (persists across renders)
  const hasInitializedRef = useRef(false);
  const isInitializingRef = useRef(false);
  const backgroundTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Load names ONCE on app startup
  useEffect(() => {
    const initializeNameCache = async () => {
      // Prevent multiple initializations using refs (persist across renders)
      if (hasInitializedRef.current || isInitializingRef.current) {
        console.log('⚠️  BLOCKED: Duplicate initialization attempt prevented');
        setDebugInfo(prev => ({ ...prev, initCount: prev.initCount + 1 }));
        return;
      }

      hasInitializedRef.current = true;
      isInitializingRef.current = true;

      try {
        console.log('🚀 NameCacheContext: Initializing name cache...');
        setDebugInfo(prev => ({ ...prev, initCount: prev.initCount + 1, status: 'initializing' }));
        setIsLoading(true);

        // WAIT for core chunk to actually finish loading
        console.log('⏳ Waiting for core chunk to load...');
        await chunkedDatabaseService.waitForCore();
        console.log('✅ Core chunk loaded!');

        // Get initial 1000 popular names for instant display
        const popularNames = nameService.getPopularNames(1000);
        console.log(`📊 Got ${popularNames.length} popular names`);
        setNames(popularNames);
        setDebugInfo(prev => ({ ...prev, initialLoad: popularNames.length, currentCount: popularNames.length, status: 'initial-loaded' }));

        // Calculate initial origins and gender counts
        calculateOrigins(popularNames);
        const initialCounts = nameService.getGenderCounts();
        setGenderCounts(initialCounts);

        setIsLoading(false);
        setIsInitialized(true);
        console.log(`✅ NameCacheContext: Cache initialized with ${popularNames.length} names`);

        // Load full database in background (non-blocking)
        backgroundTimerRef.current = setTimeout(async () => {
          console.log('📦 NameCacheContext: Loading full database in background...');
          console.log(`   Current names in cache: ${popularNames.length}`);
          setDebugInfo(prev => ({ ...prev, status: 'loading-chunks' }));

          await nameService.loadFullDatabase();

          const allNames = nameService.getAllNames(250000);
          console.log(`   After loadFullDatabase: ${allNames.length} names available`);
          setNames(allNames);
          setDebugInfo(prev => ({ ...prev, fullLoad: allNames.length, currentCount: allNames.length, status: allNames.length > 10000 ? 'complete' : 'incomplete' }));

          // Update origins and counts with full data
          calculateOrigins(allNames);
          const fullCounts = nameService.getGenderCounts();
          setGenderCounts(fullCounts);

          console.log(`✅ NameCacheContext: Full database loaded and cached (${allNames.length} names)`);
          console.log('ℹ️  Local enrichment DISABLED - using cloud service only');
        }, 100);

      } catch (error) {
        console.error('❌ NameCacheContext: Error initializing cache:', error);
        setIsLoading(false);
        setIsInitialized(true);
        hasInitializedRef.current = false; // Reset on error so it can retry
      } finally {
        isInitializingRef.current = false;
      }
    };

    initializeNameCache();

    // Cleanup function to clear timer on unmount
    return () => {
      if (backgroundTimerRef.current) {
        console.log('🧹 Cleaning up background timer');
        clearTimeout(backgroundTimerRef.current);
        backgroundTimerRef.current = null;
      }
    };
  }, []); // Only run ONCE on app startup

  // Calculate origins from names
  const calculateOrigins = (nameList: NameEntry[]) => {
    const originCounts = new Map<string, number>();

    // Helper to check if name matches English-related patterns
    const isEnglishRelated = (name: any): boolean => {
      const rawPatterns = ['english', 'modern', 'contemporary', 'american', 'old english'];
      const groupPatterns = ['english', 'germanic', 'old english', 'modern english',
                            'american', 'native american', 'indigenous americas'];
      const allPatterns = [...rawPatterns, ...groupPatterns];

      const checkField = (field: any): boolean => {
        if (!field) return false;
        const values = Array.isArray(field) ? field : [field];

        return values.some((val: any) => {
          const valLower = String(val).toLowerCase();
          return allPatterns.some(pattern => {
            if (valLower === pattern) return true;
            if (valLower.includes(pattern + ',') || valLower.includes(',' + pattern)) return true;
            if (valLower.startsWith(pattern + ' ') ||
                valLower.endsWith(' ' + pattern) ||
                valLower.includes(' ' + pattern + ' ')) return true;
            return false;
          });
        });
      };

      return checkField(name.origin) || checkField((name as any).originGroup);
    };

    nameList.forEach(name => {
      const originField = (name as any).originGroup || name.origin;
      if (originField) {
        const origins = Array.isArray(originField) ? originField : [originField];
        origins.forEach(origin => {
          if (origin && origin.trim()) {
            const cleanOrigin = origin.trim();
            originCounts.set(cleanOrigin, (originCounts.get(cleanOrigin) || 0) + 1);
          }
        });
      }
    });

    // Consolidate English-related origins into "English" count
    const englishRelatedCount = nameList.filter(name => isEnglishRelated(name)).length;

    // Update English count to show consolidated number
    if (englishRelatedCount > 0) {
      originCounts.set('English', englishRelatedCount);
    }

    // Manual priority order based on research of top baby name origin searches
    const originPriority = [
      // Top Tier - Most searched globally
      'Hebrew', 'Latin', 'Greek', 'English', 'Spanish', 'Arabic',
      // Second Tier - Very popular
      'Irish', 'French', 'Italian', 'Germanic', 'Scottish', 'Celtic',
      // Third Tier - Popular regional/cultural
      'Indian', 'Chinese', 'Japanese', 'Hindi', 'Persian', 'Russian', 'Portuguese', 'Polish',
      // Fourth Tier - Growing interest
      'Korean', 'Nordic', 'Welsh', 'Dutch', 'Turkish', 'Sanskrit', 'Biblical', 'Slavic',
      // Fifth Tier - Specific cultural/regional
      'African', 'Middle Eastern', 'Latin American', 'Indigenous Americas', 'Southeast Asian',
      'Gujarati', 'Bengali', 'Punjabi', 'Tamil', 'Telugu', 'Malayalam', 'Kannada', 'Urdu', 'Marathi',
      'Albanian', 'Basque', 'Bulgarian', 'Caucasian', 'Central Asian', 'Croatian', 'Czech',
      'East African', 'Hungarian', 'Polynesian', 'Serbian', 'Slovak', 'Southern African',
      'Tibetan', 'Ukrainian', 'West African', 'Yiddish', 'Bantu', 'Aramaic',
      // Bottom Tier - Generic/utility categories
      'Contemporary', 'Mythological', 'Religious', 'Romance', 'Descriptive', 'Invented',
      // Always last
      'Other', 'Unknown'
    ];

    // Create a priority map for O(1) lookup
    const priorityMap = new Map(originPriority.map((origin, index) => [origin.toLowerCase(), index]));

    const sortedOrigins = Array.from(originCounts.entries())
      .map(([origin, count]) => ({ origin, count }))
      .sort((a, b) => {
        const aPriority = priorityMap.get(a.origin.toLowerCase());
        const bPriority = priorityMap.get(b.origin.toLowerCase());

        // If both have priority, sort by priority index (lower = higher priority)
        if (aPriority !== undefined && bPriority !== undefined) {
          return aPriority - bPriority;
        }

        // If only a has priority, it comes first
        if (aPriority !== undefined) return -1;

        // If only b has priority, it comes first
        if (bPriority !== undefined) return 1;

        // If neither has priority (shouldn't happen), sort alphabetically
        return a.origin.localeCompare(b.origin);
      });

    setAllOrigins(sortedOrigins);
  };

  // Refresh cache (if needed)
  const refreshCache = () => {
    const freshNames = nameService.getAllNames(250000);
    setNames(freshNames);
    calculateOrigins(freshNames);
    const freshCounts = nameService.getGenderCounts();
    setGenderCounts(freshCounts);
  };

  return (
    <NameCacheContext.Provider
      value={{
        names,
        isLoading,
        isInitialized,
        allOrigins,
        genderCounts,
        refreshCache,
        debugInfo
      }}
    >
      {children}
    </NameCacheContext.Provider>
  );
};

export const useNameCache = () => {
  const context = useContext(NameCacheContext);
  if (context === undefined) {
    throw new Error('useNameCache must be used within a NameCacheProvider');
  }
  return context;
};
