require('dotenv').config();
const OpenAI = require('openai');
const fs = require('fs');
const path = require('path');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const BLOG_TEMPLATE = {
  id: '',
  slug: '',
  title: '',
  excerpt: '',
  content: '',
  markdown: '',
  author: {
    name: 'Dr. Amara Okonkwo',
    credentials: 'PhD in Linguistics, Cultural Name Studies Expert',
    bio: 'Dr. Okonkwo specializes in the etymology and cultural significance of names across global traditions, with particular focus on symbolic naming practices.',
  },
  publishedAt: Date.now(),
  updatedAt: Date.now(),
  tags: [],
  category: 'Themes',
  seo: {
    metaTitle: '',
    metaDescription: '',
    keywords: [],
    schema: {},
    faqSchema: {},
  },
  stats: {
    wordCount: 0,
    readingTime: 0,
  },
  featured: true,
  status: 'published',
};

async function generateBlogPost(postNumber, topic, targetKeyword, secondaryKeywords, namesList) {
  console.log(`\n🌟 Generating Post #${postNumber}: ${topic}`);
  console.log(`Target Keyword: ${targetKeyword}`);
  console.log(`Names to include: ${namesList.join(', ')}\n`);

  const prompt = `You are an expert baby name blogger writing for SoulSeed, a baby name app. Write a fun, engaging, SEO-optimized blog post about "${topic}".

TARGET KEYWORD: ${targetKeyword}
SECONDARY KEYWORDS: ${secondaryKeywords.join(', ')}

NAMES TO FEATURE: ${namesList.join(', ')}

REQUIREMENTS:
1. **Length**: 1,000-1,500 words (medium-length, mobile-friendly)
2. **Tone**: Fun, witty, relatable - like chatting with a cool friend. Use Gen Z references, pop culture, emojis (but not excessively)
3. **Format**: HTML only (NO markdown, NO <article> tags)
4. **Structure**:
   - H1 title with emoji
   - H2 sections with emojis
   - Multiple H3 subsections where appropriate
   - Short paragraphs (2-3 sentences max)
   - NO bullet points - use paragraphs instead

5. **Name Format** (CRITICAL):
   Each name MUST follow this exact format:
   <p><strong>Name</strong> (Origin, means X): Fun explanation with personality and context. Mention cultural significance, famous bearers, or why it's trending.</p>

6. **FAQ Section** (at the end):
   Use this exact HTML structure:
   <h2>FAQ: Your [Topic] Questions Answered</h2>

   <div class="faq-item">
     <h3 class="faq-question">Question here?</h3>
     <p class="faq-answer">Answer with name mentions in <strong>tags</strong>.</p>
   </div>

7. **SEO Integration**:
   - Use target keyword in H1, first paragraph, and naturally throughout
   - Include secondary keywords in H2/H3 headers
   - Write for featured snippets (answer questions clearly)

8. **Content Sections** (in order):
   - Why [Topic] Names Are Trending Now (hook with pop culture, celebs, TikTok, etc.)
   - 3-4 themed sections grouping names (e.g., "Classic Lunar Names", "Modern Moon Names", "Rare Celestial Gems")
   - Why These Names Work in 2025 (practical benefits, professional appeal, etc.)
   - FAQ Section (4-5 questions)
   - Final Thoughts: [Creative closing] (encouraging, forward-looking)

9. **Name Coverage**:
   - Feature ALL ${namesList.length} names provided
   - Each name gets 2-3 sentences minimum
   - Include origin, meaning, and personality/context
   - Mention celebrities, characters, or cultural references when relevant

10. **Call-to-Actions**:
    - Mention SoulSeed app organically (never pushy)
    - Reference "174,000+ names" and "Tinder-style swiping"
    - Encourage readers to explore more names

IMPORTANT STYLING NOTES:
- Keep it conversational and fun, not academic
- Use comparisons and metaphors ("like a [pop culture reference]")
- Add humor where appropriate
- Make it scannable with clear headers
- Every name should feel like a mini story

Write the complete HTML content for the blog post body (content field only, starting with <h1>). Do NOT include <article> wrapper.`;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: 'You are an expert SEO content writer specializing in baby name blogs. You write engaging, fun, and informative content that ranks well and converts readers.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.8,
      max_tokens: 4000,
    });

    const content = response.choices[0].message.content.trim();

    // Count names in content
    const nameMatches = content.match(/<strong>([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)<\/strong>/g) || [];
    const uniqueNames = [...new Set(nameMatches.map(m => m.replace(/<\/?strong>/g, '')))];

    // Add names summary section
    const namesSummaryHtml = `

<h2>✨ All ${uniqueNames.length} Names Featured in This Post</h2>

<p>Loved reading about these names? Click the heart ❤️ on any name below to add it to your favorites! Each name is carefully curated and explained throughout this post.</p>

<div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 1rem; margin: 2rem 0;">
${uniqueNames.map(name => `  <p style="margin: 0.5rem 0;"><strong>${name}</strong></p>`).join('\n')}
</div>

<p style="margin-top: 2rem; padding: 1.5rem; background: linear-gradient(135deg, #faf5ff 0%, #fdf2f8 100%); border-radius: 0.75rem; border-left: 4px solid #9333ea;">
💡 <strong>Pro Tip:</strong> Use the SoulSeed app to explore our complete database of 174,000+ names with meanings, origins, and popularity data. Try our Tinder-style swipe feature to discover names you'll love!
</p>`;

    const contentWithSummary = content + namesSummaryHtml;

    // Count words
    const wordCount = contentWithSummary.replace(/<[^>]*>/g, '').split(/\s+/).length;
    const readingTime = Math.ceil(wordCount / 250);

    console.log(`\n✅ Generated ${wordCount} words (${readingTime} min read)`);
    console.log(`✅ Found ${uniqueNames.length} unique names`);

    return {
      content: contentWithSummary,
      wordCount,
      readingTime,
      nameCount: uniqueNames.length,
      names: uniqueNames,
    };
  } catch (error) {
    console.error('❌ Error generating blog post:', error.message);
    throw error;
  }
}

