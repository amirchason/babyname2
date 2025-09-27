import React, { useState, useEffect } from 'react';
import { Globe, Users, Sparkles, Heart, X } from 'lucide-react';
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

  const countryCount = Object.keys(name.countries).length;
  const popularityPercent = Math.min(100, 100 - (name.popularityRank / 100));

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

        {/* Header */}
        <div className="flex justify-between items-start mb-3">
          <div className="flex-1 min-w-0">
            <h3 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              {name.name}
              {(name as any).abbreviations && (name as any).abbreviations.length > 0 && (
                <span className="text-sm font-normal text-gray-500">
                  ({(name as any).abbreviations.join(', ')})
                </span>
              )}
              <span className={`text-xl font-medium bg-gradient-to-r ${genderColor}
                             bg-clip-text text-transparent`}>
                {genderIcon}
              </span>
            </h3>
          </div>
          <div className={`px-3 py-1 rounded-full bg-gradient-to-r ${genderColor} text-white text-sm font-bold`}>
            #{name.popularityRank}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-2 mb-3">
          <div className="flex items-center gap-1 text-sm text-gray-600">
            <Globe className="w-4 h-4 text-gray-400" />
            <span>{countryCount} countries</span>
          </div>
          <div className="flex items-center gap-1 text-sm text-gray-600">
            <Users className="w-4 h-4 text-gray-400" />
            <span>{name.globalFrequency || name.appearances} uses</span>
          </div>
        </div>

        {/* Popularity Bar */}
        <div className="mb-4">
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className={`h-full bg-gradient-to-r ${genderColor} transition-all duration-300`}
              style={{ width: `${popularityPercent}%` }}
            />
          </div>
        </div>

        {/* Country Preview */}
        <div className="flex flex-wrap gap-1">
          {Object.keys(name.countries).slice(0, 5).map(country => (
            <span
              key={country}
              className="px-2 py-1 bg-white border border-gray-200 rounded text-xs text-gray-600"
            >
              {country}
            </span>
          ))}
          {countryCount > 5 && (
            <span className="px-2 py-1 bg-gray-100 rounded text-xs text-gray-500">
              +{countryCount - 5}
            </span>
          )}
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