import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Baby, Heart, CloudUpload, Sparkles } from 'lucide-react';

interface LogoutOverlayProps {
  isVisible: boolean;
  favoritesCount: number;
}

const LogoutOverlay: React.FC<LogoutOverlayProps> = ({ isVisible, favoritesCount }) => {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-gradient-to-br from-purple-600 via-pink-500 to-blue-500"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* Floating Sparkles Background */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {[...Array(20)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute"
                initial={{
                  x: Math.random() * window.innerWidth,
                  y: Math.random() * window.innerHeight,
                  scale: 0,
                  rotate: 0,
                }}
                animate={{
                  y: [null, Math.random() * window.innerHeight],
                  scale: [0, 1, 0],
                  rotate: [0, 360],
                }}
                transition={{
                  duration: 3 + Math.random() * 2,
                  repeat: Infinity,
                  delay: Math.random() * 2,
                }}
              >
                <Sparkles className="w-4 h-4 text-white/30" />
              </motion.div>
            ))}
          </div>

          {/* Main Content */}
          <div className="relative z-10 text-center px-6">
            {/* Baby Icon with Pulsing Animation */}
            <motion.div
              className="mb-8 flex justify-center"
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{
                type: "spring",
                stiffness: 200,
                damping: 15,
                delay: 0.1,
              }}
            >
              <div className="relative">
                <motion.div
                  className="absolute inset-0 bg-white/20 rounded-full blur-2xl"
                  animate={{
                    scale: [1, 1.3, 1],
                    opacity: [0.3, 0.6, 0.3],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                  }}
                />
                <Baby className="w-24 h-24 text-white relative z-10" />
              </div>
            </motion.div>

            {/* Saving Text with Typewriter Effect */}
            <motion.h2
              className="text-4xl sm:text-5xl font-bold text-white mb-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              Saving Your
            </motion.h2>

            {/* Heart Counter */}
            <motion.div
              className="flex items-center justify-center gap-3 mb-6"
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 20,
                delay: 0.5,
              }}
            >
              <motion.div
                animate={{
                  scale: [1, 1.2, 1],
                }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                }}
              >
                <Heart className="w-12 h-12 text-red-300 fill-red-300" />
              </motion.div>
              <span className="text-6xl font-bold text-white">{favoritesCount}</span>
            </motion.div>

            <motion.h3
              className="text-3xl sm:text-4xl font-bold text-white mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
            >
              Favorite Names
            </motion.h3>

            {/* Cloud Upload Animation */}
            <motion.div
              className="flex justify-center items-center gap-2 text-white/90"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.9 }}
            >
              <motion.div
                animate={{
                  y: [0, -10, 0],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                }}
              >
                <CloudUpload className="w-6 h-6" />
              </motion.div>
              <span className="text-lg font-medium">Syncing to cloud...</span>
            </motion.div>

            {/* Loading Dots */}
            <div className="flex justify-center gap-2 mt-4">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="w-3 h-3 bg-white rounded-full"
                  animate={{
                    scale: [1, 1.5, 1],
                    opacity: [0.5, 1, 0.5],
                  }}
                  transition={{
                    duration: 1,
                    repeat: Infinity,
                    delay: i * 0.2,
                  }}
                />
              ))}
            </div>

            {/* Goodbye Message */}
            <motion.p
              className="text-white/80 text-lg mt-8 font-light"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.1 }}
            >
              See you next time! 👋
            </motion.p>
          </div>

          {/* Animated Border Glow */}
          <motion.div
            className="absolute inset-0 border-4 border-white/20 pointer-events-none"
            animate={{
              opacity: [0.2, 0.5, 0.2],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
            }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default LogoutOverlay;
