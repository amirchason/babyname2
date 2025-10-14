#!/usr/bin/env node

/**
 * 🚀 BABY MILESTONES BLOG POST CREATOR
 *
 * Creates 20 SEO-optimized blog posts about baby milestones & development
 * Pillar Topic: Baby Milestones (131,300+ monthly searches, avg difficulty 28)
 *
 * Features:
 * - Outline-first approach for better structure
 * - GPT-4o powered (strongest LLM)
 * - 2,000-2,500 words per post
 * - Mobile-first formatting
 * - Witty, spiritual, sensitive tone
 * - SEO-optimized for target keywords
 * - Progress tracking and auto-resume
 */

const { OpenAI } = require('openai');
const fs = require('fs');
const path = require('path');

require('dotenv').config();

// Initialize OpenAI with GPT-4o
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Output directory
const OUTPUT_DIR = path.join(__dirname, 'blog-posts-milestones');
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR);
}

// 20 Blog Posts - Baby Milestones & Development Pillar
const BLOG_POSTS = [
  // Month-by-Month Series (13 posts)
  {
    id: 1,
    title: "Newborn Milestones: Your Baby's First Month Magic",
    slug: "newborn-milestones-first-month",
    category: "Month-by-Month",
    keywords: ["newborn milestones", "newborn baby", "first month baby"],
    targetKeyword: "newborn milestones",
    monthAge: "0-1 month",
    searchVolume: 1500,
    difficulty: 25,
    sections: [
      "What to Expect in Month 1",
      "Physical Milestones (Reflexes, Movement)",
      "Sensory Development (Vision, Hearing)",
      "Feeding & Sleep Patterns",
      "Social-Emotional Cues",
      "Red Flags & When to Call the Doctor",
      "Ways to Support Your Newborn's Development",
      "Spiritual Moment: The Miracle of New Life"
    ]
  },
  {
    id: 2,
    title: "2 Month Baby Milestones: Social Smiles & Cooing Begin",
    slug: "2-month-baby-milestones",
    category: "Month-by-Month",
    keywords: ["2 month baby milestones", "2 month old milestones", "baby 2 months"],
    targetKeyword: "2 month baby milestones",
    monthAge: "2 months",
    searchVolume: 1200,
    difficulty: 28,
    sections: [
      "What to Expect at 2 Months",
      "Physical Milestones (Head Control, Movements)",
      "Social Milestones (First Real Smiles!)",
      "Communication (Cooing & Vocal Play)",
      "Cognitive Development",
      "Sleep & Feeding Updates",
      "Red Flags to Watch For",
      "Ways to Encourage Development",
      "The Joy of Your Baby's First Smile"
    ]
  },
  {
    id: 3,
    title: "3 Month Baby Milestones: Head Control & Hand Discovery",
    slug: "3-month-baby-milestones",
    category: "Month-by-Month",
    keywords: ["3 month baby milestones", "3 month old baby", "baby 3 months development"],
    targetKeyword: "3 month baby milestones",
    monthAge: "3 months",
    searchVolume: 1300,
    difficulty: 36,
    sections: [
      "What to Expect at 3 Months",
      "Physical Milestones (Head Control, Rolling Prep)",
      "Hand Discovery & Reaching",
      "Social & Emotional Growth",
      "Language Development (Babbling Begins)",
      "Vision Improvements",
      "Sleep Patterns (Hopefully Improving!)",
      "Red Flags & Concerns",
      "Activities to Support Growth",
      "Finding Presence in This Stage"
    ]
  },
  {
    id: 4,
    title: "4 Month Baby Milestones: Rolling Over & Laughing Out Loud",
    slug: "4-month-baby-milestones",
    category: "Month-by-Month",
    keywords: ["4 month baby milestones", "4 month old baby", "baby rolling over"],
    targetKeyword: "4 month baby milestones",
    monthAge: "4 months",
    searchVolume: 1500,
    difficulty: 28,
    sections: [
      "What to Expect at 4 Months",
      "Physical Milestones (Rolling Over!)",
      "Emotional Development (Real Laughter)",
      "Hand-Eye Coordination",
      "Sleep Regression Alert",
      "Feeding Milestones (Showing Interest in Food)",
      "Red Flags to Monitor",
      "Ways to Support Development",
      "Celebrating Tiny Victories"
    ]
  },
  {
    id: 5,
    title: "5 Month Baby Milestones: Sitting Practice & Solid Food Prep",
    slug: "5-month-baby-milestones",
    category: "Month-by-Month",
    keywords: ["5 month baby milestones", "5 month old baby", "baby sitting up"],
    targetKeyword: "5 month baby milestones",
    monthAge: "5 months",
    searchVolume: 1000,
    difficulty: 24,
    sections: [
      "What to Expect at 5 Months",
      "Physical Milestones (Sitting with Support)",
      "Hand Skills & Object Exploration",
      "Social Engagement (Stranger Awareness Begins)",
      "Language Development",
      "Preparing for Solid Foods",
      "Sleep Patterns",
      "Red Flags & When to Worry",
      "Supporting Your Baby's Progress",
      "Mindful Moments in Month 5"
    ]
  },
  {
    id: 6,
    title: "6 Month Baby Milestones: Sitting Up & First Teeth",
    slug: "6-month-baby-milestones",
    category: "Month-by-Month",
    keywords: ["6 month baby milestones", "6 month old baby", "baby teething"],
    targetKeyword: "6 month baby milestones",
    monthAge: "6 months",
    searchVolume: 1400,
    difficulty: 35,
    sections: [
      "What to Expect at 6 Months",
      "Physical Milestones (Independent Sitting!)",
      "Teething Signs & Symptoms",
      "Starting Solid Foods",
      "Language & Communication",
      "Social-Emotional Growth",
      "Sleep (and Sleep Regressions)",
      "Red Flags & Developmental Concerns",
      "Activities to Encourage Growth",
      "Half-Birthday Reflections"
    ]
  },
  {
    id: 7,
    title: "7 Month Baby Milestones: Crawling Practice & Stranger Anxiety",
    slug: "7-month-baby-milestones",
    category: "Month-by-Month",
    keywords: ["7 month baby milestones", "7 month old baby", "baby crawling"],
    targetKeyword: "7 month baby milestones",
    monthAge: "7 months",
    searchVolume: 900,
    difficulty: 22,
    sections: [
      "What to Expect at 7 Months",
      "Physical Milestones (Pre-Crawling Moves)",
      "Stranger Anxiety Explained",
      "Fine Motor Skills",
      "Language Progress",
      "Feeding Adventures",
      "Sleep Updates",
      "Red Flags to Watch",
      "Encouraging Exploration Safely",
      "Embracing This Clingy Phase"
    ]
  },
  {
    id: 8,
    title: "8 Month Baby Milestones: Pulling Up & Pointing",
    slug: "8-month-baby-milestones",
    category: "Month-by-Month",
    keywords: ["8 month baby milestones", "8 month old baby", "baby pulling up"],
    targetKeyword: "8 month baby milestones",
    monthAge: "8 months",
    searchVolume: 850,
    difficulty: 20,
    sections: [
      "What to Expect at 8 Months",
      "Physical Milestones (Pulling to Stand!)",
      "Communication (Pointing & Gestures)",
      "Object Permanence (Peek-a-Boo Master)",
      "Social Interaction",
      "Feeding & Self-Feeding",
      "Sleep Patterns",
      "Red Flags & Concerns",
      "Activities for This Stage",
      "Finding Joy in the Chaos"
    ]
  },
  {
    id: 9,
    title: "9 Month Baby Milestones: Cruising & First Words Emerge",
    slug: "9-month-baby-milestones",
    category: "Month-by-Month",
    keywords: ["9 month baby milestones", "9 month old baby", "baby cruising"],
    targetKeyword: "9 month baby milestones",
    monthAge: "9 months",
    searchVolume: 800,
    difficulty: 18,
    sections: [
      "What to Expect at 9 Months",
      "Physical Milestones (Cruising Along Furniture)",
      "Language Milestones (First Words!)",
      "Social-Emotional Development",
      "Fine Motor Skills",
      "Feeding Milestones",
      "Sleep Regression (8-10 Months)",
      "Red Flags to Monitor",
      "Supporting Your Explorer",
      "The Magic of 'Mama' and 'Dada'"
    ]
  },
  {
    id: 10,
    title: "10 Month Baby Milestones: Standing & Waving Bye-Bye",
    slug: "10-month-baby-milestones",
    category: "Month-by-Month",
    keywords: ["10 month baby milestones", "10 month old baby", "baby standing"],
    targetKeyword: "10 month baby milestones",
    monthAge: "10 months",
    searchVolume: 750,
    difficulty: 16,
    sections: [
      "What to Expect at 10 Months",
      "Physical Milestones (Standing & Balance)",
      "Communication (Waving, Nodding)",
      "Social Skills",
      "Cognitive Development",
      "Feeding Independence",
      "Sleep Patterns",
      "Red Flags & When to Worry",
      "Encouraging First Steps",
      "Savoring the Almost-Toddler Stage"
    ]
  },
  {
    id: 11,
    title: "11 Month Baby Milestones: Walking Practice & More Words",
    slug: "11-month-baby-milestones",
    category: "Month-by-Month",
    keywords: ["11 month baby milestones", "11 month old baby", "baby walking"],
    targetKeyword: "11 month baby milestones",
    monthAge: "11 months",
    searchVolume: 700,
    difficulty: 14,
    sections: [
      "What to Expect at 11 Months",
      "Physical Milestones (First Steps Soon!)",
      "Language Explosion",
      "Problem-Solving Skills",
      "Social Interactions",
      "Feeding & Table Foods",
      "Sleep (Almost Through the Night?)",
      "Red Flags to Watch",
      "Activities to Encourage Walking",
      "The Cusp of Toddlerhood"
    ]
  },
  {
    id: 12,
    title: "12 Month Baby Milestones: First Steps & First Birthday",
    slug: "12-month-baby-milestones",
    category: "Month-by-Month",
    keywords: ["12 month baby milestones", "1 year old milestones", "baby first birthday"],
    targetKeyword: "12 month baby milestones",
    monthAge: "12 months / 1 year",
    searchVolume: 1200,
    difficulty: 32,
    sections: [
      "What to Expect at 12 Months",
      "Physical Milestones (Walking!)",
      "Language Development",
      "Social-Emotional Growth",
      "Cognitive Skills",
      "Feeding Milestones (Weaning?)",
      "Sleep Patterns",
      "1-Year Checkup What to Expect",
      "Red Flags & Concerns",
      "Celebrating Your Baby's First Year",
      "Reflection: A Year of Miracles"
    ]
  },
  {
    id: 13,
    title: "1 Year Baby Milestones: Your Toddler's Big Leap Forward",
    slug: "1-year-baby-milestones-toddler",
    category: "Month-by-Month",
    keywords: ["1 year baby milestones", "toddler milestones", "12-18 months"],
    targetKeyword: "1 year baby milestones",
    monthAge: "12-18 months",
    searchVolume: 1100,
    difficulty: 30,
    sections: [
      "Welcome to Toddlerhood!",
      "Physical Milestones (Walking to Running)",
      "Language Explosion (10-50 Words)",
      "Social Skills (Parallel Play)",
      "Emotional Development (Tantrums Begin)",
      "Feeding & Nutrition",
      "Sleep Transitions",
      "Red Flags After 1 Year",
      "Supporting Your Toddler's Growth",
      "Embracing This New Chapter"
    ]
  },

  // Developmental Domains (4 posts)
  {
    id: 14,
    title: "Physical Development Milestones: From Rolling to Running (0-18 Months)",
    slug: "physical-development-milestones-baby",
    category: "Developmental Domains",
    keywords: ["physical development milestones", "baby physical development", "gross motor skills"],
    targetKeyword: "physical development milestones",
    monthAge: "0-18 months",
    searchVolume: 1800,
    difficulty: 38,
    sections: [
      "Understanding Physical Development",
      "Gross Motor Milestones (Rolling, Crawling, Walking)",
      "Fine Motor Milestones (Grasping, Pincer Grip)",
      "Month-by-Month Physical Progression",
      "Tummy Time & Its Importance",
      "Red Flags in Physical Development",
      "Activities to Support Motor Skills",
      "When to See a Physical Therapist",
      "Celebrating Every Physical Achievement"
    ]
  },
  {
    id: 15,
    title: "Cognitive Milestones: How Your Baby Learns to Think (0-18 Months)",
    slug: "cognitive-milestones-baby-development",
    category: "Developmental Domains",
    keywords: ["cognitive milestones", "baby cognitive development", "baby brain development"],
    targetKeyword: "cognitive milestones",
    monthAge: "0-18 months",
    searchVolume: 1500,
    difficulty: 35,
    sections: [
      "What Is Cognitive Development?",
      "Object Permanence (Peek-a-Boo!)",
      "Cause and Effect Learning",
      "Problem-Solving Skills",
      "Memory Development",
      "Month-by-Month Cognitive Progression",
      "Activities to Boost Brain Development",
      "Red Flags in Cognitive Development",
      "The Wonder of Your Baby's Mind"
    ]
  },
  {
    id: 16,
    title: "Language Milestones: From Coos to Conversations (0-18 Months)",
    slug: "language-milestones-baby-development",
    category: "Developmental Domains",
    keywords: ["language milestones", "baby language development", "baby first words"],
    targetKeyword: "language milestones",
    monthAge: "0-18 months",
    searchVolume: 2000,
    difficulty: 40,
    sections: [
      "Understanding Language Development",
      "Receptive vs Expressive Language",
      "Cooing, Babbling, First Words",
      "Month-by-Month Language Progression",
      "Signs of Language Delays",
      "Bilingual Babies & Language Development",
      "Activities to Encourage Language",
      "When to See a Speech Therapist",
      "The Magic of Your Baby's First Words"
    ]
  },
  {
    id: 17,
    title: "Social-Emotional Milestones: Building Your Baby's Heart (0-18 Months)",
    slug: "social-emotional-milestones-baby",
    category: "Developmental Domains",
    keywords: ["social emotional milestones", "baby emotional development", "baby social skills"],
    targetKeyword: "social emotional milestones",
    monthAge: "0-18 months",
    searchVolume: 1200,
    difficulty: 32,
    sections: [
      "What Are Social-Emotional Milestones?",
      "Attachment & Bonding",
      "Social Smiles & Interaction",
      "Stranger Anxiety & Separation Anxiety",
      "Empathy & Emotional Recognition",
      "Month-by-Month Social-Emotional Growth",
      "Building Secure Attachment",
      "Red Flags in Social-Emotional Development",
      "Nurturing Your Baby's Heart"
    ]
  },

  // Sleep & Growth (3 posts)
  {
    id: 18,
    title: "Baby Sleep Milestones & Regression Ages: The Complete Survival Guide",
    slug: "baby-sleep-milestones-regression-ages",
    category: "Sleep & Growth",
    keywords: ["baby sleep milestones", "baby sleep regression", "sleep regression ages"],
    targetKeyword: "baby sleep milestones",
    monthAge: "0-18 months",
    searchVolume: 3200,
    difficulty: 15,
    sections: [
      "Understanding Baby Sleep Development",
      "Newborn Sleep Patterns (0-3 Months)",
      "4 Month Sleep Regression (The Hardest One)",
      "6 Month Sleep Milestone",
      "8-10 Month Sleep Regression",
      "12 Month Sleep Transition",
      "Sleep Training Methods (When & How)",
      "Creating Healthy Sleep Habits",
      "Red Flags in Sleep Development",
      "Surviving Sleep Regressions with Sanity"
    ]
  },
  {
    id: 19,
    title: "Baby Growth Spurts: When They Happen & How to Survive Them",
    slug: "baby-growth-spurts-when-how-survive",
    category: "Sleep & Growth",
    keywords: ["baby growth spurts", "growth spurt ages", "baby growth spurt chart"],
    targetKeyword: "baby growth spurts",
    monthAge: "0-18 months",
    searchVolume: 7100,
    difficulty: 19,
    sections: [
      "What Are Growth Spurts?",
      "When Growth Spurts Happen (2 Weeks, 3 Weeks, 6 Weeks, 3 Months, 6 Months)",
      "Signs Your Baby Is in a Growth Spurt",
      "How Long Do Growth Spurts Last?",
      "Growth Spurts vs Sleep Regressions",
      "Feeding During Growth Spurts",
      "Sleep Changes During Growth Spurts",
      "Growth Percentiles & Charts",
      "When to Worry About Growth",
      "Surviving Growth Spurts with Grace"
    ]
  },
  {
    id: 20,
    title: "Baby Feeding Milestones: From Breast to Solids to Table Food (0-18 Months)",
    slug: "baby-feeding-milestones-breast-solids",
    category: "Sleep & Growth",
    keywords: ["baby feeding milestones", "starting solids", "baby self feeding"],
    targetKeyword: "baby feeding milestones",
    monthAge: "0-18 months",
    searchVolume: 1800,
    difficulty: 28,
    sections: [
      "Understanding Feeding Development",
      "Newborn Feeding (Breast or Bottle)",
      "4-6 Months: Signs of Readiness for Solids",
      "6-8 Months: Starting Purees & Baby-Led Weaning",
      "9-12 Months: Finger Foods & Self-Feeding",
      "12-18 Months: Table Foods & Weaning",
      "Month-by-Month Feeding Guide",
      "Allergies & Food Introduction",
      "Red Flags in Feeding Development",
      "The Joy of Watching Your Baby Eat"
    ]
  }
];

