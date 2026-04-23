import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUserGraduate, FaStar, FaChalkboardTeacher, FaHistory, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import api from '../api/axios';
import './Dashboard.css';

const MentorDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [dashboardData, setDashboardData] = useState(null);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const [dashRes, reqRes] = await Promise.all([
          api.get('/mentor/dashboard'),
          api.get('/mentor/requests')
        ]);
        
        if (dashRes.data.success) {
          setDashboardData(dashRes.data.dashboard);
        }
        if (reqRes.data.success) {
          setRequests(reqRes.data.requests);
        }
      } catch (err) {
        console.error("Failed to fetch mentor dashboard data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  if (loading) return <div className="loading-spinner">Loading Dashboard...</div>;
  if (!dashboardData) return <div className="error-message">Failed to load dashboard.</div>;

  const { mentor, stats } = dashboardData;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleAcceptRequest = async (requestId) => {
    // Add logic here to hit an endpoint that approves requests
    // For now we'll just optimistically update the UI
    setRequests(requests.filter(req => req._id !== requestId));
  };

  const handleDeclineRequest = async (requestId) => {
    // Add logic here to decline requests
    setRequests(requests.filter(req => req._id !== requestId));
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
        title={`Welcome back, Mentor ${(user?.fullName || user?.name)?.split(' ')[0] || ''}!`}
        subtitle="Mentor Command Center"
        notificationCount={stats.pendingRequests}
      />

      <main className="dashboard-main centered-main-layout">
        <div className="centered-content-wrapper fade-in">
          
          {/* Welcome Banner */}
          <div className="welcome-banner" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', marginBottom: '24px' }}>
            <div className="welcome-banner-content" style={{ flex: 1, minWidth: 250 }}>
              <h2 className="welcome-banner-title">
                ⚡ Mentor Hub: Command Center
              </h2>
              <div className="personalization-tags" style={{ display: 'flex', gap: '12px', margin: '12px 0' }}>
                <span style={{ background: mentor.status === 'approved' ? 'rgba(74, 222, 128, 0.2)' : 'rgba(250, 204, 21, 0.2)', color: mentor.status === 'approved' ? '#4ade80' : '#facc15' }}>
                   Status: {mentor.status.toUpperCase()}
                </span>
                <span>
                   Domain: {mentor.domain}
                </span>
              </div>
              <p className="welcome-banner-text">
                Manage your students, track your impact, and maintain your stellar rating.
              </p>
            </div>
          </div>

          <div className="stats-grid">
            <div className="stat-card" style={{ "--stat-color": "#4ade80" }}>
              <div className="stat-header">
                <div className="stat-icon" style={{ background: `linear-gradient(135deg, #4ade80 0%, rgba(0,0,0,0.5) 100%)`, border: `1px solid #4ade80` }}>
                  <FaUserGraduate />
                </div>
              </div>
              <div className="stat-label">Active Students</div>
              <div className="stat-value">{stats.totalStudents}</div>
            </div>

            <div className="stat-card" style={{ "--stat-color": "#facc15" }}>
              <div className="stat-header">
                <div className="stat-icon" style={{ background: `linear-gradient(135deg, #facc15 0%, rgba(0,0,0,0.5) 100%)`, border: `1px solid #facc15` }}>
                  <FaStar />
                </div>
              </div>
              <div className="stat-label">Mentor Rating</div>
              <div className="stat-value">{stats.rating.toFixed(1)} <span>⭐</span></div>
            </div>

            <div className="stat-card" style={{ "--stat-color": "#a78bfa" }}>
              <div className="stat-header">
                <div className="stat-icon" style={{ background: `linear-gradient(135deg, #a78bfa 0%, rgba(0,0,0,0.5) 100%)`, border: `1px solid #a78bfa` }}>
                  <FaChalkboardTeacher />
                </div>
              </div>
              <div className="stat-label">Pending Requests</div>
              <div className="stat-value">{stats.pendingRequests}</div>
            </div>

            <div className="stat-card" style={{ "--stat-color": "#60a5fa" }}>
              <div className="stat-header">
                <div className="stat-icon" style={{ background: `linear-gradient(135deg, #60a5fa 0%, rgba(0,0,0,0.5) 100%)`, border: `1px solid #60a5fa` }}>
                  <FaHistory />
                </div>
              </div>
              <div className="stat-label">Total Sessions</div>
              <div className="stat-value">{stats.totalSessions}</div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px', marginTop: '24px' }}>
            {/* Mentorship Requests */}
            <div className="content-section" style={{ background: 'white', padding: '24px', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', flex: 2 }}>
              <div className="section-header" style={{ marginBottom: '20px' }}>
                <h2 className="section-title" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><FaChalkboardTeacher style={{ color: '#a78bfa' }}/> Mentorship Requests</h2>
              </div>
              {requests.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 0', color: '#6b7280' }}>
                  <div style={{ fontSize: '40px', marginBottom: '10px', color: '#e5e7eb' }}><FaUserGraduate /></div>
                  <p>No pending requests at the moment.</p>
                </div>
              ) : (
                <ul style={{ listStyle: 'none', padding: 0 }}>
                  {requests.map(req => (
                    <li key={req._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', border: '1px solid #e5e7eb', borderRadius: '12px', marginBottom: '12px' }}>
                      <div>
                        <h4 style={{ margin: '0 0 5px 0', fontSize: '16px', color: '#111827' }}>{req.studentId?.fullName}</h4>
                        <p style={{ margin: 0, fontSize: '14px', color: '#6b7280' }}>{req.message}</p>
                      </div>
                      <div style={{ display: 'flex', gap: '10px' }}>
                        <button onClick={() => handleAcceptRequest(req._id)} className="btn-primary" style={{ padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                          <FaCheckCircle /> Accept
                        </button>
                        <button onClick={() => handleDeclineRequest(req._id)} className="btn-secondary" style={{ padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '5px', background: '#fee2e2', color: '#ef4444', border: 'none' }}>
                          <FaTimesCircle /> Decline
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Profile Overview */}
            <div className="content-section" style={{ background: 'white', padding: '24px', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', flex: 1 }}>
              <div className="section-header" style={{ marginBottom: '20px' }}>
                <h2 className="section-title">Profile Overview</h2>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <div style={{ padding: '12px', background: '#f9fafb', borderRadius: '8px' }}>
                  <strong style={{ display: 'block', fontSize: '12px', color: '#6b7280', textTransform: 'uppercase' }}>Domain</strong>
                  <span style={{ fontSize: '16px', color: '#111827', fontWeight: 500 }}>{mentor.domain}</span>
                </div>
                <div style={{ padding: '12px', background: '#f9fafb', borderRadius: '8px' }}>
                  <strong style={{ display: 'block', fontSize: '12px', color: '#6b7280', textTransform: 'uppercase' }}>Experience</strong>
                  <span style={{ fontSize: '16px', color: '#111827', fontWeight: 500 }}>{mentor.experience} Years</span>
                </div>
                
                <div style={{ marginTop: '10px' }}>
                  <strong style={{ display: 'block', fontSize: '12px', color: '#6b7280', textTransform: 'uppercase', marginBottom: '8px' }}>Skills & Expertise</strong>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {mentor.skills.map(skill => (
                      <span key={skill} style={{ background: 'rgba(167, 139, 250, 0.1)', color: '#8b5cf6', padding: '6px 12px', borderRadius: '20px', fontSize: '13px', fontWeight: 500, border: '1px solid rgba(167, 139, 250, 0.2)' }}>
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
};

export default MentorDashboard;
