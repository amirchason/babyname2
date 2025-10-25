/**
 * Pre-made voting reasons for voters to select
 * Witty, funny, and sensitive options for why they love a name
 */

export interface VotingReason {
  id: string;
  emoji: string;
  text: string;
  tone: 'heartfelt' | 'funny' | 'practical' | 'romantic' | 'thoughtful';
}

export const VOTING_REASONS: VotingReason[] = [
  {
    id: 'feels-right',
    emoji: '❤️',
    text: "It just feels right in my heart",
    tone: 'heartfelt',
  },
  {
    id: 'bedtime',
    emoji: '🌙',
    text: "I can picture calling this name at bedtime",
    tone: 'romantic',
  },
  {
    id: 'strong-confident',
    emoji: '💪',
    text: "It sounds strong and confident",
    tone: 'thoughtful',
  },
  {
    id: 'unique-sweet-spot',
    emoji: '✨',
    text: "It's unique but not too out there",
    tone: 'practical',
  },
  {
    id: 'meaning',
    emoji: '📖',
    text: "I love the meaning and origin",
    tone: 'thoughtful',
  },
  {
    id: 'flows-perfectly',
    emoji: '🎵',
    text: "It flows perfectly with the last name",
    tone: 'practical',
  },
  {
    id: 'reminds-special',
    emoji: '🌟',
    text: "It reminds me of someone special",
    tone: 'romantic',
  },
  {
    id: 'beautiful',
    emoji: '🌸',
    text: "I just think it's beautiful",
    tone: 'heartfelt',
  },
];

/**
 * Get reason by ID
 */
export const getReasonById = (id: string): VotingReason | undefined => {
  return VOTING_REASONS.find((r) => r.id === id);
};

/**
 * Default custom reason placeholder
 */
export const CUSTOM_REASON_PLACEHOLDER = "Share why you love this name...";
