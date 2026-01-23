import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import AppRoutes from './app/routes';

function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <AppRoutes />
      </SocketProvider>
    </AuthProvider>
  );
}

export default App;