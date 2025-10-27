import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Heart, X, Sparkles, RotateCcw } from 'lucide-react';
import nameService, { NameEntry } from '../services/nameService';
import favoritesService from '../services/favoritesService';
import NameDetailModal from '../components/NameDetailModal';
import AppHeader from '../components/AppHeader';
import TinderSwipeCard from '../components/TinderSwipeCard';
import SEOHead from '../components/SEO/SEOHead';
import SwipeFilterBar, {
  SwipeFilters,
  ENGLISH_SPEAKING_ORIGINS,
  AFRICAN_ORIGINS,
  UNKNOWN_MODERN_ORIGINS,
  EAST_ASIAN_ORIGINS,
  SOUTHEAST_ASIAN_ORIGINS,
  SLAVIC_ORIGINS,
  SCANDINAVIAN_ORIGINS,
  MIDDLE_EASTERN_ORIGINS,
  OTHER_WORLD_ORIGINS
} from '../components/SwipeFilterBar';

// Old Card component removed - now using TinderSwipeCard

// Constants for performance optimization
const INITIAL_LOAD_SIZE = 500; // Load more initially to reduce loading frequency
const LOAD_MORE_THRESHOLD = 50; // Load when 50 cards remaining (was 10)
const LOAD_MORE_BATCH = 300; // Load 300 at once (was 100) to reduce load frequency
const MAX_CARDS_IN_MEMORY = 100; // Keep max 100 cards in memory
const MAX_UNDO_STACK = 20; // Limit undo history to 20 actions
const VISIBLE_CARDS_COUNT = 3; // Only render 3 cards at a time

