// client/src/pages/Mission1AcademicFoundation.jsx
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useGamification } from '../context/GamificationContext';
import { getAcademicFoundation, submitAcademicFoundation } from '../api/career.api';
import {
  FaGraduationCap,
  FaUniversity,
  FaBookOpen,
  FaCode,
  FaProjectDiagram,
  FaCertificate,
  FaFileUpload,
  FaLink,
  FaRocket,
  FaArrowRight,
  FaArrowLeft,
  FaCheckCircle,
  FaTrophy,
  FaExclamationTriangle,
  FaPlus,
  FaTrash,
  FaRobot
} from 'react-icons/fa';


import './Mission1AcademicFoundation.css';

const PRESET_LANGUAGES = [
  'JavaScript', 'Python', 'C++', 'Java', 'TypeScript', 'SQL',
  'HTML/CSS', 'C', 'Rust', 'Go', 'PHP', 'Swift', 'Kotlin', 'R'
];

const Mission1AcademicFoundation = () => {
  const { user, updateProfile } = useAuth();
  const { triggerAction } = useGamification();
  const navigate = useNavigate();
  const canvasRef = useRef(null);

  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [earnedXp, setEarnedXp] = useState(250);

  // Form State
  const [formData, setFormData] = useState({
    collegeName: '',
    university: '',
    degree: 'B.Tech',
    department: 'Computer Science',
    currentYear: 3,
    currentSemester: 5,
    expectedGraduation: new Date().getFullYear() + 1,
    cgpa: '',
    backlogs: '0',
    programmingExperience: 'Intermediate',
    knownLanguages: ['JavaScript', 'Python'],
    completedProjects: [{ title: 'Smart Academic Advisor', description: 'Gamified EdTech portal', link: '' }],
    certifications: [],
    syllabusInputMode: 'url', // 'url' or 'pdf'
    syllabusUrl: '',
    syllabusPdf: null
  });

  const [customLanguageInput, setCustomLanguageInput] = useState('');
  const [customCertInput, setCustomCertInput] = useState('');

  // Load existing profile if available
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const res = await getAcademicFoundation();
        if (res.success && res.data) {
          const p = res.data;
          setFormData(prev => ({
            ...prev,
            collegeName: p.collegeName || user?.college || '',
            university: p.university || '',
            degree: p.degree || user?.degreeType || 'B.Tech',
            department: p.department || user?.department || 'Computer Science',
            currentYear: p.currentYear || user?.year || 3,
            currentSemester: p.currentSemester || 5,
            expectedGraduation: p.expectedGraduation || (new Date().getFullYear() + 1),
            cgpa: p.cgpa !== null && p.cgpa !== undefined ? String(p.cgpa) : '',
            backlogs: p.backlogs !== undefined ? String(p.backlogs) : '0',
            programmingExperience: p.programmingExperience || 'Intermediate',
            knownLanguages: p.knownLanguages?.length ? p.knownLanguages : ['JavaScript'],
            completedProjects: p.completedProjects?.length ? p.completedProjects : [{ title: '', description: '', link: '' }],
            certifications: p.certifications || [],
            syllabusUrl: p.syllabusUrl || user?.syllabusUrl || ''
          }));
        } else {
          // Pre-fill from user profile
          if (user) {
            setFormData(prev => ({
              ...prev,
              collegeName: user.college || user.schoolName || '',
              degree: user.degreeType || 'B.Tech',
              department: user.department || user.domain || 'Computer Science',
              currentYear: user.year || 3
            }));
          }
        }
      } catch (err) {
        console.error('Failed to fetch existing Mission 1 data:', err);
      } finally {
        setLoading(false);
      }
    })();
  }, [user]);

  // Glowing Particle Background Animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const particles = Array.from({ length: 45 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      radius: Math.random() * 2 + 1,
      color: Math.random() > 0.5 ? 'rgba(0, 243, 255, ' : 'rgba(168, 85, 247, ',
      alpha: Math.random() * 0.5 + 0.2,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4
    }));

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `${p.color}${p.alpha})`;
        ctx.shadowBlur = 10;
        ctx.shadowColor = p.color === 'rgba(0, 243, 255, ' ? '#00f3ff' : '#a855f7';
        ctx.fill();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  // Form Handlers
  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (error) setError('');
  };

  const toggleLanguage = (lang) => {
    setFormData(prev => {
      const exists = prev.knownLanguages.includes(lang);
      if (exists) {
        return { ...prev, knownLanguages: prev.knownLanguages.filter(l => l !== lang) };
      } else {
        return { ...prev, knownLanguages: [...prev.knownLanguages, lang] };
      }
    });
  };

  const handleAddCustomLanguage = () => {
    if (!customLanguageInput.trim()) return;
    const trimmed = customLanguageInput.trim();
    if (!formData.knownLanguages.includes(trimmed)) {
      setFormData(prev => ({ ...prev, knownLanguages: [...prev.knownLanguages, trimmed] }));
    }
    setCustomLanguageInput('');
  };

  // Projects handlers
  const handleProjectChange = (index, field, val) => {
    setFormData(prev => {
      const list = [...prev.completedProjects];
      list[index] = { ...list[index], [field]: val };
      return { ...prev, completedProjects: list };
    });
  };

  const addProject = () => {
    setFormData(prev => ({
      ...prev,
      completedProjects: [...prev.completedProjects, { title: '', description: '', link: '' }]
    }));
  };

  const removeProject = (index) => {
    setFormData(prev => ({
      ...prev,
      completedProjects: prev.completedProjects.filter((_, i) => i !== index)
    }));
  };

  // Certifications handlers
  const addCert = () => {
    if (!customCertInput.trim()) return;
    setFormData(prev => ({
      ...prev,
      certifications: [...prev.certifications, customCertInput.trim()]
    }));
    setCustomCertInput('');
  };

  const removeCert = (index) => {
    setFormData(prev => ({
      ...prev,
      certifications: prev.certifications.filter((_, i) => i !== index)
    }));
  };

  // Validation per step
  const isStep1Valid = () => {
    return (
      formData.collegeName.trim() !== '' &&
      formData.university.trim() !== '' &&
      formData.degree.trim() !== '' &&
      formData.department.trim() !== '' &&
      Number(formData.currentYear) >= 1 &&
      Number(formData.currentSemester) >= 1 &&
      Number(formData.expectedGraduation) >= 2020
    );
  };

  const isStep2Valid = () => {
    return (
      formData.programmingExperience &&
      formData.knownLanguages.length > 0
    );
  };

  const isStep3Valid = () => {
    return (
      formData.completedProjects.length > 0 &&
      formData.completedProjects.every(p => p.title && p.title.trim() !== '')
    );
  };

  const handleNextStep = () => {
    setError('');
    if (currentStep === 1 && !isStep1Valid()) {
      setError('Please fill in all mandatory fields in Section 1 (College, University, Degree, Department, Year, Semester, Expected Graduation).');
      return;
    }
    if (currentStep === 2 && !isStep2Valid()) {
      setError('Please select your Programming Experience level and at least one Known Programming Language.');
      return;
    }
    if (currentStep < 3) setCurrentStep(prev => prev + 1);
  };

  const handlePrevStep = () => {
    setError('');
    if (currentStep > 1) setCurrentStep(prev => prev - 1);
  };

  // Submit Mission 1
  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setError('');

    if (!isStep3Valid()) {
      setError('Please enter at least one completed project with a valid title.');
      return;
    }

    try {
      setSubmitting(true);
      const res = await submitAcademicFoundation(formData);
      if (res.success) {
        if (res.xpAwarded) setEarnedXp(res.xpAwarded);
        await triggerAction('MISSION_1_COMPLETE', 250);
        updateProfile({ ...user, onboardingCompleted: true });
        setShowCompleteModal(true);
      }
    } catch (err) {
      console.error('Mission 1 submission error:', err);
      const msg = err.response?.data?.message || err.message || 'Failed to submit Academic Foundation. Please verify all mandatory fields.';
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  // Mentor Message Content per Step
  const getMentorMessage = () => {
    switch (currentStep) {
      case 1:
        return "Welcome, Explorer. Before discovering your ideal career path, I need to understand your academic foundation.";
      case 2:
        return "Excellent progress! Now let's record your performance metrics and programming proficiency.";
      case 3:
        return "Final step! Details on your practical projects and curriculum will build your deterministic feature vector.";
      default:
        return "Welcome, Explorer.";
    }
  };

  if (loading) {
    return (
      <div className="m1-wrapper" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', color: '#00f3ff' }}>
          <FaRobot style={{ fontSize: '3rem', animation: 'pulse 1.5s infinite' }} />
          <p style={{ marginTop: '1rem', letterSpacing: '1px' }}>INITIALIZING ACADEMIC FOUNDATION SCAN...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="m1-wrapper">
      <canvas ref={canvasRef} className="m1-particles-canvas" />
      <div className="m1-grid-overlay" />

      {/* ── Top Progress Bar ────────────────────────────────────────── */}
      <header className="m1-top-bar">
        <div className="m1-header-info">
          <h1>
            <FaGraduationCap /> Mission 1: Academic Foundation
          </h1>
          <p>Career Discovery Journey • Data Ingestion & Deterministic Vectorization</p>
        </div>

        <div className="m1-progress-container">
          <div className="m1-progress-track">
            <div
              className="m1-progress-fill"
              style={{ width: `${(currentStep / 3) * 100}%` }}
            />
          </div>
          <span className="m1-mission-badge">
            Mission 1 of 6 ({Math.round((currentStep / 3) * 100)}%)
          </span>
        </div>
      </header>

      {/* ── Main Layout ───────────────────────────────────────────── */}
      <main className="m1-main-view">
        {/* Left AI Mentor Panel */}
        <aside className="m1-mentor-panel">
          <div className="m1-mentor-avatar-wrapper">
            <div className="m1-mentor-avatar-ring" />
            <div className="m1-mentor-avatar">
              <FaRobot />
            </div>
            <div className="m1-mentor-status" />
          </div>


          <div className="m1-mentor-name">AXEL • AI ACADEMIC MENTOR</div>
          <div className="m1-mentor-role">SYSTEM MONITOR & ADVISOR</div>

          <div className="m1-mentor-dialog">
            <p>{getMentorMessage()}</p>
          </div>

          <div className="m1-mentor-hint-box">
            <FaCheckCircle style={{ flexShrink: 0 }} />
            <span>NO AI or LLM models run during this mission. Only deterministic profile vectorization.</span>
          </div>
        </aside>

        {/* Right Glassmorphism Form Area */}
        <section className="m1-form-panel">
          {error && (
            <div className="m1-error-banner">
              <FaExclamationTriangle style={{ marginRight: '6px' }} />
              {error}
            </div>
          )}

          {/* Section 1: Institution & Degree Details */}
          {currentStep === 1 && (
            <div className="m1-step-content">
              <div className="m1-step-title-row">
                <h2><FaUniversity style={{ color: '#00f3ff' }} /> Section 1: Academic Identity</h2>
                <span className="m1-step-indicator">Step 1 of 3</span>
              </div>

              <div className="m1-form-grid">
                <div className="m1-form-group">
                  <label className="m1-label">
                    College Name <span className="m1-req">*</span>
                  </label>
                  <input
                    type="text"
                    className="m1-input"
                    placeholder="e.g. National Institute of Technology"
                    value={formData.collegeName}
                    onChange={e => handleInputChange('collegeName', e.target.value)}
                  />
                </div>

                <div className="m1-form-group">
                  <label className="m1-label">
                    University <span className="m1-req">*</span>
                  </label>
                  <input
                    type="text"
                    className="m1-input"
                    placeholder="e.g. Anna University / Deemed University"
                    value={formData.university}
                    onChange={e => handleInputChange('university', e.target.value)}
                  />
                </div>

                <div className="m1-form-group">
                  <label className="m1-label">
                    Degree <span className="m1-req">*</span>
                  </label>
                  <select
                    className="m1-select"
                    value={formData.degree}
                    onChange={e => handleInputChange('degree', e.target.value)}
                  >
                    <option value="B.Tech">B.Tech (Bachelor of Technology)</option>
                    <option value="B.E">B.E (Bachelor of Engineering)</option>
                    <option value="B.Sc">B.Sc (Bachelor of Science)</option>
                    <option value="BCA">BCA (Bachelor of Computer Applications)</option>
                    <option value="M.Tech">M.Tech (Master of Technology)</option>
                    <option value="M.Sc">M.Sc (Master of Science)</option>
                    <option value="MCA">MCA (Master of Computer Applications)</option>
                  </select>
                </div>

                <div className="m1-form-group">
                  <label className="m1-label">
                    Department / Major <span className="m1-req">*</span>
                  </label>
                  <input
                    type="text"
                    className="m1-input"
                    placeholder="e.g. Computer Science & Engineering"
                    value={formData.department}
                    onChange={e => handleInputChange('department', e.target.value)}
                  />
                </div>

                <div className="m1-form-group">
                  <label className="m1-label">
                    Current Year <span className="m1-req">*</span>
                  </label>
                  <select
                    className="m1-select"
                    value={formData.currentYear}
                    onChange={e => handleInputChange('currentYear', Number(e.target.value))}
                  >
                    <option value={1}>1st Year</option>
                    <option value={2}>2nd Year</option>
                    <option value={3}>3rd Year</option>
                    <option value={4}>4th Year</option>
                    <option value={5}>5th Year</option>
                  </select>
                </div>

                <div className="m1-form-group">
                  <label className="m1-label">
                    Current Semester <span className="m1-req">*</span>
                  </label>
                  <select
                    className="m1-select"
                    value={formData.currentSemester}
                    onChange={e => handleInputChange('currentSemester', Number(e.target.value))}
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(s => (
                      <option key={s} value={s}>Semester {s}</option>
                    ))}
                  </select>
                </div>

                <div className="m1-form-group full-width">
                  <label className="m1-label">
                    Expected Graduation Year <span className="m1-req">*</span>
                  </label>
                  <input
                    type="number"
                    className="m1-input"
                    placeholder="e.g. 2026"
                    value={formData.expectedGraduation}
                    onChange={e => handleInputChange('expectedGraduation', Number(e.target.value))}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Section 2: Performance & Tech Background */}
          {currentStep === 2 && (
            <div className="m1-step-content">
              <div className="m1-step-title-row">
                <h2><FaCode style={{ color: '#a855f7' }} /> Section 2: Technical Background & Metrics</h2>
                <span className="m1-step-indicator">Step 2 of 3</span>
              </div>

              <div className="m1-form-grid">
                <div className="m1-form-group">
                  <label className="m1-label">
                    Current CGPA <span className="m1-opt">(Optional)</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="10"
                    className="m1-input"
                    placeholder="e.g. 8.75 (0 - 10)"
                    value={formData.cgpa}
                    onChange={e => handleInputChange('cgpa', e.target.value)}
                  />
                </div>

                <div className="m1-form-group">
                  <label className="m1-label">
                    Current Active Backlogs <span className="m1-opt">(Optional)</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    className="m1-input"
                    placeholder="e.g. 0"
                    value={formData.backlogs}
                    onChange={e => handleInputChange('backlogs', e.target.value)}
                  />
                </div>

                <div className="m1-form-group full-width">
                  <label className="m1-label">
                    Programming Experience Level <span className="m1-req">*</span>
                  </label>
                  <div className="m1-exp-grid">
                    {['None', 'Beginner', 'Intermediate', 'Advanced'].map(lvl => (
                      <div
                        key={lvl}
                        className={`m1-exp-card ${formData.programmingExperience === lvl ? 'selected' : ''}`}
                        onClick={() => handleInputChange('programmingExperience', lvl)}
                      >
                        <div className="m1-exp-title">{lvl}</div>
                        <div className="m1-exp-sub">
                          {lvl === 'None' && 'No coding history'}
                          {lvl === 'Beginner' && 'Basic syntax & logic'}
                          {lvl === 'Intermediate' && 'Built small projects'}
                          {lvl === 'Advanced' && 'Complex systems & algorithms'}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="m1-form-group full-width">
                  <label className="m1-label">
                    Known Programming Languages <span className="m1-req">*</span>
                  </label>
                  <div className="m1-tag-wrapper">
                    {PRESET_LANGUAGES.map(lang => {
                      const selected = formData.knownLanguages.includes(lang);
                      return (
                        <div
                          key={lang}
                          className={`m1-tag ${selected ? 'selected' : ''}`}
                          onClick={() => toggleLanguage(lang)}
                        >
                          {lang} {selected && '✓'}
                        </div>
                      );
                    })}
                  </div>

                  <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                    <input
                      type="text"
                      className="m1-input"
                      style={{ height: '40px', fontSize: '0.85rem' }}
                      placeholder="Add custom language (e.g. Haskell, Dart)..."
                      value={customLanguageInput}
                      onChange={e => setCustomLanguageInput(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAddCustomLanguage(); } }}
                    />
                    <button
                      type="button"
                      className="m1-btn-add"
                      style={{ borderRadius: '8px' }}
                      onClick={handleAddCustomLanguage}
                    >
                      <FaPlus /> Add
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Section 3: Completed Projects & Syllabus */}
          {currentStep === 3 && (
            <div className="m1-step-content">
              <div className="m1-step-title-row">
                <h2><FaProjectDiagram style={{ color: '#ec4899' }} /> Section 3: Projects & Curriculum Specs</h2>
                <span className="m1-step-indicator">Step 3 of 3</span>
              </div>

              <div className="m1-form-group full-width" style={{ marginBottom: '1.5rem' }}>
                <label className="m1-label">
                  Completed Projects <span className="m1-req">* (Min 1 required)</span>
                </label>
                {formData.completedProjects.map((proj, idx) => (
                  <div key={idx} className="m1-project-item">
                    {formData.completedProjects.length > 1 && (
                      <button
                        type="button"
                        className="m1-btn-remove"
                        onClick={() => removeProject(idx)}
                      >
                        <FaTrash /> Remove
                      </button>
                    )}
                    <div className="m1-form-grid">
                      <div className="m1-form-group">
                        <label className="m1-label" style={{ fontSize: '0.75rem' }}>Project Title *</label>
                        <input
                          type="text"
                          className="m1-input"
                          placeholder="e.g. E-Commerce Platform"
                          value={proj.title}
                          onChange={e => handleProjectChange(idx, 'title', e.target.value)}
                        />
                      </div>
                      <div className="m1-form-group">
                        <label className="m1-label" style={{ fontSize: '0.75rem' }}>GitHub / Live Link (Optional)</label>
                        <input
                          type="text"
                          className="m1-input"
                          placeholder="https://github.com/..."
                          value={proj.link}
                          onChange={e => handleProjectChange(idx, 'link', e.target.value)}
                        />
                      </div>
                      <div className="m1-form-group full-width">
                        <label className="m1-label" style={{ fontSize: '0.75rem' }}>Description</label>
                        <input
                          type="text"
                          className="m1-input"
                          placeholder="Short overview of tech stack & purpose"
                          value={proj.description}
                          onChange={e => handleProjectChange(idx, 'description', e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                ))}
                <button type="button" className="m1-btn-add" onClick={addProject}>
                  <FaPlus /> Add Another Project
                </button>
              </div>

              <div className="m1-form-group full-width" style={{ marginBottom: '1.5rem' }}>
                <label className="m1-label">
                  Certifications <span className="m1-opt">(Optional)</span>
                </label>
                <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                  <input
                    type="text"
                    className="m1-input"
                    placeholder="e.g. AWS Certified Cloud Practitioner"
                    value={customCertInput}
                    onChange={e => setCustomCertInput(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addCert(); } }}
                  />
                  <button type="button" className="m1-btn-add" onClick={addCert}>
                    <FaPlus /> Add
                  </button>
                </div>
                <div className="m1-tag-wrapper">
                  {formData.certifications.map((c, i) => (
                    <div key={i} className="m1-tag selected" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span>{c}</span>
                      <span style={{ cursor: 'pointer', color: '#f87171' }} onClick={() => removeCert(i)}>×</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="m1-form-group full-width">
                <label className="m1-label">
                  Curriculum Specs <span className="m1-opt">(Optional Syllabus URL or PDF)</span>
                </label>
                <div className="m1-syllabus-toggle">
                  <button
                    type="button"
                    className={`m1-syl-tab ${formData.syllabusInputMode === 'url' ? 'active' : ''}`}
                    onClick={() => setFormData(prev => ({ ...prev, syllabusInputMode: 'url' }))}
                  >
                    <FaLink /> Syllabus Web Link
                  </button>
                  <button
                    type="button"
                    className={`m1-syl-tab ${formData.syllabusInputMode === 'pdf' ? 'active' : ''}`}
                    onClick={() => setFormData(prev => ({ ...prev, syllabusInputMode: 'pdf' }))}
                  >
                    <FaFileUpload /> Upload Syllabus PDF
                  </button>
                </div>

                {formData.syllabusInputMode === 'url' ? (
                  <input
                    type="url"
                    className="m1-input"
                    placeholder="https://university.edu/syllabus/cs2024.pdf"
                    value={formData.syllabusUrl}
                    onChange={e => handleInputChange('syllabusUrl', e.target.value)}
                  />
                ) : (
                  <div className="m1-file-upload-box">
                    <input
                      type="file"
                      accept=".pdf"
                      id="syllabus-file-input"
                      style={{ display: 'none' }}
                      onChange={e => handleInputChange('syllabusPdf', e.target.files[0])}
                    />
                    <label htmlFor="syllabus-file-input" style={{ cursor: 'pointer' }}>
                      <FaFileUpload style={{ fontSize: '2rem', color: '#a855f7', marginBottom: '8px' }} />
                      <p style={{ margin: 0, fontWeight: 600, color: '#e2e8f0' }}>
                        {formData.syllabusPdf ? formData.syllabusPdf.name : 'Click to Upload Syllabus PDF'}
                      </p>
                      <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>PDF document up to 10MB</span>
                    </label>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Bottom Navigation Buttons */}
          <footer className="m1-nav-footer">
            <button
              type="button"
              className="m1-btn-back"
              onClick={handlePrevStep}
              disabled={currentStep === 1 || submitting}
            >
              <FaArrowLeft /> Back
            </button>

            {currentStep < 3 ? (
              <button
                type="button"
                className="m1-btn-next"
                onClick={handleNextStep}
              >
                Next Section <FaArrowRight />
              </button>
            ) : (
              <button
                type="button"
                className="m1-btn-next"
                onClick={handleSubmit}
                disabled={submitting}
              >
                {submitting ? 'COMPUTING VECTOR & SAVING...' : 'COMPLETE MISSION 1'} <FaRocket />
              </button>
            )}
          </footer>
        </section>
      </main>

      {/* ── Completion Modal ────────────────────────────────────────── */}
      {showCompleteModal && (
        <div className="m1-modal-overlay">
          <div className="m1-modal-card">
            <FaTrophy className="m1-trophy-icon" />
            <h2 style={{ fontSize: '1.75rem', margin: '0 0 0.5rem 0', color: '#fff' }}>
              MISSION 1 ACCOMPLISHED!
            </h2>
            <p style={{ color: '#00f3ff', fontWeight: 700, fontSize: '1.1rem', margin: '0 0 1rem 0' }}>
              + {earnedXp} XP EARNED
            </p>
            <p style={{ color: '#94a3b8', fontSize: '0.9rem', lineHeight: '1.6', marginBottom: '1.75rem' }}>
              Your Academic Profile & 16-dimensional Academic Feature Vector have been generated deterministically and saved to MongoDB.
            </p>

            <button
              className="m1-btn-next"
              style={{ width: '100%', justifyContent: 'center' }}
              onClick={() => navigate('/career/mission-2')}
            >
              PROCEED TO MISSION 2 <FaArrowRight />
            </button>

          </div>
        </div>
      )}
    </div>
  );
};

export default Mission1AcademicFoundation;
