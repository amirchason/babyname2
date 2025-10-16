import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, X, Globe, BookOpen, TrendingUp, Pin } from 'lucide-react';
import { NameEntry } from '../services/nameService';
import favoritesService from '../services/favoritesService';
import enrichmentService from '../services/enrichmentService';
import { useToast } from '../contexts/ToastContext';

interface NameCardCompactProps {
  name: NameEntry;
  onClick: (name: NameEntry) => void;
  onFavoriteToggle?: () => void;
  onDislikeToggle?: () => void;
  filterContext?: 'all' | 'male' | 'female' | 'unisex';
  likeCount?: number;
  isPinned?: boolean;
  onPin?: () => void;
  showPinOption?: boolean;
}

const NameCardCompact: React.FC<NameCardCompactProps> = ({
  name,
  onClick,
  onFavoriteToggle,
  onDislikeToggle,
  filterContext = 'all',
  likeCount = 0,
  isPinned = false,
  onPin,
  showPinOption = false
}) => {
  const [isFavorite, setIsFavorite] = useState(false);
  const [isDisliked, setIsDisliked] = useState(false);
  const [meaning, setMeaning] = useState<string | undefined>(name.meaning);
  const [origin, setOrigin] = useState<string | undefined>(undefined);
  const [isFlying, setIsFlying] = useState(false);
  const [flyDirection, setFlyDirection] = useState<'left' | 'right' | null>(null);
  const [showContextMenu, setShowContextMenu] = useState(false);
  const [longPressTimer, setLongPressTimer] = useState<NodeJS.Timeout | null>(null);
  const [autoDismissTimer, setAutoDismissTimer] = useState<NodeJS.Timeout | null>(null);
  const toast = useToast();

  useEffect(() => {
    setIsFavorite(favoritesService.isFavorite(name.name));
    setIsDisliked(favoritesService.isDisliked(name.name));

    // Get enriched data
    const enrichedData = enrichmentService.getNameData(name.name);
    if (enrichedData) {
      setMeaning(name.meaningShort || enrichedData.meaning || name.meaning);
      // FIX: Use originGroup (consolidated) to match filter logic
      setOrigin((name as any).originGroup || name.origin || enrichedData.origin);
    } else {
      setMeaning(name.meaningShort || name.meaning);
      // FIX: Use originGroup (consolidated) to match filter logic
      setOrigin((name as any).originGroup || name.origin);
    }
  }, [name.name, name.meaning, name.meaningShort, name.origin]);

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
    e.stopPropagation();

    if (isFavorite && likeCount !== undefined) {
      onFavoriteToggle?.();
      return;
    }

    setFlyDirection('right');
    setIsFlying(true);

    requestAnimationFrame(() => {
      favoritesService.toggleFavorite(name.name);
      setIsFavorite(favoritesService.isFavorite(name.name));
      setIsDisliked(favoritesService.isDisliked(name.name));
      onFavoriteToggle?.();
    });

    setTimeout(() => {
      setIsFlying(false);
      setFlyDirection(null);
    }, 120);
  };

  const handleDislikeClick = (e: React.MouseEvent) => {
    e.stopPropagation();

    // On favorites page with like counter: decrement instead of removing
    if (isFavorite && likeCount !== undefined) {
      const result = favoritesService.decrementLikeCount(name.name);

      // If removed (likeCount was 1), animate fly-away
      if (result.removed) {
        setFlyDirection('left');
        setIsFlying(true);

        requestAnimationFrame(() => {
          setIsFavorite(false);
          onDislikeToggle?.();
        });

        setTimeout(() => {
          setIsFlying(false);
          setFlyDirection(null);
        }, 120);
      } else {
        // Just decrement, no animation
        onDislikeToggle?.();
      }
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

  const handleTouchStart = (e: React.TouchEvent) => {
    if (!showPinOption) return;

    const timer = setTimeout(() => {
      setShowContextMenu(true);
      // Add haptic feedback on mobile
      if ('vibrate' in navigator) {
        navigator.vibrate(50);
      }
    }, 1000); // 1 second long press

    setLongPressTimer(timer);
  };

  const handleTouchEnd = () => {
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      setLongPressTimer(null);
    }
  };

  const handlePinClick = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();

    const result = favoritesService.togglePin(name.name);
    setShowContextMenu(false);

    if (!result.success && result.message) {
      toast.warning(result.message, 5000);
    } else if (result.success) {
      if (result.pinned) {
        toast.success('Name pinned to top!', 2000);
      } else {
        toast.success('Name unpinned', 2000);
      }
      onPin?.();
    }
  };

  const genderData = typeof name.gender === 'object' ? name.gender : null;
  const isMale = (genderData?.Male || 0) > (genderData?.Female || 0);
  const genderColor = isMale ? 'text-blue-600' : 'text-pink-600';
  const genderBg = isMale ? 'bg-blue-50' : 'bg-pink-50';
  const genderIcon = isMale ? '♂' : '♀';

  const getDisplayRank = () => {
    const rank = name.popularityRank || 999999;
    switch (filterContext) {
      case 'male':
        return `#${rank} Boys`;
      case 'female':
        return `#${rank} Girls`;
      case 'unisex':
        return `#${rank} Unisex`;
      default:
        return `#${rank}`;
    }
  };

  // Animation variants
  const flyVariants = {
    initial: { x: 0, opacity: 1 },
    flyLeft: { x: -300, opacity: 0, transition: { duration: 0.12 } },
    flyRight: { x: 300, opacity: 0, transition: { duration: 0.12 } }
  };

  // Truncate meaning if too long
  const truncateMeaning = (text: string | undefined, maxLength: number = 60) => {
    if (!text) return '';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  return (
    <motion.div
      onClick={() => onClick(name)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      className="group relative flex items-center justify-between gap-4 px-6 py-4 bg-white border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-all"
      style={{ transition: isFlying ? 'none' : 'all 150ms' }}
      initial="initial"
      animate={isFlying ? (flyDirection === 'left' ? 'flyLeft' : 'flyRight') : 'initial'}
      variants={flyVariants}
    >
      {/* Left: Dislike button */}
      <button
        onClick={handleDislikeClick}
        className={`flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-full transition-all ${
          isDisliked
            ? 'bg-red-50 border-2 border-red-300'
            : 'bg-transparent border-2 border-gray-200 hover:bg-red-50 hover:border-red-300'
        }`}
        title={isDisliked ? 'Remove from hidden' : 'Pass on this name'}
      >
        <X className={`w-4 h-4 ${isDisliked ? 'text-red-500' : 'text-gray-400'}`} strokeWidth={2.5} />
      </button>

      {/* Center: Name - Same font as cards */}
      <div className="flex-1 text-center relative">
        <div className="flex items-center justify-center gap-2">
          {isPinned && (
            <Pin className="w-4 h-4 text-yellow-500 fill-yellow-500" />
          )}
          <h3 className={`text-3xl font-thin ${genderColor}`}>
            {name.name}
          </h3>
        </div>
      </div>

      {/* Right: Like button */}
      <button
        onClick={handleFavoriteClick}
        className={`relative flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-full transition-all ${
          isFavorite
            ? 'bg-pink-50 border-2 border-pink-300'
            : 'bg-transparent border-2 border-gray-200 hover:bg-pink-50 hover:border-pink-300'
        }`}
        title={isFavorite ? 'Remove from favorites' : 'Love this name'}
      >
        <Heart
          className={`w-4 h-4 ${isFavorite ? 'text-pink-500 fill-pink-500' : 'text-gray-400'}`}
          strokeWidth={2.5}
        />
        {(isFavorite && likeCount !== undefined && likeCount > 0) && (
          <span className="absolute -top-1 -right-1 bg-pink-500 text-white text-[9px] font-bold rounded-full w-5 h-5 flex items-center justify-center shadow-sm">
            {likeCount > 9 ? '9+' : likeCount}
          </span>
        )}
      </button>

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
              <Pin className="w-6 h-6 text-yellow-500" />
              {isPinned ? 'Unpin from Top' : 'Pin to Top'}
            </button>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default NameCardCompact;