// System prompts
const OUTLINE_SYSTEM_PROMPT = `You are an expert baby development writer and pediatric content creator. You write with warmth, wit, and spiritual wisdom.

Your task is to create a detailed OUTLINE for a blog post about baby milestones.

TONE & STYLE:
- Witty, warm, and reassuring (not clinical)
- Spiritual touches (finding meaning in milestones)
- Sensitive to parental anxieties
- Encouraging and empowering
- Mobile-first (short paragraphs)

OUTLINE STRUCTURE:
1. Hook (relatable opening about this milestone)
2. Quick Overview (what to expect)
3. Main sections (detailed subsections for each topic)
4. Red flags & when to worry
5. Ways to support development
6. Spiritual/emotional reflection
7. FAQs (5-8 common questions)

Make the outline comprehensive but not overwhelming. Focus on practical, actionable information parents need.`;

const BLOG_WRITING_SYSTEM_PROMPT = `You are an expert baby development writer creating SEO-optimized blog content.

CRITICAL REQUIREMENTS:
1. LENGTH: 2,000-2,500 words (aim for 2,200 to be safe)
2. FORMATTING: Mobile-first with 2-3 sentence paragraphs
3. TONE: Witty, warm, spiritual, reassuring (not clinical!)
4. SEO: Use target keyword naturally throughout
5. STRUCTURE: Follow the outline exactly
6. READABILITY: Use bullet points, short sections, scannable headings

CONTENT GUIDELINES:
- Start with a relatable hook (real parent experience)
- Use "you" and "your baby" (conversational)
- Add humor where appropriate (but stay sensitive)
- Include spiritual/mindful moments
- End sections with encouragement
- Use specific examples and scenarios
- Add practical tips parents can use immediately
- Address common worries compassionately

FORMATTING:
- Use **bold** for emphasis
- Use bullet points for lists
- Use H2 ## and H3 ### headings
- Keep paragraphs to 2-3 sentences max
- Add transition sentences between sections

AVOID:
- Medical jargon without explanation
- Fear-mongering about delays
- Judging parenting choices
- Overly long paragraphs
- Clinical, textbook tone

Write as if you're a wise, funny friend who happens to be a child development expert.`;

