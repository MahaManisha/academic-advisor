// client/src/pages/Mission3LearningBehaviour.jsx
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useGamification } from '../context/GamificationContext';
import { getLearningBehaviour, submitLearningBehaviour } from '../api/career.api';
import {
  FaBrain,
  FaBook,
  FaCode,
  FaUsers,
  FaUser,
  FaClock,
  FaLightbulb,
  FaChartPie,
  FaArrowRight,
  FaArrowLeft,
  FaTrophy,
  FaExclamationTriangle,
  FaRocket,
  FaSlidersH,
  FaEye,
  FaTools,
  FaLayerGroup
} from 'react-icons/fa';
import './Mission3LearningBehaviour.css';

const CODING_FREQ_LABELS = [
  { val: 0, label: 'Never' },
  { val: 1, label: 'Rarely' },
  { val: 2, label: 'Weekly' },
  { val: 3, label: '3-4x / wk' },
  { val: 4, label: 'Daily' }
];

const LEARNING_METHODS = [
  { id: 'Visual', title: 'Visual', icon: <FaEye />, desc: 'Diagrams, Mindmaps, Video tutorials' },
  { id: 'Hands-on', title: 'Hands-on', icon: <FaTools />, desc: 'Coding projects, Interactive labs' },
  { id: 'Theoretical', title: 'Theoretical', icon: <FaBook />, desc: 'Textbooks, Research papers, Formulas' },
  { id: 'Mixed', title: 'Mixed', icon: <FaLayerGroup />, desc: 'Balanced hybrid learning approach' }
];

