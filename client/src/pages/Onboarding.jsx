// client/src/pages/Onboarding.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  FaGraduationCap, 
  FaArrowRight, 
  FaArrowLeft,
  FaBook,
  FaBriefcase,
  FaLightbulb,
  FaCheckCircle
} from 'react-icons/fa';
import './Onboarding.css';

const Onboarding = () => {
  const { user, updateProfile } = useAuth();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    purpose: '',
    academicGoals: [],
    subjects: [],
    skillLevel: {},
    learningStyle: '',
    availableHours: '',
    preferredStudyTime: '',
  });

  const totalSteps = 5;

  // Step 1: Purpose Selection
  const purposes = [
    { 
      id: 'academic', 
      title: 'Academic Excellence', 
      description: 'Improve grades and master subjects',
      icon: <FaGraduationCap />
    },
    { 
      id: 'career', 
      title: 'Career Preparation', 
      description: 'Build skills for future career',
      icon: <FaBriefcase />
    },
    { 
      id: 'learning', 
      title: 'Personal Learning', 
      description: 'Explore new topics and interests',
      icon: <FaLightbulb />
    },
  ];

  // Step 2: Academic Goals
  const academicGoalsList = [
    'Improve GPA',
    'Pass all exams',
    'Master difficult subjects',
    'Complete assignments on time',
    'Prepare for entrance exams',
    'Build study habits',
    'Reduce study stress',
    'Get better grades',
  ];

  // Step 3: Subjects (based on user's course)
  const subjectsByDiscipline = {
    'Computer Science': ['Programming', 'Data Structures', 'Algorithms', 'Database', 'Web Development', 'AI/ML', 'Operating Systems', 'Networking'],
    'Information Technology': ['Programming', 'Database', 'Web Development', 'Networking', 'Cybersecurity', 'Cloud Computing', 'Software Engineering'],
    'Electronics Engineering': ['Circuit Theory', 'Digital Electronics', 'Microprocessors', 'Signals & Systems', 'Communication Systems', 'Control Systems'],
    'Mechanical Engineering': ['Thermodynamics', 'Fluid Mechanics', 'Machine Design', 'Manufacturing', 'Strength of Materials', 'CAD/CAM'],
    'Civil Engineering': ['Structural Analysis', 'Geotechnical Engineering', 'Transportation', 'Environmental Engineering', 'Construction Management'],
    'Business Administration': ['Marketing', 'Finance', 'Operations Management', 'Human Resources', 'Business Strategy', 'Economics'],
    'default': ['Mathematics', 'Physics', 'Chemistry', 'English', 'Biology', 'Computer Science'],
  };

  // Step 4: Skill Assessment
  const skillLevels = ['Beginner', 'Intermediate', 'Advanced', 'Expert'];

  // Step 5: Learning Preferences
  const learningStyles = [
    { id: 'visual', label: 'Visual (diagrams, videos, images)' },
    { id: 'auditory', label: 'Auditory (lectures, discussions)' },
    { id: 'reading', label: 'Reading/Writing (textbooks, notes)' },
    { id: 'kinesthetic', label: 'Hands-on (practice, projects)' },
  ];

  const studyTimeOptions = [
    { id: 'morning', label: 'Morning (6 AM - 12 PM)' },
    { id: 'afternoon', label: 'Afternoon (12 PM - 6 PM)' },
    { id: 'evening', label: 'Evening (6 PM - 10 PM)' },
    { id: 'night', label: 'Night (10 PM - 2 AM)' },
  ];

  const handlePurposeSelect = (purpose) => {
    setFormData({ ...formData, purpose });
  };

  const handleGoalToggle = (goal) => {
    const goals = formData.academicGoals.includes(goal)
      ? formData.academicGoals.filter(g => g !== goal)
      : [...formData.academicGoals, goal];
    setFormData({ ...formData, academicGoals: goals });
  };

  const handleSubjectToggle = (subject) => {
    const subjects = formData.subjects.includes(subject)
      ? formData.subjects.filter(s => s !== subject)
      : [...formData.subjects, subject];
    setFormData({ ...formData, subjects });
  };

  const handleSkillLevelChange = (subject, level) => {
    setFormData({
      ...formData,
      skillLevel: { ...formData.skillLevel, [subject]: level }
    });
  };

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    try {
      // Calculate knowledge score based on skill levels
      const skillValues = Object.values(formData.skillLevel);
      const avgSkillScore = skillValues.length > 0
        ? skillValues.reduce((acc, level) => {
            const scores = { 'Beginner': 25, 'Intermediate': 50, 'Advanced': 75, 'Expert': 100 };
            return acc + (scores[level] || 0);
          }, 0) / skillValues.length
        : 0;

      // Prepare onboarding data
      const onboardingData = {
        ...formData,
        onboardingCompleted: true,
        knowledgeScore: Math.round(avgSkillScore),
        onboardingDate: new Date().toISOString(),
        recommendedStudyHours: formData.availableHours,
      };

      // Update user profile with onboarding data
      await updateProfile(onboardingData);

      // Navigate to assessment if academic purpose
      if (formData.purpose === 'academic' && formData.subjects.length > 0) {
        navigate('/assessment-test', { state: { subjects: formData.subjects } });
      } else {
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Failed to save onboarding data:', error);
    }
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        return formData.purpose !== '';
      case 2:
        return formData.academicGoals.length > 0;
      case 3:
        return formData.subjects.length > 0;
      case 4:
        return formData.subjects.every(subject => formData.skillLevel[subject]);
      case 5:
        return formData.learningStyle && formData.availableHours && formData.preferredStudyTime;
      default:
        return false;
    }
  };

  const getSubjects = () => {
    return subjectsByDiscipline[user?.course] || subjectsByDiscipline.default;
  };

  return (
    <div className="onboarding-container">
      <div className="onboarding-card">
        {/* Progress Bar */}
        <div className="onboarding-progress">
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${(currentStep / totalSteps) * 100}%` }}
            />
          </div>
          <p className="progress-text">Step {currentStep} of {totalSteps}</p>
        </div>

        {/* Step 1: Purpose */}
        {currentStep === 1 && (
          <div className="onboarding-step">
            <h2 className="step-title">What brings you here?</h2>
            <p className="step-subtitle">Help us understand your goals</p>
            <div className="purpose-grid">
              {purposes.map((purpose) => (
                <div
                  key={purpose.id}
                  className={`purpose-card ${formData.purpose === purpose.id ? 'selected' : ''}`}
                  onClick={() => handlePurposeSelect(purpose.id)}
                >
                  <div className="purpose-icon">{purpose.icon}</div>
                  <h3 className="purpose-title">{purpose.title}</h3>
                  <p className="purpose-description">{purpose.description}</p>
                  {formData.purpose === purpose.id && (
                    <FaCheckCircle className="purpose-check" />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Academic Goals */}
        {currentStep === 2 && (
          <div className="onboarding-step">
            <h2 className="step-title">What are your academic goals?</h2>
            <p className="step-subtitle">Select all that apply</p>
            <div className="goals-grid">
              {academicGoalsList.map((goal) => (
                <button
                  key={goal}
                  className={`goal-chip ${formData.academicGoals.includes(goal) ? 'selected' : ''}`}
                  onClick={() => handleGoalToggle(goal)}
                >
                  {goal}
                  {formData.academicGoals.includes(goal) && <FaCheckCircle />}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 3: Subject Selection */}
        {currentStep === 3 && (
          <div className="onboarding-step">
            <h2 className="step-title">Which subjects do you want to focus on?</h2>
            <p className="step-subtitle">Select at least 3 subjects</p>
            <div className="subjects-grid">
              {getSubjects().map((subject) => (
                <button
                  key={subject}
                  className={`subject-chip ${formData.subjects.includes(subject) ? 'selected' : ''}`}
                  onClick={() => handleSubjectToggle(subject)}
                >
                  <FaBook />
                  {subject}
                  {formData.subjects.includes(subject) && <FaCheckCircle />}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 4: Skill Assessment */}
        {currentStep === 4 && (
          <div className="onboarding-step">
            <h2 className="step-title">Rate your current skill level</h2>
            <p className="step-subtitle">This helps us personalize your experience</p>
            <div className="skill-assessment">
              {formData.subjects.map((subject) => (
                <div key={subject} className="skill-item">
                  <label className="skill-label">{subject}</label>
                  <div className="skill-levels">
                    {skillLevels.map((level) => (
                      <button
                        key={level}
                        className={`skill-button ${formData.skillLevel[subject] === level ? 'selected' : ''}`}
                        onClick={() => handleSkillLevelChange(subject, level)}
                      >
                        {level}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step 5: Learning Preferences */}
        {currentStep === 5 && (
          <div className="onboarding-step">
            <h2 className="step-title">Tell us about your learning style</h2>
            <p className="step-subtitle">This helps us create better study plans</p>
            
            <div className="preference-section">
              <label className="preference-label">Learning Style</label>
              <div className="radio-group">
                {learningStyles.map((style) => (
                  <label key={style.id} className="radio-option">
                    <input
                      type="radio"
                      name="learningStyle"
                      value={style.id}
                      checked={formData.learningStyle === style.id}
                      onChange={(e) => setFormData({ ...formData, learningStyle: e.target.value })}
                    />
                    <span>{style.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="preference-section">
              <label className="preference-label">Hours available per day</label>
              <select
                className="preference-select"
                value={formData.availableHours}
                onChange={(e) => setFormData({ ...formData, availableHours: e.target.value })}
              >
                <option value="">Select hours</option>
                <option value="1-2">1-2 hours</option>
                <option value="2-4">2-4 hours</option>
                <option value="4-6">4-6 hours</option>
                <option value="6+">6+ hours</option>
              </select>
            </div>

            <div className="preference-section">
              <label className="preference-label">Preferred study time</label>
              <div className="radio-group">
                {studyTimeOptions.map((time) => (
                  <label key={time.id} className="radio-option">
                    <input
                      type="radio"
                      name="studyTime"
                      value={time.id}
                      checked={formData.preferredStudyTime === time.id}
                      onChange={(e) => setFormData({ ...formData, preferredStudyTime: e.target.value })}
                    />
                    <span>{time.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="onboarding-actions">
          {currentStep > 1 && (
            <button className="btn-back" onClick={handleBack}>
              <FaArrowLeft /> Back
            </button>
          )}
          {currentStep < totalSteps ? (
            <button 
              className="btn-next" 
              onClick={handleNext}
              disabled={!isStepValid()}
            >
              Next <FaArrowRight />
            </button>
          ) : (
            <button 
              className="btn-submit" 
              onClick={handleSubmit}
              disabled={!isStepValid()}
            >
              {formData.purpose === 'academic' ? 'Take Assessment Test' : 'Get Started'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Onboarding;