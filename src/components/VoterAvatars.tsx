/**
 * VoterAvatars Component
 * Displays voter avatars at the bottom of voting pages
 * Shows tiny circular avatars with names on hover
 */

import React, { useState } from 'react';
import { VoterInfo } from '../services/voteService';
import { Users } from 'lucide-react';

interface VoterAvatarsProps {
  voters: VoterInfo[];
  maxDisplay?: number;
}

const VoterAvatars: React.FC<VoterAvatarsProps> = ({ voters, maxDisplay = 30 }) => {
  const [showAllModal, setShowAllModal] = useState(false);

  if (!voters || voters.length === 0) {
    return null;
  }

  // Sort voters by most recent first
  const sortedVoters = [...voters].sort((a, b) => {
    const timeA = a.votedAt?.toMillis?.() || 0;
    const timeB = b.votedAt?.toMillis?.() || 0;
    return timeB - timeA;
  });

  const displayedVoters = sortedVoters.slice(0, maxDisplay);
  const remainingCount = Math.max(0, sortedVoters.length - maxDisplay);

  return (
    <>
      <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-40">
        <div className="bg-white/90 backdrop-blur-sm rounded-full px-6 py-3 shadow-lg border border-gray-200">
          <div className="flex items-center gap-3">
            {/* Voters label */}
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Users className="w-4 h-4" />
              <span className="font-medium">{voters.length}</span>
              <span className="hidden sm:inline">
                {voters.length === 1 ? 'Voter' : 'Voters'}
              </span>
            </div>

            {/* Avatar stack */}
            <div className="flex items-center -space-x-2">
              {displayedVoters.map((voter, index) => (
                <div
                  key={voter.id}
                  className="group relative"
                  style={{ zIndex: maxDisplay - index }}
                >
                  {/* Avatar */}
                  {voter.avatar ? (
                    <img
                      src={voter.avatar}
                      alt={voter.name || 'Voter'}
                      className="w-8 h-8 rounded-full border-2 border-white shadow-sm hover:scale-110 transition-transform cursor-pointer"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full border-2 border-white bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white text-xs font-bold shadow-sm hover:scale-110 transition-transform cursor-pointer">
                      {voter.name?.charAt(0).toUpperCase() || '?'}
                    </div>
                  )}

                  {/* Tooltip */}
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                    <div className="bg-gray-900 text-white text-xs rounded-lg px-3 py-1.5 whitespace-nowrap shadow-lg">
                      {voter.name || 'Anonymous Voter'}
                      <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1">
                        <div className="w-2 h-2 bg-gray-900 rotate-45"></div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {/* Show more button */}
              {remainingCount > 0 && (
                <button
                  onClick={() => setShowAllModal(true)}
                  className="w-8 h-8 rounded-full border-2 border-white bg-gray-100 flex items-center justify-center text-gray-600 text-xs font-bold shadow-sm hover:scale-110 hover:bg-gray-200 transition-all cursor-pointer"
                  style={{ zIndex: 0 }}
                >
                  +{remainingCount}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Full voters modal */}
      {showAllModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden shadow-2xl">
            {/* Modal header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <Users className="w-5 h-5" />
                All Voters ({voters.length})
              </h3>
              <button
                onClick={() => setShowAllModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Voters list */}
            <div className="overflow-y-auto max-h-[calc(80vh-80px)]">
              <div className="p-6 space-y-3">
                {sortedVoters.map((voter) => (
                  <div
                    key={voter.id}
                    className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    {/* Avatar */}
                    {voter.avatar ? (
                      <img
                        src={voter.avatar}
                        alt={voter.name || 'Voter'}
                        className="w-12 h-12 rounded-full border-2 border-gray-200 shadow-sm"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full border-2 border-gray-200 bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white text-lg font-bold shadow-sm">
                        {voter.name?.charAt(0).toUpperCase() || '?'}
                      </div>
                    )}

                    {/* Voter info */}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">
                        {voter.name || 'Anonymous Voter'}
                      </p>
                      {voter.votedAt && (
                        <p className="text-sm text-gray-500">
                          {formatTimestamp(voter.votedAt)}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

// Helper function to format timestamp
function formatTimestamp(timestamp: any): string {
  if (!timestamp) return '';

  try {
    const date = timestamp.toDate?.() || new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  } catch (error) {
    return '';
  }
}

export default VoterAvatars;
