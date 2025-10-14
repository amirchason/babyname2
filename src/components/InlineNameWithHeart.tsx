/**
 * Inline Name with Heart Button
 * Displays a name with gender-based coloring and heart button only on first mention
 * Names are clickable to open detail modal
 */

import React, { useState, useEffect, useRef } from 'react';
import { Heart } from 'lucide-react';
import favoritesService from '../services/favoritesService';
import nameService from '../services/nameService';
import { useBlogNameMention } from '../contexts/BlogNameMentionContext';
import NameDetailModal from './NameDetailModal';
import { NameEntry } from '../services/nameService';

interface InlineNameWithHeartProps {
  name: string;
  showHeart?: boolean; // Whether to show the heart button (default: true for backward compatibility)
}

const InlineNameWithHeart: React.FC<InlineNameWithHeartProps> = ({ name, showHeart = true }) => {
  const [isFavorited, setIsFavorited] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [gender, setGender] = useState<string>('');
  const [showModal, setShowModal] = useState(false);
  const [nameData, setNameData] = useState<NameEntry | null>(null);
  const { markAsMentioned } = useBlogNameMention();
  const isFirstMention = useRef<boolean>(false);
  const hasCheckedFirstMention = useRef<boolean>(false);

  useEffect(() => {
    // Check if this is the first mention ONLY ONCE per component instance
    if (!hasCheckedFirstMention.current) {
      isFirstMention.current = markAsMentioned(name);
      hasCheckedFirstMention.current = true;
    }

    // Check favorite status
    const updateFavoriteStatus = () => {
      setIsFavorited(favoritesService.isFavorite(name));
    };

    updateFavoriteStatus();

    // Listen for favorite changes from other components
    const handleStorageChange = () => {
      updateFavoriteStatus();
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('favoriteAdded', handleStorageChange);

    // Get gender for color coding and store full name data for modal
    const fetchGender = async () => {
      const data = await nameService.getNameDetails(name);
      if (data) {
        setNameData(data);
        const genderValue = typeof data.gender === 'string'
          ? data.gender
          : data.isUnisex
            ? 'unisex'
            : '';
        setGender(genderValue.toLowerCase());
      }
    };
    fetchGender();

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('favoriteAdded', handleStorageChange);
    };
  }, [name, markAsMentioned]);

  const handleNameClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (nameData) {
      setShowModal(true);
    }
  };

  const handleFavoriteToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const nowFavorited = favoritesService.toggleFavorite(name);
    setIsFavorited(nowFavorited);

    // Trigger animation on add
    if (nowFavorited) {
      setIsAnimating(true);
      setTimeout(() => setIsAnimating(false), 600);
    }
  };

  // Gender-based text color
  const getTextColor = () => {
    if (gender === 'female' || gender === 'f') return 'text-pink-600';
    if (gender === 'male' || gender === 'm') return 'text-blue-600';
    if (gender === 'unisex') return 'text-purple-600';
    return 'text-purple-700'; // default
  };

  return (
    <>
      <span className="inline-flex items-center gap-1 mx-0.5">
        <strong
          className={`font-bold ${getTextColor()}`}
          style={{ fontSize: '1.05em', lineHeight: '1.2' }}
        >
          {name}
        </strong>
        {showHeart && isFirstMention.current && (
          <button
            onClick={handleFavoriteToggle}
            className={`inline-flex items-center justify-center w-6 h-6 rounded-full transition-all touch-manipulation ${
              isFavorited
                ? 'bg-red-500 hover:bg-red-600'
                : 'bg-white hover:bg-pink-50 border border-pink-300'
            } ${isAnimating ? 'animate-heartbeat' : ''}`}
            title={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
            aria-label={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
            style={{ verticalAlign: 'middle', marginBottom: '0.3em' }}
          >
            <Heart
              className={`w-3.5 h-3.5 transition-all ${
                isFavorited ? 'fill-white text-white' : 'text-pink-500'
              }`}
            />
          </button>
        )}
      </span>
    </>
  );
};

export default InlineNameWithHeart;