async function generateSEOFields(topic, targetKeyword, secondaryKeywords, content, nameCount) {
  console.log('\n🔍 Generating SEO fields...');

  const prompt = `Based on this blog post about "${topic}", generate SEO metadata:

TARGET KEYWORD: ${targetKeyword}
CONTENT PREVIEW: ${content.substring(0, 500)}...

Generate a JSON object with these fields:
{
  "metaTitle": "SEO-optimized title (60 chars max, include number: ${nameCount}+, include target keyword, include year 2025)",
  "metaDescription": "Compelling meta description (155 chars max, include target keyword, benefits, and ${nameCount}+ names)",
  "keywords": ["array of 8-10 relevant keywords including target and secondary"],
  "tags": ["5 relevant category tags"],
  "faqQuestions": ["array of 4 FAQ questions from the content"]
}

Return ONLY valid JSON, no explanations.`;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: 'You are an SEO expert. Return only valid JSON.' },
        { role: 'user', content: prompt },
      ],
      temperature: 0.7,
      max_tokens: 800,
    });

    let jsonContent = response.choices[0].message.content.trim();

    // Remove markdown code blocks if present
    if (jsonContent.startsWith('```json')) {
      jsonContent = jsonContent.replace(/```json\n?/g, '').replace(/```\n?$/g, '');
    } else if (jsonContent.startsWith('```')) {
      jsonContent = jsonContent.replace(/```\n?/g, '');
    }

    const seoData = JSON.parse(jsonContent);
    console.log('✅ Generated SEO fields');
    return seoData;
  } catch (error) {
    console.error('❌ Error generating SEO fields:', error.message);
    throw error;
  }
}

function createBlogPostObject(postNumber, topic, targetKeyword, generatedContent, seoData) {
  const slug = targetKeyword.toLowerCase().replace(/\s+/g, '-') + '-2025';
  const id = slug;

  // Extract FAQ schema from content
  const faqMatches = [...generatedContent.content.matchAll(/<h3 class="faq-question">(.*?)<\/h3>\s*<p class="faq-answer">(.*?)<\/p>/gs)];
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqMatches.map(match => ({
      '@type': 'Question',
      name: match[1].replace(/<[^>]*>/g, ''),
      acceptedAnswer: {
        '@type': 'Answer',
        text: match[2].replace(/<[^>]*>/g, ''),
      },
    })),
  };

  const publishDate = new Date();
  publishDate.setDate(publishDate.getDate() + (postNumber - 1)); // Stagger publish dates

  const post = {
    ...BLOG_TEMPLATE,
    id,
    slug,
    title: `${topic}: ${seoData.metaTitle.split(':')[1] || seoData.metaTitle}`,
    excerpt: seoData.metaDescription,
    content: generatedContent.content,
    markdown: '## ' + topic + '\n\n' + generatedContent.content.replace(/<[^>]*>/g, '').substring(0, 200) + '...',
    publishedAt: publishDate.getTime(),
    updatedAt: Date.now(),
    tags: seoData.tags,
    seo: {
      metaTitle: seoData.metaTitle,
      metaDescription: seoData.metaDescription,
      keywords: seoData.keywords,
      schema: {
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: seoData.metaTitle,
        description: seoData.metaDescription,
        image: `https://amirchason.github.io/babyname2/images/${slug}-og.jpg`,
        author: {
          '@type': 'Person',
          name: 'Dr. Amara Okonkwo',
          jobTitle: 'Linguistics PhD, Cultural Name Studies Expert',
        },
        publisher: {
          '@type': 'Organization',
          name: 'SoulSeed',
          logo: {
            '@type': 'ImageObject',
            url: 'https://amirchason.github.io/babyname2/logo.png',
          },
        },
        datePublished: publishDate.toISOString().split('T')[0],
        dateModified: new Date().toISOString().split('T')[0],
        mainEntityOfPage: {
          '@type': 'WebPage',
          '@id': `https://amirchason.github.io/babyname2/blog/${slug}`,
        },
        keywords: seoData.keywords.join(', '),
        articleSection: 'Baby Naming',
        wordCount: generatedContent.wordCount,
        inLanguage: 'en-US',
      },
      faqSchema,
    },
    stats: {
      wordCount: generatedContent.wordCount,
      readingTime: generatedContent.readingTime,
    },
  };

  return post;
}

