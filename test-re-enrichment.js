#!/usr/bin/env node
/**
 * Test Re-enrichment on Sample Names
 * Tests the improved prompts on a few Modern origin names
 */

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';
const MODEL = 'gpt-4o-mini';

const STANDARD_ORIGINS = [
  'Hebrew', 'Greek', 'Latin', 'Arabic', 'Germanic', 'Celtic', 'English',
  'French', 'Spanish', 'Italian', 'Irish', 'Scottish', 'Welsh', 'Norse',
  'Russian', 'Polish', 'Dutch', 'Portuguese', 'Indian', 'Japanese',
  'Chinese', 'Korean', 'Filipino', 'African', 'Persian', 'Turkish', 'Hawaiian',
  'Native-American', 'Biblical', 'Slavic'
];

// Test samples
const testNames = [
  { name: 'Kiks', country: 'PH', oldMeaning: 'Modern creative name', oldOrigin: 'Modern Invented' },
  { name: 'Juletzy', country: 'EC', oldMeaning: 'Youthful', oldOrigin: 'Modern Invented' },
  { name: 'Criis', country: 'ES', oldMeaning: 'Modern Invented', oldOrigin: 'Modern Invented' }
];

function buildBatchPrompt(names, countryHints) {
  const originsStr = STANDARD_ORIGINS.join(', ');

  const namesWithHints = names.map((name, i) =>
    countryHints[i] ? `${name} (${countryHints[i]})` : name
  );

  return `Analyze the following baby names. For EACH name, provide:
1. A concise, accurate meaning (1-4 words maximum, can be multiple meanings separated by semicolon)
2. The cultural origin(s) from this list: ${originsStr}
3. Optional brief cultural context (max 10 words)

CRITICAL INSTRUCTIONS:
- NEVER use "Modern" as an origin - dig deeper to find the real cultural root
- Analyze name structure, phonetics, etymology, and linguistic patterns
- If country code is provided (e.g., PR, CO, ES), use it as a strong hint
- Multiple origins are allowed if name has mixed heritage (e.g., "Spanish, Latin")
- Look for root words, suffixes, prefixes that reveal true origin
- Spanish/Portuguese variants often appear in Latin American countries (PR, CO, EC, MX, etc.)

Return a valid JSON array with EXACTLY ${names.length} objects, one for each name in the SAME ORDER.

Format as JSON array:
[
  {
    "name": "Daliangelis",
    "meaning": "angel's gift",
    "origin": "Spanish",
    "culturalContext": "Puerto Rican compound name"
  }
]

Names to analyze: ${namesWithHints.join(', ')}

IMPORTANT:
- Return EXACTLY ${names.length} objects
- Keep meanings concise (1-4 words, or multiple separated by semicolon)
- AVOID "Modern" - find the actual cultural origin
- Use country hints when provided
- Maintain the exact order of input names
- Return valid JSON only, no markdown or explanations`;
}

async function testEnrichment() {
  console.log('🧪 Testing Re-enrichment on Sample Names\n');
  console.log('=' .repeat(70));

  if (!OPENAI_API_KEY) {
    console.error('❌ OPENAI_API_KEY not set');
    process.exit(1);
  }

  const names = testNames.map(t => t.name);
  const countryHints = testNames.map(t => t.country);

  console.log('\n📋 Test Samples:');
  testNames.forEach(t => {
    console.log(`   ${t.name} (${t.country}): "${t.oldMeaning}" [${t.oldOrigin}]`);
  });

  const prompt = buildBatchPrompt(names, countryHints);

  console.log('\n🔄 Calling OpenAI API...\n');

  try {
    const response = await fetch(OPENAI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          {
            role: 'system',
            content: 'You are an expert in etymology and name meanings. Provide concise, accurate analysis of baby names in valid JSON format. NEVER use "Modern" as an origin - always find the real cultural root.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 1000
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('❌ API Error:', response.status, errorData);
      process.exit(1);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;

    console.log('📥 Raw Response:');
    console.log(content);
    console.log('\n' + '='.repeat(70));

    // Parse JSON
    let jsonStr = content.trim();
    const jsonMatch = jsonStr.match(/```(?:json)?\s*(\[[\s\S]*?\])\s*```/) ||
                     jsonStr.match(/(\[[\s\S]*\])/);

    if (jsonMatch) {
      jsonStr = jsonMatch[1];
    }

    const results = JSON.parse(jsonStr);

    console.log('\n✅ Parsed Results:\n');
    results.forEach((result, i) => {
      const old = testNames[i];
      console.log(`${i + 1}. ${result.name} (${old.country})`);
      console.log(`   OLD: "${old.oldMeaning}" [${old.oldOrigin}]`);
      console.log(`   NEW: "${result.meaning}" [${result.origin}]`);
      if (result.culturalContext) {
        console.log(`   Context: ${result.culturalContext}`);
      }
      console.log('');
    });

    console.log('=' .repeat(70));
    console.log('✅ Test complete!\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

testEnrichment();
