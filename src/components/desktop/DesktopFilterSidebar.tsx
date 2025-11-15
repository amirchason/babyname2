/**
 * Desktop Filter Sidebar Component
 * Persistent left sidebar with all filtering options
 */

import React, { useState } from 'react';
import {
  Globe,
  Type,
  Ruler,
  Music,
  Sparkles,
  ChevronDown,
  Check,
  X,
  Search,
  Users,
  ArrowDownAZ,
  Dices
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface DesktopFilterSidebarProps {
  // Gender filter
  activeFilter: 'all' | 'male' | 'female' | 'unisex';
  setActiveFilter: (filter: 'all' | 'male' | 'female' | 'unisex') => void;

  // Sort options
  sortBy: 'popularity' | 'alphabetical' | 'random';
  setSortBy: (sort: 'popularity' | 'alphabetical' | 'random') => void;
  sortReverse: boolean;
  setSortReverse: (reverse: boolean) => void;

  // Advanced filters
  selectedOrigins: Set<string>;
  setSelectedOrigins: (origins: Set<string>) => void;
  selectedStartLetters: Set<string>;
  setSelectedStartLetters: (letters: Set<string>) => void;
  selectedLengths: Set<string>;
  setSelectedLengths: (lengths: Set<string>) => void;
  selectedSyllables: Set<number>;
  setSelectedSyllables: (syllables: Set<number>) => void;
  selectedEndings: Set<string>;
  setSelectedEndings: (endings: Set<string>) => void;

  // Origin data
  sortedOrigins: Array<{ origin: string; count: number }>;

  // Counts
  genderCounts: { male: number; female: number; unisex: number; total: number };
  activeFiltersCount: number;

  // Clear function
  clearAllFilters: () => void;
}

const DesktopFilterSidebar: React.FC<DesktopFilterSidebarProps> = ({
  activeFilter,
  setActiveFilter,
  sortBy,
  setSortBy,
  sortReverse,
  setSortReverse,
  selectedOrigins,
  setSelectedOrigins,
  selectedStartLetters,
  setSelectedStartLetters,
  selectedLengths,
  setSelectedLengths,
  selectedSyllables,
  setSelectedSyllables,
  selectedEndings,
  setSelectedEndings,
  sortedOrigins,
  genderCounts,
  activeFiltersCount,
  clearAllFilters,
}) => {
  const [originSearch, setOriginSearch] = useState('');
  const [expandedSections, setExpandedSections] = useState({
    gender: true,
    sort: true,
    origin: true,
    letter: false,
    length: false,
    syllable: false,
    ending: false,
  });

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const handleOriginToggle = (origin: string) => {
    const newSet = new Set(selectedOrigins);
    if (newSet.has(origin)) {
      newSet.delete(origin);
    } else {
      newSet.add(origin);
    }
    setSelectedOrigins(newSet);
  };

  const handleLetterToggle = (letter: string) => {
    const newSet = new Set(selectedStartLetters);
    if (newSet.has(letter)) {
      newSet.delete(letter);
    } else {
      newSet.add(letter);
    }
    setSelectedStartLetters(newSet);
  };

  const handleLengthToggle = (length: string) => {
    const newSet = new Set(selectedLengths);
    if (newSet.has(length)) {
      newSet.delete(length);
    } else {
      newSet.add(length);
    }
    setSelectedLengths(newSet);
  };

  const handleSyllableToggle = (syllable: number) => {
    const newSet = new Set(selectedSyllables);
    if (newSet.has(syllable)) {
      newSet.delete(syllable);
    } else {
      newSet.add(syllable);
    }
    setSelectedSyllables(newSet);
  };

  const handleEndingToggle = (ending: string) => {
    const newSet = new Set(selectedEndings);
    if (newSet.has(ending)) {
      newSet.delete(ending);
    } else {
      newSet.add(ending);
    }
    setSelectedEndings(newSet);
  };

  const filteredOrigins = sortedOrigins.filter(({ origin }) =>
    origin.toLowerCase().includes(originSearch.toLowerCase())
  );

  const genderOptions = [
    { id: 'all' as const, label: 'All Names', count: genderCounts.total, icon: Users },
    { id: 'male' as const, label: 'Boys', count: genderCounts.male, icon: Users },
    { id: 'female' as const, label: 'Girls', count: genderCounts.female, icon: Users },
    { id: 'unisex' as const, label: 'Unisex', count: genderCounts.unisex, icon: Users },
  ];

  const sortOptions = [
    { id: 'popularity' as const, label: 'Popularity', icon: ArrowDownAZ },
    { id: 'alphabetical' as const, label: 'A-Z', icon: Type },
    { id: 'random' as const, label: 'Random', icon: Dices },
  ];

  const lengthOptions = ['short', 'medium', 'long'];
  const syllableOptions = [1, 2, 3, 4, 5];
  const endingOptions = ['a', 'en', 'son', 'lyn', 'er', 'ie', 'el', 'ette', 'yn', 'ia', 'elle', 'other'];

  return (
    <aside className="w-80 h-full bg-white border-r border-gray-200 overflow-y-auto">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
          {activeFiltersCount > 0 && (
            <button
              onClick={clearAllFilters}
              className="flex items-center gap-1 px-2 py-1 text-xs text-purple-600 hover:bg-purple-50 rounded transition-colors"
            >
              <X className="w-3 h-3" />
              Clear ({activeFiltersCount})
            </button>
          )}
        </div>

        {/* Gender Filter */}
        <section>
          <button
            onClick={() => toggleSection('gender')}
            className="w-full flex items-center justify-between mb-3 group"
          >
            <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <Users className="w-4 h-4" />
              Gender
            </h3>
            <ChevronDown
              className={`w-4 h-4 text-gray-400 transition-transform ${
                expandedSections.gender ? 'rotate-180' : ''
              }`}
            />
          </button>
          <AnimatePresence>
            {expandedSections.gender && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="space-y-2 overflow-hidden"
              >
                {genderOptions.map(({ id, label, count, icon: Icon }) => (
                  <button
                    key={id}
                    onClick={() => setActiveFilter(id)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-all ${
                      activeFilter === id
                        ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md'
                        : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <Icon className="w-4 h-4" />
                      {label}
                    </span>
                    <span className={`text-xs ${activeFilter === id ? 'text-white/80' : 'text-gray-500'}`}>
                      {count.toLocaleString()}
                    </span>
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </section>

        {/* Sort Options */}
        <section>
          <button
            onClick={() => toggleSection('sort')}
            className="w-full flex items-center justify-between mb-3 group"
          >
            <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <ArrowDownAZ className="w-4 h-4" />
              Sort By
            </h3>
            <ChevronDown
              className={`w-4 h-4 text-gray-400 transition-transform ${
                expandedSections.sort ? 'rotate-180' : ''
              }`}
            />
          </button>
          <AnimatePresence>
            {expandedSections.sort && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="space-y-2 overflow-hidden"
              >
                {sortOptions.map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    onClick={() => setSortBy(id)}
                    className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all ${
                      sortBy === id
                        ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md'
                        : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {label}
                  </button>
                ))}
                {sortBy !== 'random' && (
                  <button
                    onClick={() => setSortReverse(!sortReverse)}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm bg-gray-50 text-gray-700 hover:bg-gray-100 transition-colors"
                  >
                    <span>Reverse Order</span>
                    <div className={`w-4 h-4 border-2 rounded flex items-center justify-center transition-all ${
                      sortReverse
                        ? 'bg-purple-600 border-transparent'
                        : 'border-gray-300'
                    }`}>
                      {sortReverse && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
                    </div>
                  </button>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </section>

        {/* Origin Filter */}
        <section>
          <button
            onClick={() => toggleSection('origin')}
            className="w-full flex items-center justify-between mb-3 group"
          >
            <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <Globe className="w-4 h-4" />
              Origin
              {selectedOrigins.size > 0 && (
                <span className="text-xs text-purple-600">({selectedOrigins.size})</span>
              )}
            </h3>
            <ChevronDown
              className={`w-4 h-4 text-gray-400 transition-transform ${
                expandedSections.origin ? 'rotate-180' : ''
              }`}
            />
          </button>
          <AnimatePresence>
            {expandedSections.origin && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                {/* Search */}
                <div className="relative mb-3">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search origins..."
                    value={originSearch}
                    onChange={(e) => setOriginSearch(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                {/* Origin chips */}
                <div className="flex flex-wrap gap-2 max-h-64 overflow-y-auto">
                  {filteredOrigins.map(({ origin, count }) => (
                    <button
                      key={origin}
                      onClick={() => handleOriginToggle(origin)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all flex items-center gap-1.5 border ${
                        selectedOrigins.has(origin)
                          ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white border-transparent shadow-md'
                          : 'bg-white text-gray-700 border-gray-200 hover:border-purple-300 hover:bg-purple-50'
                      }`}
                    >
                      <span>{origin}</span>
                      <span className={`text-[10px] ${selectedOrigins.has(origin) ? 'text-white/80' : 'text-gray-500'}`}>
                        {count.toLocaleString()}
                      </span>
                      {selectedOrigins.has(origin) && <Check className="w-3 h-3" />}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </section>

        {/* Starting Letter Filter */}
        <section>
          <button
            onClick={() => toggleSection('letter')}
            className="w-full flex items-center justify-between mb-3 group"
          >
            <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <Type className="w-4 h-4" />
              Starting Letter
              {selectedStartLetters.size > 0 && (
                <span className="text-xs text-purple-600">({selectedStartLetters.size})</span>
              )}
            </h3>
            <ChevronDown
              className={`w-4 h-4 text-gray-400 transition-transform ${
                expandedSections.letter ? 'rotate-180' : ''
              }`}
            />
          </button>
          <AnimatePresence>
            {expandedSections.letter && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="grid grid-cols-7 gap-1.5">
                  {'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').map(letter => (
                    <button
                      key={letter}
                      onClick={() => handleLetterToggle(letter)}
                      className={`aspect-square flex items-center justify-center text-sm font-semibold rounded-lg transition-all ${
                        selectedStartLetters.has(letter)
                          ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md'
                          : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      {letter}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </section>

        {/* Length Filter */}
        <section>
          <button
            onClick={() => toggleSection('length')}
            className="w-full flex items-center justify-between mb-3 group"
          >
            <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <Ruler className="w-4 h-4" />
              Name Length
              {selectedLengths.size > 0 && (
                <span className="text-xs text-purple-600">({selectedLengths.size})</span>
              )}
            </h3>
            <ChevronDown
              className={`w-4 h-4 text-gray-400 transition-transform ${
                expandedSections.length ? 'rotate-180' : ''
              }`}
            />
          </button>
          <AnimatePresence>
            {expandedSections.length && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="space-y-2 overflow-hidden"
              >
                {lengthOptions.map(length => (
                  <button
                    key={length}
                    onClick={() => handleLengthToggle(length)}
                    className={`w-full px-3 py-2 rounded-lg text-sm transition-all text-left ${
                      selectedLengths.has(length)
                        ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md'
                        : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {length.charAt(0).toUpperCase() + length.slice(1)}
                    <span className={`ml-2 text-xs ${selectedLengths.has(length) ? 'text-white/80' : 'text-gray-500'}`}>
                      ({length === 'short' ? '≤4' : length === 'medium' ? '5-7' : '8+'} letters)
                    </span>
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </section>

        {/* Syllables Filter */}
        <section>
          <button
            onClick={() => toggleSection('syllable')}
            className="w-full flex items-center justify-between mb-3 group"
          >
            <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <Music className="w-4 h-4" />
              Syllables
              {selectedSyllables.size > 0 && (
                <span className="text-xs text-purple-600">({selectedSyllables.size})</span>
              )}
            </h3>
            <ChevronDown
              className={`w-4 h-4 text-gray-400 transition-transform ${
                expandedSections.syllable ? 'rotate-180' : ''
              }`}
            />
          </button>
          <AnimatePresence>
            {expandedSections.syllable && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="grid grid-cols-5 gap-2">
                  {syllableOptions.map(syllable => (
                    <button
                      key={syllable}
                      onClick={() => handleSyllableToggle(syllable)}
                      className={`aspect-square flex items-center justify-center text-sm font-semibold rounded-lg transition-all ${
                        selectedSyllables.has(syllable)
                          ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md'
                          : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      {syllable}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </section>

        {/* Ending Filter */}
        <section>
          <button
            onClick={() => toggleSection('ending')}
            className="w-full flex items-center justify-between mb-3 group"
          >
            <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              Name Ending
              {selectedEndings.size > 0 && (
                <span className="text-xs text-purple-600">({selectedEndings.size})</span>
              )}
            </h3>
            <ChevronDown
              className={`w-4 h-4 text-gray-400 transition-transform ${
                expandedSections.ending ? 'rotate-180' : ''
              }`}
            />
          </button>
          <AnimatePresence>
            {expandedSections.ending && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="flex flex-wrap gap-2">
                  {endingOptions.map(ending => (
                    <button
                      key={ending}
                      onClick={() => handleEndingToggle(ending)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                        selectedEndings.has(ending)
                          ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md'
                          : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      -{ending}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </section>
      </div>
    </aside>
  );
};

export default DesktopFilterSidebar;
