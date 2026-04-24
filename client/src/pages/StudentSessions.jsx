import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { 
  FaCalendarAlt, 
  FaVideo, 
  FaClock, 
  FaChalkboardTeacher,
  FaCheckCircle
} from 'react-icons/fa';
import * as sessionApi from '../api/session.api';
import './Dashboard.css';
import './MentorSessions.css'; // Reuse CSS

const StudentSessions = () => {
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      setLoading(true);
      const response = await sessionApi.getMySessions();
      if (response.success) {
        setSessions(response.sessions);
      }
    } catch (err) {
      console.error("Failed to fetch sessions:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    window.location.href = '/login';
  };

  return (
    <div className="dashboard-container">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} user={user} />
      <Header onMenuToggle={() => setSidebarOpen(!sidebarOpen)} onLogout={handleLogout} title="My Sessions" subtitle="Join your mentorship calls" />

      <main className="dashboard-main">
        <div className="sessions-header">
          <h2 className="neon-text">Mentorship Schedule</h2>
        </div>

        {loading ? (
          <div className="loading-spinner">Loading sessions...</div>
        ) : (
          <div className="sessions-grid">
            {sessions.length === 0 ? (
              <div className="empty-state">
                <FaCalendarAlt size={50} />
                <p>No sessions scheduled by your mentor yet.</p>
              </div>
            ) : (
              sessions.map(session => {
                const partner = user?.role === 'mentor' ? session.studentId : session.mentorId;
                return (
                  <div key={session._id} className={`session-card ${session.status}`}>
                    <div className="session-status-badge">{session.status?.toUpperCase() || 'SCHEDULED'}</div>
                    <div className="session-card-header">
                      <h3>{session.title}</h3>
                    </div>
                    
                    <div className="session-info">
                      <div className="info-item">
                        <FaChalkboardTeacher /> <span>Mentor: {session.mentorId?.fullName || 'Unknown'}</span>
                      </div>
                      <div className="info-item">
                        <FaCalendarAlt /> <span>{session.date ? new Date(session.date).toLocaleDateString() : 'N/A'}</span>
                      </div>
                      <div className="info-item">
                        <FaClock /> <span>{session.startTime} - {session.endTime}</span>
                      </div>
                    </div>

                    <p className="session-desc">{session.description}</p>

                    <div className="session-actions">
                      {session.status === 'scheduled' ? (
                        <a href={session.meetingLink} target="_blank" rel="noopener noreferrer" className="join-btn">
                          <FaVideo /> JOIN GOOGLE MEET
                        </a>
                      ) : (
                        <div className="completed-badge">
                          <FaCheckCircle /> Session Completed
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default StudentSessions;
