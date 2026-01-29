// client/src/pages/AdminDashboard.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import {
  FaUsers,
  FaChartLine,
  FaBook,
  FaUserGraduate,
  FaClipboardList,
  FaTrophy,
  FaExclamationTriangle,
  FaCheckCircle,
  FaArrowUp,
  FaArrowDown,
  FaEdit,
  FaTrash,
  FaPlus,
  FaEye,
  FaDownload,
  FaFilter,
  FaSearch,
  FaClock,
  FaGraduationCap
} from 'react-icons/fa';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  // Verify admin access on mount
  useEffect(() => {
    if (user?.role !== 'admin' && user?.email !== 'admin@gmail.com') {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  // Mock statistics
  const [stats, setStats] = useState({
    totalStudents: 156,
    activeStudents: 142,
    totalAssessments: 48,
    averageScore: 78.5,
    completionRate: 85.2,
    newStudentsThisWeek: 12,
    pendingReviews: 8,
    totalCourses: 24
  });

  // Mock students data - Extended with more realistic data
  const [students, setStudents] = useState([
    {
      id: 1,
      name: 'John Doe',
      email: 'john@example.com',
      course: 'Computer Science',
      year: 'Third Year',
      gpa: 3.8,
      assessments: 12,
      completedAssessments: 10,
      status: 'active',
      enrollDate: '2023-09-01',
      lastActive: '2026-01-27',
      phone: '+1 (555) 123-4567',
      studentId: 'CS2023-001'
    },
    {
      id: 2,
      name: 'Jane Smith',
      email: 'jane@example.com',
      course: 'Information Technology',
      year: 'Second Year',
      gpa: 3.6,
      assessments: 10,
      completedAssessments: 9,
      status: 'active',
      enrollDate: '2024-09-01',
      lastActive: '2026-01-28',
      phone: '+1 (555) 234-5678',
      studentId: 'IT2024-002'
    },
    {
      id: 3,
      name: 'Mike Johnson',
      email: 'mike@example.com',
      course: 'Business Administration',
      year: 'First Year',
      gpa: 3.4,
      assessments: 5,
      completedAssessments: 3,
      status: 'inactive',
      enrollDate: '2025-09-01',
      lastActive: '2026-01-15',
      phone: '+1 (555) 345-6789',
      studentId: 'BA2025-003'
    },
    {
      id: 4,
      name: 'Sarah Williams',
      email: 'sarah@example.com',
      course: 'Computer Science',
      year: 'Fourth Year',
      gpa: 3.9,
      assessments: 15,
      completedAssessments: 15,
      status: 'active',
      enrollDate: '2022-09-01',
      lastActive: '2026-01-28',
      phone: '+1 (555) 456-7890',
      studentId: 'CS2022-004'
    },
    {
      id: 5,
      name: 'David Brown',
      email: 'david@example.com',
      course: 'Information Technology',
      year: 'Third Year',
      gpa: 3.7,
      assessments: 11,
      completedAssessments: 8,
      status: 'active',
      enrollDate: '2023-09-01',
      lastActive: '2026-01-27',
      phone: '+1 (555) 567-8901',
      studentId: 'IT2023-005'
    },
    {
      id: 6,
      name: 'Emily Davis',
      email: 'emily@example.com',
      course: 'Mechanical Engineering',
      year: 'Second Year',
      gpa: 3.5,
      assessments: 8,
      completedAssessments: 6,
      status: 'active',
      enrollDate: '2024-09-01',
      lastActive: '2026-01-26',
      phone: '+1 (555) 678-9012',
      studentId: 'ME2024-006'
    }
  ]);

  // Mock assessments data
  const [assessments, setAssessments] = useState([
    {
      id: 1,
      title: 'Data Structures Fundamentals',
      subject: 'Computer Science',
      questions: 25,
      participants: 45,
      averageScore: 76,
      createdAt: '2025-01-15',
      difficulty: 'Medium',
      duration: '60 mins',
      passingScore: 70
    },
    {
      id: 2,
      title: 'Database Management Systems',
      subject: 'Information Technology',
      questions: 30,
      participants: 38,
      averageScore: 82,
      createdAt: '2025-01-20',
      difficulty: 'Hard',
      duration: '90 mins',
      passingScore: 75
    },
    {
      id: 3,
      title: 'Web Development Basics',
      subject: 'Web Technologies',
      questions: 20,
      participants: 52,
      averageScore: 85,
      createdAt: '2025-01-10',
      difficulty: 'Easy',
      duration: '45 mins',
      passingScore: 60
    },
    {
      id: 4,
      title: 'Machine Learning Introduction',
      subject: 'Computer Science',
      questions: 35,
      participants: 28,
      averageScore: 71,
      createdAt: '2025-01-22',
      difficulty: 'Hard',
      duration: '120 mins',
      passingScore: 70
    }
  ]);

  // Recent activities
  const [recentActivities] = useState([
    {
      id: 1,
      type: 'success',
      icon: <FaCheckCircle />,
      text: '12 new students registered this week',
      time: '2 hours ago'
    },
    {
      id: 2,
      type: 'warning',
      icon: <FaExclamationTriangle />,
      text: '5 students need academic intervention',
      time: '5 hours ago'
    },
    {
      id: 3,
      type: 'achievement',
      icon: <FaTrophy />,
      text: '3 students achieved perfect scores',
      time: '1 day ago'
    },
    {
      id: 4,
      type: 'success',
      icon: <FaCheckCircle />,
      text: 'New assessment "Python Basics" created',
      time: '2 days ago'
    }
  ]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleDeleteStudent = (id) => {
    if (window.confirm('Are you sure you want to delete this student?')) {
      setStudents(students.filter(s => s.id !== id));
      setStats({
        ...stats,
        totalStudents: stats.totalStudents - 1
      });
    }
  };

  const handleDeleteAssessment = (id) => {
    if (window.confirm('Are you sure you want to delete this assessment?')) {
      setAssessments(assessments.filter(a => a.id !== id));
    }
  };

  const handleViewStudent = (student) => {
    alert(`Viewing details for: ${student.name}\n\nStudent ID: ${student.studentId}\nEmail: ${student.email}\nGPA: ${student.gpa}\nStatus: ${student.status}`);
  };

  const handleEditStudent = (student) => {
    alert(`Edit functionality for ${student.name} - To be implemented with a modal form`);
  };

  const handleAddStudent = () => {
    alert('Add Student Modal - To be implemented');
  };

  const handleAddAssessment = () => {
    alert('Add Assessment Modal - To be implemented');
  };

  const handleExportData = () => {
    alert('Exporting student data as CSV...');
  };

  // Filter students based on search and status
  const filteredStudents = students.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         student.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         student.studentId.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || student.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  // Quick stats for dashboard
  const quickStats = [
    {
      id: 1,
      label: 'Total Students',
      value: stats.totalStudents,
      change: '+12',
      trend: 'up',
      icon: <FaUsers />,
      color: '#667eea'
    },
    {
      id: 2,
      label: 'Active Students',
      value: stats.activeStudents,
      change: '+8',
      trend: 'up',
      icon: <FaUserGraduate />,
      color: '#10b981'
    },
    {
      id: 3,
      label: 'Total Assessments',
      value: stats.totalAssessments,
      change: '+5',
      trend: 'up',
      icon: <FaClipboardList />,
      color: '#f59e0b'
    },
    {
      id: 4,
      label: 'Avg Score',
      value: stats.averageScore + '%',
      change: '+2.5%',
      trend: 'up',
      icon: <FaChartLine />,
      color: '#ef4444'
    }
  ];

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
        title="Admin Dashboard"
        subtitle="Manage your academic platform"
        showSearch={true}
      />

      <main className="dashboard-main">
        <div className="main-content">
          {/* Quick Stats Grid */}
          <div className="stats-grid">
            {quickStats.map((stat) => (
              <div key={stat.id} className="stat-card">
                <div className="stat-header">
                  <div className="stat-icon" style={{ background: stat.color }}>
                    {stat.icon}
                  </div>
                  <div className={`stat-trend ${stat.trend === 'up' ? 'positive' : 'negative'}`}>
                    {stat.trend === 'up' ? <FaArrowUp /> : <FaArrowDown />}
                    {stat.change}
                  </div>
                </div>
                <div className="stat-label">{stat.label}</div>
                <div className="stat-value">{stat.value}</div>
              </div>
            ))}
          </div>

          {/* Tabs */}
          <div className="admin-tabs">
            <button
              className={`tab-button ${activeTab === 'overview' ? 'active' : ''}`}
              onClick={() => setActiveTab('overview')}
            >
              <FaChartLine /> Overview
            </button>
            <button
              className={`tab-button ${activeTab === 'students' ? 'active' : ''}`}
              onClick={() => setActiveTab('students')}
            >
              <FaUsers /> Students
            </button>
            <button
              className={`tab-button ${activeTab === 'assessments' ? 'active' : ''}`}
              onClick={() => setActiveTab('assessments')}
            >
              <FaClipboardList /> Assessments
            </button>
            <button
              className={`tab-button ${activeTab === 'analytics' ? 'active' : ''}`}
              onClick={() => setActiveTab('analytics')}
            >
              <FaChartLine /> Analytics
            </button>
          </div>

          {/* Tab Content */}
          {activeTab === 'overview' && (
            <div className="tab-content">
              <div className="content-section">
                <h3 className="section-title">Recent Activities</h3>
                <div className="activity-list">
                  {recentActivities.map((activity) => (
                    <div key={activity.id} className="activity-item">
                      <div className={`activity-icon ${activity.type}`}>
                        {activity.icon}
                      </div>
                      <div className="activity-content">
                        <p className="activity-text">{activity.text}</p>
                        <span className="activity-time">{activity.time}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Overview Cards */}
              <div className="overview-cards">
                <div className="overview-card">
                  <div className="overview-card-header">
                    <FaGraduationCap className="overview-icon" style={{ color: '#667eea' }} />
                    <h4>Student Performance</h4>
                  </div>
                  <div className="overview-card-body">
                    <div className="overview-stat">
                      <span className="overview-label">Average GPA</span>
                      <span className="overview-value">3.68</span>
                    </div>
                    <div className="overview-stat">
                      <span className="overview-label">Top Performers</span>
                      <span className="overview-value">23</span>
                    </div>
                    <div className="overview-stat">
                      <span className="overview-label">Need Support</span>
                      <span className="overview-value">5</span>
                    </div>
                  </div>
                </div>

                <div className="overview-card">
                  <div className="overview-card-header">
                    <FaClipboardList className="overview-icon" style={{ color: '#10b981' }} />
                    <h4>Assessment Status</h4>
                  </div>
                  <div className="overview-card-body">
                    <div className="overview-stat">
                      <span className="overview-label">Completion Rate</span>
                      <span className="overview-value">{stats.completionRate}%</span>
                    </div>
                    <div className="overview-stat">
                      <span className="overview-label">Pending Reviews</span>
                      <span className="overview-value">{stats.pendingReviews}</span>
                    </div>
                    <div className="overview-stat">
                      <span className="overview-label">Average Score</span>
                      <span className="overview-value">{stats.averageScore}%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'students' && (
            <div className="tab-content">
              <div className="content-section">
                <div className="section-header">
                  <h3 className="section-title">Student Management</h3>
                  <div className="section-actions">
                    <button className="btn-secondary" onClick={handleExportData}>
                      <FaDownload /> Export
                    </button>
                    <button className="btn-primary" onClick={handleAddStudent}>
                      <FaPlus /> Add Student
                    </button>
                  </div>
                </div>

                {/* Search and Filter Bar */}
                <div className="table-controls">
                  <div className="search-box">
                    <FaSearch className="search-icon" />
                    <input
                      type="text"
                      placeholder="Search by name, email, or student ID..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="search-input"
                    />
                  </div>
                  <div className="filter-box">
                    <FaFilter className="filter-icon" />
                    <select
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                      className="filter-select"
                    >
                      <option value="all">All Status</option>
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                </div>

                <div className="table-container">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Student ID</th>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Course</th>
                        <th>Year</th>
                        <th>GPA</th>
                        <th>Assessments</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredStudents.length > 0 ? (
                        filteredStudents.map((student) => (
                          <tr key={student.id}>
                            <td className="student-id">{student.studentId}</td>
                            <td className="student-name">{student.name}</td>
                            <td>{student.email}</td>
                            <td>{student.course}</td>
                            <td>{student.year}</td>
                            <td className="gpa-cell">
                              <span className={`gpa-badge ${student.gpa >= 3.5 ? 'high' : student.gpa >= 3.0 ? 'medium' : 'low'}`}>
                                {student.gpa.toFixed(2)}
                              </span>
                            </td>
                            <td>
                              <span className="assessment-count">
                                {student.completedAssessments}/{student.assessments}
                              </span>
                            </td>
                            <td>
                              <span className={`status-badge ${student.status}`}>
                                {student.status}
                              </span>
                            </td>
                            <td>
                              <div className="action-buttons">
                                <button 
                                  className="btn-icon view"
                                  onClick={() => handleViewStudent(student)}
                                  title="View Details"
                                >
                                  <FaEye />
                                </button>
                                <button 
                                  className="btn-icon edit"
                                  onClick={() => handleEditStudent(student)}
                                  title="Edit Student"
                                >
                                  <FaEdit />
                                </button>
                                <button
                                  className="btn-icon delete"
                                  onClick={() => handleDeleteStudent(student.id)}
                                  title="Delete Student"
                                >
                                  <FaTrash />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="9" className="no-data">
                            No students found matching your criteria
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Pagination (if needed) */}
                <div className="table-footer">
                  <p className="results-count">
                    Showing {filteredStudents.length} of {students.length} students
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'assessments' && (
            <div className="tab-content">
              <div className="content-section">
                <div className="section-header">
                  <h3 className="section-title">Assessment Management</h3>
                  <button className="btn-primary" onClick={handleAddAssessment}>
                    <FaPlus /> Create Assessment
                  </button>
                </div>

                <div className="table-container">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Title</th>
                        <th>Subject</th>
                        <th>Questions</th>
                        <th>Duration</th>
                        <th>Difficulty</th>
                        <th>Participants</th>
                        <th>Avg Score</th>
                        <th>Created</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {assessments.map((assessment) => (
                        <tr key={assessment.id}>
                          <td className="assessment-title">{assessment.title}</td>
                          <td>{assessment.subject}</td>
                          <td>{assessment.questions}</td>
                          <td>
                            <span className="duration-badge">
                              <FaClock /> {assessment.duration}
                            </span>
                          </td>
                          <td>
                            <span className={`difficulty-badge ${assessment.difficulty.toLowerCase()}`}>
                              {assessment.difficulty}
                            </span>
                          </td>
                          <td>{assessment.participants}</td>
                          <td>
                            <span className={`score-badge ${assessment.averageScore >= 80 ? 'high' : assessment.averageScore >= 60 ? 'medium' : 'low'}`}>
                              {assessment.averageScore}%
                            </span>
                          </td>
                          <td>{new Date(assessment.createdAt).toLocaleDateString()}</td>
                          <td>
                            <div className="action-buttons">
                              <button className="btn-icon edit">
                                <FaEdit />
                              </button>
                              <button
                                className="btn-icon delete"
                                onClick={() => handleDeleteAssessment(assessment.id)}
                              >
                                <FaTrash />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'analytics' && (
            <div className="tab-content">
              <div className="content-section">
                <h3 className="section-title">Platform Analytics</h3>
                
                <div className="analytics-grid">
                  <div className="analytics-card">
                    <h4>Completion Rate</h4>
                    <div className="analytics-value">{stats.completionRate}%</div>
                    <p className="analytics-label">Average course completion</p>
                  </div>
                  
                  <div className="analytics-card">
                    <h4>Student Engagement</h4>
                    <div className="analytics-value">91%</div>
                    <p className="analytics-label">Active participation rate</p>
                  </div>
                  
                  <div className="analytics-card">
                    <h4>Assessment Pass Rate</h4>
                    <div className="analytics-value">87%</div>
                    <p className="analytics-label">Students passing assessments</p>
                  </div>

                  <div className="analytics-card">
                    <h4>Average Study Time</h4>
                    <div className="analytics-value">4.5h</div>
                    <p className="analytics-label">Per student per week</p>
                  </div>

                  <div className="analytics-card">
                    <h4>Total Courses</h4>
                    <div className="analytics-value">{stats.totalCourses}</div>
                    <p className="analytics-label">Available courses</p>
                  </div>

                  <div className="analytics-card">
                    <h4>Peer Interactions</h4>
                    <div className="analytics-value">1,234</div>
                    <p className="analytics-label">Total peer chat messages</p>
                  </div>
                </div>

                {/* Performance Chart Placeholder */}
                <div className="chart-container">
                  <h4 className="chart-title">Student Performance Trend</h4>
                  <div className="chart-placeholder">
                    <FaChartLine style={{ fontSize: '64px', color: '#d1d5db' }} />
                    <p>Chart visualization will be implemented with Chart.js or Recharts</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;