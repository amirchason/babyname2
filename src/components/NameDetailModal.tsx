import React, { useState, useEffect } from 'react';
import { motion, useMotionValue, useTransform, PanInfo, animate } from 'framer-motion';
import { X, Globe, Heart, Award, BookOpen, Sparkles, Tag } from 'lucide-react';
import { NameEntry } from '../services/nameService';
import enrichmentService from '../services/enrichmentService';
import favoritesService from '../services/favoritesService';
import AppHeader from './AppHeader';

interface NameDetailModalProps {
  name: NameEntry | null;
  names?: NameEntry[];
  currentIndex?: number;
  onClose: () => void;
  onFavoriteToggle?: () => void;
  onDislikeToggle?: () => void;
  onNavigate?: (index: number) => void;
}

const NameDetailModal: React.FC<NameDetailModalProps> = ({ name, names, currentIndex, onClose, onFavoriteToggle, onDislikeToggle, onNavigate }) => {
  const [enrichedData, setEnrichedData] = useState<{
    meaning?: string;
    origin?: string;
    culturalContext?: string;
    enriched?: boolean;
  }>({});
  const [isFavorite, setIsFavorite] = useState(false);
  const [isDisliked, setIsDisliked] = useState(false);
  const [isSliding, setIsSliding] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Motion values for swipe gestures - Tinder-style
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 0, 200], [-20, 0, 20]); // More rotation
  const opacity = useTransform(x, [-200, -150, 0, 150, 200], [0.8, 1, 1, 1, 0.8]);
  const scale = useTransform(x, [-200, 0, 200], [0.95, 1, 0.95]); // Scale down slightly when swiping

  // Check if swipeable (has navigation props)
  const isSwipeable = !!names && currentIndex !== undefined && !!onNavigate;

  useEffect(() => {
    if (name) {
      const data = enrichmentService.getNameData(name.name);
      if (data) {
        setEnrichedData(data);
      }
      // Initialize favorite/dislike status
      setIsFavorite(favoritesService.isFavorite(name.name));
      setIsDisliked(favoritesService.isDisliked(name.name));
    }
    // Reset position when name changes
    setIsSliding(false);
    setIsTransitioning(false);
    x.set(0);
  }, [name, x]);

  if (!name) return null;

  const genderData = typeof name.gender === 'object' ? name.gender : null;
  const isMale = (genderData?.Male || 0) > (genderData?.Female || 0);
  const genderColor = isMale ? 'from-blue-500 to-blue-700' : 'from-pink-500 to-pink-700';
  const genderBg = isMale ? 'bg-blue-50' : 'bg-pink-50';

  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (!isSwipeable || isSliding) return;

    const swipeThreshold = 40;
    const swipeVelocityThreshold = 200;

    // Only trigger swipe if movement is primarily horizontal
    const isHorizontalSwipe = Math.abs(info.offset.x) > Math.abs(info.offset.y);

    if (isHorizontalSwipe && (Math.abs(info.offset.x) > swipeThreshold || Math.abs(info.velocity.x) > swipeVelocityThreshold)) {
      setIsSliding(true);
      setIsTransitioning(true);

      const direction = info.offset.x > 0 ? 'right' : 'left';
      const targetX = direction === 'right' ? 1000 : -1000;

      // Update favorites/dislikes
      if (direction === 'right') {
        favoritesService.addFavorite(name.name);
        onFavoriteToggle?.();
      } else {
        favoritesService.toggleDislike(name.name);
        onDislikeToggle?.();
      }

      // Animate the card flying off screen - Tinder style (snappy & smooth)
      animate(x, targetX, {
        type: 'spring',
        stiffness: 300,
        damping: 30,
        mass: 0.5
      }).then(() => {
        // Small delay to prevent flash of wrong card
        setTimeout(() => {
          // After slide completes, navigate to next card
          const nextIndex = (currentIndex! + 1) % names!.length;
          // If we've looped back to the start, close modal (finished the list)
          if (nextIndex === 0 && currentIndex! === names!.length - 1) {
            onClose();
          } else {
            onNavigate!(nextIndex);
          }
        }, 50);
      });
    } else {
      // Didn't meet threshold - snap back to center with spring
      animate(x, 0, {
        type: 'spring',
        stiffness: 400,
        damping: 25
      });
    }
  };

  const handleFavoriteClick = () => {
    // Update favorites
    favoritesService.addFavorite(name.name);
    setIsFavorite(favoritesService.isFavorite(name.name));
    setIsDisliked(favoritesService.isDisliked(name.name));
    onFavoriteToggle?.();

    // If swipeable, trigger slide-right animation before navigating
    if (isSwipeable && !isSliding) {
      setIsSliding(true);
      setIsTransitioning(true);

      // Animate the card flying off screen to the right - Tinder style
      animate(x, 1000, {
        type: 'spring',
        stiffness: 300,
        damping: 30,
        mass: 0.5
      }).then(() => {
        // Small delay to prevent flash of wrong card
        setTimeout(() => {
          const nextIndex = (currentIndex! + 1) % names!.length;
          if (nextIndex === 0 && currentIndex! === names!.length - 1) {
            onClose();
          } else {
            onNavigate!(nextIndex);
          }
        }, 50);
      });
    }
  };

  const handleDislikeClick = () => {
    // Update dislikes
    favoritesService.toggleDislike(name.name);
    setIsFavorite(favoritesService.isFavorite(name.name));
    setIsDisliked(favoritesService.isDisliked(name.name));
    onDislikeToggle?.();

    // If swipeable, trigger slide-left animation before navigating
    if (isSwipeable && !isSliding) {
      setIsSliding(true);
      setIsTransitioning(true);

      // Animate the card flying off screen to the left - Tinder style
      animate(x, -1000, {
        type: 'spring',
        stiffness: 300,
        damping: 30,
        mass: 0.5
      }).then(() => {
        // Small delay to prevent flash of wrong card
        setTimeout(() => {
          const nextIndex = (currentIndex! + 1) % names!.length;
          if (nextIndex === 0 && currentIndex! === names!.length - 1) {
            onClose();
          } else {
            onNavigate!(nextIndex);
          }
        }, 50);
      });
    }
  };


  // Main card component
  const CardContent = () => (
    <div className={`w-full h-screen ${genderBg} shadow-2xl flex flex-col overflow-hidden`}
         onClick={(e) => e.stopPropagation()}>
      {/* Close Button - positioned below AppHeader */}
      <button
        onClick={onClose}
        className="absolute top-[68px] right-2 sm:top-[72px] sm:right-4 p-1.5 sm:p-2 rounded-full bg-white shadow-md
                   hover:bg-gray-100 z-[70]"
      >
        <X className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
      </button>

      {/* Spacer for AppHeader */}
      <div className="h-16" />

      {/* Header with Gradient */}
      <div className={`relative h-32 sm:h-44 bg-gradient-to-br ${genderColor} overflow-hidden`}>
        <div className="absolute inset-0 bg-black opacity-20" />
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <h2 className="text-5xl sm:text-8xl font-bold text-white drop-shadow-lg">
            {name.name}
          </h2>
        </div>
        <div className="absolute top-2 left-2 sm:top-4 sm:left-4">
          <span className="px-2 py-0.5 sm:px-3 sm:py-1 bg-white bg-opacity-20 backdrop-blur-sm
                         rounded-full text-white text-xs sm:text-sm font-medium">
            Rank #{name.popularityRank}
          </span>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-hidden">
        <div className="p-4 sm:p-8 h-full flex flex-col">
        {/* Meaning Section - Always rendered with fixed height */}
        <div className="mb-4 h-[140px] sm:h-[160px] p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-200 overflow-y-auto">
          <div className="flex items-center gap-2 mb-2">
            <BookOpen className="w-5 h-5 text-purple-600" />
            <h3 className="text-lg font-semibold text-purple-800">Meaning</h3>
            {(name.meaningProcessed || enrichedData.enriched) && (
              <Sparkles className="w-4 h-4 text-green-600" />
            )}
          </div>

          {(name.meaningFull || name.meaning || enrichedData.meaning) ? (
            <>
              {/* Primary meaning (full version) */}
              <p className="text-lg italic text-gray-700">
                "{name.meaningFull || enrichedData.meaning || name.meaning}"
              </p>

              {/* Multiple meanings if available - ONLY show if more than 1 */}
              {name.meanings && name.meanings.length > 1 && (
                <div className="mt-3 space-y-1">
                  <p className="text-sm font-medium text-purple-700">Alternative meanings:</p>
                  {name.meanings.slice(1).map((altMeaning, index) => (
                    <p key={index} className="text-sm text-gray-600 pl-3 border-l-2 border-purple-200">
                      • {altMeaning}
                    </p>
                  ))}
                </div>
              )}

              {enrichedData.culturalContext && (
                <p className="text-sm text-gray-600 mt-2">{enrichedData.culturalContext}</p>
              )}
            </>
          ) : (
            <p className="text-gray-400 italic">No meaning available yet</p>
          )}
        </div>

        {/* Essential Info - Rank and Origin - Fixed height */}
        <div className="mb-4 h-[120px] p-4 bg-white rounded-xl border border-gray-200">
          <div className="grid grid-cols-2 gap-4 h-full">
            <div className="text-center flex flex-col justify-center">
              <Award className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-800">
                #{name.popularityRank || 'N/A'}
              </div>
              <div className="text-sm text-gray-500">Global Rank</div>
            </div>
            <div className="text-center flex flex-col justify-center">
              <Globe className="w-8 h-8 text-indigo-500 mx-auto mb-2" />
              <div className="text-xl font-bold text-gray-800 capitalize">
                {(name as any).originGroup || name.origin || enrichedData.origin || 'Unknown'}
              </div>
              <div className="text-sm text-gray-500">
                Origin
                {name.originProcessed && (
                  <span className="ml-1 text-xs text-green-600">✓</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Gender Section - Fixed height */}
        <div className="h-[100px]">
          <h3 className="text-base sm:text-lg font-semibold mb-2 sm:mb-3 flex items-center gap-2">
            <Heart className="w-4 h-4 sm:w-5 sm:h-5 text-pink-500" />
            Gender Distribution
          </h3>
          <div className="flex gap-3 sm:gap-4 items-center">
            <div className="flex-1">
              <div className="flex justify-between mb-1">
                <span className="text-xs sm:text-sm text-gray-600">Male</span>
                <span className="text-xs sm:text-sm font-medium">{Math.round((genderData?.Male || 0) * 100)}%</span>
              </div>
              <div className="h-2 sm:h-3 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-blue-400 to-blue-600"
                     style={{ width: `${(genderData?.Male || 0) * 100}%` }} />
              </div>
            </div>
            <div className="flex-1">
              <div className="flex justify-between mb-1">
                <span className="text-xs sm:text-sm text-gray-600">Female</span>
                <span className="text-xs sm:text-sm font-medium">{Math.round((genderData?.Female || 0) * 100)}%</span>
              </div>
              <div className="h-2 sm:h-3 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-pink-400 to-pink-600"
                     style={{ width: `${(genderData?.Female || 0) * 100}%` }} />
              </div>
            </div>
          </div>
        </div>

        {/* Themed Lists Section - Show if name is validated for any themed lists */}
        {name.validatedForLists && name.validatedForLists.length > 0 && (
          <div className="mt-4 p-4 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl border border-purple-200">
            <h3 className="text-base sm:text-lg font-semibold mb-2 flex items-center gap-2">
              <Tag className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" />
              Curated Collections
            </h3>
            <div className="flex flex-wrap gap-2">
              {name.validatedForLists.map((listId) => (
                <span
                  key={listId}
                  className="px-3 py-1 bg-white/80 backdrop-blur-sm rounded-full text-xs sm:text-sm
                           font-medium text-purple-700 border border-purple-200 shadow-sm"
                >
                  {listId.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                </span>
              ))}
            </div>
            {name.themedListEnriched && (
              <p className="mt-2 text-xs text-gray-500 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-green-600" />
                AI-validated meaning matches theme
              </p>
            )}
          </div>
        )}

        {/* Short meaning display if available and different from full */}
        {name.meaningShort && name.meaningShort !== name.meaning && (
          <div className="mt-4 p-3 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border border-yellow-200">
            <p className="text-sm text-gray-600 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-yellow-600" />
              <span className="font-medium text-yellow-800">Quick meaning:</span>
              <span className="italic">"{name.meaningShort}"</span>
            </p>
          </div>
        )}

        </div>
      </div>

      {/* Fixed Footer with Like/Dislike Buttons */}
      <div className="border-t border-gray-200 bg-white sm:rounded-b-3xl p-4">
        <div className="flex justify-between items-center px-2 sm:px-4 gap-4">
          {/* Dislike button */}
          <button
            onClick={handleDislikeClick}
            className={`flex items-center justify-center w-14 h-14 rounded-full ${
              isDisliked
                ? 'bg-red-50 border-2 border-red-300 shadow-md'
                : 'bg-white border border-gray-200 shadow-sm hover:shadow-md hover:border-red-200'
            } transform hover:scale-105 active:scale-95`}
            style={{ transition: 'transform 0.05s' }}
            title={isDisliked ? 'Remove from hidden' : 'Pass on this name'}
          >
            <X className={`w-6 h-6 ${
              isDisliked
                ? 'text-red-400 stroke-[1.5]'
                : 'text-gray-400 hover:text-red-400 stroke-[1.5]'
            }`} />
          </button>

          {/* Like button */}
          <button
            onClick={handleFavoriteClick}
            className={`flex items-center justify-center w-14 h-14 rounded-full ${
              isFavorite
                ? 'bg-pink-50 border-2 border-pink-300 shadow-md'
                : 'bg-white border border-gray-200 shadow-sm hover:shadow-md hover:border-pink-200'
            } transform hover:scale-105 active:scale-95`}
            style={{ transition: 'transform 0.05s' }}
            title={isFavorite ? 'Remove from favorites' : 'Love this name'}
          >
            <Heart className={`w-6 h-6 ${
              isFavorite
                ? 'text-pink-400 fill-pink-400 stroke-[1.5]'
                : 'text-gray-400 hover:text-pink-400 stroke-[1.5]'
            }`} />
          </button>
        </div>

        {/* Swipe hint - only show if swipeable */}
        {isSwipeable && (
          <div className="mt-2 text-center">
            <p className="text-xs text-gray-400">
              👈 Swipe to browse 👉
            </p>
          </div>
        )}
      </div>
    </div>
  );

  // Get next name for background card - always visible when swipeable
  const nextName = isSwipeable && names && currentIndex !== undefined
    ? names[(currentIndex + 1) % names.length]
    : null;

  const nextNameGenderData = nextName && typeof nextName.gender === 'object' ? nextName.gender : null;
  const nextNameIsMale = nextNameGenderData ? (nextNameGenderData.Male || 0) > (nextNameGenderData.Female || 0) : true;
  const nextNameGenderBg = nextNameIsMale ? 'bg-blue-50' : 'bg-pink-50';
  const nextNameGenderColor = nextNameIsMale ? 'from-blue-500 to-blue-700' : 'from-pink-500 to-pink-700';

  return (
    <div className="fixed inset-0 z-50 bg-white"
         onClick={onClose}>

      {/* AppHeader - sticky header matching main page */}
      <div className="relative z-[60]" onClick={(e) => e.stopPropagation()}>
        <AppHeader />
      </div>

      {/* Next card in background - slides up smoothly from bottom */}
      {nextName && !isTransitioning && (
        <motion.div
          key={nextName.name}
          className="absolute inset-0 z-[50] pointer-events-none opacity-50"
          style={{ opacity: 0.5 }}  // Force constant opacity
          initial={{ y: 80, scale: 0.95 }}
          animate={{
            y: 0,
            scale: 0.95
          }}
          transition={{
            duration: 0.2,
            ease: [0.25, 0.46, 0.45, 0.94]  // Smooth easeOutQuad
          }}
        >
          <div className={`w-full h-screen ${nextNameGenderBg} shadow-2xl flex flex-col overflow-hidden`}>
            {/* Next card header */}
            <div className={`relative h-32 sm:h-44 bg-gradient-to-br ${nextNameGenderColor} overflow-hidden`}>
              <div className="absolute inset-0 bg-black opacity-20" />
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <h2 className="text-5xl sm:text-8xl font-bold text-white drop-shadow-lg">
                  {nextName.name}
                </h2>
              </div>
              <div className="absolute top-2 left-2 sm:top-4 sm:left-4">
                <span className="px-2 py-0.5 sm:px-3 sm:py-1 bg-white bg-opacity-20 backdrop-blur-sm
                               rounded-full text-white text-xs sm:text-sm font-medium">
                  Rank #{nextName.popularityRank}
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      )}


      {/* Main card - draggable if swipeable, slides to reveal card underneath */}
      {isSwipeable ? (
        <motion.div
          className="relative z-[55] will-change-transform"
          style={{ x, rotate, opacity, scale }}  // Added scale for Tinder-like feel
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.1}  // Slight elastic for natural feel
          onDragEnd={handleDragEnd}
          initial={false}  // No entry animation - card just appears
        >
          <CardContent />
        </motion.div>
      ) : (
        <CardContent />
      )}
    </div>
  );
};

export default NameDetailModal;
