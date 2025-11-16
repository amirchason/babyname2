/**
 * Custom hook to detect scroll direction and header visibility
 * Implements best practices for hide-on-scroll headers:
 * - Shows header when scrolling up
 * - Hides header when scrolling down (past threshold)
 * - Always visible at top of page
 * - Uses requestAnimationFrame for performance
 */

import { useState, useEffect } from 'react';

export const useScrollDirection = (threshold: number = 100) => {
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    let ticking = false;

    const updateScrollDirection = () => {
      const scrollY = window.scrollY;

      // Always show header when at top of page
      if (scrollY < threshold) {
        setIsVisible(true);
        setLastScrollY(scrollY);
        ticking = false;
        return;
      }

      // Only update if scrolled enough to avoid jitter
      if (Math.abs(scrollY - lastScrollY) < 10) {
        ticking = false;
        return;
      }

      // Show on scroll up, hide on scroll down
      setIsVisible(scrollY < lastScrollY);
      setLastScrollY(scrollY);
      ticking = false;
    };

    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(updateScrollDirection);
        ticking = true;
      }
    };

    window.addEventListener('scroll', onScroll);

    return () => window.removeEventListener('scroll', onScroll);
  }, [lastScrollY, threshold]);

  return isVisible;
};
