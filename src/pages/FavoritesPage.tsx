import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, Home, Trash2 } from 'lucide-react';
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

    const favorites = allNames.filter(name => favoritesList.includes(name.name));

    // Separate pinned and unpinned
    const pinned = favorites.filter(name => pinnedList.includes(name.name));
    const unpinned = favorites.filter(name => !pinnedList.includes(name.name));

    setFavoriteNames(favorites);
    setPinnedNames(pinned);
    setUnpinnedNames(unpinned);
    setLoading(false);
  };

  const handleRefresh = () => {
    loadFavorites();
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
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 overflow-x-hidden">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/')}
                className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-purple-600 transition-colors"
              >
                <Home className="w-5 h-5" />
                <span className="font-medium">Home</span>
              </button>
              <div className="flex items-center gap-2">
                <Heart className="w-6 h-6 text-red-500 fill-current" />
                <h1 className="text-2xl font-bold text-gray-800">My Favorite Names</h1>
              </div>
            </div>
            {favoriteNames.length > 0 && (
              <button
                onClick={clearAllFavorites}
                className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                Clear All
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <p className="text-gray-600">
            {favoriteNames.length === 0
              ? "You haven't added any names to your favorites yet."
              : `You have ${favoriteNames.length} favorite name${favoriteNames.length === 1 ? '' : 's'}`}
          </p>
        </div>

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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-4 bg-yellow-50/30 rounded-xl">
                  {pinnedNames.map((name) => (
                    <NameCard
                      key={`pinned-${name.name}`}
                      name={name}
                      onClick={setSelectedName}
                      onFavoriteToggle={handleRefresh}
                      onDislikeToggle={handleRefresh}
                      isPinned={true}
                      onPin={handleRefresh}
                      showPinOption={true}
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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {unpinnedNames.map((name) => (
                    <NameCard
                      key={`unpinned-${name.name}`}
                      name={name}
                      onClick={setSelectedName}
                      onFavoriteToggle={handleRefresh}
                      onDislikeToggle={handleRefresh}
                      isPinned={false}
                      onPin={handleRefresh}
                      showPinOption={true}
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
          onClose={() => setSelectedName(null)}
        />
      )}
    </div>
  );
};

export default FavoritesPage;