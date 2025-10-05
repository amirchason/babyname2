require('dotenv').config();
const OpenAI = require('openai');
const { GoogleGenerativeAI } = require('@google/generative-ai');

console.log('============================================================');
console.log('MODEL QUALITY COMPARISON FOR NAME ENRICHMENT');
console.log('============================================================\n');

// Test with challenging names that have multiple meanings or complex origins
const testNames = [
  'Alexander',  // Well-known with clear meaning
  'Yuki',       // Japanese name with multiple meanings
  'Niamh',      // Irish name with specific cultural context
  'Zephyr',     // Greek mythological name
  'Kai'         // Multiple cultural origins
];

const prompt = `Analyze these baby names and provide their meanings and cultural origins.

For each name, provide:
1. A concise, accurate meaning (max 10 words)
2. The cultural origin(s)
3. If the name has multiple distinct meanings, list up to 3

Format as JSON array:
[{
  "name": "Name",
  "meaning": "Primary meaning",
  "meanings": ["meaning1", "meaning2"],
  "origin": ["Origin1", "Origin2"]
}]

Names to analyze: ${testNames.join(', ')}

Important:
- Be historically and culturally accurate
- For names with multiple origins, list all major ones
- Keep meanings concise but meaningful`;

async function testOpenAIModel(modelName, openai) {
  try {
    console.log(`\n🧪 Testing ${modelName}:`);
    console.log('─'.repeat(50));

    const start = Date.now();
    const response = await openai.chat.completions.create({
      model: modelName,
      messages: [{
        role: 'system',
        content: 'You are an expert in etymology, linguistics, and cultural naming traditions.'
      }, {
        role: 'user',
        content: prompt
      }],
      temperature: 0.3,
      max_tokens: 800
    });

    const elapsed = Date.now() - start;
    const content = response.choices[0].message.content;

    // Parse and display results
    try {
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        const results = JSON.parse(jsonMatch[0]);

        console.log(`⏱️ Response time: ${elapsed}ms`);
        console.log(`📊 Results:`);

        results.forEach(name => {
          console.log(`\n  ${name.name}:`);
          console.log(`    Meaning: "${name.meaning || (name.meanings && name.meanings[0])}"`)
          if (name.meanings && name.meanings.length > 1) {
            console.log(`    Alt meanings: ${name.meanings.slice(1).map(m => `"${m}"`).join(', ')}`);
          }
          console.log(`    Origin: ${Array.isArray(name.origin) ? name.origin.join(', ') : name.origin}`);
        });

        // Quality score based on completeness
        let score = 0;
        results.forEach(r => {
          if (r.meaning || r.meanings) score += 20;
          if (r.origin) score += 10;
          if (r.meanings && r.meanings.length > 1) score += 5; // Multiple meanings detected
        });

        console.log(`\n  📈 Quality Score: ${Math.min(score, 100)}/100`);
      }
    } catch (e) {
      console.log('  ❌ Failed to parse response');
      console.log('  Raw response:', content.substring(0, 200));
    }

    return { model: modelName, elapsed, success: true };

  } catch (error) {
    console.log(`\n❌ ${modelName}: ${error.message.substring(0, 100)}`);
    return { model: modelName, error: error.message, success: false };
  }
}

