import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Home, Trash2 } from 'lucide-react';
import nameService, { NameEntry } from '../services/nameService';
import favoritesService from '../services/favoritesService';
import NameCard from '../components/NameCard';
import NameDetailModal from '../components/NameDetailModal';

const DislikesPage: React.FC = () => {
  const [dislikedNames, setDislikedNames] = useState<NameEntry[]>([]);
  const [selectedName, setSelectedName] = useState<NameEntry | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadDislikes();
  }, []);

  const loadDislikes = async () => {
    setLoading(true);
    // Load all names
    await nameService.loadFullDatabase();
    const allNames = await nameService.getPopularNames(10000);

    // Get dislikes
    const dislikesList = favoritesService.getDislikes();
    const dislikes = allNames.filter(name => dislikesList.includes(name.name));

    setDislikedNames(dislikes);
    setLoading(false);
  };

  const handleRefresh = () => {
    loadDislikes();
  };

  const clearAllDislikes = async () => {
    if (window.confirm('Are you sure you want to clear all disliked names? This will delete your dislikes from both device and cloud.')) {
      // Clear the dislikes
      await favoritesService.clearDislikes();
      console.log('[DislikesPage] Dislikes cleared and saved');

      // Immediately clear the UI state
      setDislikedNames([]);

      // Force a reload after a brief delay to ensure everything is synced
      setTimeout(() => {
        loadDislikes();
      }, 100);
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
                <X className="w-6 h-6 text-red-500" />
                <h1 className="text-2xl font-bold text-gray-800">Disliked Names</h1>
              </div>
            </div>
            {dislikedNames.length > 0 && (
              <button
                onClick={clearAllDislikes}
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
            {dislikedNames.length === 0
              ? "You haven't disliked any names yet."
              : `You have ${dislikedNames.length} disliked name${dislikedNames.length === 1 ? '' : 's'}`}
          </p>
          <p className="text-sm text-gray-500 mt-1">
            These names won't appear in your search results or recommendations.
          </p>
        </div>

        {loading ? (
          <div className="text-center py-20">
            <div className="inline-flex items-center gap-3 text-gray-500">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
              <span className="text-lg">Loading disliked names...</span>
            </div>
          </div>
        ) : dislikedNames.length === 0 ? (
          <div className="text-center py-20">
            <X className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-xl text-gray-500 mb-4">No disliked names yet</p>
            <p className="text-gray-400 mb-6">Names you dislike will appear here and be hidden from your searches.</p>
            <button
              onClick={() => navigate('/')}
              className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              Browse Names
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {dislikedNames.map((name) => (
              <NameCard
                key={`${name.name}-${dislikedNames.length}`}
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

export default DislikesPage;