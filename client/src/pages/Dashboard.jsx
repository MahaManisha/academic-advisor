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
  FaPlus,
  FaMedal
} from 'react-icons/fa';
import { FaVideo } from 'react-icons/fa';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';
import { useGamification } from '../context/GamificationContext';
import { useFocus } from '../context/FocusContext';
import { AvatarCard } from '../components/gamification/AvatarCard';
import './Dashboard.css';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const { badges, triggerAction } = useGamification();
  const { startFocusMode } = useFocus();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Fallback radar chart data
  const radarData = user?.strengths?.map(s => ({ subject: s, value: 90, fullMark: 100 })) || [];
  const weakData = user?.weaknesses?.map(w => ({ subject: w, value: 40, fullMark: 100 })) || [];
  const skillData = [...radarData, ...weakData];

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
      title: 'Missions / Quests',
      description: 'Track your academic performance and progress',
      icon: <FaChartLine />,
      color: '#00ffcc',
      rgb: '0, 255, 204',
      stats: userStats.assessmentsPending > 0
        ? `${userStats.assessmentsPending} pending`
        : 'No quests yet',
      path: '/assessments',
    },
    {
      id: 2,
      title: 'Strategy Guide',
      description: 'Plan and organize your study schedule',
      icon: <FaCalendarAlt />,
      color: '#ff00ff',
      rgb: '255, 0, 255',
      stats: userStats.upcomingDeadlines > 0
        ? `${userStats.upcomingDeadlines} upcoming deadlines`
        : 'No tasks scheduled',
      path: '/planner',
    },
    {
      id: 3,
      title: 'AI Companion',
      description: 'Get personalized academic guidance',
      icon: <FaRobot />,
      color: '#4facfe',
      rgb: '79, 172, 254',
      stats: 'Available 24/7',
      path: '/advisor-chat',
    },
    {
      id: 4,
      title: 'Guild / Co-op',
      description: 'Connect and collaborate with peers',
      icon: <FaUsers />,
      color: '#00ff66',
      rgb: '0, 255, 102',
      stats: 'Connect with peers',
      path: '/peer-chat',
    },
    {
      id: 5,
      title: 'Focus Studio',
      description: 'AI-monitored deep work session',
      icon: <FaVideo />,
      color: '#ff3366',
      rgb: '255, 51, 102',
      stats: 'Earn XP for focusing',
      path: '#focus',
    },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleCardClick = (path) => {
    if (path === '#focus') {
      startFocusMode({ id: null, title: 'Deep Work Session' });
    } else {
      navigate(path);
    }
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
        title={`Welcome back, ${(user?.fullName || user?.name)?.split(' ')[0] || 'Student'}!`}
        subtitle="Here's your academic overview"
        notificationCount={userStats.upcomingDeadlines}
      />

      <main className="dashboard-main centered-main-layout">
        <div className="centered-content-wrapper">
          {/* Welcome Banner */}
          <div className="welcome-banner" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' }}>
            <div className="welcome-banner-content" style={{ flex: 1, minWidth: 250 }}>
              <h2 className="welcome-banner-title">
                🕹️ Player Hub: Welcome {(user?.fullName || user?.name)?.split(' ')[0] || 'Student'}!
              </h2>
              <div className="personalization-tags" style={{ display: 'flex', gap: '12px', margin: '12px 0' }}>
                {user?.focus && (
                  <span>
                    🎯 Class/Focus: {user.focus.charAt(0).toUpperCase() + user.focus.slice(1)}
                  </span>
                )}
                {user?.learningMode && (
                  <span>
                    🧠 Playstyle: {user.learningMode.charAt(0).toUpperCase() + user.learningMode.slice(1)}
                  </span>
                )}
              </div>
              <p className="welcome-banner-text">
                Your mission parameters are set for <strong>{user?.course || user?.standard || 'General'}</strong>.
                Ready to level up your {user?.focus || 'academic'} stats?
              </p>
            </div>
            <div style={{ minWidth: 300, padding: 10 }}>
              <AvatarCard />
            </div>
          </div>

          {/* Stats Grid - ONLY show if user has activity */}
          {!isNewUser ? (
            <div className="stats-grid">
              {quickStats.map((stat) => (
                <div key={stat.id} className="stat-card" style={{ "--stat-color": stat.color }}>
                  <div className="stat-header">
                    <div className="stat-icon" style={{ background: `linear-gradient(135deg, ${stat.color} 0%, rgba(0,0,0,0.5) 100%)`, border: `1px solid ${stat.color}` }}>
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
                    <span>
                      {stat.unit}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="new-user-banner">
              <div className="banner-icon"><FaFire style={{ color: '#f59e0b' }} /></div>
              <div>
                <h3>Start Your Streak Today!</h3>
                <p>Complete your first lesson or assessment to see your stats here.</p>
              </div>
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginTop: '24px' }}>
            {/* Achievement Showcase */}
            <div className="content-section" style={{ background: 'white', padding: '20px', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
              <div className="section-header">
                <h2 className="section-title"><FaMedal style={{ color: '#f59e0b', marginRight: 8 }} /> Achievements</h2>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                {badges.length > 0 ? badges.map(b => (
                  <div key={b} className="g-glass-card" style={{ padding: '8px 16px', fontSize: '14px', border: '1px solid #4facfe', color: '#1a202c', fontWeight: 'bold' }}>
                    {b}
                  </div>
                )) : <p style={{ color: '#6b7280' }}>No achievements yet. Keep learning!</p>}
              </div>
            </div>

            {/* Progress Summary Card & Radar */}
            <div className="content-section" style={{ background: 'white', padding: '20px', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
              <div className="section-header">
                <h2 className="section-title">Knowledge Radar</h2>
              </div>
              {skillData.length > 0 ? (
                <div style={{ width: '100%', height: 250 }}>
                  <ResponsiveContainer>
                    <RadarChart data={skillData}>
                      <PolarGrid />
                      <PolarAngleAxis dataKey="subject" />
                      <PolarRadiusAxis angle={30} domain={[0, 100]} />
                      <Radar name="Skills" dataKey="value" stroke="#4facfe" fill="#4facfe" fillOpacity={0.6} />
                    </RadarChart>
                  </ResponsiveContainer>
                  <div style={{ marginTop: 10, fontSize: 14 }}>
                    <strong>Strong:</strong> {user.strengths.join(', ')} <br />
                    <strong>Needs Work:</strong> {user.weaknesses.join(', ')}
                  </div>
                </div>
              ) : (
                <p style={{ color: '#6b7280' }}>Complete an assessment to unlock your radar chart.</p>
              )}
            </div>
          </div>

          <div className="content-section" style={{ marginTop: '24px', background: 'transparent !important', border: 'none', boxShadow: 'none' }}>
            <div className="section-header">
              <h2 className="section-title">Mission Control / Tools</h2>
            </div>
            <div className="cards-grid">
              {cards.map((card) => (
                <div key={card.id} className="dashboard-card" onClick={() => handleCardClick(card.path)} style={{ "--card-color": card.color, "--card-rgb": card.rgb }}>
                  <div className="card-header">
                    <div className="card-icon" style={{ background: `linear-gradient(135deg, ${card.color} 0%, rgba(0,0,0,0.5) 100%)`, border: `1px solid ${card.color}` }}>
                      {card.icon}
                    </div>
                    <div className="card-header-text">
                      <h3 className="card-title">{card.title}</h3>
                      <p className="card-description">{card.description}</p>
                    </div>
                  </div>
                  <div className="card-content">
                    <div className="card-stat" style={{
                      color: card.stats.includes('yet') || card.stats.includes('scheduled') ? '#8b949e' : card.color,
                      fontSize: '14px',
                      fontWeight: 600
                    }}>
                      {card.stats}
                    </div>
                  </div>
                  <div className="card-footer">
                    <button
                      className="card-button primary"
                    >
                      {card.stats.includes('yet') || card.stats.includes('scheduled') ? (
                        <>
                          <FaPlus style={{ marginRight: '6px' }} /> Accept Quest
                        </>
                      ) : (
                        'Open Interface'
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