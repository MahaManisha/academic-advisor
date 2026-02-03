// client/src/pages/Onboarding.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  FaGraduationCap,
  FaArrowRight,
  FaArrowLeft,
  FaBook,
  FaBriefcase,
  FaLightbulb,
  FaCheckCircle,
  FaRocket,
  FaUserGraduate,
  FaLaptopCode,
  FaBookOpen,
  FaClock
} from 'react-icons/fa';
import { analyzeCourse } from '../api/nlp.api';
import './Onboarding.css';



const Onboarding = () => {
  const { user, updateProfile } = useAuth();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [nlpData, setNlpData] = useState(null);
  const [loadingNLP, setLoadingNLP] = useState(false);

  // Simplified Form Data
  const [formData, setFormData] = useState({
    focus: '', // Academic vs Career vs Research
    experienceLevel: 50, // 0-100 slider
    learningMode: '', // Visual / Hands-on / Theory
    weeklyHours: 10,
  });

  const totalSteps = 3;

  // Initialize & Fetch NLP Analysis & Config
  useEffect(() => {
    const init = async () => {
      // Fetch Config
      try {
        // We assume axios instance handles baseURL
        const confRes = await import('../api/axios').then(m => m.default.get('/config/onboarding'));
        if (confRes.data.success && confRes.data.data.focusAreas) {
          // Update local constants or state if we were fully dynamic
          // For now, let's stick to the structure but we could save it to state
          // To keep it simple in this refactor, I'll allow the hardcoded defaults to be overwritten 
          // by the API data if I had stored them in state.
          // REFACTOR: Store options in state
          setOptions(confRes.data.data);
        }
      } catch (e) {
        console.log("Using default config");
      }

      if (user?.course) {
        setLoadingNLP(true);
        try {
          const data = await analyzeCourse(user.course);
          if (data.success) {
            setNlpData(data.analysis);
            if (data.analysis.learningpath) {
              setFormData(prev => ({ ...prev, learningMode: data.analysis.learningpath }));
            }
          }
        } catch (err) {
          console.error("NLP Analysis failed:", err);
        } finally {
          setLoadingNLP(false);
        }
      }
    };
    init();
  }, [user]);

  // Dynamic Options State using defaults
  const [options, setOptions] = useState({
    focusAreas: [
      { id: 'academic', title: 'Boost GPA', icon: <FaBookOpen />, desc: 'Master course material' },
      { id: 'career', title: 'Career Prep', icon: <FaLaptopCode />, desc: 'Build job-ready skills' },
      { id: 'research', title: 'Research', icon: <FaUserGraduate />, desc: 'Deep theoretical dive' }
    ],
    learningModes: [
      { id: 'visual', label: 'Visual', desc: 'Videos, Diagrams, Slides' },
      { id: 'hands-on', label: 'Hands-on', desc: 'Projects, Labs, Coding' },
      { id: 'reading', label: 'Theory', desc: 'Textbooks, Papers, Notes' }
    ]
  });

  const handleNext = () => {
    if (currentStep < totalSteps) setCurrentStep(currentStep + 1);
  };

  const handleBack = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const handleSubmit = async () => {
    try {
      const onboardingData = {
        ...formData, // Save simplified preferences
        onboardingCompleted: true,
        knowledgeScore: formData.experienceLevel, // Simplified baseline
        onboardingDate: new Date().toISOString(),
        // NLP Metadata
        archetype: nlpData?.archetype,
        domain: nlpData?.domain
      };

      await updateProfile(onboardingData);

      // Smart Redirect: Always to Assessment for initial benchmarking
      navigate('/assessment-test', { state: { subjects: nlpData?.suggestedSkills || [] } });
    } catch (error) {
      console.error('Failed to save onboarding:', error);
    }
  };

  // Step 1: Strategic Context
  const renderStep1 = () => (
    <div className="onboarding-step fade-in">
      <div className="step-header">
        <span className="step-badge">Step 1 of 3</span>
        <h2>Welcome, {user?.fullName?.split(' ')[0]}!</h2>
        <p>Let's tailor the platform for your <strong>{user?.course || 'Academic'}</strong> journey.</p>
      </div>

      <div className="form-group">
        <label>What is your primary focus this semester?</label>
        <div className="card-grid">
          {options.focusAreas.map(opt => (
            <div
              key={opt.id}
              className={`selection-card ${formData.focus === opt.id ? 'active' : ''}`}
              onClick={() => setFormData({ ...formData, focus: opt.id })}
            >
              {/* Dynamic Icon rendering is tricky without map, utilizing fallback or simple check */}
              <div className="card-icon">
                {opt.id === 'academic' ? <FaBookOpen /> : opt.id === 'career' ? <FaLaptopCode /> : <FaUserGraduate />}
              </div>
              <h3>{opt.title}</h3>
              <p>{opt.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // Step 2: Intelligent Profile
  const renderStep2 = () => (
    <div className="onboarding-step fade-in">
      <div className="step-header">
        <span className="step-badge">Step 2 of 3</span>
        <h2>Your Learning Profile</h2>
        <p>We analyzed your major. Customize how you learn best.</p>
      </div>

      <div className="split-layout">
        <div className="form-group">
          <label>Experience Level in {nlpData?.domain || 'your field'}</label>
          <div className="slider-container">
            <input
              type="range"
              min="0"
              max="100"
              value={formData.experienceLevel}
              onChange={(e) => setFormData({ ...formData, experienceLevel: parseInt(e.target.value) })}
              className="custom-range"
            />
            <div className="range-labels">
              <span>Beginner</span>
              <span>Intermediate</span>
              <span>Expert</span>
            </div>
            <div className="current-val-bubble" style={{ left: `${formData.experienceLevel}%` }}>
              {formData.experienceLevel}%
            </div>
          </div>
        </div>

        <div className="form-group">
          <label>Preferred Learning Mode</label>
          <div className="option-list">
            {options.learningModes.map(mode => (
              <div
                key={mode.id}
                className={`option-row ${formData.learningMode === mode.id ? 'selected' : ''}`}
                onClick={() => setFormData({ ...formData, learningMode: mode.id })}
              >
                <div className="radio-circle">
                  {formData.learningMode === mode.id && <div className="inner-circle" />}
                </div>
                <div className="option-text">
                  <strong>{mode.label}</strong>
                  <span>{mode.desc}</span>
                </div>
                {nlpData?.learningpath === mode.id && <span className="rec-badge">Recommended</span>}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  // Step 3: Launch
  const renderStep3 = () => (
    <div className="onboarding-step fade-in text-center">
      <div className="launch-icon">
        <FaRocket />
      </div>
      <h2>You're All Set!</h2>
      <p>We have built a personalized curriculum for <strong>{user?.course}</strong>.</p>

      <div className="summary-box">
        <div className="summary-item">
          <FaCheckCircle className="text-green" />
          <span>Focus: <strong>{formData.focus || 'General'}</strong></span>
        </div>
        <div className="summary-item">
          <FaCheckCircle className="text-green" />
          <span>Level: <strong>{formData.experienceLevel > 70 ? 'Advanced' : formData.experienceLevel > 30 ? 'Intermediate' : 'Beginner'}</strong></span>
        </div>
      </div>

      <div className="action-area">
        <p className="sub-text">Let's verify your skills with a quick diagnostic.</p>
        <button className="btn-primary-large" onClick={handleSubmit}>
          Start Diagnostic Test <FaArrowRight />
        </button>
      </div>
    </div>
  );

  return (
    <div className="onboarding-wrapper">
      <div className="onboarding-main-card">
        {loadingNLP && (
          <div className="nlp-loading-bar">
            <span>Analyzing course curriculum...</span>
            <div className="loading-line" />
          </div>
        )}

        <div className="step-content">
          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
          {currentStep === 3 && renderStep3()}
        </div>

        {currentStep < 3 && (
          <div className="navigation-footer">
            <button
              className="btn-text"
              onClick={handleBack}
              disabled={currentStep === 1}
              style={{ visibility: currentStep === 1 ? 'hidden' : 'visible' }}
            >
              <FaArrowLeft /> Back
            </button>

            <div className="step-dots">
              {[1, 2, 3].map(s => (
                <div key={s} className={`dot ${s === currentStep ? 'active' : ''} ${s < currentStep ? 'completed' : ''}`} />
              ))}
            </div>

            <button
              className="btn-primary"
              onClick={handleNext}
              disabled={
                (currentStep === 1 && !formData.focus) ||
                (currentStep === 2 && !formData.learningMode)
              }
            >
              Next <FaArrowRight />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Onboarding;