require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');
const OpenAI = require('openai');

console.log('============================================================');
console.log('API TESTING & COST COMPARISON');
console.log('============================================================\n');

// Check API Keys
console.log('📌 API KEY STATUS:');
console.log('─────────────────');
const geminiKey = process.env.REACT_APP_GEMINI_API_KEY;
const openaiKey = process.env.OPENAI_API_KEY;

console.log('Gemini API Key:', geminiKey ? `✅ Found (${geminiKey.substring(0,10)}...)` : '❌ Not found');
console.log('OpenAI API Key:', openaiKey && openaiKey !== 'YOUR_OPENAI_API_KEY_HERE' ?
  `✅ Found (${openaiKey.substring(0,10)}...)` : '❌ Not configured (placeholder)');

console.log('\n💰 PRICING COMPARISON (as of Oct 2024):');
console.log('─────────────────────────────────────────');
console.log('MODEL                    | INPUT $/1M  | OUTPUT $/1M | SPEED');
console.log('─────────────────────────────────────────');
console.log('GPT-4o                   | $5.00       | $15.00      | Fast');
console.log('GPT-4o-mini              | $0.15       | $0.60       | Very Fast');
console.log('GPT-4-turbo              | $10.00      | $30.00      | Medium');
console.log('GPT-3.5-turbo            | $0.50       | $1.50       | Very Fast');
console.log('Gemini 1.5 Flash         | $0.075      | $0.30       | Very Fast');
console.log('Gemini 1.5 Pro           | $3.50       | $10.50      | Fast');

console.log('\n📊 COST ESTIMATE FOR 100K NAMES:');
console.log('─────────────────────────────────');
console.log('Assuming ~800 tokens per batch of 10 names = 8M tokens total');
console.log('GPT-4o-mini:     ~$1.20 - $4.80');
console.log('GPT-3.5-turbo:   ~$4.00 - $12.00');
console.log('Gemini Flash:    ~$0.60 - $2.40  ← CHEAPEST');
console.log('GPT-4o:          ~$40 - $120');
console.log('GPT-4-turbo:     ~$80 - $240');

const testPrompt = 'What is the meaning of the name "John"? Reply in 10 words or less.';

// Test Gemini if key exists
async function testGemini() {
  if (!geminiKey) {
    console.log('\n❌ Skipping Gemini - No API key');
    return;
  }

  console.log('\n🧪 TESTING GEMINI API:');
  console.log('──────────────────────');

  const genAI = new GoogleGenerativeAI(geminiKey);

  // Test Gemini Flash
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const start = Date.now();
    const result = await model.generateContent(testPrompt);
    const response = await result.response;
    const elapsed = Date.now() - start;
    console.log(`✅ Gemini 1.5 Flash: "${response.text().trim()}" (${elapsed}ms)`);
  } catch (error) {
    console.log('❌ Gemini Flash:', error.message.substring(0, 100));
  }

  // Test Gemini Pro
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });
    const start = Date.now();
    const result = await model.generateContent(testPrompt);
    const response = await result.response;
    const elapsed = Date.now() - start;
    console.log(`✅ Gemini 1.5 Pro: "${response.text().trim()}" (${elapsed}ms)`);
  } catch (error) {
    console.log('❌ Gemini Pro:', error.message.substring(0, 100));
  }
}

// Test OpenAI if key exists
async function testOpenAI() {
  if (!openaiKey || openaiKey === 'YOUR_OPENAI_API_KEY_HERE') {
    console.log('\n❌ Skipping OpenAI - No real API key configured');
    console.log('   To use OpenAI, add your key to .env:');
    console.log('   OPENAI_API_KEY=sk-...');
    return;
  }

  console.log('\n🧪 TESTING OPENAI API:');
  console.log('──────────────────────');

  const openai = new OpenAI({ apiKey: openaiKey });

  // Test GPT-4o-mini (cheapest)
  try {
    const start = Date.now();
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: testPrompt }],
      max_tokens: 50,
      temperature: 0.3
    });
    const elapsed = Date.now() - start;
    console.log(`✅ GPT-4o-mini: "${response.choices[0].message.content}" (${elapsed}ms)`);
  } catch (error) {
    console.log('❌ GPT-4o-mini:', error.message.substring(0, 100));
  }

  // Test GPT-3.5-turbo
  try {
    const start = Date.now();
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: testPrompt }],
      max_tokens: 50,
      temperature: 0.3
    });
    const elapsed = Date.now() - start;
    console.log(`✅ GPT-3.5-turbo: "${response.choices[0].message.content}" (${elapsed}ms)`);
  } catch (error) {
    console.log('❌ GPT-3.5-turbo:', error.message.substring(0, 100));
  }

  // Test GPT-4o
  try {
    const start = Date.now();
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [{ role: 'user', content: testPrompt }],
      max_tokens: 50,
      temperature: 0.3
    });
    const elapsed = Date.now() - start;
    console.log(`✅ GPT-4o: "${response.choices[0].message.content}" (${elapsed}ms)`);
  } catch (error) {
    console.log('❌ GPT-4o:', error.message.substring(0, 100));
  }

  // Test GPT-4-turbo
  try {
    const start = Date.now();
    const response = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [{ role: 'user', content: testPrompt }],
      max_tokens: 50,
      temperature: 0.3
    });
    const elapsed = Date.now() - start;
    console.log(`✅ GPT-4-turbo: "${response.choices[0].message.content}" (${elapsed}ms)`);
  } catch (error) {
    console.log('❌ GPT-4-turbo:', error.message.substring(0, 100));
  }
}

// Run tests
async function main() {
  await testGemini();
  await testOpenAI();

  console.log('\n🎯 RECOMMENDATION:');
  console.log('──────────────────');
  console.log('For 100k names enrichment, ranked by value:');
  console.log('1. Gemini 1.5 Flash - Cheapest & fastest ($0.60-$2.40)');
  console.log('2. GPT-4o-mini - Good balance ($1.20-$4.80)');
  console.log('3. GPT-3.5-turbo - Reliable fallback ($4-$12)');
  console.log('4. GPT-4o/Gemini Pro - Higher quality but 10x cost');
  console.log('\nNote: GPT-5 is not yet available (as of Oct 2024)');
}

main().catch(console.error);