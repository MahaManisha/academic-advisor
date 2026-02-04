import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { completeOnboarding } from '../api/auth.api'; // ✅ IMPORTED NEW API
import axiosInstance from '../api/axios';
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
  const { user, login } = useAuth(); // Use login/loadUser to refresh state if needed
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [nlpData, setNlpData] = useState(null);
  const [loadingNLP, setLoadingNLP] = useState(false);

  // ... (rest of state)

  // ... (init useEffect)

  const handleSubmit = async () => {
    try {
      const onboardingData = {
        focus: formData.focus,
        learningMode: formData.learningMode,
        experienceLevel: formData.experienceLevel,
        course: user?.course, // ensure backend receives this if needed or it uses DB value
        year: user?.year // pass year
      };

      const result = await completeOnboarding(onboardingData);

      // Force refresh of auth state to pick up profileCompleted: true
      if (result.success && result.user) {
        // Optionally update context here if a method exists, or reload page. 
        // For now, redirect to assessment
        navigate('/assessment-test', { state: { subjects: nlpData?.suggestedSkills || [] } });
      }

    } catch (error) {
      console.error('Failed to save onboarding:', error);
      // Ideally show UI error
    }
  };

  // Step 1: Strategic Context
  const renderStep1 = () => (
    <div className="onboarding-step fade-in">
      <div className="step-header">
        <span className="step-badge">Step 1 of 3</span>
        <h2>Welcome, {user?.fullName?.split(' ')[0] || 'Student'}!</h2>
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
              <div className="card-icon">
                {ICON_MAP[opt.id] || <FaBookOpen />}
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
      <p>We have built a personalized curriculum for <strong>{user?.course || 'your course'}</strong>.</p>

      <div className="summary-box">
        <div className="summary-item">
          <FaCheckCircle className="text-green" />
          <span>Focus: <strong>{options.focusAreas.find(o => o.id === formData.focus)?.title || formData.focus}</strong></span>
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