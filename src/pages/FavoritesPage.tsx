import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, Home, Trash2, Baby } from 'lucide-react';
import nameService, { NameEntry } from '../services/nameService';
import favoritesService from '../services/favoritesService';
import NameCard from '../components/NameCard';
import NameDetailModal from '../components/NameDetailModal';
import { useToast } from '../contexts/ToastContext';
import { useAuth } from '../contexts/AuthContext';

const FavoritesPage: React.FC = () => {
  const [favoriteNames, setFavoriteNames] = useState<NameEntry[]>([]);
  const [pinnedNames, setPinnedNames] = useState<NameEntry[]>([]);
  const [unpinnedNames, setUnpinnedNames] = useState<NameEntry[]>([]);
  const [selectedName, setSelectedName] = useState<NameEntry | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const [loading, setLoading] = useState(true);
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
    favoritesService.incrementLikeCount(nameName);
    loadFavorites(); // Refresh to show updated count
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
      {/* Elegant Sticky Header */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-lg border-b border-purple-100/50 shadow-lg shadow-purple-100/20 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4 sm:py-5">
            {/* Left Section - Baby Logo & Back to Home */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => navigate('/')}
                className="hover:opacity-80 transition-opacity"
                title="Go to home"
              >
                <Baby className="h-6 w-6 sm:h-7 sm:w-7 text-purple-500" />
              </button>
              <button
                onClick={() => navigate('/')}
                className="group flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-purple-600 transition-all duration-300 rounded-lg hover:bg-purple-50"
              >
                <Home className="w-5 h-5 transition-transform group-hover:-translate-x-0.5" />
                <span className="hidden sm:inline font-medium">Home</span>
              </button>
            </div>

            {/* Center Section - Title with Heart Counter */}
            <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-3">
              {favoriteNames.length > 0 && (
                <div className="relative flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-full border-2 border-red-500 bg-white shadow-md">
                  <div className="flex flex-col items-center justify-center">
                    <span className="text-xs sm:text-sm font-bold text-red-500 leading-none">
                      {favoriteNames.length > 99 ? '99+' : favoriteNames.length}
                    </span>
                    <Heart className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-red-500 fill-current mt-0.5" />
                  </div>
                </div>
              )}
              <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-red-500 bg-clip-text text-transparent">
                Favorites
              </h1>
            </div>

            {/* Right Section - Clear All */}
            <div className="w-24 sm:w-auto flex justify-end">
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

          {/* Subtitle with count - only show on non-mobile */}
          {!loading && favoriteNames.length > 0 && (
            <div className="hidden sm:block pb-3 -mt-1">
              <p className="text-center text-sm text-gray-500">
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
        </div>
      </header>

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
                    <NameCard
                      key={`pinned-${name.name}`}
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
                    <NameCard
                      key={`unpinned-${name.name}`}
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