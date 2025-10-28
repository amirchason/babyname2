import React, { useState, useEffect, useCallback, useMemo, lazy, Suspense } from 'react';
import { Search, Baby, Star, TrendingUp, Globe, Users, ArrowDownAZ, Dices, Filter, Trophy, Heart, Menu, X, LogIn, LogOut, Cloud, CloudOff, RefreshCw, ChevronDown, Check, Grid3x3, List, Type, Ruler, Music, Sparkles, Minimize2, Maximize2, Library, ThumbsUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useNameCache } from '../contexts/NameCacheContext';
import { useFirstVisit } from '../hooks/useFirstVisit';
import { motion, AnimatePresence } from 'framer-motion';
import nameService, { NameEntry } from '../services/nameService';
import favoritesService from '../services/favoritesService';
import enrichmentService from '../services/enrichmentService';
import unisexService from '../services/unisexService';
import NameCard from '../components/NameCard';
import NameCardCompact from '../components/NameCardCompact';
import NameDetailModal from '../components/NameDetailModal';
import SwipingQuestionnaire from '../components/SwipingQuestionnaire';
import AppHeader from '../components/AppHeader';
import { oneSyllableNames } from '../data/oneSyllableNames';
import SEOHead from '../components/SEO/SEOHead';
import StructuredData from '../components/SEO/StructuredData';