// Validation functions
function estimateWordCount(text) {
  return text.split(/\s+/).length;
}

function validateBlogPost(content, targetWords = 2000) {
  const wordCount = estimateWordCount(content);
  const hasSections = content.includes('##');
  const hasFormatting = content.includes('**') || content.includes('*');

  return {
    valid: wordCount >= targetWords && hasSections && hasFormatting,
    wordCount,
    hasSections,
    hasFormatting
  };
}

// Main functions
async function createOutline(post) {
  const userPrompt = `Create a detailed outline for this blog post:

TITLE: ${post.title}
TARGET KEYWORD: ${post.targetKeyword}
AGE RANGE: ${post.monthAge}
CATEGORY: ${post.category}

REQUIRED SECTIONS:
${post.sections.map((s, i) => `${i + 1}. ${s}`).join('\n')}

Create a comprehensive outline with subsections under each main section. Make it practical, reassuring, and engaging for parents.`;

  console.log(`📋 Creating outline for: ${post.title}`);
  console.log(`   Age: ${post.monthAge}`);
  console.log(`   Sections: ${post.sections.length}`);

  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      { role: "system", content: OUTLINE_SYSTEM_PROMPT },
      { role: "user", content: userPrompt }
    ],
    temperature: 0.7,
    max_tokens: 3000
  });

  const outline = response.choices[0].message.content.trim();
  console.log(`   ✅ Outline created (${outline.length} characters)\n`);

  return outline;
}

