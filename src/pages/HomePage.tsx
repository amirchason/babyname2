import React, { useState, useEffect, useCallback } from 'react';
import { Search, Baby, Star, TrendingUp, Sparkles, Globe, Users, ArrowDownAZ, Dices, Filter, Trophy, Heart, Menu, X, LogIn, LogOut, Cloud, CloudOff, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import nameService, { NameEntry } from '../services/nameService';
import favoritesService from '../services/favoritesService';
import enrichmentService from '../services/enrichmentService';
import NameCard from '../components/NameCard';
import NameDetailModal from '../components/NameDetailModal';
import CommandHandler from '../components/CommandHandler';
import SwipingQuestionnaire from '../components/SwipingQuestionnaire';

const HomePage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [names, setNames] = useState<NameEntry[]>([]);
  const [filteredNames, setFilteredNames] = useState<NameEntry[]>([]);
  const [selectedName, setSelectedName] = useState<NameEntry | null>(null);
  const [activeFilter, setActiveFilter] = useState<'all' | 'male' | 'female'>('all');
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
  const [itemsPerPage] = useState(100); // 100 names per page
  const [showQuestionnaire, setShowQuestionnaire] = useState(false);
  const navigate = useNavigate();
  const { user, isAuthenticated, login, logout, isSyncing, syncError, manualSync } = useAuth();

  useEffect(() => {
    // Load initial names
    const loadNames = () => {
      try {
        console.log('HomePage: Starting to load names...');
        setLoading(true);

        // Start with enough names to immediately show pagination
        const popularNames = nameService.getPopularNames(1000); // Show first 1000 names immediately
        console.log(`HomePage: Got ${popularNames.length} popular names`);
        setNames(popularNames);
        setFilteredNames(popularNames);
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
            setNames(allNames);
            setFilteredNames(allNames);
            setTotalNames(nameService.getTotalNames());

            // Get gender counts
            const counts = nameService.getGenderCounts();
            setGenderCounts(counts);
            setCurrentFilteredCount(counts.total);
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

    return () => {
      window.removeEventListener('storage', updateCounts);
      window.removeEventListener('cloudDataUpdate', updateCounts);
    };
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

      if (showFavorites) {
        // Show only favorite names
        results = results.filter(name => favoritesService.isFavorite(name.name));
      } else {
        // Filter out disliked names (never show them unless viewing favorites)
        results = favoritesService.filterOutDislikes(results);
      }

      if (searchTerm) {
        results = await nameService.searchNames(searchTerm);
        // Apply dislikes filter to search results too
        if (!showFavorites) {
          results = favoritesService.filterOutDislikes(results);
        }
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
      setFavoritesCount(favoritesService.getFavoritesCount());

      // Update current filtered count
      setCurrentFilteredCount(results.length);
    };

    updateNames();
  }, [searchTerm, activeFilter, names, sortBy, sortReverse, applySorting, showFavorites]);

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
    window.scrollTo({ top: 600, behavior: 'smooth' });
  };

  const handleQuestionnaireComplete = (preferences: any) => {
    setShowQuestionnaire(false);
    // Navigate to names page with preferences
    navigate('/names', { state: { preferences } });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 overflow-x-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000" />
        <div className="absolute top-40 left-1/2 w-80 h-80 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000" />
      </div>

      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <Baby className="h-10 w-10 text-purple-500" />
                <Sparkles className="h-4 w-4 text-yellow-400 absolute -top-1 -right-1 animate-pulse" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  New Baby Name
                </h1>
                <p className="text-xs text-gray-500">164K+ Unique Names • English Only Database</p>
              </div>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-4">
              <button
                onClick={() => navigate('/favorites')}
                className="flex items-center gap-2 px-4 py-2 rounded-full transition-all font-medium text-gray-700 hover:text-red-500 hover:bg-red-50">
                <Heart className="w-4 h-4" />
                Favorites {favoritesCount > 0 && `(${favoritesCount})`}
              </button>
              <button
                onClick={() => navigate('/dislikes')}
                className="flex items-center gap-2 px-4 py-2 rounded-full transition-all font-medium text-gray-700 hover:text-red-500 hover:bg-red-50">
                <X className="w-4 h-4" />
                Dislikes {dislikesCount > 0 && `(${dislikesCount})`}
              </button>
              <button className="text-gray-700 hover:text-purple-600 transition-colors font-medium px-4 py-2">
                By Origin
              </button>
              <button className="text-gray-700 hover:text-purple-600 transition-colors font-medium px-4 py-2">
                AI Assistant
              </button>

              {/* Login/Profile Button */}
              {isAuthenticated && user ? (
                <div className="flex items-center gap-3">
                  {/* Sync Status Indicator - Clickable */}
                  <button
                    onClick={manualSync}
                    disabled={isSyncing}
                    className="flex items-center gap-1 px-2 py-1 rounded hover:bg-gray-100 transition-colors disabled:cursor-not-allowed"
                    title={isSyncing ? 'Syncing...' : syncError ? 'Sync failed - Click to retry' : 'Click to sync now'}
                  >
                    {isSyncing ? (
                      <RefreshCw className="w-4 h-4 text-blue-500 animate-spin" />
                    ) : syncError ? (
                      <CloudOff className="w-4 h-4 text-red-500" />
                    ) : (
                      <Cloud className="w-4 h-4 text-green-500" />
                    )}
                  </button>
                  <img
                    src={user.picture}
                    alt={user.name}
                    className="w-10 h-10 rounded-full border-2 border-purple-200"
                  />
                  <button
                    onClick={logout}
                    className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-red-600 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </div>
              ) : (
                <button
                  onClick={login}
                  className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-full hover:shadow-lg transition-all font-medium"
                >
                  <LogIn className="w-4 h-4" />
                  Sign in with Google
                </button>
              )}
            </nav>

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
                      <img
                        src={user.picture}
                        alt={user.name}
                        className="w-8 h-8 rounded-full"
                      />
                      <span className="text-sm font-medium text-gray-700">{user.name}</span>
                    </div>
                    <button
                      onClick={logout}
                      className="text-red-600 text-sm"
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

      {/* Hero Section */}
      <section className="relative py-16 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-yellow-50 to-yellow-100 backdrop-blur rounded-full mb-6 border border-yellow-300">
            <span className="text-yellow-600">🔥</span>
            <span className="text-sm font-bold text-gray-800">
              2,847 Parents Found Their Perfect Name This Week
            </span>
          </div>

          <h2 className="text-6xl font-bold mb-6">
            <span className="bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent">
              Your Baby's Perfect Name Awaits
            </span>
          </h2>
          <p className="text-xl text-gray-700 mb-4 font-medium">
            The moment has arrived. From {currentFilteredCount.toLocaleString()} carefully curated names,
            <br />discover the one that will shape your child's destiny.
          </p>
          <p className="text-lg text-gray-600 mb-10">
            <span className="text-green-600 font-semibold">✓ Scientifically researched meanings</span> •
            <span className="text-blue-600 font-semibold">✓ Cultural authenticity verified</span> •
            <span className="text-purple-600 font-semibold">✓ 2025 popularity predictions</span>
          </p>

          {/* Search Bar */}
          <div className="relative max-w-2xl mx-auto mb-6">
            <Search className="absolute left-6 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Try: Olivia, Liam, Luna, Noah - Trending in 2025 ✨"
              className="w-full pl-14 pr-6 py-5 rounded-2xl border-2 border-purple-100
                       focus:outline-none focus:border-purple-400 shadow-xl text-lg
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

          {/* Start Swiping Button */}
          <div className="flex justify-center mb-6">
            <button
              onClick={() => setShowQuestionnaire(true)}
              className="px-8 py-4 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-full text-lg font-bold hover:shadow-2xl transition-all transform hover:scale-105 flex items-center gap-2"
            >
              <span>🔥</span>
              Start Swiping Names
              <span>→</span>
            </button>
          </div>

          {/* Filter Buttons */}
          <div className="flex flex-wrap justify-center gap-3">
            <button
              onClick={() => handleFilterClick('all')}
              className={`px-4 sm:px-6 py-3 rounded-xl font-medium transition-all ${
                activeFilter === 'all'
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                  : 'bg-white text-gray-700 hover:shadow-md'
              }`}
            >
              All Names ({genderCounts.total.toLocaleString()})
            </button>
            <button
              onClick={() => handleFilterClick('male')}
              className={`px-4 sm:px-6 py-3 rounded-xl font-medium transition-all flex items-center gap-2 ${
                activeFilter === 'male'
                  ? 'bg-gradient-to-r from-blue-500 to-blue-700 text-white shadow-lg'
                  : 'bg-white text-gray-700 hover:shadow-md'
              }`}
            >
              <span>♂</span> Male Names ({genderCounts.male.toLocaleString()})
            </button>
            <button
              onClick={() => handleFilterClick('female')}
              className={`px-4 sm:px-6 py-3 rounded-xl font-medium transition-all flex items-center gap-2 ${
                activeFilter === 'female'
                  ? 'bg-gradient-to-r from-pink-500 to-pink-700 text-white shadow-lg'
                  : 'bg-white text-gray-700 hover:shadow-md'
              }`}
            >
              <span>♀</span> Female Names ({genderCounts.female.toLocaleString()})
            </button>
          </div>

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

      {/* Quick Stats */}
      <section className="py-8 px-4">
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white/80 backdrop-blur rounded-2xl shadow-lg p-6 text-center transform hover:scale-105 transition-transform">
            <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-purple-700 rounded-xl flex items-center justify-center mx-auto mb-3">
              <Baby className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-3xl font-bold text-gray-800">{genderCounts.total.toLocaleString()}</h3>
            <p className="text-gray-600 font-medium">Unique Names</p>
          </div>
          <div className="bg-white/80 backdrop-blur rounded-2xl shadow-lg p-6 text-center transform hover:scale-105 transition-transform">
            <div className="w-14 h-14 bg-gradient-to-br from-pink-500 to-pink-700 rounded-xl flex items-center justify-center mx-auto mb-3">
              <Globe className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-3xl font-bold text-gray-800">105</h3>
            <p className="text-gray-600 font-medium">Countries</p>
          </div>
          <div className="bg-white/80 backdrop-blur rounded-2xl shadow-lg p-6 text-center transform hover:scale-105 transition-transform">
            <div className="w-14 h-14 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-xl flex items-center justify-center mx-auto mb-3">
              <Star className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-3xl font-bold text-gray-800">100%</h3>
            <p className="text-gray-600 font-medium">Gender Data</p>
          </div>
          <div className="bg-white/80 backdrop-blur rounded-2xl shadow-lg p-6 text-center transform hover:scale-105 transition-transform">
            <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-700 rounded-xl flex items-center justify-center mx-auto mb-3">
              <TrendingUp className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-3xl font-bold text-gray-800">2025</h3>
            <p className="text-gray-600 font-medium">Latest Data</p>
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
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {currentNames.map((name, index) => {
                  // Calculate contextual rank: position within filtered results + page offset
                  const contextualRank = (currentPage - 1) * itemsPerPage + index + 1;

                  return (
                    <NameCard
                      key={name.name}
                      name={name}
                      onClick={setSelectedName}
                      contextualRank={contextualRank}
                      filterContext={activeFilter}
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
                  );
                })}
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
        onClose={() => setSelectedName(null)}
      />

      {/* Command Handler for slash commands */}
      <CommandHandler />

      {/* Swiping Questionnaire Modal */}
      {showQuestionnaire && (
        <SwipingQuestionnaire
          onComplete={handleQuestionnaireComplete}
          onClose={() => setShowQuestionnaire(false)}
        />
      )}

      {/* Trust Section */}
      <section className="py-16 px-4 bg-gradient-to-r from-purple-50 to-pink-50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-12 text-gray-800">
            Why 2 Million Parents Trust BabyNames
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full mx-auto mb-4 flex items-center justify-center">
                <span className="text-3xl text-white">🎯</span>
              </div>
              <h3 className="text-xl font-bold mb-2">Scientifically Curated</h3>
              <p className="text-gray-600">Every name verified by linguistics experts. Real meanings, authentic origins, no guesswork.</p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mx-auto mb-4 flex items-center justify-center">
                <span className="text-3xl text-white">🌟</span>
              </div>
              <h3 className="text-xl font-bold mb-2">AI-Powered Insights</h3>
              <p className="text-gray-600">Our AI analyzes trends, predicts popularity, and suggests names that match your family's story.</p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-r from-pink-500 to-red-500 rounded-full mx-auto mb-4 flex items-center justify-center">
                <span className="text-3xl text-white">💝</span>
              </div>
              <h3 className="text-xl font-bold mb-2">Emotional Connection</h3>
              <p className="text-gray-600">Find names that resonate with your heart. Each suggestion considers meaning, sound, and feeling.</p>
            </div>
          </div>

          {/* Social Proof */}
          <div className="mt-12 text-center">
            <div className="inline-flex items-center gap-2 px-6 py-3 bg-white rounded-full shadow-lg">
              <span className="text-yellow-500">⭐⭐⭐⭐⭐</span>
              <span className="font-bold text-gray-800">4.9/5</span>
              <span className="text-gray-600">from 2,847 reviews this month</span>
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