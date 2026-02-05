import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getOnboardingQuestions, submitOnboarding } from '../api/onboarding.api';
import {
  FaArrowRight,
  FaArrowLeft,
  FaCheckCircle,
  FaRocket,
  FaCode,
  FaBrain,
  FaCalculator,
  FaLightbulb,
  FaUserGraduate,
  FaBriefcase
} from 'react-icons/fa';
import './Onboarding.css';

const Onboarding = () => {
  const { user, updateProfile } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [config, setConfig] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    subjects: {}, // { "Maths": 3, "Physics": 4 }
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
          // Initialize subjects with default middle value (3)
          const initialSubjects = {};
          response.data.subjects.forEach(sub => {
            initialSubjects[sub] = 3;
          });
          setFormData(prev => ({ ...prev, subjects: initialSubjects }));
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
      // Transform subjects object to array of objects for backend
      const payload = {
        ...formData,
        subjects: Object.entries(formData.subjects).map(([name, proficiency]) => ({
          name,
          proficiency
        }))
      };

      const result = await submitOnboarding(payload);

      if (result.success) {
        // Update local auth context
        if (user) {
          updateProfile({ ...user, onboardingCompleted: true, profileCompleted: true });
        }
        // Redirect to dashboard
        navigate('/dashboard');
      }
    } catch (err) {
      console.error("Submission error:", err);
      setError("Failed to submit onboarding. Please try again.");
      setLoading(false);
    }
  };

  // --- RENDERERS ---

  // Step 1: Subject Proficiency
  const renderStep1 = () => (
    <div className="onboarding-step fade-in">
      <div className="step-header">
        <span className="step-badge">Step 1 of 4</span>
        <h2>Subject Proficiency</h2>
        <p>Rate your comfort level with your semester subjects (1 = Beginner, 5 = Expert).</p>
      </div>

      <div className="subjects-grid">
        {config?.subjects?.map((subject) => (
          <div key={subject} className="subject-slider-row">
            <div className="subject-label">{subject}</div>
            <div className="slider-wrapper">
              <input
                type="range"
                min="1"
                max="5"
                step="1"
                value={formData.subjects[subject] || 3}
                onChange={(e) => setFormData({
                  ...formData,
                  subjects: { ...formData.subjects, [subject]: parseInt(e.target.value) }
                })}
                className="custom-range"
              />
              <div className="slider-value">{formData.subjects[subject] || 3}/5</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

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

  // Step 4: Self Assessment
  const renderStep4 = () => (
    <div className="onboarding-step fade-in">
      <div className="step-header">
        <span className="step-badge">Step 4 of 4</span>
        <h2>Self Assessment</h2>
        <p>Honestly rate your core skills to help us personalize your plan.</p>
      </div>

      <div className="assessment-sliders">
        {/* Coding */}
        <div className="assessment-item">
          <label><FaCode /> Coding Skills</label>
          <div className="slider-wrapper">
            <input
              type="range"
              min="1"
              max="5"
              value={formData.selfAssessment.coding}
              onChange={(e) => setFormData({
                ...formData,
                selfAssessment: { ...formData.selfAssessment, coding: parseInt(e.target.value) }
              })}
              className="custom-range"
            />
            <div className="slider-value">{formData.selfAssessment.coding}/5</div>
          </div>
        </div>

        {/* Problem Solving */}
        <div className="assessment-item">
          <label><FaBrain /> Problem Solving</label>
          <div className="slider-wrapper">
            <input
              type="range"
              min="1"
              max="5"
              value={formData.selfAssessment.problemSolving}
              onChange={(e) => setFormData({
                ...formData,
                selfAssessment: { ...formData.selfAssessment, problemSolving: parseInt(e.target.value) }
              })}
              className="custom-range"
            />
            <div className="slider-value">{formData.selfAssessment.problemSolving}/5</div>
          </div>
        </div>

        {/* Math */}
        <div className="assessment-item">
          <label><FaCalculator /> Mathematical Aptitude</label>
          <div className="slider-wrapper">
            <input
              type="range"
              min="1"
              max="5"
              value={formData.selfAssessment.math}
              onChange={(e) => setFormData({
                ...formData,
                selfAssessment: { ...formData.selfAssessment, math: parseInt(e.target.value) }
              })}
              className="custom-range"
            />
            <div className="slider-value">{formData.selfAssessment.math}/5</div>
          </div>
        </div>
      </div>

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
            disabled={currentStep === 1}
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