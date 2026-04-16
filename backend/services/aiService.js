// backend/services/aiService.js
// AI service using Google Gemini API & NVIDIA Kimi API

const { GoogleGenerativeAI } = require('@google/generative-ai');
const OpenAI = require('openai');
const NodeCache = require('node-cache');

// ================= INIT =================

// Cache responses for 1 hour to reduce API costs
const apiCache = new NodeCache({ stdTTL: 3600, checkperiod: 600 });

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
const DEFAULT_MODEL = 'gemini-2.0-flash';
const AI_REQUEST_TIMEOUT_MS = Number(process.env.AI_REQUEST_TIMEOUT_MS || 10000);
const PROVIDER_BACKOFF_MS = Number(process.env.AI_PROVIDER_BACKOFF_MS || 5 * 60 * 1000);

const kimiClient = new OpenAI({
  baseURL: 'https://integrate.api.nvidia.com/v1',
  apiKey: process.env.KIMI_API_KEY || ''
});

const providerBackoffUntil = {
  gemini: 0,
  kimi: 0,
};

// ================= CONSTANTS =================

const QUESTION_TYPES = ['math', 'coding', 'reasoning', 'science', 'theory', 'general'];

const QUESTION_TYPE_PATTERNS = {
  coding: [
    /\b(function|class|algorithm|time complexity|bug|debug|leetcode|sql|api|javascript|python|java|react|node|code)\b/i,
    /```[\s\S]*```/,
  ],
  math: [
    /\b(derivative|integral|equation|solve|matrix|probability|area|volume|quadratic|logarithm|trigonometry|algebra|geometry|calculus)\b/i,
  ],
  reasoning: [
    /\b(logic|puzzle|syllogism|seating|blood relation|series|ranking)\b/i,
  ],
  science: [
    /\b(physics|chemistry|biology|force|atom|reaction|cell|electricity)\b/i,
  ],
  theory: [
    /\b(explain|define|difference between|advantages|disadvantages|describe)\b/i,
  ],
};

const QUESTION_TYPE_CONFIG = {
  coding: { displayName: 'Coding' },
  math: { displayName: 'Math' },
  reasoning: { displayName: 'Reasoning' },
  science: { displayName: 'Science' },
  theory: { displayName: 'Theory' },
  general: { displayName: 'General' },
};

// ================= HELPERS =================

const normalizeQuestionType = (value = 'general') => {
  return QUESTION_TYPES.includes(value) ? value : 'general';
};

const detectQuestionType = (questionText = '', category = 'general') => {
  const normalizedCategory = normalizeQuestionType((category || '').toLowerCase());

  if (normalizedCategory !== 'general') {
    return normalizedCategory;
  }

  for (const [type, patterns] of Object.entries(QUESTION_TYPE_PATTERNS)) {
    if (patterns.some((pattern) => pattern.test(questionText))) {
      return type;
    }
  }

  return 'general';
};

const buildSystemPrompt = (questionType = 'general', eli5Mode = false) => {
  const base = `You are Doubtly AI, a helpful teacher. Answer clearly in structured format.`;

  if (!eli5Mode) return base;

  return base + `\nExplain like I'm 5 using simple language and examples.`;
};

const withTimeout = async (promise, ms, label) => {
  let timer;
  try {
    return await Promise.race([
      promise,
      new Promise((_, reject) => {
        timer = setTimeout(() => reject(new Error(`${label} timed out after ${ms}ms`)), ms);
      }),
    ]);
  } finally {
    clearTimeout(timer);
  }
};

const isProviderInBackoff = (provider) => Date.now() < (providerBackoffUntil[provider] || 0);

const shouldBackoffProvider = (errorMessage = '') => {
  const msg = String(errorMessage).toLowerCase();
  return (
    msg.includes('429') ||
    msg.includes('quota') ||
    msg.includes('too many requests') ||
    msg.includes('rate limit') ||
    msg.includes('resource exhausted') ||
    msg.includes('insufficient_quota')
  );
};

const markProviderBackoff = (provider, errorMessage) => {
  if (!shouldBackoffProvider(errorMessage)) return;
  providerBackoffUntil[provider] = Date.now() + PROVIDER_BACKOFF_MS;
  console.warn(`⚠ ${provider} is rate-limited; backing off for ${Math.round(PROVIDER_BACKOFF_MS / 1000)}s`);
};

