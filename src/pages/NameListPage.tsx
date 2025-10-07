import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Search, Baby, ArrowDownAZ, Dices, Trophy, Heart, Menu, X, LogIn, LogOut, ArrowLeft, Sparkles } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useVirtualizer } from '@tanstack/react-virtual';
import { useAuth } from '../contexts/AuthContext';
import nameService, { NameEntry } from '../services/nameService';
import favoritesService from '../services/favoritesService';
import NameCard from '../components/NameCard';
import NameDetailModal from '../components/NameDetailModal';
import Pagination from '../components/Pagination';
import AppHeader from '../components/AppHeader';

const NameListPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [names, setNames] = useState<NameEntry[]>([]);
  const [filteredNames, setFilteredNames] = useState<NameEntry[]>([]);
  const [selectedName, setSelectedName] = useState<NameEntry | null>(null);
  const [activeFilter, setActiveFilter] = useState<'all' | 'male' | 'female'>('all');
  const [sortBy, setSortBy] = useState<'popularity' | 'alphabetical' | 'random'>('popularity');
  const [sortReverse, setSortReverse] = useState(false);
  const [loading, setLoading] = useState(true);
  const [, forceUpdate] = useState({});
  const [menuOpen, setMenuOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(100); // 100 names per page
  // Virtual scrolling is automatically activated for large lists

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

  // Virtual scrolling for large lists (when > 500 items)
  const shouldUseVirtualization = filteredNames.length > 500;

  // Calculate rows for virtualization
  const rowCount = Math.ceil(filteredNames.length / columnCount);

  const rowVirtualizer = useVirtualizer({
    count: shouldUseVirtualization ? rowCount : 0,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 280, // Estimated row height
    enabled: shouldUseVirtualization,
    overscan: 3,
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

          const updatedNames = nameService.getPopularNames(Math.min(10000, dbInfo.totalNames));
          if (updatedNames.length > names.length) {
            setNames(updatedNames);
            setFilteredNames(updatedNames);
            console.log(`✅ Background update: ${updatedNames.length} names now available`);
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
      setFavoritesCount(favoritesService.getFavoritesCount());
      setDislikesCount(favoritesService.getDislikesCount());
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
  }, [searchTerm, activeFilter, names, sortBy, sortReverse, applySorting]);

  // Reset page when search term changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const handleFilterClick = (filter: 'all' | 'male' | 'female') => {
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
    window.scrollTo({ top: 100, behavior: 'smooth' });
  };

  const getFilterTitle = () => {
    if (searchTerm) return 'Search Results';
    switch (activeFilter) {
      case 'male': return 'Boy Names';
      case 'female': return 'Girl Names';
      default: return 'All Names';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 overflow-x-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000" />
        <div className="absolute top-40 left-1/2 w-80 h-80 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000" />
      </div>

      {/* AppHeader with consistent counters */}
      <AppHeader title="BabyNames 2025" showBackButton={true} />

      {/* Search and Filters Section */}
      <section className="py-8 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Search Bar */}
          <div className="relative max-w-2xl mx-auto mb-6">
            <Search className="absolute left-6 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search for the perfect name..."
              className="w-full pl-14 pr-6 py-4 rounded-2xl border-2 border-purple-100
                       focus:outline-none focus:border-purple-400 shadow-lg text-lg
                       placeholder:text-gray-400 transition-all"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-6 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            )}
          </div>

          {/* Filter Buttons */}
          <div className="flex flex-wrap justify-center gap-3 mb-6">
            <button
              onClick={() => handleFilterClick('all')}
              className={`px-4 sm:px-6 py-3 rounded-xl font-medium transition-all ${
                activeFilter === 'all'
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                  : 'bg-white text-gray-700 hover:shadow-md'
              }`}
            >
              All Names
            </button>
            <button
              onClick={() => handleFilterClick('male')}
              className={`px-4 sm:px-6 py-3 rounded-xl font-medium transition-all flex items-center gap-2 ${
                activeFilter === 'male'
                  ? 'bg-gradient-to-r from-blue-500 to-blue-700 text-white shadow-lg'
                  : 'bg-white text-gray-700 hover:shadow-md'
              }`}
            >
              <span>♂</span> Boy Names
            </button>
            <button
              onClick={() => handleFilterClick('female')}
              className={`px-4 sm:px-6 py-3 rounded-xl font-medium transition-all flex items-center gap-2 ${
                activeFilter === 'female'
                  ? 'bg-gradient-to-r from-pink-500 to-pink-700 text-white shadow-lg'
                  : 'bg-white text-gray-700 hover:shadow-md'
              }`}
            >
              <span>♀</span> Girl Names
            </button>
          </div>

          {/* Sorting Controls */}
          <div className="flex flex-wrap justify-center items-center gap-4 mb-8">
            <span className="text-sm text-gray-600 font-medium">Sort:</span>
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
                className={`px-4 py-2 flex items-center gap-2 text-sm font-medium transition-all ${
                  sortBy === 'popularity'
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
                title={sortBy === 'popularity' && sortReverse ? "Least popular first" : "Most popular first"}
              >
                <Trophy className={`w-4 h-4 transition-transform ${sortBy === 'popularity' && sortReverse ? 'rotate-180' : ''}`} />
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
                className={`px-4 py-2 flex items-center gap-2 text-sm font-medium transition-all border-l ${
                  sortBy === 'alphabetical'
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
                title={sortBy === 'alphabetical' && sortReverse ? "Sort Z to A" : "Sort A to Z"}
              >
                <ArrowDownAZ className={`w-4 h-4 transition-transform ${sortBy === 'alphabetical' && sortReverse ? 'rotate-180' : ''}`} />
                {sortBy === 'alphabetical' && sortReverse ? 'Z→A' : 'A→Z'}
              </button>
              <button
                onClick={() => {
                  setSortBy('random');
                  setSortReverse(false);
                }}
                className={`px-4 py-2 flex items-center gap-2 text-sm font-medium transition-all border-l ${
                  sortBy === 'random'
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
                title="Shuffle randomly"
              >
                <Dices className={`w-4 h-4 ${sortBy === 'random' ? 'animate-pulse' : ''}`} />
                Shuffle
              </button>
            </div>
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
              {shouldUseVirtualization ? (
                // Virtual scrolling for large lists (ultra-fast performance)
                <div
                  ref={parentRef}
                  style={{
                    height: '600px',
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
                          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 h-full">
                            {rowNames.map((name) => (
                              <NameCard
                                key={name.name}
                                name={name}
                                onClick={setSelectedName}
                                onFavoriteToggle={() => {
                                  setFavoritesCount(favoritesService.getFavoritesCount());
                                  setDislikesCount(favoritesService.getDislikesCount());
                                  forceUpdate({});
                                }}
                                onDislikeToggle={() => {
                                  setFavoritesCount(favoritesService.getFavoritesCount());
                                  setDislikesCount(favoritesService.getDislikesCount());
                                  forceUpdate({});
                                }}
                              />
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                // Standard grid with pagination for smaller lists
                <>
                  <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                    {currentNames.map((name) => (
                      <NameCard
                        key={name.name}
                        name={name}
                        onClick={setSelectedName}
                        onFavoriteToggle={() => {
                          setFavoritesCount(favoritesService.getFavoritesCount());
                          setDislikesCount(favoritesService.getDislikesCount());
                          forceUpdate({});
                        }}
                        onDislikeToggle={() => {
                          setFavoritesCount(favoritesService.getFavoritesCount());
                          setDislikesCount(favoritesService.getDislikesCount());
                          forceUpdate({});
                        }}
                      />
                    ))}
                  </div>

                  {/* Pagination for smaller lists */}
                  {totalPages > 1 && (
                    <div className="mt-16">
                      <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={handlePageChange}
                        itemsPerPage={itemsPerPage}
                        totalItems={filteredNames.length}
                      />
                    </div>
                  )}
                </>
              )}

              {/* Performance indicator */}
              {shouldUseVirtualization && (
                <div className="mt-4 text-center text-sm text-gray-500">
                  ⚡ Virtual scrolling active - ultra-fast performance for {filteredNames.length.toLocaleString()} names
                </div>
              )}
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

export default NameListPage;