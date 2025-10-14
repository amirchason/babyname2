/**
 * Blog Name List Component
 * Displays featured names from a blog post in an interactive grid with filtering
 */

import React, { useState, useEffect } from 'react';
import { NameEntry } from '../types';
import nameService from '../services/nameService';
import NameCard from './NameCard';
import { Sparkles, Filter } from 'lucide-react';

interface BlogNameListProps {
  /**
   * HTML content of the blog post
   */
  content: string;
}

type GenderFilter = 'all' | 'boy' | 'girl' | 'unisex';
type SortOption = 'featured' | 'popularity' | 'alphabetical';

// Extract featured names from blog HTML content
const extractFeaturedNames = (html: string): string[] => {
  const names: string[] = [];
  // Match pattern: <strong>Name</strong> (word boundaries)
  const strongMatches = html.matchAll(/<strong>([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)<\/strong>/g);

  for (const match of strongMatches) {
    const name = match[1].trim();
    // Filter out common false positives
    if (name && !names.includes(name) && name.length > 1) {
      names.push(name);
    }
  }

  return names;
};

export default function BlogNameList({ content }: BlogNameListProps) {
  const [featuredNames, setFeaturedNames] = useState<NameEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [genderFilter, setGenderFilter] = useState<GenderFilter>('all');
  const [sortOption, setSortOption] = useState<SortOption>('featured');

  useEffect(() => {
    loadFeaturedNames();
  }, [content]);

  const loadFeaturedNames = async () => {
    try {
      // Extract name strings from content
      const nameStrings = extractFeaturedNames(content);

      // Fetch full name data from database
      const nameDataPromises = nameStrings.map(async (nameStr) => {
        try {
          const nameData = await nameService.getNameDetails(nameStr);
          return nameData;
        } catch (err) {
          console.warn(`Could not find name data for: ${nameStr}`);
          return null;
        }
      });

      const nameData = await Promise.all(nameDataPromises);

      // Filter out nulls and set state
      const validNames = nameData.filter((n): n is NameEntry => n !== null);
      setFeaturedNames(validNames);
    } catch (error) {
      console.error('Error loading featured names:', error);
    } finally {
      setLoading(false);
    }
  };

  // Apply filters (ensure all names are valid)
  const filteredNames = featuredNames.filter((name) => {
    // Skip undefined or invalid names
    if (!name || !name.name) return false;

    if (genderFilter === 'all') return true;

    if (genderFilter === 'unisex') {
      return name.sex === 'Unisex' || name.sex === 'Both';
    }

    if (genderFilter === 'boy') {
      return name.sex === 'M' || name.sex === 'Male' || name.sex === 'Boy';
    }

    if (genderFilter === 'girl') {
      return name.sex === 'F' || name.sex === 'Female' || name.sex === 'Girl';
    }

    return true;
  });

  // Apply sorting
  const sortedNames = [...filteredNames].sort((a, b) => {
    if (sortOption === 'featured') {
      // Keep original order from blog post
      return 0;
    }

    if (sortOption === 'popularity') {
      // Sort by popularity (assuming lower number = more popular)
      const popA = typeof a.popularity === 'number' ? a.popularity : 99999;
      const popB = typeof b.popularity === 'number' ? b.popularity : 99999;
      return popA - popB;
    }

    if (sortOption === 'alphabetical') {
      return a.name.localeCompare(b.name);
    }

    return 0;
  });

  if (loading) {
    return (
      <div className="mt-12 mb-8">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-purple-200 border-t-purple-600 mb-4"></div>
            <p className="text-gray-600">Loading featured names...</p>
          </div>
        </div>
      </div>
    );
  }

  if (featuredNames.length === 0) {
    return null; // Don't show section if no names found
  }

  return (
    <div className="mt-12 mb-8">
      {/* Section Header */}
      <div className="flex items-center gap-3 mb-6">
        <Sparkles className="w-7 h-7 text-purple-600" />
        <h2 className="text-3xl font-bold text-gray-800">
          Explore All {featuredNames.length} Names
        </h2>
      </div>

      <p className="text-gray-600 mb-6 text-lg">
        Click the heart ❤️ on any name to add it to your favorites! Each name below is from the SoulSeed database with complete meanings, origins, and popularity data.
      </p>

      {/* Filter & Sort Bar */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6 sticky top-16 z-10">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          {/* Gender Filter */}
          <div className="flex items-center gap-2 flex-wrap">
            <Filter className="w-5 h-5 text-gray-600" />
            <span className="text-sm font-medium text-gray-700">Gender:</span>
            <div className="flex gap-2">
              {(['all', 'boy', 'girl', 'unisex'] as const).map((filter) => (
                <button
                  key={filter}
                  onClick={() => setGenderFilter(filter)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    genderFilter === filter
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {filter === 'all' ? 'All' : filter.charAt(0).toUpperCase() + filter.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Sort Options */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700">Sort:</span>
            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value as SortOption)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            >
              <option value="featured">Featured Order</option>
              <option value="popularity">Most Popular</option>
              <option value="alphabetical">A-Z</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results Count */}
      <div className="mb-4 text-sm text-gray-600">
        Showing {sortedNames.length} of {featuredNames.length} names
      </div>

      {/* Name Cards Grid - Compact Display Mode */}
      {sortedNames.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
          {sortedNames.map((name) => (
            <NameCard key={`${name.name}-${name.origin}`} name={name} compact />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-lg shadow-md">
          <p className="text-gray-600 text-lg">
            No names found matching your filters. Try selecting "All" to see all names.
          </p>
        </div>
      )}

      {/* Call to Action */}
      <div className="mt-8 p-6 bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg border-l-4 border-purple-600">
        <h3 className="text-xl font-bold text-gray-800 mb-2">
          Want to explore even more names?
        </h3>
        <p className="text-gray-700 mb-4">
          Discover our complete database of 174,000+ names with our Tinder-style swipe feature, advanced filters, and personalized recommendations.
        </p>
        <a
          href="/"
          className="inline-block px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-semibold hover:shadow-lg transition"
        >
          Explore SoulSeed App →
        </a>
      </div>
    </div>
  );
}
