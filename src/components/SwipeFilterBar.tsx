/**
 * Sticky Bottom Filter Bar for Swipe Mode
 * Amazing UX with slide-up bottom sheet pattern
 * Best practices: Thumb-friendly, clear apply button, result count
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SlidersHorizontal, X, Check } from 'lucide-react';

export interface SwipeFilters {
  gender: 'all' | 'male' | 'female' | 'unisex';
  origins: string[];
  length: 'all' | 'short' | 'medium' | 'long';
  sortBy: 'popularity' | 'alphabetical' | 'shuffle' | 'shortest' | 'longest' | 'rare';
}

// Origin group mappings - exported for use in filter logic
export const ENGLISH_SPEAKING_ORIGINS = [
  'English', 'American', 'Irish', 'Scottish', 'Welsh',
  'Australian', 'Canadian', 'Celtic'
];

export const AFRICAN_ORIGINS = [
  'African', 'Yoruba', 'Nigerian', 'Igbo', 'Tswana', 'Zulu',
  'Akan', 'Ghanaian', 'Xhosa', 'Swahili', 'Ethiopian', 'Egyptian',
  'Edo', 'Ewe', 'Shona', 'Amharic', 'Kenyan', 'Somali', 'Hausa'
];

export const UNKNOWN_MODERN_ORIGINS = [
  'Unknown', 'Modern', 'Contemporary', 'Invented', ''
];

export const EAST_ASIAN_ORIGINS = [
  'Chinese', 'Japanese', 'Korean', 'Mandarin', 'Cantonese'
];

export const SOUTHEAST_ASIAN_ORIGINS = [
  'Indonesian', 'Malay', 'Filipino', 'Vietnamese', 'Thai',
  'Cambodian', 'Burmese', 'Laotian'
];

export const SLAVIC_ORIGINS = [
  'Russian', 'Polish', 'Czech', 'Ukrainian', 'Bulgarian',
  'Serbian', 'Croatian', 'Slavic', 'Lithuanian', 'Romanian',
  'Hungarian', 'Slovak', 'Bosnian'
];

export const SCANDINAVIAN_ORIGINS = [
  'Norse', 'Norwegian', 'Swedish', 'Danish', 'Icelandic',
  'Finnish', 'Old Norse'
];

export const MIDDLE_EASTERN_ORIGINS = [
  'Turkish', 'Persian', 'Kurdish', 'Armenian'
];

export const OTHER_WORLD_ORIGINS = [
  'Portuguese', 'Dutch', 'Germanic', 'Hawaiian', 'Native American',
  'Basque', 'Maori', 'Aboriginal', 'Polynesian', 'Samoan'
];

interface SwipeFilterBarProps {
  totalNames: number;
  filteredCount: number;
  onFiltersApply: (filters: SwipeFilters) => void;
  currentFilters: SwipeFilters;
  onPreviewFilterCount: (filters: SwipeFilters) => number; // Real-time count callback
}

const SwipeFilterBar: React.FC<SwipeFilterBarProps> = ({
  totalNames,
  filteredCount,
  onFiltersApply,
  currentFilters,
  onPreviewFilterCount
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [tempFilters, setTempFilters] = useState<SwipeFilters>(currentFilters);
  const [previewCount, setPreviewCount] = useState<number>(filteredCount);

  // Update temp filters when current filters change
  useEffect(() => {
    setTempFilters(currentFilters);
  }, [currentFilters]);

  // Update preview count in real-time when tempFilters change
  useEffect(() => {
    if (isOpen) {
      const count = onPreviewFilterCount(tempFilters);
      setPreviewCount(count);
    }
  }, [tempFilters, isOpen, onPreviewFilterCount]);

  const handleApply = () => {
    onFiltersApply(tempFilters);
    setIsOpen(false);
  };

  const handleReset = () => {
    const resetFilters: SwipeFilters = {
      gender: 'all',
      origins: [],
      length: 'all',
      sortBy: 'popularity'
    };
    setTempFilters(resetFilters);
  };

  const toggleOrigin = (origin: string) => {
    setTempFilters(prev => ({
      ...prev,
      origins: prev.origins.includes(origin)
        ? prev.origins.filter(o => o !== origin)
        : [...prev.origins, origin]
    }));
  };

  const popularOrigins = [
    'English & Irish', 'Hebrew', 'Latin', 'Greek',
    'French', 'German', 'Italian', 'Spanish',
    'Arabic', 'Indian', 'African', 'Unknown & Modern',
    'East Asian', 'Southeast Asian', 'Slavic', 'Scandinavian',
    'Middle East', 'Other World'
  ];

  const hasActiveFilters = currentFilters.gender !== 'all' ||
                          currentFilters.origins.length > 0 ||
                          currentFilters.length !== 'all';

  return (
    <>
      {/* Sticky Bottom Button - Always Visible */}
      <motion.div
        className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 shadow-lg"
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        <div className="max-w-md mx-auto px-4 py-3">
          <button
            onClick={() => setIsOpen(true)}
            className="w-full flex items-center justify-between px-5 py-3.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full shadow-lg hover:shadow-xl active:scale-98 transition-all font-semibold"
          >
            <div className="flex items-center gap-2.5">
              <SlidersHorizontal className="w-5 h-5" />
              <span>Filters</span>
              {hasActiveFilters && (
                <span className="ml-1 px-2 py-0.5 bg-white/30 rounded-full text-xs font-bold">
                  Active
                </span>
              )}
            </div>
            <span className="text-sm font-normal opacity-90">
              {filteredCount.toLocaleString()} names
            </span>
          </button>
        </div>
      </motion.div>

      {/* Bottom Sheet Filter Panel */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Overlay */}
            <motion.div
              className="fixed inset-0 bg-black/50 z-50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
            />

            {/* Bottom Sheet */}
            <motion.div
              className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-3xl shadow-2xl max-h-[85vh] overflow-hidden flex flex-col"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
            >
              {/* Handle Bar */}
              <div className="flex justify-center py-3 border-b border-gray-100">
                <div className="w-12 h-1.5 bg-gray-300 rounded-full" />
              </div>

              {/* Header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Filters</h3>
                  <p className="text-sm text-gray-500 mt-0.5">
                    <span className="font-semibold text-purple-600">{previewCount.toLocaleString()}</span> of {totalNames.toLocaleString()} names
                  </p>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-gray-600" />
                </button>
              </div>

              {/* Filter Content - Scrollable */}
              <div className="flex-1 overflow-y-auto px-5 py-4 space-y-6">
                {/* Gender Filter */}
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-3">Gender</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {(['all', 'male', 'female', 'unisex'] as const).map((gender) => (
                      <button
                        key={gender}
                        onClick={() => setTempFilters(prev => ({ ...prev, gender }))}
                        className={`px-4 py-2.5 rounded-xl font-medium transition-all ${
                          tempFilters.gender === gender
                            ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {gender === 'all' ? 'All' : gender === 'male' ? 'Boy' : gender === 'female' ? 'Girl' : 'Unisex'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Length Filter */}
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-3">Name Length</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {(['all', 'short', 'medium', 'long'] as const).map((length) => (
                      <button
                        key={length}
                        onClick={() => setTempFilters(prev => ({ ...prev, length }))}
                        className={`px-4 py-2.5 rounded-xl font-medium transition-all ${
                          tempFilters.length === length
                            ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {length === 'all' ? 'All' : length === 'short' ? 'Short (≤4)' : length === 'medium' ? 'Medium (5-7)' : 'Long (8+)'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Origins Filter */}
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-3">
                    Origins
                    {tempFilters.origins.length > 0 && (
                      <span className="ml-2 text-xs font-normal text-purple-600">
                        ({tempFilters.origins.length} selected)
                      </span>
                    )}
                  </h4>
                  <div className="grid grid-cols-2 gap-2">
                    {popularOrigins.map((origin) => (
                      <button
                        key={origin}
                        onClick={() => toggleOrigin(origin)}
                        className={`px-4 py-2.5 rounded-xl font-medium transition-all ${
                          tempFilters.origins.includes(origin)
                            ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                        title={origin === 'English & Irish' ? 'All English-speaking countries + Irish names' : undefined}
                      >
                        {origin === 'English & Irish' ? 'English' : origin}
                        {tempFilters.origins.includes(origin) && (
                          <Check className="w-4 h-4 inline ml-1.5" />
                        )}
                      </button>
                    ))}
                  </div>
                  {tempFilters.origins.includes('English & Irish') && (
                    <p className="text-xs text-gray-500 mt-2">
                      Includes: USA, UK, Ireland, Scotland, Wales, Australia, Canada, Celtic
                    </p>
                  )}
                  {tempFilters.origins.includes('African') && (
                    <p className="text-xs text-gray-500 mt-2">
                      Includes: Nigerian, Yoruba, Igbo, Zulu, Swahili, Ethiopian, Egyptian, and more
                    </p>
                  )}
                  {tempFilters.origins.includes('Unknown & Modern') && (
                    <p className="text-xs text-gray-500 mt-2">
                      Includes: Modern, Contemporary, Invented names, and names with unknown origin
                    </p>
                  )}
                  {tempFilters.origins.includes('East Asian') && (
                    <p className="text-xs text-gray-500 mt-2">
                      Includes: Chinese, Japanese, Korean, Mandarin, Cantonese
                    </p>
                  )}
                  {tempFilters.origins.includes('Southeast Asian') && (
                    <p className="text-xs text-gray-500 mt-2">
                      Includes: Indonesian, Filipino, Vietnamese, Thai, Malay, Cambodian
                    </p>
                  )}
                  {tempFilters.origins.includes('Slavic') && (
                    <p className="text-xs text-gray-500 mt-2">
                      Includes: Russian, Polish, Czech, Ukrainian, Bulgarian, Serbian, Croatian
                    </p>
                  )}
                  {tempFilters.origins.includes('Scandinavian') && (
                    <p className="text-xs text-gray-500 mt-2">
                      Includes: Norwegian, Swedish, Danish, Finnish, Icelandic, Norse
                    </p>
                  )}
                  {tempFilters.origins.includes('Middle East') && (
                    <p className="text-xs text-gray-500 mt-2">
                      Includes: Turkish, Persian, Kurdish, Armenian
                    </p>
                  )}
                  {tempFilters.origins.includes('Other World') && (
                    <p className="text-xs text-gray-500 mt-2">
                      Includes: Portuguese, Dutch, Hawaiian, Native American, Polynesian, and more
                    </p>
                  )}
                </div>

                {/* Sort By Filter */}
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-3">Sort Order</h4>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setTempFilters(prev => ({ ...prev, sortBy: 'popularity' }))}
                      className={`px-4 py-2.5 rounded-xl font-medium transition-all ${
                        tempFilters.sortBy === 'popularity'
                          ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      🔥 Popular
                    </button>
                    <button
                      onClick={() => setTempFilters(prev => ({ ...prev, sortBy: 'alphabetical' }))}
                      className={`px-4 py-2.5 rounded-xl font-medium transition-all ${
                        tempFilters.sortBy === 'alphabetical'
                          ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      🔤 A-Z
                    </button>
                    <button
                      onClick={() => setTempFilters(prev => ({ ...prev, sortBy: 'shuffle' }))}
                      className={`px-4 py-2.5 rounded-xl font-medium transition-all ${
                        tempFilters.sortBy === 'shuffle'
                          ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      🎲 Shuffle
                    </button>
                    <button
                      onClick={() => setTempFilters(prev => ({ ...prev, sortBy: 'shortest' }))}
                      className={`px-4 py-2.5 rounded-xl font-medium transition-all ${
                        tempFilters.sortBy === 'shortest'
                          ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      ⚡ Shortest
                    </button>
                    <button
                      onClick={() => setTempFilters(prev => ({ ...prev, sortBy: 'longest' }))}
                      className={`px-4 py-2.5 rounded-xl font-medium transition-all ${
                        tempFilters.sortBy === 'longest'
                          ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      📏 Longest
                    </button>
                    <button
                      onClick={() => setTempFilters(prev => ({ ...prev, sortBy: 'rare' }))}
                      className={`px-4 py-2.5 rounded-xl font-medium transition-all ${
                        tempFilters.sortBy === 'rare'
                          ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      💎 Rare Gems
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    {tempFilters.sortBy === 'popularity' && '⭐ Most popular names first'}
                    {tempFilters.sortBy === 'alphabetical' && '📚 Sorted A to Z'}
                    {tempFilters.sortBy === 'shuffle' && '🎰 Random order every time'}
                    {tempFilters.sortBy === 'shortest' && '✨ Compact names (shortest first)'}
                    {tempFilters.sortBy === 'longest' && '🌟 Grand names (longest first)'}
                    {tempFilters.sortBy === 'rare' && '🦄 Unique & uncommon names'}
                  </p>
                </div>
              </div>

              {/* Sticky Bottom Actions */}
              <div className="flex-none border-t border-gray-200 bg-white px-5 py-4 space-y-2">
                <button
                  onClick={handleApply}
                  className="w-full py-3.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full font-bold shadow-lg hover:shadow-xl active:scale-98 transition-all"
                >
                  See {previewCount.toLocaleString()} Names
                </button>
                <button
                  onClick={handleReset}
                  className="w-full py-3 text-gray-600 hover:text-gray-900 font-medium transition-colors"
                >
                  Reset All Filters
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default SwipeFilterBar;
