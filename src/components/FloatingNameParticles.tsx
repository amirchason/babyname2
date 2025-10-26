import React, { useMemo } from 'react';
import { motion } from 'framer-motion';

interface FloatingNameParticlesProps {
  names?: string[];
  count?: number;
}

/**
 * Floating Name Particles Background Animation
 * Creates an elegant, subtle floating animation with popular baby names
 * Perfect for adding visual interest without overwhelming the content
 */
const FloatingNameParticles: React.FC<FloatingNameParticlesProps> = ({
  names = [
    'Emma', 'Noah', 'Olivia', 'Liam', 'Sophia', 'Ethan', 'Isabella', 'Mason',
    'Mia', 'Lucas', 'Ava', 'Oliver', 'Charlotte', 'Elijah', 'Amelia', 'James',
    'Harper', 'Benjamin', 'Evelyn', 'William', 'Abigail', 'Michael', 'Emily', 'Alexander'
  ],
  count = 20
}) => {
  // Generate random particles with positions, sizes, and animation params
  const particles = useMemo(() => {
    return Array.from({ length: count }, (_, i) => {
      const name = names[i % names.length];
      return {
        id: i,
        name,
        // Random horizontal position (0-100%)
        x: Math.random() * 100,
        // Random vertical starting position (0-120% to start some off-screen)
        y: Math.random() * 120,
        // Random font size (0.8rem - 2rem)
        size: 0.8 + Math.random() * 1.2,
        // Random opacity (0.03 - 0.15 for subtle effect)
        opacity: 0.03 + Math.random() * 0.12,
        // Random animation duration (15-40 seconds)
        duration: 15 + Math.random() * 25,
        // Random delay (0-10 seconds)
        delay: Math.random() * 10,
        // Random horizontal drift (-50 to +50)
        drift: -50 + Math.random() * 100,
      };
    });
  }, [names, count]);

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute text-purple-600 font-light select-none"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            fontSize: `${particle.size}rem`,
            opacity: particle.opacity,
          }}
          animate={{
            y: [0, -100, -200, -300],
            x: [0, particle.drift / 4, particle.drift / 2, particle.drift],
            opacity: [
              particle.opacity,
              particle.opacity * 1.5,
              particle.opacity,
              0
            ],
            scale: [1, 1.1, 1, 0.9],
            rotate: [0, 5, -5, 0],
          }}
          transition={{
            duration: particle.duration,
            delay: particle.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          {particle.name}
        </motion.div>
      ))}
    </div>
  );
};

export default FloatingNameParticles;
