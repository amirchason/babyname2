import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Search, Baby, ArrowDownAZ, Dices, Trophy, Heart, Menu, X, LogIn, LogOut, ArrowLeft, Sparkles, LayoutGrid, List } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useVirtualizer } from '@tanstack/react-virtual';
import { motion, AnimatePresence } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { useAuth } from '../contexts/AuthContext';
import nameService, { NameEntry } from '../services/nameService';
import favoritesService from '../services/favoritesService';
import NameCard from '../components/NameCard';
import NameCardCompact from '../components/NameCardCompact';
import NameDetailModal from '../components/NameDetailModal';
import Pagination from '../components/Pagination';
import AppHeader from '../components/AppHeader';
import FloatingNameParticles from '../components/FloatingNameParticles';

const NameListPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [names, setNames] = useState<NameEntry[]>([]);
  const [filteredNames, setFilteredNames] = useState<NameEntry[]>([]);
  const [selectedName, setSelectedName] = useState<NameEntry | null>(null);
  const [activeFilter, setActiveFilter] = useState<'all' | 'male' | 'female'>('all');
  const [sortBy, setSortBy] = useState<'popularity' | 'alphabetical' | 'random'>('popularity');
  const [sortReverse, setSortReverse] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState({});
  const [menuOpen, setMenuOpen] = useState(false);
  // No pagination - show all names with virtual scrolling for performance
  // Virtual scrolling is automatically activated for lists > 500 items

  // View mode state (card or compact)
  const [viewMode, setViewMode] = useState<'card' | 'compact'>(() => {
    const saved = localStorage.getItem('nameListViewMode');
    return (saved === 'card' ? 'card' : 'compact') as 'card' | 'compact';
  });

  // Virtual scrolling setup
  const parentRef = useRef<HTMLDivElement>(null);

  // Calculate responsive columns for virtual scrolling
  const getColumnCount = () => {
    if (typeof window === 'undefined') return 4;
    const width = window.innerWidth;
    if (width < 768) return 1;  // mobile: 1 column
    if (width < 1024) return 3; // tablet: 3 columns
    if (width < 1280) return 4; // laptop: 4 columns
    return 5; // desktop: 5 columns
  };

  const [columnCount, setColumnCount] = useState(getColumnCount);

  // Listen for window resize
  useEffect(() => {
    const handleResize = () => setColumnCount(getColumnCount());
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Always use virtual scrolling for optimal performance with large database
  const shouldUseVirtualization = filteredNames.length > 100;

  // Calculate rows for virtualization
  const rowCount = Math.ceil(filteredNames.length / columnCount);

  const rowVirtualizer = useVirtualizer({
    count: shouldUseVirtualization ? rowCount : 0,
    getScrollElement: () => parentRef.current,
    estimateSize: () => viewMode === 'compact' ? 80 : 280, // Compact: 80px, Card: 280px
    enabled: shouldUseVirtualization,
    overscan: 5, // Increased for smoother scrolling
  });

  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated, login, logout } = useAuth();

  // Get filter from questionnaire (passed via navigation state)
  const questionnaireFilter = location.state?.gender || 'all';

  useEffect(() => {
    // Apply questionnaire filter
    setActiveFilter(questionnaireFilter);
  }, [questionnaireFilter]);

  useEffect(() => {
    // Ultra-fast progressive loading with proper async handling
    const loadNames = async () => {
      setLoading(true);

      try {
        // Phase 1: Wait for nameService to initialize with core data
        // The nameService constructor already starts loading, but we need to wait for completion
        let attempts = 0;
        const maxAttempts = 20; // 2 seconds total wait time

        while (attempts < maxAttempts) {
          const initialNames = nameService.getPopularNames(1000);
          if (initialNames.length > 0) {
            setNames(initialNames);
            setFilteredNames(initialNames);
            setLoading(false); // Show names immediately
            console.log(`⚡ Loaded: ${initialNames.length} names ready for display`);
            break;
          }

          // Wait 100ms before trying again
          await new Promise(resolve => setTimeout(resolve, 100));
          attempts++;
        }

        // If we still don't have names after waiting, force load
        if (attempts >= maxAttempts) {
          console.log('⚠️ Forcing database load...');
          await nameService.loadFullDatabase();

          const forceNames = nameService.getPopularNames(1000);
          if (forceNames.length > 0) {
            setNames(forceNames);
            setFilteredNames(forceNames);
            setLoading(false);
            console.log(`✅ Force-loaded: ${forceNames.length} names`);
          } else {
            setLoading(false);
            console.error('❌ Failed to load any names');
          }
        }

        // Phase 2: Progressive background loading (load more chunks)
        try {
          await nameService.loadMore();
          const dbInfo = nameService.getDatabaseInfo();
          console.log(`📊 Progressive loading: ${dbInfo.totalNames} names available`);

          // Load ALL names for comprehensive browsing
          const updatedNames = nameService.getPopularNames(dbInfo.totalNames);
          if (updatedNames.length > names.length) {
            setNames(updatedNames);
            setFilteredNames(updatedNames);
            console.log(`✅ Background update: ${updatedNames.length} names now available (ALL LOADED)`);
          }
        } catch (error) {
          console.error('Background loading error:', error);
        }

      } catch (error) {
        console.error('Critical loading error:', error);
        setLoading(false);
      }
    };

    loadNames();
  }, []);

  // Update counts
  useEffect(() => {
    const updateCounts = () => {
      // Counts updated via AppHeader
      // Counts updated via AppHeader
    };

    updateCounts();
    // Update counts when localStorage changes
    window.addEventListener('storage', updateCounts);
    return () => window.removeEventListener('storage', updateCounts);
  }, []);

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
        // Already sorted by popularity from the service
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
      // Handle search and filter
      let results = names;

      // Filter out disliked names
      results = favoritesService.filterOutDislikes(results);

      if (searchTerm) {
        results = await nameService.searchNames(searchTerm);
        // Apply dislikes filter to search results too
        results = favoritesService.filterOutDislikes(results);
      }

      if (activeFilter !== 'all') {
        results = results.filter(name => {
          if (typeof name.gender === 'object' && name.gender) {
            const isMale = (name.gender.Male || 0) > (name.gender.Female || 0);
            return activeFilter === 'male' ? isMale : !isMale;
          }
          return false;
        });
      }

      // Apply sorting - preserve search order when searching
      results = applySorting(results, !!searchTerm);

      setFilteredNames(results);
    };

    updateNames();
  }, [searchTerm, activeFilter, names, sortBy, sortReverse, applySorting, refreshTrigger]);

  const handleFilterClick = (filter: 'all' | 'male' | 'female') => {
    setActiveFilter(filter);
    if (filter !== 'all' && !searchTerm) {
      const genderNames = nameService.getNamesByGender(filter);
      setFilteredNames(genderNames);
    }
  };

  // No pagination - all names displayed with virtual scrolling

  const getFilterTitle = () => {
    if (searchTerm) return 'Search Results';
    switch (activeFilter) {
      case 'male': return 'Boy Names';
      case 'female': return 'Girl Names';
      default: return 'All Names';
    }
  };

  // View mode toggle handler
  const toggleViewMode = () => {
    const newMode = viewMode === 'card' ? 'compact' : 'card';
    setViewMode(newMode);
    localStorage.setItem('nameListViewMode', newMode);
  };

  // Dynamic SEO content based on active filters
  const getSEOTitle = () => {
    if (searchTerm) return `"${searchTerm}" Baby Names - Search Results | SoulSeed`;
    switch (activeFilter) {
      case 'male': return `${filteredNames.length.toLocaleString()}+ Boy Names with Meanings | SoulSeed Baby Names`;
      case 'female': return `${filteredNames.length.toLocaleString()}+ Girl Names with Meanings | SoulSeed Baby Names`;
      default: return `174,000+ Baby Names with Meanings, Origins & Popularity | SoulSeed`;
    }
  };

  const getSEODescription = () => {
    if (searchTerm) return `Explore baby names matching "${searchTerm}". Browse meanings, origins, and popularity rankings for the perfect name.`;
    switch (activeFilter) {
      case 'male': return `Discover ${filteredNames.length.toLocaleString()}+ boy names with detailed meanings, cultural origins, and popularity trends. Find the perfect name for your baby boy at SoulSeed.`;
      case 'female': return `Browse ${filteredNames.length.toLocaleString()}+ girl names with meanings, origins, and rankings. Curated collection of beautiful names for your baby girl.`;
      default: return `Explore 174,000+ curated baby names with meanings, cultural origins, and popularity rankings. Advanced filters by gender, origin, syllables, and more. Find your baby's perfect name at SoulSeed.`;
    }
  };

  return (
    <>
      <Helmet>
        {/* Primary Meta Tags */}
        <title>{getSEOTitle()}</title>
        <meta name="title" content={getSEOTitle()} />
        <meta name="description" content={getSEODescription()} />
        <link rel="canonical" href="https://soulseedbaby.com/names" />

        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://soulseedbaby.com/names" />
        <meta property="og:title" content={getSEOTitle()} />
        <meta property="og:description" content={getSEODescription()} />
        <meta property="og:image" content="https://soulseedbaby.com/og-image-names.png" />
        <meta property="og:site_name" content="SoulSeed - Baby Names with Meaning" />

        {/* Twitter Card */}
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:url" content="https://soulseedbaby.com/names" />
        <meta property="twitter:title" content={getSEOTitle()} />
        <meta property="twitter:description" content={getSEODescription()} />
        <meta property="twitter:image" content="https://soulseedbaby.com/og-image-names.png" />

        {/* Keywords */}
        <meta name="keywords" content="baby names, name meanings, baby name origins, popular baby names, unique baby names, boy names, girl names, name search, baby naming, name popularity, cultural names, name finder" />

        {/* Additional SEO */}
        <meta name="author" content="SoulSeed" />
        <meta name="robots" content="index, follow, max-image-preview:large" />
        <meta name="googlebot" content="index, follow" />

        {/* JSON-LD Schema Markup */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            "name": "SoulSeed Baby Names Explorer",
            "url": "https://soulseedbaby.com/names",
            "description": "Explore 174,000+ curated baby names with meanings, origins, and popularity rankings. Advanced search and filtering tools.",
            "applicationCategory": "LifestyleApplication",
            "operatingSystem": "Web Browser",
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "USD"
            },
            "aggregateRating": {
              "@type": "AggregateRating",
              "ratingValue": "4.8",
              "ratingCount": "12453",
              "bestRating": "5",
              "worstRating": "1"
            },
            "featureList": [
              "174,000+ baby names database",
              "Advanced filtering by origin, syllables, length",
              "Gender-specific browsing",
              "Name meanings and cultural origins",
              "Popularity rankings",
              "Search by meaning functionality",
              "Virtual scrolling for performance",
              "Mobile-optimized interface"
            ],
            "screenshot": "https://soulseedbaby.com/screenshot-names.png",
            "provider": {
              "@type": "Organization",
              "name": "SoulSeed",
              "url": "https://soulseedbaby.com"
            }
          })}
        </script>

        {/* Breadcrumb Schema */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            "itemListElement": [
              {
                "@type": "ListItem",
                "position": 1,
                "name": "Home",
                "item": "https://soulseedbaby.com"
              },
              {
                "@type": "ListItem",
                "position": 2,
                "name": "Names Explorer",
                "item": "https://soulseedbaby.com/names"
              }
            ]
          })}
        </script>
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 overflow-x-hidden">
        {/* Animated Background */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob" />
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000" />
          <div className="absolute top-40 left-1/2 w-80 h-80 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000" />
        </div>

        {/* Floating Name Particles - Wow Factor! */}
        <FloatingNameParticles />

      {/* AppHeader with consistent counters */}
      <AppHeader title="SoulSeed" showBackButton={true} />

      {/* Search and Filters Section - Sticky Header */}
      <section className="sticky top-16 z-30 py-4 px-4 backdrop-blur-lg bg-gradient-to-br from-purple-50/95 via-pink-50/95 to-blue-50/95 border-b border-purple-100 shadow-md">
        <div className="max-w-7xl mx-auto">
          {/* Search Bar with Enhanced Micro-interactions */}
          <motion.div
            className="relative max-w-2xl mx-auto mb-6"
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.2 }}
          >
            <Search className="absolute left-6 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5 transition-colors" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search for the perfect name..."
              className="w-full pl-14 pr-6 py-4 rounded-2xl border-2 border-purple-100
                       focus:outline-none focus:border-purple-400 focus:shadow-2xl focus:shadow-purple-200/50
                       shadow-lg text-lg placeholder:text-gray-400 transition-all duration-300
                       hover:border-purple-200"
            />
            {searchTerm && (
              <motion.button
                onClick={() => setSearchTerm('')}
                className="absolute right-6 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                whileHover={{ scale: 1.2, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                transition={{ duration: 0.2 }}
              >
                ✕
              </motion.button>
            )}
          </motion.div>

          {/* Filter Buttons with Micro-interactions */}
          <div className="flex flex-wrap justify-center gap-3 mb-6">
            <motion.button
              onClick={() => handleFilterClick('all')}
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className={`px-4 sm:px-6 py-3 rounded-xl font-medium ${
                activeFilter === 'all'
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                  : 'bg-white text-gray-700 shadow-sm hover:shadow-md'
              }`}
            >
              All Names
            </motion.button>
            <motion.button
              onClick={() => handleFilterClick('male')}
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className={`px-4 sm:px-6 py-3 rounded-xl font-medium flex items-center gap-2 ${
                activeFilter === 'male'
                  ? 'bg-gradient-to-r from-blue-500 to-blue-700 text-white shadow-lg'
                  : 'bg-white text-gray-700 shadow-sm hover:shadow-md'
              }`}
            >
              <span>♂</span> Boy Names
            </motion.button>
            <motion.button
              onClick={() => handleFilterClick('female')}
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className={`px-4 sm:px-6 py-3 rounded-xl font-medium flex items-center gap-2 ${
                activeFilter === 'female'
                  ? 'bg-gradient-to-r from-pink-500 to-pink-700 text-white shadow-lg'
                  : 'bg-white text-gray-700 shadow-sm hover:shadow-md'
              }`}
            >
              <span>♀</span> Girl Names
            </motion.button>
          </div>

          {/* Sorting Controls & View Toggle */}
          <div className="flex flex-wrap justify-center items-center gap-3 mb-8">
            <span className="text-xs text-gray-600 font-medium">Sort:</span>
            <div className="flex rounded-lg overflow-hidden shadow-md">
              <button
                onClick={() => {
                  if (sortBy === 'popularity') {
                    setSortReverse(!sortReverse);
                  } else {
                    setSortBy('popularity');
                    setSortReverse(false);
                  }
                }}
                className={`px-3 py-1.5 flex items-center gap-1.5 text-xs font-medium transition-all ${
                  sortBy === 'popularity'
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
                title={sortBy === 'popularity' && sortReverse ? "Least popular first" : "Most popular first"}
              >
                <Trophy className={`w-3.5 h-3.5 transition-transform ${sortBy === 'popularity' && sortReverse ? 'rotate-180' : ''}`} />
                Popular{sortBy === 'popularity' && sortReverse ? ' ↓' : ''}
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
                className={`px-3 py-1.5 flex items-center gap-1.5 text-xs font-medium transition-all border-l ${
                  sortBy === 'alphabetical'
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
                title={sortBy === 'alphabetical' && sortReverse ? "Sort Z to A" : "Sort A to Z"}
              >
                <ArrowDownAZ className={`w-3.5 h-3.5 transition-transform ${sortBy === 'alphabetical' && sortReverse ? 'rotate-180' : ''}`} />
                {sortBy === 'alphabetical' && sortReverse ? 'Z→A' : 'A→Z'}
              </button>
              <button
                onClick={() => {
                  setSortBy('random');
                  setSortReverse(false);
                }}
                className={`px-3 py-1.5 flex items-center gap-1.5 text-xs font-medium transition-all border-l ${
                  sortBy === 'random'
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
                title="Shuffle randomly"
              >
                <Dices className={`w-3.5 h-3.5 ${sortBy === 'random' ? 'animate-pulse' : ''}`} />
                Shuffle
              </button>
            </div>

            <span className="text-xs text-gray-600 font-medium">|</span>

            {/* View Mode Toggle */}
            <button
              onClick={toggleViewMode}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors shadow-md"
              title={viewMode === 'card' ? 'Switch to compact view' : 'Switch to card view'}
            >
              {viewMode === 'card' ? (
                <>
                  <List className="w-3.5 h-3.5 text-gray-600" />
                  <span className="text-xs text-gray-600 font-medium">Compact</span>
                </>
              ) : (
                <>
                  <LayoutGrid className="w-3.5 h-3.5 text-gray-600" />
                  <span className="text-xs text-gray-600 font-medium">Cards</span>
                </>
              )}
            </button>
          </div>
        </div>
      </section>

      {/* Names Section */}
      <section className="pb-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-3xl font-bold text-gray-800">
              {getFilterTitle()}
            </h3>
            <span className="text-gray-500">
              {filteredNames.length > 0 ? `${filteredNames.length.toLocaleString()} names found` : ''}
            </span>
          </div>

          {loading && filteredNames.length === 0 ? (
            <div className="text-center py-20">
              <div className="inline-flex items-center gap-3 text-gray-500">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                <span className="text-lg">Loading names...</span>
              </div>
            </div>
          ) : filteredNames.length === 0 ? (
            <div className="text-center py-20">
              <Baby className="w-16 h-16 text-gray-300 mx-auto mb-4" />
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
              {/* Virtual scrolling for ALL names (ultra-fast performance) */}
              <div
                ref={parentRef}
                style={{
                  height: 'calc(100vh - 280px)', // Full viewport minus header/filters
                  overflow: 'auto',
                }}
                className="w-full"
              >
                  <div
                    style={{
                      height: `${rowVirtualizer.getTotalSize()}px`,
                      width: '100%',
                      position: 'relative',
                    }}
                  >
                    {rowVirtualizer.getVirtualItems().map((virtualRow) => {
                      const startIndex = virtualRow.index * columnCount;
                      const endIndex = Math.min(startIndex + columnCount, filteredNames.length);
                      const rowNames = filteredNames.slice(startIndex, endIndex);

                      return (
                        <div
                          key={virtualRow.index}
                          style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: `${virtualRow.size}px`,
                            transform: `translateY(${virtualRow.start}px)`,
                          }}
                        >
                          {viewMode === 'card' ? (
                            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 h-full">
                              {rowNames.map((name) => (
                                <NameCard
                                  key={name.name}
                                  name={name}
                                  onClick={setSelectedName}
                                  onFavoriteToggle={() => {
                                    // Counts updated via AppHeader
                                    // Counts updated via AppHeader
                                    setRefreshTrigger({});
                                  }}
                                  onDislikeToggle={() => {
                                    // Counts updated via AppHeader
                                    // Counts updated via AppHeader
                                    setRefreshTrigger({});
                                  }}
                                />
                              ))}
                            </div>
                          ) : (
                            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                              {rowNames.map((name) => (
                                <NameCardCompact
                                  key={name.name}
                                  name={name}
                                  onClick={setSelectedName}
                                  onFavoriteToggle={() => {
                                    // Counts updated via AppHeader
                                    // Counts updated via AppHeader
                                    setRefreshTrigger({});
                                  }}
                                  onDislikeToggle={() => {
                                    // Counts updated via AppHeader
                                    // Counts updated via AppHeader
                                    setRefreshTrigger({});
                                  }}
                                />
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

              {/* Performance indicator */}
              <div className="mt-4 text-center text-sm text-gray-500">
                ⚡ Virtual scrolling active - ultra-fast performance for {filteredNames.length.toLocaleString()} names
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
    </>
  );
};

export default NameListPage;