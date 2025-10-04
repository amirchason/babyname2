import React, { useState, useEffect, useCallback } from 'react';
import { Search, Baby, Star, TrendingUp, Sparkles, Globe, Users, ArrowDownAZ, Dices, Filter, Trophy, Heart, Menu, X, LogIn, LogOut, Cloud, CloudOff, RefreshCw, Target, ChevronDown, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import nameService, { NameEntry } from '../services/nameService';
import favoritesService from '../services/favoritesService';
import enrichmentService from '../services/enrichmentService';
import unisexService from '../services/unisexService';
import NameCard from '../components/NameCard';
import NameDetailModal from '../components/NameDetailModal';
import SwipingQuestionnaire from '../components/SwipingQuestionnaire';
import { Component as AnimatedBackground } from '../components/ui/open-ai-codex-animated-background';

const HomePage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [names, setNames] = useState<NameEntry[]>([]);
  const [filteredNames, setFilteredNames] = useState<NameEntry[]>([]);
  const [selectedName, setSelectedName] = useState<NameEntry | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const [activeFilter, setActiveFilter] = useState<'all' | 'male' | 'female' | 'unisex'>('all');
  const [sortBy, setSortBy] = useState<'popularity' | 'alphabetical' | 'random'>('popularity');
  const [sortReverse, setSortReverse] = useState(false);
  const [loading, setLoading] = useState(true);
  const [totalNames, setTotalNames] = useState(0);
  const [genderCounts, setGenderCounts] = useState({ total: 0, male: 0, female: 0, unisex: 0 });
  const [currentFilteredCount, setCurrentFilteredCount] = useState(0);
  const [showFilterMessage, setShowFilterMessage] = useState(false);
  const [showFavorites, setShowFavorites] = useState(false);
  const [favoritesCount, setFavoritesCount] = useState(0);
  const [dislikesCount, setDislikesCount] = useState(0);
  const [, forceUpdate] = useState({});
  const [menuOpen, setMenuOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(30); // 30 names per page
  const [showQuestionnaire, setShowQuestionnaire] = useState(false);
  const [heartBeat, setHeartBeat] = useState(false);

  // Origin filter states
  const [selectedOrigins, setSelectedOrigins] = useState<Set<string>>(new Set());
  const [showOriginAccordion, setShowOriginAccordion] = useState(false);
  const [allOrigins, setAllOrigins] = useState<{origin: string; count: number}[]>([]);
  const navigate = useNavigate();
  const { user, isAuthenticated, login, logout, isSyncing, syncError, manualSync, clearCache } = useAuth();

  useEffect(() => {
    // Load initial names
    const loadNames = () => {
      try {
        console.log('HomePage: Starting to load names...');
        setLoading(true);

        // Start with enough names to immediately show pagination
        const popularNames = nameService.getPopularNames(1000); // Show first 1000 names immediately
        console.log(`HomePage: Got ${popularNames.length} popular names`);

        // Apply filters immediately to avoid flash of unfiltered content
        const initialFiltered = popularNames.filter(name =>
          !favoritesService.isDisliked(name.name) &&
          !favoritesService.isFavorite(name.name)
        );

        setNames(popularNames);
        setFilteredNames(initialFiltered);
        setTotalNames(nameService.getTotalNames());
        console.log('HomePage: Names set, stopping loading spinner...');
        setLoading(false);

        // Initialize enrichment service with popular names for processing (non-blocking) - DISABLED FOR NOW
        /* if (popularNames.length > 0) {
        enrichmentService.initialize(popularNames);

        // Set up callback to update names when they are enriched
        enrichmentService.setDatabaseUpdateCallback((updatedNames) => {
          // Update the names array with enriched data
          setNames(prevNames => {
            return prevNames.map(name => {
              const enrichedData = updatedNames.find(n => n.name === name.name);
              if (enrichedData) {
                return {
                  ...name,
                  meaning: enrichedData.meaning,
                  origin: enrichedData.origin,
                  enriched: enrichedData.enriched,
                  culturalContext: enrichedData.culturalContext
                };
              }
              return name;
            });
          });

          // Also update filtered names
          setFilteredNames(prevNames => {
            return prevNames.map(name => {
              const enrichedData = updatedNames.find(n => n.name === name.name);
              if (enrichedData) {
                return {
                  ...name,
                  meaning: enrichedData.meaning,
                  origin: enrichedData.origin,
                  enriched: enrichedData.enriched,
                  culturalContext: enrichedData.culturalContext
                };
              }
              return name;
            });
          });
        });
      } */

        // Load full database in background for complete pagination (non-blocking)
        setTimeout(() => {
          console.log('HomePage: Starting background database load...');
          nameService.loadFullDatabase().then(() => {
            const allNames = nameService.getAllNames(250000);
            console.log(`HomePage: Loaded ${allNames.length} names in background`);

            // Apply filters immediately to avoid flash of unfiltered content
            const backgroundFiltered = allNames.filter(name =>
              !favoritesService.isDisliked(name.name) &&
              !favoritesService.isFavorite(name.name)
            );

            setNames(allNames);
            setFilteredNames(backgroundFiltered);
            setTotalNames(nameService.getTotalNames());

            // Get gender counts
            const counts = nameService.getGenderCounts();
            setGenderCounts(counts);
            setCurrentFilteredCount(counts.total);

            // Initialize unisex service in background
            unisexService.startProcessing().then(() => {
              console.log('HomePage: Unisex processing started in background');
              // Update gender counts after processing
              const updatedCounts = nameService.getGenderCounts();
              setGenderCounts(updatedCounts);
            });
          }).catch(err => {
            console.error('HomePage: Error loading full database:', err);
          });
        }, 100);
      } catch (error) {
        console.error('HomePage: Error in loadNames:', error);
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
    // Also update when cloud data changes
    window.addEventListener('cloudDataUpdate', updateCounts);

    // Listen for favorite additions to trigger heart animation
    const handleFavoriteAdded = () => {
      setHeartBeat(true);
      setTimeout(() => setHeartBeat(false), 600);
      updateCounts();
    };
    window.addEventListener('favoriteAdded', handleFavoriteAdded);

    return () => {
      window.removeEventListener('storage', updateCounts);
      window.removeEventListener('cloudDataUpdate', updateCounts);
      window.removeEventListener('favoriteAdded', handleFavoriteAdded);
    };
  }, []);

  // Calculate available origins when names are loaded
  useEffect(() => {
    if (names.length > 0) {
      const originCounts = new Map<string, number>();

      names.forEach(name => {
        const origin = name.origin || 'Unknown';
        originCounts.set(origin, (originCounts.get(origin) || 0) + 1);
      });

      const originsArray = Array.from(originCounts.entries())
        .map(([origin, count]) => ({ origin, count }))
        .sort((a, b) => b.count - a.count);

      setAllOrigins(originsArray);
    }
  }, [names]);

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

  const applySorting = useCallback((namesToSort: NameEntry[], preserveSearchOrder: boolean = false): NameEntry[] => {
    let sorted = [...namesToSort];

    // If searching, preserve the order from search function (already sorted alphabetically)
    if (preserveSearchOrder) {
      return sorted;
    }

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
      // Handle search and filter
      let results = names;

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
        results = await nameService.searchNames(searchTerm);
        // Also filter out both liked and disliked names from search results
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

      // Apply origin filter
      if (selectedOrigins.size > 0) {
        results = results.filter(name => {
          if (!name.origin) return false;
          const origins = Array.isArray(name.origin) ? name.origin : [name.origin];
          return origins.some(origin => selectedOrigins.has(origin.trim()));
        });
      }

      // Apply sorting - preserve search order when searching
      results = applySorting(results, !!searchTerm);

      setFilteredNames(results);
      setFavoritesCount(favoritesService.getFavoritesCount());

      // Update current filtered count
      setCurrentFilteredCount(results.length);
    };

    updateNames();
  }, [searchTerm, activeFilter, names, sortBy, sortReverse, applySorting, showFavorites, favoritesCount, dislikesCount, selectedOrigins]);

  // Reset page when search term changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  // Extract origins from loaded names
  useEffect(() => {
    if (names.length === 0) return;

    const originCounts = new Map<string, number>();

    names.forEach(name => {
      if (name.origin) {
        const origins = Array.isArray(name.origin) ? name.origin : [name.origin];
        origins.forEach(origin => {
          if (origin && origin.trim()) {
            const cleanOrigin = origin.trim();
            originCounts.set(cleanOrigin, (originCounts.get(cleanOrigin) || 0) + 1);
          }
        });
      }
    });

    const sortedOrigins = Array.from(originCounts.entries())
      .map(([origin, count]) => ({ origin, count }))
      .sort((a, b) => b.count - a.count);

    setAllOrigins(sortedOrigins);
  }, [names]);

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 overflow-x-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000" />
        <div className="absolute top-40 left-1/2 w-80 h-80 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000" />
      </div>

      {/* Header - Minimalist */}
      <header className="bg-white/90 backdrop-blur-sm fixed top-0 left-0 right-0 z-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-8">
              {/* Logo - Minimal */}
              <button
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
                title="Scroll to top"
              >
                <Baby className="h-6 w-6 sm:h-7 sm:w-7 text-purple-500" />
                <h1 className="text-lg font-light tracking-wide text-gray-900">
                  babynames
                </h1>
              </button>

              {/* Favorites Counter - Enhanced */}
              <button
                onClick={() => navigate('/favorites')}
                className={`flex items-center gap-2 text-sm transition-all ${
                  favoritesCount > 0
                    ? 'text-pink-500 hover:text-pink-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
                title="View favorites"
              >
                <Heart
                  className={`transition-all ${
                    heartBeat ? 'animate-heartbeat' : ''
                  } ${
                    favoritesCount > 0 ? 'fill-pink-500' : ''
                  }`}
                  style={{ width: '1.15rem', height: '1.15rem' }} // 15% bigger than w-4 h-4 (16px -> 18.4px)
                />
                <span className={favoritesCount > 0 ? 'font-medium' : ''}>{favoritesCount}</span>
              </button>
            </div>

            {/* Search and Navigation Container */}
            <div className="flex items-center space-x-4">
              {/* Search Icon - Minimalist */}
              <button
                onClick={() => {
                  setSearchOpen(!searchOpen);
                  if (searchOpen) {
                    setSearchTerm('');
                  }
                }}
                className="p-2 text-gray-600 hover:text-gray-900 transition-colors"
                title={searchOpen ? "Close search" : "Search names"}
              >
                {searchOpen ? (
                  <X className="w-4 h-4" />
                ) : (
                  <Search className="w-4 h-4" />
                )}
              </button>

              {/* Desktop Navigation - Minimal */}
              <nav className="hidden md:flex items-center space-x-6">
              <button
                onClick={() => navigate('/dislikes')}
                className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
                Dislikes
              </button>
              <button className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
                Origins
              </button>

              {/* Login/Profile - Minimal */}
              {isAuthenticated && user ? (
                <div className="flex items-center gap-4">
                  {user.picture ? (
                    <img
                      src={user.picture}
                      alt={user.name}
                      className="w-8 h-8 rounded-full"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 text-sm">
                      {user.name?.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <button
                    onClick={logout}
                    className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <button
                  onClick={login}
                  className="text-sm text-gray-900 hover:text-gray-600 transition-colors"
                >
                  Sign in
                </button>
              )}
              </nav>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden p-2 text-gray-700 hover:text-purple-600"
            >
              {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Mobile Menu */}
          {menuOpen && (
            <div className="md:hidden mt-4 pt-4 border-t border-gray-200">
              <div className="flex flex-col space-y-3">
                <button
                  onClick={() => {
                    navigate('/favorites');
                    setMenuOpen(false);
                  }}
                  className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-purple-50 rounded-lg transition-colors"
                >
                  <Heart className="w-4 h-4" />
                  Favorites {favoritesCount > 0 && `(${favoritesCount})`}
                </button>
                <button
                  onClick={() => {
                    navigate('/dislikes');
                    setMenuOpen(false);
                  }}
                  className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-purple-50 rounded-lg transition-colors"
                >
                  <X className="w-4 h-4" />
                  Dislikes {dislikesCount > 0 && `(${dislikesCount})`}
                </button>
                <button className="text-left px-4 py-2 text-gray-700 hover:bg-purple-50 rounded-lg transition-colors">
                  By Origin
                </button>
                <button className="text-left px-4 py-2 text-gray-700 hover:bg-purple-50 rounded-lg transition-colors">
                  AI Assistant
                </button>

                {isAuthenticated && user ? (
                  <div className="flex items-center justify-between px-4 py-2 border-t pt-4">
                    <div className="flex items-center gap-2">
                      {user.picture ? (
                        <img
                          src={user.picture}
                          alt={user.name}
                          className="w-8 h-8 rounded-full"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-bold text-sm">
                          {user.name?.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <span className="text-sm font-medium text-gray-700">{user.name}</span>
                    </div>
                    <button
                      onClick={() => {
                        logout();
                        setMenuOpen(false);
                      }}
                      className="text-red-600 text-sm font-medium hover:text-red-700"
                    >
                      Logout
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      login();
                      setMenuOpen(false);
                    }}
                    className="mx-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                  >
                    Sign in with Google
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Full-width Search Bar - Below Header */}
      <AnimatePresence>
        {searchOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed top-[57px] left-0 right-0 z-40 bg-white border-b border-gray-200 overflow-hidden"
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
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
                  placeholder="Search for a name..."
                  className="w-full pl-12 pr-4 py-3 text-base border border-gray-200 rounded-lg
                           bg-gray-50 focus:bg-white
                           focus:outline-none focus:border-gray-400 font-light
                           placeholder:text-gray-400 transition-all duration-200"
                  autoFocus
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2
                             text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
              {searchTerm && (
                <p className="mt-2 text-sm text-gray-500">
                  Found {filteredNames.length} names matching "{searchTerm}"
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero Section with Animated Background - Adjusted padding when search is open */}
      <section className={`relative ${searchOpen ? 'pt-48' : 'pt-32'} pb-16 px-4 min-h-[75vh] overflow-hidden transition-all duration-200`}>
        {/* Animated Background Layer */}
        <div className="absolute inset-0 z-0">
          <AnimatedBackground />
        </div>

        {/* Floating Names Overlay */}
        <div className="absolute inset-0 z-[1] pointer-events-none">
          {['Emma', 'Noah', 'Olivia', 'Liam', 'Sophia', 'Ethan', 'Isabella', 'Mason', 'Mia', 'Lucas'].map((name, i) => (
            <motion.div
              key={name}
              initial={{ opacity: 0 }}
              animate={{
                opacity: [0.2, 0.4, 0.2],
                x: [0, 100, 0],
                y: [0, -50, 0]
              }}
              transition={{
                duration: 10 + i * 2,
                repeat: Infinity,
                delay: i * 0.5,
                ease: "easeInOut"
              }}
              className={`absolute text-purple-400/30 font-light`}
              style={{
                left: `${10 + i * 15}%`,
                top: `${20 + (i % 3) * 25}%`,
                fontSize: `${1.5 + (i % 2) * 0.5}rem`
              }}
            >
              {name}
            </motion.div>
          ))}
        </div>

        {/* Subtle Gradient Overlay */}
        <div className="absolute inset-0 z-[2] bg-gradient-to-b from-white/60 to-white/80"></div>

        {/* Hero Content - Minimalist */}
        <div className="relative z-10 max-w-4xl mx-auto text-center pt-12">
          {/* Main Headline - Simplified */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-5xl md:text-7xl font-light mb-6 tracking-tight"
          >
            <span className="text-gray-900">Find the</span>
            <br />
            <span className="font-medium bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              perfect name
            </span>
          </motion.h1>

          {/* Subheadline - Minimal */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="text-lg text-gray-600 mb-12 font-light"
          >
            {currentFilteredCount.toLocaleString()} curated names with meaning
          </motion.p>

          {/* Filter Buttons - Minimal */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="flex justify-center gap-6 mb-8 text-sm"
          >
            <button
              onClick={() => handleFilterClick('all')}
              className={`transition-all duration-200 ${
                activeFilter === 'all'
                  ? 'text-gray-900 font-medium border-b-2 border-purple-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              All
            </button>
            <button
              onClick={() => handleFilterClick('male')}
              className={`transition-all duration-200 ${
                activeFilter === 'male'
                  ? 'text-gray-900 font-medium border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Boys
            </button>
            <button
              onClick={() => handleFilterClick('female')}
              className={`transition-all duration-200 ${
                activeFilter === 'female'
                  ? 'text-gray-900 font-medium border-b-2 border-pink-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Girls
            </button>
            <button
              onClick={() => handleFilterClick('unisex')}
              className={`transition-all duration-200 ${
                activeFilter === 'unisex'
                  ? 'text-gray-900 font-medium border-b-2 border-violet-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Unisex
            </button>
          </motion.div>

          {/* Origin Filters - Beautiful Modern Design */}
          {allOrigins.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.35 }}
              className="w-full max-w-4xl mx-auto mt-8"
            >
              {/* Origin Filter Title */}
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-gray-700">Filter by Origin</h3>
                {selectedOrigins.size > 0 && (
                  <button
                    onClick={handleClearOrigins}
                    className="text-xs text-purple-600 hover:text-purple-700 font-medium"
                  >
                    Clear All ({selectedOrigins.size})
                  </button>
                )}
              </div>

              {/* Top 6 Origins - Visible Pills */}
              <div className="flex flex-wrap gap-2 justify-center">
                {allOrigins.slice(0, 6).map(({ origin, count }) => {
                  const isSelected = selectedOrigins.has(origin);
                  const gradientColors = {
                    'Hebrew': 'from-purple-500 to-purple-600',
                    'Spanish': 'from-red-500 to-pink-600',
                    'Latin': 'from-amber-500 to-yellow-600',
                    'Germanic': 'from-green-500 to-emerald-600',
                    'Greek': 'from-blue-500 to-indigo-600',
                    'English': 'from-rose-500 to-pink-600',
                  };
                  const gradient = gradientColors[origin as keyof typeof gradientColors] || 'from-gray-500 to-gray-600';

                  return (
                    <button
                      key={origin}
                      onClick={() => handleOriginToggle(origin)}
                      className={`
                        relative px-4 py-2 rounded-full text-sm font-medium
                        transition-all duration-200 transform hover:scale-105
                        ${isSelected
                          ? `bg-gradient-to-r ${gradient} text-white shadow-lg`
                          : 'bg-white border border-gray-200 text-gray-700 hover:border-gray-300'
                        }
                      `}
                    >
                      <span className="flex items-center gap-2">
                        {isSelected && <Check className="w-3 h-3" />}
                        {origin}
                        <span className={`text-xs ${isSelected ? 'text-white/80' : 'text-gray-500'}`}>
                          ({count})
                        </span>
                      </span>
                    </button>
                  );
                })}

                {/* Show More Button for Accordion */}
                {allOrigins.length > 6 && (
                  <button
                    onClick={() => setShowOriginAccordion(!showOriginAccordion)}
                    className="px-4 py-2 rounded-full text-sm font-medium
                             bg-white border border-gray-200 text-gray-700
                             hover:border-gray-300 transition-all duration-200
                             flex items-center gap-2"
                  >
                    {showOriginAccordion ? 'Show Less' : `More Origins (${allOrigins.length - 6})`}
                    <ChevronDown
                      className={`w-4 h-4 transition-transform duration-200
                                 ${showOriginAccordion ? 'rotate-180' : ''}`}
                    />
                  </button>
                )}
              </div>

              {/* Accordion for Remaining Origins */}
              <AnimatePresence>
                {showOriginAccordion && allOrigins.length > 6 && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="mt-4 overflow-hidden"
                  >
                    <div className="flex flex-wrap gap-2 justify-center p-4 bg-gray-50 rounded-lg">
                      {allOrigins.slice(6).map(({ origin, count }) => {
                        const isSelected = selectedOrigins.has(origin);
                        return (
                          <button
                            key={origin}
                            onClick={() => handleOriginToggle(origin)}
                            className={`
                              px-3 py-1.5 rounded-full text-sm
                              transition-all duration-200
                              ${isSelected
                                ? 'bg-purple-100 text-purple-700 border border-purple-300'
                                : 'bg-white border border-gray-200 text-gray-600 hover:border-gray-300'
                              }
                            `}
                          >
                            <span className="flex items-center gap-1.5">
                              {isSelected && <Check className="w-3 h-3" />}
                              {origin}
                              <span className="text-xs text-gray-500">({count})</span>
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}

          {/* Action Buttons - Full Width */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-3 w-full max-w-xl mx-auto"
          >
            <button
              className="w-full py-4 rounded-full text-sm font-light
                       bg-gray-900 text-white hover:bg-gray-800
                       transition-all duration-200"
            >
              Browse Names
            </button>
            <button
              onClick={() => navigate('/swipe')}
              className="w-full py-4 rounded-full text-sm font-light
                       bg-white text-gray-900 border border-gray-200
                       hover:border-gray-400 transition-all duration-200"
            >
              Swipe Mode
            </button>
          </motion.div>

          {/* Sorting and Filter Controls */}
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mt-8">
            {/* Sort Options */}
            <div className="flex items-center gap-2">
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
                  className={`px-3 sm:px-4 py-2 flex items-center gap-1 sm:gap-2 text-sm font-medium transition-all ${
                    sortBy === 'popularity'
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                  title={sortBy === 'popularity' && sortReverse ? "Least popular first" : "Most popular first"}
                >
                  <Trophy className={`w-4 h-4 transition-transform ${sortBy === 'popularity' && sortReverse ? 'rotate-180' : ''}`} />
                  <span className="hidden sm:inline">Popular{sortBy === 'popularity' && sortReverse ? ' ↓' : ''}</span>
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
                  className={`px-3 sm:px-4 py-2 flex items-center gap-1 sm:gap-2 text-sm font-medium transition-all border-l ${
                    sortBy === 'alphabetical'
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                  title={sortBy === 'alphabetical' && sortReverse ? "Sort Z to A" : "Sort A to Z"}
                >
                  <ArrowDownAZ className={`w-4 h-4 transition-transform ${sortBy === 'alphabetical' && sortReverse ? 'rotate-180' : ''}`} />
                  <span className="hidden sm:inline">{sortBy === 'alphabetical' && sortReverse ? 'Z→A' : 'A→Z'}</span>
                </button>
                <button
                  onClick={() => {
                    setSortBy('random');
                    setSortReverse(false);
                  }}
                  className={`px-3 sm:px-4 py-2 flex items-center gap-1 sm:gap-2 text-sm font-medium transition-all border-l ${
                    sortBy === 'random'
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                  title="Shuffle randomly"
                >
                  <Dices className={`w-4 h-4 ${sortBy === 'random' ? 'animate-pulse' : ''}`} />
                  <span className="hidden sm:inline">Shuffle</span>
                </button>
              </div>
            </div>

            {/* Filter Button (Placeholder) */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowFilterMessage(true);
                  setTimeout(() => setShowFilterMessage(false), 2000);
                }}
                className="px-4 py-2 bg-white border-2 border-purple-300 text-gray-700 rounded-lg
                         hover:border-purple-400 hover:shadow-md transition-all flex items-center gap-2 font-medium"
              >
                <Filter className="w-4 h-4" />
                <span>Filters</span>
              </button>
              {showFilterMessage && (
                <div className="absolute top-full mt-2 left-1/2 transform -translate-x-1/2
                              px-4 py-2 bg-purple-600 text-white rounded-lg text-sm whitespace-nowrap
                              shadow-lg animate-bounce">
                  Filters coming soon! 🚀
                </div>
              )}
            </div>
          </div>
        </div>
      </section>


      {/* Names Grid */}
      <section className="py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-3xl font-bold text-gray-800">
              {showFavorites ? 'Your Favorite Names' : searchTerm ? 'Search Results' : 'Popular Names'}
            </h3>
            <span className="text-gray-500">
              {filteredNames.length > 0 ? `${currentFilteredCount.toLocaleString()} names found` : ''}
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
            // Grid Mode - Original layout
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                <AnimatePresence mode="popLayout">
                  {currentNames.map((name, index) => {
                    return (
                      <motion.div
                        key={name.name}
                        layout
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{
                          duration: 0.08,  // Super snappy
                          layout: { type: "spring", stiffness: 800, damping: 40 }  // Very stiff spring for instant response
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
                            // Update counts
                            setFavoritesCount(favoritesService.getFavoritesCount());
                            setDislikesCount(favoritesService.getDislikesCount());

                            // Force re-render to remove from list after animation
                            setTimeout(() => {
                              forceUpdate({});
                            }, 120); // Match the animation duration
                          }}
                          onDislikeToggle={() => {
                            // Update counts
                            setFavoritesCount(favoritesService.getFavoritesCount());
                            setDislikesCount(favoritesService.getDislikesCount());

                            // Force re-render to remove from list after animation
                            setTimeout(() => {
                              forceUpdate({});
                            }, 120); // Match the animation duration
                          }}
                        />
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>

              {/* Amazing Beautiful Pagination - Always Show */}
              <div className="mt-16 mb-8">
                <div className="flex flex-col items-center space-y-6">
                  {/* Page Statistics */}
                  <div className="text-center">
                    <p className="text-lg text-gray-700 mb-2">
                      Showing <span className="font-bold text-purple-600">{((currentPage - 1) * itemsPerPage) + 1}</span> to{' '}
                      <span className="font-bold text-purple-600">{Math.min(currentPage * itemsPerPage, currentFilteredCount)}</span> of{' '}
                      <span className="font-bold text-purple-600">{currentFilteredCount.toLocaleString()}</span> beautiful names
                    </p>
                    {totalPages > 1 && (
                      <p className="text-sm text-gray-500">
                        Page {currentPage} of {totalPages}
                      </p>
                    )}
                  </div>

                  {/* Beautiful Pagination Controls */}
                  {totalPages > 1 && (
                    <div className="flex items-center space-x-2">
                      {/* Previous Button */}
                      <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className={`
                          flex items-center justify-center px-4 py-3 rounded-lg font-medium transition-all duration-200
                          ${currentPage === 1
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : 'bg-white text-gray-700 hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 hover:text-purple-600 shadow-md hover:shadow-lg border border-gray-200 hover:border-purple-200'
                          }
                        `}
                      >
                        ← Previous
                      </button>

                      {/* Page Numbers */}
                      <div className="flex items-center space-x-1">
                        {(() => {
                          const pages: number[] = [];
                          const maxVisible = Math.min(totalPages, 7);

                          for (let i = 0; i < maxVisible; i++) {
                            if (totalPages <= 7) {
                              pages.push(i + 1);
                            } else if (currentPage <= 4) {
                              pages.push(i + 1);
                            } else if (currentPage >= totalPages - 3) {
                              pages.push(totalPages - 6 + i);
                            } else {
                              pages.push(currentPage - 3 + i);
                            }
                          }

                          return pages.map((pageNum) => {
                            if (pageNum < 1 || pageNum > totalPages) return null;

                            return (
                              <button
                                key={pageNum}
                                onClick={() => handlePageChange(pageNum)}
                                className={`
                                  flex items-center justify-center w-12 h-12 rounded-lg font-bold transition-all duration-200 text-sm
                                  ${currentPage === pageNum
                                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg transform scale-110'
                                    : 'bg-white text-gray-700 hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 hover:text-purple-600 shadow-md hover:shadow-lg border border-gray-200 hover:border-purple-200 hover:scale-105'
                                  }
                                `}
                              >
                                {pageNum}
                              </button>
                            );
                          });
                        })()}
                      </div>

                      {/* Next Button */}
                      <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className={`
                          flex items-center justify-center px-4 py-3 rounded-lg font-medium transition-all duration-200
                          ${currentPage === totalPages
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : 'bg-white text-gray-700 hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 hover:text-purple-600 shadow-md hover:shadow-lg border border-gray-200 hover:border-purple-200'
                          }
                        `}
                      >
                        Next →
                      </button>
                    </div>
                  )}

                  {/* Quick Jump for Large Datasets */}
                  {totalPages > 10 && (
                    <div className="flex items-center space-x-3">
                      <span className="text-sm text-gray-600">Jump to page:</span>
                      <input
                        type="number"
                        min="1"
                        max={totalPages}
                        value={currentPage}
                        onChange={(e) => {
                          const page = parseInt(e.target.value);
                          if (page >= 1 && page <= totalPages) {
                            handlePageChange(page);
                          }
                        }}
                        className="w-20 px-3 py-2 text-center border border-gray-300 rounded-lg focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-200"
                      />
                      <span className="text-sm text-gray-600">of {totalPages}</span>
                    </div>
                  )}

                  {/* Stylish Divider */}
                  <div className="w-full max-w-md h-px bg-gradient-to-r from-transparent via-purple-200 to-transparent"></div>
                </div>
              </div>
            </>
          )}
        </div>
      </section>

      {/* Name Detail Modal */}
      <NameDetailModal
        name={selectedName}
        names={filteredNames}
        currentIndex={selectedIndex}
        onClose={() => setSelectedName(null)}
        onNavigate={(newIndex) => {
          if (newIndex >= 0 && newIndex < filteredNames.length) {
            setSelectedName(filteredNames[newIndex]);
            setSelectedIndex(newIndex);
          }
        }}
        onFavoriteToggle={() => {
          setFavoritesCount(favoritesService.getFavoritesCount());
          setDislikesCount(favoritesService.getDislikesCount());
        }}
        onDislikeToggle={() => {
          setFavoritesCount(favoritesService.getFavoritesCount());
          setDislikesCount(favoritesService.getDislikesCount());
        }}
      />

      {/* Swiping Questionnaire Modal */}
      {showQuestionnaire && (
        <SwipingQuestionnaire
          onComplete={handleQuestionnaireComplete}
          onClose={() => setShowQuestionnaire(false)}
        />
      )}

      {/* Trust Section - Minimalistic */}
      <section className="py-6 px-4 bg-white/90">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-4">
            <h2 className="text-lg font-light text-gray-700">Trusted by 2 Million Parents</h2>
          </div>

          <div className="flex justify-center items-center">
            <div className="flex flex-row items-center gap-8 md:gap-12">
              {/* Expert Verified */}
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full border border-blue-200 flex items-center justify-center">
                  <Target className="w-4 h-4 text-blue-400" strokeWidth={1.5} />
                </div>
                <span className="text-sm text-gray-600 font-light whitespace-nowrap">Expert Verified</span>
              </div>

              {/* AI Insights */}
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full border border-pink-200 flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-pink-400" strokeWidth={1.5} />
                </div>
                <span className="text-sm text-gray-600 font-light whitespace-nowrap">AI Insights</span>
              </div>

              {/* Emotional Match */}
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full border border-blue-200 flex items-center justify-center">
                  <Heart className="w-4 h-4 text-blue-400" strokeWidth={1.5} />
                </div>
                <span className="text-sm text-gray-600 font-light whitespace-nowrap">Emotional Match</span>
              </div>

              {/* Divider */}
              <div className="h-6 w-px bg-gray-200"></div>

              {/* Rating */}
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 text-pink-400" strokeWidth={1.5} />
                <span className="text-sm font-light">
                  <span className="text-gray-900">4.9/5</span>
                  <span className="text-gray-500 ml-1">· 2,847 reviews</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

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

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6">
            Your Baby's Name Journey Starts Here
          </h2>
          <p className="text-xl mb-8 opacity-95">
            Join thousands of parents discovering the perfect name every day.
            <br />Free AI assistance. No sign-up required. Start now.
          </p>
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="px-8 py-4 bg-white text-purple-600 rounded-full text-lg font-bold hover:shadow-2xl transition-all transform hover:scale-105"
          >
            Find My Baby's Name Now →
          </button>

          <div className="mt-8 flex justify-center gap-8 text-sm opacity-90">
            <span>✓ 164,374 Names</span>
            <span>✓ Instant Results</span>
            <span>✓ 100% Free</span>
          </div>
        </div>
      </section>

      {/* Stats Section - Minimalistic */}
      <section className="py-8 px-4 bg-white/90 backdrop-blur-sm border-t border-gray-100">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <h3 className="text-2xl font-light text-gray-900">{genderCounts.total.toLocaleString()}</h3>
              <p className="text-sm text-gray-600 font-light mt-1">Unique Names</p>
            </div>
            <div>
              <h3 className="text-2xl font-light text-gray-900">105</h3>
              <p className="text-sm text-gray-600 font-light mt-1">Countries</p>
            </div>
            <div>
              <h3 className="text-2xl font-light text-gray-900">100%</h3>
              <p className="text-sm text-gray-600 font-light mt-1">Gender Data</p>
            </div>
            <div>
              <h3 className="text-2xl font-light text-gray-900">2025</h3>
              <p className="text-sm text-gray-600 font-light mt-1">Latest Data</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Baby className="h-8 w-8" />
            <h3 className="text-2xl font-bold">BabyNames 2025</h3>
          </div>
          <p className="mb-4 text-lg">Your Trusted Partner in Finding the Perfect Baby Name</p>
          <div className="flex justify-center gap-8 mb-6 text-sm">
            <a href="#" className="hover:text-purple-400">Privacy Policy</a>
            <a href="#" className="hover:text-purple-400">Terms of Service</a>
            <a href="#" className="hover:text-purple-400">Contact Us</a>
            <a href="#" className="hover:text-purple-400">Blog</a>
          </div>
          <p className="text-xs opacity-60">
            &copy; 2025 BabyNames. Helping parents worldwide find perfect names since 2020.
            <br />Data sourced from global naming registries and cultural databases.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;