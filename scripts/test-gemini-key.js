const { GoogleGenerativeAI } = require('@google/generative-ai');

const apiKey = 'AIzaSyALzy3qXMyXPtLl7pUuCDo_eE5X89u3dpA';
const genAI = new GoogleGenerativeAI(apiKey);

async function testKey() {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    const result = await model.generateContent('Say "Gemini API works!"');
    const response = await result.response;
    const text = response.text();

    console.log('✅ GEMINI API WORKS!');
    console.log('Response:', text);
    return true;
  } catch (error) {
    console.log('❌ GEMINI API FAILED');
    console.log('Error:', error.message);
    return false;
  }
}

testKey();
