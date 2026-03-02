// client/src/pages/Courses.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import {
  FaBook,
  FaGraduationCap,
  FaClock,
  FaCheckCircle,
  FaStar,
  FaPlay,
  FaChartLine
} from 'react-icons/fa';
import './Dashboard.css';
import './Courses.css';

const Courses = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [filter, setFilter] = useState('all'); // all, ongoing, completed

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Mock data - Replace with actual API calls
  // State
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generatingAI, setGeneratingAI] = useState(false);

  const formatCourses = (rawCourses) => {
    return rawCourses.map((c) => ({
      id: c._id,
      title: c.name,
      code: c.code,
      instructor: `Department of ${c.category || 'Science'}`,
      progress: 0,
      totalLessons: c.credits * 10,
      completedLessons: 0,
      duration: `${c.credits * 4} weeks`,
      rating: 4.5,
      status: 'active',
      difficulty: c.difficulty,
      description: c.description
    }));
  };

  // Fetch Courses
  const loadCourses = async () => {
    try {
      setLoading(true);
      const { getAllCourses } = await import('../api/course.api');
      const res = await getAllCourses();
      if (res.success) {
        setCourses(formatCourses(res.data));
      }
    } catch (error) {
      console.error("Failed to load courses", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCourses();
  }, []);

  const handleGenerateAIMissions = async () => {
    try {
      setGeneratingAI(true);
      const { generateAIMissions } = await import('../api/course.api');
      const res = await generateAIMissions();
      if (res.success) {
        setCourses(formatCourses(res.data));
      }
    } catch (error) {
      console.error("Failed to generate AI missions", error);
      alert("Error generating curriculum. Please try again.");
    } finally {
      setGeneratingAI(false);
    }
  };

  const filteredCourses = courses.filter(course => {
    if (filter === 'all') return true;
    return course.status === filter;
  });

  const stats = {
    total: courses.length,
    ongoing: courses.filter(c => c.status === 'ongoing').length,
    completed: courses.filter(c => c.status === 'completed').length,
    avgProgress: courses.length ? Math.round(courses.reduce((acc, c) => acc + c.progress, 0) / courses.length) : 0
  };

  const handleCourseClick = (courseId) => {
    navigate(`/courses/${courseId}`);
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
        title="Active Missions"
        subtitle="Review your assigned mission parameters."
      />

      <main className="dashboard-main flex-1 flex justify-center px-6">
        <div className="main-content w-full max-w-7xl">
          {loading ? (
            <div className="loading-state">
              <div className="loader-ring"></div>
              <span>Scanning Courses...</span>
            </div>
          ) : (
            <>
              {/* Mission Intel (Stats) */}
              <div className="stats-grid" style={{ marginBottom: '30px' }}>
                <div className="stat-card" style={{ "--stat-color": "#667eea" }}>
                  <div className="stat-header">
                    <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #667eea 0%, rgba(0,0,0,0.5) 100%)', border: '1px solid #667eea' }}>
                      <FaBook />
                    </div>
                  </div>
                  <div className="stat-label">Total Missions</div>
                  <div className="stat-value">{stats.total}</div>
                </div>

                <div className="stat-card" style={{ "--stat-color": "#f59e0b" }}>
                  <div className="stat-header">
                    <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #f59e0b 0%, rgba(0,0,0,0.5) 100%)', border: '1px solid #f59e0b' }}>
                      <FaClock />
                    </div>
                  </div>
                  <div className="stat-label">Active Quests</div>
                  <div className="stat-value">{stats.ongoing}</div>
                </div>

                <div className="stat-card" style={{ "--stat-color": "#10b981" }}>
                  <div className="stat-header">
                    <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #10b981 0%, rgba(0,0,0,0.5) 100%)', border: '1px solid #10b981' }}>
                      <FaCheckCircle />
                    </div>
                  </div>
                  <div className="stat-label">Quests Cleared</div>
                  <div className="stat-value">{stats.completed}</div>
                </div>

                <div className="stat-card" style={{ "--stat-color": "#ef4444" }}>
                  <div className="stat-header">
                    <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #ef4444 0%, rgba(0,0,0,0.5) 100%)', border: '1px solid #ef4444' }}>
                      <FaChartLine />
                    </div>
                  </div>
                  <div className="stat-label">Sync Rate</div>
                  <div className="stat-value">{stats.avgProgress}%</div>
                </div>
              </div>

              {/* Filter & Actions */}
              <div className="courses-filter" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
                    onClick={() => setFilter('all')}
                  >
                    All Quests
                  </button>
                  <button
                    className={`filter-btn ${filter === 'ongoing' ? 'active' : ''}`}
                    onClick={() => setFilter('ongoing')}
                  >
                    Active Quests
                  </button>
                  <button
                    className={`filter-btn ${filter === 'completed' ? 'active' : ''}`}
                    onClick={() => setFilter('completed')}
                  >
                    Cleared Quests
                  </button>
                </div>

                <button
                  onClick={handleGenerateAIMissions}
                  disabled={generatingAI}
                  style={{
                    padding: '10px 20px',
                    background: 'var(--game-neon-pink)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '8px',
                    fontFamily: 'var(--game-font-display)',
                    fontWeight: 700,
                    cursor: generatingAI ? 'not-allowed' : 'pointer',
                    boxShadow: '0 0 10px rgba(255, 0, 255, 0.4)',
                    textTransform: 'uppercase',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  <FaStar /> {generatingAI ? 'MAPPING CURRICULUM...' : 'AUTO-GENERATE AI MISSIONS'}
                </button>
              </div>

              {/* Courses Grid */}
              <div className="courses-grid">
                {filteredCourses.map((course) => (
                  <div key={course.id} className="course-card">
                    <div className="course-thumbnail">
                      {course.thumbnail ? (
                        <img src={course.thumbnail} alt={course.title} />
                      ) : (
                        <div className="thumbnail-placeholder">
                          <FaGraduationCap />
                        </div>
                      )}

                      <div className="xp-reward-badge" style={{
                        position: 'absolute', top: 12, left: 12, background: 'rgba(0,0,0,0.7)',
                        border: '1px solid #4facfe', color: '#4facfe', padding: '4px 10px',
                        borderRadius: '12px', fontSize: '12px', fontWeight: 'bold', fontFamily: 'Orbitron, sans-serif'
                      }}>
                        +{course.totalLessons * 10} XP
                      </div>

                      {course.status === 'completed' && (
                        <div className="completed-badge">
                          <FaCheckCircle /> CLEAR
                        </div>
                      )}
                    </div>

                    <div className="course-content">
                      <h3 className="course-title">{course.title}</h3>
                      <p className="course-instructor">
                        <FaGraduationCap /> {course.instructor}
                      </p>
                      <p className="course-description">{course.description}</p>

                      <div className="course-meta">
                        <span className="course-difficulty badge" style={{ background: 'rgba(255, 0, 255, 0.15)', color: '#ff00ff', border: '1px solid #ff00ff' }}>
                          Lvl: {course.difficulty}
                        </span>
                        <span className="course-rating">
                          <FaStar /> {course.rating}
                        </span>
                      </div>

                      <div className="course-progress-section">
                        <div className="progress-header">
                          <span className="progress-label">Sync Progress</span>
                          <span className="progress-percentage">{course.progress}%</span>
                        </div>
                        <div className="progress-bar">
                          <div
                            className="progress-fill"
                            style={{ width: `${course.progress}%` }}
                          />
                        </div>
                        <div className="progress-lessons">
                          {course.completedLessons}/{course.totalLessons} Objectives
                        </div>
                      </div>

                      <button
                        className="btn-continue"
                        onClick={() => handleCourseClick(course.id)}
                      >
                        {course.status === 'completed' ? (
                          'Review Data'
                        ) : (
                          <>
                            <FaPlay style={{ fontSize: '10px' }} /> Initiate Sequence
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {filteredCourses.length === 0 && (
                <div className="empty-state" style={{ textAlign: 'center', padding: '4rem' }}>
                  <FaBook className="empty-icon" style={{ fontSize: '4rem', color: 'var(--game-neon-pink)', marginBottom: '1rem', filter: 'drop-shadow(0 0 10px rgba(255, 0, 255, 0.5))' }} />
                  <h3 style={{ fontSize: '1.5rem', fontFamily: 'var(--game-font-display)', textTransform: 'uppercase' }}>No Quests available</h3>
                  <p style={{ color: 'var(--game-text-muted)', marginBottom: '2rem' }}>Press the button to dynamically generate missions customized to your profile using AI.</p>
                  <button
                    onClick={handleGenerateAIMissions}
                    disabled={generatingAI}
                    style={{
                      padding: '12px 24px',
                      background: 'var(--game-neon-pink)',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '8px',
                      fontFamily: 'var(--game-font-display)',
                      fontWeight: 700,
                      cursor: generatingAI ? 'not-allowed' : 'pointer',
                      boxShadow: '0 0 15px rgba(255, 0, 255, 0.5)',
                      textTransform: 'uppercase'
                    }}
                  >
                    {generatingAI ? 'ANALYZING PROFILE & GENERATING ...' : 'AUTO-GENERATE AI MISSIONS'}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default Courses;