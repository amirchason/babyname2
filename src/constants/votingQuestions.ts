/**
 * Pre-made voting questions for baby name selection
 * Carefully crafted to be witty, funny, and sensitive
 */

export interface VotingQuestion {
  id: string;
  emoji: string;
  text: string;
  description: string;
  tone: 'heartwarming' | 'funny' | 'thoughtful' | 'playful' | 'zen';
}

export const VOTING_QUESTIONS: VotingQuestion[] = [
  {
    id: 'perfect-feeling',
    emoji: '🥰',
    text: "Which name gives you the biggest 'aww, that's perfect!' feeling?",
    description: 'Trust your heart - which one makes you smile?',
    tone: 'heartwarming',
  },
  {
    id: 'playground',
    emoji: '🏃',
    text: "Which name would you shout across a playground without cringing?",
    description: 'The ultimate real-world test!',
    tone: 'funny',
  },
  {
    id: 'famous',
    emoji: '⭐',
    text: "Which name sounds like they'll be famous someday?",
    description: 'Future celebrity vibes',
    tone: 'playful',
  },
  {
    id: 'coffee-cup',
    emoji: '☕',
    text: "Which name would you NOT want misspelled on a coffee cup?",
    description: 'Because Starbucks will test you',
    tone: 'funny',
  },
  {
    id: 'timeless',
    emoji: '👵',
    text: "Which name will still sound great when they're 90?",
    description: 'The longevity test',
    tone: 'thoughtful',
  },
  {
    id: 'initials',
    emoji: '🎨',
    text: "Which initials would look coolest on a monogrammed towel?",
    description: 'Style points matter!',
    tone: 'playful',
  },
  {
    id: 'nickname',
    emoji: '💕',
    text: "Which name has the cutest nickname potential?",
    description: 'Think of all the adorable shortenings',
    tone: 'heartwarming',
  },
  {
    id: 'intuition',
    emoji: '✨',
    text: "Close your eyes, take a breath... which name just feels RIGHT?",
    description: 'Trust your intuition',
    tone: 'zen',
  },
];

/**
 * Get a random question from the list
 */
export const getRandomQuestion = (): VotingQuestion => {
  const randomIndex = Math.floor(Math.random() * VOTING_QUESTIONS.length);
  return VOTING_QUESTIONS[randomIndex];
};

/**
 * Get question by ID
 */
export const getQuestionById = (id: string): VotingQuestion | undefined => {
  return VOTING_QUESTIONS.find((q) => q.id === id);
};

/**
 * Default question text for backward compatibility
 */
export const DEFAULT_QUESTION = "Which name do you love most?";
