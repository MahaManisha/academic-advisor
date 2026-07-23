// client/src/pages/Mission4CognitiveBehaviour.jsx
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useGamification } from '../context/GamificationContext';
import { getCognitiveBehaviour, submitCognitiveBehaviour } from '../api/career.api';
import {
  FaBrain,
  FaShieldAlt,
  FaCloud,
  FaCode,
  FaLightbulb,
  FaRocket,
  FaArrowRight,
  FaArrowLeft,
  FaTrophy,
  FaExclamationTriangle,
  FaVolumeUp,
  FaVolumeMute,
  FaCompass,
  FaFlask,
  FaCogs,
  FaStar,
  FaInfoCircle
} from 'react-icons/fa';
import { GiArtificialIntelligence, GiPuzzle } from 'react-icons/gi';
import './Mission4CognitiveBehaviour.css';

// 8 Gamified Discovery Challenges (No Pass/Fail, No Right/Wrong Answers)
const DISCOVERY_CHALLENGES = [
  {
    step: 1,
    id: 'techPreference',
    title: 'Challenge 1: Technology Core Alignment',
    prompt: 'Which core technology ecosystem calls to your problem-solving instinct?',
    options: [
      { id: 'ai', label: 'AI & Neural Intelligence', icon: <GiArtificialIntelligence />, desc: 'Autonomous reasoning, deep learning, computer vision' },
      { id: 'cyber', label: 'Cyber Defense & Security', icon: <FaShieldAlt />, desc: 'Penetration testing, threat mitigation, encryption' },
      { id: 'cloud', label: 'High-Scale Cloud & DevOps', icon: <FaCloud />, desc: 'Distributed infrastructure, microservices, containerization' },
      { id: 'ui', label: 'Interactive UI & Frontend', icon: <FaCode />, desc: 'User experience, WebGL graphics, interface design' }
    ]
  },
  {
    step: 2,
    id: 'scenarioDecision',
    title: 'Challenge 2: Crisis Incident Response',
    prompt: 'A major system anomaly occurs during peak live user activity. What is your immediate priority?',
    options: [
      { id: 'security', label: 'Lockdown & Isolation', icon: <FaShieldAlt />, desc: 'Isolate affected nodes to protect user data integrity' },
      { id: 'capacity', label: 'Auto-Scale Capacity', icon: <FaCloud />, desc: 'Spin up extra cloud instances to prevent server crash' },
      { id: 'hotfix', label: 'Live Patch Hotfix', icon: <FaCogs />, desc: 'Deploy instant emergency code patch to active servers' },
      { id: 'ux', label: 'User Incident Notice', icon: <FaCode />, desc: 'Notify users instantly with clean status updates' }
    ]
  },
  {
    step: 3,
    id: 'problemSolving',
    title: 'Challenge 3: Problem Decomposition Strategy',
    prompt: 'Faced with an unfamiliar complex system challenge, how do you prefer to tackle it?',
    options: [
      { id: 'topDown', label: 'Top-Down Architectural Diagramming', icon: <FaBrain />, desc: 'Map high-level components before touching code' },
      { id: 'bottomUp', label: 'Bottom-Up Hands-on Prototype', icon: <FaFlask />, desc: 'Build small quick proof-of-concept code scripts' },
      { id: 'parallel', label: 'Parallel Sub-Task Delegation', icon: <FaCogs />, desc: 'Break into independent modular sub-tasks' },
      { id: 'research', label: 'Literature & Paper Research', icon: <FaCompass />, desc: 'Study existing research papers and prior solutions' }
    ]
  },
  {
    step: 4,
    id: 'logicStyle',
    title: 'Challenge 4: Logic Structure Orientation',
    prompt: 'Which logical structure feels most satisfying when organizing code or workflows?',
    options: [
      { id: 'algorithmic', label: 'Mathematical Logic Flow', icon: <FaBrain />, desc: 'Formal proofs, state machines, algorithmic rigor' },
      { id: 'eventDriven', label: 'Event-Driven Reactive Stream', icon: <FaRocket />, desc: 'Asynchronous event listeners and pub-sub queues' },
      { id: 'modular', label: 'Object-Oriented Abstraction', icon: <FaCogs />, desc: 'Clean interfaces, inheritance, encapsulate responsibilities' },
      { id: 'pipeline', label: 'Functional Data Pipeline', icon: <GiPuzzle />, desc: 'Pure functions, immutability, data transformations' }
    ]
  },
  {
    step: 5,
    id: 'patternRecognition',
    title: 'Challenge 5: Pattern & Trend Analysis',
    prompt: 'When scanning vast datasets or codebases, what pattern catches your eye first?',
    options: [
      { id: 'anomaly', label: 'Edge-Case Anomaly Detection', icon: <FaShieldAlt />, desc: 'Spotting unexpected outliers and boundary failures' },
      { id: 'efficiency', label: 'Performance Bottlenecking', icon: <FaCogs />, desc: 'Identifying memory leaks and slow execution loops' },
      { id: 'reusability', label: 'Duplicate Code & Structural Patterns', icon: <FaCode />, desc: 'Finding opportunities for DRY code refactoring' },
      { id: 'userBehavior', label: 'User Flow Trajectory', icon: <FaCompass />, desc: 'Noticing how users navigate features and drop off' }
    ]
  },
  {
    step: 6,
    id: 'creativityTask',
    title: 'Challenge 6: Creative Product Spark',
    prompt: 'If you could add ONE flagship innovation to a platform, which would you invent?',
    options: [
      { id: 'aiCompanion', label: 'Autonomous AI Companion', icon: <GiArtificialIntelligence />, desc: 'Self-learning AI assistant that predicts user needs' },
      { id: 'instantSync', label: 'Zero-Latency Quantum Sync', icon: <FaCloud />, desc: 'Instant real-time collaboration across all devices' },
      { id: 'unhackableVault', label: 'Zero-Knowledge Crypto Vault', icon: <FaShieldAlt />, desc: 'Absolute privacy using zero-knowledge encryption' },
      { id: 'immersive3d', label: 'Immersive Spatial 3D Portal', icon: <GiPuzzle />, desc: '3D virtual workspace for holographic interactions' }
    ]
  },
  {
    step: 7,
    id: 'riskReward',
    title: 'Challenge 7: Risk vs Reward Orientation',
    prompt: 'When shipping a critical milestone feature, what is your innovation philosophy?',
    options: [
      { id: 'highRisk', label: 'Disruptive Moonshot (High Risk / High Reward)', icon: <FaRocket />, desc: 'Try radical new tech that could transform the industry' },
      { id: 'balanced', label: 'Balanced Innovation (Moderate Risk)', icon: <FaLightbulb />, desc: 'Combine proven frameworks with 20% experimental tech' },
      { id: 'safe', label: 'Battle-Tested Reliability (Low Risk)', icon: <FaShieldAlt />, desc: 'Stick 100% to industry standard enterprise solutions' }
    ]
  },
  {
    step: 8,
    id: 'resourceAllocation',
    title: 'Challenge 8: System Resource Allocation',
    prompt: 'Distribute 100 Power Units across key System Priorities:',
    type: 'allocation'
  }
];

