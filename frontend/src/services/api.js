// /home/pawankumar/Desktop/Doubtly/frontend/src/services/api.js
// API service for communicating with the Doubtly backend

import axios from 'axios';

const normalizeApiBase = (value) => {
  if (!value) return '/api';
  return value.endsWith('/') ? value.slice(0, -1) : value;
};

const API_BASE = normalizeApiBase(import.meta.env.VITE_API_BASE_URL || '/api');

const api = axios.create({
  baseURL: API_BASE,
  timeout: 120000, // 2 min timeout for AI processing
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Solve a doubt — send text and/or image to the backend
 * @param {Object} params
 * @param {string} [params.questionText] - Text question
 * @param {File} [params.image] - Image file
 * @param {boolean} [params.eli5Mode] - Explain Like I'm 5 mode
 * @param {string} [params.category] - Question category
 * @returns {Promise<Object>} - Solved doubt data
 */
export const solveDoubt = async ({ questionText, image, eli5Mode = false, category = 'general' }) => {
  const formData = new FormData();

  if (questionText) {
    formData.append('questionText', questionText);
  }
  if (image) {
    formData.append('image', image);
  }
  formData.append('eli5Mode', eli5Mode.toString());
  formData.append('category', category);

  const response = await api.post('/doubts/solve', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data;
};

/**
 * Get history of past doubts
 * @param {Object} params
 * @param {number} [params.page] - Page number
 * @param {number} [params.limit] - Items per page
 * @param {string} [params.category] - Filter by category
 * @returns {Promise<Object>} - History data with pagination
 */
export const getHistory = async ({ page = 1, limit = 20, category = 'all' } = {}) => {
  const response = await api.get('/doubts/history', {
    params: { page, limit, category },
  });
  return response.data;
};

/**
 * Get a single doubt by ID
 * @param {string} id - Doubt ID
 * @returns {Promise<Object>} - Doubt data
 */
export const getDoubtById = async (id) => {
  const response = await api.get(`/doubts/${id}`);
  return response.data;
};

/**
 * Ask a follow-up question
 * @param {string} doubtId - Original doubt ID
 * @param {string} question - Follow-up question
 * @returns {Promise<Object>} - Follow-up answer
 */
export const askFollowUp = async (doubtId, question) => {
  const response = await api.post(`/doubts/${doubtId}/followup`, { question });
  return response.data;
};

/**
 * Delete a doubt
 * @param {string} id - Doubt ID
 * @returns {Promise<Object>} - Deletion confirmation
 */
export const deleteDoubt = async (id) => {
  const response = await api.delete(`/doubts/${id}`);
  return response.data;
};

/**
 * Health check
 */
export const healthCheck = async () => {
  const response = await api.get('/health');
  return response.data;
};

export default api;