const callGemini = async ({ prompt, questionType, eli5Mode }) => {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error('Gemini key unavailable');
  }
  if (isProviderInBackoff('gemini')) {
    throw new Error('Gemini is temporarily in backoff');
  }

  try {
    const model = genAI.getGenerativeModel({
      model: DEFAULT_MODEL,
      systemInstruction: buildSystemPrompt(questionType, eli5Mode),
    });

    const result = await withTimeout(
      model.generateContent(prompt),
      AI_REQUEST_TIMEOUT_MS,
      'Gemini request'
    );

    return {
      response: result.response.text(),
      aiProvider: 'google-gemini',
      aiModel: DEFAULT_MODEL,
    };
  } catch (error) {
    markProviderBackoff('gemini', error?.message);
    throw error;
  }
};

const callKimi = async ({ prompt, questionType, eli5Mode }) => {
  if (!process.env.KIMI_API_KEY) {
    throw new Error('Kimi key unavailable');
  }
  if (isProviderInBackoff('kimi')) {
    throw new Error('Kimi is temporarily in backoff');
  }

  try {
    const completion = await withTimeout(
      kimiClient.chat.completions.create({
        model: 'moonshotai/kimi-k2-instruct',
        messages: [
          { role: 'system', content: buildSystemPrompt(questionType, eli5Mode) },
          { role: 'user', content: prompt },
        ],
      }),
      AI_REQUEST_TIMEOUT_MS,
      'Kimi request'
    );

    return {
      response: completion.choices[0]?.message?.content,
      aiProvider: 'nvidia-kimi',
      aiModel: 'moonshotai/kimi-k2-instruct',
    };
  } catch (error) {
    markProviderBackoff('kimi', error?.message);
    throw error;
  }
};

// ================= CORE =================

const generateExplanation = async (questionText, eli5Mode = false, category = 'general') => {
  try {
    const questionType =
      category === 'coding' ? 'coding' : detectQuestionType(questionText, category);

    const normalizedQuestion = (questionText || '')
      .trim()
      .replace(/\s+/g, ' ')
      .toLowerCase();

    // Create a cache key using the parameters
    const cacheKey = `explanation_${Buffer.from(normalizedQuestion).toString('base64').substring(0, 50)}_${eli5Mode}_${questionType}`;
    const cachedResult = apiCache.get(cacheKey);
    if (cachedResult) {
      console.log('✅ Returning cached explanation');
      return cachedResult;
    }

    // Keep coding on Kimi-first. For others, skip Gemini-first when Gemini is in backoff.
    const providerOrder =
      questionType === 'coding'
        ? ['kimi', 'gemini']
        : isProviderInBackoff('gemini')
          ? ['kimi', 'gemini']
          : ['gemini', 'kimi'];

    let response;
    let aiProvider;
    let aiModel;
    const errors = [];

    for (const provider of providerOrder) {
      try {
        const result =
          provider === 'gemini'
            ? await callGemini({ prompt: questionText, questionType, eli5Mode })
            : await callKimi({ prompt: questionText, questionType, eli5Mode });

        response = result.response;
        aiProvider = result.aiProvider;
        aiModel = result.aiModel;
        break;
      } catch (providerError) {
        errors.push(`${provider}: ${providerError.message}`);
        console.warn(`⚠ ${provider} failed: ${providerError.message}`);
      }
    }

    if (!response) {
      throw new Error(`All AI providers failed. ${errors.join(' | ')}`);
    }

    const resultObj = {
      response,
      keyConcepts: extractKeyConcepts(response),
      finalAnswer: extractFinalAnswer(response),
      questionType,
      aiProvider,
      aiModel,
    };
    apiCache.set(cacheKey, resultObj);
    return resultObj;
  } catch (error) {
    throw new Error(`AI failed: ${error.message}`);
  }
};

// ================= FOLLOW-UP =================