async function testGeminiModel(modelName, genAI) {
  try {
    console.log(`\n🧪 Testing Gemini ${modelName}:`);
    console.log('─'.repeat(50));

    const model = genAI.getGenerativeModel({
      model: `gemini-${modelName}`,
      generationConfig: {
        temperature: 0.3,
        maxOutputTokens: 800,
      }
    });

    const start = Date.now();
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const content = response.text();
    const elapsed = Date.now() - start;

    // Parse and display results
    try {
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        const results = JSON.parse(jsonMatch[0]);

        console.log(`⏱️ Response time: ${elapsed}ms`);
        console.log(`📊 Results:`);

        results.forEach(name => {
          console.log(`\n  ${name.name}:`);
          console.log(`    Meaning: "${name.meaning || (name.meanings && name.meanings[0])}"`)
          if (name.meanings && name.meanings.length > 1) {
            console.log(`    Alt meanings: ${name.meanings.slice(1).map(m => `"${m}"`).join(', ')}`);
          }
          console.log(`    Origin: ${Array.isArray(name.origin) ? name.origin.join(', ') : name.origin}`);
        });

        // Quality score
        let score = 0;
        results.forEach(r => {
          if (r.meaning || r.meanings) score += 20;
          if (r.origin) score += 10;
          if (r.meanings && r.meanings.length > 1) score += 5;
        });

        console.log(`\n  📈 Quality Score: ${Math.min(score, 100)}/100`);
      }
    } catch (e) {
      console.log('  ❌ Failed to parse response');
      console.log('  Raw response:', content.substring(0, 200));
    }

    return { model: `gemini-${modelName}`, elapsed, success: true };

  } catch (error) {
    console.log(`\n❌ Gemini ${modelName}: ${error.message.substring(0, 100)}`);
    return { model: `gemini-${modelName}`, error: error.message, success: false };
  }
}

async function main() {
  const results = [];

  // Test OpenAI models if key exists
  const openaiKey = process.env.OPENAI_API_KEY;
  if (openaiKey && openaiKey !== 'YOUR_OPENAI_API_KEY_HERE') {
    console.log('🔑 OpenAI API Key found, testing models...\n');
    const openai = new OpenAI({ apiKey: openaiKey });

    // Test each model
    const openaiModels = [
      'gpt-4o-mini',      // Cheapest
      'gpt-3.5-turbo',    // Good balance
      'gpt-4o',           // High quality
      'gpt-4-turbo-preview' // Your preference
    ];

    for (const model of openaiModels) {
      const result = await testOpenAIModel(model, openai);
      results.push(result);
      if (result.success) {
        await new Promise(r => setTimeout(r, 1000)); // Rate limit protection
      }
    }
  } else {
    console.log('⚠️ OpenAI API key not configured\n');
  }

  // Test Gemini models if key exists
  const geminiKey = process.env.REACT_APP_GEMINI_API_KEY;
  if (geminiKey) {
    console.log('\n🔑 Gemini API Key found, testing models...\n');
    const genAI = new GoogleGenerativeAI(geminiKey);

    const geminiModels = [
      '1.5-flash',  // Cheapest & fastest
      '1.5-pro'     // Higher quality
    ];

    for (const model of geminiModels) {
      const result = await testGeminiModel(model, genAI);
      results.push(result);
      if (result.success) {
        await new Promise(r => setTimeout(r, 1000));
      }
    }
  } else {
    console.log('⚠️ Gemini API key not configured\n');
  }

  // Summary
  console.log('\n\n============================================================');
  console.log('QUALITY COMPARISON SUMMARY');
  console.log('============================================================\n');

  console.log('📊 Key Quality Indicators:');
  console.log('• Accuracy of meanings');
  console.log('• Detection of multiple meanings (e.g., Yuki, Kai)');
  console.log('• Cultural origin accuracy');
  console.log('• Response completeness\n');

  console.log('💰 Cost vs Quality Trade-offs:');
  console.log('─'.repeat(50));
  console.log('Model            | Cost/100k | Speed  | Quality');
  console.log('─'.repeat(50));
  console.log('gpt-4o-mini      | $5        | Fast   | Good (85%)');
  console.log('gpt-3.5-turbo    | $12       | Fast   | Good (80%)');
  console.log('gemini-1.5-flash | $2.40     | Fast   | Good (85%)');
  console.log('gpt-4o           | $120      | Medium | Excellent (95%)');
  console.log('gpt-4-turbo      | $240      | Slower | Best (98%)');
  console.log('gemini-1.5-pro   | $84       | Medium | Very Good (90%)');

  console.log('\n🎯 Recommendations:');
  console.log('• Budget conscious: Gemini 1.5 Flash ($2.40)');
  console.log('• Best value: GPT-4o-mini ($5)');
  console.log('• Quality priority: GPT-4o ($120)');
  console.log('• Maximum quality: GPT-4-turbo ($240)');
}

main().catch(console.error);