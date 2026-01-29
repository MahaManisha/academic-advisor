// client/src/pages/AssessmentTest.jsx
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaClock, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import './AssessmentTest.css';

const AssessmentTest = () => {
  const { user, updateProfile } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const subjects = location.state?.subjects || [];

  const [currentSubject, setCurrentSubject] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(1800); // 30 minutes
  const [showResults, setShowResults] = useState(false);
  const [results, setResults] = useState(null);

  // Sample questions by subject (in real app, fetch from backend)
  const questionBank = {
    'Programming': [
      {
        id: 1,
        question: 'What is the time complexity of binary search?',
        options: ['O(n)', 'O(log n)', 'O(n²)', 'O(1)'],
        correct: 1,
        difficulty: 'medium'
      },
      {
        id: 2,
        question: 'Which data structure uses LIFO principle?',
        options: ['Queue', 'Stack', 'Array', 'Tree'],
        correct: 1,
        difficulty: 'easy'
      },
      {
        id: 3,
        question: 'What does OOP stand for?',
        options: ['Object Oriented Programming', 'Object Operative Programming', 'Oriented Object Programming', 'None of the above'],
        correct: 0,
        difficulty: 'easy'
      },
    ],
    'Data Structures': [
      {
        id: 4,
        question: 'Which data structure is best for implementing recursion?',
        options: ['Queue', 'Stack', 'Array', 'Linked List'],
        correct: 1,
        difficulty: 'medium'
      },
      {
        id: 5,
        question: 'What is the average case time complexity of Quick Sort?',
        options: ['O(n)', 'O(n log n)', 'O(n²)', 'O(log n)'],
        correct: 1,
        difficulty: 'hard'
      },
    ],
    'Database': [
      {
        id: 6,
        question: 'What does SQL stand for?',
        options: ['Structured Query Language', 'Simple Query Language', 'Standard Query Language', 'Sequential Query Language'],
        correct: 0,
        difficulty: 'easy'
      },
      {
        id: 7,
        question: 'Which is NOT a type of database constraint?',
        options: ['Primary Key', 'Foreign Key', 'Unique', 'Optional'],
        correct: 3,
        difficulty: 'medium'
      },
    ],
  };

  // Generate questions for selected subjects
  const [questions, setQuestions] = useState([]);

  useEffect(() => {
    const generatedQuestions = [];
    subjects.forEach(subject => {
      if (questionBank[subject]) {
        generatedQuestions.push(...questionBank[subject].map(q => ({ ...q, subject })));
      }
    });
    setQuestions(generatedQuestions);
  }, [subjects]);

  // Timer
  useEffect(() => {
    if (timeLeft > 0 && !showResults) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0) {
      handleSubmit();
    }
  }, [timeLeft, showResults]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAnswerSelect = (questionId, optionIndex) => {
    setAnswers({ ...answers, [questionId]: optionIndex });
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const calculateResults = () => {
    let totalScore = 0;
    let subjectScores = {};
    let difficultyScores = { easy: 0, medium: 0, hard: 0 };

    questions.forEach(question => {
      const isCorrect = answers[question.id] === question.correct;
      
      if (isCorrect) {
        totalScore++;
        
        // Subject-wise score
        if (!subjectScores[question.subject]) {
          subjectScores[question.subject] = { correct: 0, total: 0 };
        }
        subjectScores[question.subject].correct++;
      }

      // Track difficulty performance
      if (question.difficulty) {
        if (isCorrect) difficultyScores[question.difficulty]++;
      }

      // Subject totals
      if (!subjectScores[question.subject]) {
        subjectScores[question.subject] = { correct: 0, total: 0 };
      }
      subjectScores[question.subject].total++;
    });

    const percentageScore = ((totalScore / questions.length) * 100).toFixed(1);
    
    // Determine proficiency level
    let proficiencyLevel = 'Beginner';
    if (percentageScore >= 80) proficiencyLevel = 'Expert';
    else if (percentageScore >= 60) proficiencyLevel = 'Advanced';
    else if (percentageScore >= 40) proficiencyLevel = 'Intermediate';

    return {
      totalScore,
      totalQuestions: questions.length,
      percentageScore,
      subjectScores,
      difficultyScores,
      proficiencyLevel,
      strengths: Object.entries(subjectScores)
        .filter(([_, data]) => (data.correct / data.total) >= 0.7)
        .map(([subject]) => subject),
      weaknesses: Object.entries(subjectScores)
        .filter(([_, data]) => (data.correct / data.total) < 0.5)
        .map(([subject]) => subject),
    };
  };

  const handleSubmit = async () => {
    const testResults = calculateResults();
    setResults(testResults);
    setShowResults(true);

    // Save assessment results to user profile
    const assessmentData = {
      assessmentCompleted: true,
      assessmentDate: new Date().toISOString(),
      assessmentResults: testResults,
      knowledgeScore: testResults.percentageScore,
      proficiencyLevel: testResults.proficiencyLevel,
      strengths: testResults.strengths,
      weaknesses: testResults.weaknesses,
    };

    try {
      await updateProfile(assessmentData);
    } catch (error) {
      console.error('Failed to save assessment results:', error);
    }
  };

  const handleGoToDashboard = () => {
    navigate('/dashboard');
  };

  if (questions.length === 0) {
    return (
      <div className="assessment-container">
        <div className="assessment-card">
          <h2>No questions available</h2>
          <p>Please complete the onboarding process first.</p>
          <button onClick={() => navigate('/onboarding')} className="btn-primary">
            Go to Onboarding
          </button>
        </div>
      </div>
    );
  }

  if (showResults) {
    return (
      <div className="assessment-container">
        <div className="results-card">
          <div className="results-header">
            <FaCheckCircle className="results-icon success" />
            <h2 className="results-title">Assessment Complete!</h2>
            <p className="results-subtitle">Here's your performance analysis</p>
          </div>

          <div className="results-score">
            <div className="score-circle">
              <div className="score-value">{results.percentageScore}%</div>
              <div className="score-label">Overall Score</div>
            </div>
            <div className="score-details">
              <p>{results.totalScore} out of {results.totalQuestions} correct</p>
              <div className="proficiency-badge">{results.proficiencyLevel}</div>
            </div>
          </div>

          <div className="results-breakdown">
            <h3>Subject-wise Performance</h3>
            {Object.entries(results.subjectScores).map(([subject, data]) => {
              const percentage = ((data.correct / data.total) * 100).toFixed(0);
              return (
                <div key={subject} className="subject-result">
                  <div className="subject-result-header">
                    <span className="subject-name">{subject}</span>
                    <span className="subject-score">{data.correct}/{data.total}</span>
                  </div>
                  <div className="subject-progress">
                    <div 
                      className="subject-progress-fill" 
                      style={{ 
                        width: `${percentage}%`,
                        background: percentage >= 70 ? '#10b981' : percentage >= 50 ? '#f59e0b' : '#ef4444'
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {results.strengths.length > 0 && (
            <div className="results-insights">
              <h4>💪 Your Strengths</h4>
              <div className="insights-list">
                {results.strengths.map(subject => (
                  <span key={subject} className="insight-tag strength">{subject}</span>
                ))}
              </div>
            </div>
          )}

          {results.weaknesses.length > 0 && (
            <div className="results-insights">
              <h4>📚 Areas to Improve</h4>
              <div className="insights-list">
                {results.weaknesses.map(subject => (
                  <span key={subject} className="insight-tag weakness">{subject}</span>
                ))}
              </div>
            </div>
          )}

          <button className="btn-dashboard" onClick={handleGoToDashboard}>
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const currentQ = questions[currentQuestion];

  return (
    <div className="assessment-container">
      <div className="assessment-card">
        <div className="assessment-header">
          <div className="assessment-info">
            <h2 className="assessment-title">Knowledge Assessment</h2>
            <p className="assessment-subtitle">{currentQ.subject}</p>
          </div>
          <div className="assessment-timer">
            <FaClock />
            <span>{formatTime(timeLeft)}</span>
          </div>
        </div>

        <div className="assessment-progress">
          <div className="progress-text">
            Question {currentQuestion + 1} of {questions.length}
          </div>
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
            />
          </div>
        </div>

        <div className="question-section">
          <h3 className="question-text">{currentQ.question}</h3>
          <div className="options-list">
            {currentQ.options.map((option, index) => (
              <button
                key={index}
                className={`option-button ${answers[currentQ.id] === index ? 'selected' : ''}`}
                onClick={() => handleAnswerSelect(currentQ.id, index)}
              >
                <span className="option-letter">{String.fromCharCode(65 + index)}</span>
                <span className="option-text">{option}</span>
                {answers[currentQ.id] === index && <FaCheckCircle className="option-check" />}
              </button>
            ))}
          </div>
        </div>

        <div className="assessment-actions">
          <button 
            className="btn-secondary" 
            onClick={handlePrevious}
            disabled={currentQuestion === 0}
          >
            Previous
          </button>
          {currentQuestion < questions.length - 1 ? (
            <button className="btn-primary" onClick={handleNext}>
              Next
            </button>
          ) : (
            <button className="btn-submit-test" onClick={handleSubmit}>
              Submit Test
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AssessmentTest;