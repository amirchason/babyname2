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

export type SharePlatform = 'whatsapp' | 'facebook' | 'twitter' | 'telegram' | 'tiktok' | 'native' | 'copy';

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
        // WhatsApp auto-detects URLs and makes them clickable
        // Format: "Title text" followed by actual URL on new line for better clickability
        const whatsappMessage = `${shareText}\n\n${shareUrl}`;
        shareLink = `https://wa.me/?text=${encodeURIComponent(whatsappMessage)}`;
        break;
      case 'facebook':
        shareLink = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
        break;
      case 'twitter':
        // Twitter separates text and URL parameters - URL is automatically added as clickable link
        shareLink = `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`;
        break;
      case 'telegram':
        // Telegram format: URL and text are both passed, creates clickable link
        const telegramMessage = `${shareText}\n\n${shareUrl}`;
        shareLink = `https://t.me/share/url?url=${encodedUrl}&text=${encodeURIComponent(shareText)}`;
        break;
      case 'tiktok':
        // TikTok Web Share API - allows sharing to TikTok with pre-filled text
        // This will open TikTok app on mobile or web.tiktok.com on desktop
        // User can then share to their story, post, or send to contacts
        const tiktokText = `${shareText}\n\n${shareUrl}`;
        const tiktokShareUrl = `https://www.tiktok.com/share?url=${encodedUrl}&text=${encodeURIComponent(tiktokText)}`;

        // On mobile, try to open TikTok app directly with the share intent
        if (/Android|iPhone|iPad|iPod/i.test(navigator.userAgent)) {
          // Copy link first so user can paste if needed
          handleCopyLink();
          // Try TikTok app deep link (will fallback to web if app not installed)
          window.location.href = `tiktok://share?text=${encodeURIComponent(tiktokText)}`;
        } else {
          // On desktop, open TikTok web share
          window.open(tiktokShareUrl, '_blank', 'noopener,noreferrer');
        }
        return;
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
              <div className="p-5">
                {/* Big friendly instruction */}
                <div className="text-center mb-5">
                  <h3 className="text-lg font-bold text-gray-800 mb-1">
                    🎉 Share Your Vote!
                  </h3>
                  <p className="text-sm text-gray-600">
                    Pick where to share and get votes from friends
                  </p>
                </div>

                {/* Share Platforms - Compact Grid */}
                <div className="space-y-2 mb-4">
                  {/* Native Share (Mobile) - Prominent */}
                  {hasNativeShare && (
                    <button
                      onClick={() => handlePlatformShare('native')}
                      className="w-full flex items-center gap-3 p-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:shadow-lg active:scale-98 transition group"
                    >
                      <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                        <Share2 className="w-5 h-5" />
                      </div>
                      <div className="flex-1 text-left">
                        <div className="font-bold text-base">Share Now</div>
                        <div className="text-xs opacity-90">Quick share menu</div>
                      </div>
                    </button>
                  )}

                  {/* Compact 2-column grid for popular platforms */}
                  <div className="grid grid-cols-2 gap-2 mb-2">
                    {/* WhatsApp */}
                    <button
                      onClick={() => handlePlatformShare('whatsapp')}
                      className="flex flex-col items-center gap-2 p-3 bg-green-500 text-white rounded-xl hover:bg-green-600 active:scale-95 transition"
                    >
                      <MessageCircle className="w-7 h-7" />
                      <span className="text-sm font-bold">WhatsApp</span>
                    </button>

                    {/* TikTok */}
                    <button
                      onClick={() => handlePlatformShare('tiktok')}
                      className="flex flex-col items-center gap-2 p-3 bg-gradient-to-br from-[#00f2ea] to-[#ff0050] text-white rounded-xl hover:opacity-90 active:scale-95 transition"
                    >
                      <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
                      </svg>
                      <span className="text-sm font-bold">TikTok</span>
                    </button>

                    {/* Facebook */}
                    <button
                      onClick={() => handlePlatformShare('facebook')}
                      className="flex flex-col items-center gap-2 p-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 active:scale-95 transition"
                    >
                      <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                      </svg>
                      <span className="text-sm font-bold">Facebook</span>
                    </button>

                    {/* Telegram */}
                    <button
                      onClick={() => handlePlatformShare('telegram')}
                      className="flex flex-col items-center gap-2 p-3 bg-cyan-500 text-white rounded-xl hover:bg-cyan-600 active:scale-95 transition"
                    >
                      <Send className="w-7 h-7" />
                      <span className="text-sm font-bold">Telegram</span>
                    </button>
                  </div>

                  {/* Copy Link - Full width, prominent */}
                  <button
                    onClick={() => handlePlatformShare('copy')}
                    className={`w-full flex items-center justify-center gap-2 p-3 rounded-xl font-bold transition active:scale-95 ${
                      copied
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-800 text-white hover:bg-gray-900'
                    }`}
                  >
                    {copied ? (
                      <>
                        <Check className="w-5 h-5" />
                        <span>✓ Link Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-5 h-5" />
                        <span>Copy Vote Link</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Simple tip */}
                <p className="text-xs text-center text-gray-500 mt-3">
                  💡 More voters = Better decision!
                </p>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
