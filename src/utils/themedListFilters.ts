import { BabyName } from '../services/nameService';
import { ThemedList } from '../data/themedLists';

/**
 * Apply a themed list's filter criteria to an array of names
 * OPTIMIZED: Uses Set lookup for O(1) performance instead of O(n) array.some()
 */
export const applyThemedListFilter = (
  names: BabyName[],
  list: ThemedList
): BabyName[] => {
  const { filterCriteria } = list;

  // PRE-COMPUTE: Build Set once for O(1) lookups (instead of O(n) for each name)
  let specificNamesSet: Set<string> | null = null;
  if (filterCriteria.specificNames && filterCriteria.specificNames.length > 0) {
    specificNamesSet = new Set(
      filterCriteria.specificNames.map(name => name.toLowerCase())
    );
  }

  return names.filter(name => {
    // If specificNames is defined, it acts as a whitelist (OR with other criteria)
    const hasSpecificNames = specificNamesSet !== null;
    const matchesSpecific = hasSpecificNames && specificNamesSet!.has(name.name.toLowerCase());

    // If name matches specificNames, it passes (bypass other filters)
    if (matchesSpecific) {
      return true;
    }

    // Otherwise, check other filters (only if specificNames didn't match or doesn't exist)

    // Apply origin filter
    if (filterCriteria.origins && filterCriteria.origins.length > 0) {
      const matchesOrigin = filterCriteria.origins.some(origin => {
        // Ensure origin is a string before calling toLowerCase
        if (typeof name.origin === 'string') {
          return name.origin.toLowerCase() === origin.toLowerCase();
        }
        return false;
      });
      if (!matchesOrigin) return false;
    }

    // Apply meaning keyword filter
    if (filterCriteria.meaningKeywords && filterCriteria.meaningKeywords.length > 0) {
      const meaningText = (name.meaning || '').toLowerCase();
      const matchesMeaning = filterCriteria.meaningKeywords.some(keyword =>
        meaningText.includes(keyword.toLowerCase())
      );
      if (!matchesMeaning) return false;
    }

    // Apply tags filter
    if (filterCriteria.tags && filterCriteria.tags.length > 0) {
      // Note: Current BabyName type doesn't have tags field, but we can check origin/meaning
      const matchesTag = filterCriteria.tags.some(tag => {
        const tagLower = tag.toLowerCase();
        const originMatch = typeof name.origin === 'string'
          ? name.origin.toLowerCase().includes(tagLower)
          : false;
        const meaningMatch = typeof name.meaning === 'string'
          ? name.meaning.toLowerCase().includes(tagLower)
          : false;
        return originMatch || meaningMatch;
      });
      if (!matchesTag) return false;
    }

    // Apply length filters
    if (filterCriteria.minLength && name.name.length < filterCriteria.minLength) {
      return false;
    }
    if (filterCriteria.maxLength && name.name.length > filterCriteria.maxLength) {
      return false;
    }

    // Apply syllable filter (optional property, may not exist on all names)
    if (filterCriteria.syllables !== undefined && (name as any).syllables !== undefined && (name as any).syllables !== filterCriteria.syllables) {
      return false;
    }

    // Apply custom filter function
    if (filterCriteria.customFilter) {
      return filterCriteria.customFilter(name);
    }

    return true;
  });
};

/**
 * Check if a name is unisex based on gender scores
 */
const isUnisexName = (name: BabyName): boolean => {
  if (name.isUnisex !== undefined) {
    return name.isUnisex;
  }

  if (typeof name.gender === 'object' && name.gender) {
    const maleScore = name.gender.Male || 0;
    const femaleScore = name.gender.Female || 0;
    const total = maleScore + femaleScore;

    if (total === 0) return false;

    const maleRatio = maleScore / total;
    // Consider unisex if ratio is between 35% and 65%
    const threshold = 0.35;

    return maleRatio >= threshold && maleRatio <= (1 - threshold);
  }

  return false;
};

/**
 * Filter names by gender
 * Handles both string gender field and object gender field with Male/Female scores
 */
export const filterByGender = (
  names: BabyName[],
  gender: 'all' | 'male' | 'female' | 'unisex'
): BabyName[] => {
  if (gender === 'all') return names;

  return names.filter(name => {
    // Handle object-based gender (with Male/Female scores)
    if (typeof name.gender === 'object' && name.gender) {
      const maleScore = name.gender.Male || 0;
      const femaleScore = name.gender.Female || 0;

      if (gender === 'unisex') {
        // Calculate if name is unisex
        return isUnisexName(name);
      } else if (gender === 'male') {
        return maleScore > femaleScore;
      } else {
        return femaleScore > maleScore;
      }
    }

    // Handle string-based gender (legacy/fallback)
    if (typeof name.gender === 'string') {
      if (gender === 'unisex') {
        return name.gender === 'unisex' || name.gender === 'both';
      }
      return name.gender === gender;
    }

    return false;
  });
};

/**
 * Sort names by specified criteria
 */
export const sortNames = (
  names: BabyName[],
  sortBy: 'alphabetical' | 'popularity'
): BabyName[] => {
  // Safety check: ensure names is an array
  if (!Array.isArray(names)) {
    console.error('sortNames: names parameter is not an array', names);
    return [];
  }

  const sortedNames = [...names];

  if (sortBy === 'alphabetical') {
    return sortedNames.sort((a, b) => a.name.localeCompare(b.name));
  }

  if (sortBy === 'popularity') {
    return sortedNames.sort((a, b) => {
      // Lower popularity rank = more popular (rank 1 is most popular)
      const popA = a.popularity || 999999;
      const popB = b.popularity || 999999;
      return popA - popB;
    });
  }

  return sortedNames;
};

/**
 * Get the count of names matching a themed list
 */
export const getThemedListCount = (
  names: BabyName[],
  list: ThemedList,
  genderFilter: 'all' | 'male' | 'female' | 'unisex' = 'all'
): number => {
  const filtered = applyThemedListFilter(names, list);
  const genderFiltered = filterByGender(filtered, genderFilter);
  return genderFiltered.length;
};

/**
 * Search lists by title or description
 */
export const searchLists = (
  lists: ThemedList[],
  searchTerm: string
): ThemedList[] => {
  if (!searchTerm.trim()) return lists;

  const term = searchTerm.toLowerCase();
  return lists.filter(list =>
    list.title.toLowerCase().includes(term) ||
    list.description.toLowerCase().includes(term)
  );
};
