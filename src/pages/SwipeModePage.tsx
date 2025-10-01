import React, { useState, useEffect } from 'react';
import { motion, useMotionValue, useTransform, useAnimation, PanInfo } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Heart, X, Sparkles, Baby, RotateCcw } from 'lucide-react';
import nameService, { NameEntry } from '../services/nameService';
import favoritesService from '../services/favoritesService';

interface CardProps {
  name: NameEntry;
  isTop: boolean;
  onSwipeLeft: () => void;
  onSwipeRight: () => void;
  dragEnabled: boolean;
}

const Card: React.FC<CardProps> = ({ name, isTop, onSwipeLeft, onSwipeRight, dragEnabled }) => {
  const x = useMotionValue(0);
  const controls = useAnimation();

  // Transform values for smooth animations
  const rotate = useTransform(x, [-200, 0, 200], [-25, 0, 25]);
  const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0.5, 1, 1, 1, 0.5]);

  // Like/Nope indicators opacity
  const likeOpacity = useTransform(x, [0, 100], [0, 1]);
  const nopeOpacity = useTransform(x, [-100, 0], [1, 0]);

  const handleDragEnd = (event: any, info: PanInfo) => {
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
        });
        setTimeout(onSwipeRight, 300);
      } else {
        // Swipe left - Dislike
        controls.start({
          x: -1000,
          rotate: -45,
          opacity: 0,
          transition: { duration: 0.3 }
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
  };

  const genderData = typeof name.gender === 'object' ? name.gender : null;
  const isMale = (genderData?.Male || 0) > (genderData?.Female || 0);
  const genderColor = isMale ? 'from-blue-400 to-blue-600' : 'from-pink-400 to-pink-600';
  const genderBg = isMale ? 'bg-blue-50' : 'bg-pink-50';

  return (
    <motion.div
      className="absolute w-full h-full"
      style={{ x: isTop ? x : 0, rotate: isTop ? rotate : 0, opacity }}
      drag={dragEnabled && isTop ? "x" : false}
      dragConstraints={{ left: -250, right: 250 }}
      dragElastic={0.5}
      dragMomentum={false}
      onDragEnd={isTop ? handleDragEnd : undefined}
      animate={controls}
    >
      <div className={`relative w-full h-full ${genderBg} rounded-3xl shadow-2xl border-2 border-white overflow-hidden`}>
        {/* Like/Nope Indicators */}
        {isTop && (
          <>
            <motion.div
              className="absolute top-8 left-8 z-10"
              style={{ opacity: nopeOpacity }}
            >
              <div className="text-red-500 border-4 border-red-500 rounded-xl px-4 py-2 font-bold text-4xl transform -rotate-12">
                NOPE
              </div>
            </motion.div>
            <motion.div
              className="absolute top-8 right-8 z-10"
              style={{ opacity: likeOpacity }}
            >
              <div className="text-green-500 border-4 border-green-500 rounded-xl px-4 py-2 font-bold text-4xl transform rotate-12">
                LIKE
              </div>
            </motion.div>
          </>
        )}

        {/* Gradient Header */}
        <div className={`h-1/3 bg-gradient-to-br ${genderColor} relative`}>
          <div className="absolute inset-0 bg-black opacity-10" />
          <div className="absolute bottom-4 left-0 right-0 text-center">
            <h2 className="text-5xl font-bold text-white drop-shadow-lg">
              {name.name}
            </h2>
          </div>
        </div>

        {/* Card Content */}
        <div className="p-6 h-2/3 flex flex-col justify-between">
          <div>
            {/* Rank Badge */}
            <div className="flex justify-center mb-4">
              <span className={`px-4 py-2 rounded-full bg-gradient-to-r ${genderColor} text-white font-bold text-lg`}>
                Rank #{name.popularityRank || 999999}
              </span>
            </div>

            {/* Meaning */}
            {name.meaning && (
              <div className="text-center mb-4">
                <p className="text-xl italic text-gray-700">"{name.meaning}"</p>
              </div>
            )}

            {/* Origin */}
            {name.origin && (
              <div className="text-center">
                <span className="inline-flex items-center gap-2 px-4 py-2 bg-purple-100 rounded-full">
                  <span className="text-sm font-semibold text-purple-700">{name.origin}</span>
                </span>
              </div>
            )}
          </div>

          {/* Gender Distribution */}
          <div className="mt-auto">
            <div className="flex gap-2 items-center justify-center">
              <div className="flex-1 text-center">
                <span className="text-sm text-gray-600">Male</span>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden mt-1">
                  <div className="h-full bg-gradient-to-r from-blue-400 to-blue-600"
                       style={{ width: `${(genderData?.Male || 0) * 100}%` }} />
                </div>
              </div>
              <div className="flex-1 text-center">
                <span className="text-sm text-gray-600">Female</span>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden mt-1">
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
};

const SwipeModePage: React.FC = () => {
  const navigate = useNavigate();
  const [cards, setCards] = useState<NameEntry[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [favoritesCount, setFavoritesCount] = useState(0);
  const [dislikesCount, setDislikesCount] = useState(0);
  const [lastAction, setLastAction] = useState<{ name: string; action: 'like' | 'dislike' } | null>(null);
  const [undoStack, setUndoStack] = useState<{ name: string; action: 'like' | 'dislike' }[]>([]);

  useEffect(() => {
    // Load initial batch of names
    const loadNames = async () => {
      setLoading(true);
      let names = nameService.getPopularNames(200); // Load more to account for filtering
      // Filter out already liked and disliked names
      names = favoritesService.filterOutLikedAndDisliked(names);
      setCards(names);
      setFavoritesCount(favoritesService.getFavoritesCount());
      setDislikesCount(favoritesService.getDislikesCount());
      setLoading(false);
    };
    loadNames();
  }, []);

  const handleSwipe = (direction: 'left' | 'right') => {
    const currentCard = cards[currentIndex];
    const action = direction === 'right' ? 'like' : 'dislike';

    // Track the action for undo
    setUndoStack(prev => [...prev, { name: currentCard.name, action }]);
    setLastAction({ name: currentCard.name, action });

    if (direction === 'right') {
      favoritesService.toggleFavorite(currentCard.name);
      setFavoritesCount(favoritesService.getFavoritesCount());
    } else {
      favoritesService.toggleDislike(currentCard.name);
      setDislikesCount(favoritesService.getDislikesCount());
    }

    // Move to next card
    setCurrentIndex(prev => prev + 1);

    // Load more cards if running low
    if (currentIndex >= cards.length - 5) {
      let moreNames = nameService.getPopularNames(100); // Load more to account for filtering
      // Filter out already liked and disliked names
      moreNames = favoritesService.filterOutLikedAndDisliked(moreNames);
      setCards(prev => [...prev, ...moreNames]);
    }
  };

  const handleButtonClick = (action: 'like' | 'dislike') => {
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
      // Track the action for undo
      setUndoStack(prev => [...prev, { name: currentCard.name, action }]);
      setLastAction({ name: currentCard.name, action });

      if (action === 'like') {
        favoritesService.toggleFavorite(currentCard.name);
        setFavoritesCount(favoritesService.getFavoritesCount());
      } else {
        favoritesService.toggleDislike(currentCard.name);
        setDislikesCount(favoritesService.getDislikesCount());
      }

      setCurrentIndex(prev => prev + 1);
    }, 300);
  };

  const handleUndo = () => {
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
  };

  // Get visible cards (current + next 2)
  const visibleCards = cards.slice(currentIndex, currentIndex + 3).reverse();

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 overflow-hidden">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md shadow-sm fixed top-0 left-0 right-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-gray-700 hover:text-purple-600 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Back</span>
          </button>

          <div className="flex items-center gap-2">
            <Baby className="h-8 w-8 text-purple-500" />
            <h1 className="text-lg font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Swipe Mode
            </h1>
          </div>

          <div className="flex gap-4">
            <div className="flex items-center gap-1">
              <Heart className="w-5 h-5 text-red-500 fill-red-500" />
              <span className="font-bold text-gray-700">{favoritesCount}</span>
            </div>
            <div className="flex items-center gap-1">
              <X className="w-5 h-5 text-gray-500" />
              <span className="font-bold text-gray-700">{dislikesCount}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="pt-20 px-4 h-screen flex flex-col">
        {/* Progress */}
        <div className="text-center mb-4">
          <p className="text-sm text-gray-600">
            Reviewing name {currentIndex + 1} of {cards.length}
          </p>
        </div>

        {/* Card Stack and Buttons Container */}
        <div className="flex-1 flex flex-col items-center justify-center">
          <div className="relative w-full max-w-md h-[600px]">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
              </div>
            ) : currentIndex < cards.length ? (
              <>
                {/* Stack of cards */}
                {visibleCards.map((card, index) => {
                  const isTop = index === visibleCards.length - 1;
                  const stackIndex = visibleCards.length - 1 - index;

                  return (
                    <motion.div
                      key={`${card.name}-${currentIndex + stackIndex}`}
                      className="absolute inset-0"
                      data-card-index={stackIndex}
                      initial={{ scale: 1 - stackIndex * 0.05, y: stackIndex * 10 }}
                      animate={{ scale: 1 - stackIndex * 0.05, y: stackIndex * 10 }}
                      style={{ zIndex: index + 1 }}
                    >
                      <Card
                        name={card}
                        isTop={isTop}
                        onSwipeLeft={() => handleSwipe('left')}
                        onSwipeRight={() => handleSwipe('right')}
                        dragEnabled={true}
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
            <div className="w-full max-w-md mt-8 pb-8">
              <div className="flex justify-between items-center px-8">
                {/* Dislike Button - Left */}
                <button
                  onClick={() => handleButtonClick('dislike')}
                  className="flex items-center justify-center w-16 h-16 rounded-full bg-white border-4 border-red-500 shadow-xl hover:scale-110 transition-transform z-50"
                >
                  <X className="w-8 h-8 text-red-500 stroke-[3px]" />
                </button>

                {/* Undo Button - Center */}
                <button
                  onClick={handleUndo}
                  disabled={undoStack.length === 0}
                  className={`flex items-center justify-center w-14 h-14 rounded-full bg-white shadow-xl transition-all z-50 ${
                    undoStack.length === 0
                      ? 'border-2 border-gray-300 opacity-50 cursor-not-allowed'
                      : 'border-4 border-yellow-500 hover:scale-110'
                  }`}
                >
                  <RotateCcw className={`w-6 h-6 ${
                    undoStack.length === 0 ? 'text-gray-400' : 'text-yellow-500'
                  } stroke-[2.5px]`} />
                </button>

                {/* Like Button - Right */}
                <button
                  onClick={() => handleButtonClick('like')}
                  className="flex items-center justify-center w-16 h-16 rounded-full bg-white border-4 border-green-500 shadow-xl hover:scale-110 transition-transform z-50"
                >
                  <Heart className="w-8 h-8 text-green-500 stroke-[2px]" />
                </button>
              </div>

              <p className="text-center text-sm text-gray-500 mt-4">
                Swipe left to pass • Swipe right to like • Tap undo to go back
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SwipeModePage;