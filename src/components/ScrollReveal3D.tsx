/**
 * ScrollReveal3D Component
 * Cards appear from depth when scrolled into view
 * Features: Scroll-triggered 3D reveals, stagger animations, perspective transforms
 */

import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';

interface ScrollReveal3DProps {
  children: React.ReactNode;
  index?: number;
  direction?: 'up' | 'down' | 'left' | 'right';
  className?: string;
}

const ScrollReveal3D: React.FC<ScrollReveal3DProps> = ({
  children,
  index = 0,
  direction = 'up',
  className = ''
}) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });

  const directionVariants = {
    up: {
      initial: {
        opacity: 0,
        rotateX: 60,
        translateZ: -200,
        scale: 0.8,
        y: 100
      },
      animate: {
        opacity: 1,
        rotateX: 0,
        translateZ: 0,
        scale: 1,
        y: 0
      }
    },
    down: {
      initial: {
        opacity: 0,
        rotateX: -60,
        translateZ: -200,
        scale: 0.8,
        y: -100
      },
      animate: {
        opacity: 1,
        rotateX: 0,
        translateZ: 0,
        scale: 1,
        y: 0
      }
    },
    left: {
      initial: {
        opacity: 0,
        rotateY: -60,
        translateZ: -200,
        scale: 0.8,
        x: -100
      },
      animate: {
        opacity: 1,
        rotateY: 0,
        translateZ: 0,
        scale: 1,
        x: 0
      }
    },
    right: {
      initial: {
        opacity: 0,
        rotateY: 60,
        translateZ: -200,
        scale: 0.8,
        x: 100
      },
      animate: {
        opacity: 1,
        rotateY: 0,
        translateZ: 0,
        scale: 1,
        x: 0
      }
    }
  };

  const variants = directionVariants[direction];

  return (
    <motion.div
      ref={ref}
      initial={variants.initial}
      animate={isInView ? variants.animate : variants.initial}
      transition={{
        duration: 0.8,
        delay: index * 0.2,
        ease: [0.215, 0.610, 0.355, 1.000], // Custom cubic-bezier (easeOutQuart)
      }}
      style={{
        transformStyle: 'preserve-3d',
        perspective: 1000,
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

export default ScrollReveal3D;
