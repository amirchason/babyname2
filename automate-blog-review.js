#!/usr/bin/env node

/**
 * 🤖 AUTOMATED BLOG CONTENT REVIEWER
 *
 * Scores blog posts on 5 dimensions:
 * 1. SEO Optimization (30 points)
 * 2. Readability (20 points)
 * 3. Humanization (20 points)
 * 4. Accuracy (15 points)
 * 5. Engagement (15 points)
 *
 * Total: 100 points
 */

const fs = require('fs');
const path = require('path');

//===========================================
// SCORING ALGORITHMS
//===========================================

/**
 * Score SEO Optimization (30 points)
 */
function scoreSEO(content, metadata = {}) {
  let score = 0;
  const title = metadata.title || '';
  const keywords = metadata.keywords || [];

  // 1. Title optimization (5 points)
  if (title.length >= 40 && title.length <= 70) score += 3;
  else if (title.length >= 30 && title.length <= 80) score += 2;
  else score += 1;

  if (keywords.length > 0 && title.toLowerCase().includes(keywords[0].toLowerCase())) {
    score += 2;
  }

  // 2. Keyword presence (5 points)
  const keywordDensity = calculateKeywordDensity(content, keywords);
  if (keywordDensity >= 1 && keywordDensity <= 2.5) score += 5;
  else if (keywordDensity >= 0.5 && keywordDensity <= 3) score += 3;
  else score += 1;

  // 3. Structure (10 points)
  const h2Count = (content.match(/^##\s+/gm) || []).length;
  const h3Count = (content.match(/^###\s+/gm) || []).length;

  if (h2Count >= 6 && h2Count <= 12) score += 5;
  else if (h2Count >= 4) score += 3;

  if (h3Count >= 10 && h3Count <= 30) score += 5;
  else if (h3Count >= 5) score += 3;

  // 4. Word count (5 points)
  const wordCount = content.split(/\s+/).length;
  if (wordCount >= 2500 && wordCount <= 4000) score += 5;
  else if (wordCount >= 2000) score += 3;
  else if (wordCount >= 1500) score += 2;

  // 5. FAQ section (5 points)
  if (content.includes('## FAQ') || content.includes('## Frequently Asked Questions')) {
    score += 5;
  } else if (content.match(/\?\s*$/gm)) {
    score += 2;
  }

  return Math.min(score, 30);
}

/**
 * Calculate keyword density
 */
function calculateKeywordDensity(content, keywords) {
  if (keywords.length === 0) return 0;

  const wordCount = content.split(/\s+/).length;
  const keyword = keywords[0].toLowerCase();
  const keywordPattern = new RegExp(keyword.replace(/\s+/g, '\\s+'), 'gi');
  const matches = content.match(keywordPattern) || [];

  return (matches.length / wordCount) * 100;
}

/**
 * Score Readability (20 points)
 */
function scoreReadability(content) {
  let score = 0;

  // 1. Sentence length variety (8 points)
  const sentences = content.match(/[^.!?]+[.!?]+/g) || [];
  const sentenceLengths = sentences.map(s => s.split(/\s+/).length);

  const avgLength = sentenceLengths.reduce((a, b) => a + b, 0) / sentenceLengths.length;
  const variance = sentenceLengths.reduce((sum, len) => sum + Math.pow(len - avgLength, 2), 0) / sentenceLengths.length;

  // Good variety: avg 15-25 words, high variance
  if (avgLength >= 15 && avgLength <= 25 && variance > 50) score += 8;
  else if (avgLength >= 12 && avgLength <= 30) score += 5;
  else score += 2;

  // 2. Paragraph structure (6 points)
  const paragraphs = content.split('\n\n').filter(p => p.trim().length > 0);
  const avgParaLength = paragraphs.reduce((sum, p) => sum + p.split(/\s+/).length, 0) / paragraphs.length;

  if (avgParaLength >= 50 && avgParaLength <= 150) score += 6;
  else if (avgParaLength >= 40 && avgParaLength <= 200) score += 4;
  else score += 2;

  // 3. List usage (6 points)
  const bulletLists = (content.match(/^[-*]\s+/gm) || []).length;
  const numberedLists = (content.match(/^\d+\.\s+/gm) || []).length;

  if (bulletLists + numberedLists >= 20) score += 6;
  else if (bulletLists + numberedLists >= 10) score += 4;
  else score += 2;

  return Math.min(score, 20);
}

/**
 * Score Humanization (20 points)
 */
function scoreHumanization(content) {
  let score = 0;

  // 1. Contractions (4 points)
  const contractions = content.match(/\b(don't|won't|can't|isn't|aren't|wasn't|weren't|hasn't|haven't|hadn't|I'm|you're|we're|they're|it's|that's|there's|here's|what's|who's|where's|when's|why's|how's|I've|you've|we've|they've|I'd|you'd|we'd|they'd|I'll|you'll|we'll|they'll)\b/gi) || [];
  const wordCount = content.split(/\s+/).length;
  const contractionRate = (contractions.length / wordCount) * 100;

  if (contractionRate >= 1.5) score += 4;
  else if (contractionRate >= 0.8) score += 3;
  else if (contractionRate >= 0.3) score += 1;

  // 2. Personal pronouns (4 points)
  const pronouns = content.match(/\b(I|we|you|your|my|our)\b/gi) || [];
  const pronounRate = (pronouns.length / wordCount) * 100;

  if (pronounRate >= 2) score += 4;
  else if (pronounRate >= 1) score += 3;
  else if (pronounRate >= 0.5) score += 1;

  // 3. Conversational transitions (4 points)
  const transitions = [
    "Now, let's", "Here's the thing", "You know what", "Let me tell you",
    "The truth is", "In my experience", "I've found that", "Think about it",
    "Picture this", "Imagine", "Let's be honest", "To be fair"
  ];

  let transitionCount = 0;
  transitions.forEach(t => {
    if (content.toLowerCase().includes(t.toLowerCase())) transitionCount++;
  });

  if (transitionCount >= 5) score += 4;
  else if (transitionCount >= 3) score += 3;
  else if (transitionCount >= 1) score += 1;

  // 4. Emotional language (4 points)
  const emotionalWords = content.match(/\b(love|beautiful|perfect|amazing|wonderful|joy|delight|cherish|treasure|special|unique|meaningful|heartwarming|touching|precious|adorable)\b/gi) || [];
  const emotionRate = (emotionalWords.length / wordCount) * 100;

  if (emotionRate >= 1) score += 4;
  else if (emotionRate >= 0.5) score += 3;
  else if (emotionRate >= 0.2) score += 1;

  // 5. Parenthetical asides (4 points)
  const asides = (content.match(/\([^)]{10,}\)/g) || []).length;

  if (asides >= 5) score += 4;
  else if (asides >= 3) score += 3;
  else if (asides >= 1) score += 1;

  return Math.min(score, 20);
}

/**
 * Score Accuracy (15 points)
 * Note: This is a placeholder - real implementation would check against name database
 */
function scoreAccuracy(content) {
  let score = 15; // Assume accurate by default

  // Check for common accuracy issues
  const issues = [];

  // Flag vague statements
  if (content.match(/\b(probably|maybe|might be|possibly|perhaps|could be)\b/gi)) {
    score -= 2;
    issues.push('Contains uncertain language (probably, maybe, etc.)');
  }

  // Flag missing citations for statistics
  const stats = content.match(/\b\d+%\b/g) || [];
  if (stats.length > 3 && !content.includes('source') && !content.includes('according to')) {
    score -= 3;
    issues.push('Statistics without sources');
  }

  return { score: Math.max(score, 0), issues };
}

/**
 * Score Engagement (15 points)
 */
function scoreEngagement(content) {
  let score = 0;

  // 1. Questions to reader (5 points)
  const questions = (content.match(/\?/g) || []).length;
  if (questions >= 10) score += 5;
  else if (questions >= 5) score += 3;
  else if (questions >= 2) score += 1;

  // 2. Actionable content (5 points)
  const actionWords = content.match(/\b(try|choose|consider|explore|discover|find|search|pick|select|browse)\b/gi) || [];
  if (actionWords.length >= 15) score += 5;
  else if (actionWords.length >= 8) score += 3;
  else score += 1;

  // 3. Examples and anecdotes (5 points)
  const exampleIndicators = [
    'for example', 'for instance', 'such as', 'like when', 'imagine',
    'picture', 'story', 'parent', 'mother', 'father', 'family'
  ];

  let exampleCount = 0;
  exampleIndicators.forEach(indicator => {
    const matches = content.toLowerCase().match(new RegExp(indicator, 'gi')) || [];
    exampleCount += matches.length;
  });

  if (exampleCount >= 10) score += 5;
  else if (exampleCount >= 5) score += 3;
  else score += 1;

  return Math.min(score, 15);
}

/**
 * Generate improvement suggestions
 */
function generateSuggestions(scores, content) {
  const suggestions = [];

  if (scores.seo < 20) {
    suggestions.push('⚠️ SEO: Add more H2/H3 headings for better structure');
    suggestions.push('⚠️ SEO: Optimize keyword density (1-2.5% is ideal)');
    if (!content.includes('## FAQ')) {
      suggestions.push('⚠️ SEO: Add FAQ section for rich snippets');
    }
  }

  if (scores.readability < 15) {
    suggestions.push('⚠️ Readability: Vary sentence length more (mix short and long)');
    suggestions.push('⚠️ Readability: Add more bullet lists for scannability');
  }

  if (scores.humanization < 15) {
    suggestions.push('⚠️ Humanization: Use more contractions (don\'t, won\'t, it\'s)');
    suggestions.push('⚠️ Humanization: Add personal pronouns (I, we, you, your)');
    suggestions.push('⚠️ Humanization: Include conversational transitions');
    suggestions.push('⚠️ Humanization: Add emotional language and personal touches');
  }

  if (scores.accuracy.score < 12) {
    suggestions.push('⚠️ Accuracy: Remove uncertain language (probably, maybe)');
    suggestions.push('⚠️ Accuracy: Add citations for statistics');
  }

  if (scores.engagement < 12) {
    suggestions.push('⚠️ Engagement: Ask more rhetorical questions');
    suggestions.push('⚠️ Engagement: Add actionable tips and examples');
    suggestions.push('⚠️ Engagement: Include parent stories or anecdotes');
  }

  return suggestions;
}

/**
 * Review a blog post
 */
function reviewBlogPost(filePath) {
  console.log(`\n📝 Reviewing: ${path.basename(filePath)}`);
  console.log('='.repeat(60));

  const content = fs.readFileSync(filePath, 'utf-8');

  // Extract metadata from markdown frontmatter if exists
  const metadata = {};
  const frontmatterMatch = content.match(/^---\n([\s\S]+?)\n---/);
  if (frontmatterMatch) {
    const lines = frontmatterMatch[1].split('\n');
    lines.forEach(line => {
      const [key, ...valueParts] = line.split(':');
      if (key && valueParts.length > 0) {
        metadata[key.trim()] = valueParts.join(':').trim();
      }
    });
  }

  // Score each dimension
  const scores = {
    seo: scoreSEO(content, metadata),
    readability: scoreReadability(content),
    humanization: scoreHumanization(content),
    accuracy: scoreAccuracy(content),
    engagement: scoreEngagement(content)
  };

  const totalScore = scores.seo + scores.readability + scores.humanization +
                     scores.accuracy.score + scores.engagement;

  // Print results
  console.log(`\n📊 SCORES:`);
  console.log(`  SEO Optimization:  ${scores.seo}/30  ${'█'.repeat(Math.floor(scores.seo / 3))}${'░'.repeat(10 - Math.floor(scores.seo / 3))}`);
  console.log(`  Readability:       ${scores.readability}/20  ${'█'.repeat(Math.floor(scores.readability / 2))}${'░'.repeat(10 - Math.floor(scores.readability / 2))}`);
  console.log(`  Humanization:      ${scores.humanization}/20  ${'█'.repeat(Math.floor(scores.humanization / 2))}${'░'.repeat(10 - Math.floor(scores.humanization / 2))}`);
  console.log(`  Accuracy:          ${scores.accuracy.score}/15  ${'█'.repeat(Math.floor(scores.accuracy.score / 1.5))}${'░'.repeat(10 - Math.floor(scores.accuracy.score / 1.5))}`);
  console.log(`  Engagement:        ${scores.engagement}/15  ${'█'.repeat(Math.floor(scores.engagement / 1.5))}${'░'.repeat(10 - Math.floor(scores.engagement / 1.5))}`);
  console.log(`\n  🎯 TOTAL SCORE: ${totalScore}/100`);

  // Grade
  let grade = 'F';
  if (totalScore >= 90) grade = 'A+';
  else if (totalScore >= 85) grade = 'A';
  else if (totalScore >= 80) grade = 'B+';
  else if (totalScore >= 75) grade = 'B';
  else if (totalScore >= 70) grade = 'C+';
  else if (totalScore >= 65) grade = 'C';
  else if (totalScore >= 60) grade = 'D';

  console.log(`  📝 Grade: ${grade}`);

  // Accuracy issues
  if (scores.accuracy.issues && scores.accuracy.issues.length > 0) {
    console.log(`\n⚠️ Accuracy Issues:`);
    scores.accuracy.issues.forEach(issue => console.log(`  - ${issue}`));
  }

  // Suggestions
  const suggestions = generateSuggestions(scores, content);
  if (suggestions.length > 0) {
    console.log(`\n💡 Improvement Suggestions:`);
    suggestions.forEach(s => console.log(`  ${s}`));
  }

  console.log('\n' + '='.repeat(60));

  return { scores, totalScore, grade, suggestions };
}

//===========================================
// MAIN EXECUTION
//===========================================

if (require.main === module) {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log('Usage: node automate-blog-review.js <blog-post-file.md>');
    console.log('   or: node automate-blog-review.js --all');
    process.exit(1);
  }

  if (args[0] === '--all') {
    const blogDir = path.join(__dirname, 'blog-posts');
    const files = fs.readdirSync(blogDir).filter(f => f.endsWith('.md') && !f.includes('TEMPLATE'));

    console.log(`\n🔍 Reviewing ${files.length} blog posts...\n`);

    const results = [];
    files.forEach(file => {
      const result = reviewBlogPost(path.join(blogDir, file));
      results.push({ file, ...result });
    });

    // Summary
    console.log(`\n\n📈 SUMMARY REPORT`);
    console.log('='.repeat(60));
    results.forEach(r => {
      console.log(`${r.file.padEnd(50)} ${r.totalScore}/100 (${r.grade})`);
    });

    const avgScore = results.reduce((sum, r) => sum + r.totalScore, 0) / results.length;
    console.log(`\n  Average Score: ${avgScore.toFixed(1)}/100`);

  } else {
    reviewBlogPost(args[0]);
  }
}

module.exports = { reviewBlogPost, scoreSEO, scoreReadability, scoreHumanization, scoreAccuracy, scoreEngagement };
