import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { quizAPI } from '../services/api';
import './StartPage.css';

const StartPage = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setLoading(true);
    try {
      const { sessionId } = await quizAPI.startQuiz(email);
      navigate(`/quiz/${sessionId}`);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to start quiz. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="start-page">
      <div className="start-container">
        <h1 className="start-title">Welcome to the Quiz</h1>
        <p className="start-description">
          Test your knowledge with 15 challenging questions. You'll have 30 minutes to complete the quiz.
        </p>
        <form onSubmit={handleSubmit} className="start-form">
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
              disabled={loading}
              className="email-input"
            />
          </div>
          {error && <div className="error-message">{error}</div>}
          <button type="submit" disabled={loading} className="start-button">
            {loading ? 'Starting...' : 'Start Quiz'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default StartPage;

