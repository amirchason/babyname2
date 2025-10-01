import React, { useState } from 'react';
import { motion, useMotionValue, useTransform, PanInfo } from 'framer-motion';
import NameCard from './NameCard';
import { NameEntry } from '../services/nameService';
import favoritesService from '../services/favoritesService';

interface SwipeableNameCardProps {
  name: NameEntry;
  onSwipeLeft: () => void;
  onSwipeRight: () => void;
  onClick: (name: NameEntry) => void;
  contextualRank?: number;
  filterContext?: 'all' | 'male' | 'female';
}

const SwipeableNameCard: React.FC<SwipeableNameCardProps> = ({
  name,
  onSwipeLeft,
  onSwipeRight,
  onClick,
  contextualRank,
  filterContext
}) => {
  const [exitDirection, setExitDirection] = useState<'left' | 'right' | null>(null);
  const x = useMotionValue(0);

  // Transform x position to rotation and opacity
  const rotate = useTransform(x, [-200, 0, 200], [-15, 0, 15]);
  const opacity = useTransform(x, [-200, -150, 0, 150, 200], [0.5, 1, 1, 1, 0.5]);

  // Transform for like/dislike indicators
  const likeOpacity = useTransform(x, [0, 150], [0, 1]);
  const dislikeOpacity = useTransform(x, [-150, 0], [1, 0]);

  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const swipeThreshold = 200;
    const swipeVelocityThreshold = 1000;

    // Only trigger swipe if movement is primarily horizontal (not vertical scroll)
    const isHorizontalSwipe = Math.abs(info.offset.x) > Math.abs(info.offset.y) * 2;

    // Check if swipe meets threshold by distance or velocity AND is horizontal
    if (isHorizontalSwipe && (Math.abs(info.offset.x) > swipeThreshold || Math.abs(info.velocity.x) > swipeVelocityThreshold)) {
      if (info.offset.x > 0) {
        // Swipe right - Like
        setExitDirection('right');
        favoritesService.toggleFavorite(name.name);
        setTimeout(() => onSwipeRight(), 100);
      } else {
        // Swipe left - Dislike
        setExitDirection('left');
        favoritesService.toggleDislike(name.name);
        setTimeout(() => onSwipeLeft(), 100);
      }
    }
  };

  // Handle button clicks with swipe animation
  const handleLikeButton = () => {
    // Trigger swipe right animation
    setExitDirection('right');
    favoritesService.toggleFavorite(name.name);
    setTimeout(() => onSwipeRight(), 200);
  };

  const handleDislikeButton = () => {
    // Trigger swipe left animation
    setExitDirection('left');
    favoritesService.toggleDislike(name.name);
    setTimeout(() => onSwipeLeft(), 200);
  };

  return (
    <motion.div
      layout
      className="relative"
      style={{ x, rotate, opacity, touchAction: 'pan-y' }}
      drag="x"
      dragConstraints={{ left: -300, right: 300 }}
      dragElastic={0.2}
      dragMomentum={false}
      onDragEnd={handleDragEnd}
      animate={exitDirection ? {
        x: exitDirection === 'right' ? 500 : -500,
        opacity: 0,
        rotate: exitDirection === 'right' ? 20 : -20,
        scale: 0.8,
      } : {}}
      transition={exitDirection ? {
        type: 'tween',
        duration: 0.2,
        ease: 'easeOut'
      } : {
        type: 'spring',
        stiffness: 500,
        damping: 20,
      }}
      whileTap={{ scale: 0.95 }}
    >
      {/* Dislike Indicator (Red - Left) */}
      <motion.div
        className="absolute -left-4 top-1/2 -translate-y-1/2 pointer-events-none z-10"
        style={{ opacity: dislikeOpacity }}
      >
        <div className="bg-red-500 text-white px-6 py-3 rounded-full font-bold text-xl shadow-xl rotate-12">
          ✖ NOPE
        </div>
      </motion.div>

      {/* Like Indicator (Green - Right) */}
      <motion.div
        className="absolute -right-4 top-1/2 -translate-y-1/2 pointer-events-none z-10"
        style={{ opacity: likeOpacity }}
      >
        <div className="bg-green-500 text-white px-6 py-3 rounded-full font-bold text-xl shadow-xl -rotate-12">
          ❤️ LIKE
        </div>
      </motion.div>

      {/* The actual name card */}
      <div className="touch-none">
        <NameCard
          name={name}
          onClick={onClick}
          onFavoriteToggle={handleLikeButton}
          onDislikeToggle={handleDislikeButton}
          contextualRank={contextualRank}
          filterContext={filterContext}
        />
      </div>
    </motion.div>
  );
};

export default SwipeableNameCard;
