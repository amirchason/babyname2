import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronDown, Grid3x3, List, ArrowDownAZ, Trophy, Dices,
  Globe, Clover, MapPin, Columns, Scroll, Wine, Sun, Mountain,
  Moon, Lightbulb, Dumbbell, GraduationCap, Smile, Heart,
  Shield, Bird, Clock, Sparkles, Type, Hash, Gem, Crown,
  Trees, Star, Medal, BookOpen, Diamond, Flower, Droplet,
  Music, Calendar, TrendingUp, Zap
} from 'lucide-react';
import { ThemedList } from '../data/themedLists';
import { BabyName } from '../services/nameService';
import { applyThemedListFilter, filterByGender, sortNames } from '../utils/themedListFilters';
import NameCard from './NameCard';
import NameCardCompact from './NameCardCompact';
import NameDetailModal from './NameDetailModal';

interface ThemedListAccordionProps {
  list: ThemedList;
  allNames: BabyName[];
  defaultOpen?: boolean;
}

// Helper function to get icon for each list
const getListIcon = (listId: string, category: string) => {
  const iconProps = { className: "w-5 h-5 text-gray-700", strokeWidth: 1.5 };

  // Specific list mappings - unique, relevant, minimalist icons
  const iconMap: Record<string, JSX.Element> = {
    // Origin lists
    'irish-celtic': <Clover {...iconProps} />,
    'italian': <Wine {...iconProps} />,
    'greek': <Columns {...iconProps} />,
    'hebrew-biblical': <Scroll {...iconProps} />,
    'french': <MapPin {...iconProps} />,
    'spanish-latin': <Sun {...iconProps} />,
    'japanese': <Mountain {...iconProps} />,
    'arabic': <Moon {...iconProps} />,

    // Meaning lists
    'meaning-light': <Lightbulb {...iconProps} />,
    'meaning-strength': <Dumbbell {...iconProps} />,
    'meaning-wisdom': <GraduationCap {...iconProps} />,
    'meaning-joy': <Smile {...iconProps} />,
    'meaning-love': <Heart {...iconProps} />,
    'meaning-brave': <Shield {...iconProps} />,
    'meaning-peace': <Bird {...iconProps} />,

    // Style lists
    'vintage-classic': <Clock {...iconProps} />,
    'modern-trendy': <Sparkles {...iconProps} />,
    'one-syllable': <Type {...iconProps} />,
    'four-letter': <Hash {...iconProps} />,
    'unique-rare': <Gem {...iconProps} />,

    // Theme lists
    'royal-regal': <Crown {...iconProps} />,
    'nature-inspired': <Trees {...iconProps} />,
    'celestial': <Star {...iconProps} />,
    'virtue-names': <Medal {...iconProps} />,
    'literary-names': <BookOpen {...iconProps} />,
    'gemstone-names': <Diamond {...iconProps} />,
    'flower-botanical': <Flower {...iconProps} />,
    'color-names': <Droplet {...iconProps} />,
    'musical-names': <Music {...iconProps} />,
    'seasonal-names': <Calendar {...iconProps} />,
  };

  // Return specific icon if found
  if (iconMap[listId]) {
    return iconMap[listId];
  }

  // Fallback by category with consistent grayscale color
  switch (category) {
    case 'origin':
      return <Globe {...iconProps} />;
    case 'meaning':
      return <Heart {...iconProps} />;
    case 'style':
      return <TrendingUp {...iconProps} />;
    case 'theme':
      return <Star {...iconProps} />;
    default:
      return <Globe {...iconProps} />;
  }
};

