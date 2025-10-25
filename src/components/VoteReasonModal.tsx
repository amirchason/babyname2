import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, ArrowRight, Sparkles } from 'lucide-react';
import { VOTING_REASONS, VotingReason, CUSTOM_REASON_PLACEHOLDER } from '../constants/votingReasons';

interface VoteReasonModalProps {
  isOpen: boolean;
  nameName: string;
  onSubmit: (reason?: string, reasonType?: 'preset' | 'custom') => void;
  onClose: () => void;
}

const VoteReasonModal: React.FC<VoteReasonModalProps> = ({
  isOpen,
  nameName,
  onSubmit,
  onClose
}) => {
  const [selectedReason, setSelectedReason] = useState<VotingReason | null>(null);
  const [customReason, setCustomReason] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);

  const handleSubmit = () => {
    if (customReason.trim()) {
      onSubmit(customReason.trim(), 'custom');
    } else if (selectedReason) {
      onSubmit(selectedReason.text, 'preset');
    } else {
      onSubmit(); // Skip - no reason
    }
    handleClose();
  };

  const handleSkip = () => {
    onSubmit(); // No reason
    handleClose();
  };

  const handleClose = () => {
    setSelectedReason(null);
    setCustomReason('');
    setShowCustomInput(false);
    onClose();
  };

  const handleReasonSelect = (reason: VotingReason) => {
    setSelectedReason(reason);
    setCustomReason('');
    setShowCustomInput(false);
  };

  const handleCustomClick = () => {
    setShowCustomInput(true);
    setSelectedReason(null);
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
            onClick={handleClose}
            className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
          >
            {/* Modal */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[85vh] overflow-hidden flex flex-col"
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 px-6 py-5 flex items-center justify-between flex-shrink-0">
                <div className="flex items-center space-x-3">
                  <Sparkles className="w-6 h-6 text-white" />
                  <h2 className="text-2xl font-bold text-white">
                    Why do you love <span className="underline">{nameName}</span>?
                  </h2>
                </div>
                <button
                  onClick={handleClose}
                  className="text-white hover:bg-white/20 p-2 rounded-full transition"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Content - Scrollable */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {/* Instructions */}
                <p className="text-gray-600 text-center mb-4">
                  Pick a reason below or write your own! (Optional - you can skip)
                </p>

                {/* Preset Reasons Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {VOTING_REASONS.map((reason, index) => (
                    <motion.button
                      key={reason.id}
                      onClick={() => handleReasonSelect(reason)}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={`
                        p-4 rounded-xl text-left transition-all duration-200
                        border-2 relative overflow-hidden
                        ${selectedReason?.id === reason.id
                          ? 'border-purple-500 bg-purple-100 shadow-lg'
                          : 'border-gray-200 bg-white hover:border-purple-300 hover:shadow-md'
                        }
                      `}
                    >
                      {/* Gradient overlay when selected */}
                      {selectedReason?.id === reason.id && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="absolute inset-0 bg-gradient-to-br from-purple-100 to-pink-100 -z-10"
                        />
                      )}

                      <div className="flex items-start space-x-3 relative z-10">
                        <motion.span
                          className="text-3xl flex-shrink-0"
                          animate={selectedReason?.id === reason.id ? {
                            scale: [1, 1.2, 1],
                            rotate: [0, 10, -10, 0]
                          } : {}}
                          transition={{ duration: 0.5 }}
                        >
                          {reason.emoji}
                        </motion.span>
                        <div className="flex-1">
                          <p className="font-semibold text-gray-800 leading-tight">
                            {reason.text}
                          </p>
                          <span className={`
                            inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-medium
                            ${reason.tone === 'heartfelt' ? 'bg-pink-100 text-pink-700' : ''}
                            ${reason.tone === 'funny' ? 'bg-yellow-100 text-yellow-700' : ''}
                            ${reason.tone === 'practical' ? 'bg-blue-100 text-blue-700' : ''}
                            ${reason.tone === 'romantic' ? 'bg-purple-100 text-purple-700' : ''}
                            ${reason.tone === 'thoughtful' ? 'bg-green-100 text-green-700' : ''}
                          `}>
                            {reason.tone}
                          </span>
                        </div>
                      </div>
                    </motion.button>
                  ))}
                </div>

                {/* OR Divider */}
                <div className="flex items-center my-6">
                  <div className="flex-1 border-t-2 border-gray-200"></div>
                  <span className="px-4 text-gray-500 font-medium">OR</span>
                  <div className="flex-1 border-t-2 border-gray-200"></div>
                </div>

                {/* Custom Reason Input */}
                <AnimatePresence mode="wait">
                  {!showCustomInput ? (
                    <motion.button
                      key="custom-button"
                      onClick={handleCustomClick}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full px-6 py-4 rounded-xl bg-gradient-to-r from-purple-100 via-pink-100 to-blue-100 border-2 border-dashed border-purple-300 hover:border-purple-500 transition-all"
                    >
                      <div className="flex items-center justify-center space-x-2">
                        <Sparkles className="w-5 h-5 text-purple-600" />
                        <span className="font-semibold text-purple-700">
                          Write your own reason
                        </span>
                        <ArrowRight className="w-5 h-5 text-purple-600" />
                      </div>
                    </motion.button>
                  ) : (
                    <motion.div
                      key="custom-input"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="space-y-2"
                    >
                      <textarea
                        value={customReason}
                        onChange={(e) => setCustomReason(e.target.value)}
                        placeholder={CUSTOM_REASON_PLACEHOLDER}
                        maxLength={200}
                        rows={3}
                        autoFocus
                        className="w-full px-4 py-3 rounded-xl border-2 border-purple-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none resize-none text-gray-800 placeholder:text-gray-400"
                      />
                      <div className="flex items-center justify-between text-sm">
                        <button
                          onClick={() => {
                            setShowCustomInput(false);
                            setCustomReason('');
                          }}
                          className="text-purple-600 hover:text-purple-800 font-medium"
                        >
                          ← Back to presets
                        </button>
                        <span className={`
                          font-medium
                          ${customReason.length > 180 ? 'text-red-600' : 'text-gray-500'}
                        `}>
                          {customReason.length}/200
                        </span>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Footer - Sticky */}
              <div className="border-t border-gray-200 p-6 bg-gray-50 flex-shrink-0">
                <div className="flex gap-3">
                  <button
                    onClick={handleSkip}
                    className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-100 transition"
                  >
                    Skip
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={!selectedReason && !customReason.trim()}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-xl hover:shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    <Send className="w-5 h-5" />
                    Submit Vote
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default VoteReasonModal;
