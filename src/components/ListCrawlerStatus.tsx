/**
 * List Crawler Status Component
 * Compact status indicator for the list crawler
 * Shows in header or can be used standalone
 */

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, CheckCircle, AlertCircle, Clock } from 'lucide-react';
import { useListCrawler } from '../hooks/useListCrawler';

interface ListCrawlerStatusProps {
  variant?: 'compact' | 'full';
  onClick?: () => void;
}

const ListCrawlerStatus: React.FC<ListCrawlerStatusProps> = ({ variant = 'compact', onClick }) => {
  const { status, latestReport, getTimeSinceLastRun } = useListCrawler();

  const hoursSinceRun = getTimeSinceLastRun();

  if (!status.isRunning && !latestReport && hoursSinceRun === null) {
    return null; // Never run before
  }

  // Compact variant (for header)
  if (variant === 'compact') {
    return (
      <AnimatePresence>
        {status.isRunning ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="flex items-center gap-1.5 px-2 py-1 bg-blue-50 text-blue-700 rounded-full cursor-pointer hover:bg-blue-100 transition-colors text-xs"
            onClick={onClick}
            title={`Crawling: ${status.currentList} (${status.progress}%)`}
          >
            <Loader2 className="w-3 h-3 animate-spin" />
            <span className="font-medium hidden sm:inline">{status.progress}%</span>
          </motion.div>
        ) : latestReport && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="flex items-center gap-1.5 px-2 py-1 bg-green-50 text-green-700 rounded-full cursor-pointer hover:bg-green-100 transition-colors text-xs"
            onClick={onClick}
            title={`Last run: ${hoursSinceRun}h ago`}
          >
            <CheckCircle className="w-3 h-3" />
            <span className="font-medium hidden sm:inline">{hoursSinceRun}h ago</span>
          </motion.div>
        )}
      </AnimatePresence>
    );
  }

  // Full variant (for dashboard)
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="flex items-start justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-800">List Crawler Status</h3>
        {status.isRunning ? (
          <span className="flex items-center gap-1 text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
            <Loader2 className="w-3 h-3 animate-spin" />
            Running
          </span>
        ) : latestReport ? (
          <span className="flex items-center gap-1 text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">
            <CheckCircle className="w-3 h-3" />
            Completed
          </span>
        ) : (
          <span className="flex items-center gap-1 text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded-full">
            <Clock className="w-3 h-3" />
            Idle
          </span>
        )}
      </div>

      {status.isRunning && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-gray-600">
            <span>{status.currentList}</span>
            <span>{status.listsProcessed}/{status.totalLists}</span>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${status.progress}%` }}
              transition={{ duration: 0.3 }}
              className="h-full bg-gradient-to-r from-purple-600 to-pink-600 rounded-full"
            />
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="bg-purple-50 rounded px-2 py-1">
              <div className="text-purple-600 font-medium">Names Added</div>
              <div className="text-gray-700 font-semibold">{status.namesAdded}</div>
            </div>
            <div className="bg-pink-50 rounded px-2 py-1">
              <div className="text-pink-600 font-medium">Enriched</div>
              <div className="text-gray-700 font-semibold">{status.namesEnriched}</div>
            </div>
          </div>
        </div>
      )}

      {!status.isRunning && latestReport && (
        <div className="space-y-2">
          <div className="text-xs text-gray-600">
            Last run: {hoursSinceRun !== null ? `${hoursSinceRun} hours ago` : 'Unknown'}
          </div>

          <div className="grid grid-cols-3 gap-2 text-xs">
            <div className="bg-blue-50 rounded px-2 py-1.5 text-center">
              <div className="text-blue-600 font-medium text-[10px] uppercase">Lists</div>
              <div className="text-gray-800 font-bold text-lg">{latestReport.listsProcessed}</div>
            </div>
            <div className="bg-purple-50 rounded px-2 py-1.5 text-center">
              <div className="text-purple-600 font-medium text-[10px] uppercase">Added</div>
              <div className="text-gray-800 font-bold text-lg">{latestReport.namesAdded}</div>
            </div>
            <div className="bg-pink-50 rounded px-2 py-1.5 text-center">
              <div className="text-pink-600 font-medium text-[10px] uppercase">Enriched</div>
              <div className="text-gray-800 font-bold text-lg">{latestReport.namesEnriched}</div>
            </div>
          </div>

          {latestReport.errors.length > 0 && (
            <div className="bg-red-50 rounded px-2 py-1.5 text-xs text-red-600 flex items-start gap-1">
              <AlertCircle className="w-3 h-3 mt-0.5 flex-shrink-0" />
              <span>{latestReport.errors.length} error(s) occurred</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ListCrawlerStatus;
