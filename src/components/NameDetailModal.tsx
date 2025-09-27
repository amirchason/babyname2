import React from 'react';
import { X, Globe, TrendingUp, Heart, Star, MapPin, Award } from 'lucide-react';
import { NameEntry } from '../services/nameService';

interface NameDetailModalProps {
  name: NameEntry | null;
  onClose: () => void;
}

const NameDetailModal: React.FC<NameDetailModalProps> = ({ name, onClose }) => {
  if (!name) return null;

  const isMale = (name.gender.Male || 0) > (name.gender.Female || 0);
  const genderColor = isMale ? 'from-blue-500 to-blue-700' : 'from-pink-500 to-pink-700';
  const genderBg = isMale ? 'bg-blue-50' : 'bg-pink-50';

  // Sort countries by rank
  const sortedCountries = Object.entries(name.countries)
    .sort(([, a], [, b]) => a - b)
    .slice(0, 10);

  // Get top global countries
  const topGlobalCountries = Object.entries(name.globalCountries || {})
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center sm:p-4 bg-black bg-opacity-50"
         onClick={onClose}>
      <div className={`relative max-w-2xl w-full h-full sm:h-auto ${genderBg} sm:rounded-3xl shadow-2xl
                      transform animate-[fadeIn_0.3s_ease-out] overflow-y-auto`}
           onClick={(e) => e.stopPropagation()}>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-2 right-2 sm:top-4 sm:right-4 p-1.5 sm:p-2 rounded-full bg-white shadow-md
                     hover:bg-gray-100 transition-colors z-10"
        >
          <X className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
        </button>

        {/* Header with Gradient */}
        <div className={`relative h-24 sm:h-32 bg-gradient-to-br ${genderColor} sm:rounded-t-3xl overflow-hidden`}>
          <div className="absolute inset-0 bg-black opacity-20" />
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <h2 className="text-3xl sm:text-5xl font-bold text-white drop-shadow-lg">
              {name.name}
            </h2>
            {((name as any).abbreviations && (name as any).abbreviations.length > 0) && (
              <p className="text-sm sm:text-base text-white/90 mt-1">
                Abbrev: {(name as any).abbreviations.join(', ')}
              </p>
            )}
            {((name as any).variants && (name as any).variants.length > 0) && (
              <p className="text-xs sm:text-sm text-white/80 mt-1">
                Also: {(name as any).variants.slice(0, 5).join(', ')}{(name as any).variants.length > 5 ? '...' : ''}
              </p>
            )}
          </div>
          <div className="absolute top-2 left-2 sm:top-4 sm:left-4">
            <span className="px-2 py-0.5 sm:px-3 sm:py-1 bg-white bg-opacity-20 backdrop-blur-sm
                           rounded-full text-white text-xs sm:text-sm font-medium">
              Rank #{name.popularityRank}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-8">
          {/* Gender Section */}
          <div className="mb-4 sm:mb-6">
            <h3 className="text-base sm:text-lg font-semibold mb-2 sm:mb-3 flex items-center gap-2">
              <Heart className="w-4 h-4 sm:w-5 sm:h-5 text-pink-500" />
              Gender Distribution
            </h3>
            <div className="flex gap-3 sm:gap-4 items-center">
              <div className="flex-1">
                <div className="flex justify-between mb-1">
                  <span className="text-xs sm:text-sm text-gray-600">Male</span>
                  <span className="text-xs sm:text-sm font-medium">{Math.round((name.gender.Male || 0) * 100)}%</span>
                </div>
                <div className="h-2 sm:h-3 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-blue-400 to-blue-600"
                       style={{ width: `${(name.gender.Male || 0) * 100}%` }} />
                </div>
              </div>
              <div className="flex-1">
                <div className="flex justify-between mb-1">
                  <span className="text-xs sm:text-sm text-gray-600">Female</span>
                  <span className="text-xs sm:text-sm font-medium">{Math.round((name.gender.Female || 0) * 100)}%</span>
                </div>
                <div className="h-2 sm:h-3 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-pink-400 to-pink-600"
                       style={{ width: `${(name.gender.Female || 0) * 100}%` }} />
                </div>
              </div>
            </div>
          </div>

          {/* Statistics Grid */}
          <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-4 sm:mb-6">
            <div className="bg-white rounded-lg sm:rounded-xl p-2 sm:p-4 text-center">
              <Globe className="w-5 h-5 sm:w-8 sm:h-8 text-indigo-500 mx-auto mb-1 sm:mb-2" />
              <div className="text-lg sm:text-2xl font-bold text-gray-800">
                {Object.keys(name.countries).length}
              </div>
              <div className="text-xs sm:text-sm text-gray-500">Countries</div>
            </div>
            <div className="bg-white rounded-lg sm:rounded-xl p-2 sm:p-4 text-center">
              <TrendingUp className="w-5 h-5 sm:w-8 sm:h-8 text-green-500 mx-auto mb-1 sm:mb-2" />
              <div className="text-lg sm:text-2xl font-bold text-gray-800">
                {name.globalFrequency || name.appearances}
              </div>
              <div className="text-xs sm:text-sm text-gray-500">Appearances</div>
            </div>
            <div className="bg-white rounded-lg sm:rounded-xl p-2 sm:p-4 text-center">
              <Award className="w-5 h-5 sm:w-8 sm:h-8 text-yellow-500 mx-auto mb-1 sm:mb-2" />
              <div className="text-lg sm:text-2xl font-bold text-gray-800">
                #{name.popularityRank}
              </div>
              <div className="text-xs sm:text-sm text-gray-500">Global Rank</div>
            </div>
          </div>

          {/* Country Rankings */}
          <div className="mb-4 sm:mb-6">
            <h3 className="text-base sm:text-lg font-semibold mb-2 sm:mb-3 flex items-center gap-2">
              <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-red-500" />
              Top Rankings by Country
            </h3>
            <div className="grid grid-cols-2 gap-2 sm:gap-3">
              {sortedCountries.map(([country, rank]) => (
                <div key={country} className="bg-white rounded-lg p-2 sm:p-3 flex justify-between items-center">
                  <span className="text-sm sm:text-base font-medium text-gray-700">{country}</span>
                  <span className="px-1.5 py-0.5 sm:px-2 sm:py-1 bg-gradient-to-r from-purple-500 to-pink-500
                                   text-white text-xs rounded-full font-bold">
                    #{rank}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Global Distribution */}
          {topGlobalCountries.length > 0 && (
            <div>
              <h3 className="text-base sm:text-lg font-semibold mb-2 sm:mb-3 flex items-center gap-2">
                <Star className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-500" />
                Global Distribution
              </h3>
              <div className="space-y-1 sm:space-y-2">
                {topGlobalCountries.map(([country, percentage]) => (
                  <div key={country} className="flex items-center gap-2 sm:gap-3">
                    <span className="text-xs sm:text-sm text-gray-600 w-20 sm:w-32">{country}</span>
                    <div className="flex-1 h-1.5 sm:h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-purple-400 to-pink-400"
                           style={{ width: `${(percentage as number) * 100}%` }} />
                    </div>
                    <span className="text-xs text-gray-500 w-10 sm:w-12 text-right">
                      {Math.round((percentage as number) * 100)}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NameDetailModal;