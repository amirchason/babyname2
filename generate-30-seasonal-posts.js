/**
 * Generate 30 Seasonal Blog Posts using GPT-4o
 * - All posts are unique, humanized, and SEO-optimized
 * - Covers seasons, holidays, and months
 */

const OpenAI = require('openai');
const fs = require('fs');
const path = require('path');

// Initialize OpenAI with GPT-4o
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Define all 30 seasonal blog post topics
const blogTopics = [
  // Seasons (8 posts)
  { slug: 'spring-baby-names', title: 'Spring Baby Names: 100 Fresh Names Blooming with New Life', category: 'seasonal', season: 'spring', keywords: 'spring baby names, fresh names, renewal names' },
  { slug: 'summer-baby-names', title: 'Summer Baby Names: 100 Bright Names Full of Sunshine & Adventure', category: 'seasonal', season: 'summer', keywords: 'summer baby names, beach names, sunshine names' },
  { slug: 'fall-baby-names', title: 'Fall Baby Names: 100 Cozy Names for Autumn Babies', category: 'seasonal', season: 'fall', keywords: 'fall baby names, autumn names, harvest names' },
  { slug: 'winter-baby-names', title: 'Winter Baby Names: 100 Magical Names for Snowy Seasons', category: 'seasonal', season: 'winter', keywords: 'winter baby names, snow names, cozy names' },
  { slug: 'autumn-baby-names', title: 'Autumn Baby Names: 100 Warm Names Inspired by Golden Leaves', category: 'seasonal', season: 'autumn', keywords: 'autumn baby names, harvest names, fall inspired names' },
  { slug: 'spring-flower-baby-names', title: 'Spring Flower Baby Names: 100 Botanical Beauties Blooming Fresh', category: 'seasonal', season: 'spring', keywords: 'flower baby names, botanical names, spring flowers' },
  { slug: 'summer-beach-baby-names', title: 'Summer Beach Baby Names: 100 Coastal Names for Ocean Lovers', category: 'seasonal', season: 'summer', keywords: 'beach baby names, ocean names, coastal names' },
  { slug: 'winter-wonderland-baby-names', title: 'Winter Wonderland Baby Names: 100 Frosty & Festive Picks', category: 'seasonal', season: 'winter', keywords: 'winter wonderland names, festive names, snow names' },

  // Holidays (10 posts)
  { slug: 'christmas-baby-names', title: 'Christmas Baby Names: 100 Festive Names for Holiday Babies', category: 'holiday', holiday: 'christmas', keywords: 'christmas baby names, festive names, holiday names' },
  { slug: 'halloween-baby-names', title: 'Halloween Baby Names: 100 Spooky-Sweet Names for October Babies', category: 'holiday', holiday: 'halloween', keywords: 'halloween baby names, spooky names, october names' },
  { slug: 'easter-baby-names', title: 'Easter Baby Names: 100 Spring Names Celebrating Renewal', category: 'holiday', holiday: 'easter', keywords: 'easter baby names, spring names, renewal names' },
  { slug: 'valentines-day-baby-names', title: "Valentine's Day Baby Names: 100 Romantic Names Full of Love", category: 'holiday', holiday: 'valentines', keywords: 'valentines baby names, love names, romantic names' },
  { slug: 'thanksgiving-baby-names', title: 'Thanksgiving Baby Names: 100 Grateful Names for November Babies', category: 'holiday', holiday: 'thanksgiving', keywords: 'thanksgiving baby names, grateful names, harvest names' },
  { slug: 'new-year-baby-names', title: 'New Year Baby Names: 100 Fresh Start Names for January Babies', category: 'holiday', holiday: 'newyear', keywords: 'new year baby names, fresh start names, january names' },
  { slug: 'fourth-of-july-baby-names', title: 'Fourth of July Baby Names: 100 Patriotic Names for American Pride', category: 'holiday', holiday: 'july4th', keywords: 'fourth of july names, patriotic names, american names' },
  { slug: 'st-patricks-day-baby-names', title: "St. Patrick's Day Baby Names: 100 Irish Names Full of Luck", category: 'holiday', holiday: 'stpatricks', keywords: 'st patricks day names, irish names, lucky names' },
  { slug: 'hanukkah-baby-names', title: 'Hanukkah Baby Names: 100 Jewish Names Full of Light & Tradition', category: 'holiday', holiday: 'hanukkah', keywords: 'hanukkah baby names, jewish names, hebrew names' },
  { slug: 'diwali-baby-names', title: 'Diwali Baby Names: 100 Names Celebrating the Festival of Lights', category: 'holiday', holiday: 'diwali', keywords: 'diwali baby names, indian names, festival of lights names' },

  // Months (12 posts)
  { slug: 'january-baby-names', title: 'January Baby Names: 100 Names for New Beginnings', category: 'month', month: 'january', keywords: 'january baby names, new year names, winter names' },
  { slug: 'february-baby-names', title: 'February Baby Names: 100 Names Full of Love & Warmth', category: 'month', month: 'february', keywords: 'february baby names, valentines names, winter names' },
  { slug: 'march-baby-names', title: 'March Baby Names: 100 Names Welcoming Spring', category: 'month', month: 'march', keywords: 'march baby names, spring names, rebirth names' },
  { slug: 'april-baby-names', title: 'April Baby Names: 100 Names Blooming with Possibility', category: 'month', month: 'april', keywords: 'april baby names, spring names, rain names' },
  { slug: 'may-baby-names', title: 'May Baby Names: 100 Names Bursting with Life', category: 'month', month: 'may', keywords: 'may baby names, spring names, flower names' },
  { slug: 'june-baby-names', title: 'June Baby Names: 100 Names Celebrating Summer Sunshine', category: 'month', month: 'june', keywords: 'june baby names, summer names, sunshine names' },
  { slug: 'july-baby-names', title: 'July Baby Names: 100 Names Full of Freedom & Fire', category: 'month', month: 'july', keywords: 'july baby names, summer names, independence names' },
  { slug: 'august-baby-names', title: 'August Baby Names: 100 Names Radiating Late Summer Warmth', category: 'month', month: 'august', keywords: 'august baby names, summer names, warm names' },
  { slug: 'september-baby-names', title: 'September Baby Names: 100 Names for Harvest Season Babies', category: 'month', month: 'september', keywords: 'september baby names, autumn names, harvest names' },
  { slug: 'october-baby-names', title: 'October Baby Names: 100 Names for Autumn Magic', category: 'month', month: 'october', keywords: 'october baby names, fall names, halloween names' },
  { slug: 'november-baby-names', title: 'November Baby Names: 100 Names for Cozy & Grateful Hearts', category: 'month', month: 'november', keywords: 'november baby names, autumn names, thanksgiving names' },
  { slug: 'december-baby-names', title: 'December Baby Names: 100 Names for Winter Wonders', category: 'month', month: 'december', keywords: 'december baby names, winter names, holiday names' }
];

