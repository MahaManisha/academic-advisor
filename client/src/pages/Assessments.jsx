// client/src/pages/Assessments.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../api/axios';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import {
  FaChartLine,
  FaClipboardList,
  FaCheckCircle,
  FaClock,
  FaArrowRight,
  FaFilter,
  FaStar
} from 'react-icons/fa';
import './Assessments.css';

const Assessments = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [filter, setFilter] = useState('all'); // all, pending, completed

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAssessments = async () => {
      try {
        const response = await axios.get('/assessments');
        if (response.data.success) {
          setAssessments(response.data.assessments || []);
        }
      } catch (error) {
        console.error('Failed to fetch assessments:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchAssessments();
  }, []);

  // Filter assessments based on selected filter
  const filteredAssessments = filter === 'all'
    ? assessments
    : assessments.filter(a => a.status === filter);

  // Calculate stats
  const completedAssessments = assessments.filter(a => a.status === 'completed');
  const stats = {
    total: assessments.length,
    completed: completedAssessments.length,
    pending: assessments.filter(a => a.status === 'pending').length,
    averageScore: completedAssessments.length > 0
      ? Math.round(
        completedAssessments
          .filter(a => a.yourScore != null)
          .reduce((sum, a) => sum + a.yourScore, 0) /
        (completedAssessments.filter(a => a.yourScore != null).length || 1)
      )
      : 0
  };

  const handleStartAssessment = (assessment) => {
    navigate('/assessment-test', { state: { assessment } });
  };

  return (
    <div className="dashboard-container">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} user={user} />

      <Header
        title="Assessments"
        subtitle={`${filteredAssessments.length} assessments available`}
        onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
        onLogout={handleLogout}
        showSearch={true}
      />

      <main className="dashboard-main centered-main-layout">
        <div className="centered-content-wrapper">
          {/* Stats Section */}
          <section className="assessments-stats">
            <div className="stat-card">
              <div className="stat-icon" style={{ backgroundColor: '#667eea' }}>
                <FaClipboardList />
              </div>
              <div className="stat-content">
                <p className="stat-label">Total Assessments</p>
                <h3 className="stat-value">{stats.total}</h3>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon" style={{ backgroundColor: '#10b981' }}>
                <FaCheckCircle />
              </div>
              <div className="stat-content">
                <p className="stat-label">Completed</p>
                <h3 className="stat-value">{stats.completed}</h3>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon" style={{ backgroundColor: '#f59e0b' }}>
                <FaClock />
              </div>
              <div className="stat-content">
                <p className="stat-label">Pending</p>
                <h3 className="stat-value">{stats.pending}</h3>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon" style={{ backgroundColor: '#ec4899' }}>
                <FaChartLine />
              </div>
              <div className="stat-content">
                <p className="stat-label">Average Score</p>
                <h3 className="stat-value">{stats.averageScore}%</h3>
              </div>
            </div>
          </section>

          {/* Filter Section */}
          <section className="assessments-filter">
            <div className="filter-header">
              <h2>Available Assessments</h2>
              <div className="filter-buttons">
                <button
                  className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
                  onClick={() => setFilter('all')}
                >
                  <FaFilter /> All ({assessments.length})
                </button>
                <button
                  className={`filter-btn ${filter === 'pending' ? 'active' : ''}`}
                  onClick={() => setFilter('pending')}
                >
                  Pending ({stats.pending})
                </button>
                <button
                  className={`filter-btn ${filter === 'completed' ? 'active' : ''}`}
                  onClick={() => setFilter('completed')}
                >
                  Completed ({stats.completed})
                </button>
              </div>
            </div>
          </section>

          {/* Assessments List */}
          <section className="assessments-list">
            {loading ? (
              <div className="empty-state" style={{ padding: '4rem 2rem' }}>
                <div className="spinner" style={{ margin: '0 auto', width: '40px', height: '40px', border: '4px solid var(--border-color)', borderTop: '4px solid var(--accent-neon)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                <h3 style={{ marginTop: '1rem' }}>Loading assessments...</h3>
              </div>
            ) : filteredAssessments.length > 0 ? (
              filteredAssessments.map((assessment) => (
                <div key={assessment.id} className="assessment-card">
                  <div className="assessment-header">
                    <div className="assessment-title-group">
                      <h3 className="assessment-title">{assessment.title}</h3>
                      <p className="assessment-subject">{assessment.subject}</p>
                    </div>
                    <div className="assessment-status">
                      {assessment.status === 'completed' ? (
                        <span className="status-badge completed">
                          <FaCheckCircle /> Completed
                        </span>
                      ) : (
                        <span className="status-badge pending">
                          <FaClock /> Pending
                        </span>
                      )}
                    </div>
                  </div>

                  <p className="assessment-description">{assessment.description}</p>

                  <div className="assessment-details">
                    <div className="detail-item">
                      <span className="detail-label">Questions:</span>
                      <span className="detail-value">{assessment.questions}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Duration:</span>
                      <span className="detail-value">{assessment.duration}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Difficulty:</span>
                      <span className="detail-value">{assessment.difficulty}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Points:</span>
                      <span className="detail-value">{assessment.points}</span>
                    </div>
                  </div>

                  <div className="assessment-footer">
                    <div className="assessment-meta">
                      {assessment.yourScore !== null && (
                        <div className="score-info">
                          <FaStar className="star-icon" />
                          <span>Your Score: <strong>{assessment.yourScore}%</strong></span>
                        </div>
                      )}
                      <p className="due-date">Due: {new Date(assessment.dueDate).toLocaleDateString()}</p>
                    </div>

                    <button
                      className={`assessment-btn ${assessment.status}`}
                      onClick={() => handleStartAssessment(assessment)}
                    >
                      {assessment.status === 'completed' ? 'Review' : 'Start Assessment'}
                      <FaArrowRight />
                    </button>
                  </div>
                </div>
              ))
            ) : assessments.length === 0 ? (
              <div className="empty-state" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
                <FaClipboardList className="empty-icon" style={{ fontSize: '4rem', color: 'var(--text-light)', marginBottom: '1rem' }} />
                <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>No assessments available yet</h3>
                <p style={{ color: 'var(--text-light)', marginBottom: '1.5rem' }}>You haven't completed or been assigned any assessments.</p>
                <button className="btn-primary" onClick={() => navigate('/assessment-test')} style={{ padding: '0.75rem 1.5rem', borderRadius: '8px', cursor: 'pointer', background: 'var(--accent-neon)', color: '#000', fontWeight: 'bold' }}>
                  Generate Assessment
                </button>
              </div>
            ) : (
              <div className="empty-state">
                <FaClipboardList className="empty-icon" />
                <h3>No {filter} assessments found</h3>
                <p>You don't have any {filter} assessments at the moment.</p>
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
};

export default Assessments;
