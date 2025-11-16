/**
 * AMAZING Desktop Header Component
 * Features: Glass morphism, mega menus, advanced search, micro-interactions
 * Desktop only (≥1024px)
 */

import React, { useRef, useCallback, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Home,
  List,
  Layers,
  BookOpen,
  Shuffle,
  Heart,
  ThumbsDown,
  Info,
  Mail
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useHeaderScroll } from '../../hooks/useHeaderScroll';
import favoritesService from '../../services/favoritesService';
import AdvancedSearchBar from './AdvancedSearchBar';
import { MegaMenu, BrowseNamesMegaMenu, CuratedListsMegaMenu } from './MegaMenu';
import AdminMenu from '../AdminMenu';

const DesktopHeader: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { scrollY, isCompact, isAtTop } = useHeaderScroll();
  const videoRef = useRef<HTMLVideoElement>(null);

  // Favorites & Dislikes counts (with real-time updates)
  const [favoritesCount, setFavoritesCount] = React.useState(0);
  const [dislikesCount, setDislikesCount] = React.useState(0);

  useEffect(() => {
    const updateCounts = () => {
      setFavoritesCount(favoritesService.getFavoritesCount());
      setDislikesCount(favoritesService.getDislikesCount());
    };

    updateCounts();

    window.addEventListener('storage', updateCounts);
    window.addEventListener('cloudDataUpdate', updateCounts);
    window.addEventListener('favoriteAdded', updateCounts);

    return () => {
      window.removeEventListener('storage', updateCounts);
      window.removeEventListener('cloudDataUpdate', updateCounts);
      window.removeEventListener('favoriteAdded', updateCounts);
    };
  }, []);

  // Play logo animation
  const playLogoAnimation = useCallback(() => {
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch(err => {
        console.log('Video play failed:', err);
      });
    }
  }, []);

  // Auto-play logo animation every 2.5 minutes
  useEffect(() => {
    playLogoAnimation();
    const intervalId = setInterval(() => {
      playLogoAnimation();
    }, 150000);
    return () => clearInterval(intervalId);
  }, [playLogoAnimation]);

  const isRouteActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/' || location.pathname === '/babyname2';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <motion.header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isAtTop
          ? 'bg-white/95 shadow-sm'
          : 'bg-white/80 backdrop-blur-xl shadow-lg'
      }`}
      style={{
        height: '70px', // Fixed height for always-visible nav
        borderBottom: '1px solid rgba(0, 0, 0, 0.05)',
      }}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
    >
      {/* Gradient Border Top */}
      <div
        className="absolute top-0 left-0 right-0 h-0.5"
        style={{
          background: 'linear-gradient(90deg, #D8B2F2 0%, #FFB3D9 50%, #B3D9FF 100%)',
        }}
      />

      <div className="max-w-7xl mx-auto px-6 h-full">
        <div className="h-full flex items-center justify-between gap-6">
          {/* LEFT: Logo (Compact) */}
          <motion.button
            onClick={() => navigate('/')}
            onMouseEnter={playLogoAnimation}
            className="flex items-center gap-2 cursor-pointer group flex-shrink-0"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <motion.video
              ref={videoRef}
              src="/baby-logo.webm"
              muted
              playsInline
              className="rounded-lg object-cover h-10 w-10"
              style={{ pointerEvents: 'none' }}
              onEnded={() => {
                if (videoRef.current) {
                  videoRef.current.pause();
                }
              }}
            />
            <motion.span
              className="text-xl font-extralight tracking-wide text-gray-900 group-hover:text-purple-600 transition-colors"
            >
              SoulSeed
            </motion.span>
          </motion.button>

          {/* CENTER: Navigation + Search */}
          <div className="flex-1 flex items-center justify-center gap-2">
            {/* Navigation Items - ALWAYS VISIBLE */}
            <nav className="flex items-center gap-1.5">
              {/* Browse Names - Mega Menu */}
              <MegaMenu
                label="Browse Names"
                icon={<List className="w-4 h-4" />}
                isActive={isRouteActive('/names')}
              >
                <BrowseNamesMegaMenu />
              </MegaMenu>

              {/* Curated Lists - Mega Menu */}
              <MegaMenu
                label="Curated Lists"
                icon={<Layers className="w-4 h-4" />}
                isActive={isRouteActive('/babynamelists')}
              >
                <CuratedListsMegaMenu />
              </MegaMenu>

              {/* Blog */}
              <motion.button
                onClick={() => navigate('/blog')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  isRouteActive('/blog')
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md'
                    : 'text-gray-700 hover:bg-purple-50 hover:text-purple-600'
                }`}
                whileHover={{ scale: 1.05, y: -1 }}
                whileTap={{ scale: 0.95 }}
              >
                <BookOpen className="w-4 h-4" />
                <span>Blog</span>
              </motion.button>

              {/* Swipe Mode */}
              <motion.button
                onClick={() => navigate('/swipe')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  isRouteActive('/swipe')
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md'
                    : 'text-gray-700 hover:bg-purple-50 hover:text-purple-600'
                }`}
                whileHover={{ scale: 1.05, y: -1 }}
                whileTap={{ scale: 0.95 }}
              >
                <Shuffle className="w-4 h-4" />
                <span>Swipe</span>
              </motion.button>

              {/* About */}
              <motion.button
                onClick={() => navigate('/about')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  isRouteActive('/about')
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md'
                    : 'text-gray-700 hover:bg-purple-50 hover:text-purple-600'
                }`}
                whileHover={{ scale: 1.05, y: -1 }}
                whileTap={{ scale: 0.95 }}
              >
                <Info className="w-4 h-4" />
                <span>About</span>
              </motion.button>

              {/* Contact */}
              <motion.button
                onClick={() => navigate('/contact')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  isRouteActive('/contact')
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md'
                    : 'text-gray-700 hover:bg-purple-50 hover:text-purple-600'
                }`}
                whileHover={{ scale: 1.05, y: -1 }}
                whileTap={{ scale: 0.95 }}
              >
                <Mail className="w-4 h-4" />
                <span>Contact</span>
              </motion.button>
            </nav>

            {/* Search Bar (Compact) */}
            <div className="ml-4">
              <AdvancedSearchBar />
            </div>
          </div>

          {/* RIGHT: Quick Actions (Compact Icons) */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Favorites Counter (Icon-only) */}
            <motion.button
              onClick={() => navigate('/favorites')}
              className="relative group"
              whileHover={{ scale: 1.1, y: -2 }}
              whileTap={{ scale: 0.9 }}
              title={`${favoritesCount} favorites`}
            >
              <div className={`relative flex items-center justify-center w-10 h-10 rounded-full transition-all ${
                favoritesCount > 0
                  ? 'bg-gradient-to-br from-pink-100 to-rose-100 text-pink-600'
                  : 'bg-gray-50 text-gray-400'
              }`}>
                <Heart
                  className={`w-5 h-5 transition-all ${
                    favoritesCount > 0 ? 'fill-current' : ''
                  }`}
                  strokeWidth={favoritesCount > 0 ? 0 : 2}
                />
                {favoritesCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-pink-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center shadow-lg">
                    {favoritesCount > 99 ? '99+' : favoritesCount}
                  </span>
                )}
              </div>
              {favoritesCount > 0 && (
                <div className="absolute inset-0 rounded-full bg-pink-400/30 blur-lg group-hover:blur-xl transition-all opacity-50" />
              )}
            </motion.button>

            {/* Dislikes Counter (Icon-only) */}
            <motion.button
              onClick={() => navigate('/dislikes')}
              className="relative group"
              whileHover={{ scale: 1.1, y: -2 }}
              whileTap={{ scale: 0.9 }}
              title={`${dislikesCount} dislikes`}
            >
              <div className={`relative flex items-center justify-center w-10 h-10 rounded-full transition-all ${
                dislikesCount > 0
                  ? 'bg-gray-100 text-gray-600'
                  : 'bg-gray-50 text-gray-400'
              }`}>
                <ThumbsDown className="w-5 h-5" />
                {dislikesCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-gray-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center shadow-lg">
                    {dislikesCount > 99 ? '99+' : dislikesCount}
                  </span>
                )}
              </div>
            </motion.button>

            {/* Admin Menu */}
            <AdminMenu />

            {/* User Avatar (if logged in) */}
            {user && (
              <motion.div
                className="relative w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 p-0.5"
                whileHover={{ scale: 1.15, rotate: 360 }}
                transition={{ duration: 0.6, type: 'spring' }}
              >
                <div className="w-full h-full rounded-full bg-white flex items-center justify-center text-purple-600 font-bold text-sm">
                  {user.name?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || 'U'}
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* Glow Effect (bottom edge) */}
      {!isAtTop && (
        <div
          className="absolute bottom-0 left-0 right-0 h-px"
          style={{
            background: 'linear-gradient(90deg, transparent, rgba(216, 178, 242, 0.3), transparent)',
            boxShadow: '0 0 20px rgba(216, 178, 242, 0.2)',
          }}
        />
      )}
    </motion.header>
  );
};

export default DesktopHeader;
