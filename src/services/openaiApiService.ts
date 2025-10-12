/**
 * OpenAI API Service - Interfaces with GPT-4 Mini for name analysis
 * Generates meanings and detects origins for names
 */

import { NameAnalysis, StandardOrigin, STANDARD_ORIGINS } from './claudeApiService';

class OpenAIApiService {
  private apiKey: string;
  private baseUrl: string = 'https://api.openai.com/v1/chat/completions';
  private model: string = 'gpt-4o-mini'; // Fast, cost-effective model

  constructor() {
    this.apiKey = process.env.REACT_APP_OPENAI_API_KEY || '';

    if (!this.apiKey) {
      console.warn('OpenAI API key not found. Enrichment will use fallback data.');
    }
  }

  /**
   * Analyze a single name using OpenAI GPT-4 Mini
   */
  async analyzeName(name: string): Promise<NameAnalysis> {
    if (!this.apiKey) {
      console.warn(`No API key - using fallback for ${name}`);
      return this.generateFallback(name);
    }

    try {
      const prompt = this.buildPrompt(name);

      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: this.model,
          messages: [
            {
              role: 'system',
              content: 'You are an expert in etymology and name meanings. Provide concise, accurate analysis of baby names.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.3, // More deterministic for factual data
          max_tokens: 150
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('OpenAI API error:', response.status, errorData);
        return this.generateFallback(name);
      }

      const data = await response.json();
      const content = data.choices[0]?.message?.content;

      if (!content) {
        console.error('No content in OpenAI response');
        return this.generateFallback(name);
      }

      return this.parseResponse(name, content);

    } catch (error) {
      console.error(`Error analyzing name "${name}":`, error);
      return this.generateFallback(name);
    }
  }

  /**
   * Batch analyze multiple names in a SINGLE API call (MUCH more efficient)
   * This sends all names in one request instead of multiple individual requests
   * Includes retry logic with exponential backoff for rate limits
   * @param names Array of name strings to analyze
   * @param retryCount Internal retry counter
   * @param countryHints Optional array of country codes (e.g., ['PR', 'ES']) for context
   */
  async analyzeNamesBatch(names: string[], retryCount: number = 0, countryHints?: string[]): Promise<NameAnalysis[]> {
    const MAX_RETRIES = 3;
    const BASE_DELAY = 2000; // 2 seconds

    if (!this.apiKey) {
      console.warn('No API key - using fallback for batch');
      return names.map(name => this.generateFallback(name));
    }

    if (names.length === 0) {
      return [];
    }

    // For single name, use regular method
    if (names.length === 1) {
      return [await this.analyzeName(names[0])];
    }

    try {
      const prompt = this.buildBatchPrompt(names, countryHints);

      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: this.model,
          messages: [
            {
              role: 'system',
              content: 'You are an expert in etymology and name meanings. Provide concise, accurate analysis of baby names in valid JSON format.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.3,
          max_tokens: 800
        })
      });

      // Handle rate limit errors (429) with exponential backoff
      if (response.status === 429 && retryCount < MAX_RETRIES) {
        const delay = BASE_DELAY * Math.pow(2, retryCount); // Exponential backoff
        console.warn(`Rate limit hit. Retrying in ${delay/1000}s... (attempt ${retryCount + 1}/${MAX_RETRIES})`);
        await this.delay(delay);
        return this.analyzeNamesBatch(names, retryCount + 1, countryHints);
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('OpenAI batch API error:', response.status, errorData);
        // Fall back to individual processing on error
        return names.map(name => this.generateFallback(name));
      }

      const data = await response.json();
      const content = data.choices[0]?.message?.content;

      if (!content) {
        console.error('No content in batch response');
        return names.map(name => this.generateFallback(name));
      }

      return this.parseBatchResponse(names, content);

    } catch (error) {
      console.error('Error in batch analysis:', error);

      // Retry on network errors
      if (retryCount < MAX_RETRIES) {
        const delay = BASE_DELAY * Math.pow(2, retryCount);
        console.warn(`Network error. Retrying in ${delay/1000}s... (attempt ${retryCount + 1}/${MAX_RETRIES})`);
        await this.delay(delay);
        return this.analyzeNamesBatch(names, retryCount + 1, countryHints);
      }

      return names.map(name => this.generateFallback(name));
    }
  }

  /**
   * Build prompt for BATCH name analysis (multiple names in one call)
   */
  private buildBatchPrompt(names: string[], countryHints?: string[]): string {
    const originsStr = STANDARD_ORIGINS.filter(o => o !== 'Modern').join(', ');

    let namesWithHints = names;
    if (countryHints && countryHints.length === names.length) {
      namesWithHints = names.map((name, i) =>
        countryHints[i] ? `${name} (${countryHints[i]})` : name
      );
    }

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

  /**
   * Build prompt for single name analysis
   */
  private buildPrompt(name: string, countryHint?: string): string {
    const originsStr = STANDARD_ORIGINS.filter(o => o !== 'Modern').join(', ');
    const nameWithHint = countryHint ? `${name} (country: ${countryHint})` : name;

    return `Analyze the baby name "${nameWithHint}":

1. Provide a concise meaning (1-4 words maximum, can be multiple meanings separated by semicolon)
2. Identify the origin from this list: ${originsStr}
3. Optionally add brief cultural context (max 10 words)

CRITICAL: NEVER use "Modern" as an origin. Dig deeper to find the real cultural root.
- Analyze name structure, phonetics, and etymology
- Look for linguistic patterns, root words, suffixes
- If country code is provided, use it as a strong hint
- Multiple origins allowed if mixed heritage (e.g., "Spanish, Latin")

Format your response EXACTLY as:
MEANING: [concise meaning, multiple allowed with semicolon]
ORIGIN: [cultural origin from the list, NEVER "Modern"]
CONTEXT: [optional brief cultural context]

Example:
MEANING: gracious gift
ORIGIN: Hebrew
CONTEXT: Popular biblical name`;
  }

  /**
   * Parse batch response with validation to ensure accuracy
   */
  private parseBatchResponse(names: string[], content: string): NameAnalysis[] {
    try {
      // Extract JSON from response (handle markdown code blocks)
      let jsonStr = content.trim();

      // Remove markdown code blocks if present
      const jsonMatch = jsonStr.match(/```(?:json)?\s*(\[[\s\S]*?\])\s*```/) ||
                       jsonStr.match(/(\[[\s\S]*\])/);

      if (jsonMatch) {
        jsonStr = jsonMatch[1];
      }

      const results = JSON.parse(jsonStr);

      if (!Array.isArray(results)) {
        throw new Error('Response is not an array');
      }

      // Validate we got the right number of results
      if (results.length !== names.length) {
        console.warn(`Expected ${names.length} results, got ${results.length}`);
      }

      // Map results to our format with validation
      const analyses: NameAnalysis[] = names.map((inputName, index) => {
        const result = results[index];

        if (!result) {
          console.warn(`No result for name at index ${index}: ${inputName}`);
          return this.generateFallback(inputName);
        }

        // Validate name match (case-insensitive)
        const resultName = result.name || inputName;
        if (resultName.toLowerCase() !== inputName.toLowerCase()) {
          console.warn(`Name mismatch: expected "${inputName}", got "${resultName}"`);
        }

        // Extract and validate meaning
        let meaning = result.meaning || 'unknown';
        const words = meaning.split(/\s+/);
        if (words.length > 4) {
          meaning = words.slice(0, 4).join(' ');
        }

        // Validate and normalize origin
        let origin = result.origin || 'Modern';
        if (!STANDARD_ORIGINS.includes(origin as StandardOrigin)) {
          const originLower = origin.toLowerCase();
          const match = STANDARD_ORIGINS.find(o => o.toLowerCase() === originLower);
          origin = match || 'Modern';
        }

        return {
          name: inputName, // Use input name to ensure consistency
          meaning,
          origin: origin as StandardOrigin,
          culturalContext: result.culturalContext
        };
      });

      return analyses;

    } catch (error) {
      console.error('Error parsing batch response:', error);
      console.error('Response content:', content);

      // Fallback: return placeholder data for all names
      return names.map(name => this.generateFallback(name));
    }
  }

  /**
   * Parse OpenAI response
   */
  private parseResponse(name: string, content: string): NameAnalysis {
    const meaningMatch = content.match(/MEANING:\s*(.+)/i);
    const originMatch = content.match(/ORIGIN:\s*(.+)/i);
    const contextMatch = content.match(/CONTEXT:\s*(.+)/i);

    let meaning = meaningMatch?.[1]?.trim() || 'unknown';
    let origin = originMatch?.[1]?.trim() || 'Modern';
    const culturalContext = contextMatch?.[1]?.trim();

    // Ensure meaning is 1-4 words
    const words = meaning.split(/\s+/);
    if (words.length > 4) {
      meaning = words.slice(0, 4).join(' ');
    }

    // Validate origin is in standard list
    if (!STANDARD_ORIGINS.includes(origin as StandardOrigin)) {
      // Try to find closest match
      const originLower = origin.toLowerCase();
      const match = STANDARD_ORIGINS.find(o => o.toLowerCase() === originLower);
      origin = match || 'Modern';
    }

    return {
      name,
      meaning,
      origin: origin as StandardOrigin,
      culturalContext
    };
  }

  /**
   * Fallback for when API is unavailable or errors
   */
  private generateFallback(name: string): NameAnalysis {
    return {
      name,
      meaning: 'beautiful name',
      origin: 'Modern',
      culturalContext: undefined
    };
  }

  /**
   * Delay helper
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Test API connection
   */
  async testConnection(): Promise<boolean> {
    try {
      const result = await this.analyzeName('Emma');
      console.log('OpenAI API test result:', result);
      return result.meaning !== 'beautiful name'; // Success if not fallback
    } catch (error) {
      console.error('OpenAI API test failed:', error);
      return false;
    }
  }
}

// Export singleton instance
const openaiApiService = new OpenAIApiService();
export default openaiApiService;
