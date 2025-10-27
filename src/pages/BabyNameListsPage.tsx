import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, Library, Minimize2, Globe, MessageCircle, Palette, Tag, ChevronDown, Check, Grid3x3, List, ArrowDownAZ, Trophy, Dices } from 'lucide-react';
import { categoryDisplayNames, ListCategory } from '../data/themedLists';
import { searchLists, filterByGender, sortNames } from '../utils/themedListFilters';
import ThemedListAccordion from '../components/ThemedListAccordion';
import nameService, { BabyName } from '../services/nameService';
import AppHeader from '../components/AppHeader';
import NameCard from '../components/NameCard';
import NameCardCompact from '../components/NameCardCompact';
import NameDetailModal from '../components/NameDetailModal';
import SEOHead from '../components/SEO/SEOHead';

const BabyNameListsPage: React.FC = () => {
  // SEO Meta Tags
  const seoTitle = "Curated Baby Name Lists | SoulSeed";
  const seoDescription = "Browse expertly curated baby name lists by theme, origin, meaning, and popularity. Find inspiration for your baby's perfect name.";
  const [allNames, setAllNames] = useState<BabyName[]>([]);
  const [themedLists, setThemedLists] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<'all' | ListCategory>('all');
  const [expandedAccordions, setExpandedAccordions] = useState<Set<string>>(new Set());

  // Name search state
  const [genderFilter, setGenderFilter] = useState<'all' | 'male' | 'female' | 'unisex'>('all');
  const [sortBy, setSortBy] = useState<'alphabetical' | 'popularity' | 'random'>('alphabetical');
  const [sortReverse, setSortReverse] = useState(false);
  const [shuffleTrigger, setShuffleTrigger] = useState(0);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedName, setSelectedName] = useState<BabyName | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const namesPerPage = 30;
  const [removedNames, setRemovedNames] = useState<Set<string>>(new Set());

  // Load all names and themed lists lazily on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        // Load names first (fast)
        const names = nameService.getAllNames();
        setAllNames(names);

        // Lazy load themed lists (heavy import)
        const { themedLists: lists } = await import('../data/themedLists');
        setThemedLists(lists);
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Filter lists by category and search
  const filteredLists = useMemo(() => {
    if (themedLists.length === 0) return [];

    let lists = themedLists;

    // Filter by category
    if (selectedCategory !== 'all') {
      lists = lists.filter(list => list.category === selectedCategory);
    }

    // Filter by search term
    lists = searchLists(lists, searchTerm);

    return lists;
  }, [themedLists, selectedCategory, searchTerm]);

  // Search for matching names (when search term exists)
  const matchedNames = useMemo(() => {
    if (!searchTerm.trim() || allNames.length === 0) return [];

    // Search names by name text
    const nameMatches = nameService.searchNames(searchTerm) || [];

    // Apply gender filter
    let filtered = filterByGender(nameMatches, genderFilter);

    // Apply sorting
    if (sortBy === 'random') {
      // Fisher-Yates shuffle
      filtered = [...filtered];
      for (let i = filtered.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [filtered[i], filtered[j]] = [filtered[j], filtered[i]];
      }
    } else {
      filtered = sortNames(filtered, sortBy);
      if (sortReverse) {
        filtered = [...filtered].reverse();
      }
    }

    // Filter out removed names (for swipe-off animation)
    filtered = filtered.filter(name => !removedNames.has(name.name));

    return filtered.slice(0, 100); // Limit to 100 results
  }, [searchTerm, allNames, genderFilter, sortBy, sortReverse, shuffleTrigger, removedNames]);

  // Category counts
  const categoryCounts = useMemo(() => {
    if (themedLists.length === 0) {
      return {
        all: 0,
        origin: 0,
        meaning: 0,
        style: 0,
        theme: 0,
      };
    }

    return {
      all: themedLists.length,
      origin: themedLists.filter(l => l.category === 'origin').length,
      meaning: themedLists.filter(l => l.category === 'meaning').length,
      style: themedLists.filter(l => l.category === 'style').length,
      theme: themedLists.filter(l => l.category === 'theme').length,
    };
  }, [themedLists]);

  // Pagination for matched names
  const totalPages = Math.ceil(matchedNames.length / namesPerPage);
  const paginatedNames = matchedNames.slice(
    (currentPage - 1) * namesPerPage,
    currentPage * namesPerPage
  );

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [genderFilter, sortBy, sortReverse, shuffleTrigger, searchTerm]);

  const handleCollapseAll = () => {
    setExpandedAccordions(new Set());
  };

  // Handle name removal with animation
  const handleNameRemove = (nameName: string) => {
    // Add to removed set to trigger exit animation
    setRemovedNames(prev => new Set(prev).add(nameName));
  };

  return (
    <>
      <SEOHead
        title={seoTitle}
        description={seoDescription}
        canonical="https://soulseedbaby.com/babynamelists"
      />
      <div className="min-h-screen bg-gray-50">
        <AppHeader showBackButton={true} />

      {/* Full-width Search Bar - Below Header (Same as HomePage) */}
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
                    }}
                    placeholder="Search lists..."
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

                {searchTerm && (
                  <p className="mt-1 text-xs text-gray-500">
                    Found {filteredLists.length} lists matching "{searchTerm}"
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

      {/* Hero Section - Minimalist */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="bg-white border-b border-gray-200"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
          <div className="max-w-3xl">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1, duration: 0.4 }}
              className="flex items-center gap-3 mb-3"
            >
              <Library className="w-6 h-6 text-gray-900" strokeWidth={1.5} />
              <h1 className="text-3xl sm:text-4xl font-semibold text-gray-900">
                Curated Name Lists
              </h1>
            </motion.div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.4 }}
              className="text-base text-gray-600 mb-6"
            >
              Browse expertly curated collections organized by origin, meaning, style, and theme
            </motion.p>

            {/* Search Button - Opens expandable search bar */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.4 }}
            >
              <button
                onClick={() => setSearchOpen(!searchOpen)}
                className="w-full py-3 rounded-lg text-sm font-light
                         bg-white text-gray-900 border border-gray-200
                         hover:border-gray-400 transition-all duration-200
                         flex items-center justify-center gap-2"
              >
                <Search className="w-4 h-4" />
                {searchTerm ? `Searching: "${searchTerm}"` : 'Search Lists'}
              </button>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Category Tabs - Minimalist */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 overflow-x-auto py-3 no-scrollbar">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`flex-shrink-0 px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap flex items-center gap-2 ${
                selectedCategory === 'all'
                  ? 'bg-gray-900 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              <Library className="w-3.5 h-3.5" strokeWidth={2} />
              All ({categoryCounts.all})
            </button>

            <button
              onClick={() => setSelectedCategory('origin')}
              className={`flex-shrink-0 px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap flex items-center gap-2 ${
                selectedCategory === 'origin'
                  ? 'bg-gray-900 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              <Globe className="w-3.5 h-3.5" strokeWidth={2} />
              {categoryDisplayNames['origin']} ({categoryCounts.origin})
            </button>

            <button
              onClick={() => setSelectedCategory('meaning')}
              className={`flex-shrink-0 px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap flex items-center gap-2 ${
                selectedCategory === 'meaning'
                  ? 'bg-gray-900 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              <MessageCircle className="w-3.5 h-3.5" strokeWidth={2} />
              {categoryDisplayNames['meaning']} ({categoryCounts.meaning})
            </button>

            <button
              onClick={() => setSelectedCategory('style')}
              className={`flex-shrink-0 px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap flex items-center gap-2 ${
                selectedCategory === 'style'
                  ? 'bg-gray-900 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              <Palette className="w-3.5 h-3.5" strokeWidth={2} />
              {categoryDisplayNames['style']} ({categoryCounts.style})
            </button>

            <button
              onClick={() => setSelectedCategory('theme')}
              className={`flex-shrink-0 px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap flex items-center gap-2 ${
                selectedCategory === 'theme'
                  ? 'bg-gray-900 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              <Tag className="w-3.5 h-3.5" strokeWidth={2} />
              {categoryDisplayNames['theme']} ({categoryCounts.theme})
            </button>

            {filteredLists.length > 0 && (
              <button
                onClick={handleCollapseAll}
                className="flex-shrink-0 ml-auto px-4 py-2 rounded-lg text-sm font-medium bg-white text-gray-600 hover:bg-gray-100 border border-gray-200 transition-colors whitespace-nowrap flex items-center gap-2"
                aria-label="Collapse all lists"
              >
                <Minimize2 className="w-3.5 h-3.5" strokeWidth={2} />
                Collapse All
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-gray-300 border-t-gray-900"></div>
            <p className="mt-3 text-sm text-gray-500">Loading collections...</p>
          </div>
        </div>
      )}

      {/* Accordions Grid */}
      {!loading && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          {filteredLists.length > 0 ? (
            <motion.div
              initial="hidden"
              animate="visible"
              variants={{
                visible: {
                  transition: {
                    staggerChildren: 0.05,
                  },
                },
              }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-4"
            >
              {filteredLists.map((list, index) => (
                <motion.div
                  key={list.id}
                  variants={{
                    hidden: { opacity: 0, y: 10 },
                    visible: { opacity: 1, y: 0 },
                  }}
                  transition={{ duration: 0.3 }}
                >
                  <ThemedListAccordion
                    list={list}
                    allNames={allNames}
                    defaultOpen={expandedAccordions.has(list.id)}
                  />
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16"
            >
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                <Search className="w-7 h-7 text-gray-400" strokeWidth={1.5} />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No lists found</h3>
              <p className="text-sm text-gray-500 mb-6">
                Try adjusting your search or category filter
              </p>
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('all');
                }}
                className="px-5 py-2.5 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors"
              >
                Reset Filters
              </button>
            </motion.div>
          )}

          {/* Matched Names Section - Shows individual names matching search */}
          {searchTerm && matchedNames.length > 0 && (
            <div className="mt-12">
              {/* Section Header */}
              <div className="mb-6">
                <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                  Matching Names
                </h2>
                <p className="text-sm text-gray-600">
                  Found {matchedNames.length} names matching "{searchTerm}"
                </p>
              </div>

              {/* Filter and Sort Controls */}
              <div className="mb-6 space-y-4">
                {/* Gender Filter */}
                <div className="flex flex-wrap gap-2">
                  {(['all', 'male', 'female', 'unisex'] as const).map(gender => (
                    <button
                      key={gender}
                      onClick={() => setGenderFilter(gender)}
                      className={`px-4 py-2 rounded-lg font-medium transition-all ${
                        genderFilter === gender
                          ? 'bg-gradient-to-r from-purple-400 to-pink-400 text-white shadow-md'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {gender.charAt(0).toUpperCase() + gender.slice(1)}
                    </button>
                  ))}
                </div>

                {/* Sort and View Controls */}
                <div className="flex flex-wrap items-center gap-3">
                  {/* Sort Options */}
                  <div className="flex items-stretch rounded-lg overflow-hidden border border-purple-200 bg-white">
                    <span className="px-1.5 py-1 text-[10px] text-purple-700 font-semibold bg-purple-50 border-r border-purple-200 flex items-center whitespace-nowrap">
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
                      className={`px-1.5 py-1 flex items-center justify-center gap-0.5 text-[10px] font-medium transition-all border-r border-purple-200 whitespace-nowrap ${
                        sortBy === 'popularity'
                          ? 'bg-purple-500 text-white'
                          : 'bg-white text-purple-700 hover:bg-purple-50'
                      }`}
                    >
                      <Trophy className={`w-3 h-3 transition-transform ${sortBy === 'popularity' && sortReverse ? 'rotate-180' : ''}`} />
                      <span>Popular</span>
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
                      className={`px-1.5 py-1 flex items-center justify-center gap-0.5 text-[10px] font-medium transition-all border-r border-purple-200 whitespace-nowrap ${
                        sortBy === 'alphabetical'
                          ? 'bg-purple-500 text-white'
                          : 'bg-white text-purple-700 hover:bg-purple-50'
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

                  {/* View Toggle */}
                  <div className="flex gap-2 ml-auto">
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`p-2 rounded-lg transition-all ${
                        viewMode === 'grid'
                          ? 'bg-purple-100 text-purple-700'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                      title="Grid View"
                    >
                      <Grid3x3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={`p-2 rounded-lg transition-all ${
                        viewMode === 'list'
                          ? 'bg-purple-100 text-purple-700'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                      title="List View"
                    >
                      <List className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Names Display */}
              {paginatedNames.length > 0 ? (
                <>
                  {viewMode === 'grid' ? (
                    <AnimatePresence mode="popLayout">
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {paginatedNames.map((name, index) => (
                          <motion.div
                            key={name.name}
                            layout
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{
                              x: 400,
                              rotate: 30,
                              opacity: 0,
                              scale: 0.7,
                              transition: { duration: 0.3, ease: "easeOut" }
                            }}
                            transition={{
                              layout: { duration: 0.3, ease: "easeInOut" },
                              opacity: { delay: index * 0.03, duration: 0.3 }
                            }}
                          >
                            <NameCard
                              name={name}
                              onClick={() => setSelectedName(name)}
                              onFavoriteToggle={() => {
                                // Trigger swipe-off animation on like
                                handleNameRemove(name.name);
                              }}
                            />
                          </motion.div>
                        ))}
                      </div>
                    </AnimatePresence>
                  ) : (
                    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
                      <AnimatePresence mode="popLayout">
                        {paginatedNames.map((name, index) => (
                          <motion.div
                            key={name.name}
                            layout
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{
                              x: 400,
                              opacity: 0,
                              transition: { duration: 0.3, ease: "easeOut" }
                            }}
                            transition={{
                              layout: { duration: 0.3, ease: "easeInOut" },
                              opacity: { delay: index * 0.02, duration: 0.2 }
                            }}
                          >
                            <NameCardCompact
                              name={name}
                              onClick={() => setSelectedName(name)}
                              onFavoriteToggle={() => {
                                // Trigger swipe-off animation on like
                                handleNameRemove(name.name);
                              }}
                            />
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </div>
                  )}

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="mt-6 flex items-center justify-center gap-2">
                      <button
                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                        disabled={currentPage === 1}
                        className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        Previous
                      </button>

                      <span className="px-4 py-2 text-gray-700">
                        Page {currentPage} of {totalPages}
                      </span>

                      <button
                        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                        disabled={currentPage === totalPages}
                        className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        Next
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-500 text-lg">
                    No {genderFilter !== 'all' ? genderFilter : ''} names found matching your search.
                  </p>
                  {genderFilter !== 'all' && (
                    <button
                      onClick={() => setGenderFilter('all')}
                      className="mt-4 px-6 py-2 bg-purple-400 text-white rounded-lg hover:bg-purple-500 transition-colors"
                    >
                      Show All Genders
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Name Detail Modal */}
      {selectedName && (
        <NameDetailModal
          name={selectedName}
          onClose={() => setSelectedName(null)}
        />
      )}

      {/* Footer Stats - Minimalist */}
      {!loading && filteredLists.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-12">
          <div className="bg-white border border-gray-200 rounded-lg p-6 text-center">
            <p className="text-sm text-gray-600">
              Showing <span className="font-semibold text-gray-900">{filteredLists.length}</span>{' '}
              {filteredLists.length !== 1 ? 'lists' : 'list'} · {' '}
              <span className="font-semibold text-gray-900">{allNames.length.toLocaleString()}</span> names total
            </p>
          </div>
        </div>
      )}
    </div>
    </>
  );
};

export default BabyNameListsPage;
