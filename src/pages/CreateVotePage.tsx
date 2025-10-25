/**
 * CreateVotePage - SPECTACULAR Vote Creation Wizard
 * Multi-step form with 3D flip transitions, frosted glass, and confetti celebrations
 * Features: 4-step wizard, name selection from favorites, points allocation, preview
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Check,
  Heart,
  Calendar,
  Zap,
  Users,
  X,
  CheckCircle,
  Award,
  Star,
  Trash2
} from 'lucide-react';
import confetti from 'canvas-confetti';
import GlassCard from '../components/GlassCard';
import ParallaxBackground from '../components/ParallaxBackground';
import voteService from '../services/voteService';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import favoritesService from '../services/favoritesService';

const steps = ['Title', 'Names', 'Settings', 'Review'];

export default function CreateVotePage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const toast = useToast();

  const [currentStep, setCurrentStep] = useState(0);
  const [direction, setDirection] = useState(1);

  // Ready-made title options
  const readyMadeTitles = [
    "Vote for our future baby's name!",
    "Help us choose the perfect name!",
    "Which name do you love most?"
  ];

  // Form state - PRE-SELECTED for easy vote creation!
  const [customTitle, setCustomTitle] = useState(readyMadeTitles[0]);
  const [selectedReadyMade, setSelectedReadyMade] = useState<number | null>(0); // Index of selected ready-made (null if custom)
  const [selectedNames, setSelectedNames] = useState<string[]>([]);
  const [voteType, setVoteType] = useState<'single' | 'multiple'>('multiple');
  const [maxVotes, setMaxVotes] = useState(3);
  const [pointsPerVoter, setPointsPerVoter] = useState<number | undefined>(undefined);
  const [usePoints, setUsePoints] = useState(false);
  const [expiresAt, setExpiresAt] = useState<Date | null>(null);
  const [creating, setCreating] = useState(false);

  // Name selection
  const [availableNames, setAvailableNames] = useState<string[]>([]);
  const [lastSelection, setLastSelection] = useState<'all' | 'top3' | 'top10' | 'clear' | null>('top10');

  useEffect(() => {
    // Load user's favorite names with pinned names at top
    const favorites = favoritesService.getFavorites();
    const pinnedNames = favoritesService.getPinnedFavorites();

    // Sort: pinned names first, then regular favorites
    const sortedNames = [
      ...pinnedNames,
      ...favorites.filter(name => !pinnedNames.includes(name))
    ];

    setAvailableNames(sortedNames);

    // Pre-select top 10 favorites for easy vote creation
    const top10 = sortedNames.slice(0, 10);
    setSelectedNames(top10);
    // Button state already set to 'top10' in initial state
  }, []);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setDirection(1);
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setDirection(-1);
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleCreate = async () => {
    if (!user) {
      toast.error('Please sign in to create a vote');
      return;
    }

    if (selectedNames.length < 2) {
      toast.error('Please select at least 2 names');
      return;
    }

    // Validate title
    const finalTitle = customTitle.trim();

    if (!finalTitle) {
      toast.error('Please enter a title');
      return;
    }

    try {
      setCreating(true);

      const voteId = await voteService.createVote(user.id, user.name || 'Anonymous', {
        title: finalTitle,
        names: selectedNames.map(name => ({ name })),
        voteType,
        maxVotes,
        pointsPerVoter: usePoints ? pointsPerVoter : undefined,
        isPublic: true,
        expiresAt
      });

      // CELEBRATE! 🎉
      confetti({
        particleCount: 150,
        spread: 100,
        origin: { y: 0.5 },
        colors: ['#D8B2F2', '#FFB3D9', '#B3D9FF']
      });

      toast.success('Vote created successfully!');
      navigate(`/vote/${voteId}`);
    } catch (error) {
      console.error('Error creating vote:', error);
      toast.error('Failed to create vote');
    } finally {
      setCreating(false);
    }
  };

  const selectAll = () => {
    setSelectedNames([...availableNames]);
    setLastSelection('all');
    toast.success(`Selected all ${availableNames.length} names!`);
  };

  const selectTop3 = () => {
    const top3 = availableNames.slice(0, 3);
    setSelectedNames(top3);
    setLastSelection('top3');
    toast.success(`Selected top 3 favorite names!`);
  };

  const selectTop10 = () => {
    const top10 = availableNames.slice(0, 10);
    setSelectedNames(top10);
    setLastSelection('top10');
    toast.success(`Selected top 10 favorite names!`);
  };

  const clearAllNames = () => {
    setSelectedNames([]);
    setLastSelection('clear');
    toast.success('Cleared all selections');
  };

  const toggleNameSelection = (name: string) => {
    setSelectedNames(prev =>
      prev.includes(name)
        ? prev.filter(n => n !== name)
        : [...prev, name]
    );
    // Reset lastSelection when manually toggling names
    setLastSelection(null);
  };

  return (
    <>
      <Helmet>
        <title>Create Baby Name Vote - Share & Vote with Your Partner | SoulSeed</title>
        <meta name="description" content="Create a baby name voting session to share with your partner. Select your favorite names and let everyone vote on their top choices together!" />
        <link rel="canonical" href="https://soulseedbaby.com/create-vote" />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 relative overflow-hidden py-4 px-4">
      <ParallaxBackground />

      {/* Main Content */}
      <div className="max-w-4xl mx-auto relative z-10">
        {/* Progress Steps */}
        <div className="flex items-center justify-center gap-2 mb-4">
          {steps.map((step, index) => (
            <React.Fragment key={step}>
              <motion.div
                initial={{ scale: 1 }}
                animate={{ scale: 1 }}
                className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all ${
                  index === currentStep
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                    : index < currentStep
                    ? 'bg-green-500 text-white'
                    : 'bg-white/40 backdrop-blur-sm text-gray-600 border border-white/30'
                }`}
              >
                {index < currentStep ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <span className="text-sm font-bold">{index + 1}</span>
                )}
                <span className="text-sm font-medium hidden sm:inline">{step}</span>
              </motion.div>

              {index < steps.length - 1 && (
                <div className={`w-8 h-0.5 ${index < currentStep ? 'bg-green-500' : 'bg-gray-300'}`} />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Step Content (Glass Card with 3D Flip) */}
        <GlassCard className="p-4 min-h-[400px]">
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={currentStep}
                custom={direction}
                variants={{
                  enter: (direction: number) => ({
                    rotateY: direction > 0 ? 90 : -90,
                    opacity: 0,
                    scale: 0.8,
                  }),
                  center: {
                    rotateY: 0,
                    opacity: 1,
                    scale: 1,
                  },
                  exit: (direction: number) => ({
                    rotateY: direction > 0 ? -90 : 90,
                    opacity: 0,
                    scale: 0.8,
                  }),
                }}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{
                  rotateY: { type: 'spring', stiffness: 100, damping: 20 },
                  opacity: { duration: 0.3 },
                  scale: { duration: 0.3 },
                }}
                style={{
                  transformStyle: 'preserve-3d',
                  perspective: 1000,
                }}
              >
                {/* Step 1: Title */}
                {currentStep === 0 && (
                  <div className="space-y-6">
                    <h2 className="text-3xl font-bold text-gray-800 mb-6">What are you voting on?</h2>

                    {/* Ready-made Title Cards */}
                    <div className="space-y-3">
                      <label className="block text-sm font-semibold text-gray-700 mb-3">
                        Choose a ready-made title:
                      </label>
                      <div className="grid grid-cols-1 gap-3">
                        {readyMadeTitles.map((title, index) => (
                          <motion.button
                            key={index}
                            type="button"
                            onClick={() => {
                              setCustomTitle(title);
                              setSelectedReadyMade(index);
                            }}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className={`w-full p-4 rounded-xl transition-all text-left ${
                              selectedReadyMade === index
                                ? 'bg-gradient-to-br from-purple-500 to-pink-500 text-white border-2 border-purple-600 shadow-lg'
                                : 'bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200 hover:border-purple-400 text-gray-800'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <p className={`text-base font-bold ${selectedReadyMade === index ? 'text-white' : 'text-gray-800'}`}>
                                {title}
                              </p>
                              {selectedReadyMade === index && (
                                <Check className="w-5 h-5 text-white" />
                              )}
                            </div>
                          </motion.button>
                        ))}
                      </div>
                    </div>

                    {/* Manual Input */}
                    <div className="space-y-3">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Or write your own:
                      </label>
                      <input
                        type="text"
                        value={selectedReadyMade === null ? customTitle : ''}
                        onChange={(e) => {
                          setCustomTitle(e.target.value);
                          setSelectedReadyMade(null);
                        }}
                        onFocus={() => {
                          if (selectedReadyMade !== null) {
                            setCustomTitle('');
                            setSelectedReadyMade(null);
                          }
                        }}
                        placeholder="Enter your custom title..."
                        maxLength={100}
                        className="w-full px-4 py-3 bg-white/40 backdrop-blur-sm border-2 border-white/30 rounded-xl focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500 outline-none transition-all text-gray-800 font-medium"
                      />
                      {selectedReadyMade === null && (
                        <div className="text-xs text-gray-500 text-right">
                          {customTitle.length}/100
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Step 2: Name Selection */}
                {currentStep === 1 && (
                  <div className="space-y-3">

                    {/* Selected count & Quick Actions */}
                    <div className="space-y-1.5">
                      {/* Selected Count Badge */}
                      <div className="flex items-center justify-center">
                        <motion.div
                          initial={{ scale: 1 }}
                          animate={{ scale: selectedNames.length > 0 ? 1.02 : 1 }}
                          className="px-3 py-1.5 bg-gradient-to-r from-purple-100 to-pink-100 rounded-full border border-purple-200"
                        >
                          <span className="text-xs font-bold text-purple-700">
                            {selectedNames.length} {selectedNames.length === 1 ? 'name' : 'names'} selected
                          </span>
                        </motion.div>
                      </div>

                      {/* Quick Action Buttons - Compact One Line */}
                      <div className="flex gap-1.5 justify-center">
                        {/* Select All */}
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={selectAll}
                          disabled={availableNames.length === 0 || selectedNames.length === availableNames.length}
                          className={`px-2.5 py-1.5 border-2 font-bold rounded-full transition-all disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:scale-100 ${
                            lastSelection === 'all'
                              ? 'bg-gradient-to-r from-blue-500 to-cyan-600 border-blue-600 text-white shadow-md'
                              : 'border-blue-500 text-blue-600 hover:border-blue-600 backdrop-blur-sm bg-white/50'
                          }`}
                        >
                          <div className="flex items-center gap-1">
                            <CheckCircle className="w-3 h-3" />
                            <span className="text-xs">All</span>
                          </div>
                        </motion.button>

                        {/* Top 3 */}
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={selectTop3}
                          disabled={availableNames.length < 3}
                          className={`px-2.5 py-1.5 border-2 font-bold rounded-full transition-all disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:scale-100 ${
                            lastSelection === 'top3'
                              ? 'bg-gradient-to-r from-blue-500 to-cyan-600 border-blue-600 text-white shadow-md'
                              : 'border-blue-500 text-blue-600 hover:border-blue-600 backdrop-blur-sm bg-white/50'
                          }`}
                        >
                          <div className="flex items-center gap-1">
                            <Award className="w-3 h-3" />
                            <span className="text-xs">Top 3</span>
                          </div>
                        </motion.button>

                        {/* Top 10 */}
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={selectTop10}
                          disabled={availableNames.length < 10}
                          className={`px-2.5 py-1.5 border-2 font-bold rounded-full transition-all disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:scale-100 ${
                            lastSelection === 'top10'
                              ? 'bg-gradient-to-r from-blue-500 to-cyan-600 border-blue-600 text-white shadow-md'
                              : 'border-blue-500 text-blue-600 hover:border-blue-600 backdrop-blur-sm bg-white/50'
                          }`}
                        >
                          <div className="flex items-center gap-1">
                            <Star className="w-3 h-3" />
                            <span className="text-xs">Top 10</span>
                          </div>
                        </motion.button>

                        {/* Clear All */}
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={clearAllNames}
                          disabled={selectedNames.length === 0}
                          className={`px-2.5 py-1.5 border-2 font-bold rounded-full transition-all disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:scale-100 ${
                            lastSelection === 'clear'
                              ? 'bg-gradient-to-r from-rose-400 to-red-500 border-red-500 text-white shadow-md'
                              : 'border-red-400 text-red-500 hover:border-red-500 backdrop-blur-sm bg-white/50'
                          }`}
                        >
                          <div className="flex items-center gap-1">
                            <Trash2 className="w-3 h-3" />
                            <span className="text-xs">Clear</span>
                          </div>
                        </motion.button>
                      </div>
                    </div>

                    {/* Names grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 max-h-[240px] overflow-y-auto">
                      {availableNames.map((name) => {
                        const isSelected = selectedNames.includes(name);
                        return (
                          <motion.button
                            key={name}
                            onClick={() => toggleNameSelection(name)}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className={`p-2 rounded-lg border-2 font-semibold transition-all ${
                              isSelected
                                ? 'bg-gradient-to-br from-purple-500 to-pink-500 text-white border-purple-600 shadow-lg'
                                : 'bg-white/40 backdrop-blur-sm text-gray-700 border-white/30 hover:border-purple-300'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-sm">{name}</span>
                              {isSelected && <Check className="w-3.5 h-3.5" />}
                            </div>
                          </motion.button>
                        );
                      })}
                    </div>

                    {availableNames.length === 0 && (
                      <div className="text-center py-8 text-gray-500">
                        <Heart className="w-12 h-12 mx-auto mb-2 opacity-30" />
                        <p className="mb-4">No favorite names yet! Add names to your favorites first.</p>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => navigate('/')}
                          className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all inline-flex items-center gap-2"
                        >
                          <Sparkles className="w-5 h-5" />
                          Browse Names
                        </motion.button>
                      </div>
                    )}
                  </div>
                )}

                {/* Step 3: Settings */}
                {currentStep === 2 && (
                  <div className="space-y-6">
                    <h2 className="text-3xl font-bold text-gray-800 mb-6">Voting Settings</h2>

                    {/* Max votes per person */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        <Heart className="inline w-4 h-4 mr-1" />
                        Number of Votes Per Person
                      </label>
                      <input
                        type="number"
                        min={1}
                        max={selectedNames.length}
                        value={maxVotes}
                        onChange={(e) => setMaxVotes(parseInt(e.target.value) || 1)}
                        className="w-full px-4 py-3 bg-white/40 backdrop-blur-sm border-2 border-white/30 rounded-xl focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500 outline-none transition-all"
                      />
                      <p className="text-xs text-gray-500 mt-1">Each voter can select up to {maxVotes} {maxVotes === 1 ? 'name' : 'names'}</p>
                    </div>

                    {/* Expiration (optional) */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        <Calendar className="inline w-4 h-4 mr-1" />
                        Expires On (optional)
                      </label>
                      <input
                        type="date"
                        onChange={(e) => setExpiresAt(e.target.value ? new Date(e.target.value) : null)}
                        className="w-full px-4 py-3 bg-white/40 backdrop-blur-sm border-2 border-white/30 rounded-xl focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500 outline-none transition-all"
                      />
                      <p className="text-xs text-gray-500 mt-1">Leave empty for no expiration</p>
                    </div>
                  </div>
                )}

                {/* Step 4: Review */}
                {currentStep === 3 && (
                  <div className="space-y-6">
                    <h2 className="text-3xl font-bold text-gray-800 mb-6">Review & Create</h2>

                    <div className="space-y-4">
                      <div className="p-4 bg-purple-50/50 rounded-lg">
                        <div className="text-sm font-semibold text-purple-700 mb-1">Title</div>
                        <div className="text-lg font-bold text-gray-800">{customTitle}</div>
                      </div>

                      <div className="p-4 bg-purple-50/50 rounded-lg">
                        <div className="text-sm font-semibold text-purple-700 mb-2">
                          Names ({selectedNames.length})
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {selectedNames.map(name => (
                            <span
                              key={name}
                              className="px-3 py-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full text-sm font-medium"
                            >
                              {name}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="p-4 bg-purple-50/50 rounded-lg">
                        <div className="text-sm font-semibold text-purple-700 mb-2">Settings</div>
                        <ul className="space-y-1 text-gray-700">
                          <li>• Votes Per Person: <strong>{maxVotes}</strong></li>
                          {expiresAt ? (
                            <li>• Expires: <strong>{expiresAt.toLocaleDateString()}</strong></li>
                          ) : (
                            <li>• Expires: <strong>Never</strong></li>
                          )}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
        </GlassCard>

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-4">
            {currentStep > 0 && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleBack}
                className="px-6 py-3 bg-white/40 backdrop-blur-sm text-gray-700 font-semibold rounded-xl border border-white/30 hover:bg-white/60 transition flex items-center gap-2"
              >
                <ArrowLeft className="w-5 h-5" />
                Back
              </motion.button>
            )}

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={currentStep < steps.length - 1 ? handleNext : handleCreate}
              disabled={
                creating ||
                (currentStep === 0 && !customTitle.trim()) ||
                (currentStep === 1 && selectedNames.length < 2)
              }
              className="ml-auto px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {creating ? (
                'Creating...'
              ) : currentStep < steps.length - 1 ? (
                <>
                  Next
                  <ArrowRight className="w-5 h-5" />
                </>
              ) : (
                <>
                  Create Vote
                  <Sparkles className="w-5 h-5" />
                </>
              )}
            </motion.button>
        </div>
      </div>
    </div>
    </>
  );
}
