import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Heart, X, BookOpen, Tag, Globe } from 'lucide-react';
import { NameEntry } from '../services/nameService';
import favoritesService from '../services/favoritesService';
import enrichmentService from '../services/enrichmentService';
import { useToast } from '../contexts/ToastContext';

interface NameCardProps {
  name: NameEntry;
  onClick?: (name: NameEntry) => void;
  onFavoriteToggle?: () => void;
  onDislikeToggle?: () => void;
  filterContext?: 'all' | 'male' | 'female' | 'unisex'; // Current filter context
  contextualRank?: number; // Rank within the current filtered list
  isPinned?: boolean;
  onPin?: () => void;
  showPinOption?: boolean;
  likeCount?: number; // Number of likes for this name
  compact?: boolean; // Compact display mode for blog posts
}

const NameCard: React.FC<NameCardProps> = ({
  name,
  onClick,
  onFavoriteToggle,
  onDislikeToggle,
  filterContext = 'all',
  contextualRank,
  isPinned = false,
  onPin,
  showPinOption = false,
  likeCount = 0,
  compact = false
}) => {
  const [isFavorite, setIsFavorite] = useState(false);
  const [isDisliked, setIsDisliked] = useState(false);
  const [meaning, setMeaning] = useState<string | undefined>(name.meaning);
  const [origin, setOrigin] = useState<string | undefined>(undefined);
  const [enriched, setEnriched] = useState(false);
  const [isFlying, setIsFlying] = useState(false);
  const [flyDirection, setFlyDirection] = useState<'left' | 'right' | null>(null);
  const [showContextMenu, setShowContextMenu] = useState(false);
  const [longPressTimer, setLongPressTimer] = useState<NodeJS.Timeout | null>(null);
  const [autoDismissTimer, setAutoDismissTimer] = useState<NodeJS.Timeout | null>(null);
  const toast = useToast();

  useEffect(() => {
    setIsFavorite(favoritesService.isFavorite(name.name));
    setIsDisliked(favoritesService.isDisliked(name.name));

    // Get enriched data from service
    const enrichedData = enrichmentService.getNameData(name.name);
    if (enrichedData) {
      // Prioritize short meaning for cards, fall back to regular meaning
      setMeaning(name.meaningShort || enrichedData.meaning || name.meaning);
      // FIX: Use originGroup (consolidated) to match filter logic
      setOrigin((name as any).originGroup || name.origin || enrichedData.origin);
      setEnriched(enrichedData.enriched || name.originProcessed || name.meaningProcessed || false);
    } else {
      // Use short meaning if available, otherwise regular meaning
      setMeaning(name.meaningShort || name.meaning);
      // FIX: Use originGroup (consolidated) to match filter logic
      setOrigin((name as any).originGroup || name.origin);
      setEnriched(name.originProcessed || name.meaningProcessed || false);
    }
  }, [name.name, name.meaning, name.meaningShort, name.origin, name.originProcessed, name.meaningProcessed]);

  // Auto-dismiss context menu after 5 seconds and handle global clicks
  useEffect(() => {
    if (showContextMenu) {
      // Auto-dismiss timer
      const timer = setTimeout(() => {
        setShowContextMenu(false);
      }, 5000); // 5 seconds

      setAutoDismissTimer(timer);

      // Global click handler to dismiss on any click
      const handleGlobalClick = () => {
        setShowContextMenu(false);
      };

      // Add listener with a small delay to prevent immediate dismissal
      setTimeout(() => {
        document.addEventListener('click', handleGlobalClick);
      }, 100);

      return () => {
        if (timer) clearTimeout(timer);
        document.removeEventListener('click', handleGlobalClick);
      };
    } else {
      // Clear timer when menu is closed
      if (autoDismissTimer) {
        clearTimeout(autoDismissTimer);
        setAutoDismissTimer(null);
      }
    }
  }, [showContextMenu]);

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click

    // If already a favorite and we have a like counter (on favorites page), just increment
    if (isFavorite && likeCount !== undefined) {
      onFavoriteToggle?.();
      return;
    }

    // In compact mode, skip animation
    if (compact) {
      favoritesService.toggleFavorite(name.name);
      setIsFavorite(favoritesService.isFavorite(name.name));
      setIsDisliked(favoritesService.isDisliked(name.name));
      onFavoriteToggle?.();
      return;
    }

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

    // On favorites page with like counter: decrement instead of removing
    if (isFavorite && likeCount !== undefined) {
      const result = favoritesService.decrementLikeCount(name.name);

      // If removed (likeCount was 1), animate fly-away (unless compact mode)
      if (result.removed) {
        if (!compact) {
          setFlyDirection('left');
          setIsFlying(true);
        }

        requestAnimationFrame(() => {
          setIsFavorite(false);
          onDislikeToggle?.();
        });

        if (!compact) {
          setTimeout(() => {
            setIsFlying(false);
            setFlyDirection(null);
          }, 120);
        }
      } else {
        // Just decrement, no animation
        onDislikeToggle?.();
      }
      return;
    }

    // In compact mode, skip animation
    if (compact) {
      favoritesService.toggleDislike(name.name);
      setIsFavorite(favoritesService.isFavorite(name.name));
      setIsDisliked(favoritesService.isDisliked(name.name));
      onDislikeToggle?.();
      return;
    }

    // Default behavior: toggle dislike with animation
    setFlyDirection('left');
    setIsFlying(true);

    requestAnimationFrame(() => {
      favoritesService.toggleDislike(name.name);
      setIsFavorite(favoritesService.isFavorite(name.name));
      setIsDisliked(favoritesService.isDisliked(name.name));
      onDislikeToggle?.();
    });

    setTimeout(() => {
      setIsFlying(false);
      setFlyDirection(null);
    }, 120);
  };

  // Long press handlers for pin functionality
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!showPinOption) return;
    e.preventDefault(); // Prevent text selection

    const timer = setTimeout(() => {
      setShowContextMenu(true);
    }, 1000); // 1 second long press

    setLongPressTimer(timer);
  };

  const handleMouseUp = () => {
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      setLongPressTimer(null);
    }
  };

  const handleMouseLeave = () => {
    handleMouseUp();
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (!showPinOption) return;

    const timer = setTimeout(() => {
      setShowContextMenu(true);
      // Add haptic feedback on mobile
      if ('vibrate' in navigator) {
        navigator.vibrate(50);
      }
    }, 1000);

    setLongPressTimer(timer);
  };

  const handleTouchEnd = () => {
    handleMouseUp();
  };

  const handlePinClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    const result = favoritesService.togglePin(name.name);
    setShowContextMenu(false);

    if (!result.success && result.message) {
      // Show warning toast when limit is reached
      toast.warning(result.message, 5000);
    } else if (result.success) {
      // Optionally show success message
      if (result.pinned) {
        toast.success('Name pinned to top!', 2000);
      } else {
        toast.info('Name unpinned', 2000);
      }
      onPin?.();
    }
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
      case 'unisex':
        return `Unisex #${rank}`;
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
      transition: { duration: 0.12 }  // Super fast
    },
    flyRight: {
      x: 400,
      rotate: 30,
      opacity: 0,
      scale: 0.7,
      transition: { duration: 0.12 }  // Super fast
    }
  };

  // COMPACT MODE - Smaller cards for blog lists
  if (compact) {
    return (
      <motion.div
        onClick={onClick ? () => onClick(name) : undefined}
        className={`relative overflow-hidden rounded-lg ${genderBg} border ${genderBorder}
                    hover:shadow-lg transform hover:scale-102 transition-all duration-200
                    ${onClick ? 'cursor-pointer' : ''} group h-full flex flex-col`}
      >
        {/* Gradient overlay */}
        <div className={`absolute inset-0 bg-gradient-to-br ${genderColor} opacity-5
                         group-hover:opacity-10 transition-opacity`} />

        <div className="relative p-3 flex-1 flex flex-col">
          {/* Name with gender icon */}
          <div className="mb-2 text-center">
            <h3 className="text-xl font-semibold text-gray-800 flex justify-center items-center gap-1">
              {name.name}
              <span className={`text-lg bg-gradient-to-r ${genderColor} bg-clip-text text-transparent`}>
                {genderIcon}
              </span>
            </h3>
          </div>

          {/* Meaning */}
          {meaning && (
            <div className="mb-2 flex-1">
              <p className="text-xs text-gray-600 italic text-center line-clamp-2">
                "{meaning}"
              </p>
            </div>
          )}

          {/* Origin */}
          {(origin || name.origins) && (
            <div className="text-center mb-2">
              <span className="text-[10px] text-gray-500">
                {name.origins ? name.origins.slice(0, 2).join(', ') : origin}
              </span>
            </div>
          )}

          {/* Action buttons - Compact - Bigger and spread apart */}
          <div className="flex justify-between items-center mt-auto pt-2">
            <button
              onClick={handleDislikeClick}
              className={`flex items-center justify-center w-10 h-10 rounded-full transition-all ${
                isDisliked
                  ? 'bg-red-50 border-2 border-red-300 shadow-md'
                  : 'bg-white border-2 border-gray-200 hover:border-red-300 shadow-sm hover:shadow-md'
              } transform hover:scale-110 active:scale-95`}
              title="Pass"
            >
              <X className={`w-5 h-5 ${isDisliked ? 'text-red-500' : 'text-gray-400 hover:text-red-500'}`} strokeWidth={2} />
            </button>

            <button
              onClick={handleFavoriteClick}
              className={`flex items-center justify-center w-10 h-10 rounded-full transition-all ${
                isFavorite
                  ? 'bg-pink-50 border-2 border-pink-300 shadow-md'
                  : 'bg-white border-2 border-gray-200 hover:border-pink-300 shadow-sm hover:shadow-md'
              } transform hover:scale-110 active:scale-95`}
              title="Like"
            >
              <Heart className={`w-5 h-5 ${
                isFavorite ? 'text-pink-500 fill-pink-500' : 'text-gray-400 hover:text-pink-500'
              }`} strokeWidth={2} />
            </button>
          </div>
        </div>
      </motion.div>
    );
  }

  // FULL MODE - Large cards for main pages
  return (
    <motion.div
      onClick={onClick ? () => onClick(name) : undefined}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      className={`relative overflow-hidden rounded-xl ${genderBg} border ${genderBorder}
                  hover:shadow-xl transform hover:scale-105
                  ${onClick ? 'cursor-pointer' : ''} group`}
      style={{ transition: (isFlying && !compact) ? 'none' : 'all 200ms' }}  // Disable CSS transitions during animation
      initial="initial"
      animate={(isFlying && !compact) ? (flyDirection === 'left' ? 'flyLeft' : 'flyRight') : 'initial'}
      variants={compact ? {} : flyVariants}
    >
      {/* Gradient overlay - lighter on mobile */}
      <div className={`absolute inset-0 bg-gradient-to-br ${genderColor} opacity-5
                       group-hover:opacity-10 transition-opacity`} />

      {/* Sparkle animation on hover */}
      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <Sparkles className="w-3.5 h-3.5 text-yellow-400/60 animate-pulse" strokeWidth={1.5} />
      </div>

      {/* Rank Badge - Absolute Position Top-Left */}
      <div className="absolute top-2 left-2 z-10">
        <div className={`px-2.5 py-0.5 rounded-full border border-gray-200 bg-white/90 text-gray-600 text-xs font-light shadow-sm`}>
          {getDisplayRank()}
        </div>
      </div>

      <div className="relative p-1.5 pb-12">
        {/* Name - Very Thin, Much Bigger */}
        <div className="mb-1 pt-6 text-center">
          <h3 className="text-[52px] font-thin text-gray-800 flex justify-center items-center gap-2">
            {name.name}
            <span className={`text-[52px] font-thin bg-gradient-to-r ${genderColor}
                           bg-clip-text text-transparent`}>
              {genderIcon}
            </span>
          </h3>
        </div>

        {/* Meaning - Much Bigger Font */}
        {meaning && (
          <div className="mt-2 px-2.5 py-0 bg-white/30 rounded-lg border border-white/50">
            <div className="flex items-center gap-1 justify-center py-1">
              <BookOpen className="w-3 h-3 text-gray-400" strokeWidth={1.5} />
              <span className="text-[24px] font-light text-gray-600 italic">
                "{meaning}"
              </span>
            </div>
          </div>
        )}

        {/* Origin & Popularity - Same Line */}
        <div className="mt-2 flex items-center justify-center gap-3 flex-wrap">
          {(origin || name.origins) && (
            <div className="inline-flex items-center gap-1 px-3 py-0.5 bg-white/40 rounded-full border border-gray-200">
              <Globe className="w-2.5 h-2.5 text-gray-500" strokeWidth={1.5} />
              <span className="text-[11px] font-light text-gray-600">
                {name.origins ? name.origins.join(' • ') : origin}
              </span>
              {enriched && (
                <Sparkles className="w-2.5 h-2.5 text-gray-500 ml-1" strokeWidth={1.5} />
              )}
            </div>
          )}

          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 bg-white/40 rounded-full border border-gray-200">
            <span className="text-xs font-light text-gray-600">Popularity</span>
            <span className={`text-base font-medium bg-gradient-to-r ${genderColor} bg-clip-text text-transparent`}>
              {Math.round(popularityPercent)}%
            </span>
          </div>
        </div>
      </div>

      {/* Minimalistic action buttons */}
      <div className="absolute bottom-2 left-0 right-0 flex justify-between items-center px-4">
        {/* Dislike button - Smaller */}
        <button
          onClick={handleDislikeClick}
          className={`flex items-center justify-center w-9 h-9 rounded-full transition-all duration-300 ${
            isDisliked
              ? 'bg-red-50 border-2 border-red-300 shadow-md'
              : 'bg-white border border-gray-200 shadow-sm hover:shadow-md hover:border-red-200'
          } transform hover:scale-105 active:scale-95`}
          title={isDisliked ? 'Remove from hidden' : 'Pass on this name'}
        >
          <X className={`w-4 h-4 transition-all duration-300 ${
            isDisliked
              ? 'text-red-400 stroke-[1.5]'
              : 'text-gray-400 hover:text-red-400 stroke-[1.5]'
          }`} />
        </button>

        {/* Like button - Smaller */}
        <button
          onClick={handleFavoriteClick}
          className={`relative flex items-center justify-center w-9 h-9 rounded-full transition-all duration-300 ${
            isFavorite
              ? 'bg-pink-50 border-2 border-pink-300 shadow-md'
              : 'bg-white border border-gray-200 shadow-sm hover:shadow-md hover:border-pink-200'
          } transform hover:scale-105 active:scale-95`}
          title={isFavorite ? 'Remove from favorites' : 'Love this name'}
        >
          <Heart className={`w-4 h-4 transition-all duration-300 ${
            isFavorite
              ? 'text-pink-400 fill-pink-400 stroke-[1.5]'
              : 'text-gray-400 hover:text-pink-400 stroke-[1.5]'
          }`} />
          {(isFavorite && likeCount !== undefined) && (
            <span className="absolute -top-1 -right-1 bg-pink-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center shadow-md">
              {likeCount > 99 ? '99+' : (likeCount || 1)}
            </span>
          )}
        </button>
      </div>

      {/* Pin indicator - Position next to rank */}
      {isPinned && (
        <div className="absolute top-2 left-16 bg-yellow-400/90 p-1 rounded-full shadow-md z-10">
          <svg className="w-3.5 h-3.5 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" />
          </svg>
        </div>
      )}

      {/* Context menu for pin/unpin */}
      {showContextMenu && (
        <div
          className="absolute inset-0 bg-black/20 flex items-center justify-center z-50"
          onClick={(e) => {
            e.stopPropagation();
            setShowContextMenu(false);
          }}
        >
          <div
            className="bg-white rounded-lg shadow-xl p-4 mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={handlePinClick}
              className="flex items-center gap-3 px-6 py-3 text-lg font-medium text-gray-700 hover:bg-yellow-50 rounded-lg transition-colors w-full"
            >
              <svg className="w-6 h-6 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                <path d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" />
              </svg>
              {isPinned ? 'Unpin from Top' : 'Pin to Top'}
            </button>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default React.memo(NameCard);