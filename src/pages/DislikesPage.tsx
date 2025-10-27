import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Home, Trash2, Baby, Grid3x3, List } from 'lucide-react';
import nameService, { NameEntry } from '../services/nameService';
import favoritesService from '../services/favoritesService';
import NameCard from '../components/NameCard';
import NameCardCompact from '../components/NameCardCompact';
import NameDetailModal from '../components/NameDetailModal';
import { useToast } from '../contexts/ToastContext';
import { useAuth } from '../contexts/AuthContext';
import AppHeader from '../components/AppHeader';
import SEOHead from '../components/SEO/SEOHead';

const DislikesPage: React.FC = () => {
  const [dislikedNames, setDislikedNames] = useState<NameEntry[]>([]);
  const [selectedName, setSelectedName] = useState<NameEntry | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'card' | 'compact'>('compact');
  const navigate = useNavigate();
  const toast = useToast();
  const { isAuthenticated } = useAuth();

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
      try {
        console.log('[DislikesPage] Starting to clear dislikes...');

        // Clear the dislikes and wait for cloud sync to complete
        await favoritesService.clearDislikes();
        console.log('[DislikesPage] Dislikes cleared successfully');

        // Wait a moment for the service to finish clearing
        await new Promise(resolve => setTimeout(resolve, 200));

        // Verify that dislikes are actually empty
        const remainingDislikes = favoritesService.getDislikes();
        console.log('[DislikesPage] After clear, remaining dislikes:', remainingDislikes.length);

        if (remainingDislikes.length > 0) {
          console.error('[DislikesPage] Failed to clear - still has', remainingDislikes.length, 'dislikes');
          // Force clear by calling the service method again
          await favoritesService.clearDislikes();

          // Wait and check again
          await new Promise(resolve => setTimeout(resolve, 200));
          const stillRemaining = favoritesService.getDislikes();
          console.log('[DislikesPage] After second clear, remaining:', stillRemaining.length);
        }

        // Clear the UI state - dislikes should be empty now
        setDislikedNames([]);

        // Show success message
        if (isAuthenticated) {
          toast.success('All dislikes cleared from device and cloud!');
        } else {
          toast.success('All dislikes cleared from device!');
        }
      } catch (error) {
        console.error('[DislikesPage] Error clearing dislikes:', error);
        // Still clear UI even if cloud sync fails
        setDislikedNames([]);

        if (isAuthenticated) {
          toast.warning('Dislikes cleared locally, but cloud sync failed. They will sync next time you log in.');
        } else {
          toast.success('All dislikes cleared!');
        }
      }
    }
  };

  return (
    <>
      <SEOHead
        title="Disliked Names | SoulSeed"
        description="View and manage your disliked baby names. Change your mind? Easily restore names back to your browsing list."
        canonical="https://soulseedbaby.com/dislikes"
      />
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
        {/* AppHeader with consistent counters */}
        <AppHeader title="SoulSeed" showBackButton={true} />

      {/* Page-specific actions bar - Sticky below header */}
      <div className="sticky z-40 bg-white/95 backdrop-blur-lg border-b border-purple-100/50" style={{ top: 'var(--app-header-height, 73px)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
          <div className="flex items-center justify-between gap-3">
            {/* Left: Title with inline count */}
            <div className="flex-1 min-w-0">
              <div className="flex items-baseline gap-2 flex-wrap">
                <h2 className="text-base font-semibold text-gray-900">Dislikes</h2>
                {!loading && (
                  <span className="text-xs text-gray-500">
                    {dislikedNames.length === 0
                      ? "None yet"
                      : `${dislikedNames.length} hidden`}
                  </span>
                )}
              </div>
            </div>

            {/* Right: View Mode Toggle + Clear All */}
            {dislikedNames.length > 0 && (
              <div className="flex items-center gap-2">
                {/* View Mode Toggle */}
                <div className="flex items-center gap-0.5 bg-gray-100 rounded-lg p-0.5">
                  <button
                    onClick={() => setViewMode('card')}
                    className={`p-1.5 rounded transition-all ${
                      viewMode === 'card'
                        ? 'bg-white text-purple-600 shadow-sm'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                    title="Card view"
                  >
                    <Grid3x3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('compact')}
                    className={`p-1.5 rounded transition-all ${
                      viewMode === 'compact'
                        ? 'bg-white text-purple-600 shadow-sm'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                    title="Compact view"
                  >
                    <List className="w-4 h-4" />
                  </button>
                </div>

                {/* Clear All */}
                <button
                  onClick={clearAllDislikes}
                  className="group flex items-center gap-1.5 px-3 py-1.5 text-red-600 hover:text-white bg-red-50 hover:bg-gradient-to-r hover:from-red-500 hover:to-pink-500 rounded-lg transition-all duration-300 shadow-sm hover:shadow-md"
                  title="Clear all dislikes"
                >
                  <Trash2 className="w-4 h-4 transition-transform group-hover:scale-110" />
                  <span className="text-xs font-medium hidden sm:inline">Clear</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content - Extra top padding to clear sticky bar */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8 pt-20">

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
        ) : viewMode === 'card' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {dislikedNames.map((name, index) => (
              <NameCard
                key={`${name.name}-${dislikedNames.length}`}
                name={name}
                onClick={(name) => {
                  setSelectedName(name);
                  setSelectedIndex(index);
                }}
                onFavoriteToggle={handleRefresh}
                onDislikeToggle={handleRefresh}
              />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl overflow-hidden border border-gray-200">
            {dislikedNames.map((name, index) => (
              <NameCardCompact
                key={`${name.name}-compact-${dislikedNames.length}`}
                name={name}
                onClick={(name) => {
                  setSelectedName(name);
                  setSelectedIndex(index);
                }}
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
    </>
  );
};

export default DislikesPage;