const HomePage: React.FC = () => {
  // Use global name cache (prevents reloading on navigation)
  const { names: cachedNames, isLoading: cacheLoading, allOrigins: cachedOrigins, genderCounts: cachedGenderCounts } = useNameCache();

  // Track if this is first visit (prevents animation replay)
  const isFirstVisit = useFirstVisit('homepage');

  const [searchTerm, setSearchTerm] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchMeanings, setSearchMeanings] = useState(false);
  const [filteredNames, setFilteredNames] = useState<NameEntry[]>([]);
  const [selectedName, setSelectedName] = useState<NameEntry | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const [activeFilter, setActiveFilter] = useState<'all' | 'male' | 'female' | 'unisex'>('all');
  const [sortBy, setSortBy] = useState<'popularity' | 'alphabetical' | 'random'>('popularity');
  const [sortReverse, setSortReverse] = useState(false);
  const [currentFilteredCount, setCurrentFilteredCount] = useState(0);
  const [showFilterMessage, setShowFilterMessage] = useState(false);
  const [showFavorites, setShowFavorites] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(30); // 30 names per page (was 10)
  const [showQuestionnaire, setShowQuestionnaire] = useState(false);

  // ============================================
  // LIST1 MODE - STATE VARIABLES
  // ============================================
  // These states control the default comprehensive filtering/sorting experience
  // See docs/LIST_MODES.md for full documentation

  // View mode state (card or compact)
  const [viewMode, setViewMode] = useState<'card' | 'compact'>(() => {
    const saved = localStorage.getItem('nameListViewMode');
    return (saved === 'card' ? 'card' : 'compact') as 'card' | 'compact';
  });

  // Advanced filter states (Smart Filters drawer)
  const [selectedOrigins, setSelectedOrigins] = useState<Set<string>>(new Set());
  const [selectedStartLetters, setSelectedStartLetters] = useState<Set<string>>(new Set());
  const [selectedEndings, setSelectedEndings] = useState<Set<string>>(new Set());
  const [selectedSyllables, setSelectedSyllables] = useState<Set<number>>(new Set());
  const [selectedLengths, setSelectedLengths] = useState<Set<string>>(new Set());
  const [showOriginAccordion, setShowOriginAccordion] = useState(false);
  const [showFiltersModal, setShowFiltersModal] = useState(false);
  const [activeFilterTab, setActiveFilterTab] = useState<'origin' | 'letter' | 'length' | 'syllable' | 'ending'>('origin');

  // Shuffle trigger - increments each time shuffle is clicked to force re-randomization
  const [shuffleTrigger, setShuffleTrigger] = useState(0);

  // Animated counter state - only for first visit
  const [displayCount, setDisplayCount] = useState(1);
  const [isCountingComplete, setIsCountingComplete] = useState(!isFirstVisit);

  const navigate = useNavigate();
  const { user, isAuthenticated, login, logout, isSyncing, syncError, manualSync, clearCache } = useAuth();

  // Initialize enrichment service once when cached names are ready
  // TEMPORARILY DISABLED to debug loading issues
  /*
  useEffect(() => {
    if (cachedNames.length > 0 && isFirstVisit) {
      console.log('🚀 HomePage: Initializing enrichment service with cached names...');
      enrichmentService.initialize(cachedNames.slice(0, 1000));

      // Start unisex processing in background
      unisexService.startProcessing().then(() => {
        console.log('✅ HomePage: Unisex processing complete');
      });
    }
  }, [cachedNames, isFirstVisit]);
  */

  // Animated counter effect - only runs on first visit
  useEffect(() => {
    if (!isFirstVisit || cachedGenderCounts.total === 0) {
      setIsCountingComplete(true);
      return;
    }

    const targetCount = cachedGenderCounts.total;
    const duration = 2000; // 2 seconds for fast warp effect
    const startTime = Date.now();

    const animateCount = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Easing function for smooth acceleration (ease-out exponential)
      const easeOut = 1 - Math.pow(1 - progress, 4);

      const currentCount = Math.floor(easeOut * targetCount);
      setDisplayCount(Math.max(1, currentCount));

      if (progress < 1) {
        requestAnimationFrame(animateCount);
      } else {
        setDisplayCount(targetCount);
        setIsCountingComplete(true);
      }
    };

    // Start animation after a short delay
    const timeout = setTimeout(() => {
      animateCount();
    }, 500);

    return () => clearTimeout(timeout);
  }, [isFirstVisit, cachedGenderCounts.total]);

  // Origins are now provided by NameCacheContext (no need to recalculate)

  // Toggle origin selection
  const toggleOriginFilter = (origin: string) => {
    setSelectedOrigins(prev => {
      const newSet = new Set(prev);
      if (newSet.has(origin)) {
        newSet.delete(origin);
      } else {
        newSet.add(origin);
      }
      return newSet;
    });
  };

  // Clear all origin filters
  const clearOriginFilters = () => {
    setSelectedOrigins(new Set());
  };

  // Helper functions for advanced filters
  const countSyllables = (name: string): number => {
    const nameLower = name.toLowerCase().trim();

    // ✅ STEP 1: Check against REAL database of 16,606 1-syllable names
    if (oneSyllableNames.has(nameLower)) {
      return 1;
    }

    // ✅ STEP 2: Fallback algorithm for 2+ syllables
    // Short names are usually 1 syllable
    if (name.length <= 3) return 1;

    // Count vowel groups
    const vowels = 'aeiouy';
    let syllables = 0;
    let previousWasVowel = false;

    for (let i = 0; i < nameLower.length; i++) {
      const isVowel = vowels.includes(nameLower[i]);
      if (isVowel && !previousWasVowel) {
        syllables++;
      }
      previousWasVowel = isVowel;
    }

    // Adjust for silent e
    if (nameLower.endsWith('e') && syllables > 1) {
      syllables--;
    }

    // Names ending in -le after consonant add a syllable
    if (nameLower.endsWith('le') && name.length > 2) {
      const beforeLe = nameLower[nameLower.length - 3];
      if (!vowels.includes(beforeLe)) {
        syllables++;
      }
    }

    return Math.max(1, syllables);
  };

  const getNameLength = (name: string): string => {
    const len = name.length;
    if (len <= 4) return 'short';
    if (len <= 7) return 'medium';
    return 'long';
  };

  const getNameEnding = (name: string): string => {
    const endings = ['a', 'en', 'son', 'lyn', 'er', 'ie', 'el', 'ette', 'yn', 'ia', 'elle'];
    for (const ending of endings) {
      if (name.toLowerCase().endsWith(ending)) {
        return ending;
      }
    }
    return 'other';
  };

  // Clear ALL filters
  const clearAllFilters = () => {
    setSelectedOrigins(new Set());
    setSelectedStartLetters(new Set());
    setSelectedEndings(new Set());
    setSelectedSyllables(new Set());
    setSelectedLengths(new Set());
  };

  // Count active filters
  const activeFiltersCount = selectedOrigins.size + selectedStartLetters.size + selectedEndings.size + selectedSyllables.size + selectedLengths.size;

  const applySorting = useCallback((namesToSort: NameEntry[], preserveSearchOrder: boolean = false): NameEntry[] => {
    let sorted = [...namesToSort];

    // If we have search priorities, sort within each priority group
    if (preserveSearchOrder && sorted.some(n => n.searchPriority)) {
      const priority1 = sorted.filter(n => n.searchPriority === 1);
      const priority2 = sorted.filter(n => n.searchPriority === 2);
      const noPriority = sorted.filter(n => !n.searchPriority);

      // Sort each group separately
      const sortGroup = (group: NameEntry[]) => {
        let sortedGroup = [...group];
        switch (sortBy) {
          case 'alphabetical':
            sortedGroup = sortedGroup.sort((a, b) => a.name.localeCompare(b.name));
            break;
          case 'random':
            for (let i = sortedGroup.length - 1; i > 0; i--) {
              const j = Math.floor(Math.random() * (i + 1));
              [sortedGroup[i], sortedGroup[j]] = [sortedGroup[j], sortedGroup[i]];
            }
            break;
          case 'popularity':
          default:
            // Already sorted by popularity
            break;
        }
        if (sortReverse && sortBy !== 'random') {
          sortedGroup = sortedGroup.reverse();
        }
        return sortedGroup;
      };

      // Combine sorted groups preserving priority order
      return [...sortGroup(priority1), ...sortGroup(priority2), ...sortGroup(noPriority)];
    }

    // Regular sorting (no search priorities)
    switch (sortBy) {
      case 'alphabetical':
        sorted = sorted.sort((a, b) => a.name.localeCompare(b.name));
        break;

      case 'random':
        // Fisher-Yates shuffle (doesn't reverse, always new shuffle)
        for (let i = sorted.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [sorted[i], sorted[j]] = [sorted[j], sorted[i]];
        }
        return sorted; // Return early, no reverse for random

      case 'popularity':
      default:
        // Sort by popularity rank
        sorted = sorted.sort((a, b) => {
          const rankA = a.popularityRank || 999999;
          const rankB = b.popularityRank || 999999;
          return rankA - rankB;
        });
        break;
    }

    // Apply reverse if needed (except for random)
    if (sortReverse) {
      sorted = sorted.reverse();
    }

    return sorted;
  }, [sortBy, sortReverse]);

  useEffect(() => {
    const updateNames = async () => {
      // Handle search and filter using cached names
      let results = cachedNames;

      if (showFavorites) {
        // Show only favorite names
        results = results.filter(name => favoritesService.isFavorite(name.name));
      } else {
        // Filter out both liked AND disliked names from main view
        results = results.filter(name =>
          !favoritesService.isDisliked(name.name) &&
          !favoritesService.isFavorite(name.name)
        );
      }

      if (searchTerm) {
        // Use different search logic based on searchMeanings checkbox
        if (searchMeanings) {
          // MEANING-FIRST SEARCH: Prioritize meaning matches over name matches
          // Priority: 1) Meanings containing term, 2) Names starting with term, 3) Names containing term
          results = await nameService.searchNamesByMeaning(searchTerm);
        } else {
          // NAME-ONLY SEARCH: Standard three-tier priority (exact, starts with, contains)
          results = await nameService.searchNames(searchTerm);
        }

        // Filter out both liked and disliked names from search results
        results = results.filter(name =>
          !favoritesService.isDisliked(name.name) &&
          !favoritesService.isFavorite(name.name)
        );
      }

      if (activeFilter !== 'all') {
        results = results.filter(name => {
          if (activeFilter === 'unisex') {
            return nameService.isUnisexName(name);
          } else if (typeof name.gender === 'object' && name.gender) {
            const isMale = (name.gender.Male || 0) > (name.gender.Female || 0);
            return activeFilter === 'male' ? isMale : !isMale;
          }
          return false;
        });
      }

      // Apply origin filter (using consolidated originGroup)
      if (selectedOrigins.size > 0) {
        results = results.filter(name => {
          // Use originGroup if available, fallback to origin for backwards compatibility
          const originField = (name as any).originGroup || name.origin;
          if (!originField) return false;
          const origins = Array.isArray(originField) ? originField : [originField];
          return origins.some(origin => selectedOrigins.has(origin.trim()));
        });
      }

      // Apply starting letter filter
      if (selectedStartLetters.size > 0) {
        results = results.filter(name =>
          selectedStartLetters.has(name.name.charAt(0).toUpperCase())
        );
      }

      // Apply ending filter
      if (selectedEndings.size > 0) {
        results = results.filter(name => {
          const ending = getNameEnding(name.name);
          return selectedEndings.has(ending);
        });
      }

      // Apply syllable filter
      if (selectedSyllables.size > 0) {
        results = results.filter(name => {
          const syllables = countSyllables(name.name);
          return selectedSyllables.has(syllables);
        });
      }

      // Apply length filter
      if (selectedLengths.size > 0) {
        results = results.filter(name => {
          const length = getNameLength(name.name);
          return selectedLengths.has(length);
        });
      }

      // Apply sorting - preserve search priority when searching
      results = applySorting(results, !!searchTerm);

      setFilteredNames(results);

      // Update current filtered count
      setCurrentFilteredCount(results.length);
    };

    updateNames();
  }, [searchTerm, searchMeanings, activeFilter, cachedNames, sortBy, sortReverse, applySorting, showFavorites, selectedOrigins, selectedStartLetters, selectedEndings, selectedSyllables, selectedLengths, refreshTrigger, shuffleTrigger]);

  // Reset page when search term changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  // Origins are provided by NameCacheContext (already calculated)

  const handleFilterClick = (filter: 'all' | 'male' | 'female' | 'unisex') => {
    setActiveFilter(filter);
    setCurrentPage(1); // Reset to first page when filter changes
    if (filter !== 'all' && !searchTerm) {
      const genderNames = nameService.getNamesByGender(filter);
      setFilteredNames(genderNames);
    }
  };

  // Calculate pagination
  const totalPages = Math.ceil(filteredNames.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentNames = filteredNames.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Scroll to top of names section
    window.scrollTo({ top: 600, behavior: 'smooth' });
  };

  const handleQuestionnaireComplete = (preferences: any) => {
    setShowQuestionnaire(false);
    // Navigate to names page with preferences
    navigate('/names', { state: { preferences } });
  };

  // Origin filter handlers
  const handleOriginToggle = (origin: string) => {
    setSelectedOrigins(prev => {
      const newSet = new Set(prev);
      if (newSet.has(origin)) {
        newSet.delete(origin);
      } else {
        newSet.add(origin);
      }
      return newSet;
    });
    setCurrentPage(1); // Reset to first page when filter changes
  };

  const handleClearOrigins = () => {
    setSelectedOrigins(new Set());
    setCurrentPage(1);
  };

  // View mode toggle handler
  const toggleViewMode = () => {
    const newMode = viewMode === 'card' ? 'compact' : 'card';
    setViewMode(newMode);
    localStorage.setItem('nameListViewMode', newMode);
  };

  return (
    <>
      <SEOHead
        title="SoulSeed - Find Your Baby's Perfect Name | 174K+ Names"
        description="Discover meaningful baby names with AI-powered suggestions. Swipe through 174,000+ names from diverse cultures with instant cloud sync."
        canonical="https://soulseedbaby.com"
      />
      <StructuredData type="organization" />
      <StructuredData type="website" />
      <StructuredData type="webapp" />
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 overflow-x-hidden">
      <h1 className="sr-only">SoulSeed - Find Your Baby's Perfect Name</h1>
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000" />
        <div className="absolute top-40 left-1/2 w-80 h-80 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000" />
      </div>

      {/* Full-width Search Bar - Below Header */}
      <AnimatePresence>
        {searchOpen && (
          <>
            {/* Backdrop - Click outside to close */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/20 z-30"
              onClick={() => {
                setSearchOpen(false);
                setSearchTerm('');
              }}
            />

            {/* Search Bar with Swipe - Compact */}
            <motion.div
              initial={{ y: -100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -100, opacity: 0 }}
              transition={{ duration: 0.3, type: 'spring', damping: 25 }}
              drag="y"
              dragConstraints={{ top: 0, bottom: 0 }}
              dragElastic={{ top: 0.5, bottom: 0 }}
              onDragEnd={(e, { offset, velocity }) => {
                // Close search bar if dragged UP more than 80px or with high upward velocity
                if (offset.y < -80 || velocity.y < -500) {
                  setSearchOpen(false);
                  setSearchTerm('');
                }
              }}
              className="fixed top-[57px] left-0 right-0 z-50 bg-white border-b border-gray-200 shadow-lg"
            >
              {/* Close Button - Compact Top Right */}
              <button
                onClick={() => {
                  setSearchOpen(false);
                  setSearchTerm('');
                }}
                className="absolute top-1.5 right-2 p-1.5 rounded-full hover:bg-gray-100 transition-colors z-10"
                aria-label="Close search"
              >
                <X className="w-4 h-4 text-gray-600" />
              </button>

              <div className="max-w-7xl mx-auto px-3 sm:px-4 py-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Escape') {
                      setSearchOpen(false);
                      setSearchTerm('');
                    }
                    if (e.key === 'Enter' && searchTerm.trim()) {
                      // Navigate to search results page
                      const params = new URLSearchParams();
                      params.set('q', searchTerm);
                      if (searchMeanings) params.set('meanings', 'true');
                      navigate(`/search?${params.toString()}`);
                      setSearchOpen(false);
                    }
                  }}
                  placeholder="Search for a name..."
                  className="w-full pl-10 pr-4 py-2 text-sm border border-gray-200 rounded-lg
                           bg-gray-50 focus:bg-white
                           focus:outline-none focus:border-gray-400 font-light
                           placeholder:text-gray-400 transition-all duration-200"
                  autoFocus
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2
                             text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Search Meanings Checkbox - Compact */}
              <div className="mt-1.5 flex items-center gap-1.5">
                <label className="flex items-center gap-1.5 cursor-pointer group">
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={searchMeanings}
                      onChange={(e) => setSearchMeanings(e.target.checked)}
                      className="sr-only"
                    />
                    <div className={`w-4 h-4 border-2 rounded flex items-center justify-center transition-all ${
                      searchMeanings
                        ? 'bg-gradient-to-r from-purple-600 to-pink-600 border-transparent'
                        : 'border-gray-300 group-hover:border-purple-400'
                    }`}>
                      {searchMeanings && (
                        <Check className="w-3 h-3 text-white" strokeWidth={3} />
                      )}
                    </div>
                  </div>
                  <span className="text-xs text-gray-700 font-medium">
                    Search meanings
                  </span>
                </label>
              </div>

              {searchTerm && (
                <p className="mt-1 text-xs text-gray-500">
                  Found {filteredNames.length} names matching "{searchTerm}"
                  {searchMeanings && <span className="text-purple-600"> (incl. meanings)</span>}
                </p>
              )}

              {/* Swipe Up Indicator - Compact */}
              <div className="mt-1.5 flex items-center justify-center gap-1 text-gray-400">
                <motion.div
                  animate={{ y: [-2, 0, -2] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                >
                  <ChevronDown className="w-4 h-4 rotate-180" />
                </motion.div>
                <span className="text-[10px] font-medium">Swipe up to close</span>
              </div>
            </div>
          </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Quick Action Buttons - Elegant Baby Theme */}
      <section className="py-6 px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8, ease: "easeOut" }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4"
          >
            {/* Search Names - Soft Purple */}
            <motion.button
              onClick={() => {
                window.scrollTo({ top: 0, behavior: 'smooth' });
                navigate('/names');
              }}
              whileHover={{ scale: 1.08, y: -6 }}
              whileTap={{ scale: 0.98 }}
              className="relative h-28 backdrop-blur-lg bg-gradient-to-br from-purple-100/50 via-pink-50/50 to-purple-50/50 border border-purple-200/40 rounded-3xl shadow-xl hover:shadow-purple-300/40 transition-all duration-500 flex flex-col items-center justify-center gap-2 overflow-hidden group"
            >
              {/* Subtle glow on hover */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-br from-purple-200/20 to-pink-200/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
              />

              {/* Gentle floating animation */}
              <motion.div
                animate={{ y: [0, -4, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                className="relative z-10"
              >
                <div className="w-12 h-12 bg-white/60 rounded-2xl flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow duration-500">
                  <Search className="w-6 h-6 text-purple-600" />
                </div>
              </motion.div>

              <span className="text-sm font-semibold text-purple-700 relative z-10">Search Names</span>

              {/* Subtle sparkle */}
              <motion.div
                animate={{ opacity: [0.3, 0.8, 0.3], scale: [0.8, 1, 0.8] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute top-2 right-2 text-purple-300/60 text-lg"
              >
                ✦
              </motion.div>
            </motion.button>

            {/* Swipe Mode - Soft Pink */}
            <motion.button
              onClick={() => {
                window.scrollTo({ top: 0, behavior: 'smooth' });
                navigate('/swipe');
              }}
              whileHover={{ scale: 1.08, y: -6 }}
              whileTap={{ scale: 0.98 }}
              className="relative h-28 backdrop-blur-lg bg-gradient-to-br from-pink-100/50 via-rose-50/50 to-pink-50/50 border border-pink-200/40 rounded-3xl shadow-xl hover:shadow-pink-300/40 transition-all duration-500 flex flex-col items-center justify-center gap-2 overflow-hidden group"
            >
              <motion.div
                className="absolute inset-0 bg-gradient-to-br from-pink-200/20 to-rose-200/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
              />

              <motion.div
                animate={{ y: [0, -4, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 0.3 }}
                className="relative z-10"
              >
                <div className="w-12 h-12 bg-white/60 rounded-2xl flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow duration-500">
                  <Heart className="w-6 h-6 text-pink-600" />
                </div>
              </motion.div>

              <span className="text-sm font-semibold text-pink-700 relative z-10">Swipe Mode</span>

              <motion.div
                animate={{ opacity: [0.3, 0.8, 0.3], rotate: [0, 10, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute bottom-2 right-2 text-pink-300/60 text-lg"
              >
                ♡
              </motion.div>
            </motion.button>

            {/* Popular Lists - Soft Blue */}
            <motion.button
              onClick={() => {
                window.scrollTo({ top: 0, behavior: 'smooth' });
                navigate('/babynamelists');
              }}
              whileHover={{ scale: 1.08, y: -6 }}
              whileTap={{ scale: 0.98 }}
              className="relative h-28 backdrop-blur-lg bg-gradient-to-br from-blue-100/50 via-cyan-50/50 to-blue-50/50 border border-blue-200/40 rounded-3xl shadow-xl hover:shadow-blue-300/40 transition-all duration-500 flex flex-col items-center justify-center gap-2 overflow-hidden group"
            >
              <motion.div
                className="absolute inset-0 bg-gradient-to-br from-blue-200/20 to-cyan-200/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
              />

              <motion.div
                animate={{ y: [0, -4, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 0.6 }}
                className="relative z-10"
              >
                <div className="w-12 h-12 bg-white/60 rounded-2xl flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow duration-500">
                  <Star className="w-6 h-6 text-blue-600" />
                </div>
              </motion.div>

              <span className="text-sm font-semibold text-blue-700 relative z-10">Popular Lists</span>

              <motion.div
                animate={{ opacity: [0.3, 0.8, 0.3], rotate: [0, -10, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute top-2 left-2 text-blue-300/60 text-lg"
              >
                ✧
              </motion.div>
            </motion.button>

            {/* My Votes - Soft Violet */}
            <motion.button
              onClick={() => {
                window.scrollTo({ top: 0, behavior: 'smooth' });
                navigate('/votes');
              }}
              whileHover={{ scale: 1.08, y: -6 }}
              whileTap={{ scale: 0.98 }}
              className="relative h-28 backdrop-blur-lg bg-gradient-to-br from-violet-100/50 via-fuchsia-50/50 to-violet-50/50 border border-violet-200/40 rounded-3xl shadow-xl hover:shadow-violet-300/40 transition-all duration-500 flex flex-col items-center justify-center gap-2 overflow-hidden group"
            >
              <motion.div
                className="absolute inset-0 bg-gradient-to-br from-violet-200/20 to-fuchsia-200/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
              />

              <motion.div
                animate={{ y: [0, -4, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 0.9 }}
                className="relative z-10"
              >
                <div className="w-12 h-12 bg-white/60 rounded-2xl flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow duration-500">
                  <Trophy className="w-6 h-6 text-violet-600" />
                </div>
              </motion.div>

              <span className="text-sm font-semibold text-violet-700 relative z-10">My Votes</span>

              <motion.div
                animate={{ opacity: [0.3, 0.8, 0.3], scale: [0.9, 1.1, 0.9] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute bottom-2 left-2 text-violet-300/60 text-lg"
              >
                ✦
              </motion.div>
            </motion.button>
          </motion.div>
        </div>
      </section>

      {/* ============================================ */}
      {/* LIST1 MODE - SMART FILTERS DRAWER          */}
      {/* ============================================ */}
      {/* 5-tab drawer with Origin, Letter, Length, Syllables, Ending filters */}
      {/* See docs/LIST_MODES.md for complete feature documentation */}

      {/* Smart Filters Drawer - Tabbed UI */}
      <AnimatePresence>
        {showFiltersModal && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/40 z-50"
              onClick={() => setShowFiltersModal(false)}
            />

            {/* Drawer */}
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              drag="y"
              dragConstraints={{ top: 0, bottom: 0 }}
              dragElastic={{ top: 0, bottom: 0.5 }}
              onDragEnd={(e, { offset, velocity }) => {
                // Close drawer if dragged down more than 150px or with high velocity
                if (offset.y > 150 || velocity.y > 500) {
                  setShowFiltersModal(false);
                }
              }}
              className="fixed bottom-0 left-0 right-0 bg-white rounded-t-2xl shadow-2xl z-50 max-h-[85vh] overflow-hidden flex flex-col"
            >
              {/* Drag Handle Bar */}
              <div className="w-full py-3 flex justify-center cursor-grab active:cursor-grabbing">
                <div className="w-12 h-1.5 bg-gray-300 rounded-full"></div>
              </div>

              {/* Drawer Header - Sticky */}
              <div className="sticky top-0 bg-white border-b border-gray-200 px-4 py-3 z-10">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                    <Filter className="w-5 h-5 text-purple-600" />
                    Smart Filters
                  </h3>
                  <div className="flex items-center gap-2">
                    {activeFiltersCount > 0 && (
                      <button
                        onClick={clearAllFilters}
                        className="text-sm text-purple-600 hover:text-purple-700 font-medium px-3 py-1.5 bg-purple-50 rounded-lg"
                      >
                        Clear All ({activeFiltersCount})
                      </button>
                    )}
                    <button
                      onClick={() => setShowFiltersModal(false)}
                      className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                      <X className="w-5 h-5 text-gray-600" />
                    </button>
                  </div>
                </div>

                {/* Tab Navigation - Compact & Responsive */}
                <div className="flex gap-0.5 justify-between w-full">
                  <button
                    onClick={() => setActiveFilterTab('origin')}
                    className={`flex-1 px-1.5 py-1.5 rounded-lg text-[11px] font-medium transition-all flex flex-col items-center gap-0.5 ${
                      activeFilterTab === 'origin'
                        ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-sm'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    <Globe className="w-3.5 h-3.5" />
                    <span>Origin</span>
                    {selectedOrigins.size > 0 && <span className="text-[9px] opacity-80">({selectedOrigins.size})</span>}
                  </button>
                  <button
                    onClick={() => setActiveFilterTab('letter')}
                    className={`flex-1 px-1.5 py-1.5 rounded-lg text-[11px] font-medium transition-all flex flex-col items-center gap-0.5 ${
                      activeFilterTab === 'letter'
                        ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-sm'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    <Type className="w-3.5 h-3.5" />
                    <span>Letter</span>
                    {selectedStartLetters.size > 0 && <span className="text-[9px] opacity-80">({selectedStartLetters.size})</span>}
                  </button>
                  <button
                    onClick={() => setActiveFilterTab('length')}
                    className={`flex-1 px-1.5 py-1.5 rounded-lg text-[11px] font-medium transition-all flex flex-col items-center gap-0.5 ${
                      activeFilterTab === 'length'
                        ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-sm'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    <Ruler className="w-3.5 h-3.5" />
                    <span>Length</span>
                    {selectedLengths.size > 0 && <span className="text-[9px] opacity-80">({selectedLengths.size})</span>}
                  </button>
                  <button
                    onClick={() => setActiveFilterTab('syllable')}
                    className={`flex-1 px-1.5 py-1.5 rounded-lg text-[11px] font-medium transition-all flex flex-col items-center gap-0.5 ${
                      activeFilterTab === 'syllable'
                        ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-sm'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    <Music className="w-3.5 h-3.5" />
                    <span className="hidden xs:inline">Syllables</span>
                    <span className="xs:hidden">Syl</span>
                    {selectedSyllables.size > 0 && <span className="text-[9px] opacity-80">({selectedSyllables.size})</span>}
                  </button>
                  <button
                    onClick={() => setActiveFilterTab('ending')}
                    className={`flex-1 px-1.5 py-1.5 rounded-lg text-[11px] font-medium transition-all flex flex-col items-center gap-0.5 ${
                      activeFilterTab === 'ending'
                        ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-sm'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Ending</span>
                    {selectedEndings.size > 0 && <span className="text-[9px] opacity-80">({selectedEndings.size})</span>}
                  </button>
                </div>
              </div>

              {/* Tab Content - Scrollable */}
              <div className="flex-1 overflow-y-auto p-4 pb-8">
                {/* ORIGIN TAB */}
                {activeFilterTab === 'origin' && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <p className="text-xs text-gray-600 mb-2">Filter by cultural origin</p>
                    <div className="flex flex-wrap gap-1.5 mb-2">
                      {cachedOrigins.slice(0, 9).map(({ origin, count }) => (
                        <button
                          key={origin}
                          onClick={() => handleOriginToggle(origin)}
                          className={`px-2.5 py-1.5 rounded-full text-xs font-medium transition-all duration-200 flex items-center gap-1.5 border ${
                            selectedOrigins.has(origin)
                              ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white border-transparent shadow-md'
                              : 'bg-white text-gray-700 border-gray-200 hover:border-purple-300 hover:bg-purple-50'
                          }`}
                        >
                          <Globe className={`w-3 h-3 ${selectedOrigins.has(origin) ? 'text-white' : 'text-purple-500'}`} />
                          <span>{origin}</span>
                          <span className={`text-[10px] ${selectedOrigins.has(origin) ? 'text-white/80' : 'text-gray-500'}`}>
                            {count.toLocaleString()}
                          </span>
                          {selectedOrigins.has(origin) && <Check className="w-3 h-3" />}
                        </button>
                      ))}
                    </div>
                    {cachedOrigins.length > 9 && (
                      <>
                        <button
                          onClick={() => setShowOriginAccordion(!showOriginAccordion)}
                          className="w-full flex items-center justify-between px-2 py-1.5 text-xs text-purple-600 hover:bg-purple-50 rounded-lg transition-colors mb-2"
                        >
                          <span className="font-medium">{showOriginAccordion ? 'Show Less' : `+${cachedOrigins.length - 9} More`}</span>
                          <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showOriginAccordion ? 'rotate-180' : ''}`} />
                        </button>
                        <AnimatePresence>
                          {showOriginAccordion && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="overflow-hidden"
                            >
                              <div className="flex flex-wrap gap-1.5 pt-2 border-t border-gray-100">
                                {cachedOrigins.slice(9).map(({ origin, count }) => (
                                  <button
                                    key={origin}
                                    onClick={() => handleOriginToggle(origin)}
                                    className={`px-2.5 py-1.5 rounded-full text-xs font-medium transition-all duration-200 flex items-center gap-1.5 border ${
                                      selectedOrigins.has(origin)
                                        ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white border-transparent shadow-md'
                                        : 'bg-white text-gray-700 border-gray-200 hover:border-purple-300 hover:bg-purple-50'
                                    }`}
                                  >
                                    <Globe className={`w-3 h-3 ${selectedOrigins.has(origin) ? 'text-white' : 'text-purple-500'}`} />
                                    <span>{origin}</span>
                                    <span className={`text-[10px] ${selectedOrigins.has(origin) ? 'text-white/80' : 'text-gray-500'}`}>{count.toLocaleString()}</span>
                                    {selectedOrigins.has(origin) && <Check className="w-3 h-3" />}
                                  </button>
                                ))}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </>
                    )}
                  </motion.div>
                )}

                {/* LETTER TAB */}
                {activeFilterTab === 'letter' && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <p className="text-xs text-gray-600 mb-3">Filter by starting letter</p>
                    <div className="grid grid-cols-7 gap-2">
                      {'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').map(letter => (
                        <button
                          key={letter}
                          onClick={() => {
                            setSelectedStartLetters(prev => {
                              const newSet = new Set(prev);
                              if (newSet.has(letter)) {
                                newSet.delete(letter);
                              } else {
                                newSet.add(letter);
                              }
                              return newSet;
                            });
                            setCurrentPage(1);
                          }}
                          className={`aspect-square flex items-center justify-center rounded-lg text-lg font-semibold transition-all ${
                            selectedStartLetters.has(letter)
                              ? 'bg-gradient-to-br from-purple-600 to-pink-600 text-white shadow-md transform scale-105'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:scale-105'
                          }`}
                        >
                          {letter}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* LENGTH TAB */}
                {activeFilterTab === 'length' && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <p className="text-xs text-gray-600 mb-3">Filter by name length</p>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { value: 'short', label: 'Short', desc: '3-4 letters', icon: Minimize2 },
                        { value: 'medium', label: 'Medium', desc: '5-7 letters', icon: Ruler },
                        { value: 'long', label: 'Long', desc: '8+ letters', icon: Maximize2 }
                      ].map(({ value, label, desc, icon: Icon }) => (
                        <button
                          key={value}
                          onClick={() => {
                            setSelectedLengths(prev => {
                              const newSet = new Set(prev);
                              if (newSet.has(value)) {
                                newSet.delete(value);
                              } else {
                                newSet.add(value);
                              }
                              return newSet;
                            });
                            setCurrentPage(1);
                          }}
                          className={`flex flex-col items-center p-3 rounded-lg transition-all border-2 ${
                            selectedLengths.has(value)
                              ? 'bg-gradient-to-br from-purple-600 to-pink-600 text-white border-transparent shadow-md'
                              : 'bg-white text-gray-700 border-gray-200 hover:border-purple-300 hover:bg-purple-50'
                          }`}
                        >
                          <Icon className={`w-6 h-6 mb-2 ${selectedLengths.has(value) ? 'text-white' : 'text-purple-500'}`} />
                          <div className="font-semibold text-sm">{label}</div>
                          <div className={`text-xs ${selectedLengths.has(value) ? 'text-white/80' : 'text-gray-500'}`}>{desc}</div>
                          {selectedLengths.has(value) && <Check className="w-4 h-4 mt-1" />}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* SYLLABLE TAB */}
                {activeFilterTab === 'syllable' && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <p className="text-xs text-gray-600 mb-3">Filter by syllable count</p>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { value: 1, label: 'One', example: 'Max, Jade' },
                        { value: 2, label: 'Two', example: 'Emma, Noah' },
                        { value: 3, label: 'Three', example: 'Olivia, Benjamin' },
                        { value: 4, label: 'Four+', example: 'Isabella' }
                      ].map(({ value, label, example }) => (
                        <button
                          key={value}
                          onClick={() => {
                            setSelectedSyllables(prev => {
                              const newSet = new Set(prev);
                              if (newSet.has(value)) {
                                newSet.delete(value);
                              } else {
                                newSet.add(value);
                              }
                              return newSet;
                            });
                            setCurrentPage(1);
                          }}
                          className={`flex items-center gap-2 p-2.5 rounded-lg transition-all border-2 ${
                            selectedSyllables.has(value)
                              ? 'bg-gradient-to-br from-purple-600 to-pink-600 text-white border-transparent shadow-md'
                              : 'bg-white text-gray-700 border-gray-200 hover:border-purple-300 hover:bg-purple-50'
                          }`}
                        >
                          {/* Circular badge with number */}
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                            selectedSyllables.has(value)
                              ? 'bg-white/20 text-white'
                              : 'bg-gradient-to-br from-purple-500 to-pink-500 text-white'
                          }`}>
                            {value}
                          </div>
                          <div className="flex-1 text-left">
                            <div className="font-semibold text-sm">{label}</div>
                            <div className={`text-xs ${selectedSyllables.has(value) ? 'text-white/70' : 'text-gray-500'}`}>{example}</div>
                          </div>
                          {selectedSyllables.has(value) && <Check className="w-4 h-4" />}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* ENDING TAB */}
                {activeFilterTab === 'ending' && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <p className="text-xs text-gray-600 mb-3">Popular name endings</p>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { value: 'a', label: '-a', example: 'Emma, Olivia' },
                        { value: 'en', label: '-en', example: 'Aiden, Benjamin' },
                        { value: 'son', label: '-son', example: 'Jackson, Mason' },
                        { value: 'lyn', label: '-lyn', example: 'Brooklyn' },
                        { value: 'er', label: '-er', example: 'Carter, Hunter' },
                        { value: 'ie', label: '-ie', example: 'Charlie, Sophie' },
                        { value: 'el', label: '-el', example: 'Daniel, Rachel' },
                        { value: 'ia', label: '-ia', example: 'Sophia, Amelia' },
                        { value: 'elle', label: '-elle', example: 'Belle, Estelle' },
                        { value: 'ette', label: '-ette', example: 'Juliette' },
                        { value: 'yn', label: '-yn', example: 'Katelyn' }
                      ].map(({ value, label, example }) => (
                        <button
                          key={value}
                          onClick={() => {
                            setSelectedEndings(prev => {
                              const newSet = new Set(prev);
                              if (newSet.has(value)) {
                                newSet.delete(value);
                              } else {
                                newSet.add(value);
                              }
                              return newSet;
                            });
                            setCurrentPage(1);
                          }}
                          className={`flex items-center gap-2 p-2.5 rounded-lg transition-all border-2 ${
                            selectedEndings.has(value)
                              ? 'bg-gradient-to-br from-purple-600 to-pink-600 text-white border-transparent shadow-md'
                              : 'bg-white text-gray-700 border-gray-200 hover:border-purple-300 hover:bg-purple-50'
                          }`}
                        >
                          <Sparkles className={`w-4 h-4 flex-shrink-0 ${selectedEndings.has(value) ? 'text-white' : 'text-purple-500'}`} />
                          <div className="flex-1 text-left min-w-0">
                            <div className="font-semibold text-sm">{label}</div>
                            <div className={`text-xs truncate ${selectedEndings.has(value) ? 'text-white/70' : 'text-gray-500'}`}>{example}</div>
                          </div>
                          {selectedEndings.has(value) && <Check className="w-4 h-4 flex-shrink-0" />}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>


      {/* ============================================ */}
      {/* LIST1 MODE - NAMES GRID SECTION            */}
      {/* ============================================ */}
      {/* Full-featured name list with gender filters, sorting, and pagination */}
      {/* Components: Gender buttons, Sort toolbar, View toggle, Grid/List cards, Pagination */}
      {/* See docs/LIST_MODES.md for complete feature documentation */}

      {/* Names Grid */}
      <section className="py-12 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Header - Title */}
          <div className="mb-3">
            <h3 className="text-2xl md:text-3xl font-bold text-gray-800 mb-1">
              {showFavorites ? 'Your Favorite Names' : searchTerm ? 'Search Results' : 'Popular Names'}
            </h3>
            <span className="text-sm text-gray-500">
              {filteredNames.length > 0 ? `${currentFilteredCount.toLocaleString()} names found` : ''}
            </span>
          </div>

          {/* LIST1 MODE - Gender Filter Buttons */}
          <div className="flex justify-center gap-6 mb-3 text-sm">
            <button
              onClick={() => handleFilterClick('all')}
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                activeFilter === 'all'
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md'
                  : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
              }`}
            >
              All
            </button>
            <button
              onClick={() => handleFilterClick('male')}
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                activeFilter === 'male'
                  ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md'
                  : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
              }`}
            >
              Boys
            </button>
            <button
              onClick={() => handleFilterClick('female')}
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                activeFilter === 'female'
                  ? 'bg-gradient-to-r from-pink-500 to-pink-600 text-white shadow-md'
                  : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
              }`}
            >
              Girls
            </button>
            <button
              onClick={() => handleFilterClick('unisex')}
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                activeFilter === 'unisex'
                  ? 'bg-gradient-to-r from-violet-500 to-violet-600 text-white shadow-md'
                  : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
              }`}
            >
              Unisex
            </button>
          </div>

          {/* LIST1 MODE - Sorting Controls & View Toggle */}
          {/* Ultra Compact Toolbar: Sort (Popular/A-Z/Shuffle) + Filters + View Toggle */}
          <div className="flex flex-nowrap justify-center items-stretch gap-1 mb-2 overflow-x-auto">
            {/* Sorting Buttons Group - Unified Purple Theme */}
            <div className="flex items-stretch rounded-lg overflow-hidden border border-purple-200 bg-white">
              {/* Sort Label */}
              <span className="px-1.5 py-1 text-[10px] text-purple-700 font-semibold bg-purple-50 border-r border-purple-200 flex items-center whitespace-nowrap">
                Sort:
              </span>

              {/* Popular Sort */}
              <button
                onClick={() => {
                  if (sortBy === 'popularity') {
                    setSortReverse(!sortReverse);
                  } else {
                    setSortBy('popularity');
                    setSortReverse(false);
                  }
                }}
                className={`px-1.5 py-1 flex items-center justify-center gap-0.5 text-[10px] font-medium transition-all border-r border-purple-200 whitespace-nowrap ${
                  sortBy === 'popularity'
                    ? 'bg-purple-500 text-white'
                    : 'bg-white text-purple-700 hover:bg-purple-50'
                }`}
                title={sortBy === 'popularity' && sortReverse ? "Least popular first" : "Most popular first"}
              >
                <Trophy className={`w-3 h-3 transition-transform ${sortBy === 'popularity' && sortReverse ? 'rotate-180' : ''}`} />
                <span>Popular</span>
              </button>

              {/* A→Z Sort */}
              <button
                onClick={() => {
                  if (sortBy === 'alphabetical') {
                    setSortReverse(!sortReverse);
                  } else {
                    setSortBy('alphabetical');
                    setSortReverse(false);
                  }
                }}
                className={`px-1.5 py-1 flex items-center justify-center gap-0.5 text-[10px] font-medium transition-all border-r border-purple-200 whitespace-nowrap ${
                  sortBy === 'alphabetical'
                    ? 'bg-purple-500 text-white'
                    : 'bg-white text-purple-700 hover:bg-purple-50'
                }`}
                title={sortBy === 'alphabetical' && sortReverse ? "Sort Z to A" : "Sort A to Z"}
              >
                <ArrowDownAZ className={`w-3 h-3 transition-transform ${sortBy === 'alphabetical' && sortReverse ? 'rotate-180' : ''}`} />
                <span>{sortBy === 'alphabetical' && sortReverse ? 'Z→A' : 'A→Z'}</span>
              </button>

              {/* Shuffle */}
              <button
                onClick={() => {
                  setSortBy('random');
                  setSortReverse(false);
                  // Increment shuffle trigger to force re-randomization each time
                  setShuffleTrigger(prev => prev + 1);
                }}
                className={`px-1.5 py-1 flex items-center justify-center gap-0.5 text-[10px] font-medium transition-all whitespace-nowrap ${
                  sortBy === 'random'
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Dices className={`w-3 h-3 ${sortBy === 'random' ? 'animate-pulse' : ''}`} />
                <span>Shuffle</span>
              </button>
            </div>

            {/* Separator Dot */}
            <div className="flex items-center">
              <div className="w-1 h-1 bg-purple-400 rounded-full"></div>
            </div>

            {/* Filters Button - Separate Group */}
            <div className="flex items-stretch rounded-lg overflow-hidden border border-purple-200 bg-white">
              <button
                onClick={() => setShowFiltersModal(!showFiltersModal)}
                className={`flex items-center justify-center gap-0.5 px-1.5 py-1 transition-all relative whitespace-nowrap ${
                  showFiltersModal || activeFiltersCount > 0
                    ? 'bg-purple-100 text-purple-700'
                    : 'bg-white text-purple-700 hover:bg-purple-50'
                }`}
                title="Open filters"
              >
                <Filter className="w-3 h-3" />
                <span className="text-[10px] font-medium">Filters</span>
                {activeFiltersCount > 0 && (
                  <span className="ml-0.5 px-1 py-0.5 bg-purple-600 text-white text-[9px] rounded-full min-w-[14px] text-center leading-none">
                    {activeFiltersCount}
                  </span>
                )}
              </button>
            </div>

            {/* Separator Dot */}
            <div className="flex items-center">
              <div className="w-1 h-1 bg-purple-400 rounded-full"></div>
            </div>

            {/* View Toggle - LIST2 MODE - Separate Group */}
            <div className="flex items-stretch rounded-lg overflow-hidden border border-purple-200 bg-white p-0.5">
              <div className="flex items-center gap-0.5 bg-gray-100 rounded-lg p-0.5">
                <button
                  onClick={() => {
                    setViewMode('card');
                    localStorage.setItem('nameListViewMode', 'card');
                  }}
                  className={`p-1 rounded transition-all ${
                    viewMode === 'card'
                      ? 'bg-white text-purple-600 shadow-sm'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                  title="Card view"
                >
                  <Grid3x3 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => {
                    setViewMode('compact');
                    localStorage.setItem('nameListViewMode', 'compact');
                  }}
                  className={`p-1 rounded transition-all ${
                    viewMode === 'compact'
                      ? 'bg-white text-purple-600 shadow-sm'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                  title="Compact view"
                >
                  <List className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {cacheLoading && filteredNames.length === 0 ? (
            <div className="text-center py-20">
              <div className="inline-flex items-center gap-3 text-gray-500">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                <span className="text-lg">Loading names...</span>
              </div>
            </div>
          ) : filteredNames.length === 0 ? (
            <div className="text-center py-20">
              <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-xl text-gray-500">No names found matching your search</p>
              <button
                onClick={() => setSearchTerm('')}
                className="mt-4 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
              >
                Clear Search
              </button>
            </div>
          ) : (
            <>
              {viewMode === 'card' ? (
                // Card View - Grid layout
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                  <AnimatePresence mode="popLayout">
                    {currentNames.map((name, index) => {
                      return (
                        <motion.div
                          key={name.name}
                          layout
                          initial={{ opacity: 0, y: 15 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0 }}
                          transition={{
                            duration: 0.08,
                            layout: { type: "spring", stiffness: 800, damping: 40 }
                          }}
                        >
                          <NameCard
                            name={name}
                            onClick={(name) => {
                              setSelectedName(name);
                              setSelectedIndex(index + startIndex);
                            }}
                            filterContext={activeFilter}
                            onFavoriteToggle={() => {
                              window.dispatchEvent(new Event('storage'));
                              setTimeout(() => setRefreshTrigger({}), 120);
                            }}
                            onDislikeToggle={() => {
                              window.dispatchEvent(new Event('storage'));
                              setTimeout(() => setRefreshTrigger({}), 120);
                            }}
                          />
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </div>
              ) : (
                // Compact View - List layout
                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
                  <AnimatePresence mode="popLayout">
                    {currentNames.map((name, index) => {
                      return (
                        <motion.div
                          key={name.name}
                          layout
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0 }}
                          transition={{
                            duration: 0.08,
                            layout: { type: "spring", stiffness: 800, damping: 40 }
                          }}
                        >
                          <NameCardCompact
                            name={name}
                            onClick={(name) => {
                              setSelectedName(name);
                              setSelectedIndex(index + startIndex);
                            }}
                            filterContext={activeFilter}
                            onFavoriteToggle={() => {
                              window.dispatchEvent(new Event('storage'));
                              setTimeout(() => setRefreshTrigger({}), 120);
                            }}
                            onDislikeToggle={() => {
                              window.dispatchEvent(new Event('storage'));
                              setTimeout(() => setRefreshTrigger({}), 120);
                            }}
                          />
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </div>
              )}

              {/* LIST1 MODE - Pagination Controls */}
              {/* Ultra-Compact Pagination - Handles Giant Numbers */}
              <div className="mt-8 mb-6">
                <div className="flex flex-col items-center space-y-3">
                  {/* Compact Page Statistics */}
                  <div className="text-center">
                    <p className="text-sm text-gray-600">
                      <span className="font-semibold text-purple-600">{((currentPage - 1) * itemsPerPage) + 1}-{Math.min(currentPage * itemsPerPage, currentFilteredCount)}</span> of <span className="font-semibold text-purple-600">{currentFilteredCount.toLocaleString()}</span>
                      {totalPages > 1 && <span className="text-gray-400 ml-2">(Page {currentPage.toLocaleString()}/{totalPages.toLocaleString()})</span>}
                    </p>
                  </div>

                  {/* Compact Pagination Controls */}
                  {totalPages > 1 && (
                    <div className="flex items-center gap-1">
                      {/* Previous Button - Compact */}
                      <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                          currentPage === 1
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : 'bg-white text-gray-700 hover:bg-purple-50 hover:text-purple-600 border border-gray-200 hover:border-purple-300'
                        }`}
                      >
                        ←
                      </button>

                      {/* Smart Page Numbers */}
                      <div className="flex items-center gap-0.5">
                        {(() => {
                          const items: (number | string)[] = [];

                          // Always show first page
                          items.push(1);

                          if (totalPages <= 7) {
                            // Show all pages if 7 or less
                            for (let i = 2; i <= totalPages; i++) {
                              items.push(i);
                            }
                          } else {
                            // Smart ellipsis logic for large numbers
                            if (currentPage > 3) {
                              items.push('...');
                            }

                            // Show pages around current
                            const start = Math.max(2, currentPage - 1);
                            const end = Math.min(totalPages - 1, currentPage + 1);

                            for (let i = start; i <= end; i++) {
                              if (!items.includes(i)) {
                                items.push(i);
                              }
                            }

                            if (currentPage < totalPages - 2) {
                              items.push('...');
                            }

                            // Always show last page
                            if (!items.includes(totalPages)) {
                              items.push(totalPages);
                            }
                          }

                          return items.map((item, index) => {
                            if (item === '...') {
                              return (
                                <span key={`ellipsis-${index}`} className="px-2 py-1.5 text-xs text-gray-400">
                                  ···
                                </span>
                              );
                            }

                            const pageNum = item as number;
                            return (
                              <button
                                key={pageNum}
                                onClick={() => handlePageChange(pageNum)}
                                className={`min-w-[32px] px-2 py-1.5 rounded-md text-xs font-semibold transition-all ${
                                  currentPage === pageNum
                                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-sm'
                                    : 'bg-white text-gray-700 hover:bg-purple-50 hover:text-purple-600 border border-gray-200 hover:border-purple-300'
                                }`}
                              >
                                {pageNum.toLocaleString()}
                              </button>
                            );
                          });
                        })()}
                      </div>

                      {/* Next Button - Compact */}
                      <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                          currentPage === totalPages
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : 'bg-white text-gray-700 hover:bg-purple-50 hover:text-purple-600 border border-gray-200 hover:border-purple-300'
                        }`}
                      >
                        →
                      </button>
                    </div>
                  )}

                  {/* Quick Jump - Always Show for Large Datasets */}
                  {totalPages > 5 && (
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500">Go to:</span>
                      <input
                        type="number"
                        min="1"
                        max={totalPages}
                        placeholder={currentPage.toString()}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            const page = parseInt((e.target as HTMLInputElement).value);
                            if (page >= 1 && page <= totalPages) {
                              handlePageChange(page);
                              (e.target as HTMLInputElement).value = '';
                            }
                          }
                        }}
                        className="w-16 px-2 py-1 text-xs text-center border border-gray-300 rounded-md focus:outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-200"
                      />
                      <span className="text-xs text-gray-500">/ {totalPages.toLocaleString()}</span>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </section>

      {/* Name Detail Modal */}
      <NameDetailModal
        name={selectedName}
        onClose={() => setSelectedName(null)}
      />

      {/* Swiping Questionnaire Modal */}
      {showQuestionnaire && (
        <SwipingQuestionnaire
          onComplete={handleQuestionnaireComplete}
          onClose={() => setShowQuestionnaire(false)}
        />
      )}

      {/* FAQ Section for SEO */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-10 text-gray-800">
            Everything You Need to Know About Choosing a Baby Name
          </h2>

          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-bold mb-3 text-purple-600">How do I choose the perfect baby name?</h3>
              <p className="text-gray-600">Start with names that have personal meaning. Consider family heritage, sound with your surname, and future nicknames. Our AI chat helps narrow down from 164,374 clean English options to your perfect match.</p>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-bold mb-3 text-purple-600">What are the most popular baby names in 2025?</h3>
              <p className="text-gray-600">Top trending names include Olivia, Emma, and Luna for girls; Liam, Noah, and Oliver for boys. Use our real-time popularity tracker to see what's rising in your area.</p>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-bold mb-3 text-purple-600">Should I choose a unique or popular name?</h3>
              <p className="text-gray-600">Both have benefits. Popular names are familiar and accepted; unique names stand out. Our database includes rare gems and classics - find your perfect balance.</p>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-bold mb-3 text-purple-600">When should I decide on a baby name?</h3>
              <p className="text-gray-600">Many parents choose by the third trimester, but there's no rush. Some wait until meeting their baby. Start exploring early to avoid last-minute stress.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section - Let the Soul Choose */}
      <section className="py-20 px-4 bg-gradient-to-br from-purple-600 via-pink-500 to-purple-700 text-white relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.1),transparent_50%)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(255,255,255,0.1),transparent_50%)]"></div>

        <div className="max-w-4xl mx-auto text-center relative z-10">
          {/* Tagline */}
          <div className="mb-6 inline-block">
            <p className="text-sm uppercase tracking-wider opacity-90 font-light mb-2">
              Let the Soul Choose.
            </p>
            <div className="h-px w-24 bg-white/50 mx-auto"></div>
          </div>

          <h2 className="text-4xl md:text-5xl font-light mb-6 tracking-tight">
            Your Baby's Name Journey
            <br />
            <span className="font-semibold">Starts Here</span>
          </h2>

          <p className="text-xl mb-8 opacity-95 font-light max-w-2xl mx-auto">
            Join thousands of parents discovering the perfect name every day.
            <br />
            <span className="text-base mt-2 inline-block">Free AI assistance. No sign-up required. Start now.</span>
          </p>

          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="px-8 py-4 bg-white text-purple-600 rounded-full text-lg font-semibold hover:shadow-2xl transition-all transform hover:scale-105 hover:bg-purple-50"
          >
            Find My Baby's Name Now →
          </button>

          <div className="mt-8 flex flex-wrap justify-center gap-6 md:gap-8 text-sm opacity-90">
            <span className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              174,000+ Names
            </span>
            <span className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Instant Results
            </span>
            <span className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              100% Free
            </span>
          </div>
        </div>
      </section>
    </div>
    </>
  );
};

export default HomePage;