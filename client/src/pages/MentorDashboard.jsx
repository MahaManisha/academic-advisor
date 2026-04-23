import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import api from '../api/axios';
import MentorStatsCards from '../components/mentor/MentorStatsCards';
import StudentRequests from '../components/mentor/StudentRequests';
import MentorStudents from '../components/mentor/MentorStudents';
import SessionManager from '../components/mentor/SessionManager';
import MentorAnalytics from '../components/mentor/MentorAnalytics';
import './Dashboard.css';

const MentorDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [dashboardData, setDashboardData] = useState(null);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

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

  useEffect(() => {
    fetchDashboard();
  }, []);

  if (loading) return <div className="loading-spinner">Loading Dashboard...</div>;
  if (!dashboardData) return <div className="error-message">Failed to load dashboard.</div>;

  const { mentor, stats } = dashboardData;

  const handleLogout = () => {
    logout();
    navigate('/login');
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

          <MentorStatsCards stats={stats} />

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px', marginTop: '24px' }}>
            {/* Mentorship Requests Component */}
            <StudentRequests requests={requests} setRequests={setRequests} refreshStats={fetchDashboard} />

            {/* Profile Overview Component */}
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

          <div style={{ marginTop: '24px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px' }}>
            <MentorStudents />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <SessionManager />
              <MentorAnalytics stats={stats} />
            </div>
          </div>

        </div>
      </main>
    </div>
  );
};

export default MentorDashboard;
