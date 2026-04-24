import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import MentorStudents from '../components/mentor/MentorStudents';
import './Dashboard.css';

const MentorStudentsPage = () => {
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
        title="My Students"
        subtitle="Manage your connected mentees"
      />

      <main className="dashboard-main centered-main-layout">
        <div className="centered-content-wrapper fade-in">
          <MentorStudents />
        </div>
      </main>
    </div>
  );
};

export default MentorStudentsPage;
