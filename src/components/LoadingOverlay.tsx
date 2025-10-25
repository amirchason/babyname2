/**
 * LoadingOverlay - Beautiful animated overlay for login and cloud sync
 * Features: Frosted glass, pulsing hearts, gradient spinner, smooth fade
 */

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Cloud, Loader2, Sparkles } from 'lucide-react';

interface LoadingOverlayProps {
  isVisible: boolean;
  message?: string;
}

export default function LoadingOverlay({ isVisible, message = 'Syncing your favorites...' }: LoadingOverlayProps) {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/30 backdrop-blur-md"
          style={{ pointerEvents: 'all' }}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 200, damping: 20 }}
            className="relative bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl p-8 max-w-sm mx-4"
          >
            {/* Animated gradient border */}
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 opacity-20 animate-pulse" />

            <div className="relative z-10 flex flex-col items-center gap-6">
              {/* Spinning loader with hearts */}
              <div className="relative w-24 h-24">
                {/* Outer spinning ring */}
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                  className="absolute inset-0 rounded-full border-4 border-transparent border-t-purple-500 border-r-pink-500"
                />

                {/* Middle spinning ring (opposite direction) */}
                <motion.div
                  animate={{ rotate: -360 }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                  className="absolute inset-2 rounded-full border-4 border-transparent border-b-blue-500 border-l-purple-500"
                />

                {/* Center icon - alternating between cloud and heart */}
                <motion.div
                  animate={{
                    scale: [1, 1.2, 1],
                    rotate: [0, 360]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: 'easeInOut'
                  }}
                  className="absolute inset-0 flex items-center justify-center"
                >
                  <motion.div
                    animate={{ opacity: [1, 0, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <Cloud className="w-10 h-10 text-purple-600" fill="currentColor" />
                  </motion.div>
                </motion.div>

                {/* Floating hearts */}
                {[0, 120, 240].map((rotation, index) => (
                  <motion.div
                    key={index}
                    animate={{
                      rotate: [rotation, rotation + 360],
                      scale: [1, 1.2, 1]
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      delay: index * 0.3,
                      ease: 'easeInOut'
                    }}
                    className="absolute inset-0"
                  >
                    <Heart
                      className="absolute top-0 left-1/2 -translate-x-1/2 w-4 h-4 text-pink-500"
                      fill="currentColor"
                    />
                  </motion.div>
                ))}

                {/* Sparkles */}
                {[45, 135, 225, 315].map((rotation, index) => (
                  <motion.div
                    key={`sparkle-${index}`}
                    animate={{
                      opacity: [0, 1, 0],
                      scale: [0, 1, 0]
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      delay: index * 0.2,
                      ease: 'easeInOut'
                    }}
                    style={{
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      transform: `rotate(${rotation}deg) translateY(-40px)`
                    }}
                  >
                    <Sparkles className="w-3 h-3 text-blue-400" />
                  </motion.div>
                ))}
              </div>

              {/* Message text */}
              <div className="text-center">
                <motion.h3
                  animate={{ opacity: [0.7, 1, 0.7] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="text-xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent mb-2"
                >
                  {message}
                </motion.h3>
                <p className="text-sm text-gray-600">This will only take a moment</p>
              </div>

              {/* Animated dots */}
              <div className="flex gap-2">
                {[0, 1, 2].map((index) => (
                  <motion.div
                    key={index}
                    animate={{
                      scale: [1, 1.5, 1],
                      opacity: [0.3, 1, 0.3]
                    }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      delay: index * 0.2
                    }}
                    className="w-2 h-2 rounded-full bg-gradient-to-r from-purple-500 to-pink-500"
                  />
                ))}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
