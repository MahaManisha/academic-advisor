import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import StudentRequests from '../components/mentor/StudentRequests';
import api from '../api/axios';
import './Dashboard.css';

const MentorRequestsPage = () => {
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchRequests = async () => {
    try {
      const response = await api.get('/mentor/requests');
      if (response.data.success) {
        setRequests(response.data.requests);
      }
    } catch (err) {
      console.error("Failed to fetch requests:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

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
        title="Student Requests"
        subtitle="Manage your incoming mentorship applications"
      />

      <main className="dashboard-main centered-main-layout">
        <div className="centered-content-wrapper fade-in">
          {loading ? (
            <div className="loading-spinner">Loading requests...</div>
          ) : (
            <StudentRequests 
              requests={requests} 
              setRequests={setRequests} 
              refreshStats={fetchRequests} 
            />
          )}
        </div>
      </main>
    </div>
  );
};

export default MentorRequestsPage;
