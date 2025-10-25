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
import QuestionDropdown from './QuestionDropdown';
import QuestionPreviewCard from './QuestionPreviewCard';
import CustomQuestionInput from './CustomQuestionInput';
import { VotingQuestion } from '../constants/votingQuestions';
import { VoteTitle, VoteDescription, VOTE_TITLES, VOTE_DESCRIPTIONS } from '../constants/voteTitlesDescriptions';

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

  const [pointsPerVoter, setPointsPerVoter] = useState(10); // How many votes each user gets (default: 10)
  const [useFavorites, setUseFavorites] = useState(true);
  const [isPublic, setIsPublic] = useState(true);
  const [expiration, setExpiration] = useState<'1day' | '1week' | '1month' | 'never'>('1week');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Title & Description states - PRE-SELECTED for easy vote creation!
  const [selectedTitle, setSelectedTitle] = useState<VoteTitle | null>(VOTE_TITLES[0]);
  const [customTitle, setCustomTitle] = useState('');
  const [selectedDescription, setSelectedDescription] = useState<VoteDescription | null>(VOTE_DESCRIPTIONS[0]);
  const [customDescription, setCustomDescription] = useState('');

  // NEW: Question customization states
  const [selectedQuestion, setSelectedQuestion] = useState<VotingQuestion | null>(null);
  const [customQuestion, setCustomQuestion] = useState('');
  const [showPreview, setShowPreview] = useState(false);

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

      // Determine which title and description to use
      const finalTitle = customTitle.trim() || selectedTitle?.text || '';
      const finalDescription = customDescription.trim() || selectedDescription?.text || '';

      // Validation
      if (!finalTitle) {
        setError('Please select or enter a title for your vote');
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

      // Determine which question to use
      const finalQuestion = customQuestion.trim() || selectedQuestion?.text || '';
      const questionType: 'preset' | 'custom' = customQuestion.trim() ? 'custom' : 'preset';

      // Prepare vote data (SIMPLIFIED: Always use vote distribution system)
      const voteData: CreateVoteData = {
        title: finalTitle,
        description: finalDescription,
        names: useFavorites ? favoriteNames : [],
        voteType: 'multiple', // Always use vote distribution
        maxVotes: 999, // Not used in points system
        pointsPerVoter, // How many votes each user gets
        isPublic,
        expiresAt: getExpirationDate(),
        // Question fields
        votingQuestion: finalQuestion,
        questionType: finalQuestion ? questionType : undefined,
        questionId: questionType === 'preset' && selectedQuestion ? selectedQuestion.id : undefined,
        questionEmoji: questionType === 'preset' && selectedQuestion ? selectedQuestion.emoji : undefined
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
      setSelectedTitle(null);
      setCustomTitle('');
      setSelectedDescription(null);
      setCustomDescription('');
      setPointsPerVoter(10);
      setExpiration('1week');
      setSelectedQuestion(null);
      setCustomQuestion('');
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
                {/* STEP 1: Question Selection */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold text-gray-800">
                      ✨ Step 1: Choose Your Question
                    </h3>
                    <button
                      onClick={() => setShowPreview(!showPreview)}
                      className="text-sm text-purple-600 hover:text-purple-800 font-medium"
                    >
                      {showPreview ? 'Hide Preview' : 'Show Preview'}
                    </button>
                  </div>

                  {/* Question Dropdown */}
                  <QuestionDropdown
                    selectedQuestion={selectedQuestion}
                    onSelect={(question) => {
                      setSelectedQuestion(question);
                      setCustomQuestion(''); // Clear custom question when preset is selected
                    }}
                    disabled={isLoading}
                  />

                  {/* Custom Question Input */}
                  <CustomQuestionInput
                    value={customQuestion}
                    onChange={(value) => {
                      setCustomQuestion(value);
                      if (value.trim()) {
                        setSelectedQuestion(null); // Clear preset when custom is typed
                      }
                    }}
                    disabled={isLoading}
                  />

                  {/* Live Preview */}
                  <AnimatePresence>
                    {showPreview && (selectedQuestion || customQuestion) && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                      >
                        <QuestionPreviewCard
                          question={selectedQuestion}
                          customQuestion={customQuestion}
                          sampleNames={favoriteNames.slice(0, 3).map(n => n.name)}
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Divider */}
                <div className="border-t-2 border-gray-200 pt-6">
                  <h3 className="text-lg font-bold text-gray-800 mb-4">
                    ⚙️ Step 2: Configure Your Vote
                  </h3>
                </div>

                {/* Use Favorites Checkbox - NEW */}
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={useFavorites}
                      onChange={(e) => setUseFavorites(e.target.checked)}
                      className="w-5 h-5 mt-0.5 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                      disabled={isLoading}
                    />
                    <div className="flex-1">
                      <div className="font-semibold text-gray-800 mb-1">
                        Use my favorite names
                      </div>
                      <p className="text-sm text-gray-600">
                        Include {favoriteNames.length} favorite{favoriteNames.length !== 1 ? 's' : ''} in this vote
                      </p>
                    </div>
                  </label>
                </div>

                {/* Info Banner */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex gap-3">
                  <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-blue-800">
                    <p className="font-semibold mb-1">Vote Distribution System</p>
                    <p>Voters spread their {pointsPerVoter} votes across names however they like!</p>
                  </div>
                </div>

                {/* Error Message */}
                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-800">
                    {error}
                  </div>
                )}

                {/* Title Input with Preset */}
                <div className="space-y-3">
                  <label className="block text-sm font-semibold text-gray-800">
                    Vote Title <span className="text-rose-500">*</span>
                  </label>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {/* Preset option */}
                    <button
                      type="button"
                      onClick={() => {
                        setCustomTitle("Vote for our future baby's name!");
                        setSelectedTitle(VOTE_TITLES.find(t => t.id === 'vote-future') || null);
                      }}
                      disabled={isLoading}
                      className="p-4 rounded-xl bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-300 hover:border-purple-500 hover:from-purple-100 hover:to-pink-100 transition-all text-left group disabled:opacity-50"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-2xl">💕</span>
                        <span className="text-xs font-semibold text-purple-700 uppercase tracking-wide">Ready-made</span>
                      </div>
                      <p className="text-sm font-bold text-gray-800 group-hover:text-purple-700 transition-colors">
                        Vote for our future baby's name!
                      </p>
                    </button>

                    {/* Manual input */}
                    <div className="relative">
                      <div className="absolute -top-2 left-3 bg-white px-2 z-10">
                        <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Custom</span>
                      </div>
                      <input
                        type="text"
                        value={customTitle}
                        onChange={(e) => {
                          setCustomTitle(e.target.value);
                          setSelectedTitle(null);
                        }}
                        placeholder="Or write your own..."
                        maxLength={100}
                        className="w-full h-full px-4 py-4 rounded-xl border-2 border-gray-300 focus:border-purple-500 focus:ring-4 focus:ring-purple-100 focus:outline-none transition-all text-gray-900 font-medium bg-white"
                        disabled={isLoading}
                      />
                      <div className="absolute right-3 bottom-3 text-xs text-gray-400">
                        {customTitle.length}/100
                      </div>
                    </div>
                  </div>
                </div>

                {/* Description Input with Preset */}
                <div className="space-y-3">
                  <label className="block text-sm font-semibold text-gray-800">
                    Description (Optional)
                  </label>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {/* Preset option */}
                    <button
                      type="button"
                      onClick={() => {
                        setCustomDescription("Family & friends - your opinion matters! Help us choose.");
                        setSelectedDescription(VOTE_DESCRIPTIONS.find(d => d.id === 'opinion-matters') || null);
                      }}
                      disabled={isLoading}
                      className="p-4 rounded-xl bg-gradient-to-br from-pink-50 to-purple-50 border-2 border-pink-300 hover:border-pink-500 hover:from-pink-100 hover:to-purple-100 transition-all text-left group disabled:opacity-50"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-2xl">👥</span>
                        <span className="text-xs font-semibold text-pink-700 uppercase tracking-wide">Ready-made</span>
                      </div>
                      <p className="text-sm font-medium text-gray-800 group-hover:text-pink-700 transition-colors">
                        Family & friends - your opinion matters! Help us choose.
                      </p>
                    </button>

                    {/* Manual input */}
                    <div className="relative">
                      <div className="absolute -top-2 left-3 bg-white px-2 z-10">
                        <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Custom</span>
                      </div>
                      <textarea
                        value={customDescription}
                        onChange={(e) => {
                          setCustomDescription(e.target.value);
                          setSelectedDescription(null);
                        }}
                        placeholder="Or write your own..."
                        maxLength={500}
                        rows={4}
                        className="w-full h-full px-4 py-4 pt-6 rounded-xl border-2 border-gray-300 focus:border-purple-500 focus:ring-4 focus:ring-purple-100 focus:outline-none transition-all text-gray-900 font-medium bg-white resize-none"
                        disabled={isLoading}
                      />
                      <div className="absolute right-3 bottom-3 text-xs text-gray-400">
                        {customDescription.length}/500
                      </div>
                    </div>
                  </div>
                </div>

                {/* Votes Per User - Number Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Votes Per User
                  </label>
                  <div className="space-y-3">
                    <input
                      type="number"
                      min="5"
                      max="100"
                      value={pointsPerVoter}
                      onChange={(e) => setPointsPerVoter(Number(e.target.value))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none text-center text-2xl font-bold text-purple-600"
                      disabled={isLoading}
                    />
                    <p className="text-sm text-gray-600 text-center">
                      Each voter can distribute {pointsPerVoter} votes across the names
                    </p>
                  </div>
                </div>

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
                    disabled={isLoading || favoriteNames.length < 2}
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
