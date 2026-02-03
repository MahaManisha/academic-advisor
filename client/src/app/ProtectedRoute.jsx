import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading, user } = useAuth();
  const location = useLocation();

  // Show loader while checking authentication
  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      }}>
        <div style={{
          background: 'white',
          padding: '40px',
          borderRadius: '16px',
          textAlign: 'center',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)'
        }}>
          <div style={{
            width: '48px',
            height: '48px',
            border: '4px solid #f3f4f6',
            borderTopColor: '#667eea',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px'
          }}></div>
          <p style={{
            margin: 0,
            color: '#6b7280',
            fontSize: '16px',
            fontWeight: 600
          }}>
            Loading...
          </p>
          <style>{`
            @keyframes spin {
              to { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // ✅ CRITICAL: Prevent admin from accessing student routes (except allowed shared views)
  const isAdmin = user?.role === 'admin';
  // Admin can access: Admin Dashboard, Student Dashboard (View Mode), and Settings
  const adminAllowedPaths = ['/dashboard', '/settings'];

  if (isAdmin && !adminAllowedPaths.includes(location.pathname)) {
    // ✅ Admin should NEVER see student routes or onboarding
    return <Navigate to="/admin/dashboard" replace />;
  }

  // ✅ For STUDENTS: Check onboarding status
  const isOnboarded = user?.onboardingCompleted;
  const onboardingPaths = ['/onboarding', '/assessment-test'];
  const isTryingToAccessOnboarding = onboardingPaths.includes(location.pathname);

  // Case 1: Student NOT onboarded -> Must go to onboarding
  if (!isOnboarded && !isTryingToAccessOnboarding) {
    return <Navigate to="/onboarding" replace />;
  }

  // Case 2: Student ALREADY onboarded -> Must NOT go to onboarding
  if (isOnboarded && isTryingToAccessOnboarding) {
    return <Navigate to="/dashboard" replace />;
  }

  // ✅ All checks passed: render the component
  return children;
};

export default ProtectedRoute;