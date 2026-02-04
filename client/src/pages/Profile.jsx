import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import {
  FaUser,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
  FaEdit,
  FaSave,
  FaTimes,
  FaGraduationCap,
  FaCalendar,
  FaIdCard,
  FaTrophy,
  FaChartLine,
  FaLock,
  FaRocket,
  FaLightbulb,
  FaBrain
} from 'react-icons/fa';
import './Profile.css';

const Profile = () => {
  const { user, logout, updateProfile } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Form state for editable fields
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    bio: user?.bio || '',
    // Address could be expanded if needed
  });

  const getInitials = (name) => {
    return name
      ?.split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2) || 'U';
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setFormData({
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      bio: user?.bio || '',
    });
  };

  const handleSave = async () => {
    try {
      // Optimistic UI update - usually we'd await API
      // For now, assuming updateProfile syncs context
      await updateProfile({ ...user, ...formData });
      setIsEditing(false);
    } catch (e) {
      console.error("Failed to save profile", e);
      alert("Failed to save changes.");
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // --- DERIVED STATES ---
  const hasOnboarding = user?.onboardingCompleted;
  const hasPerformance = user?.completedAssessments > 0 || user?.gpa; // Check for ANY performance signal
  const canUnlockAI = hasOnboarding && hasPerformance;

  return (
    <div className="dashboard-container">
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        user={user}
      />

      <Header
        onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
        onLogout={handleLogout}
        title="My Profile"
        subtitle="Manage your account information"
        showSearch={false}
      />

      <main className="dashboard-main">
        <div className="main-content profile-content">
          <div className="profile-grid">

            {/* LEFT COLUMN: Main Info */}
            <div className="profile-card profile-main">
              <div className="profile-header">
                <div className="profile-avatar-large">
                  {user?.avatar ? (
                    <img src={user.avatar} alt={user?.name} />
                  ) : (
                    getInitials(user?.name)
                  )}
                </div>
                <div className="profile-header-info">
                  {!isEditing ? (
                    <>
                      <h2 className="profile-name">{user?.name}</h2>
                      {/* Only render Course/Year if they exist */}
                      {(user?.course || user?.year) && (
                        <p className="profile-role">
                          {user?.course}
                          {user?.course && user?.year && ' • '}
                          {user?.year}
                        </p>
                      )}
                      {user?.studentId && <p className="profile-id">ID: {user?.studentId}</p>}
                    </>
                  ) : (
                    <div className="profile-edit-header">
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className="profile-input"
                        placeholder="Full Name"
                      />
                    </div>
                  )}
                </div>
                <div className="profile-actions">
                  {!isEditing ? (
                    <button className="btn-edit" onClick={handleEdit}>
                      <FaEdit /> Edit
                    </button>
                  ) : (
                    <div className="edit-actions">
                      <button className="btn-save" onClick={handleSave}>
                        <FaSave /> Save
                      </button>
                      <button className="btn-cancel" onClick={handleCancel}>
                        <FaTimes /> Cancel
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Bio Section - Hide if empty and not editing */}
              {(user?.bio || isEditing) && (
                <div className="profile-section">
                  <h3 className="section-title">About</h3>
                  {!isEditing ? (
                    <p className="profile-bio">{user?.bio}</p>
                  ) : (
                    <textarea
                      name="bio"
                      value={formData.bio}
                      onChange={handleChange}
                      className="profile-textarea"
                      rows="4"
                      placeholder="Tell us about yourself..."
                    />
                  )}
                </div>
              )}

              <div className="profile-section">
                <h3 className="section-title">Contact Information</h3>
                <div className="profile-info-grid">
                  <div className="info-item">
                    <FaEnvelope className="info-icon" />
                    <div className="info-content">
                      <label>Email</label>
                      {!isEditing ? (
                        <span>{user?.email}</span>
                      ) : (
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          className="profile-input"
                        />
                      )}
                    </div>
                  </div>

                  {/* Phone: Hide if empty and not editing */}
                  {(user?.phone || isEditing) && (
                    <div className="info-item">
                      <FaPhone className="info-icon" />
                      <div className="info-content">
                        <label>Phone</label>
                        {!isEditing ? (
                          <span>{user?.phone}</span>
                        ) : (
                          <input
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            className="profile-input"
                          />
                        )}
                      </div>
                    </div>
                  )}

                  {/* Address: Only show if exists (simplified read-only for now) */}
                  {user?.address && (user.address.street || user.address.city) && (
                    <div className="info-item">
                      <FaMapMarkerAlt className="info-icon" />
                      <div className="info-content">
                        <label>Address</label>
                        <span>
                          {[user.address.street, user.address.city, user.address.state]
                            .filter(Boolean)
                            .join(', ')}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: Stats & Insights */}
            <div className="profile-sidebar">

              {/* 1. ONBOARDING SECTION */}
              {!hasOnboarding ? (
                <div className="profile-card cta-card highlight-border">
                  <div className="card-header-centered">
                    <FaRocket className="cta-icon-large" />
                    <h3 className="card-title">Launch Your Journey</h3>
                  </div>
                  <p className="cta-text">Complete your onboarding profile to unlock personalized insights and AI recommendations.</p>
                  <button className="btn-primary-full" onClick={() => navigate('/onboarding')}>
                    Complete Onboarding
                  </button>
                </div>
              ) : (
                <div className="profile-card">
                  <h3 className="card-title"><FaBrain className="icon-mr" /> Learning Profile</h3>
                  <div className="details-list">
                    {user.focus && (
                      <div className="detail-item">
                        <div className="detail-label">Focus Area</div>
                        <div className="detail-value">{user.focus.charAt(0).toUpperCase() + user.focus.slice(1)}</div>
                      </div>
                    )}
                    {user.learningMode && (
                      <div className="detail-item">
                        <div className="detail-label">Learning Style</div>
                        <div className="detail-value">{user.learningMode.charAt(0).toUpperCase() + user.learningMode.slice(1)}</div>
                      </div>
                    )}
                    {user.experienceLevel !== undefined && (
                      <div className="detail-item">
                        <div className="detail-label">Experience</div>
                        <div className="detail-value">{user.experienceLevel > 70 ? 'Advanced' : user.experienceLevel > 30 ? 'Intermediate' : 'Beginner'}</div>
                      </div>
                    )}
                    {/* Only show Archetype/Domain if they exist (NLP derived) */}
                    {user.archetype && (
                      <div className="detail-item">
                        <div className="detail-label">Archetype</div>
                        <div className="detail-value highlight-text">{user.archetype}</div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* 2. PERFORMANCE SECTION */}
              {!hasPerformance ? (
                <div className="profile-card empty-state-card">
                  <FaChartLine className="empty-icon-med" />
                  <h4>No Performance Data</h4>
                  <p>Your academic stats will appear here after your first assessment.</p>
                </div>
              ) : (
                <div className="profile-card">
                  <h3 className="card-title">Academic Overview</h3>
                  <div className="academic-stats">
                    {user.gpa && (
                      <div className="academic-stat">
                        <FaChartLine className="stat-icon-profile" style={{ color: '#667eea' }} />
                        <div>
                          <div className="stat-label-profile">GPA</div>
                          <div className="stat-value-profile">{user.gpa}</div>
                        </div>
                      </div>
                    )}

                    {/* Calculated or Real Credits Only */}
                    {user.totalCredits !== undefined && user.totalCredits > 0 && (
                      <div className="academic-stat">
                        <FaGraduationCap className="stat-icon-profile" style={{ color: '#10b981' }} />
                        <div>
                          <div className="stat-label-profile">Credits</div>
                          <div className="stat-value-profile">{user.totalCredits}</div>
                        </div>
                      </div>
                    )}

                    {user.completedAssessments > 0 && (
                      <div className="academic-stat">
                        <FaTrophy className="stat-icon-profile" style={{ color: '#f59e0b' }} />
                        <div>
                          <div className="stat-label-profile">Finished</div>
                          <div className="stat-value-profile">{user.completedAssessments}</div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* 3. AI RECOMMENDATIONS SECTION */}
              {!canUnlockAI ? (
                <div className="profile-card locked-card">
                  <div className="lock-header">
                    <FaLock className="lock-icon" />
                    <h3>AI Insights Locked</h3>
                  </div>
                  <p className="lock-text">
                    {!hasOnboarding
                      ? "Complete user onboarding first."
                      : "Complete at least one assessment to generate AI insights."
                    }
                  </p>
                </div>
              ) : (
                <div className="profile-card ai-card">
                  <h3 className="card-title"><FaLightbulb className="icon-mr text-yellow" /> AI Recommendations</h3>
                  {/* Safe render if array is missing */}
                  {user.aiRecommendations && user.aiRecommendations.length > 0 ? (
                    <ul className="recs-list">
                      {user.aiRecommendations.map((rec, i) => (
                        <li key={i}>{rec}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="no-recs-text">AI is analyzing your recent performance. Check back soon!</p>
                  )}
                </div>
              )}

            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Profile;