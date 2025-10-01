import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Heart, X, BookOpen, Tag, Globe } from 'lucide-react';
import { NameEntry } from '../services/nameService';
import favoritesService from '../services/favoritesService';
import enrichmentService from '../services/enrichmentService';

interface NameCardProps {
  name: NameEntry;
  onClick: (name: NameEntry) => void;
  onFavoriteToggle?: () => void;
  onDislikeToggle?: () => void;
  filterContext?: 'all' | 'male' | 'female'; // Current filter context
  contextualRank?: number; // Rank within the current filtered list
}

const NameCard: React.FC<NameCardProps> = ({ name, onClick, onFavoriteToggle, onDislikeToggle, filterContext = 'all', contextualRank }) => {
  const [isFavorite, setIsFavorite] = useState(false);
  const [isDisliked, setIsDisliked] = useState(false);
  const [meaning, setMeaning] = useState<string | undefined>(name.meaning);
  const [origin, setOrigin] = useState<string | undefined>(undefined);
  const [enriched, setEnriched] = useState(false);
  const [isFlying, setIsFlying] = useState(false);
  const [flyDirection, setFlyDirection] = useState<'left' | 'right' | null>(null);

  useEffect(() => {
    setIsFavorite(favoritesService.isFavorite(name.name));
    setIsDisliked(favoritesService.isDisliked(name.name));

    // Get enriched data from service
    const enrichedData = enrichmentService.getNameData(name.name);
    if (enrichedData) {
      setMeaning(enrichedData.meaning || name.meaning);
      setOrigin(enrichedData.origin);
      setEnriched(enrichedData.enriched || false);
    } else {
      setMeaning(name.meaning);
      setOrigin(undefined);
      setEnriched(false);
    }
  }, [name.name, name.meaning]);

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click

    // START ANIMATION FIRST (no delay!)
    setFlyDirection('right');
    setIsFlying(true);

    // Then update everything else in next tick
    requestAnimationFrame(() => {
      favoritesService.toggleFavorite(name.name);
      setIsFavorite(favoritesService.isFavorite(name.name));
      setIsDisliked(favoritesService.isDisliked(name.name));
      onFavoriteToggle?.();
    });

    // Clean up animation state after it completes
    setTimeout(() => {
      setIsFlying(false);
      setFlyDirection(null);
    }, 120);
  };

  const handleDislikeClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click

    // START ANIMATION FIRST (no delay!)
    setFlyDirection('left');
    setIsFlying(true);

    // Then update everything else in next tick
    requestAnimationFrame(() => {
      favoritesService.toggleDislike(name.name);
      setIsFavorite(favoritesService.isFavorite(name.name));
      setIsDisliked(favoritesService.isDisliked(name.name));
      onDislikeToggle?.();
    });

    // Clean up animation state after it completes
    setTimeout(() => {
      setIsFlying(false);
      setFlyDirection(null);
    }, 120);
  };
  const genderData = typeof name.gender === 'object' ? name.gender : null;
  const isMale = (genderData?.Male || 0) > (genderData?.Female || 0);
  const genderColor = isMale ? 'from-blue-400 to-blue-600' : 'from-pink-400 to-pink-600';
  const genderBg = isMale ? 'bg-blue-50' : 'bg-pink-50';
  const genderBorder = isMale ? 'border-blue-200' : 'border-pink-200';
  const genderIcon = isMale ? '♂' : '♀';

  // Determine what rank to display and how to label it
  const getDisplayRank = () => {
    // ALWAYS show the actual popularity rank from the database
    const rank = name.popularityRank || 999999;

    switch (filterContext) {
      case 'male':
        return `Boys #${rank}`;
      case 'female':
        return `Girls #${rank}`;
      case 'all':
      default:
        return `#${rank}`;
    }
  };

  // Calculate popularity percentage based on logarithmic scale for better distribution
  const calculatePopularityPercent = (rank: number) => {
    // Use a logarithmic scale that gives meaningful differences
    // Top 10: 90-100%, Top 100: 70-89%, Top 1000: 40-69%, etc.
    if (rank <= 10) {
      return Math.round(100 - (rank - 1) * 1); // 100% to 91%
    } else if (rank <= 100) {
      return Math.round(90 - (rank - 10) * 0.22); // 90% to 70%
    } else if (rank <= 1000) {
      return Math.round(70 - (rank - 100) * 0.033); // 70% to 40%
    } else if (rank <= 10000) {
      return Math.round(40 - (rank - 1000) * 0.0033); // 40% to 10%
    } else {
      return Math.max(1, Math.round(10 - (rank - 10000) * 0.0001)); // 10% to 1%
    }
  };

  // ALWAYS use actual rank for popularity percent calculation
  const rankForPopularity = name.popularityRank || 999999;
  const popularityPercent = calculatePopularityPercent(rankForPopularity);

  // Animation variants for flying cards - ultra fast and snappy
  const flyVariants = {
    initial: {
      x: 0,
      rotate: 0,
      opacity: 1,
      scale: 1
    },
    flyLeft: {
      x: -400,
      rotate: -30,
      opacity: 0,
      scale: 0.7,
      transition: { duration: 0.12, ease: "easeOut" }  // Super fast
    },
    flyRight: {
      x: 400,
      rotate: 30,
      opacity: 0,
      scale: 0.7,
      transition: { duration: 0.12, ease: "easeOut" }  // Super fast
    }
  };

  return (
    <motion.div
      onClick={() => onClick(name)}
      className={`relative overflow-hidden rounded-xl ${genderBg} border ${genderBorder}
                  hover:shadow-xl transform hover:scale-105
                  cursor-pointer group`}
      style={{ transition: isFlying ? 'none' : 'all 200ms' }}  // Disable CSS transitions during animation
      initial="initial"
      animate={isFlying ? (flyDirection === 'left' ? 'flyLeft' : 'flyRight') : 'initial'}
      variants={flyVariants}
    >
      {/* Gradient overlay - lighter on mobile */}
      <div className={`absolute inset-0 bg-gradient-to-br ${genderColor} opacity-5
                       group-hover:opacity-10 transition-opacity`} />

      {/* Sparkle animation on hover */}
      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <Sparkles className="w-4 h-4 text-yellow-400 animate-pulse" />
      </div>

      <div className="relative p-6">

        {/* Header with Left-aligned Rating */}
        <div className="mb-4">
          <div className="flex items-start justify-between mb-2">
            <div className={`px-3 py-1 rounded-full bg-gradient-to-r ${genderColor} text-white text-sm font-bold`}>
              {getDisplayRank()}
            </div>
          </div>
          <div className="text-center">
            <h3 className="text-2xl font-bold text-gray-800 flex justify-center items-center gap-2">
              {name.name}
              <span className={`text-xl font-medium bg-gradient-to-r ${genderColor}
                             bg-clip-text text-transparent`}>
                {genderIcon}
              </span>
            </h3>
            {meaning && (
              <div className="mt-3 px-3 py-2 bg-white/50 rounded-lg border border-white/80">
                <div className="flex items-center gap-1 justify-center">
                  <BookOpen className="w-3 h-3 text-gray-500" />
                  <span className="text-sm font-medium text-gray-700 italic">
                    "{meaning}"
                  </span>
                </div>
              </div>
            )}
            {origin && (
              <div className="mt-2 flex items-center justify-center gap-2">
                <div className="inline-flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-full border border-purple-200">
                  <Globe className="w-3 h-3 text-purple-600" />
                  <span className="text-xs font-semibold text-purple-700">
                    {origin}
                  </span>
                </div>
                {enriched && (
                  <div className="inline-flex items-center px-2 py-1 bg-green-50 rounded-full border border-green-200" title="AI Enriched">
                    <Sparkles className="w-3 h-3 text-green-600" />
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Simplified Stats - Only Popularity Score */}
        <div className="mb-4 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/60 rounded-full border border-gray-200">
            <span className="text-sm font-medium text-gray-600">Popularity</span>
            <span className={`text-lg font-bold bg-gradient-to-r ${genderColor} bg-clip-text text-transparent`}>
              {Math.round(popularityPercent)}%
            </span>
          </div>
        </div>
      </div>

      {/* Tinder-style action buttons */}
      <div className="absolute bottom-4 left-0 right-0 flex justify-between items-center px-4">
        {/* Dislike button - Tinder Nope style */}
        <button
          onClick={handleDislikeClick}
          className={`flex items-center justify-center w-16 h-16 rounded-full transition-all duration-300 ${
            isDisliked
              ? 'bg-rose-500 border-4 border-rose-500 shadow-xl'
              : 'bg-white border-4 border-rose-500 shadow-lg hover:shadow-xl'
          } transform hover:scale-110 active:scale-95`}
          title={isDisliked ? 'Remove from hidden' : 'Pass on this name'}
        >
          <X className={`w-9 h-9 transition-all duration-300 ${
            isDisliked
              ? 'text-white stroke-[3.5px]'
              : 'text-rose-500 stroke-[3.5px]'
          }`} />
        </button>

        {/* Like button - Tinder Like style */}
        <button
          onClick={handleFavoriteClick}
          className={`flex items-center justify-center w-16 h-16 rounded-full transition-all duration-300 ${
            isFavorite
              ? 'bg-teal-400 border-4 border-teal-400 shadow-xl'
              : 'bg-white border-4 border-teal-400 shadow-lg hover:shadow-xl'
          } transform hover:scale-110 active:scale-95`}
          title={isFavorite ? 'Remove from favorites' : 'Love this name'}
        >
          <Heart className={`w-8 h-8 transition-all duration-300 ${
            isFavorite
              ? 'text-white fill-white stroke-[2.5px]'
              : 'text-teal-400 stroke-[2.5px]'
          }`} />
        </button>
      </div>
    </motion.div>
  );
};

export default NameCard;