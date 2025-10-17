/**
 * VotingButton Component
 * Interactive voting button with +/- controls
 * Features: Frosted glass, 3D tilt, vote counter, animations
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Plus, Minus, Trophy, Crown } from 'lucide-react';

interface VotingButtonProps {
  name: string;
  meaning?: string;
  origin?: string;
  currentVotes: number;
  totalVotes: number;
  rank: number;
  onIncrement: () => void;
  onDecrement: () => void;
  canIncrement: boolean;
  maxVotesReached: boolean;
}

const VotingButton: React.FC<VotingButtonProps> = ({
  name,
  meaning,
  origin,
  currentVotes,
  totalVotes,
  rank,
  onIncrement,
  onDecrement,
  canIncrement,
  maxVotesReached
}) => {
  const isWinner = rank === 1 && totalVotes > 0;
  const hasVotes = currentVotes > 0;
  const percentage = totalVotes > 0 ? (currentVotes / totalVotes) * 100 : 0;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`relative p-6 rounded-2xl backdrop-blur-xl border-2 transition-all ${
        isWinner
          ? 'bg-gradient-to-br from-yellow-100/40 to-orange-100/40 border-yellow-400 shadow-[0_0_30px_rgba(251,191,36,0.3)]'
          : hasVotes
          ? 'bg-gradient-to-br from-purple-100/30 to-pink-100/30 border-purple-400/50'
          : 'bg-white/20 border-white/30'
      }`}
    >
      {/* Rank Badge */}
      <div className="absolute -top-3 -left-3">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 500, damping: 25 }}
          className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg shadow-lg ${
            isWinner
              ? 'bg-gradient-to-br from-yellow-400 to-orange-500 text-white'
              : 'bg-gradient-to-br from-purple-500 to-pink-500 text-white'
          }`}
        >
          {isWinner ? <Crown className="w-6 h-6" /> : `#${rank}`}
        </motion.div>
      </div>

      {/* Winner Trophy */}
      {isWinner && (
        <motion.div
          className="absolute -top-8 right-4"
          animate={{
            y: [0, -10, 0],
            rotate: [0, 5, 0, -5, 0]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut'
          }}
        >
          <Trophy className="w-8 h-8 text-yellow-500 drop-shadow-lg" />
        </motion.div>
      )}

      {/* Name & Info */}
      <div className="mb-4 pr-16">
        <h3 className="text-2xl font-bold text-gray-800 mb-1">{name}</h3>
        {meaning && (
          <p className="text-sm text-gray-600 italic mb-1">"{meaning}"</p>
        )}
        {origin && (
          <p className="text-xs text-gray-500">{origin}</p>
        )}
      </div>

      {/* Vote Counter & Progress Bar */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-semibold text-gray-700">
            {currentVotes} {currentVotes === 1 ? 'vote' : 'votes'}
          </span>
          <span className="text-sm font-semibold text-purple-600">
            {percentage.toFixed(1)}%
          </span>
        </div>

        {/* Animated Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className={`h-full ${
              isWinner
                ? 'bg-gradient-to-r from-yellow-400 to-orange-500'
                : 'bg-gradient-to-r from-purple-500 to-pink-500'
            }`}
          />
        </div>
      </div>

      {/* +/- Controls */}
      <div className="flex items-center gap-3">
        {/* Decrement Button */}
        <motion.button
          onClick={onDecrement}
          disabled={currentVotes === 0}
          whileHover={{ scale: currentVotes > 0 ? 1.1 : 1 }}
          whileTap={{ scale: currentVotes > 0 ? 0.9 : 1 }}
          className={`flex items-center justify-center w-12 h-12 rounded-xl font-bold text-lg transition-all ${
            currentVotes > 0
              ? 'bg-red-500 text-white hover:bg-red-600 shadow-lg'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          }`}
        >
          <Minus className="w-5 h-5" />
        </motion.button>

        {/* Vote Counter Display */}
        <div className="flex-1 text-center">
          <motion.div
            key={currentVotes}
            initial={{ scale: 1.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent"
          >
            {currentVotes}
          </motion.div>
        </div>

        {/* Increment Button */}
        <motion.button
          onClick={onIncrement}
          disabled={!canIncrement}
          whileHover={{ scale: canIncrement ? 1.1 : 1 }}
          whileTap={{ scale: canIncrement ? 0.9 : 1 }}
          className={`flex items-center justify-center w-12 h-12 rounded-xl font-bold text-lg transition-all ${
            canIncrement
              ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:shadow-xl shadow-lg'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          }`}
        >
          <Plus className="w-5 h-5" />
        </motion.button>
      </div>

      {/* Max Votes Warning */}
      {maxVotesReached && !hasVotes && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-3 text-xs text-red-600 font-semibold text-center"
        >
          Vote limit reached! Remove votes to vote for this name.
        </motion.div>
      )}
    </motion.div>
  );
};

export default VotingButton;
