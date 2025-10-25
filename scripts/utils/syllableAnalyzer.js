/**
 * Syllable Analyzer Utility
 * Algorithmic syllable counting and breakdown for baby names
 * V7 Enhancement - No API cost
 */

/**
 * Analyze syllables in a name
 * @param {string} name - The name to analyze
 * @returns {Object} - { count: number, breakdown: string }
 */
export function analyzeSyllables(name) {
  if (!name || typeof name !== 'string') {
    return { count: 1, breakdown: name || '' };
  }

  const nameLower = name.toLowerCase().trim();
  const vowelGroups = nameLower.match(/[aeiouy]+/g);
  let count = vowelGroups ? vowelGroups.length : 1;

  // Adjustments for accuracy
  if (nameLower.endsWith('e') && count > 1) count--;
  if (nameLower.endsWith('le') && count > 1 && nameLower.length > 2) count++;
  if (nameLower.endsWith('ed') && count > 1) count--;

  // Ensure at least 1 syllable
  count = Math.max(1, count);

  return {
    count: count,
    breakdown: createBreakdown(name, count)
  };
}

/**
 * Create syllable breakdown with hyphens
 * @param {string} name - The name
 * @param {number} syllableCount - Number of syllables
 * @returns {string} - Hyphenated breakdown
 */
function createBreakdown(name, syllableCount) {
  if (syllableCount === 1) return name;

  // Manual mapping for common names (high accuracy)
  const manualBreakdowns = {
    // Top boys names
    'Thomas': 'Thom-as',
    'Alexander': 'Al-ex-an-der',
    'John': 'John',
    'William': 'Wil-liam',
    'Michael': 'Mi-chael',
    'James': 'James',
    'Benjamin': 'Ben-ja-min',
    'Daniel': 'Dan-iel',
    'Matthew': 'Mat-thew',
    'Christopher': 'Chris-to-pher',
    'Andrew': 'An-drew',
    'Joshua': 'Josh-u-a',
    'David': 'Da-vid',
    'Joseph': 'Jo-seph',
    'Samuel': 'Sam-u-el',
    'Henry': 'Hen-ry',
    'Sebastian': 'Se-bas-tian',
    'Theodore': 'The-o-dore',
    'Oliver': 'Ol-i-ver',
    'Lucas': 'Lu-cas',

    // Top girls names
    'Elizabeth': 'E-liz-a-beth',
    'Sophia': 'So-phi-a',
    'Emma': 'Em-ma',
    'Olivia': 'O-liv-i-a',
    'Isabella': 'Is-a-bel-la',
    'Ava': 'A-va',
    'Charlotte': 'Char-lotte',
    'Amelia': 'A-me-li-a',
    'Emily': 'Em-i-ly',
    'Abigail': 'Ab-i-gail',
    'Madison': 'Mad-i-son',
    'Victoria': 'Vic-to-ri-a',
    'Samantha': 'Sa-man-tha',
    'Natalie': 'Nat-a-lie',
    'Alexandra': 'Al-ex-an-dra',
    'Katherine': 'Kath-er-ine',
    'Jennifer': 'Jen-ni-fer',
    'Sarah': 'Sar-ah',
    'Grace': 'Grace',
    'Hannah': 'Han-nah'
  };

  // Return manual breakdown if available
  if (manualBreakdowns[name]) {
    return manualBreakdowns[name];
  }

  // Algorithmic breakdown (simple heuristic)
  // This is approximate - manual refinement recommended for accuracy
  return algorithmicBreakdown(name, syllableCount);
}

/**
 * Algorithmic syllable breakdown (fallback for unmapped names)
 * @param {string} name - The name
 * @param {number} syllableCount - Expected syllable count
 * @returns {string} - Best-guess breakdown
 */
function algorithmicBreakdown(name, syllableCount) {
  if (syllableCount === 1) return name;
  if (syllableCount === 2) {
    // Simple two-syllable split (rough approximation)
    const mid = Math.floor(name.length / 2);
    return `${name.substring(0, mid)}-${name.substring(mid)}`;
  }

  // For 3+ syllables, just return the name (needs manual refinement)
  return name;
}

/**
 * Get syllable description for display
 * @param {number} count - Syllable count
 * @returns {string} - "1 Syllable" or "2 Syllables"
 */
export function getSyllableDescription(count) {
  return `${count} Syllable${count !== 1 ? 's' : ''}`;
}
