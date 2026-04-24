import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { 
  FaCalendarAlt, 
  FaPlus, 
  FaVideo, 
  FaClock, 
  FaUser, 
  FaTrash, 
  FaExternalLinkAlt, 
  FaTimes,
  FaCheckCircle
} from 'react-icons/fa';
import * as sessionApi from '../api/session.api';
import api from '../api/axios';
import './Dashboard.css';
import './MentorSessions.css';

const MentorSessions = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sessions, setSessions] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    studentId: '',
    title: '',
    description: '',
    date: '',
    startTime: '',
    endTime: '',
    meetingLink: ''
  });

  useEffect(() => {
    fetchSessions();
    fetchStudents();
    
    // Check if studentId is passed in URL
    const params = new URLSearchParams(location.search);
    const studentId = params.get('studentId');
    if (studentId) {
      setFormData(prev => ({ ...prev, studentId }));
      setShowModal(true);
    }
  }, [location]);

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

  const fetchStudents = async () => {
    try {
      const response = await api.get('/mentor/students');
      if (response.data.success) {
        setStudents(response.data.students);
      }
    } catch (err) {
      console.error("Failed to fetch students:", err);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await sessionApi.createSession(formData);
      if (response.success) {
        setSessions(prev => [...prev, response.session]);
        setShowModal(false);
        setFormData({
          studentId: '',
          title: '',
          description: '',
          date: '',
          startTime: '',
          endTime: '',
          meetingLink: ''
        });
      }
    } catch (err) {
      console.error("Failed to create session:", err);
      alert("Failed to create session. Please try again.");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this session?")) return;
    try {
      const response = await sessionApi.deleteSession(id);
      if (response.success) {
        setSessions(prev => prev.filter(s => s._id !== id));
      }
    } catch (err) {
      console.error("Failed to delete session:", err);
    }
  };

  const handleUpdateStatus = async (id, status) => {
    try {
      const response = await sessionApi.updateSessionStatus(id, status);
      if (response.success) {
        setSessions(prev => prev.map(s => s._id === id ? { ...s, status } : s));
      }
    } catch (err) {
      console.error("Failed to update status:", err);
    }
  };

  return (
    <div className="dashboard-container">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} user={user} />
      <Header onMenuToggle={() => setSidebarOpen(!sidebarOpen)} onLogout={handleLogout} title="Mentorship Sessions" subtitle="Manage your Google Meet schedule" />

      <main className="dashboard-main">
        <div className="sessions-header">
          <h2 className="neon-text">Upcoming Sessions</h2>
          <button className="create-session-btn" onClick={() => setShowModal(true)}>
            <FaPlus /> Schedule Session
          </button>
        </div>

        {loading ? (
          <div className="loading-spinner">Loading sessions...</div>
        ) : (
          <div className="sessions-grid">
            {sessions.length === 0 ? (
              <div className="empty-state">
                <FaCalendarAlt size={50} />
                <p>No sessions scheduled yet.</p>
              </div>
            ) : (
              sessions.map(session => {
                const partner = user?.role === 'mentor' ? session.studentId : session.mentorId;
                return (
                  <div key={session._id} className={`session-card ${session.status}`}>
                    <div className="session-status-badge">{session.status?.toUpperCase() || 'SCHEDULED'}</div>
                    <div className="session-card-header">
                      <h3>{session.title}</h3>
                      <button className="delete-btn" onClick={() => handleDelete(session._id)}>
                        <FaTrash />
                      </button>
                    </div>
                    
                    <div className="session-info">
                      <div className="info-item">
                        <FaUser /> <span>{partner?.fullName || 'Unknown User'}</span>
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
                      <a href={session.meetingLink} target="_blank" rel="noopener noreferrer" className="join-btn">
                        <FaVideo /> JOIN GOOGLE MEET
                      </a>
                      {session.status === 'scheduled' && (
                        <button className="complete-btn" onClick={() => handleUpdateStatus(session._id, 'completed')}>
                          <FaCheckCircle /> MARK DONE
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* Create Session Modal */}
        {showModal && (
          <div className="modal-overlay">
            <div className="modal-content fade-in">
              <div className="modal-header">
                <h3>Schedule New Session</h3>
                <button className="close-btn" onClick={() => setShowModal(false)}>
                  <FaTimes />
                </button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label>Select Student</label>
                  <select 
                    required 
                    value={formData.studentId} 
                    onChange={e => setFormData({...formData, studentId: e.target.value})}
                  >
                    <option value="">-- Select Student --</option>
                    {students.map(s => (
                      <option key={s._id} value={s._id}>{s.fullName}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Session Title</label>
                  <input 
                    type="text" 
                    required 
                    placeholder="e.g. Weekly Progress Review"
                    value={formData.title}
                    onChange={e => setFormData({...formData, title: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label>Description</label>
                  <textarea 
                    placeholder="What will you discuss?"
                    value={formData.description}
                    onChange={e => setFormData({...formData, description: e.target.value})}
                  />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Date</label>
                    <input 
                      type="date" 
                      required 
                      value={formData.date}
                      onChange={e => setFormData({...formData, date: e.target.value})}
                    />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Start Time</label>
                    <input 
                      type="time" 
                      required 
                      value={formData.startTime}
                      onChange={e => setFormData({...formData, startTime: e.target.value})}
                    />
                  </div>
                  <div className="form-group">
                    <label>End Time</label>
                    <input 
                      type="time" 
                      required 
                      value={formData.endTime}
                      onChange={e => setFormData({...formData, endTime: e.target.value})}
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label>Google Meet Link</label>
                  <div className="input-with-icon">
                    <FaVideo />
                    <input 
                      type="url" 
                      required 
                      placeholder="https://meet.google.com/xxx-xxxx-xxx"
                      value={formData.meetingLink}
                      onChange={e => setFormData({...formData, meetingLink: e.target.value})}
                    />
                  </div>
                </div>
                <button type="submit" className="submit-btn">SCHEDULE SESSION</button>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default MentorSessions;
