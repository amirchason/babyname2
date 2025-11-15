/**
 * useDeviceType Hook
 * Detects whether user is on desktop or mobile based on screen width
 * Breakpoint: 1024px (Tailwind's lg breakpoint)
 */

import { useState, useEffect } from 'react';

export type DeviceType = 'desktop' | 'mobile';

const DESKTOP_BREAKPOINT = 1024;

export const useDeviceType = (): {
  deviceType: DeviceType;
  isDesktop: boolean;
  isMobile: boolean;
} => {
  const [deviceType, setDeviceType] = useState<DeviceType>(() => {
    // Initialize based on window width (client-side only)
    if (typeof window !== 'undefined') {
      return window.innerWidth >= DESKTOP_BREAKPOINT ? 'desktop' : 'mobile';
    }
    return 'mobile'; // SSR fallback
  });

  useEffect(() => {
    const checkDevice = () => {
      const isDesktop = window.innerWidth >= DESKTOP_BREAKPOINT;
      setDeviceType(isDesktop ? 'desktop' : 'mobile');
    };

    // Check on mount
    checkDevice();

    // Add resize listener
    window.addEventListener('resize', checkDevice);

    return () => {
      window.removeEventListener('resize', checkDevice);
    };
  }, []);

  return {
    deviceType,
    isDesktop: deviceType === 'desktop',
    isMobile: deviceType === 'mobile',
  };
};
