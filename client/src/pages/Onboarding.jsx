import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useGamification } from '../context/GamificationContext';
import { getOnboardingQuestions, submitOnboarding } from '../api/onboarding.api';
import {
  FaArrowRight,
  FaArrowLeft,
  FaCheckCircle,
  FaRocket,
  FaBrain,
  FaLightbulb,
  FaBriefcase
} from 'react-icons/fa';
import './Onboarding.css';

const Onboarding = () => {
  const { user, updateProfile } = useAuth();
  const { triggerAction } = useGamification();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [config, setConfig] = useState(null);

  // Adaptive Question State
  const [onboardingDomain, setOnboardingDomain] = useState("Computer Science");
  const [adaptiveSession, setAdaptiveSession] = useState({
    active: false,
    questionsCompleted: 0,
    currentQuestion: null,
    currentDifficulty: 3,
    evaluations: [],
    finalScore: 0
  });
  const [studentAnswer, setStudentAnswer] = useState("");
  const [questionLoading, setQuestionLoading] = useState(false);
  const [feedback, setFeedback] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    interests: [],
    careerGoal: '',
    learningStyle: '',
    selfAssessment: {
      coding: 3,
      problemSolving: 3,
      math: 3
    }
  });

  // Fetch Onboarding Config on Mount
  useEffect(() => {
    const fetchConfig = async () => {
      try {
        setLoading(true);
        const response = await getOnboardingQuestions();
        if (response.success) {
          setConfig(response.data);
        }
      } catch (err) {
        console.error("Failed to load onboarding:", err);
        setError("Failed to load onboarding data. Please try refreshing.");
      } finally {
        setLoading(false);
      }
    };

    fetchConfig();
  }, []);

  const handleNext = () => {
    if (currentStep < 4) setCurrentStep(currentStep + 1);
  };

  const handleBack = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const toggleInterest = (interest) => {
    setFormData(prev => {
      const exists = prev.interests.includes(interest);
      if (exists) {
        return { ...prev, interests: prev.interests.filter(i => i !== interest) };
      } else {
        return { ...prev, interests: [...prev.interests, interest] };
      }
    });
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const payload = {
        ...formData,
      };

      const result = await submitOnboarding(payload);

      if (result.success) {
        if (user) {
          updateProfile({ ...user, onboardingCompleted: true, profileCompleted: true });
        }
        await triggerAction('ONBOARDING_COMPLETE');
        navigate('/dashboard');
      }
    } catch (err) {
      console.error("Submission error:", err);
      setError("Failed to submit onboarding. Please try again.");
      setLoading(false);
    }
  };

  // Adaptive Logic Fetcher
  const startAdaptiveTest = async () => {
    try {
      setQuestionLoading(true);
      const { getAdaptiveQuestion } = await import('../api/onboarding.api');

      // Infer domain from chosen career or default
      const domain = user?.domain || user?.department || user?.qualification || "Technology";
      setOnboardingDomain(domain);

      const res = await getAdaptiveQuestion(domain, 3, null); // Start at diff 3
      setAdaptiveSession({
        active: true,
        questionsCompleted: 0,
        currentQuestion: res.question,
        currentDifficulty: 3,
        evaluations: [],
        finalScore: 0
      });
    } catch (err) {
      console.error(err);
      setError("Failed to generate adaptive test.");
    } finally {
      setQuestionLoading(false);
    }
  };

  const handleAdaptiveSubmit = async () => {
    if (!studentAnswer.trim()) return;

    try {
      setQuestionLoading(true);
      const { evaluateAdaptiveAnswer, getAdaptiveQuestion } = await import('../api/onboarding.api');

      // Evaluate Answer
      const evalRes = await evaluateAdaptiveAnswer(
        onboardingDomain,
        adaptiveSession.currentQuestion,
        studentAnswer
      );

      const newEvaluations = [...adaptiveSession.evaluations, evalRes.evaluation];
      const newCompleted = adaptiveSession.questionsCompleted + 1;

      setFeedback(evalRes.evaluation);

      let xpGained = 0;
      if (evalRes.evaluation.score >= 0.6) {
        xpGained = Math.ceil(evalRes.nextDifficulty * 10);
        triggerAction('CORRECT_ANSWER', xpGained);
      }
      setFeedback({ ...evalRes.evaluation, xpGained });

      // Calculate Next Step
      if (newCompleted >= 5) {
        // Done with 5 questions
        const avgScore = newEvaluations.reduce((acc, curr) => acc + curr.score, 0) / 5;

        // Map the final score back to our generic selfAssessment form format
        setFormData(prev => ({
          ...prev,
          selfAssessment: { coding: Math.ceil(evalRes.nextDifficulty), problemSolving: Math.ceil(evalRes.nextDifficulty), math: 3 }
        }));

        setTimeout(() => {
          setAdaptiveSession(prev => ({ ...prev, active: false, questionsCompleted: 5, finalScore: avgScore }));
          setFeedback(null);
          setQuestionLoading(false);
        }, 3000);
        return;
      }

      setTimeout(async () => {
        // Fetch Next Question
        const previousAnalysis = {
          score: evalRes.evaluation.score,
          weaknesses: evalRes.evaluation.weaknesses,
        };

        const qRes = await getAdaptiveQuestion(onboardingDomain, evalRes.nextDifficulty, previousAnalysis);

        setAdaptiveSession(prev => ({
          ...prev,
          currentQuestion: qRes.question,
          currentDifficulty: evalRes.nextDifficulty,
          questionsCompleted: newCompleted,
          evaluations: newEvaluations
        }));

        setFeedback(null);
        setStudentAnswer("");
        setQuestionLoading(false);
      }, 3000); // Wait 3 seconds to let them read feedback

    } catch (err) {
      console.error(err);
      setError("Error checking answer");
      setQuestionLoading(false);
    }
  };

  // --- RENDERERS ---

  // Step 1: Adaptive Knowledge Test
  const renderStep1 = () => {
    if (questionLoading && !feedback) return <div className="loading-spinner">Analyzing Domain & Generating...</div>;

    if (!adaptiveSession.active && adaptiveSession.questionsCompleted === 0) {
      const uDomain = user?.domain || user?.department || user?.qualification || "Technology";
      return (
        <div className="onboarding-step fade-in text-center">
          <div className="step-header">
            <span className="step-badge">Step 1 of 4</span>
          </div>
          <h2>Adaptive Diagnostic Test</h2>
          <p>We're going to ask you up to 5 quick questions based on your academic path ({uDomain}) to test your conceptual depth.</p>
          {user?.syllabusUrl && (
            <p style={{ color: '#4ade80', marginTop: '10px' }}>
              <FaCheckCircle style={{ display: 'inline', marginRight: '5px' }} />
              We found your college syllabus! The test will be aligned with your curriculum.
            </p>
          )}
          <p style={{ marginTop: '15px' }}>The difficulty will scale dynamically based on your answers!</p>
          <button className="btn-primary-large mt-4" onClick={startAdaptiveTest}>
            Start Diagnostic <FaBrain />
          </button>
        </div>
      );
    }

    if (!adaptiveSession.active && adaptiveSession.questionsCompleted >= 5) {
      return (
        <div className="onboarding-step fade-in text-center">
          <h2>Diagnostic Complete!</h2>
          <p style={{ fontSize: '24px', margin: '20px 0' }}>Your average score: <strong>{Math.round(adaptiveSession.finalScore * 100)}%</strong></p>
          <p>We've successfully calibrated your academic baseline profile.</p>
          <p style={{ color: '#a78bfa', marginTop: '10px' }}>Click Next to continue with your preferences.</p>
        </div>
      )
    }

    return (
      <div className="onboarding-step fade-in">
        <div className="diagnostic-question-container">
          <div className="diagnostic-question-header">
            <span className="step-badge">Question {adaptiveSession.questionsCompleted + 1} of 5</span>
            <span className="difficulty-badge">Level {Math.round(adaptiveSession.currentDifficulty)}</span>
          </div>
          <div className="diagnostic-question-content">
            <p>{adaptiveSession.currentQuestion?.question}</p>
          </div>
        </div>

        {feedback && (
          <div className={`feedback-card ${feedback.score > 0.6 ? 'positive' : 'negative'}`} style={{ position: 'relative' }}>
            {feedback.xpGained > 0 && <div className="g-floating-xp" style={{ top: -20, right: 20 }}>+{feedback.xpGained} XP</div>}
            <h4>Score: {Math.round(feedback.score * 100)}%</h4>
            <p>{feedback.conceptStrength}</p>
            {feedback.weaknesses?.length > 0 && <p><strong>Areas to review:</strong> {feedback.weaknesses.join(", ")}</p>}
            <p><em>{adaptiveSession.questionsCompleted >= 4 ? 'Evaluating final results...' : 'Generating next question...'}</em></p>
          </div>
        )}

        {!feedback && adaptiveSession.currentQuestion?.options && adaptiveSession.currentQuestion.options.length > 0 ? (
          <div className="options-grid">
            {adaptiveSession.currentQuestion.options.map(opt => (
              <div key={opt} className={`option-row ${studentAnswer === opt ? 'selected' : ''}`} onClick={() => setStudentAnswer(opt)}>
                <div className="radio-circle">
                  {studentAnswer === opt && <div className="inner-circle" />}
                </div>
                <span>{opt}</span>
              </div>
            ))}
            <button className="btn-primary mt-4" disabled={!studentAnswer} onClick={handleAdaptiveSubmit}>Submit Answer</button>
          </div>
        ) : !feedback && (
          <div className="diagnostic-textarea-wrapper">
            <p style={{ color: "var(--game-text-muted)", fontSize: "14px", fontStyle: "italic", marginBottom: "8px", marginLeft: "4px" }}>
              Take your time and explain your answer clearly to bypass the security wall...
            </p>
            <textarea
              className="diagnostic-textarea"
              rows="5"
              placeholder="Type your analytical response here..."
              value={studentAnswer}
              onChange={(e) => setStudentAnswer(e.target.value)}
            ></textarea>
            <div className="diagnostic-submit-wrapper">
              <button className="btn-primary diagnostic-submit-btn" disabled={!studentAnswer.trim()} onClick={handleAdaptiveSubmit}>
                SUBMIT PROTOCOL <FaRocket />
              </button>
            </div>
          </div>
        )}
      </div>
    )
  };

  // Step 2: Interests
  const renderStep2 = () => (
    <div className="onboarding-step fade-in">
      <div className="step-header">
        <span className="step-badge">Step 2 of 4</span>
        <h2>Your Interests</h2>
        <p>Select the topics that excite you the most.</p>
      </div>

      <div className="interests-grid">
        {config?.interests?.map((interest) => (
          <div
            key={interest}
            className={`interest-chip ${formData.interests.includes(interest) ? 'active' : ''}`}
            onClick={() => toggleInterest(interest)}
          >
            {interest}
            {formData.interests.includes(interest) && <FaCheckCircle className="check-icon" />}
          </div>
        ))}
      </div>
    </div>
  );

  // Step 3: Career & Learning Style
  const renderStep3 = () => (
    <div className="onboarding-step fade-in">
      <div className="step-header">
        <span className="step-badge">Step 3 of 4</span>
        <h2>Future & Style</h2>
        <p>Tell us about your goals and how you learn best.</p>
      </div>

      <div className="split-layout">
        <div className="form-group">
          <label><FaBriefcase /> Career Goal</label>
          <div className="option-list scrollable-list">
            {config?.careerGoals?.map(goal => (
              <div
                key={goal}
                className={`option-row ${formData.careerGoal === goal ? 'selected' : ''}`}
                onClick={() => setFormData({ ...formData, careerGoal: goal })}
              >
                <div className="radio-circle">
                  {formData.careerGoal === goal && <div className="inner-circle" />}
                </div>
                <span>{goal}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="form-group">
          <label><FaLightbulb /> Learning Style</label>
          <div className="option-list">
            {config?.learningStyles?.map(style => (
              <div
                key={style.id}
                className={`option-row ${formData.learningStyle === style.id ? 'selected' : ''}`}
                onClick={() => setFormData({ ...formData, learningStyle: style.id })}
              >
                <div className="radio-circle">
                  {formData.learningStyle === style.id && <div className="inner-circle" />}
                </div>
                <span>{style.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  // Step 4: Final Submission
  const renderStep4 = () => (
    <div className="onboarding-step fade-in text-center">
      <h2>Great Job!</h2>
      <p>We've calibrated our system based on your proficiency. Click below to launch your dashboard!</p>
      <div className="launch-area text-center mt-8">
        <button className="btn-primary-large" onClick={handleSubmit}>
          Complete Onboarding <FaRocket />
        </button>
      </div>
    </div>
  );

  if (loading && !config) {
    return (
      <div className="onboarding-wrapper">
        <div className="loading-spinner">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="onboarding-wrapper">
        <div className="error-card">
          <h3>Something went wrong</h3>
          <p>{error}</p>
          <button className="btn-primary" onClick={() => window.location.reload()}>Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div className="onboarding-wrapper">
      <div className="onboarding-main-card">
        <div className="step-content">
          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
          {currentStep === 3 && renderStep3()}
          {currentStep === 4 && renderStep4()}
        </div>

        <div className="navigation-footer">
          <button
            className="btn-text"
            onClick={handleBack}
            disabled={currentStep === 1 || (currentStep === 1 && adaptiveSession.active)}
            style={{ visibility: currentStep === 1 ? 'hidden' : 'visible' }}
          >
            <FaArrowLeft /> Back
          </button>

          <div className="step-dots">
            {[1, 2, 3, 4].map(s => (
              <div key={s} className={`dot ${s === currentStep ? 'active' : ''} ${s < currentStep ? 'completed' : ''}`} />
            ))}
          </div>

          {currentStep < 4 ? (
            <button
              className="btn-primary"
              onClick={handleNext}
              disabled={
                (currentStep === 1 && (!adaptiveSession.active && adaptiveSession.questionsCompleted < 5)) ||
                (currentStep === 1 && adaptiveSession.active) ||
                (currentStep === 2 && formData.interests.length === 0) ||
                (currentStep === 3 && (!formData.careerGoal || !formData.learningStyle))
              }
            >
              Next <FaArrowRight />
            </button>
          ) : (
            <div style={{ width: '80px' }}></div> // Spacer
          )}
        </div>
      </div>
    </div>
  );
};

export default Onboarding;