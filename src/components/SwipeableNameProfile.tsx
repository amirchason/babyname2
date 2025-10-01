import React, { useState, useEffect } from 'react';
import { motion, useMotionValue, useTransform, PanInfo } from 'framer-motion';
import { Globe, Heart, Award, BookOpen, Sparkles, X } from 'lucide-react';
import { NameEntry } from '../services/nameService';
import favoritesService from '../services/favoritesService';
import enrichmentService from '../services/enrichmentService';

interface SwipeableNameProfileProps {
  name: NameEntry;
  onSwipeLeft: () => void;
  onSwipeRight: () => void;
  contextualRank?: number;
  filterContext?: 'all' | 'male' | 'female';
}

const SwipeableNameProfile: React.FC<SwipeableNameProfileProps> = ({
  name,
  onSwipeLeft,
  onSwipeRight,
  contextualRank,
  filterContext
}) => {
  const [exitDirection, setExitDirection] = useState<'left' | 'right' | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isDisliked, setIsDisliked] = useState(false);
  const [enrichedData, setEnrichedData] = useState<{
    meaning?: string;
    origin?: string;
    culturalContext?: string;
    enriched?: boolean;
  }>({});

  const x = useMotionValue(0);

  // Transform x position to rotation and opacity
  const rotate = useTransform(x, [-200, 0, 200], [-10, 0, 10]);
  const opacity = useTransform(x, [-200, -150, 0, 150, 200], [0.5, 1, 1, 1, 0.5]);

  // Transform for like/dislike indicators
  const likeOpacity = useTransform(x, [0, 150], [0, 1]);
  const dislikeOpacity = useTransform(x, [-150, 0], [1, 0]);

  useEffect(() => {
    setIsFavorite(favoritesService.isFavorite(name.name));
    setIsDisliked(favoritesService.isDisliked(name.name));

    // Get enriched data
    const data = enrichmentService.getNameData(name.name);
    if (data) {
      setEnrichedData(data);
    } else {
      setEnrichedData({
        meaning: name.meaning,
        origin: name.origin
      });
    }
  }, [name.name, name.meaning, name.origin]);

  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const swipeThreshold = 40;
    const swipeVelocityThreshold = 200;

    // Only trigger swipe if movement is primarily horizontal
    const isHorizontalSwipe = Math.abs(info.offset.x) > Math.abs(info.offset.y);

    if (isHorizontalSwipe && (Math.abs(info.offset.x) > swipeThreshold || Math.abs(info.velocity.x) > swipeVelocityThreshold)) {
      if (info.offset.x > 0) {
        // Swipe right - Like
        setExitDirection('right');
        favoritesService.toggleFavorite(name.name);
        setTimeout(() => onSwipeRight(), 100);
      } else {
        // Swipe left - Dislike
        setExitDirection('left');
        favoritesService.toggleDislike(name.name);
        setTimeout(() => onSwipeLeft(), 100);
      }
    }
  };

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    favoritesService.toggleFavorite(name.name);
    setIsFavorite(favoritesService.isFavorite(name.name));
    setIsDisliked(favoritesService.isDisliked(name.name));
    setTimeout(() => onSwipeRight(), 100);
  };

  const handleDislikeClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    favoritesService.toggleDislike(name.name);
    setIsFavorite(favoritesService.isFavorite(name.name));
    setIsDisliked(favoritesService.isDisliked(name.name));
    setTimeout(() => onSwipeLeft(), 100);
  };

  const genderData = typeof name.gender === 'object' ? name.gender : null;
  const isMale = (genderData?.Male || 0) > (genderData?.Female || 0);
  const genderColor = isMale ? 'from-blue-500 to-blue-700' : 'from-pink-500 to-pink-700';
  const genderBg = isMale ? 'bg-blue-50' : 'bg-pink-50';

  return (
    <motion.div
      className="fixed inset-0 top-16"
      style={{ x, rotate, opacity, touchAction: 'pan-y' }}
      drag="x"
      dragConstraints={{ left: -500, right: 500 }}
      dragElastic={0.3}
      dragMomentum={false}
      onDragEnd={handleDragEnd}
      animate={exitDirection ? {
        x: exitDirection === 'right' ? 800 : -800,
        opacity: 0,
        rotate: exitDirection === 'right' ? 30 : -30,
      } : {}}
      transition={exitDirection ? {
        type: 'tween',
        duration: 0.2,
        ease: 'easeOut'
      } : {
        type: 'spring',
        stiffness: 700,
        damping: 20,
      }}
    >
      {/* Dislike Indicator (Red - Left) */}
      <motion.div
        className="absolute left-8 top-1/4 pointer-events-none z-10"
        style={{ opacity: dislikeOpacity }}
      >
        <div className="bg-red-500 text-white px-8 py-4 rounded-2xl font-bold text-2xl shadow-2xl rotate-12 border-4 border-white">
          ✖ NOPE
        </div>
      </motion.div>

      {/* Like Indicator (Green - Right) */}
      <motion.div
        className="absolute right-8 top-1/4 pointer-events-none z-10"
        style={{ opacity: likeOpacity }}
      >
        <div className="bg-green-500 text-white px-8 py-4 rounded-2xl font-bold text-2xl shadow-2xl -rotate-12 border-4 border-white">
          ❤️ LIKE
        </div>
      </motion.div>

      {/* Full-screen Profile */}
      <div className={`h-full w-full ${genderBg} overflow-y-auto pt-4`}>
        {/* Header with Gradient */}
        <div className={`relative h-48 bg-gradient-to-br ${genderColor} overflow-hidden`}>
          <div className="absolute inset-0 bg-black opacity-20" />
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <h2 className="text-6xl font-bold text-white drop-shadow-lg mb-2">
              {name.name}
            </h2>
            <span className="px-4 py-1 bg-white bg-opacity-30 backdrop-blur-sm rounded-full text-white text-sm font-medium">
              Rank #{contextualRank || name.popularityRank}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 pb-32">
          {/* Meaning Section */}
          {enrichedData.meaning && (
            <div className="mb-6 p-6 bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl border border-purple-200 shadow-lg">
              <div className="flex items-center gap-2 mb-3">
                <BookOpen className="w-6 h-6 text-purple-600" />
                <h3 className="text-xl font-semibold text-purple-800">Meaning</h3>
                {enrichedData.enriched && (
                  <Sparkles className="w-5 h-5 text-green-600" />
                )}
              </div>
              <p className="text-xl italic text-gray-700">"{enrichedData.meaning}"</p>
              {enrichedData.culturalContext && (
                <p className="text-base text-gray-600 mt-3">{enrichedData.culturalContext}</p>
              )}
            </div>
          )}

          {/* Essential Info - Rank and Origin */}
          <div className="mb-6 p-6 bg-white rounded-2xl border border-gray-200 shadow-lg">
            <div className="grid grid-cols-2 gap-6">
              <div className="text-center">
                <Award className="w-12 h-12 text-yellow-500 mx-auto mb-3" />
                <div className="text-3xl font-bold text-gray-800">
                  #{contextualRank || name.popularityRank || 'N/A'}
                </div>
                <div className="text-sm text-gray-500 mt-1">Global Rank</div>
              </div>
              <div className="text-center">
                <Globe className="w-12 h-12 text-indigo-500 mx-auto mb-3" />
                <div className="text-2xl font-bold text-gray-800 capitalize">
                  {enrichedData.origin || name.origin || 'Unknown'}
                </div>
                <div className="text-sm text-gray-500 mt-1">Origin</div>
              </div>
            </div>
          </div>

          {/* Gender Section */}
          <div className="mb-6 p-6 bg-white rounded-2xl border border-gray-200 shadow-lg">
            <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Heart className="w-6 h-6 text-pink-500" />
              Gender Distribution
            </h3>
            <div className="flex gap-4 items-center">
              <div className="flex-1">
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-gray-600 font-medium">Male</span>
                  <span className="text-sm font-bold">{Math.round((genderData?.Male || 0) * 100)}%</span>
                </div>
                <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-blue-400 to-blue-600"
                       style={{ width: `${(genderData?.Male || 0) * 100}%` }} />
                </div>
              </div>
              <div className="flex-1">
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-gray-600 font-medium">Female</span>
                  <span className="text-sm font-bold">{Math.round((genderData?.Female || 0) * 100)}%</span>
                </div>
                <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-pink-400 to-pink-600"
                       style={{ width: `${(genderData?.Female || 0) * 100}%` }} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Fixed Bottom Action Buttons */}
        <div className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-lg border-t border-gray-200 p-6 flex justify-center items-center gap-8">
          {/* Dislike button */}
          <button
            onClick={handleDislikeClick}
            className={`flex items-center justify-center w-20 h-20 rounded-full transition-all duration-300 ${
              isDisliked
                ? 'bg-rose-500 border-4 border-rose-500 shadow-2xl'
                : 'bg-white border-4 border-rose-500 shadow-xl hover:shadow-2xl'
            } transform hover:scale-110 active:scale-95`}
            title={isDisliked ? 'Remove from hidden' : 'Pass on this name'}
          >
            <X className={`w-12 h-12 transition-all duration-300 ${
              isDisliked
                ? 'text-white stroke-[3.5px]'
                : 'text-rose-500 stroke-[3.5px]'
            }`} />
          </button>

          {/* Like button */}
          <button
            onClick={handleFavoriteClick}
            className={`flex items-center justify-center w-20 h-20 rounded-full transition-all duration-300 ${
              isFavorite
                ? 'bg-teal-400 border-4 border-teal-400 shadow-2xl'
                : 'bg-white border-4 border-teal-400 shadow-xl hover:shadow-2xl'
            } transform hover:scale-110 active:scale-95`}
            title={isFavorite ? 'Remove from favorites' : 'Love this name'}
          >
            <Heart className={`w-10 h-10 transition-all duration-300 ${
              isFavorite
                ? 'text-white fill-white stroke-[2.5px]'
                : 'text-teal-400 stroke-[2.5px]'
            }`} />
          </button>
        </div>

        {/* Swipe hint */}
        <div className="fixed top-20 left-0 right-0 text-center pointer-events-none">
          <p className="text-sm text-gray-500 bg-white/80 backdrop-blur-sm inline-block px-4 py-2 rounded-full">
            👈 Swipe or tap buttons 👉
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default SwipeableNameProfile;
