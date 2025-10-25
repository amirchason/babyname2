import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Edit3 } from 'lucide-react';
import { VOTE_TITLES, VoteTitle } from '../constants/voteTitlesDescriptions';

interface TitleDropdownProps {
  selectedTitle: VoteTitle | null;
  customTitle: string;
  onSelectPreset: (title: VoteTitle) => void;
  onCustomChange: (value: string) => void;
  disabled?: boolean;
}

const TitleDropdown: React.FC<TitleDropdownProps> = ({
  selectedTitle,
  customTitle,
  onSelectPreset,
  onCustomChange,
  disabled = false
}) => {
  const [showCustomInput, setShowCustomInput] = useState(false);

  const handleSelectPreset = (title: VoteTitle) => {
    onSelectPreset(title);
    setShowCustomInput(false);
  };

  const handleCustomClick = () => {
    setShowCustomInput(true);
  };

  // Tone colors with high contrast text
  const getToneColors = (tone: string, isSelected: boolean) => {
    const colors = {
      heartwarming: isSelected ? 'bg-pink-400 text-white' : 'bg-pink-50 text-pink-900 hover:bg-pink-100',
      funny: isSelected ? 'bg-amber-400 text-gray-900' : 'bg-amber-50 text-amber-900 hover:bg-amber-100',
      thoughtful: isSelected ? 'bg-blue-500 text-white' : 'bg-blue-50 text-blue-900 hover:bg-blue-100',
      playful: isSelected ? 'bg-purple-500 text-white' : 'bg-purple-50 text-purple-900 hover:bg-purple-100',
      excited: isSelected ? 'bg-orange-500 text-white' : 'bg-orange-50 text-orange-900 hover:bg-orange-100',
      sweet: isSelected ? 'bg-rose-400 text-white' : 'bg-rose-50 text-rose-900 hover:bg-rose-100',
    };
    return colors[tone as keyof typeof colors] || colors.playful;
  };

  return (
    <div className="space-y-4">
      <label className="block text-sm font-semibold text-gray-800">
        Vote Title <span className="text-rose-500">*</span>
      </label>

      {/* Grid of title cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {VOTE_TITLES.map((title) => {
          const isSelected = selectedTitle?.id === title.id && !customTitle;
          return (
            <motion.button
              key={title.id}
              type="button"
              onClick={() => !disabled && handleSelectPreset(title)}
              disabled={disabled}
              className={`
                relative p-4 rounded-2xl text-left
                transition-all duration-200
                ${getToneColors(title.tone, isSelected)}
                ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer active:scale-95'}
                ${isSelected ? 'ring-4 ring-offset-2 ring-purple-300 shadow-lg' : 'shadow-sm hover:shadow-md'}
              `}
              whileHover={!disabled ? { y: -2 } : {}}
              whileTap={!disabled ? { scale: 0.98 } : {}}
            >
              <div className="flex items-start gap-3">
                <span className="text-3xl flex-shrink-0">{title.emoji}</span>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-bold leading-snug ${isSelected ? 'opacity-100' : 'opacity-90'}`}>
                    {title.text}
                  </p>
                </div>
                {isSelected && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="flex-shrink-0"
                  >
                    <div className="w-6 h-6 rounded-full bg-white/30 backdrop-blur-sm flex items-center justify-center">
                      <Check className="w-4 h-4" />
                    </div>
                  </motion.div>
                )}
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* Custom title button */}
      <motion.button
        type="button"
        onClick={handleCustomClick}
        disabled={disabled}
        className="w-full p-4 rounded-2xl bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-dashed border-purple-300 hover:border-purple-500 hover:from-purple-100 hover:to-pink-100 transition-all flex items-center justify-center gap-2 shadow-sm hover:shadow-md active:scale-95"
        whileHover={{ y: -2 }}
        whileTap={{ scale: 0.98 }}
      >
        <Edit3 className="w-5 h-5 text-purple-700" />
        <span className="font-bold text-purple-700">
          Write your own
        </span>
      </motion.button>

      {/* Custom Title Input */}
      <AnimatePresence>
        {showCustomInput && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-3"
          >
            <div className="relative">
              <input
                type="text"
                value={customTitle}
                onChange={(e) => onCustomChange(e.target.value)}
                placeholder="Enter your custom title..."
                maxLength={100}
                autoFocus
                className="w-full px-4 py-4 rounded-2xl border-2 border-purple-300 focus:border-purple-500 focus:ring-4 focus:ring-purple-100 focus:outline-none transition-all text-gray-900 font-medium bg-white shadow-sm"
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-medium text-gray-400">
                {customTitle.length}/100
              </div>
            </div>
            <button
              type="button"
              onClick={() => setShowCustomInput(false)}
              className="text-sm text-purple-700 hover:text-purple-900 font-semibold"
            >
              ← Back to presets
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TitleDropdown;
