/**
 * Desktop-Optimized Homepage
 * Layout: Persistent sidebar + main content area with grid/table/split views
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
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
import UnicornFlowerBackground from '../components/UnicornFlowerBackground';
import FeaturedBlogs from '../components/FeaturedBlogs';

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


  // Mobile-optimized banner - REMOVED (user request)
  // const [showMobileBanner, setShowMobileBanner] = useState(() => {
  //   const dismissed = localStorage.getItem('desktop_mobile_banner_dismissed');
  //   return dismissed !== 'true';
  // });

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

  // Use consolidated origins from NameCacheContext (40 origins)
  // This consolidates 100k+ raw origins into ~40 curated categories
  const sortedOrigins = cachedOrigins;

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

  // Handle mobile banner dismiss - REMOVED (user request)
  // const handleDismissMobileBanner = () => {
  //   localStorage.setItem('desktop_mobile_banner_dismissed', 'true');
  //   setShowMobileBanner(false);
  // };

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [activeFilter, selectedOrigins, selectedStartLetters, selectedLengths, selectedSyllables, selectedEndings, sortBy, sortReverse]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <AppHeader />

      {/* Hero Section - Mobile-Style Flower Animation Background */}
      <section className="relative pt-24 pb-16 px-4 min-h-[60vh] flex items-center justify-center overflow-hidden">
        {/* Full Screen Flower Animation Background */}
        <div className="absolute inset-0 w-full h-full opacity-60">
          <UnicornFlowerBackground />
        </div>

        {/* Hero Content */}
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 1.2,
              ease: [0.25, 0.1, 0.25, 1.0]
            }}
            className="text-5xl md:text-7xl font-bold text-white mb-6"
            style={{
              textShadow: '0 2px 10px rgba(0, 0, 0, 0.3), 0 4px 20px rgba(0, 0, 0, 0.15)',
              letterSpacing: '0.02em'
            }}
          >
            The Name Is The Seed Of The Soul
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.2, delay: 0.3, ease: [0.25, 0.1, 0.25, 1.0] }}
            className="text-xl md:text-2xl text-white/90 mb-8 font-light"
            style={{
              textShadow: '0 1px 8px rgba(0, 0, 0, 0.3)',
              letterSpacing: '0.01em'
            }}
          >
            Discover the perfect name from 150,000+ unique options
          </motion.p>
        </div>
      </section>

      {/* Featured Blogs Section - 3 Random Blogs */}
      <FeaturedBlogs />

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
