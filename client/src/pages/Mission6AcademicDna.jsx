// client/src/pages/Mission6AcademicDna.jsx
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useGamification } from '../context/GamificationContext';
import { getAcademicDna, submitAcademicDna } from '../api/career.api';
import {
  FaDna,
  FaRocket,
  FaArrowRight,
  FaArrowLeft,
  FaTrophy,
  FaExclamationTriangle,
  FaCheckCircle,
  FaMedal,
  FaLockOpen,
  FaShieldAlt,
  FaFlask,
  FaBrain
} from 'react-icons/fa';
import './Mission6AcademicDna.css';

const CINEMATIC_STAGES = [
  { id: 1, title: 'Building Academic Profile...', desc: 'Fusing academic history, GPA vectors, and tech stack proficiencies' },
  { id: 2, title: 'Mapping Interests...', desc: 'Incorporating AHP matrix priority scores and pairwise domain rankings' },
  { id: 3, title: 'Creating Behaviour Profile...', desc: 'Synthesizing Mamdani fuzzy logic readiness and 8-D cognitive vectors' },
  { id: 4, title: 'Generating Career DNA...', desc: 'Executing cryptographic SHA-256 hash algorithm and DNA sequence assignment' },
  { id: 5, title: 'Finalizing Student Profile...', desc: 'Registering permanent single-source-of-truth Academic DNA in database' }
];

