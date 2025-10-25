import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { VotingQuestion } from '../constants/votingQuestions';

interface QuestionPreviewCardProps {
  question: VotingQuestion | null;
  customQuestion?: string;
  sampleNames?: string[];
}

// Floating particle component
const FloatingParticle: React.FC<{ emoji: string; delay: number; duration: number; x: number }> = ({
  emoji,
  delay,
  duration,
  x
}) => (
  <motion.div
    className="absolute text-2xl opacity-20 pointer-events-none"
    initial={{ y: '100%', x: `${x}%`, rotate: 0 }}
    animate={{
      y: '-100%',
      x: `${x + (Math.random() * 20 - 10)}%`,
      rotate: 360
    }}
    transition={{
      duration,
      delay,
      repeat: Infinity,
      ease: 'linear'
    }}
  >
    {emoji}
  </motion.div>
);

const QuestionPreviewCard: React.FC<QuestionPreviewCardProps> = ({
  question,
  customQuestion,
  sampleNames = ['Emma', 'Noah', 'Olivia']
}) => {
  // Generate random particles
  const particles = useMemo(() => {
    const babyEmojis = ['👶', '🍼', '🌟', '💫', '✨', '🎈', '💕', '🎀'];
    return Array.from({ length: 12 }, (_, i) => ({
      emoji: babyEmojis[Math.floor(Math.random() * babyEmojis.length)],
      delay: i * 0.8,
      duration: 8 + Math.random() * 4,
      x: Math.random() * 100
    }));
  }, []);

  const displayQuestion = customQuestion || question?.text || '';
  const displayEmoji = question?.emoji || '';

  if (!displayQuestion && !displayEmoji) {
    return null;
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={displayQuestion}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.5, ease: 'easeInOut' }}
        className="relative overflow-hidden rounded-3xl"
      >
        {/* Glassmorphism container */}
        <div className="relative bg-gradient-to-br from-purple-100/80 via-pink-100/80 to-blue-100/80 backdrop-blur-xl border-2 border-white/50 shadow-2xl">
          {/* Floating particles background */}
          <div className="absolute inset-0 overflow-hidden">
            {particles.map((particle, index) => (
              <FloatingParticle
                key={index}
                emoji={particle.emoji}
                delay={particle.delay}
                duration={particle.duration}
                x={particle.x}
              />
            ))}
          </div>

          {/* Content */}
          <div className="relative z-10 p-8">
            {/* Header */}
            <div className="flex items-center space-x-3 mb-6">
              <motion.div
                animate={{
                  scale: [1, 1.1, 1],
                  rotate: [0, 5, -5, 0]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  repeatType: 'reverse'
                }}
              >
                <Sparkles className="w-6 h-6 text-purple-600" />
              </motion.div>
              <h3 className="text-lg font-semibold text-gray-700">
                Live Preview
              </h3>
            </div>

            {/* Question display */}
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.3 }}
              className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg mb-6"
            >
              <div className="flex items-start space-x-4">
                {displayEmoji && (
                  <motion.span
                    className="text-5xl flex-shrink-0"
                    animate={{
                      scale: [1, 1.15, 1],
                      rotate: [0, 10, -10, 0]
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      repeatType: 'reverse'
                    }}
                  >
                    {displayEmoji}
                  </motion.span>
                )}
                <div className="flex-1">
                  <p className="text-2xl font-bold text-gray-800 leading-tight">
                    {displayQuestion}
                  </p>
                  {question?.description && !customQuestion && (
                    <p className="text-sm text-gray-600 mt-2">
                      {question.description}
                    </p>
                  )}
                </div>
              </div>
            </motion.div>

            {/* Sample names preview */}
            <div className="space-y-3">
              <p className="text-sm font-medium text-gray-600 mb-3">
                How it looks to voters:
              </p>
              {sampleNames.map((name, index) => (
                <motion.div
                  key={name}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 + 0.3 }}
                  className="bg-white/70 backdrop-blur-sm rounded-xl p-4 flex items-center justify-between hover:bg-white/90 transition-colors"
                >
                  <span className="text-lg font-semibold text-gray-800">
                    {name}
                  </span>
                  <div className="flex items-center space-x-2">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="px-4 py-2 rounded-lg bg-purple-100 text-purple-700 font-medium text-sm"
                    >
                      Vote
                    </motion.button>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Decorative glow */}
            <motion.div
              className="absolute -bottom-20 -right-20 w-40 h-40 bg-purple-400/30 rounded-full blur-3xl"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.3, 0.5, 0.3]
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                repeatType: 'reverse'
              }}
            />
            <motion.div
              className="absolute -top-20 -left-20 w-40 h-40 bg-pink-400/30 rounded-full blur-3xl"
              animate={{
                scale: [1, 1.3, 1],
                opacity: [0.3, 0.5, 0.3]
              }}
              transition={{
                duration: 5,
                repeat: Infinity,
                repeatType: 'reverse',
                delay: 1
              }}
            />
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default QuestionPreviewCard;