// Function to generate a single blog post using GPT-4o
async function generateBlogPost(topic, index, total) {
  console.log(`\n🔄 Generating ${index + 1}/${total}: ${topic.title}...`);

  const systemPrompt = `You are an expert baby name blogger who writes engaging, personal, and SEO-optimized content.
Your writing style is:
- Warm, conversational, and authentic (like talking to a friend)
- Personal anecdotes and relatable experiences
- Encouraging and supportive tone
- Natural flow with varied sentence structure
- Use of contractions, rhetorical questions, and emotional language
- SEO-optimized with natural keyword integration
- Original and unique - never generic or templated

Create a complete, original blog post that feels genuinely human-written, not AI-generated.`;

  const userPrompt = `Create a complete blog post about ${topic.title}.

**CRITICAL REQUIREMENTS:**
1. **100% ORIGINAL** - Do NOT repeat content from other posts. Each name list must be completely unique.
2. **HUMANIZED** - Write like a real person sharing their naming journey, not a corporate blog
3. **PERSONAL** - Include specific anecdotes, emotions, and relatable moments
4. **SEO OPTIMIZED** - Naturally incorporate: ${topic.keywords}
5. **ENGAGING INTRO** - Start with a unique hook (NO "Hey there" or "Are you on the hunt")

**STRUCTURE:**
# ${topic.title}

[Opening paragraph: 3-4 sentences with a unique, engaging hook that captures the ${topic.season || topic.holiday || topic.month} feeling. Use sensory details, emotions, or a personal moment. Make it completely different from any other introduction you've written.]

## What Makes ${topic.season || topic.holiday || topic.month} Names Special?

[2-3 paragraphs explaining the unique characteristics, cultural significance, and emotional resonance of ${topic.season || topic.holiday || topic.month} names. Include personal experiences or observations.]

## Top 20 ${topic.season || topic.holiday || topic.month} Names for 2025

[Create a list of 20 completely unique names that fit the theme. Include mix of boys and girls names.]

1. **[Name]**
2. **[Name]**
[... continue to 20]

## ${topic.season || topic.holiday || topic.month} Names by Theme

### Nature-Inspired ${topic.season || topic.holiday || topic.month} Names (20 names)

[Intro paragraph about nature connection, then list 20 unique names]

### Traditional ${topic.season || topic.holiday || topic.month} Names (20 names)

[Intro paragraph about tradition, then list 20 unique names]

### Modern ${topic.season || topic.holiday || topic.month} Names (20 names)

[Intro paragraph about contemporary appeal, then list 20 unique names]

### Unique ${topic.season || topic.holiday || topic.month} Names (20 names)

[Intro paragraph about standing out, then list 20 unique names]

## The Symbolism Behind ${topic.season || topic.holiday || topic.month} Names

[2-3 paragraphs discussing deeper meanings, cultural connections, and emotional significance]

## How to Choose the Perfect ${topic.season || topic.holiday || topic.month} Name

[Practical advice in 2-3 paragraphs with personal insights]

## FAQs About ${topic.season || topic.holiday || topic.month} Baby Names

### [Question 1]

[Answer paragraph]

### [Question 2]

[Answer paragraph]

### [Question 3]

[Answer paragraph]

### [Question 4]

[Answer paragraph]

### [Question 5]

[Answer paragraph]

## Conclusion

[Warm, encouraging 2-3 paragraph conclusion that ties everything together and sends readers off feeling inspired and confident]

**REMEMBER:**
- Every name must be unique to THIS post
- Every introduction must use a completely different opening strategy
- Write like you're genuinely excited to share these names with a friend
- Make it feel personal, authentic, and original`;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.9, // Higher creativity for more unique content
      max_tokens: 4000
    });

    const content = response.choices[0].message.content;

    // Save to file
    const outputDir = path.join(__dirname, 'blog-posts-seasonal');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const filename = path.join(outputDir, `${topic.slug}.md`);
    fs.writeFileSync(filename, content, 'utf8');

    console.log(`✅ Saved: ${filename}`);
    return { success: true, filename };

  } catch (error) {
    console.error(`❌ Error generating ${topic.slug}:`, error.message);
    return { success: false, error: error.message };
  }
}

