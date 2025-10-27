import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface LoadingAnimationProps {
  fullScreen?: boolean;
  message?: string;
}

const LoadingAnimation: React.FC<LoadingAnimationProps> = ({
  fullScreen = false,
  message = 'Finding your perfect name...'
}) => {
  // Brand colors
  const colors = {
    purple: '#D8B2F2',
    pink: '#FFB3D9',
    blue: '#B3D9FF',
  };

  // Baby-themed words that float around
  const floatingWords = [
    'Love', 'Joy', 'Dream', 'Hope', 'Peace',
    'Grace', 'Faith', 'Bliss', 'Star', 'Soul'
  ];

  // Heart pulse animation
  const heartPulse = {
    scale: [1, 1.2, 1],
    opacity: [0.6, 1, 0.6],
  };

  // Floating words animation
  const floatVariants = {
    initial: (i: number) => ({
      opacity: 0,
      y: 100,
      x: (i % 2 === 0 ? 1 : -1) * (Math.random() * 50 + 20),
    }),
    animate: (i: number) => ({
      opacity: [0, 0.7, 0.7, 0],
      y: [-100, -150],
      x: (i % 2 === 0 ? 1 : -1) * (Math.random() * 50 + 20),
      transition: {
        duration: 4,
        repeat: Infinity,
        delay: i * 0.4,
        ease: "easeInOut",
      },
    }),
  };

  // Petal falling animation
  const petalVariants = {
    initial: (i: number) => ({
      opacity: 0,
      y: -50,
      x: -100 + (i * 40),
      rotate: 0,
    }),
    animate: (i: number) => ({
      opacity: [0, 0.6, 0.6, 0],
      y: [0, 600],
      x: [-100 + (i * 40), -80 + (i * 40) + Math.sin(i) * 30],
      rotate: [0, 360],
      transition: {
        duration: 6,
        repeat: Infinity,
        delay: i * 0.8,
        ease: "linear",
      },
    }),
  };

  // Gradient orb animation
  const orbVariants = {
    animate: {
      scale: [1, 1.3, 1],
      opacity: [0.3, 0.5, 0.3],
      rotate: [0, 360],
      transition: {
        duration: 8,
        repeat: Infinity,
        ease: "easeInOut",
      },
    },
  };

  const containerClass = fullScreen
    ? "fixed inset-0 flex items-center justify-center bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 z-50"
    : "relative flex items-center justify-center p-8";

  return (
    <div className={containerClass}>
      {/* Animated gradient orbs in background */}
      <motion.div
        className="absolute w-96 h-96 rounded-full blur-3xl"
        style={{
          background: `radial-gradient(circle, ${colors.purple}40, transparent)`,
        }}
        variants={orbVariants}
        animate="animate"
      />
      <motion.div
        className="absolute w-96 h-96 rounded-full blur-3xl"
        style={{
          background: `radial-gradient(circle, ${colors.pink}40, transparent)`,
        }}
        variants={orbVariants}
        animate="animate"
        transition={{ delay: 2 }}
      />
      <motion.div
        className="absolute w-96 h-96 rounded-full blur-3xl"
        style={{
          background: `radial-gradient(circle, ${colors.blue}40, transparent)`,
        }}
        variants={orbVariants}
        animate="animate"
        transition={{ delay: 4 }}
      />

      {/* Falling petals */}
      {[...Array(5)].map((_, i) => (
        <motion.div
          key={`petal-${i}`}
          className="absolute w-3 h-3 rounded-full"
          style={{
            background: `linear-gradient(135deg, ${colors.pink}, ${colors.purple})`,
            boxShadow: `0 0 10px ${colors.pink}80`,
          }}
          custom={i}
          variants={petalVariants}
          initial="initial"
          animate="animate"
        />
      ))}

      {/* Floating words */}
      {floatingWords.map((word, i) => (
        <motion.div
          key={`word-${i}`}
          className="absolute text-2xl font-light tracking-wider"
          style={{
            color: i % 3 === 0 ? colors.purple : i % 3 === 1 ? colors.pink : colors.blue,
            left: `${10 + (i * 8)}%`,
            fontFamily: "'Cinzel', serif",
            textShadow: '0 2px 10px rgba(0,0,0,0.1)',
          }}
          custom={i}
          variants={floatVariants}
          initial="initial"
          animate="animate"
        />
      ))}

      {/* Center content */}
      <div className="relative z-10 flex flex-col items-center gap-8">
        {/* Pulsing heart */}
        <motion.div
          className="relative"
          animate={heartPulse}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <svg
            width="80"
            height="80"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <linearGradient id="heartGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor={colors.pink} />
                <stop offset="50%" stopColor={colors.purple} />
                <stop offset="100%" stopColor={colors.blue} />
              </linearGradient>
            </defs>
            <path
              d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
              fill="url(#heartGradient)"
              stroke="url(#heartGradient)"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>

          {/* Glowing ring around heart */}
          <motion.div
            className="absolute inset-0 rounded-full"
            style={{
              boxShadow: `0 0 30px ${colors.pink}80, 0 0 60px ${colors.purple}40`,
            }}
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0.5, 0, 0.5],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeOut",
            }}
          />
        </motion.div>

        {/* Spinning stars */}
        <div className="relative w-32 h-32">
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={`star-${i}`}
              className="absolute"
              style={{
                top: '50%',
                left: '50%',
                width: '8px',
                height: '8px',
              }}
              animate={{
                rotate: [0, 360],
                opacity: [0.3, 1, 0.3],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                delay: i * 0.15,
                ease: "linear",
              }}
            >
              <div
                className="w-2 h-2 rounded-full"
                style={{
                  background: i % 3 === 0 ? colors.purple : i % 3 === 1 ? colors.pink : colors.blue,
                  boxShadow: `0 0 8px ${i % 3 === 0 ? colors.purple : i % 3 === 1 ? colors.pink : colors.blue}`,
                  transform: `translate(-50%, -50%) translateY(-${40 + i * 5}px)`,
                }}
              />
            </motion.div>
          ))}
        </div>

        {/* Loading dots */}
        <div className="flex gap-3">
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={`dot-${i}`}
              className="w-3 h-3 rounded-full"
              style={{
                background: `linear-gradient(135deg, ${colors.purple}, ${colors.pink})`,
                boxShadow: `0 0 10px ${colors.purple}80`,
              }}
              animate={{
                y: [0, -20, 0],
                opacity: [0.5, 1, 0.5],
              }}
              transition={{
                duration: 1.2,
                repeat: Infinity,
                delay: i * 0.2,
                ease: "easeInOut",
              }}
            />
          ))}
        </div>

        {/* Message */}
        {message && (
          <motion.p
            className="text-lg font-light tracking-wide"
            style={{
              background: `linear-gradient(90deg, ${colors.purple}, ${colors.pink}, ${colors.blue})`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              fontFamily: "'Cinzel', serif",
            }}
            animate={{
              opacity: [0.6, 1, 0.6],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            {message}
          </motion.p>
        )}
      </div>
    </div>
  );
};

export default LoadingAnimation;
