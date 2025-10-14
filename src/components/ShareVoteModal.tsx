/**
 * Share Vote Modal
 * Provides multiple sharing options for vote sessions
 * Uses Web Share API when available, with fallback to platform-specific URLs
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Share2,
  MessageCircle,
  Send,
  Copy,
  Check
} from 'lucide-react';

export type SharePlatform = 'whatsapp' | 'facebook' | 'twitter' | 'telegram' | 'native' | 'copy';

interface ShareVoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  voteId: string;
  title: string;
}

export default function ShareVoteModal({ isOpen, onClose, voteId, title }: ShareVoteModalProps) {
  const [copied, setCopied] = useState(false);

  // Generate share URL (use production URL or localhost)
  const getShareUrl = () => {
    const baseUrl = window.location.origin;
    return `${baseUrl}/babyname2/vote/${voteId}`;
  };

  const shareUrl = getShareUrl();
  const shareText = `${title} - Vote for your favorite baby name!`;

  // Check if Web Share API is available
  const hasNativeShare = typeof navigator !== 'undefined' && 'share' in navigator;

  /**
   * Handle native share (mobile)
   */
  const handleNativeShare = async () => {
    if (!hasNativeShare) return;

    try {
      await navigator.share({
        title: shareText,
        text: `Help me choose a baby name! ${shareText}`,
        url: shareUrl
      });
    } catch (error) {
      // User cancelled or error occurred
      console.log('Share cancelled or failed:', error);
    }
  };

  /**
   * Handle platform-specific sharing
   */
  const handlePlatformShare = (platform: SharePlatform) => {
    const encodedUrl = encodeURIComponent(shareUrl);
    const encodedText = encodeURIComponent(shareText);

    let shareLink = '';

    switch (platform) {
      case 'whatsapp':
        shareLink = `https://wa.me/?text=${encodedText}%20${encodedUrl}`;
        break;
      case 'facebook':
        shareLink = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
        break;
      case 'twitter':
        shareLink = `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`;
        break;
      case 'telegram':
        shareLink = `https://t.me/share/url?url=${encodedUrl}&text=${encodedText}`;
        break;
      case 'native':
        handleNativeShare();
        return;
      case 'copy':
        handleCopyLink();
        return;
    }

    if (shareLink) {
      window.open(shareLink, '_blank', 'noopener,noreferrer');
    }
  };

  /**
   * Copy link to clipboard
   */
  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy link:', error);
      // Fallback: select the text
      const input = document.createElement('input');
      input.value = shareUrl;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
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
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4"
          >
            {/* Modal */}
            <motion.div
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl w-full max-w-md overflow-hidden"
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Share2 className="w-6 h-6 text-white" />
                  <h2 className="text-xl font-bold text-white">Share Vote</h2>
                </div>
                <button
                  onClick={onClose}
                  className="text-white hover:bg-white/20 p-2 rounded-full transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Content */}
              <div className="p-6">
                {/* Share URL Display */}
                <div className="mb-6">
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Vote Link
                  </label>
                  <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-3 border border-gray-200">
                    <input
                      type="text"
                      value={shareUrl}
                      readOnly
                      className="flex-1 bg-transparent text-sm text-gray-700 outline-none"
                    />
                    <button
                      onClick={handleCopyLink}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-lg font-medium text-sm transition ${
                        copied
                          ? 'bg-green-100 text-green-700'
                          : 'bg-purple-100 text-purple-700 hover:bg-purple-200'
                      }`}
                    >
                      {copied ? (
                        <>
                          <Check className="w-4 h-4" />
                          Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4" />
                          Copy
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Share Platforms */}
                <div className="space-y-3">
                  <h3 className="text-sm font-medium text-gray-700 mb-3">
                    Share on
                  </h3>

                  {/* Native Share (Mobile) */}
                  {hasNativeShare && (
                    <button
                      onClick={() => handlePlatformShare('native')}
                      className="w-full flex items-center gap-4 p-4 bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200 rounded-xl hover:border-purple-400 hover:shadow-md transition group"
                    >
                      <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center group-hover:scale-110 transition">
                        <Share2 className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1 text-left">
                        <div className="font-semibold text-gray-800">Share...</div>
                        <div className="text-sm text-gray-600">Use your device's share menu</div>
                      </div>
                    </button>
                  )}

                  {/* WhatsApp */}
                  <button
                    onClick={() => handlePlatformShare('whatsapp')}
                    className="w-full flex items-center gap-4 p-4 bg-green-50 border-2 border-green-200 rounded-xl hover:border-green-400 hover:shadow-md transition group"
                  >
                    <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center group-hover:scale-110 transition">
                      <MessageCircle className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1 text-left">
                      <div className="font-semibold text-gray-800">WhatsApp</div>
                      <div className="text-sm text-gray-600">Share with friends & family</div>
                    </div>
                  </button>

                  {/* Facebook */}
                  <button
                    onClick={() => handlePlatformShare('facebook')}
                    className="w-full flex items-center gap-4 p-4 bg-blue-50 border-2 border-blue-200 rounded-xl hover:border-blue-400 hover:shadow-md transition group"
                  >
                    <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center group-hover:scale-110 transition">
                      <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                      </svg>
                    </div>
                    <div className="flex-1 text-left">
                      <div className="font-semibold text-gray-800">Facebook</div>
                      <div className="text-sm text-gray-600">Post to your timeline</div>
                    </div>
                  </button>

                  {/* Twitter/X */}
                  <button
                    onClick={() => handlePlatformShare('twitter')}
                    className="w-full flex items-center gap-4 p-4 bg-sky-50 border-2 border-sky-200 rounded-xl hover:border-sky-400 hover:shadow-md transition group"
                  >
                    <div className="w-12 h-12 bg-sky-500 rounded-full flex items-center justify-center group-hover:scale-110 transition">
                      <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                      </svg>
                    </div>
                    <div className="flex-1 text-left">
                      <div className="font-semibold text-gray-800">Twitter / X</div>
                      <div className="text-sm text-gray-600">Tweet to followers</div>
                    </div>
                  </button>

                  {/* Telegram */}
                  <button
                    onClick={() => handlePlatformShare('telegram')}
                    className="w-full flex items-center gap-4 p-4 bg-cyan-50 border-2 border-cyan-200 rounded-xl hover:border-cyan-400 hover:shadow-md transition group"
                  >
                    <div className="w-12 h-12 bg-cyan-500 rounded-full flex items-center justify-center group-hover:scale-110 transition">
                      <Send className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1 text-left">
                      <div className="font-semibold text-gray-800">Telegram</div>
                      <div className="text-sm text-gray-600">Send to contacts</div>
                    </div>
                  </button>
                </div>

                {/* Footer */}
                <div className="mt-6 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-100">
                  <p className="text-sm text-gray-700 text-center">
                    💡 <span className="font-semibold">Pro Tip:</span> The more people vote, the better your decision!
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
