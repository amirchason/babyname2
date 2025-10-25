/**
 * Pre-made vote titles and descriptions
 * Witty, funny, cute, and sensitive options for vote creation
 */

export interface VoteTitle {
  id: string;
  emoji: string;
  text: string;
  tone: 'heartwarming' | 'funny' | 'thoughtful' | 'playful' | 'excited' | 'sweet';
}

export interface VoteDescription {
  id: string;
  text: string;
  tone: 'heartwarming' | 'funny' | 'thoughtful' | 'playful' | 'excited' | 'sweet';
}

export const VOTE_TITLES: VoteTitle[] = [
  {
    id: 'help-choose',
    emoji: '🍼',
    text: 'Help me choose a baby name!',
    tone: 'playful',
  },
  {
    id: 'little-one',
    emoji: '👶',
    text: "What should we name our little one?",
    tone: 'sweet',
  },
  {
    id: 'vote-future',
    emoji: '💕',
    text: "Vote for our future baby's name!",
    tone: 'excited',
  },
  {
    id: 'heart-melt',
    emoji: '🌟',
    text: 'Which name makes your heart melt?',
    tone: 'heartwarming',
  },
  {
    id: 'perfect-name',
    emoji: '✨',
    text: 'Help us pick the perfect name!',
    tone: 'excited',
  },
  {
    id: 'bundle-joy',
    emoji: '🎀',
    text: "What's the best name for our bundle of joy?",
    tone: 'sweet',
  },
  {
    id: 'no-pressure',
    emoji: '😅',
    text: "Choose our baby's name (no pressure!)",
    tone: 'funny',
  },
  {
    id: 'gets-vote',
    emoji: '🗳️',
    text: 'Which name gets your vote?',
    tone: 'playful',
  },
];

export const VOTE_DESCRIPTIONS: VoteDescription[] = [
  {
    id: 'expecting',
    text: "We're expecting and need your help picking the perfect name!",
    tone: 'excited',
  },
  {
    id: 'arriving-soon',
    text: 'Baby arriving soon! Help us narrow down our list to THE name.',
    tone: 'excited',
  },
  {
    id: 'love-all',
    text: "We love all these names but can only pick one. Which fits best?",
    tone: 'thoughtful',
  },
  {
    id: 'torn',
    text: "Our little one is coming and we're torn. What do you think?",
    tone: 'heartwarming',
  },
  {
    id: 'opinion-matters',
    text: 'Family & friends - your opinion matters! Help us choose.',
    tone: 'sweet',
  },
  {
    id: 'checked-twice',
    text: "We've made a list, checked it twice... now we need YOUR input!",
    tone: 'funny',
  },
  {
    id: 'find-the-one',
    text: 'Every name is special to us. Help us find THE ONE!',
    tone: 'heartwarming',
  },
  {
    id: 'biggest-decision',
    text: "This is the biggest decision before baby arrives. Vote!",
    tone: 'playful',
  },
];

/**
 * Get title by ID
 */
export const getTitleById = (id: string): VoteTitle | undefined => {
  return VOTE_TITLES.find((t) => t.id === id);
};

/**
 * Get description by ID
 */
export const getDescriptionById = (id: string): VoteDescription | undefined => {
  return VOTE_DESCRIPTIONS.find((d) => d.id === id);
};

/**
 * Default title text for backward compatibility
 */
export const DEFAULT_TITLE = 'Help me choose a baby name!';

/**
 * Default description text
 */
export const DEFAULT_DESCRIPTION = "We're expecting and need your help picking the perfect name!";
