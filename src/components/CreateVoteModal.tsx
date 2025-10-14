/**
 * Create Vote Modal
 * Modal form for creating a new vote session from favorites
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  ArrowUp,
  Users,
  Clock,
  Info,
  Loader
} from 'lucide-react';
import voteService, { CreateVoteData, VoteType, VoteNameEntry } from '../services/voteService';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';

interface CreateVoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  favoriteNames: VoteNameEntry[];
  onVoteCreated: (voteId: string) => void;
}

export default function CreateVoteModal({
  isOpen,
  onClose,
  favoriteNames,
  onVoteCreated
}: CreateVoteModalProps) {
  const { user } = useAuth();
  const toast = useToast();

  const [title, setTitle] = useState('Help me choose a baby name!');
  const [description, setDescription] = useState('');
  const [voteType, setVoteType] = useState<VoteType>('multiple');
  const [maxVotes, setMaxVotes] = useState(3);
  const [isPublic, setIsPublic] = useState(true);
  const [expiration, setExpiration] = useState<'1day' | '1week' | '1month' | 'never'>('1week');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Calculate expiration date based on selected option
   */
  const getExpirationDate = (): Date | null => {
    if (expiration === 'never') return null;

    const now = new Date();
    switch (expiration) {
      case '1day':
        return new Date(now.getTime() + 24 * 60 * 60 * 1000);
      case '1week':
        return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      case '1month':
        return new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
      default:
        return null;
    }
  };

  /**
   * Handle form submission
   */
  const handleCreateVote = async () => {
    try {
      setError(null);
      setIsLoading(true);

      // Validation
      if (!title.trim()) {
        setError('Please enter a title for your vote');
        setIsLoading(false);
        return;
      }

      if (favoriteNames.length < 2) {
        setError('You need at least 2 favorite names to create a vote');
        setIsLoading(false);
        return;
      }

      if (!user) {
        setError('Please sign in to create a vote');
        setIsLoading(false);
        return;
      }

      // Prepare vote data
      const voteData: CreateVoteData = {
        title: title.trim(),
        description: description.trim(),
        names: favoriteNames,
        voteType,
        maxVotes: voteType === 'single' ? 1 : maxVotes,
        isPublic,
        expiresAt: getExpirationDate()
      };

      // Create vote
      const voteId = await voteService.createVote(
        user.id,
        user.name || 'Anonymous',
        voteData
      );

      // Success!
      toast.success('Vote created successfully!');
      onVoteCreated(voteId);
      onClose();

      // Reset form
      setTitle('Help me choose a baby name!');
      setDescription('');
      setVoteType('multiple');
      setMaxVotes(3);
      setExpiration('1week');
    } catch (err) {
      console.error('Error creating vote:', err);
      setError(err instanceof Error ? err.message : 'Failed to create vote');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4"
          >
            {/* Modal */}
            <motion.div
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden max-h-[90vh] flex flex-col"
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-4 flex items-center justify-between flex-shrink-0">
                <div className="flex items-center gap-3">
                  <ArrowUp className="w-6 h-6 text-white" />
                  <h2 className="text-xl font-bold text-white">Create Vote</h2>
                </div>
                <button
                  onClick={onClose}
                  className="text-white hover:bg-white/20 p-2 rounded-full transition"
                  disabled={isLoading}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Content - Scrollable */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {/* Info Banner */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex gap-3">
                  <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-blue-800">
                    <p className="font-semibold mb-1">Creating a vote for {favoriteNames.length} names</p>
                    <p>Share the vote link with friends and family to get their opinions!</p>
                  </div>
                </div>

                {/* Error Message */}
                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-800">
                    {error}
                  </div>
                )}

                {/* Title Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Vote Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g., Help me choose a baby name!"
                    maxLength={100}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
                    disabled={isLoading}
                  />
                  <div className="text-xs text-gray-500 mt-1">
                    {title.length}/100 characters
                  </div>
                </div>

                {/* Description Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description (Optional)
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Add any context or instructions for voters..."
                    maxLength={500}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none resize-none"
                    disabled={isLoading}
                  />
                  <div className="text-xs text-gray-500 mt-1">
                    {description.length}/500 characters
                  </div>
                </div>

                {/* Vote Type Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Voting Style
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => {
                        setVoteType('single');
                        setMaxVotes(1);
                      }}
                      disabled={isLoading}
                      className={`p-4 rounded-lg border-2 transition ${
                        voteType === 'single'
                          ? 'border-purple-500 bg-purple-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="font-semibold text-gray-800 mb-1">Single Choice</div>
                      <div className="text-xs text-gray-600">Vote for 1 name only</div>
                    </button>
                    <button
                      onClick={() => {
                        setVoteType('multiple');
                        setMaxVotes(3);
                      }}
                      disabled={isLoading}
                      className={`p-4 rounded-lg border-2 transition ${
                        voteType === 'multiple'
                          ? 'border-purple-500 bg-purple-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="font-semibold text-gray-800 mb-1">Top 3</div>
                      <div className="text-xs text-gray-600">Vote for up to 3 names</div>
                    </button>
                  </div>
                </div>

                {/* Max Votes (for multiple choice) */}
                {voteType === 'multiple' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Maximum Votes Per Person
                    </label>
                    <select
                      value={maxVotes}
                      onChange={(e) => setMaxVotes(Number(e.target.value))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
                      disabled={isLoading}
                    >
                      <option value={1}>1 name</option>
                      <option value={2}>2 names</option>
                      <option value={3}>3 names</option>
                      <option value={5}>5 names</option>
                      <option value={10}>10 names</option>
                    </select>
                  </div>
                )}

                {/* Public/Private Toggle */}
                <div>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isPublic}
                      onChange={(e) => setIsPublic(e.target.checked)}
                      className="w-5 h-5 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                      disabled={isLoading}
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-gray-600" />
                        <span className="font-medium text-gray-800">Public Vote</span>
                      </div>
                      <p className="text-xs text-gray-600 mt-0.5">
                        Anyone with the link can vote (recommended)
                      </p>
                    </div>
                  </label>
                </div>

                {/* Expiration */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    <Clock className="w-4 h-4 inline mr-1" />
                    Vote Duration
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {(['1day', '1week', '1month', 'never'] as const).map((option) => (
                      <button
                        key={option}
                        onClick={() => setExpiration(option)}
                        disabled={isLoading}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                          expiration === option
                            ? 'bg-purple-100 text-purple-700 border-2 border-purple-500'
                            : 'bg-gray-100 text-gray-700 border-2 border-transparent hover:bg-gray-200'
                        }`}
                      >
                        {option === '1day' && '1 Day'}
                        {option === '1week' && '1 Week'}
                        {option === '1month' && '1 Month'}
                        {option === 'never' && 'No Expiration'}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Footer - Sticky */}
              <div className="border-t border-gray-200 p-6 bg-gray-50 flex-shrink-0">
                <div className="flex gap-3">
                  <button
                    onClick={onClose}
                    disabled={isLoading}
                    className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-100 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreateVote}
                    disabled={isLoading || !title.trim() || favoriteNames.length < 2}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-xl hover:shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isLoading ? (
                      <>
                        <Loader className="w-5 h-5 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      <>
                        <ArrowUp className="w-5 h-5" />
                        Create Vote
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
