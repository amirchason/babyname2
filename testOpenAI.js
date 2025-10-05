require('dotenv').config();
const OpenAI = require('openai');

async function testAPI() {
  console.log('Testing OpenAI API...\n');

  const openai = new OpenAI({
    apiKey: process.env.REACT_APP_GEMINI_API_KEY // Your API key
  });

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [{
        role: 'user',
        content: 'What is the meaning of the name "John"? Reply in 10 words or less.'
      }],
      temperature: 0.3,
      max_tokens: 50
    });

    console.log('✅ API Working!');
    console.log('Response:', response.choices[0].message.content);
    console.log('\nYou can continue enrichment!');

  } catch (error) {
    console.error('❌ API Error:', error.message);

    if (error.message.includes('quota')) {
      console.log('\n⚠️ You need to add credits to your OpenAI account.');
      console.log('Visit: https://platform.openai.com/account/billing');
    } else if (error.message.includes('api_key')) {
      console.log('\n⚠️ API key issue. Check your .env file.');
    } else {
      console.log('\n⚠️ Unknown error. Please check your connection and API settings.');
    }
  }
}

testAPI();