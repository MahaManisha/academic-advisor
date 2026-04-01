import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useGamification } from '../context/GamificationContext';
import { getOnboardingQuestions, submitOnboarding } from '../api/onboarding.api';
import { getDiagnosticTest, evaluateDiagnosticTest } from '../api/onboarding.api';
import {
  FaArrowRight,
  FaArrowLeft,
  FaCheckCircle,
  FaRocket,
  FaBrain,
  FaLightbulb,
  FaBriefcase,
  FaMagic
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

  // Diagnostic Test State
  const [onboardingDomain, setOnboardingDomain] = useState("Technology");
  const [diagnosticSession, setDiagnosticSession] = useState({
    active: false,
    questions: [],
    completed: false,
    finalScore: 0
  });
  
  // Maps question id to user's selected answer
  const [studentAnswers, setStudentAnswers] = useState({});
  const [questionLoading, setQuestionLoading] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [aiSuggestionsReady, setAiSuggestionsReady] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    interests: [],
    careerGoal: '',
    learningStyle: '',
    selfAssessment: { coding: 3, problemSolving: 3, math: 3 }
  });

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

  const handleNext = () => { if (currentStep < 4) setCurrentStep(currentStep + 1); };
  const handleBack = () => { if (currentStep > 1) setCurrentStep(currentStep - 1); };

  const toggleInterest = (interest) => {
    setFormData(prev => {
      const exists = prev.interests.includes(interest);
      if (exists) return { ...prev, interests: prev.interests.filter(i => i !== interest) };
      return { ...prev, interests: [...prev.interests, interest] };
    });
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const result = await submitOnboarding(formData);
      if (result.success) {
        if (user) updateProfile({ ...user, onboardingCompleted: true, profileCompleted: true });
        await triggerAction('ONBOARDING_COMPLETE');
        navigate('/dashboard');
      }
    } catch (err) {
      console.error("Submission error:", err);
      setError("Failed to submit onboarding. Please try again.");
      setLoading(false);
    }
  };

  const startDiagnosticTest = async () => {
    try {
      setQuestionLoading(true);
      const domain = user?.domain || user?.department || user?.qualification || "Technology";
      setOnboardingDomain(domain);
      const res = await getDiagnosticTest(domain);
      
      setDiagnosticSession({
        active: true,
        questions: res.questions || [],
        completed: false,
        finalScore: 0
      });
    } catch (err) {
      console.error(err);
      setError("Failed to generate diagnostic test.");
    } finally {
      setQuestionLoading(false);
    }
  };

  const handleDiagnosticSubmit = async () => {
    // Ensure all questions are answered
    if (Object.keys(studentAnswers).length < diagnosticSession.questions.length && diagnosticSession.questions.length > 0) {
       alert("Please answer all questions before submitting.");
       return;
    }

    try {
      setQuestionLoading(true);
      const evalRes = await evaluateDiagnosticTest(
        onboardingDomain,
        diagnosticSession.questions,
        studentAnswers
      );
      
      const { score, conceptStrength, weaknesses, suggestedInterests, suggestedCareerGoals, suggestedLearningStyle } = evalRes.evaluation;
      
      setFeedback(evalRes.evaluation);
      
      let xpGained = Math.ceil(score * 100);
      if (score >= 0.6) triggerAction('CORRECT_ANSWER', xpGained);

      const skillLvl = score >= 0.8 ? 5 : (score >= 0.5 ? 3 : 1);
      
      // Auto-fill Step 2 & 3 based on AI suggestions!
      setFormData(prev => ({
        ...prev,
        interests: suggestedInterests || [],
        careerGoal: suggestedCareerGoals?.[0] || prev.careerGoal,
        learningStyle: suggestedLearningStyle || prev.learningStyle,
        selfAssessment: { coding: skillLvl, problemSolving: skillLvl, math: 3 }
      }));

      setDiagnosticSession(prev => ({ ...prev, active: false, completed: true, finalScore: score }));
      setAiSuggestionsReady(true);
      
    } catch (err) {
      console.error(err);
      setError("Error evaluating diagnostic test.");
    } finally {
      setQuestionLoading(false);
    }
  };

  // --- RENDERERS ---

  const renderStep1 = () => {
    if (questionLoading && !diagnosticSession.active && !diagnosticSession.completed) {
       return <div className="loading-spinner">Generating 15 Mixed Difficulty Questions...</div>;
    }

    if (!diagnosticSession.active && !diagnosticSession.completed) {
      const uDomain = user?.domain || user?.department || user?.qualification || "Technology";
      return (
        <div className="onboarding-step fade-in text-center">
          <div className="step-header">
            <span className="step-badge">Step 1 of 4</span>
          </div>
          <h2>Diagnostic Test</h2>
          <p>We're going to generate a diagnostic test of mixed difficulty (Easy, Medium, Hard) to assess your conceptual depth in <strong>{uDomain}</strong>.</p>
          <p style={{ marginTop: '15px' }}>Let AI analyze your skills and automatically suggest your career goals and interests!</p>
          <button className="btn-primary-large mt-4" onClick={startDiagnosticTest}>
            Start Diagnostic <FaBrain />
          </button>
        </div>
      );
    }

    if (diagnosticSession.completed && feedback) {
      return (
        <div className="onboarding-step fade-in text-center">
          <h2>Diagnostic Complete!</h2>
          <div className="feedback-card positive" style={{ margin: '20px auto', maxWidth: '600px' }}>
             <h4>Score: {Math.round(diagnosticSession.finalScore * 100)}%</h4>
             <p>{feedback.conceptStrength}</p>
             {feedback.weaknesses?.length > 0 && <p><strong>Areas to review:</strong> {feedback.weaknesses.join(", ")}</p>}
          </div>
          <p style={{ color: '#4ade80', fontSize: '18px', marginTop: '10px' }}>
            <FaMagic style={{ display: 'inline', marginRight: '5px' }} />
            AI has generated personalized suggestions for your interests and career path!
          </p>
          <button className="btn-primary-large mt-4" onClick={handleNext}>
            Review AI Suggestions <FaArrowRight />
          </button>
        </div>
      )
    }

    if (questionLoading) {
        return <div className="loading-spinner">Evaluating your answers and generating AI suggestions...</div>;
    }

    return (
      <div className="onboarding-step fade-in">
        <div className="step-header">
           <span className="step-badge">Full Diagnostic</span>
           <h2>Answer the Questions</h2>
           <p>Complete this comprehensive test so our AI can fully calibrate your profile.</p>
        </div>
        
        <div className="scrollable-test-container" style={{ maxHeight: '55vh', overflowY: 'auto', paddingRight: '15px', marginTop: '20px' }}>
           {diagnosticSession.questions.map((q, index) => (
             <div key={q.id || index} className="diagnostic-question-container" style={{ marginBottom: '25px', padding: '15px', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>
               <div className="diagnostic-question-header" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                 <span className="step-badge" style={{ padding: '4px 8px', fontSize: '12px' }}>Q{index + 1}</span>
                 <span className={`difficulty-badge diff-${q.difficulty?.toLowerCase()}`} style={{ fontWeight: 600, color: q.difficulty === 'Easy' ? '#4ade80' : q.difficulty === 'Medium' ? '#facc15' : '#f87171' }}>{q.difficulty}</span>
               </div>
               <div className="diagnostic-question-content" style={{ fontSize: '16px', marginBottom: '15px' }}>
                 <p>{q.question}</p>
               </div>
               {q.options && q.options.length > 0 ? (
                 <div className="options-grid" style={{ gridTemplateColumns: '1fr', gap: '8px' }}>
                   {q.options.map(opt => (
                     <div 
                       key={opt} 
                       className={`option-row ${studentAnswers[q.id || index] === opt ? 'selected' : ''}`} 
                       onClick={() => setStudentAnswers(prev => ({ ...prev, [q.id || index]: opt }))}
                       style={{ padding: '12px', cursor: 'pointer', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: studentAnswers[q.id || index] === opt ? 'rgba(167, 139, 250, 0.2)' : 'transparent', display: 'flex', alignItems: 'center' }}
                     >
                       <div className="radio-circle" style={{ marginRight: '10px', width: '20px', height: '20px', borderRadius: '50%', border: '2px solid rgba(255,255,255,0.3)', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                         {studentAnswers[q.id || index] === opt && <div className="inner-circle" style={{ width: '10px', height: '10px', backgroundColor: '#a78bfa', borderRadius: '50%' }} />}
                       </div>
                       <span>{opt}</span>
                     </div>
                   ))}
                 </div>
               ) : (
                 <textarea
                   className="diagnostic-textarea"
                   rows="3"
                   placeholder="Your answer..."
                   value={studentAnswers[q.id || index] || ""}
                   onChange={(e) => setStudentAnswers(prev => ({ ...prev, [q.id || index]: e.target.value }))}
                   style={{ width: '100%', padding: '10px', borderRadius: '8px', background: 'rgba(0,0,0,0.2)', color: '#fff', border: '1px solid rgba(255,255,255,0.1)' }}
                 ></textarea>
               )}
             </div>
           ))}
        </div>
        <div style={{ textAlign: 'center', marginTop: '25px' }}>
           <button 
             className="btn-primary-large" 
             onClick={handleDiagnosticSubmit}
           >
             Submit Diagnostic <FaRocket />
           </button>
        </div>
      </div>
    );
  };

  const renderStep2 = () => (
    <div className="onboarding-step fade-in">
      <div className="step-header">
        <span className="step-badge">Step 2 of 4</span>
        <h2>Your Interests</h2>
        {aiSuggestionsReady && (
          <div style={{ backgroundColor: 'rgba(167, 139, 250, 0.1)', padding: '12px', borderRadius: '8px', marginBottom: '20px', border: '1px solid rgba(167, 139, 250, 0.3)', textAlign: 'left' }}>
             <p style={{ color: '#d8b4fe', margin: 0, fontSize: '15px' }}>
               <FaMagic style={{ display: 'inline', marginRight: '8px' }} />
               <strong>AI Pre-selected:</strong> Based on your diagnostic test performance. Feel free to tweak them!
             </p>
          </div>
        )}
      </div>

      <div className="interests-grid">
        {(config?.interests || []).concat(formData.interests.filter(i => !config?.interests?.includes(i))).map((interest) => (
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

  const renderStep3 = () => (
    <div className="onboarding-step fade-in">
      <div className="step-header">
        <span className="step-badge">Step 3 of 4</span>
        <h2>Future & Style</h2>
        {aiSuggestionsReady && (
          <div style={{ backgroundColor: 'rgba(167, 139, 250, 0.1)', padding: '12px', borderRadius: '8px', marginBottom: '20px', border: '1px solid rgba(167, 139, 250, 0.3)', textAlign: 'left' }}>
             <p style={{ color: '#d8b4fe', margin: 0, fontSize: '15px' }}>
               <FaMagic style={{ display: 'inline', marginRight: '8px' }} />
               <strong>AI Suggested Path:</strong> Tailored specifically to your strengths and weaknesses.
             </p>
          </div>
        )}
      </div>

      <div className="split-layout">
        <div className="form-group">
          <label><FaBriefcase /> Career Goal</label>
          <div className="option-list scrollable-list">
            {(config?.careerGoals || []).concat(formData.careerGoal && !config?.careerGoals?.includes(formData.careerGoal) ? [formData.careerGoal] : []).map(goal => (
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
            {(config?.learningStyles || []).concat(formData.learningStyle && !config?.learningStyles?.find(s => s.id === formData.learningStyle || s.label === formData.learningStyle) ? [{id: formData.learningStyle, label: formData.learningStyle}] : []).map(style => (
              <div
                key={style.id}
                className={`option-row ${formData.learningStyle === style.id || formData.learningStyle === style.label ? 'selected' : ''}`}
                onClick={() => setFormData({ ...formData, learningStyle: style.label })}
              >
                <div className="radio-circle">
                  {(formData.learningStyle === style.id || formData.learningStyle === style.label) && <div className="inner-circle" />}
                </div>
                <span>{style.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

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

  if (loading && !config) return <div className="onboarding-wrapper"><div className="loading-spinner">Loading...</div></div>;
  
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
            disabled={currentStep === 1 || (currentStep === 1 && diagnosticSession.active)}
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
                (currentStep === 1 && !diagnosticSession.completed) ||
                (currentStep === 2 && formData.interests.length === 0) ||
                (currentStep === 3 && (!formData.careerGoal || !formData.learningStyle))
              }
            >
              Next <FaArrowRight />
            </button>
          ) : (
            <div style={{ width: '80px' }}></div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Onboarding;