/**
 * ParallaxBackground Component
 * 5-layer parallax scrolling background with depth perception
 * Creates immersive 3D scrolling effect with floating particles and orbs
 */

import React from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

const ParallaxBackground: React.FC = () => {
  const { scrollY } = useScroll();

  // Transform scroll position to different layer movements
  const layer1Y = useTransform(scrollY, [0, 1000], [0, -100]); // Slowest (farthest)
  const layer2Y = useTransform(scrollY, [0, 1000], [0, -300]);
  const layer3Y = useTransform(scrollY, [0, 1000], [0, -500]);
  const layer4Y = useTransform(scrollY, [0, 1000], [0, -700]); // Fastest (closest)
  const layer4Rotate = useTransform(scrollY, [0, 1000], [0, 50]);

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      {/* Layer 1 - Giant pastel orbs (farthest/slowest) */}
      <motion.div
        style={{ y: layer1Y }}
        className="absolute inset-0"
      >
        <div className="absolute top-20 left-10 w-96 h-96 bg-purple-300 rounded-full blur-3xl opacity-10" />
        <div className="absolute bottom-40 right-20 w-[500px] h-[500px] bg-pink-300 rounded-full blur-3xl opacity-10" />
        <div className="absolute top-1/2 left-1/2 w-80 h-80 bg-blue-300 rounded-full blur-3xl opacity-10 -translate-x-1/2 -translate-y-1/2" />
      </motion.div>

      {/* Layer 2 - Medium floating particles */}
      <motion.div
        style={{ y: layer2Y }}
        className="absolute inset-0"
      >
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-16 h-16 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full blur-md"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              x: [0, 30, 0],
              y: [0, -30, 0],
            }}
            transition={{
              duration: 10 + i,
              repeat: Infinity,
              ease: "easeInOut",
              repeatType: "mirror"
            }}
          />
        ))}
      </motion.div>

      {/* Layer 3 - Small sparkles */}
      <motion.div
        style={{ y: layer3Y }}
        className="absolute inset-0"
      >
        {[...Array(50)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-white rounded-full opacity-30"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
          />
        ))}
      </motion.div>

      {/* Layer 4 - Rotating glass shards (closest/fastest) */}
      <motion.div
        style={{ y: layer4Y, rotate: layer4Rotate }}
        className="absolute inset-0"
      >
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="absolute w-32 h-32 bg-gradient-to-br from-white/10 to-transparent border border-white/20 backdrop-blur-sm"
            style={{
              left: `${Math.random() * 90}%`,
              top: `${Math.random() * 90}%`,
              transform: `rotate(${Math.random() * 360}deg)`,
            }}
          />
        ))}
      </motion.div>
    </div>
  );
};

export default ParallaxBackground;
