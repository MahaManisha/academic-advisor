// client/src/pages/Mission5Compatibility.jsx
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useGamification } from '../context/GamificationContext';
import { getCareerCompatibility, submitCareerCompatibility } from '../api/career.api';
import {
  FaBrain,
  FaRocket,
  FaArrowRight,
  FaArrowLeft,
  FaTrophy,
  FaExclamationTriangle,
  FaLock,
  FaLayerGroup,
  FaCheckCircle,
  FaChartLine,
  FaCogs
} from 'react-icons/fa';
import { GiArtificialIntelligence, GiAtom } from 'react-icons/gi';
import './Mission5Compatibility.css';

const PROCESSING_STAGES = [
  { id: 1, title: 'Analyzing Academic Profile...', desc: 'Extracting degree, course, tech stack, and grade vectors' },
  { id: 2, title: 'Calculating Career Affinity (AHP Matrix)...', desc: 'Processing AHP pairwise matrix and priority weights' },
  { id: 3, title: 'Running Behaviour & Fuzzy Analysis...', desc: 'Evaluating fuzzy readiness scores and cognitive 8-D vector' },
  { id: 4, title: 'Computing Final Compatibility Matrix...', desc: 'Executing multi-criteria vector synthesis across all 12 domains' }
];

const Mission5Compatibility = () => {
  const { user, updateProfile } = useAuth();
  const { triggerAction } = useGamification();
  const navigate = useNavigate();
  const canvasRef = useRef(null);

  // States: 'computing' vs 'results'
  const [viewState, setViewState] = useState('computing');
  const [processingStageIdx, setProcessingStageIdx] = useState(0);
  const [progressPct, setProgressPct] = useState(0);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [earnedXp, setEarnedXp] = useState(250);

  // Compatibility Data Cache
  const [matrixData, setMatrixData] = useState([]);
  const [topMatchedDomain, setTopMatchedDomain] = useState('Artificial Intelligence');
  const [overallReadinessScore, setOverallReadinessScore] = useState(88);

  // Load existing profile if present
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const res = await getCareerCompatibility();
        if (res.success && res.data?.compatibilityMatrix?.length > 0) {
          setMatrixData(res.data.compatibilityMatrix);
          if (res.data.topDomain) setTopMatchedDomain(res.data.topDomain);
          if (res.data.overallReadiness) setOverallReadinessScore(res.data.overallReadiness);
        }
      } catch (e) {
        console.error("Failed to fetch Mission 5 data:", e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Holographic Processing Animation Sequence
  useEffect(() => {
    if (viewState !== 'computing' || loading) return;

    let currentProgress = 0;
    const interval = setInterval(() => {
      currentProgress += 2;
      setProgressPct(currentProgress);

      if (currentProgress < 25) setProcessingStageIdx(0);
      else if (currentProgress < 50) setProcessingStageIdx(1);
      else if (currentProgress < 75) setProcessingStageIdx(2);
      else if (currentProgress < 100) setProcessingStageIdx(3);
      else {
        clearInterval(interval);
        // Execute server submission once processing animation finishes
        executeEngineComputation();
      }
    }, 60);

    return () => clearInterval(interval);
  }, [viewState, loading]);

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
      color: Math.random() > 0.5 ? 'rgba(0, 243, 255, ' : 'rgba(16, 185, 129, ',
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
        ctx.shadowColor = p.color === 'rgba(0, 243, 255, ' ? '#00f3ff' : '#10b981';
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

  // Compute Multi-Vector Compatibility Matrix via Server Engine
  const executeEngineComputation = async () => {
    try {
      setSubmitting(true);
      const res = await submitCareerCompatibility();
      if (res.success && res.compatibilityMatrix) {
        setMatrixData(res.compatibilityMatrix);
        if (res.topDomain) setTopMatchedDomain(res.topDomain);
        if (res.overallReadiness) setOverallReadinessScore(res.overallReadiness);
        if (res.xpAwarded) setEarnedXp(res.xpAwarded);

        setViewState('results');
      }
    } catch (err) {
      console.error('Mission 5 calculation error:', err);
      setError(err.response?.data?.message || err.message || 'Failed to compute Career Compatibility.');
      setViewState('results');
    } finally {
      setSubmitting(false);
    }
  };

  // Finalize Mission 5
  const handleCompleteMission5 = async () => {
    try {
      await triggerAction('MISSION_5_COMPLETE', 250);
      updateProfile({ ...user });
      setShowCompleteModal(true);
    } catch (e) {
      setShowCompleteModal(true);
    }
  };

  if (loading) {
    return (
      <div className="m5-wrapper" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', color: '#00f3ff' }}>
          <GiAtom style={{ fontSize: '3.5rem', animation: 'spin 2s linear infinite' }} />
          <p style={{ marginTop: '1rem', letterSpacing: '1px' }}>INITIALIZING MULTI-VECTOR COMPATIBILITY ENGINE...</p>
        </div>
      </div>
    );
  }

  const currentStage = PROCESSING_STAGES[processingStageIdx];

  return (
    <div className="m5-wrapper">
      <canvas ref={canvasRef} className="m5-particles-canvas" />
      <div className="m5-grid-overlay" />

      {/* ── Top Progress Header ────────────────────────────────────── */}
      <header className="m5-top-bar">
        <div className="m5-header-info">
          <h1>
            <GiAtom /> Mission 5: Career Compatibility Analysis
          </h1>
          <p>Career Discovery Journey • Multi-Vector Synthesis Engine (30% Acad + 35% AHP + 20% Fuzzy + 15% Beh)</p>
        </div>

        <div className="m5-progress-container">
          <div className="m5-progress-track">
            <div className="m5-progress-fill" style={{ width: '83.3%' }} />
          </div>
          <span className="m5-mission-badge">
            Mission 5 of 6 (83.3%)
          </span>
        </div>
      </header>

      {/* ── Main View ─────────────────────────────────────────────── */}
      <main className="m5-main-view">
        {/* Left AI Mentor Panel */}
        <aside className="m5-mentor-panel">
          <div className="m5-mentor-avatar-wrapper">
            <div className="m5-mentor-avatar-ring" />
            <div className="m5-mentor-avatar">
              <GiAtom />
            </div>
            <div className="m5-mentor-status" />
          </div>

          <div className="m5-mentor-name">COMPATIBILITY CORE</div>
          <div className="m5-mentor-role">MULTI-VECTOR SYNTHESIS ENGINE</div>

          <div className="m5-mentor-dialog">
            <p>
              Greetings, Explorer. In Mission 5, our Career Compatibility Engine synthesizes your Academic Profile, AHP Priority Matrix, Fuzzy Logic Output, and Behaviour Vector into a unified multi-criteria compatibility matrix.
            </p>
          </div>

          <div className="m5-vector-badge">
            <FaLayerGroup style={{ flexShrink: 0 }} />
            <span>Multi-Criteria Weights: 30% Acad + 35% AHP + 20% Fuzzy + 15% Beh. Zero LLMs.</span>
          </div>
        </aside>

        {/* Right Content Panel */}
        <section className="m5-content-panel">
          {error && (
            <div style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid #ef4444', color: '#fca5a5', padding: '0.75rem 1rem', borderRadius: '10px', fontSize: '0.85rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FaExclamationTriangle />
              {error}
            </div>
          )}

          {/* ── COMPUTING STATE: Holographic AI Processing Animation ── */}
          {viewState === 'computing' ? (
            <div className="m5-hologram-box">
              <div className="m5-hud-ring">
                <GiAtom className="m5-hud-core" />
              </div>

              <div className="m5-stage-label">{currentStage.title}</div>
              <div className="m5-stage-sub">{currentStage.desc}</div>

              <div style={{ width: '80%', maxWidth: '500px', margin: '0 auto' }}>
                <div className="m5-progress-track" style={{ width: '100%', height: '10px' }}>
                  <div className="m5-progress-fill" style={{ width: `${progressPct}%` }} />
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--m5-cyan)', marginTop: '8px', fontWeight: 700 }}>
                  Processing Multi-Vector Data: {progressPct}%
                </div>
              </div>
            </div>
          ) : (
            /* ── RESULTS STATE: Ranked Compatibility Matrix (All 12 Domains) ── */
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <h2 style={{ margin: 0, color: '#fff', fontSize: '1.3rem' }}>
                  Multi-Vector Career Compatibility Matrix
                </h2>
                <span style={{ color: 'var(--m5-green)', fontWeight: 800, fontSize: '0.95rem' }}>
                  Overall Readiness: {overallReadinessScore}%
                </span>
              </div>

              {/* Constraint Banner */}
              <div className="m5-constraint-banner">
                <FaLock style={{ color: 'var(--m5-cyan)' }} />
                <span>
                  <strong>Compatibility Matrix Computed!</strong> Detailed career roadmaps & AI recommendations are locked until Mission 6.
                </span>
              </div>

              {/* 12-Domain Compatibility Matrix Grid */}
              <div className="m5-matrix-grid">
                {matrixData.map((item, idx) => (
                  <div
                    key={item.domain}
                    className={`m5-matrix-card ${idx === 0 ? 'top-rank' : ''}`}
                  >
                    <div className="m5-domain-info">
                      <div className="m5-rank-badge">#{idx + 1}</div>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#fff' }}>{item.domain}</div>
                        <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                          Acad: {item.breakdown?.academicScore}% • AHP: {item.breakdown?.ahpScore}% • Fuzzy: {item.breakdown?.fuzzyScore}%
                        </div>
                      </div>
                    </div>

                    <div className="m5-score-badge">
                      {item.scorePercentage}%
                    </div>
                  </div>
                ))}
              </div>

              {/* Footer Nav */}
              <footer className="m5-nav-footer">
                <button
                  type="button"
                  className="m5-btn-back"
                  onClick={() => navigate('/career')}
                >
                  <FaArrowLeft /> Back to Career Path
                </button>

                <button
                  type="button"
                  className="m5-btn-next"
                  onClick={handleCompleteMission5}
                  disabled={submitting}
                >
                  COMPLETE MISSION 5 <FaRocket />
                </button>
              </footer>
            </div>
          )}
        </section>
      </main>

      {/* ── Completion Modal ────────────────────────────────────────── */}
      {showCompleteModal && (
        <div className="m5-modal-overlay">
          <div className="m5-modal-card">
            <FaTrophy style={{ fontSize: '3.5rem', color: 'var(--m5-green)', marginBottom: '1rem', filter: 'drop-shadow(0 0 15px var(--m5-green))' }} />
            <h2 style={{ fontSize: '1.6rem', margin: '0 0 0.5rem 0', color: '#fff' }}>
              MISSION 5 ACCOMPLISHED!
            </h2>
            <p style={{ color: 'var(--m5-cyan)', fontWeight: 700, fontSize: '1.1rem', margin: '0 0 1rem 0' }}>
              + {earnedXp} XP EARNED
            </p>
            <p style={{ color: '#94a3b8', fontSize: '0.88rem', lineHeight: '1.6', marginBottom: '1.5rem' }}>
              Your Multi-Vector Compatibility Matrix across all 12 domains has been computed deterministically and stored in MongoDB.
            </p>

            <button
              className="m5-btn-next"
              style={{ width: '100%', justifyContent: 'center' }}
              onClick={() => navigate('/career/mission-6')}
            >
              PROCEED TO MISSION 6 <FaArrowRight />
            </button>

          </div>
        </div>
      )}
    </div>
  );
};

export default Mission5Compatibility;
