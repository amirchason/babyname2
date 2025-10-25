/**
 * Category Tagger Utility
 * Auto-categorize baby names based on origin, meaning, and cultural significance
 * V7 Enhancement - Hybrid algorithmic + GPT validation
 */

/**
 * Complete category taxonomy with keyword indicators
 */
export const CATEGORY_DEFINITIONS = {
  // Origin-Based Categories
  "Biblical": {
    keywords: ["bible", "biblical", "apostle", "testament", "scripture", "saint", "hebrew", "aramaic", "prophet", "disciple"],
    color: "blue"
  },
  "Mythological": {
    keywords: ["myth", "mythological", "god", "goddess", "hero", "legend", "olympus", "norse", "greek mythology"],
    color: "purple"
  },
  "Royal": {
    keywords: ["king", "queen", "prince", "princess", "monarch", "nobility", "royal", "crown", "throne", "regal"],
    color: "gold"
  },
  "Literary": {
    keywords: ["literature", "novel", "character", "author", "poem", "shakespeare", "story", "fictional"],
    color: "teal"
  },

  // Style-Based Categories
  "Classic": {
    keywords: ["classic", "centuries", "traditional", "historical", "enduring", "timeless", "ancient", "long history"],
    color: "amber"
  },
  "Modern": {
    keywords: ["modern", "contemporary", "recent", "2000s", "2010s", "trendy", "new", "current", "21st century"],
    color: "green"
  },
  "Vintage": {
    keywords: ["vintage", "1900s", "1920s", "1950s", "old-fashioned", "retro", "victorian", "edwardian", "antique"],
    color: "rose"
  },
  "Timeless": {
    keywords: ["timeless", "popular across", "never goes out", "enduring appeal", "consistently popular", "all generations"],
    color: "pink"
  },

  // Nature-Based Categories
  "Nature": {
    keywords: ["flower", "tree", "plant", "natural", "earth", "garden", "botanical", "forest", "meadow", "blossom"],
    color: "green"
  },
  "Celestial": {
    keywords: ["star", "moon", "sun", "sky", "heaven", "celestial", "cosmic", "stellar", "lunar", "solar"],
    color: "indigo"
  },
  "Animal": {
    keywords: ["bird", "lion", "bear", "wolf", "eagle", "dove", "animal", "beast", "creature"],
    color: "orange"
  },

  // Sound-Based Categories
  "Strong": {
    keywords: ["strong", "masculine", "powerful", "solid", "bold", "firm", "robust", "mighty", "strength"],
    color: "slate"
  },
  "Soft": {
    keywords: ["soft", "gentle", "melodic", "sweet", "delicate", "tender", "graceful", "elegant", "feminine"],
    color: "lavender"
  },
  "Unique": {
    keywords: ["unique", "rare", "unusual", "distinctive", "uncommon", "one-of-a-kind", "special", "singular"],
    color: "violet"
  },

  // Cultural/Geographic Categories
  "International": {
    keywords: ["international", "multiple cultures", "worldwide", "global", "universal", "cross-cultural", "many countries"],
    color: "cyan"
  },
  "American": {
    keywords: ["american", "united states", "usa", "north american"],
    color: "red"
  },
  "European": {
    keywords: ["european", "england", "english", "france", "french", "italy", "italian", "spain", "spanish", "german"],
    color: "blue"
  }
};

/**
 * Auto-categorize a name based on its data
 * @param {Object} nameData - Name data object with origin, meaning, culturalSignificance
 * @returns {Array} - Array of category objects with tag, confidence, reason
 */
export function autoCategorizeName(nameData) {
  if (!nameData) return [];

  const categories = [];

  // Combine all relevant text for analysis
  const analysisText = `
    ${nameData.origin || ''}
    ${nameData.meaning || ''}
    ${nameData.culturalSignificance || ''}
    ${nameData.modernContext || ''}
  `.toLowerCase();

  // Check each category for keyword matches
  Object.entries(CATEGORY_DEFINITIONS).forEach(([categoryName, categoryData]) => {
    const keywords = categoryData.keywords;
    const matches = keywords.filter(keyword =>
      analysisText.includes(keyword.toLowerCase())
    );

    if (matches.length >= 2) {
      // Calculate confidence score based on number of matches
      const confidence = Math.min(0.95, 0.75 + (matches.length * 0.05));

      categories.push({
        tag: categoryName,
        confidence: confidence,
        reason: `Contains ${matches.length} ${categoryName.toLowerCase()} indicator${matches.length > 1 ? 's' : ''}`
      });
    }
  });

  // Sort by confidence score (highest first)
  categories.sort((a, b) => b.confidence - a.confidence);

  // Return top 5 categories
  return categories.slice(0, 5);
}

/**
 * Validate GPT-generated categories against taxonomy
 * @param {Array} gptCategories - Categories from GPT
 * @returns {Array} - Validated categories
 */
export function validateGPTCategories(gptCategories) {
  if (!Array.isArray(gptCategories)) return [];

  return gptCategories
    .filter(cat => {
      // Check if category exists in our taxonomy
      return CATEGORY_DEFINITIONS.hasOwnProperty(cat.tag);
    })
    .map(cat => ({
      tag: cat.tag,
      confidence: Math.min(0.95, Math.max(0.75, cat.confidence || 0.80)),
      reason: cat.reason || `Based on name's characteristics`
    }))
    .slice(0, 5); // Max 5 tags
}

/**
 * Merge algorithmic and GPT categories (hybrid approach)
 * @param {Array} autoCategories - From autoCategorizeName
 * @param {Array} gptCategories - From GPT
 * @returns {Array} - Merged and deduplicated categories
 */
export function mergeCategories(autoCategories, gptCategories) {
  const categoryMap = new Map();

  // Add auto categories
  autoCategories.forEach(cat => {
    categoryMap.set(cat.tag, cat);
  });

  // Add or update with GPT categories (GPT takes precedence)
  gptCategories.forEach(cat => {
    if (categoryMap.has(cat.tag)) {
      // Use higher confidence score
      const existing = categoryMap.get(cat.tag);
      if (cat.confidence > existing.confidence) {
        categoryMap.set(cat.tag, cat);
      }
    } else {
      categoryMap.set(cat.tag, cat);
    }
  });

  // Convert back to array and sort by confidence
  const merged = Array.from(categoryMap.values());
  merged.sort((a, b) => b.confidence - a.confidence);

  return merged.slice(0, 5); // Max 5 tags
}

/**
 * Get color scheme for a category
 * @param {string} categoryTag - Category name
 * @returns {string} - Color name for CSS
 */
export function getCategoryColor(categoryTag) {
  const category = CATEGORY_DEFINITIONS[categoryTag];
  return category ? category.color : 'gray';
}
