/**
 * Blog Name Card
 * Interactive name display for blog posts matching NameCard design standards
 * - 52px name font size
 * - 24px meaning font size
 * - Gender-based colors (blue/pink gradients)
 * - Popularity rank badge
 * - Heart + X buttons
 * - Fly-away animations
 * - Sparkle effects
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Heart, X, BookOpen, Globe } from 'lucide-react';
import favoritesService from '../services/favoritesService';
import nameService from '../services/nameService';
import NameDetailModal from './NameDetailModal';
import { NameEntry } from '../services/nameService';

interface BlogNameCardProps {
  name: string;
  pronunciation?: string;
  origin?: string;
  meaning?: string;
  description?: string;
}

const BlogNameCard: React.FC<BlogNameCardProps> = ({
  name,
  pronunciation,
  origin,
  meaning,
  description,
}) => {
  const [isFavorited, setIsFavorited] = useState(false);
  const [isDisliked, setIsDisliked] = useState(false);
  const [isFlying, setIsFlying] = useState(false);
  const [flyDirection, setFlyDirection] = useState<'left' | 'right' | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [nameData, setNameData] = useState<NameEntry | null>(null);

  useEffect(() => {
    setIsFavorited(favoritesService.isFavorite(name));
    setIsDisliked(favoritesService.isDisliked(name));

    // Get full name data from database for modal and styling
    const fetchNameData = async () => {
      const fetchedNameData = await nameService.getNameDetails(name);
      if (fetchedNameData) {
        setNameData(fetchedNameData);
      }
    };
    fetchNameData();
  }, [name]);

  const handleCardClick = () => {
    if (nameData) {
      setShowModal(true);
    }
  };

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click

    // START ANIMATION FIRST (no delay!)
    setFlyDirection('right');
    setIsFlying(true);

    // Then update everything else in next tick
    requestAnimationFrame(() => {
      favoritesService.toggleFavorite(name);
      setIsFavorited(favoritesService.isFavorite(name));
      setIsDisliked(favoritesService.isDisliked(name));
    });

    // Clean up animation state after it completes
    setTimeout(() => {
      setIsFlying(false);
      setFlyDirection(null);
    }, 120);
  };

  const handleDislikeClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click

    // Default behavior: toggle dislike with animation
    setFlyDirection('left');
    setIsFlying(true);

    requestAnimationFrame(() => {
      favoritesService.toggleDislike(name);
      setIsFavorited(favoritesService.isFavorite(name));
      setIsDisliked(favoritesService.isDisliked(name));
    });

    setTimeout(() => {
      setIsFlying(false);
      setFlyDirection(null);
    }, 120);
  };

  // Determine gender from nameData for color coding
  const genderData = nameData && typeof nameData.gender === 'object' ? nameData.gender : null;
  const isMale = genderData ? (genderData.Male || 0) > (genderData.Female || 0) : true;
  const genderColor = isMale ? 'from-blue-400 to-blue-600' : 'from-pink-400 to-pink-600';
  const genderBg = isMale ? 'bg-blue-50' : 'bg-pink-50';
  const genderBorder = isMale ? 'border-blue-200' : 'border-pink-200';
  const genderIcon = isMale ? '♂' : '♀';

  // Get rank from database, fallback to high number if not found
  const rank = nameData?.popularityRank || 999999;

  // Calculate popularity percentage based on logarithmic scale
  const calculatePopularityPercent = (rank: number) => {
    if (rank <= 10) {
      return Math.round(100 - (rank - 1) * 1);
    } else if (rank <= 100) {
      return Math.round(90 - (rank - 10) * 0.22);
    } else if (rank <= 1000) {
      return Math.round(70 - (rank - 100) * 0.033);
    } else if (rank <= 10000) {
      return Math.round(40 - (rank - 1000) * 0.0033);
    } else {
      return Math.max(1, Math.round(10 - (rank - 10000) * 0.0001));
    }
  };

  const popularityPercent = calculatePopularityPercent(rank);

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
      transition: { duration: 0.12 }
    },
    flyRight: {
      x: 400,
      rotate: 30,
      opacity: 0,
      scale: 0.7,
      transition: { duration: 0.12 }
    }
  };

  return (
    <>
      <motion.div
        onClick={handleCardClick}
        className={`relative overflow-hidden rounded-xl ${genderBg} border ${genderBorder}
                    hover:shadow-xl transform hover:scale-105
                    cursor-pointer group my-6`}
        style={{ transition: isFlying ? 'none' : 'all 200ms' }}
        initial="initial"
        animate={isFlying ? (flyDirection === 'left' ? 'flyLeft' : 'flyRight') : 'initial'}
        variants={flyVariants}
      >
        {/* Gradient overlay */}
        <div className={`absolute inset-0 bg-gradient-to-br ${genderColor} opacity-5
                         group-hover:opacity-10 transition-opacity`} />

        {/* Sparkle animation on hover */}
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <Sparkles className="w-3.5 h-3.5 text-yellow-400/60 animate-pulse" strokeWidth={1.5} />
        </div>

        {/* Rank Badge - Absolute Position Top-Left */}
        <div className="absolute top-2 left-2 z-10">
          <div className={`px-2.5 py-0.5 rounded-full border border-gray-200 bg-white/90 text-gray-600 text-xs font-light shadow-sm`}>
            #{rank}
          </div>
        </div>

        <div className="relative p-1.5 pb-12">
          {/* Name - Very Thin, Much Bigger (52px matching NameCard) */}
          <div className="mb-1 pt-6 text-center">
            <h3 className="text-[52px] font-thin text-gray-800 flex justify-center items-center gap-2">
              {name}
              <span className={`text-[52px] font-thin bg-gradient-to-r ${genderColor}
                             bg-clip-text text-transparent`}>
                {genderIcon}
              </span>
            </h3>
          </div>

          {/* Pronunciation - if provided */}
          {pronunciation && (
            <div className="text-center">
              <span className="text-sm text-gray-500 italic">
                {pronunciation}
              </span>
            </div>
          )}

          {/* Meaning - Much Bigger Font (24px matching NameCard) */}
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
            {origin && (
              <div className="inline-flex items-center gap-1 px-3 py-0.5 bg-white/40 rounded-full border border-gray-200">
                <Globe className="w-2.5 h-2.5 text-gray-500" strokeWidth={1.5} />
                <span className="text-[11px] font-light text-gray-600">
                  {origin}
                </span>
              </div>
            )}

            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 bg-white/40 rounded-full border border-gray-200">
              <span className="text-xs font-light text-gray-600">Popularity</span>
              <span className={`text-base font-medium bg-gradient-to-r ${genderColor} bg-clip-text text-transparent`}>
                {Math.round(popularityPercent)}%
              </span>
            </div>
          </div>

          {/* Description - if provided, shown smaller below */}
          {description && (
            <div className="mt-3 px-4 text-center">
              <p className="text-sm text-gray-600 leading-relaxed">
                {description}
              </p>
            </div>
          )}
        </div>

        {/* Minimalistic action buttons - matching NameCard */}
        <div className="absolute bottom-2 left-0 right-0 flex justify-between items-center px-4">
          {/* Dislike button */}
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

          {/* Like button */}
          <button
            onClick={handleFavoriteClick}
            className={`relative flex items-center justify-center w-9 h-9 rounded-full transition-all duration-300 ${
              isFavorited
                ? 'bg-pink-50 border-2 border-pink-300 shadow-md'
                : 'bg-white border border-gray-200 shadow-sm hover:shadow-md hover:border-pink-200'
            } transform hover:scale-105 active:scale-95`}
            title={isFavorited ? 'Remove from favorites' : 'Love this name'}
          >
            <Heart className={`w-4 h-4 transition-all duration-300 ${
              isFavorited
                ? 'text-pink-400 fill-pink-400 stroke-[1.5]'
                : 'text-gray-400 hover:text-pink-400 stroke-[1.5]'
            }`} />
          </button>
        </div>
      </motion.div>

      {/* Name Detail Modal */}
      {showModal && nameData && (
        <NameDetailModal
          name={nameData}
          onClose={() => setShowModal(false)}
        />
      )}
    </>
  );
};

export default BlogNameCard;
