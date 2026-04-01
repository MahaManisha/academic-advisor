import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { getUserProfile, updateUserPreferences } from '../api/user.api';
import {
  getMarksheets,
  addMarksheet,
  deleteMarksheet,
  analyzeMarksheet,
  analyzeSubject,
} from '../api/marksheet.api';
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
  FaExclamationTriangle,
  FaFileAlt,
  FaPlus,
  FaTrash,
  FaRobot,
  FaLightbulb,
  FaSpinner,
  FaChevronDown,
  FaChevronUp,
  FaStar,
  FaGraduationCap,
} from 'react-icons/fa';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';
import './Profile.css';

// ─── Helpers ──────────────────────────────────────────────────────────────────
const GRADE_COLORS = {
  'O': '#22d3ee',   // Outstanding
  'A+': '#4ade80',
  'A': '#86efac',
  'B+': '#facc15',
  'B': '#fbbf24',
  'C': '#fb923c',
  'F': '#f87171',
};

const gradeColor = (grade) => GRADE_COLORS[grade] || '#94a3b8';

const emptySubject = () => ({
  name: '', code: '', credits: '', marksObtained: '', maxMarks: 100, grade: '', gradePoints: '', status: 'Pass',
});


// ─── Marksheet Add Form ───────────────────────────────────────────────────────
const MarksheetForm = ({ onSave, onCancel }) => {
  const [meta, setMeta] = useState({ semester: '', year: '', sgpa: '', cgpa: '', totalCredits: '', creditsEarned: '' });
  const [subjects, setSubjects] = useState([emptySubject()]);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');

  const setSubjectField = (idx, field, value) => {
    setSubjects(prev => prev.map((s, i) => i === idx ? { ...s, [field]: value } : s));
  };

  const addRow = () => setSubjects(prev => [...prev, emptySubject()]);
  const removeRow = (idx) => setSubjects(prev => prev.filter((_, i) => i !== idx));

  const handleSave = async () => {
    if (!meta.semester) { setErr('Semester is required.'); return; }
    if (subjects.some(s => !s.name)) { setErr('All subjects must have a name.'); return; }
    setSaving(true);
    setErr('');
    try {
      await onSave({ ...meta, subjects });
    } catch (e) {
      setErr(e?.message || 'Failed to save marksheet.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="ms-form-overlay">
      <motion.div
        className="ms-form-modal"
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.25 }}
      >
        <div className="ms-form-header">
          <span className="ms-form-title"><FaGraduationCap /> Add Marksheet</span>
          <button onClick={onCancel} className="ms-form-close"><FaTimes /></button>
        </div>

        {/* Meta Row */}
        <div className="ms-meta-grid">
          <div className="ms-meta-field">
            <label>Semester *</label>
            <input placeholder="e.g. Semester 3" value={meta.semester} onChange={e => setMeta({ ...meta, semester: e.target.value })} />
          </div>
          <div className="ms-meta-field">
            <label>Academic Year</label>
            <input placeholder="e.g. 2024-25" value={meta.year} onChange={e => setMeta({ ...meta, year: e.target.value })} />
          </div>
          <div className="ms-meta-field">
            <label>SGPA</label>
            <input type="number" step="0.01" placeholder="8.5" value={meta.sgpa} onChange={e => setMeta({ ...meta, sgpa: e.target.value })} />
          </div>
          <div className="ms-meta-field">
            <label>CGPA</label>
            <input type="number" step="0.01" placeholder="8.2" value={meta.cgpa} onChange={e => setMeta({ ...meta, cgpa: e.target.value })} />
          </div>
          <div className="ms-meta-field">
            <label>Total Credits</label>
            <input type="number" placeholder="24" value={meta.totalCredits} onChange={e => setMeta({ ...meta, totalCredits: e.target.value })} />
          </div>
          <div className="ms-meta-field">
            <label>Credits Earned</label>
            <input type="number" placeholder="24" value={meta.creditsEarned} onChange={e => setMeta({ ...meta, creditsEarned: e.target.value })} />
          </div>
        </div>

        {/* Subject Table */}
        <div className="ms-subject-table-wrap">
          <div className="ms-subject-table-header">
            <span>Subject Name</span>
            <span>Code</span>
            <span>Credits</span>
            <span>Marks</span>
            <span>Max</span>
            <span>Grade</span>
            <span>Pts</span>
            <span>Status</span>
            <span></span>
          </div>
          {subjects.map((sub, idx) => (
            <div key={idx} className="ms-subject-row">
              <input className="ms-cell lg" placeholder="Subject Name *" value={sub.name} onChange={e => setSubjectField(idx, 'name', e.target.value)} />
              <input className="ms-cell sm" placeholder="Code" value={sub.code} onChange={e => setSubjectField(idx, 'code', e.target.value)} />
              <input className="ms-cell xs" type="number" placeholder="4" value={sub.credits} onChange={e => setSubjectField(idx, 'credits', e.target.value)} />
              <input className="ms-cell xs" type="number" placeholder="75" value={sub.marksObtained} onChange={e => setSubjectField(idx, 'marksObtained', e.target.value)} />
              <input className="ms-cell xs" type="number" placeholder="100" value={sub.maxMarks} onChange={e => setSubjectField(idx, 'maxMarks', e.target.value)} />
              <select className="ms-cell sm" value={sub.grade} onChange={e => setSubjectField(idx, 'grade', e.target.value)}>
                <option value="">--</option>
                {['O','A+','A','B+','B','C','F'].map(g => <option key={g} value={g}>{g}</option>)}
              </select>
              <input className="ms-cell xs" type="number" step="0.1" placeholder="9.0" value={sub.gradePoints} onChange={e => setSubjectField(idx, 'gradePoints', e.target.value)} />
              <select className="ms-cell sm" value={sub.status} onChange={e => setSubjectField(idx, 'status', e.target.value)}>
                <option value="Pass">Pass</option>
                <option value="Fail">Fail</option>
                <option value="Absent">Absent</option>
              </select>
              <button className="ms-del-row" onClick={() => removeRow(idx)} disabled={subjects.length === 1}><FaTrash /></button>
            </div>
          ))}
          <button className="ms-add-row" onClick={addRow}><FaPlus /> Add Subject</button>
        </div>

        {err && <div className="ms-form-err">{err}</div>}

        <div className="ms-form-actions">
          <button className="ms-btn-cancel" onClick={onCancel}>Cancel</button>
          <button className="ms-btn-save" onClick={handleSave} disabled={saving}>
            {saving ? <><FaSpinner className="spin" /> Saving...</> : <><FaSave /> Save Marksheet</>}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

// ─── Single Subject AI Advice Card ───────────────────────────────────────────
const SubjectAdviceCard = ({ subject, idx, marksheetId }) => {
  const [advice, setAdvice] = useState(null);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const fetchAdvice = async () => {
    if (advice) { setOpen(o => !o); return; }
    setLoading(true);
    try {
      const data = await analyzeSubject(marksheetId, idx);
      setAdvice(data.advice);
      setOpen(true);
    } catch (e) {
      setAdvice('Could not fetch advice. Please try again.');
      setOpen(true);
    } finally {
      setLoading(false);
    }
  };

  const pct = subject.maxMarks ? Math.round((subject.marksObtained / subject.maxMarks) * 100) : 0;
  const gc = gradeColor(subject.grade);

  return (
    <div className={`ms-subject-card ${subject.status === 'Fail' ? 'fail-border' : ''}`}>
      <div className="ms-sc-top">
        <div className="ms-sc-left">
          <div className="ms-sc-name">{subject.name}</div>
          {subject.code && <div className="ms-sc-code">{subject.code}</div>}
        </div>
        <div className="ms-sc-right">
          <span className="ms-sc-grade" style={{ color: gc, borderColor: gc + '66' }}>{subject.grade || '—'}</span>
          <span className="ms-sc-credits"><FaStar /> {subject.credits || '?'} cr</span>
          <span className={`ms-sc-status ${subject.status === 'Fail' ? 'fail' : 'pass'}`}>{subject.status}</span>
        </div>
      </div>

      <div className="ms-sc-bar-wrap">
        <div className="ms-sc-bar-track">
          <motion.div
            className="ms-sc-bar-fill"
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(pct, 100)}%` }}
            transition={{ duration: 0.8, delay: idx * 0.05 }}
            style={{ background: gc }}
          />
        </div>
        <span className="ms-sc-pct">{pct}%  ({subject.marksObtained}/{subject.maxMarks})</span>
      </div>

      <button className="ms-sc-advice-btn" onClick={fetchAdvice} disabled={loading}>
        {loading
          ? <><FaSpinner className="spin" /> Analysing...</>
          : <><FaLightbulb /> AI Advice for {subject.credits || '?'} Credits {open ? <FaChevronUp /> : <FaChevronDown />}</>}
      </button>

      <AnimatePresence>
        {open && advice && (
          <motion.div
            className="ms-sc-advice-box"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="ms-sc-advice-text">{advice}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ─── Single Marksheet Card ────────────────────────────────────────────────────
const MarksheetCard = ({ sheet, onDelete }) => {
  const [expanded, setExpanded] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState(sheet.aiAnalysis || null);
  const [analysing, setAnalysing] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleAnalyse = async () => {
    setAnalysing(true);
    try {
      const data = await analyzeMarksheet(sheet._id);
      setAiAnalysis(data.analysis);
    } catch (e) {
      setAiAnalysis('Analysis failed. Please try again later.');
    } finally {
      setAnalysing(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(`Delete ${sheet.semester} marksheet?`)) return;
    setDeleting(true);
    try { await onDelete(sheet._id); } finally { setDeleting(false); }
  };

  const passCount = sheet.subjects?.filter(s => s.status !== 'Fail').length || 0;
  const totalSubs = sheet.subjects?.length || 0;

  return (
    <div className="ms-card">
      {/* Header Row */}
      <div className="ms-card-header" onClick={() => setExpanded(e => !e)}>
        <div className="ms-card-title-area">
          <FaFileAlt className="ms-card-icon" />
          <div>
            <div className="ms-card-semester">{sheet.semester}</div>
            <div className="ms-card-year">{sheet.year || 'Academic Year'}</div>
          </div>
        </div>
        <div className="ms-card-meta-row">
          {sheet.sgpa && <span className="ms-badge blue">SGPA {Number(sheet.sgpa).toFixed(2)}</span>}
          {sheet.cgpa && <span className="ms-badge purple">CGPA {Number(sheet.cgpa).toFixed(2)}</span>}
          {sheet.creditsEarned && <span className="ms-badge green">{sheet.creditsEarned} Credits</span>}
          <span className="ms-badge gray">{passCount}/{totalSubs} Passed</span>
        </div>
        <div className="ms-card-actions">
          <button className="ms-action-del" onClick={e => { e.stopPropagation(); handleDelete(); }} disabled={deleting}>
            {deleting ? <FaSpinner className="spin" /> : <FaTrash />}
          </button>
          <span className="ms-expand-arrow">{expanded ? <FaChevronUp /> : <FaChevronDown />}</span>
        </div>
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div
            className="ms-card-body"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35 }}
          >
            {/* Subject Cards */}
            <div className="ms-subjects-grid">
              {sheet.subjects?.map((sub, idx) => (
                <SubjectAdviceCard key={idx} subject={sub} idx={idx} marksheetId={sheet._id} />
              ))}
            </div>

            {/* Full AI Analysis */}
            <div className="ms-ai-analyse-section">
              <button className="ms-btn-analyse" onClick={handleAnalyse} disabled={analysing}>
                {analysing
                  ? <><FaSpinner className="spin" /> Analysing Entire Sheet...</>
                  : <><FaRobot /> {aiAnalysis ? 'Re-Analyse with AI' : 'Analyse Entire Marksheet with AI'}</>}
              </button>

              {aiAnalysis && (
                <motion.div
                  className="ms-ai-result-box"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                >
                  <div className="ms-ai-result-header">
                    <FaBrain className="ms-ai-icon" /> AI Academic Analysis
                  </div>
                  <pre className="ms-ai-result-text">{aiAnalysis}</pre>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};


// ─── Main Profile Page ────────────────────────────────────────────────────────
const Profile = () => {
  const { user: authUser, logout, updateProfile } = useAuth();
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ name: '', phone: '' });

  const [preferences, setPreferences] = useState({
    highContrastMode: false, reducedMotion: false, voiceMode: false, gameMode: true
  });
  const [savingPrefs, setSavingPrefs] = useState(false);

  // Marksheet state
  const [marksheets, setMarksheets] = useState([]);
  const [msLoading, setMsLoading] = useState(true);
  const [showMsForm, setShowMsForm] = useState(false);
  const [activeTab, setActiveTab] = useState('profile'); // 'profile' | 'marksheets'

  useEffect(() => { fetchProfileData(); fetchMarksheets(); }, []);

  const fetchProfileData = async () => {
    setLoading(true);
    try {
      const data = await getUserProfile();
      setProfile(data.user);
      setAnalytics(data.analytics);
      setFormData({ name: data.user?.fullName || data.user?.name || '', phone: data.user?.phone || '' });
      if (data.user?.accessibilityPreferences) setPreferences(data.user.accessibilityPreferences);
    } catch (err) {
      setError("Failed to load profile data.");
    } finally {
      setLoading(false);
    }
  };

  const fetchMarksheets = async () => {
    setMsLoading(true);
    try {
      const data = await getMarksheets();
      setMarksheets(data.marksheets || []);
    } catch (e) {
      console.error('Failed to fetch marksheets:', e);
    } finally {
      setMsLoading(false);
    }
  };

  const handleAddMarksheet = async (sheetData) => {
    const data = await addMarksheet(sheetData);
    setMarksheets(prev => [data.marksheet, ...prev]);
    setShowMsForm(false);
  };

  const handleDeleteMarksheet = async (id) => {
    await deleteMarksheet(id);
    setMarksheets(prev => prev.filter(m => m._id !== id));
  };

  const getInitials = (name) => name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U';
  const handleLogout = () => { logout(); navigate('/login'); };
  const handleEdit = () => setIsEditing(true);
  const handleCancel = () => {
    setIsEditing(false);
    setFormData({ name: profile?.fullName || profile?.name || '', phone: profile?.phone || '' });
  };
  const handleSave = async () => {
    try {
      const updatedUser = { ...profile, fullName: formData.name, phone: formData.phone };
      setProfile(updatedUser);
      await updateProfile(updatedUser);
      setIsEditing(false);
    } catch (e) { alert("Failed to save changes."); }
  };
  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
  const handleTogglePreference = async (key) => {
    const newPrefs = { ...preferences, [key]: !preferences[key] };
    setPreferences(newPrefs);
    setSavingPrefs(true);
    try { await updateUserPreferences(newPrefs); }
    catch (e) { setPreferences(preferences); }
    finally { setSavingPrefs(false); }
  };

  const hasOnboarding = profile?.onboardingCompleted;
  const xpLevel = profile?.experienceLevel || 1;
  const department = profile?.department || profile?.domain || 'Undeclared';
  const year = profile?.year ? `• Year ${profile?.year}` : '';

  const getRadarData = () => {
    if (!analytics?.interestVector) return [];
    return Object.entries(analytics.interestVector).map(([key, value]) => ({
      subject: key, A: value, fullMark: 100,
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

          {/* Tab Navigation */}
          <div className="profile-tab-nav">
            <button
              className={`profile-tab-btn ${activeTab === 'profile' ? 'active' : ''}`}
              onClick={() => setActiveTab('profile')}
            >
              <FaUser /> My Profile
            </button>
            <button
              className={`profile-tab-btn ${activeTab === 'marksheets' ? 'active' : ''}`}
              onClick={() => setActiveTab('marksheets')}
            >
              <FaFileAlt /> Marksheet Hub
              {marksheets.length > 0 && <span className="tab-badge">{marksheets.length}</span>}
            </button>
          </div>

          {/* ── PROFILE TAB ─────────────────────────────────────────────── */}
          {activeTab === 'profile' && (
            <div className="profile-dashboard-grid">

              {/* LEFT COLUMN */}
              <div className="profile-left-col">

                {/* User Overview */}
                <div className="profile-glass-card group-hover-effect">
                  <div className="card-gradient-top"></div>
                  <div className="profile-header-flex">
                    <div className="profile-avatar-glow">
                      <span>{getInitials(profile?.fullName || profile?.name)}</span>
                    </div>
                    {!isEditing ? (
                      <button onClick={handleEdit} className="btn-icon-edit"><FaEdit /></button>
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
                      <input type="text" name="name" value={formData.name} onChange={handleChange} className="profile-input-field" placeholder="Full Name" />
                    </div>
                  )}
                </div>

                {/* Contact Information */}
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
                          <input type="text" name="phone" value={formData.phone} onChange={handleChange} className="profile-input-field sm" placeholder="Phone target" />
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Accessibility */}
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

                {/* AI Analytics Preview */}
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
                      <p className="launch-desc">Initialize your neural link. Complete the adaptive onboarding assessment so the AI can build your cognitive profile.</p>
                      <button onClick={() => navigate('/onboarding')} className="btn-launch">Initialize Link</button>
                    </div>
                  ) : analytics ? (
                    <div className="analytics-grid">
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
                            <motion.div className="progress-fill" initial={{ width: 0 }} animate={{ width: `${Math.min(analytics.passionScore || 0, 100)}%` }} transition={{ duration: 1, delay: 0.2 }} />
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
                    <div className="processing-box">Processing analytics core. Pending backend sync.</div>
                  )}
                </div>

                {/* Performance Matrix */}
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
          )}

          {/* ── MARKSHEET HUB TAB ─────────────────────────────────────── */}
          {activeTab === 'marksheets' && (
            <motion.div
              className="ms-hub-container"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              {/* Hub Header */}
              <div className="ms-hub-header">
                <div className="ms-hub-title-area">
                  <div className="ms-hub-icon-wrap"><FaFileAlt /></div>
                  <div>
                    <h2 className="ms-hub-title">Marksheet Hub</h2>
                    <p className="ms-hub-subtitle">Upload your grade sheets and get AI-powered academic insights per subject</p>
                  </div>
                </div>
                <button className="ms-hub-add-btn" onClick={() => setShowMsForm(true)}>
                  <FaPlus /> Add Marksheet
                </button>
              </div>

              {/* Summary Stats */}
              {marksheets.length > 0 && (
                <div className="ms-summary-row">
                  <div className="ms-summary-card">
                    <div className="ms-sum-val">{marksheets.length}</div>
                    <div className="ms-sum-lbl">Semesters</div>
                  </div>
                  <div className="ms-summary-card">
                    <div className="ms-sum-val">{marksheets.reduce((t, m) => t + (Number(m.creditsEarned) || 0), 0)}</div>
                    <div className="ms-sum-lbl">Total Credits Earned</div>
                  </div>
                  <div className="ms-summary-card">
                    <div className="ms-sum-val">{marksheets.reduce((t, m) => t + (m.subjects?.length || 0), 0)}</div>
                    <div className="ms-sum-lbl">Total Subjects</div>
                  </div>
                  <div className="ms-summary-card">
                    <div className="ms-sum-val">
                      {marksheets.length > 0
                        ? (marksheets.reduce((t, m) => t + (Number(m.cgpa) || 0), 0) / marksheets.length).toFixed(2)
                        : 'N/A'}
                    </div>
                    <div className="ms-sum-lbl">Avg CGPA</div>
                  </div>
                </div>
              )}

              {/* Marksheet List */}
              {msLoading ? (
                <div className="ms-loading"><FaSpinner className="spin" /> Loading marksheets...</div>
              ) : marksheets.length === 0 ? (
                <div className="ms-empty-state">
                  <FaGraduationCap className="ms-empty-icon" />
                  <h3>No Marksheets Yet</h3>
                  <p>Add your first semester grade sheet and let AI analyse your academic performance, highlight weak areas, and suggest improvements based on your credits.</p>
                  <button className="ms-hub-add-btn" onClick={() => setShowMsForm(true)}><FaPlus /> Add Your First Marksheet</button>
                </div>
              ) : (
                <div className="ms-list">
                  {marksheets.map((sheet) => (
                    <MarksheetCard key={sheet._id} sheet={sheet} onDelete={handleDeleteMarksheet} />
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </motion.div>
      </main>

      {/* Add Marksheet Form Modal */}
      <AnimatePresence>
        {showMsForm && (
          <MarksheetForm onSave={handleAddMarksheet} onCancel={() => setShowMsForm(false)} />
        )}
      </AnimatePresence>
    </div>
  );
};

export default Profile;