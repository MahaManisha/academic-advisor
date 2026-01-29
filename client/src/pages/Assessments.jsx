// client/src/pages/Assessments.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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

  // Mock data - Replace with actual API calls
  const [assessments, setAssessments] = useState([
    {
      id: 1,
      title: 'Data Structures Fundamentals',
      subject: 'Computer Science',
      description: 'Test your knowledge on arrays, linked lists, and stacks',
      questions: 25,
      duration: '45 mins',
      status: 'pending',
      dueDate: '2026-02-05',
      difficulty: 'Medium',
      points: 100,
      yourScore: null
    },
    {
      id: 2,
      title: 'Database Management Systems',
      subject: 'Information Technology',
      description: 'Assessment covering SQL and relational databases',
      questions: 30,
      duration: '60 mins',
      status: 'completed',
      dueDate: '2026-01-20',
      difficulty: 'Hard',
      points: 100,
      yourScore: 82
    },
    {
      id: 3,
      title: 'Web Development Basics',
      subject: 'Web Technologies',
      description: 'HTML, CSS, and JavaScript fundamentals',
      questions: 20,
      duration: '30 mins',
      status: 'completed',
      dueDate: '2026-01-15',
      difficulty: 'Easy',
      points: 100,
      yourScore: 95
    },
    {
      id: 4,
      title: 'Object-Oriented Programming',
      subject: 'Computer Science',
      description: 'Classes, inheritance, polymorphism concepts',
      questions: 28,
      duration: '50 mins',
      status: 'pending',
      dueDate: '2026-02-10',
      difficulty: 'Hard',
      points: 100,
      yourScore: null
    },
  ]);

  // Filter assessments based on selected filter
  const filteredAssessments = filter === 'all' 
    ? assessments 
    : assessments.filter(a => a.status === filter);

  // Calculate stats
  const stats = {
    total: assessments.length,
    completed: assessments.filter(a => a.status === 'completed').length,
    pending: assessments.filter(a => a.status === 'pending').length,
    averageScore: Math.round(
      assessments
        .filter(a => a.status === 'completed' && a.yourScore)
        .reduce((sum, a) => sum + a.yourScore, 0) / 
      assessments.filter(a => a.status === 'completed').length || 0
    )
  };

  const handleStartAssessment = (assessment) => {
    navigate('/assessment-test', { state: { assessment } });
  };

  return (
    <div className="assessments-page">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} user={user} />
      
      <main className="assessments-main">
        <Header 
          title="Assessments"
          subtitle={`${filteredAssessments.length} assessments available`}
          onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
          onLogout={handleLogout}
          showSearch={true}
        />

        <div className="assessments-container">
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
            {filteredAssessments.length > 0 ? (
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
            ) : (
              <div className="empty-state">
                <FaClipboardList className="empty-icon" />
                <h3>No assessments found</h3>
                <p>There are no {filter !== 'all' ? filter : ''} assessments available right now.</p>
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
};

export default Assessments;
