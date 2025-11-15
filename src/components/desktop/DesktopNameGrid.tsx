/**
 * Desktop Name Grid Component
 * Multi-column grid layout optimized for desktop (3-4 columns)
 */

import React from 'react';
import { motion } from 'framer-motion';
import { NameEntry } from '../../services/nameService';
import NameCard from '../NameCard';

interface DesktopNameGridProps {
  names: NameEntry[];
  onNameClick: (name: NameEntry, index: number) => void;
  onFavoriteToggle?: () => void;
  onDislikeToggle?: () => void;
  currentPage: number;
  itemsPerPage: number;
  filterContext?: 'all' | 'male' | 'female' | 'unisex';
}

const DesktopNameGrid: React.FC<DesktopNameGridProps> = ({
  names,
  onNameClick,
  onFavoriteToggle,
  onDislikeToggle,
  currentPage,
  itemsPerPage,
  filterContext = 'all',
}) => {
  // Pagination
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedNames = names.slice(startIndex, endIndex);

  // Grid animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.03,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.4,
      },
    },
  };

  if (paginatedNames.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-6xl mb-4"
          >
            🔍
          </motion.div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">No names found</h3>
          <p className="text-gray-500">Try adjusting your filters</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-6">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-3 xl:grid-cols-4 gap-6"
      >
        {paginatedNames.map((name, index) => (
          <motion.div key={`${name.name}-${startIndex + index}`} variants={itemVariants}>
            <NameCard
              name={name}
              onClick={() => onNameClick(name, startIndex + index)}
              onFavoriteToggle={onFavoriteToggle}
              onDislikeToggle={onDislikeToggle}
              filterContext={filterContext}
              contextualRank={startIndex + index + 1}
            />
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
};

export default DesktopNameGrid;
