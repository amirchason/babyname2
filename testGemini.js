require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function testAPI() {
  console.log('Testing Gemini API...\n');

  const genAI = new GoogleGenerativeAI(process.env.REACT_APP_GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

  try {
    const prompt = 'What is the meaning of the name "John"? Reply in 10 words or less.';
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    console.log('✅ API Working!');
    console.log('Response:', text);
    console.log('\nYou can continue enrichment!');

  } catch (error) {
    console.error('❌ API Error:', error.message);

    if (error.message.includes('quota')) {
      console.log('\n⚠️ You have exceeded your Gemini API quota.');
      console.log('Visit: https://console.cloud.google.com/billing');
    } else if (error.message.includes('API key')) {
      console.log('\n⚠️ API key issue. Check your .env file.');
    } else {
      console.log('\n⚠️ Error details:', error);
    }
  }
}

testAPI();