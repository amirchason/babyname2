import React, { useState, useEffect } from 'react';
import { X, Globe, Heart, Award, BookOpen, Sparkles } from 'lucide-react';
import { NameEntry } from '../services/nameService';
import enrichmentService from '../services/enrichmentService';

interface NameDetailModalProps {
  name: NameEntry | null;
  onClose: () => void;
}

const NameDetailModal: React.FC<NameDetailModalProps> = ({ name, onClose }) => {
  const [enrichedData, setEnrichedData] = useState<{
    meaning?: string;
    origin?: string;
    culturalContext?: string;
    enriched?: boolean;
  }>({});

  useEffect(() => {
    if (name) {
      const data = enrichmentService.getNameData(name.name);
      if (data) {
        setEnrichedData(data);
      }
    }
  }, [name]);

  if (!name) return null;

  const genderData = typeof name.gender === 'object' ? name.gender : null;
  const isMale = (genderData?.Male || 0) > (genderData?.Female || 0);
  const genderColor = isMale ? 'from-blue-500 to-blue-700' : 'from-pink-500 to-pink-700';
  const genderBg = isMale ? 'bg-blue-50' : 'bg-pink-50';

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
          {/* Meaning Section */}
          {(name.meaningFull || name.meaning || enrichedData.meaning) && (
            <div className="mb-4 sm:mb-6 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-200">
              <div className="flex items-center gap-2 mb-2">
                <BookOpen className="w-5 h-5 text-purple-600" />
                <h3 className="text-lg font-semibold text-purple-800">Meaning</h3>
                {(name.meaningProcessed || enrichedData.enriched) && (
                  <Sparkles className="w-4 h-4 text-green-600" />
                )}
              </div>

              {/* Primary meaning (full version) */}
              <p className="text-lg italic text-gray-700">
                "{name.meaningFull || enrichedData.meaning || name.meaning}"
              </p>

              {/* Multiple meanings if available */}
              {name.meanings && name.meanings.length > 1 && (
                <div className="mt-3 space-y-1">
                  <p className="text-sm font-medium text-purple-700">Alternative meanings:</p>
                  {name.meanings.slice(1, 3).map((altMeaning, index) => (
                    <p key={index} className="text-sm text-gray-600 pl-3 border-l-2 border-purple-200">
                      • {altMeaning}
                    </p>
                  ))}
                </div>
              )}

              {enrichedData.culturalContext && (
                <p className="text-sm text-gray-600 mt-2">{enrichedData.culturalContext}</p>
              )}
            </div>
          )}

          {/* Essential Info - Rank and Origin */}
          <div className="mb-4 sm:mb-6 p-4 bg-white rounded-xl border border-gray-200">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <Award className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
                <div className="text-2xl font-bold text-gray-800">
                  #{name.popularityRank || 'N/A'}
                </div>
                <div className="text-sm text-gray-500">Global Rank</div>
              </div>
              <div className="text-center">
                <Globe className="w-8 h-8 text-indigo-500 mx-auto mb-2" />
                <div className="text-xl font-bold text-gray-800 capitalize">
                  {name.origin || enrichedData.origin || 'Unknown'}
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
        </div>
      </div>
    </div>
  );
};

export default NameDetailModal;