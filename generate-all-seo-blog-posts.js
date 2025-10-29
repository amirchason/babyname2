#!/usr/bin/env node

/**
 * 🚀 AUTOMATED BLOG POST GENERATOR
 *
 * Generates 9 remaining blog posts using templates with:
 * - Built-in humanization (contractions, personal voice, emotional language)
 * - SEO optimization (keywords, structure, meta tags)
 * - Fact-checking against name database
 * - Auto-review and iteration until score >= 85/100
 *
 * Uses OpenAI GPT-4o-mini for cost-effective generation
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const { reviewBlogPost } = require('./automate-blog-review.js');

require('dotenv').config();

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

if (!OPENAI_API_KEY) {
  console.error('❌ OPENAI_API_KEY not found in .env file!');
  process.exit(1);
}

//===========================================
// BLOG POST TEMPLATES
//===========================================

const BLOG_TEMPLATES = [
  {
    id: 2,
    title: 'Baby Names That Mean Strength: 60 Powerful Names for Your Warrior',
    slug: 'baby-names-that-mean-strength',
    targetKeyword: 'baby names that mean strength',
    searchVolume: 1900,
    category: 'Baby Names',
    outline: `
# Introduction (300 words)
- Hook: Why parents choose strength-themed names
- Personal story about resilience
- Promise: 60 names across cultures with meanings

## Why Choose a Name That Means Strength?

## Top 10 Most Popular Strength Names

## 60 Baby Names That Mean Strength

### For Boys (30 names)
#### Classic Strength Names (10)
#### Modern Warrior Names (10)
#### International Strength Names (10)

### For Girls (20 names)
#### Strong Girl Names (10)
#### Fierce Warrior Goddesses (10)

### Gender Neutral Strength Names (10)

## FAQ Section (400 words)
- What are the most popular names meaning strength?
- Are strength names suitable for girls?
- Which culture has the strongest baby names?
- Can strength names affect personality?
- How do I choose between similar strength names?

## Conclusion (200 words)
`
  },
  {
    id: 3,
    title: 'Gender Neutral Baby Names: 80 Perfect Unisex Names for 2025',
    slug: 'gender-neutral-baby-names',
    targetKeyword: 'gender neutral baby names',
    searchVolume: 8100,
    category: 'Baby Names',
    outline: `
# Introduction (350 words)
- Modern trend toward gender-neutral names
- Benefits of unisex names
- Personal perspective on name flexibility

## Why Gender Neutral Names Are Trending

## Top 20 Most Popular Unisex Names 2025

## 80 Gender Neutral Baby Names by Style

### Nature-Inspired Unisex Names (15)
### Modern Unisex Names (15)
### Classic Unisex Names (15)
### Unique Unisex Names (15)
### International Unisex Names (10)
### Short Unisex Names (10)

## FAQ Section (450 words)
- Are gender neutral names becoming more popular?
- What are the benefits of unisex names?
- Do gender neutral names affect child development?
- Which gender neutral names work best?
- How to choose a truly unisex name?

## Conclusion (200 words)
`
  },
  {
    id: 4,
    title: 'Short Baby Girl Names: 70 Beautiful 3-4 Letter Names',
    slug: 'short-baby-girl-names',
    targetKeyword: 'short baby girl names',
    searchVolume: 1600,
    category: 'Baby Names',
    outline: `
# Introduction (300 words)
- Charm of short, sweet names
- Easy to spell and pronounce
- Timeless appeal

## Why Short Names Work So Well

## Top 15 Most Popular Short Girl Names

## 70 Short Baby Girl Names

### 3-Letter Girl Names (25)
#### Classic 3-Letter Names (10)
#### Modern 3-Letter Names (10)
#### Unique 3-Letter Names (5)

### 4-Letter Girl Names (35)
#### Timeless 4-Letter Names (10)
#### Trendy 4-Letter Names (10)
#### International 4-Letter Names (10)
#### Rare 4-Letter Names (5)

### Nicknames That Stand Alone (10)

## FAQ Section (400 words)
- What are the shortest girl names?
- Are short names better for babies?
- Do short names pair well with long surnames?
- Which short names are trending?
- Can short names be formal enough?

## Conclusion (200 words)
`
  },
  {
    id: 5,
    title: 'Irish Baby Names: 100 Beautiful Names from Ireland with Meanings',
    slug: 'irish-baby-names',
    targetKeyword: 'irish baby names',
    searchVolume: 14800,
    category: 'Baby Names',
    outline: `
# Introduction (400 words)
- Rich Irish naming tradition
- Celtic mythology and history
- Pronunciation guide note

## The Beauty of Irish Names

## Top 20 Most Popular Irish Names in 2025

## 100 Irish Baby Names with Meanings

### Irish Boy Names (40)
#### Traditional Irish Boy Names (15)
#### Modern Irish Boy Names (15)
#### Irish Mythological Names (10)

### Irish Girl Names (40)
#### Classic Irish Girl Names (15)
#### Trendy Irish Girl Names (15)
#### Irish Goddess Names (10)

### Gender Neutral Irish Names (20)

## Pronunciation Guide for Irish Names

## FAQ Section (500 words)
- How do you pronounce Irish names?
- What are the most popular Irish names?
- Are Irish names difficult to spell?
- What's the difference between Irish and Scottish names?
- Can non-Irish parents use Irish names?

## Conclusion (250 words)
`
  },
  {
    id: 6,
    title: 'Baby Name Trends 2025: The Ultimate Guide to This Year\'s Hottest Names',
    slug: 'baby-name-trends-2025',
    targetKeyword: 'baby name trends 2025',
    searchVolume: 18100,
    category: 'Baby Names',
    outline: `
# Introduction (350 words)
- What's trending in baby names
- Data sources and analysis
- Predictions for 2025

## Top 5 Baby Name Trends for 2025

### Trend 1: Nature Names (15 examples)
### Trend 2: Vintage Revival (15 examples)
### Trend 3: Gender-Neutral Names (15 examples)
### Trend 4: Short and Sweet (15 examples)
### Trend 5: International Influence (15 examples)

## Declining Trends (What's Fading Out)

## Rising Stars: Names to Watch in 2025

## Celebrity Baby Names of 2024-2025

## Regional Differences in Naming Trends

## FAQ Section (500 words)
- What are the most popular baby names for 2025?
- Are vintage names making a comeback?
- What celebrity baby names influenced trends?
- How do naming trends differ by region?
- Will my trendy name choice become too common?

## Conclusion (250 words)
`
  },
  {
    id: 7,
    title: 'How to Choose the Perfect Baby Name: A Complete Guide for Parents',
    slug: 'how-to-choose-baby-name',
    targetKeyword: 'how to choose baby name',
    searchVolume: 4400,
    category: 'Baby Names',
    outline: `
# Introduction (300 words)
- Challenge of choosing "the one"
- Personal experience and insights
- Framework for decision-making

## Step-by-Step Guide to Choosing a Baby Name

### Step 1: Establish Your Criteria
### Step 2: Create Your Long List (30 names)
### Step 3: Consider These 10 Factors
### Step 4: Test Drive Your Top Names
### Step 5: Get Feedback (But Trust Your Gut)
### Step 6: Make The Final Decision

## Common Naming Mistakes to Avoid

## Real Parent Stories: How They Chose

## Tools and Resources for Name Selection

## FAQ Section (450 words)
- When should you start choosing a name?
- How many names should be on your shortlist?
- Should you reveal the name before birth?
- What if partners can't agree on a name?
- Can you change your mind after birth?

## Conclusion (200 words)
`
  },
  {
    id: 8,
    title: 'Celebrity Baby Names 2024-2025: 80 Unique Names from Famous Parents',
    slug: 'celebrity-baby-names-2024-2025',
    targetKeyword: 'celebrity baby names',
    searchVolume: 9900,
    category: 'Baby Names',
    outline: `
# Introduction (300 words)
- Celebrity influence on naming trends
- Most surprising celebrity baby names
- Whether to follow celebrity trends

## 80 Celebrity Baby Names from 2024-2025

### Celebrity Boy Names (30)
#### Unique Celebrity Boy Names (15)
#### Classic Celebrity Choices (15)

### Celebrity Girl Names (30)
#### Bold Celebrity Girl Names (15)
#### Elegant Celebrity Picks (15)

### Celebrity Twin Names (10)
### Most Controversial Celebrity Names (10)

## What We Can Learn From Celebrity Names

## Celebrity Naming Trends Analysis

## FAQ Section (400 words)
- What are the most unique celebrity baby names?
- Do celebrity names influence regular parents?
- Which celebrities have the weirdest baby names?
- Are celebrity names suitable for everyday kids?
- What's the most popular celebrity baby name?

## Conclusion (200 words)
`
  },
  {
    id: 9,
    title: 'Baby Names from Nature: 90 Beautiful Earth-Inspired Names',
    slug: 'baby-names-from-nature',
    targetKeyword: 'baby names from nature',
    searchVolume: 2400,
    category: 'Baby Names',
    outline: `
# Introduction (300 words)
- Connection to natural world
- Why nature names resonate
- Growing trend analysis

## Why Nature Names Are Perfect for Babies

## 90 Nature-Inspired Baby Names

### Flower and Plant Names (20)
#### Girls (15)
#### Boys/Unisex (5)

### Tree and Forest Names (15)
### Water and Ocean Names (15)
### Sky and Weather Names (15)
### Animal-Inspired Names (15)
### Gemstone and Earth Names (10)

## Seasonal Nature Names

## FAQ Section (400 words)
- What are the most popular nature names?
- Are nature names too trendy?
- Do nature names work for boys?
- Which culture has the best nature names?
- Can nature names be professional?

## Conclusion (200 words)
`
  },
  {
    id: 10,
    title: 'Twin Baby Names: 100 Perfect Pairs That Go Together',
    slug: 'twin-baby-names',
    targetKeyword: 'twin baby names',
    searchVolume: 5400,
    category: 'Baby Names',
    outline: `
# Introduction (300 words)
- Unique challenge of naming twins
- Balance between coordination and individuality
- Personal twin naming stories

## How to Choose Twin Names That Work

## 100 Twin Name Combinations

### Boy-Boy Twin Names (25 pairs)
#### Matching Style Boy Twins (10)
#### Themed Boy Twins (10)
#### Complementary Boy Twins (5)

### Girl-Girl Twin Names (25 pairs)
#### Matching Style Girl Twins (10)
#### Themed Girl Twins (10)
#### Complementary Girl Twins (5)

### Boy-Girl Twin Names (25 pairs)
#### Balanced Unisex Pairs (10)
#### Classic Pairs (10)
#### Modern Pairs (5)

### Triplet Names (10 sets)

## Twin Naming Mistakes to Avoid

## FAQ Section (450 words)
- Should twin names rhyme?
- Should twins have similar or different names?
- What are the best twin name themes?
- Do twins like having coordinated names?
- How to avoid names that are too matchy?

## Conclusion (200 words)
`
  }
];

//===========================================
// HUMANIZATION SYSTEM PROMPT
//===========================================

const HUMANIZATION_INSTRUCTIONS = `
You are a professional parent blogger writing engaging, helpful content about baby names. Your writing style is:

HUMANIZATION REQUIREMENTS:
1. Use contractions naturally (don't, won't, it's, you're, I've, we're, that's)
2. Include personal pronouns frequently (I, we, you, your, my, our)
3. Add conversational transitions:
   - "Now, let's talk about..."
   - "Here's the thing..."
   - "You know what I've noticed?"
   - "Let me tell you..."
   - "Think about it this way..."
4. Include emotional language:
   - love, beautiful, perfect, cherish, treasure, special, meaningful
5. Add parenthetical asides for personality:
   - "(and who doesn't love that?)"
   - "(trust me on this one)"
   - "(I'm obsessed with this name!)"
6. Use rhetorical questions to engage readers
7. Share brief personal anecdotes or parent quotes
8. Vary sentence length: mix short punchy sentences with longer flowing ones
9. Be warm, enthusiastic, and supportive
10. Avoid corporate/formal language - write like talking to a friend

ACCURACY REQUIREMENTS:
- Be confident (avoid "probably," "maybe," "might be")
- Cite sources for statistics
- Double-check name origins and meanings
- Respect cultural context

SEO REQUIREMENTS:
- Use target keyword naturally 8-12 times
- Include keyword in first paragraph, conclusion, and 2-3 H2 headings
- Create descriptive H2/H3 structure
- Write 2,500-3,500 words
- Include comprehensive FAQ section
- End with actionable conclusion
`;

//===========================================
// OPENAI API CALL
//===========================================

function callOpenAI(prompt, maxTokens = 5000) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: HUMANIZATION_INSTRUCTIONS
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.8,
      max_tokens: maxTokens,
      presence_penalty: 0.3,
      frequency_penalty: 0.3
    });

    const options = {
      hostname: 'api.openai.com',
      path: '/v1/chat/completions',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Length': data.length
      }
    };

    const req = https.request(options, (res) => {
      let body = '';

      res.on('data', (chunk) => {
        body += chunk;
      });

      res.on('end', () => {
        try {
          const response = JSON.parse(body);
          if (response.error) {
            reject(new Error(response.error.message));
          } else {
            resolve(response.choices[0].message.content);
          }
        } catch (error) {
          reject(error);
        }
      });
    });

    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

//===========================================
// BLOG POST GENERATION
//===========================================

async function generateBlogPost(template) {
  console.log(`\n📝 Generating: ${template.title}`);
  console.log(`   Target: ${template.targetKeyword} (${template.searchVolume}/mo)`);
  console.log('='.repeat(70));

  let prompt = `
Write a comprehensive blog post about "${template.title}".

TARGET KEYWORD: ${template.targetKeyword}
SEARCH VOLUME: ${template.searchVolume} monthly searches
WORD COUNT: 2,500-3,500 words

OUTLINE:
${template.outline}

REQUIREMENTS:
1. Follow the outline structure exactly
2. Use the target keyword "${template.targetKeyword}" 8-12 times naturally
3. Include keyword in: title, first paragraph, 2-3 H2 headings, conclusion
4. Write in Markdown format with proper H2 (##) and H3 (###) structure
5. Make it HIGHLY HUMANIZED (contractions, personal voice, emotional language)
6. Include specific name examples with origins and meanings
7. Add 8-10 FAQ questions at the end
8. Be warm, engaging, and helpful (like talking to a friend)
9. Vary sentence length and paragraph structure
10. Include parenthetical asides for personality

Start directly with the markdown content (no meta-commentary).
`;

  let attempt = 1;
  let content = null;
  let score = 0;

  while (attempt <= 2 && score < 85) {
    console.log(`\n  🤖 Attempt ${attempt}: Generating content...`);

    try {
      content = await callOpenAI(prompt);

      // Save draft
      const draftPath = path.join(__dirname, 'blog-posts', `${template.slug}-draft-${attempt}.md`);
      fs.writeFileSync(draftPath, content);

      // Review
      console.log(`\n  📊 Reviewing generated content...`);
      const review = reviewBlogPost(draftPath);
      score = review.totalScore;

      console.log(`\n  ✅ Score: ${score}/100 (${review.grade})`);

      if (score >= 85) {
        console.log(`  🎉 Excellent! Meets quality threshold.`);
        // Save as final
        const finalPath = path.join(__dirname, 'blog-posts', `${template.slug}.md`);
        fs.writeFileSync(finalPath, content);
        console.log(`  💾 Saved: ${template.slug}.md`);
        return { success: true, score, path: finalPath };
      } else {
        console.log(`  ⚠️ Score below 85. Suggestions:`);
        review.suggestions.forEach(s => console.log(`     ${s}`));

        if (attempt < 2) {
          console.log(`\n  🔄 Regenerating with improvements...`);
          // Add specific feedback to prompt for next attempt
          const improvementPrompt = `
${prompt}

PREVIOUS ATTEMPT FEEDBACK:
Score: ${score}/100
Issues to fix:
${review.suggestions.map(s => `- ${s.replace('⚠️ ', '')}`).join('\n')}

Please address these specific issues in this rewrite.
`;
          prompt = improvementPrompt;
        }
      }

      attempt++;

    } catch (error) {
      console.error(`  ❌ Error: ${error.message}`);
      await new Promise(resolve => setTimeout(resolve, 2000));
      attempt++;
    }
  }

  // If we get here, save best attempt even if below 85
  if (content) {
    const finalPath = path.join(__dirname, 'blog-posts', `${template.slug}.md`);
    fs.writeFileSync(finalPath, content);
    console.log(`  💾 Saved: ${template.slug}.md (Score: ${score}/100)`);
    return { success: true, score, path: finalPath, needsReview: true };
  }

  return { success: false };
}

//===========================================
// MAIN EXECUTION
//===========================================

async function main() {
  console.log('\n🚀 AUTOMATED BLOG POST GENERATOR');
  console.log('='.repeat(70));
  console.log(`Generating ${BLOG_TEMPLATES.length} blog posts with humanization...`);

  const results = [];

  for (const template of BLOG_TEMPLATES) {
    const result = await generateBlogPost(template);
    results.push({ template, ...result });

    // Rate limit: 1.5 second delay between posts
    await new Promise(resolve => setTimeout(resolve, 1500));
  }

  // Summary
  console.log('\n\n📈 GENERATION SUMMARY');
  console.log('='.repeat(70));

  results.forEach(r => {
    const status = r.success ? '✅' : '❌';
    const needsReview = r.needsReview ? ' ⚠️ NEEDS REVIEW' : '';
    console.log(`${status} ${r.template.slug.padEnd(40)} ${r.score || 0}/100${needsReview}`);
  });

  const avgScore = results.reduce((sum, r) => sum + (r.score || 0), 0) / results.length;
  const successCount = results.filter(r => r.success).length;

  console.log(`\n  Success Rate: ${successCount}/${results.length}`);
  console.log(`  Average Score: ${avgScore.toFixed(1)}/100`);

  console.log('\n✨ Generation complete! Blog posts saved to blog-posts/');
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { generateBlogPost, BLOG_TEMPLATES };
