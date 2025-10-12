/**
 * useFirstVisit Hook
 * Tracks if this is the first visit to a page in the session
 * Prevents animations from replaying on subsequent visits
 */

import { useEffect, useState } from 'react';

export const useFirstVisit = (pageKey: string): boolean => {
  const [isFirstVisit, setIsFirstVisit] = useState(false);

  useEffect(() => {
    // Check sessionStorage to see if we've visited this page before
    const sessionKey = `visited_${pageKey}`;
    const hasVisited = sessionStorage.getItem(sessionKey);

    if (!hasVisited) {
      // First visit in this session
      setIsFirstVisit(true);
      sessionStorage.setItem(sessionKey, 'true');
    } else {
      // Already visited
      setIsFirstVisit(false);
    }
  }, [pageKey]);

  return isFirstVisit;
};

/**
 * Reset all first visit flags (useful for testing or logout)
 */
export const resetFirstVisitFlags = () => {
  const keys = Object.keys(sessionStorage).filter(key => key.startsWith('visited_'));
  keys.forEach(key => sessionStorage.removeItem(key));
};
