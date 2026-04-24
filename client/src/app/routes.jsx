import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import PublicRoute from './PublicRoute';
import AdminRoute from './AdminRoute';

// Public Pages
import PageAnnouncer from '../components/PageAnnouncer';
import Home from '../pages/Home';  // ✅ NEW
import Login from '../pages/Login';
import Register from '../pages/Register';
import VerifyEmail from '../pages/VerifyEmail';
import AcademicStatus from '../pages/AcademicStatus';
import AcademicDetails from '../pages/AcademicDetails';

// Onboarding & Assessment
import Onboarding from '../pages/Onboarding';
import AssessmentTest from '../pages/AssessmentTest';
import AssessmentIntro from '../pages/AssessmentIntro';

// Main Pages
import Dashboard from '../pages/Dashboard';
import Profile from '../pages/Profile';
import AdminDashboard from '../pages/AdminDashboard';
import AdminUsers from '../pages/AdminUsers';

// Feature Pages
import Assessments from '../pages/Assessments';
import StudyPlanner from '../pages/StudyPlanner';
import AdvisorChat from '../pages/AdvisorChat';
import PeerChat from '../pages/PeerChat';
import Courses from '../pages/Courses';
import MissionDetail from '../pages/MissionDetail';
import Settings from '../pages/Settings';
import AdminSettings from '../pages/AdminSettings';
import AdminStudentView from '../pages/AdminStudentView';
import AdminCourses from '../pages/AdminCourses';
import AdminOnboarding from '../pages/AdminOnboarding';
import Leaderboard from '../pages/Leaderboard';
import Guilds from '../pages/Guilds';
import Flashcards from '../pages/Flashcards';
import Arena from '../pages/Arena';
import CareerPath from '../pages/CareerPath';
import InterviewBot from '../pages/InterviewBot';

// Mentor Pages
import MentorSignup from '../pages/MentorSignup';
import MentorOnboarding from '../pages/MentorOnboarding';
import MentorDashboard from '../pages/MentorDashboard';
import MentorList from '../pages/MentorList';
import MentorRequests from '../pages/MentorRequests';
import MentorStudentsPage from '../pages/MentorStudentsPage';
import MentorChat from '../pages/MentorChat';
import MentorSessions from '../pages/MentorSessions';
import MentorSubPage from '../pages/MentorSubPage';
import { FaUsers, FaCalendarAlt, FaComment, FaChartLine } from 'react-icons/fa';

// Other Pages
import StudentSessions from '../pages/StudentSessions';
import NotFound from '../pages/NotFound';
import { useAuth } from '../context/AuthContext';

const DashboardSwitcher = () => {
  const { user } = useAuth();
  console.log("Rendering Dashboard for Role:", user?.role);
  return user?.role === 'mentor' ? <MentorDashboard /> : <Dashboard />;
};

const AppRoutes = () => {
  const { user } = useAuth();
  
  // Debug: Verify user role for dashboard routing
  console.log("AppRoutes Current User Role:", user?.role);

  return (
    <BrowserRouter>
      <PageAnnouncer />
      <Routes>
        {/* ✅ NEW: Root redirects to home page */}
        <Route path="/" element={<Home />} />

        {/* Public Routes - Auto-redirect if logged in */}
        <Route
          path="/login"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />
        <Route
          path="/register"
          element={
            <PublicRoute>
              <Register />
            </PublicRoute>
          }
        />

        {/* Verify Email Route */}
        <Route
          path="/verify-email"
          element={
            <PublicRoute>
              <VerifyEmail />
            </PublicRoute>
          }
        />

        {/* Step 3: Academic Status */}
        <Route
          path="/academic-status"
          element={
            <PublicRoute>
              <AcademicStatus />
            </PublicRoute>
          }
        />

        {/* Step 4: Academic Details (Completion) */}
        <Route
          path="/academic-details"
          element={
            <PublicRoute>
              <AcademicDetails />
            </PublicRoute>
          }
        />

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

        {/* Assessment Intro / Generator Page */}
        <Route
          path="/assessment-intro"
          element={
            <ProtectedRoute>
              <AssessmentIntro />
            </ProtectedRoute>
          }
        />


        {/* Protected Routes - Main App */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardSwitcher />
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
          path="/admin/dashboard"
          element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <AdminRoute>
              <AdminUsers />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/student-view"
          element={
            <AdminRoute>
              <AdminStudentView />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/courses"
          element={
            <AdminRoute>
              <AdminCourses />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/onboarding"
          element={
            <AdminRoute>
              <AdminOnboarding />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/settings"
          element={
            <AdminRoute>
              <AdminSettings />
            </AdminRoute>
          }
        />
        {/* Redirect /admin to /admin/dashboard */}
        <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />

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
          path="/sessions"
          element={
            <ProtectedRoute>
              <StudentSessions />
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
          path="/courses/:id"
          element={
            <ProtectedRoute>
              <MissionDetail />
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

        <Route
          path="/leaderboard"
          element={
            <ProtectedRoute>
              <Leaderboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/guilds"
          element={
            <ProtectedRoute>
              <Guilds />
            </ProtectedRoute>
          }
        />

        <Route
          path="/flashcards"
          element={
            <ProtectedRoute>
              <Flashcards />
            </ProtectedRoute>
          }
        />

        <Route
          path="/arena"
          element={
            <ProtectedRoute>
              <Arena />
            </ProtectedRoute>
          }
        />

        <Route
          path="/career"
          element={
            <ProtectedRoute>
              <CareerPath />
            </ProtectedRoute>
          }
        />

        <Route
          path="/interview"
          element={
            <ProtectedRoute>
              <InterviewBot />
            </ProtectedRoute>
          }
        />

        {/* Mentor Routes */}
        <Route
          path="/mentor-signup"
          element={
            <PublicRoute>
              <MentorSignup />
            </PublicRoute>
          }
        />
        <Route
          path="/mentor-onboarding"
          element={
            <ProtectedRoute>
              <MentorOnboarding />
            </ProtectedRoute>
          }
        />
        <Route
          path="/mentors"
          element={
            <ProtectedRoute>
              <MentorList />
            </ProtectedRoute>
          }
        />
        
        {/* Mentor Sub-pages */}
        <Route
          path="/mentor/requests"
          element={
            <ProtectedRoute>
              <MentorRequests />
            </ProtectedRoute>
          }
        />
        <Route
          path="/mentor/students"
          element={
            <ProtectedRoute>
              <MentorStudentsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/mentor/sessions"
          element={
            <ProtectedRoute>
              <MentorSessions />
            </ProtectedRoute>
          }
        />
        <Route
          path="/mentor/chat"
          element={
            <ProtectedRoute>
              <MentorChat />
            </ProtectedRoute>
          }
        />
        <Route
          path="/mentor/performance"
          element={
            <ProtectedRoute>
              <MentorSubPage title="Performance" subtitle="Your stats and feedback" icon={<FaChartLine />} />
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