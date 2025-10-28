import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Baby, Heart, ThumbsDown, Search, X, Menu, LogIn, LogOut, Layers, BookOpen, Home, List, Shuffle, Info, Mail } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import favoritesService from '../services/favoritesService';
import AdminMenu from './AdminMenu';

interface AppHeaderProps {
  title?: string;
  showSearch?: boolean;
  searchTerm?: string;
  onSearchChange?: (value: string) => void;
  showBackButton?: boolean;
  onBackClick?: () => void; // Custom back/close handler for modals
}

const AppHeader: React.FC<AppHeaderProps> = ({
  title = 'SoulSeed',
  showSearch = false,
  searchTerm = '',
  onSearchChange,
  showBackButton = false,
  onBackClick,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated, login, logout } = useAuth();
  const [favoritesCount, setFavoritesCount] = useState(0);
  const [dislikesCount, setDislikesCount] = useState(0);
  const [heartBeat, setHeartBeat] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  // Video ref for controlling animation playback
  const videoRef = useRef<HTMLVideoElement>(null);

  // Play logo animation function (memoized for efficiency)
  const playLogoAnimation = useCallback(() => {
    if (videoRef.current) {
      videoRef.current.currentTime = 0; // Reset to start
      videoRef.current.play().catch(err => {
        console.log('Video play failed:', err);
      });
    }
  }, []);

  // Update counts
  useEffect(() => {
    const updateCounts = () => {
      setFavoritesCount(favoritesService.getFavoritesCount());
      setDislikesCount(favoritesService.getDislikesCount());
    };

    updateCounts();

    // Listen for updates
    window.addEventListener('storage', updateCounts);
    window.addEventListener('cloudDataUpdate', updateCounts);

    // Listen for favorite additions to trigger heart animation
    const handleFavoriteAdded = () => {
      setHeartBeat(true);
      setTimeout(() => setHeartBeat(false), 600);
      updateCounts();
    };
    window.addEventListener('favoriteAdded', handleFavoriteAdded);

    return () => {
      window.removeEventListener('storage', updateCounts);
      window.removeEventListener('cloudDataUpdate', updateCounts);
      window.removeEventListener('favoriteAdded', handleFavoriteAdded);
    };
  }, []);

  // Auto-play logo animation every 2.5 minutes
  useEffect(() => {
    // Play immediately on mount
    playLogoAnimation();

    // Set interval for 2.5 minutes (150000ms)
    const intervalId = setInterval(() => {
      playLogoAnimation();
    }, 150000);

    // Cleanup interval on unmount
    return () => clearInterval(intervalId);
  }, [playLogoAnimation]);

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 border-b border-transparent"
      style={{
        backgroundColor: 'transparent',
        overflow: 'visible'
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
        <div className="flex items-end justify-between">
          {/* Logo - Navigate home or custom action */}
          <button
            onClick={onBackClick || (() => navigate('/'))}
            className="flex items-end gap-2.5 cursor-pointer hover:opacity-80 transition-opacity"
            title={onBackClick ? "Close" : "Back to home"}
          >
            <video
              ref={videoRef}
              src="/baby-logo.webm"
              muted
              playsInline
              className="h-20 w-20 sm:h-22 sm:w-22 rounded-lg object-cover"
              style={{ pointerEvents: 'none' }}
              onEnded={() => {
                // Pause on last frame when animation completes
                if (videoRef.current) {
                  videoRef.current.pause();
                }
              }}
            />
            <div
              className="flex flex-col items-start"
              style={{
                transform: 'translateY(-36px) scale(1.25)',
                transformOrigin: 'left bottom',
                lineHeight: '0.85'
              }}
            >
              <span className="text-2xl sm:text-3xl font-light tracking-wide text-gray-900">Soul</span>
              <span className="text-2xl sm:text-3xl font-light tracking-wide text-gray-900">Seed</span>
            </div>
          </button>

          {/* Desktop Navigation Menu - Hidden on Mobile */}
          <nav className="hidden lg:flex items-end gap-1">
            <button
              onClick={() => navigate('/')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                location.pathname === '/' || location.pathname === '/babyname2'
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                  : 'text-gray-700 hover:bg-purple-50 hover:text-purple-600'
              }`}
            >
              <Home className="w-4 h-4" />
              <span>Home</span>
            </button>
            <button
              onClick={() => navigate('/names')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                location.pathname === '/names'
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                  : 'text-gray-700 hover:bg-purple-50 hover:text-purple-600'
              }`}
            >
              <List className="w-4 h-4" />
              <span>Browse Names</span>
            </button>
            <button
              onClick={() => navigate('/babynamelists')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                location.pathname === '/babynamelists'
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                  : 'text-gray-700 hover:bg-purple-50 hover:text-purple-600'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>Curated Lists</span>
            </button>
            <button
              onClick={() => navigate('/blog')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                location.pathname.startsWith('/blog')
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                  : 'text-gray-700 hover:bg-purple-50 hover:text-purple-600'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>Blog</span>
            </button>
            <button
              onClick={() => navigate('/swipe')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                location.pathname === '/swipe'
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                  : 'text-gray-700 hover:bg-purple-50 hover:text-purple-600'
              }`}
            >
              <Shuffle className="w-4 h-4" />
              <span>Swipe Mode</span>
            </button>
            <button
              onClick={() => navigate('/about')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                location.pathname === '/about'
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                  : 'text-gray-700 hover:bg-purple-50 hover:text-purple-600'
              }`}
            >
              <Info className="w-4 h-4" />
              <span>About</span>
            </button>
            <button
              onClick={() => navigate('/contact')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                location.pathname === '/contact'
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                  : 'text-gray-700 hover:bg-purple-50 hover:text-purple-600'
              }`}
            >
              <Mail className="w-4 h-4" />
              <span>Contact</span>
            </button>
          </nav>

          {/* Right Side - Search and Navigation */}
          <div className="flex items-end space-x-4" style={{ overflow: 'visible' }}>
            {/* Search Icon */}
            {showSearch && (
              <button
                onClick={() => {
                  setSearchOpen(!searchOpen);
                  if (searchOpen && onSearchChange) {
                    onSearchChange('');
                  }
                }}
                className="p-2 text-gray-600 hover:text-gray-900 transition-colors"
                title={searchOpen ? "Close search" : "Search names"}
              >
                {searchOpen ? (
                  <X className="w-4 h-4" />
                ) : (
                  <Search className="w-4 h-4" />
                )}
              </button>
            )}

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-end space-x-6">
              {/* Login/Profile */}
              {isAuthenticated && user ? (
                <div className="flex items-center gap-3">
                  <AdminMenu />
                  {user.picture ? (
                    <img
                      src={user.picture}
                      alt={user.name}
                      className="w-8 h-8 rounded-full"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 text-sm">
                      {user.name?.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <button
                    onClick={logout}
                    className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <button
                  onClick={login}
                  className="text-sm text-gray-900 hover:text-gray-600 transition-colors"
                >
                  Sign in
                </button>
              )}
            </nav>

            {/* Favorites Counter - Near menu */}
            <button
              onClick={() => navigate('/favorites')}
              className={`flex items-center gap-1.5 text-sm transition-all relative ${
                favoritesCount > 0
                  ? 'text-pink-500 hover:text-pink-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
              style={{
                transform: 'translateY(-46px) scale(1.3)'
              }}
              title="View favorites"
            >
              <Heart
                className={`transition-all ${
                  heartBeat ? 'animate-heartbeat' : ''
                } ${
                  favoritesCount > 0 ? 'fill-pink-500' : ''
                }`}
                style={{ width: '1.25rem', height: '1.25rem' }}
                strokeWidth={1}
              />
              <span className={`${favoritesCount > 0 ? 'font-semibold' : 'font-medium'} min-w-[1.5rem] text-center`}>
                {favoritesCount > 999 ? '999+' : favoritesCount}
              </span>
            </button>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden p-2 text-gray-700 hover:text-purple-600"
              style={{ transform: 'translateY(-36px) scale(1.2)' }}
            >
              {menuOpen ? <X className="w-6 h-6" strokeWidth={1} /> : <Menu className="w-6 h-6" strokeWidth={1} />}
            </button>
          </div>
        </div>

        {/* Search Input - Expandable */}
        {showSearch && searchOpen && (
          <div className="mt-4">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
              placeholder="Search names..."
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              autoFocus
            />
          </div>
        )}

        {/* Mobile Menu */}
        {menuOpen && (
          <div
            className="md:hidden mt-4 pt-4 border-t"
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.92)', // Higher opacity for readability
              backdropFilter: 'blur(12px)', // Glassmorphism blur effect
              WebkitBackdropFilter: 'blur(12px)', // Safari support
              borderColor: 'rgba(229, 231, 235, 0.5)' // Semi-transparent border
            }}
          >
            <div className="flex flex-col space-y-3">
              <button
                onClick={() => {
                  navigate('/babynamelists');
                  setMenuOpen(false);
                }}
                className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-purple-50 rounded-lg transition-colors"
              >
                <Layers className="w-4 h-4" />
                <span>Curated Lists</span>
              </button>
              <button
                onClick={() => {
                  navigate('/blog');
                  setMenuOpen(false);
                }}
                className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-purple-50 rounded-lg transition-colors"
              >
                <BookOpen className="w-4 h-4" />
                <span>Blog</span>
              </button>
              <button
                onClick={() => {
                  navigate('/favorites');
                  setMenuOpen(false);
                }}
                className="flex items-center justify-between gap-2 px-4 py-2 text-gray-700 hover:bg-purple-50 rounded-lg transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Heart className="w-4 h-4" />
                  <span>Favorites</span>
                </div>
                {favoritesCount > 0 && (
                  <span className="px-2 py-0.5 text-xs font-medium text-pink-600 bg-pink-100 rounded-full">
                    {favoritesCount}
                  </span>
                )}
              </button>
              <button
                onClick={() => {
                  navigate('/dislikes');
                  setMenuOpen(false);
                }}
                className="flex items-center justify-between gap-2 px-4 py-2 text-gray-700 hover:bg-purple-50 rounded-lg transition-colors"
              >
                <div className="flex items-center gap-2">
                  <ThumbsDown className="w-4 h-4" />
                  <span>Dislikes</span>
                </div>
                {dislikesCount > 0 && (
                  <span className="px-2 py-0.5 text-xs font-medium text-gray-600 bg-gray-100 rounded-full">
                    {dislikesCount}
                  </span>
                )}
              </button>
              <button
                onClick={() => {
                  navigate('/about');
                  setMenuOpen(false);
                }}
                className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-purple-50 rounded-lg transition-colors"
              >
                <Info className="w-4 h-4" />
                <span>About Us</span>
              </button>
              <button
                onClick={() => {
                  navigate('/contact');
                  setMenuOpen(false);
                }}
                className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-purple-50 rounded-lg transition-colors"
              >
                <Mail className="w-4 h-4" />
                <span>Contact Us</span>
              </button>

              {/* Admin Menu in Mobile - Full width */}
              <div className="px-4">
                <AdminMenu />
              </div>

              {isAuthenticated && user ? (
                <div className="flex items-center justify-between px-4 py-2 border-t pt-4">
                  <div className="flex items-center gap-2">
                    {user.picture ? (
                      <img
                        src={user.picture}
                        alt={user.name}
                        className="w-8 h-8 rounded-full"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-bold text-sm">
                        {user.name?.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <span className="text-sm font-medium text-gray-700">{user.name}</span>
                  </div>
                  <button
                    onClick={() => {
                      logout();
                      setMenuOpen(false);
                    }}
                    className="text-sm text-gray-600 hover:text-gray-900 transition-colors flex items-center gap-1"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => {
                    login();
                    setMenuOpen(false);
                  }}
                  className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-purple-50 rounded-lg transition-colors border-t pt-4"
                >
                  <LogIn className="w-4 h-4" />
                  Sign in
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default React.memo(AppHeader);