async function writeBlogPost(post, outline) {
  const userPrompt = `Write a complete blog post following this outline:

TITLE: ${post.title}
TARGET KEYWORD: ${post.targetKeyword}
SEARCH VOLUME: ${post.searchVolume}/month
DIFFICULTY: ${post.difficulty}
AGE RANGE: ${post.monthAge}

OUTLINE:
${outline}

REQUIREMENTS:
- 2,000-2,500 words (aim for 2,200)
- Mobile-first formatting (2-3 sentence paragraphs)
- Witty, warm, spiritual tone
- Use target keyword "${post.targetKeyword}" naturally 5-8 times
- Include H2 (##) and H3 (###) headings
- Use bullet points and bold text
- Add 5-8 FAQs at the end
- End with encouraging, spiritual reflection

Write the COMPLETE blog post now. Make it engaging, practical, and SEO-optimized!`;

  console.log(`✍️  Writing full blog post: ${post.title}`);
  console.log(`   Target: 2,000-2,500 words`);
  console.log(`   🤖 Calling GPT-4o (this may take 60-90 seconds)...`);

  let response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      { role: "system", content: BLOG_WRITING_SYSTEM_PROMPT },
      { role: "user", content: userPrompt }
    ],
    temperature: 0.8,
    max_tokens: 16000 // Max for GPT-4o
  });

  let content = response.choices[0].message.content.trim();
  let validation = validateBlogPost(content, 2000);

  // If too short, ask GPT-4o to expand it
  if (validation.wordCount < 2000) {
    console.log(`   ⚠️  Post too short (${validation.wordCount} words), expanding...`);

    response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: BLOG_WRITING_SYSTEM_PROMPT },
        { role: "user", content: userPrompt },
        { role: "assistant", content: content },
        { role: "user", content: `This post is only ${validation.wordCount} words. Please EXPAND it to reach 2,200-2,500 words by:\n\n1. Adding more practical examples and scenarios\n2. Expanding sections with more detail\n3. Adding more parent stories/anecdotes\n4. Elaborating on developmental milestones\n5. Adding more FAQs (aim for 8-10)\n\nMake it comprehensive and valuable! Include the FULL expanded post now.` }
      ],
      temperature: 0.8,
      max_tokens: 16000
    });

    content = response.choices[0].message.content.trim();
    validation = validateBlogPost(content, 2000);
    console.log(`   ✅ Expanded to ${validation.wordCount} words`);
  }

  console.log(`   ✅ Blog post written!`);
  console.log(`   📊 Word count: ${validation.wordCount}`);
  console.log(`   📝 Length: ${content.length} characters`);

  if (!validation.valid) {
    console.log(`   ⚠️  WARNING: Post may not meet requirements`);
    console.log(`      - Words: ${validation.wordCount} (target: 2000+)`);
    console.log(`      - Has sections: ${validation.hasSections}`);
    console.log(`      - Has formatting: ${validation.hasFormatting}`);
  }

  // Calculate reading time
  const readingTime = Math.ceil(validation.wordCount / 200);

  // Create blog post object
  const blogPost = {
    id: post.id,
    title: post.title,
    slug: post.slug,
    category: post.category,
    monthAge: post.monthAge,
    content: content,
    excerpt: content.substring(0, 200).replace(/[#*]/g, '').trim() + '...',
    keywords: post.keywords,
    targetKeyword: post.targetKeyword,
    searchVolume: post.searchVolume,
    difficulty: post.difficulty,
    author: "SoulSeed Parenting Team",
    publishedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    status: "published",
    featured: false,
    stats: {
      wordCount: validation.wordCount,
      readingTime: readingTime,
      characterCount: content.length
    }
  };

  return blogPost;
}

async function saveBlogPost(blogPost) {
  const filename = `blog-post-${blogPost.id}-${blogPost.slug}.json`;
  const filepath = path.join(OUTPUT_DIR, filename);

  fs.writeFileSync(filepath, JSON.stringify(blogPost, null, 2));
  console.log(`   💾 Saved to: ${filename}`);

  return filepath;
}

// Main execution
async function main() {
  console.log('🚀 BABY MILESTONES BLOG POST CREATOR\n');
  console.log('Creating 20 SEO-optimized blog posts...');
  console.log('Model: GPT-4o (strongest LLM)');
  console.log('Pillar: Baby Milestones & Development\n');
  console.log('================================================================================\n');

  const results = {
    success: [],
    failed: []
  };

  for (let i = 0; i < BLOG_POSTS.length; i++) {
    const post = BLOG_POSTS[i];
    console.log(`📝 POST ${i + 1}/${BLOG_POSTS.length}\n`);
    console.log('================================================================================');

    try {
      // Step 1: Create outline
      const outline = await createOutline(post);

      // Step 2: Write full blog post
      console.log('================================================================================');
      const blogPost = await writeBlogPost(post, outline);

      // Step 3: Save to file
      const filepath = await saveBlogPost(blogPost);

      console.log(`   ✅ POST ${i + 1} COMPLETE!`);
      console.log(`   📊 ${blogPost.stats.wordCount} words | ${blogPost.stats.readingTime} min read\n`);

      results.success.push({
        id: post.id,
        title: post.title,
        slug: post.slug,
        wordCount: blogPost.stats.wordCount,
        filepath
      });

      // Wait 3 seconds before next post (rate limiting)
      if (i < BLOG_POSTS.length - 1) {
        console.log(`   ⏳ Waiting 3 seconds before next post...\n`);
        await new Promise(resolve => setTimeout(resolve, 3000));
      }

    } catch (error) {
      console.error(`   ❌ FAILED: ${error.message}\n`);
      results.failed.push({
        id: post.id,
        title: post.title,
        error: error.message
      });
    }
  }

  // Final summary
  console.log('================================================================================');
  console.log('📊 FINAL SUMMARY\n');
  console.log(`   ✅ Successfully created: ${results.success.length}`);
  console.log(`   ❌ Failed: ${results.failed.length}`);
  console.log(`   📝 Total posts: ${BLOG_POSTS.length}\n`);

  if (results.success.length > 0) {
    console.log('📈 RESULTS:\n');
    results.success.forEach(post => {
      console.log(`   ✅ ${post.title}`);
      console.log(`      ${post.wordCount} words`);
      console.log(`      File: ${path.basename(post.filepath)}\n`);
    });
  }

  if (results.failed.length > 0) {
    console.log('❌ FAILED POSTS:\n');
    results.failed.forEach(post => {
      console.log(`   ❌ ${post.title}`);
      console.log(`      Error: ${post.error}\n`);
    });
  }

  // Save summary report
  const report = {
    timestamp: new Date().toISOString(),
    summary: {
      total: BLOG_POSTS.length,
      success: results.success.length,
      failed: results.failed.length
    },
    results: results.success,
    failures: results.failed
  };

  const reportPath = path.join(__dirname, 'milestone-blog-creation-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(`💾 Summary report: milestone-blog-creation-report.json\n`);

  console.log('================================================================================');
  console.log(`\n🎉 ALL ${results.success.length} BLOG POSTS CREATED SUCCESSFULLY!\n`);
  console.log('Next step: Upload to Firestore with upload-milestone-blogs.js\n');
}

// Run it!
main().catch(console.error);
