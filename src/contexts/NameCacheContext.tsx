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

    // Origin consolidation mapping - groups small origins into broader categories
    const consolidateOrigin = (origin: string): string => {
      const lower = origin.toLowerCase().trim();

      // Scottish & Irish consolidation (shared Gaelic heritage)
      if (lower === 'scottish' || lower === 'irish' || lower === 'scots' || lower === 'gaelic' ||
          lower === 'celtic' || lower.includes('scottish') || lower.includes('irish') ||
          lower.includes('scots') || lower.includes('gaelic') || lower.includes('celtic')) {
        return 'Scottish & Irish';
      }

      // Slavic & Eastern European (Polish, Russian, Czech, Bulgarian, Ukrainian, etc.)
      if (lower === 'slavic' || lower === 'polish' || lower === 'russian' || lower === 'bulgarian' ||
          lower === 'czech' || lower === 'ukrainian' || lower === 'croatian' || lower === 'serbian' ||
          lower === 'slovak' || lower === 'belarusian' || lower.includes('slavic') ||
          lower.includes('polish') || lower.includes('russian')) {
        return 'Slavic';
      }

      // Germanic & Nordic (German, Germanic, Norse, Scandinavian, Nordic, Swedish, Danish, Norwegian, Finnish)
      if (lower === 'germanic' || lower === 'german' || lower === 'swiss' || lower === 'norse' ||
          lower === 'old norse' || lower === 'scandinavian' || lower === 'nordic' || lower === 'swedish' ||
          lower === 'danish' || lower === 'norwegian' || lower === 'finnish' || lower === 'icelandic' ||
          lower.includes('germanic') || lower.includes('german') || lower.includes('norse') ||
          lower.includes('scandinavian') || lower.includes('nordic') || lower.includes('swedish') ||
          lower.includes('danish') || lower.includes('norwegian') || lower.includes('finnish')) {
        return 'Germanic & Nordic';
      }

      // Hebrew & Biblical
      if (lower === 'hebrew' || lower === 'biblical' || lower.includes('hebrew') || lower.includes('biblical')) {
        return 'Hebrew & Biblical';
      }

      // Greek & Mythological
      if (lower === 'greek' || lower === 'mythological' || lower === 'egyptian' || lower === 'old english' ||
          lower.includes('greek') || lower.includes('mythological') || lower.includes('egyptian')) {
        return 'Greek & Mythological';
      }

      // Contemporary & Modern (Latin American, Invented, American, Literary, Modern, Fantasy, Fictional)
      if (lower === 'contemporary' || lower === 'latin american' || lower === 'invented' ||
          lower === 'american' || lower === 'literary' || lower === 'modern' || lower === 'modern english' ||
          lower === 'fantasy' || lower === 'fictional' || lower.includes('contemporary') ||
          lower.includes('invented') || lower.includes('literary') || lower.includes('fantasy')) {
        return 'Contemporary';
      }

      // Middle Eastern & Caucasian
      if (lower === 'middle eastern' || lower === 'caucasian' || lower === 'aramaic' || lower === 'turkic' ||
          lower.includes('middle eastern') || lower.includes('caucasian') || lower.includes('aramaic')) {
        return 'Middle Eastern';
      }

      // African origins (group all African origins with < 150 names)
      if (lower.includes('african') || lower.includes('swahili') || lower.includes('yoruba') ||
          lower.includes('igbo') || lower.includes('akan') || lower.includes('hausa') ||
          lower.includes('ewe') || lower.includes('amharic') || lower.includes('shona') ||
          lower.includes('edo') || lower.includes('sesotho') || lower.includes('sotho') ||
          lower.includes('bantu') || lower.includes('tsonga') || lower.includes('ghanaian') ||
          lower.includes('nigerian') || lower.includes('ethiopian') || lower.includes('zimbabwean') ||
          lower.includes('somali') || lower.includes('ibibio') || lower.includes('efik') ||
          lower.includes('tswana') || lower.includes('botswana') || lower.includes('malawi') ||
          lower.includes('chewa') || lower.includes('wolof') || lower.includes('senegalese') ||
          lower.includes('ugandan') || lower.includes('kenyan') || lower.includes('rwandan') ||
          lower.includes('zambian') || lower.includes('bemba') || lower.includes('venda') ||
          lower.includes('tshivenda') || lower.includes('swazi') || lower.includes('ndebele') ||
          lower.includes('luo') || lower.includes('kikuyu') || lower.includes('maasai') ||
          lower.includes('dinka') || lower.includes('sudanese')) {
        return 'African';
      }

      // South Asian origins (Sanskrit, Hindi, Bengali, etc.) - with exact matching
      if (lower === 'sanskrit' || lower === 'hindi' || lower === 'bengali' || lower === 'punjabi' ||
          lower === 'tamil' || lower === 'urdu' || lower === 'telugu' || lower === 'kannada' ||
          lower === 'gujarati' || lower === 'marathi' || lower === 'malayalam' || lower === 'nepali' ||
          lower === 'pali' || lower === 'sikh' || lower === 'hindu' || lower === 'south asian' ||
          lower.includes('sanskrit') || lower.includes('hindi') || lower.includes('bengali') ||
          lower.includes('punjabi') || lower.includes('tamil') || lower.includes('urdu') ||
          lower.includes('telugu') || lower.includes('kannada') || lower.includes('gujarati') ||
          lower.includes('marathi') || lower.includes('malayalam') || lower.includes('nepali') ||
          lower.includes('sikh') || lower.includes('hindu') || lower.includes('assamese') ||
          lower.includes('oriya') || lower.includes('manipuri') || lower.includes('mizo') ||
          lower.includes('rajasthani') || lower.includes('rajput') || lower.includes('sinhalese')) {
        // Keep Indian as the parent if already present
        if (lower.includes('indian')) return 'Indian';
        return 'South Asian';
      }

      // Southeast Asian origins
      if (lower.includes('vietnamese') || lower.includes('thai') || lower.includes('indonesian') ||
          lower.includes('malay') || lower.includes('filipino') || lower.includes('burmese') ||
          lower.includes('tagalog') || lower.includes('javanese') || lower.includes('khmer') ||
          lower.includes('cambodian') || lower.includes('myanmar') || lower.includes('balinese') ||
          lower.includes('sundanese') || lower.includes('ilocano') || lower.includes('cebuano')) {
        return 'Southeast Asian';
      }

      // Central/West Asian origins (Persian, Armenian, Georgian, etc.)
      if (lower.includes('persian') || lower.includes('armenian') || lower.includes('georgian') ||
          lower.includes('kazakh') || lower.includes('uzbek') || lower.includes('azerbaijani') ||
          lower.includes('turkmen') || lower.includes('kurdish') || lower.includes('pashto') ||
          lower.includes('afghan') || lower.includes('turkic') || lower.includes('mongolian') ||
          lower.includes('tibetan') || lower.includes('iranian')) {
        return 'Central/West Asian';
      }

      // Small European origins
      if (lower.includes('albanian') || lower.includes('basque') || lower.includes('estonian') ||
          lower.includes('latvian') || lower.includes('lithuanian') || lower.includes('maltese') ||
          lower.includes('icelandic') || lower.includes('slovenian') || lower.includes('croatian') ||
          lower.includes('serbian') || lower.includes('bulgarian') || lower.includes('macedonian') ||
          lower.includes('romanian') || lower.includes('hungarian') || lower.includes('czech') ||
          lower.includes('slovak') || lower.includes('bosnian') || lower.includes('finnish') ||
          lower.includes('norwegian') || lower.includes('swedish') || lower.includes('danish')) {
        // Keep major categories if already present
        if (lower.includes('slavic')) return 'Slavic';
        if (lower.includes('scandinavian') || lower.includes('nordic')) return 'Nordic';
        return 'European (Other)';
      }

      // Indigenous & Oceanic origins
      if (lower.includes('maori') || lower.includes('aboriginal') || lower.includes('polynesian') ||
          lower.includes('hawaiian') || lower.includes('native') || lower.includes('indigenous') ||
          lower.includes('native-american') || lower.includes('cherokee') || lower.includes('navajo') ||
          lower.includes('hopi') || lower.includes('inuit') || lower.includes('ojibwe') ||
          lower.includes('samoan') || lower.includes('tongan') || lower.includes('fijian') ||
          lower.includes('tahitian')) {
        return 'Indigenous & Oceanic';
      }

      // Latin American Indigenous origins
      if (lower.includes('nahuatl') || lower.includes('mayan') || lower.includes('quechua') ||
          lower.includes('aztec') || lower.includes('inca') || lower.includes('guarani') ||
          lower.includes('mapuche') || lower.includes('aymara') || lower.includes('taino')) {
        return 'Indigenous Americas';
      }

      // Return original if no consolidation applies
      return origin;
    };

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
            // Apply consolidation logic to group small origins
            const consolidatedOrigin = consolidateOrigin(cleanOrigin);
            originCounts.set(consolidatedOrigin, (originCounts.get(consolidatedOrigin) || 0) + 1);
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
      'Scottish & Irish', 'French', 'Italian', 'Germanic', 'Celtic',
      // Third Tier - Popular regional/cultural
      'Indian', 'Chinese', 'Japanese', 'Hindi', 'Persian', 'Russian', 'Portuguese', 'Polish',
      // Fourth Tier - Growing interest
      'Korean', 'Nordic', 'Welsh', 'Dutch', 'Turkish', 'Sanskrit', 'Biblical', 'Slavic',
      // Fifth Tier - Consolidated regional/cultural categories
      'African', 'South Asian', 'Southeast Asian', 'Central/West Asian', 'European (Other)',
      'Indigenous & Oceanic', 'Indigenous Americas', 'Middle Eastern', 'Latin American',
      // Sixth Tier - Specific subcategories (if not consolidated)
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