const ThemedListAccordion: React.FC<ThemedListAccordionProps> = ({
  list,
  allNames,
  defaultOpen = false,
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [genderFilter, setGenderFilter] = useState<'all' | 'male' | 'female' | 'unisex'>('all');
  const [sortBy, setSortBy] = useState<'alphabetical' | 'popularity' | 'random'>('alphabetical');
  const [sortReverse, setSortReverse] = useState(false);
  const [shuffleTrigger, setShuffleTrigger] = useState(0);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedName, setSelectedName] = useState<BabyName | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const namesPerPage = 30;

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [genderFilter, sortBy, sortReverse, shuffleTrigger]);

  // LIGHTWEIGHT COUNT: Calculate count for badge (fast, no full filtering)
  // Only counts names, doesn't build full filtered array
  const nameCount = useMemo(() => {
    // For specificNames lists, count is just the length of specificNames array
    if (list.filterCriteria.specificNames && list.filterCriteria.specificNames.length > 0) {
      return list.filterCriteria.specificNames.length;
    }

    // For other filter types, do a quick count-only filter
    let count = 0;
    const { filterCriteria } = list;

    for (const name of allNames) {
      // Quick check for origins
      if (filterCriteria.origins && filterCriteria.origins.length > 0) {
        const matchesOrigin = filterCriteria.origins.some(origin => {
          if (typeof name.origin === 'string') {
            return name.origin.toLowerCase() === origin.toLowerCase();
          }
          return false;
        });
        if (matchesOrigin) count++;
      }
    }

    return count;
  }, [allNames, list]);

  // LAZY FILTERING: Only calculate filtered names when accordion is open
  // This prevents 30 accordions from filtering 174k names simultaneously on mount
  const filteredNames = useMemo(() => {
    // If accordion is closed, return empty array (no expensive filtering)
    if (!isOpen) {
      return [];
    }

    let names = applyThemedListFilter(allNames, list);
    names = filterByGender(names, genderFilter);

    // Handle random shuffle
    if (sortBy === 'random') {
      // Fisher-Yates shuffle
      names = [...names];
      for (let i = names.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [names[i], names[j]] = [names[j], names[i]];
      }
    } else {
      names = sortNames(names, sortBy);
      // Apply reverse if needed (but not for random)
      if (sortReverse) {
        names = [...names].reverse();
      }
    }

    return names;
  }, [allNames, list, genderFilter, sortBy, sortReverse, shuffleTrigger, isOpen]);

  // Pagination
  const totalPages = Math.ceil(filteredNames.length / namesPerPage);
  const paginatedNames = filteredNames.slice(
    (currentPage - 1) * namesPerPage,
    currentPage * namesPerPage
  );

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 hover:border-gray-300 transition-all">
      {/* Accordion Header */}
      <button
        onClick={handleToggle}
        className="w-full px-5 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-900"
        aria-expanded={isOpen}
        aria-controls={`accordion-content-${list.id}`}
        id={`accordion-header-${list.id}`}
      >
        <div className="flex items-center gap-3.5 flex-1 text-left">
          <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-gray-700">
            {getListIcon(list.id, list.category)}
          </div>
          <div>
            <h3 className="text-base font-semibold text-gray-900">{list.title}</h3>
            <p className="text-sm text-gray-500 mt-0.5">{list.description}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="px-2.5 py-1 bg-gray-100 text-gray-700 rounded-md text-xs font-medium">
            {isOpen ? filteredNames.length : nameCount}
          </span>
          <ChevronDown
            className={`w-4 h-4 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`}
            strokeWidth={2}
          />
        </div>
      </button>

      {/* Accordion Content */}
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            id={`accordion-content-${list.id}`}
            role="region"
            aria-labelledby={`accordion-header-${list.id}`}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="border-t border-gray-200"
          >
            <div className="p-6">
              {/* Sort Bar - Same as HomePage */}
              <div className="mb-6 space-y-4">
                {/* Gender Filter */}
                <div className="flex flex-wrap gap-2">
                  {(['all', 'male', 'female', 'unisex'] as const).map(gender => (
                    <button
                      key={gender}
                      onClick={() => setGenderFilter(gender)}
                      className={`px-4 py-2 rounded-lg font-medium transition-all ${
                        genderFilter === gender
                          ? 'bg-gradient-to-r from-purple-400 to-pink-400 text-white shadow-md'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {gender.charAt(0).toUpperCase() + gender.slice(1)}
                    </button>
                  ))}
                </div>

                {/* Sort and View Controls - Compact Style from HomePage */}
                <div className="flex flex-wrap items-center gap-3">
                  {/* Sort Options - Compact Purple Style */}
                  <div className="flex items-stretch rounded-lg overflow-hidden border border-purple-200 bg-white">
                    {/* Sort Label */}
                    <span className="px-1.5 py-1 text-[10px] text-purple-700 font-semibold bg-purple-50 border-r border-purple-200 flex items-center whitespace-nowrap">
                      Sort:
                    </span>

                    {/* Popular Sort */}
                    <button
                      onClick={() => {
                        if (sortBy === 'popularity') {
                          setSortReverse(!sortReverse);
                        } else {
                          setSortBy('popularity');
                          setSortReverse(false);
                        }
                      }}
                      className={`px-1.5 py-1 flex items-center justify-center gap-0.5 text-[10px] font-medium transition-all border-r border-purple-200 whitespace-nowrap ${
                        sortBy === 'popularity'
                          ? 'bg-purple-500 text-white'
                          : 'bg-white text-purple-700 hover:bg-purple-50'
                      }`}
                      title={sortBy === 'popularity' && sortReverse ? "Least popular first" : "Most popular first"}
                    >
                      <Trophy className={`w-3 h-3 transition-transform ${sortBy === 'popularity' && sortReverse ? 'rotate-180' : ''}`} />
                      <span>Popular</span>
                    </button>

                    {/* A→Z Sort */}
                    <button
                      onClick={() => {
                        if (sortBy === 'alphabetical') {
                          setSortReverse(!sortReverse);
                        } else {
                          setSortBy('alphabetical');
                          setSortReverse(false);
                        }
                      }}
                      className={`px-1.5 py-1 flex items-center justify-center gap-0.5 text-[10px] font-medium transition-all border-r border-purple-200 whitespace-nowrap ${
                        sortBy === 'alphabetical'
                          ? 'bg-purple-500 text-white'
                          : 'bg-white text-purple-700 hover:bg-purple-50'
                      }`}
                      title={sortBy === 'alphabetical' && sortReverse ? "Sort Z to A" : "Sort A to Z"}
                    >
                      <ArrowDownAZ className={`w-3 h-3 transition-transform ${sortBy === 'alphabetical' && sortReverse ? 'rotate-180' : ''}`} />
                      <span>{sortBy === 'alphabetical' && sortReverse ? 'Z→A' : 'A→Z'}</span>
                    </button>

                    {/* Shuffle */}
                    <button
                      onClick={() => {
                        setSortBy('random');
                        setSortReverse(false);
                        // Increment shuffle trigger to force re-randomization each time
                        setShuffleTrigger(prev => prev + 1);
                      }}
                      className={`px-1.5 py-1 flex items-center justify-center gap-0.5 text-[10px] font-medium transition-all whitespace-nowrap ${
                        sortBy === 'random'
                          ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                          : 'bg-white text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <Dices className={`w-3 h-3 ${sortBy === 'random' ? 'animate-pulse' : ''}`} />
                      <span>Shuffle</span>
                    </button>
                  </div>

                  {/* View Toggle */}
                  <div className="flex gap-2 ml-auto">
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`p-2 rounded-lg transition-all ${
                        viewMode === 'grid'
                          ? 'bg-purple-100 text-purple-700'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                      title="Grid View"
                    >
                      <Grid3x3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={`p-2 rounded-lg transition-all ${
                        viewMode === 'list'
                          ? 'bg-purple-100 text-purple-700'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                      title="List View"
                    >
                      <List className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Names Grid/List */}
              {filteredNames.length > 0 ? (
                <>
                  {viewMode === 'grid' ? (
                    // Grid View - Card layout
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                      {paginatedNames.map((name, index) => (
                        <motion.div
                          key={`${name.name}-${index}`}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.03, duration: 0.3 }}
                        >
                          <NameCard
                            name={name}
                            onClick={() => setSelectedName(name)}
                            onFavoriteToggle={() => {
                              // Optional: trigger refresh if needed
                            }}
                          />
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    // Compact View - List layout
                    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
                      {paginatedNames.map((name, index) => (
                        <motion.div
                          key={`${name.name}-${index}`}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.02, duration: 0.2 }}
                        >
                          <NameCardCompact
                            name={name}
                            onClick={() => setSelectedName(name)}
                            onFavoriteToggle={() => {
                              // Optional: trigger refresh if needed
                            }}
                          />
                        </motion.div>
                      ))}
                    </div>
                  )}

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="mt-6 flex items-center justify-center gap-2">
                      <button
                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                        disabled={currentPage === 1}
                        className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        Previous
                      </button>

                      <span className="px-4 py-2 text-gray-700">
                        Page {currentPage} of {totalPages}
                      </span>

                      <button
                        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                        disabled={currentPage === totalPages}
                        className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        Next
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-500 text-lg">
                    No {genderFilter !== 'all' ? genderFilter : ''} names found in this category.
                  </p>
                  {genderFilter !== 'all' && (
                    <button
                      onClick={() => setGenderFilter('all')}
                      className="mt-4 px-6 py-2 bg-purple-400 text-white rounded-lg hover:bg-purple-500 transition-colors"
                    >
                      Show All Genders
                    </button>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Name Detail Modal */}
      {selectedName && (
        <NameDetailModal
          name={selectedName}
          onClose={() => setSelectedName(null)}
        />
      )}
    </div>
  );
};

export default ThemedListAccordion;