const SwipeModePage: React.FC = () => {
  const navigate = useNavigate();
  const [cards, setCards] = useState<NameEntry[]>([]);
  const [allNames, setAllNames] = useState<NameEntry[]>([]); // Store all names for filtering
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [lastAction, setLastAction] = useState<{ name: string; action: 'like' | 'dislike' } | null>(null);
  const [undoStack, setUndoStack] = useState<{ name: string; action: 'like' | 'dislike' }[]>([]);
  const [selectedName, setSelectedName] = useState<NameEntry | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const [loadOffset, setLoadOffset] = useState(0); // Track where to load next batch from
  const [filters, setFilters] = useState<SwipeFilters>({
    gender: 'all',
    origins: ['English & Irish'], // Default to English & Irish names
    length: 'all',
    sortBy: 'popularity' // Default to popular names first
  });
  const [filteredNames, setFilteredNames] = useState<NameEntry[]>([]); // Stores filtered subset
  const [topCardDragX, setTopCardDragX] = useState(0); // Track top card drag position for reveal animation

  // Apply filters to names
  const applyFilters = useCallback((names: NameEntry[], filterConfig: SwipeFilters): NameEntry[] => {
    return names.filter(name => {
      // Gender filter
      if (filterConfig.gender !== 'all') {
        const genderData = typeof name.gender === 'object' ? name.gender : null;
        if (!genderData) return false;

        const maleRatio = genderData.Male || 0;
        const femaleRatio = genderData.Female || 0;
        const total = maleRatio + femaleRatio;

        if (total === 0) return false;

        const malePercent = (maleRatio / total) * 100;
        const femalePercent = (femaleRatio / total) * 100;

        if (filterConfig.gender === 'male' && malePercent <= 60) return false;
        if (filterConfig.gender === 'female' && femalePercent <= 60) return false;
        if (filterConfig.gender === 'unisex' && (malePercent < 35 || malePercent > 65)) return false;
      }

      // Origin filter
      if (filterConfig.origins.length > 0) {
        // Allow names with no origin if "Unknown & Modern" is selected
        if (!name.origin && !filterConfig.origins.includes('Unknown & Modern')) {
          return false;
        }

        // Expand all combined filters to their constituent origins
        let originsToMatch = [...filterConfig.origins];

        // Replace each combined filter with its expanded origin list
        if (filterConfig.origins.includes('English & Irish')) {
          originsToMatch = originsToMatch.filter(o => o !== 'English & Irish');
          originsToMatch.push(...ENGLISH_SPEAKING_ORIGINS);
        }
        if (filterConfig.origins.includes('African')) {
          originsToMatch = originsToMatch.filter(o => o !== 'African');
          originsToMatch.push(...AFRICAN_ORIGINS);
        }
        if (filterConfig.origins.includes('Unknown & Modern')) {
          originsToMatch = originsToMatch.filter(o => o !== 'Unknown & Modern');
          originsToMatch.push(...UNKNOWN_MODERN_ORIGINS);
        }
        if (filterConfig.origins.includes('East Asian')) {
          originsToMatch = originsToMatch.filter(o => o !== 'East Asian');
          originsToMatch.push(...EAST_ASIAN_ORIGINS);
        }
        if (filterConfig.origins.includes('Southeast Asian')) {
          originsToMatch = originsToMatch.filter(o => o !== 'Southeast Asian');
          originsToMatch.push(...SOUTHEAST_ASIAN_ORIGINS);
        }
        if (filterConfig.origins.includes('Slavic')) {
          originsToMatch = originsToMatch.filter(o => o !== 'Slavic');
          originsToMatch.push(...SLAVIC_ORIGINS);
        }
        if (filterConfig.origins.includes('Scandinavian')) {
          originsToMatch = originsToMatch.filter(o => o !== 'Scandinavian');
          originsToMatch.push(...SCANDINAVIAN_ORIGINS);
        }
        if (filterConfig.origins.includes('Middle East')) {
          originsToMatch = originsToMatch.filter(o => o !== 'Middle East');
          originsToMatch.push(...MIDDLE_EASTERN_ORIGINS);
        }
        if (filterConfig.origins.includes('Other World')) {
          originsToMatch = originsToMatch.filter(o => o !== 'Other World');
          originsToMatch.push(...OTHER_WORLD_ORIGINS);
        }

        // Check if name's origin matches any of the expanded filter origins
        // Support compound origins (e.g., "English,Modern", "Modern,English")
        const originString = typeof name.origin === 'string' ? name.origin : String(name.origin);
        const nameOrigins = originString.split(',').map(o => o.trim());

        // Match against expanded origins (case-insensitive)
        const hasMatch = originsToMatch.some(filterOrigin =>
          nameOrigins.some(nameOrigin =>
            nameOrigin.toLowerCase() === filterOrigin.toLowerCase()
          )
        );

        if (!hasMatch) return false;
      }

      // Length filter
      if (filterConfig.length !== 'all') {
        const nameLength = name.name.length;
        if (filterConfig.length === 'short' && nameLength > 4) return false;
        if (filterConfig.length === 'medium' && (nameLength < 5 || nameLength > 7)) return false;
        if (filterConfig.length === 'long' && nameLength < 8) return false;
      }

      return true;
    });
  }, []);

  // Apply sorting to names
  const applySorting = useCallback((names: NameEntry[], sortBy: SwipeFilters['sortBy']): NameEntry[] => {
    const sorted = [...names];

    switch (sortBy) {
      case 'popularity':
        // Sort by popularity rank (lower rank = more popular)
        return sorted.sort((a, b) => {
          const rankA = a.popularityRank || 999999;
          const rankB = b.popularityRank || 999999;
          return rankA - rankB;
        });

      case 'alphabetical':
        // Sort A-Z
        return sorted.sort((a, b) => a.name.localeCompare(b.name));

      case 'shuffle':
        // Fisher-Yates shuffle algorithm
        for (let i = sorted.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [sorted[i], sorted[j]] = [sorted[j], sorted[i]];
        }
        return sorted;

      case 'shortest':
        // Shortest names first
        return sorted.sort((a, b) => a.name.length - b.name.length);

      case 'longest':
        // Longest names first
        return sorted.sort((a, b) => b.name.length - a.name.length);

      case 'rare':
        // Rare gems: sort by highest rank (least popular), filter out very common names
        return sorted
          .filter(n => (n.popularityRank || 999999) > 500) // Skip top 500 popular names
          .sort((a, b) => {
            const rankA = a.popularityRank || 999999;
            const rankB = b.popularityRank || 999999;
            return rankB - rankA; // Reverse: higher rank first (less popular)
          });

      default:
        return sorted;
    }
  }, []);

  // Load ALL names from database on mount
  useEffect(() => {
    const loadAllNames = async () => {
      console.log('🔄 Loading full database (140k+ names)...');
      const allNamesFromDB = nameService.getAllNames(250000); // Load up to 250k names
      console.log(`✅ Loaded ${allNamesFromDB.length} names from database`);
      setAllNames(allNamesFromDB);
    };
    loadAllNames();
  }, []); // Only run once on mount

  // Apply filters whenever filters or allNames change
  useEffect(() => {
    if (allNames.length === 0) return; // Wait for names to load

    setLoading(true);
    console.log(`🔍 Applying filters... (${allNames.length} total names)`);

    // Apply filters to full database
    let filtered = applyFilters(allNames, filters);
    console.log(`✅ After filters: ${filtered.length} names`);

    // Filter out already liked and disliked names
    filtered = favoritesService.filterOutLikedAndDisliked(filtered);
    console.log(`✅ After removing liked/disliked: ${filtered.length} names`);

    // Apply sorting
    filtered = applySorting(filtered, filters.sortBy);
    console.log(`✅ After sorting (${filters.sortBy}): ${filtered.length} names`);

    // Store filtered result
    setFilteredNames(filtered);

    // Load initial batch into cards
    const initialBatch = filtered.slice(0, INITIAL_LOAD_SIZE);
    setCards(initialBatch);
    setLoadOffset(INITIAL_LOAD_SIZE);
    setCurrentIndex(0); // Reset to start
    setLoading(false);

    console.log(`✅ Ready to swipe through ${filtered.length} names!`);
  }, [allNames, filters, applyFilters, applySorting]);

  // Cleanup old cards from memory when we have too many
  const cleanupOldCards = useCallback(() => {
    // Only cleanup if we have way too many swiped cards
    if (currentIndex > MAX_CARDS_IN_MEMORY) {
      setCards(prev => {
        // Keep cards from currentIndex onwards (remove swiped cards)
        const cardsToKeep = prev.slice(currentIndex);
        return cardsToKeep;
      });

      // Reset index AFTER slicing (in next tick to ensure cards updated first)
      setTimeout(() => {
        setCurrentIndex(0);
      }, 0);
    }
  }, [currentIndex]);

  // Load more cards when running low (from filteredNames)
  const loadMoreCards = useCallback(() => {
    const remainingCards = cards.length - currentIndex;

    if (remainingCards <= LOAD_MORE_THRESHOLD && loadOffset < filteredNames.length) {
      // Load next batch from filtered names
      const newBatch = filteredNames.slice(loadOffset, loadOffset + LOAD_MORE_BATCH);

      if (newBatch.length > 0) {
        console.log(`📦 Loading ${newBatch.length} more cards (${loadOffset} to ${loadOffset + newBatch.length})`);
        setCards(prev => [...prev, ...newBatch]);
        setLoadOffset(prev => prev + newBatch.length);
      }
    }
  }, [cards.length, currentIndex, loadOffset, filteredNames]);

  const handleSwipe = useCallback((direction: 'left' | 'right') => {
    const currentCard = cards[currentIndex];
    if (!currentCard) return;

    const action: 'like' | 'dislike' = direction === 'right' ? 'like' : 'dislike';

    // Update services FIRST (before state updates)
    if (direction === 'right') {
      favoritesService.addFavorite(currentCard.name);
    } else {
      favoritesService.addDislike(currentCard.name);
    }

    // Batch all state updates together using react's automatic batching
    // This prevents multiple re-renders and glitches
    setUndoStack(prev => {
      const newStack = [...prev, { name: currentCard.name, action }];
      return newStack.slice(-MAX_UNDO_STACK);
    });
    setLastAction({ name: currentCard.name, action });
    setCurrentIndex(prev => prev + 1);

    // Dispatch event for header to update counts
    window.dispatchEvent(new Event('storage'));

    // Load more cards AFTER swipe animation completes (500ms delay)
    setTimeout(() => {
      loadMoreCards();
    }, 500);
  }, [cards, currentIndex, loadMoreCards]);

  const handleButtonClick = useCallback((action: 'like' | 'dislike') => {
    // Don't do anything if no cards left
    if (currentIndex >= cards.length) return;

    const currentCard = cards[currentIndex];

    // Trigger animation on the top card
    const topCardElement = document.querySelector('[data-card-index="0"]');
    if (topCardElement) {
      const motion = topCardElement as HTMLElement;
      // Apply animation directly
      motion.style.transition = 'all 0.3s ease-out';
      motion.style.transform = action === 'like'
        ? 'translateX(1000px) rotate(45deg)'
        : 'translateX(-1000px) rotate(-45deg)';
      motion.style.opacity = '0';
    }

    // Delay the actual action to let animation play
    setTimeout(() => {
      // Update services FIRST
      if (action === 'like') {
        favoritesService.addFavorite(currentCard.name);
      } else {
        favoritesService.addDislike(currentCard.name);
      }

      // Batch all state updates together
      setUndoStack(prev => {
        const newStack = [...prev, { name: currentCard.name, action }];
        return newStack.slice(-MAX_UNDO_STACK);
      });
      setLastAction({ name: currentCard.name, action });
      setCurrentIndex(prev => prev + 1);

      // Dispatch event for header to update counts
      window.dispatchEvent(new Event('storage'));

      // Load more cards AFTER animation (500ms)
      setTimeout(() => {
        loadMoreCards();
      }, 500);
    }, 300);
  }, [cards, currentIndex, loadMoreCards, cleanupOldCards]);

  const handleUndo = useCallback(() => {
    if (undoStack.length === 0 || currentIndex === 0) return;

    const lastItem = undoStack[undoStack.length - 1];

    // Reverse the last action
    if (lastItem.action === 'like') {
      favoritesService.removeFavorite(lastItem.name);
    } else {
      favoritesService.removeDislikes(lastItem.name);
    }

    // Dispatch event for header to update counts
    window.dispatchEvent(new Event('storage'));

    // Remove from undo stack
    setUndoStack(prev => prev.slice(0, -1));

    // Move back to previous card
    setCurrentIndex(prev => Math.max(0, prev - 1));
  }, [undoStack, currentIndex]);

  // Get visible cards (current + next 2) - memoized for performance
  const visibleCards = useMemo(() => {
    return cards.slice(currentIndex, currentIndex + VISIBLE_CARDS_COUNT).reverse();
  }, [cards, currentIndex]);

  // Stable key generation for cards
  const getCardKey = useCallback((card: NameEntry, index: number) => {
    return `${card.name}-${currentIndex + index}`;
  }, [currentIndex]);

  return (
    <>
      <SEOHead
        title="Swipe Baby Names | Tinder-Style Name Finder | SoulSeed"
        description="Find your perfect baby name with SoulSeed's unique Tinder-style swipe mode. Swipe right to like, left to pass. Fun, fast, and personalized baby name discovery."
        canonical="https://soulseedbaby.com/swipe"
      />

      <div className="fixed inset-0 bg-gradient-to-br from-purple-50 to-pink-50 overflow-hidden flex flex-col">
        <h1 className="sr-only">Swipe Baby Names - Tinder-Style Name Finder</h1>
        {/* AppHeader with consistent counters */}
      <div className="flex-none">
        <AppHeader title="SoulSeed" showBackButton={true} />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-0 px-3 sm:px-4">
        {/* Progress */}
        <div className="flex-none text-center py-2">
          <p className="text-xs sm:text-sm text-gray-600">
            {currentIndex + 1} / {filteredNames.length}
            {allNames.length > 0 && (
              <span className="text-gray-400 ml-2">
                ({filteredNames.length} of {allNames.length.toLocaleString()} total)
              </span>
            )}
          </p>
        </div>

        {/* Card Stack and Buttons Container */}
        <div className="flex-1 flex flex-col items-center justify-center min-h-0 pb-2">
          <div className="relative w-full max-w-xs sm:max-w-md h-full max-h-[65vh] sm:max-h-[580px]">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
              </div>
            ) : currentIndex < cards.length ? (
              <>
                {/* Stack of cards */}
                {visibleCards.map((card, index) => {
                  const isTop = index === visibleCards.length - 1;
                  const isSecond = index === visibleCards.length - 2; // The card right beneath the top
                  const stackIndex = visibleCards.length - 1 - index;

                  return (
                    <motion.div
                      key={getCardKey(card, stackIndex)}
                      className="absolute inset-0"
                      data-card-index={stackIndex}
                      initial={{ scale: 1 - stackIndex * 0.05, y: stackIndex * 10 }}
                      animate={{ scale: 1 - stackIndex * 0.05, y: stackIndex * 10 }}
                      transition={{ duration: 0 }}
                      style={{ zIndex: index + 1 }}
                    >
                      <TinderSwipeCard
                        name={card}
                        isTop={isTop}
                        isSecond={isSecond}
                        topCardDragX={isSecond ? topCardDragX : 0}
                        onSwipeLeft={() => handleSwipe('left')}
                        onSwipeRight={() => handleSwipe('right')}
                        onInfoClick={() => {
                          setSelectedName(card);
                          setSelectedIndex(currentIndex + stackIndex);
                        }}
                        onDragChange={isTop ? setTopCardDragX : undefined}
                        contextualRank={currentIndex + stackIndex + 1}
                      />
                    </motion.div>
                  );
                })}
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-full">
                <Sparkles className="w-16 h-16 text-purple-500 mb-4" />
                <h2 className="text-2xl font-bold text-gray-800 mb-4">All done!</h2>
                <p className="text-gray-600 mb-6">You've reviewed all available names</p>
                <button
                  onClick={() => navigate('/')}
                  className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full font-bold hover:shadow-lg transition-all"
                >
                  Back to Home
                </button>
              </div>
            )}
          </div>

          {/* Action Buttons - Below the card stack */}
          {!loading && currentIndex < cards.length && (
            <div className="flex-none w-full max-w-xs sm:max-w-md mt-3 sm:mt-6 pb-3 sm:pb-6">
              <div className="flex justify-between items-center px-4 sm:px-8">
                {/* Dislike Button - Left */}
                <button
                  onClick={() => handleButtonClick('dislike')}
                  className="flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-white border-3 sm:border-4 border-red-500 shadow-xl hover:scale-110 active:scale-95 transition-transform z-50"
                >
                  <X className="w-7 h-7 sm:w-8 sm:h-8 text-red-500 stroke-[3px]" />
                </button>

                {/* Undo Button - Center */}
                <button
                  onClick={handleUndo}
                  disabled={undoStack.length === 0}
                  className={`flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-white shadow-xl transition-all z-50 ${
                    undoStack.length === 0
                      ? 'border-2 border-gray-300 opacity-50 cursor-not-allowed'
                      : 'border-3 sm:border-4 border-yellow-500 hover:scale-110 active:scale-95'
                  }`}
                >
                  <RotateCcw className={`w-5 h-5 sm:w-6 sm:h-6 ${
                    undoStack.length === 0 ? 'text-gray-400' : 'text-yellow-500'
                  } stroke-[2.5px]`} />
                </button>

                {/* Like Button - Right */}
                <button
                  onClick={() => handleButtonClick('like')}
                  className="flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-white border-3 sm:border-4 border-green-500 shadow-xl hover:scale-110 active:scale-95 transition-transform z-50"
                >
                  <Heart className="w-7 h-7 sm:w-8 sm:h-8 text-green-500 stroke-[2px]" />
                </button>
              </div>

              <p className="text-center text-xs sm:text-sm text-gray-500 mt-2 sm:mt-3 hidden sm:block">
                Swipe or tap • Undo anytime
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Sticky Bottom Filter Bar */}
      <SwipeFilterBar
        totalNames={allNames.length}
        filteredCount={filteredNames.length}
        onFiltersApply={(newFilters) => {
          setFilters(newFilters);
          // Cards will be reset by the useEffect that watches filters
        }}
        currentFilters={filters}
        onPreviewFilterCount={(previewFilters) => {
          // Calculate filtered count in real-time for preview
          let filtered = applyFilters(allNames, previewFilters);
          filtered = favoritesService.filterOutLikedAndDisliked(filtered);
          return filtered.length;
        }}
      />

      {/* Name Detail Modal */}
      {selectedName && (
        <NameDetailModal
          name={selectedName}
          onClose={() => setSelectedName(null)}
        />
      )}

      {/* Structured Data for SEO */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebApplication",
          "name": "SoulSeed Swipe Mode",
          "applicationCategory": "LifestyleApplication",
          "description": "Discover your perfect baby name with SoulSeed's Tinder-style swipe interface. Swipe right to like, left to pass. Fun, fast, and personalized baby name discovery.",
          "url": "https://soulseedbaby.com/swipe",
          "operatingSystem": "Web Browser",
          "offers": {
            "@type": "Offer",
            "price": "0",
            "priceCurrency": "USD"
          },
          "aggregateRating": {
            "@type": "AggregateRating",
            "ratingValue": "4.8",
            "ratingCount": "1200"
          },
          "featureList": [
            "Tinder-style swipe interface",
            "150,000+ baby names database",
            "Advanced filtering options",
            "Favorites and dislikes tracking",
            "Gender and origin filtering",
            "Instant name discovery"
          ]
        })}
      </script>
    </div>
    </>
  );
};

export default SwipeModePage;
