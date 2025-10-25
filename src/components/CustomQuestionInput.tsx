import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Edit3, AlertCircle, CheckCircle, Sparkles } from 'lucide-react';

interface CustomQuestionInputProps {
  value: string;
  onChange: (value: string) => void;
  maxLength?: number;
  placeholder?: string;
  disabled?: boolean;
}

const CustomQuestionInput: React.FC<CustomQuestionInputProps> = ({
  value,
  onChange,
  maxLength = 200,
  placeholder = 'Write your own voting question...',
  disabled = false
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [placeholderIndex, setPlaceholderIndex] = useState(0);

  // Typewriter effect for placeholder
  const placeholderExamples = [
    'Which name makes your heart skip a beat?',
    'Which one feels like "the one"?',
    'Help us pick our favorite!',
    'Which name do you absolutely love?'
  ];

  useEffect(() => {
    if (isExpanded && !value) {
      const interval = setInterval(() => {
        setPlaceholderIndex((prev) => (prev + 1) % placeholderExamples.length);
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [isExpanded, value]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [value]);

  const handleToggle = () => {
    setIsExpanded(!isExpanded);
    if (!isExpanded) {
      setTimeout(() => textareaRef.current?.focus(), 100);
    }
  };

  const characterCount = value.length;
  const remainingChars = maxLength - characterCount;
  const percentUsed = (characterCount / maxLength) * 100;

  // Character counter color states
  const getCounterColor = () => {
    if (characterCount === 0) return 'text-gray-400';
    if (remainingChars === 0) return 'text-red-600';
    if (remainingChars <= 20) return 'text-yellow-600';
    if (characterCount >= 100 && characterCount <= 150) return 'text-green-600';
    return 'text-blue-600';
  };

  const getCounterIcon = () => {
    if (remainingChars === 0) return <AlertCircle className="w-4 h-4" />;
    if (characterCount >= 100 && characterCount <= 150) return <CheckCircle className="w-4 h-4" />;
    return null;
  };

  // Confetti animation for sweet spot
  const isInSweetSpot = characterCount >= 100 && characterCount <= 150;

  return (
    <div className="space-y-4">
      {/* Toggle Button */}
      <AnimatePresence mode="wait">
        {!isExpanded ? (
          <motion.button
            key="toggle-button"
            type="button"
            onClick={handleToggle}
            disabled={disabled}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`
              w-full px-6 py-4 rounded-2xl
              bg-gradient-to-r from-purple-100 via-pink-100 to-blue-100
              border-2 border-dashed border-purple-300
              transition-all duration-300
              ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:border-purple-500 hover:shadow-lg cursor-pointer'}
            `}
          >
            <div className="flex items-center justify-center space-x-3">
              <Edit3 className="w-5 h-5 text-purple-600" />
              <span className="text-lg font-semibold text-purple-700">
                Or write your own custom question
              </span>
              <Sparkles className="w-5 h-5 text-purple-600" />
            </div>
          </motion.button>
        ) : (
          <motion.div
            key="textarea-container"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.4, ease: 'easeInOut' }}
            className="relative"
          >
            {/* Pulsing glow effect */}
            <AnimatePresence>
              {isFocused && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 blur-lg"
                  style={{
                    animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
                  }}
                />
              )}
            </AnimatePresence>

            {/* Textarea */}
            <div className="relative">
              <textarea
                ref={textareaRef}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                disabled={disabled}
                maxLength={maxLength}
                placeholder={placeholderExamples[placeholderIndex]}
                className={`
                  relative w-full px-6 py-4 rounded-2xl
                  bg-white/95 backdrop-blur-md
                  border-2 transition-all duration-300
                  resize-none overflow-hidden
                  text-lg font-medium text-gray-800
                  placeholder:text-gray-400 placeholder:italic
                  focus:outline-none
                  ${isFocused ? 'border-purple-400 shadow-2xl' : 'border-purple-200'}
                  ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
                  min-h-[100px]
                `}
                rows={3}
              />

              {/* Character Counter */}
              <motion.div
                className={`
                  absolute bottom-3 right-3 flex items-center space-x-2
                  px-3 py-1 rounded-full
                  bg-white/90 backdrop-blur-sm shadow-md
                  ${getCounterColor()}
                  font-semibold text-sm
                `}
                animate={
                  remainingChars === 0
                    ? { scale: [1, 1.1, 1], x: [-2, 2, -2, 2, 0] }
                    : {}
                }
                transition={{
                  duration: 0.5,
                  repeat: remainingChars === 0 ? Infinity : 0,
                  repeatDelay: 1
                }}
              >
                {getCounterIcon()}
                <span>{characterCount}/{maxLength}</span>
              </motion.div>

              {/* Progress Bar */}
              <div className="mt-2 px-1">
                <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <motion.div
                    className={`
                      h-full rounded-full
                      ${remainingChars === 0 ? 'bg-red-500' : ''}
                      ${remainingChars > 0 && remainingChars <= 20 ? 'bg-yellow-500' : ''}
                      ${remainingChars > 20 && !isInSweetSpot ? 'bg-blue-500' : ''}
                      ${isInSweetSpot ? 'bg-green-500' : ''}
                    `}
                    initial={{ width: 0 }}
                    animate={{ width: `${percentUsed}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
              </div>

              {/* Sweet spot confetti */}
              <AnimatePresence>
                {isInSweetSpot && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute -top-8 right-4 flex items-center space-x-2 bg-green-500 text-white px-3 py-1 rounded-full shadow-lg text-sm font-medium"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>Perfect length!</span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Warning message */}
              <AnimatePresence>
                {remainingChars <= 20 && remainingChars > 0 && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="mt-2 text-sm text-yellow-600 flex items-center space-x-2"
                  >
                    <AlertCircle className="w-4 h-4" />
                    <span>{remainingChars} character{remainingChars !== 1 ? 's' : ''} remaining</span>
                  </motion.p>
                )}
                {remainingChars === 0 && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="mt-2 text-sm text-red-600 flex items-center space-x-2 font-semibold"
                  >
                    <AlertCircle className="w-4 h-4" />
                    <span>Maximum length reached!</span>
                  </motion.p>
                )}
              </AnimatePresence>
            </div>

            {/* Collapse button */}
            <motion.button
              type="button"
              onClick={handleToggle}
              className="mt-3 text-sm text-purple-600 hover:text-purple-800 font-medium transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              ← Back to preset questions
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CustomQuestionInput;
