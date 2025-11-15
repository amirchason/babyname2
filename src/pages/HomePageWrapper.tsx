/**
 * HomePage Wrapper Component
 * Detects device type and renders appropriate homepage version
 */

import React from 'react';
import { useDeviceType } from '../hooks/useDeviceType';
import HomePage from './HomePage';
import HomePageDesktop from './HomePageDesktop';

const HomePageWrapper: React.FC = () => {
  const { isDesktop } = useDeviceType();

  // Render desktop-optimized experience for desktop users
  if (isDesktop) {
    return <HomePageDesktop />;
  }

  // Render mobile-optimized experience for mobile users
  return <HomePage />;
};

export default HomePageWrapper;
