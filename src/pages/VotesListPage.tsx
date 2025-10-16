/**
 * Votes List Page
 * Beautiful page displaying all user's active voting sessions
 * Features futuristic design with hero section and video background
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Vote,
  TrendingUp,
  Users,
  Clock,
  Share2,
  ExternalLink,
  Plus,
  Sparkles,
  Zap,
  Heart,
  BarChart3,
  Calendar,
  Loader
} from 'lucide-react';
import voteService, { VoteSession } from '../services/voteService';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';

export default function VotesListPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const toast = useToast();

  const [votes, setVotes] = useState<VoteSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [hoveredVoteId, setHoveredVoteId] = useState<string | null>(null);

  useEffect(() => {
    loadUserVotes();
  }, [user]);

  const loadUserVotes = async () => {
    try {
      setLoading(true);
      if (user?.id) {
        const userVotes = await voteService.getUserVotes(user.id);
        // Sort by most recent first
        const sortedVotes = userVotes.sort((a, b) =>
          b.createdAt.toMillis() - a.createdAt.toMillis()
        );
        setVotes(sortedVotes);
      } else {
        setVotes([]);
      }
    } catch (error) {
      console.error('Error loading votes:', error);
      toast.error('Failed to load your votes');
    } finally {
      setLoading(false);
    }
  };

  const getShareUrl = (voteId: string) => {
    return `${window.location.origin}/babyname2/vote/${voteId}`;
  };

  const copyShareLink = (voteId: string, voteTitle: string) => {
    const url = getShareUrl(voteId);
    navigator.clipboard.writeText(url);
    toast.success(`Link copied for "${voteTitle}"!`);
  };

  const getTimeAgo = (timestamp: any): string => {
    const date = timestamp.toDate();
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-900 to-pink-900 relative overflow-hidden">
      {/* Animated background particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-white rounded-full opacity-30"
            initial={{
              x: Math.random() * window.innerWidth,
              y: Math.random() * window.innerHeight,
            }}
            animate={{
              x: Math.random() * window.innerWidth,
              y: Math.random() * window.innerHeight,
            }}
            transition={{
              duration: 20 + Math.random() * 10,
              repeat: Infinity,
              repeatType: 'reverse',
            }}
          />
        ))}
      </div>

      {/* Hero Section with Video Background */}
      <div className="relative">
        {/* Video Background Container */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-purple-900/50 to-purple-900 z-10"></div>
          {/* Placeholder for video - using animated gradient instead */}
          <div className="w-full h-full bg-gradient-to-br from-purple-600/20 via-pink-600/20 to-blue-600/20 animate-pulse"></div>
        </div>

        {/* Hero Content */}
        <div className="relative z-20 max-w-6xl mx-auto px-4 py-20 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full mb-6 border border-white/20">
              <Sparkles className="w-4 h-4 text-yellow-300" />
              <span className="text-sm font-medium text-white">Powered by Real-Time Technology</span>
            </div>

            <h1 className="text-6xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent">
              Your Voting Universe
            </h1>

            <p className="text-xl md:text-2xl text-purple-100 mb-8 max-w-3xl mx-auto font-light">
              Create. Share. Decide. Together.
              <br />
              <span className="text-purple-300">Where every vote shapes the story</span>
            </p>

            <div className="flex items-center justify-center gap-4">
              <motion.button
                onClick={() => navigate('/create-vote')}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full font-bold text-lg flex items-center gap-2 shadow-2xl hover:shadow-purple-500/50 transition-shadow"
              >
                <Plus className="w-5 h-5" />
                Create New Vote
              </motion.button>

              <motion.button
                onClick={() => navigate('/')}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 bg-white/10 backdrop-blur-sm text-white rounded-full font-bold text-lg border-2 border-white/20 hover:bg-white/20 transition-all"
              >
                Explore Names
              </motion.button>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="relative z-20 max-w-6xl mx-auto px-4 -mt-10 mb-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-6 grid grid-cols-2 md:grid-cols-4 gap-6"
        >
          <div className="text-center">
            <div className="text-3xl font-bold text-white mb-1">{votes.length}</div>
            <div className="text-sm text-purple-200">Active Votes</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-white mb-1">
              {votes.reduce((sum, v) => sum + v.totalVoters, 0)}
            </div>
            <div className="text-sm text-purple-200">Total Voters</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-white mb-1">
              {votes.reduce((sum, v) => sum + v.stats.totalVotesCast, 0)}
            </div>
            <div className="text-sm text-purple-200">Votes Cast</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-white mb-1">
              {votes.reduce((sum, v) => sum + v.names.length, 0)}
            </div>
            <div className="text-sm text-purple-200">Names Listed</div>
          </div>
        </motion.div>
      </div>

      {/* Votes Grid */}
      <div className="relative z-20 max-w-6xl mx-auto px-4 pb-20">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader className="w-12 h-12 animate-spin text-white" />
          </div>
        ) : votes.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <Vote className="w-24 h-24 text-white/30 mx-auto mb-6" />
            <h3 className="text-2xl font-bold text-white mb-4">No votes yet</h3>
            <p className="text-purple-200 mb-8">Create your first voting session to get started!</p>
            <motion.button
              onClick={() => navigate('/create-vote')}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full font-bold text-lg flex items-center gap-2 mx-auto shadow-2xl"
            >
              <Plus className="w-5 h-5" />
              Create Your First Vote
            </motion.button>
          </motion.div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            <AnimatePresence>
              {votes.map((vote, index) => (
                <motion.div
                  key={vote.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  onMouseEnter={() => setHoveredVoteId(vote.id)}
                  onMouseLeave={() => setHoveredVoteId(null)}
                  className="relative group"
                >
                  {/* Glow effect on hover */}
                  {hoveredVoteId === vote.id && (
                    <motion.div
                      layoutId="hover-glow"
                      className="absolute -inset-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl blur-xl opacity-50"
                      transition={{ duration: 0.2 }}
                    />
                  )}

                  {/* Card */}
                  <div className="relative bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-6 hover:bg-white/15 transition-all overflow-hidden">
                    {/* Status badge */}
                    <div className="absolute top-4 right-4">
                      <div className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 ${
                        vote.status === 'active'
                          ? 'bg-green-500/20 text-green-300 border border-green-500/30'
                          : 'bg-gray-500/20 text-gray-300 border border-gray-500/30'
                      }`}>
                        <div className={`w-2 h-2 rounded-full ${
                          vote.status === 'active' ? 'bg-green-400 animate-pulse' : 'bg-gray-400'
                        }`} />
                        {vote.status === 'active' ? 'Live' : 'Closed'}
                      </div>
                    </div>

                    {/* Vote Title */}
                    <h3 className="text-2xl font-bold text-white mb-2 pr-20">
                      {vote.title}
                    </h3>

                    {vote.description && (
                      <p className="text-purple-200 text-sm mb-4 line-clamp-2">
                        {vote.description}
                      </p>
                    )}

                    {/* Stats Grid */}
                    <div className="grid grid-cols-3 gap-4 mb-6 py-4 border-y border-white/10">
                      <div>
                        <div className="flex items-center gap-1 text-purple-300 text-xs mb-1">
                          <Users className="w-3 h-3" />
                          Voters
                        </div>
                        <div className="text-xl font-bold text-white">{vote.totalVoters}</div>
                      </div>
                      <div>
                        <div className="flex items-center gap-1 text-purple-300 text-xs mb-1">
                          <TrendingUp className="w-3 h-3" />
                          Votes
                        </div>
                        <div className="text-xl font-bold text-white">{vote.stats.totalVotesCast}</div>
                      </div>
                      <div>
                        <div className="flex items-center gap-1 text-purple-300 text-xs mb-1">
                          <Heart className="w-3 h-3" />
                          Names
                        </div>
                        <div className="text-xl font-bold text-white">{vote.names.length}</div>
                      </div>
                    </div>

                    {/* Metadata */}
                    <div className="flex items-center justify-between text-sm text-purple-300 mb-4">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        {getTimeAgo(vote.createdAt)}
                      </div>
                      {vote.pointsPerVoter && (
                        <div className="flex items-center gap-1 px-2 py-1 bg-yellow-500/20 rounded-full text-yellow-300 text-xs font-bold">
                          <Zap className="w-3 h-3" />
                          {vote.pointsPerVoter} pts
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      <motion.button
                        onClick={() => navigate(`/vote/${vote.id}`)}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="flex-1 px-4 py-2.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-semibold flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-purple-500/50 transition-shadow"
                      >
                        <BarChart3 className="w-4 h-4" />
                        View Results
                      </motion.button>

                      <motion.button
                        onClick={() => copyShareLink(vote.id, vote.title)}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="px-4 py-2.5 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-all border border-white/20"
                      >
                        <Share2 className="w-4 h-4" />
                      </motion.button>

                      <motion.button
                        onClick={() => {
                          window.open(getShareUrl(vote.id), '_blank');
                        }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="px-4 py-2.5 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-all border border-white/20"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