const Mission6AcademicDna = () => {
  const { user, updateProfile } = useAuth();
  const { triggerAction } = useGamification();
  const navigate = useNavigate();
  const canvasRef = useRef(null);
  const helixCanvasRef = useRef(null);

  // States: 'computing' vs 'results'
  const [viewState, setViewState] = useState('computing');
  const [stageIdx, setStageIdx] = useState(0);
  const [progressPct, setProgressPct] = useState(0);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [showGrandModal, setShowGrandModal] = useState(false);
  const [earnedXp, setEarnedXp] = useState(500);

  // Academic DNA Cache
  const [dnaData, setDnaData] = useState(null);

  // Load existing Academic DNA if present
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const res = await getAcademicDna();
        if (res.success && res.data?.academicDnaId) {
          setDnaData(res.data);
        }
      } catch (e) {
        console.error("Failed to load Mission 6 data:", e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Cinematic 5-Stage Transition Sequence
  useEffect(() => {
    if (viewState !== 'computing' || loading) return;

    let currentProgress = 0;
    const interval = setInterval(() => {
      currentProgress += 2;
      setProgressPct(currentProgress);

      if (currentProgress < 20) setStageIdx(0);
      else if (currentProgress < 40) setStageIdx(1);
      else if (currentProgress < 60) setStageIdx(2);
      else if (currentProgress < 80) setStageIdx(3);
      else if (currentProgress < 100) setStageIdx(4);
      else {
        clearInterval(interval);
        executeDnaGeneration();
      }
    }, 70);

    return () => clearInterval(interval);
  }, [viewState, loading]);

  // 3D Double-Helix DNA Animation Canvas
  useEffect(() => {
    const canvas = helixCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let angle = 0;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const nodes = 18;
      const spacing = 12;

      for (let i = 0; i < nodes; i++) {
        const y = (i - nodes / 2) * spacing + centerY;
        const phase = angle + (i * 0.35);
        const x1 = centerX + Math.sin(phase) * 60;
        const x2 = centerX - Math.sin(phase) * 60;
        const z1 = Math.cos(phase);
        const z2 = -Math.cos(phase);

        // Connecting Rung Line
        ctx.beginPath();
        ctx.moveTo(x1, y);
        ctx.lineTo(x2, y);
        ctx.strokeStyle = `rgba(168, 85, 247, ${0.2 + Math.abs(z1) * 0.3})`;
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Node 1 (Cyan Strand)
        ctx.beginPath();
        ctx.arc(x1, y, 4 + z1 * 2, 0, Math.PI * 2);
        ctx.fillStyle = '#00f3ff';
        ctx.shadowBlur = 12;
        ctx.shadowColor = '#00f3ff';
        ctx.fill();

        // Node 2 (Pink Strand)
        ctx.beginPath();
        ctx.arc(x2, y, 4 + z2 * 2, 0, Math.PI * 2);
        ctx.fillStyle = '#ec4899';
        ctx.shadowBlur = 12;
        ctx.shadowColor = '#ec4899';
        ctx.fill();
      }

      angle += 0.04;
      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => cancelAnimationFrame(animationFrameId);
  }, [viewState]);

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

    const particles = Array.from({ length: 50 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      radius: Math.random() * 2 + 1,
      color: Math.random() > 0.5 ? 'rgba(168, 85, 247, ' : 'rgba(236, 72, 153, ',
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
        ctx.shadowColor = '#a855f7';
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

  // Execute Academic DNA Generation via Server
  const executeDnaGeneration = async () => {
    try {
      setSubmitting(true);
      const res = await submitAcademicDna();
      if (res.success && res.data) {
        setDnaData(res.data);
        if (res.xpAwarded) setEarnedXp(res.xpAwarded);
        setViewState('results');
      }
    } catch (err) {
      console.error('Mission 6 generation error:', err);
      setError(err.response?.data?.message || err.message || 'Failed to generate Academic DNA.');
      setViewState('results');
    } finally {
      setSubmitting(false);
    }
  };

  // Trigger Grand Celebration & Final Dashboard Unlock
  const handleFinalizeDiscovery = async () => {
    try {
      await triggerAction('CAREER_DISCOVERY_COMPLETE', 500);
      updateProfile({ ...user, onboardingCompleted: true, careerDiscoveryCompleted: true });
      setShowGrandModal(true);
    } catch (e) {
      setShowGrandModal(true);
    }
  };

  if (loading) {
    return (
      <div className="m6-wrapper" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', color: '#a855f7' }}>
          <FaDna style={{ fontSize: '3.5rem', animation: 'spin 2s linear infinite' }} />
          <p style={{ marginTop: '1rem', letterSpacing: '1px' }}>INITIALIZING ACADEMIC DNA CORE...</p>
        </div>
      </div>
    );
  }

  const currentStage = CINEMATIC_STAGES[stageIdx];

  return (
    <div className="m6-wrapper">
      <canvas ref={canvasRef} className="m6-particles-canvas" />
      <div className="m6-grid-overlay" />

      {/* ── Top Progress Header ────────────────────────────────────── */}
      <header className="m6-top-bar">
        <div className="m6-header-info">
          <h1>
            <FaDna /> Mission 6: Academic DNA Generation
          </h1>
          <p>Career Discovery Journey • Permanent Student Single Source of Truth</p>
        </div>

        <div className="m6-progress-container">
          <div className="m6-progress-track">
            <div className="m6-progress-fill" style={{ width: '100%' }} />
          </div>
          <span className="m6-mission-badge">
            Mission 6 of 6 (100%)
          </span>
        </div>
      </header>

      {/* ── Main View ─────────────────────────────────────────────── */}
      <main className="m6-main-view">
        {/* Left AI Mentor Panel */}
        <aside className="m6-mentor-panel">
          <div className="m6-mentor-avatar-wrapper">
            <div className="m6-mentor-avatar-ring" />
            <div className="m6-mentor-avatar">
              <FaDna />
            </div>
            <div className="m6-mentor-status" />
          </div>

          <div className="m6-mentor-name">ACADEMIC DNA CORE</div>
          <div className="m6-mentor-role">SINGLE SOURCE OF TRUTH</div>

          <div className="m6-mentor-dialog">
            <p>
              Greetings, Explorer. In Mission 6, we fuse all 5 discovery missions into your permanent Academic DNA profile. This cryptographic profile becomes your single source of truth across the entire platform.
            </p>
          </div>

          <div className="m6-dna-truth-badge">
            <FaShieldAlt style={{ flexShrink: 0 }} />
            <span>Permanent Profile: 5 Mission Multi-Vector Cryptographic DNA Hash. Zero LLMs.</span>
          </div>
        </aside>

        {/* Right Content Panel */}
        <section className="m6-content-panel">
          {error && (
            <div style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid #ef4444', color: '#fca5a5', padding: '0.75rem 1rem', borderRadius: '10px', fontSize: '0.85rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FaExclamationTriangle />
              {error}
            </div>
          )}

          {/* ── COMPUTING STATE: 3D Holographic Double-Helix Canvas Animation ── */}
          {viewState === 'computing' ? (
            <div className="m6-dna-stage-box">
              <canvas ref={helixCanvasRef} width={320} height={220} className="m6-helix-canvas" />

              <div className="m6-stage-title">{currentStage.title}</div>
              <div className="m6-stage-sub">{currentStage.desc}</div>

              <div style={{ width: '80%', maxWidth: '500px', margin: '0 auto' }}>
                <div className="m6-progress-track" style={{ width: '100%', height: '10px' }}>
                  <div className="m6-progress-fill" style={{ width: `${progressPct}%` }} />
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--m6-purple)', marginTop: '8px', fontWeight: 700 }}>
                  Generating Permanent Profile: {progressPct}%
                </div>
              </div>
            </div>
          ) : (
            /* ── RESULTS STATE: Permanent Academic DNA Card & ID Badge ── */
            <div className="m6-dna-card-container">
              {/* DNA Header Badge */}
              <div className="m6-dna-header-card">
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--m6-purple)', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 700 }}>
                    PERMANENT ACADEMIC DNA IDENTIFIER
                  </div>
                  <div className="m6-dna-id-tag">
                    {dnaData?.academicDnaId || 'DNA-8F4A-99B2-E7C1'}
                  </div>
                  <div className="m6-dna-hash-tag">
                    SHA-256: {dnaData?.dnaSequenceHash ? dnaData.dnaSequenceHash.substring(0, 32) + '...' : '8f4a99b2e7c1...'}
                  </div>
                </div>

                <FaDna style={{ fontSize: '3.5rem', color: 'var(--m6-cyan)', filter: 'drop-shadow(0 0 15px var(--m6-cyan))' }} />
              </div>

              {/* 3 Metric Cards */}
              <div className="m6-dna-details-grid">
                <div className="m6-dna-metric-box">
                  <div className="m6-metric-val" style={{ color: 'var(--m6-cyan)' }}>
                    {dnaData?.careerAffinity?.primaryDomain || 'Artificial Intelligence'}
                  </div>
                  <div className="m6-metric-title">Primary Career Affinity</div>
                </div>

                <div className="m6-dna-metric-box">
                  <div className="m6-metric-val" style={{ color: 'var(--m6-green)' }}>
                    {dnaData?.programmingReadiness || 80}%
                  </div>
                  <div className="m6-metric-title">Programming Readiness</div>
                </div>

                <div className="m6-dna-metric-box">
                  <div className="m6-metric-val" style={{ color: 'var(--m6-pink)' }}>
                    {dnaData?.behaviourProfile?.archetype || 'Systemic Architect'}
                  </div>
                  <div className="m6-metric-title">Cognitive Archetype</div>
                </div>
              </div>

              {/* Strengths & Weaknesses Breakdown */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: '12px', padding: '1rem' }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--m6-green)', marginBottom: '8px' }}>
                    Top Identified Strengths
                  </div>
                  <div className="m6-tag-cloud">
                    {(dnaData?.strengthDistribution || ['Analytical Reasoning', 'Coding Discipline', 'Methodical Logic']).map(s => (
                      <span key={s} className="m6-strength-tag">{s}</span>
                    ))}
                  </div>
                </div>

                <div style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(245,158,11,0.3)', borderRadius: '12px', padding: '1rem' }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--m6-gold)', marginBottom: '8px' }}>
                    Key Skill Growth Areas
                  </div>
                  <div className="m6-tag-cloud">
                    {(dnaData?.weaknessDistribution || ['Theory-Practice Balance', 'Cloud Infrastructure']).map(w => (
                      <span key={w} className="m6-weakness-tag">{w}</span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Nav Footer */}
              <footer className="m6-nav-footer">
                <button
                  type="button"
                  style={{ background: 'transparent', border: 'none', color: '#94a3b8', fontSize: '0.85rem', cursor: 'pointer' }}
                  onClick={() => navigate('/career')}
                >
                  <FaArrowLeft /> Back to Career Overview
                </button>

                <button
                  type="button"
                  className="m6-btn-finish"
                  onClick={handleFinalizeDiscovery}
                  disabled={submitting}
                >
                  CLAIM ACADEMIC DNA & UNLOCK DASHBOARD <FaRocket />
                </button>
              </footer>
            </div>
          )}
        </section>
      </main>

      {/* ── Grand Celebration Modal ─────────────────────────────────── */}
      {showGrandModal && (
        <div className="m6-modal-overlay">
          <div className="m6-modal-card">
            <FaTrophy style={{ fontSize: '4rem', color: 'var(--m6-gold)', marginBottom: '1rem', filter: 'drop-shadow(0 0 25px var(--m6-gold))' }} />
            <h2 style={{ fontSize: '1.75rem', margin: '0 0 0.5rem 0', color: '#fff' }}>
              CAREER DISCOVERY JOURNEY COMPLETE!
            </h2>
            <p style={{ color: 'var(--m6-pink)', fontWeight: 800, fontSize: '1.2rem', margin: '0 0 1rem 0' }}>
              + {earnedXp} XP BONUS AWARDED
            </p>
            <div style={{ background: 'rgba(0,243,255,0.1)', border: '1px solid var(--m6-cyan)', borderRadius: '12px', padding: '1rem', marginBottom: '1.5rem', color: '#cbd5e1', fontSize: '0.88rem', lineHeight: '1.6' }}>
              🏆 Achievement Unlocked: <strong>CAREER_DISCOVERY_COMPLETE</strong><br />
              Your permanent Academic DNA profile is locked as the single source of truth across all platform modules.
            </div>

            <button
              className="m6-btn-finish"
              style={{ width: '100%', justifyContent: 'center' }}
              onClick={() => navigate('/dashboard')}
            >
              ENTER PERSONALIZED DASHBOARD <FaLockOpen />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Mission6AcademicDna;
