import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { getUserProfile, updateUserPreferences } from '../api/user.api';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import {
  FaUser,
  FaEnvelope,
  FaPhone,
  FaEdit,
  FaSave,
  FaTimes,
  FaTrophy,
  FaChartLine,
  FaRocket,
  FaBrain,
  FaWheelchair,
  FaToggleOn,
  FaToggleOff,
  FaCheckCircle,
  FaExclamationTriangle
} from 'react-icons/fa';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';
import './Profile.css';

const Profile = () => {
  const { user: authUser, logout, updateProfile } = useAuth();
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
  });

  const [preferences, setPreferences] = useState({
    highContrastMode: false,
    reducedMotion: false,
    voiceMode: false,
    gameMode: true
  });
  const [savingPrefs, setSavingPrefs] = useState(false);

  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    setLoading(true);
    try {
      const data = await getUserProfile();
      setProfile(data.user);
      setAnalytics(data.analytics);
      setFormData({
        name: data.user?.fullName || data.user?.name || '',
        phone: data.user?.phone || '',
      });
      if (data.user?.accessibilityPreferences) {
        setPreferences(data.user.accessibilityPreferences);
      }
    } catch (err) {
      console.error(err);
      setError("Failed to load profile data.");
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (name) => {
    return name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U';
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleEdit = () => setIsEditing(true);

  const handleCancel = () => {
    setIsEditing(false);
    setFormData({
      name: profile?.fullName || profile?.name || '',
      phone: profile?.phone || '',
    });
  };

  const handleSave = async () => {
    try {
      const updatedUser = { ...profile, fullName: formData.name, phone: formData.phone };
      setProfile(updatedUser);
      await updateProfile(updatedUser);
      setIsEditing(false);
    } catch (e) {
      alert("Failed to save changes.");
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleTogglePreference = async (key) => {
    const newPrefs = { ...preferences, [key]: !preferences[key] };
    setPreferences(newPrefs);
    setSavingPrefs(true);
    try {
      await updateUserPreferences(newPrefs);
    } catch (e) {
      console.error("Failed to update preferences");
      setPreferences(preferences);
    } finally {
      setSavingPrefs(false);
    }
  };

  const hasOnboarding = profile?.onboardingCompleted;
  const xpLevel = profile?.experienceLevel || 1;
  const department = profile?.department || profile?.domain || 'Undeclared';
  const year = profile?.year ? `• Year ${profile?.year}` : '';

  const getRadarData = () => {
    if (!analytics?.interestVector) return [];
    return Object.entries(analytics.interestVector).map(([key, value]) => ({
      subject: key,
      A: value,
      fullMark: 100,
    })).slice(0, 5);
  };

  if (loading) {
    return (
      <div className="dashboard-container">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} user={authUser} />
        <Header onMenuToggle={() => setSidebarOpen(!sidebarOpen)} onLogout={handleLogout} title="Profile" showSearch={false} />
        <main className="dashboard-main dashboard-loading">
          <div className="loading-pulse">Loading Intelligence Core...</div>
        </main>
      </div>
    );
  }

  return (
    <div className={`dashboard-container ${preferences.highContrastMode ? 'high-contrast' : ''}`}>
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} user={authUser} />

      <Header
        onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
        onLogout={handleLogout}
        title="Intelligence Profile"
        subtitle="Your adaptive academic identity"
        showSearch={false}
      />

      <main className="dashboard-main">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: preferences.reducedMotion ? 0 : 0.5 }}
          className="main-content profile-content"
        >
          {error && <div className="profile-error">{error}</div>}

          <div className="profile-dashboard-grid">

            {/* LEFT COLUMN */}
            <div className="profile-left-col">

              {/* SECTION 1: User Overview */}
              <div className="profile-glass-card group-hover-effect">
                <div className="card-gradient-top"></div>

                <div className="profile-header-flex">
                  <div className="profile-avatar-glow">
                    <span>{getInitials(profile?.fullName || profile?.name)}</span>
                  </div>
                  {!isEditing ? (
                    <button onClick={handleEdit} className="btn-icon-edit">
                      <FaEdit />
                    </button>
                  ) : (
                    <div className="btn-actions-flex">
                      <button onClick={handleSave} className="btn-icon-save"><FaSave /></button>
                      <button onClick={handleCancel} className="btn-icon-cancel"><FaTimes /></button>
                    </div>
                  )}
                </div>

                {!isEditing ? (
                  <div className="profile-info-block">
                    <h2 className="profile-title-name">{profile?.fullName || profile?.name}</h2>
                    <p className="profile-subtitle-dept">{department} {year}</p>

                    <div className="xp-badge">
                      <FaTrophy className="xp-icon" />
                      <div className="xp-details">
                        <div className="xp-label">XP Level</div>
                        <div className="xp-value">{xpLevel}</div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="profile-edit-block">
                    <input
                      type="text" name="name" value={formData.name} onChange={handleChange}
                      className="profile-input-field" placeholder="Full Name"
                    />
                  </div>
                )}
              </div>

              {/* SECTION 2: Contact Information */}
              <div className="profile-glass-card">
                <h3 className="card-heading">
                  <span className="dot-indicator blue"></span> Contact Link
                </h3>

                <div className="contact-list">
                  <div className="contact-item">
                    <div className="contact-icon bg-slate"><FaEnvelope /></div>
                    <div className="contact-info">
                      <div className="contact-label">Secure Email</div>
                      <div className="contact-value">{profile?.email}</div>
                    </div>
                  </div>

                  <div className="contact-item">
                    <div className="contact-icon bg-slate"><FaPhone /></div>
                    <div className="contact-info">
                      <div className="contact-label">Comms Node</div>
                      {!isEditing ? (
                        <div className="contact-value">{profile?.phone || 'Not configured'}</div>
                      ) : (
                        <input
                          type="text" name="phone" value={formData.phone} onChange={handleChange}
                          className="profile-input-field sm" placeholder="Phone target"
                        />
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION 5: Accessibility */}
              <div className="profile-glass-card">
                <h3 className="card-heading">
                  <FaWheelchair className="purple-text icon-mr" /> Interface Tuning
                </h3>
                <div className="preferences-list">
                  {[
                    { key: 'highContrastMode', label: 'High Contrast', desc: 'Maximize visual distinction' },
                    { key: 'reducedMotion', label: 'Reduced Motion', desc: 'Disable heavy animations' },
                    { key: 'voiceMode', label: 'Voice Feedback', desc: 'Enable vocal system responses' },
                    { key: 'gameMode', label: 'Game Overlay', desc: 'XP popups & gamified aesthetics' },
                  ].map((pref) => (
                    <div key={pref.key} className="preference-item">
                      <div className="pref-text-box">
                        <div className="pref-label">{pref.label}</div>
                        <div className="pref-desc">{pref.desc}</div>
                      </div>
                      <button
                        onClick={() => handleTogglePreference(pref.key)}
                        disabled={savingPrefs}
                        className={`pref-toggle ${preferences[pref.key] ? 'active' : ''}`}
                      >
                        {preferences[pref.key] ? <FaToggleOn /> : <FaToggleOff />}
                      </button>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* RIGHT COLUMN */}
            <div className="profile-right-col">

              {/* SECTION 3: AI Analytics Preview */}
              <div className="profile-glass-card flex-grow ai-analytics-panel">
                <FaBrain className="bg-icon-watermark" />

                <h3 className="card-heading lg-heading">
                  <div className="icon-box-blue"><FaBrain /></div>
                  Core Intelligence Profile
                </h3>

                {!hasOnboarding ? (
                  <div className="ai-launch-box">
                    <div className="pulse-overlay"></div>
                    <FaRocket className="launch-icon" />
                    <h4 className="launch-title">Launch Your Journey</h4>
                    <p className="launch-desc">
                      Initialize your neural link. Complete the adaptive onboarding assessment so the AI can build your cognitive profile.
                    </p>
                    <button
                      onClick={() => navigate('/onboarding')}
                      className="btn-launch"
                    >
                      Initialize Link
                    </button>
                  </div>
                ) : analytics ? (
                  <div className="analytics-grid">
                    {/* Metrics Left */}
                    <div className="metrics-column">
                      <div className="metric-box">
                        <div className="metric-label">Cognitive Archetype</div>
                        <div className="metric-value shadow-cyan">{analytics.cognitiveProfile || 'Undefined Hybrid'}</div>
                      </div>

                      <div className="metric-box">
                        <div className="metric-flex-header">
                          <div className="metric-label">Passion Resonance</div>
                          <div className="metric-percent">{Math.round(analytics.passionScore || 0)}%</div>
                        </div>
                        <div className="progress-track">
                          <motion.div
                            className="progress-fill"
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.min(analytics.passionScore || 0, 100)}%` }}
                            transition={{ duration: 1, delay: 0.2 }}
                          />
                        </div>
                      </div>

                      <div className="metric-box borderless">
                        <div className="metric-label mb-sm">Optimal Trajectories</div>
                        <div className="tag-flex">
                          {(analytics.recommendedTracks || []).slice(0, 3).map((track, i) => (
                            <span key={i} className="trajectory-tag">{track}</span>
                          ))}
                          {!(analytics.recommendedTracks?.length) && <span className="text-muted italic">Awaiting more data...</span>}
                        </div>
                      </div>
                    </div>

                    {/* Radar Right */}
                    <div className="radar-box">
                      <div className="radar-label">Vector Topology</div>
                      {getRadarData().length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                          <RadarChart cx="50%" cy="50%" outerRadius="70%" data={getRadarData()}>
                            <PolarGrid stroke="var(--game-border-color)" />
                            <PolarAngleAxis dataKey="subject" tick={{ fill: 'var(--game-text-muted)', fontSize: 10 }} />
                            <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                            <Radar name="Interest" dataKey="A" stroke="var(--game-neon-blue)" fill="var(--game-neon-blue)" fillOpacity={0.4} />
                          </RadarChart>
                        </ResponsiveContainer>
                      ) : (
                        <div className="empty-radar">
                          <FaChartLine className="empty-radar-icon" />
                          <p>Insufficient vector data</p>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="processing-box">
                    Processing analytics core. Pending backend sync.
                  </div>
                )}
              </div>

              {/* SECTION 4: Performance Section */}
              <div className="profile-glass-card">
                <h3 className="card-heading lg-heading">
                  <div className="icon-box-green"><FaChartLine /></div>
                  Performance Matrix
                </h3>

                {!(profile?.completedAssessments > 0) ? (
                  <div className="empty-performance-box">
                    <FaChartLine className="empty-icon text-slate-600 mb-4" />
                    <h4>No Performance Metadata</h4>
                    <p>Your tactical academic stats will synchronize here after your first completed assessment loop.</p>
                  </div>
                ) : (
                  <div className="performance-grid">
                    <div className="perf-stat-box">
                      <FaCheckCircle className="perf-icon border-green" />
                      <div className="perf-val">{profile.completedAssessments}</div>
                      <div className="perf-lbl">Tests Conquered</div>
                    </div>
                    <div className="perf-stat-box">
                      <FaChartLine className="perf-icon border-blue" />
                      <div className="perf-val">{profile.gpa || 'N/A'}</div>
                      <div className="perf-lbl">Avg Performance</div>
                    </div>
                    <div className="perf-stat-box">
                      <FaTrophy className="perf-icon border-yellow" />
                      <div className="perf-val text-sm truncate">
                        {(analytics?.recommendedTracks && analytics.recommendedTracks[0]) || 'Unknown'}
                      </div>
                      <div className="perf-lbl mt-fix">Apex Domain</div>
                    </div>
                    <div className="perf-stat-box orange-box">
                      <FaExclamationTriangle className="perf-icon border-orange" />
                      <div className="perf-val text-xs text-slate-300">Algorithmic Design</div>
                      <div className="perf-lbl mt-fix">Growth Vector</div>
                    </div>
                  </div>
                )}
              </div>

            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default Profile;