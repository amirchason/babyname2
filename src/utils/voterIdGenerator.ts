/**
 * Voter ID Generator
 * Generates a unique, privacy-preserving voter ID using browser fingerprinting
 * and localStorage for persistent identification across sessions
 */

/**
 * Simple hash function for generating voter IDs
 */
function hashString(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash).toString(36);
}

/**
 * Generate browser fingerprint for voter identification
 */
function generateFingerprint(): string {
  const fingerprint = {
    userAgent: navigator.userAgent,
    language: navigator.language,
    languages: navigator.languages?.join(',') || '',
    platform: navigator.platform,
    screenResolution: `${screen.width}x${screen.height}`,
    colorDepth: screen.colorDepth,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    timezoneOffset: new Date().getTimezoneOffset(),
    // Add some randomness for privacy
    timestamp: Date.now(),
    random: Math.random().toString(36).substring(7)
  };

  return JSON.stringify(fingerprint);
}

/**
 * Get or create a unique voter ID
 * Stored in localStorage for persistence across sessions
 */
export function getVoterId(): string {
  const STORAGE_KEY = 'soulseed_voter_id';

  // Check if voter ID already exists
  const existingId = localStorage.getItem(STORAGE_KEY);
  if (existingId) {
    return existingId;
  }

  // Generate new voter ID from fingerprint
  const fingerprint = generateFingerprint();
  const voterId = `voter_${hashString(fingerprint)}_${Date.now().toString(36)}`;

  // Store for future use
  localStorage.setItem(STORAGE_KEY, voterId);

  return voterId;
}

/**
 * Get vote tracking key for a specific vote session
 * Used to track which votes a user has participated in
 */
export function getVoteTrackingKey(voteId: string): string {
  return `soulseed_vote_${voteId}`;
}

/**
 * Check if user has already voted in a specific vote session
 */
export function hasVoted(voteId: string): boolean {
  const trackingKey = getVoteTrackingKey(voteId);
  return localStorage.getItem(trackingKey) !== null;
}

/**
 * Mark a vote session as participated
 */
export function markAsVoted(voteId: string, selectedNames: string[]): void {
  const trackingKey = getVoteTrackingKey(voteId);
  const voteData = {
    votedAt: new Date().toISOString(),
    selectedNames,
    voterId: getVoterId()
  };
  localStorage.setItem(trackingKey, JSON.stringify(voteData));
}

/**
 * Get user's previous vote selections for a session
 */
export function getPreviousVote(voteId: string): string[] | null {
  const trackingKey = getVoteTrackingKey(voteId);
  const data = localStorage.getItem(trackingKey);

  if (!data) return null;

  try {
    const parsed = JSON.parse(data);
    return parsed.selectedNames || null;
  } catch {
    return null;
  }
}

/**
 * Clear voter ID (for testing/privacy purposes)
 */
export function clearVoterId(): void {
  localStorage.removeItem('soulseed_voter_id');
}
