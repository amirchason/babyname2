import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, useMotionValue, useTransform, useAnimation, PanInfo } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Heart, X, Sparkles, Baby, RotateCcw, Info } from 'lucide-react';
import nameService, { NameEntry } from '../services/nameService';
import favoritesService from '../services/favoritesService';
import NameDetailModal from '../components/NameDetailModal';

interface CardProps {
  name: NameEntry;
  isTop: boolean;
  isSecond: boolean; // Track if this is the second card (underneath top)
  dragX?: any; // Motion value for drag (passed from parent for top card)
  topCardX?: any; // Motion value from top card's drag (for second card reveal)
  onSwipeLeft: () => void;
  onSwipeRight: () => void;
  dragEnabled: boolean;
  onInfoClick: () => void;
}

// Memoized Card component to prevent unnecessary re-renders
const Card = React.memo<CardProps>(({ name, isTop, isSecond, dragX, topCardX, onSwipeLeft, onSwipeRight, dragEnabled, onInfoClick }) => {
  // Use provided dragX for top card, or create local one for others
  const localX = useMotionValue(0);
  const x = dragX || localX;
  const controls = useAnimation();

  // Transform values for smooth animations (for TOP card)
  const rotate = useTransform(x, [-200, 0, 200], [-25, 0, 25]);
  const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0.5, 1, 1, 1, 0.5]);

  // Like/Nope indicators opacity
  const likeOpacity = useTransform(x, [0, 100], [0, 1]);
  const nopeOpacity = useTransform(x, [-100, 0], [1, 0]);

  // UNDERLAYER REVEAL: Second card scales up as top card drags
  // Always create transforms, but use a fallback static motion value if topCardX doesn't exist
  const fallbackX = useMotionValue(0);
  const revealScale = useTransform(
    topCardX || fallbackX,
    [-200, 0, 200],
    [1, 0.95, 1]
  );
  const revealY = useTransform(
    topCardX || fallbackX,
    [-200, 0, 200],
    [0, 10, 0]
  );

  const handleDragEnd = useCallback((event: any, info: PanInfo) => {
    const threshold = 50;
    const velocity = info.velocity.x;
    const offset = info.offset.x;

    if (Math.abs(velocity) >= 300 || Math.abs(offset) >= threshold) {
      // Card was swiped
      if (offset > 0) {
        // Swipe right - Like
        controls.start({
          x: 1000,
          rotate: 45,
          opacity: 0,
          transition: { duration: 0.3 }
        }).then(() => {
          // Reset motion values after animation completes
          x.set(0);
        });
        setTimeout(onSwipeRight, 300);
      } else {
        // Swipe left - Dislike
        controls.start({
          x: -1000,
          rotate: -45,
          opacity: 0,
          transition: { duration: 0.3 }
        }).then(() => {
          // Reset motion values after animation completes
          x.set(0);
        });
        setTimeout(onSwipeLeft, 300);
      }
    } else {
      // Return to center
      controls.start({
        x: 0,
        rotate: 0,
        transition: { type: "spring", stiffness: 200, damping: 25 }
      });
    }
  }, [controls, onSwipeLeft, onSwipeRight, x]);

  const genderData = typeof name.gender === 'object' ? name.gender : null;
  const isMale = (genderData?.Male || 0) > (genderData?.Female || 0);
  const genderColor = isMale ? 'from-blue-400 to-blue-600' : 'from-pink-400 to-pink-600';
  const genderBg = isMale ? 'bg-blue-50' : 'bg-pink-50';

  return (
    <motion.div
      className="absolute w-full h-full"
      style={{
        x: isTop ? x : 0,
        rotate: isTop ? rotate : 0,
        opacity,
        // Apply reveal animation to second card
        scale: isSecond ? revealScale : 1,
        y: isSecond ? revealY : 0,
      }}
      drag={dragEnabled && isTop ? "x" : false}
      dragConstraints={{ left: -250, right: 250 }}
      dragElastic={0.5}
      dragMomentum={false}
      onDragEnd={isTop ? handleDragEnd : undefined}
      animate={controls}
    >
      <div className={`relative w-full h-full ${genderBg} rounded-2xl sm:rounded-3xl shadow-2xl border-2 border-white overflow-hidden`}>
        {/* Info Button - Top Right (always visible) */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onInfoClick();
          }}
          className="absolute top-3 right-3 sm:top-4 sm:right-4 z-20 flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 bg-white/90 hover:bg-white rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-110 active:scale-95"
          title="View name details"
        >
          <Info className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" />
        </button>

        {/* Like/Nope Indicators */}
        {isTop && (
          <>
            <motion.div
              className="absolute top-4 sm:top-8 left-4 sm:left-8 z-10"
              style={{ opacity: nopeOpacity }}
            >
              <div className="text-red-500 border-3 sm:border-4 border-red-500 rounded-lg sm:rounded-xl px-3 py-1.5 sm:px-4 sm:py-2 font-bold text-2xl sm:text-4xl transform -rotate-12">
                NOPE
              </div>
            </motion.div>
            <motion.div
              className="absolute top-4 sm:top-8 right-4 sm:right-8 z-10"
              style={{ opacity: likeOpacity }}
            >
              <div className="text-green-500 border-3 sm:border-4 border-green-500 rounded-lg sm:rounded-xl px-3 py-1.5 sm:px-4 sm:py-2 font-bold text-2xl sm:text-4xl transform rotate-12">
                LIKE
              </div>
            </motion.div>
          </>
        )}

        {/* Gradient Header */}
        <div className={`h-1/3 bg-gradient-to-br ${genderColor} relative`}>
          <div className="absolute inset-0 bg-black opacity-10" />
          <div className="absolute bottom-3 sm:bottom-4 left-0 right-0 text-center px-4">
            <h2 className="text-3xl sm:text-5xl font-bold text-white drop-shadow-lg truncate">
              {name.name}
            </h2>
          </div>
        </div>

        {/* Card Content */}
        <div className="p-4 sm:p-6 h-2/3 flex flex-col justify-between">
          <div>
            {/* Rank Badge */}
            <div className="flex justify-center mb-3 sm:mb-4">
              <span className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-full bg-gradient-to-r ${genderColor} text-white font-bold text-sm sm:text-lg`}>
                Rank #{name.popularityRank || 999999}
              </span>
            </div>

            {/* Meaning */}
            {name.meaning && (
              <div className="text-center mb-3 sm:mb-4">
                <p className="text-base sm:text-xl italic text-gray-700 line-clamp-3">"{name.meaning}"</p>
              </div>
            )}

            {/* Origin */}
            {name.origin && (
              <div className="text-center">
                <span className="inline-flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 bg-purple-100 rounded-full">
                  <span className="text-xs sm:text-sm font-semibold text-purple-700">{name.origin}</span>
                </span>
              </div>
            )}
          </div>

          {/* Gender Distribution */}
          <div className="mt-auto">
            <div className="flex gap-2 items-center justify-center">
              <div className="flex-1 text-center">
                <span className="text-xs sm:text-sm text-gray-600">Male</span>
                <div className="h-1.5 sm:h-2 bg-gray-200 rounded-full overflow-hidden mt-1">
                  <div className="h-full bg-gradient-to-r from-blue-400 to-blue-600"
                       style={{ width: `${(genderData?.Male || 0) * 100}%` }} />
                </div>
              </div>
              <div className="flex-1 text-center">
                <span className="text-xs sm:text-sm text-gray-600">Female</span>
                <div className="h-1.5 sm:h-2 bg-gray-200 rounded-full overflow-hidden mt-1">
                  <div className="h-full bg-gradient-to-r from-pink-400 to-pink-600"
                       style={{ width: `${(genderData?.Female || 0) * 100}%` }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
});

Card.displayName = 'Card';

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
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [favoritesCount, setFavoritesCount] = useState(0);
  const [dislikesCount, setDislikesCount] = useState(0);
  const [lastAction, setLastAction] = useState<{ name: string; action: 'like' | 'dislike' } | null>(null);
  const [undoStack, setUndoStack] = useState<{ name: string; action: 'like' | 'dislike' }[]>([]);
  const [selectedName, setSelectedName] = useState<NameEntry | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const [loadOffset, setLoadOffset] = useState(0); // Track where to load next batch from

  // Motion value for top card's drag - shared with second card for reveal animation
  const topCardX = useMotionValue(0);

  // Load names with proper batching and memory management
  const loadNamesBatch = useCallback((offset: number, limit: number) => {
    // Get popular names sorted (service caches this internally)
    let names = nameService.getPopularNames(offset + limit);

    // Slice to get only the new batch
    names = names.slice(offset, offset + limit);

    // Filter out already liked and disliked names
    names = favoritesService.filterOutLikedAndDisliked(names);

    return names;
  }, []);

  useEffect(() => {
    // Load initial batch of names
    const loadNames = async () => {
      setLoading(true);
      const names = loadNamesBatch(0, INITIAL_LOAD_SIZE);
      setCards(names);
      setLoadOffset(INITIAL_LOAD_SIZE);
      setFavoritesCount(favoritesService.getFavoritesCount());
      setDislikesCount(favoritesService.getDislikesCount());
      setLoading(false);
    };
    loadNames();
  }, [loadNamesBatch]);

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

  // Load more cards when running low
  const loadMoreCards = useCallback(() => {
    const remainingCards = cards.length - currentIndex;

    if (remainingCards <= LOAD_MORE_THRESHOLD) {
      const newBatch = loadNamesBatch(loadOffset, LOAD_MORE_BATCH);

      if (newBatch.length > 0) {
        setCards(prev => [...prev, ...newBatch]);
        setLoadOffset(prev => prev + LOAD_MORE_BATCH);
      }
    }
  }, [cards.length, currentIndex, loadOffset, loadNamesBatch]);

  const handleSwipe = useCallback((direction: 'left' | 'right') => {
    const currentCard = cards[currentIndex];
    if (!currentCard) return;

    const action = direction === 'right' ? 'like' : 'dislike';

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
    setFavoritesCount(favoritesService.getFavoritesCount());
    setDislikesCount(favoritesService.getDislikesCount());

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
      setFavoritesCount(favoritesService.getFavoritesCount());
      setDislikesCount(favoritesService.getDislikesCount());

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

    // Update counts
    setFavoritesCount(favoritesService.getFavoritesCount());
    setDislikesCount(favoritesService.getDislikesCount());

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
    <div className="fixed inset-0 bg-gradient-to-br from-purple-50 to-pink-50 overflow-hidden flex flex-col">
      {/* Header */}
      <header className="flex-none bg-white/95 backdrop-blur-lg shadow-md border-b border-purple-100/50 z-50">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2.5 sm:py-3 flex items-center justify-between">
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
              className="flex items-center gap-1.5 text-gray-700 hover:text-purple-600 transition-colors px-2 py-1.5 rounded-lg hover:bg-purple-50"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="hidden sm:inline font-medium">Back</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <h1 className="text-base sm:text-lg font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Swipe Mode
            </h1>
          </div>

          <div className="flex gap-2 sm:gap-4">
            <div className="flex items-center gap-1">
              <Heart className="w-4 h-4 sm:w-5 sm:h-5 text-red-500 fill-red-500" />
              <span className="font-bold text-gray-700 text-sm sm:text-base">{favoritesCount}</span>
            </div>
            <div className="flex items-center gap-1">
              <X className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500" />
              <span className="font-bold text-gray-700 text-sm sm:text-base">{dislikesCount}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-0 px-3 sm:px-4">
        {/* Progress */}
        <div className="flex-none text-center py-2">
          <p className="text-xs sm:text-sm text-gray-600">
            {currentIndex + 1} / {cards.length}
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
                      style={{ zIndex: index + 1 }}
                    >
                      <Card
                        name={card}
                        isTop={isTop}
                        isSecond={isSecond}
                        dragX={isTop ? topCardX : undefined} // Pass motion value to top card
                        topCardX={isSecond ? topCardX : undefined} // Pass top card's motion value to second card
                        onSwipeLeft={() => handleSwipe('left')}
                        onSwipeRight={() => handleSwipe('right')}
                        dragEnabled={true}
                        onInfoClick={() => {
                          setSelectedName(card);
                          setSelectedIndex(currentIndex + stackIndex);
                        }}
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

      {/* Name Detail Modal */}
      {selectedName && (
        <NameDetailModal
          name={selectedName}
          names={cards}
          currentIndex={selectedIndex}
          onClose={() => setSelectedName(null)}
          onNavigate={(newIndex) => {
            if (newIndex >= 0 && newIndex < cards.length) {
              setSelectedName(cards[newIndex]);
              setSelectedIndex(newIndex);
            }
          }}
          onFavoriteToggle={() => {
            setFavoritesCount(favoritesService.getFavoritesCount());
          }}
          onDislikeToggle={() => {
            setDislikesCount(favoritesService.getDislikesCount());
          }}
        />
      )}
    </div>
  );
};

export default SwipeModePage;
