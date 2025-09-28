import React, { useState } from 'react';
import { X, Heart, Baby, Users, Sparkles, ArrowRight } from 'lucide-react';

interface SwipingQuestionnaireProps {
  onClose: () => void;
  onComplete: (filters: {
    gender: 'all' | 'male' | 'female';
  }) => void;
}

type QuestionStep = 'gender' | 'complete';

const SwipingQuestionnaire: React.FC<SwipingQuestionnaireProps> = ({
  onClose,
  onComplete
}) => {
  const [currentStep, setCurrentStep] = useState<QuestionStep>('gender');
  const [selectedGender, setSelectedGender] = useState<'all' | 'male' | 'female'>('all');

  const handleGenderSelect = (gender: 'all' | 'male' | 'female') => {
    setSelectedGender(gender);
    // Small delay to show selection before proceeding
    setTimeout(() => {
      setCurrentStep('complete');
    }, 300);
  };

  const handleComplete = () => {
    onComplete({
      gender: selectedGender
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-gradient-to-br from-purple-900 via-pink-900 to-red-900">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000" />
        <div className="absolute top-40 left-1/2 w-80 h-80 bg-red-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000" />
      </div>

      {/* Close Button */}
      <button
        onClick={onClose}
        className="absolute top-8 right-8 z-60 p-3 bg-white/20 backdrop-blur-md rounded-full text-white hover:bg-white/30 transition-all"
      >
        <X className="w-6 h-6" />
      </button>

      {/* Content */}
      <div className="relative z-10 flex items-center justify-center min-h-screen p-8">
        <div className="max-w-2xl w-full text-center">

          {currentStep === 'gender' && (
            <div className="animate-fadeIn">
              {/* Question Header */}
              <div className="mb-12">
                <div className="flex justify-center mb-6">
                  <div className="w-20 h-20 bg-gradient-to-r from-pink-400 to-red-400 rounded-full flex items-center justify-center animate-pulse">
                    <Baby className="w-10 h-10 text-white" />
                  </div>
                </div>
                <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                  What are you looking for?
                </h1>
                <p className="text-xl text-white/80 mb-8">
                  Let's find the perfect name for your little one ✨
                </p>
              </div>

              {/* Gender Options */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {/* Boy Option */}
                <button
                  onClick={() => handleGenderSelect('male')}
                  className={`group relative p-8 rounded-3xl backdrop-blur-md border-2 transition-all duration-300 transform hover:scale-105 ${
                    selectedGender === 'male'
                      ? 'bg-blue-500/30 border-blue-300 shadow-lg shadow-blue-500/25'
                      : 'bg-white/10 border-white/20 hover:bg-blue-500/20 hover:border-blue-300'
                  }`}
                >
                  <div className="text-6xl mb-4">👶</div>
                  <h3 className="text-2xl font-bold text-white mb-2">Boy</h3>
                  <p className="text-white/70">Strong and meaningful names for your little prince</p>

                  {selectedGender === 'male' && (
                    <div className="absolute inset-0 rounded-3xl bg-blue-400/20 animate-pulse"></div>
                  )}
                </button>

                {/* Girl Option */}
                <button
                  onClick={() => handleGenderSelect('female')}
                  className={`group relative p-8 rounded-3xl backdrop-blur-md border-2 transition-all duration-300 transform hover:scale-105 ${
                    selectedGender === 'female'
                      ? 'bg-pink-500/30 border-pink-300 shadow-lg shadow-pink-500/25'
                      : 'bg-white/10 border-white/20 hover:bg-pink-500/20 hover:border-pink-300'
                  }`}
                >
                  <div className="text-6xl mb-4">👧</div>
                  <h3 className="text-2xl font-bold text-white mb-2">Girl</h3>
                  <p className="text-white/70">Beautiful and elegant names for your little princess</p>

                  {selectedGender === 'female' && (
                    <div className="absolute inset-0 rounded-3xl bg-pink-400/20 animate-pulse"></div>
                  )}
                </button>

                {/* I Don't Know Option */}
                <button
                  onClick={() => handleGenderSelect('all')}
                  className={`group relative p-8 rounded-3xl backdrop-blur-md border-2 transition-all duration-300 transform hover:scale-105 ${
                    selectedGender === 'all'
                      ? 'bg-purple-500/30 border-purple-300 shadow-lg shadow-purple-500/25'
                      : 'bg-white/10 border-white/20 hover:bg-purple-500/20 hover:border-purple-300'
                  }`}
                >
                  <div className="text-6xl mb-4">🤷‍♀️</div>
                  <h3 className="text-2xl font-bold text-white mb-2">I Don't Know</h3>
                  <p className="text-white/70">Explore all beautiful names and get surprised!</p>

                  {selectedGender === 'all' && (
                    <div className="absolute inset-0 rounded-3xl bg-purple-400/20 animate-pulse"></div>
                  )}
                </button>
              </div>

              {/* Progress Indicator */}
              <div className="flex justify-center items-center space-x-2">
                <div className="w-3 h-3 bg-white rounded-full"></div>
                <div className="w-8 h-1 bg-white/30 rounded-full"></div>
                <div className="w-3 h-3 bg-white/30 rounded-full"></div>
              </div>
            </div>
          )}

          {currentStep === 'complete' && (
            <div className="animate-fadeIn">
              {/* Completion Screen */}
              <div className="mb-12">
                <div className="flex justify-center mb-6">
                  <div className="w-24 h-24 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center animate-bounce">
                    <Sparkles className="w-12 h-12 text-white" />
                  </div>
                </div>
                <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                  Perfect! Let's Start Swiping! 🎉
                </h1>
                <p className="text-xl text-white/80 mb-8">
                  We've curated the perfect names based on your preferences
                </p>
              </div>

              {/* Summary */}
              <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 mb-8 border border-white/20">
                <h3 className="text-2xl font-bold text-white mb-4">Your Preferences:</h3>
                <div className="flex justify-center">
                  <span className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full text-white font-bold">
                    {selectedGender === 'male' && (
                      <>
                        <span>👶</span>
                        <span>Boy Names</span>
                      </>
                    )}
                    {selectedGender === 'female' && (
                      <>
                        <span>👧</span>
                        <span>Girl Names</span>
                      </>
                    )}
                    {selectedGender === 'all' && (
                      <>
                        <span>✨</span>
                        <span>All Names</span>
                      </>
                    )}
                  </span>
                </div>
              </div>

              {/* Start Button */}
              <button
                onClick={handleComplete}
                className="group relative px-12 py-6 bg-gradient-to-r from-green-500 via-blue-500 to-purple-600
                         text-white rounded-full text-2xl font-bold shadow-2xl hover:shadow-blue-300/50
                         transform hover:scale-105 transition-all duration-300 border-4 border-white/20
                         hover:border-white/40"
              >
                <div className="flex items-center gap-4">
                  <Heart className="w-8 h-8 animate-pulse" fill="currentColor" />
                  <span className="text-white drop-shadow-lg">Start Swiping Now!</span>
                  <ArrowRight className="w-8 h-8 animate-bounce" />
                </div>

                {/* Glow effect */}
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-green-400 via-blue-400 to-purple-400 opacity-30 blur-xl group-hover:opacity-50 transition-opacity duration-300"></div>
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default SwipingQuestionnaire;