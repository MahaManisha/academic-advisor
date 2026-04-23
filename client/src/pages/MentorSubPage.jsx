import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import './Dashboard.css';

const MentorSubPage = ({ title, subtitle, icon }) => {
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    window.location.href = '/login';
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
        title={title}
        subtitle={subtitle}
      />

      <main className="dashboard-main centered-main-layout">
        <div className="centered-content-wrapper fade-in">
          <div className="content-section" style={{ background: 'white', padding: '40px', borderRadius: '16px', textAlign: 'center', color: '#6b7280' }}>
            <div style={{ fontSize: '48px', marginBottom: '20px', color: '#e5e7eb' }}>{icon}</div>
            <h2>{title}</h2>
            <p>This module is currently under development. Stay tuned for updates!</p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default MentorSubPage;
