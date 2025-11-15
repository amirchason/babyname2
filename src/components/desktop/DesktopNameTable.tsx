/**
 * Desktop Name Table Component
 * Sortable table view for desktop with detailed name information
 */

import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { ChevronUp, ChevronDown, Heart, X, Info } from 'lucide-react';
import { NameEntry } from '../../services/nameService';
import favoritesService from '../../services/favoritesService';

interface DesktopNameTableProps {
  names: NameEntry[];
  onNameClick: (name: NameEntry, index: number) => void;
  onFavoriteToggle?: () => void;
  onDislikeToggle?: () => void;
  currentPage: number;
  itemsPerPage: number;
  filterContext?: 'all' | 'male' | 'female' | 'unisex';
}

type SortColumn = 'name' | 'gender' | 'origin' | 'rank' | 'none';
type SortDirection = 'asc' | 'desc';

const DesktopNameTable: React.FC<DesktopNameTableProps> = ({
  names,
  onNameClick,
  onFavoriteToggle,
  onDislikeToggle,
  currentPage,
  itemsPerPage,
  filterContext = 'all',
}) => {
  const [sortColumn, setSortColumn] = useState<SortColumn>('none');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  // Handle column header click
  const handleSort = (column: SortColumn) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  // Sort names based on current sort settings
  const sortedNames = useMemo(() => {
    if (sortColumn === 'none') return names;

    return [...names].sort((a, b) => {
      let compareValue = 0;

      switch (sortColumn) {
        case 'name':
          compareValue = a.name.localeCompare(b.name);
          break;
        case 'gender':
          const genderA = typeof a.gender === 'string' ? a.gender : '';
          const genderB = typeof b.gender === 'string' ? b.gender : '';
          compareValue = genderA.localeCompare(genderB);
          break;
        case 'origin':
          compareValue = (a.origin || '').localeCompare(b.origin || '');
          break;
        case 'rank':
          const rankA = a.popularityRank || 999999;
          const rankB = b.popularityRank || 999999;
          compareValue = rankA - rankB;
          break;
      }

      return sortDirection === 'asc' ? compareValue : -compareValue;
    });
  }, [names, sortColumn, sortDirection]);

  // Pagination
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedNames = sortedNames.slice(startIndex, endIndex);

  // Helper to render sort icon
  const SortIcon: React.FC<{ column: SortColumn }> = ({ column }) => {
    if (sortColumn !== column) return null;
    return sortDirection === 'asc' ? (
      <ChevronUp className="w-4 h-4" />
    ) : (
      <ChevronDown className="w-4 h-4" />
    );
  };

  const handleFavorite = (e: React.MouseEvent, name: string) => {
    e.stopPropagation();
    if (favoritesService.isFavorite(name)) {
      favoritesService.removeFavorite(name);
    } else {
      favoritesService.addFavorite(name);
    }
    onFavoriteToggle?.();
  };

  const handleDislike = (e: React.MouseEvent, name: string) => {
    e.stopPropagation();
    if (favoritesService.isDisliked(name)) {
      favoritesService.removeDislikes(name);
    } else {
      favoritesService.addDislike(name);
    }
    onDislikeToggle?.();
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
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  #
                </th>
                <th
                  onClick={() => handleSort('name')}
                  className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    Name
                    <SortIcon column="name" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('gender')}
                  className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    Gender
                    <SortIcon column="gender" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('origin')}
                  className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    Origin
                    <SortIcon column="origin" />
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Meaning
                </th>
                <th
                  onClick={() => handleSort('rank')}
                  className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    Rank
                    <SortIcon column="rank" />
                  </div>
                </th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {paginatedNames.map((name, index) => {
                const isFavorite = favoritesService.isFavorite(name.name);
                const isDisliked = favoritesService.isDisliked(name.name);
                const actualIndex = startIndex + index;

                return (
                  <motion.tr
                    key={`${name.name}-${actualIndex}`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.02 }}
                    onClick={() => onNameClick(name, actualIndex)}
                    className="hover:bg-purple-50 cursor-pointer transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {actualIndex + 1}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-gray-900">{name.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          name.gender === 'Male'
                            ? 'bg-blue-100 text-blue-800'
                            : name.gender === 'Female'
                            ? 'bg-pink-100 text-pink-800'
                            : 'bg-purple-100 text-purple-800'
                        }`}
                      >
                        {typeof name.gender === 'string' ? name.gender : 'Unknown'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {name.origin || 'Unknown'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate">
                      {name.meaning || 'No meaning available'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {name.popularityRank ? `#${name.popularityRank.toLocaleString()}` : '—'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={(e) => handleFavorite(e, name.name)}
                          className={`p-1.5 rounded-lg transition-all ${
                            isFavorite
                              ? 'bg-pink-100 text-pink-600 hover:bg-pink-200'
                              : 'text-gray-400 hover:bg-gray-100 hover:text-pink-600'
                          }`}
                          title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                        >
                          <Heart
                            className="w-4 h-4"
                            fill={isFavorite ? 'currentColor' : 'none'}
                          />
                        </button>
                        <button
                          onClick={(e) => handleDislike(e, name.name)}
                          className={`p-1.5 rounded-lg transition-all ${
                            isDisliked
                              ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                              : 'text-gray-400 hover:bg-gray-100 hover:text-gray-700'
                          }`}
                          title={isDisliked ? 'Remove from dislikes' : 'Add to dislikes'}
                        >
                          <X className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onNameClick(name, actualIndex)}
                          className="p-1.5 rounded-lg text-purple-600 hover:bg-purple-100 transition-colors"
                          title="View details"
                        >
                          <Info className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DesktopNameTable;
