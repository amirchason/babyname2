import React from 'react';
import { Globe, Users, Sparkles } from 'lucide-react';
import { NameEntry } from '../services/nameService';

interface NameCardProps {
  name: NameEntry;
  onClick: (name: NameEntry) => void;
}

const NameCard: React.FC<NameCardProps> = ({ name, onClick }) => {
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
    </div>
  );
};

export default NameCard;