async function main() {
  const postConfig = {
    postNumber: 11,
    topic: 'Names That Mean Moon',
    targetKeyword: 'names that mean moon',
    secondaryKeywords: ['lunar names', 'moon baby names', 'celestial names', 'names meaning moon'],
    namesList: [
      'Luna', 'Selene', 'Artemis', 'Phoebe', 'Diana', 'Chandra', 'Marama',
      'Aylin', 'Kamaria', 'Jaci', 'Hala', 'Qamar', 'Meztli', 'Livana',
      'Ayla', 'Mahina', 'Lucine', 'Pensri', 'Badriyah', 'Celine',
    ],
  };

  try {
    console.log('🚀 Starting blog post generation...\n');

    // Generate content
    const generatedContent = await generateBlogPost(
      postConfig.postNumber,
      postConfig.topic,
      postConfig.targetKeyword,
      postConfig.secondaryKeywords,
      postConfig.namesList
    );

    // Generate SEO fields
    const seoData = await generateSEOFields(
      postConfig.topic,
      postConfig.targetKeyword,
      postConfig.secondaryKeywords,
      generatedContent.content,
      generatedContent.nameCount
    );

    // Create full blog post object
    const blogPost = createBlogPostObject(
      postConfig.postNumber,
      postConfig.topic,
      postConfig.targetKeyword,
      generatedContent,
      seoData
    );

    // Save to file
    const outputPath = path.join(__dirname, 'blog-posts-seo', `post-${postConfig.postNumber}-moon-names.json`);
    fs.writeFileSync(outputPath, JSON.stringify(blogPost, null, 2));

    console.log(`\n✅ Blog post saved to: ${outputPath}`);
    console.log(`\n📊 Final Stats:`);
    console.log(`   - Title: ${blogPost.title}`);
    console.log(`   - Word Count: ${blogPost.stats.wordCount}`);
    console.log(`   - Reading Time: ${blogPost.stats.readingTime} min`);
    console.log(`   - Names Featured: ${generatedContent.nameCount}`);
    console.log(`   - Target Keyword: ${postConfig.targetKeyword}`);
    console.log(`   - SEO Keywords: ${seoData.keywords.length}`);
    console.log(`\n🎉 Post #${postConfig.postNumber} generation complete!`);

  } catch (error) {
    console.error('\n❌ Fatal error:', error);
    process.exit(1);
  }
}

main();
