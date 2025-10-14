/**
 * Voting Page
 * Public page where users can vote on name selections
 * Features real-time updates and interactive voting UI
 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  CheckCircle2,
  Users,
  Clock,
  Share2,
  TrendingUp,
  Loader,
  AlertCircle,
  Trophy
} from 'lucide-react';
import voteService, { VoteSession, VoteResult } from '../services/voteService';
import { getVoterId, hasVoted, markAsVoted, getPreviousVote } from '../utils/voterIdGenerator';
import ShareVoteModal from '../components/ShareVoteModal';
import { useToast } from '../contexts/ToastContext';

export default function VotingPage() {
  const { voteId } = useParams<{ voteId: string }>();
  const navigate = useNavigate();
  const toast = useToast();

  const [voteSession, setVoteSession] = useState<VoteSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedNames, setSelectedNames] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [results, setResults] = useState<VoteResult[]>([]);
  const [showShareModal, setShowShareModal] = useState(false);
  const [voterId] = useState(getVoterId());

  /**
   * Load vote session and check if user has already voted
   */
  useEffect(() => {
    if (!voteId) {
      setError('Invalid vote ID');
      setLoading(false);
      return;
    }

    loadVoteSession();
  }, [voteId]);

  /**
   * Subscribe to real-time updates
   */
  useEffect(() => {
    if (!voteId) return;

    const unsubscribe = voteService.subscribeToVote(voteId, (updatedSession) => {
      if (updatedSession) {
        setVoteSession(updatedSession);
        // Update results if already voted
        if (hasSubmitted) {
          loadResults();
        }
      }
    });

    return () => unsubscribe();
  }, [voteId, hasSubmitted]);

  /**
   * Load vote session data
   */
  const loadVoteSession = async () => {
    try {
      if (!voteId) return;

      setLoading(true);
      setError(null);

      const session = await voteService.getVote(voteId);

      if (!session) {
        setError('Vote not found');
        setLoading(false);
        return;
      }

      setVoteSession(session);

      // Check if user has already voted
      const alreadyVoted = hasVoted(voteId);
      setHasSubmitted(alreadyVoted);

      // If already voted, load previous selection and results
      if (alreadyVoted) {
        const previousSelection = getPreviousVote(voteId);
        if (previousSelection) {
          setSelectedNames(previousSelection);
        }
        await loadResults();
      }

      setLoading(false);
    } catch (err) {
      console.error('Error loading vote session:', err);
      setError('Failed to load vote');
      setLoading(false);
    }
  };

  /**
   * Load vote results
   */
  const loadResults = async () => {
    try {
      if (!voteId) return;
      const resultsData = await voteService.getResults(voteId);
      setResults(resultsData);
    } catch (err) {
      console.error('Error loading results:', err);
    }
  };

  /**
   * Handle name selection
   */
  const handleNameClick = (name: string) => {
    if (hasSubmitted || !voteSession) return;

    setSelectedNames(prev => {
      const isSelected = prev.includes(name);

      if (isSelected) {
        // Deselect
        return prev.filter(n => n !== name);
      } else {
        // Select
        if (prev.length >= voteSession.maxVotes) {
          // If at max votes, replace oldest selection (or show toast)
          if (voteSession.voteType === 'single') {
            return [name]; // Replace single vote
          } else {
            toast.warning(`You can only vote for ${voteSession.maxVotes} names`);
            return prev;
          }
        }
        return [...prev, name];
      }
    });
  };

  /**
   * Submit vote
   */
  const handleSubmitVote = async () => {
    try {
      if (!voteId || !voteSession) return;

      if (selectedNames.length === 0) {
        toast.warning('Please select at least one name');
        return;
      }

      setSubmitting(true);

      await voteService.submitVote({
        voteId,
        selectedNames,
        voterId
      });

      // Mark as voted in localStorage
      markAsVoted(voteId, selectedNames);
      setHasSubmitted(true);

      // Load results
      await loadResults();

      toast.success('Your vote has been submitted!');
    } catch (err) {
      console.error('Error submitting vote:', err);
      toast.error(err instanceof Error ? err.message : 'Failed to submit vote');
    } finally {
      setSubmitting(false);
    }
  };

  /**
   * Format time remaining
   */
  const getTimeRemaining = (): string => {
    if (!voteSession?.expiresAt) return 'No expiration';

    const now = new Date();
    const expiry = voteSession.expiresAt.toDate();
    const diffMs = expiry.getTime() - now.getTime();

    if (diffMs <= 0) return 'Expired';

    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    if (days > 0) {
      return `${days} day${days > 1 ? 's' : ''} left`;
    } else if (hours > 0) {
      return `${hours} hour${hours > 1 ? 's' : ''} left`;
    } else {
      return 'Less than 1 hour left';
    }
  };

  // Loading State
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 flex items-center justify-center p-4">
        <div className="text-center">
          <Loader className="w-12 h-12 animate-spin text-purple-600 mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Loading vote...</p>
        </div>
      </div>
    );
  }

  // Error State
  if (error || !voteSession) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Vote Not Found</h1>
          <p className="text-gray-600 mb-6">
            {error || 'This vote session does not exist or has been removed.'}
          </p>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-xl hover:shadow-lg transition"
          >
            Go to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      {/* Header */}
      <div className="bg-white shadow-md sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Back</span>
          </button>

          <button
            onClick={() => setShowShareModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:shadow-md transition"
          >
            <Share2 className="w-4 h-4" />
            <span className="font-medium">Share</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
          <h1 className="text-4xl font-bold text-gray-800 mb-3">
            {voteSession.title}
          </h1>

          {voteSession.description && (
            <p className="text-lg text-gray-600 mb-6">
              {voteSession.description}
            </p>
          )}

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
            <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
              <Users className="w-5 h-5 text-purple-600 mb-1" />
              <div className="text-2xl font-bold text-purple-700">{voteSession.totalVoters}</div>
              <div className="text-xs text-gray-600">Voters</div>
            </div>

            <div className="bg-pink-50 rounded-lg p-4 border border-pink-200">
              <TrendingUp className="w-5 h-5 text-pink-600 mb-1" />
              <div className="text-2xl font-bold text-pink-700">{voteSession.stats.totalVotesCast}</div>
              <div className="text-xs text-gray-600">Total Votes</div>
            </div>

            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200 col-span-2 sm:col-span-1">
              <Clock className="w-5 h-5 text-blue-600 mb-1" />
              <div className="text-lg font-bold text-blue-700">{getTimeRemaining()}</div>
              <div className="text-xs text-gray-600">Time Remaining</div>
            </div>
          </div>

          {/* Instructions */}
          {!hasSubmitted && (
            <div className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg p-4 border-l-4 border-purple-600">
              <p className="font-semibold text-gray-800">
                {voteSession.voteType === 'single'
                  ? '👉 Pick your favorite name!'
                  : `👉 Pick your top ${voteSession.maxVotes} favorite${voteSession.maxVotes > 1 ? 's' : ''}!`}
              </p>
              <p className="text-sm text-gray-600 mt-1">
                Click on names to select them, then submit your vote.
              </p>
            </div>
          )}

          {hasSubmitted && (
            <div className="bg-green-50 rounded-lg p-4 border-l-4 border-green-600 flex items-center gap-3">
              <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0" />
              <div>
                <p className="font-semibold text-gray-800">Your vote has been recorded!</p>
                <p className="text-sm text-gray-600">You voted for: {selectedNames.join(', ')}</p>
              </div>
            </div>
          )}
        </div>

        {/* Names Grid (Voting Interface or Results) */}
        {!hasSubmitted ? (
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Choose Your Favorites
            </h2>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mb-6">
              <AnimatePresence>
                {voteSession.names.map((nameEntry, index) => {
                  const isSelected = selectedNames.includes(nameEntry.name);
                  const voteCount = voteSession.votes[nameEntry.name]?.count || 0;

                  return (
                    <motion.button
                      key={nameEntry.name}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.05 }}
                      onClick={() => handleNameClick(nameEntry.name)}
                      className={`p-4 rounded-xl border-2 transition-all text-left ${
                        isSelected
                          ? 'border-purple-500 bg-gradient-to-br from-purple-50 to-pink-50 shadow-md scale-105'
                          : 'border-gray-200 hover:border-purple-300 hover:shadow-sm'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-bold text-gray-800">{nameEntry.name}</h3>
                        {isSelected && (
                          <CheckCircle2 className="w-5 h-5 text-purple-600" />
                        )}
                      </div>

                      {nameEntry.meaning && (
                        <p className="text-xs text-gray-600 italic mb-2 line-clamp-2">
                          "{nameEntry.meaning}"
                        </p>
                      )}

                      {nameEntry.origin && (
                        <p className="text-xs text-gray-500">{nameEntry.origin}</p>
                      )}

                      {/* Current vote count */}
                      <div className="mt-2 text-xs text-gray-500">
                        {voteCount} vote{voteCount !== 1 ? 's' : ''}
                      </div>
                    </motion.button>
                  );
                })}
              </AnimatePresence>
            </div>

            {/* Submit Button */}
            <motion.button
              onClick={handleSubmitVote}
              disabled={submitting || selectedNames.length === 0}
              className={`w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all ${
                selectedNames.length > 0
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:shadow-xl transform hover:scale-[1.02]'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
              whileTap={selectedNames.length > 0 ? { scale: 0.98 } : {}}
            >
              {submitting ? (
                <>
                  <Loader className="w-6 h-6 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-6 h-6" />
                  Submit My Vote{selectedNames.length > 0 && ` (${selectedNames.length})`}
                </>
              )}
            </motion.button>
          </div>
        ) : (
          // Results View
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <Trophy className="w-7 h-7 text-yellow-500" />
              Live Results
            </h2>

            <div className="space-y-3">
              {results.map((result, index) => {
                const isUserSelection = selectedNames.includes(result.name);
                const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : null;

                return (
                  <motion.div
                    key={result.name}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={`relative p-4 rounded-lg border-2 ${
                      isUserSelection
                        ? 'border-purple-400 bg-purple-50'
                        : 'border-gray-200 bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      {medal && <span className="text-2xl">{medal}</span>}
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <h3 className="font-bold text-gray-800 flex items-center gap-2">
                            {result.name}
                            {isUserSelection && (
                              <span className="text-xs bg-purple-200 text-purple-700 px-2 py-0.5 rounded-full">
                                Your pick
                              </span>
                            )}
                          </h3>
                          <span className="text-sm font-semibold text-gray-700">
                            {result.count} vote{result.count !== 1 ? 's' : ''}
                          </span>
                        </div>

                        {/* Progress Bar */}
                        <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${result.percentage}%` }}
                            transition={{ duration: 0.8, ease: 'easeOut' }}
                            className={`h-full ${
                              isUserSelection
                                ? 'bg-gradient-to-r from-purple-500 to-pink-500'
                                : 'bg-gradient-to-r from-blue-400 to-blue-600'
                            }`}
                          />
                        </div>

                        <div className="text-xs text-gray-600 mt-1">
                          {result.percentage.toFixed(1)}% of total votes
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Share Results CTA */}
            <div className="mt-6 p-4 bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg border border-purple-200">
              <p className="text-sm text-gray-700 text-center mb-3">
                💡 Help <strong>{voteSession.createdByName}</strong> by sharing this vote!
              </p>
              <button
                onClick={() => setShowShareModal(true)}
                className="w-full py-2 bg-white text-purple-700 font-semibold rounded-lg hover:shadow-md transition"
              >
                Share Vote →
              </button>
            </div>
          </div>
        )}

        {/* Footer Attribution */}
        <div className="mt-8 text-center text-sm text-gray-600">
          <p>
            Powered by{' '}
            <button
              onClick={() => navigate('/')}
              className="text-purple-600 font-semibold hover:underline"
            >
              SoulSeed
            </button>
            {' '}• Create your own vote with your favorites!
          </p>
        </div>
      </div>

      {/* Share Modal */}
      <ShareVoteModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        voteId={voteId || ''}
        title={voteSession.title}
      />
    </div>
  );
}
