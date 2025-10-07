import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Baby, Heart, ThumbsDown, Search, X, Menu, Home, LogIn, LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import favoritesService from '../services/favoritesService';

interface AppHeaderProps {
  title?: string;
  showSearch?: boolean;
  searchTerm?: string;
  onSearchChange?: (value: string) => void;
  showBackButton?: boolean;
}

const AppHeader: React.FC<AppHeaderProps> = ({
  title = 'babynames',
  showSearch = false,
  searchTerm = '',
  onSearchChange,
  showBackButton = false,
}) => {
  const navigate = useNavigate();
  const { user, isAuthenticated, login, logout } = useAuth();
  const [favoritesCount, setFavoritesCount] = useState(0);
  const [dislikesCount, setDislikesCount] = useState(0);
  const [heartBeat, setHeartBeat] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

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

  return (
    <header className="bg-white/90 backdrop-blur-sm fixed top-0 left-0 right-0 z-50 border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-8">
            {/* Logo / Back Button */}
            {showBackButton ? (
              <button
                onClick={() => navigate('/')}
                className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
                title="Back to home"
              >
                <Home className="h-5 w-5 sm:h-6 sm:w-6 text-purple-500" />
                <span className="text-sm sm:text-base font-light text-gray-700">Home</span>
              </button>
            ) : (
              <button
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
                title="Scroll to top"
              >
                <Baby className="h-6 w-6 sm:h-7 sm:w-7 text-purple-500" />
                <h1 className="text-lg font-light tracking-wide text-gray-900">
                  {title}
                </h1>
              </button>
            )}

            {/* Favorites Counter - Always visible on desktop */}
            <div className="hidden md:flex items-center gap-6">
              <button
                onClick={() => navigate('/favorites')}
                className={`flex items-center gap-2 text-sm transition-all ${
                  favoritesCount > 0
                    ? 'text-pink-500 hover:text-pink-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
                title="View favorites"
              >
                <Heart
                  className={`transition-all ${
                    heartBeat ? 'animate-heartbeat' : ''
                  } ${
                    favoritesCount > 0 ? 'fill-pink-500' : ''
                  }`}
                  style={{ width: '1.15rem', height: '1.15rem' }}
                />
                <span className={favoritesCount > 0 ? 'font-medium' : ''}>{favoritesCount}</span>
              </button>

              {/* Dislikes Counter */}
              <button
                onClick={() => navigate('/dislikes')}
                className={`flex items-center gap-2 text-sm transition-all ${
                  dislikesCount > 0
                    ? 'text-gray-700 hover:text-gray-900'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
                title="View dislikes"
              >
                <ThumbsDown
                  className={`${
                    dislikesCount > 0 ? 'fill-gray-600' : ''
                  }`}
                  style={{ width: '1.05rem', height: '1.05rem' }}
                />
                <span className={dislikesCount > 0 ? 'font-medium' : ''}>{dislikesCount}</span>
              </button>
            </div>
          </div>

          {/* Right Side - Search and Navigation */}
          <div className="flex items-center space-x-4">
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
            <nav className="hidden md:flex items-center space-x-6">
              {/* Login/Profile */}
              {isAuthenticated && user ? (
                <div className="flex items-center gap-4">
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

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden p-2 text-gray-700 hover:text-purple-600"
            >
              {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
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
          <div className="md:hidden mt-4 pt-4 border-t border-gray-200">
            <div className="flex flex-col space-y-3">
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

export default AppHeader;
