import { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';
import { getToken } from '../utils/storage';

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    // Connect socket only when user is authenticated
    if (isAuthenticated) {
      const token = getToken();
      
      const newSocket = io('http://localhost:5000', {
        auth: {
          token: token,
        },
      });

      newSocket.on('connect', () => {
        console.log('Socket connected:', newSocket.id);
      });

      newSocket.on('disconnect', () => {
        console.log('Socket disconnected');
      });

      newSocket.on('connect_error', (error) => {
        console.error('Socket connection error:', error);
      });

      setSocket(newSocket);

      // Cleanup on unmount or when auth changes
      return () => {
        newSocket.close();
      };
    } else {
      // Disconnect socket when user logs out
      if (socket) {
        socket.close();
        setSocket(null);
      }
    }
  }, [isAuthenticated]);

  const value = {
    socket,
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};

// Custom hook to use socket context
export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within SocketProvider');
  }
  return context;
};