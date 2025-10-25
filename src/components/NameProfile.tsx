import React, { useState, useEffect } from 'react';
import { Globe, Heart, Award, BookOpen, Sparkles, X } from 'lucide-react';
import { NameEntry } from '../services/nameService';
import enrichmentService from '../services/enrichmentService';
import AppHeader from './AppHeader';

interface NameProfileProps {
  name: NameEntry;
  onClose: () => void;
  contextualRank?: number;
  filterContext?: 'all' | 'male' | 'female';
}

const NameProfile: React.FC<NameProfileProps> = ({
  name,
  onClose,
  contextualRank,
  filterContext
}) => {
  const [enrichedData, setEnrichedData] = useState<{
    meaning?: string;
    origin?: string;
    culturalContext?: string;
    enriched?: boolean;
  }>({});

  useEffect(() => {
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

  const genderData = typeof name.gender === 'object' ? name.gender : null;
  const isMale = (genderData?.Male || 0) > (genderData?.Female || 0);
  const genderColor = isMale ? 'from-blue-500 to-blue-700' : 'from-pink-500 to-pink-700';
  const genderBg = isMale ? 'bg-blue-50' : 'bg-pink-50';

  return (
    <div className={`fixed inset-0 ${genderBg} overflow-y-auto z-50`}>
      {/* AppHeader at top - full functionality */}
      <AppHeader title="SoulSeed" onBackClick={onClose} />

      {/* Name Header - Sticky below AppHeader - COMPACT */}
      <div className={`sticky top-[73px] z-40 bg-gradient-to-br ${genderColor} shadow-xl`}>
        <div className="flex items-center justify-between px-3 py-2">
          {/* Close button - left */}
          <button
            onClick={onClose}
            className="flex items-center justify-center w-10 h-10 rounded-full bg-white/20 hover:bg-white/40 transition-all duration-200 backdrop-blur-sm"
            aria-label="Close profile"
          >
            <X className="w-6 h-6 text-white stroke-[2.5px]" />
          </button>

          {/* Name and Rank - center, more compact */}
          <div className="flex-1 text-center px-2">
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-serif font-bold text-white drop-shadow-2xl tracking-wide leading-tight">
              {name.name}
            </h2>
            <span className="inline-block mt-0.5 px-3 py-0.5 bg-white/30 backdrop-blur-sm rounded-full text-white text-xs sm:text-sm font-medium shadow-lg">
              Rank #{contextualRank || name.popularityRank}
            </span>
          </div>

          {/* Spacer for symmetry - right */}
          <div className="w-10 h-10"></div>
        </div>
      </div>

      {/* Content - with top padding to clear both sticky headers (AppHeader ~73px + Name header ~70px = ~143px) */}
      <div className="p-6 pt-40 pb-8">
        {/* Meaning Section */}
        {enrichedData.meaning && (
          <div className="mb-8 p-8 bg-gradient-to-r from-purple-50 to-pink-50 rounded-3xl border-2 border-purple-200 shadow-xl">
            <div className="flex items-center gap-3 mb-4">
              <BookOpen className="w-8 h-8 text-purple-600" />
              <h3 className="text-2xl sm:text-3xl font-serif font-bold text-purple-800">Meaning</h3>
              {enrichedData.enriched && (
                <Sparkles className="w-6 h-6 text-green-600" />
              )}
            </div>
            <p className="text-2xl sm:text-3xl italic font-serif text-gray-800 leading-relaxed">"{enrichedData.meaning}"</p>
            {enrichedData.culturalContext && (
              <p className="text-lg sm:text-xl text-gray-600 mt-4 leading-relaxed">{enrichedData.culturalContext}</p>
            )}
          </div>
        )}

        {/* Essential Info - Rank and Origin */}
        <div className="mb-8 p-8 bg-white rounded-3xl border-2 border-gray-200 shadow-xl">
          <div className="grid grid-cols-2 gap-8">
            <div className="text-center">
              <Award className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
              <div className="text-4xl sm:text-5xl font-serif font-bold text-gray-800">
                #{contextualRank || name.popularityRank || 'N/A'}
              </div>
              <div className="text-base sm:text-lg text-gray-500 mt-2 font-medium">Global Rank</div>
            </div>
            <div className="text-center">
              <Globe className="w-16 h-16 text-indigo-500 mx-auto mb-4" />
              <div className="text-3xl sm:text-4xl font-serif font-bold text-gray-800 capitalize">
                {enrichedData.origin || name.origin || 'Unknown'}
              </div>
              <div className="text-base sm:text-lg text-gray-500 mt-2 font-medium">Origin</div>
            </div>
          </div>
        </div>

        {/* Gender Section */}
        <div className="mb-8 p-8 bg-white rounded-3xl border-2 border-gray-200 shadow-xl">
          <h3 className="text-2xl sm:text-3xl font-serif font-bold mb-6 flex items-center gap-3">
            <Heart className="w-8 h-8 text-pink-500" />
            Gender Distribution
          </h3>
          <div className="flex gap-6 items-center">
            <div className="flex-1">
              <div className="flex justify-between mb-3">
                <span className="text-base sm:text-lg text-gray-600 font-semibold">Male</span>
                <span className="text-base sm:text-lg font-bold text-blue-600">{Math.round((genderData?.Male || 0) * 100)}%</span>
              </div>
              <div className="h-6 bg-gray-200 rounded-full overflow-hidden shadow-inner">
                <div className="h-full bg-gradient-to-r from-blue-400 to-blue-600"
                     style={{ width: `${(genderData?.Male || 0) * 100}%` }} />
              </div>
            </div>
            <div className="flex-1">
              <div className="flex justify-between mb-3">
                <span className="text-base sm:text-lg text-gray-600 font-semibold">Female</span>
                <span className="text-base sm:text-lg font-bold text-pink-600">{Math.round((genderData?.Female || 0) * 100)}%</span>
              </div>
              <div className="h-6 bg-gray-200 rounded-full overflow-hidden shadow-inner">
                <div className="h-full bg-gradient-to-r from-pink-400 to-pink-600"
                     style={{ width: `${(genderData?.Female || 0) * 100}%` }} />
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default NameProfile;
