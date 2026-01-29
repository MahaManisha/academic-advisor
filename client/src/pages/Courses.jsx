// client/src/pages/Courses.jsx
import { useState } from 'react';
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
  const [courses, setCourses] = useState([
    {
      id: 1,
      title: 'Data Structures and Algorithms',
      instructor: 'Dr. Smith Johnson',
      progress: 75,
      totalLessons: 24,
      completedLessons: 18,
      duration: '8 weeks',
      rating: 4.8,
      status: 'ongoing',
      thumbnail: null,
      description: 'Master the fundamentals of data structures and algorithms'
    },
    {
      id: 2,
      title: 'Database Management Systems',
      instructor: 'Prof. Emily Chen',
      progress: 100,
      totalLessons: 20,
      completedLessons: 20,
      duration: '6 weeks',
      rating: 4.9,
      status: 'completed',
      thumbnail: null,
      description: 'Comprehensive guide to database design and management'
    },
    {
      id: 3,
      title: 'Web Development Fundamentals',
      instructor: 'John Davis',
      progress: 45,
      totalLessons: 30,
      completedLessons: 14,
      duration: '10 weeks',
      rating: 4.7,
      status: 'ongoing',
      thumbnail: null,
      description: 'Learn HTML, CSS, JavaScript and modern web development'
    },
    {
      id: 4,
      title: 'Machine Learning Basics',
      instructor: 'Dr. Sarah Wilson',
      progress: 20,
      totalLessons: 28,
      completedLessons: 6,
      duration: '12 weeks',
      rating: 4.9,
      status: 'ongoing',
      thumbnail: null,
      description: 'Introduction to machine learning algorithms and applications'
    }
  ]);

  const filteredCourses = courses.filter(course => {
    if (filter === 'all') return true;
    return course.status === filter;
  });

  const stats = {
    total: courses.length,
    ongoing: courses.filter(c => c.status === 'ongoing').length,
    completed: courses.filter(c => c.status === 'completed').length,
    avgProgress: Math.round(courses.reduce((acc, c) => acc + c.progress, 0) / courses.length)
  };

  const handleCourseClick = (courseId) => {
    // Navigate to course detail page
    console.log('Navigate to course:', courseId);
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
        title="My Courses"
        subtitle="Track your learning progress"
      />

      <main className="dashboard-main">
        <div className="main-content">
          {/* Stats */}
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-header">
                <div className="stat-icon" style={{ background: '#667eea' }}>
                  <FaBook />
                </div>
              </div>
              <div className="stat-label">Total Courses</div>
              <div className="stat-value">{stats.total}</div>
            </div>

            <div className="stat-card">
              <div className="stat-header">
                <div className="stat-icon" style={{ background: '#f59e0b' }}>
                  <FaClock />
                </div>
              </div>
              <div className="stat-label">Ongoing</div>
              <div className="stat-value">{stats.ongoing}</div>
            </div>

            <div className="stat-card">
              <div className="stat-header">
                <div className="stat-icon" style={{ background: '#10b981' }}>
                  <FaCheckCircle />
                </div>
              </div>
              <div className="stat-label">Completed</div>
              <div className="stat-value">{stats.completed}</div>
            </div>

            <div className="stat-card">
              <div className="stat-header">
                <div className="stat-icon" style={{ background: '#ef4444' }}>
                  <FaChartLine />
                </div>
              </div>
              <div className="stat-label">Avg Progress</div>
              <div className="stat-value">{stats.avgProgress}%</div>
            </div>
          </div>

          {/* Filter */}
          <div className="courses-filter">
            <button
              className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
              onClick={() => setFilter('all')}
            >
              All Courses
            </button>
            <button
              className={`filter-btn ${filter === 'ongoing' ? 'active' : ''}`}
              onClick={() => setFilter('ongoing')}
            >
              Ongoing
            </button>
            <button
              className={`filter-btn ${filter === 'completed' ? 'active' : ''}`}
              onClick={() => setFilter('completed')}
            >
              Completed
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
                  {course.status === 'completed' && (
                    <div className="completed-badge">
                      <FaCheckCircle /> Completed
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
                    <span className="course-duration">
                      <FaClock /> {course.duration}
                    </span>
                    <span className="course-rating">
                      <FaStar /> {course.rating}
                    </span>
                  </div>

                  <div className="course-progress-section">
                    <div className="progress-header">
                      <span className="progress-label">Progress</span>
                      <span className="progress-percentage">{course.progress}%</span>
                    </div>
                    <div className="progress-bar">
                      <div
                        className="progress-fill"
                        style={{ width: `${course.progress}%` }}
                      />
                    </div>
                    <div className="progress-lessons">
                      {course.completedLessons}/{course.totalLessons} lessons completed
                    </div>
                  </div>

                  <button
                    className="btn-continue"
                    onClick={() => handleCourseClick(course.id)}
                  >
                    {course.status === 'completed' ? (
                      'Review Course'
                    ) : (
                      <>
                        <FaPlay /> Continue Learning
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {filteredCourses.length === 0 && (
            <div className="empty-state">
              <FaBook className="empty-icon" />
              <h3>No courses found</h3>
              <p>Try changing your filter or enroll in a new course!</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Courses;