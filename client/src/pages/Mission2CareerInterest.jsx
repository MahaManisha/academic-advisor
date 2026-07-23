// client/src/pages/Mission2CareerInterest.jsx
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useGamification } from '../context/GamificationContext';
import { getCareerInterest, submitCareerInterest } from '../api/career.api';
import {
  FaBrain,
  FaShieldAlt,
  FaCloud,
  FaCode,
  FaDatabase,
  FaCogs,
  FaMobileAlt,
  FaGamepad,
  FaMicrochip,
  FaArrowRight,
  FaArrowLeft,
  FaCheckCircle,
  FaTrophy,
  FaExclamationTriangle,
  FaRedo,
  FaChartLine,
  FaRocket,
  FaBalanceScale
} from 'react-icons/fa';
import { GiArtificialIntelligence, GiProcessor } from 'react-icons/gi';

import './Mission2CareerInterest.css';

// 12 Core Career Domains Catalog (NO Dropdowns used!)
const CAREER_DOMAINS_CATALOG = [
  {
    id: 'Artificial Intelligence',
    title: 'Artificial Intelligence',
    icon: <GiArtificialIntelligence />,
    difficulty: 'Hard',
    description: 'Design intelligent autonomous systems, computer vision, and neural models.',
    applications: 'Autonomous Vehicles, Robotics, AI Agents',
    techStack: ['Python', 'PyTorch', 'CUDA', 'OpenCV']
  },
  {
    id: 'Machine Learning',
    title: 'Machine Learning',
    icon: <FaBrain />,
    difficulty: 'Hard',
    description: 'Build predictive statistical models, recommendation systems, and data pipelines.',
    applications: 'Fraud Detection, Personalization, Analytics',
    techStack: ['Python', 'Scikit-Learn', 'TensorFlow', 'Pandas']
  },
  {
    id: 'Data Science',
    title: 'Data Science',
    icon: <FaDatabase />,
    difficulty: 'Medium',
    description: 'Extract actionable insights, statistical trends, and visualization from big data.',
    applications: 'Business Intelligence, Market Forecasts',
    techStack: ['R', 'Python', 'SQL', 'Tableau']
  },
  {
    id: 'Cyber Security',
    title: 'Cyber Security',
    icon: <FaShieldAlt />,
    difficulty: 'Hard',
    description: 'Protect networks, analyze threats, conduct ethical hacking, and secure data.',
    applications: 'Pentesting, SOC Analysis, Cryptography',
    techStack: ['Linux', 'Wireshark', 'Metasploit', 'Python']
  },
  {
    id: 'Cloud Computing',
    title: 'Cloud Computing',
    icon: <FaCloud />,
    difficulty: 'Medium',
    description: 'Architect scalable cloud infrastructure, serverless systems, and microservices.',
    applications: 'Enterprise Cloud Systems, AWS Architecture',
    techStack: ['AWS', 'Azure', 'Docker', 'Kubernetes']
  },
  {
    id: 'DevOps',
    title: 'DevOps',
    icon: <FaCogs />,
    difficulty: 'Medium',
    description: 'Automate CI/CD deployment pipelines, infrastructure as code, and site reliability.',
    applications: 'Automated Deployment, System Reliability',
    techStack: ['Jenkins', 'Terraform', 'Ansible', 'GitLab']
  },
  {
    id: 'Full Stack Development',
    title: 'Full Stack Development',
    icon: <FaCode />,
    difficulty: 'Medium',
    description: 'Build complete end-to-end web applications combining frontend UI and backend APIs.',
    applications: 'SaaS Platforms, Web Applications',
    techStack: ['React', 'Node.js', 'Express', 'MongoDB']
  },
  {
    id: 'Frontend',
    title: 'Frontend',
    icon: <GiProcessor />,
    difficulty: 'Easy',

    description: 'Craft responsive, high-performance, and visually stunning user interfaces.',
    applications: 'Web Portals, Interactive Dashboards',
    techStack: ['React', 'Vue', 'CSS3', 'WebGL', 'Tailwind']
  },
  {
    id: 'Backend',
    title: 'Backend',
    icon: <FaChartLine />,
    difficulty: 'Medium',
    description: 'Engineer high-throughput server architecture, REST/GraphQL APIs, and databases.',
    applications: 'Payment Gateways, API Platforms',
    techStack: ['Node.js', 'Python', 'Java', 'PostgreSQL']
  },
  {
    id: 'Mobile Development',
    title: 'Mobile Development',
    icon: <FaMobileAlt />,
    difficulty: 'Medium',
    description: 'Develop native and cross-platform mobile apps for iOS and Android devices.',
    applications: 'Mobile Banking, Consumer Social Apps',
    techStack: ['React Native', 'Flutter', 'Swift', 'Kotlin']
  },
  {
    id: 'Game Development',
    title: 'Game Development',
    icon: <FaGamepad />,
    difficulty: 'Hard',
    description: 'Create interactive 2D/3D video games, physics engines, and immersive VR/AR.',
    applications: '3D Video Games, Simulations, VR/AR',
    techStack: ['Unity', 'Unreal Engine', 'C#', 'C++']
  },
  {
    id: 'Research',
    title: 'Research',
    icon: <FaMicrochip />,
    difficulty: 'Hard',
    description: 'Pioneer novel theoretical algorithms, quantum computing, and academic breakthroughs.',
    applications: 'Quantum Algorithms, Academic Papers',
    techStack: ['Python', 'LaTeX', 'Matlab', 'Algorithm Design']
  }
];

