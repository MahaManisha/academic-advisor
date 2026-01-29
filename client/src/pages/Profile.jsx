// client/src/pages/Profile.jsx
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
  FaChartLine
} from 'react-icons/fa';
import './Profile.css';

const Profile = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    bio: user?.bio || '',
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

  const handleSave = () => {
    // TODO: Implement API call to update user profile
    console.log('Saving profile:', formData);
    setIsEditing(false);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

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
                      <p className="profile-role">{user?.course} • {user?.year}</p>
                      <p className="profile-id">ID: {user?.studentId}</p>
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
                      <FaEdit /> Edit Profile
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
                  <div className="info-item">
                    <FaMapMarkerAlt className="info-icon" />
                    <div className="info-content">
                      <label>Address</label>
                      <span>{user?.address?.street}, {user?.address?.city}, {user?.address?.state}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="profile-sidebar">
              <div className="profile-card">
                <h3 className="card-title">Academic Overview</h3>
                <div className="academic-stats">
                  <div className="academic-stat">
                    <FaChartLine className="stat-icon-profile" style={{ color: '#667eea' }} />
                    <div>
                      <div className="stat-label-profile">GPA</div>
                      <div className="stat-value-profile">{user?.gpa}</div>
                    </div>
                  </div>
                  <div className="academic-stat">
                    <FaGraduationCap className="stat-icon-profile" style={{ color: '#10b981' }} />
                    <div>
                      <div className="stat-label-profile">Credits</div>
                      <div className="stat-value-profile">{user?.totalCredits}</div>
                    </div>
                  </div>
                  <div className="academic-stat">
                    <FaTrophy className="stat-icon-profile" style={{ color: '#f59e0b' }} />
                    <div>
                      <div className="stat-label-profile">Assessments</div>
                      <div className="stat-value-profile">{user?.completedAssessments}</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="profile-card">
                <h3 className="card-title">Academic Details</h3>
                <div className="details-list">
                  <div className="detail-item">
                    <FaIdCard className="detail-icon" />
                    <div>
                      <div className="detail-label">Student ID</div>
                      <div className="detail-value">{user?.studentId}</div>
                    </div>
                  </div>
                  <div className="detail-item">
                    <FaGraduationCap className="detail-icon" />
                    <div>
                      <div className="detail-label">Course</div>
                      <div className="detail-value">{user?.course}</div>
                    </div>
                  </div>
                  <div className="detail-item">
                    <FaCalendar className="detail-icon" />
                    <div>
                      <div className="detail-label">Year</div>
                      <div className="detail-value">{user?.year}</div>
                    </div>
                  </div>
                  <div className="detail-item">
                    <FaCalendar className="detail-icon" />
                    <div>
                      <div className="detail-label">Joined</div>
                      <div className="detail-value">
                        {new Date(user?.joinDate).toLocaleDateString('en-US', { 
                          month: 'long', 
                          year: 'numeric' 
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {user?.academicStats?.honors?.length > 0 && (
                <div className="profile-card">
                  <h3 className="card-title">Honors & Awards</h3>
                  <div className="honors-list">
                    {user.academicStats.honors.map((honor, index) => (
                      <div key={index} className="honor-item">
                        <FaTrophy className="honor-icon" />
                        <span>{honor}</span>
                      </div>
                    ))}
                  </div>
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