import React, { useEffect } from 'react';
import { ChevronLeft, ChevronRight, MoreHorizontal, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  itemsPerPage: number;
  totalItems: number;
  isLoading?: boolean;
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  itemsPerPage,
  totalItems,
  isLoading = false
}) => {
  // Check if mobile device
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 640;

  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Only handle if not typing in input field
      if (document.activeElement?.tagName === 'INPUT') return;

      if (e.key === 'ArrowLeft' && currentPage > 1) {
        onPageChange(currentPage - 1);
      } else if (e.key === 'ArrowRight' && currentPage < totalPages) {
        onPageChange(currentPage + 1);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [currentPage, totalPages, onPageChange]);

  // Calculate which pages to show
  const getVisiblePages = (): (number | string)[] => {
    const visiblePages: (number | string)[] = [];

    // Mobile: Show fewer pages
    if (isMobile) {
      if (totalPages <= 5) {
        // Show all pages if there are 5 or fewer on mobile
        for (let i = 1; i <= totalPages; i++) {
          visiblePages.push(i);
        }
      } else {
        // Always show first page
        visiblePages.push(1);

        if (currentPage <= 3) {
          // Near the beginning
          for (let i = 2; i <= Math.min(3, totalPages); i++) {
            visiblePages.push(i);
          }
          if (totalPages > 3) {
            visiblePages.push('...');
            visiblePages.push(totalPages);
          }
        } else if (currentPage >= totalPages - 2) {
          // Near the end
          visiblePages.push('...');
          for (let i = Math.max(totalPages - 2, 2); i <= totalPages; i++) {
            visiblePages.push(i);
          }
        } else {
          // In the middle - show current page only with dots
          visiblePages.push('...');
          visiblePages.push(currentPage);
          visiblePages.push('...');
          visiblePages.push(totalPages);
        }
      }
    } else {
      // Desktop: Original logic
      const delta = 2;

      if (totalPages <= 7) {
        for (let i = 1; i <= totalPages; i++) {
          visiblePages.push(i);
        }
      } else {
        visiblePages.push(1);

        if (currentPage <= 4) {
          for (let i = 2; i <= 5; i++) {
            visiblePages.push(i);
          }
          visiblePages.push('...');
          visiblePages.push(totalPages);
        } else if (currentPage >= totalPages - 3) {
          visiblePages.push('...');
          for (let i = totalPages - 4; i <= totalPages; i++) {
            visiblePages.push(i);
          }
        } else {
          visiblePages.push('...');
          for (let i = currentPage - delta; i <= currentPage + delta; i++) {
            visiblePages.push(i);
          }
          visiblePages.push('...');
          visiblePages.push(totalPages);
        }
      }
    }

    return visiblePages;
  };

  const visiblePages = getVisiblePages();
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col items-center space-y-4"
    >
      {/* Loading Indicator */}
      <AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="flex items-center gap-2 text-purple-600 font-medium text-sm"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            >
              <Zap className="w-4 h-4" />
            </motion.div>
            Loading names...
          </motion.div>
        )}
      </AnimatePresence>

      {/* Page Info with Animation */}
      <motion.div
        key={`${currentPage}-info`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.2 }}
        className="text-sm text-gray-600"
      >
        Showing <span className="font-semibold text-gray-900">{startItem}</span> to{' '}
        <span className="font-semibold text-gray-900">{endItem}</span> of{' '}
        <span className="font-semibold text-gray-900">{totalItems.toLocaleString()}</span> names
      </motion.div>

      {/* Pagination Controls */}
      <div className="flex items-center space-x-1 sm:space-x-2">
        {/* Previous Button - Larger on mobile */}
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className={`
            flex items-center justify-center
            w-11 h-11 sm:w-10 sm:h-10
            rounded-lg transition-all font-medium
            ${currentPage === 1
              ? 'text-gray-400 cursor-not-allowed bg-gray-100'
              : 'text-gray-700 hover:text-purple-600 hover:bg-purple-50 bg-white border border-gray-200 hover:border-purple-200 shadow-sm hover:shadow-md active:scale-95'
            }
          `}
          title="Previous page"
        >
          <ChevronLeft className="w-5 h-5 sm:w-4 sm:h-4" />
        </button>

        {/* Page Numbers */}
        {visiblePages.map((page, index) => (
          <React.Fragment key={index}>
            {page === '...' ? (
              <div className="hidden sm:flex items-center justify-center w-10 h-10">
                <MoreHorizontal className="w-5 h-5 text-gray-400" />
              </div>
            ) : (
              <motion.button
                onClick={() => onPageChange(page as number)}
                whileHover={{ scale: currentPage === page ? 1.05 : 1.1, y: -2 }}
                whileTap={{ scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className={`
                  flex items-center justify-center
                  w-11 h-11 sm:w-10 sm:h-10
                  rounded-lg font-medium text-sm
                  ${currentPage === page
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg transform scale-105'
                    : 'text-gray-700 hover:text-purple-600 hover:bg-purple-50 bg-white border border-gray-200 hover:border-purple-200 shadow-sm'
                  }
                `}
                title={`Go to page ${page}`}
              >
                {page}
              </motion.button>
            )}
          </React.Fragment>
        ))}

        {/* Next Button - Larger on mobile */}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={`
            flex items-center justify-center
            w-11 h-11 sm:w-10 sm:h-10
            rounded-lg transition-all font-medium
            ${currentPage === totalPages
              ? 'text-gray-400 cursor-not-allowed bg-gray-100'
              : 'text-gray-700 hover:text-purple-600 hover:bg-purple-50 bg-white border border-gray-200 hover:border-purple-200 shadow-sm hover:shadow-md active:scale-95'
            }
          `}
          title="Next page"
        >
          <ChevronRight className="w-5 h-5 sm:w-4 sm:h-4" />
        </button>
      </div>

      {/* Quick Jump - Hidden on mobile for simplicity */}
      {totalPages > 10 && (
        <div className="hidden sm:flex items-center space-x-2 text-sm">
          <span className="text-gray-600">Jump to page:</span>
          <input
            type="number"
            min="1"
            max={totalPages}
            value={currentPage}
            onChange={(e) => {
              const page = parseInt(e.target.value);
              if (page >= 1 && page <= totalPages) {
                onPageChange(page);
              }
            }}
            className="w-16 px-2 py-1 text-center border border-gray-300 rounded-md focus:outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-400"
          />
          <span className="text-gray-600">of {totalPages}</span>
        </div>
      )}

      {/* Mobile-only: Current page indicator */}
      <div className="sm:hidden text-sm text-gray-600 mt-2">
        Page {currentPage} of {totalPages}
      </div>

      {/* Desktop-only: Keyboard navigation hint */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 0.5 }}
        className="hidden sm:flex items-center gap-2 text-xs text-gray-500 mt-2"
      >
        <span className="px-2 py-1 bg-gray-100 rounded border border-gray-200 font-mono">←</span>
        <span className="px-2 py-1 bg-gray-100 rounded border border-gray-200 font-mono">→</span>
        <span>Use arrow keys to navigate</span>
      </motion.div>
    </motion.div>
  );
};

export default Pagination;