// Random Index (RI) table for AHP
const RI_TABLE = { 1: 0, 2: 0, 3: 0.58, 4: 0.90, 5: 1.12, 6: 1.24, 7: 1.32, 8: 1.41, 9: 1.45, 10: 1.49 };

const Mission2CareerInterest = () => {
  const { user, updateProfile } = useAuth();
  const { triggerAction } = useGamification();
  const navigate = useNavigate();
  const canvasRef = useRef(null);

  // Phases: 1 = Domain Selection, 2 = Pairwise Duels, 3 = AHP Matrix Review
  const [phase, setPhase] = useState(1);
  const [selectedDomainIds, setSelectedDomainIds] = useState(['Artificial Intelligence', 'Cyber Security', 'Cloud Computing', 'Full Stack Development']);
  
  // Pairwise Comparisons State
  const [duelPairs, setDuelPairs] = useState([]);
  const [currentDuelIndex, setCurrentDuelIndex] = useState(0);
  const [comparisonRatings, setComparisonRatings] = useState({}); // { "DomainA vs DomainB": ratio }
  
  // Slider value (-8 to +8 scale mapped to 1/9 .. 1 .. 9)
  const [sliderValue, setSliderValue] = useState(0);

  // AHP Result Cache
  const [ahpCalculation, setAhpCalculation] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [earnedXp, setEarnedXp] = useState(250);

  // Load existing Mission 2 profile if present
  useEffect(() => {
    (async () => {
      try {
        const res = await getCareerInterest();
        if (res.success && res.data?.selectedDomains?.length >= 2) {
          setSelectedDomainIds(res.data.selectedDomains);
        }
      } catch (e) {
        console.error("Failed to load existing Mission 2 data:", e);
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
      color: Math.random() > 0.5 ? 'rgba(168, 85, 247, ' : 'rgba(0, 243, 255, ',
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

  // Toggle selection of domain card (Phase 1)
  const toggleDomainSelection = (id) => {
    setError('');
    setSelectedDomainIds(prev => {
      if (prev.includes(id)) {
        if (prev.length <= 2) {
          setError('Please keep at least 2 domains selected for AHP comparison.');
          return prev;
        }
        return prev.filter(d => d !== id);
      } else {
        if (prev.length >= 6) {
          setError('You can select a maximum of 6 domains for optimal pairwise comparisons.');
          return prev;
        }
        return [...prev, id];
      }
    });
  };

  // Generate all n*(n-1)/2 pairwise duel combinations for Phase 2
  const startPairwiseDuels = () => {
    if (selectedDomainIds.length < 2) {
      setError('Select at least 2 domains to proceed.');
      return;
    }
    setError('');

    const pairs = [];
    for (let i = 0; i < selectedDomainIds.length; i++) {
      for (let j = i + 1; j < selectedDomainIds.length; j++) {
        pairs.push({
          domainA: selectedDomainIds[i],
          domainB: selectedDomainIds[j]
        });
      }
    }

    setDuelPairs(pairs);
    setCurrentDuelIndex(0);
    setSliderValue(0); // Equal 1:1 initial preference
    setPhase(2);
  };

  // Map Slider value (-8 to +8) to AHP Ratio (1/9 to 9)
  // -8 = 9:1 for B, 0 = 1:1, +8 = 9:1 for A
  const sliderToAhpRatio = (val) => {
    if (val === 0) return 1.0;
    if (val > 0) return val + 1; // 1 -> 2, 8 -> 9
    return 1.0 / (Math.abs(val) + 1); // -1 -> 1/2, -8 -> 1/9
  };

  // Record slider rating for current duel and move to next
  const handleDuelAnswer = () => {
    const pair = duelPairs[currentDuelIndex];
    const key = `${pair.domainA} vs ${pair.domainB}`;
    const ratio = sliderToAhpRatio(sliderValue);

    const updatedRatings = { ...comparisonRatings, [key]: { domainA: pair.domainA, domainB: pair.domainB, ratio } };
    setComparisonRatings(updatedRatings);

    if (currentDuelIndex < duelPairs.length - 1) {
      setCurrentDuelIndex(prev => prev + 1);
      setSliderValue(0);
    } else {
      // All duels completed! Run local AHP matrix solver for Phase 3 review
      calculateAhpLocally(updatedRatings);
      setPhase(3);
    }
  };

  // Local AHP Matrix Calculator & Consistency Ratio Computation
  const calculateAhpLocally = (ratingsMap) => {
    const n = selectedDomainIds.length;
    const matrix = Array.from({ length: n }, () => Array(n).fill(1.0));
    const domainIdxMap = {};
    selectedDomainIds.forEach((d, idx) => { domainIdxMap[d] = idx; });

    Object.values(ratingsMap).forEach(({ domainA, domainB, ratio }) => {
      const idxA = domainIdxMap[domainA];
      const idxB = domainIdxMap[domainB];
      if (idxA !== undefined && idxB !== undefined) {
        matrix[idxA][idxB] = ratio;
        matrix[idxB][idxA] = 1.0 / ratio;
      }
    });

    // Column Sums
    const colSums = Array(n).fill(0);
    for (let j = 0; j < n; j++) {
      for (let i = 0; i < n; i++) colSums[j] += matrix[i][j];
    }

    // Row Averages (Priority Vector)
    const priorityVector = Array(n).fill(0);
    for (let i = 0; i < n; i++) {
      let rowSum = 0;
      for (let j = 0; j < n; j++) rowSum += matrix[i][j] / colSums[j];
      priorityVector[i] = rowSum / n;
    }

    // Weighted Sum (y = A * w)
    const y = Array(n).fill(0);
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) y[i] += matrix[i][j] * priorityVector[j];
    }

    // Lambda Max
    let lambdaSum = 0;
    for (let i = 0; i < n; i++) lambdaSum += y[i] / priorityVector[i];
    const lambdaMax = lambdaSum / n;

    // Consistency Index (CI) & Ratio (CR)
    const CI = n > 1 ? (lambdaMax - n) / (n - 1) : 0;
    const RI = RI_TABLE[n] || 1.49;
    const CR = RI > 0 ? CI / RI : 0;

    const domainAffinity = selectedDomainIds.map((domain, i) => ({
      domain,
      weight: Number(priorityVector[i].toFixed(4)),
      scorePercentage: Number((priorityVector[i] * 100).toFixed(1))
    })).sort((a, b) => b.weight - a.weight);

    domainAffinity.forEach((item, index) => { item.rank = index + 1; });

    setAhpCalculation({
      matrix,
      priorityVector,
      domainAffinity,
      lambdaMax: Number(lambdaMax.toFixed(4)),
      consistencyIndex: Number(CI.toFixed(4)),
      consistencyRatio: Number(CR.toFixed(4)),
      isConsistent: CR <= 0.10
    });
  };

  // Submit Mission 2 to Server
  const handleSubmitMission2 = async () => {
    setError('');
    try {
      setSubmitting(true);
      const comparisonsList = Object.values(comparisonRatings);
      const res = await submitCareerInterest({
        selectedDomains: selectedDomainIds,
        pairwiseComparisons: comparisonsList
      });

      if (res.success) {
        if (res.xpAwarded) setEarnedXp(res.xpAwarded);
        await triggerAction('MISSION_2_COMPLETE', 250);
        updateProfile({ ...user });
        setShowCompleteModal(true);
      }
    } catch (err) {
      console.error('Mission 2 submit error:', err);
      setError(err.response?.data?.message || err.message || 'Failed to submit Career Interest Profile.');
    } finally {
      setSubmitting(false);
    }
  };

  // AI Mentor Dialog Content
  const getMentorMessage = () => {
    if (phase === 1) {
      return "Greetings, Explorer. Select 2 to 6 career domains below. We will use the Analytic Hierarchy Process (AHP) matrix to calculate your exact interest priority vector. No AI or LLMs used!";
    }
    if (phase === 2) {
      return `Duel Round ${currentDuelIndex + 1} of ${duelPairs.length}: Evaluate which domain excites your passion more using the duel slider.`;
    }
    return ahpCalculation?.isConsistent
      ? `AHP Matrix Solved! Consistency Ratio (CR = ${ahpCalculation?.consistencyRatio}) is optimal (<= 0.10). Click to complete Mission 2!`
      : `Warning: High Inconsistency Detected (CR = ${ahpCalculation?.consistencyRatio} > 0.10). Review your choices or re-run duels to ensure logical preference alignment.`;
  };

  return (
    <div className="m2-wrapper">
      <canvas ref={canvasRef} className="m2-particles-canvas" />
      <div className="m2-grid-overlay" />

      {/* ── Top Progress Header ────────────────────────────────────── */}
      <header className="m2-top-bar">
        <div className="m2-header-info">
          <h1>
            <FaBalanceScale /> Mission 2: Career Interest Discovery
          </h1>
          <p>Career Discovery Journey • Analytic Hierarchy Process (AHP) Matrix Engine</p>
        </div>

        <div className="m2-progress-container">
          <div className="m2-progress-track">
            <div
              className="m2-progress-fill"
              style={{ width: `${(phase / 3) * 100}%` }}
            />
          </div>
          <span className="m2-mission-badge">
            Mission 2 of 6 ({Math.round((phase / 3) * 100)}%)
          </span>
        </div>
      </header>

      {/* ── Main Split View ───────────────────────────────────────── */}
      <main className="m2-main-view">
        {/* Left AI Mentor Panel */}
        <aside className="m2-mentor-panel">
          <div className="m2-mentor-avatar-wrapper">
            <div className="m2-mentor-avatar-ring" />
            <div className="m2-mentor-avatar">
              <FaBalanceScale />
            </div>
            <div className="m2-mentor-status" />
          </div>

          <div className="m2-mentor-name">AHP VECTOR ENGINE</div>
          <div className="m2-mentor-role">DECISION MATRIX ANALYZER</div>

          <div className="m2-mentor-dialog">
            <p>{getMentorMessage()}</p>
          </div>

          <div className="m2-ahp-math-badge">
            <FaCheckCircle style={{ flexShrink: 0 }} />
            <span>Pure Deterministic AHP Matrix Math: CR = CI / RI. Zero AI/LLM models.</span>
          </div>
        </aside>

        {/* Right Main Content Panel */}
        <section className="m2-content-panel">
          {error && (
            <div style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid #ef4444', color: '#fca5a5', padding: '0.75rem 1rem', borderRadius: '10px', fontSize: '0.85rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FaExclamationTriangle />
              {error}
            </div>
          )}

          {/* ── PHASE 1: Interactive Animated Career Cards Grid (No Dropdowns!) ── */}
          {phase === 1 && (
            <div>
              <div className="m2-step-header">
                <h2>Phase 1: Select Target Career Domains</h2>
                <span style={{ fontSize: '0.85rem', color: 'var(--m2-cyan)' }}>
                  Selected: {selectedDomainIds.length} / 6
                </span>
              </div>

              <div className="m2-cards-grid">
                {CAREER_DOMAINS_CATALOG.map(domain => {
                  const selected = selectedDomainIds.includes(domain.id);
                  return (
                    <div
                      key={domain.id}
                      className={`m2-domain-card ${selected ? 'selected' : ''}`}
                      onClick={() => toggleDomainSelection(domain.id)}
                    >
                      {selected && <FaCheckCircle className="m2-check-circle" />}
                      
                      <div className="m2-card-top">
                        <div className="m2-card-icon">{domain.icon}</div>
                        <span className={`m2-diff-badge m2-diff-${domain.difficulty.toLowerCase()}`}>
                          {domain.difficulty}
                        </span>
                      </div>

                      <div className="m2-card-title">{domain.title}</div>
                      <div className="m2-card-desc">{domain.description}</div>

                      <div className="m2-card-section">
                        <strong>Apps:</strong> {domain.applications}
                      </div>

                      <div className="m2-tech-tags">
                        {domain.techStack.map(t => (
                          <span key={t} className="m2-mini-tag">{t}</span>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>

              <footer className="m2-nav-footer">
                <button
                  type="button"
                  className="m2-btn-back"
                  onClick={() => navigate('/career')}
                >
                  <FaArrowLeft /> Back to Career Path
                </button>

                <button
                  type="button"
                  className="m2-btn-next"
                  onClick={startPairwiseDuels}
                  disabled={selectedDomainIds.length < 2}
                >
                  Start Pairwise Duels ({selectedDomainIds.length * (selectedDomainIds.length - 1) / 2} Matches) <FaArrowRight />
                </button>
              </footer>
            </div>
          )}

          {/* ── PHASE 2: Interactive Pairwise Comparison Duel Cards ── */}
          {phase === 2 && duelPairs.length > 0 && (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
              <div className="m2-step-header">
                <h2>Phase 2: AHP Preference Duels</h2>
                <span style={{ fontSize: '0.85rem', color: 'var(--m2-purple)' }}>
                  Match {currentDuelIndex + 1} of {duelPairs.length}
                </span>
              </div>

              <div className="m2-duel-container">
                <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                  Which career domain excites your passion more?
                </p>

                <div className="m2-duel-vs-row">
                  {/* Domain A Card */}
                  {(() => {
                    const domA = CAREER_DOMAINS_CATALOG.find(d => d.id === duelPairs[currentDuelIndex].domainA);
                    return (
                      <div className={`m2-duel-card ${sliderValue > 0 ? 'active' : ''}`}>
                        <div className="m2-duel-icon">{domA?.icon}</div>
                        <h3 style={{ margin: '0 0 0.5rem 0', color: '#fff' }}>{domA?.title}</h3>
                        <p style={{ fontSize: '0.78rem', color: '#94a3b8', margin: 0 }}>{domA?.description}</p>
                      </div>
                    );
                  })()}

                  <div className="m2-vs-badge">VS</div>

                  {/* Domain B Card */}
                  {(() => {
                    const domB = CAREER_DOMAINS_CATALOG.find(d => d.id === duelPairs[currentDuelIndex].domainB);
                    return (
                      <div className={`m2-duel-card ${sliderValue < 0 ? 'active' : ''}`}>
                        <div className="m2-duel-icon" style={{ color: 'var(--m2-purple)' }}>{domB?.icon}</div>
                        <h3 style={{ margin: '0 0 0.5rem 0', color: '#fff' }}>{domB?.title}</h3>
                        <p style={{ fontSize: '0.78rem', color: '#94a3b8', margin: 0 }}>{domB?.description}</p>
                      </div>
                    );
                  })()}
                </div>

                {/* Preference Slider Box */}
                <div className="m2-slider-box">
                  <div className="m2-slider-label">
                    {sliderValue === 0 && <span style={{ color: '#e2e8f0' }}>1 : 1 — Equal Interest in Both</span>}
                    {sliderValue > 0 && <span style={{ color: 'var(--m2-cyan)' }}>{sliderValue + 1} : 1 — Preference for {duelPairs[currentDuelIndex].domainA}</span>}
                    {sliderValue < 0 && <span style={{ color: 'var(--m2-purple)' }}>1 : {Math.abs(sliderValue) + 1} — Preference for {duelPairs[currentDuelIndex].domainB}</span>}
                  </div>

                  <input
                    type="range"
                    min="-8"
                    max="8"
                    step="1"
                    className="m2-range-slider"
                    value={sliderValue}
                    onChange={e => setSliderValue(Number(e.target.value))}
                  />

                  <div className="m2-slider-scale">
                    <span>9x {duelPairs[currentDuelIndex].domainB}</span>
                    <span>Equal</span>
                    <span>9x {duelPairs[currentDuelIndex].domainA}</span>
                  </div>
                </div>
              </div>

              <footer className="m2-nav-footer">
                <button
                  type="button"
                  className="m2-btn-back"
                  onClick={() => setPhase(1)}
                >
                  <FaArrowLeft /> Back to Selection
                </button>

                <button
                  type="button"
                  className="m2-btn-next"
                  onClick={handleDuelAnswer}
                >
                  {currentDuelIndex < duelPairs.length - 1 ? 'Next Match' : 'Compute AHP Matrix'} <FaArrowRight />
                </button>
              </footer>
            </div>
          )}

          {/* ── PHASE 3: AHP Matrix Results & Consistency Verification ── */}
          {phase === 3 && ahpCalculation && (
            <div>
              <div className="m2-step-header">
                <h2>Phase 3: AHP Priority Vector & Consistency Review</h2>
                <span style={{ fontSize: '0.85rem', color: ahpCalculation.isConsistent ? '#34d399' : '#f87171' }}>
                  CR = {ahpCalculation.consistencyRatio}
                </span>
              </div>

              {/* Consistency Ratio Card */}
              <div className={`m2-cr-card ${ahpCalculation.isConsistent ? 'valid' : 'invalid'}`}>
                <div>
                  <h4 style={{ margin: 0, fontSize: '1rem' }}>
                    {ahpCalculation.isConsistent ? '✓ Consistency Ratio Optimal (CR <= 0.10)' : '⚠ High Inconsistency Warning (CR > 0.10)'}
                  </h4>
                  <p style={{ margin: '4px 0 0 0', fontSize: '0.8rem', opacity: 0.9 }}>
                    {ahpCalculation.isConsistent
                      ? `Your preference choices demonstrate strong mathematical consistency (CR = ${ahpCalculation.consistencyRatio}, λ_max = ${ahpCalculation.lambdaMax}).`
                      : `Your ratings contain conflicting comparisons (CR = ${ahpCalculation.consistencyRatio}). You can review your duels or proceed anyway.`}
                  </p>
                </div>
                {!ahpCalculation.isConsistent && (
                  <button
                    type="button"
                    className="m2-btn-back"
                    style={{ borderColor: '#ef4444', color: '#fca5a5' }}
                    onClick={startPairwiseDuels}
                  >
                    <FaRedo /> Re-run Duels
                  </button>
                )}
              </div>

              {/* Domain Priority Vector Breakdown */}
              <div className="m2-ahp-results">
                <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.1rem', color: '#fff' }}>
                  Calculated Interest Priority Vector (Weights)
                </h3>

                {ahpCalculation.domainAffinity.map((item, idx) => (
                  <div key={item.domain} className="m2-affinity-bar-row">
                    <div className="m2-affinity-label">
                      <span>
                        <strong style={{ color: 'var(--m2-cyan)', marginRight: '6px' }}>#{idx + 1}</strong>
                        {item.domain}
                      </span>
                      <span>{item.scorePercentage}% (w = {item.weight})</span>
                    </div>

                    <div className="m2-affinity-track">
                      <div
                        className="m2-affinity-fill"
                        style={{ width: `${item.scorePercentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <footer className="m2-nav-footer">
                <button
                  type="button"
                  className="m2-btn-back"
                  onClick={startPairwiseDuels}
                >
                  <FaRedo /> Modify Duels
                </button>

                <button
                  type="button"
                  className="m2-btn-next"
                  onClick={handleSubmitMission2}
                  disabled={submitting}
                >
                  {submitting ? 'SAVING PROFILE...' : 'COMPLETE MISSION 2'} <FaRocket />
                </button>
              </footer>
            </div>
          )}
        </section>
      </main>

      {/* ── Completion Modal ────────────────────────────────────────── */}
      {showCompleteModal && (
        <div className="m2-modal-overlay">
          <div className="m2-modal-card">
            <FaTrophy style={{ fontSize: '3.5rem', color: 'var(--m2-purple)', marginBottom: '1rem', filter: 'drop-shadow(0 0 15px var(--m2-purple))' }} />
            <h2 style={{ fontSize: '1.6rem', margin: '0 0 0.5rem 0', color: '#fff' }}>
              MISSION 2 ACCOMPLISHED!
            </h2>
            <p style={{ color: 'var(--m2-cyan)', fontWeight: 700, fontSize: '1.1rem', margin: '0 0 1.25rem 0' }}>
              + {earnedXp} XP EARNED
            </p>
            <p style={{ color: '#94a3b8', fontSize: '0.88rem', lineHeight: '1.6', marginBottom: '1.5rem' }}>
              Your Career Interest Profile & Priority Vector have been stored in MongoDB using the Analytic Hierarchy Process.
            </p>

            <button
              className="m2-btn-next"
              style={{ width: '100%', justifyContent: 'center' }}
              onClick={() => navigate('/career/mission-3')}
            >
              PROCEED TO MISSION 3 <FaArrowRight />
            </button>

          </div>
        </div>
      )}
    </div>
  );
};

export default Mission2CareerInterest;