// Main function to generate all posts
async function generateAllPosts() {
  console.log('🚀 Starting generation of 30 seasonal blog posts with GPT-4o...\n');
  console.log('📝 All posts will be humanized, SEO-optimized, and completely original.\n');

  const results = [];
  const delay = 2000; // 2 second delay between requests to avoid rate limits

  for (let i = 0; i < blogTopics.length; i++) {
    const result = await generateBlogPost(blogTopics[i], i, blogTopics.length);
    results.push(result);

    // Delay between requests (except for the last one)
    if (i < blogTopics.length - 1) {
      console.log(`⏳ Waiting 2 seconds before next request...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 GENERATION SUMMARY');
  console.log('='.repeat(60));

  const successful = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;

  console.log(`✅ Successful: ${successful}/${blogTopics.length}`);
  console.log(`❌ Failed: ${failed}/${blogTopics.length}`);

  if (failed > 0) {
    console.log('\n❌ Failed posts:');
    results.filter(r => !r.success).forEach((r, i) => {
      console.log(`   ${i + 1}. ${blogTopics[results.indexOf(r)].slug}: ${r.error}`);
    });
  }

  console.log('\n✨ All posts saved to: blog-posts-seasonal/');
  console.log('🎉 Generation complete!\n');
}

// Run the generator
generateAllPosts().catch(console.error);
