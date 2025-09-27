import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, Home, Trash2 } from 'lucide-react';
import nameService, { NameEntry } from '../services/nameService';
import favoritesService from '../services/favoritesService';
import NameCard from '../components/NameCard';
import NameDetailModal from '../components/NameDetailModal';

const FavoritesPage: React.FC = () => {
  const [favoriteNames, setFavoriteNames] = useState<NameEntry[]>([]);
  const [selectedName, setSelectedName] = useState<NameEntry | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = async () => {
    setLoading(true);
    // Load all names
    await nameService.loadFullDatabase();
    const allNames = await nameService.getPopularNames(10000);

    // Get favorites
    const favoritesList = favoritesService.getFavorites();
    const favorites = allNames.filter(name => favoritesList.includes(name.name));

    setFavoriteNames(favorites);
    setLoading(false);
  };

  const handleRefresh = () => {
    loadFavorites();
  };

  const clearAllFavorites = () => {
    if (window.confirm('Are you sure you want to clear all favorites?')) {
      favoritesService.clearFavorites();
      setFavoriteNames([]);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {favoriteNames.map((name) => (
              <NameCard
                key={name.name}
                name={name}
                onClick={setSelectedName}
                onFavoriteToggle={handleRefresh}
                onDislikeToggle={handleRefresh}
              />
            ))}
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