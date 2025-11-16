/**
 * Desktop-Optimized Homepage
 * Layout: Persistent sidebar + main content area with grid/table/split views
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Smartphone } from 'lucide-react';
import Lottie from 'lottie-react';
import { NameEntry } from '../services/nameService';
import { useNameCache } from '../contexts/NameCacheContext';
import { useDesktopView } from '../contexts/DesktopViewContext';
import { DesktopViewProvider } from '../contexts/DesktopViewContext';
import nameService from '../services/nameService';
import favoritesService from '../services/favoritesService';
import AppHeader from '../components/AppHeader';
import DesktopToolbar from '../components/desktop/DesktopToolbar';
import DesktopFilterSidebar from '../components/desktop/DesktopFilterSidebar';
import DesktopNameGrid from '../components/desktop/DesktopNameGrid';
import DesktopNameTable from '../components/desktop/DesktopNameTable';
import NameDetailModal from '../components/NameDetailModal';
import Pagination from '../components/Pagination';

const HomePageDesktopContent: React.FC = () => {
  const navigate = useNavigate();
  const { names: cachedNames, allOrigins: cachedOrigins, genderCounts: cachedGenderCounts } = useNameCache();
  const { viewMode, sidebarCollapsed, selectedNameId, setSelectedNameId } = useDesktopView();

  // Filter states
  const [activeFilter, setActiveFilter] = useState<'all' | 'male' | 'female' | 'unisex'>('all');
  const [sortBy, setSortBy] = useState<'popularity' | 'alphabetical' | 'random'>('popularity');
  const [sortReverse, setSortReverse] = useState(false);
  const [selectedOrigins, setSelectedOrigins] = useState<Set<string>>(new Set());
  const [selectedStartLetters, setSelectedStartLetters] = useState<Set<string>>(new Set());
  const [selectedLengths, setSelectedLengths] = useState<Set<string>>(new Set());
  const [selectedSyllables, setSelectedSyllables] = useState<Set<number>>(new Set());
  const [selectedEndings, setSelectedEndings] = useState<Set<string>>(new Set());

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 60; // More items per page for desktop

  // Selected name for modal
  const [selectedName, setSelectedName] = useState<NameEntry | null>(null);
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Refresh trigger
  const [refreshTrigger, setRefreshTrigger] = useState({});

  // Flower animation state
  const [flowerAnimation, setFlowerAnimation] = useState<any>(null);

  // Load flower animation
  useEffect(() => {
    fetch('/heroflowers.json')
      .then(response => response.json())
      .then(data => setFlowerAnimation(data))
      .catch(error => console.error('Failed to load flower animation:', error));
  }, []);

  // Mobile-optimized banner
  const [showMobileBanner, setShowMobileBanner] = useState(() => {
    const dismissed = localStorage.getItem('desktop_mobile_banner_dismissed');
    return dismissed !== 'true';
  });

  // Helper functions (from HomePage)
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

  const getSyllableCount = (name: string): number => {
    const vowels = 'aeiouy';
    let count = 0;
    let previousWasVowel = false;

    for (let i = 0; i < name.length; i++) {
      const char = name[i].toLowerCase();
      const isVowel = vowels.includes(char);

      if (isVowel && !previousWasVowel) {
        count++;
      }

      previousWasVowel = isVowel;
    }

    return Math.max(count, 1);
  };

  // Clear all filters
  const clearAllFilters = () => {
    setSelectedOrigins(new Set());
    setSelectedStartLetters(new Set());
    setSelectedEndings(new Set());
    setSelectedSyllables(new Set());
    setSelectedLengths(new Set());
  };

  // Count active filters
  const activeFiltersCount = selectedOrigins.size + selectedStartLetters.size + selectedEndings.size + selectedSyllables.size + selectedLengths.size;

  // Apply sorting
  const applySorting = useCallback((namesToSort: NameEntry[]): NameEntry[] => {
    let sorted = [...namesToSort];

    switch (sortBy) {
      case 'alphabetical':
        sorted = sorted.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'random':
        for (let i = sorted.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [sorted[i], sorted[j]] = [sorted[j], sorted[i]];
        }
        return sorted; // Return early, no reverse for random
      case 'popularity':
      default:
        sorted = sorted.sort((a, b) => {
          const rankA = a.popularityRank || 999999;
          const rankB = b.popularityRank || 999999;
          return rankA - rankB;
        });
        break;
    }

    if (sortReverse) {
      sorted = sorted.reverse();
    }

    return sorted;
  }, [sortBy, sortReverse]);

  // Filter and sort names
  const filteredNames = useMemo(() => {
    let results = [...cachedNames];

    // Filter out liked and disliked names
    results = results.filter(name =>
      !favoritesService.isDisliked(name.name) &&
      !favoritesService.isFavorite(name.name)
    );

    // Gender filter
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

    // Origin filter
    if (selectedOrigins.size > 0) {
      results = results.filter(name =>
        name.origin && selectedOrigins.has(name.origin)
      );
    }

    // Starting letter filter
    if (selectedStartLetters.size > 0) {
      results = results.filter(name =>
        selectedStartLetters.has(name.name[0].toUpperCase())
      );
    }

    // Length filter
    if (selectedLengths.size > 0) {
      results = results.filter(name =>
        selectedLengths.has(getNameLength(name.name))
      );
    }

    // Syllable filter
    if (selectedSyllables.size > 0) {
      results = results.filter(name =>
        selectedSyllables.has(getSyllableCount(name.name))
      );
    }

    // Ending filter
    if (selectedEndings.size > 0) {
      results = results.filter(name =>
        selectedEndings.has(getNameEnding(name.name))
      );
    }

    // Apply sorting
    return applySorting(results);
  }, [
    cachedNames,
    activeFilter,
    selectedOrigins,
    selectedStartLetters,
    selectedLengths,
    selectedSyllables,
    selectedEndings,
    applySorting,
  ]);

  // Process origins for sidebar
  const sortedOrigins = useMemo(() => {
    const originCounts = new Map<string, number>();

    cachedNames.forEach(name => {
      if (name.origin) {
        const count = originCounts.get(name.origin) || 0;
        originCounts.set(name.origin, count + 1);
      }
    });

    return Array.from(originCounts.entries())
      .map(([origin, count]) => ({ origin, count }))
      .sort((a, b) => b.count - a.count);
  }, [cachedNames]);

  // Handle name click
  const handleNameClick = (name: NameEntry, index: number) => {
    setSelectedName(name);
    setSelectedIndex(index);
    setSelectedNameId(name.name);
  };

  // Handle modal close
  const handleModalClose = () => {
    setSelectedName(null);
    setSelectedNameId(null);
  };

  // Refresh data (for favorite/dislike toggles)
  const refreshData = () => {
    setRefreshTrigger({});
  };

  // Handle mobile banner dismiss
  const handleDismissMobileBanner = () => {
    localStorage.setItem('desktop_mobile_banner_dismissed', 'true');
    setShowMobileBanner(false);
  };

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [activeFilter, selectedOrigins, selectedStartLetters, selectedLengths, selectedSyllables, selectedEndings, sortBy, sortReverse]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <AppHeader />

      {/* Mobile Optimization Banner */}
      <AnimatePresence>
        {showMobileBanner && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="relative bg-gradient-to-r from-purple-100 via-pink-100 to-purple-100 border-b-2 border-purple-200 overflow-hidden"
          >
            <div className="max-w-7xl mx-auto px-6 py-8 text-center relative">
              {/* Close button */}
              <button
                onClick={handleDismissMobileBanner}
                className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/50 transition-colors"
                aria-label="Dismiss banner"
              >
                <X className="w-6 h-6 text-gray-600" />
              </button>

              {/* Icon */}
              <div className="flex justify-center mb-4">
                <div className="bg-white/80 rounded-full p-4">
                  <Smartphone className="w-12 h-12 text-purple-600" />
                </div>
              </div>

              {/* Main message */}
              <h2 className="text-4xl font-bold text-gray-900 mb-3">
                This app is optimized for mobile devices
              </h2>

              {/* Subtext */}
              <p className="text-xl text-gray-700 max-w-2xl mx-auto">
                For the best experience with swipe gestures and mobile-first design,
                please visit on your phone or tablet.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero Section with Flower Animation */}
      <div className="relative bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            {/* Left: Text Content */}
            <div className="text-center lg:text-left">
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="text-5xl xl:text-6xl font-bold text-gray-900 mb-4"
              >
                Find Your Baby's
                <span className="block bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 bg-clip-text text-transparent">
                  Perfect Name
                </span>
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="text-xl text-gray-600 mb-6"
              >
                Explore 174,000+ meaningful names from diverse cultures with AI-powered insights
              </motion.p>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="flex gap-4 justify-center lg:justify-start"
              >
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600">{filteredNames.length.toLocaleString()}</div>
                  <div className="text-sm text-gray-500">Names Available</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-pink-600">{cachedGenderCounts.male + cachedGenderCounts.female}</div>
                  <div className="text-sm text-gray-500">Origins</div>
                </div>
              </motion.div>
            </div>

            {/* Right: Flower Animation */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="flex justify-center lg:justify-end"
            >
              <div className="w-full max-w-md">
                {flowerAnimation ? (
                  <Lottie
                    animationData={flowerAnimation}
                    loop={true}
                    autoplay={true}
                    style={{ width: '100%', height: 'auto' }}
                  />
                ) : (
                  <div className="w-full aspect-square bg-gradient-to-br from-purple-100 to-pink-100 rounded-full animate-pulse" />
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <DesktopToolbar
        totalResults={filteredNames.length}
        currentPage={currentPage}
        itemsPerPage={itemsPerPage}
      />

      {/* Main layout: Sidebar + Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Filter Sidebar */}
        {!sidebarCollapsed && (
          <DesktopFilterSidebar
            activeFilter={activeFilter}
            setActiveFilter={setActiveFilter}
            sortBy={sortBy}
            setSortBy={setSortBy}
            sortReverse={sortReverse}
            setSortReverse={setSortReverse}
            selectedOrigins={selectedOrigins}
            setSelectedOrigins={setSelectedOrigins}
            selectedStartLetters={selectedStartLetters}
            setSelectedStartLetters={setSelectedStartLetters}
            selectedLengths={selectedLengths}
            setSelectedLengths={setSelectedLengths}
            selectedSyllables={selectedSyllables}
            setSelectedSyllables={setSelectedSyllables}
            selectedEndings={selectedEndings}
            setSelectedEndings={setSelectedEndings}
            sortedOrigins={sortedOrigins}
            genderCounts={cachedGenderCounts}
            activeFiltersCount={activeFiltersCount}
            clearAllFilters={clearAllFilters}
          />
        )}

        {/* Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Grid or Table View */}
          <div className="flex-1 overflow-y-auto">
            {viewMode === 'grid' && (
              <DesktopNameGrid
                names={filteredNames}
                onNameClick={handleNameClick}
                onFavoriteToggle={refreshData}
                onDislikeToggle={refreshData}
                currentPage={currentPage}
                itemsPerPage={itemsPerPage}
                filterContext={activeFilter}
              />
            )}

            {viewMode === 'table' && (
              <DesktopNameTable
                names={filteredNames}
                onNameClick={handleNameClick}
                onFavoriteToggle={refreshData}
                onDislikeToggle={refreshData}
                currentPage={currentPage}
                itemsPerPage={itemsPerPage}
                filterContext={activeFilter}
              />
            )}

            {viewMode === 'split' && (
              <div className="flex-1 flex">
                {/* Left: Name list (40%) */}
                <div className="w-2/5 border-r border-gray-200 overflow-y-auto">
                  <DesktopNameTable
                    names={filteredNames}
                    onNameClick={handleNameClick}
                    onFavoriteToggle={refreshData}
                    onDislikeToggle={refreshData}
                    currentPage={currentPage}
                    itemsPerPage={itemsPerPage}
                    filterContext={activeFilter}
                  />
                </div>
                {/* Right: Detail panel (60%) */}
                <div className="flex-1 overflow-y-auto bg-white p-8">
                  {selectedName ? (
                    <div>
                      <h1 className="text-4xl font-bold text-gray-900 mb-4">{selectedName.name}</h1>
                      <div className="space-y-4 text-gray-700">
                        <div>
                          <h3 className="text-sm font-semibold text-gray-500 uppercase mb-1">Origin</h3>
                          <p>{selectedName.origin || 'Unknown'}</p>
                        </div>
                        <div>
                          <h3 className="text-sm font-semibold text-gray-500 uppercase mb-1">Meaning</h3>
                          <p>{selectedName.meaning || 'No meaning available'}</p>
                        </div>
                        <div>
                          <h3 className="text-sm font-semibold text-gray-500 uppercase mb-1">Gender</h3>
                          <p>{typeof selectedName.gender === 'string' ? selectedName.gender : 'Unknown'}</p>
                        </div>
                        {selectedName.popularityRank && (
                          <div>
                            <h3 className="text-sm font-semibold text-gray-500 uppercase mb-1">Popularity Rank</h3>
                            <p>#{selectedName.popularityRank.toLocaleString()}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-400">
                      <p>Select a name to view details</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Pagination */}
          {viewMode !== 'split' && filteredNames.length > itemsPerPage && (
            <div className="border-t border-gray-200 bg-white py-4">
              <Pagination
                currentPage={currentPage}
                totalPages={Math.ceil(filteredNames.length / itemsPerPage)}
                onPageChange={setCurrentPage}
                itemsPerPage={itemsPerPage}
                totalItems={filteredNames.length}
              />
            </div>
          )}
        </div>
      </div>

      {/* Name Detail Modal (for grid/table views) */}
      {selectedName && viewMode !== 'split' && (
        <NameDetailModal
          name={selectedName}
          onClose={handleModalClose}
          contextualRank={selectedIndex + 1}
        />
      )}
    </div>
  );
};

// Wrapper with DesktopViewProvider
const HomePageDesktop: React.FC = () => {
  return (
    <DesktopViewProvider>
      <HomePageDesktopContent />
    </DesktopViewProvider>
  );
};

export default HomePageDesktop;
