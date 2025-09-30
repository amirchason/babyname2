import React, { useState, useEffect } from 'react';
import { Play, Pause, RefreshCw, CheckCircle, AlertCircle, Loader } from 'lucide-react';
import meaningService from '../services/meaningService';
import { ProcessingStatus } from '../agents/MeaningScraperAgent';

interface MeaningProcessorProps {
  hideByDefault?: boolean;
}

const MeaningProcessor: React.FC<MeaningProcessorProps> = ({ hideByDefault = true }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [status, setStatus] = useState<ProcessingStatus | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isVisible, setIsVisible] = useState(!hideByDefault);

  useEffect(() => {
    // Check initial status
    const currentStatus = meaningService.getStatus();
    setStatus(currentStatus);
    setIsProcessing(currentStatus.isProcessing);

    // Update status every second when processing
    const interval = setInterval(() => {
      const newStatus = meaningService.getStatus();
      setStatus(newStatus);
      setIsProcessing(newStatus.isProcessing);
    }, 1000);

    // Add keyboard shortcut (Ctrl+M) to toggle visibility
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === 'm') {
        e.preventDefault();
        setIsVisible(prev => !prev);
        if (!isVisible) setIsExpanded(true);
      }
    };

    window.addEventListener('keydown', handleKeyPress);

    return () => {
      clearInterval(interval);
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [isVisible]);

  const handleStart = async () => {
    setIsProcessing(true);
    setIsExpanded(true);
    await meaningService.startProcessing(100);
    setIsProcessing(false);
  };

  const handleStop = () => {
    meaningService.stopProcessing();
    setIsProcessing(false);
  };

  const handleClear = () => {
    if (window.confirm('Clear all processed meanings? This cannot be undone.')) {
      meaningService.clearMeanings();
      window.location.reload();
    }
  };

  if (!status || !isVisible) return null;

  const progressPercent = status.totalCount > 0
    ? Math.round((status.processedCount / Math.min(100, status.totalCount)) * 100)
    : 0;

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* Collapsed View */}
      {!isExpanded && (
        <button
          onClick={() => setIsExpanded(true)}
          className="bg-white rounded-full shadow-lg px-4 py-3 flex items-center gap-2 hover:shadow-xl transition-all"
        >
          <div className="relative">
            {isProcessing ? (
              <Loader className="w-5 h-5 text-purple-600 animate-spin" />
            ) : status.processedCount > 0 ? (
              <CheckCircle className="w-5 h-5 text-green-600" />
            ) : (
              <Play className="w-5 h-5 text-purple-600" />
            )}
          </div>
          <span className="text-sm font-medium text-gray-700">
            Meanings: {status.processedCount}/100
          </span>
        </button>
      )}

      {/* Expanded View */}
      {isExpanded && (
        <div className="bg-white rounded-2xl shadow-2xl p-6 w-96 border border-purple-100">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-lg font-bold text-gray-800">Meaning Processor</h3>
              <p className="text-sm text-gray-500">Processing name meanings</p>
            </div>
            <button
              onClick={() => setIsExpanded(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>

          {/* Progress Bar */}
          <div className="mb-4">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Progress</span>
              <span>{progressPercent}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-500 rounded-full"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3 mb-4">
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {status.processedCount}
              </div>
              <div className="text-xs text-gray-600">Completed</div>
            </div>
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {Math.min(100, status.unprocessedCount)}
              </div>
              <div className="text-xs text-gray-600">Remaining</div>
            </div>
            <div className="text-center p-3 bg-red-50 rounded-lg">
              <div className="text-2xl font-bold text-red-600">
                {status.errorCount}
              </div>
              <div className="text-xs text-gray-600">Errors</div>
            </div>
          </div>

          {/* Current Processing */}
          {isProcessing && status.currentName && (
            <div className="mb-4 p-3 bg-purple-50 rounded-lg">
              <div className="flex items-center gap-2">
                <Loader className="w-4 h-4 text-purple-600 animate-spin" />
                <span className="text-sm text-gray-700">
                  Processing: <strong>{status.currentName}</strong>
                </span>
              </div>
            </div>
          )}

          {/* Status Message */}
          {status.message && (
            <div className="mb-4 p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-600">{status.message}</span>
              </div>
            </div>
          )}

          {/* Control Buttons */}
          <div className="flex gap-2">
            {!isProcessing ? (
              <>
                <button
                  onClick={handleStart}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-medium hover:shadow-lg transition-all flex items-center justify-center gap-2"
                  disabled={status.unprocessedCount === 0}
                >
                  <Play className="w-4 h-4" />
                  Start Processing
                </button>
                <button
                  onClick={handleClear}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all"
                  title="Clear all meanings"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              </>
            ) : (
              <button
                onClick={handleStop}
                className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition-all flex items-center justify-center gap-2"
              >
                <Pause className="w-4 h-4" />
                Stop Processing
              </button>
            )}
          </div>

          {/* Info */}
          <div className="mt-4 text-xs text-gray-500 text-center">
            Processing 2 names per second • Top 100 names only
          </div>
        </div>
      )}
    </div>
  );
};

export default MeaningProcessor;