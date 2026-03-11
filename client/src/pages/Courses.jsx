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
  FaChartLine,
  FaVideo
} from 'react-icons/fa';
import { useGamification } from '../context/GamificationContext';
import { useFocus } from '../context/FocusContext';
import './Dashboard.css';
import './Courses.css';

const Courses = () => {
  const { user, logout } = useAuth();
  const { triggerAction } = useGamification();
  const { startFocusMode } = useFocus();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [filter, setFilter] = useState('all'); // all, ongoing, completed

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // State
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generatingAI, setGeneratingAI] = useState(false);
  const [generatingAssessmentId, setGeneratingAssessmentId] = useState(null);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [videoWatchProgress, setVideoWatchProgress] = useState(0); // 0 to 100
  const [canTakeAssessment, setCanTakeAssessment] = useState(false);

  // Video utilities
  const getThumbnailUrl = (url) => {
    if (!url) return null;
    const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^&?]+)/);
    return match && match[1] ? `https://img.youtube.com/vi/${match[1]}/maxresdefault.jpg` : null;
  };

  const getEmbedUrl = (url) => {
    if (!url) return '';
    const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^&?]+)/);
    return match && match[1] ? `https://www.youtube.com/embed/${match[1]}` : url;
  };

  const formatCourses = (rawCourses) => {
    return rawCourses.map((c) => {
      let thumb = c.thumbnail;
      if (!thumb && c.videoUrl) thumb = getThumbnailUrl(c.videoUrl);

      return {
        id: c._id || `temp-${Math.random().toString(36).substring(2, 10)}`,
        title: c.title || c.name || "Untitled Course",
        code: c.code,
        instructor: c.instructor || `Department of ${c.category || 'Science'}`,
        thumbnail: thumb,
        videoUrl: c.videoUrl,
        progress: 0,
        totalLessons: c.credits ? c.credits * 10 : 30,
        completedLessons: 0,
        duration: c.duration || (c.credits ? `${c.credits * 4} weeks` : '4 weeks'),
        rating: 4.5,
        status: c.status || 'active',
        difficulty: c.difficulty || 'Intermediate',
        description: c.description || "No description provided.",
        recommendationReason: c.recommendationReason
      };
    });
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

  // Video Watch Timer Logic
  useEffect(() => {
    let timer;
    if (selectedVideo) {
      setCanTakeAssessment(false);
      setVideoWatchProgress(0);

      // We simulate "watching" by requiring 15 seconds of stay in the modal
      // This ensures they at least initiate the learning process
      const totalRequiredSec = 15;
      let elapsed = 0;

      timer = setInterval(() => {
        elapsed += 1;
        const progress = Math.min(100, Math.round((elapsed / totalRequiredSec) * 100));
        setVideoWatchProgress(progress);

        if (elapsed >= totalRequiredSec) {
          setCanTakeAssessment(true);
          clearInterval(timer);
        }
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [selectedVideo]);

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

  const handleAddCourse = async (course) => {
    try {
      const { createCourse } = await import('../api/course.api');
      const payload = {
        title: course.title,
        name: course.name || course.title,
        code: course.code,
        description: course.description,
        credits: course.credits || 3,
        difficulty: course.difficulty,
        category: course.category,
        instructor: course.instructor,
        duration: course.duration,
        videoUrl: course.videoUrl,
        thumbnail: course.thumbnail,
        recommendationReason: course.recommendationReason,
        status: 'active'
      };

      const res = await createCourse(payload);
      if (res.success) {
        setCourses(prev => prev.map(c =>
          c.id === course.id ? { ...c, id: res.data._id, status: 'active' } : c
        ));
        setFilter('ongoing');
      }
    } catch (error) {
      console.error("Failed to add course:", error);
      alert("Failed to add the course to your quests.");
    }
  };

  const filteredCourses = courses.filter(course => {
    if (filter === 'all') return course.status !== 'suggested'; // don't show suggestions in All
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

      <main className="dashboard-main centered-main-layout">
        <div className="centered-content-wrapper">
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
                  <button
                    className={`filter-btn ${filter === 'suggested' ? 'active' : ''}`}
                    onClick={() => setFilter('suggested')}
                  >
                    Discover Recommendations
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
                      {course.recommendationReason && (
                        <div className="course-recommendation">
                          <strong>Why this course?</strong>
                          <p>{course.recommendationReason}</p>
                        </div>
                      )}

                      <div className="course-meta" style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                        <span className="course-difficulty badge" style={{ background: 'rgba(255, 0, 255, 0.15)', color: '#ff00ff', border: '1px solid #ff00ff', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold' }}>
                          Lvl: {course.difficulty}
                        </span>
                        <span className="course-duration badge" style={{ background: 'rgba(0, 255, 204, 0.15)', color: '#00ffcc', border: '1px solid #00ffcc', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold' }}>
                          <FaClock style={{ marginRight: '4px', display: 'inline' }} /> {course.duration}
                        </span>
                        <span className="course-rating" style={{ padding: '4px 8px', fontSize: '12px', fontWeight: 'bold' }}>
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

                      {course.status === 'suggested' ? (
                        <button
                          className="btn-watch-video"
                          style={{ background: 'var(--game-neon-pink)', borderColor: 'var(--game-neon-pink)', color: '#fff' }}
                          onClick={() => handleAddCourse(course)}
                        >
                          <FaStar style={{ fontSize: '12px' }} /> Add to My Courses
                        </button>
                      ) : (
                        <div style={{ display: 'flex', gap: '10px', flexDirection: 'column' }}>
                          <button
                            className="btn-watch-video"
                            onClick={() => {
                              if (course.videoUrl) setSelectedVideo(course);
                              else handleCourseClick(course.id);
                            }}
                          >
                            {course.videoUrl ? (
                              <>
                                <FaPlay style={{ fontSize: '12px' }} /> Watch Video Data
                              </>
                            ) : course.status === 'completed' ? (
                              'Review Data'
                            ) : (
                              <>
                                <FaPlay style={{ fontSize: '12px' }} /> Initiate Sequence
                              </>
                            )}
                          </button>

                          <button
                            className="btn-watch-video"
                            style={{ background: 'transparent', borderColor: '#00ffcc', color: '#00ffcc' }}
                            onClick={() => startFocusMode(course)}
                          >
                            <FaVideo style={{ fontSize: '12px' }} /> Start Focus Study Mode
                          </button>
                        </div>
                      )}
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

      {/* Video Modal Overhead */}
      {selectedVideo && (
        <div className="video-modal-overlay" onClick={() => setSelectedVideo(null)}>
          <div className="video-modal-content" onClick={e => e.stopPropagation()}>
            <button className="close-modal-btn" onClick={() => setSelectedVideo(null)}>×</button>
            <iframe
              width="100%"
              height="400"
              src={getEmbedUrl(selectedVideo.videoUrl)}
              title="YouTube video player"
              frameBorder="0"
              allowFullScreen
            />
            <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div className="watch-progress-container" style={{ flex: 1, marginRight: '20px' }}>
                <div style={{ fontSize: '12px', color: 'var(--game-text-muted)', marginBottom: '4px', display: 'flex', justifyContent: 'space-between' }}>
                  <span>Learning Progress</span>
                  <span>{videoWatchProgress}%</span>
                </div>
                <div style={{ height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{
                    height: '100%',
                    width: `${videoWatchProgress}%`,
                    background: videoWatchProgress === 100 ? '#00ffcc' : 'var(--game-neon-blue)',
                    transition: 'width 1s linear',
                    boxShadow: videoWatchProgress === 100 ? '0 0 10px #00ffcc' : 'none'
                  }}></div>
                </div>
              </div>

              <button
                className={`btn-continue ${!canTakeAssessment ? 'disabled' : ''}`}
                style={{
                  width: 'auto',
                  background: canTakeAssessment ? 'var(--game-neon-blue)' : 'rgba(255,255,255,0.05)',
                  color: canTakeAssessment ? '#000' : 'rgba(255,255,255,0.3)',
                  border: canTakeAssessment ? 'none' : '1px solid rgba(255,255,255,0.1)',
                  cursor: canTakeAssessment ? 'pointer' : 'not-allowed',
                  opacity: canTakeAssessment ? 1 : 0.7
                }}
                disabled={!canTakeAssessment || generatingAssessmentId === selectedVideo.id}
                onClick={async () => {
                  const courseId = selectedVideo.id;
                  const courseTitle = selectedVideo.title;
                  setGeneratingAssessmentId(courseId);
                  try {
                    const { generateCourseAssessment } = await import('../api/course.api');
                    const res = await generateCourseAssessment(courseId);
                    if (res.success) {
                      setSelectedVideo(null);
                      navigate('/assessment-test', { state: { assessment: res.assessment } });
                    }
                  } catch (err) {
                    console.error("Assessment generation failed", err);
                    alert(`Failed to spawn assessment for ${courseTitle}. Please try again later.`);
                  } finally {
                    setGeneratingAssessmentId(null);
                  }
                }}
              >
                {generatingAssessmentId === selectedVideo.id ?
                  <><div className="loader-ring" style={{ width: '16px', height: '16px', margin: '0 8px 0 0', borderWidth: '2px' }} /> CONNECTING TO LLM...</>
                  : canTakeAssessment ? <><FaCheckCircle /> Take Course Assessment</> : `Watch Video to Unlock (${15 - Math.round(videoWatchProgress * 0.15)}s)`
                }
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Courses;