const generateFollowUp = async (
  originalQuestion,
  originalAnswer,
  previousFollowUps,
  followUpQuestion,
  questionType = 'general',
  aiProvider = 'nvidia-kimi'
) => {
  const cacheKey = `followup_${Buffer.from(originalQuestion).toString('base64').substring(0, 20)}_${Buffer.from(followUpQuestion).toString('base64').substring(0, 30)}`;
  const cachedResult = apiCache.get(cacheKey);
  if (cachedResult) {
    console.log('✅ Returning cached follow-up');
    return cachedResult;
  }

  const systemMessage = {
    role: 'system',
    content: `You are Doubtly AI, a helpful teacher. The user is asking a follow-up question about a previous answer. Provide a clear, helpful response.`,
  };

  const messages = [
    systemMessage,
    { role: 'user', content: originalQuestion },
    { role: 'assistant', content: originalAnswer },
  ];

  if (previousFollowUps && Array.isArray(previousFollowUps)) {
    for (const fu of previousFollowUps) {
      messages.push({ role: 'user', content: fu.question });
      messages.push({ role: 'assistant', content: fu.answer });
    }
  }

  messages.push({ role: 'user', content: followUpQuestion });

  let response;

  // Try Kimi first (for coding or if it was the original provider)
  if (process.env.KIMI_API_KEY && (questionType === 'coding' || aiProvider === 'nvidia-kimi')) {
    try {
      const completion = await kimiClient.chat.completions.create({
        model: 'moonshotai/kimi-k2-instruct',
        messages,
      });
      response = completion.choices[0]?.message?.content;
    } catch (kimiError) {
      console.warn(`⚠ Kimi follow-up failed, falling back to Gemini: ${kimiError.message}`);
    }
  }

  // Fallback to Gemini
  if (!response && process.env.GEMINI_API_KEY) {
    try {
      const model = genAI.getGenerativeModel({
        model: DEFAULT_MODEL,
        systemInstruction: systemMessage.content,
      });

      const contextPrompt = `Original question: ${originalQuestion}\n\nOriginal answer: ${originalAnswer}\n\n${
        previousFollowUps && previousFollowUps.length > 0
          ? previousFollowUps.map(fu => `Follow-up Q: ${fu.question}\nFollow-up A: ${fu.answer}`).join('\n\n') + '\n\n'
          : ''
      }New follow-up question: ${followUpQuestion}`;

      const result = await model.generateContent(contextPrompt);
      response = result.response.text();
    } catch (geminiError) {
      throw new Error(`Follow-up generation failed: ${geminiError.message}`);
    }
  }

  if (!response) {
    throw new Error('No AI provider available for follow-up generation');
  }

  apiCache.set(cacheKey, response);
  return response;
};

// ================= PRACTICE =================

const generatePracticeQuestions = async (questionText) => {
  try {
    // Try Kimi first
    if (process.env.KIMI_API_KEY) {
      const completion = await kimiClient.chat.completions.create({
        model: 'moonshotai/kimi-k2-instruct',
        messages: [
          {
            role: 'user',
            content: `Generate 3 similar questions:\n${questionText}`,
          },
        ],
      });

      const text = completion.choices[0]?.message?.content || '';

      return text
        .split('\n')
        .filter((line) => line.match(/^\d+/))
        .map((line) => line.replace(/^\d+\.\s*/, ''))
        .slice(0, 3);
    }

    // Fallback to Gemini
    if (process.env.GEMINI_API_KEY) {
      const model = genAI.getGenerativeModel({ model: DEFAULT_MODEL });
      const result = await model.generateContent(
        `Generate 3 similar practice questions based on:\n${questionText}\n\nFormat each on a new line starting with a number.`
      );
      const text = result.response.text();
      return text
        .split('\n')
        .filter((line) => line.match(/^\d+/))
        .map((line) => line.replace(/^\d+\.\s*/, ''))
        .slice(0, 3);
    }

    return [];
  } catch (error) {
    console.warn(`⚠ Practice question generation failed: ${error.message}`);
    return [];
  }
};

// ================= EXTRACTORS =================

const extractKeyConcepts = (response = '') => {
  return response
    .split('\n')
    .filter((line) => line.startsWith('-'))
    .map((line) => line.replace('-', '').trim())
    .slice(0, 5);
};

const extractFinalAnswer = (response = '') => {
  const match = response.match(/Final Answer[:\s]*(.*)/i);
  return match ? match[1] : '';
};

// ================= EXPORT =================

module.exports = {
  detectQuestionType,
  generateExplanation,
  generateFollowUp,
  generatePracticeQuestions,
};