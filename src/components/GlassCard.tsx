/**
 * GlassCard Component
 * Reusable frosted glass container with 3D depth
 * Features: backdrop-blur, gradient borders, glass reflection, 3D transforms
 */

import React from 'react';
import { motion } from 'framer-motion';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  gradient?: 'purple' | 'pink' | 'blue' | 'multi';
  depth?: 'shallow' | 'medium' | 'deep';
}

const gradients = {
  purple: 'from-purple-400/20 via-purple-500/20 to-purple-600/20',
  pink: 'from-pink-400/20 via-pink-500/20 to-pink-600/20',
  blue: 'from-blue-400/20 via-blue-500/20 to-blue-600/20',
  multi: 'from-purple-400/20 via-pink-500/20 to-blue-600/20'
};

const depthStyles = {
  shallow: {
    blur: 'backdrop-blur-md',
    shadow: 'shadow-[0_4px_16px_rgba(216,178,242,0.15)]',
    border: 'border border-white/20'
  },
  medium: {
    blur: 'backdrop-blur-xl',
    shadow: 'shadow-[0_8px_32px_rgba(216,178,242,0.2)]',
    border: 'border border-white/30'
  },
  deep: {
    blur: 'backdrop-blur-2xl',
    shadow: 'shadow-[0_16px_48px_rgba(216,178,242,0.3)]',
    border: 'border-2 border-white/40'
  }
};

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  className = '',
  hover = true,
  gradient = 'multi',
  depth = 'medium'
}) => {
  const depthStyle = depthStyles[depth];

  return (
    <motion.div
      whileHover={hover ? {
        scale: 1.02,
        y: -4,
        boxShadow: '0 20px 60px rgba(216, 178, 242, 0.4)'
      } : undefined}
      transition={{
        type: 'spring',
        stiffness: 300,
        damping: 20
      }}
      style={{
        transformStyle: 'preserve-3d',
      }}
      className={`
        relative
        ${depthStyle.blur}
        bg-white/10
        ${depthStyle.border}
        rounded-2xl
        ${depthStyle.shadow}
        overflow-hidden
        ${className}
      `}
    >
      {/* Gradient border glow */}
      <div
        className={`
          absolute -inset-[1px] rounded-2xl
          bg-gradient-to-br ${gradients[gradient]}
          opacity-50 blur-sm -z-10
        `}
      />

      {/* Glass reflection overlay */}
      <div
        className="
          absolute inset-0
          bg-gradient-to-br from-white/30 via-transparent to-transparent
          rounded-2xl opacity-50 pointer-events-none
        "
      />

      {/* Content with 3D depth */}
      <div
        style={{ transform: 'translateZ(10px)' }}
        className="relative z-10"
      >
        {children}
      </div>
    </motion.div>
  );
};

export default GlassCard;
