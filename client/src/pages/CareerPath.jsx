// client/src/pages/CareerPath.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { getCareerProfile, predictCareer } from '../api/career.api';
import {
  FaBriefcase, FaRocket, FaCheckCircle,
  FaTimesCircle, FaChartBar, FaMapMarkerAlt,
  FaSync, FaGraduationCap, FaMedal, FaCode,
  FaDatabase, FaCloud, FaCog
} from 'react-icons/fa';
import { GiArtificialIntelligence } from 'react-icons/gi';
import './CareerPath.css';

// Map roles to colors and icons for visual variety
const ROLE_THEMES = [
  { color: '#4facfe', icon: <FaCode /> },
  { color: '#a855f7', icon: <FaDatabase /> },
  { color: '#00ffcc', icon: <GiArtificialIntelligence /> },
  { color: '#f59e0b', icon: <FaCloud /> },
];

const CareerPath = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [predicting, setPredicting] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);
  const [error, setError] = useState('');

  const handleLogout = () => { logout(); navigate('/login'); };

  // Load existing profile on mount
  useEffect(() => {
    (async () => {
      try {
        const res = await getCareerProfile();
        if (res.success && res.data) {
          setProfile(res.data);
          setSelectedRole(0);
        }
      } catch {
        setError('Could not load career profile.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handlePredict = async () => {
    setPredicting(true);
    setError('');
    try {
      const res = await predictCareer();
      if (res.success) {
        setProfile(res.data);
        setSelectedRole(0);
      }
    } catch (e) {
      const msg = e?.response?.data?.message || e?.message || 'Career prediction failed. Please try again.';
      setError(msg);
    } finally {
      setPredicting(false);
    }
  };

  const activeRole = profile?.targetRoles?.[selectedRole];

  const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '';

  return (
    <div className="career-container">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} user={user} />
      <Header
        onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
        onLogout={handleLogout}
        title="Career Path Predictor"
        subtitle="AI-powered career intelligence based on your academic profile"
      />

      <main className="career-main">

        {/* ── Hero Banner ─────────────────────────────────────────── */}
        <div className="career-hero">
          <div className="career-hero-label">AI Career Intelligence</div>
          <h1>Your Career Map, Powered by AI</h1>
          <p className="career-hero-sub">
            Based on your marksheet analysis and expert domain, our AI predicts the top career roles that match your current academic strengths and shows you exactly what skills to build next.
          </p>

          <div className="career-hero-actions">
            <button
              className="btn-predict"
              onClick={handlePredict}
              disabled={predicting}
              id="btn-run-career-prediction"
            >
              {predicting ? (
                <><div className="career-loading-ring" style={{ width: 18, height: 18, borderWidth: 2 }} /> Analysing Profile...</>
              ) : (
                <><FaRocket /> {profile ? 'Re-Predict My Career' : 'Run AI Career Prediction'}</>
              )}
            </button>

            {profile && (
              <div className="readiness-pill">
                <FaMedal style={{ color: '#f59e0b' }} />
                <span style={{ fontSize: 13, color: '#94a3b8' }}>Placement Readiness</span>
                <span className="readiness-score">{profile.overallReadiness}%</span>
              </div>
            )}

            {profile && (
              <span className="last-updated">
                <FaSync style={{ fontSize: 10 }} />
                Updated {formatDate(profile.lastPredictedAt)}
              </span>
            )}
          </div>
        </div>

        {/* ── Error Banner ────────────────────────────────────────── */}
        {error && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: 12,
            padding: '14px 20px',
            marginBottom: 24,
            color: '#f87171',
            fontSize: 14
          }}>
            ⚠️ {error}
          </div>
        )}

        {/* ── Loading State ───────────────────────────────────────── */}
        {loading ? (
          <div className="career-loading">
            <div className="career-loading-ring" />
            <div className="career-loading-text">Loading Career Data...</div>
          </div>
        ) : !profile ? (
          /* ── Empty State ──────────────────────────────────────── */
          <div className="career-empty">
            <div className="career-empty-icon">🗺️</div>
            <h3>No Career Map Yet</h3>
            <p>
              Click <strong>"Run AI Career Prediction"</strong> above to generate your personalised career map.
              Our AI will analyse your academic profile and suggest the best career paths for you.
            </p>
          </div>
        ) : (
          <>
            {/* ── Current Skills Strip ──────────────────────────── */}
            {profile.currentSkills?.length > 0 && (
              <div className="skills-strip">
                <span className="skills-strip-label">Your Skills</span>
                {profile.currentSkills.map((skill, i) => (
                  <span key={i} className="skill-tag">{skill}</span>
                ))}
              </div>
            )}

            {/* ── Role Cards ────────────────────────────────────── */}
            <div className="section-heading">
              <FaBriefcase /> Top Career Matches
            </div>

            <div className="roles-grid">
              {profile.targetRoles?.map((role, i) => {
                const theme = ROLE_THEMES[i % ROLE_THEMES.length];
                return (
                  <div
                    key={i}
                    className={`role-card ${selectedRole === i ? 'selected' : ''}`}
                    style={{ '--card-color': theme.color }}
                    onClick={() => setSelectedRole(i)}
                    id={`role-card-${i}`}
                  >
                    <div className="role-header">
                      <div>
                        <div style={{ fontSize: 22, color: theme.color, marginBottom: 8 }}>
                          {theme.icon}
                        </div>
                        <div className="role-name">{role.role}</div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div className="match-badge">{role.matchScore}%</div>
                        <span className="match-label">Match</span>
                      </div>
                    </div>

                    <p className="role-description">{role.description}</p>

                    <div className="score-bar-container">
                      <div className="score-bar-label">
                        <span>Profile Match</span>
                        <span style={{ color: theme.color }}>{role.matchScore}%</span>
                      </div>
                      <div className="score-bar">
                        <div className="score-bar-fill" style={{ width: `${role.matchScore}%` }} />
                      </div>
                    </div>

                    <div className="role-meta">
                      {role.avgSalary && (
                        <span className="meta-tag meta-salary">💰 {role.avgSalary}</span>
                      )}
                      {role.difficulty && (
                        <span className="meta-tag meta-difficulty">{role.difficulty}</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* ── Skill Gap + Roadmap Panel ─────────────────────── */}
            {activeRole && (
              <div className="gap-panel" id="skill-gap-panel">
                <div className="gap-panel-header">
                  <div>
                    <div className="gap-panel-title">
                      📊 Skill Gap Analysis
                    </div>
                    <div className="gap-panel-role">
                      Selected: {activeRole.role}
                    </div>
                  </div>
                </div>

                {/* Skills Comparison */}
                <div className="skills-comparison">
                  <div>
                    <div className="skill-col-title skill-col-have">
                      <FaCheckCircle /> Skills You Have
                    </div>
                    <div className="skill-list">
                      {(activeRole.requiredSkills || [])
                        .filter(s => !activeRole.skillGaps?.includes(s))
                        .map((skill, i) => (
                          <div key={i} className="skill-item have">
                            <span className="skill-dot have" />
                            {skill}
                          </div>
                        ))}
                      {profile.currentSkills?.slice(0, 3).map((skill, i) => (
                        <div key={`c-${i}`} className="skill-item have">
                          <span className="skill-dot have" />
                          {skill}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div className="skill-col-title skill-col-need">
                      <FaTimesCircle /> Skills to Build
                    </div>
                    <div className="skill-list">
                      {(activeRole.skillGaps || []).map((skill, i) => (
                        <div key={i} className="skill-item gap">
                          <span className="skill-dot gap" />
                          {skill}
                        </div>
                      ))}
                    </div>
                    {(!activeRole.skillGaps || activeRole.skillGaps.length === 0) && (
                      <div style={{ color: '#00ffcc', fontSize: 13, marginTop: 8 }}>
                        🎉 You already have all required skills for this role!
                      </div>
                    )}
                  </div>
                </div>

                {/* Learning Roadmap */}
                {activeRole.roadmap?.length > 0 && (
                  <>
                    <div className="roadmap-title">
                      <FaMapMarkerAlt style={{ marginRight: 8, color: '#4facfe' }} />
                      Learning Roadmap
                    </div>
                    <div className="roadmap-list">
                      {activeRole.roadmap.map((step, i) => (
                        <div key={i} className="roadmap-step">
                          <div className="roadmap-node">
                            <div className="roadmap-dot">{i + 1}</div>
                            {i < activeRole.roadmap.length - 1 && (
                              <div className="roadmap-line" />
                            )}
                          </div>
                          <div className="roadmap-content">
                            <div className="roadmap-text">{step}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default CareerPath;
