// backend/test.js
require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

if (!process.env.GEMINI_API_KEY) {
  throw new Error('Set GEMINI_API_KEY in backend/.env before running this test.');
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

genAI
  .getGenerativeModel({ model: 'gemini-pro' })
  .generateContent('hello')
  .then((result) => console.log(result.response.text()))
  .catch((error) => console.log(error.message));
