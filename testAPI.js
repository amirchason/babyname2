require('dotenv').config();
const OpenAI = require('openai');

console.log('Testing OpenAI API connection...\n');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

async function test() {
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{
        role: 'user',
        content: 'What is the meaning of the name "John"? Reply in 10 words or less.'
      }],
      temperature: 0.3,
      max_tokens: 50
    });

    console.log('✅ API Working with GPT-4o-mini!');
    console.log('Response:', response.choices[0].message.content);
    console.log('\n✅ Ready to start enrichment!');
    process.exit(0);

  } catch (error) {
    console.error('❌ API Error:', error.message);

    if (error.message.includes('quota')) {
      console.log('\n⚠️ You need to add credits to your OpenAI account.');
      console.log('Visit: https://platform.openai.com/account/billing');
    } else if (error.message.includes('api_key') || error.message.includes('Incorrect')) {
      console.log('\n⚠️ API key issue. Check your .env file.');
      console.log('Current key starts with:', process.env.OPENAI_API_KEY?.substring(0, 10) + '...');
    } else {
      console.log('\n⚠️ Error details:', error.response?.data || error.message);
    }
    process.exit(1);
  }
}

test();