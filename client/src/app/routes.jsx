import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import AdminRoute from './AdminRoute';

// Public Pages
import Home from '../pages/Home';  // ✅ NEW
import Login from '../pages/Login';
import Register from '../pages/Register';

// Onboarding & Assessment
import Onboarding from '../pages/Onboarding';
import AssessmentTest from '../pages/AssessmentTest';

// Main Pages
import Dashboard from '../pages/Dashboard';
import Profile from '../pages/Profile';
import AdminDashboard from '../pages/AdminDashboard';

// Feature Pages
import Assessments from '../pages/Assessments';
import StudyPlanner from '../pages/StudyPlanner';
import AdvisorChat from '../pages/AdvisorChat';
import PeerChat from '../pages/PeerChat';
import Courses from '../pages/Courses';
import Settings from '../pages/Settings';

// Other Pages
import NotFound from '../pages/NotFound';

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* ✅ NEW: Root redirects to home page */}
        <Route path="/" element={<Home />} />

        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Onboarding Route (Protected but accessible to new users) */}
        <Route
          path="/onboarding"
          element={
            <ProtectedRoute>
              <Onboarding />
            </ProtectedRoute>
          }
        />

        {/* Assessment Test Route */}
        <Route
          path="/assessment-test"
          element={
            <ProtectedRoute>
              <AssessmentTest />
            </ProtectedRoute>
          }
        />

        {/* Protected Routes - Main App */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />

        {/* Admin Dashboard Route */}
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          }
        />

        {/* Feature Routes */}
        <Route
          path="/assessments"
          element={
            <ProtectedRoute>
              <Assessments />
            </ProtectedRoute>
          }
        />

        <Route
          path="/planner"
          element={
            <ProtectedRoute>
              <StudyPlanner />
            </ProtectedRoute>
          }
        />

        <Route
          path="/advisor-chat"
          element={
            <ProtectedRoute>
              <AdvisorChat />
            </ProtectedRoute>
          }
        />

        <Route
          path="/peer-chat"
          element={
            <ProtectedRoute>
              <PeerChat />
            </ProtectedRoute>
          }
        />

        <Route
          path="/courses"
          element={
            <ProtectedRoute>
              <Courses />
            </ProtectedRoute>
          }
        />

        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <Settings />
            </ProtectedRoute>
          }
        />

        {/* Catch-all Route - 404 Page */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;