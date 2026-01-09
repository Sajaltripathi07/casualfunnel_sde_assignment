import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { quizAPI } from '../services/api';
import './ReportPage.css';

const ReportPage = () => {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadReport = async () => {
      if (!sessionId) {
        setError('Invalid session ID');
        setLoading(false);
        return;
      }

      try {
        const [questionsData, sessionData] = await Promise.all([
          quizAPI.getQuestions(),
          quizAPI.getSession(sessionId),
        ]);

        setQuestions(questionsData);
        setAnswers(sessionData.answers);
        setEmail(sessionData.email);
        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to load report');
        setLoading(false);
      }
    };

    loadReport();
  }, [sessionId]);

  const calculateScore = () => {
    let correct = 0;
    questions.forEach((question, index) => {
      if (answers[index] === question.correct_answer) {
        correct++;
      }
    });
    return correct;
  };

  const getScorePercentage = () => {
    if (questions.length === 0) return 0;
    return Math.round((calculateScore() / questions.length) * 100);
  };

  if (loading) {
    return (
      <div className="report-page">
        <div className="loading">Loading report...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="report-page">
        <div className="error">{error}</div>
        <button onClick={() => navigate('/')} className="back-button">
          Go to Start
        </button>
      </div>
    );
  }

  const score = calculateScore();
  const percentage = getScorePercentage();

  return (
    <div className="report-page">
      <div className="report-container">
        <div className="report-header">
          <h1 className="report-title">Quiz Results</h1>
          <p className="report-email">Email: {email}</p>
          <div className="score-summary">
            <div className="score-card">
              <div className="score-value">{score}/{questions.length}</div>
              <div className="score-label">Correct Answers</div>
            </div>
            <div className="score-card">
              <div className="score-value">{percentage}%</div>
              <div className="score-label">Score</div>
            </div>
          </div>
        </div>

        <div className="questions-report">
          {questions.map((question, index) => {
            const userAnswer = answers[index];
            const correctAnswer = question.correct_answer;
            const isCorrect = userAnswer === correctAnswer;

            return (
              <div key={index} className={`question-report-card ${isCorrect ? 'correct' : 'incorrect'}`}>
                <div className="question-header">
                  <span className="question-number-badge">Question {index + 1}</span>
                  {isCorrect ? (
                    <span className="status-badge correct-badge">✓ Correct</span>
                  ) : (
                    <span className="status-badge incorrect-badge">✗ Incorrect</span>
                  )}
                </div>
                
                <div className="question-text-report">
                  <strong>Q:</strong> {question.question}
                </div>

                <div className="answers-comparison">
                  <div className={`answer-box ${isCorrect ? 'correct-answer' : 'user-answer'}`}>
                    <div className="answer-label">Your Answer:</div>
                    <div className="answer-text">
                      {userAnswer || 'Not answered'}
                    </div>
                  </div>
                  
                  {!isCorrect && (
                    <div className="answer-box correct-answer">
                      <div className="answer-label">Correct Answer:</div>
                      <div className="answer-text">{correctAnswer}</div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="report-actions">
          <button onClick={() => navigate('/')} className="back-button">
            Take Another Quiz
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReportPage;

