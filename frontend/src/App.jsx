import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import StartPage from './components/StartPage';
import QuizPage from './components/QuizPage';
import ReportPage from './components/ReportPage';
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<StartPage />} />
        <Route path="/quiz/:sessionId" element={<QuizPage />} />
        <Route path="/report/:sessionId" element={<ReportPage />} />
      </Routes>
    </Router>
  );
}

export default App;

