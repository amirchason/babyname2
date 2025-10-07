import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, Home, Trash2, Baby } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import nameService, { NameEntry } from '../services/nameService';
import favoritesService from '../services/favoritesService';
import NameCard from '../components/NameCard';
import NameDetailModal from '../components/NameDetailModal';
import { useToast } from '../contexts/ToastContext';
import { useAuth } from '../contexts/AuthContext';
import AppHeader from '../components/AppHeader';

const FavoritesPage: React.FC = () => {
  const [favoriteNames, setFavoriteNames] = useState<NameEntry[]>([]);
  const [pinnedNames, setPinnedNames] = useState<NameEntry[]>([]);
  const [unpinnedNames, setUnpinnedNames] = useState<NameEntry[]>([]);
  const [selectedName, setSelectedName] = useState<NameEntry | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [animatingName, setAnimatingName] = useState<string | null>(null);
  const navigate = useNavigate();
  const toast = useToast();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = async () => {
    setLoading(true);
    // Load all names
    await nameService.loadFullDatabase();
    const allNames = await nameService.getPopularNames(10000);

    // Get favorites and pinned favorites
    const favoritesList = favoritesService.getFavorites();
    const pinnedList = favoritesService.getPinnedFavorites();

    // Map favorites to name entries
    const favorites = favoritesList
      .map(favName => allNames.find(n => n.name === favName))
      .filter(Boolean) as NameEntry[];

    // Separate pinned and unpinned
    const pinned = favorites.filter(name => pinnedList.includes(name.name));
    const unpinned = favorites.filter(name => !pinnedList.includes(name.name));

    // Sort pinned by like count (most likes first)
    const sortedPinned = [...pinned].sort((a, b) => {
      const likesA = favoritesService.getLikeCount(a.name) || 1;
      const likesB = favoritesService.getLikeCount(b.name) || 1;
      return likesB - likesA;
    });

    // Sort unpinned by like count (most likes first)
    const sortedUnpinned = [...unpinned].sort((a, b) => {
      const likesA = favoritesService.getLikeCount(a.name) || 1;
      const likesB = favoritesService.getLikeCount(b.name) || 1;
      return likesB - likesA;
    });

    setFavoriteNames([...sortedPinned, ...sortedUnpinned]);
    setPinnedNames(sortedPinned);
    setUnpinnedNames(sortedUnpinned);
    setLoading(false);
  };

  const handleRefresh = () => {
    loadFavorites();
  };

  const handleLikeIncrement = (nameName: string) => {
    // Get old sort order
    const oldOrder = favoriteNames.map(n => n.name);
    const oldIndex = oldOrder.indexOf(nameName);

    // Increment like count
    favoritesService.incrementLikeCount(nameName);

    // Get updated like counts and check if sort order would change
    const updatedPinned = [...pinnedNames].sort((a, b) => {
      const likesA = favoritesService.getLikeCount(a.name) || 1;
      const likesB = favoritesService.getLikeCount(b.name) || 1;
      return likesB - likesA;
    });

    const updatedUnpinned = [...unpinnedNames].sort((a, b) => {
      const likesA = favoritesService.getLikeCount(a.name) || 1;
      const likesB = favoritesService.getLikeCount(b.name) || 1;
      return likesB - likesA;
    });

    const newOrder = [...updatedPinned, ...updatedUnpinned].map(n => n.name);
    const newIndex = newOrder.indexOf(nameName);

    // Check if position changed (moved up)
    const orderChanged = oldOrder.some((name, index) => name !== newOrder[index]);
    const movedUp = newIndex < oldIndex;

    if (orderChanged && movedUp) {
      // Set animation state BEFORE updating the list
      setAnimatingName(nameName);

      // Update state immediately to show new positions
      setPinnedNames(updatedPinned);
      setUnpinnedNames(updatedUnpinned);
      setFavoriteNames([...updatedPinned, ...updatedUnpinned]);

      // Clear animation after it completes
      setTimeout(() => setAnimatingName(null), 600);
    } else if (orderChanged) {
      // Position changed but didn't move up (moved down or sideways)
      setPinnedNames(updatedPinned);
      setUnpinnedNames(updatedUnpinned);
      setFavoriteNames([...updatedPinned, ...updatedUnpinned]);
    } else {
      // Just update the state without reloading to avoid unnecessary animations
      setPinnedNames(updatedPinned);
      setUnpinnedNames(updatedUnpinned);
      setFavoriteNames([...updatedPinned, ...updatedUnpinned]);
    }
  };

  const clearAllFavorites = async () => {
    if (window.confirm('Are you sure you want to clear all favorites? This will delete your favorites from both device and cloud.')) {
      try {
        console.log('[FavoritesPage] Starting to clear favorites...');

        // Clear the favorites and wait for cloud sync to complete
        await favoritesService.clearFavorites();
        console.log('[FavoritesPage] Favorites cleared successfully');

        // Wait a moment for the service to finish clearing
        await new Promise(resolve => setTimeout(resolve, 200));

        // Verify that favorites are actually empty
        const remainingFavorites = favoritesService.getFavorites();
        console.log('[FavoritesPage] After clear, remaining favorites:', remainingFavorites.length);

        if (remainingFavorites.length > 0) {
          console.error('[FavoritesPage] Failed to clear - still has', remainingFavorites.length, 'favorites');
          // Force clear by calling the service method again
          await favoritesService.clearFavorites();

          // Wait and check again
          await new Promise(resolve => setTimeout(resolve, 200));
          const stillRemaining = favoritesService.getFavorites();
          console.log('[FavoritesPage] After second clear, remaining:', stillRemaining.length);
        }

        // Clear the UI state - favorites should be empty now
        setFavoriteNames([]);

        // Show success message
        if (isAuthenticated) {
          toast.success('All favorites cleared from device and cloud!');
        } else {
          toast.success('All favorites cleared from device!');
        }
      } catch (error) {
        console.error('[FavoritesPage] Error clearing favorites:', error);
        // Still clear UI even if cloud sync fails
        setFavoriteNames([]);

        if (isAuthenticated) {
          toast.warning('Favorites cleared locally, but cloud sync failed. They will sync next time you log in.');
        } else {
          toast.success('All favorites cleared!');
        }
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      {/* AppHeader with consistent counters */}
      <AppHeader title="Favorites" showBackButton={true} />

      {/* Page-specific actions bar */}
      <div className="sticky top-[73px] z-40 bg-white/95 backdrop-blur-lg border-b border-purple-100/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center justify-between">
            {/* Left: Subtitle with count */}
            {!loading && favoriteNames.length > 0 && (
              <div className="flex-1">
                <p className="text-sm text-gray-500">
                  {pinnedNames.length > 0 && (
                    <span className="inline-flex items-center gap-1 mr-3">
                      <svg className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" />
                      </svg>
                      <span className="font-medium text-yellow-700">{pinnedNames.length} pinned</span>
                    </span>
                  )}
                  <span>
                    {favoriteNames.length} favorite name{favoriteNames.length === 1 ? '' : 's'}
                  </span>
                </p>
              </div>
            )}

            {/* Right: Clear All */}
            {favoriteNames.length > 0 && (
              <button
                onClick={clearAllFavorites}
                className="group flex items-center gap-2 px-3 sm:px-4 py-2 text-red-600 hover:text-white bg-red-50 hover:bg-gradient-to-r hover:from-red-500 hover:to-pink-500 rounded-lg transition-all duration-300 shadow-sm hover:shadow-md"
              >
                <Trash2 className="w-4 h-4 transition-transform group-hover:scale-110" />
                <span className="hidden sm:inline font-medium">Clear All</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="text-center py-20">
            <div className="inline-flex items-center gap-3 text-gray-500">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
              <span className="text-lg">Loading favorites...</span>
            </div>
          </div>
        ) : favoriteNames.length === 0 ? (
          <div className="text-center py-20">
            <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-xl text-gray-500 mb-4">No favorite names yet</p>
            <button
              onClick={() => navigate('/')}
              className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              Browse Names
            </button>
          </div>
        ) : (
          <div>
            {/* Pinned Names Section */}
            {pinnedNames.length > 0 && (
              <div className="mb-8">
                <h2 className="text-lg font-semibold text-gray-700 mb-4 flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" />
                    </svg>
                    Pinned Favorites
                  </span>
                  <span className="text-sm text-gray-500 font-normal">
                    {pinnedNames.length}/20 pinned
                  </span>
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4 bg-yellow-50/30 rounded-xl">
                  {pinnedNames.map((name, index) => (
                    <motion.div
                      key={`pinned-${name.name}`}
                      layout
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={
                        animatingName === name.name
                          ? {
                              opacity: 1,
                              scale: [1, 1.1, 1],
                              y: [-30, 0],
                              boxShadow: [
                                "0 0 0 0 rgba(234, 179, 8, 0)",
                                "0 0 30px 10px rgba(234, 179, 8, 0.5)",
                                "0 0 0 0 rgba(234, 179, 8, 0)"
                              ]
                            }
                          : { opacity: 1, scale: 1, y: 0 }
                      }
                      exit={{ opacity: 0, scale: 0.8 }}
                      transition={{
                        layout: { duration: 0.3, ease: [0.4, 0, 0.2, 1] },
                        opacity: { duration: 0.2 },
                        scale: { duration: 0.2 },
                        y: { duration: 0.4, ease: [0.34, 1.56, 0.64, 1] },
                        boxShadow: { duration: 0.4 }
                      }}
                    >
                      <NameCard
                        name={name}
                        onClick={(name) => {
                          setSelectedName(name);
                          setSelectedIndex(index);
                        }}
                        onFavoriteToggle={() => handleLikeIncrement(name.name)}
                        onDislikeToggle={handleRefresh}
                        isPinned={true}
                        onPin={handleRefresh}
                        showPinOption={true}
                        likeCount={favoritesService.getLikeCount(name.name)}
                      />
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* Unpinned Names Section */}
            {unpinnedNames.length > 0 && (
              <div>
                {pinnedNames.length > 0 && (
                  <h2 className="text-lg font-semibold text-gray-700 mb-4">Other Favorites</h2>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {unpinnedNames.map((name, index) => (
                    <motion.div
                      key={`unpinned-${name.name}`}
                      layout
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={
                        animatingName === name.name
                          ? {
                              opacity: 1,
                              scale: [1, 1.1, 1],
                              y: [-30, 0],
                              boxShadow: [
                                "0 0 0 0 rgba(168, 85, 247, 0)",
                                "0 0 30px 10px rgba(168, 85, 247, 0.5)",
                                "0 0 0 0 rgba(168, 85, 247, 0)"
                              ]
                            }
                          : { opacity: 1, scale: 1, y: 0 }
                      }
                      exit={{ opacity: 0, scale: 0.8 }}
                      transition={{
                        layout: { duration: 0.3, ease: [0.4, 0, 0.2, 1] },
                        opacity: { duration: 0.2 },
                        scale: { duration: 0.2 },
                        y: { duration: 0.4, ease: [0.34, 1.56, 0.64, 1] },
                        boxShadow: { duration: 0.4 }
                      }}
                    >
                      <NameCard
                        name={name}
                        onClick={(name) => {
                          setSelectedName(name);
                          // Add offset for pinned names
                          setSelectedIndex(pinnedNames.length + index);
                        }}
                        onFavoriteToggle={() => handleLikeIncrement(name.name)}
                        onDislikeToggle={handleRefresh}
                        isPinned={false}
                        onPin={handleRefresh}
                        showPinOption={true}
                        likeCount={favoritesService.getLikeCount(name.name)}
                      />
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Name Detail Modal */}
      {selectedName && (
        <NameDetailModal
          name={selectedName}
          names={favoriteNames}
          currentIndex={selectedIndex}
          onClose={() => setSelectedName(null)}
          onNavigate={(newIndex) => {
            if (newIndex >= 0 && newIndex < favoriteNames.length) {
              setSelectedName(favoriteNames[newIndex]);
              setSelectedIndex(newIndex);
            }
          }}
          onFavoriteToggle={handleRefresh}
          onDislikeToggle={handleRefresh}
        />
      )}
    </div>
  );
};

export default FavoritesPage;