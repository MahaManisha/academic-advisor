// client/src/pages/Onboarding.jsx
import { Navigate } from 'react-router-dom';

/**
 * Onboarding Entry Point
 * Immediately redirects students to Mission 1: Academic Foundation
 * completely removing the old AI diagnostic assessment workflow.
 */
const Onboarding = () => {
  return <Navigate to="/career/mission-1" replace />;
};

export default Onboarding;