/**
 * CreateVotePage - SPECTACULAR Vote Creation Wizard
 * Multi-step form with 3D flip transitions, frosted glass, and confetti celebrations
 * Features: 4-step wizard, name selection from favorites, points allocation, preview
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  Search,
  X
} from 'lucide-react';
import confetti from 'canvas-confetti';
import GlassCard from '../components/GlassCard';
import ParallaxBackground from '../components/ParallaxBackground';
import ScrollReveal3D from '../components/ScrollReveal3D';
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

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedNames, setSelectedNames] = useState<string[]>([]);
  const [voteType, setVoteType] = useState<'single' | 'multiple'>('multiple');
  const [maxVotes, setMaxVotes] = useState(3);
  const [pointsPerVoter, setPointsPerVoter] = useState<number | undefined>(undefined);
  const [usePoints, setUsePoints] = useState(false);
  const [expiresAt, setExpiresAt] = useState<Date | null>(null);
  const [creating, setCreating] = useState(false);

  // Name search
  const [searchQuery, setSearchQuery] = useState('');
  const [availableNames, setAvailableNames] = useState<string[]>([]);

  useEffect(() => {
    // Load user's favorite names
    const favorites = favoritesService.getFavorites();
    setAvailableNames(favorites);
  }, []);

  const filteredNames = availableNames.filter(name =>
    name.toLowerCase().includes(searchQuery.toLowerCase())
  );

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

    try {
      setCreating(true);

      const voteId = await voteService.createVote(user.id, user.name || 'Anonymous', {
        title,
        description,
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

  const toggleNameSelection = (name: string) => {
    setSelectedNames(prev =>
      prev.includes(name)
        ? prev.filter(n => n !== name)
        : [...prev, name]
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 relative overflow-hidden py-20 px-4">
      <ParallaxBackground />

      {/* Main Content */}
      <div className="max-w-4xl mx-auto relative z-10">
        {/* Header */}
        <ScrollReveal3D>
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full mb-6 border border-white/30">
              <Sparkles className="w-4 h-4 text-purple-600" />
              <span className="text-sm font-medium text-purple-700">Create Your Vote</span>
            </div>

            <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent">
              Let's Choose Together
            </h1>

            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Create a beautiful voting session and share it with your partner, family, or friends
            </p>
          </motion.div>
        </ScrollReveal3D>

        {/* Progress Steps */}
        <ScrollReveal3D index={1}>
          <div className="flex items-center justify-center gap-2 mb-8">
            {steps.map((step, index) => (
              <React.Fragment key={step}>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: index * 0.1 }}
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
        </ScrollReveal3D>

        {/* Step Content (Glass Card with 3D Flip) */}
        <ScrollReveal3D index={2}>
          <GlassCard className="p-8 min-h-[500px]">
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
                {/* Step 1: Title & Description */}
                {currentStep === 0 && (
                  <div className="space-y-6">
                    <h2 className="text-3xl font-bold text-gray-800 mb-6">What are you voting on?</h2>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Vote Title *
                      </label>
                      <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="e.g., Our Baby Name Choices"
                        className="w-full px-4 py-3 bg-white/40 backdrop-blur-sm border-2 border-white/30 rounded-xl focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500 outline-none transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Description (optional)
                      </label>
                      <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Add any additional context or instructions..."
                        rows={4}
                        className="w-full px-4 py-3 bg-white/40 backdrop-blur-sm border-2 border-white/30 rounded-xl focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500 outline-none transition-all resize-none"
                      />
                    </div>
                  </div>
                )}

                {/* Step 2: Name Selection */}
                {currentStep === 1 && (
                  <div className="space-y-6">
                    <h2 className="text-3xl font-bold text-gray-800 mb-6">Select Names to Vote On</h2>

                    {/* Search */}
                    <div className="relative">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search your favorite names..."
                        className="w-full pl-12 pr-4 py-3 bg-white/40 backdrop-blur-sm border-2 border-white/30 rounded-xl focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500 outline-none transition-all"
                      />
                    </div>

                    {/* Selected count */}
                    <div className="flex items-center justify-between px-4 py-2 bg-purple-100/50 rounded-lg">
                      <span className="text-sm font-semibold text-purple-700">
                        {selectedNames.length} names selected
                      </span>
                      {selectedNames.length > 0 && (
                        <button
                          onClick={() => setSelectedNames([])}
                          className="text-sm text-purple-600 hover:text-purple-700 font-medium"
                        >
                          Clear all
                        </button>
                      )}
                    </div>

                    {/* Names grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 max-h-[300px] overflow-y-auto">
                      {filteredNames.map((name) => {
                        const isSelected = selectedNames.includes(name);
                        return (
                          <motion.button
                            key={name}
                            onClick={() => toggleNameSelection(name)}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className={`p-3 rounded-lg border-2 font-semibold transition-all ${
                              isSelected
                                ? 'bg-gradient-to-br from-purple-500 to-pink-500 text-white border-purple-600 shadow-lg'
                                : 'bg-white/40 backdrop-blur-sm text-gray-700 border-white/30 hover:border-purple-300'
                            }`}
                          >
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-sm">{name}</span>
                              {isSelected && <Check className="w-4 h-4" />}
                            </div>
                          </motion.button>
                        );
                      })}
                    </div>

                    {filteredNames.length === 0 && (
                      <div className="text-center py-8 text-gray-500">
                        <Heart className="w-12 h-12 mx-auto mb-2 opacity-30" />
                        <p>No favorite names yet! Add names to your favorites first.</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Step 3: Settings */}
                {currentStep === 2 && (
                  <div className="space-y-6">
                    <h2 className="text-3xl font-bold text-gray-800 mb-6">Voting Settings</h2>

                    {/* Vote type */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-3">
                        Vote Type
                      </label>
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          onClick={() => {
                            setVoteType('single');
                            setMaxVotes(1);
                          }}
                          className={`p-4 rounded-xl border-2 transition-all ${
                            voteType === 'single'
                              ? 'bg-gradient-to-br from-purple-500 to-pink-500 text-white border-purple-600 shadow-lg'
                              : 'bg-white/40 backdrop-blur-sm text-gray-700 border-white/30 hover:border-purple-300'
                          }`}
                        >
                          <Users className="w-6 h-6 mx-auto mb-2" />
                          <div className="font-bold">Single Choice</div>
                          <div className="text-xs opacity-80">Pick one favorite</div>
                        </button>

                        <button
                          onClick={() => setVoteType('multiple')}
                          className={`p-4 rounded-xl border-2 transition-all ${
                            voteType === 'multiple'
                              ? 'bg-gradient-to-br from-purple-500 to-pink-500 text-white border-purple-600 shadow-lg'
                              : 'bg-white/40 backdrop-blur-sm text-gray-700 border-white/30 hover:border-purple-300'
                          }`}
                        >
                          <Heart className="w-6 h-6 mx-auto mb-2" />
                          <div className="font-bold">Multiple Choice</div>
                          <div className="text-xs opacity-80">Pick several</div>
                        </button>
                      </div>
                    </div>

                    {/* Max votes (if multiple) */}
                    {voteType === 'multiple' && (
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Maximum Votes Per Person
                        </label>
                        <input
                          type="number"
                          min={1}
                          max={selectedNames.length}
                          value={maxVotes}
                          onChange={(e) => setMaxVotes(parseInt(e.target.value) || 1)}
                          className="w-full px-4 py-3 bg-white/40 backdrop-blur-sm border-2 border-white/30 rounded-xl focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500 outline-none transition-all"
                        />
                      </div>
                    )}

                    {/* Points-based voting */}
                    <div>
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={usePoints}
                          onChange={(e) => {
                            setUsePoints(e.target.checked);
                            if (e.target.checked && !pointsPerVoter) {
                              setPointsPerVoter(10);
                            }
                          }}
                          className="w-5 h-5 rounded border-2 border-purple-400 text-purple-600 focus:ring-purple-500"
                        />
                        <div>
                          <span className="font-semibold text-gray-700">Use Points Allocation</span>
                          <p className="text-xs text-gray-500">Let voters distribute points across names</p>
                        </div>
                      </label>
                    </div>

                    {usePoints && (
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          <Zap className="inline w-4 h-4 mr-1" />
                          Points Per Voter
                        </label>
                        <input
                          type="number"
                          min={1}
                          max={100}
                          value={pointsPerVoter}
                          onChange={(e) => setPointsPerVoter(parseInt(e.target.value) || 10)}
                          className="w-full px-4 py-3 bg-white/40 backdrop-blur-sm border-2 border-white/30 rounded-xl focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500 outline-none transition-all"
                        />
                      </div>
                    )}

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
                        <div className="text-lg font-bold text-gray-800">{title}</div>
                      </div>

                      {description && (
                        <div className="p-4 bg-purple-50/50 rounded-lg">
                          <div className="text-sm font-semibold text-purple-700 mb-1">Description</div>
                          <div className="text-gray-700">{description}</div>
                        </div>
                      )}

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
                          <li>• Vote Type: <strong>{voteType === 'single' ? 'Single Choice' : 'Multiple Choice'}</strong></li>
                          {voteType === 'multiple' && <li>• Max Votes: <strong>{maxVotes}</strong></li>}
                          {usePoints && <li>• Points Per Voter: <strong>{pointsPerVoter}</strong></li>}
                          {expiresAt && <li>• Expires: <strong>{expiresAt.toLocaleDateString()}</strong></li>}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </GlassCard>
        </ScrollReveal3D>

        {/* Navigation Buttons */}
        <ScrollReveal3D index={3}>
          <div className="flex justify-between mt-6">
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
                (currentStep === 0 && !title) ||
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
        </ScrollReveal3D>
      </div>
    </div>
  );
}
