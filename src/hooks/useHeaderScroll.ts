/**
 * Custom hook for desktop header scroll tracking
 * Returns scroll state for glass morphism and size changes
 */

import { useState, useEffect } from 'react';

interface HeaderScrollState {
  scrollY: number;
  isCompact: boolean;
  isAtTop: boolean;
}

export const useHeaderScroll = (compactThreshold: number = 100): HeaderScrollState => {
  const [scrollY, setScrollY] = useState(0);
  const [isCompact, setIsCompact] = useState(false);
  const [isAtTop, setIsAtTop] = useState(true);

  useEffect(() => {
    let ticking = false;

    const updateScrollState = () => {
      const currentScrollY = window.scrollY;

      setScrollY(currentScrollY);
      setIsCompact(currentScrollY > compactThreshold);
      setIsAtTop(currentScrollY < 10);

      ticking = false;
    };

    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(updateScrollState);
        ticking = true;
      }
    };

    window.addEventListener('scroll', onScroll);
    updateScrollState(); // Initial call

    return () => window.removeEventListener('scroll', onScroll);
  }, [compactThreshold]);

  return { scrollY, isCompact, isAtTop };
};
