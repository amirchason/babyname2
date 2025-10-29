const OpenAI = require('openai');
const fs = require('fs');
const path = require('path');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

async function analyzeBlogPost() {
  console.log('🔍 Analyzing blog post with GPT-4o...\n');

  // Read the blog post
  const blogPath = path.join(__dirname, 'blog-posts', 'aesthetic-baby-names.md');
  const blogContent = fs.readFileSync(blogPath, 'utf-8');

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o', // Best model for analysis
      messages: [
        {
          role: 'system',
          content: `You are a meticulous content analyst. Your job is to:
1. Extract ALL baby names from the blog post content
2. Count total unique names (removing duplicates)
3. Check if title claim matches actual count
4. Provide detailed analysis with recommendations

Be extremely thorough and list every single name found.`
        },
        {
          role: 'user',
          content: `Analyze this blog post and tell me:

TITLE CLAIM: "Aesthetic Baby Names: 100 Beautiful, Dreamy Names"

BLOG POST CONTENT:
${blogContent}

ANALYSIS REQUIRED:
1. Extract ALL names from EVERY section (Top 20 Trending + all category sections)
2. Create a complete list of unique names (remove duplicates)
3. Count: Total names listed vs unique names
4. Check: Does the title accurately represent the content?
5. Identify: Any duplicates between "Top 20 Trending" and categorized sections
6. Recommend: Should we change the title or adjust content?

Format your response as:
## NAMES COUNT ANALYSIS
- Total names in "Top 20 Trending 2025": [number]
- Total names in "100 Aesthetic Names" section: [number]
- Total names in entire article: [number]
- Unique names (after removing duplicates): [number]

## DUPLICATES FOUND
[List any names that appear in multiple sections]

## TITLE ACCURACY
[Does "100 Beautiful, Dreamy Names" match the actual content?]

## RECOMMENDATION
[Should we change title to match content, or adjust content to match title?]
[Provide specific new title if needed]`
        }
      ],
      temperature: 0.1, // Low temperature for accuracy
      max_tokens: 2000
    });

    console.log('═══════════════════════════════════════════════════════════');
    console.log('📊 OPENAI GPT-4o ANALYSIS RESULTS');
    console.log('═══════════════════════════════════════════════════════════\n');
    console.log(response.choices[0].message.content);
    console.log('\n═══════════════════════════════════════════════════════════');

    // Save results to file
    const resultsPath = path.join(__dirname, 'blog-analysis-results.txt');
    fs.writeFileSync(resultsPath, response.choices[0].message.content, 'utf-8');
    console.log(`\n✅ Results saved to: ${resultsPath}`);

  } catch (error) {
    console.error('❌ Error analyzing blog post:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
    }
    process.exit(1);
  }
}

analyzeBlogPost();
