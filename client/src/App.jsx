import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import { GamificationProvider } from './context/GamificationContext';
import { AccessibilityProvider } from './context/AccessibilityContext';
import { NotificationProvider } from './context/NotificationContext';
import { FocusProvider } from './context/FocusContext';
import GlobalGamification from './components/gamification/GlobalGamification';
import AppRoutes from './app/routes';
import './components/gamification/GamificationUI.css';

function App() {
  return (
    <AuthProvider>
      <AccessibilityProvider>
        <GamificationProvider>
          <FocusProvider>
            <SocketProvider>
              <NotificationProvider>
                <GlobalGamification />
                <AppRoutes />
              </NotificationProvider>
            </SocketProvider>
          </FocusProvider>
        </GamificationProvider>
      </AccessibilityProvider>
    </AuthProvider>
  );
}

export default App;