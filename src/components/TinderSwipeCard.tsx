import React, { useCallback, useEffect } from 'react';
import { motion, useMotionValue, useTransform, PanInfo, useAnimation } from 'framer-motion';
import { Info } from 'lucide-react';
import { NameEntry } from '../services/nameService';

interface TinderSwipeCardProps {
  name: NameEntry;
  isTop: boolean;
  isSecond: boolean;
  topCardDragX?: number; // Drag position from top card (for reveal animation)
  onSwipeLeft: () => void;
  onSwipeRight: () => void;
  onInfoClick: () => void;
  onDragChange?: (dragX: number) => void; // Callback to communicate drag position
  contextualRank?: number;
}

const TinderSwipeCard: React.FC<TinderSwipeCardProps> = ({
  name,
  isTop,
  isSecond,
  topCardDragX = 0,
  onSwipeLeft,
  onSwipeRight,
  onInfoClick,
  onDragChange,
  contextualRank
}) => {
  const controls = useAnimation();

  // REAL-TIME MOTION VALUES (no re-renders!)
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // Transform values for smooth real-time animations
  const rotate = useTransform(x, [-200, 0, 200], [-30, 0, 30]);
  const opacity = useTransform(x, [-200, -150, 0, 150, 200], [0.5, 1, 1, 1, 0.5]);

  // Like/Nope indicators opacity (real-time)
  const likeOpacity = useTransform(x, [0, 150], [0, 1]);
  const nopeOpacity = useTransform(x, [-150, 0], [1, 0]);

  // Reveal animation for second card (scales up as top card drags away)
  const revealProgress = Math.abs(topCardDragX) / 200;
  const revealScale = isSecond ? 0.95 + (revealProgress * 0.05) : 1;
  const revealY = isSecond ? 10 - (revealProgress * 10) : 0;

  // Gender styling
  const genderData = typeof name.gender === 'object' ? name.gender : null;
  const isMale = (genderData?.Male || 0) > (genderData?.Female || 0);
  const genderColor = isMale ? 'from-blue-400 to-blue-600' : 'from-pink-400 to-pink-600';
  const genderBg = isMale ? 'bg-blue-50' : 'bg-pink-50';

  // Real-time drag tracking (called on every pointer move)
  useEffect(() => {
    if (!isTop || !onDragChange) return;

    const unsubscribe = x.onChange((latestX) => {
      onDragChange(latestX);
    });

    return unsubscribe;
  }, [isTop, x, onDragChange]);

  // Handle drag end - check if swipe threshold met
  const handleDragEnd = useCallback((event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const swipeThreshold = 100;
    const swipeVelocityThreshold = 500;

    // Check if swipe meets threshold by distance or velocity
    if (Math.abs(info.offset.x) > swipeThreshold || Math.abs(info.velocity.x) > swipeVelocityThreshold) {
      const direction = info.offset.x > 0 ? 1 : -1;

      // Animate card flying off screen
      controls.start({
        x: direction * 1000,
        rotate: direction * 45,
        opacity: 0,
        transition: { duration: 0.3, ease: 'easeOut' }
      }).then(() => {
        // Reset motion values for next card
        x.set(0);
        y.set(0);
      });

      // Trigger callback
      setTimeout(() => {
        if (direction > 0) {
          onSwipeRight();
        } else {
          onSwipeLeft();
        }
      }, 100);
    } else {
      // Return to center with spring animation
      controls.start({
        x: 0,
        y: 0,
        transition: { type: 'spring', stiffness: 300, damping: 25 }
      });
    }
  }, [controls, x, y, onSwipeLeft, onSwipeRight]);

  return (
    <motion.div
      className="absolute w-full h-full select-none"
      style={{
        x: isTop ? x : 0,
        y: isSecond ? revealY : 0,
        rotate: isTop ? rotate : 0,
        scale: isSecond ? revealScale : 1,
        opacity: isTop ? opacity : 1,
        cursor: isTop ? 'grab' : 'default',
      }}
      drag={isTop ? "x" : false}
      dragMomentum={false}
      dragTransition={{ power: 0, timeConstant: 0 }}
      onDragEnd={isTop ? handleDragEnd : undefined}
      animate={controls}
      whileDrag={{ cursor: 'grabbing', scale: 1.02 }}
    >
      <div className={`relative w-full h-full ${genderBg} rounded-2xl sm:rounded-3xl shadow-2xl border-2 border-white overflow-hidden`}>
        {/* Info Button - Top Right */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onInfoClick();
          }}
          className="absolute top-3 right-3 sm:top-4 sm:right-4 z-20 flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 bg-white/90 hover:bg-white rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-110 active:scale-95"
          title="View name details"
        >
          <Info className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" />
        </button>

        {/* Like/Nope Indicators (only show on top card during drag) */}
        {isTop && (
          <>
            {/* NOPE - Left */}
            <motion.div
              className="absolute top-4 sm:top-8 left-4 sm:left-8 z-10 pointer-events-none"
              style={{ opacity: nopeOpacity }}
            >
              <div className="text-red-500 border-3 sm:border-4 border-red-500 rounded-lg sm:rounded-xl px-3 py-1.5 sm:px-4 sm:py-2 font-bold text-2xl sm:text-4xl transform -rotate-12 bg-white/10 backdrop-blur-sm">
                NOPE
              </div>
            </motion.div>

            {/* LIKE - Right */}
            <motion.div
              className="absolute top-4 sm:top-8 right-4 sm:right-8 z-10 pointer-events-none"
              style={{ opacity: likeOpacity }}
            >
              <div className="text-green-500 border-3 sm:border-4 border-green-500 rounded-lg sm:rounded-xl px-3 py-1.5 sm:px-4 sm:py-2 font-bold text-2xl sm:text-4xl transform rotate-12 bg-white/10 backdrop-blur-sm">
                LIKE
              </div>
            </motion.div>
          </>
        )}

        {/* Gradient Header */}
        <div className={`h-1/3 bg-gradient-to-br ${genderColor} relative`}>
          <div className="absolute inset-0 bg-black opacity-10" />
          <div className="absolute bottom-3 sm:bottom-4 left-0 right-0 text-center px-4">
            <h2 className="text-3xl sm:text-5xl font-bold text-white drop-shadow-lg truncate">
              {name.name}
            </h2>
          </div>
        </div>

        {/* Card Content */}
        <div className="p-4 sm:p-6 h-2/3 flex flex-col justify-between">
          <div>
            {/* Rank Badge */}
            <div className="flex justify-center mb-3 sm:mb-4">
              <span className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-full bg-gradient-to-r ${genderColor} text-white font-bold text-sm sm:text-lg shadow-lg`}>
                Rank #{contextualRank || name.popularityRank || 999999}
              </span>
            </div>

            {/* Meaning */}
            {name.meaning && (
              <div className="text-center mb-3 sm:mb-4">
                <p className="text-base sm:text-xl italic text-gray-700 line-clamp-3">
                  "{name.meaning}"
                </p>
              </div>
            )}

            {/* Origin */}
            {name.origin && (
              <div className="text-center">
                <span className="inline-flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 bg-purple-100 rounded-full shadow-sm">
                  <span className="text-xs sm:text-sm font-semibold text-purple-700">
                    {name.origin}
                  </span>
                </span>
              </div>
            )}
          </div>

          {/* Gender Distribution */}
          <div className="mt-auto">
            <div className="flex gap-2 items-center justify-center">
              <div className="flex-1 text-center">
                <span className="text-xs sm:text-sm text-gray-600 font-medium">Male</span>
                <div className="h-1.5 sm:h-2 bg-gray-200 rounded-full overflow-hidden mt-1">
                  <div
                    className="h-full bg-gradient-to-r from-blue-400 to-blue-600 transition-all duration-300"
                    style={{ width: `${(genderData?.Male || 0) * 100}%` }}
                  />
                </div>
              </div>
              <div className="flex-1 text-center">
                <span className="text-xs sm:text-sm text-gray-600 font-medium">Female</span>
                <div className="h-1.5 sm:h-2 bg-gray-200 rounded-full overflow-hidden mt-1">
                  <div
                    className="h-full bg-gradient-to-r from-pink-400 to-pink-600 transition-all duration-300"
                    style={{ width: `${(genderData?.Female || 0) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default TinderSwipeCard;
