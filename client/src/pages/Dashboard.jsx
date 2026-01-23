import { useAuth } from '../context/AuthContext';
import { FaChartLine, FaCalendarAlt, FaRobot, FaUsers, FaSignOutAlt } from 'react-icons/fa';
import './Dashboard.css';

const Dashboard = () => {
  const { user, logout } = useAuth();

  const cards = [
    {
      id: 1,
      title: 'Assessments',
      description: 'Track your academic performance and progress',
      icon: <FaChartLine />,
      color: '#667eea',
    },
    {
      id: 2,
      title: 'Study Planner',
      description: 'Plan and organize your study schedule',
      icon: <FaCalendarAlt />,
      color: '#f093fb',
    },
    {
      id: 3,
      title: 'Advisor Chat',
      description: 'Get AI-powered academic guidance',
      icon: <FaRobot />,
      color: '#4facfe',
    },
    {
      id: 4,
      title: 'Peer Chat',
      description: 'Connect and collaborate with peers',
      icon: <FaUsers />,
      color: '#43e97b',
    },
  ];

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div className="header-content">
          <div>
            <h1 className="welcome-title">Welcome back, {user?.name || 'Student'}!</h1>
            <p className="welcome-subtitle">Here's what you can do today</p>
          </div>
          <button onClick={handleLogout} className="logout-button">
            <FaSignOutAlt />
            <span>Logout</span>
          </button>
        </div>
      </header>

      <main className="dashboard-main">
        <div className="cards-grid">
          {cards.map((card) => (
            <div key={card.id} className="dashboard-card">
              <div className="card-icon" style={{ background: card.color }}>
                {card.icon}
              </div>
              <h3 className="card-title">{card.title}</h3>
              <p className="card-description">{card.description}</p>
              <button className="card-button" style={{ color: card.color }}>
                Open
              </button>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;