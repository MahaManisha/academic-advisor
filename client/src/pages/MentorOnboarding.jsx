import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import './Onboarding.css'; // Reusing onboarding styles
import { FaBrain, FaRocket, FaCheckCircle } from 'react-icons/fa';

const MentorOnboarding = () => {
  const { user, updateProfile } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [assessment, setAssessment] = useState(null);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);

  const startAssessment = async () => {
    setLoading(true);
    try {
      // Assuming user.domain is fetched correctly from the mentor profile or auth context
      const domain = user?.domain || 'Technology';
      const response = await api.post('/mentor/generate-assessment', { domain });
      if (response.data.success) {
        setAssessment(response.data.assessment);
      }
    } catch (err) {
      console.error(err);
      alert('Failed to generate assessment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const submitAssessment = async () => {
    if (Object.keys(answers).length < assessment.questions.length) {
      alert('Please answer all questions before submitting.');
      return;
    }

    setLoading(true);
    try {
      // Construct an array of answers matching the questions order
      const answersArray = assessment.questions.map((_, index) => answers[index]);
      const response = await api.post('/mentor/evaluate-assessment', {
        answers: answersArray,
        questions: assessment.questions
      });

      if (response.data.success) {
        setResult(response.data);
        // Immediately update local AuthContext to reflect completion!
        updateProfile({ ...user, onboardingCompleted: true });
      }
    } catch (err) {
      console.error(err);
      alert('Evaluation failed.');
    } finally {
      setLoading(false);
    }
  };

  if (result) {
    return (
      <div className="onboarding-wrapper">
        <div className="onboarding-step text-center fade-in">
          <h2>Assessment Complete!</h2>
          <div className="feedback-card positive" style={{ maxWidth: '500px', margin: '20px auto' }}>
            <h3>Your Score: {result.score} / {assessment.questions.length}</h3>
            <h4>Initial Rating: {result.rating.toFixed(1)} ⭐</h4>
            {result.status === 'approved' ? (
              <p style={{ color: '#4ade80' }}>Congratulations! You have been approved as a Mentor. <FaCheckCircle /></p>
            ) : (
              <p style={{ color: '#facc15' }}>Your profile is pending manual review.</p>
            )}
          </div>
          <button className="btn-primary-large mt-4" onClick={() => navigate('/mentor-dashboard')}>
            Go to Dashboard <FaRocket />
          </button>
        </div>
      </div>
    );
  }

  if (assessment) {
    return (
      <div className="onboarding-wrapper">
        <div className="onboarding-step fade-in">
          <div className="step-header text-center">
            <h2>{assessment.title}</h2>
            <p>Answer the following domain-specific questions to calibrate your profile.</p>
          </div>

          <div className="scrollable-test-container" style={{ maxHeight: '60vh', overflowY: 'auto', padding: '20px' }}>
            {assessment.questions.map((q, index) => (
              <div key={index} className="diagnostic-question-container" style={{ marginBottom: '25px', padding: '15px', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>
                <p style={{ fontSize: '16px', marginBottom: '15px' }}>{index + 1}. {q.question}</p>
                <div className="options-grid">
                  {q.options.map((opt) => (
                    <div 
                      key={opt}
                      className={`option-row ${answers[index] === opt ? 'selected' : ''}`}
                      onClick={() => setAnswers(prev => ({ ...prev, [index]: opt }))}
                      style={{ padding: '12px', cursor: 'pointer', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: answers[index] === opt ? 'rgba(167, 139, 250, 0.2)' : 'transparent', display: 'flex', alignItems: 'center' }}
                    >
                      <div className="radio-circle" style={{ marginRight: '10px', width: '20px', height: '20px', borderRadius: '50%', border: '2px solid rgba(255,255,255,0.3)', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                        {answers[index] === opt && <div className="inner-circle" style={{ width: '10px', height: '10px', backgroundColor: '#a78bfa', borderRadius: '50%' }} />}
                      </div>
                      <span>{opt}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-4">
            <button className="btn-primary-large" onClick={submitAssessment} disabled={loading}>
              {loading ? 'Evaluating...' : 'Submit Assessment'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="onboarding-wrapper">
      <div className="onboarding-step text-center fade-in">
        <h2>Mentor Skill Calibration</h2>
        <p>Before you start guiding students, our AI needs to assess your expertise in your chosen domain.</p>
        <button className="btn-primary-large mt-8" onClick={startAssessment} disabled={loading}>
          {loading ? 'Generating Assessment...' : <><FaBrain style={{ marginRight: '8px' }} /> Start Domain Test</>}
        </button>
      </div>
    </div>
  );
};

export default MentorOnboarding;
