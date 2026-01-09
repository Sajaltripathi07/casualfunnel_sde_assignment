import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { quizAPI } from '../services/api';
import './QuizPage.css';

const QUIZ_DURATION = 30 * 60 * 1000;

const QuizPage = () => {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [visited, setVisited] = useState(new Set());
  const [timeRemaining, setTimeRemaining] = useState(QUIZ_DURATION);
  const [startTime, setStartTime] = useState(null);
  const [questionChoices, setQuestionChoices] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const shuffleArray = (array) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  const initializeChoices = (questionsData) => {
    const choices = {};
    questionsData.forEach((question, index) => {
      choices[index] = shuffleArray([question.correct_answer, ...question.incorrect_answers]);
    });
    setQuestionChoices(choices);
  };

  useEffect(() => {
    const loadQuiz = async () => {
      try {
        const [questionsData, sessionData] = await Promise.all([
          quizAPI.getQuestions(),
          sessionId ? quizAPI.getSession(sessionId) : null,
        ]);

        setQuestions(questionsData);
        initializeChoices(questionsData);
        
        if (sessionData) {
          setAnswers(sessionData.answers);
          setVisited(new Set(sessionData.visited));
          setStartTime(sessionData.startTime);
          
          const elapsed = Date.now() - sessionData.startTime;
          const remaining = Math.max(0, QUIZ_DURATION - elapsed);
          setTimeRemaining(remaining);
          
          if (sessionData.completed || remaining <= 0) {
            navigate(`/report/${sessionId}`);
            return;
          }
        }

        setLoading(false);
      } catch (err) {
        console.error('Error loading quiz:', err);
        let errorMessage = 'Failed to load quiz. Please check if the backend server is running.';
        
        if (err.response) {
          if (err.response.status === 429) {
            errorMessage = 'Quiz service is temporarily unavailable due to high demand. Please wait a moment and refresh the page.';
          } else {
            errorMessage = err.response.data?.error || err.message || errorMessage;
          }
        } else if (err.message) {
          errorMessage = err.message;
        }
        
        setError(errorMessage);
        setLoading(false);
      }
    };

    loadQuiz();
  }, [sessionId, navigate]);

  useEffect(() => {
    if (questions.length > 0 && sessionId) {
      const markVisited = async () => {
        try {
          await quizAPI.markVisited(sessionId, currentQuestionIndex);
          setVisited(prev => new Set(prev).add(currentQuestionIndex));
        } catch (err) {
          console.error('Failed to mark question as visited:', err);
        }
      };
      markVisited();
    }
  }, [currentQuestionIndex, questions.length, sessionId]);

  const handleSubmitRef = useRef();
  
  const handleSubmit = useCallback(async () => {
    if (!sessionId) return;

    try {
      await quizAPI.completeQuiz(sessionId);
      navigate(`/report/${sessionId}`);
    } catch (err) {
      console.error('Failed to complete quiz:', err);
    }
  }, [sessionId, navigate]);

  handleSubmitRef.current = handleSubmit;

  useEffect(() => {
    if (loading || !sessionId || !startTime) return;

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, QUIZ_DURATION - elapsed);
      
      setTimeRemaining(remaining);
      
      if (remaining <= 0 && handleSubmitRef.current) {
        handleSubmitRef.current();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [loading, sessionId, startTime]);

  const formatTime = (ms) => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleAnswerSelect = async (answer) => {
    if (!sessionId) return;

    const newAnswers = { ...answers, [currentQuestionIndex]: answer };
    setAnswers(newAnswers);

    try {
      await quizAPI.saveAnswer(sessionId, currentQuestionIndex, answer);
    } catch (err) {
      console.error('Failed to save answer:', err);
    }
  };

  const goToQuestion = (index) => {
    if (index >= 0 && index < questions.length) {
      setCurrentQuestionIndex(index);
    }
  };

  if (loading) {
    return (
      <div className="quiz-page">
        <div className="loading">Loading quiz...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="quiz-page">
        <div className="error">{error}</div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="quiz-page">
        <div className="error">No questions available</div>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const choices = questionChoices[currentQuestionIndex] || [];
  const currentAnswer = answers[currentQuestionIndex];

  return (
    <div className="quiz-page">
      <div className="quiz-header">
        <div className="timer">
          <span className="timer-label">Time Remaining:</span>
          <span className={`timer-value ${timeRemaining < 5 * 60 * 1000 ? 'warning' : ''}`}>
            {formatTime(timeRemaining)}
          </span>
        </div>
        <div className="question-counter">
          Question {currentQuestionIndex + 1} of {questions.length}
        </div>
      </div>

      <div className="quiz-content">
        <div className="question-panel">
          <div className="question-card">
            <h2 className="question-text">{currentQuestion.question}</h2>
            <div className="choices">
              {choices.map((choice, index) => (
                <button
                  key={index}
                  className={`choice-button ${currentAnswer === choice ? 'selected' : ''}`}
                  onClick={() => handleAnswerSelect(choice)}
                >
                  {choice}
                </button>
              ))}
            </div>
          </div>

          <div className="navigation-buttons">
            <button
              onClick={() => goToQuestion(currentQuestionIndex - 1)}
              disabled={currentQuestionIndex === 0}
              className="nav-button"
            >
              Previous
            </button>
            <button
              onClick={() => goToQuestion(currentQuestionIndex + 1)}
              disabled={currentQuestionIndex === questions.length - 1}
              className="nav-button"
            >
              Next
            </button>
            <button onClick={handleSubmit} className="submit-button">
              Submit Quiz
            </button>
          </div>
        </div>

        <div className="overview-panel">
          <h3 className="overview-title">Question Overview</h3>
          <div className="question-grid">
            {questions.map((_, index) => {
              const isVisited = visited.has(index);
              const isAnswered = answers[index] !== undefined;
              const isCurrent = index === currentQuestionIndex;

              return (
                <button
                  key={index}
                  className={`question-number ${isCurrent ? 'current' : ''} ${isAnswered ? 'answered' : ''} ${isVisited ? 'visited' : ''}`}
                  onClick={() => goToQuestion(index)}
                >
                  {index + 1}
                </button>
              );
            })}
          </div>
          <div className="legend">
            <div className="legend-item">
              <span className="legend-color current"></span>
              <span>Current</span>
            </div>
            <div className="legend-item">
              <span className="legend-color answered"></span>
              <span>Answered</span>
            </div>
            <div className="legend-item">
              <span className="legend-color visited"></span>
              <span>Visited</span>
            </div>
            <div className="legend-item">
              <span className="legend-color"></span>
              <span>Not Visited</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizPage;

