/**
 * Voting Page
 * Public page where users can vote on name selections
 * Features real-time updates and interactive voting UI
 */

import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import SEOHead from '../components/SEO/SEOHead';
import {
  ArrowLeft,
  CheckCircle2,
  Users,
  Clock,
  Share2,
  TrendingUp,
  Loader,
  AlertCircle,
  Trophy,
  Heart,
  Zap
} from 'lucide-react';
import voteService, { VoteSession, VoteResult } from '../services/voteService';
import { getVoterId, hasVoted, markAsVoted, getPreviousVote } from '../utils/voterIdGenerator';
import ShareVoteModal from '../components/ShareVoteModal';
import VoterAvatars from '../components/VoterAvatars';
import { useToast } from '../contexts/ToastContext';
import { useAuth } from '../contexts/AuthContext';
import ParallaxBackground from '../components/ParallaxBackground';
import VotingButton from '../components/VotingButton';
import VoteReasonModal from '../components/VoteReasonModal';

export default function VotingPage() {
  const { voteId } = useParams<{ voteId: string }>();
  const navigate = useNavigate();
  const toast = useToast();
  const { user } = useAuth();

  const [voteSession, setVoteSession] = useState<VoteSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedNames, setSelectedNames] = useState<string[]>([]);
  const [namePoints, setNamePoints] = useState<Record<string, number>>({}); // For backward compatibility
  const [nameVotes, setNameVotes] = useState<Record<string, number>>({}); // NEW: Vote counts per name
  const [submitting, setSubmitting] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [results, setResults] = useState<VoteResult[]>([]);
  const [showShareModal, setShowShareModal] = useState(false);
  const [voterId] = useState(getVoterId());

  // NEW: Reason collection state
  const [showReasonModal, setShowReasonModal] = useState(false);
  const [currentReasonName, setCurrentReasonName] = useState('');
  const [namesNeedingReasons, setNamesNeedingReasons] = useState<string[]>([]);
  const [collectedReasons, setCollectedReasons] = useState<Record<string, string>>({});
  const [collectedReasonTypes, setCollectedReasonTypes] = useState<Record<string, 'preset' | 'custom'>>({});

  // Get user info for voter avatars
  const voterName = user?.name || undefined;
  const voterAvatar = user?.picture || undefined;

  /**
   * Calculate vote limit based on session configuration
   */
  const voteLimit = useMemo(() => {
    if (!voteSession) return 0;
    return voteSession.pointsPerVoter || voteSession.maxVotes || 10; // Default to 10 if not set
  }, [voteSession]);

  /**
   * Calculate total votes used by current user
   */
  const totalVotesUsed = useMemo(() => {
    return Object.values(nameVotes).reduce((sum, votes) => sum + votes, 0);
  }, [nameVotes]);

  /**
   * Calculate rankings with real-time updates
   * Combines existing votes from session + user's current votes
   */
  const rankedNames = useMemo(() => {
    if (!voteSession) return [];

    const namesWithScores = voteSession.names.map(nameEntry => {
      const existingVotes = voteSession.votes[nameEntry.name]?.count || 0;
      const existingPoints = voteSession.votes[nameEntry.name]?.totalPoints || 0;
      const userVotes = nameVotes[nameEntry.name] || 0;

      // Use points if points-based voting, otherwise use count
      const totalScore = voteSession.pointsPerVoter
        ? existingPoints + userVotes
        : existingVotes + userVotes;

      return {
        ...nameEntry,
        currentVotes: userVotes,
        totalVotes: totalScore,
      };
    });

    // Sort by total votes descending
    return namesWithScores.sort((a, b) => b.totalVotes - a.totalVotes);
  }, [voteSession, nameVotes]);

  /**
   * Calculate total votes across all names (for percentage calculation)
   */
  const totalAllVotes = useMemo(() => {
    return rankedNames.reduce((sum, name) => sum + name.totalVotes, 0);
  }, [rankedNames]);

  /**
   * Handle vote increment
   */
  const handleIncrement = (nameName: string) => {
    if (hasSubmitted) return;

    const currentVotes = nameVotes[nameName] || 0;
    const newTotal = totalVotesUsed + 1;

    if (newTotal > voteLimit) {
      toast.warning(`Vote limit reached! You can only use ${voteLimit} votes.`);
      return;
    }

    setNameVotes(prev => ({
      ...prev,
      [nameName]: currentVotes + 1
    }));
  };

  /**
   * Handle vote decrement
   */
  const handleDecrement = (nameName: string) => {
    if (hasSubmitted) return;

    const currentVotes = nameVotes[nameName] || 0;
    if (currentVotes === 0) return;

    setNameVotes(prev => ({
      ...prev,
      [nameName]: currentVotes - 1
    }));
  };

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
   * Start reason collection process (NEW: Collects reasons before submitting)
   */
  const handleSubmitVote = async () => {
    if (!voteId || !voteSession) return;

    // Check if any votes allocated
    if (totalVotesUsed === 0) {
      toast.warning('Please allocate at least one vote');
      return;
    }

    // Get list of names that were voted for
    const votedNames = Object.keys(nameVotes).filter(name => nameVotes[name] > 0);

    // Start collecting reasons
    setNamesNeedingReasons(votedNames);
    setCollectedReasons({});
    setCollectedReasonTypes({});

    // Open modal for first name
    if (votedNames.length > 0) {
      setCurrentReasonName(votedNames[0]);
      setShowReasonModal(true);
    }
  };

  /**
   * Handle reason submission from modal (NEW)
   */
  const handleReasonSubmit = (reason?: string, reasonType?: 'preset' | 'custom') => {
    // Save the reason for current name
    if (reason && reasonType) {
      setCollectedReasons(prev => ({ ...prev, [currentReasonName]: reason }));
      setCollectedReasonTypes(prev => ({ ...prev, [currentReasonName]: reasonType }));
    }

    // Find next name needing reason
    const currentIndex = namesNeedingReasons.indexOf(currentReasonName);
    const nextIndex = currentIndex + 1;

    if (nextIndex < namesNeedingReasons.length) {
      // More names to collect reasons for
      setCurrentReasonName(namesNeedingReasons[nextIndex]);
    } else {
      // All reasons collected, submit the vote
      setShowReasonModal(false);
      submitVoteWithReasons();
    }
  };

  /**
   * Submit vote with collected reasons (NEW)
   */
  const submitVoteWithReasons = async () => {
    try {
      if (!voteId || !voteSession) return;

      setSubmitting(true);

      // Submit votes with reasons
      await voteService.submitVote({
        voteId,
        namePoints: nameVotes,
        voterId,
        voterName,
        voterAvatar,
        voteReasons: collectedReasons,
        reasonTypes: collectedReasonTypes
      });

      // Mark as voted in localStorage
      const votedNames = Object.keys(nameVotes).filter(name => nameVotes[name] > 0);
      markAsVoted(voteId, votedNames);
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
   * Handle like toggle (NEW: Likes feature)
   */
  const handleLikeToggle = async (nameName: string) => {
    try {
      if (!voteId) return;

      await voteService.toggleLike(voteId, nameName, voterId, voterName, voterAvatar);
      // Real-time update will happen via subscription
    } catch (err) {
      console.error('Error toggling like:', err);
      toast.error('Failed to toggle like');
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
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Vote Not Found</h2>
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
    <>
      <SEOHead
        title={`Vote on Baby Names - ${voteSession?.title || 'Loading'} | SoulSeed`}
        description="Cast your vote and help choose the perfect baby name! Share your preferences in this interactive voting session."
        canonical={`https://soulseedbaby.com/vote/${voteId}`}
      />

      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 relative">
      <ParallaxBackground />

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

          {/* Voting Question - NEW */}
          {voteSession.votingQuestion && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="bg-gradient-to-r from-purple-100 via-pink-100 to-blue-100 rounded-xl p-6 mb-6 border-2 border-purple-200"
            >
              <div className="flex items-start space-x-4">
                {voteSession.questionEmoji && (
                  <motion.span
                    className="text-5xl flex-shrink-0"
                    animate={{
                      scale: [1, 1.1, 1],
                      rotate: [0, 5, -5, 0]
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      repeatType: 'reverse'
                    }}
                  >
                    {voteSession.questionEmoji}
                  </motion.span>
                )}
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-gray-800 leading-tight">
                    {voteSession.votingQuestion}
                  </h2>
                  {voteSession.questionType === 'custom' && (
                    <p className="text-sm text-gray-600 mt-2 italic">
                      Custom question from {voteSession.createdByName}
                    </p>
                  )}
                </div>
              </div>
            </motion.div>
          )}

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
              {voteSession.pointsPerVoter ? (
                <>
                  <p className="font-semibold text-gray-800">
                    👉 You have {voteSession.pointsPerVoter} votes to distribute!
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    Allocate votes to your favorite names. You can give all votes to one name or spread them across multiple!
                  </p>
                </>
              ) : (
                <>
                  <p className="font-semibold text-gray-800">
                    {voteSession.voteType === 'single'
                      ? '👉 Pick your favorite name!'
                      : `👉 Pick your top ${voteSession.maxVotes} favorite${voteSession.maxVotes > 1 ? 's' : ''}!`}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    Click on names to select them, then submit your vote.
                  </p>
                </>
              )}
            </div>
          )}

          {hasSubmitted && (
            <div className="bg-green-50 rounded-lg p-4 border-l-4 border-green-600 flex items-center gap-3">
              <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0" />
              <div>
                <p className="font-semibold text-gray-800">Your vote has been recorded!</p>
                {voteSession.pointsPerVoter ? (
                  <p className="text-sm text-gray-600">
                    Your points: {Object.entries(namePoints)
                      .filter(([_, points]) => points > 0)
                      .map(([name, points]) => `${name} (${points})`)
                      .join(', ')}
                  </p>
                ) : (
                  <p className="text-sm text-gray-600">You voted for: {selectedNames.join(', ')}</p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Voting Interface with Animated Ranking */}
        {!hasSubmitted ? (
          <div className="space-y-6">
            {/* Vote Progress Bar */}
            <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl p-6 border-2 border-purple-200">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                  <Zap className="w-5 h-5 text-yellow-500" />
                  Your Votes
                </h3>
                <div className="text-right">
                  <div className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                    {totalVotesUsed} <span className="text-xl text-gray-400">/ {voteLimit}</span>
                  </div>
                  <div className="text-xs text-gray-500">
                    {voteLimit - totalVotesUsed} remaining
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(totalVotesUsed / voteLimit) * 100}%` }}
                  transition={{ duration: 0.5, ease: 'easeOut' }}
                  className={`h-full ${
                    totalVotesUsed >= voteLimit
                      ? 'bg-gradient-to-r from-red-400 to-red-600'
                      : 'bg-gradient-to-r from-purple-500 to-pink-500'
                  }`}
                />
              </div>
            </div>

            {/* Instructions */}
            <div className="bg-gradient-to-r from-purple-100/80 to-pink-100/80 backdrop-blur-sm rounded-xl p-4 border-l-4 border-purple-600">
              <p className="font-semibold text-gray-800">
                👉 Click +/- to allocate your votes! Watch names climb the rankings in real-time!
              </p>
              <p className="text-sm text-gray-600 mt-1">
                You have {voteLimit} votes total. Spread them across your favorites or stack them all on one!
              </p>
            </div>

            {/* Ranked Names with VotingButton Components */}
            <div className="space-y-4">
              <AnimatePresence>
                {rankedNames.map((nameEntry, index) => {
                  const rank = index + 1;
                  const canIncrement = totalVotesUsed < voteLimit;
                  const maxVotesReached = totalVotesUsed >= voteLimit && nameEntry.currentVotes === 0;

                  return (
                    <motion.div
                      key={nameEntry.name}
                      layout
                      layoutId={nameEntry.name}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{
                        layout: {
                          type: 'spring',
                          stiffness: 300,
                          damping: 30
                        }
                      }}
                    >
                      <VotingButton
                        name={nameEntry.name}
                        meaning={nameEntry.meaning}
                        origin={nameEntry.origin}
                        currentVotes={nameEntry.currentVotes}
                        totalVotes={totalAllVotes}
                        rank={rank}
                        onIncrement={() => handleIncrement(nameEntry.name)}
                        onDecrement={() => handleDecrement(nameEntry.name)}
                        canIncrement={canIncrement}
                        maxVotesReached={maxVotesReached}
                      />
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>

            {/* Submit Button */}
            <motion.button
              onClick={handleSubmitVote}
              disabled={submitting || totalVotesUsed === 0}
              className={`w-full py-5 rounded-2xl font-bold text-xl flex items-center justify-center gap-3 transition-all ${
                totalVotesUsed > 0
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:shadow-2xl hover:shadow-purple-500/50 transform hover:scale-[1.02]'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
              whileTap={totalVotesUsed > 0 ? { scale: 0.98 } : {}}
            >
              {submitting ? (
                <>
                  <Loader className="w-7 h-7 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-7 h-7" />
                  Submit My Vote ({totalVotesUsed} {totalVotesUsed === 1 ? 'vote' : 'votes'})
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
                            {result.count} {voteSession.pointsPerVoter ? 'point' : 'vote'}{result.count !== 1 ? 's' : ''}
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
                          {result.percentage.toFixed(1)}% of total {voteSession.pointsPerVoter ? 'points' : 'votes'}
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

      {/* Voter Avatars - Fixed at bottom of page */}
      {voteSession.allVoters && voteSession.allVoters.length > 0 && (
        <VoterAvatars voters={voteSession.allVoters} maxDisplay={30} />
      )}

      {/* Share Modal */}
      <ShareVoteModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        voteId={voteId || ''}
        title={voteSession.title}
      />

      {/* Vote Reason Modal - NEW */}
      <VoteReasonModal
        isOpen={showReasonModal}
        nameName={currentReasonName}
        onSubmit={handleReasonSubmit}
        onClose={() => {
          // Cancel reason collection
          setShowReasonModal(false);
          setNamesNeedingReasons([]);
          setCollectedReasons({});
          setCollectedReasonTypes({});
        }}
      />
    </div>
    </>
  );
}
