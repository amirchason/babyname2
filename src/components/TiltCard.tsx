/**
 * TiltCard Component
 * Interactive 3D tilt card that follows mouse movement
 * Features: Mouse-tracking 3D rotation, shine gradient, spring physics
 */

import React, { useRef, MouseEvent } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';

interface TiltCardProps {
  children: React.ReactNode;
  maxTilt?: number;
  className?: string;
  enableShine?: boolean;
}

const TiltCard: React.FC<TiltCardProps> = ({
  children,
  maxTilt = 15,
  className = '',
  enableShine = true
}) => {
  const cardRef = useRef<HTMLDivElement>(null);

  // Motion values for mouse position (-0.5 to 0.5 range)
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Smooth spring animations for rotations
  const rotateX = useSpring(
    useTransform(mouseY, [-0.5, 0.5], [maxTilt, -maxTilt]),
    { stiffness: 300, damping: 30 }
  );
  const rotateY = useSpring(
    useTransform(mouseX, [-0.5, 0.5], [-maxTilt, maxTilt]),
    { stiffness: 300, damping: 30 }
  );

  // Shine gradient position
  const shineX = useTransform(mouseX, [-0.5, 0.5], ['0%', '100%']);
  const shineY = useTransform(mouseY, [-0.5, 0.5], ['0%', '100%']);

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;

    const rect = cardRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    // Calculate relative mouse position (-0.5 to 0.5)
    const relativeX = (e.clientX - centerX) / (rect.width / 2);
    const relativeY = (e.clientY - centerY) / (rect.height / 2);

    mouseX.set(relativeX);
    mouseY.set(relativeY);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX,
        rotateY,
        transformStyle: 'preserve-3d',
        perspective: 1000,
      }}
      className={`relative ${className}`}
    >
      {/* Shine overlay that follows mouse */}
      {enableShine && (
        <motion.div
          className="absolute inset-0 rounded-2xl opacity-0 hover:opacity-100 transition-opacity pointer-events-none z-20"
          style={{
            background: `radial-gradient(600px circle at var(--mouse-x) var(--mouse-y), rgba(255,255,255,0.3), transparent 40%)`,
            // @ts-ignore
            '--mouse-x': shineX,
            '--mouse-y': shineY,
          }}
        />
      )}

      {/* Content with 3D depth */}
      <div style={{ transform: 'translateZ(50px)' }}>
        {children}
      </div>
    </motion.div>
  );
};

export default TiltCard;
