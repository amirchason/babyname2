/**
 * Advanced Search Bar with Autocomplete
 * Features: Live suggestions, keyboard shortcuts, recent searches
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, Clock, TrendingUp } from 'lucide-react';
import nameService from '../../services/nameService';
import { NameEntry } from '../../services/nameService';

interface AdvancedSearchBarProps {
  onSearchChange?: (value: string) => void;
  className?: string;
}

const AdvancedSearchBar: React.FC<AdvancedSearchBarProps> = ({ onSearchChange, className = '' }) => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [suggestions, setSuggestions] = useState<NameEntry[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Load recent searches from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('recentSearches');
    if (stored) {
      setRecentSearches(JSON.parse(stored));
    }
  }, []);

  // Save to recent searches
  const addToRecentSearches = useCallback((term: string) => {
    const updated = [term, ...recentSearches.filter(t => t !== term)].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem('recentSearches', JSON.stringify(updated));
  }, [recentSearches]);

  // Fetch suggestions
  useEffect(() => {
    if (searchTerm.length >= 2) {
      const results = nameService.searchNames(searchTerm).slice(0, 8);
      setSuggestions(results);
    } else {
      setSuggestions([]);
    }
  }, [searchTerm]);

  // Global keyboard shortcut (Cmd/Ctrl + K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev < suggestions.length - 1 ? prev + 1 : prev));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev > 0 ? prev - 1 : -1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedIndex >= 0 && suggestions[selectedIndex]) {
        handleSelectName(suggestions[selectedIndex]);
      } else if (searchTerm) {
        handleSearch();
      }
    } else if (e.key === 'Escape') {
      setIsFocused(false);
      inputRef.current?.blur();
    }
  };

  const handleSearch = () => {
    if (searchTerm.trim()) {
      addToRecentSearches(searchTerm);
      navigate(`/search?q=${encodeURIComponent(searchTerm)}`);
      setIsFocused(false);
    }
  };

  const handleSelectName = (name: NameEntry) => {
    addToRecentSearches(name.name);
    navigate(`/?name=${encodeURIComponent(name.name)}`);
    setSearchTerm('');
    setIsFocused(false);
  };

  const handleClear = () => {
    setSearchTerm('');
    setSuggestions([]);
    setSelectedIndex(-1);
    inputRef.current?.focus();
  };

  const showDropdown = isFocused && (suggestions.length > 0 || recentSearches.length > 0);

  return (
    <div className={`relative ${className}`}>
      {/* Search Input */}
      <motion.div
        className="relative"
        animate={isFocused ? 'focused' : 'idle'}
        variants={{
          idle: { width: '280px' },
          focused: { width: '400px' }
        }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
      >
        <div className="relative">
          {/* Search Icon */}
          <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
            <Search className={`w-4 h-4 transition-all duration-200 ${isFocused ? 'text-purple-600 rotate-90' : 'text-gray-400'}`} />
          </div>

          {/* Input */}
          <input
            ref={inputRef}
            type="text"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              onSearchChange?.(e.target.value);
            }}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setTimeout(() => setIsFocused(false), 200)}
            onKeyDown={handleKeyDown}
            placeholder="Search names..."
            className="w-full h-10 pl-10 pr-20 rounded-full bg-white/80 backdrop-blur-sm border-2 border-gray-200 focus:border-purple-400 focus:outline-none transition-all shadow-md focus:shadow-lg text-sm text-gray-900 placeholder-gray-400"
          />

          {/* Clear Button */}
          <AnimatePresence>
            {searchTerm && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                onClick={handleClear}
                className="absolute right-14 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-gray-100 transition-colors"
              >
                <X className="w-3.5 h-3.5 text-gray-400" />
              </motion.button>
            )}
          </AnimatePresence>

          {/* Keyboard Shortcut Hint */}
          {!isFocused && !searchTerm && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 text-xs text-gray-400 pointer-events-none">
              <kbd className="px-1.5 py-0.5 bg-gray-100 rounded text-gray-600 font-mono text-xs">⌘K</kbd>
            </div>
          )}
        </div>
      </motion.div>

      {/* Autocomplete Dropdown */}
      <AnimatePresence>
        {showDropdown && (
          <motion.div
            ref={dropdownRef}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full mt-2 w-[400px] bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-200 overflow-hidden z-50"
          >
            {/* Recent Searches */}
            {recentSearches.length > 0 && !searchTerm && (
              <div className="p-2 border-b border-gray-100">
                <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Recent
                </div>
                {recentSearches.map((term, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setSearchTerm(term);
                      handleSearch();
                    }}
                    className="w-full px-3 py-2.5 flex items-center gap-3 hover:bg-purple-50 rounded-lg transition-colors text-left"
                  >
                    <Clock className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-700 flex-1">{term}</span>
                  </button>
                ))}
              </div>
            )}

            {/* Suggestions */}
            {suggestions.length > 0 && (
              <div className="p-2">
                <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Suggestions
                </div>
                {suggestions.map((name, index) => (
                  <motion.button
                    key={name.name}
                    onClick={() => handleSelectName(name)}
                    className={`w-full px-3 py-3 flex items-start gap-3 rounded-lg transition-all ${
                      selectedIndex === index
                        ? 'bg-gradient-to-r from-purple-50 to-pink-50'
                        : 'hover:bg-gray-50'
                    }`}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                  >
                    {/* Gender Badge */}
                    <div className={`mt-0.5 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                      name.gender === 'Male'
                        ? 'bg-blue-100 text-blue-600'
                        : name.gender === 'Female'
                        ? 'bg-pink-100 text-pink-600'
                        : 'bg-purple-100 text-purple-600'
                    }`}>
                      {name.gender === 'Male' ? 'M' : name.gender === 'Female' ? 'F' : 'U'}
                    </div>

                    {/* Name Info */}
                    <div className="flex-1 text-left">
                      <h4 className="font-semibold text-gray-900">{name.name}</h4>
                      <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">
                        {name.origin || 'Unknown origin'} · {name.meaning?.substring(0, 60) || 'No meaning available'}
                      </p>
                    </div>

                    {/* Rank */}
                    {name.popularityRank && name.popularityRank <= 1000 && (
                      <div className="flex items-center gap-1 text-xs text-gray-400">
                        <TrendingUp className="w-3 h-3" />
                        <span>#{name.popularityRank}</span>
                      </div>
                    )}
                  </motion.button>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdvancedSearchBar;
