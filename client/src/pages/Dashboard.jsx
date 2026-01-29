// client/src/pages/Dashboard.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { 
  FaChartLine, 
  FaCalendarAlt, 
  FaRobot, 
  FaUsers,
  FaFire,
  FaClock,
  FaTasks,
  FaArrowUp,
  FaPlus
} from 'react-icons/fa';
import './Dashboard.css';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Use actual user data - all stats start at 0 for new users
  const userStats = {
    assessmentsCompleted: user?.completedAssessments || 0,
    assessmentsPending: user?.pendingAssessments || 0,
    studyHoursWeek: user?.studyHoursWeek || 0,
    studyStreak: user?.studyStreak || 0,
    upcomingDeadlines: user?.upcomingDeadlines || 0,
  };

  // Check if user is new (no activity yet)
  const isNewUser = userStats.assessmentsCompleted === 0 && 
                    userStats.studyHoursWeek === 0 && 
                    userStats.studyStreak === 0;

  const quickStats = [
    {
      id: 1,
      label: 'Study Streak',
      value: userStats.studyStreak,
      unit: 'days',
      icon: <FaFire />,
      color: '#f59e0b',
      trend: userStats.studyStreak > 0 ? '+2' : '',
      trendPositive: true,
    },
    {
      id: 2,
      label: 'Hours This Week',
      value: userStats.studyHoursWeek,
      unit: 'hrs',
      icon: <FaClock />,
      color: '#667eea',
      trend: userStats.studyHoursWeek > 0 ? '+5' : '',
      trendPositive: true,
    },
    {
      id: 3,
      label: 'Completed',
      value: userStats.assessmentsCompleted,
      unit: 'tasks',
      icon: <FaTasks />,
      color: '#10b981',
      trend: userStats.assessmentsCompleted > 0 ? '+3' : '',
      trendPositive: true,
    },
    {
      id: 4,
      label: 'Upcoming',
      value: userStats.upcomingDeadlines,
      unit: 'due',
      icon: <FaCalendarAlt />,
      color: '#ef4444',
      trend: '',
      trendPositive: false,
    },
  ];

  const cards = [
    {
      id: 1,
      title: 'Assessments',
      description: 'Track your academic performance and progress',
      icon: <FaChartLine />,
      color: '#667eea',
      stats: userStats.assessmentsPending > 0 
        ? `${userStats.assessmentsPending} pending` 
        : 'No assessments yet',
      path: '/assessments',
    },
    {
      id: 2,
      title: 'Study Planner',
      description: 'Plan and organize your study schedule',
      icon: <FaCalendarAlt />,
      color: '#f093fb',
      stats: userStats.upcomingDeadlines > 0 
        ? `${userStats.upcomingDeadlines} upcoming deadlines` 
        : 'No tasks scheduled',
      path: '/planner',
    },
    {
      id: 3,
      title: 'AI Advisor',
      description: 'Get personalized academic guidance',
      icon: <FaRobot />,
      color: '#4facfe',
      stats: 'Available 24/7',
      path: '/advisor-chat',
    },
    {
      id: 4,
      title: 'Peer Chat',
      description: 'Connect and collaborate with peers',
      icon: <FaUsers />,
      color: '#43e97b',
      stats: 'Connect with peers',
      path: '/peer-chat',
    },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleCardClick = (path) => {
    navigate(path);
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
        title={`Welcome back, ${user?.name?.split(' ')[0] || 'Student'}!`}
        subtitle="Here's your academic overview"
        notificationCount={userStats.upcomingDeadlines}
      />

      <main className="dashboard-main">
        <div className="main-content">
          {/* Welcome Message for New Users */}
          {isNewUser && (
            <div className="welcome-banner">
              <div className="welcome-banner-content">
                <h2 className="welcome-banner-title">
                  🎉 Welcome to Academic Advisor, {user?.name?.split(' ')[0]}!
                </h2>
                <p className="welcome-banner-text">
                  Get started by exploring your tools below. Add assessments, create study plans, 
                  or chat with your AI advisor to begin your academic journey!
                </p>
              </div>
            </div>
          )}

          <div className="stats-grid">
            {quickStats.map((stat) => (
              <div key={stat.id} className="stat-card">
                <div className="stat-header">
                  <div className="stat-icon" style={{ background: stat.color }}>
                    {stat.icon}
                  </div>
                  {stat.trend && (
                    <div className={`stat-trend ${stat.trendPositive ? 'positive' : 'negative'}`}>
                      <FaArrowUp />
                      {stat.trend}
                    </div>
                  )}
                </div>
                <div className="stat-label">{stat.label}</div>
                <div className="stat-value">
                  {stat.value}
                  <span style={{ fontSize: '16px', fontWeight: 500, marginLeft: '4px', color: '#6b7280' }}>
                    {stat.unit}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="content-section">
            <div className="section-header">
              <h2 className="section-title">Your Tools</h2>
            </div>
            <div className="cards-grid">
              {cards.map((card) => (
                <div key={card.id} className="dashboard-card" onClick={() => handleCardClick(card.path)}>
                  <div className="card-header">
                    <div className="card-icon" style={{ background: card.color }}>
                      {card.icon}
                    </div>
                    <div className="card-header-text">
                      <h3 className="card-title">{card.title}</h3>
                      <p className="card-description">{card.description}</p>
                    </div>
                  </div>
                  <div className="card-content">
                    <div className="card-stat" style={{ 
                      color: card.stats.includes('yet') || card.stats.includes('scheduled') ? '#6b7280' : card.color, 
                      fontSize: '14px', 
                      fontWeight: 600 
                    }}>
                      {card.stats}
                    </div>
                  </div>
                  <div className="card-footer">
                    <button 
                      className="card-button primary" 
                      style={{ background: card.color, borderColor: card.color }}
                    >
                      {card.stats.includes('yet') || card.stats.includes('scheduled') ? (
                        <>
                          <FaPlus style={{ marginRight: '6px' }} /> Get Started
                        </>
                      ) : (
                        'Open'
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;