const Mission4CognitiveBehaviour = () => {
  const { user, updateProfile } = useAuth();
  const { triggerAction } = useGamification();
  const navigate = useNavigate();
  const canvasRef = useRef(null);

  const [currentStep, setCurrentStep] = useState(1);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [earnedXp, setEarnedXp] = useState(250);
  const [activeAchievement, setActiveAchievement] = useState(null);

  // Challenge Selections State
  const [responses, setResponses] = useState({
    techPreference: 'ai',
    scenarioDecision: 'capacity',
    problemSolving: 'parallel',
    logicStyle: 'eventDriven',
    patternRecognition: 'anomaly',
    creativityTask: 'aiCompanion',
    riskReward: 'balanced',
    resourceAllocation: { performance: 30, security: 30, ux: 20, innovation: 20 }
  });

  // Telemetry Tracking State
  const [stepStartTime, setStepStartTime] = useState(Date.now());
  const [responseTimesMs, setResponseTimesMs] = useState([]);
  const [choiceChangesCount, setChoiceChangesCount] = useState(0);
  const [curiosityClicksCount, setCuriosityClicksCount] = useState(0);
  const [navigationFlipsCount, setNavigationFlipsCount] = useState(0);
  const [curiosityExpanded, setCuriosityExpanded] = useState({});

  // Vector Result Cache
  const [computedVector, setComputedVector] = useState(null);
  const [summaryProfile, setSummaryProfile] = useState(null);

  // Web Audio API Sound Synthesizer (No external assets required!)
  const playSynthSound = (freq = 440, type = 'sine', duration = 0.15) => {
    if (!soundEnabled) return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch (e) {
      // Audio fallback
    }
  };

  // Load existing profile if present
  useEffect(() => {
    (async () => {
      try {
        const res = await getCognitiveBehaviour();
        if (res.success && res.data?.behaviourVector) {
          setComputedVector(res.data.behaviourVector);
          if (res.data.behaviourProfileSummary) setSummaryProfile(res.data.behaviourProfileSummary);
        }
      } catch (e) {
        console.error("Failed to load existing Mission 4 data:", e);
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
      color: Math.random() > 0.5 ? 'rgba(0, 243, 255, ' : 'rgba(236, 72, 153, ',
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

  // Record Option Selection with Telemetry & Sound
  const handleSelectOption = (challengeId, optionId) => {
    playSynthSound(587.33, 'triangle', 0.1); // High D5 synth click
    if (responses[challengeId] !== optionId) {
      setChoiceChangesCount(prev => prev + 1);
    }
    setResponses(prev => ({ ...prev, [challengeId]: optionId }));
  };

  // Toggle Curiosity Card Inspection
  const toggleCuriosityCard = (optionId) => {
    playSynthSound(783.99, 'sine', 0.12); // G5 synth blip
    setCuriosityClicksCount(prev => prev + 1);
    setCuriosityExpanded(prev => ({ ...prev, [optionId]: !prev[optionId] }));
  };

  // Resource Allocation Handler
  const handleAllocationChange = (key, val) => {
    const num = Number(val);
    setResponses(prev => ({
      ...prev,
      resourceAllocation: { ...prev.resourceAllocation, [key]: num }
    }));
  };

  // Trigger Achievement Popup
  const showAchievement = (title, desc) => {
    playSynthSound(880, 'sawtooth', 0.25); // A5 achievement chord
    setActiveAchievement({ title, desc });
    setTimeout(() => setActiveAchievement(null), 3000);
  };

  // Move to Next Challenge Step
  const handleNextStep = () => {
    const timeSpentMs = Date.now() - stepStartTime;
    setResponseTimesMs(prev => [...prev, timeSpentMs]);

    playSynthSound(659.25, 'sine', 0.15); // E5 synth step transition

    // Trigger Gamified Achievements based on telemetry
    if (currentStep === 2 && timeSpentMs < 4000) {
      showAchievement('⚡ Rapid Decider', 'Made swift crisis decisions under 4 seconds!');
    } else if (currentStep === 4 && curiosityClicksCount > 2) {
      showAchievement('🔍 Deep Curiosity Explorer', 'Expanded multiple info tooltip cards!');
    }

    if (currentStep < DISCOVERY_CHALLENGES.length) {
      setCurrentStep(prev => prev + 1);
      setStepStartTime(Date.now());
    }
  };

  const handlePrevStep = () => {
    setNavigationFlipsCount(prev => prev + 1);
    playSynthSound(392, 'sine', 0.15); // G4 synth back
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
      setStepStartTime(Date.now());
    }
  };

  // Submit Mission 4
  const handleSubmitMission4 = async () => {
    try {
      setSubmitting(true);
      const totalDurationMs = responseTimesMs.reduce((a, b) => a + b, 0) + (Date.now() - stepStartTime);

      const payload = {
        telemetry: {
          responseTimesMs,
          totalDurationMs,
          choiceChangesCount,
          curiosityClicksCount,
          navigationFlipsCount
        },
        challengeResponses: responses
      };

      const res = await submitCognitiveBehaviour(payload);
      if (res.success) {
        if (res.xpAwarded) setEarnedXp(res.xpAwarded);
        if (res.behaviourVector) setComputedVector(res.behaviourVector);
        if (res.summary) setSummaryProfile(res.summary);

        playSynthSound(1046.5, 'square', 0.4); // C6 fanfare synth
        await triggerAction('MISSION_4_COMPLETE', 250);
        updateProfile({ ...user });
        setShowCompleteModal(true);
      }
    } catch (err) {
      console.error('Mission 4 submission error:', err);
      setError(err.response?.data?.message || err.message || 'Failed to submit Cognitive & Behaviour Discovery.');
    } finally {
      setSubmitting(false);
    }
  };

  const currentChallenge = DISCOVERY_CHALLENGES[currentStep - 1];

  return (
    <div className="m4-wrapper">
      <canvas ref={canvasRef} className="m4-particles-canvas" />
      <div className="m4-grid-overlay" />

      {/* Achievement Popup Notification */}
      {activeAchievement && (
        <div className="m4-achievement-popup">
          <FaStar style={{ fontSize: '1.5rem', color: '#fbbf24' }} />
          <div>
            <div style={{ fontWeight: 800, fontSize: '0.9rem' }}>{activeAchievement.title}</div>
            <div style={{ fontSize: '0.75rem', opacity: 0.9 }}>{activeAchievement.desc}</div>
          </div>
        </div>
      )}

      {/* ── Top Progress Header ────────────────────────────────────── */}
      <header className="m4-top-bar">
        <div className="m4-header-info">
          <h1>
            <FaBrain /> Mission 4: Cognitive & Behaviour Discovery
          </h1>
          <p>Career Discovery Journey • Real-Time Telemetry & 8-D Behaviour Vector</p>
        </div>

        <div className="m4-header-controls">
          <button
            type="button"
            className="m4-sound-btn"
            onClick={() => setSoundEnabled(!soundEnabled)}
          >
            {soundEnabled ? <><FaVolumeUp /> Sound FX ON</> : <><FaVolumeMute /> Muted</>}
          </button>

          <div className="m4-progress-track">
            <div
              className="m4-progress-fill"
              style={{ width: `${(currentStep / DISCOVERY_CHALLENGES.length) * 100}%` }}
            />
          </div>
          <span className="m4-mission-badge">
            Mission 4 of 6 ({Math.round((currentStep / DISCOVERY_CHALLENGES.length) * 100)}%)
          </span>
        </div>
      </header>

      {/* ── Main View ─────────────────────────────────────────────── */}
      <main className="m4-main-view">
        {/* Left AI Mentor Panel */}
        <aside className="m4-mentor-panel">
          <div className="m4-mentor-avatar-wrapper">
            <div className="m4-mentor-avatar-ring" />
            <div className="m4-mentor-avatar">
              <FaBrain />
            </div>
            <div className="m4-mentor-status" />
          </div>

          <div className="m4-mentor-name">COGNITIVE TELEMETRY CORE</div>
          <div className="m4-mentor-role">BEHAVIOURAL PATTERN MONITOR</div>

          <div className="m4-mentor-dialog">
            <p>
              Greetings, Explorer. Mission 4 measures your cognitive style and behavioral decision patterns. There are NO right or wrong answers, NO marks, and NO pass/fail grades. Only pure behavioral telemetry tracking.
            </p>
          </div>

          <div className="m4-telemetry-badge">
            <FaInfoCircle style={{ flexShrink: 0 }} />
            <span>Tracking: Response Time (ms), Choice Revisions, Curiosity Cards, Persistence.</span>
          </div>
        </aside>

        {/* Right Content Panel (Gamified Challenge Area) */}
        <section className="m4-content-panel">
          {error && (
            <div style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid #ef4444', color: '#fca5a5', padding: '0.75rem 1rem', borderRadius: '10px', fontSize: '0.85rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FaExclamationTriangle />
              {error}
            </div>
          )}

          <div className="m4-challenge-header">
            <h2>{currentChallenge.title}</h2>
            <span style={{ fontSize: '0.85rem', color: 'var(--m4-cyan)' }}>
              Challenge {currentStep} of {DISCOVERY_CHALLENGES.length}
            </span>
          </div>

          <p style={{ color: '#e2e8f0', fontSize: '1rem', marginBottom: '1.5rem', lineHeight: '1.5' }}>
            {currentChallenge.prompt}
          </p>

          {/* Standard Challenge Cards (Steps 1 to 7) */}
          {currentChallenge.type !== 'allocation' ? (
            <div className="m4-challenge-grid">
              {currentChallenge.options.map(opt => {
                const selected = responses[currentChallenge.id] === opt.id;
                const expanded = curiosityExpanded[opt.id];
                return (
                  <div
                    key={opt.id}
                    className={`m4-challenge-card ${selected ? 'selected' : ''}`}
                    onClick={() => handleSelectOption(currentChallenge.id, opt.id)}
                  >
                    <div className="m4-card-icon">{opt.icon}</div>
                    <div className="m4-card-title">{opt.label}</div>
                    <div className="m4-card-desc">{opt.desc}</div>

                    {/* Curiosity Expand Card */}
                    <div
                      className="m4-curiosity-box"
                      onClick={(e) => { e.stopPropagation(); toggleCuriosityCard(opt.id); }}
                    >
                      <FaInfoCircle style={{ marginRight: '4px' }} />
                      {expanded ? 'Hide Cognitive Context' : 'Inspect Cognitive Context'}
                    </div>

                    {expanded && (
                      <div style={{ marginTop: '8px', fontSize: '0.73rem', color: '#cbd5e1', background: 'rgba(0,0,0,0.4)', padding: '8px', borderRadius: '6px' }}>
                        This selection indicates an preference towards {opt.label} and will contribute to your 8-D Behaviour Vector.
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            /* Resource Allocation Challenge (Step 8) */
            <div style={{ flex: 1 }}>
              <div className="m4-resource-group">
                <div className="m4-resource-label">
                  <span>🚀 Core System Performance</span>
                  <span style={{ color: 'var(--m4-cyan)' }}>{responses.resourceAllocation.performance} Power Units</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="50"
                  className="m4-range-slider"
                  value={responses.resourceAllocation.performance}
                  onChange={e => handleAllocationChange('performance', e.target.value)}
                />
              </div>

              <div className="m4-resource-group">
                <div className="m4-resource-label">
                  <span>🛡️ Security Fortress & Encryption</span>
                  <span style={{ color: 'var(--m4-purple)' }}>{responses.resourceAllocation.security} Power Units</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="50"
                  className="m4-range-slider"
                  value={responses.resourceAllocation.security}
                  onChange={e => handleAllocationChange('security', e.target.value)}
                />
              </div>

              <div className="m4-resource-group">
                <div className="m4-resource-label">
                  <span>🎨 User Interface & Experience</span>
                  <span style={{ color: 'var(--m4-pink)' }}>{responses.resourceAllocation.ux} Power Units</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="50"
                  className="m4-range-slider"
                  value={responses.resourceAllocation.ux}
                  onChange={e => handleAllocationChange('ux', e.target.value)}
                />
              </div>

              <div className="m4-resource-group">
                <div className="m4-resource-label">
                  <span>⚡ Moonshot R&D Innovation</span>
                  <span style={{ color: '#fbbf24' }}>{responses.resourceAllocation.innovation} Power Units</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="50"
                  className="m4-range-slider"
                  value={responses.resourceAllocation.innovation}
                  onChange={e => handleAllocationChange('innovation', e.target.value)}
                />
              </div>
            </div>
          )}

          {/* Footer Nav */}
          <footer className="m4-nav-footer">
            <button
              type="button"
              className="m4-btn-back"
              onClick={handlePrevStep}
              disabled={currentStep === 1 || submitting}
            >
              <FaArrowLeft /> Back
            </button>

            {currentStep < DISCOVERY_CHALLENGES.length ? (
              <button
                type="button"
                className="m4-btn-next"
                onClick={handleNextStep}
              >
                Next Challenge <FaArrowRight />
              </button>
            ) : (
              <button
                type="button"
                className="m4-btn-next"
                onClick={handleSubmitMission4}
                disabled={submitting}
              >
                {submitting ? 'PROCESSING VECTOR...' : 'COMPLETE MISSION 4'} <FaRocket />
              </button>
            )}
          </footer>
        </section>
      </main>

      {/* ── Completion Modal ────────────────────────────────────────── */}
      {showCompleteModal && (
        <div className="m4-modal-overlay">
          <div className="m4-modal-card">
            <FaTrophy style={{ fontSize: '3.5rem', color: 'var(--m4-cyan)', marginBottom: '1rem', filter: 'drop-shadow(0 0 15px var(--m4-cyan))' }} />
            <h2 style={{ fontSize: '1.6rem', margin: '0 0 0.5rem 0', color: '#fff' }}>
              MISSION 4 ACCOMPLISHED!
            </h2>
            <p style={{ color: 'var(--m4-cyan)', fontWeight: 700, fontSize: '1.1rem', margin: '0 0 1rem 0' }}>
              + {earnedXp} XP EARNED
            </p>

            {summaryProfile && (
              <div style={{ background: 'rgba(0,0,0,0.35)', border: '1px solid rgba(0,243,255,0.25)', borderRadius: '12px', padding: '1rem', marginBottom: '1.5rem', textAlign: 'left' }}>
                <h4 style={{ margin: '0 0 8px 0', color: '#fff', fontSize: '0.95rem' }}>
                  Cognitive Archetype: <span style={{ color: 'var(--m4-cyan)' }}>{summaryProfile.primaryCognitiveStyle}</span>
                </h4>
                <div style={{ fontSize: '0.8rem', color: '#cbd5e1', lineHeight: '1.5' }}>
                  <div><strong>Decision Style:</strong> {summaryProfile.decisionStyle}</div>
                  <div><strong>Speed Index:</strong> {summaryProfile.speedIndex}</div>
                  <div><strong>Risk Profile:</strong> {summaryProfile.riskProfile}</div>
                </div>
              </div>
            )}

            <button
              className="m4-btn-next"
              style={{ width: '100%', justifyContent: 'center' }}
              onClick={() => navigate('/career/mission-5')}
            >
              PROCEED TO MISSION 5 <FaArrowRight />
            </button>

          </div>
        </div>
      )}
    </div>
  );
};

export default Mission4CognitiveBehaviour;
