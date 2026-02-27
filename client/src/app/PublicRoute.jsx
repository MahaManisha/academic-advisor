import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const PublicRoute = ({ children }) => {
    const { isAuthenticated, loading, user } = useAuth();

    if (loading) {
        return null; // Or a spinner, but usually public routes load fast or auth check is fast
    }

    if (isAuthenticated) {
        if (user?.role === 'admin') {
            return <Navigate to="/admin/dashboard" replace />;
        }

        // Let verified students complete onboarding
        if (user?.emailVerified && !user?.onboardingCompleted) {
            return <Navigate to="/onboarding" replace />;
        }

        return <Navigate to="/dashboard" replace />;
    }

    return children;
};

export default PublicRoute;
