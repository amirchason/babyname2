/**
 * Test Gender Fix Script (5 names only)
 */

const OpenAI = require('openai');
require('dotenv').config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

async function testEnrichment() {
  const testNames = ['Connor', 'Kaitlyn', 'Malachy', 'Hanako', 'François'];

  const prompt = `You are a name database expert. For each name below, provide the gender (Male, Female, or Unisex), origin, and a brief meaning.

Return ONLY a valid JSON array with this exact structure:
[
  {"name": "Connor", "gender": "Male", "origin": "Irish", "meaning": "Lover of hounds"}
]

Names to process:
${testNames.map(n => `- ${n}`).join('\n')}

Return ONLY the JSON array, no other text.`;

  console.log('🧪 Testing OpenAI enrichment with 5 sample names...\n');
  console.log('Names:', testNames.join(', '), '\n');

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'You are a name database expert. You always return valid JSON arrays with accurate name information.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.3,
      max_tokens: 1000
    });

    const content = response.choices[0].message.content.trim();
    console.log('📥 Raw response:\n', content, '\n');

    const jsonMatch = content.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      throw new Error('No JSON array found in response');
    }

    const enriched = JSON.parse(jsonMatch[0]);
    console.log('✅ Parsed JSON:\n', JSON.stringify(enriched, null, 2), '\n');
    console.log(`✅ Successfully enriched ${enriched.length} names!`);

    return enriched;
  } catch (error) {
    console.error('❌ Error:', error.message);
    throw error;
  }
}

testEnrichment()
  .then(() => console.log('\n✨ Test passed! Ready to run full fix script.'))
  .catch(() => process.exit(1));
