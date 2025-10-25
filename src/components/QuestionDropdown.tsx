import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Check, Sparkles } from 'lucide-react';
import { VOTING_QUESTIONS, VotingQuestion } from '../constants/votingQuestions';

interface QuestionDropdownProps {
  selectedQuestion: VotingQuestion | null;
  onSelect: (question: VotingQuestion) => void;
  disabled?: boolean;
}

const QuestionDropdown: React.FC<QuestionDropdownProps> = ({
  selectedQuestion,
  onSelect,
  disabled = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Filter questions by search term
  const filteredQuestions = VOTING_QUESTIONS.filter(q =>
    q.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
    q.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelect = (question: VotingQuestion) => {
    onSelect(question);
    setIsOpen(false);
    setSearchTerm('');
  };

  const handleKeyDown = (e: React.KeyboardEvent, question?: VotingQuestion) => {
    if (e.key === 'Enter' && question) {
      handleSelect(question);
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Dropdown Button */}
      <motion.button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`
          w-full px-6 py-4 rounded-2xl text-left
          bg-white/80 backdrop-blur-md
          border-2 border-purple-200
          transition-all duration-300
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:border-purple-400 hover:shadow-lg cursor-pointer'}
          ${isOpen ? 'border-purple-400 shadow-lg' : ''}
        `}
        whileHover={!disabled ? { scale: 1.02 } : {}}
        whileTap={!disabled ? { scale: 0.98 } : {}}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3 flex-1">
            {selectedQuestion ? (
              <>
                <motion.span
                  className="text-3xl"
                  animate={{
                    scale: [1, 1.2, 1],
                    rotate: [0, 10, -10, 0]
                  }}
                  transition={{ duration: 0.5 }}
                >
                  {selectedQuestion.emoji}
                </motion.span>
                <div className="flex-1">
                  <p className="text-lg font-semibold text-gray-800 leading-tight">
                    {selectedQuestion.text}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    {selectedQuestion.description}
                  </p>
                </div>
              </>
            ) : (
              <>
                <Sparkles className="w-6 h-6 text-purple-400" />
                <div className="flex-1">
                  <p className="text-lg font-semibold text-gray-700">
                    Choose a voting question...
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    Pick from 8 witty options or write your own
                  </p>
                </div>
              </>
            )}
          </div>
          <motion.div
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.3 }}
          >
            <ChevronDown className="w-6 h-6 text-gray-600" />
          </motion.div>
        </div>
      </motion.button>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute z-50 w-full mt-2 rounded-2xl overflow-hidden shadow-2xl"
          >
            {/* Frosted glass container */}
            <div className="bg-white/95 backdrop-blur-xl border-2 border-purple-200">
              {/* Search bar */}
              <div className="p-4 border-b border-purple-100">
                <input
                  type="text"
                  placeholder="Search questions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border-2 border-purple-200 focus:border-purple-400 focus:outline-none transition-colors"
                  autoFocus
                />
              </div>

              {/* Questions list */}
              <div className="max-h-96 overflow-y-auto">
                {filteredQuestions.length === 0 ? (
                  <div className="p-6 text-center text-gray-500">
                    No questions found
                  </div>
                ) : (
                  filteredQuestions.map((question, index) => (
                    <motion.div
                      key={question.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <button
                        type="button"
                        onClick={() => handleSelect(question)}
                        onKeyDown={(e) => handleKeyDown(e, question)}
                        className={`
                          w-full px-6 py-4 text-left
                          transition-all duration-200
                          hover:bg-purple-50
                          ${selectedQuestion?.id === question.id ? 'bg-purple-100' : ''}
                          ${index !== 0 ? 'border-t border-purple-100' : ''}
                        `}
                      >
                        <div className="flex items-start space-x-4">
                          {/* Emoji */}
                          <motion.span
                            className="text-3xl flex-shrink-0"
                            whileHover={{
                              scale: 1.3,
                              rotate: [0, -10, 10, -10, 0]
                            }}
                            transition={{ duration: 0.5 }}
                          >
                            {question.emoji}
                          </motion.span>

                          {/* Text */}
                          <div className="flex-1 min-w-0">
                            <p className="text-base font-semibold text-gray-800 leading-tight">
                              {question.text}
                            </p>
                            <p className="text-sm text-gray-600 mt-1">
                              {question.description}
                            </p>
                            {/* Tone badge */}
                            <span
                              className={`
                                inline-block mt-2 px-2 py-1 rounded-full text-xs font-medium
                                ${question.tone === 'heartwarming' ? 'bg-pink-100 text-pink-700' : ''}
                                ${question.tone === 'funny' ? 'bg-yellow-100 text-yellow-700' : ''}
                                ${question.tone === 'thoughtful' ? 'bg-blue-100 text-blue-700' : ''}
                                ${question.tone === 'playful' ? 'bg-purple-100 text-purple-700' : ''}
                                ${question.tone === 'zen' ? 'bg-green-100 text-green-700' : ''}
                              `}
                            >
                              {question.tone}
                            </span>
                          </div>

                          {/* Checkmark */}
                          <AnimatePresence>
                            {selectedQuestion?.id === question.id && (
                              <motion.div
                                initial={{ scale: 0, rotate: -180 }}
                                animate={{ scale: 1, rotate: 0 }}
                                exit={{ scale: 0, rotate: 180 }}
                                transition={{
                                  type: 'spring',
                                  stiffness: 300,
                                  damping: 30
                                }}
                                className="flex-shrink-0"
                              >
                                <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center">
                                  <Check className="w-5 h-5 text-white" />
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>

                        {/* Ripple effect on click */}
                        <motion.div
                          className="absolute inset-0 pointer-events-none"
                          initial={{ scale: 0, opacity: 0.5 }}
                          whileTap={{
                            scale: 2,
                            opacity: 0,
                            transition: { duration: 0.6 }
                          }}
                        >
                          <div className="w-full h-full bg-purple-400 rounded-full" />
                        </motion.div>
                      </button>
                    </motion.div>
                  ))
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default QuestionDropdown;
