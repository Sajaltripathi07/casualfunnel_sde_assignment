import axios from 'axios';

const API_BASE_URL = 'https://casualfunnel-sde-assignment.onrender.com';

const api = axios.create({
  baseURL: API_BASE_URL,
});

export const quizAPI = {
  getQuestions: async () => {
    const response = await api.get('/api/quiz/questions');
    return response.data;
  },

  startQuiz: async (email) => {
    const response = await api.post('/api/quiz/start', { email });
    return response.data;
  },

  saveAnswer: async (sessionId, questionIndex, answer) => {
    await api.post('/api/quiz/answer', { sessionId, questionIndex, answer });
  },

  markVisited: async (sessionId, questionIndex) => {
    await api.post('/api/quiz/visit', { sessionId, questionIndex });
  },

  getSession: async (sessionId) => {
    const response = await api.get(`/api/quiz/session/${sessionId}`);
    return response.data;
  },

  completeQuiz: async (sessionId) => {
    await api.post('/api/quiz/complete', { sessionId });
  },
};

