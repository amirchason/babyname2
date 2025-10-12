import React, { useState, useEffect } from 'react';
import { Sparkles, CheckCircle, AlertCircle, Clock, Tag, TrendingUp } from 'lucide-react';

interface EnrichmentProgress {
  startedAt: string;
  lastUpdated: string;
  totalLists: number;
  processedLists: number;
  currentList: string | null;
  totalNames: number;
  enrichedNames: number;
  validatedNames: number;
  removedNames: number;
  skippedNames: number;
  errors: Array<{
    names: string[];
    error: string;
    timestamp: string;
  }>;
  processedListIds: string[];
  removals: Array<{
    name: string;
    list: string;
    listTitle: string;
    meaning: string;
    reasoning: string;
    timestamp: string;
  }>;
}

const ThemedListEnrichmentStatus: React.FC = () => {
  const [progress, setProgress] = useState<EnrichmentProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showRemovals, setShowRemovals] = useState(false);
  const [showErrors, setShowErrors] = useState(false);

  useEffect(() => {
    loadProgress();
    // Poll for updates every 5 seconds
    const interval = setInterval(loadProgress, 5000);
    return () => clearInterval(interval);
  }, []);

  const loadProgress = async () => {
    try {
      const response = await fetch('/themed-list-enrichment-progress.json');
      if (response.ok) {
        const data = await response.json();
        setProgress(data);
        setError(null);
      } else {
        setError('No enrichment progress found');
      }
    } catch (err) {
      setError('Failed to load enrichment progress');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 bg-white rounded-xl shadow-md border border-gray-200">
        <div className="flex items-center gap-3">
          <Clock className="w-5 h-5 text-gray-400 animate-spin" />
          <span className="text-gray-600">Loading enrichment status...</span>
        </div>
      </div>
    );
  }

  if (error || !progress) {
    return (
      <div className="p-6 bg-yellow-50 rounded-xl border border-yellow-200">
        <div className="flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-yellow-600" />
          <div>
            <h3 className="font-semibold text-yellow-800">No Enrichment Data</h3>
            <p className="text-sm text-yellow-700 mt-1">
              Run the enrichment script to start: <code className="bg-yellow-100 px-2 py-0.5 rounded">node enrich-themed-lists.js</code>
            </p>
          </div>
        </div>
      </div>
    );
  }

  const percentComplete = progress.totalLists > 0
    ? Math.round((progress.processedLists / progress.totalLists) * 100)
    : 0;

  const isComplete = progress.processedLists >= progress.totalLists;

  return (
    <div className="space-y-4">
      {/* Main Status Card */}
      <div className="p-6 bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl border border-purple-200 shadow-md">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            {isComplete ? (
              <CheckCircle className="w-6 h-6 text-green-600" />
            ) : (
              <Sparkles className="w-6 h-6 text-purple-600 animate-pulse" />
            )}
            <h2 className="text-2xl font-bold text-gray-800">
              {isComplete ? 'Enrichment Complete!' : 'Themed List Enrichment'}
            </h2>
          </div>
          <div className="text-3xl font-bold text-purple-600">
            {percentComplete}%
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="h-4 bg-white rounded-full overflow-hidden border border-purple-200">
            <div
              className="h-full bg-gradient-to-r from-purple-500 to-indigo-600 transition-all duration-500"
              style={{ width: `${percentComplete}%` }}
            />
          </div>
          <div className="flex justify-between mt-2 text-sm text-gray-600">
            <span>{progress.processedLists} / {progress.totalLists} lists processed</span>
            <span>Last updated: {new Date(progress.lastUpdated).toLocaleTimeString()}</span>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 bg-white rounded-lg border border-gray-200">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-blue-500" />
              <span className="text-xs text-gray-500">Enriched</span>
            </div>
            <div className="text-2xl font-bold text-gray-800">
              {progress.enrichedNames.toLocaleString()}
            </div>
          </div>

          <div className="p-4 bg-white rounded-lg border border-gray-200">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span className="text-xs text-gray-500">Validated</span>
            </div>
            <div className="text-2xl font-bold text-gray-800">
              {progress.validatedNames.toLocaleString()}
            </div>
          </div>

          <div className="p-4 bg-white rounded-lg border border-gray-200">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="w-4 h-4 text-red-500" />
              <span className="text-xs text-gray-500">Removed</span>
            </div>
            <div className="text-2xl font-bold text-gray-800">
              {progress.removedNames.toLocaleString()}
            </div>
          </div>

          <div className="p-4 bg-white rounded-lg border border-gray-200">
            <div className="flex items-center gap-2 mb-2">
              <Tag className="w-4 h-4 text-purple-500" />
              <span className="text-xs text-gray-500">Total Names</span>
            </div>
            <div className="text-2xl font-bold text-gray-800">
              {progress.totalNames.toLocaleString()}
            </div>
          </div>
        </div>

        {/* Current Processing */}
        {!isComplete && progress.currentList && (
          <div className="mt-4 p-3 bg-white/60 rounded-lg border border-purple-200">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-purple-600 animate-pulse" />
              <span className="text-sm font-medium text-gray-700">
                Currently processing: <span className="text-purple-700">{progress.currentList}</span>
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Removals Section */}
      {progress.removals && progress.removals.length > 0 && (
        <div className="p-6 bg-white rounded-xl border border-gray-200 shadow-md">
          <button
            onClick={() => setShowRemovals(!showRemovals)}
            className="w-full flex items-center justify-between text-left"
          >
            <div className="flex items-center gap-3">
              <TrendingUp className="w-5 h-5 text-red-500" />
              <h3 className="text-lg font-semibold text-gray-800">
                Removed Names ({progress.removals.length})
              </h3>
            </div>
            <span className="text-gray-400">{showRemovals ? '▼' : '▶'}</span>
          </button>

          {showRemovals && (
            <div className="mt-4 space-y-2 max-h-96 overflow-y-auto">
              {progress.removals.slice(0, 50).map((removal, idx) => (
                <div
                  key={idx}
                  className="p-3 bg-red-50 rounded-lg border border-red-200 text-sm"
                >
                  <div className="font-medium text-gray-800">{removal.name}</div>
                  <div className="text-xs text-gray-600 mt-1">
                    List: <span className="font-medium">{removal.listTitle}</span>
                  </div>
                  <div className="text-xs text-gray-600">
                    Meaning: <span className="italic">"{removal.meaning}"</span>
                  </div>
                  <div className="text-xs text-red-600 mt-1">
                    Reason: {removal.reasoning}
                  </div>
                </div>
              ))}
              {progress.removals.length > 50 && (
                <p className="text-sm text-gray-500 text-center">
                  ... and {progress.removals.length - 50} more
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {/* Errors Section */}
      {progress.errors && progress.errors.length > 0 && (
        <div className="p-6 bg-white rounded-xl border border-red-200 shadow-md">
          <button
            onClick={() => setShowErrors(!showErrors)}
            className="w-full flex items-center justify-between text-left"
          >
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-500" />
              <h3 className="text-lg font-semibold text-gray-800">
                Errors ({progress.errors.length})
              </h3>
            </div>
            <span className="text-gray-400">{showErrors ? '▼' : '▶'}</span>
          </button>

          {showErrors && (
            <div className="mt-4 space-y-2 max-h-96 overflow-y-auto">
              {progress.errors.map((error, idx) => (
                <div
                  key={idx}
                  className="p-3 bg-red-50 rounded-lg border border-red-200 text-sm"
                >
                  <div className="font-medium text-red-800">{error.error}</div>
                  <div className="text-xs text-gray-600 mt-1">
                    Names: {error.names.join(', ')}
                  </div>
                  <div className="text-xs text-gray-500">
                    {new Date(error.timestamp).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Instructions */}
      <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 text-sm">
        <h4 className="font-semibold text-gray-800 mb-2">How to run enrichment:</h4>
        <code className="block bg-gray-800 text-green-400 p-3 rounded font-mono">
          # Test mode (first list only)<br />
          node enrich-themed-lists.js --test<br />
          <br />
          # Dry run (no changes)<br />
          node enrich-themed-lists.js --dry-run<br />
          <br />
          # Full enrichment<br />
          node enrich-themed-lists.js
        </code>
        <p className="mt-2 text-gray-600">
          Progress is saved automatically and the script can be resumed if interrupted.
        </p>
      </div>
    </div>
  );
};

export default ThemedListEnrichmentStatus;
