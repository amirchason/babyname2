require('dotenv').config();
const OpenAI = require('openai');

const openaiKey = process.env.OPENAI_API_KEY;

if (!openaiKey || openaiKey === 'YOUR_OPENAI_API_KEY_HERE') {
  console.error('❌ No valid OpenAI API key found in .env');
  process.exit(1);
}

console.log('============================================================');
console.log('OPENAI API STATUS CHECK');
console.log('============================================================\n');

console.log('🔑 API Key:', openaiKey.substring(0, 20) + '...');

const openai = new OpenAI({ apiKey: openaiKey });

// Test each model
async function testModels() {
  console.log('\n📊 GPT-4 TURBO PRICING:');
  console.log('─────────────────────────');
  console.log('Input:  $10.00 per 1M tokens');
  console.log('Output: $30.00 per 1M tokens');
  console.log('Context: 128,000 tokens');
  console.log('Speed: ~40 tokens/second');

  console.log('\n💰 COST BREAKDOWN FOR YOUR TASK:');
  console.log('─────────────────────────────────');
  console.log('Failed names to retry: 2,416');
  console.log('Next batch: 90,000 names');
  console.log('Total: ~92,416 names');
  console.log('\nEstimated tokens:');
  console.log('- Input: ~7.4M tokens ($74)');
  console.log('- Output: ~1.8M tokens ($54)');
  console.log('TOTAL COST: ~$128 for GPT-4-turbo');

  console.log('\n🧪 TESTING GPT-4-TURBO ACCESS:');
  console.log('─────────────────────────────');

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [{
        role: 'system',
        content: 'You are a concise assistant.'
      }, {
        role: 'user',
        content: 'Reply with just "OK" if you can hear me.'
      }],
      max_tokens: 10,
      temperature: 0
    });

    console.log('✅ GPT-4-turbo is working!');
    console.log('Response:', response.choices[0].message.content);
    console.log('\n✅ YOUR ACCOUNT HAS ACCESS TO GPT-4-TURBO');

  } catch (error) {
    console.log('❌ GPT-4-turbo error:', error.message);

    if (error.message.includes('quota')) {
      console.log('\n💳 QUOTA EXCEEDED - You need to:');
      console.log('1. Go to: https://platform.openai.com/account/billing');
      console.log('2. Add payment method');
      console.log('3. Add at least $150 in credits for the full enrichment');
      console.log('4. Wait 2-3 minutes for credits to activate');
    } else if (error.message.includes('rate_limit')) {
      console.log('\n⏱️ RATE LIMIT - Your account may have restrictions');
    } else {
      console.log('\n❓ Unknown error - Check your API key');
    }
  }

  // Check other models for comparison
  console.log('\n📈 ALTERNATIVE MODELS STATUS:');
  console.log('─────────────────────────────');

  const models = [
    { name: 'gpt-4o', cost: '$5/$15 per 1M' },
    { name: 'gpt-4o-mini', cost: '$0.15/$0.60 per 1M' },
    { name: 'gpt-3.5-turbo', cost: '$0.50/$1.50 per 1M' }
  ];

  for (const model of models) {
    try {
      await openai.chat.completions.create({
        model: model.name,
        messages: [{ role: 'user', content: 'test' }],
        max_tokens: 1
      });
      console.log(`✅ ${model.name} available (${model.cost})`);
    } catch (error) {
      if (error.message.includes('quota')) {
        console.log(`⚠️ ${model.name} - Quota exceeded (${model.cost})`);
      } else {
        console.log(`❌ ${model.name} - ${error.message.substring(0, 50)}`);
      }
    }
  }

  console.log('\n📋 ENRICHMENT STATS FROM PREVIOUS RUN:');
  console.log('──────────────────────────────────────');

  // Load progress file if exists
  const fs = require('fs');
  if (fs.existsSync('first10999_progress.json')) {
    const progress = JSON.parse(fs.readFileSync('first10999_progress.json', 'utf8'));
    console.log(`Processed: ${progress.totalProcessed} names`);
    console.log(`Errors: ${progress.totalErrors} names`);
    console.log(`Success rate: ${((progress.totalProcessed / (progress.totalProcessed + progress.totalErrors)) * 100).toFixed(1)}%`);
    console.log(`Time spent: ${new Date(progress.lastUpdate) - new Date(progress.startTime)} ms`);

    // Calculate actual cost based on previous run
    const tokensUsed = progress.totalProcessed * 80; // ~80 tokens per name
    const costSoFar = (tokensUsed / 1000000) * 10; // $10 per 1M input tokens
    console.log(`\nCost so far: ~$${costSoFar.toFixed(2)}`);
    console.log(`Remaining cost: ~$${(128 - costSoFar).toFixed(2)}`);
  }
}

testModels();