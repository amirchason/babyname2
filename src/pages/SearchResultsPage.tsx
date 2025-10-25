import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Search, ArrowDownAZ, Dices, Filter, Trophy, X, Check, LayoutGrid, List, Type, Ruler, Music, Sparkles, Minimize2, Maximize2, Globe, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import nameService, { NameEntry } from '../services/nameService';
import favoritesService from '../services/favoritesService';
import { useNameCache } from '../contexts/NameCacheContext';
import NameCard from '../components/NameCard';
import NameCardCompact from '../components/NameCardCompact';
import NameDetailModal from '../components/NameDetailModal';
import AppHeader from '../components/AppHeader';
import { oneSyllableNames } from '../data/oneSyllableNames';

const SearchResultsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { names: cachedNames, allOrigins: cachedOrigins } = useNameCache();

  // Get search term from URL
  const initialSearchTerm = searchParams.get('q') || '';
  const initialSearchMeanings = searchParams.get('meanings') === 'true';

  const [searchTerm, setSearchTerm] = useState(initialSearchTerm);
  const [searchMeanings, setSearchMeanings] = useState(initialSearchMeanings);
  const [filteredNames, setFilteredNames] = useState<NameEntry[]>([]);
  const [selectedName, setSelectedName] = useState<NameEntry | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number>(0);

  // LIST1 MODE - State Variables
  const [activeFilter, setActiveFilter] = useState<'all' | 'male' | 'female' | 'unisex'>('all');
  const [sortBy, setSortBy] = useState<'popularity' | 'alphabetical' | 'random'>('popularity');
  const [sortReverse, setSortReverse] = useState(false);
  const [viewMode, setViewMode] = useState<'card' | 'compact'>(() => {
    const saved = localStorage.getItem('nameListViewMode');
    return (saved === 'card' ? 'card' : 'compact') as 'card' | 'compact';
  });

  // Smart Filters
  const [selectedOrigins, setSelectedOrigins] = useState<Set<string>>(new Set());
  const [selectedStartLetters, setSelectedStartLetters] = useState<Set<string>>(new Set());
  const [selectedEndings, setSelectedEndings] = useState<Set<string>>(new Set());
  const [selectedSyllables, setSelectedSyllables] = useState<Set<number>>(new Set());
  const [selectedLengths, setSelectedLengths] = useState<Set<string>>(new Set());
  const [showOriginAccordion, setShowOriginAccordion] = useState(false);
  const [showFiltersModal, setShowFiltersModal] = useState(false);
  const [activeFilterTab, setActiveFilterTab] = useState<'origin' | 'letter' | 'length' | 'syllable' | 'ending'>('origin');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(30);
  const [shuffleTrigger, setShuffleTrigger] = useState(0);
  const [refreshTrigger, setRefreshTrigger] = useState({});

  // Helper functions
  const countSyllables = (name: string): number => {
    const nameLower = name.toLowerCase().trim();
    if (oneSyllableNames.has(nameLower)) return 1;
    if (name.length <= 3) return 1;

    const vowels = 'aeiouy';
    let syllables = 0;
    let previousWasVowel = false;

    for (let i = 0; i < nameLower.length; i++) {
      const isVowel = vowels.includes(nameLower[i]);
      if (isVowel && !previousWasVowel) syllables++;
      previousWasVowel = isVowel;
    }

    if (nameLower.endsWith('e') && syllables > 1) syllables--;
    if (nameLower.endsWith('le') && name.length > 2) {
      const beforeLe = nameLower[nameLower.length - 3];
      if (!vowels.includes(beforeLe)) syllables++;
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
      if (name.toLowerCase().endsWith(ending)) return ending;
    }
    return 'other';
  };

  const clearAllFilters = () => {
    setSelectedOrigins(new Set());
    setSelectedStartLetters(new Set());
    setSelectedEndings(new Set());
    setSelectedSyllables(new Set());
    setSelectedLengths(new Set());
  };

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

  // Search and filter logic
  useEffect(() => {
    const updateNames = async () => {
      if (!searchTerm) {
        setFilteredNames([]);
        return;
      }

      // Use different search logic based on searchMeanings checkbox
      let results;
      if (searchMeanings) {
        // MEANING-FIRST SEARCH: Prioritize meaning matches over name matches
        results = await nameService.searchNamesByMeaning(searchTerm);
      } else {
        // NAME-ONLY SEARCH: Standard three-tier priority (exact, starts with, contains)
        results = await nameService.searchNames(searchTerm);
      }

      // Filter out liked and disliked names
      results = results.filter(name =>
        !favoritesService.isDisliked(name.name) &&
        !favoritesService.isFavorite(name.name)
      );

      // Apply gender filter
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

      // Apply smart filters
      if (selectedOrigins.size > 0) {
        results = results.filter(name => {
          const originField = (name as any).originGroup || name.origin;
          if (!originField) return false;
          const origins = Array.isArray(originField) ? originField : [originField];
          return origins.some(origin => selectedOrigins.has(origin.trim()));
        });
      }

      if (selectedStartLetters.size > 0) {
        results = results.filter(name =>
          selectedStartLetters.has(name.name.charAt(0).toUpperCase())
        );
      }

      if (selectedEndings.size > 0) {
        results = results.filter(name => {
          const ending = getNameEnding(name.name);
          return selectedEndings.has(ending);
        });
      }

      if (selectedSyllables.size > 0) {
        results = results.filter(name => {
          const syllables = countSyllables(name.name);
          return selectedSyllables.has(syllables);
        });
      }

      if (selectedLengths.size > 0) {
        results = results.filter(name => {
          const length = getNameLength(name.name);
          return selectedLengths.has(length);
        });
      }

      // Apply sorting
      results = applySorting(results, !!searchTerm);

      setFilteredNames(results);
    };

    updateNames();
  }, [searchTerm, searchMeanings, activeFilter, cachedNames, sortBy, sortReverse, applySorting, selectedOrigins, selectedStartLetters, selectedEndings, selectedSyllables, selectedLengths, refreshTrigger, shuffleTrigger]);

  // Update URL when search changes
  useEffect(() => {
    if (searchTerm) {
      const params = new URLSearchParams();
      params.set('q', searchTerm);
      if (searchMeanings) params.set('meanings', 'true');
      setSearchParams(params);
    }
  }, [searchTerm, searchMeanings, setSearchParams]);

  // Pagination
  const totalPages = Math.ceil(filteredNames.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentNames = filteredNames.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 200, behavior: 'smooth' });
  };

  const handleFilterClick = (filter: 'all' | 'male' | 'female' | 'unisex') => {
    setActiveFilter(filter);
    setCurrentPage(1);
  };

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
    setCurrentPage(1);
  };

  const toggleViewMode = () => {
    const newMode = viewMode === 'card' ? 'compact' : 'card';
    setViewMode(newMode);
    localStorage.setItem('nameListViewMode', newMode);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      {/* AppHeader */}
      <AppHeader title="SoulSeed" showBackButton={true} />

      {/* Search Header Section */}
      <section className="pt-20 pb-8 px-4 bg-gradient-to-br from-purple-100/50 to-pink-100/50">
        <div className="max-w-4xl mx-auto">
          {/* Search Input - Inline */}
          <div className="relative mb-4">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Escape') {
                  navigate('/');
                }
              }}
              placeholder="Search for a name..."
              className="w-full pl-12 pr-4 py-3 text-base border border-gray-300 rounded-xl
                       bg-white shadow-md
                       focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-200
                       font-light placeholder:text-gray-400 transition-all duration-200"
              autoFocus
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-4 top-1/2 transform -translate-y-1/2
                         text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Search Meanings Checkbox */}
          <div className="flex items-center gap-2 mb-4">
            <label className="flex items-center gap-2 cursor-pointer group">
              <div className="relative">
                <input
                  type="checkbox"
                  checked={searchMeanings}
                  onChange={(e) => setSearchMeanings(e.target.checked)}
                  className="sr-only"
                />
                <div className={`w-5 h-5 border-2 rounded flex items-center justify-center transition-all ${
                  searchMeanings
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 border-transparent'
                    : 'border-gray-300 group-hover:border-purple-400'
                }`}>
                  {searchMeanings && (
                    <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />
                  )}
                </div>
              </div>
              <span className="text-sm text-gray-700 font-medium">
                Search meanings
              </span>
            </label>
          </div>

          {/* Results Count */}
          <div className="text-center">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">
              Search Results
            </h1>
            {searchTerm && (
              <p className="text-lg text-gray-600">
                Found <span className="font-semibold text-purple-600">{filteredNames.length.toLocaleString()}</span> names matching "{searchTerm}"
                {searchMeanings && <span className="text-purple-600"> (including meanings)</span>}
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Smart Filters Drawer - Same as HomePage */}
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
                if (offset.y > 150 || velocity.y > 500) {
                  setShowFiltersModal(false);
                }
              }}
              className="fixed bottom-0 left-0 right-0 bg-white rounded-t-2xl shadow-2xl z-50 max-h-[85vh] overflow-hidden flex flex-col"
            >
              {/* Drag Handle */}
              <div className="w-full py-3 flex justify-center cursor-grab active:cursor-grabbing">
                <div className="w-12 h-1.5 bg-gray-300 rounded-full"></div>
              </div>

              {/* Header */}
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

                {/* Tab Navigation */}
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

      {/* Results Section */}
      <section className="py-8 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Gender Filter Buttons */}
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

          {/* Sorting Controls & View Toggle */}
          <div className="flex flex-nowrap justify-center items-stretch gap-2 mb-4 overflow-x-auto">
            {/* Sort Buttons */}
            <div className="flex items-stretch rounded-lg overflow-hidden shadow-md bg-white">
              <span className="px-2 py-1 text-[11px] text-gray-600 font-medium bg-gray-50 border-r border-gray-200 flex items-center whitespace-nowrap">
                Sort:
              </span>
              <button
                onClick={() => {
                  if (sortBy === 'popularity') {
                    setSortReverse(!sortReverse);
                  } else {
                    setSortBy('popularity');
                    setSortReverse(false);
                  }
                }}
                className={`px-2 py-1 flex items-center gap-1 text-[11px] font-medium transition-all border-r border-gray-200 whitespace-nowrap ${
                  sortBy === 'popularity'
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Trophy className={`w-3 h-3 transition-transform ${sortBy === 'popularity' && sortReverse ? 'rotate-180' : ''}`} />
                <span>Popular{sortBy === 'popularity' && sortReverse ? ' ↓' : ''}</span>
              </button>
              <button
                onClick={() => {
                  if (sortBy === 'alphabetical') {
                    setSortReverse(!sortReverse);
                  } else {
                    setSortBy('alphabetical');
                    setSortReverse(false);
                  }
                }}
                className={`px-2 py-1 flex items-center gap-1 text-[11px] font-medium transition-all border-r border-gray-200 whitespace-nowrap ${
                  sortBy === 'alphabetical'
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                <ArrowDownAZ className={`w-3 h-3 transition-transform ${sortBy === 'alphabetical' && sortReverse ? 'rotate-180' : ''}`} />
                <span>{sortBy === 'alphabetical' && sortReverse ? 'Z→A' : 'A→Z'}</span>
              </button>
              <button
                onClick={() => {
                  setSortBy('random');
                  setSortReverse(false);
                  setShuffleTrigger(prev => prev + 1);
                }}
                className={`px-2 py-1 flex items-center gap-1 text-[11px] font-medium transition-all whitespace-nowrap ${
                  sortBy === 'random'
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Dices className={`w-3 h-3 ${sortBy === 'random' ? 'animate-pulse' : ''}`} />
                <span>Shuffle</span>
              </button>
            </div>

            <div className="flex items-center">
              <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
            </div>

            {/* Filters & View Toggle */}
            <div className="flex items-stretch rounded-lg overflow-hidden shadow-md bg-white">
              <button
                onClick={() => setShowFiltersModal(!showFiltersModal)}
                className={`flex items-center gap-1 px-2 py-1 transition-all relative border-r border-gray-200 whitespace-nowrap ${
                  showFiltersModal || activeFiltersCount > 0
                    ? 'bg-gradient-to-r from-purple-50 to-pink-50 text-purple-700'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Filter className="w-3 h-3" />
                <span className="text-[11px] font-medium">Filters</span>
                {activeFiltersCount > 0 && (
                  <span className="ml-0.5 px-1 py-0.5 bg-purple-600 text-white text-[10px] rounded-full min-w-[16px] text-center leading-none">
                    {activeFiltersCount}
                  </span>
                )}
              </button>
              <button
                onClick={toggleViewMode}
                className="flex items-center gap-1 px-2 py-1 bg-white text-gray-700 hover:bg-gray-50 transition-all whitespace-nowrap"
              >
                {viewMode === 'card' ? (
                  <>
                    <List className="w-3 h-3" />
                    <span className="text-[11px] font-medium">List</span>
                  </>
                ) : (
                  <>
                    <LayoutGrid className="w-3 h-3" />
                    <span className="text-[11px] font-medium">Grid</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Results Grid/List */}
          {filteredNames.length === 0 ? (
            <div className="text-center py-20">
              <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-xl text-gray-500">
                {searchTerm ? 'No names found matching your search' : 'Enter a search term to get started'}
              </p>
            </div>
          ) : (
            <>
              {viewMode === 'card' ? (
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                  <AnimatePresence mode="popLayout">
                    {currentNames.map((name, index) => (
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
                    ))}
                  </AnimatePresence>
                </div>
              ) : (
                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
                  <AnimatePresence mode="popLayout">
                    {currentNames.map((name, index) => (
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
                    ))}
                  </AnimatePresence>
                </div>
              )}

              {/* Pagination - Copy from HomePage */}
              <div className="mt-8 mb-6">
                <div className="flex flex-col items-center space-y-3">
                  <div className="text-center">
                    <p className="text-sm text-gray-600">
                      <span className="font-semibold text-purple-600">{((currentPage - 1) * itemsPerPage) + 1}-{Math.min(currentPage * itemsPerPage, filteredNames.length)}</span> of <span className="font-semibold text-purple-600">{filteredNames.length.toLocaleString()}</span>
                      {totalPages > 1 && <span className="text-gray-400 ml-2">(Page {currentPage.toLocaleString()}/{totalPages.toLocaleString()})</span>}
                    </p>
                  </div>

                  {/* Pagination controls - abbreviated */}
                  {totalPages > 1 && (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                          currentPage === 1
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : 'bg-white text-gray-700 hover:bg-purple-50 hover:text-purple-600 border border-gray-200'
                        }`}
                      >
                        ←
                      </button>
                      {/* Page numbers logic here - copy from HomePage */}
                      <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                          currentPage === totalPages
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : 'bg-white text-gray-700 hover:bg-purple-50 hover:text-purple-600 border border-gray-200'
                        }`}
                      >
                        →
                      </button>
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
    </div>
  );
};

export default SearchResultsPage;
