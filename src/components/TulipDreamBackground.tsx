import React from 'react';

/**
 * Tulip Dream Background
 * Pure CSS tulip-themed animation with floating petals, soft gradients, and dreamy effects
 *
 * Features:
 * - Floating tulip petals with gentle rotation
 * - Soft pastel gradient background
 * - Dreamy blur effects
 * - Gentle sway animations
 * - No external dependencies - works everywhere!
 */

const TulipDreamBackground: React.FC = () => {
  return (
    <div className="absolute inset-0 overflow-hidden bg-gradient-to-br from-sky-50 via-purple-50 to-pink-50">
      {/* Animated gradient orbs */}
      <div className="absolute inset-0">
        <div
          className="absolute w-96 h-96 rounded-full opacity-30 blur-3xl"
          style={{
            background: 'radial-gradient(circle, rgba(216, 178, 242, 0.6) 0%, transparent 70%)',
            top: '10%',
            left: '10%',
            animation: 'float 20s ease-in-out infinite'
          }}
        />
        <div
          className="absolute w-96 h-96 rounded-full opacity-30 blur-3xl"
          style={{
            background: 'radial-gradient(circle, rgba(255, 179, 217, 0.6) 0%, transparent 70%)',
            bottom: '10%',
            right: '10%',
            animation: 'float 25s ease-in-out infinite 5s'
          }}
        />
        <div
          className="absolute w-96 h-96 rounded-full opacity-20 blur-3xl"
          style={{
            background: 'radial-gradient(circle, rgba(179, 217, 255, 0.5) 0%, transparent 70%)',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            animation: 'float 30s ease-in-out infinite 10s'
          }}
        />
      </div>

      {/* Floating tulip petals */}
      {[...Array(15)].map((_, i) => (
        <div
          key={i}
          className="absolute rounded-full opacity-40"
          style={{
            width: `${20 + Math.random() * 40}px`,
            height: `${30 + Math.random() * 50}px`,
            background: i % 3 === 0
              ? 'linear-gradient(135deg, #FFB3D9 0%, #D8B2F2 100%)'
              : i % 3 === 1
              ? 'linear-gradient(135deg, #D8B2F2 0%, #B3D9FF 100%)'
              : 'linear-gradient(135deg, #FFB3D9 0%, #B3D9FF 100%)',
            left: `${Math.random() * 100}%`,
            top: `${-20 + Math.random() * 120}%`,
            animation: `petal-fall ${15 + Math.random() * 20}s linear infinite ${Math.random() * 10}s`,
            filter: 'blur(1px)',
            borderRadius: '50% 50% 50% 10%',
            transform: `rotate(${Math.random() * 360}deg)`
          }}
        />
      ))}

      {/* Tulip silhouettes (CSS shapes) */}
      {[...Array(5)].map((_, i) => (
        <div
          key={`tulip-${i}`}
          className="absolute opacity-10"
          style={{
            bottom: `-${10 + i * 5}%`,
            left: `${i * 20 + 5}%`,
            animation: `sway ${8 + i * 2}s ease-in-out infinite ${i * 0.5}s`
          }}
        >
          {/* Tulip stem */}
          <div
            style={{
              width: '4px',
              height: `${120 + i * 30}px`,
              background: 'linear-gradient(to bottom, #86efac, #22c55e)',
              position: 'relative',
              margin: '0 auto',
              borderRadius: '2px'
            }}
          />
          {/* Tulip flower */}
          <div
            style={{
              width: `${40 + i * 10}px`,
              height: `${50 + i * 12}px`,
              background: i % 2 === 0
                ? 'linear-gradient(135deg, #FFB3D9, #D8B2F2)'
                : 'linear-gradient(135deg, #D8B2F2, #B3D9FF)',
              borderRadius: '50% 50% 0 0',
              position: 'relative',
              top: '-5px',
              left: '50%',
              transform: 'translateX(-50%)',
              filter: 'blur(1.5px)'
            }}
          />
        </div>
      ))}

      {/* Soft light rays */}
      <div className="absolute inset-0 opacity-20">
        <div
          className="absolute w-full h-full"
          style={{
            background: 'linear-gradient(180deg, rgba(255,255,255,0.4) 0%, transparent 100%)',
            animation: 'pulse 8s ease-in-out infinite'
          }}
        />
      </div>

      <style>{`
        @keyframes float {
          0%, 100% {
            transform: translate(0, 0) scale(1);
          }
          25% {
            transform: translate(-20px, -20px) scale(1.05);
          }
          50% {
            transform: translate(15px, 10px) scale(0.95);
          }
          75% {
            transform: translate(-10px, 15px) scale(1.02);
          }
        }

        @keyframes petal-fall {
          0% {
            transform: translateY(0) rotate(0deg);
            opacity: 0;
          }
          10% {
            opacity: 0.4;
          }
          90% {
            opacity: 0.3;
          }
          100% {
            transform: translateY(100vh) rotate(720deg);
            opacity: 0;
          }
        }

        @keyframes sway {
          0%, 100% {
            transform: rotate(0deg) translateX(0);
          }
          25% {
            transform: rotate(2deg) translateX(5px);
          }
          75% {
            transform: rotate(-2deg) translateX(-5px);
          }
        }

        @keyframes pulse {
          0%, 100% {
            opacity: 0.2;
          }
          50% {
            opacity: 0.3;
          }
        }
      `}</style>
    </div>
  );
};

export default TulipDreamBackground;