const Mission3LearningBehaviour = () => {
  const { user, updateProfile } = useAuth();
  const { triggerAction } = useGamification();
  const navigate = useNavigate();
  const canvasRef = useRef(null);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [earnedXp, setEarnedXp] = useState(250);

  // Form State
  const [inputs, setInputs] = useState({
    studyHours: 18,
    codingFrequency: 3,
    projectInterest: 'High',
    confidenceLevel: 8,
    mathConfidence: 7,
    learningMethod: 'Hands-on',
    handsOnVsTheory: 75,
    individualVsTeam: 50,
    preferredStudyTime: 'Evening'
  });

  // Local Calculated Fuzzy Outputs Cache
  const [fuzzyPreview, setFuzzyPreview] = useState(null);

  // Load existing Mission 3 profile if available
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const res = await getLearningBehaviour();
        if (res.success && res.data?.inputs) {
          setInputs(res.data.inputs);
          if (res.data.fuzzyOutputs) setFuzzyPreview(res.data.fuzzyOutputs);
        }
      } catch (e) {
        console.error("Failed to load existing Mission 3 data:", e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Background Particles Animation
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
      color: Math.random() > 0.5 ? 'rgba(236, 72, 153, ' : 'rgba(0, 243, 255, ',
      alpha: Math.random() * 0.5 + 0.2,
      vx: (Math.random() - 0.5) * 0.35,
      vy: (Math.random() - 0.5) * 0.35
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
        ctx.shadowColor = p.color === 'rgba(0, 243, 255, ' ? '#00f3ff' : '#ec4899';
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

  const handleInputChange = (field, val) => {
    setInputs(prev => ({ ...prev, [field]: val }));
    if (error) setError('');
  };

  // Submit Mission 3
  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setError('');
    try {
      setSubmitting(true);
      const res = await submitLearningBehaviour(inputs);
      if (res.success) {
        if (res.xpAwarded) setEarnedXp(res.xpAwarded);
        if (res.fuzzyOutputs) setFuzzyPreview(res.fuzzyOutputs);
        await triggerAction('MISSION_3_COMPLETE', 250);
        updateProfile({ ...user });
        setShowCompleteModal(true);
      }
    } catch (err) {
      console.error('Mission 3 submission error:', err);
      setError(err.response?.data?.message || err.message || 'Failed to submit Learning Behaviour Profile.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="m3-wrapper">
      <canvas ref={canvasRef} className="m3-particles-canvas" />
      <div className="m3-grid-overlay" />

      {/* ── Top Progress Header ────────────────────────────────────── */}
      <header className="m3-top-bar">
        <div className="m3-header-info">
          <h1>
            <FaBrain /> Mission 3: Learning Behaviour Profiling
          </h1>
          <p>Career Discovery Journey • Fuzzy Logic Inference Engine (Mamdani Defuzzification)</p>
        </div>

        <div className="m3-progress-container">
          <div className="m3-progress-track">
            <div className="m3-progress-fill" style={{ width: '50%' }} />
          </div>
          <span className="m3-mission-badge">
            Mission 3 of 6 (50%)
          </span>
        </div>
      </header>

      {/* ── Main View ─────────────────────────────────────────────── */}
      <main className="m3-main-view">
        {/* Left AI Mentor Panel */}
        <aside className="m3-mentor-panel">
          <div className="m3-mentor-avatar-wrapper">
            <div className="m3-mentor-avatar-ring" />
            <div className="m3-mentor-avatar">
              <FaBrain />
            </div>
            <div className="m3-mentor-status" />
          </div>

          <div className="m3-mentor-name">FUZZY COGNITIVE ENGINE</div>
          <div className="m3-mentor-role">BEHAVIOURAL LOGIC ANALYZER</div>

          <div className="m3-mentor-dialog">
            <p>
              Greetings, Explorer. In Mission 3, we analyze your learning behavior using a 5-dimension Fuzzy Logic Inference Engine. No AI or LLMs used—only triangular & trapezoidal membership functions and Mamdani defuzzification.
            </p>
          </div>

          <div className="m3-fuzzy-badge">
            <FaLightbulb style={{ flexShrink: 0 }} />
            <span>Fuzzy Inference: μ_Low, μ_Med, μ_High → Centroid Y = ∑w_k c_k / ∑w_k</span>
          </div>
        </aside>

        {/* Right Content Panel (Interactive Micro-Animated Controls) */}
        <section className="m3-content-panel">
          {error && (
            <div style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid #ef4444', color: '#fca5a5', padding: '0.75rem 1rem', borderRadius: '10px', fontSize: '0.85rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FaExclamationTriangle />
              {error}
            </div>
          )}

          {/* 1. Preferred Learning Method (Floating Cards) */}
          <div style={{ marginBottom: '1.25rem' }}>
            <div className="m3-section-title">
              <FaLayerGroup style={{ color: 'var(--m3-cyan)' }} /> Preferred Learning Method
            </div>
            <div className="m3-floating-grid">
              {LEARNING_METHODS.map(m => {
                const selected = inputs.learningMethod === m.id;
                return (
                  <div
                    key={m.id}
                    className={`m3-floating-card ${selected ? 'selected' : ''}`}
                    onClick={() => handleInputChange('learningMethod', m.id)}
                  >
                    <div className="m3-card-icon-big">{m.icon}</div>
                    <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#fff', marginBottom: '2px' }}>{m.title}</div>
                    <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>{m.desc}</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 2. Interactive Study Hours & Coding Frequency */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '1.25rem' }}>
            {/* Study Hours Slider */}
            <div className="m3-balance-box" style={{ margin: 0 }}>
              <div className="m3-balance-labels">
                <span><FaClock style={{ color: 'var(--m3-cyan)', marginRight: '6px' }} /> Weekly Study Hours</span>
                <span style={{ color: 'var(--m3-cyan)' }}>{inputs.studyHours} hrs / week</span>
              </div>
              <input
                type="range"
                min="0"
                max="40"
                step="1"
                className="m3-range-slider"
                value={inputs.studyHours}
                onChange={e => handleInputChange('studyHours', Number(e.target.value))}
              />
            </div>

            {/* Coding Frequency Chips */}
            <div className="m3-balance-box" style={{ margin: 0 }}>
              <div className="m3-balance-labels">
                <span><FaCode style={{ color: 'var(--m3-pink)', marginRight: '6px' }} /> Coding Practice Frequency</span>
              </div>
              <div className="m3-toggle-grid">
                {CODING_FREQ_LABELS.map(cf => (
                  <div
                    key={cf.val}
                    className={`m3-toggle-chip ${inputs.codingFrequency === cf.val ? 'active' : ''}`}
                    onClick={() => handleInputChange('codingFrequency', cf.val)}
                  >
                    {cf.label}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 3. Circular Gauge Selectors (Confidence & Math Confidence) */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '1.25rem' }}>
            {/* Overall Confidence Dial */}
            <div className="m3-balance-box" style={{ margin: 0 }}>
              <div className="m3-balance-labels">
                <span>Overall Self Confidence Level</span>
                <span style={{ color: 'var(--m3-purple)' }}>{inputs.confidenceLevel} / 10</span>
              </div>
              <div className="m3-gauge-selector">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => (
                  <div
                    key={n}
                    className={`m3-gauge-node ${inputs.confidenceLevel === n ? 'active' : ''}`}
                    onClick={() => handleInputChange('confidenceLevel', n)}
                  >
                    {n}
                  </div>
                ))}
              </div>
            </div>

            {/* Math Confidence Dial */}
            <div className="m3-balance-box" style={{ margin: 0 }}>
              <div className="m3-balance-labels">
                <span>Mathematics Confidence Level</span>
                <span style={{ color: 'var(--m3-pink)' }}>{inputs.mathConfidence} / 10</span>
              </div>
              <div className="m3-gauge-selector">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => (
                  <div
                    key={n}
                    className={`m3-gauge-node ${inputs.mathConfidence === n ? 'active' : ''}`}
                    onClick={() => handleInputChange('mathConfidence', n)}
                  >
                    {n}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 4. Dual-Side Balance Sliders */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '1.25rem' }}>
            {/* Hands-on vs Theory Slider */}
            <div className="m3-balance-box" style={{ margin: 0 }}>
              <div className="m3-balance-labels">
                <span>Theory ({100 - inputs.handsOnVsTheory}%)</span>
                <span style={{ color: 'var(--m3-cyan)' }}>Hands-on Practical ({inputs.handsOnVsTheory}%)</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                className="m3-range-slider"
                value={inputs.handsOnVsTheory}
                onChange={e => handleInputChange('handsOnVsTheory', Number(e.target.value))}
              />
            </div>

            {/* Solo vs Team Slider */}
            <div className="m3-balance-box" style={{ margin: 0 }}>
              <div className="m3-balance-labels">
                <span><FaUser style={{ marginRight: '4px' }} /> Solo Study ({100 - inputs.individualVsTeam}%)</span>
                <span style={{ color: 'var(--m3-purple)' }}><FaUsers style={{ marginRight: '4px' }} /> Team Squad ({inputs.individualVsTeam}%)</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                className="m3-range-slider"
                value={inputs.individualVsTeam}
                onChange={e => handleInputChange('individualVsTeam', Number(e.target.value))}
              />
            </div>
          </div>

          {/* 5. Project Interest & Study Time Toggle Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '1.25rem' }}>
            <div className="m3-balance-box" style={{ margin: 0 }}>
              <div className="m3-balance-labels">Project Building Interest</div>
              <div className="m3-toggle-grid">
                {['Low', 'Medium', 'High'].map(pi => (
                  <div
                    key={pi}
                    className={`m3-toggle-chip ${inputs.projectInterest === pi ? 'active' : ''}`}
                    onClick={() => handleInputChange('projectInterest', pi)}
                  >
                    {pi}
                  </div>
                ))}
              </div>
            </div>

            <div className="m3-balance-box" style={{ margin: 0 }}>
              <div className="m3-balance-labels">Preferred Study Time of Day</div>
              <div className="m3-toggle-grid">
                {['Early Morning', 'Afternoon', 'Evening', 'Late Night'].map(st => (
                  <div
                    key={st}
                    className={`m3-toggle-chip ${inputs.preferredStudyTime === st ? 'active' : ''}`}
                    onClick={() => handleInputChange('preferredStudyTime', st)}
                    style={{ fontSize: '0.75rem' }}
                  >
                    {st}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Real-Time Calculated Fuzzy Outputs (Stored Fuzzy Outputs) */}
          {fuzzyPreview && (
            <div className="m3-fuzzy-results-grid">
              <div className="m3-meter-card">
                <div className="m3-meter-score">{fuzzyPreview.learningCommitment}</div>
                <div className="m3-meter-name">Learning Commitment</div>
              </div>
              <div className="m3-meter-card">
                <div className="m3-meter-score">{fuzzyPreview.programmingReadiness}</div>
                <div className="m3-meter-name">Programming Readiness</div>
              </div>
              <div className="m3-meter-card">
                <div className="m3-meter-score">{fuzzyPreview.studyConsistency}</div>
                <div className="m3-meter-name">Study Consistency</div>
              </div>
              <div className="m3-meter-card">
                <div className="m3-meter-score">{fuzzyPreview.learningFlexibility}</div>
                <div className="m3-meter-name">Learning Flexibility</div>
              </div>
              <div className="m3-meter-card">
                <div className="m3-meter-score">{fuzzyPreview.analyticalReadiness}</div>
                <div className="m3-meter-name">Analytical Readiness</div>
              </div>
            </div>
          )}

          {/* Footer Nav */}
          <footer className="m3-nav-footer">
            <button
              type="button"
              className="m3-btn-back"
              onClick={() => navigate('/career')}
            >
              <FaArrowLeft /> Back to Career Path
            </button>

            <button
              type="button"
              className="m3-btn-next"
              onClick={handleSubmit}
              disabled={submitting}
            >
              {submitting ? 'COMPUTING FUZZY ENGINE...' : 'COMPLETE MISSION 3'} <FaRocket />
            </button>
          </footer>
        </section>
      </main>

      {/* ── Completion Modal ────────────────────────────────────────── */}
      {showCompleteModal && (
        <div className="m3-modal-overlay">
          <div className="m3-modal-card">
            <FaTrophy style={{ fontSize: '3.5rem', color: 'var(--m3-pink)', marginBottom: '1rem', filter: 'drop-shadow(0 0 15px var(--m3-pink))' }} />
            <h2 style={{ fontSize: '1.6rem', margin: '0 0 0.5rem 0', color: '#fff' }}>
              MISSION 3 ACCOMPLISHED!
            </h2>
            <p style={{ color: 'var(--m3-cyan)', fontWeight: 700, fontSize: '1.1rem', margin: '0 0 1.25rem 0' }}>
              + {earnedXp} XP EARNED
            </p>
            <p style={{ color: '#94a3b8', fontSize: '0.88rem', lineHeight: '1.6', marginBottom: '1.5rem' }}>
              Your Learning Behaviour Profile & 5-dimension Fuzzy Outputs have been generated deterministically and saved to MongoDB.
            </p>

            <button
              className="m3-btn-next"
              style={{ width: '100%', justifyContent: 'center' }}
              onClick={() => navigate('/career/mission-4')}
            >
              PROCEED TO MISSION 4 <FaArrowRight />
            </button>

          </div>
        </div>
      )}
    </div>
  );
};

export default Mission3LearningBehaviour;
