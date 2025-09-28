import React, { useState, useEffect } from 'react';
import { Sparkles, Heart, X } from 'lucide-react';
import { NameEntry } from '../services/nameService';
import favoritesService from '../services/favoritesService';

interface NameCardProps {
  name: NameEntry;
  onClick: (name: NameEntry) => void;
  onFavoriteToggle?: () => void;
  onDislikeToggle?: () => void;
}

const NameCard: React.FC<NameCardProps> = ({ name, onClick, onFavoriteToggle, onDislikeToggle }) => {
  const [isFavorite, setIsFavorite] = useState(false);
  const [isDisliked, setIsDisliked] = useState(false);

  useEffect(() => {
    setIsFavorite(favoritesService.isFavorite(name.name));
    setIsDisliked(favoritesService.isDisliked(name.name));
  }, [name.name]);

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click
    const newState = favoritesService.toggleFavorite(name.name);
    setIsFavorite(newState);
    if (newState) setIsDisliked(false); // Remove from dislikes if favorited
    onFavoriteToggle?.();
  };

  const handleDislikeClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click
    const newState = favoritesService.toggleDislike(name.name);
    setIsDisliked(newState);
    if (newState) setIsFavorite(false); // Remove from favorites if disliked
    onDislikeToggle?.();
  };
  const isMale = (name.gender.Male || 0) > (name.gender.Female || 0);
  const genderColor = isMale ? 'from-blue-400 to-blue-600' : 'from-pink-400 to-pink-600';
  const genderBg = isMale ? 'bg-blue-50' : 'bg-pink-50';
  const genderBorder = isMale ? 'border-blue-200' : 'border-pink-200';
  const genderIcon = isMale ? '♂' : '♀';

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

  const popularityPercent = calculatePopularityPercent(name.popularityRank);

  return (
    <div
      onClick={() => onClick(name)}
      className={`relative overflow-hidden rounded-xl ${genderBg} border ${genderBorder}
                  hover:shadow-xl transform hover:scale-105
                  transition-all duration-200 cursor-pointer group`}
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
              #{name.popularityRank}
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
            {(name as any).abbreviations && (name as any).abbreviations.length > 0 && (
              <div className="mt-1">
                <span className="text-sm text-gray-500">
                  ({(name as any).abbreviations.join(', ')})
                </span>
              </div>
            )}
            {name.meaning && (
              <div className="mt-2">
                <span className="text-sm text-gray-600 italic">
                  {name.meaning}
                </span>
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
      <div className="absolute bottom-6 left-6 right-6 flex justify-between items-center">
        {/* Nope button (left) */}
        <button
          onClick={handleDislikeClick}
          className={`group relative w-14 h-14 rounded-full transition-all duration-300 transform hover:scale-110 active:scale-95 shadow-lg ${
            isDisliked
              ? 'bg-red-500 text-white shadow-red-200'
              : 'bg-white text-gray-600 hover:bg-red-50 hover:text-red-500 hover:shadow-red-100'
          }`}
          title={isDisliked ? 'Remove from hidden' : 'Pass on this name'}
        >
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white to-gray-50 opacity-20"></div>
          <X className={`w-7 h-7 mx-auto transition-all duration-200 ${
            isDisliked ? 'stroke-[3px]' : 'stroke-[2.5px] group-hover:stroke-[3px]'
          }`} />
          {/* Ripple effect */}
          <div className="absolute inset-0 rounded-full bg-red-500 opacity-0 group-active:opacity-20 group-active:animate-ping"></div>
        </button>

        {/* Like button (right) */}
        <button
          onClick={handleFavoriteClick}
          className={`group relative w-14 h-14 rounded-full transition-all duration-300 transform hover:scale-110 active:scale-95 shadow-lg ${
            isFavorite
              ? 'bg-red-500 text-white shadow-red-200'
              : 'bg-white text-gray-600 hover:bg-red-50 hover:text-red-500 hover:shadow-red-100'
          }`}
          title={isFavorite ? 'Remove from favorites' : 'Love this name'}
        >
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white to-gray-50 opacity-20"></div>
          <Heart className={`w-7 h-7 mx-auto transition-all duration-200 ${
            isFavorite
              ? 'fill-current stroke-[2px]'
              : 'stroke-[2.5px] group-hover:stroke-[3px] group-hover:fill-red-50'
          }`} />
          {/* Ripple effect */}
          <div className="absolute inset-0 rounded-full bg-red-500 opacity-0 group-active:opacity-20 group-active:animate-ping"></div>
        </button>
      </div>
    </div>
  );
};

export default NameCard;