/**
 * Enrichment Processor - Background UI for name enrichment with Claude AI
 * Shows progress and stats for the enrichment process
 */

import React, { useState, useEffect } from 'react';
import { Brain, Play, Pause, RefreshCw, X, Globe, BookOpen, Sparkles, ChevronDown, ChevronUp } from 'lucide-react';
import enrichmentService from '../services/enrichmentService';
import { STANDARD_ORIGINS } from '../services/claudeApiService';

const EnrichmentProcessor: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isMinimized, setIsMinimized] = useState(true);
  const [status, setStatus] = useState<any>({});
  const [stats, setStats] = useState<any>({});
  const [originDistribution, setOriginDistribution] = useState<Record<string, number>>({});

  useEffect(() => {
    // Check for Ctrl+E to toggle visibility
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === 'e') {
        e.preventDefault();
        setIsVisible(v => !v);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  useEffect(() => {
    // Update status every second
    const interval = setInterval(() => {
      const currentStatus = enrichmentService.getStatus();
      const currentStats = enrichmentService.getStatistics();
      const distribution = enrichmentService.getOriginDistribution();

      setStatus(currentStatus);
      setStats(currentStats);
      setOriginDistribution(distribution);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleStart = () => {
    enrichmentService.startProcessing(50);
  };

  const handleStop = () => {
    enrichmentService.stopProcessing();
  };

  const handleClear = () => {
    if (window.confirm('Clear all enrichment data? This cannot be undone.')) {
      enrichmentService.clearEnrichmentData();
    }
  };

  if (!isVisible) return null;

  const topOrigins = Object.entries(originDistribution)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className={`bg-white rounded-lg shadow-2xl border border-purple-200 ${
        isMinimized ? 'w-80' : 'w-96'
      } transition-all duration-300`}>
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-3 rounded-t-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Brain className="w-5 h-5" />
              <span className="font-semibold">AI Name Enrichment</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="p-1 hover:bg-white/20 rounded transition-colors"
              >
                {isMinimized ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
              <button
                onClick={() => setIsVisible(false)}
                className="p-1 hover:bg-white/20 rounded transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          {/* Status */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">
                {status.isProcessing ? (
                  <span className="flex items-center gap-2">
                    <RefreshCw className="w-4 h-4 animate-spin text-purple-600" />
                    Processing: {status.currentName}
                  </span>
                ) : (
                  <span className="text-gray-500">Idle</span>
                )}
              </span>
              <span className="text-sm font-bold text-purple-600">
                {status.progressPercentage || 0}%
              </span>
            </div>

            {/* Progress Bar */}
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 transition-all duration-500"
                style={{ width: `${status.progressPercentage || 0}%` }}
              />
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-2 mb-4">
            <div className="bg-green-50 p-2 rounded-lg text-center">
              <div className="text-lg font-bold text-green-600">
                {stats.enrichedCount || 0}
              </div>
              <div className="text-xs text-gray-600">Enriched</div>
            </div>
            <div className="bg-yellow-50 p-2 rounded-lg text-center">
              <div className="text-lg font-bold text-yellow-600">
                {stats.pendingCount || 0}
              </div>
              <div className="text-xs text-gray-600">Pending</div>
            </div>
            <div className="bg-blue-50 p-2 rounded-lg text-center">
              <div className="text-lg font-bold text-blue-600">
                {stats.totalNames || 0}
              </div>
              <div className="text-xs text-gray-600">Total</div>
            </div>
          </div>

          {/* Expanded Content */}
          {!isMinimized && (
            <>
              {/* Top Origins */}
              {topOrigins.length > 0 && (
                <div className="mb-4">
                  <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1">
                    <Globe className="w-4 h-4" />
                    Top Origins
                  </h4>
                  <div className="space-y-1">
                    {topOrigins.map(([origin, count]) => (
                      <div key={origin} className="flex items-center justify-between text-xs">
                        <span className="text-gray-600">{origin}</span>
                        <span className="font-medium text-gray-700">{count} names</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Current Processing Info */}
              {status.isProcessing && status.currentName && (
                <div className="mb-4 p-2 bg-purple-50 rounded-lg">
                  <div className="flex items-center gap-2 text-sm">
                    <Sparkles className="w-4 h-4 text-purple-600 animate-pulse" />
                    <span className="text-purple-700">
                      Analyzing: <strong>{status.currentName}</strong>
                    </span>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Controls */}
          <div className="flex gap-2">
            {!status.isProcessing ? (
              <button
                onClick={handleStart}
                className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:shadow-lg transition-all"
              >
                <Play className="w-4 h-4" />
                <span className="font-medium">Start Enrichment</span>
              </button>
            ) : (
              <button
                onClick={handleStop}
                className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all"
              >
                <Pause className="w-4 h-4" />
                <span className="font-medium">Stop</span>
              </button>
            )}

            {!isMinimized && (
              <button
                onClick={handleClear}
                className="px-3 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-all"
                title="Clear all data"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Footer Info */}
        <div className="px-4 pb-3 text-xs text-gray-500 text-center">
          Press Ctrl+E to toggle • AI-powered enrichment
        </div>
      </div>
    </div>
  );
};

export default EnrichmentProcessor;