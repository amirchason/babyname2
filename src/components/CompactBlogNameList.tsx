/**
 * Compact Blog Name List Component
 * Minimal list view for bottom of blog posts - just names with like/unlike buttons
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { NameEntry } from '../services/nameService';
import nameService from '../services/nameService';
import favoritesService from '../services/favoritesService';
import NameCard from './NameCard';
import { Heart, X, Grid3x3, List } from 'lucide-react';

interface CompactBlogNameListProps {
  content: string;
}

// Extract featured names from blog HTML content
const extractFeaturedNames = (html: string): string[] => {
  const names: string[] = [];

  // Pattern 1: <strong>Name</strong> or <strong>1. Name</strong>
  const strongMatches = html.matchAll(/<strong>(?:\d+\.\s+)?([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)<\/strong>/g);
  for (const match of strongMatches) {
    const name = match[1].trim();
    if (name && !names.includes(name) && name.length > 1) {
      names.push(name);
    }
  }

  // Pattern 2: <h3>Name</h3> or <h3>1. Name</h3>
  const h3Matches = html.matchAll(/<h3[^>]*>(?:\d+\.\s+)?([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)<\/h3>/g);
  for (const match of h3Matches) {
    const name = match[1].trim();
    if (name && !names.includes(name) && name.length > 1) {
      names.push(name);
    }
  }

  // Pattern 3: <h2>Name</h2> or <h2>1. Name</h2>
  const h2Matches = html.matchAll(/<h2[^>]*>(?:\d+\.\s+)?([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)<\/h2>/g);
  for (const match of h2Matches) {
    const name = match[1].trim();
    if (name && !names.includes(name) && name.length > 1) {
      names.push(name);
    }
  }

  return names;
};

export default function CompactBlogNameList({ content }: CompactBlogNameListProps) {
  const [featuredNames, setFeaturedNames] = useState<NameEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [hiddenNames, setHiddenNames] = useState<Set<string>>(new Set());
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [dislikes, setDislikes] = useState<Set<string>>(new Set());
  const [compactMode, setCompactMode] = useState(true); // Toggle between compact and card mode

  useEffect(() => {
    loadFeaturedNames();
    loadUserPreferences();
  }, [content]);

  // Listen for favorite/dislike events to update state
  useEffect(() => {
    const handleDislike = (event: Event) => {
      const customEvent = event as CustomEvent;
      const dislikedName = customEvent.detail?.name;
      if (dislikedName) {
        setHiddenNames(prev => new Set(prev).add(dislikedName));
        setDislikes(prev => new Set(prev).add(dislikedName));
        setFavorites(prev => {
          const newSet = new Set(prev);
          newSet.delete(dislikedName);
          return newSet;
        });
      }
    };

    const handleFavoriteAdded = (event: Event) => {
      const customEvent = event as CustomEvent;
      const favoritedName = customEvent.detail?.name;
      if (favoritedName) {
        setFavorites(prev => new Set(prev).add(favoritedName));
        setDislikes(prev => {
          const newSet = new Set(prev);
          newSet.delete(favoritedName);
          return newSet;
        });
        setHiddenNames(prev => {
          const newSet = new Set(prev);
          newSet.delete(favoritedName);
          return newSet;
        });
      }
    };

    const handleFavoriteRemoved = (event: Event) => {
      const customEvent = event as CustomEvent;
      const unlikedName = customEvent.detail?.name;
      if (unlikedName) {
        setFavorites(prev => {
          const newSet = new Set(prev);
          newSet.delete(unlikedName);
          return newSet;
        });
        if (favoritesService.isDisliked(unlikedName)) {
          setHiddenNames(prev => new Set(prev).add(unlikedName));
          setDislikes(prev => new Set(prev).add(unlikedName));
        }
      }
    };

    window.addEventListener('nameDisliked', handleDislike);
    window.addEventListener('favoriteAdded', handleFavoriteAdded);
    window.addEventListener('favoriteRemoved', handleFavoriteRemoved);

    return () => {
      window.removeEventListener('nameDisliked', handleDislike);
      window.removeEventListener('favoriteAdded', handleFavoriteAdded);
      window.removeEventListener('favoriteRemoved', handleFavoriteRemoved);
    };
  }, []);

  const loadUserPreferences = () => {
    const favs = favoritesService.getFavorites();
    const dislikesArray = favoritesService.getDislikes();
    setFavorites(new Set(favs));
    setDislikes(new Set(dislikesArray));
    setHiddenNames(new Set(dislikesArray));
  };

  const loadFeaturedNames = async () => {
    try {
      console.log('[CompactBlogNameList] 🔍 Starting name extraction from blog content...');

      // Extract name strings from content
      const nameStrings = extractFeaturedNames(content);
      console.log(`[CompactBlogNameList] ✅ Extracted ${nameStrings.length} names:`, nameStrings.slice(0, 10));

      if (nameStrings.length === 0) {
        console.warn('[CompactBlogNameList] ⚠️ No names extracted from HTML! Check blog content format.');
        setLoading(false);
        return;
      }

      // Wait for database to be ready (ensure all chunks are loaded)
      console.log('[CompactBlogNameList] ⏳ Waiting for database to load...');
      await nameService.waitForLoad();
      console.log('[CompactBlogNameList] ✅ Database ready!');

      // RETRY MECHANISM: If database returns 0 names, wait and try again
      let retryCount = 0;
      let validNames: NameEntry[] = [];

      while (retryCount < 3 && validNames.length === 0) {
        console.log(`[CompactBlogNameList] 🔄 Attempt ${retryCount + 1}/3: Looking up names in database...`);

        // Fetch full name data from database
        const nameDataPromises = nameStrings.map(async (nameStr) => {
          try {
            const nameData = await nameService.getNameDetails(nameStr);
            if (!nameData) {
              console.warn(`[CompactBlogNameList] ❌ Name not found: "${nameStr}"`);
            }
            return nameData;
          } catch (err) {
            console.error(`[CompactBlogNameList] ❌ Error fetching "${nameStr}":`, err);
            return null;
          }
        });

        const nameData = await Promise.all(nameDataPromises);

        // Filter out nulls and set state
        validNames = nameData.filter((n): n is NameEntry => n !== null);

        console.log(`[CompactBlogNameList] 📊 Found ${validNames.length} valid names out of ${nameStrings.length} extracted`);

        if (validNames.length === 0 && retryCount < 2) {
          console.log('[CompactBlogNameList] ⏳ Retrying in 1 second...');
          await new Promise(resolve => setTimeout(resolve, 1000));
          await nameService.waitForLoad(); // Try waiting again
          retryCount++;
        } else {
          break;
        }
      }

      if (validNames.length === 0) {
        console.error('[CompactBlogNameList] ❌ FAILED: Could not find any names in database after 3 attempts');
        console.error('[CompactBlogNameList] Extracted names:', nameStrings);
      } else {
        console.log(`[CompactBlogNameList] ✅ SUCCESS: Loaded ${validNames.length} names for display`);
      }

      setFeaturedNames(validNames);
    } catch (error) {
      console.error('[CompactBlogNameList] ❌ Critical error loading featured names:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = (e: React.MouseEvent, name: string) => {
    e.stopPropagation();
    favoritesService.toggleFavorite(name);
    const isFavorite = favoritesService.isFavorite(name);

    if (isFavorite) {
      setFavorites(prev => new Set(prev).add(name));
      setDislikes(prev => {
        const newSet = new Set(prev);
        newSet.delete(name);
        return newSet;
      });
      setHiddenNames(prev => {
        const newSet = new Set(prev);
        newSet.delete(name);
        return newSet;
      });
    } else {
      setFavorites(prev => {
        const newSet = new Set(prev);
        newSet.delete(name);
        return newSet;
      });
    }
  };

  const handleDislike = (e: React.MouseEvent, name: string) => {
    e.stopPropagation();
    favoritesService.toggleDislike(name);
    const isDisliked = favoritesService.isDisliked(name);

    if (isDisliked) {
      setHiddenNames(prev => new Set(prev).add(name));
      setDislikes(prev => new Set(prev).add(name));
      setFavorites(prev => {
        const newSet = new Set(prev);
        newSet.delete(name);
        return newSet;
      });
    } else {
      setHiddenNames(prev => {
        const newSet = new Set(prev);
        newSet.delete(name);
        return newSet;
      });
      setDislikes(prev => {
        const newSet = new Set(prev);
        newSet.delete(name);
        return newSet;
      });
    }
  };

  // Filter out hidden names
  const visibleNames = featuredNames.filter(name => !hiddenNames.has(name.name));

  if (loading) {
    return (
      <div className="my-8 p-6 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg border border-purple-200">
        <div className="text-center text-gray-600">
          <div className="inline-block animate-spin rounded-full h-6 w-6 border-2 border-purple-200 border-t-purple-600 mb-2"></div>
          <p className="text-sm">Loading names...</p>
        </div>
      </div>
    );
  }

  if (featuredNames.length === 0 && !loading) {
    // Show helpful debug message in development mode
    if (process.env.NODE_ENV === 'development') {
      const extractedCount = extractFeaturedNames(content).length;
      return (
        <div className="my-8 p-6 bg-yellow-50 rounded-lg border-2 border-yellow-300">
          <h3 className="text-lg font-bold text-yellow-800 mb-2">
            ⚠️ Debug: Blog Name List Not Loaded
          </h3>
          <div className="text-sm text-yellow-700 space-y-1">
            <p>• Extracted <strong>{extractedCount}</strong> names from HTML</p>
            <p>• Found <strong>0</strong> matching names in database</p>
            <p>• Check browser console for detailed logs</p>
          </div>
        </div>
      );
    }
    return null; // Don't show in production if no names found
  }

  return (
    <div className="my-8 p-6 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg border border-purple-200">
      {/* Header with Toggle */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-2xl font-bold text-gray-800">
            Quick Reference: All {featuredNames.length} Names
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            Showing {visibleNames.length} of {featuredNames.length} names
          </p>
        </div>

        {/* Mode Toggle */}
        <div className="flex gap-2 bg-white rounded-lg p-1 shadow-sm">
          <button
            onClick={() => setCompactMode(true)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium transition-all ${
              compactMode
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
            title="Compact list view"
          >
            <List className="w-4 h-4" />
            <span className="hidden sm:inline">Compact</span>
          </button>
          <button
            onClick={() => setCompactMode(false)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium transition-all ${
              !compactMode
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
            title="Card view with full details"
          >
            <Grid3x3 className="w-4 h-4" />
            <span className="hidden sm:inline">Cards</span>
          </button>
        </div>
      </div>

      {/* Compact Mode - Minimal List */}
      {compactMode ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
        <AnimatePresence mode="popLayout">
          {visibleNames.map((name) => {
            const isFavorite = favorites.has(name.name);
            const isDisliked = dislikes.has(name.name);

            return (
              <motion.div
                key={name.name}
                layout
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{
                  opacity: 0,
                  scale: 0.5,
                  transition: { duration: 0.2 }
                }}
                transition={{
                  layout: { duration: 0.3 }
                }}
                className="bg-white rounded-lg p-3 shadow-sm hover:shadow-md transition-shadow border border-gray-200"
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-800 text-sm truncate flex-1">
                    {name.name}
                  </span>

                  <div className="flex gap-1 ml-2">
                    <button
                      onClick={(e) => handleDislike(e, name.name)}
                      className={`p-1 rounded-full transition-colors ${
                        isDisliked
                          ? 'bg-red-100 text-red-500'
                          : 'hover:bg-gray-100 text-gray-400'
                      }`}
                      title="Hide"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={(e) => handleLike(e, name.name)}
                      className={`p-1 rounded-full transition-colors ${
                        isFavorite
                          ? 'bg-pink-100 text-pink-500'
                          : 'hover:bg-gray-100 text-gray-400'
                      }`}
                      title="Favorite"
                    >
                      <Heart className={`w-3.5 h-3.5 ${isFavorite ? 'fill-current' : ''}`} />
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
        </div>
      ) : (
        /* Card Mode - Full NameCard components */
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          <AnimatePresence mode="popLayout">
            {visibleNames.map((name) => (
              <motion.div
                key={name.name}
                layout
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{
                  opacity: 0,
                  scale: 0.5,
                  transition: { duration: 0.2 }
                }}
                transition={{
                  layout: { duration: 0.3 }
                }}
                className="h-full"
              >
                <NameCard name={name} compact />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {visibleNames.length === 0 && (
        <div className="text-center py-8 text-gray-600">
          <p>All names hidden. Try refreshing the page to see them again.</p>
        </div>
      )}
    </div>
  );
}
