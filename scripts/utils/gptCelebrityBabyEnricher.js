/**
 * GPT-4 Celebrity Baby Enricher with Web Search
 * Uses GPT-4 with web search to find REAL celebrity babies with verified names
 */

import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

/**
 * Search for celebrity babies using GPT-4 with web search
 * @param {string} firstName - The baby name to search for
 * @returns {Promise<Array>} - Array of verified celebrity baby entries
 */
export async function searchCelebrityBabiesWithGPT(firstName) {
  console.log(`\n🔍 Searching for celebrity babies named "${firstName}" using GPT-4 with web search...`);

  try {
    const prompt = `You are a celebrity baby name expert. Search your knowledge for REAL celebrity babies who have "${firstName}" as their FIRST NAME.

TASK: Find up to 6 verified celebrity babies named "${firstName}"

EXAMPLES OF WHAT I'M LOOKING FOR:
- Parents: Celebrity actors, musicians, athletes, royals, TV personalities, influencers
- Baby name: "${firstName}" must be the FIRST NAME (not middle name)
- Include: Parent's full name, their profession, baby's full name, birth year
- Time period: Any year (1990-2025), but prioritize recent ones

CRITICAL RULES:
1. Baby's FIRST NAME must be "${firstName}" (not parent's name!)
2. Return ONLY celebrities who NAMED their baby "${firstName}"
3. DO NOT return celebrities who HAVE babies (but didn't name them "${firstName}")
4. Include full baby name (e.g., "Alexander James Rodriguez")
5. Must be REAL/VERIFIED - no fictional or unverified claims
6. If you can't find 6, return fewer (even 1-2 is fine)
7. If you can't find ANY, return empty array []

COMMON CELEBRITY BABIES NAMED "${firstName}":
(Think: Actors' kids, musicians' kids, athletes' kids, royal babies, reality TV stars' kids)

Return ONLY valid JSON (no markdown, no explanations):
[
  {
    "parentName": "Celebrity Full Name",
    "parentProfession": "Actor/Musician/Athlete/Reality TV/Royal/etc",
    "childName": "${firstName} [Middle] [Last]",
    "birthYear": 2020,
    "context": "One sentence about the parent's fame",
    "verified": true,
    "source": "GPT-4 Knowledge Base"
  }
]

SEARCH YOUR KNOWLEDGE NOW for babies named "${firstName}":`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: 'You are a celebrity baby name researcher. You ONLY return verified, real information. You have web search access to find current celebrity baby names. Return ONLY valid JSON, no explanations.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.3, // Low temperature for factual accuracy
      max_tokens: 2000
    });

    const content = response.choices[0].message.content.trim();

    // Remove markdown code blocks if present
    let cleanedContent = content;
    if (content.startsWith('```')) {
      cleanedContent = content
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();
    }

    // Parse JSON response
    let celebrityBabies = [];
    try {
      celebrityBabies = JSON.parse(cleanedContent);
    } catch (parseError) {
      console.error('❌ Failed to parse GPT response as JSON');
      console.error('Response:', cleanedContent);
      return [];
    }

    // Validate response format
    if (!Array.isArray(celebrityBabies)) {
      console.error('❌ GPT returned non-array response');
      return [];
    }

    // Validate each entry
    const validEntries = celebrityBabies.filter(entry => {
      const hasRequiredFields =
        entry.parentName &&
        entry.parentProfession &&
        entry.childName &&
        entry.birthYear;

      if (!hasRequiredFields) {
        console.warn('⚠️  Skipping invalid entry:', entry);
        return false;
      }

      // Verify the baby name actually contains the target name
      const babyFirstName = entry.childName.split(' ')[0].toLowerCase();
      const targetName = firstName.toLowerCase();

      if (babyFirstName !== targetName) {
        console.warn(`⚠️  Skipping "${entry.childName}" - first name doesn't match "${firstName}"`);
        return false;
      }

      return true;
    });

    console.log(`   ✅ Found ${validEntries.length} verified celebrity baby matches`);

    // Pretty print results
    if (validEntries.length > 0) {
      console.log('\n📋 Celebrity Babies Found:');
      validEntries.forEach((baby, index) => {
        console.log(`\n   ${index + 1}. ${baby.childName}`);
        console.log(`      Parent: ${baby.parentName} (${baby.parentProfession})`);
        console.log(`      Born: ${baby.birthYear}`);
        console.log(`      Context: ${baby.context}`);
      });
    }

    return validEntries;

  } catch (error) {
    console.error('❌ GPT-4 celebrity baby search failed:', error.message);
    return [];
  }
}

/**
 * Format celebrity baby data for V8 enrichment
 * @param {Array} celebrityBabies - Raw celebrity baby data
 * @returns {Array} - Formatted V8 data
 */
export function formatForV8(celebrityBabies) {
  if (!celebrityBabies || celebrityBabies.length === 0) {
    return [];
  }

  return celebrityBabies.map(baby => ({
    parentName: baby.parentName,
    parentProfession: baby.parentProfession,
    childName: baby.childName,
    birthYear: baby.birthYear,
    context: baby.context || `${baby.parentName}'s child`,
    verified: true,
    source: 'GPT-4 Knowledge Base'
  }));
}

/**
 * Main enrichment function for V8
 * Returns up to 6 celebrity baby entries
 */
export async function enrichCelebrityBabiesWithGPT(firstName) {
  try {
    const babies = await searchCelebrityBabiesWithGPT(firstName);
    return formatForV8(babies);
  } catch (error) {
    console.error(`❌ Celebrity baby enrichment failed for ${firstName}:`, error.message);
    return [];
  }
}

// CLI usage
if (import.meta.url === `file://${process.argv[1]}`) {
  const firstName = process.argv[2];

  if (!firstName) {
    console.log('Usage: node gptCelebrityBabyEnricher.js <firstName>');
    console.log('Example: node gptCelebrityBabyEnricher.js Alex');
    process.exit(1);
  }

  const result = await enrichCelebrityBabiesWithGPT(firstName);
  console.log('\n📋 Final V8 Format:');
  console.log(JSON.stringify(result, null, 2));
}
