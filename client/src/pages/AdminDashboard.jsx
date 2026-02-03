import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { getDashboardAnalytics } from '../api/analytics.api';
import StatCard from '../components/admin/analytics/StatCard';
import UserGrowthChart from '../components/admin/analytics/UserGrowthChart';
import CourseDistributionChart from '../components/admin/analytics/CourseDistributionChart';
import OnboardingFunnelChart from '../components/admin/analytics/OnboardingFunnelChart';
import {
  FaUsers,
  FaUserGraduate,
  FaUserCheck,
  FaGraduationCap
} from 'react-icons/fa';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Verify admin access
  useEffect(() => {
    if (user?.role !== 'admin') {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  // Fetch real analytics
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await getDashboardAnalytics();
        if (response.success) {
          setData(response.data);
        }
      } catch (err) {
        console.error("Failed to load analytics:", err);
        setError("Failed to load dashboard data.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (loading) return <div className="loading-screen">Loading Dashboard...</div>;

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
        subtitle="System Performance & Analytics"
        showSearch={false}
      />

      <main className="dashboard-main">
        <div className="main-content">

          {/* KPI Cards */}
          <div className="stats-grid">
            <StatCard
              title="Total Users"
              value={data?.kpi?.totalUsers || 0}
              icon={<FaUsers />}
              change="+12%"
              changeType="positive"
            />
            <StatCard
              title="Active Students"
              value={data?.kpi?.activeUsers || 0}
              icon={<FaUserGraduate />}
              subtext="Logged in within 30 days"
            />
            <StatCard
              title="Onboarding Rate"
              value={`${data?.kpi?.onboardingRate || 0}%`}
              icon={<FaUserCheck />}
              changeType="neutral"
            />
            <StatCard
              title="Total Courses"
              value={data?.kpi?.totalCourses || 0}
              icon={<FaGraduationCap />}
            />
          </div>

          {/* Charts Row */}
          <div className="charts-grid">
            <div className="chart-wrapper">
              <UserGrowthChart data={data?.charts?.userGrowth || []} />
            </div>
            <div className="chart-wrapper">
              <CourseDistributionChart data={data?.charts?.courseDistribution || []} />
            </div>
            <div className="chart-wrapper">
              <OnboardingFunnelChart data={data?.charts?.onboardingFunnel || []} />
            </div>
          </div>

        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;