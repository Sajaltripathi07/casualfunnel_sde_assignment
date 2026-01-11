const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: "https://casualfunnel-sde-assignment.vercel.app",
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type"],
}));

app.options("*", cors());
app.use(express.json());

const quizSessions = new Map();
let cachedQuestions = null;
let cacheTimestamp = null;
const CACHE_DURATION = 5 * 60 * 1000;

const fetchQuestionsWithRetry = async (retries = 3, delay = 1000) => {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await axios.get('https://opentdb.com/api.php?amount=15', {
        timeout: 10000
      });
      
      if (!response.data || !response.data.results) {
        throw new Error('Invalid response from OpenTDB');
      }
      
      const questions = response.data.results;
      
      if (!questions || questions.length === 0) {
        throw new Error('No questions received from OpenTDB');
      }
      
      return questions.map(q => ({
        question: decodeHtml(q.question),
        correct_answer: decodeHtml(q.correct_answer),
        incorrect_answers: q.incorrect_answers.map(ans => decodeHtml(ans)),
        type: q.type,
        difficulty: q.difficulty,
        category: q.category
      }));
    } catch (error) {
      if (error.response && error.response.status === 429) {
        const waitTime = delay * Math.pow(2, i);
        console.log(`Rate limited. Waiting ${waitTime}ms before retry ${i + 1}/${retries}`);
        if (i < retries - 1) {
          await new Promise(resolve => setTimeout(resolve, waitTime));
          continue;
        }
      }
      
      if (i === retries - 1) {
        throw error;
      }
      
      await new Promise(resolve => setTimeout(resolve, delay * (i + 1)));
    }
  }
};

app.get('/api/quiz/questions', async (req, res) => {
  try {
    if (cachedQuestions && cacheTimestamp && (Date.now() - cacheTimestamp) < CACHE_DURATION) {
      console.log('Returning cached questions');
      return res.json(cachedQuestions);
    }
    
    console.log('Fetching new questions from OpenTDB...');
    const decodedQuestions = await fetchQuestionsWithRetry();
    
    cachedQuestions = decodedQuestions;
    cacheTimestamp = Date.now();
    
    res.json(decodedQuestions);
  } catch (error) {
    console.error('Error fetching questions:', error.message);
    
    if (error.response && error.response.status === 429) {
      res.status(429).json({ 
        error: 'Quiz service is temporarily unavailable due to high demand. Please try again in a few moments.' 
      });
    } else if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
      res.status(500).json({ error: 'Unable to connect to quiz service. Please check your internet connection.' });
    } else if (error.code === 'ECONNABORTED') {
      res.status(500).json({ error: 'Request timeout. Please try again.' });
    } else {
      res.status(500).json({ error: 'Failed to fetch quiz questions: ' + error.message });
    }
  }
});

function decodeHtml(html) {
  if (!html) return '';
  
  const entityMap = {
    '&quot;': '"', '&#039;': "'", '&amp;': '&',
    '&lt;': '<', '&gt;': '>', '&nbsp;': ' ',
    '&eacute;': 'é', '&ouml;': 'ö', '&uuml;': 'ü',
    '&aacute;': 'á', '&iacute;': 'í', '&oacute;': 'ó',
    '&uacute;': 'ú', '&ntilde;': 'ñ',
    '&ldquo;': '"', '&rdquo;': '"',
    '&lsquo;': "'", '&rsquo;': "'"
  };
  
  return html
    .replace(/&#(\d+);/g, (match, dec) => String.fromCharCode(parseInt(dec, 10)))
    .replace(/&#x([0-9a-fA-F]+);/g, (match, hex) => String.fromCharCode(parseInt(hex, 16)))
    .replace(/&[a-z]+;/gi, (match) => entityMap[match.toLowerCase()] || match);
}

app.post('/api/quiz/start', (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }
  
  const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  quizSessions.set(sessionId, {
    email,
    startTime: Date.now(),
    answers: {},
    visited: new Set(),
    completed: false
  });
  
  res.json({ sessionId });
});

app.post('/api/quiz/answer', (req, res) => {
  const { sessionId, questionIndex, answer } = req.body;
  
  if (!quizSessions.has(sessionId)) {
    return res.status(404).json({ error: 'Session not found' });
  }
  
  const session = quizSessions.get(sessionId);
  session.answers[questionIndex] = answer;
  session.visited.add(questionIndex);
  
  res.json({ success: true });
});

app.post('/api/quiz/visit', (req, res) => {
  const { sessionId, questionIndex } = req.body;
  
  if (!quizSessions.has(sessionId)) {
    return res.status(404).json({ error: 'Session not found' });
  }
  
  const session = quizSessions.get(sessionId);
  session.visited.add(questionIndex);
  
  res.json({ success: true });
});

app.get('/api/quiz/session/:sessionId', (req, res) => {
  const { sessionId } = req.params;
  
  if (!quizSessions.has(sessionId)) {
    return res.status(404).json({ error: 'Session not found' });
  }
  
  const session = quizSessions.get(sessionId);
  res.json({
    email: session.email,
    startTime: session.startTime,
    answers: session.answers,
    visited: Array.from(session.visited),
    completed: session.completed
  });
});

app.post('/api/quiz/complete', (req, res) => {
  const { sessionId } = req.body;
  
  if (!quizSessions.has(sessionId)) {
    return res.status(404).json({ error: 'Session not found' });
  }
  
  const session = quizSessions.get(sessionId);
  session.completed = true;
  
  res.json({ success: true });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

